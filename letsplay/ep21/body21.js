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
// ---------------------------------------------------------------- Ep 21 helpers: compact actor scripts
const pick = (t, A) => { let r = A[0][1]; for (const a of A) if (t >= a[0]) r = a[1]; return r; };
function act(t, K, O, idle) { const w = walker(t, K, idle); return { p: w.p, yaw: w.yaw, walk: w.walk > 0.05 ? 1 : 0, phase: w.phase, ...pick(t, O) }; }
const wl = (P, yaw, l) => [P[0] + l[0] * Math.cos(yaw) + l[2] * Math.sin(yaw), P[1] + l[1], P[2] - l[0] * Math.sin(yaw) + l[2] * Math.cos(yaw)];
// arcs: K = [[t,x,y,z,h],...] — h = hop height of the segment ending at that key
function arcPath(t, K) { if (t <= K[0][0]) return K[0].slice(1, 4); for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (t < b[0]) { const u = (t - a[0]) / (b[0] - a[0]); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u) + Math.sin(u * PI) * b[4], lerp(a[3], b[3], u)]; } } return K[K.length - 1].slice(1, 4); }
const follow = (p, o, ly, fov = 52) => ({ p: [p[0] + o[0], p[1] + o[1], p[2] + o[2]], l: [p[0], p[1] + ly, p[2]], fov });
function sitOn(h, t, P, yaw, l, o = {}) { pose(h, { t, p: wl(P, yaw, l), yaw, sit: 1, face: 'smug', ...o }); }
// --- the old 3-seat couch (snaps), the race couch, Team Lumpy's mini couch
function makeCouch3(col, cush) { const g = new THREE.Group(), parts = [];
  const add = (w, h, d, c, x, y, z) => { const m = box(w, h, d, c, x, y, z, g); parts.push({ m, p0: [x, y, z] }); };
  add(3.6, 0.5, 1.2, col, 0, 0.25, 0); for (const x of [-1.2, 0, 1.2]) add(1.1, 0.25, 1.0, cush, x, 0.62, 0.08); add(3.6, 0.9, 0.3, col, 0, 0.95, -0.45); for (const x of [-1.95, 1.95]) add(0.3, 0.7, 1.2, col, x, 0.6, 0);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, parts }; }
const couchOld = makeCouch3('#3a8fb0', '#5ab0d0'), couchRace = makeCouch3('#c0392b', '#e8604e'), couchMini = makeCouch3('#2a9a8a', '#5ad1c8'); couchMini.g.scale.setScalar(0.55);
const SNAPV = [[0, 1, 0.5], [-3, 6, 2], [0.5, 8, 3], [3, 6, 2.4], [0, 4, -4], [-5, 3, 1], [5, 3, 1]];
function poseSnap(c, t, t0) { c.parts.forEach((q, i) => { const dt = Math.max(0, t - t0), v = SNAPV[i]; const tl = (v[1] + Math.sqrt(v[1] * v[1] + 2 * 22 * q.p0[1])) / 22, d = Math.min(dt, tl);
  q.m.position.set(q.p0[0] + v[0] * d * 0.6, Math.max(0.12, q.p0[1] + v[1] * d - 11 * d * d), q.p0[2] + v[2] * d * 0.6); q.m.rotation.set(d * v[2] * 0.8, 0, d * v[0] * 0.6); }); }
function resetCouch(c) { c.parts.forEach(q => { q.m.position.set(...q.p0); q.m.rotation.set(0, 0, 0); }); }
// --- Duke Fluffington (a cushion with a crown and a megaphone) and Team Lumpy
function makeCushion(col, s = 1, duke = false) { const root = new THREE.Group(), body = pivot(root, 0, 0.55, 0);
  box(1.3, 0.8, 1.3, col, 0, 0, 0, body); box(0.16, 0.06, 0.16, shade(col, 0.6), 0, 0.42, 0, body); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.14, 0.24, 0.14, '#ffd23f', x * 0.68, 0.36, z * 0.68, body);
  for (const x of [-0.25, 0.25]) box(0.26, 0.24, 0.04, '#ffffff', x, 0.1, 0.66, body); const pup = [-0.22, 0.28].map(x => box(0.12, 0.14, 0.05, '#111', x, 0.08, 0.68, body));
  box(0.3, 0.06, 0.04, shade(col, 0.4), 0, -0.14, 0.66, body); for (const x of [-0.35, 0.35]) box(0.26, 0.16, 0.32, shade(col, 0.7), x, -0.48, 0.04, body);
  const aL = pivot(body, -0.7, 0.05, 0), aR = pivot(body, 0.7, 0.05, 0); box(0.16, 0.42, 0.16, col, 0, -0.2, 0, aL); box(0.16, 0.42, 0.16, col, 0, -0.2, 0, aR);
  let mega = null; if (duke) { const cr = makeCrown(); cr.scale.setScalar(0.6); cr.position.y = 0.5; body.add(cr); mega = pivot(aR, 0, -0.42, 0.1); box(0.2, 0.2, 0.3, '#e8344e', 0, 0, 0.1, mega); box(0.38, 0.38, 0.12, '#ffd23f', 0, 0, 0.3, mega); }
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, aL, aR, pup, mega }; }
function poseCushion(c, t, p, yaw, o = {}) { c.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.45 : 0), p[2]); c.root.rotation.set(0, yaw, 0);
  const sq = o.squish ?? (1 + Math.sin(t * 4 + (o.seed || 0)) * 0.03); c.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); c.body.position.y = 0.55 * sq; c.body.rotation.set(o.sleep ? 0.2 : 0, 0, o.flat ? PI / 2 : o.sleep ? 0.15 : 0);
  c.aL.rotation.set(o.wave ? -2.6 + Math.sin(t * 12) * 0.4 : o.swing ? -2.4 + Math.sin(t * 9) * 1.2 : 0, 0, -0.2); c.aR.rotation.set(o.mega ? -1.5 : o.wave ? -2.6 + Math.cos(t * 12) * 0.4 : 0, 0, 0.2);
  c.pup.forEach(q => q.scale.y = o.sleep ? 0.15 : o.squint ? 0.35 : 1); if (c.mega) c.mega.visible = !!o.mega; }
const duke = makeCushion('#ff9ad0', 1.25, true), lumpy = ['#5ad1c8', '#4ab8e0', '#7ad18a'].map(c => makeCushion(c, 0.7)), fans = ['#ffb36b', '#c08aff', '#ff6b6b', '#ffe066', '#7cff6b', '#5ff7ff', '#ff9ad0', '#9aa8b8'].map(c => makeCushion(c, 0.55));
const pillow = box(0.6, 0.3, 0.42, '#ffffff', 0, -0.75, 0.3, twin.aR); const lpillow = box(0.5, 0.26, 0.36, '#ffe066', 0, -0.42, 0.25, lumpy[0].aL);
// --- Sofie: the Mega Sofa (seats twelve; alive; loves ducks)
function makeSofa() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), col = '#8a3fd1', cu = '#b06ae8';
  box(11, 0.8, 2.6, col, 0, 1.0, 0, body); for (let i = 0; i < 6; i++) box(1.75, 0.3, 2.0, cu, -4.55 + i * 1.82, 1.55, 0.2, body); box(11, 1.6, 0.6, col, 0, 2.2, -1.0, body); for (let i = 0; i < 6; i++) box(1.7, 1.2, 0.2, cu, -4.55 + i * 1.82, 2.2, -0.62, body);
  for (const x of [-5.5, 5.5]) box(0.7, 1.1, 2.6, col, x, 1.6, 0, body); box(11.2, 0.12, 2.7, '#ffd23f', 0, 0.62, 0, body);
  const eyes = [], lids = []; for (const x of [-1.5, 1.5]) { box(0.95, 0.62, 0.06, '#ffffff', x, 1.02, 1.31, body); eyes.push(box(0.38, 0.4, 0.07, '#1a1030', x, 1.0, 1.34, body)); const l = pivot(body, x, 1.33, 1.36); box(0.98, 0.66, 0.06, col, 0, -0.33, 0, l); lids.push(l); }
  const mouth = box(1.6, 0.12, 0.06, '#3a1060', 0, 0.74, 1.31, body);
  const legs = [[-4.6, -0.8], [4.6, -0.8], [-4.6, 0.8], [4.6, 0.8]].map(([x, z]) => { const p = pivot(root, x, 0.62, z); box(0.7, 0.62, 0.7, '#ffd23f', 0, -0.31, 0, p); return p; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, eyes, lids, legs, mouth }; }
