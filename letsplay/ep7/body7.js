// ================================================================ EPISODE 7: "THE ICEBERG (it melts)" — dawn beach → foggy sea → iceberg (Frostbite Cup) → sunset beach
TX.snow = ctex(16, (g, r, n) => { noisy(['#f4fbff', '#e8f4fc', '#ffffff', '#dcecf8'])(g, r, n); g.fillStyle = '#c8e0f2'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 71);
TX.ice = ctex(16, (g, r, n) => { noisy(['#9fdcf5', '#8fd0ee', '#b4e8fa', '#7cc4e6'])(g, r, n); g.fillStyle = '#e8f8ff'; for (let i = 0; i < 4; i++) g.fillRect(Math.floor(r() * 12), Math.floor(r() * 14), 4, 1); }, 72);
MAT.snow = lam(TX.snow); MAT.ice = lam(TX.ice, { emissive: '#3a8ac0', emissiveIntensity: 0.12 });
const holeMat = new THREE.MeshBasicMaterial({ color: '#12305a' });
function bannerTex(txt) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#1b2a6a'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 512, 8); g.fillRect(0, 88, 512, 8); g.font = 'bold 54px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(txt, 256, 52); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// --- new NPCs: Judge Flopsy + contestant seals
function makeSeal(col = '#9aa8b8', judge = false) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 0.8, 1.6, col, 0, 0.4, 0, body); box(0.7, 0.5, 0.8, shade(col, 0.9), 0, 0.28, -1.1, body); box(0.8, 0.3, 1.2, '#e8eef4', 0, 0.14, 0.15, body);
  const tail = pivot(body, 0, 0.15, -1.5); box(0.9, 0.12, 0.4, shade(col, 0.8), 0, 0, -0.15, tail);
  const hd = pivot(body, 0, 0.9, 0.6); box(0.78, 0.7, 0.72, col, 0, 0.2, 0.1, hd);
  for (const x of [-0.2, 0.2]) { box(0.13, 0.15, 0.04, '#111', x, 0.32, 0.47, hd); box(0.05, 0.05, 0.02, '#fff', x + 0.03, 0.36, 0.495, hd); box(0.4, 0.02, 0.02, '#ffffff', x * 1.7, 0.06, 0.58, hd); }
  box(0.38, 0.22, 0.2, '#d8dee6', 0, 0.06, 0.52, hd); box(0.14, 0.1, 0.06, '#222', 0, 0.14, 0.63, hd);
  const fL = pivot(body, -0.48, 0.25, 0.4), fR = pivot(body, 0.48, 0.25, 0.4); box(0.5, 0.1, 0.35, shade(col, 0.8), -0.22, 0, 0, fL); box(0.5, 0.1, 0.35, shade(col, 0.8), 0.22, 0, 0, fR);
  if (judge) { box(0.62, 0.08, 0.62, '#1a1a2a', 0, 0.58, 0.1, hd); box(0.42, 0.14, 0.42, '#1a1a2a', 0, 0.67, 0.1, hd); box(0.05, 0.3, 0.05, '#ffd23f', 0.26, 0.5, 0.36, hd);
    box(0.4, 0.14, 0.06, '#e8344e', 0, -0.22, 0.5, hd); box(0.14, 0.1, 0.22, '#ffd23f', 0.16, 0.02, 0.66, hd); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, hd, fL, fR, tail };
}
function poseSeal(s, t, p, yaw, o = {}) {
  const sd = o.seed || 0; s.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 7 + sd)) * 0.4 : 0), p[2]); s.root.rotation.set(0, yaw, 0);
  s.hd.rotation.set(-0.15 + Math.sin(t * 1.7 + sd) * 0.1 + (o.look || 0), Math.sin(t * 0.9 + sd) * 0.3, 0);
  const cl = o.clap ? Math.sin(t * 18) * 0.6 : Math.sin(t * 2 + sd) * 0.1; s.fL.rotation.set(0, cl, -0.3); s.fR.rotation.set(0, -cl, 0.3); s.tail.rotation.x = Math.sin(t * 3 + sd) * 0.2;
  s.body.rotation.x = o.slide ? 0.12 : 0;
}
// --- Glubzilla, the crowned giant fish
function makeBigFish() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(2.2, 2.0, 4.4, '#2fa88c', 0, 0, 0, body); box(1.9, 0.5, 4.0, '#c8f0e0', 0, -0.85, 0.1, body); box(0.3, 1.2, 1.6, '#1f7a66', 0, 1.4, -0.2, body);
  const tail = pivot(body, 0, 0, -2.2); box(0.3, 2.4, 1.4, '#1f7a66', 0, 0, -0.7, tail);
  for (const x of [-1.12, 1.12]) { box(0.1, 0.55, 0.55, '#ffffff', x, 0.45, 1.4, body); box(0.12, 0.26, 0.26, '#111', x * 1.02, 0.4, 1.5, body); const b = box(0.12, 0.12, 0.7, '#14303a', x * 1.02, 0.8, 1.4, body); b.rotation.x = x > 0 ? 0.3 : 0.3; }
  box(1.6, 0.3, 0.1, '#14303a', 0, -0.3, 2.21, body); for (let i = 0; i < 5; i++) box(0.14, 0.16, 0.06, '#ffffff', -0.56 + i * 0.28, -0.2, 2.26, body);
  const gold = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.5 }); box(1.2, 0.3, 1.0, 0, 0, 1.15, 1.0, body, gold);
  for (const x of [-0.45, 0, 0.45]) box(0.18, 0.35, 0.18, 0, x, 1.45, 1.0, body, gold);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, tail };
}
// --- props: raft (+ Drillbert motor), handheld Drillbert, bait bucket, trophy, catches, fishing line
const raftG = new THREE.Group(), raftVS = new VSet(raftG, true);
{ const cells = []; for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) cells.push([x, 0, z, 'plank']); for (const x of [-2, 2]) for (const z of [-1, 1]) cells.push([x, 1, z, 'log']); cells.push([-2, 2, 0, 'log'], [-2, 3, 0, 'log']);
  cells.forEach((c, i) => raftVS.add(c[0], c[1], c[2], c[3], { t0: E.make + 0.4 + i * (E.makeEnd - E.make - 2) / cells.length })); raftVS.build(); }
