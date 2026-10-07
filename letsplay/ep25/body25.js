// ---------------------------------------------------------------- Ep 25 helpers: the snow globe, the Flurries, Mayor Flurrington, the giant outside faces, the snow machine
function hide24() { hide23(); [bucket24, lumen.root, barnaby.root, boat.g, yacht].forEach(o => o.visible = false); }
const snowW = new THREE.MeshLambertMaterial({ color: '#f6fbff', emissive: '#a8c8e8', emissiveIntensity: 0.12 });
function makeFlurry(scarf, s = 1, mayor = false) { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 0.85, 0.9, 0, 0, 0.5, 0, body, snowW); for (const [x, y, z] of [[0.38, 0.75, 0.3], [-0.4, 0.3, 0.35], [0.3, 0.2, -0.4], [-0.3, 0.85, -0.3]]) box(0.22, 0.22, 0.22, 0, x, y, z, body, snowW);
  const eyes = [-0.2, 0.2].map(x => box(0.12, 0.16, 0.04, '#1a2030', x, 0.66, 0.46, body)); box(0.14, 0.08, 0.16, '#ff8a2a', 0, 0.54, 0.5, body);
  box(0.95, 0.16, 0.95, scarf, 0, 0.32, 0, body); box(0.18, 0.4, 0.06, scarf, 0.24, 0.12, 0.48, body);
  const aL = pivot(body, -0.48, 0.45, 0), aR = pivot(body, 0.48, 0.45, 0); box(0.2, 0.2, 0.2, scarf, 0, -0.1, 0, aL); box(0.2, 0.2, 0.2, scarf, 0, -0.1, 0, aR);
  if (mayor) { box(0.6, 0.08, 0.6, '#111', 0, 1.0, 0, body); box(0.4, 0.5, 0.4, '#111', 0, 1.28, 0, body); box(0.42, 0.08, 0.42, '#e8344e', 0, 1.1, 0, body); box(0.5, 0.06, 0.06, '#ffd23f', 0, 0.42, 0.48, body); }
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, eyes, aL, aR, s }; }
function poseFlurry(f, t, p, yaw, o = {}) { const sd = o.seed || 0, melt = o.melt || 0; f.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 8 + sd)) * 0.4 * f.s : 0), p[2]); f.root.rotation.set(0, yaw, o.tumble ? t * 6 + sd : 0);
  f.body.scale.set(1 + melt * 0.6, 1 - melt * 0.7, 1 + melt * 0.6); f.body.rotation.z = o.wobble ? Math.sin(t * 20 + sd) * 0.2 : Math.sin(t * 3 + sd) * 0.05;
  f.aL.rotation.set(o.wave ? -2.6 + Math.sin(t * 12 + sd) * 0.4 : 0, 0, -0.2); f.aR.rotation.set(o.wave || o.cheer ? -2.6 + Math.cos(t * 12 + sd) * 0.4 : o.point ? -1.5 : 0, 0, 0.2); f.eyes.forEach(e => e.scale.y = melt > 0.5 ? 0.3 : 1); }
const mayor = makeFlurry('#e8344e', 1.5, true), flurries = ['#3d7bff', '#ff8a2a', '#7cff6b', '#c08aff', '#ffd23f', '#ff6fb8', '#5ff7ff', '#e8344e'].map(c => makeFlurry(c, 1));
// the snow globe prop (outside); the swirl overlay
const globe = new THREE.Group(); box(1.3, 0.35, 1.3, '#8a5a2b', 0, 0.18, 0, globe); box(1.34, 0.08, 1.34, '#ffd23f', 0, 0.36, 0, globe);
const gGlass = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 6), new THREE.MeshLambertMaterial({ color: '#dff4ff', transparent: true, opacity: 0.35, flatShading: true, depthWrite: false })); gGlass.position.y = 0.95; globe.add(gGlass);
box(0.9, 0.12, 0.9, 0, 0, 0.5, 0, globe, snowW); box(0.2, 0.2, 0.2, '#e8344e', -0.15, 0.66, 0, globe); box(0.24, 0.1, 0.24, '#5a3a22', -0.15, 0.8, 0, globe); box(0.06, 0.24, 0.06, '#e0e0e0', 0.2, 0.68, 0.1, globe);
const gFlakes = Array.from({ length: 14 }, (_, i) => box(0.05, 0.05, 0.05, '#ffffff', 0, 0, 0, globe));
const pkg = new THREE.Group(); box(0.8, 0.6, 0.8, '#c08a40', 0, 0, 0, pkg); box(0.84, 0.12, 0.12, '#e8344e', 0, 0, 0, pkg); box(0.12, 0.64, 0.84, '#e8344e', 0, 0, 0, pkg);
function drawSwirl(T) { const k = win(T, E.pulled - 1.4, E.pulled + 1.2) ? Math.sin(seg(T, E.pulled - 1.4, E.pulled + 1.2) * PI) : win(T, E.inside - 1, E.inside + 0.8) ? Math.sin(seg(T, E.inside - 1, E.inside + 0.8) * PI) : win(T, E.escape - 1, E.outside + 0.6) ? Math.sin(seg(T, E.escape - 1, E.outside + 0.6) * PI) : 0; if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#eaf6ff'; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2); for (let i = 0; i < 70; i++) { const a = i * 2.4 + T * 4, r = (i * 13 + T * 300) % 640; ctx.fillStyle = i % 3 ? '#9fd0ff' : '#ffffff'; ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r, 14, 14); }
  outlined(T < E.escape ? 'SHRINKING...' : 'GROWING...', 0, 0, 56, '#3d7bff', '#ffffff', 10); ctx.restore(); }
