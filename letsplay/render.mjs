// Usage: node render.mjs <startSec> <endSec> <out.mp4|frames-dir> [fps]   (or --stills t1,t2,...)
import http from 'http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
import { chromium } from 'playwright-core';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
await new Promise(res => srv.listen(0, res)); const port = srv.address().port;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on('console', m => { if (m.type() === 'error') console.error('PAGE:', m.text()); }); page.on('pageerror', e => console.error('PAGEERR:', e.message));
await page.goto(`http://localhost:${port}/letsplay/index.html`); await page.waitForFunction('window.ready === true', null, { timeout: 120000 });
const args = process.argv.slice(2);
if (args[0] === '--stills') {
  fs.mkdirSync('build/stills', { recursive: true });
  for (const t of args[1].split(',').map(Number)) { const u = await page.evaluate(t => window.renderAt(t), t); fs.writeFileSync(`build/stills/${t.toFixed(1).padStart(6, '0')}.jpg`, Buffer.from(u.split(',')[1], 'base64')); }
} else {
  const [a, b, out] = [Number(args[0]), Number(args[1]), args[2]]; const fps = Number(args[3] || 24);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n0 = Math.round(a * fps), n1 = Math.round(b * fps); const t0 = Date.now();
  for (let i = n0; i < n1; i++) { const u = await page.evaluate(t => window.renderAt(t), i / fps); if (!ff.stdin.write(Buffer.from(u.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if ((i - n0) % 240 === 0) console.log(`[${a}-${b}] frame ${i - n0}/${n1 - n0} ${((Date.now() - t0) / 1000 / Math.max(1, i - n0)).toFixed(3)}s/f`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close(); srv.close();
