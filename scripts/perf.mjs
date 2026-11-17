// Measures page load on a simulated mid-range phone over slow 4G (the conditions Google's
// PageSpeed "mobile" score uses): node scripts/perf.mjs [baseUrl]   (start the preview server first)
import { chromium, devices } from 'playwright';

const base = process.argv[2] || 'http://localhost:4321';
const pages = ['/', '/rack-repair/'];
const browser = await chromium.launch();

for (const path of pages) {
  const context = await browser.newContext({ ...devices['iPhone 13'] });
  const page = await context.newPage();
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort()); // YouTube/Maps are not ours
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  let bytes = 0; let requests = 0;
  cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; requests += 1; });
  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; })
      .observe({ type: 'largest-contentful-paint', buffered: true });
  });

  const start = Date.now();
  await page.goto(base + path, { waitUntil: 'load', timeout: 300_000 });
  const loadMs = Date.now() - start;
  await page.waitForTimeout(1000);
  const m = await page.evaluate(() => ({
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
    lcp: window.__lcp,
  }));
  const firstViewKB = Math.round(bytes / 1024); const firstViewReq = requests;

  // Then scroll the whole page so lazy images load: total weight of a full visit.
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 500) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(40); }
  await page.waitForTimeout(2000);

  console.log(`${path.padEnd(14)} first paint ${(m.fcp / 1000).toFixed(1)}s | main content ${(m.lcp / 1000).toFixed(1)}s | `
    + `load ${(loadMs / 1000).toFixed(1)}s | first view ${firstViewKB} KB in ${firstViewReq} files | full page ${Math.round(bytes / 1024)} KB in ${requests} files`);
  await context.close();
}
await browser.close();
