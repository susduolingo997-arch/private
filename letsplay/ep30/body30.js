// ---------------------------------------------------------------- Ep 30 helpers: the DEEP DIPPER (no windows), Mo the anglerfish, the Glow Pearl, fish schools, kelp, light rays, the sonar HUD
const glow30 = (c, i = 0.6) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const _v30 = new THREE.Vector3();
const wpos30 = o => { o.getWorldPosition(_v30); return [_v30.x, _v30.y, _v30.z]; };
const lp30 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const bub30 = (t, p, n = 14, s = 0.12) => burst(t, p, { n, colors: ['#dff6ff', '#ffffff', '#9fdcff'], speed: 0.8, size: s, life: 2.2, grav: -2.5, up: 0.6 });
const bubS30 = (t0, t1, pos, dt = 0.12, s = 0.1) => smoke(t0, t1, dt, pos, { n: 2, colors: ['#dff6ff', '#ffffff', '#9fdcff'], speed: 0.4, size: s, life: 2, grav: -2.5, up: 0.8 });
const splash30 = (t, p, n = 80) => burst(t, p, { n, colors: ['#ffffff', '#bfe8ff', '#7cc8f0'], speed: 5, size: 0.2, life: 1.3, grav: 9, up: 5 });
// ---- the DEEP DIPPER: yellow, chunky, propeller, claw arm, periscope, a cupholder (outside), zero windows (until act 3: forty)
function makeSub30() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const hull = new THREE.MeshLambertMaterial({ color: '#ffc23a' }), dk = new THREE.MeshLambertMaterial({ color: '#c8861a' }), red = new THREE.MeshLambertMaterial({ color: '#e8344e' }), steel = new THREE.MeshLambertMaterial({ color: '#8a8a98' });
  box(2.6, 2.4, 6, 0, 0, 0, 0, body, hull); box(2.64, 0.4, 6.04, 0, 0, -0.3, 0, body, red);
  box(2.0, 2.0, 0.8, 0, 0, 0, 3.4, body, hull); box(1.3, 1.3, 0.4, 0, 0, 0, 4.0, body, dk);
  box(2.0, 2.0, 0.8, 0, 0, 0, -3.4, body, hull); box(1.2, 1.2, 0.4, 0, 0, 0, -4.0, body, dk);
  box(0.16, 1.5, 1.1, 0, 0, 1.6, -3.4, body, red); box(3.2, 0.16, 1.1, 0, 0, 0, -3.4, body, red);
  box(1.4, 1.1, 1.9, 0, 0, 1.75, 0.3, body, hull); box(1.5, 0.12, 2.0, 0, 0, 2.3, 0.3, body, dk); box(1.0, 0.06, 1.0, '#222230', 0, 2.37, 0.3, body);
  const lid = pivot(body, 0, 2.4, -0.15); box(0.9, 0.1, 0.9, 0, 0, 0, 0.45, lid, steel); box(0.3, 0.1, 0.1, '#444444', 0, 0.08, 0.7, lid);
  const peri = pivot(body, 0.42, 1.0, 0.9); box(0.16, 1.4, 0.16, 0, 0, 0.7, 0, peri, steel); box(0.24, 0.24, 0.5, 0, 0, 1.45, 0.15, peri, steel); box(0.18, 0.18, 0.04, 0, 0, 1.45, 0.41, peri, glow30('#5ff7ff', 0.7));
  const prop = pivot(body, 0, 0, -4.35); box(0.3, 0.3, 0.3, 0, 0, 0, 0, prop, steel); for (let i = 0; i < 3; i++) { const b = box(0.34, 1.6, 0.08, 0, 0, 0, 0, prop, steel); b.rotation.z = i * PI / 3; }
  const lampM = glow30('#fff6c0', 0.2); box(0.7, 0.42, 0.12, 0, 0, 0.75, 4.25, body, lampM);
  const hl = new THREE.PointLight('#fff2c0', 0, 26, 1.3); hl.position.set(0, 0.6, 5.6); body.add(hl);
  const arm = pivot(body, 0, -0.95, 3.7), seg = box(0.26, 0.26, 1, 0, 0, 0, 0.5, arm, steel), hand = pivot(arm, 0, 0, 1);
  box(0.42, 0.32, 0.3, 0, 0, 0, 0.1, hand, steel); const fU = pivot(hand, 0, 0.12, 0.22), fD = pivot(hand, 0, -0.12, 0.22);
  box(0.12, 0.08, 0.5, 0, 0, 0, 0.25, fU, red); box(0.12, 0.08, 0.5, 0, 0, 0, 0.25, fD, red); const clawTip = pivot(hand, 0, 0, 0.45);
  const cup = new THREE.Group(); body.add(cup); box(0.1, 0.5, 0.5, '#888888', -1.36, 0.2, 1.6, cup); box(0.3, 0.42, 0.3, '#ffffff', -1.6, 0.6, 1.6, cup); box(0.32, 0.08, 0.32, '#e8344e', -1.6, 0.68, 1.6, cup); box(0.04, 0.4, 0.04, '#ff5ca8', -1.55, 0.95, 1.6, cup);
  for (const sd of [-1, 1]) plane26(2.6, 0.55, txtMat26(['DEEP DIPPER'], 384, 80, '#ffc23a', '#1a2a5a', 46), body, sd * 1.32, 0.95, -1.0, sd * PI / 2);
  const glassM = new THREE.MeshLambertMaterial({ color: '#bff0ff', emissive: '#5fc8e8', emissiveIntensity: 0.55, transparent: true, opacity: 0.88 }), holeM = new THREE.MeshBasicMaterial({ color: '#06121c' }), rimM = new THREE.MeshLambertMaterial({ color: '#8a8a98' });
  const wins = [], holes = [];
  const addW = (x, y, z, ry) => { const w = pivot(body, x, y, z); w.rotation.y = ry; box(0.56, 0.56, 0.05, 0, 0, 0, 0, w, rimM); box(0.44, 0.44, 0.07, 0, 0, 0, 0, w, glassM); const h = box(0.46, 0.46, 0.08, 0, x, y, z, body, holeM); h.rotation.y = ry; wins.push(w); holes.push(h); };
  for (const sd of [-1, 1]) for (const y of [0.3, -0.85]) for (let i = 0; i < 8; i++) addW(sd * 1.32, y, -2.65 + i * 0.76, PI / 2);
  for (const sd of [-1, 1]) for (const z of [0.0, 0.65]) addW(sd * 0.72, 1.75, z, PI / 2);
  for (const x of [-0.78, 0.78]) for (const y of [-0.72, 0.72]) addW(x, y, 3.81, 0);
  root.traverse(o => { if (o.isMesh) o.castShadow = o.material !== glassM; });
  return { root, body, lid, peri, prop, hl, lampM, arm, seg, hand, fU, fD, clawTip, wins, holes, cup };
}
function poseSub30(S, t, p, yaw, o = {}) {
  S.root.visible = o.vis !== false; S.root.position.set(...p); S.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); S.root.scale.setScalar(o.s ?? 1);
  S.body.position.y = o.bob ? Math.sin(t * 1.6) * 0.08 : 0; S.body.rotation.z = o.bob ? Math.sin(t * 1.1) * 0.03 : 0;
  S.prop.rotation.z = t * (o.prop ?? 0);
  S.lid.rotation.x = -(o.lid || 0) * 1.9; S.peri.position.y = 1.0 + (o.peri || 0) * 1.3;
  S.hl.intensity = o.light ?? 0; S.lampM.emissiveIntensity = (o.light ?? 0) > 0 ? 1.2 : 0.2;
  const ext = o.ext ?? 0.6; S.arm.rotation.x = o.armX ?? 0.9; S.seg.scale.z = ext; S.seg.position.z = ext / 2; S.hand.position.z = ext;
  const op = o.open ?? 0; S.fU.rotation.x = -op * 0.7; S.fD.rotation.x = op * 0.7;
  const n = o.nWin ?? 0; S.wins.forEach((w, i) => w.visible = !o.broken && i < n); S.holes.forEach(h => h.visible = !!o.broken);
  S.cup.visible = o.cup !== false;
}
// ---- Mo: a giant blocky anglerfish. underbite, lantern lure, very lonely in the dark (the "Glow Pearl" is her light bulb)
function makeMo30() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const skin = new THREE.MeshLambertMaterial({ color: '#4a3a7a' }), belly = new THREE.MeshLambertMaterial({ color: '#9a8ac8' }), fin = new THREE.MeshLambertMaterial({ color: '#7a4ab8' }), tooth = new THREE.MeshLambertMaterial({ color: '#f4f0e0', emissive: '#f4f0e0', emissiveIntensity: 0.2 }), spot = glow30('#5ff7ff', 0.5);
  box(4.0, 3.2, 4.0, 0, 0, 0, -0.4, body, skin); box(3.6, 0.5, 3.6, 0, 0, -1.6, -0.4, body, belly); box(3.0, 2.4, 1.8, 0, 0, 0.2, -3.2, body, skin);
  for (const [sd, y, z] of [[1, 0.8, -1.2], [-1, 0.4, -0.2], [1, -0.5, 0.6], [-1, 0.9, -1.8], [-1, -0.6, 0.8]]) box(0.12, 0.3, 0.3, 0, sd * 2.02, y, z, body, spot);
  for (let i = 0; i < 4; i++) box(0.2, 0.7 - i * 0.1, 0.5, 0, 0, 1.95 - i * 0.05, -1.4 - i * 0.8, body, fin);
  const tail = pivot(body, 0, 0.2, -4.1); box(0.3, 3.0, 1.6, 0, 0, 0, -0.8, tail, fin);
  const fins = [-1, 1].map(sd => { const p = pivot(body, sd * 2.0, -0.6, 0.4); box(1.6, 0.14, 1.1, 0, sd * 0.8, 0, 0, p, fin); return p; });
  const head = pivot(body, 0, 0.4, 1.6); box(4.2, 2.0, 2.6, 0, 0, 0.3, 1.3, head, skin);
  box(3.8, 1.3, 0.2, '#3a0a1a', 0, -0.9, 0.3, head);
  for (let i = 0; i < 7; i++) box(0.24, 0.5, 0.24, 0, -1.8 + i * 0.6, -0.95, 2.4, head, tooth);
  const jaw = pivot(head, 0, -0.8, 0.1); box(4.2, 0.9, 2.9, 0, 0, -0.45, 1.45, jaw, skin); box(3.8, 0.12, 2.6, '#7a1a3a', 0, 0.02, 1.4, jaw);
  for (let i = 0; i < 6; i++) box(0.24, 0.55, 0.24, 0, -1.5 + i * 0.6, 0.27, 2.75, jaw, tooth);
  const eyeW = new THREE.MeshBasicMaterial({ color: '#fff4c0' }), eyeI = new THREE.MeshBasicMaterial({ color: '#ffb020' });
  const eyes = [-1, 1].map(sd => { const e = pivot(head, sd * 1.35, 1.0, 2.4); box(1.0, 1.0, 0.7, 0, 0, 0, 0, e, eyeW); box(0.6, 0.6, 0.1, 0, 0, 0, 0.36, e, eyeI); box(0.34, 0.34, 0.12, '#111111', 0, 0, 0.38, e); box(0.14, 0.14, 0.13, 0, 0.12, 0.12, 0.4, e, new THREE.MeshBasicMaterial({ color: '#ffffff' })); return e; });
  const lids = [-1, 1].map(sd => box(1.08, 1.08, 0.78, 0, sd * 1.35, 1.0, 2.4, head, skin));
  const blush = [-1, 1].map(sd => box(0.6, 0.3, 0.1, '#ff7ac0', sd * 1.5, 0.15, 2.62, head));
  const l1 = pivot(head, 0, 1.3, 1.4); box(0.18, 1.6, 0.18, 0, 0, 0.8, 0, l1, fin);
  const l2 = pivot(l1, 0, 1.6, 0); box(0.16, 1.4, 0.16, 0, 0, 0.7, 0, l2, fin);
  const l3 = pivot(l2, 0, 1.4, 0); box(0.14, 0.9, 0.14, 0, 0, 0.45, 0, l3, fin);
  const tip = pivot(l3, 0, 1.05, 0); box(0.26, 0.26, 0.26, '#2a2040', 0, -0.1, 0, tip);
  const mouth = pivot(head, 0, -0.6, 3.2);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, head, jaw, tail, fins, eyes, lids, blush, lure: [l1, l2, l3], tip, mouth };
}
function poseMo30(m, t, p, yaw, o = {}) {
  m.root.visible = true; m.root.position.set(...p); m.root.rotation.set(o.pitch || 0, yaw, 0); m.root.scale.setScalar(o.s ?? 1.6);
  m.tail.rotation.y = Math.sin(t * (o.swim ? 7 : 2)) * (o.swim ? 0.5 : 0.2); m.body.rotation.z = o.wiggle ? Math.sin(t * 9) * 0.12 : 0; m.body.position.y = Math.sin(t * 1.3) * 0.08;
  m.body.scale.set(o.puff ? 1.2 : 1, 1, 1);
  m.fins.forEach((f, i) => f.rotation.z = (i ? -1 : 1) * Math.sin(t * (o.wave && !i ? 11 : 4) + i) * (o.wave && !i ? 0.9 : 0.3));
  m.jaw.rotation.x = o.jaw ?? (o.chomp ? Math.abs(Math.sin(t * 5)) * 0.8 : 0.04);
  m.lids.forEach(l => l.visible = !!o.sleep); m.eyes.forEach(e => e.scale.set(1, o.happy ? 0.3 : 1, 1)); m.blush.forEach(b => b.visible = !!o.happy);
  m.lure[0].rotation.x = 0.15 + Math.sin(t * 1.5) * 0.05; m.lure[1].rotation.x = 1.0 + Math.sin(t * 2) * 0.08; m.lure[2].rotation.x = 1.0;
  m.head.rotation.x = o.headX || 0;
}
// ---- fish, kelp, light rays
function makeSchool30(n, cols, seed, glow = false) { const g = new THREE.Group(), F = [];
  for (let i = 0; i < n; i++) { const f = new THREE.Group(), c = cols[i % cols.length]; box(0.16, 0.3, 0.5, 0, 0, 0, 0, f, glow ? glow30(c, 0.6) : new THREE.MeshLambertMaterial({ color: c })); box(0.05, 0.26, 0.2, shade(c, 0.8), 0, 0, -0.33, f); box(0.17, 0.06, 0.06, '#111111', 0, 0.06, 0.18, f); g.add(f);
    F.push({ f, a: hash2(i, 1, seed) * 6.28, r: hash2(i, 2, seed) * 1.6, y: (hash2(i, 3, seed) - 0.5) * 1.6, s: 0.8 + hash2(i, 4, seed) * 0.4 }); }
  return { g, F }; }
