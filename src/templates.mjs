// Page templates for the new pages. Each builds a page from the shared components,
// so new pages look exactly like the existing ones.
import { esc, join } from './lib.mjs';
import { SITE, addressLine } from './site.mjs';
import {
  band, chips, contactButtons, contactCard, contactSection, flag, gallery, hero, linkCards, listCards, media, points, split,
} from './components.mjs';
import { CONTACT_TEXT, GALLERY } from './shared.mjs';

const QUOTE_BUTTONS = [
  { text: 'Request a Quote', href: '/request-a-quote/', style: 'lg', iconName: 'upload' },
  { text: `Call ${SITE.phone}`, href: SITE.phoneHref, style: 'lg' },
];

const ctaFlag = (cta = {}) => flag({
  title: cta.title || 'Request a Quote',
  text: cta.text || 'Send drawings, photos, or part details and we’ll review your application and recommend the right approach.',
  buttons: QUOTE_BUTTONS,
});

const heroFor = (p, crumbs) => hero({
  kicker: p.kicker,
  title: p.h1,
  size: p.h1.length > 30 ? 'md' : '',
  slides: p.slides || [p.image],
  breadcrumbs: crumbs,
  buttons: [{ text: 'Request a Quote', href: '/request-a-quote/' }],
});

const intro = (p) => split({
  heading: p.intro.heading,
  text: p.intro.text,
  aside: media(p.intro.image?.[0] || p.image, p.intro.image?.[1] || p.h1),
  after: contactButtons(),
});

function industriesSection(p, ctx) {
  const ind = p.industries;
  if (!ind) return '';
  const links = (ind.links || []).map((href) => ({ href, label: ctx.labelFor(href) }));
  return `<section class="section reveal"><div class="box"><div class="col center">
    <h2 class="h2">${esc(ind.heading)}</h2>
    <div class="text narrow">${ind.text.map((t) => `<p>${t}</p>`).join('')}</div>
    ${ind.uses ? `<ul class="chips chips--plain">${ind.uses.map((u) => `<li><span>${esc(u)}</span></li>`).join('')}</ul>` : ''}
    ${links.length ? chips(links) : ''}
  </div></div></section>`;
}

// ---------- service / product page ----------
export function servicePage(p, ctx) {
  return join([
    heroFor(p, ctx.crumbs),
    band(p.band),
    intro(p),
    p.applications && points({ heading: p.applications.heading, intro: p.applications.intro, items: p.applications.items, gray: true }),
    p.challenges && points({ heading: p.challenges.heading, intro: p.challenges.intro, items: p.challenges.items, cols: 2 }),
    listCards({
      intro: p.featuresIntro,
      cards: [
        { title: p.features.title || 'Key Features', groups: [{ items: p.features.items }] },
        { title: p.options.title || 'Customization Options', groups: [{ items: p.options.items }] },
      ],
    }),
    industriesSection(p, ctx),
    p.gallery && gallery({ images: p.gallery, gray: false }),
    linkCards({ heading: p.relatedHeading || 'Related Services & Equipment', pages: p.related.map(ctx.cardFor) }),
    ctaFlag(p.cta),
  ]);
}

// ---------- category hub ----------
export function hubPage(p, ctx) {
  return join([
    heroFor(p, ctx.crumbs),
    band(p.band),
    intro(p),
    linkCards({ heading: p.childrenHeading, intro: p.childrenIntro, pages: ctx.children(p).map(ctx.cardFor), id: 'All' }),
    p.approach && points({ heading: p.approach.heading, intro: p.approach.intro, items: p.approach.items, cols: p.approach.items.length === 4 ? 2 : 3 }),
    p.related && linkCards({ heading: p.relatedHeading || 'Related Services', pages: p.related.map(ctx.cardFor), gray: false }),
    ctaFlag(p.cta),
  ]);
}

