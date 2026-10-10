// ---------------------------------------------------------------- Ep 31 helpers: Dingus the Bonkhorn, the Stair-O-Matic 3000 (eco mode!), the Summit Bell, snow + cloud bits, the altimeter HUD
const _v31 = new THREE.Vector3();
const wpos31 = o => { o.getWorldPosition(_v31); return [_v31.x, _v31.y, _v31.z]; };
const glow31 = (c, i = 0.7) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const snowM31 = new THREE.MeshLambertMaterial({ color: '#f6fbff', emissive: '#c8dcf0', emissiveIntensity: 0.25 });
const cloudM31 = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#dfe8f0', emissiveIntensity: 0.35, transparent: true, opacity: 0.6, depthWrite: false });
const snowP31 = (t, p, n = 40, sp = 3) => burst(t, p, { n, colors: ['#ffffff', '#e8f4fc', '#cfe4f4'], speed: sp, size: 0.18, life: 1.2, grav: 6, up: 2 });
const poof31 = (t, p) => burst(t, p, { n: 12, colors: ['#ffffff', '#5ff7ff', '#7cff6b'], speed: 1.4, size: 0.1, life: 0.5, grav: 0, up: 0.4 });
const lp31 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const act31 = (t, K, O = [[0, {}]], idle) => act(t, K, O, idle);
// ---- Dingus: a blocky Bonkhorn (mountain goat). curly horns, sideways pupils, unimpressed lids, a red collar. bonks things. eats things.
function makeGoat31() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const wool = new THREE.MeshLambertMaterial({ color: '#efe6d2' }), wool2 = new THREE.MeshLambertMaterial({ color: '#fff8ea' }), hoof = new THREE.MeshLambertMaterial({ color: '#4a3a30' }), horn = new THREE.MeshLambertMaterial({ color: '#7a6450' }), face = new THREE.MeshLambertMaterial({ color: '#d8ccb8' });
  box(1.0, 0.9, 1.6, 0, 0, 1.15, 0, body, wool);
  for (const [x, y, z] of [[0.3, 1.62, 0.3], [-0.25, 1.6, -0.4], [0.05, 1.65, -0.05], [0.42, 1.2, 0.5], [-0.42, 1.25, -0.2]]) box(0.42, 0.3, 0.42, 0, x, y, z, body, wool2);
  const legs = [[-0.3, 0.55], [0.3, 0.55], [-0.3, -0.55], [0.3, -0.55]].map(([x, z]) => { const p = pivot(body, x, 0.75, z); box(0.24, 0.62, 0.24, 0, 0, -0.31, 0, p, wool); box(0.26, 0.16, 0.28, 0, 0, -0.66, 0.02, p, hoof); return p; });
  const tail = pivot(body, 0, 1.45, -0.8); box(0.2, 0.3, 0.2, 0, 0, 0.1, -0.05, tail, wool2);
  box(0.74, 0.14, 0.24, '#c0182a', 0, 1.22, 0.78, body);
  const bellSlot = pivot(body, 0, 1.12, 0.92);
  const hd = pivot(body, 0, 1.55, 0.75);
  box(0.62, 0.6, 0.78, 0, 0, 0.12, 0.3, hd, face); box(0.5, 0.36, 0.34, 0, 0, 0.0, 0.82, hd, face); box(0.3, 0.08, 0.04, '#3a2a2a', 0, 0.08, 1.0, hd);
  const jaw = pivot(hd, 0, -0.15, 0.6); box(0.44, 0.14, 0.4, 0, 0, -0.06, 0.18, jaw, face); box(0.18, 0.36, 0.16, 0, 0, -0.3, 0.2, jaw, wool2);
  const eyeY = new THREE.MeshBasicMaterial({ color: '#ffd23f' }), eyeK = new THREE.MeshBasicMaterial({ color: '#111111' });
  const eyes = [-1, 1].map(sd => { const e = pivot(hd, sd * 0.24, 0.26, 0.7); box(0.2, 0.16, 0.04, 0, 0, 0, 0, e, eyeY); box(0.16, 0.05, 0.05, 0, 0, 0, 0.01, e, eyeK); return e; });
  const lids = [-1, 1].map(sd => box(0.22, 0.08, 0.06, 0, sd * 0.24, 0.32, 0.72, hd, face));
  for (const sd of [-1, 1]) { box(0.36, 0.12, 0.2, 0, sd * 0.44, 0.28, 0.25, hd, face);
    [[0.3, 0.5, 0.15], [0.52, 0.62, -0.08], [0.7, 0.45, -0.3], [0.74, 0.18, -0.2], [0.62, 0.02, 0.04]].forEach(([x, y, z], i) => box(0.24 - i * 0.02, 0.24 - i * 0.02, 0.26, 0, sd * x, y, z, hd, horn)); }
  const hatSlot = pivot(hd, 0, 0.42, 0.25);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, tail, hd, jaw, eyes, lids, bellSlot, hatSlot };
}
function poseGoat31(D, t, p, yaw, o = {}) {
  D.root.visible = true; D.root.position.set(...p); D.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); D.root.scale.setScalar(o.s ?? 1.15);
  const w = o.walk ?? 0; D.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 14 + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0)) * 0.7 * w);
  if (o.tuck) D.legs.forEach((l, i) => l.rotation.x = i < 2 ? -1.0 : 1.0);
  D.body.position.set(0, w ? Math.abs(Math.sin(t * 14)) * 0.08 : 0, 0.45 * (o.bonk ?? 0));
  if (o.happy) D.body.position.y += Math.abs(Math.sin(t * 8)) * 0.22;
  if (o.lie) { D.body.position.y -= 0.55; D.legs.forEach(l => l.rotation.x = 0); D.legs.forEach(l => l.visible = false); } else D.legs.forEach(l => l.visible = true);
  D.tail.rotation.x = Math.sin(t * (o.happy ? 20 : 3)) * (o.happy ? 0.6 : 0.2);
  D.hd.rotation.set(0.9 * (o.bonk ?? 0) + (o.headX || 0), o.headY || 0, o.headR || 0);
  D.jaw.rotation.x = o.baa ? 0.45 : o.chew ? Math.abs(Math.sin(t * 9)) * 0.25 : 0; D.jaw.rotation.z = o.chew ? Math.sin(t * 9) * 0.12 : 0;
  D.lids.forEach(l => { l.visible = !o.wide; l.scale.y = o.sleep ? 2.4 : 1; l.position.y = o.sleep ? 0.27 : 0.32; });
}
const goat31 = makeGoat31();
// ---- the Summit Bell (origin = hang point)
const bell31 = new THREE.Group(); { const gold = new THREE.MeshLambertMaterial({ color: '#ffc83a', emissive: '#a07000', emissiveIntensity: 0.35 });
  box(0.12, 0.12, 0.12, '#8a6a20', 0, 0, 0, bell31); box(0.36, 0.3, 0.36, 0, 0, -0.2, 0, bell31, gold); box(0.5, 0.2, 0.5, 0, 0, -0.42, 0, bell31, gold); box(0.62, 0.08, 0.62, 0, 0, -0.55, 0, bell31, gold); box(0.12, 0.14, 0.12, '#5a4010', 0, -0.64, 0, bell31); }
// ---- the Stair-O-Matic 3000: a backpack that shoots stairs. ECO MODE recycles the ones behind you. (nobody listened.)
const pack31 = new THREE.Group(); { const teal = new THREE.MeshLambertMaterial({ color: '#2ec4b6' });
  box(0.8, 0.86, 0.46, 0, 0, 0, 0, pack31, teal); box(0.84, 0.12, 0.5, '#ffd23f', 0, 0.44, 0, pack31);
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(GEO, MAT.plank); m.scale.setScalar(0.24); m.position.set(-0.22 + i * 0.22, 0.62, 0); pack31.add(m); }
  box(0.44, 0.24, 0.04, 0, 0, 0.12, -0.24, pack31, glow31('#7cff6b', 0.8)); box(0.12, 0.12, 0.05, 0, -0.28, -0.2, -0.24, pack31, glow31('#ff5ca8', 0.8));
  box(0.14, 0.14, 0.9, '#8a8a98', 0.5, 0.5, 0.3, pack31); box(0.26, 0.26, 0.16, '#ff8a2a', 0.5, 0.5, 0.78, pack31);
  plane26(0.72, 0.18, txtMat26(['STAIR-O-MATIC'], 256, 64, '#2ec4b6', '#ffffff', 30), pack31, 0, -0.24, -0.235, PI); }
const handR31 = pivot(hero.aR, 0, -0.72, 0.05);
// ---- Bloop's camera (he wants ONE good summit selfie for his builder portfolio), his tripod, the invoice, a snowball
const bcam31 = new THREE.Group(); box(0.34, 0.24, 0.16, '#2a2a34', 0, 0, 0, bcam31); box(0.14, 0.14, 0.1, '#5ff7ff', 0, 0, 0.12, bcam31); box(0.08, 0.06, 0.06, '#ff5ca8', 0.1, 0.15, 0, bcam31);
bloop6.B.aR.add(bcam31); bcam31.position.set(0, -0.62, 0.22); bcam31.visible = false;
const tripod31 = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = i * 2.1, l = box(0.06, 1.3, 0.06, '#3a3a44', Math.sin(a) * 0.22, 0.6, Math.cos(a) * 0.22, tripod31); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); }
box(0.4, 0.28, 0.22, '#2a2a34', 0, 1.35, 0, tripod31); box(0.16, 0.16, 0.1, '#5ff7ff', 0, 1.35, -0.15, tripod31);
const inv31 = card28(['INVOICE', '1 HARD HAT'], '#ffffff', '#c0182a', 28); bloop6.B.aR.add(inv31); inv31.position.set(0, -0.62, 0.2); inv31.rotation.x = 1.4; inv31.visible = false;
const sball31 = new THREE.Group(); box(0.42, 0.42, 0.42, 0, 0, 0, 0, sball31, snowM31);
function stairPool31(g, n) { const A = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(GEO, MAT.plank); m.castShadow = m.receiveShadow = true; m.visible = false; g.add(m); A.push(m); } return A; }
function showStair31(m, p, k) { m.visible = k > 0.02; m.position.set(...p); m.scale.setScalar(Math.max(0.02, Math.min(1, k))); }
function hide31() { hide30(); [goat31.root, bell31, tripod31, sball31, bcam31, inv31, pack31].forEach(o => o.visible = false); L6.root.rotation.order = 'YXZ'; }
function reset31(g) { [hero.root, bloop6.B.root, L6.root, goat31.root, bell31, tripod31, sball31].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true;
  parentTo(bHat, bloop6.B.hd); bHat.visible = true; bHat.position.set(0, 1.2, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
  parentTo(pack31, hero.body); pack31.position.set(0, 1.15, -0.5); pack31.rotation.set(0, 0, 0); pack31.visible = true; bell31.scale.setScalar(1); bell31.rotation.set(0, 0, 0); }
function hatOnGoat31() { parentTo(bHat, goat31.hatSlot); bHat.position.set(0, 0.02, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(0.9); }
function bellOnGoat31() { bell31.visible = true; bell31.position.set(...wpos31(goat31.bellSlot)); bell31.scale.setScalar(0.7); bell31.rotation.set(0, goat31.root.rotation.y, 0); }
function bellInHand31(t, swing = 0) { bell31.visible = true; bell31.position.set(...wpos31(handR31)); bell31.scale.setScalar(0.8); bell31.rotation.set(0, 0, Math.sin(t * 16) * swing); }
// ---- HUD: altimeter + stair blocks + eco mode — this episode's mechanic
const ALT31 = [[0, 0], [E.mtCliff, 0], [E.mtSummit, 392], [E.mtSummit + 3, 400], [E.mtDescend, 400], [E.mtBase, 0]];
function drawAlt31(t) { if (t < E.mtReveal + 5 || t >= E.freeze || t >= E.mtBury) return;
  rrect(22, 96, 250, 124, 12); ctx.fillStyle = 'rgba(14,22,40,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2ec4b6'; ctx.stroke();
  const alt = Math.round(lerpK(ALT31, t)), x0 = 40, y0 = 112; outlined('ALTITUDE', x0, y0, 13, '#9ff0e8', '#000', 3, 'left'); outlined(alt + ' m', x0, y0 + 26, 26, '#ffffff', '#000', 5, 'left');
  ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(228, 108, 26, 100); ctx.fillStyle = '#5ff7ff'; const h = 100 * alt / 400; ctx.fillRect(228, 208 - h, 26, h); outlined('▲', 241, 208 - h, 14, '#ff8a2a', '#000', 3);
  outlined('STAIRS: 12', x0, y0 + 58, 15, '#ffe066', '#000', 3, 'left');
  const fl = Math.floor(t * 3) % 2, after = t > E.mtEcoRev + 1;
  outlined(after ? (fl ? 'ECO MODE ♻ (oh no)' : 'ECO MODE ♻') : 'ECO MODE ♻ ON', x0, y0 + 82, 14, after ? '#ff6b5a' : '#7cff6b', '#000', 3, 'left'); }
function drawLegend31(T) { const s = E.mtLegend + 0.8, e = E.mtLegend + 7.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.47 + (1 - k) * 60); ctx.rotate(-0.04);
  ctx.fillStyle = '#f2dfb0'; ctx.fillRect(-210, -160, 420, 320); ctx.strokeStyle = '#a07a40'; ctx.lineWidth = 6; ctx.strokeRect(-210, -160, 420, 320);
  outlined('THE SUMMIT BELL', 0, -122, 30, '#5a2a10', '#f2dfb0', 2);
  ctx.font = F(19, 'normal'); ctx.fillStyle = '#3a2410'; ctx.textAlign = 'center'; ['Ring it atop Mt. Bonkhorn', 'and your name echoes across', 'ALL of Shardwild. Forever.'].forEach((l, i) => { if (T > s + 0.6 + i * 0.8) ctx.fillText(l, 0, -74 + i * 32); });
  ctx.fillStyle = '#8a8c98'; ctx.beginPath(); ctx.moveTo(-150, 140); ctx.lineTo(-40, 30); ctx.lineTo(70, 140); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-72, 62); ctx.lineTo(-40, 30); ctx.lineTo(-8, 62); ctx.fill();
  if (T > s + 2.8) { ctx.fillStyle = '#ffc83a'; ctx.fillRect(100, 60, 50, 44); ctx.fillRect(90, 100, 70, 14); outlined('?', 125, 40, 30, '#c0182a', '#f2dfb0', 2); }
  ctx.restore(); }
