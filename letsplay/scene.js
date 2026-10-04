// SHARDWILD — a fictional voxel survival game. Deterministic Let's Play renderer.
// window.renderAt(t) draws the frame for time t (seconds) and returns a JPEG data URL.
import * as THREE from '../node_modules/three/build/three.module.js';

const W = 1280, H = 720, FPS = 24;
const QP = new URLSearchParams(location.search); const AA = QP.get('aa') !== '0', SHADOW = Number(QP.get('sh') ?? 1024), RS = Number(QP.get('rs') ?? 1);
const E = await (await fetch('events.json')).json();
const CUES = await (await fetch('build/cues.json')).json();
const ENV = await (await fetch('build/env.json')).json();

// ---------------------------------------------------------------- utils
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ss = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const seg = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const backOut = t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const win = (t, a, b) => t >= a && t < b;
function rng(seed) { let s = seed | 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash2(x, z, s) { let h = Math.imul(x | 0, 374761393) + Math.imul(z | 0, 668265263) + Math.imul(s, 982451653); h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function vnoise(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi, s), b = hash2(xi + 1, zi, s), c = hash2(xi, zi + 1, s), d = hash2(xi + 1, zi + 1, s);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function shade(hex, f) { const c = new THREE.Color(hex); c.multiplyScalar(f); return '#' + c.getHexString(); }

// ---------------------------------------------------------------- textures
function ctex(size, draw, seed = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); draw(g, rng(seed), size);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; return t;
}
const noisy = cols => (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, y, 1, 1); } };
const TX = {};
TX.turfTop = ctex(16, (g, r, n) => { noisy(['#3cc2a3', '#35b597', '#46cfae', '#2fa88c', '#3cc2a3'])(g, r, n); for (let i = 0; i < 3; i++) { g.fillStyle = ['#ffe066', '#ffffff', '#ff9ecb'][i]; g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); } }, 3);
const soilCols = ['#8b5a3c', '#7a4e33', '#966545', '#6e452d'];
TX.soil = ctex(16, noisy(soilCols), 4);
TX.turfSide = ctex(16, (g, r, n) => { noisy(soilCols)(g, r, n); for (let x = 0; x < n; x++) { const d = 3 + Math.floor(r() * 3); for (let y = 0; y < d; y++) { g.fillStyle = r() < .5 ? '#3cc2a3' : '#33ad91'; g.fillRect(x, y, 1, 1); } } }, 5);
TX.stone = ctex(16, (g, r, n) => { noisy(['#6b7390', '#626a86', '#757d9a', '#5a6280'])(g, r, n); g.fillStyle = '#4a506a'; for (let i = 0; i < 5; i++) { const x = Math.floor(r() * 13), y = Math.floor(r() * 15); g.fillRect(x, y, 3, 1); } }, 6);
TX.dark = ctex(16, (g, r, n) => { noisy(['#3a3550', '#332f47', '#403b58', '#2c2940'])(g, r, n); g.fillStyle = '#25223a'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1); }, 7);
TX.ore = ctex(16, (g, r, n) => { noisy(['#3a3550', '#332f47', '#403b58'])(g, r, n); for (let i = 0; i < 7; i++) { g.fillStyle = r() < .5 ? '#5ff7ff' : '#ff6bf0'; g.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 2, 2); } }, 8);
TX.bark = ctex(16, (g, r, n) => { for (let x = 0; x < n; x++) { const base = ['#b5652e', '#a1572a', '#c27238', '#93501f'][Math.floor(r() * 4)]; for (let y = 0; y < n; y++) { g.fillStyle = r() < .15 ? shade(base, .8) : base; g.fillRect(x, y, 1, 1); } } }, 9);
TX.barkTop = ctex(16, (g, r, n) => { g.fillStyle = '#93501f'; g.fillRect(0, 0, n, n); g.fillStyle = '#e6b06a'; g.fillRect(2, 2, 12, 12); g.fillStyle = '#c98f4c'; g.fillRect(4, 4, 8, 8); g.fillStyle = '#e6b06a'; g.fillRect(6, 6, 4, 4); }, 10);
TX.leaf = ctex(16, (g, r, n) => { noisy(['#ff7fb6', '#ff95c4', '#e86aa2', '#ffb0d4', '#ff7fb6'])(g, r, n); g.fillStyle = '#c75289'; for (let i = 0; i < 8; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 11);
TX.plank = ctex(16, (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = r() < .2 ? '#d39b4c' : '#e0a95a'; g.fillRect(x, y, 1, 1); } g.fillStyle = '#9c6a2f'; for (let y = 3; y < n; y += 4) g.fillRect(0, y, n, 1); for (let y = 0; y < 4; y++) { g.fillRect(((y * 7) % 13) + 1, y * 4, 1, 3); } }, 12);
TX.slate = ctex(16, (g, r, n) => { noisy(['#6d4fb3', '#7a5cc0', '#5f43a0'])(g, r, n); g.fillStyle = '#4a3385'; for (let y = 3; y < n; y += 4) { g.fillRect(0, y, n, 1); for (let x = (y % 8 ? 2 : 6); x < n; x += 8) g.fillRect(x, y - 3, 1, 3); } }, 13);
TX.castle = ctex(16, (g, r, n) => { noisy(['#a7b1c9', '#9aa4bd', '#b3bdd3'])(g, r, n); g.fillStyle = '#6f7891'; for (let y = 0; y < n; y += 5) { g.fillRect(0, y, n, 1); for (let x = (y % 10 ? 3 : 8); x < n; x += 10) g.fillRect(x, y, 1, 5); } }, 14);
TX.glass = ctex(16, (g, r, n) => { g.clearRect(0, 0, n, n); g.fillStyle = 'rgba(170,235,255,0.28)'; g.fillRect(0, 0, n, n); g.fillStyle = 'rgba(255,255,255,0.95)'; g.fillRect(0, 0, n, 1); g.fillRect(0, n - 1, n, 1); g.fillRect(0, 0, 1, n); g.fillRect(n - 1, 0, 1, n); g.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 4; i++) g.fillRect(3 + i, 8 - i, 1, 1); g.fillRect(10, 4, 1, 1); }, 15);
TX.buzz = ctex(16, (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = ((x >> 2) + (y >> 2)) % 2 ? '#1c1c1c' : '#ffd400'; g.fillRect(x, y, 1, 1); } }, 16);
TX.jam = ctex(16, (g, r, n) => { noisy(['#e8344e', '#d42a43', '#f0485f'])(g, r, n); g.fillStyle = '#ffd1d9'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 2, 2); }, 17);
TX.jade = ctex(16, (g, r, n) => { noisy(['#4caf7a', '#43a06e', '#56bb85'])(g, r, n); g.fillStyle = '#2e7a52'; for (let y = 0; y < n; y += 4) { g.fillRect(0, y, n, 1); for (let x = (y % 8 ? 0 : 4); x < n; x += 8) g.fillRect(x, y, 1, 4); } }, 18);
TX.polka = ctex(16, (g, r, n) => { g.fillStyle = '#3d7bff'; g.fillRect(0, 0, n, n); g.fillStyle = '#ffffff'; for (let y = 1; y < n; y += 5) for (let x = (y % 2 ? 1 : 3); x < n; x += 5) g.fillRect(x, y, 2, 2); }, 19);
TX.sand = ctex(16, noisy(['#e8d28a', '#dfc77c', '#f0dc98']), 20);
TX.hut = ctex(16, (g, r, n) => { noisy(['#f1e1b0', '#e8d7a2', '#f6e9c0'])(g, r, n); g.fillStyle = '#c9b27a'; g.fillRect(0, 0, n, 1); g.fillRect(0, 0, 1, n); }, 21);
TX.hutRoof = ctex(16, (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = ((y >> 1) % 2) ? '#8e5cc4' : '#7b4bb0'; g.fillRect(x, y, 1, 1); } }, 22);
TX.path = ctex(16, noisy(['#c9a46a', '#bf9a60', '#d3ae75', '#b38d55']), 23);
TX.crop = ctex(16, (g, r, n) => { noisy(['#6b4a2e', '#5e4027'])(g, r, n); g.fillStyle = '#ffae00'; for (let x = 1; x < n; x += 4) g.fillRect(x, 0, 2, n); }, 24);

const GEO = new THREE.BoxGeometry(1, 1, 1);
const h_ = 0.5, UVQ = [[0, 0], [1, 0], [1, 1], [0, 1]];
const FACES = [
  { n: [1, 0, 0], v: [[h_, -h_, h_], [h_, -h_, -h_], [h_, h_, -h_], [h_, h_, h_]] },
  { n: [-1, 0, 0], v: [[-h_, -h_, -h_], [-h_, -h_, h_], [-h_, h_, h_], [-h_, h_, -h_]] },
  { n: [0, 1, 0], v: [[-h_, h_, h_], [h_, h_, h_], [h_, h_, -h_], [-h_, h_, -h_]] },
  { n: [0, -1, 0], v: [[-h_, -h_, -h_], [h_, -h_, -h_], [h_, -h_, h_], [-h_, -h_, h_]] },
  { n: [0, 0, 1], v: [[-h_, -h_, h_], [h_, -h_, h_], [h_, h_, h_], [-h_, h_, h_]] },
  { n: [0, 0, -1], v: [[h_, -h_, -h_], [-h_, -h_, -h_], [-h_, h_, -h_], [h_, h_, -h_]] }];
const lam = (map, o = {}) => new THREE.MeshLambertMaterial({ map, ...o });
const MAT = {
  turf: [lam(TX.turfSide), lam(TX.turfSide), lam(TX.turfTop), lam(TX.soil), lam(TX.turfSide), lam(TX.turfSide)],
  soil: lam(TX.soil), stone: lam(TX.stone), dark: lam(TX.dark),
  ore: lam(TX.ore, { emissive: '#ffffff', emissiveMap: TX.ore, emissiveIntensity: 0.25 }),
  log: [lam(TX.bark), lam(TX.bark), lam(TX.barkTop), lam(TX.barkTop), lam(TX.bark), lam(TX.bark)],
  leaf: lam(TX.leaf), plank: lam(TX.plank), slate: lam(TX.slate), castle: lam(TX.castle),
  glass: lam(TX.glass, { transparent: true, depthWrite: false, side: THREE.DoubleSide }),
  buzz: lam(TX.buzz), jam: lam(TX.jam), jade: lam(TX.jade), polka: lam(TX.polka), sand: lam(TX.sand),
  hut: lam(TX.hut), hutRoof: lam(TX.hutRoof), path: lam(TX.path), crop: lam(TX.crop),
};

// ---------------------------------------------------------------- voxel sets
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const G = 22; // gravity for debris
class VSet {
  constructor(parent, dynamic = false) { this.parent = parent; this.dyn = dynamic; this.items = {}; this.meshes = []; this.keys = new Map(); }
  add(x, y, z, type, o = {}) { const b = { x, y, z, type, ...o }; (this.items[type] ||= []).push(b); const k = x + ',' + y + ',' + z; if (!this.keys.has(k)) this.keys.set(k, []); this.keys.get(k).push(b); return b; }
  at(x, y, z) { return this.keys.get(x + ',' + y + ',' + z) || []; }
  build() {
    if (!this.dyn) return this.buildMerged();
    for (const [type, arr] of Object.entries(this.items)) {
      const m = new THREE.InstancedMesh(GEO, MAT[type], arr.length);
      m.castShadow = type !== 'glass'; m.receiveShadow = true; m.userData.arr = arr;
      if (this.dyn) m.frustumCulled = false;
      arr.forEach((b, i) => { _m.makeTranslation(b.x, b.y, b.z); m.setMatrixAt(i, _m); });
      for (const b of arr) if (b.fly && b.keep) { const y0 = b.y, vy = b.fly[1], fl = b.floor; b.tl = (vy + Math.sqrt(vy * vy + 2 * G * Math.max(0, y0 - fl))) / G; }
      this.parent.add(m); this.meshes.push(m);
    }
    return this;
  }
  buildMerged() {
    // face-culled voxel mesh: one BufferGeometry per material, hidden faces dropped
    const solid = new Set();
    for (const [type, arr] of Object.entries(this.items)) if (type !== 'glass') for (const b of arr) solid.add(b.x + ',' + b.y + ',' + b.z);
    const buckets = new Map();
    for (const [type, arr] of Object.entries(this.items)) for (const b of arr) for (let f = 0; f < 6; f++) {
      const F = FACES[f], nk = (b.x + F.n[0]) + ',' + (b.y + F.n[1]) + ',' + (b.z + F.n[2]);
      if (solid.has(nk) && !(type === 'glass' && false)) continue;
      const mat = Array.isArray(MAT[type]) ? MAT[type][f] : MAT[type];
      if (!buckets.has(mat)) buckets.set(mat, { p: [], n: [], uv: [] });
      const B = buckets.get(mat);
      for (const i of [0, 1, 2, 0, 2, 3]) { const v = F.v[i]; B.p.push(b.x + v[0], b.y + v[1], b.z + v[2]); B.n.push(...F.n); B.uv.push(...UVQ[i]); }
    }
    for (const [mat, B] of buckets) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(B.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(B.n, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(B.uv, 2));
      const m = new THREE.Mesh(geo, mat); m.castShadow = !mat.transparent; m.receiveShadow = true; this.parent.add(m); this.meshes.push(m);
    }
    return this;
  }
  update(t) {
    if (!this.dyn) return;
    for (const m of this.meshes) {
      const arr = m.userData.arr;
      for (let i = 0; i < arr.length; i++) {
        const b = arr[i]; let sc = 1, px = b.x, py = b.y, pz = b.z, rx = 0, ry = 0, rz = 0;
        if (b.t0 !== undefined) { if (t < b.t0) sc = 0; else { const k = (t - b.t0) / 0.2; if (k < 1) sc = Math.max(0, backOut(k)); } }
        if (b.wob && t > b.wob[0] && t < b.wob[1]) { const a = 0.06 * seg(t, b.wob[0], b.wob[1]) * (1 + b.y * 0.15); px += a * Math.sin(t * 47 + b.y * 0.7); pz += a * 0.6 * Math.cos(t * 39 + b.x); }
        if (b.t1 !== undefined && t >= b.t1) {
          if (!b.fly) sc = 0;
          else {
            let dt = t - b.t1; if (b.keep && dt > b.tl) dt = b.tl;
            const [vx, vy, vz] = b.fly;
            px += vx * dt; pz += vz * dt; py += vy * dt - 0.5 * G * dt * dt;
            if (!b.keep && py < (b.floor ?? -50)) py = b.floor;
            rx = b.spin[0] * dt; ry = b.spin[1] * dt; rz = b.spin[2] * dt;
            if (!b.keep) sc *= 1 - seg(t - b.t1, 1.4, 2.4);
          }
        }
        _p.set(px, py, pz); _q.setFromEuler(_e.set(rx, ry, rz)); _s.set(sc, sc, sc);
        _m.compose(_p, _q, _s); m.setMatrixAt(i, _m);
      }
      m.instanceMatrix.needsUpdate = true;
    }
  }
}

// ---------------------------------------------------------------- particles
const PMAX = 4000;
const partMesh = new THREE.InstancedMesh(GEO, new THREE.MeshBasicMaterial({ color: '#ffffff' }), PMAX);
partMesh.frustumCulled = false; partMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PMAX * 3), 3);
const BURSTS = [];
function burst(t, pos, o = {}) {
  const r = rng(Math.floor(t * 1000) + BURSTS.length * 77);
  const n = o.n ?? 20, cols = (o.colors || ['#ffffff']).map(c => new THREE.Color(c)), P = [];
  for (let i = 0; i < n; i++) {
    const th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1) * (o.hemi ? 0.5 : 1), sp = (o.speed ?? 4) * (0.4 + 0.6 * r());
    P.push({ v: [Math.sin(ph) * Math.cos(th) * sp * (o.spreadXZ ?? 1), Math.cos(ph) * sp * (o.upMul ?? 1) + (o.up ?? 2), Math.sin(ph) * Math.sin(th) * sp * (o.spreadXZ ?? 1)],
      o: [(r() - .5) * (o.jit ?? 0.3), (r() - .5) * (o.jit ?? 0.3), (r() - .5) * (o.jit ?? 0.3)], l: (o.life ?? 1) * (0.5 + 0.5 * r()), c: cols[Math.floor(r() * cols.length)], s: (o.size ?? 0.15) * (0.6 + 0.8 * r()) });
  }
  BURSTS.push({ t, pos, P, g: o.grav ?? 9, drag: o.drag ?? 0, life: o.life ?? 1, sec: o.sec });
}
function updateParticles(t) {
  let k = 0;
  for (const b of BURSTS) {
    const dt0 = t - b.t; if (dt0 < 0 || dt0 > b.life * 1.1) continue;
    for (const p of b.P) {
      if (dt0 > p.l || k >= PMAX) continue;
      const d = b.drag ? (1 - Math.exp(-b.drag * dt0)) / b.drag : dt0;
      _p.set(b.pos[0] + p.o[0] + p.v[0] * d, b.pos[1] + p.o[1] + p.v[1] * d - 0.5 * b.g * dt0 * dt0, b.pos[2] + p.o[2] + p.v[2] * d);
      const sc = p.s * (1 - Math.pow(dt0 / p.l, 2));
      _q.setFromEuler(_e.set(dt0 * 5, dt0 * 3, 0)); _s.set(sc, sc, sc); _m.compose(_p, _q, _s);
      partMesh.setMatrixAt(k, _m); partMesh.setColorAt(k, p.c); k++;
    }
  }
  partMesh.count = k; partMesh.instanceMatrix.needsUpdate = true; partMesh.instanceColor.needsUpdate = true;
}

