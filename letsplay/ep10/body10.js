// ================================================================ EPISODE 10: "SPACE?!" — launch beach → orbit (cabin + rocket) → the Shard Moon → crash-landing at sunset
TX.moonrock = ctex(16, (g, r, n) => { noisy(['#9a96a8', '#8c889a', '#a8a4b6', '#7e7a8c'])(g, r, n); g.fillStyle = '#6a6678'; for (let i = 0; i < 4; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); g.fillRect(x, y, 3, 1); g.fillRect(x, y + 2, 3, 1); g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y, 1, 3); } }, 101);
MAT.moonrock = lam(TX.moonrock);
function planetTex(cols, seed) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'), r = rng(seed); g.fillStyle = cols[0]; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 70; i++) { g.fillStyle = cols[1 + (i % (cols.length - 1))]; const x = r() * 256, y = 10 + r() * 108, w = 8 + r() * 40, h = 4 + r() * 18; g.fillRect(x, y, w, h); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const earthMat = new THREE.MeshLambertMaterial({ map: planetTex(['#2f6fd8', '#3cc26a', '#3cc26a', '#ffffff', '#e8d28a'], 102), emissive: '#1a3a80', emissiveIntensity: 0.35 });
const moonMat = new THREE.MeshBasicMaterial({ map: planetTex(['#ff9ad8', '#e07ac0', '#ffc0ea', '#c868b0'], 103) });
// --- the Bloop-1 rocket (origin at the bottom centre)
const rocketG = new THREE.Group(), rv = new VSet(rocketG, true); { const cells = [];
  for (let y = 0; y <= 9; y++) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) cells.push([x, y, z, y === 7 && x === 0 && z === 1 ? 'glass' : (y % 4 === 1 ? 'jam' : 'quartz')]);
  for (const [x, z] of [[0, -1], [0, 0], [0, 1], [-1, 0], [1, 0]]) cells.push([x, 10, z, 'quartz']); cells.push([0, 11, 0, 'quartz'], [0, 12, 0, 'jam']);
  for (const [x, z] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) for (let y = 0; y <= 2; y++) if (!(y === 2 && false)) cells.push([x, y, z, 'jam']);
  cells.sort((a, b) => a[1] - b[1]).forEach((c, i) => rv.add(c[0], c[1], c[2], c[3], { t0: E.build + 0.6 + i * (E.buildEnd - E.build - 1.6) / cells.length })); rv.build(); }
box(1.8, 0.6, 1.8, '#3a3a44', 0, -0.75, 0, rocketG);
const flameG = pivot(rocketG, 0, -1.1, 0); box(1.2, 2.4, 1.2, 0, 0, -1.2, 0, flameG, basic('#ff6a1a', { transparent: true, opacity: 0.85 })); box(0.7, 1.8, 0.7, 0, 0, -0.9, 0, flameG, basic('#ffe27a'));
const rocketLight = new THREE.PointLight('#ff9a3a', 0, 30, 1.2); rocketLight.position.set(0, -2, 0); rocketG.add(rocketLight);
// --- helmets, flags, the Puffling, Moonsquish
const helmMat = new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.28, depthWrite: false });
const helmH = box(0.95, 0.95, 0.95, 0, 0, 0.34, 0, hero.hd, helmMat), helmR = box(0.95, 0.95, 0.95, 0, 0, 0.34, 0, rival.hd, helmMat), helmB = box(1.15, 1.0, 1.15, 0, 0, 0.32, 0, bloop6.B.hd, helmMat);
const helmHand = box(0.95, 0.95, 0.95, 0, 0, -0.9, 0.3, rival.aR, helmMat);
const mkFlag = (txt, col) => { const f = new THREE.Group(); box(0.1, 3.2, 0.1, '#dddddd', 0, 1.6, 0, f); const c = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.04), new THREE.MeshBasicMaterial({ map: labelTex(txt, col, '#ffffff', 22) })); c.position.set(0.95, 2.7, 0); f.add(c); f.userData.cloth = c; return f; };
const flagS = mkFlag('SHARDWILD', '#ff8a2a'), flagG = mkFlag('GLOWUP', '#ff5cf0');
const puffling = makeMagmite(); puffling.root.scale.setScalar(0.55);
function makeSquish(seed) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), mat = new THREE.MeshLambertMaterial({ color: '#8aa0c8', transparent: true, opacity: 0.88, emissive: '#405070', emissiveIntensity: 0.3 });
  box(0.9, 0.8, 0.9, 0, 0, 0.4, 0, body, mat); box(0.42, 0.42, 0.04, '#ffffff', 0, 0.48, 0.46, body); const pup = box(0.18, 0.2, 0.03, '#111', 0, 0.46, 0.49, body);
  const ant = pivot(body, 0, 0.8, 0); box(0.06, 0.5, 0.06, '#5a6a8a', 0, 0.25, 0, ant); const tip = box(0.18, 0.18, 0.18, 0, 0, 0.55, 0, ant, new THREE.MeshBasicMaterial({ color: '#ffe066' }));
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, mat, ant, tip, pup, seed };
}
const _sqA = new THREE.Color('#8aa0c8'), _sqB = new THREE.Color('#ff9ad8');
function poseSquish(s, t, p, yaw, o = {}) {
  const hop = o.hop ? Math.abs(Math.sin(t * (o.fast ? 9 : 5) + s.seed)) * (o.big || 0.5) : 0; s.root.position.set(p[0] + (o.shiver ? Math.sin(t * 60 + s.seed) * 0.04 : 0), p[1] + hop, p[2]); s.root.rotation.set(0, yaw, 0);
  s.body.rotation.x = o.bow ? 0.5 + Math.sin(t * 3 + s.seed) * 0.15 : 0; const sq = 1 + Math.sin(t * 6 + s.seed) * 0.06; s.body.scale.set(1 / sq, sq, 1 / sq);
  s.mat.color.copy(_sqA).lerp(_sqB, o.warm || 0); s.ant.rotation.z = Math.sin(t * 4 + s.seed) * 0.3; s.tip.material.color.set(o.warm > 0.5 ? '#ffe066' : '#bfe8ff');
}
const squishes = Array.from({ length: 12 }, (_, i) => makeSquish(i * 1.7));
const power = t => t < E.fuel ? 0 : t < E.liftoff ? 100 : t < E.moon ? lerp(100, 60, seg(t, E.liftoff, E.gauge)) : t < E.split ? 60 : t < E.launch2 ? 35 : t < E.home ? lerp(35, 4, seg(t, E.launch2, E.home)) : 0;
const lowG = (t, ph) => Math.abs(Math.sin(t * 1.6 + ph)) * 0.6;

