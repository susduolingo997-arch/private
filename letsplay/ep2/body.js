// ================================================================ EPISODE 2: "I REBUILD THE HOUSE (it goes worse)"
function camKeys(t, C) {
  if (t <= C[0][0]) return { p: C[0].slice(1, 4), l: C[0].slice(4, 7), fov: C[0][7] };
  for (let i = 0; i < C.length - 1; i++) { const a = C[i], b = C[i + 1]; if (t < b[0] && b[0] - a[0] > 1e-3) { const u = ss((t - a[0]) / (b[0] - a[0])); const L = j => lerp(a[j], b[j], u); return { p: [L(1), L(2), L(3)], l: [L(4), L(5), L(6)], fov: L(7) }; } }
  const z = C[C.length - 1]; return { p: z.slice(1, 4), l: z.slice(4, 7), fov: z[7] };
}
const TX2 = {
  water: ctex(16, (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = ['rgba(52,130,225,0.82)', 'rgba(64,150,240,0.82)', 'rgba(44,115,210,0.82)'][Math.floor(r() * 3)]; g.fillRect(x, y, 1, 1); } g.fillStyle = 'rgba(200,240,255,0.8)'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 12), Math.floor(r() * 15), 4, 1); }, 31),
  skin: ctex(16, noisy(['#f2c79b', '#e8bc8f', '#f6d0a8']), 32), hoodie: ctex(16, noisy(['#ff8a2a', '#f07c1f', '#ff9a44']), 33),
  hair: ctex(16, noisy(['#5a3a22', '#4e321d', '#664429']), 34), navy: ctex(16, noisy(['#2b3a67', '#25335c', '#324273']), 35),
};
MAT.water = lam(TX2.water, { transparent: true, depthWrite: false, emissive: '#1a4f9a', emissiveIntensity: 0.35 });
MAT.skin = lam(TX2.skin); MAT.hoodie = lam(TX2.hoodie); MAT.hair = lam(TX2.hair); MAT.navy = lam(TX2.navy);
MAT.shard = new THREE.MeshBasicMaterial({ color: '#5ff7ff' });
MAT.flower = new THREE.MeshLambertMaterial({ color: '#ff6fb8', emissive: '#ff3d9a', emissiveIntensity: 0.4 });
const burbleAngry = faceMat('#c8e6a0', g => { g.fillStyle = '#fff'; g.fillRect(8, 9, 16, 11); g.fillStyle = '#1a1a40'; g.fillRect(13, 12, 7, 7); g.fillStyle = '#3a5a1a'; for (let i = 0; i < 9; i++) { g.fillRect(6 + i, 3 + (i >> 1), 2, 3); g.fillRect(25 - i, 3 + (i >> 1), 2, 3); } g.fillStyle = '#5a7a3a'; g.fillRect(11, 27, 10, 2); g.fillRect(9, 25, 2, 2); g.fillRect(21, 25, 2, 2); });
function hardHat(B) { const h = new THREE.Group(); h.position.y = 1.2; B.hd.add(h); box(0.82, 0.32, 0.82, '#ffd400', 0, 0.12, 0, h); box(1.04, 0.07, 1.04, '#ffcc00', 0, -0.04, 0, h); box(0.14, 0.1, 0.84, '#e0a800', 0, 0.3, 0, h); return h; }
function poseBurble(b, t, p, yaw, o = {}) {
  b.B.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.5 : Math.abs(Math.sin(t * 3 + (o.seed || 0))) * 0.04), p[2]); b.B.root.rotation.set(0, yaw, 0);
  b.B.aL.rotation.set(0, 0, -0.1); b.B.aR.rotation.set(0, 0, 0.1); b.B.hd.rotation.set(0, Math.sin(t * 1.3 + (o.seed || 0)) * 0.25, 0);
  if (o.walk) { const s = Math.sin(o.phase || t * 8) * 0.5; b.B.aL.rotation.x = s; b.B.aR.rotation.x = -s; b.B.root.position.y += Math.abs(Math.cos(o.phase || t * 8)) * 0.08; }
  if (o.angry) { b.B.aL.rotation.set(-2.6 + Math.sin(t * 14 + (o.seed || 0)) * 0.4, 0, 0); b.B.aR.rotation.set(-2.6 + Math.cos(t * 14 + (o.seed || 0)) * 0.4, 0, 0); }
  if (o.facepalm) { b.B.aR.rotation.set(-2.3, 0, 0.75); b.B.hd.rotation.set(0.35, 0, Math.sin(t * 2) * 0.1); }
  if (o.handOut) b.B.aR.rotation.set(-1.4, 0, 0);
  b.B.hd.children[0].material = o.angry ? burbleAngry : b.calm;
}
function mkBurble(col) { const B = makeBurble(col); return { B, calm: B.hd.children[0].material }; }
// VSet extension: static rotation + sinking
const _upd = VSet.prototype.update;
VSet.prototype.update = function (t) {
  if (!this.dyn) return;
  _upd.call(this, t);
  for (const m of this.meshes) {
    const arr = m.userData.arr; let touched = false;
    for (let i = 0; i < arr.length; i++) {
      const b = arr[i]; if (!b.rot && !b.sink) continue; if (b.t0 !== undefined && t < b.t0) continue; if (b.t1 !== undefined && t >= b.t1) continue;
      m.getMatrixAt(i, _m); _m.decompose(_p, _q, _s);
      if (b.rot && !(b.t1 !== undefined && t >= b.t1 && b.fly)) _q.setFromEuler(_e.set(...b.rot));
      if (b.sink && t > b.sink[0]) { const k = seg(t, b.sink[0], b.sink[1]); _p.y -= b.sink[2] * k * k; _p.x += (b.sink[3] || 0) * k * k * b.y * 0.1; }
      _m.compose(_p, _q, _s); m.setMatrixAt(i, _m); touched = true;
    }
    if (touched) m.instanceMatrix.needsUpdate = true;
  }
};