function poseSofa(s, t, p, yaw, o = {}) { const w = o.walk || 0, ph = o.phase ?? t * 8; s.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.7 : 0), p[2]); s.root.rotation.set(0, yaw, 0);
  s.legs.forEach((l, i) => l.rotation.x = Math.sin(ph + (i % 2 ^ i >> 1) * PI) * 0.7 * w); s.body.position.set(o.purr ? Math.sin(t * 60) * 0.03 : 0, Math.abs(Math.cos(ph)) * 0.22 * w, 0); s.body.rotation.set(o.crouch ? 0.12 : 0, 0, w ? Math.sin(ph) * 0.04 : 0);
  const open = o.awake ? (o.purr ? 0.12 : (Math.floor(t * 10) % 41 === 0 ? 0.1 : 1)) : 0; s.lids.forEach(l => l.scale.y = 1 - open); s.eyes.forEach((e, i) => e.position.x = (i ? 1.5 : -1.5) + (o.look || 0) * 0.2); s.mouth.scale.x = o.purr ? 1.3 : o.awake ? 0.8 : 1; }
const sofie = makeSofa(); const sofaBob = () => sofie.body.position.y;
const SEAT = { ducks: -4.5, twin: -2.7, hero: -0.9, third: 0.9, bloop: 2.7, leggy: 4.5 };
// --- Bloop's Sofa-Wagon (assembles itself block by block), Leggy's ribbon, flyer
function makeWagon() { const root = new THREE.Group(), parts = [], wheels = [], add = m => { parts.push(m); return m; };
  for (const [x, z] of [[-1.3, -1.4], [1.3, -1.4], [-1.3, 1.4], [1.3, 1.4]]) { const w = pivot(root, x, 0.5, z); add(box(0.2, 1.0, 1.0, '#5a3a22', 0, 0, 0, w)); box(0.22, 0.3, 0.3, '#ffd400', 0, 0, 0, w); wheels.push(w); }
  add(box(2.4, 0.3, 4.2, '#c08a40', 0, 0.95, 0, root)); for (const x of [-1.2, 1.2]) add(box(0.15, 0.4, 4.2, '#a06a2a', x, 1.3, 0, root)); add(box(2.4, 0.4, 0.15, '#a06a2a', 0, 1.3, -2.05, root));
  add(box(0.15, 0.15, 2.0, '#8a5a2b', 0, 0.7, 3.0, root)); add(box(1.6, 0.12, 0.12, '#ffd400', 0, 0.75, 3.9, root)); const fl = add(box(0.06, 1.2, 0.06, '#c0c0c8', -1.1, 2.0, -1.9, root)); add(box(0.7, 0.4, 0.04, '#ff8a2a', -0.76, 2.4, -1.9, root));
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, parts, wheels }; }
function poseWagon(w, t, p, yaw, roll, built = -1e9) { w.root.position.set(...p); w.root.rotation.set(0, yaw, 0); w.wheels.forEach(q => q.rotation.x = roll);
  w.parts.forEach((m, i) => { const t0 = built + i * 0.42, k = t < t0 ? 0 : Math.min(1, backOut(seg(t, t0, t0 + 0.3))); m.scale.setScalar(Math.max(0.001, k)); }); }
