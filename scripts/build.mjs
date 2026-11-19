// Builds the whole site into dist/ and checks it.
//   npm run build
// Steps: render every page, copy public/, fingerprint CSS/JS, write sitemap.xml, robots.txt and
// _redirects (old WordPress URLs), then fail the build on broken internal links, duplicate
// URLs/titles/descriptions/H1s, or pages missing from the menu and footer.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE } from '../src/site.mjs';
import { layout, organizationLd, breadcrumbLd } from '../src/layout.mjs';
import { form, hero, linkCards } from '../src/components.mjs';
import * as templates from '../src/templates.mjs';
import * as home from '../src/pages/home.mjs';
import * as rackRepair from '../src/pages/rack-repair.mjs';
import { GROUPS, PAGES } from '../src/content/index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
cpSync(join(root, 'public'), dist, { recursive: true });

// ---- assets: one CSS file (fonts + site) and one JS file, named by content hash for caching ----
const fingerprint = (name, ext, content) => {
  const file = `/assets/${name}.${createHash('sha256').update(content).digest('hex').slice(0, 10)}.${ext}`;
  mkdirSync(join(dist, 'assets'), { recursive: true });
  writeFileSync(join(dist, file), content);
  return file;
};
const minifyCss = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim();
const assets = {
  css: fingerprint('site', 'css', minifyCss(readFileSync(join(root, 'src/assets/fonts.css'), 'utf8') + readFileSync(join(root, 'src/assets/site.css'), 'utf8'))),
  js: fingerprint('site', 'js', readFileSync(join(root, 'src/assets/site.js'), 'utf8')),
};

// ---- page registry ----
const custom = [
  { ...home.page, render: home.render },
  { ...rackRepair.page, render: rackRepair.render },
];
const all = [...custom, ...PAGES];
const byPath = new Map();
for (const p of all) {
  if (byPath.has(p.path)) throw new Error(`Duplicate route ${p.path}`);
  if (!/^\/([a-z0-9]+(-[a-z0-9]+)*\/)*$/.test(p.path)) throw new Error(`Route is not a clean URL: ${p.path}`);
  byPath.set(p.path, p);
}
const get = (path) => byPath.get(path) || (() => { throw new Error(`Link to unknown page ${path}`); })();

// Menu groups: hub page + its pages, in the order listed in src/content/index.mjs.
const groups = GROUPS.map((g) => ({ ...g, items: g.items.map((path) => ({ href: path, label: get(path).label })) }));

const ctx = (page) => {
  const crumbs = [{ label: 'Home', href: '/' }, ...(page.breadcrumbs || []), { label: page.label, href: page.path }];
  return {
    crumbs: page.path === '/' ? [] : crumbs,
    labelFor: (path) => get(path).label,
    cardFor: (path) => { const p = get(path); return { href: p.path, label: p.label, summary: p.summary, image: p.image }; },
    children: (hub) => GROUPS.find((g) => g.href === hub.path).items.filter((path) => path !== hub.path && !(hub.childrenExclude || []).includes(path)),
    form,
  };
};

// ---- render ----
const report = [];
for (const page of all) {
  const c = ctx(page);
  const body = page.render ? page.render(c) : templates[page.template](page, c);
  const jsonLd = [organizationLd()];
  if (c.crumbs.length) jsonLd.push(breadcrumbLd(c.crumbs));
  if (page.schema === 'Service') {
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Service', name: page.h1 || page.label, serviceType: page.label,
      description: page.description, url: SITE.url + page.path, provider: { '@id': `${SITE.url}/#business` },
      areaServed: [{ '@type': 'State', name: 'Michigan' }, { '@type': 'Country', name: 'United States' }],
    });
  }
  const html = layout({ page, body: body + '\n' + templates.quoteBandHtml(), groups, assets, jsonLd });
  const out = join(dist, page.path, 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
  report.push({ page, html });
}

