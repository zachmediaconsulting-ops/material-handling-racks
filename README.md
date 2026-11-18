# Rivers Industrial Racks: materialhandlingracks.com

The Rivers Industrial Racks website, built as clean static HTML, CSS and a small amount of plain JavaScript. There's no WordPress, no Elementor, and no runtime libraries. The design matches the original site.

## Commands

```bash
npm install          # once
npm start            # build and preview at http://localhost:4321
npm run build        # build the site into dist/ and check it (links, titles, H1s, canonicals)
npm test             # build, then test all pages on desktop and iPhone
npm run images       # after adding photos to source-images/: make web-ready versions
npm run perf         # with npm start running: measure load speed on a simulated phone over slow 4G
```

`dist/` is the finished website and can be hosted on any static host (Netlify, Cloudflare Pages, GitHub Pages, any web server). `dist/_redirects` sends old WordPress image URLs to the new ones on Netlify and Cloudflare Pages.

## How the site is organised

| Path | What it is |
| --- | --- |
| `src/site.mjs` | Business facts: name, phone, address, hours. Change the phone number here and it changes everywhere. |
| `src/content/` | The text of every new page, one file per menu section. `index.mjs` sets the menu order. |
| `src/pages/` | Home and Rack Repair, which have custom layouts. |
| `src/templates.mjs` | Page layouts: service page, category hub, company page, contact, quote, gallery. |
| `src/components.mjs` | Shared sections: hero, red band, cards, gallery, flag banner, contact form. |
| `src/layout.mjs` | Top bar, header and menu, footer, and SEO tags on every page. |
| `src/assets/site.css`, `site.js` | All styling and behaviour (mobile menu, slideshow, carousel, fade-ins, form). |
| `source-images/` | Original photos. `npm run images` turns them into `public/images/` (desktop and phone sizes). |
| `docs/content-review.md` | Claims on new pages that the owner needs to confirm before launch. |

## Adding a page

1. Add an entry to the right file in `src/content/` (copy a similar page). Give it a unique `path`, `title`, `description` and `h1`.
2. Add its path to the group in `src/content/index.mjs`. It then appears in the menu, the footer, breadcrumbs, its category page and `sitemap.xml`.
3. Run `npm test`. The build fails if a link is broken or a title, description or H1 is duplicated.

Pages with `noindex: true` are reachable from the menu but hidden from search engines and left out of the sitemap. Use this for placeholder pages.

## Contact / quote form

The forms post to `functions/api/quote.js`, a Cloudflare Pages Function that emails each request (with any
attached drawings) through Resend. It needs the settings listed in `docs/launch.md`; without them the form
tells visitors to call instead of pretending to succeed. `npm test` also runs the function's own tests.

## Launching

See `docs/launch.md` for Cloudflare Pages, the domain move from SiteGround, and Resend.
