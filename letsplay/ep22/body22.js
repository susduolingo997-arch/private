// ---------------------------------------------------------------- Ep 22 helpers: the ghost train, Conductor Wisp, flappers, the Spook-o-Meter
const ghostM = new THREE.MeshLambertMaterial({ color: '#7fe8ff', emissive: '#2ab0c8', emissiveIntensity: 0.7, transparent: true, opacity: 0.75 }), ghostD = new THREE.MeshLambertMaterial({ color: '#2a5a8a', emissive: '#103a5a', emissiveIntensity: 0.6, transparent: true, opacity: 0.8 });
const glowY = new THREE.MeshBasicMaterial({ color: '#fff3a0' }), glowC = new THREE.MeshBasicMaterial({ color: '#7ff5e6' }), glowP = new THREE.MeshBasicMaterial({ color: '#ff8fd8' });
function makeTrain() { const root = new THREE.Group(), loco = pivot(root, 0, 0, 0), cars = [pivot(root, 0, 0, 0), pivot(root, 0, 0, 0)];
  box(2.2, 0.5, 4.2, 0, 0, 0.8, 0, loco, ghostD); box(1.8, 1.6, 2.6, 0, 0, 1.85, 0.6, loco, ghostM); box(2.2, 0.2, 1.6, 0, 0, 3.2, -1.3, loco, ghostD); for (const x of [-1, 1]) box(0.2, 2.2, 1.5, 0, x, 2.1, -1.3, loco, ghostM); box(2.2, 1.0, 0.2, 0, 0, 1.5, -2.0, loco, ghostM);
  box(0.6, 1.0, 0.6, 0, 0, 3.1, 1.5, loco, ghostD); box(0.9, 0.7, 0.15, 0, 0, 1.9, 1.95, loco, glowY); box(2.0, 0.5, 0.5, 0, 0, 0.6, 2.25, loco, ghostD);
  const lever = pivot(loco, 0.6, 1.2, -1.0); box(0.1, 0.8, 0.1, '#c0c0c8', 0, 0.4, 0, lever); box(0.24, 0.24, 0.24, '#e8344e', 0, 0.82, 0, lever);
  const wheels = []; for (const g of [loco, ...cars]) for (const z of [-1.2, 1.2]) for (const x of [-1.15, 1.15]) { const w = pivot(g, x, 0.45, z); box(0.16, 0.8, 0.8, 0, 0, 0, 0, w, ghostD); wheels.push(w); }
  for (const c of cars) { box(2.2, 0.6, 3.6, 0, 0, 0.9, 0, c, ghostD); for (const x of [-1.05, 1.05]) box(0.15, 0.7, 3.6, 0, x, 1.55, 0, c, ghostM); for (const z of [-1.75, 1.75]) box(2.2, 0.7, 0.15, 0, 0, 1.55, z, c, ghostM); }
  const lamp = new THREE.PointLight('#bff8ff', 30, 14, 1.4); lamp.position.set(0, 2.4, -5); root.add(lamp);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, loco, cars, lever, wheels, lamp }; }
const train = makeTrain(), CARZ = [-5.4, -9.4];
// place loco + cars: fn(d) -> [pos, yaw] for a distance d behind the loco centre
function placeTrain(fn, roll, op = 0.75) { const [p, y] = fn(0); train.loco.position.set(...p); train.loco.rotation.set(0, y, 0); train.cars.forEach((c, i) => { const [q, yy] = fn(-CARZ[i]); c.position.set(...q); c.rotation.set(0, yy, 0); });
  train.wheels.forEach(w => w.rotation.x = roll); ghostM.opacity = op; ghostD.opacity = Math.min(1, op + 0.05); train.lamp.position.set(...fn(4)[0]); train.lamp.position.y += 2.4; }
const inCar = (i, l) => { const c = train.cars[i]; return wl([c.position.x, c.position.y, c.position.z], c.rotation.y, l); }, inLoco = l => wl([train.loco.position.x, train.loco.position.y, train.loco.position.z], train.loco.rotation.y, l);
const SEATS = [[-0.5, 1.15, 0.8], [0.5, 1.15, 0.8], [-0.5, 1.15, -0.8], [0.5, 1.15, -0.8]];
function makeWisp() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), sm = new THREE.MeshLambertMaterial({ color: '#f4fbff', emissive: '#9fdcff', emissiveIntensity: 0.45, transparent: true, opacity: 0.85 });
  box(1.0, 1.2, 0.9, 0, 0, 0.7, 0, body, sm); const hd = pivot(body, 0, 1.3, 0); box(0.9, 0.75, 0.85, 0, 0, 0.3, 0, hd, sm);
  const eyes = [-0.2, 0.2].map(x => box(0.16, 0.26, 0.04, '#111', x, 0.36, 0.44, hd)); const mouth = box(0.2, 0.16, 0.04, '#111', 0, 0.1, 0.44, hd);
  const cap = pivot(hd, 0, 0.72, 0); box(0.95, 0.25, 0.9, '#1b2a4a', 0, 0, 0, cap); box(0.96, 0.08, 0.91, '#ffd23f', 0, -0.06, 0, cap); box(0.95, 0.06, 0.4, '#1b2a4a', 0, -0.1, 0.55, cap);
  const skirt = [-0.36, -0.12, 0.12, 0.36].map(x => { const p = pivot(body, x, 0.1, 0); box(0.24, 0.3, 0.9, 0, 0, -0.12, 0, p, sm); return p; });
  const aL = pivot(body, -0.58, 1.1, 0), aR = pivot(body, 0.58, 1.1, 0); box(0.2, 0.5, 0.2, 0, 0, -0.22, 0, aL, sm); box(0.2, 0.5, 0.2, 0, 0, -0.22, 0, aR, sm);
  const lant = pivot(aR, 0, -0.55, 0.1); box(0.26, 0.36, 0.26, 0, 0, -0.1, 0, lant, glowY); box(0.3, 0.06, 0.3, '#333', 0, 0.1, 0, lant); const punch = box(0.14, 0.24, 0.1, '#c0c0c8', 0, -0.55, 0.12, aL);
  return { root, body, hd, eyes, mouth, cap, skirt, aL, aR, lant, punch, sm }; }
