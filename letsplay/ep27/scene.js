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

// ---------------------------------------------------------------- Ep 24 helpers: Lumen the lantern-fish, Barnaby the keeper, the lighthouse, the boat, the yacht, rain
function hide23() { hideOld(); [whisk, fork, shardJar, bowl, goldWhisk, brickCake, pie, egg.parent, yolk, envelope, crumbs.root, judge23.root].forEach(o => o.visible = false); [duke, ...lumpy, ...fans].forEach(c => c.root.visible = false); }
const lureM = new THREE.MeshBasicMaterial({ color: '#fff3a0' });
function makeLumen() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), sk = '#1e5a6a';
  box(2.0, 1.3, 1.6, sk, 0, 0, 0, body); box(1.8, 0.4, 1.4, '#7fb8b0', 0, -0.5, 0.05, body); box(0.12, 0.6, 1.0, '#2a7a8a', 0, 0.85, -0.2, body);
  for (const x of [-0.62, 0.62]) { box(0.5, 0.5, 0.06, '#ffffff', x, 0.3, 0.81, body); } const pupils = [-0.62, 0.62].map(x => box(0.24, 0.26, 0.07, '#111', x, 0.28, 0.84, body));
  const jaw = pivot(body, 0, -0.3, 0.8); box(1.9, 0.4, 0.3, '#174a58', 0, -0.2, 0.05, jaw); for (let i = 0; i < 7; i++) box(0.12, 0.2, 0.08, '#ffffff', -0.8 + i * 0.27, 0.05, 0.2, jaw); for (let i = 0; i < 6; i++) box(0.1, 0.16, 0.08, '#ffffff', -0.68 + i * 0.27, -0.42, 0.82, body);
  const tail = pivot(body, 0, 0, -0.8); box(0.1, 1.2, 0.9, '#2a7a8a', 0, 0, -0.45, tail); const fins = [-1, 1].map(s => { const p = pivot(body, s * 1.0, -0.1, 0.1); box(0.5, 0.06, 0.6, '#2a7a8a', s * 0.25, 0, 0, p); return p; });
  const lure = pivot(body, 0, 0.65, 0.5); box(0.08, 1.0, 0.08, '#2a7a8a', 0, 0.5, 0, lure); const tip = pivot(lure, 0, 1.0, 0); box(0.08, 0.08, 0.7, '#2a7a8a', 0, 0, 0.35, tip); const bulb = box(0.42, 0.42, 0.42, 0, 0, -0.1, 0.75, tip, lureM);
  const light = new THREE.PointLight('#fff1a0', 20, 16, 1.3); bulb.add(light); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, pupils, jaw, tail, fins, lure, tip, bulb, light }; }
function poseLumen(f, t, p, yaw, o = {}) { const m = o.mood ?? 0.5, ex = o.excited || 0; f.root.position.set(p[0], p[1] + Math.sin(t * (1.5 + ex * 6)) * (0.12 + ex * 0.3), p[2]); f.root.rotation.set(o.roll || 0, yaw + Math.sin(t * 0.8) * 0.2 + (o.spin ? t * 8 : 0), o.flip || 0);
  f.tail.rotation.y = Math.sin(t * (4 + m * 6 + ex * 16)) * (0.3 + m * 0.3); f.fins.forEach((q, i) => q.rotation.z = Math.sin(t * (5 + ex * 10) + i * PI) * 0.4); f.body.rotation.x = m < 0.3 ? 0.25 : 0;
  f.jaw.rotation.x = o.chomp ? Math.abs(Math.sin(t * 9)) * 0.7 : m > 0.7 ? 0.25 : 0.05; f.lure.rotation.x = (m < 0.3 ? 0.7 : 0) + Math.sin(t * 2) * 0.1 + (ex ? Math.sin(t * 12) * 0.4 : 0); f.pupils.forEach(q => q.scale.y = m < 0.3 ? 0.35 : 1);
  const pw = clamp(o.power ?? m, 0, 3); lureM.color.setRGB(1, 0.85 + Math.min(1, pw) * 0.15, 0.45 + Math.min(1, pw) * 0.4).multiplyScalar(0.35 + Math.min(1, pw) * 0.65); f.light.intensity = 6 + pw * 40; f.bulb.scale.setScalar(0.8 + Math.min(pw, 2) * 0.3); }
const lumen = makeLumen();
function makePelican() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(0.9, 1.2, 1.1, '#f4f4f0', 0, 1.3, 0, body); const hd = pivot(body, 0, 2.0, 0.2); box(0.6, 0.6, 0.6, '#f4f4f0', 0, 0.2, 0, hd); for (const x of [-0.18, 0.18]) box(0.1, 0.12, 0.04, '#111', x, 0.3, 0.31, hd);
  const beak = pivot(hd, 0, 0.1, 0.3); box(0.3, 0.14, 1.2, '#ff9a2a', 0, 0.05, 0.6, beak); const pouch = box(0.28, 0.4, 0.9, '#ffb86a', 0, -0.18, 0.5, beak);
  const cap = pivot(hd, 0, 0.55, 0); box(0.64, 0.2, 0.64, '#1b2a4a', 0, 0, 0, cap); box(0.66, 0.06, 0.4, '#1b2a4a', 0, -0.08, 0.4, cap); box(0.65, 0.06, 0.65, '#ffffff', 0, 0.08, 0, cap);
  const wL = pivot(body, -0.5, 1.7, 0), wR = pivot(body, 0.5, 1.7, 0); box(0.12, 0.9, 0.8, '#e0e0dc', 0, -0.4, 0, wL); box(0.12, 0.9, 0.8, '#e0e0dc', 0, -0.4, 0, wR);
  const lL = pivot(root, -0.22, 0.7, 0), lR = pivot(root, 0.22, 0.7, 0); for (const l of [lL, lR]) { box(0.12, 0.7, 0.12, '#ff9a2a', 0, -0.35, 0, l); box(0.3, 0.06, 0.4, '#ff9a2a', 0, -0.68, 0.1, l); }
  const bag = pivot(beak, 0, -0.4, 1.0); box(0.6, 0.5, 0.3, '#8a3a2a', 0, -0.2, 0, bag); const keys = box(0.2, 0.3, 0.05, '#ffd23f', 0, -0.3, 1.1, beak);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, hd, beak, pouch, wL, wR, lL, lR, bag, keys }; }
function posePelican(b, t, p, yaw, o = {}) { const w = o.walk || 0; b.root.position.set(p[0], p[1], p[2]); b.root.rotation.set(o.fly ? 0.3 : 0, yaw, 0);
  const fl = o.fly ? Math.sin(t * 14) * 1.1 : o.flap ? Math.sin(t * 10) * 0.6 : 0.1; b.wL.rotation.z = -fl - (o.fly ? 0.4 : 0); b.wR.rotation.z = fl + (o.fly ? 0.4 : 0); b.lL.rotation.x = Math.sin(t * 8) * 0.6 * w; b.lR.rotation.x = -Math.sin(t * 8) * 0.6 * w;
  b.beak.rotation.x = o.talk ? -Math.abs(Math.sin(t * 9)) * 0.35 : 0; b.hd.rotation.set(o.nod ? Math.sin(t * 4) * 0.2 : 0, o.look || 0, 0); b.bag.visible = !!o.bag; b.keys.visible = !!o.keys; }
const barnaby = makePelican();
// the beam (bay exterior) and the inner beam (lamp room)
const beamM = new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
function makeBeam(len, w) { const p = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(w, w, len), beamM); b.position.z = len / 2; p.add(b); const b2 = b.clone(); b2.rotation.y = 0; b2.position.z = -len / 2; p.add(b2); return p; }
const beamBay = makeBeam(90, 3), beamRoom = makeBeam(30, 0.7);
// Bloop's motorboat, Duke's yacht, the disco reflector, shrimp bucket, rain
function makeBoat() { const g = new THREE.Group(); box(2.4, 0.6, 4.6, '#c08a40', 0, 0.1, 0, g); for (const x of [-1.2, 1.2]) box(0.16, 0.5, 4.6, '#8a5a2b', x, 0.6, 0, g); box(2.4, 0.5, 0.16, '#8a5a2b', 0, 0.6, -2.3, g); box(1.2, 0.5, 0.6, '#8a5a2b', 0, 0.4, 2.4, g);
  const mot = pivot(g, 0, 0.4, -2.6); box(0.6, 0.8, 0.6, '#ffd400', 0, 0.3, 0, mot); box(0.62, 0.2, 0.62, '#e8344e', 0, 0.6, 0, mot); box(0.1, 0.8, 0.1, '#555', 0, -0.4, 0, mot); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { g, mot }; }
const boat = makeBoat();
function makeYacht() { const g = new THREE.Group(); box(5, 1.4, 12, '#f4f4f0', 0, 0.4, 0, g); box(4.4, 0.2, 11, '#ff9ad0', 0, 1.15, 0, g); box(3.2, 2, 4, '#ffe8f4', 0, 2.2, -2.4, g); box(3.4, 0.3, 4.2, '#ff6fb8', 0, 3.3, -2.4, g); box(0.2, 5, 0.2, '#c0c0c8', 0, 4.8, 1, g); box(0.1, 1, 1.8, '#ff6fb8', 0, 6.4, 1.9, g);
  box(1.2, 0.8, 0.2, 0, -1.2, 2.4, -0.38, g, glowY); box(1.2, 0.8, 0.2, 0, 1.2, 2.4, -0.38, g, glowY); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const yacht = makeYacht();
const disco = new THREE.Group(); { const cols = ['#ffffff', '#c8d8ff', '#ffe8f8', '#d8fff8']; for (let i = 0; i < 26; i++) { const a = i / 26 * PI * 2, y = (i % 3 - 1) * 0.3; box(0.28, 0.28, 0.06, 0, Math.cos(a) * 0.5, y, Math.sin(a) * 0.5, disco, new THREE.MeshBasicMaterial({ color: cols[i % 4] })).lookAt(0, y, 0); } box(0.85, 0.85, 0.85, '#9aa4bd', 0, 0, 0, disco); box(0.04, 2, 0.04, '#ccc', 0, 1.4, 0, disco); }
const bucket24 = new THREE.Group(); box(0.6, 0.6, 0.6, '#3d7bff', 0, 0, 0, bucket24); const shrimp = []; for (let i = 0; i < 5; i++) shrimp.push(box(0.14, 0.12, 0.3, '#ff8a6a', -0.2 + (i % 3) * 0.2, 0.34, -0.1 + (i >> 1) * 0.15, bucket24)); const boot24 = box(0.3, 0.4, 0.5, '#5a3a22', 0, 0.4, 0, bucket24);
hero.aR.add(bucket24); bucket24.position.set(0, -0.95, 0.2);
const rainMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.04, 0.9, 0.04), new THREE.MeshBasicMaterial({ color: '#a8c8ff', transparent: true, opacity: 0.5, fog: false }), 400); rainMesh.frustumCulled = false;
function updateRain(t, c, on) { rainMesh.visible = on; if (!on) return; for (let i = 0; i < 400; i++) { const x = (hash2(i, 1, 7) - 0.5) * 40, z = (hash2(i, 2, 7) - 0.5) * 40, y = 20 - ((t * 24 + hash2(i, 3, 7) * 20) % 20);
  _m.compose(_p.set(c[0] + x, c[1] - 6 + y, c[2] + z), _q.setFromEuler(_e.set(0.2, 0, 0.15)), _s.set(1, 1, 1)); rainMesh.setMatrixAt(i, _m); } rainMesh.instanceMatrix.needsUpdate = true; }
// HUD: light power; the keeper's rules
const powerAt = t => t < E.lamp ? null : t < E.reveal ? 0.6 : t < E.jokes ? lerp(0.6, 0.3, seg(t, E.sad, E.storm)) : t < E.disco ? 0.25 : t < E.dance ? 0.15 : t < E.feed ? 0.35 : t < E.leggy ? 0.7 : t < E.discoUse ? 1 : t < E.calm ? 2 : t < E.excite ? 1 : Math.min(3, 1 + seg(t, E.excite, E.excite + 6) * 2);
function drawLight(t) { const v = powerAt(t); if (v === null || t >= E.freeze) return; rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(10,24,40,.78)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff3a0'; ctx.stroke(); outlined('LIGHT POWER', 132, 114, 15, '#fff3a0', '#000', 3);
  rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const pc = Math.min(1, v); rrect(36, 130, Math.max(16, 192 * pc), 20, 8); ctx.fillStyle = v > 1.5 ? (Math.floor(t * 8) % 2 ? '#ffffff' : '#ffe066') : v > 0.6 ? '#ffe066' : v > 0.3 ? '#ffa02a' : '#ff4a5a'; ctx.fill();
  outlined(Math.round(v * 100) + '%' + (v > 1.5 ? '  TOO BRIGHT' : v < 0.3 ? '  (fish sad)' : ''), 132, 168, 16, '#fff', '#000', 4); }
function drawRules(T) { const k = ss(seg(T, E.keys + 0.6, E.keys + 1)) * (1 - ss(seg(T, E.fly - 0.6, E.fly - 0.2))); if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H / 2 - 20 + (1 - k) * 60); ctx.rotate(-0.03); ctx.fillStyle = '#f6efe0'; ctx.fillRect(-220, -180, 440, 340); ctx.fillStyle = '#1b2a4a'; ctx.fillRect(-220, -180, 440, 56);
  outlined("KEEPER'S RULES", 0, -152, 30, '#ffffff', '#1b2a4a', 3); ctx.font = F(24); ctx.textAlign = 'left'; const R = [[1.2, '1. Keep the light ON.', '#22305a'], [2.6, '2. Feed Lumen.', '#22305a'], [4.0, '3. Do NOT let Lumen', '#c0182a'], [4.0, '    get EXCITED.', '#c0182a']];
  R.forEach(([d, s, c], i) => { if (T < E.keys + d) return; ctx.fillStyle = c; ctx.fillText(s, -190, -70 + i * 50); }); if (T > E.keys + 5.6) outlined('(who is Lumen?)', 0, 136, 18, '#777', '#f6efe0', 2); ctx.restore(); }

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