// ================================================================ HOMESTEAD (recap, build, dusk, ending)
const home = (() => {
  const g = mk('home'), st = new VSet(g), dy = new VSet(g, true), r = rng(41);
  const hf = (x, z) => { const d = Math.hypot(x, z); return Math.round((vnoise(x / 10, z / 10, 12) * 7 - 1) * ss((d - 18) / 14)); };
  const ring = (x, z) => { const m = Math.max(Math.abs(x), Math.abs(z)); return m >= 6 && m <= 7; };
  const foot = (x, z) => Math.abs(x) <= 5 && Math.abs(z) <= 5;
  const bridge = (x, z) => Math.abs(x) <= 1 && z >= 6 && z <= 7;
  const ringCells = [];
  for (let x = -50; x <= 50; x++) for (let z = -50; z <= 50; z++) {
    if (ring(x, z)) { ringCells.push([x, z]); continue; }
    if (foot(x, z)) { dy.add(x, 0, z, 'turf', { t1: E.sink + 0.3 }); dy.add(x, 0, z, 'water', { t0: E.sink + 0.8 }); st.add(x, -1, z, 'soil'); continue; }
    const h = hf(x, z); st.add(x, h, z, 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil');
  }
  ringCells.sort((a, b) => Math.atan2(a[0], a[1]) - Math.atan2(b[0], b[1]));
  ringCells.forEach(([x, z], i) => { const tm = E.moat + 0.2 + i * (E.moatEnd - E.moat - 0.4) / ringCells.length; st.add(x, -1, z, 'soil');
    dy.add(x, 0, z, 'turf', { t1: tm }); dy.add(x, 0, z, 'water', bridge(x, z) ? { t0: tm, t1: E.bridge + 0.6 + (z - 6) * 0.4 } : { t0: tm });
    if (bridge(x, z)) dy.add(x, 0, z, 'plank', { t0: E.bridge + 0.6 + (z - 6) * 0.4 }); });
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 96), z = Math.round((r() - .5) * 96); const d = Math.hypot(x, z); if (d < 18 || (Math.abs(x) < 13 && z > 12 && z < 44) || (x < -8 && x > -40 && z > 12 && z < 36) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  // rubble from episode 1
  const rtypes = ['plank', 'slate', 'castle', 'glass', 'buzz', 'jam', 'jade', 'polka', 'log', 'leaf'];
  for (let i = 0; i < 110; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 5.2; const x = Math.round(Math.sin(a) * d), z = Math.round(Math.cos(a) * d); const y = 1 + (d < 3 && r() < 0.6 ? 1 : 0) + (d < 1.5 && r() < 0.4 ? 1 : 0);
    dy.add(x + (r() - .5) * 0.4, y - 0.15 + r() * 0.2, z + (r() - .5) * 0.4, rtypes[i % rtypes.length], { rot: [(r() - .5) * 0.8, r() * 3, (r() - .5) * 0.8], t1: E.clear + 0.4 + i * 0.033, fly: [(r() - .5) * 4, 12 + r() * 8, (r() - .5) * 4], spin: [r() * 8, r() * 8, r() * 8], floor: -50 }); }
  for (let y = 1; y <= 8; y++) dy.add(5, y, 0, rtypes[(y * 3) % rtypes.length], { t1: E.clear + 4 + y * 0.03, fly: [2, 14 + y, 0], spin: [3, 4, 5], floor: -50 });
  // the fortress (Bloop builds it)
  const plan = [];
  for (let y = 1; y <= 4; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) { if (Math.abs(x) !== 4 && Math.abs(z) !== 4) continue; if (z === 4 && Math.abs(x) <= 1 && y <= 3) continue;
    const win = y === 3 && ((Math.abs(x) === 4 && Math.abs(z) === 2) || (z === -4 && Math.abs(x) === 2) || (z === 4 && Math.abs(x) === 3)); plan.push([x, y, z, win ? 'glass' : (Math.abs(x) === 4 && Math.abs(z) === 4 ? 'stone' : 'castle')]); }
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) plan.push([x, 5, z, 'stone']);
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) if ((Math.abs(x) === 4 || Math.abs(z) === 4) && (x + z) % 2 === 0) plan.push([x, 6, z, 'castle']);
  plan.forEach(([x, y, z, ty], i) => dy.add(x, y, z, ty, { t0: E.fortA + i * (E.fortB - E.fortA) / plan.length, wob: [E.creak, E.sink], sink: [E.sink, E.sinkEnd, 9, 0.25] }));
  // the statue of me
  const stat = [[-2, 6, -2, 'navy'], [-1, 6, -2, 'navy'], [-2, 7, -2, 'hoodie'], [-1, 7, -2, 'hoodie'], [-2, 8, -2, 'hoodie'], [-1, 8, -2, 'hoodie'], [-3, 8, -2, 'hoodie'], [0, 8, -2, 'hoodie']];
  for (let x = -3; x <= 0; x++) for (let y = 9; y <= 11; y++) for (let z = -3; z <= -1; z++) { if (x === 0) continue; const front = z === -1; const eye = front && y === 10 && (x === -3 || x === -1); stat.push([x, y, z, eye ? 'navy' : 'skin']); }
  for (let x = -3; x <= -1; x++) for (let z = -3; z <= -1; z++) stat.push([x, 12, z, 'hair']);
  stat.forEach(([x, y, z, ty], i) => { const o = { t0: E.statue + 0.2 + i * (E.statueEnd - E.statue - 0.4) / stat.length, sink: [E.sink, E.sinkEnd, 9, 0.25], wob: [E.creak, E.sink] };
    if (y >= 9) { o.t1 = E.statueBoom + r() * 0.05; o.fly = [(x + 2) * 4 + (r() - .5) * 4, 6 + r() * 8, (z + 2) * 4 + (r() - .5) * 4]; o.spin = [r() * 10, r() * 10, r() * 10]; o.floor = -50; }
    dy.add(x, y, z, ty, o); });
  st.build(); dy.build();
  // giant door lying on the ground (from episode 1)
  const door = new THREE.Group(); door.position.set(0, 0.75, 3.75); door.rotation.x = Math.PI / 2; g.add(door);
  const dtex = TX.plank.clone(); dtex.wrapS = dtex.wrapT = THREE.RepeatWrapping; dtex.repeat.set(5, 9); dtex.needsUpdate = true;
  const dp = new THREE.Mesh(new THREE.BoxGeometry(5, 9, 0.5), new THREE.MeshLambertMaterial({ map: dtex, color: '#ff9c7a' })); dp.position.set(0, 4.5, 0); dp.receiveShadow = true; door.add(dp);
  box(5.4, 0.4, 0.6, '#8a3b2a', 0, 9.1, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', -2.7, 4.5, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', 2.7, 4.5, 0, door); box(0.5, 0.5, 0.3, '#ffd23f', 1.8, 4.2, 0.35, door);
  // trampoline
  const tramp = new THREE.Group(); tramp.position.set(0, 0.5, 10.5); g.add(tramp);
  box(2.8, 0.25, 2.8, '#333a55', 0, 0.35, 0, tramp); for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) box(0.2, 0.4, 0.2, '#555', x, 0.15, z, tramp);
  const pad = box(2.4, 0.1, 2.4, 0, 0, 0.5, 0, tramp, new THREE.MeshLambertMaterial({ color: '#b6ff3b', emissive: '#5a9a00', emissiveIntensity: 0.4 }));
  // campfire
  const fire = new THREE.Group(); fire.position.set(-3.5, 0.5, 11.2); g.add(fire);
  box(1.2, 0.2, 0.25, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; box(1.2, 0.2, 0.25, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = -0.6;
  const flames = [0, 1, 2, 3, 4].map(i => box(0.3, 0.3, 0.3, 0, (i - 2) * 0.12, 0.35, ((i * 7) % 3 - 1) * 0.12, fire, new THREE.MeshBasicMaterial({ color: ['#ffdf3c', '#ff9a2a', '#ff5a1a'][i % 3] })));
  const fireL = new THREE.PointLight('#ff9a4a', 0, 14, 1.4); fireL.position.set(0, 1.2, 0); fire.add(fireL);
  // characters
  const bloop = mkBurble('#e0577b'); g.add(bloop.B.root); hardHat(bloop.B);
  const invoice = box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root);
  const bombObj = new THREE.Group(); g.add(bombObj); box(0.36, 0.36, 0.36, 0, 0, 0, 0, bombObj, new THREE.MeshLambertMaterial({ color: '#ff3d7f', emissive: '#ff2266', emissiveIntensity: 0.6 })); box(0.16, 0.08, 0.16, '#3cc26a', 0, 0.21, 0, bombObj);
  const shardObj = box(0.25, 0.5, 0.25, 0, 0, 0, 0, g, MAT.shard);
  const packGlow = box(0.2, 0.3, 0.06, 0, 0, 1.2, -0.45, hero.body, MAT.shard);
  const boomL = new THREE.PointLight('#ffb050', 0, 30, 1.4); boomL.position.set(-2, 10, -2); g.add(boomL);
  // bursts
  burst(E.statueBoom, [-2, 10, -2], { n: 200, colors: ['#ffef7a', '#ff9a3c', '#ff3d7f', '#ffffff'], speed: 12, size: 0.4, life: 1.4, grav: 2, drag: 2.4 });
  burst(E.statueBoom + 0.1, [-2, 10, -2], { n: 80, colors: ['#666', '#888', '#aaa'], speed: 4, size: 0.8, life: 2.4, grav: -1, drag: 1.5 });
  burst(E.splash, [0, 0.6, -6.5], { n: 120, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 7, size: 0.22, life: 1.4, grav: 14, hemi: 1, up: 5 });
  for (let i = 0; i < 3; i++) burst(E.bounce + i * 0.8, [0, 1.2, 10.5], { n: 16, colors: ['#b6ff3b', '#ffffff'], speed: 3, size: 0.12, life: 0.6, grav: 4 });
  burst(E.launch, [0, 1.2, 10.5], { n: 40, colors: ['#b6ff3b', '#ffffff', '#ffe066'], speed: 6, size: 0.16, life: 1, grav: 4 });
  for (let k = 0; k < 6; k++) burst(E.clear + 0.6 + k * 0.6, [Math.sin(k) * 3, 1.5, Math.cos(k) * 3], { n: 30, colors: ['#bba98a', '#ddd'], speed: 4, size: 0.4, life: 1.2, grav: 0, drag: 2 });
  burst(E.leggy, [-20, 1, 23], { n: 120, colors: ['#6e452d', '#8b5a3c', '#3cc2a3'], speed: 7, size: 0.35, life: 1.8, grav: 9, hemi: 1, up: 6 });
  for (let k = 0; k < 6; k++) burst(E.catch + k * 0.7, [-2, 3.2, 15.6], { n: 10, colors: ['#ff6fb8', '#ff3d7f', '#ffb0d4'], speed: 1.2, size: 0.22, life: 1.6, grav: -1.5, up: 1 });
  for (let k = 0; k < 5; k++) burst(E.pet + k * 1.1, [-2, 2.2, 16], { n: 8, colors: ['#ff6fb8', '#ffb0d4'], speed: 1, size: 0.2, life: 1.6, grav: -1.5, up: 1 });
  burst(E.creak, [0, 5.5, 0], { n: 40, colors: ['#c9a46a', '#999'], speed: 2, size: 0.12, life: 1.5, grav: 3 });
  for (let k = 0; k < 8; k++) burst(E.sink + 0.4 + k * 0.55, [Math.sin(k * 2.1) * 5, 0.6, Math.cos(k * 2.1) * 5], { n: 60, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.25, life: 1.3, grav: 12, hemi: 1, up: 5 });
  for (let k = 0; k < 4; k++) burst(E.sink + 0.2 + k * 1.0, [(k - 1.5) * 3, 1, 0], { n: 50, colors: ['#9c8b70', '#bba98a', '#ddd'], speed: 5, size: 0.7, life: 2.2, grav: -0.5, drag: 1.5, hemi: 1 });
  function bloopAt(t) {
    if (t < E.clear) return null;
    if (t < E.fortA) { const a = t * 6; return { p: [Math.sin(a) * 4, 0.5 + Math.abs(Math.sin(t * 11)) * 0.6, Math.cos(a) * 4], yaw: a + Math.PI / 2, o: { walk: 1, phase: t * 30 } }; }
    if (t < E.fortB) { const a = t * 3.2; return { p: [Math.sin(a) * 5.6, 0.5 + Math.abs(Math.sin(t * 9)) * (1 + 4 * seg(t, E.fortA, E.fortB)), Math.cos(a) * 5.6], yaw: a + Math.PI / 2, o: { walk: 1, phase: t * 30 } }; }
    if (t < E.proud) return { p: [-2.8, 0.5, 10.6], yaw: 0.2, o: { facepalm: win(t, E.facepalm, E.statue) } };
    if (t < E.hide + 1.4) return { p: [-1.2, 0.5, 11.3], yaw: -0.5 };
    if (t < E.campfire) { const w = walker(t, [[E.hide + 1.4, -1.2, 0.5, 11.3], [E.hide + 2.0, -0.6, 0.5, 8.7], [E.campfire - 1.5, -0.6, 0.5, 8.7], [E.campfire, -4.6, 0.5, 12.3]], -0.6); return { p: w.p, yaw: w.yaw, o: { walk: w.walk, hop: win(t, E.hide + 1.4, E.leggyStop) } }; }
    if (t < 278) return { p: [-4.6, 0.5, 12.3], yaw: Math.PI * 0.75 };
    const w = walker(t, [[278, -4.6, 0.5, 12.3], [280, 1.0, 0.5, 11.8]], Math.PI / 2); return { p: w.p, yaw: w.yaw, o: { walk: w.walk, handOut: t > 280.2 } };
  }
  function heroAt(t) {
    const o = { t, mallet: true };
    if (t < E.planClose + 0.2) {
      const K = [[0, 0.3, 2.5, 1], [E.stand + 0.5, 0.3, 2.5, 1], [16.2, 0.3, 2.5, 3.2], [17.2, 0.2, 1.5, 4.6], [18.2, 0.1, 1.0, 5.8], [19.4, 0, 1.0, 7]];
      const w = walker(t, K, 0); const ob = { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase };
      if (t < E.sitUp) { ob.flat = 1; ob.flatDir = -1; ob.face = 'soot'; ob.mallet = false; }
      else if (t < E.stand) { ob.sit = 1; ob.face = 'soot'; ob.headYaw = Math.sin(t * 1.5) * 0.4; ob.mallet = false; }
      if (win(t, E.stand, E.planOpen)) ob.face = t < 15.2 ? 'soot' : 'smug';
      if (t >= E.planOpen) { ob.hold = true; ob.block = 'plank'; ob.mallet = false; ob.yaw = 0; ob.headPitch = 0.4; }
      return ob;
    }
    if (t < E.clear) { const w = walker(t, [[E.planClose, 0, 1.0, 7], [36, 6, 0.5, 9]]); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase }; }
    if (t < 146.6) return { ...o, p: [3.2, 0.5, 11.5], yaw: -0.4, hips: true, face: t > 141.6 ? 'smug' : 'normal', headPitch: t > 135.4 ? -0.3 : 0 };
    if (t < E.moat) { const w = walker(t, [[146.6, 3.2, 0.5, 11.5], [149, 0.5, 0.5, 8.6]], 0); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase }; }
    if (t < E.bridge) { const a = (t - E.moat) * 3.2; return { ...o, p: [Math.sin(a) * 8.5, 0.5, Math.cos(a) * 8.5], yaw: a + Math.PI / 2, walk: 1.3, phase: t * 16, block: 'water', hold: true, mallet: false }; }
    if (t < E.tramp + 0.6) return { ...o, p: [2.2, 0.5, 8.8], yaw: -Math.PI / 2, swing: (t - E.bridge) * 2, mallet: false, block: 'plank' };
    if (t < E.bounce) { const w = walker(t, [[E.tramp + 0.6, 2.2, 0.5, 8.8], [E.bounce - 0.3, 0, 1.1, 10.5]], 0); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'smug' }; }
    if (t < E.launch) { const k = (t - E.bounce) / ((E.launch - E.bounce) / 3), n = Math.floor(k), f = k - n; const hgt = [2, 3.5, 6][Math.min(2, n)];
      return { ...o, p: [0, 1.1 + Math.sin(f * Math.PI) * hgt, 10.5], yaw: 0, face: 'smug', wave: f > 0.3 && f < 0.7, walk: 0 }; }
    if (t < E.splash) { const k = seg(t, E.launch, E.splash); return { ...o, p: [0, 1.1 + Math.sin(k * Math.PI) * 22 - k * 1.0, lerp(10.5, -6.5, k)], yaw: 0, face: 'scared', panic: true, spin: k * 9 }; }
    if (t < E.statue) return { ...o, p: [0, -0.3 + Math.sin(t * 3) * 0.08, -6.5], yaw: Math.PI, face: 'soot', panic: t < E.splash + 1.5 };
    if (t < E.proud) return { ...o, p: [2.8, 0.5, 11.2], yaw: Math.PI + 0.4, swing: (t * 2.2) % 1, block: 'hoodie', mallet: false, face: 'smug', headPitch: -0.5 };
    if (t < E.dusk) return { ...o, p: [1.2, 0.5, 11.2], yaw: 0, hips: true, face: 'smug' };
    // dusk / night
    if (t < E.hide) { const ob = { ...o, p: [0.6, 0.5, 11], yaw: t < E.rumble ? 0 : -0.9, face: t < E.rumble ? 'normal' : 'scared' }; if (t > E.leggy + 1.2) ob.panic = true; return ob; }
    if (t < E.bombThrow - 0.4) { const w = walker(t, [[E.hide, 0.6, 0.5, 11], [E.hide + 0.8, -0.8, 0.5, 9.6], [E.hide + 2.6, -0.8, 0.5, 9.6], [E.hide + 3.4, 0.4, 0.5, 9.4]], -0.9); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'scared', panic: true }; }
    if (t < E.statueBoom + 0.6) { const ob = { ...o, p: [0.4, 0.5, 9.4], yaw: -0.3, face: 'normal', mallet: false, bomb: t < E.bombThrow, swing: t >= E.bombThrow - 0.4 && t < E.bombThrow + 0.3 ? (t - E.bombThrow + 0.4) / 0.7 : undefined };
      if (t > E.bombTramp) { ob.face = 'scared'; ob.yaw = Math.PI - 0.3; ob.headPitch = -0.6; } return ob; }
    if (t < E.leggyStop) return { ...o, p: [0.4, 0.5, 9.4], yaw: Math.PI - 0.3, face: 'scared', headPitch: 0.4, headRoll: 0.2 };
    if (t < E.roll + 2.0) { const ob = { ...o, p: [0.2, 0.5, 10.2], yaw: -0.31, face: t < E.catch ? 'scared' : 'normal', mallet: false };
      if (win(t, E.shardOut, E.toss + 0.4)) { ob.hold = true; ob.block = 'shard'; } if (win(t, E.toss - 0.2, E.toss + 0.4)) ob.swing = (t - E.toss + 0.2) / 0.6; if (t > E.catch + 0.6) ob.face = 'smug'; return ob; }
    if (t < E.campfire) { const w = walker(t, [[E.roll + 2.0, 0.2, 0.5, 10.2], [E.pet, -1.5, 0.5, 14.3]], -0.2); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, wave: t > E.pet + 0.3, face: 'smug', mallet: false }; }
    if (t < 250.6) return { ...o, p: [-2.4, 0.5, 11.8], yaw: Math.atan2(-1.1, -0.6), sit: 1, face: 'smug' };
    const w = walker(t, [[250.6, -2.4, 0.5, 11.8], [252.2, -2.4, 0.5, 11.8], [254.2, 2.5, 0.5, 11.5]], Math.PI);
    const ob = { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, mallet: false, headPitch: t > E.climb ? -0.4 : 0 };
    if (t < 252.2) ob.sit = 1 - seg(t, 251.4, 252.2);
    if (t > E.creak) { ob.face = 'scared'; ob.headPitch = -0.2; }
    if (win(t, E.sink, 280)) { ob.panic = true; }
    if (t > 280) { ob.yaw = -Math.PI / 2 + 0.4; ob.face = 'soot'; ob.headPitch = 0.2; }
    return ob;
  }
  function leggyAt(t) {
    L.root.visible = t > E.leggy - 0.1; L.root.rotation.set(0, 0, 0); L.body.rotation.set(0, 0, 0);
    if (!L.root.visible) return;
    const LK = [[0, -20, 0, 23], [E.leggy + 1.2, -20, 0, 23], [E.leggyStop, -2, 0, 16.5], [E.climb, -2, 0, 16.5], [E.climb + 1.6, 0, 0, 8.4], [E.climb + 2.4, 0, 0, 5.3]];
    const w = walker(t, LK, Math.PI);
    let p = [w.p[0], Math.max(0.5, hf(Math.round(w.p[0]), Math.round(w.p[2])) + 0.5), w.p[2]], yaw = w.yaw;
    if (t < E.leggy + 1.2) p[1] -= 3 * (1 - seg(t, E.leggy, E.leggy + 1.2));
    if (t >= E.leggyStop && t < E.climb) yaw = yawTo(p, hero.root.position.toArray());
    poseLurk(L, t, p, yaw, w.speed);
    if (win(t, E.catch, E.roll)) { L.root.rotation.y += Math.sin(t * 14) * 0.35; L.root.position.y += Math.abs(Math.sin(t * 10)) * 0.4; }
    if (win(t, E.roll, E.campfire)) { const k = ss(seg(t, E.roll, E.roll + 0.8)); L.body.rotation.z = Math.PI * k; L.body.position.y = lerp(1.3, 0.9, k); L.legs.forEach((g2, i) => g2.rotation.x = Math.sin(t * 12 + i) * 0.6); }
    if (t >= E.campfire && t < E.climb) { L.body.position.y = 0.75; L.legs.forEach(g2 => g2.rotation.x = 0.3); L.root.rotation.y = Math.PI * 0.8; }
    const climb0 = E.climb + 2.4;
    if (t >= climb0) {
      const k1 = seg(t, climb0, climb0 + 1.6), k2 = seg(t, climb0 + 1.6, E.onRoof);
      if (t < climb0 + 1.6) { L.root.position.set(0, lerp(0.5, 5.4, k1), 5.5); L.root.rotation.set(-Math.PI / 2 * Math.min(1, k1 * 4), Math.PI, 0); }
      else { L.root.position.set(lerp(0, 1, k2), 5.5, lerp(4.2, 0.5, k2)); L.root.rotation.set(-Math.PI / 2 * (1 - k2), Math.PI, 0); }
      if (t >= E.onRoof) { L.body.position.y = 0.75 + Math.sin(t * 1.5) * 0.04; L.legs.forEach(g2 => g2.rotation.x = 0.3); L.root.rotation.set(0, Math.PI * 1.2, 0); }
      if (t >= E.creak && t < E.sink) L.root.position.x = 1 + Math.sin(t * 40) * 0.02 * seg(t, E.creak, E.sink);
      if (t >= E.sink) { const k = seg(t, E.sink, E.sinkEnd); L.root.position.y = Math.max(5.5 - 9 * k * k, -0.55) + (k > 0.8 ? Math.sin(t * 2) * 0.08 : 0); L.root.position.x = 1 + 0.25 * k * k * 0.5; }
    }
  }
  function update(t) {
    dy.update(t); hero.root.visible = true; pose(hero, heroAt(t));
    packGlow.visible = win(t, 140, E.shardOut); packGlow.material = MAT.shard; packGlow.scale.setScalar(t > 219 ? 1 + Math.sin(t * 8) * 0.25 : 1);
    const b = bloopAt(t); bloop.B.root.visible = !!b; if (b) poseBurble(bloop, t, b.p, b.yaw, b.o || {}); invoice.visible = t > 280.2;
    leggyAt(t);
    door.visible = t < E.clear + 4.4; if (door.visible) { const k = seg(t, E.clear + 3.6, E.clear + 4.4); door.position.y = 0.75 + k * k * 20; door.scale.setScalar(1 - k * 0.9); }
    tramp.visible = t >= E.tramp && t < E.sink; if (tramp.visible) { tramp.scale.setScalar(Math.max(0.01, backOut(seg(t, E.tramp, E.tramp + 0.4)))); const hp = hero.root.position; pad.position.y = 0.5 - (hp.y < 1.5 && Math.abs(hp.z - 10.5) < 1 && t > E.bounce ? (1.5 - hp.y) * 0.3 : 0) - (win(t, E.bombTramp, E.bombTramp + 0.3) ? 0.2 : 0); }
    fire.visible = t > E.campfire - 0.5 && t < 300; flames.forEach((f, i) => { f.scale.set(1, 1 + Math.sin(t * 13 + i * 2) * 0.4, 1); f.position.y = 0.35 + Math.sin(t * 9 + i) * 0.08; }); fireL.intensity = fire.visible ? 18 + Math.sin(t * 17) * 4 : 0;
    // bomb
    bombObj.visible = win(t, E.bombThrow, E.statueBoom);
    if (bombObj.visible) { let p; if (t < E.bombTramp) { const k = seg(t, E.bombThrow, E.bombTramp); p = [lerp(0.6, 0, k), 1.8 + Math.sin(k * Math.PI) * 1.2 - k * 0.8, lerp(9.6, 10.5, k)]; }
      else { const k = seg(t, E.bombTramp, E.statueBoom); p = [lerp(0, -2, k), lerp(1.0, 10, k) + Math.sin(k * Math.PI) * 9, lerp(10.5, -2, k)]; }
      bombObj.position.set(...p); bombObj.rotation.set(t * 9, t * 6, 0); }
    boomL.intensity = t >= E.statueBoom ? 900 * Math.exp(-(t - E.statueBoom) * 4) : 0;
    shardObj.visible = t >= E.toss + 0.1 && t < E.roll;
    if (shardObj.visible) { const k = seg(t, E.toss + 0.1, E.catch); const lp = L.root.position; shardObj.position.set(lerp(0.4, lp.x, k), lerp(1.8, 2.6, k) + Math.sin(k * Math.PI) * 2.2, lerp(10.4, lp.z - 1.6, k)); shardObj.rotation.set(t * 6, t * 4, 0);
      if (t >= E.catch) { L.hd.updateMatrixWorld(true); const v = new THREE.Vector3(0, -0.4, 1.0); L.hd.localToWorld(v); g.worldToLocal(v); shardObj.position.copy(v); } }
    return { cam: homeCam(t), hud: true };
  }
  function homeCam(t) {
    const C = [
      [0, 9, 9, 16, 0, 1.5, 0, 50], [E.prevEnd, 5, 5.5, 10, 0, 2.0, 1, 50],
      [E.prevEnd + 0.01, 1.8, 3.4, 4.2, 0.3, 2.9, 1.0, 45], [E.stand - 0.1, 1.6, 3.4, 3.8, 0.3, 3.0, 1.0, 42],
      [E.stand, -4, 4, 9, 0, 2.5, 2, 55], [20.5, 3, 3, 12.5, 0, 1.6, 6, 55],
      [20.6, 1.2, 2.3, 10.0, 0, 2.0, 7, 46], [E.planClose, 1.0, 2.3, 9.6, 0, 2.0, 7, 44],
      [E.planClose + 0.01, 7, 3, 13, 0, 1.5, 7, 55], [36, 9, 4, 15, 3, 1.5, 8, 55],
      [E.clear, 0, 8, 22, 0, 2, 0, 55], [E.fortA - 0.1, 6, 10, 20, 0, 2, 0, 55],
      [E.fortA, -16, 10, 16, 0, 3, 0, 55], [141.5, 16, 10, 16, 0, 3, 0, 55],
      [141.6, 8, 4, 11, 0, 4, 0, 55], [146.5, 4, 3, 13, 0, 4.5, 0, 55],
      [146.6, 3, 2.2, 15, 0, 1.4, 10.5, 50], [E.moat - 0.1, 2.4, 2.2, 14.5, 0, 1.4, 10.5, 50],
      [E.moat, 16, 13, 16, 0, 0, 0, 55], [E.bridge - 0.1, -16, 13, 16, 0, 0, 0, 55],
      [E.bridge, 5, 2.6, 13, 0, 0.8, 7.5, 52], [E.tramp - 0.1, 4, 2.6, 13, 0, 0.8, 8.5, 52],
      [E.tramp, 5, 2.4, 15.5, 0, 1.4, 10.5, 55], [E.launch - 0.1, 5, 3.0, 15.5, 0, 3.0, 10.5, 58],
      [E.launch, 7, 4, 17, 0, 6, 8, 62], [167, 12, 12, 12, 0, 16, 2, 66], [E.splash, 9, 6, -1, 0, 1, -6.5, 60],
      [E.splash + 0.01, 3, 2.2, -11, 0, 0.6, -6.5, 50], [E.facepalm - 0.1, 3, 2.2, -11, 0, 0.6, -6.5, 50],
      [E.facepalm, -2.3, 2.0, 13.6, -2.8, 1.7, 10.6, 42], [E.statue - 0.1, -2.2, 2.0, 13.2, -2.8, 1.7, 10.6, 40],
      [E.statue, 7, 9, 9, -2, 8, -2, 55], [E.proud - 0.1, 9, 12, 7, -2, 9, -2, 55],
      [E.proud, 0, 5, 25, 0, 5, 0, 55], [E.dusk, 0, 3.5, 20, 0, 4.5, 0, 55],
      [E.rumble - 0.1, 3, 2.5, 18, 0, 3, 0, 55],
      [E.rumble, 1.8, 1.9, 14.6, 0.6, 1.7, 11, 48], [E.leggy + 1.3, 1.8, 1.9, 14.6, 0.6, 1.7, 11, 48],
      [E.leggy + 1.4, -1, 3.5, 8.5, -24, 1.5, 25, 58], [E.hide - 0.1, -1, 3.2, 8.5, -16, 1.5, 21, 54],
      [E.hide, 2.6, 2.1, 14.6, -0.4, 1.4, 10.2, 50], [E.bombThrow - 0.6, 2.6, 2.1, 14.6, -0.4, 1.4, 10.2, 50],
      [E.bombThrow - 0.5, 4, 2.4, 14, 0, 1.2, 10.3, 55], [E.bombTramp + 0.3, 4, 2.4, 14, 0, 1.2, 10.3, 55],
      [E.bombTramp + 0.31, 7, 7, 15, -1, 6, 3, 64], [E.statueBoom - 0.05, 6, 10, 7, -2, 9.5, -2, 55], [217.7, 5, 10, 8, -2, 8.5, -2, 55],
      [217.8, 1.4, 2.0, 12.6, 0.4, 1.8, 9.4, 42], [E.leggyStop - 0.1, 1.2, 2.0, 12.4, 0.4, 1.8, 9.4, 40],
      [E.leggyStop, 1.6, 2.6, 8.4, -2, 1.6, 16.5, 50], [E.shardOut - 0.1, 1.2, 2.6, 8.8, -2, 1.6, 16.5, 46],
      [E.shardOut, -3.6, 2.4, 13.6, 0.2, 1.6, 10.2, 48], [E.toss - 0.1, -3.6, 2.4, 13.2, 0.2, 1.6, 10.2, 46],
      [E.toss, 4, 3, 12.5, -1.4, 1.6, 13.8, 55], [E.roll - 0.1, 3, 3, 12.4, -2, 1.4, 16, 50],
      [E.roll, 1.2, 2.2, 12.4, -2, 0.9, 16.5, 48], [E.campfire - 0.1, -0.6, 2.6, 11.8, -2, 0.9, 16.5, 50],
      [E.campfire, 2, 3, 16.5, -3.4, 1, 11.5, 55], [250.5, 0, 3.6, 17.5, -3, 1, 11.5, 55],
      [250.6, 3, 2.2, 14.2, -1.5, 1.3, 14.5, 50], [E.climb - 0.1, 3, 2.2, 13.7, -1.5, 1.3, 15, 50],
      [E.climb, 8, 4, 15, 0, 2, 6, 55], [E.onRoof - 0.1, 8, 8, 10, 0, 5, 2, 55],
      [E.onRoof, 4, 8.2, 4, 1, 6, 0.5, 50], [E.creak - 0.1, 3.4, 8.0, 3.6, 1, 6, 0.3, 46],
      [E.creak, 0, 6, 25, 0, 4, 0, 55], [E.sink - 0.1, 0, 6, 24, 0, 4, 0, 55],
      [E.sink, 0, 7, 27, 0, 3, 0, 55], [275.9, 0, 8, 26, 0, 1, 0, 55],
      [276, 2.4, 2.0, 14.7, 2.5, 1.8, 11.5, 45], [279.9, 2.2, 2.0, 14.3, 2.5, 1.8, 11.5, 42],
      [280, 4.6, 2.0, 14.6, 1.8, 1.4, 11.6, 48], [E.logo, 4.4, 2.0, 14.2, 1.8, 1.4, 11.6, 46]];
    return camKeys(t, C);
  }
  return { g, update, hf };
})();

