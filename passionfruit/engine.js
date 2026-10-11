// PASSIONFRUIT EVENT — reusable engine for a fictional pre-recorded product launch film.
// Everything comes from eventN/event.json + eventN/build/timeline.json (made by narration.py).
// window.renderAt(t) draws the frame at time t (seconds) and returns a JPEG data URL. Deterministic.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1280, H = 720;
const QP = new URLSearchParams(location.search); const BASE = `event${QP.get('ev') || '1'}/`;
const getJSON = async (u, d) => { try { const r = await fetch(u); if (!r.ok) throw 0; return await r.json(); } catch { return d; } };
const EV = await getJSON(BASE + 'event.json');
const TL = await getJSON(BASE + 'build/timeline.json');
const ENV = await getJSON(BASE + 'build/env.json', null);
const FPS = TL.fps || 30;
await Promise.all(['300', '600', '700'].map(w => document.fonts.load(`${w} 20px PF`)));

// ---------------------------------------------------------------- utils
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
function rng(seed) { let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h1(i) { let h = Math.imul(i | 0, 374761393) ^ 0x5bd1e995; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
const n1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(h1(i), h1(i + 1), u) * 2 - 1; };
const BRAND = { purple: '#7b2cbf', deep: '#3a1046', orange: '#ff8a3d', yellow: '#ffd23f', green: '#5cc96b' };

// ---------------------------------------------------------------- renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#fff', 50, 400);
const camera = new THREE.PerspectiveCamera(35, W / H, 0.03, 4000);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
const hemi = new THREE.HemisphereLight('#fff', '#777', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff', 2); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 400; scene.add(sun, sun.target);
const sweep = new THREE.PointLight('#ffffff', 0, 2.6, 1.6); scene.add(sweep);
const skyMat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false,
  uniforms: { top: { value: new THREE.Color() }, bot: { value: new THREE.Color() }, sunCol: { value: new THREE.Color() }, sunDir: { value: V3(0, 1, 0) } },
  vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform vec3 top, bot, sunCol, sunDir; varying vec3 vP;
    void main(){ vec3 d = normalize(vP); float h = clamp(d.y * 1.8 + 0.12, 0., 1.); vec3 c = mix(bot, top, pow(h, .7));
      float s = max(dot(d, normalize(sunDir)), 0.); c += sunCol * (smoothstep(.9993, .9997, s) * 4. + pow(s, 14.) * .45);
      gl_FragColor = vec4(c, 1.);
      #include <colorspace_fragment>
    }` });
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), skyMat); skyDome.renderOrder = -1; scene.add(skyDome);

// ---------------------------------------------------------------- materials + mesh helpers
const MC = {};
function M(c, r = 0.7, m = 0, extra) { const k = c + r + m + (extra ? JSON.stringify(extra) : ''); return MC[k] ||= new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...extra }); }
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; if (parent) parent.add(o); return o; }
const BOXG = new THREE.BoxGeometry(1, 1, 1);
function box(w, h, d, mat, x, y, z, parent) { const o = mesh(BOXG, mat, x, y, z, parent); o.scale.set(w, h, d); return o; }
function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
function instanced(geo, mat, list, parent) { // list: [{p:[x,y,z], s:[sx,sy,sz], r:ry, c:color}]
  const im = new THREE.InstancedMesh(geo, mat, list.length); const o = new THREE.Object3D(); const col = new THREE.Color();
  list.forEach((e, i) => { o.position.set(...e.p); o.scale.set(...(e.s || [1, 1, 1])); o.rotation.set(0, e.r || 0, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); if (e.c) im.setColorAt(i, col.set(e.c)); });
  im.castShadow = im.receiveShadow = true; parent.add(im); return im;
}
function forest(parent, pts, seed, greens = ['#4f8f3e', '#5e9f45', '#3f7d3a', '#6aa84f', '#7cb35a']) {
  const r = rng(seed); const tr = [], cn = [];
  for (const [x, z, s0] of pts) { const s = s0 || 0.8 + r() * 0.9; tr.push({ p: [x, 1.2 * s, z], s: [s, s, s] }); cn.push({ p: [x, (2.6 + r() * 0.6) * s, z], s: [1.5 * s, (1.7 + r() * 0.8) * s, 1.5 * s], r: r() * 6, c: greens[Math.floor(r() * greens.length)] }); }
  instanced(new THREE.CylinderGeometry(0.16, 0.24, 2.4, 6), M('#6b4a32', .9), tr, parent);
  instanced(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: .85, flatShading: true }), cn, parent);
}
function scatter(seed, n, f) { const r = rng(seed); const out = []; let k = 0; while (out.length < n && k++ < n * 20) { const p = f(r); if (p) out.push(p); } return out; }

// ---------------------------------------------------------------- 2D brand art (logo)
function drawFruit(g, x, y, r) {
  const gr = g.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r); gr.addColorStop(0, '#a45ad6'); gr.addColorStop(.6, BRAND.purple); gr.addColorStop(1, BRAND.deep);
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.clip(); // the cut: a wedge of golden pulp with seeds
  g.fillStyle = BRAND.yellow; g.beginPath(); g.moveTo(x + r * .05, y + r * .05); g.arc(x, y, r * 1.1, -0.15, 0.95); g.closePath(); g.fill();
  g.fillStyle = BRAND.orange; g.beginPath(); g.moveTo(x + r * .05, y + r * .05); g.arc(x, y, r * 0.75, -0.15, 0.95); g.closePath(); g.fill();
  g.fillStyle = '#2a1206'; for (const [a, d] of [[0.1, .45], [0.35, .62], [0.55, .38], [0.75, .6], [0.3, .85], [0.62, .82]]) { g.beginPath(); g.ellipse(x + Math.cos(a) * r * d, y + Math.sin(a) * r * d, r * .06, r * .045, a, 0, 7); g.fill(); }
  g.restore();
  g.fillStyle = BRAND.green; g.beginPath(); g.moveTo(x - r * .05, y - r * .92); g.quadraticCurveTo(x + r * .2, y - r * 1.55, x + r * .75, y - r * 1.35); g.quadraticCurveTo(x + r * .35, y - r * .85, x - r * .05, y - r * .92); g.fill();
}
const logoTex = ctex(256, 256, (g) => drawFruit(g, 128, 145, 92));

// ---------------------------------------------------------------- SETS (locations). Each: group, look, marks [x,y,z,yaw], walk path, wide shot
const SETS = {};
function look(o) { return Object.assign({ top: '#5d9be0', bot: '#dceeff', sunCol: '#000000', sunDir: [0.4, 0.6, 0.5], sun: ['#fff4e0', 2.2], hemi: ['#dfeeff', '#5a6a3a', 1.0], fog: ['#dceeff', 80, 600], env: 0.8, exp: 1.0, shadow: 16 }, o); }
function mkCampus() {
  const g = new THREE.Group();
  mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), M('#6f9f52', .95), 0, 0, 0, g);
  mesh(new THREE.RingGeometry(55.5, 61, 128).rotateX(-Math.PI / 2), M('#d8cdb8', .9), 0, 0.03, 0, g);
  mesh(new THREE.PlaneGeometry(5, 240).rotateX(-Math.PI / 2), M('#d8cdb8', .9), 0, 0.03, 180, g);
  const prof = [[43, 0], [53, 0], [53, 13], [43, 13], [43, 0]].map(p => new THREE.Vector2(...p));
  mesh(new THREE.LatheGeometry(prof, 160), M('#a8c9de', 0.06, 0.92), 0, 0, 0, g);
  for (const y of [0.2, 4.5, 8.8]) mesh(new THREE.LatheGeometry([[42.7, 0], [53.4, 0], [53.4, .5], [42.7, .5], [42.7, 0]].map(p => new THREE.Vector2(...p)), 160), M('#f4f4f0', .5), 0, y, 0, g);
  mesh(new THREE.LatheGeometry([[42.4, 0], [53.8, 0], [53.8, .6], [42.4, .6], [42.4, 0]].map(p => new THREE.Vector2(...p)), 160), M('#f8f8f6', .4), 0, 13, 0, g);
  mesh(new THREE.RingGeometry(44.5, 52, 160).rotateX(-Math.PI / 2), M('#2c3e58', .3, .6), 0, 13.62, 0, g);
  const fr = new THREE.Group(); fr.position.set(-9, 0, 72); g.add(fr); // the giant fruit sculpture at the entrance
  mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.8, 24), M('#e8e4dc', .6), 0, 0.4, 0, fr);
  mesh(new THREE.SphereGeometry(2.6, 32, 20), M(BRAND.purple, .35, 0, { envMapIntensity: 1.2 }), 0, 3.3, 0, fr);
  mesh(new THREE.SphereGeometry(1, 12, 8), M(BRAND.green, .5), 1.1, 6.0, 0, fr).scale.set(1.5, 0.3, 0.7);
  mesh(new THREE.CircleGeometry(16, 40).rotateX(-Math.PI / 2), M('#4f86b8', .08, .3), 95, 0.05, 40, g);
  forest(g, scatter(11, 70, r => { const a = r() * 6.283, d = r() * 36; return [Math.cos(a) * d, Math.sin(a) * d]; }), 12);
  forest(g, scatter(13, 380, r => { const a = r() * 6.283, d = 68 + r() * 320; const x = Math.cos(a) * d, z = Math.sin(a) * d; return (Math.abs(x) < 9 && z > 50) || Math.hypot(x - 95, z - 40) < 20 || Math.hypot(x + 9, z - 72) < 8 ? null : [x, z]; }), 14);
  const hills = scatter(15, 14, r => { const a = r() * 6.283, d = 900 + r() * 400; return { p: [Math.cos(a) * d, 0, Math.sin(a) * d], s: [160 + r() * 200, 60 + r() * 90, 160 + r() * 200], r: r() * 6, c: '#7f9fb0' }; });
  instanced(new THREE.ConeGeometry(1, 1, 7).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 1 }), hills, g);
  const path = []; for (let a = 1.1; a < 2.2; a += 0.05) path.push([Math.cos(a) * 58.3, 0, Math.sin(a) * 58.3]);
  return { g, look: look({ top: '#4a6fae', bot: '#ffb98a', sunCol: '#ffcf9a', sunDir: [-0.85, 0.1, -0.5], sun: ['#ffc58e', 2.6], hemi: ['#bcd0f0', '#5a5a3a', 0.9], fog: ['#f0c6a4', 150, 1300], shadow: 30, env: 0.9 }),
    marks: [[0, 0, 63, 0], [1.5, 0, 63.4, -0.15], [-1.5, 0, 63.4, 0.15]], path, wide: [[14, 9, 95], [0, 6, 50], 40] };
}
function mkLab() {
  const g = new THREE.Group(); const white = M('#f3f3f1', .55);
  mesh(new THREE.PlaneGeometry(80, 80).rotateX(-Math.PI / 2), M('#ececea', .4), 0, 0, 0, g);
  box(60, 14, .5, white, 0, 7, -14, g); box(.5, 14, 40, white, -18, 7, 0, g); box(.5, 14, 40, white, 18, 7, 0, g);
  for (let x = -12; x <= 12; x += 6) for (let z = -10; z <= 6; z += 5) box(4, .12, 1.4, M('#ffffff', .2, 0, { emissive: '#ffffff', emissiveIntensity: 1.5 }), x, 9, z, g);
  const tables = [[-6, -5], [0, -6], [6, -5], [-9, 1], [9, 1]], r = rng(21);
  for (const [x, z] of tables) {
    box(3.2, .08, 1.4, M('#fbfbfb', .3), x, 1.0, z, g); for (const dx of [-1.4, 1.4]) box(.06, 1, 1.2, M('#cfcfcf', .3, .8), x + dx, .5, z, g);
    for (let k = 0; k < 4; k++) { const c = ['#c9b6e4', '#ffd7a8', '#bfe3c7', '#f6f6f6', '#ffe9a6'][Math.floor(r() * 5)]; const hh = .1 + r() * .35; mesh(new RoundedBoxGeometry(.3 + r() * .4, hh, .3 + r() * .3, 3, .04), M(c, .5), x - 1.1 + k * .75, 1.04 + hh / 2, z + (r() - .5) * .6, g); }
  }
  const sk = ctex(512, 384, (c, w, h) => { c.fillStyle = '#fbfbf8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6a6a72'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { c.beginPath(); const x = 40 + (i % 3) * 160, y = 40 + Math.floor(i / 3) * 110; c.roundRect(x, y, 90 + (i * 13 % 40), 70 - (i * 7 % 30), 14); c.stroke(); c.beginPath(); c.arc(x + 70, y + 20, 8, 0, 7); c.stroke(); } c.fillStyle = BRAND.purple; c.font = '600 20px PF'; c.fillText('v47 — thinner??', 300, 360); });
  for (const x of [-10, -3.5, 3.5, 10]) { box(3.2, 2.4, .05, new THREE.MeshStandardMaterial({ map: sk, roughness: .8 }), x, 3.2, -13.6, g); }
  mesh(new THREE.SphereGeometry(.5, 24, 16), M(BRAND.purple, .5), 12, .5, -9, g); mesh(new THREE.SphereGeometry(.4, 24, 16), M(BRAND.yellow, .5), 13, .4, -8, g);
  return { g, look: look({ top: '#f4f4f2', bot: '#f4f4f2', sun: ['#ffffff', 1.1], sunDir: [0.3, 1, 0.6], hemi: ['#ffffff', '#cfcfd4', 0.9], fog: ['#ecebe8', 25, 70], env: 0.5, exp: 0.82, shadow: 14 }),
    marks: [[0, 0, 2, 0], [1.6, 0, 2.3, -0.2], [-1.6, 0, 2.3, 0.2]], path: [[-9, 0, 3.5], [9, 0, 3.5]], wide: [[7, 3.4, 12], [0, 1.4, 0], 42] };
}
const ARMS = [];
function mkRobot() {
  const g = new THREE.Group();
  const hz = ctex(256, 256, (c, w, h) => { c.fillStyle = '#7d8187'; c.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * .06})`; c.fillRect(Math.random() * w, Math.random() * h, 3, 3); } c.fillStyle = '#ffcc00'; c.fillRect(0, 0, w, 18); for (let x = -20; x < w; x += 36) { c.fillStyle = '#111'; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 18, 0); c.lineTo(x + 6, 18); c.lineTo(x - 12, 18); c.fill(); } });
  hz.wrapS = hz.wrapT = THREE.RepeatWrapping; hz.repeat.set(8, 8);
  mesh(new THREE.PlaneGeometry(64, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: hz, roughness: .8 }), 0, 0, 0, g);
  box(60, 12, .5, M('#3b4048', .7), 0, 6, -14, g); box(.5, 12, 40, M('#3b4048', .7), -16, 6, 0, g); box(.5, 12, 40, M('#3b4048', .7), 16, 6, 0, g);
  for (let x = -12; x <= 12; x += 4) box(.3, 12, .3, M('#ffcc00', .5), x, 6, -13.6, g);
  for (const [x, z, s] of [[-5, -5, 1], [4.5, -6, 1.2], [9, 0, 0.9], [-9, 0, 1.1]]) {
    const base = new THREE.Group(); base.position.set(x, 0, z); base.scale.setScalar(s); g.add(base); const or = M('#ff7a1a', .45, .2), gr = M('#2b2f36', .5, .5);
    mesh(new THREE.CylinderGeometry(.6, .7, .5, 20), gr, 0, .25, 0, base); const turn = new THREE.Group(); turn.position.y = .5; base.add(turn);
    mesh(new THREE.CylinderGeometry(.4, .4, .5, 16), or, 0, .25, 0, turn); const a1 = new THREE.Group(); a1.position.y = .5; turn.add(a1); box(.3, 1.8, .3, or, 0, .9, 0, a1);
    const a2 = new THREE.Group(); a2.position.y = 1.8; a1.add(a2); mesh(new THREE.SphereGeometry(.25, 12, 8), gr, 0, 0, 0, a2); box(.24, 1.4, .24, or, 0, .7, 0, a2);
    const hd = new THREE.Group(); hd.position.y = 1.4; a2.add(hd); box(.4, .2, .4, gr, 0, .1, 0, hd); box(.08, .35, .08, gr, .12, .35, 0, hd); box(.08, .35, .08, gr, -.12, .35, 0, hd);
    ARMS.push({ turn, a1, a2, hd, ph: x * 1.7 + z });
  }
  const tower = new THREE.Group(); tower.position.set(-4, 0, -9); g.add(tower); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(.12, 7, .12, M('#c8ccd2', .3, .9), x, 3.5, z, tower);
  box(2.2, .1, 2.2, M('#c8ccd2', .3, .9), 0, 7, 0, tower); box(1.6, .05, 1.6, M('#202020', .9), 0, .03, 0, tower);
  mesh(new THREE.CylinderGeometry(1.4, 1.4, 6, 24, 1, true).rotateZ(Math.PI / 2), M('#9fb6c8', .1, .5, { side: THREE.DoubleSide, transparent: true, opacity: .35 }), 7, 1.6, -9, g);
  for (const [x, z] of [[-2.5, 6], [3, 7], [-7, 4]]) mesh(new THREE.ConeGeometry(.18, .5, 12), M('#ff6a00', .6), x, .25, z, g);
  return { g, look: look({ top: '#262b33', bot: '#262b33', sun: ['#f2f6ff', 1.6], sunDir: [-0.3, 1, 0.5], hemi: ['#dbe6ff', '#404650', 1.2], fog: ['#262b33', 22, 60], env: 0.8, shadow: 14 }),
    marks: [[0, 0, 2, 0], [1.6, 0, 2.3, -0.2], [-1.6, 0, 2.3, 0.2]], path: [[8, 0, 3], [-8, 0, 3]], wide: [[-8, 4, 11], [0, 1.5, -2], 44],
    update(t) { for (const a of ARMS) { const k = t * 0.6 + a.ph; a.turn.rotation.y = Math.sin(k) * 1.2; a.a1.rotation.z = 0.4 + Math.sin(k * 1.3) * 0.35; a.a2.rotation.z = 0.9 + Math.sin(k * 1.7 + 1) * 0.5; a.hd.rotation.y = k * 2; } } };
}
function mkRooftop() {
  const g = new THREE.Group();
  const wd = ctex(256, 256, (c, w, h) => { for (let y = 0; y < h; y += 16) { c.fillStyle = ['#9b6b46', '#8d603e', '#a6744c'][(y / 16) % 3]; c.fillRect(0, y, w, 15); c.fillStyle = '#5a3a24'; c.fillRect(0, y + 15, w, 1); } });
  wd.wrapS = wd.wrapT = THREE.RepeatWrapping; wd.repeat.set(5, 5);
  box(36, 1, 26, new THREE.MeshStandardMaterial({ map: wd, roughness: .8 }), 0, -0.5, 0, g); box(36.4, 40, 26.4, M('#c9cdd2', .6), 0, -21.05, 0, g);
  const glass = M('#bcd8e8', .05, .2, { transparent: true, opacity: .28 });
  for (const [x, z, w, d] of [[0, -13, 36, .05], [0, 13, 36, .05], [-18, 0, .05, 26], [18, 0, .05, 26]]) { box(w, 1.1, d, glass, x, .55, z, g); box(w + .1, .07, d + .1, M('#cfd4da', .25, .9), x, 1.12, z, g); }
  const r = rng(31);
  for (const [x, z] of [[-14, -10], [-14, 10], [14, -10], [14, 10], [-6, -11], [6, -11]]) { box(2.2, .8, 1.2, M('#d9d4cc', .7), x, .4, z, g); for (let k = 0; k < 3; k++) mesh(new THREE.IcosahedronGeometry(.5 + r() * .3, 0), new THREE.MeshStandardMaterial({ color: ['#4f8f3e', '#6aa84f'][k % 2], flatShading: true, roughness: .9 }), x - .6 + k * .6, 1.1, z, g); }
  box(3, .45, 1, M('#6b4a32', .7), -8, .45, 6, g); box(1.4, .02, 1.4, M('#efe8dc', .8), 6, .01, 5, g);
  const sky = scatter(33, 420, r => { const a = r() * 6.283, d = 140 + r() * 600; const hh = 15 + r() ** 2 * 120; return { p: [Math.cos(a) * d, hh / 2 - 45, Math.sin(a) * d], s: [12 + r() * 20, hh, 12 + r() * 20], r: r() * 3, c: ['#8fa1b8', '#a7b4c4', '#7c8ea6', '#b9c2cf', '#9aa6b0'][Math.floor(r() * 5)] }; });
  instanced(BOXG, new THREE.MeshStandardMaterial({ roughness: .4, metalness: .5 }), sky, g);
  forest(g, scatter(35, 200, r => { const a = r() * 6.283, d = 60 + r() * 400; return [Math.cos(a) * d, Math.sin(a) * d, 2 + r() * 2]; }).map(([x, z, s]) => [x, z, s]), 36);
  g.children.at(-1).position.y = -45; g.children.at(-2).position.y = -45;
  mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), M('#77905e', 1), 0, -45, 0, g);
  return { g, look: look({ top: '#6487c4', bot: '#ffcf95', sunCol: '#ffd9a0', sunDir: [0.9, 0.12, -0.6], sun: ['#ffcf9a', 2.4], hemi: ['#cfdcf5', '#806a50', 1.0], fog: ['#f3d2ad', 200, 1300], shadow: 18 }),
    marks: [[0, 0, 4, 0], [1.6, 0, 4.3, -0.2], [-1.6, 0, 4.3, 0.2]], path: [[-12, 0, 8], [12, 0, 8]], wide: [[10, 5, 18], [0, 1.2, 2], 46] };
}
function mkPark() {
  const g = new THREE.Group(); mesh(new THREE.PlaneGeometry(2000, 2000).rotateX(-Math.PI / 2), M('#79b057', .95), 0, 0, 0, g);
  const path = []; for (let x = -24; x <= 24; x += 1) path.push([x, 0, Math.sin(x * 0.12) * 3]);
  instanced(new THREE.BoxGeometry(1.1, .04, 2.4), M('#d9c9a8', .95), path.map(([x, , z]) => ({ p: [x, .02, z], r: Math.atan(0.36 * Math.cos(x * 0.12)) })), g);
  mesh(new THREE.CircleGeometry(12, 40).rotateX(-Math.PI / 2), M('#4e8fc0', .06, .3), -10, .04, -18, g);
  forest(g, scatter(41, 260, r => { const x = (r() - .5) * 300, z = (r() - .5) * 300; return Math.abs(z - Math.sin(x * 0.12) * 3) < 6 || Math.hypot(x + 10, z + 18) < 14 ? null : [x, z]; }), 42, ['#4f8f3e', '#6aa84f', '#7cb35a', '#8fbf4f', '#3f7d3a']);
  instanced(BOXG, M('#ffffff', .8), scatter(43, 500, r => { const x = (r() - .5) * 80, z = (r() - .5) * 60; return Math.abs(z - Math.sin(x * 0.12) * 3) < 2 ? null : { p: [x, .12, z], s: [.18, .24, .18], c: ['#ff6b8a', '#ffd23f', '#ffffff', '#b58cff', '#ff9a3c'][Math.floor(r() * 5)] }; }), g);
  const bench = new THREE.Group(); bench.position.set(4, 0, -3.4); g.add(bench); box(2.4, .1, .6, M('#8a5a3a', .8), 0, .5, 0, bench); box(2.4, .5, .08, M('#8a5a3a', .8), 0, .85, -.28, bench); for (const x of [-1, 1]) box(.1, .5, .5, M('#333', .5, .7), x, .25, 0, bench);
  return { g, look: look({ top: '#4f8fe0', bot: '#d6ecff', sunDir: [0.5, 0.75, 0.6], sun: ['#fff6e2', 2.4], hemi: ['#dbeeff', '#5f7a3a', 1.0], fog: ['#d6ecff', 80, 500], shadow: 16 }),
    marks: [[0, 0, 0, 0], [1.6, 0, 0.3, -0.2], [-1.6, 0, 0.3, 0.2]], path, wide: [[-12, 4, 14], [0, 1.4, 0], 44] };
}
const STUDIO = {};
function mkStudio() {
  const g = new THREE.Group();
  mesh(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), M('#030304', .45, 0), 0, 0, 0, g);
  const key = new THREE.SpotLight('#ffffff', 60, 30, 0.5, 0.6, 1.2); key.position.set(2, 6, 5); key.target.position.set(0, 1.2, 0); g.add(key, key.target);
  const rimL = new THREE.SpotLight('#cfe0ff', 90, 30, 0.45, 0.5, 1.2); rimL.position.set(-5, 4, -4); rimL.target.position.set(0, 1.2, 0); g.add(rimL, rimL.target);
  const rimR = new THREE.SpotLight('#ffd8b8', 70, 30, 0.45, 0.5, 1.2); rimR.position.set(5, 3, -4); rimR.target.position.set(0, 1.2, 0); g.add(rimR, rimR.target);
  Object.assign(STUDIO, { key, rimL, rimR });
  return { g, look: look({ top: '#000000', bot: '#050507', sun: ['#ffffff', 0], hemi: ['#ffffff', '#000000', 0.06], fog: ['#000000', 8, 30], env: 0.35, shadow: 4 }), marks: [[0, 0, 0, 0]], path: [[-2, 0, 0], [2, 0, 0]], wide: [[0, 2, 6], [0, 1, 0], 35] };
}
let screenTex, screenText = null;
function mkTheater() {
  const g = new THREE.Group(); mesh(new THREE.PlaneGeometry(300, 300).rotateX(-Math.PI / 2), M('#0d0c10', .9), 0, 0, 0, g);
  box(18, .8, 8, M('#2a1d16', .5), 0, .4, -1, g); mesh(new THREE.CircleGeometry(1.6, 40).rotateX(-Math.PI / 2), M('#ffe9c8', .9, 0, { emissive: '#ffd9a8', emissiveIntensity: .25 }), 0, .81, 1, g);
  screenTex = ctex(1024, 448, () => {}); box(16, 7, .1, new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }), 0, 5.6, -4.8, g);
  const seats = []; for (let row = 0; row < 14; row++) for (let i = -9; i <= 9; i++) if (Math.abs(i) > 0) seats.push({ p: [i * 1.05, row * 0.32 + .45, 6 + row * 1.3], s: [.9, .9, .8], c: '#5a1420' });
  instanced(new RoundedBoxGeometry(1, 1, 1, 2, .15), M('#ffffff', .9), seats, g);
  const spot = new THREE.SpotLight('#ffe6c8', 120, 20, 0.28, 0.5, 1.2); spot.position.set(0, 9, 7); spot.target.position.set(0, .8, 1); g.add(spot, spot.target);
  return { g, look: look({ top: '#060508', bot: '#060508', sun: ['#ffffff', 0.15], sunDir: [0, 1, 1], hemi: ['#a0a0c0', '#101010', 0.25], fog: ['#060508', 20, 60], env: 0.35, shadow: 6 }),
    marks: [[0, 0.8, 1, 0], [1.6, 0.8, 1.3, -0.2], [-1.6, 0.8, 1.3, 0.2]], path: [[-6, 0.8, 1.2], [6, 0.8, 1.2]], wide: [[0, 4.5, 22], [0, 3, -2], 38] };
}
function drawScreen(text) {
  if (text === screenText) return; screenText = text; const c = screenTex.image, g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, c.width, c.height); gr.addColorStop(0, '#14081f'); gr.addColorStop(1, '#2a0f3a'); g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
  if (!text) { drawFruit(g, 512, 230, 120); } else { drawFruit(g, 512, 150, 60); g.fillStyle = '#fff'; g.font = '600 64px PF'; g.textAlign = 'center'; g.fillText(text, 512, 330); }
  screenTex.needsUpdate = true;
}
Object.assign(SETS, { campus: mkCampus(), lab: mkLab(), robotlab: mkRobot(), rooftop: mkRooftop(), park: mkPark(), studio: mkStudio(), theater: mkTheater() });
for (const k in SETS) { SETS[k].g.visible = false; scene.add(SETS[k].g); }

