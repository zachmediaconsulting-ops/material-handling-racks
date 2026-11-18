// Cloudflare Pages Function: POST /api/quote
// Receives the contact / quote form (with optional drawings) and emails it through Resend.
//
// Settings (Cloudflare Pages → Settings → Variables and Secrets):
//   RESEND_API_KEY        secret   Resend API key
//   QUOTE_TO              text     inbox that receives quotes (comma-separate several)
//   QUOTE_BCC             text     optional hidden copy (comma-separate several)
//   QUOTE_FROM            text     sender on a domain verified in Resend, e.g. "Rivers Quotes <quotes@materialhandlingracks.com>"
//   TURNSTILE_SECRET_KEY  secret   optional; when set, every submission must pass Cloudflare Turnstile
// Without RESEND_API_KEY / QUOTE_TO / QUOTE_FROM the form answers "please call us" and never pretends to succeed.

export const MAX_TOTAL_BYTES = 15 * 1024 * 1024; // keeps the email under common 25 MB inbox limits after encoding
export const MAX_FILES = 10;
const PHONE = '1-989-600-9030';

const FIELDS = {
  first_name: 'First name', last_name: 'Last name', job_title: 'Job title', email: 'Email',
  phone: 'Phone', phone_type: 'Phone type', rush: 'Rush project', details: 'Project details', page: 'Sent from page',
};
const REQUIRED = ['first_name', 'last_name', 'email', 'phone', 'rush'];

// Base64 for attachments. Uses the fast native Buffer when the "nodejs_compat" compatibility flag is on
// (Cloudflare Pages → Settings → Runtime), otherwise a chunked fallback.
export function toBase64(arrayBuffer) {
  if (globalThis.Buffer) return globalThis.Buffer.from(arrayBuffer).toString('base64');
  const bytes = new Uint8Array(arrayBuffer); let out = '';
  for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(out);
}

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status, error) => json(status, { ok: false, error });
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const clean = (v, max = 5000) => String(v ?? '').replace(/\r\n?/g, '\n').trim().slice(0, max);

export async function onRequestPost({ request, env }) {
  const to = list(env.QUOTE_TO);
  if (!env.RESEND_API_KEY || !to.length || !env.QUOTE_FROM) {
    return fail(503, `Online quotes aren’t available right now. Please call us at ${PHONE}.`);
  }

  let form;
  try { form = await request.formData(); } catch { return fail(400, 'We couldn’t read the form. Please try again.'); }

  // Bots fill in the hidden "website" field; people never see it. Pretend success and drop it.
  if (clean(form.get('website'))) return json(200, { ok: true });

  if (env.TURNSTILE_SECRET_KEY) {
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: env.TURNSTILE_SECRET_KEY, response: clean(form.get('cf-turnstile-response')), remoteip: request.headers.get('cf-connecting-ip') || '' }),
    }).then((r) => r.json()).catch(() => ({ success: false }));
    if (!check.success) return fail(400, 'Please complete the spam check and send again.');
  }

  const data = Object.fromEntries(Object.keys(FIELDS).map((k) => [k, clean(form.get(k))]));
  const missing = REQUIRED.filter((k) => !data[k]).map((k) => FIELDS[k]);
  if (missing.length) return fail(400, `Please fill in: ${missing.join(', ')}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail(400, 'Please enter a valid email address.');

  const files = form.getAll('drawings').filter((f) => typeof f === 'object' && f && f.size > 0);
  if (files.length > MAX_FILES) return fail(400, `Please attach no more than ${MAX_FILES} files, or email larger sets to us after sending.`);
  const total = files.reduce((n, f) => n + f.size, 0);
  if (total > MAX_TOTAL_BYTES) return fail(413, `Attachments are limited to ${MAX_TOTAL_BYTES / 1024 / 1024} MB in total. Please send fewer or smaller files.`);
  const attachments = await Promise.all(files.map(async (f) => ({
    filename: clean(f.name, 200) || 'drawing',
    content: toBase64(await f.arrayBuffer()),
  })));

  const name = `${data.first_name} ${data.last_name}`;
  const rows = Object.entries(FIELDS).filter(([k]) => data[k]).map(([k, label]) => [label, data[k]]);
  if (files.length) rows.push(['Attachments', files.map((f) => `${f.name} (${Math.ceil(f.size / 1024)} KB)`).join(', ')]);
  const html = `<h2 style="font-family:Arial,sans-serif;color:#00405c">New quote request${data.rush === 'Yes' ? ' (RUSH)' : ''}</h2>
<table style="font-family:Arial,sans-serif;font-size:15px;border-collapse:collapse">${rows.map(([l, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${esc(l)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>
<p style="font-family:Arial,sans-serif;font-size:13px;color:#888">Reply to this email to answer ${esc(name)} directly.</p>`;
  const text = rows.map(([l, v]) => `${l}: ${v}`).join('\n');

  const res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.QUOTE_FROM, to, bcc: list(env.QUOTE_BCC), reply_to: data.email,
      subject: `${data.rush === 'Yes' ? 'RUSH ' : ''}Quote request: ${name}${data.job_title ? `, ${data.job_title}` : ''}`,
      html, text, attachments,
    }),
  }).catch(() => null);

  if (!res || !res.ok) {
    console.log('Resend error', res && res.status, res && (await res.text()).slice(0, 500));
    return fail(502, `Your request couldn’t be sent. Please call us at ${PHONE} or try again.`);
  }
  return json(200, { ok: true });
}

export const onRequest = () => fail(405, 'Use POST.');