// ---------- company / information page ----------
export function prosePage(p, ctx) {
  const blocks = p.sections.map((s) => join([
    s.heading && `<h2 class="h2">${esc(s.heading)}</h2>`,
    s.text && s.text.map((t) => `<p>${t}</p>`).join(''),
    s.list && `<ul>${s.list.map((li) => `<li>${li}</li>`).join('')}</ul>`,
    s.note && `<div class="note"><p>${s.note}</p></div>`,
  ])).join('\n');
  return join([
    heroFor(p, ctx.crumbs),
    band(p.band),
    p.intro ? intro(p) : '',
    `<section class="section reveal"><div class="prose text">${blocks}</div></section>`,
    p.related && linkCards({ heading: p.relatedHeading || 'Learn More', pages: p.related.map(ctx.cardFor) }),
    ctaFlag(p.cta),
  ]);
}

// ---------- contact ----------
export function contactPage(p, ctx) {
  return join([
    heroFor({ ...p, h1: p.h1 }, ctx.crumbs).replace('href="/request-a-quote/">Request a Quote', `href="${SITE.phoneHref}">Call ${SITE.phone}`),
    band(p.band),
    `<section class="section reveal"><div class="box split">
      <div class="col"><h2 class="h2">Call, Visit, or Send Us Your Project</h2><div class="text">
        <p><b>Phone:</b> <a href="${SITE.phoneHref}">${SITE.phone}</a><br><b>Hours:</b> ${SITE.hours}</p>
        <p><b>Address:</b> ${esc(addressLine)}</p>
        ${p.text.map((t) => `<p>${t}</p>`).join('')}
      </div></div>
      <div class="col">${contactCard()}</div>
    </div></section>`,
    contactSection({ heading: 'Let’s Talk About Your Material Handling Needs. Send us details.', text: CONTACT_TEXT, formId: 'contact-form' }),
    p.related && linkCards({ heading: 'Looking for Something Specific?', pages: p.related.map(ctx.cardFor), gray: false }),
  ]);
}

// ---------- request a quote ----------
export function quotePage(p, ctx) {
  return join([
    heroFor(p, ctx.crumbs).replace('<a class="btn" href="/request-a-quote/">Request a Quote</a>', `<a class="btn" href="#quote-form">Start Your Request</a>`),
    band(p.band),
    `<section class="section section--gray reveal" id="Contact"><div class="box contact">
      <div class="col"><h2 class="h2">${esc(p.formHeading)}</h2><div class="text">
        ${p.text.map((t) => `<p>${t}</p>`).join('')}
        <ul>${p.checklist.map((c) => `<li>${c}</li>`).join('')}</ul>
        ${p.after.map((t) => `<p>${t}</p>`).join('')}
      </div></div>
      <div class="col" id="quote-form">${ctx.form('quote-form')}</div>
    </div></section>`,
    p.related && linkCards({ heading: 'Not Sure What You Need?', pages: p.related.map(ctx.cardFor), gray: false }),
  ]);
}

// ---------- gallery ----------
export function galleryPage(p, ctx) {
  const extra = [
    ['rack-repair-before', 'Damaged material handling rack before repair'],
    ['rack-repair-after', 'Material handling rack after repair and rework'],
    ['repaired-racks-ready-to-ship', 'Repaired racks staged and ready to ship'],
    ['rack-changeover-hood', 'Rack reworked for a newly designed hood'],
    ['blue-rack-and-orange-cart', 'Custom blue rack on an orange cart'],
    ['yellow-automotive-handling-racks', 'Yellow automotive handling racks'],
    ['curtained-parts-carts', 'Parts carts with protective curtains'],
    ['welding', 'Welding a steel rack component'],
  ];
  return join([
    heroFor(p, ctx.crumbs),
    band(p.band),
    gallery({ heading: p.galleryHeading, intro: p.text, images: [...extra, ...GALLERY], id: 'Gallery' }),
    linkCards({ heading: 'Explore by Category', pages: p.related.map(ctx.cardFor) }),
    ctaFlag({ title: 'Have a Project Like These?', text: 'Send us photos, drawings, or part details and we’ll help you plan the right rack, cart, repair, or rework.' }),
  ]);
}


export { quoteBand as quoteBandHtml } from './components.mjs';