// ---------------------------------------------------------------- PRESENTER RIG (blocky, original characters)
function makePerson(L) {
  const P = { L, root: new THREE.Group(), arms: [], legs: [] }; const skin = M(L.skin || '#e2b48e', .75), out = M(L.outfit || '#222228', .85), hairM = M(L.hairColor || '#2a1d14', .9);
  const pants = M(L.pants || '#2c2c34', .85), shoe = M(L.shoes || '#f0f0f0', .6), dark = M('#1a1418', .6);
  const hip = new THREE.Group(); hip.position.y = 0.95; P.root.add(hip); P.hip = hip;
  for (const s of [-1, 1]) { const lg = new THREE.Group(); lg.position.x = s * 0.14; hip.add(lg); box(.23, .88, .25, pants, 0, -.44, 0, lg); box(.25, .12, .36, shoe, 0, -.89, .05, lg); P.legs.push(lg); }
  const ch = new THREE.Group(); hip.add(ch); P.ch = ch; const st = L.style || 'tee';
  box(.62, .8, .33, out, 0, .4, 0, ch);
  if (st === 'blazer') { box(.18, .5, .02, M(L.shirt || '#ffffff', .8), 0, .52, .168, ch); }
  if (st === 'turtleneck') mesh(new THREE.CylinderGeometry(.13, .14, .14, 12), out, 0, .84, 0, ch);
  if (st === 'labcoat') { box(.66, 1.12, .37, M('#f7f7f7', .8), 0, .26, 0, ch); box(.14, .7, .02, M(L.shirt || '#5a7dbf', .8), 0, .45, .19, ch); }
  if (st === 'hoodie') { box(.5, .22, .14, out, 0, .78, -.2, ch); box(.36, .16, .02, M(L.accent || '#00000033', .9), 0, .18, .17, ch); }
  if (st === 'vest') box(.66, .62, .37, M(L.accent || '#1d2b45', .5), 0, .45, 0, ch);
  box(.17, .12, .17, skin, 0, .86, 0, ch);
  const head = new THREE.Group(); head.position.y = 1.16; ch.add(head); P.head = head;
  box(.5, .56, .48, skin, 0, 0, 0, head); box(.07, .11, .07, M(L.skin || '#e2b48e', .7).clone(), 0, -.03, .26, head).material.color.multiplyScalar(0.92);
  P.eyes = [-1, 1].map(s => box(.075, .085, .02, dark, s * .11, .05, .245, head));
  P.brows = [-1, 1].map(s => box(.12, .028, .02, hairM, s * .11, .135, .246, head));
  P.mouth = box(.16, .04, .02, M('#5b1f24', .7), 0, -.15, .245, head);
  const hs = L.hair || 'short';
  if (hs !== 'bald') box(.53, hs === 'buzz' ? .06 : .14, .51, hairM, 0, .3, 0, head);
  if (['short', 'long', 'bun', 'quiff', 'bob', 'curly'].includes(hs)) box(.53, .42, .12, hairM, 0, .1, -.2, head);
  if (hs === 'long') box(.55, .7, .14, hairM, 0, -.12, -.21, head);
  if (hs === 'bob') for (const s of [-1, 1]) box(.06, .4, .4, hairM, s * .27, .05, -.02, head);
  if (hs === 'bun') mesh(new THREE.SphereGeometry(.13, 12, 8), hairM, 0, .38, -.2, head);
  if (hs === 'quiff') { const q = box(.46, .16, .2, hairM, 0, .4, .14, head); q.rotation.x = -0.35; }
  if (hs === 'curly') for (let i = 0; i < 9; i++) box(.16, .16, .16, hairM, -.2 + (i % 3) * .2, .38, -.18 + Math.floor(i / 3) * .18, head);
  if (hs === 'bald') for (const s of [-1, 1]) box(.04, .16, .3, hairM, s * .255, .02, -.08, head);
  if (L.beard) box(.52, .2, .1, hairM, 0, -.22, .21, head);
  if (L.glasses) { const gm = M(L.glasses === 'gold' ? '#c9a24a' : '#111', .3, .5); for (const s of [-1, 1]) { const f = mesh(new THREE.TorusGeometry(.072, .013, 6, 18), gm, s * .11, .05, .26, head); } box(.08, .015, .015, gm, 0, .07, .26, head); }
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .4, .74, 0); ch.add(sh); box(.17, .42, .18, st === 'labcoat' ? M('#f7f7f7', .8) : out, 0, -.2, 0, sh);
    const el = new THREE.Group(); el.position.y = -.4; sh.add(el); box(.16, .36, .17, st === 'labcoat' ? M('#f7f7f7', .8) : out, 0, -.17, 0, el); box(.15, .15, .15, skin, 0, -.42, 0, el);
    const hand = new THREE.Object3D(); hand.position.set(0, -.45, .1); el.add(hand); P.arms.push({ sh, el, hand, s });
  }
  P.root.scale.setScalar(L.height || 1); P.root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(P.root); P.root.visible = false; return P;
}
function mouthAt(t, id) {
  const c = TL.cues.find(c => t >= c.start && t < c.end); if (!c || c.who !== id) return 0;
  if (ENV) return ENV[Math.floor(t * FPS)] || 0;
  return clamp(0.5 + 0.5 * Math.sin(t * 17) * Math.sin(t * 5.3 + 1), 0, 1);
}
function posePerson(P, t, o) {
  const sd = P.L.seed || 1, nerv = P.L.nervous ? 1 : 0, spk = o.mouth > 0.02 || o.speaking;
  const w = o.walk; const a = w == null ? 0 : Math.sin(w) * 0.5;
  P.legs[0].rotation.x = a; P.legs[1].rotation.x = -a; P.hip.position.y = 0.95 + (w == null ? 0 : Math.abs(Math.cos(w)) * 0.025);
  P.ch.scale.y = 1 + 0.008 * Math.sin(t * 2.1 + sd);
  for (const A of P.arms) {
    const k = A.s * 3.1 + sd;
    let sx = w == null ? 0.05 : -a * A.s * 0.6, ex = -0.15, sz = A.s * 0.06;
    if (spk && w == null) { sx = -0.35 - 0.4 * (0.5 + 0.5 * n1(t * 0.9 + k)); ex = -0.7 - 0.5 * (0.5 + 0.5 * n1(t * 1.4 + k + 7)); sz = A.s * (0.12 + 0.12 * n1(t * 0.7 + k)); }
    else if (spk) { ex = -0.5 - 0.3 * (0.5 + 0.5 * n1(t * 1.2 + k)); }
    if (nerv && !spk && w == null) { sx = -0.25; ex = -1.25 + 0.12 * Math.sin(t * 9 + k); sz = A.s * -0.25; }
    if (o.hold && A.s === 1) { sx = -0.75; ex = -0.85; sz = 0.15; }
    A.sh.rotation.set(sx, 0, sz); A.el.rotation.x = ex;
  }
  P.head.rotation.y = 0.12 * n1(t * 0.3 + sd) + (o.lookYaw || 0) + nerv * 0.05 * n1(t * 4 + sd);
  P.head.rotation.x = -0.04 * o.mouth + 0.04 * n1(t * 0.5 + sd + 3) + (o.hold ? 0.18 : 0);
  P.mouth.scale.y = 0.04 + o.mouth * 0.1; P.mouth.scale.x = 0.16 - o.mouth * 0.03;
  const bl = ((t + sd * 1.7) % (nerv ? 1.6 : 3.7)) < 0.12; for (const e of P.eyes) e.scale.y = bl ? 0.012 : 0.085;
  for (const b of P.brows) b.position.y = 0.135 + (nerv ? 0.025 : 0) + o.mouth * 0.012;
}
const PEOPLE = {}; for (const id in EV.cast) if (!EV.cast[id].offscreen) PEOPLE[id] = makePerson(Object.assign({ seed: Object.keys(PEOPLE).length * 3 + 1 }, EV.cast[id].look || {}));

