/**
 * Lightweight OG-tag injection server.
 * - /color/?t=Name&c=HEX → injects theme name + dynamic OG image URL
 * - /color/og-image?c=HEX → serves a 1200x630 SVG square in the brand color
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 80;
const STATIC_ROOT = '/app/public';
const COLOR_INDEX = path.join(STATIC_ROOT, 'color', 'index.html');
const TYPE_INDEX = path.join(STATIC_ROOT, 'type', 'index.html');
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

let typeHtmlTemplate = '';
try {
  typeHtmlTemplate = fs.readFileSync(TYPE_INDEX, 'utf-8');
} catch (e) {
  console.error('Could not read type index.html:', e.message);
}

const HEX_RE = /^[0-9a-fA-F]{6}$/;

function generateOgSvg(hex) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#${hex}"/>
</svg>`;
}

function injectOgTags(html, themeName, brandHex) {
  const safeName = themeName.replace(/[<>"&]/g, c =>
    ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', '&': '&amp;' })[c]
  );

  const title = `${safeName} — OKLCH Theme Generator`;
  const description = `${safeName} — a color theme created with the OKLCH Theme Generator on standby.design. Perceptually uniform palettes, semantic tokens, shadows, and dark mode — ready to paste into any shadcn/ui app.`;

  // Dynamic OG image URL with brand color
  const imageUrl = brandHex
    ? `https://standby.design/color/og-image?c=${brandHex}`
    : `https://standby.design/color/og-image.png`;

  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${description}"`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${imageUrl}"`
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
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${imageUrl}"`
  );
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`
  );

  return html;
}

// Cache Fontshare catalog in memory (refreshed on restart)
let fontshareCache = null;
let fontshareFetchPromise = null;

function fetchFontshare() {
  if (fontshareFetchPromise) return fontshareFetchPromise;
  fontshareFetchPromise = new Promise((resolve) => {
    const https = require('https');
    https.get('https://api.fontshare.com/v2/fonts', (apiRes) => {
      const chunks = [];
      apiRes.on('data', (c) => chunks.push(c));
      apiRes.on('end', () => {
        fontshareCache = Buffer.concat(chunks);
        resolve(fontshareCache);
      });
    }).on('error', () => {
      resolve(fontshareCache || Buffer.from('{"fonts":[]}'));
    });
  });
  return fontshareFetchPromise;
}

// Pre-fetch on startup
fetchFontshare();

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Fontshare catalog proxy (avoids CORS)
  if (pathname === '/api/fonts') {
    fetchFontshare().then((data) => {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(data);
    });
    return;
  }

  // Dynamic OG image endpoint: /color/og-image?c=HEX → 1200x630 PNG
  if (pathname === '/color/og-image') {
    const hex = url.searchParams.get('c') || '';
    if (HEX_RE.test(hex)) {
      try {
        const sharp = require('sharp');
        const svg = Buffer.from(generateOgSvg(hex));
        sharp(svg).resize(1200, 630).png().toBuffer().then(png => {
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          });
          res.end(png);
        }).catch(() => {
          res.writeHead(500);
          res.end('Image generation failed');
        });
      } catch (e) {
        res.writeHead(500);
        res.end('sharp not available');
      }
      return;
    }
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  // /color/ with ?t= or ?c= → inject OG tags
  if ((pathname === '/color' || pathname === '/color/' || pathname.startsWith('/color/index')) &&
      (url.searchParams.has('t') || url.searchParams.has('c'))) {
    const themeName = url.searchParams.get('t') || '';
    const brandHex = url.searchParams.get('c') || '';
    if (themeName && colorHtmlTemplate) {
      const safeHex = HEX_RE.test(brandHex) ? brandHex : '';
      const html = injectOgTags(colorHtmlTemplate, themeName, safeHex);
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

  // /type SPA fallback — any /type/* path without a file extension serves index.html
  if ((pathname === '/type' || pathname.startsWith('/type/')) && !path.extname(pathname)) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(typeHtmlTemplate || 'Not found');
    return;
  }

  // Static file serving
  let filePath = path.join(STATIC_ROOT, pathname);
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
