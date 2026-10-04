// SHARDWILD — a fictional voxel survival game. Deterministic Let's Play renderer.
// window.renderAt(t) draws the frame for time t (seconds) and returns a JPEG data URL.
import * as THREE from '../../node_modules/three/build/three.module.js';

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
      m.castShadow = type !== 'glass' && type !== 'water'; m.receiveShadow = true; m.userData.arr = arr;
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
    for (const [type, arr] of Object.entries(this.items)) if (type !== 'glass' && type !== 'water') for (const b of arr) solid.add(b.x + ',' + b.y + ',' + b.z);
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

// ================================================================ EPISODE 2: "I REBUILD THE HOUSE (it goes worse)"
function camKeys(t, C) {
  if (t <= C[0][0]) return { p: C[0].slice(1, 4), l: C[0].slice(4, 7), fov: C[0][7] };
  for (let i = 0; i < C.length - 1; i++) { const a = C[i], b = C[i + 1]; if (t < b[0] && b[0] - a[0] > 1e-3) { const u = ss((t - a[0]) / (b[0] - a[0])); const L = j => lerp(a[j], b[j], u); return { p: [L(1), L(2), L(3)], l: [L(4), L(5), L(6)], fov: L(7) }; } }
  const z = C[C.length - 1]; return { p: z.slice(1, 4), l: z.slice(4, 7), fov: z[7] };
}
const TX2 = {
  water: ctex(16, (g, r, n) => { for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { g.fillStyle = ['rgba(52,130,225,0.82)', 'rgba(64,150,240,0.82)', 'rgba(44,115,210,0.82)'][Math.floor(r() * 3)]; g.fillRect(x, y, 1, 1); } g.fillStyle = 'rgba(200,240,255,0.8)'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 12), Math.floor(r() * 15), 4, 1); }, 31),
  skin: ctex(16, noisy(['#f2c79b', '#e8bc8f', '#f6d0a8']), 32), hoodie: ctex(16, noisy(['#ff8a2a', '#f07c1f', '#ff9a44']), 33),
  hair: ctex(16, noisy(['#5a3a22', '#4e321d', '#664429']), 34), navy: ctex(16, noisy(['#2b3a67', '#25335c', '#324273']), 35),
};
MAT.water = lam(TX2.water, { transparent: true, depthWrite: false, emissive: '#1a4f9a', emissiveIntensity: 0.35 });
MAT.skin = lam(TX2.skin); MAT.hoodie = lam(TX2.hoodie); MAT.hair = lam(TX2.hair); MAT.navy = lam(TX2.navy);
MAT.shard = new THREE.MeshBasicMaterial({ color: '#5ff7ff' });
MAT.flower = new THREE.MeshLambertMaterial({ color: '#ff6fb8', emissive: '#ff3d9a', emissiveIntensity: 0.4 });
const burbleAngry = faceMat('#c8e6a0', g => { g.fillStyle = '#fff'; g.fillRect(8, 9, 16, 11); g.fillStyle = '#1a1a40'; g.fillRect(13, 12, 7, 7); g.fillStyle = '#3a5a1a'; for (let i = 0; i < 9; i++) { g.fillRect(6 + i, 3 + (i >> 1), 2, 3); g.fillRect(25 - i, 3 + (i >> 1), 2, 3); } g.fillStyle = '#5a7a3a'; g.fillRect(11, 27, 10, 2); g.fillRect(9, 25, 2, 2); g.fillRect(21, 25, 2, 2); });
function hardHat(B) { const h = new THREE.Group(); h.position.y = 1.2; B.hd.add(h); box(0.82, 0.32, 0.82, '#ffd400', 0, 0.12, 0, h); box(1.04, 0.07, 1.04, '#ffcc00', 0, -0.04, 0, h); box(0.14, 0.1, 0.84, '#e0a800', 0, 0.3, 0, h); return h; }
function poseBurble(b, t, p, yaw, o = {}) {
  b.B.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.5 : Math.abs(Math.sin(t * 3 + (o.seed || 0))) * 0.04), p[2]); b.B.root.rotation.set(0, yaw, 0);
  b.B.aL.rotation.set(0, 0, -0.1); b.B.aR.rotation.set(0, 0, 0.1); b.B.hd.rotation.set(0, Math.sin(t * 1.3 + (o.seed || 0)) * 0.25, 0);
  if (o.walk) { const s = Math.sin(o.phase || t * 8) * 0.5; b.B.aL.rotation.x = s; b.B.aR.rotation.x = -s; b.B.root.position.y += Math.abs(Math.cos(o.phase || t * 8)) * 0.08; }
  if (o.angry) { b.B.aL.rotation.set(-2.6 + Math.sin(t * 14 + (o.seed || 0)) * 0.4, 0, 0); b.B.aR.rotation.set(-2.6 + Math.cos(t * 14 + (o.seed || 0)) * 0.4, 0, 0); }
  if (o.facepalm) { b.B.aR.rotation.set(-2.3, 0, 0.75); b.B.hd.rotation.set(0.35, 0, Math.sin(t * 2) * 0.1); }
  if (o.handOut) b.B.aR.rotation.set(-1.4, 0, 0);
  b.B.hd.children[0].material = o.angry ? burbleAngry : b.calm;
}
function mkBurble(col) { const B = makeBurble(col); return { B, calm: B.hd.children[0].material }; }
// VSet extension: static rotation + sinking
const _upd = VSet.prototype.update;
VSet.prototype.update = function (t) {
  if (!this.dyn) return;
  _upd.call(this, t);
  for (const m of this.meshes) {
    const arr = m.userData.arr; let touched = false;
    for (let i = 0; i < arr.length; i++) {
      const b = arr[i]; if (!b.rot && !b.sink) continue; if (b.t0 !== undefined && t < b.t0) continue; if (b.t1 !== undefined && t >= b.t1) continue;
      m.getMatrixAt(i, _m); _m.decompose(_p, _q, _s);
      if (b.rot && !(b.t1 !== undefined && t >= b.t1 && b.fly)) _q.setFromEuler(_e.set(...b.rot));
      if (b.sink && t > b.sink[0]) { const k = seg(t, b.sink[0], b.sink[1]); _p.y -= b.sink[2] * k * k; _p.x += (b.sink[3] || 0) * k * k * b.y * 0.1; }
      _m.compose(_p, _q, _s); m.setMatrixAt(i, _m); touched = true;
    }
    if (touched) m.instanceMatrix.needsUpdate = true;
  }
};