// ---------------------------------------------------------------- PRODUCT GENERATOR (from params: kind, shape, size, color, material, features…)
function matFor(kind, color, extra = {}) {
  const P = { color, ...({ aluminum: { metalness: 1, roughness: .3 }, titanium: { metalness: 1, roughness: .45 }, chrome: { metalness: 1, roughness: .06 }, gold: { metalness: 1, roughness: .2 },
    glass: { metalness: .1, roughness: .04, clearcoat: 1 }, ceramic: { metalness: 0, roughness: .18, clearcoat: 1 }, matte: { metalness: 0, roughness: .85 }, rubber: { metalness: 0, roughness: 1 },
    fabric: { metalness: 0, roughness: 1, sheen: 1, sheenColor: '#ffffff' }, wood: { metalness: 0, roughness: .7 } }[kind] || { metalness: .2, roughness: .4 }), ...extra };
  return new THREE.MeshPhysicalMaterial(P);
}
function rrShape(w, h, r) { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; }
function screenGeo(w, h, r) { const g = new THREE.ShapeGeometry(rrShape(w, h, r), 6); const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5); return g; }
function uiTex(P, land) {
  const [w, h] = land ? [768, 512] : [384, 768];
  return ctex(w, h, (g) => {
    const c = P.screen || [BRAND.deep, BRAND.orange]; const gr = g.createLinearGradient(0, 0, w * .4, h); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    if ((P.features || []).includes('eyes')) { g.fillStyle = '#fff'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(w / 2 + s * w * .2, h * .45, w * .09, h * .1, 0, 0, 7); g.fill(); } g.fillStyle = '#111'; for (const s of [-1, 1]) { g.beginPath(); g.arc(w / 2 + s * w * .2, h * .47, w * .045, 0, 7); g.fill(); } return; }
    g.globalAlpha = .9; drawFruit(g, w / 2, h * .42, Math.min(w, h) * .16); g.globalAlpha = 1;
    g.fillStyle = 'rgba(255,255,255,.95)'; g.textAlign = 'center'; g.font = `300 ${Math.round(Math.min(w, h) * .16)}px PF`; g.fillText(P.screenText || '6:15', w / 2, h * .2);
    if (!land) for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.roundRect(w * .12 + (i % 4) * w * .2, h * .7 + Math.floor(i / 4) * w * .2, w * .14, w * .14, w * .04); g.fill(); }
  });
}
const scrMat = tex => new THREE.MeshPhysicalMaterial({ color: '#000000', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 1, roughness: .05, clearcoat: 1 });
const PRODUCTS = {};
function makeProduct(P) {
  const g = new THREE.Group(); const parts = []; const F = P.features || []; const kind = P.kind || 'slab'; const sz = P.size || 1, th = P.thickness || 1;
  const body = matFor(P.material || 'aluminum', P.color || '#c8c8d0'); const black = new THREE.MeshPhysicalMaterial({ color: '#08080a', roughness: .08, metalness: .3, clearcoat: 1 });
  const accent = matFor(P.accentMaterial || 'chrome', P.accent || '#d0d0d8');
  const add = (o, dir, parent = g) => { if (o.parent !== parent) parent.add(o); o.userData.base = o.position.clone(); o.userData.dir = V3(...dir); parts.push(o); o.castShadow = true; return o; };
  const feat = n => F.find(f => f === n || f.startsWith(n + ':')); const featN = (n, d) => { const f = feat(n); return f ? Number(f.split(':')[1] || d) : 0; };
  const DIM = { phone: [.75, 1.55, .085], tablet: [1.75, 2.35, .06], watch: [.42, .5, .11], slab: [1, 1.4, .1], cube: [.8, .8, .8], card: [.9, .56, .015] }[kind];
  let bw, bh, bd;
  if (DIM) {
    [bw, bh, bd] = [(P.w || DIM[0]) * sz, (P.h || DIM[1]) * sz, (P.d || DIM[2]) * sz * th]; const r = Math.min(bd * .49, Math.min(bw, bh) * (kind === 'watch' ? .25 : .12));
    add(mesh(new RoundedBoxGeometry(bw, bh, bd, 5, r), body), [0, 0, -0.6]);
    if (kind !== 'cube' || feat('screen')) {
      const scr = mesh(screenGeo(bw - r * .5 - .02, bh - r * .5 - .02, r * .8), scrMat(uiTex(P, bw > bh)), 0, 0, bd / 2 + .002); add(scr, [0, 0, 1.0]);
      if (feat('notch')) add(mesh(new THREE.CapsuleGeometry(bw * .04, bw * .14, 4, 8).rotateZ(Math.PI / 2), black, 0, bh / 2 - r - .05, bd / 2 + .004), [0, 0, 1.0]);
    }
    const nc = featN('camera', 2) || (kind === 'phone' || kind === 'tablet' ? 2 : 0);
    if (nc) { const cols = Math.ceil(Math.sqrt(nc)), rows = Math.ceil(nc / cols), lr = Math.min(bw, bh) * (nc > 4 ? .06 : .09); const mw = cols * lr * 2.6, mh = rows * lr * 2.6;
      const cm = new THREE.Group(); cm.position.set(-bw / 2 + mw / 2 + bw * .08, bh / 2 - mh / 2 - bw * .08, -bd / 2); g.add(cm); add(cm, [0, 0, -1.3]);
      mesh(new RoundedBoxGeometry(mw, mh, bd * .5, 3, Math.min(mw, mh) * .2), body, 0, 0, -bd * .1, cm);
      for (let i = 0; i < nc; i++) { const x = (i % cols - (cols - 1) / 2) * lr * 2.4, y = -(Math.floor(i / cols) - (rows - 1) / 2) * lr * 2.4; mesh(new THREE.CylinderGeometry(lr, lr, bd * .3, 20).rotateX(Math.PI / 2), black, x, y, -bd * .45, cm); mesh(new THREE.TorusGeometry(lr, lr * .14, 6, 20), accent, x, y, -bd * .55, cm); } }
    const lg = mesh(new THREE.PlaneGeometry(bw * .22, bw * .22), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }), 0, 0, -bd / 2 - .003); lg.rotation.y = Math.PI; add(lg, [0, 0, -0.6]);
    if (kind === 'phone') for (const y of [.2, .35]) add(box(.02, .12 * sz, .025, accent, bw / 2 + .006, bh * y, 0), [1, 0, 0]);
    if (kind === 'watch') { const band = matFor(P.bandMaterial || 'rubber', P.band || '#2a2a30'); for (const s of [-1, 1]) add(mesh(new RoundedBoxGeometry(bw * .78, bh * 1.1, bd * .4, 3, bd * .15), band, 0, s * (bh * .5 + bh * .5), -bd * .15), [0, s * .8, 0]);
      add(mesh(new THREE.CylinderGeometry(.035, .035, .05, 16).rotateZ(Math.PI / 2), accent, bw / 2 + .02, bh * .15, 0), [1, 0, 0]); }
  } else if (kind === 'laptop') {
    bw = 2.1 * sz; bd = 1.45 * sz; bh = .07 * sz * th; const open = (P.open ?? 110) * Math.PI / 180;
    add(mesh(new RoundedBoxGeometry(bw, bh, bd, 4, bh * .45), body, 0, 0, 0), [0, -0.5, 0]);
    const kb = ctex(512, 256, (c, w, h) => { c.fillStyle = '#1b1b1f'; c.fillRect(0, 0, w, h); c.fillStyle = '#2e2e34'; for (let y = 0; y < 6; y++) for (let x = 0; x < 14; x++) c.fillRect(6 + x * 36, 6 + y * 41, 30, 34); });
    add(mesh(new THREE.PlaneGeometry(bw * .86, bd * .42).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: kb, roughness: .7 }), 0, bh / 2 + .002, -bd * .14), [0, 0.6, 0]);
    add(mesh(new THREE.PlaneGeometry(bw * .3, bd * .22).rotateX(-Math.PI / 2), M('#9a9aa2', .25, .6), 0, bh / 2 + .002, bd * .28), [0, 0.6, 0]);
    const lid = new THREE.Group(); lid.position.set(0, bh / 2, -bd / 2); lid.rotation.x = -(open - Math.PI / 2); g.add(lid); add(lid, [0, 0.9, -0.6]);
    mesh(new RoundedBoxGeometry(bw, bd, bh * .6, 4, bh * .25), body, 0, bd / 2, 0, lid);
    const scr = mesh(screenGeo(bw * .93, bd * .9, .03), scrMat(uiTex(P, true)), 0, bd / 2, bh * .31, lid);
    const lg = mesh(new THREE.PlaneGeometry(bw * .14, bw * .14), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true }), 0, bd / 2, -bh * .31, lid); lg.rotation.y = Math.PI;
    bh = bd * .8;
  } else if (kind === 'earbuds') {
    bw = .7 * sz; bh = .55 * sz; bd = .3 * sz; const r = bd * .45;
    add(mesh(new RoundedBoxGeometry(bw, bh * .7, bd, 5, r), body, 0, -bh * .15, 0), [0, -0.6, 0]);
    add(mesh(new RoundedBoxGeometry(bw, bh * .3, bd, 5, r * .9), body, 0, bh * .28, 0), [0, 0.3, -0.4]);
    for (const s of [-1, 1]) { const b = new THREE.Group(); b.position.set(s * bw * .22, bh * .75, 0); g.add(b); mesh(new THREE.SphereGeometry(bw * .14, 20, 14), body, 0, 0, 0, b); mesh(new THREE.CylinderGeometry(bw * .045, bw * .04, bw * .4, 12), body, 0, -bw * .22, bw * .04, b); mesh(new THREE.SphereGeometry(bw * .08, 12, 8), black, 0, 0, bw * .11, b); b.rotation.z = s * .3; add(b, [s * 1.2, 1.0, 0]); }
    bh = bh * 1.6;
  } else { // freeform weird devices
    const geo = { orb: () => new THREE.SphereGeometry(.5, 48, 32), pebble: () => new THREE.SphereGeometry(.5, 48, 32).scale(1.2, .55, .9), stick: () => new THREE.CapsuleGeometry(.1, 1.2, 8, 24), cylinder: () => new THREE.CylinderGeometry(.38, .38, .9, 48),
      pyramid: () => new THREE.ConeGeometry(.6, .9, 4).rotateY(Math.PI / 4), donut: () => new THREE.TorusGeometry(.4, .16, 24, 64), egg: () => new THREE.SphereGeometry(.45, 48, 32).scale(1, 1.3, 1), fruit: () => new THREE.SphereGeometry(.5, 48, 32), cone: () => new THREE.ConeGeometry(.45, 1.1, 48) }[P.shape || 'orb'] || (() => new THREE.SphereGeometry(.5, 48, 32));
    const gg = geo(); gg.scale(sz * (P.w || 1), sz * (P.h || 1), sz * (P.d || 1) * th); add(mesh(gg, body), [0, 0, -0.4]);
    gg.computeBoundingBox(); const bb = gg.boundingBox; bw = bb.max.x - bb.min.x; bh = bb.max.y - bb.min.y; bd = bb.max.z - bb.min.z;
    if (P.shape === 'fruit') { add(mesh(new THREE.CylinderGeometry(.015, .025, .14, 8), M('#5a3b1c', .8), 0, bh / 2 + .05, 0), [0, 1.2, 0]); const lf = mesh(new THREE.SphereGeometry(.16, 16, 8).scale(1.6, .12, .6), M(BRAND.green, .5), .2, bh / 2 + .1, 0); lf.rotation.z = .5; add(lf, [.3, 1.2, 0]); }
    if (feat('screen') || feat('eyes')) { const sw = bw * .62, shh = bh * .45; const scr = mesh(screenGeo(sw, shh, Math.min(sw, shh) * .2), scrMat(uiTex(P, sw > shh)), 0, 0, bd / 2 + .01); add(scr, [0, 0, 1]); }
    const nc = featN('camera', 1); if (nc) { const cols = Math.ceil(Math.sqrt(nc)), rows = Math.ceil(nc / cols), lr = Math.min(bw, bh) * .055, mw = cols * lr * 2.7, mh = rows * lr * 2.7;
      const cm = new THREE.Group(); cm.position.set(feat('screen') ? bw * .3 : 0, bh * .18, bd / 2 - .02); g.add(cm); add(cm, [0, 0, 1.3]); mesh(new RoundedBoxGeometry(mw, mh, .08, 3, Math.min(mw, mh) * .25), black, 0, 0, 0, cm);
      for (let i = 0; i < nc; i++) { const x = (i % cols - (cols - 1) / 2) * lr * 2.4, y = -(Math.floor(i / cols) - (rows - 1) / 2) * lr * 2.4; mesh(new THREE.CylinderGeometry(lr, lr, .05, 20).rotateX(Math.PI / 2), black, x, y, .03, cm); mesh(new THREE.TorusGeometry(lr, lr * .16, 6, 20), accent, x, y, .055, cm); } }
  }
  // generic add-on features (work on every kind)
  const top = bh / 2, bot = -bh / 2;
  const nl = featN('legs', 4); for (let i = 0; i < nl; i++) { const a = (i + .5) / nl * Math.PI * 2; const L = mesh(new THREE.CylinderGeometry(.025, .02, .3 * sz, 8), accent, Math.cos(a) * bw * .3, bot - .13 * sz, Math.sin(a) * bd * .3); add(L, [Math.cos(a), -1, Math.sin(a)]); add(mesh(new THREE.SphereGeometry(.04, 8, 6), black, L.position.x, bot - .28 * sz, L.position.z), [Math.cos(a), -1.3, Math.sin(a)]); }
  if (feat('antenna')) { add(mesh(new THREE.CylinderGeometry(.012, .012, .5 * sz, 8), accent, bw * .25, top + .25 * sz, 0), [0, 1, 0]); add(mesh(new THREE.SphereGeometry(.04, 12, 8), M(P.glow || '#ff3355', .3, 0, { emissive: P.glow || '#ff3355', emissiveIntensity: 2 }), bw * .25, top + .5 * sz, 0), [0, 1.4, 0]); }
  if (feat('handle')) add(mesh(new THREE.TorusGeometry(bw * .25, .03 * sz, 8, 24, Math.PI), accent, 0, top, 0), [0, 1, 0]);
  if (feat('propeller')) { const pr = new THREE.Group(); pr.position.y = top + .12 * sz; g.add(pr); mesh(new THREE.CylinderGeometry(.02, .02, .2 * sz, 8), accent, 0, -.06, 0, pr); for (const s of [0, Math.PI]) { const b = box(bw * .9, .01, .08, accent, 0, .04, 0, pr); b.rotation.y = s; } pr.userData.spin = true; add(pr, [0, 1.5, 0]); }
  if (feat('wheels')) for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(mesh(new THREE.CylinderGeometry(.09 * sz, .09 * sz, .05, 20).rotateZ(Math.PI / 2), black, x * (bw / 2 + .02), bot + .02, z * bd * .3), [x, -.6, z * .3]);
  if (feat('glow')) add(mesh(new THREE.TorusGeometry(Math.max(bw, bd) * .53, .015, 8, 64).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.glow || BRAND.orange, toneMapped: false }), 0, 0, 0), [0, 0.2, 0]);
  if (feat('button')) add(mesh(new THREE.CylinderGeometry(Math.min(bw, bh) * .14, Math.min(bw, bh) * .14, .06, 32).rotateX(Math.PI / 2), M(P.buttonColor || '#e8322f', .3), 0, -bh * .18, bd / 2 + .02), [0, 0, 1.4]);
  if (feat('crown') && kind !== 'watch') add(mesh(new THREE.CylinderGeometry(.04, .04, .06, 16).rotateZ(Math.PI / 2), accent, bw / 2 + .03, bh * .15, 0), [1, 0, 0]);
  if (feat('fins')) for (let i = 0; i < 7; i++) add(box(bw * .6, .1 * sz, .012, accent, 0, top + .04, -bd * .3 + i * bd * .1), [0, 1 + i * .05, 0]);
  if (feat('halo')) add(mesh(new THREE.TorusGeometry(Math.max(bw, bd) * .4, .012, 8, 64).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: P.glow || '#ffe9a0', toneMapped: false }), 0, top + .2 * sz, 0), [0, 1.5, 0]);
  if (feat('tail')) add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0, bot, 0), V3(.1, bot - .25, .1), V3(.35, bot - .3, -.1), V3(.6, bot - .28, .1)]), 24, .015, 6), M('#f2f2f2', .6)), [0, -1, 0]);
  if (feat('spout')) add(mesh(new THREE.CylinderGeometry(.03, .06, .4 * sz, 12).rotateZ(-0.9), accent, bw / 2 + .12, bh * .1, 0), [1.2, .4, 0]);
  if (feat('strap')) add(mesh(new THREE.TorusGeometry(Math.max(bw, bh) * .62, .03, 6, 40), matFor('rubber', P.band || '#202024')), [0, 0, -0.5]);
  const R = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere()).radius || 1;
  // internals for the exploded view
  const ib = Math.min(bw, bh, 3) * .32; add(box(ib * 1.6, ib * 1.8, .015 * R + .01, M('#1f6b3a', .5, .2), 0, 0, 0), [0, 0, .45]).visible = false;
  add(box(ib * 1.4, ib * 1.2, .03 * R + .01, M('#b9bcc4', .35, .8), 0, -ib * .3, 0), [0, 0, -.15]).visible = false;
  for (let i = 0; i < 4; i++) add(box(ib * .25, ib * .25, .02 * R + .01, M('#111', .4, .4), -ib * .45 + i * ib * .3, ib * .5, .01), [0, 0, .6]).visible = false;
  parts.forEach(o => { if (!o.visible) o.userData.internal = true; });
  const pr = { g, parts, R, P, kind }; g.visible = false; scene.add(g); return pr;
}
function getProduct(id, color) { const key = id + (color || ''); if (!PRODUCTS[key]) { const P = EV.products[id]; if (!P) throw new Error('unknown product ' + id); PRODUCTS[key] = makeProduct(color ? { ...P, color } : P); } return PRODUCTS[key]; }
function explode(pr, k, t) { // k: 0 = assembled, 1 = fully exploded (internals only show while exploded)
  const E = pr.R * 1.1;
  for (const o of pr.parts) { o.position.copy(o.userData.base).addScaledVector(o.userData.dir, E * k); if (o.userData.internal) o.visible = k > 0.02; if (o.userData.spin) o.rotation.y = t * 9; }
}

