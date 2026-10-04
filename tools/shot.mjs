// Headless smoke test + screenshots:  node tools/shot.mjs [name] [hour] [weather] [x,z,yaw] 
import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
const [name = 'a', hour = '', weather = '', pos = '', wait = '1500', quality = 'low', pitch = '0'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-webgl', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || m.type() === 'warning' || t.startsWith('[tlwh]')) logs.push(m.type() + ': ' + t); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '')));
await page.addInitScript((q) => { localStorage.setItem('tlwh_settings_v1', JSON.stringify({ quality: q, timeScale: 24 })); }, quality);
await page.goto('http://localhost:5173/', { waitUntil: 'load' });
await page.waitForFunction(() => window.__game && window.__game.ui && window.__game.ui.ready, null, { timeout: 120000 }).catch((e) => logs.push('init timeout'));
await page.evaluate(([hour, weather, pos]) => {
  const g = window.__game;
  g.began = true; g.paused = false; g.player.enabled = true; g.ui.hideMenu();
  if (hour) { g.time.set(parseFloat(hour)); }
  if (weather) g.weather.setPreset(weather);
  if (pos) { const [x, z, yaw] = pos.split(',').map(Number); g.player.teleport(x, z, yaw || 0); g.chunks.lastCx = NaN; }
  g.refreshSkyNow();
}, [hour, weather, pos]);
await page.evaluate((pitch) => {
  const g = window.__game; g.player.pitch = parseFloat(pitch);
  g.chunks.lastCx = NaN; g.chunks.update(g.player.x, g.player.z, 0);
  let n = 0; while (g.chunks.pendingCount && n++ < 2000) g.chunks.update(g.player.x, g.player.z, 1e6);
}, pitch);
await page.waitForTimeout(parseInt(wait));
await page.screenshot({ path: `/tmp/shot_${name}.png` });
const info = await page.evaluate(() => { const g = window.__game; return { fps: g.fpsAvg.toFixed(1), pending: g.chunks.pendingCount, chunks: g.chunks.chunks.size, calls: g.renderer.info.render.calls, tris: g.renderer.info.render.triangles, p: [g.player.x.toFixed(1), g.player.y.toFixed(1), g.player.z.toFixed(1)] }; });
console.log(JSON.stringify(info));
console.log(logs.slice(0, 25).join('\n'));
await browser.close();
