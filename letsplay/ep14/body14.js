// ================================================================ EPISODE 14: "THE HAUNTED MINE" — night at the old mine → the tunnel (moths, bedsheet ghost) → crystal cavern (Grandma Pebble) → outside again
// --- pebblebacks (from ep13): Grandma Pebble + the baby
function makePebble(s = 1) {
  const root = new THREE.Group(), body = pivot(root, 0, 0.62, 0); root.scale.setScalar(s);
  const rock = new THREE.MeshLambertMaterial({ color: '#8a7a6a' }), plate = new THREE.MeshLambertMaterial({ color: '#6e6050' });
  box(1.1, 0.9, 1.3, 0, 0, 0, 0, body, rock); for (let i = 0; i < 3; i++) box(1.16, 0.16, 0.24, 0, 0, 0.3, -0.45 + i * 0.45, body, plate);
  const hd = pivot(body, 0, -0.05, 0.7); box(0.5, 0.42, 0.36, '#a8988a', 0, 0, 0.12, hd); for (const x of [-0.13, 0.13]) box(0.08, 0.1, 0.03, '#111', x, 0.08, 0.31, hd);
  for (const [x, z] of [[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]]) box(0.2, 0.3, 0.2, '#6e6050', x, -0.5, z, body);
  const lids = [-0.13, 0.13].map(x => box(0.1, 0.12, 0.04, '#a8988a', x, 0.08, 0.325, hd)), mouth = box(0.24, 0.14, 0.03, '#3a1010', 0, -0.1, 0.31, hd);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hd, lids, mouth };
}
const gran = makePebble(3.2), baby = makePebble(0.55); baby.lids.forEach(l => l.visible = false); baby.mouth.visible = false;
function posePeb(p, t, pos, yaw, o = {}) { p.root.position.set(...pos); p.root.rotation.set(0, yaw, 0); const br = o.sleep ? Math.sin(t * 1.6) * 0.06 : 0; p.body.scale.set(1 + br, 1 + br, 1); p.body.rotation.x = o.walk ? Math.sin(t * 9) * 0.06 : 0;
  p.hd.rotation.set(o.sleep ? 0.35 : (o.yawn ? -0.5 : Math.sin(t * 1.1) * 0.08), o.nuzzle ? Math.sin(t * 3) * 0.3 : 0, 0); p.lids.forEach(l => l.visible = !!o.sleep); p.mouth.visible = !!o.yawn; p.mouth.scale.y = o.yawn ? 1.6 : 1; }
// --- lantern moths
function makeMoth() { const g = new THREE.Group(), wm = new THREE.MeshBasicMaterial({ color: '#ffe27a' }); box(0.08, 0.08, 0.22, '#5a4a30', 0, 0, 0, g);
  const w = [-1, 1].map(s => { const p = pivot(g, s * 0.04, 0, 0); box(0.28, 0.02, 0.2, 0, s * 0.14, 0, 0, p, wm); return p; }); return { g, w }; }
const moths = Array.from({ length: 24 }, makeMoth), mothLight = new THREE.PointLight('#ffd060', 0, 12, 1.4);
function placeMoths(g, t, c, rad, on) { parentTo(mothLight, g); mothLight.position.set(...c); mothLight.intensity = on ? 5 : 0;
  moths.forEach((m, i) => { parentTo(m.g, g); m.g.visible = on; if (!on) return; const a = t * (0.8 + (i % 5) * 0.15) + i * 2.4, r = rad * (0.5 + (i % 4) * 0.18);
    m.g.position.set(c[0] + Math.cos(a) * r, c[1] + Math.sin(t * 2 + i) * rad * 0.35, c[2] + Math.sin(a) * r * 0.8); m.g.rotation.y = -a; m.w[0].rotation.z = Math.sin(t * 30 + i) * 0.8; m.w[1].rotation.z = -m.w[0].rotation.z; }); }
