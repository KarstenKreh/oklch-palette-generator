/**
 * Lightweight OG-tag injection server.
 * Serves static files from /app/public, but for /color/ requests
 * with a ?t= query param, injects the theme name into OG tags.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 80;
const STATIC_ROOT = '/app/public';
const COLOR_INDEX = path.join(STATIC_ROOT, 'color', 'index.html');
const ROOT_INDEX = path.join(STATIC_ROOT, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ico': 'image/x-icon',
};

let colorHtmlTemplate = '';
try {
  colorHtmlTemplate = fs.readFileSync(COLOR_INDEX, 'utf-8');
} catch (e) {
  console.error('Could not read color index.html:', e.message);
}

function injectOgTags(html, themeName) {
  const safeName = themeName.replace(/[<>"&]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c]
  );

  const title = `${safeName} — OKLCH Theme Generator`;
  const description = `I created "${safeName}" with the OKLCH Theme Generator on standby.design — perceptually uniform color palettes for shadcn/ui apps.`;

  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${description}"`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${description}"`
  );
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  return html;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // /color/ with ?t= param → inject OG tags
  if ((pathname === '/color' || pathname === '/color/' || pathname.startsWith('/color/index')) && url.searchParams.has('t')) {
    const themeName = url.searchParams.get('t') || '';
    if (themeName && colorHtmlTemplate) {
      const html = injectOgTags(colorHtmlTemplate, themeName);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      return;
    }
  }

  // /color SPA fallback — any /color/* path without a file extension serves index.html
  if ((pathname === '/color' || pathname.startsWith('/color/')) && !path.extname(pathname)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(colorHtmlTemplate || 'Not found');
    return;
  }

  // Static file serving
  let filePath = path.join(STATIC_ROOT, pathname);

  // Root index
  if (pathname === '/' || pathname === '') {
    filePath = ROOT_INDEX;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const stream = fs.createReadStream(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    });
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`OG server running on port ${PORT}`);
});