// ---------------------------------------------------------------- renderer + world basics
const renderer = new THREE.WebGLRenderer({ antialias: AA, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(Math.round(W * RS), Math.round(H * RS), false);
renderer.shadowMap.enabled = SHADOW > 0; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 700);
const hemi = new THREE.HemisphereLight('#d6eeff', '#6a7a4a', 1.5); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1d6', 2.6); sun.castShadow = true;
sun.shadow.mapSize.set(SHADOW || 512, SHADOW || 512); Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 250 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02; scene.add(sun, sun.target);
scene.fog = new THREE.Fog('#cfefff', 70, 190);
scene.add(partMesh);
const skyCan = document.createElement('canvas'); skyCan.width = 2; skyCan.height = 256;
const skyTex = new THREE.CanvasTexture(skyCan); skyTex.colorSpace = THREE.SRGBColorSpace; scene.background = skyTex;
function setSky(top, bot) { const g = skyCan.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 2, 256); skyTex.needsUpdate = true; }
const basic = (c, o = {}) => new THREE.MeshBasicMaterial({ color: c, fog: false, ...o });
const sunMesh = new THREE.Mesh(new THREE.BoxGeometry(16, 16, 1), basic('#fff7c2'));
const sunGlow = new THREE.Mesh(new THREE.BoxGeometry(26, 26, 1), basic('#fff2a8', { transparent: true, opacity: 0.35 }));
const moonA = new THREE.Mesh(new THREE.BoxGeometry(34, 34, 1), basic('#7ff5e6'));
const moonB = new THREE.Mesh(new THREE.BoxGeometry(22, 22, 1), basic('#ff8fd8'));
scene.add(sunMesh, sunGlow, moonA, moonB);
const clouds = new THREE.Group(); scene.add(clouds);
{ const r = rng(99), mat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.35, transparent: true, opacity: 0.92 });
  for (let i = 0; i < 26; i++) { const c = new THREE.Group(); const n = 2 + Math.floor(r() * 3); for (let j = 0; j < n; j++) { const b = new THREE.Mesh(GEO, mat); b.scale.set(8 + r() * 12, 2.2, 6 + r() * 8); b.position.set(j * 6 - n * 3, 0, (r() - .5) * 6); c.add(b); } c.userData.base = [(r() - .5) * 400, 55 + r() * 15, (r() - .5) * 400]; clouds.add(c); } }
function placeSky(dirAz, dirEl, mesh, dist = 380) {
  const v = new THREE.Vector3(Math.cos(dirEl) * Math.sin(dirAz), Math.sin(dirEl), Math.cos(dirEl) * Math.cos(dirAz));
  mesh.position.copy(camera.position).addScaledVector(v, dist); mesh.lookAt(camera.position); return v;
}

// ---------------------------------------------------------------- characters
function box(w, h, d, col, x, y, z, parent, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat || new THREE.MeshLambertMaterial({ color: col }));
  m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}
const pivot = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
function faceMat(base, draw) {
  const t = ctex(32, (g) => { g.fillStyle = base; g.fillRect(0, 0, 32, 32); draw(g); });
  const side = new THREE.MeshLambertMaterial({ color: base });
  return [side, side, side, side, new THREE.MeshLambertMaterial({ map: t }), side];
}
const heroFaces = {
  normal: faceMat('#f2c79b', g => { g.fillStyle = '#fff'; g.fillRect(6, 13, 7, 7); g.fillRect(19, 13, 7, 7); g.fillStyle = '#2a1d14'; g.fillRect(9, 15, 4, 5); g.fillRect(22, 15, 4, 5); g.fillStyle = '#a0412c'; g.fillRect(11, 24, 10, 3); g.fillRect(9, 23, 2, 2); g.fillRect(21, 23, 2, 2); g.fillStyle = '#ff9e8a'; g.fillRect(3, 21, 3, 2); g.fillRect(26, 21, 3, 2); }),
  scared: faceMat('#f2c79b', g => { g.fillStyle = '#fff'; g.fillRect(5, 11, 9, 9); g.fillRect(18, 11, 9, 9); g.fillStyle = '#2a1d14'; g.fillRect(8, 14, 3, 3); g.fillRect(21, 14, 3, 3); g.fillStyle = '#5a1a12'; g.fillRect(12, 22, 8, 8); g.fillStyle = '#ff6b6b'; g.fillRect(13, 27, 6, 3); }),
  soot: faceMat('#3b3431', g => { g.fillStyle = '#fff'; g.fillRect(6, 13, 7, 7); g.fillRect(19, 13, 7, 7); g.fillStyle = '#000'; g.fillRect(8, 16, 3, 3); g.fillRect(22, 14, 3, 3); g.fillStyle = '#fff'; g.fillRect(11, 24, 10, 2); g.fillStyle = '#555'; g.fillRect(2, 3, 4, 4); g.fillRect(25, 6, 3, 3); }),
  smug: faceMat('#f2c79b', g => { g.fillStyle = '#fff'; g.fillRect(6, 15, 7, 4); g.fillRect(19, 15, 7, 4); g.fillStyle = '#2a1d14'; g.fillRect(9, 16, 4, 3); g.fillRect(22, 16, 4, 3); g.fillStyle = '#a0412c'; g.fillRect(12, 24, 12, 2); g.fillRect(22, 22, 2, 2); }),
};
function makeHero() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const leg = x => { const p = pivot(body, x, 0.75, 0); box(0.3, 0.62, 0.3, '#2b3a67', 0, -0.31, 0, p); box(0.32, 0.16, 0.38, '#f4f4f4', 0, -0.67, 0.03, p); return p; };
  const lL = leg(-0.17), lR = leg(0.17);
  box(0.72, 0.78, 0.42, '#ff8a2a', 0, 1.14, 0, body); box(0.5, 0.14, 0.02, '#ffb36b', 0, 0.95, 0.22, body);
  box(0.74, 0.08, 0.44, '#2b3a67', 0, 0.78, 0, body);
  box(0.52, 0.58, 0.22, '#ffd23f', 0, 1.16, -0.31, body); box(0.4, 0.12, 0.05, '#e0a800', 0, 1.0, -0.44, body);
  const arm = x => { const p = pivot(body, x, 1.45, 0); box(0.24, 0.6, 0.26, '#ff8a2a', 0, -0.27, 0, p); box(0.22, 0.16, 0.24, '#f2c79b', 0, -0.64, 0, p); return p; };
  const aL = arm(-0.48), aR = arm(0.48);
  const mallet = pivot(aR, 0, -0.66, 0); box(0.08, 0.08, 0.75, '#8a5a2b', 0, 0, 0.3, mallet); box(0.26, 0.24, 0.34, '#d9a35f', 0, 0.06, 0.66, mallet); box(0.28, 0.06, 0.36, '#ff8a2a', 0, 0.06, 0.66, mallet);
  const bomb = pivot(aR, 0, -0.78, 0.12); box(0.34, 0.34, 0.34, '#ff3d7f', 0, 0, 0, bomb, new THREE.MeshLambertMaterial({ color: '#ff3d7f', emissive: '#ff2266', emissiveIntensity: 0.5 })); box(0.16, 0.08, 0.16, '#3cc26a', 0, 0.2, 0, bomb);
  const block = pivot(aR, 0, -0.72, 0.15); const blockMesh = new THREE.Mesh(GEO, MAT.plank); blockMesh.scale.setScalar(0.3); block.add(blockMesh);
  const hd = pivot(body, 0, 1.53, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.64, 0.64), heroFaces.normal); head.position.y = 0.32; head.castShadow = true; hd.add(head);
  box(0.68, 0.16, 0.68, '#5a3a22', 0, 0.66, 0, hd); box(0.2, 0.12, 0.2, '#5a3a22', 0.15, 0.78, 0.1, hd);
  box(0.68, 0.09, 0.68, '#222', 0, 0.54, 0, hd);
  const lensMat = new THREE.MeshLambertMaterial({ color: '#7dff6a', emissive: '#3dff4a', emissiveIntensity: 0.6 });
  box(0.2, 0.14, 0.05, 0, -0.15, 0.56, 0.34, hd, lensMat); box(0.2, 0.14, 0.05, 0, 0.15, 0.56, 0.34, hd, lensMat);
  const hatSlot = pivot(hd, 0, 0.74, 0);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, lL, lR, aL, aR, hd, head, mallet, bomb, block, blockMesh, hatSlot };
}
function pose(h, o) {
  const t = o.t ?? 0, walk = o.walk ?? 0, ph = o.phase ?? 0, s = Math.sin(ph) * walk;
  h.root.position.set(...o.p); h.root.rotation.set(0, o.yaw ?? 0, 0);
  h.body.position.set(0, Math.abs(Math.cos(ph)) * 0.1 * walk, 0); h.body.rotation.set(0, 0, 0);
  h.lL.rotation.set(s * 0.9, 0, 0); h.lR.rotation.set(-s * 0.9, 0, 0);
  h.aL.rotation.set(-s * 0.8, 0, 0); h.aR.rotation.set(s * 0.8, 0, 0);
  if (o.swing !== undefined) { const k = o.swing % 1; const a = k < 0.45 ? lerp(-0.3, -2.9, ss(k / 0.45)) : k < 0.62 ? lerp(-2.9, -0.4, (k - 0.45) / 0.17) : lerp(-0.4, -0.3, (k - 0.62) / 0.38); h.aR.rotation.x = a; }
  if (o.hold) { h.aR.rotation.x = -0.9; }
  if (o.panic) { h.aL.rotation.set(-2.7 + Math.sin(t * 22) * 0.5, 0, -0.3); h.aR.rotation.set(-2.7 + Math.cos(t * 22) * 0.5, 0, 0.3); }
  if (o.hips) { h.aL.rotation.set(0, 0, 0.9); h.aR.rotation.set(0, 0, -0.9); }
  if (o.wave) { h.aR.rotation.set(-2.9, 0, 0.3 + Math.sin(t * 12) * 0.4); }
  if (o.lean) h.body.rotation.x = o.lean;
  if (o.flat) { h.body.rotation.x = o.flat * Math.PI / 2 * (o.flatDir ?? 1); h.body.position.y += o.flat * 0.25; }
  if (o.sit) { h.lL.rotation.x = -1.5 * o.sit; h.lR.rotation.x = -1.5 * o.sit; h.body.position.y -= 0.55 * o.sit; h.body.rotation.x = -0.15 * o.sit; }
  if (o.spin) h.root.rotation.y += o.spin;
  h.hd.rotation.set(o.headPitch ?? 0, o.headYaw ?? 0, o.headRoll ?? 0);
  h.head.material = heroFaces[o.face || 'normal'];
  h.mallet.visible = !!o.mallet; h.bomb.visible = !!o.bomb; h.block.visible = !!o.block;
  if (o.block) h.blockMesh.material = MAT[o.block];
}
// Path following: K = [[t,x,y,z],...]
function track(t, K) {
  let s = 0;
  if (t <= K[0][0]) return { p: K[0].slice(1), v: [0, 0, 0], s: 0 };
  for (let i = 0; i < K.length - 1; i++) {
    const a = K[i], b = K[i + 1], d = Math.hypot(b[1] - a[1], b[3] - a[3]);
    if (t < b[0]) { const u = (t - a[0]) / (b[0] - a[0]); const dt = b[0] - a[0];
      return { p: [lerp(a[1], b[1], u), lerp(a[2], b[2], u), lerp(a[3], b[3], u)], v: [(b[1] - a[1]) / dt, (b[2] - a[2]) / dt, (b[3] - a[3]) / dt], s: s + d * u }; }
    s += d;
  }
  return { p: K[K.length - 1].slice(1), v: [0, 0, 0], s };
}
function walker(t, K, idleYaw) {
  const r = track(t, K), sp = Math.hypot(r.v[0], r.v[2]);
  let yaw = idleYaw;
  if (sp > 0.05) yaw = Math.atan2(r.v[0], r.v[2]);
  else if (idleYaw === undefined) { for (let i = K.length - 1; i > 0; i--) { if (K[i][0] <= t) { const a = K[i - 1], b = K[i]; if (Math.hypot(b[1] - a[1], b[3] - a[3]) > 0.01) { yaw = Math.atan2(b[1] - a[1], b[3] - a[3]); break; } } } yaw ??= 0; }
  return { p: r.p, yaw, walk: clamp(sp / 3, 0, 1.2), phase: r.s * 2.4, speed: sp };
}
function yawTo(from, to) { return Math.atan2(to[0] - from[0], to[2] - from[2]); }

function makeBurble(robe) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 0.3, 0.9, shade(robe, 0.7), 0, 0.15, 0, body); box(0.8, 0.75, 0.8, robe, 0, 0.67, 0, body);
  box(0.82, 0.08, 0.82, '#ffd23f', 0, 0.9, 0, body);
  const aL = pivot(body, -0.48, 0.95, 0), aR = pivot(body, 0.48, 0.95, 0);
  box(0.18, 0.5, 0.18, robe, 0, -0.22, 0, aL); box(0.18, 0.5, 0.18, robe, 0, -0.22, 0, aR);
  const hd = pivot(body, 0, 1.05, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.62, 0.72), faceMat('#c8e6a0', g => { g.fillStyle = '#fff'; g.fillRect(8, 6, 16, 14); g.fillStyle = '#1a1a40'; g.fillRect(13, 9, 7, 8); g.fillStyle = '#fff'; g.fillRect(14, 10, 2, 2); g.fillStyle = '#5a7a3a'; g.fillRect(12, 25, 8, 2); g.fillStyle = '#8fbf6a'; g.fillRect(6, 4, 20, 2); }));
  head.position.y = 0.31; head.castShadow = true; hd.add(head);
  const hat = new THREE.Group(); hat.position.y = 0.64; hd.add(hat);
  box(1.2, 0.14, 1.2, '#2ec4b6', 0, 0, 0, hat); box(0.72, 0.36, 0.72, '#2ec4b6', 0, 0.24, 0, hat); box(0.4, 0.14, 0.4, '#2ec4b6', 0, 0.48, 0, hat);
  for (const [x, z] of [[-0.4, 0.3], [0.35, -0.35], [0.2, 0.42], [-0.3, -0.4]]) box(0.16, 0.05, 0.16, '#ffe066', x, 0.08, z, hat);
  box(0.16, 0.16, 0.05, '#ffe066', 0.15, 0.3, 0.37, hat);
  return { root, body, aL, aR, hd, hat };
}
function makeLurk() {
  const root = new THREE.Group(), body = pivot(root, 0, 1.3, 0);
  const dark = new THREE.MeshLambertMaterial({ color: '#2a2238' });
  box(1.3, 0.9, 2.8, 0, 0, 0, 0, body, dark); box(1.0, 0.6, 1.0, 0, 0, -0.1, -1.7, body, dark);
  const hd = pivot(body, 0, 0.1, 1.4); box(1.1, 0.85, 1.0, 0, 0, 0, 0.4, hd, dark);
  const eye = new THREE.MeshBasicMaterial({ color: '#5ff7ff' });
  for (const [x, y] of [[-0.3, 0.15], [0.3, 0.15], [-0.18, -0.12], [0.18, -0.12]]) box(0.16, 0.12, 0.05, 0, x, y, 0.92, hd, eye);
  box(0.12, 0.35, 0.12, '#ddd', -0.3, -0.5, 0.85, hd); box(0.12, 0.35, 0.12, '#ddd', 0.3, -0.5, 0.85, hd);
  const cry = new THREE.MeshBasicMaterial({ color: '#ff5cf0' });
  for (let i = 0; i < 6; i++) { const c = box(0.22, 0.8 - i * 0.07, 0.22, 0, (i % 2 ? .3 : -.3), 0.75, 1.0 - i * 0.45, body, cry); c.rotation.z = (i % 2 ? -0.4 : 0.4); }
  const legs = [];
  for (let i = 0; i < 6; i++) { const side = i < 3 ? -1 : 1, z = [-0.9, 0.1, 1.0][i % 3];
    const p = pivot(body, side * 0.65, -0.1, z); const up = box(0.9, 0.16, 0.16, 0, side * 0.45, 0.25, 0, p, dark); up.rotation.z = side * 0.6;
    const lo = box(0.14, 1.3, 0.14, 0, side * 0.95, -0.25, 0, p, dark); legs.push(p); }
  const light = new THREE.PointLight('#5ff7ff', 6, 9, 2); light.position.set(0, 0.2, 2.2); hd.add(light);
  return { root, body, hd, legs, light };
}
function poseLurk(L, t, p, yaw, speed) {
  L.root.position.set(...p); L.root.rotation.y = yaw;
  L.legs.forEach((g, i) => { g.rotation.x = Math.sin(t * (6 + speed * 3) + i * 2.1) * 0.5 * (0.3 + speed / 4); g.rotation.z = Math.cos(t * 10 + i) * 0.08; });
  L.body.position.y = 1.3 + Math.sin(t * 9) * 0.06 * (0.3 + speed);
  L.hd.rotation.set(Math.sin(t * 3) * 0.1, Math.sin(t * 2.3) * 0.2, 0);
}
function makeGrumble(s = 1) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0); root.scale.setScalar(s);
  const jelly = new THREE.MeshLambertMaterial({ color: '#7cff6b', transparent: true, opacity: 0.82, emissive: '#2f8a2a', emissiveIntensity: 0.35 });
  box(1.3, 1.3, 1.3, 0, 0, 0.65, 0, body, jelly); box(0.6, 0.6, 0.6, '#3c9a32', 0.1, 0.6, -0.1, body);
  box(0.32, 0.32, 0.05, '#fff', -0.3, 0.95, 0.66, body); box(0.32, 0.32, 0.05, '#fff', 0.3, 0.95, 0.66, body);
  const ey = new THREE.MeshBasicMaterial({ color: '#d4001a' });
  box(0.14, 0.14, 0.06, 0, -0.27, 0.92, 0.68, body, ey); box(0.14, 0.14, 0.06, 0, 0.27, 0.92, 0.68, body, ey);
  box(0.9, 0.28, 0.05, '#2a0a0a', 0, 0.45, 0.66, body);
  for (let i = 0; i < 5; i++) { box(0.11, 0.13, 0.06, '#fff', -0.36 + i * 0.18, 0.55, 0.68, body); box(0.11, 0.11, 0.06, '#fff', -0.27 + i * 0.18, 0.36, 0.68, body); }
  box(0.4, 0.08, 0.05, '#1d5c18', -0.3, 1.15, 0.66, body).rotation.z = -0.3; box(0.4, 0.08, 0.05, '#1d5c18', 0.3, 1.15, 0.66, body).rotation.z = 0.3;
  return { root, body };
}
function poseGrumble(g, t, p, yaw, hop = 1, seed = 0) {
  const ph = (t * 1.6 + seed) % 1, y = Math.sin(ph * Math.PI) * 0.6 * hop;
  const sq = ph < 0.12 ? 1 - (0.12 - ph) * 2.5 * hop : 1;
  g.root.position.set(p[0], p[1] + y, p[2]); g.root.rotation.y = yaw; g.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
}
function makeStilt() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const mat = new THREE.MeshLambertMaterial({ color: '#5b2a86' }), dk = new THREE.MeshLambertMaterial({ color: '#2f1250' });
  const lL = pivot(body, -0.2, 3.2, 0), lR = pivot(body, 0.2, 3.2, 0);
  box(0.16, 3.2, 0.16, 0, 0, -1.6, 0, lL, dk); box(0.16, 3.2, 0.16, 0, 0, -1.6, 0, lR, dk);
  box(0.7, 1.3, 0.45, 0, 0, 3.85, 0, body, mat); box(0.75, 0.12, 0.5, '#ff5cf0', 0, 3.5, 0, body);
  const aL = pivot(body, -0.45, 4.4, 0), aR = pivot(body, 0.45, 4.4, 0);
  box(0.12, 2.2, 0.12, 0, 0, -1.1, 0, aL, dk); box(0.12, 2.2, 0.12, 0, 0, -1.1, 0, aR, dk);
  const hd = pivot(body, 0, 4.55, 0); box(0.55, 0.65, 0.55, 0, 0, 0.32, 0, hd, mat);
  const em = new THREE.MeshBasicMaterial({ color: '#ff3bd6' });
  box(0.14, 0.08, 0.05, 0, -0.13, 0.42, 0.28, hd, em); box(0.14, 0.08, 0.05, 0, 0.13, 0.42, 0.28, hd, em);
  box(0.3, 0.06, 0.05, '#000', 0, 0.2, 0.28, hd);
  box(0.6, 0.12, 0.6, '#1a0830', 0, 0.7, 0, hd); box(0.3, 0.5, 0.3, '#1a0830', 0, 0.98, 0, hd);
  return { root, body, lL, lR, aL, aR, hd };
}
function poseStilt(s, t, p, yaw, walk = 0, ph = 0) {
  s.root.position.set(...p); s.root.rotation.y = yaw;
  const a = Math.sin(ph) * 0.35 * walk; s.lL.rotation.x = a; s.lR.rotation.x = -a;
  s.aL.rotation.set(Math.sin(t * 1.3) * 0.2, 0, 0.1); s.aR.rotation.set(Math.cos(t * 1.1) * 0.2, 0, -0.1);
  s.body.position.y = Math.abs(Math.cos(ph)) * 0.08 * walk; s.hd.rotation.set(0, Math.sin(t * 0.7) * 0.4, Math.sin(t * 1.9) * 0.08);
}