// --- props
const cart = new THREE.Group(); box(1.3, 0.8, 1.7, '#5a5a66', 0, 0.85, 0, cart); box(1.4, 0.12, 1.8, '#3a3a44', 0, 1.3, 0, cart); for (const [x, z] of [[-0.5, 0.6], [0.5, 0.6], [-0.5, -0.6], [0.5, -0.6]]) box(0.2, 0.36, 0.36, '#222', x, 0.36, z, cart);
const sheet = new THREE.Group(); box(1.9, 4.2, 1.9, '#f4f4f4', 0, 0, 0, sheet); for (let i = 0; i < 5; i++) box(0.36, 0.3, 1.94, '#e6e6e6', -0.76 + i * 0.38, -2.2, 0, sheet); for (const x of [-0.4, 0.4]) box(0.3, 0.42, 0.04, '#111', x, 1.3, 0.96, sheet);
const detector = new THREE.Group(); box(0.5, 0.4, 0.3, '#c0c0c8', 0, 0, 0, detector); box(0.04, 0.5, 0.04, '#555', 0.15, 0.45, 0, detector); box(0.1, 0.1, 0.1, '#ff2a3a', 0.15, 0.72, 0, detector); const needle = pivot(detector, 0, -0.08, 0.16); box(0.03, 0.22, 0.02, '#ff2a3a', 0, 0.11, 0, needle);
const torch = new THREE.Group(); box(0.24, 0.16, 0.16, '#333', 0, 0, 0, torch); const beam = new THREE.Mesh(new THREE.ConeGeometry(1.1, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4a0', transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }));
beam.rotation.x = -Math.PI / 2; beam.position.set(0, 0, 3.1); torch.add(beam); rival.hd.add(torch); torch.position.set(0, 0.62, 0.3);
function signTex(a, b, bg) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#3a2210'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 120);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#2a1a0a'; x.font = 'bold 38px "DejaVu Sans", sans-serif'; x.fillText(a, 128, 46); x.font = 'bold 22px "DejaVu Sans", sans-serif'; x.fillText(b, 128, 92); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
// Ghost-o-meter reading (0..1) + label
const ghostV = t => { const n = Math.sin(t * 13) * 0.04; if (t < 67) return 0.12 + n; if (t < 72) return 0.3 + Math.sin(t * 20) * 0.1; if (t < 86) return 0.62 + n; if (t < 98) return 0.96 + n * 0.5; if (t < 110) return 0.3 + n;
  if (t < E.reveal) return 1; if (t < E.moan2) return 0.05; if (t < E.grandma) return lerp(0.5, 0.9, seg(t, E.moan2, E.grandma)) + n; return 0.9 + n * 0.5; };
const ghostL = t => t > E.reveal && t < E.moan2 ? 'GOOSE' : t > 197 ? 'GRANDMA' : null;

// ---------------------------------------------------------------- set A: outside the old mine (night)
const mineOut = (() => {
  const g = mk('mineOut'), st = new VSet(g), r = rng(1401);
  for (let x = -40; x <= 40; x++) for (let z = -6; z <= 26; z++) st.add(x, 0, z, Math.abs(x) <= 1 && z < 12 ? 'path' : 'turf');
  for (let x = -40; x <= 40; x++) for (let z = -7; z >= -34; z--) { const h = Math.min(16, Math.round(5 + (-7 - z) * 0.8 + vnoise(x * 0.2, z * 0.2, 3) * 2 - Math.max(0, Math.abs(x) - 18) * 0.4)); const tun = Math.abs(x) <= 2 && z >= -13;
    for (let y = (z === -7 ? 1 : Math.max(1, h - 1)); y <= h; y++) { if (tun && y <= 4) continue; st.add(x, y, z, y === h ? 'turf' : (z === -7 ? 'stone' : 'soil')); } }
  for (let z = -8; z >= -13; z--) for (let y = 1; y <= 5; y++) { st.add(-3, y, z, 'stone'); st.add(3, y, z, 'stone'); } for (let x = -2; x <= 2; x++) { for (let z = -8; z >= -13; z--) st.add(x, 5, z, 'stone'); for (let y = 1; y <= 4; y++) st.add(x, y, -14, 'dark'); }
  const trees = [[-9, 1]]; tree(st, -9, 0, 1, r, 4); for (let i = 0; i < 40; i++) { const x = Math.round((r() - .5) * 76), z = Math.round(-4 + r() * 28); if (Math.abs(x) < 9 && z < 18) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const frame = new THREE.Group(); g.add(frame); for (const x of [-2.6, 2.6]) box(0.5, 4.4, 0.5, 0, x, 2.7, -6.4, frame, MAT.plank); box(6.2, 0.5, 0.6, 0, 0, 4.9, -6.4, frame, MAT.plank);
  for (const x of [-0.5, 0.5]) box(0.12, 0.1, 26, '#8a8a96', x, 0.56, -1, g); for (let z = -13; z < 12; z += 1.4) box(1.4, 0.06, 0.3, 0, 0, 0.53, z, g, MAT.plank);
  const lampM = new THREE.MeshBasicMaterial({ color: '#ffc060' }); for (const x of [-3.2, 3.2]) box(0.3, 0.4, 0.3, 0, x, 3.6, -6.0, g, lampM); const lamp = new THREE.PointLight('#ffa040', 10, 16, 1.4); lamp.position.set(0, 3.4, -4.6); g.add(lamp);
  const sign = new THREE.Group(); sign.position.set(4.6, 0.5, -4.4); sign.rotation.y = -0.3; g.add(sign); box(0.16, 1.8, 0.16, '#6a4a2a', 0, 0.9, 0, sign);
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.08), new THREE.MeshLambertMaterial({ map: signTex('HAUNTED!', 'keep out. boo.', '#d8c8a0') })), s2 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.08), new THREE.MeshLambertMaterial({ map: signTex('NOT HAUNTED', 'grandma lives here', '#bfe8a0') }));
  for (const s of [s1, s2]) { s.position.y = 2.1; sign.add(s); }
  const bell = box(0.3, 0.3, 0.2, '#ffd23f', -3.2, 2.2, -6.0, g);
  const bush = new THREE.Group(); bush.position.set(7, 0.5, 13); g.add(bush); for (let i = 0; i < 6; i++) box(1.2, 1.1, 1.2, 0, Math.cos(i) * 0.8, 0.6 + (i % 2) * 0.5, Math.sin(i * 1.3) * 0.7, bush, MAT.leaf);
  burst(E.crashOut + 1.4, [7, 1.4, 13], { n: 90, colors: ['#3f8f3a', '#5fb04a', '#2c6a2a'], speed: 6, size: 0.25, life: 1.4, grav: 7, up: 4 });
  burst(E.crashOut + 0.2, [0, 1, 10.6], { n: 50, colors: ['#9a9490', '#c8c2be'], speed: 5, size: 0.3, life: 1, grav: 6, up: 2 });
  burst(E.sign2 + 3, [4.6, 2.6, -4.2], { n: 60, colors: ['#ffe066', '#ffffff', '#7cff6b'], speed: 4, size: 0.15, life: 1.2, grav: 3, up: 2 });
  for (let k = 0; k < 8; k++) burst(E.party + 5 + k * 0.6, [Math.sin(k) * 4, 7, -2 + Math.cos(k) * 3], { n: 30, colors: ['#ffe27a', '#ffd060', '#fff4c0'], speed: 3, size: 0.12, life: 1.6, grav: 1, up: 1 });
  for (let t = E.detector; t < E.detEnd; t += 0.8) burst(t, [3, 1.2, 7.2], { n: 6, colors: ['#ffe066', '#c0c0c8'], speed: 3, size: 0.12, life: 0.5, grav: 6, up: 2 });
  const C1 = [[0, 0, 7, 26, 0, 4, -8, 55], [5.9, 0, 5, 20, 0, 3.5, -8, 52], [6.0, 7.6, 2.4, -0.4, 4.6, 2.4, -4.4, 44], [10.9, 7.2, 2.4, -0.8, 4.6, 2.4, -4.4, 42], [11.0, 0, 2.6, 6, 0, 2.6, -10, 50], [15.9, 0, 2.6, 2.4, 0, 2.6, -10, 50],
    [16.0, 5.2, 2.8, 8.0, 5.5, 2.3, 2.5, 44], [27.9, 4.8, 2.8, 7.4, 5.5, 2.3, 2.5, 42], [28.0, 0.6, 2.2, 10.4, 3, 1.3, 6.6, 44], [39.9, 0.8, 2.0, 9.8, 3, 1.3, 6.6, 42],
    [40.0, -3.2, 3.2, 12, -9, 2, 3, 50], [45.9, -3.8, 3.0, 11, -9, 2, 3, 48], [46.0, 0, 3, 13, 0, 2, -6, 50], [51.9, 0, 2.6, 9.4, 0, 2, -6, 50]];
  const C2 = [[E.outside, -4, 3, -4.5, -10, 2, -1.2, 48], [235.9, -4.4, 3, -5, -10, 2, -1.2, 48], [E.crashOut, 9, 3.4, 4, 2, 1.4, 6, 52], [239.9, 10, 3.4, 5, 5, 1.4, 11, 52],
    [240.0, 1, 2.6, 19, 5, 1.6, 12, 46], [247.9, 0.4, 2.6, 19.4, 5, 1.6, 12, 46], [E.sign2, 7.6, 2.4, 0.6, 4.4, 2.2, -4.4, 44], [253.9, 7.2, 2.4, 0.2, 4.4, 2.2, -4.4, 44],
    [254.0, 0.6, 2.8, 0.4, -3, 2.3, -6, 46], [261.9, 0.2, 2.8, 0.8, -3, 2.3, -6, 46], [E.party, 0, 5.4, 18, 0, 2.6, -5, 52], [266.9, 0, 4.6, 14, 0, 2.6, -5, 52],
    [267.0, 10, 2.8, 1.6, 5, 2.0, 1.4, 46], [273.7, 10.4, 2.8, 2.0, 5, 2.0, 1.4, 46], [273.8, 0.6, 3.6, 14, 1, 2, 0, 54], [E.logo, 0.6, 3.6, 13.2, 1, 2, 0, 54]];
  function update(t) {
    hideMisc(); const late = t > E.outside, F = Math.PI;
    s1.visible = !(late && t > E.sign2 + 3); s2.visible = !s1.visible; bell.visible = late && t > E.sign2 + 6;
    // Leggy
    let lp = [-3.5, 0.5, 6.5], ly = F, ls = 0.3; if (t > E.leggyNo) { const k = seg(t, E.leggyNo, E.leggyNo + 2); lp = [lerp(-3.5, -10, k), 0.5, lerp(6.5, -1.4, k)]; ls = k < 1 ? 3 : 0.3; ly = k < 1 ? -2.2 : 0.4; }
    if (late) { lp = [-10, 0.5, -1.4]; ly = 0.4; ls = 0.3; if (t > 240) { const k = seg(t, 240, 243); lp = [lerp(-10, 5.4, k), 0.5, lerp(-1.4, 11, k)]; ly = k < 1 ? 1.0 : 1.4; ls = k < 1 ? 2.4 : 0.3; }
      if (t > E.party + 2) { const k = seg(t, E.party + 2, E.party + 5); lp = [lerp(5.4, 5, k), 0.5, lerp(11, 4.2, k)]; ly = F; ls = k < 1 ? 2 : 0.3; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.root.rotation.set(0, ly, 0); L6.body.rotation.z = 0; if ((t > E.leggyNo + 2 && t < 240) && !(late && t > 240)) L6.root.position.x += Math.sin(t * 40) * 0.05;
    // hero + crew
    const out = late && t > 244; const ek = seg(t, 244, 248);
    let hp = [0, 0.5, 5], hy = F, ho = { face: 'normal' }; if (t > E.sign && t < E.stream) ho.face = 'scared';
    if (late) { hp = out ? [0, 0.5, lerp(-11, 4, ek)] : [0, 0.5, -30]; hy = 0; ho = { walk: ek < 1 ? 1 : 0, phase: t * 9, face: 'smug' };
      if (t > E.sign2 - 1) { const k = seg(t, E.sign2 - 1, E.sign2 + 1); hp = [lerp(0, 3.6, k), 0.5, lerp(4, -3.0, k)]; hy = k < 1 ? 2.6 : -2.9; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'smug', hold: t > E.sign2 + 1 && t < E.sign2 + 3 }; }
      if (t > E.party - 2) { const k = seg(t, E.party - 2, E.party); hp = [lerp(3.6, 0, k), 0.5, lerp(-3, 5, k)]; hy = k < 1 ? 0.2 : 0; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'smug', wave: t > 273.8 && t < 279 }; } }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); hero.root.visible = hp[2] > -20;
    let bp = [-1.8, 0.5, 5.4], by = F, bo = {}; if (t > E.detector && t < E.detEnd) { bp = [3, 0.5, 6.6]; by = 0.3; bo = { hop: true }; } else if (t > E.detEnd && !late) { bp = [2.2, 0.5, 5.6]; by = F; }
    if (late) { bp = out ? [-1.8, 0.5, lerp(-12, 4.4, ek)] : [0, 0.5, -30]; by = 0; bo = { walk: ek < 1 ? 1 : 0, phase: t * 8 };
      if (t > 254) { const k = seg(t, 254, 256); bp = [lerp(-1.8, -3.2, k), 0.5, lerp(4.4, -4.8, k)]; by = k < 1 ? F - 0.2 : F; bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; }
      if (t > E.party - 2) { bp = [-2.2, 0.5, 5]; by = 0; bo = { hop: t > 273.8 }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = bp[2] > -20; bHat.visible = true; bHat.position.y = 1.2;
    if (late && win(t, 256, E.party - 2)) bloop6.B.aR.rotation.set(-2.6 + Math.sin(t * 6) * 0.2, 0, 0);
    parentTo(detector, g); detector.visible = t > E.detector + 4 && bloop6.B.root.visible && !(late && t > 254); detector.position.set(...rideOn(bp, by, 0.55, 1.0)); detector.rotation.y = by; needle.rotation.z = lerp(0.9, -0.9, clamp(ghostV(t), 0, 1));
    let mp = [-0.9, 0.5, 4.4], mo = {}; if (late) { mp = out ? [1.2, 0.5, lerp(-10, 5.6, ek)] : [0, 0.5, -30]; mo = { hop: true }; }
    poseMuffin(muffin, t, mp, late ? 0 : F, mo); parentTo(muffin.root, g); muffin.root.visible = mp[2] > -20;
    const pp = late ? (out ? [0.6, 3.2, lerp(-11, 4.6, ek)] : [0, 2, -30]) : [1.0, 2.6, 5.2]; poseMag(puff, t, pp, late ? 0 : F); parentTo(puff.root, g); puff.root.visible = pp[2] > -20; puff.light.intensity = 4;
    // goose + bot come out with the crew
    let gp = late && out ? [-4.4, 0.5, lerp(-13, 3.6, ek)] : [0, 0.5, -40]; parentTo(bot.root, g); bot.root.visible = gp[2] > -20; poseBot(bot, t, gp, 0.3, { roll: ek < 1 ? 1 : 0, off: true });
    parentTo(goose.root, g); goose.root.visible = bot.root.visible; goose.root.position.set(gp[0], gp[1] + 2.7, gp[2]); goose.root.rotation.y = 0.3; goose.neck.rotation.x = Math.sin(t * 6) * 0.25;
    // Prestin: live ghost hunt at the start, then cart → bush
    parentTo(rival.root, g); rival.root.visible = true; torch.visible = !late; rival.root.rotation.set(0, 0, 0);
    if (!late) poseRival(rival, t, [5.6, 0.5, 2.4], t < E.leggyNo ? 0.2 : -2.8, { point: win(t, 22, 27), hips: t > E.detector });
    parentTo(cart, g); cart.visible = late && t > E.crashOut - 1;
    if (late) { const k = seg(t, E.crashOut - 1, E.crashOut + 0.2); cart.position.set(0, 0, lerp(-12, 10.6, k)); cart.rotation.set(t > E.crashOut + 0.2 ? 0.3 : 0, 0, 0);
      if (t < E.crashOut + 0.2) { poseRival(rival, t, [cart.position.x, 0.9, cart.position.z], 0, { panic: true }); rival.root.visible = t > E.crashOut - 1; }
      else { const f = seg(t, E.crashOut + 0.2, E.crashOut + 1.4); const p = [lerp(0, 7, f), 0.9 + Math.sin(f * Math.PI) * 5 + f * 1.6, lerp(10.6, 13, f)]; poseRival(rival, t, p, 0, { panic: true }); if (f >= 1) { rival.root.rotation.set(0, 0, Math.PI); rival.root.position.set(7, 3.6, 13); rival.lL.rotation.x = Math.sin(t * 8) * 0.4; rival.lR.rotation.x = -rival.lL.rotation.x; } } }
    // grandma + baby come out for the finale
    parentTo(gran.root, g); gran.root.visible = late && t > E.party; const gk = seg(t, E.party, E.party + 4); posePeb(gran, t, [5, 0.5, lerp(-13, -1.6, gk)], 0, { walk: gk < 1 });
    parentTo(baby.root, g); baby.root.visible = gran.root.visible; posePeb(baby, t, [2.6, 0.5 + (t > E.party + 4 ? Math.abs(Math.sin(t * 6)) * 0.3 : 0), lerp(-12, 0.6, gk)], 0.3, { walk: gk < 1 });
    placeMoths(g, t, [1, 6.5 + Math.sin(t) * 0.5, -1], 5, late && t > E.party + 1);
    let cam = camKeys(t, late ? C2 : C1);
    if (late && t >= E.crashOut - 1 && t < E.crashOut + 0.2) cam = { p: [5, 2.6, 13], l: [cart.position.x, 1.4, cart.position.z], fov: 50 };
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the tunnel + crystal cavern (dark)
const mine = (() => {
  const g = mk('mine'), st = new VSet(g), CX = 77;
  for (let x = -12; x < 61; x++) { for (let z = -3; z <= 3; z++) { st.add(x, 0, z, 'stone'); st.add(x, 6, z, 'dark'); } st.add(x, 6, -4, 'dark'); st.add(x, 6, 4, 'dark');
    for (let y = 1; y <= 5; y++) for (const z of [-4, 4]) st.add(x, y, z, hash2(x, y * 7 + z, 14) < 0.06 ? 'ore' : 'stone');
    if (x % 8 === 0) { for (let y = 1; y <= 4; y++) { st.add(x, y, -3, 'plank'); st.add(x, y, 3, 'plank'); } for (let z = -3; z <= 3; z++) st.add(x, 5, z, 'plank'); } }
  for (let x = 61; x <= 94; x++) for (let z = -18; z <= 18; z++) { const d = Math.hypot((x - CX) / 16, z / 16); if (d > 1.12) continue; st.add(x, 0, z, 'stone'); st.add(x, 14, z, 'dark');
    if (d > 0.98) for (let y = 1; y <= 13; y++) { if (x < 66 && Math.abs(z) <= 3 && y <= 5) continue; st.add(x, y, z, hash2(x, y + z * 3, 9) < 0.08 ? 'ore' : 'stone'); } }
  st.build();
  for (const z of [-0.5, 0.5]) box(84, 0.1, 0.12, '#8a8a96', 30, 0.56, z, g); for (let x = -12; x < 70; x += 1.4) box(0.3, 0.06, 1.4, 0, x, 0.53, 0, g, MAT.plank);
  const lampM = new THREE.MeshBasicMaterial({ color: '#ffc060' }); for (const x of [-4, 10, 24, 38, 52]) { box(0.3, 0.4, 0.3, 0, x, 4.2, -3.3, g, lampM); const l = new THREE.PointLight('#ffa040', 6, 15, 1.4); l.position.set(x, 4, -2.6); g.add(l); }
  const cryM = [new THREE.MeshBasicMaterial({ color: '#7af0ff' }), new THREE.MeshBasicMaterial({ color: '#c07aff' })], r = rng(1402);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.3, x = CX + Math.cos(a) * 13, z = Math.sin(a) * 13; if (x < 66) continue; for (let k = 0; k < 3; k++) { const h = 1 + r() * 2.4, m = box(0.5, h, 0.5, 0, x + (r() - .5) * 1.4, 0.5 + h / 2, z + (r() - .5) * 1.4, g, cryM[i % 2]); m.rotation.set((r() - .5) * 0.5, 0, (r() - .5) * 0.5); } }
  for (const [x, z, c] of [[70, -9, '#7af0ff'], [86, 8, '#c07aff'], [69, 4, '#ffd8a0']]) { const l = new THREE.PointLight(c, 10, 30, 1.2); l.position.set(x, 6, z); g.add(l); }
  smoke(E.cavern, E.cartRide + 10, 0.6, t => [CX + Math.sin(t * 3) * 12, 1.5, Math.cos(t * 2) * 12], { n: 2, size: 0.12, life: 2, up: 0.8, grav: -0.4, colors: ['#7af0ff', '#c07aff', '#ffffff'] });
  burst(E.grab + 0.4, [17.6, 2.6, 0.4], { n: 40, colors: ['#ffffff', '#e6e6e6'], speed: 4, size: 0.2, life: 1, grav: 5, up: 2 });
  burst(E.reveal + 0.3, [19.2, 4, 0], { n: 30, colors: ['#ffffff', '#f0f0f0'], speed: 3, size: 0.2, life: 1, grav: 3, up: 2 });
  burst(E.roar, [74, 2.4, 0], { n: 60, colors: ['#c8c2be', '#9a9490'], speed: 6, size: 0.25, life: 1.2, grav: 2, up: 1 });
  const HX = [[E.enter, -11], [71.5, 8], [86, 8], [96, 10], [108, 15], [E.run, 15], [117, 3], [126, 3], [129, 13], [E.deeper, 13], [E.cavern, 60], [E.grandma, 64]];
  const MX = [[E.enter, -10], [71.5, 9], [86, 9], [96, 11], [108, 16], [119, 16], [E.grab, 18.1], [E.reveal, 16.8], [130, 16.8], [132, 14], [E.deeper, 14], [E.cavern, 61], [E.grandma, 65]];
  const MZ = [[119, 2.4], [E.grab, 0.9], [130, 0.9], [132, 2.4]];
  const GX = [[E.sheet - 2, 27], [E.grab, 19.2], [E.deeper, 19.2], [E.deeper + 2, 17], [E.cavern, 57], [E.grandma, 61]];
  const CRX = [[72, 10], [74, 13], [80, 60], [E.cartRide + 0.6, 60], [E.cartRide + 2, 54], [E.outside - 2, -14]];
  const PRX = [[E.prestinIn, 50], [215, 67], [E.roar + 0.4, 67], [E.cartRide + 0.4, 60]], PRZ = [[E.roar + 0.4, -4], [E.cartRide + 0.4, 0]];
  smoke(E.cartRide + 0.6, E.outside, 0.08, t => [lerpK(CRX, t) + 1, 0.6, 0], { n: 3, size: 0.2, life: 0.6, colors: ['#ffd060', '#ff8a2a'] });
  function update(t) {
    hideMisc(); L6.root.visible = false; const run = win(t, E.run, 117.2);
    // hero
    const hx = lerpK(HX, t), hw = moving(HX, t); let hy = run ? -Math.PI / 2 : Math.PI / 2, hz = 1.6, face = run || win(t, 72, 82) || win(t, 86, 98) || win(t, E.sheet, E.reveal) ? 'scared' : 'normal';
    if (t > E.reveal && t < E.moan2) face = 'smug'; if (t > E.grandma && t < E.wake + 4) face = 'scared'; if (t > E.babyIn) face = 'smug';
    if (t > E.grandma) { hz = 2; hy = Math.PI / 2 - 0.2; }
    pose(hero, { t, p: [hx, 0.5, hz], yaw: hy, walk: hw ? 1 : 0, phase: t * (run ? 14 : 9), face, panic: run || win(t, E.roar, E.roar + 3) }); parentTo(hero.root, g); hero.root.visible = true;
    if (win(t, 117.2, 126)) hero.root.rotation.y = Math.PI / 2;
    // bloop + detector
    const bx = t > E.grandma ? 63 : hx - 1.3, bz = t > E.grandma ? -1 : -1.6, by = run ? -Math.PI / 2 : Math.PI / 2;
    poseBurble(bloop6, t, [bx, 0.5, bz], by, hw ? { walk: 1, phase: t * (run ? 14 : 8) } : { angry: win(t, E.roar, E.roar + 3) }); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2;
    parentTo(detector, g); detector.visible = !run; detector.position.set(...rideOn([bx, 0.5, bz], by, 0.55, 1.0)); detector.rotation.y = by; needle.rotation.z = lerp(0.9, -0.9, clamp(ghostV(t), 0, 1)) + (win(t, E.sheet, E.reveal) ? Math.sin(t * 40) * 0.2 : 0);
    // muffin (fears nothing)
    const mx = lerpK(MX, t), mz = t > E.grandma ? 3.4 : lerpK(MZ, t); poseMuffin(muffin, t, [mx, 0.5, mz], t > E.reveal && t < 132 ? -Math.PI / 2 : Math.PI / 2, { hop: moving(MX, t) || t > E.babyIn && t < E.prestinIn }); parentTo(muffin.root, g); muffin.root.visible = true;
    // puff = lantern
    const pp = t > E.grandma ? [64, 3.2, 0.6] : [hx - 0.4, 3.0, 0.4]; poseMag(puff, t, pp, hy); parentTo(puff.root, g); puff.root.visible = true; puff.light.intensity = 9; puff.light.distance = 14;
    // the bedsheet ghost = goose on Bonk-bot
    const gx = lerpK(GX, t), gvis = t > E.sheet - 2, gyaw = t < E.deeper ? -Math.PI / 2 : Math.PI / 2;
    parentTo(bot.root, g); bot.root.visible = gvis; poseBot(bot, t, [gx, 0.5, t > E.grandma ? 4 : 0], gyaw, { roll: moving(GX, t) ? 1 : 0, off: true });
    parentTo(goose.root, g); goose.root.visible = gvis; goose.root.position.set(gx, 3.2, t > E.grandma ? 4 : 0); goose.root.rotation.y = gyaw; goose.neck.rotation.x = win(t, E.reveal, E.reveal + 3) || win(t, E.moan2 + 5, E.moan2 + 8) ? Math.sin(t * 16) * 0.5 : Math.sin(t * 5) * 0.2;
    parentTo(sheet, g); sheet.visible = gvis; sheet.rotation.set(0, -Math.PI / 2, 0); sheet.scale.set(1, 1, 1);
    if (t < E.grab) sheet.position.set(gx, 2.6 + Math.sin(t * 3) * 0.1, 0); else if (t < E.reveal) { const k = seg(t, E.grab, E.reveal); sheet.position.set(lerp(19.2, 17.0, k), lerp(2.6, 1.6, k), lerp(0, 0.6, k)); sheet.rotation.z = k * 0.6; }
    else { sheet.position.set(16.2, 0.62, 0.8); sheet.rotation.set(Math.PI / 2, -Math.PI / 2, 0); sheet.scale.set(1, 1, 0.08); }
    // cart (rolls by itself… pushed by the goose) + Prestin's ride
    parentTo(cart, g); cart.visible = true; const cx = lerpK(CRX, t); cart.position.set(cx, 0, 0); cart.rotation.set(0, Math.PI / 2, 0);
    // Prestin sneaks in
    parentTo(rival.root, g); rival.root.visible = t > E.prestinIn && t < E.outside; torch.visible = t < E.roar + 0.4; rival.root.rotation.set(0, 0, 0);
    if (t > E.cartRide + 0.4) poseRival(rival, t, [cx, 0.9, 0], -Math.PI / 2, { panic: true });
    else { const px = lerpK(PRX, t), pz = lerpK(PRZ, t), w = moving(PRX, t); poseRival(rival, t, [px, 0.5, pz], t > E.roar + 0.4 ? -Math.PI / 2 - 0.4 : Math.PI / 2 + 0.25, w ? { walk: 1, phase: t * (t > E.roar ? 14 : 7), panic: t > E.roar } : { panic: win(t, E.roar, E.roar + 3) }); }
    // Grandma Pebble + baby
    parentTo(gran.root, g); gran.root.visible = true; posePeb(gran, t, [CX + 1, 0.5, 0], -Math.PI / 2, { sleep: t < E.wake, yawn: win(t, E.roar - 0.4, E.roar + 2.6), nuzzle: win(t, 204, E.prestinIn) });
    parentTo(baby.root, g); baby.root.visible = t > E.babyIn; const bk = seg(t, E.babyIn, E.babyIn + 4); posePeb(baby, t, [lerp(88, 73.6, bk), 0.5, lerp(10, 3.0, bk)], bk < 1 ? -2.4 : -0.6, { walk: bk < 1 });
    // lantern moths: ahead in the tunnel, then around the party, then in the cavern
    let mc = [30, 3, 0], mon = t > E.moths && t < E.sheet - 1; if (t < E.mothsOk) mc = [lerp(32, 14, seg(t, E.moths, E.moths + 8)), 3.2, 0]; else if (t < E.sheet) mc = [hx + 1, 3.0, 0];
    if (t > E.cavern) { mon = true; mc = [CX - 2, 7, 0]; } placeMoths(g, t, mc, t > E.cavern ? 9 : 2.6, mon);
    // cameras
    let cam;
    if (t < 60) cam = { p: [hx + 6, 2.6, -2.6], l: [hx, 1.6, 0.8], fov: 50 };
    else if (t < 72) cam = { p: [hx + 4, 3.2, -2.8], l: [hx - 2, 2, 1], fov: 50 };
    else if (t < 78) cam = { p: [6, 2.4, -2.8], l: [cx, 1, 0], fov: 50 };
    else if (t < 86) cam = { p: [hx + 3.6, 2.4, -1.4], l: [hx, 2, 1.5], fov: 50 };
    else if (t < 103) cam = { p: [hx + 2, 1.5, -3.1], l: [hx + 8, 2.8, 0.5], fov: 54 };
    else if (t < E.sheet) cam = { p: [mx + 2.6, 1.3, mz - 1.8], l: [mx, 0.8, mz], fov: 46 };
    else if (t < E.run) cam = { p: [14, 2.2, -2.6], l: [22, 2.6, 0], fov: 50 };
    else if (t < 119) cam = { p: [0, 2.6, -2.4], l: [10, 2, 0.5], fov: 50 };
    else if (t < E.reveal) cam = { p: [17.2, 2.0, -3.1], l: [18.4, 1.6, 0.8], fov: 50 };
    else if (t < E.confess) cam = { p: [14.6, 2.6, 2.8], l: [19, 2.6, 0], fov: 50 };
    else if (t < E.moan2) cam = { p: [9.6, 2.6, -3], l: [15, 2, 0.5], fov: 50 };
    else if (t < E.deeper) cam = { p: [hx + 4, 2.2, -2.8], l: [hx, 2, 1], fov: 50 };
    else if (t < E.cavern) cam = { p: [Math.min(hx + 6, 58), 3, -2.6], l: [hx, 1.8, 0.5], fov: 50 };
    else if (t < E.grandma) cam = { p: [66, 5, -8], l: [80, 3, 6], fov: 56 };
    else if (t < E.wake) cam = { p: [69, 3.4, 8], l: [78, 2.6, 0], fov: 50 };
    else if (t < E.babyIn) cam = { p: [69, 2.8, 2.6], l: [75, 2.4, 0], fov: 46 };
    else if (t < E.prestinIn) cam = { p: [70, 2.6, 9], l: [74, 1, 2], fov: 46 };
    else if (t < E.roar) { const px = lerpK(PRX, t); cam = { p: [px - 4, 2.6, -7], l: [px + 2, 2, -3], fov: 50 }; }
    else if (t < E.cartRide) cam = { p: [64, 3, 3], l: [72, 2.4, -2], fov: 52 };
    else cam = { p: [Math.min(cx + 5, 66), 2.2, -2.6], l: [cx, 1.6, 0], fov: 50 };
    return { cam, hud: true, cave: true };
  }
  return { g, update };
})();
