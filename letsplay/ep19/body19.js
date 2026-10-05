// ================================================================ EPISODE 19: "THE TREASURE MAP" — the beach (a bottle, a map, the Dig-o-Matic) → the island (X's everywhere) → the sea cave (Captain Clawdette) → the beach at sunset (chocolate)
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
function palm(g, x, z, h, r) { const p = new THREE.Group(); p.position.set(x, 0.5, z); g.add(p); for (let i = 0; i < h; i++) box(0.6, 1, 0.6, 0, Math.sin(i * 0.3) * 0.3 * i * 0.2, i + 0.5, 0, p, MAT.log); for (let k = 0; k < 5; k++) { const f = pivot(p, Math.sin((h - 1) * 0.3) * 0.3 * (h - 1) * 0.2, h, 0); f.rotation.set(0.5, k * 1.26, 0); box(0.7, 0.14, 3.2, 0, 0, 0, 1.5, f, MAT.leaf); } return p; }
const xMat = new THREE.MeshBasicMaterial({ color: '#e8344e' }); function xMark(g, x, z, s = 1) { const m = new THREE.Group(); m.position.set(x, 0.53, z); g.add(m); for (const a of [0.785, -0.785]) box(1.6 * s, 0.04, 0.3 * s, 0, 0, 0, 0, m, xMat).rotation.y = a; return m; }
const holeM = new THREE.MeshBasicMaterial({ color: '#2a1a0a' }); function hole(g, x, z) { const h = box(1.8, 0.05, 1.8, 0, x, 0.52, z, g, holeM); h.visible = false; return h; }
// --- Scribble Crabs (draw X's in the sand) + Captain Clawdette (her shell is a treasure chest)
function makeCrab(col = '#e8484a', s = 1) { const root = new THREE.Group(), body = pivot(root, 0, 0.3, 0); root.scale.setScalar(s); box(0.9, 0.4, 0.7, col, 0, 0, 0, body);
  const claws = [-1, 1].map(k => { const p = pivot(body, k * 0.6, 0.1, 0.3); box(0.3, 0.3, 0.4, col, k * 0.15, 0, 0.2, p); return p; }); for (const x of [-0.2, 0.2]) { box(0.06, 0.3, 0.06, col, x, 0.35, 0.25, body); box(0.14, 0.14, 0.14, '#ffffff', x, 0.52, 0.25, body); box(0.06, 0.08, 0.04, '#111', x, 0.52, 0.33, body); }
  const legs = []; for (let i = 0; i < 6; i++) { const k = i < 3 ? -1 : 1; const p = pivot(body, k * 0.45, -0.1, -0.2 + (i % 3) * 0.2); box(0.4, 0.06, 0.06, col, k * 0.2, -0.05, 0, p).rotation.z = k * 0.5; legs.push(p); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, claws, legs }; }
function poseCrab(c, t, p, yaw, o = {}) { c.root.position.set(...p); c.root.rotation.set(0, yaw, 0); const w = o.walk || 0; c.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 18 + i * 2) * 0.5 * w); c.body.position.y = 0.3 + Math.abs(Math.sin(t * 18)) * 0.04 * w;
  c.claws.forEach((cl, i) => cl.rotation.set(o.snip ? -0.6 + Math.sin(t * 14 + i) * 0.5 : o.wave ? -1.4 + Math.sin(t * 8 + i * 3) * 0.4 : -0.1, 0, 0)); }
function makeClawdette() { const c = makeCrab('#ff8a5a', 2.6); const chest = new THREE.Group(); c.body.add(chest); chest.position.set(0, 0.55, -0.35);
  const wood = new THREE.MeshLambertMaterial({ color: '#8a5a2b' }); box(1.3, 0.7, 0.9, 0, 0, 0, 0, chest, wood); for (const x of [-0.5, 0.5]) box(0.08, 0.72, 0.92, 0, x, 0, 0, chest, goldM);
  const lid = pivot(chest, 0, 0.35, -0.45); box(1.3, 0.3, 0.9, 0, 0, 0.15, 0.45, lid, wood); box(0.2, 0.2, 0.06, 0, 0, 0.05, 0.92, lid, goldM); const glow = box(1.1, 0.1, 0.7, 0, 0, 0.36, 0, chest, new THREE.MeshBasicMaterial({ color: '#ffd23f' })); glow.visible = false;
  const dome = new THREE.Group(); c.body.add(dome); dome.position.set(0, 0.55, -0.35); box(1.3, 0.6, 1.0, '#c0c0c8', 0, 0, 0, dome); box(1.0, 0.3, 0.8, '#ffd400', 0, 0.42, 0, dome); box(0.2, 0.2, 0.06, '#5ff7ff', 0.3, 0.1, 0.52, dome); dome.visible = false;
  const hat = new THREE.Group(); c.body.add(hat); hat.position.set(0, 0.62, 0.2); box(0.6, 0.1, 0.4, '#111', 0, 0, 0, hat); box(0.4, 0.22, 0.3, '#111', 0, 0.15, 0, hat); box(0.12, 0.12, 0.02, '#ffffff', 0, 0.16, 0.16, hat);
  c.chest = chest; c.lid = lid; c.glow = glow; c.dome = dome; return c; }
