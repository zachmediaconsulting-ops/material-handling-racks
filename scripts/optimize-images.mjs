// Turns the originals in source-images/ into web-ready files in public/images/:
//   name.webp      up to 1600px wide (desktop)
//   name-800.webp  up to 800px wide (phones, cards, galleries)
// and writes src/images.json with each image's size (used for width/height attributes).
// Also makes the favicons. Skips images that are already up to date.
//
//   npm run images
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'source-images');
const out = join(root, 'public/images');
mkdirSync(out, { recursive: true });

const fresh = (target, source) => existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs;
const manifest = {};
let made = 0;

for (const file of readdirSync(src).sort()) {
  const { name, ext } = parse(file);
  if (!/^\.(jpe?g|png|webp)$/i.test(ext)) continue;
  const input = join(src, file);

  if (name === 'favicon') {
    for (const [size, target] of [[32, 'favicon-32.png'], [192, 'favicon-192.png'], [180, 'apple-touch-icon.png']]) {
      const path = join(root, 'public', target);
      if (!fresh(path, input)) { await sharp(input).resize(size, size).png().toFile(path); made += 1; }
    }
    continue;
  }

  const meta = await sharp(input).rotate().metadata();
  const graphic = /\.png$/i.test(ext);
  const webp = graphic ? { quality: 90, alphaQuality: 100, effort: 6 } : { quality: 78, effort: 6 };
  for (const [suffix, width] of [['', 1600], ['-800', 800]]) {
    const path = join(out, `${name}${suffix}.webp`);
    if (fresh(path, input)) continue;
    await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp(webp).toFile(path);
    made += 1;
  }
  const w = meta.autoOrient?.width ?? meta.width; const h = meta.autoOrient?.height ?? meta.height;
  manifest[name] = { width: Math.min(w, 1600), height: Math.round(h * Math.min(w, 1600) / w), small: w > 800 };
}

writeFileSync(join(root, 'src/images.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log(`${made} image files written, ${Object.keys(manifest).length} images in src/images.json`);
