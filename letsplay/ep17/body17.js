// ================================================================ EPISODE 17: "THE TIME MACHINE" — the yard (Bloop's Time Booth) → warp → prehistoric jungle (Chompodon, the flux crystal, an egg) → warp → the yard at sunset (a stowaway grows)
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
function dialTex(txt) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#081018'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#5ff7ff'; x.font = 'bold 34px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// --- the Chompodon: big purple prehistoric goofball (mom) + her baby
function makeChomp() {
  const root = new THREE.Group(), body = pivot(root, 0, 2.2, 0), skin = new THREE.MeshLambertMaterial({ color: '#8a5ad8' }), belly = new THREE.MeshLambertMaterial({ color: '#d8c0ff' }), spot = new THREE.MeshLambertMaterial({ color: '#5fd86a' });
  box(2.6, 2.4, 4.2, 0, 0, 0, 0, body, skin); box(2.0, 1.4, 3.6, 0, 0, -0.6, 0.2, body, belly); for (const [x, y, z] of [[0.6, 1.21, -1], [-0.7, 1.21, 0.6], [0.3, 1.21, 1.4], [-0.4, 1.21, -1.6]]) box(0.6, 0.06, 0.6, 0, x, y, z, body, spot);
  for (let i = 0; i < 4; i++) box(0.3, 0.5, 0.5, '#5fd86a', 0, 1.4, 1.4 - i * 0.9, body);
  const tail = pivot(body, 0, -0.2, -2.1); box(1.6, 1.4, 2.2, 0, 0, 0, -1.0, tail, skin); const tail2 = pivot(tail, 0, -0.1, -2.1); box(1.0, 0.9, 2.0, 0, 0, 0, -0.9, tail2, skin);
  const neck = pivot(body, 0, 0.8, 1.9); box(1.5, 1.8, 1.4, 0, 0, 0.8, 0.3, neck, skin);
  const hd = pivot(neck, 0, 1.8, 0.4); box(2.2, 1.5, 2.6, 0, 0, 0.3, 0.9, hd, skin);
  const jaw = pivot(hd, 0, -0.5, -0.1); box(2.0, 0.5, 2.6, 0, 0, -0.1, 1.2, jaw, belly); for (let i = 0; i < 5; i++) box(0.18, 0.22, 0.12, '#ffffff', -0.72 + i * 0.36, 0.22, 2.4, jaw);
  box(1.9, 0.12, 2.3, '#c0306a', 0, -0.42, 1.0, hd);
  const eyes = [-0.65, 0.65].map(x => { const p = pivot(hd, x, 1.15, 1.2); box(0.7, 0.7, 0.7, '#ffffff', 0, 0, 0, p); const pu = box(0.3, 0.3, 0.1, '#111', 0, 0, 0.36, p); return { p, pu }; });
  const arms = [-1, 1].map(s => { const p = pivot(body, s * 1.3, 0.3, 1.7); box(0.3, 0.8, 0.3, 0, 0, -0.35, 0.1, p, skin); return p; });
  const legs = [[-0.9, 1.2], [0.9, 1.2], [-0.9, -1.2], [0.9, -1.2]].map(([x, z]) => { const p = pivot(body, x, -0.8, z); box(0.9, 1.6, 1.0, 0, 0, -0.6, 0, p, skin); box(1.0, 0.3, 1.2, '#6a3ab0', 0, -1.4, 0.15, p); return p; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, tail, tail2, neck, hd, jaw, eyes, arms, legs };
}
function poseChomp(c, t, p, yaw, o = {}) {
  const w = o.walk || 0, ph = t * (o.run ? 10 : 5); c.root.position.set(...p); c.root.rotation.set(0, yaw, 0);
  c.body.position.y = 2.2 + Math.abs(Math.sin(ph)) * 0.25 * w - (o.sit || 0) * 1.2; c.body.rotation.set(-(o.sit || 0) * 0.35, 0, Math.sin(ph) * 0.04 * w);
  c.legs.forEach((l, i) => { l.rotation.set(Math.sin(ph + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.6 * w + (i < 2 ? -(o.sit || 0) * 1.3 : (o.sit || 0) * 0.5), 0, 0); });
  c.tail.rotation.set(0.15 - (o.sit || 0) * 0.3, Math.sin(t * (o.happy ? 9 : 2)) * (o.happy ? 0.5 : 0.2), 0); c.tail2.rotation.y = Math.sin(t * (o.happy ? 9 : 2) - 1) * 0.3;
  c.neck.rotation.x = (o.down ? 0.9 : 0) + (o.sneeze ? -0.5 + Math.sin(t * 30) * 0.2 : 0) + (o.up ? -0.5 : 0) + Math.sin(t * 1.5) * 0.05; c.hd.rotation.set(o.sniff ? Math.sin(t * 12) * 0.08 : 0, o.look ?? Math.sin(t * 0.9) * 0.15, o.tilt || 0);
  c.jaw.rotation.x = o.chomp ? Math.abs(Math.sin(t * 8)) * 0.6 : o.open ? 0.7 : o.yawn ? 0.9 : 0.05; c.arms.forEach((a, i) => a.rotation.set(o.happy ? -1.2 + Math.sin(t * 10 + i) * 0.4 : -0.3, 0, 0));
  c.eyes.forEach((e, i) => { e.pu.position.set(Math.sin(t * 3.1 + i * 2) * 0.12, Math.cos(t * 2.7 + i) * 0.12, 0.36); e.p.scale.y = o.yawn || o.sleepy ? 0.35 : 1; });
}
const chomp = makeChomp(); chomp.root.scale.setScalar(1.6); const chompB = makeChomp();
// --- props: Time Booth (+flux crystal, lever, year dial), egg, stick, fern, invoice
const booth = new THREE.Group(), boothBody = pivot(booth, 0, 0, 0), boothM = new THREE.MeshLambertMaterial({ color: '#2f6fd8' });
box(2.4, 3.4, 2.4, 0, 0, 1.7, 0, boothBody, boothM); box(2.5, 0.3, 2.5, '#1b2a6a', 0, 3.5, 0, boothBody); box(1.6, 1.4, 0.06, 0, 0, 2.3, 1.21, boothBody, new THREE.MeshLambertMaterial({ color: '#cfefff', emissive: '#5ff7ff', emissiveIntensity: 0.4 }));
for (let i = 0; i < 3; i++) box(0.12, 0.12, 0.06, ['#ff3d7f', '#ffe066', '#7cff6b'][i], -0.8 + i * 0.3, 0.9, 1.22, boothBody);
const dialYears = ['2026', '1,000,000 BC', '2026?'], dialM = dialYears.map(y => new THREE.MeshBasicMaterial({ map: dialTex(y) })); const dial = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.36, 0.06), dialM[0]); dial.position.set(0.2, 3.1, 1.22); boothBody.add(dial);
const lever = pivot(boothBody, 1.25, 1.4, 0.6); box(0.1, 0.9, 0.1, '#c0c0c8', 0, 0.45, 0, lever); box(0.24, 0.24, 0.24, '#e8344e', 0, 0.92, 0, lever);
const crystalM = new THREE.MeshLambertMaterial({ color: '#5ff7ff', emissive: '#2fa8c0', emissiveIntensity: 0.8 }), flux = new THREE.Group(); box(0.5, 0.8, 0.5, 0, 0, 0, 0, flux, crystalM); box(0.3, 0.3, 0.3, 0, 0, 0.5, 0, flux, crystalM);
const boothLight = new THREE.PointLight('#5ff7ff', 0, 10, 1.4); boothLight.position.set(0, 4.4, 0); booth.add(boothLight);
const egg = new THREE.Group(), eggTop = pivot(egg, 0, 0.6, 0), eggBot = pivot(egg, 0, 0, 0); box(0.9, 0.6, 0.9, '#f4ecd8', 0, 0.3, 0, eggBot); box(0.9, 0.6, 0.9, '#f4ecd8', 0, 0.3, 0, eggTop); for (const [x, y, z, p] of [[0.3, 0.4, 0.46, eggBot], [-0.2, 0.2, 0.46, eggTop], [0.46, 0.3, -0.1, eggTop]]) box(0.2, 0.2, 0.02, '#8a5ad8', x, y, z, p);
const stick = box(0.24, 0.24, 2.0, 0, 0, 0, 0, new THREE.Group(), MAT.log);
const fern = new THREE.Group(); box(0.08, 0.9, 0.08, '#3c8a32', 0, 0.45, 0, fern); for (let i = 0; i < 4; i++) box(0.5 - i * 0.08, 0.06, 0.2, '#5fb04a', 0, 0.3 + i * 0.2, 0.1, fern); hero.aR.add(fern); fern.position.set(0, -0.7, 0.2); fern.rotation.x = Math.PI / 2;
// HUD helpers
const yearAt = t => t < E.warp + 3 ? '2026' : t < E.warpBack + 3 ? '1,000,000 BC' : '2026 (probably)';
const fluxAt = t => win(t, E.swallow, E.bonk + 0.4) ? 'IN A DINOSAUR' : win(t, E.bonk + 0.4, E.install) ? 'ON MY HEAD' : t > E.crunch ? 'PANCAKE' : 'OK';
function drawWarp(T) { for (const s of [E.warp, E.warpBack]) { if (!win(T, s, s + 5)) continue; const k = seg(T, s, s + 5), a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2);
  for (let i = 0; i < 18; i++) { const r = ((i * 60 + T * 600) % 1100), c = ['#5ff7ff', '#ff5cf0', '#ffe066', '#7cff6b'][i % 4]; ctx.save(); ctx.rotate(T * 2 + i * 0.4); ctx.strokeStyle = c; ctx.lineWidth = 6 + r / 60; ctx.strokeRect(-r / 2, -r / 2.8, r, r / 1.4); ctx.restore(); }
  outlined(s === E.warp ? '→ 1,000,000 BC' : '→ 2026 ...?', 0, 0, 58, '#ffffff', '#000', 10); ctx.restore(); } }