const crabs = Array.from({ length: 7 }, () => makeCrab()), claw = makeClawdette();
// --- props: bottle, map, Dig-o-Matic, chocolate coins, sand pile
const bottle = new THREE.Group(); box(0.3, 0.6, 0.3, 0, 0, 0, 0, bottle, MAT.glass); box(0.14, 0.2, 0.14, '#8a5a2b', 0, 0.38, 0, bottle); box(0.16, 0.4, 0.16, '#f2e6c8', 0, -0.02, 0, bottle);
function mapTex() { const c = document.createElement('canvas'); c.width = 256; c.height = 192; const x = c.getContext('2d'); x.fillStyle = '#f2e6c8'; x.fillRect(0, 0, 256, 192); x.strokeStyle = '#8a6a40'; x.lineWidth = 6; x.strokeRect(3, 3, 250, 186);
  x.fillStyle = '#9fd0ff'; x.fillRect(10, 10, 236, 172); x.fillStyle = '#e8d28a'; x.beginPath(); x.ellipse(70, 130, 50, 34, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(180, 70, 54, 40, 0, 0, 7); x.fill();
  x.strokeStyle = '#5a3a22'; x.setLineDash([8, 8]); x.lineWidth = 4; x.beginPath(); x.moveTo(70, 130); x.quadraticCurveTo(120, 60, 180, 70); x.stroke(); x.setLineDash([]); x.strokeStyle = '#e8344e'; x.lineWidth = 8; x.beginPath(); x.moveTo(166, 56); x.lineTo(194, 84); x.moveTo(194, 56); x.lineTo(166, 84); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const mapM = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.02), new THREE.MeshLambertMaterial({ map: mapTex() })); hero.aL.add(mapM); mapM.position.set(0.3, -0.7, 0.45); mapM.rotation.set(-1.2, 0, 0);
const digo = new THREE.Group(), digDrill = pivot(digo, 0, 0.6, 1.4); { const y = new THREE.MeshLambertMaterial({ color: '#ffd400' }); box(1.8, 1.0, 2.2, 0, 0, 0.9, 0, digo, y); box(1.2, 0.8, 1.2, '#c0c0c8', 0, 1.8, -0.2, digo); box(0.9, 0.5, 0.06, '#9fd0ff', 0, 1.9, 0.41, digo);
  for (const [x, z] of [[-0.95, 0.7], [0.95, 0.7], [-0.95, -0.7], [0.95, -0.7]]) box(0.2, 0.6, 0.6, '#222', x, 0.3, z, digo); for (let i = 0; i < 4; i++) box(0.5 - i * 0.1, 0.3, 0.5 - i * 0.1, '#9aa4bd', 0, -0.15 - i * 0.3, 0.2, digDrill); digDrill.rotation.x = 0.9; }
const cocoa = new THREE.Group(); for (let i = 0; i < 9; i++) box(0.4, 0.08, 0.4, 0, (i % 3) * 0.45 - 0.45, Math.floor(i / 3) * 0.09, (i % 2) * 0.2, cocoa, goldM);
const meltM = new THREE.MeshLambertMaterial({ color: '#5a3018' }); const puddleC = box(1.6, 0.04, 1.2, 0, 0, 0, 0, cocoa, meltM); puddleC.visible = false;
const bucket2 = new THREE.Group(); box(0.6, 0.5, 0.6, '#3d7bff', 0, 0.25, 0, bucket2); box(0.66, 0.06, 0.66, '#ffd23f', 0, 0.5, 0, bucket2);
// HUD helpers
const holesAt = t => t < E.dig1 + 4 ? (t > E.buildEnd ? 1 : 0) : t < E.digAll ? 2 : t < E.digEnd ? 2 + Math.floor(seg(t, E.digAll, E.digEnd) * 9) : 11 + (t > E.fall ? 1 : 0);
const mapStep = t => t < E.map ? null : t < E.paces ? 0 : t < E.isle ? seg(t, E.paces, E.isle) * 0.4 : t < E.cave ? 0.4 + seg(t, E.isle, E.cave) * 0.4 : t < E.home ? 0.95 : 1;