// 3D logo fruit for logo/end shots
const LOGO3D = new THREE.Group(); { mesh(new THREE.SphereGeometry(.6, 64, 40), new THREE.MeshPhysicalMaterial({ color: BRAND.purple, roughness: .32, clearcoat: .6 }), 0, 0, 0, LOGO3D); mesh(new THREE.SphereGeometry(.25, 16, 10).scale(1.6, .28, .7), M(BRAND.green, .45), .22, .62, 0, LOGO3D).rotation.z = .4; mesh(new THREE.CylinderGeometry(.02, .03, .14, 8), M('#5a3b1c', .8), 0, .62, 0, LOGO3D); LOGO3D.visible = false; scene.add(LOGO3D); }
const pedestal = mesh(new THREE.CylinderGeometry(.35, .4, 1.05, 32), M('#f5f5f5', .4), 0, .525, 0); scene.add(pedestal); pedestal.visible = false;

// ---------------------------------------------------------------- paths + camera library
function pathAt(path, d) { // ping-pong along a polyline; returns position + heading yaw
  const seglen = []; let L = 0; for (let i = 1; i < path.length; i++) { const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2]); seglen.push(l); L += l; }
  let x = d % (2 * L); const back = x > L; if (back) x = 2 * L - x;
  for (let i = 0; i < seglen.length; i++) { if (x <= seglen[i] || i === seglen.length - 1) { const k = x / seglen[i], a = path[i], b = path[i + 1]; const dx = b[0] - a[0], dz = b[2] - a[2]; return { p: V3(lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)), yaw: Math.atan2(back ? -dx : dx, back ? -dz : dz) }; } x -= seglen[i]; }
}
const fwd = yaw => V3(Math.sin(yaw), 0, Math.cos(yaw)); const side = yaw => V3(Math.cos(yaw), 0, -Math.sin(yaw));
const FLY = new THREE.CatmullRomCurve3([V3(-260, 120, 330), V3(-120, 80, 160), V3(30, 55, 120), V3(60, 40, 40), V3(40, 26, -20), V3(-10, 22, 30), V3(-12, 8, 96), V3(0, 3.5, 82)]);
const FLYL = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, 5, 0), V3(10, 6, 0), V3(0, 6, -20), V3(-20, 4, 0), V3(-10, 4, 60), V3(-9, 3, 72), V3(0, 2, 63)]);
function handheld(t, a = 1) { return V3(n1(t * .7) * .03 * a, n1(t * .6 + 9) * .02 * a, n1(t * .5 + 19) * .02 * a); }

