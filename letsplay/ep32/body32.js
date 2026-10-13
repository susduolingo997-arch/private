// ---------------------------------------------------------------- Ep 32 helpers: Chef Crustino, the Crumbandit (+ three kits), the Mega Pizza, Bloop's Hot-Box 9000 (TURBO: do not press), the delivery HUD
const _v32 = new THREE.Vector3();
const wpos32 = o => { o.getWorldPosition(_v32); return [_v32.x, _v32.y, _v32.z]; };
const glow32 = (c, i = 0.7) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const act32 = (t, K, O = [[0, {}]], idle) => act(t, K, O, idle);
const lp32 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const crumbs32 = (t, p, n = 14) => burst(t, p, { n, colors: ['#e0a050', '#ffd24a', '#c8402a'], speed: 1.6, size: 0.1, life: 0.7, grav: 6, up: 1.5 });
const steam32 = (t0, t1, pos, dt = 0.14) => smoke(t0, t1, dt, pos, { n: 2, colors: ['#ffffff', '#f4f4f4', '#e0e8f0'], speed: 0.5, size: 0.2, life: 1.2, grav: -1.6, up: 0.8 });
const dust32 = (t, p, n = 30) => burst(t, p, { n, colors: ['#c8a878', '#b08a5a', '#e0c8a0'], speed: 3, size: 0.22, life: 0.9, grav: 3, up: 1 });
const heart32 = (t, p) => burst(t, p, { n: 14, colors: ['#ff5ca8', '#ff9ecb', '#ffffff'], speed: 1.2, size: 0.14, life: 1.1, grav: -1, up: 1.4 });
// Leggy's shared crystal + eye materials (she turns red when it's extra extra spicy)
const cryM32 = (() => { let m = null; L6.body.traverse(o => { if (!m && o.isMesh && o.material && o.material.color && o.material.color.getHexString() === 'ff5cf0') m = o.material; }); return m; })();
const eyeM32 = (() => { let m = null; L6.hd.traverse(o => { if (!m && o.isMesh && o.material && o.material.color && o.material.color.getHexString() === '5ff7ff') m = o.material; }); return m; })();
const cryBack32 = []; L6.body.traverse(o => { if (o.isMesh && cryM32 && o.material === cryM32 && o.position.z < -0.6) cryBack32.push(o); });
const seatH32 = pivot(L6.body, 0, 0.55, 0.95), seatB32 = pivot(L6.body, 0, 0.4, -0.05), backC32 = pivot(L6.body, 0, 0.9, -1.0);
const bib32 = box(0.9, 0.5, 0.04, '#ffffff', 0, -0.35, 0.92, L6.hd); bib32.visible = false;
// ---- the Mega Pizza: eight real wedges (so they can go missing one at a time)
function makePizza32(r = 0.55) {
  const g = new THREE.Group(), slices = [];
  const crust = new THREE.MeshLambertMaterial({ color: '#d9963e' }), cheese = new THREE.MeshLambertMaterial({ color: '#ffd24a', emissive: '#7a4a00', emissiveIntensity: 0.18 }), pep = new THREE.MeshLambertMaterial({ color: '#c8302a' }), basil = new THREE.MeshLambertMaterial({ color: '#3cb04a' });
  for (let i = 0; i < 8; i++) { const s = new THREE.Group(); g.add(s); const a0 = i * PI / 4, am = a0 + PI / 8;
    s.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 2, 1, false, a0, PI / 4), crust));
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.88, 0.04, 2, 1, false, a0 + 0.02, PI / 4 - 0.04), cheese); ch.position.y = 0.05; s.add(ch);
    const pp = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.13, r * 0.13, 0.03, 8), i % 3 === 2 ? basil : pep); pp.position.set(Math.sin(am) * r * 0.56, 0.08, Math.cos(am) * r * 0.56); s.add(pp);
    s.traverse(o => { if (o.isMesh) o.castShadow = true; }); slices.push(s); }
  return { g, slices };
}
function makeSlice32(r = 0.5) { const P = makePizza32(r); P.slices.slice(1).forEach(s => P.g.remove(s)); const g = new THREE.Group(); P.g.rotation.y = -PI / 8; P.g.position.z = -r * 0.5; g.add(P.g); return g; }
const SLICES32 = t => t < E.pzSlice1 + 1.5 ? 8 : t < E.pzSlice2 + 1.2 ? 7 : t < E.pzReveal + 1.0 ? 6 : t < E.pzGulp + 0.5 ? 5 : 0;
// ---- Bloop's Hot-Box 9000 (origin = bottom centre, front = +z). heat lamp, a fan, and a big red TURBO button (do not press).
const hbox32 = new THREE.Group(); const hb32 = {};
{ const red = new THREE.MeshLambertMaterial({ color: '#d8322e' });
  box(1.3, 0.46, 1.3, 0, 0, 0.23, 0, hbox32, red); box(1.34, 0.08, 1.34, '#ffffff', 0, 0.12, 0, hbox32);
  hb32.lid = pivot(hbox32, 0, 0.46, -0.65); box(1.32, 0.12, 1.32, 0, 0, 0.06, 0.66, hb32.lid, red);
  const lab = plane26(1.0, 0.5, txtMat26(['HOT-BOX', '9000'], 256, 128, '#d8322e', '#ffffff', 44), hb32.lid, 0, 0.125, 0.66); lab.rotation.x = -PI / 2;
  hb32.lamp = box(0.3, 0.16, 0.3, 0, 0.42, 0.2, 1.05, hb32.lid, glow32('#ff9a2a', 0.9));
  hb32.btn = box(0.26, 0.26, 0.1, 0, 0.38, 0.25, 0.69, hbox32, glow32('#ff2a4a', 0.7)); box(0.36, 0.36, 0.06, '#ffd23f', 0.38, 0.25, 0.66, hbox32);
  plane26(0.5, 0.14, txtMat26(['TURBO'], 192, 56, '#ffd23f', '#c0182a', 40), hbox32, -0.22, 0.32, 0.661);
  hb32.fan = pivot(hbox32, -0.3, 0.2, 0.72); box(0.44, 0.07, 0.03, '#d0d0d8', 0, 0, 0, hb32.fan); box(0.07, 0.44, 0.03, '#d0d0d8', 0, 0, 0, hb32.fan);
  hb32.pz = makePizza32(0.55); hb32.pz.g.position.set(0, 0.42, 0); hbox32.add(hb32.pz.g);
  hbox32.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const megaC32 = makePizza32(0.55);
const dough32 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 10), new THREE.MeshLambertMaterial({ color: '#f6ead0' })); dough32.castShadow = true;
// ---- Chef Crustino: a blocky tomato with a moustache, a chef hat, and a stopwatch. "thirty minutes or it's FREE."
function makeChef32() {
  const root = new THREE.Group(); const body = pivot(root, 0, 0, 0);
  const tom = new THREE.MeshLambertMaterial({ color: '#e8382e' }), white = new THREE.MeshLambertMaterial({ color: '#ffffff' }), leaf = new THREE.MeshLambertMaterial({ color: '#3cb04a' });
  const legs = [-1, 1].map(s => { const p = pivot(body, s * 0.28, 0.45, 0); box(0.3, 0.45, 0.3, '#3a3a44', 0, -0.22, 0, p); box(0.34, 0.12, 0.4, '#1a1a20', 0, -0.4, 0.05, p); return p; });
  box(1.3, 1.2, 1.1, 0, 0, 1.05, 0, body, tom); box(1.36, 0.3, 1.16, 0, 0, 1.55, 0, body, tom);
  box(1.0, 0.7, 0.04, 0, 0, 0.85, 0.57, body, white); box(0.4, 0.2, 0.02, '#c8302a', 0, 0.8, 0.6, body);
  const pupils = [];
  for (const s of [-1, 1]) { box(0.26, 0.26, 0.04, 0, s * 0.3, 1.42, 0.57, body, white); pupils.push(box(0.11, 0.13, 0.03, '#111111', s * 0.27, 1.4, 0.6, body)); box(0.18, 0.1, 0.02, '#ff8a8a', s * 0.46, 1.16, 0.565, body); }
  const mus = pivot(body, 0, 1.2, 0.6); box(0.86, 0.16, 0.08, '#2a1a10', 0, 0, 0, mus); for (const s of [-1, 1]) box(0.2, 0.2, 0.08, '#2a1a10', s * 0.5, 0.1, 0, mus);
  box(0.3, 0.08, 0.03, '#5a1010', 0, 1.0, 0.565, body);
  box(0.9, 0.1, 0.9, 0, 0, 1.75, 0, body, leaf); for (const [x, z] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) box(0.3, 0.06, 0.3, 0, x, 1.74, z, body, leaf);
  const hat = pivot(body, 0, 1.8, 0); box(0.82, 0.5, 0.82, 0, 0, 0.25, 0, hat, white); box(1.08, 0.46, 1.08, 0, 0, 0.7, 0, hat, white); box(0.6, 0.2, 0.6, 0, 0, 1.0, 0, hat, white);
  const arm = s => { const p = pivot(body, s * 0.75, 1.35, 0); box(0.22, 0.6, 0.22, 0, 0, -0.28, 0, p, tom); box(0.28, 0.22, 0.28, 0, 0, -0.66, 0, p, white); return p; };
  const aL = arm(-1), aR = arm(1); const handR = pivot(aR, 0, -0.8, 0.12);
  const watch = new THREE.Group(); handR.add(watch); { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12), new THREE.MeshLambertMaterial({ color: '#f4f4f4' })); m.rotation.x = PI / 2; watch.add(m); box(0.06, 0.12, 0.06, '#ffd23f', 0, 0.24, 0, watch); box(0.03, 0.14, 0.02, '#c0182a', 0, 0.05, 0.05, watch); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, aL, aR, mus, hat, handR, watch, pupils };
}
function poseChef32(C, t, p, yaw, o = {}) {
  C.root.visible = true; C.root.position.set(...p); C.root.rotation.set(0, yaw, 0); C.root.scale.setScalar(o.s ?? 1);
  const w = o.walk ?? 0; C.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 13 + i * PI) * 0.8 * w);
  C.body.position.y = (w ? Math.abs(Math.sin(t * 13)) * 0.1 : 0) + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.4 : 0); C.body.rotation.set(o.lean || 0, 0, Math.sin(t * 2) * 0.03);
  C.aL.rotation.set(-Math.sin(t * 13) * 0.6 * w, 0, -0.15); C.aR.rotation.set(Math.sin(t * 13) * 0.6 * w, 0, 0.15);
  C.mus.rotation.z = Math.sin(t * (o.talk ? 14 : 3)) * (o.talk ? 0.12 : 0.04); C.mus.position.y = 1.2 + (o.talk ? Math.abs(Math.sin(t * 12)) * 0.04 : 0);
  if (o.wave) C.aR.rotation.set(-2.8, 0, 0.3 + Math.sin(t * 12) * 0.4);
  if (o.toss) { C.aL.rotation.set(-2.9, 0, -0.2); C.aR.rotation.set(-2.9, 0, 0.2); }
  if (o.point) { C.aR.rotation.set(-1.5, 0, 0); if (o.wag) C.aR.rotation.z = Math.sin(t * 16) * 0.35; }
  if (o.serve) { C.aL.rotation.set(-1.3, 0, 0.2); C.aR.rotation.set(-1.3, 0, -0.2); }
  if (o.angry) { C.aL.rotation.set(-2.6 + Math.sin(t * 18) * 0.4, 0, -0.3); C.aR.rotation.set(-2.6 + Math.cos(t * 18) * 0.4, 0, 0.3); }
  if (o.flail) { C.aL.rotation.set(Math.sin(t * 20) * 1.5 - 1.5, 0, -0.8); C.aR.rotation.set(Math.cos(t * 20) * 1.5 - 1.5, 0, 0.8); C.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 20 + i * PI) * 0.9); }
  if (o.spin) C.root.rotation.z = o.spin;
  C.watch.visible = !!o.watch; C.pupils.forEach(m => m.scale.setScalar(o.wide ? 0.6 : 1));
}
const chef32 = makeChef32();
// ---- the Crumbandit: a masked, stripy-tailed snack thief. warm boxes are his favourite place to nap. (+ three kits)
function makeBandit32() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const fur = new THREE.MeshLambertMaterial({ color: '#8a8c98' }), fur2 = new THREE.MeshLambertMaterial({ color: '#d4d6de' }), dark = new THREE.MeshLambertMaterial({ color: '#26262e' });
  const torso = pivot(body, 0, 0.62, 0); box(0.7, 0.55, 1.0, 0, 0, 0, 0, torso, fur); box(0.5, 0.1, 0.8, 0, 0, -0.26, 0.05, torso, fur2);
  const legs = [[-0.22, 0.32], [0.22, 0.32], [-0.22, -0.32], [0.22, -0.32]].map(([x, z]) => { const p = pivot(body, x, 0.4, z); box(0.18, 0.38, 0.18, 0, 0, -0.19, 0, p, dark); return p; });
  const tail = pivot(torso, 0, 0.12, -0.5); for (let i = 0; i < 5; i++) box(0.28 - i * 0.02, 0.28 - i * 0.02, 0.24, 0, 0, 0.06 + i * 0.07, -0.12 - i * 0.21, tail, i % 2 ? dark : fur);
  const hd = pivot(torso, 0, 0.22, 0.48); box(0.62, 0.5, 0.5, 0, 0, 0.12, 0.18, hd, fur); box(0.28, 0.2, 0.26, 0, 0, 0.0, 0.52, hd, fur2); box(0.12, 0.09, 0.06, '#111111', 0, 0.07, 0.66, hd);
  box(0.66, 0.15, 0.05, 0, 0, 0.2, 0.44, hd, dark);
  for (const s of [-1, 1]) { box(0.13, 0.11, 0.03, '#ffffff', s * 0.15, 0.2, 0.47, hd); box(0.06, 0.07, 0.02, '#111111', s * 0.13, 0.2, 0.49, hd); box(0.18, 0.2, 0.08, 0, s * 0.22, 0.45, 0.12, hd, fur); box(0.1, 0.12, 0.02, '#ff9ecb', s * 0.22, 0.44, 0.165, hd); }
  const mouth = pivot(hd, 0, -0.08, 0.66);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, torso, legs, tail, hd, mouth };
}
function poseBandit32(D, t, p, yaw, o = {}) {
  D.root.visible = true; D.root.position.set(...p); D.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); D.root.scale.setScalar(o.s ?? 1);
  const w = o.walk ?? 0, sp = o.fast ? 22 : 15; D.legs.forEach((l, i) => l.rotation.x = Math.sin(t * sp + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0)) * 0.9 * w);
  D.body.position.y = w ? Math.abs(Math.sin(t * sp)) * 0.1 : 0; D.torso.rotation.set(0, 0, 0); D.torso.position.set(0, 0.62, 0);
  if (o.stand) { D.torso.rotation.x = -1.1; D.torso.position.set(0, 0.85, -0.15); D.legs[0].rotation.x = D.legs[1].rotation.x = -1.2 + Math.sin(t * 8) * 0.2; }
  if (o.hop) D.body.position.y += Math.abs(Math.sin(t * 10 + (o.seed || 0))) * 0.35;
  D.tail.rotation.set(0.35 + Math.sin(t * 6 + (o.seed || 0)) * 0.15, Math.sin(t * 4 + (o.seed || 0)) * 0.35, 0);
  D.hd.rotation.set(o.headX || 0, o.headY ?? Math.sin(t * 2.6 + (o.seed || 0)) * 0.25, o.headR || 0);
  if (o.chew) D.hd.rotation.x += Math.abs(Math.sin(t * 12)) * 0.12;
}
const bandit32 = makeBandit32(); const kits32 = [0, 1, 2].map(() => makeBandit32());
const bSlice32 = makeSlice32(0.5); bandit32.mouth.add(bSlice32); bSlice32.position.set(0, 0, 0.2); bSlice32.rotation.x = 0.2;
const kSlice32 = makeSlice32(0.5); kits32[0].mouth.add(kSlice32); kSlice32.position.set(0, 0, 0.2);
const pile32 = new THREE.Group(); for (let i = 0; i < 3; i++) { const s = makeSlice32(0.5); s.position.set((i - 1) * 0.35, 0.05 + i * 0.09, 0); s.rotation.y = i * 1.3; pile32.add(s); }
// ---- props: Bloop's invoice, Leggy's crystal payment, the coins, the mailbox
const inv32 = card28(['INVOICE', 'HOT-BOX 9000'], '#ffffff', '#c0182a', 26); bloop6.B.aR.add(inv32); inv32.position.set(0, -0.62, 0.2); inv32.rotation.x = 1.4; inv32.visible = false;
const gem32 = new THREE.Group(); box(0.3, 0.5, 0.3, 0, 0, 0, 0, gem32, glow32('#ff5cf0', 0.9)); gem32.children[0].rotation.set(0.4, 0.6, 0.3);
const coins32 = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), glow32('#ffd23f', 0.5)); m.rotation.x = PI / 2; const g = new THREE.Group(); g.add(m); return g; });
const props32 = [hbox32, megaC32.g, dough32, chef32.root, bandit32.root, ...kits32.map(k => k.root), pile32, gem32, ...coins32];
function hide32() { hide31(); props32.forEach(o => o.visible = false); inv32.visible = false; bib32.visible = false; }
function reset32(g) {
  [hero.root, bloop6.B.root, L6.root, ...props32].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true; bloop6.B.body.rotation.set(0, 0, 0);
  parentTo(bHat, bloop6.B.hd); bHat.visible = true; bHat.position.set(0, 1.2, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(1);
  L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; L6.root.rotation.set(0, 0, 0); L6.body.scale.setScalar(1); if (cryM32) cryM32.color.set('#ff5cf0'); if (eyeM32) eyeM32.color.set('#5ff7ff');
  hb32.lid.rotation.set(0, 0, 0); hb32.fan.rotation.set(0, 0, 0); hbox32.rotation.set(0, 0, 0); hbox32.scale.setScalar(1); hb32.pz.g.visible = true; hb32.pz.g.scale.setScalar(1); hb32.pz.g.position.set(0, 0.42, 0);
  bSlice32.visible = false; kSlice32.visible = false; hero.body.rotation.set(0, 0, 0); cryBack32.forEach(o => o.visible = true);
}
function slicesShow32(P, n) { P.slices.forEach((s, i) => s.visible = i >= 8 - n); }
function boxOnLeggy32() { cryBack32.forEach(o => o.visible = false); parentTo(hbox32, L6.body); hbox32.visible = true; hbox32.position.set(0, 0.45, -1.0); hbox32.rotation.set(0, 0, 0); }
function boxAt32(g, p, yaw = 0) { parentTo(hbox32, g); hbox32.visible = true; hbox32.position.set(...p); hbox32.rotation.set(0, yaw, 0); }
function ride32(t, o = {}) { const h = wpos32(seatH32), b = wpos32(seatB32), y = L6.root.rotation.y;
  if (!o.noHero) pose(hero, { t, p: h, yaw: y, face: o.face || 'smug', sit: 1, wave: o.wave, panic: o.panic, headYaw: o.headYaw || 0 });
  if (!o.noBloop) poseBurble(bloop6, t, b, y, { hop: o.hop, angry: o.angry }); }
// ---- HUD: the delivery timer, the heat lamp, the slice count — this episode's mechanic
const TK32 = [[E.pzGo, 1800], [E.pzStake, 1100], [E.pzClock, 130], [E.pzEnd, 11], [E.pzKnock + 4, 0]];
function drawDel32(t) { if (t < E.pzGo || t >= E.freeze || t >= E.pzSpicy) return;
  rrect(22, 96, 250, 132, 12); ctx.fillStyle = 'rgba(40,14,10,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff8a2a'; ctx.stroke();
  const x0 = 40, y0 = 112, sec = Math.max(0, Math.ceil(lerpK(TK32, t))), late = sec <= 0, fl = Math.floor(t * 3) % 2;
  outlined('DELIVERY ⏱', x0, y0, 13, '#ffd0a0', '#000', 3, 'left');
  outlined(late ? (fl ? 'LATE!' : '0:00') : Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), x0, y0 + 27, 28, late || sec < 140 ? '#ff6b5a' : '#ffffff', '#000', 5, 'left');
  const n = SLICES32(t); outlined('SLICES', 150, y0, 13, '#ffd0a0', '#000', 3, 'left');
  for (let i = 0; i < 8; i++) { const sx = 152 + (i % 4) * 26, sy = y0 + 18 + Math.floor(i / 4) * 24; ctx.fillStyle = i < n ? '#ffd24a' : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(sx, sy - 9); ctx.lineTo(sx + 18, sy - 9); ctx.lineTo(sx + 9, sy + 10); ctx.closePath(); ctx.fill(); if (i < n) { ctx.fillStyle = '#c8302a'; ctx.fillRect(sx + 7, sy - 5, 4, 4); } }
  const turbo = win(t, E.pzTurbo + 1.2, E.pzEnd); outlined(turbo ? (fl ? 'TURBO!!! ▶▶▶' : 'TURBO!!!') : 'TURBO: do not press', x0, y0 + 64, 14, turbo ? '#ff3d7f' : '#ffe066', '#000', 3, 'left');
  outlined('HEAT', x0, y0 + 90, 12, '#ffd0a0', '#000', 3, 'left'); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x0 + 44, y0 + 84, 170, 12);
  const heat = turbo ? 1 : clamp(1 - (t - E.pzGo) / 260, 0.35, 1); ctx.fillStyle = turbo && fl ? '#ff3d7f' : '#ff9a2a'; ctx.fillRect(x0 + 44, y0 + 84, 170 * heat, 12); }
