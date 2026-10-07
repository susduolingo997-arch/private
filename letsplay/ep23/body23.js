// ---------------------------------------------------------------- Ep 23 helpers: Crumbs the cake, Judge Brioche, ovens, bake-off props
heroFaces.flour = faceMat('#f6f2ea', g => { g.fillStyle = '#2a1d14'; g.fillRect(8, 14, 4, 5); g.fillRect(20, 14, 4, 5); g.fillStyle = '#c8bfb0'; g.fillRect(12, 24, 8, 2); });
heroFaces.pie = faceMat('#ff9ad0', g => { g.fillStyle = '#ffd6ee'; for (let i = 0; i < 9; i++) g.fillRect((i * 7) % 26 + 2, (i * 11) % 24 + 4, 5, 4); g.fillStyle = '#c86a2a'; g.fillRect(0, 28, 32, 4); });
function hideOld() { [lanternH, meter, sheetB, ribbon, pillow, blueprint.parent].forEach(o => o.visible = false); heroLight.intensity = 0; [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => d.visible = false);
  [twin, third, tock, wagon, wisp, sofie, muffin, puff, bot, train].forEach(o => (o.root || o).visible = false); booth.visible = tarp.visible = false; card.visible = false; flappers.forEach(f => f.root.visible = false); }
const frostM = new THREE.MeshLambertMaterial({ color: '#fff4fa' }), pinkM = new THREE.MeshLambertMaterial({ color: '#ff8fc8' }), creamM = new THREE.MeshLambertMaterial({ color: '#ffe6b0' });
function makeCake() { const root = new THREE.Group(), body = pivot(root, 0, 0.35, 0);
  box(2.0, 0.8, 2.0, 0, 0, 0.4, 0, body, pinkM); box(2.06, 0.12, 2.06, 0, 0, 0.82, 0, body, frostM); box(1.5, 0.7, 1.5, 0, 0, 1.23, 0, body, creamM); box(1.56, 0.12, 1.56, 0, 0, 1.6, 0, body, frostM); box(1.0, 0.55, 1.0, 0, 0, 1.92, 0, body, pinkM); box(1.06, 0.1, 1.06, 0, 0, 2.22, 0, body, frostM);
  for (let i = 0; i < 10; i++) { const a = i / 10 * PI * 2; box(0.16, 0.3 + (i % 3) * 0.1, 0.16, 0, Math.cos(a) * 1.0, 0.68, Math.sin(a) * 1.0, body, frostM); }
  for (let i = 0; i < 5; i++) box(0.14, 0.14, 0.14, ['#e8344e', '#ffd23f', '#5ff7ff', '#7cff6b', '#c08aff'][i], -0.6 + i * 0.3, 2.31, 0.3 - (i % 2) * 0.5, body);
  box(0.12, 0.4, 0.12, '#5ff7ff', 0, 2.48, 0, body); const flame = box(0.12, 0.18, 0.12, 0, 0, 2.78, 0, body, glowY);
  const eyes = [-0.36, 0.36].map(x => { box(0.38, 0.38, 0.06, '#ffffff', x, 1.32, 0.76, body); return box(0.18, 0.2, 0.07, '#2a1030', x, 1.3, 0.79, body); });
  const jaw = pivot(body, 0, 0.62, 1.0); box(1.2, 0.36, 0.06, '#5a1030', 0, -0.18, 0.02, jaw); const teeth = [-0.4, -0.13, 0.13, 0.4].map((x, i) => box(0.2, 0.2, 0.1, ['#e8344e', '#7cff6b', '#ffd23f', '#5ff7ff'][i], x, 0, 0.05, jaw));
  const legs = [-0.5, 0.5].map(x => { const p = pivot(root, x, 0.4, 0); box(0.4, 0.45, 0.5, 0, 0, -0.2, 0.1, p, creamM); return p; });
  const arms = [-1, 1].map(s => { const p = pivot(body, s * 1.05, 1.0, 0); box(0.22, 0.6, 0.22, 0, 0, -0.25, 0, p, frostM); return p; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, eyes, jaw, teeth, legs, arms, flame }; }
function poseCake(c, t, p, yaw, o = {}) { const s = o.size ?? 1, w = o.walk || 0, ph = o.phase ?? t * 8; c.root.scale.setScalar(s); c.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.4 * s : 0), p[2]); c.root.rotation.set(0, yaw, 0);
  c.legs.forEach((l, i) => l.rotation.x = Math.sin(ph + i * PI) * 0.8 * w); c.body.rotation.set(o.cry ? 0.15 : 0, 0, w ? Math.sin(ph) * 0.12 : o.wobble ? Math.sin(t * 30) * 0.08 : 0); c.body.position.y = 0.35 + (w ? Math.abs(Math.cos(ph)) * 0.15 : 0);
  c.jaw.rotation.x = o.chomp ? -Math.abs(Math.sin(t * 10)) * 0.9 : o.roar ? -0.9 : o.cry ? -0.3 : 0; c.eyes.forEach((e, i) => { e.scale.y = o.awake === false ? 0.1 : o.cry ? 0.5 : 1; e.position.x = (i ? 0.36 : -0.36) + (o.look || 0) * 0.08; });
  c.arms.forEach((a, i) => a.rotation.set(o.hold ? -2.8 : o.throw ? -2.8 + seg(o.throw, 0, 1) * 3.4 : o.flail ? -2.4 + Math.sin(t * 14 + i * 2) * 0.6 : Math.sin(t * 3 + i) * 0.2, 0, (i ? 1 : -1) * 0.2)); c.teeth.forEach(q => q.visible = !o.toothless); c.flame.scale.setScalar(1 + Math.sin(t * 20) * 0.2); }
const crumbs = makeCake();
const breadM = new THREE.MeshLambertMaterial({ color: '#d9a35f' });
function makeJudge() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(1.2, 2.0, 0.9, 0, 0, 1.4, 0, body, breadM); box(1.1, 0.3, 0.85, '#b5652e', 0, 2.5, 0, body); for (let i = 0; i < 3; i++) { const b = box(0.7, 0.06, 0.05, '#8a4a1f', 0, 1.0 + i * 0.4, 0.46, body); b.rotation.z = 0.4; }
  for (const x of [-0.25, 0.25]) box(0.2, 0.16, 0.04, '#ffffff', x, 2.05, 0.46, body); const pupils = [-0.25, 0.25].map(x => box(0.09, 0.1, 0.05, '#111', x, 2.05, 0.48, body));
  const mono = pivot(body, 0.25, 2.05, 0.5); box(0.32, 0.04, 0.02, '#ffd23f', 0, 0.15, 0, mono); box(0.32, 0.04, 0.02, '#ffd23f', 0, -0.15, 0, mono); box(0.04, 0.32, 0.02, '#ffd23f', -0.15, 0, 0, mono); box(0.04, 0.32, 0.02, '#ffd23f', 0.15, 0, 0, mono); box(0.02, 0.5, 0.02, '#ffd23f', 0.15, -0.4, 0, mono);
  const mous = pivot(body, 0, 1.82, 0.47); box(0.5, 0.1, 0.05, '#3a2010', 0, 0, 0, mous); for (const s of [-1, 1]) box(0.16, 0.08, 0.05, '#3a2010', s * 0.3, 0.05, 0, mous); const mouth = box(0.2, 0.08, 0.04, '#5a1010', 0, 1.68, 0.46, body);
  const hat = pivot(body, 0, 2.65, 0); box(0.9, 0.5, 0.7, '#ffffff', 0, 0.25, 0, hat); box(1.1, 0.35, 0.9, '#ffffff', 0, 0.65, 0, hat);
  const aL = pivot(body, -0.7, 1.9, 0), aR = pivot(body, 0.7, 1.9, 0); box(0.24, 0.8, 0.24, 0, 0, -0.35, 0, aL, breadM); box(0.24, 0.8, 0.24, 0, 0, -0.35, 0, aR, breadM);
  const lL = pivot(root, -0.3, 0.4, 0), lR = pivot(root, 0.3, 0.4, 0); box(0.3, 0.4, 0.3, '#5a3a22', 0, -0.2, 0, lL); box(0.3, 0.4, 0.3, '#5a3a22', 0, -0.2, 0, lR);
  const camBox = pivot(aR, 0, -0.8, 0.2); box(0.5, 0.35, 0.3, '#222', 0, 0, 0, camBox); box(0.18, 0.18, 0.12, '#5ff7ff', 0, 0, 0.18, camBox); const bell = pivot(aL, 0, -0.8, 0.1); box(0.36, 0.3, 0.36, '#ffd23f', 0, 0, 0, bell); box(0.1, 0.25, 0.1, '#8a5a2b', 0, 0.25, 0, bell);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, pupils, mono, mous, mouth, aL, aR, lL, lR, camBox, bell }; }