// ---------------------------------------------------------------- timeline helpers
const SHOTS = TL.shots; const SEGSTART = {}, SEGEND = {}; for (const s of SHOTS) { SEGSTART[s.si] ??= s.start; SEGEND[s.si] = s.end; }
const PRODUCT_SHOTS = new Set(['spin', 'hero', 'explode', 'macro', 'lineup', 'tagline', 'price']), CARD_SHOTS = new Set(['title', 'onemore']);
const LT = {}; // lower thirds: first on-screen spoken shot per cast member
for (const s of SHOTS) { const sh = s.shot; if (!s.who || LT[s.who] || !PEOPLE[s.who] || PRODUCT_SHOTS.has(sh) || CARD_SHOTS.has(sh) || ['flyover', 'logo', 'end', 'wide'].includes(sh)) continue; const c = TL.cues.find(c => c.shot === SHOTS.indexOf(s)); if (c) LT[s.who] = c.start + 0.4; }
function findShot(t) { let lo = 0, hi = SHOTS.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (SHOTS[m].start <= t) lo = m; else hi = m - 1; } return lo; }

let curSet = null;
function useSet(name) {
  if (curSet !== name) { for (const k in SETS) SETS[k].g.visible = k === name; curSet = name; }
  const L = SETS[name].look; skyMat.uniforms.top.value.set(L.top); skyMat.uniforms.bot.value.set(L.bot); skyMat.uniforms.sunCol.value.set(L.sunCol); skyMat.uniforms.sunDir.value.set(...L.sunDir);
  sun.color.set(L.sun[0]); sun.intensity = L.sun[1]; hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2];
  scene.fog.color.set(L.fog[0]); scene.fog.near = L.fog[1]; scene.fog.far = L.fog[2]; scene.environmentIntensity = L.env; renderer.toneMappingExposure = L.exp;
  const S = sun.shadow.camera; S.left = S.bottom = -L.shadow; S.right = S.top = L.shadow; S.updateProjectionMatrix();
  return SETS[name];
}
function placeSun(set, focus) { const d = V3(...set.look.sunDir).normalize(); const dd = d.y < .25 ? V3(d.x, .35, d.z).normalize() : d; sun.position.copy(focus).addScaledVector(dd, 120); sun.target.position.copy(focus); }