// ---------------------------------------------------------------- Ep 27 helpers: the Bloopmobile, Officer Coney + the cone cousins, the two shards, the treadmill road
function hide26() { hide25(); [owl.root, rex.root, cart26, vaseA, vaseB, vaseShards, rexPile, boneT, skullF, paintP].forEach(o => o.visible = false); }
TX.asphalt = ctex(16, noisy(['#3a3a42', '#34343c', '#404048', '#2e2e36']), 2701);
TX.mesa = ctex(16, (g, r, n) => { noisy(['#c8643a', '#d0703e', '#b85a34', '#c86a40'])(g, r, n); g.fillStyle = '#e8a060'; g.fillRect(0, 4, 16, 2); g.fillStyle = '#9a4428'; g.fillRect(0, 11, 16, 2); }, 2702);
TX.cactus = ctex(16, (g, r, n) => { noisy(['#3c8a3a', '#347a32', '#449a42'])(g, r, n); g.fillStyle = '#e8f0b0'; for (let i = 0; i < 6; i++) g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1, 1); }, 2703);
TX.dune = ctex(16, noisy(['#f0d090', '#e8c482', '#f6dca0', '#e2bc78']), 2704);
MAT.asphalt = lam(TX.asphalt); MAT.mesa = lam(TX.mesa); MAT.cactus = lam(TX.cactus); MAT.dune = lam(TX.dune);
// treadmill: the world scrolls past a parked camera rig. scroll = periodic scenery (period P), local = one-off props at absolute road distance
function lane27(g, P = 32) { const scroll = pivot(g, 0, 0, 0), local = pivot(g, 0, 0, 0); return { scroll, local, at(d) { scroll.position.z = -(((d % P) + P) % P); local.position.z = -d; } }; }
// distance travelled from a speed curve K = [[t, v], ...]
function dist27(K, t0, t1) { const dt = 0.05, n = Math.ceil((t1 - t0) / dt) + 2, D = new Float64Array(n); for (let i = 1; i < n; i++) { const a = t0 + (i - 1) * dt; D[i] = D[i - 1] + (lerpK(K, a) + lerpK(K, a + dt)) * 0.5 * dt; }
  return t => { const u = clamp((t - t0) / dt, 0, n - 1.001), i = Math.floor(u); return lerp(D[i], D[i + 1], u - i); }; }
const SEAT27 = { h: [-1.0, 1.4, 1.2], l: [1.0, 0.6, -0.5], b: [-1.15, 1.6, -2.0] };
const seat27 = (vp, vy, l, bob = 0) => { const q = wl(vp, vy, l); q[1] += bob; return q; };
// two-sided signboard on posts
function board27(lines, w, h, parent, x, y, z, ry = 0, bg = '#f6e7c1', fg = '#8a1020', cw = 512, ch = 192, size = 54, posts = true) { const p = pivot(parent, x, 0, z); p.rotation.y = ry; const mat = txtMat26(lines, cw, ch, bg, fg, size);
  box(w + 0.3, h + 0.3, 0.2, '#5a3a22', 0, y, 0, p); plane26(w, h, mat, p, 0, y, 0.11); plane26(w, h, mat, p, 0, y, -0.11, PI);
  if (posts) for (const s of [-1, 1]) box(0.25, y, 0.25, '#5a3a22', s * w * 0.35, y / 2, 0, p); return p; }
function card27(lines, bg, fg) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), txtMat26(lines, 192, 112, bg, fg, 32)); m.material.side = THREE.DoubleSide; const gr = new THREE.Group(); gr.add(m); return gr; }
function shack27(parent, x, z, lines, col = '#c08a40') { const p = pivot(parent, x, 0.5, z); box(4.4, 3, 3.2, col, 0, 1.5, 0, p); box(5, 0.4, 3.8, '#c0182a', 0, 3.2, 0, p); box(4.8, 0.15, 1.0, '#ffffff', 0, 2.4, -2.0, p);
  box(1.6, 1.0, 0.06, '#5ff7ff', -0.9, 1.6, -1.62, p); box(0.9, 1.8, 0.06, '#6a4020', 1.2, 0.9, -1.62, p); box(3.8, 1.0, 0.15, '#5a3a22', 0, 3.95, -0.9, p);
  plane26(3.6, 0.8, txtMat26(lines, 384, 84, '#ffe066', '#c0182a', 50), p, 0, 3.95, -0.99, PI); return p; }
// ---- the Bloopmobile (Bloop-built, open-top, 300-mile warranty)
const vanLightM = new THREE.MeshBasicMaterial({ color: '#fff4b0' });
function makeVan() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), teal = '#2ec4b6', yel = '#ffd23f', wheels = [];
  box(4.0, 0.5, 7.4, '#3a3a44', 0, 0.85, 0, body);
  box(0.2, 1.1, 5.8, teal, -1.9, 1.65, -0.7, body); box(0.22, 0.18, 5.82, yel, -1.9, 1.8, -0.7, body);
  box(0.2, 1.1, 3.4, teal, 1.9, 1.65, -1.9, body); box(0.22, 0.18, 3.42, yel, 1.9, 1.8, -1.9, body);
  const door = pivot(body, 1.9, 1.1, -0.2); box(0.2, 1.1, 2.4, teal, 0, 0.55, 1.2, door); box(0.22, 0.18, 2.42, yel, 0, 0.7, 1.2, door); box(0.08, 0.12, 0.3, '#c0c0c8', 0.12, 0.8, 2.0, door);
  box(4.0, 1.1, 0.2, teal, 0, 1.65, -3.6, body); box(4.02, 0.18, 0.22, yel, 0, 1.8, -3.6, body);
  box(3.8, 0.7, 1.5, teal, 0, 1.45, 2.95, body); box(3.82, 0.12, 1.52, yel, 0, 1.84, 2.95, body); box(0.9, 0.45, 0.06, '#1a1a20', 0, 1.35, 3.72, body);
  for (const x of [-1.35, 1.35]) box(0.6, 0.4, 0.08, 0, x, 1.45, 3.72, body, vanLightM);
  box(4.1, 0.3, 0.3, '#c0c0c8', 0, 0.9, 3.85, body); box(4.1, 0.3, 0.3, '#c0c0c8', 0, 0.9, -3.8, body); box(0.2, 0.2, 0.6, '#888890', -1.4, 0.75, -3.9, body);
  for (const x of [-1.8, 1.8]) box(0.14, 1.2, 0.14, '#e0e0e8', x, 2.4, 2.2, body); box(3.74, 0.14, 0.14, '#e0e0e8', 0, 3.0, 2.2, body);
  const glass = box(3.5, 1.05, 0.04, 0, 0, 2.4, 2.2, body, new THREE.MeshLambertMaterial({ color: '#bfefff', transparent: true, opacity: 0.22, depthWrite: false })); glass.castShadow = false;
  for (const x of [-1.8, 1.8]) box(0.16, 2.1, 0.16, '#e0e0e8', x, 2.15, -2.8, body); box(3.76, 0.16, 0.16, '#e0e0e8', 0, 3.2, -2.8, body);
  box(1.4, 0.6, 1.0, '#c0182a', -0.8, 3.6, -2.8, body); box(1.2, 0.5, 0.9, '#7a5232', 0.7, 3.55, -2.8, body); box(0.9, 0.4, 0.8, '#5ff7ff', -0.2, 4.05, -2.8, body);
  box(1.2, 0.5, 1.0, '#8a5a2b', -1.0, 1.35, 1.2, body); box(1.2, 1.0, 0.2, '#8a5a2b', -1.0, 1.85, 0.6, body); box(1.3, 0.5, 1.1, '#8a5a2b', -1.15, 1.35, -2.0, body);
  const sw = pivot(body, 1.0, 2.15, 1.85); { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.06, 6, 12), new THREE.MeshLambertMaterial({ color: '#222' })); sw.add(ring); box(0.5, 0.08, 0.06, '#222', 0, 0, 0, sw); }
  plane26(3.4, 0.55, txtMat26(['BLOOPMOBILE'], 320, 52, teal, '#ffffff', 40), body, -2.01, 1.45, -0.7, -PI / 2);
  for (const [x, z] of [[-2.05, 2.5], [2.05, 2.5], [-2.05, -2.4], [2.05, -2.4]]) { const w = pivot(root, x, 0.65, z); box(0.4, 1.3, 1.3, '#1a1a1a', 0, 0, 0, w); box(0.44, 0.5, 0.5, '#c0c0c8', 0, 0, 0, w); wheels.push(w); }
  const cap = box(0.08, 0.8, 0.8, '#ffd23f', -0.25, 0, 0, wheels[0]);
  root.traverse(o => { if (o.isMesh && o !== glass) o.castShadow = true; }); return { root, body, door, wheels, cap, sw }; }
function poseVan(v, t, p, yaw, o = {}) { v.root.position.set(...p); v.root.rotation.set(0, yaw, 0); const f = o.flat || 0; v.root.scale.set(1 + f * 0.3, Math.max(0.12, 1 - f * 0.88), 1 + f * 0.15);
  v.body.position.set(0, o.bob || 0, 0); v.body.rotation.set(o.pitch || 0, 0, o.roll2 || 0); v.wheels.forEach(w => w.rotation.x = o.roll || 0); v.sw.rotation.z = o.steer || 0; }
// ---- Officer Coney (a traffic cone with a badge, a moustache and a siren on his hat) + his cousins (regular cones. with faces.)
function makeCone27(s = 1, cop = true) { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), or = '#ff7a1a', wh = '#f8f8f8';
  box(1.1, 0.16, 1.1, '#2a2a30', 0, 0.08, 0, body);
  [[0.9, 0.5, 0.41, or], [0.74, 0.42, 0.87, wh], [0.6, 0.5, 1.33, or], [0.44, 0.36, 1.76, wh], [0.3, 0.2, 2.04, or]].forEach(([w, h, y, c]) => box(w, h, w, c, 0, y, 0, body));
  const eyeW = new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupils = [];
  for (const x of [-0.14, 0.14]) { box(0.16, 0.16, 0.04, 0, x, 1.42, 0.31, body, eyeW); pupils.push(box(0.07, 0.08, 0.04, '#111', x, 1.41, 0.335, body)); }
  const aL = pivot(body, -0.42, 1.1, 0), aR = pivot(body, 0.42, 1.1, 0); for (const a of [aL, aR]) { box(0.14, 0.5, 0.14, or, 0, -0.22, 0, a); box(0.16, 0.14, 0.16, wh, 0, -0.5, 0, a); }
  let siren = null, light = null, pad = null;
  if (cop) { box(0.4, 0.09, 0.08, '#3a2a1a', 0, 1.22, 0.32, body); box(0.56, 0.2, 0.56, '#1a2a5a', 0, 2.22, 0, body); box(0.6, 0.05, 0.34, '#111', 0, 2.12, 0.22, body); box(0.14, 0.12, 0.04, 0, 0, 2.24, 0.29, body, goldM);
    siren = box(0.2, 0.18, 0.2, 0, 0, 2.41, 0, body, new THREE.MeshBasicMaterial({ color: '#ff2a2a' })); light = new THREE.PointLight('#ff2a2a', 0, 16, 1.4); light.position.set(0, 2.7, 0); body.add(light);
    pad = box(0.3, 0.4, 0.05, '#ffffff', 0, -0.6, 0.12, aR); }
  else box(0.3, 0.06, 0.05, '#2a1d14', 0, 1.24, 0.31, body);
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = true; }); return { root, body, aL, aR, pupils, siren, light, pad }; }
function poseCone(c, t, p, yaw, o = {}) { c.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + (o.seed || 0))) * 0.45 : 0), p[2]); c.root.rotation.set(0, yaw, 0);
  c.body.rotation.set(o.lean || 0, 0, o.walk ? Math.sin(t * 10) * 0.1 : o.wobble ? Math.sin(t * 7 + (o.seed || 0)) * 0.15 : 0);
  c.aL.rotation.set(o.cheer ? -2.6 + Math.sin(t * 14) * 0.3 : 0, 0, -0.15);
  c.aR.rotation.set(o.point ? -1.6 : o.stop ? -2.9 + Math.sin(t * 8) * 0.2 : o.write ? -1.0 + Math.sin(t * 16) * 0.12 : o.cheer ? -2.6 + Math.cos(t * 14) * 0.3 : o.whistle ? -2.2 : 0, 0, 0.15);
  c.pupils.forEach(m => m.scale.setScalar(o.wide ? 1.7 : 1));
  if (c.siren) { const on = !!o.siren, ph = Math.floor(t * 6) % 2; c.siren.material.color.set(on ? (ph ? '#ff2a2a' : '#2a6aff') : '#802020'); c.light.intensity = on ? 9 : 0; c.light.color.set(ph ? '#ff2a2a' : '#2a6aff'); c.pad.visible = !!o.pad; } }
const van = makeVan();
const coney = makeCone27(1, true), cousins = Array.from({ length: 6 }, () => makeCone27(0.55, false));
const scooter = new THREE.Group(); { box(0.7, 0.14, 1.8, '#e8344e', 0, 0.45, 0, scooter); for (const z of [-0.75, 0.75]) box(0.16, 0.6, 0.6, '#1a1a1a', 0, 0.3, z, scooter); box(0.1, 1.2, 0.1, '#c0c0c8', 0, 1.1, 0.8, scooter); box(0.9, 0.1, 0.1, '#c0c0c8', 0, 1.7, 0.8, scooter); box(0.3, 0.2, 0.08, 0, 0, 1.4, 0.86, scooter, vanLightM); }
// ---- props: the map (it has a top and a bottom), cards, the marshmallow
const mapM27 = canMat26(160, 112, (g, w, h) => { g.fillStyle = '#f2e6c4'; g.fillRect(0, 0, w, h); g.fillStyle = '#3cc26a'; g.fillRect(10, 50, 22, 16); g.fillRect(126, 40, 20, 22); g.strokeStyle = '#c0182a'; g.lineWidth = 6; g.beginPath(); g.moveTo(80, 22); g.lineTo(58, 42); g.lineTo(100, 70); g.lineTo(80, 94); g.stroke();
  g.fillStyle = '#ff5cf0'; g.beginPath(); g.moveTo(80, 2); g.lineTo(94, 18); g.lineTo(80, 34); g.lineTo(66, 18); g.fill(); g.fillStyle = '#5ff7ff'; g.fillRect(78, 95, 5, 5); g.fillStyle = '#2a1d14'; g.textAlign = 'center'; g.font = 'bold 14px sans-serif'; g.fillText('BIGGEST', 124, 20); g.font = 'bold 9px sans-serif'; g.fillText('smallest', 112, 104); }, 0.3);