// ---------------------------------------------------------------- terrain helpers
function terrain(set, x0, x1, z0, z1, hf, opts = {}) {
  const hmap = (x, z) => hf(x, z);
  for (let x = x0; x <= x1; x++) for (let z = z0; z <= z1; z++) {
    const h = hmap(x, z); if (h === null) continue;
    const top = opts.top ? opts.top(x, z, h) : 'turf';
    set.add(x, h, z, top);
    const mn = Math.min(hmap(x + 1, z) ?? h, hmap(x - 1, z) ?? h, hmap(x, z + 1) ?? h, hmap(x, z - 1) ?? h);
    for (let y = h - 1; y >= Math.min(mn, h - 1); y--) set.add(x, y, z, y < h - 3 ? 'stone' : 'soil');
  }
}
function tree(set, x, y, z, r, h = 5, logOpts) {
  for (let i = 1; i <= h; i++) set.add(x, y + i, z, 'log', logOpts ? logOpts(i) : {});
  const cy = y + h;
  for (let dx = -2; dx <= 2; dx++) for (let dy = -1; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) {
    const d = Math.hypot(dx, dy * 1.2, dz); if (d > 2.4 || (dx === 0 && dz === 0 && dy <= 0)) continue;
    if (d > 1.9 && r() < 0.45) continue; set.add(x + dx, cy + dy, z + dz, 'leaf');
  }
}
const groups = {};
const mk = name => { const g = new THREE.Group(); g.visible = false; scene.add(g); groups[name] = g; return g; };
const hero = makeHero(); scene.add(hero.root);

// ================================================================ SCENE 1: FOREST
const forest = (() => {
  const g = mk('forest'), st = new VSet(g), dy = new VSet(g, true), r = rng(5);
  const hf = (x, z) => { const d = Math.hypot(x - 1, z); const n = Math.round(vnoise(x / 7, z / 7, 1) * 4 + vnoise(x / 3, z / 3, 2) * 1.5 - 2.5); return Math.round(n * ss((d - 6) / 7)); };
  terrain(st, -34, 34, -34, 34, hf);
  const trees = [];
  for (let i = 0; i < 70; i++) { const x = Math.round((r() - .5) * 64), z = Math.round((r() - .5) * 64); if (Math.hypot(x, z) < 7 || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  // the tree we punch
  const TX0 = 4, TZ = 0;
  tree(dy, TX0, 0, TZ, rng(77), 5, i => i === 1 ? { t1: E.logBreak } : {});
  for (let i = 0; i < 40; i++) { const x = Math.round((r() - .5) * 50), z = Math.round((r() - .5) * 50); if (Math.hypot(x, z) < 3) continue; const f = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), new THREE.MeshLambertMaterial({ color: ['#ffe066', '#ff9ecb', '#ffffff'][i % 3] })); f.position.set(x + 0.2, hf(x, z) + 0.7, z + 0.3); g.add(f); }
  st.build(); dy.build();
  const drop = new THREE.Mesh(GEO, MAT.log); drop.scale.setScalar(0.32); g.add(drop);
  // bursts
  for (let k = 0; k < 14; k++) burst(E.punch + 0.25 + k * 0.26, [TX0 - 0.4, 1.0, 0], { n: 8, colors: ['#b5652e', '#e6b06a', '#93501f'], speed: 3, size: 0.12, life: 0.7, grav: 12, up: 1.5 });
  burst(E.logBreak, [TX0, 1, 0], { n: 30, colors: ['#b5652e', '#e6b06a', '#93501f'], speed: 4, size: 0.16, life: 1, grav: 12 });
  burst(E.spawn, [0, 1.5, 0], { n: 60, colors: ['#5ff7ff', '#ff6bf0', '#ffffff', '#ffe066'], speed: 5, size: 0.14, life: 1.4, grav: -1, up: 0.5, drag: 2 });
  burst(E.craftDone + 0.2, [0, 2.2, 0], { n: 30, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 1, grav: 2 });
  burst(E.trip + 0.45, [-0.6, 0.6, 0.3], { n: 25, colors: ['#c9a46a', '#ffffff'], speed: 2.5, size: 0.14, life: 0.9, grav: 3, hemi: 1 });
  function update(t) {
    dy.update(t);
    // hero
    const K = [[0, 0, 0.5, 0], [E.walkTree, 0, 0.5, 0], [E.atTree, 2.9, 0.5, 0]];
    const w = walker(t, K, t < E.walkTree ? Math.sin(t * 0.6) * 0.9 + 0.4 : undefined);
    let o = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, t };
    if (t < E.spawn) { hero.root.visible = false; } else hero.root.visible = true;
    if (t >= E.spawn && t < E.spawn + 0.4) { const k = backOut(seg(t, E.spawn, E.spawn + 0.4)); hero.root.scale.setScalar(Math.max(0.01, k)); } else hero.root.scale.setScalar(1);
    if (t < E.walkTree) { o.headYaw = Math.sin(t * 1.3) * 0.5; o.headPitch = -0.2 + Math.sin(t * 0.7) * 0.15; if (win(t, 14, 18)) o.headPitch = -0.5; }
    if (win(t, E.punch, E.logBreak)) { o.swing = (t - E.punch) / 0.26; o.yaw = Math.PI / 2; }
    if (win(t, E.logBreak, 32.6)) { o.yaw = Math.PI / 2; o.headPitch = -0.6 * ss(seg(t, 27.5, 28.2)); if (t > 28) o.face = 'scared'; if (t > 30.5) { o.face = 'smug'; o.headPitch = 0; } }
    if (win(t, 32.6, E.craftDone)) { o.yaw = 0.3; o.headPitch = 0.3; }
    if (t >= E.craftDone) { o.mallet = true; o.yaw = 0.25; }
    if (win(t, 37, E.trip)) { o.swing = clamp((t - 37.6) / 1.2, 0, 0.99); o.face = 'smug'; o.hips = t < 37.6; }
    if (t >= E.trip) { const k = seg(t, E.trip, E.trip + 0.45); o.flat = k * k; o.flatDir = -1; o.face = 'scared'; o.headPitch = 0; }
    pose(hero, o);
    // drop
    drop.visible = t >= E.logBreak && t < E.pickup + 0.15;
    if (drop.visible) { const k = seg(t, E.pickup - 0.15, E.pickup + 0.15); drop.position.set(lerp(TX0, 2.9, k), lerp(0.8 + Math.sin(t * 4) * 0.1, 1.5, k), 0); drop.rotation.y = t * 2; drop.scale.setScalar(0.32 * (1 - k * 0.7)); }
    // camera
    const C = [
      [0, -6, 22, 22, 0, 1, 0, 55], [E.spawn, -2, 4.5, 7.5, 0, 1.2, 0, 50], [7.8, 3.5, 2.6, 5.5, 0, 1.6, 0, 48],
      [8.2, 3.5, 2.2, 5.5, 0, 1.5, 0, 50], [13.9, -2.5, 2.4, 6.0, 0, 1.6, 0, 46],
      [14.0, -5, 2.0, 8, 4, 4.5, -4, 58], [17.9, 5, 3.0, 9, 3, 4.0, -6, 58],
      [18.0, -3, 3.5, 5, 2, 1.5, 0, 50], [22.3, 0.5, 2.5, 4.2, 3.5, 1.4, 0, 48],
      [22.4, 2.0, 1.6, 3.2, 3.6, 1.1, 0, 45], [26.1, 1.6, 1.5, 2.6, 3.6, 1.0, 0, 42],
      [26.2, 0.2, 1.5, 4.5, 3.4, 1.4, 0, 50], [27.4, 0.0, 1.8, 4.0, 3.5, 1.8, 0, 50],
      [27.5, -2, 0.8, 5, 4, 4.0, 0, 55], [32.5, -1, 0.9, 5.5, 4, 4.2, 0, 52],
      [32.6, 1.0, 2.2, 4.8, 0, 1.6, 0, 50], [36.9, 0.7, 2.0, 4.0, 0, 1.6, 0, 48],
      [37.0, 3.0, 2.0, 4.5, 0, 1.3, 0, 52], [40, 2.4, 1.6, 4.0, 0, 0.9, 0, 50]];
    return { cam: camKeys(t, C), hud: t > 3, day: 1 };
  }
  return { g, update, hf };
})();

// camera key interpolation [t, px,py,pz, lx,ly,lz, fov]
function camKeys(t, C) {
  if (t <= C[0][0]) return { p: C[0].slice(1, 4), l: C[0].slice(4, 7), fov: C[0][7] };
  for (let i = 0; i < C.length - 1; i++) { const a = C[i], b = C[i + 1]; if (t < b[0] && b[0] - a[0] > 1e-3) { const u = ss((t - a[0]) / (b[0] - a[0])); const L = j => lerp(a[j], b[j], u); return { p: [L(1), L(2), L(3)], l: [L(4), L(5), L(6)], fov: L(7) }; } }
  const z = C[C.length - 1]; return { p: z.slice(1, 4), l: z.slice(4, 7), fov: z[7] };
}

