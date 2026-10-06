// ================================================================ EPISODE 20: "THE TIME MACHINE (IT WORKS)" — the wrecked yard (Time Machine 2.0, a duck) → Day 1 (past me, Tock the clockwork owl, the first collapse was US) → the yard again (the house stands) → three of me
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
const faceTo = (p, q) => Math.atan2(q[0] - p[0], q[2] - p[2]), PI = Math.PI;
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// --- past me (green hoodie, propeller beanie) and future-future me (red hoodie, top hat)
function recolor(h, from, to) { h.root.traverse(o => { if (o.isMesh && !Array.isArray(o.material) && o.material.color && o.material.color.getHexString() === from) o.material = new THREE.MeshLambertMaterial({ color: to }); }); }
const twin = makeHero(); recolor(twin, 'ff8a2a', '#3cc26a'); recolor(twin, 'ffb36b', '#9dff8a');
box(0.72, 0.2, 0.72, '#2e8a4a', 0, 0.72, 0, twin.hd); box(0.08, 0.2, 0.08, '#ffe066', 0, 0.9, 0, twin.hd); const prop = pivot(twin.hd, 0, 1.0, 0); box(0.9, 0.04, 0.12, '#ff3d7f', 0, 0, 0, prop);
const third = makeHero(); recolor(third, 'ff8a2a', '#e8344e'); recolor(third, 'ffb36b', '#ff9a9a');
box(0.84, 0.06, 0.84, '#111', 0, 0.72, 0, third.hd); box(0.52, 0.6, 0.52, '#111', 0, 1.04, 0, third.hd); box(0.54, 0.1, 0.54, '#e8344e', 0, 0.82, 0, third.hd); box(0.3, 0.08, 0.04, '#ffffff', 0.1, 0.4, 0.33, third.hd);
// --- Tock: a clockwork owl that follows time travellers and ticks louder near a paradox
function makeTock() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), brass = '#d9a63a';
  box(0.8, 0.8, 0.6, brass, 0, 0, 0, body); box(0.58, 0.58, 0.04, '#fff8e0', 0, -0.04, 0.31, body); for (const x of [-0.3, 0.3]) box(0.14, 0.24, 0.14, brass, x, 0.5, 0, body);
  const hh = pivot(body, 0, -0.04, 0.34), mh = pivot(body, 0, -0.04, 0.345); box(0.05, 0.18, 0.02, '#222', 0, 0.09, 0, hh); box(0.035, 0.26, 0.02, '#222', 0, 0.13, 0, mh);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#5ff7ff' }); for (const x of [-0.17, 0.17]) box(0.16, 0.1, 0.05, 0, x, 0.32, 0.31, body, eyeM); box(0.1, 0.12, 0.08, '#ff8a2a', 0, 0.18, 0.34, body);
  const wL = pivot(body, -0.42, 0.2, 0), wR = pivot(body, 0.42, 0.2, 0); box(0.08, 0.6, 0.44, '#b07f20', -0.04, -0.24, 0, wL); box(0.08, 0.6, 0.44, '#b07f20', 0.04, -0.24, 0, wR);
  const key = pivot(body, 0, 0.05, -0.32); box(0.06, 0.06, 0.2, '#c0c0c8', 0, 0, -0.1, key); box(0.34, 0.22, 0.04, '#c0c0c8', 0, 0, -0.22, key);
  for (const x of [-0.18, 0.18]) box(0.14, 0.1, 0.22, '#ff8a2a', x, -0.45, 0.06, body);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hh, mh, wL, wR, key, eyeM }; }
function poseTock(k, t, p, yaw, o = {}) { k.root.position.set(p[0], p[1] + (o.fly ? Math.sin(t * 4) * 0.15 : 0), p[2]); k.root.rotation.set(0, yaw + (o.spin ? t * 14 : 0), 0);
  const f = o.fast ? 30 : 1; k.hh.rotation.z = -t * 0.5 * f; k.mh.rotation.z = -t * 6 * f; k.key.rotation.z = t * 3 * f;
  const fl = o.fly ? Math.sin(t * 22) * 0.9 : 0.1; k.wL.rotation.z = -fl; k.wR.rotation.z = fl; k.body.rotation.z = o.fast ? Math.sin(t * 40) * 0.2 : Math.sin(t * 2) * 0.05; k.eyeM.color.set(o.alarm ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : '#5ff7ff'); }
