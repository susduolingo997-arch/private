// ================================================================ EPISODE 15: "THE TALENT SHOW" — sunny farmyard rehearsal (Groove Chip) → village stage at dusk/night (acts, turbo Bonk-bot, Leggy's tap dance) → the house comes down
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function signTex(a, b, bg) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#3a2210'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 120);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#2a1a0a'; x.font = 'bold 36px "DejaVu Sans", sans-serif'; x.fillText(a, 128, 46); x.font = 'bold 20px "DejaVu Sans", sans-serif'; x.fillText(b, 128, 92); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
// --- Madame Clapperclam (the judge): a big pink clam with eye stalks and score paddles
const scoreM = {}; for (const s of ['7', '10', '?']) scoreM[s] = new THREE.MeshBasicMaterial({ map: labelTex(s, '#ffffff', '#e8344e', s === '10' ? 60 : 72) });
function makeClam() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), shellM = new THREE.MeshLambertMaterial({ color: '#ff9ab8' }), ribM = new THREE.MeshLambertMaterial({ color: '#e0708f' });
  box(2.4, 0.5, 1.8, 0, 0, 0.35, 0, body, shellM); for (let i = 0; i < 5; i++) box(0.12, 0.52, 1.84, 0, -0.9 + i * 0.45, 0.35, 0, body, ribM);
  box(2.1, 0.3, 1.5, '#ffe6ee', 0, 0.68, 0.05, body); box(0.5, 0.5, 0.5, 0, 0, 0.95, -0.2, body, new THREE.MeshLambertMaterial({ color: '#f8f4ff', emissive: '#8a80c0', emissiveIntensity: 0.4 }));
  const lid = pivot(body, 0, 0.6, -0.9); box(2.4, 0.45, 1.8, 0, 0, 0.22, 0.9, lid, shellM); for (let i = 0; i < 5; i++) box(0.12, 0.47, 1.84, 0, -0.9 + i * 0.45, 0.22, 0.9, lid, ribM);
  const eyes = [-0.5, 0.5].map(x => { const p = pivot(body, x, 0.8, 0.55); box(0.12, 0.9, 0.12, '#e0708f', 0, 0.45, 0, p); box(0.36, 0.36, 0.36, '#ffffff', 0, 0.95, 0, p); box(0.16, 0.18, 0.06, '#111', 0, 0.95, 0.18, p); return p; });
  const paddles = [-1.45, 1.45].map(x => { const p = pivot(body, x, 0.5, 0.7); box(0.08, 1.0, 0.08, '#8a5a2b', 0, 0.5, 0, p); const c = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.05), scoreM['?']); c.position.y = 1.3; p.add(c); return { p, c }; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, lid, eyes, paddles };
}
function poseClam(c, t, p, yaw, o = {}) { c.root.position.set(...p); c.root.rotation.set(0, yaw, 0); c.lid.rotation.x = o.hide ? 0 : o.clap ? -0.3 - Math.abs(Math.sin(t * 9)) * 0.7 : -0.85 - Math.sin(t * 1.2) * 0.05;
  c.eyes.forEach((e, i) => { e.visible = !o.hide; e.rotation.set(o.shock ? -0.3 : Math.sin(t * 1.7 + i) * 0.15, 0, (i ? -1 : 1) * (o.shock ? 0.4 : 0.1)); e.scale.y = o.shock ? 1.3 : 1; });
  c.paddles.forEach((q, i) => { q.c.material = scoreM[o.score || '?']; q.p.visible = !o.hide; q.p.rotation.set(0, 0, o.score ? (i ? -0.15 : 0.15) : (i ? 0.9 : -0.9)); q.p.position.y = 0.5 + (o.score ? 0.5 + Math.abs(Math.sin(t * 6)) * 0.1 : 0); }); }
const clam = makeClam(); clam.root.scale.setScalar(1.15);
// --- props: groove chip, top hat + flying wig, golden mallet trophy, crowd
const chip = new THREE.Group(); box(0.42, 0.1, 0.32, '#2bd46a', 0, 0, 0, chip); for (let i = 0; i < 4; i++) for (const z of [-0.18, 0.18]) box(0.05, 0.04, 0.06, '#ffd23f', -0.15 + i * 0.1, -0.02, z, chip); const chipLed = box(0.08, 0.08, 0.08, 0, 0.12, 0.08, 0, chip, new THREE.MeshBasicMaterial({ color: '#7cff6b' }));
const topHat = new THREE.Group(); box(0.9, 0.08, 0.9, '#111', 0, 0, 0, topHat); box(0.6, 0.7, 0.6, '#111', 0, 0.38, 0, topHat); box(0.62, 0.12, 0.62, '#e8344e', 0, 0.15, 0, topHat);
const hatStand = new THREE.Group(); box(0.2, 1.0, 0.2, '#c8c8d0', 0, 0.5, 0, hatStand); box(0.8, 0.08, 0.8, '#e8344e', 0, 1.02, 0, hatStand);
const wigFly = new THREE.Group(); box(0.72, 0.2, 0.72, '#ffe066', 0, 0, 0, wigFly); box(0.56, 0.32, 0.62, '#ffd23f', 0.12, 0.2, 0.04, wigFly).rotation.z = -0.35;
const trophy15 = new THREE.Group(); box(0.18, 1.0, 0.18, '#8a5a2b', 0, 0.5, 0, trophy15); box(0.9, 0.55, 0.6, 0, 0, 1.15, 0, trophy15, goldM); box(0.94, 0.12, 0.64, '#ff8a2a', 0, 1.15, 0, trophy15);
const crowd = Array.from({ length: 18 }, () => makeGrumble(0.7)), CROWD = crowd.map((_, i) => { const row = Math.floor(i / 6), col = i % 6; return [-7.5 + col * 3 + (row % 2) * 1.2, 0.5, 10 + row * 2.8]; });
const sitter = makeGrumble(1.1);
// --- the applause-o-meter (0..1) + its label
const applause = t => { const n = Math.sin(t * 11) * 0.03; if (t < E.prestin) return 0.04; if (t < E.wig) return 0.22 + n; if (t < E.sitAct) return 0.72 + n; if (t < E.sitAct + 4) return 0.04; if (t < E.wings) return 0.97;
  if (t < E.dance) return 0.12 + n; if (t < E.hot) return lerp(0.3, 1, seg(t, E.dance, E.dance + 14)) + n; if (t < E.launch) return 1; if (t < E.tap) return 0.02; if (t < E.score10) return lerp(0.25, 1, seg(t, E.tap, E.tap + 16)) + n; return 1; };
