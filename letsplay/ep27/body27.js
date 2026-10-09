// ---------------------------------------------------------------- Ep 27 helpers: the Bloopmobile, Officer Coney + the cone cousins, the two shards, the treadmill road
function hide26() { hide25(); [owl.root, rex.root, cart26, vaseA, vaseB, vaseShards, rexPile, boneT, skullF, paintP].forEach(o => o.visible = false); }
TX.asphalt = ctex(16, noisy(['#3a3a42', '#34343c', '#404048', '#2e2e36']), 2701);
TX.mesa = ctex(16, (g, r, n) => { noisy(['#c8643a', '#d0703e', '#b85a34', '#c86a40'])(g, r, n); g.fillStyle = '#e8a060'; g.fillRect(0, 4, 16, 2); g.fillStyle = '#9a4428'; g.fillRect(0, 11, 16, 2); }, 2702);
TX.cactus = ctex(16, (g, r, n) => { noisy(['#3c8a3a', '#347a32', '#449a42'])(g, r, n); g.fillStyle = '#e8f0b0'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 2703);
TX.dune = ctex(16, noisy(['#f0d090', '#e8c482', '#f6dca0', '#e2bc78']), 2704);
MAT.asphalt = lam(TX.asphalt); MAT.mesa = lam(TX.mesa); MAT.cactus = lam(TX.cactus); MAT.dune = lam(TX.dune);
// treadmill: the world scrolls past a parked camera rig. scroll = periodic scenery (period P), local = one-off props at absolute road distance
function lane27(g, P = 32) { const scroll = pivot(g, 0, 0, 0), local = pivot(g, 0, 0, 0); return { scroll, local, at(d) { scroll.position.z = -(((d % P) + P) % P); local.position.z = -d; } }; }
// distance travelled from a speed curve K = [[t, v], ...]
function dist27(K, t0, t1) { const dt = 0.05, n = Math.ceil((t1 - t0) / dt) + 2, D = new Float64Array(n); for (let i = 1; i < n; i++) { const a = t0 + (i - 1) * dt; D[i] = D[i - 1] + (lerpK(K, a) + lerpK(K, a + dt)) * 0.5 * dt; }
  return t => { const u = clamp((t - t0) / dt, 0, n - 1.001), i = Math.floor(u); return lerp(D[i], D[i + 1], u - i); }; }
const SEAT27 = { h: [-1.0, 1.4, 1.2], l: [1.0, 0.6, -0.5], b: [-1.15, 1.6, -2.0] };
const seat27 = (vp, vy, l, bob = 0) => { const q = wl(vp, vy, l); q[1] += bob; return q; };
// two-sided signboard on posts
function board27(lines, w, h, parent, x, y, z, ry = 0, bg = '#f6e7c1', fg = '#8a1020', cw = 512, ch = 192, size = 54, posts = true) { const p = pivot(parent, x, 0, z); p.rotation.y = ry; const mat = txtMat26(lines, cw, ch, bg, fg, size);
  box(w + 0.3, h + 0.3, 0.2, '#5a3a22', 0, y, 0, p); plane26(w, h, mat, p, 0, y, 0.11); plane26(w, h, mat, p, 0, y, -0.11, PI);
  if (posts) for (const s of [-1, 1]) box(0.25, y, 0.25, '#5a3a22', s * w * 0.35, y / 2, 0, p); return p; }
function card27(lines, bg, fg) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), txtMat26(lines, 192, 112, bg, fg, 32)); m.material.side = THREE.DoubleSide; const gr = new THREE.Group(); gr.add(m); return gr; }
function shack27(parent, x, z, lines, col = '#c08a40') { const p = pivot(parent, x, 0.5, z); box(4.4, 3, 3.2, col, 0, 1.5, 0, p); box(5, 0.4, 3.8, '#c0182a', 0, 3.2, 0, p); box(4.8, 0.15, 1.0, '#ffffff', 0, 2.4, -2.0, p);
  box(1.6, 1.0, 0.06, '#5ff7ff', -0.9, 1.6, -1.62, p); box(0.9, 1.8, 0.06, '#6a4020', 1.2, 0.9, -1.62, p); box(3.8, 1.0, 0.15, '#5a3a22', 0, 3.95, -0.9, p);
  plane26(3.6, 0.8, txtMat26(lines, 384, 84, '#ffe066', '#c0182a', 50), p, 0, 3.95, -0.99, PI); return p; }
// ---- the Bloopmobile (Bloop-built, open-top, 300-mile warranty)
const vanLightM = new THREE.MeshBasicMaterial({ color: '#fff4b0' });
function makeVan() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), teal = '#2ec4b6', yel = '#ffd23f', wheels = [];
  box(4.0, 0.5, 7.4, '#3a3a44', 0, 0.85, 0, body);
  box(0.2, 1.1, 5.8, teal, -1.9, 1.65, -0.7, body); box(0.22, 0.18, 5.82, yel, -1.9, 1.8, -0.7, body);
  box(0.2, 1.1, 3.4, teal, 1.9, 1.65, -1.9, body); box(0.22, 0.18, 3.42, yel, 1.9, 1.8, -1.9, body);
  const door = pivot(body, 1.9, 1.1, -0.2); box(0.2, 1.1, 2.4, teal, 0, 0.55, 1.2, door); box(0.22, 0.18, 2.42, yel, 0, 0.7, 1.2, door); box(0.08, 0.12, 0.3, '#c0c0c8', 0.12, 0.8, 2.0, door);
  box(4.0, 1.1, 0.2, teal, 0, 1.65, -3.6, body); box(4.02, 0.18, 0.22, yel, 0, 1.8, -3.6, body);
  box(3.8, 0.7, 1.5, teal, 0, 1.45, 2.95, body); box(3.82, 0.12, 1.52, yel, 0, 1.84, 2.95, body); box(0.9, 0.45, 0.06, '#1a1a20', 0, 1.35, 3.72, body);
  for (const x of [-1.35, 1.35]) box(0.6, 0.4, 0.08, 0, x, 1.45, 3.72, body, vanLightM);
  box(4.1, 0.3, 0.3, '#c0c0c8', 0, 0.9, 3.85, body); box(4.1, 0.3, 0.3, '#c0c0c8', 0, 0.9, -3.8, body); box(0.2, 0.2, 0.6, '#888890', -1.4, 0.75, -3.9, body);
  for (const x of [-1.8, 1.8]) box(0.14, 1.2, 0.14, '#e0e0e8', x, 2.4, 2.2, body); box(3.74, 0.14, 0.14, '#e0e0e8', 0, 3.0, 2.2, body);
  const glass = box(3.5, 1.05, 0.04, 0, 0, 2.4, 2.2, body, new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.22, depthWrite: false })); glass.castShadow = false;
  for (const x of [-1.8, 1.8]) box(0.16, 2.1, 0.16, '#e0e0e8', x, 2.15, -2.8, body); box(3.76, 0.16, 0.16, '#e0e0e8', 0, 3.2, -2.8, body);
  box(1.4, 0.6, 1.0, '#c0182a', -0.8, 3.6, -2.8, body); box(1.2, 0.5, 0.9, '#7a5232', 0.7, 3.55, -2.8, body); box(0.9, 0.4, 0.8, '#5ff7ff', -0.2, 4.05, -2.8, body);
  box(1.2, 0.5, 1.0, '#8a5a2b', -1.0, 1.35, 1.2, body); box(1.2, 1.0, 0.2, '#8a5a2b', -1.0, 1.85, 0.6, body); box(1.3, 0.5, 1.1, '#8a5a2b', -1.15, 1.35, -2.0, body);
  const sw = pivot(body, 1.0, 2.15, 1.85); { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 6, 12), new THREE.MeshLambertMaterial({ color: '#222' })); sw.add(ring); box(0.5, 0.08, 0.06, '#222', 0, 0, 0, sw); }
  plane26(3.4, 0.55, txtMat26(['BLOOPMOBILE'], 320, 52, teal, '#ffffff', 40), body, -2.01, 1.45, -0.7, -PI / 2);
  for (const [x, z] of [[-2.05, 2.5], [2.05, 2.5], [-2.05, -2.4], [2.05, -2.4]]) { const w = pivot(root, x, 0.65, z); box(0.4, 1.3, 1.3, '#1a1a1a', 0, 0, 0, w); box(0.44, 0.5, 0.5, '#c0c0c8', 0, 0, 0, w); wheels.push(w); }
  const cap = box(0.08, 0.8, 0.8, '#ffd23f', -0.25, 0, 0, wheels[0]);
  root.traverse(o => { if (o.isMesh && o !== glass) o.castShadow = true; }); return { root, body, door, wheels, cap, sw }; }
function poseVan(v, t, p, yaw, o = {}) { v.root.position.set(...p); v.root.rotation.set(0, yaw, 0); const f = o.flat || 0; v.root.scale.set(1 + f * 0.3, Math.max(0.12, 1 - f * 0.88), 1 + f * 0.15);
  v.body.position.set(0, o.bob || 0, 0); v.body.rotation.set(o.pitch || 0, 0, o.roll2 || 0); v.wheels.forEach(w => w.rotation.x = o.roll || 0); v.sw.rotation.z = o.steer || 0; }
