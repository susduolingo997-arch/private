// ================================================================ EPISODE 13: "THE GRAND RACE" — beach stadium start → Ash Canyon (pebbleback herd) → beach photo finish
// --- new creature: Pebblebacks (rolling rock armadillos)
function makePebble(s = 1) {
  const root = new THREE.Group(), body = pivot(root, 0, 0.55 * s, 0); root.scale.setScalar(s);
  const rock = new THREE.MeshLambertMaterial({ color: '#8a7a6a' }), plate = new THREE.MeshLambertMaterial({ color: '#6e6050' });
  box(1.1, 0.9, 1.3, 0, 0, 0, 0, body, rock); for (let i = 0; i < 3; i++) box(1.16, 0.16, 0.24, 0, 0, 0.3, -0.45 + i * 0.45, body, plate);
  const hd = pivot(body, 0, -0.05, 0.7); box(0.5, 0.42, 0.36, '#a8988a', 0, 0, 0.12, hd); for (const x of [-0.13, 0.13]) box(0.08, 0.1, 0.03, '#111', x, 0.08, 0.31, hd);
  for (const [x, z] of [[-0.4, 0.4], [0.4, 0.4], [-0.4, -0.4], [0.4, -0.4]]) box(0.2, 0.3, 0.2, '#6e6050', x, -0.5, z, body);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hd };
}
function posePebble(p, t, pos, yaw, roll) { p.root.position.set(...pos); p.root.rotation.set(0, yaw, 0); p.body.rotation.x = roll ? t * 9 : Math.sin(t * 5) * 0.05; p.hd.visible = !roll; }
const herd = Array.from({ length: 16 }, (_, i) => makePebble(0.9 + (i % 3) * 0.15)), baby = makePebble(0.55);
// --- Bloop's kart
const kart = new THREE.Group(); box(1.6, 0.3, 2.4, 0, 0, 0.55, 0, kart, MAT.plank); box(0.12, 0.5, 0.12, '#555', 0, 0.9, 0.6, kart); box(0.6, 0.08, 0.08, '#333', 0, 1.15, 0.6, kart);
const kWheels = [[-0.85, 0.85], [0.85, 0.85], [-0.85, -0.85], [0.85, -0.85]].map(([x, z]) => { const w = pivot(kart, x, 0.35, z); box(0.25, 0.7, 0.7, '#222', 0, 0, 0, w); return w; });
const kMotor = new THREE.Group(); kMotor.position.set(0, 0.8, -1.4); kart.add(kMotor); box(0.6, 0.5, 0.6, '#ffd400', 0, 0, 0, kMotor); const kBit = pivot(kMotor, 0, 0, -0.4); box(0.12, 0.12, 0.6, '#9aa4bd', 0, 0, -0.3, kBit);
const looseWheel = new THREE.Group(); box(0.25, 0.7, 0.7, '#222', 0, 0, 0, looseWheel);
const goldCup = new THREE.Group(); box(0.5, 0.12, 0.5, '#7a4a2a', 0, 0, 0, goldCup); box(0.2, 0.4, 0.2, 0, 0, 0.25, 0, goldCup, goldM); box(0.6, 0.5, 0.6, 0, 0, 0.65, 0, goldCup, goldM);
// --- race model: x along the track per racer, per stage
const RX = {
  leggy: { s: [[E.go, -4], [80, 57]], c: [[E.canyon, -60], [E.boost, -12], [E.crash, 14], [E.crash + 1.4, 16], [113.6, 16], [E.pebbles, 22], [E.conveyor, 22], [E.exit, 62]], f: [[E.final, -60], [E.finish, 1.4]] },
  prestin: { s: [[E.go, -4], [80, 62]], c: [[E.canyon, -58], [E.pebbles, 25], [E.barge, 25], [E.barge + 1.8, 16], [E.conveyor, 16], [E.final, 48]], f: [[E.final, -61], [E.finish, 1.0]] },
  bloop: { s: [[67, -6], [80, 40]], c: [[E.canyon, -62], [E.wheel, -34], [108, -34], [128, 19], [E.motor, 30], [E.final, 58]], f: [[E.final, -62], [E.finish, 1.1]] },
  bot: { s: [[E.go, -4], [80, 58]], c: [[E.canyon, -61], [E.pebbles, 24], [134.2, 24], [136, 12], [E.conveyor, 12], [E.final, 40]], f: [[E.final, -64], [E.finish, 0.6]] },
};
const LANE = { leggy: 0, prestin: -3, bloop: 3, bot: 5.6 };
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
const raceX = (who, t) => t < E.canyon ? lerpK(RX[who].s, t) : t < E.final ? lerpK(RX[who].c, t) : lerpK(RX[who].f, t);
const progress = (who, t) => (t < E.canyon ? 0 : t < E.final ? 140 : 280) + raceX(who, t) + 70;
function placeRacers(t, g, stage) {
  const yw = Math.PI / 2, moving = w => (t > E.go && t < E.finish && !(stage === 'c' && w === 'leggy' && win(t, E.crash, E.pebbles)));
  // leggy + jockey + mascots
  const lx = raceX('leggy', t); let lp = [lx, 0.5, LANE.leggy], ly = yw, ls = moving('leggy') ? 3.4 : 0.3;
  if (t < E.go) lp = [-4, 0.5, 0];
  if (stage === 'c' && win(t, E.boost, E.crash)) { lp[1] += Math.sin(seg(t, E.boost, E.crash) * Math.PI) * 4; ls = 4; }
  if (stage === 'c' && win(t, E.crash, 113.6)) { lp = [16, 1.6, 3.4]; }
  if (stage === 'c' && win(t, E.pebbles, E.conveyor)) ls = 0.3;
  if (stage === 'c' && win(t, E.baby, E.conveyor)) { lp = [21, 0.5, 1.2]; ly = 0; }
  if (stage === 'c' && win(t, E.conveyor, E.exit)) lp[1] = 1.6;
  if (stage === 'f' && t > E.finish) { lp = [1.4, 0.5, 0]; ls = 0.3; if (t > E.podium) { lp = [-2.4, 0.5, -3]; ly = 0.4; } if (t > 254.6) { const a = (t - 254.6) * 0.5; lp = [Math.cos(a) * 8, 0.5, -1 + Math.sin(a) * 4]; ly = Math.atan2(-Math.sin(a) * 8, Math.cos(a) * 4); ls = 2; } }
  poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.visible = true; L6.root.rotation.set(0, ly, stage === 'c' && win(t, E.crash, 113.6) ? Math.PI : 0); L6.body.rotation.z = 0;
  const o = { t, p: rideOn(lp, ly, -0.3, 1.6), yaw: ly, sit: 1, face: 'smug' };
  if (t > E.go && t < E.finish) { o.lean = 0.35; o.face = 'scared'; if (win(t, E.conveyor, E.exit) || t < 80) o.face = 'smug'; }
  if (stage === 'c' && win(t, E.crash, 113.6)) { o.p = [17.5, 0.5, 5]; o.sit = 0; o.flat = 1; o.flatDir = -1; o.face = 'soot'; }
  if (stage === 'c' && win(t, E.baby, E.conveyor)) { o.p = [19.4, 0.5, 2.6]; o.sit = 0; o.yaw = 0.6; o.face = 'smug'; }
  if (stage === 'f' && t > E.finish) { o.p = [3.2, 0.5, 2.4]; o.sit = 0; o.flat = t < E.photo ? 1 : 0; o.flatDir = 1; o.face = t < E.photoEnd ? 'scared' : 'smug'; o.yaw = 0.3; if (t > E.podium) { o.p = [-0.6, 0.5, 1.6]; o.yaw = 0.2; } if (t > 278.4) o.hips = true; }
  pose(hero, o); parentTo(hero.root, g); hero.root.visible = true; if (!(stage === 'f' && t > E.finish) && !(stage === 'c' && (win(t, E.crash, 113.6) || win(t, E.baby, E.conveyor)))) hero.root.rotation.z = L6.root.rotation.z;
  const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
  parentTo(muffin.root, g); muffin.root.visible = true; let mp = head, mo = { hop: t > E.photoEnd };
  if (stage === 'f' && t > E.podium && t < 254.6) { mp = [0.6, 2.0, -3.4]; mo = { hop: true }; }
  poseMuffin(muffin, t, mp, ly, mo);
  parentTo(puff.root, g); puff.root.visible = true; const pp = stage === 'c' && win(t, E.boost - 0.6, E.crash) ? rideOn(lp, ly, -2.2, 1.2) : rideOn(lp, ly, -1.2, 1.7); poseMag(puff, t, pp, ly, { big: stage === 'c' && win(t, E.boost, E.crash) });
  // prestin on the sled
  const px = raceX('prestin', t); let sp = [px, 0.9, LANE.prestin]; if (t < E.go) sp = [-4, 0.9, LANE.prestin];
  let bounce = stage === 'c' && win(t, E.barge, E.barge + 1.8) ? Math.sin(seg(t, E.barge, E.barge + 1.8) * Math.PI) * 3 : 0;
  if (stage === 'f' && t > E.finish) sp = [5.5, 0.9, -2.6];
  parentTo(sled, g); sled.visible = true; sled.position.set(sp[0], sp[1] + bounce + Math.sin(t * 3) * 0.08, sp[2]); sled.rotation.set(0, yw - Math.PI / 2 + Math.PI / 2, bounce ? seg(t, E.barge, E.barge + 1.8) * 6 : 0);
  poseRival(rival, t, [sp[0], sp[1] + 0.35 + bounce, sp[2]], yw, t > E.go && t < E.finish ? { hold: true } : (t < E.go ? { flip: win(t, 40.2, 45) } : { hips: true })); parentTo(rival.root, g); rival.root.visible = true;
  // bloop in the kart
  const bx = raceX('bloop', t); let kp = [bx, 0, LANE.bloop]; if (t < E.go) kp = [-4, 0, LANE.bloop]; if (stage === 'f' && t > E.finish) kp = [1.8, 0, 4.2];
  parentTo(kart, g); kart.visible = t > E.kart + 6; kart.position.set(...kp); kart.rotation.set(0, yw, stage === 'f' && win(t, E.finish, E.photo) ? 0.4 : 0); const roll = t > E.go && t < E.finish ? t * 12 : 0; kWheels.forEach((w, i) => { w.rotation.x = roll; w.visible = !(i === 0 && stage === 'c' && win(t, E.wheel, 108)); });
  kMotor.visible = (stage === 'c' && t > E.motor) || stage === 'f'; kBit.rotation.z = t * 40;
  let bp = [kp[0], 0.65, kp[2]], by = yw, bo = {}; if (t < E.kartEnd && t > E.kart) { const a = (t - E.kart) * 1.2; bp = [-4 + Math.cos(a) * 1.8, 0.5, LANE.bloop + Math.sin(a) * 1.8]; by = a; bo = { walk: 1, phase: t * 14 }; }
  if (stage === 'c' && win(t, E.wheel + 1, 108)) { bp = [kp[0] - 0.4, 0.5, kp[2] + 1.6]; by = Math.PI; bo = {}; bloop6.B.aR.rotation.set(-2, 0, 0); }
  if (stage === 'f' && t > E.podium) { bp = [2.4, 1.0, -3.4]; by = 0.2; bo = { hop: t > E.podium + 1 && t < 240 }; }
  poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2;
  if (stage === 'c' && win(t, E.wheel + 1, 108)) bloop6.B.aR.rotation.set(-2 + Math.sin(t * 14) * 0.8, 0, 0);
  parentTo(looseWheel, g); looseWheel.visible = stage === 'c' && win(t, E.wheel, E.wheel + 4); if (looseWheel.visible) { const k = seg(t, E.wheel, E.wheel + 4); looseWheel.position.set(lerp(-34, 10, k), 0.85, LANE.bloop - k * 2); looseWheel.rotation.set(t * 12, Math.PI / 2, 0); }
  // goose on Bonk-bot
  const gx = raceX('bot', t); let gp = [gx, 0.5, LANE.bot], gyaw = yw, gop = { roll: t > E.go ? 1 : 0 };
  if (t < E.go) gp = [-4, 0.5, LANE.bot]; if (stage === 'c' && win(t, 134.2, E.conveyor)) gop = { spin: (t - 134.2) * 8, roll: 1 }; if (stage === 'c' && t > E.exit) gop = { spin: Math.sin(t * 3) * 2, roll: 1 };
  if (stage === 'f' && t > E.finish) { gp = [-3.6, 0.5, 4.6]; gop = { roll: 0, tilt: 0.3 }; }
  parentTo(bot.root, g); bot.root.visible = true; poseBot(bot, t, gp, gyaw, { ...gop, off: true });
  parentTo(goose.root, g); goose.root.visible = true; goose.root.position.set(gp[0], gp[1] + 2.7, gp[2]); goose.root.rotation.y = gyaw + (gop.spin || 0); goose.neck.rotation.x = Math.sin(t * 6) * 0.25;
  if (stage === 'f' && t > E.podium) { goose.root.position.set(-4.6, 0.5, 2.6); goose.root.rotation.y = 0.8; goose.neck.rotation.x = Math.sin(t * 14) * 0.4; }
  return { lp, ly };
}
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false; rival.wig.visible = false; rival.shine.visible = true; }