function poseWisp(w, t, p, yaw, o = {}) { w.root.position.set(p[0], p[1] + 0.25 + Math.sin(t * 2.2) * 0.12 + (o.hop ? Math.abs(Math.sin(t * 8)) * 0.5 : 0), p[2]); w.root.rotation.set(0, yaw + (o.spin ? t * 9 : 0), 0);
  w.skirt.forEach((s, i) => s.rotation.x = Math.sin(t * 6 + i * 1.3) * 0.35); w.body.rotation.x = o.sad ? 0.25 : 0; w.hd.rotation.set(o.sad ? 0.45 : 0, o.look || 0, 0);
  w.aL.rotation.set(o.panic ? -2.7 + Math.sin(t * 22) * 0.5 : o.punch ? -1.4 + Math.abs(Math.sin(t * 10)) * 0.5 : o.lever ? -1.2 : 0, 0, -0.15); w.aR.rotation.set(o.panic ? -2.7 + Math.cos(t * 22) * 0.5 : o.wave ? -2.8 + Math.sin(t * 10) * 0.3 : -0.5, 0, 0.15);
  w.eyes.forEach(e => e.scale.y = o.sad ? 0.4 : o.panic ? 1.5 : 1); w.mouth.scale.set(o.panic ? 1.6 : o.happy ? 2.2 : 1, o.panic ? 2 : o.happy ? 0.5 : 1, 1); w.punch.visible = !!o.punch;
  w.sm.color.set(o.happy ? '#ffd6ee' : '#f4fbff'); w.sm.emissive.set(o.happy ? '#ff8fd8' : '#9fdcff'); w.sm.opacity = o.fade ?? 0.85; }
const wisp = makeWisp();
function makeFlapper() { const root = new THREE.Group(); box(0.3, 0.26, 0.3, '#2a2030', 0, 0, 0, root); for (const x of [-0.08, 0.08]) box(0.06, 0.06, 0.04, 0, x, 0.04, 0.16, root, glowY);
  const wL = pivot(root, -0.15, 0, 0), wR = pivot(root, 0.15, 0, 0); box(0.6, 0.04, 0.4, '#3a2a48', -0.3, 0, 0, wL); box(0.6, 0.04, 0.4, '#3a2a48', 0.3, 0, 0, wR); return { root, wL, wR }; }
