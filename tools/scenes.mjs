// node tools/scenes.mjs quality "name,hour,weather,x,z,yaw,pitch" ...
import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
const [quality, ...scenes] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message + '\n' + (e.stack || '')));
await page.addInitScript((q) => { localStorage.setItem('tlwh_settings_v1', JSON.stringify({ quality: q, timeScale: 24 })); }, quality);
await page.goto('http://localhost:5173/');
await page.waitForFunction(() => window.__game && window.__game.ui && window.__game.ui.ready, null, { timeout: 90000 });
for (const sc of scenes) {
  const [name, hour, weather, x, z, yaw, pitch, trainT] = sc.split(',');
  await page.evaluate((tt) => { window.__trainT = tt === undefined || tt === '' ? undefined : parseFloat(tt); }, trainT);
  await page.evaluate(([hour, weather, x, z, yaw, pitch]) => {
    const g = window.__game;
    g.began = true; g.paused = false; g.player.enabled = true; g.ui.hideMenu();
    g.timeFrozen = true;
    if (hour !== '') g.time.set(parseFloat(hour));
    g.weather.setPreset(weather || 'auto');
    if (weather) { g.weather.cloud = g.weather.override.cloud; g.weather.rain = g.weather.override.rain; g.weather.fog = g.weather.override.fog; g.weather.wind = g.weather.override.wind; g.weather.wet = g.weather.rain > 0.3 ? 0.9 : 0; }
    g.player.teleport(parseFloat(x), parseFloat(z), parseFloat(yaw || 0)); g.player.pitch = parseFloat(pitch || 0);
    g.chunks.lastCx = NaN; g.chunks.update(g.player.x, g.player.z, 0);
    let n = 0; do { g.chunks.update(g.player.x, g.player.z, 1e6); } while (g.chunks.pendingCount && n++ < 4000);
    g.chunks.update(g.player.x, g.player.z, 1e6); n = 0; while (g.chunks.pendingCount && n++ < 4000) g.chunks.update(g.player.x, g.player.z, 1e6);
    g.distant.prewarm(g.player.x, g.player.z);
    if (g.npcs) g.npcs.prewarm();
    g.refreshSkyNow();
    if (window.__trainT !== undefined) g.time.elapsedReal = window.__trainT;
  }, [hour, weather, x, z, yaw, pitch]);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `/tmp/sc_${name}.png` });
  const info = await page.evaluate(() => { const g = window.__game; const r = g.renderer; r.info.autoReset = false; r.info.reset(); r.setRenderTarget(null); r.render(g.scene, g.camera); const i = { calls: r.info.render.calls, tris: r.info.render.triangles, geos: r.info.memory.geometries, tex: r.info.memory.textures }; r.info.autoReset = true; return i; });
  console.log('shot', name, JSON.stringify(info));
}
console.log(logs.slice(0, 20).join('\n'));
await browser.close();