// ---- Officer Coney (a traffic cone with a badge, a moustache and a siren on his hat) + his cousins (regular cones. with faces.)
function makeCone27(s = 1, cop = true) { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), or = '#ff7a1a', wh = '#f8f8f8';
  box(1.1, 0.16, 1.1, '#2a2a30', 0, 0.08, 0, body);
  [[0.9, 0.5, 0.41, or], [0.74, 0.42, 0.87, wh], [0.6, 0.5, 1.33, or], [0.44, 0.36, 1.76, wh], [0.3, 0.2, 2.04, or]].forEach(([w, h, y, c]) => box(w, h, w, c, 0, y, 0, body));
  const eyeW = new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupils = [];
  for (const x of [-0.14, 0.14]) { box(0.16, 0.16, 0.04, 0, x, 1.42, 0.31, body, eyeW); pupils.push(box(0.07, 0.08, 0.04, '#111', x, 1.41, 0.335, body)); }
  const aL = pivot(body, -0.42, 1.1, 0), aR = pivot(body, 0.42, 1.1, 0); for (const a of [aL, aR]) { box(0.14, 0.5, 0.14, or, 0, -0.22, 0, a); box(0.16, 0.14, 0.16, wh, 0, -0.5, 0, a); }
  let siren = null, light = null, pad = null;
  if (cop) { box(0.4, 0.09, 0.08, '#3a2a1a', 0, 1.22, 0.32, body); box(0.56, 0.2, 0.56, '#1a2a5a', 0, 2.22, 0, body); box(0.6, 0.05, 0.34, '#111', 0, 2.12, 0.22, body); box(0.14, 0.12, 0.04, 0, 0, 2.24, 0.29, body, goldM);
    siren = box(0.2, 0.18, 0.2, 0, 0, 2.41, 0, body, new THREE.MeshBasicMaterial({ color: '#ff2a2a' })); light = new THREE.PointLight('#ff2a2a', 0, 16, 1.4); light.position.set(0, 2.7, 0); body.add(light);
    pad = box(0.3, 0.4, 0.05, '#ffffff', 0, -0.6, 0.12, aR); }
  else box(0.3, 0.06, 0.05, '#2a1d14', 0, 1.24, 0.31, body);
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, aL, aR, pupils, siren, light, pad }; }
function poseCone(c, t, p, yaw, o = {}) { c.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.45 : 0), p[2]); c.root.rotation.set(0, yaw, 0);
  c.body.rotation.set(o.lean || 0, 0, o.walk ? Math.sin(t * 10) * 0.1 : o.wobble ? Math.sin(t * 7 + (o.seed || 0)) * 0.15 : 0);
  c.aL.rotation.set(o.cheer ? -2.6 + Math.sin(t * 14) * 0.3 : 0, 0, -0.15);
  c.aR.rotation.set(o.point ? -1.6 : o.stop ? -2.9 + Math.sin(t * 8) * 0.2 : o.write ? -1.0 + Math.sin(t * 16) * 0.12 : o.cheer ? -2.6 + Math.cos(t * 14) * 0.3 : o.whistle ? -2.2 : 0, 0, 0.15);
  c.pupils.forEach(m => m.scale.setScalar(o.wide ? 1.7 : 1));
  if (c.siren) { const on = !!o.siren, ph = Math.floor(t * 6) % 2; c.siren.material.color.set(on ? (ph ? '#ff2a2a' : '#2a6aff') : '#802020'); c.light.intensity = on ? 9 : 0; c.light.color.set(ph ? '#ff2a2a' : '#2a6aff'); c.pad.visible = !!o.pad; } }
const van = makeVan();
const coney = makeCone27(1, true), cousins = Array.from({ length: 6 }, () => makeCone27(0.55, false));
const scooter = new THREE.Group(); { box(0.7, 0.14, 1.8, '#e8344e', 0, 0.45, 0, scooter); for (const z of [-0.75, 0.75]) box(0.16, 0.6, 0.6, '#1a1a1a', 0, 0.3, z, scooter); box(0.1, 1.2, 0.1, '#c0c0c8', 0, 1.1, 0.8, scooter); box(0.9, 0.1, 0.1, '#c0c0c8', 0, 1.7, 0.8, scooter); box(0.3, 0.2, 0.08, 0, 0, 1.4, 0.86, scooter, vanLightM); }
// ---- props: the map (it has a top and a bottom), cards, the marshmallow
const mapM27 = canMat26(160, 112, (g, w, h) => { g.fillStyle = '#f2e6c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#3cc26a'; g.fillRect(10, 50, 22, 16); g.fillRect(126, 40, 20, 22); g.strokeStyle = '#c0182a'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 22); g.lineTo(58, 42); g.lineTo(100, 70); g.lineTo(80, 94); g.stroke();
  g.fillStyle = '#ff5cf0'; g.beginPath(); g.moveTo(80, 2); g.lineTo(94, 18); g.lineTo(80, 34); g.lineTo(66, 18); g.fill(); g.fillStyle = '#5ff7ff'; g.fillRect(78, 95, 5, 5); g.fillStyle = '#2a1d14'; g.textAlign = 'center'; g.font = 'bold 14px sans-serif'; g.fillText('BIGGEST', 124, 20); g.font = 'bold 9px sans-serif'; g.fillText('smallest', 112, 104); }, 0.3);
mapM27.side = THREE.DoubleSide; const map27 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), mapM27); hero.body.add(map27); map27.position.set(0, 1.3, 0.5); map27.visible = false;
const warr27 = card27(['WARRANTY', '300 MILES'], '#fff8e0', '#2a6a3a'), inv27a = card27(['INVOICE', '1 CAMPFIRE'], '#ffffff', '#c0182a'), inv27b = card27(['INVOICE', '1 VAN (flat)'], '#ffffff', '#c0182a');
for (const c of [warr27, inv27a, inv27b]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const lic27 = card27(['LICENSE', 'LEGGY  :)'], '#e8f4ff', '#2a4a8a'); L6.hd.add(lic27); lic27.position.set(0, -0.45, 1.05); lic27.visible = false;
const tick27 = card27(['PARKING', 'TICKET'], '#ffe066', '#2a1d14'); tick27.visible = false;
const marshM = new THREE.MeshLambertMaterial({ color: '#fffaf0', emissive: '#806040', emissiveIntensity: 0.2 }), burntM = new THREE.MeshLambertMaterial({ color: '#1a1410' });
const marsh27 = new THREE.Group(); box(0.05, 1.1, 0.05, '#8a5a2b', 0, -1.1, 0, marsh27); const marshB = box(0.2, 0.2, 0.2, 0, 0, -1.7, 0, marsh27, marshM); hero.aR.add(marsh27); marsh27.visible = false;
// ---- the shards: the world's smallest (on a velvet cushion, with a magnifying glass) and the world's biggest
const tinyStand = new THREE.Group(); { box(0.9, 1.2, 0.9, '#f0ece4', 0, 1.1, 0, tinyStand); box(0.5, 0.12, 0.5, '#c0182a', 0, 1.76, 0, tinyStand); const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#5ff7ff' })); c.position.y = 1.88; tinyStand.add(c);
  const mg = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), goldM); mg.position.set(0, 2.3, -0.5); tinyStand.add(mg); box(0.06, 1.8, 0.06, 0, 0.5, 1.4, -0.5, tinyStand, goldM);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshLambertMaterial({ color: '#cff4ff', transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); lens.position.set(0, 2.3, -0.5); tinyStand.add(lens); }
const shardM27 = new THREE.MeshLambertMaterial({ color: '#ff5cf0', emissive: '#a01890', emissiveIntensity: 0.55, flatShading: true });
const bigYaw = new THREE.Group(), bigIn = new THREE.Mesh(new THREE.OctahedronGeometry(5, 0), shardM27); bigYaw.add(bigIn); bigIn.castShadow = true; { const l = new THREE.PointLight('#ff5cf0', 6, 30, 1.4); bigYaw.add(l); }
// ---- campfire
const fire27 = new THREE.Group(); { for (const r of [0.6, -0.6]) { const l = box(1.4, 0.22, 0.22, '#6a4020', 0, 0.62, 0, fire27); l.rotation.y = r; } for (let i = 0; i < 7; i++) box(0.3, 0.2, 0.3, '#8a8a90', Math.cos(i * 0.9) * 0.9, 0.6, Math.sin(i * 0.9) * 0.9, fire27); }
const flames27 = [['#ff5a1a', 0.6, 0.9], ['#ff8a2a', 0.42, 1.15], ['#ffd23f', 0.24, 1.38]].map(([c, s, y]) => { const m = box(s, s, s, 0, 0, y, 0, fire27, new THREE.MeshBasicMaterial({ color: c })); m.castShadow = false; return m; });
const fireL27 = new THREE.PointLight('#ff9a40', 0, 24, 1.3); fireL27.position.set(0, 1.6, 0); fire27.add(fireL27);
// ---- HUD: miles to the Biggest Shard, fuel, and how many times I asked
const ASK27 = [E.rtAreWe1, E.rtAreWe1 + 2.2, E.rtAreWe1 + 4.2, E.rtAreWe2, E.rtAreWe2 + 1.6, E.rtArrive - 1, E.rtRun + 9, E.rtRun + 10.4, E.rtRun + 11.6, E.rtLot + 1];
function milesAt27(t) { if (t < E.rtTwist + 1) return Math.round(lerpK([[E.rtGo, 300], [E.rtArrive, 0]], t)); return Math.round(lerpK([[E.rtRun, 300], [E.rtLot, 0]], t)); }
function drawRoadHUD(t) { if (t >= E.freeze || t < E.rtGo - 2) return; const mi = milesAt27(t), tw = win(t, E.rtTwist + 1, E.rtTwist + 4) && Math.floor(t * 6) % 2;
  rrect(22, 96, 230, 124, 12); ctx.fillStyle = 'rgba(14,30,40,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = tw ? '#ff6b6b' : '#5ff7ff'; ctx.stroke();
  outlined(t >= E.rtLot ? 'BIGGEST SHARD: HERE' : 'BIGGEST SHARD', 137, 113, 15, '#5ff7ff', '#000', 3); outlined(t >= E.rtLot ? '0 mi' : mi + ' mi', 137, 140, 26, tw ? '#ff6b6b' : '#fff', '#000', 5);
  const legs = t >= E.rtLift, fuel = legs ? 1 : clamp(lerpK([[E.rtGo, 1], [E.rtSput, 0]], t), 0, 1), lo = !legs && fuel < 0.2 && Math.floor(t * 4) % 2;
  outlined(legs ? 'LEGS' : 'FUEL', 36, 170, 13, legs ? '#7cff6b' : '#fff', '#000', 3, 'left'); rrect(86, 162, 150, 16, 6); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  if (fuel > 0) { ctx.fillStyle = legs ? '#7cff6b' : lo ? '#ff3a2a' : '#ffd23f'; rrect(88, 164, 146 * fuel, 12, 5); ctx.fill(); } else outlined('E', 161, 170, 16, '#ff3a2a', '#000', 3);
  const n = ASK27.filter(a => t >= a).length, fl = ASK27.some(a => win(t, a, a + 1)); outlined('"are we there yet?" x' + n, 137, 200, 14, fl ? '#ffe066' : '#fff', '#000', 3); }
