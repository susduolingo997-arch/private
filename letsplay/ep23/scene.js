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
// ---------------------------------------------------------------- Ep 21 helpers: compact actor scripts
const pick = (t, A) => { let r = A[0][1]; for (const a of A) if (t >= a[0]) r = a[1]; return r; };
function act(t, K, O, idle) { const w = walker(t, K, idle); return { p: w.p, yaw: w.yaw, walk: w.walk > 0.05 ? 1 : 0, phase: w.phase, ...pick(t, O) }; }
const wl = (P, yaw, l) => [P[0] + l[0] * Math.cos(yaw) + l[2] * Math.sin(yaw), P[1] + l[1], P[2] - l[0] * Math.sin(yaw) + l[2] * Math.cos(yaw)];
// arcs: K = [[t,x,y,z,h],...] — h = hop height of the segment ending at that key
function arcPath(t, K) { if (t <= K[0][0]) return K[0].slice(1, 4); for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (t < b[0]) { const u = (t - a[0]) / (b[0] - a[0]); return [lerp(a[1], b[1], u), lerp(a[2], b[2], u) + Math.sin(u * PI) * b[4], lerp(a[3], b[3], u)]; } } return K[K.length - 1].slice(1, 4); }
const follow = (p, o, ly, fov = 52) => ({ p: [p[0] + o[0], p[1] + o[1], p[2] + o[2]], l: [p[0], p[1] + ly, p[2]], fov });
function sitOn(h, t, P, yaw, l, o = {}) { pose(h, { t, p: wl(P, yaw, l), yaw, sit: 1, face: 'smug', ...o }); }
// --- the old 3-seat couch (snaps), the race couch, Team Lumpy's mini couch
function makeCouch3(col, cush) { const g = new THREE.Group(), parts = [];
  const add = (w, h, d, c, x, y, z) => { const m = box(w, h, d, c, x, y, z, g); parts.push({ m, p0: [x, y, z] }); };
  add(3.6, 0.5, 1.2, col, 0, 0.25, 0); for (const x of [-1.2, 0, 1.2]) add(1.1, 0.25, 1.0, cush, x, 0.62, 0.08); add(3.6, 0.9, 0.3, col, 0, 0.95, -0.45); for (const x of [-1.95, 1.95]) add(0.3, 0.7, 1.2, col, x, 0.6, 0);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, parts }; }
const couchOld = makeCouch3('#3a8fb0', '#5ab0d0'), couchRace = makeCouch3('#c0392b', '#e8604e'), couchMini = makeCouch3('#2a9a8a', '#5ad1c8'); couchMini.g.scale.setScalar(0.55);
const SNAPV = [[0, 1, 0.5], [-3, 6, 2], [0.5, 8, 3], [3, 6, 2.4], [0, 4, -4], [-5, 3, 1], [5, 3, 1]];
function poseSnap(c, t, t0) { c.parts.forEach((q, i) => { const dt = Math.max(0, t - t0), v = SNAPV[i]; const tl = (v[1] + Math.sqrt(v[1] * v[1] + 2 * 22 * q.p0[1])) / 22, d = Math.min(dt, tl);
  q.m.position.set(q.p0[0] + v[0] * d * 0.6, Math.max(0.12, q.p0[1] + v[1] * d - 11 * d * d), q.p0[2] + v[2] * d * 0.6); q.m.rotation.set(d * v[2] * 0.8, 0, d * v[0] * 0.6); }); }
function resetCouch(c) { c.parts.forEach(q => { q.m.position.set(...q.p0); q.m.rotation.set(0, 0, 0); }); }
// --- Duke Fluffington (a cushion with a crown and a megaphone) and Team Lumpy
function makeCushion(col, s = 1, duke = false) { const root = new THREE.Group(), body = pivot(root, 0, 0.55, 0);
  box(1.3, 0.8, 1.3, col, 0, 0, 0, body); box(0.16, 0.06, 0.16, shade(col, 0.6), 0, 0.42, 0, body); for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(0.14, 0.24, 0.14, '#ffd23f', x * 0.68, 0.36, z * 0.68, body);
  for (const x of [-0.25, 0.25]) box(0.26, 0.24, 0.04, '#ffffff', x, 0.1, 0.66, body); const pup = [-0.22, 0.28].map(x => box(0.12, 0.14, 0.05, '#111', x, 0.08, 0.68, body));
  box(0.3, 0.06, 0.04, shade(col, 0.4), 0, -0.14, 0.66, body); for (const x of [-0.35, 0.35]) box(0.26, 0.16, 0.32, shade(col, 0.7), x, -0.48, 0.04, body);
  const aL = pivot(body, -0.7, 0.05, 0), aR = pivot(body, 0.7, 0.05, 0); box(0.16, 0.42, 0.16, col, 0, -0.2, 0, aL); box(0.16, 0.42, 0.16, col, 0, -0.2, 0, aR);
  let mega = null; if (duke) { const cr = makeCrown(); cr.scale.setScalar(0.6); cr.position.y = 0.5; body.add(cr); mega = pivot(aR, 0, -0.42, 0.1); box(0.2, 0.2, 0.3, '#e8344e', 0, 0, 0.1, mega); box(0.38, 0.38, 0.12, '#ffd23f', 0, 0, 0.3, mega); }
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, aL, aR, pup, mega }; }
function poseCushion(c, t, p, yaw, o = {}) { c.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.45 : 0), p[2]); c.root.rotation.set(0, yaw, 0);
  const sq = o.squish ?? (1 + Math.sin(t * 4 + (o.seed || 0)) * 0.03); c.body.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); c.body.position.y = 0.55 * sq; c.body.rotation.set(o.sleep ? 0.2 : 0, 0, o.flat ? PI / 2 : o.sleep ? 0.15 : 0);
  c.aL.rotation.set(o.wave ? -2.6 + Math.sin(t * 12) * 0.4 : o.swing ? -2.4 + Math.sin(t * 9) * 1.2 : 0, 0, -0.2); c.aR.rotation.set(o.mega ? -1.5 : o.wave ? -2.6 + Math.cos(t * 12) * 0.4 : 0, 0, 0.2);
  c.pup.forEach(q => q.scale.y = o.sleep ? 0.15 : o.squint ? 0.35 : 1); if (c.mega) c.mega.visible = !!o.mega; }