const tock = makeTock();
// --- props: the duck(s), Bloop's fish, the blueprint, Time Machine 2.0
function makeDuck() { const g = new THREE.Group(), y = new THREE.MeshLambertMaterial({ color: '#ffd23f' }); box(0.36, 0.26, 0.46, 0, 0, 0.13, 0, g, y); box(0.26, 0.24, 0.24, 0, 0, 0.36, 0.14, g, y); box(0.16, 0.06, 0.14, '#ff8a2a', 0, 0.32, 0.31, g); for (const x of [-0.09, 0.09]) box(0.04, 0.05, 0.02, '#111', x, 0.42, 0.27, g); return g; }
const duckA = makeDuck(), duckB = makeDuck(), duckC = makeDuck(), duckD = makeDuck(), rain = Array.from({ length: 36 }, makeDuck);
const fish = new THREE.Group(); box(0.24, 0.3, 0.6, '#ff9a2a', 0, 0, 0, fish); box(0.06, 0.34, 0.24, '#ff9a2a', 0, 0, -0.38, fish); box(0.05, 0.06, 0.06, '#111', 0.13, 0.06, 0.2, fish);
const blueprint = box(1.0, 0.75, 0.02, '#3d7bff', 0, 0, 0, new THREE.Group()); box(0.7, 0.04, 0.03, '#ffffff', 0, 0.12, 0, blueprint); box(0.04, 0.4, 0.03, '#ffffff', -0.2, -0.05, 0, blueprint); box(0.25, 0.04, 0.03, '#e8344e', 0.18, -0.18, 0, blueprint);
hero.aL.add(blueprint.parent); blueprint.parent.position.set(0.3, -0.7, 0.45); blueprint.parent.rotation.set(-1.0, 0, 0);
function dialTex(txt) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#081018'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#5ff7ff'; x.font = 'bold 34px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const booth = new THREE.Group(), boothBody = pivot(booth, 0, 0, 0), boothM = new THREE.MeshLambertMaterial({ color: '#2f6fd8' });
box(2.4, 3.4, 2.4, 0, 0, 1.7, 0, boothBody, boothM); box(2.5, 0.3, 2.5, '#1b2a6a', 0, 3.5, 0, boothBody); box(1.6, 1.4, 0.06, 0, 0, 2.3, 1.21, boothBody, new THREE.MeshLambertMaterial({ color: '#cfefff', emissive: '#5ff7ff', emissiveIntensity: 0.4 }));
box(2.46, 0.2, 2.46, '#ffd23f', 0, 0.9, 0, boothBody); box(0.6, 0.5, 0.06, '#ffd23f', -0.9, 3.0, 1.22, boothBody); for (let i = 0; i < 3; i++) box(0.12, 0.12, 0.06, ['#ff3d7f', '#ffe066', '#7cff6b'][i], -0.8 + i * 0.3, 1.3, 1.22, boothBody);
const DIALS = ['DAY 20', '-10 SEC', 'DAY 1', '???'], dialM = DIALS.map(y => new THREE.MeshBasicMaterial({ map: dialTex(y) })); const dial = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.36, 0.06), dialM[0]); dial.position.set(0.3, 3.1, 1.22); boothBody.add(dial);
const lever = pivot(boothBody, 1.25, 1.4, 0.6); box(0.1, 0.9, 0.1, '#c0c0c8', 0, 0.45, 0, lever); box(0.24, 0.24, 0.24, '#e8344e', 0, 0.92, 0, lever);
const crystalM = new THREE.MeshLambertMaterial({ color: '#5ff7ff', emissive: '#2fa8c0', emissiveIntensity: 0.8 }); box(0.5, 0.6, 0.5, 0, 0, 3.95, 0, boothBody, crystalM);
const boothLight = new THREE.PointLight('#5ff7ff', 0, 12, 1.4); boothLight.position.set(0, 4.6, 0.8); booth.add(boothLight);
const tarp = new THREE.Group(); box(2.9, 4.2, 2.9, '#7a8090', 0, 2.1, 0, tarp); box(3.0, 0.12, 3.0, '#c08a40', 0, 2.6, 0, tarp);
// --- house layouts: the good house (shared by Day 1's build and the present), the first hut, the wreck
function houseCells() { const c = [];
  for (let x = -4; x <= 4; x++) for (let z = -12; z <= -6; z++) c.push([x, 1, z, 'castle']);
  for (let x = -2; x <= 2; x++) for (let z = -5; z <= -4; z++) c.push([x, 1, z, 'plank']);
  for (let y = 2; y <= 7; y++) for (let x = -4; x <= 4; x++) for (let z = -12; z <= -6; z++) {
    const edge = x === -4 || x === 4 || z === -12 || z === -6; if (!edge) { if (y === 5) c.push([x, y, z, 'plank']); continue; }
    if (z === -6 && x === 0 && y <= 3) continue;
    const corner = (x === -4 || x === 4) && (z === -12 || z === -6), win = (y === 3 || y === 6) && (((z === -6 || z === -12) && Math.abs(x) === 2) || ((x === -4 || x === 4) && z === -9));
    c.push([x, y, z, corner ? 'log' : y === 5 ? 'castle' : win ? 'glass' : 'plank']); }
  for (let k = 0; k < 4; k++) for (let x = -5 + k; x <= 5 - k; x++) for (let z = -13 + k; z <= -5 - k; z++) { if (k < 3 && x > -5 + k && x < 5 - k && z > -13 + k && z < -5 - k) continue; if (x === 3 && z === -11) continue; c.push([x, 8 + k, z, 'slate']); }
  for (let y = 8; y <= 11; y++) c.push([3, y, -11, 'castle']);
  return c; }
const HOUSE = houseCells();
function hutCells() { const c = []; for (let y = 1; y <= 3; y++) for (let x = -2; x <= 2; x++) for (let z = -10; z <= -7; z++) { if (!(x === -2 || x === 2 || z === -10 || z === -7)) continue; if (z === -7 && x === 0 && y <= 2) continue; c.push([x, y, z, 'plank']); }
  for (let x = -3; x <= 3; x++) for (let z = -11; z <= -6; z++) c.push([x, 4, z, 'plank']); return c; }
function tree20(st, x, z, h, sap) { for (let y = 1; y <= h; y++) st.add(x, y, z, 'log'); const R = sap ? 1 : 2; for (let dx = -R; dx <= R; dx++) for (let dy = 0; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) if (Math.hypot(dx, dy, dz) <= R + 0.3 && hash2(x + dx, z + dz + dy * 7, 9) > 0.12) st.add(x + dx, h + dy + (sap ? 0 : -1), z + dz, 'leaf'); }
function field(g, past) { const st = new VSet(g); for (let x = -40; x <= 40; x++) for (let z = -36; z <= 22; z++) st.add(x, 0, z, !past && x === 0 && z > -4 && z < 16 ? 'path' : 'turf');
  for (const [x, z, h] of [[-14, -14, 5], [-18, -2, 6], [14, -16, 5], [18, -4, 6], [-12, 10, 5], [16, 12, 6], [-26, -20, 7], [24, -24, 6]]) tree20(st, x, z, past ? Math.max(2, h - 3) : h, past);
  st.build(); return st; }
const flowerC = ['#ff6fb8', '#ffe066', '#5ff7ff', '#ff8a5a']; function flowers(g) { const f = new THREE.Group(); g.add(f); for (let i = 0; i < 14; i++) { const x = -4.4 + (i % 7) * 1.45 + (i > 6 ? 0.7 : 0), z = i > 6 ? -3.2 : -2.6; if (Math.abs(x) < 1.2) continue; box(0.06, 0.4, 0.06, '#3cc26a', x, 0.7, z, f); box(0.24, 0.2, 0.24, flowerC[i % 4], x, 0.98, z, f); } return f; }
// HUD helper: the paradox meter
const paradoxAt = t => t < E.arrive ? null : t < E.meet ? 0.05 : t < E.collapse ? lerp(0.15, 0.45, seg(t, E.meet, E.collapse)) : t < E.teamUp ? 0.6 : t < E.highfive ? lerp(0.6, 0.92, seg(t, E.teamUp, E.highfive)) : t < E.glitchEnd ? 1 : t < E.home ? 0.12 : t < E.twinOut ? null : t < E.third ? 0.5 : t < E.duckRain ? 0.85 : 1;
function drawWarp(T) { for (const s of [E.warp, E.warpBack]) { if (!win(T, s, s + 5)) continue; const k = seg(T, s, s + 5), a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2);
  for (let i = 0; i < 18; i++) { const r = ((i * 60 + T * 600) % 1100), c = ['#5ff7ff', '#ff5cf0', '#ffe066', '#7cff6b'][i % 4]; ctx.save(); ctx.rotate(-T * 2 - i * 0.4); ctx.strokeStyle = c; ctx.lineWidth = 6 + r / 60; ctx.strokeRect(-r / 2, -r / 2.8, r, r / 1.4); ctx.restore(); }
  outlined(s === E.warp ? '← DAY 1' : '→ DAY 20', 0, 0, 64, '#ffffff', '#000', 10); ctx.restore(); } }
