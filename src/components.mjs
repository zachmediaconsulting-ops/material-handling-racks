// Reusable page sections. Every page is assembled from these, so the whole site shares one design.
import { esc, icon, img, imageInfo, imageUrl, join } from './lib.mjs';
import { SITE, addressLine } from './site.mjs';

// ---------- buttons ----------
export function button({ text, href, style = '', iconName = '' }) {
  const cls = ['btn', ...style.split(' ').filter(Boolean).map((s) => `btn--${s}`)].join(' ');
  return `<a class="${cls}" href="${esc(href)}">${esc(text)}${iconName ? icon(iconName) : ''}</a>`;
}
export const buttonRow = (buttons, cls = '') => `<div class="btn-row ${cls}">${buttons.map(button).join('')}</div>`;

// The two buttons used under most sections on the original site.
export const contactButtons = ({ drawings = '/request-a-quote/', contact = '/contact/' } = {}) => buttonRow([
  { text: 'Send Drawings', href: drawings, style: 'navy lg', iconName: 'upload' },
  { text: 'Contact Us', href: contact, style: 'lg', iconName: 'comment' },
]);

// ---------- hero ----------
// On phones the headline shrinks so its longest word fits the screen. `fit` is that word's width
// per 1px of font size (about 0.64 per character in Barlow Bold capitals).
export function hero({ kicker, title, size = '', slides, buttons = [], breadcrumbs = [], fit }) {
  const longest = Math.max(...title.split(/\s+/).map((w) => w.length));
  const fitRatio = fit || Math.max(4.8, +(longest * 0.64).toFixed(2));
  const slideImgs = slides.map((name, i) => {
    const { width, height } = imageInfo(name);
    return `<img src="${imageUrl(name)}" srcset="${imageUrl(name, '-800')} 800w, ${imageUrl(name)} ${width}w" sizes="100vw" width="${width}" height="${height}" alt=""${i === 0 ? ' class="is-active" fetchpriority="high"' : ' loading="lazy"'}>`;
  }).join('');
  const crumbs = breadcrumbs.length ? `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol>${breadcrumbs.map((b, i) => (i === breadcrumbs.length - 1
    ? `<li aria-current="page">${esc(b.label)}</li>` : `<li><a href="${b.href}">${esc(b.label)}</a></li>`)).join('')}</ol></nav>` : '';
  return `<section class="hero">
  <div class="hero__slides" aria-hidden="true">${slideImgs}</div>
  <div class="hero__inner">${crumbs}
    ${kicker ? `<p class="hero__kicker">${esc(kicker)}</p>` : ''}
    <h1 class="hero__title${size ? ` hero__title--${size}` : ''}" style="--fit:${fitRatio}">${esc(title)}</h1>
    ${buttons.length ? `<div class="hero__buttons">${buttons.map(button).join('')}</div>` : ''}
  </div>
</section>`;
}

export const band = (text, id) => `<section class="band"${id ? ` id="${id}"` : ''}><p>${esc(text)}</p></section>`;
export const quoteBand = () => `<section class="quote-band"><p>${esc(SITE.quote)}</p></section>`;

// ---------- media ----------
export const media = (name, alt, opts = {}) => `<div class="media">${img(name, alt, opts)}</div>`;

export function carousel(slides, label = 'Project photos') {
  return `<div class="carousel" role="region" aria-roledescription="carousel" aria-label="${esc(label)}">
  <div class="carousel__track">${slides.map(([name, alt], i) => `<figure class="carousel__slide" aria-label="${i + 1} of ${slides.length}">${img(name, alt)}</figure>`).join('')}</div>
  <button class="carousel__btn carousel__btn--prev" type="button" aria-label="Previous photo">${icon('prev')}</button>
  <button class="carousel__btn carousel__btn--next" type="button" aria-label="Next photo">${icon('next')}</button>
</div>`;
}

export const video = () => `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${SITE.video}?autoplay=1&amp;mute=1&amp;playsinline=1&amp;controls=1&amp;rel=0" title="Rivers Industrial Racks video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;

const paras = (list) => list.map((p) => `<p>${p}</p>`).join('');

// Heading + text on the left, picture/carousel/video on the right.
export function split({ id, heading, text, aside, after = '', cls = '' }) {
  return `<section class="section reveal ${cls}"${id ? ` id="${id}"` : ''}>
  <div class="box">
    <div class="split">
      <div class="col"><h2 class="h2">${esc(heading)}</h2><div class="text">${Array.isArray(text) ? paras(text) : text}</div></div>
      <div class="col">${aside}</div>
    </div>
    ${after}
  </div>
</section>`;
}

// ---------- sections of cards ----------
// Text cards with a red top edge. items: [{ h, p }] or challenge items [{ h, problem, solution }]
export function points({ heading, intro, items, gray = false, cols = 3 }) {
  const body = items.map((it) => (it.problem
    ? `<div class="point"><h3 class="h3">${esc(it.h)}</h3><span class="point__label">The challenge</span><p>${it.problem}</p><span class="point__label">How we solve it</span><p>${it.solution}</p></div>`
    : `<div class="point"><h3 class="h3">${esc(it.h)}</h3><p>${it.p}</p></div>`)).join('');
  return `<section class="section reveal${gray ? ' section--gray' : ''}">
  <div class="box">
    <div class="col center"><h2 class="h2">${esc(heading)}</h2>${intro ? `<div class="text narrow">${paras([].concat(intro))}</div>` : ''}</div>
    <div class="points${cols === 2 ? ' points--2' : ''}">${body}</div>
  </div>
