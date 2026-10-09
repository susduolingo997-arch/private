// ---------------------------------------------------------------- Ep 26 helpers: Professor Hootsworth, Rexbone, the exhibits, the DO NOT TOUCH signs
function hide25() { hide24(); [globe, pkg, snowMac, giantL, giantB, mayor.root, ...flurries.map(f => f.root)].forEach(o => o.visible = false); }
function canMat26(w, h, draw, emis = 0.25) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  return new THREE.MeshLambertMaterial({ map: tx, emissive: '#ffffff', emissiveMap: tx, emissiveIntensity: emis }); }
function txtMat26(lines, w = 256, h = 128, bg = '#f6e7c1', fg = '#8a1020', size = 40) { return canMat26(w, h, (g) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.fillStyle = fg;
  g.font = `bold ${size}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => g.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.1)); }); }
function plane26(w, h, mat, parent, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m; }
// a DO NOT TOUCH sign on a little brass post; returns its pivot (at the base) so it can tip over
function sign26(lines, parent, x, z, ry = 0, hgt = 1.4, bw = 1.3) { const p = pivot(parent, x, 0.5, z); p.rotation.y = ry; box(0.12, hgt, 0.12, 0, 0, hgt / 2, 0, p, goldM); box(0.5, 0.08, 0.5, 0, 0, 0.04, 0, p, goldM);
  box(bw + 0.1, bw * 0.5 + 0.1, 0.06, '#5a3a22', 0, hgt, 0.06, p); plane26(bw, bw * 0.5, txtMat26(lines), p, 0, hgt, 0.1); return p; }
// Professor Hootsworth, the curator: a blocky owl with a monocle and a bow tie
function makeOwl() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), brown = '#7a5232', cream = '#eadcb4';
  for (const x of [-0.22, 0.22]) { box(0.12, 0.3, 0.12, '#e0a020', x, 0.2, 0, body); box(0.3, 0.1, 0.4, '#e0a020', x, 0.05, 0.08, body); }
  box(1.0, 1.1, 0.86, brown, 0, 0.9, 0, body); box(0.72, 0.8, 0.06, cream, 0, 0.84, 0.44, body); for (const s of [-1, 1]) box(0.16, 0.7, 0.07, '#2b3a67', s * 0.4, 0.84, 0.45, body);
  box(0.42, 0.14, 0.08, '#c0182a', 0, 1.34, 0.47, body); box(0.12, 0.12, 0.1, '#900010', 0, 1.34, 0.5, body);
  const wL = pivot(body, -0.54, 1.38, 0), wR = pivot(body, 0.54, 1.38, 0); box(0.14, 0.86, 0.62, '#6a4228', 0, -0.4, 0, wL); box(0.14, 0.86, 0.62, '#6a4228', 0, -0.4, 0, wR);
  const hd = pivot(body, 0, 1.45, 0); box(1.06, 0.86, 0.94, '#8a6040', 0, 0.43, 0, hd); box(0.92, 0.64, 0.06, cream, 0, 0.4, 0.48, hd);
  const eyeW = new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupils = [];
  for (const x of [-0.23, 0.23]) { box(0.32, 0.32, 0.04, 0, x, 0.48, 0.52, hd, eyeW); pupils.push(box(0.14, 0.14, 0.04, '#111', x, 0.48, 0.55, hd)); }
  box(0.14, 0.2, 0.16, '#ffb020', 0, 0.26, 0.55, hd); for (const s of [-1, 1]) { const tf = box(0.18, 0.34, 0.18, '#6a4228', s * 0.38, 0.95, 0, hd); tf.rotation.z = -s * 0.35; }
  for (const [w, h, x, y] of [[0.42, 0.05, 0.23, 0.69], [0.42, 0.05, 0.23, 0.27], [0.05, 0.42, 0.02, 0.48], [0.05, 0.42, 0.44, 0.48]]) box(w, h, 0.04, 0, x, y, 0.58, hd, goldM); box(0.03, 0.5, 0.03, 0, 0.44, 0.0, 0.56, hd, goldM);
  const skullSlot = pivot(hd, 0, 0.86, 0); root.scale.setScalar(1.05);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hd, wL, wR, pupils, skullSlot }; }
function poseOwl(o, t, p, yaw, q = {}) { o.root.position.set(p[0], p[1] + (q.hop ? Math.abs(Math.sin(t * 9)) * 0.4 : 0), p[2]); o.root.rotation.set(0, yaw, 0);
  o.body.rotation.set(q.lean || 0, 0, q.walk ? Math.sin(t * 10) * 0.12 : 0); const fl = q.flap ? 0.9 + Math.sin(t * 24) * 0.6 : 0;
  o.wL.rotation.set(0, 0, -0.1 - fl); o.wR.rotation.set(q.point ? -1.6 : q.stamp ? -2.2 + Math.abs(Math.sin(t * 7)) * 1.6 : 0, 0, 0.1 + fl);
  o.hd.rotation.set(q.headPitch || 0, q.headSpin || 0, q.headRoll || 0); o.pupils.forEach(m => m.scale.setScalar(q.wide ? 1.9 : 1)); }
const owl = makeOwl();
// Rexbone: a six-legged fossil (very old, very asleep... mostly)
const boneM = new THREE.MeshLambertMaterial({ color: '#efe6cc', emissive: '#4a4030', emissiveIntensity: 0.25 });
const rexEyeM = new THREE.MeshBasicMaterial({ color: '#1a1410' });
function makeRex() { const root = new THREE.Group(), body = pivot(root, 0, 3.0, 0), B = (w, h, d, x, y, z, par) => box(w, h, d, 0, x, y, z, par, boneM);
  for (let i = 0; i < 7; i++) B(0.5, 0.5, 0.45, 0, 0.2, -2.3 + i * 0.72, body);
  for (const z of [-1.0, -0.3, 0.4, 1.1]) { for (const s of [-1, 1]) { const r = B(0.16, 1.4, 0.18, s * 0.62, -0.45, z, body); r.rotation.z = s * 0.28; } B(1.0, 0.16, 0.2, 0, -1.15, z, body); }
  B(1.5, 0.5, 0.9, 0, 0, -1.9, body); B(1.3, 0.4, 0.7, 0, -0.1, 1.6, body);
  const neck = pivot(body, 0, 0.35, 2.2); for (let i = 1; i <= 3; i++) B(0.4, 0.4, 0.42, 0, i * 0.38, i * 0.3, neck);
  const hd = pivot(neck, 0, 1.45, 1.15); B(1.2, 0.85, 1.5, 0, 0.1, 0.5, hd);
  const eyes = [-0.33, 0.33].map(x => box(0.3, 0.3, 0.06, 0, x, 0.24, 1.26, hd, rexEyeM)); for (let i = 0; i < 5; i++) B(0.1, 0.18, 0.1, -0.4 + i * 0.2, -0.38, 1.15, hd);
  const jaw = pivot(hd, 0, -0.32, 0); B(1.0, 0.24, 1.35, 0, -0.14, 0.55, jaw); for (let i = 0; i < 4; i++) B(0.1, 0.16, 0.1, -0.3 + i * 0.2, 0.04, 1.1, jaw);
  const tail = []; let par = body; for (let i = 0; i < 6; i++) { const p = pivot(par, 0, i ? 0 : 0.1, i ? -0.58 : -2.35); const s = 0.42 - i * 0.05; B(s, s, 0.56, 0, 0, -0.28, p); tail.push(p); par = p; }
  const legs = []; for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, z = [-1.6, 0, 1.4][i % 3]; const hip = pivot(body, side * 0.85, -0.6, z); B(0.3, 1.2, 0.3, 0, -0.6, 0, hip);
    const knee = pivot(hip, 0, -1.2, 0); B(0.24, 1.1, 0.24, 0, -0.55, 0, knee); B(0.5, 0.16, 0.62, 0, -1.1, 0.16, knee); legs.push({ hip, knee, side }); }
  const light = new THREE.PointLight('#7cff6b', 0, 12, 1.6); light.position.set(0, 0.3, 2.0); hd.add(light);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, neck, hd, jaw, tail, legs, eyes, light }; }
function poseRex(r, t, p, yaw, o = {}) { const w = o.walk || 0, ph = o.phase ?? t * 10, aw = o.awake || 0, c = o.curl || 0, bw = o.bow || 0;
  r.root.position.set(p[0], p[1], p[2]); r.root.rotation.set(0, yaw + (o.spin || 0), 0); r.root.scale.setScalar(o.scale ?? 1);
  const jit = o.rattle ? Math.sin(t * 60) * 0.05 : 0; r.body.position.set(0, 3.0 + Math.abs(Math.sin(ph)) * 0.25 * w - c * 1.9 - bw * 0.5 + (o.breathe ? Math.sin(t * 1.6) * 0.06 : 0), 0); r.body.rotation.set(bw * 0.25 + jit, 0, jit);
  r.legs.forEach((L, i) => { const s = w ? Math.sin(ph + i * 2.1) * 0.6 * w : 0, b = bw * (i % 3 === 2 ? 1 : 0); L.hip.rotation.set(s - b * 0.9, 0, L.side * c * 1.25); L.knee.rotation.set(Math.max(0, -s) * 0.8 + b * 1.6 + c * 1.5, 0, 0); });
  r.neck.rotation.set(-(o.roar || 0) * 0.5 + c * 0.9 + (o.sniff || 0) * 0.5 + bw * 0.3 + (aw ? Math.sin(t * 2) * 0.05 : -0.1), c * 1.3 + (o.look || 0), 0);
  r.jaw.rotation.x = (o.roar || 0) * 0.7 + (o.pant ? Math.abs(Math.sin(t * 8)) * 0.3 : 0); r.hd.rotation.set(0, 0, o.tilt || 0);
  r.tail.forEach((q, i) => q.rotation.set(-0.1, (o.wag ? Math.sin(t * 16 - i * 0.6) * 0.3 : aw ? Math.sin(t * 3 - i * 0.6) * 0.08 : 0) + c * 0.42, 0));
  rexEyeM.color.set(aw ? (o.angry ? '#ff3a2a' : '#7cff6b') : '#1a1410'); r.light.intensity = aw ? 5 : 0; r.light.color.set(o.angry ? '#ff3a2a' : '#7cff6b'); }
const rex = makeRex();
// bones everywhere (after the sneeze)
const rexPile = new THREE.Group(); { const r = rng(2601); for (let i = 0; i < 46; i++) { const m = box(0.2 + r() * 0.3, 0.2 + r() * 0.2, 0.5 + r() * 0.9, 0, 0, 0, 0, rexPile, boneM); const x = (r() - 0.5) * 14, z = -4 + (r() - 0.5) * 11;
  const onP = Math.abs(x) < 6.4 && z > -6.4 && z < -1.6; m.userData.home = [x, (onP ? 1.5 : 0.5) + 0.12, z]; m.userData.d = r() * 0.5; m.rotation.set(r() * 0.3, r() * 6, r() * 0.3); } }
const skullF = new THREE.Group(); box(1.2, 0.85, 1.5, 0, 0, 0.1, 0, skullF, boneM); for (const x of [-0.33, 0.33]) box(0.3, 0.3, 0.06, '#1a1410', x, 0.24, 0.76, skullF); box(1.0, 0.24, 1.35, 0, 0, -0.42, 0.05, skullF, boneM);
const boneT = new THREE.Group(); box(0.18, 0.18, 1.1, 0, 0, 0, 0, boneT, boneM); for (const z of [-0.6, 0.6]) for (const x of [-0.12, 0.12]) box(0.2, 0.2, 0.2, 0, x, 0, z, boneT, boneM);
// the exhibits
const vaseA = new THREE.Group(); { const blue = '#3d6bd0', wht = '#f4f4f4'; box(0.5, 0.12, 0.5, blue, 0, 0.06, 0, vaseA); box(0.72, 0.6, 0.72, blue, 0, 0.42, 0, vaseA); box(0.74, 0.12, 0.74, wht, 0, 0.5, 0, vaseA);
  box(0.4, 0.32, 0.4, blue, 0, 0.88, 0, vaseA); box(0.56, 0.08, 0.56, wht, 0, 1.06, 0, vaseA); for (const x of [-0.42, 0.42]) box(0.1, 0.3, 0.1, wht, x, 0.7, 0, vaseA); }
const vaseB = new THREE.Group(); { const h = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.72), bloop6.calm); h.position.y = 0.45; vaseB.add(h); box(0.5, 0.14, 0.5, '#c8e6a0', 0, 0.07, 0, vaseB);
  box(0.62, 0.16, 0.62, '#ffd400', 0, 0.84, 0, vaseB); box(0.04, 0.4, 0.74, '#5a7a3a', 0.2, 0.45, 0, vaseB); box(0.74, 0.04, 0.3, '#5a7a3a', 0, 0.62, 0.1, vaseB); }
const vaseShards = new THREE.Group(); { const r = rng(2602); for (let i = 0; i < 14; i++) { const m = box(0.16 + r() * 0.2, 0.06, 0.16 + r() * 0.2, i % 3 ? '#3d6bd0' : '#f4f4f4', (r() - 0.5) * 2.6, 0.04, (r() - 0.5) * 2.6, vaseShards); m.rotation.y = r() * 6; } }
const paintM = canMat26(128, 104, (g, w, h) => { g.fillStyle = '#26443a'; g.fillRect(0, 0, w, h); g.fillStyle = '#7a5232'; g.fillRect(36, 38, 56, 66); g.fillStyle = '#8a6040'; g.fillRect(30, 8, 68, 44); g.fillStyle = '#eadcb4'; g.fillRect(36, 14, 56, 32);
  g.fillStyle = '#fff'; g.fillRect(42, 20, 16, 16); g.fillRect(70, 20, 16, 16); g.fillStyle = '#111'; g.fillRect(47, 25, 7, 7); g.fillRect(75, 25, 7, 7); g.strokeStyle = '#ffd23f'; g.lineWidth = 3; g.strokeRect(68, 18, 20, 20);
  g.fillStyle = '#ffb020'; g.fillRect(60, 34, 8, 9); g.fillStyle = '#c0182a'; g.fillRect(52, 54, 24, 8); g.fillStyle = '#ffe066'; g.font = 'bold 11px sans-serif'; g.fillText('PROF. H.', 6, 98); }, 0.2);
const paintP = new THREE.Group(); box(0.14, 2.6, 3.2, 0, 0, 0, 0, paintP, goldM); plane26(2.9, 2.3, paintM, paintP, -0.08, 0, 0, -PI / 2);
// Bloop's statue (of Bloop) on a cart
const cart26 = new THREE.Group(); box(1.6, 0.16, 1.3, '#8a5a2b', 0, 0.44, 0, cart26); for (const x of [-0.82, 0.82]) for (const z of [-0.45, 0.45]) box(0.12, 0.34, 0.34, '#333', x, 0.17, z, cart26);
box(0.08, 0.8, 0.08, '#6a4020', -0.5, 0.77, -0.66, cart26); box(0.08, 0.8, 0.08, '#6a4020', 0.5, 0.77, -0.66, cart26); box(1.08, 0.08, 0.08, '#6a4020', 0, 1.17, -0.66, cart26);
const statue26 = pivot(cart26, 0, 0.52, 0.1); { const sg = '#a0a0a8'; box(0.9, 0.3, 0.9, '#8a8a92', 0, 0.15, 0, statue26); box(0.8, 0.75, 0.8, sg, 0, 0.67, 0, statue26); box(0.18, 0.5, 0.18, sg, -0.5, 0.75, 0, statue26); box(0.18, 0.5, 0.18, sg, 0.5, 0.75, 0, statue26);
  const fm = faceMat('#b0b0b8', g => { g.fillStyle = '#e8e8f0'; g.fillRect(8, 6, 16, 14); g.fillStyle = '#5a5a66'; g.fillRect(13, 9, 7, 8); g.fillRect(11, 26, 10, 2); });
  const hh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.72), fm); hh.position.y = 1.36; hh.castShadow = true; statue26.add(hh); box(0.82, 0.3, 0.82, '#c8c8d0', 0, 1.8, 0, statue26); box(1.0, 0.07, 1.0, '#c8c8d0', 0, 1.66, 0, statue26); }
// HUD: things touched (allowed: 0) + sunrise clock
const TOUCH26 = [[E.muVase + 3.2, 'Leggy (vase)'], [E.muPaint + 1.2, 'me (painting)'], [E.muPress, 'the statue'], [E.muSneak + 4, 'Bloop'], [E.muToe + 2.2, 'Leggy (dino)'], [E.muSmash, 'Rexbone'], [E.muMess + 2, 'Rexbone'], [E.muFix + 1, 'everyone'], [E.muSign, 'ME (the sign)']];
function drawMuseumHUD(t) { if (t >= E.freeze || t < E.muRules + 2) return; const n = TOUCH26.filter(a => t >= a[0]).length, last = [...TOUCH26].reverse().find(a => t >= a[0]), fl = last && t < last[0] + 1.4 && Math.floor(t * 8) % 2;
  rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(40,10,24,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = fl ? '#ff6b6b' : '#ffe066'; ctx.stroke();
  outlined('THINGS TOUCHED', 132, 114, 15, '#ffe066', '#000', 3); outlined(t >= E.muSign + 6 ? 'ALL OF THEM' : String(n), 132, 148, t >= E.muSign + 6 ? 24 : 32, fl ? '#ff6b6b' : '#ffffff', '#000', 5);
  outlined(last ? 'last: ' + last[1] : 'allowed: 0', 132, 175, 13, '#fff', '#000', 3);
  if (t >= E.muMess && t < E.muDawn) { rrect(22, 196, 220, 50, 12); ctx.fillStyle = 'rgba(10,14,40,.8)'; ctx.fill(); ctx.strokeStyle = '#9fc0ff'; ctx.stroke(); const left = Math.max(0, Math.round(lerp(300, 0, seg(t, E.muMess, E.muDawn))));
    outlined('SUNRISE IN ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), 132, 222, 18, left < 60 ? '#ffb070' : '#cfe0ff', '#000', 4); } }
function drawAlarm26(T) { if (!win(T, E.muPress + 0.3, E.muLocked)) return; const bl = Math.floor(T * 4) % 2; ctx.save(); ctx.fillStyle = bl ? 'rgba(200,20,30,.85)' : 'rgba(90,0,10,.85)'; ctx.fillRect(0, H * 0.13, W, 54);
  outlined('!! CLOSING TIME !!  MUSEUM LOCKING  !! CLOSING TIME !!', W / 2 + Math.sin(T * 3) * 30, H * 0.13 + 28, 26, '#fff', '#000', 5); ctx.restore(); }
const clampCam26 = c => ({ p: [clamp(c.p[0], -15.6, 15.6), clamp(c.p[1], 0.8, 11.2), clamp(c.p[2], -19.6, 19.6)], l: c.l, fov: c.fov });

// ================================================================ EPISODE 26: "THE MUSEUM (do not touch anything)" — the plaza (grand opening; Professor Hootsworth's one rule) → the Great Hall by day (vase, painting, THE BUTTON) → locked in at night (Rexbone wakes up; fetch; fix it all before sunrise) → dawn inspection → the sign
// ---------------------------------------------------------------- set A: the museum plaza
const plaza = (() => {
  const g = mk('plaza'); const st = new VSet(g);
  for (let x = -40; x <= 40; x++) for (let z = -40; z <= 26; z++) { const pav = Math.abs(x) <= 12 && z >= -11 && z <= 16; st.add(x, 0, z, pav ? ((x + z) & 1 ? 'stone' : 'path') : 'turf'); }
  for (let x = -14; x <= 14; x++) for (let z = -30; z <= -12; z++) for (let y = 1; y <= 10; y++) { const shell = x === -14 || x === 14 || z === -30 || z === -12 || y === 10; if (!shell) continue; if (z === -12 && Math.abs(x) <= 3 && y <= 6) continue; st.add(x, y, z, 'quartz'); }
  for (let x = -3; x <= 3; x++) for (let y = 1; y <= 6; y++) st.add(x, y, -14, 'dark');
  for (const x of [-11, -7, 7, 11]) for (let y = 1; y <= 8; y++) st.add(x, y, -9, 'quartz');
  for (let x = -13; x <= 13; x++) for (let z = -11; z <= -8; z++) st.add(x, 9, z, 'quartz');
  for (const [y, hw] of [[10, 12], [11, 8], [12, 4]]) for (let x = -hw; x <= hw; x++) for (let z = -11; z <= -9; z++) st.add(x, y, z, y === 12 ? 'jam' : 'quartz');
  for (const [x, z, h] of [[-22, -4, 6], [22, -4, 6], [-24, 12, 5], [24, 12, 5], [-18, 22, 6], [18, 22, 5], [-30, -18, 7], [30, -18, 7]]) tree20(st, x, z, h, false);
  st.build();
  plane26(10, 0.9, txtMat26(['SHARDWILD MUSEUM'], 512, 48, '#f4ecd8', '#5a3a22', 36), g, 0, 10, -8.44);
  plane26(6, 1.2, txtMat26(['GRAND OPENING!'], 384, 76, '#c0182a', '#ffe066', 46), g, 0, 7.4, -7.42);
  sign26(['PLEASE DO NOT', 'TOUCH THE MUSEUM'], g, 5.6, -6.4, -0.3, 1.4, 1.6);
  const dL = pivot(g, -3, 0.5, -11.4), dR = pivot(g, 3, 0.5, -11.4); box(3, 6, 0.2, '#6a4020', 1.5, 3, 0, dL); box(3, 6, 0.2, '#6a4020', -1.5, 3, 0, dR); box(0.2, 0.5, 0.3, 0, 2.6, 3, 0.2, dL, goldM); box(0.2, 0.5, 0.3, 0, -2.6, 3, 0.2, dR, goldM);
  burst(E.muRunOut + 0.4, [0, 3, -11], { n: 90, colors: ['#6a4020', '#efe6cc', '#f4ecd8'], speed: 8, size: 0.25, life: 1.4, grav: 12, up: 4 });
  burst(E.muCurator + 0.2, [0, 3, -11], { n: 40, colors: ['#ffe066', '#ffffff'], speed: 4, size: 0.12, life: 1, grav: 2, up: 2 });
  const C = [[0, 0, 18, 34, 0, 6, -12, 60], [5.9, 6, 6, 22, 0, 4, -10, 56], [6, 11, 3.4, 14, 0, 2, 9, 52], [13.9, 10, 3.4, 0, 0, 2, -4, 52],
    [14, -0.8, 3.6, 1.6, 0, 2.2, -8, 50], [17.9, -0.7, 3.5, 1.0, 0, 2.1, -7, 46], [18, 1.3, 3.8, -1.4, 0, 2, -6, 46], [21.9, 1.2, 3.7, -1.8, 0, 2.1, -6, 42],
    [22, 5, 2, -4.4, 0, 1.8, -4.6, 46], [25.9, 4.6, 2, -4.4, 0, 1.8, -4.6, 42], [26, 7.5, 3, 1, 1, 1.4, -5, 50], [30.9, 7, 2.8, 0.4, 1, 1.6, -5, 46],
    [31, -3.5, 2.6, -4.5, 0.3, 2, -6, 46], [33.9, -3.3, 2.6, -4.7, 0.3, 2.1, -6, 42], [34, -6, 2, 2, 0, 2.5, -9, 54], [E.muEnter, -5, 3, 0, 0, 3, -12, 52],
    [E.muRunOut, 6, 1.0, 9, -1, 3, -6, 60], [E.freeze, 4, 5, 13, -7.4, 6, 2, 58], [E.logo, 4, 5, 13, -7.4, 6, 2, 58]];
  function update(t) {
    hideMisc(); hide25(); [hero.root, bloop6.B.root, L6.root, owl.root, rex.root, cart26].forEach(o => parentTo(o, g)); L6.root.rotation.set(0, 0, 0);
    const late = t >= E.muRunOut, op = ss(seg(t, E.muCurator, E.muCurator + 1)); dL.rotation.y = -1.6 * op; dR.rotation.y = 1.6 * op;
    rexPile.visible = false; boneT.visible = false; vaseShards.visible = false; vaseA.visible = false; paintP.visible = false; lanternH.visible = false;
    let cam = camKeys(t, C);
    if (!late) {
      const H_ = act(t, [[0, 0, 0.5, 15], [6, 0, 0.5, 12], [13, 0, 0.5, -3], [34.5, 0, 0.5, -3], [E.muEnter, 0, 0.5, -11]],
        [[0, { face: 'smug', wave: t < 4 }], [E.muArrive, { face: 'smug' }], [E.muCurator, { face: 'normal', yaw: PI }], [E.muRules, { face: 'scared', yaw: PI }], [E.muShake, { face: 'smug', yaw: PI, hold: t < E.muShake + 1.6 }],
         [E.muShake + 1.6, { face: 'scared', yaw: PI }], [E.muPitch, { face: 'smug', yaw: PI - 0.5 }], [E.muReject, { face: 'scared', yaw: PI - 0.5 }], [E.muIn, { face: 'smug' }]]);
      pose(hero, { t, ...H_ });
      const bA = act(t, [[0, 2.6, 0.5, 17], [6, 2.6, 0.5, 14], [13, 2.6, 0.5, -0.5], [E.muPitch, 2.6, 0.5, -0.5], [E.muPitch + 2, 2, 0.5, -3.2], [E.muIn + 0.8, 2, 0.5, -3.2], [E.muEnter, 1.6, 0.5, -10]], [[0, {}]]);
      const bo = t > E.muReject ? { facepalm: t < E.muReject + 4 } : t > E.muPitch + 2 ? { handOut: true } : { walk: bA.walk, phase: bA.phase * 2 };
      poseBurble(bloop6, t, bA.p, t > E.muPitch + 2 && t < E.muIn + 0.8 ? PI - 0.4 : bA.yaw, bo); bHat.visible = true; bHat.position.y = 1.2;
      const cy = t > E.muPitch + 2 && t < E.muIn + 0.8 ? PI - 0.4 : bA.yaw; cart26.position.set(...wl(bA.p, cy, [0, 0, 1.3])); cart26.rotation.set(0, cy, 0); cart26.visible = true;
      parentTo(statue26, cart26); statue26.position.set(0, 0.52, 0.1); statue26.rotation.set(0, 0, 0); statue26.visible = true;
      const lA = act(t, [[0, -3, 0.5, 16], [6, -3, 0.5, 13], [13, -3, 0.5, -1.5], [E.muReject + 1, -3, 0.5, -1.5], [E.muReject + 2.5, 1.2, 0.5, -0.6], [E.muIn + 0.5, 1.2, 0.5, -0.6], [E.muEnter, -1.4, 0.5, -10]], [[0, {}]]);
      poseLurk(L6, t, lA.p, t > E.muReject + 2.5 && t < E.muIn + 0.5 ? -2.4 : lA.yaw, lA.walk ? 2 : 0.3); L6.root.visible = true;
      owl.root.visible = t > E.muCurator - 0.4;
      const oA = act(t, [[E.muCurator, 0, 0.5, -12.4], [E.muCurator + 2, 0, 0.5, -6], [E.muIn, 0, 0.5, -6], [E.muIn + 3, 0, 0.5, -12]], [[0, {}]]);
      const oq = t < E.muCurator + 2 ? { walk: 1, flap: true } : t < E.muRules ? { flap: t < E.muCurator + 3 } : t < E.muShake ? { point: true } : t < E.muShake + 3 ? { lean: -0.3, wide: true, flap: win(t, E.muShake + 1.4, E.muShake + 2.4) } :
        t < E.muPitch + 2 ? {} : t < E.muReject ? { lean: 0.35, headSpin: -0.5 } : t < E.muIn ? { stamp: t < E.muReject + 1.4, headSpin: -0.5 } : { walk: 1 };
      poseOwl(owl, t, oA.p, t < E.muCurator + 2 ? 0 : t < E.muIn ? 0 : PI, oq);
      rex.root.visible = false; skullF.visible = false;
    } else {
      const ra = walker(t, [[E.muRunOut, 0, 0.5, -13], [E.muRunOut + 3, 0, 0.5, -5], [E.muRunOut + 6, 0.5, 0.5, 0], [E.freeze, -1, 0.5, 3]]);
      rex.root.visible = true; rex.hd.visible = false; poseRex(rex, t, ra.p, ra.yaw, { walk: 1, phase: t * 11, awake: 1, wag: true }); parentTo(vaseB, rex.neck); vaseB.position.set(0, 1.5, 1.2); vaseB.scale.setScalar(1.9); vaseB.rotation.set(0, 0, 0); vaseB.visible = true;
      const lp = wl(ra.p, ra.yaw, [0, 2.6 + Math.abs(Math.sin(t * 11)) * 0.25, -0.6]); poseLurk(L6, t, lp, ra.yaw, 3); L6.root.visible = true; L6.root.rotation.z = Math.sin(t * 11) * 0.1;
      const hA = act(t, [[E.muRunOut + 3.5, 0, 0.5, -11.5], [E.freeze, 3, 0.5, -3.4]], [[0, { face: 'scared', panic: true }]]); pose(hero, { t, ...hA }); hero.root.visible = t > E.muRunOut + 3.3;
      owl.root.visible = true; poseOwl(owl, t, [-2.4, 0.5, -10.2], 0.2, { flap: true, headSpin: Math.sin(t * 3) * 1.2, wide: true });
      parentTo(skullF, owl.skullSlot); skullF.position.set(0, 0.32, 0.05); skullF.rotation.set(0, 0, 0); skullF.scale.setScalar(0.95); skullF.visible = true;
      poseBurble(bloop6, t, [2.6, 0.5, -10.2], -0.3, { facepalm: true }); bHat.visible = true; bHat.position.y = 1.2; cart26.visible = false;
    }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Great Hall (day → locked in at night → dawn)
const hall = (() => {
  const g = mk('hall'); const st = new VSet(g); const wallG = new THREE.Group(); g.add(wallG); const ws = new VSet(wallG);
  for (let x = -17; x <= 17; x++) for (let z = -21; z <= 21; z++) st.add(x, 0, z, Math.abs(x) <= 1 && z > -2 ? 'jam' : (x + z) & 1 ? 'quartz' : 'stone');
  const win26 = (z) => [-12, 0, 12].some(c => Math.abs(z - c) <= 2);
  for (let y = 1; y <= 11; y++) { for (let z = -21; z <= 21; z++) { ws.add(-17, y, z, y >= 8 && y <= 10 && win26(z) ? 'glass' : y === 1 ? 'plank' : 'castle'); ws.add(17, y, z, y === 1 ? 'plank' : 'castle'); }
    for (let x = -16; x <= 16; x++) { ws.add(x, y, -21, y === 1 ? 'plank' : 'castle'); if (!(Math.abs(x) <= 3 && y <= 6)) ws.add(x, y, 21, y === 1 ? 'plank' : 'castle'); } }
  for (const x of [-13, 13]) for (const z of [-15, -5, 5, 15]) for (let y = 1; y <= 11; y++) ws.add(x, y, z, 'quartz');
  for (let x = -6; x <= 6; x++) for (let z = -6; z <= -2; z++) st.add(x, 1, z, 'dark');
  st.build(); ws.build(); wallG.traverse(o => { o.castShadow = false; });
  const ceil = box(35, 0.6, 43, '#d8ccb4', 0, 11.8, 0, g); ceil.castShadow = false; const lampM = new THREE.MeshBasicMaterial({ color: '#fff4d0' });
  for (const x of [-7, 7]) for (const z of [-12, 0, 12]) { const l = box(1.4, 0.3, 1.4, 0, x, 11.35, z, g, lampM); l.castShadow = false; }
  const beamM = new THREE.MeshBasicMaterial({ color: '#9fc0ff', transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }); const beams = [-12, 0, 12].map(z => { const b = box(2.6, 13, 4.6, 0, -12.2, 4.6, z, g, beamM); b.rotation.z = 0.8; b.castShadow = false; return b; });
  // the Shardheart (background crystal)
  box(2, 1.4, 2, '#f0ece4', 0, 1.2, -18, g); const crys = new THREE.Mesh(new THREE.OctahedronGeometry(1.3, 0), new THREE.MeshLambertMaterial({ color: '#5ff7ff', emissive: '#1fa8c0', emissiveIntensity: 0.8, flatShading: true })); crys.position.set(0, 3.4, -18); g.add(crys);
  const crysL = new THREE.PointLight('#5ff7ff', 4, 16, 1.4); crysL.position.set(0, 3.4, -16); g.add(crysL); const redL = new THREE.PointLight('#ff2020', 0, 50, 1); redL.position.set(0, 9, 8); g.add(redL);
  // pedestals + signs + the domino posts
  box(1, 1.3, 1, '#f0ece4', 10.5, 1.15, 7, g); box(1, 1.2, 1, '#f0ece4', -8, 1.1, 8, g); const btn = box(0.5, 0.18, 0.5, 0, -8, 1.79, 8, g, new THREE.MeshLambertMaterial({ color: '#e8344e', emissive: '#e8344e', emissiveIntensity: 0.4 }));
  box(1.6, 1.0, 1.6, '#f0ece4', -10, 1.0, -2, g);
  sign26(['ANCIENT VASE', 'DO NOT TOUCH'], g, 12.2, 8.6, -0.6); sign26(['THE BUTTON', 'DO NOT PRESS'], g, -9.8, 9.4, 0.5); sign26(['REXBONE', 'DO NOT TOUCH'], g, 4.4, -0.6, 0); sign26(['COMING SOON'], g, -12.2, -0.9, 0.4);
  const signF = sign26(['DO NOT', 'TOUCH'], g, -2, 10.8, 0, 1.5);
  const posts = [], ropes = []; for (let i = 0; i < 8; i++) { const p = pivot(g, -2, 0.5, 9.8 - i * 1.3); box(0.5, 0.08, 0.5, 0, 0, 0.04, 0, p, goldM); box(0.14, 1.3, 0.14, 0, 0, 0.65, 0, p, goldM); box(0.24, 0.2, 0.24, 0, 0, 1.35, 0, p, goldM); posts.push(p);
    if (i) ropes.push(box(0.08, 0.08, 1.16, '#c0182a', -2, 1.65, 9.8 - (i - 0.5) * 1.3, g)); }
  g.add(paintP); paintP.position.set(16.4, 4.6, 12); const shut = new THREE.Group(); g.add(shut); box(7.4, 6.2, 0.3, '#5a5a66', 0, 0, 0, shut); for (let i = 0; i < 6; i++) box(7.5, 0.12, 0.34, '#3a3a44', 0, -2.6 + i, 0, shut);
  burst(E.muSmash, [10.5, 2.2, 7], { n: 60, colors: ['#3d6bd0', '#f4f4f4'], speed: 6, size: 0.14, life: 1.2, grav: 14, up: 3 });
  burst(E.muSneeze, [2, 4.5, -4], { n: 140, colors: ['#efe6cc', '#d8ccaa', '#ffffff'], speed: 10, size: 0.3, life: 1.6, grav: 12, up: 5 });
  burst(E.muReass, [0, 3, -4], { n: 80, colors: ['#7cff6b', '#efe6cc', '#ffffff'], speed: 4, size: 0.16, life: 2, grav: -2, up: 2 });
  burst(E.muWake, [0, 4.5, -4], { n: 50, colors: ['#d8ccaa', '#a89870'], speed: 3, size: 0.12, life: 1.6, grav: 4, up: 1 });
  for (let t = E.muFix; t < E.muFix + 14; t += 0.6) burst(t, [lerp(-2, 10, (t * 0.37) % 1), 1.6, lerp(6, 12, (t * 0.61) % 1)], { n: 8, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  for (const t of [E.muSnore, E.muSnore + 4, E.muSnore + 8]) burst(t, [3.5, 2.5, -4], { n: 16, colors: ['#d8ccaa'], speed: 2, size: 0.08, life: 1, grav: 3, up: 1 });
  const HOME = [0, 1.5, -4], HY = PI / 2, VP = [10.5, 1.8, 7], OP = [-9.2, 0.5, 0.4];
  const C = [[E.muEnter, 6, 9, 18, 0, 3, -4, 60], [43.9, 2, 7, 16, 0, 3, -4, 56], [44, 8, 1.5, 7, 0, 4.5, -4, 55], [49.9, 7.4, 1.3, 6.4, 0, 5, -4, 52],
    [50, 14.5, 4.2, 12.5, 10.5, 1.8, 7.4, 50], [55.9, 14.4, 4, 12.2, 10.6, 1.8, 7.4, 46], [56, 6, 3, 15, 13, 2, 12, 54], [61.9, 9, 3, 15, 15, 3, 12, 50],
    [62, 11.5, 3.6, 14.5, 16, 4, 12, 46], [63.9, 11.8, 3.7, 14.2, 16, 4.2, 12, 44], [64, 14.4, 2.7, 13.4, 12, 2.1, 9, 44], [67.9, 14.2, 2.6, 13, 12, 2.2, 9, 38],
    [68, 0, 6, 16, -6, 1.5, 6, 58], [73.9, -2, 5, 15, -8, 1.5, 6, 54], [74, -7.2, 2.1, 5.6, -8, 2, 10.2, 50], [77.9, -7.5, 2.1, 6.2, -8, 2.2, 10.2, 40],
    [78, -2.5, 2.6, 5.5, -8, 1.6, 6, 50], [81.9, -3, 2.6, 5.8, -8, 1.8, 6.5, 48], [82, 3, 3, 10, 0, 3.5, 20, 56], [84.9, 2, 3, 11, 0, 3.5, 20, 52],
    [85, -12, 6, 14, -2, 2, 0, 56], [88.9, -11, 5, 13, -4, 2, 5, 52], [89, 1.5, 2.6, 4, -5, 1.8, 8.6, 50], [95.9, 2, 2.4, 2.5, -3, 1.8, 6.5, 46],
    [96, -4, 4, 6, -10, 1.4, -0.5, 52], [101.9, -5, 3.4, 4.6, -10, 1.6, -1.5, 46], [102, 6, 1.4, 5, 0, 3.5, -4, 56], [107.9, 5, 1.2, 4, 1, 3, -3, 52],
    [108, 7, 2.2, 4.5, 2.2, 1.4, -2, 48], [109.9, 6.8, 2.2, 4.2, 2.2, 1.6, -2.2, 46], [110, 10, 5, 1, 3, 5, -4, 50], [115.9, 9.4, 5.2, 0.4, 3.4, 5.6, -4, 44],
    [116, 6, 1, 4, 2, 5.5, -4, 58], [119.9, 6.6, 0.9, 4.6, 2, 6, -4, 60],
    [128, 3, 4.5, 1, 11, 1.8, 8, 56], [131.9, 2.6, 4.6, 2, 9, 2, 10, 56], [132, -14, 1.2, 0, -4, 2.5, 12, 58], [135.9, -14.4, 1.4, 1, -6, 2.5, 9, 58],
    [136, -14.6, 1.6, 7.4, -6, 4, 5, 54], [139.9, -14.4, 1.4, 7, -6, 4.5, 5, 50], [140, -9, 2.5, 13, -6, 2.5, 4, 50], [145.9, -9.5, 2.4, 12, -6, 2.2, 4, 46],
    [146, -2, 5, 8, -8, 2, -6, 58], [151.9, -2, 5, 6, -8, 2, -4, 56], [152, -14, 8, 16, 6, 2, 6, 60], [157.9, -14, 7, 12, 6, 2, 8, 58],
    [158, 10, 3, 17, 4, 2, 9, 50], [163.9, 11, 2.8, 16.6, 5, 2, 9.5, 46], [164, -12, 10, 18, 4, 1, 4, 60], [177.9, -6, 10, 18, 4, 1, 4, 60],
    [178, 11, 6, 9, 3, 2, -1, 56], [185.9, 11, 6.4, 7, 1, 3, -3, 54], [186, 7, 5, 6, 0, 2.5, -4, 52], [191.9, 6, 4, 4, 0, 2.5, -4, 48],
    [192, 1, 1.2, 14, -4, 1.6, 9, 52], [203.9, -1, 1.2, 17, -6, 1.8, 11, 50], [204, 12, 6, 16, -12, 6, -2, 60], [207.9, 11, 5, 15, -12, 4, 0, 58],
    [208, 1, 2.4, 12, 0, 2, 19, 52], [211.9, 2, 2.6, 10, 6, 2, 13, 52], [212, 11.6, 3.4, 4.4, 10.2, 2, 8, 50], [217.9, 11.4, 3.2, 4.6, 10.2, 2.1, 8.2, 46],
    [218, 15.2, 3.6, 15, 13.4, 2.2, 10.4, 56], [223.9, 15.1, 3.5, 14.7, 13.4, 2.2, 10.4, 52], [224, 8.5, 4.5, -1, 3, 2.2, -1.5, 54], [229.9, 8.3, 4.3, -0.6, 2.4, 2.2, -2, 50],
    [230, -14, 3, 2.6, -9.6, 1.6, -1, 50], [235.9, -13.8, 2.8, 2.2, -9.6, 1.8, -1, 46], [236, -4.6, 2.6, 5, -8.6, 1.6, -0.6, 52], [241.9, -4.4, 2.4, 5.2, -8.6, 1.8, -0.6, 48],
    [242, 2, 2.6, 16, -2, 1.8, 11, 52], [247.9, 1, 2.4, 15.4, -2, 1.8, 11.4, 46], [248, -6, 2.2, 12, -2, 1, 10, 50], [255.9, -6.5, 3, 4, -1, 1, 1, 50],
    [256, 7, 3, 4, 2, 4.5, -4, 54], [259.9, 7.6, 3, 4.6, 3, 5.5, -4, 50], [260, 0, 8, 16, -2, 3, -3, 64], [263.9, 0, 7.5, 15, -4, 2.5, -2, 62],
    [264, -6, 3, 4.6, -9.2, 2.6, 0.4, 46], [267.9, -6.2, 2.9, 4.4, -9.2, 2.8, 0.4, 42], [268, 9, 4, 6, 0, 3.5, -4, 56], [271.9, 8, 4, 5, 0, 4, -4, 52],
    [272, 4, 5, -1, 0, 3, 8, 60], [E.muRunOut, 3, 4, 8, 0, 3, 19, 60]];
  const chaseH = [[E.muChase, 2, 0.5, 4.5], [123, 8, 0.5, 4.5], [126, 13, 0.5, 9], [129, 9, 0.5, 14], [132, -2, 0.5, 14], [135, -10, 0.5, 8], [136.5, -11, 0.5, 5.5]];
  const chaseR = [[E.muChase + 1.5, 5, 0.5, 1.5], [125, 8, 0.5, 4], [128, 11.5, 0.5, 8.5], [131, 7, 0.5, 12.5], [134, -3, 0.5, 12], [137, -5, 0.5, 6.5], [E.muFetch, -5, 0.5, 5]];
  function update(t) {
    hideMisc(); hide25(); [hero.root, bloop6.B.root, L6.root, owl.root, rex.root, cart26, vaseA, vaseB, vaseShards, rexPile, boneT].forEach(o => parentTo(o, g)); L6.root.rotation.set(0, 0, 0);
    const night = t >= E.muShut + 2.4 && t < E.muDawn, dawn = t >= E.muDawn, alarm = win(t, E.muPress + 0.3, E.muShut + 2.4);
    lampM.color.set(night ? '#3a3628' : dawn ? '#ffe0b0' : '#fff4d0'); beams.forEach(b => b.visible = night || win(t, E.muDawn, E.muStatue)); beamM.color.set(dawn ? '#ffb070' : '#9fc0ff'); beamM.opacity = dawn ? 0.16 * (1 - seg(t, E.muInspect + 10, E.muStatue)) : 0.12;
    redL.intensity = alarm ? (Math.floor(t * 4) % 2 ? 40 : 4) : 0; crysL.intensity = night ? 6 : 3; crys.rotation.y = t * 0.4; crys.position.y = 3.4 + Math.sin(t * 1.5) * 0.15;
    btn.position.y = win(t, E.muPress, E.muPress + 1) ? 1.72 : 1.79;
    lanternH.visible = night; heroLight.intensity = night ? 14 : 0; shut.position.set(0, lerp(9.8, 3.6, ss(seg(t, E.muShut, E.muShut + 0.5)) * (1 - ss(seg(t, E.muDawn, E.muDawn + 3)))), 21.7);
    // ---- Rexbone
    let R = { p: HOME, yaw: HY, o: {} }; const wk = (K) => { const a = walker(t, K); return { p: a.p, yaw: a.yaw, o: { walk: Math.min(1, a.walk), phase: a.phase * 1.6, awake: 1 } }; };
    if (t >= E.muWake) R.o = { awake: 1, angry: true, rattle: t < E.muRoar, roar: win(t, E.muRoar, E.muRoar + 3) ? Math.sin(seg(t, E.muRoar, E.muRoar + 3) * PI) : 0 };
    if (t >= E.muChase) { if (t < E.muChase + 1.5) { R = { p: arcPath(t, [[E.muChase, ...HOME, 0], [E.muChase + 1.5, 5, 0.5, 1.5, 2.5]]), yaw: 0.8, o: { awake: 1, angry: true } }; } else { R = wk(chaseR); R.o.angry = true; } }
    if (t >= E.muFetch) R = { p: [-5, 0.5, 5], yaw: -PI / 2, o: { awake: 1, bow: win(t, E.muFetch + 1, E.muThrow) ? 1 : 0, wag: true, pant: true, tilt: win(t, E.muFetch + 3, E.muFetch + 5) ? 0.4 : 0 } };
    if (t >= E.muThrow) { R = wk([[E.muThrow + 0.4, -5, 0.5, 5], [E.muThrow + 2.6, -10, 0.5, -10.4], [E.muThrow + 3.2, -10, 0.5, -11], [E.muMess, -6, 0.5, 3.6]]); R.o.wag = true; }
    const cA = (c, r, w, t0, tt) => { const a = (tt - t0) * w; const p = [c[0] + Math.cos(a) * r, 0.5, c[2] + Math.sin(a) * r]; return { p, yaw: yawTo(p, [p[0] - Math.sin(a), 0, p[2] + Math.cos(a)]) }; }, circ = (c, r, w, t0) => cA(c, r, w, t0, t);
    if (t >= E.muMess) { const c = circ([1, 0, 7], 7.5, 1.05, E.muMess - 3); R = { p: c.p, yaw: c.yaw, o: { awake: 1, walk: 1, phase: t * 12, wag: true, pant: true } }; }
    if (t >= E.muFix) { const c = circ([3, 0, 12.5], 3, 0.8, E.muFix); R = { p: c.p, yaw: c.yaw, o: { awake: 1, walk: 0.6, phase: t * 7, wag: true } }; }
    if (t >= E.muLull) { if (t < E.muLull + 4) { const c0 = cA([3, 0, 12.5], 3, 0.8, E.muFix, E.muLull); R = wk([[E.muLull, ...c0.p], [E.muLull + 4, 6, 0.5, 1.5]]); R.o.walk = 0.5; }
      else if (t < E.muLull + 5.5) R = { p: arcPath(t, [[E.muLull + 4, 6, 0.5, 1.5, 0], [E.muLull + 5.5, ...HOME, 2.5]]), yaw: -2.4, o: { awake: 1 } };
      else { const k = ss(seg(t, E.muLull + 6, E.muLull + 10)); R = { p: HOME, yaw: lerp(-2.4, HY - 2 * PI, k) + 2 * PI, o: { awake: k < 0.9 ? 1 : 0, curl: k, breathe: true } }; } }
    if (t >= E.muSnore) R = { p: HOME, yaw: HY, o: { curl: 1, breathe: true, rattle: [E.muSnore, E.muSnore + 4, E.muSnore + 8, E.muInspect + 17].some(s => win(t, s, s + 0.8)) } };
    if (t >= E.muWake2) { const k = ss(seg(t, E.muWake2, E.muWake2 + 2)); R = { p: HOME, yaw: HY, o: { curl: 1 - k, awake: 1, sniff: win(t, E.muWake2 + 2, E.muSneeze) ? -Math.sin(seg(t, E.muWake2 + 2, E.muSneeze) * PI * 0.5) * 1.2 : 0 } }; }
    rex.root.visible = t < E.muSneeze || t >= E.muReass; rex.hd.visible = t < E.muSneeze;
    if (t >= E.muReass) { const k = ss(seg(t, E.muReass, E.muReass + 2.5)); R = { p: HOME, yaw: HY, o: { awake: 1, scale: Math.max(0.01, k), spin: (1 - k) * 8, wag: k > 0.9, roar: win(t, E.muReass + 2.6, E.muReass + 4) ? 0.6 : 0 } };
      if (t >= E.muReass + 4.5) { R = { p: arcPath(t, [[E.muReass + 4.5, ...HOME, 0], [E.muReass + 6, 0, 0.5, 4, 2], [E.muRunOut, 0, 0.5, 19.5, 0]]), yaw: 0, o: { awake: 1, walk: 1, phase: t * 11, wag: true } }; } }
    poseRex(rex, t, R.p, R.yaw, R.o);
    // bone pile + flying skull
    rexPile.visible = t >= E.muSneeze + 0.3 && t < E.muReass + 2.4; rexPile.children.forEach(m => { const h = m.userData.home, kd = ss(seg(t, E.muSneeze + 0.3 + m.userData.d, E.muSneeze + 1.1 + m.userData.d)), kr = ss(seg(t, E.muReass, E.muReass + 2.2));
      const P = L3(L3([2, 4.5, -4], h, kd), [0, 4, -4], kr); m.position.set(P[0], P[1] + Math.sin(kd * PI) * 3, P[2]); m.scale.setScalar(1 - kr); });
    skullF.visible = t >= E.muSneeze; skullF.scale.setScalar(0.95);
    if (t >= E.muSneeze && t < E.muSneeze + 2) { parentTo(skullF, g); const P = arcPath(t, [[E.muSneeze, 3.9, 6.4, -4, 0], [E.muSneeze + 2, OP[0], 3.25, OP[2], 3]]); skullF.position.set(...P); skullF.rotation.set(t * 9, t * 5, 0); }
    else if (t >= E.muSneeze + 2) { parentTo(skullF, owl.skullSlot); skullF.position.set(0, 0.32, 0.05); skullF.rotation.set(0, 0, 0); }
    // vase: original → wobble → smashed → Bloop's "restoration" → becomes Rexbone's new head
    vaseA.visible = t < E.muSmash; vaseA.position.set(...VP); const wob = win(t, E.muVase + 1.8, E.muVase + 3.2) ? Math.sin(t * 18) * 0.25 * (1 - seg(t, E.muVase + 1.8, E.muVase + 3.2)) : 0; vaseA.rotation.set(wob, 0, wob * 0.7);
    vaseShards.visible = win(t, E.muSmash + 0.4, E.muFix + 8); vaseShards.position.set(10.5, 0.5, 7);
    vaseB.visible = t >= E.muFix + 2; vaseB.scale.setScalar(t < E.muReass ? Math.min(1, seg(t, E.muFix + 2, E.muFix + 9) * 1.1) : 1.9); vaseB.rotation.set(0, 0, 0);
    if (t < E.muReass) { parentTo(vaseB, g); vaseB.position.set(...VP); vaseB.rotation.y = win(t, E.muFix + 2, E.muFix + 9) ? t * 3 : 0; }
    else if (t < E.muReass + 2.4) { parentTo(vaseB, g); const P = arcPath(t, [[E.muReass, ...VP, 0], [E.muReass + 2.4, 3.35, 6.45, -4, 3]]); vaseB.position.set(...P); vaseB.scale.setScalar(lerp(1, 1.9, seg(t, E.muReass, E.muReass + 2.4))); vaseB.rotation.y = t * 6; }
    else { parentTo(vaseB, rex.neck); vaseB.position.set(0, 1.5, 1.2); }
    // painting: crooked → upside down → falls → rehung (still upside down)
    paintP.visible = true; { const sp = ss(seg(t, E.muPaint + 1.2, E.muPaint + 2.2)), fall = ss(seg(t, E.muMess + 1.6, E.muMess + 2.4)) * (1 - ss(seg(t, E.muFix + 6, E.muFix + 9)));
      paintP.rotation.set(lerp(0.12, PI + Math.sin(sp * PI) * 0.4, sp), 0, fall * 0.3); paintP.position.set(16.4 - fall * 0.6, lerp(4.6, 1.8, fall), 12); }
    // the domino posts and the sign
    const sk = ss(seg(t, E.muSign, E.muSign + 0.6)); signF.rotation.set(-sk * 1.3, 0, 0); posts.forEach((p, i) => { const t0 = E.muSign + 0.6 + i * 0.7; p.rotation.set(-ss(seg(t, t0, t0 + 0.35)) * (i === 7 ? 1.25 : 1.3), 0, 0); }); ropes.forEach(r => r.visible = t < E.muSign);
    // ---- cart + Bloop's statue
    cart26.visible = true; let cartP, cartY; const tilt = win(t, E.muPress, E.muSneak) ? ss(seg(t, E.muPress, E.muPress + 0.3)) * 0.95 : 0;
    // ---- Bloop
    const bA = act(t, [[E.muEnter, 2.5, 0.5, 20], [E.muEnter + 6, 3, 0.5, 11], [E.muVase - 2, 3, 0.5, 11], [E.muVase, 8, 0.5, 11.5], [E.muPaint - 6, 8, 0.5, 11.5], [E.muPaint - 2, 12.5, 0.5, 17.2], [E.muBye, 12.5, 0.5, 17.2], [E.muButton, -8, 0.5, 2.2],
      [E.muSneak, -8, 0.5, 2.2], [E.muSneak + 0.6, -8, 0.5, 7.9], [E.muSneak + 4, -10, 0.5, 1.5], [E.muChase, -10, 0.5, 1.5], [E.muChase + 4, -12, 0.5, -6], [E.muThrow + 4, -12, 0.5, -6], [E.muMess, -8, 0.5, 3],
      [E.muFix, -8, 0.5, 3], [E.muFix + 2, 10.5, 0.5, 8.5], [E.muFix + 12, 10.5, 0.5, 8.5], [E.muLull, 8, 0.5, 11], [E.muInspect, 8, 0.5, 11], [E.muInspect + 4, 5.5, 0.5, 11], [E.muInspect + 16, 6, 0.5, 4], [E.muStatue, -7.4, 0.5, 0], [E.muRunOut, -7.4, 0.5, 0]], [[0, {}]]);
    let by = bA.yaw, bo = { walk: bA.walk, phase: bA.phase * 2 };
    if (win(t, E.muButton, E.muPress)) { by = 0; bo = { facepalm: t > E.muButton + 1.4 && t < E.muPress - 1, handOut: t > E.muPress - 0.8 }; }
    if (win(t, E.muPress, E.muSneak)) { by = 0; bo = { angry: t < E.muLocked + 2 }; }
    if (win(t, E.muSneak + 4, E.muToe)) { by = PI; bo = { hop: win(t, E.muSneak + 6, E.muSneak + 9), handOut: t < E.muSneak + 6 }; }
    if (win(t, E.muToe + 2, E.muChase)) { by = 0.8; bo = { angry: true }; } if (win(t, E.muChase + 4, E.muMess)) { by = 0.6; bo = { angry: t < E.muFetch }; }
    if (win(t, E.muMess, E.muFix)) { by = 0.6; bo = { facepalm: true }; } if (win(t, E.muFix + 2, E.muFix + 12)) { by = PI; bo = { handOut: true, hop: Math.floor(t * 2) % 2 === 0 }; }
    if (win(t, E.muStatue, E.muRunOut)) { by = -2.2; bo = { handOut: t < E.muAccept, hop: win(t, E.muAccept, E.muAccept + 6) }; if (t > E.muWake2) bo = { angry: true }; if (t > E.muReass) bo = { facepalm: true }; }
    poseBurble(bloop6, t, bA.p, by, bo); bHat.visible = true; bHat.position.y = 1.2 + (win(t, E.muAccept, E.muAccept + 2) ? Math.sin(seg(t, E.muAccept, E.muAccept + 2) * PI) * 2.4 : 0); bHat.rotation.y = win(t, E.muAccept, E.muAccept + 2) ? t * 8 : 0;
    // cart follows Bloop until it rolls away, then waits; then Bloop pushes it to the empty pedestal
    if (t < E.muButton) { cartY = bA.yaw; cartP = wl(bA.p, cartY, [0, 0, 1.3]); }
    else if (t < E.muPress - 0.8) { cartY = 0; cartP = [-8, 0.5, 3.5]; } else if (t < E.muSneak + 0.6) { cartY = 0; cartP = [-8, 0.5, lerp(3.5, 6.6, ss(seg(t, E.muPress - 0.8, E.muPress)))]; }
    else if (t < E.muSneak + 4) { cartY = PI; cartP = wl(bA.p, PI, [0, 0, 1.3]); } else { cartY = PI; cartP = [-10, 0.5, 0.2]; }
    cart26.position.set(...cartP); cart26.rotation.set(0, cartY, 0);
    const lift = seg(t, E.muSneak + 4, E.muSneak + 5.5);
    if (t < E.muSneak + 4) { parentTo(statue26, cart26); statue26.position.set(0, 0.52, 0.1); statue26.rotation.set(tilt, 0, 0); }
    else { parentTo(statue26, g); statue26.position.set(...arcPath(t, [[E.muSneak + 4, -10, 1.02, -1.2, 0], [E.muSneak + 5.5, -10, 1.5, -2, 1.2]])); statue26.rotation.set(0, lerp(PI, 0, lift), 0); }
    // ---- Leggy
    const rp = rex.root.position; const lA = act(t, [[E.muEnter, -3, 0.5, 19], [E.muLeggyLook, 2.6, 0.5, 2.2], [E.muVase - 0.5, 2.6, 0.5, 2.2], [E.muVase + 2, 14, 0.5, 6.4], [E.muVase + 2.6, 14, 0.5, 7], [E.muVase + 3.2, 13.1, 0.5, 7],
      [E.muPaint - 2, 13.1, 0.5, 7], [E.muPaint + 2, 9.5, 0.5, 16.6], [E.muBye, 9.5, 0.5, 16.6], [E.muButton, -11, 0.5, 6.4], [E.muCreep - 2, -11, 0.5, 6.4], [E.muCreep + 0.6, -6.6, 0.5, 10.2], [E.muCreep + 4, -6.6, 0.5, 10.2],
      [E.muToe - 2, 2.2, 0.5, 1.0], [E.muToe + 1.6, 2.2, 0.5, 1.0], [E.muToe + 2.2, 2.2, 0.5, 0.3], [E.muToe + 3, 2.2, 0.5, 1.2], [E.muChase, 2.2, 0.5, 1.2]], [[0, {}]]);
    let lp = lA.p, ly = lA.yaw, ls = lA.walk ? 2 : 0.3;
    if (win(t, E.muLeggyLook, E.muVase - 0.5)) { ly = PI; ls = 0.5; } if (win(t, E.muVase + 2.6, E.muPaint - 2)) ly = -PI / 2; if (win(t, E.muButton, E.muCreep - 2)) ly = 0.6;
    if (win(t, E.muCreep + 0.6, E.muCreep + 4)) { ly = faceTo(lp, [-5, 0, 8.6]); ls = 0.2; } if (win(t, E.muToe - 0.5, E.muChase)) { ly = PI; ls = t > E.muWake ? 3 : 0.3; }
    if (win(t, E.muChase, E.muFetch)) { const a = walker(t - 1.4, chaseR); lp = wl(a.p, a.yaw, [-2.4, 0, -2]); ly = a.yaw; ls = 3; }
    if (t >= E.muFetch - 1) { lp = [-8, 0.5, 2.2]; ly = faceTo(lp, [-5, 0, 5]); ls = 0.5; if (t > E.muThrow) ls = 2.5; }
    if (t >= E.muMess) { const c = circ([1, 0, 7], 6, 1.05, E.muMess - 4.4); lp = c.p; ly = c.yaw; ls = 3; }
    if (t >= E.muFix) { const c = circ([3, 0, 12.5], 5.5, 0.8, E.muFix + 1.6); lp = c.p; ly = c.yaw; ls = 2; }
    if (t >= E.muLull) { lp = [3.4, 0.5, 1.2]; ly = PI + 0.4; ls = 0.2; } if (t >= E.muSnore) { lp = [-3.5, 0.5, 0.6]; ly = PI; ls = 0.1; }
    if (t >= E.muWake2) { ls = 2.5; } if (t >= E.muReass + 3) { const k = seg(t, E.muReass + 3, E.muReass + 4.4); const top = wl(R.p, R.yaw, [0, 2.6, -0.6]); lp = k < 1 ? arcPath(k, [[0, 3.4, 0.5, 1.2, 0], [1, ...top, 2]]) : top; ly = R.yaw; ls = 3; }
    poseLurk(L6, t, lp, ly, ls); L6.root.visible = true; if (win(t, E.muLull, E.muSnore)) L6.root.rotation.z = Math.sin(t * 2.2) * 0.18; if (t >= E.muSnore && t < E.muWake2) L6.body.position.y = 0.9;
    // the spare bone (fetch!)
    boneT.visible = win(t, E.muFetch + 4, E.muMess + 1); if (boneT.visible) { if (t < E.muThrow) { parentTo(boneT, L6.hd); boneT.position.set(0, -0.35, 1.0); boneT.rotation.set(0, PI / 2, 0); }
      else if (t < E.muThrow + 3.4) { parentTo(boneT, g); boneT.position.set(...(t < E.muThrow + 1.6 ? arcPath(t, [[E.muThrow, -7, 2.2, 3, 0], [E.muThrow + 1.6, -10.4, 0.6, -12.4, 5]]) : [-10.4, 0.6, -12.4])); boneT.rotation.set(t < E.muThrow + 1.6 ? t * 12 : 0, 0.4, 0); }
      else if (t < E.muMess) { parentTo(boneT, rex.jaw); boneT.position.set(0, 0, 1.0); boneT.rotation.set(0, PI / 2, 0); } else { parentTo(boneT, g); boneT.position.set(-7.4, 0.6, 2.4); boneT.rotation.set(0, 0.3, 0); } }
    // ---- Professor Hootsworth
    owl.root.visible = t < E.muBye + 5 || t >= E.muInspect;
    const oA = act(t, [[E.muEnter, 0, 0.5, 17], [E.muEnter + 6, 0, 0.5, 7.5], [E.muVase - 2, 0, 0.5, 7.5], [E.muVase, 8.4, 0.5, 9.6], [E.muPaint - 6, 8.4, 0.5, 9.6], [E.muPaint - 2, 12, 0.5, 9], [E.muBye, 12, 0.5, 9], [E.muBye + 5, 0, 0.5, 21],
      [E.muInspect, 0, 0.5, 20], [E.muInspect + 4, 9.6, 0.5, 9.2], [E.muInspect + 10, 9.6, 0.5, 9.2], [E.muInspect + 11, 13.4, 0.5, 10.4], [E.muInspect + 16, 13.4, 0.5, 10.4], [E.muInspect + 17, 5, 0.5, 1.0],
      [E.muStatue - 1, 5, 0.5, 1.0], [E.muStatue + 1.5, ...OP], [E.muRunOut, ...OP]], [[0, {}]]);
    let oy = oA.yaw, oq = { walk: oA.walk };
    if (win(t, E.muEnter + 6, E.muVase - 2)) { oy = PI; oq = { point: true }; } if (win(t, E.muVase, E.muPaint - 6)) { oy = faceTo(oA.p, VP); oq = win(t, E.muVase + 1.8, E.muVase + 4) ? { wide: true, flap: true } : {}; }
    if (win(t, E.muPaint - 2, E.muBye)) { oy = PI; oq = { headSpin: win(t, E.muPaint + 2, E.muBye) ? -ss(seg(t, E.muPaint + 2, E.muPaint + 3.4)) * 2.3 : 0, wide: t > E.muPaint + 3 }; }
    if (win(t, E.muInspect + 4, E.muInspect + 10)) { oy = faceTo(oA.p, VP); oq = { lean: 0.35 }; } if (win(t, E.muInspect + 11, E.muInspect + 16)) { oy = faceTo(oA.p, [16.4, 0, 12]); oq = { headRoll: ss(seg(t, E.muInspect + 11.6, E.muInspect + 12.6)) * PI, lean: 0.2 }; }
    if (win(t, E.muInspect + 17, E.muStatue - 1)) { oy = faceTo(oA.p, HOME); oq = { lean: 0.3, wide: win(t, E.muInspect + 17, E.muInspect + 18.4) }; }
    if (t >= E.muStatue + 1.5) { oy = faceTo(OP, [-10, 0, -2]); oq = { lean: t < E.muAccept ? 0.3 : 0, stamp: win(t, E.muAccept, E.muAccept + 1.6), flap: win(t, E.muAccept + 1.6, E.muAccept + 4) || t > E.muSneeze + 2, wide: t > E.muWake2,
      headSpin: t > E.muSneeze + 2.4 ? Math.sin(t * 3) * 1.4 : 0 }; }
    poseOwl(owl, t, oA.p, oy, oq);
    // ---- me
    const hA = act(t, [[E.muEnter, 0, 0.5, 19.5], [E.muEnter + 6, 1, 0.5, 9], [E.muVase - 2, 1, 0.5, 9], [E.muVase, 10.5, 0.5, 9.0], [E.muPaint - 6, 10.5, 0.5, 9.0], [E.muPaint - 2, 15, 0.5, 12], [E.muBye, 15, 0.5, 12],
      [E.muButton, -8, 0.5, 10.2], [E.muLocked + 3, -8, 0.5, 10.2], [E.muLocked + 9, -2, 0.5, 6], [E.muSneak, -2, 0.5, 6], [E.muSneak + 2, -4, 0.5, 1.2], [E.muToe - 2, -4, 0.5, 1.2], [E.muToe, -1, 0.5, 4], [E.muWake + 2, -1, 0.5, 4], [E.muChase, 2, 0.5, 4.5],
      ...chaseH.slice(1), [E.muFetch, -11, 0.5, 5.5], [E.muMess, -10, 0.5, 5], [E.muMess + 4, 0, 0.5, 8], [E.muMess + 8, 8, 0.5, 10], [E.muFix, 12, 0.5, 10], [E.muFix + 3, 15, 0.5, 12], [E.muFix + 9, 15, 0.5, 12], [E.muFix + 12, -1, 0.5, 6], [E.muLull, -3, 0.5, 7],
      [E.muSnore, -3, 0.5, 7], [E.muSnore + 8, -6, 0.5, 12], [E.muInspect, -6, 0.5, 12], [E.muInspect + 4, 7, 0.5, 12.4], [E.muInspect + 10, 7, 0.5, 12.4], [E.muInspect + 11, 11, 0.5, 14], [E.muInspect + 16, 11, 0.5, 14], [E.muInspect + 17, 6, 0.5, 6],
      [E.muStatue, 6, 0.5, 6], [E.muStatue + 2, -7.2, 0.5, -2.8], [E.muRelief, -7.2, 0.5, -2.8], [E.muRelief + 4, -2, 0.5, 11.6], [E.muSign + 1.2, -2, 0.5, 11.6], [E.muSign + 3, -3.6, 0.5, 9.4], [E.muReass + 4, -3.6, 0.5, 9.4], [E.muRunOut, -1.4, 0.5, 18.6]],
      [[0, { face: 'smug' }], [E.muEnter + 6, { face: 'smug', yaw: PI, headPitch: -0.3 }], [E.muVase, { face: 'smug', yaw: PI, lean: 0.3 }], [E.muVase + 1.2, { face: 'scared', yaw: PI, lean: -0.3 }], [E.muVase + 1.6, { face: 'scared', yaw: PI, lean: 0.5 }],
       [E.muVase + 2, { face: 'scared', yaw: PI, panic: true }], [E.muVase + 4, { face: 'normal', yaw: PI }], [E.muPaint - 6, { face: 'smug' }], [E.muPaint, { face: 'smug', yaw: PI / 2, hold: true }], [E.muPaint + 1.4, { face: 'scared', yaw: PI / 2 }],
       [E.muPaint + 2, { face: 'smug', yaw: PI / 2 + 0.4, headYaw: 0.6 }], [E.muBye, { face: 'smug' }], [E.muButton, { face: 'normal', yaw: PI }], [E.muButton + 1, { face: 'smug', yaw: PI, hold: Math.floor(t * 1.5) % 2 === 0, lean: 0.15 }],
       [E.muPress, { face: 'scared', yaw: PI, panic: true }], [E.muLocked, { face: 'scared', yaw: PI }], [E.muLocked + 3, { face: 'scared' }], [E.muCreep + 0.6, { face: 'scared', yaw: PI + 0.8, panic: true }], [E.muCreep + 2.4, { face: 'normal', yaw: PI + 0.8 }],
       [E.muSneak, { face: 'normal' }], [E.muSneak + 2, { face: 'normal', yaw: -PI / 2 }], [E.muToe - 2, { face: 'normal' }], [E.muToe, { face: 'scared', yaw: 0.7, wave: true }], [E.muWake, { face: 'scared', yaw: 2.6, panic: true }],
       [E.muChase, { face: 'scared', panic: true }], [136.5, { face: 'scared', yaw: PI / 2, panic: true }], [E.muFetch + 2, { face: 'normal', yaw: PI / 2 }], [E.muThrow, { face: 'smug', yaw: PI + 0.3 }],
       [E.muMess, { face: 'scared', panic: true }], [E.muFix, { face: 'smug' }], [E.muFix + 3, { face: 'smug', yaw: PI / 2, wave: true }], [E.muFix + 9, { face: 'smug' }], [E.muLull, { face: 'smug', yaw: PI - 0.6 }],
       [E.muSnore, { face: 'scared', lean: 0.2 }], [E.muDawn, { face: 'normal', yaw: PI }], [E.muInspect, { face: 'scared' }], [E.muInspect + 4, { face: 'scared', yaw: PI - 0.6 }], [E.muInspect + 11, { face: 'scared', yaw: 2.2 }],
       [E.muInspect + 17, { face: 'scared', yaw: PI + 0.6 }], [E.muStatue, { face: 'normal' }], [E.muAccept, { face: 'smug', yaw: -2.2, wave: true }], [E.muRelief, { face: 'smug' }], [E.muRelief + 4, { face: 'smug', yaw: 0, lean: -0.25 }],
       [E.muSign + 1.2, { face: 'scared', yaw: PI }], [E.muSign + 3, { face: 'scared', yaw: PI + 0.4, panic: true }], [E.muSneeze, { face: 'scared', yaw: PI + 0.4, flat: 1, flatDir: -1 }], [E.muSneeze + 4, { face: 'scared', yaw: PI + 0.4 }],
       [E.muReass + 4.5, { face: 'scared', panic: true }]]);
    if (win(t, E.muSnore, E.muDawn)) { const fz = [E.muSnore, E.muSnore + 4, E.muSnore + 8].some(s => win(t, s, s + 1.2)); if (fz) { hA.walk = 0; hA.panic = true; } else hA.phase *= 0.6; }
    pose(hero, { t, ...hA });
    let cam = camKeys(t, C);
    if (win(t, E.muChase, E.muSmash)) { const hp = hero.root.position; cam = follow([hp.x, hp.y, hp.z], [-3, 3.2, 7], 1.8, 58); }
    return { cam: clampCam26(cam), hud: true };
  }
  return { g, update };
})();
