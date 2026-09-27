const { onRequest } = require('firebase-functions/v2/https');
const nodemailer    = require('nodemailer');

/* ── Config ──────────────────────────────────────────────────────────── */
const REPO = 'wiselyrisesolutions/wiselyrise';

const ALLOWED_ORIGINS = [
  'https://wiselyrise.in',
  'https://www.wiselyrise.in',
  'http://localhost',
  'http://127.0.0.1',
];

/* ── All valid products & categories from the adaptive form ────────── */
const VALID_PRODUCTS = [
  'custom-software', 'healthcheck', 'app-rescue',
  'datewise', 'pixwise', 'gramwise', 'keywise',
  'kuralwise', 'docuwise', 'clinicwise', 'website', 'other'
];
const VALID_CATEGORIES = [
  'project', 'healthcheck', 'bug', 'feature', 'improvement', 'general'
];

const PROD_LABELS = {
  'custom-software': '🛠 Custom Software',
  'healthcheck':     '🩺 App Health Check',
  'app-rescue':      '🚑 App Rescue',
  'datewise':        '📅 DateWise',
  'pixwise':         '🖼 PixWise',
  'gramwise':        '📖 GramWise',
  'keywise':         '🔑 KeyWise',
  'kuralwise':       '📜 KuralWise',
  'docuwise':        '📄 DocuWise',
  'clinicwise':      '🏥 ClinicWise',
  'website':         '🌐 Website',
  'other':           '💡 Other'
};
const CAT_LABELS = {
  'project':     '🚀 New Project Inquiry',
  'healthcheck': '🩺 App Health Check',
  'bug':         '🐛 Bug Report',
  'feature':     '✨ Feature Request',
  'improvement': '🔧 Improvement',
  'general':     '💬 General Feedback'
};

/* ── CORS helper ─────────────────────────────────────────────────────── */
function setCors(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

/* ── Mailer factory — Gmail SMTP relay ─────────────────────────────── */
function createTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASS
    }
  });
}

