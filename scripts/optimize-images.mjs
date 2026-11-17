// Creates a compressed .webp next to every .jpg/.jpeg/.png in public/wp-content/uploads
// (and public/images, for new images). The build then serves the .webp wherever the page
// references the original. Originals stay in place so old image URLs keep working.
//
//   npm run images            only converts images that have no .webp yet (or changed since)
//
// Photos are capped at 2048px on the long side: the widest the site shows them is 1440 CSS px
// (full-width backgrounds), and they sit under a coloured overlay.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['public/wp-content/uploads', 'public/images'].map((d) => join(root, d)).filter(existsSync);
const MAX = 2048;
// Icons that browsers and phones expect as PNG.
const SKIP = /Favicon/i;

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});

let converted = 0; let before = 0; let after = 0;
for (const file of dirs.flatMap(walk)) {
  if (!/\.(jpe?g|png)$/i.test(file) || SKIP.test(file)) continue;
  const out = file.replace(/\.(jpe?g|png)$/i, '.webp');
  if (existsSync(out) && statSync(out).mtimeMs >= statSync(file).mtimeMs) continue;
  const isPng = /\.png$/i.test(file);
  await sharp(file)
    .rotate() // respect camera orientation
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .webp(isPng ? { quality: 90, alphaQuality: 100, effort: 6 } : { quality: 80, effort: 6 })
    .toFile(out);
  converted += 1; before += statSync(file).size; after += statSync(out).size;
}
console.log(converted
  ? `Converted ${converted} images: ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`
  : 'All images already optimized');
