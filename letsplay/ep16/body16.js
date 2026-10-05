// ================================================================ EPISODE 16: "IT WORKED?!" — morning camp (plans, invoice PAID) → the gorge (build a bridge; storm, fish, wind… nothing breaks) → calm sunset (one pebble)
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const moving = (K, t) => Math.abs(lerpK(K, t + 0.1) - lerpK(K, t)) > 0.01;
function signTex(a, b, bg) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 256, 128); x.strokeStyle = '#3a2210'; x.lineWidth = 8; x.strokeRect(4, 4, 248, 120);
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#2a1a0a'; x.font = 'bold 30px "DejaVu Sans", sans-serif'; x.fillText(a, 128, 44); x.font = 'bold 40px "DejaVu Sans", sans-serif'; x.fillText(b, 128, 92); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
// --- Inspector Snailsworth: a very slow, very thorough building inspector
function makeSnail() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), skin = new THREE.MeshLambertMaterial({ color: '#b8d0a0' });
  box(0.9, 0.5, 2.6, 0, 0, 0.25, 0, body, skin); const neck = pivot(body, 0, 0.4, 1.1); box(0.6, 1.1, 0.6, 0, 0, 0.5, 0, neck, skin);
  const hd = pivot(neck, 0, 1.0, 0); box(0.7, 0.6, 0.7, 0, 0, 0.2, 0.05, hd, skin); box(0.3, 0.06, 0.04, '#5a3a22', 0, 0.02, 0.41, hd);
  const eyes = [-0.2, 0.2].map(x => { const p = pivot(hd, x, 0.45, 0.1); box(0.08, 0.6, 0.08, 0, 0, 0.3, 0, p, skin); box(0.22, 0.22, 0.22, '#ffffff', 0, 0.66, 0, p); box(0.1, 0.12, 0.04, '#111', 0, 0.66, 0.12, p); return p; });
  box(0.28, 0.28, 0.02, '#ffd23f', 0.2, 1.11, 0.25, hd); box(0.02, 0.4, 0.02, '#ffd23f', 0.32, 0.86, 0.25, hd);
  box(0.36, 0.16, 0.06, '#e8344e', 0, -0.1, 0.4, hd); // bow tie
  const shell = pivot(body, 0, 0.5, -0.3); const sm = ['#c07a3a', '#a8642a', '#d89a5a'];
  [[1.6, 1.6, 1.0, 0.8], [1.2, 1.2, 1.04, 0.9], [0.8, 0.8, 1.08, 1.0], [0.4, 0.4, 1.12, 1.1]].forEach(([w, h, d, y], i) => box(d, h, w, sm[i % 3], 0, y, 0, shell));
  const clip = pivot(body, 0.5, 0.7, 1.0); box(0.06, 0.6, 0.45, '#8a5a2b', 0, 0, 0, clip); box(0.07, 0.5, 0.38, '#ffffff', 0.01, 0, 0, clip);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, neck, hd, eyes, shell, clip };
}
function poseSnail(s, t, p, yaw, o = {}) { s.root.position.set(...p); s.root.rotation.set(0, yaw, 0); const w = o.slide ? Math.sin(t * 3) * 0.05 : 0; s.body.scale.set(1, 1, 1 + w);
  s.neck.rotation.x = o.peer ? 0.7 : Math.sin(t * 0.8) * 0.06; s.eyes.forEach((e, i) => e.rotation.set(o.peer ? -0.5 : 0, 0, (i ? -1 : 1) * (0.15 + Math.sin(t * 2 + i) * 0.1))); s.clip.rotation.x = o.write ? Math.sin(t * 6) * 0.2 : 0; }
