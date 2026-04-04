/* ── WiselyRise Contact Modal ──────────────────────────────────────────
 * Single shared file used by all product pages.
 * Usage:
 *   <script src="/shared/contact-modal.js"></script>
 *   <button onclick="openContactModal()">Contact</button>
 *   <button onclick="openContactModal('datewise')">Contact</button>  ← pre-selects product
 * ─────────────────────────────────────────────────────────────────── */
(function () {
  /* ── Config ───────────────────────────────────────────────────────── */
  // Update this URL after deploying the Firebase Function.
  const FUNCTION_URL = 'https://submitcontactform-c6cct7lpba-uc.a.run.app';
  const MAX = 3, MAXSZ = 3 * 1024 * 1024;

  /* ── Inject CSS ───────────────────────────────────────────────────── */
  const CSS = `
  .cm-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:none;align-items:center;justify-content:center;padding:20px}
  .cm-overlay.open{display:flex}
  @keyframes cmSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .cm-box{background:#fff;border-radius:20px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.2);animation:cmSlideUp .3s cubic-bezier(.22,1,.36,1) both;font-family:'DM Sans','Inter',system-ui,-apple-system,sans-serif}
  .cm-header{display:flex;align-items:flex-start;justify-content:space-between;padding:28px 28px 20px;border-bottom:1px solid #e8e8ea;position:sticky;top:0;background:#fff;z-index:2;border-radius:20px 20px 0 0}
  .cm-title{font-size:1.2rem;font-weight:800;letter-spacing:-.03em;margin-bottom:3px;color:#0f0f0f}
  .cm-sub{font-size:.82rem;color:#6b7280}
  .cm-close{width:32px;height:32px;border-radius:50%;background:#e8e8ea;color:#6b7280;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.85rem;transition:background .18s,color .18s;flex-shrink:0;margin-top:2px}
  .cm-close:hover{background:#e2e2e5;color:#111}
  .cm-form{padding:24px 28px 28px}
  .cm-row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .cm-field{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
  .cm-label{font-size:.8rem;font-weight:700;color:#374151}
  .cm-req{color:#7c3aed}
  .cm-opt{font-weight:400;color:#6b7280;font-size:.76rem}
  .cm-input{padding:10px 14px;border:1.5px solid #e8e8ea;border-radius:10px;font-family:inherit;font-size:.88rem;color:#0f0f0f;background:#fff;transition:border-color .18s,box-shadow .18s;outline:none;width:100%}
  .cm-input:focus{border-color:#a78bfa;box-shadow:0 0 0 3px rgba(124,58,237,.1)}
  .cm-textarea{resize:vertical;min-height:110px;line-height:1.6}
  .cm-select{cursor:pointer}
  .cm-drop{border:2px dashed #e8e8ea;border-radius:12px;padding:20px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;transition:border-color .2s,background .2s;color:#6b7280;font-size:.84rem;text-align:center}
  .cm-drop:hover,.cm-drop.drag{border-color:#a78bfa;background:#f5f3ff}
  .cm-drop svg{pointer-events:none;margin-bottom:2px}
  .cm-drop-btn{background:none;border:none;color:#7c3aed;font-weight:700;cursor:pointer;font-size:inherit;padding:0;text-decoration:underline}
  .cm-drop-hint{font-size:.74rem;color:#94a3b8}
  .cm-thumbs{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
  .cm-thumb{position:relative;width:72px;text-align:center}
  .cm-thumb img{width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid #e8e8ea}
  .cm-thumb-remove{position:absolute;top:-6px;right:-6px;width:20px;height:20px;border-radius:50%;background:#ef4444;color:#fff;border:none;cursor:pointer;font-size:.6rem;display:flex;align-items:center;justify-content:center;line-height:1}
  .cm-thumb-name{display:block;font-size:.65rem;color:#6b7280;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .cm-actions{display:flex;align-items:center;gap:12px;margin-top:8px}
  .cm-status{font-size:.8rem;flex:1}
  .cm-status--error{color:#ef4444}
  .cm-status--loading{color:#7c3aed}
  .cm-submit{background:#5b21b6;color:#fff;padding:11px 28px;border-radius:100px;font-size:.88rem;font-weight:700;border:none;cursor:pointer;transition:background .2s,transform .15s;white-space:nowrap}
  .cm-submit:hover:not(:disabled){background:#7c3aed;transform:translateY(-1px)}
  .cm-submit:disabled{opacity:.6;cursor:not-allowed}
  .cm-success{display:none;flex-direction:column;align-items:center;text-align:center;padding:48px 28px;gap:14px}
  .cm-success-icon{width:56px;height:56px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:700}
  .cm-success h3{font-size:1.2rem;font-weight:800;letter-spacing:-.02em;color:#0f0f0f}
  .cm-success p{font-size:.88rem;color:#6b7280;max-width:320px;line-height:1.65}
  @media(max-width:540px){
    .cm-box{border-radius:16px;max-height:95vh}
    .cm-row-2{grid-template-columns:1fr}
    .cm-form{padding:18px}
    .cm-header{padding:18px;border-radius:16px 16px 0 0}
  }`;

  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ── Inject HTML ──────────────────────────────────────────────────── */
  const HTML = `
  <div id="contactModal" class="cm-overlay" role="dialog" aria-modal="true" aria-label="Contact WiselyRise">
    <div class="cm-box">
      <div class="cm-header">
        <div>
          <div class="cm-title">Get in Touch</div>
          <div class="cm-sub">Report a bug, suggest a feature, or share an idea</div>
        </div>
        <button class="cm-close" id="cmClose" aria-label="Close">✕</button>
      </div>
      <form class="cm-form" id="cmForm" novalidate>
        <!-- Honeypot -->
        <input type="text" name="_trap" style="opacity:0;position:absolute;left:-9999px" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmCategory">Category <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmCategory" required>
              <option value="">Select category…</option>
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">✨ New Feature</option>
              <option value="improvement">🔧 Improvement</option>
              <option value="general">💬 General Feedback</option>
            </select>
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmProduct">Product <span class="cm-req">*</span></label>
            <select class="cm-input cm-select" id="cmProduct" required>
              <option value="">Select product…</option>
              <option value="datewise">DateWise</option>
              <option value="pixwise">PixWise</option>
              <option value="gramwise">GramWise</option>
              <option value="docuwise">DocuWise</option>
              <option value="clinicwise">ClinicWise</option>
              <option value="chitwise">ChitWise</option>
              <option value="other">Something Else 💡</option>
            </select>
          </div>
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmSubject">Subject <span class="cm-req">*</span></label>
          <input type="text" class="cm-input" id="cmSubject" placeholder="Brief description…" required maxlength="100" />
        </div>
        <div class="cm-field">
          <label class="cm-label" for="cmDesc">Details <span class="cm-req">*</span></label>
          <textarea class="cm-input cm-textarea" id="cmDesc" placeholder="Describe in as much detail as you can…" required maxlength="3000"></textarea>
        </div>
        <div class="cm-row-2">
          <div class="cm-field">
            <label class="cm-label" for="cmDevice">Device / OS <span class="cm-opt">(optional)</span></label>
            <input type="text" class="cm-input" id="cmDevice" placeholder="e.g. Redmi Note 12 · Android 14" maxlength="100" />
          </div>
          <div class="cm-field">
            <label class="cm-label" for="cmEmail">Your Email <span class="cm-opt">(optional)</span></label>
            <input type="email" class="cm-input" id="cmEmail" placeholder="For follow-up replies" maxlength="120" />
          </div>
        </div>
        <div class="cm-field">
          <label class="cm-label">Attachments <span class="cm-opt">(up to 3 images · max 3 MB each)</span></label>
          <div class="cm-drop" id="cmDrop">
            <input type="file" id="cmFiles" accept="image/jpeg,image/png,image/webp,image/gif" multiple style="display:none" />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span>Drop images here or <button type="button" class="cm-drop-btn" id="cmPickFiles">browse</button></span>
            <span class="cm-drop-hint">JPG · PNG · WebP · GIF</span>
          </div>
          <div class="cm-thumbs" id="cmThumbs"></div>
        </div>
        <div class="cm-actions">
          <div class="cm-status" id="cmStatus"></div>
          <button type="submit" class="cm-submit" id="cmSubmit">Send Feedback</button>
        </div>
      </form>
      <div class="cm-success" id="cmSuccess">
        <div class="cm-success-icon">✓</div>
        <h3>Thank you!</h3>
        <p>Your feedback has been received. We'll review it and follow up if needed.</p>
        <button class="cm-submit" id="cmSuccessClose">Close</button>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', HTML);

  /* ── State ────────────────────────────────────────────────────────── */
  let files = [];

  /* ── Public API ───────────────────────────────────────────────────── */
  window.openContactModal = function (preselect) {
    document.getElementById('contactModal').classList.add('open');
    document.body.style.overflow = 'hidden';
    if (preselect) {
      const sel = document.getElementById('cmProduct');
      if (sel) sel.value = preselect;
    }
  };

  window.closeContactModal = function () {
    document.getElementById('contactModal').classList.remove('open');
    document.body.style.overflow = '';
    const suc = document.getElementById('cmSuccess');
    if (suc.style.display === 'flex') {
      suc.style.display = 'none';
      const form = document.getElementById('cmForm');
      form.style.display = '';
      form.reset();
      files = [];
      document.getElementById('cmThumbs').innerHTML = '';
      document.getElementById('cmStatus').textContent = '';
      const btn = document.getElementById('cmSubmit');
      btn.disabled = false;
      btn.textContent = 'Send Feedback';
    }
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

  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function setStatus(msg, type) { const el = document.getElementById('cmStatus'); if (!el) return; el.textContent = msg; el.className = 'cm-status' + (type ? ' cm-status--' + type : ''); }
  function toB64(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.onerror = rej; r.readAsDataURL(f); }); }

  /* ── Wire up events after DOM is ready ───────────────────────────── */
  function init() {
    const modal = document.getElementById('contactModal');
    const form = document.getElementById('cmForm');
    const drop = document.getElementById('cmDrop');
    const inp = document.getElementById('cmFiles');

    document.getElementById('cmClose').addEventListener('click', closeContactModal);
    document.getElementById('cmSuccessClose').addEventListener('click', closeContactModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeContactModal(); });

    drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('drag'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('drag'); addFiles(e.dataTransfer.files); });
    drop.addEventListener('click', e => { if (e.target.id !== 'cmPickFiles') inp.click(); });
    document.getElementById('cmPickFiles').addEventListener('click', e => { e.stopPropagation(); inp.click(); });
    inp.addEventListener('change', () => { addFiles(inp.files); inp.value = ''; });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeContactModal();
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (form.querySelector('[name="_trap"]').value) return; // honeypot

      const product = document.getElementById('cmProduct').value;
      const category = document.getElementById('cmCategory').value;
      const subject = document.getElementById('cmSubject').value.trim();
      const desc = document.getElementById('cmDesc').value.trim();
      const device = document.getElementById('cmDevice').value.trim();
      const email = document.getElementById('cmEmail').value.trim();

      if (!product || !category || !subject || !desc) { setStatus('Please fill all required fields.', 'error'); return; }
      if (subject.length < 4) { setStatus('Subject is too short.', 'error'); return; }

      const btn = document.getElementById('cmSubmit');
      btn.disabled = true; btn.textContent = 'Sending…';
      setStatus('', '');

      // Convert files to base64 for the server-side proxy
      const filePayload = [];
      for (let i = 0; i < files.length; i++) {
        setStatus('Preparing image ' + (i + 1) + ' of ' + files.length + '…', 'loading');
        try {
          const content = await toB64(files[i]);
          filePayload.push({ name: files[i].name, type: files[i].type, content });
        } catch (_) { /* skip unreadable file */ }
      }

      setStatus('Submitting…', 'loading');
      try {
        const r = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product, category, subject, desc, device, email, files: filePayload })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || r.status);
        document.getElementById('cmForm').style.display = 'none';
        document.getElementById('cmSuccess').style.display = 'flex';
      } catch (err) {
        btn.disabled = false; btn.textContent = 'Send Feedback';
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
