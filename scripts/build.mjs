// Builds the static site into dist/.
//  1. copies public/ as-is (images, fonts, CSS, JS)
//  2. for every src/pages/**/*.html:
//     - replaces <!-- @include name --> with src/partials/name.html
//     - marks menu links that point at the current page as active (same markup WordPress emitted)
//     - adds /assets/css/site.css after the Elementor styles and /assets/js/site.js at the end
//     - combines the page's stylesheets, in order, into one cached file (one download instead of ~25)
//     - points .jpg/.png images at their smaller .webp copy when one exists (npm run images)
//     - lazy-loads images below the top of the page
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'src/pages');
const partialsDir = join(root, 'src/partials');
const publicDir = join(root, 'public');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
cpSync(publicDir, dist, { recursive: true });

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

const partial = (name) => readFileSync(join(partialsDir, `${name}.html`), 'utf8').trimEnd();

// "index.html" -> "/", "rack-repair/index.html" -> "/rack-repair/"
const urlFor = (file) => '/' + relative(pagesDir, file).split(sep).join('/').replace(/index\.html$/, '');

function markActive(html, url) {
  const href = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(`<li class="(menu-item[^"]*)"><a href="${href}" class="elementor-item"`, 'g'),
    `<li class="$1 current-menu-item current_page_item"><a href="${url}" aria-current="page" class="elementor-item elementor-item-active"`,
  );
}

// --- images: /path/photo.jpg -> /path/photo.webp when the .webp exists and is smaller -------------
const webpCache = new Map();
function webpFor(path) {
  if (!webpCache.has(path)) {
    const original = join(publicDir, path);
    const webp = original.replace(/\.(jpe?g|png)$/i, '.webp');
    webpCache.set(path, existsSync(original) && existsSync(webp) && statSync(webp).size < statSync(original).size
      ? path.replace(/\.(jpe?g|png)$/i, '.webp') : path);
  }
  return webpCache.get(path);
}
// Matches /wp-content/... or /images/... image paths, also inside JSON with escaped slashes (\/).
const IMAGE_RE = /((?:\\?\/)(?:wp-content|images)(?:\\?\/)[^"'()\s,?]+?\.(?:jpe?g|png))(?=[?"'()\s,&]|$)/gi;
const useWebp = (text) => text.replace(IMAGE_RE, (m) => {
  const escaped = m.includes('\\/');
  const out = webpFor(escaped ? m.replace(/\\\//g, '/') : m);
  return escaped ? out.replace(/\//g, '\\/') : out;
});

// --- stylesheets: combine every <link rel=stylesheet> in <head>, in order --------------------------
const LINK_RE = /<link rel=['"]stylesheet['"][^>]*href=['"]([^'"]+)['"][^>]*>\n?/g;
function bundleCss(html) {
  const head = html.slice(0, html.indexOf('</head>'));
  const links = [...head.matchAll(LINK_RE)];
  if (links.length < 2) return html;
  const css = links.map(([, href]) => {
    const path = href.split('?')[0];
    let text = readFileSync(join(publicDir, path), 'utf8').replace(/@charset[^;]+;/gi, '');
    // url(...) inside a stylesheet is relative to that stylesheet: make it absolute.
    text = text.replace(/url\(\s*(['"]?)(?!data:|https?:|\/|#)([^'")]+)\1\s*\)/g,
      (_, q, ref) => `url(${q}${posix.normalize(posix.join(posix.dirname(path), ref))}${q})`);
    return `/* ${path} */\n${text}`;
  }).join('\n');
  const bundled = useWebp(css);
  const name = `/assets/css/bundle-${createHash('sha256').update(bundled).digest('hex').slice(0, 10)}.css`;
  writeFileSync(join(dist, name), bundled);
  let first = true;
  return html.replace(LINK_RE, (tag, href) => {
    if (!links.some(([t]) => t === tag)) return tag;
    if (!first) return '';
    first = false;
    return `<link rel="stylesheet" href="${name}">\n`;
  });
}

// --- images: load below-the-fold images only as the visitor scrolls near them --------------------
// Every <img> without a loading attribute gets loading="lazy", except ones marked
// fetchpriority="high" (the header logo) or data-eager (add that to an image at the top of a page).
const lazyImages = (html) => html.replace(/<img\b(?![^>]*\b(?:loading|fetchpriority|data-eager)=)/g, '<img loading="lazy"');

mkdirSync(join(dist, 'assets/css'), { recursive: true });
const pages = walk(pagesDir);
for (const file of pages) {
  const url = urlFor(file);
  let html = readFileSync(file, 'utf8').replace(/<!-- @include ([\w-]+) -->/g, (_, name) => partial(name));
  html = markActive(html, url);
  html = html.replace('</head>', '<link rel="stylesheet" href="/assets/css/site.css">\n</head>');
  html = html.replace('</body>', '<script src="/assets/js/site.js"></script>\n</body>');
  html = useWebp(html);
  html = lazyImages(html);
  html = bundleCss(html);
  const out = join(dist, relative(pagesDir, file));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
console.log(`Built ${pages.length} pages into dist/`);
