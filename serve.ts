// A tiny static server for game/ (Node 22, standard library only), so the
// entry can be played locally without a build step: `node serve.ts` serves
// game/ on http://localhost:8080 (or --port N). It sends the MIME types a
// browser game needs and refuses any path outside game/. Development
// convenience only, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game', import.meta.url)));
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const requested = portIndex === -1 ? 8080 : Number(args[portIndex + 1]);
const port = Number.isInteger(requested) && requested > 0 && requested < 65536 ? requested : 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const joined = normalize(join(root, decoded === '/' ? 'index.html' : decoded));
  return joined === root || joined.startsWith(root + sep) ? joined : null;
}

createServer((request, response) => {
  const path = safePath(request.url ?? '/');
  if (!path) {
    response.writeHead(403, { 'content-type': 'text/plain' });
    response.end('forbidden');
    return;
  }
  let stat;
  try {
    stat = statSync(path);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  if (!stat.isFile()) {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
    return;
  }
  response.writeHead(200, { 'content-type': MIME[extname(path)] ?? 'application/octet-stream' });
  createReadStream(path).pipe(response);
}).listen(port, () => {
  console.log(`serve.ts: http://localhost:${port}/`);
});