exports.submitContactForm = onRequest(
  { invoker: 'public', timeoutSeconds: 60, memory: '256MiB' },
  async (req, res) => {
    setCors(req, res);

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST')    { res.status(405).json({ error: 'Method not allowed' }); return; }

    const githubPat = process.env.GITHUB_PAT;
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS;

    if (!githubPat || !gmailUser || !gmailPass) {
      res.status(500).json({ error: 'Server misconfigured — missing credentials' });
      return;
    }

    /* ── Parse body ────────────────────────────────────────────────── */
    const {
      product, category, subject, desc,
      device, email, files,
      // Project-specific
      projectType, budget, timeline,
      // Health check-specific
      platform, package: pkg, appUrl, concerns,
      // Improvement-specific
      area
    } = req.body || {};

    /* ── Basic validation ──────────────────────────────────────────── */
    if (!category) {
      res.status(400).json({ error: 'Missing category' }); return;
    }
    if (!VALID_CATEGORIES.includes(category)) {
      res.status(400).json({ error: 'Invalid category' }); return;
    }

    const safeProduct = (VALID_PRODUCTS.includes(product) ? product : 'other');
    const safeDesc = typeof desc === 'string' ? desc.trim().slice(0, 5000) : '';
    const safeSubject = typeof subject === 'string' ? subject.trim().slice(0, 120) : '';
    const safeDevice  = typeof device  === 'string' ? device.trim().slice(0, 120)  : '';
    const safeEmail   = typeof email   === 'string' ? email.trim().slice(0, 120)   : '';

    if (!safeDesc && !safeSubject) {
      res.status(400).json({ error: 'Submission is empty' }); return;
    }

    /* ── Upload attachments to GitHub ──────────────────────────────── */
    const session       = new Date().toISOString().slice(0, 10) + '_' + Math.random().toString(36).slice(2, 8);
    const MAX_B64_LEN   = Math.ceil(3 * 1024 * 1024 * 4 / 3);
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    let imgMarkdown = '';
    let imgHtml     = '';
    const filesToProcess = Array.isArray(files) ? files.slice(0, 3) : [];

    for (let i = 0; i < filesToProcess.length; i++) {
      const f = filesToProcess[i];
      if (!f || !f.content || typeof f.content !== 'string') continue;
      if (f.content.length > MAX_B64_LEN) continue;
      if (f.type && !ALLOWED_TYPES.includes(f.type)) continue;

      const safe = String(f.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
      const ghPath = `uploads/contact/${safeProduct}/${session}/${safe}`;

      try {
        const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${ghPath}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${githubPat}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Contact form attachment', content: f.content }),
        });
        if (r.ok) {
          const rawUrl = `https://raw.githubusercontent.com/${REPO}/main/${ghPath}`;
          imgMarkdown += `\n![${safe}](${rawUrl})\n`;
          imgHtml     += `<br><img src="${rawUrl}" alt="${safe}" style="max-width:380px;border-radius:8px;margin-top:10px"><br>`;
        }
      } catch (_) {}
    }

    /* ── Build email body ──────────────────────────────────────────── */
    const productLabel  = PROD_LABELS[safeProduct] || safeProduct;
    const categoryLabel = CAT_LABELS[category]     || category;
    const emailTitle    = `[WiselyRise] ${categoryLabel} — ${safeSubject || productLabel}`;

    // Extra fields per category
    const extraRows = [];
    if (projectType)  extraRows.push({ label: 'Project Type',  value: projectType });
    if (budget)       extraRows.push({ label: 'Budget',         value: budget });
    if (timeline)     extraRows.push({ label: 'Timeline',       value: timeline });
    if (platform)     extraRows.push({ label: 'Platform',       value: platform });
    if (pkg)          extraRows.push({ label: 'Package',        value: pkg });
    if (appUrl)       extraRows.push({ label: 'App Store URL',  value: appUrl });
    if (concerns)     extraRows.push({ label: 'Main Concern',   value: concerns });
    if (area)         extraRows.push({ label: 'Area',           value: area });

    function row(label, value) {
      if (!value) return '';
      return `<tr><td style="padding:6px 14px 6px 0;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 0;color:#111;font-size:14px">${value}</td></tr>`;
    }

    const extraHtml = extraRows.map(r => row(r.label, r.value)).join('');

    const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#5b21b6,#7c3aed);padding:28px 32px">
    <div style="color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;opacity:.75;margin-bottom:6px">WiselyRise Contact Form</div>
    <div style="color:#fff;font-size:20px;font-weight:800;line-height:1.3">${categoryLabel}</div>
    <div style="color:rgba(255,255,255,.75);font-size:13px;margin-top:4px">${productLabel}</div>
  </td></tr>

  <!-- Meta table -->
  <tr><td style="padding:24px 32px 0">
    <table cellpadding="0" cellspacing="0" width="100%">
      ${row('Category',   categoryLabel)}
      ${row('Product',    productLabel)}
      ${safeSubject ? row('Subject', safeSubject) : ''}
      ${extraHtml}
      ${safeDevice  ? row('Device / Name',  safeDevice)  : ''}
      ${safeEmail   ? row('Contact Email',  `<a href="mailto:${safeEmail}" style="color:#7c3aed">${safeEmail}</a>`) : ''}
    </table>
  </td></tr>

  <!-- Description -->
  <tr><td style="padding:20px 32px">
    <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:10px">
      ${category === 'bug' ? 'Steps to Reproduce' : category === 'feature' ? 'Feature Details' : category === 'project' ? 'Project Description' : 'Details'}
    </div>
    <div style="background:#f8f8fc;border-left:3px solid #7c3aed;border-radius:0 8px 8px 0;padding:16px;font-size:14px;color:#1f2937;line-height:1.75;white-space:pre-wrap">${safeDesc.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    ${imgHtml}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:16px 32px 28px;border-top:1px solid #f0f0f4">
    <div style="font-size:11px;color:#9ca3af">Submitted via <a href="https://wiselyrise.in" style="color:#7c3aed">wiselyrise.in</a> · ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</div>
    ${safeEmail ? `<div style="margin-top:8px"><a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(emailTitle)}" style="display:inline-block;background:#7c3aed;color:#fff;padding:9px 20px;border-radius:100px;font-size:12px;font-weight:700;text-decoration:none;margin-top:4px">↩ Reply to ${safeEmail}</a></div>` : ''}
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

    /* ── Plain text fallback ────────────────────────────────────────── */
    const text = [
      `[WiselyRise Contact Form]`,
      `Category : ${categoryLabel}`,
      `Product  : ${productLabel}`,
      safeSubject ? `Subject  : ${safeSubject}` : null,
      ...extraRows.map(r => `${r.label.padEnd(12)}: ${r.value}`),
      safeDevice  ? `Device   : ${safeDevice}`  : null,
      safeEmail   ? `Email    : ${safeEmail}`    : null,
      '',
      safeDesc,
      '',
      `Submitted: ${new Date().toISOString()}`
    ].filter(l => l !== null).join('\n');

    /* ── Send email ────────────────────────────────────────────────── */
    const mailOptions = {
      from:    `"WiselyRise Contact" <${gmailUser}>`,
      to:      'contact@wiselyrise.in',
      replyTo: safeEmail || gmailUser,
      subject: emailTitle,
      text,
      html
    };

    // Send to submitter too if they gave email (confirmation)
    const confirmOptions = safeEmail ? {
      from:    `"WiselyRise" <${gmailUser}>`,
      to:      safeEmail,
      replyTo: 'contact@wiselyrise.in',
      subject: `We received your message — ${categoryLabel}`,
      text:    `Hi,\n\nThank you for reaching out to WiselyRise!\n\nWe received your ${categoryLabel.toLowerCase()} and will get back to you soon.\n\nCategory : ${categoryLabel}\nProduct  : ${productLabel}\n${safeSubject ? 'Subject  : ' + safeSubject : ''}\n\nIf this is a project inquiry, expect a response within 24 hours.\n\n— WiselyRise Team\nhttps://wiselyrise.in`,
      html:    `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
        <div style="font-size:22px;font-weight:800;color:#5b21b6;margin-bottom:8px">✓ Message received!</div>
        <p style="color:#374151">Thanks for reaching out. We received your <strong>${categoryLabel.toLowerCase()}</strong> for <strong>${productLabel}</strong>.</p>
        ${category === 'project' || category === 'healthcheck' ? '<p style="color:#374151">We\'ll review and get back to you <strong>within 24 hours</strong>.</p>' : '<p style="color:#374151">Our team will review it and follow up if needed.</p>'}
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">— WiselyRise Team · <a href="https://wiselyrise.in" style="color:#7c3aed">wiselyrise.in</a></p>
      </div>`
    } : null;

    try {
      const transporter = createTransport();
      await transporter.sendMail(mailOptions);
      if (confirmOptions) {
        await transporter.sendMail(confirmOptions).catch(() => {}); // non-fatal
      }
    } catch (mailErr) {
      console.error('Email send failed:', mailErr.message);
      // Don't fail the whole request over email — fall through to GitHub Issue
    }

    /* ── Also create GitHub Issue (audit trail) ────────────────────── */
    const issueTitle = `[${productLabel}][${categoryLabel}] ${safeSubject || category}`;
    const issueBody  = [
      `## ${categoryLabel} — ${productLabel}`, '',
      safeSubject ? `**Subject:** ${safeSubject}` : null, '',
      ...extraRows.map(r => `**${r.label}:** ${r.value}`),
      safeDevice  ? `**Device / Name:** ${safeDevice}` : null,
      safeEmail   ? `**Contact:** ${safeEmail}`         : null,
      '', '**Details:**', safeDesc,
      imgMarkdown ? `\n---\n### Attachments\n${imgMarkdown}` : null,
      '---', '*Submitted via wiselyrise.in*'
    ].filter(l => l !== null).join('\n');

    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${githubPat}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: issueTitle, body: issueBody }),
      });
      if (!r.ok) console.error('GitHub issue creation failed:', r.status);
    } catch (ghErr) {
      console.error('GitHub issue error:', ghErr.message);
    }

    res.status(200).json({ success: true });
  }
);
