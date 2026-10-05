// ================================================================ EPISODE 11: "THE HEIST" — dusk camp → night plaza → inside the Honk & Pawn (lasers) → rooftop chase → fountain
// --- new NPC: Bonk-bot, the goose's security robot (one wheel, red visor, flashlight cone)
function makeBot() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), grey = new THREE.MeshLambertMaterial({ color: '#8a93a8' });
  const wheel = pivot(body, 0, 0.4, 0); box(0.3, 0.8, 0.8, '#2a2a33', 0, 0, 0, wheel);
  box(1.0, 1.3, 0.8, 0, 0, 1.4, 0, body, grey); box(1.04, 0.16, 0.84, '#ffd400', 0, 0.9, 0, body);
  const hd = pivot(body, 0, 2.1, 0); box(0.8, 0.6, 0.7, 0, 0, 0.3, 0, hd, grey); const visor = box(0.66, 0.16, 0.05, 0, 0, 0.36, 0.36, hd, new THREE.MeshBasicMaterial({ color: '#ff2a3a' }));
  box(0.05, 0.4, 0.05, '#555', 0.25, 0.8, 0, hd); const bulb = box(0.14, 0.14, 0.14, 0, 0.25, 1.05, 0, hd, new THREE.MeshBasicMaterial({ color: '#ff2a3a' }));
  const aL = pivot(body, -0.62, 1.8, 0), aR = pivot(body, 0.62, 1.8, 0); box(0.2, 0.9, 0.2, 0, 0, -0.45, 0, aL, grey); box(0.2, 0.9, 0.2, 0, 0, -0.45, 0, aR, grey);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4a0', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
  cone.rotation.x = -Math.PI / 2; cone.position.set(0, 0.2, 3.3); hd.add(cone);
  const torch = new THREE.SpotLight('#fff4c0', 30, 14, 0.45, 0.5, 1.2); torch.position.set(0, 0.3, 0.4); hd.add(torch); const tgt = new THREE.Object3D(); tgt.position.set(0, -0.6, 4); hd.add(tgt); torch.target = tgt;
  root.traverse(o => { if (o.isMesh && o !== cone) o.castShadow = true; });
  return { root, body, wheel, hd, aL, aR, cone, torch, bulb, visor };
}
function poseBot(b, t, p, yaw, o = {}) {
  b.root.position.set(p[0], p[1], p[2]); b.root.rotation.set(0, yaw + (o.spin || 0), 0); b.wheel.rotation.x = t * 6 * (o.roll ?? 1);
  b.hd.rotation.set(o.look || 0, Math.sin(t * 1.4) * 0.5 * (o.scan ? 1 : 0.2), 0); b.body.rotation.z = o.tilt || 0;
  b.aL.rotation.set(o.alarm ? -2.6 + Math.sin(t * 20) * 0.4 : 0, 0, 0); b.aR.rotation.set(o.alarm ? -2.6 + Math.cos(t * 20) * 0.4 : (o.dance ? -2.4 + Math.sin(t * 8) * 0.5 : 0), 0, 0);
  b.bulb.material.color.set(o.alarm && Math.floor(t * 6) % 2 ? '#ffffff' : '#ff2a3a'); b.cone.visible = !o.off; b.torch.intensity = o.off ? 0 : 30;
}
const bot = makeBot(), crowns = Array.from({ length: 20 }, () => { const c = makeCrown(); c.scale.setScalar(1.1); return c; });
const marbles = Array.from({ length: 14 }, (_, i) => box(0.18, 0.18, 0.18, ['#5aa8ff', '#ffffff', '#ff6fb8'][i % 3], 0, 0, 0, new THREE.Group()));
const receipt = box(0.5, 0.6, 0.03, '#ffffff', 0, 0, 0, new THREE.Group());
const stealth = t => t < E.bot ? 0.05 : t < E.hide ? lerp(0.1, 0.75, seg(t, E.bot, E.hide)) : t < E.prestin ? lerp(0.75, 0.2, seg(t, E.hide, E.prestin)) : t < E.lasers ? 0.15 : t < E.pots ? (t > E.limbo ? 0.55 : 0.35) : t < E.pots + 4 ? 0.85 : t < E.touch ? 0.3 : t < E.splash ? 1 : 0;

