// ---------------------------------------------------------------- Ep 24 helpers: Lumen the lantern-fish, Barnaby the keeper, the lighthouse, the boat, the yacht, rain
function hide23() { hideOld(); [whisk, fork, shardJar, bowl, goldWhisk, brickCake, pie, egg.parent, yolk, envelope, crumbs.root, judge23.root].forEach(o => o.visible = false); [duke, ...lumpy, ...fans].forEach(c => c.root.visible = false); }
const lureM = new THREE.MeshBasicMaterial({ color: '#fff3a0' });
function makeLumen() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), sk = '#1e5a6a';
  box(2.0, 1.3, 1.6, sk, 0, 0, 0, body); box(1.8, 0.4, 1.4, '#7fb8b0', 0, -0.5, 0.05, body); box(0.12, 0.6, 1.0, '#2a7a8a', 0, 0.85, -0.2, body);
  for (const x of [-0.62, 0.62]) { box(0.5, 0.5, 0.06, '#ffffff', x, 0.3, 0.81, body); } const pupils = [-0.62, 0.62].map(x => box(0.24, 0.26, 0.07, '#111', x, 0.28, 0.84, body));
  const jaw = pivot(body, 0, -0.3, 0.8); box(1.9, 0.4, 0.3, '#174a58', 0, -0.2, 0.05, jaw); for (let i = 0; i < 7; i++) box(0.12, 0.2, 0.08, '#ffffff', -0.8 + i * 0.27, 0.05, 0.2, jaw); for (let i = 0; i < 6; i++) box(0.1, 0.16, 0.08, '#ffffff', -0.68 + i * 0.27, -0.42, 0.82, body);
  const tail = pivot(body, 0, 0, -0.8); box(0.1, 1.2, 0.9, '#2a7a8a', 0, 0, -0.45, tail); const fins = [-1, 1].map(s => { const p = pivot(body, s * 1.0, -0.1, 0.1); box(0.5, 0.06, 0.6, '#2a7a8a', s * 0.25, 0, 0, p); return p; });
  const lure = pivot(body, 0, 0.65, 0.5); box(0.08, 1.0, 0.08, '#2a7a8a', 0, 0.5, 0, lure); const tip = pivot(lure, 0, 1.0, 0); box(0.08, 0.08, 0.7, '#2a7a8a', 0, 0, 0.35, tip); const bulb = box(0.42, 0.42, 0.42, 0, 0, -0.1, 0.75, tip, lureM);
  const light = new THREE.PointLight('#fff1a0', 20, 16, 1.3); bulb.add(light); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, pupils, jaw, tail, fins, lure, tip, bulb, light }; }
function poseLumen(f, t, p, yaw, o = {}) { const m = o.mood ?? 0.5, ex = o.excited || 0; f.root.position.set(p[0], p[1] + Math.sin(t * (1.5 + ex * 6)) * (0.12 + ex * 0.3), p[2]); f.root.rotation.set(o.roll || 0, yaw + Math.sin(t * 0.8) * 0.2 + (o.spin ? t * 8 : 0), o.flip || 0);
  f.tail.rotation.y = Math.sin(t * (4 + m * 6 + ex * 16)) * (0.3 + m * 0.3); f.fins.forEach((q, i) => q.rotation.z = Math.sin(t * (5 + ex * 10) + i * PI) * 0.4); f.body.rotation.x = m < 0.3 ? 0.25 : 0;
  f.jaw.rotation.x = o.chomp ? Math.abs(Math.sin(t * 9)) * 0.7 : m > 0.7 ? 0.25 : 0.05; f.lure.rotation.x = (m < 0.3 ? 0.7 : 0) + Math.sin(t * 2) * 0.1 + (ex ? Math.sin(t * 12) * 0.4 : 0); f.pupils.forEach(q => q.scale.y = m < 0.3 ? 0.35 : 1);
  const pw = clamp(o.power ?? m, 0, 3); lureM.color.setRGB(1, 0.85 + Math.min(1, pw) * 0.15, 0.45 + Math.min(1, pw) * 0.4).multiplyScalar(0.35 + Math.min(1, pw) * 0.65); f.light.intensity = 6 + pw * 40; f.bulb.scale.setScalar(0.8 + Math.min(pw, 2) * 0.3); }
