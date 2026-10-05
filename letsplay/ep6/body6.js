// ================================================================ EPISODE 6: "I LIVE IN A VOLCANO (it's fine)"  — meadow → ash trek → crater → meadow
TX.brick = ctex(16, (g, r, n) => { noisy(['#c8492e', '#b8402a', '#d65638', '#a83824'])(g, r, n); g.fillStyle = '#e8c9a0'; for (let y = 3; y < n; y += 4) { g.fillRect(0, y, n, 1); for (let x = (y % 8 === 3 ? 2 : 6); x < n; x += 8) g.fillRect(x, y - 3, 1, 3); } }, 61);
TX.basalt = ctex(16, (g, r, n) => { noisy(['#2e2a2e', '#38323a', '#262226', '#3f383f'])(g, r, n); g.fillStyle = '#1c181c'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1); }, 62);
TX.ash = ctex(16, (g, r, n) => { noisy(['#6e6864', '#7a7470', '#5f5a57', '#857f7a'])(g, r, n); g.fillStyle = '#ff8a2a'; g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 63);
TX.lava = ctex(16, (g, r, n) => { noisy(['#ff7a1a', '#ff9a2a', '#ffb43a', '#e8561a'])(g, r, n); g.fillStyle = '#ffe27a'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 13), Math.floor(r() * 15), 3, 1); g.fillStyle = '#c0300e'; for (let i = 0; i < 4; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1); }, 64);
TX.crust = ctex(16, (g, r, n) => { noisy(['#1e1a1c', '#262123', '#181416'])(g, r, n); g.fillStyle = '#ff6a1a'; let x = 3, y = 0; for (let i = 0; i < 18; i++) { g.fillRect(x, y, 1, 1); y++; x = (x + Math.floor(r() * 3) - 1 + n) % n; } }, 65);
TX.frost = ctex(16, (g, r, n) => { noisy(['#dff6ff', '#c8eeff', '#b4e4fa', '#e8fbff'])(g, r, n); g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); g.fillRect(x, y + 1, 3, 1); g.fillRect(x + 1, y, 1, 3); } }, 66);
MAT.brick = lam(TX.brick); MAT.basalt = lam(TX.basalt); MAT.ash = lam(TX.ash);
MAT.lava = lam(TX.lava, { emissive: '#ffffff', emissiveMap: TX.lava, emissiveIntensity: 0.95 });
MAT.crust = lam(TX.crust, { emissive: '#ffffff', emissiveMap: TX.crust, emissiveIntensity: 0.6 });
MAT.frost = lam(TX.frost, { emissive: '#5ab8ff', emissiveIntensity: 0.2 });
function labelTex(txt, bg, fg, size = 40) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 128, 128); g.fillStyle = fg; g.font = `bold ${size}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// --- new creature: Puff the Magmite (a tiny walking campfire)
function makeMagmite() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const rock = new THREE.MeshLambertMaterial({ color: '#4a3632' }), glow = new THREE.MeshBasicMaterial({ color: '#ff8a1e' }), flameM = new THREE.MeshBasicMaterial({ color: '#ffd23f' });
  box(0.8, 0.66, 0.74, 0, 0, 0.45, 0, body, rock);
  box(0.84, 0.07, 0.78, 0, 0, 0.27, 0, body, glow); box(0.07, 0.28, 0.78, 0, 0.27, 0.6, 0, body, glow); box(0.84, 0.06, 0.4, 0, 0, 0.7, -0.12, body, glow);
  for (const x of [-0.18, 0.18]) { box(0.24, 0.26, 0.04, '#ffffff', x, 0.54, 0.38, body); box(0.11, 0.15, 0.03, '#1a1010', x + 0.03, 0.52, 0.405, body); }
  box(0.14, 0.05, 0.03, '#2a0a0a', 0, 0.39, 0.385, body); box(0.1, 0.06, 0.03, '#ff9ec0', -0.3, 0.42, 0.385, body); box(0.1, 0.06, 0.03, '#ff9ec0', 0.3, 0.42, 0.385, body);
  for (const x of [-0.22, 0.22]) box(0.2, 0.12, 0.26, '#2e2220', x, 0.06, 0.05, body);
  const flame = pivot(body, 0, 0.78, 0);
  [[0, 0.16, 0, 0.3, 0.34], [-0.13, 0.08, 0.05, 0.18, 0.2], [0.13, 0.1, -0.05, 0.16, 0.24]].forEach(([x, y, z, w, h], i) => box(w, h, w, 0, x, y, z, flame, i ? glow : flameM));
  const light = new THREE.PointLight('#ff8a2a', 4, 7, 1.5); light.position.set(0, 0.9, 0.7); root.add(light);
  return { root, body, glow, flameM, flame, light };
}
const _cA = new THREE.Color(), _cB = new THREE.Color();
function poseMag(m, t, p, yaw, o = {}) {
  const cold = o.cold || 0, hop = o.hop ? Math.abs(Math.sin(t * 8)) * 0.35 : 0;
  m.root.position.set(p[0] + Math.sin(t * 70) * 0.04 * cold, p[1] + hop, p[2]); m.root.rotation.set(0, yaw, 0);
  const sq = 1 + Math.sin(t * 5) * 0.05; m.body.scale.set(1 / sq, sq, 1 / sq);
  m.glow.color.copy(_cA.set('#ff8a1e')).lerp(_cB.set('#6fe0ff'), cold); m.flameM.color.copy(_cA.set('#ffd23f')).lerp(_cB.set('#e4f8ff'), cold);
  m.flame.scale.setScalar(Math.max(0.15, 1 - cold * 0.85) * (o.big ? 2.2 : 1) * (1 + Math.sin(t * 17) * 0.1)); m.flame.rotation.y = t * 3;
  m.light.color.set(cold > 0.5 ? '#7fe8ff' : '#ff8a2a'); m.light.intensity = 4 * (1 - cold * 0.6);
}
function makeVolcano(parent, x, z, s) {
  const v = new THREE.Group(); v.position.set(x, 0, z); v.scale.setScalar(s); parent.add(v);
  const cols = ['#3a3236', '#332c30', '#41383c', '#2c2629'];
  for (let k = 0; k < 12; k++) { const w = 64 - k * 4.6; box(w, 3.2, w, cols[k % 4], 0, 1.6 + k * 3.2, 0, v).castShadow = false; }
  box(9.5, 0.8, 9.5, 0, 0, 38.6, 0, v, basic('#ff7a1e'));
  for (const [a, l] of [[0.3, 22], [-0.5, 16], [1.9, 18]]) { const s2 = box(1.4, l, 0.6, 0, Math.sin(a) * 14, 30 - l / 2 + 4, Math.cos(a) * 14 + 6, v, basic('#ff6a1a')); s2.rotation.set(0.62, a, 0); }
  return { v, top: [x, 39 * s, z] };
}
function heatAt(t) {
  if (t < E.trek) return 0.18; if (t < E.rim) return lerp(0.18, 0.5, seg(t, E.trek, E.rim));
  if (t < E.hot) return lerp(0.6, 1.0, seg(t, E.rim + 4, E.hot)); if (t < E.crust) return 1.15;
  if (t < E.rumble) return lerp(1.0, 0.06, seg(t, E.crust, E.crust + 8)); if (t < E.erupt) return lerp(0.06, 1.2, seg(t, E.rumble, E.erupt));
  if (t < E.flyEnd) return 1.3; return lerp(1.0, 0.55, seg(t, E.flyEnd, E.flyEnd + 20));
}
const puffCold = t => seg(t, E.crust + 3, E.shiver + 3) * (1 - seg(t, E.crack, E.erupt));
const leggyShiver = t => t < E.trek ? 1 : (win(t, E.shiver + 2, E.crack) ? 0.8 : 0);
const rideOn = (lp, yaw, lz, ly) => [lp[0] + Math.sin(yaw) * lz, lp[1] + ly, lp[2] + Math.cos(yaw) * lz];
// --- shared cast + props
const bloop6 = mkBurble('#e0577b'); const bHat = hardHat(bloop6.B);
const bBrick = new THREE.Mesh(GEO, MAT.brick); bBrick.scale.set(0.34, 0.3, 0.3); bBrick.position.set(0, -0.62, 0.2); bloop6.B.aR.add(bBrick);
const blue = box(0.4, 0.5, 0.03, '#5aa0ff', 0, -0.62, 0.2, bloop6.B.aR); box(0.3, 0.03, 0.01, '#ffffff', 0, 0.1, 0.02, blue); box(0.03, 0.3, 0.01, '#ffffff', 0.05, -0.02, 0.02, blue);
const card = box(0.42, 0.3, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop6.B.aR);
const L6 = makeLurk(); L6.light.intensity = 1.5;
const puff = makeMagmite();
const board = new THREE.Mesh(GEO, MAT.brick); board.scale.set(1.5, 0.3, 0.9); board.castShadow = true;
const houseG = new THREE.Group(), houseVS = new VSet(houseG, true);
{ const cells = [];
  for (let y = 1; y <= 4; y++) for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) {
    if (Math.abs(x) < 2 && Math.abs(z) < 2) continue; if (x === -2 && z === 0 && y <= 2) continue;
    const win_ = y === 3 && ((Math.abs(x) === 2 && Math.abs(z) === 1) || (Math.abs(z) === 2 && x === 0));
    cells.push([x, y, z, win_ ? 'glass' : 'brick']); }
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) cells.push([x, 5, z, 'brick']);
  cells.push([1, 6, 1, 'brick'], [1, 7, 1, 'brick']);
  cells.sort((a, b) => a[1] - b[1] || Math.atan2(a[2], a[0]) - Math.atan2(b[2], b[0]));
  cells.forEach((c, i) => houseVS.add(c[0], c[1], c[2], c[3], { t0: E.build + 0.6 + i * (E.buildEnd - E.build - 1.6) / cells.length }));
  houseVS.build(); }
const smoke = (t0, t1, dt, pos, o = {}) => { for (let t = t0; t < t1; t += dt) burst(t, typeof pos === 'function' ? pos(t) : pos, { n: o.n ?? 4, colors: o.colors ?? ['#9a9490', '#6e6864', '#b8b2ae'], speed: o.speed ?? 0.8, size: o.size ?? 0.35, life: o.life ?? 2.2, grav: o.grav ?? -1.2, up: o.up ?? 1.2 }); };

// ---------------------------------------------------------------- set A: the fountain meadow (start + finale)
const meadow = (() => {
  const g = mk('meadow'), st = new VSet(g), r = rng(601), PC = [6, -5];
  for (let x = -46; x <= 46; x++) for (let z = -46; z <= 22; z++) {
    const dx = Math.abs(x - PC[0]), dz = Math.abs(z - PC[1]);
    if (dx <= 4 && dz <= 4) { st.add(x, 0, z, 'castle'); continue; }
    st.add(x, 0, z, 'turf'); if (Math.max(dx, dz) === 5) st.add(x, 1, z, 'castle');
  }
  const trees = []; for (let i = 0; i < 110; i++) { const x = Math.round((r() - .5) * 88), z = Math.round(-44 + r() * 64); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; if (Math.abs(x - 2) < 15 && z > -16 && z < 14) continue; if (x > -18 && x < 6 && z < -8) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const pool = new THREE.Mesh(GEO, MAT.water); pool.scale.set(9, 0.9, 9); pool.position.set(PC[0], 1.0, PC[1]); g.add(pool);
  const fount = new THREE.Mesh(GEO, MAT.water); g.add(fount);
  const vol = makeVolcano(g, -10, -150, 1);
  const vl = new THREE.PointLight('#ff6a1a', 0, 120, 1); vl.position.set(-10, 45, -140); g.add(vl);
  for (let t = 0.2; t < E.splash; t += 0.5) burst(t, [PC[0], 5.4, PC[1]], { n: 8, colors: ['#bfe8ff', '#ffffff', '#5aa8ff'], speed: 2.5, size: 0.18, life: 1.0, grav: 10, up: 2 });
  smoke(0, E.flyEnd, 1.2, vol.top, { n: 3, size: 3, speed: 1.5, life: 7, up: 3, grav: -0.6 });
  smoke(E.flyEnd, 300, 0.35, vol.top, { n: 10, size: 3.5, speed: 7, life: 5, up: 9, grav: 2, colors: ['#ff7a1a', '#ffb43a', '#5a4a48', '#3a3236'] });
  for (let t = 0.3; t < E.trek; t += 0.55) burst(t, [-5 + Math.sin(t) * 0.6, 1.2, -1 + Math.cos(t) * 0.8], { n: 3, colors: ['#5aa8ff', '#bfe8ff'], speed: 0.6, size: 0.1, life: 0.6, grav: 9, up: 0 });
  burst(E.splash, [PC[0], 2, PC[1] - 1], { n: 220, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 10, size: 0.3, life: 1.6, grav: 12, up: 8 });
  smoke(E.splash + 0.5, 300, 0.4, t => [PC[0] + Math.sin(t * 7) * 3.5, 1.6, PC[1] + Math.cos(t * 5) * 3.5], { n: 3, colors: ['#ffffff', '#e8eef2', '#d0dae0'], size: 0.5, life: 2.4, up: 1.4, grav: -0.5, speed: 0.5 });
  const bPath = [[E.bloopIn, -26, 0.5, -60], [E.bloopIn + 3.6, -2.4, 0.5, 4.2]];
  for (let t = E.bloopIn; t < E.bloopIn + 3.8; t += 0.12) { const p = track(t, bPath).p; burst(t, [p[0], 0.7, p[2]], { n: 6, colors: ['#ff7a1a', '#ffb43a', '#ffe27a'], speed: 1.2, size: 0.25, life: 1.2, grav: 1, up: 0.6 }); }
  burst(E.leggyIn + 4.7, [1, 0.8, 6.2], { n: 40, colors: ['#3cc2a3', '#8b5a3c', '#ffffff'], speed: 5, size: 0.16, life: 0.8, grav: 12 });
  burst(E.tub - 4.4, [3.0, 1.6, -3.2], { n: 60, colors: ['#ffffff', '#ffb43a'], speed: 4, size: 0.3, life: 1.4, grav: -1, up: 3 });
  const C1 = [[0, 20, 9, 22, 3, 2, -4, 55], [7.5, 14, 6, 17, 2, 2, -3, 50], [7.51, -1.4, 2.4, 4.4, -5, 1.4, -1, 45], [14.5, -2.4, 2.2, 3.8, -5, 1.4, -1, 45],
    [14.51, 0.8, 0.8, 6.4, 0, 2.2, 1.8, 50], [20.3, 1.6, 1.0, 5.8, 0, 2.2, 1.8, 50], [20.31, 5.9, 2.0, 4.4, 3.5, 1.3, 0.5, 42], [25.9, 5.0, 1.8, 3.7, 3.5, 1.3, 0.5, 42],
    [25.91, 1.4, 2.6, 5.4, -9, 20, -150, 50], [30, 1.0, 2.6, 4.7, -9, 20, -150, 26]];
  const C2 = [[E.splash + 0.6, 14, 3.5, 7, 6, 1.5, -5, 50], [E.leggyIn, 12, 3, 5, 6, 1.5, -5, 50], [E.leggyIn + 0.01, 2.5, 0.8, 9.5, -3, 2.2, -30, 50], [E.land - 0.1, 2.2, 0.9, 10.5, -1, 1.5, 2, 50],
    [E.land, 5.0, 1.7, 5.0, 1, 0.6, 6.6, 45], [E.bloopIn - 0.1, 4.4, 1.5, 4.6, 1, 0.6, 6.6, 45], [251.5, 16, 8, 14, 5, 1, -4, 50], [E.tub - 0.1, 12, 6, 15, 5, 1, -4, 50],
    [E.tub, 3, 3.2, 8.5, 5, 1.6, -3, 50], [260.7, 4.2, 3.4, 9.2, 5, 1.6, -3, 50], [260.8, 1.4, 2.6, 1.6, 5, 1.3, -2.6, 45], [E.score - 0.1, 0.8, 2.4, 2.4, 5, 1.3, -2.6, 45],
    [276.5, -2.6, 2.0, 10.8, 0, 1.3, 5.4, 50], [281.3, -2.2, 2.0, 10.2, 0, 1.3, 5.4, 50], [281.4, 4.4, 2.6, 12.8, 2.6, 1.6, -2, 50], [E.logo, 3.8, 2.5, 11.6, 2.6, 1.6, -2, 50]];
  function update(t) {
    const late = t >= E.flyEnd; houseVS.update(t);
    fount.visible = t < E.splash; fount.scale.set(0.8, 4 + Math.sin(t * 6) * 0.3, 0.8); fount.position.set(PC[0], 1.4 + fount.scale.y / 2, PC[1]);
    vl.intensity = late ? 4000 * (1 + Math.sin(t * 9) * 0.2) : 0;
    houseG.visible = late; puff.root.visible = late; board.visible = win(t, E.bloopIn, E.bloopIn + 4);
    if (late) { parentTo(houseG, g); const k = seg(t, E.flyEnd, E.splash); const b = Math.sin(seg(t, E.splash, E.splash + 0.6) * Math.PI) * 0.6;
      houseG.position.set(PC[0], k < 1 ? 70 * (1 - k * k) : b, PC[1] - 1); houseG.rotation.set(k < 1 ? Math.sin(t * 3) * 0.3 : 0, k < 1 ? t * 2 : 0.1, k < 1 ? Math.cos(t * 2.4) * 0.3 : 0); }
    // leggy
    let lp = [-5, 0.5, -1], ly = 0.7, ls = 0.3;
    if (late) { const K = [[E.leggyIn, -8, 0.5, -70], [E.land, -1, 0.5, 3.2], [E.land + 3.8, -1, 0.5, 3.2], [E.land + 6, 3, 0.6, 1.5], [E.land + 8, 6.2, 0.4, -2.3]]; const w = walker(t, K); lp = w.p; ly = t > E.land + 7.6 ? Math.PI / 2 : w.yaw; ls = w.speed > 0.5 ? 3 : 0.4; }
    poseLurk(L6, t, lp, ly, ls); L6.root.position.x += Math.sin(t * 60) * 0.05 * leggyShiver(t); parentTo(L6.root, g);
    // puff
    if (late) { const onHead = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3)); let pp = onHead, py = ly, po = { big: true };
      if (t > E.tub - 5) { const k = seg(t, E.tub - 5, E.tub - 4.4); pp = [lerp(onHead[0], 3.0, k), lerp(onHead[1], 1.15, k) + Math.sin(k * Math.PI) * 1.2, lerp(onHead[2], -3.2, k)]; py = 0.6; po = { big: true, hop: t > E.tub }; }
      poseMag(puff, t, pp, py, po); parentTo(puff.root, g); }
    // hero
    const o = { t, p: [0, 0.5, 2], yaw: 0.15, mallet: false };
    if (!late) {
      if (t < 4) o.wave = true; else if (t < 7.5) o.hips = true;
      else if (t < 14.5) o.yaw = yawTo([0, 2], [-5, -1]);
      else if (t < 20.3) { o.hips = true; o.face = 'smug'; }
      else if (t < 25.9) o.yaw = yawTo([0, 2], [3.5, 0.5]);
      else { o.yaw = yawTo([0, 2], [-10, -150]); o.wave = true; }
    } else if (t < E.land) { o.p = rideOn(lp, ly, -0.3, 1.6); o.yaw = ly; o.sit = 1; o.panic = true; o.face = 'scared'; }
    else if (t < E.land + 0.7) { const k = seg(t, E.land, E.land + 0.7), a = rideOn(lp, ly, -0.3, 1.6); o.p = [lerp(a[0], 1, k), lerp(a[1], 0.5, k) + Math.sin(k * Math.PI) * 1.5, lerp(a[2], 6.2, k)]; o.yaw = 0; o.flat = k; o.face = 'soot'; }
    else if (t < E.land + 4) { o.p = [1, 0.5, 6.2]; o.yaw = 0; o.flat = 1; o.face = 'soot'; }
    else if (t < E.land + 6) { o.p = [1, 0.5, 6.2]; o.yaw = 0; o.sit = 1; o.face = 'soot'; }
    else { o.p = [1, 0.5, 6.2]; o.yaw = 0.25; o.face = 'soot'; if (win(t, E.tub, E.tub + 3.6)) o.wave = true; if (t > 281.4) { o.p = [4.6, 0.5, 5.0]; o.yaw = -0.1; o.hips = true; o.face = t > 284 ? 'soot' : 'smug'; } if (win(t, E.score, 276.5)) o.yaw = yawTo([1, 6.2], [5, -4]); }
    pose(hero, o); parentTo(hero.root, g);
    // bloop
    let bp = [3.5, 0.5, 0.5], by = -0.4, bo = {};
    if (win(t, 20.3, 25.9)) bo = { handOut: true };
    if (late) { bp = [-2.4, 0.5, 4.2]; by = 0.6; if (t < E.bloopIn) bp = [-26, -5, -60];
      if (win(t, E.bloopIn, E.bloopIn + 4)) { bp = track(t, bPath).p; bp[1] += 0.3; by = Math.atan2(23.6, 64.2); board.position.set(bp[0], 0.65, bp[2]); board.rotation.set(0, by, 0); parentTo(board, g); }
      if (win(t, E.tub, E.tub + 4)) bo = { hop: true };
      if (t > 276.5) { bp = [-0.8, 0.5, 5.0]; by = yawTo([-0.8, 5], [1, 6.2]); } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g);
    if (late && win(t, E.bloopIn, E.bloopIn + 4)) { bloop6.B.aL.rotation.set(0, 0, -1.3); bloop6.B.aR.rotation.set(0, 0, 1.3); }
    if (t > E.void - 1.6 && late) { const k = seg(t, E.void - 0.6, E.void); bloop6.B.aR.rotation.set(lerp(-2.6, -1.1, k * k), 0, 0); }
    bBrick.visible = !late; blue.visible = false; card.visible = late && t > 276.5;
    bHat.scale.set(late ? 1.3 : 1, late ? 0.35 : 1, late ? 1.3 : 1); bHat.rotation.z = late ? 0.25 : 0;
    bloop6.B.root.visible = true; let cam = camKeys(t, late ? C2 : C1);
    if (win(t, E.flyEnd, E.splash + 0.6)) cam = { p: [20, 5, 12], l: [houseG.position.x, Math.max(2, houseG.position.y), houseG.position.z], fov: 55 };
    if (win(t, E.bloopIn, 251.5)) { const b = bloop6.B.root.position; cam = { p: [b.x + 4.5, 2.4, b.z + 6], l: [b.x, 1.2, b.z], fov: 48 }; }
    if (win(t, E.score, 276.5)) { const a = lerp(0.2, 1.0, seg(t, E.score, 276.5)); cam = { p: [3 + Math.sin(a) * 18, 7, -2 + Math.cos(a) * 18], l: [3, 1, -3], fov: 50 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the ash trek (hazy orange)
const trek = (() => {
  const g = mk('trek'), st = new VSet(g), r = rng(602);
  for (let x = -45; x <= 80; x++) for (let z = -30; z <= 14; z++) {
    const h = Math.round(vnoise(x * 0.13, z * 0.13, 5) * 3.4 * clamp((Math.abs(z) - 4) / 6, 0, 1));
    const ty = Math.abs(z) <= 1 ? 'basalt' : (hash2(x, z, 9) < 0.02 && Math.abs(z) > 3 ? 'lava' : 'ash');
    st.add(x, h, z, ty); for (let y = h - 1; y >= 0; y--) st.add(x, y, z, 'basalt');
  }
  for (let i = 0; i < 40; i++) { const x = Math.round(-44 + r() * 120), z = Math.round((r() < 0.5 ? -1 : 1) * (5 + r() * 18)); const hh = 3 + Math.floor(r() * 4); for (let y = 1; y <= hh; y++) st.add(x, y + 2, z, 'basalt'); st.add(x + 1, hh + 1, z, 'basalt'); st.add(x - 1, hh, z, 'basalt'); }
  st.build();
  const vol = makeVolcano(g, 85, -80, 1.15);
  smoke(30, 62, 1.0, vol.top, { n: 3, size: 3.5, speed: 1.5, life: 7, up: 3, grav: -0.6 });
  const hx = t => -30 + 2 * clamp(t - 30, 0, 29.5);
  smoke(40.2, 48.5, 0.2, t => [hx(t), 0.6, 0], { n: 3, size: 0.18, life: 1.0, up: 1.4, grav: -1.5, speed: 0.4 });
  for (let i = 0; i < 6; i++) smoke(30 + i * 0.3, 62, 1.8, [-20 + i * 17, 1, (i % 2 ? -8 : 7)], { n: 2, size: 0.6, life: 3, colors: ['#ffffff', '#d8d0cc'], up: 2.5, grav: -0.8 });
  function update(t) {
    const x = hx(t), K = [[30, -30, 0.5, 0], [59.5, 29, 0.5, 0]];
    const w = walker(t, K, Math.PI / 2); const o = { t, p: w.p, yaw: Math.PI / 2, walk: w.walk, phase: w.phase, mallet: true };
    if (win(t, 41, 44.5)) { o.panic = true; o.face = 'scared'; } if (win(t, 45.6, 50)) o.face = 'smug';
    pose(hero, o); parentTo(hero.root, g);
    const bw = walker(t, K.map(k => [k[0], k[1] - 3.2, 0.5, 1.8]), Math.PI / 2); poseBurble(bloop6, t, bw.p, Math.PI / 2, { walk: bw.walk, phase: bw.phase * 1.4 }); parentTo(bloop6.B.root, g);
    bBrick.visible = true; blue.visible = card.visible = false; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0;
    const lw = walker(t, K.map(k => [k[0], k[1] - 6.5, 0.5, -2.6]), Math.PI / 2); poseLurk(L6, t, lw.p, Math.PI / 2 + Math.sin(t * 2) * 0.15, 2.5); parentTo(L6.root, g);
    puff.root.visible = houseG.visible = board.visible = false; bloop6.B.root.visible = true;
    let cam;
    if (t < 38) cam = { p: [x + 3, 2.6, 9], l: [x + 1, 1.4, 0], fov: 50 };
    else if (t < 45) cam = { p: [x + 6, 0.9, 1.2], l: [x, 1.8, 0], fov: 55 };
    else if (t < 52) cam = { p: [x - 8 + (t - 45) * 0.4, 16, 22], l: [x + 20, 4, -25], fov: 55 };
    else cam = { p: [x - 5.5, 3.8, 3.6], l: [85, 28, -80], fov: lerp(55, 34, ss(seg(t, 52, 62))) };
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: inside the crater (red glow)
const crater = (() => {
  const g = mk('crater'), st = new VSet(g), lakeG = new THREE.Group(); g.add(lakeG);
  const lk = new VSet(lakeG), cr = new VSet(lakeG, true), r = rng(603);
  const ledge = (x, z) => x >= 9 && x <= 18 && Math.abs(z) <= 5;
  const hf = (x, z) => { if (ledge(x, z)) return -5; const rr = Math.hypot(x, z); if (rr < 16) return null; return Math.min(9, Math.round(-6 + (rr - 16) * 1.3 + vnoise(x * 0.3, z * 0.3, 3) * 2)); };
  const sy = (x, z) => (hf(Math.round(x), Math.round(z)) ?? -8) + 0.5;
  for (let x = -32; x <= 32; x++) for (let z = -32; z <= 32; z++) {
    const h = hf(x, z), rr = Math.hypot(x, z);
    if (h === null) { lk.add(x, -8, z, 'lava'); st.add(x, -9, z, 'basalt');
      if (rr < 15.5) cr.add(x, -7.9, z, 'crust', { t0: E.crust + Math.hypot(x - 10, z + 2.8) * 0.28, t1: E.erupt, fly: [x * 0.5 + (r() - .5) * 4, 9 + r() * 10, z * 0.5 + (r() - .5) * 4], spin: [r() * 6, r() * 6, r() * 6], floor: -60, wob: [E.rumble, E.erupt] });
      continue; }
    st.add(x, h, z, ledge(x, z) ? 'basalt' : 'ash'); const bot = rr < 21 || ledge(x, z) ? -9 : h - 3; for (let y = h - 1; y >= bot; y--) st.add(x, y, z, 'basalt');
  }
  st.build(); lk.build(); cr.build();
  const lights = [[0, -4, 0], [8, -4, -8], [-8, -4, 8], [-7, -4, -7], [7, -4, 9]].map(p => { const l = new THREE.PointLight('#ff7a2a', 60, 34, 1.2); l.position.set(...p); g.add(l); return l; });
  // heat-o-meter
  const meter = new THREE.Group(); meter.position.set(12.4, -4.5, 3.8); g.add(meter);
  box(0.36, 2.4, 0.36, '#f4f4f4', 0, 1.5, 0, meter); const bulb = box(0.6, 0.6, 0.6, '#e8344e', 0, 0.3, 0, meter);
  const fill = box(0.22, 1, 0.22, 0, 0, 1, 0.1, meter, new THREE.MeshBasicMaterial({ color: '#ff3a3a' }));
  const note = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.02), new THREE.MeshBasicMaterial({ map: labelTex('FINE', '#ffe066', '#222', 46) })); note.position.set(0, 1.9, 0.2); note.rotation.z = 0.12; meter.add(note);
  // chill-o-matic
  const fan = new THREE.Group(); fan.position.set(9.6, -4.5, -2.8); fan.rotation.y = -Math.PI / 2; g.add(fan);
  for (const [x, y, w, h] of [[0, 2.6, 2.6, 0.4], [0, 0.4, 2.6, 0.4], [-1.1, 1.5, 0.4, 2.2], [1.1, 1.5, 0.4, 2.2]]) box(w, h, 0.5, 0, x, y, 0, fan, MAT.frost);
  box(0.4, 0.4, 0.9, 0, 0, 1.5, -0.4, fan, MAT.frost);
  const prop = pivot(fan, 0, 1.5, 0.15); for (let i = 0; i < 4; i++) { const b = box(0.3, 0.9, 0.06, '#5ff7ff', 0, 0.45, 0, pivot(prop, 0, 0, 0)); b.parent.rotation.z = i * Math.PI / 2; }
  const plug = box(0.9, 0.08, 0.08, '#222', 0.9, 0.05, -0.9, fan);
  // eruption column
  const col = new THREE.Mesh(GEO, MAT.lava); g.add(col);
  const colH = t => t < E.erupt ? 0 : 50 * Math.pow(seg(t, E.erupt, E.erupt + 5), 1.2);
  const rise = t => t < E.crack ? 0 : t < E.erupt ? 0.6 * seg(t, E.crack, E.erupt) : lerp(0.6, 3.4, seg(t, E.erupt, E.erupt + 10));
  // particles
  for (let k = 0; k < 7; k++) burst(E.build + 1 + k * 2.6, [14 + Math.sin(k) * 2.5, -3, Math.cos(k) * 2.5], { n: 10, colors: ['#c8492e', '#e8c9a0'], speed: 2.5, size: 0.12, life: 0.7, grav: 10 });
  burst(E.puff, [5, -7.5, 0.5], { n: 50, colors: ['#ff7a1a', '#ffe27a', '#ffb43a'], speed: 5, size: 0.2, life: 1, grav: 12, up: 5 });
  smoke(E.pet, E.pet + 4.2, 0.08, t => [9.6 + Math.sin(t * 9) * 0.2, -2.4, 1.2], { n: 4, colors: ['#ff6a1a', '#ffd23f', '#ff3d1a'], size: 0.16, life: 0.5, up: 2.2, grav: -2, speed: 0.6 });
  smoke(E.munch, E.munch + 1.4, 0.2, [10.6, -3.2, 3.4], { n: 4, colors: ['#5aa0ff', '#ffffff'], size: 0.1, life: 0.7, up: 1, grav: 9, speed: 1.2 });
  burst(E.hot, [12.4, -2.6, 3.9], { n: 60, colors: ['#ff3a3a', '#ffffff', '#c0c0c0'], speed: 6, size: 0.14, life: 1, grav: 12, up: 3 });
  smoke(E.hot, E.fan, 0.25, t => [10.3 + Math.sin(t * 5) * 0.3, -2.3, 1.6], { n: 2, colors: ['#bfe8ff', '#ffffff'], size: 0.09, life: 0.6, up: 0.5, grav: 9, speed: 0.8 });
  for (let t = E.chill; t < E.unplug; t += 0.3) for (let k = 0; k < 5; k++) burst(t + k * 0.12, [8.5 - k * 1.6, -3 + Math.sin(t * 3 + k) * 0.5, -2.8 + Math.cos(t * 2 + k) * 0.6], { n: 3, colors: ['#ffffff', '#bfe8ff', '#7fe8ff'], speed: 0.8, size: 0.12, life: 0.7, grav: 1, up: 0 });
  for (let k = 0; k < 18; k++) { const a = k * 2.4, rr = 3 + (k * 7) % 11; burst(E.crack + k * 0.7, [Math.cos(a) * rr, -6.5, Math.sin(a) * rr], { n: 30, colors: ['#ff7a1a', '#ffe27a', '#e8561a'], speed: 5, size: 0.22, life: 1.2, grav: 12, up: 7 }); }
  burst(E.erupt, [14, -4, 0], { n: 300, colors: ['#ff7a1a', '#ffe27a', '#e8561a', '#3a3236'], speed: 16, size: 0.35, life: 2.4, grav: 12, up: 10 });
  for (let t = E.erupt + 0.3; t < E.flyEnd; t += 0.35) burst(t, [14, -6 + colH(t), 0], { n: 24, colors: ['#ff7a1a', '#ffe27a', '#ffb43a'], speed: 7, size: 0.3, life: 1.4, grav: 12, up: 6 });
  for (let t = E.surf + 2; t < E.flyEnd; t += 0.15) { const a = (t - E.surf) * 0.8; burst(t, [Math.cos(a) * 8, -7 + rise(t), Math.sin(a) * 8], { n: 4, colors: ['#ffe27a', '#ff7a1a'], speed: 2, size: 0.2, life: 0.8, grav: 8, up: 2 }); }
  // camera script
  const C = [[E.rim, 2, 17, 40, 2, -6, 0, 55], [E.build - 0.1, 1, 15, 35, 4, -6, 0, 52],
    [86.0, 3.6, -5.6, 1.6, 12.5, -3.2, 0.5, 52], [90.9, 4.6, -5.4, 2.8, 12.5, -3.2, 0.5, 52], [91.0, 10.6, -2.6, 7.2, 12.4, -2.7, 3.8, 45], [100.3, 11.4, -2.8, 6.4, 12.4, -2.7, 3.8, 36],
    [100.4, 10.6, -0.6, -6.6, 6, -6.6, 0.4, 50], [104.4, 10.4, -1.0, -6.0, 7.5, -5.5, 0.6, 48], [104.5, 6.8, -3.9, 2.8, 9.3, -4.0, 0.6, 40], [112.7, 7.3, -3.8, 2.6, 9.4, -4.0, 0.7, 36],
    [112.8, 6.6, -2.6, 5.8, 9.8, -3.2, 1.0, 46], [117.0, 7.0, -2.7, 5.4, 9.8, -3.2, 1.0, 44], [117.01, 7.6, -3.2, 7.6, 10.4, -3.6, 3.2, 44], [126.3, 8.0, -3.1, 7.0, 10.4, -3.6, 3.6, 42],
    [126.4, 8.0, -2.0, -7.5, 11.8, -2.4, -4, 44], [132.3, 8.6, -2.2, -7.0, 11.8, -2.4, -4, 40], [132.4, 6.8, -3.3, 1.6, 10.3, -2.9, 1.6, 46], [141.1, 7.5, -3.4, 1.6, 10.3, -2.9, 1.6, 38],
    [141.2, 8.0, -1.0, -10.5, 10, -3.5, -2.2, 50], [150.9, 6.0, -1.4, -10.0, 10, -3.5, -2.2, 50], [151.0, -6, 7, 14, 5, -7, 0, 55], [156.1, -4, 6, 16, 5, -7, 0, 55],
    [156.2, 4.2, -3.8, 3.2, 10.3, -2.8, 0.4, 48], [160.5, 4.8, -3.8, 2.6, 10.3, -2.8, 0.4, 48], [160.6, 9.6, -2.4, -7.6, 11.8, -2.4, -4, 40], [169.5, 9.0, -2.4, -7.2, 11.8, -2.4, -4, 36],
    [169.6, 8.2, -2.8, 0.9, 12.5, -2.6, -3.4, 46], [173.5, 8.5, -2.8, 0.4, 12.5, -2.6, -3.4, 46], [173.6, -10, -5.6, -8, 10, -4, 0, 55], [176.3, -8, -5.2, -10, 10, -4, 0, 55],
    [176.4, 7.0, -3.2, 1.0, 10.3, -2.9, 0.6, 50], [188.0, 8.2, -3.3, 0.9, 10.3, -2.9, 0.6, 36], [188.01, -3, 3, 10, 6, -7, 0, 55], [192.5, -1, 2.5, 11, 6, -7, 0, 55],
    [192.6, 7.0, -2.8, -6.6, 9.8, -3.4, -2.6, 46], [199.9, 6.4, -2.6, -6.0, 9.8, -3.4, -2.6, 46], [200.0, -8, 4, 16, 6, -6, 0, 55], [204.5, -6, 3.5, 15, 6, -6, 0, 55],
    [204.6, 7.8, -3.4, 1.2, 10.1, -3.6, 1.5, 42], [207.9, 8.2, -3.4, 1.2, 10.1, -3.6, 1.5, 38],
    [E.erupt, -6, 4, 22, 12, 2, 0, 60], [E.surf - 0.1, -8, 8, 24, 12, 14, 0, 62], [E.jump, -8, 14, 10, 7, 12, 26, 55], [E.flyEnd, -7, 15, 12, 7, 16, 30, 55]];
  function update(t) {
    houseVS.update(t); parentTo(houseG, g); houseG.visible = t > E.build; houseG.rotation.set(0, 0, 0);
    houseG.position.set(14, -5 + colH(t), 0); if (t > E.erupt) houseG.rotation.set(Math.sin(t * 2) * 0.3 * seg(t, E.erupt, E.erupt + 3), t - E.erupt, 0);
    cr.update(t); lakeG.position.y = rise(t) + (win(t, E.rumble, E.erupt) ? Math.sin(t * 31) * 0.05 : 0);
    const crusted = win(t, E.crust + 3, E.crack); lights.forEach((l, i) => { l.intensity = (crusted ? 6 : 60) * (1 + Math.sin(t * 3 + i) * 0.15); });
    col.visible = t > E.erupt; const ch = colH(t); col.scale.set(5.2, ch + 3, 5.2); col.position.set(14, -8 + (ch + 3) / 2, 0);
    // meter
    const ht = Math.min(heatAt(t), 1.15); meter.visible = t > E.build + 6; fill.scale.y = Math.max(0.05, ht * 1.9); fill.position.y = 0.55 + fill.scale.y / 2;
    note.visible = t > 95.4 && t < E.hot; bulb.scale.setScalar(t > E.hot ? 0.001 : 1 + (t > E.hot - 3 ? Math.sin(t * 30) * 0.12 : 0)); fill.visible = t < E.hot || t > E.crust;
    // fan
    fan.visible = t > E.fan; fan.scale.setScalar(backOut(seg(t, E.fan, E.fan + 1.2))); const spin = t < E.chill ? 0 : t < E.unplug ? (t - E.chill) * 25 : (E.unplug - E.chill) * 25 + 8 * (1 - Math.exp(-(t - E.unplug)));
    prop.rotation.z = spin; const tip = seg(t, E.unplug + 0.2, E.unplug + 0.9); fan.rotation.set(0, -Math.PI / 2, -tip * tip * 1.5); fan.position.y = -4.5 + (t > E.erupt ? rise(t) : 0); if (t > E.erupt + 1) fan.visible = false;
    plug.visible = t < E.unplug;
    // --- leggy
    let lp = [13.5, -4.5, -4], ly = -Math.PI / 2, ls = 0.2;
    if (t < E.build) { lp = [-3.5, sy(-3.5, 27), 27]; ly = Math.PI; }
    if (t > 206) { const K = [[206, 13.5, -4.5, -4], [207, 10.5, -4.5, -3.5], [208.2, 10.6, -4.5, 2.6], [210, 11, -4.5, 5], [214, 9.5, sy(9.5, 17), 17], [218, 7, sy(7, 24), 24], [E.jump, 7, sy(7, 24), 24], [E.flyEnd, 6, sy(7, 24) + 9, 34]];
      const w = walker(t, K); lp = w.p; ly = w.speed > 0.1 ? w.yaw : Math.PI; ls = w.speed > 0.1 ? 3 : 0.5; if (t > E.jump) lp[1] = sy(7, 24) + Math.sin(seg(t, E.jump, E.flyEnd) * Math.PI * 0.8) * 7; }
    poseLurk(L6, t, lp, ly, ls); L6.root.position.x += Math.sin(t * 60) * 0.05 * leggyShiver(t); parentTo(L6.root, g);
    if (t > E.build && t < E.shiver) { L6.body.position.y = 0.8; L6.legs.forEach(l2 => l2.rotation.x = 0.3); }
    // --- puff
    puff.root.visible = t > E.puff; parentTo(puff.root, g);
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    let pp = [9.3, -4.5, 0.6], py = Math.PI / 2, po = { cold: puffCold(t) };
    if (t < E.puff + 1.8) { const k = seg(t, E.puff, E.puff + 1.8); pp = [lerp(5, 9.3, k), lerp(-8, -4.5, k) + Math.sin(k * Math.PI) * 3.5, lerp(0.5, 0.6, k)]; }
    if (win(t, 117.4, 120.5)) { const k = seg(t, 117.4, 120.5); pp = [lerp(9.3, 10.7, k), -4.5 + Math.abs(Math.sin(k * Math.PI * 3)) * 0.8, lerp(0.6, 2.9, k)]; py = 0; }
    if (win(t, 120.5, 124.6)) { pp = [10.7, -4.5, 2.9]; py = 0; po.hop = t > E.munch + 1.4; }
    if (t >= 124.6) { const k = seg(t, 124.6, 126.2); pp = [lerp(10.7, head[0], k), lerp(-4.5, head[1], k) + Math.sin(k * Math.PI) * 2.5, lerp(2.9, head[2], k)]; py = k < 1 ? 0 : ly; }
    if (t > E.erupt) po.big = true;
    poseMag(puff, t, pp, py, po);
    // --- hero
    const o = { t, p: [10.1, -4.5, 1.5], yaw: -Math.PI / 2, mallet: false };
    if (t < E.build) { o.p = [-1.5, sy(-1.5, 27.5), 27.5]; o.yaw = Math.PI; o.wave = t > 63; }
    else if (t < E.buildEnd) { const a = (t - E.build) * 0.45 + Math.PI; o.p = [14 + Math.cos(a) * 3.6, -4.5, Math.sin(a) * 3.6]; o.yaw = Math.atan2(-Math.sin(a), Math.cos(a)); o.walk = 1; o.phase = t * 9; o.mallet = true; o.swing = (t * 2.2) % 1; }
    else if (t < E.pet) { o.sit = 1; o.face = 'smug'; if (t > 91 && t < 100.4) o.headYaw = -1.4; if (t > 100.4) { o.face = 'normal'; o.sit = t < 104.5 ? 1 : 0; } }
    else if (t < E.pet + 4.2) { o.p = [10.2, -4.5, 1.4]; o.panic = t > E.pet + 0.3; o.hold = !o.panic; o.face = 'scared'; o.p[1] += Math.abs(Math.sin(t * 9)) * 0.3 * (o.panic ? 1 : 0); }
    else if (t < E.hot - 3.8) { o.p = [10.3, -4.5, 1.6]; if (t > 121) o.yaw = yawTo([10.3, 1.6], [10.7, 2.9]); if (t > 126.2) o.yaw = yawTo([10.3, 1.6], [12, -4]); }
    else if (t < E.fan) { o.p = [10.3, -4.5, 1.6]; o.face = 'scared'; o.lean = 0.15; }
    else if (t < E.fanEnd + 0.5) { o.p = [10.5, -4.5, -0.6]; o.yaw = Math.PI; o.block = 'frost'; o.swing = (t * 2.4) % 1; }
    else if (t < E.crust + 6.2) { o.p = [10.2, -4.5, 0.6]; o.hips = true; o.face = 'smug'; }
    else if (t < E.rumble) { o.p = [10.2, -4.5, 0.6]; o.yaw = yawTo([10.2, 0.6], [12, -4]); }
    else if (t < E.unplug - 0.8) { o.p = [10.2, -4.5, 0.6]; o.face = 'scared'; if (t > 176.4) o.yaw = -Math.PI / 2; }
    else if (t < E.unplug + 2) { o.p = [10.4, -4.5, -1.2]; o.yaw = Math.PI; o.swing = seg(t, E.unplug - 0.4, E.unplug + 0.3) * 0.6; o.face = 'scared'; }
    else if (t < E.crack) { o.p = [10.2, -4.5, 0.4]; o.face = 'smug'; }
    else if (t < 204.6) { o.p = [10.2, -4.5, 1.5]; o.panic = true; o.face = 'scared'; }
    else if (t < 208.2) { o.p = [10.2, -4.5, 1.5]; o.sit = 1; o.face = 'normal'; }
    else { o.p = rideOn(lp, ly, -0.3, 1.6); o.yaw = ly; o.sit = 1; o.panic = t > E.erupt - 0.5; o.face = 'scared'; }
    pose(hero, o); parentTo(hero.root, g);
    if (win(t, E.hot - 3.8, E.fan)) hero.root.scale.set(1.12, lerp(1, 0.82, seg(t, E.hot - 3.8, E.hot)), 1.12);
    // --- bloop
    let bp = [10.7, -4.5, 4.2], by = -Math.PI / 2, bo = {};
    if (t < E.build) { bp = [0.8, sy(0.8, 27), 27]; by = Math.PI; }
    else if (t < E.buildEnd) { const a = (t - E.build) * 0.45; bp = [14 + Math.cos(a) * 3.4, -4.5, Math.sin(a) * 3.4]; by = Math.atan2(-Math.sin(a), Math.cos(a)); bo = { walk: 1, phase: t * 14 }; }
    else if (win(t, 120.5, E.munch + 0.6)) bo = { handOut: true };
    else if (win(t, E.munch + 0.6, 128)) bo = { facepalm: true };
    else if (win(t, E.rumble, E.crack)) bo = { hop: true };
    if (t > E.crack) { const k = seg(t, E.crack + 0.5, E.crack + 2.8); bp = [lerp(10.7, 11.6, k), -4.5, lerp(4.2, 0, k)]; by = Math.PI / 2; bo = { angry: true }; }
    bloop6.B.root.visible = !(t > E.crack + 2.8 && t < E.surf);
    if (t >= E.surf) { const k = seg(t, E.surf, E.surf + 2), a = (t - E.surf) * 0.8, ring = [Math.cos(a) * 8, -7.1 + rise(t), Math.sin(a) * 8];
      const hp = [14, -5 + colH(E.surf), 0]; bp = [lerp(hp[0], ring[0], k), lerp(hp[1], ring[1], k) + Math.sin(k * Math.PI) * 4, lerp(hp[2], ring[2], k)]; by = -a; bo = {}; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g);
    board.visible = t > E.surf + 1.9; if (board.visible) { board.position.set(bp[0], bp[1] - 0.15, bp[2]); board.rotation.set(0, by, Math.sin(t * 4) * 0.12); parentTo(board, g); bloop6.B.aL.rotation.set(0, 0, -1.3); bloop6.B.aR.rotation.set(0, 0, 1.3); }
    bBrick.visible = t < E.build + 1; blue.visible = t > E.buildEnd && t < E.munch + 1; if (blue.visible) blue.scale.setScalar(1 - seg(t, E.munch, E.munch + 1));
    card.visible = false; const melt = seg(t, E.hot, E.hot + 2.5); bHat.scale.set(1 + melt * 0.3, 1 - melt * 0.65, 1 + melt * 0.3); bHat.rotation.z = melt * 0.25;
    let cam = camKeys(t, C);
    if (win(t, E.build, E.buildEnd)) { const a = (t - E.build) * 0.22 - 0.6; cam = { p: [14 + Math.cos(a) * 13, 1.5 + Math.sin(t * 0.3), Math.sin(a) * 13], l: [14, -3, 0], fov: 52 }; }
    if (win(t, 208, E.erupt)) cam = { p: [lp[0] - 6, lp[1] + 3.5, lp[2] - 5], l: [lp[0], lp[1] + 1.5, lp[2]], fov: 52 };
    if (win(t, E.surf, E.jump)) cam = { p: [bp[0] * 1.6, bp[1] + 3, bp[2] * 1.6], l: [bp[0], bp[1] + 0.6, bp[2]], fov: 50 };
    return { cam, hud: true, lava: true };
  }
  return { g, update };
})();