// ================================================================ QUARRY (gathering)
const quarry = (() => {
  const g = mk('quarry'), st = new VSet(g), dy = new VSet(g, true), r = rng(51);
  const hf = (x, z) => { if (x >= 9) return 8 + Math.round(vnoise(x / 6, z / 6, 21) * 3); const d = Math.max(0, Math.hypot(x + 10, (z - 2) * 1.2) - 26); return Math.round((vnoise(x / 9, z / 9, 22) * 6 - 1) * ss(d / 10)); };
  for (let x = -60; x <= 30; x++) for (let z = -35; z <= 35; z++) { if (x >= -11 && x <= -9 && z >= -7 && z <= -5) { dy.add(x, 0, z, 'sand', { t1: E.sand + 0.3 + ((x + 11) * 3 + (z + 7)) * 0.2 }); st.add(x, -1, z, 'sand'); continue; }
    const h = hf(x, z); st.add(x, h, z, 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, x >= 9 && y < h - 1 ? (r() < 0.07 ? 'ore' : 'stone') : 'soil'); }
  const targets = []; for (let y = 1; y <= 3; y++) for (let z = -2; z <= 2; z++) targets.push([8, y, z]);
  targets.forEach(([x, y, z], i) => dy.add(x, y, z, 'stone', i < 12 ? { t1: E.mine + 0.3 + i * 0.4 } : {}));
  for (let i = 0; i < 12; i++) { const [x, y, z] = targets[i]; burst(E.mine + 0.3 + i * 0.4, [x, y, z], { n: 14, colors: ['#6b7390', '#8a92ad', '#4a506a'], speed: 3, size: 0.14, life: 0.7, grav: 12 }); }
  const trees = []; for (let i = 0; i < 120; i++) { const x = Math.round(-55 + r() * 62), z = Math.round((r() - .5) * 66); if ((Math.abs(z - 2) < 9 && x > -30) || (x > -14 && z > 0 && z < 16) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build(); dy.build();
  // the tree that falls on me
  const treeG = new THREE.Group(); treeG.position.set(-2, -0.5, 8); g.add(treeG); const ts = new VSet(treeG); tree(ts, 0, 0, 0, rng(9), 6); ts.build();
  for (let k = 0; k < 9; k++) burst(E.chop + 0.25 + k * 0.29, [-2, 1.2, 8.6], { n: 8, colors: ['#b5652e', '#e6b06a'], speed: 3, size: 0.12, life: 0.7, grav: 12, up: 1.5 });
  burst(E.treeLand, [-2, 1, 13], { n: 120, colors: ['#ff7fb6', '#ff95c4', '#b5652e', '#ffffff'], speed: 6, size: 0.25, life: 1.5, grav: 5, hemi: 1 });
  burst(E.gbonk + 0.2, [-5, 1.2, 4], { n: 40, colors: ['#7cff6b', '#3c9a32', '#ffffff'], speed: 5, size: 0.2, life: 1, grav: 8 });
  const G = makeGrumble(1); g.add(G.root);
  const stack = new THREE.Group(); g.add(stack); const stTypes = ['castle', 'log', 'sand', 'castle', 'plank', 'stone', 'castle', 'log', 'sand', 'glass'];
  stTypes.forEach((ty, i) => { const m = new THREE.Mesh(GEO, MAT[ty]); m.scale.setScalar(0.7); m.position.set((i % 2 ? 0.08 : -0.08), i * 0.68, 0); m.castShadow = true; stack.add(m); });
  function update(t) {
    dy.update(t); hero.root.visible = true; hero.root.scale.set(1, 1, 1);
    const K = [[36, 0, 0.5, -2], [38.5, 0, 0.5, -2], [41.8, 6.6, 0.5, 0], [E.mineEnd, 6.6, 0.5, 0], [E.chop - 0.4, -2, 0.5, 9.4], [E.crawl, -2, 0.5, 9.4], [E.sand - 0.6, -0.4, 0.5, 10.6]];
    let o = { t, mallet: true };
    if (t < E.sand) {
      const w = walker(t, K, Math.PI); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase });
      if (win(t, E.mine, E.mineEnd)) { o.yaw = Math.PI / 2; o.swing = (t - E.mine) / 0.4; const i = Math.min(11, Math.floor((t - E.mine) / 0.4)); o.headPitch = (2 - targets[i][1]) * 0.3; o.p = [6.6, 0.5, targets[i][2] * 0.6]; o.face = 'smug'; }
      if (win(t, E.chop, E.treeFall)) { o.yaw = Math.PI; o.swing = (t - E.chop) / 0.29; }
      if (win(t, E.treeFall, E.treeLand)) { o.yaw = Math.PI; o.headPitch = -0.6 * seg(t, E.treeFall, E.treeFall + 0.6); o.face = t > 56.4 ? 'scared' : 'smug'; o.panic = t > 56.8; }
      if (win(t, E.treeLand, E.crawl)) { o.flat = 1; o.flatDir = 1; o.face = 'scared'; hero.root.scale.set(1.15, 0.35, 1.15); }
      if (win(t, E.crawl, E.sand)) o.face = 'soot';
    } else if (t < E.carry - 0.8) {
      if (t < 65.6) Object.assign(o, { p: [-8.3, 0.5, -6], yaw: -Math.PI / 2, swing: (t - E.sand) / 0.4, face: 'smug' });
      else Object.assign(o, { p: [-3.4, 0.5, 4], yaw: -Math.PI / 2, swing: win(t, E.gbonk - 0.3, E.gbonk + 0.3) ? (t - E.gbonk + 0.3) / 0.6 : undefined, face: t > E.gbonk ? 'smug' : 'normal' });
    } else {
      const w = walker(t, [[E.carry - 0.8, 2, 0.5, 1], [80, -34, 0.5, 2]]); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk * 0.8, phase: w.phase, mallet: false, face: 'smug' });
      o.panic = false; pose(hero, o); hero.aL.rotation.set(-3.0, 0, 0); hero.aR.rotation.set(-3.0, 0, 0);
    }
    if (t < E.carry - 0.8) pose(hero, o);
    // tree
    const kf = seg(t, E.treeFall, E.treeLand); let rot = kf * kf * Math.PI / 2; if (t > E.treeLand) rot = Math.PI / 2 - Math.abs(Math.sin((t - E.treeLand) * 8)) * 0.1 * Math.exp(-(t - E.treeLand) * 3);
    treeG.rotation.x = rot; treeG.visible = t < E.sand;
    // grumble
    G.root.visible = win(t, 65.0, E.carry);
    if (G.root.visible) { if (t < E.gbonk + 0.2) poseGrumble(G, t, [-5.2, 0.5, 4], Math.PI / 2, 1, 0); else { const k = seg(t, E.gbonk + 0.2, E.gbonk + 2); G.root.position.set(lerp(-5.2, -26, k), 0.5 + Math.sin(k * Math.PI) * 10, lerp(4, 0, k)); G.root.rotation.set(k * 12, 0, k * 7); } }
    stack.visible = t >= E.carry - 0.8;
    if (stack.visible) { const hp = hero.root.position; stack.position.set(hp.x, hp.y + 2.5, hp.z); stack.rotation.set(0, hero.root.rotation.y, 0); stack.children.forEach((m, i) => { m.position.x = Math.sin(t * 3 + i * 0.4) * 0.03 * i; m.rotation.z = Math.sin(t * 3 + i * 0.3) * 0.02 * i; }); }
    const C = [[36, 5, 3, 6, 0, 1.4, -2, 55], [38.4, 2, 3, 6, 3, 1.6, -1, 55], [38.5, -3, 4, 6, 8, 3, 0, 58], [42.5, 2, 3.5, 6, 8, 2.5, 0, 55],
      [42.6, 4.6, 2.3, 3.4, 7.6, 1.8, 0, 50], [E.mineEnd - 0.1, 4.2, 2.3, -3.2, 7.6, 1.8, 0, 50], [E.mineEnd, 9, 4, 8, 4, 1.5, 4, 58], [E.chop - 0.1, 2, 3, 13, -2, 2, 9, 58],
      [E.chop, 1.2, 1.9, 12, -2, 2.2, 8, 50], [E.treeFall - 0.1, 1.0, 1.9, 11.6, -2, 2.4, 8, 48], [E.treeFall, 5, 3, 16, -2, 3.5, 8.5, 58], [E.treeLand, 5, 3, 16, -2, 1.5, 10, 58],
      [E.treeLand + 0.01, 1, 2, 13.5, -2, 0.8, 9.6, 50], [E.sand - 0.1, 1.4, 2.2, 14, -1, 0.8, 10, 52],
      [E.sand, -6.5, 2.4, -3.5, -9.5, 0.8, -6, 50], [65.5, -6.8, 2.4, -3.2, -9.5, 0.8, -6, 50], [65.6, -3, 2.4, 7.5, -4.5, 1.2, 4, 52], [E.carry - 0.9, -2, 2.6, 8, -6, 1.6, 3, 55],
      [E.carry - 0.8, -3, 3, 8, 1, 2.5, 1, 55], [80, -38, 4, 10, -32, 2.5, 2, 55]];
    let cam = camKeys(t, C);
    if (t >= E.carry - 0.8) { const hp = hero.root.position; cam = { p: [hp.x - 5.5, 3.2, hp.z + 6], l: [hp.x, 3, hp.z], fov: 55 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ================================================================ BURBLE VILLAGE (hiring Bloop)
const village = (() => {
  const g = mk('village'), st = new VSet(g), r = rng(61);
  const crater = (x, z) => Math.hypot(x - 14, z + 3) < 3.2;
  const hf = (x, z) => { if (crater(x, z)) return -1 - (Math.hypot(x - 14, z + 3) < 1.8 ? 1 : 0); return Math.round((vnoise(x / 10, z / 10, 31) * 7 - 1.5) * ss((Math.abs(z) - 13) / 8)); };
  for (let x = -45; x <= 45; x++) for (let z = -40; z <= 40; z++) { const h = hf(x, z); st.add(x, h, z, Math.abs(z) <= 1 && !crater(x, z) ? 'path' : 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil'); }
  const hut = (cx, cz, door) => {
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = 1; y <= 3; y++) { const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (!edge) continue; if (x === 0 && z === 2 * door && y <= 2) continue;
      if (y === 2 && (Math.abs(x) === 2 && z === 0)) { st.add(cx + x, y, cz + z, 'glass'); continue; } st.add(cx + x, y, cz + z, (Math.abs(x) === 2 && Math.abs(z) === 2) ? 'log' : 'hut'); }
    for (let l = 0; l < 3; l++) { const R = 3 - l; for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) if (l === 2 || Math.abs(x) === R || Math.abs(z) === R) st.add(cx + x, 4 + l, cz + z, 'hutRoof'); }
  };
  hut(22, -6, 1); hut(9, 7, -1); hut(21, 7, -1); hut(30, -5, 1);
  for (let i = 0; i < 14; i++) st.add(10 + Math.round(r() * 8), 0, -6 + Math.round(r() * 6), ['hut', 'hutRoof', 'log', 'glass'][i % 4]);
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 88), z = Math.round((r() - .5) * 78); if (Math.abs(z) < 14 || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  // warning sign with my face crossed out
  const signTex = ctex(32, gg => { gg.fillStyle = '#e6c58a'; gg.fillRect(0, 0, 32, 32); gg.fillStyle = '#f2c79b'; gg.fillRect(8, 8, 16, 16); gg.fillStyle = '#5a3a22'; gg.fillRect(8, 6, 16, 4); gg.fillStyle = '#7dff6a'; gg.fillRect(10, 11, 4, 2); gg.fillRect(18, 11, 4, 2); gg.fillStyle = '#000'; gg.fillRect(12, 19, 8, 2); gg.fillStyle = '#e8344e'; for (let i = 0; i < 28; i++) { gg.fillRect(2 + i, 2 + i, 3, 3); gg.fillRect(27 - i, 2 + i, 3, 3); } });
  const sign = new THREE.Group(); sign.position.set(10.5, 0.5, -1.6); g.add(sign); box(0.18, 2.2, 0.18, '#7a4a2a', 0, 1.1, 0, sign);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.12), [lam(TX.plank), lam(TX.plank), lam(TX.plank), lam(TX.plank), new THREE.MeshLambertMaterial({ map: signTex }), lam(TX.plank)]); board.position.set(0, 2.3, 0); board.rotation.y = -0.5; sign.add(board);
  const cols = ['#e0577b', '#7b5cd6', '#3d9be0', '#f08a24', '#5a3fb8'];
  const bs = [[10.4, 0.5, 1.4], [13, 0.5, 2.4], [15.6, 0.5, 1.0], [12.2, 0.5, -1.0], [17.5, 0.5, 2.6]].map((p, i) => ({ ...mkBurble(cols[i]), p }));
  bs.forEach(b => g.add(b.B.root));
  const hh = hardHat(bs[0].B);
  for (let i = 0; i < 5; i++) burst(E.calm + i * 0.15, [bs[i].p[0], 2.6, bs[i].p[2]], { n: 10, colors: ['#ff6fb8', '#ffb0d4', '#ffe066'], speed: 1.2, size: 0.2, life: 1.6, grav: -1.5, up: 1 });
  burst(E.hardhat, [10.4, 2.6, 1.4], { n: 30, colors: ['#ffd400', '#ffffff'], speed: 3, size: 0.12, life: 1, grav: 3 });
  function update(t) {
    hero.root.visible = true; hero.root.scale.set(1, 1, 1);
    const K = [[80, -26, 0.5, 0], [E.villageReveal - 0.4, -6, 0.5, 0], [E.angry - 0.4, -6, 0.5, 0], [E.flower - 0.6, 7.6, 0.5, 1.0], [E.walkHome, 7.6, 0.5, 1.0], [130, -30, 0.5, 0.5]];
    const w = walker(t, K, Math.PI / 2); const o = { t, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, mallet: true };
    if (win(t, E.villageReveal - 0.4, E.angry - 0.4)) o.headPitch = 0.1;
    if (win(t, E.angry, E.flower)) { o.face = 'scared'; o.yaw = Math.PI / 2; }
    if (win(t, E.flower, E.calm + 0.4)) { o.mallet = false; o.block = 'flower'; o.hold = true; o.yaw = Math.PI / 2; o.face = 'smug'; }
    if (win(t, E.calm + 0.4, E.walkHome)) { o.yaw = Math.PI / 2; o.face = 'smug'; o.wave = win(t, E.hardhat, E.hardhat + 1.5); }
    pose(hero, o);
    hh.visible = t >= E.hardhat; if (hh.visible) hh.scale.setScalar(Math.max(0.01, backOut(seg(t, E.hardhat, E.hardhat + 0.3))));
    bs.forEach((b, i) => {
      let p = b.p, yaw = yawTo(b.p, hero.root.position.toArray()), opt = { seed: i };
      if (win(t, E.angry, E.calm)) { opt.angry = true; opt.hop = true; }
      if (i === 0 && t >= E.walkHome) { const bw = walker(t - 1.4, [[0, 10.4, 0.5, 1.4], [E.walkHome, 10.4, 0.5, 1.4], [130, -30, 0.5, 0.5]], Math.PI / 2); p = bw.p; yaw = bw.yaw; opt.walk = bw.walk; opt.phase = bw.phase; }
      if (i > 0 && t >= E.walkHome) { opt.hop = false; b.B.aR.rotation.set(-2.6, 0, Math.sin(t * 10 + i) * 0.4); }
      poseBurble(b, t, p, yaw, opt);
      if (i > 0 && t >= E.walkHome) b.B.aR.rotation.set(-2.6, 0, Math.sin(t * 10 + i) * 0.4);
    });
    const C = [[80, -30, 3, 5, -24, 1.5, 0, 55], [E.villageReveal - 0.1, -11, 3, 4, -5, 1.5, 0, 55],
      [E.villageReveal, -10, 3.2, -2.2, 12, 2.5, 0, 55], [E.angry - 0.1, -9, 3.6, -2.5, 14, 2, 0, 52],
      [E.angry, 7.5, 2.0, 4.4, 13, 1.6, 1.8, 46], [92.6, 8.5, 2.0, 4.6, 13, 1.6, 1.8, 44], [92.7, 14, 1.8, -3.4, 15.6, 1.6, 1.0, 40], [E.flower - 0.1, 13.6, 1.8, -3.0, 13, 1.6, 2.4, 40],
      [E.flower, 9.0, 2.2, -2.6, 7.6, 1.7, 1.0, 46], [E.calm - 0.1, 9.4, 2.2, -2.2, 7.6, 1.7, 1.0, 44],
      [E.calm, 5, 3.2, 5, 13, 1.8, 1, 55], [E.hireOpen - 0.1, 5.5, 3.2, 5.5, 13, 1.8, 1, 55],
      [E.hireOpen, 8.4, 2.0, 3.2, 10.4, 1.7, 1.4, 44], [E.walkHome - 0.1, 8.6, 2.0, 3.6, 10.4, 1.9, 1.4, 42],
      [E.walkHome, 0, 3, 6, 6, 1.5, 1, 55], [122.5, -14, 3, 6, -8, 1.5, 1, 55], [122.6, -24, 4, 7, -18, 1.6, 1, 55], [130, -30, 4, 8, -24, 1.6, 1, 55]];
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();
