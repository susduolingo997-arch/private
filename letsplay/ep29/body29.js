// ---------------------------------------------------------------- Ep 29 helpers: Barker Bix, the Ferris wheel + the TURBO-SPIN 3000, the bumper car, rings, the giant plush crown, cotton candy, the ticket meter
const R29 = 7, RG29 = 4.2, AX29 = 7.6, WY29 = 0.5 + R29 + 0.18;
const glow29 = (c, i = 0.6) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
// ---- Barker Bix: the carnival's barker. top hat, megaphone, a mustache with a mind of its own
function makeBix29() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const legs = [-0.2, 0.2].map(x => { const p = pivot(body, x, 0.55, 0); box(0.26, 0.55, 0.26, '#2a1d40', 0, -0.27, 0, p); box(0.3, 0.14, 0.42, '#111111', 0, -0.5, 0.06, p); return p; });
  box(0.98, 0.1, 0.68, '#ffd23f', 0, 0.6, 0, body); box(0.95, 0.9, 0.65, '#7a3ac0', 0, 1.05, 0, body);
  for (const x of [-0.3, 0, 0.3]) box(0.1, 0.9, 0.02, '#ffd23f', x, 1.05, 0.33, body);
  box(0.4, 0.16, 0.06, '#e8344e', 0, 1.4, 0.35, body); box(0.12, 0.12, 0.08, '#ff7a8a', 0, 1.4, 0.37, body);
  const arm = sd => { const p = pivot(body, sd * 0.58, 1.38, 0); box(0.22, 0.6, 0.24, '#7a3ac0', 0, -0.27, 0, p); box(0.26, 0.2, 0.26, '#ffffff', 0, -0.64, 0, p); return p; };
  const aL = arm(-1), aR = arm(1);
  const mega = pivot(aR, 0, -0.7, 0.05); for (const [s, y, c] of [[0.16, -0.12, '#ffffff'], [0.26, -0.3, '#e8344e'], [0.36, -0.48, '#ffffff'], [0.48, -0.64, '#e8344e']]) box(s, 0.18, s, c, 0, y, 0, mega);
  const hd = pivot(body, 0, 1.5, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.74, 0.74), faceMat('#8ee6c8', g => { g.fillStyle = '#fff'; g.fillRect(6, 7, 8, 9); g.fillRect(18, 7, 8, 9); g.fillStyle = '#1a1030'; g.fillRect(9, 10, 4, 5); g.fillRect(19, 10, 4, 5); g.fillStyle = '#2a1d40'; g.fillRect(5, 3, 10, 2); g.fillRect(17, 3, 10, 2); g.fillStyle = '#8a1020'; g.fillRect(12, 25, 8, 4); g.fillStyle = '#ff9ec0'; g.fillRect(3, 18, 4, 3); g.fillRect(25, 18, 4, 3); }));
  head.position.y = 0.37; head.castShadow = true; hd.add(head);
  const must = pivot(hd, 0, 0.26, 0.39); box(0.5, 0.12, 0.06, '#ffffff', 0, 0, 0, must); for (const s of [-1, 1]) { box(0.2, 0.1, 0.06, '#ffffff', s * 0.33, 0.05, 0, must); box(0.08, 0.16, 0.06, '#ffffff', s * 0.44, 0.15, 0, must); }
  const hat = pivot(hd, 0, 0.74, 0); box(0.98, 0.07, 0.98, '#1a1020', 0, 0, 0, hat); for (let i = 0; i < 4; i++) box(0.6, 0.17, 0.6, i % 2 ? '#ffffff' : '#e8344e', 0, 0.12 + i * 0.17, 0, hat); box(0.62, 0.05, 0.62, '#1a1020', 0, 0.8, 0, hat);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, aL, aR, hd, must, hat, mega };
}
function poseBix29(b, t, p, yaw, o = {}) {
  b.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.45 : 0), p[2]); b.root.rotation.set(0, yaw, 0);
  const s = o.walk ? Math.sin(o.phase ?? t * 9) * 0.7 : 0; b.legs[0].rotation.x = s; b.legs[1].rotation.x = -s;
  b.body.rotation.set(o.lean || 0, 0, 0); b.body.position.y = Math.abs(Math.sin(t * 2.5)) * 0.03;
  b.aL.rotation.set(-s * 0.6, 0, -0.15); b.aR.rotation.set(s * 0.6, 0, 0.15);
  if (o.mega) b.aR.rotation.set(-1.75 + Math.sin(t * 7) * 0.08, 0, 0.25);
  if (o.wave) b.aL.rotation.set(-2.8, 0, -0.3 + Math.sin(t * 10) * 0.4);
  if (o.cheer) { b.aL.rotation.set(-2.9 + Math.sin(t * 12) * 0.2, 0, -0.3); b.aR.rotation.set(-2.9 + Math.cos(t * 12) * 0.2, 0, 0.3); }
  if (o.give) b.aL.rotation.set(-1.4, 0, 0);
  if (o.pull !== undefined) b.aR.rotation.set(-1.3 + o.pull * 0.9, 0, 0);
  if (o.panic) { b.aL.rotation.set(-2.7 + Math.sin(t * 22) * 0.5, 0, -0.3); b.aR.rotation.set(-2.7 + Math.cos(t * 22) * 0.5, 0, 0.3); }
  b.hd.rotation.set(o.headPitch || 0, (o.headYaw || 0) + Math.sin(t * 1.7) * 0.12, 0);
  b.must.rotation.z = o.talk ? Math.sin(t * 16) * 0.12 : 0; b.must.position.y = 0.26 + (o.talk ? Math.abs(Math.sin(t * 13)) * 0.03 : 0);
  b.hat.position.y = 0.74 + (o.hatPop ? Math.abs(Math.sin(t * 6)) * 0.35 : 0); b.hat.rotation.z = o.hatPop ? Math.sin(t * 6) * 0.2 : 0;
}
const bix29 = makeBix29();
// ---- the Ferris wheel (gondolas hang inside the rim, so it can roll. it was designed for this. probably.)
const bulbOn29 = ['#ff5ca8', '#ffe066', '#5ff7ff', '#7cff6b'].map(c => new THREE.MeshBasicMaterial({ color: c })), bulbOff29 = new THREE.MeshLambertMaterial({ color: '#4a4658' });
const bulbs29 = [];
function bulb29(parent, x, y, z, i, s = 0.2) { const m = box(s, s, s, 0, x, y, z, parent, bulbOn29[i % 4]); m.castShadow = false; m.userData.ci = i % 4; m.userData.k = bulbs29.length; bulbs29.push(m); return m; }
function makeWheel29() {
  const root = new THREE.Group(), spin = pivot(root, 0, 0, 0), N = 20, gond = [], gc = [];
  const rimM = new THREE.MeshLambertMaterial({ color: '#f0eaf8' }), spokeM = new THREE.MeshLambertMaterial({ color: '#c8c0e0' });
  for (let i = 0; i < N; i++) { const a = (i + 0.5) * 2 * PI / N, L = 2 * R29 * Math.sin(PI / N) + 0.12, x = R29 * Math.sin(a), y = -R29 * Math.cos(a);
    for (const z of [-1.0, 1.0]) { const m = box(L, 0.36, 0.3, 0, x, y, z, spin, rimM); m.rotation.z = a; }
    const cb = box(0.24, 0.24, 2.3, '#8a5ac0', x, y, 0, spin); cb.rotation.z = a;
    const b = i * 2 * PI / N; for (const z of [-1.2, 1.2]) bulb29(spin, (R29 + 0.05) * Math.sin(b), -(R29 + 0.05) * Math.cos(b), z, i); }
  for (let k = 0; k < 8; k++) { const b = (k + 0.5) * PI / 4; for (const z of [-1.0, 1.0]) { const s = box(0.16, R29, 0.16, 0, Math.sin(b) * R29 / 2, -Math.cos(b) * R29 / 2, z, spin, spokeM); s.rotation.z = b; } }
  box(1.3, 1.3, 2.7, '#5a3a8a', 0, 0, 0, spin); for (const z of [-1.4, 1.4]) { const s = box(0.9, 0.9, 0.1, 0, 0, 0, z, spin, glow29('#ffd23f', 0.5)); s.rotation.z = PI / 4; }
  const GC = ['#ff5ca8', '#3ab0ff', '#ffd23f', '#7cff6b', '#ff8a2a', '#b07aff'];
  for (let i = 0; i < 6; i++) { const a = i * PI / 3, gp = pivot(spin, RG29 * Math.sin(a), -RG29 * Math.cos(a), 0), c = pivot(gp, 0, 0, 0), col = GC[i];
    box(0.12, 0.5, 0.12, '#c0c0c8', 0, -0.25, 0, c); box(2.0, 0.16, 1.6, col, 0, -0.55, 0, c); box(1.7, 0.08, 1.35, '#ffffff', 0, -0.45, 0, c);
    for (const [x, z] of [[-0.88, -0.68], [0.88, -0.68], [-0.88, 0.68], [0.88, 0.68]]) box(0.08, 1.9, 0.08, '#c0c0c8', x, -1.6, z, c);
    box(1.9, 0.14, 1.5, shade(col, 0.7), 0, -2.6, 0, c);
    for (const z of [-0.72, 0.72]) box(1.9, 0.5, 0.08, col, 0, -2.3, z, c);
    for (const x of [-0.92, 0.92]) box(0.08, 0.5, 1.5, col, x, -2.3, 0, c);
    gond.push(gp); gc.push(c); }
  return { root, spin, gond, gc };
}
const wheel29 = makeWheel29();
function poseWheel29(W) { wheel29.root.position.set(...W.p); wheel29.root.rotation.set(0, W.yaw, 0); wheel29.spin.rotation.z = -W.ang; wheel29.gc.forEach((c, i) => { c.rotation.z = W.ang + Math.sin(W.ang * 3 + i) * (W.swing || 0); }); }
const seatW29 = (W, i) => { const a = i * PI / 3 - W.ang, q = wl(W.p, W.yaw, [RG29 * Math.sin(a), -RG29 * Math.cos(a), 0]); q[1] -= 2.53; return q; };
function seatHero29(t, i, yawW, W, o = {}) { parentTo(hero.root, wheel29.gc[i]); pose(hero, { t, p: [0, -2.53, 0], yaw: yawW - W.yaw, sit: 1, ...o }); }
function seatLeggy29(t, i, yawW, W) { parentTo(L6.root, wheel29.gc[i]); L6.root.scale.setScalar(0.5); poseLurk(L6, t, [0, -2.53, 0], yawW - W.yaw, 0.3); }
const gcam29 = (S, o, l = [0, 1.3, 0], fov = 50) => ({ p: [S[0] + o[0], S[1] + o[1], S[2] + o[2]], l: [S[0] + l[0], S[1] + l[1], S[2] + l[2]], fov });
// ---- bumper car no. 7 (Bloop drives, Bix yells)
function makeCar29() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(1.95, 0.3, 2.6, '#222230', 0, 0.15, 0, body); box(1.7, 0.45, 2.3, '#3a8aff', 0, 0.52, 0, body); box(1.5, 0.75, 0.35, '#3a8aff', 0, 1.05, -0.95, body);
  box(1.2, 0.12, 0.9, '#1a2a5a', 0, 0.8, -0.3, body); box(0.1, 0.55, 0.1, '#888888', 0, 1.0, 0.65, body); const sw = box(0.55, 0.06, 0.55, '#222222', 0, 1.28, 0.6, body); sw.rotation.x = -0.6;
  box(0.08, 2.4, 0.08, '#c0c0c8', 0, 2.0, -1.15, body); const spark = box(0.24, 0.24, 0.24, 0, 0, 3.25, -1.15, body, new THREE.MeshBasicMaterial({ color: '#ffe066' }));
  plane26(0.9, 0.42, txtMat26(['7'], 64, 48, '#ffffff', '#3a8aff', 40), body, 0, 0.55, 1.16);
  root.traverse(o => { if (o.isMesh) o.castShadow = o !== spark; }); return { root, body, spark }; }