const snail = makeSnail(); snail.root.scale.setScalar(1.25);
const hammer = new THREE.Group(); box(0.06, 0.06, 0.6, '#8a5a2b', 0, 0, 0.3, hammer); box(0.18, 0.18, 0.3, '#9aa4bd', 0, 0, 0.62, hammer);
const receiptF = new THREE.Group(); box(0.9, 1.1, 0.08, '#7a4a2a', 0, 0, 0, receiptF); box(0.7, 0.9, 0.02, '#ffffff', 0, 0, 0.05, receiptF); box(0.5, 0.06, 0.01, '#3cc26a', 0, 0.2, 0.065, receiptF); box(0.4, 0.2, 0.01, '#e8344e', 0, -0.2, 0.065, receiptF);
board.material = MAT.plank;
const pebble = box(0.22, 0.2, 0.22, '#8a8478', 0, 0, 0, new THREE.Group());
// --- the Doom-o-meter (hero paranoia) + memories of past disasters
const doom = t => { const n = Math.sin(t * 9) * 0.03; if (t < E.build) return 0.3 + n; if (t < E.done) return lerp(0.35, 0.7, seg(t, E.build, E.done)) + n; if (t < E.snail) return 0.75 + n; if (t < E.approve) return lerp(0.8, 0.95, seg(t, E.snail, E.approve)) + n;
  if (t < E.storm) return 0.6 + n; if (t < E.rainbow) return 1; if (t < E.fish) return 0.7 + n; if (t < E.fish + 4) return 1; if (t < E.wind) return 0.8 + n; if (t < E.cross) return 1; if (t < E.relax) return lerp(0.9, 0.95, seg(t, E.cross, E.relax)) + n;
  if (t < E.pebble) return lerp(0.6, 0.04, seg(t, E.relax, E.relax + 20)); return 1; };