mapM27.side = THREE.DoubleSide; const map27 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), mapM27); hero.body.add(map27); map27.position.set(0, 1.3, 0.5); map27.visible = false;
const warr27 = card27(['WARRANTY', '300 MILES'], '#fff8e0', '#2a6a3a'), inv27a = card27(['INVOICE', '1 CAMPFIRE'], '#ffffff', '#c0182a'), inv27b = card27(['INVOICE', '1 VAN (flat)'], '#ffffff', '#c0182a');
for (const c of [warr27, inv27a, inv27b]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const lic27 = card27(['LICENSE', 'LEGGY  :)'], '#e8f4ff', '#2a4a8a'); L6.hd.add(lic27); lic27.position.set(0, -0.45, 1.05); lic27.visible = false;
const tick27 = card27(['PARKING', 'TICKET'], '#ffe066', '#2a1d14'); tick27.visible = false;
const marshM = new THREE.MeshLambertMaterial({ color: '#fffaf0', emissive: '#806040', emissiveIntensity: 0.2 }), burntM = new THREE.MeshLambertMaterial({ color: '#1a1410' });
const marsh27 = new THREE.Group(); box(0.05, 1.1, 0.05, '#8a5a2b', 0, -1.1, 0, marsh27); const marshB = box(0.2, 0.2, 0.2, 0, 0, -1.7, 0, marsh27, marshM); hero.aR.add(marsh27); marsh27.visible = false;
// ---- the shards: the world's smallest (on a velvet cushion, with a magnifying glass) and the world's biggest
const tinyStand = new THREE.Group(); { box(0.9, 1.2, 0.9, '#f0ece4', 0, 1.1, 0, tinyStand); box(0.5, 0.12, 0.5, '#c0182a', 0, 1.76, 0, tinyStand); const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), new THREE.MeshBasicMaterial({ color: '#5ff7ff' })); c.position.y = 1.88; tinyStand.add(c);
  const mg = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), goldM); mg.position.set(0, 2.3, -0.5); tinyStand.add(mg); box(0.06, 1.8, 0.06, 0, 0.5, 1.4, -0.5, tinyStand, goldM);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshLambertMaterial({ color: '#cff4ff', transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); lens.position.set(0, 2.3, -0.5); tinyStand.add(lens); }
const shardM27 = new THREE.MeshLambertMaterial({ color: '#ff5cf0', emissive: '#a01890', emissiveIntensity: 0.55, flatShading: true });
const bigYaw = new THREE.Group(), bigIn = new THREE.Mesh(new THREE.OctahedronGeometry(5, 0), shardM27); bigYaw.add(bigIn); bigIn.castShadow = true; { const l = new THREE.PointLight('#ff5cf0', 6, 30, 1.4); bigYaw.add(l); }
// ---- campfire
const fire27 = new THREE.Group(); { for (const r of [0.6, -0.6]) { const l = box(1.4, 0.22, 0.22, '#6a4020', 0, 0.62, 0, fire27); l.rotation.y = r; } for (let i = 0; i < 7; i++) box(0.3, 0.2, 0.3, '#8a8a90', Math.cos(i * 0.9) * 0.9, 0.6, Math.sin(i * 0.9) * 0.9, fire27); }
const flames27 = [['#ff5a1a', 0.6, 0.9], ['#ff8a2a', 0.42, 1.15], ['#ffd23f', 0.24, 1.38]].map(([c, s, y]) => { const m = box(s, s, s, 0, 0, y, 0, fire27, new THREE.MeshBasicMaterial({ color: c })); m.castShadow = false; return m; });
const fireL27 = new THREE.PointLight('#ff9a40', 0, 24, 1.3); fireL27.position.set(0, 1.6, 0); fire27.add(fireL27);
// ---- HUD: miles to the Biggest Shard, fuel, and how many times I asked
const ASK27 = [E.rtAreWe1, E.rtAreWe1 + 2.2, E.rtAreWe1 + 4.2, E.rtAreWe2, E.rtAreWe2 + 1.6, E.rtArrive - 1, E.rtRun + 9, E.rtRun + 10.4, E.rtRun + 11.6, E.rtLot + 1];
function milesAt27(t) { if (t < E.rtTwist + 1) return Math.round(lerpK([[E.rtGo, 300], [E.rtArrive, 0]], t)); return Math.round(lerpK([[E.rtRun, 300], [E.rtLot, 0]], t)); }
function drawRoadHUD(t) { if (t >= E.freeze || t < E.rtGo - 2) return; const mi = milesAt27(t), tw = win(t, E.rtTwist + 1, E.rtTwist + 4) && Math.floor(t * 6) % 2;
  rrect(22, 96, 230, 124, 12); ctx.fillStyle = 'rgba(14,30,40,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = tw ? '#ff6b6b' : '#5ff7ff'; ctx.stroke();
  outlined(t >= E.rtLot ? 'BIGGEST SHARD: HERE' : 'BIGGEST SHARD', 137, 113, 15, '#5ff7ff', '#000', 3); outlined(t >= E.rtLot ? '0 mi' : mi + ' mi', 137, 140, 26, tw ? '#ff6b6b' : '#fff', '#000', 5);
  const legs = t >= E.rtLift, fuel = legs ? 1 : clamp(lerpK([[E.rtGo, 1], [E.rtSput, 0]], t), 0, 1), lo = !legs && fuel < 0.2 && Math.floor(t * 4) % 2;
  outlined(legs ? 'LEGS' : 'FUEL', 36, 170, 13, legs ? '#7cff6b' : '#fff', '#000', 3, 'left'); rrect(86, 162, 150, 16, 6); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  if (fuel > 0) { ctx.fillStyle = legs ? '#7cff6b' : lo ? '#ff3a2a' : '#ffd23f'; rrect(88, 164, 146 * fuel, 12, 5); ctx.fill(); } else outlined('E', 161, 170, 16, '#ff3a2a', '#000', 3);
  const n = ASK27.filter(a => t >= a).length, fl = ASK27.some(a => win(t, a, a + 1)); outlined('"are we there yet?" x' + n, 137, 200, 14, fl ? '#ffe066' : '#fff', '#000', 3); }
function drawSiren27(T) { const on = win(T, E.rtSiren, E.rtCop) || win(T, E.rtCone2, E.rtCone2 + 8) || win(T, E.rtCop3, E.rtCop3 + 2.5);
  if (on) { const ph = Math.floor(T * 6) % 2, a = ph ? 'rgba(255,40,40,.32)' : 'rgba(40,90,255,.32)', b = ph ? 'rgba(40,90,255,.32)' : 'rgba(255,40,40,.32)'; const gr = ctx.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, a); gr.addColorStop(0.28, 'rgba(0,0,0,0)'); gr.addColorStop(0.72, 'rgba(0,0,0,0)'); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
  if (win(T, E.rtRun + 2, E.rtLot + 2)) { const mph = Math.round(lerpK([[E.rtRun + 2, 20], [E.rtMph - 2, 70], [E.rtMph, 112], [E.rtLot, 112], [E.rtLot + 2, 30]], T)); rrect(W - 230, H - 160, 200, 74, 14); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill();
    outlined(mph + ' MPH', W - 130, H - 132, 32, mph > 100 ? '#ff6b6b' : '#ffe066', '#000', 5); outlined('(on foot)', W - 130, H - 102, 14, '#fff', '#000', 3); } }