function drawOrder32(T) {
  for (const [s, d, mode] of [[E.pzOrder + 0.6, 6.8, 0], [E.pzWho + 0.4, 6, 1], [E.pzSpicy + 0.6, 4.2, 2]]) { const e = s + d; if (!win(T, s, e)) continue; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.48 + (1 - k) * 60); ctx.rotate(-0.035);
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(-200, -190, 400, 380); ctx.fillStyle = '#c8302a'; ctx.fillRect(-200, -190, 400, 56);
    outlined("CRUSTINO'S", 0, -162, 30, '#ffffff', '#7a1010', 4); ctx.font = F(16, 'normal'); ctx.fillStyle = '#7a6a5a'; ctx.textAlign = 'center'; ctx.fillText('ORDER #32', 0, -116);
    const L = [['1x MEGA PIZZA (8 slices)', '#2a2a3a'], ['EXTRA EXTRA SPICY', '#c8302a'], ['TO: END OF THE LONG ROAD', '#2a2a3a'], ['30 MIN OR IT\'S FREE!', '#c8302a']];
    ctx.font = F(19); ctx.textAlign = 'left'; L.forEach(([l, c], i) => { if (mode || T > s + 0.5 + i * 0.6) { ctx.fillStyle = c; ctx.fillText(l, -176, -78 + i * 40); } });
    ctx.font = F(18, 'normal'); ctx.fillStyle = '#2a2a3a'; ctx.fillText('ordered by:', -176, 104);
    if (mode === 1 && T > s + 1.6) { ctx.save(); ctx.translate(40, 104); ctx.rotate(-0.08); outlined('LEGGY (6 legs)', 20, 0, 26, '#ff5cf0', '#3a0a3a', 4); ctx.restore(); }
    else { ctx.fillStyle = '#c8302a'; ctx.beginPath(); ctx.ellipse(70, 100, 72, 26, 0.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(140, 120, 9, 0, 7); ctx.fill(); }
    if (mode === 2 && T > s + 0.6) { ctx.strokeStyle = '#ff2a4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(-60, -42, 150, 26, 0, 0, 7); ctx.stroke(); }
    ctx.restore(); } }
function drawTrial32(T) { const s = E.pzTrial + 0.3, e = E.pzTrial + 7.6; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.28, H * 0.46 + (1 - k) * 60);
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(-230, -170, 460, 340); ctx.fillStyle = '#8a5228'; ctx.fillRect(-214, -154, 428, 308); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.strokeRect(-214, -154, 428, 308);
  outlined('THE PEOPLE', 0, -118, 28, '#ffe066', '#2a1408', 5); outlined('vs. LEGGY', 0, -80, 34, '#ffffff', '#2a1408', 6);
  const L = [['CHARGE: 2 missing slices', '#ffffff'], ['EVIDENCE: she was LOOKING at it', '#ffd0a0'], ['ALIBI: "......"', '#ffd0a0']];
  L.forEach(([l, c], i) => { if (T > s + 0.8 + i * 0.9) outlined(l, 0, -28 + i * 36, 19, c, '#2a1408', 4); });
  if (T > s + 3.6) { ctx.save(); ctx.translate(0, 112); ctx.rotate(-0.08); const p = backOut(seg(T, s + 3.6, s + 3.9)); ctx.scale(p, p); outlined('OBJECTION!', 0, 0, 44, '#ff3d3d', '#ffffff', 7); ctx.restore(); }
  ctx.fillStyle = '#5a3010'; ctx.save(); ctx.translate(176, -128); ctx.rotate(Math.sin(T * 6) * 0.4); ctx.fillRect(-26, -12, 52, 24); ctx.fillRect(-4, 0, 8, 40); ctx.restore();
  ctx.restore(); }
