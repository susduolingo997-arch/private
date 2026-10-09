// ---------------------------------------------------------------- Ep 28 helpers: the Dragon Egg, Pip, Mama Ember + the clutch, Bloop's Egg-Cart, the egg-warmth meter
function board28(lines, w, h, parent, x, y, z, ry = 0, bg = '#f6e7c1', fg = '#8a1020', cw = 512, ch = 192, size = 54, posts = true) { const p = pivot(parent, x, 0, z); p.rotation.y = ry; const mat = txtMat26(lines, cw, ch, bg, fg, size);
  box(w + 0.3, h + 0.3, 0.2, '#5a3a22', 0, y, 0, p); plane26(w, h, mat, p, 0, y, 0.11); plane26(w, h, mat, p, 0, y, -0.11, PI);
  if (posts) for (const s of [-1, 1]) box(0.25, y, 0.25, '#5a3a22', s * w * 0.35, y / 2, 0, p); return p; }
function card28(lines, bg, fg, size = 32) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), txtMat26(lines, 192, 112, bg, fg, size)); m.material.side = THREE.DoubleSide; const gr = new THREE.Group(); gr.add(m); return gr; }
const HA28 = z => z <= 24 ? clamp(Math.floor((z - 13) / 2), 0, 4) : clamp(Math.floor((35 - z) / 2), 0, 4);
const gA28 = z => 0.5 + HA28(Math.round(z)), cA28 = z => 0.5 + clamp(z <= 24 ? (z - 14) / 2 : (34 - z) / 2, 0, 4);
const hatW28 = P => [P[0], P[1] + 2.62, P[2]];
// ---- the egg (speckled, warm, wobbly) — top half pops off when it hatches
const crackM28 = new THREE.MeshBasicMaterial({ color: '#2a1408' });
function makeEgg28(col = '#fff0d0', spot = '#ff7a3a') { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), top = pivot(body, 0, 0.42, 0);
  const em = new THREE.MeshLambertMaterial({ color: col, emissive: '#ff8a2a', emissiveIntensity: 0.16 }), sm = new THREE.MeshLambertMaterial({ color: spot, emissive: spot, emissiveIntensity: 0.35 });
  box(0.46, 0.12, 0.46, 0, 0, 0.06, 0, body, em); box(0.62, 0.3, 0.62, 0, 0, 0.27, 0, body, em);
  box(0.6, 0.18, 0.6, 0, 0, 0.09, 0, top, em); box(0.48, 0.16, 0.48, 0, 0, 0.26, 0, top, em); box(0.28, 0.1, 0.28, 0, 0, 0.39, 0, top, em);
  for (const [x, y, z, p] of [[0.27, 0.24, 0.12, body], [-0.27, 0.3, -0.12, body], [0.08, 0.3, 0.27, body], [-0.14, 0.1, -0.26, top], [0.18, 0.12, 0.26, top], [0.22, 0.24, -0.08, top]]) box(0.12, 0.12, 0.12, 0, x, y, z, p, sm);
  const cracks = []; for (const [x, y, r] of [[-0.17, 0.42, 0.6], [0, 0.4, -0.6], [0.17, 0.43, 0.6]]) for (const zz of [0.315, -0.315]) { const c = box(0.2, 0.04, 0.02, 0, x, y, zz, body, crackM28); c.rotation.z = r; cracks.push(c); }
  root.traverse(o => { if (o.isMesh) o.castShadow = !cracks.includes(o); }); return { root, body, top, cracks }; }
function poseEgg28(e, t, p, o = {}) { e.root.position.set(...p); e.root.rotation.set(o.rx || 0, o.yaw || 0, o.rz || 0); e.root.scale.setScalar(o.s ?? 0.8); e.body.rotation.set(0, 0, o.wobble ? Math.sin(t * 22 + (o.seed || 0)) * 0.2 * o.wobble : 0);
  e.cracks.forEach(c => c.visible = !!o.crack); const k = o.hatch || 0; e.top.position.set(k * 0.4, 0.42 + k * 1.6 - k * k * 1.1, 0); e.top.rotation.set(0, 0, -k * 2.4); e.top.visible = k < 0.98; e.root.visible = o.vis !== false; }
// ---- dragons: one model, three sizes (Pip, the five babies, Mama Ember)
function makeDragon28(s, col, belly) { const root = new THREE.Group(), body = pivot(root, 0, 1.05, 0), dk = shade(col, 0.7);
  box(1.2, 1.0, 1.8, col, 0, 0, 0, body); box(1.24, 0.42, 1.5, belly, 0, -0.32, 0.1, body); for (let i = 0; i < 4; i++) box(0.14, 0.26, 0.2, '#ffd23f', 0, 0.6, 0.6 - i * 0.45, body);
  const neck = pivot(body, 0, 0.35, 0.75); box(0.6, 1.0, 0.6, col, 0, 0.45, 0.05, neck); box(0.5, 0.8, 0.12, belly, 0, 0.42, 0.33, neck);
  const hd = pivot(neck, 0, 0.95, 0.1); box(0.92, 0.76, 0.9, col, 0, 0.12, 0.1, hd); box(0.62, 0.36, 0.55, col, 0, 0.02, 0.78, hd);
  const jaw = pivot(hd, 0, -0.22, 0.4); box(0.58, 0.16, 0.7, dk, 0, -0.04, 0.3, jaw); box(0.5, 0.06, 0.1, '#ffffff', 0, 0.06, 0.6, jaw);
  for (const x of [-0.14, 0.14]) box(0.08, 0.08, 0.04, '#2a1408', x, 0.1, 1.06, hd);
  const eyeW = new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupils = [];
  for (const x of [-0.27, 0.27]) { box(0.24, 0.26, 0.05, 0, x, 0.26, 0.56, hd, eyeW); pupils.push(box(0.12, 0.16, 0.05, '#1a1020', x, 0.24, 0.585, hd)); }
  const lids = [-0.27, 0.27].map(x => box(0.28, 0.12, 0.07, col, x, 0.45, 0.57, hd));
  for (const x of [-0.3, 0.3]) { const h = box(0.14, 0.42, 0.14, '#ffd23f', x, 0.62, -0.12, hd); h.rotation.x = -0.45; }
  const flame = pivot(hd, 0, 0.0, 1.1), fl = [['#ff5a1a', 0.5, 0.25], ['#ff9a2a', 0.36, 0.7], ['#ffe066', 0.24, 1.05]].map(([c, sz, z]) => box(sz, sz, sz * 1.4, 0, 0, 0, z, flame, new THREE.MeshBasicMaterial({ color: c })));
  const wings = [-1, 1].map(sd => { const w = pivot(body, sd * 0.6, 0.45, 0.1); box(1.5, 0.08, 1.0, dk, sd * 0.75, 0, 0, w); box(1.2, 0.06, 0.5, belly, sd * 0.75, -0.04, -0.55, w); return w; });
  const tail = pivot(body, 0, -0.05, -0.9); box(0.55, 0.45, 1.0, col, 0, 0, -0.45, tail); const tail2 = pivot(tail, 0, 0, -0.95); box(0.34, 0.3, 0.9, col, 0, 0, -0.4, tail2); box(0.5, 0.12, 0.4, '#ffd23f', 0, 0, -0.9, tail2);
  const legs = [[-0.42, 0.55], [0.42, 0.55], [-0.42, -0.55], [0.42, -0.55]].map(([x, z]) => { const l = pivot(body, x, -0.5, z); box(0.36, 0.56, 0.4, dk, 0, -0.27, 0.02, l); return l; });
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = !fl.includes(o); });
  return { root, body, neck, hd, jaw, flame, fl, wings, tail, tail2, legs, pupils, lids, s }; }
function poseDragon28(d, t, p, yaw, o = {}) { const sd = o.seed || 0; d.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + sd)) * 0.5 * d.s : 0), p[2]); d.root.rotation.set(o.pitch || 0, yaw, o.roll || 0);
  d.body.position.y = 1.05 + Math.sin(t * 2.2 + sd) * 0.03 + (o.walk ? Math.abs(Math.sin(t * 7)) * 0.06 : 0) - (o.crouch || 0) * 0.35; d.body.rotation.set(-(o.rear || 0) * 0.5, 0, 0);
  const a = o.flap ? Math.sin(t * (8 + o.flap * 6) + sd) * 0.95 : 0.85 + Math.sin(t * 1.5 + sd) * 0.05; d.wings.forEach((w, i) => w.rotation.set(0, 0, (i ? 1 : -1) * a));
  d.neck.rotation.set(-(o.neckUp || 0) * 0.5 + (o.neckDown || 0), o.neckYaw || 0, 0);
  d.hd.rotation.set((o.headPitch || 0) + (o.roar ? -0.4 : 0), o.headYaw || 0, o.headRoll || 0);
  const fk = o.fire || 0; d.jaw.rotation.x = o.roar || fk > 0.05 ? 0.55 + Math.sin(t * 30) * 0.05 : o.chew ? Math.abs(Math.sin(t * 10)) * 0.4 : 0;
  d.tail.rotation.set(0.15, Math.sin(t * 1.8 + sd) * 0.3 + (o.tailSwing || 0), 0); d.tail2.rotation.set(-0.1, Math.sin(t * 1.8 + sd - 0.8) * 0.35, 0);
  d.legs.forEach((l, i) => l.rotation.set(o.walk ? Math.sin(t * 7 + (i === 0 || i === 3 ? 0 : PI)) * 0.5 : o.fly ? 0.7 : 0, 0, 0));
  d.flame.visible = fk > 0.02; d.flame.scale.set(fk * (0.85 + 0.2 * Math.sin(t * 40)), fk * (0.85 + 0.2 * Math.cos(t * 37)), fk * (o.fireLen || 1)); d.fl.forEach((m, i) => m.rotation.z = t * (3 + i));
  d.pupils.forEach(m => m.scale.set(o.wide ? 1.5 : 1, o.wide ? 1.5 : o.narrow ? 0.4 : 1, 1)); d.lids.forEach(m => m.position.y = o.narrow ? 0.36 : o.happy ? 0.3 : 0.45); }
