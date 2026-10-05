// ================================================================ EPISODE 8: "BLOOP QUITS?!" — camp → market plaza → MegaBuild site → sunset camp
const yawXZ = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
// --- new NPC: Gravelbeard, the MegaBuild golem boss
function makeGolem() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), stone = new THREE.MeshLambertMaterial({ color: '#7d8590' }), dk = new THREE.MeshLambertMaterial({ color: '#5a6170' });
  const lL = pivot(body, -0.55, 1.6, 0), lR = pivot(body, 0.55, 1.6, 0); box(0.8, 1.6, 0.8, 0, 0, -0.8, 0, lL, dk); box(0.8, 1.6, 0.8, 0, 0, -0.8, 0, lR, dk);
  box(2.2, 2.2, 1.4, 0, 0, 2.7, 0, body, stone); box(2.24, 0.25, 1.44, '#ffd400', 0, 2.0, 0, body);
  const aL = pivot(body, -1.35, 3.5, 0), aR = pivot(body, 1.35, 3.5, 0); box(0.6, 2.3, 0.6, 0, 0, -1.05, 0, aL, stone); box(0.6, 2.3, 0.6, 0, 0, -1.05, 0, aR, stone);
  const clip = pivot(aL, 0, -2.2, 0.35); box(0.7, 0.9, 0.06, '#c9a46a', 0, 0, 0, clip); box(0.6, 0.6, 0.02, '#ffffff', 0, -0.05, 0.04, clip);
  const hd = pivot(body, 0, 3.8, 0); box(1.3, 1.1, 1.1, 0, 0, 0.55, 0, hd, stone); box(1.4, 0.3, 1.2, '#4a505c', 0, 1.15, 0, hd);
  const eye = new THREE.MeshBasicMaterial({ color: '#ff9a2a' }); box(0.28, 0.14, 0.05, 0, -0.3, 0.7, 0.56, hd, eye); box(0.28, 0.14, 0.05, 0, 0.3, 0.7, 0.56, hd, eye);
  box(0.5, 0.12, 0.06, '#2a2a33', -0.3, 0.88, 0.57, hd).rotation.z = -0.3; box(0.5, 0.12, 0.06, '#2a2a33', 0.3, 0.88, 0.57, hd).rotation.z = 0.3;
  box(1.0, 0.7, 0.3, '#3c9a32', 0, 0.05, 0.6, hd); box(0.6, 0.4, 0.3, '#2f7a28', 0, -0.4, 0.6, hd);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, lL, lR, aL, aR, hd };
}
function poseGolem(g, t, p, yaw, o = {}) {
  const w = o.walk ? Math.sin(t * 5) * 0.4 : 0; g.root.position.set(p[0], p[1] + (o.walk ? Math.abs(Math.cos(t * 5)) * 0.1 : 0), p[2]); g.root.rotation.set(0, yaw, 0);
  g.lL.rotation.x = w; g.lR.rotation.x = -w; g.aL.rotation.set(-w * 0.6 - 0.3, 0, 0); g.aR.rotation.set(w * 0.6, 0, 0); g.body.rotation.set(o.lean || 0, 0, o.tilt || 0);
  if (o.point) g.aR.rotation.set(-2.4 + Math.sin(t * 9) * 0.2, 0, 0); if (o.wave) g.aR.rotation.set(-2.8, 0, Math.sin(t * 10) * 0.5);
  g.hd.rotation.set(0, Math.sin(t * 0.8) * 0.2, 0);
}
// --- new NPC: Crumbs, the goose pawnbroker
function makeGoose() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  for (const x of [-0.18, 0.18]) box(0.08, 0.5, 0.08, '#ff9a2a', x, 0.25, 0, body);
  box(0.8, 0.7, 1.1, '#f4f4f4', 0, 0.85, -0.1, body); box(0.5, 0.3, 0.5, '#dcdcdc', 0, 0.95, -0.7, body);
  const neck = pivot(body, 0, 1.1, 0.35); box(0.28, 1.0, 0.28, '#f4f4f4', 0, 0.5, 0, neck);
  const hd = pivot(neck, 0, 1.0, 0); box(0.45, 0.42, 0.55, '#f4f4f4', 0, 0.15, 0.05, hd); box(0.22, 0.14, 0.34, '#ff9a2a', 0, 0.08, 0.45, hd);
  box(0.06, 0.08, 0.04, '#111', -0.16, 0.24, 0.28, hd); box(0.06, 0.08, 0.04, '#111', 0.16, 0.24, 0.28, hd);
  box(0.16, 0.16, 0.02, '#ffd23f', 0.16, 0.24, 0.31, hd); box(0.02, 0.3, 0.02, '#ffd23f', 0.24, 0.08, 0.31, hd);
  box(0.36, 0.06, 0.36, '#1a1a2a', 0, 0.38, 0, hd); box(0.24, 0.26, 0.24, '#1a1a2a', 0, 0.54, 0, hd);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, neck, hd };
}
const golem = makeGolem(), goose = makeGoose();
const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.06), new THREE.MeshBasicMaterial({ map: labelTex('TAXI', '#ffd400', '#111', 42) })); taxiSign.position.set(0, 0.85, 0.3); L6.body.add(taxiSign);
const crownProp = makeCrown(); crownProp.scale.setScalar(1.2);
const mailBird = makeBird('#5aa8ff');
const debt = t => { if (t < E.pile + 2) return null; if (t < E.pay) return 2048; if (t < E.tear) return 807; if (t < E.bill2) return 0; return 1; };
const cash = t => t < E.sale ? 0 : t < E.sell ? 40 : t < E.fare ? 340 : t < E.mimeEnd ? 1240 : t < E.pay ? 1241 : 0;