const lumen = makeLumen();
function makePelican() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 1.2, 1.1, '#f4f4f0', 0, 1.3, 0, body); const hd = pivot(body, 0, 2.0, 0.2); box(0.6, 0.6, 0.6, '#f4f4f0', 0, 0.2, 0, hd); for (const x of [-0.18, 0.18]) box(0.1, 0.12, 0.04, '#111', x, 0.3, 0.31, hd);
  const beak = pivot(hd, 0, 0.1, 0.3); box(0.3, 0.14, 1.2, '#ff9a2a', 0, 0.05, 0.6, beak); const pouch = box(0.28, 0.4, 0.9, '#ffb86a', 0, -0.18, 0.5, beak);
  const cap = pivot(hd, 0, 0.55, 0); box(0.64, 0.2, 0.64, '#1b2a4a', 0, 0, 0, cap); box(0.66, 0.06, 0.4, '#1b2a4a', 0, -0.08, 0.4, cap); box(0.65, 0.06, 0.65, '#ffffff', 0, 0.08, 0, cap);
  const wL = pivot(body, -0.5, 1.7, 0), wR = pivot(body, 0.5, 1.7, 0); box(0.12, 0.9, 0.8, '#e0e0dc', 0, -0.4, 0, wL); box(0.12, 0.9, 0.8, '#e0e0dc', 0, -0.4, 0, wR);
  const lL = pivot(root, -0.22, 0.7, 0), lR = pivot(root, 0.22, 0.7, 0); for (const l of [lL, lR]) { box(0.12, 0.7, 0.12, '#ff9a2a', 0, -0.35, 0, l); box(0.3, 0.06, 0.4, '#ff9a2a', 0, -0.68, 0.1, l); }
  const bag = pivot(beak, 0, -0.4, 1.0); box(0.6, 0.5, 0.3, '#8a3a2a', 0, -0.2, 0, bag); const keys = box(0.2, 0.3, 0.05, '#ffd23f', 0, -0.3, 1.1, beak);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hd, beak, pouch, wL, wR, lL, lR, bag, keys }; }
function posePelican(b, t, p, yaw, o = {}) { const w = o.walk || 0; b.root.position.set(p[0], p[1], p[2]); b.root.rotation.set(o.fly ? 0.3 : 0, yaw, 0);
  const fl = o.fly ? Math.sin(t * 14) * 1.1 : o.flap ? Math.sin(t * 10) * 0.6 : 0.1; b.wL.rotation.z = -fl - (o.fly ? 0.4 : 0); b.wR.rotation.z = fl + (o.fly ? 0.4 : 0); b.lL.rotation.x = Math.sin(t * 8) * 0.6 * w; b.lR.rotation.x = -Math.sin(t * 8) * 0.6 * w;
  b.beak.rotation.x = o.talk ? -Math.abs(Math.sin(t * 9)) * 0.35 : 0; b.hd.rotation.set(o.nod ? Math.sin(t * 4) * 0.2 : 0, o.look || 0, 0); b.bag.visible = !!o.bag; b.keys.visible = !!o.keys; }
const barnaby = makePelican();
// the beam (bay exterior) and the inner beam (lamp room)
const beamM = new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
function makeBeam(len, w) { const p = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(w, w, len), beamM); b.position.z = len / 2; p.add(b); const b2 = b.clone(); b2.rotation.y = 0; b2.position.z = -len / 2; p.add(b2); return p; }
const beamBay = makeBeam(90, 3), beamRoom = makeBeam(30, 0.7);
// Bloop's motorboat, Duke's yacht, the disco reflector, shrimp bucket, rain
function makeBoat() { const g = new THREE.Group(); box(2.4, 0.6, 4.6, '#c08a40', 0, 0.1, 0, g); for (const x of [-1.2, 1.2]) box(0.16, 0.5, 4.6, '#8a5a2b', x, 0.6, 0, g); box(2.4, 0.5, 0.16, '#8a5a2b', 0, 0.6, -2.3, g); box(1.2, 0.5, 0.6, '#8a5a2b', 0, 0.4, 2.4, g);
  const mot = pivot(g, 0, 0.4, -2.6); box(0.6, 0.8, 0.6, '#ffd400', 0, 0.3, 0, mot); box(0.62, 0.2, 0.62, '#e8344e', 0, 0.6, 0, mot); box(0.1, 0.8, 0.1, '#555', 0, -0.4, 0, mot); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, mot }; }
const boat = makeBoat();
function makeYacht() { const g = new THREE.Group(); box(5, 1.4, 12, '#f4f4f0', 0, 0.4, 0, g); box(4.4, 0.2, 11, '#ff9ad0', 0, 1.15, 0, g); box(3.2, 2, 4, '#ffe8f4', 0, 2.2, -2.4, g); box(3.4, 0.3, 4.2, '#ff6fb8', 0, 3.3, -2.4, g); box(0.2, 5, 0.2, '#c0c0c8', 0, 4.8, 1, g); box(0.1, 1, 1.8, '#ff6fb8', 0, 6.4, 1.9, g);
  box(1.2, 0.8, 0.2, 0, -1.2, 2.4, -0.38, g, glowY); box(1.2, 0.8, 0.2, 0, 1.2, 2.4, -0.38, g, glowY); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const yacht = makeYacht();
const disco = new THREE.Group(); { const cols = ['#ffffff', '#c8d8ff', '#ffe8f8', '#d8fff8']; for (let i = 0; i < 26; i++) { const a = i / 26 * PI * 2, y = (i % 3 - 1) * 0.3; box(0.28, 0.28, 0.06, 0, Math.cos(a) * 0.5, y, Math.sin(a) * 0.5, disco, new THREE.MeshBasicMaterial({ color: cols[i % 4] })).lookAt(0, y, 0); } box(0.85, 0.85, 0.85, '#9aa4bd', 0, 0, 0, disco); box(0.04, 2, 0.04, '#ccc', 0, 1.4, 0, disco); }
const bucket24 = new THREE.Group(); box(0.6, 0.6, 0.6, '#3d7bff', 0, 0, 0, bucket24); const shrimp = []; for (let i = 0; i < 5; i++) shrimp.push(box(0.14, 0.12, 0.3, '#ff8a6a', -0.2 + (i % 3) * 0.2, 0.34, -0.1 + (i >> 1) * 0.15, bucket24)); const boot24 = box(0.3, 0.4, 0.5, '#5a3a22', 0, 0.4, 0, bucket24);
hero.aR.add(bucket24); bucket24.position.set(0, -0.95, 0.2);
const rainMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), new THREE.MeshBasicMaterial({ color: '#a8c8ff', transparent: true, opacity: 0.5, fog: false }), 400); rainMesh.frustumCulled = false;
function updateRain(t, c, on) { rainMesh.visible = on; if (!on) return; for (let i = 0; i < 400; i++) { const x = (hash2(i, 1, 7) - 0.5) * 40, z = (hash2(i, 2, 7) - 0.5) * 40, y = 20 - ((t * 24 + hash2(i, 3, 7) * 20) % 20);
  _m.compose(_p.set(c[0] + x, c[1] - 6 + y, c[2] + z), _q.setFromEuler(_e.set(0.2, 0, 0.15)), _s.set(1, 1, 1)); rainMesh.setMatrixAt(i, _m); } rainMesh.instanceMatrix.needsUpdate = true; }