// ================================================================ SCENE 2: EXPLORE + VILLAGE
const village = (() => {
  const g = mk('village'), st = new VSet(g), dy = new VSet(g, true), r = rng(11);
  const hf = (x, z) => { if (x >= 62 && x <= 100 && Math.abs(z) <= 14) { const e = Math.min(x - 62, 100 - x, 14 - Math.abs(z)); return Math.round((vnoise(x / 9, z / 9, 3) * 5 - 1.5) * ss((3 - e) / 3)); }
    return Math.round((vnoise(x / 11, z / 11, 3) * 8 + vnoise(x / 4, z / 4, 4) * 2 - 2) * ss((Math.abs(z) - 2.5) / 7)); };
  const isVil = (x, z) => x >= 66 && x <= 96 && Math.abs(z) <= 11;
  for (let x = -12; x <= 140; x++) for (let z = -32; z <= 32; z++) {
    const h = hf(x, z), S = Math.hypot(x - 77.5, z + 2.6) < 6.5 ? dy : st;
    const top = (Math.abs(z) <= 1 && x < 100) ? 'path' : (isVil(x, z) && x >= 70 && x <= 74 && z >= 4 && z <= 9 ? 'crop' : 'turf');
    S.add(x, h, z, top);
    const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1));
    for (let y = h - 1; y >= Math.min(mn, h - 1); y--) S.add(x, y, z, y < h - 3 ? 'stone' : 'soil');
  }
  const trees = [];
  for (let i = 0; i < 260; i++) { const x = Math.round(-10 + r() * 150), z = Math.round((r() - .5) * 62); if (Math.abs(z) < 5 || (x > 60 && x < 100 && Math.abs(z) < 16) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  const hut = (cx, cz, door) => {
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = 1; y <= 3; y++) {
      const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (!edge) continue;
      if (x === 0 && z === 2 * door && y <= 2) continue;
      if (y === 2 && (Math.abs(x) === 2 && z === 0 || Math.abs(z) === 2 && Math.abs(x) === 1 && x * door > 0)) { dy.add(cx + x, y, cz + z, 'glass'); continue; }
      dy.add(cx + x, y, cz + z, (Math.abs(x) === 2 && Math.abs(z) === 2) ? 'log' : 'hut');
    }
    for (let l = 0; l < 3; l++) { const R = 3 - l; for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) if (l === 2 || Math.abs(x) === R || Math.abs(z) === R) dy.add(cx + x, 4 + l, cz + z, 'hutRoof'); }
  };
  hut(78, -5, 1); hut(87, -5, 1); hut(80, 7, -1); hut(91, 6, -1);
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) if (x || z) dy.add(84 + x, 1, 1 + z, 'stone');
  for (const [x, z] of [[-1, -1], [1, 1]]) for (let y = 2; y <= 3; y++) dy.add(84 + x, y, 1 + z, 'log');
  for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) dy.add(84 + x, 4, 1 + z, 'hutRoof');
  // explosion: blast village blocks near the hut front
  const BC = [77.5, 1.2, -2.6];
  for (const arr of Object.values(dy.items)) for (const b of arr) {
    const dx = b.x - BC[0], dy2 = b.y - BC[1], dz = b.z - BC[2], d = Math.hypot(dx, dy2 * 0.8, dz);
    if (d < 3.9 + r() * 0.7) { const n = Math.max(0.3, d); b.t1 = E.boom + d * 0.01; b.fly = [dx / n * (5 + r() * 8), 6 + r() * 9 + Math.max(0, dy2) * 2, dz / n * (5 + r() * 8)]; b.spin = [r() * 10 - 5, r() * 10 - 5, r() * 10 - 5]; b.floor = -1; }
  }
  st.build(); dy.build();
  // lamps
  for (const [x, z] of [[68, 2], [76, 2], [95, -2]]) { box(0.2, 2.2, 0.2, '#5a3a22', x, 1.6, z, g); box(0.45, 0.45, 0.45, 0, x, 2.9, z, g, new THREE.MeshBasicMaterial({ color: '#ffe48a' })); }
  const burbles = [['#7b5cd6', [76.2, 0.5, 0]], ['#e0577b', [82, 0.5, 2.6]], ['#3d9be0', [88, 0.5, -1.2]], ['#f08a24', [80.5, 0.5, 3.6]], ['#5a3fb8', [92, 0.5, 2.0]]].map(([c, p]) => ({ B: makeBurble(c), p }));
  burbles.forEach(b => g.add(b.B.root));
  const flyHat = new THREE.Group(); g.add(flyHat);
  const bombObj = new THREE.Group(); g.add(bombObj);
  box(0.36, 0.36, 0.36, 0, 0, 0, 0, bombObj, new THREE.MeshLambertMaterial({ color: '#ff3d7f', emissive: '#ff2266', emissiveIntensity: 0.6 })); box(0.16, 0.08, 0.16, '#3cc26a', 0, 0.21, 0, bombObj);
  const flashLight = new THREE.PointLight('#ffb050', 0, 30, 1.5); flashLight.position.set(...BC); g.add(flashLight);
  burst(E.boom, BC, { n: 220, colors: ['#ffef7a', '#ff9a3c', '#ff3d7f', '#ffffff', '#ff6b2a'], speed: 14, size: 0.45, life: 1.4, grav: 2, drag: 2.5, up: 2 });
  burst(E.boom + 0.15, BC, { n: 120, colors: ['#555', '#777', '#999', '#bbb'], speed: 6, size: 0.9, life: 2.6, grav: -1.2, drag: 1.6, up: 1.5 });
  for (let k = 0; k < 18; k++) burst(E.bombDrop + 0.4 + k * 0.07, [0, 0, 0], { n: 0 });
  burst(E.wave, [76.2, 2.4, 0], { n: 12, colors: ['#ffe066', '#ff9ecb'], speed: 2, size: 0.1, life: 0.8, grav: 1 });
  let runSteps = [];
  function heroPath() {
    const K = [[40, 0, 0.5, 0], [E.run1, 0, 0.5, 0], [E.stopHill, 55, 0.5, 0], [E.villageWalk, 55, 0.5, 0], [E.atTrader, 73.8, 0.5, 0], [E.boom, 73.8, 0.5, 0], [E.boom + 0.7, 71.2, 0.5, 0.8], [E.flee, 71.2, 0.5, 0.8], [E.flee + 0.6, 70.5, 0.5, 0.2], [90, 52, 0.5, 0]];
    return K;
  }
  function update(t) {
    dy.update(t);
    const K = heroPath(); const w = walker(t, K, t >= E.atTrader && t < E.flee ? Math.PI / 2 : undefined);
    let p = [...w.p];
    if (win(t, E.run1, E.stopHill)) { const ph = ((t - E.run1) / 1.1) % 1; p[1] += Math.sin(ph * Math.PI) * 1.1 * (Math.floor((t - E.run1) / 1.1) % 2); }
    if (win(t, E.flee, 90)) { const ph = ((t - E.flee) / 0.7) % 1; p[1] += Math.sin(ph * Math.PI) * 0.6; }
    const o = { p, yaw: w.yaw, walk: w.walk * 1.1, phase: w.phase, t, mallet: t < E.tradeDone };
    if (win(t, E.stopHill, E.villageWalk)) { o.headYaw = 0; o.headPitch = 0.1; if (t > 49.2) o.face = 'scared'; }
    if (win(t, E.atTrader, E.tradeDone)) { o.wave = win(t, 55.4, 56.6); }
    if (win(t, E.tradeDone, E.bombDrop)) { o.bomb = true; o.hold = true; o.headPitch = 0.5; o.yaw = Math.PI / 2 + Math.sin(t * 3) * 0.6; o.headYaw = Math.sin(t * 5) * 0.3; }
    if (win(t, E.bombDrop, E.boom)) { o.face = 'scared'; o.headPitch = 0.4; o.yaw = Math.PI / 2 + 0.6; }
    if (win(t, E.boom, 70.6)) { const k = seg(t, E.boom, E.boom + 0.5); o.flat = Math.sin(k * Math.PI / 2); o.flatDir = -1; o.face = 'soot'; o.p[1] += Math.sin(k * Math.PI) * 1.5; }
    if (win(t, 70.6, E.flee)) { o.face = t < 79.5 ? 'soot' : 'scared'; o.yaw = Math.PI / 2 + (t > 79.8 ? 0.3 : 0); if (win(t, 75, 79)) o.hips = true; o.headYaw = t > 79.8 ? -0.3 : 0; }
    if (t >= E.flee) { o.face = 'scared'; o.panic = true; }
    pose(hero, o);
    // burbles
    burbles.forEach((b, i) => {
      let p = [...b.p], yaw = yawTo(b.p, hero.root.position.toArray()) , bob = Math.sin(t * 3 + i) * 0.04;
      if (i === 0 && t < E.boom) yaw = -Math.PI / 2;
      b.B.root.position.set(p[0], p[1] + Math.abs(bob), p[2]); b.B.root.rotation.set(0, yaw, 0);
      b.B.aL.rotation.set(0, 0, -0.1); b.B.aR.rotation.set(0, 0, 0.1); b.B.hat.visible = true; b.B.hd.rotation.set(0, Math.sin(t * 1.4 + i) * 0.3, 0);
      if (i === 0 && win(t, E.wave, E.wave + 1.4)) b.B.aR.rotation.set(-2.6, 0, Math.sin(t * 12) * 0.5);
      if (i === 0 && t >= E.boom) {
        const k = seg(t, E.boom, E.boom + 1.8); b.B.hat.visible = false;
        const px = lerp(76.2, 74.5, k), pz = lerp(0, 3.2, k), py = 0.5 + Math.sin(k * Math.PI) * 7;
        b.B.root.position.set(px, py, pz); b.B.root.rotation.set(k < 1 ? k * 12 : -Math.PI / 2, yaw, 0);
        if (t > E.boom + 1.8) { const k2 = seg(t, 72, 72.6); b.B.root.rotation.set(lerp(-Math.PI / 2, 0, k2), yaw, 0); b.B.root.position.set(74.5, 0.5 + (k2 < 1 ? 0.3 : 0), 3.2); }
      }
      if (t >= E.stare && t < E.flee) b.B.hd.rotation.set(0, 0, 0);
      if (t >= E.flee) { b.B.root.position.y = p[1] + Math.abs(Math.sin(t * 9 + i)) * 0.5; b.B.aL.rotation.set(-2.8, 0, 0); b.B.aR.rotation.set(-2.8 + Math.sin(t * 15 + i) * 0.4, 0, 0); }
    });
    // flying hat lands on hero
    flyHat.visible = false;
    if (t >= E.boom && t < E.flee + 4) {
      const B0 = burbles[0].B; if (flyHat.children.length === 0) { const h = B0.hat.clone(); flyHat.add(h); }
      flyHat.visible = true; const k = seg(t, E.boom, E.boom + 1.7);
      const hp = new THREE.Vector3(); hero.hatSlot.getWorldPosition(hp);
      if (k < 1) { flyHat.position.set(lerp(76.2, hp.x, k), lerp(2.3, hp.y, k) + Math.sin(k * Math.PI) * 6, lerp(0, hp.z, k)); flyHat.rotation.set(k * 14, k * 9, 0); flyHat.scale.setScalar(1); }
      else { hero.root.updateMatrixWorld(true); hero.hatSlot.getWorldPosition(hp); const q = new THREE.Quaternion(); hero.hatSlot.getWorldQuaternion(q); flyHat.position.copy(hp); flyHat.quaternion.copy(q); flyHat.scale.setScalar(0.85); }
    }
    // bomb on ground
    bombObj.visible = win(t, E.bombDrop, E.boom);
    if (bombObj.visible) { const k = seg(t, E.bombDrop + 0.3, E.boom - 0.1); const hop = t < E.bombDrop + 0.3 ? 1.2 - seg(t, E.bombDrop, E.bombDrop + 0.3) * 1.0 : 0.22 + Math.abs(Math.sin(k * 9)) * 0.25 * (1 - k);
      bombObj.position.set(lerp(74.4, BC[0], k), hop + 0.5, lerp(0.2, BC[2], k)); bombObj.rotation.set(k * 20, 0, k * 13); bombObj.scale.setScalar(1 + Math.sin(t * 30) * 0.08 * k); }
    flashLight.intensity = t >= E.boom ? 600 * Math.exp(-(t - E.boom) * 4) : 0;
    // camera
    const C = [
      [40, -4, 3, 6, 2, 1.4, 0, 55], [40.8, -3, 3.2, 5.5, 3, 1.4, 0, 55],
      [41.8, 6, 3, 8, 10, 1.2, 0, 60], [E.stopHill - 0.2, 50, 4, 9, 55, 1.2, 0, 60],
      [44.6, 30, 12, 20, 38, 4, -5, 62], [47.5, 38, 13, 18, 52, 2, 0, 62],
      [47.6, 50.5, 2.4, -1.2, 70, 3, 0, 52], [49.5, 51.5, 2.4, -0.8, 80, 2.5, 0, 42],
      [49.6, 84.6, 1.9, 5.6, 82, 1.6, 2.6, 42], [52.5, 84.2, 1.9, 5.0, 82, 1.6, 2.6, 38], [52.6, 88.4, 1.9, 0.6, 92, 1.7, 2.0, 40], [55.0, 88.8, 2.0, 0.2, 92, 1.8, 2, 44],
      [55.1, 72, 2.4, 3.6, 75.5, 1.6, 0, 50], [59.9, 72.4, 2.2, 3.0, 75.5, 1.7, 0, 46],
      [60.0, 72.6, 2.4, 3.4, 75, 1.6, 0, 48], [64.7, 72.6, 2.4, 3.4, 75, 1.6, 0, 48],
      [64.8, 75.2, 2.2, 1.6, 73.8, 1.4, 0, 45], [66.1, 75.2, 2.2, 1.8, 73.8, 1.3, 0, 45],
      [66.2, 72, 3.0, 4.5, 76.5, 0.8, -2, 50], [67.55, 71.5, 3.2, 5.5, 77, 1.0, -2.5, 52],
      [67.6, 69, 6, 9, 77, 2, -2, 58], [70.9, 67, 7, 11, 76, 2, -2, 60],
      [71.0, 69.8, 1.8, 1.8, 71.2, 1.5, 0.8, 50], [74.9, 69.8, 1.9, 1.2, 71.2, 1.5, 0.8, 47],
      [75.0, 72, 5, -6, 77, 1, -3, 55], [79.7, 69.5, 6, -8, 77, 1, -2.5, 55],
      [79.8, 75.5, 2.0, 4.0, 74.5, 1.4, 3.2, 40], [81.6, 75.0, 1.9, 3.5, 74.5, 1.4, 3.2, 35], [81.7, 70.5, 2.0, 3.2, 74, 1.8, 3.2, 44], [84.3, 70.5, 2.0, 3.2, 74, 1.8, 3.2, 44],
      [84.4, 68.5, 2.2, 2.8, 71, 1.5, 0.8, 50], [86.0, 66, 3, 5, 70, 1.4, 0.5, 55], [90, 58, 4, 7, 72, 1.5, 0, 55]];
    return { cam: camKeys(t, C), hud: true, day: 1 };
  }
  return { g, update };
})();

// ================================================================ SCENE 3: CAVE
const cave = (() => {
  const gOut = mk('caveOut'), gIn = mk('caveIn'), st = new VSet(gOut), sti = new VSet(gIn), r = rng(21);
  // --- exterior: meadow + giant mound with a mouth at z=0
  const Hm = (x, z) => Math.round(26 * Math.max(0, 1 - Math.hypot(x / 34, (z + 22) / 24)) + vnoise(x / 5, z / 5, 9) * 3);
  for (let x = -40; x <= 40; x++) for (let z = -45; z <= 40; z++) {
    if (z >= 0) { const h = Math.round(vnoise(x / 9, z / 9, 8) * 2 * ss((z - 6) / 8)); st.add(x, h, z, Math.abs(x) <= 1 && z < 14 ? 'path' : 'turf'); if (z < 2) st.add(x, h - 1, z, 'soil'); continue; }
    const h = Math.max(0, Hm(x, z)); if (h <= 0) { st.add(x, 0, z, 'turf'); continue; }
    st.add(x, h, z, 'turf'); const mn = Math.min(Math.max(0, Hm(x + 1, z)), Math.max(0, Hm(x - 1, z)), z + 1 >= 0 ? 0 : Math.max(0, Hm(x, z + 1)), Math.max(0, Hm(x, z - 1)));
    for (let y = h - 1; y >= Math.min(mn, h - 1) + 0; y--) { if (z >= -2 && Math.abs(x) <= 5 && y >= 1 && y <= 8 - Math.max(0, Math.abs(x) - 3) * 1.5) continue; st.add(x, y, z, y < h - 2 ? (r() < 0.06 ? 'ore' : 'stone') : 'soil'); }
  }
  for (let i = 0; i < 40; i++) { const x = Math.round((r() - .5) * 76), z = Math.round(6 + r() * 32); if (Math.abs(x) < 6) continue; tree(st, x, 0, z, r, 4 + Math.floor(r() * 2)); }
  st.build();
  const mouthDark = new THREE.Mesh(new THREE.BoxGeometry(11, 9, 0.5), new THREE.MeshBasicMaterial({ color: '#05040a' })); mouthDark.position.set(0, 4.5, -2.9); gOut.add(mouthDark);
  const exitEyes = new THREE.Group(); gOut.add(exitEyes);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#5ff7ff' });
  for (const [x, y] of [[-0.35, 0.15], [0.35, 0.15], [-0.2, -0.15], [0.2, -0.15]]) box(0.2, 0.14, 0.05, 0, x, y, 0, exitEyes, eyeM);
  exitEyes.position.set(0.5, 1.6, -2.5);
  // --- interior tunnel
  const cx = z => 3 * Math.sin(z / 13), R = z => 4.2 + 6.5 * Math.exp(-Math.pow((z + 42) / 10, 2)) + 0.6 * Math.sin(z / 3.1);
  const inside = (x, y, z) => { if (y < 1 || z > 2 || z < -96) return false; const dx = x - cx(z), dy = (y - 1) * 0.85; return Math.hypot(dx, dy) < R(z); };
  for (let z = -97; z <= 3; z++) for (let x = -18; x <= 18; x++) for (let y = 0; y <= 15; y++) {
    if (inside(x, y, z)) continue;
    if (inside(x + 1, y, z) || inside(x - 1, y, z) || inside(x, y + 1, z) || inside(x, y - 1, z) || inside(x, y, z + 1) || inside(x, y, z - 1)) sti.add(x, y, z, r() < 0.05 ? 'ore' : (r() < 0.25 ? 'stone' : 'dark'));
  }
  sti.build();
  const crystals = [];
  const cmatC = new THREE.MeshBasicMaterial({ color: '#5ff7ff' }), cmatM = new THREE.MeshBasicMaterial({ color: '#ff5cf0' });
  for (let i = 0; i < 70; i++) {
    const z = -6 - r() * 85, side = r() < .5 ? -1 : 1, ang = (r() - 0.5) * 1.2;
    const rr = R(z) - 0.3, x = cx(z) + side * Math.cos(ang) * rr, y = 1 + Math.sin(ang) * rr / 0.85 + 2;
    const cl = new THREE.Group(); cl.position.set(x, Math.max(1, y), z); const m = r() < 0.55 ? cmatC : cmatM;
    for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.1 + r() * 1.2, 0.3), m); c.rotation.set((r() - .5) * 1.4, 0, -side * (0.6 + r() * 0.8)); c.position.set(-side * r() * 0.3, r() * 0.4, (r() - .5) * 0.8); cl.add(c); }
    gIn.add(cl); crystals.push(cl);
  }
  const clights = [[-36, '#5ff7ff'], [-44, '#ff5cf0'], [-50, '#5ff7ff'], [-20, '#ff5cf0'], [-68, '#5ff7ff']].map(([z, c]) => { const l = new THREE.PointLight(c, 45, 22, 1.6); l.position.set(cx(z) + (r() - .5) * 6, 5, z); gIn.add(l); return l; });
  const exitLight = new THREE.PointLight('#fff4d0', 0, 40, 1.2); exitLight.position.set(cx(-92), 4, -92); gIn.add(exitLight);
  const exitGlow = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 0.5), new THREE.MeshBasicMaterial({ color: '#fffbe8', fog: false })); exitGlow.position.set(cx(-96), 4.5, -96.3); gIn.add(exitGlow);
  const lantern = new THREE.PointLight('#ffc46b', 18, 14, 1.4); gIn.add(lantern);
  const bugs = []; const bugM = new THREE.MeshBasicMaterial({ color: '#fff27a' });
  for (let i = 0; i < 34; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), bugM); b.userData = { x: cx(-42) + (r() - .5) * 12, y: 2 + r() * 6, z: -42 + (r() - .5) * 14, ph: r() * 6, sp: 0.5 + r() }; gIn.add(b); bugs.push(b); }
  const L = makeLurk(); gIn.add(L.root);
  for (let k = 0; k < 22; k++) burst(E.chase + k * 0.38, [0, 0, 0], { n: 0 });
  burst(E.faceplant, [0, 0.6, 9.2], { n: 30, colors: ['#c9a46a', '#ffffff', '#3cc2a3'], speed: 3, size: 0.16, life: 1, grav: 4, hemi: 1 });
  const hz = -40.5;
  function update(t) {
    const inCave = t >= E.caveSwap && t < E.exitFlash + 0.2;
    gOut.visible = !inCave; gIn.visible = inCave;
    let cam;
    if (!inCave && t < E.caveSwap) {
      const K = [[90, 0, 0.5, 22], [93, 0, 0.5, 22], [95.6, 0, 0.5, 12], [98, 0, 0.5, 8], [100.6, 0, 0.5, 0]];
      const w = walker(t, K, Math.PI); const o = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, t, mallet: true, headPitch: t < 95 ? -0.35 : 0 };
      if (win(t, 95.6, 98)) { o.yaw = 0; o.hips = true; o.face = 'smug'; }
      pose(hero, o);
      cam = camKeys(t, [[90, 4, 3, 30, 0, 2, 22, 55], [92.5, 2, 2.4, 27, 0, 6, 0, 60], [92.6, 0, 3, 40, 0, 10, -10, 62], [95.5, 0, 6, 34, 0, 12, -8, 62],
        [95.6, 1.0, 1.8, 15.6, 0, 1.6, 12, 46], [97.9, 0.8, 1.8, 15.2, 0, 1.6, 12, 44], [98, 3, 2.5, 13, 0, 3, 0, 55], [100.5, 1.5, 2.6, 7, 0, 2, -4, 55]]);
    } else if (inCave) {
      const K = [[100.5, cx(-2), 0.5, -2], [107.0, cx(-26), 0.5, -26], [112.4, cx(-34), 0.5, -34], [116.6, cx(hz), 0.5, hz], [E.chase, cx(hz), 0.5, hz],
        [E.chase + 0.6, cx(hz - 2), 0.5, hz - 2], [E.exitFlash, cx(-94), 0.5, -94]];
      const w = walker(t, K, Math.PI); let o = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, t, mallet: true };
      if (win(t, 107.0, 112.4)) o.headYaw = Math.sin(t * 1.5) * 0.6;
      if (win(t, 116.6, E.lurk)) { o.sit = ss(seg(t, 117.2, 118)); o.headPitch = -0.3; if (t > 123) { o.headYaw = Math.sin(t * 4) * 0.4; o.face = 'normal'; } }
      if (win(t, E.lurk, E.chase)) { o.sit = 1 - ss(seg(t, E.lurk + 0.2, E.lurk + 0.6)); o.face = 'scared'; o.spin = t > E.lurk + 0.4 ? Math.PI * ss(seg(t, E.lurk + 0.4, E.lurk + 0.8)) : 0; o.panic = t > E.lurk + 0.6; }
      if (t >= E.chase) { o.face = 'scared'; o.panic = true; o.walk = 1.3; }
      pose(hero, o);
      const hp = hero.root.position;
      lantern.position.set(hp.x, hp.y + 2.4, hp.z + 0.3);
      // lurk
      const LK = [[0, cx(-31), 0.5, -31], [E.lurk - 0.8, cx(-31), 0.5, -31], [E.lurk, cx(-36.5), 0.5, -36.5], [E.chase + 0.4, cx(-37), 0.5, -37], [E.chase + 0.4 + 0.01, cx(-37), 0.5, -37], [E.exitFlash, cx(-89), 0.5, -89]];
      const lw = walker(t, LK, Math.PI); L.root.visible = t > E.lurk - 1.2;
      poseLurk(L, t, lw.p, Math.PI, lw.speed);
      // bugs
      bugs.forEach((b, i) => { const u = b.userData; const lv = seg(t, E.bugsLeave + i * 0.03, E.bugsLeave + 1.6 + i * 0.03);
        b.position.set(u.x + Math.sin(t * u.sp + u.ph) * 0.8, u.y + Math.sin(t * 1.7 * u.sp + u.ph) * 0.4 + lv * lv * 12, u.z + Math.cos(t * u.sp + u.ph) * 0.8 - lv * lv * 25); b.scale.setScalar(1 - lv); });
      crystals.forEach((c, i) => c.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.05));
      exitLight.intensity = 120 * seg(t, E.light - 1, E.light + 1);
      const z0 = hp.z;
      cam = camKeys(t, [[100.5, cx(1), 2.6, 3, cx(-6), 1.6, -8, 60], [104, cx(-8), 2.6, -5, cx(-16), 2.6, -14, 60],
        [104.1, cx(-14), 3.5, -10.5, cx(-30), 4, -30, 62], [107.1, cx(-20), 3.0, -18, cx(-34), 4.5, -30, 60],
        [107.2, cx(-30) - 2.6, 1.7, -30 + 2.6, cx(-34), 3, -34, 50], [112.5, cx(-33) - 2.2, 2.6, -36 + 3.4, cx(-38), 4, -40, 55],
        [112.6, cx(hz) + 5, 3.5, hz + 6, cx(hz), 4.5, hz - 4, 62], [116.9, cx(hz) + 3, 2.8, hz + 4, cx(hz), 3.8, hz - 6, 60],
        [117.0, cx(hz) - 0.6, 1.5, hz - 3.9, cx(hz), 1.2, hz, 50], [122.9, cx(hz) - 0.4, 1.5, hz - 3.3, cx(hz), 1.2, hz, 45],
        [123.0, cx(hz) - 3, 3.4, hz - 1, cx(hz) - 0.5, 5, hz - 8, 58], [124.9, cx(hz) - 2, 2.4, hz - 0.5, cx(hz), 4, hz - 10, 58],
        [125.0, cx(hz) - 0.3, 1.3, hz - 2.4, cx(hz), 1.5, hz, 40], [125.29, cx(hz) - 0.3, 1.3, hz - 2.4, cx(hz), 1.5, hz, 40],
        [125.3, cx(hz) - 1.2, 1.4, hz - 2.0, cx(-36.5), 2.4, -36.5, 45], [126.7, cx(hz) - 1.0, 1.2, hz - 1.6, cx(-36.5), 2.4, -36.5, 32],
        [126.8, cx(hz - 6), 1.6, hz - 7.5, cx(hz), 1.6, hz, 55]]);
      if (t >= E.chase) {
        const cuts = [[0, 'front'], [2.6, 'side'], [4.3, 'front'], [6.4, 'back']];
        let mode = 'front'; for (const [d, m] of cuts) if (t - E.chase >= d) mode = m;
        const lp = L.root.position;
        if (mode === 'front') cam = { p: [cx(z0 - 4) + 0.5, 1.9, z0 - 4.5], l: [hp.x, 1.5, z0 + 1.5], fov: 60 };
        if (mode === 'side') cam = { p: [cx(z0) + 3.2, 2.4, z0 - 1.5], l: [cx(z0), 1.6, z0 + 2.5], fov: 70 };
        if (mode === 'back') cam = { p: [lp.x + 0.5, 3.3, lp.z + 3.2], l: [hp.x, 1.3, z0 - 6], fov: 66 };
      }
    } else {
      const K = [[E.exitFlash, 0, 0.5, -2], [E.faceplant - 0.2, 0, 0.5, 8.6], [140, 0, 0.5, 8.6]];
      const w = walker(t, K, 0); const o = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, t, mallet: true, face: 'scared', panic: t < E.faceplant - 0.2 };
      if (t >= E.faceplant - 0.2) { const k = seg(t, E.faceplant - 0.2, E.faceplant + 0.15); o.flat = k * k; o.walk = 0; }
      if (t > 138.5) o.face = 'soot';
      pose(hero, o);
      exitEyes.visible = t > 136 && t < 139.4; exitEyes.scale.y = (Math.floor(t * 3) % 5 === 0) ? 0.2 : 1;
      exitEyes.position.z = -2.5 - seg(t, 138.6, 139.4) * 3;
      cam = camKeys(t, [[E.exitFlash, 4, 1.5, 14, 0, 2, 0, 60], [E.faceplant, 3, 1.8, 13, 0, 1.6, 4, 55], [140, 2, 2.5, 15, 0, 1.2, 4, 52]]);
    }
    return { cam, hud: true, day: 1, cave: inCave };
  }
  return { g: gOut, update, cx };
})();

