# WiselyRise Contact Form — Architecture & Working Structure

## Overview

The contact form lets visitors on any WiselyRise product page submit bug reports, feature requests, and feedback. Submissions are stored as **GitHub Issues** in the public repo. Attachments (images) are uploaded to the **repo as files** under `uploads/contact/`.

The form is protected by a **Firebase Cloud Function proxy** — the GitHub token never touches the browser or the public repo.

---

## End-to-End Flow

```
User fills form on wiselyrise.in
        │
        │ POST JSON (product, category, subject, desc, device, email, base64 images)
        ▼
Firebase Function (submitContactForm)
  — runs on Google Cloud, us-central1
  — reads GITHUB_PAT from .env (never public)
  — validates all inputs
  — uploads each image to: uploads/contact/{product}/{date_session}/{filename}
  — creates a GitHub Issue with title + markdown body + image links
        │
        ▼
GitHub Issues (wiselyrisesolutions/wiselyrise)
GitHub Repo (uploads/contact/…)
```

---

## File Structure

```
wiselyrise/                         ← GitHub Pages static site
│
├── shared/
│   └── contact-modal.js            ← Self-contained modal. Injected into every page.
│                                     NO secrets. Sends POST to FUNCTION_URL.
│
├── functions/                      ← Firebase Cloud Functions source
│   ├── index.js                    ← The actual proxy function (server-side)
│   ├── package.json                ← Dependencies (firebase-functions v4)
│   ├── package-lock.json           ← Lockfile (committed)
│   ├── .gitignore                  ← Ignores node_modules/ and .env
│   ├── .env                        ← LOCAL ONLY. Never committed. Contains GITHUB_PAT.
│   └── node_modules/               ← LOCAL ONLY. Installed via npm install.
│
├── .firebaserc                     ← Firebase project: wiselyrise-web
├── firebase.json                   ← Firebase config: functions source = functions/
│
├── uploads/
│   └── contact/                    ← Image attachments land here after submission
│       └── {product}/{date_session}/{filename}
│
├── index.html                      ← WiselyRise homepage
│   └── loads /shared/contact-modal.js
│
└── datewise/
    └── index.html                  ← DateWise landing page
        └── loads /shared/contact-modal.js, calls openContactModal('datewise')
```

---

## Key Files Explained

### `shared/contact-modal.js`
- Single file shared across all product pages
- Self-injects CSS and modal HTML into `document.body` at runtime
- Exposes two globals: `openContactModal(presetProduct?)` and `closeContactModal()`
- Add to any page: `<script src="/shared/contact-modal.js"></script>`
- Pre-select a product: `openContactModal('datewise')`
- On submit: converts images to base64, POSTs everything to `FUNCTION_URL`
- **Contains no secrets** — safe to be in a public repo

### `functions/index.js`
- Firebase Cloud Function v2 (`onRequest`) running on Node.js 20, us-central1
- Reads `GITHUB_PAT` from `process.env` (loaded from `.env` at deploy time)
- CORS restricted to `wiselyrise.in` and `www.wiselyrise.in` only
- Validates: product allowlist, category allowlist, subject length, description length, file count (max 3), file size (max 3 MB), file type (jpeg/png/webp/gif)
- Uploads each image to GitHub Contents API → `uploads/contact/{product}/{session}/{file}`
- Creates GitHub Issue with full markdown body including embedded image links

### `functions/.env`
```
GITHUB_PAT=github_pat_11B44VFRY0...
```
- Lives only on the developer's machine
- Gitignored — never committed to the repo
- Must be present when running `firebase deploy`
- If lost: generate a new fine-grained PAT on GitHub with `repo` scope → update `.env` → redeploy

---

## Live Endpoints

| Item | Value |
|------|-------|
| Firebase Project | `wiselyrise-web` |
| Firebase Console | https://console.firebase.google.com/project/wiselyrise-web/overview |
| Function URL | `https://submitcontactform-c6cct7lpba-uc.a.run.app` |
| GitHub Issues | https://github.com/wiselyrisesolutions/wiselyrise/issues |
| Uploads folder | `wiselyrisesolutions/wiselyrise` → `uploads/contact/` |

---

## Adding the Form to a New Product Page

```html
<!-- 1. Add before </body> -->
<script src="/shared/contact-modal.js"></script>

<!-- 2. Trigger from any button/link -->
<button onclick="openContactModal('pixwise')">Feedback</button>
```

Valid product values: `datewise` · `pixwise` · `gramwise` · `docuwise` · `other`

---

## Redeployment

Run from `D:\WiselyRise\repo\wiselyrise\`:

```powershell
firebase deploy --only functions
```

Requirements before deploying:
- `functions/.env` must exist with a valid `GITHUB_PAT`
- `node_modules/` must be installed: `npm install --prefix functions`
- Firebase CLI logged in: `firebase login`
- Correct project active: `firebase use wiselyrise-web`

---

## Rotating the GitHub Token

1. Go to https://github.com/settings/tokens → revoke old token
2. Create new fine-grained PAT with **Contents (read/write)** and **Issues (read/write)** on the `wiselyrisesolutions/wiselyrise` repo
3. Update `functions/.env`: `GITHUB_PAT=github_pat_...new...`
4. Run `firebase deploy --only functions`
5. No frontend changes needed — the token is server-side only

---

## Why This Architecture

| Concern | Solution |
|---------|----------|
| Token exposure | Function proxy — token only in `.env`, never in browser |
| Spam / abuse | CORS origin lock + server-side input validation |
| Infrastructure cost | Firebase Blaze free tier (well under limits for a contact form) |
| Multi-page reuse | Single `shared/contact-modal.js` with `openContactModal(preset)` |
| Data storage | GitHub Issues (searchable, labelable, free) + repo files for images |