// HUD: light power; the keeper's rules
const powerAt = t => t < E.lamp ? null : t < E.reveal ? 0.6 : t < E.jokes ? lerp(0.6, 0.3, seg(t, E.sad, E.storm)) : t < E.disco ? 0.25 : t < E.dance ? 0.15 : t < E.feed ? 0.35 : t < E.leggy ? 0.7 : t < E.discoUse ? 1 : t < E.calm ? 2 : t < E.excite ? 1 : Math.min(3, 1 + seg(t, E.excite, E.excite + 6) * 2);
function drawLight(t) { const v = powerAt(t); if (v === null || t >= E.freeze) return; rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(10,24,40,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff3a0'; ctx.stroke(); outlined('LIGHT POWER', 132, 114, 15, '#fff3a0', '#000', 3);
  rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const pc = Math.min(1, v); rrect(36, 130, Math.max(16, 192 * pc), 20, 8); ctx.fillStyle = v > 1.5 ? (Math.floor(t * 8) % 2 ? '#ffffff' : '#ffe066') : v > 0.6 ? '#ffe066' : v > 0.3 ? '#ffa02a' : '#ff4a5a'; ctx.fill();
  outlined(Math.round(v * 100) + '%' + (v > 1.5 ? '  TOO BRIGHT' : v < 0.3 ? '  (fish sad)' : ''), 132, 168, 16, '#fff', '#000', 4); }
function drawRules(T) { const k = ss(seg(T, E.keys + 0.6, E.keys + 1)) * (1 - ss(seg(T, E.fly - 0.6, E.fly - 0.2))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 60); ctx.rotate(-0.03); ctx.fillStyle = '#f6efe0'; ctx.fillRect(-220, -180, 440, 340); ctx.fillStyle = '#1b2a4a'; ctx.fillRect(-220, -180, 440, 56);
  outlined("KEEPER'S RULES", 0, -152, 30, '#ffffff', '#1b2a4a', 3); ctx.font = F(24); ctx.textAlign = 'left'; const R = [[1.2, '1. Keep the light ON.', '#22305a'], [2.6, '2. Feed Lumen.', '#22305a'], [4.0, '3. Do NOT let Lumen', '#c0182a'], [4.0, '    get EXCITED.', '#c0182a']];
  R.forEach(([d, s, c], i) => { if (T < E.keys + d) return; ctx.fillStyle = c; ctx.fillText(s, -190, -70 + i * 50); }); if (T > E.keys + 5.6) outlined('(who is Lumen?)', 0, 136, 18, '#777', '#f6efe0', 2); ctx.restore(); }

// ================================================================ EPISODE 24: "THE LIGHTHOUSE (the light is a fish)" — the dock at sunset (Barnaby's rules; Bloop's boat) → the bay (storm; the yacht; the rocks) ⇄ the lamp room (Lumen) → dawn (Lumen gets excited)
// ---------------------------------------------------------------- set A: the bay (dock, sea, island, lighthouse, rocks, yacht)
const LH = [0, 0, -50], LAMP = [0, 21.6, -50];
const bay = (() => {
  const g = mk('bay'); seaSet(g); const st = new VSet(g);
  for (let x = -34; x <= 34; x++) for (let z = 30; z <= 60; z++) st.add(x, 0, z, 'sand'); for (let x = -2; x <= 2; x++) for (let z = 12; z <= 29; z++) st.add(x, 0, z, 'plank'); for (const x of [-2, 2]) for (let z = 12; z <= 28; z += 4) st.add(x, -1, z, 'log');
  for (let y = 1; y <= 3; y++) for (let x = 6; x <= 10; x++) for (let z = 34; z <= 38; z++) { if (x > 6 && x < 10 && z > 34 && z < 38) continue; if (z === 34 && x === 8 && y <= 2) continue; st.add(x, y, z, 'plank'); } for (let x = 5; x <= 11; x++) for (let z = 33; z <= 39; z++) st.add(x, 4, z, 'jam');
  for (let x = -12; x <= 12; x++) for (let z = -62; z <= -38; z++) { const r = Math.hypot(x, z + 50); if (r > 12) continue; st.add(x, 0, z, r > 9 ? 'sand' : 'stone'); if (r < 9) st.add(x, 1, z, hash2(x, z, 5) < 0.3 ? 'dark' : 'stone'); }
  for (let y = 2; y <= 18; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) { const r = Math.hypot(x, z); if (r > 3.3 || r < 2.3) continue; if (z === 3 && x === 0 && y <= 3) continue; st.add(x, y, z - 50, Math.floor((y - 2) / 3) % 2 ? 'quartz' : 'jam'); }
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) { const r = Math.hypot(x, z); if (r <= 4.4) st.add(x, 19, z - 50, 'dark'); if (r <= 2.4 && r > 1.6) for (let y = 20; y <= 22; y++) st.add(x, y, z - 50, (x + z) % 2 ? 'glass' : 'glass'); if (r <= 2.6) st.add(x, 23, z - 50, 'slate'); } st.add(0, 24, -50, 'goldblk');
  for (const [cx, cz] of [[34, -30], [38, -26], [31, -24]]) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) { const h = Math.round(3 - Math.hypot(x, z)); for (let y = 0; y <= h; y++) st.add(cx + x, y, cz + z, 'basalt'); }
  st.build(); parentTo(rainMesh, g);
  const bp = beamBay; g.add(bp); bp.position.set(...LAMP); const domeHole = box(5, 2, 5, '#05030a', 0, 23.8, -50, g); domeHole.visible = false;
  const shipK = [[E.ship - 6, 90, 0, -6], [E.saved, 40, 0, -24], [E.saved + 10, 64, 0, 14], [E.calm + 26, 90, 0, 40]];
  burst(E.splash1, [8, 0, -38], { n: 60, colors: ['#ffffff', '#a8d8ff'], speed: 5, size: 0.2, life: 1, grav: 9, up: 6 }); burst(E.out, [0, 23.4, -50], { n: 160, colors: ['#cfefff', '#ffffff', '#5ff7ff'], speed: 8, size: 0.2, life: 2, grav: 8, up: 5 });
  burst(E.splash2, [0, 0, -14], { n: 120, colors: ['#ffffff', '#a8d8ff'], speed: 7, size: 0.24, life: 1.4, grav: 9, up: 8 });
  const C = [[0, 0, 3, 24, 0, 1.6, 30, 50], [5.9, 1, 2.6, 25, 0, 1.6, 30, 46], [6, 4, 2.2, 27, 0, 2.2, 31, 44], [12.9, 3.6, 2.2, 27.4, 0, 2.2, 31, 42], [13, -2, 2, 27, 0.4, 1.8, 30.6, 42], [21.9, -1.6, 2, 27.4, 0.4, 1.8, 30.6, 40],
    [22, 2, 1.2, 26, 0, 6, 34, 60], [26.9, 2, 1.4, 26, 0, 9, 40, 60], [27, 7, 3, 20, 2, 0.6, 24, 46], [33.9, 6, 3, 21, 2, 0.6, 24, 44], [34, -3, 1.8, 22, 2, 0.8, 24, 42], [37.9, -2.6, 1.8, 22.4, 2, 0.8, 24, 40], [52, 6, 3, -34, 0, 4, -50, 52], [57.9, 4, 1.6, -36, 0, 10, -50, 56],
    [E.ship, 60, 6, 10, 80, 1, -6, 52], [E.ship + 6, 64, 6, 12, 74, 1, -10, 50], [E.splash1 - 2, 12, 4, -32, 8, 1, -38, 50], [E.feedBack, 12, 3, -30, 8, 0, -38, 48], [E.saved, 20, 30, -20, 40, 0, -24, 56], [E.saved + 8, 18, 28, -16, 50, 0, -10, 56],
    [E.dawn, 30, 14, -10, 0, 16, -50, 54], [E.dawn + 6, 24, 18, -20, 0, 20, -50, 50], [E.dawn + 6.1, 6, 21, -42, 0, 21, -50, 46], [E.lamp2, 6, 21, -42, 0, 21, -50, 46], [E.out, 14, 26, -30, 0, 24, -48, 56], [E.splash2, 14, 10, -6, 0, 4, -20, 56]];
  function update(t) {
    hideMisc(); hide23(); [hero.root, bloop6.B.root, L6.root, barnaby.root, lumen.root, boat.g, yacht].forEach(o => parentTo(o.root || o, g)); bucket24.visible = false;
    const night = t > E.cross + 8 && t < E.dawn, storm = t > E.storm && t < E.calm; updateRain(t, [camera.position.x, camera.position.y, camera.position.z], storm);
    // the beam sweeps from the lamp
    const pw = powerAt(t) ?? 0; bp.visible = t > E.lamp && t < E.out; bp.rotation.y = t * (0.6 + pw * 0.4); beamM.opacity = Math.min(0.55, 0.08 + pw * 0.2); bp.scale.set(1 + Math.max(0, pw - 1) * 1.5, 1 + Math.max(0, pw - 1) * 1.5, 1);
    // yacht
    yacht.visible = win(t, E.ship - 6, E.dawn); { const a = walker(t, shipK); yacht.position.set(a.p[0], -0.4 + Math.sin(t * 2) * 0.15, a.p[2]); yacht.rotation.set(Math.sin(t * 1.7) * 0.05 * (storm ? 2 : 1), a.yaw, Math.sin(t * 1.3) * 0.06 * (storm ? 2 : 1)); }
    // the boat crossing
    const bz = lerp(13, -37, ss(seg(t, E.cross, E.arrive))), B = [0, -0.25 + Math.sin(t * 2.4) * 0.08, bz]; boat.g.visible = t > E.boat; boat.g.position.set(...B); boat.g.rotation.set(Math.sin(t * 2) * 0.04, PI, Math.sin(t * 1.6) * 0.05); boat.g.scale.setScalar(t < E.boat ? 0 : Math.min(1, backOut(seg(t, E.boat, E.boat + 1.5))));
    if (t < E.boat + 1) boat.g.position.set(3, -0.25, 22); boat.mot.rotation.y = Math.sin(t * 30) * 0.05;
    // hero
    let H_; if (t < E.cross) { H_ = act(t, [[0, 0, 0.5, 30], [E.seasick, 0, 0.5, 30], [E.seasick + 2, 2.6, 0.5, 23], [E.cross, 2.6, 0.5, 23]], [[0, { yaw: PI, face: 'smug', wave: t < 4 }], [E.keeper, { yaw: 0.6, face: 'smug' }], [E.keys, { yaw: 0.6, face: 'smug', hold: true }], [E.fly, { yaw: PI, face: 'scared', headPitch: -0.6 }], [E.boat, { yaw: 1.4, face: 'smug' }], [E.seasick, {}]]); if (t > E.seasick + 2) H_ = { p: wl([3, -0.25, 22], PI, [0, 0.55, 0.6]), yaw: PI, sit: 1, face: 'smug' }; }
    else if (t < E.lamp) { H_ = { p: wl(B, PI, [0, 0.55, 0.6]), yaw: PI, sit: 1, face: 'smug', wave: win(t, E.cross + 2, E.cross + 5) }; if (t > E.arrive) { const a = walker(t, [[E.arrive, 0, 1.5, -39], [E.lamp, 0, 2.5, -46.6]]); H_ = { p: a.p, yaw: PI, walk: 1, phase: a.phase * 2, face: 'smug' }; } }
    else if (t < E.dawn) { // the dive for shrimp
      const k = seg(t, E.splash1 - 2, E.feedBack); H_ = { p: [lerp(4, 8, seg(t, E.splash1 - 2, E.splash1)), t < E.splash1 ? 2.5 + Math.sin(seg(t, E.splash1 - 1, E.splash1) * PI) * 2 : -0.4 + Math.sin(t * 3) * 0.1, lerp(-42, -38, seg(t, E.splash1 - 2, E.splash1))], yaw: 0.6, face: t < E.splash1 ? 'smug' : 'scared', flat: t < E.splash1 && t > E.splash1 - 1 ? 1 : 0, panic: t > E.splash1, hold: t > E.splash1 + 3 };
      bucket24.visible = t > E.splash1 + 2; boot24.visible = win(t, E.splash1 + 2, E.splash1 + 6); shrimp.forEach(s => s.visible = t > E.splash1 + 9); if (k >= 1) H_.p = [8, -5, -38]; }
    else if (t < E.out) { H_ = { p: [0, -9, -50], yaw: 0 }; }
    else { // flying with Lumen, then water-skiing, then the leap
      const lp = lumenOut(t); H_ = { p: [lp[0], lp[1] + 0.62, lp[2]], yaw: lp[3], face: win(t, E.ski, E.leapOut) ? 'smug' : 'scared', panic: t < E.splash2 || t > E.leapOut, wave: win(t, E.ski + 3, E.leapOut), lean: -0.2 }; }
    pose(hero, { t, ...H_ }); hero.root.visible = H_.p[1] > -4;
    // Bloop (seasick), Leggy, Barnaby
    let bp_, by = PI, bo = {}; if (t < E.seasick + 2) { bp_ = t > E.boat - 1 && t < E.seasick ? [4.4, 0.5, 23.6] : [3.6, 0.5, 33]; by = t > E.boat - 1 ? -1.4 : PI; bo = { hop: win(t, E.boat, E.boat + 6) }; } else if (t < E.lamp) { bp_ = wl(t < E.cross ? [3, -0.25, 22] : B, PI, [0.7, 0.35, -1.2]); by = PI / 2 + PI; bo = { facepalm: true }; if (t > E.arrive) bp_ = [1.2, 1.5, -40]; }
    else if (t < E.dawn) bp_ = [0, -9, -50]; else bp_ = [2.6, 19.5, -47]; if (t > E.dawn) { by = 0; bo = { angry: t > E.out && t < E.ski, hop: t > E.ski }; }
    poseBurble(bloop6, t, bp_, by, bo); bloop6.B.root.visible = bp_[1] > -4; bHat.visible = true; bHat.position.y = 1.2;
    let lp_ = [-2.6, 0.5, 33], ly = PI; if (t > E.seasick + 2 && t < E.lamp) { lp_ = wl(t < E.cross ? [3, -0.25, 22] : B, PI, [0, 0.1, 1.6]); } if (t > E.arrive) lp_ = [-1.6, 1.5, -40]; if (t > E.lamp && t < E.dawn) lp_ = [0, -9, -50]; if (t > E.dawn) { lp_ = [-2.4, 19.5, -47]; ly = 0.2; }
    poseLurk(L6, t, lp_, ly, win(t, E.ski, E.leapOut) ? 2 : 0.3); L6.root.visible = lp_[1] > -4;
    let kp = [2.4, 0.5, 31], ky = PI + 0.6, ko = { talk: win(t, E.keeper, E.fly), keys: win(t, E.keeper, E.keys + 1), nod: win(t, E.keys, E.fly) };
    if (t > E.fly) { const k = seg(t, E.fly, E.fly + 6); kp = [2.4 + k * 30, 0.5 + k * k * 30 + Math.sin(k * 20) * 0.6 * k, 31 + k * 10]; ky = 1.2; ko = { fly: true, bag: true }; }
    if (t > E.dawn) { const k = seg(t, E.dawn, E.dawn + 6); kp = L3([-40, 30, -10], [0, 19.5, -45.6], ss(k)); ky = faceTo([-40, 0, -10], [0, 0, -46]); ko = { fly: k < 1, bag: true }; if (k >= 1) { ky = PI; ko = { flap: t > E.out, talk: false }; } }
    barnaby.root.visible = t < E.fly + 6 || t > E.dawn; posePelican(barnaby, t, kp, ky, ko);
    // Lumen outside
    lumen.root.visible = t > E.out; if (lumen.root.visible) { const lp = lumenOut(t); poseLumen(lumen, t, [lp[0], lp[1], lp[2]], lp[3], { mood: 1, excited: 1, power: 3, roll: win(t, E.out, E.splash2) ? Math.sin(t * 6) * 0.4 : 0 }); }
    let cam = camKeys(t, C);
    if (win(t, E.cross, E.arrive)) cam = { p: [B[0] + 7 * Math.cos(t * 0.2), 3.4, B[2] - 9], l: [B[0], 0.8, B[2]], fov: 52 };
    if (t > E.splash2) { const lp = lumenOut(t); cam = t < E.leapOut ? { p: [lp[0] + 10, 4, lp[2] + 10], l: [lp[0], 0.6, lp[2]], fov: 54 } : { p: [lp[0] + 12, 3, lp[2] + 6], l: [lp[0], lp[1] - 1, lp[2]], fov: 52 }; }
    return { cam, hud: true, night };
  }
  return { g, update };
})();
// Lumen's escape: arc out of the dome → splash → laps pulling me on my feet → the big leap
function lumenOut(t) { if (t < E.splash2) { const k = seg(t, E.out, E.splash2); return [0, 23.4 + Math.sin(k * PI) * 10 - k * 23.6, lerp(-50, -14, k), 0]; }
  const lap = a => [Math.sin(a) * 16, -0.3, -24 + Math.cos(a) * 10, Math.atan2(16 * Math.cos(a), -10 * Math.sin(a))];
  if (t < E.leapOut) { const q = lap((t - E.splash2) * 0.55); q[1] += Math.abs(Math.sin(t * 3)) * 0.4; return q; }
  const [x0, , z0, y0] = lap((E.leapOut - E.splash2) * 0.55), k = seg(t, E.leapOut, E.leapOut + 9); return [x0 + Math.sin(y0) * k * 22, -0.3 + Math.sin(k * PI) * 9, z0 + Math.cos(y0) * k * 22, y0]; }