// ---------------------------------------------------------------- set A: the yard (present day; morning, then sunset on return)
const yard = (() => {
  const g = mk('yard'), st = new VSet(g), r = rng(1701);
  for (let x = -36; x <= 36; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, Math.abs(x) <= 1 && z > 2 ? 'path' : 'turf');
  for (let x = -12; x <= -4; x++) for (let z = -16; z <= -10; z++) for (let y = 1; y <= 4; y++) { if (!(x === -12 || x === -4 || z === -16 || z === -10)) continue; if (z === -10 && x === -8 && y <= 2) continue; st.add(x, y, z, y === 3 && (x === -10 || x === -6) && z === -10 ? 'glass' : 'plank'); }
  for (let k = 0; k <= 4; k++) for (let x = -13 + k; x <= -3 - k; x++) for (const z of [-17, -9]) st.add(x, 5 + k, z, 'slate'); for (let k = 0; k <= 4; k++) for (let z = -16; z <= -10; z++) { st.add(-13 + k, 5 + k, z, 'slate'); st.add(-3 - k, 5 + k, z, 'slate'); }
  for (let x = 4; x <= 12; x++) { st.add(x, 1, 8, 'log'); if (x % 2 === 0) st.add(x, 2, 8, 'log'); }
  const trees = []; for (let i = 0; i < 46; i++) { const x = Math.round((r() - .5) * 70), z = Math.round((r() - .5) * 56); if (Math.abs(x) < 16 && Math.abs(z) < 18) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const appleTree = new THREE.Group(); appleTree.position.set(7, 0.5, -5); g.add(appleTree); box(0.8, 3.2, 0.8, 0, 0, 1.6, 0, appleTree, MAT.log); box(3.4, 2.8, 3.4, 0, 0, 4.2, 0, appleTree, MAT.leaf); for (const [x, y, z] of [[1, 4, 1.72], [-0.8, 4.8, 1.72], [1.72, 3.6, -0.5]]) box(0.36, 0.36, 0.36, '#e8344e', x, y, z, appleTree);
  const hay = new THREE.Group(); hay.position.set(-6, 0.5, -1); g.add(hay); const hayM = new THREE.MeshLambertMaterial({ color: '#e8c860' }); box(2.4, 1.4, 1.6, 0, 0, 0.7, 0, hay, hayM); box(2.4, 1.4, 1.6, 0, 0.4, 2.1, 0, hay, hayM);
  parentTo(booth, g); parentTo(flux, g);
  burst(E.warp + 0.6, [0, 2, 0], { n: 120, colors: ['#5ff7ff', '#ff5cf0', '#ffffff'], speed: 8, size: 0.2, life: 1.2, grav: 0, up: 2 });
  burst(E.home + 0.2, [0, 2, 0], { n: 120, colors: ['#5ff7ff', '#ff5cf0', '#ffffff'], speed: 8, size: 0.2, life: 1.2, grav: 0, up: 2 });
  burst(E.eat1 + 1.5, [7, 4, -5], { n: 80, colors: ['#3f8f3a', '#5fb04a', '#e8344e'], speed: 6, size: 0.25, life: 1.2, grav: 8, up: 3 });
  burst(E.eat2 + 1.5, [-6, 1.6, -1], { n: 80, colors: ['#e8c860', '#c8a840'], speed: 6, size: 0.2, life: 1.2, grav: 8, up: 3 });
  burst(E.crunch + 0.6, [0, 1, 0], { n: 120, colors: ['#2f6fd8', '#5ff7ff', '#c0c0c8', '#ffffff'], speed: 9, size: 0.25, life: 1.6, grav: 10, up: 5 });
  burst(E.lick2 + 0.8, [3, 2.6, 4.6], { n: 50, colors: ['#ff9ad8', '#ffc0ea'], speed: 3, size: 0.18, life: 1.2, grav: 6, up: 2 });
  const C = [[0, 0, 7, 20, 0, 2, 0, 50], [5.9, 2, 5, 15, 0, 2, 0, 46], [6, 3.6, 2.6, 6, 0, 2.2, 0, 46], [11.9, 3.0, 2.4, 5.2, 0, 2.4, 0, 42], [12, -2.6, 2.4, 6, 1.6, 1.8, 2, 46], [21.9, -3.0, 2.2, 6.6, 1.6, 1.8, 2, 48],
    [22, 6, 2.4, 7, 2, 1.6, 3, 48], [27.9, 5, 2.6, 6.4, 2, 1.6, 3, 46], [28, -0.6, 3.4, 4.6, 0.2, 3.1, 1.2, 40], [39.9, -0.2, 3.3, 4.0, 0.2, 3.1, 1.2, 36], [40, 3.6, 1.2, 6, 0, 1.4, 1, 50], [45.9, 3, 1.2, 5.6, 0, 1.4, 1, 48],
    [46, 3.6, 1.8, 3.6, 1.2, 1.8, 0.6, 46], [E.jungle, 4, 3, 9, 0, 2, 0, 56],
    [E.home, 0, 6, 16, 0, 2, 0, 52], [209.9, 2, 4.6, 12, 0, 2, 0, 50], [210, -4, 2.4, 6, 1, 1.8, 2, 48], [217.9, -3.4, 2.4, 5.2, 1, 1.8, 2, 46], [218, 0, 2.2, 6, 0, 2.4, 0, 44], [223.9, 0, 2.0, 5.2, 0, 2.4, 0, 40],
    [224, 2.4, 1.0, 5.6, 0, 1.2, 1.2, 50], [233.9, 3.4, 1.4, 5.0, 1, 1.0, 1.4, 48], [234, 2, 3.4, 4, 7, 3, -4, 50], [243.9, 3, 3.2, 2, 7, 3, -4, 48], [244, -12, 3, 5, -6, 1.6, -1, 50], [251.9, -11, 3.4, 6, -5, 2.2, -1, 50],
    [252, 4, 2.0, 9, 0, 3, -2, 54], [259.9, 5, 2.2, 10, 0, 4, -3, 56], [260, 0, 2, 16, 1, 5, -5, 60], [265.9, -3, 1.6, 15, 1, 6, -5, 60], [266, 4, 6, 6, 1, 7, -4, 50], [269.9, 4, 6, 7, 1, 7, -4, 50],
    [270, 0, 9, 22, 0, 3, -1, 56], [274.9, 0, 8, 20, 0, 3, -1, 54], [275, 6, 2.4, 9, 3, 1.8, 4.6, 46], [279.9, 6.4, 2.4, 9.6, 3, 1.8, 4.6, 44], [280, -3, 4.4, 14, 1, 3, 0, 52], [E.logo, -2.6, 4.2, 13, 1, 3, 0, 50]];
  function update(t) {
    hideMisc(); const late = t > E.home, F = Math.PI;
    fern.visible = false;
    booth.position.set(0, 0.5, 0); booth.rotation.y = 0; const cr = seg(t, E.crunch, E.crunch + 0.5); boothBody.scale.set(1 + cr * 0.4, 1 - cr * 0.88, 1 + cr * 0.4); booth.visible = true;
    dial.material = dialM[late ? 2 : t > E.bump + 0.6 ? 1 : 0]; lever.rotation.x = win(t, E.lever, E.lever + 6) || late ? 1.0 : 0; boothLight.intensity = win(t, E.lever, E.jungle) || win(t, E.home, E.home + 4) ? 14 : 2;
    flux.visible = t < E.crunch; flux.position.set(0, 4.2 * (1 - cr) + 0.6, 0); flux.rotation.y = t;
    if (late) boothBody.position.x = win(t, E.rumble, E.stow) ? Math.sin(t * 40) * 0.08 : 0;
    appleTree.visible = t < E.eat1 + 1.5; hay.visible = t < E.eat2 + 1.5;
    // hero
    let hp = [-2.2, 0.5, 3], hy = 0.4, ho = { face: 'smug' };
    if (!late) { if (t > E.plan) { hy = 0.9; ho = { face: 'smug', hold: win(t, E.plan, E.plan + 6) }; } if (t > E.dial) { hp = [1.4, 0.5, 2.2]; hy = -0.6; ho = { face: 'normal' }; } if (t > E.bump) ho = { face: 'scared' };
      if (t > E.lever) { hp = [0.6, 0.5, 0.2]; hy = 0.2; ho = { face: 'scared', panic: true }; } }
    else { hp = [-0.6, 0.5, lerp(0.2, 3, seg(t, E.home + 2, E.home + 4))]; hy = 0; ho = { face: 'scared', walk: win(t, E.home + 2, E.home + 4) ? 1 : 0, phase: t * 9 }; if (t > E.relief) ho = { face: 'smug', hips: true }; if (t > E.rumble) ho = { face: 'scared' };
      if (t > E.stow) { hp = [-1.4, 0.5, 3.6]; hy = 0.4; ho = { face: 'smug' }; } if (t > E.eat1) ho = { face: 'scared', headYaw: 0.6 }; if (t > E.stop) { hp = [1.4, 0.5, 4.4]; hy = F; ho = { face: 'scared', panic: true }; }
      if (t > E.huge) { const k = seg(t, E.huge, E.huge + 2); hp = [lerp(1.4, 3, k), 0.5, lerp(4.4, 4.6, k)]; hy = F - 0.3; ho = { face: 'scared', headPitch: -0.5 }; } if (t > E.crunch) ho = { face: 'scared', panic: t < E.crunch + 3 }; if (t > E.invoice) { hy = -0.6; ho = { face: 'scared' }; } if (t > E.lick2) { hy = F - 0.3; ho = { face: 'scared', headRoll: 0.2 }; } }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); hero.root.visible = !(t > E.lever + 3 && !late);
    // Bloop
    let bp = [1.8, 0.5, 2.2], by = -0.6, bo = { handOut: win(t, E.unveil, E.unveil + 4) }; if (t > E.dial) { bp = [-1.6, 0.5, 1.8]; by = 0.8; bo = {}; } if (t > E.lever) { bp = [-0.6, 0.5, 0.3]; bo = { angry: true }; }
    if (late) { bp = [0.8, 0.5, lerp(0, 2.6, seg(t, E.home + 2, E.home + 4))]; by = 0; bo = { hop: win(t, E.relief, E.relief + 4) }; if (t > E.stow) { bp = [3.6, 0.5, 2.6]; by = -0.5; bo = {}; } if (t > E.stop) { bp = [-2.4, 0.5, 5]; by = F; bo = { facepalm: true }; }
      if (t > E.invoice - 1) { const k = seg(t, E.invoice - 1, E.invoice); bp = [lerp(-2.4, 4.6, k), 0.5, lerp(5, 5.6, k)]; by = -1.6; bo = k < 1 ? { walk: 1, phase: t * 8 } : { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.visible = !(t > E.lever + 3 && !late); card.visible = t > E.invoice;
    // Leggy (snacks) + Muffin (the bump) + Puff
    let lp = [-5.6, 0.5, 2], ly = 1.2, ls = 0.3; if (t > E.snack) { const k = seg(t, E.snack, E.snack + 3); lp = [lerp(-12, -3.6, k), 0.5, lerp(6, 1.0, k)]; ly = 0.9; ls = k < 1 ? 2 : 0.3; }
    if (late) { lp = [-3.4, 0.5, lerp(-0.4, 2.6, seg(t, E.home + 2, E.home + 4))]; ly = 0.3; if (t > E.stow) { lp = [-1.4, 0.5, 6.2]; ly = 2.6; ls = 0.3; } if (t > E.stop) { lp = [-5, 0.5, 6]; ly = 2.4; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = !(t > E.lever + 3 && !late) && t > E.snack;
    if (late && t > E.stow && t < E.eat1) L6.root.position.y += Math.abs(Math.sin(t * 6)) * 0.2;
    let mp = [-0.6, 0.5, 3.8], mo = {}; if (t > E.bump - 2 && !late) { const k = seg(t, E.bump - 2, E.bump); mp = [lerp(-3, 0.3, k), 0.5, lerp(3.4, 1.6, k)]; mo = { hop: k < 1 }; } if (late) { mp = [-2.4, 0.5, 3.4]; mo = { hop: win(t, E.stow, E.eat1) }; }
    poseMuffin(muffin, t, mp, F - 0.3, mo); parentTo(muffin.root, g); muffin.root.visible = !(t > E.lever + 3 && !late); if (win(t, E.bump, E.bump + 0.6)) muffin.root.rotation.z = 0.4;
    poseMag(puff, t, late ? [-3, 0.6, 5.6] : [2.8, 0.6, 3.2], -0.8); parentTo(puff.root, g); puff.root.visible = !(t > E.lever + 3 && !late);
    poseBot(bot, t, [8, 0.5, 4], -1.2, { off: true, roll: 0, alarm: win(t, E.stop, E.huge) }); parentTo(bot.root, g); bot.root.visible = true;
    // the stowaway baby Chompodon grows
    parentTo(chompB.root, g); chompB.root.visible = late && t > E.stow; const sc = t < E.eat1 + 1.5 ? 0.35 : t < E.eat2 + 1.5 ? lerp(0.35, 0.7, seg(t, E.eat1 + 1.5, E.eat1 + 3)) : t < E.huge ? lerp(0.7, 1.1, seg(t, E.eat2 + 1.5, E.eat2 + 3)) : lerp(1.1, 1.7, seg(t, E.huge, E.huge + 3));
    chompB.root.scale.setScalar(sc); let cp = [0, 0.5, 1.4], cy = 0, co = { happy: true };
    if (t < E.stow + 3) { cp = [0, 0.5, lerp(0, 2.4, seg(t, E.stow, E.stow + 2))]; co = { walk: 1, happy: true }; }
    else if (t < E.eat1 + 3) { const k = seg(t, E.stow + 5, E.eat1); cp = [lerp(0, 5.2, k), 0.5, lerp(2.4, -2.8, k)]; cy = 2.4; co = k < 1 && k > 0 ? { walk: 1 } : { chomp: t > E.eat1, down: t > E.eat1 && t < E.eat1 + 1.6, up: true }; }
    else if (t < E.eat2 + 3) { const k = seg(t, E.eat1 + 4, E.eat2); cp = [lerp(5.2, -3.6, k), 0.5, lerp(-2.8, -1, k)]; cy = k < 1 ? -1.6 : -1.6; co = k < 1 && k > 0 ? { walk: 1 } : { chomp: t > E.eat2, down: t > E.eat2 && t < E.eat2 + 1.6 }; }
    else if (t < E.crunch - 2) { const k = seg(t, E.eat2 + 4, E.huge); cp = [lerp(-3.6, 1.0, k), 0.5, lerp(-1, -6, k)]; cy = 0.2; co = { walk: k > 0 && k < 1 ? 1 : 0, happy: t > E.huge, yawn: win(t, E.yawn, E.yawn + 3), look: t > E.huge ? 0.3 : undefined }; }
    else { const k = seg(t, E.crunch - 2, E.crunch); cp = [lerp(1, 0, k), 0.5, lerp(-6, -1.6, k)]; cy = 0; co = { sit: seg(t, E.crunch - 0.4, E.crunch + 0.3), sleepy: t < E.lick2, happy: t > E.crunch + 2, open: t > E.lick2 && t < E.lick2 + 2, down: t > E.lick2 && t < E.lick2 + 2 }; }
    poseChomp(chompB, t, cp, cy, co);
    let cam = camKeys(t, C); return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the prehistoric jungle
const jungle = (() => {
  const g = mk('jungle'), st = new VSet(g), r = rng(1702);
  for (let x = -44; x <= 44; x++) for (let z = -60; z <= 36; z++) { const pond = Math.hypot(x - 14, z - 10) < 5; if (pond) continue; st.add(x, 0, z, hash2(x, z, 5) < 0.1 ? 'soil' : 'turf'); }
  for (let x = -26; x <= 26; x++) for (let z = -26; z <= 26; z++) { const d = Math.hypot(x, z); if (d > 26) continue; const h = Math.round(26 - d); for (let y = Math.max(1, h - 2); y <= h; y++) st.add(x, y, z - 120, y >= 24 ? 'jam' : 'stone'); }
  const trees = []; for (let i = 0; i < 70; i++) { const x = Math.round((r() - .5) * 84), z = Math.round(-55 + r() * 88); if (Math.abs(x) < 15 && z > -26 && z < 12) continue; if (Math.hypot(x - 14, z - 10) < 7) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 7 + Math.floor(r() * 4)); }
  st.build();
  const pondW = new THREE.Mesh(GEO, MAT.water); pondW.scale.set(10, 1, 10); pondW.position.set(14, -0.3, 10); g.add(pondW);
  const ferns = new THREE.Group(); g.add(ferns); for (let i = 0; i < 40; i++) { const x = (r() - .5) * 60, z = -30 + r() * 50; if (Math.abs(x) < 6 && z > -16 && z < 8) continue; const f = new THREE.Group(); f.position.set(x, 0.5, z); f.rotation.y = r() * 6; ferns.add(f); for (let k = 0; k < 5; k++) { const l = box(0.5, 0.1, 2.4, 0, 0, 0.5, 1.0, pivot(f, 0, 0, 0), MAT.leaf); l.parent.rotation.set(-0.5, k * 1.25, 0); } }
  const shroomM = new THREE.MeshLambertMaterial({ color: '#ff6a4a', emissive: '#801a0a', emissiveIntensity: 0.3 }); for (let i = 0; i < 12; i++) { const x = (r() - .5) * 40, z = -20 + r() * 30; if (Math.abs(x) < 5) continue; box(0.4, 1.4, 0.4, '#f4ecd8', x, 1.2, z, g); box(1.6, 0.5, 1.6, 0, x, 2.1, z, g, shroomM); }
  const lava = box(8, 0.6, 8, 0, 0, 25.5, -120, g, new THREE.MeshBasicMaterial({ color: '#ff6a1a' })); smoke(E.jungle, E.warpBack + 2, 0.6, [0, 28, -120], { n: 3, size: 1.4, life: 6, speed: 2, grav: -2, up: 3, colors: ['#5a5050', '#7a6a6a', '#3a3030'] });
  const nest = new THREE.Group(); nest.position.set(-10, 0.5, 4); g.add(nest); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; box(0.6, 0.4, 0.3, 0, Math.cos(a) * 1.1, 0.2, Math.sin(a) * 1.1, nest, MAT.log).rotation.y = -a; }
  parentTo(egg, g); parentTo(stick.parent, g);
  for (let t = E.steps; t < E.chomp; t += 1.4) burst(t, [0, 0.6, -20 + (t - E.steps) * 1.2], { n: 20, colors: ['#8b5a3c', '#a87048'], speed: 3, size: 0.25, life: 0.8, grav: 8, up: 2 });
  burst(E.hatch, [-10, 1.4, 4], { n: 40, colors: ['#f4ecd8', '#8a5ad8'], speed: 3, size: 0.18, life: 1, grav: 6, up: 2 });
  burst(E.tickleEnd - 3, [0, 4, -2], { n: 40, colors: ['#ff9ad8', '#ffc0ea'], speed: 4, size: 0.2, life: 1, grav: 6, up: 2 });
  burst(E.sneeze, [0, 7, -2], { n: 120, colors: ['#d8c0ff', '#ffffff', '#ff9ad8'], speed: 8, size: 0.2, life: 1.2, grav: 4, up: 1 });
  burst(E.install + 3, [0, 4.6, 0], { n: 60, colors: ['#5ff7ff', '#ffffff'], speed: 4, size: 0.15, life: 1, grav: 2, up: 2 });
  const MX = [[E.chomp, 0], [E.fetch + 2, 0], [E.fetch + 5, 18], [E.fetch + 7, 18], [E.fetchEnd, 2], [E.grab, 0]], MZ = [[E.steps, -30], [E.chomp, -12], [E.fetch + 2, -12], [E.fetch + 5, -6], [E.fetchEnd, -10], [E.grab, -7.2]];
  const C = [[E.jungle, 0, 10, 26, 0, 3, -20, 56], [61.9, 0, 6, 18, 0, 6, -40, 52], [62, 4, 2.2, 6, -1, 2.0, 0, 50], [69.9, 3, 2.6, 5, -1, 2.2, 0, 46],
    [70, 4, 1.2, 6, 0, 4, -20, 52], [75.9, 4, 1.6, 5, 0, 5, -16, 52], [76, 5, 1.6, 1, 0, 6, -12, 60], [83.9, 5, 2, 0, 0, 7, -12, 58], [84, 5, 4, 2, 0, 4, -6, 50], [89.9, 4.4, 4.4, 1.4, 0, 4.4, -6, 46],
    [90, -6, 4, 10, 8, 3, -6, 56], [99.9, 4, 4, 12, 10, 3, -6, 56], [100, 6, 7, 8, 0, 5, -5, 50], [109.9, 5.4, 7.4, 6.4, 0, 5, -5, 46], [110, -5, 3, 7, 0, 5, -6, 54], [115.9, -4, 3.2, 6, 0, 5, -6, 50],
    [116, 6, 3.4, 6, 0.6, 2, 0.6, 46], [125.9, 5.4, 3.2, 5.4, 0.6, 2, 0.6, 44], [126, -6, 2.2, 8.4, -10, 1.2, 4, 46], [135.9, -7, 2.0, 7.6, -10, 1.0, 4, 42], [136, -14, 2.4, 8, -9, 1.0, 4.4, 44], [149.9, -13.4, 2.2, 7.4, -9, 1.0, 4.4, 40],
    [150, 7, 3, 4, 0, 4, -4, 56], [161.9, 7, 3.4, 2, 0, 4, -4, 56], [162, -9, 2.4, 1, -2, 3, -4, 50], [167.9, -9.6, 2.6, 0.4, -2, 3, -4, 46], [168, -4, 4, 6, 0, 5, -3, 52], [175.9, -4, 3.6, 5, 0, 5, -3, 50],
    [176, 4, 3, 7, -0.4, 2.4, 0.6, 46], [181.9, 4.2, 3, 6.4, -0.4, 2.4, 0.6, 42], [182, 3, 4, 4, 0, 3.4, 0, 48], [187.9, 3.6, 4.4, 3.4, 0, 3.6, 0, 46],
    [188, -2, 3, 8, -5, 1.4, 0, 46], [197.9, -2.6, 2.8, 7.4, -5, 1.4, 0, 42], [198, 0, 6, 14, 0, 2, 0, 54], [E.home, 0, 5, 12, 0, 2, 0, 54]];
  function update(t) {
    hideMisc(); const F = Math.PI; parentTo(booth, g); booth.position.set(0, 0.5, 0); booth.rotation.y = 0.3; boothBody.scale.set(1, 1, 1); boothBody.position.x = 0; booth.visible = true; dial.material = dialM[1];
    lever.rotation.x = t < E.arrive || t > E.depart ? 1.0 : 0; boothLight.intensity = t < E.arrive || t > E.depart - 2 ? 14 : 2;
    // flux crystal: on top → mom's mouth → (inside) → sneeze → hero's head → back on top
    parentTo(flux, g); flux.visible = !win(t, E.swallow, E.sneeze); flux.rotation.y = t;
    if (t < E.grab + 3) flux.position.set(0, 4.6, 0); else if (t < E.swallow) { chomp.root.updateMatrixWorld(true); const v = new THREE.Vector3(0, 0.1, 2.3); chomp.hd.localToWorld(v); flux.position.copy(v); }
    else if (t < E.bonk) { const k = seg(t, E.sneeze, E.bonk); flux.position.set(lerp(0, 0.4, k), lerp(8, 3.0, k) + Math.sin(k * Math.PI) * 4, lerp(-2, 1.4, k)); }
    else if (t < E.install) flux.position.set(0.4, 3.0, 1.4); else { const k = seg(t, E.install, E.install + 3); flux.position.set(lerp(0.4, 0, k), lerp(2, 4.6, k), lerp(1.4, 0, k)); }
    // mom Chompodon
    const mx = lerpK(MX, t), mz = lerpK(MZ, t), mw = moving(MX, t) || moving(MZ, t); parentTo(chomp.root, g); chomp.root.visible = t > E.steps - 1;
    let my = 0, mo = { walk: mw ? 1 : 0, run: win(t, E.fetch, E.fetchEnd) };
    if (win(t, E.fetch + 2, E.fetch + 5)) my = F / 2; else if (win(t, E.fetch + 7, E.fetchEnd)) my = -F / 2 - 0.4;
    if (win(t, E.chomp, E.chomp + 4)) mo.open = true; if (win(t, E.lick, E.lick + 4)) { mo.down = true; mo.open = true; } if (win(t, E.fetchEnd, E.grab)) mo.happy = true;
    if (win(t, E.grab, E.swallow)) { mo.down = t < E.grab + 3; mo.chomp = t > E.grab + 3; } if (win(t, E.swallow, E.swallow + 2)) mo.up = true; if (win(t, E.tickle, E.tickleEnd)) { mo.happy = true; mo.tilt = Math.sin(t * 6) * 0.15; }
    if (win(t, E.sniff, E.sneeze)) { mo.down = true; mo.sniff = true; } if (win(t, E.sneeze, E.sneeze + 1)) mo.sneeze = true; if (t > E.bye) mo.happy = true;
    poseChomp(chomp, t, [mx, 0.5, mz], my, mo);
    // hero
    let hp = [-1.6, 0.5, 2.6], hy = 0.3, ho = { face: 'smug' }; if (t < E.arrive) { hp = [0, 0.5, 0]; hero.root.visible = false; }
    if (t > E.wow) ho = { face: 'smug', wave: win(t, E.wow, E.wow + 3) }; if (t > E.steps) { hy = F; ho = { face: 'scared' }; } if (t > E.chomp) ho = { face: 'scared', panic: t < E.lick };
    if (win(t, E.lick, E.fetch)) { hp = [0, 0.5, -3.2]; hy = F; ho = { face: 'scared', headRoll: 0.3 }; }
    if (win(t, E.fetch, E.grab)) { hp = [1, 0.5, -2.4]; hy = F / 2 - 0.4; ho = { face: 'smug', swing: t < E.fetch + 1 ? (t - E.fetch) : undefined, hips: t > E.fetchEnd }; }
    if (win(t, E.grab, E.repair)) { hp = [1.4, 0.5, 1.8]; hy = F; ho = { face: 'scared', panic: t < E.stuck + 2 }; }
    if (win(t, E.repair, E.tickle)) { hp = [2.4, 0.5, 1.4]; hy = -1.6; ho = { face: 'normal' }; }
    if (win(t, E.tickle, E.sniff)) { hp = [0.6, 0.5, -2.2 + Math.sin(t * 2) * 0.3]; hy = F; ho = { face: 'smug', swing: t * 2 }; fern.visible = true; } else fern.visible = false;
    if (win(t, E.tickleEnd - 3, E.sniff)) ho = { face: 'scared', headRoll: 0.4 };
    if (win(t, E.sniff, E.install)) { hp = [0.4, 0.5, 1.4]; hy = F; ho = { face: 'scared', panic: win(t, E.bonk, E.bonk + 1.2) }; }
    if (t > E.install) { hp = [2.2, 0.5, 2.0]; hy = -0.6; ho = { face: 'smug' }; } if (t > E.bye) { hp = [-3.6, 0.5, 3]; hy = -1.0; ho = { face: 'normal', wave: win(t, E.bye + 6, E.depart) }; }
    if (t > E.depart) { hp = [0, 0.5, 0.4]; hero.root.visible = t < E.depart + 1.5; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); hero.root.visible = t > E.arrive && !(t > E.depart + 1.5);
    // Bloop: fixes the booth with a rock and a fern
    let bp = [1.6, 0.5, 2.6], by = -0.3, bo = {}; if (t > E.steps) by = F; if (win(t, E.stuck, E.repair)) bo = { angry: true };
    if (win(t, E.repair, E.install + 3)) { bp = [1.6, 0.5, 1.4]; by = -2.2; bo = { hop: true }; } if (t > E.install + 3) { bp = [1.8, 0.5, 2.2]; by = -0.3; bo = { hop: win(t, E.install + 3, E.install + 6) }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; bloop6.B.root.visible = t > E.arrive && !(t > E.depart + 1.5); bBrick.visible = win(t, E.repair, E.install);
    // Leggy + egg + baby
    let lp = [-3, 0.5, 2.4], ly = 0.6, ls = 0.3; if (t > E.steps) { ly = F; } if (t > E.egg - 3) { const k = seg(t, E.egg - 3, E.egg); lp = [lerp(-3, -7.6, k), 0.5, lerp(2.4, 5.4, k)]; ly = k < 1 ? -1.6 : -2.0; ls = k < 1 ? 2 : 0.3; }
    if (t > E.tickle) { lp = [-7.0, 0.5, 4.6]; ly = -2.4; } if (t > E.sniff - 2) { const k = seg(t, E.sniff - 2, E.sniff); lp = [lerp(-7, -3, k), 0.5, lerp(4.6, -2, k)]; ly = 1.6; ls = k < 1 ? 2 : 0.3; }
    if (t > E.bye) { lp = [-6.4, 0.5, 1.4]; ly = 1.8; } if (t > E.depart) lp = [0, 0.5, 0];
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = t > E.arrive && t < E.depart + 1.5; if (win(t, E.bye + 4, E.depart)) L6.hd.rotation.x = 0.4;
    egg.visible = t > E.jungle; egg.position.set(-10, 0.6, 4); const ek = seg(t, E.hatch, E.hatch + 0.6); eggTop.position.set(ek * 0.5, 0.6 + ek * 0.8, 0); eggTop.rotation.z = -ek * 1.2; eggBot.visible = true; egg.position.y = 0.6 + (win(t, E.hatch - 3, E.hatch) ? Math.abs(Math.sin(t * 20)) * 0.1 : 0);
    parentTo(chompB.root, g); chompB.root.visible = t > E.hatch && t < E.depart + 0.8; chompB.root.scale.setScalar(0.3);
    let cp = [-10, 0.6, 4], cy = 0.4, co = { happy: true }; if (t > E.hatch + 3) { cp = [lp[0] + 1.6, 0.5, lp[2] + 1.2]; cy = ly; co = { walk: ls > 1 ? 1 : 0, happy: true }; }
    if (t > E.bye) { const k = seg(t, E.bye + 4, E.bye + 7); cp = [lerp(-4.8, -3, k), 0.5, lerp(2.4, -3, k)]; cy = k < 1 ? 2.6 : 1.4; co = { walk: k > 0 && k < 1 ? 1 : 0, happy: k >= 1 }; }
    if (t > E.depart - 3) { const k = seg(t, E.depart - 3, E.depart); cp = [lerp(-3, 0.2, k), 0.5, lerp(-3, 0.2, k)]; cy = 2.4; co = { walk: 1 }; } // the stowaway sneaks in
    poseChomp(chompB, t, cp, cy, co);
    // Muffin + Puff
    poseMuffin(muffin, t, [-0.6, 0.5, 3.6], F - 0.3, { hop: win(t, E.fetchEnd, E.grab) }); parentTo(muffin.root, g); muffin.root.visible = t > E.arrive && t < E.depart + 1.5;
    poseMag(puff, t, [3.2, 0.6, 2.8], -0.8); parentTo(puff.root, g); puff.root.visible = muffin.root.visible;
    // fetch stick
    stick.visible = win(t, E.fetch, E.fetchEnd + 1); { const k = seg(t, E.fetch + 0.6, E.fetch + 2.6); if (t < E.fetch + 5) stick.parent.position.set(lerp(1.2, 18, k), 1.6 + Math.sin(k * Math.PI) * 5, lerp(-2.4, -6, k)); else { chomp.root.updateMatrixWorld(true); const v = new THREE.Vector3(0, 0.1, 2.4); chomp.hd.localToWorld(v); stick.parent.position.copy(v); } stick.parent.rotation.y = F / 2; }
    let cam = camKeys(t, C);
    return { cam, hud: true };
  }
  return { g, update };
})();
