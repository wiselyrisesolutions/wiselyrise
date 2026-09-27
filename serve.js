// Zero-dependency local development server for WiselyRise
// Supports clean URLs (e.g. /services -> /services.html, /about -> /about.html, /datewise -> /datewise/index.html)
// Runs on Node.js built-in http, fs, and path modules.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(ROOT, reqPath);

  // Check if direct file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return sendFile(res, filePath);
  }

  // Check if directory with index.html exists
  const dirIndex = path.join(filePath, 'index.html');
  if (fs.existsSync(dirIndex) && fs.statSync(dirIndex).isFile()) {
    return sendFile(res, dirIndex);
  }

  // Clean URLs support: check if path + .html exists
  const htmlPath = filePath + '.html';
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    return sendFile(res, htmlPath);
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
  res.end('<h1>404 Not Found</h1><p>The file ' + reqPath + ' was not found on the local server.</p><p><a href="/">Return Home</a></p>');
});

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(` WiselyRise Local Dev Server running at:`);
  console.log(` ${url}`);
  console.log(` Press Ctrl+C to stop.`);
  console.log(`======================================================\n`);

  // Auto-open browser on Windows
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  }
});
