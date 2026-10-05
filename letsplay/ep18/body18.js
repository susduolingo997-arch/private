// ================================================================ EPISODE 18: "THE SHRINK RAY" — the yard (zap!) → the tiny world (grass jungle, Dotbeetle, puddle sea, giant Chompy, the tabletop) → the yard at sunset (zap again)
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
// --- Chompy (the Chompodon from last time, still huge)
function makeChomp() {
  const root = new THREE.Group(), body = pivot(root, 0, 2.2, 0), skin = new THREE.MeshLambertMaterial({ color: '#8a5ad8' }), belly = new THREE.MeshLambertMaterial({ color: '#d8c0ff' }), spot = new THREE.MeshLambertMaterial({ color: '#5fd86a' });
  box(2.6, 2.4, 4.2, 0, 0, 0, 0, body, skin); box(2.0, 1.4, 3.6, 0, 0, -0.6, 0.2, body, belly); for (const [x, y, z] of [[0.6, 1.21, -1], [-0.7, 1.21, 0.6], [0.3, 1.21, 1.4]]) box(0.6, 0.06, 0.6, 0, x, y, z, body, spot);
  for (let i = 0; i < 4; i++) box(0.3, 0.5, 0.5, '#5fd86a', 0, 1.4, 1.4 - i * 0.9, body);
  const tail = pivot(body, 0, -0.2, -2.1); box(1.6, 1.4, 2.2, 0, 0, 0, -1.0, tail, skin);
  const neck = pivot(body, 0, 0.8, 1.9); box(1.5, 1.8, 1.4, 0, 0, 0.8, 0.3, neck, skin); const hd = pivot(neck, 0, 1.8, 0.4); box(2.2, 1.5, 2.6, 0, 0, 0.3, 0.9, hd, skin);
  const jaw = pivot(hd, 0, -0.5, -0.1); box(2.0, 0.5, 2.6, 0, 0, -0.1, 1.2, jaw, belly); for (let i = 0; i < 5; i++) box(0.18, 0.22, 0.12, '#ffffff', -0.72 + i * 0.36, 0.22, 2.4, jaw);
  const tongue = box(0.8, 0.1, 1.6, '#ff6aa8', 0, 0.0, 2.6, jaw); tongue.visible = false;
  const eyes = [-0.65, 0.65].map(x => { const p = pivot(hd, x, 1.15, 1.2); box(0.7, 0.7, 0.7, '#ffffff', 0, 0, 0, p); const pu = box(0.3, 0.3, 0.1, '#111', 0, 0, 0.36, p); return { p, pu }; });
  const legs = [[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]].map(([x, z]) => { const p = pivot(body, x, -0.8, z); box(0.9, 1.6, 1.0, 0, 0, -0.6, 0, p, skin); return p; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, tail, neck, hd, jaw, eyes, legs, tongue };
}
function poseChomp(c, t, p, yaw, o = {}) { const w = o.walk || 0, ph = t * 5; c.root.position.set(...p); c.root.rotation.set(0, yaw, 0); c.body.position.y = 2.2 + Math.abs(Math.sin(ph)) * 0.25 * w; c.body.rotation.set(o.hide ? 0.2 : 0, 0, 0);
  c.legs.forEach((l, i) => l.rotation.set(Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.6 * w, 0, 0)); c.tail.rotation.set(0.15, Math.sin(t * (o.happy ? 9 : 2)) * (o.happy ? 0.5 : 0.2), 0);
  c.neck.rotation.x = (o.down ? 0.9 : 0) + (o.hide ? 0.6 : 0) + Math.sin(t * 1.5) * 0.05; c.hd.rotation.set(o.sniff ? Math.sin(t * 12) * 0.08 : 0, o.look ?? Math.sin(t * 0.9) * 0.15, 0);
  c.jaw.rotation.x = o.open ? 0.7 : 0.05; c.tongue.visible = !!o.lick; c.eyes.forEach((e, i) => { e.pu.position.set(Math.sin(t * 3.1 + i * 2) * 0.12, Math.cos(t * 2.7 + i) * 0.12, 0.36); e.p.scale.y = o.scared ? 1.4 : 1; }); }
const chompy = makeChomp(); chompy.root.scale.setScalar(1.7); const chompyG = makeChomp();
// --- the Dotbeetle: teal shell, yellow dots, glowing antennae; has wings (surprise)
function makeBeetle() {
  const root = new THREE.Group(), body = pivot(root, 0, 0.9, 0), shellM = new THREE.MeshLambertMaterial({ color: '#2ec4b6', emissive: '#0a4a44', emissiveIntensity: 0.3 }), dark = new THREE.MeshLambertMaterial({ color: '#1a2a3a' });
  box(2.2, 0.9, 2.6, 0, 0, 0.1, -0.2, body, dark); const shells = [-1, 1].map(s => { const p = pivot(body, s * 0.02, 0.5, 1.0); box(1.15, 0.6, 2.8, 0, s * 0.56, 0.1, -1.3, p, shellM); for (const [x, z] of [[0.3, -0.6], [0.6, -1.6], [0.25, -2.2]]) box(0.36, 0.05, 0.36, '#ffe066', s * x + s * 0.2, 0.42, z, p); return p; });
  const wings = [-1, 1].map(s => { const p = pivot(body, s * 0.4, 0.6, 0.8); box(1.4, 0.04, 2.6, 0, s * 0.7, 0, -1.3, p, new THREE.MeshLambertMaterial({ color: '#e8f8ff', transparent: true, opacity: 0.5, side: THREE.DoubleSide })); p.visible = false; return p; });
  const hd = pivot(body, 0, 0.1, 1.1); box(1.1, 0.7, 0.8, 0, 0, 0, 0.35, hd, dark); for (const x of [-0.3, 0.3]) { box(0.34, 0.34, 0.1, '#ffffff', x, 0.1, 0.76, hd); box(0.16, 0.18, 0.04, '#111', x, 0.08, 0.82, hd); }
  const ant = [-1, 1].map(s => { const p = pivot(hd, s * 0.25, 0.35, 0.5); box(0.06, 0.9, 0.06, '#1a2a3a', 0, 0.45, 0, p); box(0.18, 0.18, 0.18, 0, 0, 0.95, 0, p, new THREE.MeshBasicMaterial({ color: '#ffe066' })); p.rotation.set(0.5, 0, s * 0.4); return p; });
  const legs = []; for (let i = 0; i < 6; i++) { const s = i < 3 ? -1 : 1, z = [0.8, 0, -0.9][i % 3]; const p = pivot(body, s * 1.0, -0.2, z); box(0.8, 0.12, 0.12, 0, s * 0.4, 0, 0, p, dark).rotation.z = s * -0.4; box(0.12, 0.8, 0.12, 0, s * 0.8, -0.4, 0, p, dark); legs.push(p); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, shells, wings, hd, ant, legs };
}
function poseBeetle(b, t, p, yaw, o = {}) { b.root.position.set(...p); b.root.rotation.set(o.pitch || 0, yaw, 0); const w = o.walk || 0; b.body.position.y = 0.9 + Math.abs(Math.sin(t * 12)) * 0.08 * w;
  b.legs.forEach((l, i) => l.rotation.set(Math.sin(t * 14 + i * 2.1) * 0.5 * w, 0, o.fly ? (i < 3 ? 0.6 : -0.6) : 0)); const open = o.fly ? 1 : (o.open || 0);
  b.shells.forEach((s, i) => s.rotation.set(-open * 0.5, 0, (i ? 1 : -1) * open * 0.8)); b.wings.forEach((wg, i) => { wg.visible = !!o.fly; wg.rotation.set(0, 0, (i ? 1 : -1) * Math.sin(t * 60) * 0.5); });
  b.hd.rotation.set(o.nod ? Math.sin(t * 6) * 0.2 : 0, o.look || Math.sin(t * 1.3) * 0.2, 0); b.ant.forEach((a, i) => a.rotation.z = (i ? -1 : 1) * (0.4 + Math.sin(t * 4 + i) * 0.15)); }
const beetle = makeBeetle(); beetle.root.scale.setScalar(1.3);
// --- the shrink ray (dish on a tripod) + beams
function makeRay() { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ color: '#c0c0c8' }), body = pivot(g, 0, 0, 0);
  for (const a of [0, 2.1, 4.2]) { const l = box(0.08, 1.2, 0.08, 0, Math.cos(a) * 0.3, 0.5, Math.sin(a) * 0.3, body, m); l.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); }
  const head = pivot(body, 0, 1.2, 0); box(0.4, 0.4, 0.9, 0, 0, 0, 0, head, new THREE.MeshLambertMaterial({ color: '#ff5cf0' })); box(0.7, 0.7, 0.08, '#e8e8f0', 0, 0, 0.5, head); box(0.14, 0.14, 0.4, 0, 0, 0, 0.7, head, new THREE.MeshBasicMaterial({ color: '#7cff6b' }));
  const dial = box(0.06, 0.2, 0.2, '#ffe066', 0.22, 0.1, -0.1, head); const lever = pivot(head, -0.22, 0, -0.2); box(0.04, 0.3, 0.04, '#e8344e', 0, 0.15, 0, lever);
  return { g, head, dial, lever }; }
