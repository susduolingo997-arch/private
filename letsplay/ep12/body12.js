// ================================================================ EPISODE 12: "THE BIRTHDAY" — camp (party prep) ⇄ forest trail (distraction walk) → sunset party → cake rocket
// --- new NPC: Muffin, a walking cupcake (frosting expert, sneezes sprinkles)
function makeMuffin() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.8, 0.6, 0.8, '#c98f4c', 0, 0.3, 0, body); for (let i = 0; i < 4; i++) { const r = box(0.06, 0.6, 0.82, '#a8743c', -0.3 + i * 0.2, 0.3, 0, body); }
  const top = pivot(body, 0, 0.6, 0); box(0.95, 0.4, 0.95, '#ff9ad8', 0, 0.2, 0, top); box(0.6, 0.25, 0.6, '#ffb8e4', 0, 0.5, 0, top); box(0.22, 0.22, 0.22, '#e8344e', 0, 0.74, 0, top);
  for (let i = 0; i < 8; i++) box(0.08, 0.04, 0.16, ['#5ff7ff', '#ffe066', '#7cff6b'][i % 3], Math.cos(i) * 0.35, 0.42, Math.sin(i * 1.7) * 0.35, top);
  for (const x of [-0.18, 0.18]) { box(0.16, 0.18, 0.03, '#ffffff', x, 0.38, 0.41, body); box(0.08, 0.1, 0.02, '#111', x, 0.36, 0.43, body); }
  box(0.14, 0.05, 0.02, '#5a2a10', 0, 0.2, 0.41, body);
  const aL = pivot(body, -0.45, 0.35, 0), aR = pivot(body, 0.45, 0.35, 0); box(0.1, 0.35, 0.1, '#c98f4c', 0, -0.15, 0, aL); box(0.1, 0.35, 0.1, '#c98f4c', 0, -0.15, 0, aR);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, top, aL, aR };
}
function poseMuffin(m, t, p, yaw, o = {}) { m.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 8)) * 0.4 : 0), p[2]); m.root.rotation.set(0, yaw, 0); const sq = 1 + Math.sin(t * 6) * 0.05; m.body.scale.set(1 / sq, sq, 1 / sq);
  m.aL.rotation.set(o.work ? -2.2 + Math.sin(t * 14) * 0.5 : 0, 0, -0.3); m.aR.rotation.set(o.work ? -2.2 + Math.cos(t * 14) * 0.5 : 0, 0, 0.3); m.top.rotation.z = o.sneeze ? Math.sin(t * 30) * 0.2 : 0; }
const muffin = makeMuffin();
// gifts from Leggy
const flowerRing = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(0.14, 0.14, 0.14, i % 2 ? '#ff6fb8' : '#ffe066', Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38, flowerRing); } hero.hd.add(flowerRing); flowerRing.position.set(0, 0.7, 0);
const necklace = box(0.24, 0.24, 0.08, 0, 0, 0.62, 0.42, bloop6.B.body, MAT.shard); const feather = box(0.06, 0.5, 0.16, '#ffffff', 0.15, 0.95, 0, rival.hd); feather.rotation.z = -0.4;
const suspicion = t => t < E.walk ? lerp(0.1, 0.4, seg(t, 0, E.walk)) : t < E.trail1 ? 0.45 : t < E.trail2 ? 0.55 : t < E.leggyBack ? lerp(0.6, 0.95, seg(t, E.trail2, E.leggyBack)) : 1;