// ================================================================ SCENE 4-6: HOMESTEAD (build, night, ending)
const home = (() => {
  const g = mk('home'), st = new VSet(g), hs = new VSet(g, true), pb = new VSet(g, true), r = rng(31);
  const hf = (x, z) => { const d = Math.hypot(x, z); return Math.round((vnoise(x / 10, z / 10, 12) * 7 - 1) * ss((d - 16) / 14)); };
  for (let x = -50; x <= 50; x++) for (let z = -50; z <= 50; z++) {
    if (Math.abs(x) <= 3 && Math.abs(z) <= 3) continue; // floor area
    const h = hf(x, z); st.add(x, h, z, 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil');
  }
  for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) st.add(x, -1, z, 'soil');
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 96), z = Math.round((r() - .5) * 96); const d = Math.hypot(x, z); if (d < 17 || (Math.abs(x) < 13 && z > 12 && z < 44) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  // ---- house plan with appear times
  const plan = []; const add = (x, y, z, type, t0) => plan.push([x, y, z, type, t0]);
  let tt = E.floor; const step = (n, a, b) => (b - a) / n;
  // floor
  { const cells = []; for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) cells.push([x, z]); cells.forEach(([x, z], i) => add(x, 0, z, 'plank', E.floor + i * (E.walls - E.floor) / cells.length)); }
  // walls
  { const cells = []; for (let y = 1; y <= 4; y++) for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) { if (Math.abs(x) !== 3 && Math.abs(z) !== 3) continue; if (z === 3 && Math.abs(x) <= 1 && y <= 3) continue; cells.push([x, y, z]); }
    cells.forEach(([x, y, z], i) => add(x, y, z, (Math.abs(x) === 3 && Math.abs(z) === 3) ? 'log' : 'plank', E.walls + i * (150.4 - E.walls) / cells.length)); }
  // roof (pyramid)
  { const cells = []; for (let l = 0; l < 4; l++) { const R = 4 - l; for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) if (l === 3 || Math.abs(x) === R || Math.abs(z) === R) cells.push([x, 5 + l, z]); }
    cells.forEach(([x, y, z], i) => add(x, y, z, 'slate', E.roof + i * (154 - E.roof) / cells.length)); }
  // tower 1 (solid castle)
  { const cells = []; for (let y = 1; y <= 12; y++) for (let x = -6; x <= -4; x++) for (let z = -6; z <= -4; z++) if (x !== -5 || z !== -5) cells.push([x, y, z, 'castle']);
    for (const [x, z] of [[-6, -6], [-4, -6], [-6, -4], [-4, -4]]) cells.push([x, 13, z, 'castle']);
    cells.forEach(([x, y, z, ty], i) => add(x, y, z, ty, E.tower1 + i * (157 - E.tower1) / cells.length)); }
  // tower 2 (crooked, mismatched)
  { const cells = []; for (let y = 1; y <= 16; y++) { const o = Math.floor(y / 5); for (const [x, z] of [[4, -5], [5, -5], [4, -6], [5, -6]]) cells.push([x + o, y, z, y % 4 === 0 ? 'jade' : 'castle']); }
    cells.push([7, 17, -6, 'leaf'], [7, 18, -6, 'leaf'], [8, 17, -6, 'jam']);
    cells.forEach(([x, y, z, ty], i) => add(x, y, z, ty, E.tower2 + i * (160.6 - E.tower2) / cells.length)); }
  // mismatched annex + stairs to nowhere + chimney + the ugly roof block
  { const cells = [], types = ['buzz', 'jam', 'jade', 'polka', 'sand', 'leaf', 'polka', 'buzz'];
    for (let x = 4; x <= 7; x++) for (let z = -1; z <= 3; z++) { const hh = 1 + Math.floor(hash2(x, z, 5) * 5); for (let y = 1; y <= hh; y++) if (hash2(x * 3, y + z * 7, 6) > 0.18) cells.push([x, y, z, types[Math.floor(hash2(x, y * 5 + z, 7) * types.length)]]); }
    for (let i = 0; i < 9; i++) cells.push([-5 - Math.floor(i / 2), 1 + i, 1 + (i % 2), types[i % types.length]]);
    for (let y = 7; y <= 11; y++) cells.push([2, y, -2, y % 2 ? 'jam' : 'leaf']);
    cells.push([1, 9, 0, 'buzz']);
    cells.forEach(([x, y, z, ty], i) => add(x, y, z, ty, E.mismatch + 0.4 + i * (171.2 - E.mismatch) / cells.length)); }
  const blocks = plan.map(([x, y, z, type, t0]) => hs.add(x, y, z, type, { t0 }));
  // windows: swap some wall blocks to glass
  const winT = (i, n) => E.windows + 0.2 + i * 3.6 / n;
  { const sel = blocks.filter(b => b.type === 'plank' && b.y >= 2 && b.y <= 3 && (Math.abs(b.x) === 3 || Math.abs(b.z) === 3) && ((b.x + b.z + b.y) % 2 === 0 || b.y === 2));
    sel.forEach((b, i) => { b.t1 = winT(i, sel.length); hs.add(b.x, b.y, b.z, 'glass', { t0: b.t1 }); });
    const extra = [[-5, 6, -3], [-5, 8, -3], [-3, 10, -5], [6, 9, -4], [4, 11, -4], [7, 6, -4], [0, 7, 4], [-2, 6, 4], [2, 6, 4], [-4, 3, 0], [-4, 4, 0], [8, 3, 1]];
    extra.forEach(([x, y, z], i) => hs.add(x, y, z, 'glass', { t0: winT(i, extra.length) + 0.1 })); }
  // wall break (west wall, x=-3)
  const wallHit = [];
  for (let z = -1; z <= 1; z++) for (let y = 1; y <= 3; y++) for (const b of hs.at(-3, y, z)) { if (b.t1 === undefined) { b.t1 = E.wallBreak + r() * 0.06; b.fly = [7 + r() * 6, 3 + r() * 5, (r() - .5) * 6]; b.spin = [r() * 12 - 6, r() * 12 - 6, r() * 12 - 6]; b.floor = 0.9; wallHit.push(b); } }
  // break the ugly block
  for (const b of hs.at(1, 9, 0)) if (b.t1 === undefined) { b.t1 = E.breakBlock; }
  // collapse: everything else falls into rubble
  for (const arr of Object.values(hs.items)) for (const b of arr) {
    b.wob = [E.creak, E.collapse];
    if (b.t1 !== undefined) continue;
    const d = Math.hypot(b.x, b.z) + 0.1;
    b.t1 = E.collapse + r() * 0.45 + Math.max(0, 6 - b.y) * 0.02; b.keep = true;
    const out = b.y > 9 ? 3 + r() * 3 : 0.4 + r() * 1.6;
    b.fly = [b.x / d * out + (r() - .5), r() * 2, b.z / d * out + (r() - .5)]; b.spin = [r() * 6 - 3, r() * 6 - 3, r() * 6 - 3];
    b.floor = 1.0 + Math.max(0, 3.2 - d * 0.35) * (0.5 + 0.5 * r()) + (b.y > 9 ? 0 : r() * 0.6);
    if (b.y === 0) { b.fly = [0, 0, 0]; b.floor = 0; b.spin = [0, 0, 0]; }
  }
  hs.build();
  // giant door
  const door = new THREE.Group(); door.position.set(0, 0.5, 3.75); g.add(door);
  const dtex = TX.plank.clone(); dtex.wrapS = dtex.wrapT = THREE.RepeatWrapping; dtex.repeat.set(5, 9); dtex.needsUpdate = true;
  const doorPanel = new THREE.Mesh(new THREE.BoxGeometry(5, 9, 0.5), new THREE.MeshLambertMaterial({ map: dtex, color: '#ff9c7a' })); doorPanel.position.set(0, 4.5, 0); doorPanel.castShadow = true; door.add(doorPanel);
  box(5.4, 0.4, 0.6, '#8a3b2a', 0, 9.1, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', -2.7, 4.5, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', 2.7, 4.5, 0, door);
  box(0.5, 0.5, 0.3, '#ffd23f', 1.8, 4.2, 0.35, door); box(3.6, 0.3, 0.55, '#8a3b2a', 0, 2.5, 0.05, door); box(3.6, 0.3, 0.55, '#8a3b2a', 0, 6.5, 0.05, door);
  // panic blocks + pillar
  const ptypes = ['buzz', 'jam', 'jade', 'polka', 'plank', 'sand', 'glass', 'leaf', 'castle'];
  const PK = [[E.panic, -0.5, 0.5, 0.5], [E.panic + 1.2, 1.8, 0.5, -1.5], [E.panic + 2.4, -1.6, 0.5, -1.8], [E.panic + 3.4, 0.2, 0.5, 2.0], [E.panic + 4.4, 0.2, 0.5, 5.8],
    [E.panic + 5.6, 3.6, 0.5, 7.4], [E.panic + 6.8, 7.8, 0.5, 6.0], [E.panic + 7.8, 9.4, 0.5, 2.0], [E.panic + 8.8, 8.2, 0.5, -1.0], [E.panicEnd, 5.0, 0.5, 0.0]];
  for (let k = 0; k * 0.2 < E.panicEnd - E.panic - 0.3; k++) { const tk = E.panic + 0.4 + k * 0.2; const p = track(tk, PK).p; const x = Math.round(p[0] + (r() - .5) * 2.4), z = Math.round(p[2] + (r() - .5) * 2.4); if (Math.abs(x) <= 2 && Math.abs(z) <= 2 && r() < 0.5) continue; if (Math.abs(x - 5) < 1 && Math.abs(z) < 1) continue; pb.add(x, 1 + (r() < 0.25 ? 1 : 0), z, ptypes[k % ptypes.length], { t0: tk }); }
  for (let y = 1; y <= 8; y++) pb.add(5, y, 0, ptypes[(y * 3) % ptypes.length], { t0: E.pillar + (y - 1) * 0.48 });
  pb.build();
  // monsters
  const G1 = makeGrumble(1.6), G2 = makeGrumble(1), G3 = makeGrumble(1.1), G4 = makeGrumble(0.9), S1 = makeStilt(), S2 = makeStilt();
  g.add(G1.root, G2.root, G3.root, G4.root, S1.root, S2.root);
  const bombObj = new THREE.Group(); g.add(bombObj);
  box(0.36, 0.36, 0.36, 0, 0, 0, 0, bombObj, new THREE.MeshLambertMaterial({ color: '#ff3d7f', emissive: '#ff2266', emissiveIntensity: 0.6 })); box(0.16, 0.08, 0.16, '#3cc26a', 0, 0.21, 0, bombObj);
  const lamp = new THREE.PointLight('#ffb35c', 0, 14, 1.5); lamp.position.set(0, 3, 0); g.add(lamp);
  const boomL = new THREE.PointLight('#ffb050', 0, 16, 1.5); g.add(boomL);
  // bursts
  burst(E.door, [0, 4, 4.2], { n: 70, colors: ['#ffe066', '#ff9ecb', '#5ff7ff', '#ffffff'], speed: 7, size: 0.18, life: 1.6, grav: 6 });
  burst(E.proud + 0.3, [0, 6, 4], { n: 140, colors: ['#ffe066', '#ff5cf0', '#5ff7ff', '#7cff6b', '#ff8a2a'], speed: 9, size: 0.2, life: 2.6, grav: 5, up: 5 });
  const mobSpawns = [[-11, 0.5, -1], [9, 0.5, 7], [-8, 0.5, 8], [2, 0.5, -11], [10, 0.5, 4.5], [-11, 0.5, 10]];
  mobSpawns.forEach((p, i) => burst(E.spawnMobs + i * 0.45, [p[0], 0.8, p[2]], { n: 40, colors: ['#6e452d', '#8b5a3c', '#3cc2a3', '#b04bff'], speed: 4, size: 0.2, life: 1.2, grav: 9, hemi: 1, up: 3 }));
  for (let k = 0; k < 3; k++) burst(E.bombBoom, [-1.9, 1.0, 0.3], { n: 90, colors: ['#ffef7a', '#ff9a3c', '#ff3d7f', '#ffffff'], speed: 7, size: 0.3, life: 1.1, grav: 2, drag: 2 });
  burst(E.bombBoom + 0.1, [-1.9, 1.0, 0.3], { n: 60, colors: ['#555', '#777', '#999'], speed: 3, size: 0.6, life: 2.2, grav: -1, drag: 1.2 });
  burst(E.wallBreak, [-3, 2, 0], { n: 120, colors: ['#e0a95a', '#9c6a2f', '#aaeeff', '#7cff6b'], speed: 9, size: 0.22, life: 1.4, grav: 12 });
  burst(E.breakBlock, [1, 9, 0], { n: 40, colors: ['#ffd400', '#1c1c1c'], speed: 4, size: 0.16, life: 1, grav: 10 });
  burst(E.creak, [0, 6, 0], { n: 40, colors: ['#c9a46a', '#999'], speed: 2, size: 0.12, life: 1.5, grav: 3 });
  for (let k = 0; k < 6; k++) burst(E.collapse + 0.6 + k * 0.25, [(k - 2.5) * 2.5, 1.2, (k % 2 ? 2 : -2)], { n: 70, colors: ['#bba98a', '#9c8b70', '#d9ccb0', '#888'], speed: 7, size: 0.9, life: 2.8, grav: -0.6, drag: 1.5, hemi: 1, up: 1 });
  burst(E.heroLand, [0, 4.8, 0.6], { n: 40, colors: ['#ddd', '#bbb'], speed: 4, size: 0.4, life: 1.5, grav: 0, drag: 2, hemi: 1 });
  burst(E.bonkHead, [0.0, 6.6, 0.9], { n: 20, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.12, life: 0.8, grav: 0 });
  mobSpawns.forEach((p, i) => burst(E.retreat + i * 0.5, [p[0] * 0.7, 0.8, p[2] * 0.7], { n: 40, colors: ['#888', '#b04bff', '#ddd'], speed: 3, size: 0.4, life: 1.6, grav: -1, drag: 1.5, hemi: 1 }));
  const bonkBlock = new THREE.Mesh(GEO, MAT.polka); g.add(bonkBlock); const HL = 4.4;
  // ---------------- update
  function heroAt(t) {
    // returns pose options for the hero across 140..300
    let o = { t, mallet: true };
    if (t < E.door) {
      // timelapse builder: zips around the site
      const ang = t * 2.1, rr = 5.2 + Math.sin(t * 0.9) * 1.3; let p = [Math.sin(ang) * rr, 0.5, Math.cos(ang) * rr];
      if (t < E.floor) { const w = walker(t, [[140, 0, 0.5, 9], [142.6, 0, 0.5, 6.5]], Math.PI); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'soot', mallet: false }; }
      if (t > 171.6) p = [lerp(p[0], 0, seg(t, 171.6, 172.6)), 0.5, lerp(p[2], 8, seg(t, 171.6, 172.6))];
      const yaw = Math.atan2(Math.cos(ang), -Math.sin(ang));
      const blk = ['plank', 'plank', 'slate', 'castle', 'castle', 'glass', 'buzz'][t < E.walls ? 0 : t < E.roof ? 1 : t < E.tower1 ? 2 : t < E.tower2 ? 3 : t < E.windows ? 4 : t < E.mismatch ? 5 : 6];
      return { ...o, p, yaw: t > 171.6 ? Math.PI : yaw, walk: t > 172.6 ? 0 : 1.2, phase: t * 14, mallet: false, block: blk, hold: true, face: t > 166 ? 'smug' : 'normal' };
    }
    if (t < E.dusk) { // admire
      const p = [0, 0.5, 9.5];
      return { ...o, p, yaw: t < E.proud ? Math.PI : 0, hips: t >= E.proud, face: t < 176.6 ? 'normal' : 'smug', headPitch: t < E.proud ? -0.6 : 0, wave: win(t, E.proud + 2.5, E.proud + 4) };
    }
    if (t < 209) { const w = walker(t, [[E.dusk, 0, 0.5, 9.5], [191.5, 0, 0.5, 9.5], [194, 0.2, 0.5, 4.5], [196, -1.5, 0.5, 1.8], [209, -1.5, 0.5, 1.8]], t > 196 ? Math.PI * 0.1 : undefined);
      return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, headPitch: win(t, 195.4, 199) ? -0.6 : 0, face: t > 200.4 ? 'scared' : 'normal' }; }
    if (t < E.bombBoom) { const p = [-2.0, 0.5, 0.5], ob = { ...o, p, yaw: -Math.PI / 2 };
      if (win(t, E.swing1, E.swing1 + 0.5)) ob.swing = (t - E.swing1) / 0.5; if (win(t, E.swing2, E.swing2 + 0.5)) ob.swing = (t - E.swing2) / 0.5;
      if (t >= 215.6) { ob.mallet = false; ob.bomb = t < E.bombThrow; ob.swing = t < E.bombThrow ? 0.3 : clamp((t - E.bombThrow) / 0.5, 0, 0.99); }
      if (t > E.bombBack - 0.2) { ob.face = 'scared'; ob.panic = true; }
      return ob; }
    if (t < E.panic) { const p = [-2.0, 0.5, 0.5]; const k = seg(t, E.bombBoom, E.bombBoom + 0.4);
      const ob = { ...o, p: [p[0] + 0.7 * k, 0.5 + Math.sin(k * Math.PI) * 0.8, p[2]], yaw: -Math.PI / 2, face: 'soot', sit: t < 221.2 ? k : 1 - seg(t, 221.2, 221.8), headRoll: Math.sin(t * 3) * 0.15 * (t < 222 ? 1 : 0) };
      if (t > E.wallBreak) { ob.face = 'scared'; ob.panic = true; ob.yaw = -Math.PI / 2; ob.sit = 0; ob.p = [-1.4 + Math.sin(t * 9) * 0.1, 0.5, 0.5]; }
      return ob; }
    if (t < E.pillar) { const w = walker(t, PK); return { ...o, p: w.p, yaw: w.yaw, walk: 1.3, phase: w.phase, face: 'scared', mallet: false, block: ptypes[Math.floor(t * 5) % ptypes.length], hold: true, headYaw: Math.sin(t * 7) * 0.4 }; }
    if (t < E.roofHop) { const k = (t - E.pillar) / 0.48, n = Math.floor(k), f = k - n; const y = 0.5 + Math.min(8, n + Math.min(1, f * 1.6)) + Math.sin(Math.min(1, f * 1.4) * Math.PI) * 0.5;
      return { ...o, p: [5, Math.min(8.5, y), 0], yaw: Math.PI, face: 'scared', mallet: false, block: ptypes[n % ptypes.length], hold: true, headPitch: 0.6, lL: 1 }; }
    if (t < E.dawn) { const k = seg(t, E.roofHop, E.roofHop + 0.7); const p = [lerp(5, -0.4, k), 8.5 + Math.sin(k * Math.PI) * 1.2, 0];
      return { ...o, p, yaw: -Math.PI / 2 + (t > E.roofHop + 1 ? Math.PI : 0), face: 'scared', sit: t > 244 ? 1 : 0, headPitch: t > 244 ? 0.5 : 0, headYaw: Math.sin(t * 2) * 0.5, mallet: false }; }
    // ending on roof
    if (t < E.collapse) { const ob = { ...o, p: [-0.4, 8.5, 0], yaw: Math.PI / 2, face: 'normal' };
      if (t < 254) { ob.sit = 1 - seg(t, 252, 253); ob.yaw = Math.PI / 2 + 0.4; }
      if (win(t, 254, 267.8)) { ob.yaw = Math.PI / 2 + Math.sin(t * 0.3) * 0.6; ob.hips = t > 261; ob.face = t > 261 ? 'smug' : 'normal'; }
      if (win(t, 267.8, E.creak)) { ob.headPitch = -0.6; ob.face = 'smug'; if (t > E.swingBlock) ob.swing = clamp((t - E.swingBlock) / 0.6, 0, 0.99) * 2 % 1; }
      if (t >= E.creak) { ob.face = 'scared'; ob.headYaw = Math.sin(t * 6) * 0.6; ob.p = [-0.4 + (t > E.creak ? Math.sin(t * 40) * 0.03 : 0), 8.5, 0]; }
      return ob; }
    { const k = seg(t, E.collapse + 0.15, E.heroLand); const y = lerp(8.5, HL, k * k);
      const ob = { ...o, p: [-0.4, y, lerp(0, 0.8, k)], yaw: Math.PI / 2, face: 'scared', panic: t < E.heroLand, mallet: false };
      if (t >= E.heroLand) { ob.flat = 1 - seg(t, 279.8, 280.5); ob.flatDir = -1; ob.panic = false; ob.p = [-0.4, HL, 0.8]; ob.yaw = 0.3; ob.sit = seg(t, 279.8, 280.5); if (t > 280.5) { ob.panic = t < 283; ob.headYaw = Math.sin(t * 3) * 0.3; } if (t > E.bonkHead) { ob.headRoll = 0.4 * Math.exp(-(t - E.bonkHead) * 2) * Math.sin(t * 20); ob.face = 'soot'; } }
      return ob; }
  }
  function mobs(t) {
    const show = t >= E.spawnMobs - 0.2 && t < E.retreat + 3.5;
    [G1, G2, G3, G4, S1, S2].forEach(m => m.root.visible = show);
    if (!show) return;
    const rise = (i) => { const k = seg(t, E.spawnMobs + i * 0.45, E.spawnMobs + i * 0.45 + 1.0); const sink = seg(t, E.retreat + i * 0.5, E.retreat + i * 0.5 + 1.4); return -2.2 * (1 - k) - 6 * sink * sink; };
    const hp = hero.root.position.toArray();
    // G1 big: smashes west wall then chases
    let p1 = track(t, [[0, -11, 0.5, -1], [E.spawnMobs + 1, -11, 0.5, -1], [209, -8.2, 0.5, -1.6], [E.wallBreak - 0.6, -7.6, 0.5, -0.4], [E.wallBreak, -4.6, 0.5, 0], [E.panic, -2.5, 0.5, 0.5], [E.panic + 4, 0, 0.5, 4.5], [E.panicEnd, 5, 0.5, 3.0], [E.climbFail, 5.2, 0.5, 1.6], [E.retreat, 5.2, 0.5, 2.0]]).p;
    if (win(t, E.climbFail, E.climbFail + 1.6)) { const k = seg(t, E.climbFail, E.climbFail + 1.6); p1 = [5.2 - Math.sin(k * Math.PI) * 0.4, 0.5 + Math.sin(k * Math.PI) * 4.5, 1.6 - Math.sin(k * Math.PI) * 0.6]; }
    p1[1] += rise(0);
    poseGrumble(G1, t, p1, yawTo(p1, hp), t > E.panic ? 1.3 : 0.6, 0);
    if (win(t, E.climbFail, E.climbFail + 1.6)) G1.root.rotation.z = Math.sin(seg(t, E.climbFail + 0.8, E.climbFail + 1.6) * Math.PI) * 0.8;
    else G1.root.rotation.z = 0;
    const p2 = track(t, [[0, 9, 0.5, 7], [E.spawnMobs + 1.5, 9, 0.5, 7], [209, 5.5, 0.5, 6.5], [E.panic, 5, 0.5, 7], [E.panicEnd, 7, 0.5, -2], [E.retreat, 6.5, 0.5, -2.5]]).p; p2[1] += rise(1);
    poseGrumble(G2, t, p2, yawTo(p2, hp), 1, 0.3);
    let p3 = track(t, [[0, -8, 0.5, 8], [E.spawnMobs + 2, -8, 0.5, 8], [209, -2.0, 0.5, 6.4], [E.panic, -1.2, 0.5, 6.4], [E.panicEnd, 2, 0.5, 9], [E.retreat, 2.5, 0.5, 7.5]]).p; p3[1] += rise(2);
    if (win(t, 209, E.bombBoom)) p3 = [-5.9 + Math.cos(t * 1.7) * 0.4, 0.5 + rise(2), 1.6 + Math.sin(t * 2.2) * 1.2];
    poseGrumble(G3, t, p3, yawTo(p3, hp), 1.2, 0.6);
    const p4 = track(t, [[0, 2, 0.5, -11], [E.spawnMobs + 2.5, 2, 0.5, -11], [209, 1.5, 0.5, -7.5], [E.retreat, -1, 0.5, -7.5]]).p; p4[1] += rise(3);
    poseGrumble(G4, t, p4, yawTo(p4, hp), 1, 0.1);
    const s1 = walker(t, [[0, 10, 0.5, 4.5], [E.spawnMobs + 3, 10, 0.5, 4.5], [209, 6.5, 0.5, 7.5], [229.5, 3.4, 0.5, 6.6], [E.panicEnd, 2.8, 0.5, 6.0], [E.climbFail, 7, 0.5, 2], [E.retreat, 7.5, 0.5, 2.5]]);
    const ps1 = [...s1.p]; ps1[1] += rise(4) * 2.4; poseStilt(S1, t, ps1, yawTo(ps1, hp), s1.walk, s1.phase);
    const s2 = walker(t, [[0, -11, 0.5, 10], [E.spawnMobs + 3.4, -11, 0.5, 10], [212, -6.5, 0.5, 7.0], [E.retreat, -7, 0.5, 6.5]]);
    const ps2 = [...s2.p]; ps2[1] += rise(5) * 2.4; poseStilt(S2, t, ps2, yawTo(ps2, hp), s2.walk, s2.phase);
  }
  function update(t) {
    hs.update(t); pb.update(t);
    pose(hero, heroAt(t)); hero.root.visible = true;
    mobs(t);
    // door
    door.visible = t >= E.door;
    if (door.visible) { const k = seg(t, E.door, E.door + 0.6); door.scale.set(1, Math.max(0.01, backOut(k)), 1);
      const kc = seg(t, E.collapse + 0.4, E.collapse + 1.4); let rot = kc * kc * Math.PI / 2; if (kc >= 1) rot = Math.PI / 2 - Math.abs(Math.sin((t - E.collapse - 1.4) * 9)) * 0.08 * Math.exp(-(t - E.collapse - 1.4) * 4);
      door.rotation.x = rot; if (win(t, E.creak, E.collapse + 0.4)) door.rotation.z = Math.sin(t * 30) * 0.01; else door.rotation.z = 0; door.position.y = 0.5; }
    // bomb at night
    bombObj.visible = win(t, E.bombThrow + 0.1, E.bombBoom);
    if (bombObj.visible) { const A = [-2.6, 2.2, 0.8], B = [-5.6, 1.4, 1.6], C2 = [-1.9, 0.7, 0.3]; let p;
      if (t < E.bombBack) { const k = seg(t, E.bombThrow + 0.1, E.bombBack); p = [lerp(A[0], B[0], k), lerp(A[1], B[1], k) + Math.sin(k * Math.PI) * 1.6, lerp(A[2], B[2], k)]; }
      else { const k = seg(t, E.bombBack, E.bombBack + 0.7); p = [lerp(B[0], C2[0], k), lerp(B[1], C2[1], k) + Math.sin(k * Math.PI) * 1.8, lerp(B[2], C2[2], k)]; if (k >= 1) p[1] = 0.7 + Math.abs(Math.sin(t * 9)) * 0.15; }
      bombObj.position.set(...p); bombObj.rotation.set(t * 9, t * 5, 0); bombObj.scale.setScalar(1 + (t > E.bombBoom - 0.6 ? Math.sin(t * 50) * 0.15 : 0)); }
    boomL.position.set(-1.9, 1.5, 0.3); boomL.intensity = t >= E.bombBoom ? 300 * Math.exp(-(t - E.bombBoom) * 4) : 0;
    lamp.intensity = (t > 192 && t < E.dawn + 4) ? 20 * seg(t, 192, 196) * (t > E.wallBreak ? 0.8 + 0.2 * Math.sin(t * 13) : 1) : 0;
    bonkBlock.visible = win(t, E.bonkHead - 0.6, 291.8);
    if (bonkBlock.visible) { const k = seg(t, E.bonkHead - 0.6, E.bonkHead); bonkBlock.position.set(-0.3 + seg(t, E.bonkHead, E.bonkHead + 0.5) * 0.8, lerp(12, HL + 2.4, k * k) - (t > E.bonkHead ? Math.sin(seg(t, E.bonkHead, E.bonkHead + 0.5) * Math.PI) * -0.6 + seg(t, E.bonkHead, E.bonkHead + 0.5) * 1.6 : 0), 0.9); bonkBlock.rotation.set(0, t > E.bonkHead ? (t - E.bonkHead) * 3 : 0, 0); }
    return { cam: homeCam(t), hud: true };
  }
  function orbit(t, r0, h, a0, speed, look = [0, 3, 0], fov = 55) { const a = a0 + t * speed; return { p: [Math.sin(a) * r0 + look[0], h, Math.cos(a) * r0 + look[2]], l: look, fov }; }
  function homeCam(t) {
    const hp = hero.root.position;
    if (t < E.floor) return camKeys(t, [[140, 2, 1.5, 12.5, 0, 1.4, 6.5, 50], [142.9, 1.5, 2.2, 11, 0, 1.5, 6.5, 48], [143.0, 0, 9, 22, 0, 2, 0, 55]]);
    if (t < E.door) {
      if (t < E.roof) return camKeys(t, [[E.floor, 0, 9, 22, 0, 2, 0, 55], [146.3, 12, 8, 17, 0, 2, 0, 55], [146.4, -3, 4, 11, 0, 2.2, 0, 55], [151.2, -12, 6, 12, 0, 2.5, 0, 55]]);
      if (t < E.tower1) return orbit(t - E.roof, 19, 9, -0.7, 0.12, [0, 4, 0], 55);
      if (t < E.windows) return camKeys(t, [[E.tower1, -14, 8, 14, -1, 6, -3, 58], [E.tower2, -6, 9, 18, 0, 7, -3, 60], [160.5, 14, 11, 16, 3, 8, -4, 60]]);
      if (t < E.mismatch) return orbit(t - E.windows, 17, 6, 0.3, 0.2, [0, 4, 0], 55);
      return camKeys(t, [[E.mismatch, 18, 5, 10, 4, 3, 0, 55], [169, 14, 7, 4, 5, 3, 1, 55], [169.1, -12, 6, 6, -5, 4, 1, 55], [172.3, -10, 9, 10, 0, 7, -1, 55]]);
    }
    if (t < E.dusk) return camKeys(t, [[E.door, 0, 3, 19, 0, 4, 0, 60], [176.5, 0, 1.2, 15, 0, 6, 0, 70], [176.6, -6, 1.5, 18, 0, 5, 3, 62], [181.5, 4, 2, 18, 0, 5, 3, 62],
      [181.6, 0, 4.5, 26, 0, 5.5, 0, 55], [184.5, 0, 2.2, 15, 0, 4, 6, 55], [184.6, -14, 7, 22, 0, 6, 0, 50], [E.dusk, 14, 9, 22, 0, 6, 0, 50]]);
    if (t < 209) return camKeys(t, [[E.dusk, 14, 9, 22, 0, 6, 0, 50], [194, 0, 6, 26, 0, 9, -20, 62], [195.3, -2, 5, 18, -10, 26, -40, 62], [199, -1, 4.5, 16, -12, 30, -50, 62],
      [200.4, 0, 14, 22, 0, 0, 0, 60], [203.8, 3, 13, 18, 0, 0, 0, 60], [204.4, -1.0, 2.6, 14.5, -6, 1.6, 7, 52], [205.9, -0.6, 2.6, 15.0, -6, 1.6, 7, 52],
      [206.0, 7, 4.2, 9.5, 10, 3.6, 4.5, 50], [207.5, 7, 4.2, 9.5, 10, 3.6, 4.5, 50], [207.6, -1.5, 2.2, 0.5, -1.8, 1.8, 6, 60], [209, -1.5, 2.2, 0.5, -1.8, 1.8, 6, 60]]);
    if (t < E.bombBoom + 1.2) return camKeys(t, [[209, 0.8, 2.7, 0.0, -6, 2.0, 1.2, 55], [211.3, 0.6, 2.7, 0.2, -6, 2.0, 1.2, 55], [211.4, -5.2, 2.6, 4.6, -2.4, 2.0, 0.4, 50], [213.5, -5.0, 2.6, 4.4, -2.4, 2.0, 0.4, 48],
      [213.6, 0.8, 2.7, 0.0, -6, 2.0, 1.2, 55], [216.9, 0.6, 2.7, 0.2, -6, 2.0, 1.2, 55], [217.0, -4.5, 3.6, 7.5, -4, 1.5, 0.8, 58], [218.4, -4.2, 3.8, 7.2, -3.6, 1.5, 0.8, 58],
      [218.5, 0.6, 1.8, -0.8, -2.0, 1.0, 0.4, 55], [E.bombBoom + 1.2, 0.8, 2.0, -0.8, -2.0, 1.0, 0.4, 55]]);
    if (t < E.panic) return camKeys(t, [[220.6, 1.0, 2.3, 1.8, -1.6, 1.4, 0.3, 55], [223.5, 0.8, 2.3, 1.6, -1.6, 1.4, 0.3, 50], [223.6, 2.2, 3, 2.6, -3.5, 1.8, 0, 66], [E.panic, 1.8, 3.2, 2.2, -3, 1.6, 0, 62]]);
    if (t < E.pillar) { // fast cuts
      const cuts = [[0, 0], [1.2, 1], [2.3, 2], [3.4, 0], [4.4, 3], [5.6, 1], [6.8, 2], [7.8, 3], [9.0, 0]]; let m = 0; for (const [d, k] of cuts) if (t - E.panic >= d) m = k;
      if (m === 0) return { p: [hp.x + 3.5, 3.2, hp.z + 4.5], l: [hp.x, 1.3, hp.z], fov: 55 };
      if (m === 1) return { p: [hp.x - 1.5, 1.4, hp.z + 2.2], l: [hp.x, 1.6, hp.z], fov: 50 };
      if (m === 2) return { p: [0, 22, 0.5], l: [0, 0, 0], fov: 60 };
      return { p: [hp.x + 6, 1.2, hp.z - 6], l: [hp.x, 2, hp.z], fov: 70 };
    }
    if (t < E.hours) return camKeys(t, [[E.pillar, 11, 3, 4, 5, 3, 0, 60], [E.roofHop, 13, 9, 6, 4, 7, 0, 60], [E.roofHop + 0.01, 9, 13, 10, 1, 8, 0, 55], [241.5, 9, 13, 10, 1, 8, 0, 55],
      [241.6, 10, 2, 5, 5, 3, 1.8, 58], [243.3, 10, 2, 5, 5, 3, 1.8, 58], [243.4, 12, 4, 6, 5, 4, 1.8, 62], [E.hours, 12, 4, 5, 5, 3, 1.8, 62]]);
    if (t < E.collapse) return camKeys(t, [[E.hours, -12, 16, 16, 0, 8, 0, 55], [E.dawn, -12, 16, 16, 0, 8, 0, 55], [254, -4, 10.5, 4.5, -0.4, 9.8, 0, 52],
      [255.4, -22, 7, -6, 0, 6, 0, 55], [258.4, -6, 22, -25, 0, 5, 0, 55], [261.3, 18, 24, -20, 0, 5, 0, 55],
      [261.4, 2.5, 10.2, 3.6, -0.4, 10, 0, 45], [267.7, 2.2, 10.0, 3.0, -0.4, 10, 0, 42], [267.8, -2.8, 11.2, 2.0, 1, 9.2, 0, 50], [E.creak, -2.6, 11.0, 1.8, 1, 9.2, 0, 50],
      [E.creak + 0.01, 0, 7, 30, 0, 6, 0, 55], [E.collapse, 0, 7, 29, 0, 6, 0, 55]]);
    return camKeys(t, [[E.collapse, 0, 7, 29, 0, 6, 0, 55], [E.heroLand + 0.6, 0, 7, 22, 0, 4, 0, 58], [279.9, 0, 7, 20, 0, 4, 0, 58],
      [280.0, 2.6, 6.6, 6.2, -0.4, 5.4, 0.8, 50], [282.9, 2.4, 6.6, 5.6, -0.4, 5.4, 0.8, 46], [283.0, 2.0, 6.6, 4.8, -0.4, 5.5, 0.8, 42], [292, 2.2, 6.8, 5.0, -0.4, 5.5, 0.8, 42]]);
  }
  return { g, update };
})();