// ---------------------------------------------------------------- set A: the beach stadium (start + finish)
const stadium = (() => {
  const g = mk('stadium'), st = new VSet(g), r = rng(1301);
  for (let x = -70; x <= 70; x++) for (let z = -30; z <= 8; z++) st.add(x, 0, z, Math.abs(z) <= 7 ? 'path' : (z > 7 ? 'sand' : 'turf'));
  for (let x = -24; x <= 24; x++) for (let k = 0; k < 3; k++) st.add(x, 1 + k, -11 - k, 'castle');
  const trees = []; for (let i = 0; i < 60; i++) { const x = Math.round((r() - .5) * 130), z = Math.round(-30 + r() * 14); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  st.build(); seaSet(g);
  const arch = new THREE.Group(); arch.position.set(0, 0.5, 0); g.add(arch); const archBan = new THREE.Mesh(new THREE.BoxGeometry(15, 1.4, 0.2), new THREE.MeshBasicMaterial({ map: bannerTex('GRAND RACE') })); archBan.position.set(0, 6, 0); archBan.rotation.y = Math.PI / 2; arch.add(archBan);
  const posts = [-7.2, 7.2].map(z => box(0.6, 6.4, 0.6, '#8a5a2b', 0, 3.2, z, arch));
  const lineM = box(0.6, 0.04, 14, 0, 0.5, 0.03, 0, g, MAT.buzz); const startM = box(0.6, 0.04, 14, 0, -5, 0.53, 0, g, MAT.buzz);
  const flag = new THREE.Group(); box(0.08, 2.4, 0.08, '#dddddd', 0, 1.2, 0, flag); box(0.9, 0.6, 0.04, 0, 0.45, 2.2, 0, flag, MAT.buzz); g.add(flag);
  const podium = new THREE.Group(); podium.position.set(0, 0.5, -3.4); g.add(podium); box(1.2, 1.5, 1.2, 0, 0.6, 0.75, 0, podium, goldM); box(1.2, 1.0, 1.2, '#c0c0c8', -3, 0.5, 0, podium); box(1.2, 0.6, 1.2, '#c98f4c', 2.4, 0.3, 0, podium);
  for (let k = 0; k < 6; k++) burst(E.go + k * 0.3, [-6, 0.6, (k - 2.5) * 2], { n: 20, colors: ['#e8d28a', '#c9a46a'], speed: 3, size: 0.25, life: 1, grav: 6, up: 2 });
  burst(E.arch + 0.4, [0, 2, 0], { n: 220, colors: ['#8a5a2b', '#e6b06a', '#1b2a6a', '#ffd23f', '#ffffff'], speed: 9, size: 0.3, life: 1.8, grav: 9, up: 5 });
  for (let k = 0; k < 10; k++) burst(E.podium + 0.4 + k * 0.5, [Math.sin(k) * 3, 5, -3 + Math.cos(k) * 2], { n: 40, colors: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b'], speed: 5, size: 0.15, life: 2, grav: 4, up: 3 });
  const fans = Array.from({ length: 6 }, (_, i) => makePebble(0.8)); fans.forEach(f => g.add(f.root));
  const C1 = [[0, 30, 14, 26, -4, 1, -2, 55], [6.1, 24, 12, 22, -4, 1, -2, 55], [6.2, 3, 2.4, -5.6, 1.6, 1.6, -7.6, 44], [10.5, 2.6, 2.4, -5.2, 1.6, 1.6, -7.6, 44],
    [10.6, 0, 2.4, -7, -4, 1.8, -3, 48], [16.9, 0.4, 2.4, -7.6, -4, 1.8, 3, 48], [17.0, 0, 2.4, 7.4, -4, 0.8, 3, 46], [22.7, -0.6, 2.4, 7.0, -4, 0.8, 3, 46],
    [22.8, 0, 3.2, 3.6, -4, 2.4, 0, 46], [28.9, -0.6, 3.2, 3.2, -4, 2.4, 0, 46], [29.0, -1.4, 3.6, 1.4, -4, 3.2, 0, 40], [34.7, -1.8, 3.6, 1.2, -4, 3.2, 0, 38],
    [34.8, 0.4, 2, 7.8, -4, 0.8, 3, 46], [40.1, 0, 2, 8.2, -4, 0.8, 3, 46], [40.2, 0, 2.2, -6.6, -4, 1.8, -3, 46], [45.5, -0.4, 2.2, -7, -4, 1.8, -3, 46],
    [45.6, 0, 3, 9, -4, 2, 5.6, 44], [50.9, -0.6, 3, 9.4, -4, 2.6, 5.6, 42], [51.0, 22, 8, 18, -4, 1, 0, 55], [59.5, 18, 7, 16, -4, 1, 0, 55],
    [59.6, 4, 1.2, 0, -4, 1.6, 0, 52], [63.5, 3.4, 1.2, 0, -4, 1.6, 0, 52]];
  const C2 = [[E.final, -40, 3, 14, -60, 1, 0, 55], [195.1, -30, 3, 14, -40, 1, 0, 55], [E.finish, 10, 3, 10, 0, 3, 0, 56], [E.photo, 9, 3, 10, 0, 1, 0, 56],
    [E.photoEnd, 4, 2.4, 6, 0.6, 2.4, -3.4, 46], [229.1, 3.6, 2.4, 5.4, 0.6, 2.4, -3.4, 44], [E.podium, 0, 4, 9, 0, 1.6, -3, 52], [234.5, 1, 4, 9.4, 0, 1.6, -3, 52],
    [234.6, -6.6, 2.4, 6.6, -4, 1.8, 3.6, 46], [239.9, -7, 2.4, 6.4, -4, 1.8, 3.6, 46], [240.0, -4.6, 2.4, 1.2, -2.4, 1.8, -3, 44], [244.1, -4.8, 2.4, 0.8, -2.4, 1.8, -3, 44],
    [E.fans, 10, 4, 10, 6, 1, -6, 52], [254.5, 12, 4, 11, 6, 1, -6, 52], [254.6, 0, 6, 14, 0, 1, -1, 52], [264.7, 2, 6, 14, 0, 1, -1, 52],
    [264.8, -0.4, 2.2, 5.4, -0.6, 2.1, 1.6, 44], [273.7, -0.2, 2.2, 5.0, -0.6, 2.1, 1.6, 42], [273.8, -2.2, 2.6, 8.6, -2.2, 1.6, 1.6, 48], [E.logo, -2.2, 2.6, 8.2, -2.2, 1.6, 1.6, 48]];
  function update(t) {
    hideMisc(); const stage = t < E.canyon ? 's' : 'f'; const R = placeRacers(t, g, stage);
    const fall = stage === 'f' ? seg(t, E.arch, E.arch + 1.4) : 0; arch.rotation.x = fall * fall * 1.5; lineM.visible = true; startM.visible = stage === 's';
    podium.visible = stage === 'f' && t > E.podium - 1; parentTo(goldCup, g); goldCup.visible = stage === 'f' && t > E.podium; goldCup.position.set(0.9, 2.1, -3.2);
    parentTo(judge.root, g); judge.root.visible = true; poseSeal(judge, t, stage === 's' ? [1.6, 0.5, -7.6] : [6.2, 0.5, -5.2], stage === 's' ? -0.6 : -1.0, { clap: win(t, E.announce, E.announce + 3) || win(t, E.photoEnd - 6, E.photoEnd), seed: 1 });
    flag.position.set(stage === 's' ? 2.2 : 6.6, 0.5, stage === 's' ? -7.2 : -4.8); flag.rotation.z = win(t, E.go - 0.4, E.go + 1) || win(t, E.finish - 1, E.finish + 2) ? Math.sin(t * 10) * 0.6 : 0;
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = true; poseSeal(s, t, [-8 + i * 7, 3.5 - (i % 2), -12.5 + (i % 2)], 0, { hop: true, clap: true, seed: i * 3 }); });
    fans.forEach((f, i) => { f.root.visible = stage === 'f' && t > E.fans; posePebble(f, t, [6 + (i % 3) * 1.6, 0.5, -6 - Math.floor(i / 3) * 1.6], -0.6, false); f.root.position.y += Math.abs(Math.sin(t * 6 + i)) * 0.3; });
    herd.forEach(h => h.root.visible = false); baby.root.visible = false;
    let cam = camKeys(t, stage === 's' ? C1 : C2);
    if (stage === 's' && t > E.go) { const x = R.lp[0]; cam = t < 72 ? { p: [x + 9, 2, 9], l: [x, 1.4, 0], fov: 55 } : { p: [x - 8, 3, -9], l: [x + 4, 1.4, 0], fov: 55 }; }
    if (stage === 'f' && t < E.finish) { const x = R.lp[0]; cam = t < 200.8 ? { p: [x + 10, 1.4, 11], l: [x - 2, 1.4, 0], fov: 56 } : { p: [6, 1.2, 0.5], l: [x, 1.6, 0], fov: 50 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Ash Canyon (hazy orange)
const canyon = (() => {
  const g = mk('canyon'), st = new VSet(g);
  for (let x = -75; x <= 75; x++) for (let z = -16; z <= 16; z++) { const az = Math.abs(z); if (az <= 7) { st.add(x, 0, z, hash2(x, z, 7) < 0.015 && az > 2 ? 'lava' : 'ash'); continue; }
    const h = Math.round((az - 7) * 1.6 + vnoise(x * 0.15, z * 0.2, 4) * 3); for (let y = 0; y <= h; y++) st.add(x, y, z, y === h ? 'ash' : 'basalt'); }
  for (let x = 12; x <= 18; x++) for (let z = 3; z <= 7; z++) st.add(x, 1 + (x > 14 && x < 17 ? 1 : 0), z, 'ash');
  st.build();
  smoke(E.canyon, E.final, 1.4, t => [Math.sin(t) * 40, 1, (t * 7) % 12 - 6], { n: 3, size: 0.8, life: 3, up: 0.6, grav: -0.3, colors: ['#c8a088', '#9a8478'] });
  for (let t = E.boost; t < E.crash; t += 0.08) burst(t, [lerpK(RX.leggy.c, t) - 2.4, 1.6 + Math.sin(seg(t, E.boost, E.crash) * Math.PI) * 4, 0], { n: 8, colors: ['#ff6a1a', '#ffe27a', '#ffb43a'], speed: 3, size: 0.25, life: 0.6, grav: -1, up: 0.5 });
  burst(E.crash, [16, 1.5, 4], { n: 160, colors: ['#9a9490', '#c8c2be', '#6e6864'], speed: 7, size: 0.35, life: 1.6, grav: 6, up: 4 });
  burst(E.barge + 0.2, [25, 1.5, -3], { n: 60, colors: ['#ffe066', '#ffffff'], speed: 6, size: 0.2, life: 1, grav: 6, up: 3 });
  smoke(169, E.final, 0.2, t => [lerpK(RX.prestin.c, t), 1.4, LANE.prestin], { n: 3, size: 0.4, life: 1.6, up: 1, grav: -0.6, colors: ['#555555', '#888888'] });
  for (let t = E.conveyor; t < E.exit; t += 0.15) burst(t, [lerpK(RX.leggy.c, t), 0.3, 0], { n: 6, colors: ['#9a9490', '#c8a088'], speed: 3, size: 0.3, life: 1, grav: 4, up: 1.5 });
  const C = [[E.canyon, -70, 10, 12, -55, 1, 0, 55], [85.1, -60, 8, 10, -40, 1, 0, 55], [E.wheel, -22, 3, 11, -34, 0.8, 3, 48], [96.1, -22, 3.2, 10.4, -34, 0.8, 3, 48],
    [96.2, -31, 2.2, 6.6, -34, 1.2, 4, 44], [99.9, -31.4, 2.2, 6.2, -34, 1.2, 4, 44], [E.crash + 1.4, 22, 4, 10, 16, 1.6, 3.4, 48], [113.5, 21, 3.6, 9, 16, 1.6, 3.4, 46],
    [E.pebbles, 12, 6, 14, 30, 1, 0, 55], [128.1, 14, 6, 14, 30, 1, 0, 55], [E.barge, 20, 3, 4, 26, 2, -3, 50], [134.1, 20, 3, 5, 26, 2, -3, 50],
    [134.2, 18, 3, 10, 22, 1, 5, 50], [139.5, 18, 3, 11, 22, 1, 5, 50], [139.6, 16, 2.4, -3, 21, 1.6, 0.6, 46], [143.5, 16.4, 2.4, -3.4, 21, 1.6, 0.6, 46],
    [E.baby, 19, 2.0, 5.4, 21, 0.8, 2, 42], [149.5, 18.6, 2.0, 5.0, 21, 0.8, 2, 40],
    [E.exit, 40, 4, 12, 50, 1, 0, 52], [168.9, 44, 4, 12, 58, 1, 0, 52], [169.0, 50, 3, -9, 44, 1.4, -3, 50], [174.3, 52, 3, -10, 46, 1.4, -3, 50]];
  function update(t) {
    hideMisc(); const R = placeRacers(t, g, 'c'); judge.root.visible = false; seals.forEach(s => s.root.visible = false); goldCup.visible = false;
    herd.forEach((h, i) => { parentTo(h.root, g); h.root.visible = t > E.pebbles - 2; let p, yaw = 0, roll = true;
      if (t < E.conveyor) { const z = -9 + (((t - E.pebbles + 2) * 1.1 + i * 2.6) % 18); p = [28 + (i % 4) * 2.4, 0.5, z]; yaw = 0; roll = t > E.pebbles && !win(t, E.baby, E.conveyor);
        if (win(t, E.barge, E.barge + 2) && i < 4) { p = [lerp(28, 25.5, seg(t, E.barge, E.barge + 0.8)), 0.5, -3 + i * 0.4]; yaw = -Math.PI / 2; } }
      else if (t < E.exit + 0.5) { const lx = lerpK(RX.leggy.c, t); p = [lx - 3 + (i % 8) * 0.9, 0.5, (Math.floor(i / 8) - 0.5) * 1.3]; yaw = Math.PI / 2; roll = true; }
      else { p = [62 + (i % 4) * 2, 0.5, -9 + (i * 3) % 18]; roll = false; }
      posePebble(h, t, p, yaw, roll); });
    parentTo(baby.root, g); baby.root.visible = t > E.pebbles; const bk = seg(t, E.baby + 2, E.baby + 4); posePebble(baby, t, [21, 0.2 + bk * 1.4 + (t > E.baby + 4 ? -1.2 * seg(t, E.baby + 4, E.baby + 5) : 0), 2.2], 0.4, false);
    let cam = camKeys(t, C);
    if (win(t, 85.2, E.wheel) || win(t, E.boost, E.crash + 1.4) || win(t, 113.6, E.pebbles)) { const x = R.lp[0], y = R.lp[1]; cam = { p: [x - 7, y + 3, 7], l: [x + 3, y + 1.4, 0], fov: 55 }; }
    if (win(t, E.conveyor, E.exit)) { const x = R.lp[0]; cam = t < 157 ? { p: [x + 8, 2.4, 8], l: [x, 2, 0], fov: 55 } : { p: [x - 6, 4, -8], l: [x + 4, 2, 0], fov: 55 }; }
    if (win(t, E.motor, E.final)) { const x = raceX('bloop', t); cam = { p: [x - 6, 2.4, 9], l: [x + 2, 1, 3], fov: 54 }; }
    return { cam, hud: true, };
  }
  return { g, update };
})();
