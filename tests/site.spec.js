import { test, expect } from '@playwright/test';

const PAGES = ['/', '/rack-repair/'];
const PHONE = 'tel:+19896009030';
const PHONE_TEXT = '1-989-600-9030';

// External embeds (YouTube, Google Maps) are not part of this site; keep tests offline and deterministic.
test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
});

const isMobile = (testInfo) => testInfo.project.name === 'mobile';

// Scroll the whole page like a visitor would (triggers lazy images, animations, on-demand scripts),
// then wait for every image to finish loading.
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(50);
  }
  await page.waitForFunction(() => [...document.images].every((img) => img.complete));
}

// Scroll an element to the middle of the screen and click it (desktop) or tap it with a finger (mobile).
// - The site uses smooth scrolling, so jump instantly; otherwise the element is still moving when clicked.
// - Centring keeps the sticky header and the floating call button from covering it.
// - On phones the page is a little wider than the screen (the carousels overflow, same as the live
//   WordPress site), which offsets the browser's visible area; Playwright's click() then misjudges what
//   is under the pointer, so tap at the element's on-screen position the way a visitor's finger would.
async function clickCentered(locator) {
  const page = locator.page();
  await locator.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
  if (!(await page.evaluate(() => navigator.maxTouchPoints > 0))) return locator.click();
  await page.waitForTimeout(300);
  const box = await locator.boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

for (const path of PAGES) {
  test.describe(`page ${path}`, () => {
    test('loads every local file with no script errors', async ({ page }) => {
      const failed = [];
      const errors = [];
      page.on('response', (r) => { if (r.url().startsWith('http://localhost') && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.goto(path, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      expect(failed).toEqual([]);
      expect(errors).toEqual([]);
    });

    test('all images load', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await scrollThrough(page);
      const broken = await page.evaluate(() => [...document.images]
        .filter((img) => img.complete && img.currentSrc && img.naturalWidth === 0)
        .map((img) => img.currentSrc));
      expect(broken).toEqual([]);
    });

    test('brand fonts are self-hosted and applied', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')));
      expect(loaded).toContain('Barlow');
      expect(await page.locator('h1').first().evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Barlow/);
    });

    test('every in-page link points at a section that exists', async ({ page }) => {
      await page.goto(path);
      const missing = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="#"]')]
        .map((a) => a.getAttribute('href')).filter((h) => h.length > 1))]
        .filter((h) => !document.getElementById(h.slice(1))));
      expect(missing).toEqual([]);
    });

    test('header logo links home and stays visible while scrolling', async ({ page }) => {
      await page.goto(path, { waitUntil: 'networkidle' });
      // Elementor's sticky header keeps a hidden placeholder copy, so pick the visible logo.
      const logo = page.locator('.elementor-location-header .elementor-widget-theme-site-logo a').filter({ visible: true });
      await expect(logo).toHaveAttribute('href', '/');
      await expect(logo.locator('img')).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 3000));
      await page.waitForTimeout(500);
      const box = await logo.locator('img').boundingBox();
      expect(box.y).toBeGreaterThanOrEqual(-1);
      expect(box.y).toBeLessThan(150); // sticky header
    });
  });
}

test('navigation menu works and jumps to sections', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const header = page.locator('.elementor-location-header');
  if (isMobile(testInfo)) {
    const toggle = header.locator('.elementor-menu-toggle').first();
    await expect(toggle).toBeVisible();
    await expect(header.locator('.elementor-nav-menu--main').first()).toBeHidden();
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const gallery = header.locator('.elementor-nav-menu--dropdown a[href="#Gallery"]').first();
    await expect(gallery).toBeVisible();
    await gallery.click();
  } else {
    await expect(header.locator('.elementor-menu-toggle').first()).toBeHidden();
    const main = header.locator('.elementor-nav-menu--main').first();
    await expect(main.locator('a', { hasText: 'Home' })).toHaveClass(/elementor-item-active/);
    await main.locator('a[href="#Gallery"]').click();
  }
  await expect.poll(() => page.evaluate(() => Math.abs(document.getElementById('Gallery').getBoundingClientRect().top))).toBeLessThan(250);
});

test('service carousel arrows change the slide', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const carousel = page.locator('.elementor-widget-image-carousel').first();
  await carousel.scrollIntoViewIfNeeded();
  const active = () => carousel.locator('.swiper-slide-active').getAttribute('data-swiper-slide-index');
  await expect.poll(active).not.toBeNull();
  const before = await active();
  await clickCentered(carousel.locator('.elementor-swiper-button-next'));
  await expect.poll(active).not.toBe(before);
});

test('call buttons dial the business number', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  const floating = page.locator('.elementor-element-865e51e');
  if (isMobile(testInfo)) {
    await expect(floating).toBeVisible();
    await expect(floating.locator('a')).toHaveAttribute('href', PHONE);
    await expect(floating).toHaveCSS('position', 'fixed');
  } else {
    await expect(floating).toBeHidden();
  }
  await expect(page.locator(`a[href="${PHONE}"]`).first()).toBeAttached();
});

for (const path of PAGES) {
  test(`every phone link and number on ${path} is ${PHONE_TEXT}`, async ({ page }) => {
    await page.goto(path);
    const links = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="tel:"]')].map((a) => a.getAttribute('href')))]);
    expect(links).toEqual([PHONE]);
    const shown = await page.evaluate(() => document.body.innerText.match(/\(?\b\d{3}\)?[ .-]\d{3}[ .-]\d{4}\b/g) || []);
    expect(shown.length).toBeGreaterThan(0);
    for (const number of shown) expect(`1-${number}`).toBe(PHONE_TEXT);
  });
}

test('contact form validates and does not post to the old WordPress backend', async ({ page }) => {
  const posts = [];
  page.on('request', (r) => { if (r.method() === 'POST') posts.push(r.url()); });
  await page.goto('/', { waitUntil: 'networkidle' });
  const form = page.locator('form.elementor-form');
  await form.scrollIntoViewIfNeeded();
  const submit = form.locator('button[type="submit"]');

  await clickCentered(submit);
  expect(await form.locator('input[name="form_fields[name]"]').evaluate((el) => el.validity.valueMissing)).toBe(true);
  await expect(form.locator('.elementor-message')).toHaveCount(0);

  await form.locator('input[name="form_fields[name]"]').fill('Test');
  await form.locator('input[name="form_fields[field_8ea3bed]"]').fill('User');
  await form.locator('input[name="form_fields[email]"]').fill('test@example.com');
  await form.locator('input[name="form_fields[field_85dd49f]"]').fill('555-555-5555');
  await clickCentered(submit);
  await expect(form.locator('.elementor-message')).toContainText('not available yet');
  expect(posts).toEqual([]);
});