const ray = makeRay(), bigRay = makeRay(); bigRay.g.scale.setScalar(16);
const beamM = new THREE.MeshBasicMaterial({ color: '#7cff6b', transparent: true, opacity: 0.75 }), beamM2 = new THREE.MeshBasicMaterial({ color: '#ff5cf0', transparent: true, opacity: 0.75 });
const beams = [0, 1, 2].map(() => new THREE.Mesh(new THREE.BoxGeometry(0.22, 1, 0.22), beamM));
function beamAB(m, a, b, on) { m.visible = on; if (on) lineBetween(m, new THREE.Vector3(...a), new THREE.Vector3(...b)); }
// HUD helpers
const sizeAt = t => t < E.zap + 1 ? 100 : t < E.zap + 4 ? lerp(100, 1, seg(t, E.zap + 1, E.zap + 4)) : t < E.grow + 1 ? 1 : t < E.home + 2 ? lerp(1, 100, seg(t, E.grow + 1, E.home + 2)) : 100;
const goalAt = t => t < E.tiny ? null : t < E.grow ? Math.max(0, Math.round(lerp(400, 0, seg(t, E.plan, E.table)))) : null;

// ---------------------------------------------------------------- set A: the yard (normal size; day, then sunset)
const yard = (() => {
  const g = mk('yard'), st = new VSet(g), r = rng(1801);
  for (let x = -36; x <= 36; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, Math.abs(x) <= 1 && z > 4 ? 'path' : 'turf');
  for (let x = -14; x <= -6; x++) for (let z = -18; z <= -12; z++) for (let y = 1; y <= 4; y++) { if (!(x === -14 || x === -6 || z === -18 || z === -12)) continue; if (z === -12 && x === -10 && y <= 2) continue; st.add(x, y, z, 'plank'); }
  for (let k = 0; k <= 4; k++) for (let z = -18; z <= -12; z++) { st.add(-15 + k, 5 + k, z, 'slate'); st.add(-5 - k, 5 + k, z, 'slate'); } for (let k = 0; k <= 4; k++) for (let x = -15 + k; x <= -5 - k; x++) for (const z of [-19, -11]) st.add(x, 5 + k, z, 'slate');
  const trees = []; for (let i = 0; i < 46; i++) { const x = Math.round((r() - .5) * 70), z = Math.round((r() - .5) * 56); if (Math.abs(x) < 16 && Math.abs(z) < 18) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const table = new THREE.Group(); table.position.set(4, 0.5, 3); g.add(table); box(2.8, 0.14, 1.8, 0, 0, 1.2, 0, table, MAT.plank); for (const [x, z] of [[-1.2, -0.7], [1.2, -0.7], [-1.2, 0.7], [1.2, 0.7]]) box(0.14, 1.2, 0.14, '#6a4a2a', x, 0.6, z, table);
  parentTo(ray.g, g); beams.forEach(b => parentTo(b, g));
  burst(E.zap + 1.2, [-0.6, 1.2, 5], { n: 100, colors: ['#7cff6b', '#ffffff'], speed: 5, size: 0.15, life: 1.2, grav: 0, up: 1 });
  burst(E.home + 0.3, [-0.6, 1.2, 5], { n: 100, colors: ['#ff5cf0', '#ffffff'], speed: 5, size: 0.15, life: 1.2, grav: 0, up: 1 });
  burst(E.zap2 + 1.2, [4, 1.4, 8], { n: 100, colors: ['#ff5cf0', '#ffffff'], speed: 6, size: 0.18, life: 1.4, grav: 0, up: 1 });
  burst(E.stomp, [4, 1, 6], { n: 120, colors: ['#3f8f3a', '#8b5a3c', '#c0c0c8', '#ffffff'], speed: 9, size: 0.28, life: 1.6, grav: 10, up: 5 });
  const C = [[0, -4, 9, 22, 0, 5, -8, 52], [5.9, 2, 7, 18, 0, 5, -8, 50], [6, 5, 2.4, 9, 0, 4, -8, 54], [13.9, 4, 2.0, 8, 0, 5, -8, 54], [14, 7.4, 3, 6.6, 4, 2.1, 3, 44], [21.9, 7, 2.8, 6, 4, 2.1, 3, 40],
    [22, 6.4, 3.0, 6, 0, 5, -8, 50], [29.9, 6.6, 3.2, 5.4, 0, 5, -8, 48], [30, 2, 6, 14, -1, 2, 0, 54], [35.9, 2, 5, 12, -1, 1.6, 2, 52], [36, -1, 0.3, 7.6, -0.6, 0.6, 4.6, 50], [43.9, -0.4, 0.3, 7.2, -0.6, 0.4, 4.6, 46],
    [E.home, 0, 2.6, 10, -0.6, 1.6, 4, 50], [219.9, 1, 2.4, 9, -0.6, 1.6, 4, 46], [220, 6, 2.0, 10, 4, 2, 6, 50], [225.9, 7, 2.2, 10, 4, 2.4, 6, 50], [226, 0, 3, 16, 3, 3, 6, 54], [233.9, -2, 4, 17, 3, 4, 6, 56],
    [234, -9, 4, 12, 0, 3, 4, 54], [243.9, -8, 3.8, 11, 0, 3, 4, 52], [244, 8, 3, 13, 2, 3, -2, 52], [251.9, 9, 3, 12, 2, 4, -4, 52], [252, 8.4, 2.6, 6.4, 4, 2.2, 3, 46], [255.9, 8.4, 2.6, 6.0, 4, 2.2, 3, 44],
    [256, 10, 3, 14, 4, 3, 6, 54], [263.9, 11, 4, 15, 4, 4, 6, 56], [264, -4, 6, 22, 2, 5, 4, 58], [273.9, -2, 5, 21, 2, 5, 4, 56], [274, -6, 3.4, 16, 0, 2.6, 6, 52], [E.logo, -5.4, 3.2, 15, 0, 2.6, 6, 50]];
  function update(t) {
    hideMisc(); const late = t > E.home, F = Math.PI;
    ray.g.position.set(4, 1.84, 3); ray.g.rotation.set(0, late ? (t > E.aim2 ? 0.2 : -0.4) : -2.6, 0); ray.g.visible = !(late && t > E.stomp); ray.head.rotation.x = late ? 0 : -0.15;
    // the zap: ray → Bonk-bot's visor → the crew (and later: → beetle shell → Muffin)
    const zap = win(t, E.zap, E.zap + 1.4), zap2 = win(t, E.zap2, E.zap2 + 1.4); beams.forEach(b => b.material = zap2 ? beamM2 : beamM);
    beamAB(beams[0], [4, 3.1, 3], [-3, 3.2, -2], zap); beamAB(beams[1], [-3, 3.2, -2], [-0.6, 1.4, 5], zap && t > E.zap + 0.3);
    beamAB(beams[2], [4, 3.1, 3], [3.6, 3.4, -6], zap2); if (zap2) { beams[0].visible = t > E.zap2 + 0.3; lineBetween(beams[0], new THREE.Vector3(3.6, 3.4, -6), new THREE.Vector3(4, 1.4, 8)); }
    if (win(t, E.zap + 1.4, E.zap + 2)) beams.forEach(b => b.visible = false); if (!zap && !zap2) beams.forEach(b => b.visible = false);
    // crew scale: shrink at the zap, regrow on return
    const cs = !late ? lerp(1, 0.02, seg(t, E.zap + 1.2, E.zap + 3.4)) : lerp(0.02, 1, seg(t, E.home, E.home + 1.6));
    // hero
    let hp = [-0.6, 0.5, 5.4], hy = F, ho = { face: 'smug' }; if (t > E.ray) { hp = [2.4, 0.5, 4.6]; hy = 1.6; ho = { face: 'smug', hold: win(t, E.ray, E.ray + 5) }; } if (t > E.aim) { hp = [-0.6, 0.5, 5.4]; hy = F; ho = { face: 'smug', wave: win(t, E.aim + 2, E.aim + 5) }; }
    if (t > E.zap + 0.3) ho = { face: 'scared', panic: true }; if (late) { hp = [-0.6, 0.5, 5.4]; hy = 0; ho = { face: 'scared' }; if (t > E.home + 2) ho = { face: 'smug', wave: win(t, E.home + 2, E.home + 5) };
      if (t > E.bigbug) { hy = F; ho = { face: 'scared', headPitch: -0.4 }; } if (t > E.hug) { hp = [-0.6, 0.5, 6.6]; hy = F; ho = { face: 'smug', panic: false }; } if (t > E.aim2) { hp = [5.2, 0.5, 3.6]; hy = -2.6; ho = { face: 'smug', hold: true }; } if (t > E.zap2 + 0.4) ho = { face: 'scared', panic: true };
      if (t > E.stomp - 1) { hp = [-0.2, 0.5, 9]; hy = F; ho = { face: 'scared', panic: t < E.stomp + 2 }; } if (t > E.hug2) { hp = [0, 0.5, 9.4]; hy = 0; ho = { face: 'scared', headRoll: 0.3 }; } }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); hero.root.scale.setScalar(cs);
    // Bloop (presents the ray), Leggy, Muffin, Puff, Bonk-bot
    let bp = [5.2, 0.5, 1.8], by = -2.2, bo = { handOut: win(t, E.ray, E.ray + 4) }; if (t > E.aim) { bp = [0.8, 0.5, 5.6]; by = F; bo = {}; } if (t > E.zap + 0.3) bo = { angry: true }; if (late) { bp = [0.8, 0.5, 5.6]; by = 0; bo = { hop: win(t, E.home + 2, E.home + 6) }; if (t > E.bigbug) by = F; if (t > E.zap2) bo = { facepalm: true }; if (t > E.stomp - 1) { bp = [2.6, 0.5, 10]; by = F; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.scale.setScalar(cs);
    let lp = [-2.8, 0.5, 4.4], ly = F + 0.4; if (late && t > E.stomp - 1) { lp = [-4.4, 0.5, 5]; ly = F - 0.4; } poseLurk(L6, t, lp, ly, 0.3); parentTo(L6.root, g); L6.root.scale.setScalar(cs);
    const mgrow = late ? lerp(1, 8, seg(t, E.zap2 + 1.2, E.zap2 + 3.2)) : 1, mp = late && t > E.zap2 ? [4, 0.5, lerp(8, 2, seg(t, E.zap2 + 3.4, E.stomp))] : [3, 0.5, 8];
    poseMuffin(muffin, t, mp, F, { hop: win(t, E.zap2 + 3.4, E.stomp + 1) || win(t, E.stomp + 3, E.freeze) }); parentTo(muffin.root, g); muffin.root.scale.setScalar(mgrow); if (late && t > E.stomp) muffin.root.position.z = 2;
    poseMag(puff, t, [-4.6, 0.6, 6.6], 0.8); parentTo(puff.root, g);
    poseBot(bot, t, [-3, 0.5, -2], 1.2, { off: true, roll: 0, alarm: win(t, E.zap, E.zap + 3) }); parentTo(bot.root, g); bot.visor.material.color.set(zap ? '#ffffff' : '#ff2a3a');
    // Chompy: huge, eats things, sniffs for the tiny crew, then hides from giant Muffin
    let cp = [0, 0.5, -8], cy = 0.2, co = { happy: t < E.aim }; if (win(t, E.zap + 3, E.home)) { cp = [-0.4, 0.5, -1.6]; co = { down: true, sniff: true }; cy = 0; }
    if (late) { cp = [0, 0.5, -8]; co = { happy: true }; if (t > E.zap2 + 2) { cp = [lerp(0, -16, seg(t, E.zap2 + 3, E.stomp)), 0.5, -7]; cy = -1.6; co = { walk: t < E.stomp ? 1 : 0, scared: true, hide: t > E.stomp }; } }
    poseChomp(chompy, t, cp, cy, co); parentTo(chompy.root, g);
    // the beetle came back with us — and got zapped bigger
    parentTo(beetle.root, g); beetle.root.visible = late; const bs = lerp(0.03, 1, seg(t, E.home, E.home + 1.6)) * lerp(1, 3.4, seg(t, E.bigbug, E.bigbug + 2.4)); beetle.root.scale.setScalar(bs);
    let ep = [3.6, 0.5, 6.4], ey = F + 0.6, eo = { look: 0.4 }; if (t > E.bigbug) { ep = [3.6, 0.5, 0.4]; ey = F + 0.3; eo = { nod: t > E.bigbug + 3 }; } if (t > E.hug) { ep = [0.4, 0.5, 2.6]; ey = 0; eo = { nod: true }; } if (t > E.aim2) { ep = [3.6, 0.5, -3.4]; ey = 0.4; eo = {}; } if (t > E.stomp) { ep = [2.6, 0.5, 2.8]; ey = 0.2; eo = { nod: true, open: t > E.hug2 ? 0.3 : 0 }; }
    poseBeetle(beetle, t, ep, ey, eo);
    const cam = camKeys(t, C); return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the tiny world (grass jungle → puddle sea → up to the tabletop)
const tiny = (() => {
  const g = mk('tiny'), st = new VSet(g), r = rng(1802);
  for (let x = -30; x <= 110; x++) for (let z = -30; z <= 30; z++) { const pud = Math.hypot((x - 58) / 1.4, z) < 14; if (pud) continue; st.add(x, 0, z, hash2(x, z, 7) < 0.3 ? 'path' : 'soil'); }
  st.build();
  const pudW = new THREE.Mesh(GEO, MAT.water); pudW.scale.set(40, 1, 30); pudW.position.set(58, -0.4, 0); g.add(pudW);
  // grass blades (instanced)
  const bladeM = new THREE.MeshLambertMaterial({ color: '#5fb04a' }), N = 520, blades = new THREE.InstancedMesh(GEO, bladeM, N); blades.castShadow = true; let n = 0;
  for (let i = 0; i < 4000 && n < N; i++) { const x = -30 + r() * 140, z = -30 + r() * 60; if (Math.hypot((x - 58) / 1.4, z) < 16) continue; if (Math.abs(z) < 5.5 && x < 44) continue; if (x > 76 && Math.abs(z) < 6) continue;
    const h = 5 + r() * 9; _m.compose(_p.set(x, h / 2, z), _q.setFromEuler(_e.set((r() - .5) * 0.3, r() * 3, (r() - .5) * 0.3)), _s.set(0.3 + r() * 0.3, h, 0.08)); blades.setMatrixAt(n++, _m); }
  blades.count = n; g.add(blades);
  for (let i = 0; i < 14; i++) { const x = -20 + r() * 120, z = (r() < 0.5 ? -1 : 1) * (5 + r() * 18); if (Math.hypot((x - 58) / 1.4, z) < 16) continue; const s = 2 + r() * 4; box(s, s * 0.7, s * 1.2, '#9a9490', x, s * 0.35, z, g).rotation.y = r() * 3; }
  const clover = new THREE.Group(); clover.position.set(20, 0, -6); g.add(clover); box(0.4, 9, 0.4, '#3c8a32', 0, 4.5, 0, clover); for (let i = 0; i < 3; i++) { const a = i * 2.1; box(4, 0.2, 4, '#4caa40', Math.cos(a) * 2.2, 9, Math.sin(a) * 2.2, clover); }
  const crumb = box(0.8, 0.6, 0.7, '#e6b06a', 0, 0, 0, new THREE.Group());
  const leafBoat = new THREE.Group(); box(3.6, 0.2, 1.8, '#4caa40', 0, 0, 0, leafBoat); box(0.1, 0.24, 1.7, '#2c6a2a', 0, 0.06, 0, leafBoat); const mast = box(0.1, 2.4, 0.1, '#6a4a2a', 0, 1.2, 0, leafBoat); box(0.06, 1.6, 1.2, '#f4ecd8', 0.1, 1.5, 0.1, leafBoat);
  // giant Muffin on the far shore + giant Chompy's head from above
  const gm = makeMuffin(); gm.root.scale.setScalar(26); gm.root.position.set(58, 0, -50); g.add(gm.root);
  const gHead = new THREE.Group(); g.add(gHead); { const sk = new THREE.MeshLambertMaterial({ color: '#8a5ad8' }); box(30, 18, 26, 0, 0, 0, 0, gHead, sk); box(26, 4, 4, '#d8c0ff', 0, -9, 13, gHead); for (const x of [-7, 7]) { box(9, 9, 2, '#ffffff', x, 4, 13.2, gHead); box(4, 4, 1, '#111', x, 3, 14.4, gHead); } }
  const gTongue = box(8, 1, 14, '#ff6aa8', 0, -10, 20, gHead);
  // the tabletop (far away, high up): planks + the giant shrink ray
  const top = new THREE.Group(); top.position.set(300, 0, 0); g.add(top); const tv = new VSet(top); for (let x = -20; x <= 20; x++) for (let z = -12; z <= 12; z++) tv.add(x, 0, z, 'plank'); tv.build(); bigRay.g.position.set(8, 0.5, 0); bigRay.g.rotation.y = -Math.PI / 2; top.add(bigRay.g);
  parentTo(beetle.root, g); parentTo(crumb.parent, g); parentTo(leafBoat, g);
  burst(E.splash, [58, 0, -24], { n: 160, colors: ['#9fd0ff', '#ffffff'], speed: 12, size: 0.5, life: 2, grav: 8, up: 10 });
  burst(E.grow, [292, 2, 0], { n: 140, colors: ['#ff5cf0', '#ffffff'], speed: 8, size: 0.3, life: 1.4, grav: 0, up: 1 });
  for (let t = E.ride; t < E.puddle; t += 0.5) burst(t, [lerp(0, 40, seg(t, E.ride, E.puddle)), 0.6, 0], { n: 5, colors: ['#8b5a3c', '#a87048'], speed: 2, size: 0.15, life: 0.6, grav: 6, up: 1 });
  const EX = [[E.bug, -40], [E.bug + 4, -8], [E.snack, -8], [E.ride, -4], [E.puddle, 40], [E.boat, 41], [E.shore, 41], [E.shore + 1, 76], [E.face + 14, 78]];
  const BX = [[E.boat, 44], [E.sail, 44], [E.shore, 72]];
  const C = [[E.tiny, 0, 2, 9, 0, 1.4, 0, 54], [51.9, 1, 2.6, 8, 0, 2, 0, 50], [52, -6, 3, 10, 6, 8, -6, 62], [59.9, -4, 2, 8, 8, 10, -6, 62], [60, 3, 2.4, 6, 0, 1.8, 0, 48], [65.9, 3.6, 2.4, 5.4, 0, 1.8, 0, 44],
    [66, 1, 1.4, 5.6, -8, 1.8, -1, 54], [71.9, 1.4, 1.4, 5.2, -8, 2.2, -1, 54], [72, 4, 2, 6, -4, 1.6, 0, 52], [83.9, 3, 2.2, 5, -4, 1.6, 0, 50], [84, 3, 2.4, 7, -6, 1.4, 0, 48], [95.9, 2, 2.4, 6.4, -6, 1.6, 0, 46],
    [96, 6, 3, 8, 0, 1.6, 0, 54], [107.9, 24, 3, 8, 18, 1.6, 0, 54], [108, 30, 1.4, -3, 24, 1.4, 0, 56], [119.9, 38, 1.4, -2, 34, 1.4, 0, 56], [120, 44, 4, 10, 42, 1, 0, 52], [131.9, 45, 3, 8, 43, 1, 0, 48],
    [132, 46, 4, 12, 56, 4, -10, 56], [145.9, 62, 4, 12, 62, 4, -20, 56], [146, 60, 3, 12, 58, 14, -40, 62], [149.9, 64, 3, 12, 62, 4, -10, 58], [150, 76, 3, 8, 70, 1.4, 0, 52], [155.9, 78, 2.6, 7, 72, 1.4, 0, 50],
    [156, 72, 2, 10, 80, 18, -30, 64], [163.9, 73, 2, 11, 80, 16, -30, 64], [164, 82, 3, 6, 78, 3, 0, 54], [169.9, 83, 3, 5, 78, 3, 0, 50], [170, 70, 6, 12, 78, 8, 0, 58], [177.9, 66, 14, 16, 78, 20, 0, 58],
    [178, 270, 12, 30, 300, 2, 0, 56], [185.9, 280, 6, 22, 296, 2, 0, 54], [186, 280, 22, 30, 304, 14, 0, 56], [195.9, 282, 23, 29, 304, 17, 0, 56], [196, 284, 24, 28, 304, 18, 0, 56], [203.9, 285, 24, 27, 304, 19, 0, 54],
    [204, 290, 2.6, 6, 294, 1.6, 0, 48], [209.9, 290.4, 2.4, 5.4, 294, 1.6, 0, 44], [210, 284, 6, 14, 296, 4, 0, 58], [E.home, 284, 6, 14, 296, 4, 0, 58]];
  function update(t) {
    hideMisc(); const F = Math.PI, ex = lerpK(EX, t), onTop = t > E.table, base = onTop ? 300 : 0;
    // crew path along the grass "road"
    let hx = lerpK([[E.tiny, 0], [E.plan + 6, 0], [E.bug, -2], [E.ride, -2], [E.puddle, 38], [E.boat, 42], [E.sail, 44], [E.shore, 72], [E.shore + 2, 74]], t), hz = 0.6;
    const riding = win(t, E.ride, E.puddle) || win(t, E.face + 14, E.table), sailing = win(t, E.sail, E.shore);
    // beetle
    parentTo(beetle.root, g); beetle.root.visible = t > E.bug - 1 && t < E.grow + 1; beetle.root.scale.setScalar(1.6);
    let bp = [ex, 0, -0.6], by = t < E.bug + 4 ? F / 2 : (moving(EX, t) ? F / 2 : -F / 2 + 0.5), bo = { walk: moving(EX, t) ? 1 : 0, look: win(t, E.snack, E.ride) ? 0.4 : undefined, nod: win(t, E.snack + 4, E.ride) };
    if (sailing) { bp = [lerpK(BX, t), 0.2, -0.6]; by = F / 2; bo = {}; }
    if (t > E.face + 14 && t < E.table) { const k = seg(t, E.face + 14, E.table); bp = [lerp(78, 296, k), Math.sin(k * Math.PI) * 30 + k * 0.5, 0]; by = F / 2; bo = { fly: true }; }
    if (onTop) { bp = [292, 0.5, -3]; by = 0.4; bo = { nod: t > E.climb, open: 0 }; }
    poseBeetle(beetle, t, bp, by, bo);
    // riders: hero + Bloop sit on the beetle's back when riding / flying
    const back = (dx) => [beetle.root.position.x + dx, beetle.root.position.y + 2.7, beetle.root.position.z];
    let hp = [hx, 0.5, hz], hy = F / 2, ho = { face: 'smug' };
    if (t < E.plan) { hp = [0, 0.5, 0.6]; hy = 0; ho = { face: 'scared', headYaw: Math.sin(t * 2) * 0.5 }; } else if (t < E.bug) { hy = 0; ho = { face: 'smug', hold: win(t, E.plan, E.plan + 4) }; }
    if (win(t, E.bug, E.snack)) { hp = [0, 0.5, 0.6]; hy = -F / 2; ho = { face: 'scared', panic: true }; } if (win(t, E.snack, E.ride)) { hp = [-1, 0.5, 1.4]; hy = -F / 2; ho = { face: 'smug' }; }
    if (riding) { hp = back(-0.4); hy = F / 2; ho = { face: 'smug', sit: 1, wave: t > E.ride + 2 && t < E.ride + 5 }; }
    if (win(t, E.puddle, E.sail)) { hp = [40, 0.5, 2]; hy = 0.3; ho = { face: 'normal' }; } if (sailing) { hp = [lerpK(BX, t) - 1.2, 0.5 + Math.sin(t * 2) * 0.1, 0.4]; hy = F / 2; ho = { face: t > E.splash ? 'scared' : 'smug', panic: win(t, E.splash, E.shore) }; }
    if (win(t, E.shore, E.face + 14)) { hp = [76, 0.5, 1.6]; hy = F / 2; ho = { face: t > E.face ? 'scared' : 'smug', panic: win(t, E.face + 4, E.face + 10), headPitch: t > E.face ? -0.6 : 0 }; }
    if (onTop) { hp = [290.6, 0.5, 1.4]; hy = F / 2; ho = { face: 'smug', wave: win(t, E.lever, E.grow) }; if (t > E.grow) ho = { face: 'scared', panic: true }; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); hero.root.scale.setScalar(1);
    let lpB = [hx - 1.6, 0.5, -1.6], lyB = F / 2, loB = {}; if (t < E.bug) { lpB = [1.6, 0.5, 0.2]; lyB = -0.6; } if (riding) { lpB = back(0.7); loB = { hop: false }; } if (sailing) lpB = [lerpK(BX, t) + 1.0, 0.5 + Math.sin(t * 2) * 0.1, 0.2];
    if (win(t, E.puddle, E.sail)) { lpB = [42, 0.5, 0.4]; lyB = -1.4; loB = { hop: true }; } if (win(t, E.shore, E.face + 14)) { lpB = [77, 0.5, -0.8]; loB = { angry: win(t, E.face + 4, E.face + 10) }; }
    if (onTop) { const k = seg(t, E.climb, E.climb + 8); lpB = [lerp(292, 306, k), lerp(0.5, 23.1, ss(k)) + (k > 0 && k < 1 ? Math.abs(Math.sin(t * 6)) * 0.4 : 0), lerp(1, 1.4, k)]; lyB = k < 1 ? F / 2 : -F / 2; loB = { hop: k >= 1 && t < E.lever, handOut: t > E.lever - 1 && t < E.grow }; }
    poseBurble(bloop6, t, lpB, lyB, loB); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.scale.setScalar(1); bBrick.visible = win(t, E.puddle, E.sail);
    // Leggy: scared of the beetle → feeds it → runs alongside → pushes the giant lever
    let lp = [hx - 3, 0.5, 2.6], ly = F / 2, ls = moving([[0, 0]], t) ? 0 : 0.3; if (t < E.bug) { lp = [-2.6, 0.5, -0.8]; ly = 0.6; }
    if (win(t, E.bug, E.snack)) { lp = [2.4, 0.5, -1.2]; ly = -F / 2; L6.root.position.x += 0; } if (win(t, E.snack, E.ride)) { const k = seg(t, E.snack, E.snack + 4); lp = [lerp(1.8, -4.4, k), 0.5, lerp(2, 0.8, k)]; ly = -F / 2; ls = k < 1 ? 1 : 0.3; }
    if (riding && t < E.puddle) { lp = [beetle.root.position.x - 1, 0.5, 3.4]; ls = 3; } if (win(t, E.puddle, E.shore)) { lp = [lerpK(BX, t) - 0.5 + (t < E.sail ? -2 : 0), 0.5 + (sailing ? -0.2 : 0), sailing ? 2.4 : 2.6]; ly = F / 2; }
    if (win(t, E.shore, E.face + 14)) { lp = [74.4, 0.5, 2.8]; ly = F / 2 + 0.4; } if (t > E.face + 14) { lp = beetle.root.position.toArray(); lp[1] += 2.2; lp[2] -= 2.6; ls = 0.3; }
    if (onTop) { const k = seg(t, E.climb, E.lever); lp = [lerp(294, 304.2, k), 0.5, lerp(-2, -3.2, k)]; ly = k < 1 ? F / 2 : 0; ls = k > 0 && k < 1 ? 2 : 0.3; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.scale.setScalar(1); if (win(t, E.bug, E.snack)) L6.root.position.x += Math.sin(t * 40) * 0.06;
    if (onTop && t > E.lever) L6.legs.forEach((l, i) => l.rotation.x = -0.6 + Math.sin(t * 20 + i) * 0.2);
    crumb.parent.visible = win(t, E.snack - 1, E.snack + 6); crumb.parent.position.set(lerp(-3.4, -6.4, seg(t, E.snack, E.snack + 3)), 0.6, 1.0);
    leafBoat.visible = win(t, E.puddle + 2, E.shore + 4); leafBoat.position.set(t < E.sail ? 42 : lerpK(BX, t), 0.2 + Math.sin(t * 2) * 0.1 + (win(t, E.splash, E.splash + 3) ? Math.sin(seg(t, E.splash, E.splash + 3) * Math.PI) * 2 : 0), 0); leafBoat.rotation.set(Math.sin(t * 1.6) * 0.06 + (win(t, E.splash, E.splash + 3) ? Math.sin(t * 6) * 0.3 : 0), 0, 0);
    // giant Muffin hops on the far shore (the waves!)
    poseMuffin(gm, t, [58, 0, -50], 0, { hop: win(t, E.splash - 1.2, E.splash + 0.4) }); gm.root.visible = t > E.puddle - 2 && t < E.shore + 4;
    // giant Chompy's face from above
    gHead.visible = win(t, E.face - 1, E.face + 16); gHead.position.set(80, lerp(60, 20, ss(seg(t, E.face - 1, E.face + 3))) + Math.sin(t * 6) * 0.4 * (t < E.face + 6 ? 1 : 0), -30); gHead.rotation.set(0.25, -0.15, 0); gTongue.visible = win(t, E.face + 6, E.face + 12); gTongue.scale.z = 1 + Math.sin(t * 5) * 0.3;
    // the giant shrink ray: dial + lever + grow beam
    bigRay.lever.rotation.x = t > E.lever ? 1.2 : 0; beamAB(beams[0], [297, 19.7, 0], [290.6, 1.2, 1.4], win(t, E.grow - 0.4, E.grow + 1.6)); beams[0].material = beamM2; beams[0].scale.x = beams[0].scale.z = 8; parentTo(beams[0], g); beams[1].visible = beams[2].visible = false;
    let cam = camKeys(t, C); if (win(t, E.face + 14, E.table)) { const b = beetle.root.position; cam = { p: [b.x - 10, b.y + 3, b.z + 10], l: [b.x, b.y + 1, b.z], fov: 54 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