const appL = t => win(t, E.launch, E.dark) ? 'EVACUATING' : win(t, E.sitAct + 4, E.wings) ? 'HE JUST SITS!!' : null;
const boogie = t => (t > E.wig && t < E.sitAct) || (t > E.sitAct + 4 && t < E.wings) || (t > E.dance + 4 && t < E.launch) || (t > E.tap + 4 && t < E.reboot + 2) || (t > E.encore && t < E.collapse);
// bot dance: rehearsal flop, perfect routine, turbo
function botDance(t, mode) { const b = bot, w = t * Math.PI * 2 * 1.07;
  if (mode === 'bad') { b.aL.rotation.set(Math.sin(t * 13) * 2, 0, Math.sin(t * 7) * 0.8); b.aR.rotation.set(Math.cos(t * 11) * 2.4, 0, -Math.sin(t * 5) * 0.9); b.hd.rotation.z = Math.sin(t * 9) * 0.4; }
  if (mode === 'good') { const k = Math.floor(t * 1.07) % 4; b.aL.rotation.set(k % 2 ? -2.8 : -1.5 + Math.sin(w) * 0.4, 0, k === 2 ? 0.8 : 0); b.aR.rotation.set(k % 2 ? -1.5 + Math.cos(w) * 0.4 : -2.8, 0, k === 3 ? -0.8 : 0); b.hd.rotation.set(0, Math.sin(w / 2) * 0.5, Math.sin(w) * 0.15); b.body.rotation.z = Math.sin(w) * 0.12; }
  if (mode === 'turbo') { b.aL.rotation.set(-1.57, 0, 1.2); b.aR.rotation.set(-1.57, 0, -1.2); b.body.rotation.z = Math.sin(t * 30) * 0.15; } }

