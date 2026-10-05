// ================================================================ EPISODE 9: "THE RIVAL" — day at the beach plot → neon party night → behind the fake wall → dawn
TX.quartz = ctex(16, (g, r, n) => { noisy(['#f6f4ee', '#ece8de', '#ffffff', '#e4dfd2'])(g, r, n); g.fillStyle = '#d8d0bc'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); }, 91);
TX.goldblk = ctex(16, (g, r, n) => { noisy(['#ffd23f', '#f0c030', '#ffe066', '#e0b020'])(g, r, n); g.fillStyle = '#fff6c0'; g.fillRect(2, 2, 3, 1); g.fillRect(9, 8, 4, 1); }, 92);
MAT.quartz = lam(TX.quartz); MAT.goldblk = lam(TX.goldblk, { emissive: '#a07800', emissiveIntensity: 0.25 });
// --- new character: Prestin Glow, rival YouTuber (perfect hair, white suit, glowing sneakers)
const rivalFace = faceMat('#e8b98a', g => { g.fillStyle = '#111'; g.fillRect(3, 12, 26, 7); g.fillStyle = '#ffffff'; g.fillRect(6, 13, 4, 2); g.fillRect(20, 13, 4, 2); g.fillStyle = '#a0412c'; g.fillRect(12, 24, 11, 2); g.fillRect(21, 22, 2, 2); });
function makeRival() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const leg = x => { const p = pivot(body, x, 0.75, 0); box(0.3, 0.62, 0.3, '#f4f4f4', 0, -0.31, 0, p); box(0.32, 0.16, 0.4, 0, 0, -0.67, 0.04, p, new THREE.MeshBasicMaterial({ color: '#5ff7ff' })); return p; };
  const lL = leg(-0.17), lR = leg(0.17);
  box(0.72, 0.78, 0.42, '#ffffff', 0, 1.14, 0, body); box(0.08, 0.72, 0.02, '#ffd23f', 0, 1.14, 0.22, body); box(0.18, 0.12, 0.02, '#ff5cf0', -0.2, 1.36, 0.22, body);
  const arm = x => { const p = pivot(body, x, 1.45, 0); box(0.24, 0.6, 0.26, '#ffffff', 0, -0.27, 0, p); box(0.22, 0.16, 0.24, '#e8b98a', 0, -0.64, 0, p); return p; };
  const aL = arm(-0.48), aR = arm(0.48);
  const hd = pivot(body, 0, 1.53, 0); const head = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.64), rivalFace); head.position.y = 0.32; head.castShadow = true; hd.add(head);
  const wig = pivot(hd, 0, 0.66, 0); box(0.72, 0.2, 0.72, '#ffe066', 0, 0, 0, wig); const sw = box(0.56, 0.32, 0.62, '#ffd23f', 0.12, 0.2, 0.04, wig); sw.rotation.z = -0.35; const q = box(0.7, 0.18, 0.32, '#fff0a0', 0.04, 0.12, 0.42, wig); q.rotation.x = -0.5;
  const shine = box(0.22, 0.02, 0.22, '#ffffff', 0.1, 0.645, 0.05, hd, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, lL, lR, aL, aR, hd, wig, shine };
}
function poseRival(r, t, p, yaw, o = {}) {
  const walk = o.walk || 0, ph = o.phase || 0, s = Math.sin(ph) * walk; r.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 7)) * 0.4 : 0), p[2]); r.root.rotation.set(0, yaw, 0);
  r.body.position.set(0, Math.abs(Math.cos(ph)) * 0.1 * walk, 0); r.body.rotation.set(0, 0, 0); r.lL.rotation.set(s * 0.9, 0, 0); r.lR.rotation.set(-s * 0.9, 0, 0);
  r.aL.rotation.set(-s * 0.8, 0, 0); r.aR.rotation.set(s * 0.8, 0, 0); r.hd.rotation.set(0, 0, 0);
  if (o.hips) { r.aL.rotation.set(0, 0, 0.9); r.aR.rotation.set(0, 0, -0.9); }
  if (o.flip) { r.aR.rotation.set(-2.7, 0, -0.5); r.hd.rotation.set(0, 0, -0.25 + Math.sin(t * 6) * 0.1); }
  if (o.point) r.aR.rotation.set(-1.5, 0, 0); if (o.hold) { r.aL.rotation.set(-1.2, 0, 0); r.aR.rotation.set(-1.2, 0, 0); }
  if (o.panic) { r.aL.rotation.set(-2.7 + Math.sin(t * 22) * 0.5, 0, -0.3); r.aR.rotation.set(-2.7 + Math.cos(t * 22) * 0.5, 0, 0.3); }
  if (o.cry) { r.body.position.y -= 0.5; r.lL.rotation.x = -1.4; r.lR.rotation.x = -1.4; r.hd.rotation.x = 0.5; r.aL.rotation.set(-2.2, 0, 0.6); r.aR.rotation.set(-2.2, 0, -0.6); r.body.position.y += Math.sin(t * 14) * 0.03; }
  if (o.look) r.hd.rotation.x = o.look;
}
const rival = makeRival(), sled = new THREE.Group(); box(3, 0.5, 1.8, 0, 0, 0, 0, sled, goldM); box(2.6, 0.12, 1.4, 0, 0, -0.3, 0, sled, new THREE.MeshBasicMaterial({ color: '#5ff7ff' })); box(0.2, 0.9, 1.6, 0, -1.4, 0.5, 0, sled, goldM);
const shades = new THREE.Group(); box(0.7, 0.14, 0.06, '#111', 0, 0, 0, shades); hero.hd.add(shades); shades.position.set(0, 0.45, 0.34);
const bow = new THREE.Group(); box(0.5, 0.35, 0.2, '#ff6fb8', -0.3, 0, 0, bow); box(0.5, 0.35, 0.2, '#ff6fb8', 0.3, 0, 0, bow); box(0.2, 0.2, 0.24, '#ff3d9a', 0, 0, 0, bow); L6.hd.add(bow); bow.position.set(0, 0.65, 0.3);
const coins = new THREE.Group(); for (let i = 0; i < 4; i++) box(0.3, 0.06, 0.3, 0, 0, i * 0.07, 0, coins, goldM); bloop6.B.aR.add(coins); coins.position.set(0, -0.68, 0.2);
const viewers = t => t < E.flip + 1 ? 37 : t < E.alone ? 12 : t < E.viral + 1 ? 3 : 2400000, rViewers = t => t < E.viral + 1 ? 2400000 : 5100000;
const fmtV = n => n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : String(n);
function drawRivalCam(T) {
  const on = win(T, E.cam2, E.alone) || win(T, E.party, E.freeze); if (!on) return; const k = Math.min(ss(seg(T, E.cam2, E.cam2 + 0.5)), T > E.alone ? ss(seg(T, E.party, E.party + 0.5)) : 1);
  const x = W - 472 + (1 - k) * 260, y = 16, w = 220, h = 150; const bald = T > E.wigOff + 0.4;
  ctx.save(); ctx.globalAlpha = k; rrect(x, y, w, h, 14); ctx.clip();
  const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#ff7ad9'); gr.addColorStop(1, '#7a3cff'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 10; i++) { const sx = x + ((i * 53 + T * 30) % w), sy = y + ((i * 37) % h); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(sx, sy, 3, 3); }
  const hx = x + w / 2 - 6, hy = y + 92 + Math.sin(T * 2) * 2, s = 88;
  ctx.fillStyle = '#ffffff'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60); ctx.fillStyle = '#ffd23f'; ctx.fillRect(hx - 4, hy + s / 2, 8, 60);
  ctx.fillStyle = '#e8b98a'; ctx.fillRect(hx - s / 2, hy - s / 2, s, s);
  if (!bald) { ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.moveTo(hx - s / 2 - 8, hy - s / 2 + 14); ctx.lineTo(hx - s / 2 + 10, hy - s / 2 - 26); ctx.lineTo(hx + s / 2 + 22, hy - s / 2 - 30); ctx.lineTo(hx + s / 2 + 6, hy - s / 2 + 8); ctx.fill(); ctx.fillStyle = '#fff0a0'; ctx.fillRect(hx - 10, hy - s / 2 - 22, 40, 6); }
  else { ctx.fillStyle = '#ffffff'; ctx.fillRect(hx + 4, hy - s / 2 + 6, 18, 6); }
  ctx.fillStyle = '#111'; ctx.fillRect(hx - s / 2 + 4, hy - 16, s - 8, 22); ctx.fillStyle = '#fff'; ctx.fillRect(hx - 30, hy - 12, 10, 4); ctx.fillRect(hx + 12, hy - 12, 10, 4);
  ctx.fillStyle = '#a0412c'; const sob = win(T, E.cry, E.team); ctx.fillRect(hx - 12, hy + 22 + (sob ? 4 : 0), 26, 4); if (!sob) ctx.fillRect(hx + 10, hy + 18, 4, 4);
  if (sob) { ctx.fillStyle = '#5aa8ff'; ctx.fillRect(hx - 30, hy + 6 + (T * 40) % 20, 5, 9); ctx.fillRect(hx + 24, hy + 6 + (T * 40 + 10) % 20, 5, 9); }
  ctx.restore();
  rrect(x, y, w, h, 14); ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 5; ctx.strokeStyle = '#ffd23f'; ctx.stroke();
  rrect(x + 8, y + h - 30, 132, 22, 11); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); ctx.fillStyle = '#ff2a4a'; ctx.beginPath(); ctx.arc(x + 20, y + h - 19, 5, 0, 7); ctx.fill();
  outlined('GLOWUP ' + fmtV(rViewers(T)), x + 30, y + h - 19, 13, '#ffe066', '#000', 3, 'left');
  const Q = [[20.2, 'Flawless. Obviously.'], [32.8, 'Too easy.'], [57.6, 'Oof. Tragic.'], [68.4, 'Did he... fall in?'], [93.0, 'I pay on time. Every time.'], [104.2, 'Spa day, darling!'], [158.6, "I... can't build. *sob*"], [194.2, 'Flawless. Obviously.'], [221.0, 'MY HAIR!!'], [226.4, 'They like the... real me?'], [272.0, 'Flawless. Obviously.']];
  for (const [s0, txt] of Q) if (win(T, s0, s0 + 3.4)) { const b = ss(seg(T, s0, s0 + 0.2)) * (1 - ss(seg(T, s0 + 3.0, s0 + 3.4))); ctx.globalAlpha = k * b; ctx.font = F(17); const tw = ctx.measureText(txt).width;
    rrect(x + w / 2 - tw / 2 - 12, y + h + 10, tw + 24, 34, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5cf0'; ctx.stroke(); outlined(txt, x + w / 2, y + h + 28, 17, '#7a3cff', '#fff', 2); }
  ctx.restore();
}

// ---------------------------------------------------------------- the one set: beach plot (camp left, Prestin's lot right, sea in front)
const hood = (() => {
  const g = mk('hood'), st = new VSet(g), r = rng(901);
  for (let x = -40; x <= 45; x++) for (let z = -40; z <= 4; z++) st.add(x, 0, z, z > -3 ? 'sand' : (x > 7 && x < 27 && z > -24 ? 'path' : 'turf'));
  const trees = []; for (let i = 0; i < 70; i++) { const x = Math.round((r() - .5) * 84), z = Math.round(-40 + r() * 18); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (x > 4 && x < 30)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (const [x, z] of [[-7, -3], [-6, -3], [-7, -2], [-6, -2]]) st.add(x, 1, z, 'stone');
  st.build(); seaSet(g);
  const tent = pivot(g, -11, 0.5, -7); for (const s of [-1, 1]) { const w = box(0.1, 3.2, 3.6, '#2ec4b6', s * 0.9, 1.3, 0, tent); w.rotation.z = s * 0.55; }
  const fire = pivot(g, -6.5, 1.5, -2.5); box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; box(0.9, 0.2, 0.2, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = -0.6;
  const flame = box(0.5, 0.7, 0.5, 0, 0, 0.5, 0, fire, basic('#ffb43a')); const fl = new THREE.PointLight('#ff8a2a', 6, 10, 1.5); fl.position.set(0, 1.2, 0); fire.add(fl);
  // the fake facade (pivot at its base so it can fall forward toward +z)
  const fac = new THREE.Group(); fac.position.set(16, 0.5, -10); g.add(fac); const fv = new VSet(fac, true); let fi = 0; const fcells = [];
  for (let y = 0; y < 10; y++) for (let x = -8; x <= 8; x++) { if (Math.abs(x) <= 1 && y < 3) continue; const col = Math.abs(x) === 7 || Math.abs(x) === 4, win_ = !col && y % 3 === 1 && y > 2 && Math.abs(x) > 1, top = y === 9;
    fcells.push([x, y, top || col ? 'goldblk' : win_ ? 'glass' : 'quartz']); }
  fcells.sort((a, b) => a[1] - b[1] || Math.abs(a[0]) - Math.abs(b[0])).forEach(c => fv.add(c[0], c[1] + 0.5, 0, c[2], { t0: E.build + 0.3 + (fi++) * (E.buildEnd - E.build - 0.8) / fcells.length })); fv.build();
  const sticks = [-6, 0, 6].map(x => { const b = box(0.3, 7, 0.3, '#8a5a2b', 16 + x, 3.0, -12.4, g); b.rotation.x = 0.55; return b; });
  // the real house the team builds behind it
  const hv = new VSet(g, true); const hc = []; for (let y = 1; y <= 5; y++) for (let x = 11; x <= 21; x++) for (let z = -18; z <= -13; z++) { const edge = x === 11 || x === 21 || z === -18 || z === -13; if (!edge && y < 5) continue; if (y < 5 && z === -13 && x >= 15 && x <= 17 && y <= 2) continue; hc.push([x, y, z, y === 5 ? 'slate' : (y === 3 && (x === 13 || x === 19) ? 'glass' : (y % 2 ? 'brick' : 'plank'))]); }
  hc.sort((a, b) => a[1] - b[1] || a[0] - b[0]).forEach((c, i) => hv.add(c[0], c[1], c[2], c[3], { t0: E.team + 1 + i * (E.teamEnd - E.team - 2.5) / hc.length })); hv.build();
  // hero's doomed build-off tower
  const tv = new VSet(g, true); for (let y = 1; y <= 12; y++) tv.add(1 + (y > 6 ? 1 : 0), y, -6 + (y > 9 ? 1 : 0), y % 2 ? 'plank' : 'log', { t0: E.hbuild + 0.5 + y * 0.75, t1: E.fall, fly: [-2 - y * 0.4, 2, 1 + y * 0.3], spin: [2, 1, 3], floor: 0.5, keep: true, wob: [47.8, E.fall] }); tv.build();
  // party props: pool, DJ booth, string lights, neon
  const pool = box(4, 0.4, 3, 0, 22, 0.75, -3.5, g, MAT.water); for (const [x, z, w, d] of [[22, -5.2, 4.4, 0.4], [22, -1.8, 4.4, 0.4], [19.8, -3.5, 0.4, 3], [24.2, -3.5, 0.4, 3]]) box(w, 0.7, d, 0, x, 0.85, z, g, MAT.quartz);
  box(2.4, 1.1, 1, 0, 10, 1.05, -5, g, MAT.castle); const djl = box(2.2, 0.15, 0.9, 0, 10, 1.7, -5, g, new THREE.MeshBasicMaterial({ color: '#ff5cf0' }));
  const bulbs = []; for (let i = 0; i < 18; i++) bulbs.push(box(0.22, 0.22, 0.22, 0, 8.5 + i * 0.88, 10.6, -9.6, g, new THREE.MeshBasicMaterial({ color: ['#ff5cf0', '#5ff7ff', '#ffe066'][i % 3] })));
  const neonA = new THREE.PointLight('#ff5cf0', 0, 24, 1.2); neonA.position.set(11, 5, -6); const neonB = new THREE.PointLight('#5ff7ff', 0, 24, 1.2); neonB.position.set(21, 5, -6); g.add(neonA, neonB);
  const rocket = box(0.2, 0.6, 0.2, '#e8344e', 0, 0, 0, g);
  // particles
  smoke(0, 300, 0.6, [-6.5, 2.4, -2.5], { n: 2, size: 0.25, life: 2, up: 1.5, grav: -0.6, colors: ['#9a9490', '#c8c2be'] });
  for (let t = E.arrive; t < E.arrive + 3.2; t += 0.1) { const k = seg(t, E.arrive, E.arrive + 3.2); burst(t, [lerp(40, 16, k), 0.6, lerp(2, -4, k)], { n: 4, colors: ['#ffe066', '#5ff7ff', '#ffffff'], speed: 1, size: 0.15, life: 0.8, grav: -1, up: 0.5 }); }
  for (let t = E.build; t < E.buildEnd; t += 0.25) burst(t, [16 + Math.sin(t * 7) * 7, 1 + ((t - E.build) / 6.6) * 9, -9.6], { n: 8, colors: ['#ffe066', '#ffffff', '#ff5cf0'], speed: 3, size: 0.15, life: 0.8, grav: 1, up: 1 });
  burst(E.splash, [0, 0, 7], { n: 140, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 7, size: 0.25, life: 1.4, grav: 10, up: 7 });
  smoke(E.burn, E.burn + 5, 0.07, t => { const hp = hero.root.position; return [hp.x, hp.y + 2.1, hp.z + 0.3]; }, { n: 3, colors: ['#ff6a1a', '#ffd23f', '#555555'], size: 0.14, life: 0.6, up: 2, grav: -2, speed: 0.6 });
  for (let k = 0; k < 3; k++) burst(E.fireworks + 0.3 + k * 1.3, [10 + k * 6, 18 + k, -6], { n: 120, colors: [['#ff5cf0', '#ffffff'], ['#5ff7ff', '#ffffff'], ['#ffe066', '#ff6a1a']][k], speed: 7, size: 0.2, life: 1.8, grav: 2, up: 0 });
  burst(E.hit, [16, 6, -9.8], { n: 160, colors: ['#ff6a1a', '#ffe066', '#ffffff'], speed: 8, size: 0.25, life: 1.2, grav: 4, up: 2 });
  burst(E.flat, [16, 1, -5], { n: 300, colors: ['#f6f4ee', '#ffd23f', '#d8d0bc', '#ffffff'], speed: 12, size: 0.35, life: 2, grav: 8, up: 4 });
  for (let k = 0; k < 8; k++) burst(E.viral + k * 0.7, [16 + Math.sin(k) * 5, 7, -6], { n: 40, colors: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b'], speed: 5, size: 0.16, life: 2, grav: 4, up: 3 });
  // cameras
  const C = [[0, 14, 7, 16, 4, 1, -4, 55], [7.7, 10, 5, 13, 6, 1, -4, 52],
    [13.8, 17.6, 1.5, 1.6, 15.6, 1.9, -4, 48], [20.1, 17.0, 1.5, 1.0, 15.6, 1.9, -4, 48], [20.2, 15, 2.2, -1.4, 16, 2.1, -4, 46], [26.1, 15.5, 2.1, -2.4, 16, 2.1, -4, 38],
    [26.2, 4, 6, 10, 16, 4, -10, 55], [32.7, 6, 6, 11, 16, 4, -10, 55], [32.8, -1, 2, 2.8, -3, 1.9, -1, 46], [38.3, -1.6, 2, 2.4, -3, 1.9, -1, 46],
    [38.4, 6, 3, 6, 6, 1.8, -4, 52], [42.7, 5, 3, 6, 6, 1.8, -4, 52], [42.8, 5, 1, 0, 1.5, 5, -5.5, 52], [47.7, 4.5, 1.2, -0.5, 1.5, 5, -5.5, 52],
    [47.8, -6, 10, 8, 2, 6, -6, 52], [52.5, -4, 10, 9, 2, 6, -6, 52], [52.6, 14.5, 2, -1.6, 16, 2.1, -4, 44], [57.5, 14.8, 2, -1.8, 16, 2.1, -4, 44],
    [57.6, 9, 5, 8, 2, 4, -6, 55], [59.9, 8, 5, 8, 2, 4, -6, 55], [60.0, 0.6, 1.8, 6.5, 0, 1.8, 2.5, 48], [66.1, 0.4, 1.8, 6, 0, 1.8, 2.5, 48],
    [66.2, 7, 2, 5, 0, 1.5, 4.5, 55], [68.7, 6.5, 2, 5.5, 0, 1.5, 4.5, 55], [68.8, 2, 1.5, 10.5, 0, 0, 7, 48], [73.1, 1.6, 1.5, 10.8, 0, 0, 7, 48],
    [73.2, 0.5, 2, 4, -1, 2, 0.5, 44], [78.3, 0, 2, 3.6, -1, 2, 0.5, 44], [78.4, 0.6, 2.3, 3.4, -1, 2.4, 0.5, 42], [86.5, 0.2, 2.3, 3.0, -1, 2.4, 0.5, 42],
    [88.4, 4, 2.2, 1, 8, 1.6, -3, 48], [92.9, 4.5, 2.2, 0.5, 8, 1.6, -3, 48], [93.0, 5.6, 1.8, -0.6, 6.6, 1.4, -3, 44], [98.7, 5.2, 1.8, -0.8, 6.6, 1.4, -3, 44],
    [98.8, -1, 2.6, 1.5, 10, 1.2, -5, 50], [103.9, -0.4, 2.6, 1.8, 10, 1.2, -5, 50], [104.0, 18, 3, 2, 22, 1, -3.5, 50], [112.9, 19, 3, 1.5, 22, 1, -3.5, 50],
    [113.0, -3.6, 1.6, 1.4, -5.6, 1.1, -2, 46], [121.1, -4.2, 1.5, 0.6, -5.6, 1.1, -2, 38], [121.2, -12, 4, 10, 10, 3, -6, 52], [129.3, -10, 4, 10, 10, 3, -6, 52],
    [129.4, 14, 4, 6, 15, 2, -5, 52], [134.3, 17, 4, 6, 15, 2, -5, 52],
    [143.0, 13.5, 2.5, -17.5, 16, 3, -11, 52], [149.5, 14.5, 2.5, -16.5, 16, 3, -11, 52], [149.6, 16.4, 2, -13.4, 19, 2, -13, 44], [154.3, 16.7, 2, -13.6, 19, 2, -13, 44],
    [154.4, 22.0, 2.6, -9.8, 18.2, 1.3, -13.4, 48], [162.1, 21.6, 2.5, -10.2, 18.2, 1.3, -13.4, 48], [162.2, 18, 2.4, -17, 18, 1.6, -13.4, 48], [167.1, 17.4, 2.4, -17.4, 18, 1.6, -13.4, 48],
    [190.0, 16, 3.5, 2, 16, 3, -8, 52], [194.1, 16, 3.3, 1, 16, 3, -8, 52], [194.2, 17.4, 2.2, -5.6, 16.4, 2.1, -8.6, 42], [200.1, 17.2, 2.2, -6, 16.4, 2.1, -8.6, 42],
    [200.2, 14, 1, 0, 16, 14, -8, 58], [208.1, 15, 1, 0.5, 16, 14, -8, 58], [208.2, 30, 6, -2, 16, 4, -8, 56], [212.7, 30, 6, -1, 16, 4, -8, 56],
    [212.8, 16, 2.4, -4.2, 16, 1.8, -8.6, 50], [215.7, 16, 2.6, -4.0, 16, 1.8, -8.6, 50], [215.8, 16, 14, -3, 16, 0.5, -6, 55], [220.7, 16, 12, -2, 16, 0.5, -6, 55],
    [220.8, 18, 2.2, -5.2, 16.4, 2.4, -8.6, 44], [226.1, 18.2, 2.2, -5.6, 16.4, 2.4, -8.6, 44], [226.2, 10, 4, 4, 16, 2, -8, 52], [231.1, 11, 4, 4, 16, 2, -8, 52],
    [231.2, 16, 4, -2, 16, 4, -16, 52], [237.1, 16, 5, -1, 16, 4, -16, 52], [237.2, 23, 3, -9, 16, 3, -15, 50], [241.9, 23.5, 3, -9.5, 16, 3, -15, 50],
    [242.0, 10, 5, 10, 0, 1, -2, 52], [247.5, 9, 4.6, 9, 0, 1, -2, 52], [247.6, 0.3, 2.2, 3.4, 0.3, 1.8, -1.1, 46], [253.1, 0.4, 2.2, 3.0, 0.3, 1.8, -1.1, 46],
    [253.2, 1.5, 1.8, 1.6, 0.3, 1.6, -1.1, 44], [256.9, 1.4, 1.8, 1.4, 0.3, 1.6, -1.1, 44], [257.0, -1.6, 2.2, 1.8, 0.5, 1.5, -2.6, 46], [262.5, -1.8, 2.2, 1.4, 0.5, 1.5, -2.6, 46],
    [262.6, -2, 2, 1, -4.5, 1.5, -3.2, 44], [266.7, -2.4, 2, 0.8, -4.5, 1.5, -3.2, 44], [266.8, 2.8, 2.2, 1.2, 1.6, 2.3, -1.2, 42], [271.9, 2.6, 2.2, 1.0, 1.6, 2.3, -1.2, 42],
    [272.0, 2.4, 1.0, 0.8, 1.6, 2.2, -1.2, 48], [275.9, 2.3, 1.0, 0.6, 1.6, 2.2, -1.2, 48], [276.0, -0.6, 2.0, 2.4, -1, 2.0, -1, 46], [281.9, -0.7, 2.0, 2.1, -1, 2.0, -1, 44],
    [282.0, -2.4, 2.4, 5.6, -2.6, 1.5, -1.6, 48], [E.logo, -2.4, 2.4, 5.2, -2.6, 1.5, -1.6, 48]];
  function update(t) {
    fv.update(t); hv.update(t); tv.update(t); flame.scale.set(1, 1 + Math.sin(t * 13) * 0.2, 1); fl.intensity = 6 + Math.sin(t * 17) * 1.5;
    const night = t > E.night - 3 && t < E.dawn; neonA.intensity = neonB.intensity = night ? 40 + Math.sin(t * 6) * 10 : 0; bulbs.forEach((b, i) => b.visible = t > E.buildEnd && (!night || (Math.floor(t * 3) + i) % 3 !== 0));
    djl.material.color.set(night && Math.floor(t * 4) % 2 ? '#5ff7ff' : '#ff5cf0'); sticks.forEach(s => s.visible = t > E.buildEnd);
    const fk = seg(t, E.topple, E.flat); fac.rotation.x = Math.PI / 2 * 0.98 * fk * fk * fk; hv.meshes.forEach(m => m.visible = t > E.team);
    rocket.visible = win(t, E.fireworks + 3.6, E.hit); if (rocket.visible) { const k = seg(t, E.fireworks + 3.6, E.hit); rocket.position.set(lerp(8, 16, k), lerp(1, 6, k) + Math.sin(k * Math.PI) * 4, lerp(-4, -9.8, k)); rocket.rotation.z = -1.0; }
    rod.visible = false; crownM.visible = false; drill.visible = board.visible = blue.visible = card.visible = bBrick.visible = false; shades.visible = win(t, E.cool, E.burn + 5);
    // sled
    parentTo(sled, g); sled.visible = t > E.arrive - 0.5; const sk = seg(t, E.arrive, E.arrive + 3.2); sled.position.set(lerp(40, 13, sk), 0.9 + Math.sin(t * 3) * 0.08, lerp(2, -3.6, sk)); sled.rotation.y = -0.2;
    // --- hero
    const o = { t, p: [-3, 0.5, -1], yaw: yawXZ([-3, -1], [16, -4]), face: 'normal' };
    if (t < 4) { o.wave = true; o.yaw = 0.3; }
    else if (t < E.challenge) { o.face = t > E.cam2 ? 'scared' : 'normal'; if (t > E.buildEnd) { o.yaw = 0.3; o.hips = true; o.face = 'smug'; } }
    else if (t < E.hbuild) { const w = walker(t, [[E.challenge, -3, 0.5, -1], [E.hbuild - 0.3, 3, 0.5, -5]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; }
    else if (t < E.dance) { o.p = [3, 0.5, -5]; o.yaw = yawXZ([3, -5], [1.5, -6]); if (t < E.hbuildEnd) { o.block = 'plank'; o.swing = (t * 2.4) % 1; } else { o.hips = t < E.fall; o.face = t < E.fall ? 'smug' : 'scared'; o.panic = t > E.fall; } }
    else if (t < E.flip) { const w = walker(t, [[E.dance, 3, 0.5, -5], [E.dance + 2.4, 0, 0.5, 2.5]]); o.p = w.p; o.yaw = w.speed > 0.1 ? w.yaw : 0; o.walk = w.walk; o.phase = w.phase; if (t > E.dance + 2.4) { o.wave = true; o.face = 'smug'; } }
    else if (t < E.splash + 0.6) { const k = seg(t, E.flip, E.splash); o.p = [0, lerp(0.5, -0.8, k) + Math.sin(k * Math.PI) * 3, lerp(2.5, 7, k)]; o.yaw = 0; o.spin = 0; hero.root.rotation.x = 0; o.panic = true; o.face = 'scared'; }
    else if (t < E.cool) { o.p = [0, -1.0 + Math.sin(t * 2) * 0.1, 7]; o.yaw = 0; o.face = 'scared'; }
    else if (t < E.job) { o.p = [-1, 0.5, 0.5]; o.yaw = 0.3; o.face = 'smug'; o.hips = t < E.burn; if (win(t, E.burn, E.burn + 5)) { o.panic = true; o.face = 'scared'; } }
    else if (t < E.alone) { o.p = [2, 0.5, -1]; o.yaw = yawXZ([2, -1], [10, -4]); o.face = 'scared'; }
    else if (t < E.sneak) { o.p = [-5, 0.5, -1]; o.yaw = yawXZ([-5, -1], [-6.5, -2.5]); o.sit = 1; o.face = 'normal'; if (t > E.night) o.yaw = yawXZ([-5, -1], [16, -6]); }
    else if (t < E.peek) { const w = walker(t, [[E.sneak, -5, 0.5, -1], [137, 4, 0.5, 0.5], [140, 27, 0.5, -1], [142, 27, 0.5, -12], [E.peek, 19.5, 0.5, -13]]); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; o.lean = 0.35; }
    else if (t < E.team) { o.p = [19.5, 0.5, -13]; o.yaw = -Math.PI / 2; o.face = t > E.fake ? 'scared' : 'normal'; o.panic = win(t, E.fake, E.fake + 3); if (t > 154) o.yaw = yawXZ([19.5, -13], [17.6, -13.6]); }
    else if (t < E.teamEnd) { const a = (t - E.team) * 0.5; o.p = [16 + Math.cos(a) * 7, 0.5, -15.5 + Math.sin(a) * 4.4]; o.yaw = Math.atan2(-Math.sin(a) * 7, Math.cos(a) * 4.4); o.walk = 1; o.phase = t * 10; o.block = 'brick'; o.swing = (t * 2.4) % 1; }
    else if (t < E.dawn) { o.p = [15.5, 0.5, -8.6]; o.yaw = 0; o.face = t > E.hit ? 'scared' : 'smug'; o.wave = win(t, E.tour, E.tour + 3); if (win(t, E.fireworks, E.hit)) o.headPitch = -0.6; if (win(t, E.flat + 0.4, E.flat + 4)) { o.wave = true; o.face = 'smug'; } if (t > E.viral) { o.wave = true; o.face = 'smug'; } }
    else { o.p = [-1, 0.5, -1]; o.yaw = yawXZ([-1, -1], [1.6, -1.2]); if (win(t, E.shake, E.pay)) { o.p = [-0.2, 0.5, -1.1]; o.hold = true; } if (win(t, E.pay, E.hairflip)) o.face = 'scared'; if (t > 276) { o.yaw = 0.25; o.face = 'smug'; } if (t > 282) o.hips = true; }
    pose(hero, o); parentTo(hero.root, g); if (win(t, E.flip, E.splash)) hero.root.rotation.x = -seg(t, E.flip, E.splash) * Math.PI * 2;
    // --- prestin
    parentTo(rival.root, g); rival.root.visible = t > E.arrive + 3; let rp = [16, 0.5, -4], ry = yawXZ([16, -4], [-3, -1]), ro = {};
    if (t < E.cam2 + 1) { rp = [13, 1.15, -3.6]; ro = { flip: true }; }
    else if (t < E.challenge) { ro = win(t, E.build, E.buildEnd) ? { point: true } : (win(t, E.flawless, E.flawless + 3) ? { flip: true } : { hips: true }); if (win(t, E.build, E.buildEnd)) ry = Math.PI; }
    else if (t < E.job) { ro = win(t, E.fall, E.fall + 3) || win(t, E.splash, E.splash + 3) ? { flip: true } : { hips: true }; }
    else if (t < E.leggyGo) { rp = [8, 0.5, -3]; ry = yawXZ([8, -3], [6.6, -3]); ro = { point: true }; }
    else if (t < E.night) { rp = [20, 0.5, -1.2]; ry = yawXZ([20, -1.2], [22, -3.5]); ro = { hips: true }; }
    else if (t < 154) { rp = [12, 0.5, -3]; ry = 0.4; ro = { hop: true, flip: Math.floor(t) % 4 === 0 }; }
    else if (t < E.team) { const w = walker(t, [[154, 12, 0.5, -3], [156.5, 25, 0.5, -6], [158.2, 18, 0.5, -13.6]]); rp = w.p; ry = w.speed > 0.1 ? w.yaw : Math.PI / 2; ro = t > E.cry ? { cry: true } : { walk: w.walk, phase: w.phase }; }
    else if (t < E.teamEnd) { rp = [12, 0.5, -19.5]; ry = 0.6; ro = { hold: true }; }
    else if (t < E.dawn) { rp = [16.5, 0.5, -8.6]; ry = 0; ro = t < E.fireworks ? (win(t, 194.2, 198) ? { flip: true } : { hips: true }) : (t < E.flat ? { panic: t > E.hit, look: t < E.hit ? -0.6 : 0 } : (t > E.viral ? { hop: true, panic: true } : {})); if (win(t, E.wigOff, E.viral)) ro = { panic: true }; }
    else { rp = [1.6, 0.5, -1.2]; ry = yawXZ([1.6, -1.2], [-1, -1]); if (win(t, E.shake, E.pay)) { rp = [0.9, 0.5, -1.2]; ro = { hold: true }; } if (win(t, E.pay, E.pay + 3)) ro = { point: true }; if (t > E.hairflip) { ry = 0.2; ro = { flip: true }; } }
    poseRival(rival, t, rp, ry, ro);
    const wigGone = t > E.wigOff; rival.shine.visible = wigGone; if (!wigGone) { parentTo(rival.wig, rival.hd); rival.wig.position.set(0, 0.66, 0); rival.wig.rotation.set(0, 0, 0); }
    else if (t < E.dawn) { parentTo(rival.wig, g); const k = seg(t, E.wigOff, E.wigOff + 1.6); rival.wig.position.set(lerp(16.5, 21, k), 2.4 + Math.sin(k * Math.PI) * 4 - k * 1.8, lerp(-8.6, -3.5, k)); rival.wig.rotation.set(k * 7, k * 5, 0); }
    else { parentTo(rival.wig, rival.aL); rival.wig.position.set(0, -0.7, 0.25); rival.wig.rotation.set(0, 0, 0); }
    // --- bloop
    let bp = [-7, 0.5, -0.8], by = yawXZ([-7, -0.8], [16, -4]), bo = {}; bloop6.B.root.visible = true;
    if (win(t, E.job, E.bloopGo)) { const w = walker(t, [[E.job, -7, 0.5, -0.8], [E.coins - 0.5, 6.6, 0.5, -3]]); bp = w.p; by = w.speed > 0.1 ? w.yaw : yawXZ([6.6, -3], [8, -3]); bo = w.speed > 0.1 ? { walk: 1, phase: w.phase } : { handOut: t > E.coins + 1 }; }
    else if (win(t, E.bloopGo, E.night)) { const w = walker(t, [[E.bloopGo, 6.6, 0.5, -3], [E.bloopGo + 3, 11, 0.5, -6.5]]); bp = w.p; by = w.speed > 0.1 ? w.yaw : 0.3; bo = w.speed > 0.1 ? { walk: 1, phase: w.phase } : {}; }
    else if (win(t, E.night, E.team)) { bp = [10.6, 0.5, -3.4]; by = 0.6; bo = { hop: t < E.fake }; if (t > E.fake + 2) { bp = [23, 0.5, -12]; by = -Math.PI / 2; bo = { facepalm: true }; } }
    else if (win(t, E.team, E.teamEnd)) { bp = [16, 0.5, -21]; by = 0; bo = { handOut: true }; bloop6.B.aR.rotation.set(-1.4, Math.sin(t * 4) * 0.7, 0); }
    else if (win(t, E.teamEnd, E.dawn)) { bp = [5, 0.5, -3]; by = 0.8; bo = t > E.viral ? { hop: true } : {}; }
    else if (t >= E.dawn) { bp = [0.5, 0.5, -3.2]; by = 0; bo = t > E.pay ? { handOut: true } : {}; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); if (win(t, E.team, E.teamEnd)) bloop6.B.aR.rotation.set(-1.4, Math.sin(t * 4) * 0.7, 0);
    bHat.visible = true; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0; bHat.position.y = 1.2; coins.visible = win(t, E.coins, E.night) || (t > E.pay + 1.5); card.visible = win(t, E.pay, E.pay + 1.5);
    // --- leggy (+ bow), puff
    let lp = [-9, 0.5, -3.5], ly = 0.8, ls = 0.3;
    if (win(t, E.leggyGo, E.team)) { const w = walker(t, [[E.leggyGo, -9, 0.5, -3.5], [E.leggyGo + 3.4, 22, 0.3, -3.5]]); lp = w.p; ly = w.speed > 0.1 ? w.yaw : -Math.PI / 2 + 0.4; ls = w.speed > 0.1 ? 3 : 0.4; }
    if (win(t, E.team, E.teamEnd)) { const a = (t - E.team) * 0.7 + 2; lp = [16 + Math.cos(a) * 8.5, 0.5, -15.5 + Math.sin(a) * 5.5]; ly = Math.atan2(-Math.sin(a) * 8.5, Math.cos(a) * 5.5); ls = 3; }
    if (win(t, E.teamEnd, E.dawn)) { lp = [27, 0.5, -4]; ly = -1.2; }
    if (t >= E.dawn) { lp = [-4.5, 0.5, -3.4]; ly = 0.8; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0; taxiSign.visible = false; bow.visible = t > E.leggyGo + 3; if (win(t, E.burn, E.burn + 4)) L6.body.rotation.z = Math.sin(t * 20) * 0.1; else L6.body.rotation.z = 0;
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3)), hp = hero.root.position;
    let pp = [-6.5, 1.6, -2.5], py = 0.5; if (win(t, E.sneak, E.team)) { pp = [hp.x, hp.y + 2.2, hp.z]; py = hero.root.rotation.y; } else if (win(t, E.team, E.dawn)) { pp = head; py = ly; }
    puff.root.visible = true; parentTo(puff.root, g); poseMag(puff, t, pp, py, { hop: win(t, E.burn - 0.6, E.burn + 1) || win(t, E.viral, E.viral + 4) });
    // party guests (seals, judge as DJ, goose)
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = t > E.night && t < E.dawn; let sp = [[13, -2], [18, -1.5], [20.5, -6]][i]; if (t > E.hit) { const k = seg(t, E.hit, E.hit + 3); sp = [sp[0] + (i - 1) * 4 * k, sp[1] + 6 * k]; }
      poseSeal(s, t, [sp[0], 0.5, sp[1]], yawXZ(sp, [16, -8]), { hop: t < E.hit || t > E.viral, clap: t > E.viral, seed: i * 3 }); });
    parentTo(judge.root, g); judge.root.visible = t > E.night && t < E.dawn; poseSeal(judge, t, [10, 0.5, -6.2], 0, { hop: true, seed: 5 });
    parentTo(goose.root, g); goose.root.visible = t > E.night && t < E.dawn; goose.root.position.set(t < E.hit ? 14.5 : 9, 0.5, t < E.hit ? -1 : 2); goose.root.rotation.y = 0.3; goose.neck.rotation.x = Math.sin(t * 6) * 0.25;
    golem.root.visible = false; mailBird.root.visible = false; crownProp.visible = false;
    let cam = camKeys(t, C);
    if (win(t, E.arrive, E.cam2)) cam = { p: [8, 2.6, 6], l: [sled.position.x, 1.2, sled.position.z], fov: 50 };
    if (win(t, E.sneak, E.peek)) cam = { p: [hp.x - 3, 2.8, hp.z + 4.5], l: [hp.x, 1.4, hp.z], fov: 50 };
    if (win(t, E.team, E.teamEnd)) { const a = -1.2 + (t - E.team) * 0.11; cam = { p: [16 + Math.sin(a) * 18, 7, -15.5 - Math.cos(a) * 14], l: [16, 2.5, -15.5], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();