// ================================================================ EPISODE 27: "THE ROAD TRIP (Leggy is driving)" — the open road (Leggy grabs the wheel; the hubcap; I navigate; Officer Coney's cone test) → the desert at sunset (the World's SMALLEST Shard — map was upside down; out of gas; campfire night; Leggy's idea) → Leggy carries the car → the World's Biggest Shard (she parks it)
// ---------------------------------------------------------------- set A: the open road (morning)
const road = (() => {
  const g = mk('road'); const L = lane27(g); const st = new VSet(L.scroll), loc = L.local;
  for (let x = -36; x <= 36; x++) for (let z = -80; z <= 112; z++) { const ax = Math.abs(x), zm = ((z % 32) + 32) % 32;
    st.add(x, 0, z, ax <= 3 ? (x === 0 && (zm & 3) < 2 ? 'quartz' : 'asphalt') : ax === 4 ? 'path' : 'turf'); if (ax > 16 && hash2(x, zm, 27) > 0.82) st.add(x, 1, z, 'turf'); }
  for (let k = -3; k <= 3; k++) for (const [z0, side, h] of [[3, 1, 5], [11, -1, 6], [19, 1, 6], [27, -1, 5], [7, -1, 7], [23, 1, 7]]) { const z = z0 + k * 32; if (z < -78 || z > 110) continue; tree20(st, side * (9 + Math.floor(hash2(z0, side, 3) * 8)), z, h, false); }
  st.build();
  const D = dist27([[0, 0], [E.rtGo, 0], [E.rtGo + 3, 14], [E.rtBump - 0.4, 14], [E.rtBump, 9], [E.rtBump + 3, 14], [E.rtTurn - 1, 14], [E.rtTurn + 1, 10], [E.rtSiren, 13], [E.rtPull - 0.5, 0], [E.rtTest, 0], [E.rtTest + 2, 5], [E.rtPass - 2, 5], [E.rtPass - 0.5, 0], [E.rtGo2, 0], [E.rtGo2 + 3, 16], [E.rtDesert + 1, 16]], 0, E.rtDesert + 1);
  const zT = D(E.rtTest);
  for (const x of [-5.5, 5.5]) box(0.3, 6, 0.3, '#8a5a2b', x, 3, 12, loc); { const m = txtMat26(['ROAD TRIP!'], 512, 96, '#ffe066', '#c0182a', 64); plane26(11, 1.6, m, loc, 0, 5.4, 12.05, 0); plane26(11, 1.6, m, loc, 0, 5.4, 11.95, PI); }
  board27(["WORLD'S BIGGEST SHARD", '300 MI AHEAD'], 7, 2.6, loc, 10, 4.2, D(E.rtAreWe1) + 26, 0.25, '#2a6aff', '#ffffff', 512, 192, 52);
  board27(['SPEED LIMIT', '6 LEGS'], 2.4, 1.6, loc, -6.6, 2.4, D(E.rtAreWe1 + 4) + 18, 0, '#ffffff', '#111111', 256, 160, 40);
  box(0.9, 0.45, 0.9, '#7a7a80', -2.05, 0.72, D(E.rtBump) + 2.5, loc);
  board27(['<- BIGGEST', 'SMALLEST ->'], 3.6, 1.6, loc, -6.5, 2.6, D(E.rtTurn) + 12, -0.3, '#ffffff', '#2a1d14', 384, 192, 60);
  burst(E.rtVan, [0, 3, 0], { n: 60, colors: ['#ffe066', '#2ec4b6', '#ffffff'], speed: 5, size: 0.14, life: 1.2, grav: 3, up: 3 });
  burst(E.rtBump, [-2.3, 1, 2.5], { n: 30, colors: ['#9a9490', '#c8c0b8'], speed: 3, size: 0.18, life: 0.8, grav: 6, up: 2 });
  burst(E.rtPass + 0.5, [3, 2.6, 1], { n: 50, colors: ['#ffe066', '#7cff6b', '#ffffff'], speed: 4, size: 0.12, life: 1.2, grav: 2, up: 3 });
  const C = [[0, -9, 5, -13, 0, 2, 2, 56], [4.9, -7.5, 4.4, -10, 0, 2, 1, 52], [5, 7.5, 3, 12.5, 1.5, 1.8, 2, 50], [10.9, 8.5, 3.4, 10.5, 1.5, 1.6, 1, 48],
    [11, 10, 3.6, 2, 1.5, 1.6, 0.5, 54], [14.9, 9.4, 3.3, 1.2, 2.5, 1.8, 0.5, 48], [15, 1.0, 5.4, 4.6, 1.0, 1.7, -0.6, 52], [18.4, 1.2, 5.0, 4.0, 1.0, 1.8, -0.8, 46],
    [18.5, -9, 4, -6, -1, 1.2, -1, 52], [21.9, -9, 3.8, -3, -2, 1.4, 1, 48], [22, -4.5, 3.0, 6.5, -1.8, 2.0, 1.2, 46], [26.9, -4.2, 2.8, 6.0, -1.6, 2.1, 0.8, 42],
    [27, 0, 6, -15, 0, 2, 4, 58], [33.9, 0.5, 4.2, -11, 0, 2.2, 3, 54], [34, 12, 3, 9, 0, 1.6, 0, 50], [37.9, 11, 2.6, 5, 0, 1.8, 0, 50],
    [38, -1.6, 3.6, 5.6, -0.6, 2.4, -3, 56], [45.9, -1.2, 3.5, 5.4, -0.4, 2.4, -3, 52], [46, -7, 1.1, 4.5, -2, 1.1, 1, 50], [48.9, -7.4, 1.4, 3.5, -1.6, 1.6, 0, 52],
    [49, -9, 2.2, -3, -2.6, 1.4, 1.5, 50], [54.9, -8.6, 2.4, -0.5, -2.6, 1.4, 2, 48], [55, -1.4, 3.5, 4.6, -1.0, 2.6, 1.4, 46], [59.9, -1.2, 3.4, 4.2, -1.0, 2.6, 1.4, 42],
    [60, 6, 9, -10, 0, 1, 8, 58], [63.9, 4, 8, -8, 0, 1, 8, 56], [64, 0.5, 2.2, -16, 3.5, 1.4, -6, 50], [67.9, 0.5, 2.4, -14, 2.5, 1.6, -3, 48],
    [68, 3.6, 2.6, 6.5, 2.4, 1.9, 0.6, 46], [75.9, 3.8, 2.5, 6.0, 2.4, 1.9, 0.6, 42], [76, 2.6, 3.6, 4.2, 1.0, 2.0, 0.6, 46], [81.9, 2.8, 3.7, 4.6, 1.0, 2.0, 0.8, 50],
    [82, 0, 9, -9, 0, 0.5, 14, 60], [89.9, 0, 10, -8, 0, 0.5, 16, 60], [90, -9, 1.6, 6, 0, 1.4, 0, 50], [95.9, -9, 1.6, 2, 0, 1.4, 0, 50],
    [96, -1.6, 3.6, 5.6, -0.6, 2.4, -3, 56], [99.9, -1.4, 3.5, 5.4, -0.5, 2.4, -3, 54], [100, 3.6, 2.6, 6.5, 2.4, 1.9, 0.6, 46], [103.9, 3.8, 2.5, 6.0, 2.4, 1.9, 0.6, 42],
    [104, -6, 5, -12, 0, 1.5, 4, 56], [E.rtDesert, -5, 4, -10, 0, 1.5, 4, 54]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => parentTo(c.root, loc));
    L6.root.rotation.set(0, 0, 0); L6.body.position.y = 1.3; L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0;
    parentTo(van.door, van.body); van.door.position.set(1.9, 1.1, -0.2); van.door.rotation.set(0, 0, 0); van.door.visible = true;
    const d = D(t), sp = (D(t + 0.05) - d) / 0.05; L.at(d);
    const s = d - zT, amp = t > E.rtTest - 1 && t < E.rtGo2 ? 3 * ss(seg(s, 1, 7)) * (1 - ss(seg(s, 66, 74))) : 0, vx = amp * Math.cos(PI * (s - 8) / 12);
    const vy = amp > 0.01 ? Math.atan(-amp * PI / 12 * Math.sin(PI * (s - 8) / 12)) * 0.8 : win(t, E.rtTurn - 0.5, E.rtTurn + 2) ? Math.sin(seg(t, E.rtTurn - 0.5, E.rtTurn + 2) * PI * 2) * 0.25 : 0;
    const bump = win(t, E.rtBump, E.rtBump + 0.8) ? Math.sin(seg(t, E.rtBump, E.rtBump + 0.8) * PI) * 0.6 : 0, bob = (sp > 0.5 ? Math.abs(Math.sin(t * 9)) * 0.05 : 0) + bump, VP = [vx, 0.5, 0];
    poseVan(van, t, VP, vy, { roll: d / 0.65, bob, pitch: bump * 0.12, steer: vy * 2 + (sp > 1 ? Math.sin(t * 3) * 0.15 : 0) });
    // hubcap: flies off, Bloop catches it, runs alongside, puts it back
    if (t >= E.rtBump && t < E.rtBump + 1.5) { parentTo(van.cap, g); van.cap.position.set(...arcPath(t, [[E.rtBump, -2.3, 1.15, 2.5, 0], [E.rtBump + 1.5, -0.7, 2.6, -1.8, 3]])); van.cap.rotation.set(t * 14, 0, t * 6); }
    else if (t >= E.rtBump && t < E.rtFix1 + 3) { parentTo(van.cap, bloop6.B.aR); van.cap.position.set(0, -0.6, 0.2); van.cap.rotation.set(0, 0, 0); }
    else { parentTo(van.cap, van.wheels[0]); van.cap.position.set(-0.25, 0, 0); van.cap.rotation.set(0, 0, 0); }
    // ---- me
    const hIn = E.rtWarranty - 0.8; map27.visible = win(t, E.rtMap - 1, E.rtTurn + 3); map27.rotation.set(-0.3, PI, PI * ss(seg(t, E.rtMap + 0.8, E.rtMap + 1.6)));
    if (t < hIn) { const hA = act(t, [[0, -6, 0.5, -9], [4.5, -4, 0.5, -2.5], [E.rtSeat, -4, 0.5, -2.5], [E.rtSeat + 1.8, -3.4, 0.5, 5.2], [E.rtSeat + 3.6, 3.4, 0.5, 5.2], [E.rtSeat + 4.6, 3.4, 0.5, 1.6], [E.rtSeat + 5.2, 3.4, 0.5, 1.6],
        [E.rtSeat + 6.8, 3.4, 0.5, -4.6], [E.rtSeat + 8.6, -3.2, 0.5, -4.6], [hIn, -3.2, 0.5, 1.2]], [[0, { face: 'smug', wave: t < 3 }], [E.rtVan, { face: 'smug', yaw: 0.9 }], [E.rtSeat, { face: 'smug' }], [E.rtSeat + 4.6, { face: 'scared', yaw: -PI / 2 }], [E.rtSeat + 5.2, { face: 'normal' }]]);
      pose(hero, { t, ...hA }); }
    else if (t < E.rtWarranty) pose(hero, { t, p: arcPath(t, [[hIn, -3.2, 0.5, 1.2, 0], [E.rtWarranty, ...seat27(VP, vy, SEAT27.h, bob), 1.2]]), yaw: 0, face: 'smug', sit: seg(t, hIn, E.rtWarranty) });
    else { const o = pick(t, [[0, { face: 'smug' }], [E.rtWarranty, { face: 'smug', headYaw: -0.8 }], [E.rtGo, { face: 'smug', wave: t < E.rtGo + 2 }], [E.rtHonk, { face: 'scared' }], [E.rtHonk + 1.5, { face: 'smug' }], [E.rtAreWe1, { face: 'normal', headYaw: 0.7 }],
        [E.rtAreWe1 + 6, { face: 'smug' }], [E.rtBump, { face: 'scared', panic: true }], [E.rtBump + 2, { face: 'normal', headYaw: -0.8 }], [E.rtMap - 1, { face: 'normal', hold: true, headPitch: 0.35 }], [E.rtMap + 3, { face: 'smug', hold: true, headPitch: 0.35 }],
        [E.rtTurn, { face: 'smug', wave: true }], [E.rtTurn + 2, { face: 'smug' }], [E.rtSiren, { face: 'scared', headYaw: -2.4 }], [E.rtPull, { face: 'scared', headYaw: 0.6 }], [E.rtTest, { face: 'scared', panic: true }],
        [E.rtTest + 6, { face: 'scared', lean: -0.2 }], [E.rtTest + 9, { face: 'scared', panic: true }], [E.rtPass, { face: 'smug', headYaw: 0.6 }], [E.rtGo2, { face: 'smug', wave: t < E.rtGo2 + 3 }]]);
      pose(hero, { t, p: seat27(VP, vy, SEAT27.h, bob), yaw: vy, sit: 1, ...o }); }
    // ---- Leggy (she was in the driver's seat before I even got there)
    const lIn = E.rtSeat + 1.5; lic27.visible = win(t, E.rtPass + 0.6, E.rtDesert);
    if (t < lIn) poseLurk(L6, t, [5.5, 0.5, -3 + Math.sin(t * 0.8) * 0.8], -0.6 + Math.sin(t * 0.5) * 0.5, 0.5);
    else if (t < lIn + 1.2) poseLurk(L6, t, arcPath(t, [[lIn, 5.5, 0.5, -3, 0], [lIn + 1.2, ...seat27(VP, vy, SEAT27.l, bob), 2.4]]), lerp(-0.6, 0, seg(t, lIn, lIn + 1.2)), 3);
    else { let ls = sp > 0.5 ? 1.6 : 0.3; if (win(t, E.rtLegs, E.rtWarranty)) ls = 2.6; if (win(t, E.rtTest, E.rtPass)) ls = 3; poseLurk(L6, t, seat27(VP, vy, SEAT27.l, bob), vy, ls);
      if (win(t, E.rtCop, E.rtNoLic + 3)) L6.hd.rotation.y = 0.9 + Math.sin(t * 2) * 0.1; if (win(t, E.rtNoLic, E.rtNoLic + 3)) L6.hd.rotation.x = 0.35;
      if (win(t, E.rtPass, E.rtGo2)) { L6.root.rotation.z = Math.sin(t * 12) * 0.08; L6.hd.rotation.y = 0.9; } }
    // ---- Bloop (keeps his car in one piece. for now.)
    const bIn = E.rtWarranty + 3.5; warr27.visible = win(t, E.rtWarranty, bIn); inv27a.visible = inv27b.visible = false;
    if (t < bIn) { const bA = act(t, [[0, 3.6, 0.5, 6.4], [E.rtWarranty - 3, 3.6, 0.5, 6.4], [E.rtWarranty - 1.4, -3.0, 0.5, 5.0], [E.rtWarranty - 0.2, -3.0, 0.5, 2.0]], [[0, {}]]);
      let by = bA.yaw, bo = { walk: bA.walk, phase: bA.phase * 2 }; if (t < E.rtWarranty - 3) { by = 0.6; bo = { handOut: win(t, E.rtVan, E.rtVan + 5), hop: win(t, E.rtVan, E.rtVan + 1.5) }; } if (t > E.rtWarranty - 0.2) { by = PI / 2; bo = { handOut: true }; }
      poseBurble(bloop6, t, bA.p, by, bo); }
    else if (t < bIn + 1) poseBurble(bloop6, t, arcPath(t, [[bIn, -3.0, 0.5, 2.0, 0], [bIn + 1, ...seat27(VP, vy, SEAT27.b, bob), 1.6]]), PI / 2 * (1 - seg(t, bIn, bIn + 1)), {});
    else if (win(t, E.rtFix1, E.rtFix1 + 4.6)) { const k = t - E.rtFix1, P = k < 1 ? arcPath(t, [[E.rtFix1, ...seat27(VP, vy, SEAT27.b, bob), 0], [E.rtFix1 + 1, -3.4, 0.5, 2.6, 1.4]]) : k < 3.5 ? [-3.4, 0.5, 2.6] : arcPath(t, [[E.rtFix1 + 3.5, -3.4, 0.5, 2.6, 0], [E.rtFix1 + 4.6, ...seat27(VP, vy, SEAT27.b, bob), 1.6]]);
      poseBurble(bloop6, t, P, k > 1 && k < 3.5 ? PI / 2 : 0, { walk: k > 1 && k < 3.5, phase: t * 18, handOut: win(t, E.rtFix1 + 1.6, E.rtFix1 + 3.1) }); }
    else { const o = pick(t, [[0, {}], [E.rtHonk, { hop: t < E.rtHonk + 1 }], [E.rtBump, { angry: true }], [E.rtBump + 1.5, { handOut: true }], [E.rtFix1 + 4.6, { hop: t < E.rtFix1 + 6 }], [E.rtFix1 + 6, {}], [E.rtSiren, { angry: true }], [E.rtPull, { facepalm: true }],
        [E.rtCop, {}], [E.rtTest, { hop: true }], [E.rtPass, { hop: t < E.rtPass + 2 }], [E.rtPass + 2, {}]]);
      poseBurble(bloop6, t, seat27(VP, vy, SEAT27.b, bob), vy, o); }
    // ---- Officer Coney
    const scP = [4.2, 0.5, -8.6], WIN = [3.3, 0.5, 1.0], RIDE = [7.5, 0.5, 0.5]; coney.root.visible = scooter.visible = t >= E.rtSiren;
    if (t >= E.rtSiren) { let sP, cP, cy = 0, co = {}; const back = t > E.rtGo2 ? D(t) - D(E.rtGo2) : 0;
      if (t < E.rtPull) sP = [4.2, 0.5, lerp(-40, -8.6, ss(seg(t, E.rtSiren, E.rtPull)))]; else if (t < E.rtTest - 1.5) sP = scP.slice(); else if (t < E.rtTest + 0.5) sP = L3(scP, RIDE, ss(seg(t, E.rtTest - 1.5, E.rtTest + 0.5)));
      else sP = [RIDE[0], 0.5, RIDE[2] + (t < E.rtPass ? Math.sin(t * 1.3) * 0.4 : 0)];
      if (t < E.rtPull + 0.5 || win(t, E.rtTest - 1.5, E.rtPass - 0.6)) { cP = [sP[0], sP[1] + 0.52, sP[2] - 0.2]; co = { siren: t < E.rtCop, whistle: win(t, E.rtTest, E.rtPass) && Math.floor(t / 2.5) % 2 === 0, wide: win(t, E.rtTest + 6, E.rtTest + 9) }; }
      else if (t < E.rtTest - 1.5) { const a = act(t, [[E.rtPull + 0.5, 4.2, 0.5, -8], [E.rtCop - 0.2, ...WIN], [E.rtNoLic + 3, ...WIN], [E.rtTest - 1.6, 4.2, 0.5, -8.4]], [[0, {}]]); cP = a.p; cy = a.walk ? a.yaw : -PI / 2;
        co = { walk: a.walk, hop: a.walk, siren: t < E.rtCop, write: win(t, E.rtCop + 1, E.rtNoLic), pad: t < E.rtNoLic + 3, wide: win(t, E.rtNoLic, E.rtNoLic + 2), point: win(t, E.rtNoLic + 2, E.rtNoLic + 3) }; }
      else { const a = act(t, [[E.rtPass - 0.6, ...RIDE], [E.rtPass, ...WIN]], [[0, {}]]); cP = a.p; cy = a.walk ? a.yaw : -PI / 2; co = { hop: a.walk, write: win(t, E.rtPass, E.rtPass + 2), pad: t < E.rtPass + 2, cheer: win(t, E.rtPass + 2, E.rtGo2), stop: t > E.rtGo2 }; }
      sP[2] -= back; cP = [cP[0], cP[1], cP[2] - back]; scooter.position.set(...sP); scooter.rotation.set(0, 0, 0); poseCone(coney, t, cP, cy, co); }
    // ---- the cone cousins (do NOT hit the family)
    cousins.forEach((c, i) => { const z = zT + 8 + 12 * i, side = i % 2 ? 1 : -1, into = ss(seg(t, E.rtTest - 4 + i * 0.25, E.rtTest - 3 + i * 0.25)), outk = ss(seg(t, E.rtPass + i * 0.15, E.rtPass + 0.8 + i * 0.15));
      const x = lerp(side * 5.5, 0, into) + outk * side * 5, near = win(t, E.rtTest, E.rtPass) && Math.abs(z - d) < 6;
      poseCone(c, t, [x, 0.5, z], t > E.rtPass ? -side * PI / 2 : PI, { hop: (into > 0 && into < 1) || (outk > 0 && outk < 1) || t > E.rtPass + 1, seed: i, cheer: t > E.rtPass + 1, wide: near, wobble: near }); c.root.visible = true; });
    let cam = camKeys(t, C); if (win(t, E.rtTest + 14, E.rtPass)) { cam = { p: [cam.p[0] + vx, cam.p[1], cam.p[2]], l: [cam.l[0] + vx, cam.l[1], cam.l[2]], fov: cam.fov }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the desert (sunset → campfire night → dawn → Leggy carries the car)
const desert = (() => {
  const g = mk('desert'); const L = lane27(g); const st = new VSet(L.scroll), loc = L.local;
  for (let x = -36; x <= 36; x++) for (let z = -80; z <= 112; z++) { const ax = Math.abs(x), zm = ((z % 32) + 32) % 32;
    st.add(x, 0, z, ax <= 3 ? (x === 0 && (zm & 3) < 2 ? 'quartz' : 'asphalt') : ax === 4 ? 'path' : 'dune'); if (ax > 9 && ax < 20 && hash2(x, zm, 31) > 0.9) st.add(x, 1, z, 'dune'); }
  for (let k = -3; k <= 3; k++) {
    for (const [z0, side, xo, h] of [[4, 1, 8, 4], [14, -1, 9, 3], [25, 1, 12, 5], [20, -1, 15, 4]]) { const z = z0 + 32 * k; if (z < -79 || z > 111) continue; const x = side * xo;
      for (let y = 1; y <= h; y++) st.add(x, y, z, 'cactus'); st.add(x - 1, 2, z, 'cactus'); st.add(x - 1, 3, z, 'cactus'); st.add(x + 1, 3, z, 'cactus'); st.add(x + 1, 4, z, 'cactus'); }
    for (const [z0, side, xo, w, dd, h] of [[2, 1, 22, 8, 6, 9], [18, 1, 24, 6, 9, 6], [10, -1, 22, 9, 7, 8], [27, -1, 25, 6, 5, 11]]) for (let dx = 0; dx < w; dx++) for (let dz = 0; dz < dd; dz++) { const x = side * (xo + dx), z = z0 + dz + 32 * k; if (z < -79 || z > 111) continue;
      for (let y = 1; y <= h; y++) if (dx === 0 || dz === 0 || dx === w - 1 || dz === dd - 1 || y === h) st.add(x, y, z, 'mesa'); }
    for (const z0 of [0, 16]) { const z = z0 + 32 * k; if (z < -79 || z > 111) continue; for (let y = 1; y <= 6; y++) st.add(-7, y, z, 'log'); st.add(-8, 6, z, 'plank'); st.add(-6, 6, z, 'plank'); }
  }
  st.build();
  const D = dist27([[E.rtDesert, 16], [E.rtArrive - 4, 14], [E.rtArrive, 0], [E.rtRun, 0], [E.rtRun + 3, 24], [E.rtMph - 2, 30], [E.rtMph, 46], [E.rtLot + 1, 46]], E.rtDesert, E.rtLot + 1);
  const Dp = D(E.rtArrive + 0.5), LZ = z => z + Dp, Dd = D(E.rtDoor);
  board27(["WORLD'S BIGGEST*", 'SHARD - NEXT EXIT', '*smallest'], 8, 3.2, loc, -10.5, 4.6, D(E.rtSign) + 30, -0.2, '#ff5cf0', '#ffffff', 512, 210, 50);
  const shack = shack27(loc, 12, LZ(4.0), ['SOUVENIRS']); shack.rotation.y = -0.4;
  board27(["WORLD'S SMALLEST SHARD"], 8, 1.6, loc, 9.5, 6.6, LZ(5.6), 0, '#ffe066', '#c0182a', 768, 128, 70);
  loc.add(tinyStand); tinyStand.position.set(8, 0, LZ(1.5));
  board27(['NO GAS', 'NEXT 300 MI'], 3, 1.6, loc, -5.6, 2.4, LZ(6), 0, '#ffffff', '#c0182a', 256, 136, 44);
  loc.add(fire27); fire27.position.set(5, 0, LZ(-4.5)); const FP = [5, 0.5, -4.5];
  for (const [x, r] of [[3.0, 0.87], [7.2, -0.9]]) { const l = box(1.6, 0.5, 0.5, '#6a4020', x, 0.75, LZ(-6.2), loc); l.rotation.y = r + PI / 2; }
  burst(E.rtDoor + 0.7, [2.8, 0.7, 1.0 - (D(E.rtDoor + 0.7) - Dd)], { n: 30, colors: ['#e8c482', '#f6dca0'], speed: 3, size: 0.2, life: 1, grav: 5, up: 2 });
  for (const s of [0.2, 0.9, 1.7, 2.6, 4]) burst(E.rtSput + s, [-1.4, 1.3, -4.1], { n: 18, colors: ['#222222', '#444444', '#666666'], speed: 1.5, size: 0.35, life: 1.6, grav: -1.5, up: 1 });
  burst(E.rtFire, [5, 1.2, -4.5], { n: 40, colors: ['#ff8a2a', '#ffd23f'], speed: 4, size: 0.15, life: 1, grav: -2, up: 3 });
  smoke(E.rtFire, E.rtDawn, 0.5, [5, 1.5, -4.5], { n: 2, colors: ['#ff8a2a', '#ffd23f'], speed: 0.6, size: 0.08, life: 1.2, grav: -2, up: 1 });
  burst(E.rtMarsh + 0.6, [4.1, 1.1, -5.3], { n: 30, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 2, size: 0.12, life: 0.8, grav: -3, up: 2 });
  for (let i = 0; i < 14; i++) burst(E.rtStar + i * 0.07, [-26 + i * 3.4, 30 - i * 1.0, 46], { n: 6, colors: ['#ffffff', '#fff4b0'], speed: 0.3, size: 0.5, life: 0.7, grav: 0, up: 0 });
  burst(E.rtIdea + 2.6, [4.8, 3.2, 1.6], { n: 24, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.12, life: 0.8, grav: 1, up: 2 });
  burst(E.rtLift + 2, [0, 2.6, 0], { n: 40, colors: ['#e8c482', '#ffffff'], speed: 4, size: 0.18, life: 1, grav: 4, up: 2 });
  smoke(E.rtRun, E.rtLot, 0.2, [0, 0.7, -2.4], { n: 3, colors: ['#e8c482', '#f0d090'], speed: 2, size: 0.3, life: 0.8, grav: 1, up: 1 });
  const H0 = [6.2, 0.5, 0.4], hy0 = faceTo(H0, [8, 0, 1.5]), cT = wl(H0, hy0, [-2.4, 2.0, 1.6]), lT = wl(H0, hy0, [0, 1.6, 0.4]), cT2 = wl(H0, hy0, [-2.2, 1.9, 1.4]);
  const C = [[E.rtDesert, 10, 2.4, 12, 0, 1.6, 0, 52], [115.9, 12, 3, 6, 0, 1.6, 0, 50], [116, 5.5, 4, -8, 1.5, 1.8, 2, 48], [121.9, 5.8, 3.8, -6, 1.5, 1.8, 1, 46],
    [122, 3, 4, -10, -4, 4, 30, 50], [125.9, 2, 3.6, -8, -6, 4, 18, 46], [126, -7, 6, -12, 6, 2, 2, 54], [129.9, -6, 5, -10, 7, 2, 2, 50],
    [130, 8, 2.75, -0.6, 8, 1.88, 1.5, 30], [135.9, 8, 2.6, -0.2, 8, 1.88, 1.5, 24], [136, ...cT, ...lT, 44], [141.9, ...cT2, ...lT, 40],
    [142, -7, 2.5, -9, 0, 1.6, -1, 48], [149.9, -6.5, 2.4, -7.5, 0, 1.6, -1, 46], [150, 0.5, 5, -16, 5, 1.5, -3, 52], [153.9, 1.5, 4.5, -14, 5, 1.5, -3.5, 50],
    [154, 3.6, 2.4, -2.4, 6.6, 1.4, -5.8, 46], [159.9, 3.4, 2.4, -2.0, 6.8, 1.4, -6.0, 42], [160, 5.0, 2.6, -7.6, 6.0, 1.6, -1.8, 46], [163.9, 5.0, 2.5, -7.2, 6.0, 1.7, -1.8, 42],
    [164, 4.3, 2.1, -4.4, 3.0, 1.5, -6.2, 46], [167.9, 4.5, 2.2, -4.2, 3.0, 1.6, -6.2, 42], [168, -5.2, 1.4, -6, -3, 6, 12, 62], [175.9, -5.2, 1.6, -6, -3.5, 5, 12, 62],
    [176, 2.6, 3.8, 7.5, 4.6, 1.5, -0.5, 50], [183.9, 2.4, 3.6, 7, 4, 1.5, -1, 48], [184, 11, 5, 2, 2, 2, -1, 52], [191.9, 10, 4.6, 1, 0, 2.6, 0, 48],
    [192, 0, 4.5, -16, 0, 3, 6, 56], [197.9, 0, 3.6, -12, 0, 3, 6, 52], [198, 9, 1.2, 5, 0, 2.6, 0, 54], [203.9, 9, 1.4, 1, 0, 2.6, 0, 54],
    [204, -6.5, 3, -18, -1, 2.4, -6, 54], [209.9, -5, 2.6, -15, 0, 2.6, -2, 50], [210, 0, 4.0, 12, 0, 3.6, 0, 50], [215.9, 0, 3.8, 10, 0, 3.6, 0, 46],
    [216, -14, 14, 10, 0, 2, 0, 58], [E.rtLot, -18, 16, -4, 0, 2, 4, 58]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => c.root.visible = false);
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; warr27.visible = inv27b.visible = false;
    const d = D(t), sp = (D(t + 0.05) - d) / 0.05; L.at(d);
    const night = t >= E.rtNight && t < E.rtDawn, run = t >= E.rtRun;
    const fk = ss(seg(t, E.rtFire, E.rtFire + 0.6)); fire27.visible = true; flames27.forEach((m, i) => { m.visible = fk > 0.01 && t < E.rtDawn + 4; m.scale.setScalar(fk * (0.8 + 0.3 * Math.sin(t * 17 + i * 2))); m.rotation.y = t * (2 + i); }); fireL27.intensity = t < E.rtDawn + 4 ? fk * (26 + Math.sin(t * 23) * 4) : 0;
    // ---- the van
    let VP = [0, 0.5, 0], vo = { roll: d / 0.65 };
    if (sp > 0.5 && t < E.rtLift) vo.bob = Math.abs(Math.sin(t * 9)) * 0.05;
    if (win(t, E.rtSput, E.rtSput + 3.5)) { vo.bob = Math.abs(Math.sin(t * 30)) * 0.12 * (1 - seg(t, E.rtSput + 2, E.rtSput + 3.5)); vo.roll2 = Math.sin(t * 25) * 0.03; }
    if (t >= E.rtLift) { VP = t < E.rtLift + 2 ? arcPath(t, [[E.rtLift, 0, 0.5, 0, 0], [E.rtLift + 2, 0, 2.4, 0, 1.5]]) : [0, 2.4 + Math.abs(Math.sin(t * 14)) * (run ? 0.22 : 0.05), 0]; vo = { roll: t * 20, pitch: run ? Math.sin(t * 14) * 0.04 : 0 }; }
    poseVan(van, t, VP, 0, vo); const bob = vo.bob || 0;
    if (t < E.rtDoor) { parentTo(van.door, van.body); van.door.position.set(1.9, 1.1, -0.2); van.door.rotation.set(0, 0, 0); }
    else { parentTo(van.door, loc); const k = seg(t, E.rtDoor, E.rtDoor + 0.7); van.door.position.set(lerp(1.95, 2.9, k), lerp(1.6, 0.62, k * k) + Math.sin(k * PI) * 0.5, Dd - 0.2 - k * 0.6); van.door.rotation.set(0, k * 0.8, k * PI / 2); }
    van.door.visible = true;
    // ---- me
    map27.visible = win(t, E.rtTwist - 1, E.rtTwist + 5); map27.rotation.set(-0.3, PI, PI * (1 - ss(seg(t, E.rtTwist + 1, E.rtTwist + 1.8)))); marsh27.visible = win(t, E.rtMarsh - 1, E.rtStar); marshB.material = t > E.rtMarsh + 1.2 ? burntM : marshM;
    const SH = [3.0, 0.8, -6.2], shy = faceTo(SH, FP), hSit = E.rtNight + 3.4;
    if (t < E.rtArrive + 1) { const o = pick(t, [[0, { face: 'smug', headYaw: 0.4 }], [E.rtAreWe2, { face: 'normal', headYaw: 0.8 }], [E.rtAreWe2 + 3, { face: 'smug' }], [E.rtDoor, { face: 'scared', headYaw: 1.4 }], [E.rtDoor + 2.5, { face: 'normal' }], [E.rtSign, { face: 'smug', wave: true }]]);
      pose(hero, { t, p: seat27(VP, 0, SEAT27.h, bob), yaw: 0, sit: 1, ...o }); }
    else if (t < E.rtArrive + 1.8) pose(hero, { t, p: arcPath(t, [[E.rtArrive + 1, ...seat27(VP, 0, SEAT27.h), 0], [E.rtArrive + 1.8, -3.2, 0.5, 1.2, 1.2]]), yaw: -PI / 2, face: 'smug', sit: 1 - seg(t, E.rtArrive + 1, E.rtArrive + 1.8) });
    else if (t < E.rtLift + 2) { const hA = act(t, [[E.rtArrive + 1.8, -3.2, 0.5, 1.2], [E.rtArrive + 3, -2.6, 0.5, 4.8], [E.rtTiny - 0.2, ...H0], [E.rtNight, ...H0], [E.rtNight + 1.6, 2.6, 0.5, -3.0], [hSit - 0.2, 3.0, 0.5, -6.2]],
        [[0, { face: 'smug' }], [E.rtTiny - 0.2, { face: 'normal', yaw: hy0, headPitch: 0.4 }], [E.rtTiny + 2, { face: 'scared', yaw: hy0, lean: 0.3, headPitch: 0.4 }], [E.rtTwist - 1, { face: 'normal', yaw: hy0, hold: true, headPitch: 0.35 }],
         [E.rtTwist + 1.8, { face: 'scared', yaw: hy0, hold: true, headPitch: 0.35 }], [E.rtTwist + 5, { face: 'smug', yaw: hy0 + 1.2, wave: true }], [E.rtSput, { face: 'scared', yaw: faceTo(H0, [0, 0, 0]) }], [E.rtSput + 3, { face: 'scared', yaw: faceTo(H0, [0, 0, 0]), panic: true }],
         [E.rtSput + 5, { face: 'normal', yaw: faceTo(H0, [0, 0, 0]) }], [E.rtNight, { face: 'normal' }]]);
      if (t >= hSit - 0.2) { const k = seg(t, hSit - 0.2, hSit + 0.4), o = pick(t, [[0, { face: 'smug' }], [E.rtFire, { face: 'smug', headYaw: -0.6 }], [E.rtFire + 2, { face: 'normal', headYaw: -0.9 }], [E.rtStory, { face: 'smug', headYaw: -0.5 }], [E.rtMarsh - 1, { face: 'smug', hold: true }],
          [E.rtMarsh + 0.6, { face: 'scared', panic: true }], [E.rtMarsh + 3, { face: 'normal', hold: true }], [E.rtStar, { face: 'smug', headPitch: -0.6 }], [E.rtStar + 4, { face: 'normal', headYaw: -1.0 }], [E.rtIdea, { face: 'normal', headYaw: 0.6 }], [E.rtIdea + 3, { face: 'normal', headPitch: 0.5 }], [E.rtDawn, { face: 'scared', headYaw: 0.8, headPitch: -0.2 }]]);
        pose(hero, { t, p: [SH[0], lerp(0.5, SH[1], k), SH[2]], yaw: shy, sit: k, ...o }); }
      else pose(hero, { t, ...hA }); }
    else if (t < E.rtLift + 3.2) pose(hero, { t, p: arcPath(t, [[E.rtLift + 2, ...SH, 0], [E.rtLift + 3.2, ...seat27(VP, 0, SEAT27.h), 1.5]]), yaw: 0, face: 'scared', sit: 1, panic: true });
    else { const o = pick(t, [[0, { face: 'scared', panic: true }], [E.rtRun + 2, { face: 'smug', wave: true }], [E.rtRun + 8, { face: 'normal', headYaw: 0.6 }], [E.rtCone2, { face: 'scared', headYaw: -2.4 }], [E.rtMph, { face: 'scared', panic: true, lean: -0.3 }], [E.rtMph + 6, { face: 'smug', wave: true }]]);
      pose(hero, { t, p: seat27(VP, 0, SEAT27.h), yaw: 0, sit: 1, ...o }); }
    // ---- Leggy
    const LS = [8.3, 0.5, -2.6], lyS = faceTo(LS, [8, 0, 1.5]), LC = [6.0, 0.5, 0.2], LI = [4.8, 0.5, 0.2]; let lp, ly = 0, ls = 0.3, lie = false; lic27.visible = win(t, E.rtStory, E.rtStory + 7.5);
    if (t < E.rtArrive + 1.2) { lp = seat27(VP, 0, SEAT27.l, bob); ls = sp > 0.5 ? 1.6 : 0.3; }
    else if (t < E.rtArrive + 2.2) { lp = arcPath(t, [[E.rtArrive + 1.2, ...seat27(VP, 0, SEAT27.l), 0], [E.rtArrive + 2.2, 4.4, 0.5, -1.5, 1.4]]); ly = 0.6; ls = 2; }
    else if (t < E.rtSput - 2) { const a = walker(t, [[E.rtArrive + 2.2, 4.4, 0.5, -1.5], [E.rtArrive + 3.6, ...LS]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : lyS; ls = a.walk > 0.05 ? 2 : 0.4; if (win(t, E.rtTwist, E.rtTwist + 4)) L6.hd.rotation.y = -0.8; }
    else if (t < E.rtSput - 0.8) { lp = arcPath(t, [[E.rtSput - 2, ...LS, 0], [E.rtSput - 0.8, ...seat27(VP, 0, SEAT27.l), 2]]); ly = lerp(lyS, 0, seg(t, E.rtSput - 2, E.rtSput - 0.8)); ls = 2; }
    else if (t < E.rtSput + 4) { lp = seat27(VP, 0, SEAT27.l, bob); ls = win(t, E.rtSput, E.rtSput + 3) ? 3 : 0.3; }
    else if (t < E.rtSput + 5.2) { lp = arcPath(t, [[E.rtSput + 4, ...seat27(VP, 0, SEAT27.l), 0], [E.rtSput + 5.2, ...LC, 1.4]]); ly = PI; ls = 2; }
    else if (t < E.rtIdea) { lp = LC; ly = PI; ls = 0.2; lie = t > E.rtNight && !win(t, E.rtStory, E.rtStory + 7.5); if (win(t, E.rtStory, E.rtStory + 7.5)) { ls = 1.2; ly = PI + Math.sin(t * 2) * 0.3; } }
    else if (t < E.rtLift) { const a = walker(t, [[E.rtIdea, ...LC], [E.rtIdea + 2.2, ...LI]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : -PI / 2; ls = a.walk > 0.05 ? 2 : 0.3; }
    else if (t < E.rtLift + 2) { lp = L3(LI, [0, 0.5, 0], ss(seg(t, E.rtLift, E.rtLift + 2))); ly = lerp(-PI / 2, 0, seg(t, E.rtLift, E.rtLift + 1.4)); ls = 2.5; }
    else { lp = [0, 0.5, 0]; ly = 0; ls = run ? 8 : 0.8; }
    poseLurk(L6, t, lp, ly, ls); L6.body.position.y = lie ? 0.9 + Math.sin(t * 1.6) * 0.04 : L6.body.position.y; if (win(t, E.rtIdea + 2.4, E.rtIdea + 3.4)) L6.hd.rotation.x = -0.4; if (run) L6.root.rotation.z = Math.sin(t * 14) * 0.05;
    // ---- Bloop
    const SB = [7.2, 1.0, -6.2], sby = faceTo(SB, FP), BS = [9.8, 0.5, -0.2], bSit = E.rtNight + 3.4; inv27a.visible = win(t, E.rtFire + 1.5, E.rtStory);
    if (t < E.rtArrive + 1.6) { const o = win(t, E.rtDoor + 1, E.rtDoor + 4) ? { handOut: true } : win(t, E.rtAreWe2 + 1.4, E.rtAreWe2 + 3.4) ? { angry: true } : {}; poseBurble(bloop6, t, seat27(VP, 0, SEAT27.b, bob), win(t, E.rtDoor + 1, E.rtDoor + 4) ? PI - 0.6 : 0, o); }
    else if (t < E.rtArrive + 2.4) poseBurble(bloop6, t, arcPath(t, [[E.rtArrive + 1.6, ...seat27(VP, 0, SEAT27.b), 0], [E.rtArrive + 2.4, -3.4, 0.5, -2.4, 1.4]]), -PI / 2, {});
    else if (t < bSit) { const bA = act(t, [[E.rtArrive + 2.4, -3.4, 0.5, -2.4], [E.rtArrive + 3.6, -2.2, 0.5, -5.4], [E.rtArrive + 5.4, 5, 0.5, -5.4], [E.rtArrive + 7.2, ...BS], [E.rtNight, ...BS], [bSit - 0.3, SB[0], 0.5, SB[2]]], [[0, {}]]);
      let by = bA.walk ? bA.yaw : faceTo(BS, [8, 0, 1.5]), bo = { walk: bA.walk, phase: bA.phase * 2 }; if (!bA.walk) { if (win(t, E.rtTiny, E.rtTiny + 3)) bo = { hop: true }; if (win(t, E.rtTwist + 2, E.rtTwist + 5)) bo = { angry: true }; if (win(t, E.rtSput, E.rtNight)) { bo = { facepalm: true }; by = faceTo(BS, [0, 0, 0]); } }
      poseBurble(bloop6, t, bA.p, by, bo); }
    else if (t < E.rtLift + 2.4) { const o = pick(t, [[0, {}], [E.rtFire, { hop: true }], [E.rtFire + 1.5, { handOut: true }], [E.rtStory, {}], [E.rtMarsh + 0.6, { angry: true }], [E.rtMarsh + 3, {}], [E.rtDawn, { angry: true }]]); poseBurble(bloop6, t, SB, sby + (win(t, E.rtFire + 1.5, E.rtStory) ? -0.6 : 0), o); }
    else if (t < E.rtLift + 3.6) poseBurble(bloop6, t, arcPath(t, [[E.rtLift + 2.4, ...SB, 0], [E.rtLift + 3.6, ...seat27(VP, 0, SEAT27.b), 1.5]]), 0, { angry: true });
    else { const o = pick(t, [[0, { angry: true }], [E.rtRun + 3, { facepalm: true }], [E.rtRun + 7, {}], [E.rtMph, { angry: true }], [E.rtMph + 4, { hop: true }]]); poseBurble(bloop6, t, seat27(VP, 0, SEAT27.b), 0, o); if (run) bHat.position.y = 1.2 + Math.abs(Math.sin(t * 7)) * 0.3; }
    // ---- Officer Coney (night patrol; then: speeding!)
    const pat = win(t, E.rtStar + 2, E.rtStar + 6), chase = win(t, E.rtCone2, E.rtCone2 + 10); coney.root.visible = scooter.visible = pat || chase;
    if (pat || chase) { const sP = pat ? [-3.0, 0.5, lerp(-40, 40, seg(t, E.rtStar + 2, E.rtStar + 6))] : [-3.6, 0.5, lerpK([[E.rtCone2, -34], [E.rtCone2 + 3, -12], [E.rtCone2 + 6, -11], [E.rtCone2 + 10, -80]], t)];
      scooter.position.set(...sP); scooter.rotation.set(0, 0, 0); poseCone(coney, t, [sP[0], 1.02, sP[2] - 0.2], 0, { siren: true, stop: pat, point: chase && t < E.rtCone2 + 6, wide: chase && t > E.rtCone2 + 6 }); }
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the World's Biggest Shard (noon) — she parks it
const lot = (() => {
  const g = mk('lot'); const st = new VSet(g);
  for (let x = -56; x <= 56; x++) for (let z = -64; z <= 56; z++) { const ax = Math.abs(x), inLot = ax <= 15 && z >= -8 && z <= 9, rd = ax <= 3 && z < -8;
    st.add(x, 0, z, rd ? (x === 0 && (z & 3) < 2 ? 'quartz' : 'asphalt') : inLot ? (ax % 6 === 3 && z > -6 && z < 2 ? 'quartz' : 'asphalt') : 'turf');
    const dh = Math.hypot(x, z - 22), h = dh < 3.2 ? 4 : dh < 5.4 ? 3 : dh < 7.5 ? 2 : dh < 9.5 ? 1 : 0; for (let y = 1; y <= h; y++) st.add(x, y, z, y === h ? 'turf' : 'soil'); }
  for (const [x, z, h] of [[-22, -10, 6], [22, -16, 5], [-26, 12, 7], [26, 10, 6], [-18, 30, 6], [18, 32, 7], [-34, -30, 6], [30, -34, 5], [-12, -30, 5], [14, -28, 6], [-40, 4, 7], [40, 0, 6]]) tree20(st, x, z, h, false);
  st.build();
  box(4, 1.5, 4, '#f0ece4', 0, 5.25, 22, g); box(4.2, 0.2, 4.2, '#ffd23f', 0, 6.0, 22, g);
  board27(["WORLD'S BIGGEST SHARD"], 9, 1.8, g, 11, 5, 16, -0.35, '#5ff7ff', '#2a1d14', 768, 128, 72);
  const shop = shack27(g, 12, -3, ['GIFT SHOP'], '#ff9ecb'); shop.rotation.y = -0.5;
  g.add(bigYaw); g.add(tick27);
  burst(E.rtDrop + 1, [0, 0.8, -2], { n: 40, colors: ['#c8c0b8', '#ffffff'], speed: 4, size: 0.2, life: 0.8, grav: 6, up: 1 });
  burst(E.rtWow, [0, 12, 22], { n: 90, colors: ['#ff5cf0', '#5ff7ff', '#ffffff'], speed: 7, size: 0.2, life: 1.6, grav: 1, up: 2 });
  burst(E.rtBonk, [0, 1.5, 12.4], { n: 40, colors: ['#3cc2a3', '#8a6040'], speed: 4, size: 0.2, life: 1, grav: 8, up: 3 });
  burst(E.rtTip + 1.2, [0, 4, 17], { n: 60, colors: ['#3cc2a3', '#8a6040', '#ff5cf0'], speed: 6, size: 0.25, life: 1.2, grav: 9, up: 4 });
  burst(E.rtFlat, [0, 1.2, 8.6], { n: 110, colors: ['#2ec4b6', '#ffd23f', '#c0c0c8', '#c0182a'], speed: 9, size: 0.28, life: 1.6, grav: 12, up: 5 });
  burst(E.rtShop, [12, 2, -3], { n: 110, colors: ['#ff9ecb', '#c0182a', '#ffe066', '#ffffff'], speed: 9, size: 0.28, life: 1.6, grav: 12, up: 5 });
  smoke(E.rtTip + 1.2, E.freeze, 0.3, t => [lerp(0, 26, seg(t, E.rtFlat, E.rtShop + 10)), 0.8, lerp(17, 8.6, seg(t, E.rtTip + 1.2, E.rtFlat)) - 25.6 * seg(t, E.rtFlat, E.rtShop + 10)], { n: 3, colors: ['#c8b89a', '#a89870'], speed: 1, size: 0.4, life: 1.4, grav: -0.5, up: 1 });
  const C = [[E.rtLot, -10, 3, -26, 0, 3, -34, 56], [231.9, -9, 3.2, -10, 0, 2.6, -4, 50], [232, 9, 4, 6, 0, 2, -2, 50], [235.9, 8.5, 3.6, 5, 0, 2, -2, 48],
    [236, -2, 1.1, 2.6, 0, 9, 22, 60], [241.9, -1.6, 1.0, 3.6, 0, 10, 22, 58], [242, 1.5, 4.6, 1.0, 0, 5, 14, 62], [247.9, 1.5, 4.7, 1.3, 0, 5.2, 14, 60],
    [248, -10, 3, -12, -3, 1.5, -3, 50], [251.9, -8.5, 3, -9, -3, 1.6, -1, 48], [252, -6.4, 2.6, 16.5, 0, 1.8, 6, 52], [259.9, -5.8, 2.4, 16, 0, 1.8, 8, 48],
    [260, 13, 5, 3, 0, 8, 18, 56], [266.9, 14, 5.5, 1, 0, 8, 17, 54], [267, -16, 5, 2, 0, 4, 12, 60], [272.9, -16, 5.5, 0, 1, 4, 8, 58],
    [273, -10, 3, 14, -1.5, 1.5, 8, 50], [276.9, -10.4, 3.2, 14.6, -1.5, 1.6, 7.6, 48], [277, -14, 9, 10, 10, 3, -4, 56], [279.9, -14, 8.5, 10, 12, 3, -6, 54],
    [280, -10.5, 3.4, 13.5, -1, 1.2, 6.5, 50], [285.5, -11, 3.6, 14.2, -0.5, 1.4, 6.2, 48], [E.logo, -11, 3.6, 14.2, -0.5, 1.4, 6.2, 48]];
  function update(t) {
    hideMisc(); hide26(); [hero.root, bloop6.B.root, L6.root, van.root, coney.root, scooter].forEach(o => parentTo(o, g)); cousins.forEach(c => c.root.visible = false);
    L6.root.rotation.set(0, 0, 0); L6.body.position.y = 1.3; L6.root.visible = bloop6.B.root.visible = van.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; van.door.visible = false;
    warr27.visible = inv27a.visible = lic27.visible = map27.visible = marsh27.visible = false;
    // ---- the van: carried in, dropped, parked (into the hill), flattened
    const dT = E.rtDrop, lw = walker(t, [[E.rtLot, 0, 0.5, -46], [dT - 1.2, 0, 0.5, -6], [dT, 0, 0.5, -2.4]]); let VP;
    if (t < dT) VP = [0, 2.4 + Math.abs(Math.sin(t * 14)) * 0.2 * (1 - seg(t, dT - 2, dT)), lw.p[2]];
    else if (t < dT + 1) VP = arcPath(t, [[dT, 0, 2.4, -2.4, 0], [dT + 1, 0, 0.5, -2, 0.8]]);
    else if (t < E.rtPark) VP = [0, 0.5, -2];
    else VP = [0, 0.5, lerpK([[E.rtPark, -2], [E.rtPark + 2, 1.5], [E.rtPark + 3, 1.5], [E.rtPark + 5, 4.5], [E.rtPark + 6, 4.8], [E.rtBonk - 0.6, 8.0], [E.rtBonk, 8.6]], t)];
    const bonk = win(t, E.rtBonk, E.rtBonk + 0.5) ? Math.sin(seg(t, E.rtBonk, E.rtBonk + 0.5) * PI) : 0, flat = ss(seg(t, E.rtFlat - 0.4, E.rtFlat + 0.2));
    poseVan(van, t, VP, 0, { roll: VP[2] / 0.65 + (t < dT ? t * 20 : 0), bob: win(t, dT + 1, dT + 1.4) ? Math.sin(seg(t, dT + 1, dT + 1.4) * PI) * 0.2 : 0, pitch: -bonk * 0.12, flat });
    // ---- the big shard: wobble, tip, roll
    const sk = lerpK([[E.rtTip, 0], [E.rtTip + 1.2, 5.1], [E.rtFlat, 13.4], [E.rtShop, 30.4], [E.rtShop + 10, 50]], t);
    if (t < E.rtTip) { bigYaw.position.set(0, 11, 22); bigYaw.rotation.set(0, PI, 0); const wob = win(t, E.rtBonk, E.rtTip) ? Math.sin(t * 7) * 0.14 * seg(t, E.rtBonk, E.rtTip) : 0; bigIn.rotation.set(wob, t * 0.2, wob * 0.6); }
    else { const P = t < E.rtFlat ? arcPath(t, [[E.rtTip, 0, 11, 22, 0], [E.rtTip + 1.2, 0, 9.6, 17, 0.8], [E.rtFlat, 0, 5.4, 8.6, 1]]) : arcPath(t, [[E.rtFlat, 0, 5.4, 8.6, 0], [E.rtShop, 12, 5.4, -3, 1.2], [E.rtShop + 10, 26, 5.4, -17, 1]]);
      bigYaw.position.set(...P); bigYaw.rotation.set(0, t < E.rtFlat ? PI : 2.356, 0); bigIn.rotation.set(sk / 4.2, 0, 0); }
    shop.scale.set(1 + 0.2 * ss(seg(t, E.rtShop - 0.3, E.rtShop + 0.2)), 1 - 0.9 * ss(seg(t, E.rtShop - 0.3, E.rtShop + 0.2)), 1);
    tick27.visible = t >= E.rtTicket + 3.6; tick27.position.set(-0.8, 0.82, 7.6); tick27.rotation.set(-PI / 2, 0, 0.3);
    // ---- Leggy
    const LJ = [7, 0.5, 11]; let lp, ly = 0, ls = 0.3;
    if (t < dT) { lp = lw.p; ls = lerp(8, 1, seg(t, dT - 2, dT)); }
    else if (t < E.rtCop3) { const a = walker(t, [[dT, 0, 0.5, -2.4], [dT + 0.7, 4.8, 0.5, -2.4], [E.rtWow + 3, 4.8, 0.5, -2.4], [E.rtPhoto - 0.5, 4.4, 0.5, 9.5]]); lp = a.p; ly = a.walk > 0.05 ? a.yaw : t > E.rtPhoto - 1 ? PI : 0; ls = a.walk > 0.05 ? 2 : 0.4; if (win(t, E.rtWow, E.rtWow + 3)) L6.hd.rotation.x = -0.5; }
    else if (t < E.rtCop3 + 2.4) { const a = walker(t, [[E.rtCop3, 4.4, 0.5, 9.5], [E.rtCop3 + 2.4, 3.6, 0.5, -2.5]]); lp = a.p; ly = a.yaw; ls = 2; }
    else if (t < E.rtCop3 + 3.4) { lp = arcPath(t, [[E.rtCop3 + 2.4, 3.6, 0.5, -2.5, 0], [E.rtCop3 + 3.4, ...seat27(VP, 0, SEAT27.l), 1.6]]); ls = 2; }
    else if (t < E.rtJump) { lp = seat27(VP, 0, SEAT27.l); ls = t > E.rtPark ? 1.4 : 0.3; }
    else if (t < E.rtJump + 1.2) { lp = arcPath(t, [[E.rtJump, ...seat27(VP, 0, SEAT27.l), 0], [E.rtJump + 1.2, ...LJ, 2.4]]); ly = 0.8; ls = 3; }
    else { lp = LJ; ly = t < E.rtFlat + 1 ? PI : -2.2; ls = t < E.rtFlat + 2 ? 2.5 : 0.4; }
    poseLurk(L6, t, lp, ly, ls); if (t < dT) L6.root.rotation.z = Math.sin(t * 14) * 0.05;
    // ---- me
    const HG = [-3.6, 0.5, 12.5]; let hA;
    if (t < dT + 1.6) hA = { p: seat27(VP, 0, SEAT27.h), yaw: 0, sit: 1, ...pick(t, [[0, { face: 'scared', panic: true }], [E.rtLot + 3, { face: 'smug', wave: true }]]) };
    else if (t < dT + 2.4) hA = { p: arcPath(t, [[dT + 1.6, ...seat27(VP, 0, SEAT27.h), 0], [dT + 2.4, -3.6, 0.5, 0.6, 1.2]]), yaw: -PI / 2, sit: 1 - seg(t, dT + 1.6, dT + 2.4), face: 'smug' };
    else hA = act(t, [[dT + 2.4, -3.6, 0.5, 0.6], [E.rtWow + 2.4, -3.6, 0.5, 0.6], [E.rtWow + 3.6, -4.2, 0.5, 5], [E.rtPhoto - 1, -1.6, 0.5, 8], [E.rtCop3 + 0.4, -1.6, 0.5, 8], [E.rtPark - 1, ...HG], [E.rtJump, ...HG], [E.rtJump + 1.4, -8, 0.5, 9],
        [E.rtInvoice - 1, -8, 0.5, 9], [E.rtInvoice + 0.4, -4.2, 0.5, 9.8]],
      [[0, { face: 'smug' }], [E.rtWow, { face: 'smug', headPitch: -0.7 }], [E.rtWow + 2.4, { face: 'smug' }], [E.rtPhoto - 1, { face: 'smug', yaw: PI, wave: true }], [E.rtPhoto + 3, { face: 'smug', yaw: PI }], [E.rtCop3, { face: 'normal', yaw: -2.4 }],
       [E.rtPark - 1, { face: 'smug', yaw: PI, wave: true }], [E.rtPark + 4, { face: 'smug', yaw: PI, hold: Math.floor(t * 1.5) % 2 === 0 }], [E.rtBonk, { face: 'scared', yaw: PI }], [E.rtBonk + 2, { face: 'scared', yaw: PI, headPitch: -0.6 }],
       [E.rtJump, { face: 'scared', panic: true }], [E.rtJump + 1.4, { face: 'scared', yaw: PI / 2, panic: true }], [E.rtFlat + 1, { face: 'scared', yaw: PI / 2 }], [E.rtInvoice + 0.4, { face: 'normal', yaw: PI / 2 - 0.4 }],
       [E.rtShop - 0.6, { face: 'scared', yaw: 2.4, panic: true }], [E.rtShop + 1.6, { face: 'scared', yaw: PI / 2 - 0.4 }]]);
    pose(hero, { t, ...hA });
    // ---- Bloop
    const BI = [-3.6, 0.5, 7.6]; let bp, by = 0, bo = {}; inv27b.visible = t >= E.rtInvoice;
    if (t < dT + 2) bp = seat27(VP, 0, SEAT27.b);
    else if (t < dT + 2.8) { bp = arcPath(t, [[dT + 2, ...seat27(VP, 0, SEAT27.b), 0], [dT + 2.8, -4.6, 0.5, -2.2, 1.2]]); by = -PI / 2; }
    else { const bA = act(t, [[dT + 2.8, -4.6, 0.5, -2.2], [E.rtWow + 3, -4.6, 0.5, -2.2], [E.rtPhoto - 1, -3.4, 0.5, 8.2], [E.rtCop3 + 0.4, -3.4, 0.5, 8.2], [E.rtCop3 + 3, -5.6, 0.5, 1.4], [E.rtInvoice - 1.4, -5.6, 0.5, 1.4], [E.rtInvoice, ...BI]], [[0, {}]]);
      bp = bA.p; by = bA.walk ? bA.yaw : t > E.rtInvoice ? faceTo(BI, [-4.2, 0, 9.8]) : t > E.rtCop3 + 3 ? faceTo(bp, [0, 0, 6]) : t > E.rtPhoto - 1 ? PI : 0.3; bo = { walk: bA.walk, phase: bA.phase * 2 };
      if (!bA.walk) { if (win(t, E.rtWow, E.rtWow + 4)) bo = { hop: true }; if (win(t, E.rtPhoto, E.rtPhoto + 3)) bo = { hop: true }; if (win(t, E.rtBonk, E.rtFlat)) bo = { angry: true }; if (win(t, E.rtFlat, E.rtInvoice)) bo = { facepalm: true }; if (t >= E.rtInvoice) bo = { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); if (win(t, E.rtFlat, E.rtFlat + 1.4)) bHat.position.y = 1.2 + Math.sin(seg(t, E.rtFlat, E.rtFlat + 1.4) * PI) * 2;
    // ---- Officer Coney (he says park it properly)
    coney.root.visible = scooter.visible = t >= E.rtCop3; tick27.visible = tick27.visible && t >= E.rtTicket;
    if (t >= E.rtCop3) { const sP = [-3.4, 0.5, lerp(-40, -4.2, ss(seg(t, E.rtCop3, E.rtCop3 + 2.5)))]; scooter.position.set(...sP); scooter.rotation.set(0, 0, 0);
      if (t < E.rtCop3 + 2.8) poseCone(coney, t, [sP[0], 1.02, sP[2] - 0.2], 0, { siren: true });
      else { const a = act(t, [[E.rtCop3 + 2.8, -4.6, 0.5, -2.6], [E.rtTicket, -4.6, 0.5, -2.6], [E.rtTicket + 1.6, -3.2, 0.5, 5.4]], [[0, {}]]); const cy = a.walk ? a.yaw : t > E.rtTicket ? PI / 2 : faceTo([-4.6, 0, -2.6], [0, 0, 8]);
        poseCone(coney, t, a.p, cy, { hop: a.walk, walk: a.walk, point: win(t, E.rtCop3 + 3, E.rtPark), whistle: win(t, E.rtPark, E.rtBonk) && Math.floor(t * 1.2) % 2 === 0, wide: win(t, E.rtBonk, E.rtShop + 2), write: win(t, E.rtTicket + 1.6, E.rtTicket + 3.6), pad: win(t, E.rtTicket + 1.4, E.rtTicket + 3.6) }); } }
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
  const rdDay = { top: '#5db8ff', bot: '#e4f4ff', sunI: 2.6, hemiI: 1.5, fog: '#d8ecff', sunEl: 0.8, sunAz: 0.5, near: 45, far: 110 };
  const dsSun = { top: '#5a3a90', bot: '#ffb070', sunI: 2.0, hemiI: 1.25, fog: '#f0a878', sunEl: 0.16, sunAz: 0.2, near: 45, far: 110 };
  const dsEve = { top: '#2a2070', bot: '#ff7a5a', sunI: 1.3, hemiI: 1.0, fog: '#b06a70', sunEl: 0.02, sunAz: 0.2, near: 45, far: 110 };
  const dsNight = { top: '#060a24', bot: '#1a2050', sunI: 0.5, hemiI: 0.8, fog: '#121838', sunEl: -0.1, sunAz: 2.4, near: 40, far: 110 };
  const dsDawn = { top: '#ff9a70', bot: '#ffe0b0', sunI: 2.0, hemiI: 1.3, fog: '#f4c8a0', sunEl: 0.2, sunAz: -0.4, near: 45, far: 110 };
  const dsDay = { top: '#3a9af0', bot: '#fff0c8', sunI: 2.8, hemiI: 1.5, fog: '#f6e4c0', sunEl: 0.9, sunAz: 0.4, near: 45, far: 110 };
  const noon = { top: '#4ab0ff', bot: '#e8f6ff', sunI: 2.7, hemiI: 1.55, fog: '#dcefff', sunEl: 1.0, sunAz: 0.7, near: 50, far: 120 };
  if (t < E.rtDesert) return rdDay; if (t >= E.rtLot) return noon; if (t < E.rtNight) return mix(dsSun, dsEve, seg(t, E.rtSput, E.rtNight)); if (t < E.rtDawn) return dsNight;
  return mix(mix(dsNight, dsDawn, seg(t, E.rtDawn, E.rtDawn + 2)), dsDay, seg(t, E.rtDawn + 6, E.rtRun + 10));
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
  const hpv = t < E.rtNoLic ? 5 : t < E.rtSput ? 4 : t < E.rtFlat ? 3 : 1;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (win(t, E.rtBump, E.rtBump + 1.5) || win(t, E.rtSiren, E.rtPull) || win(t, E.rtSput, E.rtSput + 3) || win(t, E.rtBonk, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = false;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined(t >= E.rtNight && t < E.rtDawn ? '☾ NIGHT 27' : '☀ DAY 27', W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['map', t > E.rtMap - 1 ? 1 : 0], ['crown', 1], ['card', t > E.rtWarranty + 1 ? 1 : 0], ['license', t > E.rtPass + 1.5 ? 1 : 0], ['marsh', win(t, E.rtMarsh - 1, E.rtDawn) ? (t > E.rtMarsh + 1.2 ? 2 : 3) : 0], ['mallet', 1], ['ticket', t > E.rtTicket + 3.8 ? 1 : 0]];
  let sel = 0;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // miles / fuel / are-we-there-yet — this episode's mechanic
  drawRoadHUD(t);

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
ICON.key = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x - s * 0.4, y, s * 0.45, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.1, y - s * 0.12, s * 1.1, s * 0.24); ctx.fillRect(x + s * 0.6, y, s * 0.2, s * 0.4); };
ICON.shrimp = (x, y, s) => { ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0.3, 4.6); ctx.lineWidth = s * 0.45; ctx.strokeStyle = '#ff8a6a'; ctx.stroke(); };
ICON.globe = (x, y, s) => { ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - s * 0.8, y + s * 0.4, s * 1.6, s * 0.5); ctx.fillStyle = 'rgba(200,236,255,.9)'; ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.75, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x - s * 0.5, y + s * 0.2, s, s * 0.2); };
ICON.snowball = (x, y, s) => { ctx.fillStyle = '#f6fbff'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0, 7); ctx.fill(); ctx.fillStyle = '#c8e0f2'; ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 0.3, s * 0.2); };
ICON.bone = (x, y, s) => { ctx.fillStyle = '#efe6cc'; ctx.fillRect(x - s * 0.7, y - s * 0.15, s * 1.4, s * 0.3); for (const dx of [-0.7, 0.7]) for (const dy of [-0.25, 0.25]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, s * 0.22, 0, 7); ctx.fill(); } };
ICON.glue = (x, y, s) => { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - s * 0.35, y - s * 0.4, s * 0.7, s * 1.0); ctx.fillStyle = '#e8344e'; ctx.fillRect(x - s * 0.15, y - s * 0.75, s * 0.3, s * 0.35); ctx.fillStyle = '#3d7bff'; ctx.fillRect(x - s * 0.35, y - s * 0.1, s * 0.7, s * 0.25); };
ICON.map = (x, y, s) => { ctx.fillStyle = '#f2e6c4'; ctx.fillRect(x - s * 0.8, y - s * 0.6, s * 1.6, s * 1.2); ctx.strokeStyle = '#c0182a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.4); ctx.lineTo(x, y - s * 0.2); ctx.lineTo(x + s * 0.5, y + s * 0.1); ctx.stroke(); ctx.fillStyle = '#ff5cf0'; ctx.fillRect(x + s * 0.35, y - s * 0.45, s * 0.3, s * 0.3); };
ICON.card = (x, y, s) => { ctx.fillStyle = '#fff8e0'; ctx.fillRect(x - s * 0.8, y - s * 0.5, s * 1.6, s); ctx.fillStyle = '#2a6a3a'; ctx.fillRect(x - s * 0.6, y - s * 0.3, s * 1.2, s * 0.15); ctx.fillRect(x - s * 0.6, y + s * 0.05, s * 0.8, s * 0.15); };
ICON.license = (x, y, s) => { ctx.fillStyle = '#e8f4ff'; ctx.fillRect(x - s * 0.8, y - s * 0.5, s * 1.6, s); ctx.fillStyle = '#2a2238'; ctx.fillRect(x - s * 0.65, y - s * 0.35, s * 0.55, s * 0.6); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - s * 0.55, y - s * 0.2, s * 0.12, s * 0.1); ctx.fillRect(x - s * 0.3, y - s * 0.2, s * 0.12, s * 0.1); ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x + s * 0.05, y - s * 0.25, s * 0.6, s * 0.12); ctx.fillRect(x + s * 0.05, y + s * 0.05, s * 0.45, s * 0.12); };
ICON.marsh = (x, y, s) => { ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.8); ctx.lineTo(x + s * 0.2, y - s * 0.2); ctx.stroke(); ctx.fillStyle = '#fffaf0'; ctx.fillRect(x, y - s * 0.7, s * 0.6, s * 0.6); };
const TOASTS = [[E.rtWarranty + 1, '+1 Warranty (300 mi)', 'card'], [E.rtMap - 1, '+1 Road Map', 'map'], [E.rtPass + 1.5, "+1 License (Leggy's)", 'license'], [E.rtMarsh - 1, '+3 Marshmallows', 'marsh'], [E.rtTicket + 3.8, '+1 Parking Ticket', 'ticket']];
const FEATS = [[E.rtHonk + 1.5, 'Road Trip!', 'Let a Hexapede drive'], [E.rtPass + 3, 'Licensed to Leg', 'Pass the cone test'], [E.rtSput + 3.5, 'Running on Empty', 'Run out of gas in the desert'], [E.rtMph + 1, 'Leg Day', 'Get carried at 112 mph'], [E.rtFlat + 2, 'Parallel Parking', 'Park... technically']];
const POPS = [[E.rtVan + 0.5, 1.8, 'THE BLOOPMOBILE!', 0.5, 0.3, '#2ec4b6', 80], [E.rtSeat + 2.8, 1.4, '...hey.', 0.55, 0.35, '#ffffff', 70], [E.rtLegs + 0.5, 1.8, '6 legs. 3 pedals.', 0.5, 0.3, '#5ff7ff', 70], [E.rtWarranty + 0.6, 1.8, 'WARRANTY: 300 MI', 0.5, 0.3, '#7cff6b', 64],
  [E.rtHonk, 1.0, 'HONK', 0.5, 0.35, '#ffe066', 110], [E.rtHonk + 0.7, 1.0, 'HONK', 0.6, 0.4, '#ffe066', 90], [E.rtAreWe1, 1.4, 'are we there yet?', 0.4, 0.3, '#ffffff', 56], [E.rtAreWe1 + 2.2, 1.4, 'are we there yet?', 0.6, 0.35, '#ffffff', 56], [E.rtAreWe1 + 4.2, 1.4, 'ARE WE THERE YET?', 0.5, 0.3, '#ffe066', 64],
  [E.rtBump, 1.2, 'BUMP', 0.4, 0.4, '#ffffff', 110], [E.rtBump + 1.4, 1.4, 'nice catch!', 0.6, 0.3, '#7cff6b', 64], [E.rtFix1 + 3, 1.4, 'FIXED!', 0.4, 0.35, '#7cff6b', 90], [E.rtMap + 1.6, 1.6, 'this way up. definitely.', 0.5, 0.3, '#ffffff', 56], [E.rtTurn, 1.6, 'SHORTCUT!', 0.5, 0.3, '#ffe066', 100],
  [E.rtSiren + 1, 1.6, 'WEE-OO WEE-OO', 0.5, 0.3, '#ff6b6b', 80], [E.rtCop + 1, 1.8, 'LICENSE, PLEASE.', 0.5, 0.3, '#ffffff', 64], [E.rtNoLic, 1.8, 'NO LICENSE?!', 0.5, 0.32, '#ff6b6b', 100], [E.rtNoLic + 2.2, 1.4, 'FWEEET', 0.62, 0.3, '#ffffff', 90], [E.rtTest - 2, 1.8, 'CONE TEST', 0.5, 0.3, '#ff7a1a', 100],
  [E.rtTest + 3, 1.4, 'the cones have faces', 0.5, 0.35, '#ffffff', 56], [E.rtTest + 6, 1.4, 'LEFT!', 0.35, 0.4, '#ffe066', 90], [E.rtTest + 8.4, 1.4, 'RIGHT!', 0.65, 0.4, '#ffe066', 90], [E.rtTest + 10.8, 1.4, 'LEFT!', 0.35, 0.4, '#ffe066', 90], [E.rtTest + 13, 1.6, 'cousins hit: 0', 0.5, 0.3, '#7cff6b', 64],
  [E.rtPass + 0.4, 1.2, 'STAMP', 0.55, 0.4, '#ff6b6b', 100], [E.rtPass + 1.2, 1.8, 'PASSED!', 0.5, 0.3, '#7cff6b', 120], [E.rtGo2 + 1, 1.6, 'bye cousins!', 0.5, 0.3, '#ff7a1a', 64], [E.rtAreWe2, 1.4, 'are we there yet?', 0.4, 0.3, '#ffffff', 56], [E.rtAreWe2 + 1.6, 1.6, 'ask me ONE more time', 0.6, 0.38, '#ff6b6b', 52],
  [E.rtDoor, 1.2, 'CLUNK', 0.7, 0.4, '#ffffff', 100], [E.rtDoor + 1.6, 1.6, 'bye door', 0.5, 0.35, '#ffffff', 64], [E.rtSign + 2.6, 1.6, '*smallest??', 0.62, 0.35, '#ff5cf0', 70], [E.rtTiny + 1, 2, "it's... tiny", 0.5, 0.3, '#5ff7ff', 80], [E.rtTwist + 1.8, 1.8, 'UPSIDE DOWN', 0.5, 0.3, '#ff6b6b', 100],
  [E.rtSput + 0.3, 1.0, 'sputter', 0.35, 0.4, '#aaaaaa', 70], [E.rtSput + 1.2, 1.0, 'cough', 0.55, 0.35, '#aaaaaa', 70], [E.rtSput + 2.4, 1.4, 'pfffft.', 0.45, 0.45, '#aaaaaa', 90], [E.rtFire + 0.3, 1.4, 'FWOOMP', 0.5, 0.4, '#ff8a2a', 90], [E.rtFire + 2, 1.8, 'INVOICE: 1 CAMPFIRE', 0.5, 0.3, '#ffffff', 56],
  [E.rtStory + 1, 1.8, 'LICENSED :)', 0.5, 0.3, '#5ff7ff', 80], [E.rtStory + 2.8, 1.4, 'yes Leggy. we know.', 0.5, 0.3, '#ffffff', 56], [E.rtMarsh + 0.6, 1.4, 'FWOOSH', 0.4, 0.4, '#ff5a1a', 100], [E.rtMarsh + 2.2, 1.4, 'crispy.', 0.55, 0.45, '#ffffff', 70],
  [E.rtStar + 0.4, 1.8, 'make a wish', 0.5, 0.25, '#fff4b0', 64], [E.rtStar + 3, 1.6, '*wave*', 0.3, 0.4, '#ff7a1a', 64], [E.rtIdea + 2.6, 1.6, '!', 0.55, 0.3, '#ffe066', 140], [E.rtLift + 0.6, 1.6, 'HNNNGH', 0.5, 0.35, '#5ff7ff', 90], [E.rtRun + 1, 1.8, 'LEGGY IS DRIVING', 0.5, 0.3, '#ffe066', 90],
  [E.rtCone2 + 1.5, 1.6, 'PULL OVER!', 0.35, 0.35, '#ff6b6b', 80], [E.rtMph, 1.8, '112 MPH', 0.5, 0.3, '#ff6b6b', 110], [E.rtMph + 3, 1.6, 'sorry officer!', 0.5, 0.35, '#ffffff', 64], [E.rtLot + 3, 1.6, 'screeeech', 0.5, 0.4, '#ffffff', 80], [E.rtDrop + 1, 1.2, 'plop.', 0.5, 0.45, '#ffffff', 80],
  [E.rtWow + 0.5, 2.2, 'WHOA', 0.5, 0.25, '#ff5cf0', 130], [E.rtPhoto + 0.4, 1.4, 'say SHARD!', 0.5, 0.25, '#ffe066', 80], [E.rtCop3 + 3, 1.8, 'PARK IT PROPERLY.', 0.5, 0.3, '#ffffff', 64], [E.rtPark + 1, 1.4, 'keep going...', 0.5, 0.3, '#ffffff', 64], [E.rtPark + 4, 1.4, 'keep going...', 0.55, 0.35, '#ffffff', 64],
  [E.rtPark + 6.4, 1.4, 'little more...', 0.5, 0.3, '#ffffff', 64], [E.rtBonk, 1.4, 'BONK', 0.5, 0.4, '#ffffff', 110], [E.rtBonk + 3, 1.6, 'wobble', 0.5, 0.3, '#ff5cf0', 80], [E.rtJump, 1.4, 'OUT OUT OUT', 0.5, 0.3, '#ff6b6b', 90], [E.rtTip + 1, 1.6, 'ROLLING', 0.5, 0.3, '#ff5cf0', 110],
  [E.rtFlat, 1.6, 'CRUNCH', 0.5, 0.35, '#ffffff', 130], [E.rtInvoice + 0.4, 1.8, '1 VAN (flat)', 0.5, 0.3, '#ffffff', 64], [E.rtShop, 1.6, 'NOT THE GIFT SHOP', 0.5, 0.3, '#ff9ecb', 80], [E.rtTicket + 3.6, 1.6, 'SLAP', 0.5, 0.4, '#ffe066', 100]];

const ZOOMS = [[E.rtSeat + 2.8, 1.0, 1.12, 0.5, 0.5], [E.rtNoLic, 1.0, 1.15, 0.5, 0.45], [E.rtTiny + 1, 1.2, 1.15, 0.5, 0.5], [E.rtTwist + 1.8, 1.0, 1.15, 0.5, 0.5], [E.rtIdea + 2.6, 0.8, 1.12, 0.5, 0.5], [E.rtFlat, 0.8, 1.15, 0.5, 0.5]];
const SHAKES = [[E.rtBump, 0.6, 0.3], [E.rtSiren, 4, 0.04], [E.rtSput, 3, 0.08], [E.rtLift + 2, 0.6, 0.3], [E.rtRun, E.rtLot - E.rtRun, 0.06], [E.rtMph, 2, 0.15], [E.rtDrop + 1, 0.5, 0.3], [E.rtBonk, 0.6, 0.35], [E.rtBonk + 1, 6, 0.06], [E.rtTip + 1.2, 1, 0.4], [E.rtFlat, 1, 0.5], [E.rtShop, 1, 0.4]];
const FLASH = [[E.rtDesert, 0.3, '255,255,255'], [E.rtNight - 1, 1.8, '0,0,0'], [E.rtDawn, 1.2, '255,200,140'], [E.rtLot, 0.3, '255,255,255'], [E.rtPhoto + 0.6, 0.5, '255,255,255'], [E.rtFlat, 0.3, '255,255,255']];
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
    outlined('EPISODE 27', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE ROAD TRIP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy is driving)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 28: THE DRAGON EGG' : 'EP 26: THE MUSEUM', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(it hatched in my hat)' : '(do not touch anything)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.rtDesert, road, 'road'], [E.rtDesert, E.rtLot, desert, 'desert'], [E.rtLot, 1e9, lot, 'lot']];
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
  const night = t >= E.rtNight && t < E.rtDawn;
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
  const panic = win(T, E.rtSiren, E.rtPull) || win(T, E.rtMph - 1, E.rtMph + 2) || win(T, E.rtJump, E.rtFlat + 1) || win(T, E.rtShop - 1, E.rtShop + 1.5);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, E.rtIdea + 3.6, E.rtDawn)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    stamp(T, E.rtGo + 2, 'DRIVER: LEGGY (?!)');
    stamp(T, E.rtPass + 2.4, 'LEGGY: LICENSED');
    stamp(T, E.rtTwist + 2.4, 'MAP: UPSIDE DOWN');
    stamp(T, E.rtRun + 4, 'FUEL TYPE: LEGS');
    drawSiren27(T);
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. she parked it.', 0, 0, 56, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that was our van.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(and that was the gift shop)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
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
