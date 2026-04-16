/**
 * Lightweight static server for the hub (index.html) during local development.
 * Matches og-server.js behavior for the root route, without Docker paths or OG injection.
 * Run: node dev-hub.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5173;
const ROOT = __dirname;

// Map hub links (/color, /type, …) to their local Vite dev-server ports.
// In production nginx handles this routing; in dev each tool runs standalone.
const TOOL_PORTS = {
  color: 5177,
  type: 5174,
  shape: 5176,
  symbol: 5178,
  space: 5179,
  system: 5175,
  qa: 5180,
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

http
  .createServer((req, res) => {
    const [rawPath, query] = req.url.split('?');
    const urlPath = decodeURIComponent(rawPath);

    const toolMatch = urlPath.match(/^\/([^/]+)(\/.*)?$/);
    if (toolMatch && TOOL_PORTS[toolMatch[1]]) {
      const tool = toolMatch[1];
      const rest = toolMatch[2] || '/';
      const target = `http://localhost:${TOOL_PORTS[tool]}/${tool}${rest}${query ? '?' + query : ''}`;
      res.writeHead(302, { Location: target });
      res.end();
      return;
    }

    const safe = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
    let filePath = path.join(ROOT, safe === '/' ? 'index.html' : safe);

    fs.stat(filePath, (err, stat) => {
      if (err || stat.isDirectory()) {
        filePath = path.join(ROOT, 'index.html');
      }
      fs.readFile(filePath, (readErr, data) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': MIME[path.extname(filePath)] || 'text/plain',
          'Cache-Control': 'no-store',
        });
        res.end(data);
      });
    });
  })
  .listen(PORT, () => {
    console.log(`Hub dev server → http://localhost:${PORT}/`);
    console.log('Tool routes redirect to:');
    for (const [tool, port] of Object.entries(TOOL_PORTS)) {
      console.log(`  /${tool}  → http://localhost:${port}/${tool}/`);
    }
  });