const wagon = makeWagon();
const ribbon = new THREE.Group(); box(0.4, 0.4, 0.06, '#3d7bff', 0, 0, 0, ribbon); box(0.14, 0.4, 0.05, '#3d7bff', -0.1, -0.34, 0, ribbon); box(0.14, 0.4, 0.05, '#3d7bff', 0.1, -0.34, 0, ribbon); box(0.18, 0.18, 0.08, '#ffd23f', 0, 0, 0.02, ribbon); L6.body.add(ribbon); ribbon.position.set(0, 0.2, 0.75);
function leggyDucks(t, n) { rain.forEach((d, i) => { if (i >= 9) return; d.visible = i < n; parentTo(d, L6.body); d.position.set(((i % 3) - 1) * 0.42, 0.4 + Math.floor(i / 3) * 0.28, -0.2 + (Math.floor(i / 3) % 2) * 0.1); d.rotation.set(0, i * 0.7, 0); d.scale.setScalar(1); }); }
// HUD: seats vs butts + relay tracker; the flyer
const seatsAt = t => t < E.snap ? [3, 6] : t < E.named ? [0, 6] : [12, 6];
const legAt = t => !win(t, E.leg1, E.win + 3) ? 0 : t < E.leg2 ? 1 : t < E.leg3 ? 2 : 3;
function drawSeats(t) { if (t >= E.freeze) return; const [s, b] = seatsAt(t); rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(40,14,50,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff9ad0'; ctx.stroke();
  outlined('SEATS  vs  BUTTS', 132, 114, 15, '#ff9ad0', '#000', 3); outlined(s + '  :  ' + b, 132, 146, 30, s >= b ? '#7cff6b' : s ? '#ffe066' : '#ff4a5a', '#000', 5); outlined(s >= b ? 'IT FITS!' : s ? 'too few seats' : 'NO COUCH', 132, 174, 13, '#fff', '#000', 3);
  const lg = legAt(t); if (lg) { rrect(22, 196, 220, 62, 12); ctx.fillStyle = 'rgba(20,24,48,.8)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.stroke(); outlined('RELAY  LEG ' + lg + '/3', 132, 214, 16, '#5ff7ff', '#000', 3);
    outlined(['', 'PILLOW FIGHT', 'MATTRESS SPRINT', 'COUCH CARRY'][lg] + (t > E.win ? ' ✓' : ''), 132, 240, 15, '#fff', '#000', 3); } }
function drawFlyer(T) { const k = ss(seg(T, E.flyer + 0.4, E.flyer + 0.8)) * (1 - ss(seg(T, E.flyerEnd - 0.4, E.flyerEnd))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 80); ctx.rotate(-0.04); ctx.fillStyle = '#ffe8f4'; ctx.fillRect(-210, -210, 420, 400); ctx.fillStyle = '#ff6fb8'; ctx.fillRect(-210, -210, 420, 70);
  outlined('COMFY FAIR', 0, -175, 40, '#ffffff', '#a0205a', 6); outlined('GRAND RELAY', 0, -112, 30, '#7a1a5a', '#ffe8f4', 2); outlined('for teams of THREE', 0, -78, 22, '#3a2a60', '#ffe8f4', 2);
  ctx.fillStyle = '#8a3fd1'; ctx.fillRect(-150, -40, 300, 50); ctx.fillRect(-150, -80, 300, 40); ctx.fillStyle = '#b06ae8'; for (let i = 0; i < 6; i++) ctx.fillRect(-146 + i * 49, -50, 45, 16); ctx.fillStyle = '#ffd23f'; for (const x of [-140, 120]) ctx.fillRect(x, 10, 20, 16);
  if (T > E.flyer + 2.4) { outlined('PRIZE: THE MEGA SOFA', 0, 66, 26, '#c0182a', '#ffe8f4', 2); outlined('seats 12!!', 0, 100, 24, '#3a2a60', '#ffe8f4', 2); }
  if (T > E.flyer + 4) outlined('(do not feed the sofa)', 0, 150, 16, '#777', '#ffe8f4', 2); ctx.restore(); }

// ---------------------------------------------------------------- set A: the yard (couch trouble; later the sunset and the leap)
const yard = (() => {
  const g = mk('yard'); field(g, false); const hg = new THREE.Group(); g.add(hg); { const st = new VSet(hg); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(hg); }
  const flag = pivot(hg, 3, 12.4, -11); box(0.08, 1.6, 0.08, '#c0c0c8', 0, 0.8, 0, flag); box(0.9, 0.5, 0.04, '#ff8a2a', 0.45, 1.3, 0, flag);
  const LD = rain.map((_, i) => { const r = rng(2100 + i); return [-12 + r() * 24, 3 + r() * 12, r() * 6]; });
  burst(E.snap, [0, 1, -1], { n: 90, colors: ['#5ab0d0', '#ffffff', '#3a8fb0'], speed: 6, size: 0.18, life: 1.4, grav: 8, up: 5 });
  for (let t = E.wagon; t < E.wagonEnd; t += 0.42) burst(t, [4, 1.2, 7], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  burst(E.home + 6, [0, 2.4, 1.5], { n: 40, colors: ['#b06ae8', '#ffffff'], speed: 3, size: 0.14, life: 1, grav: 4, up: 3 }); burst(E.leap + 3.6, [7, 2, 0.8], { n: 120, colors: ['#5ff7ff', '#ff5cf0', '#ffe066'], speed: 6, size: 0.16, life: 1.2, grav: 1, up: 3 });
  const C = [[0, 0, 3.2, 9, 0, 1.6, -1, 50], [4.9, 1.2, 2.8, 7, 0, 1.6, -1, 46], [5, -3.4, 1.5, 4, 0, 1.9, -1, 44], [11.3, 3.4, 1.5, 4, 0, 1.9, -1, 44], [11.4, 7, 3, 5, 0, 1.4, -1, 50], [18.5, 4.6, 2.4, 3.6, 0, 1.6, -1, 46],
    [18.6, 0, 5, 10, 0, 1, -1, 54], [21.3, 0, 4, 8.4, 0, 1, -1, 50], [21.4, -0.4, 2.4, 5.2, 1.6, 1.6, 1.0, 42], [29.7, 0, 2.3, 4.8, 1.6, 1.6, 1.0, 38], [29.8, 0, 0.9, 6.4, 0, 4, 0, 58], [35.9, 0, 1.4, 6.4, 0, 2.2, 1, 50],
    [36, -3.8, 1.8, 3.6, -1.8, 1.7, 1.0, 40], [39.7, -3.4, 1.8, 3.4, -1.8, 1.7, 1.0, 38], [39.8, -2.6, 2.2, 5.6, 0.6, 1.4, 2.6, 44], [43.7, -2.2, 2.1, 5.2, 0.6, 1.4, 2.6, 42], [43.8, 12, 4, 13, 4, 1, 7, 46], [50.3, 10, 3.6, 15, 4, 1, 7, 46],
    [50.4, 10, 3, 8, 4, 1.5, 10, 50], [53.9, 9, 3, 22, 4, 1.5, 22, 52], [E.travel, 9, 3, 22, 4, 1.5, 22, 52],
    [E.home, 6, 3, 26, 0, 2.4, 16, 50], [217.9, 5, 3.4, 10, 0, 2.2, 1.5, 52], [218, 0, 4.4, 13, 0, 2.6, -1, 54], [226.5, 0, 3.6, 10.5, 0, 2.6, -1, 50], [226.6, -0.9, 3.3, 5.6, -0.9, 3.1, 1.5, 38], [230.9, -0.7, 3.3, 5.2, -0.9, 3.1, 1.5, 36],
    [231, 0.9, 3.3, 5.6, 0.9, 3.1, 1.5, 38], [234.9, 1.1, 3.3, 5.2, 0.9, 3.1, 1.5, 36], [235, -2.7, 3.3, 5.6, -2.7, 3.1, 1.5, 38], [239.5, -2.5, 3.3, 5.2, -2.7, 3.1, 1.5, 36], [239.6, -12, 5, 16, 0, 3, -1, 50], [245.3, 10, 5, 16, 0, 3, -1, 50],
    [245.4, 12, 3.4, 9, 4, 1.8, 0, 50], [252.9, 11, 3, 7, 6, 1.8, -1, 46], [253, 10.4, 2.4, 4.4, 7, 2, -1, 46], [258.9, 10, 2.4, 4, 7, 2, -1, 42], [259, 5.8, 3.8, 7.4, 4.4, 2.8, 1.5, 40], [263.9, 5.6, 3.8, 7, 4.4, 2.8, 1.5, 36],
    [264, 0, 4, 12, 0, 2.6, 1.5, 54], [265.9, 0, 4.2, 11, 0, 2.6, 1.5, 54], [276, 13, 2.6, 14, 7, 1.6, 8, 50], [281.3, 12, 2.4, 13, 7, 1.8, 6, 48], [281.4, 2, 7, 15, 7, 2, 4, 52], [285.6, 3, 9, 14, 7, 1.8, 1, 50], [E.logo, 3, 9, 14, 7, 1.8, 1, 50]];
  const BP = [7, 0.5, -2], CO = [0, 0.5, -1];
  const lapAt = t => { const a = Math.atan2(-1, 1) * 0 + Math.atan2(1.5 - 8, 1) + 0.82 * Math.max(0, t - E.laps - 0.5); return [[-1 + Math.cos(a) * 7, 0.5, 8 + Math.sin(a) * 6.5], Math.atan2(-Math.sin(a) * 7, Math.cos(a) * 6.5)]; };
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; ribbon.visible = false; [duckA, duckB, duckC, duckD, fish].forEach(d => d.visible = false); muffin.root.visible = puff.root.visible = bot.root.visible = false; card.visible = false;
    const late = t > E.home; parentTo(booth, g); booth.position.set(...BP); booth.rotation.set(0, 0, 0); tarp.visible = false; dial.material = dialM[late && t > E.bye ? 3 : 0];
    const hum = late && t > E.hum; if (hum) booth.position.x += Math.sin(t * 60) * 0.04; lever.rotation.x = hum ? -1 : 0.4; boothLight.intensity = hum ? 30 + Math.sin(t * 30) * 20 : 6;
    [twin, third, hero].forEach(h => parentTo(h.root, g)); parentTo(bloop6.B.root, g); parentTo(L6.root, g); parentTo(tock.root, g); twin.root.visible = third.root.visible = tock.root.visible = true; prop.rotation.y = t * 14;
    pillow.visible = lpillow.visible = false; [duke, ...lumpy, ...fans].forEach(c => c.root.visible = false);
    rain.forEach((d, i) => { if (i < 9) return; d.visible = !late; parentTo(d, g); d.position.set(LD[i][0], 0.5, LD[i][1]); d.rotation.set(0, LD[i][2], i % 4 ? 0 : PI / 2); });
    parentTo(couchOld.g, g); couchOld.g.visible = !late; couchOld.g.position.set(...CO); if (t < E.snap) { resetCouch(couchOld); couchOld.g.position.x = t > E.squeeze + 2 ? Math.sin(t * 40) * 0.05 * seg(t, E.squeeze + 2, E.snap) : 0; } else poseSnap(couchOld, t, E.snap);
    parentTo(wagon.root, g); wagon.root.visible = !late && t > E.wagon; const wz = lerp(7, 24, ss(seg(t, E.depart, E.travel + 1))), WP = [4, 0.5, wz]; poseWagon(wagon, t, WP, 0, -wz / 0.5, E.wagon);
    parentTo(sofie.root, g); sofie.root.visible = late;
    let cam;
    if (!late) {
      const onW = t > E.depart; leggyDucks(t, t < 6 ? 6 : 9);
      // the three of me
      const sitC = (h, x, o) => pose(h, { t, p: [x, 1.05, -1], yaw: 0, sit: 1, face: 'smug', ...o });
      const fall = (h, p, o) => pose(h, { t, p, yaw: 0.2, face: 'scared', flat: ss(seg(t, E.snap, E.snap + 0.5)), flatDir: -1, ...o });
      if (onW) { sitOn(hero, t, WP, 0, [0, 0.9, 0.4], { panic: false }); sitOn(twin, t, WP, 0, [-0.7, 0.9, -0.6], { wave: true }); sitOn(third, t, WP, 0, [0.7, 0.9, -0.6], { hips: true }); }
      else if (t < E.snap) { sitC(hero, 0, { face: t > E.squeeze ? 'scared' : 'smug', wave: t < 4 }); sitC(twin, -1.2, { wave: win(t, 5, 8.2) }); sitC(third, 1.2, { hips: win(t, 8.2, 11.4) }); }
      else if (t < E.why) { fall(hero, [0, 0.5, -0.2]); fall(twin, [-1.5, 0.5, 0.2]); fall(third, [1.5, 0.5, 0.2]); }
      else { const lk = t > E.flyer && t < E.flyerEnd ? { headPitch: -0.5 } : {};
        pose(hero, { t, p: [-0.2, 0.5, 1.6], yaw: t > E.invoice ? faceTo([-0.2, 0, 1.6], [1.2, 0, 3.2]) : t > E.wagon ? 1.2 : faceTo([-0.2, 0, 1.6], [1.6, 0, 1.0]), face: t > E.invoice && t < E.wagon ? 'scared' : 'smug', ...lk });
        pose(twin, { t, p: [-1.8, 0.5, 1.0], yaw: 1.4, face: 'smug', wave: win(t, E.flyerEnd, E.invoice), ...lk }); pose(third, { t, p: [1.6, 0.5, 1.0], yaw: -1.6, face: t < E.flyer ? 'normal' : 'smug', hips: t < E.flyer, ...lk }); }
      // Bloop
      if (onW) poseBurble(bloop6, t, wl(WP, 0, [0, 1.1, -1.4]), 0, { hop: true });
      else if (t < E.snap) { const a = act(t, [[0, 4.6, 0.5, -0.6], [E.squeeze, 4.6, 0.5, -0.6], [E.squeeze + 2, 0.6, 0.5, 0.4], [E.squeeze + 2.6, 0.6, 1.4, -0.9]], [[0, { yaw: -2.2 }], [E.squeeze, {}], [E.squeeze + 2.6, { yaw: 0 }]]); poseBurble(bloop6, t, a.p, a.yaw, { walk: a.walk, phase: a.phase }); }
      else if (t < E.why) poseBurble(bloop6, t, [0.9, 0.5, 0.6], 0.3, { angry: true });
      else { const a = act(t, [[E.why, 3, 0.5, 2], [E.invoice, 3, 0.5, 2], [E.invoice + 1, 1.2, 0.5, 3.2], [E.wagon, 1.2, 0.5, 3.2], [E.wagon + 1, 5.8, 0.5, 5.4]], [[E.why, { yaw: -1.6 }], [E.invoice, {}], [E.invoice + 1, { yaw: faceTo([1.2, 0, 3.2], [-0.2, 0, 1.6]), handOut: true }], [E.wagon, {}], [E.wagon + 1, { yaw: -1.4, hop: true }]]);
        poseBurble(bloop6, t, a.p, a.yaw, a); card.visible = win(t, E.invoice + 1, E.wagon); }
      // Leggy (collecting ducks) and Tock
      if (onW) poseLurk(L6, t, wl(WP, 0, [0, 0, 3.8]), 0, t < E.travel ? 3 : 0.3);
      else if (t < E.squeeze) { const a = act(t, [[0, -6, 0.5, 3], [3, -4, 0.5, 5], [6, -7, 0.5, 6], [9, -3, 0.5, 2]], [[0, {}]]); poseLurk(L6, t, a.p, a.yaw, 1.4); }
      else if (t < E.snap) poseLurk(L6, t, L3([-3, 0.5, 2], [-0.4, 1.4, -1.5], seg(t, E.squeeze + 1, E.squeeze + 3)), 0.2, 0.3);
      else if (t < E.why) poseLurk(L6, t, [-1, 0.5, -2.8], 0.8, 0.3); else poseLurk(L6, t, [-4, 0.5, 2.2], 1.2, 0.3);
      const tk = t < E.snap ? [[1.95, 1.4, -1], 0, {}] : t < E.flyer ? [[0, 9, -8], 0, { fly: true }] : t < E.flyer + 2 ? [L3([2, 10, -6], [0, 3.6, 1.4], seg(t, E.flyer, E.flyer + 2)), 0, { fly: true }] : onW ? [wl(WP, 0, [0, 3.2, 0]), 0, { fly: true }] : [[0.4, 3.4, 2], 0, { fly: true }];
      poseTock(tock, t, ...tk); hero.root.visible = true;
      cam = camKeys(t, C);
    } else {
      // home: sofie walks up the path, turns, plops; the leap at the end
      let sp, sy, so = { awake: true };
      if (t < E.home + 5) { const a = walker(t, [[E.home, 0, 0.5, 18], [E.home + 5, 0, 0.5, 1.5]]); sp = a.p; sy = PI; so.walk = 1; so.phase = a.phase; }
      else if (t < E.laps) { sp = [0, 0.5, 1.5]; sy = PI * (1 - ss(seg(t, E.home + 5, E.home + 6))); so.hop = win(t, E.excited, E.laps); so.purr = win(t, E.sitAll + 10, E.squeak); }
      else if (t < E.lapsEnd) { [sp, sy] = lapAt(t); so.walk = 1.2; so.phase = t * 14; }
      else if (t < E.leap) { const k = ss(seg(t, E.lapsEnd, E.lapsEnd + 2)), [l0, y0] = lapAt(E.lapsEnd); sp = L3(l0, [7, 0.5, 10], k); sy = lerp(y0, PI, k); so.crouch = t > E.lapsEnd + 3; so.walk = k < 1 ? 1 : 0; so.phase = t * 10; }
      else { const k = seg(t, E.leap, E.leap + 5); sp = [7, 0.5 + Math.sin(k * PI) * 3, lerp(10, 1.2, k)]; sy = PI; }
      poseSofa(sofie, t, sp, sy, so); const P = [sp[0], sp[1] + sofaBob() + (so.hop ? Math.abs(Math.sin(t * 9)) * 0.7 : 0), sp[2]];
      const scared = t > E.excited, wild = { face: 'scared', panic: t > E.laps };
      sitOn(hero, t, P, sy, [SEAT.hero, 1.5, 0.2], scared ? wild : { face: 'smug', headYaw: win(t, E.calm, E.bye) ? -0.3 : 0 });
      const gone = t > E.bye;
      if (!gone) { sitOn(twin, t, P, sy, [SEAT.twin, 1.5, 0.2], { wave: win(t, E.sitAll, E.sitAll + 3) }); sitOn(third, t, P, sy, [SEAT.third, 1.5, 0.2], { hips: false }); }
      else { const dive = t > E.lapsEnd + 3; const tw = act(t, [[E.bye, -2.7, 1.5, 2.2], [E.bye + 1, -2, 0.5, 3.4], [E.hum, 6.3, 0.5, 0.6], [E.lapsEnd + 3, 6.3, 0.5, 0.6], [E.lapsEnd + 3.6, 4.4, 0.5, 0.8]], [[E.bye, {}], [E.hum, { yaw: -2.4, face: 'smug', wave: t < E.squeak }], [E.squeak, { yaw: -2.4, face: 'scared', panic: true }], [E.lapsEnd + 3.6, { yaw: 0, face: 'scared', flat: 1 }]]);
        pose(twin, { t, ...tw }); const th = act(t, [[E.bye, 0.9, 1.5, 2.2], [E.bye + 1, 1.4, 0.5, 3.4], [E.hum, 7.7, 0.5, 0.6], [E.lapsEnd + 3, 7.7, 0.5, 0.6], [E.lapsEnd + 3.6, 9.6, 0.5, 0.8]], [[E.bye, {}], [E.hum, { yaw: -2.0, face: 'smug', hips: true }], [E.squeak, { yaw: -2.0, face: 'scared', panic: true }], [E.lapsEnd + 3.6, { yaw: 0, face: 'scared', flat: 1, flatDir: -1 }]]); pose(third, { t, ...th }); }
      poseBurble(bloop6, t, wl(P, sy, [SEAT.bloop, 1.7, 0.2]), sy, scared ? { angry: true } : { hop: win(t, E.sitAll, E.sitAll + 3) });
      poseLurk(L6, t, wl(P, sy, [SEAT.leggy, 1.7, 0]), sy, t > E.excited ? 2 : 0.3); ribbon.visible = true; leggyDucks(t, 0);
      rain.forEach((d, i) => { if (i >= 9) return; d.visible = true; parentTo(d, sofie.body); if (i === 8) { d.position.set(3.6, 1.85, 0.7); d.scale.set(1, win(t, E.squeak, E.squeak + 0.5) ? 0.45 : 1, 1); } else d.position.set(SEAT.ducks + ((i % 4) - 1.5) * 0.4, 1.85 + Math.floor(i / 4) * 0.3, 0.2); d.rotation.set(0, 0, 0); });
      poseTock(tock, t, wl(P, sy, [0, 3.35, -1.0]), sy, { fly: t > E.excited, alarm: t > E.laps });
      if (win(t, E.laps, E.lapsEnd)) { const sx = sp[0], sz = sp[2]; cam = { p: [sx + Math.sin(t * 0.4) * 10, 8, sz + 14], l: [sx, 2.4, sz], fov: 54 }; } else cam = camKeys(t, C);
    }
    bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.visible = L6.root.visible = true;
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Comfy Fair (candy-bright; the relay; the prize is alive)
const fair = (() => {
  const g = mk('fair'); const st = new VSet(g);
  for (let x = -32; x <= 32; x++) for (let z = -24; z <= 70; z++) st.add(x, 0, z, Math.abs(x) <= 1 && z > 6 ? 'path' : z >= 2 && z <= 6 && Math.abs(x) <= 15 ? 'sand' : 'turf');
  for (let x = -6; x <= 6; x++) for (let z = -16; z <= -12; z++) st.add(x, 1, z, 'goldblk'); for (let x = -1; x <= 1; x++) for (let z = -10; z <= -9; z++) st.add(x, 1, z, 'castle');
  for (let x = -14; x <= -8; x++) st.add(x, 1, 4, 'log'); for (const c of [-4, -1, 2]) for (let dx = -1; dx <= 1; dx++) for (let z = 3; z <= 5; z++) st.add(c + dx, 1, z, 'polka');
  for (const z of [2, 6]) for (let y = 1; y <= 4; y++) st.add(14, y, z, 'castle'); for (let z = 2; z <= 6; z++) st.add(14, 5, z, 'castle');
  function tent(cx, cz) { for (let y = 1; y <= 3; y++) for (let x = cx - 2; x <= cx + 2; x++) for (let z = cz - 2; z <= cz + 2; z++) { if (x > cx - 2 && x < cx + 2 && z > cz - 2 && z < cz + 2) continue; if (z === cz + 2 && x === cx && y <= 2) continue; st.add(x, y, z, (x + z) % 2 ? 'jam' : 'quartz'); }
    for (let k = 0; k < 3; k++) for (let x = cx - 2 + k; x <= cx + 2 - k; x++) for (let z = cz - 2 + k; z <= cz + 2 - k; z++) st.add(x, 4 + k, z, k % 2 ? 'quartz' : 'jam'); }
  tent(-20, -8); tent(18, -8); tent(2, 11); tent(19, 15); tent(-22, 22);
  for (const x of [-15, -9]) for (let z = 12; z <= 16; z++) st.add(x, 1, z, 'log'); for (let x = -15; x <= -9; x++) st.add(x, 1, 12, 'log');
  for (const x of [-10, 10]) for (let y = 1; y <= 5; y++) st.add(x, y, -7, 'log');
  for (const [x, z, h] of [[-28, -18, 6], [28, -20, 7], [-28, 8, 5], [28, 4, 6], [-12, 40, 6], [12, 46, 5], [-10, 60, 6], [9, 30, 5]]) tree20(st, x, z, h, false);
  st.build();
  const bunt = new THREE.Group(); g.add(bunt); for (let i = 0; i < 25; i++) box(0.4, 0.5, 0.05, ['#ff6fb8', '#ffe066', '#5ff7ff', '#7cff6b'][i % 4], -9.6 + i * 0.8, 5.2 - Math.sin(i / 24 * PI) * 0.8, -7, bunt);
  const balloons = [[-6, -9], [7, -10], [16, 1], [-16, 6], [-4, 12]].map(([x, z], i) => { const b = pivot(g, x, 6, z); box(0.8, 1.0, 0.8, ['#ff3d7f', '#5ff7ff', '#ffe066', '#7cff6b', '#c08aff'][i], 0, 0, 0, b); box(0.04, 3, 0.04, '#ffffff', 0, -2, 0, b); return b; });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 3.6), new THREE.MeshBasicMaterial({ map: bannerTex('FINISH') })); banner.position.set(14, 4.2, 4); g.add(banner);
  const sheet = box(11.6, 3.6, 3.4, '#f6efe0', 0, 3.3, -14, g);
  const sofaK = [[0, 0, 1.5, -14], [E.bolt, 0, 1.5, -14], [E.bolt + 1.4, 2.4, 0.5, -6], [E.bolt + 4, -1, 0.5, 4], [E.bolt + 6.6, 8, 0.5, 6], [E.bolt + 9, 14, 0.5, 12], [E.bolt + 11.6, 4, 0.5, 16], [E.chaseEnd, -17, 0.5, 4], [E.board + 1.4, -17, 0.5, 4], [E.board + 3.6, -6, 0.5, 14], [E.board + 5, 0, 0.5, 22], [E.home, 0, 0.5, 60]];
  const lag = (t, d) => walker(t - d, sofaK);
  burst(E.bonk, [-9.8, 2.2, 4], { n: 50, colors: ['#ffffff', '#ffe066'], speed: 5, size: 0.14, life: 1, grav: 4, up: 3 }); burst(E.win, [14, 5, 4], { n: 140, colors: ['#ff6fb8', '#ffe066', '#5ff7ff', '#7cff6b'], speed: 7, size: 0.16, life: 2, grav: 4, up: 6 });
  burst(E.ribbon, [-10, 2.4, 14], { n: 60, colors: ['#3d7bff', '#ffe066'], speed: 4, size: 0.12, life: 1.2, grav: 3, up: 4 }); burst(E.unveil, [0, 4, -14], { n: 120, colors: ['#ffe066', '#ff6fb8', '#ffffff'], speed: 6, size: 0.15, life: 1.6, grav: 3, up: 5 });
  burst(E.bolt + 0.8, [3.4, 1, -9.6], { n: 60, colors: ['#ff9ad0', '#ffffff'], speed: 5, size: 0.16, life: 1, grav: 6, up: 3 }); burst(E.bolt + 4, [-1, 1.6, 4], { n: 40, colors: ['#3d7bff', '#ffffff'], speed: 4, size: 0.14, life: 0.8, grav: 6, up: 3 });
  for (let t = E.rip; t < E.rip + 1.2; t += 0.2) burst(t, [-16.8, 3.2, 1.3], { n: 8, colors: ['#fff3cf', '#e8d8a8'], speed: 2.4, size: 0.12, life: 1.4, grav: 2, up: 2 });
  for (let t = E.purr; t < E.named; t += 0.5) burst(t, [-15.6, 2.6, 4], { n: 2, colors: ['#ff6fb8'], speed: 0.5, size: 0.22, life: 1.2, grav: -1.5, up: 0.5 });
  const C = [[E.travel, 3, 1.5, 32, 0, 2, 62, 50], [61.9, 4, 2.2, 16, 0, 1.6, 24, 50], [62, 0, 14, 36, 0, 2, -6, 56], [67.3, 8, 12, 32, 0, 2, -6, 54], [67.4, 0.4, 2.6, -4.2, 0, 2.4, -9.5, 44], [75.7, 1.2, 2.4, -5.2, 0, 2.3, -9.5, 40],
    [75.8, 0, 3.4, -11, 0.6, 1.3, -4, 52], [81.9, -2, 3.2, -11, 0.6, 1.3, -4, 50], [82, 3.6, 1.6, -1.0, -1, 1.4, -5.4, 46], [88.5, 2.6, 1.6, -0.6, -1, 1.4, -5.4, 44], [88.6, -1.2, 2.1, -8.6, -1.2, 1.7, -4, 46], [92.9, -0.6, 2.1, -8.2, -1.2, 1.7, -4, 44],
    [93, -11, 2.4, 10, -11, 2, 4, 46], [99.5, -10, 2.4, 10, -11, 2, 4, 44], [99.6, -12.5, 0.9, 8.5, -11, 3, 4, 52], [105.9, -9, 1.2, 9, -9, 2, 4, 50],
    [106, -6, 2.4, -3, -6, 2, 4, 50], [108.6, -2, 3, -3, -1, 2.5, 4, 50], [111, 1, 4, -4, 1, 3, 4, 52], [114.6, 0, 8, -6, 2, 6, 9, 54], [118.9, 7, 2.6, -2, 4, 1, 6, 50], [119, 8, 1.8, 0.6, 5, 1.4, 4.4, 44], [120.3, 8, 1.8, 1.0, 5, 1.4, 4.4, 42],
    [120.4, 9.6, 1.8, 0.2, 6, 1.2, 4, 46], [127.9, 9.2, 1.8, -0.2, 7, 1.2, 4, 44], [128, 4, 3, 11, 7, 1.4, 4, 52], [131.3, 7, 3, 11, 9, 1.4, 5, 52], [131.4, 12.6, 1.6, 10.8, 12.2, 0.8, 7, 40], [133.9, 12.2, 1.6, 10.4, 12.2, 0.8, 7, 38],
    [134, 9, 3, 11, 11, 1.4, 4, 52], [137.3, 12, 3, 11, 13, 1.4, 4, 50], [137.4, 18, 1.2, 7, 13.5, 2, 4, 52], [139.9, 18, 1.6, 7.6, 13.5, 2, 4, 50],
    [140, -12, 2.8, 21, -12, 1.2, 14, 48], [145.5, -11, 2.6, 20, -12, 1.2, 14, 46], [145.6, -8, 2.4, 19.5, -10, 1.6, 14, 40], [150.3, -7.8, 2.4, 19.1, -10, 1.6, 14, 38],
    [150.4, 0, 6, 0, 0, 3, -14, 56], [155.5, 0, 5.4, -2, 0, 3, -14, 52], [155.6, 0, 2.6, -7, 0, 2.5, -13, 44], [160.1, 0, 2.6, -8.6, 0, 2.5, -13, 34], [160.2, 8, 5, 0, 0, 2, -12, 56], [E.bolt + 1, 9, 6, 2, 0, 1.5, -9, 56],
    [E.chaseEnd, -8, 4.5, 0, -17, 1.6, 4, 50], [180.5, -8.6, 4.2, 0.4, -17, 1.6, 4, 46], [180.6, -11, 2.6, -1.5, -15.6, 1.4, 4, 46], [185.3, -11.4, 2.6, -1.0, -16, 1.6, 3, 44], [185.4, -9, 4.2, 0, -15.7, 1.8, 3, 46], [189.5, -9.4, 4.0, 0.4, -15.7, 1.8, 3, 42],
    [189.6, -10, 3.4, 9, -16, 1.8, 3, 50], [192.3, -10.6, 3.4, 8.6, -16, 1.8, 3, 48], [192.4, -7, 3.4, -2, -14, 1.4, 2, 50], [197.3, -7.4, 3.4, -2.4, -14, 1.4, 2, 48], [197.4, -13.2, 2.8, 1.0, -16.8, 2.6, 1.3, 40], [202.7, -13.6, 2.8, 0.4, -16.8, 2.6, 1.3, 36],
    [202.8, -12, 3.6, 4.4, -16.8, 2.6, 1.3, 44], [206.5, -12.4, 3.6, 4.8, -16.8, 2.6, 1.3, 42], [206.6, -8, 4, 8, -17, 2, 3, 52], [E.board + 1.4, -8, 4, 8, -17, 2, 3, 52]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; [duckA, duckB, duckC, duckD, fish].forEach(d => d.visible = false); muffin.root.visible = puff.root.visible = bot.root.visible = false; card.visible = false;
    [twin, third, hero].forEach(h => parentTo(h.root, g)); parentTo(bloop6.B.root, g); parentTo(L6.root, g); parentTo(tock.root, g); twin.root.visible = third.root.visible = tock.root.visible = hero.root.visible = true; prop.rotation.y = t * (win(t, E.prop, E.bonk + 0.4) ? 40 : 14);
    rain.forEach((d, i) => { if (i >= 9) d.visible = false; }); [duke, ...lumpy, ...fans, sofie].forEach(c => parentTo(c.root, g)); [couchRace, couchMini].forEach(c => { parentTo(c.g, g); resetCouch(c); });
    balloons.forEach((b, i) => { b.position.y = 6 + Math.sin(t * 1.3 + i) * 0.3; b.rotation.z = Math.sin(t + i) * 0.1; });
    const ld = t > E.leggyCalm + 3 ? 8 : 9; leggyDucks(t, ld); ribbon.visible = t > E.ribbon;
    // the wagon: arrival, parked, then the chase
    parentTo(wagon.root, g); const wk = ss(seg(t, E.travel, E.arrive - 0.4)); let WP = [0, 0.5, lerp(64, 24, wk)], wy = PI;
    if (t > E.chaseEnd - 6) { const a = lag(Math.min(t, E.chaseEnd), 3.2); WP = [a.p[0], 0.5, a.p[2]]; wy = a.yaw; if (t > E.chaseEnd) { WP = [-10, 0.5, 7.5]; wy = -PI / 2 - 0.4; } }
    poseWagon(wagon, t, WP, wy, -t * (t < E.arrive || win(t, E.chaseEnd - 6, E.chaseEnd) ? 4 : 0));
    // the sofa
    const sw = walker(t, sofaK); let sy = sw.yaw, so = { awake: t > E.blink, walk: sw.walk > 0.05 ? 1.2 : 0, phase: sw.phase * 1.6, look: t > E.blink && t < E.alive ? Math.sin(t * 2) : 0 };
    if (t < E.bolt) { sy = 0; so.hop = win(t, E.alive, E.bolt) && Math.floor(t * 2) % 2; } if (win(t, E.chaseEnd, E.board + 1.4)) { sy = lerp(-PI / 2, PI / 2, ss(seg(t, E.chaseEnd, E.chaseEnd + 0.8))); so.purr = t > E.purr; so.crouch = t < E.leggyCalm + 3; }
    let SP = [...sw.p]; if (win(t, E.bolt + 2.6, E.bolt + 4)) SP[1] += Math.sin(seg(t, E.bolt + 2.6, E.bolt + 4) * PI) * 2.4; if (win(t, E.bolt + 4, E.bolt + 5.4)) SP[1] += Math.sin(seg(t, E.bolt + 4, E.bolt + 5.4) * PI) * 4;
    poseSofa(sofie, t, SP, sy, so); sofie.root.visible = true; const P = [SP[0], SP[1] + sofaBob(), SP[2]];
    sheet.visible = t < E.unveil + 1.2; { const k = seg(t, E.unveil, E.unveil + 1.2); sheet.position.set(0, 3.3 + k * k * 14, -14); sheet.rotation.set(k * 0.8, 0, k * 1.2); }
    // Duke Fluffington
    duke.root.visible = true; let dp = [0, 1.5, -9.5], dy = 0, dO = { mega: true, hop: win(t, E.duke, E.duke + 2) };
    if (win(t, E.prize, E.bolt + 3)) dp = [3.4, 0.5, -9.6];
    if (win(t, E.squint, E.leg1)) { dp = L3([-3.4, 0.5, -6], [1, 0.5, -6], seg(t, E.squint, E.squint + 6)); dy = PI; dO = { squint: true, mega: false }; }
    if (win(t, E.leg1, E.pets)) { dp = [15.6, 0.5, 1.4]; dy = -PI / 2 - 0.3; dO = { wave: win(t, E.win, E.pets), mega: !win(t, E.win, E.pets) }; }
    if (win(t, E.pets, E.prize)) { dp = [-16.5, 0.5, 16]; dy = 2.0; dO = { squint: t < E.ribbon - 3, hop: t > E.ribbon, wave: t > E.ribbon }; }
    if (win(t, E.bolt + 0.6, E.bolt + 3)) dO = { squish: lerp(0.25, 1, seg(t, E.bolt + 1.8, E.bolt + 3)) };
    if (t > E.chaseEnd) { dp = [-11.4, 0.5, 0.2]; dy = -1.2; dO = { wave: win(t, E.named, E.named + 4), mega: t > E.named + 4 }; }
    poseCushion(duke, t, dp, dy, dO);
    // Team Lumpy + the crowd
    lumpy.forEach((c, i) => { c.root.visible = true; let p = [2 + i * 1.1, 0.5, -4.4], y = PI, o = { seed: i, hop: win(t, E.rules, E.rules + 3) };
      if (t > E.leg1) { p = [[-9.6, 1.5, 4], [8, 0.5, 9], [5.4, 0.5, 7]][i]; y = [-PI / 2, PI, PI / 2][i]; o = { seed: i }; }
      if (i === 0 && win(t, E.leg1, E.pets)) { o.swing = t < E.bonk; if (t > E.bonk) { p = L3([-9.6, 1.5, 4], [-9.2, 0.5, 5.6], seg(t, E.bonk, E.bonk + 0.5)); o = { flat: true, sleep: true }; } }
      if (i === 2 && win(t, E.leg3, E.pets)) { p = [lerp(5.4, 11.6, seg(t, E.leg3, E.nap)), 0.5, 7]; o = { hop: t < E.nap, sleep: t > E.nap, seed: 2 }; }
      if (t > E.prize) { p = [3 + i * 1.1, 0.5, -4.4]; y = PI; o = { seed: i, hop: win(t, E.unveil, E.blink) }; } if (t > E.bolt + 1) { p = [8 + i * 1.4, 0.5, -1]; y = PI * 0.8; o = { seed: i, wave: true }; } if (t > E.chaseEnd) c.root.visible = false;
      poseCushion(c, t, p, y, o); });
    lpillow.visible = win(t, E.leg1, E.bonk); couchMini.g.visible = win(t, E.leg3, E.pets); couchMini.g.position.set(lerp(5.4, 11.6, seg(t, E.leg3, E.nap)) + 0.2, t < E.nap ? 1.2 + Math.abs(Math.sin(t * 9)) * 0.3 : 0.5, 7.4); couchMini.g.rotation.y = PI / 2;
    const cheer = win(t, E.bonk, E.bonk + 3) || win(t, E.tent, E.tent + 3) || win(t, E.win, E.pets) || win(t, E.unveil, E.blink);
    fans.forEach((c, i) => { c.root.visible = t > E.arrive && t < E.chaseEnd; poseCushion(c, t, [i < 4 ? -8 + i * 1.5 : 6 + (i - 4) * 1.5, 0.5, 9.2], PI, { hop: cheer, wave: cheer && i % 2, seed: i * 1.3 }); });
    // contestants, the race
    const rP = [lerp(6.6, 8.2, seg(t, E.leg3, E.joinIn)), 0.5, 4], cx = lerp(8.2, 14.6, ss(seg(t, E.joinIn + 2, E.win - 0.8))); couchRace.g.visible = win(t, E.leg1, E.pets); couchRace.g.rotation.y = -PI / 2;
    if (t < E.joinIn + 1.4) couchRace.g.position.set(...rP); else couchRace.g.position.set(cx, t < E.win ? lerp(0.5, 1.95, seg(t, E.joinIn + 1.4, E.joinIn + 2)) : lerp(1.95, 0.5, seg(t, E.win, E.win + 0.4)), 4);
    const line = (x, o) => ({ p: [x, 0.5, -4.4], yaw: PI, face: 'smug', ...o });
    const offW = (l, i) => L3(wl(WP, PI, l), [-2.4 + i * 1.2, 0.5, -4.4], seg(t, E.arrive, E.arrive + 4.5));
    let H_, T_, R_;
    if (t < E.arrive) { H_ = { p: wl(WP, PI, [0, 0.9, 0.4]), yaw: PI, sit: 1, face: 'scared', panic: t > 58.8 }; T_ = { p: wl(WP, PI, [-0.7, 0.9, -0.6]), yaw: PI, sit: 1, face: 'smug', wave: true }; R_ = { p: wl(WP, PI, [0.7, 0.9, -0.6]), yaw: PI, sit: 1, face: 'scared' }; }
    else if (t < E.leg1) { const wk2 = t < E.arrive + 4.5 ? 1 : 0; H_ = line(-1.2, { p: offW([0, 0.9, 0.4], 1), walk: wk2, phase: t * 8 }); T_ = line(-2.4, { p: offW([-0.7, 0.9, -0.6], 0), walk: wk2, phase: t * 8, wave: win(t, 85.6, 88.6) }); R_ = line(0, { p: offW([0.7, 0.9, -0.6], 2), walk: wk2, phase: t * 8, hips: win(t, 88.6, 90.4) });
      if (t > E.squint) { H_.face = T_.face = R_.face = 'scared'; } if (t > 90.4) H_.face = 'smug'; }
    else if (t < E.prize) {
      // past me: pillow fight, propeller lift, bonk, run, tag
      const tp = t < E.prop ? [-12, 1.5, 4] : t < E.bonk ? [-12 + seg(t, E.prop, E.bonk) * 1.6, 1.5 + Math.sin(seg(t, E.prop, E.bonk) * PI) * 2.2 + seg(t, E.prop, E.prop + 0.6) * 0.4, 4] : null;
      if (tp) T_ = { p: tp, yaw: PI / 2, face: t < E.prop ? 'smug' : 'scared', swing: t < E.prop ? t * 1.4 : t * 3 }; else { const a = act(t, [[E.bonk, -10.4, 1.5, 4], [E.bonk + 1.4, -8, 1.5, 4], [E.leg2 - 0.4, -7, 0.5, 4], [E.joinIn, -7, 0.5, 4], [E.joinIn + 1.4, cx - 1.2, 0.5, 4], [E.win, cx - 1.2, 0.5, 4]], [[0, { face: 'smug' }], [E.leg2, { yaw: PI / 2, face: 'smug', wave: t < E.leg2 + 3 }], [E.joinIn, { face: 'smug' }], [E.joinIn + 1.4, { yaw: PI / 2, face: 'scared', panic: true, walk: 1, phase: t * 10 }], [E.win, { face: 'smug', wave: true, yaw: 0 }]]); T_ = a; if (t > E.joinIn + 1.4 && t < E.win) T_.p = [cx - 1.2, 0.5, 4]; }
      pillow.visible = t < E.leg2;
      // future me: bounce sprint onto the tent, slide, tag
      const bk = [[E.leg2, -6.5, 0.5, 4, 0], [E.leg2 + 1.2, -4, 1.5, 4, 1.0], [E.leg2 + 2.4, -1, 1.5, 4, 1.6], [E.leg2 + 3.6, 2, 1.5, 4, 2.4], [E.bounce, -1, 1.5, 4, 3.4], [E.bounce + 1.2, 2, 1.5, 4, 4.4], [E.tent, 2, 6.5, 10, 7], [E.tent + 2.2, 4.2, 0.5, 6.6, 0], [E.tag2, 4.6, 0.5, 4.6, 0]];
      if (t < E.leg2) R_ = { p: [-6.5, 0.5, 4], yaw: -PI / 2, face: 'smug', hips: true }; else if (t < E.tag2) R_ = { p: arcPath(t, bk), yaw: t < E.tent ? PI / 2 : 0.6, face: t > E.bounce ? 'scared' : 'smug', panic: win(t, E.bounce, E.tent), flat: win(t, E.tent, E.tent + 2.2) ? 1 : 0 };
      else { const a = act(t, [[E.tag2, 4.6, 0.5, 4.6], [E.joinIn, 4.6, 0.5, 4.6], [E.joinIn + 1.4, cx + 1.2, 0.5, 4]], [[0, { yaw: PI / 2, face: 'smug', wave: t < E.tag2 + 1 }], [E.joinIn, { face: 'smug' }], [E.joinIn + 1.4, { yaw: PI / 2, face: 'scared', panic: true, walk: 1, phase: t * 10 + 1 }], [E.win, { face: 'smug', wave: true, yaw: 0 }]]); R_ = a; if (t > E.joinIn + 1.4) R_.p = [cx + 1.2, 0.5, 4]; }
      // me: wait, drag the couch, carry it with me and me, win
      if (t < E.leg3) H_ = { p: [5.4, 0.5, 4.6], yaw: -PI / 2, face: 'smug', hips: t < E.tag2 - 2 }; else if (t < E.joinIn + 1.4) H_ = { p: [rP[0] - 1.3, 0.5, 4], yaw: PI / 2, face: 'scared', walk: 0.6, phase: t * 3, lean: 0.4 }; else H_ = { p: [cx, 0.5, 4], yaw: PI / 2, face: t < E.win ? 'scared' : 'smug', panic: t < E.win, walk: t < E.win ? 1 : 0, phase: t * 10 + 2, wave: t > E.win };
      if (t > E.pets) { H_ = { p: [13, 0.5, 2], yaw: 0, face: 'smug' }; T_ = { p: [12, 0.5, 2.6], yaw: 0.2, face: 'smug' }; R_ = { p: [14, 0.5, 2.6], yaw: -0.2, face: 'smug' }; }
    } else {
      // prize, the bolt, the chase, the purr, the ride home
      H_ = line(-1.2, { face: t > E.blink ? 'scared' : 'smug', wave: win(t, E.unveil, E.blink) }); T_ = line(-2.4, { hop: false, wave: win(t, E.unveil, E.blink) }); R_ = line(0, { hips: win(t, E.blink, E.alive), face: 'smug' });
      if (t > E.alive) { H_.panic = T_.panic = R_.panic = true; H_.face = T_.face = R_.face = 'scared'; }
      if (t > E.bolt + 1) { [[1.4, -1], [2.0, 1], [2.6, 0]].forEach(([d, side], i) => { const a = lag(Math.min(t, E.chaseEnd), d); const o = { p: [a.p[0] + side * 1.2, 0.5, a.p[2] + side * 1.2], yaw: a.yaw, walk: t < E.chaseEnd ? 1.2 : 0, phase: a.phase * 2, face: 'scared', panic: t < E.chaseEnd };
        if (t > E.chaseEnd) { o.p = [[-11, 0.5, 2.6], [-11.6, 0.5, 5.6], [-10.8, 0.5, 4.2]][i]; o.yaw = -PI / 2; o.face = t > E.purr ? 'smug' : 'scared'; o.panic = false; } if (i === 0) H_ = o; else if (i === 1) T_ = o; else R_ = o; }); }
      if (t > E.board) { const k = seg(t, E.board, E.board + 1.4); const ride = (h, l, o) => pose(h, { t, p: L3([h.root.position.x, 0.5, h.root.position.z], wl(P, sy, l), k), yaw: sy, sit: k, face: 'smug', ...o });
        ride(hero, [SEAT.hero, 1.5, 0.2], { wave: t > E.board + 3 }); ride(twin, [SEAT.twin, 1.5, 0.2], {}); ride(third, [SEAT.third, 1.5, 0.2], { hips: true }); H_ = T_ = R_ = null; }
    }
    if (H_) pose(hero, { t, ...H_ }); if (T_) pose(twin, { t, ...T_ }); if (R_) pose(third, { t, ...R_ });
    // Bloop
    let bp, by, bo = {};
    if (t < E.arrive) { bp = wl(WP, PI, [0, 1.1, -1.4]); by = PI; bo = { hop: true }; }
    else if (t < E.leg1) { bp = [-4.6, 0.5, -3]; by = PI; } else if (t < E.pets) { bp = [11, 0.5, 1]; by = 0.4; bo = { hop: cheer }; } else if (t < E.bolt + 1) { bp = [-4, 0.5, -3.4]; by = PI; bo = { angry: t > E.alive }; }
    else if (t < E.chaseEnd) { bp = wl(WP, wy, [0, 1.1, -1.2]); by = wy; bo = { angry: true }; }
    else if (t < E.bloopSit) { bp = wl(WP, wy, [0, 1.1, -1.2]); by = wy; bo = {}; }
    else { const k = seg(t, E.bloopSit, E.bloopSit + 1.6); bp = L3(wl(WP, wy, [0, 1.1, -1.2]), wl(P, sy, [SEAT.bloop, 1.7, 0.2]), k); bp[1] += Math.sin(k * PI) * 1.2; by = sy; bo = { hop: win(t, E.bloopSit + 2, E.rip), handOut: win(t, E.rip - 1.6, E.rip + 0.3) }; card.visible = win(t, E.rip - 1.6, E.rip); }
    poseBurble(bloop6, t, bp, by, bo); bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.visible = true;
    // Leggy: pulls the wagon, wins fluffiest pet, calms the sofa
    let lp, ly, ls = 0.3;
    if (t < E.arrive) { lp = wl(WP, PI, [0, 0, 3.8]); ly = PI; ls = 3; } else if (t < E.leg1) { lp = [-6.6, 0.5, -2.4]; ly = PI; } else if (t < E.pets) { lp = [-17, 0.5, 0]; ly = 0.8; }
    else if (t < E.prize) { lp = [-10, 0.5, 14]; ly = 0.2; ls = t > E.ribbon ? 1.4 : 0.3; } else if (t < E.bolt + 1) { lp = [-6.4, 0.5, -2.6]; ly = PI; }
    else if (t < E.leggyCalm) { lp = wl(WP, wy, [0, 0, 3.8]); ly = wy; ls = t < E.chaseEnd ? 3 : 0.3; }
    else if (t < E.leggyCalm + 3.4) { const a = walker(t, [[E.leggyCalm, ...wl(WP, wy, [0, 0, 3.8])], [E.leggyCalm + 2.6, -14.8, 0.5, 4]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : -PI / 2; ls = 0.8; }
    else { const k = seg(t, E.leggyCalm + 3.4, E.leggyCalm + 4.6); lp = L3([-14.8, 0.5, 4], wl(P, sy, [SEAT.leggy, 1.7, 0]), k); lp[1] += Math.sin(k * PI) * 1.4; ly = sy; ls = 0.2; }
    poseLurk(L6, t, lp, ly, ls); L6.root.visible = true;
    rain[8].visible = true; if (t > E.leggyCalm + 3) { parentTo(rain[8], sofie.body); rain[8].position.set(3.6, 1.85, 0.7); rain[8].rotation.set(0, 0, 0); rain[8].scale.setScalar(1); }
    // Muffin and Puff are the other pet-show entrants
    if (win(t, E.pets, E.prize)) { muffin.root.visible = puff.root.visible = true; parentTo(muffin.root, g); parentTo(puff.root, g); poseMuffin(muffin, t, [-14, 0.5, 14], 0.2, { hop: t < E.ribbon }); poseMag(puff, t, [-12, 0.6, 14], 0.1); }
    // Tock
    poseTock(tock, t, t < E.arrive ? wl(WP, PI, [0, 3.2, 0]) : t < E.leg1 ? [-3.6, 3.4, -5] : t < E.pets ? [12, 6.4, 3] : t < E.bolt ? [-2, 4, -6] : t < E.chaseEnd ? [P[0], 5, P[2] + 2] : wl(P, sy, [0, 3.35, -1.0]), 0, { fly: t < E.chaseEnd + 1, alarm: win(t, E.alive, E.purr) });
    let cam = camKeys(t, C);
    if (win(t, E.bolt + 1, E.chaseEnd)) cam = follow(SP, [7 * Math.cos(t * 0.25), 6, 11], 1.6, 54);
    if (t > E.board + 1.4) cam = follow(P, [-9, 5, 7], 1.2, 52);
    return { cam, hud: true };
  }
  return { g, update };
})();