function drawSiren27(T) { const on = win(T, E.rtSiren, E.rtCop) || win(T, E.rtCone2, E.rtCone2 + 8) || win(T, E.rtCop3, E.rtCop3 + 2.5);
  if (on) { const ph = Math.floor(T * 6) % 2, a = ph ? 'rgba(255,40,40,.32)' : 'rgba(40,90,255,.32)', b = ph ? 'rgba(40,90,255,.32)' : 'rgba(255,40,40,.32)'; const gr = ctx.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, a); gr.addColorStop(0.28, 'rgba(0,0,0,0)'); gr.addColorStop(0.72, 'rgba(0,0,0,0)'); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  if (win(T, E.rtRun + 2, E.rtLot + 2)) { const mph = Math.round(lerpK([[E.rtRun + 2, 20], [E.rtMph - 2, 70], [E.rtMph, 112], [E.rtLot, 112], [E.rtLot + 2, 30]], T)); rrect(W - 230, H - 160, 200, 74, 14); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
    outlined(mph + ' MPH', W - 130, H - 132, 32, mph > 100 ? '#ff6b6b' : '#ffe066', '#000', 5); outlined('(on foot)', W - 130, H - 102, 14, '#fff', '#000', 3); } }

// ================================================================ EPISODE 27: "THE ROAD TRIP (Leggy is driving)" — the open road (Leggy grabs the wheel; the hubcap; I navigate; Officer Coney's cone test) → the desert at sunset (the World's SMALLEST Shard — map was upside down; out of gas; campfire night; Leggy's idea) → Leggy carries the car → the World's Biggest Shard (she parks it)
// ---------------------------------------------------------------- set A: the open road (morning)
const road = (() => {
  const g = mk('road'); const L = lane27(g); const st = new VSet(L.scroll), loc = L.local;
  for (let x = -36; x <= 36; x++) for (let z = -80; z <= 112; z++) { const ax = Math.abs(x), zm = ((z % 32) + 32) % 32;
    st.add(x, 0, z, ax <= 3 ? (x === 0 && (zm & 3) < 2 ? 'quartz' : 'asphalt') : ax === 4 ? 'path' : 'turf'); if (ax > 16 && hash2(x, zm, 27) > 0.82) st.add(x, 1, z, 'turf'); }
  for (let k = -3; k <= 3; k++) for (const [z0, side, h] of [[3, 1, 5], [11, -1, 6], [19, 1, 6], [27, -1, 5], [7, -1, 7], [23, 1, 7]]) { const z = z0 + k * 32; if (z < -78 || z > 110) continue; tree20(st, side * (9 + Math.floor(hash2(z0, side, 3) * 8)), z, h, false); }
  st.build();
  const D = dist27([[0, 0], [E.rtGo, 0], [E.rtGo + 3, 14], [E.rtBump - 0.4, 14], [E.rtBump, 9], [E.rtBump + 3, 14], [E.rtTurn - 1, 14], [E.rtTurn + 1, 10], [E.rtSiren, 13], [E.rtPull - 0.5, 0], [E.rtTest, 0], [E.rtTest + 2, 5], [E.rtPass - 2, 5], [E.rtPass - 0.5, 0], [E.rtGo2, 0], [E.rtGo2 + 3, 16], [E.rtDesert + 1, 16]], 0, E.rtDesert + 1);
  const zT = D(E.rtTest);
  for (const x of [-5.5, 5.5]) box(0.3, 6, 0.3, '#8a5a2b', x, 3, 12, loc); { const m = txtMat26(['ROAD TRIP!'], 512, 96, '#ffe066', '#c0182a', 64); plane26(11, 1.6, m, loc, 0, 5.4, 12.05, 0); plane26(11, 1.6, m, loc, 0, 5.4, 11.95, PI); }
  board27(["WORLD'S BIGGEST SHARD", '300 MI AHEAD'], 7, 2.6, loc, 10, 4.2, D(E.rtAreWe1) + 26, 0.25, '#2a6aff', '#ffffff', 512, 192, 52);
  board27(['SPEED LIMIT', '6 LEGS'], 2.4, 1.6, loc, -6.6, 2.4, D(E.rtAreWe1 + 4) + 18, 0, '#ffffff', '#111111', 256, 160, 40);
  box(0.9, 0.45, 0.9, '#7a7a80', -2.05, 0.72, D(E.rtBump) + 2.5, loc);
  board27(['<- BIGGEST', 'SMALLEST ->'], 3.6, 1.6, loc, -6.5, 2.6, D(E.rtTurn) + 12, -0.3, '#ffffff', '#2a1d14', 384, 192, 60);
  burst(E.rtVan, [0, 3, 0], { n: 60, colors: ['#ffe066', '#2ec4b6', '#ffffff'], speed: 5, size: 0.14, life: 1.2, grav: 3, up: 3 });
  burst(E.rtBump, [-2.3, 1, 2.5], { n: 30, colors: ['#9a9490', '#c8c0b8'], speed: 3, size: 0.18, life: 0.8, grav: 6, up: 2 });
  burst(E.rtPass + 0.5, [3, 2.6, 1], { n: 50, colors: ['#ffe066', '#7cff6b', '#ffffff'], speed: 4, size: 0.12, life: 1.2, grav: 2, up: 3 });
  const C = [[0, -9, 5, -13, 0, 2, 2, 56], [4.9, -7.5, 4.4, -10, 0, 2, 1, 52], [5, 7.5, 3, 12.5, 1.5, 1.8, 2, 50], [10.9, 8.5, 3.4, 10.5, 1.5, 1.6, 1, 48],
    [11, 10, 3.6, 2, 1.5, 1.6, 0.5, 54], [14.9, 9.4, 3.3, 1.2, 2.5, 1.8, 0.5, 48], [15, 1.0, 5.4, 4.6, 1.0, 1.7, -0.6, 52], [18.4, 1.2, 5.0, 4.0, 1.0, 1.8, -0.8, 46],
    [18.5, -9, 4, -6, -1, 1.2, -1, 52], [21.9, -9, 3.8, -3, -2, 1.4, 1, 48], [22, -4.5, 3.0, 6.5, -1.8, 2.0, 1.2, 46], [26.9, -4.2, 2.8, 6.0, -1.6, 2.1, 0.8, 42],
    [27, 0, 6, -15, 0, 2, 4, 58], [33.9, 0.5, 4.2, -11, 0, 2.2, 3, 54], [34, 12, 3, 9, 0, 1.6, 0, 50], [37.9, 11, 2.6, 5, 0, 1.8, 0, 50],
    [38, -1.6, 3.6, 5.6, -0.6, 2.4, -3, 56], [45.9, -1.2, 3.5, 5.4, -0.4, 2.4, -3, 52], [46, -7, 1.1, 4.5, -2, 1.1, 1, 50], [48.9, -7.4, 1.4, 3.5, -1.6, 1.6, 0, 52],
    [49, -9, 2.2, -3, -2.6, 1.4, 1.5, 50], [54.9, -8.6, 2.4, -0.5, -2.6, 1.4, 2, 48], [55, -1.4, 3.5, 4.6, -1.0, 2.6, 1.4, 46], [59.9, -1.2, 3.4, 4.2, -1.0, 2.6, 1.4, 42],
    [60, 6, 9, -10, 0, 1, 8, 58], [63.9, 4, 8, -8, 0, 1, 8, 56], [64, 0.5, 2.2, -16, 3.5, 1.4, -6, 50], [67.9, 0.5, 2.4, -14, 2.5, 1.6, -3, 48],
    [68, 3.6, 2.6, 6.5, 2.4, 1.9, 0.6, 46], [75.9, 3.8, 2.5, 6.0, 2.4, 1.9, 0.6, 42], [76, 2.6, 3.6, 4.2, 1.0, 2.0, 0.6, 46], [81.9, 2.8, 3.7, 4.6, 1.0, 2.0, 0.8, 50],
    [82, 0, 9, -9, 0, 0.5, 14, 60], [89.9, 0, 10, -8, 0, 0.5, 16, 60], [90, -9, 1.6, 6, 0, 1.4, 0, 50], [95.9, -9, 1.6, 2, 0, 1.4, 0, 50],
    [96, -1.6, 3.6, 5.6, -0.6, 2.4, -3, 56], [99.9, -1.4, 3.5, 5.4, -0.5, 2.4, -3, 54], [100, 3.6, 2.6, 6.5, 2.4, 1.9, 0.6, 46], [103.9, 3.8, 2.5, 6.0, 2.4, 1.9, 0.6, 42],
    [104, -6, 5, -12, 0, 1.5, 4, 56], [E.rtDesert, -5, 4, -10, 0, 1.5, 4, 54]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => parentTo(c.root, loc));
    L6.root.rotation.set(0, 0, 0); L6.body.position.y = 1.3; L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0;
    parentTo(van.door, van.body); van.door.position.set(1.9, 1.1, -0.2); van.door.rotation.set(0, 0, 0); van.door.visible = true;
    const d = D(t), sp = (D(t + 0.05) - d) / 0.05; L.at(d);
    const s = d - zT, amp = t > E.rtTest - 1 && t < E.rtGo2 ? 3 * ss(seg(s, 1, 7)) * (1 - ss(seg(s, 66, 74))) : 0, vx = amp * Math.cos(PI * (s - 8) / 12);
    const vy = amp > 0.01 ? Math.atan(-amp * PI / 12 * Math.sin(PI * (s - 8) / 12)) * 0.8 : win(t, E.rtTurn - 0.5, E.rtTurn + 2) ? Math.sin(seg(t, E.rtTurn - 0.5, E.rtTurn + 2) * PI * 2) * 0.25 : 0;
    const bump = win(t, E.rtBump, E.rtBump + 0.8) ? Math.sin(seg(t, E.rtBump, E.rtBump + 0.8) * PI) * 0.6 : 0, bob = (sp > 0.5 ? Math.abs(Math.sin(t * 9)) * 0.05 : 0) + bump, VP = [vx, 0.5, 0];
    poseVan(van, t, VP, vy, { roll: d / 0.65, bob, pitch: bump * 0.12, steer: vy * 2 + (sp > 1 ? Math.sin(t * 3) * 0.15 : 0) });
    // hubcap: flies off, Bloop catches it, runs alongside, puts it back
    if (t >= E.rtBump && t < E.rtBump + 1.5) { parentTo(van.cap, g); van.cap.position.set(...arcPath(t, [[E.rtBump, -2.3, 1.15, 2.5, 0], [E.rtBump + 1.5, -0.7, 2.6, -1.8, 3]])); van.cap.rotation.set(t * 14, 0, t * 6); }
    else if (t >= E.rtBump && t < E.rtFix1 + 3) { parentTo(van.cap, bloop6.B.aR); van.cap.position.set(0, -0.6, 0.2); van.cap.rotation.set(0, 0, 0); }
    else { parentTo(van.cap, van.wheels[0]); van.cap.position.set(-0.25, 0, 0); van.cap.rotation.set(0, 0, 0); }
    // ---- me
    const hIn = E.rtWarranty - 0.8; map27.visible = win(t, E.rtMap - 1, E.rtTurn + 3); map27.rotation.set(-0.3, PI, PI * ss(seg(t, E.rtMap + 0.8, E.rtMap + 1.6)));
    if (t < hIn) { const hA = act(t, [[0, -6, 0.5, -9], [4.5, -4, 0.5, -2.5], [E.rtSeat, -4, 0.5, -2.5], [E.rtSeat + 1.8, -3.4, 0.5, 5.2], [E.rtSeat + 3.6, 3.4, 0.5, 5.2], [E.rtSeat + 4.6, 3.4, 0.5, 1.6], [E.rtSeat + 5.2, 3.4, 0.5, 1.6],
        [E.rtSeat + 6.8, 3.4, 0.5, -4.6], [E.rtSeat + 8.6, -3.2, 0.5, -4.6], [hIn, -3.2, 0.5, 1.2]], [[0, { face: 'smug', wave: t < 3 }], [E.rtVan, { face: 'smug', yaw: 0.9 }], [E.rtSeat, { face: 'smug' }], [E.rtSeat + 4.6, { face: 'scared', yaw: -PI / 2 }], [E.rtSeat + 5.2, { face: 'normal' }]]);
      pose(hero, { t, ...hA }); }
    else if (t < E.rtWarranty) pose(hero, { t, p: arcPath(t, [[hIn, -3.2, 0.5, 1.2, 0], [E.rtWarranty, ...seat27(VP, vy, SEAT27.h, bob), 1.2]]), yaw: 0, face: 'smug', sit: seg(t, hIn, E.rtWarranty) });
    else { const o = pick(t, [[0, { face: 'smug' }], [E.rtWarranty, { face: 'smug', headYaw: -0.8 }], [E.rtGo, { face: 'smug', wave: t < E.rtGo + 2 }], [E.rtHonk, { face: 'scared' }], [E.rtHonk + 1.5, { face: 'smug' }], [E.rtAreWe1, { face: 'normal', headYaw: 0.7 }],
        [E.rtAreWe1 + 6, { face: 'smug' }], [E.rtBump, { face: 'scared', panic: true }], [E.rtBump + 2, { face: 'normal', headYaw: -0.8 }], [E.rtMap - 1, { face: 'normal', hold: true, headPitch: 0.35 }], [E.rtMap + 3, { face: 'smug', hold: true, headPitch: 0.35 }],
        [E.rtTurn, { face: 'smug', wave: true }], [E.rtTurn + 2, { face: 'smug' }], [E.rtSiren, { face: 'scared', headYaw: -2.4 }], [E.rtPull, { face: 'scared', headYaw: 0.6 }], [E.rtTest, { face: 'scared', panic: true }],
        [E.rtTest + 6, { face: 'scared', lean: -0.2 }], [E.rtTest + 9, { face: 'scared', panic: true }], [E.rtPass, { face: 'smug', headYaw: 0.6 }], [E.rtGo2, { face: 'smug', wave: t < E.rtGo2 + 3 }]]);
      pose(hero, { t, p: seat27(VP, vy, SEAT27.h, bob), yaw: vy, sit: 1, ...o }); }
    // ---- Leggy (she was in the driver's seat before I even got there)
    const lIn = E.rtSeat + 1.5; lic27.visible = win(t, E.rtPass + 0.6, E.rtDesert);
    if (t < lIn) poseLurk(L6, t, [5.5, 0.5, -3 + Math.sin(t * 0.8) * 0.8], -0.6 + Math.sin(t * 0.5) * 0.5, 0.5);
    else if (t < lIn + 1.2) poseLurk(L6, t, arcPath(t, [[lIn, 5.5, 0.5, -3, 0], [lIn + 1.2, ...seat27(VP, vy, SEAT27.l, bob), 2.4]]), lerp(-0.6, 0, seg(t, lIn, lIn + 1.2)), 3);
    else { let ls = sp > 0.5 ? 1.6 : 0.3; if (win(t, E.rtLegs, E.rtWarranty)) ls = 2.6; if (win(t, E.rtTest, E.rtPass)) ls = 3; poseLurk(L6, t, seat27(VP, vy, SEAT27.l, bob), vy, ls);
      if (win(t, E.rtCop, E.rtNoLic + 3)) L6.hd.rotation.y = 0.9 + Math.sin(t * 2) * 0.1; if (win(t, E.rtNoLic, E.rtNoLic + 3)) L6.hd.rotation.x = 0.35;
      if (win(t, E.rtPass, E.rtGo2)) { L6.root.rotation.z = Math.sin(t * 12) * 0.08; L6.hd.rotation.y = 0.9; } }
    // ---- Bloop (keeps his car in one piece. for now.)
    const bIn = E.rtWarranty + 3.5; warr27.visible = win(t, E.rtWarranty, bIn); inv27a.visible = inv27b.visible = false;
    if (t < bIn) { const bA = act(t, [[0, 3.6, 0.5, 6.4], [E.rtWarranty - 3, 3.6, 0.5, 6.4], [E.rtWarranty - 1.4, -3.0, 0.5, 5.0], [E.rtWarranty - 0.2, -3.0, 0.5, 2.0]], [[0, {}]]);
      let by = bA.yaw, bo = { walk: bA.walk, phase: bA.phase * 2 }; if (t < E.rtWarranty - 3) { by = 0.6; bo = { handOut: win(t, E.rtVan, E.rtVan + 5), hop: win(t, E.rtVan, E.rtVan + 1.5) }; } if (t > E.rtWarranty - 0.2) { by = PI / 2; bo = { handOut: true }; }
      poseBurble(bloop6, t, bA.p, by, bo); }
    else if (t < bIn + 1) poseBurble(bloop6, t, arcPath(t, [[bIn, -3.0, 0.5, 2.0, 0], [bIn + 1, ...seat27(VP, vy, SEAT27.b, bob), 1.6]]), PI / 2 * (1 - seg(t, bIn, bIn + 1)), {});
    else if (win(t, E.rtFix1, E.rtFix1 + 4.6)) { const k = t - E.rtFix1, P = k < 1 ? arcPath(t, [[E.rtFix1, ...seat27(VP, vy, SEAT27.b, bob), 0], [E.rtFix1 + 1, -3.4, 0.5, 2.6, 1.4]]) : k < 3.5 ? [-3.4, 0.5, 2.6] : arcPath(t, [[E.rtFix1 + 3.5, -3.4, 0.5, 2.6, 0], [E.rtFix1 + 4.6, ...seat27(VP, vy, SEAT27.b, bob), 1.6]]);
      poseBurble(bloop6, t, P, k > 1 && k < 3.5 ? PI / 2 : 0, { walk: k > 1 && k < 3.5, phase: t * 18, handOut: win(t, E.rtFix1 + 1.6, E.rtFix1 + 3.1) }); }
    else { const o = pick(t, [[0, {}], [E.rtHonk, { hop: t < E.rtHonk + 1 }], [E.rtBump, { angry: true }], [E.rtBump + 1.5, { handOut: true }], [E.rtFix1 + 4.6, { hop: t < E.rtFix1 + 6 }], [E.rtFix1 + 6, {}], [E.rtSiren, { angry: true }], [E.rtPull, { facepalm: true }],
        [E.rtCop, {}], [E.rtTest, { hop: true }], [E.rtPass, { hop: t < E.rtPass + 2 }], [E.rtPass + 2, {}]]);
      poseBurble(bloop6, t, seat27(VP, vy, SEAT27.b, bob), vy, o); }
    // ---- Officer Coney
    const scP = [4.2, 0.5, -8.6], WIN = [3.3, 0.5, 1.0], RIDE = [7.5, 0.5, 0.5]; coney.root.visible = scooter.visible = t >= E.rtSiren;
    if (t >= E.rtSiren) { let sP, cP, cy = 0, co = {}; const back = t > E.rtGo2 ? D(t) - D(E.rtGo2) : 0;
      if (t < E.rtPull) sP = [4.2, 0.5, lerp(-40, -8.6, ss(seg(t, E.rtSiren, E.rtPull)))]; else if (t < E.rtTest - 1.5) sP = scP.slice(); else if (t < E.rtTest + 0.5) sP = L3(scP, RIDE, ss(seg(t, E.rtTest - 1.5, E.rtTest + 0.5)));
      else sP = [RIDE[0], 0.5, RIDE[2] + (t < E.rtPass ? Math.sin(t * 1.3) * 0.4 : 0)];
      if (t < E.rtPull + 0.5 || win(t, E.rtTest - 1.5, E.rtPass - 0.6)) { cP = [sP[0], sP[1] + 0.52, sP[2] - 0.2]; co = { siren: t < E.rtCop, whistle: win(t, E.rtTest, E.rtPass) && Math.floor(t / 2.5) % 2 === 0, wide: win(t, E.rtTest + 6, E.rtTest + 9) }; }
      else if (t < E.rtTest - 1.5) { const a = act(t, [[E.rtPull + 0.5, 4.2, 0.5, -8], [E.rtCop - 0.2, ...WIN], [E.rtNoLic + 3, ...WIN], [E.rtTest - 1.6, 4.2, 0.5, -8.4]], [[0, {}]]); cP = a.p; cy = a.walk ? a.yaw : -PI / 2;
        co = { walk: a.walk, hop: a.walk, siren: t < E.rtCop, write: win(t, E.rtCop + 1, E.rtNoLic), pad: t < E.rtNoLic + 3, wide: win(t, E.rtNoLic, E.rtNoLic + 2), point: win(t, E.rtNoLic + 2, E.rtNoLic + 3) }; }
      else { const a = act(t, [[E.rtPass - 0.6, ...RIDE], [E.rtPass, ...WIN]], [[0, {}]]); cP = a.p; cy = a.walk ? a.yaw : -PI / 2; co = { hop: a.walk, write: win(t, E.rtPass, E.rtPass + 2), pad: t < E.rtPass + 2, cheer: win(t, E.rtPass + 2, E.rtGo2), stop: t > E.rtGo2 }; }
      sP[2] -= back; cP = [cP[0], cP[1], cP[2] - back]; scooter.position.set(...sP); scooter.rotation.set(0, 0, 0); poseCone(coney, t, cP, cy, co); }
    // ---- the cone cousins (do NOT hit the family)
    cousins.forEach((c, i) => { const z = zT + 8 + 12 * i, side = i % 2 ? 1 : -1, into = ss(seg(t, E.rtTest - 4 + i * 0.25, E.rtTest - 3 + i * 0.25)), outk = ss(seg(t, E.rtPass + i * 0.15, E.rtPass + 0.8 + i * 0.15));
      const x = lerp(side * 5.5, 0, into) + outk * side * 5, near = win(t, E.rtTest, E.rtPass) && Math.abs(z - d) < 6;
      poseCone(c, t, [x, 0.5, z], t > E.rtPass ? -side * PI / 2 : PI, { hop: (into > 0 && into < 1) || (outk > 0 && outk < 1) || t > E.rtPass + 1, seed: i, cheer: t > E.rtPass + 1, wide: near, wobble: near }); c.root.visible = true; });
    let cam = camKeys(t, C); if (win(t, E.rtTest + 14, E.rtPass)) { cam = { p: [cam.p[0] + vx, cam.p[1], cam.p[2]], l: [cam.l[0] + vx, cam.l[1], cam.l[2]], fov: cam.fov }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the desert (sunset → campfire night → dawn → Leggy carries the car)
const desert = (() => {
  const g = mk('desert'); const L = lane27(g); const st = new VSet(L.scroll), loc = L.local;
  for (let x = -36; x <= 36; x++) for (let z = -80; z <= 112; z++) { const ax = Math.abs(x), zm = ((z % 32) + 32) % 32;
    st.add(x, 0, z, ax <= 3 ? (x === 0 && (zm & 3) < 2 ? 'quartz' : 'asphalt') : ax === 4 ? 'path' : 'dune'); if (ax > 9 && ax < 20 && hash2(x, zm, 31) > 0.9) st.add(x, 1, z, 'dune'); }
  for (let k = -3; k <= 3; k++) {
    for (const [z0, side, xo, h] of [[4, 1, 8, 4], [14, -1, 9, 3], [25, 1, 12, 5], [20, -1, 15, 4]]) { const z = z0 + 32 * k; if (z < -79 || z > 111) continue; const x = side * xo;
      for (let y = 1; y <= h; y++) st.add(x, y, z, 'cactus'); st.add(x - 1, 2, z, 'cactus'); st.add(x - 1, 3, z, 'cactus'); st.add(x + 1, 3, z, 'cactus'); st.add(x + 1, 4, z, 'cactus'); }
    for (const [z0, side, xo, w, dd, h] of [[2, 1, 22, 8, 6, 9], [18, 1, 24, 6, 9, 6], [10, -1, 22, 9, 7, 8], [27, -1, 25, 6, 5, 11]]) for (let dx = 0; dx < w; dx++) for (let dz = 0; dz < dd; dz++) { const x = side * (xo + dx), z = z0 + dz + 32 * k; if (z < -79 || z > 111) continue;
      for (let y = 1; y <= h; y++) if (dx === 0 || dz === 0 || dx === w - 1 || dz === dd - 1 || y === h) st.add(x, y, z, 'mesa'); }
    for (const z0 of [0, 16]) { const z = z0 + 32 * k; if (z < -79 || z > 111) continue; for (let y = 1; y <= 6; y++) st.add(-7, y, z, 'log'); st.add(-8, 6, z, 'plank'); st.add(-6, 6, z, 'plank'); }
  }
  st.build();
  const D = dist27([[E.rtDesert, 16], [E.rtArrive - 4, 14], [E.rtArrive, 0], [E.rtRun, 0], [E.rtRun + 3, 24], [E.rtMph - 2, 30], [E.rtMph, 46], [E.rtLot + 1, 46]], E.rtDesert, E.rtLot + 1);
  const Dp = D(E.rtArrive + 0.5), LZ = z => z + Dp, Dd = D(E.rtDoor);
  board27(["WORLD'S BIGGEST*", 'SHARD - NEXT EXIT', '*smallest'], 8, 3.2, loc, -10.5, 4.6, D(E.rtSign) + 30, -0.2, '#ff5cf0', '#ffffff', 512, 210, 50);
  const shack = shack27(loc, 12, LZ(4.0), ['SOUVENIRS']); shack.rotation.y = -0.4;
  board27(["WORLD'S SMALLEST SHARD"], 8, 1.6, loc, 9.5, 6.6, LZ(5.6), 0, '#ffe066', '#c0182a', 768, 128, 70);
  loc.add(tinyStand); tinyStand.position.set(8, 0, LZ(1.5));
  board27(['NO GAS', 'NEXT 300 MI'], 3, 1.6, loc, -5.6, 2.4, LZ(6), 0, '#ffffff', '#c0182a', 256, 136, 44);
  loc.add(fire27); fire27.position.set(5, 0, LZ(-4.5)); const FP = [5, 0.5, -4.5];
  for (const [x, r] of [[3.0, 0.87], [7.2, -0.9]]) { const l = box(1.6, 0.5, 0.5, '#6a4020', x, 0.75, LZ(-6.2), loc); l.rotation.y = r + PI / 2; }
  burst(E.rtDoor + 0.7, [2.8, 0.7, 1.0 - (D(E.rtDoor + 0.7) - Dd)], { n: 30, colors: ['#e8c482', '#f6dca0'], speed: 3, size: 0.2, life: 1, grav: 5, up: 2 });
  for (const s of [0.2, 0.9, 1.7, 2.6, 4]) burst(E.rtSput + s, [-1.4, 1.3, -4.1], { n: 18, colors: ['#222222', '#444444', '#666666'], speed: 1.5, size: 0.35, life: 1.6, grav: -1.5, up: 1 });
  burst(E.rtFire, [5, 1.2, -4.5], { n: 40, colors: ['#ff8a2a', '#ffd23f'], speed: 4, size: 0.15, life: 1, grav: -2, up: 3 });
  smoke(E.rtFire, E.rtDawn, 0.5, [5, 1.5, -4.5], { n: 2, colors: ['#ff8a2a', '#ffd23f'], speed: 0.6, size: 0.08, life: 1.2, grav: -2, up: 1 });
  burst(E.rtMarsh + 0.6, [4.1, 1.1, -5.3], { n: 30, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 2, size: 0.12, life: 0.8, grav: -3, up: 2 });
  for (let i = 0; i < 14; i++) burst(E.rtStar + i * 0.07, [-26 + i * 3.4, 30 - i * 1.0, 46], { n: 6, colors: ['#ffffff', '#fff4b0'], speed: 0.3, size: 0.5, life: 0.7, grav: 0, up: 0 });
  burst(E.rtIdea + 2.6, [4.8, 3.2, 1.6], { n: 24, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.12, life: 0.8, grav: 1, up: 2 });
  burst(E.rtLift + 2, [0, 2.6, 0], { n: 40, colors: ['#e8c482', '#ffffff'], speed: 4, size: 0.18, life: 1, grav: 4, up: 2 });
  smoke(E.rtRun, E.rtLot, 0.2, [0, 0.7, -2.4], { n: 3, colors: ['#e8c482', '#f0d090'], speed: 2, size: 0.3, life: 0.8, grav: 1, up: 1 });
  const H0 = [6.2, 0.5, 0.4], hy0 = faceTo(H0, [8, 0, 1.5]), cT = wl(H0, hy0, [-2.4, 2.0, 1.6]), lT = wl(H0, hy0, [0, 1.6, 0.4]), cT2 = wl(H0, hy0, [-2.2, 1.9, 1.4]);
  const C = [[E.rtDesert, 10, 2.4, 12, 0, 1.6, 0, 52], [115.9, 12, 3, 6, 0, 1.6, 0, 50], [116, 5.5, 4, -8, 1.5, 1.8, 2, 48], [121.9, 5.8, 3.8, -6, 1.5, 1.8, 1, 46],
    [122, 3, 4, -10, -4, 4, 30, 50], [125.9, 2, 3.6, -8, -6, 4, 18, 46], [126, -7, 6, -12, 6, 2, 2, 54], [129.9, -6, 5, -10, 7, 2, 2, 50],
    [130, 8, 2.75, -0.6, 8, 1.88, 1.5, 30], [135.9, 8, 2.6, -0.2, 8, 1.88, 1.5, 24], [136, ...cT, ...lT, 44], [141.9, ...cT2, ...lT, 40],
    [142, -7, 2.5, -9, 0, 1.6, -1, 48], [149.9, -6.5, 2.4, -7.5, 0, 1.6, -1, 46], [150, 0.5, 5, -16, 5, 1.5, -3, 52], [153.9, 1.5, 4.5, -14, 5, 1.5, -3.5, 50],
    [154, 3.6, 2.4, -2.4, 6.6, 1.4, -5.8, 46], [159.9, 3.4, 2.4, -2.0, 6.8, 1.4, -6.0, 42], [160, 5.0, 2.6, -7.6, 6.0, 1.6, -1.8, 46], [163.9, 5.0, 2.5, -7.2, 6.0, 1.7, -1.8, 42],
    [164, 4.3, 2.1, -4.4, 3.0, 1.5, -6.2, 46], [167.9, 4.5, 2.2, -4.2, 3.0, 1.6, -6.2, 42], [168, -5.2, 1.4, -6, -3, 6, 12, 62], [175.9, -5.2, 1.6, -6, -3.5, 5, 12, 62],
    [176, 2.6, 3.8, 7.5, 4.6, 1.5, -0.5, 50], [183.9, 2.4, 3.6, 7, 4, 1.5, -1, 48], [184, 11, 5, 2, 2, 2, -1, 52], [191.9, 10, 4.6, 1, 0, 2.6, 0, 48],
    [192, 0, 4.5, -16, 0, 3, 6, 56], [197.9, 0, 3.6, -12, 0, 3, 6, 52], [198, 9, 1.2, 5, 0, 2.6, 0, 54], [203.9, 9, 1.4, 1, 0, 2.6, 0, 54],
    [204, -6.5, 3, -18, -1, 2.4, -6, 54], [209.9, -5, 2.6, -15, 0, 2.6, -2, 50], [210, 0, 4.0, 12, 0, 3.6, 0, 50], [215.9, 0, 3.8, 10, 0, 3.6, 0, 46],
    [216, -14, 14, 10, 0, 2, 0, 58], [E.rtLot, -18, 16, -4, 0, 2, 4, 58]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => c.root.visible = false);
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; warr27.visible = inv27b.visible = false;
    const d = D(t), sp = (D(t + 0.05) - d) / 0.05; L.at(d);
    const night = t >= E.rtNight && t < E.rtDawn, run = t >= E.rtRun;
    const fk = ss(seg(t, E.rtFire, E.rtFire + 0.6)); fire27.visible = true; flames27.forEach((m, i) => { m.visible = fk > 0.01 && t < E.rtDawn + 4; m.scale.setScalar(fk * (0.8 + 0.3 * Math.sin(t * 17 + i * 2))); m.rotation.y = t * (2 + i); }); fireL27.intensity = t < E.rtDawn + 4 ? fk * (26 + Math.sin(t * 23) * 4) : 0;
    // ---- the van
    let VP = [0, 0.5, 0], vo = { roll: d / 0.65 };
    if (sp > 0.5 && t < E.rtLift) vo.bob = Math.abs(Math.sin(t * 9)) * 0.05;
    if (win(t, E.rtSput, E.rtSput + 3.5)) { vo.bob = Math.abs(Math.sin(t * 30)) * 0.12 * (1 - seg(t, E.rtSput + 2, E.rtSput + 3.5)); vo.roll2 = Math.sin(t * 25) * 0.03; }
    if (t >= E.rtLift) { VP = t < E.rtLift + 2 ? arcPath(t, [[E.rtLift, 0, 0.5, 0, 0], [E.rtLift + 2, 0, 2.4, 0, 1.5]]) : [0, 2.4 + Math.abs(Math.sin(t * 14)) * (run ? 0.22 : 0.05), 0]; vo = { roll: t * 20, pitch: run ? Math.sin(t * 14) * 0.04 : 0 }; }
    poseVan(van, t, VP, 0, vo); const bob = vo.bob || 0;
    if (t < E.rtDoor) { parentTo(van.door, van.body); van.door.position.set(1.9, 1.1, -0.2); van.door.rotation.set(0, 0, 0); }
    else { parentTo(van.door, loc); const k = seg(t, E.rtDoor, E.rtDoor + 0.7); van.door.position.set(lerp(1.95, 2.9, k), lerp(1.6, 0.62, k * k) + Math.sin(k * PI) * 0.5, Dd - 0.2 - k * 0.6); van.door.rotation.set(0, k * 0.8, k * PI / 2); }
    van.door.visible = true;
    // ---- me
    map27.visible = win(t, E.rtTwist - 1, E.rtTwist + 5); map27.rotation.set(-0.3, PI, PI * (1 - ss(seg(t, E.rtTwist + 1, E.rtTwist + 1.8)))); marsh27.visible = win(t, E.rtMarsh - 1, E.rtStar); marshB.material = t > E.rtMarsh + 1.2 ? burntM : marshM;
    const SH = [3.0, 0.8, -6.2], shy = faceTo(SH, FP), hSit = E.rtNight + 3.4;
    if (t < E.rtArrive + 1) { const o = pick(t, [[0, { face: 'smug', headYaw: 0.4 }], [E.rtAreWe2, { face: 'normal', headYaw: 0.8 }], [E.rtAreWe2 + 3, { face: 'smug' }], [E.rtDoor, { face: 'scared', headYaw: 1.4 }], [E.rtDoor + 2.5, { face: 'normal' }], [E.rtSign, { face: 'smug', wave: true }]]);
      pose(hero, { t, p: seat27(VP, 0, SEAT27.h, bob), yaw: 0, sit: 1, ...o }); }
    else if (t < E.rtArrive + 1.8) pose(hero, { t, p: arcPath(t, [[E.rtArrive + 1, ...seat27(VP, 0, SEAT27.h), 0], [E.rtArrive + 1.8, -3.2, 0.5, 1.2, 1.2]]), yaw: -PI / 2, face: 'smug', sit: 1 - seg(t, E.rtArrive + 1, E.rtArrive + 1.8) });
    else if (t < E.rtLift + 2) { const hA = act(t, [[E.rtArrive + 1.8, -3.2, 0.5, 1.2], [E.rtArrive + 3, -2.6, 0.5, 4.8], [E.rtTiny - 0.2, ...H0], [E.rtNight, ...H0], [E.rtNight + 1.6, 2.6, 0.5, -3.0], [hSit - 0.2, 3.0, 0.5, -6.2]],
        [[0, { face: 'smug' }], [E.rtTiny - 0.2, { face: 'normal', yaw: hy0, headPitch: 0.4 }], [E.rtTiny + 2, { face: 'scared', yaw: hy0, lean: 0.3, headPitch: 0.4 }], [E.rtTwist - 1, { face: 'normal', yaw: hy0, hold: true, headPitch: 0.35 }],
         [E.rtTwist + 1.8, { face: 'scared', yaw: hy0, hold: true, headPitch: 0.35 }], [E.rtTwist + 5, { face: 'smug', yaw: hy0 + 1.2, wave: true }], [E.rtSput, { face: 'scared', yaw: faceTo(H0, [0, 0, 0]) }], [E.rtSput + 3, { face: 'scared', yaw: faceTo(H0, [0, 0, 0]), panic: true }],
         [E.rtSput + 5, { face: 'normal', yaw: faceTo(H0, [0, 0, 0]) }], [E.rtNight, { face: 'normal' }]]);
      if (t >= hSit - 0.2) { const k = seg(t, hSit - 0.2, hSit + 0.4), o = pick(t, [[0, { face: 'smug' }], [E.rtFire, { face: 'smug', headYaw: -0.6 }], [E.rtFire + 2, { face: 'normal', headYaw: -0.9 }], [E.rtStory, { face: 'smug', headYaw: -0.5 }], [E.rtMarsh - 1, { face: 'smug', hold: true }],
          [E.rtMarsh + 0.6, { face: 'scared', panic: true }], [E.rtMarsh + 3, { face: 'normal', hold: true }], [E.rtStar, { face: 'smug', headPitch: -0.6 }], [E.rtStar + 4, { face: 'normal', headYaw: -1.0 }], [E.rtIdea, { face: 'normal', headYaw: 0.6 }], [E.rtIdea + 3, { face: 'normal', headPitch: 0.5 }], [E.rtDawn, { face: 'scared', headYaw: 0.8, headPitch: -0.2 }]]);
        pose(hero, { t, p: [SH[0], lerp(0.5, SH[1], k), SH[2]], yaw: shy, sit: k, ...o }); }
      else pose(hero, { t, ...hA }); }
    else if (t < E.rtLift + 3.2) pose(hero, { t, p: arcPath(t, [[E.rtLift + 2, ...SH, 0], [E.rtLift + 3.2, ...seat27(VP, 0, SEAT27.h), 1.5]]), yaw: 0, face: 'scared', sit: 1, panic: true });
    else { const o = pick(t, [[0, { face: 'scared', panic: true }], [E.rtRun + 2, { face: 'smug', wave: true }], [E.rtRun + 8, { face: 'normal', headYaw: 0.6 }], [E.rtCone2, { face: 'scared', headYaw: -2.4 }], [E.rtMph, { face: 'scared', panic: true, lean: -0.3 }], [E.rtMph + 6, { face: 'smug', wave: true }]]);
      pose(hero, { t, p: seat27(VP, 0, SEAT27.h), yaw: 0, sit: 1, ...o }); }
    // ---- Leggy
    const LS = [8.3, 0.5, -2.6], lyS = faceTo(LS, [8, 0, 1.5]), LC = [6.0, 0.5, 0.2], LI = [4.8, 0.5, 0.2]; let lp, ly = 0, ls = 0.3, lie = false; lic27.visible = win(t, E.rtStory, E.rtStory + 7.5);
    if (t < E.rtArrive + 1.2) { lp = seat27(VP, 0, SEAT27.l, bob); ls = sp > 0.5 ? 1.6 : 0.3; }
    else if (t < E.rtArrive + 2.2) { lp = arcPath(t, [[E.rtArrive + 1.2, ...seat27(VP, 0, SEAT27.l), 0], [E.rtArrive + 2.2, 4.4, 0.5, -1.5, 1.4]]); ly = 0.6; ls = 2; }
    else if (t < E.rtSput - 2) { const a = walker(t, [[E.rtArrive + 2.2, 4.4, 0.5, -1.5], [E.rtArrive + 3.6, ...LS]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : lyS; ls = a.walk > 0.05 ? 2 : 0.4; if (win(t, E.rtTwist, E.rtTwist + 4)) L6.hd.rotation.y = -0.8; }
    else if (t < E.rtSput - 0.8) { lp = arcPath(t, [[E.rtSput - 2, ...LS, 0], [E.rtSput - 0.8, ...seat27(VP, 0, SEAT27.l), 2]]); ly = lerp(lyS, 0, seg(t, E.rtSput - 2, E.rtSput - 0.8)); ls = 2; }
    else if (t < E.rtSput + 4) { lp = seat27(VP, 0, SEAT27.l, bob); ls = win(t, E.rtSput, E.rtSput + 3) ? 3 : 0.3; }
    else if (t < E.rtSput + 5.2) { lp = arcPath(t, [[E.rtSput + 4, ...seat27(VP, 0, SEAT27.l), 0], [E.rtSput + 5.2, ...LC, 1.4]]); ly = PI; ls = 2; }
    else if (t < E.rtIdea) { lp = LC; ly = PI; ls = 0.2; lie = t > E.rtNight && !win(t, E.rtStory, E.rtStory + 7.5); if (win(t, E.rtStory, E.rtStory + 7.5)) { ls = 1.2; ly = PI + Math.sin(t * 2) * 0.3; } }
    else if (t < E.rtLift) { const a = walker(t, [[E.rtIdea, ...LC], [E.rtIdea + 2.2, ...LI]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : -PI / 2; ls = a.walk > 0.05 ? 2 : 0.3; }
    else if (t < E.rtLift + 2) { lp = L3(LI, [0, 0.5, 0], ss(seg(t, E.rtLift, E.rtLift + 2))); ly = lerp(-PI / 2, 0, seg(t, E.rtLift, E.rtLift + 1.4)); ls = 2.5; }
    else { lp = [0, 0.5, 0]; ly = 0; ls = run ? 8 : 0.8; }
    poseLurk(L6, t, lp, ly, ls); L6.body.position.y = lie ? 0.9 + Math.sin(t * 1.6) * 0.04 : L6.body.position.y; if (win(t, E.rtIdea + 2.4, E.rtIdea + 3.4)) L6.hd.rotation.x = -0.4; if (run) L6.root.rotation.z = Math.sin(t * 14) * 0.05;
    // ---- Bloop
    const SB = [7.2, 1.0, -6.2], sby = faceTo(SB, FP), BS = [9.8, 0.5, -0.2], bSit = E.rtNight + 3.4; inv27a.visible = win(t, E.rtFire + 1.5, E.rtStory);
    if (t < E.rtArrive + 1.6) { const o = win(t, E.rtDoor + 1, E.rtDoor + 4) ? { handOut: true } : win(t, E.rtAreWe2 + 1.4, E.rtAreWe2 + 3.4) ? { angry: true } : {}; poseBurble(bloop6, t, seat27(VP, 0, SEAT27.b, bob), win(t, E.rtDoor + 1, E.rtDoor + 4) ? PI - 0.6 : 0, o); }
    else if (t < E.rtArrive + 2.4) poseBurble(bloop6, t, arcPath(t, [[E.rtArrive + 1.6, ...seat27(VP, 0, SEAT27.b), 0], [E.rtArrive + 2.4, -3.4, 0.5, -2.4, 1.4]]), -PI / 2, {});
    else if (t < bSit) { const bA = act(t, [[E.rtArrive + 2.4, -3.4, 0.5, -2.4], [E.rtArrive + 3.6, -2.2, 0.5, -5.4], [E.rtArrive + 5.4, 5, 0.5, -5.4], [E.rtArrive + 7.2, ...BS], [E.rtNight, ...BS], [bSit - 0.3, SB[0], 0.5, SB[2]]], [[0, {}]]);
      let by = bA.walk ? bA.yaw : faceTo(BS, [8, 0, 1.5]), bo = { walk: bA.walk, phase: bA.phase * 2 }; if (!bA.walk) { if (win(t, E.rtTiny, E.rtTiny + 3)) bo = { hop: true }; if (win(t, E.rtTwist + 2, E.rtTwist + 5)) bo = { angry: true }; if (win(t, E.rtSput, E.rtNight)) { bo = { facepalm: true }; by = faceTo(BS, [0, 0, 0]); } }
      poseBurble(bloop6, t, bA.p, by, bo); }
    else if (t < E.rtLift + 2.4) { const o = pick(t, [[0, {}], [E.rtFire, { hop: true }], [E.rtFire + 1.5, { handOut: true }], [E.rtStory, {}], [E.rtMarsh + 0.6, { angry: true }], [E.rtMarsh + 3, {}], [E.rtDawn, { angry: true }]]); poseBurble(bloop6, t, SB, sby + (win(t, E.rtFire + 1.5, E.rtStory) ? -0.6 : 0), o); }
    else if (t < E.rtLift + 3.6) poseBurble(bloop6, t, arcPath(t, [[E.rtLift + 2.4, ...SB, 0], [E.rtLift + 3.6, ...seat27(VP, 0, SEAT27.b), 1.5]]), 0, { angry: true });
    else { const o = pick(t, [[0, { angry: true }], [E.rtRun + 3, { facepalm: true }], [E.rtRun + 7, {}], [E.rtMph, { angry: true }], [E.rtMph + 4, { hop: true }]]); poseBurble(bloop6, t, seat27(VP, 0, SEAT27.b), 0, o); if (run) bHat.position.y = 1.2 + Math.abs(Math.sin(t * 7)) * 0.3; }
    // ---- Officer Coney (night patrol; then: speeding!)
    const pat = win(t, E.rtStar + 2, E.rtStar + 6), chase = win(t, E.rtCone2, E.rtCone2 + 10); coney.root.visible = scooter.visible = pat || chase;
    if (pat || chase) { const sP = pat ? [-3.0, 0.5, lerp(-40, 40, seg(t, E.rtStar + 2, E.rtStar + 6))] : [-3.6, 0.5, lerpK([[E.rtCone2, -34], [E.rtCone2 + 3, -12], [E.rtCone2 + 6, -11], [E.rtCone2 + 10, -80]], t)];
      scooter.position.set(...sP); scooter.rotation.set(0, 0, 0); poseCone(coney, t, [sP[0], 1.02, sP[2] - 0.2], 0, { siren: true, stop: pat, point: chase && t < E.rtCone2 + 6, wide: chase && t > E.rtCone2 + 6 }); }
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the World's Biggest Shard (noon) — she parks it
const lot = (() => {
  const g = mk('lot'); const st = new VSet(g);
  for (let x = -56; x <= 56; x++) for (let z = -64; z <= 56; z++) { const ax = Math.abs(x), inLot = ax <= 15 && z >= -8 && z <= 9, rd = ax <= 3 && z < -8;
    st.add(x, 0, z, rd ? (x === 0 && (z & 3) < 2 ? 'quartz' : 'asphalt') : inLot ? (ax % 6 === 3 && z > -6 && z < 2 ? 'quartz' : 'asphalt') : 'turf');
    const dh = Math.hypot(x, z - 22), h = dh < 3.2 ? 4 : dh < 5.4 ? 3 : dh < 7.5 ? 2 : dh < 9.5 ? 1 : 0; for (let y = 1; y <= h; y++) st.add(x, y, z, y === h ? 'turf' : 'soil'); }
  for (const [x, z, h] of [[-22, -10, 6], [22, -16, 5], [-26, 12, 7], [26, 10, 6], [-18, 30, 6], [18, 32, 7], [-34, -30, 6], [30, -34, 5], [-12, -30, 5], [14, -28, 6], [-40, 4, 7], [40, 0, 6]]) tree20(st, x, z, h, false);
  st.build();
  box(4, 1.5, 4, '#f0ece4', 0, 5.25, 22, g); box(4.2, 0.2, 4.2, '#ffd23f', 0, 6.0, 22, g);
  board27(["WORLD'S BIGGEST SHARD"], 9, 1.8, g, 11, 5, 16, -0.35, '#5ff7ff', '#2a1d14', 768, 128, 72);
  const shop = shack27(g, 12, -3, ['GIFT SHOP'], '#ff9ecb'); shop.rotation.y = -0.5;
  g.add(bigYaw); g.add(tick27);
  burst(E.rtDrop + 1, [0, 0.8, -2], { n: 40, colors: ['#c8c0b8', '#ffffff'], speed: 4, size: 0.2, life: 0.8, grav: 6, up: 1 });
  burst(E.rtWow, [0, 12, 22], { n: 90, colors: ['#ff5cf0', '#5ff7ff', '#ffffff'], speed: 7, size: 0.2, life: 1.6, grav: 1, up: 2 });
  burst(E.rtBonk, [0, 1.5, 12.4], { n: 40, colors: ['#3cc2a3', '#8a6040'], speed: 4, size: 0.2, life: 1, grav: 8, up: 3 });
  burst(E.rtTip + 1.2, [0, 4, 17], { n: 60, colors: ['#3cc2a3', '#8a6040', '#ff5cf0'], speed: 6, size: 0.25, life: 1.2, grav: 9, up: 4 });
  burst(E.rtFlat, [0, 1.2, 8.6], { n: 110, colors: ['#2ec4b6', '#ffd23f', '#c0c0c8', '#c0182a'], speed: 9, size: 0.28, life: 1.6, grav: 12, up: 5 });
  burst(E.rtShop, [12, 2, -3], { n: 110, colors: ['#ff9ecb', '#c0182a', '#ffe066', '#ffffff'], speed: 9, size: 0.28, life: 1.6, grav: 12, up: 5 });
  smoke(E.rtTip + 1.2, E.freeze, 0.3, t => [lerp(0, 26, seg(t, E.rtFlat, E.rtShop + 10)), 0.8, lerp(17, 8.6, seg(t, E.rtTip + 1.2, E.rtFlat)) - 25.6 * seg(t, E.rtFlat, E.rtShop + 10)], { n: 3, colors: ['#c8b89a', '#a89870'], speed: 1, size: 0.4, life: 1.4, grav: -0.5, up: 1 });
  const C = [[E.rtLot, -10, 3, -26, 0, 3, -34, 56], [231.9, -9, 3.2, -10, 0, 2.6, -4, 50], [232, 9, 4, 6, 0, 2, -2, 50], [235.9, 8.5, 3.6, 5, 0, 2, -2, 48],
    [236, -2, 1.1, 2.6, 0, 9, 22, 60], [241.9, -1.6, 1.0, 3.6, 0, 10, 22, 58], [242, 1.5, 4.6, 1.0, 0, 5, 14, 62], [247.9, 1.5, 4.7, 1.3, 0, 5.2, 14, 60],
    [248, -10, 3, -12, -3, 1.5, -3, 50], [251.9, -8.5, 3, -9, -3, 1.6, -1, 48], [252, -6.4, 2.6, 16.5, 0, 1.8, 6, 52], [259.9, -5.8, 2.4, 16, 0, 1.8, 8, 48],
    [260, 13, 5, 3, 0, 8, 18, 56], [266.9, 14, 5.5, 1, 0, 8, 17, 54], [267, -16, 5, 2, 0, 4, 12, 60], [272.9, -16, 5.5, 0, 1, 4, 8, 58],
    [273, -10, 3, 14, -1.5, 1.5, 8, 50], [276.9, -10.4, 3.2, 14.6, -1.5, 1.6, 7.6, 48], [277, -14, 9, 10, 10, 3, -4, 56], [279.9, -14, 8.5, 10, 12, 3, -6, 54],
    [280, -10.5, 3.4, 13.5, -1, 1.2, 6.5, 50], [285.5, -11, 3.6, 14.2, -0.5, 1.4, 6.2, 48], [E.logo, -11, 3.6, 14.2, -0.5, 1.4, 6.2, 48]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => c.root.visible = false);
    L6.root.rotation.set(0, 0, 0); L6.body.position.y = 1.3; L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; van.door.visible = false;
    warr27.visible = inv27a.visible = lic27.visible = map27.visible = marsh27.visible = false;
    // ---- the van: carried in, dropped, parked (into the hill), flattened
    const dT = E.rtDrop, lw = walker(t, [[E.rtLot, 0, 0.5, -46], [dT - 1.2, 0, 0.5, -6], [dT, 0, 0.5, -2.4]]); let VP;
    if (t < dT) VP = [0, 2.4 + Math.abs(Math.sin(t * 14)) * 0.2 * (1 - seg(t, dT - 2, dT)), lw.p[2]];
    else if (t < dT + 1) VP = arcPath(t, [[dT, 0, 2.4, -2.4, 0], [dT + 1, 0, 0.5, -2, 0.8]]);
    else if (t < E.rtPark) VP = [0, 0.5, -2];
    else VP = [0, 0.5, lerpK([[E.rtPark, -2], [E.rtPark + 2, 1.5], [E.rtPark + 3, 1.5], [E.rtPark + 5, 4.5], [E.rtPark + 6, 4.8], [E.rtBonk - 0.6, 8.0], [E.rtBonk, 8.6]], t)];
    const bonk = win(t, E.rtBonk, E.rtBonk + 0.5) ? Math.sin(seg(t, E.rtBonk, E.rtBonk + 0.5) * PI) : 0, flat = ss(seg(t, E.rtFlat - 0.4, E.rtFlat + 0.2));
    poseVan(van, t, VP, 0, { roll: VP[2] / 0.65 + (t < dT ? t * 20 : 0), bob: win(t, dT + 1, dT + 1.4) ? Math.sin(seg(t, dT + 1, dT + 1.4) * PI) * 0.2 : 0, pitch: -bonk * 0.12, flat });
    // ---- the big shard: wobble, tip, roll
    const sk = lerpK([[E.rtTip, 0], [E.rtTip + 1.2, 5.1], [E.rtFlat, 13.4], [E.rtShop, 30.4], [E.rtShop + 10, 50]], t);
    if (t < E.rtTip) { bigYaw.position.set(0, 11, 22); bigYaw.rotation.set(0, PI, 0); const wob = win(t, E.rtBonk, E.rtTip) ? Math.sin(t * 7) * 0.14 * seg(t, E.rtBonk, E.rtTip) : 0; bigIn.rotation.set(wob, t * 0.2, wob * 0.6); }
    else { const P = t < E.rtFlat ? arcPath(t, [[E.rtTip, 0, 11, 22, 0], [E.rtTip + 1.2, 0, 9.6, 17, 0.8], [E.rtFlat, 0, 5.4, 8.6, 1]]) : arcPath(t, [[E.rtFlat, 0, 5.4, 8.6, 0], [E.rtShop, 12, 5.4, -3, 1.2], [E.rtShop + 10, 26, 5.4, -17, 1]]);
      bigYaw.position.set(...P); bigYaw.rotation.set(0, t < E.rtFlat ? PI : 2.356, 0); bigIn.rotation.set(sk / 4.2, 0, 0); }
    shop.scale.set(1 + 0.2 * ss(seg(t, E.rtShop - 0.3, E.rtShop + 0.2)), 1 - 0.9 * ss(seg(t, E.rtShop - 0.3, E.rtShop + 0.2)), 1);
    tick27.visible = t >= E.rtTicket + 3.6; tick27.position.set(-0.8, 0.82, 7.6); tick27.rotation.set(-PI / 2, 0, 0.3);
    // ---- Leggy
    const LJ = [7, 0.5, 11]; let lp, ly = 0, ls = 0.3;
    if (t < dT) { lp = lw.p; ls = lerp(8, 1, seg(t, dT - 2, dT)); }
    else if (t < E.rtCop3) { const a = walker(t, [[dT, 0, 0.5, -2.4], [dT + 0.7, 4.8, 0.5, -2.4], [E.rtWow + 3, 4.8, 0.5, -2.4], [E.rtPhoto - 0.5, 4.4, 0.5, 9.5]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : t > E.rtPhoto - 1 ? PI : 0; ls = a.walk > 0.05 ? 2 : 0.4; if (win(t, E.rtWow, E.rtWow + 3)) L6.hd.rotation.x = -0.5; }
    else if (t < E.rtCop3 + 2.4) { const a = walker(t, [[E.rtCop3, 4.4, 0.5, 9.5], [E.rtCop3 + 2.4, 3.6, 0.5, -2.5]]); lp = a.p; ly = a.yaw; ls = 2; }
    else if (t < E.rtCop3 + 3.4) { lp = arcPath(t, [[E.rtCop3 + 2.4, 3.6, 0.5, -2.5, 0], [E.rtCop3 + 3.4, ...seat27(VP, 0, SEAT27.l), 1.6]]); ls = 2; }
    else if (t < E.rtJump) { lp = seat27(VP, 0, SEAT27.l); ls = t > E.rtPark ? 1.4 : 0.3; }
    else if (t < E.rtJump + 1.2) { lp = arcPath(t, [[E.rtJump, ...seat27(VP, 0, SEAT27.l), 0], [E.rtJump + 1.2, ...LJ, 2.4]]); ly = 0.8; ls = 3; }
    else { lp = LJ; ly = t < E.rtFlat + 1 ? PI : -2.2; ls = t < E.rtFlat + 2 ? 2.5 : 0.4; }
    poseLurk(L6, t, lp, ly, ls); if (t < dT) L6.root.rotation.z = Math.sin(t * 14) * 0.05;
    // ---- me
    const HG = [-3.6, 0.5, 12.5]; let hA;
    if (t < dT + 1.6) hA = { p: seat27(VP, 0, SEAT27.h), yaw: 0, sit: 1, ...pick(t, [[0, { face: 'scared', panic: true }], [E.rtLot + 3, { face: 'smug', wave: true }]]) };
    else if (t < dT + 2.4) hA = { p: arcPath(t, [[dT + 1.6, ...seat27(VP, 0, SEAT27.h), 0], [dT + 2.4, -3.6, 0.5, 0.6, 1.2]]), yaw: -PI / 2, sit: 1 - seg(t, dT + 1.6, dT + 2.4), face: 'smug' };
    else hA = act(t, [[dT + 2.4, -3.6, 0.5, 0.6], [E.rtWow + 2.4, -3.6, 0.5, 0.6], [E.rtWow + 3.6, -4.2, 0.5, 5], [E.rtPhoto - 1, -1.6, 0.5, 8], [E.rtCop3 + 0.4, -1.6, 0.5, 8], [E.rtPark - 1, ...HG], [E.rtJump, ...HG], [E.rtJump + 1.4, -8, 0.5, 9],
        [E.rtInvoice - 1, -8, 0.5, 9], [E.rtInvoice + 0.4, -4.2, 0.5, 9.8]],
      [[0, { face: 'smug' }], [E.rtWow, { face: 'smug', headPitch: -0.7 }], [E.rtWow + 2.4, { face: 'smug' }], [E.rtPhoto - 1, { face: 'smug', yaw: PI, wave: true }], [E.rtPhoto + 3, { face: 'smug', yaw: PI }], [E.rtCop3, { face: 'normal', yaw: -2.4 }],
       [E.rtPark - 1, { face: 'smug', yaw: PI, wave: true }], [E.rtPark + 4, { face: 'smug', yaw: PI, hold: Math.floor(t * 1.5) % 2 === 0 }], [E.rtBonk, { face: 'scared', yaw: PI }], [E.rtBonk + 2, { face: 'scared', yaw: PI, headPitch: -0.6 }],
       [E.rtJump, { face: 'scared', panic: true }], [E.rtJump + 1.4, { face: 'scared', yaw: PI / 2, panic: true }], [E.rtFlat + 1, { face: 'scared', yaw: PI / 2 }], [E.rtInvoice + 0.4, { face: 'normal', yaw: PI / 2 - 0.4 }],
       [E.rtShop - 0.6, { face: 'scared', yaw: 2.4, panic: true }], [E.rtShop + 1.6, { face: 'scared', yaw: PI / 2 - 0.4 }]]);
    pose(hero, { t, ...hA });
    // ---- Bloop
    const BI = [-3.6, 0.5, 7.6]; let bp, by = 0, bo = {}; inv27b.visible = t >= E.rtInvoice;
    if (t < dT + 2) bp = seat27(VP, 0, SEAT27.b);
    else if (t < dT + 2.8) { bp = arcPath(t, [[dT + 2, ...seat27(VP, 0, SEAT27.b), 0], [dT + 2.8, -4.6, 0.5, -2.2, 1.2]]); by = -PI / 2; }
    else { const bA = act(t, [[dT + 2.8, -4.6, 0.5, -2.2], [E.rtWow + 3, -4.6, 0.5, -2.2], [E.rtPhoto - 1, -3.4, 0.5, 8.2], [E.rtCop3 + 0.4, -3.4, 0.5, 8.2], [E.rtCop3 + 3, -5.6, 0.5, 1.4], [E.rtInvoice - 1.4, -5.6, 0.5, 1.4], [E.rtInvoice, ...BI]], [[0, {}]]);
      bp = bA.p; by = bA.walk ? bA.yaw : t > E.rtInvoice ? faceTo(BI, [-4.2, 0, 9.8]) : t > E.rtCop3 + 3 ? faceTo(bp, [0, 0, 6]) : t > E.rtPhoto - 1 ? PI : 0.3; bo = { walk: bA.walk, phase: bA.phase * 2 };
      if (!bA.walk) { if (win(t, E.rtWow, E.rtWow + 4)) bo = { hop: true }; if (win(t, E.rtPhoto, E.rtPhoto + 3)) bo = { hop: true }; if (win(t, E.rtBonk, E.rtFlat)) bo = { angry: true }; if (win(t, E.rtFlat, E.rtInvoice)) bo = { facepalm: true }; if (t >= E.rtInvoice) bo = { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); if (win(t, E.rtFlat, E.rtFlat + 1.4)) bHat.position.y = 1.2 + Math.sin(seg(t, E.rtFlat, E.rtFlat + 1.4) * PI) * 2;
    // ---- Officer Coney (he says park it properly)
    coney.root.visible = scooter.visible = t >= E.rtCop3; tick27.visible = tick27.visible && t >= E.rtTicket;
    if (t >= E.rtCop3) { const sP = [-3.4, 0.5, lerp(-40, -4.2, ss(seg(t, E.rtCop3, E.rtCop3 + 2.5)))]; scooter.position.set(...sP); scooter.rotation.set(0, 0, 0);
      if (t < E.rtCop3 + 2.8) poseCone(coney, t, [sP[0], 1.02, sP[2] - 0.2], 0, { siren: true });
      else { const a = act(t, [[E.rtCop3 + 2.8, -4.6, 0.5, -2.6], [E.rtTicket, -4.6, 0.5, -2.6], [E.rtTicket + 1.6, -3.2, 0.5, 5.4]], [[0, {}]]); const cy = a.walk ? a.yaw : t > E.rtTicket ? PI / 2 : faceTo([-4.6, 0, -2.6], [0, 0, 8]);
        poseCone(coney, t, a.p, cy, { hop: a.walk, walk: a.walk, point: win(t, E.rtCop3 + 3, E.rtPark), whistle: win(t, E.rtPark, E.rtBonk) && Math.floor(t * 1.2) % 2 === 0, wide: win(t, E.rtBonk, E.rtShop + 2), write: win(t, E.rtTicket + 1.6, E.rtTicket + 3.6), pad: win(t, E.rtTicket + 1.4, E.rtTicket + 3.6) }); } }
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();