const rflag = box(0.06, 0.6, 0.9, '#ff4d6d', -2, 3.3, 0.5, raftG);
const motor = new THREE.Group(); motor.position.set(2.9, 0.2, 0); raftG.add(motor); box(0.6, 0.5, 0.8, '#ffd400', 0, 0, 0, motor); box(0.2, 0.2, 0.82, '#e8344e', 0, 0.2, 0, motor);
const mbit = pivot(motor, 0.4, -0.45, 0); for (let i = 0; i < 3; i++) { const b = box(0.08, 0.5, 0.14, '#9aa4bd', 0.1, 0, 0, pivot(mbit, 0, 0, 0)); b.parent.rotation.x = i * Math.PI * 2 / 3; }
const drill = new THREE.Group(); bloop6.B.aR.add(drill); drill.position.set(0, -0.62, 0.25); box(0.3, 0.3, 0.5, '#ffd400', 0, 0, 0, drill); box(0.2, 0.12, 0.12, '#e8344e', 0, 0.12, -0.2, drill);
const dbit = pivot(drill, 0, 0, 0.3); box(0.1, 0.1, 0.6, '#9aa4bd', 0, 0, 0.3, dbit); box(0.16, 0.04, 0.4, '#9aa4bd', 0, 0, 0.3, dbit);
const bucket = new THREE.Group(), bMat = new THREE.MeshLambertMaterial({ color: '#3d7bff', emissive: '#ff6a1a', emissiveIntensity: 0 });
box(0.55, 0.5, 0.55, 0, 0, 0.25, 0, bucket, bMat); box(0.6, 0.06, 0.6, '#ffffff', 0, 0.5, 0, bucket); box(0.04, 0.3, 0.62, '#888888', 0, 0.62, 0, bucket);
const goldM = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.5 });
const trophy = new THREE.Group(); box(0.46, 0.14, 0.36, '#7a4a2a', 0, 0, 0, trophy); const tFish = pivot(trophy, 0, 0.08, 0); box(0.62, 0.34, 0.2, 0, 0, 0.3, 0, tFish, goldM); box(0.06, 0.32, 0.26, 0, -0.34, 0.32, 0, tFish, goldM); box(0.06, 0.06, 0.22, '#111', 0.2, 0.36, 0, tFish);
const puddle = box(0.9, 0.04, 0.7, '#ffd23f', 0, 0.02, 0, trophy, goldM);
const catches = {}; { const bt = new THREE.Group(); box(0.3, 0.45, 0.3, '#5a3a22', 0, 0, 0, bt); box(0.32, 0.2, 0.55, '#5a3a22', 0, -0.2, 0.12, bt); box(0.34, 0.06, 0.58, '#222', 0, -0.32, 0.12, bt); catches.boot = bt;
  const cu = new THREE.Mesh(GEO, MAT.ice); cu.scale.setScalar(0.45); const cg = new THREE.Group(); cg.add(cu); catches.cube = cg;
  const tf = new THREE.Group(); box(0.16, 0.22, 0.4, '#ff9a2a', 0, 0, 0, tf); box(0.04, 0.2, 0.16, '#e8561a', 0, 0, -0.26, tf); box(0.04, 0.05, 0.05, '#111', 0.08, 0.05, 0.12, tf); catches.tiny = tf; }
const fline = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1, 0.025), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
const rope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, 0.06), new THREE.MeshLambertMaterial({ color: '#c9a46a' }));
const judge = makeSeal('#9aa8b8', true), seals = ['#7d8a99', '#a69888', '#8aa0a8'].map(c => makeSeal(c)), sfish = seals.map(() => { const f = catches.tiny.clone(); f.scale.setScalar(1.6); return f; });
const glub = makeBigFish();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function rodTip() { hero.root.updateMatrixWorld(true); return rod.children[0].localToWorld(_v1.set(0, 0, 1.2)).clone(); }
function seaSet(g) { const s = new THREE.Mesh(GEO, MAT.water); s.scale.set(900, 2, 900); s.position.set(0, -1.2, 0); s.castShadow = false; s.receiveShadow = false; g.add(s); return s; }
function iceAt(t) { if (t < E.wet) return 1; if (t < E.crack) return lerp(1, 0.7, seg(t, E.wet, E.crack)); if (t < E.jump) return lerp(0.6, 0.12, seg(t, E.crack, E.jump)); if (t < E.sink) return 0.8; return lerp(0.8, 0, seg(t, E.sink, E.sink + 5)); }
function poseLeggySplay(k) { if (k <= 0) return; L6.body.position.y = lerp(L6.body.position.y, 0.55, k); L6.legs.forEach((l, i) => { l.rotation.z = (i < 3 ? 1 : -1) * 1.1 * k; l.rotation.x = 0; }); }

