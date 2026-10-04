// ================================================================ EPISODE 3: "I LIVE IN A BOAT (it sinks)"
const parentTo = (o, grp) => { if (o.parent !== grp) grp.add(o); };
TX2.sail = ctex(16, (g) => { for (let y = 0; y < 16; y++) { g.fillStyle = (y >> 2) % 2 ? '#ffffff' : '#ff4d6d'; g.fillRect(0, y, 16, 1); } g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 1, 16); }, 41);
const sailMat = new THREE.MeshLambertMaterial({ map: TX2.sail, side: THREE.DoubleSide });
// --- the boat (local: forward +z, deck surface y = 1.5)
function buildBoat(parent, timed) {
  const G2 = new THREE.Group(); parent.add(G2); const vs = new VSet(G2, true), cells = [];
  const hw = z => z > 3 ? 5 - z : (z < -4 ? 1 : 2);
  for (let z = -5; z <= 5; z++) { const w = hw(z);
    for (let x = -w; x <= w; x++) { if (Math.abs(x) < w || w === 0) cells.push([x, 0, z, 'log', 0]); }
    for (let x = -w; x <= w; x++) if (Math.abs(x) === w || z === -5 || z === 5) { cells.push([x, 1, z, 'log', 1]); if (z <= 3) cells.push([x, 2, z, 'plank', 1]); }
    for (let x = -w + 1; x <= w - 1; x++) if (z > -5 && z < 5) cells.push([x, 1, z, 'plank', 2]); }
  for (let x = -1; x <= 1; x++) for (let z = -4; z <= -2; z++) for (let y = 2; y <= 3; y++) { if (Math.abs(x) < 1 && z > -4 && z < -2) continue; if (x === 0 && z === -2 && y === 2) continue; cells.push([x, y, z, y === 3 && x === 0 && z === -4 ? 'glass' : 'plank', 3]); }
  for (let x = -1; x <= 1; x++) for (let z = -4; z <= -2; z++) cells.push([x, 4, z, 'slate', 3]);
  for (let y = 2; y <= 10; y++) cells.push([0, y, 1, 'log', 4]);
  const ph = [[E.buildA, E.hull], [E.hull, E.deckEnd - 1.4], [E.hull + 1.0, E.deckEnd], [E.deckEnd - 1.2, E.deckEnd], [E.mast, E.sail]];
  const byPh = [0, 1, 2, 3, 4].map(p => cells.filter(c => c[4] === p));
  const blocks = [];
  byPh.forEach((arr, p) => arr.forEach((c, i) => { const o = timed ? { t0: ph[p][0] + i * (ph[p][1] - ph[p][0]) / arr.length } : {}; blocks.push(vs.add(c[0], c[1], c[2], c[3], o)); }));
  const sail = new THREE.Group(); sail.position.set(0, 7, 1.3); G2.add(sail); const sm = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.4, 0.08), sailMat); sm.castShadow = true; sail.add(sm);
  const flag = box(0.8, 0.5, 0.05, '#5ff7ff', 0.45, 3.0, 0, sail);
  const cannon = new THREE.Group(); cannon.position.set(0, 2.0, 3.6); G2.add(cannon);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.6, 10), new THREE.MeshLambertMaterial({ color: '#2a2a35' })); barrel.rotation.x = Math.PI / 2 - 0.25; barrel.position.set(0, 0.3, 0.3); barrel.castShadow = true; cannon.add(barrel);
  box(0.9, 0.35, 1.0, '#7a4a2a', 0, -0.25, 0, cannon); for (const x of [-0.5, 0.5]) for (const z of [-0.3, 0.3]) box(0.12, 0.35, 0.35, '#3a2410', x, -0.35, z, cannon);
  const anchor = new THREE.Group(); anchor.position.set(2.8, 2.2, -1); G2.add(anchor);
  for (const [x, y] of [[0, 0], [0, -1], [0, -2], [-0.5, -2.2], [0.5, -2.2], [-0.9, -1.8], [0.9, -1.8]]) { const m = new THREE.Mesh(GEO, MAT.buzz); m.scale.setScalar(0.5); m.position.set(x, y * 0.5, 0); m.castShadow = true; anchor.add(m); }
  const chain = box(0.08, 1, 0.08, '#555', 0, 0, 0, G2);
  vs.build();
  return { G: G2, vs, blocks, sail, cannon, anchor, chain, flag };
}
function makeBird(col = '#ff7fb6') {
  const root = new THREE.Group(); box(0.5, 0.4, 0.8, col, 0, 0, 0, root); box(0.36, 0.36, 0.36, col, 0, 0.25, 0.45, root); box(0.12, 0.1, 0.3, '#ff9a2a', 0, 0.22, 0.75, root);
  box(0.08, 0.08, 0.05, '#000', -0.13, 0.32, 0.64, root); box(0.08, 0.08, 0.05, '#000', 0.13, 0.32, 0.64, root);
  const wL = pivot(root, -0.25, 0.1, 0), wR = pivot(root, 0.25, 0.1, 0); box(0.8, 0.06, 0.45, shade(col, 0.85), -0.4, 0, 0, wL); box(0.8, 0.06, 0.45, shade(col, 0.85), 0.4, 0, 0, wR);
  return { root, wL, wR };
}
function makeGulp() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const skin = new THREE.MeshLambertMaterial({ color: '#2f6f7a' }), belly = new THREE.MeshLambertMaterial({ color: '#9fd8c8' });
  box(10, 6, 16, 0, 0, 0, 0, body, skin); box(9, 1.2, 15, 0, 0, -3.1, 0.2, body, belly); box(8, 4, 3, 0, 0, -0.2, -9, body, skin); box(1, 5, 4, 0, 0, 0, -11.5, body, skin);
  box(1, 3, 3, 0, -5.4, -1, 1, body, skin).rotation.z = 0.5; box(1, 3, 3, 0, 5.4, -1, 1, body, skin).rotation.z = -0.5;
  box(7, 1.1, 0.3, '#14303a', 0, -1.2, 8.05, body);
  for (let i = 0; i < 6; i++) box(0.4, 0.5, 0.2, '#ffffff', -2.5 + i, -0.8, 8.1, body);
  const eyes = [-4.6, 4.6].map(x => { const e = pivot(body, x, 2.2, 6.6); box(0.3, 1.6, 1.6, '#ffffff', 0, 0, 0, e); box(0.32, 0.7, 0.7, '#111', Math.sign(x) * 0.02, 0, 0.2, e); const lid = box(0.36, 1.7, 1.7, '#24565f', 0, 0, 0, e); return { e, lid }; });
  const stalk = pivot(body, 0, 3, 5.5); for (let i = 0; i < 4; i++) box(0.35, 1.0, 0.35, '#2f6f7a', 0, 0.5 + i * 0.9, i * 0.45, stalk);
  const bulb = box(0.9, 0.9, 0.9, 0, 0, 4.2, 2.1, stalk, new THREE.MeshBasicMaterial({ color: '#fff27a' }));
  const lampL = new THREE.PointLight('#fff27a', 0, 25, 1.4); lampL.position.set(0, 4.2, 2.1); stalk.add(lampL);
  // the "island" on its back
  const isl = pivot(body, 0, 3, 0);
  box(9.2, 0.6, 14, '#e8d28a', 0, 0.3, 0, isl, lam(TX.sand)); box(5, 0.3, 6, '#3cc2a3', -1, 0.75, -2, isl, lam(TX.turfTop));
  const palm = pivot(isl, -2, 0.6, -2.5); for (let i = 0; i < 6; i++) { const b = box(0.55, 0.9, 0.55, 0, i * 0.18, 0.45 + i * 0.85, 0, palm, lam(TX.bark)); b.rotation.z = -0.08 * i; }
  for (let k = 0; k < 6; k++) { const f = pivot(palm, 1.0, 5.6, 0); f.rotation.y = k * Math.PI / 3; const fr = box(2.6, 0.18, 0.7, '#3cc26a', 1.3, -0.3, 0, f); fr.rotation.z = -0.35; }
  for (let i = 0; i < 3; i++) box(0.45, 0.45, 0.45, '#7a4a2a', 1.0 + (i - 1) * 0.4, 5.0, (i % 2) * 0.4, palm);
  const chest = pivot(isl, 2, 0.6, -3); box(1.2, 0.7, 0.8, '#8a5a2b', 0, 0.35, 0, chest); const lidC = pivot(chest, 0, 0.7, -0.4); box(1.25, 0.3, 0.85, '#7a4a2a', 0, 0.15, 0.4, lidC); box(1.27, 0.1, 0.1, '#ffd23f', 0, 0.2, 0.83, lidC); box(0.2, 0.25, 0.05, '#ffd23f', 0, 0.45, 0.42, chest);
  const glow = box(0.9, 0.2, 0.5, 0, 0, 0.62, 0, chest, new THREE.MeshBasicMaterial({ color: '#5ff7ff' }));
  return { root, body, eyes, stalk, lampL, isl, palm, chest, lidC, glow, TOP: 3.6 };
}
function makeCrown() { const c = new THREE.Group(); const gold = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.4 });
  box(0.62, 0.16, 0.62, 0, 0, 0, 0, c, gold); for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25], [0, 0.3], [0, -0.3]]) box(0.1, 0.22, 0.1, 0, x, 0.18, z, c, gold); box(0.14, 0.14, 0.05, 0, 0, 0.02, 0.32, c, MAT.shard); return c; }