function drawGlitch(T) { if (!win(T, E.glitch, E.glitchEnd)) return; const r = rng(Math.floor(T * 12)); ctx.save();
  for (let i = 0; i < 9; i++) { const y = r() * H, h = 16 + r() * 60, dx = (r() - 0.5) * 120; ctx.drawImage(out, 0, y, W, h, dx, y, W, h); }
  ctx.fillStyle = `rgba(${r() < 0.5 ? '255,0,200' : '0,255,230'},${0.08 + r() * 0.1})`; ctx.fillRect(0, 0, W, H);
  if (Math.floor(T * 4) % 2) outlined('◀◀ REWIND?!', W / 2, H * 0.2, 44, '#ff5cf0', '#000', 8); ctx.restore(); }

// ---------------------------------------------------------------- set A: the yard (present day: the wreck, then the fixed house)
const yard = (() => {
  const g = mk('yard'); field(g, false);
  const wreckG = new THREE.Group(); g.add(wreckG); { const st = new VSet(wreckG);
    for (const [x, y, z] of hutCells().map(([x, y, z]) => [x * 1.6 | 0, y, z]).concat(HOUSE.filter(c => c[1] <= 3 && c[3] !== 'castle'))) { if (hash2(x, y * 13 + z, 4) < 0.3) continue; st.add(x, y, z, hash2(x, z, y) < 0.15 ? 'dark' : 'plank'); }
    for (let x = -5; x <= 5; x++) for (let z = -13; z <= -5; z++) if (hash2(x, z, 8) > 0.2) st.add(x, 4, z, 'slate');
    st.build(); wreckG.rotation.set(0.07, 0.1, 0.17); wreckG.position.set(0.6, -0.9, 0);
    const pud = new THREE.Mesh(GEO, MAT.water); pud.scale.set(7, 0.2, 3); pud.position.set(-4, 0.52, -3); g.add(pud); wreckG.userData.pud = pud; }
  const newG = new THREE.Group(); g.add(newG); { const st = new VSet(newG); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(newG);
    const flag = pivot(newG, 3, 12.4, -11); box(0.08, 1.6, 0.08, '#c0c0c8', 0, 0.8, 0, flag); box(0.9, 0.5, 0.04, '#ff8a2a', 0.45, 1.3, 0, flag); box(0.4, 0.2, 0.05, '#3cc26a', 0.5, 1.3, 0, flag); }
  parentTo(booth, g); parentTo(tarp, g); [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => parentTo(d, g));
  burst(E.unveil, [7, 3, -2], { n: 60, colors: ['#ffe066', '#5ff7ff', '#ffffff'], speed: 6, size: 0.15, life: 1.2, grav: 6, up: 4 });
  burst(E.duckArrive, [7, 1.4, -0.6], { n: 40, colors: ['#5ff7ff', '#ff5cf0'], speed: 4, size: 0.12, life: 0.8, grav: 2, up: 2 }); burst(E.duckSend, [7, 2, -1.4], { n: 70, colors: ['#5ff7ff', '#ff5cf0', '#ffffff'], speed: 6, size: 0.14, life: 1, grav: 1, up: 3 });
  for (const t0 of [E.home - 0.2, E.twinOut, E.third]) burst(t0, [7, 1.4, -0.6], { n: 70, colors: ['#5ff7ff', '#ff5cf0', '#ffe066'], speed: 5, size: 0.14, life: 1, grav: 2, up: 3 });
  for (let t = E.bloopPaid + 0.5; t < E.calm; t += 0.6) burst(t, [4.9, 1.5, 0.6], { n: 6, colors: ['#9fdc5a', '#6aa83a'], speed: 0.8, size: 0.18, life: 1.4, grav: -1.5, up: 0.5 });
  burst(E.reveal2 + 0.2, [0, 9, -9], { n: 120, colors: ['#ffe066', '#ff6fb8', '#5ff7ff', '#7cff6b'], speed: 7, size: 0.16, life: 2, grav: 4, up: 6 });
  const RD = rain.map((_, i) => { const r = rng(2000 + i); return [-3 + r() * 12, -7 + r() * 11, E.duckRain + r() * 8, r() * 6]; });
  const C = [[0, 14, 9, 22, 0, 3, -6, 50], [4.9, 9, 7, 17, 0, 2.5, -8, 48], [5, -11, 3.4, 6, -1, 2.5, -9, 50], [12.1, 5, 2.8, 5, -1, 2, -9, 46], [12.2, -1, 1.2, -1.5, 0, 3.4, -9, 56], [19.5, 1.6, 1.0, -1.0, 0, 3.6, -9, 52],
    [19.6, 2.4, 2.6, 6, 6.6, 2, -2, 50], [23.3, 3.6, 2.4, 4.6, 7, 2, -2, 46], [23.4, 12, 3, 6, 7, 2.2, -2, 50], [28.3, 11, 2.6, 4, 7, 2.2, -2, 46], [28.4, 5.8, 2.0, 3.6, 7.6, 1.5, 0.4, 40], [33.3, 5.6, 1.9, 3.2, 7.6, 1.5, 0.4, 36],
    [33.4, 2.6, 2.8, 4.4, 6.6, 1.4, -1.2, 48], [40.1, 3.6, 2.6, 3.6, 6.8, 1.4, -1.2, 44], [40.2, 10, 1.3, 3.6, 5, 1.6, -0.5, 50], [44.5, 9.4, 1.5, 4.6, 5, 1.6, -0.5, 48], [44.6, 3, 1.8, 5, 5.2, 1.4, 1.4, 44], [48.5, 3.6, 1.8, 5.4, 5.2, 1.4, 1.4, 42],
    [48.6, -3, 2.6, 7, 2, 2.4, -4, 50], [54.3, -1, 2.4, 7.4, 2, 2.4, -4, 48], [54.4, 13, 4, 6, 7, 2, -2, 52], [60.4, 11, 3, 2.6, 7, 2.4, -2, 42], [E.arrive, 10, 3, 1.4, 7, 2.6, -2, 38],
    [E.home, 12, 3, 5, 6, 1.6, -1, 48], [196.9, 10, 2.6, 4, 5, 1.6, -1, 44], [197, 2.6, 2.1, -2.0, 4, 1.9, 1.4, 40], [201.1, 2.8, 2.0, -1.4, 4, 1.9, 1.4, 36],
    [201.2, 2, 1.4, 4, 0, 4.4, -9, 58], [203.9, 6, 4, 10, 0, 4.4, -9, 54], [204, 16, 10, 16, 0, 4, -9, 50], [206.9, -2, 11, 20, 0, 4, -9, 50], [207, -10, 3, 3, -1, 3, -9, 50], [212.3, 7, 3, 2, -1, 3, -9, 50],
    [212.4, 3.4, 2.1, 3.4, 4.6, 1.6, 0.2, 40], [218.5, 2.6, 2.1, 3.0, 4.6, 1.6, 0.2, 38], [218.6, -2, 2.4, 6, 3, 1.6, -1, 48], [222.3, 0, 2.4, 5.4, 5, 1.6, -1, 46],
    [222.4, 10.6, 2.2, 4.4, 7, 1.8, -0.4, 44], [228.3, 9.6, 2.2, 3.4, 6.4, 1.8, -0.4, 40], [228.4, 2.6, 2.2, 3.2, 6.6, 1.6, 0.4, 44], [233.3, 2.2, 2.4, 4.0, 6.6, 1.6, 0.4, 46],
    [233.4, 0, 3.4, 7, 0, 2.2, -5, 50], [246.3, 0, 2.6, 1.8, 0, 2.2, -5, 40], [246.4, -11, 5, 8, 0, 3, -7, 50], [252.5, -7, 4, 10, 0, 3, -7, 48], [252.6, 5.6, 1.4, 0, 3.4, 1.6, -3, 44], [256.5, 5.2, 1.6, 0.6, 3.4, 1.6, -3, 42],
    [256.6, 2, 2.4, 5, 7, 2, -2, 48], [261.3, 4.4, 2.4, 3, 7, 2, -2, 42], [261.4, 11, 1.4, 4, 7, 2.2, -0.6, 46], [269.5, 10, 1.8, 2.8, 7, 2.2, -0.6, 42], [269.6, 0, 3, 8, 4, 2, -2, 50], [274.3, 1, 3, 7, 4, 2, -2, 48],
    [274.4, 5.0, 1.6, -0.6, 3.4, 1.6, -3, 36], [276.1, 4.8, 1.6, -0.8, 3.4, 1.6, -3, 34], [276.2, 4, 2.6, 11, 3, 4.4, -3, 52], [285.6, 3, 2.4, 8.6, 3, 3, -3, 50], [E.logo, 3, 2.4, 8.6, 3, 3, -3, 50]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; const late = t > E.home, BP = [7, 0.5, -2], door = [7, 0.5, 0.2];
    wreckG.visible = wreckG.userData.pud.visible = !late; newG.visible = late;
    // Time Machine 2.0
    booth.position.set(...BP); booth.rotation.set(0, 0, 0); const hum = late ? win(t, E.whir, E.third + 1) : win(t, E.countdown, E.arrive);
    if (hum) booth.position.x += Math.sin(t * 60) * 0.04; lever.rotation.x = (win(t, E.duckSend - 0.3, E.duckSend + 1) || win(t, E.countdown + 1.6, E.arrive)) ? -1 : 0.4;
    dial.material = dialM[late ? (t > E.whir ? 3 : 0) : t > E.board ? 2 : t > E.test ? 1 : 0];
    boothLight.intensity = hum ? 30 + Math.sin(t * 30) * 20 : (win(t, E.duckArrive, E.duckArrive + 0.6) || win(t, E.duckSend, E.duckSend + 0.8) || win(t, E.twinOut, E.twinOut + 0.8) || win(t, E.home, E.home + 0.8)) ? 60 : 6;
    tarp.visible = !late && t < E.unveil + 1.5; tarp.position.set(BP[0], seg(t, E.unveil, E.unveil + 1.5) ** 2 * 18, BP[2]); tarp.rotation.set(0, seg(t, E.unveil, E.unveil + 1.5) * 3, seg(t, E.unveil, E.unveil + 1.5) * 0.8);
    [duckA, duckB, duckC, duckD, fish].forEach(d => { d.visible = false; parentTo(d, g); d.scale.setScalar(1); }); twin.root.visible = third.root.visible = tock.root.visible = false; rain.forEach(d => d.visible = false);
    let hp, hy, ho, bp, by, bo = {}, lp, ly, ls = 0.3, show = true;
    if (!late) {
      hp = [1.5, 0.5, 4]; hy = 0.4; ho = { face: 'smug', wave: t < 4 };
      if (t > E.tour) { const k = seg(t, E.tour, E.wreck); hp = L3([-7, 0.5, 2], [-1.6, 0.5, -0.6], k); hy = 2.4; ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'normal', headPitch: -0.2 }; }
      if (t > E.wreck) { hp = [3, 0.5, 0.4]; hy = -2.6; ho = { face: 'scared', headPitch: -0.3 }; }
      if (t > E.tarp) { hp = [4.2, 0.5, 1.4]; hy = faceTo(hp, BP); ho = { face: 'normal' }; } if (t > E.unveil) ho = { face: 'smug', wave: t < E.unveil + 3 }; if (t > E.invoice) ho = { face: 'scared', headPitch: 0.3 };
      if (t > E.test) { hp = [5.6, 0.5, 0.4]; hy = faceTo(hp, BP); ho = { face: 'smug', hold: true }; } if (t > E.duckArrive) ho = { face: 'scared', hold: t < E.duckSend - 1.2 };
      if (t > E.duckSend) ho = { face: 'scared', panic: t < E.itWorks }; if (t > E.itWorks) { hy = 0.6; ho = { face: 'smug', hips: true }; }
      if (t > E.plan) { hp = [2.4, 0.5, 0.6]; hy = -2.8; ho = { face: 'smug', wave: true }; }
      if (t > E.board) { const k = seg(t, E.board, E.countdown + 1); hp = L3([4.4, 0.5, 1.6], [7, 0.5, -1.2], k); hy = faceTo([4.4, 0, 1.6], BP); ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug' }; if (t > E.countdown + 1) show = false; }
      bp = [9, 0.5, 0.4]; by = -0.9; if (t > E.tarp) bo = { hop: t < E.unveil + 3, handOut: t > E.unveil }; if (t > E.invoice) { bo = { handOut: true }; card.visible = t < E.test; }
      if (t > E.test) { bp = [9.2, 0.5, 0.8]; bo = {}; } if (t > E.duckSend) bo = { hop: t < E.plan }; if (t > E.board) { const k = seg(t, E.board + 1, E.countdown + 1.4); bp = L3([9.2, 0.5, 0.8], [7.4, 0.5, -1.4], k); bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; }
      lp = [-8, 0.5, -0.4]; ly = 1.2; if (t > E.duckSend) { const k = seg(t, E.duckSend, E.itWorks - 0.4); lp = L3([-1, 0.5, 3.4], [5.2, 0.5, 1.6], k); ly = 1.6; ls = k < 1 ? 1.6 : 0.3; } if (t > E.board) { const k = seg(t, E.board + 1.5, E.countdown + 1.6); lp = L3([5.2, 0.5, 1.6], [6.8, 0.5, -1.0], k); ly = faceTo([5.2, 0, 1.6], BP); ls = k < 1 ? 1.4 : 0.3; }
      // the duck: one in the hand, one out of the machine ten seconds early
      duckB.visible = win(t, E.test, E.duckSend - 0.2); if (duckB.visible) { const k = seg(t, E.duckSend - 1.2, E.duckSend - 0.2); if (k <= 0) { parentTo(duckB, hero.aR); duckB.position.set(0, -0.86, 0.2); } else { duckB.position.set(...L3([5.9, 1.4, 0.1], [7, 1.6, -0.6], k)); duckB.position.y += Math.sin(k * PI) * 1.2; } }
      duckA.visible = t > E.duckArrive && t < E.arrive && show; if (duckA.visible) { if (t < E.itWorks) { const k = seg(t, E.duckArrive, E.duckArrive + 0.6); duckA.position.set(7, lerp(1.6, 0.5, k) + Math.sin(k * PI) * 0.8, lerp(-0.6, 0.6, k)); duckA.rotation.set(0, -0.4, 0); } else { parentTo(duckA, L6.body); duckA.position.set(0, 0.4, -0.2); duckA.rotation.set(0, 0, 0); } }
      muffin.root.visible = puff.root.visible = true; poseMuffin(muffin, t, [-4.6, 0.5, 3], 0.6, { hop: win(t, E.unveil, E.unveil + 3) || win(t, E.itWorks, E.plan) }); poseMag(puff, t, [-5.8, 0.6, 2], 0.8);
    } else {
      // home again: the house stands
      hp = L3([7, 0.5, -1], [4, 0.5, 1.4], seg(t, E.home + 0.4, E.look)); hy = t < E.look ? 0.4 : -2.77; ho = { walk: t < E.look ? 1 : 0, phase: t * 7, face: t < E.reveal2 ? 'scared' : 'smug', wave: win(t, E.reveal2, E.reveal2 + 4) };
      if (t > E.reveal2 + 5.8) { const k = seg(t, E.reveal2 + 5.8, E.bloopPaid); hp = L3([5, 0.5, -1.6], [-3, 0.5, -1.6], k); hy = -PI / 2; ho = { walk: k < 1 ? 1 : 0, phase: t * 5, face: 'smug', headYaw: 0.8 }; }
      if (t > E.bloopPaid) { hp = [2.6, 0.5, 0.4]; hy = PI / 2; ho = { face: 'scared', headPitch: 0.2 }; }
      if (t > E.calm) { const k = seg(t, E.calm, E.twinOut); hp = L3([0, 0.5, 1.4], [4, 0.5, 0.8], k); hy = PI / 2 - 0.3; ho = { walk: k < 1 ? 1 : 0, phase: t * 5, face: 'smug' }; }
      if (t > E.twinOut) { hp = [4.2, 0.5, 0.8]; hy = PI / 2; ho = { face: 'scared', panic: win(t, E.twinOut + 2, E.twinOut + 6) }; }
      if (t > E.porch) { hp = [-1, 1.5, -4.6]; hy = 0; ho = { face: 'smug', sit: 1 }; }
      if (t > E.whir + 1.4) { const k = seg(t, E.whir + 1.4, E.third); hp = L3([-1, 1.5, -4.2], [3, 0.5, -1], k); hy = faceTo([-1, 0, -4], BP); ho = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'scared' }; }
      if (t > E.third) { hp = [3, 0.5, -1]; hy = faceTo(hp, [6.4, 0, 0.8]); ho = { face: 'scared', panic: t > E.duckRain }; }
      bp = L3([7, 0.5, -1], [5.6, 0.5, -1.6], seg(t, E.home + 1, E.home + 3)); by = -0.6; bo = { walk: win(t, E.home + 1, E.home + 3) ? 1 : 0, phase: t * 8, hop: win(t, E.reveal2, E.reveal2 + 5) };
      if (t > E.bloopPaid) { bp = [4.6, 0.5, 0.4]; by = -PI / 2; bo = { handOut: true }; fish.visible = t < E.calm + 2; parentTo(fish, bloop6.B.aR); fish.position.set(0, -0.72, 0.3); fish.rotation.set(0, 0, 1.2); }
      if (t > E.calm) { bp = [6, 0.5, -3.6]; by = -0.4; bo = {}; } if (t > E.porch) { bp = [-3, 1.5, -4.5]; by = 0.2; bo = { hop: win(t, E.sunset, E.sunset + 3) }; } if (t > E.whir + 1) { bp = [-2, 0.5, -3]; by = 0.6; bo = { facepalm: t > E.third + 2 }; }
      lp = L3([7, 0.5, -1], [3.4, 0.5, -3], seg(t, E.home + 1.4, E.home + 4)); ly = 0.6; ls = win(t, E.home + 1.4, E.home + 4) ? 1.4 : 0.3;
      const nd = t > E.ducks ? 3 : 1; [duckA, duckC, duckD].forEach((d, i) => { d.visible = i < nd; parentTo(d, L6.body); d.position.set((i - (nd - 1) / 2) * 0.42, 0.4, -0.2); d.rotation.set(0, 0, 0); d.scale.set(1, i === 0 && win(t, E.squeak, E.squeak + 0.5) ? 0.5 : 1, 1); });
      // past me pops out to see how it turns out; then a third me
      if (t > E.twinOut) { twin.root.visible = true; let tp = L3([7, 0.5, -1], [6.4, 0.5, 0.8], seg(t, E.twinOut, E.twinOut + 0.8)), ty = PI * 1.6, to = { face: 'smug', wave: win(t, E.twinOut, E.twinOut + 2.4) };
        if (t > E.twinOut + 6) { ty = -2.6; to = { face: 'smug', hips: true }; } if (t > E.porch) { tp = [1, 1.5, -4.6]; ty = 0; to = { face: 'smug', sit: 1 }; }
        if (t > E.whir + 1.4) { const k = seg(t, E.whir + 1.4, E.third); tp = L3([1, 1.5, -4.2], [4.4, 0.5, -1.6], k); ty = faceTo([1, 0, -4], BP); to = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'scared' }; } if (t > E.third) { tp = [4.4, 0.5, -1.6]; ty = faceTo(tp, [6.4, 0, 0.8]); to = { face: 'scared', panic: t > E.duckRain }; }
        pose(twin, { t, p: tp, yaw: ty, ...to }); parentTo(twin.root, g); prop.rotation.y = t * 18;
        tock.root.visible = true; poseTock(tock, t, t < E.porch ? [lerp(7, 5.6, seg(t, E.twinOut, E.twinOut + 1)), 3.2, 0.2] : t < E.whir ? [2.4, 1.95, -4.6] : [4.6, 4.2, -2], t < E.porch ? 0 : 0.2, { fly: t < E.porch || t > E.whir, alarm: t > E.third, fast: t > E.duckRain });
        parentTo(tock.root, g); duckB.visible = true; parentTo(duckB, tock.body); duckB.position.set(0, -0.56, 0.3); }
      if (t > E.third) { third.root.visible = true; const k = seg(t, E.third, E.third + 1.2); pose(third, { t, p: L3([7, 0.5, -1], [6.4, 0.5, 0.8], k), yaw: faceTo([6.4, 0, 0.8], [3.6, 0, -1.4]), face: 'scared', panic: true, walk: k < 1 ? 1 : 0, phase: t * 9 }); parentTo(third.root, g); }
      rain.forEach((d, i) => { const [x, z, t0, sp] = RD[i]; if (t < t0) return; d.visible = true; const dt = t - t0; d.position.set(x, Math.max(0.5, 18 - dt * 9), z); d.rotation.set(dt < 2 ? dt * sp : 0, sp, dt < 2 ? dt * sp * 0.5 : 0); });
      muffin.root.visible = puff.root.visible = true; poseMuffin(muffin, t, [-4.4, 0.5, -3.4], 0.4, { hop: win(t, E.reveal2, E.reveal2 + 6) || t > E.duckRain }); poseMag(puff, t, [-5.4, 0.6, -2.4], 0.6, { big: win(t, E.sunset, E.ducks) });
    }
    hero.root.visible = show; if (show) { pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); }
    bloop6.B.root.visible = !(!late && t > E.countdown + 1.4); poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    L6.root.visible = !(!late && t > E.countdown + 1.6); poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); parentTo(muffin.root, g); parentTo(puff.root, g); bot.root.visible = false;
    if (late) L6.hd.rotation.x = win(t, E.squeak, E.squeak + 1) ? 0.4 : L6.hd.rotation.x;
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: Day 1 (golden morning; past me; the first collapse; building it right)
const past = (() => {
  const g = mk('past'); field(g, true);
  const hutG = new THREE.Group(); g.add(hutG); const hutVS = new VSet(hutG, true); { const cells = hutCells(), r = rng(2002);
    cells.forEach(([x, y, z, ty], i) => hutVS.add(x, y, z, ty, { t0: lerp(E.build1, E.build1End - 0.5, i / cells.length), t1: E.collapse + 0.4 + r() * 0.3, fly: [(r() - 0.7) * 6, 2 + r() * 4, (r() - 0.5) * 5], spin: [r() * 6, r() * 6, r() * 6], floor: 0.5, keep: true })); hutVS.build(); }
  const houseG = new THREE.Group(); g.add(houseG); const houseVS = new VSet(houseG, true); { const cells = HOUSE.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    cells.forEach(([x, y, z, ty], i) => houseVS.add(x, y, z, ty, { t0: lerp(E.buildTL, E.buildTLEnd - 0.5, i / cells.length) })); houseVS.build(); }
  const flw = flowers(g); const BP = [6, 0.5, -8.5];
  for (let t = E.build1; t < E.build1End; t += 0.5) burst(t, [0, 2, -8.5], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  for (let t = E.buildTL; t < E.buildTLEnd; t += 0.4) burst(t, [lerp(-4, 4, (t * 0.37) % 1), 1.5 + seg(t, E.buildTL, E.buildTLEnd) * 9, -9], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  burst(E.collapse + 0.5, [1, 2, -8.5], { n: 90, colors: ['#e0a95a', '#b88440', '#ffffff'], speed: 6, size: 0.22, life: 1.4, grav: 10, up: 5 });
  burst(E.tockIn, [6, 2.6, -7], { n: 40, colors: ['#ffd23f', '#5ff7ff'], speed: 4, size: 0.12, life: 0.8, grav: 2, up: 3 }); burst(E.arrive + 0.4, [6, 1.4, -7], { n: 80, colors: ['#5ff7ff', '#ff5cf0', '#ffe066'], speed: 5, size: 0.14, life: 1, grav: 2, up: 3 });
  for (let t = E.bloopPay + 4; t < E.teamUp; t += 0.3) burst(t, [-3.4, 1.8, -1.8], { n: 3, colors: ['#5ff7ff', '#9fd0ff'], speed: 2.4, size: 0.1, life: 0.6, grav: 9, up: 2 });
  burst(E.highfive + 1, [0, 2.6, -3.6], { n: 60, colors: ['#ff5cf0', '#5ff7ff'], speed: 6, size: 0.14, life: 1, grav: 0, up: 0 }); burst(E.glitchEnd, [-0.2, 2.6, -1.4], { n: 50, colors: ['#ffd23f', '#ffffff'], speed: 4, size: 0.12, life: 1, grav: 2, up: 3 });
  const C = [[E.arrive, 10, 4, 3, 4, 2, -7, 50], [64, 12, 6, 8, 0, 2, -6, 54], [68.9, -9, 5, 8, 0, 1.6, -5, 54], [69, 6.4, 2.2, 0.4, -1, 1.4, -4.6, 44], [74.1, 4.6, 2.0, -0.6, -1, 1.4, -4.6, 40],
    [74.2, 2.9, 2.1, -1.6, -0.6, 1.8, -3.2, 40], [79.1, 2.8, 2.0, -2.0, -0.6, 1.8, -3.2, 36], [79.2, -1.4, 2.1, -1.6, 2.2, 1.8, -3.2, 40], [82.3, -1.3, 2.0, -2.0, 2.2, 1.8, -3.2, 36], [82.4, 0.8, 2.2, 3.4, 0.8, 1.7, -3.2, 46], [90.3, 0.8, 2.0, 1.4, 0.8, 1.7, -3.2, 42],
    [90.4, 9.6, 2.2, -3, 6, 2.8, -8.5, 46], [93.9, 8.6, 2.8, -4, 6, 3.4, -8.5, 42], [94, 0.8, 2.6, 2.6, 0.8, 2.4, -3.2, 48], [97.3, 1.2, 2.5, 2.0, 0.8, 2.3, -3.2, 46], [97.4, 3, 7, 0, 0, 1, -8, 50], [101.3, 2, 7.6, -1.4, 0, 1, -8, 48],
    [101.4, 9, 3, 2, 0, 2, -8, 50], [107.5, -8, 3, 2, 0, 2, -8, 50], [107.6, 5.4, 2.0, -1.2, 3.6, 1.8, -4, 40], [112.5, 5.2, 2.0, -0.4, 3.6, 1.8, -4, 44], [112.6, 1, 2.4, -1.0, 0, 2, -8, 46], [117.3, -0.4, 2.6, -2, 0, 2, -8, 44],
    [117.4, 8, 2, -3.2, 4.6, 1.6, -6.6, 46], [121.5, 7.4, 2, -4.2, 4.6, 1.6, -6.6, 42], [121.6, 10, 5, 0, 2, 1.5, -8.5, 54], [125.5, 9, 5.5, 1.4, 2, 1.5, -8.5, 54], [125.6, -2.4, 1.4, -3.4, 0, 2, -8, 46], [129.3, -2, 1.6, -4.4, 0, 2, -8, 44],
    [129.4, 6.4, 1.8, -3.4, 3.8, 0.8, -5.6, 36], [133.9, 5.4, 1.5, -4.2, 3.8, 0.8, -5.6, 28], [134, -0.8, 2.2, 1.6, -3.4, 1.4, -1.8, 44], [143.1, -1.8, 2.2, 0.8, -3.4, 1.4, -1.8, 40], [143.2, 0, 2.2, 2.4, 0, 1.6, -3, 44], [147.9, 0, 2, 1.0, 0, 1.6, -3, 40],
    [148, 15, 8, 6, 0, 3, -9, 50], [159.5, -15, 8, 4, 0, 3, -9, 50], [159.6, 0, 11, 10, 0, 3, -9, 56], [170.5, 3, 12, 7, 0, 3, -9, 56], [170.6, 3, 1.8, -1.0, 0, 6, -9, 54], [174.1, 2.2, 1.6, -1.4, 0, 6.6, -9, 54],
    [174.2, 0, 2, 0.8, 0, 1.8, -3.6, 40], [175.7, 0, 2, 0.4, 0, 1.8, -3.6, 36], [175.8, 0, 5, 6, 0, 3.4, -6, 56], [183.1, 0, 5.4, 5, 0, 3.4, -6, 54], [183.2, 2.8, 3.6, 3.6, -0.2, 2.6, -1.4, 44], [188.3, 2.2, 3.4, 2.8, -0.2, 2.6, -1.4, 40],
    [188.4, 1, 3, 4, 6, 1.8, -6, 48], [E.home, 3, 3, 3, 6, 2, -7, 44]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; [duckA, duckB, duckC, duckD, fish].forEach(d => { d.visible = false; parentTo(d, g); });
    // time stutters during the glitch: the house un-builds and re-builds
    const tg = win(t, E.glitch, E.glitchEnd) ? E.buildTL + (E.buildTLEnd - E.buildTL) * (0.55 + 0.45 * Math.cos((t - E.glitch) * 2.2)) : t;
    hutVS.update(t); hutG.visible = t < E.teamUp; houseVS.update(tg); houseG.position.x = win(t, E.glitch, E.glitchEnd) ? Math.sin(t * 50) * 0.15 : 0; flw.visible = t > E.buildTLEnd;
    parentTo(booth, g); booth.position.set(...BP); const tip = t < E.reveal + 10 ? ss(seg(t, E.collapse, E.collapse + 0.8)) : 1 - ss(seg(t, E.reveal + 10, E.reveal + 11)); booth.rotation.set(0, 0, tip * 1.25);
    dial.material = dialM[t > E.goHome ? 0 : 2]; lever.rotation.x = t > E.goHome + 3 ? -1 : 0.4; boothLight.intensity = t < E.arrive + 1.5 || t > E.goHome + 3 ? 40 + Math.sin(t * 30) * 20 : 6;
    // future me
    const H0 = [6, 0.5, -6.8]; let hp = L3(H0, [2.2, 0.5, -3.2], seg(t, E.arrive + 1, E.meet + 1)), hy = faceTo(H0, [2.2, 0, -3.2]), ho = { walk: win(t, E.arrive + 1, E.meet + 1) ? 1 : 0, phase: t * 7, face: 'smug', headYaw: t < E.meet ? 0.5 : 0 };
    if (t > E.meet + 1) { hp = [2.2, 0.5, -3.2]; hy = -PI / 2; ho = { face: t < E.twinTalk ? 'scared' : 'smug', hips: win(t, E.twinTalk + 5, E.twinTalk + 8) }; } if (t > E.tockIn) ho = { face: 'scared', headYaw: -0.6, headPitch: -0.2 };
    if (t > E.blueprint) { hp = [1.4, 0.5, -3.6]; hy = -2.4; ho = { face: 'smug' }; blueprint.parent.visible = t < E.build1; }
    if (t > E.build1) { hp = [3.6, 0.5, -4]; hy = 0.6; ho = { face: 'normal', hips: t > E.build1 + 6 }; }
    if (t > E.lean) { const k = seg(t, E.lean, E.lean + 1.5); hp = L3([3.6, 0.5, -4], [4.4, 0.5, -6.6], k); hy = k < 1 ? PI : 0.3; ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug', lean: k < 1 ? 0 : -0.15 }; }
    if (t > E.collapse) { const k = seg(t, E.collapse + 0.3, E.collapse + 0.9); hp = L3([4.4, 0.5, -6.6], [3.8, 0.5, -5.6], k); hy = 0.3 + k * 2; ho = { face: 'scared', flat: k, panic: k < 1 }; }
    if (t > E.ruinMe) ho = { face: 'soot', flat: 1 };
    if (t > E.bloopPay) { hp = [-0.8, 0.5, -3.4]; hy = -2.2; ho = { face: 'smug', headYaw: 0.6 }; }
    if (t > E.teamUp) { hp = [-1, 0.5, -3]; hy = PI / 2; ho = { face: 'smug' }; }
    if (t > E.buildTL) { hp = [-5.4, 0.5, -4.4]; hy = 2.27; ho = { face: 'smug', swing: t * 1.6 }; } if (t > E.buildTLEnd) { const k = seg(t, E.buildTLEnd, E.highfive); hp = L3([-5.4, 0.5, -4.4], [-0.8, 0.5, -3.6], k); hy = PI / 2; ho = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'smug', headPitch: -0.4 }; }
    if (t > E.highfive) ho = { face: 'smug', wave: true }; if (t > E.glitch) ho = { face: 'scared', panic: true }; if (t > E.glitchEnd) { hy = 2.6; ho = { face: 'normal' }; }
    if (t > E.goHome) { const k = seg(t, E.goHome, E.warpBack + 1); hp = L3([-0.8, 0.5, -3.6], [6, 0.5, -7.2], k); hy = faceTo([-0.8, 0, -3.6], H0); ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug', wave: t < E.goHome + 1.5 }; }
    hero.root.visible = t < E.warpBack + 1; pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // past me
    let tp = [-1, 0.5, -4.6], ty = PI, to = { face: 'smug', swing: t * 1.2 };
    if (t > E.meet + 2) { tp = [-0.6, 0.5, -3.2]; ty = PI / 2; to = { face: t < E.twinTalk + 2 ? 'scared' : 'smug', hips: win(t, E.twinTalk + 9, E.tockIn) }; } if (t > E.tockIn) to = { face: 'scared', headYaw: 0.6, headPitch: -0.2 };
    if (t > E.blueprint) { ty = 2.2; to = { face: 'smug', hips: true }; }
    if (t > E.build1) { tp = [0, 0.5, -5.4]; ty = PI; to = { face: 'smug', swing: t * 2.2 }; } if (t > E.build1End) { tp = [0.4, 0.5, -4.8]; ty = 0.3; to = { face: 'smug', wave: true }; }
    if (t > E.lean) to = { face: 'smug', hips: true }; if (t > E.collapse) { ty = PI; to = { face: 'scared', panic: true }; }
    if (t > E.ruinMe) { const k = seg(t, E.ruinMe, E.bloopPay + 1); tp = L3([0.4, 0.5, -4.8], [-2.1, 0.5, -1.8], k); ty = -PI / 2; to = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug' }; }
    if (t > E.bloopPay + 1) to = { face: 'smug', hold: t < E.bloopPay + 2.4 };
    if (t > E.teamUp) { tp = [1, 0.5, -3]; ty = -PI / 2; to = { face: 'smug' }; }
    if (t > E.buildTL) { tp = [5.4, 0.5, -4.4]; ty = -2.27; to = { face: 'smug', swing: t * 1.6 + 0.5 }; } if (t > E.buildTLEnd) { const k = seg(t, E.buildTLEnd, E.highfive); tp = L3([5.4, 0.5, -4.4], [0.8, 0.5, -3.6], k); ty = -PI / 2; to = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'smug', headPitch: -0.4 }; }
    if (t > E.highfive) to = { face: 'smug', wave: true }; if (t > E.glitch) to = { face: 'scared', panic: true }; if (t > E.glitchEnd) { ty = -2.6; to = { face: 'normal' }; }
    if (t > E.goHome) { tp = [2, 0.5, -3]; ty = 0.9; to = { face: 'smug', wave: true }; }
    twin.root.visible = true; pose(twin, { t, p: tp, yaw: ty, ...to }); parentTo(twin.root, g); prop.rotation.y = t * 14; third.root.visible = false;
    fish.visible = win(t, E.bloopPay + 1, E.teamUp); if (fish.visible) { const onB = t > E.bloopPay + 2.4; parentTo(fish, onB ? bloop6.B.aR : twin.aR); fish.position.set(0, -0.72, 0.3); fish.rotation.set(0, 0, onB ? 1.2 : 0); }
    // Bloop
    const B0 = [7.4, 0.5, -6.4]; let bp = L3(B0, [4.8, 0.5, -5.4], seg(t, E.arrive + 1.4, E.meet)), by = -1.6, bo = { walk: win(t, E.arrive + 1.4, E.meet) ? 1 : 0, phase: t * 8 };
    if (t > E.collapse) bo = { angry: true }; if (t > E.reveal) bo = { facepalm: true };
    if (t > E.ruinMe) { const k = seg(t, E.ruinMe, E.bloopPay); bp = L3([4.8, 0.5, -5.4], [-3.4, 0.5, -1.8], k); by = PI / 2; bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; } if (t > E.bloopPay + 2.4) bo = { hop: true, handOut: true };
    if (t > E.teamUp) { bp = [-3.4, 0.5, -1.8]; bo = {}; } if (t > E.buildTL) { bp = [0, 0.5, -3]; by = PI; bo = { hop: true, handOut: true }; } if (t > E.buildTLEnd) { bp = [-3, 0.5, -1.6]; by = 1.2; bo = {}; } if (t > E.glitch) bo = { angry: true };
    if (t > E.goHome) { const k = seg(t, E.goHome + 0.5, E.warpBack + 1.2); bp = L3([-3, 0.5, -1.6], [6.4, 0.5, -7.4], k); by = faceTo([-3, 0, -1.6], H0); bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; }
    bloop6.B.root.visible = t < E.warpBack + 1.2; poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    // Leggy + her duck; Tock the clockwork owl
    let lp = L3([6.4, 0.5, -6.4], [4.6, 0.5, -2], seg(t, E.arrive + 1, E.meet)), ly = -1, ls = win(t, E.arrive + 1, E.meet) ? 1.4 : 0.3;
    if (t > E.build1) { lp = [-4.4, 0.5, -2.6]; ly = 0.8; } if (t > E.ruinMe) { lp = [2.6, 0.5, -1]; ly = -1.2; }
    const ca = (t - E.duckChase) * 0.9; if (win(t, E.duckChase, E.buildTLEnd)) { lp = [Math.cos(ca - 0.5) * 7.6, 0.5, -9 + Math.sin(ca - 0.5) * 7.6]; ly = -(ca - 0.5) + PI; ls = 3; if (t > E.duckChase + 5.6) { lp = [-0.8, 0.5, -1.2]; ly = 0.4; ls = 0.3; } }
    if (t > E.buildTLEnd) { lp = [3.6, 0.5, -1.2]; ly = -0.8; } if (t > E.glitchEnd - 3) { const k = seg(t, E.glitchEnd - 3, E.glitchEnd); lp = L3([3.6, 0.5, -1.2], [-0.2, 0.5, -1.4], k); ly = -PI / 2; ls = k < 1 ? 1.4 : 0.3; }
    if (t > E.goHome) { const k = seg(t, E.goHome + 1, E.warpBack + 1.4); lp = L3([-0.2, 0.5, -1.4], [6, 0.5, -7.2], k); ly = faceTo([-0.2, 0, -1.4], H0); ls = k < 1 ? 1.4 : 0.3; }
    L6.root.visible = t < E.warpBack + 1.4; poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g);
    tock.root.visible = t > E.tockIn; let kp = L3([6, 2.6, -7.2], [0.8, 3.6, -3.4], seg(t, E.tockIn, E.tockIn + 2)), ko = { fly: true, alarm: paradoxAt(t) > 0.8 }, ky = 0;
    if (t > E.blueprint) kp = [2.2, 4.0, -5]; if (t > E.lean) kp = [3.6, 3.2, -3.6];
    if (win(t, E.duckChase, E.buildTLEnd)) { kp = [Math.cos(ca) * 8.4, 4.4, -9 + Math.sin(ca) * 8.4]; ky = -ca + PI; if (t > E.duckChase + 5.6) { kp = [3, 12.4, -11]; ky = 0.4; ko = { fly: false }; } }
    if (t > E.buildTLEnd) { kp = [3, 12.4, -11]; ko = { fly: false, alarm: paradoxAt(t) > 0.8 }; } if (t > E.glitch) { kp = [0, 5, -3.4]; ko = { fly: true, spin: true, fast: true, alarm: true }; } if (t > E.glitchEnd) { kp = [-0.2, 2.75, -1.4]; ky = 0.4; ko = { fly: false }; }
    if (t > E.goHome) { kp = [2, 3.4, -3]; ko = { fly: true }; }
    poseTock(tock, t, kp, ky, ko); parentTo(tock.root, g);
    duckA.visible = true; const stolen = win(t, E.duckChase, E.duckChase + 5.6), given = t > E.glitchEnd; parentTo(duckA, stolen || given ? tock.body : L6.body); duckA.position.set(0, stolen || given ? -0.56 : 0.4, stolen || given ? 0.3 : -0.2); duckA.rotation.set(0, 0, 0);
    if (!L6.root.visible && !given) duckA.visible = false;
    muffin.root.visible = puff.root.visible = bot.root.visible = false;
    let cam = camKeys(t, C);
    return { cam, hud: true };
  }
  return { g, update };
})();