function drawSpeed32(T) { if (!win(T, E.pzTurbo + 3, E.pzEnd)) return; const k = ss(seg(T, E.pzTurbo + 3, E.pzTurbo + 4)) * (1 - ss(seg(T, E.pzEnd - 0.8, E.pzEnd)));
  ctx.save(); ctx.globalAlpha = k * 0.7; const r = rng(Math.floor(T * 30)); ctx.strokeStyle = '#ffffff';
  for (let i = 0; i < 26; i++) { const a = r() * PI * 2, r0 = H * (0.35 + r() * 0.2), r1 = r0 + H * (0.15 + r() * 0.35); ctx.lineWidth = 2 + r() * 4; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0 * 1.6, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1 * 1.6, H / 2 + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore(); }

// ================================================================ EPISODE 32: "THE PIZZA RUN (Leggy ate the pizza)" — Crustino's pizzeria at noon (new job; the dough hat; order #32: extra extra spicy, 30 min or it's free, ordered by [sauce stain]; Leggy stares at the pizza; Bloop's Hot-Box 9000, TURBO: do not press) → the Long Road (slices vanish: 7... 6...; THE PEOPLE vs. LEGGY; Bloop's ramp over the broken bridge; the stakeout at sunset: the Crumbandit was IN THE BOX; Leggy is innocent; chase; the den: three hungry kits; Leggy refuses a slice; 2 minutes left: TURBO) → the end of the Long Road at night (nobody answers: LATE; the mailbox says LEGGY; she ordered it; she pays Bloop!; the chef: it's FREE; Leggy eats the pizza. and the box. extra extra spicy. FIRE SNEEZE)
// ---------------------------------------------------------------- set A: Crustino's pizzeria (town square, noon)
const plaza32 = (() => {
  const g = mk('plaza32'); const st = new VSet(g);
  for (let x = -32; x <= 32; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, (Math.abs(x) <= 12 && z >= -8 && z <= 12) || (x > 12 && Math.abs(z) <= 1) ? 'path' : 'turf');
  for (let x = -7; x <= 7; x++) for (let y = 1; y <= 6; y++) { if (Math.abs(x) <= 1 && y <= 3) { st.add(x, y, -9, 'dark'); continue; } st.add(x, y, -8, (Math.abs(x) === 4 || Math.abs(x) === 5) && (y === 2 || y === 3) ? 'glass' : 'brick'); }
  for (const x of [-7, 7]) for (let z = -14; z <= -9; z++) for (let y = 1; y <= 6; y++) st.add(x, y, z, 'brick');
  for (let x = -8; x <= 8; x++) for (let z = -15; z <= -8; z++) st.add(x, 7, z, 'slate');
  for (const [x, z, h] of [[-18, -8, 5], [18, -10, 6], [-24, 6, 5], [24, 8, 5], [-16, 20, 6], [16, 22, 5], [-28, -20, 6], [28, -22, 5], [0, 26, 5]]) tree29(st, x, z, h, 0);
  st.build();
  for (const [x, z, w, h, c, r] of [[-17, -18, 8, 6, '#e8d8b0', '#7a3a2a'], [17, -19, 9, 7, '#d8c8f0', '#3a4a7a'], [-22, -2, 6, 5, '#c8e8d0', '#7a3a2a'], [22, -3, 6, 6, '#f0d0c0', '#3a6a4a']]) { box(w, h, w * 0.8, c, x, h / 2 + 0.5, z, g); box(w + 0.6, 0.8, w * 0.8 + 0.6, r, x, h + 0.9, z, g); box(1.2, 2, 0.1, '#5a3a22', x, 1.5, z + w * 0.4 + 0.02, g); }
  for (let i = -7; i <= 7; i++) { const a = box(1, 0.12, 2.3, i % 2 ? '#ffffff' : '#e8382e', i, 4.6, -6.7, g); a.rotation.x = 0.32; }
  board28(["CRUSTINO'S", 'PIZZA  ·  FAST-ISH'], 7, 1.5, g, 0, 6.0, -7.35, 0, '#fff3cf', '#c8302a', 512, 112, 44, false);
  box(5.2, 1.0, 1.2, '#a0603a', 0.4, 1.0, -4.6, g); box(5.4, 0.12, 1.4, '#f4f4f4', 0.4, 1.56, -4.6, g);
  const oven = pivot(g, -5.5, 0.5, -5.6); box(2.4, 2.2, 2.2, '#9a8c80', 0, 1.1, 0, oven); box(1.8, 0.6, 1.8, '#8a7c70', 0, 2.5, 0, oven); box(0.5, 1.4, 0.5, '#6a5c50', 0.5, 3.3, -0.4, oven);
  box(1.0, 0.7, 0.06, 0, 0, 0.9, 1.11, oven, glow32('#ff7a1a', 1)); const ovL = new THREE.PointLight('#ff8a3a', 3, 7, 1.5); ovL.position.set(0, 1, 1.6); oven.add(ovL);
  smoke(0.5, E.pzRoad, 0.5, [-5, 4.4, -6], { n: 2, colors: ['#d0d0d0', '#b0b0b0'], speed: 0.4, size: 0.4, life: 2.5, grav: -0.8, up: 0.8 });
  for (const [x, z] of [[9, 4], [-9.5, 6], [9, 9]]) { box(1.6, 0.12, 1.6, '#ffffff', x, 1.35, z, g); box(0.15, 0.8, 0.15, '#5a5a5a', x, 0.9, z, g); box(0.1, 2.2, 0.1, '#5a5a5a', x, 2.4, z, g); for (let i = 0; i < 4; i++) box(0.75, 0.12, 2.6, i % 2 ? '#ffffff' : '#2ec4b6', x - 1.1 + i * 0.75, 3.5, z, g); }
  box(0.9, 1.2, 0.9, '#5a6a5a', 7.5, 1.1, -5.5, g); box(1.0, 0.14, 1.0, '#4a5a4a', 7.5, 1.77, -5.5, g);
  const DK = [[E.pzToss, 0.4, 2.6, -5.8], [E.pzToss + 1.6, 0.6, 7.2, -4.6], [E.pzToss + 3.2, 1.2, 3.1, -2.2]];
  burst(E.pzBox + 0.5, [-4.2, 2.6, 1.4], { n: 60, colors: ['#ffe066', '#ff5ca8', '#5ff7ff', '#ff3d3d'], speed: 4, size: 0.14, life: 1.4, grav: 4, up: 3 });
  steam32(E.pzOven + 2.2, E.pzBox + 3, [0.4, 1.9, -4.6]); crumbs32(E.pzToss + 3.2, [1.2, 3.0, -2.2], 20);
  for (let i = 0; i < 6; i++) burst(E.pzOven + 2.6 + i * 0.6, [-2.3, 1.5, -1.1], { n: 4, colors: ['#9fe8ff', '#c8f4ff'], speed: 0.3, size: 0.09, life: 0.6, grav: 9, up: 0 });
  dust32(E.pzGo + 2.2, [0, 0.6, 3]);
  const H0 = [1.2, 0.5, -2.2], B0 = [5.4, 0.5, 0.6], L0 = [-3.6, 0.5, 0.6], C0 = [0.4, 0.5, -6.3], CTR = [0.4, 1.65, -4.6];
  const lY = faceTo(L0, [0, 0, -4.6]);
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    // ---- the chef
    const cA = act32(t, [[0, 0, 0.5, -9.4], [E.pzChef, 0, 0.5, -9.4], [E.pzChef + 1.2, ...C0]], [[0, {}], [E.pzChef + 1.2, { wave: true, talk: true }], [E.pzChef + 4, { talk: true }], [E.pzToss, { toss: true }], [E.pzToss + 1.4, { talk: true }],
      [E.pzOrder, { talk: true, point: true }], [E.pzOrder + 4, { talk: true }], [E.pzOven, { serve: true }], [E.pzOven + 3.6, { point: true, wag: true, talk: true }], [E.pzOven + 7, {}], [E.pzBox + 2.6, { serve: true }], [E.pzBox + 4.4, { wave: true }], [E.pzGo, { wave: true, hop: true }]]);
    poseChef32(chef32, t, cA.p, t < E.pzChef + 1.2 ? 0 : faceTo(C0, t >= E.pzOven + 3.6 && t < E.pzOven + 7 ? L0 : H0), cA);
    // ---- the dough: tossed. spun. landed. on my head.
    if (win(t, E.pzToss, E.pzToss + 3.2)) { dough32.visible = true; dough32.position.set(...track(t, DK).p); dough32.rotation.set(0.3, t * 14, 0); }
    // ---- me
    const hA = act32(t, [[0, 2, 0.5, 22], [6.8, ...H0], [E.pzGo, ...H0]], [[0, { face: 'smug', wave: t < 2.5 }], [6.8, { face: 'normal' }], [E.pzChef + 1, { face: 'smug' }], [E.pzToss + 3.2, { face: 'scared' }], [E.pzToss + 5, { face: 'normal' }],
      [E.pzOrder, { face: 'smug' }], [E.pzOven + 2, { face: 'smug' }], [E.pzBox, { face: 'normal' }], [E.pzBox + 5.5, { face: 'scared' }], [E.pzBox + 6.6, { face: 'smug' }]]);
    let hyaw = hA.walk ? hA.yaw : faceTo(H0, C0); if (win(t, E.pzOven + 2.4, E.pzOven + 6)) hyaw = faceTo(H0, L0); if (win(t, E.pzBox, E.pzGo)) hyaw = faceTo(H0, [-4.2, 0, 1.4]);
    // ---- Leggy: stares. at the pizza. the entire time.
    const LK = [[0, -4, 0.5, 28], [9, ...L0], [E.pzOven + 3, ...L0], [E.pzOven + 3.8, -3.0, 0.5, -0.2], [E.pzOven + 5, -3.0, 0.5, -0.2], [E.pzOven + 6, ...L0], [E.pzGo + 1.4, ...L0], [E.pzGo + 2.4, 2, 0.5, 3.5], [E.pzGo + 4, 18, 0.5, 0.5]];
    const lA = walker(t, LK, lY); const lw = lA.speed > 0.05; let ly = lw && !win(t, E.pzOven + 3, E.pzOven + 6) ? lA.yaw : lY; if (t > E.pzGo + 1.4) ly = lA.yaw;
    poseLurk(L6, t, lA.p, ly, lw ? (t > E.pzGo ? 3.5 : 2) : 0.4);
    if (win(t, E.pzOven + 1.5, E.pzBox)) { L6.hd.rotation.set(0.25, Math.sin(t * 0.8) * 0.05, 0); }
    if (win(t, E.pzOven + 5, E.pzOven + 7)) L6.hd.rotation.set(0.1, Math.sin(t * 18) * 0.12, 0);
    if (win(t, E.pzBox + 4.6, E.pzGo + 1)) L6.hd.rotation.set(0, 0.7 + Math.sin(t * 2) * 0.15, 0);
    // ---- the Hot-Box: on Leggy's back (of all places)
    if (t >= E.pzBox + 0.4) { boxOnLeggy32(); const sc = backOut(seg(t, E.pzBox + 0.4, E.pzBox + 0.9)); hbox32.scale.setScalar(Math.max(0.01, sc)); hb32.lid.rotation.x = -1.9 * ss(seg(t, E.pzBox + 1, E.pzBox + 1.6)) * (1 - ss(seg(t, E.pzBox + 5.2, E.pzBox + 5.8))); hb32.pz.g.visible = t > E.pzBox + 4.2; }
    // ---- the Mega Pizza: oven → counter → box
    if (win(t, E.pzOven + 0.6, E.pzBox + 4.2)) { megaC32.g.visible = true; const bp = wpos32(backC32);
      const p = t < E.pzOven + 2 ? arcPath(t, [[E.pzOven + 0.6, -5.5, 1.4, -4.3, 0], [E.pzOven + 2, ...CTR, 1.2]]) : t < E.pzBox + 3.4 ? CTR : arcPath(t, [[E.pzBox + 3.4, ...CTR, 0], [E.pzBox + 4.2, bp[0], bp[1] - 0.4, bp[2], 2]]);
      megaC32.g.position.set(...p); megaC32.g.rotation.set(0, t < E.pzBox + 3.4 ? 0 : t * 6, 0); slicesShow32(megaC32, 8); }
    // ---- me + Bloop: hop on
    if (t < E.pzGo + 0.4) { pose(hero, { t, ...hA, yaw: hyaw }); if (win(t, E.pzToss + 3.2, E.pzOven)) { dough32.visible = true; parentTo(dough32, hero.hatSlot); dough32.position.set(0, 0.7, 0); dough32.rotation.set(0.15, 0, 0.1); dough32.scale.set(1, 1, 1); } else parentTo(dough32, g); }
    else if (t < E.pzGo + 1.3) { const s = wpos32(seatH32); pose(hero, { t, p: arcPath(t, [[E.pzGo + 0.4, ...H0, 0], [E.pzGo + 1.3, ...s, 1.4]]), yaw: hyaw, face: 'smug' }); }
    const bA = act32(t, [[0, 6, 0.5, 24], [8, ...B0], [E.pzBox - 2.4, ...B0], [E.pzBox + 0.4, -1.6, 0.5, 1.6], [E.pzGo, -1.6, 0.5, 1.6]],
      [[0, {}], [E.pzToss + 3.4, { hop: true }], [E.pzToss + 5, {}], [E.pzOven + 3.6, { facepalm: true }], [E.pzOven + 6, {}], [E.pzBox + 0.4, { handOut: true }], [E.pzBox + 0.9, { hop: true }], [E.pzBox + 2.4, { handOut: true }], [E.pzBox + 5.4, { angry: true }], [E.pzBox + 6.8, {}]]);
    if (t < E.pzGo + 0.6) poseBurble(bloop6, t, bA.p, bA.walk ? bA.yaw : faceTo(bA.p, t > E.pzBox ? [-4.2, 0, 1.4] : C0), { walk: bA.walk, phase: bA.phase * 2, ...bA });
    else if (t < E.pzGo + 1.5) { const s = wpos32(seatB32); poseBurble(bloop6, t, arcPath(t, [[E.pzGo + 0.6, -1.6, 0.5, 1.6, 0], [E.pzGo + 1.5, ...s, 1.4]]), ly, {}); }
    if (t >= E.pzGo + 1.3) ride32(t, { noBloop: t < E.pzGo + 1.5, wave: t > E.pzGo + 2, face: 'smug' });
    // ---- a cameo behind the bin (nobody notices. YOU noticed.)
    if (win(t, E.pzOven + 6.2, E.pzOven + 7.9)) { const k = ss(seg(t, E.pzOven + 6.2, E.pzOven + 6.7)) * (1 - ss(seg(t, E.pzOven + 7.4, E.pzOven + 7.9))); poseBandit32(bandit32, t, [7.5 - 0.9 * k, 0.5, -6.4], -0.6, { headY: 0.3 }); }
    const CA = [[0, 10, 8, 26, 0, 3, -6, 55], [7.9, 6, 6, 19, 0, 2.6, -6, 52],
      [8, 1.2, 6.0, 4.5, 0.3, 1.9, -6.3, 46], [15.9, 1.0, 5.6, 3.4, 0.3, 2.0, -6.3, 42],
      [16, 2.6, 0.9, -3.2, 0.6, 4.8, -5.5, 55], [19.9, 3.6, 2.0, 0.2, 1.2, 2.9, -2.2, 52],
      [20, 2.0, 2.9, -3.8, 1.2, 3.2, -2.2, 58], [23.9, 1.9, 2.9, -3.7, 1.2, 3.2, -2.2, 54],
      [24, 3.8, 3.4, 2.0, 0.4, 2.2, -6, 46], [31.9, 3.2, 3.2, 1.0, 0.4, 2.2, -6, 42],
      [32, 6, 4.5, 6, -2, 1.8, -5, 50], [35.9, 5.4, 4.2, 5.2, -2, 1.8, -5, 48],
      [36, -0.4, 2.3, -3.6, -2.2, 1.8, -1.4, 50], [37.9, -0.5, 2.2, -3.4, -2.2, 1.8, -1.4, 46],
      [38, 4, 2.6, 3.5, 4.5, 1.4, -5.5, 50], [39.9, 4.2, 2.5, 3.0, 4.5, 1.4, -5.5, 48],
      [40, -8.8, 4.2, -1.4, -3.8, 2.0, 1.2, 48], [43.9, -8.4, 4.0, -1.0, -3.8, 2.0, 1.2, 46],
      [44, -7.8, 3.6, -0.6, -4.0, 2.2, 1.3, 42], [47.9, -7.6, 3.5, -0.4, -4.0, 2.2, 1.3, 40],
      [48, 6, 7, 18, 0, 1, 0, 55], [52, 9, 6, 15, 8, 1, 0, 55]];
    return { cam: camKeys(t, CA), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Long Road (afternoon → sunset → dusk): the bridge, the stakeout, the den, TURBO
const road32 = (() => {
  const g = mk('road32'); const st = new VSet(g);
  for (let x = -40; x <= 228; x++) for (let z = -18; z <= 18; z++) { if (x >= 24 && x <= 29) { st.add(x, -1, z, 'water'); st.add(x, -2, z, 'sand'); continue; } st.add(x, 0, z, Math.abs(z) <= 1 ? 'path' : 'turf'); }
  for (let x = 22; x <= 31; x++) { if (x >= 25 && x <= 28) continue; for (let z = -1; z <= 1; z++) st.add(x, 1, z, 'plank'); }
  for (const x of [24, 29]) for (const z of [-2, 2]) for (let y = -1; y <= 2; y++) st.add(x, y, z, 'log');
  for (let x = -36; x <= 224; x += 9) for (const sd of [-1, 1]) { const z = sd * (9 + Math.floor(hash2(x, sd, 32) * 7)); if (x > 40 && x < 70 && z < 0) continue; if (x > 40 && x < 58 && z > 0) continue; if (x >= 20 && x <= 32) continue; tree29(st, x, z, 4 + Math.floor(hash2(x, sd + 5, 32) * 3), 0); }
  for (const [x, z, h] of [[55, -6, 5], [64, -17, 6], [53, -15, 5], [68, -11, 5], [46, -12, 6]]) tree29(st, x, z, h, 0);
  st.build();
  for (let i = 0; i < 6; i++) { const b = box(1.6 + (i % 2) * 0.6, 1.1, 1.0, 0, 44 + i * 2, 1.05, 5.5 + (i % 3) * 0.2, g, MAT.leaf); b.castShadow = true; }
  // the den: a hollow log + a nest
  const den = pivot(g, 60, 0.5, -14.2); box(5.4, 0.5, 2.6, 0, 0, 0.25, 0, den, MAT.log[0]); box(5.4, 0.5, 2.6, 0, 0, 2.25, 0, den, MAT.log[0]); box(5.4, 2.5, 0.5, 0, 0, 1.25, -1.05, den, MAT.log[0]); box(0.5, 2.5, 2.6, 0, 2.45, 1.25, 0, den, MAT.log[0]);
  box(2.6, 0.3, 1.6, '#d8b860', -0.6, 0.6, 0.2, den); pile32.position.set(60.6, 1.25, -13.9);
  board28(['SPEED LIMIT:', '6 LEGS'], 2.4, 1.0, g, 118, 2.6, -3.2, 0, '#ffffff', '#c0182a', 384, 160, 44);
  board28(['END OF THE LONG ROAD', '→ 1 km'], 3.6, 1.1, g, 186, 2.6, -3.4, 0, '#f6e7c1', '#5a2a10', 512, 160, 44);
  board28(['BRIDGE: OUT', '(sorry)'], 2.4, 1.0, g, 18, 2.4, -3.0, 0, '#ffe066', '#3a2a10', 384, 160, 44);
  for (let x = -30; x <= 220; x += 13) for (const sd of [-1, 1]) { const f = box(0.3, 0.4, 0.3, ['#ff6fb8', '#ffe066', '#ffffff'][Math.abs(x) % 3], x + sd * 3, 0.7, sd * (3.5 + (x % 4)), g); f.castShadow = false; }
  const RAMP = []; for (const [x, y] of [[21, 1], [22, 2], [23, 3], [24, 4]]) for (let z = -1; z <= 1; z++) { const m = new THREE.Mesh(GEO, MAT.plank); m.castShadow = m.receiveShadow = true; g.add(m); RAMP.push([m, x, y, z]); }
  for (let i = 0; i < 4; i++) burst(E.pzBridge + 2 + i * 0.7, [21 + i, 1 + i, 0], { n: 12, colors: ['#c8955a', '#ffe066'], speed: 1.6, size: 0.12, life: 0.6, grav: 4, up: 1 });
  burst(E.pzJump + 3.6, [30, 1.6, 0], { n: 40, colors: ['#c8955a', '#e0c8a0'], speed: 3, size: 0.16, life: 0.8, grav: 5, up: 2 }); burst(E.pzJump + 2.6, [26.5, -0.2, 0], { n: 30, colors: ['#bfe8ff', '#ffffff'], speed: 2, size: 0.14, life: 0.8, grav: 6, up: 3 });
  crumbs32(E.pzReveal + 3, [48, 1.6, 0.3], 16); heart32(E.pzReveal + 6.4, [51.5, 3.4, 7.2]); heart32(E.pzDen + 1, [60.2, 1.5, -12.2]); heart32(E.pzOffer + 7.5, [60.2, 1.4, -12]);
  dust32(E.pzChase + 3.6, [54.3, 1.2, -5.3], 20); dust32(E.pzTurbo + 3, [49, 0.6, 0], 40);
  burst(E.pzReveal + 0.6, [48, 1.2, 0], { n: 20, colors: ['#ffd24a', '#ffffff'], speed: 1.4, size: 0.1, life: 0.6, grav: 2, up: 1 });
  const LPX = t => 50 + 170 * Math.pow(seg(t, E.pzTurbo + 3, E.pzEnd - 0.6), 1.6);
  smoke(E.pzTurbo + 1.6, E.pzEnd - 0.6, 0.06, t => [LPX(t) - 0.4, 2.6, 0], { n: 2, colors: ['#ffd24a', '#ff9a2a', '#ffffff'], speed: 0.3, size: 0.16, life: 0.5, grav: 0, up: 0.3 });
  smoke(E.pzTurbo + 3, E.pzEnd - 0.6, 0.08, t => [LPX(t) - 2.5, 0.6, 0], { n: 3, colors: ['#c8a878', '#e0c8a0'], speed: 1.6, size: 0.3, life: 0.7, grav: 1, up: 0.6 });
  const LK = [[E.pzRoad, -30, 0.5, 0], [E.pzSmell, -8, 0.5, 0], [E.pzSlice1 - 0.4, 12, 0.5, 0], [E.pzSlice1 + 7.4, 12, 0.5, 0], [E.pzBridge + 1, 18, 0.5, 0], [E.pzJump, 18, 0.5, 0]];
  const LJ = [[E.pzJump, 18, 0.5, 0, 0], [E.pzJump + 0.8, 21, 2.0, 0, 0.2], [E.pzJump + 1.5, 24.4, 5.0, 0, 0.2], [E.pzJump + 3.6, 30.5, 1.5, 0, 3.2], [E.pzJump + 4.4, 33, 0.5, 0, 0.2]];
  const LK2 = [[E.pzJump + 4.4, 33, 0.5, 0], [E.pzSlice2 - 0.4, 40, 0.5, 0], [E.pzStake, 40, 0.5, 0]];
  const SH = [52, 0.5, 9.2], SB = [48.6, 0.5, 7.4], SHE = [46, 0.5, 7.2], BX = [48, 0.5, 0];
  const DH = [57.0, 0.5, -9.0], DB = [55.8, 0.5, -9.8], DL = [63, 0.5, -7], DEN = [60.2, 0.5, -12.6];
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    RAMP.forEach(([m, x, y, z], i) => { const k = backOut(seg(t, E.pzBridge + 2 + Math.floor(i / 3) * 0.7, E.pzBridge + 2.4 + Math.floor(i / 3) * 0.7)); m.visible = k > 0.02; m.position.set(x, y, z); m.scale.setScalar(Math.max(0.02, k)); });
    let cam; const n = SLICES32(t); slicesShow32(hb32.pz, n);
    if (t < E.pzStake) {
      // ---- the ride: Leggy + me + Bloop + the Hot-Box
      let lp, ly = PI / 2, sp = 2.4;
      if (t < E.pzJump) { const w = walker(t, LK, PI / 2); lp = w.p; sp = w.speed > 0.05 ? 3 : 0.4; }
      else if (t < E.pzJump + 4.4) { lp = arcPath(t, LJ); sp = 3; }
      else { const w = walker(t, LK2, PI / 2); lp = w.p; sp = w.speed > 0.05 ? 3 : 0.4; }
      poseLurk(L6, t, lp, ly, sp); boxOnLeggy32();
      if (win(t, E.pzJump + 1.5, E.pzJump + 3.6)) L6.root.rotation.set(0, ly, 0);
      if (win(t, E.pzJump + 0.8, E.pzJump + 1.5)) L6.root.rotation.x = -0.35;
      // Leggy's head keeps turning back to the box. "Leggy. NO."
      const smk = Math.max(ss(seg(t, E.pzSmell + 1, E.pzSmell + 1.6)) * (1 - ss(seg(t, E.pzSmell + 3, E.pzSmell + 3.4))), ss(seg(t, E.pzSmell + 5.4, E.pzSmell + 6)) * (1 - ss(seg(t, E.pzSmell + 6.8, E.pzSmell + 7.2))));
      if (smk > 0) L6.hd.rotation.set(-0.1, 1.2 * smk, 0);
      if (win(t, E.pzSlice1 + 3.4, E.pzSlice1 + 6.6) || win(t, E.pzSlice2 + 2.4, E.pzTrial + 1)) L6.hd.rotation.set(0.15, Math.sin(t * 9) * 0.45, 0);
      if (win(t, E.pzTrial + 1, E.pzStake)) { L6.hd.rotation.set(0.45, 0, 0); L6.light.intensity = 0.6; }
      // the lid: opened twice. counted twice.
      const lidK = Math.max(ss(seg(t, E.pzSlice1 + 1.2, E.pzSlice1 + 1.6)) * (1 - ss(seg(t, E.pzSlice1 + 5.8, E.pzSlice1 + 6.2))), ss(seg(t, E.pzSlice2 + 0.6, E.pzSlice2 + 1.0)) * (1 - ss(seg(t, E.pzSlice2 + 6, E.pzSlice2 + 6.4))));
      hb32.lid.rotation.x = -1.9 * lidK;
      // me: ride / hop off / count / accuse / hop back on
      const off1 = win(t, E.pzSlice1 + 0.3, E.pzSlice1 + 7), off2 = t >= E.pzSlice2 + 0.2;
      if (off1 || off2) { const P = off1 ? [11, 0.5, -2.2] : [39, 0.5, -2.2], s = wpos32(seatH32), t0 = off1 ? E.pzSlice1 + 0.3 : E.pzSlice2 + 0.2;
        let p = P, o = { face: 'normal', yaw: 0 };
        if (t < t0 + 0.8) p = arcPath(t, [[t0, ...s, 0], [t0 + 0.8, ...P, 1]]);
        if (off1 && t > E.pzSlice1 + 6.2) p = arcPath(t, [[E.pzSlice1 + 6.2, ...P, 0], [E.pzSlice1 + 7, ...s, 1.2]]);
        if (t > t0 + 1.7) o = { face: 'scared', yaw: 0 };
        if (t > t0 + 3.2) o = { face: 'normal', yaw: faceTo(P, [lp[0] + 2, 0, lp[2]]), headPitch: 0.1 };
        if (off2 && t > E.pzTrial) o = { face: 'smug', yaw: faceTo(P, [lp[0] + 2, 0, lp[2]]) };
        pose(hero, { t, p, ...o }); if (t > t0 + 3.2 && t < t0 + 6) hero.aR.rotation.set(-1.5, 0, 0); }
      else ride32(t, { noBloop: true, face: win(t, E.pzJump + 1, E.pzJump + 4) ? 'scared' : 'smug', panic: win(t, E.pzJump + 1.2, E.pzJump + 3.8), wave: win(t, E.pzRoad + 1, E.pzRoad + 4) });
      if (win(t, E.pzSmell + 3, E.pzSmell + 5)) { hero.aR.rotation.set(-1.4, 0, 0.3); hero.hd.rotation.y = 0.5; }
      // Bloop: rides. builds a ramp. objects in court.
      const bOff = win(t, E.pzBridge + 1, E.pzBridge + 7.2), bOff2 = t >= E.pzSlice2 + 3;
      if (bOff) { const s = wpos32(seatB32), P = [20.2, 0.5, -2.3]; let p = P;
        if (t < E.pzBridge + 1.8) p = arcPath(t, [[E.pzBridge + 1, ...s, 0], [E.pzBridge + 1.8, ...P, 1]]);
        if (t > E.pzBridge + 6.4) p = arcPath(t, [[E.pzBridge + 6.4, ...P, 0], [E.pzBridge + 7.2, ...s, 1.3]]);
        poseBurble(bloop6, t, p, faceTo(P, [22, 0, 0]), { hop: win(t, E.pzBridge + 2, E.pzBridge + 5), handOut: win(t, E.pzBridge + 2, E.pzBridge + 5) }); }
      else if (bOff2) { const P = [43, 0.5, -2.4], s = wpos32(seatB32); const p = t < E.pzSlice2 + 3.8 ? arcPath(t, [[E.pzSlice2 + 3, ...s, 0], [E.pzSlice2 + 3.8, ...P, 1]]) : P;
        poseBurble(bloop6, t, p, faceTo(P, [36, 0, 0.5]), { angry: win(t, E.pzTrial + 3.6, E.pzTrial + 5.6), hop: win(t, E.pzTrial + 3.6, E.pzTrial + 5.6) }); }
      else poseBurble(bloop6, t, wpos32(seatB32), ly, { angry: win(t, E.pzJump + 1.2, E.pzJump + 3.8) });
      // cameras
      const LP = lp;
      if (t < E.pzSmell) cam = { p: [LP[0] - 3, 3.0, 9], l: [LP[0] + 1, 1.8, 0], fov: 50 };
      else if (t < E.pzSlice1) cam = { p: [LP[0] + 5, 2.8, 2.8 + seg(t, E.pzSmell, E.pzSlice1) * 0.8], l: [LP[0] - 0.5, 2.0, 0], fov: 48 };
      else if (t < E.pzBridge) cam = camKeys(t, [[E.pzSlice1, 11, 2.4, -6.5, 11.4, 1.6, 0, 46], [E.pzSlice1 + 1.9, 11, 2.4, -6.2, 11.4, 1.6, 0, 44],
        [E.pzSlice1 + 2, 11.0, 5.6, -1.2, 11, 2.3, 0, 46], [E.pzSlice1 + 3.9, 11.0, 5.5, -1.1, 11, 2.3, 0, 44],
        [E.pzSlice1 + 4, 17.5, 2.2, 0.8, 13.5, 1.9, 0, 44], [E.pzBridge - 0.1, 17.2, 2.2, 0.8, 13.5, 1.9, 0, 40]]);
      else if (t < E.pzJump) cam = camKeys(t, [[E.pzBridge, 22, 4, 13, 22, 1, 0, 52], [E.pzJump - 0.1, 21, 3.5, 11, 22, 1.4, 0, 50]]);
      else if (t < E.pzJump + 1.5) cam = { p: [14, 1.5, 4.5], l: [24, 3, 0], fov: 55 };
      else if (t < E.pzJump + 3.4) cam = { p: [27.5, 1.5, 9], l: [27.5, 4.5, 0], fov: 60 };
      else if (t < E.pzSlice2) cam = { p: [LP[0] + 5, 2.5, 6], l: [LP[0] - 1, 2, 0], fov: 52 };
      else if (t < E.pzTrial) cam = camKeys(t, [[E.pzSlice2, 39, 2.6, -6.4, 39.4, 1.6, 0, 46], [E.pzSlice2 + 0.9, 39, 2.6, -6.2, 39.4, 1.6, 0, 46], [E.pzSlice2 + 1, 39.0, 5.6, -1.2, 39, 2.3, 0, 46], [E.pzSlice2 + 2.4, 39.0, 5.5, -1.1, 39, 2.3, 0, 44], [E.pzSlice2 + 2.5, 45.5, 2.2, 0.8, 41.5, 1.9, 0, 44], [E.pzTrial - 0.1, 45.2, 2.2, 0.8, 41.5, 1.9, 0, 42]]);
      else cam = camKeys(t, [[E.pzTrial, 45, 2.6, 4.5, 38.5, 1.4, -1, 50], [E.pzStake - 0.1, 44.6, 2.5, 4.0, 38.5, 1.4, -1, 46]]);
    } else if (t < E.pzChase) {
      // ---- the stakeout (sunset). the box on the road. us in the bushes. Leggy's crystals: very visible.
      boxAt32(g, BX, PI / 2); const lidK = ss(seg(t, E.pzReveal + 0.4, E.pzReveal + 0.9)); hb32.lid.rotation.x = -1.6 * lidK;
      const hop = t > E.pzReveal + 3.4, lp = [SH[0], SH[1], SH[2]];
      poseLurk(L6, t, lp, faceTo(SH, BX), hop ? 1.5 : 0.3); if (!hop) { L6.body.position.y = 0.95; L6.hd.rotation.set(0.2, 0, 0); } else { L6.root.position.y += Math.abs(Math.sin(t * 8)) * 0.4; L6.light.intensity = 3; }
      const up = t > E.pzReveal + 2.6;
      pose(hero, { t, p: SHE, yaw: up && t > E.pzReveal + 5 ? faceTo(SHE, SH) : faceTo(SHE, BX), face: up ? (t > E.pzReveal + 5 ? 'smug' : 'scared') : 'normal', sit: up ? 0 : 0.6, headPitch: up ? 0 : 0.15 });
      if (win(t, E.pzReveal + 6, E.pzChase)) hero.aR.rotation.set(-2.2, 0, 0.3);
      poseBurble(bloop6, t, up ? SB : [SB[0], 0.05, SB[2]], faceTo(SB, BX), { hop: win(t, E.pzReveal + 2.6, E.pzReveal + 4), angry: win(t, E.pzReveal + 4, E.pzReveal + 6) });
      // the Crumbandit: in the box. the WHOLE TIME.
      if (t > E.pzReveal + 0.5) { const k = ss(seg(t, E.pzReveal + 0.5, E.pzReveal + 1.2)); poseBandit32(bandit32, t, [BX[0], lerp(0.3, 0.6, k), BX[2]], t < E.pzReveal + 2.6 ? 0.4 * Math.sin(t * 2) : faceTo(BX, SHE), { stand: true, headY: 0, chew: win(t, E.pzReveal + 3, E.pzReveal + 6) }); bSlice32.visible = true; }
      cam = camKeys(t, [[E.pzStake, 47, 1.4, -6, 48, 1.2, 5, 50], [E.pzStake + 3.9, 47.4, 1.3, -5.2, 48, 1.2, 5, 46],
        [E.pzStake + 4, 40.5, 2.8, 9.5, 48, 0.8, 0, 40], [E.pzReveal - 0.1, 41.0, 2.6, 8.8, 48, 0.8, 0, 32],
        [E.pzReveal, 51, 2.0, 4.2, 48, 1.1, 0, 46], [E.pzReveal + 2.9, 50.8, 1.9, 3.8, 48, 1.2, 0, 42],
        [E.pzReveal + 3, 43, 3.2, -5, 50, 1.2, 7.5, 50], [E.pzReveal + 5.4, 43.2, 3.1, -4.6, 50, 1.2, 7.5, 48],
        [E.pzReveal + 5.5, 56, 2.5, 3.5, 50.5, 1.8, 8, 48], [E.pzChase - 0.1, 55.6, 2.5, 3.6, 50.5, 1.8, 8, 46]]);
    } else if (t < E.pzTurbo) {
      // ---- the chase → the den → the kits → Leggy says no → 2 minutes left
      boxAt32(g, BX, PI / 2); hb32.lid.rotation.x = -1.6;
      const BK = [[E.pzChase, 48, 0.6, 0], [E.pzChase + 0.6, 49.5, 0.5, -1.5], [E.pzChase + 2.5, 52.5, 0.5, -4], [E.pzChase + 5, 56.5, 0.5, -8.5], [E.pzChase + 7.4, 59.8, 0.5, -12.0]];
      if (t < E.pzChase + 7.6) { const w = walker(t, BK); poseBandit32(bandit32, t, t < E.pzChase + 0.6 ? arcPath(t, [[E.pzChase, 48, 0.6, 0, 0], [E.pzChase + 0.6, 49.5, 0.5, -1.5, 0.8]]) : w.p, w.yaw, { walk: 1, fast: true }); bSlice32.visible = true; }
      else if (t > E.pzDen + 0.5) { const k = seg(t, E.pzDen + 0.5, E.pzDen + 1.2); poseBandit32(bandit32, t, lp32([59.8, 0.5, -13], [58.4, 0.5, -11.4], k), faceTo([58.4, 0, -11.4], DH), { stand: t > E.pzDen + 1.4, walk: k < 1 ? 1 : 0 }); }
      // the kits
      if (t > E.pzDen) { pile32.visible = true;
        kits32.forEach((K, i) => { const P = [59.2 + i, 0.5, -12.3 + (i === 1 ? 0.3 : 0)]; let p = P, yaw = faceTo(P, DH), o = { s: 0.45, hop: win(t, E.pzDen + 0.8, E.pzDen + 4) || win(t, E.pzOffer + 7, E.pzClock), seed: i * 2 };
          if (i === 0 && win(t, E.pzOffer, E.pzOffer + 7)) { const KK = [[E.pzOffer, ...P], [E.pzOffer + 2, 61.6, 0.5, -9.9], [E.pzOffer + 5.2, 61.6, 0.5, -9.9], [E.pzOffer + 7, ...P]]; const w = walker(t, KK); p = w.p; yaw = w.speed > 0.05 ? w.yaw : faceTo(p, [62.2, 0, -8.8]); o = { s: 0.45, walk: w.speed > 0.05 ? 1 : 0, stand: w.speed <= 0.05, seed: 1 }; kSlice32.visible = t < E.pzOffer + 5.2; }
          poseBandit32(K, t, p, yaw, o); }); }
      // me: chase. BONK. den. aww. panic.
      const HK = [[E.pzChase, ...SHE], [E.pzChase + 1, 48, 0.5, 1.5], [E.pzChase + 3.6, 54.3, 0.5, -5.3], [E.pzChase + 6.2, 54.3, 0.5, -5.3], [E.pzDen - 0.5, ...DH]];
      const hw = walker(t, HK); let hp = t < E.pzChase + 1 ? arcPath(t, [[E.pzChase, ...SHE, 0], [E.pzChase + 1, 48, 0.5, 1.5, 1.6]]) : hw.p, ho = { face: 'scared', yaw: hw.yaw, walk: hw.walk, phase: hw.phase };
      if (win(t, E.pzChase + 3.6, E.pzChase + 5.4)) ho = { face: 'soot', yaw: 0.9, flat: ss(seg(t, E.pzChase + 3.6, E.pzChase + 4.0)), flatDir: -1 };
      if (win(t, E.pzChase + 5.4, E.pzChase + 6.2)) ho = { face: 'scared', yaw: 0.9 };
      if (t >= E.pzDen - 0.5) { ho = { face: 'normal', yaw: faceTo(DH, DEN) }; if (t > E.pzDen + 1) ho.face = 'smug'; if (t > E.pzOffer + 5) ho.face = 'smug'; if (t > E.pzClock) ho = { face: 'scared', yaw: 0.2, panic: true }; }
      pose(hero, { t, p: hp, ...ho });
      const BKK = [[E.pzChase, ...SB], [E.pzChase + 1.5, 50, 0.5, 2], [E.pzChase + 6.5, 53.5, 0.5, -6.5], [E.pzDen, ...DB]]; const bw = walker(t, BKK);
      poseBurble(bloop6, t, t < E.pzChase + 1.5 ? arcPath(t, [[E.pzChase, ...SB, 0], [E.pzChase + 1.5, 50, 0.5, 2, 1.6]]) : bw.p, bw.speed > 0.05 ? bw.yaw : faceTo(DB, DEN), { walk: bw.speed > 0.05, phase: bw.phase * 2, hop: win(t, E.pzDen + 1, E.pzDen + 3), angry: win(t, E.pzClock + 0.5, E.pzTurbo), handOut: win(t, E.pzClock + 3, E.pzTurbo) });
      const LKK = [[E.pzChase, ...SH], [E.pzChase + 1.5, 52, 0.5, 2], [E.pzChase + 5.5, 57.5, 0.5, -3.0], [E.pzDen - 0.5, ...DL]]; const lw = walker(t, LKK);
      poseLurk(L6, t, t < E.pzChase + 1.5 ? arcPath(t, [[E.pzChase, ...SH, 0], [E.pzChase + 1.5, 52, 0.5, 2, 1.4]]) : lw.p, lw.speed > 0.05 ? lw.yaw : faceTo(DL, DEN), lw.speed > 0.05 ? 3 : 0.4);
      if (win(t, E.pzOffer + 2, E.pzOffer + 5)) { L6.hd.rotation.set(0.45 * ss(seg(t, E.pzOffer + 2, E.pzOffer + 3.5)), Math.sin(t * 30) * 0.05, 0); L6.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 40 + i) * 0.12); }
      if (win(t, E.pzOffer + 5, E.pzOffer + 7.5)) L6.hd.rotation.set(-0.3, 1.0 * ss(seg(t, E.pzOffer + 5, E.pzOffer + 5.3)), 0);
      const hpc = hp;
      if (t < E.pzDen) cam = { p: [hpc[0] + 1, 7, hpc[2] + 7], l: [hpc[0] + 2, 0.5, hpc[2] - 3], fov: 55 };
      else cam = camKeys(t, [[E.pzDen, 60, 3.2, -3, 60, 1, -12, 50], [E.pzDen + 3.9, 60, 3.0, -3.6, 60, 1, -12, 48],
        [E.pzDen + 4, 60.6, 1.5, -8.8, 60.0, 0.8, -12.4, 46], [E.pzOffer - 0.1, 60.6, 1.4, -9.3, 60.0, 0.8, -12.4, 42],
        [E.pzOffer, 57.8, 2.0, -5.8, 61.6, 1.0, -9.6, 46], [E.pzOffer + 4.9, 58.0, 2.0, -6.2, 61.6, 1.1, -9.6, 42],
        [E.pzOffer + 5, 61.0, 2.2, -11.4, 62.6, 1.8, -7.6, 48], [E.pzClock - 0.1, 60.8, 2.2, -11.6, 62.4, 1.8, -7.6, 44],
        [E.pzClock, 57, 2.4, -3.8, 57.5, 1.6, -9, 46], [E.pzTurbo - 0.1, 57, 2.2, -4.6, 57.5, 1.6, -9, 40]]);
    } else {
      // ---- TURBO. (the fan blows pizza smell in front of Leggy's nose. she follows it. at 200 km/h.)
      const lp = [LPX(t), 0.5, 0]; poseLurk(L6, t, lp, PI / 2, t > E.pzTurbo + 3 ? 9 : 0.4); boxOnLeggy32();
      if (t > E.pzTurbo + 1.2) { hb32.fan.rotation.z = t * 40; L6.light.intensity = 4; L6.hd.rotation.set(-0.1, 0, 0); }
      if (t > E.pzTurbo + 2) L6.root.rotation.x = 0.18;
      ride32(t, { face: t > E.pzTurbo + 1.2 ? 'scared' : 'smug', panic: t > E.pzTurbo + 4, noBloop: true });
      if (win(t, E.pzTurbo + 0.5, E.pzTurbo + 1.4)) { hero.aR.rotation.set(-0.6, 0, 0); hero.hd.rotation.y = 1.6; }
      const bs = wpos32(seatB32); poseBurble(bloop6, t, bs, PI / 2, { angry: t > E.pzTurbo + 3 }); if (t > E.pzTurbo + 3.4) { bloop6.B.body.rotation.set(-0.3, 0, Math.sin(t * 20) * 0.08); bHat.visible = t < E.pzTurbo + 4.2; }
      if (t < E.pzTurbo + 3) cam = { p: [52, 4.2, -5.5], l: [49.6, 2.3, 0], fov: 44 };
      else if (t < E.pzZoom) cam = { p: [lp[0] - 9, 2.4, 5.5], l: [lp[0] + 2, 1.8, 0], fov: 62 };
      else if (t < E.pzZoom + 5) cam = { p: [lp[0] + 14, 1.2, 3.5], l: [lp[0], 1.8, 0], fov: 50 };
      else cam = { p: [196, 1.0, 3.5], l: [Math.min(lp[0], 194), 1.6, 0], fov: 55 };
    }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the end of the Long Road (night): a cave, a mailbox, a table set for one
const cave32 = (() => {
  const g = mk('cave32'); const st = new VSet(g);
  for (let x = -30; x <= 60; x++) for (let z = -26; z <= 20; z++) st.add(x, 0, z, (z >= 0 && z <= 3 && x > 4) ? 'path' : 'turf');
  for (let x = -14; x <= 14; x++) for (let z = -24; z <= -9; z++) { const h = Math.floor(9 - Math.abs(x) * 0.42 - Math.max(0, -z - 16) * 0.6 + hash2(x, z, 32) * 1.5); for (let y = 1; y <= h; y++) { if (Math.abs(x) <= 1 && y <= 3 && z >= -12) continue; st.add(x, y, z, 'stone'); } }
  for (let x = -1; x <= 1; x++) for (let y = 1; y <= 3; y++) st.add(x, y, -13, 'dark');
  for (const [x, z, h] of [[-20, -4, 5], [18, -8, 6], [-24, 10, 5], [22, 12, 5], [-12, 14, 6], [30, -14, 5], [40, 10, 5]]) tree29(st, x, z, h, 0);
  st.build();
  const cryL = new THREE.PointLight('#ff5cf0', 0, 10, 1.6); cryL.position.set(0, 2.2, -10.5); g.add(cryL);
  for (const [x, y, z, r] of [[-2.4, 1.3, -8.6, 0.3], [2.5, 1.0, -8.5, -0.4], [-3.2, 3.6, -8.7, 0.6], [3.0, 4.2, -8.8, -0.2], [0.2, 5.0, -8.9, 0.1], [0, 1.2, -11.5, 0.5], [-0.8, 3.2, -12.4, -0.3]]) { const c = box(0.4, 0.9, 0.4, 0, x, y, z, g, glow32('#ff5cf0', 0.9)); c.rotation.set(0.2, 0, r); }
  const door = pivot(g, 0, 0.5, -8.4); { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.5, 12), MAT.stone); m.rotation.x = PI / 2; m.position.y = 1.7; m.castShadow = true; door.add(m); }
  const mail = pivot(g, -3.8, 0.5, -6.0); box(0.15, 1.3, 0.15, '#5a3a22', 0, 0.65, 0, mail); box(0.6, 0.5, 0.9, '#2e6ac4', 0, 1.5, 0, mail); plane26(0.56, 0.2, txtMat26(['LEGGY'], 256, 96, '#ffffff', '#c0182a', 60), mail, 0, 1.5, 0.46);
  board28(['END OF THE', 'LONG ROAD'], 2.6, 1.1, g, 9, 2.4, -3.6, -0.3, '#f6e7c1', '#5a2a10', 384, 160, 50);
  const table = pivot(g, 0, 0.5, -2.8); box(2.4, 0.12, 1.6, '#c8955a', 0, 0.9, 0, table); box(2.5, 0.04, 1.7, '#ff5c5c', 0, 0.97, 0, table); for (const [x, z] of [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]]) box(0.12, 0.85, 0.12, '#8a5a2b', x, 0.42, z, table);
  const candle = pivot(table, -0.85, 1.0, -0.3); box(0.12, 0.3, 0.12, '#ffffff', 0, 0.15, 0, candle); const flame = box(0.1, 0.14, 0.1, 0, 0, 0.38, 0, candle, glow32('#ffb03a', 1)); const cL = new THREE.PointLight('#ffb050', 2.4, 7, 1.5); cL.position.set(0, 0.6, 0.3); candle.add(cL);
  const moonL = new THREE.PointLight('#9fb4ff', 1.5, 40, 1); moonL.position.set(0, 12, 10); g.add(moonL);
  dust32(E.pzEnd + 1.2, [8, 0.6, 1.2], 50); dust32(E.pzEnd + 1.6, [6.5, 0.6, 1.2], 30);
  burst(E.pzPay + 2.6, [1.6, 1.8, -4.2], { n: 40, colors: ['#ff5cf0', '#ffe066', '#ffffff'], speed: 2.4, size: 0.12, life: 1.2, grav: 2, up: 2 }); heart32(E.pzPay + 4, [1.6, 2.4, -4.2]);
  steam32(E.pzDinner + 1, E.pzGulp, [0, 1.9, -2.8]); crumbs32(E.pzGulp + 0.9, [0, 1.9, -3.9], 24); crumbs32(E.pzGulp + 3.6, [0, 1.9, -3.9], 20);
  for (let i = 0; i < 4; i++) burst(E.pzBlast + i * 0.12, [0, 3.2, 0.8], { n: 70, colors: ['#ff3d1a', '#ff9a2a', '#ffe066', '#ffffff'], speed: 9, size: 0.3, life: 1.4, grav: -1, up: 6 });
  smoke(E.pzBlast + 0.3, E.freeze + 0.2, 0.05, [0, 3.4, 0.9], { n: 4, colors: ['#ff3d1a', '#ff9a2a', '#ffe066'], speed: 2.4, size: 0.34, life: 0.9, grav: -6, up: 8 });
  // Leggy's path at the end of the road: skid in, nod, open the door, sit at her table, eat, ... run in circles
  const LT = [0, 0.5, -6.2], LA = [7.5, 0.5, 1.5], CC = [0, 0.5, 1.5];
  const LKc = [[E.pzEnd, 44, 0.5, 1.5], [E.pzEnd + 1.6, ...LA], [E.pzHers, ...LA], [E.pzHers + 1.5, 4.5, 0.5, -5.2], [E.pzHers + 3.0, 0.4, 0.5, -6.6], [E.pzHers + 4.4, ...LT]];
  function L32(t) { if (t < E.pzSteam) return LT; if (t < E.pzBlast) { const a = (t - E.pzSteam) * 1.4 - PI / 2; const r = 7.5 * ss(seg(t, E.pzSteam, E.pzSteam + 1.2)); return [CC[0] + Math.cos(a) * r * (t < E.pzSteam + 1.2 ? 0 : 1), 0.5, (t < E.pzSteam + 1.2 ? lerp(LT[2], CC[2] - 7.5, ss(seg(t, E.pzSteam, E.pzSteam + 1.2))) : CC[2] + Math.sin(a) * r)]; } return [0, 0.5, -1.0]; }
  steam32(E.pzSpicy + 3, E.pzBlast, t => [L32(t)[0] + Math.sin(t) * 0.3, 3.0, L32(t)[2]], 0.08);
  const H1 = [-3.4, 0.5, 0.8], B1 = [3.0, 0.5, 1.0], C1 = [4.6, 0.5, 2.2], BP = [1.6, 0.5, -4.2];
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    flame.scale.set(1, 1 + Math.sin(t * 17) * 0.3, 1); cL.intensity = 2.2 + Math.sin(t * 13) * 0.4;
    const dk = ss(seg(t, E.pzHers + 1.5, E.pzHers + 3)); door.position.set(dk * 3.6, 0.5, -8.4); door.rotation.z = 0; door.children[0].rotation.set(PI / 2, -dk * 2, 0); cryL.intensity = 3 * dk;
    mail.rotation.set(0, 0, t > E.pzSteam + 3.5 ? -1.45 * ss(seg(t, E.pzSteam + 3.5, E.pzSteam + 4)) : 0);
    table.visible = t < E.pzSteam + 1.0 || t > 1e9; if (t >= E.pzSteam + 0.6 && t < E.pzSteam + 1.0) table.rotation.z = (t - E.pzSteam - 0.6) * 4;
    else table.rotation.z = 0;
    // ---- Leggy
    let lp, ly, sp = 0.4;
    if (t < E.pzSteam) { const w = walker(t, LKc); lp = w.p; ly = w.speed > 0.05 ? w.yaw : (t < E.pzHers ? (t > E.pzWho + 2 ? faceTo(LA, [1.0, 0, -4]) : -PI / 2) : 0); sp = w.speed > 0.05 ? 2.4 : 0.4; if (t < E.pzEnd + 1.6) { ly = -PI / 2; sp = 6; } }
    else { lp = L32(t); const d = 0.05; const q = L32(t + d); ly = t < E.pzBlast ? Math.atan2(q[0] - lp[0], q[2] - lp[2]) : 0; sp = t < E.pzBlast ? 9 : 0.4; }
    poseLurk(L6, t, lp, ly, sp);
    if (t < E.pzEnd + 1.6) L6.root.rotation.z = -0.15 * (1 - seg(t, E.pzEnd + 1.0, E.pzEnd + 1.6));
    if (win(t, E.pzWho + 4.8, E.pzWho + 7.5)) L6.hd.rotation.set(Math.abs(Math.sin(t * 7)) * 0.4, 0, 0);
    if (t >= E.pzHers + 4.4 && t < E.pzSteam) { L6.body.position.y = 1.0; bib32.visible = t > E.pzHers + 6; }
    if (win(t, E.pzFree + 4, E.pzDinner)) L6.root.position.y += Math.abs(Math.sin(t * 7)) * 0.25;
    if (win(t, E.pzGulp + 0.6, E.pzGulp + 2.8)) L6.body.scale.set(1.25, 1.25, 1.12);
    if (win(t, E.pzGulp + 3.4, E.pzGulp + 5)) L6.body.scale.set(1.2, 1.3, 1.1);
    const spicy = t >= E.pzSpicy + 1.6, rk = ss(seg(t, E.pzSpicy + 1.6, E.pzSpicy + 3));
    if (spicy) { if (cryM32) cryM32.color.set('#' + new THREE.Color('#ff5cf0').lerp(new THREE.Color('#ff2a10'), rk).getHexString()); if (eyeM32) eyeM32.color.set('#' + new THREE.Color('#5ff7ff').lerp(new THREE.Color('#ff3020'), rk).getHexString()); L6.light.color.set('#ff4020'); L6.light.intensity = 2 + rk * 3; }
    if (win(t, E.pzSpicy + 3, E.pzSteam)) { L6.root.position.x += Math.sin(t * 60) * 0.06; L6.hd.rotation.set(0, Math.sin(t * 30) * 0.15, 0); }
    if (t >= E.pzBlast) { L6.root.rotation.x = -0.55 * ss(seg(t, E.pzBlast - 0.3, E.pzBlast + 0.1)); L6.hd.rotation.set(-0.3, 0, 0); }
    // ---- the Hot-Box: on her back → on the table → (gulp)
    if (t < E.pzHers + 5) boxOnLeggy32();
    else if (t < E.pzGulp + 3) { const TB = [0, 1.47, -2.8]; if (t < E.pzHers + 6) { const s = wpos32(backC32); boxAt32(g, arcPath(t, [[E.pzHers + 5, s[0], s[1] - 0.45, s[2], 0], [E.pzHers + 6, ...TB, 1.6]]), PI / 2); } else boxAt32(g, TB, PI / 2);
      hb32.lid.rotation.x = -1.9 * ss(seg(t, E.pzDinner + 0.5, E.pzDinner + 1.1));
      if (t > E.pzGulp + 0.4) { const k = seg(t, E.pzGulp + 0.4, E.pzGulp + 0.9); hb32.pz.g.position.set(k * 1.1, 0.42 + k * 0.6, 0); hb32.pz.g.scale.setScalar(Math.max(0.01, 1 - k)); hb32.pz.g.rotation.y = k * 6; }
      if (t > E.pzGulp + 3 - 0.6) { const k = seg(t, E.pzGulp + 2.4, E.pzGulp + 3); hbox32.position.set(0, 1.47 + k * 0.5, -2.8 - k * 1.1); hbox32.scale.setScalar(Math.max(0.01, 1 - k)); hbox32.rotation.set(k * 3, 0, 0); } }
    // ---- me
    const HK = [[E.pzEnd + 2.4, ...wpos32(seatH32)], [E.pzEnd + 3.2, 4.5, 0.5, -0.5], [E.pzKnock - 1, 0.3, 0.5, -7.2], [E.pzKnock + 4, 0.3, 0.5, -7.2], [E.pzWho - 0.4, -2.8, 0.5, -4.6], [E.pzWho + 3.2, -2.8, 0.5, -4.6], [E.pzWho + 5, ...H1]];
    if (t < E.pzEnd + 2.4) ride32(t, { face: 'scared', panic: t < E.pzEnd + 1.6, noBloop: true });
    else if (t < E.pzBlast + 0.3) { const w = walker(t, HK.slice(1)); let p = t < E.pzEnd + 3.2 ? arcPath(t, [[E.pzEnd + 2.4, ...wpos32(seatH32), 0], [E.pzEnd + 3.2, 4.5, 0.5, -0.5, 1]]) : w.p, o = { face: 'normal', yaw: w.speed > 0.05 ? w.yaw : 0, walk: w.walk, phase: w.phase };
      if (win(t, E.pzKnock - 1, E.pzKnock + 4)) { o = { face: 'smug', yaw: PI }; if (t > E.pzKnock) o.swing = (t - E.pzKnock) * 1.6; if (t > E.pzKnock + 3) o.face = 'normal'; }
      if (win(t, E.pzWho - 0.4, E.pzHers)) { o = { face: t > E.pzWho + 2.6 ? 'scared' : 'normal', yaw: t > E.pzWho + 2.6 ? faceTo(p, LA) : faceTo(p, [-3.8, 0, -6.0]) }; }
      if (t >= E.pzHers) { o = { face: t < E.pzHers + 4 ? 'scared' : 'normal', yaw: faceTo(H1, [0, 0, -3.5]) };
        if (win(t, E.pzChef2 + 1, E.pzFree)) o = { face: 'scared', yaw: faceTo(H1, C1) };
        if (win(t, E.pzFree, E.pzDinner)) o = { face: 'scared', yaw: faceTo(H1, C1), hold: true };
        if (t >= E.pzGulp + 1) o = { face: 'scared', yaw: faceTo(H1, [0, 0, -3.5]) };
        if (t >= E.pzSpicy + 3) o = { face: 'scared', yaw: faceTo(H1, lp), panic: true }; }
      pose(hero, { t, p, ...o }); }
    else { const k = ss(seg(t, E.pzBlast + 0.3, E.freeze)), pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); pose(hero, { t, p: [lerp(H1[0], -9, pk), lerp(0.5, 9.5, pk), lerp(H1[2], 4, pk)], yaw: 0.4, face: 'scared', panic: true, spin: k * 5 }); hero.body.rotation.z = k * 2; }
    // ---- Bloop: gets PAID. by Leggy.
    const BKc = [[E.pzEnd + 2.6, 6.0, 0.5, 4.2], [E.pzHers, 6.0, 0.5, 4.2], [E.pzHers + 3, ...B1], [E.pzPay, ...B1], [E.pzPay + 1.6, ...BP], [E.pzPay + 8.5, ...BP], [E.pzChef2 + 1, ...B1]];
    if (t < E.pzEnd + 2.6) { const s = wpos32(seatB32); if (t < E.pzEnd + 1.8) poseBurble(bloop6, t, s, ly, { angry: true }); else poseBurble(bloop6, t, arcPath(t, [[E.pzEnd + 1.8, ...s, 0], [E.pzEnd + 2.6, 6.0, 0.5, 4.2, 1]]), ly, {}); }
    else if (t < E.pzBlast + 0.3) { const w = walker(t, BKc); let o = { walk: w.speed > 0.05, phase: w.phase * 2 }, yaw = w.speed > 0.05 ? w.yaw : faceTo(w.p, [0, 0, -3.5]);
      if (win(t, E.pzPay + 1.6, E.pzPay + 8.5)) { yaw = faceTo(BP, [0, 0, -4.4]); o.handOut = t < E.pzPay + 3.6; o.hop = t > E.pzPay + 3.6; }
      if (win(t, E.pzWho + 2.6, E.pzHers)) yaw = faceTo(w.p, LA);
      if (t >= E.pzSpicy + 3) o.angry = true;
      poseBurble(bloop6, t, w.p, yaw, o); inv32.visible = win(t, E.pzPay + 1.2, E.pzPay + 3.0);
      if (t > E.pzPay + 3.0 && t < E.pzBlast) { gem32.visible = true; parentTo(gem32, g); const hp = wpos32(bloop6.B.aR); gem32.position.set(hp[0], hp[1] - 0.6, hp[2]); gem32.rotation.y = t * 2; }
      if (win(t, E.pzPay + 2.2, E.pzPay + 3.0)) { gem32.visible = true; const hp = wpos32(bloop6.B.aR); gem32.position.set(...arcPath(t, [[E.pzPay + 2.2, 0, 2.6, -6.8, 0], [E.pzPay + 3.0, hp[0], hp[1] - 0.6, hp[2], 1.2]])); } }
    else { const pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); poseBurble(bloop6, t, [lerp(B1[0], 8, pk), lerp(0.5, 10, pk), lerp(B1[2], 3, pk)], -0.5, { angry: true }); bloop6.B.root.rotation.z = -pk * 2.5; bHat.position.y = 1.2 + pk * 1.2; }
    // ---- Chef Crustino: arrives with a stopwatch. "LATE. IT IS FREE."
    if (t >= E.pzChef2) { if (t < E.pzBlast + 0.3) { const cA = act32(t, [[E.pzChef2, 30, 0.5, 3], [E.pzChef2 + 3.4, ...C1]], [[E.pzChef2, { watch: true }], [E.pzChef2 + 3.4, { watch: true, point: true, talk: true }], [E.pzFree, { watch: true, angry: true, talk: true }], [E.pzFree + 2, { serve: true }], [E.pzFree + 4, { talk: true }], [E.pzGulp + 1, { wide: true }], [E.pzSpicy + 3, { flail: true, wide: true }]]);
        poseChef32(chef32, t, cA.p, cA.walk ? cA.yaw : faceTo(C1, t > E.pzGulp ? [0, 0, -3.5] : H1), { ...cA, walk: cA.walk ? 1.4 : (cA.flail ? 0 : 0) }); }
      else { const pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); poseChef32(chef32, t, [lerp(C1[0], 12, pk), lerp(0.5, 7, pk), lerp(C1[2], 5, pk)], -0.8, { flail: true, wide: true, spin: -pk * 1.6 }); chef32.hat.position.y = 1.8 + pk * 1.5; } }
    else chef32.hat.position.y = 1.8;
    if (t < E.pzBlast + 0.3) chef32.hat.position.y = 1.8;
    // ---- coins: me → chef (it's FREE. for HER.)
    coins32.forEach((c, i) => { const s = E.pzFree + 1.2 + i * 0.3; if (!win(t, s, s + 0.9)) return; c.visible = true; c.position.set(...arcPath(t, [[s, H1[0] + 0.5, 1.9, H1[2] + 0.3, 0], [s + 0.9, C1[0] - 0.5, 1.6, C1[2], 1.6]])); c.rotation.y = t * 9; });
    // ---- cameras
    const CC2 = [[E.pzEnd, 8, 2.2, 9, 6, 1.4, 0, 52], [E.pzEnd + 2.9, 8.5, 2.2, 8, 6, 1.4, 0, 50],
      [E.pzEnd + 3, 10, 5, 14, 0, 2, -6, 50], [E.pzKnock - 0.1, 9, 4.6, 12.5, 0, 2, -6, 48],
      [E.pzKnock, 3.4, 2.8, -2.8, 0, 1.9, -8.6, 50], [E.pzKnock + 3.9, 3.2, 2.7, -3.2, 0, 1.9, -8.6, 46],
      [E.pzKnock + 4, -4, 3, 6, 0, 1.6, -6, 50], [E.pzWho - 0.1, -3.6, 3, 5, 0, 1.6, -6, 48],
      [E.pzWho, -4.4, 2.1, -3.9, -3.8, 1.95, -6.0, 40], [E.pzWho + 2.9, -4.3, 2.1, -4.3, -3.8, 1.95, -6.0, 34],
      [E.pzWho + 3, -3.6, 2.5, -6.4, 7.5, 1.8, 1.5, 44], [E.pzHers - 0.1, -3.4, 2.4, -6.0, 7.5, 1.8, 1.5, 40],
      [E.pzHers, -6, 4.2, 9, 2, 1.5, -4, 50], [E.pzHers + 3.9, -5.4, 3.8, 8.2, 2, 1.5, -4, 48],
      [E.pzHers + 4, 0, 2.6, 4.2, 0, 1.8, -4, 46], [E.pzPay - 0.1, 0, 2.5, 3.6, 0, 1.8, -4, 44],
      [E.pzPay, 3.8, 2.5, -1.2, 0.8, 1.8, -4.6, 44], [E.pzPay + 3.9, 3.6, 2.4, -1.4, 0.8, 1.8, -4.6, 42],
      [E.pzPay + 4, 3.6, 2.4, 0.4, 1.6, 1.5, -4.2, 46], [E.pzChef2 - 0.1, 3.6, 2.3, 0.1, 1.6, 1.5, -4.2, 42],
      [E.pzChef2, 6, 3.4, 12, 8, 1.5, 1, 55], [E.pzChef2 + 3.4, 5, 3.2, 11, 5, 1.5, 1.5, 52],
      [E.pzChef2 + 3.5, 2.0, 2.6, 7.5, 4.6, 2.0, 2.2, 46], [E.pzFree - 0.1, 2.2, 2.6, 7.0, 4.6, 2.0, 2.2, 42],
      [E.pzFree, 0.5, 2.6, 7.5, 0.8, 1.6, 1.6, 56], [E.pzFree + 3.9, 0.5, 2.6, 7.2, 0.8, 1.6, 1.6, 54],
      [E.pzFree + 4, 0, 2.2, 1.6, 0, 1.8, -4, 44], [E.pzDinner - 0.1, 0, 2.2, 1.4, 0, 1.8, -4, 42],
      [E.pzDinner, 0, 2.9, 2.4, 0, 1.8, -3.8, 44], [E.pzGulp - 0.1, 0, 2.7, 0.6, 0, 1.8, -3.8, 38],
      [E.pzGulp, 3.4, 2.6, 0.6, 0, 1.8, -3.6, 46], [E.pzGulp + 3.9, 3.2, 2.6, 0.4, 0, 1.8, -3.6, 44],
      [E.pzGulp + 4, 0, 2.8, 6.5, 0, 1.6, -2.5, 52], [E.pzSpicy - 0.1, 0, 2.7, 6.0, 0, 1.6, -2.5, 50],
      [E.pzSpicy, 0, 2.0, -0.6, 0, 1.9, -4.0, 44], [E.pzSpicy + 4.9, 0, 2.0, -1.0, 0, 1.9, -4.0, 38],
      [E.pzSpicy + 5, 0, 3.8, 9, 0, 1.6, -3, 52], [E.pzSteam - 0.1, 0, 3.6, 8.4, 0, 1.6, -3, 50],
      [E.pzSteam, 0, 11, 17, 0, 0.5, 0, 55], [E.pzSteam + 5.9, 2, 10, 16, 0, 0.5, 0, 55]];
    let cam = camKeys(t, CC2);
    if (win(t, E.pzSteam + 6, E.pzBlast)) cam = { p: [0, 1.6, 3.0], l: [lp[0], 1.6, lp[2]], fov: 60 };
    if (t >= E.pzBlast) cam = { p: [0, 3.0, 20 + ss(seg(t, E.pzBlast, E.freeze)) * 2], l: [0, 4.6, -1], fov: 58 };
    return { cam, hud: true };
  }
  return { g, update };
})();