// ---------------------------------------------------------------- per-frame scene setup
function setupPeople(t, si, S, B) {
  const seg = EV.segments[si]; const set = SETS[seg.location]; const pres = (seg.presenters || []).filter(id => PEOPLE[id]); const out = {};
  pres.forEach((id, k) => {
    const P = PEOPLE[id]; P.root.visible = true; let pos, yaw, walk = null;
    if (seg.walk && set.path) { const d = (t - SEGSTART[si]) * 1.05 + (seg.walkStart || 0); const w = pathAt(set.path, d); yaw = w.yaw; pos = w.p.clone().addScaledVector(side(yaw), -k * 1.0).addScaledVector(fwd(yaw), -k * .15); walk = d * 3.4; }
    else { const m = (seg.marks && seg.marks[k]) || set.marks[k % set.marks.length]; pos = V3(m[0], m[1], m[2]); yaw = m[3]; }
    P.root.position.copy(pos); P.root.rotation.y = yaw;
    const hold = (S.shot === 'demo' && S.who === id) || (B.hold && S.who === id);
    posePerson(P, t, { walk, mouth: mouthAt(t, id), hold, lookYaw: pres.length > 1 && !mouthAt(t, id) && S.who && S.who !== id ? (k === 0 ? -0.4 : 0.4) : 0 });
    out[id] = { P, pos, yaw, hold };
  });
  return out;
}
function personCam(type, u, t, ppl, who, set, bi) {
  const ids = Object.keys(ppl); const me = ppl[who] || ppl[ids[0]]; if (!me) { const w = set.wide; return { p: V3(...w[0]), l: V3(...w[1]), fov: w[2] }; }
  const hgt = (me.P.L.height || 1); const head = me.pos.y + 2.08 * hgt; const f = fwd(me.yaw), s = side(me.yaw); const hh = handheld(t);
  const at = (dist, sx, dy, fov, ly = -.1, lx = .15) => ({ p: me.pos.clone().addScaledVector(f, dist).addScaledVector(s, sx).setY(head + dy).add(hh), l: me.pos.clone().addScaledVector(s, sx * lx).setY(head + ly), fov });
  if (type === 'walk') return at(4.0, .45, -.1, 32, -.4);
  if (type === 'close') return at(3.0 - u * .15, .35 * (bi % 2 ? 1 : -1), -.05, 24, -.15);
  if (type === 'demo') { const c = at(2.1, .5, -.25, 28, -.55, .3); if (me.hold) c.l = me.P.arms[1].hand.getWorldPosition(V3()).lerp(V3(me.pos.x, head - .1, me.pos.z), .4); return c; }
  if (type === 'table') { const c = at(3.7, 1.2, -.3, 32, -.6, .5); return c; }
  if (type === 'two' && ids.length > 1) { const a = ppl[ids[0]].pos, b = ppl[ids[1]].pos; const m = a.clone().add(b).multiplyScalar(.5); const d = a.distanceTo(b); return { p: m.clone().addScaledVector(f, 3.4 + d * 1.1).addScaledVector(s, .3).setY(head).add(hh), l: m.clone().setY(head - .25), fov: 34 }; }
  if (type === 'wide') { const w = set.wide; const p = V3(...w[0]).lerp(V3(...w[1]), u * .06); return { p, l: V3(...w[1]).lerp(me.pos.clone().setY(head - .4), .5), fov: w[2] }; }
  const ang = [[4.2, 1.0, 28], [3.7, -.85, 27], [5.6, 2.6, 30], [3.9, .25, 26]][bi % 4];
  return at(ang[0] * (1 - u * .07), ang[1], -.1, ang[2], -.4);
}
function productStage(t, u, S, B) {
  useSet('studio'); const id = B.product || (B.products || [])[0];
  const K = STUDIO; K.key.intensity = 38; K.rimL.intensity = 90; K.rimR.intensity = 70; sweep.intensity = 0;
  if (!id) return { p: V3(0, 1.3, 5), l: V3(0, 1.2, 0), fov: 30 };
  if (S.shot === 'lineup') {
    const list = B.products ? B.products.map(p => getProduct(p)) : (EV.products[id].colors || [EV.products[id].color]).map(c => getProduct(id, c));
    const n = list.length, sp = 1.25; list.forEach((pr, i) => { pr.g.visible = true; explode(pr, 0, t); const sc = .55 / pr.R; pr.g.scale.setScalar(sc); pr.g.position.set((i - (n - 1) / 2) * sp, 1.15 + .04 * Math.sin(t * 1.3 + i), 0); pr.g.rotation.set(0, -0.5 + .25 * Math.sin(t * .4 + i * .7), 0); });
    const w = (n - 1) * sp; return { p: V3(lerp(-w * .25, w * .25, u), 1.45, 2.4 + w * .65), l: V3(lerp(-w * .1, w * .1, u), 1.15, 0), fov: 34 };
  }
  const pr = getProduct(id); pr.g.visible = true; const sc = .55 / pr.R * (B.scale || 1); pr.g.scale.setScalar(sc);
  pr.g.position.set(0, 1.2, 0); pr.g.rotation.set(0, 0, 0); let ek = 0;
  let cam = { p: V3(0, 1.32, 2.6), l: V3(0, 1.2, 0), fov: 30 };
  const sh = S.shot;
  if (sh === 'spin') { pr.g.rotation.set(-0.12, -1.1 + u * 2.6 + (B.spin || 0), 0.05); cam = { p: V3(Math.sin(u * .6 - .3) * 2.6, 1.3 + u * .15, Math.cos(u * .6 - .3) * 2.6), l: V3(0, 1.2, 0), fov: 30 }; sweep.intensity = 25; sweep.position.set(lerp(-2.2, 2.2, u), 1.9, 1.3); }
  if (sh === 'hero') { const k = ss(seg(u, 0, .45)); pr.g.position.y = lerp(0.35, 1.2, k); pr.g.rotation.y = lerp(-2.4, -0.25, ss(u)); K.key.intensity = 60 * k; K.rimL.intensity = 90 * ss(seg(u, .1, .5)); K.rimR.intensity = 70 * ss(seg(u, .2, .6)); cam = { p: V3(0, lerp(.9, 1.35, ss(u)), lerp(3.2, 2.4, ss(u))), l: V3(0, pr.g.position.y, 0), fov: 30 }; }
  if (sh === 'explode') { ek = ss(seg(u, .12, .5)) * (1 - ss(seg(u, .82, 1))); pr.g.rotation.set(-0.25, -1.25 + u * .45, 0); const a = -0.6 + u * .5; cam = { p: V3(Math.sin(a) * 3.6, 1.6, Math.cos(a) * 3.6), l: V3(0, 1.2, 0), fov: 32 }; }
  if (sh === 'macro') { pr.g.rotation.set(-0.3, 0.6 + u * .3, 0.1); const a = lerp(-0.9, 0.5, u); cam = { p: V3(Math.sin(a) * .95, 1.42, Math.cos(a) * .95), l: V3(Math.sin(a) * .2, 1.25, 0), fov: 22 }; sweep.intensity = 14; sweep.position.set(lerp(1.5, -1.5, u), 1.6, .9); }
  if (sh === 'tagline') { pr.g.rotation.set(-0.1, -0.4 + u * .5, 0); K.key.intensity = 25; cam = { p: V3(0, 1.15, 3.8 - u * .3), l: V3(0, 1.3, 0), fov: 30 }; pr.g.position.y = 0.88; pr.g.scale.multiplyScalar(.8); }
  if (sh === 'price') { pr.g.rotation.set(-0.08, -0.5 + u * .6, 0); cam = { p: V3(-1.05, 1.25, 3.0), l: V3(-1.05, 1.2, 0), fov: 30 }; }
  if (B.back) pr.g.rotation.y += Math.PI;
  explode(pr, ek, t);
  return cam;
}