// ---- Page Not Found (served by Cloudflare Pages with a 404 status for unknown URLs) ----
{
  const page = { path: '/', label: 'Page Not Found', title: 'Page Not Found | Rivers Industrial Racks', description: 'The page you were looking for doesn’t exist or has moved.', noindex: true, noCanonical: true };
  const c = ctx(page);
  const body = [
    hero({ kicker: 'That page doesn’t exist or has moved.', title: 'Page Not Found', slides: ['welding'],
      buttons: [{ text: 'Go to Home', href: '/' }, { text: 'Request a Quote', href: '/request-a-quote/' }] }),
    linkCards({ heading: 'Find What You Need', pages: ['/racks/', '/carts/', '/fabrication/', '/capabilities/', '/industries/', '/contact/'].map(c.cardFor), gray: false }),
  ].join('\n');
  writeFileSync(join(dist, '404.html'), layout({ page: { ...page, path: '/404' }, body: body + '\n' + templates.quoteBandHtml(), groups, assets, jsonLd: [organizationLd()] }));
}

// ---- sitemap, robots, redirects ----
const indexable = report.filter(({ page }) => !page.noindex);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(({ page }) => `  <url><loc>${SITE.url}${page.path}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
const redirects = JSON.parse(readFileSync(join(root, 'src/redirects.json'), 'utf8'));
writeFileSync(join(dist, '_redirects'), Object.entries(redirects).map(([from, to]) => `${from} ${to} 301`).join('\n') + '\n');

// ---- checks ----
const errors = [];
const ids = new Map(report.map(({ page, html }) => [page.path, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]))]));
const unique = (label, pick) => {
  const seen = new Map();
  for (const { page, html } of report) {
    const v = pick(page, html);
    if (!v) { errors.push(`${page.path}: missing ${label}`); continue; }
    if (seen.has(v)) errors.push(`Duplicate ${label} on ${seen.get(v)} and ${page.path}: "${v}"`);
    seen.set(v, page.path);
  }
};
unique('title', (p) => p.title);
unique('meta description', (p) => p.description);
unique('H1', (p, html) => (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]);

for (const { page, html } of report) {
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) errors.push(`${page.path}: must have exactly one H1`);
  if (!html.includes(`<link rel="canonical" href="${SITE.url}${page.path}">`)) errors.push(`${page.path}: canonical missing`);
  if (/wp-content|wp-includes|elementor/i.test(html)) errors.push(`${page.path}: contains WordPress/Elementor code`);
  for (const [, href] of html.matchAll(/href="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:)/.test(href)) continue;
    const [path, hash] = href.split('#');
    const target = path === '' ? page.path : path;
    if (/\.\w+$/.test(target)) { if (!existsSync(join(dist, target))) errors.push(`${page.path}: missing file ${href}`); continue; }
    if (!byPath.has(target)) { errors.push(`${page.path}: broken link ${href}`); continue; }
    if (hash && !ids.get(target).has(hash)) errors.push(`${page.path}: broken anchor ${href}`);
  }
  for (const [, src] of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    for (const part of src.split(',')) {
      const url = part.trim().split(' ')[0];
      if (url.startsWith('/') && !existsSync(join(dist, url))) errors.push(`${page.path}: missing file ${url}`);
    }
  }
}
// Every page except Home must be in the main menu and in the footer.
const menuHtml = report[0].html.slice(report[0].html.indexOf('<ul class="menu">'), report[0].html.indexOf('</nav>'));
const footerHtml = report[0].html.slice(report[0].html.indexOf('<footer'), report[0].html.indexOf('</footer>'));
for (const p of all) {
  if (p.path === '/') continue;
  if (!menuHtml.includes(`href="${p.path}"`)) errors.push(`${p.path}: not in the main menu`);
  if (!footerHtml.includes(`href="${p.path}"`)) errors.push(`${p.path}: not in the footer`);
}

if (errors.length) {
  console.error(`Build checks failed (${errors.length}):\n  ${[...new Set(errors)].join('\n  ')}`);
  process.exit(1);
}
console.log(`Built ${report.length} pages (${indexable.length} in sitemap.xml). Links, anchors, images, titles, descriptions and H1s checked.`);