// ---------------------------------------------------------------- set A: camp at dusk (planning)
const camp11 = (() => {
  const g = mk('camp11'), st = new VSet(g), r = rng(1101);
  for (let x = -36; x <= 36; x++) for (let z = -36; z <= 4; z++) st.add(x, 0, z, z > -3 ? 'sand' : 'turf');
  const trees = []; for (let i = 0; i < 60; i++) { const x = Math.round((r() - .5) * 72), z = Math.round(-36 + r() * 18); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (const [x, z] of [[-1, -4], [0, -4], [-1, -3], [0, -3]]) st.add(x, 1, z, 'stone'); st.build(); seaSet(g);
  const fire = pivot(g, -0.5, 1.5, -3.5); box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; const flame = box(0.5, 0.7, 0.5, 0, 0, 0.5, 0, fire, basic('#ffb43a')); const fl = new THREE.PointLight('#ff8a2a', 10, 12, 1.5); fl.position.set(0, 1.2, 0); fire.add(fl);
  const tent = pivot(g, -8, 0.5, -7); for (const s of [-1, 1]) { const w = box(0.1, 3.2, 3.6, '#2ec4b6', s * 0.9, 1.3, 0, tent); w.rotation.z = s * 0.55; }
  smoke(0, E.town, 0.6, [-0.5, 2.4, -3.5], { n: 2, size: 0.25, life: 2, up: 1.5, grav: -0.6, colors: ['#9a9490', '#c8c2be'] });
  const C = [[0, 10, 4, 9, -0.5, 1.4, -3, 52], [7.3, 7, 3.4, 7, -0.5, 1.4, -3, 50], [7.4, 1.6, 2.1, 1.6, -0.2, 2.2, -1.2, 44], [13.1, 1.2, 2.1, 1.2, -0.2, 2.2, -1.2, 40],
    [13.2, -4, 3, 6, -1, 1.4, -2, 52], [24.7, -3, 3, 7, -1, 1.4, -2, 52], [24.8, 0.4, 2.0, 2.4, -0.2, 2.0, -1.2, 46], [29.7, 0.0, 2.0, 2.0, -0.2, 2.0, -1.2, 42],
    [29.8, 6, 2.6, 4, -1, 1.5, -2.5, 50], [35.9, 5, 2.6, 4.6, -1, 1.5, -2.5, 50], [36.0, -1, 0.8, 4, -1, 2, -2.5, 52], [41.1, -1.5, 0.9, 4.2, -1, 2, -2.5, 52],
    [41.2, 6, 3, 8, 6, 1, -2, 52], [E.town, 8, 3, 8, 12, 1, -2, 52]];
  function update(t) {
    flame.scale.set(1, 1 + Math.sin(t * 13) * 0.2, 1); fl.intensity = 10 + Math.sin(t * 17) * 2;
    [rod, drill, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand].forEach(m => m.visible = false); crownM.visible = false;
    golem.root.visible = mailBird.root.visible = crownProp.visible = goose.root.visible = judge.root.visible = sled.visible = false; seals.forEach(s => s.root.visible = false); rival.wig.visible = false; rival.shine.visible = true;
    const go = t > 41.2, wk = (K, ph) => walker(t, K);
    const o = { t, p: [-0.2, 0.5, -1.2], yaw: 0.2, face: t < 7.4 ? 'scared' : 'smug' }; if (t < 7.4) o.headPitch = -0.3; if (win(t, 24.8, 29.8)) o.hips = true; if (win(t, 36, 41.2)) o.wave = true;
    if (go) { const w = wk([[41.2, -0.2, 0.5, -1.2], [E.town, 14, 0.5, -2]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; o.lean = 0.3; }
    pose(hero, o); parentTo(hero.root, g);
    let pp = [2.2, 0.5, -1.8], py = yawXZ([2.2, -1.8], [-0.2, -1.2]), po = win(t, 13.2, 19.2) ? { flip: true } : { hips: true }; if (go) { const w = wk([[41.6, 2.2, 0.5, -1.8], [E.town, 16, 0.5, -3]]); pp = w.p; py = w.yaw; po = { walk: w.walk, phase: w.phase }; }
    poseRival(rival, t, pp, py, po); parentTo(rival.root, g); rival.root.visible = true;
    let bp = [-2.6, 0.5, -1.6], by = yawXZ([-2.6, -1.6], [-0.2, -1.2]), bo = win(t, 19.2, 24.8) ? { hop: true } : {}; if (go) { const w = wk([[42, -2.6, 0.5, -1.6], [E.town, 12, 0.5, -1]]); bp = w.p; by = w.yaw; bo = { walk: 1, phase: w.phase }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; drill.visible = win(t, 19.2, 24.8);
    let lp = [-4.6, 0.5, -3.2], ly = 0.8, ls = 0.3; if (go) { const w = wk([[42.4, -4.6, 0.5, -3.2], [E.town, 10, 0.5, -4]]); lp = w.p; ly = w.yaw; ls = 2; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.root.rotation.z = 0; L6.body.rotation.z = 0;
    parentTo(puff.root, g); puff.root.visible = true; poseMag(puff, t, rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3)), ly, { hop: win(t, 19.2, 24.8) });
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the plaza at night + inside the Honk & Pawn
const plaza = (() => {
  const g = mk('plaza'), st = new VSet(g), r = rng(1102);
  for (let x = -32; x <= 32; x++) for (let z = -26; z <= 12; z++) st.add(x, 0, z, Math.abs(x + 2) + Math.abs(z + 2) < 16 ? 'path' : 'turf');
  const trees = []; for (let i = 0; i < 40; i++) { const x = Math.round((r() - .5) * 62), z = Math.round(-25 + r() * 36); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 5) || (Math.abs(x) < 20 && z > -18)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 2)); }
  // the shop: walls 1..6, roof 7 with a skylight hole, door gap at the front
  for (let y = 1; y <= 6; y++) for (let x = 6; x <= 14; x++) for (let z = -15; z <= -8; z++) { const edge = x === 6 || x === 14 || z === -15 || z === -8; if (!edge) continue; if (z === -8 && (x === 9 || x === 10) && y <= 2) continue; st.add(x, y, z, y === 6 ? 'slate' : 'castle'); }
  for (let x = 6; x <= 14; x++) for (let z = -15; z <= -8; z++) { if ((x === 9 || x === 10) && (z === -12 || z === -11)) continue; st.add(x, 7, z, 'slate'); }
  // fountain
  for (let x = -9; x <= -3; x++) for (let z = -7; z <= -1; z++) if (Math.max(Math.abs(x + 6), Math.abs(z + 4)) === 3) st.add(x, 1, z, 'castle');
  st.build();
  const pool = new THREE.Mesh(GEO, MAT.water); pool.scale.set(5, 0.8, 5); pool.position.set(-6, 0.9, -4); g.add(pool); const jet = new THREE.Mesh(GEO, MAT.water); jet.scale.set(0.5, 3, 0.5); jet.position.set(-6, 2.4, -4); g.add(jet);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.9, 0.08), new THREE.MeshBasicMaterial({ map: bannerTex('HONK & PAWN') })); sign.position.set(10, 5.0, -7.9); g.add(sign);
  // inside: crown cabinet (two doors), pots, lasers, alarm light
  const cab = pivot(g, 10, 0.5, -14.2); box(6.4, 3.4, 0.6, '#3a3a44', 0, 1.7, -0.1, cab); box(6.0, 0.12, 0.5, '#5a5a66', 0, 1.4, 0.05, cab);
  const dL = pivot(cab, -3.1, 1.7, 0.3), dR = pivot(cab, 3.1, 1.7, 0.3); box(3.1, 3.3, 0.12, '#4a4a56', 1.55, 0, 0, dL); box(3.1, 3.3, 0.12, '#4a4a56', -1.55, 0, 0, dR); box(0.3, 0.3, 0.1, '#ffd23f', 3.0, 0, 0.08, dL);
  crowns.forEach((c, i) => { cab.add(c); c.position.set(-2.7 + (i % 10) * 0.6, i < 10 ? 2.25 : 0.9, 0.05); });
  const REAL = 13; const realGlow = new THREE.PointLight('#5ff7ff', 0, 5, 1.5); cab.add(realGlow); realGlow.position.set(-2.7 + (REAL % 10) * 0.6, 1.2, 0.6);
  for (let i = 0; i < 9; i++) box(0.5, 0.4, 0.5, '#8a5a2b', 7.4 + (i % 3) * 0.55, 0.7 + Math.floor(i / 3) * 0.42, -9.4 - (i % 2) * 0.3, g);
  const lasers = Array.from({ length: 6 }, (_, i) => box(7.6, 0.07, 0.07, 0, 10, 1, -9.8 - i * 0.6, g, new THREE.MeshBasicMaterial({ color: '#ff2a3a' })));
  const inLight = new THREE.PointLight('#ff4a5a', 8, 14, 1.4); inLight.position.set(10, 5, -11.5); g.add(inLight);
  const partyA = new THREE.PointLight('#ff5cf0', 0, 22, 1.2), partyB = new THREE.PointLight('#5ff7ff', 0, 22, 1.2); partyA.position.set(-9, 4, 0); partyB.position.set(-3, 4, 0); g.add(partyA, partyB);
  box(2.2, 1.1, 1, 0, -11, 1.05, 0.5, g, MAT.castle);
  marbles.forEach(m => { parentTo(m, g); }); parentTo(receipt, g);
  // particles
  burst(E.pots, [8, 1.2, -9.6], { n: 60, colors: ['#8a5a2b', '#c98f4c', '#ffffff'], speed: 5, size: 0.18, life: 1, grav: 10, up: 4 });
  for (let k = 0; k < 6; k++) burst(E.vault + 0.4 + k * 0.6, [9.4, 1.6, -13.6], { n: 14, colors: ['#ffd400', '#ffffff', '#9aa4bd'], speed: 3, size: 0.1, life: 0.6, grav: 8, up: 2 });
  burst(E.glow, [10.8 - 2.7 + 0.6 * 3 - 10 + 10, 1.4, -13.6], { n: 50, colors: ['#5ff7ff', '#ffffff'], speed: 3, size: 0.15, life: 1.2, grav: -1, up: 2 });
  burst(E.splash, [-6, 1.6, -4], { n: 160, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 7, size: 0.25, life: 1.4, grav: 10, up: 7 });
  for (let k = 0; k < 14; k++) burst(E.splash + 0.4 + k * 0.4, [-6, 2, -4], { n: 14, colors: ['#ffe066', '#5ff7ff', '#ffffff'], speed: 5, size: 0.12, life: 0.6, grav: 4, up: 2 });
  for (let k = 0; k < 8; k++) burst(E.party + k * 1.5, [-6, 5, -4], { n: 30, colors: ['#ff5cf0', '#5ff7ff', '#ffe066'], speed: 4, size: 0.14, life: 1.4, grav: 3, up: 2 });
  // fake crowns raining after the splash
  const rain = Array.from({ length: 14 }, (_, i) => { const c = makeCrown(); c.scale.setScalar(1.3); g.add(c); return { c, a: i * 0.45, d: 3 + (i * 7) % 9, t0: E.splash + 1 + i * 0.35 }; });
  const C = [[E.town, -30, 4, 14, -10, 1, 0, 52], [E.sneak, -26, 3.6, 12, -10, 1, 0, 52],
    [E.bot, 20, 2.2, 8, 10, 1.6, 2, 46], [60.1, 16, 2.2, 7, 4, 1.6, 2, 46], [E.hide, -6, 2.2, -12.5, -6, 1.2, -8, 46], [64.5, -6.5, 2.2, -13, -6, 1.2, -8, 46],
    [E.prestin, -6, 3, 8, -6, 1.6, -2, 50], [68.3, -5, 3, 8.5, -6, 1.6, -2, 50], [E.party, 2, 5, 10, -6, 1.5, -3, 55], [74.3, 0, 5, 11, -6, 1.5, -3, 55],
    [E.gooseDance, -1, 2.6, 6, -4.5, 1.4, 0.8, 46], [79.5, -1.4, 2.6, 6.4, -4.5, 1.4, 0.8, 46],
    [E.roof, 4, 10, -4, 9.5, 7.5, -12, 50], [93.5, 5, 10.4, -5, 9.5, 7.5, -12, 50], [93.6, 9.5, 4.2, -9.0, 9.5, 2.5, -10.4, 50], [103.9, 9.5, 2.8, -8.9, 9.5, 1.6, -10.4, 50],
    [E.lasers, 13.2, 2.6, -8.8, 9.5, 1.2, -11.5, 52], [109.3, 13.0, 2.4, -9.0, 9.5, 1.2, -11.5, 52], [E.limbo, 12.8, 1.1, -9.4, 9.8, 1.0, -12, 52], [118.7, 12.6, 1.2, -9.6, 9.8, 1.0, -12.6, 52],
    [E.bloopJump, 12, 3, -9, 8, 2, -10, 52], [124.5, 12.4, 2.6, -9, 8, 1.2, -9.6, 52], [E.pots, 10.2, 1.6, -9.2, 8, 1, -9.6, 46], [134.1, 10.6, 1.8, -9.4, 8, 1, -9.6, 46],
    [E.vault, 8.2, 2.0, -10.6, 10, 1.6, -13.6, 46], [138.1, 8.4, 2.0, -10.8, 10, 1.6, -13.6, 46], [E.open, 12.8, 3.2, -9.6, 10, 2.0, -14, 52], [150.1, 12.6, 3.0, -10.2, 10, 2.0, -14, 46],
    [150.2, 12.6, 2.6, -11.0, 10, 2, -13, 46], [154.1, 12.8, 2.6, -11.2, 10, 2, -13, 46], [E.puffTest, 10, 2.8, -11.6, 10, 2.4, -14, 46], [162.7, 10.6, 2.8, -12.0, 9.1, 1.6, -14, 40],
    [E.glow, 9.4, 2.4, -11.2, 9.1, 1.4, -14, 36], [166.7, 9.6, 2.4, -11.4, 9.1, 1.4, -14, 34], [E.crownOn, 10.2, 2.4, -10.0, 10, 2.4, -12.6, 42], [175.1, 10.6, 2.4, -10.2, 10, 2.4, -12.6, 40],
    [E.touch, 8.0, 1.6, -11, 10, 1.6, -12.6, 46], [E.alarm, 8.0, 1.6, -11.2, 10, 1.6, -12.6, 46], [E.alarm + 0.1, 12.5, 4, -9, 9.5, 2, -10, 55], [180.7, 12.5, 4, -9.4, 9.5, 2, -10, 55],
    [E.yank, 14, 12, -4, 9.5, 6, -12, 52], [186.1, 14, 12, -5, 9.5, 8, -12, 52], [E.roofChase, 2, 11, -2, 10, 8, -11, 55], [190.1, 3, 11, -2, 12, 8, -10, 55],
    [E.jumpDown, 24, 4, 4, 15, 3, -7, 55], [194.3, 23, 3, 4, 15, 1, -6, 55], [E.splash, 2, 4, 6, -6, 2, -4, 52], [212.5, 3, 5, 8, -6, 3, -4, 55],
    [212.6, 0, 1, 6, -6, 6, -4, 58], [218.5, 1, 1.2, 6.5, -6, 5, -4, 58], [E.goose, -1.6, 2.2, 3.4, 0.5, 1.8, -2.4, 46], [223.5, -1.4, 2.2, 3.0, 0.5, 1.8, -2.4, 44],
    [E.receipt, 0.2, 2.6, -0.8, 0.5, 2.4, -2.4, 40], [228.9, 0.3, 2.6, -1.0, 0.5, 2.4, -2.4, 38], [229.0, 4.6, 2.2, 0.4, 2.6, 2.0, -1.6, 44], [234.1, 4.4, 2.2, 0.2, 2.6, 2.0, -1.6, 44],
    [234.2, -0.4, 2.0, 3.8, -0.6, 2.1, 0.8, 46], [240.9, -0.5, 2.0, 3.3, -0.6, 2.1, 0.8, 40], [E.forgive, 3, 3.5, 6, 0, 1.5, -1, 50], [247.1, 2, 3.5, 6.5, 0, 1.5, -1, 50],
    [E.bloopInv, 3.6, 2.4, 4.4, 1.0, 1.4, -0.8, 46], [257.5, 3.8, 2.4, 4.0, 1.0, 1.4, -0.8, 46], [E.dance, -9, 4, 6, -4, 1.4, -1, 50], [266.7, -8, 4, 7, -4, 1.4, -1, 50],
    [266.8, 10, 6, 10, -2, 2, -4, 52], [276.9, 12, 6, 11, -2, 2, -4, 52], [277.0, 1.2, 2.2, 2.6, 1.6, 2.0, -1.6, 44], [281.7, 1.0, 2.2, 2.2, 1.6, 2.0, -1.6, 42],
    [281.8, -2.2, 2.4, 5.6, -2.4, 1.5, -1.2, 48], [E.logo, -2.2, 2.4, 5.2, -2.4, 1.5, -1.2, 48]];
  function update(t) {
    [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand].forEach(m => m.visible = false);
    golem.root.visible = mailBird.root.visible = crownProp.visible = sled.visible = false; rival.wig.visible = false; rival.shine.visible = true;
    const alarmOn = win(t, E.alarm, E.splash); inLight.color.set(alarmOn && Math.floor(t * 4) % 2 ? '#ff0000' : '#ff4a5a'); inLight.intensity = alarmOn ? 20 : 8;
    partyA.intensity = partyB.intensity = win(t, E.party, E.alarm) || t > E.dance ? 30 + Math.sin(t * 6) * 10 : 0; jet.scale.y = 3 + Math.sin(t * 5) * 0.3;
    lasers.forEach((l, i) => { l.visible = win(t, E.lasers, E.splash) && !(alarmOn && Math.floor(t * 8) % 2); l.position.y = 0.6 + ((i * 0.37 + Math.sin(t * 0.8 + i)) % 1 + 1) % 1 * 1.6; });
    const op = ss(seg(t, E.open, E.open + 1.2)); dL.rotation.y = -op * 1.7; dR.rotation.y = op * 1.7; crowns.forEach((c, i) => { c.visible = !(i === REAL && t > E.crownOn); c.rotation.y = i * 0.5; }); realGlow.intensity = win(t, E.glow, E.crownOn) ? 20 : 0;
    crownM.visible = t > E.crownOn;
    // --- hero
    const o = { t, p: [-26, 0.5, 6], yaw: Math.PI / 2, face: 'normal' };
    if (t < E.climb) { const w = walker(t, [[E.town, -26, 0.5, 6], [E.hide - 0.4, -6.5, 0.5, -8.4], [E.climb, -6.5, 0.5, -8.4]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : 0; o.walk = w.walk; o.phase = w.phase; o.lean = 0.3; if (t > E.hide) { o.sit = 0.6; o.face = t < E.prestin ? 'scared' : 'smug'; } }
    let hang = null;
    if (t >= E.climb && t < E.dangle) { o.sit = 1; o.face = 'smug'; }
    else if (t >= E.dangle && t < E.lasers) { const k = seg(t, E.dangle + 4.6, 103); hang = [9.5, lerp(7.6, 0.5, ss(k)), -11.5]; o.p = hang; o.yaw = Math.PI; o.hold = true; o.face = 'smug'; }
    else if (t >= E.lasers && t < E.touch) { const K = [[E.lasers, 9.5, 0.5, -11.5], [E.limbo, 9.5, 0.5, -11.5], [118.6, 10, 0.5, -12.8], [E.crownOn - 1, 10, 0.5, -12.8], [E.crownOn, 10.4, 0.5, -12.9]]; const w = walker(t, K); o.p = w.p; o.yaw = Math.PI; o.walk = w.walk * 0.5; o.phase = w.phase;
      if (win(t, E.limbo, 118.6)) { o.lean = -0.9; o.face = 'scared'; o.p[1] -= 0.3; } if (win(t, E.open, E.glow)) o.face = 'scared'; if (t > E.glow) { o.face = 'smug'; o.wave = win(t, E.glow, E.crownOn + 3); } }
    else if (t >= E.touch && t < E.yank) { o.p = [10.4, 0.5, -12.6]; o.yaw = -Math.PI / 2 + (t > E.touch ? 1.2 : 0); o.face = 'scared'; o.panic = t > E.alarm; o.hold = t < E.alarm; }
    else if (t >= E.yank && t < E.roofChase) { const k = ss(seg(t, E.yank, E.yank + 4)); hang = [lerp(10.4, 9.5, k), lerp(0.5, 7.6, k), lerp(-12.6, -11.5, k)]; o.p = hang; o.yaw = Math.PI; o.panic = true; o.face = 'scared'; }
    else if (t >= E.roofChase && t < E.splash) { const K = [[E.roofChase, 9.5, 7.6, -11.5], [E.jumpDown, 13.5, 7.6, -10], [E.jumpDown + 2, 17, 0.5, -6], [196, 2, 0.5, 2], [200, -12, 0.5, 2], [204, -12, 0.5, -10], [E.splash, 0, 0.5, -10]]; const w = walker(t, K); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; o.panic = true; o.face = 'scared'; if (win(t, E.jumpDown, E.jumpDown + 2)) o.p[1] += Math.sin(seg(t, E.jumpDown, E.jumpDown + 2) * Math.PI) * 2.5; }
    else if (t >= E.splash) { const k = seg(t, E.splash, E.goose); o.p = [lerp(0, -0.6, k), 0.5, lerp(-10, 0.8, k)]; o.yaw = Math.PI - 0.2; o.face = 'smug'; if (t > E.goose) { o.p = [-0.6, 0.5, 0.8]; o.yaw = yawXZ([-0.6, 0.8], [0.5, -2.4]); o.face = t > E.receipt ? 'scared' : 'normal'; }
      if (t > 234.2) o.face = 'soot'; if (t > E.forgive) o.face = 'normal'; if (t > 262.6) { o.face = 'smug'; o.yaw = 0.3; } if (t > 281.8) o.hips = true; if (win(t, 277, 281.8)) o.yaw = yawXZ([-0.6, 0.8], [2.6, -1.6]); }
    pose(hero, o); parentTo(hero.root, g); hero.root.visible = true;
    // --- leggy (climber) + rope
    let lp = [-27, 0.5, 4], ly = Math.PI / 2, ls = 2;
    if (t < E.climb) { const w = walker(t, [[E.town, -28, 0.5, 4], [E.hide - 0.2, -8.6, 0.5, -9.6], [E.climb, -8.6, 0.5, -9.6]]); lp = w.p; ly = w.speed > 0.1 ? w.yaw : 0.4; ls = w.speed > 0.1 ? 2 : 0.3; }
    else if (t < E.roof) { const K = [[E.climb, -8.6, 0.5, -9.6], [E.climb + 2, 5, 0.5, -11.5], [E.roof - 1, 5, 6.5, -11.5], [E.roof, 8, 7.5, -13.4]]; const w = walker(t, K); lp = w.p; ly = w.speed > 0.1 ? w.yaw : Math.PI; ls = 3; if (win(t, E.climb + 2, E.roof - 1)) { ly = Math.PI / 2; } }
    else if (t < E.roofChase + 0.5) { lp = [9.5, 7.5, -13.6]; ly = 0; ls = 0.4; }
    else if (t < E.splash) { const K = [[E.roofChase + 0.5, 9.5, 7.5, -13.6], [E.jumpDown, 13.5, 7.5, -12], [E.jumpDown + 2, 18, 0.5, -8], [196, 3, 0.5, 0], [200, -11, 0.5, 0], [204, -11, 0.5, -12], [E.splash, -3, 0.5, -11]]; const w = walker(t, K); lp = w.p; ly = w.yaw; ls = 3; }
    else { lp = [-4, 0.5, 0.2]; ly = 0.8; ls = 0.3; if (t > E.dance) { lp = [-5 + Math.sin(t) * 1.5, 0.5, 1.2]; ly = Math.sin(t * 2); ls = 1.5; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.body.rotation.z = 0; L6.root.rotation.z = 0; if (win(t, E.climb + 2, E.roof - 1)) L6.root.rotation.x = -Math.PI / 2; else L6.root.rotation.x = 0;
    if (t >= E.climb && t < E.dangle) { hero.root.position.set(...rideOn(lp, ly, -0.3, 1.6)); hero.root.rotation.set(L6.root.rotation.x, ly, 0); }
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    rope.visible = (t >= E.dangle && t < E.roofChase); if (rope.visible) { parentTo(rope, g); const hp = hero.root.position; lineBetween(rope, new THREE.Vector3(lp[0], lp[1] + 1.2, lp[2] + 1.2), new THREE.Vector3(hp.x, hp.y + 2.0, hp.z)); }
    // --- bloop
    let bp = [-27, 0.5, 7.5], by = Math.PI / 2, bo = {};
    if (t < E.climb) { const w = walker(t, [[E.town, -27, 0.5, 7.5], [E.hide - 0.6, -4.4, 0.5, -8.8], [E.climb, -4.4, 0.5, -8.8]]); bp = w.p; by = w.speed > 0.1 ? w.yaw : 0; bo = w.speed > 0.1 ? { walk: 1, phase: w.phase } : {}; }
    else if (t < E.bloopJump) { bp = rideOn(lp, ly, -1.2, 1.6); by = ly; }
    else if (t < E.pots) { const k = seg(t, E.bloopJump + 2, E.pots); bp = [lerp(9.5, 8, k), lerp(7.6, 0.6, k * k), lerp(-12, -9.6, k)]; by = Math.PI; bo = { angry: true }; if (t < E.bloopJump + 2) bp = rideOn(lp, ly, -1.2, 1.6); }
    else if (t < E.touch) { const K = [[E.pots, 8, 0.6, -9.6], [E.vault - 1, 9.4, 0.5, -12.6], [E.puffTest, 9.4, 0.5, -12.6], [E.puffTest + 1, 8.4, 0.5, -12.0]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : Math.PI; bo = win(t, E.pots, E.pots + 3) ? { facepalm: true } : (win(t, E.open, E.puffTest) ? { hop: true } : {}); }
    else if (t < E.roofChase) { const h = hero.root.position; bp = t < E.yank ? [8.4, 0.5, -12.0] : [h.x, h.y - 1.7, h.z]; by = Math.PI; bo = { angry: true }; }
    else if (t < E.splash) { const K = [[E.roofChase, 9.5, 7.6, -11], [E.jumpDown, 12.6, 7.6, -9.4], [E.jumpDown + 2, 16, 0.5, -5], [196, 1, 0.5, 3], [E.marbles, -9, 0.5, 3], [200, -13, 0.5, 2.6], [204, -13, 0.5, -9], [E.splash, 1, 0.5, -9.4]]; const w = walker(t, K); bp = w.p; by = w.yaw; bo = { walk: 1, phase: w.phase }; if (win(t, E.jumpDown, E.jumpDown + 2)) bp[1] += Math.sin(seg(t, E.jumpDown, E.jumpDown + 2) * Math.PI) * 2.5; }
    else { bp = [1.6, 0.5, 0.9]; by = yawXZ([1.6, 0.9], [0.5, -2.4]); bo = t > E.bloopInv ? { handOut: true } : {}; if (win(t, 253, 257.6)) bo = { hop: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; drill.visible = win(t, E.vault - 1, E.open + 1); if (drill.visible) bloop6.B.aR.rotation.set(-1.3, 0, 0); dbit.rotation.z = win(t, E.vault, E.open) ? t * 50 : 0;
    card.visible = t > E.bloopInv && t < E.bloopInv + 6; card.scale.set(1, 1, 1); card.position.y = -0.62;
    // --- puff (flashlight, crown detector)
    parentTo(puff.root, g); puff.root.visible = true; let pp = head, pyw = ly, big = false;
    if (t >= E.dangle && t < E.puffTest) { const h = hero.root.position, yw = hero.root.rotation.y; pp = [h.x + Math.sin(yw) * 0.6, h.y + 1.1, h.z + Math.cos(yw) * 0.6]; pyw = yw; }
    if (win(t, E.puffTest, E.crownOn)) { const k = seg(t, E.puffTest + 1, E.glow); pp = [lerp(7.4, 9.1, ss(k)) + Math.sin(t * 3) * 0.2, 3.4 + Math.sin(t * 4) * 0.15, -13.5]; pyw = 0; big = t > E.glow; }
    if (win(t, E.crownOn, E.roofChase)) { const b = bloop6.B.root.position; pp = [b.x, b.y + (t > E.yank ? -1.2 : 2.1), b.z]; }
    if (win(t, E.roofChase, E.splash)) pp = head;
    poseMag(puff, t, pp, pyw, { big, hop: t > E.dance });
    // --- prestin (distraction), seals, judge DJ, goose
    let rp = [-24, 0.5, 9], ry = Math.PI / 2, ro = {};
    if (t < E.prestin) { const w = walker(t, [[E.town, -24, 0.5, 9], [E.hide, -9, 0.5, -9.8]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : 0; ro = { walk: w.walk, phase: w.phase }; }
    else if (t < E.alarm) { const w = walker(t, [[E.prestin, -9, 0.5, -9.8], [E.party, -6, 0.5, 0.4]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : 0.2; ro = w.speed > 0.1 ? { walk: w.walk, phase: w.phase } : { hop: true, flip: Math.floor(t) % 3 === 0 }; }
    else if (t < E.goose) { rp = [-6, 0.5, 0.4]; ry = 0.6; ro = { panic: t < E.splash, hop: t > E.splash }; }
    else { const w = walker(t, [[E.goose, 9.5, 0.5, -6.5], [E.receipt, 2.6, 0.5, -1.6]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : yawXZ([2.6, -1.6], [-0.6, 0.8]); ro = w.speed > 0.1 ? { walk: w.walk, phase: w.phase } : (win(t, 229, 234) ? { hips: true } : (t > E.dance ? { hop: true } : {})); }
    poseRival(rival, t, rp, ry, ro); parentTo(rival.root, g); rival.root.visible = true;
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = t > E.prestin; const a = i * 2.1 + t * 0.3; const sp = [-6 + Math.cos(a) * 4.2, 0.5, -4 + Math.sin(a) * 4.2]; poseSeal(s, t, sp, a + Math.PI, { hop: !win(t, E.alarm, E.splash), seed: i * 3 }); });
    parentTo(judge.root, g); judge.root.visible = t > E.prestin; poseSeal(judge, t, [-11, 0.5, -0.6], 0.5, { hop: !win(t, E.alarm, E.splash), clap: true, seed: 5 });
    parentTo(goose.root, g); goose.root.visible = t > E.prestin; let gp = [10, 0.5, -11.5], gy = 0;
    if (t > E.gooseDance - 3 && t < E.goose) { const w = walker(t, [[E.gooseDance - 3, 9.5, 0.5, -9], [E.gooseDance, -3.6, 0.5, 1.6]]); gp = w.p; gy = w.speed > 0.1 ? w.yaw : 0.2; }
    if (t >= E.goose) { const w = walker(t, [[E.goose, 9.5, 0.5, -7], [E.goose + 3.4, 0.5, 0.5, -2.4]]); gp = w.p; gy = w.speed > 0.1 ? w.yaw : yawXZ([0.5, -2.4], [-0.6, 0.8]); if (t > E.dance) { gp = [-3, 0.5 + Math.abs(Math.sin(t * 6)) * 0.3, 0.6]; gy = Math.sin(t * 2) * 1.2; } }
    goose.root.position.set(...gp); goose.root.rotation.y = gy; goose.neck.rotation.x = (t > E.gooseDance && t < E.alarm) || t > E.dance ? Math.sin(t * 8) * 0.35 : Math.sin(t * 2) * 0.1;
    receipt.visible = win(t, E.goose, E.forgive); if (receipt.visible) { receipt.position.set(gp[0] + Math.sin(gy) * 0.6, 2.0, gp[2] + Math.cos(gy) * 0.6); receipt.rotation.y = gy; }
    // --- Bonk-bot
    parentTo(bot.root, g); bot.root.visible = true; let bpos = [24, 0.5, 2], byaw = -Math.PI / 2, bop = { scan: true };
    if (t < E.party) { const w = walker(t, [[E.town, 26, 0.5, 2], [E.hide + 4, -14, 0.5, 2]]); bpos = w.p; byaw = w.yaw; } else if (t < E.alarm) { bpos = [-1, 0.5, 5]; byaw = yawXZ([-1, 5], [-6, -4]); bop = { dance: t > E.gooseDance, roll: 0 }; }
    else if (t < E.roofChase) { const w = walker(t, [[E.alarm, -1, 0.5, 5], [E.alarm + 2.4, 9.5, 0.5, -7], [E.yank + 1, 9.5, 0.5, -10.4]]); bpos = w.p; byaw = w.speed > 0.1 ? w.yaw : Math.PI; bop = { alarm: true }; }
    else if (t < E.slip) { const K = [[E.roofChase, 7, 7.6, -9], [E.jumpDown + 0.8, 12.6, 7.6, -9.4], [E.jumpDown + 2.8, 16, 0.5, -5], [197, 3, 0.5, 3], [E.marbles + 0.4, -8, 0.5, 3], [E.slip, -12, 0.5, 1]]; const w = walker(t, K); bpos = w.p; byaw = w.yaw; bop = { alarm: true }; if (win(t, E.jumpDown + 0.8, E.jumpDown + 2.8)) bpos[1] += Math.sin(seg(t, E.jumpDown + 0.8, E.jumpDown + 2.8) * Math.PI) * 2.5; }
    else if (t < E.splash) { const k = seg(t, E.slip, E.splash); bpos = [lerp(-12, -6, k), 0.5 + Math.sin(k * Math.PI) * 1.5, lerp(1, -4, k)]; byaw = 0; bop = { spin: k * 14, alarm: true, tilt: Math.sin(t * 9) * 0.3 }; }
    else { bpos = [-6, 0.3, -4]; byaw = 0.8; bop = { off: true, tilt: 0.5, roll: 0, look: 0.6 }; }
    poseBot(bot, t, bpos, byaw, bop);
    marbles.forEach((m, i) => { m.visible = t > E.marbles; m.position.set(-8 - (i % 7) * 0.5 + Math.sin(i) * 0.3, 0.6, 2.6 + Math.floor(i / 7) * 0.6); });
    rain.forEach(q => { q.c.visible = t > q.t0 && t < 300; const k = seg(t, q.t0, q.t0 + 3); q.c.position.set(-6 + Math.cos(q.a) * q.d * k, Math.max(0.6, 2 + Math.sin(k * Math.PI) * 9 - (k > 0.9 ? 0 : 0)), -4 + Math.sin(q.a) * q.d * k); q.c.rotation.set(k * 6, k * 9, 0); });
    let cam = camKeys(t, C);
    if (win(t, E.sneak, E.bot)) { const h = hero.root.position; cam = { p: [h.x - 4, 2.4, h.z + 5], l: [h.x + 2, 1.4, h.z - 1], fov: 50 }; }
    if (win(t, E.climb, E.roof)) { cam = { p: [lp[0] - 6, Math.max(2, lp[1] + 2), lp[2] + 7], l: [lp[0], lp[1] + 1, lp[2]], fov: 52 }; }
    if (win(t, E.dangle, 93.6)) cam = { p: [12.5, 9.6, -15.5], l: [9.5, 7.4, -11.5], fov: 50 };
    if (win(t, 93.6, E.lasers)) { const hy = hero.root.position.y; cam = { p: [12.6, Math.max(2.2, hy - 0.4), -8.8], l: [9.5, hy + 1, -11.5], fov: 52 }; }
    if (win(t, 194.4, E.splash)) { const h = hero.root.position; cam = { p: [h.x + 4, 3, h.z + 8], l: [h.x - 2, 1.2, h.z], fov: 54 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
