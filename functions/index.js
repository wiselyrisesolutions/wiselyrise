const functions = require('firebase-functions');

const REPO = 'wiselyrisesolutions/wiselyrise';

// Only allow requests from the production domain (and localhost for testing)
const ALLOWED_ORIGINS = [
  'https://wiselyrise.in',
  'https://www.wiselyrise.in',
  'http://localhost',
  'http://127.0.0.1',
];

const VALID_PRODUCTS  = ['datewise', 'pixwise', 'gramwise', 'docuwise', 'other'];
const VALID_CATEGORIES = ['bug', 'feature', 'improvement', 'general'];
const PROD_LABELS  = { datewise:'DateWise', pixwise:'PixWise', gramwise:'GramWise', docuwise:'DocuWise', other:'Other' };
const CAT_LABELS   = { bug:'🐛 Bug Report', feature:'✨ New Feature', improvement:'🔧 Improvement', general:'💬 General Feedback' };

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.some(o => origin && origin.startsWith(o))) {
    res.set('Access-Control-Allow-Origin', origin);
  }
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

exports.submitContactForm = functions
  .runWith({ timeoutSeconds: 30, memory: '256MB' })
  .https.onRequest(async (req, res) => {
    setCors(req, res);

    if (req.method === 'OPTIONS') { res.status(204).send(''); return; }
    if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

    // Token is stored as Firebase config — never in source code
    const tk = functions.config().github && functions.config().github.pat;
    if (!tk) { res.status(500).json({ error: 'Server misconfigured' }); return; }

    const { product, category, subject, desc, device, email, files } = req.body || {};

    // Required field validation
    if (!product || !category || !subject || !desc) {
      res.status(400).json({ error: 'Missing required fields' }); return;
    }
    if (!VALID_PRODUCTS.includes(product) || !VALID_CATEGORIES.includes(category)) {
      res.status(400).json({ error: 'Invalid product or category' }); return;
    }
    if (typeof subject !== 'string' || subject.trim().length < 4 || subject.length > 120) {
      res.status(400).json({ error: 'Invalid subject' }); return;
    }
    if (typeof desc !== 'string' || desc.trim().length < 1 || desc.length > 5000) {
      res.status(400).json({ error: 'Invalid description' }); return;
    }

    // ── Upload attachments ────────────────────────────────────────────
    const session = new Date().toISOString().slice(0, 10) + '_' + Math.random().toString(36).slice(2, 8);
    let imgSection = '';
    const MAX_FILES = 3;
    const MAX_B64_LEN = Math.ceil(3 * 1024 * 1024 * 4 / 3); // ~4 MB base64 ≈ 3 MB binary
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    const filesToProcess = Array.isArray(files) ? files.slice(0, MAX_FILES) : [];
    for (let i = 0; i < filesToProcess.length; i++) {
      const f = filesToProcess[i];
      if (!f || !f.content || typeof f.content !== 'string') continue;
      if (f.content.length > MAX_B64_LEN) continue;
      if (f.type && !ALLOWED_TYPES.includes(f.type)) continue;

      const safe = String(f.name || 'image').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 60);
      const path = `uploads/contact/${product}/${session}/${safe}`;
      try {
        const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Contact form attachment', content: f.content }),
        });
        if (r.ok) {
          imgSection += `\n![${safe}](https://raw.githubusercontent.com/${REPO}/main/${path})\n`;
        } else {
          imgSection += `\n*(Image ${i + 1} upload failed — HTTP ${r.status})*\n`;
        }
      } catch (_) {
        imgSection += `\n*(Image ${i + 1} upload error)*\n`;
      }
    }

    // ── Create GitHub Issue ────────────────────────────────────────────
    const productLabel = PROD_LABELS[product] || product;
    const catLabel     = CAT_LABELS[category] || category;
    const title = `[${productLabel}][${catLabel}] ${subject.trim()}`;

    const body = [
      `## ${catLabel} — ${productLabel}`, '',
      `**Subject:** ${subject.trim()}`, '',
      '**Description:**', desc.trim(), '',
      device ? `**Device / OS:** ${String(device).slice(0, 120)}` : null,
      email   ? `**Contact:** ${String(email).slice(0, 120)}`      : null,
      imgSection ? `\n---\n### Attachments\n${imgSection}` : null,
      '---', '*Submitted via wiselyrise.in*',
    ].filter(l => l !== null).join('\n');

    try {
      const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body }),
      });
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      const data = await r.json();
      res.status(200).json({ success: true, issue: data.number });
    } catch (err) {
      functions.logger.error('GitHub issue creation failed:', err.message);
      res.status(500).json({ error: 'Submission failed. Please email contact@wiselyrise.in directly.' });
    }
  });
