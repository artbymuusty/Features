import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getOrBuildIndex } from './indexer.js';
import { searchCatalog } from './search.js';
import { getFeatureById } from './catalog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_DIR = path.resolve(__dirname, '../web');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

export function createServer(options = {}) {
  const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    // CORS headers for local development & Obsidian fetch
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. API: /api/index
    if (pathname === '/api/index') {
      const index = getOrBuildIndex();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(index));
      return;
    }

    // 2. API: /api/features
    if (pathname === '/api/features') {
      const q = reqUrl.searchParams.get('q') || '';
      const category = reqUrl.searchParams.get('category') || '';
      const tech = reqUrl.searchParams.get('tech') || '';
      const tag = reqUrl.searchParams.get('tag') || '';
      const maturity = reqUrl.searchParams.get('maturity') || '';

      const results = searchCatalog(q, { category, tech, tag, maturity });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
      return;
    }

    // 3. API: /api/features/:id
    if (pathname.startsWith('/api/features/')) {
      const id = pathname.replace('/api/features/', '').trim();
      const feature = getFeatureById(id);
      if (!feature) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Feature '${id}' not found` }));
        return;
      }

      // Read file contents if query ?content=true
      const detail = { ...feature };
      if (reqUrl.searchParams.get('content') === 'true') {
        detail._filesContent = {};
        for (const file of feature._meta.files) {
          const filePath = path.join(feature._meta.dirPath, file);
          try {
            detail._filesContent[file] = fs.readFileSync(filePath, 'utf8');
          } catch {
            detail._filesContent[file] = '[Binary or unreadable file]';
          }
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(detail));
      return;
    }

    // 4. Static files from /web
    const requestedExt = path.extname(pathname);
    let filePath = path.join(WEB_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!filePath.startsWith(WEB_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    // If client requested a specific file extension that does not exist, return 404
    if (requestedExt && !fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(WEB_DIR, 'index.html');
    }

    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  return server;
}

export function startServer(port = 8766, host = '127.0.0.1') {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      resolve({ server, port, host, url: `http://${host}:${port}` });
    });
  });
}