// ---------------------------------------------------------------- set A: the beach camp (start + sunset finale)
const camp = (() => {
  const g = mk('camp'), st = new VSet(g), r = rng(801);
  for (let x = -45; x <= 45; x++) for (let z = -40; z <= 0; z++) st.add(x, 0, z, z > -7 ? 'sand' : 'turf');
  const trees = []; for (let i = 0; i < 80; i++) { const x = Math.round((r() - .5) * 90), z = Math.round(-40 + r() * 30); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (Math.abs(x) < 14 && z > -16)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (const [x, z] of [[-2, -5], [-1, -5], [-2, -4], [-1, -4]]) st.add(x, 1, z, 'stone');
  st.build(); seaSet(g);
  const tent = pivot(g, -7, 0.5, -8); for (const s of [-1, 1]) { const w = box(0.1, 3.2, 3.6, '#2ec4b6', s * 0.9, 1.3, 0, tent); w.rotation.z = s * 0.55; }
  const fire = pivot(g, -1.5, 1.5, -4.5); box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = -0.6;
  const flame = box(0.5, 0.7, 0.5, 0, 0, 0.5, 0, fire, basic('#ffb43a')); const fl = new THREE.PointLight('#ff8a2a', 6, 9, 1.5); fl.position.set(0, 1.2, 0); fire.add(fl);
  const pile = pivot(g, 3.8, 0.5, -3.6), pr = rng(802);
  for (let i = 0; i < 90; i++) { const a = pr() * 6.28, d = Math.sqrt(pr()) * 1.6, h = (1.6 - d) * 1.6 * pr(); const p = box(0.5, 0.04, 0.38, i % 3 ? '#fff3cf' : '#ffffff', Math.cos(a) * d, h + 0.05, Math.sin(a) * d, pile); p.rotation.set(pr() - .5, pr() * 3, pr() - .5); }
  const logs = new THREE.Group(), lv = new VSet(logs, true); logs.position.set(1.6, 0, -3.0); g.add(logs);
  let li = 0; for (let y = 1; y <= 3; y++) for (let x = 0; x < 2; x++) for (let z = 0; z < 2; z++) lv.add(x, y, z, 'log', { t0: E.pay + 0.3 + (li++) * 0.25 }); lv.build();
  // particles
  smoke(0, 300, 0.6, [-1.5, 2.4, -4.5], { n: 2, size: 0.25, life: 2, up: 1.5, grav: -0.6, colors: ['#9a9490', '#c8c2be'] });
  burst(E.pile, [3.8, 1.5, -3.6], { n: 120, colors: ['#fff3cf', '#ffffff', '#e8d9b0'], speed: 6, size: 0.25, life: 1.4, grav: 8, up: 4 });
  for (let k = 0; k < 6; k++) burst(E.tear + k * 0.6, [3.8, 1.5, -3.6], { n: 90, colors: ['#fff3cf', '#ffffff', '#ff6fb8', '#5ff7ff'], speed: 7, size: 0.22, life: 2.4, grav: 2, up: 6 });
  const C1 = [[0, 16, 7, 16, 1, 1, -3, 55], [7.5, 12, 5, 13, 1, 1, -3, 52], [7.6, 6.5, 1.2, 3.5, 3.5, 2, -3.5, 50], [12.9, 6, 1.3, 3, 3.5, 2, -3.5, 50],
    [13.0, 1.8, 2, 3.8, 0.2, 2, -1, 50], [20.5, 1.2, 2, 2.6, 0.2, 2, -1, 40], [20.6, 5.4, 2.0, 1.0, 3, 1.6, -2.5, 46], [25.7, 4.8, 1.9, 0.4, 3, 1.6, -2.5, 46],
    [25.8, 5.2, 2.6, -5.6, 0.4, 1.6, -1, 48], [30.7, 4.6, 2.5, -6.0, 0.4, 1.6, -1, 48], [36.2, -4, 4, 8, -12, 1, -8, 52], [40.7, -2, 4, 9, -12, 1, -8, 52],
    [40.8, 0.6, 2.0, 3.4, 0.3, 2, -1, 48], [46.3, 0.8, 2.1, 2.8, 0.3, 2, -1, 46], [46.4, -2, 3, 7, -1, 1, -3, 52], [51.9, 0, 3, 7, -1, 1, -3, 52],
    [52.0, -1.2, 2.2, 0.6, -4, 1.2, -3.5, 46], [58.3, -1.8, 2.0, 0.2, -4, 1.2, -3.5, 46], [58.4, -0.4, 1.5, -2.2, -1.5, 1.4, -4.5, 44], [61.3, -0.7, 1.4, -2.6, -1.5, 1.4, -4.5, 44],
    [61.4, 4, 3, 8, 8, 1, -2, 52], [E.town, 6, 3, 8, 10, 1, -2, 52]];
  const C3 = [[E.camp, 12, 4, 10, 0, 1, -2, 52], [245.9, 10, 3.6, 9, 0, 1, -2, 52], [246.0, 5.0, 3.2, 4.6, 1.8, 1.0, -2.4, 48], [251.7, 4.4, 3.0, 4.0, 1.8, 1.0, -2.4, 46],
    [251.8, 5.2, 2.0, 0.6, 3, 1.8, -2, 44], [255.7, 5.0, 2.0, 0.2, 3, 1.8, -2, 44], [255.8, 7, 3.6, 5.5, 3, 2, -3, 52], [259.9, 6, 3.3, 5.2, 3, 2, -3, 52],
    [260.0, 1.2, 2.0, 1.2, 3, 1.8, -2, 44], [265.5, 1.4, 2.0, 0.8, 3, 1.8, -2, 42], [265.6, 2, 2.6, 5.2, 1.5, 1.3, -2, 50], [270.3, 1.4, 2.6, 4.6, 1.5, 1.3, -2, 50],
    [270.4, -6, 3, 8, 1, 1.5, -2, 50], [275.1, -5, 3, 8.5, 1, 1.5, -2, 50], [275.2, 2.6, 2.0, 2.4, 2.4, 1.6, -1.6, 46], [281.5, 2.4, 2.0, 2.0, 2.4, 1.6, -1.6, 44],
    [281.6, -0.2, 2.5, 6.6, -0.4, 1.5, -1.6, 48], [E.logo, -0.2, 2.5, 6.2, -0.4, 1.5, -1.6, 48]];
  function update(t) {
    const late = t >= E.camp; lv.update(t); logs.visible = late; pile.visible = t > E.pile - 0.6 && !(late && t > E.tear + 0.3);
    if (!late) { const k = seg(t, E.pile - 0.6, E.pile); pile.position.y = 0.5 + (1 - k * k) * 14; } else pile.position.y = 0.5;
    flame.scale.set(1, 1 + Math.sin(t * 13) * 0.2, 1); fl.intensity = 6 + Math.sin(t * 17) * 1.5;
    rod.visible = false; crownM.visible = !(late || t > E.sell); seals.forEach(s => s.root.visible = false); judge.root.visible = false;
    // mail bird
    mailBird.root.visible = !late && win(t, E.letter - 1.5, E.leave); if (mailBird.root.visible) { parentTo(mailBird.root, g); const k = seg(t, E.letter - 1.5, E.letter + 0.5), k2 = seg(t, E.letter + 1.5, E.leave);
      mailBird.root.position.set(lerp(lerp(30, 3.4, k), -20, k2), lerp(lerp(9, 3.4, k), 12, k2), lerp(lerp(-20, -2.2, k), -30, k2)); mailBird.root.rotation.y = k2 > 0 ? -2.2 : -1.0; const f = Math.sin(t * 22) * 0.7; mailBird.wL.rotation.z = f; mailBird.wR.rotation.z = -f; }
    // hero
    const o = { t, p: [0.2, 0.5, -1], yaw: 0.2, face: 'normal' };
    if (!late) {
      if (t < 4) o.wave = true; else if (t < E.pile) o.hips = true; else if (t < E.quit) { o.face = 'scared'; o.yaw = yawXZ([0.2, -1], [3.8, -3.6]); o.lean = -0.15; }
      else if (t < E.leave + 4) { o.yaw = yawXZ([0.2, -1], [3, -2.5]); o.face = t < E.letter ? 'scared' : 'normal'; if (t > E.leave) o.panic = true; }
      else if (t < E.go) { o.face = t < 46 ? 'scared' : 'smug'; if (win(t, 52, 58.4)) o.yaw = yawXZ([0.2, -1], [-4, -3.5]); else if (t > 58.4) o.yaw = yawXZ([0.2, -1], [-1.5, -4.5]); else o.hips = t > 46.4; }
      else { const w = walker(t, [[E.go, 0.2, 0.5, -1], [E.town, 14, 0.5, -2]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; }
    } else {
      o.p = [1.2, 0.5, -1.2]; o.yaw = yawXZ([1.2, -1.2], [3, -2]); o.face = 'normal';
      if (win(t, E.tear, E.tear + 4)) { o.wave = true; o.face = 'smug'; } if (win(t, E.hug, E.bill2)) { o.yaw = yawXZ([1.2, -1.2], [2.4, -1.8]); o.face = 'smug'; }
      if (t > E.bill2) { o.face = 'scared'; o.yaw = yawXZ([1.2, -1.2], [2.6, -1.8]); } if (t > 281.6) { o.yaw = 0.25; o.hips = true; o.face = 'smug'; }
    }
    pose(hero, o); parentTo(hero.root, g);
    // bloop
    let bp = [3, 0.5, -2.5], by = -1.4, bo = {}; bloop6.B.root.visible = true;
    if (!late) { if (win(t, E.quit, E.leave)) bo = { handOut: true }; if (win(t, E.pile, E.quit)) bo = { angry: true };
      if (t > E.leave) { const w = walker(t, [[E.leave, 3, 0.5, -2.5], [E.leave + 7, -30, 0.5, -12]]); bp = w.p; by = w.yaw; bo = { walk: 1, phase: w.phase }; bloop6.B.root.visible = t < E.leave + 7; } }
    else { bp = [3, 0.5, -2.2]; by = yawXZ([3, -2.2], [1.2, -1.2]); if (win(t, E.tear, E.tear + 4)) bo = { hop: true }; if (win(t, E.hug, E.bill2)) bp = [2.3, 0.5, -1.9]; if (t > E.bill2) { bp = [2.6, 0.5, -2.0]; bo = { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g);
    bHat.visible = late || t < E.quit; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0; card.visible = (!late && win(t, E.quit, E.leave)) || (late && t > E.bill2); card.scale.set(1, 1, 1); card.position.y = -0.62;
    bBrick.visible = blue.visible = drill.visible = board.visible = false;
    // leggy + puff
    let lp = [-4, 0.5, -3.5], ly = 0.6, ls = 0.3;
    if (!late && t > E.go) { const w = walker(t, [[E.go + 0.6, -4, 0.5, -3.5], [E.town, 10, 0.5, -4]]); lp = w.p; ly = w.yaw; ls = 2; }
    if (late && win(t, E.hug, E.bill2)) { lp = [-0.2, 0.5, -3.0]; ly = 1.0; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0; taxiSign.visible = false;
    if (!late && win(t, 52, 58.4)) { L6.hd.rotation.x = 0.5; }
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    puff.root.visible = true; parentTo(puff.root, g); poseMag(puff, t, (!late && t < E.go) ? [-1.5, 1.6, -4.5] : head, (!late && t < E.go) ? 0.5 : ly, { hop: win(t, 58.4, 61) });
    let cam = camKeys(t, late ? C3 : C1);
    if (!late && win(t, E.letter - 0.2, E.leave)) { const b = mailBird.root.position; cam = { p: [5.5, 2.4, 2.6], l: [lerp(b.x, 3, 0.5), lerp(b.y, 2, 0.5), lerp(b.z, -2.4, 0.5)], fov: 50 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: market plaza + MegaBuild site (x ≈ 60..110)
const town = (() => {
  const g = mk('town'), st = new VSet(g), r = rng(803);
  for (let x = -32; x <= 32; x++) for (let z = -26; z <= 12; z++) st.add(x, 0, z, Math.abs(x) + Math.abs(z + 4) < 14 ? 'path' : 'turf');
  const trees = []; for (let i = 0; i < 40; i++) { const x = Math.round((r() - .5) * 62), z = Math.round(-25 + r() * 36); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 5) || (Math.abs(x) < 16 && z > -16)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 2)); }
  // snack stand
  for (let x = -9; x <= -7; x++) st.add(x, 1, -6, 'plank'); for (const x of [-10, -6]) for (let y = 1; y <= 3; y++) st.add(x, y, -6, 'log');
  // pawn booth
  for (let x = 7; x <= 11; x++) for (let y = 1; y <= 3; y++) { st.add(x, y, -11, 'castle'); } for (let z = -10; z <= -9; z++) for (let y = 1; y <= 3; y++) { st.add(7, y, z, 'castle'); st.add(11, y, z, 'castle'); }
  for (let x = 7; x <= 11; x++) for (let z = -11; z <= -8; z++) st.add(x, 4, z, 'slate'); for (let x = 8; x <= 10; x++) st.add(x, 1, -8, 'plank');
  // MegaBuild site
  for (let x = 56; x <= 112; x++) for (let z = -32; z <= 8; z++) st.add(x, 0, z, 'castle');
  for (let bx = 58; bx <= 106; bx += 8) for (const bz of [-22, -29]) for (let x = 0; x < 3; x++) for (let y = 1; y <= 3; y++) for (let z = 0; z < 3; z++) st.add(bx + x, y, bz + z, 'castle');
  for (let x = 79; x <= 80; x++) for (let y = 1; y <= 2; y++) st.add(x, y, -8, 'castle');
  st.build();
  const awn = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 2.4), sailMat); awn.position.set(-8, 4.0, -6.3); awn.rotation.x = 0.15; g.add(awn);
  const sgn = (txt, x, y, z, w = 5) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.9, 0.08), new THREE.MeshBasicMaterial({ map: bannerTex(txt) })); m.position.set(x, y, z); g.add(m); return m; };
  sgn('PUFF-MALLOWS', -8, 4.7, -5.1, 4.4); sgn('HONK & PAWN', 9, 5.0, -7.9, 4.6); sgn('MEGABUILD CO.', 76, 5.2, -14, 6); const noHats = sgn('NO HATS', 70, 2.2, -6, 2.4);
  for (const x of [73, 79]) for (let y = 1; y <= 4; y++) st.add(x, y, -14, 'log');
  const mallows = []; for (let i = 0; i < 6; i++) { mallows.push(box(0.16, 0.16, 0.16, '#ffffff', -8.9 + i * 0.36, 1.6, -5.9, g)); }
  // the tower (pivot at its +x base edge so it topples toward +x)
  const towerG = new THREE.Group(); towerG.position.set(92.5, 0.5, -12.5); g.add(towerG); const tv = new VSet(towerG);
  for (let y = 0; y < 16; y++) for (let x = -4; x <= -1; x++) for (let z = -2; z <= 1; z++) tv.add(x + 0.5, y + 0.5, z + 0.5, y % 4 === 3 ? 'slate' : 'castle'); tv.build();
  const sup = new VSet(g, true); let si = 0; for (let y = 1; y <= 4; y++) for (const z of [-14, -13, -12, -11]) sup.add(93, y, z, 'brick', { t0: E.help + 0.4 + (si++) * 0.35, t1: E.topple + 0.6, fly: [6, 6, (z + 12.5) * 2], spin: [3, 2, 4], floor: -20 }); sup.build();
  // particles
  smoke(E.stand, E.eat, 0.5, [-7.2, 2.2, -6], { n: 2, colors: ['#ffffff', '#ffe0b0'], size: 0.2, life: 1.4, up: 1.2, grav: -0.5, speed: 0.3 });
  burst(E.eat + 1.5, [-7.2, 1.9, -6], { n: 30, colors: ['#ffffff', '#ffb43a'], speed: 3, size: 0.12, life: 0.8, grav: 6, up: 2 });
  burst(E.sell, [9, 2.4, -8.6], { n: 40, colors: ['#ffd23f', '#ffffff'], speed: 4, size: 0.14, life: 1, grav: 4, up: 3 });
  burst(E.mimeEnd - 0.4, [0, 1.2, 1], { n: 12, colors: ['#e6b06a'], speed: 2, size: 0.12, life: 0.6, grav: 8, up: 2 });
  for (let k = 0; k < 6; k++) burst(E.wobble + k * 1.6, [91, 15, -12.5], { n: 10, colors: ['#a7b1c9', '#6f7891'], speed: 2, size: 0.18, life: 1.2, grav: 10 });
  burst(E.crash, [104, 1.5, -12.5], { n: 300, colors: ['#a7b1c9', '#6f7891', '#c9c9c9', '#ffffff'], speed: 12, size: 0.4, life: 2.6, grav: 6, up: 5 });
  smoke(E.crash, E.camp, 0.3, t => [100 + Math.sin(t * 3) * 6, 1.5, -12.5 + Math.cos(t * 2) * 4], { n: 4, size: 1.2, life: 3, up: 1.5, grav: -0.4, colors: ['#b8b2ae', '#9a9490', '#d0cac6'] });
  // camera keys
  const C = [[E.town, 18, 10, 20, 0, 1, -4, 55], [74.3, 14, 8, 18, 0, 1, -4, 55], [74.4, -5, 2.6, 1.5, -8, 1.6, -6, 48], [79.7, -6, 2.4, 0.6, -8, 1.6, -6, 48],
    [79.8, 2, 3, 0, -8, 1, -3, 50], [87.9, 1, 3, -1, -8, 1, -3, 50], [88.0, -6.2, 2.4, -3.0, -7.6, 1.8, -6, 44], [91.9, -6.0, 2.3, -3.4, -7.6, 1.8, -6, 42],
    [92.0, -5.8, 2.1, -4.2, -7.2, 1.8, -6, 40], [97.1, -6.0, 2.1, -4.0, -7.2, 1.8, -6, 38], [97.2, -7, 2.4, -3.2, -8, 2.2, -7.2, 46], [101.3, -7.2, 2.4, -3.6, -8, 2.2, -7.2, 44],
    [101.4, 13, 3.5, -1, 9, 1.8, -9, 50], [106.7, 12, 3.2, -2, 9, 1.8, -9, 50], [106.8, 8.0, 2.8, -4.4, 9, 2.2, -9.5, 46], [112.7, 8.4, 2.7, -4.8, 9, 2.2, -9.5, 46],
    [112.8, 9.6, 2.4, -6.8, 9, 2.3, -9.5, 40], [118.3, 9.3, 2.4, -7.2, 9, 2.3, -9.5, 40], [118.4, 9.4, 2.3, -4.0, 9, 2.2, -6.4, 42], [122.3, 9.2, 2.3, -4.2, 9, 2.2, -6.4, 42],
    [136.0, -2, 2.5, 3, 0, 1.6, -2, 48], [141.7, -1.4, 2.5, 3.6, 0, 1.6, -2, 48], [141.8, 0.5, 2, 5.5, 0, 1.7, 1, 48], [150.7, 0.2, 1.9, 4.8, 0, 1.7, 1, 48],
    [150.8, -2.5, 1.8, 4, 0, 1.4, 1.5, 46], [154.5, -2.2, 1.8, 3.6, 0, 1.4, 1.5, 46], [154.6, 3, 3, 6, 0, 1.5, 0, 50], [160.3, 4, 3.2, 7, 0, 1.5, 0, 50],
    [160.4, 64, 12, 18, 85, 4, -10, 55], [166.3, 66, 11, 16, 85, 4, -10, 55], [166.4, 80.6, 2.2, -3.2, 78.2, 1.3, -5.8, 44], [171.5, 80.2, 2.2, -3.0, 78.2, 1.3, -5.8, 44],
    [171.6, 81, 0.8, -5, 85, 4, -9, 52], [177.3, 80.5, 0.9, -5.5, 85, 4, -9, 52], [177.4, 74.5, 2.2, 0, 77.5, 1.6, -4, 46], [181.9, 75, 2.1, -0.5, 77.5, 1.6, -4, 46],
    [182.0, 76.2, 2.4, -2.4, 78.5, 1.5, -4.6, 42], [186.7, 76.4, 2.4, -2.6, 78.5, 1.5, -4.6, 42], [186.8, 79.8, 2.7, -3.8, 76.8, 2.0, -3.2, 46], [193.1, 79.2, 2.6, -3.6, 76.8, 2.0, -3.2, 38],
    [193.2, 76.8, 2.2, -2.8, 78.5, 1.6, -4.5, 42], [198.9, 76.6, 2.2, -2.6, 78.5, 1.6, -4.5, 42], [199.0, 80, 1, 4, 90, 8, -12, 55], [203.1, 81, 1.2, 3, 90, 8, -12, 55],
    [203.2, 80, 3, -2, 83, 2.5, -8, 50], [209.1, 80.6, 3, -2.4, 83, 2.5, -8, 50], [209.2, 76, 6, 8, 90, 7, -12, 55], [213.5, 77, 6, 8, 90, 7, -12, 55],
    [213.6, 99, 3, -4, 92, 2, -12, 52], [217.9, 98, 3, -3.4, 92, 2, -12, 52], [218.0, 83.6, 2.2, -3.4, 82, 1.9, -6, 42], [222.3, 83.2, 2.2, -3.6, 82, 1.9, -6, 42],
    [222.4, 76, 5, 6, 90, 8, -12, 52], [227.1, 78, 5, 6, 90, 8, -12, 52], [227.2, 84, 2, -4, 88, 3, -12, 50], [229.3, 84.4, 2, -4.4, 88, 3, -12, 50],
    [229.4, 70, 8, 14, 96, 4, -12, 58], [231.5, 72, 8, 14, 96, 4, -12, 58], [231.6, 80, 3, 0, 84, 2.4, -8, 50], [236.7, 80.4, 3, -0.4, 84, 2.4, -8, 50],
    [236.8, 80.6, 2.2, -3.4, 82, 1.8, -6, 44], [E.camp, 80.8, 2.2, -3.2, 82, 1.8, -6, 44]];
  function update(t) {
    const site = t >= E.site; sup.update(t); crownM.visible = t < E.sell; rod.visible = false; judge.root.visible = false;
    mallows.forEach((m, i) => m.visible = t < E.eat + 0.4 + i * 0.25 && t > E.stand);
    const wob = win(t, E.wobble, E.topple) ? Math.sin(t * 4) * 0.03 * (t < E.help ? 1 : 0.4) : 0;
    let ang = t < E.lean ? 0 : t < E.help ? -0.2 * seg(t, E.lean, E.lean + 2) : t < E.fix ? -0.2 : t < E.topple - 1 ? -0.2 * (1 - seg(t, E.fix, E.fix + 4)) : 0;
    if (t >= E.topple) { const k = seg(t, E.topple, E.crash); ang = -1.48 * k * k; } towerG.rotation.z = ang + wob;
    noHats.visible = true;
    // --- hero
    const o = { t, p: [0, 0.5, 0], yaw: 0, face: 'normal' };
    if (!site) {
      if (t < E.stand) { const w = walker(t, [[E.town, -20, 0.5, 2], [E.stand - 0.5, -8, 0.5, -7.3]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; }
      else if (t < E.pawn) { o.p = [-8, 0.5, -7.3]; o.yaw = 0; o.wave = win(t, E.stand, E.stand + 5) || win(t, E.sale, E.sale + 3); o.face = win(t, E.eat, E.pawn) ? 'scared' : 'smug'; if (win(t, E.eat, E.eat + 5)) o.yaw = yawXZ([-8, -7.3], [-7.2, -6]); }
      else if (t < E.taxi) { const w = walker(t, [[E.pawn, -8, 0.5, -7.3], [E.pawn + 4.5, 9, 0.5, -6.4]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : Math.PI; o.walk = w.walk; o.phase = w.phase;
        if (t > E.pawn + 4.5) { o.p = [9, 0.5, -6.4]; o.yaw = Math.PI; o.face = t > E.sell ? 'scared' : 'normal'; o.hold = win(t, E.sell - 1.5, E.sell + 0.5); } }
      else if (t < E.mime) { o.p = [1.5, 0.5, -0.5]; o.yaw = yawXZ([1.5, -0.5], [L6.root.position.x, L6.root.position.z]); o.face = t > E.fare ? 'smug' : 'normal'; o.wave = win(t, E.fare, E.fare + 3); }
      else { o.p = [0, 0.5, 1]; o.yaw = 0; if (t < E.mimeEnd) { hero.aL.rotation.set(0, 0, 0); o.face = 'normal'; } }
    } else {
      if (t < E.sad) { const w = walker(t, [[E.site, 62, 0.5, 2], [E.sad - 0.4, 76.5, 0.5, -3]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; o.lean = 0.35; }
      else if (t < E.wobble) { o.p = [76.6, 0.5, -3.2]; o.yaw = yawXZ([76.6, -3.2], [78.4, -5.8]); o.face = t > 186.8 ? 'normal' : 'normal'; }
      else if (t < E.help) { o.p = [77, 0.5, -3]; o.yaw = yawXZ([77, -3], [91, -12.5]); o.face = 'scared'; o.panic = t > E.lean; }
      else if (t < E.topple) { const w = walker(t, [[E.help, 77, 0.5, -3], [E.help + 2.4, 95, 0.5, -9]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : -Math.PI / 2 - 0.4; o.walk = w.walk; o.phase = w.phase; if (t > E.help + 2.4) { o.block = 'brick'; o.swing = (t * 2.4) % 1; } }
      else { const w = walker(t, [[E.topple, 95, 0.5, -9], [E.topple + 1.6, 86, 0.5, -3]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : -2.5; o.walk = w.walk; o.phase = w.phase; o.panic = t < E.crash + 1; o.face = t < E.fired + 3 ? 'scared' : 'smug'; }
    }
    pose(hero, o); parentTo(hero.root, g);
    if (!site && win(t, E.mime, E.mimeEnd)) { const s = Math.sin(t * 2); hero.aL.rotation.set(-1.6, 0, -0.2 + s * 0.2); hero.aR.rotation.set(-1.6, 0, 0.2 - s * 0.2); }
    // --- bloop (site only)
    bloop6.B.root.visible = site; if (site) { parentTo(bloop6.B.root, g); let bp = [78.4, 0.5, -5.8], by = yawXZ([78.4, -5.8], [79.5, -8]), bo = {};
      if (t < E.talk) { by = Math.PI; bo = { walk: 1, phase: t * 3 }; } else if (t < E.wobble) by = yawXZ([78.4, -5.8], [76.6, -3.2]);
      if (win(t, E.warn, E.lean)) { bp = [82, 0.5, -7]; by = yawXZ([82, -7], [85, -9]); bo = { angry: true }; }
      if (t >= E.lean) { bp = [82, 0.5, -6]; by = yawXZ([82, -6], [91, -12.5]); bo = t > E.hatOn ? { handOut: true } : { angry: true }; }
      if (t >= E.fired) { bo = { hop: true }; by = yawXZ([82, -6], [86, -3]); }
      poseBurble(bloop6, t, bp, by, bo); if (win(t, E.fix, E.topple)) { bloop6.B.aR.rotation.set(-1.4, Math.sin(t * 3) * 0.6, 0); }
      bHat.visible = t > E.hatOn; if (win(t, E.hatOn, E.hatOn + 1.4)) { bHat.position.y = 1.2 + (1 - seg(t, E.hatOn, E.hatOn + 1.4)) * 1.5; } else bHat.position.y = 1.2;
      bBrick.material = MAT.castle; bBrick.visible = t < E.wobble; card.visible = false; }
    blue.visible = drill.visible = board.visible = false;
    // --- golem + goose
    parentTo(golem.root, g); golem.root.visible = site; if (site) { let gp = [85, 0.5, -9], gy = yawXZ([85, -9], [78.4, -5.8]), go = {};
      if (win(t, E.warn, E.lean)) go = { wave: true }; if (t > E.fix + 2) { const w = walker(t, [[E.fix + 2, 85, 0.5, -9], [E.topple - 0.8, 88.6, 0.5, -12.5]]); gp = w.p; gy = w.speed > 0.1 ? w.yaw : Math.PI / 2; go = { walk: w.speed > 0.1, lean: t > E.topple - 0.8 && t < E.crash ? 0.25 : 0 }; }
      if (t > E.crash) { gp = [88.6, 0.5, -12.5]; gy = yawXZ([88.6, -12.5], [82, -6]); go = { point: t > E.fired }; }
      poseGolem(golem, t, gp, gy, go); }
    parentTo(goose.root, g); goose.root.visible = !site; goose.root.position.set(9, 0.5, -9.6); goose.root.rotation.y = 0; goose.neck.rotation.x = Math.sin(t * 2.2) * 0.12 + (win(t, E.sell, E.sell + 1) ? -0.4 : 0); goose.hd.rotation.y = Math.sin(t * 1.3) * 0.4;
    parentTo(crownProp, g); crownProp.visible = !site && t > E.sell; crownProp.position.set(9.6, 1.65, -8.2); crownProp.rotation.y = t;
    // --- seals: snack queue, then taxi passengers / mime audience
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = !site && t > E.town; let sp = [-8 + (i - 1) * 0.6, 0.5, -3.6 + i * 1.8], sy = Math.PI;
      if (t > E.taxi && t < E.mime) { if (i === 0) { sp = null; } else { sp = [-4 + i * 2.5, 0.5, 5]; sy = Math.PI; } }
      if (t >= E.mime) { sp = [[-4.5, 4.5, 7][i], 0.5, 5]; sy = Math.PI; }
      if (sp) poseSeal(s, t, sp, sy, { clap: (win(t, E.sale, E.sale + 3) && i === 1) || (t > E.mimeEnd - 0.6 && t < E.mimeEnd + 2 && i === 1), seed: i * 3 }); });
    // --- leggy (taxi!) + puff
    let lp = [-4, 0.5, -4], ly = 0.4, ls = 0.3;
    if (t < E.stand) { const w = walker(t, [[E.town, -24, 0.5, 2], [E.stand, -4, 0.5, -4]]); lp = w.p; ly = w.yaw; ls = 2; }
    if (win(t, E.taxi, E.fare)) { const a = (t - E.taxi) * 0.75; lp = [Math.cos(a) * 9, 0.5, -3 + Math.sin(a) * 7]; ly = Math.atan2(-Math.sin(a) * 9, Math.cos(a) * 7); ls = 3; }
    if (win(t, E.fare, E.site)) { lp = [3.5, 0.5, -2.5]; ly = -1.2; }
    if (site) { const w = walker(t, [[E.site, 60, 0.5, 4], [E.sad, 72, 0.5, 0]]); lp = w.p; ly = w.speed > 0.1 ? w.yaw : -1.0; ls = w.speed > 0.1 ? 2 : 0.3;
      if (t > E.help) { const w2 = walker(t, [[E.help, 72, 0.5, 0], [E.help + 2.4, 95.4, 0.5, -12.5], [E.topple, 95.4, 0.5, -12.5], [E.topple + 1.5, 100, 0.5, -2]]); lp = w2.p; ly = w2.speed > 0.1 ? w2.yaw : -Math.PI / 2; ls = w2.speed > 0.1 ? 3 : 0.3; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0; taxiSign.visible = win(t, E.taxi - 1.5, E.fare + 2);
    if (site && win(t, E.help + 2.4, E.topple)) { L6.body.position.y = 2.0; L6.hd.rotation.x = -0.6; L6.legs.forEach((l, i) => l.rotation.x = i % 3 === 2 ? -1.0 : 0.2); }
    const passenger = seals[0]; if (win(t, E.taxi, E.mime)) { passenger.root.visible = true; const pp = rideOn(lp, ly, -0.2, 1.75); poseSeal(passenger, t, pp, ly, { clap: true, seed: 2 }); }
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    puff.root.visible = true; parentTo(puff.root, g); poseMag(puff, t, win(t, E.stand, E.pawn) ? [-7.2, 1.5, -6] : head, win(t, E.stand, E.pawn) ? 0 : ly, { hop: win(t, E.eat, E.eat + 4), big: win(t, E.help, E.topple) });
    // --- camera
    let cam = camKeys(t, C);
    if (win(t, E.taxi, E.fare)) { const q = L6.root.position; cam = t < 129.2 ? { p: [q.x * 1.6 + 2, 3, q.z * 1.4 + 4], l: [q.x, 1.4, q.z], fov: 50 } : { p: [0, 7, 12], l: [q.x, 1.2, q.z], fov: 46 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