// ================================================================ HOMESTEAD (recap, build, dusk, ending)
const home = (() => {
  const g = mk('home'), st = new VSet(g), dy = new VSet(g, true), r = rng(41);
  const hf = (x, z) => { const d = Math.hypot(x, z); return Math.round((vnoise(x / 10, z / 10, 12) * 7 - 1) * ss((d - 18) / 14)); };
  const ring = (x, z) => { const m = Math.max(Math.abs(x), Math.abs(z)); return m >= 6 && m <= 7; };
  const foot = (x, z) => Math.abs(x) <= 5 && Math.abs(z) <= 5;
  const bridge = (x, z) => Math.abs(x) <= 1 && z >= 6 && z <= 7;
  const ringCells = [];
  for (let x = -50; x <= 50; x++) for (let z = -50; z <= 50; z++) {
    if (ring(x, z)) { ringCells.push([x, z]); continue; }
    if (foot(x, z)) { dy.add(x, 0, z, 'turf', { t1: E.sink + 0.3 }); dy.add(x, 0, z, 'water', { t0: E.sink + 0.8 }); st.add(x, -1, z, 'soil'); continue; }
    const h = hf(x, z); st.add(x, h, z, 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil');
  }
  ringCells.sort((a, b) => Math.atan2(a[0], a[1]) - Math.atan2(b[0], b[1]));
  ringCells.forEach(([x, z], i) => { const tm = E.moat + 0.2 + i * (E.moatEnd - E.moat - 0.4) / ringCells.length; st.add(x, -1, z, 'soil');
    dy.add(x, 0, z, 'turf', { t1: tm }); dy.add(x, 0, z, 'water', bridge(x, z) ? { t0: tm, t1: E.bridge + 0.6 + (z - 6) * 0.4 } : { t0: tm });
    if (bridge(x, z)) dy.add(x, 0, z, 'plank', { t0: E.bridge + 0.6 + (z - 6) * 0.4 }); });
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 96), z = Math.round((r() - .5) * 96); const d = Math.hypot(x, z); if (d < 18 || (Math.abs(x) < 13 && z > 12 && z < 44) || (x < -8 && x > -40 && z > 12 && z < 36) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  // rubble from episode 1
  const rtypes = ['plank', 'slate', 'castle', 'glass', 'buzz', 'jam', 'jade', 'polka', 'log', 'leaf'];
  for (let i = 0; i < 110; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 5.2; const x = Math.round(Math.sin(a) * d), z = Math.round(Math.cos(a) * d); const y = 1 + (d < 3 && r() < 0.6 ? 1 : 0) + (d < 1.5 && r() < 0.4 ? 1 : 0);
    dy.add(x + (r() - .5) * 0.4, y - 0.15 + r() * 0.2, z + (r() - .5) * 0.4, rtypes[i % rtypes.length], { rot: [(r() - .5) * 0.8, r() * 3, (r() - .5) * 0.8], t1: E.clear + 0.4 + i * 0.033, fly: [(r() - .5) * 4, 12 + r() * 8, (r() - .5) * 4], spin: [r() * 8, r() * 8, r() * 8], floor: -50 }); }
  for (let y = 1; y <= 8; y++) dy.add(5, y, 0, rtypes[(y * 3) % rtypes.length], { t1: E.clear + 4 + y * 0.03, fly: [2, 14 + y, 0], spin: [3, 4, 5], floor: -50 });
  // the fortress (Bloop builds it)
  const plan = [];
  for (let y = 1; y <= 4; y++) for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) { if (Math.abs(x) !== 4 && Math.abs(z) !== 4) continue; if (z === 4 && Math.abs(x) <= 1 && y <= 3) continue;
    const win = y === 3 && ((Math.abs(x) === 4 && Math.abs(z) === 2) || (z === -4 && Math.abs(x) === 2) || (z === 4 && Math.abs(x) === 3)); plan.push([x, y, z, win ? 'glass' : (Math.abs(x) === 4 && Math.abs(z) === 4 ? 'stone' : 'castle')]); }
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) plan.push([x, 5, z, 'stone']);
  for (let x = -4; x <= 4; x++) for (let z = -4; z <= 4; z++) if ((Math.abs(x) === 4 || Math.abs(z) === 4) && (x + z) % 2 === 0) plan.push([x, 6, z, 'castle']);
  plan.forEach(([x, y, z, ty], i) => dy.add(x, y, z, ty, { t0: E.fortA + i * (E.fortB - E.fortA) / plan.length, wob: [E.creak, E.sink], sink: [E.sink, E.sinkEnd, 9, 0.25] }));
  // the statue of me
  const stat = [[-2, 6, -2, 'navy'], [-1, 6, -2, 'navy'], [-2, 7, -2, 'hoodie'], [-1, 7, -2, 'hoodie'], [-2, 8, -2, 'hoodie'], [-1, 8, -2, 'hoodie'], [-3, 8, -2, 'hoodie'], [0, 8, -2, 'hoodie']];
  for (let x = -3; x <= 0; x++) for (let y = 9; y <= 11; y++) for (let z = -3; z <= -1; z++) { if (x === 0) continue; const front = z === -1; const eye = front && y === 10 && (x === -3 || x === -1); stat.push([x, y, z, eye ? 'navy' : 'skin']); }
  for (let x = -3; x <= -1; x++) for (let z = -3; z <= -1; z++) stat.push([x, 12, z, 'hair']);
  stat.forEach(([x, y, z, ty], i) => { const o = { t0: E.statue + 0.2 + i * (E.statueEnd - E.statue - 0.4) / stat.length, sink: [E.sink, E.sinkEnd, 9, 0.25], wob: [E.creak, E.sink] };
    if (y >= 9) { o.t1 = E.statueBoom + r() * 0.05; o.fly = [(x + 2) * 4 + (r() - .5) * 4, 6 + r() * 8, (z + 2) * 4 + (r() - .5) * 4]; o.spin = [r() * 10, r() * 10, r() * 10]; o.floor = -50; }
    dy.add(x, y, z, ty, o); });
  st.build(); dy.build();
  // giant door lying on the ground (from episode 1)
  const door = new THREE.Group(); door.position.set(0, 0.75, 3.75); door.rotation.x = Math.PI / 2; g.add(door);
  const dtex = TX.plank.clone(); dtex.wrapS = dtex.wrapT = THREE.RepeatWrapping; dtex.repeat.set(5, 9); dtex.needsUpdate = true;
  const dp = new THREE.Mesh(new THREE.BoxGeometry(5, 9, 0.5), new THREE.MeshLambertMaterial({ map: dtex, color: '#ff9c7a' })); dp.position.set(0, 4.5, 0); dp.receiveShadow = true; door.add(dp);
  box(5.4, 0.4, 0.6, '#8a3b2a', 0, 9.1, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', -2.7, 4.5, 0, door); box(0.4, 9.2, 0.6, '#8a3b2a', 2.7, 4.5, 0, door); box(0.5, 0.5, 0.3, '#ffd23f', 1.8, 4.2, 0.35, door);
  // trampoline
  const tramp = new THREE.Group(); tramp.position.set(0, 0.5, 10.5); g.add(tramp);
  box(2.8, 0.25, 2.8, '#333a55', 0, 0.35, 0, tramp); for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) box(0.2, 0.4, 0.2, '#555', x, 0.15, z, tramp);
  const pad = box(2.4, 0.1, 2.4, 0, 0, 0.5, 0, tramp, new THREE.MeshLambertMaterial({ color: '#b6ff3b', emissive: '#5a9a00', emissiveIntensity: 0.4 }));
  // campfire
  const fire = new THREE.Group(); fire.position.set(-3.5, 0.5, 11.2); g.add(fire);
  box(1.2, 0.2, 0.25, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = 0.6; box(1.2, 0.2, 0.25, '#7a4a2a', 0, 0.1, 0, fire).rotation.y = -0.6;
  const flames = [0, 1, 2, 3, 4].map(i => box(0.3, 0.3, 0.3, 0, (i - 2) * 0.12, 0.35, ((i * 7) % 3 - 1) * 0.12, fire, new THREE.MeshBasicMaterial({ color: ['#ffdf3c', '#ff9a2a', '#ff5a1a'][i % 3] })));
  const fireL = new THREE.PointLight('#ff9a4a', 0, 14, 1.4); fireL.position.set(0, 1.2, 0); fire.add(fireL);
  // characters
  const bloop = mkBurble('#e0577b'); g.add(bloop.B.root); hardHat(bloop.B);
  const invoice = box(0.36, 0.48, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop.B.aR);
  const L = makeLurk(); g.add(L.root);
  const bombObj = new THREE.Group(); g.add(bombObj); box(0.36, 0.36, 0.36, 0, 0, 0, 0, bombObj, new THREE.MeshLambertMaterial({ color: '#ff3d7f', emissive: '#ff2266', emissiveIntensity: 0.6 })); box(0.16, 0.08, 0.16, '#3cc26a', 0, 0.21, 0, bombObj);
  const shardObj = box(0.25, 0.5, 0.25, 0, 0, 0, 0, g, MAT.shard);
  const packGlow = box(0.2, 0.3, 0.06, 0, 0, 1.2, -0.45, hero.body, MAT.shard);
  const boomL = new THREE.PointLight('#ffb050', 0, 30, 1.4); boomL.position.set(-2, 10, -2); g.add(boomL);
  // bursts
  burst(E.statueBoom, [-2, 10, -2], { n: 200, colors: ['#ffef7a', '#ff9a3c', '#ff3d7f', '#ffffff'], speed: 12, size: 0.4, life: 1.4, grav: 2, drag: 2.4 });
  burst(E.statueBoom + 0.1, [-2, 10, -2], { n: 80, colors: ['#666', '#888', '#aaa'], speed: 4, size: 0.8, life: 2.4, grav: -1, drag: 1.5 });
  burst(E.splash, [0, 0.6, -6.5], { n: 120, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 7, size: 0.22, life: 1.4, grav: 14, hemi: 1, up: 5 });
  for (let i = 0; i < 3; i++) burst(E.bounce + i * 0.8, [0, 1.2, 10.5], { n: 16, colors: ['#b6ff3b', '#ffffff'], speed: 3, size: 0.12, life: 0.6, grav: 4 });
  burst(E.launch, [0, 1.2, 10.5], { n: 40, colors: ['#b6ff3b', '#ffffff', '#ffe066'], speed: 6, size: 0.16, life: 1, grav: 4 });
  for (let k = 0; k < 6; k++) burst(E.clear + 0.6 + k * 0.6, [Math.sin(k) * 3, 1.5, Math.cos(k) * 3], { n: 30, colors: ['#bba98a', '#ddd'], speed: 4, size: 0.4, life: 1.2, grav: 0, drag: 2 });
  burst(E.leggy, [-20, 1, 23], { n: 120, colors: ['#6e452d', '#8b5a3c', '#3cc2a3'], speed: 7, size: 0.35, life: 1.8, grav: 9, hemi: 1, up: 6 });
  for (let k = 0; k < 6; k++) burst(E.catch + k * 0.7, [-2, 3.2, 15.6], { n: 10, colors: ['#ff6fb8', '#ff3d7f', '#ffb0d4'], speed: 1.2, size: 0.22, life: 1.6, grav: -1.5, up: 1 });
  for (let k = 0; k < 5; k++) burst(E.pet + k * 1.1, [-2, 2.2, 16], { n: 8, colors: ['#ff6fb8', '#ffb0d4'], speed: 1, size: 0.2, life: 1.6, grav: -1.5, up: 1 });
  burst(E.creak, [0, 5.5, 0], { n: 40, colors: ['#c9a46a', '#999'], speed: 2, size: 0.12, life: 1.5, grav: 3 });
  for (let k = 0; k < 8; k++) burst(E.sink + 0.4 + k * 0.55, [Math.sin(k * 2.1) * 5, 0.6, Math.cos(k * 2.1) * 5], { n: 60, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.25, life: 1.3, grav: 12, hemi: 1, up: 5 });
  for (let k = 0; k < 4; k++) burst(E.sink + 0.2 + k * 1.0, [(k - 1.5) * 3, 1, 0], { n: 50, colors: ['#9c8b70', '#bba98a', '#ddd'], speed: 5, size: 0.7, life: 2.2, grav: -0.5, drag: 1.5, hemi: 1 });
  function bloopAt(t) {
    if (t < E.clear) return null;
    if (t < E.fortA) { const a = t * 6; return { p: [Math.sin(a) * 4, 0.5 + Math.abs(Math.sin(t * 11)) * 0.6, Math.cos(a) * 4], yaw: a + Math.PI / 2, o: { walk: 1, phase: t * 30 } }; }
    if (t < E.fortB) { const a = t * 3.2; return { p: [Math.sin(a) * 5.6, 0.5 + Math.abs(Math.sin(t * 9)) * (1 + 4 * seg(t, E.fortA, E.fortB)), Math.cos(a) * 5.6], yaw: a + Math.PI / 2, o: { walk: 1, phase: t * 30 } }; }
    if (t < E.proud) return { p: [-2.8, 0.5, 10.6], yaw: 0.2, o: { facepalm: win(t, E.facepalm, E.statue) } };
    if (t < E.hide + 1.4) return { p: [-1.2, 0.5, 11.3], yaw: -0.5 };
    if (t < E.campfire) { const w = walker(t, [[E.hide + 1.4, -1.2, 0.5, 11.3], [E.hide + 2.0, -0.6, 0.5, 8.7], [E.campfire - 1.5, -0.6, 0.5, 8.7], [E.campfire, -4.6, 0.5, 12.3]], -0.6); return { p: w.p, yaw: w.yaw, o: { walk: w.walk, hop: win(t, E.hide + 1.4, E.leggyStop) } }; }
    if (t < 278) return { p: [-4.6, 0.5, 12.3], yaw: Math.PI * 0.75 };
    const w = walker(t, [[278, -4.6, 0.5, 12.3], [280, 1.0, 0.5, 11.8]], Math.PI / 2); return { p: w.p, yaw: w.yaw, o: { walk: w.walk, handOut: t > 280.2 } };
  }
  function heroAt(t) {
    const o = { t, mallet: true };
    if (t < E.planClose + 0.2) {
      const K = [[0, 0.3, 2.5, 1], [E.stand + 0.5, 0.3, 2.5, 1], [16.2, 0.3, 2.5, 3.2], [17.2, 0.2, 1.5, 4.6], [18.2, 0.1, 1.0, 5.8], [19.4, 0, 1.0, 7]];
      const w = walker(t, K, 0); const ob = { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase };
      if (t < E.sitUp) { ob.flat = 1; ob.flatDir = -1; ob.face = 'soot'; ob.mallet = false; }
      else if (t < E.stand) { ob.sit = 1; ob.face = 'soot'; ob.headYaw = Math.sin(t * 1.5) * 0.4; ob.mallet = false; }
      if (win(t, E.stand, E.planOpen)) ob.face = t < 15.2 ? 'soot' : 'smug';
      if (t >= E.planOpen) { ob.hold = true; ob.block = 'plank'; ob.mallet = false; ob.yaw = 0; ob.headPitch = 0.4; }
      return ob;
    }
    if (t < E.clear) { const w = walker(t, [[E.planClose, 0, 1.0, 7], [36, 6, 0.5, 9]]); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase }; }
    if (t < 146.6) return { ...o, p: [3.2, 0.5, 11.5], yaw: -0.4, hips: true, face: t > 141.6 ? 'smug' : 'normal', headPitch: t > 135.4 ? -0.3 : 0 };
    if (t < E.moat) { const w = walker(t, [[146.6, 3.2, 0.5, 11.5], [149, 0.5, 0.5, 8.6]], 0); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase }; }
    if (t < E.bridge) { const a = (t - E.moat) * 3.2; return { ...o, p: [Math.sin(a) * 8.5, 0.5, Math.cos(a) * 8.5], yaw: a + Math.PI / 2, walk: 1.3, phase: t * 16, block: 'water', hold: true, mallet: false }; }
    if (t < E.tramp + 0.6) return { ...o, p: [2.2, 0.5, 8.8], yaw: -Math.PI / 2, swing: (t - E.bridge) * 2, mallet: false, block: 'plank' };
    if (t < E.bounce) { const w = walker(t, [[E.tramp + 0.6, 2.2, 0.5, 8.8], [E.bounce - 0.3, 0, 1.1, 10.5]], 0); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'smug' }; }
    if (t < E.launch) { const k = (t - E.bounce) / ((E.launch - E.bounce) / 3), n = Math.floor(k), f = k - n; const hgt = [2, 3.5, 6][Math.min(2, n)];
      return { ...o, p: [0, 1.1 + Math.sin(f * Math.PI) * hgt, 10.5], yaw: 0, face: 'smug', wave: f > 0.3 && f < 0.7, walk: 0 }; }
    if (t < E.splash) { const k = seg(t, E.launch, E.splash); return { ...o, p: [0, 1.1 + Math.sin(k * Math.PI) * 22 - k * 1.0, lerp(10.5, -6.5, k)], yaw: 0, face: 'scared', panic: true, spin: k * 9 }; }
    if (t < E.statue) return { ...o, p: [0, -0.3 + Math.sin(t * 3) * 0.08, -6.5], yaw: Math.PI, face: 'soot', panic: t < E.splash + 1.5 };
    if (t < E.proud) return { ...o, p: [2.8, 0.5, 11.2], yaw: Math.PI + 0.4, swing: (t * 2.2) % 1, block: 'hoodie', mallet: false, face: 'smug', headPitch: -0.5 };
    if (t < E.dusk) return { ...o, p: [1.2, 0.5, 11.2], yaw: 0, hips: true, face: 'smug' };
    // dusk / night
    if (t < E.hide) { const ob = { ...o, p: [0.6, 0.5, 11], yaw: t < E.rumble ? 0 : -0.9, face: t < E.rumble ? 'normal' : 'scared' }; if (t > E.leggy + 1.2) ob.panic = true; return ob; }
    if (t < E.bombThrow - 0.4) { const w = walker(t, [[E.hide, 0.6, 0.5, 11], [E.hide + 0.8, -0.8, 0.5, 9.6], [E.hide + 2.6, -0.8, 0.5, 9.6], [E.hide + 3.4, 0.4, 0.5, 9.4]], -0.9); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'scared', panic: true }; }
    if (t < E.statueBoom + 0.6) { const ob = { ...o, p: [0.4, 0.5, 9.4], yaw: -0.3, face: 'normal', mallet: false, bomb: t < E.bombThrow, swing: t >= E.bombThrow - 0.4 && t < E.bombThrow + 0.3 ? (t - E.bombThrow + 0.4) / 0.7 : undefined };
      if (t > E.bombTramp) { ob.face = 'scared'; ob.yaw = Math.PI - 0.3; ob.headPitch = -0.6; } return ob; }
    if (t < E.leggyStop) return { ...o, p: [0.4, 0.5, 9.4], yaw: 0.25, face: 'soot', headPitch: 0.5, headRoll: 0.2 };
    if (t < E.roll + 2.0) { const ob = { ...o, p: [0.2, 0.5, 10.2], yaw: -0.31, face: t < E.catch ? 'scared' : 'normal', mallet: false };
      if (win(t, E.shardOut, E.toss + 0.4)) { ob.hold = true; ob.block = 'shard'; } if (win(t, E.toss - 0.2, E.toss + 0.4)) ob.swing = (t - E.toss + 0.2) / 0.6; if (t > E.catch + 0.6) ob.face = 'smug'; return ob; }
    if (t < E.campfire) { const w = walker(t, [[E.roll + 2.0, 0.2, 0.5, 10.2], [E.pet, -1.5, 0.5, 14.3]], -0.2); return { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, wave: t > E.pet + 0.3, face: 'smug', mallet: false }; }
    if (t < 250.6) return { ...o, p: [-2.4, 0.5, 11.8], yaw: Math.atan2(-1.1, -0.6), sit: 1, face: 'smug' };
    const w = walker(t, [[250.6, -2.4, 0.5, 11.8], [252.2, -2.4, 0.5, 11.8], [254.2, 2.5, 0.5, 11.5]], Math.PI);
    const ob = { ...o, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, mallet: false, headPitch: t > E.climb ? -0.4 : 0 };
    if (t < 252.2) ob.sit = 1 - seg(t, 251.4, 252.2);
    if (t > E.creak) { ob.face = 'scared'; ob.headPitch = -0.2; }
    if (win(t, E.sink, 280)) { ob.panic = true; }
    if (t > 280) { ob.yaw = -Math.PI / 2 + 0.4; ob.face = 'soot'; ob.headPitch = 0.2; }
    return ob;
  }
  function leggyAt(t) {
    L.root.visible = t > E.leggy - 0.1; L.root.rotation.set(0, 0, 0); L.body.rotation.set(0, 0, 0);
    if (!L.root.visible) return;
    const LK = [[0, -20, 0, 23], [E.leggy + 1.2, -20, 0, 23], [E.leggyStop, -2, 0, 16.5], [E.climb, -2, 0, 16.5], [E.climb + 1.6, 0, 0, 8.4], [E.climb + 2.4, 0, 0, 5.3]];
    const w = walker(t, LK, Math.PI);
    let p = [w.p[0], Math.max(0.5, hf(Math.round(w.p[0]), Math.round(w.p[2])) + 0.5), w.p[2]], yaw = w.yaw;
    if (t < E.leggy + 1.2) p[1] -= 3 * (1 - seg(t, E.leggy, E.leggy + 1.2));
    if (t >= E.leggyStop && t < E.climb) yaw = yawTo(p, hero.root.position.toArray());
    poseLurk(L, t, p, yaw, w.speed);
    if (win(t, E.catch, E.roll)) { L.root.rotation.y += Math.sin(t * 14) * 0.35; L.root.position.y += Math.abs(Math.sin(t * 10)) * 0.4; }
    if (win(t, E.roll, E.campfire)) { const k = ss(seg(t, E.roll, E.roll + 0.8)); L.body.rotation.z = Math.PI * k; L.body.position.y = lerp(1.3, 0.9, k); L.legs.forEach((g2, i) => g2.rotation.x = Math.sin(t * 12 + i) * 0.6); }
    if (t >= E.campfire && t < E.climb) { L.body.position.y = 0.75; L.legs.forEach(g2 => g2.rotation.x = 0.3); L.root.rotation.y = Math.PI * 0.8; }
    const climb0 = E.climb + 2.4;
    if (t >= climb0) {
      const k1 = seg(t, climb0, climb0 + 1.6), k2 = seg(t, climb0 + 1.6, E.onRoof);
      if (t < climb0 + 1.6) { L.root.position.set(0, lerp(0.5, 5.4, k1), 5.5); L.root.rotation.set(-Math.PI / 2 * Math.min(1, k1 * 4), Math.PI, 0); }
      else { L.root.position.set(lerp(0, 1, k2), 5.5, lerp(4.2, 0.5, k2)); L.root.rotation.set(-Math.PI / 2 * (1 - k2), Math.PI, 0); }
      if (t >= E.onRoof) { L.body.position.y = 0.75 + Math.sin(t * 1.5) * 0.04; L.legs.forEach(g2 => g2.rotation.x = 0.3); L.root.rotation.set(0, Math.PI * 1.2, 0); }
      if (t >= E.creak && t < E.sink) L.root.position.x = 1 + Math.sin(t * 40) * 0.02 * seg(t, E.creak, E.sink);
      if (t >= E.sink) { const k = seg(t, E.sink, E.sinkEnd); L.root.position.y = Math.max(5.5 - 9 * k * k, -0.55) + (k > 0.8 ? Math.sin(t * 2) * 0.08 : 0); L.root.position.x = 1 + 0.25 * k * k * 0.5; }
    }
  }
  function update(t) {
    dy.update(t); hero.root.visible = true; pose(hero, heroAt(t));
    packGlow.visible = win(t, 140, E.shardOut); packGlow.material = MAT.shard; packGlow.scale.setScalar(t > 219 ? 1 + Math.sin(t * 8) * 0.25 : 1);
    const b = bloopAt(t); bloop.B.root.visible = !!b; if (b) poseBurble(bloop, t, b.p, b.yaw, b.o || {}); invoice.visible = t > 280.2;
    leggyAt(t);
    door.visible = t < E.clear + 4.4; if (door.visible) { const k = seg(t, E.clear + 3.6, E.clear + 4.4); door.position.y = 0.75 + k * k * 20; door.scale.setScalar(1 - k * 0.9); }
    tramp.visible = t >= E.tramp && t < E.sink; if (tramp.visible) { tramp.scale.setScalar(Math.max(0.01, backOut(seg(t, E.tramp, E.tramp + 0.4)))); const hp = hero.root.position; pad.position.y = 0.5 - (hp.y < 1.5 && Math.abs(hp.z - 10.5) < 1 && t > E.bounce ? (1.5 - hp.y) * 0.3 : 0) - (win(t, E.bombTramp, E.bombTramp + 0.3) ? 0.2 : 0); }
    fire.visible = t > E.campfire - 0.5 && t < 300; flames.forEach((f, i) => { f.scale.set(1, 1 + Math.sin(t * 13 + i * 2) * 0.4, 1); f.position.y = 0.35 + Math.sin(t * 9 + i) * 0.08; }); fireL.intensity = fire.visible ? 18 + Math.sin(t * 17) * 4 : 0;
    // bomb
    bombObj.visible = win(t, E.bombThrow, E.statueBoom);
    if (bombObj.visible) { let p; if (t < E.bombTramp) { const k = seg(t, E.bombThrow, E.bombTramp); p = [lerp(0.6, 0, k), 1.8 + Math.sin(k * Math.PI) * 1.2 - k * 0.8, lerp(9.6, 10.5, k)]; }
      else { const k = seg(t, E.bombTramp, E.statueBoom); p = [lerp(0, -2, k), lerp(1.0, 10, k) + Math.sin(k * Math.PI) * 9, lerp(10.5, -2, k)]; }
      bombObj.position.set(...p); bombObj.rotation.set(t * 9, t * 6, 0); }
    boomL.intensity = t >= E.statueBoom ? 900 * Math.exp(-(t - E.statueBoom) * 4) : 0;
    shardObj.visible = t >= E.toss + 0.1 && t < E.roll;
    if (shardObj.visible) { const k = seg(t, E.toss + 0.1, E.catch); const lp = L.root.position; shardObj.position.set(lerp(0.4, lp.x, k), lerp(1.8, 2.6, k) + Math.sin(k * Math.PI) * 2.2, lerp(10.4, lp.z - 1.6, k)); shardObj.rotation.set(t * 6, t * 4, 0);
      if (t >= E.catch) { L.hd.updateMatrixWorld(true); const v = new THREE.Vector3(0, -0.4, 1.0); L.hd.localToWorld(v); g.worldToLocal(v); shardObj.position.copy(v); } }
    return { cam: homeCam(t), hud: true };
  }
  function homeCam(t) {
    const C = [
      [0, 9, 9, 16, 0, 1.5, 0, 50], [E.prevEnd, 5, 5.5, 10, 0, 2.0, 1, 50],
      [E.prevEnd + 0.01, 1.8, 3.4, 4.2, 0.3, 2.9, 1.0, 45], [E.stand - 0.1, 1.6, 3.4, 3.8, 0.3, 3.0, 1.0, 42],
      [E.stand, -4, 4, 9, 0, 2.5, 2, 55], [20.5, 3, 3, 12.5, 0, 1.6, 6, 55],
      [20.6, 1.2, 2.3, 10.0, 0, 2.0, 7, 46], [E.planClose, 1.0, 2.3, 9.6, 0, 2.0, 7, 44],
      [E.planClose + 0.01, 7, 3, 13, 0, 1.5, 7, 55], [36, 9, 4, 15, 3, 1.5, 8, 55],
      [E.clear, 0, 8, 22, 0, 2, 0, 55], [E.fortA - 0.1, 6, 10, 20, 0, 2, 0, 55],
      [E.fortA, -16, 10, 16, 0, 3, 0, 55], [141.5, 16, 10, 16, 0, 3, 0, 55],
      [141.6, 8, 4, 11, 0, 4, 0, 55], [146.5, 4, 3, 13, 0, 4.5, 0, 55],
      [146.6, 3, 2.2, 15, 0, 1.4, 10.5, 50], [E.moat - 0.1, 2.4, 2.2, 14.5, 0, 1.4, 10.5, 50],
      [E.moat, 16, 13, 16, 0, 0, 0, 55], [E.bridge - 0.1, -16, 13, 16, 0, 0, 0, 55],
      [E.bridge, 5, 2.6, 13, 0, 0.8, 7.5, 52], [E.tramp - 0.1, 4, 2.6, 13, 0, 0.8, 8.5, 52],
      [E.tramp, 5, 2.4, 15.5, 0, 1.4, 10.5, 55], [E.launch - 0.1, 5, 3.0, 15.5, 0, 3.0, 10.5, 58],
      [E.launch, 7, 4, 17, 0, 6, 8, 62], [167, 12, 12, 12, 0, 16, 2, 66], [E.splash, 9, 6, -1, 0, 1, -6.5, 60],
      [E.splash + 0.01, 3, 2.2, -11, 0, 0.6, -6.5, 50], [E.facepalm - 0.1, 3, 2.2, -11, 0, 0.6, -6.5, 50],
      [E.facepalm, -2.3, 2.0, 13.6, -2.8, 1.7, 10.6, 42], [E.statue - 0.1, -2.2, 2.0, 13.2, -2.8, 1.7, 10.6, 40],
      [E.statue, 7, 9, 9, -2, 8, -2, 55], [E.proud - 0.1, 9, 12, 7, -2, 9, -2, 55],
      [E.proud, 0, 5, 25, 0, 5, 0, 55], [E.dusk, 0, 3.5, 20, 0, 4.5, 0, 55],
      [E.rumble - 0.1, 3, 2.5, 18, 0, 3, 0, 55],
      [E.rumble, 1.8, 1.9, 14.6, 0.6, 1.7, 11, 48], [E.leggy + 1.3, 1.8, 1.9, 14.6, 0.6, 1.7, 11, 48],
      [E.leggy + 1.4, -1, 3.5, 8.5, -24, 1.5, 25, 58], [E.hide - 0.1, -1, 3.2, 8.5, -16, 1.5, 21, 54],
      [E.hide, 2.6, 2.1, 14.6, -0.4, 1.4, 10.2, 50], [E.bombThrow - 0.6, 2.6, 2.1, 14.6, -0.4, 1.4, 10.2, 50],
      [E.bombThrow - 0.5, 4, 2.4, 14, 0, 1.2, 10.3, 55], [E.bombTramp + 0.3, 4, 2.4, 14, 0, 1.2, 10.3, 55],
      [E.bombTramp + 0.31, 7, 7, 15, -1, 6, 3, 64], [E.statueBoom - 0.05, 6, 10, 7, -2, 9.5, -2, 55], [217.7, 5, 10, 8, -2, 8.5, -2, 55],
      [217.8, 1.4, 2.0, 12.6, 0.4, 1.8, 9.4, 42], [E.leggyStop - 0.1, 1.2, 2.0, 12.4, 0.4, 1.8, 9.4, 40],
      [E.leggyStop, 3.0, 3.4, 7.6, -2, 1.6, 16.5, 50], [E.shardOut - 0.1, 2.6, 3.4, 8.0, -2, 1.6, 16.5, 46],
      [E.shardOut, -3.6, 2.4, 13.6, 0.2, 1.6, 10.2, 48], [E.toss - 0.1, -3.6, 2.4, 13.2, 0.2, 1.6, 10.2, 46],
      [E.toss, 4, 3, 12.5, -1.4, 1.6, 13.8, 55], [E.roll - 0.1, 3, 3, 12.4, -2, 1.4, 16, 50],
      [E.roll, 2.6, 2.6, 16.4, -1.8, 1.0, 15.4, 50], [E.campfire - 0.1, 2.4, 2.8, 17.6, -1.8, 1.0, 15.4, 52],
      [E.campfire, 2, 3, 16.5, -3.4, 1, 11.5, 55], [250.5, 0, 3.6, 17.5, -3, 1, 11.5, 55],
      [250.6, 3, 2.2, 14.2, -1.5, 1.3, 14.5, 50], [E.climb - 0.1, 3, 2.2, 13.7, -1.5, 1.3, 15, 50],
      [E.climb, 8, 4, 15, 0, 2, 6, 55], [E.onRoof - 0.1, 8, 8, 10, 0, 5, 2, 55],
      [E.onRoof, 4, 8.2, 4, 1, 6, 0.5, 50], [E.creak - 0.1, 3.4, 8.0, 3.6, 1, 6, 0.3, 46],
      [E.creak, 0, 6, 25, 0, 4, 0, 55], [E.sink - 0.1, 0, 6, 24, 0, 4, 0, 55],
      [E.sink, 0, 7, 27, 0, 3, 0, 55], [275.9, 0, 8, 26, 0, 1, 0, 55],
      [276, 2.4, 2.0, 14.7, 2.5, 1.8, 11.5, 45], [279.9, 2.2, 2.0, 14.3, 2.5, 1.8, 11.5, 42],
      [280, 4.6, 2.0, 14.6, 1.8, 1.4, 11.6, 48], [E.logo, 4.4, 2.0, 14.2, 1.8, 1.4, 11.6, 46]];
    const c = camKeys(t, C);
    if (win(t, E.leggy + 1.4, E.hide)) { const lp = L.root.position; c.l = [lp.x, lp.y + 1.2, lp.z]; }
    return c;
  }
  return { g, update, hf };
})();