// ---------------------------------------------------------------- set A: the farmyard (sunny rehearsal)
const farm = (() => {
  const g = mk('farm'), st = new VSet(g), r = rng(1501);
  for (let x = -40; x <= 40; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, (Math.abs(z - 4) <= 1 && x > -6) || (Math.abs(x) <= 1 && z < 4 && z > -8) ? 'path' : 'turf');
  for (let x = -6; x <= 6; x++) for (let z = -15; z <= -8; z++) for (let y = 1; y <= 6; y++) { const edge = x === -6 || x === 6 || z === -15 || z === -8; if (!edge) continue; if (z === -8 && Math.abs(x) <= 2 && y <= 4) continue; st.add(x, y, z, (x === -6 || x === 6) && (z === -8 || z === -15) ? 'log' : 'jam'); }
  for (let k = 0; k <= 4; k++) for (let z = -16; z <= -7; z++) for (let x = -7 + k; x <= 7 - k; x++) if (x === -7 + k || x === 7 - k || k === 4) st.add(x, 7 + k, z, 'slate');
  for (let x = -5; x <= 5; x++) for (let z = -14; z <= -9; z++) st.add(x, 1, z, 'crop');
  for (let x = 9; x <= 22; x += 1) { st.add(x, 1, -6, 'plank'); if (x % 3 === 0) st.add(x, 2, -6, 'log'); } for (let z = -6; z <= 0; z++) st.add(22, 1, z, 'plank');
  const trees = [[-14, 4]]; tree(st, -14, 0, 4, r, 5); for (let i = 0; i < 46; i++) { const x = Math.round((r() - .5) * 78), z = Math.round((r() - .5) * 58); if (Math.abs(x) < 16 && z > -18 && z < 14) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const poster = new THREE.Group(); poster.position.set(-5.4, 0.5, 0.6); poster.rotation.y = 0.5; g.add(poster); for (const x of [-1.1, 1.1]) box(0.16, 2.6, 0.16, '#6a4a2a', x, 1.3, 0, poster);
  const pm = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.08), new THREE.MeshLambertMaterial({ map: signTex('TALENT SHOW', 'tonight! prize: golden mallet', '#ffe6a0') })); pm.position.y = 2.2; poster.add(pm);
  const bench = new THREE.Group(); bench.position.set(6, 0.5, -4.6); g.add(bench); box(2.4, 0.16, 1.1, 0, 0, 1.0, 0, bench, MAT.plank); for (const [x, z] of [[-1, -0.4], [1, -0.4], [-1, 0.4], [1, 0.4]]) box(0.14, 1.0, 0.14, '#6a4a2a', x, 0.5, z, bench);
  box(0.4, 0.3, 0.3, '#5aa0ff', -0.7, 1.24, 0, bench); box(0.2, 0.5, 0.2, '#c0c0c8', 0.8, 1.34, -0.2, bench);
  for (let t = E.chip; t < E.chipEnd; t += 0.7) burst(t, [6.2, 1.8, -4.4], { n: 8, colors: ['#ffe066', '#7cff6b', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  burst(E.fall1 + 0.5, [2, 0.8, 1.6], { n: 40, colors: ['#9aa4bd', '#ffd400', '#cfcfcf'], speed: 4, size: 0.18, life: 1, grav: 8, up: 3 });
  burst(E.chipOn + 2.2, [2, 4, 1], { n: 60, colors: ['#ffe066', '#ff5cf0', '#5ff7ff'], speed: 5, size: 0.14, life: 1.3, grav: 4, up: 3 });
  const C = [[0, 0, 5, 18, 0, 2, 0, 50], [5.9, 2, 3.4, 12, -1.5, 2, 0, 46], [6.0, -0.6, 2.4, 6.4, -5.4, 2.4, 0.6, 46], [11.9, 0.4, 2.6, 6.0, -4.4, 2.2, 0.6, 44],
    [12.0, 8, 2.0, 8, 2, 1.5, 0, 50], [17.9, 6, 2.2, 7, 2, 1.6, 0, 48], [18.0, 1.6, 1.0, 6.2, 2, 1.9, 0, 54], [25.9, 4.2, 1.3, 5.6, 2, 1.3, 0.4, 50],
    [26.0, -3, 2.4, 4.4, -8, 1.8, -1, 50], [31.9, -4, 2.2, 3.8, -8, 1.8, -1, 44], [32.0, 9.4, 3.6, 0.6, 6, 1.4, -4.4, 50], [41.9, 8.2, 3.0, -0.4, 6, 1.4, -4.4, 46],
    [42.0, 3.4, 2.2, 1.6, 6, 1.8, -2.4, 48], [43.9, 3.6, 2.2, 1.2, 6, 1.8, -2.4, 46], [44.0, 1.4, 2.0, 7.4, 2, 2.2, 0.6, 50], [49.9, 0, 2.8, 9.6, 1, 2, 0, 52],
    [50.0, -4, 3, 9, 3, 1.6, 2, 52], [E.arrive, 12, 3, 10, 18, 1.6, 3, 52]];
  function update(t) {
    hideMisc(); const walkOut = t > E.walk, wk = seg(t, E.walk, E.walk + 6);
    // hero
    let hp = [-2.2, 0.5, 3], hy = 0.3, ho = { face: 'normal' };
    if (t > E.poster && t < E.botIn) { hy = -0.6; ho.hold = true; } if (t > E.botIn) hy = 1.0; if (t > E.rehearse) { hy = 1.2; ho.face = t > E.fall1 ? 'scared' : 'smug'; }
    if (t > E.leggyTap) { hy = -1.6; ho.face = 'smug'; } if (t > E.chip) { hp = [3.4, 0.5, -1.4]; hy = 1.2; ho = { face: 'normal' }; } if (t > E.chipOn) { hp = [0, 0.5, 2.6]; hy = 1.0; ho = { face: 'smug', wave: win(t, E.chipOn + 2, E.chipOn + 5) }; }
    if (walkOut) { hp = [lerp(0, 16, wk), 0.5, lerp(2.6, 4, wk)]; hy = Math.PI / 2; ho = { walk: wk < 1 ? 1 : 0, phase: t * 9, face: 'smug' }; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // Bonk-bot
    let bp = [2, 0.5, 1], byaw = -0.4, bo = { off: true }; if (t < E.botIn + 3) { const k = seg(t, E.botIn, E.botIn + 3); bp = [lerp(14, 2, k), 0.5, 1]; byaw = -Math.PI / 2; bo.roll = 1; }
    if (walkOut) { bp = [lerp(2, 18, wk), 0.5, lerp(1, 2, wk)]; byaw = Math.PI / 2; bo.roll = 1; }
    const fallen = t > E.fall1 && t < E.chipOn; bo.tilt = fallen ? -Math.PI / 2 * ss(seg(t, E.fall1, E.fall1 + 0.5)) : 0; if (win(t, E.rehearse, E.fall1)) bo.spin = Math.sin(t * 5) * 1.5;
    poseBot(bot, t, bp, byaw, bo); parentTo(bot.root, g); bot.root.visible = t > E.botIn;
    if (win(t, E.rehearse, E.fall1 + 0.5)) botDance(t, 'bad'); if (win(t, E.chipOn + 1, E.walk)) botDance(t, 'good'); if (fallen) bot.root.position.y = 0.5 + 0.4 * ss(seg(t, E.fall1, E.fall1 + 0.5));
    // Bloop + chip + invoice
    let lp = [5.6, 0.5, -1.2], ly = -0.9, lo = {}; if (t > E.chip) { lp = [6, 0.5, -3.2]; ly = Math.PI; lo = { hop: t < E.chipEnd }; } if (t > E.chipEnd) { lp = [5, 0.5, -1.8]; ly = -1.0; lo = { handOut: true }; }
    if (t > E.chipOn) { lp = [3.8, 0.5, 2.8]; ly = -0.8; lo = { hop: win(t, E.chipOn + 2, E.walk) }; } if (walkOut) { lp = [lerp(3.8, 20, wk), 0.5, lerp(2.8, 4.4, wk)]; ly = Math.PI / 2; lo = { walk: wk < 1 ? 1 : 0, phase: t * 8 }; }
    poseBurble(bloop6, t, lp, ly, lo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; card.visible = win(t, E.chipEnd, E.chipOn);
    parentTo(chip, g); chip.visible = win(t, E.chip + 4, E.chipOn); chip.position.set(...(t < E.chipEnd ? [6, 1.65, -4.5] : rideOn(lp, ly, 0.6, 1.3))); chip.rotation.y = t * (t < E.chipEnd ? 0 : 2);
    // Leggy (secretly a tap dancer)
    const tapping = win(t, E.leggyTap - 4, E.leggyTap + 1.4) || win(t, E.chipOn + 2, E.walk); let gp = [-8, 0.5, -1], gy = 0.8;
    if (walkOut) { gp = [lerp(-8, 12, wk), 0.5, lerp(-1, 1, wk)]; gy = Math.PI / 2; }
    poseLurk(L6, t, gp, gy, walkOut && wk < 1 ? 2.4 : tapping ? 0.3 : 0.3); parentTo(L6.root, g);
    if (tapping) { L6.legs.forEach((l, i) => l.rotation.x = Math.max(0, Math.sin(t * 14 + i * Math.PI / 3)) * 0.7); L6.body.position.y = 1.3 + Math.abs(Math.sin(t * 7)) * 0.12; }
    if (win(t, E.leggyTap + 1.4, E.chip)) L6.hd.rotation.x = 0.45;
    const cam = camKeys(t, C); return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the village square stage (dusk → night)
const stage = (() => {
  const g = mk('stage'), st = new VSet(g), r = rng(1502);
  for (let x = -36; x <= 36; x++) for (let z = -26; z <= 30; z++) { const sq = Math.abs(x) <= 16 && z > -10 && z < 20; st.add(x, 0, z, sq ? (hash2(x, z, 3) < 0.5 ? 'path' : 'stone') : 'turf'); }
  for (const [hx, hz, w] of [[-24, -14, 6], [-12, -18, 5], [14, -18, 5], [25, -12, 6], [-26, 10, 5], [27, 12, 5]]) { for (let x = hx - w / 2; x <= hx + w / 2; x++) for (let z = hz - 2; z <= hz + 2; z++) for (let y = 1; y <= 4; y++) if (x === hx - w / 2 || x === hx + w / 2 || z === hz - 2 || z === hz + 2) st.add(x, y, z, y === 2 && (x === hx || z === hz) ? 'glass' : 'hut');
    for (let x = hx - w / 2 - 1; x <= hx + w / 2 + 1; x++) for (let z = hz - 3; z <= hz + 3; z++) st.add(x, 5, z, 'hutRoof'); }
  const trees = []; for (let i = 0; i < 30; i++) { const x = Math.round((r() - .5) * 70), z = Math.round((r() - .5) * 52); if (Math.abs(x) < 20 && z > -22 && z < 22) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  // the stage deck (its own group so it can sink), back curtain, wings
  const deck = new THREE.Group(); g.add(deck); const dv = new VSet(deck); for (let x = -6; x <= 6; x++) for (let z = -6; z <= 0; z++) for (let y = 1; y <= 2; y++) dv.add(x, y, z, y === 2 ? 'plank' : 'log'); dv.build();
  const redM = new THREE.MeshLambertMaterial({ color: '#c0182a' }), redD = new THREE.MeshLambertMaterial({ color: '#8a1020' });
  box(14, 8, 0.4, 0, 0, 6.5, -6.6, deck, redD); for (let i = 0; i < 14; i++) box(0.3, 8, 0.5, 0, -6.6 + i, 6.5, -6.4, deck, redM);
  const mic = new THREE.Group(); mic.position.set(-4, 2.5, -0.6); deck.add(mic); box(0.08, 1.5, 0.08, '#333', 0, 0.75, 0, mic); box(0.16, 0.24, 0.16, '#888', 0, 1.6, 0, mic);
  // the proscenium frame (posts + beam + bunched curtains + bulbs) — tips forward at the end
  const frame = new THREE.Group(); frame.position.set(0, 0.5, 0.9); g.add(frame); const goldF = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#6a5000', emissiveIntensity: 0.4 });
  for (const x of [-7.2, 7.2]) box(0.7, 10, 0.7, 0, x, 5, 0, frame, goldF); box(15.1, 1.2, 0.8, 0, 0, 10.2, 0, frame, goldF);
  const banner = new THREE.Mesh(new THREE.BoxGeometry(7, 1.0, 0.1), new THREE.MeshBasicMaterial({ map: bannerTex('TALENT SHOW') })); banner.position.set(0, 10.2, 0.46); frame.add(banner);
  for (const s of [-1, 1]) { box(1.6, 8.4, 0.7, 0, s * 6.0, 5.6, -0.3, frame, redM); box(1.7, 0.3, 0.8, 0, s * 6.0, 5.4, -0.3, frame, goldF); }
  const bulbM = new THREE.MeshBasicMaterial({ color: '#fff4c0' }), bulbs = []; for (let i = 0; i < 9; i++) bulbs.push(box(0.26, 0.26, 0.2, 0, -6 + i * 1.5, 9.5, 0.45, frame, bulbM));
  // judge desk, lantern posts, lights
  const desk = new THREE.Group(); desk.position.set(0, 0.5, 5.4); g.add(desk); box(4.4, 1.1, 1.2, 0, 0, 0.55, -1.0, desk, MAT.plank); box(4.6, 0.14, 1.4, '#e8344e', 0, 1.14, -1.0, desk);
  const lampM = new THREE.MeshBasicMaterial({ color: '#ffc060' }), posts = [[-12, 4], [12, 4], [-12, 16], [12, 16]];
  for (const [x, z] of posts) { box(0.3, 4.4, 0.3, '#3a3a44', x, 2.7, z, g); box(0.6, 0.6, 0.6, 0, x, 5.1, z, g, lampM); }
  const lampL = [new THREE.PointLight('#ffb050', 12, 22, 1.3), new THREE.PointLight('#ffb050', 12, 22, 1.3)]; lampL[0].position.set(-10, 5, 9); lampL[1].position.set(10, 5, 9); lampL.forEach(l => g.add(l));
  const spot = new THREE.SpotLight('#fff4d0', 0, 34, 0.38, 0.5, 1.1); spot.position.set(0, 13, 10); g.add(spot); const spotT = new THREE.Object3D(); spotT.position.set(0, 2.5, -2.5); g.add(spotT); spot.target = spotT;
  const beamM = new THREE.MeshBasicMaterial({ color: '#fff4a0', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }), beam = new THREE.Mesh(new THREE.ConeGeometry(2.4, 7.4, 20, 1, true), beamM); beam.position.set(0, 6.4, -2.8); g.add(beam);
  const puffL = new THREE.SpotLight('#ffd890', 0, 20, 0.32, 0.4, 1.0); puffL.position.set(0, 10.4, -1.6); g.add(puffL); puffL.target = spotT;
  parentTo(hatStand, g); parentTo(topHat, g); parentTo(wigFly, g); parentTo(trophy15, g); parentTo(sitter.root, g); crowd.forEach(c => parentTo(c.root, g));
  // particles
  smoke(E.hot, E.launch, 0.25, t => [bot.root.position.x, bot.root.position.y + 3.0, bot.root.position.z], { n: 3, size: 0.25, life: 1.4, colors: ['#555', '#888', '#333'], grav: -1.6 });
  burst(E.launch + 0.1, [0, 3, -1], { n: 60, colors: ['#9aa4bd', '#ffd400', '#e8344e'], speed: 7, size: 0.2, life: 1.2, grav: 8, up: 4 });
  burst(E.dark, [12, 5.2, 16], { n: 70, colors: ['#ffc060', '#ffffff', '#ffe066'], speed: 6, size: 0.15, life: 1, grav: 6, up: 3 });
  for (let k = 0; k < 6; k++) burst(E.score10 + 0.4 + k * 0.5, [Math.sin(k * 2) * 5, 9, -2 + Math.cos(k) * 3], { n: 50, colors: ['#ff5cf0', '#ffe066', '#5ff7ff', '#7cff6b'], speed: 5, size: 0.16, life: 2, grav: 3, up: 2 });
  burst(E.wig2 + 0.6, [-1.6, 4.2, -1.6], { n: 20, colors: ['#ffe066', '#fff0a0'], speed: 3, size: 0.14, life: 0.8, grav: 6, up: 2 });
  burst(E.collapse - 2, [7, 3, 0.9], { n: 40, colors: ['#ffd23f', '#9aa4bd'], speed: 5, size: 0.18, life: 1, grav: 8, up: 3 });
  burst(E.collapse + 1.4, [0, 1, 6], { n: 160, colors: ['#c8b89a', '#a89878', '#e0d4bc'], speed: 9, size: 0.4, life: 2.6, grav: 1.5, up: 2 });
  burst(E.collapse + 0.3, [0, 2.5, -3], { n: 90, colors: ['#c8b89a', '#8a5a2b'], speed: 6, size: 0.3, life: 2, grav: 3, up: 3 });
  const BX = [[E.launch, 0], [E.launch + 1.2, 3], [160, 9], [164, 4], [168, -8], [172, -4], [E.dark, 9], [E.botStop + 8, 9], [E.reboot + 4, 9], [E.reboot + 7, 3], [E.spin2, 2], [E.collapse - 2, 6.4], [E.collapse, 6.4]];
  const BZ = [[E.launch, -2], [E.launch + 1.2, 6], [160, 12], [164, 16], [168, 12], [172, 8], [E.dark, 10], [E.botStop + 8, 10], [E.reboot + 4, 10], [E.reboot + 7, 3], [E.spin2, -2.4], [E.collapse - 2, -0.2], [E.collapse, -0.2]];
  const C = [[E.arrive, 0, 14, 34, 0, 4, -2, 52], [63.9, 0, 10, 28, 0, 4, -2, 50], [64, 0, 3.8, -0.4, 0, 2.6, 5.4, 50], [69.9, 0.8, 3.6, 0.2, 0, 2.6, 5.4, 46],
    [70, 0, 4.6, 9.4, 0, 3.6, -2, 50], [79.9, 0, 4.2, 6.8, 0, 3.8, -2, 46], [80, 3.2, 4.0, 2.6, 0.6, 4.0, -2, 46], [89.9, 2.6, 4.0, 2.0, 0.4, 4.2, -2, 42], [90, -1.4, 2.0, 1.2, 0, 2.6, 5.4, 50], [95.9, -0.8, 2.0, 1.6, 0, 2.6, 5.4, 46],
    [96, 0, 4.4, 2.0, 0, 3.2, -2, 46], [100.9, 0, 4.2, 1.2, 0, 3.2, -2, 42], [101, -5, 6.4, 15, 0, 2.4, 6, 54], [105.9, 5, 6.4, 15, 0, 2.4, 6, 54],
    [106, -6.4, 2.8, 6.2, -11.5, 1.8, 0, 50], [113.9, -7.0, 2.6, 5.4, -11.5, 1.8, 0, 46], [114, -6, 5, 11, 0, 3, -2, 52], [119.9, -3, 4.4, 9, 0, 3, -2, 50],
    [120, 0, 3.0, 3.0, 0, 3.8, -2, 56], [127.9, 1.6, 3.2, 2.6, 0, 3.8, -2, 54], [128, 7, 3.6, 18, 0, 1.6, 10, 52], [133.9, -7, 3.6, 18, 0, 1.6, 10, 52], [134, -2.2, 4.0, 2.6, -4, 3.6, -1, 46], [137.9, -2.0, 4.0, 2.2, -4, 3.6, -1, 44],
    [138, -12.4, 2.4, 6.6, -10.4, 1.6, 2, 46], [141.9, -12.0, 2.4, 6.2, -10.4, 1.6, 2, 44], [142, 1.8, 3.6, 3.4, 0, 4.4, -2, 46], [147.9, 1.2, 3.6, 2.8, 0, 4.4, -2, 42],
    [148, -4, 3.0, 3.2, 0, 3.6, -2, 56], [155.9, 4, 3.0, 3.2, 0, 3.6, -2, 56], [156, 0, 12, 28, 0, 1, 8, 56], [163.9, -6, 10, 26, 0, 1, 8, 56], [164, -16, 4, 22, -4, 1.4, 12, 54], [175.9, -16, 4, 2, 4, 1.4, 10, 54],
    [176, 0, 5, 15, 0, 3, -2, 52], [181.9, 0, 4.6, 13, 0, 3, -2, 50], [182, 0, 3.2, 8, 0, 3.2, -2, 50], [185.9, 0, 3.0, 7, 0, 3.2, -2, 48], [186, 0, 3.2, 2.4, 0, 3.2, -3, 56], [193.9, 2.6, 3.2, 2.2, 0, 3.2, -3, 54],
    [194, 0, 7, 18, 0, 3, -2, 50], [199.9, -3, 6, 15, 0, 3, -2, 50], [200, -3.4, 3.2, 3.0, 0, 3.0, -3, 50], [207.9, -2.4, 3.0, 2.4, 0, 3.0, -3, 46],
    [208, 0, 2.2, 1.2, 0, 2.6, 5.4, 50], [213.9, 0.6, 2.0, 1.8, 0, 2.8, 5.4, 46], [214, 13, 2.6, 15, 9, 1.4, 10, 50], [221.9, 12.2, 2.4, 14, 9, 1.4, 10, 46],
    [222, 0, 4.6, 3.2, 0, 3.8, -2.4, 50], [231.9, 0, 4.4, 2.4, 0, 3.8, -2.4, 46], [232, -1.0, 4.2, 4.2, -1.6, 3.8, -1.6, 46], [243.9, -0.4, 4.0, 3.6, -1.6, 3.8, -1.6, 42],
    [244, 2.4, 3.6, 4.0, -1, 3.6, -2.4, 46], [251.9, 1.8, 3.6, 3.4, -1, 3.6, -2.4, 42], [252, 0, 8, 22, 0, 2, 4, 54], [261.9, 6, 7, 20, 0, 2, 4, 54],
    [262, 15, 3.4, 4, 9, 2, 10, 50], [269.9, 8, 4, 12, 3, 3, -1, 52], [270, -9, 4, 4, 3, 3, -1, 50], [279.9, -7, 4.4, 6, 4, 3.4, 0, 52],
    [280, 0, 7, 24, 0, 4, 2, 58], [282.9, 0, 6, 22, 0, 3, 3, 56], [283, 0, 4, 16, 0, 2.4, 5, 52], [E.logo, 0, 3.8, 14.6, 0, 2.2, 5.6, 50]];
  function update(t) {
    hideMisc(); const F = Math.PI, col = seg(t, E.collapse, E.collapse + 1.4), sink = ss(col) * 1.6, dark = win(t, E.dark, E.leggyOn);
    const onDeck = (p) => [p[0], p[1] - sink, p[2]];
    deck.position.y = -sink; deck.rotation.z = -0.06 * ss(col); frame.rotation.x = (Math.PI / 2 - 0.04) * (col * col);
    bulbs.forEach((b, i) => b.visible = !dark && (t < E.launch || t > E.leggyOn || (Math.floor(t * 6) + i) % 2));
    // lights
    const show = t > E.prestin; spot.intensity = dark ? 0 : show ? 70 : 20; lampL.forEach(l => l.intensity = dark || t > E.dark && t < E.score10 ? 0 : 12);
    const lg = t > E.leggyOn && t < E.score10 + 6; puffL.intensity = lg ? 90 : 0; beam.visible = lg; spotT.position.set(lg ? -0.2 : 0, 2.5, -2.5);
    // crowd
    const scat = seg(t, E.launch, E.launch + 2) * (1 - seg(t, E.tap, E.tap + 4)), hide = win(t, E.dark, E.tap);
    crowd.forEach((c, i) => { const p = CROWD[i], s = p[0] < 0 ? -1 : 1, by = boogie(t) ? 1.2 : 0.15; let q = [p[0] + s * scat * 14, 0.5, p[2] + scat * 8]; if (col > 0) q = [p[0] + s * col * 4, 0.5, p[2] + col * 4];
      poseGrumble(c, t, q, scat > 0.2 ? s * 1.5 : F + (col > 0 ? 0 : 0), win(t, E.launch, E.dark) ? 2 : by, i * 0.37); c.root.rotation.y = scat > 0.2 ? s * 1.4 + Math.PI : F; c.root.visible = !hide; });
    // judge
    const cs = t > E.score7 && t < E.score7 + 5 ? '7' : (t > E.sitAct + 4 && t < E.wings - 1) || (t > E.score10 && t < E.trophy) ? '10' : null;
    poseClam(clam, t, [0, 1.65, 5.0], F, { score: cs, clap: boogie(t), hide: win(t, E.launch, E.tap - 2), shock: win(t, E.turbo, E.launch) || win(t, E.sitAct, E.sitAct + 4) || col > 0 }); parentTo(clam.root, g);
    if (t > E.trophy - 1 && t < E.trophy + 2) clam.root.position.y += Math.sin(seg(t, E.trophy - 1, E.trophy + 2) * Math.PI) * 0.4;
    // Prestin + hat + wig
    let rp = [-12.6, 0.5, -2], ry = 0.6, ro = {}; if (win(t, E.prestin - 2, E.sitAct)) { const k = seg(t, E.prestin - 2, E.prestin); rp = onDeck([lerp(-7, -0.6, k), 2.5, -2]); ry = k < 1 ? F / 2 : 0; ro = k < 1 ? { walk: 1, phase: t * 9 } : { point: win(t, E.hat, E.wig), hips: t > E.wig + 1.2 }; }
    if (t > E.sitAct) { rp = [-11.6, 0.5, -0.6]; ry = 0.9; ro = { hips: true }; } if (t > E.launch) { rp = [-9.4, 0.5, 13]; ry = F; ro = { panic: t < E.dark }; } if (t > E.tap + 4) { rp = [-9.4, 0.5, 13]; ry = F + 0.3; ro = { hips: true }; }
    if (t > E.wig2 - 2) { const k = seg(t, E.wig2 - 2, E.wig2); rp = onDeck([lerp(-6, -1.6, k), 2.5, -1.6]); ry = k < 1 ? F / 2 : 0.3; ro = k < 1 ? { walk: 1, phase: t * 9 } : { hips: t < E.wig2 + 2, cry: win(t, E.wig2 + 2.4, E.sorry) }; }
    if (t > E.sorry) { rp = [-9.4, 0.5, 13]; ry = F; ro = { hips: true }; } if (t > E.encore) { rp = [-6, 0.5, 9]; ry = F; ro = { hop: col < 1 }; }
    poseRival(rival, t, rp, ry, ro); parentTo(rival.root, g); rival.wig.visible = (t > E.wig + 1.2 && t < E.wig2 + 0.6); rival.shine.visible = !rival.wig.visible;
    hatStand.visible = topHat.visible = win(t, E.prestin, E.sitAct); hatStand.position.set(1.2, 2.5, -2.2); topHat.position.set(1.2, 3.6, -2.2); topHat.rotation.set(0, t * 0.5, win(t, E.hat, E.wig) ? Math.sin(t * 20) * 0.1 : 0);
    wigFly.visible = win(t, E.wig, E.wig + 1.2) || win(t, E.wig2 + 0.6, E.sorry); if (t < E.sorry - 1 && t > E.wig2) { const k = seg(t, E.wig2 + 0.6, E.wig2 + 1.6); wigFly.position.set(lerp(-1.6, -0.4, k), lerp(4.6, 2.62, k) + Math.sin(k * Math.PI) * 1.2, lerp(-1.6, -0.2, k)); wigFly.rotation.set(0, k * 6, 0); }
    else { const k = seg(t, E.wig, E.wig + 1.2); wigFly.position.set(lerp(1.2, -0.6, k), 4.2 + Math.sin(k * Math.PI) * 2.2 + k * 0.1, -2.2 + k * 0.2); wigFly.rotation.set(0, k * 9, 0); }
    // the sitting Grumble (act 2)
    sitter.root.visible = win(t, E.sitAct - 1, E.wings); poseGrumble(sitter, t, [0, 2.5, -2], 0, 0, 0);
    // hero
    let hp = [-10.4, 0.5, 1.4], hy = 0.6, ho = { face: 'normal' }; const arriveK = seg(t, E.arrive, E.arrive + 6);
    if (t < E.arrive + 6) { hp = [lerp(-24, -10.4, arriveK), 0.5, lerp(6, 1.4, arriveK)]; hy = 1.2; ho = { walk: 1, phase: t * 9, face: 'smug' }; }
    if (win(t, E.sitAct, E.wings)) { ho.face = 'scared'; } if (win(t, E.wings, E.ourAct)) { hy = -1.4; ho = { face: 'smug', hips: t > E.wings + 3 }; }
    if (t > E.ourAct) { const k = seg(t, E.ourAct, E.ourAct + 2); hp = onDeck([lerp(-8, -4, k), 2.5, lerp(0, -0.6, k)]); hy = k < 1 ? F / 2 : 0.2; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'smug', wave: win(t, E.ourAct + 2, E.dance) }; }
    if (t > E.dance) { hy = 0.6; ho = { face: 'smug', hips: t < 134, wave: win(t, 134, 138) }; } if (t > E.hot) ho = { face: 'scared' }; if (t > E.turbo) ho = { face: 'scared', panic: true };
    if (t > E.launch) { const k = seg(t, E.launch + 2, E.dark); hp = [lerp(-3, 6, k), 0.5, lerp(4, 14, k) + Math.sin(t * 2) * 2]; hy = 0.8; ho = { walk: 1, phase: t * 14, face: 'scared', panic: true }; }
    if (t > E.dark) { hp = [-10.4, 0.5, 2]; hy = 0.4; ho = { face: 'scared' }; } if (t > E.tap) { hy = 0.6; ho = { face: 'smug' }; }
    if (t > E.trophy + 3) { const k = seg(t, E.trophy + 3, E.trophy + 5); hp = onDeck([lerp(-8, 2.4, k), 2.5, lerp(0, -1.4, k)]); hy = k < 1 ? F / 2 : -0.4; ho = { walk: k < 1 ? 1 : 0, phase: t * 12, face: 'smug', wave: win(t, E.trophy + 5, E.wig2 - 2) }; }
    if (t > E.sorry) { hp = onDeck([0.6, 2.5, -0.6]); hy = -1.3; ho = { face: 'normal', hold: win(t, E.sorry + 3, E.encore) }; }
    if (t > E.encore) { const k = seg(t, E.encore, E.encore + 2); hp = [0, lerp(2.5, 0.5, k), lerp(-0.4, 6, k)]; hy = 0; ho = { face: 'smug', wave: k >= 1 && t < E.reboot + 2, walk: k < 1 ? 1 : 0, phase: t * 9 }; }
    if (t > E.reboot + 2) ho = { face: 'scared', headPitch: t > E.collapse - 2 ? -0.4 : 0, panic: win(t, E.collapse - 2, E.collapse + 1.4) }; if (t > E.collapse + 2) ho = { face: 'scared', headYaw: Math.sin(t * 3) * 0.4 };
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // Bloop (remote control, pulls the chip, dances at the encore)
    let lp = [-11.6, 0.5, 3], ly = 0.4, lo = {}; if (t < E.arrive + 6) { lp = [lerp(-26, -11.6, arriveK), 0.5, lerp(7, 3, arriveK)]; ly = 1.2; lo = { walk: 1, phase: t * 8 }; }
    if (win(t, E.sitAct, E.wings)) lo = { facepalm: true }; if (t > E.dance) lo = { hop: t < E.hot }; if (t > E.hot) lo = { angry: true }; if (t > E.launch) { lp = [-11.6, 0.5, 6]; lo = { angry: t < E.dark }; }
    if (t > E.botStop) { const k = seg(t, E.botStop, E.botStop + 4); lp = [lerp(-11.6, 7.4, k), 0.5, lerp(6, 10.4, k)]; ly = k < 1 ? 1.4 : 1.6; lo = k < 1 ? { walk: 1, phase: t * 8 } : { handOut: true }; }
    if (t > E.trophy) { lp = [-11.6, 0.5, 3]; ly = 0.6; lo = { hop: win(t, E.trophy, E.trophy + 4) }; } if (t > E.encore) { const k = seg(t, E.encore, E.encore + 2); lp = onDeck([lerp(-8, 2.4, k), 2.5, lerp(0, -2.6, k)]); ly = k < 1 ? F / 2 : 0; lo = { walk: k < 1 ? 1 : 0, phase: t * 8, hop: k >= 1 }; }
    poseBurble(bloop6, t, lp, ly, lo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    parentTo(chip, g); chip.visible = win(t, E.botStop + 4.6, E.trophy); chip.position.set(...rideOn(lp, ly, 0.6, 1.3)); chipLed.material.color.set(t > E.hot ? '#ff2a3a' : '#7cff6b');
    // Leggy
    let gp = [-13.2, 0.5, -1.4], gy = 0.6, gs = 0.3, tapping = false; if (t < E.arrive + 6) { gp = [lerp(-28, -13.2, arriveK), 0.5, lerp(4, -1.4, arriveK)]; gy = 1.3; gs = 2; }
    if (win(t, E.wings, E.ourAct)) { const k = seg(t, E.wings + 1, E.wings + 3) * (1 - seg(t, E.wings + 5, E.wings + 7)); gp = [lerp(-13.2, -9.2, k), 0.5, -1.4]; gy = 1.2; tapping = win(t, E.wings + 2.6, E.wings + 4.6); }
    if (t > E.leggyOn) { const k = seg(t, E.leggyOn, E.leggyOn + 4); gp = onDeck([lerp(-9, -0.2, k), 2.5, lerp(-1.4, -3.0, k)]); gy = k < 1 ? F / 2 : 0; gs = k < 1 ? 2 : 0.3; tapping = t > E.tap && t < E.score10 + 2; }
    if (t > E.encore) { tapping = t < E.collapse; gp = onDeck([-2.8, 2.5, -3.2]); gy = 0; }
    poseLurk(L6, t, gp, gy, gs); parentTo(L6.root, g); L6.light.intensity = dark ? 6 : 1.5;
    if (tapping) { L6.legs.forEach((l, i) => { l.rotation.x = Math.max(0, Math.sin(t * 15 + i * Math.PI / 3)) * 0.8; l.rotation.z = Math.sin(t * 7.5 + i) * 0.15; }); L6.body.position.y = 1.3 + Math.abs(Math.sin(t * 7.5)) * 0.18; L6.root.rotation.y = gy + Math.sin(t * 1.8) * 0.35; }
    if (win(t, E.wings + 7, E.ourAct) || win(t, E.dark, E.leggyOn)) L6.hd.rotation.x = 0.45;
    if (col > 0) { L6.root.rotation.z = Math.sin(t * 9) * 0.1; }
    // trophy: on the desk → floats to Leggy → launched by the spin → bonks the hero
    trophy15.visible = t > E.arrive; const tk = seg(t, E.trophy, E.trophy + 3), fk = seg(t, E.collapse - 1, E.collapse + 3.4);
    if (t < E.trophy) trophy15.position.set(1.6, 1.64, 4.4); else if (t < E.collapse - 1) { const lh = L6.root.position; trophy15.position.set(lerp(1.6, lh.x + 0.1, tk), lerp(1.64, 4.4, tk) + Math.sin(tk * Math.PI) * 2, lerp(4.4, lh.z + 1.2, tk)); }
    else { trophy15.position.set(lerp(-2.6, 0, fk), lerp(4.4, 2.75, fk) + Math.sin(fk * Math.PI) * 7, lerp(-2, 6, fk)); }
    trophy15.rotation.set(t > E.collapse - 1 && fk < 1 ? t * 8 : 0, 0, fk >= 1 ? 0.5 : 0);
    // Bonk-bot
    let bp = [-9.8, 0.5, -3.2], byaw = 0.6, bo = { off: true }, mode = null;
    if (t > E.ourAct + 1) { const k = seg(t, E.ourAct + 1, E.ourAct + 4); bp = onDeck([lerp(-8, 0, k), 2.5, -2.2]); byaw = k < 1 ? F / 2 : 0; bo.roll = k < 1 ? 1 : 0; }
    if (t > E.dance) mode = 'good'; if (t > E.turbo) { mode = 'turbo'; bo.spin = Math.pow(t - E.turbo, 2) * 3; }
    if (t > E.launch) { const k = seg(t, E.launch, E.launch + 1.2); bp = [lerpK(BX, t), t < E.launch + 1.2 ? 2.5 + Math.sin(k * Math.PI) * 4 - k * 2 : 0.5, lerpK(BZ, t)]; bo.spin = t * 30; }
    if (t > E.dark) { mode = null; bo.spin = t * lerp(12, 0, seg(t, E.dark, E.botStop)); bo.tilt = 0.3 * seg(t, E.botStop, E.botStop + 1); bo.look = 0.5 * seg(t, E.botStop, E.botStop + 1); }
    if (t > E.reboot) { bo = { off: true, alarm: win(t, E.reboot, E.reboot + 3), roll: moving(BX, t) ? 1 : 0 }; byaw = moving(BX, t) ? -2.2 : 0; if (t > E.reboot + 7) { bp = onDeck([lerpK(BX, t), 2.5, lerpK(BZ, t)]); } else bp = [lerpK(BX, t), 0.5, lerpK(BZ, t)];
      if (t > E.spin2) { mode = 'turbo'; bo.spin = Math.pow(t - E.spin2, 2) * 4; } if (t > E.collapse) { mode = null; bo.spin = (E.collapse - E.spin2) ** 2 * 4 + (t - E.collapse) * 20; bo.tilt = 0.4 * col; } }
    poseBot(bot, t, bp, byaw, bo); parentTo(bot.root, g); bot.root.visible = true; if (mode) botDance(t, mode);
    if (win(t, E.hot, E.launch)) bot.visor.material.color.set(Math.floor(t * 8) % 2 ? '#ff2a3a' : '#ffffff'); else bot.visor.material.color.set(t > E.botStop && t < E.reboot ? '#330000' : '#ff2a3a');
    // Puff runs the spotlight up on the beam
    poseMag(puff, t, [frame.position.x, 10.9 - sink, 0.9 + Math.sin(frame.rotation.x) * 0], 0, { big: lg }); parentTo(puff.root, g); puff.root.visible = t > E.dark && col < 0.05; puff.light.intensity = 4;
    // Muffin: front row, loves everything
    poseMuffin(muffin, t, [3.2 + (scat > 0 ? scat * 10 : 0), 0.5, 7.8 + scat * 6], F, { hop: boogie(t) || win(t, E.launch, E.dark) }); parentTo(muffin.root, g); muffin.root.visible = !hide;
    let cam = camKeys(t, C);
    if (win(t, E.launch + 1.2, E.dark) && t > 164) { const b = bot.root.position; cam = { p: [b.x - 5, 5, b.z + 8], l: [b.x, 1.4, b.z], fov: 54 }; }
    return { cam, hud: true, cave: dark };
  }
  return { g, update };
})();