// ---------------------------------------------------------------- set A: the beach (morning, then sunset)
const beach = (() => {
  const g = mk('beach'), st = new VSet(g), r = rng(1901);
  for (let x = -40; x <= 40; x++) for (let z = -12; z <= 30; z++) st.add(x, 0, z, z > 18 ? 'turf' : 'sand');
  for (let x = -6; x <= 0; x++) for (let z = -5; z <= -1; z++) for (let y = 1; y <= 3 - Math.abs(x + 3) * 0.5; y++) st.add(x + 14, y, z, 'stone');
  st.build(); const sea = new THREE.Mesh(GEO, MAT.water); sea.scale.set(400, 1, 300); sea.position.set(0, -0.2, -162); g.add(sea);
  const isle = new THREE.Group(); isle.position.set(-20, 0, -90); g.add(isle); box(30, 3, 22, 0, 0, 0.5, 0, isle, MAT.sand); box(12, 8, 10, 0, 6, 3, -4, isle, MAT.stone);
  for (const [x, z, h] of [[-12, 4, 7], [-16, 10, 6], [16, 12, 8], [24, -2, 7], [-24, -4, 6], [20, 22, 6]]) palm(g, x, z, h, r);
  const tide = new THREE.Mesh(GEO, MAT.water); tide.scale.set(80, 1, 30); g.add(tide);
  const camp = new THREE.Group(); camp.position.set(-6, 0.5, 6); g.add(camp); box(2.6, 0.06, 1.8, '#e8344e', 0, 0.03, 0, camp); for (let i = 0; i < 3; i++) box(2.6, 0.065, 0.3, '#ffffff', 0, 0.035, -0.6 + i * 0.6, camp);
  const h0 = hole(g, 4, 4), sandPile = box(1.2, 0.6, 1.2, 0, 5.6, 0.8, 4.4, g, MAT.sand); sandPile.visible = false;
  parentTo(bottle, g); parentTo(digo, g); parentTo(cocoa, g); parentTo(bucket2, g); const crab0 = crabs[0];
  for (let t = E.build; t < E.buildEnd; t += 0.7) burst(t, [8, 1.6, 1], { n: 8, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  for (let t = E.buildEnd; t < E.buildEnd + 3; t += 0.2) burst(t, [4, 0.6, 4], { n: 6, colors: ['#e8d28a', '#c9b06a'], speed: 4, size: 0.2, life: 0.8, grav: 8, up: 4 });
  burst(E.fall, [4, 0.8, 4], { n: 80, colors: ['#e8d28a', '#c9b06a'], speed: 5, size: 0.25, life: 1.2, grav: 8, up: 4 }); burst(E.tidein + 2, [4, 0.6, 2], { n: 60, colors: ['#9fd0ff', '#ffffff'], speed: 4, size: 0.2, life: 1, grav: 8, up: 3 });
  const C = [[0, 0, 6, 22, 0, 2, 0, 52], [5.9, -2, 4, 16, 0, 1.5, 0, 50], [6, 3, 1.6, 6, 0, 0.8, -1, 46], [11.9, 2.4, 1.6, 5.2, 0, 0.8, -1, 42], [12, 1.6, 3.4, 4.4, -0.6, 2.0, 1.6, 44], [19.9, 1.2, 3.2, 4.0, -0.6, 2.0, 1.6, 40],
    [20, -5, 2.6, 7, -2, 1.2, 1, 48], [27.9, -5.4, 2.4, 6.4, -2, 1.2, 1, 46], [28, 12, 3.4, 6, 8, 1.4, 1, 50], [39.9, 11, 3.0, 5, 8, 1.4, 1, 46], [40, 8, 2, 9, 4, 0.8, 4, 48], [43.9, 7.6, 2, 8.4, 4, 0.8, 4, 46],
    [44, -10, 3, 10, 0, 1.6, 0, 52], [57.9, 6, 3, 12, 6, 1.6, -6, 52], [58, 0, 6, 14, -4, 0, -40, 54], [E.isle, 0, 5, 10, -10, 0, -60, 54],
    [E.home, -10, 8, 10, 0, 2, -40, 56], [209.9, -6, 4, 14, -4, 1.6, 2, 50], [210, -2.6, 2.2, 9.6, -5, 1.2, 6, 46], [217.9, -3, 2.0, 9, -5, 1.2, 6, 42], [218, -9, 2.4, 9.4, -6, 1.6, 6, 46], [231.9, -9.4, 2.2, 9.0, -6, 1.6, 6, 42],
    [232, -4, 1.4, 8.4, -6, 0.8, 6, 40], [239.9, -4, 1.2, 8.0, -6, 0.6, 6, 36], [240, 1, 3, 13, -3, 1.6, 6, 50], [251.9, 2, 3, 12, -1, 1.6, 5, 48], [252, 8, 2, 10, 4, 1.2, 4, 50], [259.9, 7.6, 1.6, 8.4, 4, 0.8, 4, 44],
    [260, 4.6, 1.0, 7, 4, 0.8, 4, 46], [267.9, 4.8, 1.0, 6.6, 4, 0.8, 4, 44], [268, 10, 6, 16, 4, 0.5, 2, 52], [275.9, 9, 5, 15, 4, 0.5, 2, 50], [276, 6.6, 1.4, 7.6, 4, 0.9, 4, 44], [E.logo, 6.4, 1.3, 7.2, 4, 0.9, 4, 42]];
  function update(t) {
    hideMisc(); mapM.visible = false; const late = t > E.home, F = Math.PI;
    tide.position.set(0, lerp(-0.6, 0.62, late ? ss(seg(t, E.tidein, E.tidein + 6)) : (t < E.tide ? 0 : 0)), lerp(-26, late ? -10 : -26, late ? 1 : 0) + (late ? lerp(0, 14, ss(seg(t, E.tidein, E.tidein + 6))) : 0) - 2); tide.visible = late;
    h0.visible = t > E.buildEnd + 1; sandPile.visible = h0.visible && !(late && t > E.fall);
    // hero
    let hp = [-1, 0.5, 3], hy = 0.3, ho = { face: 'smug' };
    if (t > E.bottle) { hp = [0.2, 0.5, 1]; hy = F; ho = { face: 'normal', headPitch: 0.4 }; } if (t > E.map) { hp = [-0.6, 0.5, 1.6]; hy = 0.5; ho = { face: 'smug' }; mapM.visible = true; }
    if (t > E.leggyDig) { hy = -1.4; } if (t > E.build) { hp = [6, 0.5, 3]; hy = 0.8; ho = { face: 'normal' }; } if (t > E.buildEnd) { hp = [6.4, 0.5, 6]; hy = -2.4; ho = { face: 'smug', hips: true }; }
    if (t > E.paces) { const k = seg(t, E.paces, E.pacesEnd); hp = [lerp(-6, 8, k), 0.5, lerp(4, -4, k)]; hy = 2.3; ho = { walk: 1, phase: t * 5, face: 'smug' }; mapM.visible = true; } if (t > E.pacesEnd) ho = { face: 'smug', wave: true };
    if (late) { const k = seg(t, E.home, E.home + 4); hp = [lerp(-4, -5, k), 0.5, lerp(-6, 5, k)]; hy = 0; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'smug' };
      if (t > E.count) { hp = [-5, 0.5, 4.8]; hy = 0.4; ho = { face: 'smug', sit: 1 }; } if (t > E.choc) ho = { face: 'scared', sit: 1, headPitch: 0.3 };
      if (t > E.stomp) { const k2 = seg(t, E.stomp, E.fall); hp = [lerp(-4, 4, k2), 0.5, lerp(5, 4, k2)]; hy = F / 2; ho = { face: 'scared', walk: 1, phase: t * 12, panic: true }; }
      if (t > E.fall) { const k3 = seg(t, E.fall, E.fall + 0.6); hp = [4, lerp(0.5, -1.55, k3 * k3), 4]; hy = 0.2; ho = { face: 'scared', panic: k3 < 1 }; } if (t > E.stuck) ho = { face: 'normal', headYaw: Math.sin(t * 2) * 0.3 }; if (t > E.tidein + 2) ho = { face: 'scared', headPitch: -0.2 }; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // bottle (Muffin finds it)
    bottle.visible = !late && t > 2 && t < E.map + 1; bottle.position.set(lerp(-2, 0.4, seg(t, 2, E.bottle)), 0.7 + Math.sin(t * 3) * 0.05, lerp(-8, -0.6, seg(t, 2, E.bottle))); bottle.rotation.z = t < E.bottle ? Math.sin(t * 2) * 0.4 : 1.3;
    // Bloop + Dig-o-Matic
    let bp = [2.4, 0.5, 2.4], by = -0.6, bo = {}; if (t > E.build) { bp = [8, 0.5, -0.2]; by = F; bo = { hop: t < E.buildEnd }; } if (t > E.buildEnd) { bp = [5.2, 0.5, 6.4]; by = -2.6; bo = { hop: t < E.buildEnd + 4 }; } if (t > E.paces) { bp = [lerp(-4, 9, seg(t, E.paces, E.pacesEnd)), 0.5, lerp(5, -2, seg(t, E.paces, E.pacesEnd))]; by = 2.3; bo = { walk: 1, phase: t * 8 }; }
    if (late) { bp = [-7.6, 0.5, 4]; by = 1.2; bo = {}; if (t > E.count) bo = { hop: t < E.bloopPaid + 6 }; card.visible = win(t, E.count, E.bloopPaid); coins.visible = win(t, E.bloopPaid, E.choc); if (t > E.choc) bo = { facepalm: true }; if (t > E.fall + 2) bo = {}; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    digo.visible = t > E.build + 6; digo.position.set(t < E.buildEnd ? 8 : 4, 0.5, t < E.buildEnd ? -1.8 : 2.0); digo.rotation.set(0, 0, 0); digDrill.rotation.z = win(t, E.buildEnd, E.buildEnd + 3) ? t * 30 : 0; if (late) { digo.visible = false; }
    // Leggy (the real digger) + Muffin + Puff + Bonk-bot
    let lp = [-4, 0.5, 0], ly = 1.2, ls = 0.3; if (t > E.leggyDig) { lp = [-3.6, 0.5, 2]; ly = 1.6; } if (t > E.paces) { const k = seg(t, E.paces, E.pacesEnd); lp = [lerp(-8, 6, k), 0.5, lerp(2, -6, k)]; ly = 2.3; ls = 1; }
    if (late) { lp = [-8.4, 0.5, 7.4]; ly = 0.9; ls = 0.3; if (t > E.melt) ly = 1.6; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); if (win(t, E.leggyDig, E.build)) L6.legs.forEach((l, i) => l.rotation.x = Math.max(0, Math.sin(t * 14 + i)) * 0.8);
    let mp = [-1.6, 0.5, 1], mo = {}; if (t < E.bottle) { mp = [lerp(-3, -0.4, seg(t, 2, E.bottle)), 0.5, lerp(3, 0.4, seg(t, 2, E.bottle))]; mo = { hop: true }; } if (late) { mp = [-7, 0.5, 8.6]; mo = { hop: win(t, E.choc, E.stomp), work: win(t, E.choc + 2, E.stomp) }; }
    poseMuffin(muffin, t, mp, late ? -0.6 : 0.6, mo); parentTo(muffin.root, g);
    poseMag(puff, t, [-6.6, 0.6, 7.6], 0.6, { big: late && t > E.melt - 4 && t < E.choc }); parentTo(puff.root, g); puff.root.visible = true;
    poseBot(bot, t, [-10, 0.5, 2], 1.0, { off: true, roll: 0 }); parentTo(bot.root, g);
    // the "treasure": gold coins → chocolate puddle (Puff is very warm)
    cocoa.visible = late && t > E.home + 4; cocoa.position.set(-5.2, 0.55, 6.6); const mk2 = seg(t, E.melt, E.choc); cocoa.children.forEach((c, i) => { if (c === puddleC) return; c.scale.set(1, lerp(1, 0.3, mk2), 1); c.material = mk2 > 0.5 ? meltM : goldM; c.visible = t < E.choc + 6; }); puddleC.visible = t > E.choc; puddleC.scale.setScalar(lerp(0.4, 1, seg(t, E.choc, E.choc + 4)));
    // a scribble crab finishes the job
    parentTo(crab0.root, g); crab0.root.visible = late && t > E.tidein; const ck = seg(t, E.crab - 4, E.crab); poseCrab(crab0, t, t < E.crab ? [lerp(10, 4.4, ck), 0.5, lerp(0, 4, ck)] : [4, 1.2, 4], t < E.crab ? -2.2 : 0, { walk: ck < 1 ? 1 : 0, wave: t > E.crab + 1 });
    bucket2.visible = late && t > E.crab - 4; const bk = seg(t, E.crab - 0.6, E.crab + 0.4); bucket2.position.set(lerp(4.4, 4, bk) + (t < E.crab - 0.6 ? lerp(10, 4.4, ck) - 4.4 : 0), lerp(0.9, 1.0, bk) + Math.sin(bk * Math.PI) * 1.2, lerp(4, 4.1, bk)); bucket2.rotation.set(bk * Math.PI, 0, 0);
    if (t > E.crab + 0.4) crab0.root.position.set(4, 1.55, 4.1);
    const cam = camKeys(t, C); return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the island (X's everywhere) + the sea cave
const isle = (() => {
  const g = mk('isle'), st = new VSet(g), r = rng(1902), CX = 200;
  for (let x = -26; x <= 26; x++) for (let z = -22; z <= 22; z++) { const d = Math.hypot(x / 26, z / 22); if (d > 1) continue; st.add(x, 0, z, 'sand'); if (x > 10 && Math.abs(z) < 12) { const h = Math.round((1 - Math.hypot((x - 18) / 9, z / 11)) * 9); for (let y = 1; y <= h; y++) { if (y <= 4 && Math.abs(z) <= 2 && x < 16) continue; st.add(x, y, z, 'stone'); } } }
  for (let x = CX - 20; x <= CX + 20; x++) for (let z = -16; z <= 16; z++) { const d = Math.hypot((x - CX) / 20, z / 16); if (d > 1.06) continue; st.add(x, 0, z, d < 0.4 ? 'sand' : 'stone'); st.add(x, 12, z, 'dark'); if (d > 0.94) for (let y = 1; y < 12; y++) st.add(x, y, z, hash2(x, y + z, 5) < 0.1 ? 'ore' : 'stone'); }
  st.build(); const sea = new THREE.Mesh(GEO, MAT.water); sea.scale.set(500, 1, 500); sea.position.set(0, -0.2, 0); g.add(sea); const pool = new THREE.Mesh(GEO, MAT.water); pool.scale.set(10, 1, 6); pool.position.set(CX + 10, 0.3, 8); g.add(pool);
  for (const [x, z, h] of [[-14, 6, 7], [-8, -12, 6], [4, 14, 8], [-20, -4, 6], [6, -14, 7]]) palm(g, x, z, h, r);
  const xs = [[0, -2]]; for (let i = 0; i < 12; i++) xs.push([(r() - .5) * 30, (r() - .5) * 26]); const marks = xs.map(([x, z], i) => xMark(g, x, z, i ? 0.8 : 1.2)); const holes = xs.map(([x, z]) => hole(g, x, z));
  const bigX = xMark(g, CX, 0, 3); const cryM = [new THREE.MeshBasicMaterial({ color: '#7af0ff' }), new THREE.MeshBasicMaterial({ color: '#ffd23f' })];
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, x = CX + Math.cos(a) * 16, z = Math.sin(a) * 13; const h = 1 + r() * 2.4; box(0.6, h, 0.6, 0, x, 0.5 + h / 2, z, g, cryM[i % 2]).rotation.set((r() - .5) * 0.5, 0, (r() - .5) * 0.5); }
  for (const [x, z, c] of [[CX - 8, -6, '#7af0ff'], [CX + 8, 6, '#ffd23f'], [CX, 0, '#ffffff']]) { const l = new THREE.PointLight(c, 12, 30, 1.2); l.position.set(x, 7, z); g.add(l); }
  const map2 = box(0.5, 0.06, 0.4, '#f2e6c8', 0, 0, 0, new THREE.Group()); parentTo(map2.parent, g); parentTo(claw.root, g); crabs.forEach(c => parentTo(c.root, g)); parentTo(digo, g);
  for (let t = E.dig1; t < E.dig1 + 6; t += 0.2) burst(t, [0, 0.6, -2], { n: 6, colors: ['#e8d28a', '#c9b06a'], speed: 4, size: 0.2, life: 0.8, grav: 8, up: 4 });
  for (let t = E.digAll; t < E.digEnd; t += 0.3) { const i = 1 + Math.floor(seg(t, E.digAll, E.digEnd) * 11.99); burst(t, [xs[i][0], 0.6, xs[i][1]], { n: 5, colors: ['#e8d28a', '#c9b06a'], speed: 4, size: 0.2, life: 0.8, grav: 8, up: 4 }); }
  burst(E.chest + 0.4, [CX, 2, 0], { n: 60, colors: ['#ffd23f', '#ffffff'], speed: 4, size: 0.15, life: 1.2, grav: 3, up: 2 }); burst(E.trade + 2, [CX, 3, 0], { n: 80, colors: ['#ffd23f', '#ffe066'], speed: 5, size: 0.16, life: 1.4, grav: 6, up: 4 });
  const CR = crabs.map((_, i) => [(r() - .5) * 24, (r() - .5) * 20, r() * 6]);
  const C = [[E.isle, -40, 8, 30, 0, 1, 0, 54], [71.9, -26, 5, 18, 0, 1, -2, 52], [72, 4, 2.4, 4, 0, 0.8, -2, 48], [79.9, 3.6, 2.2, 3.4, 0, 0.8, -2, 44], [80, -3, 1.4, 1, 0, 0.6, -2, 50], [85.9, -2.6, 1.2, 0.4, 0, 0.4, -2, 46],
    [86, 4.4, 3, 4.4, -0.4, 1.4, -1.4, 54], [95.9, 4, 3, 4, -0.4, 1.4, -1.4, 52], [96, -6, 2, 8, 0, 0.5, 0, 52], [101.9, 6, 2, 8, 0, 0.5, 0, 52], [102, 0, 14, 16, 0, 0, 0, 56], [117.9, 0, 12, 12, 0, 0, 0, 56],
    [118, -6, 2.4, 6, 8, 1.4, 0, 50], [125.9, 6, 2.4, 5, 14, 2, 0, 50], [126, CX - 18, 3, 8, CX, 2, 0, 54], [131.9, CX - 14, 3, 6, CX, 2, 0, 52], [132, CX - 10, 6, 12, CX + 6, 3, -4, 56], [139.9, CX - 6, 6, 12, CX + 6, 3, -4, 56],
    [140, CX, 9, 9, CX, 0, 0, 56], [147.9, CX, 8, 7, CX, 0, 0, 52], [148, CX + 8, 4.4, 9, CX - 1, 1.6, 0, 50], [151.9, CX + 7, 4, 8, CX - 1, 1.6, 0, 48], [152, CX - 5, 1.4, 6, CX, 2, 0, 50], [157.9, CX - 5.4, 1.6, 6.4, CX, 2.6, 0, 50],
    [158, CX, 10, 14, CX, 1, 0, 56], [173.9, CX + 4, 9, 13, CX, 1, 0, 56], [174, CX + 6, 4, 10, CX - 2, 1.4, 1.6, 50], [181.9, CX + 5, 4, 9, CX - 2, 1.4, 1.6, 48], [182, CX + 8, 4.4, 10, CX - 1, 2.0, 0, 50], [191.9, CX + 7, 4.2, 9, CX - 1, 2.0, 0, 48],
    [192, CX - 3, 3, 6, CX, 2, 0, 50], [E.home, CX - 2, 3, 5, CX, 2, 0, 46]];
  function update(t) {
    hideMisc(); mapM.visible = false; const F = Math.PI, inCave = t > E.cave;
    holes[0].visible = t > E.dig1 + 4; marks[0].visible = !holes[0].visible; for (let i = 1; i < xs.length; i++) { marks[i].visible = t > E.xs + i * 0.4 && !(t > E.digAll + (i - 1) / 11 * (E.digEnd - E.digAll)); holes[i].visible = t > E.digAll + (i - 1) / 11 * (E.digEnd - E.digAll) + 0.3; }
    bigX.visible = true;
    // Dig-o-Matic
    digo.visible = !inCave; const dI = t < E.digAll ? 0 : 1 + Math.floor(seg(t, E.digAll, E.digEnd) * 11.99); digo.position.set(xs[dI][0] - 1.6, 0.5, xs[dI][1] - 0.6); digo.rotation.set(0, F / 2, 0); digDrill.rotation.z = win(t, E.dig1, E.dig1 + 6) || win(t, E.digAll, E.digEnd) ? t * 30 : 0; if (t < E.dig1 - 2) digo.position.set(-6, 0.5, 4);
    // crabs scribbling
    crabs.forEach((c, i) => { const [x0, z0, ph] = CR[i]; c.root.visible = !inCave; const w = t * 0.6 + ph; poseCrab(c, t, [x0 + Math.sin(w) * 2, 0.5, z0 + Math.cos(w * 1.3) * 2], w + F / 2, { walk: 1, snip: win(t, E.xs, E.digAll) }); });
    // hero
    let hp = [-16, 0.5, 8], hy = 2.2, ho = { face: 'smug' };
    if (!inCave) { if (t < E.dig1) { const k = seg(t, E.isle, E.isle + 6); hp = [lerp(-22, -1.6, k), 0.5, lerp(12, 0, k)]; hy = 2.2; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'smug' }; mapM.visible = true; }
      else if (t < E.map2) { hp = [1.4, 0.5, -0.6]; hy = -2; ho = { face: 'smug', hips: true }; } else if (t < E.xs) { hp = [0.6, 0.5, -1.0]; hy = -0.6; ho = { face: 'normal', hold: true }; } else if (t < E.digAll) { hp = [0, 0.5, 1.4]; hy = 0; ho = { face: 'scared', headYaw: Math.sin(t * 3) * 0.6 }; }
      else if (t < E.digEnd) { const i = 1 + Math.floor(seg(t, E.digAll, E.digEnd) * 11.99); hp = [xs[i][0] + 1.4, 0.5, xs[i][1] + 1]; hy = -2.2; ho = { face: 'scared', panic: true }; }
      else { const k = seg(t, E.leggyNose, E.cave); hp = [lerp(-2, 15, k), 0.5, lerp(2, 0, k)]; hy = F / 2; ho = { walk: 1, phase: t * 9, face: 'normal' }; } }
    else { hp = [CX - 6, 0.5, 1]; hy = F / 2; ho = { face: 'smug' }; if (t > E.bigX) { hp = [CX - 2.4, 0.5, 1.2]; ho = { face: 'smug', hips: true }; } if (t > E.chest) ho = { face: 'smug', hold: true }; if (t > E.walk) ho = { face: 'scared', panic: true };
      if (t > E.chase) { const a = (t - E.chase) * 1.1; hp = [CX + Math.cos(a - 0.6) * 7, 0.5, Math.sin(a - 0.6) * 6]; hy = -a + 0.6 + F; ho = { walk: 1, phase: t * 14, face: 'scared', panic: true }; } if (t > E.chaseEnd) { hp = [CX - 4.6, 0.5, -0.4]; hy = F / 2; ho = { face: 'scared', flat: 1, flatDir: -1 }; }
      if (t > E.shell) { hp = [CX - 3, 0.5, 1.6]; hy = 1.2; ho = { face: 'smug' }; } if (t > E.trade) ho = { face: 'smug', wave: win(t, E.trade + 2, E.trade + 6) }; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    map2.parent.visible = win(t, E.map2 - 1, E.xs); map2.parent.position.set(0, t < E.map2 ? 0.6 : 2.0, -2); map2.parent.rotation.x = t > E.map2 ? -1.2 : 0;
    // Bloop drives the Dig-o-Matic, then gives Clawdette its dome as a new shell
    let bp = [-2.4, 0.5, 0.4], by = 0.6, bo = {}; if (!inCave) { if (t < E.dig1) { const k = seg(t, E.isle, E.isle + 6); bp = [lerp(-24, -3.4, k), 0.5, lerp(14, 2.4, k)]; by = 2.2; bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; } else { bp = [digo.position.x, 2.6, digo.position.z]; by = F / 2; bo = {}; } if (t > E.digEnd) { const k = seg(t, E.leggyNose, E.cave); bp = [lerp(-4, 13, k), 0.5, lerp(1, -1.2, k)]; by = F / 2; bo = { walk: 1, phase: t * 8 }; } }
    else { bp = [CX - 7, 0.5, -1.4]; by = F / 2; if (t > E.walk) bo = { angry: true }; if (t > E.chase) { bp = [CX - 8, 0.5, -3]; by = 1.2; bo = { facepalm: true }; } if (t > E.snack) { bp = [CX - 1.6, 0.5, -1.8]; by = 0.6; bo = { hop: true }; } if (t > E.shell + 2) { bp = [CX - 2, 0.5, -2.2]; by = 0.8; bo = { handOut: t < E.trade, hop: t > E.trade + 2 }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    // Leggy follows her nose to the cave; calms Clawdette with a snack
    let lp = [-18, 0.5, 10], ly = 2.2, ls = 0.3; if (!inCave) { const k = seg(t, E.isle, E.isle + 6); lp = [lerp(-26, -5, k), 0.5, lerp(10, 4, k)]; ls = k < 1 ? 2 : 0.3; if (t > E.xs) { ly = 1.5; } if (t > E.leggyNose) { const k2 = seg(t, E.leggyNose - 4, E.leggyNose + 6); lp = [lerp(-5, 13, k2), 0.5, lerp(4, 2, k2)]; ly = F / 2; ls = k2 < 1 ? 1.4 : 0.3; } }
    else { lp = [CX - 8, 0.5, 3]; ly = F / 2; if (t > E.chase) { lp = [CX - 10, 0.5, 4]; ly = 1.2; } if (t > E.chaseEnd) { const k = seg(t, E.chaseEnd, E.snack); lp = [lerp(CX - 10, CX - 4, k), 0.5, lerp(4, 2.4, k)]; ly = 1.4; ls = k < 1 ? 1.4 : 0.3; } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); if (!inCave && win(t, E.leggyNose - 4, E.leggyNose)) L6.hd.rotation.x = 0.5 + Math.sin(t * 10) * 0.1;
    // Muffin + Puff
    poseMuffin(muffin, t, inCave ? [CX - 9, 0.5, 1] : [-3, 0.5, 3.4], inCave ? F / 2 : 0.4, { hop: win(t, E.trade, E.home) }); parentTo(muffin.root, g); muffin.root.visible = t > E.isle + 6;
    poseMag(puff, t, inCave ? [CX - 4, 3.2, 1.4] : [-2, 0.6, 4.4], F / 2); parentTo(puff.root, g); puff.root.visible = muffin.root.visible; puff.light.intensity = inCave ? 8 : 4;
    // Captain Clawdette
    claw.root.visible = inCave; let cp = [CX, 0.5, 0], cy = F / 2 + F, co = {}; claw.lid.rotation.x = win(t, E.chest, E.walk) ? -0.9 * seg(t, E.chest, E.chest + 0.6) : t > E.trade ? -0.9 : 0; claw.glow.visible = claw.lid.rotation.x < -0.3 && !claw.dome.visible;
    if (t > E.walk) { claw.body.position.y = 0.3 + seg(t, E.walk, E.walk + 1) * 0.3; co = { wave: t < E.chase }; cy = 0.7; } if (t > E.chase) { const a = (t - E.chase) * 1.1; cp = [CX + Math.cos(a) * 7, 0.5, Math.sin(a) * 6]; cy = -a + F; co = { walk: 1, snip: true }; }
    if (t > E.chaseEnd) { cp = [CX - 1, 0.5, 2.4]; cy = 0.9; co = { snip: t < E.snack }; } if (t > E.shell) { co = { wave: true }; } poseCrab(claw, t, cp, cy, co);
    claw.dome.visible = t > E.shell + 3; claw.chest.visible = !claw.dome.visible;
    let cam = camKeys(t, C);
    return { cam, hud: true, cave: inCave };
  }
  return { g, update };
})();