// ================================================================ QUARRY (gathering)
const quarry = (() => {
  const g = mk('quarry'), st = new VSet(g), dy = new VSet(g, true), r = rng(51);
  const hf = (x, z) => { if (x >= 9) return 8 + Math.round(vnoise(x / 6, z / 6, 21) * 3); const d = Math.max(0, Math.hypot(x + 10, (z - 2) * 1.2) - 26); return Math.round((vnoise(x / 9, z / 9, 22) * 6 - 1) * ss(d / 10)); };
  for (let x = -60; x <= 30; x++) for (let z = -35; z <= 35; z++) { if (x >= -11 && x <= -9 && z >= -7 && z <= -5) { dy.add(x, 0, z, 'sand', { t1: E.sand + 0.3 + ((x + 11) * 3 + (z + 7)) * 0.2 }); st.add(x, -1, z, 'sand'); continue; }
    const h = hf(x, z); st.add(x, h, z, 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, x >= 9 && y < h - 1 ? (r() < 0.07 ? 'ore' : 'stone') : 'soil'); }
  const targets = []; for (let y = 1; y <= 3; y++) for (let z = -2; z <= 2; z++) targets.push([8, y, z]);
  targets.forEach(([x, y, z], i) => dy.add(x, y, z, 'stone', i < 12 ? { t1: E.mine + 0.3 + i * 0.4 } : {}));
  for (let i = 0; i < 12; i++) { const [x, y, z] = targets[i]; burst(E.mine + 0.3 + i * 0.4, [x, y, z], { n: 14, colors: ['#6b7390', '#8a92ad', '#4a506a'], speed: 3, size: 0.14, life: 0.7, grav: 12 }); }
  const trees = []; for (let i = 0; i < 120; i++) { const x = Math.round(-55 + r() * 62), z = Math.round((r() - .5) * 66); if ((Math.abs(z - 2) < 9 && x > -30) || (x > -14 && z > 0 && z < 16) || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build(); dy.build();
  // the tree that falls on me
  const treeG = new THREE.Group(); treeG.position.set(-2, -0.5, 8); g.add(treeG); const ts = new VSet(treeG); tree(ts, 0, 0, 0, rng(9), 6); ts.build();
  for (let k = 0; k < 9; k++) burst(E.chop + 0.25 + k * 0.29, [-2, 1.2, 8.6], { n: 8, colors: ['#b5652e', '#e6b06a'], speed: 3, size: 0.12, life: 0.7, grav: 12, up: 1.5 });
  burst(E.treeLand, [-2, 1, 13], { n: 120, colors: ['#ff7fb6', '#ff95c4', '#b5652e', '#ffffff'], speed: 6, size: 0.25, life: 1.5, grav: 5, hemi: 1 });
  burst(E.gbonk + 0.2, [-5, 1.2, 4], { n: 40, colors: ['#7cff6b', '#3c9a32', '#ffffff'], speed: 5, size: 0.2, life: 1, grav: 8 });
  const G = makeGrumble(1); g.add(G.root);
  const stack = new THREE.Group(); g.add(stack); const stTypes = ['castle', 'log', 'sand', 'castle', 'plank', 'stone', 'castle', 'log', 'sand', 'glass'];
  stTypes.forEach((ty, i) => { const m = new THREE.Mesh(GEO, MAT[ty]); m.scale.setScalar(0.7); m.position.set((i % 2 ? 0.08 : -0.08), i * 0.68, 0); m.castShadow = true; stack.add(m); });
  function update(t) {
    dy.update(t); hero.root.visible = true; hero.root.scale.set(1, 1, 1);
    const K = [[36, 0, 0.5, -2], [38.5, 0, 0.5, -2], [41.8, 6.6, 0.5, 0], [E.mineEnd, 6.6, 0.5, 0], [E.chop - 0.4, -2, 0.5, 9.4], [E.crawl, -2, 0.5, 9.4], [E.sand - 0.6, -0.4, 0.5, 10.6]];
    let o = { t, mallet: true };
    if (t < E.sand) {
      const w = walker(t, K, Math.PI); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase });
      if (win(t, E.mine, E.mineEnd)) { o.yaw = Math.PI / 2; o.swing = (t - E.mine) / 0.4; const i = Math.min(11, Math.floor((t - E.mine) / 0.4)); o.headPitch = (2 - targets[i][1]) * 0.3; o.p = [6.6, 0.5, targets[i][2] * 0.6]; o.face = 'smug'; }
      if (win(t, E.chop, E.treeFall)) { o.yaw = Math.PI; o.swing = (t - E.chop) / 0.29; }
      if (win(t, E.treeFall, E.treeLand)) { o.yaw = Math.PI; o.headPitch = -0.6 * seg(t, E.treeFall, E.treeFall + 0.6); o.face = t > 56.4 ? 'scared' : 'smug'; o.panic = t > 56.8; }
      if (win(t, E.treeLand, E.crawl)) { o.flat = 1; o.flatDir = 1; o.face = 'scared'; hero.root.scale.set(1.15, 0.35, 1.15); }
      if (win(t, E.crawl, E.sand)) o.face = 'soot';
    } else if (t < E.carry - 0.8) {
      if (t < 65.6) Object.assign(o, { p: [-8.3, 0.5, -6], yaw: -Math.PI / 2, swing: (t - E.sand) / 0.4, face: 'smug' });
      else Object.assign(o, { p: [-3.4, 0.5, 4], yaw: -Math.PI / 2, swing: win(t, E.gbonk - 0.3, E.gbonk + 0.3) ? (t - E.gbonk + 0.3) / 0.6 : undefined, face: t > E.gbonk ? 'smug' : 'normal' });
    } else {
      const w = walker(t, [[E.carry - 0.8, 2, 0.5, 1], [80, -34, 0.5, 2]]); Object.assign(o, { p: w.p, yaw: w.yaw, walk: w.walk * 0.8, phase: w.phase, mallet: false, face: 'smug' });
      o.panic = false; pose(hero, o); hero.aL.rotation.set(-3.0, 0, 0); hero.aR.rotation.set(-3.0, 0, 0);
    }
    if (t < E.carry - 0.8) pose(hero, o);
    // tree
    const kf = seg(t, E.treeFall, E.treeLand); let rot = kf * kf * Math.PI / 2; if (t > E.treeLand) rot = Math.PI / 2 - Math.abs(Math.sin((t - E.treeLand) * 8)) * 0.1 * Math.exp(-(t - E.treeLand) * 3);
    treeG.rotation.x = rot; treeG.visible = t < E.sand;
    // grumble
    G.root.visible = win(t, 65.0, E.carry);
    if (G.root.visible) { if (t < E.gbonk + 0.2) poseGrumble(G, t, [-5.2, 0.5, 4], Math.PI / 2, 1, 0); else { const k = seg(t, E.gbonk + 0.2, E.gbonk + 2); G.root.position.set(lerp(-5.2, -26, k), 0.5 + Math.sin(k * Math.PI) * 10, lerp(4, 0, k)); G.root.rotation.set(k * 12, 0, k * 7); } }
    stack.visible = t >= E.carry - 0.8;
    if (stack.visible) { const hp = hero.root.position; stack.position.set(hp.x, hp.y + 2.5, hp.z); stack.rotation.set(0, hero.root.rotation.y, 0); stack.children.forEach((m, i) => { m.position.x = Math.sin(t * 3 + i * 0.4) * 0.03 * i; m.rotation.z = Math.sin(t * 3 + i * 0.3) * 0.02 * i; }); }
    const C = [[36, 5, 3, 6, 0, 1.4, -2, 55], [38.4, 2, 3, 6, 3, 1.6, -1, 55], [38.5, -3, 4, 6, 8, 3, 0, 58], [42.5, 2, 3.5, 6, 8, 2.5, 0, 55],
      [42.6, 4.6, 2.3, 3.4, 7.6, 1.8, 0, 50], [E.mineEnd - 0.1, 4.2, 2.3, -3.2, 7.6, 1.8, 0, 50], [E.mineEnd, 9, 4, 8, 4, 1.5, 4, 58], [E.chop - 0.1, 2, 3, 13, -2, 2, 9, 58],
      [E.chop, 1.2, 1.9, 12, -2, 2.2, 8, 50], [E.treeFall - 0.1, 1.0, 1.9, 11.6, -2, 2.4, 8, 48], [E.treeFall, 5, 3, 16, -2, 3.5, 8.5, 58], [E.treeLand, 5, 3, 16, -2, 1.5, 10, 58],
      [E.treeLand + 0.01, 1, 2, 13.5, -2, 0.8, 9.6, 50], [E.sand - 0.1, 1.4, 2.2, 14, -1, 0.8, 10, 52],
      [E.sand, -6.5, 2.4, -3.5, -9.5, 0.8, -6, 50], [65.5, -6.8, 2.4, -3.2, -9.5, 0.8, -6, 50], [65.6, -3, 2.4, 7.5, -4.5, 1.2, 4, 52], [E.carry - 0.9, -2, 2.6, 8, -6, 1.6, 3, 55],
      [E.carry - 0.8, -3, 3, 8, 1, 2.5, 1, 55], [80, -38, 4, 10, -32, 2.5, 2, 55]];
    let cam = camKeys(t, C);
    if (t >= E.carry - 0.8) { const hp = hero.root.position; cam = { p: [hp.x - 5.5, 3.2, hp.z + 6], l: [hp.x, 3, hp.z], fov: 55 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ================================================================ BURBLE VILLAGE (hiring Bloop)
const village = (() => {
  const g = mk('village'), st = new VSet(g), r = rng(61);
  const crater = (x, z) => Math.hypot(x - 14, z + 3) < 3.2;
  const hf = (x, z) => { if (crater(x, z)) return -1 - (Math.hypot(x - 14, z + 3) < 1.8 ? 1 : 0); return Math.round((vnoise(x / 10, z / 10, 31) * 7 - 1.5) * ss((Math.abs(z) - 13) / 8)); };
  for (let x = -45; x <= 45; x++) for (let z = -40; z <= 40; z++) { const h = hf(x, z); st.add(x, h, z, Math.abs(z) <= 1 && !crater(x, z) ? 'path' : 'turf'); const mn = Math.min(hf(x + 1, z), hf(x - 1, z), hf(x, z + 1), hf(x, z - 1)); for (let y = h - 1; y >= Math.min(mn, h - 1); y--) st.add(x, y, z, 'soil'); }
  const hut = (cx, cz, door) => {
    for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) for (let y = 1; y <= 3; y++) { const edge = Math.abs(x) === 2 || Math.abs(z) === 2; if (!edge) continue; if (x === 0 && z === 2 * door && y <= 2) continue;
      if (y === 2 && (Math.abs(x) === 2 && z === 0)) { st.add(cx + x, y, cz + z, 'glass'); continue; } st.add(cx + x, y, cz + z, (Math.abs(x) === 2 && Math.abs(z) === 2) ? 'log' : 'hut'); }
    for (let l = 0; l < 3; l++) { const R = 3 - l; for (let x = -R; x <= R; x++) for (let z = -R; z <= R; z++) if (l === 2 || Math.abs(x) === R || Math.abs(z) === R) st.add(cx + x, 4 + l, cz + z, 'hutRoof'); }
  };
  hut(22, -6, 1); hut(9, 7, -1); hut(21, 7, -1); hut(30, -5, 1);
  for (let i = 0; i < 14; i++) st.add(10 + Math.round(r() * 8), 0, -6 + Math.round(r() * 6), ['hut', 'hutRoof', 'log', 'glass'][i % 4]);
  const trees = []; for (let i = 0; i < 160; i++) { const x = Math.round((r() - .5) * 88), z = Math.round((r() - .5) * 78); if (Math.abs(z) < 14 || trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5)) continue; trees.push([x, z]); tree(st, x, hf(x, z), z, r, 4 + Math.floor(r() * 3)); }
  st.build();
  // warning sign with my face crossed out
  const signTex = ctex(32, gg => { gg.fillStyle = '#e6c58a'; gg.fillRect(0, 0, 32, 32); gg.fillStyle = '#f2c79b'; gg.fillRect(8, 8, 16, 16); gg.fillStyle = '#5a3a22'; gg.fillRect(8, 6, 16, 4); gg.fillStyle = '#7dff6a'; gg.fillRect(10, 11, 4, 2); gg.fillRect(18, 11, 4, 2); gg.fillStyle = '#000'; gg.fillRect(12, 19, 8, 2); gg.fillStyle = '#e8344e'; for (let i = 0; i < 28; i++) { gg.fillRect(2 + i, 2 + i, 3, 3); gg.fillRect(27 - i, 2 + i, 3, 3); } });
  const sign = new THREE.Group(); sign.position.set(10.5, 0.5, -1.6); g.add(sign); box(0.18, 2.2, 0.18, '#7a4a2a', 0, 1.1, 0, sign);
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 0.12), [lam(TX.plank), lam(TX.plank), lam(TX.plank), lam(TX.plank), new THREE.MeshLambertMaterial({ map: signTex }), lam(TX.plank)]); board.position.set(0, 2.3, 0); board.rotation.y = -0.5; sign.add(board);
  const cols = ['#e0577b', '#7b5cd6', '#3d9be0', '#f08a24', '#5a3fb8'];
  const bs = [[10.4, 0.5, 1.4], [13, 0.5, 2.4], [15.6, 0.5, 1.0], [12.2, 0.5, -1.0], [17.5, 0.5, 2.6]].map((p, i) => ({ ...mkBurble(cols[i]), p }));
  bs.forEach(b => g.add(b.B.root));
  const hh = hardHat(bs[0].B);
  for (let i = 0; i < 5; i++) burst(E.calm + i * 0.15, [bs[i].p[0], 2.6, bs[i].p[2]], { n: 10, colors: ['#ff6fb8', '#ffb0d4', '#ffe066'], speed: 1.2, size: 0.2, life: 1.6, grav: -1.5, up: 1 });
  burst(E.hardhat, [10.4, 2.6, 1.4], { n: 30, colors: ['#ffd400', '#ffffff'], speed: 3, size: 0.12, life: 1, grav: 3 });
  function update(t) {
    hero.root.visible = true; hero.root.scale.set(1, 1, 1);
    const K = [[80, -26, 0.5, 0], [E.villageReveal - 0.4, -6, 0.5, 0], [E.angry - 0.4, -6, 0.5, 0], [E.flower - 0.6, 7.6, 0.5, 1.0], [E.walkHome, 7.6, 0.5, 1.0], [130, -30, 0.5, 0.5]];
    const w = walker(t, K, Math.PI / 2); const o = { t, p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, mallet: true };
    if (win(t, E.villageReveal - 0.4, E.angry - 0.4)) o.headPitch = 0.1;
    if (win(t, E.angry, E.flower)) { o.face = 'scared'; o.yaw = Math.PI / 2; }
    if (win(t, E.flower, E.calm + 0.4)) { o.mallet = false; o.block = 'flower'; o.hold = true; o.yaw = Math.PI / 2; o.face = 'smug'; }
    if (win(t, E.calm + 0.4, E.walkHome)) { o.yaw = Math.PI / 2; o.face = 'smug'; o.wave = win(t, E.hardhat, E.hardhat + 1.5); }
    pose(hero, o);
    hh.visible = t >= E.hardhat; if (hh.visible) hh.scale.setScalar(Math.max(0.01, backOut(seg(t, E.hardhat, E.hardhat + 0.3))));
    bs.forEach((b, i) => {
      let p = b.p, yaw = yawTo(b.p, hero.root.position.toArray()), opt = { seed: i };
      if (win(t, E.angry, E.calm)) { opt.angry = true; opt.hop = true; }
      if (i === 0 && t >= E.walkHome) { const bw = walker(t - 1.4, [[0, 10.4, 0.5, 1.4], [E.walkHome, 10.4, 0.5, 1.4], [130, -30, 0.5, 0.5]], Math.PI / 2); p = bw.p; yaw = bw.yaw; opt.walk = bw.walk; opt.phase = bw.phase; }
      if (i > 0 && t >= E.walkHome) { opt.hop = false; b.B.aR.rotation.set(-2.6, 0, Math.sin(t * 10 + i) * 0.4); }
      poseBurble(b, t, p, yaw, opt);
      if (i > 0 && t >= E.walkHome) b.B.aR.rotation.set(-2.6, 0, Math.sin(t * 10 + i) * 0.4);
    });
    const C = [[80, -30, 3, 5, -24, 1.5, 0, 55], [E.villageReveal - 0.1, -11, 3, 4, -5, 1.5, 0, 55],
      [E.villageReveal, -10, 3.2, -2.2, 12, 2.5, 0, 55], [E.angry - 0.1, -9, 3.6, -2.5, 14, 2, 0, 52],
      [E.angry, 7.5, 2.0, 4.4, 13, 1.6, 1.8, 46], [92.6, 8.5, 2.0, 4.6, 13, 1.6, 1.8, 44], [92.7, 14, 1.8, -3.4, 15.6, 1.6, 1.0, 40], [E.flower - 0.1, 13.6, 1.8, -3.0, 13, 1.6, 2.4, 40],
      [E.flower, 9.0, 2.2, -2.6, 7.6, 1.7, 1.0, 46], [E.calm - 0.1, 9.4, 2.2, -2.2, 7.6, 1.7, 1.0, 44],
      [E.calm, 5, 3.2, 5, 13, 1.8, 1, 55], [E.hireOpen - 0.1, 5.5, 3.2, 5.5, 13, 1.8, 1, 55],
      [E.hireOpen, 8.4, 2.0, 3.2, 10.4, 1.7, 1.4, 44], [E.walkHome - 0.1, 8.6, 2.0, 3.6, 10.4, 1.9, 1.4, 42],
      [E.walkHome, 0, 3, 6, 6, 1.5, 1, 55], [122.5, -14, 3, 6, -8, 1.5, 1, 55], [122.6, -24, 4, 7, -18, 1.6, 1, 55], [130, -30, 4, 8, -24, 1.6, 1, 55]];
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- lighting per time
function sky(t, sec) {
  const day = { top: '#5db8ff', bot: '#d4f1ff', sunI: 2.6, hemiI: 1.5, fog: '#cfefff', sunEl: 0.9, sunAz: 0.6 };
  const dusk = { top: '#5d3d8f', bot: '#ff9f6b', sunI: 1.4, hemiI: 0.9, fog: '#d48a7a', sunEl: 0.06, sunAz: -0.4 };
  const night = { top: '#0d1440', bot: '#34408e', sunI: 1.1, hemiI: 1.0, fog: '#1a1f4f', sunEl: -0.3, sunAz: -0.4 };
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
  flower: (x, y, s) => { ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 1.5, y - 2, 3, s * 1.1); ctx.fillStyle = '#ff6fb8'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * 1.256) * s * 0.4, y - s * 0.4 + Math.sin(i * 1.256) * s * 0.4, s * 0.32, 0, 7); ctx.fill(); } ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(x, y - s * 0.4, s * 0.25, 0, 7); ctx.fill(); },
  shard: (x, y, s) => { ctx.fillStyle = '#5ff7ff'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.45, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s * 0.45, y); ctx.fill(); ctx.fillStyle = '#d4feff'; ctx.fillRect(x - 2, y - s * 0.5, 3, s * 0.6); },
  sand: (x, y, s) => isoCube(x, y, s, '#f0dc98', '#e8d28a', '#c9b06a'),
  burble: (x, y, s) => { ctx.fillStyle = '#c8e6a0'; ctx.fillRect(x - s * 0.7, y - s * 0.5, s * 1.4, s * 1.2); ctx.fillStyle = '#fff'; ctx.fillRect(x - s * 0.35, y - s * 0.3, s * 0.7, s * 0.55); ctx.fillStyle = '#1a1a40'; ctx.fillRect(x - s * 0.15, y - s * 0.2, s * 0.3, s * 0.35); ctx.fillStyle = '#ffd400'; ctx.fillRect(x - s * 0.8, y - s * 0.95, s * 1.6, s * 0.4); },
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
  const hpv = t < E.treeLand ? 5 : t < E.splash ? 4 : t < E.statueBoom ? 3.5 : t < E.sink ? 3 : 2.5;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (t > E.sink && t < 280) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = t > 194 && t < E.dawn + 2;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined((night ? '☾ NIGHT 2' : '☀ DAY 2'), W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const logs = t < E.crawl ? 0 : t < E.hireClick ? 6 : 1;
  const slots = [['mallet', 1], ['castle', t < E.mineEnd ? Math.max(0, Math.floor((t - E.mine) / 0.4)) : 12], ['log', logs], ['flower', t < E.calm ? 1 : 0], ['bomb', t < E.bombThrow ? 1 : 0], ['shard', t < E.toss ? 1 : 0], ['sand', t > E.sand + 0.5 ? 9 : 0]];
  let sel = 0; if (win(t, E.flower, E.calm)) sel = 3; else if (win(t, E.bombThrow - 1, E.bombThrow + 0.2)) sel = 4; else if (win(t, E.shardOut, E.toss + 0.3)) sel = 5; else if (win(t, E.moat, E.proud)) sel = 1;
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
const TOASTS = [[E.mineEnd, '+12 Slatestone', 'castle'], [E.crawl + 0.2, '+6 Emberbark Log', 'log'], [E.sand + 1.8, '+9 Sand', 'sand'], [E.hardhat + 0.4, 'Bloop joined your party!', 'burble'], [E.catch + 0.6, 'Leggy joined your party!', 'shard']];
const FEATS = [[62.6, 'Lumberjacked', 'Get flattened by your own tree'], [E.hireClose + 0.4, 'Diplomacy!', 'Hire someone whose village you exploded'], [186.2, 'Fortress of Not Collapsing', 'Build something that stands (for now)'], [243.4, 'Leg Whisperer', 'Befriend a Hexapede'], [277.6, 'Deja Vu', 'Lose a house. Again.']];
const POPS = [[E.mine + 0.35, 0.4, 'CLINK!', 0.62, 0.4, '#cfd8ff', 40], [E.mine + 1.55, 0.4, 'CLONK!', 0.6, 0.48, '#cfd8ff', 40], [E.mine + 2.75, 0.4, 'TINK!', 0.62, 0.38, '#cfd8ff', 40],
  [E.treeFall + 0.1, 1.8, 'TIMBERRR!', 0.5, 0.2, '#ffe066', 70], [E.treeLand, 1.4, 'SQUISH', 0.5, 0.55, '#ff9ecb', 80], [E.gbonk + 0.2, 1.2, 'BONK!', 0.4, 0.35, '#7cff6b', 70],
  [E.angry + 0.2, 1.6, '>:(', 0.62, 0.22, '#ff3d3d', 90], [E.calm, 1.4, '<3', 0.6, 0.22, '#ff6fb8', 90],
  [E.bounce, 0.6, 'boing', 0.55, 0.5, '#b6ff3b', 44], [E.bounce + 1.13, 0.6, 'BOING', 0.45, 0.42, '#b6ff3b', 54], [E.bounce + 2.26, 0.7, 'BOIIING!', 0.55, 0.35, '#b6ff3b', 64], [E.launch, 1.4, 'BOOOOOING!!!', 0.5, 0.25, '#b6ff3b', 84],
  [E.splash, 1.4, 'SPLOOSH', 0.5, 0.35, '#5aa8ff', 80], [E.rumble + 0.1, 1.5, '?!', 0.62, 0.25, '#ffffff', 110], [200.4, 1.3, '!!!', 0.3, 0.25, '#ff3d3d', 110],
  [E.bombTramp, 0.8, 'BOING!', 0.45, 0.6, '#b6ff3b', 60], [E.statueBoom + 0.05, 1.3, 'KA-BLAMMO!', 0.5, 0.3, '#ff6b2a', 86], [E.catch + 0.1, 1.4, '♥', 0.4, 0.35, '#ff6fb8', 110],
  [E.creak, 2.0, '*creeeak*', 0.5, 0.22, '#ffffff', 50], [E.sink + 1.6, 2.4, 'GLUB GLUB GLUB', 0.5, 0.25, '#5aa8ff', 76]];
const ZOOMS = [[E.treeLand, 1.4, 1.3, 0.5, 0.55], [E.gbonk + 0.2, 0.5, 1.25, 0.45, 0.45], [E.angry, 1.0, 1.2, 0.5, 0.45], [E.launch + 1.4, 0.6, 1.25, 0.5, 0.4], [E.splash + 0.1, 1.0, 1.3, 0.5, 0.5], [E.facepalm + 0.5, 2.0, 1.2, 0.5, 0.45],
  [E.rumble + 0.1, 1.2, 1.2, 0.5, 0.45], [200.4, 1.0, 1.3, 0.5, 0.45], [E.statueBoom, 0.8, 1.3, 0.5, 0.4], [217.8, 2.4, 1.2, 0.5, 0.45], [E.leggyStop + 1, 1.4, 1.15, 0.5, 0.5], [E.roll + 0.3, 1.6, 1.15, 0.5, 0.5],
  [E.creak, 2.0, 1.15, 0.5, 0.5], [E.sink, 1.2, 1.2, 0.5, 0.45], [276, 1.6, 1.25, 0.5, 0.45]];
const SHAKES = [[E.chop, 2.6, 0.03], [E.treeLand, 1.0, 0.5], [E.gbonk + 0.2, 0.4, 0.15], [E.splash, 0.6, 0.25], [E.rumble, 2.2, 0.25], [E.leggy, 3, 0.15], [E.leggy + 3, 18, 0.03], [E.statueBoom, 1.4, 0.45], [E.creak, 2.4, 0.06], [E.sink, 5.0, 0.35], [276, 1.0, 0.15]];
const FLASH = [[E.statueBoom, 0.6, '255,240,200'], [E.prevEnd - 0.15, 0.4, '255,255,255'], [36 - 0.25, 0.5, '255,255,255'], [80 - 0.25, 0.5, '255,255,255'], [130 - 0.25, 0.5, '255,255,255']];
function stamp(t, s, text) { if (!win(t, s, s + 3.6)) return; const k = seg(t, s, s + 0.18); const sc = lerp(2.4, 1, k * k); ctx.save(); ctx.globalAlpha = (1 - ss(seg(t, s + 3.2, s + 3.6))) * Math.min(1, k * 2); ctx.translate(W / 2, H * 0.42); ctx.rotate(-0.12); ctx.scale(sc, sc);
  rrect(-260, -52, 520, 104, 12); ctx.lineWidth = 10; ctx.strokeStyle = '#2bd46a'; ctx.stroke(); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill(); outlined(text, 0, 2, 46, '#2bd46a', '#06230f', 7); ctx.restore(); }
function drawPlan(t) {
  const k = ss(seg(t, E.planOpen, E.planOpen + 0.3)) * (1 - ss(seg(t, E.planClose - 0.3, E.planClose))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 30 + (1 - k) * 60); ctx.rotate(-0.04);
  ctx.fillStyle = '#fff8dc'; ctx.fillRect(-210, -190, 420, 360); ctx.fillStyle = '#e8434e'; ctx.fillRect(-170, -190, 3, 360);
  ctx.strokeStyle = 'rgba(80,120,200,.35)'; ctx.lineWidth = 2; for (let y = -130; y < 170; y += 44) { ctx.beginPath(); ctx.moveTo(-210, y + 26); ctx.lineTo(210, y + 26); ctx.stroke(); }
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(-60, -204, 120, 26);
  outlined('THE REBUILD PLAN', 10, -150, 28, '#2a1d14', '#fff8dc', 2);
  const items = [[24.8, '1. Get stone'], [26.6, '2. Get help'], [28.6, '3. DO NOT touch the', '   support block'], [31.0, '4. ???']];
  let y = -95; ctx.textAlign = 'left';
  for (const [s, a, b2] of items) { if (t < s) break; ctx.font = F(26); ctx.fillStyle = s === 28.6 ? '#c0182a' : '#22305a'; ctx.fillText(a, -150, y); if (b2) { y += 40; ctx.fillText(b2, -150, y); } y += 52; }
  if (t > 30) { ctx.strokeStyle = '#c0182a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-150, 20 + 2); ctx.lineTo(-150 + 300 * seg(t, 30, 30.6), 22); ctx.stroke(); }
  ctx.restore();
}
function drawHire(t) {
  const k = ss(seg(t, E.hireOpen, E.hireOpen + 0.3)) * (1 - ss(seg(t, E.hireClose - 0.25, E.hireClose))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, H / 2 - 20); ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
  rrect(-300, -170, 600, 320, 22); ctx.fillStyle = 'rgba(20,40,30,.93)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ffd400'; ctx.stroke();
  outlined('HIRE-O-MATIC', 0, -135, 30, '#ffd400', '#000', 5);
  ICON.burble(-200, -30, 56); outlined('BLOOP', -200, 50, 22, '#fff', '#000', 4); outlined('the Builder', -200, 74, 15, '#cfe0ff', '#000', 3);
  outlined('Skills: building, staring', 70, -80, 17, '#cfe0ff', '#000', 3, 'left'); outlined('Rating: ★★★★★', 70, -54, 17, '#ffe066', '#000', 3, 'left');
  outlined('COST:', -60, -6, 20, '#fff', '#000', 4, 'left');
  for (let i = 0; i < 5; i++) ICON.log(30 + i * 30, -8, 11); outlined('+', 195, -6, 22, '#fff', '#000', 4); ICON.flower(225, -2, 14);
  const pressed = Math.abs(t - E.hireClick) < 0.15; rrect(-30, 70, 200, 50, 14); ctx.fillStyle = pressed ? '#b39500' : '#ffd400'; ctx.fill(); outlined('HIRE!', 70, 96, 24, '#2a1d14', '#fff8', 2);
  const c = track(t, [[E.hireOpen, 260, 0, 140], [E.hireClick - 0.8, 260, 0, 140], [E.hireClick, 80, 0, 100], [E.hireClose, 120, 0, 120]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
}
function drawInvoice(t) {
  const k = ss(seg(t, E.invoice, E.invoice + 0.4)) * (1 - ss(seg(t, E.invoiceEnd - 0.3, E.invoiceEnd))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 80); ctx.rotate(0.03);
  ctx.fillStyle = '#f6e7c1'; ctx.fillRect(-200, -200, 400, 380); ctx.fillStyle = '#d9c393'; ctx.fillRect(-210, -214, 420, 22); ctx.fillRect(-210, 172, 420, 22);
  outlined('INVOICE #002', 0, -160, 30, '#5a2a10', '#f6e7c1', 2); ctx.font = F(15, 'normal'); ctx.fillStyle = '#5a2a10'; ctx.textAlign = 'center'; ctx.fillText('from: Bloop the Builder', 0, -128);
  const lines = [[0.6, 'Labor', '5 logs'], [1.4, 'Moat (unrequested)', '12 logs'], [2.2, 'Trampoline cleanup', '20 logs'], [3.0, 'Emotional damage', '900 logs']];
  let y = -80; for (const [s, a, b2] of lines) { if (t < E.invoice + s) break; ctx.font = F(19); ctx.textAlign = 'left'; ctx.fillStyle = s === 3.0 ? '#c0182a' : '#3a2410'; ctx.fillText(a, -170, y); ctx.textAlign = 'right'; ctx.fillText(b2, 170, y); y += 42; }
  if (t > E.invoice + 3.8) { ctx.fillStyle = '#3a2410'; ctx.fillRect(-170, y - 20, 340, 3); ctx.font = F(24); ctx.textAlign = 'left'; ctx.fillText('TOTAL', -170, y + 14); ctx.textAlign = 'right'; ctx.fillStyle = '#c0182a'; ctx.fillText('937 logs', 170, y + 14);
    ctx.save(); ctx.translate(90, 120); ctx.rotate(-0.25); ctx.strokeStyle = '#c0182a'; ctx.lineWidth = 4; ctx.strokeRect(-70, -22, 140, 44); ctx.font = F(20); ctx.textAlign = 'center'; ctx.fillStyle = '#c0182a'; ctx.fillText('DUE NOW', 0, 8); ctx.restore(); }
  ctx.restore();
}
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
function drawPrev(t) {
  if (t < E.prevEnd) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.12)'; for (let y = (Math.floor(t * 60) % 4); y < H; y += 4) ctx.fillRect(0, y, W, 2);
    outlined('PREVIOUSLY ON', 60, 60, 26, '#fff', '#000', 5, 'left'); outlined('SHARDWILD...', 60, 100, 40, '#ffe066', '#000', 6, 'left');
    if (Math.floor(t * 2) % 2) { ctx.fillStyle = '#ff2a4a'; ctx.beginPath(); ctx.arc(W - 300, 56, 9, 0, 7); ctx.fill(); } outlined('▶ PLAY   EP.1', W - 280, 57, 22, '#fff', '#000', 4, 'left'); ctx.restore(); }
  if (win(t, E.titleIn, E.titleIn + 3.8)) { const k = ss(seg(t, E.titleIn, E.titleIn + 0.35)) * (1 - ss(seg(t, E.titleIn + 3.4, E.titleIn + 3.8))); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -400, 0);
    rrect(40, H * 0.3, 560, 150, 18); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ff5cf0'; ctx.stroke();
    outlined('EPISODE 2', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('I REBUILD THE HOUSE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it goes worse)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 3: I LIVE IN A BOAT' : 'EP 1: THE HOUSE', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it sinks)' : '(it fell)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, 36, home, 'home'], [36, 80, quarry, 'quarry'], [80, 130, village, 'village'], [130, 1e9, home, 'home']];
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
  if (T < E.prevEnd) ctx.filter = 'sepia(0.7) contrast(1.1) saturate(0.8)';
  if (frozen) { const k = seg(T, E.freeze, E.freeze + 0.25); ctx.filter = `saturate(${lerp(1, 0.25, k)}) contrast(${lerp(1, 1.15, k)}) sepia(${0.25 * k})`; }
  const zf = frozen ? 1 + 0.08 * ss(seg(T, E.freeze, E.freeze + 5)) : z;
  const sw = W / zf, shh = H / zf; ctx.drawImage(renderer.domElement, ((W - sw) * (frozen ? 0.5 : zx)) * RS, ((H - shh) * (frozen ? 0.45 : zy)) * RS, sw * RS, shh * RS, 0, 0, W, H);
  ctx.restore();
  // vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
  const panic = win(T, 200.4, E.hide + 2) || win(T, E.treeFall + 1.4, E.treeLand + 1) || win(T, E.sink, E.sink + 6);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.prevEnd) drawHUD(T, res);
    if (win(T, E.clear, E.fortB) || win(T, E.moat, E.moatEnd) || win(T, E.statue, E.statueEnd)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawPlan(T); drawHire(T); drawInvoice(T); stamp(T, E.stamp1, 'STEP 1: COMPLETE ✓'); stamp(T, E.stamp2, 'STEP 2: COMPLETE ✓');
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, 182.0, 182.5)) * (1 - ss(seg(T, 188.4, 189))); ctx.save(); ctx.globalAlpha = k; rrect(40, 210, 330, 104, 14); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); outlined('GREATEST HOUSE EVER', 205, 240, 22, '#fff', '#000', 4); outlined('★★★★★', 205, 272, 30, '#ffe066', '#000', 4); outlined('(rated by me)', 205, 300, 14, '#ccc', '#000', 3); ctx.restore(); }
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.25, H * 0.22); ctx.rotate(-0.08); outlined('yep. again.', 0, 0, 84, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that's (still) me.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(it was made of STONE)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
    if (win(T, E.hours, E.hoursEnd)) { const k = ss(seg(T, E.hours, E.hours + 0.4)) * (1 - ss(seg(T, E.hoursEnd - 0.4, E.hoursEnd)));
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#0b0820'; ctx.fillRect(0, 0, W, H);
      const words = ['several', 'terrifying', 'hours', 'later...']; words.forEach((w, i) => { ctx.save(); ctx.translate(W / 2, H / 2 - 60 + i * 52); ctx.rotate(Math.sin(T * 3 + i) * 0.04); outlined(w, 0, 0, 52, ['#ff5cf0', '#ffe066', '#5ff7ff', '#ffffff'][i], '#000', 8); ctx.restore(); });
      ctx.restore(); }
    drawCaption(T);
    if (T > 3) drawFacecam(T);
  } else drawLogo(T);
  drawPrev(T);
  return out.toDataURL('image/jpeg', 0.9);
};
window.prof = (t, n) => { const a = performance.now(); for (let i = 0; i < n; i++) window.renderAt(t + i / 24); const b = performance.now(); for (let i = 0; i < n; i++) { renderer.render(scene, camera); renderer.getContext().finish(); } const c = performance.now(); return [(b - a) / n, (c - b) / n]; };
window.ready = true;