const duke = makeCushion('#ff9ad0', 1.25, true), lumpy = ['#5ad1c8', '#4ab8e0', '#7ad18a'].map(c => makeCushion(c, 0.7)), fans = ['#ffb36b', '#c08aff', '#ff6b6b', '#ffe066', '#7cff6b', '#5ff7ff', '#ff9ad0', '#9aa8b8'].map(c => makeCushion(c, 0.55));
const pillow = box(0.6, 0.3, 0.42, '#ffffff', 0, -0.75, 0.3, twin.aR); const lpillow = box(0.5, 0.26, 0.36, '#ffe066', 0, -0.42, 0.25, lumpy[0].aL);
// --- Sofie: the Mega Sofa (seats twelve; alive; loves ducks)
function makeSofa() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), col = '#8a3fd1', cu = '#b06ae8';
  box(11, 0.8, 2.6, col, 0, 1.0, 0, body); for (let i = 0; i < 6; i++) box(1.75, 0.3, 2.0, cu, -4.55 + i * 1.82, 1.55, 0.2, body); box(11, 1.6, 0.6, col, 0, 2.2, -1.0, body); for (let i = 0; i < 6; i++) box(1.7, 1.2, 0.2, cu, -4.55 + i * 1.82, 2.2, -0.62, body);
  for (const x of [-5.5, 5.5]) box(0.7, 1.1, 2.6, col, x, 1.6, 0, body); box(11.2, 0.12, 2.7, '#ffd23f', 0, 0.62, 0, body);
  const eyes = [], lids = []; for (const x of [-1.5, 1.5]) { box(0.95, 0.62, 0.06, '#ffffff', x, 1.02, 1.31, body); eyes.push(box(0.38, 0.4, 0.07, '#1a1030', x, 1.0, 1.34, body)); const l = pivot(body, x, 1.33, 1.36); box(0.98, 0.66, 0.06, col, 0, -0.33, 0, l); lids.push(l); }
  const mouth = box(1.6, 0.12, 0.06, '#3a1060', 0, 0.74, 1.31, body);
  const legs = [[-4.6, -0.8], [4.6, -0.8], [-4.6, 0.8], [4.6, 0.8]].map(([x, z]) => { const p = pivot(root, x, 0.62, z); box(0.7, 0.62, 0.7, '#ffd23f', 0, -0.31, 0, p); return p; });
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, eyes, lids, legs, mouth }; }
function poseSofa(s, t, p, yaw, o = {}) { const w = o.walk || 0, ph = o.phase ?? t * 8; s.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.7 : 0), p[2]); s.root.rotation.set(0, yaw, 0);
  s.legs.forEach((l, i) => l.rotation.x = Math.sin(ph + (i % 2 ^ i >> 1) * PI) * 0.7 * w); s.body.position.set(o.purr ? Math.sin(t * 60) * 0.03 : 0, Math.abs(Math.cos(ph)) * 0.22 * w, 0); s.body.rotation.set(o.crouch ? 0.12 : 0, 0, w ? Math.sin(ph) * 0.04 : 0);
  const open = o.awake ? (o.purr ? 0.12 : (Math.floor(t * 10) % 41 === 0 ? 0.1 : 1)) : 0; s.lids.forEach(l => l.scale.y = 1 - open); s.eyes.forEach((e, i) => e.position.x = (i ? 1.5 : -1.5) + (o.look || 0) * 0.2); s.mouth.scale.x = o.purr ? 1.3 : o.awake ? 0.8 : 1; }
const sofie = makeSofa(); const sofaBob = () => sofie.body.position.y;
const SEAT = { ducks: -4.5, twin: -2.7, hero: -0.9, third: 0.9, bloop: 2.7, leggy: 4.5 };
// --- Bloop's Sofa-Wagon (assembles itself block by block), Leggy's ribbon, flyer
function makeWagon() { const root = new THREE.Group(), parts = [], wheels = [], add = m => { parts.push(m); return m; };
  for (const [x, z] of [[-1.3, -1.4], [1.3, -1.4], [-1.3, 1.4], [1.3, 1.4]]) { const w = pivot(root, x, 0.5, z); add(box(0.2, 1.0, 1.0, '#5a3a22', 0, 0, 0, w)); box(0.22, 0.3, 0.3, '#ffd400', 0, 0, 0, w); wheels.push(w); }
  add(box(2.4, 0.3, 4.2, '#c08a40', 0, 0.95, 0, root)); for (const x of [-1.2, 1.2]) add(box(0.15, 0.4, 4.2, '#a06a2a', x, 1.3, 0, root)); add(box(2.4, 0.4, 0.15, '#a06a2a', 0, 1.3, -2.05, root));
  add(box(0.15, 0.15, 2.0, '#8a5a2b', 0, 0.7, 3.0, root)); add(box(1.6, 0.12, 0.12, '#ffd400', 0, 0.75, 3.9, root)); const fl = add(box(0.06, 1.2, 0.06, '#c0c0c8', -1.1, 2.0, -1.9, root)); add(box(0.7, 0.4, 0.04, '#ff8a2a', -0.76, 2.4, -1.9, root));
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, parts, wheels }; }
function poseWagon(w, t, p, yaw, roll, built = -1e9) { w.root.position.set(...p); w.root.rotation.set(0, yaw, 0); w.wheels.forEach(q => q.rotation.x = roll);
  w.parts.forEach((m, i) => { const t0 = built + i * 0.42, k = t < t0 ? 0 : Math.min(1, backOut(seg(t, t0, t0 + 0.3))); m.scale.setScalar(Math.max(0.001, k)); }); }
