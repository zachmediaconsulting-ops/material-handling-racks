// The page shell: <head>, top bar, header with navigation, footer.
import { esc, icon, img } from './lib.mjs';
import { SITE, addressLine } from './site.mjs';
import { contactCard, usesTurnstile } from './components.mjs';

const isCurrent = (href, path) => href === path;

// Photo shown on the left of each desktop mega menu.
const MEGA_IMAGE = {
  capabilities: 'welding', carts: 'blue-rack-and-orange-cart', racks: 'large-blue-shipping-rack',
  fabrication: 'repaired-racks-ready-to-ship', industries: 'forklift-moving-assembly-rack', company: 'yellow-automotive-handling-racks',
};

// Desktop: each section opens a full-width mega menu under the header.
// Phones: the same markup becomes an expandable list inside the hamburger menu.
function navMenu(groups, path) {
  return groups.map((g) => {
    const inGroup = g.href === path || g.items.some((i) => i.href === path);
    const subId = `sub-${g.key}`;
    const allLabel = g.allLabel || `All ${g.label}`;
    const items = [{ label: allLabel, href: g.href, all: true }, ...g.items.filter((i) => i.href !== g.href)];
    return `<li${inGroup ? ' class="is-current"' : ''}>
      <a class="menu__link" href="${g.href}"${isCurrent(g.href, path) ? ' aria-current="page"' : ''}>${esc(g.label)}</a>
      <button class="menu__sub-toggle" type="button" aria-expanded="false" aria-controls="${subId}" aria-label="Show ${esc(g.label)} pages">${icon('caret')}</button>
      <div class="mega" id="${subId}">
        <div class="mega__media" data-bg="/images/${MEGA_IMAGE[g.key]}-800.webp" aria-hidden="true"></div>
        <div class="mega__body">
          <a class="mega__title" href="${g.href}"${isCurrent(g.href, path) ? ' aria-current="page"' : ''}>${esc(allLabel)} <span aria-hidden="true">›</span></a>
          <ul class="submenu">${items.map((i) => `<li${i.all ? ' class="submenu__all"' : ''}><a href="${i.href}"${isCurrent(i.href, path) ? ' aria-current="page"' : ''}>${esc(i.label)}</a></li>`).join('')}</ul>
        </div>
      </div>
    </li>`;
  }).join('');
}

function footer(groups, path) {
  const main = [
    ['Home', '/'], ...groups.filter((g) => g.key !== 'company').map((g) => [g.label, g.href]),
    ['About', '/about/'], ['Gallery', '/gallery/'], ['Contact', '/contact/'], ['Request a Quote', '/request-a-quote/'],
  ];
  return `<footer class="footer">
  <div class="footer-main">
    <div class="col">
      <a class="footer-logo" href="/">${img('rivers-logo', SITE.name, { sizes: '422px' })}</a>
      <p>${esc(SITE.summary)}</p>
    </div>
    <div class="col footer-col--links">
      <h2 class="footer-title">Company Sitemap</h2>
      <ul class="footer-menu">${main.map(([label, href]) => `<li><a href="${href}"${isCurrent(href, path) ? ' aria-current="page"' : ''}>${label}</a></li>`).join('')}</ul>
    </div>
    <div class="col footer-contact" style="gap:0">
      <h2 class="footer-title" style="margin-bottom:20px">Contact Us</h2>
      ${contactCard()}
    </div>
  </div>
  <nav class="sitemap" aria-label="All pages">
    <div class="sitemap__grid">${groups.map((g) => `<details open><summary><a href="${g.href}">${esc(g.label)}</a></summary><ul>${g.items.map((i) => `<li><a href="${i.href}"${isCurrent(i.href, path) ? ' aria-current="page"' : ''}>${esc(i.label)}</a></li>`).join('')}</ul></details>`).join('')}</div>
  </nav>
  <div class="footer-spacer"></div>
  <p class="copyright">© ${new Date().getFullYear()} All Rights Reserved.</p>
</footer>`;
}

export function layout({ page, body, groups, assets, jsonLd = [] }) {
  const canonical = SITE.url + page.path;
  const robots = page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const ogImage = page.ogImage ? `${SITE.url}/images/${page.ogImage}.webp` : '';
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="${robots}">
${page.noCanonical ? '' : `<link rel="canonical" href="${canonical}">`}
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="icon" href="/favicon-192.png" sizes="192x192">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/barlow-700.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/barlow-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${assets.css}">
${jsonLd.map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="topbar">
  <ul>
    <li class="topbar__phone">${icon('phone')}<a href="${SITE.phoneHref}">${SITE.phone}</a></li>
    <li>${icon('bullseye')}Nationwide Delivery</li>
  </ul>
  <ul><li class="topbar__made">${icon('flag')}Made in America</li></ul>
</div>
<header class="header">
  <a class="logo" href="/" aria-label="${esc(SITE.name)} home">${img('rivers-logo', SITE.name, { eager: true, sizes: '(max-width: 1239px) 253px, 392px' })}</a>
  <nav class="nav" aria-label="Main">
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-panel" aria-label="Menu">${icon('menu', 'icon icon--open')}${icon('close', 'icon icon--close')}</button>
    <div class="nav__panel" id="nav-panel"><ul class="menu">${navMenu(groups, path(page))}</ul></div>
    <a class="btn header__cta" href="/contact/">Contact Us</a>
  </nav>
</header>
<main id="main">
${body}
</main>
${footer(groups, page.path)}
<a class="btn call-now" href="${SITE.phoneHref}" aria-label="Call now: ${SITE.phone}">${icon('phone')}Call Now</a>
<script src="${assets.js}" defer></script>
${usesTurnstile(body) ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>' : ''}
</body>
</html>
`;
}

const path = (page) => page.path;

// Structured data shared by every page (facts from the published site only).
export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    alternateName: SITE.legalName,
    url: `${SITE.url}/`,
    logo: `${SITE.url}/images/rivers-logo.webp`,
    image: `${SITE.url}/images/repaired-racks-ready-to-ship.webp`,
    telephone: '+1-989-600-9030',
    description: SITE.summary,
    address: { '@type': 'PostalAddress', streetAddress: SITE.address.street, addressLocality: SITE.address.city, addressRegion: SITE.address.region, postalCode: SITE.address.postal, addressCountry: SITE.address.country },
  };
}

export function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: SITE.url + c.href })),
  };
}

export const addressText = addressLine;
