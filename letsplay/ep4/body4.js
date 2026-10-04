// ================================================================ EPISODE 4: "I LIVE IN THE SKY (it falls)"
MAT.float = new THREE.MeshLambertMaterial({ map: TX.ore, emissive: '#5ff7ff', emissiveMap: TX.ore, emissiveIntensity: 1.0, color: '#9ff' });
const PY = 30; // sky platform height
const skyW = (() => {
  const g = mk('sky'), st = new VSet(g), dy = new VSet(g, true), r = rng(91);
  const hf = (x, z) => { if (x >= 14) return 6 + Math.round(vnoise(x / 6, z / 6, 3) * 3); return Math.round((vnoise(x / 10, z / 10, 92) * 5 - 1) * ss((Math.hypot(x, z) - 12) / 12)); };
  for (let x = -60; x <= 40; x++) for (let z = -50; z <= 50; z++) { if (x < -26) { st.add(x, 0, z, 'water'); st.add(x, -1, z, 'sand'); continue; }
    const h = hf(x, z); st.add(x, h, z, x < -18 ? 'sand' : 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, x >= 14 && y < h - 1 ? 'stone' : 'soil'); }
  const ore = [[13, 2, -2], [13, 3, -1], [13, 1, 0], [13, 3, 1], [13, 2, 2]];
  ore.forEach(([x, y, z], i) => dy.add(x, y, z, 'float', { t1: E.mine + 0.6 + i * 1.1, fly: [-0.5, 2.2, 0], spin: [0.3, 1, 0.2], floor: -50, keep: false }));
  for (const [x, y, z] of [[13, 4, -3], [13, 1, 3], [13, 5, 0]]) st.add(x, y, z, 'float');
  const trees = []; for (let i = 0; i < 120; i++) { const x = Math.round(-20 + r() * 30), z = Math.round((r() - .5) * 96); if (Math.abs(z) < 14 || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  // pillar to the sky
  for (let y = 1; y <= PY - 1; y++) dy.add(0, y, 0, ['castle', 'plank', 'jade', 'polka'][y % 4], { t0: E.pillar + (y - 1) * (E.pillarEnd - E.pillar) / (PY - 1) });
  st.build(); dy.build();
  // the sky platform (own group so it can tilt and fall)
  const P = new THREE.Group(); g.add(P); P.position.set(0, PY, 4); const ps = new VSet(P, true); const cells = [];
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) { cells.push([x, -1, z, (x + z) % 3 === 0 ? 'float' : 'float']); }
  for (let x = -5; x <= 5; x++) for (let z = -5; z <= 5; z++) cells.push([x, 0, z, 'plank']);
  for (let y = 1; y <= 3; y++) for (let x = -3; x <= 0; x++) for (let z = -4; z <= -1; z++) { if (x > -3 && x < 0 && z > -4 && z < -1) continue; if (x === -1 && z === -1 && y <= 2) continue; cells.push([x, y, z, y === 2 && (x === -3 || z === -4) ? 'glass' : 'plank']); }
  for (let x = -4; x <= 1; x++) for (let z = -5; z <= 0; z++) cells.push([x, 4, z, 'slate']);
  for (const [x, z] of [[2, 1], [3, 1], [2, 2], [3, 2]]) cells.push([x, 1, z, 'leaf']);
  for (let i = -5; i <= 5; i += 2) { cells.push([i, 1, 5, 'log'], [i, 1, -5, 'log'], [5, 1, i, 'log'], [-5, 1, i, 'log']); }
  cells.forEach(([x, y, z, ty], i) => ps.add(x, y, z, ty, { t0: E.buildA + i * (E.buildB - E.buildA) / cells.length }));
  ps.add(-4, 1, 4, 'buzz', { t0: E.counter });
  ps.build();
  const mill = new THREE.Group(); mill.position.set(3.5, 1, -3.5); P.add(mill); box(0.3, 3, 0.3, '#7a4a2a', 0, 1.5, 0, mill); const blades = pivot(mill, 0, 3, 0.25); for (let k = 0; k < 4; k++) { const b = box(0.3, 1.6, 0.06, '#ffffff', 0, 0.8, 0, pivot(blades, 0, 0, 0)); b.parent.rotation.z = k * Math.PI / 2; }
  const glowL = new THREE.PointLight('#5ff7ff', 40, 18, 1.5); glowL.position.set(0, -2, 0); P.add(glowL);
  const bloop = mkBurble('#e0577b'); hardHat(bloop.B); const paper = box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root); L.light.intensity = 2;
  const birds = [0, 1, 2].map(i => { const b = makeBird(['#ff7fb6', '#ff9ecb', '#ff5c9a'][i]); g.add(b.root); return b; });
  g.add(sandwich);
  const hammock = box(0.9, 0.12, 2.2, '#ff4d6d', 2.5, 1.0, 3.2, P);
  for (let i = 0; i < 5; i++) burst(E.mine + 0.6 + i * 1.1, [13, 2, 0], { n: 16, colors: ['#5ff7ff', '#ffffff'], speed: 3, size: 0.14, life: 0.8, grav: -1 });
  burst(E.skyHouse, [0, PY + 3, 4], { n: 140, colors: ['#ffe066', '#ff5cf0', '#5ff7ff', '#7cff6b'], speed: 9, size: 0.2, life: 2.4, grav: 5, up: 4 });
  burst(E.steal, [0.5, PY + 2.5, 5], { n: 30, colors: ['#ff7fb6', '#ffffff', '#e6b06a'], speed: 3, size: 0.14, life: 1, grav: 3 });
  burst(E.counter + 0.2, [-4, PY + 1.5, 8], { n: 30, colors: ['#ffd400', '#1c1c1c'], speed: 3, size: 0.14, life: 0.8, grav: 6 });
  for (let k = 0; k < 6; k++) burst(E.crash + k * 0.25, [(k - 2.5) * 2, 1, 4 + (k % 2 ? 2 : -2)], { n: 80, colors: ['#bba98a', '#9c8b70', '#ddd', '#e0a95a'], speed: 8, size: 0.9, life: 2.6, grav: -0.5, drag: 1.5, hemi: 1, up: 1 });
  function update(t) {
    dy.update(t); ps.update(t);
    // platform motion
    let tilt = 0, py = PY, glow = 1;
    if (t >= E.tilt) tilt = 0.32 * ss(seg(t, E.tilt, E.tilt + 1.2)) * (1 - 0.5 * ss(seg(t, E.balance, E.balance + 6))) * (1 - ss(seg(t, E.counter + 0.4, E.balanced + 0.6))) + Math.sin(t * 3) * 0.02 * (t < E.balanced ? 1 : 0);
    glow = 1 - ss(seg(t, E.fade, E.sag));
    if (t >= E.sag) py -= 3 * seg(t, E.sag, E.fall);
    if (t >= E.fall) { const k = seg(t, E.fall, E.crash); py = lerp(PY - 3, 1.2, k * k); tilt = 0.15 * k; }
    if (t >= E.crash) { py = 1.2; tilt = 0.12; }
    P.position.y = py; P.rotation.z = -tilt; MAT.float.emissiveIntensity = 0.15 + 0.85 * glow; glowL.intensity = 40 * glow;
    blades.rotation.z = t * 3;
    mill.visible = t >= E.buildB - 9; hammock.visible = t >= E.buildB - 9;
    // pillar crumbles on crash
    // hero
    const o = { t, mallet: false };
    let onP = false;
    if (t < E.pillar) {
      const K = [[0, -16, 0.5, 4], [21.6, -16, 0.5, 4], [30, 11.4, 0.5, 0], [E.floatUp + 4, 11.4, 0.5, 0], [E.pillar - 1.2, 0, 0.5, 1.4], [E.pillar, 0, 0.5, 1.4]];
      const w = walker(t, K, Math.PI / 2); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: t > 17 && t < 30 ? 'smug' : 'normal' });
      if (win(t, E.mine, E.mineEnd)) { o.yaw = Math.PI / 2; o.swing = (t - E.mine) / 0.55; o.mallet = true; }
      if (win(t, E.floatUp, E.floatUp + 5)) { o.headPitch = -0.7; o.face = 'scared'; o.wave = t > E.floatUp + 1.5; }
    } else if (t < E.pillarEnd + 0.8) { const k = seg(t, E.pillar, E.pillarEnd); Object.assign(o, { p: [0, 0.5 + k * (PY - 1), 0], yaw: 0, block: 'castle', hold: true, face: t > 66.6 ? 'scared' : 'smug', headPitch: t > 66.6 ? 0.8 : 0 }); }
    else onP = true;
    if (onP) {
      parentTo(hero.root, P); let p = [1.5, 0.5, 2.5], yaw = 0;
      if (t < E.buildB) { const a = t * 2.2; p = [Math.sin(a) * 3.5, 0.5, Math.cos(a) * 3.5]; yaw = a + Math.PI / 2; Object.assign(o, { walk: 1.2, phase: t * 14, block: 'plank', hold: true }); }
      else if (t < E.sandwich) { Object.assign(o, { hips: t > E.skyHouse, face: 'smug', headYaw: Math.sin(t * 0.6) * 0.6 }); p = [1, 0.5, 4]; }
      else if (t < E.birdsGone) { p = [1, 0.5, 4]; Object.assign(o, { hold: t < E.steal, face: t < E.steal ? 'smug' : 'scared', panic: t >= E.steal }); yaw = t < E.steal ? 0.3 : Math.sin(t * 2); }
      else if (t < E.lookDown) { p = [2.5, 1.2, 3.2]; Object.assign(o, { flat: 1, flatDir: -1, face: 'smug' }); }
      else if (t < 175) { p = [4.3, 0.5, 4.3]; yaw = Math.PI * 0.25; Object.assign(o, { headPitch: 0.8, face: 'normal', wave: t > 155.6 && t < 160 }); }
      else if (t < E.climb) { p = [2.5, 1.2, 3.2]; Object.assign(o, { flat: 1, flatDir: -1, face: 'smug' }); }
      else if (t < E.tilt) { p = [2.0, 0.5, 2.0]; yaw = Math.PI; Object.assign(o, { headPitch: 0.6, face: 'scared' }); }
      else if (t < E.counter + 0.6) { const k = seg(t, E.balance - 2, E.balance + 1); p = [lerp(1, -4, k), 0.5, lerp(2, 4, k)]; yaw = -Math.PI / 2; Object.assign(o, { panic: true, face: 'scared', walk: k > 0 && k < 1 ? 1.2 : 0, phase: t * 14, lean: -0.3 }); }
      else if (t < E.sunset) { p = [-3, 0.5, 3]; Object.assign(o, { hips: true, face: 'smug' }); }
      else if (t < E.fall) { p = [0.5, 0.5, 4.5]; yaw = 0.2; Object.assign(o, { face: t > 241.6 ? 'scared' : 'smug', panic: t > E.sag, headPitch: t > 245 && t < 250 ? 0.4 : 0 }); }
      else if (t < E.crash) { p = [0.5, 0.5 + Math.sin(t * 9) * 0.6, 4.5]; Object.assign(o, { panic: true, face: 'scared' }); }
      else { parentTo(hero.root, g); p = [3.2, 2.2, 12]; yaw = 0.4; Object.assign(o, { sit: 1, face: 'soot' }); }
      o.p = p; o.yaw = yaw;
    } else parentTo(hero.root, g);
    pose(hero, o);
    // bloop
    let bp = [-14.5, 0.5, 5.2], byaw = Math.PI / 2, bo = {};
    if (t >= E.pillar && t < E.buildA) bp = [1.8, 0.5, 1.8];
    if (t >= E.buildA) { parentTo(bloop.B.root, P);
      if (t < E.buildB) { const a = t * 3 + 2; bp = [Math.sin(a) * 4, 0.5 + Math.abs(Math.sin(t * 9)) * 2, Math.cos(a) * 4]; byaw = a + Math.PI / 2; bo = { walk: 1, phase: t * 30 }; }
      else if (t < E.tilt) bp = [-2, 0.5, 2.5];
      else if (t < E.balanced) { bp = [lerp(-1, -3.6, seg(t, E.balance, E.counter)), 0.5, 3.2]; bo = { hop: true }; }
      else if (t < E.crash) bp = [-3.4, 0.5, 2.2];
      else { parentTo(bloop.B.root, g); bp = [5.4, 0.5, 11.2]; byaw = -0.4; }
      if (t > E.crash) bloop.B.root.rotation.x = 0; }
    else parentTo(bloop.B.root, g);
    poseBurble(bloop, t, bp, byaw, bo); paper.visible = t < E.buildA || t > E.invoice - 1 || win(t, 245, 250);
    if (win(t, 245, 250.4)) bloop.B.aR.rotation.set(-2.0, 0, 0);
    // leggy
    let lp = [-14, 0.5, 2.2], ly = Math.PI / 2, ls = 0;
    if (t >= 30 && t < E.climb) { lp = [-1.5, 0.5, 6.5]; ly = Math.PI * 0.75; if (win(t, E.lookDown, 175)) { L.root.rotation.set(0, 0, 0); } }
    if (t >= E.climb && t < E.onEdge) { const k = seg(t, E.climb + 1, E.onEdge - 1); lp = [0, 0.5 + k * (PY - 1), -0.9]; ls = 1.5; }
    poseLurk(L, t, lp, ly, ls); parentTo(L.root, g);
    if (win(t, E.lookDown, 175)) L.legs.forEach((lg, i) => lg.rotation.x = Math.sin(t * 8 + i) * 0.9);
    if (t >= E.climb && t < E.onEdge) L.root.rotation.set(-Math.PI / 2, 0, 0);
    if (t >= E.onEdge) { parentTo(L.root, P); poseLurk(L, t, t < E.balanced ? [4, 0.5, 0] : [3.5, 0.5, -0.5], -Math.PI / 2, 0.2); L.body.position.y = 0.8; }
    if (t >= E.crash) { parentTo(L.root, g); poseLurk(L, t, [3.2, 0.5, 12], 0.4, 0); L.body.position.y = 0.9; }
    // sandwich + birds
    sandwich.visible = win(t, E.sandwich, E.birdsGone);
    if (sandwich.visible && t < E.steal) { const v = heroWorldHand(); g.worldToLocal(v); sandwich.position.copy(v); }
    birds.forEach((b, i) => { b.root.visible = win(t, E.sandwich + 0.4, E.birdsGone); if (!b.root.visible) return;
      const a = t * 1.3 + i * 2.1; let p = [Math.sin(a) * 6, PY + 6 + Math.sin(t * 2 + i) * 0.6, 4 + Math.cos(a) * 6], yaw = a + Math.PI / 2;
      if (i === 0 && t > E.steal - 1.0) { const k = seg(t, E.steal - 1.0, E.steal), k2 = seg(t, E.steal, E.birdsGone); const hp = heroWorldHand(); g.worldToLocal(hp);
        p = t < E.steal ? [lerp(p[0], hp.x, k), lerp(p[1], hp.y + 0.3, k), lerp(p[2], hp.z, k)] : [hp.x + k2 * 40, hp.y + 0.3 + k2 * 18, hp.z + k2 * 10]; if (t >= E.steal) sandwich.position.set(p[0], p[1] - 0.35, p[2]); }
      b.root.position.set(...p); b.root.rotation.set(0, yaw, 0); b.wL.rotation.z = Math.sin(t * 18 + i) * 0.7; b.wR.rotation.z = -Math.sin(t * 18 + i) * 0.7; });
    const C = [[0, -22, 4, 14, -16, 1.5, 4, 55], [12.7, -20, 3, 10, -16, 1.5, 4, 50], [12.8, -10, 14, 12, -16, 3, 0, 60], [21.5, -12, 16, 8, -16, 3, 0, 60],
      [21.6, -13, 2.2, 8, -15, 1.2, 4, 46], [26.9, -13, 2.2, 7.6, -15, 1.2, 4, 46], [27, 4, 4, 10, 12, 2, 0, 55], [33.9, 6, 3, 6, 12, 2, 0, 55],
      [34, 9.0, 2.4, 3.2, 12.6, 2, 0, 46], [E.floatUp - 0.1, 9.0, 2.4, 3.2, 12.6, 2, 0, 46], [E.floatUp, 7, 2, 5, 12, 6, 0, 58], [53, 8, 2, 6, 12, 14, 0, 60],
      [53.1, -15.2, 2.2, 8.5, -14.5, 1.6, 5.2, 42], [60.9, -15.4, 2.2, 8.3, -14.5, 1.6, 5.2, 40],
      [61, 6, 4, 8, 0, 3, 0, 58], [E.pillarEnd, 6, PY + 2, 8, 0, PY - 2, 0, 58], [71.4, 14, PY + 8, 18, 0, PY, 4, 55], [E.buildB, -14, PY + 8, 18, 0, PY, 4, 55],
      [99.6, 0, PY - 6, 30, 0, PY + 1, 4, 55], [107.3, 22, PY + 3, 26, 0, PY + 1, 4, 55], [107.4, 2, PY + 2.4, 9.5, 0, PY + 1, -10, 55], [118.9, -2, PY + 2.4, 9.5, 0, PY + 1, -10, 55],
      [119, 3, PY + 2.2, 7.4, 1, PY + 1.6, 4, 46], [E.steal - 0.1, 3, PY + 2.2, 7.4, 1, PY + 1.6, 4, 46], [E.steal, 6, PY + 4, 1, 4, PY + 4, 6, 60], [134.5, 5, PY + 4, 0, 18, PY + 10, 8, 60],
      [134.6, 3, PY + 2.2, 7.4, 1, PY + 1.6, 4, 46], [141.3, 3, PY + 2.2, 7.4, 1, PY + 1.6, 4, 46], [141.4, 6, PY + 2.4, 6, 2.5, PY + 1, 7, 50], [149.7, 6, PY + 2.4, 6.6, 2.5, PY + 1, 7, 50],
      [149.8, 6.5, PY + 3, 10, -1.5, 0, 6.5, 50], [162, 6.5, PY + 3, 10, -1.5, 0, 6.5, 40], [162.1, -4, 3, 10, -1.5, 1, 6.5, 50], [174.9, -3, 3, 11, -1.5, 1, 6.5, 50],
      [175, 6, PY + 2.4, 6, 2.5, PY + 1, 7, 50], [185.5, 6, PY + 2.4, 6.6, 2.5, PY + 1, 7, 50], [185.6, 5, 6, 4, 0, 10, 0, 62], [191.5, 5, 18, 4, 0, 22, 0, 62],
      [191.6, 6, PY + 4, 9, 2, PY, 4, 55], [E.tilt - 0.1, 6, PY + 4, 9, 2, PY, 4, 55], [E.tilt, 0, PY + 2, 22, 0, PY + 1, 4, 55], [E.balance, 0, PY + 2, 21, 0, PY + 1, 4, 55],
      [E.balance + 0.01, -8, PY + 3, 10, -2, PY + 1, 4, 50], [E.counter + 1.5, -8, PY + 3, 10, -2, PY + 1, 4, 50], [221, 0, PY + 2, 22, 0, PY + 1, 4, 55], [229.9, 10, PY + 4, 20, 0, PY + 1, 4, 55],
      [230, -14, PY + 2, 14, 0, PY, 4, 55], [241.5, -10, PY + 2, 16, 0, PY, 4, 55], [241.6, 3.5, PY + 2.2, 8.4, 0.5, PY + 1.6, 4.5, 46], [250.3, 3.5, PY + 2.2, 8.4, 0.5, PY + 1.6, 4.5, 44],
      [250.4, -5, PY + 1.6, 7, -3.4, PY + 1.6, 4.2, 40], [257.5, -5, PY + 1.6, 7, -3.4, PY + 1.6, 4.2, 40], [257.6, 0, PY - 2, 26, 0, PY - 1, 4, 55], [E.fall, 0, PY - 4, 26, 0, PY - 3, 4, 55],
      [E.fall + 0.01, 0, 6, 30, 0, 14, 4, 60], [E.crash, 0, 6, 30, 0, 3, 4, 60], [273.3, 2, 6, 28, 0, 2, 6, 58], [273.4, 6.5, 2.6, 16.5, 3.4, 1.8, 12, 46], [277.9, 6.0, 2.6, 16.0, 3.4, 1.8, 12, 44],
      [278, 0, 9, 26, 0, 1, 4, 55], [282.1, 2, 9, 25, 0, 1, 4, 55], [282.2, 8.5, 2.4, 15.5, 4.4, 1.6, 11.5, 46], [E.logo, 8.3, 2.4, 15.2, 4.4, 1.6, 11.5, 44]];
    let cam = camKeys(t, C);
    if (win(t, E.fall + 0.01, E.crash)) cam.l = [0, P.position.y + 1, 4];
    if (win(t, E.climb, 191.6)) { const lpp = L.root.position; cam = { p: [5, lpp.y + 2, 5], l: [0, lpp.y + 1, 0], fov: 60 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