const car29 = makeCar29();
function poseCar29(t, p, yaw, drive) { parentTo(car29.root, car29.root.parent || scene); car29.root.visible = true; car29.root.position.set(...p); car29.root.rotation.set(0, yaw, 0);
  car29.body.position.y = drive ? Math.abs(Math.sin(t * 17)) * 0.05 : 0; car29.body.rotation.z = drive ? Math.sin(t * 9) * 0.03 : 0; car29.spark.visible = !drive || Math.floor(t * 12) % 3 > 0; }
function rideCar29(t, p, yaw, bo = {}, xo = { mega: true, talk: true }) { poseBurble(bloop6, t, wl(p, yaw, [0, 0.62, -0.2]), yaw, bo); bloop6.B.aL.rotation.set(-1.1, 0, 0); if (!bo.handOut && !bo.angry) bloop6.B.aR.rotation.set(-1.1, 0, 0);
  bix29.root.visible = true; poseBix29(bix29, t, wl(p, yaw, [0, 0.3, -1.55]), yaw, xo); }
// ---- rings, the plush crown, the cotton candy, tickets, invoices
const rings29 = ['#ff5ca8', '#3ab0ff', '#ffd23f', '#7cff6b', '#ff8a2a', '#b07aff', '#5ff7ff'].map(c => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 6, 14), new THREE.MeshLambertMaterial({ color: c })); m.castShadow = true; return m; });
function makePlush29() { const g = new THREE.Group(), soft = glow29('#ffd84a', 0.18), pink = glow29('#ff7ac0', 0.4);
  for (const [w, d, x, z] of [[1.6, 0.3, 0, 0.65], [1.6, 0.3, 0, -0.65], [0.3, 1.0, 0.65, 0], [0.3, 1.0, -0.65, 0]]) box(w, 0.6, d, 0, x, 0.3, z, g, soft);
  for (const [x, z] of [[-0.65, 0.65], [0.65, 0.65], [-0.65, -0.65], [0.65, -0.65], [0, 0.65], [0, -0.65], [0.65, 0], [-0.65, 0]]) { box(0.3, 0.5, 0.3, 0, x, 0.85, z, g, soft); box(0.22, 0.22, 0.22, 0, x, 1.2, z, g, pink); }
  for (const x of [-0.28, 0.28]) box(0.14, 0.2, 0.04, '#1a1020', x, 0.36, 0.81, g); box(0.34, 0.08, 0.04, '#c0187a', 0, 0.2, 0.81, g);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const plush29 = makePlush29();
const fluff29 = new THREE.Group(); L6.body.add(fluff29); { const m = glow29('#ffb0dc', 0.35); for (const [x, y, z, s] of [[0, 0.6, 0.6, 0.9], [0.4, 0.75, -0.2, 0.8], [-0.4, 0.7, -0.5, 0.85], [0, 0.95, 0, 0.9], [0.5, 0.5, 0.9, 0.6], [-0.5, 0.5, 1.0, 0.65], [0, 0.6, -1.2, 0.75], [0, 1.3, 0.5, 0.6], [0.35, 0.3, 1.6, 0.55], [-0.35, 0.45, 1.7, 0.5]]) box(s, s, s, 0, x, y, z, fluff29, m); }
function tixStrip29() { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { box(0.32, 0.03, 0.17, i % 2 ? '#ffb040' : '#ff8a2a', 0, i * 0.012, -0.36 + i * 0.18, g); box(0.06, 0.035, 0.17, '#ffffff', 0.1, i * 0.012, -0.36 + i * 0.18, g); } return g; }
const tixB29 = tixStrip29(); bix29.aL.add(tixB29); tixB29.position.set(0, -0.78, 0.12); tixB29.rotation.x = 1.4;
const tixL29 = tixStrip29(); bloop6.B.aR.add(tixL29); tixL29.position.set(0, -0.62, 0.2); tixL29.rotation.x = 1.4;
const inv29a = card28(['INVOICE', '1 TURBO'], '#ffffff', '#c0182a'), inv29b = card28(['INVOICE', '500 TICKETS'], '#ffffff', '#c0182a', 28), inv29c = card28(['INVOICE', 'WHEEL x2'], '#ffffff', '#c0182a', 30);
for (const c of [inv29a, inv29b, inv29c]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
function hide29() { hide28(); [wheel29.root, bix29.root, car29.root, plush29, fluff29, tixB29, tixL29, inv29a, inv29b, inv29c, ...rings29].forEach(o => o.visible = false); L6.root.scale.setScalar(1); L6.root.rotation.set(0, 0, 0); crownM.visible = true; }
function bloopReset29(g) { [hero.root, bloop6.B.root, L6.root, bix29.root, wheel29.root, car29.root].forEach(o => parentTo(o, g)); L6.root.visible = bloop6.B.root.visible = wheel29.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; }
// ---- tickets: the meter that drives the plot
const TIXK29 = [[0, 0], [E.cvRing2 + 4, 0], [E.cvRing2 + 4.8, 200], [E.cvHammer + 3, 200], [E.cvHammer + 3.4, 205], [E.cvHammer2 + 3, 205], [E.cvHammer2 + 3.8, 505], [E.cvCandy + 5, 505], [E.cvCandy + 5.8, 205],
  [E.cvCount + 3, 205], [E.cvCount + 3.8, 705], [E.cvGift + 3, 705], [E.cvGift + 3.8, 1205], [E.cvRedeem + 2, 1205], [E.cvRedeem + 2.8, 205]];
const tix29 = t => Math.round(lerpK(TIXK29, t));
function drawTix29(t) { if (t >= E.freeze || t < E.cvRing - 1) return;
  rrect(22, 96, 240, 112, 12); ctx.fillStyle = 'rgba(30,12,40,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5ca8'; ctx.stroke();
  const n = tix29(t), fl = Math.floor(t * 4) % 2, esc = win(t, E.cvPop, E.cvBack) || t >= E.cvPop2;
  outlined('TICKETS', 142, 114, 15, '#ffd27a', '#000', 3); ICON.ticket(58, 146, 15);
  outlined(String(n) + ' / 1000', 152, 144, 26, n >= 1000 ? '#7cff6b' : '#ffffff', '#000', 5);
  rrect(40, 166, 204, 10, 5); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill(); if (n > 0) { rrect(40, 166, Math.max(10, 204 * clamp(n / 1000, 0, 1)), 10, 5); ctx.fillStyle = n >= 1000 ? '#7cff6b' : '#ff5ca8'; ctx.fill(); }
  outlined(esc ? 'FERRIS WHEEL: ESCAPED' : t > E.cvRedeem + 2.8 ? 'GRAND PRIZE: MINE' : 'GRAND PRIZE: 1000', 142, 194, 13, esc ? (fl ? '#ff3a1a' : '#ffe066') : '#fff', '#000', 3); }
function drawTurbo29(T) { const on = win(T, E.cvTurboOn + 1, E.cvPop + 1) || win(T, E.cvSpin2 + 0.5, E.cvPop2 + 1); if (!on) return; const fl = Math.floor(T * 6) % 2;
  ctx.save(); ctx.translate(W - 140, 300); ctx.rotate(-0.08); rrect(-110, -26, 220, 52, 12); ctx.fillStyle = fl ? 'rgba(200,20,40,.85)' : 'rgba(230,160,20,.85)'; ctx.fill(); outlined('TURBO: MAX', 0, 2, 26, '#fff', '#000', 5); ctx.restore(); }
function tree29(st, x, z, h, base = 0) { for (let y = 1; y <= h; y++) st.add(x, base + y, z, 'log'); for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = 0; dy <= 2; dy++) { if (Math.abs(dx) + Math.abs(dz) + dy > 3 || (dx === 0 && dz === 0 && dy === 0)) continue; st.add(x + dx, base + h + dy, z + dz, 'leaf'); } }

// ================================================================ EPISODE 29: "THE CARNIVAL (the ferris wheel escapes)" — the Shardwild Carnival by day (Barker Bix; GRAND PRIZE: 1000 tickets; ring toss; the strength tester; Leggy's cotton candy; Bloop installs the TURBO-SPIN 3000 and gets paid on time?!; the wheel pops off and rolls away) → the hills at sunset (runaway wheel; bumper car chase; hay; the jump; cotton-candy airbag; log-roll brakes; the pond) → the carnival at night (lights; Bloop's gift; the prize; fireworks; Bix leans on the lever. again.)
// ---------------------------------------------------------------- set A+C: the carnival (day, then night)
const carnival = (() => {
  const g = mk('carnival'); const st = new VSet(g);
  for (let x = -40; x <= 124; x++) for (let z = -42; z <= 50; z++) { if (x > 40 && z < 10) continue;
    const pth = (Math.abs(x) <= 2 && z < 24) || (z >= 22 && z <= 38 && Math.abs(x) <= 9) || (z >= 28 && z <= 32 && x > 8);
    st.add(x, 0, z, pth ? 'path' : 'turf'); }
  for (const [x, z, h] of [[-30, -30, 6], [-26, 10, 5], [-34, 30, 7], [28, -28, 6], [30, 0, 5], [24, 44, 6], [-20, 44, 6], [-14, -36, 5], [14, -38, 6], [50, 16, 6], [64, 44, 7], [80, 14, 5], [96, 42, 6], [110, 16, 6], [118, 44, 5]]) tree29(st, x, z, h);
  st.build();
  // gate
  for (const sx of [-4.5, 4.5]) for (let i = 0; i < 7; i++) box(1, 1, 1, i % 2 ? '#ffffff' : '#e8344e', sx, 1 + i, -22, g);
  box(10, 1.0, 1.0, '#7a3ac0', 0, 7.9, -22, g); board28(['SHARDWILD CARNIVAL'], 8, 1.3, g, 0, 9.1, -22, 0, '#ffe066', '#7a1a8a', 640, 112, 62, false);
  // string lights + night lamps
  const PZ = [-16, -6, 4, 14]; let bi = 0;
  for (const z of PZ) for (const x of [-3.6, 3.6]) box(0.2, 5.2, 0.2, '#5a3a22', x, 3.1, z, g);
  const string = (a, b) => { const d = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.max(3, Math.round(d / 0.8)); for (let i = 1; i < n; i++) { const k = i / n; bulb29(g, lerp(a[0], b[0], k), a[1] - Math.sin(k * PI) * 0.6, lerp(a[2], b[2], k), bi++, 0.18); } };
  for (const z of PZ) string([-3.6, 5.6, z], [3.6, 5.6, z]); for (let i = 0; i < 3; i++) for (const x of [-3.6, 3.6]) string([x, 5.6, PZ[i]], [x, 5.6, PZ[i + 1]]);
  const NL = [[0, 4.5, -16, '#ff5ca8'], [0, 4.5, -6, '#ffe066'], [0, 4.5, 4, '#5ff7ff'], [0, 4.5, 14, '#ff8a2a'], [-5, 3, 27, '#b07aff'], [6, 3, 24, '#ff5ca8']].map(([x, y, z, c]) => { const l = new THREE.PointLight(c, 0, 22, 1.3); l.position.set(x, y, z); g.add(l); return l; });
  // ring toss booth
  const PEGZ = [-9.6, -8.8, -8, -7.2, -6.4];
  { const b = pivot(g, -7.5, 0.5, -8);
    box(0.8, 1.1, 4.6, '#ffffff', 2.1, 0.55, 0, b); for (let i = 0; i < 5; i++) box(0.82, 1.1, 0.4, '#e8344e', 2.1, 0.55, -1.9 + i * 0.95, b);
    box(1.2, 0.9, 4.4, '#8a5a2b', -0.9, 0.45, 0, b); box(0.3, 3.4, 5, '#3a8aff', -2.1, 1.7, 0, b);
    for (const z of [-2.4, 2.4]) for (const x of [2.4, -2.0]) box(0.2, 3.6, 0.2, '#ffffff', x, 1.8, z, b);
    for (let i = 0; i < 6; i++) box(4.8, 0.2, 0.9, i % 2 ? '#ffffff' : '#e8344e', 0.2, 3.7, -2.25 + i * 0.9, b);
    for (const z of PEGZ) box(0.12, 0.7, 0.12, '#ffd23f', -0.9, 1.25, z + 8, b); }
  board28(['RING TOSS'], 3.2, 0.8, g, -4.95, 4.75, -8, PI / 2, '#ffe066', '#c0182a', 384, 96, 56, false);
  // the strength tester
  const hs = pivot(g, 7, 0.5, -6);
  box(1.0, 0.35, 1.0, '#e8344e', -1.0, 0.18, 0, hs); box(1.3, 0.12, 1.3, '#5a3a22', -1.0, 0.03, 0, hs); box(0.5, 9.2, 0.4, '#ffffff', 0.2, 4.6, 0, hs);
  for (const [y, c] of [[1.5, '#7cff6b'], [3.5, '#ffe066'], [5.5, '#ff8a2a'], [7.5, '#ff3a4a']]) box(0.06, 1.9, 0.42, c, -0.06, y, 0, hs);
  for (const [y, txt] of [[2.4, 'WEAK'], [4.4, 'OK'], [6.4, 'WOW'], [8.4, 'LEGEND']]) plane26(0.9, 0.36, txtMat26([txt], 160, 64, '#ffffff', '#1a1020', 40), hs, -0.11, y, 0, -PI / 2);
  const bell = box(0.8, 0.55, 0.8, 0, 7.2, 10.0, -6, g, glow29('#ffd23f', 0.4)), puck = box(0.3, 0.3, 0.5, '#ff3a4a', 6.78, 0.9, -6, g);
  board28(['TEST YOUR', 'STRENGTH'], 2.2, 1.0, g, 7.4, 2.6, -8.6, -PI / 2, '#ffe066', '#c0182a', 384, 176, 52);
  // cotton candy cart
  const cc = pivot(g, -6.2, 0.5, 6); box(1.2, 1.0, 1.9, '#ffffff', 0, 0.75, 0, cc); for (let i = 0; i < 4; i++) box(1.22, 1.0, 0.22, '#ff7ac0', 0, 0.75, -0.75 + i * 0.5, cc);
  for (const z of [-0.75, 0.75]) box(0.5, 0.5, 0.2, '#2a2a30', 0.2, 0.25, z * 1.3, cc);
  box(1.1, 0.35, 1.1, '#c8c8d8', 0, 1.42, 0, cc); const spinF = pivot(cc, 0, 1.95, 0); { const m = glow29('#ffb0dc', 0.4); for (const [x, y, z, s] of [[0, 0, 0, 0.7], [0.3, 0.15, 0.2, 0.4], [-0.3, 0.1, -0.2, 0.45], [0.2, 0.3, -0.25, 0.35]]) box(s, s, s, 0, x, y, z, spinF, m); }
  box(0.12, 2.6, 0.12, '#c0c0c8', -0.75, 1.8, 0, cc); board28(['COTTON CANDY', '300 TICKETS'], 2.2, 0.9, g, -7.0, 3.5, 6, PI / 2, '#ffe0f0', '#c0187a', 384, 160, 46, false);
  // the grand prize stand
  box(2.2, 1.2, 2.2, '#7a3ac0', 6, 1.1, 8, g); box(2.4, 0.15, 2.4, '#ffd23f', 6, 1.75, 8, g); box(2.4, 0.15, 2.4, '#ffd23f', 6, 0.55, 8, g);
  board28(['GRAND PRIZE', '1000 TICKETS'], 3.0, 1.2, g, 6, 4.4, 9.8, 0, '#ffe066', '#7a1a8a', 384, 160, 50);
  // the wheel's stand, the boarding step, the TURBO-SPIN 3000
  for (const z of [28.3, 31.7]) { for (const sx of [-1, 1]) { const m = box(0.4, Math.hypot(4.5, AX29 - 0.5), 0.4, '#7a3ac0', sx * 2.25, (AX29 + 0.5) / 2, z, g); m.rotation.z = sx * Math.atan2(4.5, AX29 - 0.5); } box(6, 0.3, 0.3, '#7a3ac0', 0, 3.2, z, g); }
  box(0.4, 0.4, 4.0, '#c0c0c8', 0, AX29, 30, g); box(3, 0.3, 2.2, '#c8c0b8', 0, 0.65, 26.6, g);
  const mo = pivot(g, 5.6, 0.5, 33.6); box(1.4, 1.1, 1.1, '#3a3a48', 0, 0.55, 0, mo); box(1.0, 0.3, 0.8, '#e8344e', 0, 1.25, 0, mo); box(5.0, 0.1, 0.1, '#222222', -2.6, 0.08, -1.4, mo);
  const lev = pivot(mo, 0.5, 1.1, 0.45); box(0.1, 0.9, 0.1, '#c0c0c8', 0, 0.45, 0, lev); box(0.3, 0.3, 0.3, '#ff2a3a', 0, 0.95, 0, lev);
  plane26(1.3, 0.5, txtMat26(['TURBO-SPIN', '3000'], 192, 80, '#ffe066', '#c0182a', 30), mo, 0, 0.6, 0.56);
  // carousel (of tiny blocky hexapedes)
  const crP = pivot(g, -12, 0.5, 26), crs = pivot(crP, 0, 0, 0), horses = [];
  { const disc = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.4, 20), new THREE.MeshLambertMaterial({ color: '#ff9ecb' })); disc.position.y = 0.2; disc.castShadow = true; crs.add(disc);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.6, 1.8, 20), new THREE.MeshLambertMaterial({ color: '#e8344e' })); roof.position.y = 4.6; roof.castShadow = true; crs.add(roof); box(0.6, 3.8, 0.6, '#ffd23f', 0, 2.3, 0, crs);
    for (let i = 0; i < 6; i++) { const a = i * PI / 3, h = pivot(crs, Math.sin(a) * 2.9, 0, Math.cos(a) * 2.9); h.rotation.y = a + PI / 2; box(0.08, 3.4, 0.08, '#ffd23f', 0, 2.1, 0, h); const bd = pivot(h, 0, 1.5, 0);
      box(1.1, 0.5, 0.45, ['#3ab0ff', '#7cff6b', '#b07aff', '#ffe066', '#ff8a2a', '#5ff7ff'][i], 0, 0, 0, bd); box(0.45, 0.45, 0.42, '#2a2238', 0.6, 0.25, 0, bd); box(0.06, 0.1, 0.44, 0, 0.84, 0.32, 0, bd, MAT.shard);
      for (const [x, z] of [[-0.4, -0.15], [-0.4, 0.15], [0.4, -0.15], [0.4, 0.15]]) box(0.08, 0.4, 0.08, '#2a2238', x, -0.4, z, bd); horses.push(bd); } }
  // the big top (it is about to have a bad day)
  const tent = pivot(g, 18, 0.5, 30); for (let i = 0; i < 4; i++) { const s = 8 - i * 2; for (let k = 0; k < s; k++) box(1, 1.3, s, k % 2 ? '#ffffff' : '#e8344e', -s / 2 + 0.5 + k, 0.65 + i * 1.3, 0, tent); }
  box(0.12, 2, 0.12, '#888888', 0, 6.2, 0, tent); box(0.9, 0.5, 0.05, '#ffe066', 0.45, 6.9, 0, tent);
  const ROLL2 = [[E.cvPop2 + 1.2, 1.5], [E.cvChase2, 42], [E.cvBloopInv, 76], [E.freeze, 116]];
  const TENT1 = E.cvPop + 1.2 + (18 - 1.5) / 6.4, TENT2 = lerpK(ROLL2.map(([a, b]) => [b, a]), 18);
  // ---- particles
  burst(E.cvBix + 0.2, [0.8, 1.2, -15], { n: 60, colors: ['#ff5ca8', '#ffe066', '#5ff7ff', '#7cff6b'], speed: 5, size: 0.14, life: 1.4, grav: 4, up: 4 });
  burst(E.cvRing + 5.6, [-8.4, 2.1, -8], { n: 16, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.6, grav: 2, up: 1 });
  burst(E.cvRing2 + 4.2, [-8.2, 2.4, -8], { n: 70, colors: ['#ff5ca8', '#ffe066', '#5ff7ff', '#7cff6b'], speed: 4, size: 0.14, life: 1.5, grav: 3, up: 3 });
  burst(E.cvHammer + 1.1, [6, 1.0, -6], { n: 20, colors: ['#c8c0b8', '#ffffff'], speed: 2, size: 0.12, life: 0.6, grav: 6, up: 1 });
  burst(E.cvHammer2 + 1.5, [6, 1.0, -6], { n: 40, colors: ['#c8c0b8', '#ffffff', '#ffe066'], speed: 4, size: 0.15, life: 0.8, grav: 6, up: 2 });
  burst(E.cvHammer2 + 1.85, [7.2, 10.2, -6], { n: 60, colors: ['#ffe066', '#ffffff', '#ff8a2a'], speed: 6, size: 0.16, life: 1.2, grav: 3, up: 2 });
  burst(E.cvCandy + 4.5, [-4.6, 2.4, 6], { n: 80, colors: ['#ffb0dc', '#ff7ac0', '#ffffff'], speed: 4, size: 0.2, life: 1.3, grav: 1, up: 2 });
  for (const s of [0.8, 1.8, 2.8, 3.6]) burst(E.cvTurbo + s, [5.4, 1.9, 34.1], { n: 24, colors: ['#ffe066', '#ffffff', '#ff8a2a'], speed: 4, size: 0.08, life: 0.6, grav: 6, up: 2 });
  burst(E.cvTurbo + 4, [5.6, 2.2, 33.6], { n: 40, colors: ['#5ff7ff', '#ffffff'], speed: 3, size: 0.12, life: 1, grav: 1, up: 2 });
  burst(E.cvPaid + 0.3, [6.8, 2.3, 34.8], { n: 50, colors: ['#ff8a2a', '#ffb040', '#ffe066'], speed: 3, size: 0.14, life: 1.4, grav: 2, up: 2 });
  for (const [a, b] of [[E.cvTurboOn + 1, E.cvPop + 2], [E.cvSpin2 + 1, E.cvPop2 + 2]]) { smoke(a, b, 0.12, [5.6, 2.0, 33.6], { n: 3, colors: ['#555555', '#777777', '#333333'], speed: 0.8, size: 0.35, life: 1.6, grav: -1.5, up: 1 });
    for (let t = a; t < b - 2; t += 0.3) burst(t, [0, AX29, 30], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 6, size: 0.08, life: 0.4, grav: 6, up: 1 }); }
  for (const t of [E.cvPop, E.cvPop2]) { burst(t, [0, AX29, 30], { n: 90, colors: ['#ffe066', '#ffffff', '#888888', '#ff5ca8'], speed: 7, size: 0.16, life: 1.2, grav: 5, up: 3 }); burst(t + 1.2, [1.5, 0.6, 30], { n: 50, colors: ['#9a9490', '#c8c0b8'], speed: 4, size: 0.3, life: 1, grav: 3, up: 1 }); }
  for (const t of [TENT1, TENT2]) burst(t, [18, 4, 30], { n: 70, colors: ['#e8344e', '#ffffff', '#ffe066'], speed: 6, size: 0.2, life: 1.3, grav: 5, up: 4 });
  burst(E.cvBack + 5.5, [0, AX29 - 3, 30], { n: 60, colors: ['#9a9490', '#c8c0b8', '#ffe066'], speed: 5, size: 0.25, life: 1, grav: 5, up: 2 });
  burst(E.cvBack + 6.8, [-1, 0.8, 22], { n: 30, colors: ['#c8b89a', '#9a8a6a'], speed: 3, size: 0.2, life: 0.8, grav: 6, up: 1 });
  burst(E.cvGift + 3.2, [-0.6, 2.4, 18.9], { n: 40, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.18, life: 1.5, grav: -1, up: 1.5 });
  burst(E.cvRedeem + 2.6, [0, 3.2, 18.5], { n: 80, colors: ['#ffe066', '#ff5ca8', '#5ff7ff', '#ffffff'], speed: 5, size: 0.14, life: 1.5, grav: 3, up: 3 });
  for (let i = 0; i < 13; i++) { const r = hash2(i, 7, 29), x = (r - 0.5) * 30, y = 17 + hash2(i, 3, 29) * 9, z = 50 + hash2(i, 5, 29) * 12, cols = [['#ff5ca8', '#ffffff'], ['#5ff7ff', '#ffffff'], ['#ffe066', '#ff8a2a'], ['#7cff6b', '#ffffff'], ['#b07aff', '#ff9ecb']][i % 5];
    burst(E.cvRide + 3 + i * 1.45, [x, y, z], { n: 90, colors: cols, speed: 8, size: 0.35, life: 1.6, grav: 2, up: 0, drag: 1.2 }); }
  burst(E.cvCarousel, [-12, 1, 26], { n: 60, colors: ['#ff9ecb', '#ffe066', '#ffffff'], speed: 5, size: 0.2, life: 1, grav: 5, up: 3 });
  // ---- the wheel's whole day
  function W29(t) { let x = 0, y = AX29, ang;
    if (t < E.cvBack) {
      ang = lerpK([[0, -2 * PI], [E.cvBoard - 1, 0], [E.cvBoard + 2, 0], [E.cvTurboOn, 0.6], [E.cvTurboOn + 1, 0.9], [E.cvPop, 18.9]], t);
      if (t >= E.cvPop) { const k = t - E.cvPop; ang = 18.9 + k * 3; if (k < 1.2) { x = 1.5 * k / 1.2; y = AX29 + Math.sin(k / 1.2 * PI) * 3 + (WY29 - AX29) * k / 1.2; } else { x = 1.5 + (k - 1.2) * 6.4; y = WY29; ang = 22.5 + (x - 1.5) / R29; } }
    } else if (t < E.cvBack + 5.5) { x = lerp(45, 0, seg(t, E.cvBack, E.cvBack + 5.5)); y = WY29; ang = x / R29; }
    else if (t < E.cvBack + 6.3) { ang = 0; const k = seg(t, E.cvBack + 5.5, E.cvBack + 6.3); y = WY29 + Math.sin(k * PI) * 1.2 + (AX29 - WY29) * k; }
    else if (t < E.cvPop2) ang = lerpK([[E.cvRide, 0], [E.cvTop, PI], [E.cvSpin2, PI], [E.cvSpin2 + 1.5, PI + 2], [E.cvPop2, PI + 22]], t);
    else { const k = t - E.cvPop2; if (k < 1.2) { x = 1.5 * k / 1.2; y = AX29 + Math.sin(k / 1.2 * PI) * 3 + (WY29 - AX29) * k / 1.2; ang = PI + 22 + k * 3; } else { x = lerpK(ROLL2, t); y = WY29; ang = PI + 25.6 + (x - 1.5) / R29; } }
    const fast = win(t, E.cvTurboOn + 1, E.cvPop + 8) || win(t, E.cvSpin2 + 1, E.freeze) || win(t, E.cvBack, E.cvBack + 6.3);
    return { p: [x, y, 30], yaw: 0, ang, swing: fast ? 0.35 : 0.05 }; }
  function props(t, night) {
    const lit = !night || t > E.cvLights; bulbs29.forEach(m => { const on = lit && (!night || t > E.cvLights + (m.userData.k % 12) * 0.12); m.material = on ? bulbOn29[(m.userData.ci + (night && Math.floor(t * 3) % 2 ? 1 : 0)) % 4] : bulbOff29; });
    NL.forEach((l, i) => l.intensity = night && t > E.cvLights + i * 0.2 ? 16 : 0);
    spinF.rotation.y = t * 6; crs.rotation.y = t * 0.6; horses.forEach((h, i) => h.position.y = 1.5 + Math.sin(t * 2 + i * 1.3) * 0.3);
    const sq = Math.max(win(t, TENT1 - 0.6, TENT1 + 1.4) ? Math.sin(seg(t, TENT1 - 0.6, TENT1 + 1.4) * PI) : 0, win(t, TENT2 - 0.8, TENT2 + 1.8) ? Math.sin(seg(t, TENT2 - 0.8, TENT2 + 1.8) * PI) : 0);
    tent.scale.set(1 + sq * 0.25, 1 - sq * 0.8, 1 + sq * 0.25);
    // the bell: launched into orbit by Leggy, back by night (Bix found it)
    const LI = E.cvHammer2 + 1.5; bell.visible = true; bell.position.set(7.2, 10.0, -6); bell.rotation.set(0, 0, 0);
    if (win(t, LI + 0.35, E.cvHills)) { const k = seg(t, LI + 0.35, LI + 3.5); if (k >= 1) bell.visible = false; else { bell.position.set(...arcPath(t, [[LI + 0.35, 7.2, 10, -6, 0], [LI + 3.5, 18, 46, -26, 6]])); bell.rotation.set(t * 9, t * 5, 0); } }
    const HI = E.cvHammer + 1.1; let py = 0.9; if (win(t, HI, HI + 1.6)) py = 0.9 + Math.sin(seg(t, HI, HI + 1.6) * PI) * 2.3; if (win(t, LI, LI + 2.5)) py = t < LI + 0.35 ? lerp(0.9, 9.3, seg(t, LI, LI + 0.35)) : t < LI + 1.6 ? 9.3 : lerp(9.3, 0.9, seg(t, LI + 1.6, LI + 2.5)); puck.position.y = py;
    mo.visible = t > E.cvTurbo + 0.8; lev.rotation.x = (win(t, E.cvTurboOn + 0.6, E.cvHills) || t > E.cvLean + 1.2) ? 0.9 : -0.3; mo.position.x = 5.6 + (win(t, E.cvTurboOn + 1, E.cvPop) || win(t, E.cvSpin2 + 1, E.cvPop2) ? Math.sin(t * 40) * 0.04 : 0);
    // carousel: it leaves too
    if (t > E.cvCarousel) { const k = seg(t, E.cvCarousel, E.cvCarousel + 1.2); crP.position.set(lerpK([[E.cvCarousel + 1.2, -12], [E.cvChase2, 14], [E.cvRoad, 34], [E.freeze, 98]], t), 0.5 + (k < 1 ? Math.sin(k * PI) * 2.5 : Math.abs(Math.sin(t * 5)) * 0.4), lerpK([[E.cvCarousel + 1.2, 26], [E.cvChase2, 21], [E.cvRoad, 22], [E.freeze, 24]], t)); crs.rotation.y = t * 4; }
    else crP.position.set(-12, 0.5, 26);
  }
  // ---- Act 1 cameras
  const C1 = [[0, 6, 10, -8, 0, 2, -30, 55], [8.9, 4, 3.2, -14, 0, 1.6, -22, 55],
    [9, 0.0, 4.4, -26.0, 0.6, 1.9, -15, 45], [14.9, 0.2, 4.0, -24.5, 0.6, 2.0, -15, 42],
    [15, 8.8, 1.1, 3.2, 6, 2.3, 8, 48], [20.9, 8.0, 1.5, 4.6, 5.6, 2.2, 8, 42],
    [21, -3, 3.2, 6, 1.5, 5, 30, 55], [25.9, -2, 3.6, 9.5, 1.5, 6, 30, 58],
    [26, -1.0, 2.4, -2.5, -6.5, 1.6, -9.0, 50], [29.9, -1.4, 2.6, -3.2, -6.5, 1.6, -9.0, 46],
    [30, -8.0, 2.8, -4.6, -3.4, 1.7, -9.8, 52], [33.9, -7.6, 2.6, -5.0, -3.6, 1.9, -10.4, 48],
    [34, -3.5, 3.4, -13.8, -6.2, 1.6, -7.5, 50], [37.9, -3.0, 3.1, -13.2, -6.2, 1.7, -7.8, 46],
    [38, -6.5, 2.4, -3.2, -3.0, 1.6, -8.6, 48], [41.9, -6.0, 2.2, -3.6, -3.0, 1.7, -9, 44],
    [42, 3.2, 2.0, -1.2, 6.6, 2.4, -6, 55], [43.6, 3.4, 2.0, -1.5, 6.6, 2.4, -6, 54], [44.4, 3.5, 2.2, -1.6, 6.8, 3.4, -6, 54], [47.9, 3.0, 2.2, -1.8, 6.4, 2.4, -6, 50],
    [48, 4.6, 0.8, -1.0, 6.8, 4.5, -6, 62], [49.6, 4.8, 0.8, -1.2, 7, 5.5, -6, 62], [50.0, 4.8, 0.9, -1.2, 7.2, 9, -6, 64], [52.5, 5.0, 1.0, -1.4, 9, 16, -10, 64],
    [52.6, 1.0, 2.4, -0.8, 4.4, 1.8, -5.4, 50], [54.9, 0.6, 2.4, -0.4, 4.2, 1.8, -5.4, 46],
    [55, -4.0, 2.4, 0.6, -5.4, 2.0, 6, 50], [59.4, -4.2, 2.3, 1.2, -5.4, 2.0, 6, 46], [59.5, -4.4, 2.0, 1.6, -4.6, 2.1, 6, 50], [63.9, -3.6, 2.2, 0.8, -4.4, 2.0, 6, 52],
    [64, 11, 3.4, 41, 5.6, 1.3, 33.8, 46], [67.9, 10.4, 3.2, 40.2, 5.8, 1.4, 34, 44], [68, 4.0, 2.0, 37.5, 6.6, 1.5, 34.6, 46], [71.9, 4.4, 2.2, 38.2, 6.6, 1.6, 34.6, 42],
    [72, 1.6, 0.9, 18.5, 3.0, 2.2, 24, 46], [74.9, 1.8, 0.9, 19.0, 3.0, 2.2, 24, 42], [75, -0.2, 2.0, 16.5, -0.8, 1.6, 20, 46], [76.9, -0.4, 2.0, 17.0, -0.8, 1.7, 20, 42],
    [77, 0, 4.2, 12.5, 0, 6.5, 30, 62], [82.9, 1.5, 4.8, 13.5, 0, 7, 30, 60],
    [83, 4.0, 1.9, 37.5, 5.9, 1.4, 34.2, 44], [84.9, 4.2, 1.9, 37.2, 5.9, 1.5, 34.2, 40],
    [85, -10, 2.6, 17, 0, 7.2, 30, 56], [87.4, -8.6, 3.0, 18.4, 0, 7.4, 30, 54],
    [90, -2, 5, 9, 2, 7, 30, 58], [91.2, -2, 5, 9, 2, 7, 30, 58],
    [96, 9, 2.4, 13.5, 4.5, 1.2, 18.5, 50], [97.9, 8.6, 2.6, 14.5, 5.5, 1.3, 18.5, 50]];
  const C3 = [[160, -8, 5, 12, 10, 6, 30, 58], [165.9, -6, 5.5, 13, 3, 7, 30, 56],
    [166, 0, 7.5, -16, 0, 4, 20, 58], [171.9, 0, 6, -8, 0, 4, 22, 55],
    [172, -1.4, 2.5, 15.4, 2.5, 1.9, 20, 45], [175.9, -1.2, 2.4, 15.8, 2.3, 1.9, 20, 42],
    [176, 1.6, 2.4, 14.4, 0, 1.9, 18.5, 46], [179.9, 1.4, 2.3, 14.9, 0, 1.9, 18.5, 42],
    [180, 2.0, 2.3, 22.8, -0.6, 1.4, 19, 46], [185.9, 1.6, 2.2, 22.4, -0.6, 1.4, 19, 42],
    [186, 2.6, 2.4, 23.6, -0.6, 1.4, 18.9, 44], [191.9, 2.2, 2.3, 23.0, -0.6, 1.4, 18.9, 42],
    [192, 1.4, 0.9, 15.4, 0.2, 2.4, 18.5, 52], [195, 1.2, 1.0, 15.8, 0.2, 2.6, 18.5, 50], [199.9, 3.5, 3.5, 13.5, 0.5, 2.2, 19, 52],
    [200, -10, 5, 12, 0, 9, 30, 58], [206.9, -8, 7, 14, 0, 10, 30, 56],
    [218, 2, 1.6, 20, 0, 12, 35, 62], [221.9, 1, 1.8, 21, 0, 13, 36, 62],
    [232, 4.0, 1.9, 37.5, 5.9, 1.4, 34.2, 44], [233.9, 4.2, 1.9, 37.2, 5.9, 1.5, 34.2, 40],
    [234, -10, 2.6, 17, 0, 7.2, 30, 56], [237.9, -8.6, 3.0, 18.4, 0, 7.4, 30, 54],
    [241, -2, 5, 9, 2, 7, 30, 58], [242.2, -2, 5, 9, 2, 7, 30, 58]];
  const LEV = [6.1, 1.6, 34.05], BIXL = [6.9, 0.5, 34.6];
  function upd1(t) {
    const W = W29(t); poseWheel29(W); props(t, false);
    plush29.visible = true; parentTo(plush29, g); plush29.position.set(6, 1.83, 8); plush29.rotation.set(0, t * 0.5, 0); plush29.scale.setScalar(1);
    // ---- Barker Bix
    const BK = [[E.cvBix, 0.8, 0.5, -15], [E.cvPrize, 0.8, 0.5, -15], [E.cvPrize + 0.01, 8.0, 0.5, 8.6], [E.cvJob, 8.0, 0.5, 8.6], [E.cvJob + 2, 3.5, 0.5, 14], [E.cvJob + 5, 2.5, 0.5, 23.5], [E.cvTurbo, 2.5, 0.5, 23.5], [E.cvTurbo + 0.01, 7.6, 0.5, 34.4],
      [E.cvOffer - 0.6, 7.6, 0.5, 34.4], [E.cvOffer + 1, 3.0, 0.5, 24], [E.cvBoard, 3.0, 0.5, 24], [E.cvTurboOn - 0.6, ...BIXL]];
    const xA = act(t, BK, [[0, {}], [E.cvBix + 0.6, { mega: true, talk: true, yaw: PI }], [E.cvPrize, { wave: true, talk: true, yaw: faceTo([8, 0, 8.6], [3.8, 0, 6.6]) }], [E.cvJob, { mega: true, talk: true }], [E.cvJob + 1.5, {}],
      [E.cvTurbo, { yaw: faceTo([7.6, 0, 34.4], [5.5, 0, 35.2]) }], [E.cvTurbo + 4.4, { yaw: faceTo([7.6, 0, 34.4], [6.1, 0, 35.4]), talk: true }], [E.cvPaid - 0.6, { give: true, yaw: faceTo([7.6, 0, 34.4], [6.1, 0, 35.4]) }], [E.cvPaid + 0.6, { cheer: true, yaw: faceTo([7.6, 0, 34.4], [6.1, 0, 35.4]) }],
      [E.cvOffer - 0.6, {}], [E.cvOffer + 1, { mega: true, talk: true, yaw: PI }], [E.cvBoard, {}], [E.cvTurboOn - 0.6, { yaw: faceTo(BIXL, LEV), pull: 0 }], [E.cvTurboOn + 0.6, { yaw: faceTo(BIXL, LEV), pull: 1, hatPop: true }],
      [E.cvTurboOn + 2, { cheer: true, yaw: PI + 0.6 }], [E.cvPop, { panic: true, hatPop: true, yaw: PI + 0.6 }]]);
    bix29.root.visible = t >= E.cvBix; const xp = [...xA.p]; if (win(t, E.cvBix, E.cvBix + 0.6)) xp[1] = lerp(-2.2, 0.5, backOut(seg(t, E.cvBix, E.cvBix + 0.6)));
    tixB29.visible = win(t, E.cvPaid - 0.6, E.cvPaid + 0.3);
    // ---- Bloop (got a job! gets paid! on time! in tickets.)
    const bA = act(t, [[0, 2.2, 0.5, -38], [8.5, 2.2, 0.5, -21.5], [E.cvPrize, 2.2, 0.5, -21.5], [E.cvPrize + 0.01, 2.0, 0.5, 3.5], [E.cvJob, 2.0, 0.5, 3.5], [E.cvJob + 2, 1.8, 0.5, 14], [E.cvJob + 5, 1.5, 0.5, 23.0], [E.cvTurbo, 1.5, 0.5, 23.0], [E.cvTurbo + 0.01, 5.5, 0.5, 35.2],
      [E.cvTurbo + 4, 5.5, 0.5, 35.2], [E.cvTurbo + 4.5, 6.1, 0.5, 35.4], [E.cvOffer, 6.1, 0.5, 35.4], [E.cvBoard, 4.8, 0.5, 27]],
      [[0, {}], [E.cvJob, { hop: t < E.cvJob + 1.2 }], [E.cvJob + 1.2, {}], [E.cvTurbo, { yaw: PI }], [E.cvTurbo + 4.5, { handOut: true, yaw: faceTo([6.1, 0, 35.4], [7.6, 0, 34.4]) }], [E.cvPaid - 0.3, { yaw: faceTo([6.1, 0, 35.4], [7.6, 0, 34.4]) }],
       [E.cvPaid + 0.3, { hop: true, handOut: true, yaw: faceTo([6.1, 0, 35.4], [7.6, 0, 34.4]) }], [E.cvOffer, {}], [E.cvBoard + 1, { yaw: PI }], [E.cvPop, { angry: true, yaw: PI }]]);
    const carP = [5.0 + (t > E.cvPop + 7.5 ? (t - E.cvPop - 7.5) * 6 : 0), 0.5, 18]; poseCar29(t, carP, PI / 2, t > E.cvPop + 7.5);
    if (t >= E.cvPop + 5.5) rideCar29(t, carP, PI / 2, { angry: t < E.cvPop + 7.5 }, { mega: true, talk: true, hatPop: true });
    else { poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA }); poseBix29(bix29, t, xp, xA.yaw, { walk: xA.walk, phase: xA.phase * 2, ...xA }); }
    if (win(t, E.cvTurbo, E.cvTurbo + 4)) bloop6.B.aR.rotation.set(-1.2 + Math.sin(t * 14) * 0.6, 0, 0);
    inv29a.visible = win(t, E.cvTurbo + 4.5, E.cvPaid - 0.3); tixL29.visible = win(t, E.cvPaid + 0.3, E.cvOffer + 2);
    // ---- me
    const HK = [[0, 0, 0.5, -36], [8, 0, 0.5, -20], [E.cvPrize, 0, 0.5, -20], [E.cvPrize + 0.01, 1.0, 0.5, 1.0], [E.cvPrize + 2, 3.8, 0.5, 6.6], [E.cvJob, 3.8, 0.5, 6.6], [E.cvJob + 0.01, -1.0, 0.5, -2.0], [E.cvRing - 0.6, -3.5, 0.5, -8],
      [E.cvRing2 - 0.4, -3.5, 0.5, -8], [E.cvRing2 + 0.6, -1.0, 0.5, -10.8], [E.cvHammer - 1.6, -1.0, 0.5, -10.8], [E.cvHammer - 0.2, 5.0, 0.5, -6], [E.cvHammer2 - 0.8, 5.0, 0.5, -6], [E.cvHammer2, 2.2, 0.5, -5.2],
      [E.cvCandy, 2.2, 0.5, -5.2], [E.cvCandy + 0.01, -0.5, 0.5, 1.0], [E.cvCandy + 2.4, -2.0, 0.5, 3.2], [E.cvTurbo, -2.0, 0.5, 3.2], [E.cvTurbo + 0.01, -0.8, 0.5, 20], [E.cvBoard, -0.8, 0.5, 20], [E.cvBoard + 1.2, 0, 0.5, 27.0]];
    const hA = act(t, HK, [[0, { face: 'smug', wave: t < 4 }], [E.cvBix, { face: 'scared', yaw: 0, panic: t < E.cvBix + 0.8 }], [E.cvBix + 1.2, { face: 'normal', yaw: 0 }], [E.cvPrize + 2, { face: 'smug', yaw: faceTo([3.8, 0, 6.6], [6, 0, 8]) }],
      [E.cvJob, { face: 'smug' }], [E.cvRing - 0.6, { face: 'smug', yaw: -PI / 2 }], [E.cvRing + 6, { face: 'scared', yaw: -PI / 2 + 0.6 }], [E.cvRing2 - 0.4, { face: 'normal' }], [E.cvRing2 + 0.6, { face: 'normal', yaw: faceTo([-1, 0, -10.8], [-6, 0, -8]) }],
      [E.cvRing2 + 4.2, { face: 'scared', yaw: faceTo([-1, 0, -10.8], [-6, 0, -8]), panic: t < E.cvRing2 + 5.5 }], [E.cvHammer - 1.6, { face: 'smug' }], [E.cvHammer - 0.2, { face: 'smug', yaw: PI / 2, mallet: true }],
      [E.cvHammer + 0.5, { face: 'smug', yaw: PI / 2, mallet: true, swing: seg(t, E.cvHammer + 0.5, E.cvHammer + 1.5) * 0.99 }], [E.cvHammer + 1.5, { face: 'normal', yaw: PI / 2, mallet: true }], [E.cvHammer + 2.5, { face: 'scared', yaw: PI / 2, mallet: true, headPitch: 0.3 }],
      [E.cvHammer2 - 0.8, { face: 'smug' }], [E.cvHammer2, { face: 'normal', yaw: faceTo([2.2, 0, -5.2], [7, 0, -6]) }], [E.cvHammer2 + 1.6, { face: 'scared', yaw: faceTo([2.2, 0, -5.2], [7, 0, -6]), headPitch: -0.5 }],
      [E.cvHammer2 + 3.5, { face: 'smug', yaw: faceTo([2.2, 0, -5.2], [3.4, 0, -6]), wave: true }], [E.cvCandy, { face: 'smug' }], [E.cvCandy + 2.4, { face: 'normal', yaw: faceTo([-2, 0, 3.2], [-5, 0, 6]) }], [E.cvCandy + 5, { face: 'scared', yaw: faceTo([-2, 0, 3.2], [-5, 0, 6]) }],
      [E.cvTurbo, { face: 'smug' }], [E.cvOffer + 2.6, { face: 'smug', yaw: 0, wave: true, }], [E.cvBoard, { face: 'smug' }]]);
    if (win(t, E.cvOffer + 2.6, E.cvBoard)) hA.p = [hA.p[0], 0.5 + Math.abs(Math.sin(t * 9)) * 0.5, hA.p[2]];
    const S0 = seatW29(W, 0), S5 = seatW29(W, 5);
    if (t >= E.cvBoard + 2) seatHero29(t, 0, PI, W, t < E.cvTurboOn + 1 ? { face: 'smug', wave: win(t, E.cvBoard + 2.5, E.cvBoard + 4.5) } : { face: 'scared', panic: true });
    else if (t >= E.cvBoard + 1.2) pose(hero, { t, p: arcPath(t, [[E.cvBoard + 1.2, 0, 0.5, 27, 0], [E.cvBoard + 2, 0, AX29 - RG29 - 2.53, 30, 1.2]]), yaw: 0, face: 'smug' });
    else { pose(hero, { t, ...hA }); const RT = [E.cvRing + 1, E.cvRing + 3, E.cvRing + 5]; for (const r of RT) if (win(t, r - 0.3, r + 0.1)) hero.aR.rotation.set(lerp(-2.8, -0.6, seg(t, r - 0.3, r + 0.1)), 0, 0); }
    // ---- Leggy (carnival natural. cotton candy addict.)
    const lA = act(t, [[0, -2.2, 0.5, -39], [8.5, -2.4, 0.5, -22.5], [E.cvPrize, -2.4, 0.5, -22.5], [E.cvPrize + 0.01, -1.5, 0.5, 2], [E.cvPrize + 2.5, 0.6, 0.5, 4.0], [E.cvJob, 0.6, 0.5, 4.0], [E.cvJob + 0.01, -1.5, 0.5, -6], [E.cvRing - 1, -2.2, 0.5, -11],
      [E.cvRing2 - 1, -2.2, 0.5, -11], [E.cvRing2, -2.8, 0.5, -8], [E.cvHammer, -2.8, 0.5, -8], [E.cvHammer + 0.01, -2.0, 0.5, 2.0], [E.cvHammer2 - 0.6, 3.4, 0.5, -6], [E.cvHammer2 + 3.5, 3.4, 0.5, -6], [E.cvCandy + 2.5, -3.0, 0.5, 6],
      [E.cvCandy + 3.0, -3.0, 0.5, 6], [E.cvCandy + 3.3, -3.6, 0.5, 6], [E.cvCandy + 4.4, -3.6, 0.5, 6], [E.cvCandy + 4.7, -2.8, 0.5, 6], [E.cvTurbo, -2.8, 0.5, 6], [E.cvTurbo + 0.01, -3.0, 0.5, 20], [E.cvBoard, -3.0, 0.5, 20], [E.cvBoard + 0.6, -3.0, 0.5, 26]], [[0, {}]]);
    let ly = lA.walk ? lA.yaw : 0; if (win(t, E.cvRing - 1, E.cvHammer)) ly = -PI / 2; if (win(t, E.cvHammer2 - 0.6, E.cvHammer2 + 3.5)) ly = PI / 2; if (win(t, E.cvCandy + 2.5, E.cvTurbo)) ly = -PI / 2;
    if (win(t, E.cvPrize + 2.5, E.cvJob)) ly = faceTo([0.6, 0, 4], [6, 0, 8]); if (win(t, E.cvTurbo, E.cvBoard)) ly = 0;
    fluff29.visible = t > E.cvCandy + 4.5; fluff29.scale.setScalar(t > E.cvCandy + 4.5 ? Math.min(1, backOut(seg(t, E.cvCandy + 4.5, E.cvCandy + 5))) : 1);
    if (t >= E.cvBoard + 1.8) seatLeggy29(t, 5, PI, W);
    else if (t >= E.cvBoard + 0.6) poseLurk(L6, t, arcPath(t, [[E.cvBoard + 0.6, -3, 0.5, 26, 0], [E.cvBoard + 1.8, ...S5, 2]]), 0.4, 0.2);
    else { const LP = [...lA.p]; const cheer = win(t, E.cvRing2 + 4.4, E.cvHammer) || win(t, E.cvHammer2 + 2.5, E.cvHammer2 + 3.5) || win(t, E.cvCandy + 4.6, E.cvCandy + 6.5); if (cheer) LP[1] += Math.abs(Math.sin(t * 8)) * 0.4;
      poseLurk(L6, t, LP, ly, lA.walk ? 2 : 0.4); if (cheer) L6.root.rotation.z = Math.sin(t * 8) * 0.15;
      for (let i = 0; i < 5; i++) { const r = E.cvRing2 + 1 + i * 0.6; if (win(t, r - 0.3, r)) L6.legs[i % 2 ? 5 : 2].rotation.x = -1.4; }
      if (win(t, E.cvHammer2 + 0.9, E.cvHammer2 + 1.6)) L6.legs[5].rotation.x = t < E.cvHammer2 + 1.4 ? -1.6 : 0.5;
      if (win(t, E.cvCandy + 3.3, E.cvCandy + 4.4)) L6.hd.rotation.x = 0.7 + Math.sin(t * 20) * 0.1;
      if (win(t, E.cvJob - 4, E.cvJob)) L6.hd.rotation.x = -0.2; }
    // ---- rings: three for me, five for Leggy (hers all land)
    const handP = wl([-3.5, 0.5, -8], -PI / 2, [0.45, 1.6, 0.5]), lHead = wl([-2.8, 0.5, -8], -PI / 2, [0, 2.0, 1.85]), lHead0 = wl([-2.2, 0.5, -11], -PI / 2, [0, 2.4, 1.85]);
    const ringK = [[[E.cvRing + 1, ...handP, 0], [E.cvRing + 1.8, -5.4, 1.66, -8.6, 1.4]], [[E.cvRing + 3, ...handP, 0], [E.cvRing + 4, -7.0, 4.35, -8.4, 2.5]], [[E.cvRing + 5, ...handP, 0], [E.cvRing + 5.6, -8.4, 2.1, -8, 1.2], [E.cvRing + 6.6, ...lHead0, 1.6]]];
    for (let i = 0; i < 7; i++) { const m = rings29[i]; parentTo(m, g); m.visible = false; let K = i < 3 ? ringK[i] : null; const li = i === 2 ? 0 : i - 2;
      if (li >= 0 && li < 5 && t >= E.cvRing2 + 1 + li * 0.6 - 0.05 && (i !== 2 || t >= E.cvRing2 + 1)) { const r = E.cvRing2 + 1 + li * 0.6; K = [[r, ...lHead, 0], [r + 0.7, -8.4, 1.46, PEGZ[li], 1.2]]; }
      if (!K || t < K[0][0] || t >= E.cvTurbo) continue; m.visible = true; const done = t >= K[K.length - 1][0]; m.position.set(...arcPath(t, K)); m.rotation.set(done ? PI / 2 : PI / 2 + t * 11, done ? 0 : t * 5, 0); }
    if (win(t, E.cvRing + 6.6, E.cvRing2 + 1)) { rings29[2].visible = true; rings29[2].position.set(...wl(L6.root.position.toArray(), -PI / 2, [0, 2.4, 1.85])); rings29[2].rotation.set(PI / 2, 0, 0); }
    // ---- camera
    let cam = camKeys(t, C1);
    if (win(t, 87.5, E.cvPop)) cam = gcam29(S0, [1.6, 1.2, -3.0], [0, 1.2, 0], 52);
    else if (win(t, E.cvPop + 1.2, E.cvPop + 6)) { const wx = W.p[0]; cam = { p: [wx - 3, 4.5, 13], l: [wx + 3, 6.5, 30], fov: 56 }; }
    return { cam, hud: true };
  }
  function upd3(t) {
    const W = W29(t); poseWheel29(W); props(t, true);
    const S0 = seatW29(W, 0), S5 = seatW29(W, 5);
    // ---- the giant plush crown
    plush29.visible = true; plush29.scale.setScalar(1); const BXP = [3.0, 0.5, 18.6];
    if (t < E.cvRedeem + 1.5) { parentTo(plush29, g); plush29.position.set(6, 1.83, 8); plush29.rotation.set(0, t * 0.5, 0); }
    else if (t < E.cvRedeem + 2.5) { parentTo(plush29, g); plush29.position.set(...arcPath(t, [[E.cvRedeem + 1.5, 6, 1.83, 8, 0], [E.cvRedeem + 2.5, 0, 3.0, 18.5, 2.5]])); plush29.rotation.set(0, t * 6, 0); }
    else { parentTo(plush29, capHat); plush29.position.set(0, 0.42, 0); plush29.rotation.set(0, 0, 0); plush29.scale.setScalar(0.55); crownM.visible = false; }
    // ---- Barker Bix
    const xo = pick(t, [[0, { yaw: faceTo(BXP, [0, 0, 18.5]) }], [E.cvCount, { yaw: faceTo(BXP, [0, 0, 18.5]), mega: true, talk: true }], [E.cvCount + 2, { yaw: faceTo(BXP, [0, 0, 18.5]), give: true }], [E.cvCount + 3.5, { yaw: faceTo(BXP, [0, 0, 18.5]) }],
      [E.cvGift, { yaw: faceTo(BXP, [-1.2, 0, 19.3]), headPitch: 0.2 }], [E.cvRedeem, { yaw: faceTo(BXP, [0, 0, 18.5]), mega: true, talk: true }], [E.cvRedeem + 1.4, { yaw: faceTo(BXP, [0, 0, 18.5]), give: true }], [E.cvRedeem + 2.6, { yaw: faceTo(BXP, [0, 0, 18.5]), cheer: true }],
      [E.cvRide, { cheer: true, yaw: PI }], [E.cvLean, { cheer: true, yaw: faceTo(BIXL, LEV) }], [E.cvLean + 0.8, { lean: 0.5, pull: 1, yaw: faceTo(BIXL, LEV), headPitch: 0.4 }], [E.cvSpin2, { yaw: faceTo(BIXL, LEV), hatPop: true, panic: true }], [E.cvPop2, { panic: true, hatPop: true, yaw: 1.2 }]]);
    tixB29.visible = win(t, E.cvCount + 2, E.cvCount + 3.4); bix29.root.visible = true;
    const carP = t < E.cvBack + 5.5 ? [W.p[0] + 8.3, 0.5, 30] : t < E.cvChase2 ? [9, 0.5, 16] : [Math.min(lerpK(ROLL2, t) - 12, lerpK(ROLL2, E.cvBloopInv) - 12), 0.5, 30], carYaw = t < E.cvBack + 5.5 ? -PI / 2 : PI / 2, driving = t < E.cvBack + 5.5 || win(t, E.cvChase2, E.cvBloopInv);
    poseCar29(t, carP, carYaw, driving);
    if (t < E.cvBack + 5.5) rideCar29(t, carP, carYaw, {}, { cheer: true });
    else if (t >= E.cvChase2) { rideCar29(t, carP, carYaw, t >= E.cvBloopInv ? { handOut: true } : { angry: true }, t >= E.cvBloopInv ? { headPitch: 0.4 } : { mega: true, talk: true, hatPop: true }); inv29c.visible = t >= E.cvBloopInv + 0.6; }
    else {
      poseBix29(bix29, t, t < E.cvRide ? BXP : BIXL, xo.yaw, xo);
      // ---- Bloop: hands over his pay. then hands over an invoice for it.
      const bA = act(t, [[E.cvBack, -4, 0.5, 21], [E.cvGift, -4, 0.5, 21], [E.cvGift + 1.5, -1.2, 0.5, 19.3], [E.cvRedeem, -1.2, 0.5, 19.3], [E.cvRedeem + 2, -2.4, 0.5, 21.5], [E.cvRide, -3, 0.5, 24]],
        [[0, { yaw: faceTo([-4, 0, 21], [0, 0, 18.5]) }], [E.cvGift + 1.5, { yaw: faceTo([-1.2, 0, 19.3], [0, 0, 18.5]), handOut: true }], [E.cvGift + 3.2, { yaw: faceTo([-1.2, 0, 19.3], [0, 0, 18.5]), hop: true }], [E.cvInvoice + 0.4, { yaw: faceTo([-1.2, 0, 19.3], [0, 0, 18.5]), handOut: true }],
         [E.cvInvoice + 4.5, { yaw: faceTo([-1.2, 0, 19.3], [0, 0, 18.5]) }], [E.cvRedeem + 2.6, { hop: true, yaw: 0.6 }], [E.cvRide, { yaw: 0.4 }], [E.cvPop2, { angry: true, yaw: 1.2 }]]);
      poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA }); tixL29.visible = win(t, E.cvGift, E.cvGift + 3.2); inv29b.visible = win(t, E.cvInvoice + 0.4, E.cvInvoice + 4.5);
    }
    // ---- me
    if (t < E.cvBack + 5.5) { pose(hero, { t, p: [W.p[0], W.p[1] + R29 + 0.18, 30], yaw: PI / 2, walk: 1, phase: t * 9, face: 'scared' }); }
    else if (t < E.cvBack + 7) { const k = seg(t, E.cvBack + 5.5, E.cvBack + 6.8); pose(hero, { t, p: arcPath(t, [[E.cvBack + 5.5, 0, AX29 + R29 + 0.2, 30, 0], [E.cvBack + 6.8, -1, 0.5, 22, 5]]), yaw: PI, face: 'scared', panic: true, spin: k < 1 ? k * 9 : 0, flat: k >= 1 ? 1 : 0 }); }
    else if (t < E.cvRide) { const hA = act(t, [[E.cvBack + 9, -1, 0.5, 22], [E.cvCount - 0.5, 0, 0.5, 18.5]], [[0, { face: 'normal', flat: t < E.cvBack + 9 ? 1 : 0 }], [E.cvCount - 0.5, { face: 'smug', yaw: faceTo([0, 0, 18.5], BXP) }],
        [E.cvCount + 4, { face: 'normal', yaw: faceTo([0, 0, 18.5], BXP), headPitch: 0.4 }], [E.cvCount + 5, { face: 'normal', yaw: 2.83, headPitch: 0.3 }], [E.cvGift + 1.5, { face: 'normal', yaw: faceTo([0, 0, 18.5], [-1.2, 0, 19.3]) }], [E.cvGift + 3, { face: 'smug', yaw: faceTo([0, 0, 18.5], [-1.2, 0, 19.3]) }],
        [E.cvInvoice + 1.2, { face: 'scared', yaw: faceTo([0, 0, 18.5], [-1.2, 0, 19.3]) }], [E.cvInvoice + 3.5, { face: 'normal', yaw: 2.6 }], [E.cvRedeem, { face: 'smug', yaw: faceTo([0, 0, 18.5], BXP) }], [E.cvRedeem + 2.6, { face: 'smug', yaw: 2.6, wave: true }]]);
      pose(hero, { t, ...hA }); if (win(t, E.cvGift + 1.6, E.cvGift + 3.2)) hero.aR.rotation.set(-1.3, 0, 0); }
    else { const o = t < E.cvCreak ? { face: 'smug', wave: win(t, E.cvRide + 1, E.cvRide + 3) } : t < E.cvFine ? { face: 'scared', headYaw: 0.6 } : t < E.cvSpin2 ? { face: 'smug' } : { face: 'scared', panic: true };
      seatHero29(t, 0, t >= E.cvLast + 5 ? -2.2 : PI, W, o); }
    // ---- Leggy: the last of the cotton candy, then the gondola rail (?!)
    fluff29.visible = t < E.cvTop + 9; fluff29.scale.setScalar(t < E.cvTop + 7 ? 0.5 : 0.5 * (1 - seg(t, E.cvTop + 7, E.cvTop + 9)) + 0.001);
    if (t < E.cvBack + 6.3 || t >= E.cvRide) seatLeggy29(t, 5, PI, W);
    else { poseLurk(L6, t, [-4.5, 0.5, 23.5], faceTo([-4.5, 0, 23.5], [0, 0, 18.5]), 0.4); if (win(t, E.cvRedeem + 2.6, E.cvRide)) { L6.root.position.y += Math.abs(Math.sin(t * 8)) * 0.4; L6.root.rotation.z = Math.sin(t * 8) * 0.15; } }
    if (win(t, E.cvFine - 1, E.cvFine + 3)) L6.hd.rotation.x = 0.4 + Math.sin(t * 18) * 0.25;
    // ---- camera
    let cam = camKeys(t, C3);
    if (win(t, E.cvTop, E.cvTop + 7) || win(t, E.cvCreak, E.cvFine) || win(t, E.cvFine + 3, E.cvLean)) cam = gcam29(S0, [0.9 + Math.sin(t * 0.3) * 0.2, 1.3, -3.4], [0.3, 1.2, 0], 50);
    else if (win(t, E.cvTop + 7, 218) || win(t, E.cvFine, E.cvFine + 3)) cam = gcam29(S5, [-0.8, 1.4, -3.0], [0, 0.6, 0], 48);
    else if (win(t, 238, E.cvPop2)) cam = gcam29(S0, [1.6, 1.2, -3.0], [0, 1.2, 0], 52);
    else if (win(t, E.cvPop2 + 1.2, E.cvCarousel)) { const wx = W.p[0]; cam = { p: [wx - 3, 4.5, 13], l: [wx + 3, 6.5, 30], fov: 56 }; }
    else if (win(t, E.cvCarousel, E.cvChase2)) { const cx = crP.position.x; cam = { p: [cx + 3, 4, 13], l: [cx, 2, 25], fov: 55 }; }
    else if (win(t, E.cvChase2, E.cvRoad)) cam = { p: [carP[0] - 7, 3.2, 34], l: [carP[0] + 8, 3.5, 30], fov: 55 };
    else if (win(t, E.cvRoad, E.cvBloopInv)) cam = { p: [W.p[0] - 22, 9, 50], l: [W.p[0] - 5, 4, 30], fov: 55 };
    else if (win(t, E.cvBloopInv, E.cvLast)) cam = { p: [carP[0] + 3.2, 2.8, 32.6], l: [carP[0] + 0.2, 2.0, 30], fov: 40 };
    else if (win(t, E.cvLast, E.cvLast + 5)) cam = { p: [carP[0] - 6, 3.8, 33.5], l: [W.p[0], 5, 30], fov: 45 };
    else if (t >= E.cvLast + 5) cam = gcam29(S0, [-2.2, 1.4, -3.0], [0, 1.3, 0], 50);
    return { cam, hud: true };
  }
  function update(t) {
    hideMisc(); hide29(); bloopReset29(g);
    return t < E.cvHills ? upd1(t) : upd3(t);
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the hills at sunset — the runaway wheel
const HB29 = z => lerpK([[-10, 8], [14, 0], [52, 0], [57, 3], [59.4, 3], [59.6, 0], [300, 0]], z);
const hB29 = (x, z) => Math.round(HB29(z)) + (Math.abs(x) > 12 ? Math.min(6, Math.floor((Math.abs(x) - 12) / 3)) : 0);
const hills = (() => {
  const g = mk('hills'); const st = new VSet(g);
  for (let x = -30; x <= 30; x++) for (let z = -40; z <= 165; z++) { const h = hB29(x, z), ax = Math.abs(x);
    if (z >= 133 && z <= 156 && ax <= 15) { st.add(x, -1, z, 'sand'); st.add(x, 0, z, 'water'); continue; }
    for (let y = Math.max(0, h - 2); y < h; y++) st.add(x, y, z, 'soil'); st.add(x, h, z, ax <= 2 ? 'path' : 'turf');
    if (h === 0 && ax >= 6 && ax <= 11 && z > 18 && z < 50 && z % 4) st.add(x, 1, z, 'crop'); }
  for (const [x, z, h] of [[-9, -30, 6], [10, -24, 5], [-14, -8, 6], [13, 4, 5], [-10, 16, 6], [16, 30, 6], [-18, 40, 5], [9, 66, 6], [-11, 74, 5], [14, 90, 6], [-15, 100, 6], [-9, 124, 6], [19, 140, 6], [-21, 150, 6], [22, 60, 5]]) tree29(st, x, z, h, hB29(x, z));
  st.build();
  const hay = pivot(g, 0, 0.5, 44); for (const [x, y, z] of [[-1.3, 0.5, 0], [0.3, 0.5, 0.1], [1.9, 0.5, -0.1], [-0.5, 1.5, 0], [1.1, 1.5, 0.05], [0.3, 2.5, 0]]) { box(1.6, 1.0, 1.1, '#e8c050', x, y, z, hay); box(0.12, 1.02, 1.12, '#a07a20', x, y, z, hay); }
  const bag = pivot(g, 0, 0.5, 80); { const m = glow29('#ffb0dc', 0.35); for (const [x, y, z, s] of [[0, 0.8, 0, 2.4], [-1.2, 0.6, 1, 1.6], [1.2, 0.7, -0.8, 1.8], [0.8, 0.5, 1.4, 1.4], [-1, 0.6, -1.3, 1.5], [0, 1.6, 0.4, 1.4]]) box(s, s, s, 0, x, y, z, bag, m); }
  const WZ = [[E.cvHills, -22], [E.cvInside, 2], [E.cvChase, 26], [E.cvHay, 40], [E.cvHay + 3, 48], [E.cvJump, 58.5], [E.cvLand, 80], [E.cvIdea, 98], [E.cvRoll, 106], [E.cvRoll + 4, 114], [E.cvPond, 122], [E.cvPond + 1.5, 123.4], [E.cvPond + 3, 122.3], [E.cvTip, 123.0], [E.cvTip + 2, 122.6], [E.cvPush, 122.6], [E.cvBack, 100]];
  burst(E.cvHay + 1.5, [0, 1.5, 44], { n: 110, colors: ['#e8c050', '#f0d878', '#a07a20'], speed: 6, size: 0.18, life: 1.6, grav: 3, up: 3 });
  burst(E.cvJump, [0, 4, 58.5], { n: 40, colors: ['#c8b89a', '#9a8a6a'], speed: 4, size: 0.25, life: 0.8, grav: 5, up: 1 });
  burst(E.cvLand, [0, 1.5, 80], { n: 140, colors: ['#ffb0dc', '#ff7ac0', '#ffffff'], speed: 7, size: 0.28, life: 1.6, grav: 2, up: 3 });
  burst(E.cvPond + 1.5, [0, 0.8, 133.5], { n: 50, colors: ['#8ad0ff', '#ffffff'], speed: 3, size: 0.12, life: 0.9, grav: 6, up: 2 });
  smoke(E.cvHills, E.cvPond, 0.25, t => [0, 0.7, lerpK(WZ, t)], { n: 2, colors: ['#c8b89a', '#a89878'], speed: 1, size: 0.35, life: 1, grav: -0.5, up: 0.5 });
  const WH = t => { const z = lerpK(WZ, t); let y = HB29(z) + 0.5 + R29 + 0.18; if (win(t, E.cvJump, E.cvLand)) { const k = seg(t, E.cvJump, E.cvLand); y = lerp(HB29(58.5), HB29(80), k) + 0.68 + R29 + Math.sin(k * PI) * 6; } return { p: [0, y, z], yaw: -PI / 2, ang: (z + 22) / R29, swing: 0.3 }; };
  const CK = [[E.cvHills, 0, 0, -45], [E.cvChase, 0, 0, 13], [E.cvHay, 0, 0, 27], [E.cvJump, 0, 0, 44], [E.cvJump + 1.6, 0, 0, 52], [E.cvLand + 2, 0, 0, 62], [E.cvIdea, 0, 0, 84], [E.cvPond - 1, 0, 0, 108], [E.cvTip + 1.5, 4.5, 0, 116], [E.cvPush - 0.6, 4.5, 0, 128], [E.cvPush, 0, 0, 130.9]];
  const CH = [[E.cvJump, 9, 1.6, 64, 0, 9, 60, 66], [E.cvLand - 0.1, 10, 1.8, 72, 0, 9, 76, 66], [E.cvLand, 12, 6, 74, 0, 4, 82, 52], [E.cvIdea - 0.1, 11, 5, 86, 0, 5, 94, 52],
    [E.cvPond, 5, 2, 136, 0, 9, 123, 62], [E.cvTip - 0.1, 6, 2.5, 137, 0, 9.5, 123, 60], [E.cvTip, 14, 6, 112, 0, 7, 122, 54], [E.cvPush - 0.1, 13, 6.5, 114, 0, 7, 124, 52]];
  function update(t) {
    hideMisc(); hide29(); bloopReset29(g); bulbs29.forEach(m => m.material = bulbOn29[m.userData.ci]);
    const W = WH(t), [, wy, wz] = W.p; poseWheel29(W); const S0 = seatW29(W, 0);
    // ---- the bumper car chase
    let cp, cyaw; if (t < E.cvPush) { const w = walker(t, CK); cp = [w.p[0], HB29(w.p[2]) + 0.5, w.p[2]]; cyaw = w.speed > 0.05 ? w.yaw : 0; } else { cp = [0, 0.5, wz + 8.3]; cyaw = PI; }
    poseCar29(t, cp, cyaw, true); rideCar29(t, cp, cyaw, { angry: win(t, E.cvChase, E.cvHay) }, win(t, E.cvTip, E.cvPush) ? { cheer: true } : { mega: true, talk: true, hatPop: win(t, E.cvJump, E.cvLand + 2) });
    // ---- me: screaming in gondola 0 → climbing out → log-rolling the brakes
    const top = [0, wy + R29 + 0.18, wz];
    if (t < E.cvIdea + 0.5) seatHero29(t, 0, PI / 2, W, t < E.cvLand + 1 || t > E.cvIdea ? { face: 'scared', panic: true } : { face: 'normal', headPitch: -0.3 });
    else if (t < E.cvIdea + 2.5) { const W0 = WH(E.cvIdea + 0.5), s = seatW29(W0, 0), Wt = WH(E.cvIdea + 2.5); pose(hero, { t, p: arcPath(t, [[E.cvIdea + 0.5, ...s, 0], [E.cvIdea + 2.5, 0, Wt.p[1] + R29 + 0.18, Wt.p[2], 2]]), yaw: PI, face: 'scared', panic: true }); }
    else if (t < E.cvPond) pose(hero, { t, p: top, yaw: PI, walk: 1.2, phase: t * 10, face: 'smug' });
    else if (t < E.cvTip) pose(hero, { t, p: top, yaw: 0, face: 'scared', panic: true, lean: Math.sin(t * 5) * 0.3 });
    else if (t < E.cvPush) pose(hero, { t, p: top, yaw: 0, face: 'smug', wave: t > E.cvTip + 1.5 });
    else pose(hero, { t, p: top, yaw: 0, walk: 1.2, phase: t * 10, face: 'smug' });
    // ---- Leggy: cotton candy → airbag
    seatLeggy29(t, 5, PI / 2, W); fluff29.visible = true; fluff29.scale.setScalar(t < E.cvLand - 0.4 ? 1 : 0.5);
    if (win(t, E.cvLand - 1.2, E.cvLand - 0.4)) fluff29.scale.setScalar(1 + seg(t, E.cvLand - 1.2, E.cvLand - 0.4) * 0.6);
    hay.visible = t < E.cvHay + 1.5; const bk = seg(t, E.cvLand - 0.4, E.cvLand + 0.6); bag.visible = win(t, E.cvLand - 0.4, E.cvLand + 2.5); bag.scale.set(1 + Math.sin(bk * PI) * 0.4, Math.max(0.2, backOut(seg(t, E.cvLand - 0.4, E.cvLand - 0.1)) - Math.sin(bk * PI) * 0.55), 1 + Math.sin(bk * PI) * 0.4);
    // ---- camera
    let cam = camKeys(t, CH);
    if (t < E.cvInside) cam = { p: [16, wy + 2, wz + 12], l: [0, wy - 1, wz + 2], fov: 56 };
    else if (t < E.cvChase) cam = gcam29(S0, [3.0, 1.6, 0.8], [0, 1.3, 0], 50);
    else if (t < E.cvHay) cam = { p: [cp[0] + 3.5, cp[1] + 3.4, cp[2] - 7], l: [0, wy - 1, wz], fov: 55 };
    else if (t < E.cvJump) cam = { p: [13, 4, wz + 3], l: [0, 4, wz], fov: 55 };
    else if (win(t, E.cvIdea, E.cvRoll)) cam = { p: [9, wy + 4, wz - 3], l: [0, wy + 2, wz], fov: 52 };
    else if (win(t, E.cvRoll, E.cvPond)) cam = { p: [7.5, wy + R29 + 1.2, wz + 2], l: [0, wy + R29 + 0.8, wz], fov: 48 };
    else if (t >= E.cvPush) cam = { p: [20, 9, wz + 4], l: [0, 6, wz], fov: 52 };
    return { cam, hud: true };
  }
  return { g, update };
})();