// ---------------------------------------------------------------- set B: the lamp room (storm through the glass; Lumen's tank)
const lamp = (() => {
  const g = mk('lamp'); const sea = seaSet(g); sea.position.y = -20; const st = new VSet(g);
  for (let x = -6; x <= 6; x++) for (let z = -6; z <= 6; z++) { const r = Math.hypot(x, z); if (r > 6.4) continue; st.add(x, 0, z, 'plank'); if (r > 5.4) { for (let y = 1; y <= 4; y++) st.add(x, y, z, Math.abs(x) === Math.abs(z) || y === 4 ? 'dark' : 'glass'); } }
  for (let x = -6; x <= 6; x++) for (let z = -6; z <= 6; z++) if (Math.hypot(x, z) <= 6.4) st.add(x, 5, z, 'slate');
  st.build();
  const tank = new THREE.Group(); g.add(tank); box(3.4, 2.6, 3.4, 0, 0, 1.8, 0, tank, MAT.glass); const water = box(3.2, 2.2, 3.2, 0, 0, 1.6, 0, tank, new THREE.MeshLambertMaterial({ color: '#4a9ad8', transparent: true, opacity: 0.22, depthWrite: false, emissive: '#1a4f9a', emissiveIntensity: 0.3 })); box(3.6, 0.3, 3.6, '#8a5a2b', 0, 0.6, 0, tank);
  parentTo(disco, g); parentTo(beamRoom, g); beamRoom.position.set(0, 4.3, 0); const strobe = new THREE.PointLight('#ff8fd8', 0, 14, 1.2); strobe.position.set(2.8, 3.8, 1.8); g.add(strobe);
  burst(E.feed + 0.6, [0, 2.8, 0.6], { n: 60, colors: ['#ff8a6a', '#ffffff', '#fff3a0'], speed: 4, size: 0.12, life: 1, grav: 4, up: 3 }); burst(E.leggy + 4, [0, 3, 0], { n: 90, colors: ['#fff3a0', '#ffffff', '#ff8fd8'], speed: 6, size: 0.14, life: 1.4, grav: 2, up: 3 });
  for (let t = E.excite + 2; t < E.jump; t += 0.3) burst(t, [0, 2.8, 0], { n: 6, colors: ['#ffffff', '#cfefff'], speed: 2, size: 0.12, life: 0.8, grav: -2, up: 2 });
  const C = [[E.lamp, 0, 3.2, 5.4, 0, 1.6, 0, 56], [62.9, 0.6, 3.2, 5.0, 0, 1.6, 0, 54], [63, -1.4, 2.0, 3.4, 0, 1.8, 0, 46], [69.9, -1.0, 2.0, 3.0, 0, 1.8, 0, 42], [70, -3, 3.2, 3.6, 0, 1.6, 0, 50], [77.9, -2.6, 3.2, 3.2, 0, 1.6, 0, 48], [78, 0, 3.4, 5.4, 0, 1.6, 0, 56], [E.ship, 0.6, 3.4, 5.2, 0, 1.6, 0, 54],
    [E.jokes, -1.8, 2.6, 4.4, 0.6, 1.6, 0.6, 46], [97.9, -1.5, 2.6, 4.2, 0.6, 1.6, 0.6, 44], [98, -2.6, 2.6, 4.4, 3.4, 2.8, 0.4, 50], [107.9, -2.2, 2.6, 4.2, 3.4, 2.8, 0.4, 48], [108, 2.4, 2.4, 4.4, -3.2, 1.4, -0.4, 50], [115.9, 2.0, 2.4, 4.2, -3.2, 1.4, -0.4, 48], [116, 3.6, 2.4, 4.6, 1.8, 1.8, 3.0, 44], [E.splash1 - 2, 3.4, 2.4, 4.4, 1.8, 1.8, 3.0, 42],
    [E.feedBack, -1.6, 2.4, 3.6, 0.6, 1.8, 0.6, 46], [141.9, -1.4, 2.4, 3.4, 0.6, 1.8, 0.6, 44], [142, 0, 3.2, 5.4, 0, 1.6, 0, 54], [145.9, 0.4, 3.2, 5.2, 0, 1.6, 0, 52], [146, -3, 2.6, 3.6, -0.4, 1.8, 0, 46], [153.9, -2.6, 2.6, 3.2, -0.4, 1.8, 0, 42], [154, 2.6, 3.2, 4.6, 0, 3, 0, 50], [E.saved, 2.4, 3.2, 4.4, 0, 3, 0, 48],
    [E.saved + 8, 0, 3.4, 5.4, 0, 1.4, 0, 54], [184, 0.4, 3.4, 5.2, 0, 1.4, 0, 52], [184.1, -3.6, 2.2, 3.6, 0, 1.6, 0, 46], [E.dawn, -3.2, 2.2, 3.4, 0, 1.6, 0, 44], [E.lamp2, 0, 3.2, 5.4, 0, 2, -1, 54], [221.9, 0.6, 3.2, 5.2, 0, 2, -1, 52], [222, -1.2, 2, 3.4, 0, 2, 0, 46], [229.9, -1.0, 2, 3.2, 0, 2, 0, 44],
    [230, 3.4, 3.8, 3.4, 0, 1.8, 0, 56], [E.out, 3.2, 3.8, 3.6, 0, 2.4, 0, 56]];

  function update(t) {
    hideMisc(); hide23(); [hero.root, bloop6.B.root, L6.root, barnaby.root, lumen.root].forEach(o => parentTo(o, g)); boat.g.visible = yacht.visible = false; parentTo(rainMesh, g); updateRain(t, [0, 6, 0], t > E.storm && t < E.calm);
    const pw = powerAt(t) ?? 0.5, mood = clamp(pw, 0, 1), ex = t > E.excite ? seg(t, E.excite, E.excite + 4) : 0;
    beamRoom.rotation.y = t * (0.6 + pw * 0.4); beamRoom.visible = true; beamM.opacity = Math.min(0.55, 0.08 + pw * 0.2); water.position.y = 1.6 + (ex ? Math.sin(t * 30) * 0.05 : 0);
    // Lumen in the tank (hides behind the castle during the disco; out of the tank at the end)
    let fp = [0, 1.7, 0], fy = 0, fo = { mood, power: pw, excited: ex, chomp: win(t, E.feed, E.feed + 3) };
    if (t < E.reveal) { fp = [0, 0.9, 0]; fo.mood = 0.2; } else if (t < E.reveal + 3) fp = [0, lerp(0.9, 1.7, seg(t, E.reveal, E.reveal + 2)), 0];
    if (win(t, E.disco, E.dance)) { fp = [-0.6, 1.2, -0.8]; fy = -2.4; }
    if (t > E.jump) { const k = (t - E.jump); fp = [Math.sin(k * 2.2) * 3.2, 2.2 + Math.abs(Math.sin(k * 4)) * 1.6, Math.cos(k * 2.2) * 3.2]; fy = k * 2.2 + PI / 2; fo.spin = false; if (t > E.grab) fp = [0, lerp(2.4, 6, seg(t, E.grab, E.out)), lerp(0, -0.5, seg(t, E.grab, E.out))]; }
    poseLumen(lumen, t, fp, fy, fo); lumen.root.visible = true;
    // disco ball
    disco.visible = t > E.disco; disco.position.set(2.8, 3.8, 1.8); disco.rotation.y = t * 1.5; disco.scale.setScalar(Math.min(1, seg(t, E.disco, E.disco + 4) * 1.2)); strobe.intensity = win(t, E.disco + 4, E.dance) || win(t, E.discoUse, E.calm) ? 20 + Math.sin(t * 12) * 15 : 0; strobe.color.setHSL((t * 0.5) % 1, 0.8, 0.6);
    if (t > E.discoUse) { disco.position.set(0, 4.2, 0); } if (t > E.jump + 3) { disco.position.y = Math.max(0.9, 4.2 - (t - E.jump - 3) * 6); }
    // me
    let H_ = act(t, [[E.lamp, 0, 0.5, 5], [E.lamp + 2, 1.8, 0.5, 3.2]], [[0, { face: 'smug' }], [E.lamp + 2, { yaw: PI, face: 'normal' }], [E.reveal, { yaw: PI, face: 'scared' }], [E.sad, { yaw: PI, face: 'normal' }], [E.jokes, { yaw: PI, face: 'smug', wave: true }], [E.disco, { yaw: 2.6, face: 'normal' }], [E.dance, { yaw: -2.4, face: 'smug' }], [E.hungry, { yaw: PI, face: 'scared', headPitch: 0.3 }]]);
    if (t > E.feedBack) { H_ = { p: [1.0, 0.5, 2.3], yaw: PI - 0.3, face: 'smug', hold: t < E.feed + 1, hips: t > E.notEnough && t < E.leggy }; bucket24.visible = t < E.feed + 2; boot24.visible = false; shrimp.forEach(s => s.visible = t < E.feed + 0.6); }
    if (t > E.calm) H_ = { p: [0.6, 0.5, 3.0], yaw: PI, face: 'smug', sit: 1, lean: -0.1 }; if (t > E.lamp2) H_ = { p: [0.6, 0.5, 3.0], yaw: PI + 0.4, face: t > E.excite ? 'scared' : 'smug', panic: t > E.jump };
    if (t > E.grab) H_ = { p: [fp[0], fp[1] - 0.6 + 0.4, fp[2] + 0.9], yaw: PI, face: 'scared', panic: true };
    if (!win(t, E.splash1 - 2, E.feedBack)) { if (t < E.feedBack) bucket24.visible = false; pose(hero, { t, ...H_ }); hero.root.visible = true; } else hero.root.visible = false;
    // Bloop: seasick, builds the disco ball, turns it into a reflector
    let bp = [3.6, 0.5, -0.4], by = -1.6, bo = { facepalm: t < E.disco || win(t, E.dance, E.discoUse - 2) };
    if (win(t, E.disco, E.dance)) bo = { hop: true, handOut: true }; if (t > E.discoUse - 2) { bp = [2.6, 0.5, 0.4]; by = -1.8; bo = { hop: win(t, E.discoUse, E.calm), handOut: t < E.discoUse }; } if (t > E.calm) { bp = [3.6, 0.5, -1.4]; bo = {}; } if (t > E.excite) bo = { angry: true };
    poseBurble(bloop6, t, bp, by, bo); bHat.visible = true; bHat.position.y = 1.2;
    // Leggy: dances; then climbs into the tank and hugs Lumen
    let lp = [-3.4, 0.5, -0.6], ly = 1.6, ls = 0.3; if (win(t, E.dance, E.hungry)) { lp = [-3.0 + Math.sin(t * 3) * 0.6, 0.5 + Math.abs(Math.sin(t * 6)) * 0.4, -0.4]; ly = 1.6 + Math.sin(t * 4) * 0.8; ls = 2.4; }
    if (t > E.leggy) { const k = seg(t, E.leggy, E.leggy + 3); lp = L3([-3.4, 0.5, -0.6], [-0.6, 0.8, 0.4], k); lp[1] += Math.sin(k * PI) * 3; ly = 2.2; ls = k < 1 ? 1.4 : 0.3; } if (t > E.calm) { lp = [-2.8, 0.5, 2.4]; ly = 2.4; ls = 0.3; } if (t > E.excite) ls = 2;
    poseLurk(L6, t, lp, ly, ls);
    // Barnaby back home
    barnaby.root.visible = t > E.lamp2; posePelican(barnaby, t, [2.6, 0.5, -3.2], -0.6, { talk: win(t, E.lamp2 + 1, E.excite), flap: t > E.excite, look: t > E.excite ? Math.sin(t * 8) * 0.4 : 0 });
    const cam = camKeys(t, C); return { cam, hud: true, night: t < E.dawn };
  }
  return { g, update };
})();