const doomL = t => t > E.pebble ? 'PEBBLE!!!' : win(t, E.relax + 20, E.pebble) ? 'it... worked?' : null;
const MEM = [[E.cb1, 'the house that fell over'], [E.cb2, 'the fortress that sank'], [E.cb3, 'the island that was a FISH'], [E.cb4, 'the house that floated away'], [E.storm + 3, 'the flood']];
function drawMemories(T) { for (const [s, txt] of MEM) { if (!win(T, s, s + 3.6)) continue; const k = ss(seg(T, s, s + 0.3)) * (1 - ss(seg(T, s + 3.2, s + 3.6)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W - 230, H * 0.5 + (1 - k) * 60); ctx.rotate(0.06); ctx.fillStyle = '#f2e6c8'; ctx.fillRect(-170, -90, 340, 180); ctx.fillStyle = '#5a4a34'; ctx.fillRect(-150, -72, 300, 96);
  ctx.fillStyle = '#a89070'; for (let i = 0; i < 6; i++) ctx.fillRect(-140 + i * 48, -40 + Math.sin(i + s) * 18, 30, 50 - Math.sin(i + s) * 18);
  outlined('REMEMBER...', 0, -84, 18, '#ffe066', '#000', 4); outlined(txt, 0, 52, 20, '#3a2410', '#f2e6c8', 2); ctx.strokeStyle = '#e8344e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -24, 36, 0, 7); ctx.stroke(); ctx.restore(); } }

// ---------------------------------------------------------------- set A: morning camp
const camp = (() => {
  const g = mk('camp'), st = new VSet(g), r = rng(1601);
  for (let x = -36; x <= 36; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, Math.abs(z - x * 0.3 - 2) <= 1 && x > 2 ? 'path' : 'turf');
  for (const [x, z] of [[-3, -3], [-2, -3], [-3, -2]]) st.add(x, 1, z, 'log');
  const trees = [[-12, -6]]; tree(st, -12, 0, -6, r, 5); for (let i = 0; i < 46; i++) { const x = Math.round((r() - .5) * 70), z = Math.round((r() - .5) * 56); if (Math.abs(x) < 14 && Math.abs(z) < 12) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const tent = new THREE.Group(); tent.position.set(-6, 0.5, -5); tent.rotation.y = 0.4; g.add(tent); const tm = new THREE.MeshLambertMaterial({ color: '#ff8a2a' });
  for (let i = 0; i < 5; i++) box(4.2 - i * 0.84, 0.6, 3, 0, 0, 0.3 + i * 0.6, 0, tent, tm); box(1, 1.6, 0.05, '#4a2a10', 0, 0.8, 1.52, tent);
  const fire = new THREE.Group(); fire.position.set(0, 0.5, 0); g.add(fire); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; box(0.4, 0.3, 0.4, '#777', Math.cos(a) * 0.8, 0.15, Math.sin(a) * 0.8, fire); }
  const table = new THREE.Group(); table.position.set(4, 0.5, -2.4); g.add(table); box(2.6, 0.12, 1.6, 0, 0, 1.1, 0, table, MAT.plank); for (const [x, z] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]]) box(0.12, 1.1, 0.12, '#6a4a2a', x, 0.55, z, table);
  const plan = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.02, 1.3), new THREE.MeshBasicMaterial({ map: signTex('BRIDGE PLAN', '~~~~~~~~', '#9fd0ff') })); plan.position.set(0, 1.18, 0); table.add(plan);
  const pile = new THREE.Group(); pile.position.set(8, 0.5, 3); g.add(pile); for (let i = 0; i < 6; i++) box(3, 0.25, 0.9, 0, 0, 0.13 + i * 0.26, (i % 2) * 0.2, pile, MAT.plank);
  const post = new THREE.Group(); post.position.set(10, 0.5, 6); post.rotation.y = -0.5; g.add(post); box(0.2, 2.4, 0.2, '#6a4a2a', 0, 1.2, 0, post); const ps = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 0.08), new THREE.MeshLambertMaterial({ map: signTex('THE GORGE', '→', '#e8d0a0') })); ps.position.y = 2.2; post.add(ps);
  burst(E.pay + 2.4, [3.2, 2.6, 0.2], { n: 40, colors: ['#ffd23f', '#ffffff', '#3cc26a'], speed: 4, size: 0.14, life: 1.2, grav: 4, up: 3 });
  const C = [[0, 0, 6, 16, 0, 1.5, -1, 50], [5.9, -2, 4, 11, 0, 1.6, -1, 46], [6.0, 2.6, 2.4, 4.4, 0.4, 2, 0, 46], [13.9, 2.0, 2.4, 3.6, 0.4, 2, 0, 42],
    [14.0, 1.0, 3.6, 1.6, 4, 1.4, -2.4, 50], [17.9, 1.4, 3.4, 1.0, 4, 1.4, -2.4, 46], [18.0, 6.4, 2.4, 4.0, 3, 1.6, -0.6, 48], [25.9, 6.8, 2.2, 3.4, 3, 1.4, -0.6, 46],
    [26.0, 4, 2.6, 9, 8, 1.6, 3, 50], [31.9, 2, 3.0, 11, 9, 1.6, 4, 52]];
  function update(t) {
    hideMisc();
    let hp = [0.4, 0.5, 1.4], hy = 0.2, ho = { face: 'scared' }; if (t > E.plans) { hp = [2.6, 0.5, -0.8]; hy = 1.0; ho = { face: 'scared' }; } if (t > E.pay) { hy = 1.3; ho = { face: 'smug', hold: win(t, E.pay, E.pay + 2.4) }; }
    if (t > E.leggy) { hp = [5, 0.5, 2.2]; hy = 1.2; ho = { face: 'scared', headYaw: Math.sin(t * 4) * 0.5 }; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    let bp = [4, 0.5, -1.0], by = Math.PI, bo = {}; if (t > E.plans) { by = -1.4; bo = { handOut: win(t, E.plans + 1, E.pay) }; } if (t > E.pay) bo = {};
    const faint = seg(t, E.pay + 2.4, E.pay + 3.0) * (1 - seg(t, E.leggy - 1, E.leggy)); if (t > E.leggy) { bp = [6.4, 0.5, 0.4]; by = -1.0; bo = { hop: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.body.rotation.x = -faint * Math.PI / 2; bloop6.B.root.position.y += faint * 0.3; bHat.visible = true; bHat.position.y = 1.2;
    card.visible = win(t, E.plans + 1, E.pay + 2.4); coins.visible = win(t, E.pay + 0.4, E.pay + 2.4);
    let lp = [-7, 0.5, -1.4], ly = 1.2, ls = 0.3; if (t > E.leggy) { const k = seg(t, E.leggy, E.leggy + 3); lp = [lerp(-7, 9.4, k), 0.5, lerp(-1.4, 6.4, k)]; ls = k < 1 ? 2 : 0.3; ly = k < 1 ? 1.4 : 0.6; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true;
    poseMag(puff, t, [-0.2, 0.6, 0.0], 0.4, { big: true }); parentTo(puff.root, g); puff.root.visible = true;
    poseMuffin(muffin, t, [-1.8, 0.5, 1.2], 0.8, { hop: win(t, E.pay + 2.4, E.leggy) }); parentTo(muffin.root, g); muffin.root.visible = true;
    poseBot(bot, t, [-3.6, 0.5, -1.2], 0.9, { off: true, roll: 0 }); parentTo(bot.root, g); bot.root.visible = true;
    const cam = camKeys(t, C); return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the gorge + the bridge
const gorge = (() => {
  const g = mk('gorge'), st = new VSet(g), r = rng(1602);
  for (let x = -40; x <= 40; x++) { if (Math.abs(x) < 7) continue; for (let z = -32; z <= 32; z++) { st.add(x, 0, z, Math.abs(z) <= 1 && Math.abs(x) < 18 ? 'path' : 'turf'); if (Math.abs(x) <= 8) for (let y = -12; y < 0; y++) st.add(x, y, z, hash2(x, y * 5 + z, 4) < 0.1 ? 'ore' : y > -2 ? 'soil' : 'stone'); } }
  for (let x = -6; x <= 6; x++) for (let z = -32; z <= 32; z++) st.add(x, -13, z, 'sand');
  const trees = []; for (let i = 0; i < 60; i++) { const x = Math.round((r() - .5) * 78), z = Math.round((r() - .5) * 60); if (Math.abs(x) < 12 || (Math.abs(z) < 8 && Math.abs(x) < 22)) continue; if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  const water = new THREE.Mesh(GEO, MAT.water); water.scale.set(13, 1, 66); water.position.set(0, -12.2, 0); water.receiveShadow = true; g.add(water);
  // bridge (deck group sways in the wind)
  const deck = new THREE.Group(); g.add(deck); const planks = [], rails = [];
  for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(GEO, MAT.plank); p.scale.set(0.96, 0.24, 3.2); p.position.set(-6.5 + i, 0.38, 0); p.castShadow = p.receiveShadow = true; deck.add(p); planks.push(p); }
  for (let i = 0; i <= 7; i++) for (const z of [-1.5, 1.5]) rails.push(box(0.16, 1.2, 0.16, '#6a4a2a', -7 + i * 2, 1.0, z, deck));
  const ropes = [-1.5, 1.5].map(z => box(1, 0.08, 0.08, '#c9a46a', 0, 1.5, z, deck));
  const sup = new THREE.Group(); g.add(sup); for (const s of [-1, 1]) for (const z of [-1.2, 1.2]) { const b = box(0.3, 0.3, 7.6, 0, s * 4.4, -2.6, z, sup, MAT.log); b.rotation.y = Math.PI / 2; b.rotation.z = s * 0.6; }
  const block = new THREE.Mesh(GEO, MAT.stone); block.scale.set(1, 1, 3); block.position.set(0, -0.4, 0); sup.add(block);
  const sign = new THREE.Group(); sign.position.set(-9, 0.5, -3); sign.rotation.y = 0.6; g.add(sign); box(0.16, 2.2, 0.16, '#6a4a2a', 0, 1.1, 0, sign);
  const s0 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.08), new THREE.MeshLambertMaterial({ map: signTex('DAYS W/O DISASTER', '0', '#ffe6a0') })), s1 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 0.08), new THREE.MeshLambertMaterial({ map: signTex('DAYS W/O DISASTER', '1', '#c8f0a0') }));
  for (const s of [s0, s1]) { s.position.y = 2.2; sign.add(s); }
  const rainbow = new THREE.Group(); rainbow.position.set(0, -20, -90); g.add(rainbow); ['#ff4a4a', '#ff9a2a', '#ffe066', '#3cc26a', '#3d7bff', '#8a4aff'].forEach((c, i) => { const R = 60 - i * 2.2; const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.6, fog: false }); for (let a = 0; a <= 30; a++) { const th = a / 30 * Math.PI; box(3, 2.2, 0.5, 0, Math.cos(th) * R, Math.sin(th) * R, 0, rainbow, m); } });
  const blanket = box(4, 0.06, 3, '#e8344e', 13, 0.53, 3, g); for (let i = 0; i < 4; i++) box(1, 0.065, 3, '#ffffff', 11.5 + i, 0.535, 3, g).visible = i % 2 === 0;
  const easel = new THREE.Group(); easel.position.set(15.6, 0.5, 1.2); easel.rotation.y = -0.9; g.add(easel); box(0.1, 1.6, 0.1, '#6a4a2a', 0, 0.8, 0, easel); receiptF.position.set(0, 1.7, 0.08); easel.add(receiptF);
  parentTo(snail.root, g); parentTo(hammer, g); parentTo(pebble.parent, g); parentTo(glub.root, g);
  // weather + particles
  for (let t = E.storm; t < E.rainbow; t += 0.08) burst(t, [(hash2(t * 100, 1, 2) - 0.5) * 30, 14, (hash2(t * 100, 2, 3) - 0.5) * 24], { n: 14, colors: ['#9fd0ff', '#cfe8ff'], speed: 1, size: 0.07, life: 1.6, grav: 30, up: 0 });
  burst(E.fish + 0.4, [0, -12, 7], { n: 80, colors: ['#9fd0ff', '#ffffff'], speed: 6, size: 0.2, life: 1.4, grav: 10, up: 8 }); burst(E.fish + 3.2, [0, -12, -7], { n: 80, colors: ['#9fd0ff', '#ffffff'], speed: 6, size: 0.2, life: 1.4, grav: 10, up: 8 });
  for (let t = E.build; t < E.buildEnd; t += 2.4) burst(t, [-6.5 + 14 * seg(t, E.build, E.buildEnd), 0.8, 0], { n: 10, colors: ['#f0bf70', '#ffffff'], speed: 2, size: 0.1, life: 0.6, grav: 6, up: 2 });
  for (let t = E.inspect; t < E.approve - 2; t += 1.5) burst(t, [-6 + 11 * seg(t, E.inspect, E.approve - 2) + 1.2, 0.6, 0.4], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 2, size: 0.08, life: 0.4, grav: 6, up: 1 });
  burst(E.approve + 0.4, [3, 3, 0], { n: 60, colors: ['#ffd23f', '#ffffff'], speed: 4, size: 0.14, life: 1.2, grav: 3, up: 2 });
  burst(E.cross + 9, [10, 3, 0], { n: 70, colors: ['#ff5cf0', '#ffe066', '#5ff7ff'], speed: 5, size: 0.14, life: 1.6, grav: 3, up: 3 });
  burst(E.pebble + 3.2, [0.4, -12, 1.7], { n: 8, colors: ['#9fd0ff'], speed: 1.2, size: 0.1, life: 0.6, grav: 6, up: 1.5 });
  const SX = [[E.snail, -34], [E.snail + 12, -9.5], [E.inspect, -6], [E.approve - 2, 5], [E.storm, 5], [E.cross + 6, 11.6]];
  const C = [[E.gorge, -26, 12, 28, 0, -2, 0, 54], [35.9, -20, 9, 22, 0, -2, 0, 52], [36, -10, 3, 6, -4, 0.8, 0, 50], [43.9, -9, 3.4, 5, -2, 0.8, 0, 48],
    [44, 3, -6, 10, 0, 0, 0, 54], [51.9, -3, -6, 10, 0, 0, 0, 54], [52, -12.4, 2.4, 3, -9, 1.8, -1.6, 46], [59.9, -12.0, 2.4, 2.2, -9, 1.8, -1.6, 44],
    [60, 2, 0.6, 6, 6, 0.6, 0, 50], [67.9, 6, 0.8, 6, 10, 0.6, 0, 50], [68, 2, -4.6, 3, 0, -1, 0, 54], [77.9, -1, -4.4, 3.4, 0, -0.8, 0, 50],
    [78, 0, 8, 16, 0, 0, 0, 52], [83.9, 0, 6, 13, 0, 0, 0, 50], [84, -9, 2.4, 5, -4, 0.4, 0, 50], [89.9, -8.6, 2.2, 4.4, -2, -2, 0, 50],
    [90, -9, 3, 6, 0, 1.2, 0, 52], [99.9, 3, 3, 6.4, 6, 1.2, 0, 52], [100, -24, 2.2, 8, -28, 1.2, 0, 50], [107.9, -14, 2.2, 7, -18, 1.2, 0, 50], [108, -6, 2.6, 6, -10, 1.4, 0, 50], [111.9, -5, 2.4, 5, -9, 1.4, 0, 48],
    [112, -10, 3.4, 5, -3, 1.0, 0, 50], [123.9, -4, 3.4, 5, 3, 1.0, 0, 50], [124, -3.6, 3.0, -4.2, 0, 1.2, 0, 50], [131.9, -1.6, 3.0, -4.6, 2, 1.2, 0, 48], [132, 10, 3.2, 7, 4, 1.8, 0, 46], [141.9, 9.4, 3.0, 6, 4, 1.8, 0, 42],
    [142, -16, 6, 14, 0, 2, 0, 56], [149.9, -14, 5, 12, 0, 2, 0, 54], [150, -12, 2.2, 3.4, -9, 1.6, -1, 46], [155.9, -11.6, 2.2, 3.0, -9, 1.6, -1, 44], [156, -14, 3, 10, 6, 8, -40, 56], [165.9, -13, 3, 9, 6, 10, -40, 56],
    [166, -6, 4, 16, 0, 0, 0, 56], [175.9, -8, 3, 15, 0, 0, 0, 56], [176, -3, 2.0, 3.4, 0, 0.6, 0, 52], [185.9, -2, 2.0, 3.0, 0, 0.6, 0, 50],
    [186, -12, 2.6, 2.6, -2, 1.6, 0, 50], [193.9, 4, 2.4, 3.2, 10, 1.6, 0, 50], [194, 18, 3, 6, 9, 1.6, 0, 50], [199.9, 17, 3, 5, 9, 1.6, 0, 46],
    [200, 19, 2.6, 6, 13, 1.2, 3, 48], [207.9, 18.4, 2.4, 5.4, 15.6, 2.0, 1.2, 40], [208, 4, 2.0, 5.0, 1.8, 1.2, 0, 46], [221.9, 4.2, 1.8, 4.2, 1.8, 1.2, 0, 40],
    [222, 8, 3, 9, 3, 1, 0, 50], [229.9, 9, 3, 8, 12, 1, 2, 50], [230, 13, 2.2, 9, 13, 1, 3, 46], [239.9, 12.4, 2.0, 7.6, 13, 1, 3, 42], [240, 9, 1.6, 6.6, 13, 1.4, 3, 46], [247.9, 9.6, 1.8, 6.0, 13, 1.4, 3, 44],
    [248, 26, 3, 14, 6, 1, 0, 50], [261.9, 24, 3.6, 10, 6, 1, 0, 48], [262, -6, 2.4, 0.4, -9, 2.2, -3, 46], [267.9, -6.4, 2.4, 0.2, -9, 2.2, -3, 44],
    [268, 1.6, 1.2, 4, 0.4, 0.2, 1.7, 40], [271.9, 1.6, 0.4, 4, 0.4, -4, 1.7, 46], [272, 18, 2.4, 9, 13, 1.6, 3, 46], [279.9, 16.6, 2.2, 7.4, 13, 1.6, 3, 40], [280, 19, 3.0, 10, 13, 1.4, 3, 50], [E.logo, 18.4, 2.8, 9.2, 13, 1.4, 3, 48]];
  function update(t) {
    hideMisc(); const F = Math.PI, nP = Math.floor(lerp(0, 14.99, seg(t, E.build, E.buildEnd))), sway = win(t, E.wind, E.cross) ? Math.sin(t * 3) * 0.035 : 0;
    planks.forEach((p, i) => p.visible = i < nP); rails.forEach((r, i) => r.visible = Math.floor(i / 2) * 2 <= nP); ropes.forEach(rp => { rp.visible = nP > 1; rp.scale.x = Math.max(0.01, nP); rp.position.x = -7 + nP / 2; });
    deck.rotation.x = sway; sup.visible = t > E.build + 6; block.visible = t > E.support - 2; s1.visible = t > E.sunsetCalm + 10; s0.visible = !s1.visible;
    rainbow.visible = win(t, E.rainbow, E.cross + 20); const onB = x => [x, Math.abs(x) < 7 ? 0.5 + sway * 0 : 0.5, 0];
    // hero
    let hp = [-9, 0.5, -1.4], hy = F / 2, ho = { face: 'scared', headYaw: Math.sin(t * 3) * 0.4 };
    if (t < E.gorge + 6) { const k = seg(t, E.gorge, E.gorge + 6); hp = [lerp(-24, -9, k), 0.5, lerp(-6, -1.4, k)]; ho = { walk: 1, phase: t * 9, face: 'scared' }; }
    if (win(t, E.build, E.buildEnd)) ho = { face: 'scared', panic: MEM.some(([s]) => win(t, s, s + 1.2)) };
    if (win(t, E.support, E.done)) { hp = [-7.4, 0.3, -0.4]; hy = F / 2; ho = { face: 'scared', flat: 1, flatDir: 1, headPitch: -0.6 }; }
    if (win(t, E.done, E.rock)) { hp = [-8.6, 0.5, 0]; hy = F / 2; ho = { face: 'scared', hips: true }; }
    if (win(t, E.rock, E.botTest)) { hp = [-7.6, 0.5, 1.0]; hy = F / 2; ho = { face: 'scared', hold: t < E.rock + 1.2 }; }
    if (win(t, E.botTest, E.snail)) { hp = [-8.6, 0.5, -1.2]; hy = 1.2; ho = { face: 'scared', panic: win(t, E.botTest + 2, E.botTest + 4) }; }
    if (win(t, E.snail, E.storm)) { hp = [-8.4, 0.5, -1.6]; hy = 1.4; ho = { face: 'scared', headYaw: Math.sin(t * 2) * 0.3 }; if (t > E.inspect) { hp = [-8.4 + 11 * seg(t, E.inspect, E.approve - 2) + 1.4, 0.5, -1.0]; ho.walk = moving(SX, t) ? 0.5 : 0; ho.phase = t * 4; } if (t > E.approve) ho = { face: 'normal' }; }
    if (win(t, E.storm, E.rainbow)) { hp = [-9.4, 0.5, -1.4]; hy = 1.6; ho = { face: 'scared', panic: true }; } if (win(t, E.rainbow, E.fish)) { hp = [-9.4, 0.5, -1.4]; hy = 1.0; ho = { face: 'normal', headPitch: -0.3 }; }
    if (win(t, E.fish, E.wind)) { hp = [-9.4, 0.5, -1.4]; hy = 1.6; ho = { face: 'scared', panic: t < E.fish + 5 }; }
    if (win(t, E.wind, E.cross)) { hp = [-2, 0.5, 1.0]; hy = 0; ho = { face: 'scared', flat: 1, flatDir: -1 }; }
    if (t > E.cross) { const k = seg(t, E.cross + 6, E.cross + 12); hp = [lerp(-8.6, 11.2, k), 0.5, lerp(-0.6, 0.4, k)]; hy = F / 2; ho = { walk: k > 0 && k < 1 ? 1 : 0, phase: t * 7, face: 'scared' }; }
    if (t > E.picnic) { const k = seg(t, E.picnic, E.picnic + 3); hp = [lerp(11.2, 1.8, k), 0.5, 0]; hy = k < 1 ? -F / 2 : 0.3; ho = { walk: k < 1 ? 1 : 0, phase: t * 9, face: 'scared', sit: seg(t, E.picnic + 3, E.picnic + 3.6), headYaw: Math.sin(t * 1.4) * 0.5 }; }
    if (t > E.relax) { const k = seg(t, E.relax, E.relax + 4); hp = [lerp(1.8, 12.6, k), 0.5, lerp(0, 3.2, k)]; hy = k < 1 ? F / 2 : -0.6; ho = { walk: k < 1 ? 1 : 0, phase: t * 8, face: k < 1 ? 'normal' : 'smug', sit: seg(t, E.relax + 4, E.relax + 4.6) }; }
    if (t > E.hug) ho = { face: 'smug', sit: 1, wave: win(t, E.hug, E.hug + 3) };
    if (t > E.pebble + 3) ho = { face: 'scared', panic: t < E.pebble + 9, sit: t < E.pebble + 3.4 ? 1 : 0 }; if (t > E.pebble + 3) { hp = [12.6, 0.5 + (t < E.pebble + 4 ? Math.sin(seg(t, E.pebble + 3, E.pebble + 4) * Math.PI) * 1.4 : 0), 3.2]; }
    pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // Bloop: builder (planks), gets paid, frames the receipt
    let bp = [-7.6, 0.5, 1.4], by = F / 2, bo = {}; if (t < E.gorge + 6) { const k = seg(t, E.gorge, E.gorge + 6); bp = [lerp(-26, -7.6, k), 0.5, lerp(-4, 1.4, k)]; bo = { walk: 1, phase: t * 8 }; }
    if (win(t, E.build, E.buildEnd)) { bp = [-7 + nP, 0.5, 1.0]; bo = { hop: true }; } if (win(t, E.buildEnd, E.cross)) { bp = [7.8, 0.5, 1.6]; by = -1.6; bo = { hop: win(t, E.approve, E.approve + 4) }; }
    if (win(t, E.storm, E.rainbow)) bo = { facepalm: true };
    if (t > E.cross) { bp = [9.4, 0.5, 2.4]; by = -2; bo = { hop: win(t, E.cross + 8, E.cross + 12) }; } if (t > E.picnic) { bp = [15, 0.5, 2.0]; by = -0.9; bo = { hop: win(t, E.picnic + 6, E.picnic + 9) }; } if (t > E.relax + 4) { bp = [15, 0.5, 1.6]; by = -1.4; bo = {}; }
    if (t > E.pebble + 4) bo = { facepalm: true };
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2; bBrick.visible = win(t, E.build, E.buildEnd);
    receiptF.visible = t > E.picnic + 4;
    // Leggy: carries planks, wants to be first across, crosses first
    let lp = [-11, 0.5, 2.4], ly = 1.6, ls = 0.3; if (t < E.gorge + 6) { const k = seg(t, E.gorge, E.gorge + 6); lp = [lerp(-28, -11, k), 0.5, lerp(-2, 2.4, k)]; ls = 2; }
    if (win(t, E.build, E.buildEnd)) { const k = Math.abs(((t - E.build) / 4) % 2 - 1); lp = [lerp(-16, -9, k), 0.5, 3.0]; ly = Math.floor((t - E.build) / 4) % 2 ? -F / 2 : F / 2; ls = 2; }
    if (t > E.cross) { const k = seg(t, E.cross, E.cross + 5); lp = [lerp(-10, 10.4, k), 0.5, 0]; ly = F / 2; ls = k < 1 ? 1.6 : 0.3; } if (t > E.picnic) { lp = [13, 0.5, -0.6]; ly = 0.3; } if (t > E.hug) { lp = [12.4, 0.5, 0.6]; ly = 0.6; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); if (t > E.cross + 5 && t < E.cross + 9) L6.root.position.y += Math.abs(Math.sin(t * 8)) * 0.5;
    board.visible = win(t, E.build, E.buildEnd) && L6.root.rotation.y > 0; if (board.visible) { parentTo(board, g); board.position.set(lp[0], 3.2, lp[2]); }
    // bot: test drive
    let op = [-11.6, 0.5, -3.4], oy = 1.0, oo = { off: true }; if (win(t, E.botTest, E.snail + 12)) { const k = seg(t, E.botTest, E.botTest + 8); op = [lerp(-9, 9, k), 0.5, 0]; oy = F / 2; oo.roll = k < 1 ? 1 : 0; } if (t > E.snail + 12) { op = [9.6, 0.5, -2.8]; oy = -1.2; } if (t > E.picnic) { op = [17, 0.5, -1]; oy = -1.8; }
    poseBot(bot, t, op, oy, oo); parentTo(bot.root, g); bot.root.visible = t > E.gorge + 2;
    // muffin + puff
    poseMuffin(muffin, t, t > E.picnic ? [12.2, 0.6, 2.2] : t > E.cross ? [9, 0.5, -1.6] : [-10.4, 0.5, -3.2], t > E.picnic ? 0.4 : 1.2, { hop: win(t, E.approve, E.approve + 3) || win(t, E.cross + 8, E.cross + 12) }); parentTo(muffin.root, g); muffin.root.visible = t > E.gorge + 2;
    poseMag(puff, t, t > E.picnic ? [14, 0.6, 3.6] : [-10, 0.6, 0.6], t > E.picnic ? -0.6 : 1.2); parentTo(puff.root, g); puff.root.visible = t > E.gorge + 2;
    // rock test
    if (win(t, E.rock, E.botTest)) { parentTo(pebble.parent, g); pebble.visible = true; const k = seg(t, E.rock + 1.2, E.rock + 2.6); pebble.scale.setScalar(2.4); pebble.parent.position.set(lerp(-7, -2, k), 0.6 + Math.sin(k * Math.PI) * 3 + (k >= 1 ? Math.abs(Math.sin(t * 6)) * 0.2 * (1 - seg(t, E.rock + 2.6, E.rock + 4)) : 0), 1.0); }
    else if (t > E.pebble - 4) { pebble.visible = true; pebble.scale.setScalar(1); const k = seg(t, E.pebble, E.pebble + 3.2); pebble.parent.position.set(0.4 + Math.sin(t * 20) * 0.03 * (1 - k > 0.99 ? 1 : 0), 0.62 - 12.6 * k * k, 1.62); } else pebble.visible = false;
    // the inspector
    snail.root.visible = t > E.snail; const sx = lerpK(SX, t); poseSnail(snail, t, [sx, 0.5, t > E.inspect && t < E.storm ? 0.3 : 0], t > E.approve ? 0.4 : F / 2, { slide: moving(SX, t), peer: win(t, E.inspect, E.approve - 2) && Math.floor(t / 3) % 2 === 0, write: win(t, E.approve - 2, E.approve + 2) });
    if (t > E.storm) snail.root.rotation.y = t > E.cross + 6 ? -F / 2 : 0.4;
    hammer.visible = win(t, E.inspect, E.approve - 2); hammer.position.set(sx + 1.2, 1.0 + Math.abs(Math.sin(t * 4)) * 0.5, 0.6); hammer.rotation.set(-Math.abs(Math.sin(t * 4)) * 1.2 + 0.4, F / 2, 0);
    // Glub the big fish jumps over the bridge (and goes away)
    glub.root.visible = win(t, E.fish, E.fish + 3.6); { const k = seg(t, E.fish + 0.3, E.fish + 3.3); glub.root.position.set(0, -12 + Math.sin(k * Math.PI) * 17, lerp(7, -7, k)); glub.root.rotation.set(lerp(-0.9, 0.9, k), F, 0); glub.root.scale.setScalar(1.2); glub.tail.rotation.y = Math.sin(t * 14) * 0.5; }
    const cam = camKeys(t, C);
    return { cam, hud: true };
  }
  return { g, update };
})();
