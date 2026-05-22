import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key.startsWith('--') && value && !value.startsWith('--')) {
    args.set(key.slice(2), value);
    i += 1;
  }
}

const host = args.get('host') || '127.0.0.1';
const port = Number(args.get('port') || 5186);
const root = path.resolve(projectRoot, args.get('root') || 'dist');
const basePath = normalizeBase(args.get('base') || '/Archaeology-Dig-App/');

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

if (!existsSync(path.join(root, 'index.html'))) {
  console.error(`Built app not found at ${root}. Run npm.cmd run build first.`);
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);

  if (requestUrl.pathname === '/') {
    response.writeHead(302, { Location: basePath });
    response.end();
    return;
  }

  if (!requestUrl.pathname.startsWith(basePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  const relativeUrl = decodeURIComponent(requestUrl.pathname.slice(basePath.length));
  const safeRelative = relativeUrl.replace(/^\/+/, '') || 'index.html';
  const requestedPath = path.resolve(root, safeRelative);

  if (!requestedPath.startsWith(root)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Forbidden');
    return;
  }

  const filePath = resolveFilePath(requestedPath);
  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`Serving built playtest at http://${host}:${port}${basePath}`);
  console.log('No Vite watcher or hot reload is running. Press Ctrl+C to stop.');
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}

function normalizeBase(value) {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function resolveFilePath(requestedPath) {
  if (existsSync(requestedPath) && statSync(requestedPath).isFile()) return requestedPath;
  if (existsSync(requestedPath) && statSync(requestedPath).isDirectory()) {
    const indexPath = path.join(requestedPath, 'index.html');
    if (existsSync(indexPath)) return indexPath;
  }
  if (path.extname(requestedPath)) return null;
  return path.join(root, 'index.html');
}
