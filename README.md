# Rivers Industrial Racks: materialhandlingracks.com

A static rebuild of the WordPress/Elementor site at https://materialhandlingracks.com. It uses the same markup, styles, fonts, images and interactive behaviour, without WordPress.

## Commands

```bash
npm install          # once
npm start            # build and preview at http://localhost:4321
npm run build        # write the deployable site to dist/
npm test             # build, then run the desktop + iPhone browser tests
npm run images       # after adding images: make compressed .webp copies (the build uses them automatically)
npm run perf         # with `npm start` running: measure load speed on a simulated phone over slow 4G
```

`dist/` is plain HTML/CSS/JS and can be hosted anywhere static files are served (Netlify, Cloudflare Pages, GitHub Pages, any web host).

## Layout

| Path | What it is |
| --- | --- |
| `src/pages/` | One HTML file per page. `index.html` is `/`, `rack-repair/index.html` is `/rack-repair/`. |
| `src/partials/` | The shared site header and footer. Pages pull them in with `<!-- @include header -->` / `<!-- @include footer -->`. |
| `public/` | Copied unchanged into the site. Holds images, fonts, Elementor CSS/JS and our own scripts. |
| `public/wp-content/`, `public/wp-includes/` | Images and Elementor assets, kept at the same URLs as on WordPress so existing image links and search results keep working. |
| `public/fonts/` | Barlow, Oswald and Poppins, self-hosted (previously loaded from Google Fonts). |
| `public/assets/css/site.css`, `public/assets/js/site.js` | Our own styles and scripts, added to every page after Elementor's. Put fixes and new site-wide styling here. |
| `scripts/build.mjs` | Assembles pages and partials into `dist/` and optimizes them: highlights the current menu item, combines each page's stylesheets into one file, uses `.webp` images and lazy-loads images below the top of the page. |
| `tests/` | Playwright tests, run on desktop (1440×900) and on iPhone 13. |

## Editing

- **Text, images, sections:** edit the page's HTML in `src/pages/`. The markup is Elementor's, so its classes and data attributes control styling and behaviour. Copy an existing section to make a new one.
- **Header or footer:** edit `src/partials/`. The change applies to every page.
- **Page-specific styling:** each page loads its Elementor stylesheet from `public/wp-content/uploads/elementor/css/post-<id>.css`. Site-wide colours and fonts are in `post-8.css` (the Elementor kit).

## Speed

- Images are served as compressed `.webp` copies (12 MB of originals became 5 MB). Originals stay at their old URLs.
- Each page loads one combined stylesheet instead of about 25 separate files.
- Images further down the page load as the visitor scrolls. Carousels load all their slides just before they come into view.
- jQuery no longer blocks the first paint, and unused WordPress code (block styles, jQuery Migrate, emoji script) was removed.
- The host should serve files compressed (gzip or brotli). Netlify, Cloudflare Pages and most hosts do this automatically.

## Not wired up yet

- **Contact form:** it looks and validates exactly as before, but WordPress handled submissions. `public/assets/js/form-placeholder.js` currently stops the submission and shows a "please call us" message. Replace that file when a form service is chosen.