function poseJudge(j, t, p, yaw, o = {}) { const w = o.walk || 0, ph = o.phase ?? t * 7; j.root.position.set(p[0], p[1], p[2]); j.root.rotation.set(0, yaw, 0); j.body.rotation.set(o.faint ? -PI / 2 * o.faint : 0, 0, 0); j.body.position.y = o.faint ? o.faint * 0.4 : Math.abs(Math.cos(ph)) * 0.08 * w;
  j.lL.rotation.x = Math.sin(ph) * 0.7 * w; j.lR.rotation.x = -Math.sin(ph) * 0.7 * w; j.aL.rotation.set(o.ring ? -2.4 + Math.sin(t * 24) * 0.3 : o.bite ? -2.0 : 0, 0, -0.1); j.aR.rotation.set(o.award ? -1.6 : o.photo ? -1.5 : o.point ? -1.4 : 0, 0, 0.1);
  j.mono.position.z = o.squint ? 0.56 : 0.5; j.mous.rotation.z = Math.sin(t * (o.talk ? 14 : 1)) * (o.talk ? 0.15 : 0.03); j.mouth.scale.y = o.bite ? 3 : o.talk ? 1 + Math.abs(Math.sin(t * 12)) * 2 : 1; j.camBox.visible = !!o.photo; j.bell.visible = !!o.ring; }
const judge23 = makeJudge();
function makeOven(turbo) { const g = new THREE.Group(), s = turbo ? 1.35 : 1; box(1.4 * s, 1.2 * s, 1.1 * s, '#4a4a54', 0, 0.6 * s, 0, g); const win_ = box(0.9 * s, 0.6 * s, 0.04, 0, 0, 0.6 * s, 0.56 * s, g, new THREE.MeshLambertMaterial({ color: '#ff9a40', emissive: '#ff6a1a', emissiveIntensity: 0.6 }));
  box(1.2 * s, 0.12 * s, 0.08, '#c0c0c8', 0, 1.05 * s, 0.56 * s, g); for (let i = 0; i < 3; i++) box(0.12, 0.12, 0.06, ['#e8344e', '#ffd23f', '#7cff6b'][i], (-0.3 + i * 0.3) * s, 1.05 * s, 0.6 * s, g); if (turbo) { box(0.3, 0.8, 0.3, '#4a4a54', 0.5, 1.9, -0.3, g); box(0.6, 0.2, 0.3, '#ff3d7f', 0, 1.7, 0.4, g); }
  const door = pivot(g, 0, 0.1 * s, 0.6 * s); box(1.3 * s, 0.9 * s, 0.06, '#5a5a64', 0, 0.45 * s, 0, door); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, win: win_, door }; }