// ---------------------------------------------------------------- lighting per time
function sky(t, sec) {
  const day = { top: '#5db8ff', bot: '#d4f1ff', sunI: 2.6, hemiI: 1.5, fog: '#cfefff', sunEl: 0.9, sunAz: 0.6 };
  const dusk = { top: '#5d3d8f', bot: '#ff9f6b', sunI: 1.4, hemiI: 0.9, fog: '#d48a7a', sunEl: 0.06, sunAz: -0.4 };
  const night = { top: '#070a26', bot: '#232a6e', sunI: 0.55, hemiI: 0.42, fog: '#1a1f4f', sunEl: -0.3, sunAz: -0.4 };
  const dawn = { top: '#6a8fd8', bot: '#ffc38a', sunI: 1.9, hemiI: 1.1, fog: '#f2c3a0', sunEl: 0.15, sunAz: 2.2 };
  const mix = (a, b, k) => ({ top: '#' + new THREE.Color(a.top).lerp(new THREE.Color(b.top), k).getHexString(), bot: '#' + new THREE.Color(a.bot).lerp(new THREE.Color(b.bot), k).getHexString(), sunI: lerp(a.sunI, b.sunI, k), hemiI: lerp(a.hemiI, b.hemiI, k), fog: '#' + new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), k).getHexString(), sunEl: lerp(a.sunEl, b.sunEl, k), sunAz: lerp(a.sunAz, b.sunAz, k) });
  if (t < E.dusk) { const s = { ...day }; if (win(t, E.floor, E.door)) { s.sunAz = 0.6 + (t - E.floor) * 0.08; } return s; }
  if (t < 194) return mix(day, dusk, ss(seg(t, E.dusk, 194)));
  if (t < E.dawn) return mix(dusk, night, ss(seg(t, 194, E.night)));
  if (t < 262) return mix(night, dawn, ss(seg(t, E.dawn, 257)));
  return mix(dawn, day, ss(seg(t, 262, 285)));
}