</section>`;
}

// Clickable cards linking to other pages: [{ href, label, summary, image }]
export function linkCards({ heading, intro, pages, gray = true, id }) {
  return `<section class="section reveal${gray ? ' section--gray' : ''}"${id ? ` id="${id}"` : ''}>
  <div class="box">
    <div class="col center"><h2 class="h2">${esc(heading)}</h2>${intro ? `<div class="text narrow">${paras([].concat(intro))}</div>` : ''}</div>
    <div class="link-cards">${pages.map((p) => `<a class="link-card" href="${p.href}">${img(p.image, '', { sizes: '(max-width: 767px) 100vw, 380px' })}<span class="link-card__body"><span class="h3">${esc(p.label)}</span><p>${esc(p.summary)}</p><span class="link-card__more">Learn more ›</span></span></a>`).join('')}</div>
  </div>
</section>`;
}

export function gallery({ heading, intro, images, after = '', id, gray = false }) {
  return `<section class="section reveal${gray ? ' section--gray' : ''}"${id ? ` id="${id}"` : ''}>
  <div class="box">
    ${heading ? `<div class="col center col--top"><h2 class="h2">${esc(heading)}</h2>${intro ? `<div class="text narrow">${paras([].concat(intro))}</div>` : ''}</div>` : ''}
    <div class="gallery">${images.map(([name, alt]) => img(name, alt, { sizes: '(max-width: 767px) 50vw, 380px' })).join('')}</div>
    ${after}
  </div>
</section>`;
}

export function flag({ title, text, buttons = [], id }) {
  return `<section class="flag reveal"${id ? ` id="${id}"` : ''}>
  <h2 class="flag__title">${esc(title)}</h2>
  ${text ? `<p class="flag__text">${esc(text)}</p>` : ''}
  ${buttons.length ? buttonRow(buttons) : ''}
</section>`;
}

// White cards with red title bars on navy (the "Capabilities and Services" block).
// cards: [{ title, groups: [{ h, items: [string | { text, href }] }] }]
export function listCards({ intro, cards, after = '', id }) {
  const item = (it) => (typeof it === 'string' ? `<li>${esc(it)}</li>` : `<li><a href="${it.href}">${esc(it.text)}</a></li>`);
  return `<section class="section section--navy reveal"${id ? ` id="${id}"` : ''}>
  ${intro ? `<div class="lists-intro"><p>${esc(intro)}</p></div>` : '<div style="height:40px"></div>'}
  <div class="lists">${cards.map((c) => `<div class="list-card"><h2 class="list-card__title">${esc(c.title)}</h2>${c.groups.map((g) => `${g.h ? `<h3 class="h3">${g.href ? `<a href="${g.href}">${esc(g.h)}</a>` : esc(g.h)}</h3>` : ''}<ul>${g.items.map(item).join('')}</ul>`).join('')}</div>`).join('')}</div>
  ${after}
</section>`;
}

export function chips(links) {
  return `<ul class="chips">${links.map((l) => `<li><a href="${l.href}">${esc(l.label)}</a></li>`).join('')}</ul>`;
}

// ---------- contact form ----------
export function form(id = 'contact-form') {
  return `<form class="form" id="${id}" data-form action="#" method="post" enctype="multipart/form-data">
  <div class="field field--half"><label class="req" for="${id}-first">First</label><input id="${id}-first" name="first_name" placeholder="First" autocomplete="given-name" required></div>
  <div class="field field--half"><label class="req" for="${id}-last">Last</label><input id="${id}-last" name="last_name" placeholder="Last" autocomplete="family-name" required></div>
  <div class="field"><label for="${id}-title">Job Title</label><input id="${id}-title" name="job_title" placeholder="Job Title" autocomplete="organization-title"></div>
  <div class="field"><label class="req" for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" placeholder="Email" autocomplete="email" required></div>
  <div class="field field--half"><label class="req" for="${id}-phone">Phone</label><input id="${id}-phone" name="phone" type="tel" placeholder="Phone" autocomplete="tel" pattern="[0-9()#&amp;+*\\-=. ]+" title="Only numbers and phone characters (#, -, *, etc) are accepted." required></div>
  <div class="field field--half"><label for="${id}-type">Type</label><select id="${id}-type" name="phone_type"><option>Cell</option><option>Office</option></select></div>
  <div class="field"><label class="req" for="${id}-rush">Is your project a rush?</label><select id="${id}-rush" name="rush" required><option>Yes</option><option>No</option></select></div>
  <div class="field"><label for="${id}-details">Project Details</label><textarea id="${id}-details" name="details" rows="4" placeholder="Details Here..."></textarea></div>
  <div class="field field--80"><label for="${id}-files">Blueprint/Part/Model Drawings (Not Required)</label><input id="${id}-files" name="drawings" type="file" multiple></div>
  <button class="btn form__submit" type="submit">Send</button>
</form>`;
}

export function contactSection({ id = 'Contact', heading, text, formId }) {
  return `<section class="section section--gray reveal" id="${id}">
  <div class="box contact">
    <div class="col"><h2 class="h2">${esc(heading)}</h2><div class="text">${paras(text)}</div></div>
    <div class="col">${form(formId)}</div>
  </div>
</section>`;
}

export const contactCard = () => `<div class="contact-card">
  <iframe src="${esc(SITE.mapEmbed)}" title="Map: ${esc(addressLine)}" loading="lazy"></iframe>
  <div class="contact-card__info"><p><b>Phone:</b> <a href="${SITE.phoneHref}">${SITE.phone}</a></p><p><b>Address:</b> ${esc(addressLine)}</p></div>
</div>`;