// ---------------------------------------------------------------- 2D compositor
const out = document.createElement('canvas'); out.width = W; out.height = H; document.body.appendChild(out); const ctx = out.getContext('2d');
const F = (s, w = 600) => `${w} ${s}px PF, "DejaVu Sans", sans-serif`;
function txt(s, x, y, size, color = '#fff', w = 600, align = 'center', ls = 0) { ctx.font = F(size, w); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.letterSpacing = ls + 'px'; ctx.fillStyle = color; ctx.fillText(s, x, y); ctx.letterSpacing = '0px'; }
function gradText(s, x, y, size, a, w = 700, cols = ['#ffffff', '#e9d6ff', '#ffc89a']) {
  ctx.save(); ctx.globalAlpha = a; ctx.font = F(size, w); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = (-size * .02) + 'px';
  const m = ctx.measureText(s).width; const gr = ctx.createLinearGradient(x - m / 2, 0, x + m / 2, 0); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c));
  ctx.shadowColor = 'rgba(190,120,255,.55)'; ctx.shadowBlur = 30; ctx.fillStyle = gr; ctx.fillText(s, x, y); ctx.shadowBlur = 0; ctx.fillText(s, x, y); ctx.restore();
}
function wrap(s, maxw, size, w) { ctx.font = F(size, w); const words = s.split(' '); const lines = []; let cur = ''; for (const wd of words) { const tt = cur ? cur + ' ' + wd : wd; if (ctx.measureText(tt).width > maxw && cur) { lines.push(cur); cur = wd; } else cur = tt; } if (cur) lines.push(cur); return lines; }
function fadeIO(t, a, b, fi = .4, fo = .4) { return ss(seg(t, a, a + fi)) * (1 - ss(seg(t, b - fo, b))); }
function drawSubtitle(t) {
  const c = TL.cues.find(c => t >= c.start - .05 && t < c.end + .2); if (!c) return;
  const lines = wrap(c.text, 980, 24, 600); const per = 2; const n = Math.ceil(lines.length / per); const k = Math.min(n - 1, Math.floor(clamp((t - c.start) / (c.end - c.start + .01), 0, .999) * n));
  const chunk = lines.slice(k * per, k * per + per); chunk.forEach((l, i) => { const y = H - 64 - (chunk.length - 1 - i) * 32; ctx.font = F(24, 600); const w = ctx.measureText(l).width; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(W / 2 - w / 2 - 12, y - 16, w + 24, 32, 6); ctx.fill(); txt(l, W / 2, y + 1, 24, '#fff', 600); });
}
function drawLowerThird(t) {
  for (const id in LT) { const a = LT[id], b = a + 4.6; if (t < a || t > b) continue; const k = fadeIO(t, a, b, .5, .5); const c = EV.cast[id];
    ctx.save(); ctx.globalAlpha = k; const x = 70 - (1 - k) * 30, y = H - 190;
    const gr = ctx.createLinearGradient(x, 0, x + 260, 0); gr.addColorStop(0, BRAND.purple); gr.addColorStop(1, BRAND.orange); ctx.fillStyle = gr; ctx.fillRect(x, y - 30, 4, 62);
    txt(c.name, x + 18, y - 10, 30, '#fff', 600, 'left'); txt(c.title || '', x + 18, y + 20, 19, 'rgba(255,255,255,.85)', 300, 'left'); ctx.restore(); }
}
function zoomBlur(k) { if (k <= 0.01) return; ctx.save(); for (let i = 1; i <= 4; i++) { const s = 1 + i * .035 * k; ctx.globalAlpha = .22 * k; ctx.drawImage(out, W / 2 - W * s / 2, H / 2 - H * s / 2, W * s, H * s); } ctx.restore(); ctx.fillStyle = `rgba(255,255,255,${.55 * k ** 3})`; ctx.fillRect(0, 0, W, H); }
function vignette(a) { const vg = ctx.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.0); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }

