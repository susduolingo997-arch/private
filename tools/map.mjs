import { createRequire } from 'module';
const require = createRequire('/node-tools/node_modules/');
const { chromium } = require('playwright');
const [x0 = '-700', x1 = '900', z0 = '-2000', z1 = '150', scale = '0.6', name = 'map'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: Math.ceil((x1 - x0) * scale), height: Math.ceil((z1 - z0) * scale) } });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.addInitScript(() => { localStorage.setItem('tlwh_settings_v1', JSON.stringify({ quality: 'low' })); });
await page.goto('http://localhost:5173/');
await page.waitForFunction(() => window.__game && window.__game.ui && window.__game.ui.ready, null, { timeout: 90000 });
await page.evaluate(([x0, x1, z0, z1, sc]) => {
  const g = window.__game, w = g.world, T = w.terrain;
  const cv = document.createElement('canvas'); cv.width = Math.ceil((x1 - x0) * sc); cv.height = Math.ceil((z1 - z0) * sc);
  cv.style.cssText = 'position:fixed;left:0;top:0;z-index:999';
  document.body.appendChild(cv);
  const c = cv.getContext('2d');
  const X = (x) => (x - x0) * sc, Z = (z) => (z - z0) * sc;
  const step = 12;
  for (let z = z0; z < z1; z += step) for (let x = x0; x < x1; x += step) {
    const h = T.heightAt(x, z), fd = T.forestDensity(x, z), fo = T.fieldAt(x, z);
    let r = 120 + (h - 50) * 3, gg = 150 + (h - 50) * 3, b = 90 + (h - 50) * 3;
    if (fd > 0.3) { r *= 0.45; gg *= 0.7; b *= 0.45; }
    if (fo) { const k = fo.field.kind; if (k === 'wheat') { r = 210; gg = 180; b = 80; } else if (k === 'plowed') { r = 120; gg = 85; b = 60; } else if (k === 'pasture') { r = 130; gg = 190; b = 90; } else { r = 170; gg = 190; b = 80; } }
    const dw = w.waterDepthAt(x, z); if (dw > 0.05) { r = 60; gg = 110; b = 190; }
    c.fillStyle = `rgb(${Math.max(0, Math.min(255, r))|0},${Math.max(0, Math.min(255, gg))|0},${Math.max(0, Math.min(255, b))|0})`;
    c.fillRect(X(x), Z(z), step * sc + 1, step * sc + 1);
  }
  for (const r of w.roads.roads) {
    c.strokeStyle = r.surface === 'asphalt' ? '#333' : '#8a6a3a'; c.lineWidth = Math.max(1, r.width * sc); c.beginPath();
    for (let i = 0; i < r.n; i++) { const px = X(r.x[i]), pz = Z(r.z[i]); i ? c.lineTo(px, pz) : c.moveTo(px, pz); }
    c.stroke();
  }
  c.strokeStyle = '#d33'; c.lineWidth = 3;
  for (const b of w.roads.bridges) { c.beginPath(); c.moveTo(X(b.road.x[b.a]), Z(b.road.z[b.a])); c.lineTo(X(b.road.x[b.b]), Z(b.road.z[b.b])); c.stroke(); }
  for (const b of w.structures.buildings) {
    c.save(); c.translate(X(b.x), Z(b.z)); c.rotate(-b.rot); c.fillStyle = b.id === 'home' ? '#f0f' : b.kind === 'church' ? '#00f' : b.kind === 'shop' ? '#f80' : '#c33'; c.fillRect(-b.w / 2 * sc, -b.d / 2 * sc, b.w * sc, b.d * sc); c.restore();
  }
  c.fillStyle = '#000'; for (const k of w.structures.chunks.values()) for (const p of k.poles) c.fillRect(X(p.x) - 1, Z(p.z) - 1, 2, 2);
  c.fillStyle = '#ff0'; c.fillRect(X(6) - 3, Z(46) - 3, 6, 6);
}, [parseFloat(x0), parseFloat(x1), parseFloat(z0), parseFloat(z1), parseFloat(scale)]);
await page.screenshot({ path: `/tmp/${name}.png` });
await browser.close();
