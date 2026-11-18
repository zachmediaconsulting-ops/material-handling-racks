// Unit tests for the quote email function (functions/api/quote.js). Run with: node --test tests/
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { onRequestPost, MAX_TOTAL_BYTES, toBase64 } from '../functions/api/quote.js';

const ENV = { RESEND_API_KEY: 're_test', QUOTE_TO: 'owner@example.com', QUOTE_BCC: 'copy@example.com', QUOTE_FROM: 'Rivers Quotes <quotes@example.com>' };

let sent;
beforeEach(() => {
  sent = [];
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), init });
    if (String(url).includes('turnstile')) return new Response(JSON.stringify({ success: false }));
    return new Response(JSON.stringify({ id: 'email_1' }), { status: 200 });
  };
});

function submit(fields = {}, files = [], env = ENV) {
  const fd = new FormData();
  const base = { first_name: 'Pat', last_name: 'Lee', job_title: 'Buyer', email: 'pat@example.com', phone: '555-123-4567', phone_type: 'Cell', rush: 'No', details: 'Need 20 racks', page: '/request-a-quote/' };
  for (const [k, v] of Object.entries({ ...base, ...fields })) if (v !== undefined) fd.set(k, v);
  for (const f of files) fd.append('drawings', f);
  return onRequestPost({ request: new Request('https://example.com/api/quote', { method: 'POST', body: fd }), env });
}
const body = async (res) => res.json();

test('emails the request to the owner, with the hidden copy, reply-to and attachments', async () => {
  const file = new File([new Uint8Array([1, 2, 3, 250])], 'part.pdf', { type: 'application/pdf' });
  const res = await submit({ rush: 'Yes' }, [file]);
  assert.equal(res.status, 200);
  assert.deepEqual(await body(res), { ok: true });
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, 'https://api.resend.com/emails');
  assert.equal(sent[0].init.headers.authorization, 'Bearer re_test');
  const email = JSON.parse(sent[0].init.body);
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.deepEqual(email.bcc, ['copy@example.com']);
  assert.equal(email.reply_to, 'pat@example.com');
  assert.equal(email.from, ENV.QUOTE_FROM);
  assert.equal(email.subject, 'RUSH Quote request: Pat Lee, Buyer');
  assert.match(email.text, /Project details: Need 20 racks/);
  assert.match(email.text, /Sent from page: \/request-a-quote\//);
  assert.deepEqual(email.attachments, [{ filename: 'part.pdf', content: Buffer.from([1, 2, 3, 250]).toString('base64') }]);
});

test('escapes HTML typed into the form', async () => {
  await submit({ details: '<script>alert(1)</script>' });
  const email = JSON.parse(sent[0].init.body);
  assert.ok(!email.html.includes('<script>'));
  assert.ok(email.html.includes('&lt;script&gt;'));
});

test('says to call when email is not configured, and sends nothing', async () => {
  const res = await submit({}, [], { ...ENV, RESEND_API_KEY: '' });
  assert.equal(res.status, 503);
  assert.match((await body(res)).error, /1-989-600-9030/);
  assert.equal(sent.length, 0);
});

test('rejects missing required fields and bad emails', async () => {
  let res = await submit({ phone: '' });
  assert.equal(res.status, 400);
  assert.match((await body(res)).error, /Phone/);
  res = await submit({ email: 'not-an-email' });
  assert.equal(res.status, 400);
  assert.equal(sent.length, 0);
});

test('silently drops bot submissions that fill the hidden field', async () => {
  const res = await submit({ website: 'http://spam.example' });
  assert.equal(res.status, 200);
  assert.equal(sent.length, 0);
});

test('rejects attachments over the size limit', async () => {
  const big = new File([new Uint8Array(MAX_TOTAL_BYTES + 1)], 'huge.step');
  const res = await submit({}, [big]);
  assert.equal(res.status, 413);
  assert.equal(sent.length, 0);
});

test('requires Turnstile when its secret is set', async () => {
  const res = await submit({}, [], { ...ENV, TURNSTILE_SECRET_KEY: 'secret' });
  assert.equal(res.status, 400);
  assert.ok(sent.every((s) => !s.url.includes('resend')));
});

test('reports a failure when Resend rejects the email', async () => {
  globalThis.fetch = async () => new Response('bad', { status: 422 });
  const res = await submit();
  assert.equal(res.status, 502);
  assert.match((await body(res)).error, /call us/);
});

test('fallback base64 matches the native encoder', () => {
  const bytes = new Uint8Array(100000).map((_, i) => (i * 7) % 256);
  const native = toBase64(bytes.buffer);
  const saved = globalThis.Buffer; globalThis.Buffer = undefined;
  try { assert.equal(toBase64(bytes.buffer), native); } finally { globalThis.Buffer = saved; }
});