const wagon = makeWagon();
const ribbon = new THREE.Group(); box(0.4, 0.4, 0.06, '#3d7bff', 0, 0, 0, ribbon); box(0.14, 0.4, 0.05, '#3d7bff', -0.1, -0.34, 0, ribbon); box(0.14, 0.4, 0.05, '#3d7bff', 0.1, -0.34, 0, ribbon); box(0.18, 0.18, 0.08, '#ffd23f', 0, 0, 0.02, ribbon); L6.body.add(ribbon); ribbon.position.set(0, 0.2, 0.75);
function leggyDucks(t, n) { rain.forEach((d, i) => { if (i >= 9) return; d.visible = i < n; parentTo(d, L6.body); d.position.set(((i % 3) - 1) * 0.42, 0.4 + Math.floor(i / 3) * 0.28, -0.2 + (Math.floor(i / 3) % 2) * 0.1); d.rotation.set(0, i * 0.7, 0); d.scale.setScalar(1); }); }
// HUD: seats vs butts + relay tracker; the flyer
const seatsAt = t => t < E.snap ? [3, 6] : t < E.named ? [0, 6] : [12, 6];
const legAt = t => !win(t, E.leg1, E.win + 3) ? 0 : t < E.leg2 ? 1 : t < E.leg3 ? 2 : 3;
function drawSeats(t) { if (t >= E.freeze) return; const [s, b] = seatsAt(t); rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(40,14,50,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff9ad0'; ctx.stroke();
  outlined('SEATS  vs  BUTTS', 132, 114, 15, '#ff9ad0', '#000', 3); outlined(s + '  :  ' + b, 132, 146, 30, s >= b ? '#7cff6b' : s ? '#ffe066' : '#ff4a5a', '#000', 5); outlined(s >= b ? 'IT FITS!' : s ? 'too few seats' : 'NO COUCH', 132, 174, 13, '#fff', '#000', 3);
  const lg = legAt(t); if (lg) { rrect(22, 196, 220, 62, 12); ctx.fillStyle = 'rgba(20,24,48,.8)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.stroke(); outlined('RELAY  LEG ' + lg + '/3', 132, 214, 16, '#5ff7ff', '#000', 3);
    outlined(['', 'PILLOW FIGHT', 'MATTRESS SPRINT', 'COUCH CARRY'][lg] + (t > E.win ? ' ✓' : ''), 132, 240, 15, '#fff', '#000', 3); } }
function drawFlyer(T) { const k = ss(seg(T, E.flyer + 0.4, E.flyer + 0.8)) * (1 - ss(seg(T, E.flyerEnd - 0.4, E.flyerEnd))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 80); ctx.rotate(-0.04); ctx.fillStyle = '#ffe8f4'; ctx.fillRect(-210, -210, 420, 400); ctx.fillStyle = '#ff6fb8'; ctx.fillRect(-210, -210, 420, 70);
  outlined('COMFY FAIR', 0, -175, 40, '#ffffff', '#a0205a', 6); outlined('GRAND RELAY', 0, -112, 30, '#7a1a5a', '#ffe8f4', 2); outlined('for teams of THREE', 0, -78, 22, '#3a2a60', '#ffe8f4', 2);
  ctx.fillStyle = '#8a3fd1'; ctx.fillRect(-150, -40, 300, 50); ctx.fillRect(-150, -80, 300, 40); ctx.fillStyle = '#b06ae8'; for (let i = 0; i < 6; i++) ctx.fillRect(-146 + i * 49, -50, 45, 16); ctx.fillStyle = '#ffd23f'; for (const x of [-140, 120]) ctx.fillRect(x, 10, 20, 16);
  if (T > E.flyer + 2.4) { outlined('PRIZE: THE MEGA SOFA', 0, 66, 26, '#c0182a', '#ffe8f4', 2); outlined('seats 12!!', 0, 100, 24, '#3a2a60', '#ffe8f4', 2); }
  if (T > E.flyer + 4) outlined('(do not feed the sofa)', 0, 150, 16, '#777', '#ffe8f4', 2); ctx.restore(); }

// ---------------------------------------------------------------- Ep 22 helpers: the ghost train, Conductor Wisp, flappers, the Spook-o-Meter
const ghostM = new THREE.MeshLambertMaterial({ color: '#7fe8ff', emissive: '#2ab0c8', emissiveIntensity: 0.7, transparent: true, opacity: 0.75 }), ghostD = new THREE.MeshLambertMaterial({ color: '#2a5a8a', emissive: '#103a5a', emissiveIntensity: 0.6, transparent: true, opacity: 0.8 });
const glowY = new THREE.MeshBasicMaterial({ color: '#fff3a0' }), glowC = new THREE.MeshBasicMaterial({ color: '#7ff5e6' }), glowP = new THREE.MeshBasicMaterial({ color: '#ff8fd8' });
function makeTrain() { const root = new THREE.Group(), loco = pivot(root, 0, 0, 0), cars = [pivot(root, 0, 0, 0), pivot(root, 0, 0, 0)];
  box(2.2, 0.5, 4.2, 0, 0, 0.8, 0, loco, ghostD); box(1.8, 1.6, 2.6, 0, 0, 1.85, 0.6, loco, ghostM); box(2.2, 0.2, 1.6, 0, 0, 3.2, -1.3, loco, ghostD); for (const x of [-1, 1]) box(0.2, 2.2, 1.5, 0, x, 2.1, -1.3, loco, ghostM); box(2.2, 1.0, 0.2, 0, 0, 1.5, -2.0, loco, ghostM);
  box(0.6, 1.0, 0.6, 0, 0, 3.1, 1.5, loco, ghostD); box(0.9, 0.7, 0.15, 0, 0, 1.9, 1.95, loco, glowY); box(2.0, 0.5, 0.5, 0, 0, 0.6, 2.25, loco, ghostD);
  const lever = pivot(loco, 0.6, 1.2, -1.0); box(0.1, 0.8, 0.1, '#c0c0c8', 0, 0.4, 0, lever); box(0.24, 0.24, 0.24, '#e8344e', 0, 0.82, 0, lever);
  const wheels = []; for (const g of [loco, ...cars]) for (const z of [-1.2, 1.2]) for (const x of [-1.15, 1.15]) { const w = pivot(g, x, 0.45, z); box(0.16, 0.8, 0.8, 0, 0, 0, 0, w, ghostD); wheels.push(w); }
  for (const c of cars) { box(2.2, 0.6, 3.6, 0, 0, 0.9, 0, c, ghostD); for (const x of [-1.05, 1.05]) box(0.15, 0.7, 3.6, 0, x, 1.55, 0, c, ghostM); for (const z of [-1.75, 1.75]) box(2.2, 0.7, 0.15, 0, 0, 1.55, z, c, ghostM); }
  const lamp = new THREE.PointLight('#bff8ff', 30, 14, 1.4); lamp.position.set(0, 2.4, -5); root.add(lamp);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, loco, cars, lever, wheels, lamp }; }