const pip28 = makeDragon28(0.26, '#3ad6a0', '#ffd27a'), mama28 = makeDragon28(3.0, '#c0283a', '#ffb050');
const mamaL28 = new THREE.PointLight('#ff7a2a', 0, 40, 1.3); mamaL28.position.set(0, 0, 2.2); mama28.hd.add(mamaL28);
const babies28 = ['#ff8ac0', '#6ab0ff', '#ffd23f', '#9a7aff', '#7cff6b'].map(c => makeDragon28(0.2, c, '#fff0c8'));
const egg28 = makeEgg28(), clutch28 = [['#fff0f6', '#ff5ca8'], ['#eef6ff', '#3a8aff'], ['#fffbe0', '#e0a800'], ['#f4eeff', '#7a4aff'], ['#efffe8', '#2ab04a']].map(([c, s]) => makeEgg28(c, s));
// ---- Bloop's Egg-Cart (a padded wheelbarrow with a heat lamp. what could go wrong)
const lampM28 = new THREE.MeshBasicMaterial({ color: '#ffd080' });
function makeCart28() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(1.3, 0.12, 1.5, '#8a5a2b', 0, 0.7, 0, body); for (const [w, d, x, z] of [[0.12, 1.5, -0.6, 0], [0.12, 1.5, 0.6, 0], [1.3, 0.12, 0, 0.7], [1.3, 0.12, 0, -0.7]]) box(w, 0.4, d, '#a06a3a', x, 0.95, z, body);
  box(1.1, 0.14, 1.3, '#ff9ecb', 0, 0.8, 0, body);
  const wheel = pivot(body, 0, 0.32, 0.95); box(0.14, 0.62, 0.62, '#2a2a30', 0, 0, 0, wheel); box(0.16, 0.24, 0.24, '#c0c0c8', 0, 0, 0, wheel); box(0.1, 0.5, 0.1, '#5a3a22', 0, 0.55, 0.85, body);
  for (const x of [-0.5, 0.5]) { box(0.1, 0.1, 1.1, '#5a3a22', x, 0.75, -1.15, body); box(0.1, 0.5, 0.1, '#5a3a22', x, 0.45, -0.55, body); }
  box(0.08, 1.4, 0.08, '#c0c0c8', 0.55, 1.5, -0.55, body); box(0.08, 0.08, 0.7, '#c0c0c8', 0.55, 2.2, -0.25, body);
  const lamp = box(0.36, 0.26, 0.36, 0, 0.55, 2.05, 0.1, body, lampM28); const light = new THREE.PointLight('#ffb050', 0, 8, 1.5); light.position.set(0.55, 1.8, 0.1); body.add(light);
  plane26(1.2, 0.34, txtMat26(['EGG-CART'], 256, 72, '#2ec4b6', '#ffffff', 44), body, 0, 0.95, -0.77, PI);
  root.traverse(o => { if (o.isMesh) o.castShadow = o !== lamp; });
  const fire = new THREE.Group(); body.add(fire); fire.position.set(0, 1.0, 0); const fl = ['#ff5a1a', '#ff8a2a', '#ffd23f', '#ff5a1a', '#ff8a2a'].map((c, i) => box(0.4, 0.5, 0.4, 0, (i - 2) * 0.28, 0.2 + (i % 2) * 0.2, (i % 3 - 1) * 0.3, fire, new THREE.MeshBasicMaterial({ color: c })));
  fl.forEach(m => m.castShadow = false); return { root, body, wheel, lamp, light, fire, fl }; }
const cart28 = makeCart28();
// ---- props: invoices, the fireberry, the gold block, the fireball (hiccup), the hat fire
const inv28a = card28(['INVOICE', '1 EGG-CART'], '#ffffff', '#c0182a'), inv28b = card28(['INVOICE', '1 EGG DELIVERY'], '#ffffff', '#c0182a', 26), inv28c = card28(['BABYSITTING', 'PER HOUR'], '#ffffff', '#c0182a', 28), inv28d = card28(['INVOICE', '1 HAT (toast)'], '#ffffff', '#c0182a', 28);
for (const c of [inv28a, inv28b, inv28c, inv28d]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const invM28 = inv28a.children[0].material, burntM28 = new THREE.MeshBasicMaterial({ color: '#1a1410', side: THREE.DoubleSide });
const berry28 = new THREE.Group(); { box(0.26, 0.26, 0.26, 0, 0, 0, 0, berry28, new THREE.MeshLambertMaterial({ color: '#ff2a3a', emissive: '#c0101a', emissiveIntensity: 0.5 })); box(0.12, 0.08, 0.12, '#3cc26a', 0, 0.16, 0, berry28); } L6.hd.add(berry28); berry28.position.set(0, -0.35, 1.05);
const berryBurnt28 = box(0.28, 0.28, 0.28, '#1a1410', 0, 0, 0, berry28);
const gold28 = new THREE.Mesh(GEO, MAT.goldblk); gold28.scale.setScalar(0.45);
const fb28 = new THREE.Group(); { box(0.34, 0.34, 0.34, 0, 0, 0, 0, fb28, new THREE.MeshBasicMaterial({ color: '#ff7a1a' })); box(0.2, 0.2, 0.2, 0, 0, 0, 0.12, fb28, new THREE.MeshBasicMaterial({ color: '#ffe066' })); const l = new THREE.PointLight('#ff8a2a', 6, 8, 1.5); fb28.add(l); }
function shoot28(t, g, L) { fb28.visible = false; for (const [t0, d, a, b] of L) if (win(t, t0, t0 + d)) { parentTo(fb28, g); fb28.visible = true; fb28.position.set(...L3(a, b, seg(t, t0, t0 + d))); fb28.rotation.set(t * 9, t * 7, 0); } }
const hatFire28 = new THREE.Group(); capHat.add(hatFire28); hatFire28.position.y = 0.32; const hfl28 = [['#ff5a1a', 0.5, 0, 0], ['#ff8a2a', 0.36, 0.18, 0.3], ['#ffd23f', 0.24, -0.1, 0.55], ['#ff5a1a', 0.3, 0.22, 0.2], ['#ff8a2a', 0.28, -0.2, 0.25]].map(([c, s, x, y]) => box(s, s, s, 0, x, y, 0, hatFire28, new THREE.MeshBasicMaterial({ color: c })));
hfl28.forEach(m => m.castShadow = false);
function hide28() { hide25(); [owl.root, rex.root, cart26, vaseA, vaseB, vaseShards, rexPile, boneT, skullF, paintP, egg28.root, cart28.root, pip28.root, mama28.root, fb28, inv28a, inv28b, inv28c, inv28d, berry28, gold28, hatFire28, ...babies28.map(b => b.root), ...clutch28.map(e => e.root)].forEach(o => o.visible = false); mamaL28.intensity = 0; }
function pipAt28(t, parent, p, yaw, sc, o) { parentTo(pip28.root, parent); pip28.root.visible = true; poseDragon28(pip28, t, p, yaw, o); pip28.root.scale.setScalar(sc); }
// ---- HUD: egg warmth (Act 1-2) → what is on my head (Act 2-3)
const EGGT28 = [0, 1, 2, 3, 4].map(i => E.dgStack + i * 1.5);
function warm28(t) { return lerpK([[E.dgGo, 0.5], [E.dgCold, 0.5], [E.dgCold + 2.5, 0.14], [E.dgCold + 4.5, 0.55], [E.dgBump, 0.52], [E.dgBump + 4, 0.3], [E.dgCatch + 1, 0.5], [E.dgLamp + 1, 0.55], [E.dgHot, 0.82], [E.dgFire, 1], [E.dgFire + 1.6, 0.52], [E.dgWobble, 0.55], [E.dgHatch, 0.62]], t); }
function drawEggHUD28(t) { if (t >= E.freeze || t < E.dgGo - 1) return;
  rrect(22, 96, 240, 112, 12); ctx.fillStyle = 'rgba(30,16,12,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff9a2a'; ctx.stroke();
  if (t < E.dgHatch) { const w = warm28(t), lab = w < 0.25 ? 'TOO COLD' : w > 0.78 ? 'TOO HOT!' : 'JUST RIGHT', col = w < 0.25 ? '#6ab0ff' : w > 0.78 ? '#ff4a2a' : '#7cff6b', fl = lab !== 'JUST RIGHT' && Math.floor(t * 4) % 2;
    outlined('EGG WARMTH', 142, 114, 15, '#ffd27a', '#000', 3);
    const gr = ctx.createLinearGradient(40, 0, 244, 0); gr.addColorStop(0, '#3a7aff'); gr.addColorStop(0.5, '#7cff6b'); gr.addColorStop(1, '#ff3a1a'); rrect(40, 132, 204, 16, 7); ctx.fillStyle = gr; ctx.fill();
    const x = 40 + 204 * clamp(w, 0, 1); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, 126, 6, 28); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(x - 3, 126, 6, 28);
    outlined(lab, 142, 170, 20, fl ? '#ffffff' : col, '#000', 4); outlined(t >= E.dgFire + 1.6 ? 'incubator: my hat' : t >= E.dgFire ? 'incubator: ON FIRE' : 'incubator: Egg-Cart', 142, 194, 13, '#fff', '#000', 3); return; }
  const eggs = win(t, E.dgStack, E.dgHatchAll) ? EGGT28.filter(a => t >= a + 0.9).length : 0, drag = t < E.dgFly ? 1 : t >= E.dgHatchAll ? 5 : 0, burn = t >= E.dgHic3 + 0.4, fl = Math.floor(t * 4) % 2;
  outlined('ON MY HEAD', 142, 114, 15, '#ffd27a', '#000', 3);
  outlined(eggs ? eggs + (eggs > 1 ? ' eggs' : ' egg') : drag ? drag + (drag > 1 ? ' dragons' : ' dragon') : 'nothing. (sad)', 142, 144, 24, eggs ? '#fff0d0' : drag ? '#7cff6b' : '#aaaaaa', '#000', 5);
  outlined(burn ? 'HAT: ON FIRE' : eggs > 3 ? 'HAT: wobbly' : 'HAT: fine', 142, 180, 18, burn ? (fl ? '#ff3a1a' : '#ffe066') : '#ffffff', '#000', 4); }