// ---------------------------------------------------------------- 2D compositor
const out = document.createElement('canvas'); out.width = W; out.height = H; document.body.appendChild(out);
const ctx = out.getContext('2d');
const F = (s, w = 'bold') => `${w} ${s}px "DejaVu Sans", "Liberation Sans", sans-serif`;
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function hex(x, y, r) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); }
function outlined(text, x, y, size, fill = '#fff', stroke = '#000', lw = 6, align = 'center') { ctx.font = F(size); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.strokeText(text, x, y); ctx.fillStyle = fill; ctx.fillText(text, x, y); }
function isoCube(x, y, s, top, left, right) {
  ctx.fillStyle = top; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y - s / 2); ctx.lineTo(x, y); ctx.lineTo(x - s, y - s / 2); ctx.fill();
  ctx.fillStyle = left; ctx.beginPath(); ctx.moveTo(x - s, y - s / 2); ctx.lineTo(x, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y + s / 2); ctx.fill();
  ctx.fillStyle = right; ctx.beginPath(); ctx.moveTo(x + s, y - s / 2); ctx.lineTo(x, y); ctx.lineTo(x, y + s); ctx.lineTo(x + s, y + s / 2); ctx.fill();
}
const ICON = {
  log: (x, y, s) => isoCube(x, y, s, '#e6b06a', '#b5652e', '#93501f'),
  plank: (x, y, s) => isoCube(x, y, s, '#f0bf70', '#e0a95a', '#b88440'),
  glass: (x, y, s) => isoCube(x, y, s, 'rgba(220,250,255,.9)', 'rgba(150,220,245,.8)', 'rgba(110,190,230,.8)'),
  buzz: (x, y, s) => isoCube(x, y, s, '#ffd400', '#1c1c1c', '#e0b800'),
  jam: (x, y, s) => isoCube(x, y, s, '#f0485f', '#d42a43', '#a81f33'),
  castle: (x, y, s) => isoCube(x, y, s, '#b3bdd3', '#9aa4bd', '#6f7891'),
  mallet: (x, y, s) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.7); ctx.fillStyle = '#8a5a2b'; ctx.fillRect(-s * 0.12, -s * 0.2, s * 0.24, s * 1.3); ctx.fillStyle = '#d9a35f'; ctx.fillRect(-s * 0.6, -s * 0.8, s * 1.2, s * 0.65); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(-s * 0.6, -s * 0.55, s * 1.2, s * 0.15); ctx.restore(); },
  bomb: (x, y, s) => { ctx.fillStyle = '#ff3d7f'; ctx.beginPath(); ctx.arc(x, y + 2, s * 0.75, 0, 7); ctx.fill(); ctx.fillStyle = '#ff9ec0'; ctx.fillRect(x - s * 0.4, y - s * 0.3, s * 0.25, s * 0.25); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - s * 0.2, y - s * 0.95, s * 0.5, s * 0.3); },
};
function drawHUD(t, info) {
  // vitality crystals
  const hpv = t < E.boom ? 5 : t < E.lurk ? 4.5 : t < E.bombBoom ? 4 : t < E.wallBreak ? 3 : t < E.collapse ? 2.5 : t < E.heroLand ? 1.5 : 0.5;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (t > E.collapse && t < 292) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 230 && i > 2) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = t > 194 && t < E.dawn + 2;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined((night ? '☾ NIGHT 1' : '☀ DAY ' + (t > E.dawn + 2 ? 2 : 1)), W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const logs = t < E.pickup ? 0 : t < E.craftDone ? 4 : t < E.tradeDone ? 3 : 0;
  const slots = [['mallet', t >= E.craftDone ? 1 : 0], ['log', logs], ['bomb', win(t, E.tradeDone, E.bombDrop) || win(t, 200, E.bombThrow) ? 1 : 0], ['plank', t >= 141 ? 64 : 0], ['glass', t >= 141 ? 32 : 0], ['buzz', t >= 141 ? 17 : 0], ['jam', t >= 141 ? 9 : 0]];
  let sel = 0; if (win(t, E.tradeDone, E.boom) || win(t, 215.6, E.bombThrow + 0.4)) sel = 2; else if (win(t, 141, E.door)) sel = 3 + Math.floor((t * 1.3) % 4); else if (win(t, E.panic, E.roofHop)) sel = 3 + Math.floor((t * 5) % 4); else if (t < E.craftDone) sel = 1;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 100) / 40, 0, 1) * 0.6 + (t > 140 ? 0.1 : 0); rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
}
function drawFacecam(t) {
  const x = W - 236, y = 16, w = 220, h = 150;
  ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
  const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#2a1b4d'); gr.addColorStop(1, '#0f2a4a'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ff5cf0'; ctx.fillRect(x, y + 18, w, 4); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x, y + 26, w, 3);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ffd23f', '#ff3d7f', '#7cff6b', '#3d7bff'][i]; ctx.fillRect(x + 14 + i * 16, y + 44, 12, 20); }
  const fi = Math.min(ENV.length - 1, Math.floor(t * FPS)); const a = ENV[fi] || 0;
  const cue = CUES.find(c => t >= c.start && t < c.end + 0.2); const txt = cue ? cue.text : '';
  const up = txt.replace(/[^A-Za-z]/g, ''), caps = up.length ? up.replace(/[^A-Z]/g, '').length / up.length : 0;
  const yell = caps > 0.45 || /AAA|NO NO|RUN|WHY|GO GO|THE WALL/.test(txt), deadpan = txt.startsWith('...'), q = txt.includes('?');
  const bob = Math.sin(t * 2) * 2 + a * 4 + (yell ? Math.sin(t * 30) * 3 : 0);
  const hx = x + w / 2 + 16 + (yell ? Math.sin(t * 23) * 3 : 0), hy = y + 92 + bob, s = 92;
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(hx - 40, hy + s / 2 - 6, 80, 60); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);
  ctx.fillStyle = '#f2c79b'; ctx.fillRect(hx - s / 2, hy - s / 2, s, s);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(hx - s / 2 - 2, hy - s / 2 - 8, s + 4, 22); ctx.fillRect(hx + 10, hy - s / 2 - 16, 22, 12);
  ctx.fillStyle = '#222'; ctx.fillRect(hx - s / 2 - 14, hy - 18, 14, 36); ctx.fillRect(hx + s / 2, hy - 18, 14, 36); ctx.fillRect(hx - s / 2 - 8, hy - s / 2 - 14, s + 16, 8);
  ctx.fillStyle = '#5ff7ff'; ctx.fillRect(hx - s / 2 - 12, hy - 12, 8, 24); ctx.fillRect(hx + s / 2 + 4, hy - 12, 8, 24);
  const ew = yell ? 20 : 16, eh = deadpan ? 6 : yell ? 22 : 16, ey = hy - 12;
  const blink = (Math.floor(t * 10) % 37 === 0) ? 0.2 : 1;
  ctx.fillStyle = '#fff'; ctx.fillRect(hx - 30, ey, ew, eh * blink); ctx.fillRect(hx + 10, ey, ew, eh * blink);
  ctx.fillStyle = '#2a1d14'; const pw = yell ? 6 : 8; ctx.fillRect(hx - 30 + (ew - pw) / 2 + 2, ey + (eh - Math.min(eh, 10)) / 2, pw, Math.min(eh, 10) * blink); ctx.fillRect(hx + 10 + (ew - pw) / 2 + 2, ey + (eh - Math.min(eh, 10)) / 2, pw, Math.min(eh, 10) * blink);
  ctx.fillStyle = '#5a3a22'; const br = yell ? -10 : q ? -6 : deadpan ? 0 : -4;
  ctx.fillRect(hx - 32, ey + br - 6, 22, 5); ctx.fillRect(hx + 10, ey + br - 6 - (q ? 4 : 0), 22, 5);
  const mo = clamp(a * 1.6, 0, 1) * (yell ? 30 : 18);
  ctx.fillStyle = '#6b1f16'; ctx.fillRect(hx - 14 - (yell ? 4 : 0), hy + 18, 28 + (yell ? 8 : 0), 4 + mo);
  if (mo > 6) { ctx.fillStyle = '#ff7b7b'; ctx.fillRect(hx - 8, hy + 18 + mo * 0.6, 16, mo * 0.4 + 2); }
  ctx.fillStyle = '#333'; ctx.fillRect(hx - 60, hy + 22, 22, 10); ctx.fillStyle = '#111'; ctx.fillRect(hx - 70, hy + 14, 14, 26);
  ctx.restore();
  rrect(x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.fillStyle = (Math.floor(t * 2) % 2) ? '#ff2a4a' : '#a01020'; ctx.beginPath(); ctx.arc(x + 18, y + h - 16, 6, 0, 7); ctx.fill();
  outlined('PIXELPANIC', x + 30, y + h - 16, 13, '#fff', '#000', 3, 'left');
}
function drawCaption(t) {
  const c = CUES.find(c => t >= c.start - 0.05 && t < c.end + 0.25); if (!c) return;
  const words = c.text.split(' '), n = Math.ceil(words.length / 9), prog = clamp((t - c.start) / (c.end - c.start + 0.01), 0, 0.999);
  const ci = Math.floor(prog * n), per = Math.ceil(words.length / n), chunk = words.slice(ci * per, ci * per + per).join(' ');
  ctx.font = F(28); const tw = ctx.measureText(chunk).width; const yy = H - 120;
  rrect(W / 2 - tw / 2 - 16, yy - 22, tw + 32, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
  outlined(chunk, W / 2, yy + 1, 28, '#ffffff', '#000', 5);
}
const TOASTS = [[E.pickup, '+4 Emberbark Log', 'log'], [E.craftDone, 'Crafted: Twig Mallet', 'mallet'], [E.tradeDone, '+1 Fizzberry Bomb', 'bomb'], [114, '+1 Glowshard (shiny!)', 'glass'], [141.5, '+999 Assorted Blocks', 'buzz']];
const FEATS = [[86.0, 'Urban Renewal', 'Demolish a village by "accident"'], [138.2, 'Cardio Spelunker', 'Outrun a Hexapede'], [182.4, 'Starchitect', 'Build the greatest house ever (self-rated)'], [277.6, 'Structural Engineer', 'Remove the one block that mattered']];
const POPS = [[22.7, 0.4, 'POW!', 0.39, 0.42, '#ffe066', 46], [23.25, 0.4, 'BOP!', 0.36, 0.5, '#ff9ecb', 42], [24.0, 0.4, 'THWACK!', 0.4, 0.38, '#5ff7ff', 44], [28.1, 2.2, '?', 0.62, 0.22, '#ffffff', 120],
  [E.trip + 0.45, 1.2, 'BONK', 0.47, 0.6, '#ffe066', 54], [E.boom + 0.05, 1.2, 'KA-FWOOMP!!', 0.5, 0.3, '#ff6b2a', 86], [E.lurk + 0.05, 1.3, '!!!', 0.32, 0.25, '#ff3d3d', 120],
  [E.swing1 + 0.3, 1.0, 'MISS!', 0.36, 0.38, '#ff3d3d', 60], [E.swing2 + 0.3, 1.0, 'MISSED AGAIN!', 0.6, 0.34, '#ff3d3d', 54], [E.bombBack, 1.2, 'BOING!', 0.4, 0.3, '#7cff6b', 60], [E.bombBoom, 1.2, 'FWOOMP', 0.5, 0.4, '#ff6b2a', 70],
  [E.wallBreak, 1.4, 'CRASH!!', 0.5, 0.3, '#ff3d3d', 96], [E.climbFail + 0.6, 1.2, 'SPLORT', 0.42, 0.5, '#7cff6b', 60], [E.breakBlock, 0.8, 'pop', 0.56, 0.45, '#ffe066', 44],
  [E.creak, 2.0, '*creeeak*', 0.5, 0.22, '#ffffff', 50], [E.collapse + 0.3, 2.0, 'KRRRSSHHH!!!', 0.5, 0.28, '#ffb050', 90], [E.bonkHead, 1.2, 'BONK.', 0.6, 0.38, '#ffe066', 60],
  [E.door + 0.1, 1.6, 'BOING!', 0.5, 0.2, '#ffe066', 70]];
const ZOOMS = [[28.0, 2.0, 1.25, 0.6, 0.35], [E.boom + 0.05, 0.6, 1.3, 0.5, 0.4], [E.stare, 1.8, 1.5, 0.5, 0.45], [E.lurk, 1.2, 1.4, 0.55, 0.45], [E.lurk + 1.2, 0.3, 1.2, 0.5, 0.45], [E.bugsLeave, 1.8, 1.12, 0.5, 0.5],
  [176.6, 1.4, 1.15, 0.5, 0.35], [204.4, 1.2, 1.25, 0.5, 0.45], [206.0, 1.2, 1.25, 0.5, 0.35], [E.bombBack, 0.5, 1.25, 0.5, 0.5], [E.wallBreak, 0.8, 1.35, 0.4, 0.5], [227.5, 0.5, 1.3, 0.5, 0.5], [229.8, 0.5, 1.3, 0.5, 0.5], [231.0, 0.6, 1.35, 0.5, 0.5], [233.0, 0.5, 1.3, 0.5, 0.5],
  [E.creak, 2.0, 1.15, 0.5, 0.55], [E.collapse, 2.0, 1.2, 0.5, 0.45], [E.bonkHead, 2.3, 1.2, 0.5, 0.5]];
const SHAKES = [[E.punch, 3.6, 0.03], [E.boom, 1.6, 0.6], [E.lurk, 1.2, 0.25], [E.chase, 9, 0.12], [E.faceplant, 0.5, 0.2], [E.door, 0.6, 0.2], [E.spawnMobs, 3.5, 0.06], [E.bombBoom, 0.8, 0.3], [E.wallBreak, 1.2, 0.5], [E.panic, 10.4, 0.1], [E.creak, 2.4, 0.06], [E.collapse, 2.5, 0.55], [E.heroLand, 0.6, 0.3], [E.bonkHead, 0.4, 0.1]];
const FLASH = [[E.boom, 0.7, '255,240,200'], [E.lurk, 0.35, '255,30,30'], [E.exitFlash - 0.25, 0.9, '255,255,255'], [E.bombBoom, 0.4, '255,230,180'], [E.wallBreak, 0.25, '255,255,255'], [E.door, 0.3, '255,255,255'], [E.collapse, 0.3, '255,240,220'], [E.caveSwap - 0.5, 1.0, '0,0,0']];
function shakeOffset(t) { let a = 0; for (const [s, d, amp] of SHAKES) if (t >= s && t < s + d) a += amp * (1 - (t - s) / d); return [a * (Math.sin(t * 71) + Math.sin(t * 43) * 0.5), a * (Math.cos(t * 67) + Math.sin(t * 37) * 0.5), a * Math.sin(t * 53) * 0.5]; }
function zoomAt(t) { let z = 1, cx = 0.5, cy = 0.5; for (const [s, d, a, x, y] of ZOOMS) if (t >= s && t < s + d) { const k = Math.min(1, (t - s) / 0.12) * (1 - ss((t - s - d + 0.15) / 0.15)); const zz = 1 + (a - 1) * k; if (zz > z) { z = zz; cx = x; cy = y; } } return [z, cx, cy]; }
function drawCraft(t) {
  const k = ss(seg(t, E.craftOpen, E.craftOpen + 0.3)) * (1 - ss(seg(t, E.craftClose - 0.25, E.craftClose))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, H / 2 - 20); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
  rrect(-300, -170, 600, 320, 22); ctx.fillStyle = 'rgba(20,24,48,.92)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#5ff7ff'; ctx.stroke();
  outlined('TINKER GRID', 0, -135, 30, '#5ff7ff', '#000', 5);
  const gpos = [[-190, -50], [-130, -50], [-190, 10], [-130, 10]];
  gpos.forEach(([x, y], i) => { hex(x, y, 30); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#8fa0d8'; ctx.stroke(); });
  if (t > E.craftLog1) ICON.log(-190, -52, 15); if (t > E.craftLog2) ICON.log(-190, 8, 15);
  ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.moveTo(-60, -40); ctx.lineTo(10, -40); ctx.lineTo(10, -55); ctx.lineTo(45, -20); ctx.lineTo(10, 15); ctx.lineTo(10, 0); ctx.lineTo(-60, 0); ctx.fill();
  hex(140, -20, 52); ctx.fillStyle = t > 34.6 ? 'rgba(255,224,102,.25)' : 'rgba(255,255,255,.08)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
  if (t > 34.6) { const pk = backOut(seg(t, 34.6, 34.9)); ctx.save(); ctx.translate(140, -10); ctx.scale(pk, pk); ICON.mallet(0, 0, 28); ctx.restore(); outlined('TWIG MALLET', 140, 55, 18, '#ffe066', '#000', 4); }
  for (let i = 0; i < 7; i++) { hex(-195 + i * 65, 105, 26); ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fill(); ctx.strokeStyle = '#55608a'; ctx.lineWidth = 2; ctx.stroke(); }
  ICON.log(-195, 103, 12); outlined(String(t < E.craftLog1 ? 4 : t < E.craftLog2 ? 3 : 2), -178, 120, 14);
  // cursor
  const P = [[0, -195, 105], [E.craftLog1 - 0.5, -195, 105], [E.craftLog1, -190, -50], [E.craftLog2 - 0.3, -195, 105], [E.craftLog2, -190, 10], [34.8, 140, -20], [36.8, 150, -10]];
  const c = track(t, P.map(p => [p[0], p[1], 0, p[2]])).p; const press = [E.craftLog1, E.craftLog2, E.craftDone].some(s => Math.abs(t - s) < 0.12);
  cursor(c[0], c[2], press);
  ctx.restore();
}
function cursor(x, y, press) { ctx.save(); ctx.translate(x, y); if (press) ctx.scale(0.85, 0.85); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.lineTo(7, 20); ctx.lineTo(12, 30); ctx.lineTo(17, 28); ctx.lineTo(12, 18); ctx.lineTo(20, 18); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
function drawTrade(t) {
  const k = ss(seg(t, E.tradeOpen, E.tradeOpen + 0.3)) * (1 - ss(seg(t, E.tradeClose - 0.25, E.tradeClose))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, H / 2 - 20); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
  rrect(-300, -160, 600, 300, 22); ctx.fillStyle = 'rgba(40,20,60,.93)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#2ec4b6'; ctx.stroke();
  outlined('SWAP-O-MATIC', 0, -125, 30, '#2ec4b6', '#000', 5);
  ctx.fillStyle = '#c8e6a0'; ctx.fillRect(-270, -90, 70, 60); ctx.fillStyle = '#fff'; ctx.fillRect(-255, -80, 38, 30); ctx.fillStyle = '#1a1a40'; ctx.fillRect(-243, -74, 16, 18); ctx.fillStyle = '#2ec4b6'; ctx.fillRect(-282, -102, 94, 14);
  outlined('Burble Trader', -235, -12, 15, '#fff', '#000', 3);
  for (let i = 0; i < 3; i++) { hex(-120 + i * 58, -40, 27); ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fill(); ctx.strokeStyle = '#8fa0d8'; ctx.lineWidth = 3; ctx.stroke(); ICON.log(-120 + i * 58, -42, 13); }
  ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.moveTo(55, -55); ctx.lineTo(85, -40); ctx.lineTo(55, -25); ctx.fill();
  hex(160, -40, 44); ctx.fillStyle = 'rgba(255,61,127,.2)'; ctx.fill(); ctx.strokeStyle = '#ff3d7f'; ctx.lineWidth = 4; ctx.stroke(); ICON.bomb(160, -42, 22);
  outlined('FIZZBERRY BOMB', 160, 18, 16, '#ff9ec0', '#000', 4); outlined('"handle with care :)"', 160, 40, 12, '#ddd', '#000', 3);
  const pressed = Math.abs(t - E.tradeDone + 0.2) < 0.15; rrect(-80, 70, 160, 50, 14); ctx.fillStyle = pressed ? '#1d9c90' : '#2ec4b6'; ctx.fill(); outlined('SWAP!', 0, 96, 24, '#fff', '#000', 4);
  const c = track(t, [[E.tradeOpen, 230, 0, 120], [61.3, 230, 0, 120], [E.tradeDone - 0.3, 10, 0, 100], [64, 30, 0, 110]]).p; cursor(c[0], c[2], pressed);
  if (t > E.tradeDone - 0.2 && t < E.tradeDone + 0.6) { ctx.globalAlpha = k * (1 - seg(t, E.tradeDone - 0.2, E.tradeDone + 0.6)); ctx.fillStyle = '#fff'; rrect(-300, -160, 600, 300, 22); ctx.fill(); }
  ctx.restore();
}
function drawLoading(t) {
  if (t > 3.0) return; const a = 1 - ss(seg(t, 2.4, 3.0));
  ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1b1440'); gr.addColorStop(1, '#0b2a3f'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  pixelLogo(W / 2, H / 2 - 90, 9, t, 0); const msgs = ['Sculpting cubes...', 'Hiding the shards...', 'Teaching trees to float...', 'Spawning player...'];
  outlined(msgs[Math.min(3, Math.floor(t / 0.65))], W / 2, H / 2 + 60, 24, '#fff', '#000', 4);
  rrect(W / 2 - 200, H / 2 + 95, 400, 18, 9); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill(); rrect(W / 2 - 200, H / 2 + 95, 400 * clamp(t / 2.3, 0, 1), 18, 9); ctx.fillStyle = '#5ff7ff'; ctx.fill();
  ctx.restore();
}
const PF = { S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'], H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'], R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'], D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'], W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'], I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'], L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'] };
function pixelLogo(cx, cy, px, t, t0) {
  const word = 'SHARDWILD', lw = 6 * px, total = word.length * lw - px; const x0 = cx - total / 2;
  [...word].forEach((ch, i) => { const k = t0 ? seg(t, t0 + i * 0.12, t0 + i * 0.12 + 0.45) : 1; if (k <= 0) return; const dy = (1 - backOut(k)) * -200 + Math.sin(t * 3 + i * 0.7) * px * 0.3;
    const col = new THREE.Color('#5ff7ff').lerp(new THREE.Color('#ff5cf0'), i / (word.length - 1));
    PF[ch].forEach((row, ry) => [...row].forEach((c, rx) => { if (c !== '#') return; const x = x0 + i * lw + rx * px, y = cy - 3.5 * px + ry * px + dy; const d = px * 0.35;
      ctx.fillStyle = '#' + col.clone().multiplyScalar(0.45).getHexString(); ctx.fillRect(x + d, y + d, px, px);
      ctx.fillStyle = '#' + col.getHexString(); ctx.fillRect(x, y, px, px); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x, y, px, px * 0.22); })); });
}
function drawLogo(t) {
  const a = ss(seg(t, E.logo, E.logo + 0.4));
  ctx.save(); ctx.globalAlpha = a; const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#160f3a'); gr.addColorStop(0.6, '#1d2f6b'); gr.addColorStop(1, '#0b3a4a'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const r = rng(5); for (let i = 0; i < 40; i++) { const x = r() * W, y = ((r() * H) - (t - E.logo) * (20 + r() * 40)) % H, s = 6 + r() * 16; ctx.save(); ctx.translate(x, y < 0 ? y + H : y); ctx.rotate(t * (r() - .5)); ctx.fillStyle = r() < .5 ? 'rgba(95,247,255,.35)' : 'rgba(255,92,240,.35)'; ctx.fillRect(-s / 4, -s / 2, s / 2, s); ctx.restore(); }
  pixelLogo(W / 2, H / 2 - 110, 17, t, E.logo + 0.2);
  const k2 = ss(seg(t, E.logo + 1.6, E.logo + 2.1)); ctx.globalAlpha = a * k2;
  outlined('SURVIVE.  BUILD.  PANIC.', W / 2, H / 2 + 20, 30, '#ffe066', '#000', 5);
  outlined('a totally fictional voxel survival game', W / 2, H / 2 + 58, 18, '#cfe0ff', '#000', 4);
  const k3 = ss(seg(t, E.logo + 2.6, E.logo + 3.0)); ctx.globalAlpha = a * k3;
  const pressed = t > 296.2 && t < 296.5, subbed = t > 296.3;
  ctx.save(); ctx.translate(W / 2 - 260, H / 2 + 150); if (pressed) ctx.scale(0.92, 0.92); rrect(-110, -32, 220, 64, 32); ctx.fillStyle = subbed ? '#666' : '#ff2a4a'; ctx.fill(); outlined(subbed ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 1, 24, '#fff', '#000', 4); ctx.restore();
  for (let i = 0; i < 2; i++) { const x = W / 2 + 40 + i * 250, y = H / 2 + 110; rrect(x, y, 220, 124, 12); ctx.fillStyle = i ? '#3a1d5c' : '#1d4a3a'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke();
    outlined(i ? 'EP 2: I REBUILD' : 'EP 0: BLOOPERS', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it goes worse)' : '(it was all bloopers)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, 40, forest, 'forest'], [40, 90, village, 'village'], [90, 140, cave, 'caveOut'], [140, 1e9, home, 'home']];
window.renderAt = function (T) {
  let t = T; const frozen = T >= E.freeze && T < E.logo; if (frozen) t = E.freeze;
  let sec = SECS.find(s => t >= s[0] && t < s[1]);
  for (const k in groups) groups[k].visible = false;
  groups[sec[3]].visible = true;
  hero.root.visible = true; hero.root.scale.setScalar(1);
  const res = sec[2].update(t);
  // sky + light
  const S = sky(t); const cave = res.cave;
  if (cave) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 6; scene.fog.far = 42; hemi.intensity = 0.12; hemi.color.set('#6a5aff'); hemi.groundColor.set('#201030'); sun.intensity = 0; }
  else { setSky(S.top, S.bot); scene.fog.color.set(S.fog); scene.fog.near = 70; scene.fog.far = 200; hemi.intensity = S.hemiI; hemi.color.set(t > 194 && t < E.dawn ? '#8aa0ff' : '#d6eeff'); hemi.groundColor.set('#6a7a4a'); sun.intensity = S.sunI; }
  const c = res.cam; const sh = shakeOffset(T);
  camera.position.set(c.p[0] + sh[0], c.p[1] + sh[1], c.p[2] + sh[2]); camera.lookAt(c.l[0] + sh[0] * 0.5, c.l[1] + sh[1] * 0.5, c.l[2]); camera.fov = c.fov; camera.updateProjectionMatrix();
  // sun & moons
  const night = t > 194 && t < E.dawn + 3;
  const sv = placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunMesh); placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunGlow, 385);
  sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05;
  moonA.visible = moonB.visible = !cave && night && t > 194;
  placeSky(-2.85, 0.5, moonA); placeSky(-2.6, 0.38, moonB);
  const tc = camera.position;
  if (night) { sun.position.set(tc.x - 30, 60, tc.z - 30); sun.color.set('#9fb4ff'); } else { sun.position.set(tc.x + sv.x * 80, Math.max(20, sv.y * 80), tc.z + sv.z * 80); sun.color.set(t > E.dusk - 1 && t < 270 ? '#ffc08a' : '#fff1d6'); }
  const focus = hero.root.position; sun.position.x = focus.x + (sun.position.x - tc.x); sun.position.z = focus.z + (sun.position.z - tc.z); sun.target.position.copy(focus);
  clouds.visible = !cave; clouds.children.forEach((cl, i) => { const b = cl.userData.base; const x = ((b[0] + t * 1.5 - tc.x + 200) % 400 + 400) % 400 - 200 + tc.x; cl.position.set(x, b[1], ((b[2] - tc.z + 200) % 400 + 400) % 400 - 200 + tc.z); });
  updateParticles(t);
  renderer.render(scene, camera);
  // ---- 2D composite
  const [z, zx, zy] = zoomAt(T);
  ctx.save();
  if (frozen) { const k = seg(T, E.freeze, E.freeze + 0.25); ctx.filter = `saturate(${lerp(1, 0.25, k)}) contrast(${lerp(1, 1.15, k)}) sepia(${0.25 * k})`; }
  const zf = frozen ? 1 + 0.08 * ss(seg(T, E.freeze, E.freeze + 5)) : z;
  const sw = W / zf, shh = H / zf; ctx.drawImage(renderer.domElement, ((W - sw) * (frozen ? 0.5 : zx)) * RS, ((H - shh) * (frozen ? 0.45 : zy)) * RS, sw * RS, shh * RS, 0, 0, W, H);
  ctx.restore();
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  const panic = win(T, E.lurk, E.exitFlash) || win(T, E.wallBreak, E.roofHop) || win(T, E.collapse, E.collapse + 3);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > 3) drawHUD(T, res);
    if (win(T, E.floor, E.door - 0.6)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawCraft(T); drawTrade(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 181.6, 189)) { const k = ss(seg(T, 182.0, 182.5)) * (1 - ss(seg(T, 188.4, 189))); ctx.save(); ctx.globalAlpha = k; rrect(40, 210, 330, 104, 14); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); outlined('GREATEST HOUSE EVER', 205, 240, 22, '#fff', '#000', 4); outlined('★★★★★', 205, 272, 30, '#ffe066', '#000', 4); outlined('(rated by me)', 205, 300, 14, '#ccc', '#000', 3); ctx.restore(); }
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.25, H * 0.22); ctx.rotate(-0.08); outlined('yep.', 0, 0, 96, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that's me.", W * 0.7, H * 0.66, 40, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.64, H * 0.6); ctx.lineTo(W * 0.53, H * 0.38); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.53, H * 0.38); ctx.lineTo(W * 0.535, H * 0.45); ctx.moveTo(W * 0.53, H * 0.38); ctx.lineTo(W * 0.57, H * 0.42); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(the support block, R.I.P.)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
    if (win(T, E.hours, E.hoursEnd)) { const k = ss(seg(T, E.hours, E.hours + 0.4)) * (1 - ss(seg(T, E.hoursEnd - 0.4, E.hoursEnd)));
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#0b0820'; ctx.fillRect(0, 0, W, H);
      const words = ['several', 'terrifying', 'hours', 'later...']; words.forEach((w, i) => { ctx.save(); ctx.translate(W / 2, H / 2 - 60 + i * 52); ctx.rotate(Math.sin(T * 3 + i) * 0.04); outlined(w, 0, 0, 52, ['#ff5cf0', '#ffe066', '#5ff7ff', '#ffffff'][i], '#000', 8); ctx.restore(); });
      ctx.restore(); }
    drawCaption(T);
    if (T > 3) drawFacecam(T);
  } else drawLogo(T);
  drawLoading(T);
  return out.toDataURL('image/jpeg', 0.9);
};
window.prof = (t, n) => { const a = performance.now(); for (let i = 0; i < n; i++) window.renderAt(t + i / 24); const b = performance.now(); for (let i = 0; i < n; i++) { renderer.render(scene, camera); renderer.getContext().finish(); } const c = performance.now(); return [(b - a) / n, (c - b) / n]; };
window.ready = true;