function makeCapHat() { const h = new THREE.Group(); box(0.95, 0.12, 0.8, '#1b2a4a', 0, 0.02, 0, h); box(0.66, 0.3, 0.6, '#1b2a4a', 0, 0.2, 0, h); box(0.67, 0.08, 0.61, '#ffd23f', 0, 0.1, 0, h); box(0.18, 0.18, 0.04, 0, 0, 0.22, 0.31, h, MAT.shard); return h; }
const capHat = makeCapHat(); hero.hatSlot.add(capHat); const crownM = makeCrown(); crownM.position.y = 0.45; capHat.add(crownM);
const rod = new THREE.Group(); hero.aR.add(rod); rod.position.set(0, -0.66, 0.1); { const s = box(0.06, 0.06, 2.4, '#8a5a2b', 0, 0, 1.1, rod); s.rotation.x = -0.6; }
const sandwich = new THREE.Group(); { box(0.4, 0.08, 0.3, '#e6b06a', 0, 0, 0, sandwich); box(0.42, 0.05, 0.32, '#3cc26a', 0, 0.06, 0, sandwich); box(0.4, 0.08, 0.3, '#e6b06a', 0, 0.12, 0, sandwich); }
function heroWorldHand() { hero.root.updateMatrixWorld(true); const v = new THREE.Vector3(0, -0.75, 0.25); hero.aR.localToWorld(v); return v; }
function lineBetween(mesh, a, b) { const mid = a.clone().add(b).multiplyScalar(0.5), d = b.clone().sub(a); mesh.position.copy(mid); mesh.scale.set(1, d.length(), 1); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }

// ================================================================ LAKE (intro + boat build + launch)
const lake = (() => {
  const g = mk('lake'), st = new VSet(g), r = rng(71);
  const hf = (x, z) => { const d = Math.hypot(x, z); return Math.round((vnoise(x / 10, z / 10, 12) * 7 - 1) * ss((d - 22) / 14)); };
  for (let x = -50; x <= 50; x++) for (let z = -50; z <= 50; z++) {
    const d = Math.hypot(x * 0.8, z); if (d < 10.5) { st.add(x, 0, z, 'water'); st.add(x, -1, z, 'soil'); st.add(x, -2, z, 'soil'); continue; }
    const h = hf(x, z); st.add(x, h, z, d < 12 ? 'sand' : 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil'); }
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) if ((Math.abs(x) === 4 || Math.abs(z) === 4) && (x + z) % 2 === 0 && r() < 0.6) st.add(x, 1, z, 'castle');
  st.add(-2, 1, -2, 'skin'); st.add(-1, 1, -2, 'navy');
  const trees = []; for (let i = 0; i < 150; i++) { const x = Math.round((r() - .5) * 96), z = Math.round((r() - .5) * 96); if (Math.hypot(x, z) < 22 || (x > 8 && Math.abs(z) < 16) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const boat = buildBoat(g, true); boat.chain.visible = false;
  const bloop = mkBurble('#e0577b'); g.add(bloop.B.root); hardHat(bloop.B); box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root); L.light.intensity = 2;
  burst(E.splashIn, [5, 0.6, 0], { n: 160, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 8, size: 0.25, life: 1.5, grav: 14, hemi: 1, up: 6 });
  burst(E.hat, [13, 2.6, 3], { n: 30, colors: ['#ffd23f', '#5ff7ff', '#ffffff'], speed: 3, size: 0.12, life: 1, grav: 3 });
  burst(E.sail, [16, 8, 0], { n: 40, colors: ['#ff4d6d', '#ffffff'], speed: 4, size: 0.15, life: 1, grav: 3 });
  function boatPose(t) {
    let x = 16, y = 1.0, rx = 0, rz = 0;
    if (t >= E.push) { const k = seg(t, E.launch, E.splashIn); x = lerp(16, 4.5, k * k); y = lerp(1.0, -0.2, ss(seg(t, E.splashIn - 0.8, E.splashIn + 0.3))); rz = -0.2 * Math.sin(Math.min(1, k) * Math.PI); if (t < E.launch) x = 16 - Math.sin(t * 30) * 0.03; }
    if (t > E.splashIn) { y = -0.2 + Math.sin(t * 1.4) * 0.08 - 0.5 * Math.exp(-(t - E.splashIn) * 2) * Math.cos((t - E.splashIn) * 8); rx = Math.sin(t * 1.1) * 0.03; x = 4.5 - (t > 70.4 ? (t - 70.4) * 0.4 : 0); }
    boat.G.position.set(x, y, 0); boat.G.rotation.set(rx, -Math.PI / 2, rz);
  }
  function update(t) {
    boat.vs.update(t); boatPose(t);
    boat.sail.visible = t >= E.sail; if (boat.sail.visible) boat.sail.scale.set(1, Math.max(0.01, backOut(seg(t, E.sail, E.sail + 0.5))), 1);
    boat.cannon.visible = t >= E.cannon; boat.cannon.scale.setScalar(Math.max(0.01, backOut(seg(t, E.cannon, E.cannon + 0.4))));
    boat.anchor.visible = t >= E.anchor; boat.anchor.scale.setScalar(Math.max(0.01, backOut(seg(t, E.anchor, E.anchor + 0.4))));
    capHat.visible = t >= E.hat; if (capHat.visible) capHat.scale.setScalar(Math.max(0.01, backOut(seg(t, E.hat, E.hat + 0.4)))); crownM.visible = false; rod.visible = false;
    const o = { t, mallet: false };
    if (t < E.aboard) {
      parentTo(hero.root, g);
      const K = [[0, 13, 0.5, 4], [19.8, 13, 0.5, 4], [E.buildA, 12.5, 0.5, 4.5]];
      if (t < E.buildA) { const w = walker(t, K, -Math.PI / 2); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: t > 19.8 ? 'smug' : 'normal', hips: win(t, 9.6, 14.4) }); }
      else if (t < E.buildB) { const a = t * 2.4; Object.assign(o, { p: [16 + Math.sin(a) * 6.2, 0.5, Math.cos(a) * 3.8], yaw: a + Math.PI / 2, walk: 1.2, phase: t * 14, block: 'plank', hold: true }); }
      else if (t < E.push) Object.assign(o, { p: [12.5, 0.5, 4.2], yaw: -Math.PI / 2 + 0.6, face: 'smug', hips: t > E.hat + 0.5, wave: win(t, E.hat, E.hat + 0.6) });
      else if (t < E.splashIn) { const k = seg(t, E.launch, E.splashIn); Object.assign(o, { p: [lerp(18.6, 9, k * k), 0.5, 0.6], yaw: -Math.PI / 2, lean: 0.4, walk: 1, phase: t * 20, face: 'scared' }); hero.aL && 0; }
      else Object.assign(o, { p: [10, 0.5, 0.6], yaw: -Math.PI / 2, face: 'smug', wave: true });
      pose(hero, o); if (win(t, E.push, E.splashIn)) { hero.aL.rotation.set(-1.5, 0, 0); hero.aR.rotation.set(-1.5, 0, 0); }
    } else {
      parentTo(hero.root, boat.G);
      Object.assign(o, { p: [0, 1.5, 3.0], yaw: 0, face: 'smug', wave: win(t, 75.6, 79), hips: win(t, 70.4, 75.6) });
      pose(hero, o);
    }
    // bloop
    let bp, byaw = 0, bo = {};
    if (t < E.buildA) { bp = [11.5, 0.5, 5.6]; byaw = -Math.PI / 2; }
    else if (t < E.buildB) { const a = t * 3.1 + 2; bp = [16 + Math.sin(a) * 5, 0.5 + Math.abs(Math.sin(t * 9)) * 2.4, Math.cos(a) * 3]; byaw = a + Math.PI / 2; bo = { walk: 1, phase: t * 30 }; }
    else if (t < E.splashIn) { bp = t < E.push ? [12, 0.5, -3.5] : [lerp(18.6, 9, seg(t, E.launch, E.splashIn) ** 2), 0.5, -0.6]; byaw = -Math.PI / 2; }
    else bp = null;
    if (bp) { parentTo(bloop.B.root, g); poseBurble(bloop, t, bp, byaw, bo); if (win(t, E.push, E.splashIn)) { bloop.B.aL.rotation.set(-1.5, 0, 0); bloop.B.aR.rotation.set(-1.5, 0, 0); } }
    else { parentTo(bloop.B.root, boat.G); poseBurble(bloop, t, [0, 1.5, -1.2], 0, {}); }
    // leggy swims
    const la = t * 0.35; L.root.visible = true; poseLurk(L, t, [Math.sin(la) * 6, -0.7, Math.cos(la) * 6], la + Math.PI / 2, 1.0);
    if (t > E.aboard) { const bpos = boat.G.position; poseLurk(L, t, [bpos.x - 1.5, -0.7, 4.2], -Math.PI / 2, 1.2); }
    const C = [[0, 26, 12, 22, 0, 0, 0, 55], [5.3, 18, 8, 16, 0, 0, 0, 55], [5.4, -8, 6, 14, 0, 0, 0, 55], [9.5, 8, 6, 14, 0, 0, 0, 55],
      [9.6, 4, 2.2, 10, 0, 0, 2, 50], [14.5, 3, 2.2, 10, 1, 0, 2, 50], [14.6, 14, 2.2, 9, 11.5, 1.6, 5.6, 46], [19.7, 14, 2.2, 8.6, 11.5, 1.6, 5.6, 44],
      [19.8, 10, 2.2, 8, 13, 1.6, 4, 48], [E.buildA - 0.1, 9, 2.6, 8.5, 13, 1.6, 4, 52],
      [E.buildA, 30, 10, 16, 16, 2, 0, 50], [E.buildB - 0.1, 2, 9, 14, 16, 3, 0, 50],
      [E.buildB, 9.8, 2.4, 7.8, 12.5, 2.2, 4.2, 45], [52.9, 9.8, 2.4, 7.4, 12.5, 2.2, 4.2, 42],
      [53, 22, 4, 10, 14, 2, 0, 55], [E.launch, 22, 4, 9, 13, 2, 0, 55], [E.splashIn, 14, 5, 12, 5, 1, 0, 58], [64.5, 12, 4, 12, 5, 1.5, 0, 55],
      [64.6, 4.5, 4.5, -8, 4.5, 2, 2, 52], [70.3, 3.5, 4.5, -8.5, 4, 2, 0, 52], [70.4, 14, 9, 14, 2, 1, 0, 55], [80, -10, 8, 20, -2, 1, 0, 55]];
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ================================================================ SEA (sailing, fishing, storm, island, the fish)
const sea = (() => {
  const g = mk('sea');
  const OG = new THREE.PlaneGeometry(500, 500, 140, 140); OG.rotateX(-Math.PI / 2);
  const wtex = TX2.water.clone(); wtex.wrapS = wtex.wrapT = THREE.RepeatWrapping; wtex.repeat.set(150, 150); wtex.needsUpdate = true;
  const ocean = new THREE.Mesh(OG, new THREE.MeshLambertMaterial({ map: wtex, transparent: true, opacity: 0.9, emissive: '#123c78', emissiveIntensity: 0.3, flatShading: true })); ocean.receiveShadow = true; g.add(ocean);
  const base = OG.attributes.position.array.slice();
  const amp = t => lerp(0.22, 1.6, ss(seg(t, E.storm + 4, E.stormFull + 2))) * (1 - ss(seg(t, E.stormEnd - 2, E.island))) + (t >= E.island ? 0.15 : 0) * 0 ;
  const waveH = (x, z, t) => { const a = amp(t); return a * (Math.sin(x * 0.16 + t * 1.3) + 0.7 * Math.sin(z * 0.21 - t * 1.1) + 0.4 * Math.sin((x + z) * 0.37 + t * 2.1)); };
  // far islands
  const far = new VSet(g); const r = rng(81);
  for (const [cx, cz, R] of [[-120, -160, 10], [150, -120, 8], [200, 90, 12], [-170, 120, 9]]) for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) { const d = Math.hypot(x, z); if (d > R) continue; const h = Math.round((1 - d / R) * 7); for (let y = 0; y <= h; y++) far.add(cx + x, y, cz + z, y === h ? 'turf' : 'stone'); }
  far.build();
  const boat = buildBoat(g, false);
  // lightning destroys the top of the mast
  for (const b of boat.blocks) if (b.x === 0 && b.z === 1 && b.y >= 7) { b.t1 = E.bolt + 0.05; b.fly = [(r() - .5) * 6, 8 + r() * 6, -4 - r() * 4]; b.spin = [r() * 9, r() * 9, r() * 9]; b.floor = -60; }
  boat.vs.meshes.forEach(m => m.userData.arr.forEach(b => { if (b.t1 === undefined) b.sink = [E.boatSink, E.boatSink + 4.4, 14, 0]; }));
  const bloop = mkBurble('#e0577b'); hardHat(bloop.B); const paper = box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root); L.light.intensity = 3;
  const gulp = makeGulp(); g.add(gulp.root);
  const birds = [0, 1, 2].map(i => { const b = makeBird(['#ff7fb6', '#ff9ecb', '#ff5c9a'][i]); g.add(b.root); return b; });
  const jelly = makeGrumble(0.6); g.add(jelly.root);
  const line = box(0.03, 1, 0.03, '#eeeeee', 0, 0, 0, g); const bobber = box(0.18, 0.18, 0.18, '#ff3d3d', 0, 0, 0, g);
  g.add(sandwich);
  const ball = box(0.4, 0.4, 0.4, '#222', 0, 0, 0, g);
  const bolt = new THREE.Group(); g.add(bolt); { let p = new THREE.Vector3(0, 60, 1); const bm = new THREE.MeshBasicMaterial({ color: '#ffffff' }); for (let i = 0; i < 9; i++) { const q = new THREE.Vector3((r() - .5) * 4, 60 - (i + 1) * 5.6, 1 + (r() - .5) * 3); if (i === 8) q.set(0, 10, 1); const m = new THREE.Mesh(GEO, bm); lineBetween(m, p, q); m.scale.x = m.scale.z = 0.35; bolt.add(m); p = q; } }
  const boltL = new THREE.PointLight('#cfe0ff', 0, 80, 1.2); boltL.position.set(0, 14, 1); g.add(boltL);
  // rain
  const RN = 1400; const rain = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 1.1, 0.04), new THREE.MeshBasicMaterial({ color: '#b8c8e8', transparent: true, opacity: 0.6 }), RN); rain.frustumCulled = false; g.add(rain);
  const rr = Array.from({ length: RN }, (_, i) => [hash2(i, 1, 3), hash2(i, 2, 3), hash2(i, 3, 3)]);
  // bursts
  burst(E.jelly - 0.2, [0, 0.4, 9], { n: 50, colors: ['#bfe8ff', '#5aa8ff', '#7cff6b'], speed: 5, size: 0.2, life: 1.2, grav: 12, hemi: 1, up: 4 });
  burst(E.jellyOff + 0.6, [-3.5, 0.3, 1], { n: 40, colors: ['#bfe8ff', '#5aa8ff'], speed: 4, size: 0.18, life: 1, grav: 12, hemi: 1, up: 4 });
  burst(E.steal, [0.5, 2.6, 3.5], { n: 30, colors: ['#ff7fb6', '#ffffff', '#e6b06a'], speed: 3, size: 0.14, life: 1, grav: 3 });
  burst(E.bolt, [0, 10, 1], { n: 120, colors: ['#ffffff', '#cfe0ff', '#ffe066'], speed: 9, size: 0.2, life: 1.0, grav: 4 });
  burst(E.bolt + 0.05, [0, 7, 1.3], { n: 80, colors: ['#ff4d6d', '#ffffff', '#ff9a2a'], speed: 5, size: 0.3, life: 2, grav: 2, drag: 1 });
  burst(E.gulpUp + 1.0, [-14, 1, 12], { n: 200, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 9, size: 0.35, life: 2.0, grav: 12, hemi: 1, up: 8 });
  burst(E.cannonFire, [0, 2.6, 5], { n: 40, colors: ['#888', '#bbb', '#ffe066'], speed: 3, size: 0.4, life: 1.4, grav: -1, drag: 2 });
  burst(E.cannonFire + 0.7, [0, 0.4, 6.2], { n: 20, colors: ['#bfe8ff', '#ffffff'], speed: 2, size: 0.15, life: 0.8, grav: 10, hemi: 1 });
  burst(E.gulpDive + 1.5, [-14, 1, 12], { n: 200, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 9, size: 0.35, life: 2.0, grav: 12, hemi: 1, up: 8 });
  burst(E.crown, [2, 1.6, -3], { n: 60, colors: ['#5ff7ff', '#ffd23f', '#ffffff'], speed: 4, size: 0.15, life: 1.6, grav: 1 });
  burst(E.anchorDrop + 1.2, [-5.2, 0.3, 1.4], { n: 40, colors: ['#bfe8ff', '#5aa8ff'], speed: 4, size: 0.2, life: 1, grav: 12, hemi: 1, up: 4 });
  for (let k = 0; k < 10; k++) burst(E.dive + 0.5 + k * 0.5, [(k % 3 - 1) * 5, 0.5, (k % 4 - 1.5) * 4], { n: 70, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 7, size: 0.28, life: 1.4, grav: 12, hemi: 1, up: 6 });
  for (let k = 0; k < 6; k++) burst(E.boatSink + 0.4 + k * 0.7, [-8, 0.5, 2], { n: 40, colors: ['#bfe8ff', '#5aa8ff', '#e0a95a'], speed: 5, size: 0.25, life: 1.2, grav: 12, hemi: 1, up: 4 });
  const crownFly = makeCrown(); g.add(crownFly);
  function heroLocal(t) {
    const o = { t, mallet: false };
    if (t < E.island) {
      Object.assign(o, { p: [0, 1.5, 2.6], yaw: 0, face: 'smug' });
      if (t < E.cast) { o.hips = t > 86; o.headYaw = Math.sin(t * 0.8) * 0.5; }
      if (win(t, E.cast, E.jelly)) { o.yaw = 0; o.hold = true; o.face = t > E.bite ? 'scared' : 'smug'; if (t < E.cast + 0.6) o.swing = (t - E.cast) / 0.6; if (t > E.bite) o.lean = -0.25 + Math.sin(t * 20) * 0.05; }
      if (win(t, E.jelly, E.jellyOff + 0.6)) { o.panic = true; o.face = 'scared'; o.p = [Math.sin(t * 5) * 0.8, 1.5, 2.6 + Math.cos(t * 4) * 0.6]; o.walk = 1; o.phase = t * 16; o.yaw = t * 3; }
      if (win(t, E.sandwich, E.steal)) { o.hold = true; o.face = 'smug'; o.yaw = Math.PI * 0.85; }
      if (win(t, E.steal, E.birdsGone)) { o.panic = true; o.face = 'scared'; o.yaw = Math.PI / 2 + Math.sin(t * 2) * 0.4; o.headPitch = -0.5; }
      if (win(t, E.birdsGone, E.storm)) { o.sit = 1; o.face = 'soot'; o.yaw = Math.PI * 0.8; o.p = [0.5, 1.5, 2.2]; }
      if (t >= E.storm) { o.face = t > E.storm + 4 ? 'scared' : 'normal'; o.yaw = Math.PI; o.p = [0, 1.5, -1.2 + 2.6]; o.headPitch = -0.3; }
      if (t >= E.wave) { o.panic = win(t, E.wave, E.log2) || win(t, E.bolt, E.bolt + 4) || win(t, E.gulpUp, E.cannonFire - 1); o.p = [Math.sin(t * 1.7) * 0.6, 1.5, 2.2 + Math.sin(t * 1.3) * 0.5]; o.walk = 0.6; o.phase = t * 10; }
      if (win(t, E.cannonFire - 1, E.cannonFire + 1)) { o.p = [0.6, 1.5, 3.0]; o.yaw = 0; o.panic = false; o.swing = clamp((t - E.cannonFire + 1) / 1.0, 0, 0.99); }
      if (win(t, E.gulpDive, E.stormEnd)) { o.wave = true; o.face = 'smug'; o.panic = false; o.yaw = -0.6; }
      if (t > E.stormEnd) { o.sit = 1; o.face = 'soot'; o.panic = false; }
      return o;
    }
    // on the island (gulp local, TOP = 3.6)
    const T = gulp.TOP;
    if (t < E.chestFind) { const w = walker(t, [[E.island, 0, T, 5.5], [E.land, 0, T, 5.5], [E.land + 2.4, 0, T, 2], [208, 1, T, 3.5], [E.chestFind, 1, T, 2]], 0.4); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: t < E.land ? 'soot' : 'smug', sit: t < E.land ? 1 - seg(t, E.land - 0.6, E.land) : 0, wave: win(t, 202, 205) }; }
    if (t < E.dive + 1.2) { const w = walker(t, [[E.chestFind, 1, T, 2], [E.chestFind + 2.4, 2, T, -1.4], [E.anchorDrop - 3.2, 2, T, -1.4], [E.anchorDrop - 0.8, -2.8, T, 1.6]], Math.PI);
      const ob = { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'smug' };
      if (win(t, E.chestFind + 2.4, E.anchorDrop - 3.2)) { ob.yaw = Math.PI; ob.headPitch = t < E.crown ? 0.5 : 0; if (t > E.crown + 0.5) { ob.hips = true; ob.yaw = 0.2; } }
      if (win(t, E.anchorDrop - 0.8, E.warm)) { ob.yaw = -Math.PI / 2; ob.swing = clamp((t - E.anchorDrop + 0.4) / 0.8, 0, 0.99); }
      if (t >= E.warm) { ob.yaw = -Math.PI / 2 + Math.sin(t) * 0.5; ob.headPitch = 0.6; ob.face = 'normal'; }
      if (t >= E.eyeOpen) { ob.face = 'scared'; ob.yaw = 0; ob.headPitch = 0.3; }
      if (t >= 260.2) { ob.panic = true; ob.p = [ob.p[0] + Math.sin(t * 6) * 0.6, T, ob.p[2] + Math.cos(t * 5) * 0.6]; ob.walk = 1; ob.phase = t * 16; }
      return ob; }
    return null;
  }
  function update(t) {
    // ocean
    const P = OG.attributes.position.array;
    for (let i = 0; i < P.length; i += 3) { P[i + 1] = Math.round(waveH(base[i], base[i + 2], t) * 4) / 4; }
    OG.attributes.position.needsUpdate = true; OG.computeVertexNormals();
    wtex.offset.set(0, t < E.island ? -t * 0.05 : 0);
    const a = amp(t);
    // boat
    boat.vs.update(t);
    if (t < E.island) { const h = waveH(0, 0, t), hz = waveH(0, 4, t) - waveH(0, -4, t), hx = waveH(2, 0, t) - waveH(-2, 0, t);
      boat.G.position.set(0, -0.3 + h * 0.8, 0); boat.G.rotation.set(-hz * 0.12, 0, hx * 0.2 + (t > E.storm ? Math.sin(t * 1.9) * 0.12 * a : 0)); }
    else { boat.G.position.set(-8.5, -0.55, 2); boat.G.rotation.set(0.05, 0.4, 0.18);
      if (t > E.boatSink) { const k = seg(t, E.boatSink, E.boatSink + 4.4); boat.G.rotation.set(0.05 + 0.6 * k, 0.4, 0.18 + 0.3 * k); } }
    boat.sail.visible = t < E.bolt + 0.05 || t >= E.island + 999; boat.flag.visible = boat.sail.visible;
    if (t >= E.bolt && t < E.bolt + 3) { boat.sail.visible = true; const k = seg(t, E.bolt, E.bolt + 3); boat.sail.position.set(0, 7 + k * 6, 1.3 - k * 14); boat.sail.rotation.set(k * 5, k * 3, k * 2); boat.sail.scale.setScalar(1 - k * 0.6); } else { boat.sail.position.set(0, 7, 1.3); boat.sail.rotation.set(0, 0, 0); boat.sail.scale.setScalar(1); }
    // anchor
    boat.anchor.position.set(2.8, 2.2, -1); boat.chain.visible = false;
    if (t >= E.anchorDrop) { const k = seg(t, E.anchorDrop, E.anchorDrop + 1.4); boat.anchor.position.set(2.8 + k * 0.5, 2.2 - k * k * 9, -1); boat.chain.visible = true;
      lineBetween(boat.chain, new THREE.Vector3(2.4, 2.2, -1), boat.anchor.position.clone()); boat.chain.scale.x = boat.chain.scale.z = 1; }
    // gulp
    gulp.root.visible = t >= E.gulpUp - 0.5;
    let gEyes = 1, stalkUp = 1;
    if (t < E.island) { const up = ss(seg(t, E.gulpUp, E.gulpUp + 3)), down = ss(seg(t, E.gulpDive, E.gulpDive + 3));
      gulp.root.position.set(-14, lerp(-14, -2.2, up) - 14 * down, 14); gulp.root.rotation.set(0.25 * down, 2.4 + Math.sin(t * 0.5) * 0.08, 0); }
    else { gulp.root.position.set(0, -3.1, 0); gulp.root.rotation.set(0, 0, 0); gEyes = ss(seg(t, E.eyeOpen, E.eyeOpen + 0.6)); stalkUp = ss(seg(t, E.lantern, E.lantern + 1.5));
      const breathe = t > E.warm ? Math.sin(t * 1.5) * 0.12 : 0; gulp.root.position.y += breathe;
      if (t >= E.dive) { const k = seg(t, E.dive, E.dive + 6); gulp.root.rotation.x = 0.4 * ss(k * 2); gulp.root.position.y = -3.1 - 16 * k * k; gulp.root.position.z = 6 * k; } }
    gulp.eyes.forEach(e => { e.lid.scale.set(1, 1 - gEyes * 0.95, 1); e.lid.position.y = gEyes * 0.75; });
    gulp.stalk.scale.set(1, Math.max(0.01, stalkUp), 1); gulp.lampL.intensity = 30 * stalkUp;
    gulp.lidC.rotation.x = -1.8 * ss(seg(t, E.chestOpen, E.chestOpen + 0.6)); gulp.glow.visible = t > E.chestOpen && t < E.crown + 0.2;
    // characters
    const hl = heroLocal(t);
    if (t < E.island) { parentTo(hero.root, boat.G); parentTo(bloop.B.root, boat.G); }
    else if (t < E.offFish) { parentTo(hero.root, gulp.isl); parentTo(bloop.B.root, gulp.isl); }
    else { parentTo(hero.root, g); parentTo(bloop.B.root, g); }
    if (hl) { if (t >= E.island) hl.p = [hl.p[0], 0.6, hl.p[2]]; pose(hero, hl); }
    else { const fl = Math.sin(t * 1.4) * 0.12; pose(hero, { t, p: [3.2, 0.25 + fl, 7.2], yaw: 0.6, sit: 1, face: 'soot', panic: t < E.boatSink + 4.4 && t > E.boatSink, headYaw: t > E.boatSink ? -1.2 : 0 }); }
    capHat.visible = true; crownM.visible = t >= E.crown + 0.6;
    rod.visible = win(t, E.cast - 0.4, E.jelly + 0.3);
    // bloop
    let bp = [0, 1.5, -1.0], byaw = 0, bo = {};
    if (t < E.island) { if (win(t, E.jelly, E.jellyOff + 0.6)) { bp = [-1.2 + Math.sin(t * 4) * 0.5, 1.5, 1.4]; byaw = Math.PI / 2; bo.angry = false; bloop.B.aR.rotation.set(-2.5, 0, 0); }
      if (t >= E.wave) { bp = [Math.sin(t * 1.5 + 2) * 0.5, 1.5, -1.0]; bo = { hop: true }; }
      if (t > E.stormEnd) bo = {}; }
    else if (t < E.offFish) { bp = [-1.5, 0.6, 0.5]; byaw = 0.6; if (t > 260.2) bo = { hop: true }; }
    else { bp = [1.6, 0.0 + Math.sin(t * 1.4 + 1) * 0.12, 7.0]; byaw = 0.3; }
    poseBurble(bloop, t, bp, byaw, bo); paper.visible = t < E.island ? t < E.cast : t > E.invoice - 1;
    if (win(t, E.jellyOff - 1.0, E.jellyOff)) bloop.B.aR.rotation.set(-2.6, 0, 0);
    if (t > E.invoice) { bloop.B.aR.rotation.set(-1.0, 0, 0); bloop.B.aL.rotation.set(-1.2, 0, 0.5 + Math.sin(t * 20) * 0.2); }
    // leggy
    if (t < E.island) { parentTo(L.root, g); const bpos = boat.G.position; poseLurk(L, t, [4.2, -0.75 + bpos.y * 0.5, 1 + Math.sin(t * 0.7)], 0, 1.2); }
    else if (t < E.offFish) { parentTo(L.root, gulp.isl); poseLurk(L, t, t < E.chestFind ? [2.6, 0.6, -1.5] : [2.6, 0.6, -2.0], t < E.chestFind ? Math.PI * 1.3 : Math.PI, t < E.chestFind ? 0 : 0.4);
      if (t < E.chestFind) { L.body.position.y = 0.75; L.legs.forEach(l => l.rotation.x = 0.3); }
      if (win(t, E.chestFind, E.chestOpen)) { L.hd.rotation.x = 0.5 + Math.sin(t * 8) * 0.2; } }
    else { parentTo(L.root, g); poseLurk(L, t, [2.5, -0.65 + Math.sin(t * 1.4) * 0.12, 7.0], 0.3, 0.3); }
    // fishing line + jelly
    line.visible = bobber.visible = win(t, E.cast + 0.5, E.jelly);
    if (line.visible) { const hand = heroWorldHand(); g.worldToLocal(hand); hand.add(new THREE.Vector3(0, 1.0, 1.4)); const bob = new THREE.Vector3(0, 0.2 + (t > E.bite ? Math.sin(t * 25) * 0.2 - 0.2 : Math.sin(t * 2) * 0.05), 9); bobber.position.copy(bob); lineBetween(line, hand, bob); line.scale.x = line.scale.z = 1; }
    jelly.root.visible = win(t, E.jelly - 0.2, E.jellyOff + 0.8);
    if (jelly.root.visible) { if (t < E.jellyFace) { const k = seg(t, E.jelly - 0.2, E.jellyFace); jelly.root.position.set(lerp(0, hero.root.position.x, k), lerp(0.3, 3.0, k) + Math.sin(k * Math.PI) * 4, lerp(9, 2.6, k)); jelly.root.rotation.set(k * 8, 0, 0); }
      else if (t < E.jellyOff) { hero.root.updateMatrixWorld(true); const v = new THREE.Vector3(0, 1.75, 0.15); hero.root.localToWorld(v); g.worldToLocal(v); jelly.root.position.copy(v); jelly.root.rotation.set(0, hero.root.rotation.y + Math.PI, 0); jelly.body.scale.set(1.1 + Math.sin(t * 9) * 0.1, 0.9, 1.1); }
      else { const k = seg(t, E.jellyOff, E.jellyOff + 0.8); jelly.root.position.set(lerp(0, -3.5, k), 3 + Math.sin(k * Math.PI) * 2 - k * 2.7, lerp(2.6, 1, k)); jelly.root.rotation.set(k * 10, 0, k * 6); } }
    // sandwich + birds
    sandwich.visible = win(t, E.sandwich, E.birdsGone);
    if (sandwich.visible) { if (t < E.steal) { const v = heroWorldHand(); g.worldToLocal(v); sandwich.position.copy(v); } }
    birds.forEach((b, i) => { b.root.visible = win(t, E.sandwich + 1.0, E.birdsGone); if (!b.root.visible) return;
      const a = t * 1.3 + i * 2.1; let p = [Math.sin(a) * 6, 7 + Math.sin(t * 2 + i) * 0.6, Math.cos(a) * 6 + 2], yaw = a + Math.PI / 2;
      if (i === 0 && t > E.steal - 1.0) { const k = seg(t, E.steal - 1.0, E.steal), k2 = seg(t, E.steal, E.birdsGone); const hp = heroWorldHand(); g.worldToLocal(hp);
        p = t < E.steal ? [lerp(Math.sin(a) * 6, hp.x, k), lerp(7, hp.y + 0.3, k), lerp(Math.cos(a) * 6 + 2, hp.z, k)] : [hp.x + k2 * 40, hp.y + 0.3 + k2 * 18, hp.z + k2 * 10]; yaw = t < E.steal ? yawTo(p, [hp.x, p[1], hp.z]) : Math.PI / 2;
        if (t >= E.steal) sandwich.position.set(p[0], p[1] - 0.35, p[2]); }
      b.root.position.set(...p); b.root.rotation.set(0, yaw, 0); b.wL.rotation.z = Math.sin(t * 18 + i) * 0.7; b.wR.rotation.z = -Math.sin(t * 18 + i) * 0.7; });
    // cannonball plop
    ball.visible = win(t, E.cannonFire, E.cannonFire + 0.8); if (ball.visible) { const k = seg(t, E.cannonFire, E.cannonFire + 0.8); const v = new THREE.Vector3(0, 2.6, 4.6 + k * 1.2); boat.G.localToWorld(v); g.worldToLocal(v); ball.position.set(v.x, v.y - k * k * 3, v.z); }
    // lightning + rain
    bolt.visible = win(t, E.bolt - 0.1, E.bolt + 0.25) && Math.floor(t * 30) % 2 === 0; boltL.intensity = win(t, E.bolt - 0.1, E.bolt + 0.6) ? 2000 * (1 - seg(t, E.bolt - 0.1, E.bolt + 0.6)) : 0;
    const rainK = ss(seg(t, E.storm + 6, E.stormFull + 1)) * (1 - ss(seg(t, E.stormEnd - 3, E.stormEnd))); rain.visible = rainK > 0.02;
    if (rain.visible) { const c = camera.position; let n = 0; for (let i = 0; i < RN; i++) { if (rr[i][2] > rainK) continue; const x = c.x + (rr[i][0] - 0.5) * 50, z = c.z + (rr[i][1] - 0.5) * 50; const y = c.y + 15 - (((t * 26 + rr[i][2] * 60) % 30)); _m.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(0.25, 0, 0)), _s.set(1, 1, 1)); rain.setMatrixAt(n++, _m); } rain.count = n; rain.instanceMatrix.needsUpdate = true; }
    // crown flying out of chest
    crownFly.visible = win(t, E.crown, E.crown + 0.6); if (crownFly.visible) { const k = seg(t, E.crown, E.crown + 0.6); const v = new THREE.Vector3(2, 4.6 + Math.sin(k * Math.PI) * 2.2, -3); gulp.isl.localToWorld(v); g.worldToLocal(v); crownFly.position.copy(v); crownFly.rotation.y = t * 8; }
    return { cam: seaCam(t), hud: true, storm: t > E.storm && t < E.island };
  }
  function seaCam(t) {
    const C = [[80, 10, 6, -12, 0, 2, 0, 55], [86, -10, 5, -10, 0, 2, 2, 55], [86.1, 3.5, 3.0, 7.5, 0, 2.2, 2.6, 46], [91.5, 3.0, 3.0, 7.2, 0, 2.2, 2.6, 46],
      [91.6, -3, 3.6, -1, 0, 1.5, 9, 55], [E.bite - 0.1, -2.5, 3.6, -0.5, 0, 1.5, 9, 55], [E.bite, 2.4, 3, 0.5, 0, 1, 9, 50], [E.jelly + 0.4, 3, 3.5, 0.5, 0, 2.5, 5, 55],
      [E.jelly + 0.5, 1.6, 3.0, 5.8, 0, 2.6, 2.6, 46], [E.sandwich - 0.1, 2.0, 3.2, 6.2, 0, 2.4, 2.4, 50],
      [E.sandwich, 2.4, 2.8, 0.2, 0, 2.2, 2.4, 46], [E.steal - 0.1, 2.0, 2.8, 0.6, 0, 2.2, 2.4, 44], [E.steal, 6, 4, -4, 4, 4, 4, 58], [118.9, 4, 4, -6, 18, 9, 6, 60],
      [119.0, 2.6, 2.4, 5.6, 0, 2.2, 2.6, 46], [E.storm - 0.1, 2.0, 2.6, 5.0, 0.5, 2.0, 2.2, 44],
      [E.storm, 14, 7, 14, 0, 4, 0, 55], [E.wave - 0.1, 16, 6, 10, 0, 4, 0, 55], [E.wave, -6, 4, 9, 0, 2, 0, 62], [E.log2 - 0.1, 6, 4, 9, 0, 2, 0, 62],
      [E.log2, 3, 3, 6.5, 0, 2.3, 2.2, 48], [E.bolt - 0.4, 3, 3, 6.5, 0, 2.3, 2.2, 48], [E.bolt - 0.3, 12, 6, 12, 0, 8, 0, 60], [157, 14, 5, 10, 0, 5, 0, 60],
      [157.1, 2, 3, 6, 0, 2.3, 2.2, 48], [E.gulpUp - 0.1, 2, 3, 6, 0, 2.3, 2.2, 48], [E.gulpUp, 6, 3, -4, -14, 3, 14, 60], [165.3, 4, 3.5, -3, -14, 4, 14, 52],
      [165.4, 3, 3.6, -1, -0.5, 2, 6, 55], [171.3, 3, 3.6, -1, -0.5, 2, 6, 55], [171.4, 0.6, 3.6, 0.2, 0.3, 2.2, 6, 50], [E.gulpDive - 0.1, 0.8, 3.6, 0.6, -10, 3, 13, 55],
      [E.gulpDive, 10, 5, -6, -10, 2, 10, 55], [182.3, 10, 5, -8, -10, 0, 10, 55], [182.4, 0, 14, 22, 0, 2, 0, 55], [E.island, 0, 20, 30, 0, 2, 0, 50]];
    if (t < E.island) { const c = camKeys(t, C); const bp = boat.G.position; if (t > E.storm) c.p[1] += bp.y * 0.5; return c; }
    const D = [[E.island, -12, 5, 12, 0, 0.5, 3, 55], [E.land - 0.1, -10, 4.5, 14, 0, 0.5, 4, 55], [E.land, 14, 6, 14, 0, 1, 0, 55], [201.9, 16, 8, 6, 0, 1, 0, 55],
      [202, 3, 2.5, 7, 0, 1.4, 3, 50], [207.9, 2.5, 2.6, 6.6, 0, 1.4, 2.6, 46], [208, -4, 3, 7, -8.5, 1, 2, 50], [213.9, -3, 3.5, 6, -8.5, 1.5, 2, 50],
      [214, 5.5, 2.4, 0.5, 2, 1.0, -2.5, 46], [E.crown - 0.1, 4.6, 2.2, -0.6, 2, 1.2, -3, 42], [E.crown, 4, 2.5, 2.6, 2, 2.0, -1.4, 46], [230.3, 3.5, 2.5, 2.2, 2, 2.0, -1.4, 44],
      [230.4, 8, 5, 12, 0, 1, 0, 55], [241.5, -8, 5, 13, 0, 1, 0, 55], [241.6, -1, 3, 6, -5, 0.5, 1, 52], [E.warm - 0.1, -1, 3, 6, -5, -1, 1, 52],
      [E.warm, 1.0, 2.4, 4.4, -2.8, 1.4, 1.6, 46], [E.eyeOpen - 0.1, 0.8, 2.4, 4.0, -2.8, 1.4, 1.6, 44], [E.eyeOpen, 8.5, 0.8, 9.5, 4.6, -0.2, 6.6, 42], [E.lantern + 0.6, 8.0, 0.8, 9.0, 4.6, -0.1, 6.6, 36],
      [260.1, 0, 6, 18, 0, 3, 4, 60], [260.2, 0, 4, 16, 0, 2, 0, 58], [E.dive - 0.1, 0, 4, 16, 0, 1, 0, 58], [E.dive, 6, 6, 22, 0, -1, 4, 60], [E.offFish - 0.1, 8, 7, 24, 0, -2, 6, 60],
      [E.offFish, 6, 2.0, 13, 2.4, 0.6, 7, 50], [E.boatSink - 0.1, 6, 2.0, 13, 2.4, 0.6, 7, 50], [E.boatSink, -2, 3, 12, -8, 0, 2, 52], [276.9, -2, 3, 12, -8, -2, 2, 52],
      [277, 6.4, 1.8, 12.6, 2.4, 0.6, 7.2, 46], [E.logo, 6.0, 1.8, 12.2, 2.4, 0.6, 7.2, 44]];
    return camKeys(t, D);
  }
  return { g, update };
})();
