import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
const quality = process.argv[2] || 'medium';
const secs = parseInt(process.argv[3] || '40');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const logs = [];
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) logs.push(m.type() + ': ' + m.text().slice(0, 400)); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '').slice(0, 600)));
await page.addInitScript((q) => { localStorage.clear(); localStorage.setItem('tlwh_settings_v1', JSON.stringify({ quality: q, timeScale: 60 })); }, quality);
await page.goto('http://localhost:5173/');
await page.waitForFunction(() => window.__game && window.__game.ui.ready, null, { timeout: 90000 });
await page.click('#btn-new');
await page.keyboard.down('KeyW');
const t0 = Date.now();
let step = 0;
while ((Date.now() - t0) / 1000 < secs) {
  await page.waitForTimeout(4000);
  step++;
  await page.evaluate((step) => {
    const g = window.__game;
    // look around a bit, hop through weather / time variants
    g.player.yaw += 0.4;
    if (step === 2) g.weather.setPreset('rain');
    if (step === 4) g.time.set(21);
    if (step === 6) g.weather.setPreset('fog');
    if (step === 8) { g.time.set(5.5); g.weather.setPreset('auto'); }
  }, step);
}
await page.keyboard.up('KeyW');
const info = await page.evaluate(() => { const g = window.__game; return { pos: [g.player.x.toFixed(0), g.player.z.toFixed(0)], dist: g.player.distanceWalked.toFixed(0), chunks: g.chunks.chunks.size, geos: g.renderer.info.memory.geometries, tex: g.renderer.info.memory.textures, hours: g.time.clock, q: g.q && Object.keys(g.q).length }; });
console.log(JSON.stringify(info));
console.log(logs.slice(0, 20).join('\n') || 'no console errors/warnings');
await browser.close();
