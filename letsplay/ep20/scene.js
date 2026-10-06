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

// ================================================================ EPISODE 3: "I LIVE IN A BOAT (it sinks)"
const parentTo = (o, grp) => { if (o.parent !== grp) grp.add(o); };
TX2.sail = ctex(16, (g) => { for (let y = 0; y < 16; y++) { g.fillStyle = (y >> 2) % 2 ? '#ffffff' : '#ff4d6d'; g.fillRect(0, y, 16, 1); } g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 1, 16); }, 41);
const sailMat = new THREE.MeshLambertMaterial({ map: TX2.sail, side: THREE.DoubleSide });
// --- the boat (local: forward +z, deck surface y = 1.5)
function buildBoat(parent, timed) {
  const G2 = new THREE.Group(); parent.add(G2); const vs = new VSet(G2, true), cells = [];
  const hw = z => z > 3 ? 5 - z : (z < -4 ? 1 : 2);
  for (let z = -5; z <= 5; z++) { const w = hw(z);
    for (let x = -w; x <= w; x++) { if (Math.abs(x) < w || w === 0) cells.push([x, 0, z, 'log', 0]); }
    for (let x = -w; x <= w; x++) if (Math.abs(x) === w || z === -5 || z === 5) { cells.push([x, 1, z, 'log', 1]); if (z <= 3) cells.push([x, 2, z, 'plank', 1]); }
    for (let x = -w + 1; x <= w - 1; x++) if (z > -5 && z < 5) cells.push([x, 1, z, 'plank', 2]); }
  for (let x = -1; x <= 1; x++) for (let z = -4; z <= -2; z++) for (let y = 2; y <= 3; y++) { if (Math.abs(x) < 1 && z > -4 && z < -2) continue; if (x === 0 && z === -2 && y === 2) continue; cells.push([x, y, z, y === 3 && x === 0 && z === -4 ? 'glass' : 'plank', 3]); }
  for (let x = -1; x <= 1; x++) for (let z = -4; z <= -2; z++) cells.push([x, 4, z, 'slate', 3]);
  for (let y = 2; y <= 10; y++) cells.push([0, y, 1, 'log', 4]);
  const ph = [[E.buildA, E.hull], [E.hull, E.deckEnd - 1.4], [E.hull + 1.0, E.deckEnd], [E.deckEnd - 1.2, E.deckEnd], [E.mast, E.sail]];
  const byPh = [0, 1, 2, 3, 4].map(p => cells.filter(c => c[4] === p));
  const blocks = [];
  byPh.forEach((arr, p) => arr.forEach((c, i) => { const o = timed ? { t0: ph[p][0] + i * (ph[p][1] - ph[p][0]) / arr.length } : {}; blocks.push(vs.add(c[0], c[1], c[2], c[3], o)); }));
  const sail = new THREE.Group(); sail.position.set(0, 7, 1.3); G2.add(sail); const sm = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.4, 0.08), sailMat); sm.castShadow = true; sail.add(sm);
  const flag = box(0.8, 0.5, 0.05, '#5ff7ff', 0.45, 3.0, 0, sail);
  const cannon = new THREE.Group(); cannon.position.set(0, 2.0, 3.6); G2.add(cannon);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 1.6, 10), new THREE.MeshLambertMaterial({ color: '#2a2a35' })); barrel.rotation.x = Math.PI / 2 - 0.25; barrel.position.set(0, 0.3, 0.3); barrel.castShadow = true; cannon.add(barrel);
  box(0.9, 0.35, 1.0, '#7a4a2a', 0, -0.25, 0, cannon); for (const x of [-0.5, 0.5]) for (const z of [-0.3, 0.3]) box(0.12, 0.35, 0.35, '#3a2410', x, -0.35, z, cannon);
  const anchor = new THREE.Group(); anchor.position.set(2.8, 2.2, -1); G2.add(anchor);
  for (const [x, y] of [[0, 0], [0, -1], [0, -2], [-0.5, -2.2], [0.5, -2.2], [-0.9, -1.8], [0.9, -1.8]]) { const m = new THREE.Mesh(GEO, MAT.buzz); m.scale.setScalar(0.5); m.position.set(x, y * 0.5, 0); m.castShadow = true; anchor.add(m); }
  const chain = box(0.08, 1, 0.08, '#555', 0, 0, 0, G2);
  vs.build();
  return { G: G2, vs, blocks, sail, cannon, anchor, chain, flag };
}
function makeBird(col = '#ff7fb6') {
  const root = new THREE.Group(); box(0.5, 0.4, 0.8, col, 0, 0, 0, root); box(0.36, 0.36, 0.36, col, 0, 0.25, 0.45, root); box(0.12, 0.1, 0.3, '#ff9a2a', 0, 0.22, 0.75, root);
  box(0.08, 0.08, 0.05, '#000', -0.13, 0.32, 0.64, root); box(0.08, 0.08, 0.05, '#000', 0.13, 0.32, 0.64, root);
  const wL = pivot(root, -0.25, 0.1, 0), wR = pivot(root, 0.25, 0.1, 0); box(0.8, 0.06, 0.45, shade(col, 0.85), -0.4, 0, 0, wL); box(0.8, 0.06, 0.45, shade(col, 0.85), 0.4, 0, 0, wR);
  return { root, wL, wR };
}
function makeGulp() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const skin = new THREE.MeshLambertMaterial({ color: '#2f6f7a' }), belly = new THREE.MeshLambertMaterial({ color: '#9fd8c8' });
  box(10, 6, 16, 0, 0, 0, 0, body, skin); box(9, 1.2, 15, 0, 0, -3.1, 0.2, body, belly); box(8, 4, 3, 0, 0, -0.2, -9, body, skin); box(1, 5, 4, 0, 0, 0, -11.5, body, skin);
  box(1, 3, 3, 0, -5.4, -1, 1, body, skin).rotation.z = 0.5; box(1, 3, 3, 0, 5.4, -1, 1, body, skin).rotation.z = -0.5;
  box(7, 1.1, 0.3, '#14303a', 0, -1.2, 8.05, body);
  for (let i = 0; i < 6; i++) box(0.4, 0.5, 0.2, '#ffffff', -2.5 + i, -0.8, 8.1, body);
  const eyes = [-4.6, 4.6].map(x => { const e = pivot(body, x, 3.0, 6.6); box(0.3, 1.6, 1.6, '#ffffff', 0, 0, 0, e); box(0.32, 0.7, 0.7, '#111', Math.sign(x) * 0.02, 0, 0.2, e); const lid = box(0.36, 1.7, 1.7, '#24565f', 0, 0, 0, e); return { e, lid }; });
  const stalk = pivot(body, 0, 3, 5.5); for (let i = 0; i < 4; i++) box(0.35, 1.0, 0.35, '#2f6f7a', 0, 0.5 + i * 0.9, i * 0.45, stalk);
  const bulb = box(0.9, 0.9, 0.9, 0, 0, 4.2, 2.1, stalk, new THREE.MeshBasicMaterial({ color: '#fff27a' }));
  const lampL = new THREE.PointLight('#fff27a', 0, 25, 1.4); lampL.position.set(0, 4.2, 2.1); stalk.add(lampL);
  // the "island" on its back
  const isl = pivot(body, 0, 3, 0);
  box(9.2, 0.6, 14, '#e8d28a', 0, 0.3, 0, isl, lam(TX.sand)); box(5, 0.3, 6, '#3cc2a3', -1, 0.75, -2, isl, lam(TX.turfTop));
  const palm = pivot(isl, -2, 0.6, -2.5); for (let i = 0; i < 6; i++) { const b = box(0.55, 0.9, 0.55, 0, i * 0.18, 0.45 + i * 0.85, 0, palm, lam(TX.bark)); b.rotation.z = -0.08 * i; }
  for (let k = 0; k < 6; k++) { const f = pivot(palm, 1.0, 5.6, 0); f.rotation.y = k * Math.PI / 3; const fr = box(2.6, 0.18, 0.7, '#3cc26a', 1.3, -0.3, 0, f); fr.rotation.z = -0.35; }
  for (let i = 0; i < 3; i++) box(0.45, 0.45, 0.45, '#7a4a2a', 1.0 + (i - 1) * 0.4, 5.0, (i % 2) * 0.4, palm);
  const chest = pivot(isl, 2, 0.6, -3); box(1.2, 0.7, 0.8, '#8a5a2b', 0, 0.35, 0, chest); const lidC = pivot(chest, 0, 0.7, -0.4); box(1.25, 0.3, 0.85, '#7a4a2a', 0, 0.15, 0.4, lidC); box(1.27, 0.1, 0.1, '#ffd23f', 0, 0.2, 0.83, lidC); box(0.2, 0.25, 0.05, '#ffd23f', 0, 0.45, 0.42, chest);
  const glow = box(0.9, 0.2, 0.5, 0, 0, 0.62, 0, chest, new THREE.MeshBasicMaterial({ color: '#5ff7ff' }));
  return { root, body, eyes, stalk, lampL, isl, palm, chest, lidC, glow, TOP: 3.6 };
}
function makeCrown() { const c = new THREE.Group(); const gold = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.4 });
  box(0.62, 0.16, 0.62, 0, 0, 0, 0, c, gold); for (const [x, z] of [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25], [0, 0.3], [0, -0.3]]) box(0.1, 0.22, 0.1, 0, x, 0.18, z, c, gold); box(0.14, 0.14, 0.05, 0, 0, 0.02, 0.32, c, MAT.shard); return c; }
function makeCapHat() { const h = new THREE.Group(); box(0.95, 0.12, 0.8, '#1b2a4a', 0, 0.02, 0, h); box(0.66, 0.3, 0.6, '#1b2a4a', 0, 0.2, 0, h); box(0.67, 0.08, 0.61, '#ffd23f', 0, 0.1, 0, h); box(0.18, 0.18, 0.04, 0, 0, 0.22, 0.31, h, MAT.shard); return h; }
const capHat = makeCapHat(); hero.hatSlot.add(capHat); const crownM = makeCrown(); crownM.position.y = 0.45; capHat.add(crownM);
const rod = new THREE.Group(); hero.aR.add(rod); rod.position.set(0, -0.66, 0.1); { const s = box(0.06, 0.06, 2.4, '#8a5a2b', 0, 0, 1.1, rod); s.rotation.x = -0.6; }
const sandwich = new THREE.Group(); { box(0.4, 0.08, 0.3, '#e6b06a', 0, 0, 0, sandwich); box(0.42, 0.05, 0.32, '#3cc26a', 0, 0.06, 0, sandwich); box(0.4, 0.08, 0.3, '#e6b06a', 0, 0.12, 0, sandwich); }
function heroWorldHand() { hero.root.updateMatrixWorld(true); const v = new THREE.Vector3(0, -0.75, 0.25); hero.aR.localToWorld(v); return v; }
function lineBetween(mesh, a, b) { const mid = a.clone().add(b).multiplyScalar(0.5), d = b.clone().sub(a); mesh.position.copy(mid); mesh.scale.set(1, d.length(), 1); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }

// ================================================================ EPISODE 4: "I LIVE IN THE SKY (it falls)"
MAT.float = new THREE.MeshLambertMaterial({ map: TX.ore, emissive: '#5ff7ff', emissiveMap: TX.ore, emissiveIntensity: 1.0, color: '#9ff' });
// ================================================================ EPISODE 7: "THE ICEBERG (it melts)" — shared cast + props carried over
TX.brick = ctex(16, (g, r, n) => { noisy(['#c8492e', '#b8402a', '#d65638', '#a83824'])(g, r, n); g.fillStyle = '#e8c9a0'; for (let y = 3; y < n; y += 4) { g.fillRect(0, y, n, 1); for (let x = (y % 8 === 3 ? 2 : 6); x < n; x += 8) g.fillRect(x, y - 3, 1, 3); } }, 61);
TX.basalt = ctex(16, (g, r, n) => { noisy(['#2e2a2e', '#38323a', '#262226', '#3f383f'])(g, r, n); g.fillStyle = '#1c181c'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1); }, 62);
TX.ash = ctex(16, (g, r, n) => { noisy(['#6e6864', '#7a7470', '#5f5a57', '#857f7a'])(g, r, n); g.fillStyle = '#ff8a2a'; g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 63);
TX.lava = ctex(16, (g, r, n) => { noisy(['#ff7a1a', '#ff9a2a', '#ffb43a', '#e8561a'])(g, r, n); g.fillStyle = '#ffe27a'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 13), Math.floor(r() * 15), 3, 1); g.fillStyle = '#c0300e'; for (let i = 0; i < 4; i++) g.fillRect(Math.floor(r() * 14), Math.floor(r() * 15), 2, 1); }, 64);
TX.crust = ctex(16, (g, r, n) => { noisy(['#1e1a1c', '#262123', '#181416'])(g, r, n); g.fillStyle = '#ff6a1a'; let x = 3, y = 0; for (let i = 0; i < 18; i++) { g.fillRect(x, y, 1, 1); y++; x = (x + Math.floor(r() * 3) - 1 + n) % n; } }, 65);
TX.frost = ctex(16, (g, r, n) => { noisy(['#dff6ff', '#c8eeff', '#b4e4fa', '#e8fbff'])(g, r, n); g.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); g.fillRect(x, y + 1, 3, 1); g.fillRect(x + 1, y, 1, 3); } }, 66);
MAT.brick = lam(TX.brick); MAT.basalt = lam(TX.basalt); MAT.ash = lam(TX.ash);
MAT.lava = lam(TX.lava, { emissive: '#ffffff', emissiveMap: TX.lava, emissiveIntensity: 0.95 });
MAT.crust = lam(TX.crust, { emissive: '#ffffff', emissiveMap: TX.crust, emissiveIntensity: 0.6 });
MAT.frost = lam(TX.frost, { emissive: '#5ab8ff', emissiveIntensity: 0.2 });
function labelTex(txt, bg, fg, size = 40) { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 128, 128); g.fillStyle = fg; g.font = `bold ${size}px "DejaVu Sans", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 64, 68); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// --- new creature: Puff the Magmite (a tiny walking campfire)
function makeMagmite() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const rock = new THREE.MeshLambertMaterial({ color: '#4a3632' }), glow = new THREE.MeshBasicMaterial({ color: '#ff8a1e' }), flameM = new THREE.MeshBasicMaterial({ color: '#ffd23f' });
  box(0.8, 0.66, 0.74, 0, 0, 0.45, 0, body, rock);
  box(0.84, 0.07, 0.78, 0, 0, 0.27, 0, body, glow); box(0.07, 0.28, 0.78, 0, 0.27, 0.6, 0, body, glow); box(0.84, 0.06, 0.4, 0, 0, 0.7, -0.12, body, glow);
  for (const x of [-0.18, 0.18]) { box(0.24, 0.26, 0.04, '#ffffff', x, 0.54, 0.38, body); box(0.11, 0.15, 0.03, '#1a1010', x + 0.03, 0.52, 0.405, body); }
  box(0.14, 0.05, 0.03, '#2a0a0a', 0, 0.39, 0.385, body); box(0.1, 0.06, 0.03, '#ff9ec0', -0.3, 0.42, 0.385, body); box(0.1, 0.06, 0.03, '#ff9ec0', 0.3, 0.42, 0.385, body);
  for (const x of [-0.22, 0.22]) box(0.2, 0.12, 0.26, '#2e2220', x, 0.06, 0.05, body);
  const flame = pivot(body, 0, 0.78, 0);
  [[0, 0.16, 0, 0.3, 0.34], [-0.13, 0.08, 0.05, 0.18, 0.2], [0.13, 0.1, -0.05, 0.16, 0.24]].forEach(([x, y, z, w, h], i) => box(w, h, w, 0, x, y, z, flame, i ? glow : flameM));
  const light = new THREE.PointLight('#ff8a2a', 4, 7, 1.5); light.position.set(0, 0.9, 0.7); root.add(light);
  return { root, body, glow, flameM, flame, light };
}
const _cA = new THREE.Color(), _cB = new THREE.Color();
function poseMag(m, t, p, yaw, o = {}) {
  const cold = o.cold || 0, hop = o.hop ? Math.abs(Math.sin(t * 8)) * 0.35 : 0;
  m.root.position.set(p[0] + Math.sin(t * 70) * 0.04 * cold, p[1] + hop, p[2]); m.root.rotation.set(0, yaw, 0);
  const sq = 1 + Math.sin(t * 5) * 0.05; m.body.scale.set(1 / sq, sq, 1 / sq);
  m.glow.color.copy(_cA.set('#ff8a1e')).lerp(_cB.set('#6fe0ff'), cold); m.flameM.color.copy(_cA.set('#ffd23f')).lerp(_cB.set('#e4f8ff'), cold);
  m.flame.scale.setScalar(Math.max(0.15, 1 - cold * 0.85) * (o.big ? 2.2 : 1) * (1 + Math.sin(t * 17) * 0.1)); m.flame.rotation.y = t * 3;
  m.light.color.set(cold > 0.5 ? '#7fe8ff' : '#ff8a2a'); m.light.intensity = 4 * (1 - cold * 0.6);
}
function heatAt(t) {
  if (t < E.trek) return 0.18; if (t < E.rim) return lerp(0.18, 0.5, seg(t, E.trek, E.rim));
  if (t < E.hot) return lerp(0.6, 1.0, seg(t, E.rim + 4, E.hot)); if (t < E.crust) return 1.15;
  if (t < E.rumble) return lerp(1.0, 0.06, seg(t, E.crust, E.crust + 8)); if (t < E.erupt) return lerp(0.06, 1.2, seg(t, E.rumble, E.erupt));
  if (t < E.flyEnd) return 1.3; return lerp(1.0, 0.55, seg(t, E.flyEnd, E.flyEnd + 20));
}
const puffCold = t => seg(t, E.crust + 3, E.shiver + 3) * (1 - seg(t, E.crack, E.erupt));
const leggyShiver = t => t < E.trek ? 1 : (win(t, E.shiver + 2, E.crack) ? 0.8 : 0);
const rideOn = (lp, yaw, lz, ly) => [lp[0] + Math.sin(yaw) * lz, lp[1] + ly, lp[2] + Math.cos(yaw) * lz];
// --- shared cast + props
const bloop6 = mkBurble('#e0577b'); const bHat = hardHat(bloop6.B);
const bBrick = new THREE.Mesh(GEO, MAT.brick); bBrick.scale.set(0.34, 0.3, 0.3); bBrick.position.set(0, -0.62, 0.2); bloop6.B.aR.add(bBrick);
const blue = box(0.4, 0.5, 0.03, '#5aa0ff', 0, -0.62, 0.2, bloop6.B.aR); box(0.3, 0.03, 0.01, '#ffffff', 0, 0.1, 0.02, blue); box(0.03, 0.3, 0.01, '#ffffff', 0.05, -0.02, 0.02, blue);
const card = box(0.42, 0.3, 0.03, '#fff3cf', 0, -0.62, 0.2, bloop6.B.aR);
const L6 = makeLurk(); L6.light.intensity = 1.5;
const puff = makeMagmite();
const board = new THREE.Mesh(GEO, MAT.brick); board.scale.set(1.5, 0.3, 0.9); board.castShadow = true;
const smoke = (t0, t1, dt, pos, o = {}) => { for (let t = t0; t < t1; t += dt) burst(t, typeof pos === 'function' ? pos(t) : pos, { n: o.n ?? 4, colors: o.colors ?? ['#9a9490', '#6e6864', '#b8b2ae'], speed: o.speed ?? 0.8, size: o.size ?? 0.35, life: o.life ?? 2.2, grav: o.grav ?? -1.2, up: o.up ?? 1.2 }); };

// ================================================================ EPISODE 7: "THE ICEBERG (it melts)" — dawn beach → foggy sea → iceberg (Frostbite Cup) → sunset beach
TX.snow = ctex(16, (g, r, n) => { noisy(['#f4fbff', '#e8f4fc', '#ffffff', '#dcecf8'])(g, r, n); g.fillStyle = '#c8e0f2'; for (let i = 0; i < 5; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 71);
TX.ice = ctex(16, (g, r, n) => { noisy(['#9fdcf5', '#8fd0ee', '#b4e8fa', '#7cc4e6'])(g, r, n); g.fillStyle = '#e8f8ff'; for (let i = 0; i < 4; i++) g.fillRect(Math.floor(r() * 12), Math.floor(r() * 14), 4, 1); }, 72);
MAT.snow = lam(TX.snow); MAT.ice = lam(TX.ice, { emissive: '#3a8ac0', emissiveIntensity: 0.12 });
const holeMat = new THREE.MeshBasicMaterial({ color: '#12305a' });
function bannerTex(txt) { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#1b2a6a'; g.fillRect(0, 0, 512, 96); g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 512, 8); g.fillRect(0, 88, 512, 8); g.font = 'bold 54px "DejaVu Sans", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(txt, 256, 52); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
// --- new NPCs: Judge Flopsy + contestant seals
function makeSeal(col = '#9aa8b8', judge = false) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 0.8, 1.6, col, 0, 0.4, 0, body); box(0.7, 0.5, 0.8, shade(col, 0.9), 0, 0.28, -1.1, body); box(0.8, 0.3, 1.2, '#e8eef4', 0, 0.14, 0.15, body);
  const tail = pivot(body, 0, 0.15, -1.5); box(0.9, 0.12, 0.4, shade(col, 0.8), 0, 0, -0.15, tail);
  const hd = pivot(body, 0, 0.9, 0.6); box(0.78, 0.7, 0.72, col, 0, 0.2, 0.1, hd);
  for (const x of [-0.2, 0.2]) { box(0.13, 0.15, 0.04, '#111', x, 0.32, 0.47, hd); box(0.05, 0.05, 0.02, '#fff', x + 0.03, 0.36, 0.495, hd); box(0.4, 0.02, 0.02, '#ffffff', x * 1.7, 0.06, 0.58, hd); }
  box(0.38, 0.22, 0.2, '#d8dee6', 0, 0.06, 0.52, hd); box(0.14, 0.1, 0.06, '#222', 0, 0.14, 0.63, hd);
  const fL = pivot(body, -0.48, 0.25, 0.4), fR = pivot(body, 0.48, 0.25, 0.4); box(0.5, 0.1, 0.35, shade(col, 0.8), -0.22, 0, 0, fL); box(0.5, 0.1, 0.35, shade(col, 0.8), 0.22, 0, 0, fR);
  if (judge) { box(0.62, 0.08, 0.62, '#1a1a2a', 0, 0.58, 0.1, hd); box(0.42, 0.14, 0.42, '#1a1a2a', 0, 0.67, 0.1, hd); box(0.05, 0.3, 0.05, '#ffd23f', 0.26, 0.5, 0.36, hd);
    box(0.4, 0.14, 0.06, '#e8344e', 0, -0.22, 0.5, hd); box(0.14, 0.1, 0.22, '#ffd23f', 0.16, 0.02, 0.66, hd); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, hd, fL, fR, tail };
}
function poseSeal(s, t, p, yaw, o = {}) {
  const sd = o.seed || 0; s.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 7 + sd)) * 0.4 : 0), p[2]); s.root.rotation.set(0, yaw, 0);
  s.hd.rotation.set(-0.15 + Math.sin(t * 1.7 + sd) * 0.1 + (o.look || 0), Math.sin(t * 0.9 + sd) * 0.3, 0);
  const cl = o.clap ? Math.sin(t * 18) * 0.6 : Math.sin(t * 2 + sd) * 0.1; s.fL.rotation.set(0, cl, -0.3); s.fR.rotation.set(0, -cl, 0.3); s.tail.rotation.x = Math.sin(t * 3 + sd) * 0.2;
  s.body.rotation.x = o.slide ? 0.12 : 0;
}
// --- Glubzilla, the crowned giant fish
function makeBigFish() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(2.2, 2.0, 4.4, '#2fa88c', 0, 0, 0, body); box(1.9, 0.5, 4.0, '#c8f0e0', 0, -0.85, 0.1, body); box(0.3, 1.2, 1.6, '#1f7a66', 0, 1.4, -0.2, body);
  const tail = pivot(body, 0, 0, -2.2); box(0.3, 2.4, 1.4, '#1f7a66', 0, 0, -0.7, tail);
  for (const x of [-1.12, 1.12]) { box(0.1, 0.55, 0.55, '#ffffff', x, 0.45, 1.4, body); box(0.12, 0.26, 0.26, '#111', x * 1.02, 0.4, 1.5, body); const b = box(0.12, 0.12, 0.7, '#14303a', x * 1.02, 0.8, 1.4, body); b.rotation.x = x > 0 ? 0.3 : 0.3; }
  box(1.6, 0.3, 0.1, '#14303a', 0, -0.3, 2.21, body); for (let i = 0; i < 5; i++) box(0.14, 0.16, 0.06, '#ffffff', -0.56 + i * 0.28, -0.2, 2.26, body);
  const gold = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.5 }); box(1.2, 0.3, 1.0, 0, 0, 1.15, 1.0, body, gold);
  for (const x of [-0.45, 0, 0.45]) box(0.18, 0.35, 0.18, 0, x, 1.45, 1.0, body, gold);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, tail };
}
// --- props: raft (+ Drillbert motor), handheld Drillbert, bait bucket, trophy, catches, fishing line
const raftG = new THREE.Group(), raftVS = new VSet(raftG, true);
{ const cells = []; for (let x = -2; x <= 2; x++) for (let z = -1; z <= 1; z++) cells.push([x, 0, z, 'plank']); for (const x of [-2, 2]) for (const z of [-1, 1]) cells.push([x, 1, z, 'log']); cells.push([-2, 2, 0, 'log'], [-2, 3, 0, 'log']);
  cells.forEach((c, i) => raftVS.add(c[0], c[1], c[2], c[3], { t0: E.make + 0.4 + i * (E.makeEnd - E.make - 2) / cells.length })); raftVS.build(); }
const rflag = box(0.06, 0.6, 0.9, '#ff4d6d', -2, 3.3, 0.5, raftG);
const motor = new THREE.Group(); motor.position.set(2.9, 0.2, 0); raftG.add(motor); box(0.6, 0.5, 0.8, '#ffd400', 0, 0, 0, motor); box(0.2, 0.2, 0.82, '#e8344e', 0, 0.2, 0, motor);
const mbit = pivot(motor, 0.4, -0.45, 0); for (let i = 0; i < 3; i++) { const b = box(0.08, 0.5, 0.14, '#9aa4bd', 0.1, 0, 0, pivot(mbit, 0, 0, 0)); b.parent.rotation.x = i * Math.PI * 2 / 3; }
const drill = new THREE.Group(); bloop6.B.aR.add(drill); drill.position.set(0, -0.62, 0.25); box(0.3, 0.3, 0.5, '#ffd400', 0, 0, 0, drill); box(0.2, 0.12, 0.12, '#e8344e', 0, 0.12, -0.2, drill);
const dbit = pivot(drill, 0, 0, 0.3); box(0.1, 0.1, 0.6, '#9aa4bd', 0, 0, 0.3, dbit); box(0.16, 0.04, 0.4, '#9aa4bd', 0, 0, 0.3, dbit);
const bucket = new THREE.Group(), bMat = new THREE.MeshLambertMaterial({ color: '#3d7bff', emissive: '#ff6a1a', emissiveIntensity: 0 });
box(0.55, 0.5, 0.55, 0, 0, 0.25, 0, bucket, bMat); box(0.6, 0.06, 0.6, '#ffffff', 0, 0.5, 0, bucket); box(0.04, 0.3, 0.62, '#888888', 0, 0.62, 0, bucket);
const goldM = new THREE.MeshLambertMaterial({ color: '#ffd23f', emissive: '#a07800', emissiveIntensity: 0.5 });
const trophy = new THREE.Group(); box(0.46, 0.14, 0.36, '#7a4a2a', 0, 0, 0, trophy); const tFish = pivot(trophy, 0, 0.08, 0); box(0.62, 0.34, 0.2, 0, 0, 0.3, 0, tFish, goldM); box(0.06, 0.32, 0.26, 0, -0.34, 0.32, 0, tFish, goldM); box(0.06, 0.06, 0.22, '#111', 0.2, 0.36, 0, tFish);
const puddle = box(0.9, 0.04, 0.7, '#ffd23f', 0, 0.02, 0, trophy, goldM);
const catches = {}; { const bt = new THREE.Group(); box(0.3, 0.45, 0.3, '#5a3a22', 0, 0, 0, bt); box(0.32, 0.2, 0.55, '#5a3a22', 0, -0.2, 0.12, bt); box(0.34, 0.06, 0.58, '#222', 0, -0.32, 0.12, bt); catches.boot = bt;
  const cu = new THREE.Mesh(GEO, MAT.ice); cu.scale.setScalar(0.45); const cg = new THREE.Group(); cg.add(cu); catches.cube = cg;
  const tf = new THREE.Group(); box(0.16, 0.22, 0.4, '#ff9a2a', 0, 0, 0, tf); box(0.04, 0.2, 0.16, '#e8561a', 0, 0, -0.26, tf); box(0.04, 0.05, 0.05, '#111', 0.08, 0.05, 0.12, tf); catches.tiny = tf; }
const fline = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1, 0.025), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
const rope = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1, 0.06), new THREE.MeshLambertMaterial({ color: '#c9a46a' }));
const judge = makeSeal('#9aa8b8', true), seals = ['#7d8a99', '#a69888', '#8aa0a8'].map(c => makeSeal(c)), sfish = seals.map(() => { const f = catches.tiny.clone(); f.scale.setScalar(1.6); return f; });
const glub = makeBigFish();
const _v1 = new THREE.Vector3(), _v2 = new THREE.Vector3();
function rodTip() { hero.root.updateMatrixWorld(true); return rod.children[0].localToWorld(_v1.set(0, 0, 1.2)).clone(); }
function seaSet(g) { const s = new THREE.Mesh(GEO, MAT.water); s.scale.set(900, 2, 900); s.position.set(0, -1.2, 0); s.castShadow = false; s.receiveShadow = false; g.add(s); return s; }
function iceAt(t) { if (t < E.wet) return 1; if (t < E.crack) return lerp(1, 0.7, seg(t, E.wet, E.crack)); if (t < E.jump) return lerp(0.6, 0.12, seg(t, E.crack, E.jump)); if (t < E.sink) return 0.8; return lerp(0.8, 0, seg(t, E.sink, E.sink + 5)); }
function poseLeggySplay(k) { if (k <= 0) return; L6.body.position.y = lerp(L6.body.position.y, 0.55, k); L6.legs.forEach((l, i) => { l.rotation.z = (i < 3 ? 1 : -1) * 1.1 * k; l.rotation.x = 0; }); }

// ================================================================ EPISODE 8: "BLOOP QUITS?!" — camp → market plaza → MegaBuild site → sunset camp
const yawXZ = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]);
// --- new NPC: Gravelbeard, the MegaBuild golem boss
function makeGolem() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), stone = new THREE.MeshLambertMaterial({ color: '#7d8590' }), dk = new THREE.MeshLambertMaterial({ color: '#5a6170' });
  const lL = pivot(body, -0.55, 1.6, 0), lR = pivot(body, 0.55, 1.6, 0); box(0.8, 1.6, 0.8, 0, 0, -0.8, 0, lL, dk); box(0.8, 1.6, 0.8, 0, 0, -0.8, 0, lR, dk);
  box(2.2, 2.2, 1.4, 0, 0, 2.7, 0, body, stone); box(2.24, 0.25, 1.44, '#ffd400', 0, 2.0, 0, body);
  const aL = pivot(body, -1.35, 3.5, 0), aR = pivot(body, 1.35, 3.5, 0); box(0.6, 2.3, 0.6, 0, 0, -1.05, 0, aL, stone); box(0.6, 2.3, 0.6, 0, 0, -1.05, 0, aR, stone);
  const clip = pivot(aL, 0, -2.2, 0.35); box(0.7, 0.9, 0.06, '#c9a46a', 0, 0, 0, clip); box(0.6, 0.6, 0.02, '#ffffff', 0, -0.05, 0.04, clip);
  const hd = pivot(body, 0, 3.8, 0); box(1.3, 1.1, 1.1, 0, 0, 0.55, 0, hd, stone); box(1.4, 0.3, 1.2, '#4a505c', 0, 1.15, 0, hd);
  const eye = new THREE.MeshBasicMaterial({ color: '#ff9a2a' }); box(0.28, 0.14, 0.05, 0, -0.3, 0.7, 0.56, hd, eye); box(0.28, 0.14, 0.05, 0, 0.3, 0.7, 0.56, hd, eye);
  box(0.5, 0.12, 0.06, '#2a2a33', -0.3, 0.88, 0.57, hd).rotation.z = -0.3; box(0.5, 0.12, 0.06, '#2a2a33', 0.3, 0.88, 0.57, hd).rotation.z = 0.3;
  box(1.0, 0.7, 0.3, '#3c9a32', 0, 0.05, 0.6, hd); box(0.6, 0.4, 0.3, '#2f7a28', 0, -0.4, 0.6, hd);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, lL, lR, aL, aR, hd };
}
function poseGolem(g, t, p, yaw, o = {}) {
  const w = o.walk ? Math.sin(t * 5) * 0.4 : 0; g.root.position.set(p[0], p[1] + (o.walk ? Math.abs(Math.cos(t * 5)) * 0.1 : 0), p[2]); g.root.rotation.set(0, yaw, 0);
  g.lL.rotation.x = w; g.lR.rotation.x = -w; g.aL.rotation.set(-w * 0.6 - 0.3, 0, 0); g.aR.rotation.set(w * 0.6, 0, 0); g.body.rotation.set(o.lean || 0, 0, o.tilt || 0);
  if (o.point) g.aR.rotation.set(-2.4 + Math.sin(t * 9) * 0.2, 0, 0); if (o.wave) g.aR.rotation.set(-2.8, 0, Math.sin(t * 10) * 0.5);
  g.hd.rotation.set(0, Math.sin(t * 0.8) * 0.2, 0);
}
// --- new NPC: Crumbs, the goose pawnbroker
function makeGoose() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  for (const x of [-0.18, 0.18]) box(0.08, 0.5, 0.08, '#ff9a2a', x, 0.25, 0, body);
  box(0.8, 0.7, 1.1, '#f4f4f4', 0, 0.85, -0.1, body); box(0.5, 0.3, 0.5, '#dcdcdc', 0, 0.95, -0.7, body);
  const neck = pivot(body, 0, 1.1, 0.35); box(0.28, 1.0, 0.28, '#f4f4f4', 0, 0.5, 0, neck);
  const hd = pivot(neck, 0, 1.0, 0); box(0.45, 0.42, 0.55, '#f4f4f4', 0, 0.15, 0.05, hd); box(0.22, 0.14, 0.34, '#ff9a2a', 0, 0.08, 0.45, hd);
  box(0.06, 0.08, 0.04, '#111', -0.16, 0.24, 0.28, hd); box(0.06, 0.08, 0.04, '#111', 0.16, 0.24, 0.28, hd);
  box(0.16, 0.16, 0.02, '#ffd23f', 0.16, 0.24, 0.31, hd); box(0.02, 0.3, 0.02, '#ffd23f', 0.24, 0.08, 0.31, hd);
  box(0.36, 0.06, 0.36, '#1a1a2a', 0, 0.38, 0, hd); box(0.24, 0.26, 0.24, '#1a1a2a', 0, 0.54, 0, hd);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, neck, hd };
}
const golem = makeGolem(), goose = makeGoose();
const taxiSign = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.06), new THREE.MeshBasicMaterial({ map: labelTex('TAXI', '#ffd400', '#111', 42) })); taxiSign.position.set(0, 0.85, 0.3); L6.body.add(taxiSign);
const crownProp = makeCrown(); crownProp.scale.setScalar(1.2);
const mailBird = makeBird('#5aa8ff');
const debt = t => { if (t < E.pile + 2) return null; if (t < E.pay) return 2048; if (t < E.tear) return 807; if (t < E.bill2) return 0; return 1; };
const cash = t => t < E.sale ? 0 : t < E.sell ? 40 : t < E.fare ? 340 : t < E.mimeEnd ? 1240 : t < E.pay ? 1241 : 0;

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
const viewers = t => t < E.viral + 1 ? 2400000 : 10000000, rViewers = t => t < E.viral + 1 ? 5100000 : 10000000;
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

  const Q = [[70.6, 'Prepare to be AMAZED.'], [76.0, 'No hair? No problem.'], [82.0, 'Behold... THE HAIR.']];
  for (const [s0, txt] of Q) if (win(T, s0, s0 + 3.4)) { const b = ss(seg(T, s0, s0 + 0.2)) * (1 - ss(seg(T, s0 + 3.0, s0 + 3.4))); ctx.globalAlpha = k * b; ctx.font = F(17); const tw = ctx.measureText(txt).width;
    rrect(x + w / 2 - tw / 2 - 12, y + h + 10, tw + 24, 34, 12); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5cf0'; ctx.stroke(); outlined(txt, x + w / 2, y + h + 28, 17, '#7a3cff', '#fff', 2); }
  ctx.restore();
}

// ================================================================ EPISODE 10: "SPACE?!" — launch beach → orbit (cabin + rocket) → the Shard Moon → crash-landing at sunset
TX.moonrock = ctex(16, (g, r, n) => { noisy(['#9a96a8', '#8c889a', '#a8a4b6', '#7e7a8c'])(g, r, n); g.fillStyle = '#6a6678'; for (let i = 0; i < 4; i++) { const x = Math.floor(r() * 12), y = Math.floor(r() * 12); g.fillRect(x, y, 3, 1); g.fillRect(x, y + 2, 3, 1); g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y, 1, 3); } }, 101);
MAT.moonrock = lam(TX.moonrock);
function planetTex(cols, seed) { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'), r = rng(seed); g.fillStyle = cols[0]; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 70; i++) { g.fillStyle = cols[1 + (i % (cols.length - 1))]; const x = r() * 256, y = 10 + r() * 108, w = 8 + r() * 40, h = 4 + r() * 18; g.fillRect(x, y, w, h); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const earthMat = new THREE.MeshLambertMaterial({ map: planetTex(['#2f6fd8', '#3cc26a', '#3cc26a', '#ffffff', '#e8d28a'], 102), emissive: '#1a3a80', emissiveIntensity: 0.35 });
const moonMat = new THREE.MeshBasicMaterial({ map: planetTex(['#ff9ad8', '#e07ac0', '#ffc0ea', '#c868b0'], 103) });
// --- the Bloop-1 rocket (origin at the bottom centre)
const rocketG = new THREE.Group(), rv = new VSet(rocketG, true); { const cells = [];
  for (let y = 0; y <= 9; y++) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) cells.push([x, y, z, y === 7 && x === 0 && z === 1 ? 'glass' : (y % 4 === 1 ? 'jam' : 'quartz')]);
  for (const [x, z] of [[0, -1], [0, 0], [0, 1], [-1, 0], [1, 0]]) cells.push([x, 10, z, 'quartz']); cells.push([0, 11, 0, 'quartz'], [0, 12, 0, 'jam']);
  for (const [x, z] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) for (let y = 0; y <= 2; y++) if (!(y === 2 && false)) cells.push([x, y, z, 'jam']);
  cells.sort((a, b) => a[1] - b[1]).forEach((c, i) => rv.add(c[0], c[1], c[2], c[3], { t0: E.build + 0.6 + i * (E.buildEnd - E.build - 1.6) / cells.length })); rv.build(); }
box(1.8, 0.6, 1.8, '#3a3a44', 0, -0.75, 0, rocketG);
const flameG = pivot(rocketG, 0, -1.1, 0); box(1.2, 2.4, 1.2, 0, 0, -1.2, 0, flameG, basic('#ff6a1a', { transparent: true, opacity: 0.85 })); box(0.7, 1.8, 0.7, 0, 0, -0.9, 0, flameG, basic('#ffe27a'));
const rocketLight = new THREE.PointLight('#ff9a3a', 0, 30, 1.2); rocketLight.position.set(0, -2, 0); rocketG.add(rocketLight);
// --- helmets, flags, the Puffling, Moonsquish
const helmMat = new THREE.MeshLambertMaterial({ color: '#cfefff', transparent: true, opacity: 0.28, depthWrite: false });
const helmH = box(0.95, 0.95, 0.95, 0, 0, 0.34, 0, hero.hd, helmMat), helmR = box(0.95, 0.95, 0.95, 0, 0, 0.34, 0, rival.hd, helmMat), helmB = box(1.15, 1.0, 1.15, 0, 0, 0.32, 0, bloop6.B.hd, helmMat);
const helmHand = box(0.95, 0.95, 0.95, 0, 0, -0.9, 0.3, rival.aR, helmMat);
const mkFlag = (txt, col) => { const f = new THREE.Group(); box(0.1, 3.2, 0.1, '#dddddd', 0, 1.6, 0, f); const c = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.04), new THREE.MeshBasicMaterial({ map: labelTex(txt, col, '#ffffff', 22) })); c.position.set(0.95, 2.7, 0); f.add(c); f.userData.cloth = c; return f; };
const flagS = mkFlag('SHARDWILD', '#ff8a2a'), flagG = mkFlag('GLOWUP', '#ff5cf0');
const puffling = makeMagmite(); puffling.root.scale.setScalar(0.55);
function makeSquish(seed) {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), mat = new THREE.MeshLambertMaterial({ color: '#8aa0c8', transparent: true, opacity: 0.88, emissive: '#405070', emissiveIntensity: 0.3 });
  box(0.9, 0.8, 0.9, 0, 0, 0.4, 0, body, mat); box(0.42, 0.42, 0.04, '#ffffff', 0, 0.48, 0.46, body); const pup = box(0.18, 0.2, 0.03, '#111', 0, 0.46, 0.49, body);
  const ant = pivot(body, 0, 0.8, 0); box(0.06, 0.5, 0.06, '#5a6a8a', 0, 0.25, 0, ant); const tip = box(0.18, 0.18, 0.18, 0, 0, 0.55, 0, ant, new THREE.MeshBasicMaterial({ color: '#ffe066' }));
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, mat, ant, tip, pup, seed };
}
const _sqA = new THREE.Color('#8aa0c8'), _sqB = new THREE.Color('#ff9ad8');
function poseSquish(s, t, p, yaw, o = {}) {
  const hop = o.hop ? Math.abs(Math.sin(t * (o.fast ? 9 : 5) + s.seed)) * (o.big || 0.5) : 0; s.root.position.set(p[0] + (o.shiver ? Math.sin(t * 60 + s.seed) * 0.04 : 0), p[1] + hop, p[2]); s.root.rotation.set(0, yaw, 0);
  s.body.rotation.x = o.bow ? 0.5 + Math.sin(t * 3 + s.seed) * 0.15 : 0; const sq = 1 + Math.sin(t * 6 + s.seed) * 0.06; s.body.scale.set(1 / sq, sq, 1 / sq);
  s.mat.color.copy(_sqA).lerp(_sqB, o.warm || 0); s.ant.rotation.z = Math.sin(t * 4 + s.seed) * 0.3; s.tip.material.color.set(o.warm > 0.5 ? '#ffe066' : '#bfe8ff');
}
const squishes = Array.from({ length: 12 }, (_, i) => makeSquish(i * 1.7));
const power = t => t < E.fuel ? 0 : t < E.liftoff ? 100 : t < E.moon ? lerp(100, 60, seg(t, E.liftoff, E.gauge)) : t < E.split ? 60 : t < E.launch2 ? 35 : t < E.home ? lerp(35, 4, seg(t, E.launch2, E.home)) : 0;
const lowG = (t, ph) => Math.abs(Math.sin(t * 1.6 + ph)) * 0.6;

// ================================================================ EPISODE 11: "THE HEIST" — dusk camp → night plaza → inside the Honk & Pawn (lasers) → rooftop chase → fountain
// --- new NPC: Bonk-bot, the goose's security robot (one wheel, red visor, flashlight cone)
function makeBot() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0), grey = new THREE.MeshLambertMaterial({ color: '#8a93a8' });
  const wheel = pivot(body, 0, 0.4, 0); box(0.3, 0.8, 0.8, '#2a2a33', 0, 0, 0, wheel);
  box(1.0, 1.3, 0.8, 0, 0, 1.4, 0, body, grey); box(1.04, 0.16, 0.84, '#ffd400', 0, 0.9, 0, body);
  const hd = pivot(body, 0, 2.1, 0); box(0.8, 0.6, 0.7, 0, 0, 0.3, 0, hd, grey); const visor = box(0.66, 0.16, 0.05, 0, 0, 0.36, 0.36, hd, new THREE.MeshBasicMaterial({ color: '#ff2a3a' }));
  box(0.05, 0.4, 0.05, '#555', 0.25, 0.8, 0, hd); const bulb = box(0.14, 0.14, 0.14, 0, 0.25, 1.05, 0, hd, new THREE.MeshBasicMaterial({ color: '#ff2a3a' }));
  const aL = pivot(body, -0.62, 1.8, 0), aR = pivot(body, 0.62, 1.8, 0); box(0.2, 0.9, 0.2, 0, 0, -0.45, 0, aL, grey); box(0.2, 0.9, 0.2, 0, 0, -0.45, 0, aR, grey);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff4a0', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
  cone.rotation.x = -Math.PI / 2; cone.position.set(0, 0.2, 3.3); hd.add(cone);
  const torch = new THREE.SpotLight('#fff4c0', 30, 14, 0.45, 0.5, 1.2); torch.position.set(0, 0.3, 0.4); hd.add(torch); const tgt = new THREE.Object3D(); tgt.position.set(0, -0.6, 4); hd.add(tgt); torch.target = tgt;
  root.traverse(o => { if (o.isMesh && o !== cone) o.castShadow = true; });
  return { root, body, wheel, hd, aL, aR, cone, torch, bulb, visor };
}
function poseBot(b, t, p, yaw, o = {}) {
  b.root.position.set(p[0], p[1], p[2]); b.root.rotation.set(0, yaw + (o.spin || 0), 0); b.wheel.rotation.x = t * 6 * (o.roll ?? 1);
  b.hd.rotation.set(o.look || 0, Math.sin(t * 1.4) * 0.5 * (o.scan ? 1 : 0.2), 0); b.body.rotation.z = o.tilt || 0;
  b.aL.rotation.set(o.alarm ? -2.6 + Math.sin(t * 20) * 0.4 : 0, 0, 0); b.aR.rotation.set(o.alarm ? -2.6 + Math.cos(t * 20) * 0.4 : (o.dance ? -2.4 + Math.sin(t * 8) * 0.5 : 0), 0, 0);
  b.bulb.material.color.set(o.alarm && Math.floor(t * 6) % 2 ? '#ffffff' : '#ff2a3a'); b.cone.visible = !o.off; b.torch.intensity = o.off ? 0 : 30;
}
const bot = makeBot(), crowns = Array.from({ length: 20 }, () => { const c = makeCrown(); c.scale.setScalar(1.1); return c; });
const marbles = Array.from({ length: 14 }, (_, i) => box(0.18, 0.18, 0.18, ['#5aa8ff', '#ffffff', '#ff6fb8'][i % 3], 0, 0, 0, new THREE.Group()));
const receipt = box(0.5, 0.6, 0.03, '#ffffff', 0, 0, 0, new THREE.Group());
const stealth = t => t < E.bot ? 0.05 : t < E.hide ? lerp(0.1, 0.75, seg(t, E.bot, E.hide)) : t < E.prestin ? lerp(0.75, 0.2, seg(t, E.hide, E.prestin)) : t < E.lasers ? 0.15 : t < E.pots ? (t > E.limbo ? 0.55 : 0.35) : t < E.pots + 4 ? 0.85 : t < E.touch ? 0.3 : t < E.splash ? 1 : 0;

// ================================================================ EPISODE 12: "THE BIRTHDAY" — camp (party prep) ⇄ forest trail (distraction walk) → sunset party → cake rocket
// --- new NPC: Muffin, a walking cupcake (frosting expert, sneezes sprinkles)
function makeMuffin() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.8, 0.6, 0.8, '#c98f4c', 0, 0.3, 0, body); for (let i = 0; i < 4; i++) { const r = box(0.06, 0.6, 0.82, '#a8743c', -0.3 + i * 0.2, 0.3, 0, body); }
  const top = pivot(body, 0, 0.6, 0); box(0.95, 0.4, 0.95, '#ff9ad8', 0, 0.2, 0, top); box(0.6, 0.25, 0.6, '#ffb8e4', 0, 0.5, 0, top); box(0.22, 0.22, 0.22, '#e8344e', 0, 0.74, 0, top);
  for (let i = 0; i < 8; i++) box(0.08, 0.04, 0.16, ['#5ff7ff', '#ffe066', '#7cff6b'][i % 3], Math.cos(i) * 0.35, 0.42, Math.sin(i * 1.7) * 0.35, top);
  for (const x of [-0.18, 0.18]) { box(0.16, 0.18, 0.03, '#ffffff', x, 0.38, 0.41, body); box(0.08, 0.1, 0.02, '#111', x, 0.36, 0.43, body); }
  box(0.14, 0.05, 0.02, '#5a2a10', 0, 0.2, 0.41, body);
  const aL = pivot(body, -0.45, 0.35, 0), aR = pivot(body, 0.45, 0.35, 0); box(0.1, 0.35, 0.1, '#c98f4c', 0, -0.15, 0, aL); box(0.1, 0.35, 0.1, '#c98f4c', 0, -0.15, 0, aR);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, top, aL, aR };
}
function poseMuffin(m, t, p, yaw, o = {}) { m.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 8)) * 0.4 : 0), p[2]); m.root.rotation.set(0, yaw, 0); const sq = 1 + Math.sin(t * 6) * 0.05; m.body.scale.set(1 / sq, sq, 1 / sq);
  m.aL.rotation.set(o.work ? -2.2 + Math.sin(t * 14) * 0.5 : 0, 0, -0.3); m.aR.rotation.set(o.work ? -2.2 + Math.cos(t * 14) * 0.5 : 0, 0, 0.3); m.top.rotation.z = o.sneeze ? Math.sin(t * 30) * 0.2 : 0; }
const muffin = makeMuffin();
// gifts from Leggy
const flowerRing = new THREE.Group(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; box(0.14, 0.14, 0.14, i % 2 ? '#ff6fb8' : '#ffe066', Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38, flowerRing); } hero.hd.add(flowerRing); flowerRing.position.set(0, 0.7, 0);
const necklace = box(0.24, 0.24, 0.08, 0, 0, 0.62, 0.42, bloop6.B.body, MAT.shard); const feather = box(0.06, 0.5, 0.16, '#ffffff', 0.15, 0.95, 0, rival.hd); feather.rotation.z = -0.4;
const suspicion = t => t < E.walk ? lerp(0.1, 0.4, seg(t, 0, E.walk)) : t < E.trail1 ? 0.45 : t < E.trail2 ? 0.55 : t < E.leggyBack ? lerp(0.6, 0.95, seg(t, E.trail2, E.leggyBack)) : 1;

// ================================================================ EPISODE 20: "THE TIME MACHINE (IT WORKS)" — the wrecked yard (Time Machine 2.0, a duck) → Day 1 (past me, Tock the clockwork owl, the first collapse was US) → the yard again (the house stands) → three of me
const lerpK = (K, t) => { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) if (t < K[i + 1][0]) return lerp(K[i][1], K[i + 1][1], (t - K[i][0]) / (K[i + 1][0] - K[i][0])); return K[K.length - 1][1]; };
function hideMisc() { [rod, board, blue, card, bBrick, coins, shades, bow, taxiSign, helmH, helmR, helmB, helmHand, drill, flowerRing, necklace, feather].forEach(m => m.visible = false); crownM.visible = true; golem.root.visible = mailBird.root.visible = crownProp.visible = false;
  rival.wig.visible = false; rival.shine.visible = true; sled.visible = false; judge.root.visible = false; seals.forEach(s => s.root.visible = false); }
const faceTo = (p, q) => Math.atan2(q[0] - p[0], q[2] - p[2]), PI = Math.PI;
const L3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
// --- past me (green hoodie, propeller beanie) and future-future me (red hoodie, top hat)
function recolor(h, from, to) { h.root.traverse(o => { if (o.isMesh && !Array.isArray(o.material) && o.material.color && o.material.color.getHexString() === from) o.material = new THREE.MeshLambertMaterial({ color: to }); }); }
const twin = makeHero(); recolor(twin, 'ff8a2a', '#3cc26a'); recolor(twin, 'ffb36b', '#9dff8a');
box(0.72, 0.2, 0.72, '#2e8a4a', 0, 0.72, 0, twin.hd); box(0.08, 0.2, 0.08, '#ffe066', 0, 0.9, 0, twin.hd); const prop = pivot(twin.hd, 0, 1.0, 0); box(0.9, 0.04, 0.12, '#ff3d7f', 0, 0, 0, prop);
const third = makeHero(); recolor(third, 'ff8a2a', '#e8344e'); recolor(third, 'ffb36b', '#ff9a9a');
box(0.84, 0.06, 0.84, '#111', 0, 0.72, 0, third.hd); box(0.52, 0.6, 0.52, '#111', 0, 1.04, 0, third.hd); box(0.54, 0.1, 0.54, '#e8344e', 0, 0.82, 0, third.hd); box(0.3, 0.08, 0.04, '#ffffff', 0.1, 0.4, 0.33, third.hd);
// --- Tock: a clockwork owl that follows time travellers and ticks louder near a paradox
function makeTock() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), brass = '#d9a63a';
  box(0.8, 0.8, 0.6, brass, 0, 0, 0, body); box(0.58, 0.58, 0.04, '#fff8e0', 0, -0.04, 0.31, body); for (const x of [-0.3, 0.3]) box(0.14, 0.24, 0.14, brass, x, 0.5, 0, body);
  const hh = pivot(body, 0, -0.04, 0.34), mh = pivot(body, 0, -0.04, 0.345); box(0.05, 0.18, 0.02, '#222', 0, 0.09, 0, hh); box(0.035, 0.26, 0.02, '#222', 0, 0.13, 0, mh);
  const eyeM = new THREE.MeshBasicMaterial({ color: '#5ff7ff' }); for (const x of [-0.17, 0.17]) box(0.16, 0.1, 0.05, 0, x, 0.32, 0.31, body, eyeM); box(0.1, 0.12, 0.08, '#ff8a2a', 0, 0.18, 0.34, body);
  const wL = pivot(body, -0.42, 0.2, 0), wR = pivot(body, 0.42, 0.2, 0); box(0.08, 0.6, 0.44, '#b07f20', -0.04, -0.24, 0, wL); box(0.08, 0.6, 0.44, '#b07f20', 0.04, -0.24, 0, wR);
  const key = pivot(body, 0, 0.05, -0.32); box(0.06, 0.06, 0.2, '#c0c0c8', 0, 0, -0.1, key); box(0.34, 0.22, 0.04, '#c0c0c8', 0, 0, -0.22, key);
  for (const x of [-0.18, 0.18]) box(0.14, 0.1, 0.22, '#ff8a2a', x, -0.45, 0.06, body);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hh, mh, wL, wR, key, eyeM }; }
function poseTock(k, t, p, yaw, o = {}) { k.root.position.set(p[0], p[1] + (o.fly ? Math.sin(t * 4) * 0.15 : 0), p[2]); k.root.rotation.set(0, yaw + (o.spin ? t * 14 : 0), 0);
  const f = o.fast ? 30 : 1; k.hh.rotation.z = -t * 0.5 * f; k.mh.rotation.z = -t * 6 * f; k.key.rotation.z = t * 3 * f;
  const fl = o.fly ? Math.sin(t * 22) * 0.9 : 0.1; k.wL.rotation.z = -fl; k.wR.rotation.z = fl; k.body.rotation.z = o.fast ? Math.sin(t * 40) * 0.2 : Math.sin(t * 2) * 0.05; k.eyeM.color.set(o.alarm ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : '#5ff7ff'); }
const tock = makeTock();
// --- props: the duck(s), Bloop's fish, the blueprint, Time Machine 2.0
function makeDuck() { const g = new THREE.Group(), y = new THREE.MeshLambertMaterial({ color: '#ffd23f' }); box(0.36, 0.26, 0.46, 0, 0, 0.13, 0, g, y); box(0.26, 0.24, 0.24, 0, 0, 0.36, 0.14, g, y); box(0.16, 0.06, 0.14, '#ff8a2a', 0, 0.32, 0.31, g); for (const x of [-0.09, 0.09]) box(0.04, 0.05, 0.02, '#111', x, 0.42, 0.27, g); return g; }
const duckA = makeDuck(), duckB = makeDuck(), duckC = makeDuck(), duckD = makeDuck(), rain = Array.from({ length: 36 }, makeDuck);
const fish = new THREE.Group(); box(0.24, 0.3, 0.6, '#ff9a2a', 0, 0, 0, fish); box(0.06, 0.34, 0.24, '#ff9a2a', 0, 0, -0.38, fish); box(0.05, 0.06, 0.06, '#111', 0.13, 0.06, 0.2, fish);
const blueprint = box(1.0, 0.75, 0.02, '#3d7bff', 0, 0, 0, new THREE.Group()); box(0.7, 0.04, 0.03, '#ffffff', 0, 0.12, 0, blueprint); box(0.04, 0.4, 0.03, '#ffffff', -0.2, -0.05, 0, blueprint); box(0.25, 0.04, 0.03, '#e8344e', 0.18, -0.18, 0, blueprint);
hero.aL.add(blueprint.parent); blueprint.parent.position.set(0.3, -0.7, 0.45); blueprint.parent.rotation.set(-1.0, 0, 0);
function dialTex(txt) { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#081018'; x.fillRect(0, 0, 256, 64); x.fillStyle = '#5ff7ff'; x.font = 'bold 34px "DejaVu Sans Mono", monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 128, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const booth = new THREE.Group(), boothBody = pivot(booth, 0, 0, 0), boothM = new THREE.MeshLambertMaterial({ color: '#2f6fd8' });
box(2.4, 3.4, 2.4, 0, 0, 1.7, 0, boothBody, boothM); box(2.5, 0.3, 2.5, '#1b2a6a', 0, 3.5, 0, boothBody); box(1.6, 1.4, 0.06, 0, 0, 2.3, 1.21, boothBody, new THREE.MeshLambertMaterial({ color: '#cfefff', emissive: '#5ff7ff', emissiveIntensity: 0.4 }));
box(2.46, 0.2, 2.46, '#ffd23f', 0, 0.9, 0, boothBody); box(0.6, 0.5, 0.06, '#ffd23f', -0.9, 3.0, 1.22, boothBody); for (let i = 0; i < 3; i++) box(0.12, 0.12, 0.06, ['#ff3d7f', '#ffe066', '#7cff6b'][i], -0.8 + i * 0.3, 1.3, 1.22, boothBody);
const DIALS = ['DAY 20', '-10 SEC', 'DAY 1', '???'], dialM = DIALS.map(y => new THREE.MeshBasicMaterial({ map: dialTex(y) })); const dial = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.36, 0.06), dialM[0]); dial.position.set(0.3, 3.1, 1.22); boothBody.add(dial);
const lever = pivot(boothBody, 1.25, 1.4, 0.6); box(0.1, 0.9, 0.1, '#c0c0c8', 0, 0.45, 0, lever); box(0.24, 0.24, 0.24, '#e8344e', 0, 0.92, 0, lever);
const crystalM = new THREE.MeshLambertMaterial({ color: '#5ff7ff', emissive: '#2fa8c0', emissiveIntensity: 0.8 }); box(0.5, 0.6, 0.5, 0, 0, 3.95, 0, boothBody, crystalM);
const boothLight = new THREE.PointLight('#5ff7ff', 0, 12, 1.4); boothLight.position.set(0, 4.6, 0.8); booth.add(boothLight);
const tarp = new THREE.Group(); box(2.9, 4.2, 2.9, '#7a8090', 0, 2.1, 0, tarp); box(3.0, 0.12, 3.0, '#c08a40', 0, 2.6, 0, tarp);
// --- house layouts: the good house (shared by Day 1's build and the present), the first hut, the wreck
function houseCells() { const c = [];
  for (let x = -4; x <= 4; x++) for (let z = -12; z <= -6; z++) c.push([x, 1, z, 'castle']);
  for (let x = -2; x <= 2; x++) for (let z = -5; z <= -4; z++) c.push([x, 1, z, 'plank']);
  for (let y = 2; y <= 7; y++) for (let x = -4; x <= 4; x++) for (let z = -12; z <= -6; z++) {
    const edge = x === -4 || x === 4 || z === -12 || z === -6; if (!edge) { if (y === 5) c.push([x, y, z, 'plank']); continue; }
    if (z === -6 && x === 0 && y <= 3) continue;
    const corner = (x === -4 || x === 4) && (z === -12 || z === -6), win = (y === 3 || y === 6) && (((z === -6 || z === -12) && Math.abs(x) === 2) || ((x === -4 || x === 4) && z === -9));
    c.push([x, y, z, corner ? 'log' : y === 5 ? 'castle' : win ? 'glass' : 'plank']); }
  for (let k = 0; k < 4; k++) for (let x = -5 + k; x <= 5 - k; x++) for (let z = -13 + k; z <= -5 - k; z++) { if (k < 3 && x > -5 + k && x < 5 - k && z > -13 + k && z < -5 - k) continue; if (x === 3 && z === -11) continue; c.push([x, 8 + k, z, 'slate']); }
  for (let y = 8; y <= 11; y++) c.push([3, y, -11, 'castle']);
  return c; }
const HOUSE = houseCells();
function hutCells() { const c = []; for (let y = 1; y <= 3; y++) for (let x = -2; x <= 2; x++) for (let z = -10; z <= -7; z++) { if (!(x === -2 || x === 2 || z === -10 || z === -7)) continue; if (z === -7 && x === 0 && y <= 2) continue; c.push([x, y, z, 'plank']); }
  for (let x = -3; x <= 3; x++) for (let z = -11; z <= -6; z++) c.push([x, 4, z, 'plank']); return c; }
function tree20(st, x, z, h, sap) { for (let y = 1; y <= h; y++) st.add(x, y, z, 'log'); const R = sap ? 1 : 2; for (let dx = -R; dx <= R; dx++) for (let dy = 0; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) if (Math.hypot(dx, dy, dz) <= R + 0.3 && hash2(x + dx, z + dz + dy * 7, 9) > 0.12) st.add(x + dx, h + dy + (sap ? 0 : -1), z + dz, 'leaf'); }
function field(g, past) { const st = new VSet(g); for (let x = -40; x <= 40; x++) for (let z = -36; z <= 22; z++) st.add(x, 0, z, !past && x === 0 && z > -4 && z < 16 ? 'path' : 'turf');
  for (const [x, z, h] of [[-14, -14, 5], [-18, -2, 6], [14, -16, 5], [18, -4, 6], [-12, 10, 5], [16, 12, 6], [-26, -20, 7], [24, -24, 6]]) tree20(st, x, z, past ? Math.max(2, h - 3) : h, past);
  st.build(); return st; }
const flowerC = ['#ff6fb8', '#ffe066', '#5ff7ff', '#ff8a5a']; function flowers(g) { const f = new THREE.Group(); g.add(f); for (let i = 0; i < 14; i++) { const x = -4.4 + (i % 7) * 1.45 + (i > 6 ? 0.7 : 0), z = i > 6 ? -3.2 : -2.6; if (Math.abs(x) < 1.2) continue; box(0.06, 0.4, 0.06, '#3cc26a', x, 0.7, z, f); box(0.24, 0.2, 0.24, flowerC[i % 4], x, 0.98, z, f); } return f; }
// HUD helper: the paradox meter
const paradoxAt = t => t < E.arrive ? null : t < E.meet ? 0.05 : t < E.collapse ? lerp(0.15, 0.45, seg(t, E.meet, E.collapse)) : t < E.teamUp ? 0.6 : t < E.highfive ? lerp(0.6, 0.92, seg(t, E.teamUp, E.highfive)) : t < E.glitchEnd ? 1 : t < E.home ? 0.12 : t < E.twinOut ? null : t < E.third ? 0.5 : t < E.duckRain ? 0.85 : 1;
function drawWarp(T) { for (const s of [E.warp, E.warpBack]) { if (!win(T, s, s + 5)) continue; const k = seg(T, s, s + 5), a = Math.sin(k * Math.PI);
  ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.6); ctx.fillStyle = '#05020f'; ctx.fillRect(0, 0, W, H); ctx.translate(W / 2, H / 2);
  for (let i = 0; i < 18; i++) { const r = ((i * 60 + T * 600) % 1100), c = ['#5ff7ff', '#ff5cf0', '#ffe066', '#7cff6b'][i % 4]; ctx.save(); ctx.rotate(-T * 2 - i * 0.4); ctx.strokeStyle = c; ctx.lineWidth = 6 + r / 60; ctx.strokeRect(-r / 2, -r / 2.8, r, r / 1.4); ctx.restore(); }
  outlined(s === E.warp ? '← DAY 1' : '→ DAY 20', 0, 0, 64, '#ffffff', '#000', 10); ctx.restore(); } }
function drawGlitch(T) { if (!win(T, E.glitch, E.glitchEnd)) return; const r = rng(Math.floor(T * 12)); ctx.save();
  for (let i = 0; i < 9; i++) { const y = r() * H, h = 16 + r() * 60, dx = (r() - 0.5) * 120; ctx.drawImage(out, 0, y, W, h, dx, y, W, h); }
  ctx.fillStyle = `rgba(${r() < 0.5 ? '255,0,200' : '0,255,230'},${0.08 + r() * 0.1})`; ctx.fillRect(0, 0, W, H);
  if (Math.floor(T * 4) % 2) outlined('◀◀ REWIND?!', W / 2, H * 0.2, 44, '#ff5cf0', '#000', 8); ctx.restore(); }

// ---------------------------------------------------------------- set A: the yard (present day: the wreck, then the fixed house)
const yard = (() => {
  const g = mk('yard'); field(g, false);
  const wreckG = new THREE.Group(); g.add(wreckG); { const st = new VSet(wreckG);
    for (const [x, y, z] of hutCells().map(([x, y, z]) => [x * 1.6 | 0, y, z]).concat(HOUSE.filter(c => c[1] <= 3 && c[3] !== 'castle'))) { if (hash2(x, y * 13 + z, 4) < 0.3) continue; st.add(x, y, z, hash2(x, z, y) < 0.15 ? 'dark' : 'plank'); }
    for (let x = -5; x <= 5; x++) for (let z = -13; z <= -5; z++) if (hash2(x, z, 8) > 0.2) st.add(x, 4, z, 'slate');
    st.build(); wreckG.rotation.set(0.07, 0.1, 0.17); wreckG.position.set(0.6, -0.9, 0);
    const pud = new THREE.Mesh(GEO, MAT.water); pud.scale.set(7, 0.2, 3); pud.position.set(-4, 0.52, -3); g.add(pud); wreckG.userData.pud = pud; }
  const newG = new THREE.Group(); g.add(newG); { const st = new VSet(newG); HOUSE.forEach(c => st.add(...c)); st.build(); flowers(newG);
    const flag = pivot(newG, 3, 12.4, -11); box(0.08, 1.6, 0.08, '#c0c0c8', 0, 0.8, 0, flag); box(0.9, 0.5, 0.04, '#ff8a2a', 0.45, 1.3, 0, flag); box(0.4, 0.2, 0.05, '#3cc26a', 0.5, 1.3, 0, flag); }
  parentTo(booth, g); parentTo(tarp, g); [duckA, duckB, duckC, duckD, fish, ...rain].forEach(d => parentTo(d, g));
  burst(E.unveil, [7, 3, -2], { n: 60, colors: ['#ffe066', '#5ff7ff', '#ffffff'], speed: 6, size: 0.15, life: 1.2, grav: 6, up: 4 });
  burst(E.duckArrive, [7, 1.4, -0.6], { n: 40, colors: ['#5ff7ff', '#ff5cf0'], speed: 4, size: 0.12, life: 0.8, grav: 2, up: 2 }); burst(E.duckSend, [7, 2, -1.4], { n: 70, colors: ['#5ff7ff', '#ff5cf0', '#ffffff'], speed: 6, size: 0.14, life: 1, grav: 1, up: 3 });
  for (const t0 of [E.home - 0.2, E.twinOut, E.third]) burst(t0, [7, 1.4, -0.6], { n: 70, colors: ['#5ff7ff', '#ff5cf0', '#ffe066'], speed: 5, size: 0.14, life: 1, grav: 2, up: 3 });
  for (let t = E.bloopPaid + 0.5; t < E.calm; t += 0.6) burst(t, [4.9, 1.5, 0.6], { n: 6, colors: ['#9fdc5a', '#6aa83a'], speed: 0.8, size: 0.18, life: 1.4, grav: -1.5, up: 0.5 });
  burst(E.reveal2 + 0.2, [0, 9, -9], { n: 120, colors: ['#ffe066', '#ff6fb8', '#5ff7ff', '#7cff6b'], speed: 7, size: 0.16, life: 2, grav: 4, up: 6 });
  const RD = rain.map((_, i) => { const r = rng(2000 + i); return [-3 + r() * 12, -7 + r() * 11, E.duckRain + r() * 8, r() * 6]; });
  const C = [[0, 14, 9, 22, 0, 3, -6, 50], [4.9, 9, 7, 17, 0, 2.5, -8, 48], [5, -11, 3.4, 6, -1, 2.5, -9, 50], [12.1, 5, 2.8, 5, -1, 2, -9, 46], [12.2, -1, 1.2, -1.5, 0, 3.4, -9, 56], [19.5, 1.6, 1.0, -1.0, 0, 3.6, -9, 52],
    [19.6, 2.4, 2.6, 6, 6.6, 2, -2, 50], [23.3, 3.6, 2.4, 4.6, 7, 2, -2, 46], [23.4, 12, 3, 6, 7, 2.2, -2, 50], [28.3, 11, 2.6, 4, 7, 2.2, -2, 46], [28.4, 5.8, 2.0, 3.6, 7.6, 1.5, 0.4, 40], [33.3, 5.6, 1.9, 3.2, 7.6, 1.5, 0.4, 36],
    [33.4, 2.6, 2.8, 4.4, 6.6, 1.4, -1.2, 48], [40.1, 3.6, 2.6, 3.6, 6.8, 1.4, -1.2, 44], [40.2, 10, 1.3, 3.6, 5, 1.6, -0.5, 50], [44.5, 9.4, 1.5, 4.6, 5, 1.6, -0.5, 48], [44.6, 3, 1.8, 5, 5.2, 1.4, 1.4, 44], [48.5, 3.6, 1.8, 5.4, 5.2, 1.4, 1.4, 42],
    [48.6, -3, 2.6, 7, 2, 2.4, -4, 50], [54.3, -1, 2.4, 7.4, 2, 2.4, -4, 48], [54.4, 13, 4, 6, 7, 2, -2, 52], [60.4, 11, 3, 2.6, 7, 2.4, -2, 42], [E.arrive, 10, 3, 1.4, 7, 2.6, -2, 38],
    [E.home, 12, 3, 5, 6, 1.6, -1, 48], [196.9, 10, 2.6, 4, 5, 1.6, -1, 44], [197, 2.6, 2.1, -2.0, 4, 1.9, 1.4, 40], [201.1, 2.8, 2.0, -1.4, 4, 1.9, 1.4, 36],
    [201.2, 2, 1.4, 4, 0, 4.4, -9, 58], [203.9, 6, 4, 10, 0, 4.4, -9, 54], [204, 16, 10, 16, 0, 4, -9, 50], [206.9, -2, 11, 20, 0, 4, -9, 50], [207, -10, 3, 3, -1, 3, -9, 50], [212.3, 7, 3, 2, -1, 3, -9, 50],
    [212.4, 3.4, 2.1, 3.4, 4.6, 1.6, 0.2, 40], [218.5, 2.6, 2.1, 3.0, 4.6, 1.6, 0.2, 38], [218.6, -2, 2.4, 6, 3, 1.6, -1, 48], [222.3, 0, 2.4, 5.4, 5, 1.6, -1, 46],
    [222.4, 10.6, 2.2, 4.4, 7, 1.8, -0.4, 44], [228.3, 9.6, 2.2, 3.4, 6.4, 1.8, -0.4, 40], [228.4, 2.6, 2.2, 3.2, 6.6, 1.6, 0.4, 44], [233.3, 2.2, 2.4, 4.0, 6.6, 1.6, 0.4, 46],
    [233.4, 0, 3.4, 7, 0, 2.2, -5, 50], [246.3, 0, 2.6, 1.8, 0, 2.2, -5, 40], [246.4, -11, 5, 8, 0, 3, -7, 50], [252.5, -7, 4, 10, 0, 3, -7, 48], [252.6, 5.6, 1.4, 0, 3.4, 1.6, -3, 44], [256.5, 5.2, 1.6, 0.6, 3.4, 1.6, -3, 42],
    [256.6, 2, 2.4, 5, 7, 2, -2, 48], [261.3, 4.4, 2.4, 3, 7, 2, -2, 42], [261.4, 11, 1.4, 4, 7, 2.2, -0.6, 46], [269.5, 10, 1.8, 2.8, 7, 2.2, -0.6, 42], [269.6, 0, 3, 8, 4, 2, -2, 50], [274.3, 1, 3, 7, 4, 2, -2, 48],
    [274.4, 5.0, 1.6, -0.6, 3.4, 1.6, -3, 36], [276.1, 4.8, 1.6, -0.8, 3.4, 1.6, -3, 34], [276.2, 4, 2.6, 11, 3, 4.4, -3, 52], [285.6, 3, 2.4, 8.6, 3, 3, -3, 50], [E.logo, 3, 2.4, 8.6, 3, 3, -3, 50]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; const late = t > E.home, BP = [7, 0.5, -2], door = [7, 0.5, 0.2];
    wreckG.visible = wreckG.userData.pud.visible = !late; newG.visible = late;
    // Time Machine 2.0
    booth.position.set(...BP); booth.rotation.set(0, 0, 0); const hum = late ? win(t, E.whir, E.third + 1) : win(t, E.countdown, E.arrive);
    if (hum) booth.position.x += Math.sin(t * 60) * 0.04; lever.rotation.x = (win(t, E.duckSend - 0.3, E.duckSend + 1) || win(t, E.countdown + 1.6, E.arrive)) ? -1 : 0.4;
    dial.material = dialM[late ? (t > E.whir ? 3 : 0) : t > E.board ? 2 : t > E.test ? 1 : 0];
    boothLight.intensity = hum ? 30 + Math.sin(t * 30) * 20 : (win(t, E.duckArrive, E.duckArrive + 0.6) || win(t, E.duckSend, E.duckSend + 0.8) || win(t, E.twinOut, E.twinOut + 0.8) || win(t, E.home, E.home + 0.8)) ? 60 : 6;
    tarp.visible = !late && t < E.unveil + 1.5; tarp.position.set(BP[0], seg(t, E.unveil, E.unveil + 1.5) ** 2 * 18, BP[2]); tarp.rotation.set(0, seg(t, E.unveil, E.unveil + 1.5) * 3, seg(t, E.unveil, E.unveil + 1.5) * 0.8);
    [duckA, duckB, duckC, duckD, fish].forEach(d => { d.visible = false; parentTo(d, g); d.scale.setScalar(1); }); twin.root.visible = third.root.visible = tock.root.visible = false; rain.forEach(d => d.visible = false);
    let hp, hy, ho, bp, by, bo = {}, lp, ly, ls = 0.3, show = true;
    if (!late) {
      hp = [1.5, 0.5, 4]; hy = 0.4; ho = { face: 'smug', wave: t < 4 };
      if (t > E.tour) { const k = seg(t, E.tour, E.wreck); hp = L3([-7, 0.5, 2], [-1.6, 0.5, -0.6], k); hy = 2.4; ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'normal', headPitch: -0.2 }; }
      if (t > E.wreck) { hp = [3, 0.5, 0.4]; hy = -2.6; ho = { face: 'scared', headPitch: -0.3 }; }
      if (t > E.tarp) { hp = [4.2, 0.5, 1.4]; hy = faceTo(hp, BP); ho = { face: 'normal' }; } if (t > E.unveil) ho = { face: 'smug', wave: t < E.unveil + 3 }; if (t > E.invoice) ho = { face: 'scared', headPitch: 0.3 };
      if (t > E.test) { hp = [5.6, 0.5, 0.4]; hy = faceTo(hp, BP); ho = { face: 'smug', hold: true }; } if (t > E.duckArrive) ho = { face: 'scared', hold: t < E.duckSend - 1.2 };
      if (t > E.duckSend) ho = { face: 'scared', panic: t < E.itWorks }; if (t > E.itWorks) { hy = 0.6; ho = { face: 'smug', hips: true }; }
      if (t > E.plan) { hp = [2.4, 0.5, 0.6]; hy = -2.8; ho = { face: 'smug', wave: true }; }
      if (t > E.board) { const k = seg(t, E.board, E.countdown + 1); hp = L3([4.4, 0.5, 1.6], [7, 0.5, -1.2], k); hy = faceTo([4.4, 0, 1.6], BP); ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug' }; if (t > E.countdown + 1) show = false; }
      bp = [9, 0.5, 0.4]; by = -0.9; if (t > E.tarp) bo = { hop: t < E.unveil + 3, handOut: t > E.unveil }; if (t > E.invoice) { bo = { handOut: true }; card.visible = t < E.test; }
      if (t > E.test) { bp = [9.2, 0.5, 0.8]; bo = {}; } if (t > E.duckSend) bo = { hop: t < E.plan }; if (t > E.board) { const k = seg(t, E.board + 1, E.countdown + 1.4); bp = L3([9.2, 0.5, 0.8], [7.4, 0.5, -1.4], k); bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; }
      lp = [-8, 0.5, -0.4]; ly = 1.2; if (t > E.duckSend) { const k = seg(t, E.duckSend, E.itWorks - 0.4); lp = L3([-1, 0.5, 3.4], [5.2, 0.5, 1.6], k); ly = 1.6; ls = k < 1 ? 1.6 : 0.3; } if (t > E.board) { const k = seg(t, E.board + 1.5, E.countdown + 1.6); lp = L3([5.2, 0.5, 1.6], [6.8, 0.5, -1.0], k); ly = faceTo([5.2, 0, 1.6], BP); ls = k < 1 ? 1.4 : 0.3; }
      // the duck: one in the hand, one out of the machine ten seconds early
      duckB.visible = win(t, E.test, E.duckSend - 0.2); if (duckB.visible) { const k = seg(t, E.duckSend - 1.2, E.duckSend - 0.2); if (k <= 0) { parentTo(duckB, hero.aR); duckB.position.set(0, -0.86, 0.2); } else { duckB.position.set(...L3([5.9, 1.4, 0.1], [7, 1.6, -0.6], k)); duckB.position.y += Math.sin(k * PI) * 1.2; } }
      duckA.visible = t > E.duckArrive && t < E.arrive && show; if (duckA.visible) { if (t < E.itWorks) { const k = seg(t, E.duckArrive, E.duckArrive + 0.6); duckA.position.set(7, lerp(1.6, 0.5, k) + Math.sin(k * PI) * 0.8, lerp(-0.6, 0.6, k)); duckA.rotation.set(0, -0.4, 0); } else { parentTo(duckA, L6.body); duckA.position.set(0, 0.4, -0.2); duckA.rotation.set(0, 0, 0); } }
      muffin.root.visible = puff.root.visible = true; poseMuffin(muffin, t, [-4.6, 0.5, 3], 0.6, { hop: win(t, E.unveil, E.unveil + 3) || win(t, E.itWorks, E.plan) }); poseMag(puff, t, [-5.8, 0.6, 2], 0.8);
    } else {
      // home again: the house stands
      hp = L3([7, 0.5, -1], [4, 0.5, 1.4], seg(t, E.home + 0.4, E.look)); hy = t < E.look ? 0.4 : -2.77; ho = { walk: t < E.look ? 1 : 0, phase: t * 7, face: t < E.reveal2 ? 'scared' : 'smug', wave: win(t, E.reveal2, E.reveal2 + 4) };
      if (t > E.reveal2 + 5.8) { const k = seg(t, E.reveal2 + 5.8, E.bloopPaid); hp = L3([5, 0.5, -1.6], [-3, 0.5, -1.6], k); hy = -PI / 2; ho = { walk: k < 1 ? 1 : 0, phase: t * 5, face: 'smug', headYaw: 0.8 }; }
      if (t > E.bloopPaid) { hp = [2.6, 0.5, 0.4]; hy = PI / 2; ho = { face: 'scared', headPitch: 0.2 }; }
      if (t > E.calm) { const k = seg(t, E.calm, E.twinOut); hp = L3([0, 0.5, 1.4], [4, 0.5, 0.8], k); hy = PI / 2 - 0.3; ho = { walk: k < 1 ? 1 : 0, phase: t * 5, face: 'smug' }; }
      if (t > E.twinOut) { hp = [4.2, 0.5, 0.8]; hy = PI / 2; ho = { face: 'scared', panic: win(t, E.twinOut + 2, E.twinOut + 6) }; }
      if (t > E.porch) { hp = [-1, 1.5, -4.6]; hy = 0; ho = { face: 'smug', sit: 1 }; }
      if (t > E.whir + 1.4) { const k = seg(t, E.whir + 1.4, E.third); hp = L3([-1, 1.5, -4.2], [3, 0.5, -1], k); hy = faceTo([-1, 0, -4], BP); ho = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'scared' }; }
      if (t > E.third) { hp = [3, 0.5, -1]; hy = faceTo(hp, [6.4, 0, 0.8]); ho = { face: 'scared', panic: t > E.duckRain }; }
      bp = L3([7, 0.5, -1], [5.6, 0.5, -1.6], seg(t, E.home + 1, E.home + 3)); by = -0.6; bo = { walk: win(t, E.home + 1, E.home + 3) ? 1 : 0, phase: t * 8, hop: win(t, E.reveal2, E.reveal2 + 5) };
      if (t > E.bloopPaid) { bp = [4.6, 0.5, 0.4]; by = -PI / 2; bo = { handOut: true }; fish.visible = t < E.calm + 2; parentTo(fish, bloop6.B.aR); fish.position.set(0, -0.72, 0.3); fish.rotation.set(0, 0, 1.2); }
      if (t > E.calm) { bp = [6, 0.5, -3.6]; by = -0.4; bo = {}; } if (t > E.porch) { bp = [-3, 1.5, -4.5]; by = 0.2; bo = { hop: win(t, E.sunset, E.sunset + 3) }; } if (t > E.whir + 1) { bp = [-2, 0.5, -3]; by = 0.6; bo = { facepalm: t > E.third + 2 }; }
      lp = L3([7, 0.5, -1], [3.4, 0.5, -3], seg(t, E.home + 1.4, E.home + 4)); ly = 0.6; ls = win(t, E.home + 1.4, E.home + 4) ? 1.4 : 0.3;
      const nd = t > E.ducks ? 3 : 1; [duckA, duckC, duckD].forEach((d, i) => { d.visible = i < nd; parentTo(d, L6.body); d.position.set((i - (nd - 1) / 2) * 0.42, 0.4, -0.2); d.rotation.set(0, 0, 0); d.scale.set(1, i === 0 && win(t, E.squeak, E.squeak + 0.5) ? 0.5 : 1, 1); });
      // past me pops out to see how it turns out; then a third me
      if (t > E.twinOut) { twin.root.visible = true; let tp = L3([7, 0.5, -1], [6.4, 0.5, 0.8], seg(t, E.twinOut, E.twinOut + 0.8)), ty = PI * 1.6, to = { face: 'smug', wave: win(t, E.twinOut, E.twinOut + 2.4) };
        if (t > E.twinOut + 6) { ty = -2.6; to = { face: 'smug', hips: true }; } if (t > E.porch) { tp = [1, 1.5, -4.6]; ty = 0; to = { face: 'smug', sit: 1 }; }
        if (t > E.whir + 1.4) { const k = seg(t, E.whir + 1.4, E.third); tp = L3([1, 1.5, -4.2], [4.4, 0.5, -1.6], k); ty = faceTo([1, 0, -4], BP); to = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'scared' }; } if (t > E.third) { tp = [4.4, 0.5, -1.6]; ty = faceTo(tp, [6.4, 0, 0.8]); to = { face: 'scared', panic: t > E.duckRain }; }
        pose(twin, { t, p: tp, yaw: ty, ...to }); parentTo(twin.root, g); prop.rotation.y = t * 18;
        tock.root.visible = true; poseTock(tock, t, t < E.porch ? [lerp(7, 5.6, seg(t, E.twinOut, E.twinOut + 1)), 3.2, 0.2] : t < E.whir ? [2.4, 1.95, -4.6] : [4.6, 4.2, -2], t < E.porch ? 0 : 0.2, { fly: t < E.porch || t > E.whir, alarm: t > E.third, fast: t > E.duckRain });
        parentTo(tock.root, g); duckB.visible = true; parentTo(duckB, tock.body); duckB.position.set(0, -0.56, 0.3); }
      if (t > E.third) { third.root.visible = true; const k = seg(t, E.third, E.third + 1.2); pose(third, { t, p: L3([7, 0.5, -1], [6.4, 0.5, 0.8], k), yaw: faceTo([6.4, 0, 0.8], [3.6, 0, -1.4]), face: 'scared', panic: true, walk: k < 1 ? 1 : 0, phase: t * 9 }); parentTo(third.root, g); }
      rain.forEach((d, i) => { const [x, z, t0, sp] = RD[i]; if (t < t0) return; d.visible = true; const dt = t - t0; d.position.set(x, Math.max(0.5, 18 - dt * 9), z); d.rotation.set(dt < 2 ? dt * sp : 0, sp, dt < 2 ? dt * sp * 0.5 : 0); });
      muffin.root.visible = puff.root.visible = true; poseMuffin(muffin, t, [-4.4, 0.5, -3.4], 0.4, { hop: win(t, E.reveal2, E.reveal2 + 6) || t > E.duckRain }); poseMag(puff, t, [-5.4, 0.6, -2.4], 0.6, { big: win(t, E.sunset, E.ducks) });
    }
    hero.root.visible = show; if (show) { pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g); }
    bloop6.B.root.visible = !(!late && t > E.countdown + 1.4); poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    L6.root.visible = !(!late && t > E.countdown + 1.6); poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); parentTo(muffin.root, g); parentTo(puff.root, g); bot.root.visible = false;
    if (late) L6.hd.rotation.x = win(t, E.squeak, E.squeak + 1) ? 0.4 : L6.hd.rotation.x;
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: Day 1 (golden morning; past me; the first collapse; building it right)
const past = (() => {
  const g = mk('past'); field(g, true);
  const hutG = new THREE.Group(); g.add(hutG); const hutVS = new VSet(hutG, true); { const cells = hutCells(), r = rng(2002);
    cells.forEach(([x, y, z, ty], i) => hutVS.add(x, y, z, ty, { t0: lerp(E.build1, E.build1End - 0.5, i / cells.length), t1: E.collapse + 0.4 + r() * 0.3, fly: [(r() - 0.7) * 6, 2 + r() * 4, (r() - 0.5) * 5], spin: [r() * 6, r() * 6, r() * 6], floor: 0.5, keep: true })); hutVS.build(); }
  const houseG = new THREE.Group(); g.add(houseG); const houseVS = new VSet(houseG, true); { const cells = HOUSE.slice().sort((a, b) => a[1] - b[1] || a[0] - b[0]);
    cells.forEach(([x, y, z, ty], i) => houseVS.add(x, y, z, ty, { t0: lerp(E.buildTL, E.buildTLEnd - 0.5, i / cells.length) })); houseVS.build(); }
  const flw = flowers(g); const BP = [6, 0.5, -8.5];
  for (let t = E.build1; t < E.build1End; t += 0.5) burst(t, [0, 2, -8.5], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  for (let t = E.buildTL; t < E.buildTLEnd; t += 0.4) burst(t, [lerp(-4, 4, (t * 0.37) % 1), 1.5 + seg(t, E.buildTL, E.buildTLEnd) * 9, -9], { n: 6, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.5, grav: 6, up: 2 });
  burst(E.collapse + 0.5, [1, 2, -8.5], { n: 90, colors: ['#e0a95a', '#b88440', '#ffffff'], speed: 6, size: 0.22, life: 1.4, grav: 10, up: 5 });
  burst(E.tockIn, [6, 2.6, -7], { n: 40, colors: ['#ffd23f', '#5ff7ff'], speed: 4, size: 0.12, life: 0.8, grav: 2, up: 3 }); burst(E.arrive + 0.4, [6, 1.4, -7], { n: 80, colors: ['#5ff7ff', '#ff5cf0', '#ffe066'], speed: 5, size: 0.14, life: 1, grav: 2, up: 3 });
  for (let t = E.bloopPay + 4; t < E.teamUp; t += 0.3) burst(t, [-3.4, 1.8, -1.8], { n: 3, colors: ['#5ff7ff', '#9fd0ff'], speed: 2.4, size: 0.1, life: 0.6, grav: 9, up: 2 });
  burst(E.highfive + 1, [0, 2.6, -3.6], { n: 60, colors: ['#ff5cf0', '#5ff7ff'], speed: 6, size: 0.14, life: 1, grav: 0, up: 0 }); burst(E.glitchEnd, [-0.2, 2.6, -1.4], { n: 50, colors: ['#ffd23f', '#ffffff'], speed: 4, size: 0.12, life: 1, grav: 2, up: 3 });
  const C = [[E.arrive, 10, 4, 3, 4, 2, -7, 50], [64, 12, 6, 8, 0, 2, -6, 54], [68.9, -9, 5, 8, 0, 1.6, -5, 54], [69, 6.4, 2.2, 0.4, -1, 1.4, -4.6, 44], [74.1, 4.6, 2.0, -0.6, -1, 1.4, -4.6, 40],
    [74.2, 2.9, 2.1, -1.6, -0.6, 1.8, -3.2, 40], [79.1, 2.8, 2.0, -2.0, -0.6, 1.8, -3.2, 36], [79.2, -1.4, 2.1, -1.6, 2.2, 1.8, -3.2, 40], [82.3, -1.3, 2.0, -2.0, 2.2, 1.8, -3.2, 36], [82.4, 0.8, 2.2, 3.4, 0.8, 1.7, -3.2, 46], [90.3, 0.8, 2.0, 1.4, 0.8, 1.7, -3.2, 42],
    [90.4, 9.6, 2.2, -3, 6, 2.8, -8.5, 46], [93.9, 8.6, 2.8, -4, 6, 3.4, -8.5, 42], [94, 0.8, 2.6, 2.6, 0.8, 2.4, -3.2, 48], [97.3, 1.2, 2.5, 2.0, 0.8, 2.3, -3.2, 46], [97.4, 3, 7, 0, 0, 1, -8, 50], [101.3, 2, 7.6, -1.4, 0, 1, -8, 48],
    [101.4, 9, 3, 2, 0, 2, -8, 50], [107.5, -8, 3, 2, 0, 2, -8, 50], [107.6, 5.4, 2.0, -1.2, 3.6, 1.8, -4, 40], [112.5, 5.2, 2.0, -0.4, 3.6, 1.8, -4, 44], [112.6, 1, 2.4, -1.0, 0, 2, -8, 46], [117.3, -0.4, 2.6, -2, 0, 2, -8, 44],
    [117.4, 8, 2, -3.2, 4.6, 1.6, -6.6, 46], [121.5, 7.4, 2, -4.2, 4.6, 1.6, -6.6, 42], [121.6, 10, 5, 0, 2, 1.5, -8.5, 54], [125.5, 9, 5.5, 1.4, 2, 1.5, -8.5, 54], [125.6, -2.4, 1.4, -3.4, 0, 2, -8, 46], [129.3, -2, 1.6, -4.4, 0, 2, -8, 44],
    [129.4, 6.4, 1.8, -3.4, 3.8, 0.8, -5.6, 36], [133.9, 5.4, 1.5, -4.2, 3.8, 0.8, -5.6, 28], [134, -0.8, 2.2, 1.6, -3.4, 1.4, -1.8, 44], [143.1, -1.8, 2.2, 0.8, -3.4, 1.4, -1.8, 40], [143.2, 0, 2.2, 2.4, 0, 1.6, -3, 44], [147.9, 0, 2, 1.0, 0, 1.6, -3, 40],
    [148, 15, 8, 6, 0, 3, -9, 50], [159.5, -15, 8, 4, 0, 3, -9, 50], [159.6, 0, 11, 10, 0, 3, -9, 56], [170.5, 3, 12, 7, 0, 3, -9, 56], [170.6, 3, 1.8, -1.0, 0, 6, -9, 54], [174.1, 2.2, 1.6, -1.4, 0, 6.6, -9, 54],
    [174.2, 0, 2, 0.8, 0, 1.8, -3.6, 40], [175.7, 0, 2, 0.4, 0, 1.8, -3.6, 36], [175.8, 0, 5, 6, 0, 3.4, -6, 56], [183.1, 0, 5.4, 5, 0, 3.4, -6, 54], [183.2, 2.8, 3.6, 3.6, -0.2, 2.6, -1.4, 44], [188.3, 2.2, 3.4, 2.8, -0.2, 2.6, -1.4, 40],
    [188.4, 1, 3, 4, 6, 1.8, -6, 48], [E.home, 3, 3, 3, 6, 2, -7, 44]];
  function update(t) {
    hideMisc(); blueprint.parent.visible = false; [duckA, duckB, duckC, duckD, fish].forEach(d => { d.visible = false; parentTo(d, g); });
    // time stutters during the glitch: the house un-builds and re-builds
    const tg = win(t, E.glitch, E.glitchEnd) ? E.buildTL + (E.buildTLEnd - E.buildTL) * (0.55 + 0.45 * Math.cos((t - E.glitch) * 2.2)) : t;
    hutVS.update(t); hutG.visible = t < E.teamUp; houseVS.update(tg); houseG.position.x = win(t, E.glitch, E.glitchEnd) ? Math.sin(t * 50) * 0.15 : 0; flw.visible = t > E.buildTLEnd;
    parentTo(booth, g); booth.position.set(...BP); const tip = t < E.reveal + 10 ? ss(seg(t, E.collapse, E.collapse + 0.8)) : 1 - ss(seg(t, E.reveal + 10, E.reveal + 11)); booth.rotation.set(0, 0, tip * 1.25);
    dial.material = dialM[t > E.goHome ? 0 : 2]; lever.rotation.x = t > E.goHome + 3 ? -1 : 0.4; boothLight.intensity = t < E.arrive + 1.5 || t > E.goHome + 3 ? 40 + Math.sin(t * 30) * 20 : 6;
    // future me
    const H0 = [6, 0.5, -6.8]; let hp = L3(H0, [2.2, 0.5, -3.2], seg(t, E.arrive + 1, E.meet + 1)), hy = faceTo(H0, [2.2, 0, -3.2]), ho = { walk: win(t, E.arrive + 1, E.meet + 1) ? 1 : 0, phase: t * 7, face: 'smug', headYaw: t < E.meet ? 0.5 : 0 };
    if (t > E.meet + 1) { hp = [2.2, 0.5, -3.2]; hy = -PI / 2; ho = { face: t < E.twinTalk ? 'scared' : 'smug', hips: win(t, E.twinTalk + 5, E.twinTalk + 8) }; } if (t > E.tockIn) ho = { face: 'scared', headYaw: -0.6, headPitch: -0.2 };
    if (t > E.blueprint) { hp = [1.4, 0.5, -3.6]; hy = -2.4; ho = { face: 'smug' }; blueprint.parent.visible = t < E.build1; }
    if (t > E.build1) { hp = [3.6, 0.5, -4]; hy = 0.6; ho = { face: 'normal', hips: t > E.build1 + 6 }; }
    if (t > E.lean) { const k = seg(t, E.lean, E.lean + 1.5); hp = L3([3.6, 0.5, -4], [4.4, 0.5, -6.6], k); hy = k < 1 ? PI : 0.3; ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug', lean: k < 1 ? 0 : -0.15 }; }
    if (t > E.collapse) { const k = seg(t, E.collapse + 0.3, E.collapse + 0.9); hp = L3([4.4, 0.5, -6.6], [3.8, 0.5, -5.6], k); hy = 0.3 + k * 2; ho = { face: 'scared', flat: k, panic: k < 1 }; }
    if (t > E.ruinMe) ho = { face: 'soot', flat: 1 };
    if (t > E.bloopPay) { hp = [-0.8, 0.5, -3.4]; hy = -2.2; ho = { face: 'smug', headYaw: 0.6 }; }
    if (t > E.teamUp) { hp = [-1, 0.5, -3]; hy = PI / 2; ho = { face: 'smug' }; }
    if (t > E.buildTL) { hp = [-5.4, 0.5, -4.4]; hy = 2.27; ho = { face: 'smug', swing: t * 1.6 }; } if (t > E.buildTLEnd) { const k = seg(t, E.buildTLEnd, E.highfive); hp = L3([-5.4, 0.5, -4.4], [-0.8, 0.5, -3.6], k); hy = PI / 2; ho = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'smug', headPitch: -0.4 }; }
    if (t > E.highfive) ho = { face: 'smug', wave: true }; if (t > E.glitch) ho = { face: 'scared', panic: true }; if (t > E.glitchEnd) { hy = 2.6; ho = { face: 'normal' }; }
    if (t > E.goHome) { const k = seg(t, E.goHome, E.warpBack + 1); hp = L3([-0.8, 0.5, -3.6], [6, 0.5, -7.2], k); hy = faceTo([-0.8, 0, -3.6], H0); ho = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug', wave: t < E.goHome + 1.5 }; }
    hero.root.visible = t < E.warpBack + 1; pose(hero, { t, p: hp, yaw: hy, ...ho }); parentTo(hero.root, g);
    // past me
    let tp = [-1, 0.5, -4.6], ty = PI, to = { face: 'smug', swing: t * 1.2 };
    if (t > E.meet + 2) { tp = [-0.6, 0.5, -3.2]; ty = PI / 2; to = { face: t < E.twinTalk + 2 ? 'scared' : 'smug', hips: win(t, E.twinTalk + 9, E.tockIn) }; } if (t > E.tockIn) to = { face: 'scared', headYaw: 0.6, headPitch: -0.2 };
    if (t > E.blueprint) { ty = 2.2; to = { face: 'smug', hips: true }; }
    if (t > E.build1) { tp = [0, 0.5, -5.4]; ty = PI; to = { face: 'smug', swing: t * 2.2 }; } if (t > E.build1End) { tp = [0.4, 0.5, -4.8]; ty = 0.3; to = { face: 'smug', wave: true }; }
    if (t > E.lean) to = { face: 'smug', hips: true }; if (t > E.collapse) { ty = PI; to = { face: 'scared', panic: true }; }
    if (t > E.ruinMe) { const k = seg(t, E.ruinMe, E.bloopPay + 1); tp = L3([0.4, 0.5, -4.8], [-2.1, 0.5, -1.8], k); ty = -PI / 2; to = { walk: k < 1 ? 1 : 0, phase: t * 7, face: 'smug' }; }
    if (t > E.bloopPay + 1) to = { face: 'smug', hold: t < E.bloopPay + 2.4 };
    if (t > E.teamUp) { tp = [1, 0.5, -3]; ty = -PI / 2; to = { face: 'smug' }; }
    if (t > E.buildTL) { tp = [5.4, 0.5, -4.4]; ty = -2.27; to = { face: 'smug', swing: t * 1.6 + 0.5 }; } if (t > E.buildTLEnd) { const k = seg(t, E.buildTLEnd, E.highfive); tp = L3([5.4, 0.5, -4.4], [0.8, 0.5, -3.6], k); ty = -PI / 2; to = { walk: k < 1 ? 1 : 0, phase: t * 8, face: 'smug', headPitch: -0.4 }; }
    if (t > E.highfive) to = { face: 'smug', wave: true }; if (t > E.glitch) to = { face: 'scared', panic: true }; if (t > E.glitchEnd) { ty = -2.6; to = { face: 'normal' }; }
    if (t > E.goHome) { tp = [2, 0.5, -3]; ty = 0.9; to = { face: 'smug', wave: true }; }
    twin.root.visible = true; pose(twin, { t, p: tp, yaw: ty, ...to }); parentTo(twin.root, g); prop.rotation.y = t * 14; third.root.visible = false;
    fish.visible = win(t, E.bloopPay + 1, E.teamUp); if (fish.visible) { const onB = t > E.bloopPay + 2.4; parentTo(fish, onB ? bloop6.B.aR : twin.aR); fish.position.set(0, -0.72, 0.3); fish.rotation.set(0, 0, onB ? 1.2 : 0); }
    // Bloop
    const B0 = [7.4, 0.5, -6.4]; let bp = L3(B0, [4.8, 0.5, -5.4], seg(t, E.arrive + 1.4, E.meet)), by = -1.6, bo = { walk: win(t, E.arrive + 1.4, E.meet) ? 1 : 0, phase: t * 8 };
    if (t > E.collapse) bo = { angry: true }; if (t > E.reveal) bo = { facepalm: true };
    if (t > E.ruinMe) { const k = seg(t, E.ruinMe, E.bloopPay); bp = L3([4.8, 0.5, -5.4], [-3.4, 0.5, -1.8], k); by = PI / 2; bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; } if (t > E.bloopPay + 2.4) bo = { hop: true, handOut: true };
    if (t > E.teamUp) { bp = [-3.4, 0.5, -1.8]; bo = {}; } if (t > E.buildTL) { bp = [0, 0.5, -3]; by = PI; bo = { hop: true, handOut: true }; } if (t > E.buildTLEnd) { bp = [-3, 0.5, -1.6]; by = 1.2; bo = {}; } if (t > E.glitch) bo = { angry: true };
    if (t > E.goHome) { const k = seg(t, E.goHome + 0.5, E.warpBack + 1.2); bp = L3([-3, 0.5, -1.6], [6.4, 0.5, -7.4], k); by = faceTo([-3, 0, -1.6], H0); bo = { walk: k < 1 ? 1 : 0, phase: t * 8 }; }
    bloop6.B.root.visible = t < E.warpBack + 1.2; poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bHat.visible = true; bHat.position.y = 1.2;
    // Leggy + her duck; Tock the clockwork owl
    let lp = L3([6.4, 0.5, -6.4], [4.6, 0.5, -2], seg(t, E.arrive + 1, E.meet)), ly = -1, ls = win(t, E.arrive + 1, E.meet) ? 1.4 : 0.3;
    if (t > E.build1) { lp = [-4.4, 0.5, -2.6]; ly = 0.8; } if (t > E.ruinMe) { lp = [2.6, 0.5, -1]; ly = -1.2; }
    const ca = (t - E.duckChase) * 0.9; if (win(t, E.duckChase, E.buildTLEnd)) { lp = [Math.cos(ca - 0.5) * 7.6, 0.5, -9 + Math.sin(ca - 0.5) * 7.6]; ly = -(ca - 0.5) + PI; ls = 3; if (t > E.duckChase + 5.6) { lp = [-0.8, 0.5, -1.2]; ly = 0.4; ls = 0.3; } }
    if (t > E.buildTLEnd) { lp = [3.6, 0.5, -1.2]; ly = -0.8; } if (t > E.glitchEnd - 3) { const k = seg(t, E.glitchEnd - 3, E.glitchEnd); lp = L3([3.6, 0.5, -1.2], [-0.2, 0.5, -1.4], k); ly = -PI / 2; ls = k < 1 ? 1.4 : 0.3; }
    if (t > E.goHome) { const k = seg(t, E.goHome + 1, E.warpBack + 1.4); lp = L3([-0.2, 0.5, -1.4], [6, 0.5, -7.2], k); ly = faceTo([-0.2, 0, -1.4], H0); ls = k < 1 ? 1.4 : 0.3; }
    L6.root.visible = t < E.warpBack + 1.4; poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g);
    tock.root.visible = t > E.tockIn; let kp = L3([6, 2.6, -7.2], [0.8, 3.6, -3.4], seg(t, E.tockIn, E.tockIn + 2)), ko = { fly: true, alarm: paradoxAt(t) > 0.8 }, ky = 0;
    if (t > E.blueprint) kp = [2.2, 4.0, -5]; if (t > E.lean) kp = [3.6, 3.2, -3.6];
    if (win(t, E.duckChase, E.buildTLEnd)) { kp = [Math.cos(ca) * 8.4, 4.4, -9 + Math.sin(ca) * 8.4]; ky = -ca + PI; if (t > E.duckChase + 5.6) { kp = [3, 12.4, -11]; ky = 0.4; ko = { fly: false }; } }
    if (t > E.buildTLEnd) { kp = [3, 12.4, -11]; ko = { fly: false, alarm: paradoxAt(t) > 0.8 }; } if (t > E.glitch) { kp = [0, 5, -3.4]; ko = { fly: true, spin: true, fast: true, alarm: true }; } if (t > E.glitchEnd) { kp = [-0.2, 2.75, -1.4]; ky = 0.4; ko = { fly: false }; }
    if (t > E.goHome) { kp = [2, 3.4, -3]; ko = { fly: true }; }
    poseTock(tock, t, kp, ky, ko); parentTo(tock.root, g);
    duckA.visible = true; const stolen = win(t, E.duckChase, E.duckChase + 5.6), given = t > E.glitchEnd; parentTo(duckA, stolen || given ? tock.body : L6.body); duckA.position.set(0, stolen || given ? -0.56 : 0.4, stolen || given ? 0.3 : -0.2); duckA.rotation.set(0, 0, 0);
    if (!L6.root.visible && !given) duckA.visible = false;
    muffin.root.visible = puff.root.visible = bot.root.visible = false;
    let cam = camKeys(t, C);
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- lighting per time
function sky(t) {
  const day = { top: '#5db8ff', bot: '#d4f1ff', sunI: 2.6, hemiI: 1.5, fog: '#cfefff', sunEl: 0.9, sunAz: 0.6, near: 70, far: 220 };
  const storm = { top: '#2a3040', bot: '#5a6478', sunI: 0.5, hemiI: 0.9, fog: '#4a5568', sunEl: 0.9, sunAz: 0.6, near: 20, far: 90 };
  const sunset = { top: '#6a4fb0', bot: '#ffb070', sunI: 1.9, hemiI: 1.2, fog: '#e8a080', sunEl: 0.14, sunAz: 2.6, near: 70, far: 220 };
  const eve = { top: '#3a2a80', bot: '#ff8a6a', sunI: 1.4, hemiI: 1.0, fog: '#b07090', sunEl: 0.04, sunAz: 2.6, near: 60, far: 200 };
  const C = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  const mix = (a, b, k) => ({ top: C(a.top, b.top, k), bot: C(a.bot, b.bot, k), fog: C(a.fog, b.fog, k), sunI: lerp(a.sunI, b.sunI, k), hemiI: lerp(a.hemiI, b.hemiI, k), sunEl: lerp(a.sunEl, b.sunEl, k), sunAz: lerp(a.sunAz, b.sunAz, k), near: lerp(a.near, b.near, k), far: lerp(a.far, b.far, k) });
  const dawn = { top: '#ff9a6a', bot: '#ffe2b0', sunI: 2.3, hemiI: 1.45, fog: '#ffd8a8', sunEl: 0.3, sunAz: -0.9, near: 70, far: 240 };
  const glitchy = { top: '#8a2aff', bot: '#ff5cf0', sunI: 1.4, hemiI: 1.2, fog: '#c070ff', sunEl: 0.3, sunAz: -0.9, near: 50, far: 200 };
  if (t < E.arrive) return day; if (t < E.home) return win(t, E.glitch, E.glitchEnd) && Math.floor(t * 6) % 2 ? glitchy : dawn;
  return mix(mix(day, sunset, seg(t, E.sunset - 8, E.sunset + 4)), eve, seg(t, E.sunset + 20, 292));
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
  rod: (x, y, s) => { ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.8); ctx.lineTo(x + s * 0.8, y - s * 0.8); ctx.stroke(); ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + s * 0.8, y - s * 0.8); ctx.lineTo(x + s * 0.8, y + s * 0.4); ctx.stroke(); ctx.fillStyle = '#ff3d3d'; ctx.fillRect(x + s * 0.65, y + s * 0.4, 5, 5); },
  sandwich: (x, y, s) => { ctx.fillStyle = '#e6b06a'; ctx.fillRect(x - s * 0.8, y - s * 0.3, s * 1.6, s * 0.3); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - s * 0.85, y, s * 1.7, s * 0.18); ctx.fillStyle = '#e6b06a'; ctx.fillRect(x - s * 0.8, y + s * 0.18, s * 1.6, s * 0.3); },
  crown: (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.5); ctx.lineTo(x - s * 0.8, y - s * 0.4); ctx.lineTo(x - s * 0.4, y); ctx.lineTo(x, y - s * 0.6); ctx.lineTo(x + s * 0.4, y); ctx.lineTo(x + s * 0.8, y - s * 0.4); ctx.lineTo(x + s * 0.8, y + s * 0.5); ctx.fill(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - 3, y + 1, 6, 6); },
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
ICON.ice = (x, y, s) => isoCube(x, y, s, '#e8f8ff', '#9fdcf5', '#6fb4d8');
ICON.fish = (x, y, s) => { ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.8, s * 0.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x - s * 1.2, y - s * 0.5); ctx.lineTo(x - s * 1.2, y + s * 0.5); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + s * 0.35, y - s * 0.12, s * 0.12, 0, 7); ctx.fill(); };
ICON.gold = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.8, s * 0.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x - s * 1.2, y - s * 0.5); ctx.lineTo(x - s * 1.2, y + s * 0.5); ctx.fill(); ctx.fillStyle = '#8a6a00'; ctx.beginPath(); ctx.arc(x + s * 0.35, y - s * 0.12, s * 0.12, 0, 7); ctx.fill(); };
ICON.boot = (x, y, s) => { ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - s * 0.3, y - s * 0.8, s * 0.6, s * 1.1); ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 1.1, s * 0.45); ctx.fillStyle = '#222'; ctx.fillRect(x - s * 0.36, y + s * 0.5, s * 1.2, s * 0.22); };
ICON.frost = (x, y, s) => isoCube(x, y, s, '#e8fbff', '#b4e4fa', '#7cc8ee');
ICON.thermo = (x, y, s) => { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - s * 0.22, y - s, s * 0.44, s * 1.5); ctx.fillStyle = '#e8344e'; ctx.beginPath(); ctx.arc(x, y + s * 0.6, s * 0.42, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.1, y - s * 0.3, s * 0.2, s); };
function drawHUD(t, info) {
  // vitality crystals
  const hpv = t < E.collapse ? 5 : t < E.teamUp ? 4 : t < E.glitch ? 5 : t < E.glitchEnd ? 2.5 : 5;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (win(t, E.collapse, E.reveal) || win(t, E.glitch, E.glitchEnd) || win(t, E.third, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = false;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined(t > E.arrive && t < E.home ? '☀ DAY 1' : '☀ DAY 20', W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['duck', t > E.test && t < E.duckSend ? 1 : 0], ['plank', win(t, E.buildTL, E.buildTLEnd) ? 64 : 3], ['fish', win(t, E.bloopPay + 1, E.bloopPay + 2.4) ? 1 : 0]];
  let sel = 0;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // paradox meter — this episode's mechanic
  const pm = paradoxAt(t); if (pm !== null && t < E.freeze) { rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(30,16,8,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke(); outlined('PARADOX METER', 132, 114, 15, '#ffd23f', '#000', 3);
    rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const pc = clamp(pm, 0, 1); rrect(36, 130, Math.max(16, 192 * pc), 20, 8); ctx.fillStyle = pc > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : pc > 0.5 ? '#ffa02a' : '#7cff6b'; ctx.fill();
    outlined(pm >= 1 ? 'ERROR' : Math.round(pc * 100) + '%', 132, 168, 18, '#fff', '#000', 4); }

}
function drawFacecam(t) { drawCam(t, 0, 16); if (win(t, E.meet, E.home) || win(t, E.twinOut, E.freeze)) drawCam(t, 1, 176); }
function drawCam(t, tw, y0) {
  const x = W - 236, y = y0, w = 220, h = 150;
  ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
  const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, tw ? '#1b4d2a' : '#2a1b4d'); gr.addColorStop(1, tw ? '#0f4a3a' : '#0f2a4a'); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ff5cf0'; ctx.fillRect(x, y + 18, w, 4); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x, y + 26, w, 3);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ffd23f', '#ff3d7f', '#7cff6b', '#3d7bff'][i]; ctx.fillRect(x + 14 + i * 16, y + 44, 12, 20); }
  const fi = Math.min(ENV.length - 1, Math.floor(t * FPS));
  const cue = CUES.find(c => t >= c.start && t < c.end + 0.2); const mine = cue && ((cue.voice === 'twin') === !!tw); const a = mine ? (ENV[fi] || 0) : 0; const txt = mine ? cue.text : '';
  const up = txt.replace(/[^A-Za-z]/g, ''), caps = up.length ? up.replace(/[^A-Z]/g, '').length / up.length : 0;
  const yell = caps > 0.45 || /AAA|NO NO|RUN|WHY|GO GO|THE WALL/.test(txt), deadpan = txt.startsWith('...'), q = txt.includes('?');
  const bob = Math.sin(t * 2) * 2 + a * 4 + (yell ? Math.sin(t * 30) * 3 : 0);
  const hx = x + w / 2 + 16 + (yell ? Math.sin(t * 23) * 3 : 0), hy = y + 92 + bob, s = 92;
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(hx - 40, hy + s / 2 - 6, 80, 60); ctx.fillStyle = tw ? '#3cc26a' : '#ff8a2a'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);
  ctx.fillStyle = '#f2c79b'; ctx.fillRect(hx - s / 2, hy - s / 2, s, s);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(hx - s / 2 - 2, hy - s / 2 - 8, s + 4, 22); ctx.fillRect(hx + 10, hy - s / 2 - 16, 22, 12);
  ctx.fillStyle = '#222'; ctx.fillRect(hx - s / 2 - 14, hy - 18, 14, 36); ctx.fillRect(hx + s / 2, hy - 18, 14, 36); ctx.fillRect(hx - s / 2 - 8, hy - s / 2 - 14, s + 16, 8);
  if (tw) { ctx.fillStyle = '#2e8a4a'; ctx.fillRect(hx - s / 2 - 4, hy - s / 2 - 24, s + 8, 28); ctx.fillStyle = '#ffe066'; ctx.fillRect(hx - 3, hy - s / 2 - 36, 6, 12); const pr = Math.abs(Math.sin(t * 20)) * 34; ctx.fillStyle = '#ff3d7f'; ctx.fillRect(hx - pr, hy - s / 2 - 40, pr * 2, 6); }
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
  rrect(x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = tw ? '#7cff6b' : '#ffffff'; ctx.stroke();
  ctx.fillStyle = (Math.floor(t * 2) % 2) ? '#ff2a4a' : '#a01020'; ctx.beginPath(); ctx.arc(x + 18, y + h - 16, 6, 0, 7); ctx.fill();
  outlined(tw ? 'PIXELPANIC (DAY 1)' : 'PIXELPANIC', x + 30, y + h - 16, 13, '#fff', '#000', 3, 'left');
}
function drawCaption(t) {
  const c = CUES.find(c => t >= c.start - 0.05 && t < c.end + 0.25); if (!c) return;
  const words = c.text.split(' '), n = Math.ceil(words.length / 9), prog = clamp((t - c.start) / (c.end - c.start + 0.01), 0, 0.999);
  const ci = Math.floor(prog * n), per = Math.ceil(words.length / n), chunk = words.slice(ci * per, ci * per + per).join(' ');
  ctx.font = F(28); const tw = ctx.measureText(chunk).width; const yy = H - 120;
  rrect(W / 2 - tw / 2 - 16, yy - 22, tw + 32, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
  outlined(chunk, W / 2, yy + 1, 28, c.voice === 'twin' ? '#9dff8a' : '#ffffff', '#000', 5);
}
ICON.duck = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - s * 0.7, y - s * 0.1, s * 1.3, s * 0.7); ctx.fillRect(x + s * 0.1, y - s * 0.7, s * 0.6, s * 0.6); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(x + s * 0.7, y - s * 0.45, s * 0.35, s * 0.2); ctx.fillStyle = '#111'; ctx.fillRect(x + s * 0.4, y - s * 0.55, 3, 3); };
const TOASTS = [[E.unveil + 2, '+1 Time Machine 2.0', 'castle'], [E.duckArrive + 1, '+1 Rubber Duck (early)', 'duck'], [E.bloopPay + 3, 'Invoice: PAID (in fish)', 'fish'], [E.buildTLEnd, '+1 House (proper)', 'plank'], [E.ducks + 1, '+2 Rubber Ducks (???)', 'duck']];
const FEATS = [[E.itWorks + 1, 'It Works?!', 'Build a working time machine'], [E.ruinMe + 1, 'Bootstrap Disaster', 'Cause your own first collapse'], [E.buildTLEnd + 1.5, 'Two Heads', 'Build a house with yourself'], [E.reveal2 + 3, 'Home Sweet Home', 'Fix the house. For real.']];
const POPS = [[E.wreck + 2, 1.4, 'creak...', 0.42, 0.4, '#ffffff', 60], [E.unveil, 1.6, 'TA-DA!', 0.55, 0.3, '#ffe066', 96], [E.invoice + 1, 1.6, '3 PAGES', 0.62, 0.4, '#ff6b6b', 72], [E.duckArrive + 0.2, 1.4, 'quack?', 0.6, 0.45, '#ffd23f', 70],
  [E.duckSend, 1.6, 'ZWOOP', 0.6, 0.35, '#5ff7ff', 100], [E.itWorks, 1.6, 'IT WORKS?!', 0.5, 0.3, '#7cff6b', 96], [E.countdown, 1.0, '3', 0.5, 0.4, '#ffffff', 110], [E.countdown + 0.7, 1.0, '2', 0.5, 0.4, '#ffffff', 110], [E.countdown + 1.4, 1.0, '1', 0.5, 0.4, '#ffffff', 110],
  [E.meet + 1, 1.6, '...is that me?', 0.4, 0.35, '#ffffff', 64], [E.twinTalk, 1.4, 'WHO ARE YOU', 0.3, 0.3, '#9dff8a', 70], [E.tockIn, 1.4, 'tick tock', 0.6, 0.3, '#ffd23f', 70], [E.build1 + 2, 1.2, 'tap tap tap', 0.4, 0.35, '#ffffff', 56],
  [E.collapse, 1.6, 'CREAK', 0.6, 0.35, '#ffffff', 90], [E.collapse + 0.8, 1.6, 'CRASH', 0.4, 0.45, '#ff8a5a', 110], [E.ruinMe + 1, 1.6, 'IT WAS ME', 0.6, 0.3, '#ff6b6b', 90], [E.bloopPay + 2.4, 1.4, 'a fish!', 0.3, 0.35, '#ff9a2a', 70],
  [E.buildTL + 2, 1.2, 'tap', 0.25, 0.4, '#ffffff', 56], [E.buildTL + 3, 1.2, 'tap', 0.75, 0.4, '#9dff8a', 56], [E.duckChase + 1, 1.4, 'MY DUCK', 0.5, 0.3, '#5ff7ff', 72], [E.highfive + 0.8, 1.2, 'SLAP', 0.5, 0.4, '#ffe066', 100],
  [E.glitchEnd + 0.6, 1.4, 'purrrr', 0.5, 0.35, '#ffd23f', 70], [E.reveal2, 1.6, 'IT STANDS!', 0.5, 0.25, '#7cff6b', 110], [E.bloopPaid + 2, 1.4, '*stink*', 0.62, 0.35, '#9fdc5a', 70], [E.twinOut, 1.4, 'SURPRISE!', 0.6, 0.3, '#9dff8a', 96],
  [E.whir, 1.4, 'hmmmmmm', 0.62, 0.3, '#5ff7ff', 70], [E.shout, 1.6, "DON'T SQUEEZE THE—", 0.62, 0.3, '#ff6b6b', 60], [E.squeak, 1.4, 'squeak.', 0.5, 0.4, '#ffd23f', 80], [E.duckRain, 1.6, 'QUACK', 0.5, 0.25, '#ffd23f', 110]];

const ZOOMS = [[E.itWorks, 0.8, 1.15, 0.5, 0.5], [E.ruinMe, 1.0, 1.12, 0.5, 0.6], [E.reveal2, 0.8, 1.1, 0.5, 0.4], [E.squeak, 0.8, 1.2, 0.5, 0.6]];
const SHAKES = [[E.duckSend, 1, 0.12], [E.countdown, 2, 0.08], [E.collapse + 0.6, 1, 0.4], [E.highfive + 0.8, 0.5, 0.2], [E.glitch, 7.4, 0.05], [E.whir, 4.8, 0.03], [E.duckRain, 9, 0.04]];
const FLASH = [[E.duckSend, 0.3, '160,250,255'], [E.duckArrive, 0.2, '160,250,255'], [E.highfive + 0.8, 0.3, '255,120,240'], [E.twinOut, 0.25, '160,250,255'], [E.third, 0.25, '160,250,255']];
function drawLog(t) {
  for (const [s, title, lines] of [[E.log1, "CAPTAIN'S LOG", ['Day 1 at sea.', 'Lost: one (1) sandwich.', 'Morale: low.']], [E.log2, "CAPTAIN'S LOG", ['Day 1, later.', 'Everything is fine.', 'NOTHING IS FINE.']]]) {
    if (!win(t, s, s + 5.4)) continue; const k = ss(seg(t, s, s + 0.35)) * (1 - ss(seg(t, s + 5.0, s + 5.4)));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.24, H * 0.42 + (1 - k) * 60); ctx.rotate(-0.05);
    ctx.fillStyle = '#f6e7c1'; ctx.fillRect(-190, -120, 380, 240); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(-190, -120, 380, 14);
    outlined(title, 0, -78, 28, '#5a2a10', '#f6e7c1', 2); ctx.font = F(22, 'normal'); ctx.textAlign = 'left';
    lines.forEach((l, i) => { if (t < s + 0.6 + i * 1.1) return; ctx.fillStyle = i === 2 && s === E.log2 ? '#c0182a' : '#3a2410'; ctx.fillText(l, -160, -30 + i * 44); });
    if (s === E.log2 && t > s + 2.6) { ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-160, 14); ctx.lineTo(-160 + 230 * seg(t, s + 2.6, s + 3.0), 18); ctx.stroke(); }
    ctx.restore(); }
  if (win(t, E.bite, E.land)) { const k = seg(t, E.bite, E.land); ctx.save(); rrect(W / 2 - 160, H * 0.2, 320, 60, 14); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); outlined('REEL IT IN!', W / 2, H * 0.2 + 18, 20, '#ffe066', '#000', 4);
    rrect(W / 2 - 140, H * 0.2 + 34, 280, 14, 7); ctx.fillStyle = '#333'; ctx.fill(); rrect(W / 2 - 140, H * 0.2 + 34, 280 * Math.min(1, k * 1.2 + Math.sin(t * 20) * 0.03), 14, 7); ctx.fillStyle = '#2bd46a'; ctx.fill(); ctx.restore(); }
}
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
  if (win(t, E.titleIn, E.titleIn + 4.6)) { const k = ss(seg(t, E.titleIn, E.titleIn + 0.35)) * (1 - ss(seg(t, E.titleIn + 3.4, E.titleIn + 3.8))); ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * -400, 0);
    rrect(40, H * 0.3, 560, 150, 18); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ff5cf0'; ctx.stroke();
    outlined('EPISODE 20', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TIME MACHINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it works. really.)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 21: THREE OF ME' : 'EP 19: THE TREASURE MAP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we need a bigger couch)' : '(X marks the wrong spot)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.arrive, yard, 'yard'], [E.arrive, E.home, past, 'past'], [E.home, 1e9, yard, 'yard']];
window.renderAt = function (T) {
  let t = T; const frozen = T >= E.freeze && T < E.logo; if (frozen) t = E.freeze;
  let sec = SECS.find(s => t >= s[0] && t < s[1]);
  for (const k in groups) groups[k].visible = false;
  groups[sec[3]].visible = true;
  hero.root.visible = true; hero.root.scale.setScalar(1);
  const res = sec[2].update(t);
  // sky + light
  const S = sky(t); const cave = res.cave;
  if (res.space) { setSky('#000005', '#080818'); scene.fog.color.set('#000005'); scene.fog.near = 500; scene.fog.far = 1400; hemi.intensity = 0.9; hemi.color.set('#c0c8ff'); hemi.groundColor.set('#40405a'); sun.intensity = 2.4; }
  else if (cave) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 30; scene.fog.far = 90; hemi.intensity = 0.5; hemi.color.set('#6a5aff'); hemi.groundColor.set('#201030'); sun.intensity = 0; }
  else { setSky(S.top, S.bot); scene.fog.color.set(S.fog); scene.fog.near = S.near; scene.fog.far = S.far; hemi.intensity = S.hemiI; hemi.color.set('#d6eeff'); hemi.groundColor.set('#6a7a4a'); sun.intensity = S.sunI; }
  const c = res.cam; const sh = shakeOffset(T);
  camera.position.set(c.p[0] + sh[0], c.p[1] + sh[1], c.p[2] + sh[2]); camera.lookAt(c.l[0] + sh[0] * 0.5, c.l[1] + sh[1] * 0.5, c.l[2]); camera.fov = c.fov; camera.updateProjectionMatrix();
  // sun & moons
  const night = false;
  const sv = placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunMesh); placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunGlow, 385);
  sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05;
  moonA.visible = moonB.visible = !cave && night;
  placeSky(-2.85, 0.5, moonA); placeSky(-2.6, 0.38, moonB);
  const tc = camera.position;
  if (night) { sun.position.set(tc.x - 30, 60, tc.z - 30); sun.color.set('#9fb4ff'); } else { sun.position.set(tc.x + sv.x * 80, Math.max(20, sv.y * 80), tc.z + sv.z * 80); sun.color.set(t > E.dusk - 1 && t < 270 ? '#ffc08a' : '#fff1d6'); }
  const focus = hero.root.position; sun.position.x = focus.x + (sun.position.x - tc.x); sun.position.z = focus.z + (sun.position.z - tc.z); sun.target.position.copy(focus);
  clouds.visible = !cave && !res.space; clouds.children.forEach((cl, i) => { const b = cl.userData.base; const x = ((b[0] + t * 1.5 - tc.x + 200) % 400 + 400) % 400 - 200 + tc.x; cl.position.set(x, b[1], ((b[2] - tc.z + 200) % 400 + 400) % 400 - 200 + tc.z); });
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
  const panic = win(T, E.collapse, E.reveal) || win(T, E.glitch, E.glitchEnd) || win(T, E.duckRain, E.freeze);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, E.build1, E.build1End) || win(T, E.buildTL, E.buildTLEnd)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    if (T > E.arrive && T < E.home && !frozen) { ctx.fillStyle = 'rgba(255,170,80,.07)'; ctx.fillRect(0, 0, W, H); }
    stamp(T, E.arrive + 2, 'DAY 1  (19 DAYS AGO)');
    stamp(T, E.ruinMe + 0.4, 'DISASTER #1: CAUSED BY ME');
    stamp(T, E.reveal2 + 1.6, 'HOUSE: STANDING. NOT TILTED.');
    drawGlitch(T); drawWarp(T);
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. it works. too well.', 0, 0, 56, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that's me. and me. and me.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(the house is fine though)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
    if (win(T, E.hours, E.hoursEnd)) { const k = ss(seg(T, E.hours, E.hours + 0.4)) * (1 - ss(seg(T, E.hoursEnd - 0.4, E.hoursEnd)));
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#0b0820'; ctx.fillRect(0, 0, W, H);
      const words = ['several', 'terrifying', 'hours', 'later...']; words.forEach((w, i) => { ctx.save(); ctx.translate(W / 2, H / 2 - 60 + i * 52); ctx.rotate(Math.sin(T * 3 + i) * 0.04); outlined(w, 0, 0, 52, ['#ff5cf0', '#ffe066', '#5ff7ff', '#ffffff'][i], '#000', 8); ctx.restore(); });
      ctx.restore(); }
    drawCaption(T);
    if (T > 3) { drawFacecam(T); drawRivalCam(T); }
  } else drawLogo(T);
  drawPrev(T);
  return out.toDataURL('image/jpeg', 0.9);
};
window.prof = (t, n) => { const a = performance.now(); for (let i = 0; i < n; i++) window.renderAt(t + i / 24); const b = performance.now(); for (let i = 0; i < n; i++) { renderer.render(scene, camera); renderer.getContext().finish(); } const c = performance.now(); return [(b - a) / n, (c - b) / n]; };
window.ready = true;