function poseFlap(f, t, p, yaw, ph = 0) { f.root.position.set(...p); f.root.rotation.set(0, yaw, 0); const a = Math.sin(t * 26 + ph) * 0.8; f.wL.rotation.z = a; f.wR.rotation.z = -a; }
const flappers = Array.from({ length: 16 }, makeFlapper);
const meter = new THREE.Group(); box(0.42, 0.3, 0.2, '#3a3a3a', 0, 0, 0, meter); box(0.3, 0.18, 0.02, '#ffe066', 0, 0.02, 0.11, meter); const needle = pivot(meter, 0, -0.05, 0.13); box(0.02, 0.14, 0.01, '#e8344e', 0, 0.07, 0, needle);
box(0.04, 0.5, 0.04, '#c0c0c8', 0.14, 0.38, 0, meter); const mTip = box(0.1, 0.1, 0.1, '#ff3d3d', 0.14, 0.66, 0, meter); bloop6.B.aR.add(meter); meter.position.set(0, -0.62, 0.22);
const sheetB = box(1.15, 1.7, 1.15, '#f4f4f0', 0, 1.0, 0, bloop6.B.body); for (const x of [-0.2, 0.2]) box(0.14, 0.2, 0.02, '#111', x, 0.35, 0.58, sheetB);
const lanternH = new THREE.Group(); box(0.26, 0.34, 0.26, 0, 0, 0, 0, lanternH, glowY); box(0.3, 0.06, 0.3, '#333', 0, 0.2, 0, lanternH); hero.aL.add(lanternH); lanternH.position.set(0, -0.82, 0.1); const heroLight = new THREE.PointLight('#ffe8a0', 12, 10, 1.4); lanternH.add(heroLight);
const ticket = box(0.6, 0.3, 0.03, 0, 0, 0, 0, new THREE.Group(), glowC);
// HUD: the Spook-o-Meter; the ticket card
const spookAt = t => t < E.detectorEnd ? null : t < E.test + 1 ? 0.05 : t < E.test + 3 ? 0.42 : t < E.walk ? 0.03 : t < E.midnight ? lerp(0.1, 0.3, seg(t, E.arrive, E.midnight)) : t < E.wisp ? 0.85 : t < E.twist ? 0.97 : t < E.hug ? 0.35 : t < E.prep ? 0.12 : t < E.boo ? 0.2 : t < E.lever ? 1 : 0.6 + 0.3 * Math.abs(Math.sin(t));
function drawSpook(t) { const v = spookAt(t); if (v === null || t >= E.freeze) return; rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(10,20,40,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7ff5e6'; ctx.stroke(); outlined('SPOOK-O-METER', 132, 114, 15, '#7ff5e6', '#000', 3);
  rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const lonely = win(t, E.twist, E.hug); rrect(36, 130, Math.max(16, 192 * v), 20, 8); ctx.fillStyle = lonely ? '#8fa0ff' : v > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : v > 0.4 ? '#ffa02a' : '#7cff6b'; ctx.fill();
  outlined(lonely ? 'READING: LONELY?' : v > 0.95 ? 'AAAAAAH' : Math.round(v * 100) + '% SPOOKY', 132, 168, 16, '#fff', '#000', 4); }
function drawTicket(T) { const k = ss(seg(T, E.ticket + 1, E.ticket + 1.4)) * (1 - ss(seg(T, E.ticketEnd - 0.4, E.ticketEnd))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 60); ctx.rotate(-0.05 + Math.sin(T * 2) * 0.02); rrect(-230, -130, 460, 250, 16); ctx.fillStyle = 'rgba(160,250,255,.92)'; ctx.fill(); ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.strokeStyle = '#1b4a6a'; ctx.stroke(); ctx.setLineDash([]);
  outlined('GHOST TRAIN', 0, -90, 40, '#ffffff', '#1b4a6a', 7); outlined('ADMIT THREE', 0, -40, 26, '#1b4a6a', '#a0faff', 2); if (T > E.ticket + 2.6) outlined('DEPARTS: MIDNIGHT', 0, 2, 24, '#1b4a6a', '#a0faff', 2);
  if (T > E.ticket + 4) outlined('NEXT STOP: AAAAH', 0, 46, 28, '#c0182a', '#a0faff', 2); if (T > E.ticket + 5.4) outlined('(no refunds. no exits.)', 0, 88, 16, '#3a5a7a', '#a0faff', 2); ctx.restore(); }

// ================================================================ EPISODE 22: "THE GHOST TRAIN (next stop: AAAAH)" — the yard at dusk (a ticket; the Spook-o-Meter) → Hollow Hill Station at midnight → the tunnel ride (Wisp is lonely) → grand opening (Bloop says BOO; the train flies)
// ---------------------------------------------------------------- set A: the yard at dusk
const yard = (() => {
  const g = mk('yard'); field(g, false); const hg = new THREE.Group(); g.add(hg); { const st = new VSet(hg); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(hg); }
  parentTo(sofie.root, g); burst(E.ticket + 6, [0, 2.2, 1.6], { n: 40, colors: ['#7ff5e6', '#ffffff'], speed: 3, size: 0.12, life: 1, grav: 1, up: 2 });
  for (let t = E.detector; t < E.detectorEnd; t += 0.5) burst(t, [3, 1.6, 1.8], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  const C = [[0, 0, 3, 10, 0, 1.6, 0, 50], [5.9, 1, 2.6, 8, 0, 1.6, 0.5, 46], [6, 4, 1.6, 5, 0, 1.8, 0.5, 44], [10.9, 3, 1.6, 4.4, 0, 1.8, 0.5, 42], [11, 0, 1.2, 5.4, 0, 4, -2, 56], [18.9, 0, 1.8, 5, 0, 2, 0, 48],
    [19, 2.8, 1.9, 4.6, 0.2, 1.2, -0.2, 44], [23.9, 2.4, 1.9, 4.2, 0.2, 1.2, -0.2, 42], [24, 7, 3, 6, 3, 1.2, 1.5, 46], [30.9, 6, 2.6, 5, 3, 1.2, 1.5, 42], [31, -1, 2, 5.6, 1, 1.4, 1, 44], [36.9, -0.6, 2, 5.2, 1, 1.4, 1, 42],
    [37, 4, 3, 6, 0, 1.4, 6, 50], [45.9, 4, 3, 24, 0, 1.4, 22, 52], [E.arrive, 4, 3, 24, 0, 1.4, 22, 52]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = ribbon.visible = sheetB.visible = false; [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => d.visible = false); muffin.root.visible = puff.root.visible = bot.root.visible = false;
    [twin, third, tock, wisp, duke, ...lumpy, ...fans, wagon].forEach(o => (o.root || o).visible = false); booth.visible = tarp.visible = false; sofie.root.visible = true; poseSofa(sofie, t, [-9, 0.5, -1], 0.5, { awake: false });
    [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g)); lanternH.visible = t > E.walk; meter.visible = t > E.detectorEnd - 1.2; card.visible = false;
    const w = t > E.walk;
    const ha = act(t, [[0, 0, 0.5, 1], [E.walk, 0, 0.5, 1], [E.arrive, 0, 0.5, 22]], [[0, { yaw: 0, face: 'smug', wave: t < 4 }], [E.whistle, { yaw: 0, face: 'scared', headYaw: Math.sin(t * 2) * 0.6 }], [E.ticket, { yaw: 0, face: 'scared', headPitch: -0.5 }], [E.ticket + 6, { yaw: 0, face: 'smug', hold: true }], [E.scared, { yaw: 0.6, face: 'smug', headYaw: 0.8 }], [E.test, { yaw: 0.9, face: 'normal' }], [E.walk, { face: 'smug' }]]);
    pose(hero, { t, ...ha }); parentTo(ticket.parent, g); ticket.parent.visible = win(t, E.ticket, E.walk); if (t < E.ticket + 6) { const k = seg(t, E.ticket, E.ticket + 6); ticket.parent.position.set(Math.sin(t * 2.4) * 1.2 * (1 - k), lerp(9, 2.1, k), lerp(-3, 1.4, k)); ticket.parent.rotation.set(0, t * 2, Math.sin(t * 3) * 0.5); } else { parentTo(ticket.parent, hero.aR); ticket.parent.position.set(0, -0.8, 0.25); ticket.parent.rotation.set(-1.2, 0, 0); }
    const ba = act(t, [[0, 3, 0.5, 1.5], [E.scared, 3, 0.5, 1.5], [E.scared + 1, 0.4, 0.5, -0.6], [E.detector, 0.4, 0.5, -0.6], [E.detector + 1, 3, 0.5, 1.8], [E.walk + 0.6, 3, 0.5, 1.8], [E.arrive, 1.2, 0.5, 19]], [[0, { yaw: -1.2 }], [E.whistle, { yaw: -1.2, angry: true }], [E.scared + 1, { yaw: 0.4, facepalm: true }], [E.detector, {}], [E.detector + 1, { yaw: -0.6, hop: true }], [E.test, { yaw: faceTo([3, 0, 1.8], [-3, 0, 1.2]), handOut: true }], [E.test + 3, { yaw: faceTo([3, 0, 1.8], [0, 0, 1]), handOut: true }], [E.walk + 0.6, {}]]);
    poseBurble(bloop6, t, ba.p, ba.yaw, ba); bHat.visible = true; bHat.position.y = 1.2;
    const la = act(t, [[0, -3, 0.5, 1.2], [E.walk + 0.3, -3, 0.5, 1.2], [E.arrive, -1.4, 0.5, 20]], [[0, { yaw: 0.6 }], [E.walk + 0.3, {}]]); poseLurk(L6, t, la.p, la.yaw, la.walk ? 1.4 : win(t, E.whistle, E.ticket) ? 1.6 : 0.3);
    needle.rotation.z = -lerp(-1, 1, spookAt(t) ?? 0) + Math.sin(t * 30) * 0.05; mTip.visible = Math.floor(t * 4) % 2 === 0;
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: Hollow Hill Station (midnight; later the grand opening and the wild ride)
const OV = { rx: 46, rz: 20, cz: 20 };
const ovalP = a => [OV.rx * Math.sin(a), 0.5, OV.cz - OV.rz * Math.cos(a)], ovalYaw = a => Math.atan2(OV.rx * Math.cos(a), OV.rz * Math.sin(a)), ovalDs = a => Math.hypot(OV.rx * Math.cos(a), OV.rz * Math.sin(a));
// the wild ride: angle from a ramping speed, scaled so the train reaches the lake curve exactly at E.derail
const RIDE = (() => { const W_ = [[E.depart2, 0], [E.boo, 0.03], [E.lever, 0.04], [E.lever + 8, 0.45], [E.lever + 32, 0.62], [E.derail, 0.8]], A = []; let a = 0;
  for (let t = E.depart2; t <= E.derail + 0.001; t += 0.02) { A.push(a); a += lerpK(W_, t) * 0.02; } const k = (Math.floor(a / (2 * PI)) * 2 * PI + 5.2) / a; return t => A[Math.min(A.length - 1, Math.max(0, Math.round((t - E.depart2) / 0.02)))] * k; })();
const station = (() => {
  const g = mk('station'); const st = new VSet(g);
  for (let x = -60; x <= 60; x++) for (let z = -30; z <= 50; z++) { const lake = x >= -34 && x <= -18 && z >= -16 && z <= -4; st.add(x, 0, z, lake ? 'water' : 'turf'); }
  for (let x = -8; x <= 8; x++) for (let z = -7; z <= -3; z++) st.add(x, 1, z, 'castle');
  for (let y = 1; y <= 4; y++) for (let x = -4; x <= 4; x++) for (let z = -12; z <= -8; z++) { if (x > -4 && x < 4 && z > -12 && z < -8) continue; if (z === -8 && Math.abs(x) <= 1 && y <= 3) continue; st.add(x, y, z, y === 4 ? 'dark' : (x === -4 || x === 4) && (z === -12 || z === -8) ? 'log' : 'plank'); }
  for (let x = -5; x <= 5; x++) for (let z = -13; z <= -7; z++) st.add(x, 5, z, 'slate'); for (let y = 1; y <= 8; y++) for (const [x, z] of [[6, -9], [7, -9], [6, -8], [7, -8]]) st.add(x, y, z, 'stone');
  for (let dx = -12; dx <= 12; dx++) for (let dz = -12; dz <= 12; dz++) { const d = Math.hypot(dx, dz * 0.9); if (d > 12) continue; const h = Math.round(9 * Math.cos(d / 12 * PI / 2)); for (let y = 1; y <= h; y++) { if (Math.abs(dx) <= 3 && y <= 5) continue; st.add(46 + dx, y, 20 + dz, y === h ? 'turf' : 'stone'); } }
  for (const [x, z, h] of [[-20, -20, 5], [18, -22, 6], [-44, 0, 5], [22, 30, 5], [-14, 36, 6], [-50, 30, 6], [10, -16, 4]]) tree20(st, x, z, h, true);
  st.build();
  const N = 340, sl = new THREE.InstancedMesh(GEO, new THREE.MeshLambertMaterial({ color: '#4a3424' }), N), rl = new THREE.InstancedMesh(GEO, new THREE.MeshLambertMaterial({ color: '#9aa4bd' }), N * 2);
  for (let i = 0; i < N; i++) { const a = i / N * 2 * PI, p = ovalP(a), y = ovalYaw(a); _q.setFromEuler(_e.set(0, y, 0)); sl.setMatrixAt(i, _m.compose(_p.set(p[0], 0.55, p[2]), _q, _s.set(2.4, 0.12, 0.4)));
    for (const s of [-1, 1]) rl.setMatrixAt(i * 2 + (s > 0), _m.compose(_p.set(p[0] + Math.cos(y) * 0.75 * s, 0.68, p[2] - Math.sin(y) * 0.75 * s), _q, _s.set(0.14, 0.14, 1.0))); }
  g.add(sl, rl);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(5, 0.9, 0.12), new THREE.MeshBasicMaterial({ map: bannerTex('HOLLOW HILL') })); sign.position.set(0, 4.1, -7.9); g.add(sign);
  const sign2 = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.1, 0.12), new THREE.MeshBasicMaterial({ map: bannerTex('GHOST TRAIN!') })); sign2.position.set(0, 6.4, -7.4); g.add(sign2);
  const clockF = box(1.6, 1.6, 0.1, '#fff8e0', 6.5, 7.2, -7.45, g), hand = pivot(g, 6.5, 7.2, -7.38); box(0.08, 0.7, 0.04, '#111', 0, 0.3, 0, hand);
  const lanterns = Array.from({ length: 14 }, (_, i) => { const l = box(0.4, 0.5, 0.4, 0, -7.5 + (i % 7) * 2.5, i < 7 ? 3.2 : 6.0, i < 7 ? -3.2 : -7.2, g, i % 2 ? glowP : glowY); return l; });
  const bunt = new THREE.Group(); g.add(bunt); for (let i = 0; i < 20; i++) box(0.4, 0.5, 0.05, ['#ff8fd8', '#7ff5e6', '#ffe066'][i % 3], -7.6 + i * 0.8, 4.4 - Math.sin(i / 19 * PI) * 0.6, -3.2, bunt);
  const tape = box(16, 0.2, 0.05, '#e8344e', 0, 2.3, -3.1, g); const roofLamp = new THREE.PointLight('#ffd0a0', 0, 22, 1.2); roofLamp.position.set(0, 5, -2); g.add(roofLamp);
  for (let t = E.prep; t < E.prepEnd; t += 0.5) burst(t, [lerp(-7, 7, ((t - E.prep) * 0.37) % 1), 3.4, -3.4], { n: 5, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  burst(E.opening + 1, [0, 2.3, -3.1], { n: 80, colors: ['#ff8fd8', '#7ff5e6', '#ffe066'], speed: 6, size: 0.14, life: 1.6, grav: 4, up: 5 }); burst(E.trainIn, ovalP(-0.3), { n: 80, colors: ['#7ff5e6', '#ffffff'], speed: 4, size: 0.2, life: 2, grav: -1, up: 1 });
  const C = [[E.arrive, -30, 12, 20, -2, 2, -4, 54], [51.9, -26, 9, 16, -4, 2, -4, 52], [52, 6, 2.6, -0.6, -1, 2.2, -4.6, 46], [59.9, 5, 2.6, -1.0, 1, 2.2, -4.6, 44], [60, 9, 2.4, -3.6, 6.5, 6.5, -8, 52], [63.9, 9, 2.8, -2.8, 6.5, 6.5, -8, 50],
    [64, -4, 2.6, 3.4, -12, 1.6, 0, 50], [71.9, 0, 2.6, 4, 2, 1.6, -1, 50], [72, 4, 2.8, -0.6, 1, 2.6, -3.8, 44], [78.9, 4.2, 2.8, -0.2, 1, 2.6, -3.8, 40], [79, 5, 3, -6.6, 1, 2.2, -3.4, 44], [83.9, 4.6, 3, -6.2, 1, 2.2, -3.4, 42],
    [84, -2, 5, -7.5, -4, 1.6, 0, 52], [89.9, 0, 5, -7.5, -4, 1.6, 0, 50], [90, 24, 4, 2, 40, 2, 10, 50], [95.9, 26, 3.4, 2, 42, 2, 12, 48], [E.tunnel, 26, 3.4, 2, 42, 2, 12, 48],
    [E.prep, -14, 6, 8, 0, 2.4, -6, 52], [183.9, 14, 6, 8, 0, 2.4, -6, 52], [184, -12, 4, -13, -10, 1.2, -5, 48], [191.9, -8, 4, -13, -6, 1.2, -5, 48], [192, 0, 2.8, 0.8, 0, 2.6, -5, 44], [197.9, 0.6, 2.6, 0.2, 0, 2.6, -5, 42],
    [198, 7, 3.2, 4, 0, 1.6, -1, 50], [203.9, 6, 3.2, 4.4, -2, 1.6, -1, 50], [204, -5, 8, -17, 0, 5.8, -10, 50], [211.9, -4, 8.4, -18, 0, 5.8, -10, 46], [212, 11, 2.6, 4, 4, 2, 0, 50], [215.9, 10, 2.6, 4.4, 5, 2, 0, 50], [216, 9, 5, -6, 3, 3, -2, 50], [E.lever, 9, 5, -6, 4, 3, -1, 50]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = ribbon.visible = false; [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => d.visible = false); muffin.root.visible = puff.root.visible = bot.root.visible = false; sofie.root.visible = false;
    [twin, third, tock, wagon].forEach(o => (o.root || o).visible = false); [hero.root, bloop6.B.root, L6.root, wisp.root, train.root].forEach(o => parentTo(o, g)); card.visible = false; booth.visible = tarp.visible = false;
    const late = t > E.prep; hand.rotation.z = -(t < E.midnight ? 6.1 + seg(t, E.arrive, E.midnight) * 0.18 : 6.28 + (t - E.midnight) * 0.01);
    lanterns.forEach((l, i) => { l.visible = late && t > E.prep + i * 0.9; }); bunt.visible = sign2.visible = late && t > E.prep + 8; tape.visible = late && t < E.opening + 1; roofLamp.intensity = late ? 40 : 0;
    // train
    let ta, op = 0.75, roll = 0; if (!late) { ta = t < E.trainIn ? -9 : t < E.trainStop ? lerp(-0.45, 0, ss(seg(t, E.trainIn, E.trainStop))) : t < E.depart ? 0 : lerp(0, 1.3, seg(t, E.depart, E.tunnel) ** 1.6); op = t < E.trainIn ? 0 : Math.min(0.75, seg(t, E.trainIn, E.trainIn + 4)); roll = -ta * 30; }
    else ta = t < E.depart2 ? 0 : RIDE(Math.min(t, E.derail));
    train.root.visible = !late ? t > E.trainIn : true;
    const derailed = late && t > E.derail, D0 = ovalP(RIDE(E.derail)), Dy = ovalYaw(RIDE(E.derail)), fl = derailed ? t - E.derail : 0;
    const fn = d => { if (!derailed) { const a = ta - d / ovalDs(ta); return [ovalP(a), ovalYaw(a)]; } const fwd = fl * 13 - d; return [[D0[0] + Math.sin(Dy) * fwd, 0.5 + Math.max(0, fl * 5.2 - fl * fl * 0.55) + Math.sin(fl * 3 + d) * 0.1, D0[2] + Math.cos(Dy) * fwd], Dy + Math.sin(fl * 2 + d * 0.2) * 0.1]; };
    placeTrain(fn, late ? -ta * 30 : roll, op); train.lever.rotation.x = t > E.lever ? -1 : 0.5; train.lever.visible = !(late && t > E.snap);
    // hero
    let H_; if (!late) { const a = act(t, [[E.arrive, -16, 0.5, -5], [50, -9, 0.5, -5], [51, -8, 1.5, -5], [56, -1, 1.5, -4.6], [60, 0.4, 1.5, -4.6]], [[0, { face: 'scared' }], [60, { yaw: 2.2, face: 'scared', headPitch: -0.3 }], [E.trainIn, { yaw: -2.0, face: 'scared' }], [E.wisp, { yaw: faceTo([0.4, 0, -4.6], [1.4, 0, -2.8]), face: 'scared' }], [E.punch, { yaw: faceTo([0.4, 0, -4.6], [1.4, 0, -2.8]), face: 'smug', hold: true }]]);
        H_ = a; if (t > E.board) { const k = seg(t, E.board, E.board + 2); H_ = { p: L3([0.4, 1.5, -4.6], inCar(1, SEATS[0]), k), yaw: train.cars[1].rotation.y, sit: k, face: 'smug', wave: t > E.depart }; } }
    else { const a = act(t, [[E.prep, -6, 1.5, -4], [E.prep + 7, 6, 1.5, -4], [E.prep + 14, -2, 1.5, -5]], [[0, { face: 'smug', swing: t * 1.6 }], [E.crowd, { yaw: -1.6, face: 'smug', wave: true }], [E.opening, { yaw: 0.2, face: 'smug' }]]); H_ = a;
      if (t > E.board2) { const k = seg(t, E.board2, E.board2 + 2); H_ = { p: L3([-2, 1.5, -5], inCar(1, SEATS[0]), k), yaw: train.cars[1].rotation.y, sit: k, face: t > E.lever ? 'scared' : 'smug', panic: t > E.lever && t < E.climb, wave: win(t, E.hit, E.hit + 4) }; }
      if (t > E.climb) { const k = seg(t, E.climb, E.climb + 4); H_ = { p: L3(inCar(1, SEATS[0]), inLoco([0.3, 1.2, -1.3]), k), yaw: train.loco.rotation.y, face: 'scared', walk: k < 1 ? 1 : 0, phase: t * 9, panic: k >= 1 }; H_.p[1] += Math.sin(k * PI) * 1.2; } }
    pose(hero, { t, ...H_ }); lanternH.visible = !late; heroLight.intensity = late ? 0 : 12;
    // Bloop: scared with the meter; carried aboard; later the sheet, the roof, BOO
    let bp, by, bo = {}; meter.visible = !late || t < E.sheet; sheetB.visible = late && t > E.sheet;
    if (!late) { const a = act(t, [[E.arrive, -18, 0.5, -5.8], [50.6, -10, 0.5, -5.8], [51.6, -9, 1.5, -5.8], [57, -3, 1.5, -5.6], [60, -1.6, 1.5, -5.6]], [[0, { handOut: true }], [E.midnight, { yaw: 1.2, handOut: true, angry: t < E.midnight + 2 }], [E.trainIn, { yaw: 2.2, angry: true }]]); bp = a.p; by = a.yaw; bo = a;
      if (t > E.faint) { bp = [-1.6, 1.5, -5.6]; bo = {}; } if (t > E.board + 0.6) { bp = null; } }
    else { const a = act(t, [[E.prep, 4, 1.5, -6], [E.prep + 6, -4, 1.5, -6], [E.prep + 12, 3, 1.5, -6]], [[0, { hop: true }], [E.crowd, { yaw: -1.4 }]]); bp = a.p; by = a.yaw; bo = a;
      if (t > E.sheet) { const k = seg(t, E.sheet, E.sheet + 3); bp = L3([3, 1.5, -6], [0, 5.5, -10], k); bp[1] += Math.sin(k * PI) * 2; by = 0; bo = { hop: t > E.sheet + 3 }; }
      if (t > E.boo) { const k = seg(t, E.boo, E.boo + 1.2); bp = L3([0, 5.5, -10], inLoco([0, 3.3, -1.3]), k); bp[1] += Math.sin(k * PI) * 3; by = train.loco.rotation.y; bo = { angry: true }; } }
    const fainted = !late && t > E.faint;
    if (bp) { poseBurble(bloop6, t, bp, by, bo); if (fainted) { bloop6.B.root.rotation.z = PI / 2; bloop6.B.root.position.y += 0.4; } bloop6.B.root.visible = true; } else bloop6.B.root.visible = false;
    bHat.visible = true; bHat.position.y = 1.2;
    // Leggy (carries fainted Bloop aboard)
    let lp, ly, ls = 0.3; if (!late) { const a = act(t, [[E.arrive, -19, 0.5, -4.2], [51, -10.6, 0.5, -4.2], [52, -9.4, 1.5, -4.2], [58, -3.6, 1.5, -3.8], [E.board, -3.6, 1.5, -3.8], [E.board + 2.4, ...inCar(1, [0, 0.9, -0.6])]], [[0, {}], [E.midnight, { yaw: 1.4 }], [E.board, {}]]); lp = a.p; ly = a.walk ? a.yaw : (t > E.board + 2.4 ? train.cars[1].rotation.y : a.yaw ?? 1.4); ls = a.walk ? 1.4 : 0.3; if (t > E.board + 2.4) lp = inCar(1, [0, 0.9, -0.6]); }
    else { const a = act(t, [[E.prep, -6, 1.5, -5.4], [E.prep + 13, -6, 1.5, -5.4]], [[0, { yaw: 0.4 }]]); lp = a.p; ly = 0.4; if (t > E.board2) { lp = L3([-6, 1.5, -5.4], inCar(1, [0, 0.9, -0.6]), seg(t, E.board2, E.board2 + 2.4)); ly = train.cars[1].rotation.y; } ls = t > E.brake && t < E.climb ? 3 : t > E.lever ? 1.4 : 0.3; }
    poseLurk(L6, t, lp, ly, ls);
    if (!late && t > E.board + 0.6) { bloop6.B.root.visible = true; parentTo(bloop6.B.root, g); const bpp = t > E.board + 2.4 ? inCar(1, [0, 2.3, -0.6]) : [lp[0], lp[1] + 1.9, lp[2]]; poseBurble(bloop6, t, bpp, ly, {}); bloop6.B.root.rotation.z = PI / 2; }
    // Wisp
    let wp, wy = 0, wo = {}; wisp.root.visible = !late ? t > E.trainStop - 1 : true;
    if (!late) { wp = inLoco([0, 1.2, -1.3]); wy = train.loco.rotation.y; if (win(t, E.wisp, E.board + 1)) { wp = L3(inLoco([0, 1.2, -1.3]), [1.4, 1.5, -2.8], seg(t, E.wisp, E.wisp + 1.4)); wy = faceTo([1.4, 0, -2.8], [0.4, 0, -4.6]); wo = { punch: win(t, E.punch, E.punch + 1.4), wave: t < E.wisp + 3 }; } }
    else { wp = [3.4, 1.5, -4.2]; wy = -0.6; wo = { happy: true, hop: win(t, E.crowd, E.crowd + 4) || win(t, E.opening + 1, E.opening + 4) }; if (t > E.board2) { wp = inLoco([0, 1.2, -1.3]); wy = train.loco.rotation.y; wo = { happy: true, wave: t < E.depart2 + 2, lever: true }; }
      if (t > E.boo) wo = { panic: true, lever: t > E.lever }; if (t > E.lever) { wp = inLoco([0, 1.6 + Math.min(1, t - E.lever), -1.3]); } if (t > E.snap) wo = { panic: true, spin: win(t, E.snap, E.snap + 1) }; }
    poseWisp(wisp, t, wp, wy, wo);
    // the crowd: Duke Fluffington, Team Lumpy, fans
    const crowdOn = late && t > E.crowd; [duke, ...lumpy, ...fans].forEach((c, i) => { c.root.visible = crowdOn; if (!crowdOn) return; parentTo(c.root, g); const k = seg(t, E.crowd + i * 0.3, E.crowd + 4 + i * 0.3);
      let p = L3([-24 - i, 0.5, -5], i < 4 ? [-6 + i * 1.6, 1.5, -6.4] : [-7 + (i - 4) * 1.9, 1.5, -6.2 + ((i % 2) ? -0.6 : 0)], k), y = k < 1 ? PI / 2 : 0, o = { hop: k < 1 || win(t, E.opening + 1, E.opening + 4), seed: i, mega: i === 0 && win(t, E.opening - 2, E.opening + 2) };
      if (i === 0 && win(t, E.opening - 2, E.board2)) { p = [0, 1.5, -4.2]; y = 0; }
      if (i < 4 && t > E.board2) { const q = seg(t, E.board2 + 0.4 * i, E.board2 + 2 + 0.4 * i); p = L3(p, inCar(0, SEATS[i]), q); p[1] += Math.sin(q * PI); y = train.cars[0].rotation.y; o = { wave: t > E.hit, hop: false, seed: i }; if (q >= 1) p = inCar(0, [SEATS[i][0], 1.0, SEATS[i][2]]); }
      if (i >= 4) { const near = Math.hypot(train.loco.position.x, train.loco.position.z + 2) < 14; o = { hop: (t > E.depart2 && near) || win(t, E.hit, E.hit + 6), wave: t > E.lever && i % 2, seed: i }; }
      poseCushion(c, t, p, y, o); });
    // flapper jump-scare
    flappers.forEach((f, i) => { f.root.visible = !late && i < 3 && win(t, E.lantern, E.lantern + 2.2); if (!f.root.visible) return; parentTo(f.root, g); const k = seg(t, E.lantern, E.lantern + 2.2); poseFlap(f, t, [lerp(0, 4, k) + i, 3 + k * 4 + i * 0.4, lerp(-9, -2, k)], 0.4, i); });
    // camera
    let cam = camKeys(t, C);
    if (late && t > E.lever) { const L = train.loco.position, yy = train.loco.rotation.y, side = [Math.cos(yy), 0, -Math.sin(yy)], fw = [Math.sin(yy), 0, Math.cos(yy)];
      const o = t < E.hit ? [side[0] * 9 - fw[0] * 6, 4, side[2] * 9 - fw[2] * 6] : t < E.hit + 6 ? null : t < E.brake ? [fw[0] * 12 + side[0] * 3, 3, fw[2] * 12 + side[2] * 3] : t < E.climb ? [-side[0] * 7 - fw[0] * 3, 2.4, -side[2] * 7 - fw[2] * 3] : t < E.warn ? [side[0] * 6 - fw[0] * 9, 6, side[2] * 6 - fw[2] * 9] : t < E.derail ? [side[0] * 12 + fw[0] * 6, 5, side[2] * 12 + fw[2] * 6] : [side[0] * 10 - fw[0] * 3, 3, side[2] * 10 - fw[2] * 3];
      cam = o ? { p: [L.x + o[0], L.y + o[1], L.z + o[2]], l: [L.x - fw[0] * 4, L.y + 1.6, L.z - fw[2] * 4], fov: 56 } : { p: [-2, 2.4, -6.6], l: [L.x, 1.6, L.z], fov: 58 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: inside the tunnel (the ride; Wisp's lonely platform)
const pitY = x => x > 185 && x < 215 ? -4 * Math.sin((x - 185) / 30 * PI) : 0;
const tunnel = (() => {
  const g = mk('tunnel'); const st = new VSet(g);
  for (let x = -24; x <= 262; x++) { const room = x >= 232, zr = room ? 9 : 4, top = room ? 10 : 6, fy = Math.round(pitY(x));
    for (let z = -zr; z <= zr; z++) { st.add(x, fy, z, Math.abs(z) <= 1 ? 'dark' : 'stone'); st.add(x, top, z, 'dark'); if (Math.abs(z) === zr) for (let y = fy + 1; y < top; y++) st.add(x, y, z, hash2(x, y, z) < 0.15 ? 'ore' : 'stone'); } }
  for (let y = 0; y <= 10; y++) for (let z = -9; z <= 9; z++) st.add(262, y, z, 'stone');
  for (let x = 236; x <= 252; x++) for (let z = 3; z <= 8; z++) st.add(x, 1, z, 'plank'); for (let r = 0; r < 3; r++) for (let x = 238; x <= 250; x += 2) st.add(x, 2, 5 + r, 'log');
  // the skull rock
  for (let y = 1; y <= 5; y++) for (let x = 77; x <= 83; x++) st.add(x, y, 3, 'basalt');
  st.build();
  const glow = new THREE.Group(); g.add(glow); for (let x = -20; x < 232; x += 7) { const s = x % 14 ? 1 : -1; box(0.3, 0.5, 0.3, 0, x, pitY(x) + 0.75, s * 3.2, glow, x % 21 ? glowC : glowP); box(0.6, 0.2, 0.6, 0, x, pitY(x) + 1.05, s * 3.2, glow, x % 21 ? glowC : glowP); if (x % 15 < 7) box(0.4, 0.5, 0.4, 0, x, 5.3, 0, glow, glowY); }
  const skEyes = [79, 81].map(x => box(1.0, 0.8, 0.2, 0, x, 4.0, 2.4, g, glowP)), jaw = pivot(g, 80, 2.0, 2.5); box(6, 1, 0.6, '#3a3040', 0, -0.5, 0, jaw); for (let i = -2; i <= 2; i++) box(0.4, 0.4, 0.3, '#f4f4f0', i * 1.1, 0.1, 0.1, jaw);
  const chair = new THREE.Group(); g.add(chair); box(1, 0.2, 1, '#8a5a2b', 0, 1.0, 0, chair); box(1, 1.2, 0.2, '#8a5a2b', 0, 1.6, -0.45, chair); for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) box(0.12, 0.6, 0.12, '#6a4020', x, 0.6, z, chair); chair.position.set(246, 1, 6.6); chair.rotation.y = PI;
  const poster = new THREE.Mesh(new THREE.BoxGeometry(5, 1.0, 0.1), new THREE.MeshBasicMaterial({ map: bannerTex('OPENING DAY?') })); poster.position.set(244, 4.4, 8.8); poster.rotation.y = PI; g.add(poster);
  const roomL = new THREE.PointLight('#ffd8a0', 0, 30, 1.2); roomL.position.set(244, 7, 2); g.add(roomL);
  burst(E.hug + 0.6, [245, 3, 5.4], { n: 70, colors: ['#ff8fd8', '#ffffff', '#ffe066'], speed: 4, size: 0.14, life: 1.4, grav: 1, up: 3 });
  const X = [[E.tunnel, 0], [E.skull, 60], [E.flappers, 118], [E.drop, 180], [E.drop + 4, 214], [E.stop, 240], [E.back, 240], [E.prep, 40]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = ribbon.visible = sheetB.visible = false; [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => d.visible = false); muffin.root.visible = puff.root.visible = bot.root.visible = sofie.root.visible = false;
    [twin, third, tock, wagon, duke, ...lumpy, ...fans].forEach(o => (o.root || o).visible = false); [hero.root, bloop6.B.root, L6.root, wisp.root, train.root].forEach(o => parentTo(o, g)); card.visible = false; lanternH.visible = true; heroLight.intensity = 10; meter.visible = true;
    const x = lerpK(X, t), fn = d => [[x - d, pitY(x - d) + 0.5, 0], PI / 2 + (pitY(x - d + 1) - pitY(x - d - 1)) * 0]; train.root.visible = true; placeTrain(fn, -x * 2.2); train.lever.visible = true;
    const tilt = d => -Math.atan2(pitY(x - d + 1) - pitY(x - d - 1), 2); train.loco.rotation.x = 0; train.loco.rotation.set(tilt(0), PI / 2, 0, 'YXZ'); train.cars.forEach((c, i) => c.rotation.set(tilt(-CARZ[i]), PI / 2, 0, 'YXZ'));
    roomL.intensity = t > E.stop - 2 && t < E.back + 3 ? 40 : 0; jaw.rotation.x = Math.abs(x - 80) < 14 ? -0.6 * (1 - Math.abs(x - 80) / 14) * 1.6 : 0; skEyes.forEach(e => e.visible = Math.abs(x - 80) < 16);
    const off = t > E.stop + 1 && t < E.back - 1;
    // hero in car 2 (or on the lonely platform)
    if (!off) pose(hero, { t, p: inCar(1, SEATS[0]), yaw: PI / 2, sit: 1, face: win(t, E.skull, E.drop + 4) ? 'scared' : 'smug', panic: win(t, E.skull + 2, E.skull + 5) || win(t, E.flappers, E.flappers + 4) || win(t, E.drop, E.drop + 4), headYaw: win(t, E.skull, E.skull + 2) ? 1 : 0 });
    else { const a = act(t, [[E.stop + 1, 231, 0.5, 2.0], [E.stop + 3, 239, 0.5, 2.4], [E.stop + 3.5, 240, 1.5, 3.6], [E.twist, 241.6, 1.5, 4.0]], [[0, { face: 'smug' }], [E.twist, { yaw: faceTo([241.6, 0, 4], [246, 0, 6.4]), face: 'normal' }], [E.plan, { yaw: faceTo([241.6, 0, 4], [246, 0, 6.4]), face: 'smug', wave: true }]]); pose(hero, { t, ...a }); }
    // Leggy (hugs Wisp)
    if (!off) poseLurk(L6, t, inCar(1, [0, 0.9, -0.6]), PI / 2, win(t, E.flappers, E.flappers + 6) ? 3 : 0.3);
    else { const a = act(t, [[E.stop + 1, 227, 0.5, 2.2], [E.stop + 3.6, 237, 0.5, 2.4], [E.stop + 4.2, 238, 1.5, 4.6], [E.hug, 238, 1.5, 4.6], [E.hug + 1.6, 244.6, 1.5, 5.4]], [[0, {}], [E.stop + 4, { yaw: 0.8 }], [E.hug, {}], [E.hug + 1.6, { yaw: PI / 2 }]]); poseLurk(L6, t, a.p, a.yaw, a.walk ? 1.4 : win(t, E.hug + 1.6, E.plan) ? 1.6 : 0.3); }
    // Bloop: fainted in car 2; wakes, sees Wisp, faints again; then decides
    const wake = win(t, E.plan + 2, E.faint2); const bl = inCar(1, [0, 2.3, -0.6]); let bo = {}; if (wake) { bo = { angry: true }; } poseBurble(bloop6, t, wake ? inCar(1, [0, 1.15, -1.0]) : bl, PI / 2, bo); bloop6.B.root.rotation.z = wake ? 0 : PI / 2; if (t > E.faint2 + 2.5) { bloop6.B.root.rotation.z = 0; poseBurble(bloop6, t, inCar(1, [0, 1.15, -1.0]), PI / 2, { hop: t > E.back + 1 }); }
    bHat.visible = true; bHat.position.y = 1.2;
    // Wisp: drives; then sits alone; the hug makes him glow
    let wp = inLoco([0, 1.2, -1.3]), wy = PI / 2, wo = { look: win(t, E.skull, E.drop) ? -1 : 0, lever: true };
    if (off) { const k = seg(t, E.stop + 1, E.stop + 3); wp = L3(inLoco([0, 1.2, -1.3]), [246, 1.6, 6.6], k); wy = lerp(PI / 2, 0, k); wo = { sad: t > E.stop + 3 && t < E.hug + 1, fade: t < E.hug ? 0.85 : 0.95, happy: t > E.hug + 1, hop: win(t, E.plan, E.plan + 4), wave: win(t, E.faint2 - 2, E.back - 1) }; }
    if (t > E.back) wo = { happy: true, lever: true }; poseWisp(wisp, t, wp, wy, wo);
    // flappers swarm past
    flappers.forEach((f, i) => { const k = (t - E.flappers - i * 0.18) / 5; f.root.visible = k > 0 && k < 1; if (!f.root.visible) return; parentTo(f.root, g); const r = rng(220 + i); poseFlap(f, t, [x + 14 - k * 30, 2.4 + r() * 2.6 + Math.sin(t * 5 + i) * 0.3, (r() - 0.5) * 5], -PI / 2, i); });
    // camera
    const L = train.loco.position; let cam;
    if (off) cam = camKeys(t, [[E.stop + 1, 230, 3.4, -4, 240, 2, 3, 52], [E.twist - 0.1, 234, 3.2, -5, 244, 2, 4, 50], [E.twist, 248.5, 3.4, -1.5, 245, 2.2, 6, 46], [E.hug - 0.1, 248.2, 3.4, -1.0, 245, 2.2, 6, 42], [E.hug, 240, 6.4, -4, 243, 2.2, 5.4, 50], [E.plan - 0.1, 241, 6.2, -4, 243, 2.2, 5.4, 48],
      [E.plan, 244, 3, -1.6, 242, 2.2, 4.6, 48], [E.plan + 2, 236, 3, -2.6, 230, 2.6, 0, 46], [E.faint2 + 2.5, 236.6, 3, -2.2, 230, 2.6, 0, 44], [E.faint2 + 2.6, 243, 4, -3, 240, 2, 3, 50], [E.back - 1, 243, 4, -3, 240, 2, 3, 50]]);
    else if (win(t, E.drop - 0.5, E.drop + 4)) cam = { p: [L.x + 9, Math.max(L.y + 2.2, 1.2), 1.6], l: [L.x - 3, L.y + 1.4, 0], fov: 58 };
    else if (win(t, E.skull, E.flappers)) cam = { p: [L.x - 12, 3.4, -2.8], l: [L.x + 6, 2.4, 2], fov: 56 };
    else if (win(t, E.stop - 2, E.stop + 1)) cam = { p: [244, 3.8, -6], l: [L.x - 4, 2, 0], fov: 54 };
    else if (t > E.back) cam = { p: [L.x - 14.6, 2.6, 2.4], l: [L.x - 8, 1.8, 0], fov: 56 };
    else cam = { p: [L.x - 15.4, 3.0, -2.4], l: [L.x - 4, 1.6, 0.4], fov: 56 };
    return { cam, hud: true, cave: true };
  }
  return { g, update };
})();