// ---------------------------------------------------------------- frame
window.renderAt = function (t) {
  const i = findShot(t), S = SHOTS[i], seg0 = EV.segments[S.si], B = seg0.beats[S.bi]; const u = clamp((t - S.start) / (S.end - S.start), 0, 1);
  for (const id in PEOPLE) PEOPLE[id].root.visible = false; for (const k in PRODUCTS) PRODUCTS[k].g.visible = false; LOGO3D.visible = false; pedestal.visible = false; sweep.intensity = 0;
  const sh = S.shot; let cam = null, set = null, focus = V3();
  if (CARD_SHOTS.has(sh)) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  else {
    if (sh === 'flyover') { set = useSet('campus'); const k = ss(u) * .85 + u * .15; cam = { p: FLY.getPoint(k), l: FLYL.getPoint(Math.min(1, k * 1.02)), fov: 42 }; focus.copy(cam.l); if (seg0.presenters) setupPeople(t, S.si, S, B); }
    else if (PRODUCT_SHOTS.has(sh)) { set = SETS.studio; cam = productStage(t, u, S, B); focus.set(0, 1.2, 0); }
    else if (sh === 'logo' || sh === 'end') { set = useSet('studio'); LOGO3D.visible = true; LOGO3D.position.set(0, 1.35 + (sh === 'end' ? .25 : 0), 0); LOGO3D.rotation.y = -1.2 + u * 1.6; const k = ss(seg(u, 0, .4)); STUDIO.key.intensity = 60 * k; STUDIO.rimL.intensity = 90 * k; STUDIO.rimR.intensity = 70 * k; cam = { p: V3(0, 1.4, lerp(4.2, 3.6, u)), l: V3(0, sh === 'end' ? 1.25 : 1.05, 0), fov: 30 }; }
    else {
      set = useSet(seg0.location || 'campus'); const ppl = setupPeople(t, S.si, S, B);
      if (sh === 'table' && B.product) { const me = ppl[S.who] || Object.values(ppl)[0]; const pp = me.pos.clone().addScaledVector(side(me.yaw), 1.15).addScaledVector(fwd(me.yaw), .25); pedestal.position.set(pp.x, me.pos.y + .525, pp.z); pedestal.visible = true; const pr = getProduct(B.product); explode(pr, 0, t); pr.g.visible = true; pr.g.scale.setScalar(.22 / pr.R); pr.g.position.set(pp.x, me.pos.y + 1.05 + .2, pp.z); pr.g.rotation.set(-.2, me.yaw + t * .4, 0); }
      if (B.product && (sh === 'demo' || B.hold)) { const me = ppl[S.who] || Object.values(ppl)[0]; me.P.root.updateMatrixWorld(true); const pr = getProduct(B.product); explode(pr, 0, t); pr.g.visible = true; pr.g.scale.setScalar((EV.products[B.product].handSize || .13) / pr.R); const hp = me.P.arms[1].hand.getWorldPosition(V3()); pr.g.position.copy(hp).addScaledVector(fwd(me.yaw), .06); pr.g.position.y += .05; pr.g.rotation.set(-.25, me.yaw + .35 * Math.sin(t * .5), 0); }
      cam = personCam(sh, u, t, ppl, S.who, set, S.bi + S.si); focus.copy(cam.l);
      if (set === SETS.theater) drawScreen(B.screen ?? seg0.screen ?? '');
    }
    if (set.update) set.update(t);
    // fly-through transition: push the camera through at segment boundaries
    const nb = SEGEND[S.si], pb = SEGSTART[S.si]; const ko = S.si < EV.segments.length - 1 ? ss(seg(t, nb - .55, nb)) : 0, ki = S.si > 0 ? 1 - ss(seg(t, pb, pb + .55)) : 0;
    const dir = cam.l.clone().sub(cam.p); cam.p.addScaledVector(dir, .45 * ko * ko - .25 * ki * ki);
    camera.position.copy(cam.p); camera.lookAt(cam.l); camera.fov = cam.fov; camera.updateProjectionMatrix(); skyDome.position.copy(cam.p);
    placeSun(set, focus);
    renderer.render(scene, camera);
    ctx.drawImage(renderer.domElement, 0, 0, W, H);
    zoomBlur(Math.max(ko, ki));
    vignette(set === SETS.studio ? .55 : .28);
  }
  // overlays
  const B2 = B; const a = fadeIO(t, S.start + .15, S.end, .6, .35);
  if (sh === 'flyover') { const bars = 70 * (1 - ss(seg(u, .9, 1))); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bars); ctx.fillRect(0, H - bars, W, bars); }
  if (sh === 'tagline' || (sh === 'title' && !B2.sub)) { const L = wrap(B2.text || '', 1100, 76, 700); const y0 = sh === 'tagline' ? H * .26 : H / 2 - (L.length - 1) * 44; L.forEach((l, j) => gradText(l, W / 2, y0 + j * 88, 76, a)); if (B2.sub) { ctx.save(); ctx.globalAlpha = a; txt(B2.sub, W / 2, y0 + (L.length - 1) * 88 + 64, 26, 'rgba(255,255,255,.8)', 300); ctx.restore(); } }
  else if (sh === 'title') { ctx.save(); ctx.globalAlpha = a; txt(B2.text, W / 2, H / 2 - 20, 58, '#fff', 600, 'center', -1); txt(B2.sub, W / 2, H / 2 + 38, 24, 'rgba(255,255,255,.7)', 300); ctx.restore(); }
  else if (sh === 'onemore') { const k = fadeIO(t, S.start + .8, S.end, 1.2, .5); ctx.save(); ctx.globalAlpha = k; txt(B2.text || 'One more thing…', W / 2, H / 2, 54, '#fff', 300, 'center', 1); ctx.restore(); }
  else if (sh === 'price') { const P = EV.products[B2.product]; ctx.save(); ctx.globalAlpha = a; txt(P.name, 120, H / 2 - 60, 54, '#fff', 600, 'left', -1); txt(B2.text || `From ${P.price}`, 120, H / 2 + 4, 34, '#ffd7b0', 300, 'left'); if (B2.sub || P.fine) txt(B2.sub || P.fine, 120, H / 2 + 52, 17, 'rgba(255,255,255,.55)', 300, 'left'); ctx.restore(); }
  else if (sh === 'logo' || sh === 'end') { const k = fadeIO(t, S.start + .8, S.end, .8, .8); ctx.save(); ctx.globalAlpha = k; txt('passionfruit', W / 2, H * .76, 54, '#fff', 300, 'center', 2); txt(B2.text || `Event ${EV.number}`, W / 2, H * .76 + 50, 22, 'rgba(255,255,255,.75)', 300, 'center', 3); if (B2.sub) txt(B2.sub, W / 2, H - 30, 13, 'rgba(255,255,255,.45)', 300); ctx.restore(); }
  else if (B2.text) { ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 20; txt(B2.text, W / 2, sh === 'flyover' ? H / 2 : H * .2, sh === 'flyover' ? 64 : 44, '#fff', sh === 'flyover' ? 300 : 600, 'center', sh === 'flyover' ? 3 : 0); if (B2.sub) txt(B2.sub, W / 2, (sh === 'flyover' ? H / 2 : H * .2) + 52, 22, 'rgba(255,255,255,.85)', 300); ctx.restore(); }
  if (!CARD_SHOTS.has(sh)) drawLowerThird(t);
  if (EV.subtitles !== false) drawSubtitle(t);
  const fi = 1 - ss(seg(t, 0, 1.2)), fo = ss(seg(t, TL.duration - 1.5, TL.duration)); if (fi + fo > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; ctx.fillRect(0, 0, W, H); }
  return out.toDataURL('image/jpeg', 0.9);
};
window.DURATION = TL.duration;
window.ready = true;