// ---------------------------------------------------------------- set A: launch beach (start + sunset crash-landing)
const pad = (() => {
  const g = mk('pad'), st = new VSet(g), r = rng(1001);
  for (let x = -40; x <= 40; x++) for (let z = -40; z <= 4; z++) st.add(x, 0, z, z > -3 ? 'sand' : 'turf');
  const trees = []; for (let i = 0; i < 60; i++) { const x = Math.round((r() - .5) * 80), z = Math.round(-40 + r() * 14); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (x > 8 && x < 26)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (let x = -2; x <= 2; x++) for (let z = -10; z <= -6; z++) st.add(x, 1, z, 'castle'); for (let y = 2; y <= 9; y++) st.add(3, y, -8, 'log');
  st.build(); seaSet(g);
  const tent = pivot(g, -12, 0.5, -9); for (const s of [-1, 1]) { const w = box(0.1, 3.2, 3.6, '#2ec4b6', s * 0.9, 1.3, 0, tent); w.rotation.z = s * 0.55; }
  // Prestin's real house from Ep 9 (gets a rocket through the roof)
  const hv = new VSet(g, true); for (let y = 1; y <= 5; y++) for (let x = 12; x <= 22; x++) for (let z = -25; z <= -19; z++) { const edge = x === 12 || x === 22 || z === -25 || z === -19; if (!edge && y < 5) continue; if (y < 3 && z === -19 && x >= 16 && x <= 18) continue;
    const near = Math.hypot(x - 17, y - 3, z - 21) < 4.5; hv.add(x, y, z, y === 5 ? 'slate' : (y % 2 ? 'brick' : 'plank'), near ? { t1: E.crash, fly: [(x - 17) * 2 + (r() - .5) * 3, 6 + r() * 6, (z + 21) * 2 + 3], spin: [r() * 5, r() * 5, r() * 5], floor: 0.5, keep: true } : {}); } hv.build();
  const moonS = new THREE.Mesh(new THREE.SphereGeometry(26, 24, 16), moonMat); moonS.position.set(-70, 110, -280); g.add(moonS);
  const twinkle = box(5, 5, 1, 0, -68, 112, -255, g, basic('#ffe066'));
  smoke(E.fizzle, E.fizzle + 1.2, 0.15, [0, 1.6, -8], { n: 8, size: 0.5, life: 1.6, up: 1, grav: -0.5, colors: ['#9a9490', '#c8c2be'] });
  burst(E.fizzle - 0.2, [0, 1.4, -8], { n: 30, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.12, life: 0.6, grav: 4, up: 1 });
  const rk = t => 2 + 0.5 * 3.4 * Math.max(0, t - E.liftoff) ** 2;
  for (let t = E.liftoff - 1.4; t < E.space; t += 0.12) burst(t, [0, Math.max(1.5, rk(t) - 1.5), -8], { n: 8, colors: ['#ffffff', '#d8d8d8', '#ffb43a'], speed: 3, size: 0.6, life: 2.6, grav: -0.4, up: 0.5 });
  const RK = [[E.home, 60, 110, -70], [E.crash, 17, 3.2, -21]];
  for (let t = E.home; t < E.crash; t += 0.1) { const p = track(t, RK).p; burst(t, [p[0] + 2, p[1] + 3, p[2] - 2], { n: 10, colors: ['#ff6a1a', '#ffe27a', '#555555'], speed: 2, size: 0.7, life: 1.4, grav: -0.5, up: 1 }); }
  burst(E.crash, [17, 3, -20], { n: 320, colors: ['#ff6a1a', '#ffe27a', '#c8492e', '#e0a95a', '#9a9490'], speed: 12, size: 0.4, life: 2.4, grav: 8, up: 6 });
  smoke(E.crash, 300, 0.4, [17, 5, -21], { n: 3, size: 1.1, life: 3, up: 1.5, grav: -0.4, colors: ['#9a9490', '#7a7470'] });
  const C1 = [[0, 14, 6, 14, 0, 2, -5, 55], [7.1, 10, 5, 12, 0, 2, -5, 52], [7.2, 3.4, 2.0, 2.4, 2.2, 2.0, -1.6, 46], [13.7, 3.0, 2.0, 2.0, 2.2, 2.0, -1.6, 44],
    [13.8, -6, 4, 9, -60, 100, -280, 50], [16.7, -6, 4, 9, -60, 100, -280, 40], [16.8, -0.2, 1.8, 2.6, -2.4, 1.6, -1.8, 46], [26.3, 0.4, 1.8, 2.0, -2.4, 1.6, -1.8, 44],
    [43.6, 6, 4, 4, 0, 5, -8, 52], [48.3, 5, 3.6, 3, 0, 4, -8, 50], [48.4, -6, 2.2, -4, -12, 1.4, -11, 46], [58.5, -6.6, 2.2, -4.6, -12, 1.4, -11, 46],
    [58.6, 12, 4, 8, 0, 6, -8, 52], [67.5, 10, 3.6, 7, 0, 6, -8, 50], [67.6, 6, 1, 2, 0, 5, -8, 55], [71.3, 6, 1, 2, 0, 5, -8, 55]];
  const C2 = [[E.crash + 0.6, 8, 5, -4, 17, 3, -20, 55], [E.crawl + 3.7, 9, 5, -5, 17, 3, -20, 55], [226.8, 15.6, 2.4, -8.4, 15.6, 1.8, -13, 46], [231.1, 15.2, 2.4, -8.6, 15.6, 1.8, -13, 46],
    [231.2, 22, 2.4, -9, 19, 1.8, -13.5, 46], [237.5, 22.4, 2.4, -9.4, 19, 1.8, -13.5, 46], [237.6, 12.2, 2.2, -10, 13.2, 1.6, -13.4, 44], [242.5, 12.0, 2.2, -10.4, 13.2, 1.6, -13.4, 44],
    [242.6, 4.8, 2.4, -8.8, 8, 1.5, -12, 46], [246.7, 5.0, 2.4, -9.2, 8, 1.5, -12, 46], [246.8, 6, 2, -6, -68, 112, -255, 52], [255.7, 6, 2, -6, -68, 112, -255, 30],
    [255.8, 15.0, 2.2, -10.0, 15, 2.1, -13, 44], [259.9, 15.0, 2.2, -10.4, 15, 2.1, -13, 44], [260.0, 14, 5, 0, 16, -1, -14, 52], [265.5, 15, 5, 0, 16, 1, -14, 52],
    [265.6, 21.5, 2.2, -10, 19.5, 1.9, -13.5, 44], [269.9, 21.8, 2.2, -10.4, 19.5, 1.9, -13.5, 44], [270.0, 14.6, 2.2, -10.2, 14.6, 1.6, -13.6, 46], [275.7, 14.2, 2.2, -10.4, 14.6, 1.6, -13.6, 46],
    [275.8, 13.6, 2.0, -10.6, 13, 2.0, -13.2, 44], [280.7, 13.6, 2.0, -10.9, 13, 2.0, -13.2, 42], [280.8, 11.4, 2.4, -6.2, 11.2, 1.6, -13, 48], [E.logo, 11.4, 2.4, -6.6, 11.2, 1.6, -13, 48]];
  function update(t) {
    const late = t >= E.home; rv.update(t); hv.update(t); if (!late) rv.meshes.forEach(m => { if (m.material.emissive) m.material.emissiveIntensity = 0; }); twinkle.visible = t > E.star; twinkle.scale.setScalar(1 + Math.sin(t * 6) * 0.3);
    rod.visible = false; crownM.visible = false; [drill, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmHand].forEach(m => m.visible = false); helmH.visible = helmR.visible = helmB.visible = false;
    golem.root.visible = mailBird.root.visible = crownProp.visible = goose.root.visible = judge.root.visible = false; seals.forEach(s => s.root.visible = false); sled.visible = false;
    rival.wig.visible = false; rival.shine.visible = true;
    // rocket
    parentTo(rocketG, g); rocketG.visible = t > E.build; let rp = [0, 2, -8], rrot = [0, 0, 0], thrust = 0;
    if (!late) { if (win(t, E.fizzle, E.fizzle + 0.5)) thrust = 0.3 * Math.abs(Math.sin(t * 30)); if (t > E.liftoff - 1.4) thrust = 1 + Math.sin(t * 30) * 0.1; rp[1] = rk(t); if (t > E.liftoff - 1.4 && t < E.liftoff) rp[0] = Math.sin(t * 50) * 0.05; }
    else { const p = track(t, RK).p; rp = p; rrot = [0, 0, t < E.crash ? 0.9 : 0.6]; thrust = t < E.crash ? 0.6 : 0; if (t >= E.crash) rp = [17, 2.6, -20]; }
    rocketG.position.set(...rp); rocketG.rotation.set(...rrot); flameG.visible = thrust > 0.05; flameG.scale.set(1, thrust * (1 + Math.sin(t * 40) * 0.15), 1); rocketLight.intensity = thrust * 40;
    // crew
    const onPad = !late && t < E.count - 0.4;
    // hero
    const o = { t, p: [0, 0.5, -1.5], yaw: 0.2, face: 'normal' };
    if (!late) {
      if (t < 4) o.wave = true; else if (t < E.need) { o.yaw = yawXZ([0, -1.5], [2.2, -1.6]); o.face = 'smug'; } else if (t < E.blueprint) { o.yaw = 0.2; o.face = 'scared'; }
      else if (t < E.build) o.yaw = yawXZ([0, -1.5], [-2.4, -1.8]);
      else if (t < E.fuel) { o.p = [2.4, 0.5, -6.5]; o.yaw = Math.PI / 2 + 0.6; o.hold = true; }
      else if (t < E.hide) { o.p = [1, 0.5, -4.5]; o.yaw = Math.PI; o.wave = true; }
      else if (t < E.count - 0.4) { const w = walker(t, [[E.hide, 1, 0.5, -4.5], [E.coax, -9.5, 0.5, -9.4], [E.count - 2, -9.5, 0.5, -9.4], [E.count - 0.4, 0, 0.5, -7]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : yawXZ([-9.5, -9.4], [-12, -11]); o.walk = w.walk; o.phase = w.phase; }
    } else { o.p = [13.2, 0.5, -13.4]; o.yaw = 0.15; o.face = 'scared';
      if (t < E.crawl) o.p = [17, -5, -20]; else if (t < E.crawl + 2) { const k = seg(t, E.crawl, E.crawl + 2); o.p = [lerp(16.5, 13.2, k), 0.5, lerp(-18.5, -13.4, k)]; o.walk = 1; o.phase = t * 10; }
      if (t > E.viral) o.face = 'smug'; if (win(t, E.star, E.star + 9)) { o.headPitch = -0.6; o.yaw = -2.6; o.face = 'normal'; } if (win(t, E.bill, E.bill + 5.8)) { o.yaw = yawXZ([13.2, -13.4], [14.6, -14]); o.face = 'scared'; } if (t > 280.8) { o.yaw = 0.1; o.hips = true; o.face = 'smug'; } }
    pose(hero, o); parentTo(hero.root, g); hero.root.visible = onPad || late;
    // prestin
    parentTo(rival.root, g); let pp = [2.2, 0.5, -1.6], py = yawXZ([2.2, -1.6], [0, -1.5]), po = {};
    if (!late) { if (win(t, E.sponsor, E.need)) po = { point: true }; if (win(t, E.build, E.count)) { pp = [6, 0.5, -3]; py = yawXZ([6, -3], [0, -8]); po = { hold: true }; } }
    else { pp = [19.6, 0.5, -13.6]; py = -0.2; po = t < E.viral ? { panic: t > E.crawl + 1 } : { hop: t < E.viral + 5, hips: t > E.viral + 5 }; if (t < E.crawl + 0.6) pp = [17, -5, -20]; else if (t < E.crawl + 2.6) { const k = seg(t, E.crawl + 0.6, E.crawl + 2.6); pp = [lerp(17.5, 19.6, k), 0.5, lerp(-18.5, -13.6, k)]; } }
    poseRival(rival, t, pp, py, po); rival.root.visible = onPad || late;
    // bloop
    let bp = [-2.4, 0.5, -1.8], by = yawXZ([-2.4, -1.8], [0, -1.5]), bo = {};
    if (!late) { if (win(t, E.blueprint, E.build)) bo = { handOut: true }; if (win(t, E.build, E.buildEnd)) { const a = (t - E.build) * 0.6; bp = [Math.cos(a) * 3.6, 0.5, -8 + Math.sin(a) * 3.6]; if (Math.abs(bp[0]) < 2.6 && Math.abs(bp[2] + 8) < 2.6) bp[1] = 1.5; by = Math.atan2(-Math.sin(a), Math.cos(a)); bo = { walk: 1, phase: t * 14 }; } if (win(t, E.buildEnd, E.count)) { bp = [-3, 1.5, -6.5]; by = Math.PI / 2; bo = { hop: true }; } }
    else { bp = [14.6, 0.5, -14]; by = yawXZ([14.6, -14], [13.2, -13.4]); if (t < E.crawl + 1) bp = [17, -5, -20]; else if (t < E.crawl + 3) { const k = seg(t, E.crawl + 1, E.crawl + 3); bp = [lerp(16.5, 14.6, k), 0.5, lerp(-18.5, -14, k)]; bo = { walk: 1, phase: t * 12 }; }
      if (win(t, 237.6, 242.6)) bo = { hop: true }; if (t > E.bill) bo = { handOut: true }; card.visible = t > E.bill; card.scale.set(1, 1, 1); card.position.y = -0.62; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = onPad || late; blue.visible = win(t, E.blueprint, E.build); bHat.visible = true; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0; bHat.position.y = 1.2;
    // leggy + puff
    let lp = [-5, 0.5, -3], ly = 0.6, ls = 0.3;
    if (!late && t > E.hide) { const w = walker(t, [[E.hide, -5, 0.5, -3], [E.hide + 2, -12.5, 0.5, -11.5], [E.count - 2, -12.5, 0.5, -11.5], [E.count - 0.4, -2, 0.5, -8]]); lp = w.p; ly = w.speed > 0.1 ? w.yaw : 0.5; ls = w.speed > 0.1 ? 3 : 0.3; }
    if (late) { lp = [8, 0.5, -12]; ly = 0.6; if (t < E.crawl + 1.6) lp = [17, -6, -20]; else if (t < E.crawl + 3.6) { const k = seg(t, E.crawl + 1.6, E.crawl + 3.6); lp = [lerp(15, 8, k), 0.5, lerp(-17, -12, k)]; ls = 3; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0; L6.body.rotation.z = 0; L6.root.visible = onPad || late;
    if (!late && win(t, E.hide + 2, E.count - 2)) { L6.body.position.y = 0.7; L6.root.rotation.z = Math.sin(t * 40) * 0.04; }
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3)); parentTo(puff.root, g);
    let fp = head, fy = ly; if (!late && t > E.fuel - 0.4) { const k = seg(t, E.fuel - 0.4, E.fuel + 0.8); fp = [lerp(head[0], 0, k), lerp(head[1], 1.6, k) + Math.sin(k * Math.PI) * 2, lerp(head[2], -6.8, k)]; }
    puff.root.visible = (!late && t < E.fuel + 0.8) || (late && t > E.crawl + 3.6); poseMag(puff, t, fp, fy, {}); puffling.root.visible = false;
    let cam = camKeys(t, late ? C2 : C1);
    if (!late && win(t, E.build, E.buildEnd)) { const a = (t - E.build) * 0.2 - 0.4; cam = { p: [Math.sin(a) * 13, 4 + (t - E.build) * 0.2, -8 + Math.cos(a) * 13], l: [0, 4, -8], fov: 52 }; }
    if (!late && t > E.liftoff + 0.3) cam = { p: [8, Math.max(2, rp[1] - 6), 6], l: [0, rp[1] + 3, -8], fov: 55 };
    if (late && t < E.crash + 0.6) { cam = { p: [6, 4, 4], l: [rp[0], rp[1], rp[2]], fov: 55 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: orbit — rocket exterior at origin, crew cabin set far away (x = 400)
const orbit = (() => {
  const g = mk('orbit'), r = rng(1002);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(220, 48, 32), earthMat); earth.position.set(0, -300, -100); g.add(earth);
  const moonB2 = new THREE.Mesh(new THREE.SphereGeometry(60, 32, 20), moonMat); moonB2.position.set(30, 30, -520); g.add(moonB2);
  const starM = basic('#ffffff'); for (let i = 0; i < 360; i++) { const a = r() * 6.28, b = Math.acos(2 * r() - 1), d = 500; const s = box(1.4, 1.4, 1.4, 0, Math.cos(a) * Math.sin(b) * d, Math.cos(b) * d, Math.sin(a) * Math.sin(b) * d, g, starM); s.castShadow = false; }
  // cabin set
  const cab = new THREE.Group(); cab.position.set(400, 0, 0); g.add(cab); const cv = new VSet(cab);
  for (let x = -4; x <= 4; x++) for (let y = -1; y <= 5; y++) for (let z = -3; z <= 3; z++) { const wall = Math.abs(x) === 4 || y === -1 || y === 5 || z === -3; if (!wall || z === 3) continue; const winH = z === -3 && Math.abs(x) <= 1 && y >= 1 && y <= 3; cv.add(x, y, z, winH ? 'glass' : (y === -1 ? 'castle' : 'quartz')); }
  cv.build(); const cabEarth = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 20), earthMat); cabEarth.position.set(400, -10, -60); g.add(cabEarth);
  const papers = Array.from({ length: 24 }, (_, i) => box(0.5, 0.04, 0.38, i % 3 ? '#fff3cf' : '#ffffff', 0, 0, 0, g));
  const AK = t => [Math.sin(t * 0.3) * 2, 4, -(t - E.space) * 9];
  const C = [[E.space, 16, 6, 18, 0, 0, -10, 50], [86.5, 12, 8, 6, 0, 0, -40, 50], [86.6, 402, 3.2, 8, 400, 2.4, 0, 52], [91.5, 401, 3.4, 7.4, 400, 2.4, 0, 52],
    [91.6, 397.6, 4.2, 4.8, 399, 3.6, -1.4, 46], [96.1, 398.2, 4.2, 4.4, 399, 3.6, -1.4, 46], [96.2, 404.2, 2.6, 3.6, 402.4, 2.2, 0.6, 44], [102.1, 403.8, 2.6, 3.2, 402.4, 2.2, 0.6, 44],
    [102.2, 8, 6, 0, 0, 2, -60, 50], [E.moon, 6, 6, -20, 0, 2, -120, 50],
    [E.space2, 14, 8, 10, 0, 0, -10, 52], [205.0, 10, 6, 8, 0, 0, -10, 52], [205.1, 401, 3.2, 7, 400, 2.4, 0, 52], [208.0, 400.6, 3.2, 6.4, 400, 2.4, 0, 52], [208.1, 10, 2, 12, 0, 0, -12, 56], [E.home, 8, 2, 10, 0, -8, -12, 56]];
  function update(t) {
    const back = t >= E.space2; rod.visible = false; crownM.visible = false; [drill, board, blue, card, bBrick, coins, shades, bow, taxiSign].forEach(m => m.visible = false);
    golem.root.visible = mailBird.root.visible = crownProp.visible = goose.root.visible = judge.root.visible = sled.visible = false; seals.forEach(s => s.root.visible = false); rival.wig.visible = false; rival.shine.visible = true;
    parentTo(rocketG, g); rocketG.visible = true; rv.update(t); const tt = back ? t - E.space2 + E.space : t; const rp = back ? [0, 4 - (t - E.space2) * 0.8, -(t - E.space2) * 9] : AK(t);
    rocketG.position.set(...rp); rocketG.rotation.set(back ? Math.PI / 2 - 0.4 : -Math.PI / 2, 0, Math.sin(t * 0.4) * 0.2); flameG.visible = true; flameG.scale.set(1, back ? 0.2 : 0.6 + Math.sin(t * 30) * 0.08, 1); rocketLight.intensity = 20;
    earth.position.set(0, back ? -300 + (t - E.space2) * 8 : -300, rp[2] - 100); earth.rotation.y = t * 0.02; moonB2.position.set(30, 30, rp[2] - 500 + (back ? 400 : (t - E.space) * 4));
    const glow = back ? seg(t, E.reentry, E.reentry + 2) : 0; rv.meshes.forEach(m => { if (m.material.emissive) { m.material.emissive.set(glow > 0 ? '#ff4a10' : '#000000'); m.material.emissiveIntensity = glow * 0.8; } });
    // cabin crew (zero-G)
    const fl = (ph, amp = 0.3) => Math.sin(t * 1.2 + ph) * amp; const C0 = 400;
    pose(hero, { t, p: [C0 - 1, 1.4 + fl(0), 0.4], yaw: 0.3, face: back ? 'scared' : (t < E.upside ? 'smug' : 'normal'), panic: back && t > E.reentry, wave: !back && t < 90 }); parentTo(hero.root, g); hero.root.rotation.z = fl(1, 0.4); hero.root.visible = true; helmH.visible = true;
    poseRival(rival, t, [C0 + 2.4, 1.0 + fl(2), 0.6], -0.5, back ? { panic: true } : (t > E.bald ? { hold: true } : { hips: true })); parentTo(rival.root, g); rival.root.rotation.z = fl(3, 0.3); rival.root.visible = true; helmR.visible = !(win(t, E.bald, E.gauge)); helmHand.visible = win(t, E.bald, E.gauge);
    poseBurble(bloop6, t, [C0 + 1.0, 2.2 + fl(4), -1.2], 0.2, back ? { angry: true } : { handOut: true }); parentTo(bloop6.B.root, g); bloop6.B.root.rotation.z = fl(5, 0.4); bloop6.B.root.visible = true; helmB.visible = true; bHat.visible = true;
    poseLurk(L6, t, [C0 - 1.0, 4.6 + fl(6, 0.2), -1.4], 0.4, 0.6); parentTo(L6.root, g); L6.root.rotation.z = t > E.upside - 1 ? Math.PI : 0; L6.root.visible = true; if (t > E.upside - 1) L6.root.position.y = 4.4 + fl(6, 0.2);
    puff.root.visible = false; puffling.root.visible = false;
    papers.forEach((p, i) => { p.visible = !back || t < E.reentry; const a = t * 0.5 + i * 0.7; p.position.set(C0 + Math.sin(a * 1.3 + i) * 3.2, 2.3 + Math.cos(a + i * 2) * 1.8, Math.sin(a * 0.7 + i * 3) * 2); p.rotation.set(a, a * 1.4, i); });
    let cam = camKeys(t, C); if (!back && t < 86.6) cam = { p: [rp[0] + 9, rp[1] + 3, rp[2] + 8], l: [rp[0], rp[1], rp[2] - 6], fov: 52 }; if (!back && t >= 102.2) cam = { p: [rp[0] + 6, rp[1] + 4, rp[2] + 12], l: [rp[0], rp[1], rp[2] - 30], fov: 50 };
    if (back && (t < 205.1 || t >= 208.1)) cam = { p: [rp[0] + 10, rp[1] + 2, rp[2] + 10], l: [rp[0], rp[1] - 2, rp[2]], fov: 55 };
    return { cam, hud: true, space: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the Shard Moon (low gravity, no sun)
const moon = (() => {
  const g = mk('moon'), st = new VSet(g), r = rng(1003);
  const craters = [[-9, -14, 3], [9, -15, 3.5], [-14, 2, 2.5], [13, 1, 3], [0, -22, 4], [-20, -10, 3], [20, -8, 3]];
  for (let x = -45; x <= 45; x++) for (let z = -45; z <= 25; z++) { const inC = craters.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr); st.add(x, inC ? -1 : 0, z, 'moonrock'); if (inC) st.add(x, -2, z, 'moonrock');
    if (!inC && craters.some(([cx, cz, cr]) => Math.abs(Math.hypot(x - cx, z - cz) - cr - 0.5) < 0.7)) st.add(x, 1, z, 'moonrock'); }
  st.add(-7, 1, -10, 'moonrock'); st.add(-7, 2, -10, 'moonrock'); st.build();
  const earth2 = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 20), earthMat); earth2.position.set(90, 80, -260); g.add(earth2);
  const starM = basic('#ffffff'); for (let i = 0; i < 260; i++) { const a = r() * 6.28, b = Math.acos(r() * 0.95), d = 420; const s = box(1.2, 1.2, 1.2, 0, Math.cos(a) * Math.sin(b) * d, Math.cos(b) * d, Math.sin(a) * Math.sin(b) * d, g, starM); s.castShadow = false; }
  const sunPuff = new THREE.PointLight('#ff9a3a', 0, 40, 1.2); g.add(sunPuff);
  const homes = squishes.map((s, i) => { const c = craters[i % craters.length]; return [c[0] + Math.cos(i * 2.4) * 1.2, c[1] + Math.sin(i * 2.4) * 1.2]; });
  burst(E.moon, [0, 1, -6], { n: 120, colors: ['#9a96a8', '#c8c4d6', '#ffffff'], speed: 5, size: 0.3, life: 2.4, grav: 1.6, up: 2 });
  for (let t = E.bounce; t < E.squish; t += 1.96) burst(t, [-4 + Math.cos(t * 0.5) * 6, 0.6, -3 + Math.sin(t * 0.5) * 6], { n: 30, colors: ['#9a96a8', '#c8c4d6'], speed: 3, size: 0.25, life: 2, grav: 1.6, up: 1 });
  burst(E.split, [-7, 3.6, -10], { n: 90, colors: ['#ffe27a', '#ff8a1e', '#ffffff'], speed: 5, size: 0.2, life: 1.4, grav: 1, up: 2 });
  for (let t = E.launch2 - 0.6; t < E.space2; t += 0.12) burst(t, [0, Math.max(1, 1 + (t - E.launch2) ** 2 * 1.6 - 1), -6], { n: 8, colors: ['#ffffff', '#c8c4d6', '#ffb43a'], speed: 3, size: 0.6, life: 2.6, grav: 0.4, up: 0.5 });
  const C = [[E.moon, 14, 8, 14, 0, 2, -6, 55], [114.1, 12, 7, 12, 0, 2, -6, 52], [114.2, 0.4, 1.8, 3.6, -1.6, 1.6, -1.2, 46], [119.5, 1.0, 1.8, 3.0, -1.6, 1.6, -1.2, 46],
    [119.6, 0.5, 3.2, 7.5, 0.2, 2, 0, 50], [125.5, 0.0, 3.2, 7.0, 0.2, 2, 0, 50], [125.6, 8, 3, 10, -4, 5, -3, 55], [133.9, 9, 3, 10, -4, 5, -3, 55],
    [134.0, -4, 2, -6, -9, 0.5, -13, 46], [138.1, -4.4, 2, -6.4, -9, 0.5, -13, 44], [138.2, 3, 1.4, 4, 0, 1, -4, 50], [147.7, 2, 1.6, 4.4, 0, 1, -4, 50],
    [147.8, 2.6, 2.4, 2.6, 0, 1, -1.5, 46], [152.5, 2.2, 2.4, 2.2, 0, 1, -1.5, 46], [152.6, -1.4, 0.8, 3.2, 0, 1.6, -1.5, 52], [161.3, -1.8, 0.9, 3.6, 0, 1.6, -1.5, 52],
    [161.4, -3, 3, -4, -7, 3, -10, 48], [167.5, -3.4, 3, -4.6, -7, 3, -10, 46], [167.6, -2.6, 2.0, -1.4, -1, 1.8, 0.4, 44], [172.1, -2.8, 2.0, -1.8, -1, 1.8, 0.4, 44],
    [172.2, -4.4, 3.8, -7.4, -7, 3.4, -10, 42], [177.1, -4.8, 3.8, -7.8, -7, 3.4, -10, 40], [177.2, 6, 4, 6, -4, 2, -6, 52], [182.5, 5, 4, 7, -4, 2, -6, 52],
    [182.6, 1.4, 2.2, 0.6, 0.4, 1.8, -1.6, 44], [188.1, 1.2, 2.2, 0.2, 0.4, 1.8, -1.6, 44], [188.2, 10, 4.5, 5, 0, 2, -6, 52], [192.7, 9, 4.5, 4, 0, 2, -6, 52],
    [192.8, -9, 2, 4, -4, 6, -5, 55], [197.5, -10, 2, 4, -4, 8, -5, 55], [197.6, 10, 1, 6, 0, 8, -6, 58], [E.space2, 10, 1, 6, 0, 30, -6, 58]];
  function update(t) {
    rod.visible = false; crownM.visible = false; [drill, board, blue, card, bBrick, coins, shades, bow, taxiSign].forEach(m => m.visible = false); golem.root.visible = mailBird.root.visible = crownProp.visible = goose.root.visible = judge.root.visible = sled.visible = false; seals.forEach(s => s.root.visible = false);
    rival.wig.visible = false; rival.shine.visible = true; helmH.visible = helmR.visible = helmB.visible = true; helmHand.visible = false;
    // rocket (landed; bounced by the Moonsquish trampoline; then launched)
    parentTo(rocketG, g); rocketG.visible = true; rv.update(t); rv.meshes.forEach(m => { if (m.material.emissive) m.material.emissiveIntensity = 0; });
    const land = seg(t, E.moon - 1.2, E.moon), bounceR = win(t, E.bouncepad + 1, E.launch2) ? Math.abs(Math.sin(t * 4)) * 0.8 * seg(t, E.bouncepad, E.push) : 0;
    let ry = t < E.moon ? lerp(30, 1, land) : 1 + bounceR + (t < E.moon + 1.5 ? Math.abs(Math.sin((t - E.moon) * 6)) * 0.6 * (1 - seg(t, E.moon, E.moon + 1.5)) : 0);
    if (t > E.launch2) ry = 1 + (t - E.launch2) ** 2 * 1.6; rocketG.position.set(0, ry, -6); rocketG.rotation.set(0, 0, 0);
    const th = t < E.moon ? 0.5 : (t > E.launch2 - 0.4 ? 1 : 0); flameG.visible = th > 0; flameG.scale.set(1, th, 1); rocketLight.intensity = th * 30;
    const out = t > E.step - 1.5 && t < E.launch2 - 1.2;
    // hero
    const o = { t, p: [-1.6, 0.5 + lowG(t, 0), -1.2], yaw: 0.3, face: 'normal' };
    if (t < E.step) { const k = seg(t, E.step - 1.5, E.step + 0.5); o.p = [lerp(0, -1.6, k), 0.5 + Math.sin(k * Math.PI) * 1.6, lerp(-4.4, -1.2, k)]; o.yaw = 0.3; }
    if (win(t, E.flags, E.bounce)) { o.p = [-2.6, 0.5, 0.2]; o.yaw = 0.6; o.hold = true; o.face = 'smug'; }
    if (win(t, E.squish, E.warm)) { o.face = 'scared'; o.yaw = yawXZ([-1.6, -1.2], [-9, -13]); } if (win(t, E.meet, E.warm)) o.face = 'normal';
    if (win(t, E.stay, E.split)) { o.yaw = yawXZ([-1.6, -1.2], [-7, -10]); o.face = 'scared'; o.panic = t < E.stay + 6; }
    if (win(t, E.split, E.bouncepad)) { o.yaw = yawXZ([-1.6, -1.2], [-7, -10]); o.face = 'smug'; o.wave = t > E.split + 5; }
    if (win(t, E.bouncepad, E.launch2)) { o.p = [-2, 0.5 + lowG(t, 0) * 2, -3.4]; o.wave = true; o.face = 'smug'; }
    pose(hero, o); parentTo(hero.root, g); hero.root.visible = out;
    // prestin
    let pp = [1.8, 0.5 + lowG(t, 1.2), -1.4], py = yawXZ([1.8, -1.4], [-1.6, -1.2]), po = {};
    if (t < E.step + 1) { const k = seg(t, E.step - 0.5, E.step + 1.5); pp = [lerp(0, 1.8, k), 0.5 + Math.sin(k * Math.PI) * 1.4, lerp(-4.4, -1.4, k)]; }
    if (win(t, E.flags, E.bounce)) { pp = [2.6, 0.5, 0]; py = -0.6; po = { hold: true }; } if (win(t, E.squish, E.bow)) po = { panic: t < E.meet }; if (win(t, E.bouncepad, E.launch2)) po = { hop: true, hips: true };
    poseRival(rival, t, pp, py, po); parentTo(rival.root, g); rival.root.visible = out;
    // bloop
    let bp = [0.4, 0.5 + lowG(t, 2.4), -2.4], by = 0, bo = {};
    if (win(t, E.squish, E.warm)) bo = { angry: true }; if (win(t, 182.6, E.bouncepad)) bo = { handOut: true }; if (win(t, E.bouncepad, E.launch2)) { bp = [2.6, 0.5 + lowG(t, 2.4) * 2, -3.6]; bo = { hop: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = out && t > E.step - 0.6; bHat.visible = true; bHat.position.y = 1.2;
    // leggy — space kangaroo
    let lp = [-4, 0.5, -3], ly = 0.6, ls = 0.4;
    if (win(t, E.bounce, E.squish)) { const a = (t - E.bounce) * 0.5; lp = [-4 + Math.cos(a) * 6, 0.5 + Math.abs(Math.sin((t - E.bounce) * 1.6)) * 12, -3 + Math.sin(a) * 6]; ly = Math.atan2(-Math.sin(a), Math.cos(a)); ls = 2; }
    if (win(t, E.push, E.launch2)) { const k = seg(t, E.push, E.push + 3.4); lp = [-4 + k * 2.4, 0.5 + Math.sin(k * Math.PI) * 14, -4.8]; ly = Math.PI / 2; ls = 2; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = out && t > E.step; L6.root.rotation.z = 0; L6.body.rotation.z = 0;
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // puff + puffling
    parentTo(puff.root, g); puff.root.visible = t > E.warm - 1.4 && t < E.launch2 - 1.2; let fp = [0, 0.5, -3.8], big = false;
    if (t < E.warm) { const k = seg(t, E.warm - 1.4, E.warm); fp = [0, 0.6 + Math.sin(k * Math.PI) * 1.6 + 1.0 * (1 - k), lerp(-4.6, -1.5, k)]; } else if (t < E.stay) fp = [0, 0.5 + lowG(t, 4) * 0.5, -1.5];
    else if (t < E.split + 5) { const k = seg(t, E.stay, E.stay + 1.6); fp = [lerp(0, -7, k), lerp(0.5, 2.5, k) + Math.sin(k * Math.PI) * 2, lerp(-1.5, -10, k)]; big = true; }
    else { const k = seg(t, E.split + 5, E.split + 6.6); fp = [lerp(-7, head[0], k), lerp(2.5, head[1], k) + Math.sin(k * Math.PI) * 2, lerp(-10, head[2], k)]; }
    poseMag(puff, t, fp, 0.3, { big, hop: win(t, E.warm, E.stay) }); sunPuff.position.set(fp[0], fp[1] + 1.5, fp[2]); sunPuff.intensity = t > E.warm ? 60 : 0;
    parentTo(puffling.root, g); puffling.root.visible = t > E.split; poseMag(puffling, t, [-7.4, 2.5, -9.6], 0.4, { big: t > E.split + 5 });
    const warmK = (t2 => seg(t2, E.warm, E.warm + 3))(t);
    // Moonsquish
    squishes.forEach((s, i) => { parentTo(s.root, g); s.root.visible = t > E.squish + i * 0.25; const h = homes[i]; let p = [h[0], -0.5, h[1]], o2 = { shiver: t < E.warm, warm: warmK };
      if (t < E.meet) { const k = seg(t, E.squish + i * 0.25, E.squish + i * 0.25 + 0.6); p[1] = lerp(-1.6, -0.5, k); o2.hop = false; }
      else if (t < E.warm) { const k = seg(t, E.meet, E.meet + 4); p = [lerp(h[0], Math.cos(i * 0.52) * 7, k), 0.5, lerp(h[1], -3 + Math.sin(i * 0.52) * 6, k)]; o2.hop = k < 1; }
      else if (t < E.stay) { const a = i * 0.52 + (t - E.warm) * 0.2; p = [Math.cos(a) * 3.4, 0.5, -1.5 + Math.sin(a) * 3.4]; o2.hop = t < E.bow; o2.bow = t > E.bow; }
      else if (t < E.bouncepad) { const a = i * 0.52; p = [-7 + Math.cos(a) * 3, 0.5, -10 + Math.sin(a) * 3]; o2.bow = true; }
      else { const a = i * 0.52; p = [Math.cos(a) * 2.6, 0.5, -6 + Math.sin(a) * 2.6]; o2.hop = true; o2.fast = true; o2.big = 0.9; }
      poseSquish(s, t, p, yawXZ([p[0], p[2]], t > E.stay && t < E.bouncepad ? [-7, -10] : [0, -2]), o2); });
    // flags
    parentTo(flagS, g); parentTo(flagG, g); flagS.visible = flagG.visible = t > E.flags + 1; flagS.position.set(-3.4, 0.5, 0.6); flagG.position.set(3.4, 0.5, 0.4); flagS.rotation.y = 0.3 + Math.sin(t * 2) * 0.1; flagG.rotation.y = Math.PI - 0.3 + Math.cos(t * 2) * 0.1;
    let cam = camKeys(t, C); if (t < E.moon + 0.8) cam = { p: [12, 6, 12], l: [0, ry + 4, -6], fov: 55 };
    if (win(t, E.bounce, E.squish)) cam = { p: [8, 4 + L6.root.position.y * 0.5, 10], l: [L6.root.position.x, L6.root.position.y + 1, L6.root.position.z], fov: 55 };
    return { cam, hud: true, space: true };
  }
  return { g, update };
})();