function drawPhoto31(T) { for (const [s, cap, ok] of [[E.mtSnap1 + 2.5, 'summit selfie #1', 0], [E.mtSelfie + 3.5, 'summit selfie #3', 1]]) { if (!win(T, s, s + 2.6)) continue;
  const k = ss(seg(T, s, s + 0.2)); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#fbfbf4'; const m = 34, b = 120; ctx.fillRect(0, 0, W, m); ctx.fillRect(0, 0, m, H); ctx.fillRect(W - m, 0, m, H); ctx.fillRect(0, H - b, W, b);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.strokeRect(m, m, W - 2 * m, H - m - b);
  ctx.font = F(36, 'normal'); ctx.fillStyle = '#2a2a3a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(cap, m + 20, H - b / 2);
  if (T > s + 0.7) { ctx.save(); ctx.translate(W - 260, H - b / 2); ctx.rotate(-0.1); outlined(ok ? 'PERFECT ✓' : 'GOAT ✗', 0, 0, 40, ok ? '#2bd46a' : '#e8344e', '#fff', 6); ctx.restore(); }
  ctx.restore(); } }
function drawEco31(T) { const s = E.mtEcoRev + 0.5, e = E.mtEcoRev + 5.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.3)) * (1 - ss(seg(T, e - 0.3, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H * 0.47 + (1 - k) * 50);
  rrect(-230, -150, 460, 300, 20); ctx.fillStyle = '#1c2a30'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2ec4b6'; ctx.stroke(); rrect(-200, -120, 400, 240, 10); ctx.fillStyle = '#062a14'; ctx.fill();
  outlined('STAIR-O-MATIC 3000', 0, -94, 24, '#7cff6b', '#000', 3);
  const L = [['ECO MODE: ON ♻', '#7cff6b'], ['STAIRS RECYCLED: 412', '#bfffb0'], ['STAIRS LEFT: 12', '#ffe066'], ['DOWN MODE: sold separately', '#ff6b5a']];
  L.forEach(([l, c], i) => { if (T > s + 0.4 + i * 0.7) outlined(l, 0, -44 + i * 42, i === 3 ? 22 : 20, c, '#000', 3); });
  ctx.restore(); }
function drawEcho31(T) { for (const s of [E.mtRing + 6.2, E.mtRingB + 1.0]) { if (!win(T, s, s + 3.4)) continue;
  for (let i = 0; i < 4; i++) { const k = (T - s - i * 0.5) / 2.2; if (k < 0 || k > 1) continue; ctx.strokeStyle = `rgba(255,224,102,${(1 - k) * 0.8})`; ctx.lineWidth = 8 * (1 - k) + 2; ctx.beginPath(); ctx.arc(W / 2, H * 0.4, 60 + k * W * 0.55, 0, 7); ctx.stroke(); } } }
function drawFlash31(T) { if (!win(T, E.mtFlash, E.mtFlash + 4)) return; const k = ss(seg(T, E.mtFlash, E.mtFlash + 0.3)) * (1 - ss(seg(T, E.mtFlash + 3.7, E.mtFlash + 4)));
  ctx.save(); ctx.globalAlpha = k; const g2 = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8); g2.addColorStop(0, 'rgba(255,240,200,0)'); g2.addColorStop(1, 'rgba(255,240,200,.85)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  outlined('FLASHBACK', W * 0.5, H * 0.1, 40, '#ffe066', '#5a3a10', 6); outlined('(2 hours ago)', W * 0.5, H * 0.17, 22, '#ffffff', '#5a3a10', 4); ctx.restore(); }

// ================================================================ EPISODE 31: "THE MOUNTAIN (we forgot the way down)" — base camp by day (the Stair-O-Matic 3000; the legend of the Summit Bell; Leggy is scared of heights; eco mode, blah blah) → the cliff (stairs appear ahead, vanish behind; a gust; Dingus the Bonkhorn on a wall; selfie #1 photobombed; chat: WHERE ARE THE STAIRS; the cloud layer) → the summit at sunset (no bell: it's on the goat; chase; BONK; tripod eaten; Bloop trades his hard hat; DING; selfie #3; no way down; eco mode) → flashback → night (plan A: jump in the clouds — plip; plan B: twelve stairs, stranded) → Leggy climbs! → dawn descent on Leggy's back → base camp (invoice; victory DING) → AVALANCHE → buried
// ---------------------------------------------------------------- set A: base camp (morning; then next morning)
const camp31 = (() => {
  const g = mk('camp31'); const st = new VSet(g);
  for (let x = -44; x <= 44; x++) for (let z = -52; z <= 34; z++) st.add(x, 0, z, (Math.abs(x) <= 1 && z < -6) ? 'path' : 'turf');
  st.add(-5, 1, 7, 'stone');
  for (const [x, z, h] of [[-14, -10, 5], [-20, 4, 6], [-26, -18, 6], [16, 8, 5], [22, -6, 6], [28, -20, 6], [-34, -30, 5], [34, -30, 6], [-14, 22, 5], [18, 24, 5], [-30, 14, 6], [32, 16, 5], [-10, -34, 6], [12, -38, 5]]) tree29(st, x, z, h, 0);
  st.build();
  const MT = new THREE.Group(); g.add(MT); const mtL = [];
  for (let k = 0; k < 13; k++) { const s = 110 - 8 * k, col = k >= 8 ? (k % 2 ? '#f4faff' : '#e2ecf6') : (k % 2 ? '#7d7f8c' : '#8c8e9a'); const m = box(s, 5.5, s * 0.8, col, 0, 2.75 + 5.5 * k, -95 + k * 0.6, MT); m.castShadow = false; mtL.push(m);
    if (k >= 3 && k < 8) for (const sd of [-1, 1]) box(s * 0.18, 0.6, 2.5, '#f4faff', sd * s * (0.12 + 0.05 * (k % 3)), 5.6 + 5.5 * k, -95 + k * 0.6 + s * 0.4 - 1, MT); }
  box(6, 6, 5, '#ffffff', 0, 74.5, -88, MT);
  for (const [x, w, h, z] of [[-82, 60, 44, -120], [86, 52, 36, -112], [-130, 50, 30, -90], [128, 60, 40, -80]]) { box(w, h, w * 0.7, '#6d7080', x, h / 2, z, MT); box(w * 0.5, 5, w * 0.36, '#eef4fa', x, h + 2.5, z, MT); }
  const tent = pivot(g, -8, 0.5, -3); for (const sd of [-1, 1]) { const w = box(0.2, 3.2, 3.6, '#ff8a2a', sd * 0.9, 1.1, 0, tent); w.rotation.z = sd * 0.62; } box(0.12, 1.6, 0.12, '#5a3a22', 0, 0.8, 1.85, tent);
  const fire = pivot(g, -3, 0.5, 2.6); box(1.0, 0.2, 0.25, '#6a4a2a', 0, 0.1, 0, fire); box(0.25, 0.2, 1.0, '#6a4a2a', 0, 0.1, 0, fire); const flame = box(0.4, 0.5, 0.4, 0, 0, 0.45, 0, fire, glow31('#ff9a2a', 1));
  const fireL = new THREE.PointLight('#ff9a40', 3, 8, 1.5); fireL.position.set(0, 1, 0); fire.add(fireL);
  board28(['MT. BONKHORN', 'SUMMIT: UP. VERY UP.'], 4.6, 1.6, g, 7.5, 2.6, -5, -0.35, '#f6e7c1', '#5a2a10', 512, 192, 46);
  box(4, 3.2, 3.4, '#a0603a', 15, 2.1, -10, g); box(4.6, 0.5, 4, '#5a3a22', 15, 3.9, -10, g); board28(['RANGER:', 'GONE FISHING'], 2.6, 1.0, g, 15, 2.4, -8.2, 0, '#ffffff', '#1a3a6a', 384, 160, 44, false);
  const ST = stairPool31(g, 5);
  // ---- the avalanche: a wall of snow down the mountain + the snow that fills the camp
  const wave = new THREE.Group(); g.add(wave); box(96, 9, 7, 0, 0, 4.5, 0, wave, snowM31); for (let i = 0; i < 18; i++) box(4 + hash2(i, 1, 31) * 5, 3 + hash2(i, 2, 31) * 4, 4, 0, -46 + i * 5.4, 9 + hash2(i, 3, 31) * 2, 1, wave, snowM31);
  const WY = [[E.mtAval, 66], [E.mtAval + 4, 6], [E.mtRun, 0.5], [E.mtBury + 0.6, 0.5]], WZ = [[E.mtAval, -84], [E.mtAval + 4, -52], [E.mtRun, -40], [E.mtBury + 0.6, 22]];
  const wy = t => lerpK(WY, t), wz = t => lerpK(WZ, t);
  smoke(E.mtAval, E.mtBury + 0.5, 0.08, t => [(hash2(Math.floor(t * 100), 7, 31) - 0.5) * 80, wy(t) + 10, wz(t) + 2], { n: 6, colors: ['#ffffff', '#e8f4fc', '#dfe8f0'], speed: 3, size: 0.9, life: 1.4, grav: -0.5, up: 2 });
  const fill = new THREE.Group(); g.add(fill); box(96, 1, 90, 0, 0, 0.5, -8, fill, snowM31);
  for (const [x, z, h, w] of [[1.5, 4.5, 1.5, 3], [-6, 2, 1.3, 4], [8, 9, 1.4, 3.5], [-12, -4, 1.8, 5], [12, -6, 1.6, 4.5], [-4, 12, 1.2, 3], [5, 14, 1.3, 4]]) box(w, h, w, 0, x, h / 2, z, fill, snowM31);
  for (let i = 0; i < 5; i++) snowP31(E.mtBury + 0.3 + i * 0.25, [(i - 2) * 4, 3, 8 + i], 60, 5);
  snowP31(E.mtPop + 0.5, [0, 2.6, 8], 30); snowP31(E.mtPop + 1.6, [-2.2, 2.6, 9.2], 30); snowP31(E.mtPop + 2.6, [2.8, 2.6, 7.5], 40); snowP31(E.mtPop + 4.8, [1.5, 3.6, 4.5], 30);
  for (let i = 0; i < 5; i++) poof31(E.mtTest + 0.4 + i * 0.35, [2 + i, 1 + i, -2]);
  poof31(E.mtEco + 1.4, [2, 1, -2]); poof31(E.mtEco + 1.9, [3, 2, -2]); poof31(E.mtEco + 4.0, [4, 3, -2]); poof31(E.mtEco + 4.3, [5, 4, -2]); poof31(E.mtEco + 4.6, [6, 5, -2]);
  burst(E.mtReveal + 0.5, [2.4, 2.2, 3], { n: 70, colors: ['#ffe066', '#ff5ca8', '#5ff7ff', '#7cff6b'], speed: 5, size: 0.15, life: 1.5, grav: 4, up: 4 });
  smoke(E.mtRumble, E.mtAval, 0.15, [0, 68, -86], { n: 4, colors: ['#ffffff', '#e8f4fc'], speed: 2, size: 1.2, life: 1.5, grav: 1, up: 1 });
  const H0 = [0, 0.5, 4.2], B0 = [2.4, 0.5, 2.6], L0 = [-3.2, 0.5, 5.0], ROCK = [-5, 1.5, 7];
  function update(tt) {
    hideMisc(); hide31(); reset31(g);
    const fb = win(tt, E.mtFlash, E.mtFlash + 4), t = fb ? E.mtEco + (tt - E.mtFlash) : tt;
    flame.scale.set(1, 1 + Math.sin(t * 13) * 0.25, 1); fireL.intensity = 2.5 + Math.sin(t * 17) * 0.6;
    const rum = win(t, E.mtRumble, E.mtAval + 2); mtL.forEach((m, k) => { m.position.x = rum && k >= 8 ? Math.sin(t * 40 + k) * 0.4 : 0; });
    wave.visible = win(t, E.mtAval, E.mtBury + 0.6); wave.position.set(0, wy(t), wz(t));
    const lev = t < E.mtBury ? 0 : lerp(0.2, 2, ss(seg(t, E.mtBury, E.mtBury + 0.9))); fill.visible = lev > 0; fill.position.y = 0.5; fill.scale.y = Math.max(0.01, lev);
    ST.forEach(m => m.visible = false);
    let cam;
    if (t < E.mtCliff) {
      // ---- stairs (the test)
      if (win(t, E.mtTest, E.mtClimb)) ST.forEach((m, i) => { const a = seg(t, E.mtTest + 0.4 + i * 0.35, E.mtTest + 0.7 + i * 0.35), r = i < 2 ? 1 - seg(t, E.mtEco + 1.4 + i * 0.5, E.mtEco + 1.8 + i * 0.5) : 1 - seg(t, E.mtEco + 4.0 + (i - 2) * 0.3, E.mtEco + 4.3 + (i - 2) * 0.3); showStair31(m, [2 + i, 1 + i, -2], Math.min(a, r)); });
      // ---- the pack: in Bloop's arms, then onto my back
      if (t < E.mtReveal + 4.4) { parentTo(pack31, g); pack31.visible = t > 5;
        const by = faceTo(B0, H0), hy = faceTo(H0, B0), from = wl(B0, by, [0, 1.0, 0.55]), to = wl(H0, hy, [0, 1.65, -0.5]);
        pack31.position.set(...(t < E.mtReveal + 3.6 ? from : arcPath(t, [[E.mtReveal + 3.6, ...from, 0], [E.mtReveal + 4.4, ...to, 1.6]]))); pack31.rotation.set(0, t < E.mtReveal + 3.6 ? by + PI : hy, 0); }
      // ---- me
      const hyB = faceTo(H0, B0), stair = win(t, E.mtTest + 1.5, E.mtEco + 3.8);
      if (stair) { const jh = lerp(0, 2, seg(t, E.mtTest + 1.5, E.mtTest + 3.3)); let p = [2 + jh, 1.5 + jh, -2], o = { face: 'smug', yaw: PI / 2, walk: jh > 0 && jh < 2 ? 1 : 0, phase: jh * 4 };
        if (t > E.mtTest + 3.5) o = { face: 'smug', yaw: 0.5, wave: win(t, E.mtEco + 0.3, E.mtEco + 2.6) };
        if (t > E.mtEco + 3.0) { p = arcPath(t, [[E.mtEco + 3.0, 4, 3.5, -2, 0], [E.mtEco + 3.8, 4.6, 0.5, -0.6, 1]]); o = { face: 'scared', yaw: 0.5 }; }
        pose(hero, { t, p, ...o }); }
      else { const hA = act31(t, [[0, 0.5, 0.5, 19], [6.5, ...H0], [E.mtTest - 2.2, ...H0], [E.mtTest, 1, 0.5, -2], [E.mtTest + 1.5, 1, 0.5, -2], [E.mtEco + 3.8, 4.6, 0.5, -0.6], [E.mtClimb, 4.6, 0.5, -0.6], [E.mtCliff, 1.5, 0.5, -18]],
          [[0, { face: 'smug', wave: t < 3 }], [6.5, { face: 'normal', yaw: hyB }], [E.mtReveal + 0.6, { face: 'smug', yaw: hyB }], [E.mtReveal + 4.4, { face: 'smug', yaw: hyB, spin: ss(seg(t, E.mtReveal + 4.4, E.mtReveal + 6.2)) * 2 * PI }],
           [E.mtLegend, { face: 'smug', yaw: PI }], [E.mtScared + 0.8, { face: 'normal', yaw: faceTo(H0, ROCK) }], [E.mtScared + 3, { face: 'smug', yaw: faceTo(H0, ROCK) }], [E.mtTest, { face: 'smug', yaw: PI / 2 }], [E.mtEco + 3.8, { face: 'normal', yaw: PI }]]);
        pose(hero, { t, ...hA }); if (win(t, E.mtLegend + 0.5, E.mtLegend + 6)) hero.aR.rotation.set(-2.6, 0, 0.2); }
      // ---- Bloop (proud inventor. explains eco mode. nobody listens.)
      const bA = act31(t, [[0, 2.6, 0.5, 23], [7.5, ...B0], [E.mtTest - 2, ...B0], [E.mtTest - 0.6, 2.4, 0.5, 0.6], [E.mtClimb, 2.4, 0.5, 0.6], [E.mtCliff, 3.4, 0.5, -15.5]],
        [[0, {}], [7.5, { yaw: faceTo(B0, H0) }], [E.mtReveal, { yaw: faceTo(B0, H0), handOut: true }], [E.mtReveal + 0.6, { yaw: faceTo(B0, H0), hop: true }], [E.mtReveal + 3.6, { yaw: faceTo(B0, H0) }], [E.mtLegend, { yaw: PI }],
         [E.mtScared + 0.6, { yaw: faceTo(B0, ROCK) }], [E.mtTest, { yaw: faceTo([2.4, 0, 0.6], [3, 0, -2]) }], [E.mtEco, { yaw: faceTo([2.4, 0, 0.6], [4, 0, -2]), handOut: true }], [E.mtEco + 2.2, { yaw: faceTo([2.4, 0, 0.6], [4, 0, -2]), facepalm: true }], [E.mtClimb, {}]]);
      poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA });
      // ---- Leggy: scared of heights. one block of height.
      if (t < E.mtScared + 1.6) { const lA = act31(t, [[0, -3, 0.5, 25], [8, ...L0], [E.mtScared, ...L0], [E.mtScared + 1.4, -4.6, 0.5, 8.4]]); poseLurk(L6, t, lA.p, lA.walk ? lA.yaw : 0.3, lA.walk ? 2 : 0.4); }
      else if (t < E.mtScared + 2.2) poseLurk(L6, t, arcPath(t, [[E.mtScared + 1.6, -4.6, 0.5, 8.4, 0], [E.mtScared + 2.2, ...ROCK, 0.6]]), 0.5, 1);
      else if (t < E.mtClimb + 0.5) { const P = [...ROCK]; if (t > E.mtScared + 2.6) { P[0] += Math.sin(t * 50) * 0.04; } poseLurk(L6, t, P, 0.5, 0.3); if (t > E.mtScared + 2.6) { L6.hd.rotation.set(0.5, Math.sin(t * 30) * 0.08, 0); L6.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 40 + i) * 0.15); } }
      else { const lA = act31(t, [[E.mtClimb + 0.5, ...ROCK], [E.mtClimb + 1.2, -4.4, 0.5, 5.6], [E.mtCliff, -0.6, 0.5, -13.5]]); poseLurk(L6, t, t < E.mtClimb + 1.2 ? arcPath(t, [[E.mtClimb + 0.5, ...ROCK, 0], [E.mtClimb + 1.2, -4.4, 0.5, 5.6, 0.5]]) : lA.p, lA.walk ? lA.yaw : PI, 2); L6.root.position.x += Math.sin(t * 50) * 0.03; }
      const CA = [[0, 0.5, 3.0, 28, 0, 16, -60, 55], [6.4, 0.5, 3.4, 24, 0, 14, -60, 52],
        [6.5, 1.2, 2.4, 11.5, 1.0, 1.4, 3.4, 48], [8.9, 1.2, 2.3, 10.5, 1.0, 1.4, 3.4, 46],
        [9, 4.0, 2.0, 7.2, 1.4, 1.3, 3.0, 46], [12.4, 3.6, 2.1, 6.8, 1.4, 1.3, 3.0, 44],
        [12.5, -1.6, 2.6, 9.6, 0.4, 1.5, 3.8, 46], [14.9, -2.0, 2.6, 9.0, 0.4, 1.5, 3.8, 44],
        [15, 1.6, 2.2, 10.5, 0, 30, -90, 50], [22.9, 1.2, 2.6, 9.0, 0, 36, -90, 38],
        [23, -1.4, 1.0, 13.6, -5, 2.2, 7, 44], [28.9, -2.2, 1.1, 13.0, -5, 2.2, 7, 38],
        [29, 3.6, 3.0, 8.4, 3.4, 2.0, -2, 50], [32.9, 4.2, 3.4, 7.8, 3.4, 2.2, -2, 48],
        [33, 7.4, 2.8, 4.2, 3.2, 2.6, -1.0, 46], [36.9, 7.0, 2.6, 3.6, 3.2, 2.4, -1.0, 42],
        [37, 3, 2.5, 6, 1, 6, -40, 52], [41.9, 2.5, 5, 3.5, 1, 20, -80, 56]];
      cam = camKeys(t, CA);
    } else {
      // ---- next morning: Leggy carries us home. then: invoice, victory ding, avalanche.
      const LA = [0, 0.5, -3.5], HA = [-1.6, 0.5, -0.4], BA = [1.8, 0.5, 0.4], DA = [4.6, 0.5, -2.0];
      const run = t >= E.mtRun, bury = t >= E.mtBury, turnM = win(t, E.mtRumble, E.mtAval + 0.6);
      const rk = seg(t, E.mtRun, E.mtBury), rz = z0 => lerp(z0, z0 + 17.5, rk);
      // Leggy
      let lp = [...LA], ly = turnM ? PI : 0;
      if (t < E.mtBase + 4.6) lp = lp31([0, 0.5, -34], LA, seg(t, E.mtBase, E.mtBase + 4.6));
      if (run) lp = [lerp(0, 3.4, rk), 0.5, rz(-3.5)];
      if (!bury) { poseLurk(L6, t, lp, ly, t < E.mtBase + 4.6 || run ? 2.4 : 0.4);
        if (win(t, E.mtBase + 5.2, E.mtInvoice + 3)) { L6.body.position.y = 0.8; L6.hd.rotation.set(0.3, 0, 0.2); }
        if (win(t, E.mtInvoice + 3, E.mtRingB)) L6.root.position.y += Math.abs(Math.sin(t * 7)) * 0.3;
        if (win(t, E.mtAval + 1, E.mtRun)) L6.root.position.x += Math.sin(t * 50) * 0.05; }
      else if (t >= E.mtPop + 2.4) { const k = ss(seg(t, E.mtPop + 2.4, E.mtPop + 3.0)); poseLurk(L6, t, [2.8, lerp(0.5, 3.4, k), 7.5], 0.3, 3); L6.root.rotation.set(0, 0.3, PI); L6.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 16 + i * 1.3) * 0.6); }
      else L6.root.visible = false;
      // me
      const ride = t < E.mtBase + 5;
      if (ride) { pose(hero, { t, p: wl(lp, 0, [0, 1.85, 0.1]), yaw: 0, face: t < E.mtBase + 3 ? 'normal' : 'smug', sit: 1, wave: t > E.mtBase + 3 }); }
      else if (!bury) { let p = HA, o = { face: 'smug', yaw: faceTo(HA, BA) };
        if (t < E.mtBase + 5.8) p = arcPath(t, [[E.mtBase + 5, ...wl(lp, 0, [0, 1.85, 0.1]), 0], [E.mtBase + 5.8, ...HA, 1]]);
        if (t > E.mtInvoice + 2.2) o = { face: 'scared', yaw: faceTo(HA, BA) };
        if (t > E.mtInvoice + 5) o = { face: 'smug', yaw: 0.3 };
        if (win(t, E.mtRingB, E.mtRumble)) o = { face: 'smug', yaw: 0.2 };
        if (turnM) o = { face: 'normal', yaw: PI, headPitch: -0.35 };
        if (win(t, E.mtAval + 0.6, E.mtRun)) o = { face: 'scared', yaw: 0, panic: t > E.mtAval + 2.5 };
        if (run) { p = [lerp(-1.6, -0.8, rk), 0.5, rz(-0.4)]; o = { face: 'scared', yaw: 0, walk: 1.2, phase: t * 14, panic: true }; }
        pose(hero, { t, p, ...o }); if (win(t, E.mtRingB, E.mtRumble + 1)) hero.aR.rotation.set(-2.9, 0, 0.2);
        if (t >= E.mtCarry && !run) bellInHand31(t, win(t, E.mtRingB + 0.8, E.mtRumble) ? 0.6 : 0.05); }
      else if (t >= E.mtPop) { const k = ss(seg(t, E.mtPop + 0.4, E.mtPop + 0.9)); pose(hero, { t, p: [0, lerp(-1.2, 1.0, k), 8], yaw: 0.15, face: 'scared', headRoll: Math.sin(t * 2) * 0.1 }); }
      else hero.root.visible = false;
      // Bloop
      if (ride) poseBurble(bloop6, t, wl(lp, 0, [0, 1.7, -1.2]), 0, { hop: t > E.mtBase + 3 });
      else if (!bury) { let p = BA, o = { yaw: faceTo(BA, HA) };
        if (t < E.mtBase + 6.2) p = arcPath(t, [[E.mtBase + 5, ...wl(lp, 0, [0, 1.7, -1.2]), 0], [E.mtBase + 6.2, ...BA, 1]]);
        if (win(t, E.mtInvoice, E.mtInvoice + 5)) { o = { yaw: faceTo(BA, HA), handOut: true }; inv31.visible = true; }
        if (win(t, E.mtRingB, E.mtRumble)) o = { yaw: faceTo(BA, HA), hop: true };
        if (turnM) o = { yaw: PI };
        if (win(t, E.mtAval + 0.6, E.mtRun)) o = { yaw: 0, angry: true };
        if (run) { p = [lerp(1.8, 1.4, rk), 0.5, rz(0.4)]; o = { yaw: 0, angry: true, walk: 1, phase: t * 14 }; }
        poseBurble(bloop6, t, p, o.yaw, o); bHat.visible = false; }
      else if (t >= E.mtPop + 1.4) { const k = ss(seg(t, E.mtPop + 1.4, E.mtPop + 1.9)); poseBurble(bloop6, t, [-2.2, lerp(-1, 1.6, k), 9.2], 0.2, { angry: t > E.mtPop + 3 }); bHat.visible = false; }
      else bloop6.B.root.visible = false;
      // Dingus: follows us home. in my hard hat. surfs the avalanche. gets his bell back.
      parentTo(goat31.root, g); hatOnGoat31();
      if (t < E.mtBase + 1.5) goat31.root.visible = false;
      else if (!run && !bury) { const dA = act31(t, [[E.mtBase + 1.5, 6, 0.5, -34], [E.mtBase + 7, ...DA]]); let o = { walk: dA.walk, chew: !dA.walk };
        if (turnM) o = { headR: Math.sin(t * 3) * 0.3, wide: true }; if (win(t, E.mtAval + 0.6, E.mtRun)) o = { wide: true, baa: true };
        poseGoat31(goat31, t, dA.p, turnM ? PI : dA.walk ? dA.yaw : faceTo(DA, HA), o); }
      else if (!bury) { const zz = wz(t) - 1.5; poseGoat31(goat31, t, [5, wy(t) + 11.2 + Math.sin(t * 6) * 0.3, zz], 0, { happy: true, roll: Math.sin(t * 4) * 0.15, tuck: true }); }
      else if (t >= E.mtPop + 3.6) { const p = t < E.mtPop + 4.6 ? arcPath(t, [[E.mtPop + 3.6, -9, 3.0, 2, 0], [E.mtPop + 4.6, 1.5, 3.5, 4.5, 2.5]]) : [1.5, 3.5, 4.5]; poseGoat31(goat31, t, p, 0.2, { chew: t > E.mtPop + 7, baa: win(t, E.mtPop + 5.6, E.mtPop + 6.4), headR: win(t, E.mtPop + 5.6, E.mtPop + 6.4) ? Math.sin(t * 20) * 0.3 : 0 }); bellOnGoat31(); bell31.rotation.z = win(t, E.mtPop + 5.6, E.mtPop + 6.6) ? Math.sin(t * 18) * 0.5 : 0; }
      else goat31.root.visible = false;
      const CC = [[E.mtBase, 0, 4, 14, 0, 2, -14, 52], [E.mtBase + 3.9, 0, 3.2, 10, 0, 2, -6, 48],
        [E.mtBase + 4, 4, 2.4, 6.5, 0, 1.3, -1, 46], [E.mtInvoice - 0.1, 3.6, 2.3, 6, 0, 1.3, -1, 42],
        [E.mtInvoice, 4.8, 2.2, 4.4, -1.5, 1.4, -0.2, 40], [E.mtRingB - 0.1, 4.4, 2.1, 4.0, -1.5, 1.4, -0.2, 34],
        [E.mtRingB, -0.6, 0.9, 4.0, -1.5, 2.6, -0.4, 46], [E.mtRumble - 0.1, -0.3, 0.8, 3.7, -1.5, 2.8, -0.4, 42],
        [E.mtRumble, 0, 3, 10, 0, 30, -90, 50], [E.mtAval - 0.1, 0, 2.6, 9, 0, 40, -90, 44],
        [E.mtAval, 6, 2.2, 9, 0, 20, -60, 55], [E.mtRun - 0.1, 5, 1.8, 8, 0, 14, -50, 58],
        [E.mtBury, 0, 6, 22, 0, 2, 0, 52], [E.mtPop - 0.1, 0, 5, 18, 0, 2, 0, 50],
        [E.mtPop, 0, 4.0, 15, 0.5, 2.8, 6, 46], [E.freeze, 0, 3.8, 13.6, 0.5, 3.0, 6.2, 40]];
      cam = camKeys(t, CC);
      if (win(t, E.mtRun, E.mtBury)) { const hz = rz(-0.4); cam = { p: [2.4, 2.6, hz + 8.5], l: [0.6, 3.0, hz - 8], fov: 58 }; }
    }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the cliff (the climb: overcast → cloud layer → golden; the descent: dawn)
