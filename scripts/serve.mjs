// Minimal static server for previewing dist/ locally: node scripts/serve.mjs [port]
// Compresses text files with gzip, as real web hosts do, so speed measurements are realistic.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const port = Number(process.argv[2] || process.env.PORT || 4321);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.ico': 'image/x-icon',
};
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg']);

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = normalize(join(dist, path));
  if (!file.startsWith(dist)) { res.writeHead(403).end(); return; }
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith('/')) { res.writeHead(301, { Location: path + '/' }).end(); return; }
    file = join(file, 'index.html');
  }
  if (!existsSync(file)) {
    console.log('404', path);
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  const ext = extname(file).toLowerCase();
  let body = readFileSync(file);
  const headers = { 'Content-Type': types[ext] || 'application/octet-stream' };
  if (compressible.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
  }
  res.writeHead(200, headers);
  res.end(body);
}).listen(port, () => console.log(`Serving dist/ at http://localhost:${port}`));
