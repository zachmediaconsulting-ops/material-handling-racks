import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PHONE = 'tel:+19896009030';
const PHONE_TEXT = '1-989-600-9030';

// Every page the build produced (dist/**/index.html).
const dist = join(process.cwd(), 'dist');
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : f === 'index.html' ? [p] : [];
});
const ROUTES = walk(dist).map((f) => '/' + f.slice(dist.length + 1).replace(/index\.html$/, '')).sort();

// The YouTube video and Google Map are the only outside content; block them so tests are offline.
const ALLOWED_EXTERNAL = ['www.youtube-nocookie.com', 'maps.google.com'];
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});
const isMobile = (testInfo) => testInfo.project.name === 'mobile';

test('the site has all 67 pages', () => {
  expect(ROUTES.length).toBe(67);
});

test.describe('every page', () => {
  for (const path of ROUTES) {
    test(`${path} loads cleanly and fits the screen`, async ({ page }) => {
      const problems = [];
      page.on('pageerror', (e) => problems.push(`script error: ${e.message}`));
      page.on('response', (r) => { if (r.url().startsWith('http://localhost') && r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
      page.on('request', (r) => {
        const host = new URL(r.url()).hostname;
        if (host !== 'localhost' && !ALLOWED_EXTERNAL.includes(host)) problems.push(`outside request: ${r.url()}`);
      });
      const res = await page.goto(path, { waitUntil: 'load' });
      expect(res.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toBeVisible();
      const fit = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return { page: document.documentElement.scrollWidth <= document.documentElement.clientWidth, h1: h1.scrollWidth <= h1.clientWidth + 1 };
      });
      expect(fit, 'no sideways scrolling and headline fits').toEqual({ page: true, h1: true });
      expect(problems).toEqual([]);
    });
  }
});

test('home and rack repair: every image loads after scrolling the whole page', async ({ page }) => {
  for (const path of ['/', '/rack-repair/']) {
    await page.goto(path, { waitUntil: 'load' });
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(40); }
    await page.waitForFunction(() => [...document.images].every((img) => img.complete || img.getClientRects().length === 0));
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.getClientRects().length && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
  }
});

test('main menu reaches a page in every section', async ({ page }, testInfo) => {
  const targets = [['Capabilities', '/capabilities/dunnage/'], ['Carts', '/carts/tugger-carts/'], ['Racks', '/racks/automotive-racks/'],
    ['Fabrication', '/rack-changeovers-reworks/'], ['Industries', '/industries/automotive/'], ['Company', '/request-a-quote/']];
  for (const [group, href] of targets) {
    await page.goto('/');
    const nav = page.locator('header .nav');
    if (isMobile(testInfo)) {
      await expect(nav.locator('.header__cta')).toBeHidden();
      await nav.locator('.menu-toggle').click();
      const toggle = nav.locator(`.menu__sub-toggle[aria-label="Show ${group} pages"]`);
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    } else {
      await expect(nav.locator('.menu-toggle')).toBeHidden();
      await nav.locator('.menu__link', { hasText: group }).hover();
    }
    const link = nav.locator(`.submenu a[href="${href}"]`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator('.menu > li.is-current > .menu__link')).toHaveText(group);
  }
});

test('footer links to every page', async ({ page }) => {
  await page.goto('/');
  const footerLinks = await page.locator('footer a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  for (const path of ROUTES.filter((p) => p !== '/')) expect(footerLinks, path).toContain(path);
});

test('carousel arrows change the photo', async ({ page }) => {
  await page.goto('/');
  const carousel = page.locator('.carousel').first();
  await carousel.scrollIntoViewIfNeeded();
  const pos = () => carousel.locator('.carousel__track').evaluate((t) => Math.round(t.scrollLeft / t.clientWidth));
  const before = await pos();
  await carousel.locator('.carousel__btn--next').click();
  await expect.poll(pos).not.toBe(before);
});

test('phone numbers and call buttons all use 1-989-600-9030', async ({ page }, testInfo) => {
  for (const path of ['/', '/contact/', '/racks/']) {
    await page.goto(path);
    const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')))]);
    expect(links).toEqual([PHONE]);
    const shown = await page.evaluate(() => document.body.innerText.match(/\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g) || []);
    for (const n of shown) expect(`1-${n}`).toBe(PHONE_TEXT);
  }
  const floating = page.locator('.call-now');
  if (isMobile(testInfo)) {
    await expect(floating).toBeVisible();
    await expect(floating).toHaveCSS('position', 'fixed');
  } else {
    await expect(floating).toBeHidden();
  }
});

test('quote form validates, sends to /api/quote, and shows the result', async ({ page }) => {
  const posts = [];
  let reply = { status: 200, body: { ok: true } };
  await page.route('**/api/quote', async (route) => {
    posts.push(route.request().postData() || '');
    await route.fulfill({ status: reply.status, contentType: 'application/json', body: JSON.stringify(reply.body) });
  });
  await page.goto('/request-a-quote/');
  const form = page.locator('form[data-form]');
  const submit = form.locator('button[type="submit"]');
  await submit.evaluate((b) => b.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await submit.click();
  expect(await form.locator('[name="first_name"]').evaluate((el) => el.validity.valueMissing)).toBe(true);
  expect(posts).toEqual([]);

  const fill = async () => {
    await form.locator('[name="first_name"]').fill('Test');
    await form.locator('[name="last_name"]').fill('User');
    await form.locator('[name="email"]').fill('test@example.com');
    await form.locator('[name="phone"]').fill('555-555-5555');
  };
  await fill();
  await form.locator('input[type="file"]').setInputFiles({ name: 'part.pdf', mimeType: 'application/pdf', buffer: Buffer.from('drawing') });
  await submit.click();
  await expect(form.locator('.form__message')).toContainText('Thanks, Test! Your request was sent.');
  expect(posts).toHaveLength(1);
  for (const value of ['name="first_name"', 'Test', 'test@example.com', 'filename="part.pdf"', 'name="page"', '/request-a-quote/']) expect(posts[0]).toContain(value);
  await expect(form.locator('[name="first_name"]')).toHaveValue('');

  reply = { status: 502, body: { ok: false, error: 'Your request couldn’t be sent. Please call us at 1-989-600-9030 or try again.' } };
  await fill();
  await submit.click();
  await expect(form.locator('.form__message')).toContainText('call us at 1-989-600-9030');
  await expect(submit).toBeEnabled();
});

test('oversized attachments are stopped before upload', async ({ page }) => {
  const posts = [];
  await page.route('**/api/quote', (route) => { posts.push(1); route.abort(); });
  await page.goto('/contact/');
  const form = page.locator('form[data-form]');
  await form.locator('[name="first_name"]').fill('Test');
  await form.locator('[name="last_name"]').fill('User');
  await form.locator('[name="email"]').fill('test@example.com');
  await form.locator('[name="phone"]').fill('555-555-5555');
  await form.locator('input[type="file"]').setInputFiles({ name: 'big.step', mimeType: 'application/octet-stream', buffer: Buffer.alloc(16 * 1024 * 1024) });
  await form.locator('button[type="submit"]').evaluate((b) => b.click());
  await expect(form.locator('.form__message')).toContainText('15 MB');
  expect(posts).toEqual([]);
});

test('sitemap lists indexable pages only, with clean canonical URLs', () => {
  const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>https:\/\/materialhandlingracks\.com([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.length).toBe(62);
  for (const path of ROUTES) {
    const html = readFileSync(join(dist, path, 'index.html'), 'utf8');
    expect(html).toContain(`<link rel="canonical" href="https://materialhandlingracks.com${path}">`);
    expect(urls.includes(path)).toBe(!html.includes('content="noindex'));
  }
});

test('a new page opens at the top after following a link from the bottom of a page', async ({ page }) => {
  await page.goto('/racks/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const link = page.locator('footer .sitemap a[href="/carts/tugger-carts/"]');
  await link.evaluate((a) => a.closest('details').setAttribute('open', ''));
  await link.click();
  await expect(page).toHaveURL(/\/carts\/tugger-carts\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('unknown addresses show the Page Not Found page', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveText('Page Not Found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('.hero a[href="/request-a-quote/"]')).toBeVisible();
});
