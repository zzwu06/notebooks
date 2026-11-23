import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
const files = new Set((await readdir('dist',{recursive:true})).map(path=>path.replaceAll('\\','/')));
const types = { html:'text/html; charset=utf-8', css:'text/css', js:'text/javascript',
  svg:'image/svg+xml', zip:'application/zip', json:'application/json', txt:'text/plain; charset=utf-8',
  woff2:'font/woff2', woff:'font/woff', ttf:'font/ttf' };
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  const file = path === '/' ? 'index.html' : path.slice(1);
  if (!files.has(file)) { res.writeHead(404); return res.end('Not found'); }
  try {
    const body = await readFile('dist/' + file);
    res.writeHead(200, { 'Content-Type':types[file.split('.').pop()] || 'application/octet-stream', 'Cache-Control':'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end('Build the site first'); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173'));
