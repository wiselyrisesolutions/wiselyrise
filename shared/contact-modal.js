/* ── WiselyRise Contact Modal — Adaptive / Contextual ─────────────────
 * Usage:
 *   <script src="/shared/contact-modal.js"></script>
 *   <button onclick="openContactModal('custom-software')">Start a Project</button>
 *   <button onclick="openContactModal('healthcheck')">App Health Check</button>
 *   <button onclick="openContactModal('datewise')">Feedback</button>
 * ─────────────────────────────────────────────────────────────────── */
(function () {
  const FUNCTION_URL = 'https://submitcontactform-c6cct7lpba-uc.a.run.app';
  const MAX = 3, MAXSZ = 3 * 1024 * 1024;

  /* ─── Category definitions ─────────────────────────────────────────
   * Each category drives:
   *   header title + subtitle
   *   the dynamic fields rendered inside #cmDynamic
   *   submit button label
   *   success message
   *   which product value to pre-select (optional)
   * ─────────────────────────────────────────────────────────────────── */
  const CATEGORIES = {
    project: {
      title: 'Start a Project',
      sub: 'Tell us about your idea. We\'ll get back within 24 hours.',
      submitLabel: 'Send Inquiry',
      successMsg: 'We received your inquiry and will reach out within 24 hours.',
      product: 'custom-software',
      fields: () => `
        <div class="cm-field">
          <label class="cm-label" for="cmProjectType">Type of Project <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmProjectType" required>
            <option value="">Select type…</option>
            <option value="mobile-app">📱 Mobile App (Android / iOS)</option>
            <option value="web-portal">🌐 Web Portal / Dashboard</option>
            <option value="business-tool">🏢 Internal Business Tool</option>
            <option value="mvp">🚀 MVP / Startup Product</option>
            <option value="existing-rebuild">♻️ Rebuild / Redesign Existing App</option>
            <option value="other">💡 Other / Not Sure Yet</option>
          </select>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmBudget">Budget Range <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmBudget" required>
              <option value="">Select range…</option>
              <option value="under-50k">Under ₹50,000</option>
              <option value="50k-2l">₹50,000 – ₹2,00,000</option>
              <option value="2l-5l">₹2L – ₹5L</option>
              <option value="5l-plus">₹5L+</option>
              <option value="discuss">Let's discuss</option>
            </select>
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmTimeline">Timeline <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmTimeline" required>
              <option value="">Select timeline…</option>
              <option value="asap">ASAP</option>
              <option value="1-3m">1–3 months</option>
              <option value="3-6m">3–6 months</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Describe Your Idea <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="What problem does it solve? Who are the users? Any key features in mind?" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Company / Your Name <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. Acme Corp or Ravi Kumar" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-req">*</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up" maxlength="120" required />
          </div>
        </div>`
    },

    healthcheck: {
      title: 'Book an App Health Check',
      sub: 'Full quality & crash report for your app — from ₹2,999.',
      submitLabel: 'Book Health Check',
      successMsg: 'Booking received! We\'ll confirm your Health Check slot within 24 hours.',
      product: 'healthcheck',
      fields: () => `
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmPlatform">Platform <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmPlatform" required>
              <option value="">Select platform…</option>
              <option value="android">Android</option>
              <option value="ios">iOS</option>
              <option value="both">Both (Android + iOS)</option>
              <option value="web">Web App</option>
            </select>
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmPackage">Package <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmPackage" required>
              <option value="">Select package…</option>
              <option value="single-2999">Single Platform — ₹2,999</option>
              <option value="dual-4999">Dual Platform — ₹4,999</option>
              <option value="discuss">Not sure, let's discuss</option>
            </select>
          </div>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmAppUrl">App Store / Play Store URL <span class="cm-opt">(optional)</span></label>
          <input type="url" class="cm-input" id="cmAppUrl" placeholder="https://play.google.com/store/apps/details?id=…" maxlength="300" />
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmConcerns">Main Concerns <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmConcerns" required>
            <option value="">Select primary concern…</option>
            <option value="crashes">Crashes / ANRs</option>
            <option value="performance">Performance / Speed</option>
            <option value="ux">UX / Usability</option>
            <option value="security">Data & Security</option>
            <option value="playstore">Play Store / App Store Rating</option>
            <option value="all">Full Audit — All of the above</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Additional Notes <span class="cm-opt">(optional)</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="Any specific issues you've noticed, user complaints, or context that would help…" maxlength="2000" style="min-height:80px"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">App / Company Name <span class="cm-req">*</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. My Startup App" maxlength="100" required />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-req">*</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For confirmation" maxlength="120" required />
          </div>
        </div>`
    },

    bug: {
      title: 'Bug Report',
      sub: 'Help us fix it fast — the more detail, the better.',
      submitLabel: 'Send Bug Report',
      successMsg: 'Bug report received! Our team will investigate and follow up.',
      fields: () => `
        <div class="cm-field">
          <label class="cm-label" for="cmProduct">Which App / Product? <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmProduct" required>
            <option value="">Select app…</option>
            <option value="datewise">DateWise</option>
            <option value="gramwise">GramWise</option>
            <option value="keywise">KeyWise</option>
            <option value="pixwise">PixWise</option>
            <option value="kuralwise">KuralWise</option>
            <option value="docuwise">DocuWise</option>
            <option value="clinicwise">ClinicWise</option>
            <option value="other">Other / Website</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmSubject">Bug Summary <span class="cm-req">*</span></label>
          <input type="text" class="cm-input" id="cmSubject" placeholder="e.g. App crashes when adding a reminder" required maxlength="100" />
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Steps to Reproduce <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="1. Open the app&#10;2. Tap on +&#10;3. Fill in…&#10;4. App crashes" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Device / OS <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. Redmi Note 12 · Android 14" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-opt">(optional)</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up" maxlength="120" />
          </div>
        </div>
        <div class="cm-attach-area"></div>`
    },

    feature: {
      title: 'Feature Request',
      sub: 'Share your idea — we read every one.',
      submitLabel: 'Submit Feature Request',
      successMsg: 'Feature request received! We\'ll review and add it to our roadmap consideration.',
      fields: () => `
        <div class="cm-field">
          <label class="cm-label" for="cmProduct">Which App? <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmProduct" required>
            <option value="">Select app…</option>
            <option value="datewise">DateWise</option>
            <option value="gramwise">GramWise</option>
            <option value="keywise">KeyWise</option>
            <option value="pixwise">PixWise</option>
            <option value="kuralwise">KuralWise</option>
            <option value="docuwise">DocuWise</option>
            <option value="clinicwise">ClinicWise</option>
            <option value="other">Other / Website</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmSubject">Feature in One Line <span class="cm-req">*</span></label>
          <input type="text" class="cm-input" id="cmSubject" placeholder="e.g. Add recurring reminder support" required maxlength="100" />
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Why Is This Useful? <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="Describe the use case — when would you use this, who would benefit, any existing workarounds?" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Your Name <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. Arun" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-opt">(optional)</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up" maxlength="120" />
          </div>
        </div>`
    },

    improvement: {
      title: 'Improvement Suggestion',
      sub: 'Tell us what could work better.',
      submitLabel: 'Send Suggestion',
      successMsg: 'Improvement suggestion received! We appreciate your input.',
      fields: () => `
        <div class="cm-field">
          <label class="cm-label" for="cmProduct">Which App? <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmProduct" required>
            <option value="">Select app…</option>
            <option value="datewise">DateWise</option>
            <option value="gramwise">GramWise</option>
            <option value="keywise">KeyWise</option>
            <option value="pixwise">PixWise</option>
            <option value="kuralwise">KuralWise</option>
            <option value="docuwise">DocuWise</option>
            <option value="clinicwise">ClinicWise</option>
            <option value="website">Website</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmArea">Area of Improvement <span class="cm-req">*</span></label>
          <select class="cm-input cm-select" id="cmArea" required>
            <option value="">Select area…</option>
            <option value="ui">UI / Visual Design</option>
            <option value="ux">UX / Ease of Use</option>
            <option value="performance">Performance / Speed</option>
            <option value="notifications">Notifications</option>
            <option value="onboarding">Onboarding / First Use</option>
            <option value="content">Content / Copy</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">What Needs Improvement? <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="Describe what bothers you now and how it could be better…" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Device / OS <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. iPhone 14 · iOS 17" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-opt">(optional)</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up" maxlength="120" />
          </div>
        </div>`
    },

    general: {
      title: 'Get in Touch',
      sub: 'Share a thought, ask a question, or just say hello.',
      submitLabel: 'Send Message',
      successMsg: 'Message received! We\'ll get back to you soon.',
      fields: () => `
        <div class="cm-field">
          <label class="cm-label" for="cmProduct">Regarding <span class="cm-opt">(optional)</span></label>
          <select class="cm-input cm-select" id="cmProduct">
            <option value="">Select…</option>
            <option value="custom-software">Custom Software / Services</option>
            <option value="datewise">DateWise</option>
            <option value="gramwise">GramWise</option>
            <option value="keywise">KeyWise</option>
            <option value="pixwise">PixWise</option>
            <option value="kuralwise">KuralWise</option>
            <option value="docuwise">DocuWise</option>
            <option value="clinicwise">ClinicWise</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmSubject">Subject <span class="cm-req">*</span></label>
          <input type="text" class="cm-input" id="cmSubject" placeholder="What's on your mind?" required maxlength="100" />
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Message <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="Go ahead…" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Your Name <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. Suresh" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-opt">(optional)</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up" maxlength="120" />
          </div>
        </div>`
    }
  };

  /* ── Pre-select → category mapping ──────────────────────────────── */
  const PRESELECT_MAP = {
    'custom-software': { category: 'project' },
    'healthcheck':     { category: 'healthcheck' },
    'app-rescue':      {
      category: 'project',
      overrideTitle: 'App Rescue Inquiry',
      overrideSub: 'Tell us about the issues your app is facing. We\'ll review and respond quickly.',
      overrideProduct: 'app-rescue'
    },
    'datewise':   { category: 'bug', product: 'datewise' },
    'gramwise':   { category: 'bug', product: 'gramwise' },
    'keywise':    { category: 'bug', product: 'keywise' },
    'pixwise':    { category: 'bug', product: 'pixwise' },
    'kuralwise':  { category: 'bug', product: 'kuralwise' },
    'docuwise':   { category: 'bug', product: 'docuwise' },
    'clinicwise': { category: 'project', overrideTitle: 'ClinicWise Enquiry', overrideSub: 'Request a walkthrough, pilot access, or share feedback.', overrideProduct: 'clinicwise' }
  };

  /* ── Inject CSS ───────────────────────────────────────────────────── */
  const CSS = `
  .cm-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:16px}
  .cm-overlay.open{display:flex}
  @keyframes cmSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  .cm-box{background:#fff;border-radius:22px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.22);animation:cmSlideUp .32s cubic-bezier(.22,1,.36,1) both;font-family:'DM Sans','Inter',system-ui,-apple-system,sans-serif}
  .cm-header{display:flex;align-items:flex-start;justify-content:space-between;padding:26px 26px 18px;border-bottom:1px solid #f0f0f2;position:sticky;top:0;background:#fff;z-index:2;border-radius:22px 22px 0 0}
  .cm-title{font-size:1.18rem;font-weight:800;letter-spacing:-.03em;margin-bottom:3px;color:#0f0f0f;transition:color .2s}
  .cm-sub{font-size:.8rem;color:#6b7280;line-height:1.5;max-width:420px}
  .cm-close{width:32px;height:32px;border-radius:50%;background:#f0f0f2;color:#6b7280;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.8rem;transition:background .18s,color .18s;flex-shrink:0;margin-top:2px}
  .cm-close:hover{background:#e2e2e5;color:#111}

  /* Category picker */
  .cm-cat-picker{display:flex;gap:8px;flex-wrap:wrap;padding:16px 26px 0}
  .cm-cat-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:100px;border:1.5px solid #e8e8ea;background:#fafafa;color:#4b5563;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .18s;white-space:nowrap;font-family:inherit}
  .cm-cat-btn:hover{border-color:#a78bfa;background:#f5f3ff;color:#6d28d9}
  .cm-cat-btn.active{border-color:#7c3aed;background:#7c3aed;color:#fff}
  .cm-cat-label{display:block;padding:14px 26px 6px;font-size:.72rem;font-weight:700;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase}

  /* Dynamic field area */
  .cm-form{padding:6px 26px 26px}
  @keyframes cmFieldsIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  .cm-dynamic{animation:cmFieldsIn .25s cubic-bezier(.22,1,.36,1) both}
  .cm-row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .cm-field{display:flex;flex-direction:column;gap:6px;margin-bottom:14px}
  .cm-label{font-size:.78rem;font-weight:700;color:#374151}
  .cm-req{color:#7c3aed}
  .cm-opt{font-weight:400;color:#9ca3af;font-size:.73rem}
  .cm-input{padding:10px 14px;border:1.5px solid #e8e8ea;border-radius:10px;font-family:inherit;font-size:.87rem;color:#0f0f0f;background:#fff;transition:border-color .18s,box-shadow .18s;outline:none;width:100%;box-sizing:border-box}
  .cm-input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
  .cm-textarea{resize:vertical;min-height:110px;line-height:1.6}
  .cm-select{cursor:pointer}

  /* Attachments */
  .cm-attach-section{margin-top:2px;margin-bottom:14px}
  .cm-drop{border:2px dashed #e8e8ea;border-radius:12px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:5px;cursor:pointer;transition:border-color .2s,background .2s;color:#9ca3af;font-size:.82rem;text-align:center}
  .cm-drop:hover,.cm-drop.drag{border-color:#a78bfa;background:#f5f3ff;color:#6d28d9}
  .cm-drop svg{pointer-events:none;margin-bottom:2px}
  .cm-drop-btn{background:none;border:none;color:#7c3aed;font-weight:700;cursor:pointer;font-size:inherit;padding:0;text-decoration:underline}
  .cm-drop-hint{font-size:.72rem;color:#d1d5db}
  .cm-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  .cm-thumb{position:relative;width:68px;text-align:center}
  .cm-thumb img{width:68px;height:68px;object-fit:cover;border-radius:8px;border:1px solid #e8e8ea}
  .cm-thumb-remove{position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#ef4444;color:#fff;border:none;cursor:pointer;font-size:.56rem;display:flex;align-items:center;justify-content:center}
  .cm-thumb-name{display:block;font-size:.62rem;color:#9ca3af;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

  /* Actions */
  .cm-actions{display:flex;align-items:center;gap:12px;padding-top:4px}
  .cm-status{font-size:.78rem;flex:1;line-height:1.45}
  .cm-status--error{color:#ef4444}
  .cm-status--loading{color:#7c3aed}
  .cm-submit{background:#5b21b6;color:#fff;padding:11px 28px;border-radius:100px;font-size:.87rem;font-weight:700;border:none;cursor:pointer;transition:background .2s,transform .15s;white-space:nowrap;font-family:inherit}
  .cm-submit:hover:not(:disabled){background:#7c3aed;transform:translateY(-1px)}
  .cm-submit:disabled{opacity:.55;cursor:not-allowed}

  /* Success */
  .cm-success{display:none;flex-direction:column;align-items:center;text-align:center;padding:48px 28px;gap:14px}
  .cm-success-icon{width:56px;height:56px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:700}
  .cm-success h3{font-size:1.15rem;font-weight:800;letter-spacing:-.02em;color:#0f0f0f}
  .cm-success p{font-size:.86rem;color:#6b7280;max-width:320px;line-height:1.65}

  @media(max-width:540px){
    .cm-box{border-radius:18px;max-height:96vh}
    .cm-row-2{grid-template-columns:1fr}
    .cm-form{padding:6px 16px 20px}
    .cm-header{padding:18px 16px;border-radius:18px 18px 0 0}
    .cm-cat-picker{padding:12px 16px 0}
    .cm-cat-label{padding:12px 16px 4px}
  }`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Inject Shell HTML (static parts only) ─────────────────────── */
  document.body.insertAdjacentHTML('beforeend', `
  <div id="contactModal" class="cm-overlay" role="dialog" aria-modal="true" aria-label="Contact WiselyRise">
    <div class="cm-box">
      <div class="cm-header">
        <div>
          <div class="cm-title" id="cmTitle">Get in Touch</div>
          <div class="cm-sub" id="cmSub">Choose a topic below to get started</div>
        </div>
        <button class="cm-close" id="cmClose" aria-label="Close">✕</button>
      </div>

      <!-- Category pill picker -->
      <span class="cm-cat-label">What can we help with?</span>
      <div class="cm-cat-picker" id="cmCatPicker">
        <button class="cm-cat-btn" data-cat="project"     type="button">🚀 New Project</button>
        <button class="cm-cat-btn" data-cat="healthcheck" type="button">🩺 Health Check</button>
        <button class="cm-cat-btn" data-cat="bug"         type="button">🐛 Bug Report</button>
        <button class="cm-cat-btn" data-cat="feature"     type="button">✨ Feature Request</button>
        <button class="cm-cat-btn" data-cat="improvement" type="button">🔧 Improvement</button>
        <button class="cm-cat-btn" data-cat="general"     type="button">💬 General</button>
      </div>

      <!-- Dynamic form area -->
      <form class="cm-form" id="cmForm" novalidate>
        <input type="text" name="_trap" style="opacity:0;position:absolute;left:-9999px" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div id="cmDynamic"></div>
        <!-- Attachment area always present (shown/hidden by renderCategory) -->
        <div class="cm-attach-section" id="cmAttachSection" style="display:none">
          <label class="cm-label" style="margin-bottom:8px;display:block">Attachments <span class="cm-opt">(up to 3 images · max 3 MB each)</span></label>
          <div class="cm-drop" id="cmDrop">
            <input type="file" id="cmFiles" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="display:none" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Drop images here or <button type="button" class="cm-drop-btn" id="cmPickFiles">browse</button></span>
            <span class="cm-drop-hint">JPG · PNG · WebP · GIF</span>
          </div>
          <div class="cm-thumbs" id="cmThumbs"></div>
        </div>
        <div class="cm-actions" id="cmActions" style="display:none">
          <div class="cm-status" id="cmStatus"></div>
          <button type="submit" class="cm-submit" id="cmSubmit">Send</button>
        </div>
      </form>

      <div class="cm-success" id="cmSuccess">
        <div class="cm-success-icon">✓</div>
        <h3>Sent!</h3>
        <p id="cmSuccessMsg">We received your message and will get back to you soon.</p>
        <button class="cm-submit" id="cmSuccessClose">Close</button>
      </div>
    </div>
  </div>`);

  /* ── State ────────────────────────────────────────────────────────── */
  let files = [];
  let currentCat = null;
  let overrideProduct = null;

  /* ── Render a category's fields ───────────────────────────────────── */
  function renderCategory(cat) {
    const def = CATEGORIES[cat];
    if (!def) return;
    currentCat = cat;

    // Update header
    document.getElementById('cmTitle').textContent = def.title;
    document.getElementById('cmSub').textContent   = def.sub;

    // Update pill active state
    document.querySelectorAll('.cm-cat-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.cat === cat);
    });

    // Inject dynamic fields (triggers CSS animation)
    const dyn = document.getElementById('cmDynamic');
    dyn.innerHTML = `<div class="cm-dynamic">${def.fields()}</div>`;

    // If there's a preselected product to inject into the product dropdown
    if (overrideProduct) {
      const prodSel = document.getElementById('cmProduct');
      if (prodSel) prodSel.value = overrideProduct;
    }

    // Show attachments for bug reports
    const attachSection = document.getElementById('cmAttachSection');
    attachSection.style.display = (cat === 'bug') ? '' : 'none';

    // Show actions bar
    document.getElementById('cmActions').style.display = 'flex';
    document.getElementById('cmSubmit').textContent = def.submitLabel;

    // Reset file state
    files = [];
    document.getElementById('cmThumbs').innerHTML = '';
    setStatus('', '');

    // Scroll form into view
    setTimeout(() => { document.getElementById('cmDynamic').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
  }

  /* ── Public API ───────────────────────────────────────────────────── */
  window.openContactModal = function (preselect) {
    const modal = document.getElementById('contactModal');

    // Reset state
    currentCat = null;
    overrideProduct = null;
    document.getElementById('cmDynamic').innerHTML = '';
    document.getElementById('cmActions').style.display = 'none';
    document.getElementById('cmAttachSection').style.display = 'none';
    document.getElementById('cmSuccess').style.display = 'none';
    document.getElementById('cmForm').style.display = '';
    document.getElementById('cmTitle').textContent = 'Get in Touch';
    document.getElementById('cmSub').textContent = 'Choose a topic below to get started';
    document.querySelectorAll('.cm-cat-btn').forEach(b => b.classList.remove('active'));
    files = [];
    document.getElementById('cmThumbs').innerHTML = '';
    setStatus('', '');

    // Apply preselect
    if (preselect && PRESELECT_MAP[preselect]) {
      const map = PRESELECT_MAP[preselect];
      overrideProduct = map.overrideProduct || map.product || null;
      renderCategory(map.category);
      if (map.overrideTitle) document.getElementById('cmTitle').textContent = map.overrideTitle;
      if (map.overrideSub)   document.getElementById('cmSub').textContent   = map.overrideSub;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeContactModal = function () {
    document.getElementById('contactModal').classList.remove('open');
    document.body.style.overflow = '';
  };

  /* ── Helpers ──────────────────────────────────────────────────────── */
  function addFiles(list) {
    const ok = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    Array.from(list).forEach(f => {
      if (files.length >= MAX) { setStatus('Max 3 attachments allowed.', 'error'); return; }
      if (!ok.includes(f.type)) { setStatus('Only JPG, PNG, WebP, GIF allowed.', 'error'); return; }
      if (f.size > MAXSZ) { setStatus(f.name.slice(0, 20) + ' exceeds 3 MB.', 'error'); return; }
      if (!files.find(x => x.name === f.name && x.size === f.size)) files.push(f);
    });
    renderThumbs();
  }

  function renderThumbs() {
    const c = document.getElementById('cmThumbs');
    if (!c) return;
    c.innerHTML = '';
    files.forEach((f, i) => {
      const d = document.createElement('div');
      d.className = 'cm-thumb';
      const url = URL.createObjectURL(f);
      d.innerHTML = '<img src="' + url + '" alt=""><button type="button" class="cm-thumb-remove" aria-label="Remove">✕</button><span class="cm-thumb-name">' + esc(f.name.length > 14 ? f.name.slice(0, 12) + '…' : f.name) + '</span>';
      d.querySelector('button').addEventListener('click', () => { files.splice(i, 1); renderThumbs(); });
      c.appendChild(d);
    });
  }

  function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function setStatus(msg, type) { const el = document.getElementById('cmStatus'); if (!el) return; el.textContent = msg; el.className = 'cm-status' + (type ? ' cm-status--' + type : ''); }
  function toB64(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f); }); }

  /* ── Collect form payload from active category ─────────────────── */
  function collectPayload() {
    const def = CATEGORIES[currentCat];
    const payload = {
      category: currentCat,
      product:  val('cmProduct') || def.product || currentCat,
      subject:  val('cmSubject') || '',
      desc:     val('cmDesc')    || '',
      device:   val('cmDevice')  || '',
      email:    val('cmEmail')   || ''
    };
    // Extra contextual fields
    if (currentCat === 'project') {
      payload.projectType = val('cmProjectType');
      payload.budget      = val('cmBudget');
      payload.timeline    = val('cmTimeline');
      payload.subject     = payload.projectType + (payload.budget ? ' · ' + payload.budget : '');
    }
    if (currentCat === 'healthcheck') {
      payload.platform    = val('cmPlatform');
      payload.package     = val('cmPackage');
      payload.appUrl      = val('cmAppUrl');
      payload.concerns    = val('cmConcerns');
      payload.subject     = val('cmPlatform') + ' · ' + val('cmPackage');
    }
    if (currentCat === 'improvement') {
      payload.area    = val('cmArea');
      payload.subject = val('cmArea');
    }
    return payload;
  }

  /* ── Validate active form ─────────────────────────────────────────── */
  function validate(p) {
    if (!currentCat)       return 'Please select a topic above.';
    if (currentCat === 'project') {
      if (!p.projectType)  return 'Please select the type of project.';
      if (!p.budget)       return 'Please select a budget range.';
      if (!p.timeline)     return 'Please select a timeline.';
      if (!p.desc)         return 'Please describe your idea.';
      if (!p.email)        return 'Please enter your email address.';
    }
    if (currentCat === 'healthcheck') {
      if (!p.platform)     return 'Please select a platform.';
      if (!p.package)      return 'Please select a package.';
      if (!p.concerns)     return 'Please select your main concern.';
      if (!p.device)       return 'Please enter your app or company name.';
      if (!p.email)        return 'Please enter your email address.';
    }
    if (currentCat === 'bug') {
      if (!p.product)      return 'Please select which app has the bug.';
      if (!p.subject)      return 'Please enter a bug summary.';
      if (!p.desc)         return 'Please describe the steps to reproduce.';
    }
    if (currentCat === 'feature') {
      if (!p.product)      return 'Please select which app.';
      if (!p.subject)      return 'Please describe the feature in one line.';
      if (!p.desc)         return 'Please explain why this feature is useful.';
    }
    if (currentCat === 'improvement') {
      if (!p.product)      return 'Please select which app or area.';
      if (!p.area)         return 'Please select the area of improvement.';
      if (!p.desc)         return 'Please describe what needs improvement.';
    }
    if (currentCat === 'general') {
      if (!p.subject)      return 'Please enter a subject.';
      if (!p.desc)         return 'Please add a message.';
    }
    if (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) {
      return 'Please enter a valid email address.';
    }
    return null; // valid
  }

  /* ── Wire up events ───────────────────────────────────────────────── */
  function init() {
    const modal  = document.getElementById('contactModal');
    const form   = document.getElementById('cmForm');
    const drop   = document.getElementById('cmDrop');
    const inp    = document.getElementById('cmFiles');

    // Close
    document.getElementById('cmClose').addEventListener('click', closeContactModal);
    document.getElementById('cmSuccessClose').addEventListener('click', closeContactModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeContactModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) closeContactModal(); });

    // Category pills
    document.getElementById('cmCatPicker').addEventListener('click', e => {
      const btn = e.target.closest('.cm-cat-btn');
      if (btn) { overrideProduct = null; renderCategory(btn.dataset.cat); }
    });

    // File drop
    drop.addEventListener('dragover',  e  => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop',      e  => { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer.files); });
    drop.addEventListener('click',     e  => { if (e.target.id !== 'cmPickFiles') inp.click(); });
    document.getElementById('cmPickFiles').addEventListener('click', e => { e.stopPropagation(); inp.click(); });
    inp.addEventListener('change', () => { addFiles(inp.files); inp.value = ''; });

    // Submit
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.querySelector('[name="_trap"]').value) return;

      const payload = collectPayload();
      const err = validate(payload);
      if (err) { setStatus(err, 'error'); return; }

      const btn = document.getElementById('cmSubmit');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setStatus('', '');

      // Attach files
      const filePayload = [];
      for (let i = 0; i < files.length; i++) {
        setStatus('Preparing image ' + (i + 1) + ' of ' + files.length + '…', 'loading');
        try { const content = await toB64(files[i]); filePayload.push({ name: files[i].name, type: files[i].type, content }); } catch (_) {}
      }

      setStatus('Submitting…', 'loading');
      try {
        const r = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, files: filePayload })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || r.status);
        const def = CATEGORIES[currentCat];
        document.getElementById('cmSuccessMsg').textContent = def ? def.successMsg : 'We received your message!';
        form.style.display = 'none';
        document.getElementById('cmCatPicker').style.display = 'none';
        document.querySelector('.cm-cat-label').style.display = 'none';
        document.getElementById('cmSuccess').style.display = 'flex';
      } catch (err) {
        btn.disabled = false;
        btn.textContent = CATEGORIES[currentCat] ? CATEGORIES[currentCat].submitLabel : 'Send';
        setStatus(err.message || 'Submission failed. Please email contact@wiselyrise.in directly.', 'error');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