function poseSchool30(S, t, c, R = 3, sp = 0.6) { S.g.visible = true; S.F.forEach((q, i) => { const a = t * sp * q.s + q.a, r = R + q.r; q.f.position.set(c[0] + Math.cos(a) * r, c[1] + q.y + Math.sin(t * 2 + i) * 0.2, c[2] + Math.sin(a) * r); q.f.rotation.y = sp > 0 ? -a : -a + PI; }); }
function kelp30(parent, x, y, z, n) { const p = pivot(parent, x, y, z); for (let k = 0; k < n; k++) { box(0.32, 1.02, 0.32, k % 2 ? '#2e8a4a' : '#3a9a52', 0, k + 0.5, 0, p); if (k % 2) box(0.7, 0.12, 0.3, '#4ab05a', k % 4 === 1 ? 0.4 : -0.4, k + 0.6, 0, p); } return p; }
const rayM30 = new THREE.MeshBasicMaterial({ color: '#cff4ff', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending });
const sub30 = makeSub30(), mo30 = makeMo30();
// ---- the Glow Pearl (on Mo's lure), the mini pearl (Leggy's), invoices, the tarp, the bottle
const pearl30 = new THREE.Group(); { const m = glow30('#e8fbff', 1.0); for (const [w, h, d] of [[0.5, 0.5, 0.5], [0.66, 0.3, 0.3], [0.3, 0.66, 0.3], [0.3, 0.3, 0.66]]) box(w, h, d, 0, 0, 0, 0, pearl30, m); pearl30.userData.m = m; }
const pearlL30 = new THREE.PointLight('#bff8ff', 0, 22, 1.2); pearl30.add(pearlL30);
function setPearl30(on) { const m = pearl30.userData.m; m.emissiveIntensity = on ? 1.0 : 0.04; m.color.set(on ? '#e8fbff' : '#7a7a8a'); pearlL30.intensity = on ? 16 : 0; }
const mini30 = new THREE.Group(); { const m = glow30('#ffd8f4', 1.0); for (const [w, h, d] of [[0.26, 0.26, 0.26], [0.34, 0.14, 0.14], [0.14, 0.34, 0.14]]) box(w, h, d, 0, 0, 0, 0, mini30, m); }
const miniF30 = mini30.clone(); miniF30.scale.setScalar(1.4);
L6.hd.add(mini30); mini30.position.set(0, 0.62, 0.35); mini30.visible = false;
L6.tips = L6.legs.map((p, i) => pivot(p, (i < 3 ? -1 : 1) * 0.95, -0.9, 0));
function plug30(k) { L6.body.position.y = lerp(L6.body.position.y, 1.0, k); L6.legs.forEach((l, i) => { l.rotation.z = (i < 3 ? 1 : -1) * 1.35 * k; l.rotation.x = [0.6, 0, -0.6][i % 3] * k; }); }
const inv30a = card28(['INVOICE', 'WINDOWS x40'], '#ffffff', '#c0182a', 28), inv30b = card28(['INVOICE', 'x40 (AGAIN)'], '#ffffff', '#c0182a', 28);
for (const c of [inv30a, inv30b]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const tarp30 = new THREE.Group(); box(3.3, 3.0, 9.4, '#3a6ad0', 0, 0, 0, tarp30); box(3.4, 0.5, 9.5, '#2a50a8', 0, 1.0, 0, tarp30); for (const z of [-3, 0, 3]) box(3.36, 3.06, 0.14, '#d9b070', 0, 0, z, tarp30); box(1.6, 1.4, 2.2, '#3a6ad0', 0, 2.0, 0.3, tarp30);
const bottle30 = new THREE.Group(); box(0.28, 0.5, 0.28, 0, 0, 0, 0, bottle30, new THREE.MeshLambertMaterial({ color: '#6ad08a', transparent: true, opacity: 0.8 })); box(0.14, 0.2, 0.14, '#6ad08a', 0, 0.33, 0, bottle30); box(0.12, 0.1, 0.12, '#a07a40', 0, 0.46, 0, bottle30); box(0.16, 0.3, 0.05, '#f6e7c1', 0, 0, 0, bottle30);
const seaObjs30 = [sub30.root, mo30.root, pearl30, tarp30, bottle30, miniF30];
function hide30() { hide29(); [...seaObjs30, inv30a, inv30b, mini30].forEach(o => o.visible = false); }
function reset30(g) { [hero.root, bloop6.B.root, L6.root, ...seaObjs30].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; }
// ---- the sonar: the mechanic that (sort of) replaces windows
const DEP30 = [[0, 0], [E.sbDive, 0], [E.sbCabin, 6], [E.sbDeep, 18], [E.sbIdea, 42], [E.sbTrench, 44], [E.sbClaw, 138], [E.sbTow, 138], [E.sbBreach, 0], [E.sbDive2, 0], [E.sbView, 8], [E.sbSpit, 8]];
function drawSonar30(t) { const on = win(t, E.sbSonar, E.sbBreach) || win(t, E.sbDive2, E.sbSpit); if (!on || t >= E.freeze) return;
  rrect(22, 96, 250, 124, 12); ctx.fillStyle = 'rgba(6,24,20,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7cff6b'; ctx.stroke();
  const cx = 76, cy = 158, R = 46; ctx.fillStyle = '#062a14'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(124,255,107,.45)'; ctx.lineWidth = 1.5; for (const r of [R, R * 0.66, R * 0.33]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); }
  const a = t * 2.4; ctx.strokeStyle = '#7cff6b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  const big = win(t, E.sbClaw - 3, E.sbBreach), mo = t > E.sbMo;
  const blips = [[0.5, 0.6, 3], [2.2, 0.8, 3], [4.0, 0.4, 3]]; if (big) blips.push([-1.57 + Math.sin(t * 0.5) * 0.1, mo ? 0.5 : 0.8, mo ? 11 : 7]);
  for (const [ba, br, s] of blips) { const f = 1 - ((((a - ba) % 6.283) + 6.283) % 6.283) / 6.283; ctx.fillStyle = s > 8 ? `rgba(255,80,60,${0.4 + 0.6 * f})` : `rgba(124,255,107,${0.3 + 0.7 * f})`; ctx.beginPath(); ctx.arc(cx + Math.cos(ba) * br * R, cy + Math.sin(ba) * br * R, s, 0, 7); ctx.fill(); }
  if (big) outlined(mo ? 'NOT A ROCK' : 'big rock?', cx, cy - R + 4, 11, mo ? '#ff6b5a' : '#bfffb0', '#000', 3);
  const d = Math.round(lerpK(DEP30, t)), nw = t < E.sbChip ? 0 : t < E.sbBreach ? 1 : t < E.sbBurst ? 40 : 0, fl = Math.floor(t * 4) % 2;
  outlined('SONAR', 200, 112, 15, '#7cff6b', '#000', 3); outlined('DEPTH', 200, 136, 12, '#bfffb0', '#000', 3); outlined(d + ' m', 200, 158, 24, '#ffffff', '#000', 5);
  outlined('WINDOWS: ' + nw + (t >= E.sbChip && t < E.sbBreach ? ' (tiny)' : t >= E.sbBurst ? ' (again)' : ''), 200, 194, 12, nw === 0 && fl ? '#ff6b5a' : '#ffe066', '#000', 3); }
function drawMap30(T) { const s = E.sbBottle + 2.6, e = E.sbBottle + 6.8; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.45 + (1 - k) * 60); ctx.rotate(-0.04);
  ctx.fillStyle = '#f2dfb0'; ctx.fillRect(-200, -150, 400, 300); ctx.strokeStyle = '#a07a40'; ctx.lineWidth = 6; ctx.strokeRect(-200, -150, 400, 300);
  outlined('THE GLOW PEARL', 0, -110, 30, '#5a2a10', '#f2dfb0', 2);
  ctx.font = F(19, 'normal'); ctx.fillStyle = '#3a2410'; ctx.textAlign = 'center'; ['Gloom Trench. Very bottom.', 'It glows. It is a pearl.', 'Finders keepers!'].forEach((l, i) => { if (T > s + 0.6 + i * 0.8) ctx.fillText(l, 0, -60 + i * 34); });
  ctx.strokeStyle = '#3a6ad0'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -160; x <= 160; x += 8) ctx.lineTo(x, 70 + Math.sin(x * 0.08) * 5); ctx.stroke();
  ctx.strokeStyle = '#3a2410'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(-140, 74); ctx.quadraticCurveTo(0, 150, 100, 120); ctx.stroke(); ctx.setLineDash([]);
  if (T > s + 2.6) outlined('X', 108, 118, 34, '#c0182a', '#f2dfb0', 2);
  ctx.restore(); }