const SK31 = [[E.mtCliff, 0], [E.mtGust, 6.5], [E.mtGust + 4.5, 6.5], [E.mtGoat, 8], [E.mtGoat + 4, 8.5], [E.mtSnap1, 11.5], [E.mtLook, 11.5], [E.mtLook + 1.5, 13], [E.mtCloud, 13], [E.mtAbove, 20], [E.mtSummit, 28]];
const DK31 = [[E.mtDescend, 36], [E.mtSlip, 26.5], [E.mtSlip + 0.5, 23.5], [E.mtSlip + 1.8, 23.5], [E.mtCloud2, 21.5], [E.mtCloud2 + 5, 15], [E.mtBase - 0.4, 0.6]];
const cliff31 = (() => {
  const g = mk('cliff31'); const st = new VSet(g);
  for (let x = -36; x <= 24; x++) for (let y = -1; y <= 38; y++) { const top = y > 26; st.add(x, y, -1, top && hash2(x, y, 3) < 0.4 ? 'snow' : 'stone'); if (hash2(x, y, 31) > 0.16) st.add(x, y, 0, top && hash2(x, y, 5) < 0.3 ? 'snow' : (hash2(x, y, 7) < 0.08 ? 'dark' : 'stone')); }
  for (let x = -36; x <= 24; x++) { st.add(x, 39, 0, 'snow'); st.add(x, 39, -1, 'snow'); }
  for (let L = 0; L <= 36; L += 4) { st.add(-30 + L, L + 5, 1, 'stone'); st.add(-30 + L, L + 5.0 + 1, 1, 'snow'); }
  for (let y = 2; y <= 34; y += 4) st.add(14, y, 1, 'stone');
  for (let x = -36; x <= 24; x++) for (let z = 1; z <= 16; z++) st.add(x, -1, z, 'turf');
  for (const [x, z, h] of [[-12, 14, 6], [0, 15, 5], [10, 15, 6], [20, 13, 5]]) tree29(st, x, z, h, -1);
  st.build();
  const clouds = new THREE.Group(); g.add(clouds); const r = rng(311);
  for (let i = 0; i < 70; i++) { const c = box(8 + r() * 14, 1.6 + r() * 2, 6 + r() * 10, 0, -60 + r() * 100, 17 + r() * 6, 2.5 + r() * 50, clouds, cloudM31); c.castShadow = false; }
  const sea = box(400, 1, 300, 0, 0, 19.5, 100, clouds, cloudM31); sea.castShadow = false;
  const birds = [makeBird('#f4f4f4'), makeBird('#e0e4ea')]; birds.forEach(b => g.add(b.root));
  const ST = stairPool31(g, 40);
  const SP = s => [-30 + s, s + 0.5, 1];
  // ---- particles
  for (let i = 0; i < 6; i++) snowP31(E.mtGust + 0.3 + i * 0.6, SP(6.5 + (i % 3)).map((v, j) => v + [0, 1.5, 1][j]), 30, 5);
  burst(E.mtSnap1 + 2.5, [-20.6, 11, 3.5], { n: 30, colors: ['#ffffff', '#fff6c0'], speed: 3, size: 0.12, life: 0.4, grav: 0, up: 0 });
  snowP31(E.mtSlip, [10, 23, 1.5], 50, 3); snowP31(E.mtSlip + 0.3, [10, 22, 1.5], 40, 3);
  function update(t) {
    hideMisc(); hide31(); reset31(g);
    birds.forEach((b, i) => { const a = t * 0.3 + i * 3; b.root.position.set(-8 + Math.cos(a) * 22, 26 + i * 3, 12 + Math.sin(a) * 6); b.root.rotation.set(0, -a, 0.25); b.wL.rotation.z = Math.sin(t * 8 + i) * 0.5; b.wR.rotation.z = -Math.sin(t * 8 + i) * 0.5; });
    ST.forEach(m => m.visible = false);
    let cam;
    if (t < E.mtSummit) {
      const sH = lerpK(SK31, t), mv = lerpK(SK31, t + 0.05) - lerpK(SK31, t - 0.05) > 0.004, snap = win(t, E.mtSnap1 - 0.5, E.mtLook + 0.5);
      const sB = sH - (snap ? 2.9 : 2.2), sL = sH - 5.6;
      for (let i = 0; i < 40; i++) { const k = Math.min(seg(sH + 2.4 - i, 0, 0.4), seg(i - (sL - 3.2), 0, 0.6)); if (k > 0) showStair31(ST[i], [-30 + i, i, 1], k); }
      // me
      const HP = SP(sH); let ho = { face: 'smug', yaw: PI / 2, walk: mv ? 1 : 0, phase: sH * 3 };
      if (win(t, E.mtGust, E.mtGust + 4.5)) ho = { face: 'scared', yaw: PI / 2, lean: -0.25 + Math.sin(t * 9) * 0.08, panic: t < E.mtGust + 2.5 };
      if (win(t, E.mtGoat, E.mtSnap1)) ho = { face: t < E.mtGoat + 2 ? 'scared' : 'normal', yaw: PI / 2 - 0.4, headPitch: -0.5, walk: mv ? 1 : 0, phase: sH * 3 };
      if (win(t, E.mtSnap1, E.mtLook)) ho = { face: 'normal', yaw: -0.3 };
      if (win(t, E.mtLook + 1.5, E.mtCloud)) ho = { face: t < E.mtLook + 4 ? 'normal' : 'smug', yaw: 0.4, headPitch: 0.45 };
      pose(hero, { t, p: HP, ...ho });
      // Bloop (selfie #1)
      const BP = SP(sB); let bo = { yaw: PI / 2, hop: mv }; if (win(t, E.mtGust, E.mtGust + 4.5)) bo = { yaw: PI / 2, angry: true };
      if (win(t, E.mtSnap1, E.mtSnap1 + 5.5)) { bo = { yaw: 0, handOut: true, hop: t < E.mtSnap1 + 1.5 }; bcam31.visible = true; if (t > E.mtSnap1 + 3.2) bo = { yaw: 0, angry: true }; }
      poseBurble(bloop6, t, BP, bo.yaw, bo); if (win(t, E.mtGust + 0.4, E.mtGust + 3.4)) { const k = seg(t, E.mtGust + 0.4, E.mtGust + 3.4); bHat.position.y = 1.2 + Math.sin(k * PI) * 2.2; bHat.rotation.y = k * 12; bHat.position.x = Math.sin(k * PI) * -1.2; }
      if (win(t, E.mtSnap1 + 1.1, E.mtSnap1 + 5.5)) bloop6.B.aR.rotation.set(-2.2, 0, 0.3);
      // Leggy (eyes mostly closed. hugging stairs.)
      const LP = SP(sL); poseLurk(L6, t, [LP[0], LP[1] - 0.25, 1.0], PI / 2, mv ? 1.5 : 0.3); L6.root.rotation.x = -0.55; L6.root.position.y += Math.sin(t * 45) * 0.025;
      if (win(t, E.mtGust, E.mtGust + 4.5)) { L6.body.position.y = 0.8; L6.root.rotation.x = -0.3; }
      if (win(t, E.mtCloud, E.mtAbove + 1)) L6.light.intensity = 5;
      // Dingus: lives here. doesn't need stairs.
      const ledge = L => [-30 + L, L + 6.5, 1];
      if (t >= E.mtGoat - 0.5) { let p, o = { chew: true }, yaw = 0.2;
        if (t < E.mtSnap1 + 1.6) p = ledge(12);
        else if (t < E.mtSnap1 + 2.3) { p = arcPath(t, [[E.mtSnap1 + 1.6, ...ledge(12), 0], [E.mtSnap1 + 2.3, -20, 10.5, 1, 1]]); o = { tuck: true }; }
        else if (t < E.mtSnap1 + 4.6) { p = [-20, 10.5, 1]; o = { wide: true, headX: 0.2, baa: win(t, E.mtSnap1 + 2.3, E.mtSnap1 + 2.8) }; yaw = 0.1; }
        else if (t < E.mtSnap1 + 5.4) { p = arcPath(t, [[E.mtSnap1 + 4.6, -20, 10.5, 1, 0], [E.mtSnap1 + 5.4, ...ledge(12), 1.5]]); o = { tuck: true }; }
        else if (t < E.mtLook + 1.5) p = ledge(12);
        else { const q = (sH + 4) / 4, L = 4 * Math.floor(q), f = q - Math.floor(q); p = f < 0.8 ? ledge(L) : arcPath(f, [[0.8, ...ledge(L), 0], [1.0, ...ledge(L + 4), 1.2]]); o = f < 0.8 ? { chew: true } : { tuck: true }; if (L > 36) p = ledge(36); }
        if (win(t, E.mtCloud, E.mtAbove)) o.baa = win(t, E.mtCloud + 3.5, E.mtCloud + 4.2);
        poseGoat31(goat31, t, p, yaw, o); }
      const shots = [[E.mtCliff, E.mtGust, [4, 5, 18], [4, 3, 14], [-2, 3, 0], 56, 52], [E.mtGust, E.mtGoat, [3.2, 2.0, 6.0], [2.6, 1.8, 5.2], [-1.8, 1.0, 0], 46, 42],
        [E.mtGoat, E.mtGoat + 4, [-1.5, -1.0, 8], [-1, -0.8, 7.2], [2.5, 6, 0], 55, 52], [E.mtGoat + 4, E.mtSnap1, [5, 3, 9], [4, 4, 8], [1.5, 4.5, 0], 54, 52],
        [E.mtSnap1, E.mtSnap1 + 1.1, [0.5, 1.6, 7], [0.3, 1.6, 6.6], [-2.4, 1.2, 0], 46, 44], [E.mtSnap1 + 4.4, E.mtLook, [2.5, 2.2, 6.5], [2.2, 2.0, 6.0], [-1.8, 1.2, 0], 50, 48],
        [E.mtLook, E.mtLook + 3, [1.6, 1.9, 3.8], [1.4, 1.9, 3.5], [0, 1.6, 0], 42, 40], [E.mtLook + 3, E.mtCloud, [1.6, 2.4, 3.4], [1.5, 2.4, 3.2], [-8, -10, 0.5], 58, 58],
        [E.mtCloud, E.mtAbove, [2.2, 1.6, 4.0], [1.2, 1.8, 3.6], [-1.5, 1.2, 0], 50, 50], [E.mtAbove, E.mtSummit, [6, -2, 12], [9, 9, 16], [-2, 1, 0], 54, 60]];
      const sh = shots.find(s => t >= s[0] && t < s[1]);
      if (sh) { const u = ss(seg(t, sh[0], sh[1])), o = lp31(sh[2], sh[3], u); cam = { p: [HP[0] + o[0], HP[1] + o[1], HP[2] + o[2]], l: [HP[0] + sh[4][0], HP[1] + sh[4][1], HP[2] + sh[4][2]], fov: lerp(sh[5], sh[6], u) }; }
      else cam = { p: [-20.4, 11.4, 6.6], l: [-20.5, 11.2, 1], fov: 50 };
    } else {
      // ---- the descent: Leggy climbs down the wall. hero + Bloop on her back. Dingus hops along in my... Bloop's hard hat.
      const Ly = lerpK(DK31, t), slip = win(t, E.mtSlip, E.mtSlip + 1.8), LP = [10, Ly, 0.65];
      poseLurk(L6, t, LP, 0, slip ? 4 : 2.2); L6.root.rotation.set(PI / 2, 0, slip ? Math.sin(t * 30) * 0.08 : 0); L6.light.intensity = 3;
      pose(hero, { t, p: [9.4, Ly - 0.5, 2.9], yaw: 0, face: slip ? 'scared' : t > E.mtCloud2 + 5 ? 'smug' : 'normal', panic: slip, wave: win(t, E.mtDescend + 6, E.mtDescend + 8) });
      bellInHand31(t, 0.1); if (slip) bell31.visible = false;
      poseBurble(bloop6, t, [10.7, Ly + 0.6, 2.9], 0, slip ? { angry: true } : { hop: t > E.mtCloud2 + 5 }); bHat.visible = false;
      hatOnGoat31(); const gy = Ly + 1.8 + Math.abs(Math.sin(t * 2.4)) * 1.2; poseGoat31(goat31, t, [14.6, gy, 1.4], 0.3, { tuck: Math.abs(Math.sin(t * 2.4)) > 0.2, chew: true });
      const shots = [[E.mtDescend, E.mtDescend + 4, [10, 6, 22], [8, 4, 18], [0, -1, 0], 55, 52], [E.mtDescend + 4, E.mtSlip, [4.5, 1.0, 7.5], [4.0, 0.5, 7.0], [0, -0.5, 1.6], 46, 44],
        [E.mtSlip, E.mtSlip + 2.4, [-2.6, -1.5, 6], [-2.4, -1.5, 5.6], [0, -0.8, 1.8], 44, 42], [E.mtSlip + 2.4, E.mtCloud2, [0.5, 7, 6], [0.5, 6.5, 6], [0, -6, 1], 55, 55],
        [E.mtCloud2, E.mtCloud2 + 5, [-3, 0.5, 5.5], [-2.6, 0.8, 5.2], [0, -0.5, 1.6], 48, 46]];
      const sh = shots.find(s => t >= s[0] && t < s[1]);
      if (sh) { const u = ss(seg(t, sh[0], sh[1])), o = lp31(sh[2], sh[3], u); cam = { p: [LP[0] + o[0], LP[1] + o[1], LP[2] + o[2]], l: [LP[0] + sh[4][0], LP[1] + sh[4][1], LP[2] + sh[4][2]], fov: lerp(sh[5], sh[6], u) }; }
      else cam = { p: [-2, 0.8, 7], l: [10, Ly - 1, 1.5], fov: 52 };
    }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the summit (golden sunset → night → dawn), above a sea of clouds
const summit31 = (() => {
  const g = mk('summit31'); const st = new VSet(g);
  const inP = (x, z) => x * x / 196 + z * z / 144 < 1.1;
  for (let x = -14; x <= 14; x++) for (let z = -13; z <= 13; z++) if (inP(x, z)) { st.add(x, 0, z, 'snow'); for (let y = -1; y >= -13; y--) { const edge = !inP(x + 1, z) || !inP(x - 1, z) || !inP(x, z + 1) || !inP(x, z - 1); if (edge || y === -1) st.add(x, y, z, hash2(x * 7 + y, z, 31) < 0.15 ? 'dark' : 'stone'); } }
  for (const [x, z] of [[-6, -10.5], [-7, -10], [-5, -10], [-6, -9.5]]) { st.add(Math.round(x), 1, Math.round(z), 'snow'); }
  st.build();
  const sea = new THREE.Group(); g.add(sea); { const m = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#d8e4f0', emissiveIntensity: 0.3 }); const s = box(600, 1, 600, 0, 0, -14, 0, sea, m); s.castShadow = false; const r = rng(77);
    for (let i = 0; i < 60; i++) { const a = r() * 6.28, d = 22 + r() * 140, c = box(8 + r() * 16, 1.5 + r() * 2.5, 6 + r() * 12, 0, Math.cos(a) * d, -13 + r() * 1.2, Math.sin(a) * d, sea, m); c.castShadow = false; }
    for (const [x, z, s2] of [[-70, -110, 1], [90, -60, 0.8], [120, 70, 1.1], [-110, 60, 0.7], [20, 140, 0.9]]) for (let k = 0; k < 5; k++) { const w = (30 - 5 * k) * s2; box(w, 5, w, k >= 3 ? '#f2f8ff' : '#7a7c8a', x, -13 + 2.5 + 5 * k, z, sea).castShadow = false; } }
  // bell frame, sign, drift, rock, fire
  for (const sd of [-1, 1]) box(0.8, 4.2, 0.8, '#8a8c98', sd * 1.8, 2.6, -6, g); box(4.6, 0.6, 0.9, '#7a7c88', 0, 4.9, -6, g); box(0.12, 0.4, 0.12, '#5a4010', 0, 4.4, -6, g);
  board28(['SUMMIT BELL', 'ring for LEGEND'], 3.0, 1.1, g, 4.4, 1.4, -6.4, -0.2, '#f6e7c1', '#5a2a10', 512, 192, 50);
  const drift = pivot(g, -6, 0.5, -10.4); box(3.4, 1.6, 2.6, 0, 0, 0.8, 0, drift, snowM31); box(2.2, 2.2, 2.0, 0, 0.4, 1.0, 0.3, drift, snowM31);
  box(1.2, 1.0, 1.2, '#7a7c88', 6.4, 1.0, 9.6, g); box(1.6, 0.6, 1.4, '#8a8c98', -9, 0.8, 6, g);
  const fire = pivot(g, 0.5, 0.5, 1.0); box(1.0, 0.2, 0.25, '#6a4a2a', 0, 0.1, 0, fire); box(0.25, 0.2, 1.0, '#6a4a2a', 0, 0.1, 0, fire); const flame = box(0.4, 0.5, 0.4, 0, 0, 0.45, 0, fire, glow31('#ff9a2a', 1));
  const fireL = new THREE.PointLight('#ff9a40', 0, 12, 1.4); fireL.position.set(0, 1.2, 0); fire.add(fireL);
  const ST = stairPool31(g, 5), PB = stairPool31(g, 10);
  const HOOK = [0, 4.2, -6], BELLD = [4.4, 1.05, 8.9];
  // ---- particles
  snowP31(E.mtBonkH + 1.4, [-6, 1.8, -10.4], 70, 4); snowP31(E.mtTripod + 2.5, [-6, 1.8, -10.4], 50, 3);
  burst(E.mtTrade + 5.8, [6.0, 1.6, 9.4], { n: 30, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.12, life: 0.6, grav: 4, up: 2 });
  burst(E.mtRing + 6.2, [0, 4, -6], { n: 90, colors: ['#ffe066', '#ffffff', '#ffc83a'], speed: 6, size: 0.15, life: 1.6, grav: 1, up: 2 });
  burst(E.mtSelfie + 3.5, [0.4, 2, 0.5], { n: 30, colors: ['#ffffff', '#fff6c0'], speed: 3, size: 0.12, life: 0.4, grav: 0, up: 0 });
  smoke(E.mtNight, E.mtCarry, 0.25, [0.5, 1.4, 1.0], { n: 2, colors: ['#ffb040', '#ff7020', '#ffe080'], speed: 0.4, size: 0.1, life: 0.9, grav: -2, up: 0.8 });
  for (let j = 0; j < 10; j++) poof31(E.mtPlanB + 0.6 + j * 0.3, [-14, -1 - j, 4 - j]);
  for (let i = 0; i < 6; i++) poof31(E.mtSummit + 3.2 + i * 0.5, [14 + (i % 5), -1 - (i % 5), 0]);
  function update(t) {
    hideMisc(); hide31(); reset31(g);
    ST.forEach(m => m.visible = false); PB.forEach(m => m.visible = false);
    flame.visible = t > E.mtNight + 1; flame.scale.set(1, 1 + Math.sin(t * 13) * 0.25, 1); fireL.intensity = t > E.mtNight + 1 ? 5 + Math.sin(t * 17) * 1.2 : 0;
    for (let j = 1; j <= 5; j++) { const k = 1 - seg(t, E.mtSummit + 3.0 + (5 - j) * 0.5, E.mtSummit + 3.4 + (5 - j) * 0.5); if (t < E.mtFrame) showStair31(ST[j - 1], [13 + j, -j, 0], k); }
    // ---- Plan B stairs (west wall): 10 down, then eco mode eats them
    const jh = lerp(0, 10, seg(t, E.mtPlanB + 1.6, E.mtPlanB + 6));
    if (win(t, E.mtPlanB, E.mtLeggy + 6)) for (let j = 1; j <= 10; j++) { const a = seg(t, E.mtPlanB + 0.6 + (j - 1) * 0.3, E.mtPlanB + 0.9 + (j - 1) * 0.3), r = j < 10 ? 1 - seg(jh, j + 1.4, j + 1.8) : 1 - seg(t, E.mtLeggy + 5, E.mtLeggy + 5.4); showStair31(PB[j - 1], [-14, -j, 5 - j], Math.min(a, r)); }
    // ---- Leggy pose helper for the walls
    const wallW = (y, k) => { poseLurk(L6, t, [lerp(-12, -13.65, k), y, -5], -PI / 2, 2.2); L6.root.rotation.set(PI / 2 * k, -PI / 2, 0); };
    const wallE = (y, k) => { poseLurk(L6, t, [lerp(11.6, 13.65, k), y, 0], PI / 2, 2.2); L6.root.rotation.set(PI / 2 * k, PI / 2, 0); };
    const HW = [-12, 0.5, 5], HB = [-14, -9.5, -5];
    // =========== me
    const D_A = [-5, 0.5, -3], CEN = [0, 0.5, -5], R = 4.5, a0 = Math.atan2(-5, 2), w = (2 * PI + 0.29) / 8, ad = tt => a0 + w * (tt - E.mtChase), cpos = a => [CEN[0] + R * Math.sin(a), 0.5, CEN[2] + R * Math.cos(a)];
    const DB = cpos(ad(E.mtBonkH)), HBk = cpos(ad(E.mtBonkH) - 1.0), DRIFT = [-6, 2.6, -10.4];
    const Lnight = [-3.2, 0.5, -1.6];
    if (t < E.mtChase) { const hA = act31(t, [[E.mtSummit, 16, -2.5, 0], [E.mtSummit + 2.4, 12.5, 0.5, 0], [E.mtSummit + 5, 5, 0.5, 1], [E.mtFrame, 5, 0.5, 1], [E.mtFrame + 2.5, 0.3, 0.5, -3.4]],
        [[0, { face: 'smug' }], [E.mtSummit + 5, { face: 'smug', yaw: -0.6, wave: t < E.mtSummit + 7 }], [E.mtFrame + 2.5, { face: 'normal', yaw: PI, headPitch: -0.45 }], [E.mtFrame + 4, { face: 'scared', yaw: 0.3 }],
         [E.mtDing + 0.5, { face: 'normal', yaw: faceTo([0.3, 0, -3.4], D_A) }], [E.mtDing + 4, { face: 'smug', yaw: faceTo([0.3, 0, -3.4], D_A) }]]);
      pose(hero, { t, ...hA }); }
    else if (t < E.mtBonkH + 0.4) { const k = seg(t, E.mtChase, E.mtChase + 1), a = ad(Math.min(t, E.mtBonkH)) - 1.0, cp = cpos(a); pose(hero, { t, p: lp31([0.3, 0.5, -3.4], cp, k), yaw: Math.atan2(Math.cos(a), -Math.sin(a)), face: 'smug', walk: t < E.mtBonkH ? 1.2 : 0, phase: t * 13 }); }
    else if (t < E.mtBonkH + 2) { const k = seg(t, E.mtBonkH + 0.4, E.mtBonkH + 2); pose(hero, { t, p: arcPath(t, [[E.mtBonkH + 0.4, ...HBk, 0], [E.mtBonkH + 2, ...DRIFT, 3]]), yaw: faceTo(HBk, DB), face: 'scared', panic: true }); hero.root.rotation.x = -k * PI; }
    else if (t < E.mtTripod + 2.5) { pose(hero, { t, p: [-6, 3.3, -10.4], yaw: 0, face: 'scared' }); hero.root.rotation.set(0, 0, PI); hero.lL.rotation.x = Math.sin(t * 12) * 0.7; hero.lR.rotation.x = -Math.sin(t * 12) * 0.7; }
    else if (t < E.mtTripod + 3.5) pose(hero, { t, p: arcPath(t, [[E.mtTripod + 2.5, -6, 2.0, -10.4, 0], [E.mtTripod + 3.5, -3.2, 0.5, -8.6, 1.5]]), yaw: 0.5, face: 'scared' });
    else if (t < E.mtNight) { const hA = act31(t, [[E.mtTripod + 3.5, -3.2, 0.5, -8.6], [E.mtTrade, -3.2, 0.5, -8.6], [E.mtTrade + 3, 2.0, 0.5, 6.0], [E.mtRing, 2.0, 0.5, 6.0], [E.mtRing + 1.5, 3.6, 0.5, 7.6], [E.mtRing + 2, 3.6, 0.5, 7.6], [E.mtRing + 4.5, 0, 0.5, -4.4],
          [E.mtSelfie, 0, 0.5, -4.4], [E.mtSelfie + 2, -0.8, 0.5, -3.3], [E.mtDown, -0.8, 0.5, -3.3], [E.mtDown + 3, 11.8, 0.5, 0.3]],
        [[0, { face: 'normal', headRoll: t < E.mtTrade ? Math.sin(t * 3) * 0.3 : 0, yaw: 0.6 }], [E.mtTrade + 3, { face: 'normal', yaw: faceTo([2, 0, 6], [3.3, 0, 8.4]) }], [E.mtTrade + 6, { face: 'smug', yaw: faceTo([2, 0, 6], [4.2, 0, 8.4]) }],
         [E.mtRing + 4.5, { face: 'smug', yaw: PI, headPitch: -0.5 }], [E.mtRing + 6, { face: 'smug', yaw: PI, headPitch: -0.5 }], [E.mtSelfie + 2, { face: 'smug', yaw: 0.1, wave: win(t, E.mtSelfie + 2.6, E.mtSelfie + 3.5) }],
         [E.mtDown + 3, { face: 'normal', yaw: PI / 2, headPitch: 0.5 }], [E.mtDown + 3.6, { face: 'scared', yaw: PI / 2, headPitch: 0.5 }], [E.mtDown + 4.6, { face: 'scared', yaw: PI / 2, panic: true }],
         [E.mtEcoRev, { face: 'normal', yaw: PI / 2, headYaw: -1.0, headPitch: 0.3 }], [E.mtEcoRev + 3, { face: 'scared', yaw: faceTo([11.8, 0, 0.3], [11, 0, 1.6]) }]]);
      pose(hero, { t, ...hA });
      if (win(t, E.mtRing + 2, E.mtRing + 4.5)) bellInHand31(t, 0.1);
      if (win(t, E.mtRing + 4.5, E.mtRing + 5.6)) { hero.aR.rotation.set(-2.9, 0, 0); hero.aL.rotation.set(-2.9, 0, 0); bellInHand31(t, 0); bell31.position.set(...lp31(wpos31(handR31), HOOK, seg(t, E.mtRing + 5.0, E.mtRing + 5.6))); }
      if (win(t, E.mtRing + 5.6, E.mtRing + 6.4)) hero.aR.rotation.set(-2.6 + Math.sin(seg(t, E.mtRing + 5.6, E.mtRing + 6.4) * PI) * -0.4, 0, 0);
      if (win(t, E.mtRing + 6.4, E.mtSelfie)) { hero.aR.rotation.set(-2.9, 0, 0.3); hero.aL.rotation.set(-2.9, 0, -0.3); } }
    else if (t < E.mtPlanA) pose(hero, { t, p: [-0.8, 0.5, 3.4], yaw: faceTo([-0.8, 0, 3.4], [0.5, 0, 1.0]), face: 'scared', sit: 1, headRoll: Math.sin(t * 40) * 0.05 });
    else if (t < E.mtPlanB) { const hA = act31(t, [[E.mtPlanA, -0.8, 0.5, 3.4], [E.mtPlanA + 2, 0, 0.5, 10.4], [E.mtPlanA + 3.2, 0, 0.5, 10.4], [E.mtPlanA + 3.6, 0, 0.5, 9.6]],
          [[0, { face: 'smug', yaw: 0 }], [E.mtPlanA + 2.2, { face: 'smug', yaw: 0, lean: 0.35 }], [E.mtPlanA + 3.2, { face: 'scared', yaw: 0 }], [E.mtPlanA + 4.4, { face: 'normal', yaw: 0, headPitch: 0.5 }], [E.mtPlanA + 8.6, { face: 'scared', yaw: 0, headPitch: 0.3 }]], 0);
      pose(hero, { t, ...hA }); }
    else if (t < E.mtLeggy + 4.5) { let p, o;
      if (jh < 1) p = lp31(HW, [-14, -0.5, 4], jh); else p = [-14, 0.5 - jh, 5 - jh];
      o = { face: 'smug', yaw: jh < 1 ? faceTo(HW, [-14, 0, 4]) : PI, walk: jh > 0 && jh < 10 ? 1 : 0, phase: jh * 3 };
      if (t > E.mtPlanB + 6.5) o = { face: 'scared', yaw: 0, headPitch: -0.4 }; if (win(t, E.mtPlanB + 7.2, E.mtLeggy + 2.5)) o = { face: 'scared', yaw: 0, panic: true };
      const Ly = t < E.mtLeggy + 4.5 ? lerpK([[E.mtLeggy + 2.5, -0.6], [E.mtLeggy + 4.5, -5.5]], t) : -5.5;
      if (t > E.mtLeggy + 4.5) p = [-15.8, Ly - 0.6, -5];
      pose(hero, { t, p, ...o }); }
    else if (t < E.mtCarry) { const Ly = lerpK([[E.mtLeggy + 5.2, -5.5], [E.mtLeggy + 7, -0.6]], t);
      if (t < E.mtLeggy + 7) pose(hero, { t, p: t < E.mtLeggy + 5.2 ? arcPath(t, [[E.mtLeggy + 4.5, ...HB, 0], [E.mtLeggy + 5.2, -15.8, -6.1, -5, 0.6]]) : [-15.8, Ly - 0.6, -5], yaw: -PI / 2, face: t < E.mtLeggy + 5.2 ? 'scared' : 'smug', wave: t > E.mtLeggy + 5.6 });
      else pose(hero, { t, p: arcPath(t, [[E.mtLeggy + 7, -15.8, -1.2, -5, 0], [E.mtLeggy + 7.8, -9.5, 0.5, -3.5, 1.5]]), yaw: PI / 2, face: 'smug', wave: t > E.mtLeggy + 7.8 }); }
    else { const k = seg(t, E.mtCarry + 2, E.mtCarry + 3); if (t < E.mtCarry + 2) pose(hero, { t, p: [10.4, 0.5, 1.6], yaw: PI / 2, face: 'normal' }); else pose(hero, { t, p: t < E.mtCarry + 3 ? arcPath(t, [[E.mtCarry + 2, 10.4, 0.5, 1.6, 0], [E.mtCarry + 3, 15.8, -1.2, -0.6, 1.5]]) : [15.8, lerpK([[E.mtCarry + 4.5, -0.6], [E.mtDescend, -3]], t) - 0.6, -0.6], yaw: PI / 2, face: k < 1 ? 'scared' : 'smug' }); }
    if (t >= E.mtCarry) bellInHand31(t, 0.05);
    // =========== Bloop
    const BT = [3.0, 0.5, 3.6], BTR = [2.4, 0.5, 8.4];
    if (t < E.mtNight) { const bA = act31(t, [[E.mtSummit + 1.2, 16, -2.5, 0], [E.mtSummit + 3.6, 12.5, 0.5, 0], [E.mtSummit + 6.2, 7, 0.5, 2.6], [E.mtFrame + 1, 7, 0.5, 2.6], [E.mtFrame + 3.5, 4.4, 0.5, -0.4], [E.mtChase, 4.4, 0.5, -0.4], [E.mtChase + 1.2, 5, 0.5, 2.5],
          [E.mtTripod, 5, 0.5, 2.5], [E.mtTripod + 1, 4.5, 0.5, 6.6], [E.mtTripod + 1.4, 4.5, 0.5, 6.6], [E.mtTripod + 2.6, ...BT], [E.mtTrade, ...BT], [E.mtTrade + 1.5, ...BTR], [E.mtRing, ...BTR], [E.mtRing + 3, 3.6, 0.5, -0.6],
          [E.mtSelfie, 3.6, 0.5, -0.6], [E.mtSelfie + 1.8, 0.6, 0.5, -1.9], [E.mtDown, 0.6, 0.5, -1.9], [E.mtDown + 3.3, 11, 0.5, 1.6]],
        [[0, {}], [E.mtSummit + 6.2, { yaw: -0.8, hop: true }], [E.mtFrame + 3.5, { yaw: faceTo([4.4, 0, -0.4], [0.3, 0, -3.4]) }], [E.mtDing + 0.4, { yaw: faceTo([4.4, 0, -0.4], D_A), hop: true }], [E.mtDing + 2, { yaw: faceTo([4.4, 0, -0.4], D_A) }],
         [E.mtChase + 1.2, { yaw: faceTo([5, 0, 2.5], CEN) }], [E.mtChase + 5, { yaw: faceTo([5, 0, 2.5], CEN), facepalm: true }], [E.mtTripod + 2.6, { yaw: PI, hop: true, handOut: true }], [E.mtTripod + 4.4, { yaw: PI - 0.4, angry: true }],
         [E.mtTrade + 1.5, { yaw: PI / 2 }], [E.mtTrade + 2.4, { yaw: PI / 2, facepalm: true }], [E.mtTrade + 3.6, { yaw: PI / 2, handOut: true }], [E.mtTrade + 6, { yaw: PI / 2, hop: true }], [E.mtRing + 3, { yaw: faceTo([3.6, 0, -0.6], HOOK) }], [E.mtRing + 6.2, { yaw: faceTo([3.6, 0, -0.6], HOOK), hop: true }],
         [E.mtSelfie + 1.8, { yaw: 0, handOut: true }], [E.mtSelfie + 4, { yaw: 0, hop: true, handOut: true }], [E.mtDown, {}], [E.mtDown + 3.3, { yaw: PI / 2 }], [E.mtEcoRev + 1.6, { yaw: faceTo([11, 0, 1.6], [11.8, 0, 0.3]), facepalm: true }], [E.mtEcoRev + 3.4, { yaw: faceTo([11, 0, 1.6], [11.8, 0, 0.3]), angry: true }]]);
      poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA });
      if (win(t, E.mtSelfie + 1.8, E.mtSelfie + 6)) { bcam31.visible = true; bloop6.B.aR.rotation.set(-2.0, 0, 0.2); }
      if (win(t, E.mtTrade + 2.4, E.mtTrade + 3.4)) { bHat.position.y = 1.2 + seg(t, E.mtTrade + 2.4, E.mtTrade + 3.0) * 0.5; bloop6.B.aL.rotation.set(-2.8, 0, 0); bloop6.B.aR.rotation.set(-2.8, 0, 0); }
      if (t >= E.mtTrade + 3.4) { if (t < E.mtTrade + 4.4) { parentTo(bHat, g); const from = wpos31(bloop6.B.hd), to = wpos31(goat31.hatSlot); from[1] += 1.7; bHat.position.set(...arcPath(t, [[E.mtTrade + 3.4, ...from, 0], [E.mtTrade + 4.4, ...to, 1.2]])); bHat.rotation.set(0, t * 6, 0); } }
      if (win(t, E.mtTripod + 1.4, E.mtTripod + 5.6)) { tripod31.visible = true; const k = seg(t, E.mtTripod + 4.4, E.mtTripod + 5.6); tripod31.position.set(lerp(4.5, 3.9, k), lerp(0.5, 1.2, k), lerp(7.8, 8.3, k)); tripod31.scale.setScalar(1 - k * 0.95); tripod31.rotation.set(0, 0, k * 1.2); } }
    else if (t < E.mtPlanA) poseBurble(bloop6, t, [2.0, 0.5, 3.0], faceTo([2, 0, 3], [0.5, 0, 1.0]), { seed: 3 });
    else if (t < E.mtPlanB) { const bA = act31(t, [[E.mtPlanA, 2.0, 0.5, 3.0], [E.mtPlanA + 2.6, 0.6, 0.5, 9.2]], [[0, {}], [E.mtPlanA + 2.6, { yaw: faceTo([0.6, 0, 9.2], [0, 0, 10.4]), angry: true }], [E.mtPlanA + 3.8, { yaw: 0, handOut: true }], [E.mtPlanA + 5.2, { yaw: 0 }], [E.mtPlanA + 8.6, { yaw: 0, facepalm: true }]]);
      poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA });
      if (win(t, E.mtPlanA + 4.2, E.mtPlanA + 8.4)) { sball31.visible = true; sball31.position.set(...(t < E.mtPlanA + 4.5 ? [0.9, 1.6, 9.4] : arcPath(t, [[E.mtPlanA + 4.5, 0.9, 1.6, 9.4, 0], [E.mtPlanA + 8.4, 0, -18, 34, 4]]))); sball31.rotation.set(t * 5, t * 3, 0); } }
    else if (t < E.mtCarry) { const P = t < E.mtLeggy + 7 ? [-10.6, 0.5, 6.4] : [-10, 0.5, -2.6]; poseBurble(bloop6, t, P, t < E.mtLeggy + 7 ? faceTo(P, [-14, 0, 0]) : faceTo(P, [-11, 0, -5]), win(t, E.mtPlanB + 6.6, E.mtLeggy) ? { facepalm: true } : t > E.mtLeggy + 7 ? { hop: true } : {}); }
    else { if (t < E.mtCarry + 3) poseBurble(bloop6, t, [10, 0.5, 2.6], PI / 2, {}); else poseBurble(bloop6, t, t < E.mtCarry + 4 ? arcPath(t, [[E.mtCarry + 3, 10, 0.5, 2.6, 0], [E.mtCarry + 4, 15.8, -0.1, 0.7, 1.5]]) : [15.8, lerpK([[E.mtCarry + 4.5, -0.6], [E.mtDescend, -3]], t) + 0.5, 0.7], PI / 2, {}); }
    // =========== Leggy
    if (t < E.mtTripod) { const lA = act31(t, [[E.mtSummit + 2.6, 17.5, -3.5, 0], [E.mtSummit + 4.6, 14.5, -0.5, 0], [E.mtSummit + 5.6, 12.5, 0.5, 0], [E.mtSummit + 8, 9.5, 0.5, 0], [E.mtFrame + 1, 9.5, 0.5, 0], [E.mtFrame + 4, 2.5, 0.5, 3.5]]);
      poseLurk(L6, t, lA.p, lA.walk ? lA.yaw : t > E.mtDing ? faceTo([2.5, 0, 3.5], D_A) : -1.2, lA.walk ? 2 : 0.3); L6.root.position.x += Math.sin(t * 45) * 0.025; if (win(t, E.mtSummit + 2.6, E.mtSummit + 5.6)) L6.root.rotation.x = -0.4; }
    else if (t < E.mtTrade) { const lA = act31(t, [[E.mtTripod, 2.5, 0.5, 3.5], [E.mtTripod + 2.2, -5.4, 0.5, -7.2], [E.mtTripod + 4, -5.4, 0.5, -7.2], [E.mtTrade, -1, 0.5, 3.4]]); poseLurk(L6, t, lA.p, lA.walk ? lA.yaw : faceTo([-5.4, 0, -7.2], [-6, 0, -10.4]), lA.walk ? 2 : 0.6);
      if (win(t, E.mtTripod + 2.2, E.mtTripod + 2.7)) L6.hd.rotation.x = 0.5; }
    else if (t < E.mtNight) { const lA = act31(t, [[E.mtTrade, -1, 0.5, 3.4], [E.mtRing + 3, -1, 0.5, 3.4], [E.mtRing + 5, 2.6, 0.5, 1.0], [E.mtSelfie, 2.6, 0.5, 1.0], [E.mtSelfie + 1.8, 2.0, 0.5, -3.8], [E.mtDown, 2.0, 0.5, -3.8], [E.mtDown + 3, 7.5, 0.5, 0.5]]);
      poseLurk(L6, t, lA.p, lA.walk ? lA.yaw : t < E.mtRing + 3 ? faceTo([-1, 0, 3.4], [3.3, 0, 8.4]) : t < E.mtSelfie ? faceTo([2.6, 0, 1], HOOK) : t < E.mtDown ? 0 : PI / 2, lA.walk ? 2 : 0.4);
      if (win(t, E.mtRing + 6.2, E.mtRing + 9)) L6.root.position.y += Math.abs(Math.sin(t * 7)) * 0.3; if (t > E.mtDown + 4) L6.hd.rotation.set(0.4, 0, 0.3); }
    else if (t < E.mtPlanA) { poseLurk(L6, t, Lnight, faceTo(Lnight, [0.5, 0, 1]), 0.1); L6.body.position.y = 0.75; L6.light.intensity = 3; }
    else if (t < E.mtPlanB) { poseLurk(L6, t, [-2.2, 0.5, 7.2], 0.3, 0.3); L6.light.intensity = 3; }
    else if (t < E.mtLeggy + 1.5) { poseLurk(L6, t, t < E.mtLeggy ? [-9.6, 0.5, -3.2] : lp31([-9.6, 0.5, -3.2], [-12, 0.5, -5], seg(t, E.mtLeggy, E.mtLeggy + 1)), t < E.mtLeggy ? faceTo([-9.6, 0, -3.2], [-14, 0, -5]) : -PI / 2, 0.5); L6.root.position.x += Math.sin(t * 50) * 0.04; L6.light.intensity = 3; }
    else if (t < E.mtLeggy + 2.5) wallW(lerp(0.5, -0.6, seg(t, E.mtLeggy + 1.5, E.mtLeggy + 2.5)), ss(seg(t, E.mtLeggy + 1.5, E.mtLeggy + 2.5)));
    else if (t < E.mtLeggy + 7) wallW(lerpK([[E.mtLeggy + 2.5, -0.6], [E.mtLeggy + 4.5, -5.5], [E.mtLeggy + 5.2, -5.5], [E.mtLeggy + 7, -0.6]], t), 1);
    else if (t < E.mtCarry) { const k = seg(t, E.mtLeggy + 7, E.mtLeggy + 8); if (k < 1) { wallW(lerp(-0.6, 0.5, k), 1 - k); L6.root.position.x = lerp(-13.65, -11, k); } else { poseLurk(L6, t, [-11, 0.5, -5], PI / 2, 0.5); L6.root.position.y += Math.abs(Math.sin(t * 7)) * 0.35; } }
    else if (t < E.mtCarry + 1.5) poseLurk(L6, t, [11.6, 0.5, 0], PI / 2, 0.4);
    else wallE(t < E.mtCarry + 4.5 ? lerp(0.5, -0.6, seg(t, E.mtCarry + 1.5, E.mtCarry + 2.5)) : lerpK([[E.mtCarry + 4.5, -0.6], [E.mtDescend, -3]], t), ss(seg(t, E.mtCarry + 1.5, E.mtCarry + 2.5)));
    // =========== Dingus (the bell is on the goat)
    if (t < E.mtDing) goat31.root.visible = false;
    else { let p, yaw, o = { chew: true }, bell = t < E.mtTrade + 8.5;
      if (t < E.mtChase) { const dA = act31(t, [[E.mtDing, -15.5, -2, -5], [E.mtDing + 1, -11, 0.5, -5], [E.mtDing + 3.5, ...D_A]]); p = t < E.mtDing + 1 ? arcPath(t, [[E.mtDing, -15.5, -2, -5, 0], [E.mtDing + 1, -11, 0.5, -5, 1.5]]) : dA.p; yaw = dA.walk ? dA.yaw : faceTo(D_A, [0.3, 0, -3.4]); o = { walk: dA.walk, chew: !dA.walk, headR: win(t, E.mtDing + 3.6, E.mtDing + 4.4) ? Math.sin(t * 20) * 0.3 : 0 }; }
      else if (t < E.mtBonkH) { const k = seg(t, E.mtChase, E.mtChase + 0.6), a = ad(t); p = lp31(D_A, cpos(a), k); yaw = Math.atan2(Math.cos(a), -Math.sin(a)); o = { walk: 1.2, happy: true }; }
      else if (t < E.mtTripod) { p = DB; const k = seg(t, E.mtBonkH, E.mtBonkH + 0.4); yaw = faceTo(DB, HBk); o = { bonk: win(t, E.mtBonkH + 0.4, E.mtBonkH + 0.9) ? Math.sin(seg(t, E.mtBonkH + 0.4, E.mtBonkH + 0.9) * PI) : 0, chew: t > E.mtBonkH + 1.5 }; if (k < 1) yaw = lerp(Math.atan2(Math.cos(ad(E.mtBonkH)), -Math.sin(ad(E.mtBonkH))), faceTo(DB, HBk), k); }
      else if (t < E.mtTrade) { const dA = act31(t, [[E.mtTripod, ...DB], [E.mtTripod + 0.4, ...DB], [E.mtTripod + 3.8, 3.2, 0.5, 8.7], [E.mtTrade, 3.2, 0.5, 8.7]]); p = dA.p; yaw = dA.walk ? dA.yaw : faceTo([3.2, 0, 8.7], [4.5, 0, 7.8]); o = { walk: dA.walk, chew: t > E.mtTripod + 4.2 }; }
      else if (t < E.mtRing) { const D2 = [4.2, 0.5, 8.4], ROCKT = [6.4, 0, 9.6]; p = lp31([3.2, 0.5, 8.7], D2, seg(t, E.mtTrade, E.mtTrade + 1)); yaw = t < E.mtTrade + 5.2 ? -PI / 2 : faceTo(D2, ROCKT);
        o = { chew: t < E.mtTrade + 3, wide: win(t, E.mtTrade + 3, E.mtTrade + 4.6), bonk: win(t, E.mtTrade + 5.6, E.mtTrade + 6.1) ? Math.sin(seg(t, E.mtTrade + 5.6, E.mtTrade + 6.1) * PI) : 0, happy: win(t, E.mtTrade + 6.5, E.mtTrade + 8.5), baa: win(t, E.mtTrade + 6.6, E.mtTrade + 7.3) }; if (t > E.mtTrade + 6.5) yaw = -PI / 2 + Math.sin(t * 6) * 0.4; }
      else if (t < E.mtNight) { const dA = act31(t, [[E.mtRing, 4.2, 0.5, 8.4], [E.mtRing + 3.5, -3, 0.5, -1.2], [E.mtSelfie, -3, 0.5, -1.2], [E.mtSelfie + 1.5, -2.6, 0.5, -3.0], [E.mtDown, -2.6, 0.5, -3.0], [E.mtDown + 2.5, 6, 0.5, 3.4]]); p = dA.p; yaw = dA.walk ? dA.yaw : t < E.mtSelfie ? faceTo([-3, 0, -1.2], HOOK) : t < E.mtDown ? 0.25 : -0.6; o = { walk: dA.walk, chew: !dA.walk, happy: win(t, E.mtSelfie + 2.5, E.mtSelfie + 3.4) }; }
      else if (t < E.mtPlanA) { p = [2.6, 0.5, -1.6]; yaw = -2.4; o = { lie: true, sleep: true }; }
      else if (t < E.mtPlanB) { p = [-2.8, 0.5, 9.6]; yaw = 0.4; o = { chew: true }; }
      else if (t < E.mtCarry) { p = [-9.2, 0.5, -0.6]; yaw = faceTo(p, [-14, 0, -5]); o = { chew: true, baa: win(t, E.mtPlanB + 6.6, E.mtPlanB + 7.2), happy: win(t, E.mtLeggy + 7, E.mtLeggy + 9) }; }
      else { p = t < E.mtCarry + 4.8 ? [12.2, 0.5, -2.4] : arcPath(t, [[E.mtCarry + 4.8, 12.2, 0.5, -2.4, 0], [E.mtCarry + 5.8, 14.6, -3.5, -2.4, 1.5]]); yaw = PI / 2; o = { chew: true }; }
      poseGoat31(goat31, t, p, yaw, o);
      if (t >= E.mtTrade + 4.4) hatOnGoat31();
      if (bell) { bellOnGoat31(); if (win(t, E.mtDing + 3.6, E.mtDing + 4.6) || win(t, E.mtTrade + 6.5, E.mtTrade + 8.5)) bell31.rotation.z = Math.sin(t * 18) * 0.5; }
      else if (t < E.mtRing + 2) { bell31.visible = true; const k = seg(t, E.mtTrade + 8.5, E.mtTrade + 9.0); bell31.position.set(...lp31(wpos31(goat31.bellSlot), BELLD, k)); bell31.scale.setScalar(0.7); bell31.rotation.set(0, 0, k * 1.4); }
      else if (win(t, E.mtRing + 5.6, E.mtCarry)) { bell31.visible = true; bell31.position.set(...HOOK); bell31.scale.setScalar(1); const s0 = E.mtRing + 6.2; bell31.rotation.set(0, 0, t > s0 ? Math.sin((t - s0) * 9) * 0.6 * Math.exp(-(t - s0) * 0.4) : 0); } }
    // =========== cameras
    const CS = [[E.mtSummit, 6, 1.2, 6, 14, 0.5, 0, 50], [E.mtSummit + 2.9, 6.5, 1.3, 5.5, 13, 0.8, 0, 50],
      [E.mtSummit + 3, -4, 8, 16, 6, 0, 0, 55], [E.mtFrame - 0.1, -8, 12, 20, 4, 0, -1, 58],
      [E.mtFrame, 3.6, 2.6, 2.6, 0, 3, -6, 48], [E.mtDing - 0.1, 2.6, 2.4, 0.8, 0, 3.4, -6, 44],
      [E.mtDing, -4, 2, 3, -9, 0.5, -5, 50], [E.mtDing + 2.9, -3.5, 1.6, 1.5, -6, 1.3, -3.5, 44],
      [E.mtDing + 3, -3.0, 2.0, -0.4, -4.6, 1.8, -3, 40], [E.mtChase - 0.1, -3.4, 2.0, -1.4, -4.6, 1.8, -3, 30],
      [E.mtChase, 0, 9, 9, 0, 0.5, -4.5, 55], [E.mtBonkH - 0.1, 2, 8, 10, 0, 0.5, -4.5, 52],
      [E.mtBonkH, 4.5, 2.6, -2.0, -4.5, 1.4, -6.5, 48], [E.mtTripod - 0.1, 2.5, 2.4, -2.6, -5.6, 1.6, -9.6, 42],
      [E.mtTripod, -1.5, 3.5, -4.0, -5.6, 1.2, -9.4, 48], [E.mtTripod + 3.9, -1.7, 3.3, -4.3, -5.6, 1.2, -9.4, 46],
      [E.mtTripod + 4, 8, 1.8, 11.5, 4.2, 1.1, 8.0, 44], [E.mtTrade - 0.1, 7.6, 1.7, 11, 4.2, 1.1, 8.0, 40],
      [E.mtTrade, 3.3, 2.0, 13.4, 3.3, 1.4, 8.4, 44], [E.mtTrade + 4.9, 3.3, 1.9, 12.6, 3.3, 1.5, 8.4, 38],
      [E.mtTrade + 5, 1.0, 1.4, 13.2, 5.4, 1.3, 9.0, 46], [E.mtTrade + 7.9, 1.3, 1.4, 13.0, 6.0, 1.3, 9.2, 46],
      [E.mtTrade + 8, 2.6, 2.2, 12.2, 4.4, 0.9, 8.9, 40], [E.mtRing - 0.1, 2.5, 2.1, 11.8, 4.4, 0.9, 8.9, 36],
      [E.mtRing, 7, 4, 6, 2, 1.0, 2, 50], [E.mtRing + 3.9, 5, 4, 1, 0.3, 1.2, -3, 50],
      [E.mtRing + 4, 1.4, 1.0, -1.0, 0, 3.8, -6, 50], [E.mtRing + 5.9, 1.2, 0.9, -1.5, 0, 3.8, -6, 48],
      [E.mtRing + 6, 0.5, 4, -14, 0, 3.2, -5, 55], [E.mtSelfie - 0.1, 0, 16, -28, 0, 2, -3, 55],
      [E.mtSelfie, 5.5, 2.4, 3.5, 0, 1.6, -3.2, 48], [E.mtSelfie + 3.3, 5, 2.4, 3, 0, 1.6, -3.2, 48],
      [E.mtSelfie + 3.4, 0.4, 2.1, 1.6, 0, 1.5, -3.4, 60], [E.mtDown - 0.1, 0.4, 2.1, 1.5, 0, 1.5, -3.4, 60],
      [E.mtDown, 4, 3, 7, 10, 1.2, 0.5, 50], [E.mtDown + 2.9, 6, 3, 6, 10, 1.2, 0.5, 50],
      [E.mtDown + 3, 17, 0.2, 0.6, 11.8, 1.9, 0.4, 44], [E.mtDown + 4.4, 16.6, 0.2, 0.6, 11.8, 1.9, 0.4, 40],
      [E.mtDown + 4.5, 12.6, 3.0, 4.5, 16, -10, -1, 58], [E.mtEcoRev - 0.1, 12.4, 3.2, 4.8, 16, -10, -1, 58],
      [E.mtEcoRev, 9.4, 2.4, 1.0, 11.6, 1.6, 0.3, 44], [E.mtFlash - 0.1, 9.0, 2.6, 1.6, 11.4, 1.7, 0.6, 46],
      [E.mtFlash + 4, 6, 4.5, 10, 0, 1, 1.5, 50], [E.mtNight + 3.9, 4.5, 3.8, 9, 0, 1, 1.5, 50],
      [E.mtNight + 4, -2.8, 1.5, 1.0, -0.8, 1.4, 3.4, 42], [E.mtPlanA - 0.1, -2.6, 1.5, 1.4, -0.8, 1.4, 3.4, 38],
      [E.mtPlanA, -2.6, 3.5, 5.4, 0, -6, 30, 55], [E.mtPlanA + 3.9, -2.4, 3.4, 5.8, 0, -6, 30, 55],
      [E.mtPlanA + 4, 6.5, 2.0, 9.5, 0, 0.8, 13, 52], [E.mtPlanA + 6.4, 6.5, 2.0, 10.5, 0, -4, 20, 55],
      [E.mtPlanA + 6.5, 0.3, 1.9, 13.6, 0.3, 1.6, 9.8, 40], [E.mtPlanB - 0.1, 0.3, 1.8, 13.2, 0.3, 1.6, 9.8, 34],
      [E.mtPlanB, -19, 1.0, 6, -13.5, -1.5, 3, 50], [E.mtPlanB + 5.9, -20, -4, 2, -14, -6, -1, 52],
      [E.mtPlanB + 6, -18, -8, -2.6, -14, -8.4, -5, 44], [E.mtLeggy - 0.1, -17.6, -8.2, -2.8, -14, -8.4, -5, 40],
      [E.mtLeggy, -17, 2.4, -2, -12.5, 1.0, -5, 46], [E.mtLeggy + 1.9, -17.4, 2.2, -2.2, -12.8, 0.6, -5, 44],
      [E.mtLeggy + 2, -22, -3.5, -1, -14.5, -5, -5, 52], [E.mtLeggy + 4.9, -21, -5, -2, -14.5, -5, -5, 52],
      [E.mtLeggy + 5, -21, -4, -1, -14.5, -2.5, -5, 52], [E.mtCarry - 0.1, -19, 2.5, -1, -11, 1, -5, 52],
      [E.mtCarry, 14, 2.6, 10, 13.5, 0, 0, 50], [E.mtDescend, 16, 1.0, 10, 14, -2, 0, 52]];
    return { cam: camKeys(t, CS), hud: true };
  }
  return { g, update };
})();