function drawHeat28(T) { const on = win(T, E.dgChase + 0.6, E.dgChase + 1.8) || win(T, E.dgChase + 5, E.dgChase + 6.2) || win(T, E.dgChase + 8.5, E.dgChase + 9.7) || win(T, E.dgHic3, E.dgHic3 + 0.8);
  if (!on) return; const gr = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9); gr.addColorStop(0, 'rgba(255,120,20,0)'); gr.addColorStop(1, `rgba(255,90,10,${0.35 + 0.1 * Math.sin(T * 30)})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }

// ================================================================ EPISODE 28: "THE DRAGON EGG (it hatched in my hat)" — Whisperwood meadow (Leggy sniffs out an egg; LOST: 1 EGG; the Egg-Cart; the runaway egg; the lamp goes to MAX; incubator: my hat) → the Cinder Trail at sunset (it hatches; Pip thinks I'm his mom; fire hiccups; Leggy's flying lesson) → Ember Peak at night (Mama Ember; the chase; Pip flies; paid in gold; dawn; five more eggs. on my hat.)
// ---------------------------------------------------------------- set A: Whisperwood meadow (morning)
const meadow = (() => {
  const g = mk('meadow'); const st = new VSet(g);
  for (let x = -44; x <= 44; x++) for (let z = -44; z <= 70; z++) { const h = HA28(z), pth = Math.abs(x) <= 1 && z > -30;
    if (h === 0) st.add(x, 0, z, pth ? 'path' : 'turf'); else { st.add(x, 0, z, 'soil'); for (let y = 1; y <= h; y++) st.add(x, y, z, y === h ? (pth ? 'path' : 'turf') : 'soil'); } }
  for (const [x, z, h] of [[-12, -20, 6], [11, -16, 5], [-14, -6, 7], [13, -2, 6], [-11, 8, 5], [12, 10, 6], [-16, 20, 6], [15, 22, 7], [-12, 38, 6], [13, 38, 5], [-14, 50, 7], [12, 58, 6], [-20, -30, 7], [20, -28, 6], [-22, 30, 6], [22, 48, 6], [-4, 5, 5]]) tree20(st, x, z, h, false);
  for (const [x, y, z] of [[2, 1, 5], [3, 1, 5], [4, 1, 5], [2, 1, 6], [3, 1, 6], [4, 1, 6], [3, 2, 5], [3, 2, 6]]) st.add(x, y, z, 'leaf');
  st.add(0, 5, 24, 'stone'); st.build();
  board28(['LOST: 1 EGG', 'return to EMBER PEAK', 'REWARD!  - Mama'], 2.6, 1.5, g, -4, 2.3, 4.32, 0, '#f6e7c1', '#8a1020', 384, 220, 46, false);
  const volc = pivot(g, 30, 0, 150); for (let i = 0; i < 7; i++) box(70 - i * 9, 8, 70 - i * 9, '#4a3a3e', 0, 4 + i * 8, 0, volc).castShadow = false; box(8, 1, 8, 0, 0, 56.5, 0, volc, new THREE.MeshBasicMaterial({ color: '#ff6a2a' }));
  burst(E.dgEgg + 0.2, [2.2, 1.0, 2.4], { n: 50, colors: ['#ffe066', '#ff9a2a', '#ffffff'], speed: 4, size: 0.12, life: 1.2, grav: 2, up: 2 });
  burst(E.dgSniff + 1, [3, 1.6, 4.6], { n: 24, colors: ['#3cc26a', '#2a8a4a'], speed: 3, size: 0.14, life: 0.8, grav: 6, up: 2 });
  smoke(E.dgCold, E.dgCold + 4, 0.2, [0, 4.5, 11], { n: 3, colors: ['#e8f8ff', '#ffffff'], speed: 2, size: 0.08, life: 1.6, grav: 1, up: 0 });
  burst(E.dgCold + 2.8, [-0.6, 2.6, 13], { n: 26, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.16, life: 1.2, grav: -1, up: 1 });
  burst(E.dgBump, [0, 5.6, 24], { n: 36, colors: ['#9a9490', '#c8c0b8'], speed: 3, size: 0.18, life: 0.8, grav: 6, up: 2 });
  for (const z of [28, 30, 32, 34]) burst(lerp(E.dgBump + 0.8, E.dgCatch - 0.4, (z - 26) / 19.4), [0, cA28(z), z], { n: 10, colors: ['#3cc2a3', '#8b5a3c'], speed: 2, size: 0.12, life: 0.6, grav: 6, up: 1.5 });
  burst(E.dgCatch + 0.6, [0.4, 2.4, 47.6], { n: 40, colors: ['#7cff6b', '#ffffff', '#5ff7ff'], speed: 4, size: 0.12, life: 1, grav: 2, up: 2 });
  smoke(E.dgHot, E.dgFire, 0.15, [0.55, 2.4, 42.1], { n: 3, colors: ['#777777', '#999999', '#555555'], speed: 0.8, size: 0.3, life: 1.6, grav: -1.5, up: 1 });
  burst(E.dgFire, [0, 1.6, 42], { n: 90, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 7, size: 0.2, life: 1.2, grav: 2, up: 3 });
  smoke(E.dgFire, E.dgCinder, 0.2, [0, 2, 42], { n: 3, colors: ['#ff8a2a', '#ffd23f', '#555555'], speed: 0.8, size: 0.22, life: 1.4, grav: -2, up: 1.5 });
  burst(E.dgFire + 1.6, [1.8, 3.4, 42.8], { n: 30, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.8, grav: 1, up: 2 });
  smoke(0, E.dgCinder, 0.8, [30, 58, 150], { n: 3, colors: ['#6a6060', '#8a8080'], speed: 2, size: 3, life: 5, grav: -1.5, up: 2 });
  const C = [[0, 6, 5, -26, 0, 2, -8, 55], [7.9, 4, 3.5, -20, 0, 1.5, -4, 50], [8, 9.5, 3.6, -4.5, 3, 1.5, 3, 48], [13.9, 8.5, 3.2, -3, 3, 1.4, 3.5, 44],
    [14, 2.6, 1.0, -0.6, 2.2, 0.9, 2.4, 40], [19.9, 2.4, 1.1, 0.4, 2.2, 0.8, 2.4, 34], [20, -5.6, 2.6, 0.2, -3.8, 2.3, 4.3, 46], [25.9, -5.4, 2.5, 1.0, -3.8, 2.3, 4.3, 40],
    [26, 1, 3.8, -3, 8, 8, 60, 50], [30.9, 1.5, 4.6, -4, 20, 22, 140, 34], [31, -4, 2.4, -7.5, -6, 1.2, -1, 50], [35.9, 1.6, 2.8, -5.6, -0.4, 1.2, 1.0, 48],
    [36, 5.5, 3, -3, 0.6, 1.3, 1.6, 48], [40.9, 6, 3.4, -4.4, 0.6, 1.3, 2.0, 50], [41, 3.5, 1.4, 10, 0, 1.6, 3, 48], [45.9, 3.0, 2.4, 14.5, 0, 1.6, 9.2, 48],
    [46, -6.5, 2.4, 8, -1, 1.5, 10.5, 46], [51.9, -6.2, 3.2, 14.5, -1, 1.8, 16, 44], [52, 9, 5, 14, 0, 3, 19, 50], [56.5, 8, 7.5, 20, 0, 5, 23, 48],
    [64, 4.5, 2.6, 44.5, 0.4, 2, 47.5, 46], [69.9, 4.2, 3.0, 45.5, 0.6, 1.8, 46, 50], [70, -3.2, 2.6, 45.2, 0, 1.6, 42, 46], [74.9, -3.6, 2.2, 44.4, 0.2, 1.8, 42, 40],
    [75, -3.2, 2.8, 38.6, 0.2, 1.6, 42.2, 44], [78.9, -2.8, 2.5, 39.4, 0.2, 1.7, 42.2, 38], [79, 7, 4, 36, 1, 2.5, 42.5, 54], [81.9, 6.5, 3.6, 37.5, 1.6, 2.6, 42.8, 48],
    [82, 2.6, 3.3, 38.8, 1.8, 3.0, 42.8, 42], [86.9, 2.4, 3.4, 39.4, 1.8, 3.1, 42.8, 38], [87, 3.5, 0.9, 56, 0.5, 2, 46, 50], [E.dgCinder, 3.2, 1.1, 54, 0.5, 2.2, 47, 50]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root, cart28.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = cart28.root.visible = true; bloop6.B.root.visible = t > E.dgCart - 0.5; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
    // ---- Bloop + the Egg-Cart
    const bA = act(t, [[0, -9, 0.5, -1.5], [E.dgCart, -9, 0.5, -1.5], [E.dgCart + 3, -2.2, 0.5, -1.5], [E.dgCart + 4, 0, 0.5, 0], [E.dgGo, 0, 0.5, 0], [E.dgBump - 0.2, 0, 0.5, 21.5], [E.dgBump + 1, 0, 0.5, 21.5], [E.dgCatch + 2, 0, 0.5, 40.5],
      [E.dgOn - 1, 0, 0.5, 40.5], [E.dgOn + 0.5, -1.6, 0.5, 41.2], [E.dgCinder, -1.6, 0.5, 48]], [[0, {}]]);
    const BP = [bA.p[0], gA28(bA.p[2]), bA.p[2]], byaw = (t < E.dgCart + 4 || (t > E.dgOn - 1 && bA.walk)) ? bA.yaw : 0;
    const bo = { walk: bA.walk, phase: bA.phase * 2, ...pick(t, [[0, {}], [E.dgCart + 4, { hop: t < E.dgCart + 5.2 }], [E.dgInv, { handOut: true }], [E.dgInv + 1.6, {}], [E.dgBump, { angry: true }], [E.dgBump + 1.4, {}], [E.dgLamp + 0.8, { handOut: true }], [E.dgHot + 1, { hop: true }], [E.dgFire, { angry: true }], [E.dgFire + 2, { facepalm: true }], [E.dgOn - 1, {}]]) };
    poseBurble(bloop6, t, BP, byaw, bo); inv28a.visible = win(t, E.dgInv, E.dgInv + 1.6);
    if (win(t, E.dgCart, E.dgCatch + 2) && !bo.handOut && !bo.angry && !bo.hop) { bloop6.B.aL.rotation.set(-1.3, 0, 0); bloop6.B.aR.rotation.set(-1.3, 0, 0); }
    if (win(t, E.dgLamp + 0.8, E.dgHot + 1)) bloop6.B.aR.rotation.z = Math.sin(t * 14) * 0.5;
    const cP = t >= E.dgCatch + 2 ? [0, 0, 42] : wl(BP, byaw, [0, 0, 1.5]), cyaw = t >= E.dgCatch + 2 ? 0 : byaw; cP[1] = gA28(cP[2]);
    cart28.root.position.set(...cP); cart28.root.rotation.set(0, cyaw, 0); cart28.wheel.rotation.x = cP[2] / 0.31 + cP[0] * 0.3; cart28.body.rotation.x = win(t, E.dgBump, E.dgBump + 0.5) ? -Math.sin(seg(t, E.dgBump, E.dgBump + 0.5) * PI) * 0.25 : 0;
    const lk = seg(t, E.dgLamp + 1, E.dgFire), burn = t >= E.dgFire; cart28.fire.visible = burn; cart28.fl.forEach((m, i) => m.scale.setScalar(0.8 + 0.4 * Math.sin(t * 15 + i * 2)));
    lampM28.color.set(burn ? '#3a2a20' : new THREE.Color('#ffd080').lerp(new THREE.Color('#ff3a1a'), lk)); cart28.light.color.set(burn ? '#ff7a2a' : '#ffb050'); cart28.light.intensity = burn ? 9 + Math.sin(t * 23) * 2 : t > E.dgCart ? 2 + lk * 12 : 0;
    // ---- me
    const EGG0 = [2.2, 0.5, 2.4], hA = act(t, [[0, -1, 0.5, -17], [E.dgSniff + 3, 0, 0.5, -2.5], [E.dgEgg + 0.5, 0, 0.5, -2.5], [E.dgEgg + 1.8, 1, 0.5, 0.4], [E.dgSign, 1, 0.5, 0.4], [E.dgSign + 1.5, -2.2, 0.5, 3.0], [E.dgPeak, -2.2, 0.5, 3.0],
      [E.dgPeak + 1, -2.6, 0.5, 1.2], [E.dgCart, -2.6, 0.5, 1.2], [E.dgCart + 1.5, 1.4, 0.5, 0.4], [E.dgGo - 0.6, 1.4, 0.5, 0.4], [E.dgGo, 1.8, 0.5, 1.5], [E.dgBump, 1.8, 0.5, 23], [E.dgBump + 1, 1.8, 0.5, 24], [E.dgCatch, 1.8, 0.5, 42.8],
      [E.dgOn, 1.8, 0.5, 42.8], [E.dgCinder, 1.8, 0.5, 49.5]],
      [[0, { face: 'smug', wave: t < 3 }], [E.dgSniff, { face: 'normal' }], [E.dgEgg, { face: 'scared', panic: t < E.dgEgg + 0.6 }], [E.dgEgg + 1.8, { face: 'smug', yaw: faceTo([1, 0, 0.4], EGG0) }], [E.dgSign + 1.5, { face: 'normal', yaw: -0.6 }],
       [E.dgSign + 4, { face: 'smug', yaw: -0.6 }], [E.dgPeak, { face: 'smug', yaw: 0.2, wave: t < E.dgPeak + 3 }], [E.dgPeak + 1, { face: 'smug', yaw: 0.2 }], [E.dgCart, { face: 'smug' }], [E.dgCart + 1.5, { face: 'smug', yaw: -1.6 }],
       [E.dgInv, { face: 'normal', yaw: -1.8 }], [E.dgLoad, { face: 'smug', yaw: 0.6, hold: true }], [E.dgLoad + 1.2, { face: 'smug', yaw: 0 }], [E.dgGo, { face: 'smug' }], [E.dgCold, { face: 'scared', headYaw: -0.8 }], [E.dgCold + 4, { face: 'smug' }],
       [E.dgBump, { face: 'scared', panic: true }], [E.dgCatch, { face: 'scared', yaw: 0.2, lean: 0.35 }], [E.dgCatch + 3, { face: 'smug', yaw: -0.4 }], [E.dgLamp, { face: 'normal', yaw: -PI / 2 }], [E.dgHot, { face: 'scared', yaw: -PI / 2 }],
       [E.dgFire, { face: 'scared', yaw: -PI / 2, panic: t < E.dgFire + 1.2 }], [E.dgFire + 1.4, { face: 'scared', yaw: PI }], [E.dgHat, { face: 'smug', yaw: PI }], [E.dgOn, { face: 'smug' }]]);
    const HP = [hA.p[0], gA28(hA.p[2]), hA.p[2]]; pose(hero, { t, ...hA, p: HP });
    // ---- Leggy (the egg's self-appointed mom)
    const lA = act(t, [[0, 2.5, 0.5, -12], [E.dgSniff, 3, 0.5, 2.2], [E.dgEgg - 0.3, 3, 0.5, 2.2], [E.dgEgg + 0.8, 5, 0.5, 2.6], [E.dgLoad + 0.6, 5, 0.5, 2.6], [E.dgLoad + 1.6, 2.5, 0.5, -2.6], [E.dgGo + 0.6, -2.4, 0.5, -1.5], [E.dgCold, -2.4, 0.5, 9.9],
      [E.dgCold + 1, -1.25, 0.5, 11.2], [E.dgCold + 4.5, -1.25, 0.5, 15.8], [E.dgCold + 5.5, -2.4, 0.5, 17.1], [E.dgBump, -2.4, 0.5, 23], [E.dgBump + 0.8, -2.4, 0.5, 24], [E.dgCatch - 0.8, 0.4, 0.5, 48.2], [E.dgOn, 0.4, 0.5, 48.2], [E.dgCinder, -1.2, 0.5, 54.5]], [[0, {}]]);
    const LP = [lA.p[0], gA28(lA.p[2]), lA.p[2]], ly = lA.walk && !win(t, E.dgEgg - 0.3, E.dgEgg + 0.8) && !win(t, E.dgCatch - 1.6, E.dgOn) ? lA.yaw : t < E.dgEgg ? 0 : t < E.dgLoad + 0.6 ? -PI / 2 : win(t, E.dgCatch - 1.6, E.dgOn) ? PI : 0;
    poseLurk(L6, t, LP, ly, lA.walk ? (win(t, E.dgBump, E.dgCatch) ? 5 : 2) : 0.4);
    if (win(t, E.dgSniff, E.dgEgg)) L6.hd.rotation.x = 0.4 + Math.sin(t * 12) * 0.15;
    if (win(t, E.dgCold + 1, E.dgCold + 4.5)) { L6.root.rotation.z = -0.22; L6.light.color.set('#ffb070'); L6.light.intensity = 7; }
    if (win(t, E.dgCatch - 0.4, E.dgCatch + 0.6)) L6.hd.rotation.x = 0.5;
    // ---- the egg
    const tray = wl(cP, cyaw, [0, 0.88, 0]), back = [LP[0], LP[1] + 1.75 + L6.body.position.y - 1.3, LP[2]], HW = hatW28(HP); let eP, eo = {}, inHat = false;
    if (t < E.dgEgg) eP = [3.2, 0.5, 5.4];
    else if (t < E.dgEgg + 0.8) eP = arcPath(t, [[E.dgEgg, 3.2, 0.5, 5.4, 0], [E.dgEgg + 0.8, ...EGG0, 0.6]]);
    else if (t < E.dgLoad) { eP = EGG0; eo.wobble = win(t, E.dgEgg + 0.8, E.dgEgg + 2.5) ? 0.5 : 0; }
    else if (t < E.dgLoad + 1) eP = arcPath(t, [[E.dgLoad, ...EGG0, 0], [E.dgLoad + 1, ...tray, 1.2]]);
    else if (t < E.dgBump) { eP = tray; eo = { yaw: cyaw, wobble: win(t, E.dgCold, E.dgCold + 3) ? 0.6 : 0 }; }
    else if (t < E.dgBump + 0.8) eP = arcPath(t, [[E.dgBump, ...tray, 0], [E.dgBump + 0.8, 0, gA28(26), 26, 1.5]]);
    else if (t < E.dgCatch) { const z = lerp(26, 45.4, seg(t, E.dgBump + 0.8, E.dgCatch - 0.4)); eP = [0, gA28(z) + Math.abs(Math.sin(z * PI / 2)) * 0.15, z]; eo.rx = (z - 26) / 0.33; }
    else if (t < E.dgCatch + 0.7) eP = arcPath(t, [[E.dgCatch, 0, 0.5, 45.4, 0], [E.dgCatch + 0.7, ...back, 1.2]]);
    else if (t < E.dgLamp) eP = back;
    else if (t < E.dgLamp + 0.8) eP = arcPath(t, [[E.dgLamp, ...back, 0], [E.dgLamp + 0.8, ...tray, 1.5]]);
    else if (t < E.dgFire) { eP = tray; eo.wobble = seg(t, E.dgHot, E.dgFire); }
    else if (t < E.dgFire + 1.6) { eP = arcPath(t, [[E.dgFire, ...tray, 0], [E.dgFire + 1.6, ...HW, 4]]); eo.rx = t * 9; }
    else inHat = true;
    if (inHat) { parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], {}); } else { parentTo(egg28.root, g); poseEgg28(egg28, t, eP, eo); }
    let cam = camKeys(t, C); if (win(t, 56.5, 64)) { const z = t < E.dgBump + 0.8 ? lerp(24, 26, seg(t, 56.5, E.dgBump + 0.8)) : eP[2]; cam = { p: [1.5, cA28(z - 7) + 6, z - 7], l: [0, cA28(z) + 0.4, z + 1], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Cinder Trail (sunset) — it hatches
const cinder = (() => {
  const g = mk('cinder'); const st = new VSet(g);
  for (let x = -40; x <= 40; x++) for (let z = -30; z <= 60; z++) { const ax = Math.abs(x), lava = z >= 6 && z <= 8 && !(z === 7 && (x === 0 || x === -2 || x === 3)), pool = Math.hypot(x - 11, z - 2) < 3.2 || Math.hypot(x + 12, z - 20) < 3.6;
    st.add(x, 0, z, lava || pool ? 'lava' : ax <= 1 ? 'ash' : hash2(x, z, 28) > 0.55 ? 'basalt' : 'ash'); if (lava && hash2(x, z, 5) > 0.85) st.add(x, 0, z, 'crust'); }
  for (const [x, z, h] of [[-8, -4, 4], [9, -10, 6], [-14, 6, 7], [15, 14, 5], [-9, 26, 6], [10, 30, 8], [-18, -14, 5], [18, -2, 7], [-6, 40, 5], [7, 44, 6], [-20, 34, 8], [20, 40, 6]]) for (let y = 1; y <= h; y++) { st.add(x, y, z, 'basalt'); if (y < h - 1) { st.add(x + 1, y, z, 'basalt'); st.add(x, y, z + 1, 'basalt'); } }
  for (let y = 1; y <= 2; y++) st.add(6, y, 17, 'basalt'); st.add(7, 1, 17, 'basalt');
  st.build();
  const volc = pivot(g, 10, 0, 110); for (let i = 0; i < 7; i++) box(60 - i * 8, 7, 60 - i * 8, '#3a2a2e', 0, 3.5 + i * 7, 0, volc).castShadow = false; box(10, 1, 10, 0, 0, 49.5, 0, volc, new THREE.MeshBasicMaterial({ color: '#ff5a1a' }));
  const bush = pivot(g, 5.8, 0.5, 14.6); box(1.3, 1.0, 1.3, '#4a2a2a', 0, 0.5, 0, bush); for (const [x, y, z] of [[0.4, 1.0, 0.3], [-0.3, 1.05, -0.2], [0.1, 0.8, 0.66], [-0.66, 0.6, 0.2], [0.66, 0.5, -0.3]]) box(0.22, 0.22, 0.22, 0, x, y, z, bush, new THREE.MeshLambertMaterial({ color: '#ff2a3a', emissive: '#c0101a', emissiveIntensity: 0.5 }));
  for (const [x, z] of [[0, 7], [11, 2], [-12, 20]]) { const l = new THREE.PointLight('#ff6a1a', 10, 18, 1.4); l.position.set(x, 1.5, z); g.add(l); }
  smoke(E.dgCinder, E.dgNight, 0.9, [10, 51, 110], { n: 3, colors: ['#5a4a4a', '#7a6060'], speed: 2, size: 3, life: 5, grav: -1.5, up: 2 });
  smoke(E.dgCinder, E.dgNight, 0.5, [0, 0.8, 7], { n: 2, colors: ['#ff8a2a', '#ffd23f'], speed: 0.6, size: 0.1, life: 1.2, grav: -2, up: 1 });
  for (const s of [0, 0.6, 1.2, 1.8]) burst(E.dgHop + 1.3 + s, [-2, 1.0, 7], { n: 12, colors: ['#777777', '#aaaaaa'], speed: 1, size: 0.2, life: 0.8, grav: -2, up: 1 });
  burst(E.dgHatch, [0, 3.3, 11], { n: 70, colors: ['#fff0d0', '#ffd27a', '#ffffff', '#3ad6a0'], speed: 4, size: 0.14, life: 1.2, grav: 5, up: 2 });
  burst(E.dgImprint + 0.5, [0, 3.7, 11.2], { n: 30, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.16, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgHic + 0.3, [0, 1.9, 12.9], { n: 50, colors: ['#ff5a1a', '#ffd23f', '#444444'], speed: 3, size: 0.16, life: 0.9, grav: 1, up: 1 }); smoke(E.dgHic + 0.3, E.dgHic + 3, 0.2, [0, 2.2, 13.1], { n: 2, colors: ['#555555', '#777777'], speed: 0.5, size: 0.25, life: 1.2, grav: -1.5, up: 1 });
  burst(E.dgHic2 + 0.3, [-0.45, 1.5, 12.6], { n: 50, colors: ['#ff5a1a', '#ffd23f', '#222222'], speed: 3, size: 0.14, life: 1, grav: 1, up: 1 }); smoke(E.dgHic2 + 0.4, E.dgHic2 + 2, 0.15, [-0.45, 1.4, 12.6], { n: 3, colors: ['#222222', '#555555'], speed: 0.6, size: 0.12, life: 1.2, grav: 2, up: 0.5 });
  burst(E.dgSnack + 3.6, [1.0, 2.0, 11.0], { n: 26, colors: ['#ff5a1a', '#222222'], speed: 2, size: 0.12, life: 0.8, grav: 2, up: 1 });
  burst(E.dgSnack + 7.2, [1.0, 2.6, 11.0], { n: 30, colors: ['#ff5ca8', '#ff9ecb', '#ffe066'], speed: 2, size: 0.16, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgLesson + 4.8, [6.5, 0.8, 21], { n: 40, colors: ['#555555', '#888888'], speed: 3, size: 0.25, life: 0.8, grav: 4, up: 1 });
  const HB = [0, 0.5, 11], BB = [-2.2, 0.5, 12.4], BF = [0, 0.5, 13.2], LB = [3, 0.5, 12.6], LS = [3.7, 0.5, 11.0], HC = [2.5, 0.5, 15.5], ROCK = [6.5, 2.5, 17.5];
  const C = [[E.dgCinder, -9, 5, -14, 0, 2, 4, 56], [97.9, -8, 4, -6, 0, 1.5, 8, 52], [98, -7, 2.4, 4, -2, 1, 7.6, 46], [101.9, -6.5, 3, 7, -1, 1.5, 11, 48],
    [102, 0.8, 3.2, 14.2, 0, 2.8, 11, 40], [109.9, 0.4, 3.1, 13.4, 0, 3.0, 11, 30], [110, 1.2, 4.4, 13.8, 0, 3.3, 11, 40], [114.9, 1.0, 4.2, 13.2, 0, 3.4, 11, 34],
    [115, -2.5, 3.4, 15, 0.6, 2.6, 11.5, 48], [121.9, -2.8, 3.2, 14.4, 0.8, 2.4, 11.8, 46], [122, -4.5, 2.4, 10.4, 0, 2.0, 12.4, 48], [127.9, -4.2, 2.6, 11.8, 0, 2, 12.2, 44],
    [128, -4.2, 2.6, 15.5, -0.3, 1.7, 12.8, 40], [133.9, -4.4, 2.8, 16, -0.3, 1.8, 12.8, 44], [134, 0.9, 2.8, 15, 0, 2.6, 11, 44], [139.9, 0.3, 2.9, 14.0, 0, 2.7, 11, 40],
    [140, -4, 4, 8.5, 2.5, 2, 12.5, 50], [144.9, -3.6, 3.6, 9.2, 2.8, 2.1, 12.5, 46], [145, 7.5, 3, 7.4, 2.5, 2.2, 12, 46], [149.4, 7.8, 3.6, 8.4, 3, 2.6, 12.5, 44],
    [149.5, -1.5, 3, 12.5, 5, 2.4, 17.5, 50], [E.dgNight, -1, 4, 11.5, 4, 3, 17.5, 46]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
    // ---- me
    let hA; if (win(t, E.dgHop, E.dgHop + 1.4)) hA = { p: arcPath(t, [[E.dgHop, -0.6, 0.5, 4.6, 0], [E.dgHop + 0.7, 0, 0.5, 7, 0.8], [E.dgHop + 1.4, 0, 0.5, 9.2, 0.8]]), yaw: 0, face: 'scared' };
    else hA = act(t, [[E.dgCinder, -1.2, 0.5, -6], [E.dgHop, -0.6, 0.5, 4.6], [E.dgHop + 1.4, 0, 0.5, 9.2], [E.dgHop + 3.4, ...HB], [E.dgLesson, ...HB], [E.dgLesson + 1.5, ...HC]],
      [[0, { face: 'smug' }], [E.dgHop + 3.4, { face: 'smug', yaw: 0 }], [E.dgWobble, { face: 'scared', yaw: 0 }], [E.dgCrack, { face: 'scared', yaw: 0, headPitch: -0.15 }], [E.dgHatch, { face: 'scared', yaw: 0, panic: t < E.dgHatch + 1 }],
       [E.dgHatch + 1, { face: 'normal', yaw: 0, headPitch: -0.2 }], [E.dgImprint + 2, { face: 'scared', yaw: 0 }], [E.dgImprint + 4.5, { face: 'smug', yaw: 0 }], [E.dgHic, { face: 'scared', yaw: 0 }], [E.dgHic + 1.5, { face: 'normal', yaw: 0 }],
       [E.dgHic2, { face: 'scared', yaw: 0 }], [E.dgHic2 + 1.5, { face: 'normal', yaw: 0 }], [E.dgName, { face: 'smug', yaw: 0.2, wave: t < E.dgName + 2 }], [E.dgName + 2, { face: 'smug', yaw: 0.2 }], [E.dgSnack, { face: 'normal', yaw: 0.9 }],
       [E.dgSnack + 3.4, { face: 'scared', yaw: 0.9 }], [E.dgSnack + 5, { face: 'smug', yaw: 0.9 }], [E.dgLesson + 1.5, { face: 'smug', yaw: faceTo(HC, ROCK) }], [E.dgLesson + 4.6, { face: 'scared', yaw: faceTo(HC, ROCK) }], [E.dgLesson + 5.8, { face: 'smug', yaw: faceTo(HC, ROCK) }]]);
    pose(hero, { t, ...hA });
    const HP = hero.root.position.toArray(), HW = hatW28(HP);
    // ---- egg → Pip (in my hat)
    const hk = seg(t, E.dgHatch, E.dgHatch + 0.6); parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], { wobble: win(t, E.dgWobble, E.dgHatch) ? lerp(0.3, 1, seg(t, E.dgWobble, E.dgHatch)) * (Math.floor(t * 1.6) % 2 ? 1 : 0.3) : 0, crack: win(t, E.dgCrack, E.dgHatch), hatch: hk });
    const LH = (P, y) => wl(P, y, [0, 1.82, 1.65]);
    let lp, ly, ls = 0.4;
    if (t < E.dgSnack) { const a = act(t, [[E.dgCinder, 2.8, 0.5, -7], [E.dgHop, 2.8, 0.5, 4], [E.dgHop + 3, 2.8, 0.5, 10], [E.dgHop + 4.5, ...LB]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(LB, HB); ls = a.walk ? 2 : 0.4; }
    else { const a = act(t, [[E.dgSnack, ...LB], [E.dgSnack + 1, 4.6, 0.5, 13.4], [E.dgSnack + 1.8, 4.6, 0.5, 13.4], [E.dgSnack + 3, ...LS], [E.dgSnack + 4, ...LS], [E.dgSnack + 5, 4.6, 0.5, 13.4], [E.dgSnack + 5.6, 4.6, 0.5, 13.4], [E.dgSnack + 6.6, ...LS], [E.dgLesson, ...LS], [E.dgLesson + 2, 6.5, 0.5, 15.2]], [[0, {}]]);
      lp = a.p; ly = a.walk ? a.yaw : win(t, E.dgSnack + 1, E.dgSnack + 1.8) || win(t, E.dgSnack + 5, E.dgSnack + 5.6) ? faceTo(lp, [5.8, 0, 14.6]) : -PI / 2; ls = a.walk ? 2 : 0.4;
      if (t >= E.dgLesson + 2) { ly = 0; if (t < E.dgLesson + 2.8) lp = arcPath(t, [[E.dgLesson + 2, 6.5, 0.5, 15.2, 0], [E.dgLesson + 2.8, ...ROCK, 1.2]]); else if (t < E.dgLesson + 4) { lp = ROCK; ls = 8; } else lp = arcPath(t, [[E.dgLesson + 4, ...ROCK, 0], [E.dgLesson + 4.8, 6.5, 0.5, 21, 1.4]]); } }
    poseLurk(L6, t, lp, ly, ls);
    if (win(t, E.dgImprint + 1, E.dgHic - 1)) { L6.hd.rotation.x = 0.55; L6.body.position.y -= 0.25; }
    if (win(t, E.dgSnack + 7.4, E.dgLesson)) L6.root.rotation.z = Math.sin(t * 12) * 0.1;
    if (win(t, E.dgLesson + 2.8, E.dgLesson + 4.8)) { L6.root.rotation.z = Math.sin(t * 20) * 0.12; L6.body.position.y += Math.abs(Math.sin(t * 16)) * 0.3; }
    if (win(t, E.dgLesson + 4.8, E.dgLesson + 5.6)) L6.body.position.y = 0.6;
    berry28.visible = win(t, E.dgSnack + 1.6, E.dgSnack + 4.2) || win(t, E.dgSnack + 5.4, E.dgSnack + 7); berryBurnt28.visible = win(t, E.dgSnack + 3.6, E.dgSnack + 4.2);
    // Pip
    const pk = backOut(seg(t, E.dgHatch + 0.2, E.dgHatch + 0.7)), PS = 0.32;
    const po = pick(t, [[0, {}], [E.dgHatch + 1.5, { headYaw: Math.sin(t * 2) * 0.6 }], [E.dgImprint, { pitch: 0.35, headPitch: 0.45, happy: true, hop: t < E.dgImprint + 1.5 }], [E.dgImprint + 4, { headYaw: Math.sin(t * 1.5) * 0.4 }],
      [E.dgHic, { fire: t < E.dgHic + 0.5 ? 1 : 0, wide: true, pitch: 0.1 }], [E.dgHic + 1, {}], [E.dgHic2, { fire: t < E.dgHic2 + 0.5 ? 1 : 0, wide: true, pitch: 0.2 }], [E.dgHic2 + 1, { happy: true }], [E.dgName, { flap: 0.6 }], [E.dgName + 2.5, {}],
      [E.dgSnack + 3.4, { fire: t < E.dgSnack + 3.9 ? 1 : 0, wide: true, pitch: 0.4, headPitch: 0.3 }], [E.dgSnack + 4.2, {}], [E.dgSnack + 6.8, { chew: true, pitch: 0.4, headPitch: 0.3 }], [E.dgSnack + 7.6, { flap: 1 }], [E.dgSnack + 8.4, { happy: true }],
      [E.dgLesson + 3, { flap: 0.4, happy: true }], [E.dgLesson + 4, { flap: 1, fly: true, wide: true }], [E.dgLesson + 5.9, { happy: true }]]);
    const LHp = LH(lp, ly);
    if (t < E.dgHatch + 0.2) pip28.root.visible = false;
    else if (t < E.dgSnack + 7.6) pipAt28(t, capHat, [0, 0.36, 0], 0, PS * pk, po);
    else if (t < E.dgSnack + 8.4) pipAt28(t, g, arcPath(t, [[E.dgSnack + 7.6, ...HW, 0], [E.dgSnack + 8.4, ...LHp, 1.0]]), -PI / 2, PS, po);
    else if (t < E.dgLesson + 4) pipAt28(t, L6.hd, [0, 0.42, 0.25], 0, PS, po);
    else if (t < E.dgLesson + 5.9) { const P0 = wl(ROCK, 0, [0, 1.82, 1.65]), P = arcPath(t, [[E.dgLesson + 4, ...P0, 0], [E.dgLesson + 5.0, 4.6, 5.4, 17.2, 0.6], [E.dgLesson + 5.9, ...HW, 0.3]]); pipAt28(t, g, P, faceTo(P0, HW), PS, po); }
    else pipAt28(t, capHat, [0, 0.36, 0], 0, PS, po);
    // ---- Bloop (hot feet; singed; the invoice)
    let bp, by, bo = {};
    if (win(t, E.dgHop + 0.3, E.dgHop + 4)) { const k = t - E.dgHop; bp = k < 1 ? arcPath(t, [[E.dgHop + 0.3, -2, 0.5, 4.8, 0], [E.dgHop + 1, -2, 0.5, 7, 0.8]]) : k < 3.3 ? [-2, 0.5, 7] : arcPath(t, [[E.dgHop + 3.3, -2, 0.5, 7, 0], [E.dgHop + 4, -2, 0.5, 9.4, 0.8]]); by = 0; bo = { hop: k > 1 && k < 3.3, angry: k > 1 && k < 3.3 }; }
    else { const a = act(t, [[E.dgCinder, 0.8, 0.5, -7.5], [E.dgHop + 0.3, -2, 0.5, 4.8], [E.dgHop + 4, -2, 0.5, 9.4], [E.dgHop + 5, ...BB], [E.dgHic - 1.5, ...BB], [E.dgHic - 0.5, ...BF], [E.dgName - 1, ...BF], [E.dgName, -2.4, 0.5, 12.8]], [[0, {}]]);
      bp = a.p; by = a.walk ? a.yaw : t < E.dgHic - 0.5 || t >= E.dgName ? faceTo(bp, HB) : PI;
      bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgHatch, { hop: t < E.dgHatch + 2 }], [E.dgImprint + 2, { facepalm: true }], [E.dgImprint + 4.5, {}], [E.dgHic + 0.3, { angry: true }], [E.dgHic2 - 2, { handOut: true }], [E.dgHic2 + 0.5, { handOut: true }], [E.dgHic2 + 2.4, { facepalm: true }], [E.dgName, {}], [E.dgLesson + 4.8, { hop: true }], [E.dgLesson + 6, {}]]) }; }
    poseBurble(bloop6, t, bp, by, bo); if (win(t, E.dgHic + 0.3, E.dgHic + 1.3)) bHat.position.y = 1.2 + Math.sin(seg(t, E.dgHic + 0.3, E.dgHic + 1.3) * PI) * 1.2;
    inv28a.visible = win(t, E.dgHic2 - 2, E.dgHic2 + 1.6); const ik = seg(t, E.dgHic2 + 0.3, E.dgHic2 + 1.6); inv28a.children[0].material = t > E.dgHic2 + 0.3 ? burntM28 : invM28; inv28a.scale.setScalar(1 - ik * 0.95);
    shoot28(t, g, [[E.dgHic, 0.3, [0, 3.3, 11.4], [0, 1.9, 12.9]], [E.dgHic2, 0.3, [0, 3.3, 11.4], [-0.45, 1.5, 12.6]], [E.dgSnack + 3.4, 0.2, [0, 3.2, 11.4], [1.0, 2.0, 11.0]]]);
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: Ember Peak (night → dawn) — Mama Ember
const peak = (() => {
  const g = mk('peak'); const st = new VSet(g);
  for (let x = -28; x <= 13; x++) for (let z = -30; z <= 26; z++) { const d = Math.hypot(x, z), pool = Math.hypot(x + 12, z + 12) < 2.6 || Math.hypot(x - 7, z + 18) < 2.2 || Math.hypot(x + 16, z - 10) < 3;
    st.add(x, 0, z, pool ? 'lava' : d < 4 ? 'plank' : hash2(x, z, 77) > 0.6 ? 'basalt' : 'ash'); if (Math.abs(d - 4.4) < 0.55) st.add(x, 1, z, 'log'); if (x === 13 && hash2(x, z, 3) > 0.5) st.add(x, 1, z, 'basalt'); }
  for (const [x, z, h] of [[-19, -3, 6], [-16, 12, 8], [-8, 20, 5], [4, 21, 7], [-22, 6, 4], [10, 16, 6], [-24, -18, 7], [-6, -26, 5]]) for (let y = 1; y <= h; y++) { st.add(x, y, z, 'basalt'); if (y < h - 1) { st.add(x + 1, y, z, 'basalt'); st.add(x, y, z + 1, 'basalt'); } }
  for (let x = 1; x <= 5; x++) for (let y = 1; y <= 3; y++) { st.add(x, y, -15, 'basalt'); if (x === 1 || x === 5) { st.add(x, y, -14, 'basalt'); st.add(x, y, -13, 'basalt'); } } for (let x = 1; x <= 5; x++) for (const z of [-14, -13]) st.add(x, 3, z, 'basalt');
  for (const [x, z] of [[-1, 1], [-2, 2], [-1, 2], [1, 2]]) st.add(x, 1, z, 'goldblk');
  st.build();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: '#c8401a' })); sea.rotation.x = -PI / 2; sea.position.set(0, -30, 0); g.add(sea);
  const boulder = box(3.4, 2.6, 1.6, '#3a2e30', 3, 1.8, -11.6, g);
  for (const [x, z, r] of [[-1.2, -0.8, 0.4], [1.4, 0.6, 1.2], [0.2, 1.8, 2.2]]) { const s = box(0.4, 0.2, 0.3, '#fff0d0', x, 0.62, z, g); s.rotation.y = r; }
  const nestL = new THREE.PointLight('#ffb070', 0, 46, 1.1); nestL.position.set(0, 7, -5); g.add(nestL); for (const [x, z] of [[-12, -12], [7, -18], [-16, 10]]) { const l = new THREE.PointLight('#ff6a1a', 12, 20, 1.4); l.position.set(x, 1.5, z); g.add(l); }
  const EGA = [0, 1, 2, 3, 4].map(i => [1.8 + i * 0.6, 0.5, -13.9]);
  const HS = [-1.5, 0.5, -9.5], HCo = [12, 0.5, -1.5], M0 = [0, 0.5, 5.5], MC = [2.5, 0.5, -1.5], MA = [3, 0.5, -4.5], BH = [-8, 0.5, -10], BP2 = [6.5, 0.5, -5], BS = [-4.0, 0.5, -11.4], HQ = [-0.8, 0.5, -8.8];
  const RUN = [[E.dgChase, 0, 0.5, -6.2], [E.dgChase + 2.5, -7, 0.5, -5], [E.dgChase + 4.5, -9, 0.5, -1], [E.dgChase + 6, -6, 0.5, -9], [E.dgChase + 8, 2, 0.5, -10], [E.dgChase + 9.5, 8, 0.5, -6], [E.dgCorner, ...HCo]];
  burst(E.dgLand, [0, 1, 5.5], { n: 90, colors: ['#5a4a4a', '#8a7a70', '#3a2e30'], speed: 8, size: 0.4, life: 1.4, grav: 3, up: 1 });
  for (const s of [0, 1.2, 2.4, 3.6]) burst(E.dgSniff2 + s, [0, 4.6, -3.5], { n: 14, colors: ['#666666', '#999999'], speed: 1.5, size: 0.4, life: 1.2, grav: -1, up: 1 });
  for (const [s, p] of [[1.2, [0, 0.8, -6.2]], [5.6, [-6, 0.8, -9]], [9.1, [6, 0.8, -8]]]) burst(E.dgChase + s, p, { n: 50, colors: ['#ff5a1a', '#ffd23f', '#222222'], speed: 4, size: 0.3, life: 1, grav: 1, up: 2 });
  burst(E.dgReunite + 0.5, [9.6, 6.4, -1.5], { n: 50, colors: ['#ff5ca8', '#ff9ecb', '#ffffff'], speed: 3, size: 0.25, life: 1.6, grav: -1, up: 1.5 });
  burst(E.dgPay + 5.2, [6.5, 2.2, -5], { n: 60, colors: ['#ffd23f', '#ffffff', '#ffe066'], speed: 5, size: 0.14, life: 1.2, grav: 3, up: 3 });
  burst(E.dgClutch + 2, [5.5, 1.0, -11.6], { n: 40, colors: ['#5a4a4a', '#8a7a70'], speed: 4, size: 0.3, life: 1, grav: 5, up: 1 });
  burst(E.dgFlyOff, [3, 1, -4.5], { n: 80, colors: ['#5a4a4a', '#8a7a70', '#f0d090'], speed: 7, size: 0.35, life: 1.4, grav: 2, up: 1 });
  burst(E.dgHatchAll, [-1.5, 4.6, -9.5], { n: 110, colors: ['#fff0d0', '#ff8ac0', '#6ab0ff', '#ffd23f', '#7cff6b', '#9a7aff'], speed: 5, size: 0.14, life: 1.4, grav: 5, up: 2 });
  burst(E.dgMoms + 0.5, [-1.5, 6, -9.5], { n: 40, colors: ['#ff5ca8', '#ff9ecb'], speed: 2.5, size: 0.18, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgHic3, [-1.5, 4.5, -9.5], { n: 120, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 6, size: 0.2, life: 1.1, grav: 1, up: 2 });
  const heroRun = t => { const a = (t - E.dgPanic) * 2.4; return [HQ[0] + Math.cos(a) * 1.8, 0.5, HQ[2] + Math.sin(a) * 1.8]; };
  smoke(E.dgHic3 + 0.4, E.freeze + 0.1, 0.12, t => { const p = heroRun(Math.max(t, E.dgPanic)); return [p[0], 3.5, p[2]]; }, { n: 3, colors: ['#ff5a1a', '#ffd23f', '#555555'], speed: 0.6, size: 0.18, life: 0.9, grav: -2.5, up: 1 });
  const C = [[E.dgNest, 1.5, 4.2, -11, 0, 1, 1, 50], [168.9, 1.0, 5.5, -12, 0, 1.5, 2, 52], [169, 0.8, 1.6, -9.5, 2, 8, 6, 62], [175.4, 1.0, 1.8, -9.8, 0, 5, 3, 60],
    [175.5, -3, 1.2, -12.5, 0, 6, 3, 62], [181.9, -3.4, 1.4, -13, 0, 6.5, 3, 58], [182, 3.5, 2.4, -10, 0, 3.2, -4.5, 46], [186.9, 3.2, 2.6, -9.6, 0, 3.4, -4.8, 42],
    [187, -14, 7, -14, -2, 2, -3, 50], [192.9, -12, 8, -15, 0, 2, -5, 50],
    [198, 8, 2, -10, 7, 4, -1.5, 54], [201.9, 8.5, 2.4, -9.5, 7, 4.5, -1.5, 50], [202, 15.5, 3.4, -3.8, 6, 4, -1.5, 52], [205.9, 15, 3.6, -2.8, 6, 4.5, -1.5, 50],
    [206, 13.5, 3.6, -6.5, 11, 4, -1.5, 46], [211.9, 12.5, 4.8, -7.5, 9.5, 5.6, -1.5, 44], [212, 4.5, 4.5, -10.5, 8.5, 6.5, -1.5, 48], [217.9, 4.2, 5, -10, 8.5, 6.8, -1.5, 46],
    [218, 0, 5.5, -13, 5, 1.5, -4.5, 50], [221.9, 0.5, 4.8, -12.5, 6, 1.4, -4.6, 46], [222, 9.8, 2.2, -9, 6.5, 1.3, -5, 40], [225.9, 9.4, 2.6, -9.6, 6.5, 1.0, -5, 44],
    [226, 22, 6, -14, 4, 4, 0, 50], [231.9, 21, 7, -11, 4, 4.5, 1, 46], [232, 9, 3, -10, 5, 2, -4, 50], [237.9, 3, 3.4, -15, -1, 2, -8, 52],
    [238, -6, 3, -4, 3, 1.5, -12, 48], [242.9, -6.5, 3.4, -5, 2.5, 1.8, -12, 48], [243, -6.5, 4.2, -5.4, -1.5, 4.0, -9.5, 54], [250.9, -7, 5.2, -5, -1.5, 4.8, -9.5, 58],
    [251, -10, 2, -16, 2, 6, -2, 56], [255.9, -9, 2.2, -15, 8, 12, 6, 60], [256, -4.4, 2.6, -4.6, -2.4, 2.8, -9, 46], [261.9, -4.8, 3.6, -5.2, -1.8, 3.8, -9.5, 50],
    [262, -6, 4.2, -5.6, -1.5, 4.4, -9.5, 56], [269.9, -6.4, 4.8, -5.2, -1.5, 4.6, -9.5, 54], [270, -6, 4.6, -5.5, -1.5, 4.8, -9.5, 50], [277.9, -6.5, 5, -5, -1.5, 4.6, -9.5, 54],
    [278, -8, 4, -2.4, -1, 2.5, -8.8, 54], [285.5, -8.5, 4.4, -1.8, -0.8, 2.6, -8.8, 50], [E.logo, -8.5, 4.4, -1.8, -0.8, 2.6, -8.8, 50]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 2.5;
    nestL.intensity = t < E.dgDawn ? 34 : lerp(34, 0, seg(t, E.dgDawn, E.dgDawn + 6));
    // ---- me
    let hA; const sway = win(t, E.dgStack, E.dgHic3) ? Math.sin(t * 2.2) * 0.06 * (1 + EGGT28.filter(a => t >= a).length * 0.3) : 0;
    if (t < E.dgChase) hA = act(t, [[E.dgNight, -7, 0.5, -22], [E.dgNest, 0, 0.5, -6.2]], [[0, { face: 'smug' }], [E.dgNest, { face: 'normal', yaw: 0, headYaw: Math.sin(t) * 0.4 }], [E.dgShadow, { face: 'scared', yaw: 0, headPitch: -0.5 }], [E.dgLand, { face: 'scared', yaw: 0, lean: -0.2, panic: t < E.dgLand + 1 }],
      [E.dgRoar, { face: 'scared', yaw: 0, lean: -0.25, headPitch: -0.4 }], [E.dgSniff2, { face: 'scared', yaw: 0, headPitch: -0.45 }]]);
    else if (t < E.dgCorner) { const w = walker(t, RUN); hA = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'scared', panic: true }; }
    else if (t < E.dgBye + 1) hA = { p: HCo, yaw: -PI / 2, ...pick(t, [[0, { face: 'scared', lean: -0.15 }], [E.dgStep, { face: 'normal' }], [E.dgFly, { face: 'scared', headPitch: -0.3 }], [E.dgReunite, { face: 'smug', headPitch: -0.3 }], [E.dgPay, { face: 'smug', yaw: -2.2 }], [E.dgDawn, { face: 'smug', yaw: -PI / 2, headPitch: -0.2 }], [E.dgBye, { face: 'smug', yaw: -PI / 2, wave: true }]]) };
    else if (t < E.dgPanic) hA = act(t, [[E.dgBye + 1, ...HCo], [E.dgBye + 4.5, ...HS]], [[0, { face: 'smug' }], [E.dgBye + 4.5, { face: 'normal', yaw: faceTo(HS, [3, 0, -12]) }], [E.dgClutch + 3, { face: 'scared', yaw: faceTo(HS, [3, 0, -12]) }], [E.dgStack, { face: 'scared', yaw: -1.0, lean: sway }],
      [E.dgFlyOff, { face: 'scared', yaw: -0.2, lean: sway }], [E.dgBabysit, { face: 'normal', yaw: -1.6, lean: sway }], [E.dgWobble2, { face: 'scared', yaw: -1.0, lean: sway }], [E.dgHatchAll, { face: 'scared', yaw: -1.0 }], [E.dgMoms, { face: 'normal', yaw: -1.0 }], [E.dgHic3, { face: 'scared', yaw: -1.0, panic: true }]]);
    else { const p = heroRun(t), a = (t - E.dgPanic) * 2.4; hA = { p, yaw: Math.atan2(-Math.sin(a), Math.cos(a)), walk: 1, phase: t * 14, face: 'scared', panic: true }; }
    pose(hero, { t, ...hA }); if (win(t, E.dgStack, E.dgHic3) && !hA.panic) { hero.aL.rotation.set(0, 0, -1.4 + sway * 3); hero.aR.rotation.set(0, 0, 1.4 + sway * 3); }
    const HP = hero.root.position.toArray(), HW = hatW28(HP);
    hatFire28.visible = t >= E.dgHic3 + 0.4; hfl28.forEach((m, i) => { m.scale.setScalar(0.8 + 0.4 * Math.sin(t * 17 + i * 2)); m.rotation.y = t * (2 + i); });
    // ---- Leggy
    let lp, ly, ls = 0.4;
    if (t < E.dgChase) { const a = act(t, [[E.dgNight, -4, 0.5, -23.5], [E.dgNest, 4.4, 0.5, -6.8]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : 0; ls = a.walk ? 2 : 0.4; }
    else if (t < E.dgCorner + 1) { const w = walker(Math.max(E.dgChase, t - 1.2), RUN); lp = [w.p[0] + 1.6, 0.5, w.p[2] - 1.8]; ly = w.walk > 0.05 ? w.yaw : 0; ls = 5; }
    else if (t < E.dgStep) { lp = L3([13.6, 0.5, -3.3], [10.8, 0.5, -4.6], ss(seg(t, E.dgCorner + 1, E.dgCorner + 2))); ly = -PI / 2; ls = 1; }
    else if (t < E.dgStep + 0.8) { lp = arcPath(t, [[E.dgStep, 10.8, 0.5, -4.6, 0], [E.dgStep + 0.8, 9.2, 0.5, -1.5, 1.2]]); ly = -PI / 2; ls = 3; }
    else if (t < E.dgBye + 1) { lp = [9.2, 0.5, -1.5]; ly = -PI / 2; ls = win(t, E.dgStep + 0.8, E.dgFly) ? 9 : 0.5; }
    else if (t < E.dgFlyOff + 1) { const a = act(t, [[E.dgBye + 1, 9.2, 0.5, -1.5], [E.dgBye + 3, 9, 0.5, -8], [E.dgBye + 6, -4.5, 0.5, -13.5]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(lp, HS); ls = a.walk ? 2 : 0.4; }
    else { const a = act(t, [[E.dgFlyOff + 1, -4.5, 0.5, -13.5], [E.dgFlyOff + 3, 1.2, 0.5, -10.5], [E.dgFlyOff + 4.5, 1.2, 0.5, -6.0]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(lp, HS); ls = a.walk ? 2 : 0.4; }
    poseLurk(L6, t, lp, ly, ls);
    if (win(t, E.dgRoar, E.dgChase)) { L6.body.position.y -= 0.4; L6.hd.rotation.x = 0.4; }
    if (win(t, E.dgStep + 0.8, E.dgFly)) { L6.root.rotation.z = Math.sin(t * 20) * 0.12; L6.body.position.y += Math.abs(Math.sin(t * 16)) * 0.35; }
    if (win(t, E.dgFly, E.dgReunite + 4)) L6.hd.rotation.x = -0.5; if (win(t, E.dgReunite, E.dgPay)) L6.root.rotation.z = Math.sin(t * 12) * 0.1;
    if (win(t, E.dgHatchAll, E.dgHic3)) { L6.root.rotation.z = Math.sin(t * 12) * 0.1; L6.hd.rotation.x = -0.4; }
    // ---- Mama Ember
    let mp = M0, my = PI, mo = {}; mama28.root.visible = t >= E.dgShadow && t < E.dgFlyOff + 6;
    if (t < E.dgLand) { const K = [[E.dgShadow, -40, 30, 34], [E.dgShadow + 3, 10, 18, -6], [E.dgShadow + 5, 9, 9, 12], [E.dgLand, ...M0]], a = track(t, K); mp = a.p; my = t < E.dgLand - 1 ? Math.atan2(a.v[0], a.v[2]) : lerp(Math.atan2(a.v[0], a.v[2]), PI, seg(t, E.dgLand - 1, E.dgLand)); mo = { flap: 1, fly: true }; }
    else if (t < E.dgChase) mo = pick(t, [[0, { crouch: 0.6 }], [E.dgLand + 0.6, {}], [E.dgRoar, { roar: true, neckUp: 1, rear: 0.4, flap: 0.4 }], [E.dgRoar + 3, { narrow: true }], [E.dgSniff2, { pitch: 0.22, crouch: 1, neckDown: 0.8, headPitch: 0.35, narrow: true }]]);
    else if (t < E.dgCorner - 2) { const h = walker(t, RUN).p; my = faceTo(M0, h); const f = win(t, E.dgChase + 0.6, E.dgChase + 1.8) || win(t, E.dgChase + 5, E.dgChase + 6.2) || win(t, E.dgChase + 8.5, E.dgChase + 9.7);
      mo = { neckDown: 0.45, headPitch: 0.3, narrow: true, fire: f ? 1 : 0, fireLen: 3 }; }
    else if (t < E.dgCorner + 1.5) { const a = walker(t, [[E.dgCorner - 2, ...M0], [E.dgCorner + 1.5, ...MC]]); mp = a.p; my = lerp(faceTo(M0, HCo), PI / 2, seg(t, E.dgCorner - 2, E.dgCorner + 1.5)); mo = { walk: true, narrow: true, neckDown: 0.3 }; }
    else if (t < E.dgBye + 4) { mp = MC; my = PI / 2; mo = pick(t, [[0, { narrow: true, neckDown: 0.3, headPitch: 0.4 }], [E.dgStep + 1, { wide: true, neckDown: 0.2, headPitch: 0.2 }], [E.dgFly, { wide: true, neckDown: 0.4, headPitch: 0.35 }], [E.dgReunite, { happy: true, neckDown: 0.7, headPitch: 0.3, headRoll: Math.sin(t * 2) * 0.2 }],
      [E.dgPay, { happy: true, neckDown: 0.3, neckYaw: -0.5, tailSwing: win(t, E.dgPay + 4.2, E.dgPay + 5) ? 1.2 : 0 }], [E.dgDawn, { happy: true, neckDown: 0.1 }], [E.dgBye, { neckDown: 0.4, neckYaw: 0.4, headPitch: 0.2 }]]); }
    else if (t < E.dgFlyOff) { const a = walker(t, [[E.dgBye + 4, ...MC], [E.dgClutch, ...MA]]); mp = a.p; my = lerp(PI / 2, PI, seg(t, E.dgBye + 4, E.dgClutch)); mo = t < E.dgClutch ? { walk: true, happy: true } : t < E.dgStack ? { neckDown: 1.0, headPitch: 0.3 } : { happy: true, neckDown: 0.4, neckYaw: -0.6, headPitch: EGGT28.some(a2 => win(t, a2 - 0.3, a2 + 0.2)) ? 0.5 : 0.1 }; }
    else { const a = track(t, [[E.dgFlyOff, ...MA], [E.dgFlyOff + 2, 6, 8, 2], [E.dgFlyOff + 6, 34, 34, 34]]); mp = a.p; my = t < E.dgFlyOff + 0.5 ? PI : lerp(PI, Math.atan2(a.v[0], a.v[2]), seg(t, E.dgFlyOff, E.dgFlyOff + 1.5)); mo = { flap: 1, fly: true, happy: true }; }
    poseDragon28(mama28, t, mp, my, mo); parentTo(mama28.root, g); mamaL28.intensity = (mo.fire || 0) * 60;
    boulder.position.set(lerp(3, 7.5, ss(seg(t, E.dgClutch, E.dgClutch + 2.4))), 1.8, -11.6);
    // ---- Pip: in the hat → hides → first flight → Mama's nose → off with Mama
    const PS = 0.32; let po = pick(t, [[0, { headYaw: Math.sin(t * 1.5) * 0.5 }], [E.dgShadow, { wide: true, headPitch: -0.4 }], [E.dgRoar, { crouch: 1, wide: true }], [E.dgStep + 1, { headYaw: Math.sin(t * 3) * 0.4, flap: 0.3 }]]);
    if (t < E.dgFly) { parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], { hatch: 1 }); }
    if (t < E.dgFly) pipAt28(t, capHat, [0, win(t, E.dgRoar, E.dgStep) ? 0.12 : 0.36, 0], 0, PS, po);
    else if (t < E.dgReunite) { const P = track(t, [[E.dgFly, ...HW], [E.dgFly + 1.5, 11.5, 4.4, -1.2], [E.dgFly + 3, 10.9, 3.9, -1.8], [E.dgFly + 4.5, 10.2, 5.4, -1.3], [E.dgReunite, 9.8, 5.7, -1.5]]).p; pipAt28(t, g, [P[0], P[1] + Math.sin(t * 9) * 0.12, P[2]], -PI / 2, PS, { flap: 1, fly: true, wide: true, roll: Math.sin(t * 5) * 0.3 }); }
    else pipAt28(t, mama28.hd, [0, 0.22, 0.85], 0, PS / mama28.s, pick(t, [[0, { happy: true, hop: t < E.dgReunite + 2 }], [E.dgBye, { flap: 0.4, happy: true }], [E.dgFlyOff, { flap: 1, happy: true }]]));
    // ---- the clutch: alcove → stacked on my hat → hatch → five babies → hiccups → orbit my burning hat
    clutch28.forEach((e, i) => { const t0 = EGGT28[i], hk = seg(t, E.dgHatchAll + i * 0.08, E.dgHatchAll + 0.6 + i * 0.08);
      if (t < t0) { parentTo(e.root, g); poseEgg28(e, t, EGA[i], {}); }
      else if (t < t0 + 0.9) { parentTo(e.root, g); poseEgg28(e, t, arcPath(t, [[t0, ...EGA[i], 0], [t0 + 0.9, HW[0], HW[1] + i * 0.66, HW[2], 3.5]]), { rx: t * 8 }); }
      else { parentTo(e.root, capHat); poseEgg28(e, t, [sway * i * i * 0.15, 0.35 + i * 0.66, 0], { rz: -sway * i * 0.6, wobble: win(t, E.dgWobble2, E.dgHatchAll) ? 0.8 : 0, seed: i * 1.7, crack: win(t, E.dgCrack2, E.dgHatchAll), hatch: hk, vis: t < E.dgHic3 + 0.4 }); } });
    babies28.forEach((b, i) => { if (t < E.dgHatchAll + 0.2) { b.root.visible = false; return; } b.root.visible = true;
      const bo = pick(t, [[0, { headYaw: Math.sin(t * 3 + i) * 0.6 }], [E.dgMoms, { pitch: 0.3, headPitch: 0.4, happy: true }], [E.dgHic3, { fire: t < E.dgHic3 + 0.6 ? 1 : 0, wide: true, flap: 1 }], [E.dgHic3 + 0.6, { flap: 1, fly: true, happy: true }]]);
      if (t < E.dgHic3 + 0.4) { parentTo(b.root, capHat); poseDragon28(b, t, [sway * i * i * 0.15, 0.36 + i * 0.66, 0], i * 1.3 + Math.sin(t + i) * 0.3, { ...bo, seed: i }); b.root.scale.setScalar(0.2 * backOut(seg(t, E.dgHatchAll + 0.2 + i * 0.08, E.dgHatchAll + 0.7 + i * 0.08))); }
      else { parentTo(b.root, g); const a = t * 3 + i * 1.256, k = ss(seg(t, E.dgHic3 + 0.4, E.dgHic3 + 1.4)), P = [HW[0] + Math.cos(a) * 1.3 * k, lerp(HW[1] + i * 0.66, HW[1] + 0.8 + Math.sin(t * 4 + i) * 0.35, k), HW[2] + Math.sin(a) * 1.3 * k];
        poseDragon28(b, t, P, a + PI, { ...bo, seed: i }); b.root.scale.setScalar(0.2); } });
    // ---- Bloop (hides under his hat; gets PAID; babysitting rates)
    let bp, by = 0, bo = {};
    if (t < E.dgChase) { const a = act(t, [[E.dgNight, -9.5, 0.5, -23], [E.dgNest, -2.6, 0.5, -6.6]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : t > E.dgLand ? 0.3 : 0; bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgLand, { hop: t < E.dgLand + 1.5 }], [E.dgRoar, { facepalm: true }]]) }; }
    else if (t < E.dgPay) { const a = act(t, [[E.dgChase, -2.6, 0.5, -6.6], [E.dgChase + 2.5, ...BH]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : 0.6; bo = { walk: a.walk, phase: a.phase * 3 };
      if (!a.walk) { bp = [BH[0], 0.5 - 0.62 * ss(seg(t, E.dgChase + 2.5, E.dgChase + 3)) + (win(t, E.dgFly, E.dgReunite) ? 0.3 : 0), BH[2]]; bHat.scale.setScalar(lerp(1, 2.3, ss(seg(t, E.dgChase + 2.5, E.dgChase + 3)))); bHat.position.y = 0.95; } }
    else if (t < E.dgPay + 6.4) { const a = act(t, [[E.dgPay, ...BH], [E.dgPay + 3.5, ...BP2]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : faceTo(BP2, [9, 0, -1.5]); bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgPay + 3.5, { handOut: true }], [E.dgPay + 5.4, { hop: true }]]) }; }
    else if (t < E.dgDawn + 3) { bp = BP2; by = faceTo(BP2, [9, 0, -1.5]); }
    else { const a = act(t, [[E.dgDawn + 3, ...BP2], [E.dgBye + 4, 0, 0.5, -13], [E.dgBye + 6, ...BS]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : faceTo(BS, HP);
      bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, { hop: t < E.dgDawn + 4 }], [E.dgDawn + 4, {}], [E.dgBabysit, { handOut: true }], [E.dgBabysit + 5, {}], [E.dgHatchAll, { hop: true }], [E.dgMoms, {}], [E.dgHic3 + 1, { handOut: true }]]) }; }
    poseBurble(bloop6, t, bp, by, bo);
    if (win(t, E.dgPay + 6.4, E.dgDawn + 3)) { const k = ss(seg(t, E.dgPay + 6.4, E.dgPay + 6.9)) * (1 - ss(seg(t, E.dgDawn + 2.4, E.dgDawn + 3))); bloop6.B.root.rotation.z = -k * PI / 2; bloop6.B.root.position.y = 0.5 + k * 0.45; }
    inv28b.visible = win(t, E.dgPay + 3, E.dgPay + 5.4); inv28c.visible = win(t, E.dgBabysit, E.dgBabysit + 5); inv28d.visible = t >= E.dgHic3 + 1;
    gold28.visible = t >= E.dgPay + 4.4; if (t < E.dgPay + 5.2) { parentTo(gold28, g); gold28.position.set(...arcPath(t, [[E.dgPay + 4.4, -1, 1.6, 1.5, 0], [E.dgPay + 5.2, 6.9, 1.5, -5.4, 4]])); gold28.rotation.set(t * 6, t * 4, 0); gold28.scale.setScalar(0.45); }
    else { parentTo(gold28, bloop6.B.aL); gold28.position.set(0, -0.6, 0.25); gold28.rotation.set(0, 0, 0); gold28.scale.setScalar(0.45); }
    shoot28(t, g, []);
    let cam = camKeys(t, C);
    if (t < E.dgNest) { cam = follow(HP, [-4.5, 2.4, 4.5], 1.4, 52); } else if (win(t, 193, 198)) cam = follow(HP, [-5, 3.5, -3], 1.2, 54); else if (win(t, E.dgShadow, E.dgLand)) cam = { p: [2, 1.8, -12], l: L3([2, 8, 6], mp, 0.8), fov: 64 };
    return { cam, hud: true };
  }
  return { g, update };
})();