function drawPeri30(T) { const s = E.sbPeri + 1.4, e = E.sbPeri + 4.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, e - 0.25, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.beginPath(); ctx.arc(W / 2, H / 2, H * 0.4, 0, 7); ctx.clip();
  const gr = ctx.createLinearGradient(0, H * 0.1, 0, H * 0.9); gr.addColorStop(0, '#2a8ab0'); gr.addColorStop(1, '#0a3050'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const r = rng(30); for (let i = 0; i < 30; i++) { const x = W * 0.3 + r() * W * 0.4, y = H - ((r() * H + (T - s) * (60 + r() * 80)) % H); ctx.fillStyle = 'rgba(220,250,255,.6)'; ctx.beginPath(); ctx.arc(x, y, 3 + r() * 6, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - H * 0.4, H / 2); ctx.lineTo(W / 2 + H * 0.4, H / 2); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.9); ctx.stroke();
  ctx.restore(); ctx.save(); ctx.globalAlpha = k; outlined('PERISCOPE CAM', W / 2, H * 0.06, 22, '#5ff7ff', '#000', 4); if (T > s + 1) outlined('...water.', W / 2, H * 0.62, 44, '#ffffff', '#000', 7); ctx.restore(); }

// ================================================================ EPISODE 30: "THE SUBMARINE (Bloop forgot the windows)" — the harbor by day (the Deep Dipper; a bottle with a map to the Glow Pearl; no windows) → the cabin (periscope: water; sonar) → the deep (kelp; CLONK x2) → the cabin (I make a window; six leaks, six legs; an EYE) → the Gloom Trench (the claw; the pearl was Mo's lure; chase; Leggy gives it back; Mo carries us up) → the harbor at sunset (thrown home; a mini pearl for Leggy; forty windows + invoice; test dive) → the reef (Mo waves; tap tap CRACK; gulp) → the harbor (spat onto the dock; the teeter; it sinks)
// ---------------------------------------------------------------- set A: the harbor (day, then sunset)
const SUBD30 = [6, 1.2, 4], MH30 = [12, -1.2, 15];
const harbor30 = (() => {
  const g = mk('harbor30'); const st = new VSet(g);
  for (let x = -44; x <= 44; x++) for (let z = -44; z <= 64; z++) {
    if (z <= -13) { st.add(x, 1, z, 'turf'); st.add(x, 0, z, 'soil'); continue; }
    if (z <= -9) { st.add(x, 0, z, 'sand'); continue; }
    st.add(x, -3, z, 'sand'); st.add(x, 0, z, 'water'); }
  for (let x = -2; x <= 2; x++) for (let z = -12; z <= 14; z++) st.add(x, 1, z, 'plank');
  for (const [x, z, h] of [[-14, -20, 5], [-24, -30, 6], [16, -24, 5], [28, -34, 6], [-34, -18, 5], [36, -20, 6], [8, -38, 6], [-8, -40, 5], [-40, -36, 6]]) tree29(st, x, z, h, 1);
  st.build();
  box(5, 3.4, 4, '#c8664a', -9, 3.2, -19, g); box(5.6, 0.5, 4.6, '#7a3a2a', -9, 5.1, -19, g); box(1, 2, 0.1, '#5a3a22', -9, 2.5, -16.95, g);
  board28(['BAIT & BUBBLES'], 4.4, 0.8, g, -9, 4.3, -16.9, 0, '#ffe066', '#1a3a6a', 512, 96, 52, false);
  for (let i = 0; i < 8; i++) box(2.2 - i * 0.12, 1.2, 2.2 - i * 0.12, i % 2 ? '#ffffff' : '#e8344e', 20, 2.1 + i * 1.2, -24, g);
  box(1.8, 1.4, 1.8, 0, 20, 12.3, -24, g, glow30('#fff2a0', 0.9)); box(2.2, 0.4, 2.2, '#333333', 20, 13.2, -24, g);
  for (const x of [-2.4, 2.4]) for (const z of [-8, -3, 2, 7, 12, 14.3]) box(0.5, 4, 0.5, '#6a4a2a', x, -0.6, z, g);
  for (const z of [4, 8]) box(0.5, 0.6, 0.5, '#444444', 2.2, 1.8, z, g);
  box(1, 1, 1, '#b08040', -1.7, 2.0, -6, g); box(0.9, 0.9, 0.9, '#c09050', -1.7, 2.95, -6.1, g); box(0.8, 1.1, 0.8, '#7a4a2a', 1.7, 2.05, -7, g);
  board28(['SHARDWILD HARBOR'], 4.6, 0.9, g, 0, 4.2, -12.6, 0, '#ffe066', '#1a3a6a', 640, 112, 58, true);
  const buoys = [[14, 26], [-12, 26], [22, 2], [-18, 8]].map(([x, z], i) => { const b = pivot(g, x, 0.5, z); box(0.8, 0.9, 0.8, i % 2 ? '#e8344e' : '#ffffff', 0, 0.2, 0, b); box(0.5, 0.5, 0.5, '#e8344e', 0, 0.85, 0, b); return b; });
  const gulls = [makeBird('#f4f4f4'), makeBird('#e0e4ea')]; gulls.forEach(b => g.add(b.root));
  // ---- particles
  burst(E.sbReveal + 0.4, [6, 3.5, 4], { n: 80, colors: ['#ffe066', '#ff5ca8', '#5ff7ff', '#7cff6b'], speed: 5, size: 0.15, life: 1.6, grav: 4, up: 4 });
  burst(E.sbBottle + 0.9, [-3, 0.6, 2.6], { n: 20, colors: ['#ffffff', '#bfe8ff'], speed: 2, size: 0.1, life: 0.7, grav: 8, up: 2 });
  splash30(E.sbDive + 0.6, [6, 0.6, 4], 90); bubS30(E.sbDive + 0.8, E.sbCabin, [6, 0.6, 4], 0.08, 0.14);
  splash30(E.sbBreach + 0.5, [5, 0.6, 15], 150); splash30(E.sbLand, [6, 0.6, 4], 130);
  burst(E.sbGift + 1.5, [1.4, 3.6, 10.4], { n: 40, colors: ['#ff5ca8', '#ff9ecb', '#ffffff'], speed: 2, size: 0.2, life: 1.6, grav: -1, up: 1.5 });
  for (let i = 0; i < 12; i++) burst(E.sbInstall + 0.5 + i, [6 + (hash2(i, 1, 30) - 0.5) * 2.6, 1.6 + hash2(i, 2, 30) * 1.2, 4 + (hash2(i, 3, 30) - 0.5) * 6], { n: 16, colors: ['#ffffff', '#bff0ff', '#ffe066'], speed: 2.5, size: 0.1, life: 0.6, grav: 3, up: 1 });
  burst(E.sbGlass + 0.5, [6, 2.5, 4], { n: 70, colors: ['#ffffff', '#bff0ff', '#ffe066'], speed: 4, size: 0.14, life: 1.4, grav: 1, up: 2 });
  splash30(E.sbDive2 + 0.6, [6, 0.6, 4], 90); bubS30(E.sbDive2 + 0.8, E.sbView, [6, 0.6, 4], 0.08, 0.14);
  splash30(E.sbSpit + 0.5, [5, 0.6, 15], 150); burst(E.sbSpit + 3, [0, 2, 10.5], { n: 70, colors: ['#c8a070', '#ffffff', '#9fdcff'], speed: 4, size: 0.2, life: 1, grav: 8, up: 2 });
  smoke(E.sbSpit + 3.2, E.sbSink, 0.12, [0.9, 2.6, 11.5], { n: 3, colors: ['#9fdcff', '#ffffff'], speed: 1.5, size: 0.12, life: 0.8, grav: 9, up: 1 });
  burst(E.sbInv2 + 0.5, [0.2, 3.2, 6.6], { n: 12, colors: ['#ffffff'], speed: 1, size: 0.12, life: 1, grav: 1, up: 1 });
  splash30(E.sbSink + 1.3, [0, 0.6, 18.5], 130); bubS30(E.sbSink + 1.4, E.freeze + 0.1, [0, 0.6, 19], 0.07, 0.16);
  const HAT = [6, 3.6, 4.3];
  function update(t) {
    hideMisc(); hide30(); reset30(g);
    const A3 = t >= E.sbBreach;
    buoys.forEach((b, i) => { b.position.y = 0.5 + Math.sin(t * 1.5 + i) * 0.12; b.rotation.z = Math.sin(t * 1.2 + i) * 0.12; });
    gulls.forEach((b, i) => { const a = t * 0.35 + i * 3; b.root.position.set(3 + Math.cos(a) * 14, 12 + i * 2 + Math.sin(t + i) * 0.5, 4 + Math.sin(a) * 14); b.root.rotation.set(0, -a, 0.25); b.wL.rotation.z = Math.sin(t * 8 + i) * 0.5; b.wR.rotation.z = -Math.sin(t * 8 + i) * 0.5; });
    // ---- Mo (act 3): floats by the dock, lure lit, best friends with Leggy
    let MP = [...MH30], moVis = false;
    if (A3) { moVis = true; let my, mo = { happy: true };
      if (t < E.sbView) { my = t < E.sbBreach + 1.5 ? lerp(-8, 1.4, ss(seg(t, E.sbBreach, E.sbBreach + 1.5))) : lerp(1.4, -1.2, ss(seg(t, E.sbBreach + 1.5, E.sbBreach + 3.5))); my -= 7 * seg(t, E.sbDive2, E.sbDive2 + 3);
        mo.jaw = win(t, E.sbBreach + 1.0, E.sbBreach + 1.8) ? 0.7 : win(t, E.sbGift - 0.4, E.sbGift + 0.8) ? 0.6 : 0.04; mo.wave = win(t, E.sbGlass, E.sbDive2); mo.wiggle = win(t, E.sbGift + 1, E.sbGift + 4); }
      else { my = t < E.sbSpit + 1.5 ? lerp(-8, 1.4, ss(seg(t, E.sbSpit, E.sbSpit + 1.5))) : lerp(1.4, -1.2, ss(seg(t, E.sbSpit + 1.5, E.sbSpit + 3.5))); mo.jaw = win(t, E.sbSpit + 1.0, E.sbSpit + 1.8) ? 0.7 : 0.04; mo.wave = win(t, E.sbInv2, E.sbTeeter); mo.happy = t < E.sbSink + 0.5; mo.puff = t < E.sbSpit + 1.2; }
      MP = [MH30[0], my + Math.sin(t * 1.2) * 0.1, MH30[2]]; poseMo30(mo30, t, MP, -PI / 2, mo);
      pearl30.visible = true; pearl30.position.set(...wpos30(mo30.tip)); pearl30.rotation.y = t; setPearl30(true); }
    const MOUTH = t => wl([MH30[0], 1.4, MH30[2]], -PI / 2, [0, -0.32, 7.68]);
    // ---- the sub
    let sp = [...SUBD30], syaw = 0; const so = { bob: true, prop: 0, light: 0 };
    if (!A3) {
      const claw = win(t, E.sbTour + 2.5, E.sbTour + 5); so.prop = win(t, E.sbTour, E.sbTour + 2.6) ? 14 : 0; so.armX = claw ? -0.3 + Math.sin(t * 5) * 0.4 : 0.9; so.ext = claw ? 1.2 : 0.6; so.open = claw ? Math.abs(Math.sin(t * 6)) : 0;
      so.peri = seg(t, E.sbTour + 5.4, E.sbTour + 5.8) * (1 - seg(t, E.sbBoard - 1, E.sbBoard)); so.lid = seg(t, E.sbBoard - 0.4, E.sbBoard) * (1 - seg(t, E.sbDive - 0.2, E.sbDive + 0.1));
      if (t > E.sbDive) { const k = seg(t, E.sbDive + 0.2, E.sbDive + 3.6); sp[1] = lerp(1.2, -3.6, ss(k)); so.pitch = 0.15 * Math.sin(k * PI); so.prop = 10; so.bob = false; }
    } else if (t < E.sbView) {
      so.nWin = t < E.sbInstall ? 0 : Math.floor(40 * seg(t, E.sbInstall, E.sbInstall + 11.5));
      if (t < E.sbBreach + 1.5) { parentTo(sub30.root, mo30.head); sp = [0, -0.6, 3.2]; syaw = PI / 2; so.s = 1 / 1.6; so.bob = false; }
      else if (t < E.sbLand) { const k = seg(t, E.sbBreach + 1.5, E.sbLand); sp = arcPath(t, [[E.sbBreach + 1.5, ...MOUTH(t), 0], [E.sbLand, ...SUBD30, 6]]); so.pitch = k * 2 * PI; so.bob = false; }
      so.lid = Math.max(seg(t, E.sbOut - 0.4, E.sbOut) * (1 - seg(t, E.sbOut + 4.6, E.sbOut + 5)), seg(t, E.sbBoard2 - 0.4, E.sbBoard2) * (1 - seg(t, E.sbDive2 - 0.2, E.sbDive2 + 0.1)));
      if (t > E.sbDive2) { const k = seg(t, E.sbDive2 + 0.2, E.sbDive2 + 3.6); sp[1] = lerp(1.2, -3.6, ss(k)); so.pitch = 0.15 * Math.sin(k * PI); so.prop = 10; so.bob = false; }
    } else {
      so.broken = true; so.bob = false; const S0 = E.sbSpit;
      if (t < S0 + 1.5) { parentTo(sub30.root, mo30.head); sp = [0, -0.6, 3.2]; syaw = PI / 2; so.s = 1 / 1.6; }
      else if (t < S0 + 3) { sp = arcPath(t, [[S0 + 1.5, ...MOUTH(t), 0], [S0 + 3, 0, 2.7, 10.5, 5]]); so.pitch = seg(t, S0 + 1.5, S0 + 3) * 2 * PI; }
      else if (t < S0 + 4) { sp = [0, 2.7, lerp(10.5, 12.6, ss(seg(t, S0 + 3, S0 + 4)))]; so.roll = Math.sin(t * 20) * 0.04 * (1 - seg(t, S0 + 3, S0 + 4)); }
      else if (t < E.sbSink) { sp = [0, 2.7, 12.6]; so.pitch = win(t, E.sbTeeter, E.sbSink) ? Math.sin((t - E.sbTeeter) * 3) * 0.06 * (1 + seg(t, E.sbTeeter, E.sbSink)) : 0; }
      else { const k = seg(t, E.sbSink, E.sbSink + 1.3); if (k < 1) { sp = arcPath(t, [[E.sbSink, 0, 2.7, 12.6, 0], [E.sbSink + 1.3, 0, -0.4, 19, 0.6]]); so.pitch = lerp(0.1, 0.6, k); } else { sp = [0, lerp(-0.4, -2.2, seg(t, E.sbSink + 1.3, E.freeze)), 19]; so.pitch = lerp(0.6, 0.25, seg(t, E.sbSink + 1.3, E.sbSink + 3)); } so.peri = seg(t, E.sbSink + 2.5, E.sbSink + 3.2); }
    }
    poseSub30(sub30, t, sp, syaw, so);
    if (!A3) {
      // ---- tarp, bottle
      if (t < E.sbReveal + 3) { tarp30.visible = true; const k = seg(t, E.sbReveal, E.sbReveal + 3); tarp30.position.set(...(k <= 0 ? [6, 1.3, 4] : arcPath(t, [[E.sbReveal, 6, 1.3, 4, 0], [E.sbReveal + 3, 14, 4, 18, 9]]))); tarp30.rotation.set(k * 2, k * 1.4, k * 0.8); tarp30.scale.set(1, 1 - k * 0.6, 1); }
      const HB = [0.6, 1.5, 0.4], hand = wl(HB, -0.4, [0.48, 1.45, 0.75]), lhead = wl([-1.0, 1.5, 2.6], -PI / 2, [0, 2.2, 2.1]);
      if (win(t, E.sbBottle - 3, E.sbBottle + 6.8)) { bottle30.visible = true; let bp;
        if (t < E.sbBottle + 0.9) bp = [lerp(-12, -3.0, seg(t, E.sbBottle - 3, E.sbBottle + 0.6)), 0.55 + Math.sin(t * 3) * 0.08, 2.6];
        else if (t < E.sbBottle + 1.7) bp = lp30([-3.0, 0.55, 2.6], lhead, seg(t, E.sbBottle + 0.9, E.sbBottle + 1.5));
        else if (t < E.sbBottle + 2.3) bp = arcPath(t, [[E.sbBottle + 1.7, ...lhead, 0], [E.sbBottle + 2.3, ...hand, 1]]);
        else bp = hand;
        bottle30.position.set(...bp); bottle30.rotation.set(t < E.sbBottle + 0.9 ? 1.2 : 0, 0, 0); }
      // ---- me
      const HK = [[0, 0.4, 1.5, -24], [8, 0.8, 1.5, -2.5], [E.sbBottle, 0.8, 1.5, -2.5], [E.sbBottle + 1.6, ...HB], [E.sbTour, ...HB], [E.sbTour + 2, 1.0, 1.5, 4.4]];
      const hA = act(t, HK, [[0, { face: 'smug', wave: t < 4 }], [8, { face: 'normal', yaw: faceTo([0.8, 0, -2.5], [6, 0, 4]) }], [E.sbReveal + 0.6, { face: 'smug', yaw: faceTo([0.8, 0, -2.5], [6, 0, 4]), wave: t < E.sbReveal + 3 }],
        [E.sbBottle + 1.6, { face: 'normal', yaw: -0.4 }], [E.sbBottle + 2.6, { face: 'smug', yaw: -0.4 }], [E.sbTour, { face: 'smug' }], [E.sbTour + 2, { face: 'smug', yaw: PI / 2 }], [E.sbNoWin, { face: 'normal', yaw: PI / 2, headPitch: -0.1 }],
        [E.sbNoWin + 2.5, { face: 'scared', yaw: PI / 2 }], [E.sbNoWin + 3.5, { face: 'scared', yaw: faceTo([1.0, 0, 4.4], [2.2, 0, 1.6]) }], [E.sbNoWin + 5.5, { face: 'normal', yaw: faceTo([1.0, 0, 4.4], [2.2, 0, 1.6]) }]]);
      if (t < E.sbBoard + 0.5) { pose(hero, { t, ...hA }); if (win(t, E.sbBottle + 2.2, E.sbTour)) hero.aR.rotation.set(-1.4, 0, 0); }
      else if (t < E.sbBoard + 2) pose(hero, { t, p: arcPath(t, [[E.sbBoard + 0.5, 1.0, 1.5, 4.4, 0], [E.sbBoard + 1.5, ...HAT, 1.5], [E.sbBoard + 2, 6, 2.0, 4.3, 0]]), yaw: PI / 2, face: 'smug' });
      else hero.root.visible = false;
      // ---- Bloop (built it. proud. forgot something.)
      const bA = act(t, [[0, 2.2, 1.5, -20], [7.5, 2.2, 1.5, -0.8], [E.sbTour, 2.2, 1.5, -0.8], [E.sbTour + 2, 2.2, 1.5, 1.6]], [[0, {}], [7.5, { yaw: PI / 2 }], [E.sbReveal, { yaw: PI / 2, handOut: true }], [E.sbReveal + 1, { hop: true, yaw: 0.6 }], [E.sbReveal + 3, { yaw: faceTo([2.2, 0, -0.8], [0.8, 0, -2.5]) }],
        [E.sbTour + 2, { yaw: PI / 2, handOut: true }], [E.sbNoWin + 3.5, { yaw: faceTo([2.2, 0, 1.6], [1.0, 0, 4.4]) }], [E.sbNoWin + 4.2, { yaw: faceTo([2.2, 0, 1.6], [1.0, 0, 4.4]), angry: true }], [E.sbNoWin + 6.5, { yaw: PI / 2 }]]);
      if (t < E.sbBoard + 3.8) poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA });
      else if (t < E.sbBoard + 4.9) poseBurble(bloop6, t, arcPath(t, [[E.sbBoard + 3.8, 2.2, 1.5, 1.6, 0], [E.sbBoard + 4.6, ...HAT, 1.2], [E.sbBoard + 4.9, 6, 2.6, 4.3, 0]]), PI / 2, {});
      else bloop6.B.root.visible = false;
      // ---- Leggy (finds the bottle; looks for windows)
      const lA = act(t, [[0, -2.0, 1.5, -26], [8.5, -1.4, 1.5, -4.0], [E.sbBottle - 1.4, -1.4, 1.5, -4.0], [E.sbBottle, -1.0, 1.5, 2.6], [E.sbBottle + 1.8, -1.0, 1.5, 2.6], [E.sbBottle + 3.2, -1.6, 1.5, 6.4], [E.sbTour + 1, -0.8, 1.5, 6.8], [E.sbNoWin, -0.8, 1.5, 6.8], [E.sbNoWin + 1.5, 1.0, 1.5, 9.0]], [[0, {}]]);
      let ly = lA.walk ? lA.yaw : 0; if (win(t, E.sbBottle, E.sbBottle + 1.8)) ly = -PI / 2; if (t > E.sbTour + 1 && !lA.walk) ly = PI / 2;
      if (t < E.sbBoard + 2.2) { poseLurk(L6, t, lA.p, ly, lA.walk ? 2 : 0.4); if (win(t, E.sbBottle + 0.6, E.sbBottle + 1.5)) L6.hd.rotation.x = 0.8; if (t > E.sbNoWin + 1.5) L6.hd.rotation.z = 0.35; }
      else if (t < E.sbBoard + 3.8) { const k = seg(t, E.sbBoard + 3.2, E.sbBoard + 3.8); poseLurk(L6, t, arcPath(t, [[E.sbBoard + 2.2, 1.0, 1.5, 9.0, 0], [E.sbBoard + 3.2, ...HAT, 1.5], [E.sbBoard + 3.8, 6, 2.4, 4.3, 0]]), PI / 2, 1); L6.root.scale.setScalar(lerp(1, 0.3, k)); }
      else L6.root.visible = false;
    } else if (t < E.sbView) {
      // ---- me: dizzy, then home, then the wait, then the bill, then the test dive
      const Hd = [1.0, 1.5, 4.6];
      if (t < E.sbOut) hero.root.visible = false;
      else if (t < E.sbOut + 2.4) pose(hero, { t, p: [6, 1.83 - (1 - seg(t, E.sbOut, E.sbOut + 0.4)) * 1.2, 4.3], yaw: -PI / 2, face: 'scared', headRoll: Math.sin(t * 3) * 0.3 });
      else if (t < E.sbOut + 3.4) pose(hero, { t, p: arcPath(t, [[E.sbOut + 2.4, 6, 1.83, 4.3, 0], [E.sbOut + 3.4, ...Hd, 1.5]]), yaw: -PI / 2, face: 'scared' });
      else if (t < E.sbBoard2 + 0.5) { const hA = act(t, [[E.sbOut + 3.4, ...Hd], [E.sbInstall - 1, ...Hd], [E.sbInstall, -0.6, 1.5, 6.5], [E.sbInvoice - 1, -0.6, 1.5, 6.5], [E.sbInvoice, 1.0, 1.5, 4.8], [E.sbGlass, 1.0, 1.5, 4.8], [E.sbGlass + 1.5, 0.2, 1.5, 6.6]],
          [[0, { face: 'normal', yaw: 0.3, headRoll: t < E.sbOut + 5 ? Math.sin(t * 3) * 0.2 : 0 }], [E.sbGift, { face: 'smug', yaw: 0.9 }], [E.sbBloop, { face: 'normal', yaw: faceTo(Hd, [1.8, 0, 2.4]) }], [E.sbInstall, { face: 'normal', yaw: 1.4, sit: 1 }],
           [E.sbInvoice, { face: 'normal', yaw: faceTo([1.0, 0, 4.8], [1.6, 0, 3.0]) }], [E.sbInvoice + 1.6, { face: 'scared', yaw: faceTo([1.0, 0, 4.8], [1.6, 0, 3.0]) }], [E.sbGlass, { face: 'smug', yaw: faceTo([1.0, 0, 4.8], [6, 0, 4]) }], [E.sbGlass + 1.5, { face: 'smug', yaw: faceTo([0.2, 0, 6.6], [6, 0, 4]), wave: t < E.sbGlass + 4 }]]);
        pose(hero, { t, ...hA }); }
      else if (t < E.sbBoard2 + 2) pose(hero, { t, p: arcPath(t, [[E.sbBoard2 + 0.5, 0.2, 1.5, 6.6, 0], [E.sbBoard2 + 1.5, ...HAT, 1.5], [E.sbBoard2 + 2, 6, 2.0, 4.3, 0]]), yaw: PI / 2, face: 'smug' });
      else hero.root.visible = false;
      // ---- Bloop: fine. WINDOWS. (and the invoice)
      const Bd = [1.8, 1.5, 2.4];
      if (t < E.sbOut + 1.2) bloop6.B.root.visible = false;
      else if (t < E.sbOut + 3.4) poseBurble(bloop6, t, [6, 2.45 - (1 - seg(t, E.sbOut + 1.2, E.sbOut + 1.6)) * 1.0, 4.3], -PI / 2, { angry: true });
      else if (t < E.sbOut + 4.4) poseBurble(bloop6, t, arcPath(t, [[E.sbOut + 3.4, 6, 2.45, 4.3, 0], [E.sbOut + 4.4, ...Bd, 1.5]]), -PI / 2, {});
      else if (t < E.sbInstall) poseBurble(bloop6, t, Bd, t < E.sbBloop ? 0.6 : -PI / 2 + 0.3, t < E.sbBloop ? {} : t < E.sbBloop + 1.5 ? { facepalm: true } : { hop: true, handOut: true });
      else if (t < E.sbInstall + 12) { const P = [[2.2, 1.5, 1.2], [6, 2.4, 1.6], [6, 3.5, 3.6], [6, 2.4, 6.4], [2.2, 1.5, 6.2], [6, 2.4, 2.8]], i = Math.floor((t - E.sbInstall) * 2.2) % P.length; poseBurble(bloop6, t, P[i], i % 2 ? PI / 2 : PI / 2 + 0.6, { hop: true }); bloop6.B.aR.rotation.set(-1.6 + Math.sin(t * 30) * 0.5, 0, 0); }
      else if (t < E.sbBoard2 + 3.8) { const bA = act(t, [[E.sbInstall + 12, 2.2, 1.5, 1.6], [E.sbInvoice - 1, 1.6, 1.5, 3.0], [E.sbGlass, 1.6, 1.5, 3.0], [E.sbGlass + 1.5, -0.6, 1.5, 4.8]],
          [[0, { yaw: faceTo([1.6, 0, 3.0], [1.0, 0, 4.8]) }], [E.sbInvoice, { yaw: faceTo([1.6, 0, 3.0], [1.0, 0, 4.8]), handOut: true }], [E.sbInvoice + 4, { yaw: faceTo([1.6, 0, 3.0], [1.0, 0, 4.8]), hop: true }], [E.sbGlass, { yaw: PI / 2, handOut: true }]]);
        poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA }); inv30a.visible = win(t, E.sbInvoice, E.sbInvoice + 4); }
      else if (t < E.sbBoard2 + 4.9) poseBurble(bloop6, t, arcPath(t, [[E.sbBoard2 + 3.8, -0.6, 1.5, 4.8, 0], [E.sbBoard2 + 4.6, ...HAT, 1.2], [E.sbBoard2 + 4.9, 6, 2.6, 4.3, 0]]), PI / 2, {});
      else bloop6.B.root.visible = false;
      // ---- Leggy: rides Mo home, gets a friendship pearl, sleeps through the window montage
      const Ld = [0.2, 1.5, 9.5], LdY = faceTo(Ld, [12, 0, 15]);
      if (t < E.sbGift - 3) { parentTo(L6.root, mo30.head); poseLurk(L6, t, [0, 1.35, 1.2], 0, 0.4); L6.root.scale.setScalar(0.6 / 1.6); L6.light.intensity = 4; }
      else if (t < E.sbGift - 1.5) { poseLurk(L6, t, arcPath(t, [[E.sbGift - 3, ...wl(MP, -PI / 2, [0, 2.75, 2.0]), 0], [E.sbGift - 1.5, ...Ld, 2.5]]), -PI / 2, 2); L6.root.scale.setScalar(lerp(0.6, 1, seg(t, E.sbGift - 3, E.sbGift - 1.5))); }
      else if (t < E.sbBoard2 + 2.2) { const lA = act(t, [[E.sbGift - 1.5, ...Ld], [E.sbInstall - 0.5, ...Ld], [E.sbInstall + 0.5, -1.2, 1.5, 9.0], [E.sbGlass, -1.2, 1.5, 9.0], [E.sbGlass + 1.5, -1.2, 1.5, 8.5]], [[0, {}]]);
        const happy = win(t, E.sbGift + 1.6, E.sbBloop), sleep = win(t, E.sbInstall + 0.5, E.sbInvoice + 3); const LP = [...lA.p]; if (happy) LP[1] += Math.abs(Math.sin(t * 8)) * 0.4;
        poseLurk(L6, t, LP, lA.walk ? lA.yaw : t < E.sbInstall ? LdY : PI / 2, lA.walk ? 2 : sleep ? 0 : 0.4); if (happy) L6.root.rotation.z = Math.sin(t * 8) * 0.15; if (sleep) { L6.body.position.y = 0.8; L6.hd.rotation.x = 0.5; }
        mini30.visible = t > E.sbGift + 1.4; L6.light.color.set(t > E.sbGift + 1.4 ? '#ff9ee0' : '#5ff7ff'); }
      else if (t < E.sbBoard2 + 3.8) { const k = seg(t, E.sbBoard2 + 3.2, E.sbBoard2 + 3.8); poseLurk(L6, t, arcPath(t, [[E.sbBoard2 + 2.2, -1.2, 1.5, 8.5, 0], [E.sbBoard2 + 3.2, ...HAT, 1.5], [E.sbBoard2 + 3.8, 6, 2.4, 4.3, 0]]), PI / 2, 1); L6.root.scale.setScalar(lerp(1, 0.3, k)); mini30.visible = true; }
      else L6.root.visible = false;
      // the mini pearl's flight: Mo's mouth → Leggy's head
      if (win(t, E.sbGift, E.sbGift + 1.4)) { miniF30.visible = true; miniF30.position.set(...arcPath(t, [[E.sbGift, ...wl(MP, -PI / 2, [0, -0.32, 7.68]), 0], [E.sbGift + 1.4, ...wl(Ld, LdY, [0, 2.4, 1.9]), 2.5]])); miniF30.rotation.y = t * 6; }
    } else {
      // ---- the end: spat onto the dock, the invoice (again), the teeter, the sink
      const S0 = E.sbSpit, HAT2 = [0, 4.0, 12.9];
      if (t < S0 + 3.5) hero.root.visible = false;
      else if (t < S0 + 4.5) { const k = seg(t, S0 + 3.5, S0 + 4.5); pose(hero, { t, p: arcPath(t, [[S0 + 3.5, ...HAT2, 0], [S0 + 4.5, -0.6, 1.5, 7.0, 2]]), yaw: PI, face: 'scared', panic: true, spin: k * 8 }); }
      else if (t < E.sbTeeter) pose(hero, { t, p: [-0.6, 1.5, 7.0], yaw: PI, face: 'scared', flat: 1, flatDir: -1 });
      else if (t < E.sbSink + 0.6) { const hA = act(t, [[E.sbTeeter + 0.6, -0.6, 1.5, 7.0], [E.sbTeeter + 1.6, -2.0, 1.5, 10.0]], [[0, { face: 'normal', yaw: 0 }], [E.sbTeeter + 1.6, { face: 'scared', yaw: faceTo([-2.0, 0, 10], [0, 0, 12.6]) }]]); pose(hero, { t, ...hA }); }
      else { const hA = act(t, [[E.sbSink + 0.6, -2.0, 1.5, 10.0], [E.sbSink + 1.8, -0.6, 1.5, 13.6]], [[0, { face: 'scared', panic: true, yaw: 0.2 }]]); pose(hero, { t, ...hA, yaw: hA.walk ? hA.yaw : 0.2 }); }
      if (t < S0 + 3.8) bloop6.B.root.visible = false;
      else if (t < S0 + 4.8) poseBurble(bloop6, t, arcPath(t, [[S0 + 3.8, ...HAT2, 0], [S0 + 4.8, 1.8, 1.5, 5.0, 2]]), 0, { angry: true });
      else { const bA = act(t, [[E.sbInv2 - 1, 1.8, 1.5, 5.0], [E.sbInv2, 0.7, 1.5, 5.4], [E.sbTeeter, 0.7, 1.5, 5.4], [E.sbTeeter + 1.6, 1.95, 1.5, 10.0], [E.sbSink + 0.8, 1.95, 1.5, 10.0], [E.sbSink + 2, 1.0, 1.5, 12.6]],
          [[0, { yaw: PI }], [E.sbInv2, { yaw: faceTo([0.7, 0, 5.4], [-0.6, 0, 7]), handOut: true }], [E.sbTeeter, { yaw: 0 }], [E.sbSink, { angry: true, yaw: 0 }], [E.sbSink + 2, { handOut: true, yaw: -0.6 }]]);
        poseBurble(bloop6, t, bA.p, bA.yaw, { walk: bA.walk, phase: bA.phase * 2, ...bA }); inv30b.visible = t > E.sbInv2; }
      if (t < S0 + 4.1) L6.root.visible = false;
      else if (t < S0 + 5.1) { poseLurk(L6, t, arcPath(t, [[S0 + 4.1, ...HAT2, 0], [S0 + 5.1, -1.0, 1.5, 3.5, 2]]), 0, 2); L6.root.rotation.z = (1 - seg(t, S0 + 4.1, S0 + 5.1)) * 6; mini30.visible = true; }
      else { const lA = act(t, [[E.sbTeeter + 1, -1.0, 1.5, 3.5], [E.sbTeeter + 2.6, 0, 1.5, 5.0], [E.sbTeeter + 3.2, 0, 1.5, 5.0], [E.sbTeeter + 3.6, 0, 1.5, 5.5]], [[0, {}]]);
        poseLurk(L6, t, lA.p, 0, lA.walk ? 2 : 0.4); mini30.visible = true; L6.light.color.set('#ff9ee0');
        if (win(t, E.sbTeeter + 3.2, E.sbSink + 0.4)) L6.legs[2].rotation.x = -1.5; if (t > E.sbSink + 0.5) L6.hd.rotation.x = -0.4; }
    }
    // ---- camera
    const CA = [[0, 22, 12, 30, 0, 2, -6, 55], [8.9, 13, 6.5, 13, 1, 2.2, -5, 52],
      [9, -0.5, 4.2, -6.8, 6, 2, 4, 50], [15.9, -0.8, 4.6, -7.6, 6, 2.4, 4, 54],
      [16, -6.5, 3.8, 5.0, -2.2, 1.6, 2.6, 50], [18.4, -6.2, 3.6, 4.8, -2.0, 1.8, 2.4, 48],
      [18.5, 3.0, 2.9, 3.0, 0.6, 2.5, 0.4, 46], [22.9, 3.2, 3.0, 3.4, 0.6, 2.6, 0.4, 42],
      [23, 3.0, 2.4, -3.6, 6, 1.4, -0.3, 45], [25.4, 3.4, 2.6, -3.1, 6, 1.4, -0.3, 40],
      [25.5, 3.2, 2.6, 10.8, 6, 1.0, 7.8, 46], [27.9, 2.9, 2.4, 10.3, 6, 1.0, 7.8, 42],
      [28, 2.4, 4.4, 7.2, 5.0, 2.6, 5.0, 48], [29.9, 2.6, 4.2, 6.6, 5.0, 2.8, 4.8, 44],
      [33.5, 3.6, 3.2, 5.6, 1.4, 2.2, 2.6, 46], [36.9, 3.7, 3.3, 6.0, 1.4, 2.2, 2.6, 44],
      [37, -4, 5.2, 0, 5, 2.6, 4.5, 52], [41.9, -4.6, 5.6, -0.6, 5.5, 2.6, 4.5, 50],
      [42, 0.4, 2.6, 9.6, 6, 0.9, 4, 50], [46, 0.0, 2.2, 10.2, 6, 0.2, 4, 52]];
    const CB = [[170, -3, 4.5, -7, 9, 2.5, 11, 58], [173.4, -3.4, 5, -8, 7, 2.5, 8, 60],
      [173.5, -1.5, 3.4, 9, 6, 1.4, 4, 52], [177.9, -1.8, 3.6, 9.5, 6, 1.6, 4, 50],
      [178, 1.6, 4.2, 9.2, 6, 3.4, 4.3, 46], [181.9, 0.8, 4.0, 9.8, 4, 2.6, 4, 50],
      [182, -4.2, 3.6, 5.4, 6, 2.2, 12, 52], [184.9, -4.6, 3.8, 5.0, 6, 2.2, 12, 50],
      [185, -1.6, 4.4, 15.5, 1.2, 2.4, 10, 50], [191.9, -1.9, 4.6, 16, 1.2, 2.4, 10, 46],
      [192, -0.2, 2.5, 0.0, 1.8, 2.2, 2.4, 40], [194.9, 0.1, 2.5, 0.4, 1.8, 2.2, 2.4, 34],
      [195, 12, 6.5, -7, 6, 1.5, 4, 50], [207.9, 13, 7, 13, 6, 1.5, 4, 50],
      [208, -2.4, 2.9, 6.0, 1.3, 2.1, 3.8, 42], [213.9, -2.7, 3.0, 6.4, 1.3, 2.1, 3.8, 38],
      [214, 2.6, 3.6, 13.2, 6, 1.8, 4, 50], [219.9, 1.8, 3.1, 10.6, 6, 1.8, 4, 44],
      [220, -4, 5.2, 1, 4, 2.6, 5.5, 54], [224.9, -4.6, 5.6, 0.4, 5, 2.6, 5, 50],
      [225, 0.6, 2.6, 10, 6, 0.9, 4, 50], [230, 0.2, 2.2, 10.6, 6, 0.2, 4, 52]];
    const CC = [[265, -7, 5, 3, 3, 2, 12, 56], [269.9, -7.5, 5.5, 2.5, 1, 2.4, 10, 58],
      [270, -3.6, 2.7, 9.8, 0.2, 1.7, 6.4, 44], [275.9, -3.9, 2.9, 10.3, 0.2, 1.7, 6.6, 40],
      [276, 6.5, 3.6, 4.0, 0, 2.4, 11, 50], [279.9, 6.9, 3.9, 4.6, 0, 2.4, 11.5, 48],
      [280, 6, 4.6, 21, 0, 1.2, 15, 52], [285.6, 5.6, 3.9, 20.6, 0, 1.2, 16.4, 46]];
    let cam;
    if (!A3) { cam = camKeys(t, CA); if (win(t, E.sbNoWin, E.sbNoWin + 3.5)) { const a = lerp(-1.2, 2.2, ss(seg(t, E.sbNoWin, E.sbNoWin + 3.5))); cam = { p: [6 + Math.sin(a) * 10, 4.5, 4 + Math.cos(a) * 10], l: [6, 1.6, 4], fov: 50 }; } }
    else cam = camKeys(t, t < E.sbView ? CB : CC);
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the deep (kelp + arch; the Gloom Trench; the sunset reef)
const hD30 = (x, z) => (z >= 60 && z <= 130 && Math.abs(x) <= 12) ? -16 : 0;
const MOB30 = [0, -18.5, 100];
const deep30 = (() => {
  const g = mk('deep30'); const st = new VSet(g);
  for (let x = -30; x <= 30; x++) for (let z = -50; z <= 140; z++) { const h = hD30(x, z); st.add(x, h, z, h === 0 && hash2(x, z, 30) < 0.08 ? 'stone' : 'sand');
    const nh = Math.min(hD30(x + 1, z), hD30(x - 1, z), hD30(x, z + 1), hD30(x, z - 1)); for (let y = nh + 1; y < h; y++) st.add(x, y, z, 'stone'); }
  for (let i = 0; i < 60; i++) { const x = Math.floor((hash2(i, 1, 31) - 0.5) * 56), z = Math.floor(-48 + hash2(i, 2, 31) * 185); if (Math.abs(x) < 5 || (Math.abs(x) < 8 && z > 86 && z < 108)) continue; const h = hD30(x, z); st.add(x, h + 1, z, 'stone'); if (hash2(i, 3, 31) > 0.5) st.add(x, h + 2, z, 'stone'); }
  const CT = ['jam', 'buzz', 'jade', 'polka'];
  for (let i = 0; i < 46; i++) { const x = Math.round((hash2(i, 4, 31) - 0.5) * 40), z = Math.round(-48 + hash2(i, 5, 31) * 40); if (Math.abs(x) < 4) continue; const n = 1 + Math.floor(hash2(i, 6, 31) * 3); for (let y = 1; y <= n; y++) st.add(x, y, z, CT[i % 4]); }
  for (const sx of [-1, 1]) for (let x = 3; x <= 5; x++) for (let y = 1; y <= 7; y++) for (let z = 39; z <= 41; z++) st.add(sx * x, y, z, 'stone');
  for (let x = -5; x <= 5; x++) for (let z = 39; z <= 41; z++) st.add(x, 8, z, 'stone');
  st.build();
  const kelps = []; for (let i = 0; i < 40; i++) { const r = hash2(i, 7, 31), side = i % 3; const x = side === 0 ? 5 + r * 4 : side === 1 ? 16 + r * 8 : -(15 + r * 9), z = -46 + hash2(i, 8, 31) * 82; kelps.push(kelp30(g, x, 0.5, z, 6 + Math.floor(hash2(i, 9, 31) * 7))); }
  for (const [x, z, w] of [[-6, -30, 2], [5, -20, 1.4], [-3, -6, 2.4], [8, 6, 1.6], [-8, 18, 2], [3, 28, 1.6], [9, -38, 2]]) { const m = box(w, 40, w * 0.4, 0, x, 18, z, g, rayM30); m.rotation.z = 0.25; m.castShadow = false; }
  const S1 = makeSchool30(12, ['#ff8a2a', '#ffd23f', '#ffffff'], 1), S2 = makeSchool30(10, ['#3ab0ff', '#ffffff', '#5ff7ff'], 2), S3 = makeSchool30(9, ['#5ff7ff', '#b07aff'], 3, true); [S1, S2, S3].forEach(s => g.add(s.g));
  const gp = [-1, 1].map(sd => { const p = pivot(g, sd * 3.6, -15.5, 77); box(1.2, 10, 1.2, '#6a6a78', 0, 5, 0, p); return p; });
  const cap = box(6.8, 1.2, 10, '#c8b078', 0, -15.0, 100.5, g);
  const tl = [[0, -6, 74], [0, -6, 96], [0, -6, 118]].map(p => { const l = new THREE.PointLight('#4a8aff', 3, 34, 1.2); l.position.set(...p); g.add(l); return l; });
  const fill = new THREE.PointLight('#8ad0ff', 0, 40, 1.2); g.add(fill);
  // ---- paths
  const SKA = [[62, 0, 15, -4], [68, 0, 9.5, 20], [71.8, 0, 7.0, 33.9], [72.1, 0, 7.0, 34.3], [73.4, 0, 7.6, 31.0], [74.8, 0.8, 4.6, 30.0], [76.3, 2.0, 3.5, 34.0], [76.5, 2.0, 3.5, 34.3], [77.6, 1.6, 3.4, 32.4], [80, 1.6, 3.4, 32.0]];
  const subA = t => track(t, SKA).p;
  poseMo30(mo30, 0, MOB30, PI, { sleep: true }); const PEARL0 = wpos30(mo30.tip);
  poseSub30(sub30, 0, [0, 0, 0], 0, { armX: 0.25, ext: 1.6 }); const CLAW0 = wpos30(sub30.clawTip);
  const SUBH = [PEARL0[0] - CLAW0[0], PEARL0[1] - CLAW0[1], PEARL0[2] - CLAW0[2]], SUBB = [SUBH[0], SUBH[1], SUBH[2] - 1.8];
  const SKC = [[127.5, ...SUBB], [130.5, 2.5, -11, 80], [133.5, -1.2, -11.5, 74], [136.5, 1.5, -11, 69], [139, 0, -11, 66.5]];
  function subB(t) {
    if (t < 104) return track(t, [[98, 0, 3, 60], [101.5, 0, -6, 74], [104, ...SUBH]]).p;
    if (t < E.sbGrab + 2.5) return [...SUBH];
    if (t < E.sbChase + 1.5) return lp30(SUBH, SUBB, ss(seg(t, E.sbGrab + 2.5, E.sbGrab + 3.3)));
    return track(t, SKC).p;
  }
  const MKB = [[121.5, 0, -11.5, 100], [126, 0, -11.5, 99.5], [128, 0, -11.5, 98], [130.5, 2, -11, 93], [133.5, -0.5, -11.2, 86.5], [134.5, 0, -11, 84.5], [136.5, 1, -11, 81], [139, 0, -11, 79], [155, 0, -11, 79], [157, 0, -11, 77.6], [158.5, 0, -11, 79], [161, 0, -11, 79], [163.5, 0, -11, 76.5], [170, 0, 14, 60]];
  function moB(t) { if (t < E.sbMo) return [...MOB30]; if (t < E.sbMo + 2.5) return lp30(MOB30, [0, -11.5, 100], ss(seg(t, E.sbMo, E.sbMo + 2.5))); return track(t, MKB).p; }
  poseMo30(mo30, 0, [0, -11, 79], PI, {}); const PEARLC = wpos30(mo30.tip);
  const SKD = [[230, 0, 4.5, -40], [243, 0, 3.8, -16]], subC = t => track(t, SKD).p;
  // ---- particles
  for (const [tt, p] of [[E.sbBump, [0, 7.6, 38.4]], [E.sbBump2, [2.6, 3.6, 38.4]]]) { burst(tt, p, { n: 40, colors: ['#9a9490', '#c8c0b8', '#ffffff'], speed: 4, size: 0.2, life: 1, grav: 5, up: 1 }); bub30(tt, p, 30, 0.18); }
  bubS30(E.sbDeep, E.sbIdea, t => wl(subA(t), 0, [0, 0, -4.6]), 0.1);
  bubS30(E.sbTrench, E.sbHatch, t => wl(subB(t), t < E.sbChase + 1 ? 0 : PI, [0, 0, -4.6]), 0.1);
  burst(E.sbClaw + 1.6, [0, -15.3, SUBH[2] + 5], { n: 30, colors: ['#c8b078', '#e0cc90'], speed: 2, size: 0.18, life: 1.2, grav: 3, up: 1 });
  burst(E.sbGrab + 2.5, PEARL0, { n: 50, colors: ['#ffffff', '#bff8ff', '#5ff7ff'], speed: 3, size: 0.12, life: 1.2, grav: 0, up: 0.5 });
  burst(E.sbMo + 0.3, [0, -15, 100], { n: 180, colors: ['#c8b078', '#e0cc90', '#a08a58'], speed: 6, size: 0.3, life: 2, grav: 2, up: 3 });
  bub30(E.sbMo + 2.5, [0, -11, 93.5], 70, 0.25); bub30(E.sbMo + 3.2, [0, -11, 93.5], 50, 0.2);
  for (const sd of [-1, 1]) burst(E.sbGap + 1.5, [sd * 3.6, -11, 77], { n: 60, colors: ['#6a6a78', '#9a9490', '#c8c0b8'], speed: 5, size: 0.3, life: 1.4, grav: 4, up: 2 });
  bub30(E.sbHatch + 0.4, [0, -8.4, 66.2], 30, 0.14);
  burst(E.sbGive, PEARLC, { n: 80, colors: ['#ffffff', '#bff8ff', '#ffe066'], speed: 5, size: 0.16, life: 1.4, grav: 0, up: 0.5 });
  for (const tt of [E.sbGive + 0.6, E.sbBff + 0.5, E.sbBff + 2.5]) burst(tt, [0, -6.5, 74], { n: 40, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.25, life: 2, grav: -1, up: 1 });
  bubS30(E.sbTow, E.sbBreach, t => [0, lerp(-9, 14, seg(t, E.sbTow + 2.5, E.sbBreach)), lerp(72, 56, seg(t, E.sbTow + 2.5, E.sbBreach))], 0.08, 0.14);
  bubS30(E.sbView, E.sbTap, t => wl(subC(t), 0, [0, 0, -4.6]), 0.1);
  for (let i = 0; i < 40; i++) bubS30(E.sbGulp, E.sbGulp + 2.4, [hash2(i, 1, 32) > 0.5 ? 1.4 : -1.4, 3.2 + (hash2(i, 2, 32) - 0.5) * 1.6, -16 + (hash2(i, 3, 32) - 0.5) * 6], 0.4);
  bub30(E.sbGulp + 2.6, [1.5, 3.2, -16], 80, 0.22);
  function update(t) {
    hideMisc(); hide30(); reset30(g); hero.root.visible = false; bloop6.B.root.visible = false; L6.root.visible = false;
    kelps.forEach((k, i) => { k.rotation.z = Math.sin(t * 0.8 + i) * 0.1; k.rotation.x = Math.cos(t * 0.6 + i * 1.7) * 0.07; });
    const dark = win(t, E.sbDark, E.sbGive);
    tl.forEach(l => l.intensity = t > E.sbTrench - 1 && t < E.sbBreach ? (dark ? 0.8 : 3) : 0); fill.intensity = 0;
    let cam;
    if (t < E.sbIdea) {
      const s = subA(t); poseSub30(sub30, t, s, 0, { prop: 9, light: 30, roll: win(t, E.sbBump, E.sbBump + 1) || win(t, E.sbBump2, E.sbBump2 + 1) ? Math.sin(t * 25) * 0.08 : 0 });
      poseSchool30(S1, t, [-6, 3, -24], 3, 0.5); poseSchool30(S2, t, win(t, E.sbFish - 1, E.sbBump) ? [s[0], s[1] + 0.4, s[2] + 0.5] : [10, 5, 14], win(t, E.sbFish - 1, E.sbBump) ? 3.2 : 2.5, -0.9); S3.g.visible = false;
      if (t < E.sbFish) cam = { p: [s[0] + 13, s[1] - 2, s[2] + 4], l: [s[0], s[1], s[2] + 2], fov: 54 };
      else if (t < E.sbBump) cam = { p: [s[0] - 5.5, s[1] + 1.8, s[2] + 7.5], l: [s[0], s[1] + 0.5, s[2]], fov: 52 };
      else if (t < E.sbBump2) cam = { p: [-13, 7.5, 31], l: [0, 6.5, 37], fov: 54 };
      else cam = { p: [-5.5, 5, 37], l: [2.5, 3.6, 36.5], fov: 52 };
    } else if (t < E.sbBreach) {
      // ---- the sub
      const s = subB(t); let yaw = t < E.sbChase ? 0 : t < E.sbChase + 1.5 ? lerp(0, PI, ss(seg(t, E.sbChase, E.sbChase + 1.5))) : PI + Math.sin(t * 2) * 0.08;
      const so = { prop: t > E.sbChase ? 16 : 6, light: 30, armX: 0.9, ext: 0.6, open: 0, lid: seg(t, E.sbHatch, E.sbHatch + 0.4) * (1 - seg(t, E.sbGive - 0.5, E.sbGive)) };
      if (win(t, E.sbClaw, E.sbGrab + 3)) { so.armX = lerpK([[E.sbClaw, 0.9], [E.sbClaw + 1, 0.6], [E.sbClaw + 1.6, 0.62], [E.sbClaw + 3, 0.5], [E.sbGrab - 0.5, 0.3], [E.sbGrab, 0.25]], t); so.ext = lerpK([[E.sbClaw, 0.6], [E.sbClaw + 1, 1.3], [E.sbClaw + 3, 0.8], [E.sbGrab - 0.5, 1.2], [E.sbGrab, 1.6]], t);
        so.open = win(t, E.sbClaw + 0.4, E.sbClaw + 1.5) || win(t, E.sbGrab - 1.2, E.sbGrab + 0.5) ? 1 : 0; }
      else if (t >= E.sbGrab + 3) { so.armX = 0.25; so.ext = 1.6; so.open = win(t, E.sbHatch + 2.4, E.sbHatch + 3.5) ? 1 : 0; }
      if (win(t, E.sbGrab + 0.6, E.sbGrab + 2.5)) so.roll = Math.sin(t * 22) * 0.05;
      if (win(t, E.sbBff + 1.6, E.sbBff + 3)) so.roll = Math.sin(t * 9) * 0.12;
      if (t < E.sbTow) poseSub30(sub30, t, s, yaw, so);
      // ---- Mo
      const MP = moB(t), mo = { sleep: t < E.sbMo + 0.6, swim: win(t, E.sbChase, E.sbCorner) || t > E.sbTow + 2 };
      if (win(t, E.sbMo + 2.4, E.sbChase)) mo.jaw = 0.85; else if (win(t, E.sbChase, E.sbCorner)) mo.chomp = true; else if (win(t, E.sbCorner, E.sbGive)) mo.jaw = 0.5 + Math.sin(t * 2) * 0.15; else if (win(t, E.sbTow, E.sbTow + 2.4)) mo.jaw = 0.6;
      if (t > E.sbGive + 0.4) { mo.happy = true; mo.wiggle = win(t, E.sbGive + 0.4, E.sbGive + 4); }
      poseMo30(mo30, t, MP, PI, { ...mo, pitch: t > E.sbTow + 2.5 ? -0.5 * seg(t, E.sbTow + 2.5, E.sbTow + 4) : 0 });
      cap.visible = t < E.sbMo + 0.4;
      if (t >= E.sbTow) { const k = seg(t, E.sbTow, E.sbTow + 2.4);
        if (k < 1) { poseSub30(sub30, t, lp30([0, -11, 66.5], wpos30(mo30.mouth), ss(k)), PI + k * PI / 2, { light: 30 }); }
        else { parentTo(sub30.root, mo30.head); poseSub30(sub30, t, [0, -0.6, 3.2], PI / 2, { s: 1 / 1.6, light: 30, prop: 4 }); } }
      // ---- the Glow Pearl
      pearl30.visible = true; pearl30.rotation.y = t;
      const tipP = wpos30(mo30.tip); let pp = tipP, lit = true;
      if (win(t, E.sbGrab + 0.6, E.sbHatch + 2.6)) { pp = wpos30(sub30.clawTip); lit = t < E.sbDark - 0.2; }
      // ---- Leggy (the brave part)
      const hatch = wl(s, PI, [0, 2.4, 0.3]);
      if (win(t, E.sbHatch, E.sbBff)) { L6.root.visible = true; L6.root.scale.setScalar(0.5); L6.light.intensity = 7; let LP, ly = PI;
        const clawP = wpos30(sub30.clawTip);
        if (t < E.sbHatch + 1) LP = [hatch[0], hatch[1] - 0.8 + seg(t, E.sbHatch + 0.3, E.sbHatch + 1) * 0.9, hatch[2]];
        else if (t < E.sbHatch + 2.6) LP = arcPath(t, [[E.sbHatch + 1, hatch[0], hatch[1] + 0.1, hatch[2], 0], [E.sbHatch + 2.6, clawP[0], clawP[1] - 0.6, clawP[2] + 1.2, 1.5]]);
        else if (t < E.sbGive) { const k = seg(t, E.sbHatch + 3, E.sbGive - 0.3); ly = lerp(PI, 0, ss(seg(t, E.sbHatch + 2.6, E.sbHatch + 3.4)));
          LP = arcPath(t, [[E.sbHatch + 3, clawP[0], clawP[1] - 0.6, clawP[2] + 1.2, 0], [E.sbGive - 0.3, tipP[0], tipP[1] - 0.7, tipP[2] - 1.15, 4]]); if (k <= 0) LP = [clawP[0], clawP[1] - 0.6, clawP[2] + 1.2]; }
        else { LP = [tipP[0], tipP[1] - 0.7 + Math.sin(t * 3) * 0.1, tipP[2] - 1.15]; ly = 0; }
        poseLurk(L6, t, LP, ly, 1.5); if (win(t, E.sbHatch + 3, E.sbGive)) { pp = wl(LP, ly, [0, 0.7, 1.25]); lit = false; } }
      else if (t >= E.sbBff) { parentTo(L6.root, mo30.head); L6.root.visible = true; poseLurk(L6, t, [0, 1.35, 1.2], 0, 0.4); L6.root.scale.setScalar(0.5 / 1.6); L6.light.intensity = 6; }
      pearl30.position.set(...pp); setPearl30(lit);
      poseSchool30(S3, t, [5, -12, 84], 2, 0.6); S1.g.visible = S2.g.visible = false;
      fill.intensity = t > E.sbGive ? 6 * seg(t, E.sbGive, E.sbGive + 1) : 0; fill.position.set(0, -4, 72);
      // ---- camera
      if (t < E.sbClaw) cam = { p: [s[0] + 10, s[1] + 3, s[2] - 6], l: [0, s[1] - 2, s[2] + 8], fov: 56 };
      else if (t < E.sbGrab) cam = { p: [6.5, SUBH[1] + 1.2, SUBH[2] + 4.0], l: [0, SUBH[1] - 0.6, SUBH[2] + 4.5], fov: 50 };
      else if (t < E.sbDark) cam = { p: [3.2, PEARL0[1] + 0.9, PEARL0[2] - 1.6], l: PEARL0, fov: 46 };
      else if (t < E.sbMo) cam = { p: [10, -9.5, SUBH[2] - 4], l: [0, -14, 99], fov: 52 };
      else if (t < E.sbChase) cam = { p: [5.5, -13.8, 90.5], l: [0, -11, 100], fov: lerp(62, 54, seg(t, E.sbMo, E.sbChase)) };
      else if (t < E.sbCorner) { if (win(t, E.sbGap - 0.5, E.sbGap + 2.5)) cam = { p: [0.5, -8.5, s[2] - 10], l: [0, -11, s[2] + 6], fov: 56 }; else cam = { p: [10.5, s[1] + 2.5, s[2] + 6], l: [0, -11.2, s[2] + 6], fov: 58 }; }
      else if (t < E.sbHatch) cam = { p: [11.5, -8, 72], l: [0, -10.5, 72], fov: 56 };
      else if (t < E.sbGive) { const Lp = L6.root.position; cam = { p: [Lp.x + 5.5, Lp.y + 1.5, Lp.z - 1.5], l: [Lp.x, Lp.y + 0.4, Lp.z], fov: 50 }; }
      else if (t < E.sbBff) cam = { p: [4.5, -7.4, 69.0], l: [0, -8.2, 74.5], fov: 50 };
      else if (t < E.sbTow) cam = { p: [11, -6, 64], l: [0, -9.5, 73], fov: 54 };
      else { const m = mo30.root.position; cam = { p: [m.x + 10, m.y - 3, m.z - 2], l: [m.x, m.y + 1, m.z - 3], fov: 56 }; }
    } else {
      // ---- act 3: the sunset reef. forty windows, one Mo, many fish
      poseSchool30(S1, t, [-4, 4, -26], 3, 0.5); poseSchool30(S2, t, [4, 5, -14], 2.5, -0.7); S3.g.visible = false;
      if (t < E.sbTap) { const s = subC(t); poseSub30(sub30, t, s, 0, { prop: 6, light: 20, nWin: 40 });
        poseMo30(mo30, t, [8, 4.2, s[2] - 1], 0, { happy: true, swim: true, wave: t > E.sbMoWave });
        pearl30.visible = true; pearl30.position.set(...wpos30(mo30.tip)); setPearl30(true);
        if (t < E.sbMoWave) cam = { p: [s[0] - 10, s[1] + 2.5, s[2] + 2], l: [s[0] + 3, s[1], s[2] + 1], fov: 55 };
        else cam = { p: [s[0] + 3.5, s[1] + 3.5, s[2] + 12], l: [s[0] + 3.5, s[1] + 0.5, s[2]], fov: 56 }; }
      else { const k = seg(t, E.sbGulp + 2.3, E.sbGulp + 2.9), MPx = lerp(14, 7.7, ss(seg(t, E.sbGulp, E.sbGulp + 2.3))), up = seg(t, E.sbGulp + 3, E.sbSpit);
        const MP = [MPx - up * 4, 3.4 + up * 9, -16];
        poseMo30(mo30, t, MP, -PI / 2, { swim: true, jaw: win(t, E.sbGulp + 1.3, E.sbGulp + 2.8) ? 0.9 : 0.04, puff: t > E.sbGulp + 2.8, happy: t > E.sbGulp + 3.2, pitch: -0.4 * up });
        pearl30.visible = true; pearl30.position.set(...wpos30(mo30.tip)); setPearl30(true);
        if (k < 1) poseSub30(sub30, t, [lerp(0, 0.3, k), lerp(3.8, 3.2, seg(t, E.sbGulp, E.sbGulp + 2.3)), -16], 0, { broken: true, light: 8, pitch: 0.1, roll: Math.sin(t * 3) * 0.1, s: lerp(1, 0.15, k) });
        cam = { p: [-3, 6 + up * 4, -30], l: [4, 3.5 + up * 5, -16], fov: 55 }; }
    }
    return { cam, hud: true, under: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the cabin (inside the Deep Dipper: red lamp, sonar, six pipes, zero windows → forty windows)
const LC30 = [0, 0, -1.4], LS30 = 0.8;
const cabin30 = (() => {
  const g = mk('cabin30');
  const wallM = new THREE.MeshLambertMaterial({ color: '#6a6a7a' }), rib = new THREE.MeshLambertMaterial({ color: '#4a4a58' }), floorM = new THREE.MeshLambertMaterial({ color: '#3a3a44' }), steel = new THREE.MeshLambertMaterial({ color: '#8a8a98' });
  box(5.6, 0.2, 10.4, 0, 0, -0.1, 0, g, floorM); box(5.6, 0.2, 10.4, 0, 0, 3.5, 0, g, wallM);
  box(5.6, 3.6, 0.2, 0, 0, 1.7, 5.1, g, wallM); box(5.6, 3.6, 0.2, 0, 0, 1.7, -5.1, g, wallM);
  const LW = new THREE.Group(); g.add(LW);
  box(0.2, 1.55, 10.4, 0, -2.7, 0.775, 0, LW, wallM); box(0.2, 1.35, 10.4, 0, -2.7, 2.725, 0, LW, wallM); box(0.2, 0.5, 5.75, 0, -2.7, 1.8, -2.125, LW, wallM); box(0.2, 0.5, 3.75, 0, -2.7, 1.8, 3.125, LW, wallM);
  const plug = box(0.2, 0.5, 0.5, 0, -2.7, 1.8, 1.0, LW, wallM);
  const RW = box(0.2, 3.6, 10.4, 0, 2.7, 1.7, 0, g, wallM);
  const glassM = new THREE.MeshLambertMaterial({ color: '#9fe8ff', emissive: '#3aa8c8', emissiveIntensity: 0.25, transparent: true, opacity: 0.22, depthWrite: false });
  const winW = [-1, 1].map(sd => { const w = new THREE.Group(); g.add(w); box(0.2, 0.7, 10.4, 0, sd * 2.7, 0.35, 0, w, wallM); box(0.2, 0.9, 10.4, 0, sd * 2.7, 3.05, 0, w, wallM);
    for (let i = 0; i <= 5; i++) box(0.24, 1.9, 0.2, 0, sd * 2.7, 1.65, -5 + i * 2, w, rib);
    const panes = []; for (let i = 0; i < 5; i++) panes.push(box(0.06, 1.9, 1.8, 0, sd * 2.7, 1.65, -4 + i * 2, w, glassM)); w.userData.panes = panes; return w; });
  const crackM = new THREE.MeshBasicMaterial({ color: '#ffffff' }), cracks = [];
  for (let i = 0; i < 18; i++) { const a = i * 2.4 + hash2(i, 2, 30), L = 0.3 + hash2(i, 3, 30) * 0.6, cz = i < 8 ? 0 : i < 13 ? -2 : 2, c = box(0.02, 0.03, L, 0, -2.62, 1.9 + Math.sin(a) * L / 2, cz + Math.cos(a) * L / 2, g, crackM); c.rotation.x = -a; c.castShadow = false; c.userData.t = i < 3 ? E.sbTap + 0.6 : i < 8 ? E.sbTap2 + 0.6 : E.sbTap3 + 1; cracks.push(c); }
  const outM = new THREE.MeshBasicMaterial({ color: '#1e6a80' }); for (const sd of [-1, 1]) box(0.5, 24, 40, 0, sd * 16, 2, 0, g, outM); box(40, 0.5, 40, '#b8a070', 0, -7, 0, g);
  for (let i = 0; i < 10; i++) { const sd = i % 2 ? 1 : -1; kelp30(g, sd * (7 + hash2(i, 1, 33) * 6), -6.8, -12 + i * 2.6, 8 + Math.floor(hash2(i, 2, 33) * 5)); }
  const SO = makeSchool30(10, ['#ff8a2a', '#ffd23f', '#5ff7ff'], 4); g.add(SO.g);
  const tapF = new THREE.Group(); g.add(tapF); box(0.5, 0.35, 0.18, '#ff8a2a', 0, 0, 0, tapF); box(0.2, 0.3, 0.05, '#ffd23f', -0.33, 0, 0, tapF); box(0.06, 0.08, 0.2, '#111111', 0.15, 0.06, 0, tapF);
  const outL = new THREE.PointLight('#9fe8ff', 0, 20, 1.2); outL.position.set(-5, 2.5, 0); g.add(outL);
  const outR = new THREE.PointLight('#ffc89a', 0, 20, 1.2); outR.position.set(5, 3, 0); g.add(outR);
  // interior: ribs, pipes, lamps, console, periscope, ladder, sign
  for (let z = -4; z <= 4; z += 2) box(5.4, 0.2, 0.25, 0, 0, 3.3, z, g, rib);
  box(0.18, 0.18, 10, '#8a6a4a', 2.3, 3.1, 0, g); box(0.14, 0.14, 10, '#4a8a6a', -2.3, 3.15, 0, g);
  const lampM = glow30('#ff6a3a', 1.0); box(0.5, 0.3, 0.5, 0, 0, 3.25, 0.5, g, lampM); box(0.5, 0.3, 0.5, 0, 0, 3.25, -3, g, lampM);
  const lampL = new THREE.PointLight('#ff7a4a', 22, 16, 1.3); lampL.position.set(0, 2.9, 0.5); g.add(lampL);
  const lampL2 = new THREE.PointLight('#ff8a5a', 12, 12, 1.3); lampL2.position.set(0, 2.9, -3); g.add(lampL2);
  box(2.2, 1.0, 0.8, '#3a3a48', 1.3, 0.5, 4.55, g); for (const [x, c] of [[0.6, '#e8344e'], [1.0, '#ffd23f'], [1.4, '#7cff6b'], [1.8, '#3ab0ff']]) box(0.16, 0.08, 0.16, 0, x, 1.04, 4.4, g, glow30(c, 0.6));
  const scrM = glow30('#0a4a1a', 0.3); box(1.3, 0.9, 0.06, 0, 1.3, 1.55, 4.96, g, scrM); const ringM = new THREE.MeshBasicMaterial({ color: '#7cff6b' });
  for (const s of [0.7, 0.4]) { box(s, 0.03, 0.02, 0, 1.3, 1.55 + s / 2, 4.92, g, ringM); box(s, 0.03, 0.02, 0, 1.3, 1.55 - s / 2, 4.92, g, ringM); box(0.03, s, 0.02, 0, 1.3 + s / 2, 1.55, 4.92, g, ringM); box(0.03, s, 0.02, 0, 1.3 - s / 2, 1.55, 4.92, g, ringM); }
  const sweep = pivot(g, 1.3, 1.55, 4.91); box(0.03, 0.38, 0.02, 0, 0, 0.19, 0, sweep, ringM); const blip = box(0.08, 0.08, 0.02, 0, 1.45, 1.7, 4.91, g, new THREE.MeshBasicMaterial({ color: '#ff5a3a' }));
  const sonL = new THREE.PointLight('#5aff7a', 0, 8, 1.5); sonL.position.set(1.3, 1.6, 4.3); g.add(sonL);
  box(0.2, 1.5, 0.2, 0, 0, 2.75, 2.9, g, steel); box(0.42, 0.28, 0.32, 0, 0, 1.95, 2.75, g, steel); box(0.9, 0.08, 0.08, '#222222', 0, 1.85, 2.9, g);
  for (const x of [-0.35, 0.35]) box(0.08, 3.4, 0.08, '#888888', x, 1.7, -4.6, g); for (let y = 0.4; y < 3.3; y += 0.5) box(0.7, 0.06, 0.06, '#888888', 0, y, -4.6, g);
  plane26(1.7, 0.6, txtMat26(['WINDOWS:', 'coming soon'], 256, 96, '#f6e7c1', '#8a1020', 34), g, 2.58, 2.2, -3.4, -PI / 2);
  // ---- the six pipes (exactly where Leggy's six legs reach. coincidence.)
  const PL = (() => { poseLurk(L6, 0, LC30, 0, 0); L6.root.rotation.set(0, 0, 0); L6.root.scale.setScalar(LS30); plug30(1); const r = L6.tips.map(o => wpos30(o)); L6.root.scale.setScalar(1); return r; })();
  PL.forEach(P => { box(0.2, 3.4, 0.2, '#8a6a4a', P[0], 1.7, P[2], g); box(0.32, 0.3, 0.32, '#a07a50', P[0], P[1], P[2], g); });
  const ORD = [2, 3, 0, 5, 1, 4], LT = L6.legs.map((_, j) => E.sbLeak + ORD.indexOf(j) * 0.9);
  const jetM = new THREE.MeshBasicMaterial({ color: '#9fe0ff', transparent: true, opacity: 0.75 }), target = [LC30[0], 1.0, LC30[2]];
  const jets = PL.map(P => { const pv = pivot(g, ...P); pv.lookAt(target[0], P[1] + 0.2, target[2]); box(0.1, 0.1, 1, 0, 0, 0, 0.5, pv, jetM).castShadow = false; return pv; });
  const hj = pivot(g, -2.6, 1.8, 1.0); hj.lookAt(-1.5, 1.85, 1.0); box(0.12, 0.12, 1, 0, 0, 0, 0.5, hj, jetM).castShadow = false;
  PL.forEach((P, j) => smoke(LT[j], LT[j] + 0.75, 0.06, lp30(P, [target[0], P[1], target[2]], 0.6), { n: 3, colors: ['#bfe8ff', '#ffffff'], speed: 1.5, size: 0.08, life: 0.5, grav: 9, up: 1 }));
  smoke(E.sbChip + 0.1, E.sbLeak + 6, 0.06, [-1.65, 1.9, 1.0], { n: 3, colors: ['#bfe8ff', '#ffffff'], speed: 1.5, size: 0.08, life: 0.5, grav: 9, up: 1 });
  burst(E.sbChip, [-2.6, 1.8, 1.0], { n: 30, colors: ['#6a6a7a', '#9a9aa8', '#bfe8ff'], speed: 3, size: 0.1, life: 0.8, grav: 8, up: 1 });
  const waterM = new THREE.MeshLambertMaterial({ color: '#3a90d0', transparent: true, opacity: 0.5, depthWrite: false }), water = box(5.2, 1, 10.2, 0, 0, 0.5, 0, g, waterM); water.castShadow = false;
  const eye = new THREE.Group(); g.add(eye); eye.position.set(-3.1, 1.8, 1.0); eye.rotation.y = PI / 2;
  box(1.6, 1.6, 0.1, 0, 0, 0, 0, eye, new THREE.MeshBasicMaterial({ color: '#fff4c0' })); box(0.7, 0.7, 0.12, 0, 0, 0, 0.02, eye, new THREE.MeshBasicMaterial({ color: '#ffb020' })); box(0.3, 0.3, 0.14, 0, 0, 0, 0.04, eye, new THREE.MeshBasicMaterial({ color: '#111111' })); box(0.1, 0.1, 0.15, 0, 0.08, 0.08, 0.05, eye, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  for (let i = 0; i < 10; i++) burst(E.sbBurst + (i % 5) * 0.12, [i < 5 ? -2.6 : 2.6, 1.7, -4 + (i % 5) * 2], { n: 30, colors: ['#ffffff', '#bff0ff', '#9fe8ff'], speed: 4, size: 0.12, life: 1, grav: 6, up: 1 });
  for (let i = 0; i < 10; i++) bubS30(E.sbBurst, E.sbGulp, [i < 5 ? -2.4 : 2.4, 1.6, -4 + (i % 5) * 2], 0.15, 0.14);
  function update(t) {
    hideMisc(); hide30(); reset30(g);
    const C = t >= E.sbTap;
    LW.visible = RW.visible = !C; winW.forEach(w => { w.visible = C; w.userData.panes.forEach(p => p.visible = t < E.sbBurst); }); plug.visible = t < E.sbChip;
    cracks.forEach(c => c.visible = C && t > c.userData.t && t < E.sbBurst);
    outL.intensity = C ? 14 : 0; outR.intensity = C ? 10 : 0; SO.g.visible = false; tapF.visible = false;
    sweep.rotation.z = -t * 2.4; const son = t > E.sbSonar; scrM.emissive.set(son ? '#1aa83a' : '#0a2a12'); sonL.intensity = son ? 5 : 0; blip.visible = son && Math.floor(t * 2) % 2 === 0;
    jets.forEach((j, i) => { j.visible = win(t, LT[i], LT[i] + 0.75); j.scale.set(1, 1, 1.1 + Math.sin(t * 40 + i) * 0.15); }); hj.visible = win(t, E.sbChip + 0.05, E.sbLeak + 6); hj.scale.set(1, 1, 1 + Math.sin(t * 37) * 0.1);
    const wl0 = C ? lerp(0, 2.6, seg(t, E.sbBurst, E.sbGulp)) : t < E.sbChip ? 0 : lerp(0, 0.25, seg(t, E.sbChip, E.sbPeek)); water.visible = wl0 > 0.01; water.scale.y = Math.max(0.01, wl0); water.position.y = wl0 / 2;
    eye.visible = win(t, E.sbEye - 0.3, E.sbTrench); eye.scale.set(1, win(t, E.sbEye + 1.6, E.sbEye + 1.8) ? 0.1 : 1, 1); eye.position.z = 1.0 + Math.sin(t * 3) * 0.08;
    const fy = Math.sin(t * 2) * 0.08;
    let cam;
    if (!C) {
      // ---- me
      if (t < E.sbIdea) {
        const hA = act(t, [[E.sbCabin, 0, 0, 1.8], [E.sbPeri, 0, 0, 1.8], [E.sbPeri + 0.6, 0, 0, 2.1], [E.sbPeri + 4, 0, 0, 2.1], [E.sbPeri + 4.5, 0, 0, 1.8]],
          [[0, { face: 'normal', yaw: 0, headYaw: Math.sin(t * 1.5) * 0.5 }], [E.sbPeri, { face: 'smug', yaw: 0, lean: 0.2 }], [E.sbPeri + 3, { face: 'normal', yaw: 0, lean: 0.2 }], [E.sbPeri + 4.2, { face: 'normal', yaw: 0 }], [E.sbSonar + 0.5, { face: 'smug', yaw: faceTo([0, 0, 1.8], [1.3, 0, 4.6]) }]]);
        pose(hero, { t, ...hA }); if (win(t, E.sbPeri + 0.6, E.sbPeri + 4)) { hero.aL.rotation.set(-1.9, 0, 0.2); hero.aR.rotation.set(-1.9, 0, -0.2); }
      } else if (t < E.sbPeek) {
        const P = [-1.7, 0, 1.0]; let o = { face: 'smug', yaw: -PI / 2, mallet: t < E.sbChip + 0.3 };
        if (win(t, E.sbChip - 0.8, E.sbChip)) o.swing = seg(t, E.sbChip - 0.8, E.sbChip) * 0.62;
        if (win(t, E.sbChip, E.sbChip + 0.6)) o = { face: 'scared', yaw: -PI / 2, lean: -0.3 };
        else if (win(t, E.sbChip + 0.6, E.sbLeak - 0.4)) { o = { face: 'scared', yaw: -PI / 2, lean: -0.35, panic: true }; P[0] = -1.3; }
        else if (t >= E.sbLeak - 0.4 && t < E.sbLeak + 6) o = { face: 'scared', yaw: -PI / 2 + Math.sin(t * 4) * 0.3, panic: true };
        else if (t >= E.sbLeak + 6) o = { face: 'normal', yaw: -PI / 2, lean: 0.15 };
        pose(hero, { t, p: P, ...o }); if (t >= E.sbLeak + 6) hero.aR.rotation.set(-1.6, 0, 0);
      } else if (t < E.sbEye) { const k = seg(t, E.sbPeek, E.sbPeek + 1.2); pose(hero, { t, p: [lerp(-1.7, -2.05, k), 0, 1.0], yaw: -PI / 2, face: 'normal', lean: 0.25 * k }); }
      else hero.root.visible = false;
      // ---- Bloop
      if (t < E.sbIdea) { const o = t < E.sbSonar ? { } : t < E.sbSonar + 1.5 ? { handOut: true } : { hop: t < E.sbSonar + 3, yaw: faceTo([1.3, 0, 3.6], [0, 0, 1.8]) }; poseBurble(bloop6, t, [1.3, 0, 3.6], o.yaw ?? 0, o); }
      else { const by = faceTo([1.0, 0, 3.0], [-1.7, 0, 1.0]); const o = t < E.sbChip ? { angry: true } : t < E.sbLeak ? { facepalm: true } : t < E.sbLeak + 6 ? { angry: true, hop: true } : t < E.sbEye ? {} : { angry: true }; poseBurble(bloop6, t, [1.0, 0, 3.0], t < E.sbLeak || t > E.sbLeak + 6 ? by : by + Math.sin(t * 5) * 0.6, o); }
      // ---- Leggy: no window to look out of. then: six legs, six leaks
      poseLurk(L6, t, LC30, 0, 0.3); L6.root.scale.setScalar(LS30); L6.light.intensity = 3;
      if (t < E.sbIdea && t > E.sbSonar + 3) { L6.hd.rotation.set(0.25, -0.5, 0.3); }
      if (t >= E.sbIdea) { L6.legs.forEach((l, i) => { const k = seg(t, LT[i] + 0.45, LT[i] + 0.75); if (k > 0) { l.rotation.z = (i < 3 ? 1 : -1) * 1.35 * k; l.rotation.x = [0.6, 0, -0.6][i % 3] * k; } }); L6.body.position.y = lerp(L6.body.position.y, 1.0, seg(t, LT[2] + 0.45, LT[2] + 0.75)); if (t > E.sbLeak + 5.5) L6.hd.rotation.x = Math.sin(t * 6) * 0.15; }
      const CK = [[46, 2.0, 2.8, -4.4, -0.2, 1.4, 2.0, 62], [49.4, 1.8, 2.6, -4.0, -0.2, 1.5, 2.2, 58],
        [49.5, 1.0, 2.3, 0.4, 0, 1.9, 2.8, 46], [53.9, 0.9, 2.2, 0.8, 0, 1.9, 2.8, 42],
        [54, -1.6, 2.5, 1.4, 1.4, 1.3, 4.6, 50], [57.9, -1.4, 2.4, 2.0, 1.4, 1.4, 4.6, 44],
        [58, 1.4, 2.5, 0.8, -0.2, 1.4, -1.6, 50], [61.9, 1.2, 2.4, 0.3, -0.2, 1.3, -1.6, 46],
        [80, 1.2, 2.3, -0.8, -1.7, 1.5, 1.2, 50], [82.9, 0.9, 2.2, -0.4, -1.7, 1.6, 1.1, 46],
        [83, 0.2, 2.2, 2.8, -1.6, 1.0, 0.9, 54], [85.9, 0.0, 2.2, 3.0, -1.6, 0.9, 0.9, 56],
        [86, 2.0, 2.9, 4.2, 0, 1.0, -1.4, 62], [89.4, 1.8, 2.8, 4.0, 0, 1.0, -1.4, 58],
        [89.5, 0.9, 2.6, 1.6, 0, 1.0, -1.6, 56], [92.9, 0.6, 2.7, 1.9, 0, 1.0, -1.6, 54],
        [93, 0.2, 2.0, 2.4, -2.4, 1.8, 0.9, 46], [94.9, 0.0, 2.0, 2.2, -2.4, 1.8, 0.9, 40]];
      cam = camKeys(t, CK); if (t >= E.sbEye) cam = { p: [-1.0, 1.8, 1.0], l: [-4, 1.8, 1.0], fov: lerp(22, 15, seg(t, E.sbEye, E.sbTrench)) };
    } else {
      // ---- act 3: forty windows. tap. tap. CRACK.
      SO.g.visible = true; poseSchool30(SO, t, [-6.5, 1.8, 0.5], 2.0, 0.5);
      if (t < E.sbTap3) { tapF.visible = true; const tp = [E.sbTap + 0.6, E.sbTap2 + 0.6]; let x = -4.2; for (const s of tp) if (win(t, s - 0.6, s + 0.4)) x = t < s ? lerp(-4.2, -2.86, seg(t, s - 0.6, s)) : lerp(-2.86, -3.6, seg(t, s, s + 0.4)); tapF.position.set(x, 1.9 + fy, 0.0); }
      const fl = t > E.sbBurst ? lerp(0, 1.6, seg(t, E.sbBurst, E.sbGulp)) : 0;
      if (t > E.sbTap3 - 2) { const mx = lerp(-20, -10.4, ss(seg(t, E.sbTap3 - 2, E.sbTap3))) + (win(t, E.sbTap3 + 0.5, E.sbTap3 + 1.1) ? Math.sin(seg(t, E.sbTap3 + 0.5, E.sbTap3 + 1.1) * PI) * 0.35 : 0);
        poseMo30(mo30, t, [mx, -0.2, -0.5], PI / 2, { happy: t < E.sbBurst, wiggle: t < E.sbTap3 + 0.5, jaw: t > E.sbBurst ? 0.5 : 0.04 }); pearl30.visible = true; pearl30.position.set(...wpos30(mo30.tip)); setPearl30(true); }
      const ho = t < E.sbTap2 ? { face: 'smug' } : t < E.sbTap3 ? { face: 'normal' } : t < E.sbBurst ? { face: 'scared' } : { face: 'scared', panic: true };
      pose(hero, { t, p: [-1.4, fl, 0.5], yaw: -PI / 2 + (t > E.sbBurst ? Math.sin(t * 3) * 0.5 : 0), ...ho });
      const bo = t < E.sbTap2 ? { handOut: true, hop: t < E.sbTap + 2 } : t < E.sbTap3 ? { facepalm: true } : { angry: true };
      poseBurble(bloop6, t, [1.5, fl * 0.9, 1.8], -PI / 2 + 0.4, bo);
      poseLurk(L6, t, [0.0, fl * 0.8, -3.6], -PI / 2, 0.6); L6.root.scale.setScalar(LS30); mini30.visible = true; L6.light.color.set('#ff9ee0'); L6.light.intensity = 3;
      if (t < E.sbTap2) { L6.root.position.y += Math.abs(Math.sin(t * 6)) * 0.2; } if (t > E.sbBurst) plug30(1);
      const CW = [[243, 1.9, 2.4, 4.2, -2.6, 1.6, -1.0, 60], [246.9, 1.7, 2.4, 3.8, -2.6, 1.6, -0.6, 56],
        [247, -0.5, 2.1, 1.8, -2.65, 1.9, 0.0, 46], [250.9, -0.9, 2.0, 1.4, -2.65, 1.9, 0.0, 38],
        [251, 0.8, 2.6, 4.6, -3.5, 1.9, -0.4, 58], [254.9, 0.6, 2.5, 4.3, -3.5, 1.9, -0.4, 52],
        [255, 2.0, 2.9, 4.4, -0.5, 1.4, -1.0, 64], [260, 1.8, 3.1, 4.0, -0.5, 1.6, -1.0, 66]];
      cam = camKeys(t, CW);
    }
    return { cam, hud: true, cabin: true };
  }
  return { g, update };
})();