const whisk = new THREE.Group(); box(0.08, 0.08, 0.5, '#c0c0c8', 0, 0, 0.25, whisk); for (let i = 0; i < 4; i++) { const b = box(0.04, 0.3, 0.3, '#e0e0e8', 0, 0, 0.65, whisk); b.rotation.z = i * PI / 4; } hero.aR.add(whisk); whisk.position.set(0, -0.66, 0.05);
const fork = new THREE.Group(); box(0.05, 0.05, 0.5, '#c0c0c8', 0, 0, 0.25, fork); for (let i = 0; i < 3; i++) box(0.03, 0.03, 0.18, '#c0c0c8', -0.06 + i * 0.06, 0, 0.58, fork); hero.aR.add(fork); fork.position.set(0, -0.66, 0.05);
const shardJar = new THREE.Group(); box(0.3, 0.4, 0.3, 0, 0, 0, 0, shardJar, MAT.glass); box(0.22, 0.24, 0.22, 0, 0, -0.05, 0, shardJar, MAT.shard); hero.aL.add(shardJar); shardJar.position.set(0, -0.8, 0.15);
const bowl = new THREE.Group(); box(0.6, 0.3, 0.6, '#5ab0d0', 0, 0, 0, bowl); box(0.5, 0.06, 0.5, '#ffe6b0', 0, 0.14, 0, bowl); hero.aL.add(bowl); bowl.position.set(0, -0.8, 0.3);
const goldWhisk = new THREE.Group(); box(0.12, 0.12, 0.7, 0, 0, 0, 0.3, goldWhisk, goldM); for (let i = 0; i < 4; i++) { const b = box(0.06, 0.4, 0.4, 0, 0, 0, 0.85, goldWhisk, goldM); b.rotation.z = i * PI / 4; }
const brickCake = new THREE.Group(); box(1.0, 0.8, 0.8, 0, 0, 0.4, 0, brickCake, MAT.brick); box(1.04, 0.1, 0.84, '#fff4fa', 0, 0.84, 0, brickCake); box(0.1, 0.3, 0.1, '#e8344e', 0, 1.05, 0, brickCake);
const pie = new THREE.Group(); box(0.9, 0.2, 0.9, '#d9a35f', 0, 0, 0, pie); box(0.8, 0.08, 0.8, '#ff8fc8', 0, 0.12, 0, pie); box(0.16, 0.12, 0.16, '#e8344e', 0, 0.2, 0, pie);
const egg = box(0.22, 0.28, 0.22, '#fff8e8', 0, 0, 0, new THREE.Group()); const yolk = box(0.5, 0.06, 0.5, '#ffd23f', 0, 0.62, 0.1, L6.hd);
const envelope = box(0.7, 0.45, 0.06, '#fff3cf', 0, 0.7, 0.4, L6.hd); box(0.2, 0.2, 0.07, '#e8344e', 0, 0, 0.01, envelope);
// HUD: cake size + bake timer; the letter
const sizeAt = t => t < E.reveal ? 1 : t < E.chomp1 ? 1.5 : t < E.chomp2 ? lerp(1.5, 2.2, seg(t, E.chomp1, E.chomp1 + 1)) : t < E.burst ? lerp(2.2, 3, seg(t, E.chomp2, E.chomp2 + 1)) : t < E.leggyBite ? lerp(3, 3.3, seg(t, E.burst, E.burst + 1)) : t < E.feast ? 3.0 : t < E.crunch ? lerp(3.0, 2.4, seg(t, E.feast, E.fights)) : t < E.shrink ? 2.4 : lerp(2.4, 0.55, ss(seg(t, E.shrink, E.shrink + 8)));
function drawCake(t) { if (t >= E.freeze || t < E.bake) return; const bt = t < E.ding; if (bt) { rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(60,20,30,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke(); outlined('BAKE TIMER', 132, 114, 15, '#ffd23f', '#000', 3);
    const r = Math.max(0, E.ding - t) * 20, m = Math.floor(r / 60), sc = Math.floor(r % 60); outlined(m + ':' + String(sc).padStart(2, '0'), 132, 152, 34, r < 60 ? '#ff6b6b' : '#ffffff', '#000', 5); return; }
  if (t < E.reveal) return; const s = sizeAt(t); rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(60,20,40,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff8fc8'; ctx.stroke(); outlined('CAKE SIZE', 132, 114, 15, '#ff8fc8', '#000', 3);
  outlined('x' + (s * s * s).toFixed(s < 1 ? 2 : 0), 132, 148, 32, s > 2.5 ? (Math.floor(t * 6) % 2 ? '#ff3d7f' : '#ffe066') : '#ffffff', '#000', 5); outlined(s > 3.5 ? 'DANGER: DELICIOUS' : s < 1 ? 'baby cake' : 'still growing', 132, 174, 13, '#fff', '#000', 3); }
function drawLetter(T) { const k = ss(seg(T, E.letter + 1, E.letter + 1.4)) * (1 - ss(seg(T, E.sugar - 0.6, E.sugar - 0.2))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 60); ctx.rotate(0.04); ctx.fillStyle = '#fff3cf'; ctx.fillRect(-220, -190, 440, 360); ctx.fillStyle = '#e8344e'; ctx.fillRect(-220, -190, 440, 16);
  outlined('THE GRAND', 0, -140, 26, '#7a1a2a', '#fff3cf', 2); outlined('CRUMBLETON BAKE-OFF', 0, -100, 32, '#c0182a', '#fff3cf', 3); if (T > E.letter + 2.4) { outlined('PRIZE: THE GOLDEN WHISK', 0, -40, 24, '#8a5a00', '#fff3cf', 2); ctx.fillStyle = '#ffd23f'; ctx.fillRect(-20, -10, 40, 70); ctx.fillRect(-50, 60, 100, 14); }
  if (T > E.letter + 4) outlined('Judge: Brioche (very strict)', 0, 110, 20, '#3a2410', '#fff3cf', 2); if (T > E.letter + 5.2) outlined('no magic ingredients!!', 0, 146, 18, '#c0182a', '#fff3cf', 2); ctx.restore(); }

// ================================================================ EPISODE 23: "THE BAKE-OFF (the cake fights back)" — the yard (Turbo-Oven, flour, the letter, shard sugar) → the bake-off tent (Judge Brioche; the cake wakes up) → Crumbleton square at sunset (rampage; Bloop's brick cake; the pie)
// ---------------------------------------------------------------- set A: the yard (morning)
const yard = (() => {
  const g = mk('yard'); field(g, false); const hg = new THREE.Group(); g.add(hg); { const st = new VSet(hg); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(hg); }
  const ov = makeOven(true); g.add(ov.g); ov.g.position.set(3.4, 0.5, 3.4); ov.g.rotation.y = -0.6;
  burst(E.poof, [3.4, 1.6, 3.6], { n: 220, colors: ['#ffffff', '#f6f2ea', '#e8e0d0'], speed: 7, size: 0.3, life: 2.4, grav: 1, up: 3 }); burst(E.sugar + 1, [0, 1.8, 1.6], { n: 60, colors: ['#5ff7ff', '#ffffff', '#ff5cf0'], speed: 3, size: 0.12, life: 1.2, grav: 1, up: 2 });
  for (let t = E.ovenB; t < E.mix; t += 0.5) burst(t, [3.4, 1.6, 3.4], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  const C = [[0, 0, 3, 10, 0, 1.6, 0, 50], [4.9, 1, 2.6, 8, 0, 1.6, 0.5, 46], [5, 9, 3.2, 8, 3.4, 1.2, 3.4, 46], [10.9, 8, 3, 9, 3.4, 1.2, 3.4, 44], [11, -1.6, 2, 4.6, 0, 1.4, 1.2, 42], [15.9, -1.2, 2, 4.2, 0, 1.4, 1.2, 40], [16, 0, 2.6, 9, 2, 1.2, 2.6, 48], [19.9, 0.6, 2.6, 8.6, 2.4, 1.2, 2.8, 46],
    [20, -2, 4, 11, 2, 1.2, 2.6, 54], [25.9, -1.6, 3.6, 10, 2, 1.2, 2.6, 50], [26, -6, 2.4, 7, -2, 1, 2, 48], [33.9, -4, 2.4, 6.6, -1, 1.2, 1.6, 44], [34, 1.4, 2.0, 4.6, 0, 1.8, 1.2, 40], [37.9, 1.2, 2.0, 4.2, 0, 1.8, 1.2, 38], [38, 5, 3, 6, 0, 1.4, 6, 50], [E.tent, 5, 3, 22, 0, 1.4, 20, 52]];
  function update(t) {
    hideMisc(); hideOld(); [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g)); [crumbs.root, judge23.root, duke, ...lumpy, ...fans].forEach(o => (o.root || o).visible = false);
    whisk.visible = fork.visible = false; bowl.visible = win(t, E.mix, E.test); shardJar.visible = win(t, E.sugar, E.tent); yolk.visible = false; envelope.visible = win(t, E.letter - 4, E.letter + 1);
    ov.g.position.x = 3.4 + (win(t, E.test + 1, E.poof) ? Math.sin(t * 50) * 0.06 : 0); ov.door.rotation.x = win(t, E.poof, E.poof + 3) ? 1.2 : 0; ov.g.scale.setScalar(t < E.ovenB ? 0.001 : Math.min(1, backOut(seg(t, E.ovenB, E.ovenB + 1.2))));
    const fl = t > E.poof ? 'flour' : null;
    const ha = act(t, [[0, 0, 0.5, 1.2], [E.test - 1, 0, 0.5, 1.2], [E.test, 2.0, 0.5, 2.4], [E.poof - 1, 2.0, 0.5, 2.4], [E.poof, 0.4, 0.5, 1.0], [E.walk, 0.4, 0.5, 1.0], [E.tent, 0, 0.5, 21]],
      [[0, { yaw: 0, face: 'smug', wave: t < 4 }], [E.ovenB, { yaw: 1.0, face: 'smug' }], [E.mix, { yaw: 0.4, face: 'smug', swing: t * 3 }], [E.test, { yaw: faceTo([2, 0, 2.4], [3.4, 0, 3.4]), face: 'smug', hold: true }], [E.poof, { yaw: 0.6, face: 'flour', flat: 1, flatDir: -1 }], [E.poof + 3, { yaw: 0.6, face: 'flour' }], [E.letter, { yaw: -1.2, face: 'flour', headPitch: 0.2 }], [E.sugar, { yaw: 0, face: 'flour', hips: false }], [E.walk, { face: 'flour' }]]);
    pose(hero, { t, ...ha });
    const ba = act(t, [[0, 4.6, 0.5, 1.2], [E.walk + 0.4, 4.6, 0.5, 1.2], [E.tent, 1.4, 0.5, 19]], [[0, { yaw: -1 }], [E.ovenB, { yaw: faceTo([4.6, 0, 1.2], [3.4, 0, 3.4]), hop: true }], [E.mix, { yaw: -1.2 }], [E.poof, { yaw: -1.2, angry: true }], [E.poof + 3, { yaw: -1.2, facepalm: true }], [E.letter, { yaw: -1.6 }], [E.walk + 0.4, {}]]);
    poseBurble(bloop6, t, ba.p, ba.yaw, ba); bHat.visible = true; bHat.position.y = 1.2;
    const la = act(t, [[0, -5, 0.5, -0.5], [E.letter - 5, -5, 0.5, -0.5], [E.letter - 4.9, -12, 0.5, 6], [E.letter, -2.6, 0.5, 0.4], [E.letter + 6, -2.6, 0.5, 0.4], [E.letter + 7.4, -4.6, 0.5, -0.6], [E.walk + 0.2, -4.6, 0.5, -0.6], [E.tent, -1.4, 0.5, 20]], [[0, { yaw: 0.6 }], [E.letter - 4.9, {}], [E.letter, { yaw: 1.2 }], [E.letter + 6, {}], [E.letter + 7.4, { yaw: 0.6 }], [E.walk + 0.2, {}]]);
    poseLurk(L6, t, la.p, la.yaw, la.walk ? 1.4 : 0.3);
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the bake-off tent (warm, striped; four stations; the stage)
const ST = [-9, -3, 3, 9];
const tent = (() => {
  const g = mk('tent'); const st = new VSet(g);
  for (let x = -30; x <= 30; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, Math.abs(x) <= 14 && Math.abs(z) <= 12 ? 'plank' : 'turf');
  for (let y = 1; y <= 7; y++) for (let x = -14; x <= 14; x++) for (let z = -12; z <= 12; z++) { if (Math.abs(x) < 14 && Math.abs(z) < 12) continue; st.add(x, y, z, (x + z + 100) % 4 < 2 ? 'jam' : 'quartz'); }
  for (const c of ST) { for (let x = c - 1; x <= c + 1; x++) st.add(x, 1, -2, 'quartz'); }
  for (let x = -3; x <= 3; x++) for (let z = 6; z <= 8; z++) st.add(x, 1, z, 'castle'); for (const s of [-1, 1]) for (let z = 1; z <= 8; z += 1) st.add(s * 12, 1, z, 'log');
  st.build();
  const roofG = new THREE.Group(); g.add(roofG); const roofVS = new VSet(roofG, true); { const r = rng(2301); for (let k = 0; k < 6; k++) for (let x = -14 + k * 2; x <= 14 - k * 2; x++) for (let z = -12 + k * 2; z <= 12 - k * 2; z++) { if (k < 5 && Math.abs(x) < 14 - k * 2 && Math.abs(z) < 12 - k * 2) continue; const near = Math.hypot(x, z - 2) < 7;
    roofVS.add(x, 8 + k, z, (x + z + 100) % 4 < 2 ? 'jam' : 'quartz', near ? { t1: E.burst + r() * 0.3, fly: [(r() - 0.5) * 12, 6 + r() * 8, (r() - 0.5) * 12], spin: [r() * 6, r() * 6, r() * 6] } : {}); } roofVS.build(); }
  const ovens = ST.map((c, i) => { const o = makeOven(false); g.add(o.g); o.g.position.set(c + 2.2, 0.5, -2.2); return o; });
  const lamp = new THREE.PointLight('#ffd8a0', 50, 40, 1.2); lamp.position.set(0, 7, 0); g.add(lamp);
  const pillowCake = new THREE.Group(); box(1.0, 0.5, 1.0, '#ff9ad0', 0, 0, 0, pillowCake); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.1, 0.2, 0.1, '#ffd23f', x * 0.5, 0.2, z * 0.5, pillowCake); g.add(pillowCake);
  const lumpCake = new THREE.Group(); box(0.8, 0.5, 0.8, '#5ad1c8', 0, 0, 0, lumpCake); box(0.84, 0.08, 0.84, '#ffffff', 0, 0.28, 0, lumpCake); g.add(lumpCake);
  burst(E.sugar2, [-9, 2.2, -2], { n: 90, colors: ['#5ff7ff', '#ff5cf0', '#ffffff'], speed: 4, size: 0.14, life: 1.4, grav: 1, up: 3 }); burst(E.reveal, [-9, 1.6, -1], { n: 90, colors: ['#ff8fc8', '#ffffff', '#5ff7ff'], speed: 5, size: 0.16, life: 1.2, grav: 3, up: 3 });
  burst(E.chomp1 + 0.6, [3, 2, -1.6], { n: 50, colors: ['#ff9ad0', '#ffffff'], speed: 4, size: 0.14, life: 1, grav: 6, up: 3 }); burst(E.chomp2 + 0.6, [9, 2, -1.6], { n: 50, colors: ['#5ad1c8', '#ffffff'], speed: 4, size: 0.14, life: 1, grav: 6, up: 3 });
  burst(E.judgeBrick + 2, [-3, 2.6, 0.4], { n: 40, colors: ['#b5652e', '#ffffff'], speed: 4, size: 0.12, life: 0.8, grav: 8, up: 3 }); for (let t = E.glow; t < E.ding; t += 0.4) burst(t, [-6.8, 2.2, -2], { n: 4, colors: ['#c08aff', '#5ff7ff'], speed: 1.4, size: 0.14, life: 1, grav: -1.5, up: 1 });
  const C = [[E.tent, 0, 6, 10.6, 0, 1.6, -2, 58], [46.9, 6, 5.4, 10, 0, 1.6, -2, 56], [47, 0, 2.6, 2.4, 0, 3.2, 7, 44], [52.9, 0.6, 2.6, 2.8, 0, 3.2, 7, 42], [53, 7, 4, 6, 0, 1.6, -2, 52], [57.9, 5, 4, 6.4, 0, 1.6, -2, 50],
    [58, -3, 3.2, 6, -3, 1.6, -2, 50], [61.9, -6, 3.2, 6, -6, 1.6, -2, 50], [62, -11, 2.4, 2.6, -9.4, 2, -2.6, 44], [65.9, -10.6, 2.4, 2.2, -9.4, 2, -2.6, 42], [66, -3, 2.2, 1.8, -3, 1.8, -2.6, 40], [69.9, -2.6, 2.2, 1.6, -3, 1.8, -2.6, 38], [70, 3, 2.2, 1.8, 3, 1.8, -2.6, 40], [75.9, 3.4, 2.2, 1.6, 3, 1.8, -2.6, 38],
    [76, -9, 2.6, 2.4, -9, 1.8, -2, 40], [79.9, -8.6, 2.4, 2.0, -9, 1.8, -2, 36], [80, -5, 2.6, 4, -7, 1.4, -2.2, 44], [85.9, -5.4, 2.4, 3.6, -7, 1.4, -2.2, 42], [86, -5.4, 2, 1.4, -6.8, 1.0, -2.2, 44], [91.9, -5.6, 2, 1.0, -6.8, 1.0, -2.2, 40],
    [92, 6.4, 4.2, 1.6, 3, 1.6, -2, 46], [99.9, 6.8, 4.2, 2.0, 3, 1.6, -2, 44], [100, 5, 4, 2.6, 9, 1.8, -1, 46], [103.9, 5.4, 4, 2.8, 9, 1.8, -1, 44], [104, -6, 3.8, 1.2, -3, 2, -1.6, 46], [111.9, -6.4, 3.8, 1.6, -3, 2, -1.6, 42],
    [112, -9, 3.4, 9, -9, 2.2, -1, 50], [115.9, -9, 3.2, 8.4, -9, 2.2, -1, 48], [116, -9, 2.8, 6.4, -9, 2.4, -0.4, 44], [120.9, -9, 2.8, 6.0, -9, 2.4, -0.4, 42], [121, 0, 5, 9, 2, 1.8, -1, 54], [127.9, 4, 5, 9, 6, 2, -1, 52],
    [128, 0, 6, 11, 0, 2.4, 0, 56], [132.9, -3, 6, 11, 0, 2.4, 0, 56], [133, 0, 1.4, 12, 0, 6, 0, 62], [E.square, 0, 1.4, 12, 0, 10, 0, 62]];
  function update(t) {
    hideMisc(); hideOld(); [hero.root, bloop6.B.root, L6.root, crumbs.root, judge23.root].forEach(o => parentTo(o, g)); envelope.visible = false; bowl.visible = win(t, E.bake, E.sugar2); shardJar.visible = win(t, E.sugar2 - 1, E.ovenIn); whisk.visible = fork.visible = false;
    roofVS.update(t); goldWhisk.visible = false; brickCake.visible = true; parentTo(brickCake, g); pie.visible = false;
    ovens.forEach((o, i) => { const hot = i === 0 && win(t, E.glow, E.reveal); o.win.material.emissive.set(hot ? '#c040ff' : '#ff6a1a'); o.win.material.emissiveIntensity = hot ? 1 + Math.sin(t * 20) * 0.5 : 0.5; o.g.position.x = ST[i] + 2.2 + (hot ? Math.sin(t * 50) * 0.05 * seg(t, E.glow, E.ding) : 0); o.door.rotation.x = i === 0 && t > E.reveal - 0.5 ? 1.3 : 0; });
    // cakes on the counters
    pillowCake.visible = t > E.pillow && t < E.chomp1 + 0.6; pillowCake.position.set(3, 1.75, -2); lumpCake.visible = t > E.pillow && t < E.chomp2 + 0.6; lumpCake.position.set(9, 1.75, -2);
    brickCake.visible = t > E.brick; brickCake.position.set(-3, 1.5, -2); brickCake.scale.setScalar(Math.min(1, seg(t, E.brick, E.brick + 3) * 1.2));
    // Crumbs wakes up and eats the competition
    const cs = sizeAt(t); crumbs.root.visible = t > E.reveal - 0.3; let cp = [-9, 0.5, -0.2], cy = 0, co = { size: cs, awake: t > E.alive, look: win(t, E.alive, E.chomp1 - 3) ? Math.sin(t * 3) : 0 };
    if (t > E.chomp1 - 3) { const a = walker(t, [[E.chomp1 - 3, -9, 0.5, -0.2], [E.chomp1, 3, 0.5, 0.4], [E.chomp2 - 2, 3, 0.5, 0.4], [E.chomp2, 9, 0.5, 0.4], [E.panic, 9, 0.5, 0.4], [E.burst - 1, 0, 0.5, 2]]); cp = a.p; cy = a.walk > 0.05 ? a.yaw : PI; co.walk = a.walk > 0.05 ? 1 : 0; co.phase = a.phase * 2; co.chomp = win(t, E.chomp1, E.chomp1 + 2) || win(t, E.chomp2, E.chomp2 + 2); co.roar = win(t, E.panic, E.panic + 2); }
    if (t > E.burst - 1) { const k = seg(t, E.burst - 0.2, E.burst + 2.5); cp = [0, 0.5 + k * k * 16, 2]; cy = 0; co.roar = true; }
    if (t > E.reveal - 0.3 && t < E.reveal + 1) { cp = L3([-8.4, 1.0, -2.2], [-9, 0.5, -0.2], seg(t, E.reveal - 0.3, E.reveal + 0.6)); co.hop = true; }
    poseCake(crumbs, t, cp, cy, co);
    // the bakers
    const scared = t > E.alive; const station = (i, o) => ({ p: [ST[i], 0.5, -3.4], yaw: 0, face: 'smug', ...o });
    let H_ = station(0, { swing: win(t, E.bake, E.egg) ? t * 3 : undefined, hold: win(t, E.sugar2, E.ovenIn + 1) });
    if (win(t, E.egg, E.egg + 3)) H_ = station(0, { wave: true, face: 'scared' }); if (t > E.ovenIn) H_ = station(0, { p: [-7.6, 0.5, -3.2], yaw: 0.6, face: 'smug', hips: t > E.ovenIn + 2 });
    if (t > E.judging) H_ = station(0, { face: 'normal', headYaw: -0.6 }); if (t > E.reveal - 1.4) H_ = { p: [-8, 0.5, -0.6], yaw: -0.8, face: t > E.alive ? 'scared' : 'smug', hold: t < E.reveal };
    if (t > E.panic) { const a = walker(t, [[E.panic, -8, 0.5, -0.6], [E.burst, -12, 0.5, 6]]); H_ = { p: a.p, yaw: a.yaw, walk: a.walk ? 1 : 0, phase: a.phase * 2, face: 'scared', panic: true }; }
    if (win(t, E.tent, E.bake)) H_ = { ...act(t, [[E.tent, 0, 0.5, 14], [E.tent + 5, -9, 0.5, -3.4]], [[0, { face: 'smug' }], [E.tent + 5, { yaw: 0, face: 'smug' }]]) };
    pose(hero, { t, ...H_ });
    let bo = { hop: win(t, E.brick, E.brick + 4) }, bp = [-3, 0.5, -3.4], by = 0; if (win(t, E.judgeBrick, E.reveal)) bo = { facepalm: t > E.judgeBrick + 3 }; if (t > E.panic) { const a = walker(t, [[E.panic, -3, 0.5, -3.4], [E.burst, -6, 0.5, 8]]); bp = a.p; by = a.yaw; bo = { angry: true, walk: 1, phase: t * 9 }; }
    if (win(t, E.tent, E.bake)) { const a = walker(t, [[E.tent, 1.4, 0.5, 15], [E.tent + 5.6, -3, 0.5, -3.4]]); bp = a.p; by = a.walk > 0.05 ? a.yaw : 0; bo = { walk: a.walk > 0.05 ? 1 : 0, phase: a.phase * 2 }; }
    poseBurble(bloop6, t, bp, by, bo); bHat.visible = true; bHat.position.y = 1.2;
    // Leggy: taste tester (gets egged)
    yolk.visible = win(t, E.egg + 1, E.judging); parentTo(egg.parent, g); egg.parent.visible = win(t, E.egg, E.egg + 1); if (egg.parent.visible) { const k = seg(t, E.egg, E.egg + 1); egg.parent.position.set(lerp(-9, -1, k), 2.2 + Math.sin(k * PI) * 2.4, lerp(-3, 3.2, k)); egg.parent.rotation.set(t * 8, 0, t * 5); }
    const la = act(t, [[E.tent, -1.4, 0.5, 15], [E.tent + 6, -1, 0.5, 3.4], [E.judging, -1, 0.5, 3.4], [E.judging + 2, -6, 0.5, 4], [E.panic, -6, 0.5, 4], [E.burst, 6, 0.5, 8]], [[0, {}], [E.tent + 6, { yaw: PI }], [E.judging, {}], [E.judging + 2, { yaw: PI }], [E.panic, {}]]);
    poseLurk(L6, t, la.p, la.yaw, la.walk ? 1.4 : win(t, E.egg + 1, E.egg + 3) ? 2 : 0.3);
    // Duke + Team Lumpy at their stations; fans on the benches
    [duke, ...lumpy, ...fans].forEach((c, i) => { c.root.visible = true; parentTo(c.root, g); let p, y = 0, o = { seed: i, hop: win(t, E.pillow, E.pillow + 3) && i === 0 };
      if (i === 0) p = [3, 0.5, -3.4]; else if (i < 4) p = [8 + (i - 1) * 1.0, 0.5, -3.6 - (i % 2) * 0.4]; else { const j = i - 4; p = [j < 4 ? -12 : 12, 1.0, 1.4 + (j % 4) * 1.8]; y = j < 4 ? PI / 2 : -PI / 2; o = { seed: i, hop: win(t, E.reveal, E.alive) || win(t, E.judgeDuke, E.judgeDuke + 3) }; }
      if (i < 4 && win(t, E.judging, E.panic)) o.sleep = i > 0 && win(t, E.judgeLump, E.chomp2); if (t > E.panic) { const r = rng(2310 + i); const k = seg(t, E.panic, E.panic + 4); p = L3(p, [(r() - 0.5) * 24, 0.5, 11], k); y = 0; o = { seed: i, hop: true, wave: true }; }
      poseCushion(c, t, p, y, o); });
    // Judge Brioche
    let jp = [0, 1.5, 7], jy = PI, jo = { talk: win(t, E.judgeIn, E.rules + 5), ring: win(t, E.bake - 0.4, E.bake + 1.2) };
    if (t > E.judging) { const a = walker(t, [[E.judging, 0, 1.5, 7], [E.judging + 1.6, 3, 0.5, 0.4], [E.judgeLump - 0.6, 3, 0.5, 0.4], [E.judgeLump, 9, 0.5, 0.4], [E.judgeBrick - 1, 9, 0.5, 0.4], [E.judgeBrick, -3, 0.5, 0.4], [E.reveal - 1, -3, 0.5, 0.4], [E.reveal, -6.4, 0.5, 1.0]]); jp = a.p; jy = a.walk > 0.05 ? a.yaw : PI; jo = { walk: a.walk > 0.05 ? 1 : 0, phase: a.phase * 2, talk: true, squint: true, bite: win(t, E.judgeBrick + 1, E.judgeBrick + 2.6) || win(t, E.judgeDuke + 1, E.judgeDuke + 2) }; if (t > E.reveal) jy = -2.2; }
    if (t > E.panic) jo = { faint: ss(seg(t, E.panic, E.panic + 0.6)) };
    poseJudge(judge23, t, jp, jy, jo); judge23.root.visible = true;
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: Crumbleton square at sunset (rampage; the brick; the pie)
const square = (() => {
  const g = mk('square'); const st = new VSet(g);
  for (let x = -40; x <= 40; x++) for (let z = -40; z <= 40; z++) { const r = Math.hypot(x, z); st.add(x, 0, z, r < 14 ? (hash2(x, z, 3) < 0.5 ? 'stone' : 'path') : 'turf'); }
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) { const r = Math.hypot(x, z); if (r > 3.4) continue; st.add(x, 1, z, r > 2.4 ? 'castle' : 'water'); } 
  const houses = [[-14, -12, 'jam'], [0, -18, 'brick'], [14, -12, 'plank'], [18, 4, 'quartz'], [-18, 4, 'plank'], [-12, 16, 'quartz'], [12, 16, 'jam']];
  for (const [cx, cz, m] of houses) { for (let y = 1; y <= 4; y++) for (let x = cx - 3; x <= cx + 3; x++) for (let z = cz - 3; z <= cz + 3; z++) { if (x > cx - 3 && x < cx + 3 && z > cz - 3 && z < cz + 3) continue; st.add(x, y, z, y === 3 && (x === cx || z === cz) ? 'glass' : m); }
    for (let k = 0; k < 3; k++) for (let x = cx - 4 + k; x <= cx + 4 - k; x++) for (let z = cz - 4 + k; z <= cz + 4 - k; z++) st.add(x, 5 + k, z, 'slate'); }
  for (const [x, z] of [[-11, -11], [11, -11]]) { for (let y = 1; y <= 4; y++) st.add(x, y, z, 'dark'); st.add(x, 5, z, 'goldblk'); }
  for (const [x, z, h] of [[-26, -24, 6], [26, -24, 6], [-28, 22, 5], [28, 22, 5], [0, 30, 6]]) tree20(st, x, z, h, false);
  st.build();
  const bake = new THREE.Mesh(new THREE.BoxGeometry(5, 1.0, 0.12), new THREE.MeshBasicMaterial({ map: bannerTex('BAKERY') })); bake.position.set(0, 5.6, -14.8); g.add(bake);
  const table = new THREE.Group(); box(3, 0.2, 1.4, '#8a5a2b', 0, 1.0, 0, table); for (const [x, z] of [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [1.3, 0.5]]) box(0.16, 1.0, 0.16, '#6a4020', x, 0.5, z, table); for (let i = 0; i < 3; i++) { const p = pie.clone(); p.position.set(-0.9 + i * 0.9, 1.2, 0); table.add(p); } g.add(table); table.position.set(8, 0.5, -5); table.rotation.y = -0.6;
  const blob = box(0.8, 0.6, 0.8, 0, 0, 0, 0, g, frostM); const flash = new THREE.PointLight('#ffffff', 0, 30, 1); flash.position.set(0, 4, 10); g.add(flash);
  burst(E.square + 1.4, [-8, 0.8, -8], { n: 160, colors: ['#ff8fc8', '#ffffff', '#ffe6b0'], speed: 8, size: 0.22, life: 1.6, grav: 8, up: 4 }); burst(E.frost + 1.2, [3.6, 2, 3.6], { n: 70, colors: ['#fff4fa', '#ff8fc8'], speed: 5, size: 0.18, life: 1.2, grav: 8, up: 3 });
  for (let t = E.feast; t < E.fights; t += 0.4) burst(t, [-7, 2.4, -7], { n: 6, colors: ['#ff8fc8', '#ffe6b0'], speed: 3, size: 0.12, life: 0.8, grav: 8, up: 2 }); for (let t = E.fights; t < E.fights + 6; t += 0.3) burst(t, [-7, 4, -7], { n: 18, colors: ['#fff4fa', '#ff8fc8'], speed: 9, size: 0.2, life: 1.2, grav: 7, up: 2 });
  burst(E.crunch + 0.4, [-1.5, 2.4, -2.5], { n: 40, colors: ['#e8344e', '#7cff6b', '#ffd23f', '#5ff7ff', '#b5652e'], speed: 6, size: 0.2, life: 1.4, grav: 9, up: 5 }); for (let t = E.cry; t < E.shrink + 6; t += 0.4) burst(t, [-1.5, 3, -2], { n: 4, colors: ['#5ff7ff', '#9fd0ff'], speed: 2, size: 0.12, life: 0.8, grav: 8, up: 1 });
  burst(E.award + 0.6, [1.6, 3, -3], { n: 120, colors: ['#ffe066', '#ff6fb8', '#5ff7ff'], speed: 7, size: 0.15, life: 2, grav: 4, up: 6 }); burst(E.freeze - 0.25, [4, 2.2, 4.4], { n: 50, colors: ['#ff8fc8', '#fff4fa', '#d9a35f'], speed: 4, size: 0.12, life: 1.6, grav: 6, up: 3 });
  const C = [[E.square, 0, 4, 18, -6, 4, -6, 56], [141.9, 4, 4, 16, -6, 2.4, -6, 54], [142, 8, 1.2, 4, -6, 4, -9, 56], [146.9, 7, 1.4, 3, -5, 4, -9, 54], [147, 9, 3, 9, 2, 2.4, 0, 50], [152.9, 9.4, 3, 9.4, 2, 2.4, 0, 48],
    [153, 3, 3, 4, -5, 2.6, -6, 52], [160.9, 2, 3, 5, -5, 2.6, -6, 50], [161, -15, 4, 5, -7, 2.4, -6, 50], [166.9, -14, 4, 6, -7, 2.4, -6, 48], [167, 6, 10, 10, -7, 2, -7, 56], [174.9, -8, 10, 12, -7, 2, -7, 56], [175, 6, 4, 9, -7, 3.4, -7, 56], [183.9, 4, 4, 10, -7, 3.4, -7, 54],
    [184, -4, 2.6, 2.6, 0, 1.2, -1, 46], [188.9, -4.4, 2.6, 2.2, 0, 1.2, -1, 44], [189, -9, 5, 5, -2, 2.2, -3, 50], [196.9, -9.4, 5, 5.4, -2, 2.2, -3, 48], [197, 4, 4, 8, -1.5, 1.6, -2.5, 50], [207.9, 3, 3, 6, -1.5, 1.2, -2.5, 46],
    [208, 1, 3, 1.6, 2.8, 2, -3.4, 46], [213.9, 1.2, 3, 1.2, 2.8, 2, -3.4, 44], [214, 2.4, 2.4, 1.6, 0.6, 1.8, -2.2, 42], [217.9, 2.6, 2.4, 1.2, 0.6, 1.8, -2.2, 38], [218, 0, 6, 14, 0, 2, -3, 56], [225.9, 4, 6, 14, 0, 2, -3, 54],
    [226, -10, 5, 12, 0, 2, 0, 52], [233.9, 10, 5, 12, 0, 2, 0, 52], [234, 1.0, 2.6, 5.6, 2.2, 1.8, 2.2, 42], [243.9, 1.2, 2.6, 5.2, 2.2, 1.8, 2.2, 38], [244, 3, 2.6, 12, 0, 1.6, 4, 48], [255.9, 2.6, 2.6, 11.4, 0, 1.6, 4, 46],
    [256, 7, 2.2, 6, 3, 1.4, 2.2, 42], [263.9, 6.6, 2.2, 5.6, 3, 1.4, 2.2, 40], [264, 10, 3, 0, 8, 1.4, -5, 46], [267.9, 10.4, 3, 0.4, 8, 1.4, -5, 44], [268, 0, 9, 12, 0, 1, 0, 56], [279.9, 0, 8, 11, 0, 1, 0, 54],
    [280, 10, 3, 10, 3, 2, 3, 46], [285.6, 9, 3, 9.4, 3.6, 2.0, 3.8, 46], [E.logo, 9, 3, 9.4, 3.6, 2.0, 3.8, 46]];
  function update(t) {
    hideMisc(); hideOld(); [hero.root, bloop6.B.root, L6.root, crumbs.root, judge23.root].forEach(o => parentTo(o, g)); envelope.visible = yolk.visible = bowl.visible = shardJar.visible = false; egg.parent.visible = false;
    flash.intensity = win(t, E.photo + 6, E.photo + 6.3) ? 200 : 0;
    // Crumbs
    const cs = sizeAt(t); let cp, cy = 0, co = { size: cs };
    if (t < E.square + 1.4) { cp = [-8, lerp(16, 0.5, seg(t, E.square, E.square + 1.4) ** 2), -8]; co.roar = true; }
    else if (t < E.crunch - 3) { const a = walker(t, [[E.square + 2, -8, 0.5, -8], [E.frost, -5, 0.5, -9], [E.whisk, -6, 0.5, -7], [E.leggyBite, -7, 0.5, -7], [E.crunch - 3, -7, 0.5, -7]]); cp = a.p; cy = a.walk > 0.05 ? a.yaw : faceTo(a.p, hero.root.position.toArray()); co.walk = a.walk > 0.05 ? 1 : 0; co.phase = a.phase * 1.4;
      co.roar = win(t, E.stomp, E.stomp + 2) || win(t, E.frost, E.frost + 1); co.chomp = win(t, E.whisk, E.whisk + 6); co.flail = win(t, E.leggyBite, E.leggyBite + 3) || win(t, E.fights, E.fights + 6); co.wobble = win(t, E.feast, E.fights); }
    else { const k = seg(t, E.crunch - 3, E.crunch); cp = L3([-7, 0.5, -7], [-1.5, 0.5, -2.5], ss(k)); cy = faceTo([-7, 0, -7], [0, 0, -1]); co.walk = k < 1 ? 1 : 0; co.chomp = win(t, E.crunch - 0.4, E.crunch + 0.8); co.toothless = t > E.crunch + 0.4; co.cry = win(t, E.cry, E.judgeWake); }
    if (t > E.judgeWake) { cp = [-1.5, 0.5, -2.5]; cy = 0.6; co = { size: cs, toothless: true, hop: win(t, E.award, E.award + 4) }; }
    if (t > E.pet - 4) { cp = [2.2, 1.5, 2.2]; cy = 0.8; co = { size: cs, toothless: true, awake: !win(t, E.pet + 2, E.photo) }; }
    if (t > E.photo) { cp = [0.8, 0.5, 4.6]; cy = 0; co = { size: cs, toothless: true, hop: win(t, E.photo + 5, E.photo + 7) }; }
    if (t > E.notice) { co.look = 1; co.toothless = true; } if (t > E.piegrab) { const a = walker(t, [[E.piegrab, 0.8, 0.5, 4.6], [E.piegrab + 2, 7, 0.5, -3.6], [E.chase, 7, 0.5, -3.6]]); cp = a.p; cy = a.walk > 0.05 ? a.yaw : -2.5; co = { size: cs, toothless: true, walk: a.walk > 0.05 ? 1 : 0, phase: a.phase * 3, hold: t > E.piegrab + 2.6 }; }
    if (t > E.chase) { const a = (t - E.chase) * 0.75 - 0.9; cp = [Math.cos(a) * 6.2, 0.5, Math.sin(a) * 6.2]; cy = Math.atan2(-Math.sin(a), Math.cos(a)); co = { size: cs, toothless: true, walk: 1, phase: t * 16, hold: true }; }
    if (t > E.throwPie) { const a = (E.throwPie - E.chase) * 0.75 - 0.9; cp = [Math.cos(a) * 6.2, 0.5 + seg(t, E.throwPie, E.throwPie + 0.6) * 1.0, Math.sin(a) * 6.2]; cy = faceTo(cp, [4, 0, 4.4]); co = { size: cs, toothless: true, throw: seg(t, E.throwPie, E.throwPie + 0.8) }; }
    poseCake(crumbs, t, cp, cy, co); crumbs.root.visible = true;
    // the pie: on the table, in Crumbs' arms, then the long slow flight
    pie.visible = t > E.piegrab + 2.6; if (pie.visible) { if (t < E.throwPie + 0.6) { parentTo(pie, crumbs.body); pie.position.set(0, 3.2, 0.3); pie.rotation.set(0, 0, 0); } else { parentTo(pie, g); const k = seg(t, E.throwPie + 0.6, E.freeze - 0.2); const c0 = crumbs.root.position; pie.position.set(lerp(c0.x, 4, k), lerp(c0.y + 1.9, 2.3, k) + Math.sin(k * PI) * 1.4, lerp(c0.z, 4.4, k)); pie.rotation.set(-PI / 2 * k, t * 1.5, 0); } }
    // the frosting blob that hits me
    blob.visible = win(t, E.frost, E.frost + 1.2); if (blob.visible) { const k = seg(t, E.frost, E.frost + 1.2); blob.position.set(lerp(-5, 3.6, k), 3.4 + Math.sin(k * PI) * 3, lerp(-8, 3.6, k)); }
    // me
    const H_ = act(t, [[E.square, 6, 0.5, 6], [E.frost, 3.6, 0.5, 3.6], [E.whisk, -3.2, 0.5, -4], [E.leggyBite, -3.2, 0.5, -4], [E.feast, -3.6, 0.5, -3.4], [E.fights, 0, 0.5, 2], [E.place, 4.6, 0.5, 0.6], [E.judgeWake, 4.6, 0.5, 0.6], [E.calm, 3.4, 0.5, 1.4], [E.pet, 3.6, 0.5, 2.6], [E.photo, 3.6, 0.5, 2.6], [E.photo + 2, -1.4, 0.5, 4.8], [E.fork, -1.4, 0.5, 4.8], [E.fork + 3, 1.6, 0.5, 4.6], [E.chase, 1.6, 0.5, 4.6]],
      [[0, { face: 'flour', panic: true }], [E.frost, { face: 'pie', yaw: -2.4, flat: t < E.frost + 3 ? 1 : 0, flatDir: -1 }], [E.frost + 3, { face: 'pie' }], [E.whisk, { face: 'pie', yaw: faceTo([-1.6, 0, -2.2], [-6, 0, -7]), swing: t * 2.2 }], [E.leggyBite, { face: 'pie', yaw: -2.4, hips: true }], [E.feast, { face: 'pie', yaw: -2.4, swing: t * 3 }],
       [E.fights, { face: 'scared', panic: true }], [E.place, { face: 'smug', yaw: -2.4 }], [E.judgeWake, { face: 'smug', yaw: -2.4, wave: win(t, E.award, E.award + 4) }], [E.calm, { face: 'smug', yaw: -2.4 }], [E.pet, { face: 'smug', yaw: faceTo([3.6, 0, 2.6], [2.2, 0, 2.2]), hold: true }], [E.photo, {}], [E.photo + 2, { yaw: 0, face: 'smug', wave: true }],
       [E.fork, { face: 'smug' }], [E.fork + 3, { yaw: -2.0, face: 'smug', hold: true }], [E.notice, { yaw: -2.0, face: 'scared', hold: true }]]);
    if (t > E.chase) { const a = (t - E.chase) * 0.75; H_.p = [Math.cos(a) * 6.2, 0.5, Math.sin(a) * 6.2]; H_.yaw = Math.atan2(-Math.sin(a), Math.cos(a)); H_.walk = 1; H_.phase = t * 12; H_.face = 'scared'; H_.panic = true; if (t > E.throwPie - 1) { H_.p = [4, 0.5, 4.4]; H_.yaw = faceTo([4, 0, 4.4], cp); H_.walk = 0; H_.panic = false; H_.face = 'scared'; } }
    pose(hero, { t, ...H_ }); whisk.visible = win(t, E.whisk, E.fights); fork.visible = win(t, E.fork, E.throwPie);
    // Bloop: the brick cake, the trophy
    let bp = [8, 0.5, 2], by = -1.6, bo = { angry: win(t, E.stomp, E.leggyBite) };
    if (t > E.place - 2) { const k = seg(t, E.place - 2, E.place + 2); bp = L3([8, 0.5, 2], [0.6, 0.5, -0.6], k); by = faceTo([8, 0, 2], [0, 0, -1]); bo = { walk: k < 1 ? 1 : 0, phase: t * 8, handOut: k >= 1 && t < E.crunch }; }
    if (t > E.judgeWake) { bp = [0.4, 0.5, -2.2]; by = -2.6; bo = { hop: win(t, E.award + 0.6, E.award + 6), handOut: win(t, E.award, E.calm) }; } if (t > E.calm) { bp = [-2.4, 1.5, 2.6]; by = 0.6; bo = { hop: win(t, E.photo + 5, E.photo + 7) }; } if (t > E.photo) { bp = [1.8, 0.5, 4.8]; by = 0; bo = { handOut: true }; } if (t > E.chase) { bp = [-3, 0.5, 6]; by = 0; bo = { facepalm: true }; }
    poseBurble(bloop6, t, bp, by, bo); bHat.visible = true; bHat.position.y = 1.2;
    brickCake.visible = t > E.place - 2 && t < E.crunch + 0.6; if (brickCake.visible) { if (t < E.place + 1) { parentTo(brickCake, bloop6.B.aR); brickCake.position.set(0, -0.9, 0.3); brickCake.scale.setScalar(0.7); } else { parentTo(brickCake, g); brickCake.position.set(-0.4, 0.5, -1.2); brickCake.scale.setScalar(1); } brickCake.rotation.set(0, 0, 0); }
    goldWhisk.visible = t > E.award; if (goldWhisk.visible) { parentTo(goldWhisk, bloop6.B.aR); goldWhisk.position.set(0, -0.6, 0.2); goldWhisk.rotation.set(-1.2 + (t > E.calm ? 0 : Math.sin(t * 3) * 0.3), 0, 0); }
    // Leggy
    const la = act(t, [[E.square, -10, 0.5, 6], [E.leggyBite - 2, -10, 0.5, 6], [E.leggyBite, -8.6, 0.5, -3.6], [E.fights, -8.6, 0.5, -3.6], [E.fights + 2, -10, 0.5, 4], [E.judgeWake, -4, 0.5, 2], [E.calm, -4, 0.5, 2], [E.photo, -4, 0.5, 2], [E.photo + 2, -4, 0.5, 5.4], [E.chase, -4, 0.5, 5.4], [E.chase + 2, -8, 0.5, 6]], [[0, {}], [E.leggyBite, { yaw: PI }], [E.fights, {}], [E.judgeWake, { yaw: 0.6 }], [E.photo, {}], [E.photo + 2, { yaw: 0 }], [E.chase, {}]]);
    poseLurk(L6, t, la.p, la.yaw, la.walk ? 2 : win(t, E.leggyBite, E.fights) ? 2.4 : 0.3);
    // Judge Brioche wakes up, awards, takes the photo
    let jp = [10, 0.5, -1], jy = -1.6, jo = { faint: t < E.judgeWake ? 1 : 1 - seg(t, E.judgeWake, E.judgeWake + 1) };
    if (t > E.judgeWake + 1) { jp = [3.4, 0.5, -3.4]; jy = -0.9; jo = { talk: win(t, E.judgeWake + 1, E.award + 2), award: win(t, E.award, E.award + 1), squint: t < E.award }; }
    if (t > E.photo) { jp = [0, 0.5, 11]; jy = PI; jo = { photo: true }; } if (t > E.chase) { jp = [-4, 0.5, 9]; jy = 2.6; jo = { squint: true }; }
    poseJudge(judge23, t, jp, jy, jo); judge23.root.visible = true;
    // the crowd: Duke, Team Lumpy, fans
    [duke, ...lumpy, ...fans].forEach((c, i) => { c.root.visible = true; parentTo(c.root, g); const r = rng(2330 + i), a0 = i / 12 * PI * 2; let p = [Math.cos(a0) * 11, 0.5, Math.sin(a0) * 11], y = faceTo(p, [0, 0, 0]), o = { seed: i, hop: win(t, E.square, E.frost) };
      if (win(t, E.feast, E.fights + 1)) { const s = sizeAt(t) * 1.15; p = [-7 + Math.cos(a0) * s, 0.5, -7 + Math.sin(a0) * s]; y = faceTo(p, [-7, 0, -7]); o = { seed: i, hop: true }; }
      if (win(t, E.fights + 1, E.judgeWake)) { p = [Math.cos(a0) * 13, 0.5, Math.sin(a0) * 13]; o = { seed: i, wave: true }; }
      if (t > E.award) o = { seed: i, hop: win(t, E.award, E.award + 6) || win(t, E.photo + 5, E.photo + 7), wave: win(t, E.award, E.award + 6) };
      if (t > E.photo) { p = [-5 + (i % 6) * 2, 0.5, 3.4 + Math.floor(i / 6) * -1.4]; y = 0; } if (t > E.chase) { p = [Math.cos(a0) * 11, 0.5, Math.sin(a0) * 11]; y = faceTo(p, [0, 0, 0]); o = { seed: i, wave: true }; }
      poseCushion(c, t, p, y, o); });
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();