// giant faces seen through the glass from inside
function makeGiantLeggy() { const g = new THREE.Group(); box(30, 22, 4, '#1a1a24', 0, 0, 0, g); for (const [x, y] of [[-8, 4], [8, 4], [-4, -2], [4, -2]]) box(4.4, 4.4, 0.6, 0, x, y, 2.2, g, new THREE.MeshBasicMaterial({ color: '#5ff7ff' })); box(8, 1.4, 0.6, '#3a3a50', 0, -7, 2.2, g); return g; }
function makeGiantBloop() { const g = new THREE.Group(); box(26, 22, 4, '#c8e6a0', 0, 0, 0, g); box(12, 9, 0.6, '#ffffff', 0, 2, 2.2, g); box(5, 6, 0.7, '#1a1a40', 0, 1.6, 2.5, g); box(28, 7, 26, '#ffd400', 0, 14, -8, g); box(6, 1.2, 0.6, '#5a7a3a', 0, -6, 2.2, g); return g; }
const giantL = makeGiantLeggy(), giantB = makeGiantBloop();
// the snow machine
const snowMac = new THREE.Group(); box(2.2, 2.4, 2.0, '#5ab0d0', 0, 1.2, 0, snowMac); box(2.3, 0.3, 2.1, '#ffffff', 0, 2.5, 0, snowMac); const funnel = pivot(snowMac, 0, 2.6, 0); box(0.8, 1.6, 0.8, '#c0c0c8', 0, 0.8, 0, funnel); box(1.4, 0.4, 1.4, '#c0c0c8', 0, 1.7, 0, funnel);
const crank = pivot(snowMac, 1.15, 1.4, 0); box(0.1, 0.1, 0.9, '#8a5a2b', 0, 0, 0.45, crank); box(0.3, 0.3, 0.3, '#e8344e', 0, 0, 0.9, crank); const macLight = box(0.4, 0.4, 0.1, 0, -0.6, 1.8, 1.02, snowMac, new THREE.MeshBasicMaterial({ color: '#7cff6b' }));
snowMac.traverse(o => { if (o.isMesh) o.castShadow = true; });
// HUD: size + snow depth
const depthAt = t => t < E.snowOn ? 0 : t < E.tooMuch ? seg(t, E.snowOn, E.snowOn + 20) : 1 + seg(t, E.tooMuch, E.freeze) * 3.2;
function drawGlobeHUD(t) { if (t >= E.freeze || t < E.inside - 2) return; rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(14,30,60,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#cfefff'; ctx.stroke();
  if (t < E.outside) { outlined('YOUR SIZE', 132, 114, 15, '#cfefff', '#000', 3); outlined('1 : 100', 132, 148, 32, '#ffffff', '#000', 5); outlined(win(t, E.quake1, E.quake1 + 6) || win(t, E.quake2, E.quake2 + 8) ? 'SHAKE DETECTED' : 'tiny. very tiny.', 132, 174, 13, '#fff', '#000', 3); return; }
  const d = depthAt(t); outlined('SNOW DEPTH', 132, 114, 15, '#cfefff', '#000', 3); outlined(d.toFixed(1) + ' blocks', 132, 148, 30, d > 3 ? (Math.floor(t * 6) % 2 ? '#ff6b6b' : '#ffffff') : '#ffffff', '#000', 5); outlined(d > 3 ? 'TOO MUCH SNOW' : d > 0.5 ? 'perfect for Flurries' : 'flurries: melting!', 132, 174, 13, '#fff', '#000', 3); }

// ================================================================ EPISODE 25: "THE SNOW GLOBE (we're inside it)" — the yard (a gift from the Duke) → inside the globe (Flurrytown; shakes; the Great Bell) → the yard again (melting Flurries; Bloop's snow machine; too much snow)
// ---------------------------------------------------------------- set A: the yard
const yard = (() => {
  const g = mk('yard'); field(g, false); const hg = new THREE.Group(); g.add(hg); { const st = new VSet(hg); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(hg); }
  const table = new THREE.Group(); box(2.2, 0.2, 1.4, '#8a5a2b', 0, 1.0, 0, table); for (const [x, z] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) box(0.16, 1.0, 0.16, '#6a4020', x, 0.5, z, table); g.add(table); table.position.set(0, 0.5, 2.4);
  g.add(snowMac); snowMac.position.set(-5, 0.5, 2.6); snowMac.rotation.y = 0.5;
  const snowG = new THREE.Group(); g.add(snowG); const snowVS = new VSet(snowG, true); { const r = rng(2501);
    for (let y = 1; y <= 4; y++) for (let x = -16; x <= 16; x++) for (let z = -4; z <= 16; z++) { if (y > 1 && Math.hypot(x + 5, z - 2.6) < 1.8) continue; const t0 = y === 1 ? lerp(E.snowOn + 2, E.snowOn + 20, r()) : lerp(E.tooMuch + (y - 2) * 14, E.tooMuch + (y - 1) * 14, r()); if (t0 > E.freeze + 2) continue; snowVS.add(x, y - 0.6, z, 'snow', { t0 }); } snowVS.build(); }
  for (let t = E.macB; t < E.macB + 12; t += 0.5) burst(t, [-5, 2, 2.6], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  for (let t = E.snowOn; t < E.freeze; t += t > E.tooMuch ? 0.08 : 0.2) burst(t, [-5, 4.6 + (t > E.tooMuch ? 1 : 0), 2.6], { n: t > E.tooMuch ? 14 : 6, colors: ['#ffffff', '#e8f4fc'], speed: t > E.tooMuch ? 9 : 5, size: 0.16, life: 2.4, grav: 2, up: 5 });
  burst(E.outside, [0, 2, 3.4], { n: 120, colors: ['#ffffff', '#9fd0ff', '#5ff7ff'], speed: 6, size: 0.15, life: 1.4, grav: 3, up: 4 }); burst(E.pulled, [0, 2.4, 2.4], { n: 120, colors: ['#ffffff', '#9fd0ff', '#5ff7ff'], speed: 5, size: 0.14, life: 1.2, grav: -1, up: 2 });
  for (let t = E.snowball; t < E.snowball + 10; t += 0.7) burst(t, [lerp(-1, 4, (t * 0.3) % 1), 1.6, 5], { n: 14, colors: ['#ffffff'], speed: 3, size: 0.18, life: 0.8, grav: 8, up: 2 });
  const C = [[0, 0, 3, 11, 0, 1.6, 2, 50], [5.9, 1, 2.8, 9.6, 0, 1.6, 2, 48], [6, 5, 2.4, 7, 0, 2.2, 2.4, 50], [11.9, 4.4, 2.4, 6.6, 0, 1.8, 2.4, 46], [12, 1.6, 2.2, 5.8, 0, 1.6, 2.4, 40], [17.9, 1.2, 2.2, 5.4, 0, 1.6, 2.4, 38], [18, 0, 2.4, 5.4, 0, 1.9, 2.4, 40], [23.9, 0, 2.3, 4.8, 0, 1.95, 2.4, 30], [24, 0, 2.25, 4.4, 0, 1.95, 2.4, 26], [E.pulled, 0, 2.2, 3.8, 0, 1.95, 2.4, 14],
    [E.pulled + 0.6, -3, 3, 8, 0, 1.4, 2.4, 50], [35.9, -2, 3, 8, 0, 1.4, 2.4, 48], [36, -1.6, 3.4, 5.4, -1.6, 2.7, 2.2, 40], [E.inside, -1.6, 3.0, 3.8, -1.6, 2.8, 2.2, 22],
    [E.drill, 4, 2.8, 6.4, 0, 1.6, 2.4, 44], [E.drill + 6, 3.4, 2.4, 5.4, 0, 1.6, 2.4, 40], [E.drill + 6.1, -3.4, 2.8, 6, 0, 1.6, 2.4, 44], [E.drill + 12, -3, 2.6, 5.6, 0, 1.6, 2.4, 40],
    [E.outside, 0, 3, 11, 0, 1.4, 2.4, 52], [161.9, 2, 2.8, 9, 0, 1.2, 3, 48], [162, 2, 2.4, 5.8, 0, 1.5, 2.4, 40], [171.9, 1.6, 2.2, 5.2, 0, 1.5, 2.4, 36], [172, -1, 4, 9, -5, 1.4, 2.6, 50], [187.9, -2, 4, 10, -5, 1.4, 2.6, 48],
    [188, 4, 3, 10, -3, 2.6, 2, 54], [199.9, 2, 3, 11, -3, 2.6, 2, 52], [200, -12, 4, 11, -6, 0.8, 5, 46], [205.9, -11.4, 4, 10.4, -6, 0.8, 5, 44], [206, 8, 2.4, 9, 1, 1.4, 4.4, 50], [219.9, 7, 2.4, 10, 1, 1.4, 4.4, 48],
    [220, 0, 4, 13, 0, 2, 2, 52], [235.9, 3, 4, 13, 0, 2, 2, 50], [236, -1, 3, 7, -5, 2.6, 2.6, 46], [245.9, -1.6, 3, 6.6, -5, 2.6, 2.6, 44], [246, 6, 8, 16, -2, 2, 2, 58], [259.9, 4, 9, 17, -2, 3, 2, 56],
    [260, 5, 4.4, 9, 2, 3.4, 4, 46], [271.9, 4.4, 4.6, 8.4, 2, 3.6, 4, 44], [272, -9, 6, 8, -5, 5, 2.6, 52], [277.9, -8, 6.4, 8.4, -5, 5, 2.6, 50], [278, 5, 5.6, 10, 2, 4.2, 4, 48], [285.6, 4.4, 5.4, 8.8, 2, 4.2, 4, 44], [E.logo, 4.4, 5.4, 8.8, 2, 4.2, 4, 44]];
  function update(t) {
    hideMisc(); hide24(); [hero.root, bloop6.B.root, L6.root, mayor.root, ...flurries.map(f => f.root), mailBird.root].forEach(o => parentTo(o, g)); snowVS.update(t);
    const late = t > E.outside, D = depthAt(t), sy = 0.5 + Math.max(0, D - 0.4);
    // the globe on the table, the package
    parentTo(globe, g); globe.visible = t > E.gift + 2; const shaking = win(t, E.shake, E.shake + 4) || win(t, E.leggyShake, E.leggyShake + 4) || win(t, E.drill + 6, E.drill + 9);
    const held = win(t, E.leggyShake - 1, E.inside); globe.position.set(held ? -1.6 : 0, held ? 2.7 : 1.6, held ? 2.2 : 2.4); globe.rotation.set(shaking ? Math.sin(t * 30) * 0.3 : 0, 0, shaking ? Math.cos(t * 26) * 0.3 : 0); globe.scale.setScalar(win(t, E.inside, E.outside) ? 1.2 : 1);
    gFlakes.forEach((f, i) => { const r = rng(2510 + i); const a = t * (shaking ? 4 : 0.6) + r() * 6; f.position.set(Math.cos(a) * 0.4 * r(), 0.6 + ((r() + t * (shaking ? 0.4 : 0.05)) % 1) * 0.7, Math.sin(a) * 0.4 * r()); });
    parentTo(pkg, g); pkg.visible = win(t, E.gift - 3, E.gift + 2); pkg.position.set(...(t < E.gift ? L3([20, 10, -10], [0, 1.9, 2.4], seg(t, E.gift - 3, E.gift)) : [0, 1.9, 2.4])); pkg.rotation.y = t;
    mailBird.root.visible = win(t, E.gift - 3, E.gift + 3); if (mailBird.root.visible) { const k = seg(t, E.gift - 3, E.gift + 3); mailBird.root.position.set(lerp(20, -20, k), lerp(10, 12, k) - Math.sin(k * PI) * 8, lerp(-10, 6, k)); mailBird.root.rotation.y = -2.2; const fl = Math.sin(t * 16) * 0.8; mailBird.wL.rotation.z = fl; mailBird.wR.rotation.z = -fl; }
    // me
    let H_; if (!late) { H_ = act(t, [[0, 0, 0.5, 0.9]], [[0, { yaw: 0, face: 'smug', wave: t < 4 }], [E.gift, { yaw: 0, face: 'smug', headPitch: 0.3 }], [E.shake, { yaw: 0, face: 'smug', hold: true }], [E.shake + 6, { yaw: 0, face: 'normal', headPitch: 0.5, lean: 0.5 }], [E.pulled - 1, { yaw: 0, face: 'scared', lean: 0.6, panic: true }]]); if (t > E.pulled) H_ = { p: [0, -10, 0], yaw: 0 }; }
    else { H_ = act(t, [[E.outside, 0.6, 0.5, 4.6], [E.melt, 0.6, 0.5, 4.6], [E.macB, -2.4, 0.5, 4], [E.snowOn, -2.4, 0.5, 4], [E.snowball, 2, 0.5, 5.4], [E.calm, 2, 0.5, 5.4], [E.calm + 2, 2, 0.5, 4.0]],
        [[0, { face: 'smug', yaw: PI, flat: t < E.outside + 1.4 ? 1 : 0, flatDir: -1 }], [E.outside + 1.4, { face: 'smug', yaw: PI, wave: true }], [E.melt, { face: 'scared', yaw: PI, panic: win(t, E.melt + 2, E.macB) }], [E.macB, { face: 'smug', yaw: 2.4 }], [E.snowOn, { face: 'smug', yaw: 2.4, wave: t < E.snowOn + 4 }], [E.snowball, { face: 'smug', yaw: PI, swing: t * 1.6 }], [E.calm, { face: 'smug', yaw: 0 }], [E.calm + 2, { face: 'smug', yaw: 0, hips: true }], [E.tooMuch + 6, { face: 'scared', yaw: 0.4, panic: true }], [E.buried, { face: 'scared', yaw: 0.2 }]]);
      const yb = 0.5 + Math.max(0, depthAt(E.buried) - 0.4) - 0.2; H_.p = [H_.p[0], t < E.tooMuch ? 0.5 : t < E.buried ? Math.max(0.5, sy - 0.2) : yb, H_.p[2]]; }
    pose(hero, { t, ...H_ }); hero.root.visible = H_.p[1] > -4;
    // Bloop: watches, drills, builds the snow machine, rides it
    let bp = [3.4, 0.5, 0.6], by = -1.2, bo = {}; if (win(t, E.pulled, E.outside)) { bp = [1.6, 0.5, 1.0]; by = -0.6; bo = { angry: t < E.drill, handOut: t > E.drill }; }
    if (late) { bp = [3.2, 0.5, 4.2]; by = -1.2; bo = { hop: t < E.melt }; if (t > E.macB) { bp = [-3.2, 0.5, 3.8]; by = -1.6; bo = { hop: t < E.macB + 12, handOut: true }; } if (t > E.calm) { bp = [-2, 0.5, 6]; by = 0.6; bo = {}; } if (t > E.tooMuch + 2) { bp = [-5, 3.0 + 0.2, 2.6]; by = 0.4; bo = { angry: true }; } }
    poseBurble(bloop6, t, bp, by, bo); bHat.visible = true; bHat.position.y = 1.2; drill.visible = win(t, E.drill, E.outside); if (drill.visible) dbit.rotation.z = t * 40;
    // Leggy: picks up the globe and shakes it (a lot); snow angels; walks on top of the snow
    let lp = [-3.2, 0.5, 1.0], ly = 1.2, ls = 0.3; if (win(t, E.leggyShake - 1, E.inside)) { lp = [-1.6, 0.5, 1.2]; ly = 0.2; ls = 2; } if (win(t, E.inside, E.outside)) { lp = [-1.6, 0.5, 1.2]; ly = 0.2; ls = win(t, E.drill + 6, E.drill + 9) ? 3 : 0.3; }
    if (late) { lp = [-7, 0.5, 5.4]; ly = 0.8; if (t > E.snowOn + 10) { lp = [-6 + Math.sin(t * 0.8) * 2, sy - 0.1, 5]; ly = Math.cos(t * 0.8) > 0 ? PI / 2 : -PI / 2; ls = 1.4; } if (t > E.calm) { lp = [-7.4, sy - 0.1, 6.8]; ly = 0.4; ls = 0.3; } if (t > E.final) { lp = [-6.2, sy + 1.6, 3.4]; ly = 0.6; ls = 3; } }
    poseLurk(L6, t, lp, ly, ls); L6.root.visible = true;
    // snow machine
    snowMac.visible = late && t > E.macB; snowMac.scale.setScalar(Math.min(1, seg(t, E.macB, E.macB + 10) * 1.1)); crank.rotation.x = t > E.snowOn ? t * (t > E.tooMuch ? 20 : 5) : 0; funnel.rotation.y = t > E.tooMuch ? Math.sin(t * 30) * 0.1 : 0; macLight.material.color.set(t > E.tooMuch ? (Math.floor(t * 6) % 2 ? '#ff2a4a' : '#ffe066') : '#7cff6b');
    snowMac.position.y = 0.5 + (t > E.final ? Math.abs(Math.sin(t * 14)) * 0.3 : 0);
    // the Flurries outside: tiny, melting, revived, snowball fight, on my head at the end
    const outF = late; mayor.root.visible = outF; flurries.forEach(f => f.root.visible = outF && flurries.indexOf(f) < 5);
    if (outF) { const all = [mayor, ...flurries.slice(0, 5)]; all.forEach((f, i) => { const sc = (i ? 0.3 : 0.4), melt = t < E.snowOn ? seg(t, E.melt, E.melt + 10) * 0.8 : Math.max(0, 0.8 - seg(t, E.snowOn, E.snowOn + 3)); f.root.scale.setScalar(sc);
        let p = [-0.7 + i * 0.28, 1.6, 2.4], y = 0, o = { seed: i, melt, hop: t < E.melt || win(t, E.snowOn + 3, E.snowOn + 10), wave: t < E.melt };
        if (t > E.snowOn + 4) { const a = i * 1.1 + t * 0.3; p = [-1 + Math.cos(a) * 3, sy, 4 + Math.sin(a) * 2]; y = -a; o = { seed: i, hop: true, cheer: true }; }
        if (t > E.calm) { p = [hero.root.position.x - 0.4 + (i % 3) * 0.4, sy, hero.root.position.z + 0.8 + Math.floor(i / 3) * 0.4]; y = 0; o = { seed: i }; }
        if (t > E.buried) { p = [hero.root.position.x - 0.3 + (i % 3) * 0.3, hero.root.position.y + 2.2 + Math.floor(i / 3) * 0.3, hero.root.position.z]; y = 0; o = { seed: i, wave: true }; }
        poseFlurry(f, t, p, y, o); f.root.scale.setScalar(sc); }); }
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: inside the snow globe (Flurrytown; Snowtop; the Great Bell)
const inside = (() => {
  const g = mk('inside'); const st = new VSet(g);
  for (let x = -30; x <= 30; x++) for (let z = -30; z <= 30; z++) { const r = Math.hypot(x, z); if (r > 30) continue; st.add(x, 0, z, 'snow'); }
  for (let x = -10; x <= 10; x++) for (let z = -26; z <= -6; z++) { const d = Math.hypot(x, (z + 16) * 1.0); const h = Math.round(10 - d); for (let y = 1; y <= h; y++) st.add(x, y, z, y === h ? 'snow' : 'ice'); }
  for (let y = 11; y <= 14; y++) for (const [x, z] of [[-1, -17], [1, -17], [-1, -15], [1, -15]]) st.add(x, y, z, 'log'); for (let x = -2; x <= 2; x++) for (let z = -18; z <= -14; z++) st.add(x, 15, z, 'jam');
  const houses = [[-12, 4, 'jam'], [12, 4, 'quartz'], [-16, -4, 'plank'], [16, -4, 'jam'], [10, 15, 'brick']];
  for (const [cx, cz, m] of houses) { for (let y = 1; y <= 3; y++) for (let x = cx - 2; x <= cx + 2; x++) for (let z = cz - 2; z <= cz + 2; z++) { if (x > cx - 2 && x < cx + 2 && z > cz - 2 && z < cz + 2) continue; if (z === cz + 2 && x === cx && y <= 2) continue; st.add(x, y, z, m); }
    for (let k = 0; k < 2; k++) for (let x = cx - 3 + k; x <= cx + 3 - k; x++) for (let z = cz - 3 + k; z <= cz + 3 - k; z++) st.add(x, 4 + k, z, 'snow'); }
  for (const [x, z, h] of [[-20, 10, 5], [20, 12, 5], [-22, -12, 6], [22, -14, 6], [-6, 22, 4], [8, 20, 5]]) tree20(st, x, z, h, false);
  st.build();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(33, 16, 12), new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false, flatShading: true })); g.add(dome);
  const bell = pivot(g, 0, 14.6, -16); box(1.4, 1.4, 1.4, '#ffd23f', 0, -0.6, 0, bell, goldM); box(0.4, 0.4, 0.4, '#8a5a00', 0, -1.5, 0, bell);
  g.add(giantL, giantB); const flakes = new THREE.InstancedMesh(GEO, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 500); flakes.frustumCulled = false; g.add(flakes);
  const ballS = box(1, 1, 1, 0, 0, 0, 0, g, snowW); const sled = new THREE.Group(); box(1.4, 0.2, 2.6, '#e8344e', 0, 0.2, 0, sled); for (const x of [-0.6, 0.6]) box(0.1, 0.2, 2.8, '#c0c0c8', x, 0.05, 0.1, sled); g.add(sled);
  burst(E.inside + 1.2, [0, 1, 6], { n: 120, colors: ['#ffffff', '#e8f4fc'], speed: 6, size: 0.2, life: 1.6, grav: 6, up: 5 }); burst(E.house + 0.2, [-12, 2, 4], { n: 120, colors: ['#ffffff', '#ff6b6b', '#e8f4fc'], speed: 7, size: 0.2, life: 1.6, grav: 7, up: 5 });
  burst(E.bell, [0, 14, -16], { n: 120, colors: ['#ffe066', '#ffffff', '#5ff7ff'], speed: 7, size: 0.16, life: 2, grav: 2, up: 4 }); for (let t = E.bell + 2; t < E.escape; t += 0.3) burst(t, [0, 12 + (t - E.bell) * 1.4, -14], { n: 10, colors: ['#5ff7ff', '#ffffff', '#ffe066'], speed: 3, size: 0.12, life: 1, grav: -2, up: 2 });
  const sledK = [[E.sled, -4, 7, -10, 0], [E.sled + 6, -6, 0.5, 2, 0], [E.sled + 8, -6, 0.5, 4, 0]];
  const C = [[E.inside, 0, 30, 20, 0, 1, 4, 60], [E.inside + 1.2, 4, 3, 14, 0, 1, 6, 54], [45.9, 3, 2.6, 12, 0, 1, 6, 50], [46, -4, 2, 10, 0, 1.2, 6, 48], [51.9, -3, 2, 9, 0, 1.2, 6, 46], [52, 2.6, 2.6, 9, 0.6, 2.2, 5.4, 42], [61.9, 2.2, 2.6, 8.6, 0.6, 2.2, 5.4, 40],
    [62, 0, 4, 16, 0, 6, -20, 60], [69.9, 0, 3, 14, 0, 10, -30, 58], [70, 6, 3, 10, -2, 2, 0, 50], [79.9, 4, 4, 2, -3, 3, -6, 50], [80, -10, 8, -4, -4, 6, -8, 52], [E.sled + 8, -12, 3, 8, -6, 1, 3, 52], [90, -4, 3, 10, -4, 2, 0, 50], [E.drill, -3, 3, 9, -4, 2, 0, 48],
    [E.quake2, 6, 6, 10, -4, 3, -4, 58], [E.quake2 + 2, 2, 4, 9, -8, 1.6, 3, 54], [E.house + 2, -6, 3, 12, -12, 1.6, 4, 52], [E.twist, -4, 2.6, 4, -6, 2, 0, 44], [125.9, -4.4, 2.6, 3.6, -6, 2, 0, 42],
    [126, 8, 8, 6, 0, 6, -10, 54], [139.9, 6, 13, -4, 0, 12, -14, 52], [140, 4, 15.6, -10, 0, 14.4, -16, 46], [147.9, 3.6, 15.6, -10.4, 0, 14.4, -16, 44], [148, 0, 18, 6, 0, 16, -16, 56], [E.escape, 0, 22, 4, 0, 24, -16, 60]];
  function update(t) {
    hideMisc(); hide24(); [hero.root, bloop6.B.root, L6.root, mayor.root, ...flurries.map(f => f.root)].forEach(o => parentTo(o, g)); globe.visible = false; bloop6.B.root.visible = L6.root.visible = false; mailBird.root.visible = false; snowMac.visible = false;
    const q1 = win(t, E.quake1, E.quake1 + 6), q2 = win(t, E.quake2, E.quake2 + 8), q3 = win(t, E.drill + 6, E.drill + 9), quake = q1 || q2 || q3;
    g.position.set(quake ? Math.sin(t * 40) * 0.3 : 0, 0, quake ? Math.cos(t * 33) * 0.3 : 0);
    // snow flurries in the air (blizzard when shaken)
    for (let i = 0; i < 500; i++) { const r1 = hash2(i, 1, 9), r2 = hash2(i, 2, 9), r3 = hash2(i, 3, 9), sp = quake ? 6 : 1.2, a = t * (quake ? 3 : 0.2) + r1 * 6.28, rr = 4 + r2 * 24;
      _m.compose(_p.set(Math.cos(a) * rr, 1 + ((r3 * 30 - t * sp) % 30 + 30) % 30, Math.sin(a) * rr), _q.identity(), _s.set(0.18, 0.18, 0.18)); flakes.setMatrixAt(i, _m); } flakes.instanceMatrix.needsUpdate = true;
    // giant faces outside
    giantL.visible = q1 || q3 || win(t, E.twist + 6, E.twist + 9); giantL.position.set(0, 18, -58 + (giantL.visible ? Math.sin(t * 2) * 2 : 0)); giantL.rotation.set(0.2, 0, Math.sin(t * 3) * 0.1);
    giantB.visible = win(t, E.drill - 2, E.drill + 6) || q2; giantB.position.set(-40, 14, 30); giantB.rotation.y = 2.3;
    // me
    let H_ = act(t, [[E.inside + 1.2, 0, 0.5, 6], [E.flurries, 0, 0.5, 6], [E.trek, 0, 0.5, 6], [E.sled - 1, -4, 7.2, -10]], [[0, { face: 'scared', flat: t < E.flurries ? 1 : 0, flatDir: -1, yaw: PI }], [E.flurries, { face: 'scared', yaw: PI }], [E.mayor, { face: 'normal', yaw: PI - 0.3 }], [E.quake1, { face: 'scared', panic: true, yaw: PI }], [E.trek, { face: 'smug' }]]);
    if (t < E.inside + 1.2) H_ = { p: [0, lerp(30, 0.5, seg(t, E.inside, E.inside + 1.2) ** 2), 6], yaw: PI, face: 'scared', panic: true };
    if (q1) { H_.p = [Math.sin(t * 5) * 1.5, 0.5, 6 + Math.cos(t * 4)]; H_.flat = 1; }
    if (t > E.sled - 1) { const sp = arcPath(t, sledK); H_ = { p: [sp[0], sp[1] + 0.2, sp[2]], yaw: 0, sit: 1, face: 'smug', wave: true }; if (t > E.sled + 8) H_ = act(t, [[E.sled + 8, -6, 0.5, 4], [E.quake2, -4, 0.5, -2]], [[0, { face: 'smug' }]]); }
    if (t > E.quake2) { const k = seg(t, E.quake2 + 1, E.house); H_ = { p: L3([-4, 3, -6], [-10.6, 1.4, 4], k), yaw: 1, face: 'scared', panic: true, flat: 1, spin: t * 8 }; if (t > E.house) H_ = { p: [-9.8, 0.5, 5.4], yaw: 0.6, face: 'soot', flat: t < E.house + 3 ? 1 : 0, flatDir: -1 }; }
    if (t > E.twist) H_ = { p: [-5.4, 0.5, 1.4], yaw: -2.2, face: 'smug', hips: t > E.twist + 6 }; if (t > E.climb) { const a = walker(t, [[E.climb, -5.4, 0.5, 1.4], [E.climb + 8, -2, 6, -9], [E.bell - 1, -1.4, 10.5, -14.6]]); H_ = { p: a.p, yaw: a.yaw, walk: 1, phase: a.phase * 2, face: 'smug' }; }
    if (t > E.bell - 1) H_ = { p: [-1.4, 10.5, -14.6], yaw: 2.6, face: 'smug', swing: win(t, E.bell - 0.6, E.bell + 3) ? t * 2 : undefined, wave: t > E.bell + 3 }; if (t > E.bell + 4) { H_.p = [-1.4, 10.5 + (t - E.bell - 4) * 2.4, -14.6]; H_.panic = true; H_.face = 'scared'; }
    pose(hero, { t, ...H_ });
    // snowball rolling gag
    ballS.visible = win(t, E.quake2 + 1, E.house + 0.2); if (ballS.visible) { const k = seg(t, E.quake2 + 1, E.house); const p = L3([-4, 3, -6], [-10.6, 1.4, 4], k); const sc = 1 + k * 2.4; ballS.position.set(p[0], p[1] + sc * 0.4, p[2]); ballS.scale.setScalar(sc); ballS.rotation.set(t * 6, 0, t * 3); hero.root.visible = false; }
    sled.visible = win(t, E.sled - 1, E.sled + 8.4); if (sled.visible) { const sp = arcPath(t, sledK); sled.position.set(sp[0], sp[1] - 0.2, sp[2]); sled.rotation.set(-0.35 * (t < E.sled + 6 ? 1 : 0), 0, 0); }
    // the bell
    bell.rotation.z = win(t, E.bell, E.bell + 8) ? Math.sin((t - E.bell) * 8) * 0.6 * (1 - seg(t, E.bell, E.bell + 8)) : 0;
    // Mayor Flurrington + the Flurries
    const crowd = [mayor, ...flurries]; crowd.forEach((f, i) => { f.root.visible = t > E.flurries - 1 || i > 0 && false; f.root.scale.setScalar(i ? 1 : 1.5); const a0 = i * 0.8 - 2.4;
      let p = [Math.cos(a0) * 3.4, 0.5, 6 + Math.sin(a0) * 3.4 - 1], y = faceTo(p, [0, 0, 6]), o = { seed: i, hop: win(t, E.flurries, E.flurries + 3) };
      if (t < E.flurries + 1) { const k = seg(t, E.flurries - 1, E.flurries + 1); p = L3([p[0] * 4, 0.5, p[2] * 2], p, k); }
      if (i === 0) { p = [1.2, 0.5, 3.6]; y = faceTo(p, [0, 0, 6]); o = { point: win(t, E.mayor, E.mayor + 8), wave: win(t, E.mayor + 8, E.quake1) }; }
      if (q1) o = { seed: i, cheer: true, hop: true, tumble: i % 3 === 0 };
      if (t > E.trek) { const a = walker(t - i * 0.4, [[E.trek, p[0], 0.5, p[2]], [E.sled - 1, -4 + (i % 3) - 1, 6.5, -9 - Math.floor(i / 3)], [E.sled + 8, -6 + (i % 4) * 1.3, 0.5, 6 + Math.floor(i / 4) * 1.3]]); p = a.p; y = a.walk > 0.05 ? a.yaw : 0; o = { seed: i, hop: a.walk > 0.05 }; }
      if (q2) o = { seed: i, cheer: true, hop: true };
      if (t > E.twist) { p = [-7 + (i % 3) * 1.4, 0.5, -0.6 - Math.floor(i / 3) * 1.4]; y = faceTo(p, [-5.4, 0, 1.4]); o = { seed: i, hop: win(t, E.twist + 4, E.twist + 8), point: i === 0 && win(t, E.twist, E.twist + 4), wave: i > 0 && win(t, E.twist + 4, E.climb) }; }
      if (t > E.climb) { const a = walker(t - i * 0.5, [[E.climb, -7 + (i % 3) * 1.4, 0.5, -0.6], [E.climb + 8, -3 + (i % 3), 5.4, -8], [E.bell - 1, -3 + (i % 3) * 1.6 + (i > 4 ? 2 : 0), 10.5, -13 - Math.floor(i / 3) * 0.6]]); p = a.p; y = a.walk > 0.05 ? a.yaw : PI; o = { seed: i, hop: true, cheer: t > E.bell }; }
      if (t > E.bell + 4 && i < 6) { p = [p[0], p[1] + (t - E.bell - 4) * 2.4, p[2]]; o = { seed: i, wave: true }; }
      poseFlurry(f, t, p, y, o); });
    let cam = camKeys(t, C); if (win(t, E.sled - 1, E.sled + 8)) { const sp = arcPath(t, sledK); cam = { p: [sp[0] + 5, sp[1] + 2.4, sp[2] + 6], l: [sp[0], sp[1] + 0.8, sp[2]], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
