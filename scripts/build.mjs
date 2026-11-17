// Builds the static site into dist/.
//  - copies public/ as-is (images, fonts, CSS, JS)
//  - for every src/pages/**/*.html: replaces <!-- @include name --> with src/partials/name.html
//    and marks the menu links that point at the current page as active (same markup WordPress emitted).
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = join(root, 'src/pages');
const partialsDir = join(root, 'src/partials');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
cpSync(join(root, 'public'), dist, { recursive: true });

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

const pages = walk(pagesDir);
for (const file of pages) {
  const url = urlFor(file);
  let html = readFileSync(file, 'utf8').replace(/<!-- @include ([\w-]+) -->/g, (_, name) => partial(name));
  html = markActive(html, url);
  const out = join(dist, relative(pagesDir, file));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
console.log(`Built ${pages.length} pages into dist/`);