// ---------------------------------------------------------------- set A: camp (party prep + sunset party)
const camp12 = (() => {
  const g = mk('camp12'), st = new VSet(g), r = rng(1201);
  for (let x = -40; x <= 40; x++) for (let z = -36; z <= 4; z++) st.add(x, 0, z, z > -3 ? 'sand' : 'turf');
  const trees = []; for (let i = 0; i < 70; i++) { const x = Math.round((r() - .5) * 80), z = Math.round(-36 + r() * 18); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (Math.abs(x - 2) < 12 && z > -20)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (const [x, z] of [[-7, -3], [-6, -3], [-7, -2], [-6, -2]]) st.add(x, 1, z, 'stone'); for (const x of [-4, 10]) for (let y = 1; y <= 5; y++) st.add(x, y, -12, 'log');
  st.build(); seaSet(g);
  const fire = pivot(g, -6.5, 1.5, -2.5); box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; const flame = box(0.5, 0.7, 0.5, 0, 0, 0.5, 0, fire, basic('#ffb43a')); const fl = new THREE.PointLight('#ff8a2a', 8, 12, 1.5); fl.position.set(0, 1.2, 0); fire.add(fl);
  const tent = pivot(g, -12, 0.5, -8); for (const s of [-1, 1]) { const w = box(0.1, 3.2, 3.6, '#2ec4b6', s * 0.9, 1.3, 0, tent); w.rotation.z = s * 0.55; }
  const ban = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.4, 0.08), new THREE.MeshBasicMaterial({ map: bannerTex('HAPPY BIRTHDAY LEGGY') })); ban.position.set(3, 5.0, -12); g.add(ban);
  const balloons = Array.from({ length: 10 }, (_, i) => { const b = new THREE.Group(); box(0.7, 0.85, 0.7, 0, 0, 0, 0, b, new THREE.MeshLambertMaterial({ color: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b', '#ff6b6b'][i % 5], emissive: '#222', emissiveIntensity: 0.2 })); box(0.03, 2, 0.03, '#ffffff', 0, -1.4, 0, b); g.add(b); b.userData.base = [-6 + (i % 5) * 4.2 + (i > 4 ? 2 : 0), 3.6 + (i % 3) * 0.6, i > 4 ? -10.5 : -1.5 - (i % 2) * 6]; return b; });
  const lanterns = [[-3, -1], [9, -1], [-3, -10], [9, -10]].map(([x, z]) => { const l = new THREE.PointLight('#ffb36b', 0, 14, 1.4); l.position.set(x, 3, z); g.add(l); box(0.4, 0.5, 0.4, 0, x, 3, z, g, basic('#ffd27a')); return l; });
  // the cake (own group so it can launch)
  const cakeG = new THREE.Group(); cakeG.position.set(3, 0.5, -6); g.add(cakeG); const cv = new VSet(cakeG, true), cr = rng(1202);
  const fly = (x, y, z) => ({ t1: E.boom, fly: [x * 2.6 + (cr() - .5) * 3, 5 + cr() * 7, z * 2.6 + (cr() - .5) * 3], spin: [cr() * 6, cr() * 6, cr() * 6], floor: 0.6 });
  let i1 = 0, i2 = 0, i3 = 0;
  for (let y = 0; y <= 1; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) cv.add(x, y, z, 'quartz', { t0: E.tier1 + 0.3 + (i1++) * 0.045, ...fly(x, y, z) });
  for (let y = 2; y <= 3; y++) for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) cv.add(x, y, z, 'jam', { t0: E.tier2 + 0.3 + (i2++) * 0.07, ...fly(x, y, z) });
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) { cv.add(x, 4, z, 'basalt', { t0: E.burn - 0.6 + (i3) * 0.1, t1: E.refrost + 2 }); cv.add(x, 4, z, 'polka', { t0: E.refrost + 2 + (i3++) * 0.18, ...fly(x, 4, z) }); }
  cv.build();
  const candles = Array.from({ length: 6 }, (_, i) => { const c = new THREE.Group(); box(0.12, 0.6, 0.12, '#ffffff', 0, 0.3, 0, c); const f = box(0.14, 0.2, 0.14, 0, 0, 0.7, 0, c, basic('#ffb43a')); c.userData.f = f; const a = i / 6 * Math.PI * 2; c.position.set(Math.cos(a) * 0.9, 4.5, Math.sin(a) * 0.9); cakeG.add(c); return c; });
  // particles
  smoke(0, E.party, 0.6, [-6.5, 2.4, -2.5], { n: 2, size: 0.25, life: 2, up: 1.5, grav: -0.6, colors: ['#9a9490', '#c8c2be'] });
  smoke(E.burn, E.muffin, 0.2, [3, 5.4, -6], { n: 4, size: 0.5, life: 2, up: 1.6, grav: -0.8, colors: ['#3a3236', '#5a4a48', '#7a7470'] });
  for (let t = E.refrost; t < E.cakeDone; t += 0.6) burst(t, [3 + Math.sin(t * 2) * 1.2, 5.4, -6 + Math.cos(t * 2) * 1.2], { n: 14, colors: ['#5ff7ff', '#ffe066', '#7cff6b', '#ff6fb8'], speed: 3, size: 0.1, life: 0.9, grav: 8, up: 2 });
  for (let t = E.light; t < E.boom; t += 0.15) { const y = t < E.launch ? 5.4 : 0.5 + 5 + launchY(t); burst(t, [3, y, -6], { n: 6, colors: ['#ffe066', '#ffffff', '#ff6a1a'], speed: 3, size: 0.12, life: 0.6, grav: 2, up: 2 }); }
  burst(E.launch, [3, 1, -6], { n: 120, colors: ['#ffffff', '#ffe066', '#ff6a1a'], speed: 8, size: 0.3, life: 1.6, grav: 6, up: 2 });
  for (let k = 0; k < 10; k++) burst(E.boom + k * 0.5, [3 + Math.sin(k) * 4, 7 + k * 0.3, -6 + Math.cos(k) * 4], { n: 70, colors: ['#ffffff', '#ff9ad8', '#ffb8e4', '#e8344e', '#5ff7ff'], speed: 6, size: 0.25, life: 2.6, grav: 6, up: 2 });
  for (let k = 0; k < 6; k++) burst(E.party + 0.3 + k * 0.4, [3 + (k - 2.5) * 2.4, 6, -9], { n: 40, colors: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b'], speed: 4, size: 0.14, life: 2, grav: 3, up: 3 });
  function launchY(t) { if (t < E.launch) return 0; if (t < E.launch + 5) return 32 * ss(seg(t, E.launch, E.launch + 5)); return 32 * (1 - ss(seg(t, E.launch + 5, E.boom))); }
  const C1 = [[0, 14, 6, 12, 2, 2, -5, 55], [6.5, 11, 5, 11, 2, 2, -5, 52], [6.6, 0.6, 2.0, 2.6, -0.2, 2.0, -1.2, 44], [12.5, 0.4, 2.0, 2.2, -0.2, 2.0, -1.2, 42],
    [12.6, -6, 3, 6, 0, 1.4, -2, 52], [21.5, -5, 3, 7, 0, 1.4, -2, 52], [21.6, 4, 2.6, 3, 0, 1.6, -3, 48], [26.7, 3.4, 2.6, 2.6, 0, 1.6, -3, 48],
    [26.8, -6, 2.2, 1, -4.4, 1.6, -3.4, 44], [32.5, -6.4, 2.2, 0.6, -4.4, 1.6, -3.4, 44], [32.6, 8, 4, 6, 1, 1.5, -4, 52], [37.1, 7, 4, 7, 1, 1.5, -4, 52],
    [37.2, 6.6, 2.4, -1.4, 4, 1.6, -4.4, 44], [42.5, 6.2, 2.4, -1.8, 4, 1.6, -4.4, 44]];
  const C2 = [[E.camp2, 12, 7, 6, 3, 2, -6, 52], [70.7, 10, 6, 7, 3, 2.4, -6, 50], [70.8, 3, 9, 4, 3, 2, -6, 52], [75.7, 4, 9, 5, 3, 2.4, -6, 52],
    [75.8, -0.4, 2.2, -2.6, 1.6, 2.6, -5, 44], [79.7, -0.6, 2.2, -3.0, 1.6, 2.6, -5, 44], [79.8, 3, 3, 4, 3, 4.6, -12, 50], [84.3, 3, 2.6, 3, 3, 4.6, -12, 50],
    [84.4, -1.2, 2.0, 1.8, -0.4, 2.0, -1.6, 44], [89.7, -1.4, 2.0, 1.4, -0.4, 2.0, -1.6, 42], [89.8, 12, 5, 8, 3, 2, -6, 52], [E.trail2, 10, 4.6, 8, 3, 2.4, -6, 52]];
  const C3 = [[E.camp3, 7, 6.4, -1, 3, 5, -6, 48], [129.9, 6.4, 6.2, -1.6, 3, 5, -6, 44], [130.0, 9, 4, 2, 3, 3, -6, 50], [138.7, 8, 4, 3, 3, 3, -6, 50],
    [138.8, -2, 2.0, 3, -10, 0.8, -4, 48], [142.9, -2.4, 2.0, 2.6, -6, 0.8, -4, 48], [143.0, -1.6, 1.6, 0.2, 0, 0.9, -3.6, 42], [147.5, -1.8, 1.6, -0.2, 0, 0.9, -3.6, 40],
    [147.6, 1.2, 2.0, 0.6, 0, 1.2, -3.4, 44], [153.1, 1.6, 2.0, 0.4, 0, 1.2, -3.4, 44], [153.2, 8, 7, 0, 3, 4.6, -6, 46], [159.5, 6, 7, 1, 3, 4.6, -6, 46],
    [159.6, 12, 5, 8, 3, 2, -6, 52], [163.9, 11, 5, 8, 3, 2, -6, 52], [164.0, -14, 2.4, 3, -4, 1.4, -3, 50], [167.1, -13, 2.4, 3.6, -4, 1.4, -3, 50],
    [167.2, -6.6, 2.2, 0.2, -3.4, 1.6, -2.6, 44], [172.7, -6.8, 2.2, -0.2, -3.4, 1.6, -2.6, 44], [172.8, 0.6, 2.2, 2.0, -0.2, 2.2, -1.2, 42], [176.0, 0.6, 2.2, 1.6, -0.2, 2.2, -1.2, 42],
    [176.1, 3.6, 2.2, 1.2, 2.2, 1.8, -1.4, 44], [179.1, 3.4, 2.2, 1.0, 2.2, 1.8, -1.4, 44], [179.2, -1, 2.4, 3.4, -2, 1.8, -2, 48], [188.9, -1.4, 2.4, 2.8, -2, 1.8, -2, 44],
    [189.0, 12, 6, 10, 3, 2, -6, 52], [193.5, 11, 6, 10, 3, 2, -6, 52], [193.6, 3, 3.6, 5, 3, 4, -8, 52], [196.3, 3, 3.4, 4, 3, 4, -8, 52],
    [196.4, 5, 6.6, -2, 3, 5.4, -6, 44], [205.7, 4.6, 6.4, -2.4, 3, 5.4, -6, 40],
    [E.boom + 1.4, 12, 7, 12, 3, 1, -5, 55], [220.3, 11, 6.4, 11, 3, 1, -5, 55], [220.4, 6.8, 2.4, 1.2, 4.2, 1.6, -2.6, 46], [226.3, 7, 2.4, 0.8, 4.2, 1.6, -2.6, 46],
    [226.4, -4.6, 2.4, 2.6, -3.4, 1.6, -2.2, 44], [231.1, -4.8, 2.4, 2.2, -3.4, 1.6, -2.2, 44], [231.2, 10, 5, 9, 2, 1.4, -3, 52], [233.5, 9, 5, 9, 2, 1.4, -3, 52],
    [233.6, 0.4, 2.0, 2.4, -0.2, 2.1, -1.2, 44], [239.5, 0.2, 2.0, 2.0, -0.2, 2.1, -1.2, 42], [239.6, 4.0, 2.0, 0.8, 2.6, 1.6, -1.8, 44], [243.5, 3.8, 2.0, 0.6, 2.6, 1.6, -1.8, 44],
    [243.6, 5.4, 2.2, 0.4, 4.2, 1.8, -2.2, 44], [248.5, 5.2, 2.2, 0.2, 4.2, 1.8, -2.2, 44], [248.6, 1.6, 1.3, -0.2, 0.6, 0.8, -2.2, 42], [253.1, 1.4, 1.3, -0.4, 0.6, 0.8, -2.2, 42],
    [253.2, 1.4, 2.6, 7, 1.4, 1.6, -2, 52], [262.9, 1.2, 2.6, 6, 1.4, 1.6, -2, 50], [263.0, 0.6, 2.0, 2.4, -0.2, 2.1, -1.2, 44], [268.5, 0.4, 2.0, 2.0, -0.2, 2.1, -1.2, 42],
    [268.6, 2.2, 2.2, 1.0, 1.6, 1.6, -1.6, 44], [277.1, 2.4, 2.2, 0.6, -2, 1.6, -2.6, 46], [277.2, -0.4, 2.2, 3.0, -0.2, 2.0, -1.2, 46], [280.5, -0.4, 2.2, 2.6, -0.2, 2.0, -1.2, 44],
    [280.6, -1.8, 2.4, 5.6, -1.8, 1.5, -1.6, 48], [E.logo, -1.8, 2.4, 5.2, -1.8, 1.5, -1.6, 48]];
  function update(t) {
    flame.scale.set(1, 1 + Math.sin(t * 13) * 0.2, 1); fl.intensity = 8 + Math.sin(t * 17) * 1.5; cv.update(t);
    [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill].forEach(m => m.visible = false); crownM.visible = true;
    golem.root.visible = mailBird.root.visible = crownProp.visible = sled.visible = judge.root.visible = false; seals.forEach(s => s.root.visible = false); rival.wig.visible = false; rival.shine.visible = true;
    ban.visible = t > E.banner; balloons.forEach((b, i) => { b.visible = t > E.banner + i * 0.3; const B = b.userData.base; b.position.set(B[0], B[1] + Math.sin(t * 1.5 + i) * 0.2, B[2]); b.rotation.z = Math.sin(t + i) * 0.1; });
    lanterns.forEach(l => l.intensity = t > E.party - 4 ? 12 : 0);
    const ly0 = launchY(t); cakeG.position.set(3, 0.5 + ly0, -6); cakeG.rotation.set(0, t > E.launch ? (t - E.launch) * 3 : 0, t > E.launch ? Math.sin(t * 4) * 0.15 : 0); cakeG.visible = t > E.tier1;
    candles.forEach(c => { c.visible = win(t, E.candles, E.boom); c.userData.f.visible = t > E.light; c.userData.f.scale.setScalar(1 + Math.sin(t * 30) * 0.3); });
    flowerRing.visible = t > E.gifts; necklace.visible = t > E.gifts + 1.6; feather.visible = t > E.gifts + 3;
    const hid = win(t, E.leggyBack, E.leggyBack + 3.2), frosted = t > E.boom;
    // hero
    const o = { t, p: [-0.2, 0.5, -1.2], yaw: 0.2, face: 'normal' };
    if (t < E.walk) { if (t < 4) o.wave = true; else o.face = 'smug'; }
    else if (t < E.camp2) { o.yaw = yawXZ([-0.2, -1.2], [-4.4, -3.4]); o.wave = t < 30; if (t > 32.6) { o.yaw = yawXZ([-0.2, -1.2], [3, -6]); o.hips = true; } }
    else if (t < E.camp3) { o.p = [-0.4, 0.5, -1.6]; o.yaw = yawXZ([-0.4, -1.6], [3, -6]); o.face = 'smug'; o.hold = t < 79.8; if (t > 84.4) { o.yaw = 0.2; o.hips = true; } }
    else if (t < E.leggyBack) { o.p = [-0.4, 0.5, -1.6]; o.yaw = yawXZ([-0.4, -1.6], [3, -6]); o.face = t < E.muffin ? 'scared' : 'smug'; o.panic = win(t, E.camp3, E.camp3 + 4); if (win(t, E.muffin, E.refrost)) o.yaw = yawXZ([-0.4, -1.6], [-6, -4]); }
    else { o.p = [-0.2, 0.5, -1.2]; o.yaw = yawXZ([-0.2, -1.2], [-3.4, -2.6]); o.face = hid ? 'scared' : 'smug'; if (hid) { o.p = [1.2, 0.5, -3.0]; o.sit = 1; }
      if (win(t, E.party, E.light)) { o.wave = true; o.yaw = 0.3; } if (win(t, E.light, E.boom)) { o.yaw = yawXZ([-0.2, -1.2], [3, -6]); o.headPitch = t > E.launch ? -0.7 : 0; o.face = t > E.launch ? 'scared' : 'smug'; o.panic = t > E.launch; }
      if (frosted) { o.face = 'smug'; o.yaw = 0.3; } if (win(t, E.toast, E.photo)) { o.wave = true; o.yaw = 0.15; } if (t > E.photo) { o.yaw = 0.2; o.hips = t > 280.6; } }
    pose(hero, o); parentTo(hero.root, g); hero.root.visible = true;
    // bloop
    let bp = [2.6, 0.5, -1.4], by = yawXZ([2.6, -1.4], [-0.2, -1.2]), bo = {};
    if (t > 37.2 && t < E.leggyBack) { const a = t * 0.6; bp = [3 + Math.cos(a) * 4.6, 0.5, -6 + Math.sin(a) * 4.6]; by = Math.atan2(-Math.sin(a), Math.cos(a)); bo = { walk: 1, phase: t * 14 }; if (win(t, E.camp3, E.muffin)) { bp = [5.4, 0.5, -1.8]; by = Math.PI; bo = { facepalm: true }; } }
    if (t >= E.leggyBack) { bp = hid ? [4.6, 0.5, -3.0] : [2.6, 0.5, -1.4]; bo = hid ? {} : (win(t, E.party, E.light) || win(t, E.photo, E.photo + 4) ? { hop: true } : {}); if (t > E.bill) bo = { handOut: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; card.visible = win(t, E.bill, 274.4); card.scale.set(1, 1, 1); card.position.y = -0.62;
    // prestin
    let rp = [4.6, 0.5, -0.4], ry = yawXZ([4.6, -0.4], [-0.2, -1.2]), ro = { hips: true };
    if (t > E.walk && t < E.leggyBack + 6) { const w = walker(t, [[E.walk, 4.6, 0.5, -0.4], [E.walk + 8, -24, 0.5, -2]]); rp = w.p; ry = w.yaw; ro = { walk: w.walk, phase: w.phase }; if (t > E.walk + 8) rp = [-60, -10, 0]; }
    if (t >= E.leggyBack + 6) { const w = walker(t, [[E.leggyBack + 6, -20, 0.5, -2], [E.gifts, 4.2, 0.5, -2.2]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : yawXZ([4.2, -2.2], [-0.2, -1.2]); ro = w.speed > 0.1 ? { walk: w.walk, phase: w.phase } : (win(t, E.party, E.light) ? { hop: true } : (frosted ? { hips: true } : {})); if (t > E.photo) ro = { flip: true }; }
    poseRival(rival, t, rp, ry, ro); parentTo(rival.root, g); rival.root.visible = true;
    // leggy
    let lp = [-4.4, 0.5, -3.4], ly = 0.8, ls = 0.3;
    if (t > E.walk && t < E.leggyBack) { const w = walker(t, [[E.walk + 0.6, -4.4, 0.5, -3.4], [E.walk + 8.4, -24, 0.5, -3.6]]); lp = w.p; ly = w.yaw; ls = 2; if (t > E.walk + 8.4) lp = [-60, -10, 0]; }
    if (t >= E.leggyBack) { const w = walker(t, [[E.leggyBack, -22, 0.5, -3], [E.leggyBack + 3.2, -3.4, 0.5, -2.6]]); lp = w.p; ly = w.speed > 0.1 ? w.yaw : 1.0; ls = w.speed > 0.1 ? 2.4 : 0.4; if (frosted && t < E.toast) { lp = [-1 + Math.sin(t * 0.8) * 3, 0.5, -3]; ly = Math.cos(t * 0.8) > 0 ? Math.PI / 2 : -Math.PI / 2; ls = 1.5; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.root.rotation.set(0, ly, 0); L6.body.rotation.z = 0;
    if (t < E.walk && t > 26.8) L6.hd.rotation.y = Math.sin(t * 2) * 0.6;
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // puff (the oven)
    parentTo(puff.root, g); puff.root.visible = true; let fp = head, fy = ly, fo = {};
    if (t < E.walk) fp = [-6.5, 1.6, -2.5]; else if (t < E.leggyBack) { fp = [3 + Math.cos(t * 0.4) * 4, 0.6 + Math.abs(Math.sin(t * 3)) * 0.3, -6 + Math.sin(t * 0.4) * 4]; fy = t * 0.4; fo = { big: win(t, E.burn - 2, E.burn + 4) }; if (t < E.camp2) fp = [-6.5, 1.6, -2.5]; }
    else if (t < E.toast) { fp = [-6.5, 1.6, -2.5]; if (win(t, E.light - 1.4, E.light + 0.8)) { const k = seg(t, E.light - 1.4, E.light); fp = [lerp(-6.5, 3, k), lerp(1.6, 5.8, k) + Math.sin(k * Math.PI) * 2, lerp(-2.5, -6, k)]; } if (t > E.boom) fp = [-0.6, 0.6, -0.2]; }
    else fp = [0.6, 0.6, -2.2];
    poseMag(puff, t, fp, fy, fo);
    // muffin
    parentTo(muffin.root, g); muffin.root.visible = t > E.muffin; let mp = [0, 0.5, -3.6], my = 0, mo = {};
    if (t < E.muffin + 4) { const w = walker(t, [[E.muffin, -16, 0.5, -4], [E.muffin + 4, 0, 0.5, -3.6]]); mp = w.p; my = w.yaw; mo = { hop: true }; }
    else if (win(t, E.refrost, E.cakeDone + 1)) { const a = (t - E.refrost) * 1.2; mp = [3 + Math.cos(a) * 3, 0.5, -6 + Math.sin(a) * 3]; my = Math.atan2(-Math.cos(a), -Math.sin(a)); mo = { work: true, sneeze: Math.floor(t * 2) % 3 === 0 }; }
    else if (t > E.leggyBack) { mp = hid ? [5.4, 0.5, -4.2] : [0.6, 0.5, -2.2]; my = 0.2; mo = { hop: win(t, E.party, E.light) || t > E.photo }; }
    poseMuffin(muffin, t, mp, my, mo);
    // goose crashes the party after the splat
    parentTo(goose.root, g); goose.root.visible = t > E.boom + 3; goose.root.position.set(7.2, 0.5, -0.8); goose.root.rotation.y = -0.6; goose.neck.rotation.x = Math.sin(t * 3) * 0.2;
    let cam = camKeys(t, t < E.trail1 ? C1 : t < E.trail2 ? C2 : C3);
    if (win(t, 66.0, 70.8)) { const a = (t - 66) * 0.25; cam = { p: [3 + Math.sin(a) * 11, 4, -6 + Math.cos(a) * 11], l: [3, 1.6, -6], fov: 50 }; }
    if (win(t, 205.8, E.boom + 1.4)) cam = { p: [12, 2, 6], l: [3, cakeG.position.y + 2, -6], fov: 58 };
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the forest trail (Prestin keeps Leggy busy)
const trail = (() => {
  const g = mk('trail'), st = new VSet(g), r = rng(1203);
  for (let x = -40; x <= 40; x++) for (let z = -24; z <= 24; z++) st.add(x, 0, z, Math.abs(z) <= 1 ? 'path' : 'turf');
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 80), z = Math.round((r() < .5 ? -1 : 1) * (4 + r() * 20)); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const flowers = []; for (let i = 0; i < 60; i++) { const x = (r() - .5) * 60, z = (r() < .5 ? -1 : 1) * (1.6 + r() * 3); flowers.push(box(0.22, 0.3, 0.22, 0, x, 0.65, z, g, MAT.flower)); }
  const butterflies = Array.from({ length: 5 }, (_, i) => { const b = makeBird(['#ffe066', '#5ff7ff', '#ff6fb8', '#7cff6b', '#ffffff'][i]); b.root.scale.setScalar(0.4); g.add(b.root); return b; });
  const C = [[E.trail1, -26, 3, 8, -18, 1.5, 0, 52], [47.7, -18, 3, 8, -12, 1.5, 0, 52], [47.8, -6, 2.4, 3, -12, 2, -1.5, 46], [53.5, -7, 2.4, 3.4, -12, 2, -1.5, 46],
    [53.6, -7, 1.8, 5.0, -12.4, 0.9, 1.0, 46], [58.7, -7.4, 1.8, 4.6, -12.4, 0.9, 1.0, 46], [58.8, -14, 4, 8, -11, 1.5, 0, 52], [E.camp2, -12, 4, 9, -11, 1.5, 0, 52],
    [E.trail2, 8, 3, 7, 0, 1.5, 0, 52], [106.3, 6, 3, 8, 0, 1.5, 0, 52], [106.4, 0, 10, 10, 0, 0.5, 0, 52], [112.1, 2, 10, 10, 0, 0.5, 0, 52],
    [112.2, -5, 2.2, 5, -1, 1.0, 1.2, 46], [118.5, -5.4, 2.2, 4.6, -1, 1.0, 1.2, 46], [118.6, -4, 2.4, 3, -2, 2.2, 0, 46], [E.camp3, -4.4, 2.4, 2.6, -2, 2.2, 0, 46]];
  function update(t) {
    [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true;
    hero.root.visible = false; bloop6.B.root.visible = false; puff.root.visible = false; muffin.root.visible = false; goose.root.visible = false; rival.wig.visible = false; rival.shine.visible = true;
    butterflies.forEach((b, i) => { const a = t * 0.6 + i * 1.3; b.root.position.set(-10 + Math.cos(a) * 6 + (t > E.trail2 ? 10 : 0), 2.4 + Math.sin(t * 2 + i), Math.sin(a) * 3); b.root.rotation.y = a + Math.PI / 2; const f = Math.sin(t * 20 + i) * 0.8; b.wL.rotation.z = f; b.wR.rotation.z = -f; });
    let rp, ry, ro = {}, lp, ly, ls = 1.5;
    if (t < E.trail2) { const w = walker(t, [[E.trail1, -26, 0.5, -0.6], [53, -12, 0.5, -0.6], [E.camp2, -6, 0.5, -0.6]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : 0; ro = w.speed > 0.1 ? { walk: w.walk, phase: w.phase } : {}; if (win(t, 47.8, 53.6)) ro = { point: true }; if (t > 58.8) ro = { flip: true, hop: true };
      const lw = walker(t, [[E.trail1, -29, 0.5, 0.8], [52, -14, 0.5, 0.8], [E.camp2, -11, 0.5, 0.8]]); lp = lw.p; ly = lw.speed > 0.1 ? lw.yaw : (t > 47.8 && t < 53.6 ? -Math.PI / 2 : 1.4); ls = lw.speed > 0.1 ? 2 : 0.3; }
    else { const a = (t - E.trail2) * 0.9; lp = [Math.sin(a) * 2.4 - (t - E.trail2) * 0.15, 0.5, Math.cos(a * 0.5) * 1.4]; ly = -Math.PI / 2 + Math.sin(a) * 0.8; ls = 2; rp = [lp[0] - 2.4, 0.5, -lp[2] * 0.6]; ry = Math.PI / 2; ro = { panic: t < 112.2, hips: t > 118.6 };
      if (win(t, 112.2, 118.6)) { lp = [-1, 0.5, 1.2]; ly = 0; ls = 0.3; rp = [-4, 0.5, 0]; ro = { hips: true }; } }
    poseRival(rival, t, rp, ry, ro); parentTo(rival.root, g); rival.root.visible = true;
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.root.rotation.set(0, ly, 0);
    if (win(t, 53.6, 58.8) || win(t, 112.2, 118.6)) { L6.hd.rotation.x = 0.7; L6.body.position.y = 0.9; }
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();