const train = makeTrain(), CARZ = [-5.4, -9.4];
// place loco + cars: fn(d) -> [pos, yaw] for a distance d behind the loco centre
function placeTrain(fn, roll, op = 0.75) { const [p, y] = fn(0); train.loco.position.set(...p); train.loco.rotation.set(0, y, 0); train.cars.forEach((c, i) => { const [q, yy] = fn(-CARZ[i]); c.position.set(...q); c.rotation.set(0, yy, 0); });
  train.wheels.forEach(w => w.rotation.x = roll); ghostM.opacity = op; ghostD.opacity = Math.min(1, op + 0.05); train.lamp.position.set(...fn(4)[0]); train.lamp.position.y += 2.4; }
const inCar = (i, l) => { const c = train.cars[i]; return wl([c.position.x, c.position.y, c.position.z], c.rotation.y, l); }, inLoco = l => wl([train.loco.position.x, train.loco.position.y, train.loco.position.z], train.loco.rotation.y, l);
const SEATS = [[-0.5, 1.15, 0.8], [0.5, 1.15, 0.8], [-0.5, 1.15, -0.8], [0.5, 1.15, -0.8]];
function makeWisp() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), sm = new THREE.MeshLambertMaterial({ color: '#f4fbff', emissive: '#9fdcff', emissiveIntensity: 0.45, transparent: true, opacity: 0.85 });
  box(1.0, 1.2, 0.9, 0, 0, 0.7, 0, body, sm); const hd = pivot(body, 0, 1.3, 0); box(0.9, 0.75, 0.85, 0, 0, 0.3, 0, hd, sm);
  const eyes = [-0.2, 0.2].map(x => box(0.16, 0.26, 0.04, '#111', x, 0.36, 0.44, hd)); const mouth = box(0.2, 0.16, 0.04, '#111', 0, 0.1, 0.44, hd);
  const cap = pivot(hd, 0, 0.72, 0); box(0.95, 0.25, 0.9, '#1b2a4a', 0, 0, 0, cap); box(0.96, 0.08, 0.91, '#ffd23f', 0, -0.06, 0, cap); box(0.95, 0.06, 0.4, '#1b2a4a', 0, -0.1, 0.55, cap);
  const skirt = [-0.36, -0.12, 0.12, 0.36].map(x => { const p = pivot(body, x, 0.1, 0); box(0.24, 0.3, 0.9, 0, 0, -0.12, 0, p, sm); return p; });
  const aL = pivot(body, -0.58, 1.1, 0), aR = pivot(body, 0.58, 1.1, 0); box(0.2, 0.5, 0.2, 0, 0, -0.22, 0, aL, sm); box(0.2, 0.5, 0.2, 0, 0, -0.22, 0, aR, sm);
  const lant = pivot(aR, 0, -0.55, 0.1); box(0.26, 0.36, 0.26, 0, 0, -0.1, 0, lant, glowY); box(0.3, 0.06, 0.3, '#333', 0, 0.1, 0, lant); const punch = box(0.14, 0.24, 0.1, '#c0c0c8', 0, -0.55, 0.12, aL);
  return { root, body, hd, eyes, mouth, cap, skirt, aL, aR, lant, punch, sm }; }
function poseWisp(w, t, p, yaw, o = {}) { w.root.position.set(p[0], p[1] + 0.25 + Math.sin(t * 2.2) * 0.12 + (o.hop ? Math.abs(Math.sin(t * 8)) * 0.5 : 0), p[2]); w.root.rotation.set(0, yaw + (o.spin ? t * 9 : 0), 0);
  w.skirt.forEach((s, i) => s.rotation.x = Math.sin(t * 6 + i * 1.3) * 0.35); w.body.rotation.x = o.sad ? 0.25 : 0; w.hd.rotation.set(o.sad ? 0.45 : 0, o.look || 0, 0);
  w.aL.rotation.set(o.panic ? -2.7 + Math.sin(t * 22) * 0.5 : o.punch ? -1.4 + Math.abs(Math.sin(t * 10)) * 0.5 : o.lever ? -1.2 : 0, 0, -0.15); w.aR.rotation.set(o.panic ? -2.7 + Math.cos(t * 22) * 0.5 : o.wave ? -2.8 + Math.sin(t * 10) * 0.3 : -0.5, 0, 0.15);
  w.eyes.forEach(e => e.scale.y = o.sad ? 0.4 : o.panic ? 1.5 : 1); w.mouth.scale.set(o.panic ? 1.6 : o.happy ? 2.2 : 1, o.panic ? 2 : o.happy ? 0.5 : 1, 1); w.punch.visible = !!o.punch;
  w.sm.color.set(o.happy ? '#ffd6ee' : '#f4fbff'); w.sm.emissive.set(o.happy ? '#ff8fd8' : '#9fdcff'); w.sm.opacity = o.fade ?? 0.85; }