// ---------------------------------------------------------------- set A: the beach (dawn start + sunset finale)
const shore = (() => {
  const g = mk('shore'), st = new VSet(g), r = rng(701);
  for (let x = -50; x <= 50; x++) for (let z = -40; z <= 0; z++) st.add(x, 0, z, z > -6 ? 'sand' : 'turf');
  for (let z = 1; z <= 9; z++) for (const x of [-1, 0, 1]) st.add(x, 0, z, 'plank');
  for (const z of [3, 6, 9]) for (const x of [-1, 1]) st.add(x, -1, z, 'log');
  const trees = []; for (let i = 0; i < 80; i++) { const x = Math.round((r() - .5) * 96), z = Math.round(-38 + r() * 28); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (Math.abs(x) < 12 && z > -14)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (let i = 0; i < 18; i++) st.add(Math.round((r() - .5) * 60), 1, Math.round(-2 - r() * 3), r() < 0.5 ? 'stone' : 'sand');
  st.build(); seaSet(g);
  const berg = new THREE.Group(); berg.position.set(30, -1, 170); g.add(berg); box(60, 14, 30, 0, 0, 7, 0, berg, MAT.ice); box(30, 8, 20, 0, 6, 17, 0, berg, MAT.snow);
  // drips / sparkle / finale steam
  for (let t = 0.3; t < 30; t += 2.5) burst(t, [0.5 + Math.sin(t) * 10, 0.2, 4 + Math.cos(t) * 5], { n: 6, colors: ['#bfe8ff', '#ffffff'], speed: 1, size: 0.12, life: 0.8, grav: 6, up: 1 });
  burst(E.judge + 2.4, [-1.5, 0.6, 1.4], { n: 40, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 4, size: 0.16, life: 0.8, grav: 10, up: 3 });
  for (let k = 0; k < 9; k++) burst(E.make + 1 + k * 1.0, [Math.sin(k) * 2, 0.6, 11 + Math.cos(k) * 1.2], { n: 8, colors: ['#e0a95a', '#ffffff'], speed: 2.5, size: 0.12, life: 0.6, grav: 10 });
  smoke(E.shore, 300, 0.5, t => [1.2 + Math.sin(t * 5) * 0.2, 1.1, -0.2], { n: 2, colors: ['#ffffff', '#e0e0e0'], size: 0.25, life: 1.6, up: 1.2, grav: -0.6, speed: 0.3 });
  smoke(243.2, 247, 0.12, t => [-3.5 + Math.sin(t * 9) * 1.5, 1.6, -2.6], { n: 4, colors: ['#5aa8ff', '#bfe8ff'], size: 0.12, life: 0.7, up: 2, grav: 10, speed: 3 });
  burst(247.6, [6, 0, 34], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.4, life: 1.4, grav: 10, up: 6 }); burst(249.7, [12, 0, 40], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.4, life: 1.4, grav: 10, up: 6 });
  const C1 = [[0, 18, 7, 20, 0, 1, -1, 55], [6.0, 13, 5, 15, 0, 1, -1, 52], [6.01, 2.8, 1.8, 4.6, 0, 1.8, -1.5, 48], [12.9, 2.2, 1.7, 4.0, 0, 1.8, -1.5, 48],
    [17.0, -6.5, 3.2, 8.5, -1.5, 1.2, -1, 52], [24.5, -4.5, 2.8, 7.4, -1, 1.2, -1, 52], [35.5, 9, 4, 18, 0, 0.6, 11, 52], [36, 9, 4, 18, 0, 0.6, 11, 52]];
  const C2 = [[E.shore, 14, 4, 12, 0, 1, -1, 52], [238.5, 11, 3.5, 10, 0, 1, -1, 52], [238.6, 1.5, 1.0, 2.4, 0.4, 1.6, -1.2, 48], [243.1, 2.2, 1.1, 1.8, 0.4, 1.6, -1.2, 48],
    [243.2, -6.4, 2.0, 3.2, -3.6, 1.3, -2.6, 46], [246.7, -7.0, 2.2, 2.4, -3.6, 1.3, -2.6, 46], [246.8, 0.6, 1.8, -5.5, 8, 2, 36, 46], [251.7, 1.0, 1.9, -5.0, 9, 2, 38, 46],
    [251.8, 3.0, 1.3, 2.2, 1.4, 0.7, -0.4, 44], [256.9, 2.6, 1.2, 1.6, 1.4, 0.7, -0.4, 44], [257.0, 6, 3, 9, 1, 1.2, -1.5, 50], [263.1, 5, 2.8, 8, 1, 1.2, -1.5, 50],
    [263.2, 1.0, 2.0, 4.8, 1.0, 1.4, -1.1, 50], [271.1, 0.8, 1.9, 4.2, 1.0, 1.4, -1.1, 48], [271.2, 3.4, 1.9, 3.4, 2.4, 2.1, -1.0, 50], [280.7, 2.9, 2.0, 1.8, 2.4, 2.1, -1.0, 38],
    [280.8, 1.4, 2.5, 6.8, 1.0, 1.4, -1.5, 48], [E.logo, 1.4, 2.5, 6.4, 1.0, 1.4, -1.5, 48]];
  function update(t) {
    const late = t >= E.shore;
    raftG.visible = !late && t > E.make; if (raftG.visible) { parentTo(raftG, g); raftVS.update(t); raftG.position.set(0, -0.45 + Math.sin(t * 2) * 0.04, 11); raftG.rotation.set(0, 0, Math.sin(t * 1.3) * 0.02); motor.visible = false; rflag.visible = t > E.makeEnd - 1; }
    bucket.visible = !late && t > 5; parentTo(bucket, g); bucket.position.set(0.7, 0.5, 6.5); bMat.emissiveIntensity = 0;
    rod.visible = false; fline.visible = rope.visible = false; trophy.visible = false; glub.root.visible = late && win(t, 247, 251);
    if (glub.root.visible) { parentTo(glub.root, g); const k = seg(t, 247.4, 250.0); glub.root.position.set(lerp(6, 12, k), -1 + Math.sin(k * Math.PI) * 6, lerp(34, 40, k)); glub.root.rotation.set(-Math.cos(k * Math.PI) * 0.8, 0.6, 0); glub.tail.rotation.y = Math.sin(t * 12) * 0.5; }
    seals.forEach(s => s.root.visible = false); sfish.forEach(f => f.visible = false);
    // judge (start only)
    judge.root.visible = !late && t > E.judge; if (judge.root.visible) { parentTo(judge.root, g); const k = seg(t, E.judge, E.judge + 2.4); poseSeal(judge, t, [lerp(-8, -1.6, k), lerp(-0.6, 0.5, Math.min(1, k * 1.6)), lerp(14, 1.2, k)], k < 1 ? Math.atan2(6.4, -12.8) : 0.5, { slide: k < 1, clap: win(t, E.poster, E.poster + 1.5), seed: 1 }); }
    // leggy
    let lp = [-3.6, 0.5, -2.6], ly = 0.5, ls = 0.3; if (late) { lp = [-3.6, 0.5, -2.6]; ly = 0.9; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); if (late && win(t, 243.2, 247)) { L6.root.rotation.z = Math.sin(t * 40) * 0.12; } else L6.root.rotation.z = 0;
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // puff
    puff.root.visible = (t < 31.6) || late; parentTo(puff.root, g);
    let pp = head, py = ly, po = {};
    if (!late) { if (t > 8.8) { const k = seg(t, 8.8, 10); pp = [lerp(head[0], -1.6, k), lerp(head[1], 0.5, k) + Math.sin(k * Math.PI) * 1.4, lerp(head[2], 0.4, k)]; py = 0.3; }
      if (t > 30) { const k = seg(t, 30, 31.6); pp = [lerp(-1.6, 0.7, k), lerp(0.5, 1.1, k) + Math.sin(k * Math.PI) * 2, lerp(0.4, 6.5, k)]; } }
    else { pp = [1.3, 0.5, -0.3]; py = 0.4; po = { hop: win(t, 251.8, 253) }; }
    poseMag(puff, t, pp, py, po);
    // hero
    const o = { t, p: [0, 0.5, -1.5], yaw: 0, mallet: false, face: 'normal' };
    if (!late) { if (t < 4) o.wave = true; else if (t < 8) o.hips = true; else if (t < 12.8) o.yaw = yawTo([0, 0, -1.5], [-3.6, 0, -2.6]); else if (t < E.poster) o.yaw = -1.0;
      if (win(t, 23.6, 26)) { o.wave = true; o.face = 'smug'; } if (t > E.make) { o.p = [-1.4, 0.5, 2]; o.yaw = 0.2; o.hips = true; } }
    else { o.p = [0, 0.5, -1.5]; o.face = 'scared'; o.yaw = 0.3; if (t > 236) o.face = 'normal'; if (t > E.bill - 0.2) { o.p = [2.4, 0.5, -1.0]; o.yaw = t < 271.2 ? -1.3 : 0.25; o.face = t > 276.8 ? 'scared' : 'normal'; } if (t > 280.8) o.hips = false; if (win(t, 257, 263)) o.hips = true; }
    pose(hero, o); parentTo(hero.root, g); if (late && t < 246) hero.root.rotation.z = Math.sin(t * 30) * 0.03;
    // bloop
    let bp = [2.6, 0.5, -1.8], by = -0.8, bo = {};
    if (!late) { if (t < 12) bo = { handOut: true }; if (win(t, E.make, E.makeEnd)) { const a = (t - E.make) * 0.9; bp = [Math.cos(a) * 3.2, 0.5, 11 + Math.sin(a) * 2.2]; bp[1] = Math.abs(bp[0]) < 1.5 && bp[2] > 0.5 && bp[2] < 9.5 ? 0.5 : -0.2; by = a + Math.PI / 2; bo = { walk: 1, phase: t * 14 }; if (Math.abs(bp[0]) > 1.6) bp[1] = 0.05; } if (t > E.makeEnd) { bp = [0.8, 0.05, 10.6]; by = Math.PI; } }
    else { bp = [-1.8, 0.5, -0.6]; by = 0.6; if (t > E.bill - 0.2) { bp = [-0.6, 0.5, -1.2]; by = Math.PI / 2; bo = { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true;
    bBrick.visible = false; blue.visible = false; card.visible = (!late && t < 12) || (late && t > E.bill - 0.2); card.scale.set(1, late && t > E.bill ? lerp(1, 4.5, seg(t, E.bill, E.bill + 1.5)) : 1, 1); if (late && t > E.bill) card.position.y = -0.62 - (card.scale.y - 1) * 0.24;
    drill.visible = !late && win(t, 33, 36); bHat.scale.set(1, 1, 1); bHat.rotation.z = 0; board.visible = false;
    let cam = camKeys(t, late ? C2 : C1);
    if (!late && win(t, E.judge, E.poster)) { const j = judge.root.position; cam = { p: [j.x + 3, 1.8, j.z + 5], l: [j.x, 0.9, j.z], fov: 50 }; }
    if (!late && win(t, E.make, E.makeEnd)) { const a = (t - E.make) * 0.25; cam = { p: [Math.sin(a) * 10, 4, 11 + Math.cos(a) * 10], l: [0, 0.5, 10], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: foggy sea + the iceberg
const bergSet = (() => {
  const g = mk('berg'), A = new THREE.Group(), B = new THREE.Group(); g.add(A, B);
  const sa = new VSet(A), sb = new VSet(B);
  for (let y = -3; y <= 4; y++) { const f = 1 + (4 - y) * 0.06; for (let x = -18; x <= 18; x++) for (let z = -12; z <= 12; z++) {
    const q = (x / (15 * f)) ** 2 + (z / (10 * f)) ** 2 + (vnoise(x * 0.3, z * 0.3, y + 20) - 0.5) * 0.25; if (q > 1) continue; (x < 2 ? sa : sb).add(x, y, z, y === 4 ? 'snow' : 'ice'); } }
  for (const [x, z, h] of [[12, -5, 4], [13, 2, 3]]) { for (let y = 5; y < 5 + h; y++) sb.add(x, y, z, 'ice'); sb.add(x, 5 + h, z, 'snow'); }
  for (const x of [3, 9]) for (let y = 5; y <= 7; y++) sb.add(x, y, -7, 'log');
  sa.build(); sb.build(); seaSet(g);
  const ban = new THREE.Mesh(new THREE.BoxGeometry(6, 1.1, 0.08), new THREE.MeshBasicMaterial({ map: bannerTex('FROSTBITE CUP') })); ban.position.set(6, 7.4, -7); B.add(ban);
  const fr = rng(702); for (let i = 0; i < 14; i++) { const a = fr() * 6.28, d = 24 + fr() * 40; box(1 + fr() * 2, 0.8, 1 + fr() * 2, 0, Math.cos(a) * d, -0.2, Math.sin(a) * d, g, MAT.ice); }
  const hole = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), holeMat); hole.position.set(-6.6, 4.52, 2); A.add(hole);
  const sHoles = [[6, -6], [10, 4], [5, 6]].map(([x, z]) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), holeMat); h.position.set(x, 4.52, z + (z < 0 ? 1.4 : -1.4)); B.add(h); return h; });
  const dots = []; for (let k = 0; k < 9; k++) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), holeMat); h.position.set(2, 4.52, -8 + k * 2); B.add(h); dots.push(h); }
  // --- motion helpers
  const AK = [[E.bite, -30, 0, 6], [182, -44, 0, -6], [188, -34, 0, -20], [E.jump, -14, 0, -22]];
  const Apos = t => { if (t < E.crack) return [0, 0]; if (t < E.bite) { const k = ss(seg(t, E.crack, E.bite)); return [lerp(0, -30, k), lerp(0, 6, k)]; } const p = track(Math.min(t, E.jump), AK).p; return [p[0], p[2]]; };
  const Asy = t => t < E.wet ? 1 : t < E.crack ? lerp(1, 0.85, seg(t, E.wet, E.crack)) : t < E.bite ? lerp(0.85, 0.55, seg(t, E.crack, E.bite)) : t < E.jump ? lerp(0.55, 0.3, seg(t, E.bite, E.jump)) : lerp(0.3, 0.001, seg(t, E.jump, E.jump + 2));
  const Asx = t => t < E.bite ? lerp(1, 0.85, seg(t, E.crack, E.bite)) : t < E.jump ? lerp(0.85, 0.6, seg(t, E.bite, E.jump)) : lerp(0.6, 0.001, seg(t, E.jump, E.jump + 2));
  const onA = (t, lx, lz) => { const a = Apos(t), s = Asx(t); return [a[0] + lx * s, 4.5 * Asy(t), a[1] + lz * s]; };
  const Bsy = t => t < E.sink ? 1 : lerp(1, 0.001, seg(t, E.sink, E.sink + 5)), Bsx = t => t < E.sink ? 1 : lerp(1, 0.6, seg(t, E.sink, E.sink + 5));
  const onB = (t, x, z) => { const s = Bsx(t), top = 4.5 * Bsy(t); return [x * s, top < -0.6 ? -0.8 + Math.sin(t * 2 + x) * 0.1 : top, z * s]; };
  const RK = [[E.sail, 70, -0.45, 20], [E.arrive, 19, -0.45, 2], [E.race, 19, -0.45, 2], [172, 10, -0.45, 18], [E.bite, -20, -0.45, 20], [182, -42, -0.45, -14], [188, -32, -0.45, -28], [E.jump, -12, -0.45, -30], [198, -6, -0.45, -12], [E.land, -1.5, -0.45, -2]];
  const raftAt = t => { const w = track(t, RK); return { p: w.p, yaw: Math.hypot(w.v[0], w.v[2]) > 0.1 ? Math.atan2(w.v[0], w.v[2]) : -Math.PI / 2 }; };
  const towAt = t => { if (t < E.jump) { const a = Apos(t); return [a[0], a[1]]; } const r = raftAt(t).p; return [r[0], r[2]]; };
  // --- particles
  for (let k = 0; k < 9; k++) burst(E.drill + 0.8 + k * 1.55, [2, 4.7, -8 + k * 2], { n: 14, colors: ['#ffffff', '#bfe8ff'], speed: 3, size: 0.12, life: 0.7, grav: 9, up: 2 });
  for (const [s, at] of [[E.boot, 0], [E.cube, 0], [E.tiny, 0]]) burst(s, [-6.6, 4.6, 2], { n: 30, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 3, size: 0.12, life: 0.8, grav: 10, up: 3 });
  for (let i = 0; i < 3; i++) for (let k = 0; k < 7; k++) { const s = 84 + i * 3 + k * 9.5; if (s < E.crack) burst(s, [[6, -4.6], [10, 2.6], [5, 4.6]][i].reduce((a, v, j) => (a[j ? 2 : 0] = v, a), [0, 4.6, 0]), { n: 18, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 2.5, size: 0.12, life: 0.7, grav: 10, up: 3 }); }
  smoke(E.wet + 4, E.reveal, 0.35, [-4.2, 5.2, 3.2], { n: 3, colors: ['#ffffff', '#e8eef2'], size: 0.2, life: 1.4, up: 1.2, grav: -0.8, speed: 0.3 });
  burst(E.reveal, [-4.2, 5.3, 3.2], { n: 60, colors: ['#ffffff', '#ffb43a', '#ff7a1a'], speed: 4, size: 0.2, life: 1, grav: 4, up: 3 });
  for (let k = 0; k < 12; k++) burst(E.crack - 1 + k * 0.25, [2, 4.6, -9 + k * 1.6], { n: 16, colors: ['#ffffff', '#bfe8ff', '#5aa8ff'], speed: 4, size: 0.2, life: 1, grav: 10, up: 4 });
  for (let t = E.race; t < E.land; t += 0.12) { const r = raftAt(t).p; burst(t, [r[0] + 0.5, -0.1, r[2]], { n: 3, colors: ['#ffffff', '#bfe8ff'], speed: 1.5, size: 0.2, life: 0.8, grav: 6, up: 1.2 }); }
  burst(E.bite, [-40, 0, 6], { n: 160, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 8, size: 0.3, life: 1.5, grav: 10, up: 8 });
  for (let t = E.bite + 2; t < E.land; t += 0.2) { const a = towAt(t + 1.6); burst(t, [a[0] - 1, 0, a[1]], { n: 4, colors: ['#ffffff', '#bfe8ff'], speed: 2, size: 0.25, life: 0.8, grav: 8, up: 2 }); }
  burst(E.jump, [-14, 1, -22], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.25, life: 1.2, grav: 10, up: 5 });
  burst(E.land, [0, 1.5, -1], { n: 160, colors: ['#ffffff', '#bfe8ff', '#5aa8ff', '#e0a95a'], speed: 8, size: 0.25, life: 1.4, grav: 10, up: 6 });
  for (let k = 0; k < 8; k++) burst(E.win + 0.3 + k * 0.5, [5 + Math.sin(k) * 2, 8, Math.cos(k) * 2], { n: 40, colors: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b'], speed: 5, size: 0.16, life: 2, grav: 4, up: 3 });
  smoke(E.melt + 0.5, E.sink, 0.25, t => { const h = rodTip(); return [h.x, h.y, h.z]; }, { n: 3, colors: ['#ffffff', '#ffd23f'], size: 0.15, life: 1, up: 1, grav: -0.5, speed: 0.4 });
  for (let k = 0; k < 10; k++) burst(E.sink + k * 0.6, [(k % 2 ? 4 : 10) + Math.sin(k) * 3, 0, Math.cos(k * 2) * 6], { n: 50, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.3, life: 1.3, grav: 10, up: 6 });
  // --- camera
  const C = [[E.arrive, 32, 14, 30, 4, 3, 0, 55], [55.5, 26, 12, 28, 4, 3, 0, 55],
    [71.0, 2, 22, 14, 2, 4, 0, 50], [77.9, -1, 20, 15, 2, 4, 0, 50], [78.0, 3.6, 6.2, 2.0, 7, 5.4, 0, 45], [80.3, 3.4, 6.0, 1.4, 7, 5.4, 0, 45],
    [80.4, -0.4, 7.4, 8.2, -5.6, 4.9, 2, 52], [89.9, -1.2, 7.0, 7.4, -5.6, 4.9, 2, 50], [90.0, -6.4, 5.4, 6.4, -6, 5.4, 2, 48], [97.9, -6.0, 5.4, 6.0, -6, 5.6, 2, 46],
    [98.0, 14, 9, 16, 0, 5, 0, 55], [106.5, 12, 8, 17, 0, 5, 0, 55], [106.6, -0.6, 6.2, 8.4, -4, 5, 2.5, 50], [114.5, -1.4, 6.0, 7.8, -4, 5, 2.5, 50],
    [121.0, 1.4, 6.6, 6.2, -4.4, 5.1, 1.4, 50], [126.3, 0.8, 6.4, 5.6, -4.4, 5.1, 1.4, 48], [126.4, -1.0, 6.2, 6.8, -4.6, 4.9, 2.6, 46], [132.9, -1.6, 6.0, 6.2, -4.6, 4.9, 2.6, 44],
    [133.0, -9, 4.9, 7, -5, 5, 2, 50], [139.9, -8.6, 5.0, 6.4, -5, 5, 2, 50], [140.0, -4.4, 6.4, 7.6, -7.0, 5.2, 3.6, 46], [144.9, -5.0, 6.2, 7.0, -7.0, 5.3, 3.6, 44],
    [145.0, -4.0, 8.2, 12.0, 1.5, 4.8, -1.0, 50], [E.crack - 0.1, -3.0, 7.6, 10.5, 2.0, 4.8, -2.0, 46], [E.crack, -6, 18, 24, -4, 3, 0, 55], [E.mount - 0.1, -12, 16, 27, -10, 3, 2, 55],
    [E.mount, 24, 3, 8, 18.5, 0.6, 2, 50], [E.race - 0.1, 23, 3.2, 6, 18.5, 0.6, 2, 50],
    [E.land, -6, 9, 15, 4, 4.5, 0, 55], [E.win - 0.1, -3, 8, 13, 4, 4.5, 0, 55], [E.win, 0.6, 6.4, 5.0, 3.0, 5.4, -0.6, 48], [E.melt - 0.1, 0.2, 6.2, 4.4, 3.0, 5.4, -0.6, 46],
    [E.melt, 0.4, 6.0, 3.6, 3.2, 5.5, -0.8, 44], [E.sink - 0.1, 0.8, 5.9, 3.0, 3.2, 5.4, -0.8, 42], [E.sink, 20, 9, 20, 5, 1, 0, 55], [E.shore, 17, 6, 22, 5, 0, 0, 55]];
  function update(t) {
    const a = Apos(t); A.position.set(a[0], 0, a[1]); A.scale.set(Asx(t), Asy(t), Asx(t)); A.visible = t < E.jump + 2; B.scale.set(Bsx(t), Bsy(t), Bsx(t));
    hole.visible = t > 62; sHoles.forEach(h => h.visible = t > E.arrive); dots.forEach((h, k) => h.visible = t > E.drill + 0.8 + k * 1.55);
    // raft
    const R = raftAt(t); parentTo(raftG, g); raftG.visible = true; raftVS.update(t); rflag.visible = true; raftG.position.set(R.p[0], R.p[1] + Math.sin(t * 2.2) * 0.05, R.p[2]); raftG.rotation.set(0, R.yaw + Math.PI / 2, Math.sin(t * 1.6) * 0.03);
    motor.visible = t > E.mount + 3; motor.scale.setScalar(backOut(seg(t, E.mount + 3, E.mount + 4))); mbit.rotation.x = t > E.race - 0.5 ? t * 40 : 0;
    const onRaft = (lx, lz) => { const yw = R.yaw + Math.PI / 2, c = Math.cos(yw), s = Math.sin(yw); return [R.p[0] + lx * c + lz * s, R.p[1] + 0.5, R.p[2] - lx * s + lz * c]; };
    // bucket
    parentTo(bucket, g); bucket.visible = t < E.jump; const bk = t < 62 ? onRaft(1.2, 0.7) : onA(t, -4.2, 3.2); bucket.position.set(...bk);
    bMat.emissiveIntensity = t > E.wet + 2 && t < E.reveal ? 0.4 + Math.sin(t * 6) * 0.25 : 0;
    // judge + seals
    parentTo(judge.root, g); judge.root.visible = t > E.arrive;
    let jp = onB(t, 7, 0), jy = -Math.PI / 2; if (win(t, E.land + 3, E.win)) { const k = seg(t, E.land + 3, E.win - 1); jp = onB(t, lerp(7, 5.2, k), 0); }
    if (t > E.win - 1 && t < E.sink) jp = onB(t, 5.2, 0); poseSeal(judge, t, jp, jy, { clap: win(t, E.win, E.win + 3) || win(t, E.start - 0.2, E.start + 0.8), hop: win(t, E.land, E.land + 2), seed: 1 });
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = t > E.arrive; const P = [[6, -6, Math.PI], [10, 4, 0], [5, 6, 0]][i]; let sp = onB(t, P[0], P[1]), sy2 = P[2];
      if (i === 2 && win(t, E.tiny + 0.8, E.steal + 3)) { const k1 = seg(t, E.tiny + 0.8, E.steal), k2 = seg(t, E.steal + 0.2, E.steal + 3); const x = t < E.steal ? lerp(5, -5.6, k1) : lerp(-5.6, 5, k2), z = t < E.steal ? lerp(6, 3.4, k1) : lerp(3.4, 6, k2); sp = [x, 4.5 + Math.abs(Math.sin((t < E.steal ? k1 : k2) * Math.PI * 4)) * 0.6, z]; sy2 = t < E.steal ? yawTo([5, 0, 6], [-5.6, 0, 3.4]) : yawTo([-5.6, 0, 3.4], [5, 0, 6]); }
      let caught = false; for (let k = 0; k < 7; k++) { const c = 84 + i * 3 + k * 9.5; if (c < E.crack && win(t, c, c + 2.4)) caught = true; }
      poseSeal(s, t, sp, sy2, { clap: caught || (t > E.win && t < E.sink), seed: i * 2 + 3 }); const f = sfish[i]; parentTo(f, g); f.visible = caught || (i === 2 && win(t, E.steal, E.steal + 1.6)); f.position.set(sp[0], sp[1] + 2.2 + Math.sin(t * 9) * 0.1, sp[2]); f.rotation.set(0, t * 3, 0.6); if (i === 2 && win(t, E.steal, E.steal + 1.6)) { f.scale.setScalar(1 - seg(t, E.steal + 1.2, E.steal + 1.6)); f.position.set(sp[0], sp[1] + 1.2, sp[2]); } else f.scale.setScalar(1.6); });
    // glubzilla
    parentTo(glub.root, g); glub.root.visible = t > E.bite && t < E.sink; glub.tail.rotation.y = Math.sin(t * 14) * 0.5;
    let gp = [0, 0, 0], gy = 0, gr = 0;
    if (t < E.bite + 1.6) { const k = seg(t, E.bite, E.bite + 1.6); gp = [lerp(-38, -44, k), -1.2 + Math.sin(k * Math.PI) * 9, lerp(6, 4, k)]; gy = -Math.PI / 2; gr = lerp(-0.9, 0.9, k); }
    else if (t < E.land) { const c = towAt(t + 1.6), b = towAt(t + 1.7); gp = [c[0], -0.9 + Math.sin(t * 3) * 0.2, c[1]]; gy = Math.atan2(b[0] - c[0], b[1] - c[1]); gr = Math.sin(t * 5) * 0.1; if (t > E.land - 1) { const k = seg(t, E.land - 1, E.land + 0.6); gp = [lerp(c[0], 6, k), lerp(-0.9, 4.5 + 1.0, k) + Math.sin(k * Math.PI) * 6, lerp(c[1], 0, k)]; gr = -0.6 * Math.sin(k * Math.PI); } }
    else { gp = onB(t, 6, 0); gp[1] += 1.0; gy = 0.3; gr = 0; glub.root.rotation.z = Math.sin(t * 9) * 0.25 * (1 - seg(t, E.land, E.win)); }
    glub.root.position.set(...gp); glub.root.rotation.set(gr, gy, t > E.land ? Math.PI / 2 * 0.9 + glub.root.rotation.z * 0 : 0);
    // --- leggy
    let lp = onRaft(-7, 0), ly = R.yaw, ls = 2; lp[1] = -1.6;
    if (t > E.arrive) { const K = [[E.arrive, 21, -1.6, 1], [E.arrive + 2, 15.5, 4.5, 1], [E.slip, 12, 4.5, 0], [E.slip + 6, 2, 4.5, -2], [64, -6, 4.5, -4]]; const w = walker(t, K); lp = w.p; ly = w.speed > 0.1 ? w.yaw : Math.PI / 2; ls = w.speed > 0.1 ? 2 : 0.3; }
    if (t > 64) { lp = onA(t, -7, -4); ly = Math.PI / 2; ls = 0.3; }
    if (win(t, E.skate, 121)) { const x = -6 + Math.sin((t - E.skate) * 1.3) * 3.5; lp = onA(t, x, -4); ly = Math.cos((t - E.skate) * 1.3) > 0 ? Math.PI / 2 : -Math.PI / 2; ls = 1.5; }
    if (win(t, E.bite + 1, E.jump)) { const an = (t - E.bite) * 1.6; lp = onA(t, -3 + Math.cos(an) * 3.5, Math.sin(an) * 3.5); ly = -an + (win(t, 186, 188) ? (t - 186) * 18 : 0); ls = 1; }
    if (t >= E.jump) { const k = seg(t, E.jump, E.jump + 1.2), j = onA(E.jump, -3, 0), rr = onRaft(0, -2.8); lp = [lerp(j[0], rr[0], k), lerp(j[1], -1.6, k) + Math.sin(k * Math.PI) * 3, lerp(j[2], rr[2], k)]; ly = R.yaw; ls = 2; }
    if (t >= E.land) { const k = seg(t, E.land, E.land + 3); const b = onB(t, 4.5, -4); lp = [lerp(-1, b[0], k), lerp(-1.6, b[1], Math.min(1, k * 1.5)), lerp(-3, b[2], k)]; ly = Math.PI / 2; ls = k < 1 ? 2 : 0.3; if (t > E.sink) { lp = onB(t, 4.5, -4); lp[1] = Math.max(-1.6, lp[1]); } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0;
    if (win(t, E.slip, E.slip + 6.5)) poseLeggySplay(Math.min(1, seg(t, E.slip, E.slip + 0.4)) * (1 - seg(t, E.slip + 6, E.slip + 6.5)));
    if (win(t, 64, E.skate)) poseLeggySplay(0.35 + Math.sin(t * 2) * 0.1);
    if (win(t, 117.2, 119)) poseLeggySplay(1 - seg(t, 118.5, 119));
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // --- puff
    puff.root.visible = t > E.reveal; parentTo(puff.root, g);
    let pp = onA(t, -7.0, 3.6), py = 0.4, po = {};
    if (t < E.reveal + 1) { const k = seg(t, E.reveal, E.reveal + 1); const bq = onA(t, -4.2, 3.2); pp = [lerp(bq[0], pp[0], k), lerp(bq[1] + 0.2, pp[1], k) + Math.sin(k * Math.PI) * 1.4, lerp(bq[2], pp[2], k)]; po.hop = true; }
    if (t > E.bite + 1.6) { const k = seg(t, E.bite + 1.6, E.bite + 2.8); const b = onA(t, -7.0, 3.6); pp = [lerp(b[0], head[0], k), lerp(b[1] + 0.6, head[1], k) + Math.sin(k * Math.PI) * 1.5, lerp(b[2], head[2], k)]; py = ly; }
    if (t > E.melt && t < E.melt + 6) { const h = rodTip(); const k = seg(t, E.melt, E.melt + 0.8); pp = [lerp(head[0], h.x, k), lerp(head[1], h.y - 0.2, k) + Math.sin(k * Math.PI), lerp(head[2], h.z, k)]; po.hop = false; }
    if (t > E.melt + 6) { const k = seg(t, E.melt + 6, E.melt + 7); const h = onB(t, 3.2, -0.6); pp = [lerp(h[0], head[0], k), lerp(h[1] + 1, head[1], k), lerp(h[2], head[2], k)]; }
    poseMag(puff, t, pp, py, { ...po, big: t > E.reveal && t < E.jump });
    // --- hero
    const o = { t, p: onRaft(-1, 0.3), yaw: R.yaw, mallet: false, face: 'normal' };
    if (t < E.arrive && t > 44) o.wave = true;
    if (t >= E.arrive) { const K = [[E.arrive, 18, 0.05, 2], [E.arrive + 1.4, 14, 4.5, 2], [62, -5, 4.5, 2]]; const w = walker(t, K); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; }
    let fishing = false;
    if (t >= 62 && t < E.jump) { o.p = onA(t, -5, 2); o.yaw = -Math.PI / 2; o.hold = true; fishing = true;
      if (win(t, E.boot, E.boot + 4)) o.face = 'smug'; if (win(t, E.steal, E.steal + 2.2)) { o.panic = true; o.hold = false; o.face = 'scared'; }
      if (win(t, E.invoice, E.invoiceEnd)) { o.yaw = yawTo([-5, 0, 2], [-3.6, 0, 0.8]); o.face = 'scared'; o.hold = false; o.hips = true; }
      if (win(t, E.wet, E.reveal)) { o.headPitch = 0.5; o.yaw = yawTo([-5, 0, 2], [-4.2, 0, 3.2]); }
      if (win(t, E.reveal, E.mount)) { o.face = 'scared'; o.yaw = yawTo([-5, 0, 2], [-4.2, 0, 3.2]); if (t > E.crack) { o.panic = true; o.hold = false; } }
      if (win(t, E.cast, E.cast + 1)) o.swing = seg(t, E.cast, E.cast + 1);
      if (t > E.bite) { o.lean = -0.35; o.face = win(t, 181, 186) ? 'smug' : 'scared'; const f = glub.root.position, h = onA(t, -5, 2); o.yaw = Math.atan2(f.x - h[0], f.z - h[2]); } }
    if (t >= E.jump && t < E.land) { const k = seg(t, E.jump, E.jump + 1.1), j = onA(E.jump, -5, 2), rr = onRaft(-1, 0.4); o.p = [lerp(j[0], rr[0], k), lerp(j[1], rr[1], k) + Math.sin(k * Math.PI) * 2.5, lerp(j[2], rr[2], k)]; o.hold = true; o.lean = -0.3; o.face = 'scared'; fishing = true; const f = glub.root.position; o.yaw = Math.atan2(f.x - o.p[0], f.z - o.p[2]); }
    if (t >= E.land) { const k = seg(t, E.land, E.land + 1.2), rr = onRaft(-1, 0.4), b = onB(t, 3.2, -0.8); o.p = [lerp(rr[0], b[0], k), lerp(rr[1], b[1], k) + Math.sin(k * Math.PI) * 2, lerp(rr[2], b[2], k)]; o.yaw = Math.PI / 2; o.face = 'normal';
      if (t > E.win) { o.wave = t < E.melt; o.face = 'smug'; } if (t > E.melt) { o.hold = true; o.face = t > 220 ? 'scared' : 'normal'; } if (t > E.sink) { o.panic = true; o.hold = false; o.face = 'scared'; } }
    pose(hero, o); parentTo(hero.root, g); rod.visible = t > E.arrive && t < E.win;
    // trophy in the hero's right hand
    trophy.visible = t > E.win - 3 && t < E.sink; if (trophy.visible) { if (t < E.win) { parentTo(trophy, judge.fR); trophy.position.set(0.2, 0.2, 0.3); trophy.rotation.set(0, 0, 0); } else { parentTo(trophy, hero.aR); trophy.position.set(0, -0.78, 0.2); trophy.rotation.set(Math.PI / 2, 0, 0); }
      const m = seg(t, E.melt + 1.5, E.melt + 6); tFish.scale.set(1 - m * 0.3, Math.max(0.02, 1 - m), 1 - m * 0.3); puddle.visible = m > 0.2; puddle.scale.set(0.4 + m, 1, 0.4 + m); }
    // fishing line
    fline.visible = false; if (rod.visible && (fishing || win(t, 62, E.jump))) { parentTo(fline, g); const tip = rodTip(); let end = onA(t, -6.6, 2); end = new THREE.Vector3(end[0], end[1], end[2]);
      let cg = null; if (win(t, E.boot, E.boot + 7.6)) cg = catches.boot; else if (win(t, E.cube, E.cube + 7.6)) cg = catches.cube; else if (win(t, E.tiny, E.steal)) cg = catches.tiny;
      for (const c of Object.values(catches)) { c.visible = false; parentTo(c, g); }
      if (cg) { const s0 = cg === catches.boot ? E.boot : cg === catches.cube ? E.cube : E.tiny; const k = seg(t, s0, s0 + 1.2); end = new THREE.Vector3(lerp(end.x, tip.x, k * 0.6), lerp(end.y, tip.y - 0.8, k), lerp(end.z, tip.z, k * 0.6)); cg.visible = true; cg.position.copy(end).add(new THREE.Vector3(0, -0.25, 0)); cg.rotation.set(Math.sin(t * 4) * 0.4, t, 0); }
      if (t > E.bite + 0.6) { const f = glub.root.position; end = new THREE.Vector3(f.x, f.y + 0.4, f.z); }
      if (t < E.cast && t > E.crack + 2) end.y = Math.max(end.y, tip.y - 2.4);
      fline.visible = true; lineBetween(fline, tip, end); }
    else for (const c of Object.values(catches)) c.visible = false;
    // rope from raft to Leggy during the sail
    rope.visible = t < E.arrive; if (rope.visible) { parentTo(rope, g); const a2 = onRaft(-2.6, 0); lineBetween(rope, new THREE.Vector3(a2[0], 0.1, a2[2]), new THREE.Vector3(lp[0], -0.2, lp[2])); }
    // --- bloop
    let bp = onRaft(1.2, -0.3), by = R.yaw, bo = {};
    if (t >= E.arrive) { const K = [[E.arrive, 20, 0.05, 1], [E.arrive + 1.6, 15, 4.5, 0], [E.drill, 3, 4.5, -8], [E.drillEnd, 3, 4.5, 8], [80, 4, 4.5, -2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : -Math.PI / 2; bo = w.speed > 0.2 ? { walk: 1, phase: w.phase } : {};
      if (win(t, E.drill, E.drillEnd)) { by = -Math.PI / 2; bo = {}; } }
    if (win(t, 118.6, 130)) { const K = [[118.6, 4, 4.5, -2], [E.invoice - 0.4, -3.6, 4.5, 0.8], [E.invoiceEnd, -3.6, 4.5, 0.8], [129.4, 4, 4.5, -2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : yawTo([-3.6, 0, 0.8], [-5, 0, 2]); bo = win(t, E.invoice - 0.4, E.invoiceEnd) ? { handOut: true } : { walk: 1, phase: w.phase }; }
    if (t > E.crack) { bp = onB(t, 3.2, 0); by = -Math.PI / 2; bo = { facepalm: t < E.mount - 2 }; }
    if (win(t, E.mount - 2, E.race)) { const K = [[E.mount - 2, 3.2, 4.5, 0], [E.mount + 1, 15, 4.5, 2], [E.mount + 2, 19.6, 0.05, 2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : Math.PI / 2; bo = { walk: 1, phase: w.phase }; if (t > E.mount + 2) { bp = onRaft(1.6, 0); by = Math.PI / 2; bo = {}; } }
    if (t >= E.race && t < E.land) { bp = onRaft(0.9, -0.3); by = R.yaw; bo = {}; }
    if (t >= E.land) { const k = seg(t, E.land + 0.4, E.land + 1.6), rr = onRaft(0.9, -0.3), b = onB(t, 3.4, 1.8); bp = [lerp(rr[0], b[0], k), lerp(rr[1], b[1], k) + Math.sin(k * Math.PI) * 2, lerp(rr[2], b[2], k)]; by = Math.PI / 2; bo = win(t, E.win, E.melt) ? { hop: true } : (t > E.melt + 4 && t < E.sink ? { facepalm: true } : {}); if (t > E.sink) bo = { angry: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true;
    if (win(t, E.drill, E.drillEnd)) { bloop6.B.aR.rotation.set(-0.5, 0, 0); bloop6.B.root.position.y += Math.sin(t * 40) * 0.03; }
    if (t >= E.race && t < E.land) { bloop6.B.aL.rotation.set(-1.3, 0, 0); bloop6.B.aR.rotation.set(-1.3, 0, 0); }
    drill.visible = t < E.mount + 3; dbit.rotation.z = win(t, E.drill, E.drillEnd) ? t * 50 : 0;
    card.visible = win(t, E.invoice - 0.4, E.invoiceEnd); card.scale.set(1, 1, 1); card.position.y = -0.62; blue.visible = bBrick.visible = board.visible = false; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0;
    // --- camera
    let cam = camKeys(t, C); const hp = hero.root.position;
    if (t < 43) cam = { p: [R.p[0] + 5, 2.4, R.p[2] + 7], l: [R.p[0] - 2, 0.6, R.p[2]], fov: 50 };
    else if (t < E.arrive) cam = { p: [R.p[0] + 9, 5.5, R.p[2] + 7], l: [0, 4, 0], fov: lerp(55, 42, ss(seg(t, 43, E.arrive))) };
    if (win(t, 55.5, 64)) { const q = L6.root.position; cam = { p: [q.x + 5, q.y + 2.6, q.z + 6.5], l: [q.x, q.y + 0.8, q.z], fov: 50 }; }
    if (win(t, 64, 71)) { const q = bloop6.B.root.position; cam = { p: [q.x - 3, 5.2, q.z + 4.4], l: [q.x - 0.5, 5.0, q.z], fov: 50 }; }
    if (win(t, E.skate, E.invoice)) { const q = L6.root.position; cam = { p: [q.x + 2.5, q.y + 2.4, q.z + 7], l: [q.x, q.y + 0.8, q.z], fov: 50 }; }
    if (win(t, E.race, E.cast)) cam = { p: [R.p[0] + 6, 3, R.p[2] + 7], l: [R.p[0], 0.6, R.p[2]], fov: 52 };
    if (win(t, E.cast, E.bite)) cam = { p: [hp.x + 4.5, hp.y + 2.2, hp.z + 4.5], l: [hp.x - 3, hp.y - 0.2, hp.z + 0.5], fov: 52 };
    if (win(t, E.bite, 181)) cam = { p: [hp.x + 7, hp.y + 1.2, hp.z + 9], l: [hp.x - 6, hp.y + 1.5, hp.z], fov: 58 };
    if (win(t, 181, 185)) { const a2 = Apos(t); cam = { p: [a2[0] + 12, 5, a2[1] + 12], l: [a2[0], 2, a2[1]], fov: 55 }; }
    if (win(t, 185, 190)) { const q = L6.root.position; cam = { p: [q.x + 4, q.y + 2.5, q.z + 5], l: [q.x, q.y + 1, q.z], fov: 52 }; }
    if (win(t, 190, E.jump + 1.2)) { const a2 = Apos(t); cam = { p: [a2[0] + 3, 6, a2[1] - 14], l: [a2[0], 1.5, a2[1] - 4], fov: 55 }; }
    if (win(t, E.jump + 1.2, E.land)) { const f = glub.root.position; cam = { p: [R.p[0] - 4, 3.6, R.p[2] - 7], l: [(R.p[0] + f.x) / 2, 1, (R.p[2] + f.z) / 2], fov: 56 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
