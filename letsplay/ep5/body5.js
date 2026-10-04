// ================================================================ EPISODE 5: "I LIVE UNDERGROUND (it floods)"  — ant-farm cutaway
const under = (() => {
  const g = mk('under'), st = new VSet(g), dy = new VSet(g, true), r = rng(101);
  const rooms = [['shaft', 0, 1, -12, 0], ['A', -12, -1, -12, -9], ['B', 2, 12, -12, -9], ['ladder', -2, -1, -16, -12], ['C', -12, -3, -17, -14]];
  const hole = [6, 7, -20, -13];
  const inRoom = (x, y) => rooms.some(([, x0, x1, y0, y1]) => x >= x0 && x <= x1 && y >= y0 && y <= y1);
  const inHole = (x, y) => x >= hole[0] && x <= hole[1] && y >= hole[2] && y <= hole[3];
  const lakeC = (x, y) => x >= 2 && x <= 14 && y >= -24 && y <= -21;
  const order = (x, y) => { // dig timing
    if (x >= 0 && x <= 1 && y >= -12) return E.dig + (-y) * 0.45;
    return E.dig + 5.6 + Math.abs(x) * 0.4 + (-9 - y) * 0.3 + (y < -12 ? 3 : 0); };
  // water level over time
  const level = t => t < E.spring ? -21.5 : t < 160 ? lerp(-21, -15, seg(t, E.spring, 160)) : t < E.burst ? -15 : t < E.geyser ? lerp(-15, 0.6, seg(t, E.burst, E.geyser)) : t < E.land + 1 ? 0.6 : lerp(0.6, -0.4, seg(t, E.land + 1, E.land + 8));
  const lvT = y => { // first time level >= y
    for (let t = E.spring; t < 260; t += 0.1) if (level(t) >= y) return t; return 1e9; };
  for (let x = -30; x <= 30; x++) for (let y = -25; y <= 0; y++) for (let z = -6; z <= -1; z++) {
    const carved = (inRoom(x, y) || inHole(x, y)) && z <= -2;
    const ty = y === 0 ? 'turf' : y > -4 ? 'soil' : y > -15 ? 'stone' : 'dark';
    if (lakeC(x, y) && z <= -2) { st.add(x, y, z, 'water'); continue; }
    if (carved) { const t1 = inHole(x, y) ? E.hole + (-13 - y) * 1.2 : order(x, y); dy.add(x, y, z, ty, { t1 });
      const tw = lvT(y - 0.4); dy.add(x, y, z, 'water', { t0: tw, ...(t0w => ({}))() }); continue; }
    if (z === -1 && !(inRoom(x, y) || inHole(x, y))) { st.add(x, y, z, ty); continue; }
    if (z < -1) st.add(x, y, z, ty);
  }
  // water drains after geyser
  for (const m of [dy]) for (const arr of Object.values(m.items)) for (const b of arr) if (b.type === 'water' && b.y > -14) b.t1 = E.land + 2 + (b.y + 14) * 0.3 * 0 + 6;
  // surface world behind
  for (let x = -40; x <= 40; x++) for (let z = -40; z <= -7; z++) st.add(x, 0, z, 'turf');
  const trees = []; for (let i = 0; i < 70; i++) { const x = Math.round((r() - .5) * 76), z = Math.round(-10 - r() * 28); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || Math.abs(x) < 6) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  const rub = ['plank', 'slate', 'leaf', 'float', 'log', 'buzz']; for (let i = 0; i < 40; i++) st.add(Math.round(-14 + r() * 10), 1, Math.round(-12 - r() * 6), rub[i % rub.length]);
  // plug (placed in hole top), furniture
  const fur = new VSet(g, true);
  for (const x of [6, 7]) for (let z = -5; z <= -2; z++) fur.add(x, -13, z, 'buzz', { t0: E.plug + (x - 6) * 0.5 + (z + 5) * 0.12, t1: E.burst, fly: [(x - 6.5) * 4, 8, 3], spin: [5, 6, 7], floor: -60 });
  const furn = [[-11, -12, 'jam', 81], [-10, -12, 'jam', 1], [-6, -12, 'plank', 2], [-5, -12, 'plank', 2], [-3, -12, 'log', 3], [-3, -11, 'log', 3], [-3, -10, 'log', 3], [-11, -16, 'polka', 4], [-10, -16, 'polka', 4], [-9, -16, 'polka', 4], [10, -12, 'castle', 5], [11, -12, 'castle', 5]];
  furn.forEach(([x, y, ty, k], i) => fur.add(x, y, -4, ty, { t0: E.furnish + 1 + i * 1.6, t1: y > -13 ? lvT(y) + 1.2 : lvT(y) + 2, fly: [0, 1.4, 1.8], spin: [0.3, 0.2, 0.4], floor: -60 }));
  for (let x = 3; x <= 11; x++) fur.add(x, -9, -4, 'log', { t0: E.plumb + (x - 3) * 0.9 });
  fur.add(4, -11, -4, 'castle', { t0: E.plumbEnd - 1 });
  st.build(); dy.build(); fur.build();
  const torches = [[-8, -10], [-4, -10], [5, -10], [9, -10], [-8, -15], [0.5, -6]].map(([x, y], i) => { const t = box(0.2, 0.5, 0.2, 0, x, y, -2.2, g, new THREE.MeshBasicMaterial({ color: '#ffcf5a' })); const l = i < 4 ? new THREE.PointLight('#ffb35c', 0, 11, 1.5) : null; if (l) { l.position.set(x, y, -1); g.add(l); } return { t, l, i }; });
  const painting = box(1.6, 1.0, 0.1, 0, -7, -10, -5.4, g, new THREE.MeshBasicMaterial({ map: ctex(16, gg => { gg.fillStyle = '#5db8ff'; gg.fillRect(0, 0, 16, 16); gg.fillStyle = '#e0a95a'; gg.fillRect(3, 7, 10, 2); gg.fillStyle = '#5ff7ff'; gg.fillRect(4, 9, 8, 1); gg.fillStyle = '#ffffff'; gg.fillRect(2, 2, 4, 1); }) }));
  const geyser = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 2.2), MAT.water); g.add(geyser);
  const bloop = mkBurble('#e0577b'); hardHat(bloop.B); g.add(bloop.B.root); const paper = box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root); L.light.intensity = 2;
  for (let k = 0; k < 16; k++) burst(E.dig + k * 1.1, [k < 8 ? 0.5 : (k % 2 ? -6 : 7), k < 8 ? -k * 1.4 : -10.5, -3], { n: 14, colors: ['#8b5a3c', '#6b7390', '#4a506a'], speed: 3, size: 0.15, life: 0.8, grav: 10 });
  for (let k = 0; k < 7; k++) burst(E.hole + k * 1.4, [6.5, -13 - k, -3], { n: 12, colors: ['#3a3550', '#6b7390'], speed: 3, size: 0.14, life: 0.7, grav: 10 });
  burst(E.spring, [6.5, -19, -3], { n: 160, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 9, size: 0.25, life: 1.4, grav: 10, up: 8 });
  burst(E.sneeze, [-7, -14.5, -1.5], { n: 40, colors: ['#ffffff', '#bfe8ff'], speed: 6, size: 0.14, life: 0.8, grav: 2 });
  burst(E.burst, [6.5, -13, -3], { n: 120, colors: ['#bfe8ff', '#5aa8ff', '#ffd400'], speed: 9, size: 0.25, life: 1.4, grav: 8, up: 6 });
  for (let k = 0; k < 10; k++) burst(E.geyser + k * 0.6, [0.5, 2 + k * 1.2, -3], { n: 50, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.3, life: 1.6, grav: 10, up: 6 });
  function update(t) {
    dy.update(t); fur.update(t); const lv = level(t);
    torches.forEach(({ t: m, l, i }) => { m.visible = t > E.furnish + i * 1.2 && lv < m.position.y - 0.3; if (l) l.intensity = m.visible ? 9 + Math.sin(t * 13 + i) * 1.5 : 0; });
    painting.visible = t > 65.6 && t < E.burst + 6;
    geyser.visible = win(t, E.geyser - 0.5, E.land + 3); if (geyser.visible) { const h = 14 * Math.sin(Math.PI * seg(t, E.geyser - 0.5, E.land + 3)); geyser.scale.set(1, Math.max(0.1, h), 1); geyser.position.set(0.5, 0.5 + h / 2, -3); }
    // hero path (z = -3 inside the slab)
    const K = [[0, -6, 0.5, -3], [28, -6, 0.5, -3], [30, 0.5, 0.5, -3], [36, 0.5, -11.5, -3], [42, -6, -11.5, -3], [48, -6, -11.5, -3], [E.furnishEnd, -6, -11.5, -3], [E.tub + 2, 6.5, -11.5, -3], [E.hole, 6.5, -11.5, -3], [E.holeEnd, 6.5, -19.5, -3], [E.spring + 1.5, 6.5, -12.5, -3], [E.spring + 3, 5, -11.5, -3], [E.plug - 0.5, 6.5, -11.5, -3], [E.plugged + 1, 6.5, -11.5, -3], [E.sneeze - 3, -5, -11.5, -3], [E.burst + 4, -2, -11.5, -3], [E.burst + 8, 0.5, -11.5, -3]];
    let w = walker(t, K, 0), p = [...w.p]; const o = { t, yaw: w.yaw, walk: w.walk, phase: w.phase, mallet: true };
    if (win(t, E.dig, 36)) { o.swing = (t * 2.4) % 1; o.yaw = 0; }
    if (win(t, 36, E.digEnd)) { o.swing = (t * 2.4) % 1; }
    if (win(t, E.furnish, E.furnishEnd)) { const a = t * 0.7; p = [-6 + Math.sin(a) * 4, -11.5, -3]; o.yaw = Math.cos(a) > 0 ? Math.PI / 2 : -Math.PI / 2; o.walk = 1; o.phase = t * 10; o.block = 'plank'; o.hold = true; o.mallet = false; }
    if (win(t, E.furnishEnd, E.cozy)) { o.hips = true; o.face = 'smug'; o.yaw = 0; }
    if (win(t, E.cozy, E.plumb)) { p = [-6, -11.5, -3.3]; o.sit = 1; o.face = 'smug'; o.yaw = 0; o.mallet = false; }
    if (win(t, E.hole, E.holeEnd)) { o.swing = (t * 2.4) % 1; o.yaw = 0; o.headPitch = 0.6; }
    if (win(t, E.spring, E.plugged)) { o.panic = true; o.face = 'scared'; }
    if (win(t, E.plug - 0.5, E.plugged)) { o.panic = false; o.block = 'buzz'; o.hold = true; o.swing = (t * 3) % 1; o.mallet = false; }
    if (win(t, E.plugged, E.sneeze)) { o.face = 'smug'; o.hips = t < 177; }
    if (t >= E.sneeze) { o.face = 'scared'; o.panic = t > E.burst; }
    if (t >= E.burst + 8) { const k = seg(t, E.burst + 8, E.geyser); p = [0.5, lerp(-11.5, -0.5, k), -3]; o.walk = 1; o.phase = t * 12; o.panic = true; }
    if (t >= E.geyser) { const k = seg(t, E.geyser, E.land); p = [lerp(0.5, -9, k), lerp(-0.5, 0.8, k) + Math.sin(k * Math.PI) * 15, lerp(-3, -12, k)]; o.spin = k * 10; o.panic = true; o.face = 'scared'; }
    if (t >= E.land) { p = [-9, 1.6, -12]; o.flat = 1 - seg(t, 249, 250.6); o.flatDir = -1; o.spin = 0; o.panic = false; o.face = 'soot'; o.sit = seg(t, 249, 250.6); o.yaw = 0.3; }
    if (t > 256) { o.sit = 0; o.flat = 0; o.p = p = [-7.5, 0.5, -8]; o.yaw = 0.2; o.hips = t > 263; o.face = t > 270 ? 'normal' : 'smug'; }
    if (lv > p[1] - 0.2 && t > E.spring && t < E.geyser) { p[1] = Math.max(p[1], lv - 1.3); o.walk = 1; o.phase = t * 8; }
    o.p = p; pose(hero, o); parentTo(hero.root, g);
    // bloop
    let bp = [-3.5, 0.5, -1.5], by = 0, bo = {};
    if (t > 30) { bp = [-9, -11.5, -3]; by = 0; }
    if (win(t, 32, E.digEnd)) { const a = t * 2; bp = [7 + Math.sin(a) * 3, -11.5, -3]; by = a; bo = { walk: 1, phase: t * 20 }; }
    if (win(t, E.cozy, E.plumb - 4)) { bp = [-9, -11.5, -3.2]; }
    if (win(t, E.plumb - 4, E.burst)) { bp = [3 + Math.min(8, (t - E.plumb) * 0.9 > 0 ? (t - E.plumb) * 0.9 : 0), -11.5, -3]; if (t > E.plumbEnd) bp = [4.5, -11.5, -3]; bo = t < E.plumbEnd ? { walk: 1, phase: t * 12 } : {}; }
    if (t >= E.burst) { bp = [4.5, Math.max(-11.5, lv - 1.1), -3]; bo = { hop: true }; }
    if (t >= E.burst + 8) { const k = seg(t, E.burst + 8, E.geyser); bp = [1.4, lerp(-11.5, -0.8, k), -3.3]; }
    if (t >= E.geyser) { const k = seg(t, E.geyser, E.land); bp = [lerp(1.4, -5.5, k), lerp(-0.5, 0.5, k) + Math.sin(k * Math.PI) * 13, lerp(-3, -10, k)]; }
    if (t >= E.land) { bp = [-5.5, 0.5, -10]; by = 0.4; bo = {}; }
    poseBurble(bloop, t, bp, by, bo); paper.visible = t < 30 || t > E.invoice - 1; if (win(t, E.plumbEnd - 1, E.burst + 20)) bloop.B.aR.rotation.set(-1.4, 0, 0);
    // leggy
    let lp = [-7, -16.5, -3], lyaw = Math.PI / 2;
    if (t < 30) lp = [-11, 0.5, -1.5];
    if (win(t, 30, 50)) lp = [-14, 0.5, -3];
    const lvL = Math.max(-16.5, lv - 1.0); if (t > E.spring) lp[1] = lvL;
    if (t >= E.burst + 8) { const k = seg(t, E.burst + 8, E.geyser); lp = [-1.5, lerp(-13, -1.2, k), -3.3]; }
    if (t >= E.geyser) { const k = seg(t, E.geyser, E.land); lp = [lerp(-1.5, -9, k), lerp(-1, 0.5, k) + Math.sin(k * Math.PI) * 12, lerp(-3, -12, k)]; }
    if (t >= E.land) { lp = [0.5, -0.4 + Math.sin(t * 1.4) * 0.1, -3]; lyaw = 0.8; }
    poseLurk(L, t, lp, lyaw, t > E.spring && t < E.land ? 1 : 0.2); parentTo(L.root, g);
    if (win(t, 80, E.sneeze) && t < E.spring) { L.body.position.y = 0.8; L.legs.forEach(l2 => l2.rotation.x = 0.3); }
    if (win(t, E.sneeze, E.burst)) { L.hd.rotation.x = -0.4 * Math.sin(seg(t, E.sneeze, E.burst - 0.5) * Math.PI / 2) + (t > E.burst - 0.5 ? 0.8 : 0); }
    const C = [[0, -4, 3, 10, -7, 1.2, -3, 50], [13.9, -4, 3, 10, -7, 1.2, -3, 48], [14, 0, 8, 24, 0, 0, -8, 55], [29.9, 6, 8, 22, 0, 0, -8, 55],
      [30, 0, -6, 34, 0, -8, -3, 55], [E.digEnd, 0, -8, 32, 0, -10, -3, 55], [E.digEnd + 0.1, -6, -10, 7, -6, -11, -3, 50], [E.furnishEnd, -5, -10.5, 6.5, -6, -11, -3, 50],
      [72.6, 0, -9, 26, 0, -11, -3, 55], [80.3, 0, -10, 24, 0, -12, -3, 55], [80.4, -6, -10.4, 3, -6, -10.8, -3, 46], [93.3, -5.5, -10.4, 3, -6, -10.8, -3, 44],
      [93.4, -7, -14.6, 3.2, -7, -15.5, -3, 48], [99.9, -7, -14.6, 3.4, -7, -15.5, -3, 48], [100, 0, -11, 18, 0, -12, -3, 55], [106.3, 0, -11, 18, 0, -12, -3, 55],
      [106.4, 6, -10.5, 5, 6, -11, -3, 50], [E.tub + 3.9, 6, -10.5, 5, 6, -11, -3, 50], [E.hole, 6.5, -15, 9, 6.5, -16, -3, 55], [E.spring, 6.5, -17, 9, 6.5, -18, -3, 55],
      [E.spring + 0.01, 3, -15, 18, 3, -16, -3, 58], [163.9, 3, -14, 16, 3, -15, -3, 58], [164, 6.5, -12, 5.5, 6.5, -12.6, -3, 46], [171.5, 6.5, -12, 5.5, 6.5, -12.6, -3, 46],
      [171.6, -7, -14.4, 6, -7, -15.4, -3, 48], [177.5, -7, -14.4, 6, -7, -15.4, -3, 48], [177.6, 0, -11, 18, 0, -12, -3, 55], [183.5, 0, -11, 18, 0, -12, -3, 55],
      [183.6, -6.2, -14.8, 2.6, -7, -15, -3, 42], [E.burst, -6.4, -14.8, 2.2, -7, -15, -3, 38], [E.burst + 0.01, 0, -10, 26, 0, -11, -3, 58], [212.5, 0, -8, 24, 0, -9, -3, 58],
      [212.6, 0.5, -6, 12, 0.5, -6, -3, 55], [E.geyser - 0.1, 0.5, -2, 12, 0.5, -1, -3, 55], [E.geyser, 4, 6, 26, 0, 8, -6, 60], [E.land, 2, 4, 22, -6, 2, -10, 60],
      [E.land + 0.01, -5, 2.8, -3.5, -8.5, 1.4, -12, 46], [250.5, -5, 2.8, -3.5, -8.5, 1.4, -12, 44], [250.6, 4, 10, 18, 0, 0, -6, 55], [262.9, -4, 10, 18, 0, 0, -6, 55],
      [263, -3, 2.5, -2.5, -7.5, 1.5, -8, 46], [276.9, -3, 2.5, -2.8, -7.5, 1.5, -8, 44], [277, -2.4, 2.4, -6.0, -5.5, 1.3, -10, 46], [E.logo, -2.6, 2.4, -6.2, -5.5, 1.3, -10, 44]];
    let cam = camKeys(t, C);
    if (win(t, E.geyser, E.land)) { const hp = hero.root.position; cam = { p: [hp.x + 6, hp.y + 2, hp.z + 14], l: [hp.x, hp.y, hp.z], fov: 58 }; }
    return { cam, hud: true, cave: t > 30 && t < E.geyser && cam.p[1] < -2 };
  }
  return { g, update };
})();