const wisp = makeWisp();
function makeFlapper() { const root = new THREE.Group(); box(0.3, 0.26, 0.3, '#2a2030', 0, 0, 0, root); for (const x of [-0.08, 0.08]) box(0.06, 0.06, 0.04, 0, x, 0.04, 0.16, root, glowY);
  const wL = pivot(root, -0.15, 0, 0), wR = pivot(root, 0.15, 0, 0); box(0.6, 0.04, 0.4, '#3a2a48', -0.3, 0, 0, wL); box(0.6, 0.04, 0.4, '#3a2a48', 0.3, 0, 0, wR); return { root, wL, wR }; }
function poseFlap(f, t, p, yaw, ph = 0) { f.root.position.set(...p); f.root.rotation.set(0, yaw, 0); const a = Math.sin(t * 26 + ph) * 0.8; f.wL.rotation.z = a; f.wR.rotation.z = -a; }
const flappers = Array.from({ length: 16 }, makeFlapper);
const meter = new THREE.Group(); box(0.42, 0.3, 0.2, '#3a3a3a', 0, 0, 0, meter); box(0.3, 0.18, 0.02, '#ffe066', 0, 0.02, 0.11, meter); const needle = pivot(meter, 0, -0.05, 0.13); box(0.02, 0.14, 0.01, '#e8344e', 0, 0.07, 0, needle);
box(0.04, 0.5, 0.04, '#c0c0c8', 0.14, 0.38, 0, meter); const mTip = box(0.1, 0.1, 0.1, '#ff3d3d', 0.14, 0.66, 0, meter); bloop6.B.aR.add(meter); meter.position.set(0, -0.62, 0.22);
const sheetB = box(1.15, 1.7, 1.15, '#f4f4f0', 0, 1.0, 0, bloop6.B.body); for (const x of [-0.2, 0.2]) box(0.14, 0.2, 0.02, '#111', x, 0.35, 0.58, sheetB);
const lanternH = new THREE.Group(); box(0.26, 0.34, 0.26, 0, 0, 0, 0, lanternH, glowY); box(0.3, 0.06, 0.3, '#333', 0, 0.2, 0, lanternH); hero.aL.add(lanternH); lanternH.position.set(0, -0.82, 0.1); const heroLight = new THREE.PointLight('#ffe8a0', 12, 10, 1.4); lanternH.add(heroLight);
const ticket = box(0.6, 0.3, 0.03, 0, 0, 0, 0, new THREE.Group(), glowC);
// HUD: the Spook-o-Meter; the ticket card
const spookAt = t => t < E.detectorEnd ? null : t < E.test + 1 ? 0.05 : t < E.test + 3 ? 0.42 : t < E.walk ? 0.03 : t < E.midnight ? lerp(0.1, 0.3, seg(t, E.arrive, E.midnight)) : t < E.wisp ? 0.85 : t < E.twist ? 0.97 : t < E.hug ? 0.35 : t < E.prep ? 0.12 : t < E.boo ? 0.2 : t < E.lever ? 1 : 0.6 + 0.3 * Math.abs(Math.sin(t));
function drawSpook(t) { const v = spookAt(t); if (v === null || t >= E.freeze) return; rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(10,20,40,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7ff5e6'; ctx.stroke(); outlined('SPOOK-O-METER', 132, 114, 15, '#7ff5e6', '#000', 3);
  rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const lonely = win(t, E.twist, E.hug); rrect(36, 130, Math.max(16, 192 * v), 20, 8); ctx.fillStyle = lonely ? '#8fa0ff' : v > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : v > 0.4 ? '#ffa02a' : '#7cff6b'; ctx.fill();
  outlined(lonely ? 'READING: LONELY?' : v > 0.95 ? 'AAAAAAH' : Math.round(v * 100) + '% SPOOKY', 132, 168, 16, '#fff', '#000', 4); }
function drawTicket(T) { const k = ss(seg(T, E.ticket + 1, E.ticket + 1.4)) * (1 - ss(seg(T, E.ticketEnd - 0.4, E.ticketEnd))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 60); ctx.rotate(-0.05 + Math.sin(T * 2) * 0.02); rrect(-230, -130, 460, 250, 16); ctx.fillStyle = 'rgba(160,250,255,.92)'; ctx.fill(); ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.strokeStyle = '#1b4a6a'; ctx.stroke(); ctx.setLineDash([]);
  outlined('GHOST TRAIN', 0, -90, 40, '#ffffff', '#1b4a6a', 7); outlined('ADMIT THREE', 0, -40, 26, '#1b4a6a', '#a0faff', 2); if (T > E.ticket + 2.6) outlined('DEPARTS: MIDNIGHT', 0, 2, 24, '#1b4a6a', '#a0faff', 2);
  if (T > E.ticket + 4) outlined('NEXT STOP: AAAAH', 0, 46, 28, '#c0182a', '#a0faff', 2); if (T > E.ticket + 5.4) outlined('(no refunds. no exits.)', 0, 88, 16, '#3a5a7a', '#a0faff', 2); ctx.restore(); }

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

// ---------------------------------------------------------------- lighting per time
function sky(t) {
  const day = { top: '#5db8ff', bot: '#d4f1ff', sunI: 2.6, hemiI: 1.5, fog: '#cfefff', sunEl: 0.9, sunAz: 0.6, near: 70, far: 220 };
  const storm = { top: '#2a3040', bot: '#5a6478', sunI: 0.5, hemiI: 0.9, fog: '#4a5568', sunEl: 0.9, sunAz: 0.6, near: 20, far: 90 };
  const sunset = { top: '#6a4fb0', bot: '#ffb070', sunI: 1.9, hemiI: 1.2, fog: '#e8a080', sunEl: 0.14, sunAz: 2.6, near: 70, far: 220 };
  const eve = { top: '#3a2a80', bot: '#ff8a6a', sunI: 1.4, hemiI: 1.0, fog: '#b07090', sunEl: 0.04, sunAz: 2.6, near: 60, far: 200 };
  const C = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  const mix = (a, b, k) => ({ top: C(a.top, b.top, k), bot: C(a.bot, b.bot, k), fog: C(a.fog, b.fog, k), sunI: lerp(a.sunI, b.sunI, k), hemiI: lerp(a.hemiI, b.hemiI, k), sunEl: lerp(a.sunEl, b.sunEl, k), sunAz: lerp(a.sunAz, b.sunAz, k), near: lerp(a.near, b.near, k), far: lerp(a.far, b.far, k) });
  const morning = { top: '#7ec8ff', bot: '#fff0d0', sunI: 2.6, hemiI: 1.55, fog: '#ffeedd', sunEl: 0.5, sunAz: -0.6, near: 70, far: 230 };
  const warm = { top: '#ffb070', bot: '#ffe0b0', sunI: 2.0, hemiI: 1.5, fog: '#ffd8a8', sunEl: 0.7, sunAz: 0.6, near: 60, far: 200 };
  if (t < E.tent) return morning; if (t < E.square) return warm; return mix(mix(sunset, eve, seg(t, E.calm, 280)), { ...eve, top: '#2a1c5a', bot: '#ff7a6a' }, seg(t, 270, 292) * 0.5);
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
  const hpv = t < E.poof ? 5 : t < E.tent ? 4 : t < E.frost ? 5 : t < E.place ? 3 : t < E.throwPie ? 5 : 4;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (win(t, E.poof, E.poof + 2) || win(t, E.panic, E.fights + 6) || win(t, E.chase, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = false;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined('☀ DAY 23', W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', t < E.sugar ? 1 : 0], ['whisk', win(t, E.whisk, E.fights) ? 1 : 0], ['cake', t > E.reveal ? 1 : 0], ['pie', t > E.piegrab ? 0 : 3]];
  let sel = 0;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // cake size / bake timer — this episode's mechanic
  drawCake(t);

}
function drawFacecam(t) { drawCam(t, 0, 16); }
function drawCam(t, tw, y0) {
  const x = W - 236, y = y0, w = 220, h = 150;
  ctx.save(); rrect(x, y, w, h, 14); ctx.clip();
  const gr = ctx.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, ['#2a1b4d', '#1b4d2a', '#4d1b24'][tw]); gr.addColorStop(1, ['#0f2a4a', '#0f4a3a', '#4a0f2a'][tw]); ctx.fillStyle = gr; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#ff5cf0'; ctx.fillRect(x, y + 18, w, 4); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x, y + 26, w, 3);
  for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ffd23f', '#ff3d7f', '#7cff6b', '#3d7bff'][i]; ctx.fillRect(x + 14 + i * 16, y + 44, 12, 20); }
  const fi = Math.min(ENV.length - 1, Math.floor(t * FPS));
  const cue = CUES.find(c => t >= c.start && t < c.end + 0.2); const mine = cue && ['me', 'twin', 'top'].indexOf(cue.voice || 'me') === tw; const a = mine ? (ENV[fi] || 0) : 0; const txt = mine ? cue.text : '';
  const up = txt.replace(/[^A-Za-z]/g, ''), caps = up.length ? up.replace(/[^A-Z]/g, '').length / up.length : 0;
  const yell = caps > 0.45 || /AAA|NO NO|RUN|WHY|GO GO|THE WALL/.test(txt), deadpan = txt.startsWith('...'), q = txt.includes('?');
  const bob = Math.sin(t * 2) * 2 + a * 4 + (yell ? Math.sin(t * 30) * 3 : 0);
  const hx = x + w / 2 + 16 + (yell ? Math.sin(t * 23) * 3 : 0), hy = y + 92 + bob, s = 92;
  ctx.fillStyle = '#1a1a1a'; ctx.fillRect(hx - 40, hy + s / 2 - 6, 80, 60); ctx.fillStyle = ['#ff8a2a', '#3cc26a', '#e8344e'][tw]; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);
  ctx.fillStyle = '#f2c79b'; ctx.fillRect(hx - s / 2, hy - s / 2, s, s);
  ctx.fillStyle = '#5a3a22'; ctx.fillRect(hx - s / 2 - 2, hy - s / 2 - 8, s + 4, 22); ctx.fillRect(hx + 10, hy - s / 2 - 16, 22, 12);
  ctx.fillStyle = '#222'; ctx.fillRect(hx - s / 2 - 14, hy - 18, 14, 36); ctx.fillRect(hx + s / 2, hy - 18, 14, 36); ctx.fillRect(hx - s / 2 - 8, hy - s / 2 - 14, s + 16, 8);
  if (tw === 2) { ctx.fillStyle = '#111'; ctx.fillRect(hx - s / 2 - 10, hy - s / 2 - 12, s + 20, 10); ctx.fillRect(hx - s / 2 + 10, hy - s / 2 - 58, s - 20, 48); ctx.fillStyle = '#e8344e'; ctx.fillRect(hx - s / 2 + 10, hy - s / 2 - 22, s - 20, 8); }
  if (tw === 1) { ctx.fillStyle = '#2e8a4a'; ctx.fillRect(hx - s / 2 - 4, hy - s / 2 - 24, s + 8, 28); ctx.fillStyle = '#ffe066'; ctx.fillRect(hx - 3, hy - s / 2 - 36, 6, 12); const pr = Math.abs(Math.sin(t * 20)) * 34; ctx.fillStyle = '#ff3d7f'; ctx.fillRect(hx - pr, hy - s / 2 - 40, pr * 2, 6); }
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
  rrect(x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = ['#ffffff', '#7cff6b', '#ff6b6b'][tw]; ctx.stroke();
  ctx.fillStyle = (Math.floor(t * 2) % 2) ? '#ff2a4a' : '#a01020'; ctx.beginPath(); ctx.arc(x + 18, y + h - 16, 6, 0, 7); ctx.fill();
  outlined(['PIXELPANIC', 'PIXELPANIC (DAY 1)', 'PIXELPANIC (DAY 99)'][tw], x + 30, y + h - 16, 13, '#fff', '#000', 3, 'left');
}
function drawCaption(t) {
  const c = CUES.find(c => t >= c.start - 0.05 && t < c.end + 0.25); if (!c) return;
  const words = c.text.split(' '), n = Math.ceil(words.length / 9), prog = clamp((t - c.start) / (c.end - c.start + 0.01), 0, 0.999);
  const ci = Math.floor(prog * n), per = Math.ceil(words.length / n), chunk = words.slice(ci * per, ci * per + per).join(' ');
  ctx.font = F(28); const tw = ctx.measureText(chunk).width; const yy = H - 120;
  rrect(W / 2 - tw / 2 - 16, yy - 22, tw + 32, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill();
  outlined(chunk, W / 2, yy + 1, 28, c.voice === 'twin' ? '#9dff8a' : c.voice === 'top' ? '#ff9a9a' : '#ffffff', '#000', 5);
}
ICON.duck = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - s * 0.7, y - s * 0.1, s * 1.3, s * 0.7); ctx.fillRect(x + s * 0.1, y - s * 0.7, s * 0.6, s * 0.6); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(x + s * 0.7, y - s * 0.45, s * 0.35, s * 0.2); ctx.fillStyle = '#111'; ctx.fillRect(x + s * 0.4, y - s * 0.55, 3, 3); };
ICON.couch = (x, y, s) => { ctx.fillStyle = '#8a3fd1'; ctx.fillRect(x - s, y - s * 0.6, s * 2, s * 0.7); ctx.fillRect(x - s, y, s * 2, s * 0.5); ctx.fillStyle = '#b06ae8'; ctx.fillRect(x - s * 0.8, y - s * 0.1, s * 1.6, s * 0.25); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - s * 0.9, y + s * 0.5, s * 0.3, s * 0.3); ctx.fillRect(x + s * 0.6, y + s * 0.5, s * 0.3, s * 0.3); };
ICON.pillow = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.9, y - s * 0.5, s * 1.8, s); ctx.fillStyle = '#ffd23f'; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.fillRect(x + a * s * 0.9 - 2, y + b * s * 0.5 - 2, 4, 4); };
ICON.ribbon = (x, y, s) => { ctx.fillStyle = '#3d7bff'; ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.6, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.5, y, s * 0.35, s); ctx.fillRect(x + s * 0.15, y, s * 0.35, s); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.25, 0, 7); ctx.fill(); };
ICON.ticket = (x, y, s) => { ctx.fillStyle = '#7ff5e6'; ctx.fillRect(x - s, y - s * 0.5, s * 2, s); ctx.fillStyle = '#1b4a6a'; ctx.fillRect(x - s * 0.7, y - s * 0.15, s * 1.4, s * 0.3); };
ICON.lantern = (x, y, s) => { ctx.fillStyle = '#333'; ctx.fillRect(x - s * 0.6, y - s * 0.9, s * 1.2, s * 0.25); ctx.fillStyle = '#fff3a0'; ctx.fillRect(x - s * 0.5, y - s * 0.6, s, s * 1.2); };
ICON.whisk = (x, y, s) => { ctx.strokeStyle = '#d0d0d8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s, y + s); ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + s * 0.4, y - s * 0.4, s * 0.5, s * 0.8, -0.8, 0, 7); ctx.stroke(); };
ICON.cake = (x, y, s) => { ctx.fillStyle = '#ff8fc8'; ctx.fillRect(x - s, y, s * 2, s * 0.8); ctx.fillStyle = '#ffe6b0'; ctx.fillRect(x - s * 0.7, y - s * 0.6, s * 1.4, s * 0.6); ctx.fillStyle = '#fff'; ctx.fillRect(x - s, y - 2, s * 2, 4); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - 2, y - s, 4, s * 0.4); };
ICON.pie = (x, y, s) => { ctx.fillStyle = '#d9a35f'; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff8fc8'; ctx.beginPath(); ctx.ellipse(x, y - 2, s * 0.8, s * 0.35, 0, 0, 7); ctx.fill(); };
const TOASTS = [[E.mix - 1, '+1 Turbo-Oven', 'plank'], [E.sugar + 2, '+1 Shard Sugar (??)', 'shard'], [E.reveal + 2, '+1 Cake (alive)', 'cake'], [E.award + 2, 'Bloop: GOLDEN WHISK', 'whisk']];
const FEATS = [[E.poof + 3, 'Flour Power', 'Explode an oven'], [E.alive + 2, 'Secret Ingredient', 'Bake something with feelings'], [E.crunch + 2, 'Built Different', 'Bake a cake nobody can eat'], [E.award + 3, 'Underdog', 'Help Bloop win something']];
const POPS = [[E.ovenB + 2, 1.4, 'TURBO-OVEN', 0.62, 0.3, '#ffe066', 70], [E.test + 1.5, 1.2, 'rumble...', 0.6, 0.4, '#ffffff', 56], [E.poof, 1.6, 'POOF', 0.6, 0.35, '#ffffff', 120], [E.letter + 0.4, 1.2, 'mail!', 0.4, 0.4, '#ffe066', 64], [E.sugar + 1, 1.4, 'sparkle', 0.5, 0.35, '#5ff7ff', 64],
  [E.judgeIn + 1, 1.8, '*monocle adjust*', 0.5, 0.25, '#ffd23f', 56], [E.bake, 1.4, 'DING! BAKE!', 0.5, 0.3, '#ffe066', 96], [E.egg + 1, 1.2, 'splat', 0.5, 0.42, '#ffd23f', 70], [E.brick + 2, 1.4, 'tap tap tap', 0.5, 0.4, '#ffffff', 56], [E.sugar2, 1.4, 'just a pinch', 0.4, 0.35, '#5ff7ff', 56],
  [E.glow, 1.6, 'hummmm', 0.42, 0.42, '#c08aff', 70], [E.ding, 1.4, 'DING', 0.5, 0.3, '#ffe066', 100], [E.judgeDuke + 2, 1.6, '8/10', 0.5, 0.3, '#7cff6b', 96], [E.judgeLump + 2, 1.6, '4/10 (asleep)', 0.5, 0.3, '#ffa02a', 70], [E.judgeBrick + 2, 1.4, 'CRACK', 0.5, 0.35, '#ffffff', 100],
  [E.judgeBrick + 4, 1.6, '2/10. it is a brick.', 0.5, 0.3, '#ff6b6b', 56], [E.reveal, 1.4, 'TA-DA?', 0.4, 0.3, '#ff8fc8', 90], [E.alive, 1.2, 'blink', 0.4, 0.4, '#ffffff', 60], [E.chomp1 + 0.6, 1.4, 'CHOMP', 0.5, 0.35, '#ff8fc8', 110], [E.chomp2 + 0.6, 1.4, 'CHOMP', 0.6, 0.35, '#ff8fc8', 110],
  [E.panic + 0.4, 1.4, '*faints*', 0.4, 0.45, '#d9a35f', 64], [E.burst, 1.6, 'KABOOM', 0.5, 0.25, '#ff8fc8', 110], [E.square + 1.4, 1.4, 'THUD', 0.4, 0.4, '#ffffff', 110], [E.stomp, 1.6, 'ROAAAR', 0.4, 0.3, '#ff8fc8', 96], [E.frost + 1.2, 1.4, 'SPLAT', 0.6, 0.4, '#fff4fa', 110],
  [E.whisk + 1, 1.2, 'clang', 0.5, 0.4, '#d0d0d8', 70], [E.whisk + 3, 1.2, 'CLANG', 0.5, 0.35, '#d0d0d8', 80], [E.leggyBite, 1.4, 'NOM', 0.3, 0.4, '#ff8fc8', 100], [E.feast + 1, 1.6, 'nom nom nom', 0.5, 0.3, '#ff8fc8', 70], [E.fights, 1.6, 'FROSTING CANNON', 0.5, 0.25, '#fff4fa', 64],
  [E.crunch + 0.2, 1.6, 'CRUNCH', 0.5, 0.35, '#b5652e', 120], [E.cry, 1.6, 'waaah', 0.4, 0.3, '#5ff7ff', 80], [E.award, 1.8, 'WINNER: BLOOP', 0.5, 0.25, '#ffd23f', 84], [E.photo + 6, 1.4, 'CLICK', 0.5, 0.3, '#ffffff', 90], [E.notice, 1.4, '...', 0.3, 0.4, '#ffffff', 90],
  [E.piegrab + 2.6, 1.4, 'a pie.', 0.62, 0.4, '#ff8fc8', 70], [E.chase + 2, 1.4, 'NO NO NO', 0.5, 0.3, '#ff6b6b', 90], [E.throwPie, 1.6, 'YEET', 0.4, 0.3, '#ff8fc8', 110]];

const ZOOMS = [[E.poof, 0.8, 1.12, 0.5, 0.5], [E.alive, 1.0, 1.2, 0.5, 0.5], [E.judgeBrick + 2, 0.8, 1.15, 0.5, 0.45], [E.crunch, 1.0, 1.15, 0.5, 0.5], [E.notice, 1.0, 1.2, 0.5, 0.5]];
const SHAKES = [[E.poof, 1, 0.3], [E.chomp1 + 0.6, 0.5, 0.12], [E.chomp2 + 0.6, 0.5, 0.15], [E.burst, 1.4, 0.4], [E.square + 1.4, 1, 0.5], [E.stomp, 4, 0.08], [E.fights, 6, 0.06], [E.crunch, 0.6, 0.3]];
const FLASH = [[E.poof, 0.5, '255,255,255'], [E.sugar2, 0.25, '160,250,255'], [E.burst, 0.3, '255,160,220'], [E.photo + 6, 0.3, '255,255,255']];
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
    outlined('EPISODE 23', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE BAKE-OFF', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the cake fights back)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 24: THE LIGHTHOUSE' : 'EP 22: THE GHOST TRAIN', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the light is a fish)' : '(next stop: AAAAH)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.tent, yard, 'yard'], [E.tent, E.square, tent, 'tent'], [E.square, 1e9, square, 'square']];
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
  const panic = win(T, E.panic, E.burst + 2) || win(T, E.stomp, E.stomp + 3) || win(T, E.fights, E.fights + 6) || win(T, E.chase, E.freeze);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, E.ovenB, E.mix) || win(T, E.bake + 4, E.ovenIn)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    stamp(T, E.poof + 1, 'TEST CAKE: FAILED');
    stamp(T, E.alive + 1.4, 'CAKE STATUS: ALIVE');
    stamp(T, E.crunch + 1.4, 'TEETH: 0');
    drawLetter(T);
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. it fights back.', 0, 0, 56, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("pie: 1. me: 0.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(it was a fair hit)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
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
