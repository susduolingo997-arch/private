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

// ---------------------------------------------------------------- Ep 28 helpers: the Dragon Egg, Pip, Mama Ember + the clutch, Bloop's Egg-Cart, the egg-warmth meter
function board28(lines, w, h, parent, x, y, z, ry = 0, bg = '#f6e7c1', fg = '#8a1020', cw = 512, ch = 192, size = 54, posts = true) { const p = pivot(parent, x, 0, z); p.rotation.y = ry; const mat = txtMat26(lines, cw, ch, bg, fg, size);
  box(w + 0.3, h + 0.3, 0.2, '#5a3a22', 0, y, 0, p); plane26(w, h, mat, p, 0, y, 0.11); plane26(w, h, mat, p, 0, y, -0.11, PI);
  if (posts) for (const s of [-1, 1]) box(0.25, y, 0.25, '#5a3a22', s * w * 0.35, y / 2, 0, p); return p; }
function card28(lines, bg, fg, size = 32) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.38), txtMat26(lines, 192, 112, bg, fg, size)); m.material.side = THREE.DoubleSide; const gr = new THREE.Group(); gr.add(m); return gr; }
const HA28 = z => z <= 24 ? clamp(Math.floor((z - 13) / 2), 0, 4) : clamp(Math.floor((35 - z) / 2), 0, 4);
const gA28 = z => 0.5 + HA28(Math.round(z)), cA28 = z => 0.5 + clamp(z <= 24 ? (z - 14) / 2 : (34 - z) / 2, 0, 4);
const hatW28 = P => [P[0], P[1] + 2.62, P[2]];
// ---- the egg (speckled, warm, wobbly) — top half pops off when it hatches
const crackM28 = new THREE.MeshBasicMaterial({ color: '#2a1408' });
function makeEgg28(col = '#fff0d0', spot = '#ff7a3a') { const root = new THREE.Group(), body = pivot(root, 0, 0, 0), top = pivot(body, 0, 0.42, 0);
  const em = new THREE.MeshLambertMaterial({ color: col, emissive: '#ff8a2a', emissiveIntensity: 0.16 }), sm = new THREE.MeshLambertMaterial({ color: spot, emissive: spot, emissiveIntensity: 0.35 });
  box(0.46, 0.12, 0.46, 0, 0, 0.06, 0, body, em); box(0.62, 0.3, 0.62, 0, 0, 0.27, 0, body, em);
  box(0.6, 0.18, 0.6, 0, 0, 0.09, 0, top, em); box(0.48, 0.16, 0.48, 0, 0, 0.26, 0, top, em); box(0.28, 0.1, 0.28, 0, 0, 0.39, 0, top, em);
  for (const [x, y, z, p] of [[0.27, 0.24, 0.12, body], [-0.27, 0.3, -0.12, body], [0.08, 0.3, 0.27, body], [-0.14, 0.1, -0.26, top], [0.18, 0.12, 0.26, top], [0.22, 0.24, -0.08, top]]) box(0.12, 0.12, 0.12, 0, x, y, z, p, sm);
  const cracks = []; for (const [x, y, r] of [[-0.17, 0.42, 0.6], [0, 0.4, -0.6], [0.17, 0.43, 0.6]]) for (const zz of [0.315, -0.315]) { const c = box(0.2, 0.04, 0.02, 0, x, y, zz, body, crackM28); c.rotation.z = r; cracks.push(c); }
  root.traverse(o => { if (o.isMesh) o.castShadow = !cracks.includes(o); }); return { root, body, top, cracks }; }
function poseEgg28(e, t, p, o = {}) { e.root.position.set(...p); e.root.rotation.set(o.rx || 0, o.yaw || 0, o.rz || 0); e.root.scale.setScalar(o.s ?? 0.8); e.body.rotation.set(0, 0, o.wobble ? Math.sin(t * 22 + (o.seed || 0)) * 0.2 * o.wobble : 0);
  e.cracks.forEach(c => c.visible = !!o.crack); const k = o.hatch || 0; e.top.position.set(k * 0.4, 0.42 + k * 1.6 - k * k * 1.1, 0); e.top.rotation.set(0, 0, -k * 2.4); e.top.visible = k < 0.98; e.root.visible = o.vis !== false; }
// ---- dragons: one model, three sizes (Pip, the five babies, Mama Ember)
function makeDragon28(s, col, belly) { const root = new THREE.Group(), body = pivot(root, 0, 1.05, 0), dk = shade(col, 0.7);
  box(1.2, 1.0, 1.8, col, 0, 0, 0, body); box(1.24, 0.42, 1.5, belly, 0, -0.32, 0.1, body); for (let i = 0; i < 4; i++) box(0.14, 0.26, 0.2, '#ffd23f', 0, 0.6, 0.6 - i * 0.45, body);
  const neck = pivot(body, 0, 0.35, 0.75); box(0.6, 1.0, 0.6, col, 0, 0.45, 0.05, neck); box(0.5, 0.8, 0.12, belly, 0, 0.42, 0.33, neck);
  const hd = pivot(neck, 0, 0.95, 0.1); box(0.92, 0.76, 0.9, col, 0, 0.12, 0.1, hd); box(0.62, 0.36, 0.55, col, 0, 0.02, 0.78, hd);
  const jaw = pivot(hd, 0, -0.22, 0.4); box(0.58, 0.16, 0.7, dk, 0, -0.04, 0.3, jaw); box(0.5, 0.06, 0.1, '#ffffff', 0, 0.06, 0.6, jaw);
  for (const x of [-0.14, 0.14]) box(0.08, 0.08, 0.04, '#2a1408', x, 0.1, 1.06, hd);
  const eyeW = new THREE.MeshBasicMaterial({ color: '#ffffff' }), pupils = [];
  for (const x of [-0.27, 0.27]) { box(0.24, 0.26, 0.05, 0, x, 0.26, 0.56, hd, eyeW); pupils.push(box(0.12, 0.16, 0.05, '#1a1020', x, 0.24, 0.585, hd)); }
  const lids = [-0.27, 0.27].map(x => box(0.28, 0.12, 0.07, col, x, 0.45, 0.57, hd));
  for (const x of [-0.3, 0.3]) { const h = box(0.14, 0.42, 0.14, '#ffd23f', x, 0.62, -0.12, hd); h.rotation.x = -0.45; }
  const flame = pivot(hd, 0, 0.0, 1.1), fl = [['#ff5a1a', 0.5, 0.25], ['#ff9a2a', 0.36, 0.7], ['#ffe066', 0.24, 1.05]].map(([c, sz, z]) => box(sz, sz, sz * 1.4, 0, 0, 0, z, flame, new THREE.MeshBasicMaterial({ color: c })));
  const wings = [-1, 1].map(sd => { const w = pivot(body, sd * 0.6, 0.45, 0.1); box(1.5, 0.08, 1.0, dk, sd * 0.75, 0, 0, w); box(1.2, 0.06, 0.5, belly, sd * 0.75, -0.04, -0.55, w); return w; });
  const tail = pivot(body, 0, -0.05, -0.9); box(0.55, 0.45, 1.0, col, 0, 0, -0.45, tail); const tail2 = pivot(tail, 0, 0, -0.95); box(0.34, 0.3, 0.9, col, 0, 0, -0.4, tail2); box(0.5, 0.12, 0.4, '#ffd23f', 0, 0, -0.9, tail2);
  const legs = [[-0.42, 0.55], [0.42, 0.55], [-0.42, -0.55], [0.42, -0.55]].map(([x, z]) => { const l = pivot(body, x, -0.5, z); box(0.36, 0.56, 0.4, dk, 0, -0.27, 0.02, l); return l; });
  root.scale.setScalar(s); root.traverse(o => { if (o.isMesh) o.castShadow = !fl.includes(o); });
  return { root, body, neck, hd, jaw, flame, fl, wings, tail, tail2, legs, pupils, lids, s }; }
function poseDragon28(d, t, p, yaw, o = {}) { const sd = o.seed || 0; d.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9 + sd)) * 0.5 * d.s : 0), p[2]); d.root.rotation.set(o.pitch || 0, yaw, o.roll || 0);
  d.body.position.y = 1.05 + Math.sin(t * 2.2 + sd) * 0.03 + (o.walk ? Math.abs(Math.sin(t * 7)) * 0.06 : 0) - (o.crouch || 0) * 0.35; d.body.rotation.set(-(o.rear || 0) * 0.5, 0, 0);
  const a = o.flap ? Math.sin(t * (8 + o.flap * 6) + sd) * 0.95 : 0.85 + Math.sin(t * 1.5 + sd) * 0.05; d.wings.forEach((w, i) => w.rotation.set(0, 0, (i ? 1 : -1) * a));
  d.neck.rotation.set(-(o.neckUp || 0) * 0.5 + (o.neckDown || 0), o.neckYaw || 0, 0);
  d.hd.rotation.set((o.headPitch || 0) + (o.roar ? -0.4 : 0), o.headYaw || 0, o.headRoll || 0);
  const fk = o.fire || 0; d.jaw.rotation.x = o.roar || fk > 0.05 ? 0.55 + Math.sin(t * 30) * 0.05 : o.chew ? Math.abs(Math.sin(t * 10)) * 0.4 : 0;
  d.tail.rotation.set(0.15, Math.sin(t * 1.8 + sd) * 0.3 + (o.tailSwing || 0), 0); d.tail2.rotation.set(-0.1, Math.sin(t * 1.8 + sd - 0.8) * 0.35, 0);
  d.legs.forEach((l, i) => l.rotation.set(o.walk ? Math.sin(t * 7 + (i === 0 || i === 3 ? 0 : PI)) * 0.5 : o.fly ? 0.7 : 0, 0, 0));
  d.flame.visible = fk > 0.02; d.flame.scale.set(fk * (0.85 + 0.2 * Math.sin(t * 40)), fk * (0.85 + 0.2 * Math.cos(t * 37)), fk * (o.fireLen || 1)); d.fl.forEach((m, i) => m.rotation.z = t * (3 + i));
  d.pupils.forEach(m => m.scale.set(o.wide ? 1.5 : 1, o.wide ? 1.5 : o.narrow ? 0.4 : 1, 1)); d.lids.forEach(m => m.position.y = o.narrow ? 0.36 : o.happy ? 0.3 : 0.45); }
const pip28 = makeDragon28(0.26, '#3ad6a0', '#ffd27a'), mama28 = makeDragon28(3.0, '#c0283a', '#ffb050');
const mamaL28 = new THREE.PointLight('#ff7a2a', 0, 40, 1.3); mamaL28.position.set(0, 0, 2.2); mama28.hd.add(mamaL28);
const babies28 = ['#ff8ac0', '#6ab0ff', '#ffd23f', '#9a7aff', '#7cff6b'].map(c => makeDragon28(0.2, c, '#fff0c8'));
const egg28 = makeEgg28(), clutch28 = [['#fff0f6', '#ff5ca8'], ['#eef6ff', '#3a8aff'], ['#fffbe0', '#e0a800'], ['#f4eeff', '#7a4aff'], ['#efffe8', '#2ab04a']].map(([c, s]) => makeEgg28(c, s));
// ---- Bloop's Egg-Cart (a padded wheelbarrow with a heat lamp. what could go wrong)
const lampM28 = new THREE.MeshBasicMaterial({ color: '#ffd080' });
function makeCart28() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(1.3, 0.12, 1.5, '#8a5a2b', 0, 0.7, 0, body); for (const [w, d, x, z] of [[0.12, 1.5, -0.6, 0], [0.12, 1.5, 0.6, 0], [1.3, 0.12, 0, 0.7], [1.3, 0.12, 0, -0.7]]) box(w, 0.4, d, '#a06a3a', x, 0.95, z, body);
  box(1.1, 0.14, 1.3, '#ff9ecb', 0, 0.8, 0, body);
  const wheel = pivot(body, 0, 0.32, 0.95); box(0.14, 0.62, 0.62, '#2a2a30', 0, 0, 0, wheel); box(0.16, 0.24, 0.24, '#c0c0c8', 0, 0, 0, wheel); box(0.1, 0.5, 0.1, '#5a3a22', 0, 0.55, 0.85, body);
  for (const x of [-0.5, 0.5]) { box(0.1, 0.1, 1.1, '#5a3a22', x, 0.75, -1.15, body); box(0.1, 0.5, 0.1, '#5a3a22', x, 0.45, -0.55, body); }
  box(0.08, 1.4, 0.08, '#c0c0c8', 0.55, 1.5, -0.55, body); box(0.08, 0.08, 0.7, '#c0c0c8', 0.55, 2.2, -0.25, body);
  const lamp = box(0.36, 0.26, 0.36, 0, 0.55, 2.05, 0.1, body, lampM28); const light = new THREE.PointLight('#ffb050', 0, 8, 1.5); light.position.set(0.55, 1.8, 0.1); body.add(light);
  plane26(1.2, 0.34, txtMat26(['EGG-CART'], 256, 72, '#2ec4b6', '#ffffff', 44), body, 0, 0.95, -0.77, PI);
  root.traverse(o => { if (o.isMesh) o.castShadow = o !== lamp; });
  const fire = new THREE.Group(); body.add(fire); fire.position.set(0, 1.0, 0); const fl = ['#ff5a1a', '#ff8a2a', '#ffd23f', '#ff5a1a', '#ff8a2a'].map((c, i) => box(0.4, 0.5, 0.4, 0, (i - 2) * 0.28, 0.2 + (i % 2) * 0.2, (i % 3 - 1) * 0.3, fire, new THREE.MeshBasicMaterial({ color: c })));
  fl.forEach(m => m.castShadow = false); return { root, body, wheel, lamp, light, fire, fl }; }
const cart28 = makeCart28();
// ---- props: invoices, the fireberry, the gold block, the fireball (hiccup), the hat fire
const inv28a = card28(['INVOICE', '1 EGG-CART'], '#ffffff', '#c0182a'), inv28b = card28(['INVOICE', '1 EGG DELIVERY'], '#ffffff', '#c0182a', 26), inv28c = card28(['BABYSITTING', 'PER HOUR'], '#ffffff', '#c0182a', 28), inv28d = card28(['INVOICE', '1 HAT (toast)'], '#ffffff', '#c0182a', 28);
for (const c of [inv28a, inv28b, inv28c, inv28d]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const invM28 = inv28a.children[0].material, burntM28 = new THREE.MeshBasicMaterial({ color: '#1a1410', side: THREE.DoubleSide });
const berry28 = new THREE.Group(); { box(0.26, 0.26, 0.26, 0, 0, 0, 0, berry28, new THREE.MeshLambertMaterial({ color: '#ff2a3a', emissive: '#c0101a', emissiveIntensity: 0.5 })); box(0.12, 0.08, 0.12, '#3cc26a', 0, 0.16, 0, berry28); } L6.hd.add(berry28); berry28.position.set(0, -0.35, 1.05);
const berryBurnt28 = box(0.28, 0.28, 0.28, '#1a1410', 0, 0, 0, berry28);
const gold28 = new THREE.Mesh(GEO, MAT.goldblk); gold28.scale.setScalar(0.45);
const fb28 = new THREE.Group(); { box(0.34, 0.34, 0.34, 0, 0, 0, 0, fb28, new THREE.MeshBasicMaterial({ color: '#ff7a1a' })); box(0.2, 0.2, 0.2, 0, 0, 0, 0.12, fb28, new THREE.MeshBasicMaterial({ color: '#ffe066' })); const l = new THREE.PointLight('#ff8a2a', 6, 8, 1.5); fb28.add(l); }
function shoot28(t, g, L) { fb28.visible = false; for (const [t0, d, a, b] of L) if (win(t, t0, t0 + d)) { parentTo(fb28, g); fb28.visible = true; fb28.position.set(...L3(a, b, seg(t, t0, t0 + d))); fb28.rotation.set(t * 9, t * 7, 0); } }
const hatFire28 = new THREE.Group(); capHat.add(hatFire28); hatFire28.position.y = 0.32; const hfl28 = [['#ff5a1a', 0.5, 0, 0], ['#ff8a2a', 0.36, 0.18, 0.3], ['#ffd23f', 0.24, -0.1, 0.55], ['#ff5a1a', 0.3, 0.22, 0.2], ['#ff8a2a', 0.28, -0.2, 0.25]].map(([c, s, x, y]) => box(s, s, s, 0, x, y, 0, hatFire28, new THREE.MeshBasicMaterial({ color: c })));
hfl28.forEach(m => m.castShadow = false);
function hide28() { hide25(); [owl.root, rex.root, cart26, vaseA, vaseB, vaseShards, rexPile, boneT, skullF, paintP, egg28.root, cart28.root, pip28.root, mama28.root, fb28, inv28a, inv28b, inv28c, inv28d, berry28, gold28, hatFire28, ...babies28.map(b => b.root), ...clutch28.map(e => e.root)].forEach(o => o.visible = false); mamaL28.intensity = 0; }
function pipAt28(t, parent, p, yaw, sc, o) { parentTo(pip28.root, parent); pip28.root.visible = true; poseDragon28(pip28, t, p, yaw, o); pip28.root.scale.setScalar(sc); }
// ---- HUD: egg warmth (Act 1-2) → what is on my head (Act 2-3)
const EGGT28 = [0, 1, 2, 3, 4].map(i => E.dgStack + i * 1.5);
function warm28(t) { return lerpK([[E.dgGo, 0.5], [E.dgCold, 0.5], [E.dgCold + 2.5, 0.14], [E.dgCold + 4.5, 0.55], [E.dgBump, 0.52], [E.dgBump + 4, 0.3], [E.dgCatch + 1, 0.5], [E.dgLamp + 1, 0.55], [E.dgHot, 0.82], [E.dgFire, 1], [E.dgFire + 1.6, 0.52], [E.dgWobble, 0.55], [E.dgHatch, 0.62]], t); }
function drawEggHUD28(t) { if (t >= E.freeze || t < E.dgGo - 1) return;
  rrect(22, 96, 240, 112, 12); ctx.fillStyle = 'rgba(30,16,12,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff9a2a'; ctx.stroke();
  if (t < E.dgHatch) { const w = warm28(t), lab = w < 0.25 ? 'TOO COLD' : w > 0.78 ? 'TOO HOT!' : 'JUST RIGHT', col = w < 0.25 ? '#6ab0ff' : w > 0.78 ? '#ff4a2a' : '#7cff6b', fl = lab !== 'JUST RIGHT' && Math.floor(t * 4) % 2;
    outlined('EGG WARMTH', 142, 114, 15, '#ffd27a', '#000', 3);
    const gr = ctx.createLinearGradient(40, 0, 244, 0); gr.addColorStop(0, '#3a7aff'); gr.addColorStop(0.5, '#7cff6b'); gr.addColorStop(1, '#ff3a1a'); rrect(40, 132, 204, 16, 7); ctx.fillStyle = gr; ctx.fill();
    const x = 40 + 204 * clamp(w, 0, 1); ctx.fillStyle = '#fff'; ctx.fillRect(x - 3, 126, 6, 28); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(x - 3, 126, 6, 28);
    outlined(lab, 142, 170, 20, fl ? '#ffffff' : col, '#000', 4); outlined(t >= E.dgFire + 1.6 ? 'incubator: my hat' : t >= E.dgFire ? 'incubator: ON FIRE' : 'incubator: Egg-Cart', 142, 194, 13, '#fff', '#000', 3); return; }
  const eggs = win(t, E.dgStack, E.dgHatchAll) ? EGGT28.filter(a => t >= a + 0.9).length : 0, drag = t < E.dgFly ? 1 : t >= E.dgHatchAll ? 5 : 0, burn = t >= E.dgHic3 + 0.4, fl = Math.floor(t * 4) % 2;
  outlined('ON MY HEAD', 142, 114, 15, '#ffd27a', '#000', 3);
  outlined(eggs ? eggs + (eggs > 1 ? ' eggs' : ' egg') : drag ? drag + (drag > 1 ? ' dragons' : ' dragon') : 'nothing. (sad)', 142, 144, 24, eggs ? '#fff0d0' : drag ? '#7cff6b' : '#aaaaaa', '#000', 5);
  outlined(burn ? 'HAT: ON FIRE' : eggs > 3 ? 'HAT: wobbly' : 'HAT: fine', 142, 180, 18, burn ? (fl ? '#ff3a1a' : '#ffe066') : '#ffffff', '#000', 4); }
function drawHeat28(T) { const on = win(T, E.dgChase + 0.6, E.dgChase + 1.8) || win(T, E.dgChase + 5, E.dgChase + 6.2) || win(T, E.dgChase + 8.5, E.dgChase + 9.7) || win(T, E.dgHic3, E.dgHic3 + 0.8);
  if (!on) return; const gr = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.9); gr.addColorStop(0, 'rgba(255,120,20,0)'); gr.addColorStop(1, `rgba(255,90,10,${0.35 + 0.1 * Math.sin(T * 30)})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }

// ================================================================ EPISODE 28: "THE DRAGON EGG (it hatched in my hat)" — Whisperwood meadow (Leggy sniffs out an egg; LOST: 1 EGG; the Egg-Cart; the runaway egg; the lamp goes to MAX; incubator: my hat) → the Cinder Trail at sunset (it hatches; Pip thinks I'm his mom; fire hiccups; Leggy's flying lesson) → Ember Peak at night (Mama Ember; the chase; Pip flies; paid in gold; dawn; five more eggs. on my hat.)
// ---------------------------------------------------------------- set A: Whisperwood meadow (morning)
const meadow = (() => {
  const g = mk('meadow'); const st = new VSet(g);
  for (let x = -44; x <= 44; x++) for (let z = -44; z <= 70; z++) { const h = HA28(z), pth = Math.abs(x) <= 1 && z > -30;
    if (h === 0) st.add(x, 0, z, pth ? 'path' : 'turf'); else { st.add(x, 0, z, 'soil'); for (let y = 1; y <= h; y++) st.add(x, y, z, y === h ? (pth ? 'path' : 'turf') : 'soil'); } }
  for (const [x, z, h] of [[-12, -20, 6], [11, -16, 5], [-14, -6, 7], [13, -2, 6], [-11, 8, 5], [12, 10, 6], [-16, 20, 6], [15, 22, 7], [-12, 38, 6], [13, 38, 5], [-14, 50, 7], [12, 58, 6], [-20, -30, 7], [20, -28, 6], [-22, 30, 6], [22, 48, 6], [-4, 5, 5]]) tree20(st, x, z, h, false);
  for (const [x, y, z] of [[2, 1, 5], [3, 1, 5], [4, 1, 5], [2, 1, 6], [3, 1, 6], [4, 1, 6], [3, 2, 5], [3, 2, 6]]) st.add(x, y, z, 'leaf');
  st.add(0, 5, 24, 'stone'); st.build();
  board28(['LOST: 1 EGG', 'return to EMBER PEAK', 'REWARD!  - Mama'], 2.6, 1.5, g, -4, 2.3, 4.32, 0, '#f6e7c1', '#8a1020', 384, 220, 46, false);
  const volc = pivot(g, 30, 0, 150); for (let i = 0; i < 7; i++) box(70 - i * 9, 8, 70 - i * 9, '#4a3a3e', 0, 4 + i * 8, 0, volc).castShadow = false; box(8, 1, 8, 0, 0, 56.5, 0, volc, new THREE.MeshBasicMaterial({ color: '#ff6a2a' }));
  burst(E.dgEgg + 0.2, [2.2, 1.0, 2.4], { n: 50, colors: ['#ffe066', '#ff9a2a', '#ffffff'], speed: 4, size: 0.12, life: 1.2, grav: 2, up: 2 });
  burst(E.dgSniff + 1, [3, 1.6, 4.6], { n: 24, colors: ['#3cc26a', '#2a8a4a'], speed: 3, size: 0.14, life: 0.8, grav: 6, up: 2 });
  smoke(E.dgCold, E.dgCold + 4, 0.2, [0, 4.5, 11], { n: 3, colors: ['#e8f8ff', '#ffffff'], speed: 2, size: 0.08, life: 1.6, grav: 1, up: 0 });
  burst(E.dgCold + 2.8, [-0.6, 2.6, 13], { n: 26, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.16, life: 1.2, grav: -1, up: 1 });
  burst(E.dgBump, [0, 5.6, 24], { n: 36, colors: ['#9a9490', '#c8c0b8'], speed: 3, size: 0.18, life: 0.8, grav: 6, up: 2 });
  for (const z of [28, 30, 32, 34]) burst(lerp(E.dgBump + 0.8, E.dgCatch - 0.4, (z - 26) / 19.4), [0, cA28(z), z], { n: 10, colors: ['#3cc2a3', '#8b5a3c'], speed: 2, size: 0.12, life: 0.6, grav: 6, up: 1.5 });
  burst(E.dgCatch + 0.6, [0.4, 2.4, 47.6], { n: 40, colors: ['#7cff6b', '#ffffff', '#5ff7ff'], speed: 4, size: 0.12, life: 1, grav: 2, up: 2 });
  smoke(E.dgHot, E.dgFire, 0.15, [0.55, 2.4, 42.1], { n: 3, colors: ['#777777', '#999999', '#555555'], speed: 0.8, size: 0.3, life: 1.6, grav: -1.5, up: 1 });
  burst(E.dgFire, [0, 1.6, 42], { n: 90, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 7, size: 0.2, life: 1.2, grav: 2, up: 3 });
  smoke(E.dgFire, E.dgCinder, 0.2, [0, 2, 42], { n: 3, colors: ['#ff8a2a', '#ffd23f', '#555555'], speed: 0.8, size: 0.22, life: 1.4, grav: -2, up: 1.5 });
  burst(E.dgFire + 1.6, [1.8, 3.4, 42.8], { n: 30, colors: ['#ffe066', '#ffffff'], speed: 3, size: 0.1, life: 0.8, grav: 1, up: 2 });
  smoke(0, E.dgCinder, 0.8, [30, 58, 150], { n: 3, colors: ['#6a6060', '#8a8080'], speed: 2, size: 3, life: 5, grav: -1.5, up: 2 });
  const C = [[0, 6, 5, -26, 0, 2, -8, 55], [7.9, 4, 3.5, -20, 0, 1.5, -4, 50], [8, 9.5, 3.6, -4.5, 3, 1.5, 3, 48], [13.9, 8.5, 3.2, -3, 3, 1.4, 3.5, 44],
    [14, 2.6, 1.0, -0.6, 2.2, 0.9, 2.4, 40], [19.9, 2.4, 1.1, 0.4, 2.2, 0.8, 2.4, 34], [20, -5.6, 2.6, 0.2, -3.8, 2.3, 4.3, 46], [25.9, -5.4, 2.5, 1.0, -3.8, 2.3, 4.3, 40],
    [26, 1, 3.8, -3, 8, 8, 60, 50], [30.9, 1.5, 4.6, -4, 20, 22, 140, 34], [31, -4, 2.4, -7.5, -6, 1.2, -1, 50], [35.9, 1.6, 2.8, -5.6, -0.4, 1.2, 1.0, 48],
    [36, 5.5, 3, -3, 0.6, 1.3, 1.6, 48], [40.9, 6, 3.4, -4.4, 0.6, 1.3, 2.0, 50], [41, 3.5, 1.4, 10, 0, 1.6, 3, 48], [45.9, 3.0, 2.4, 14.5, 0, 1.6, 9.2, 48],
    [46, -6.5, 2.4, 8, -1, 1.5, 10.5, 46], [51.9, -6.2, 3.2, 14.5, -1, 1.8, 16, 44], [52, 9, 5, 14, 0, 3, 19, 50], [56.5, 8, 7.5, 20, 0, 5, 23, 48],
    [64, 4.5, 2.6, 44.5, 0.4, 2, 47.5, 46], [69.9, 4.2, 3.0, 45.5, 0.6, 1.8, 46, 50], [70, -3.2, 2.6, 45.2, 0, 1.6, 42, 46], [74.9, -3.6, 2.2, 44.4, 0.2, 1.8, 42, 40],
    [75, -3.2, 2.8, 38.6, 0.2, 1.6, 42.2, 44], [78.9, -2.8, 2.5, 39.4, 0.2, 1.7, 42.2, 38], [79, 7, 4, 36, 1, 2.5, 42.5, 54], [81.9, 6.5, 3.6, 37.5, 1.6, 2.6, 42.8, 48],
    [82, 2.6, 3.3, 38.8, 1.8, 3.0, 42.8, 42], [86.9, 2.4, 3.4, 39.4, 1.8, 3.1, 42.8, 38], [87, 3.5, 0.9, 56, 0.5, 2, 46, 50], [E.dgCinder, 3.2, 1.1, 54, 0.5, 2.2, 47, 50]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root, cart28.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = cart28.root.visible = true; bloop6.B.root.visible = t > E.dgCart - 0.5; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
    // ---- Bloop + the Egg-Cart
    const bA = act(t, [[0, -9, 0.5, -1.5], [E.dgCart, -9, 0.5, -1.5], [E.dgCart + 3, -2.2, 0.5, -1.5], [E.dgCart + 4, 0, 0.5, 0], [E.dgGo, 0, 0.5, 0], [E.dgBump - 0.2, 0, 0.5, 21.5], [E.dgBump + 1, 0, 0.5, 21.5], [E.dgCatch + 2, 0, 0.5, 40.5],
      [E.dgOn - 1, 0, 0.5, 40.5], [E.dgOn + 0.5, -1.6, 0.5, 41.2], [E.dgCinder, -1.6, 0.5, 48]], [[0, {}]]);
    const BP = [bA.p[0], gA28(bA.p[2]), bA.p[2]], byaw = (t < E.dgCart + 4 || (t > E.dgOn - 1 && bA.walk)) ? bA.yaw : 0;
    const bo = { walk: bA.walk, phase: bA.phase * 2, ...pick(t, [[0, {}], [E.dgCart + 4, { hop: t < E.dgCart + 5.2 }], [E.dgInv, { handOut: true }], [E.dgInv + 1.6, {}], [E.dgBump, { angry: true }], [E.dgBump + 1.4, {}], [E.dgLamp + 0.8, { handOut: true }], [E.dgHot + 1, { hop: true }], [E.dgFire, { angry: true }], [E.dgFire + 2, { facepalm: true }], [E.dgOn - 1, {}]]) };
    poseBurble(bloop6, t, BP, byaw, bo); inv28a.visible = win(t, E.dgInv, E.dgInv + 1.6);
    if (win(t, E.dgCart, E.dgCatch + 2) && !bo.handOut && !bo.angry && !bo.hop) { bloop6.B.aL.rotation.set(-1.3, 0, 0); bloop6.B.aR.rotation.set(-1.3, 0, 0); }
    if (win(t, E.dgLamp + 0.8, E.dgHot + 1)) bloop6.B.aR.rotation.z = Math.sin(t * 14) * 0.5;
    const cP = t >= E.dgCatch + 2 ? [0, 0, 42] : wl(BP, byaw, [0, 0, 1.5]), cyaw = t >= E.dgCatch + 2 ? 0 : byaw; cP[1] = gA28(cP[2]);
    cart28.root.position.set(...cP); cart28.root.rotation.set(0, cyaw, 0); cart28.wheel.rotation.x = cP[2] / 0.31 + cP[0] * 0.3; cart28.body.rotation.x = win(t, E.dgBump, E.dgBump + 0.5) ? -Math.sin(seg(t, E.dgBump, E.dgBump + 0.5) * PI) * 0.25 : 0;
    const lk = seg(t, E.dgLamp + 1, E.dgFire), burn = t >= E.dgFire; cart28.fire.visible = burn; cart28.fl.forEach((m, i) => m.scale.setScalar(0.8 + 0.4 * Math.sin(t * 15 + i * 2)));
    lampM28.color.set(burn ? '#3a2a20' : new THREE.Color('#ffd080').lerp(new THREE.Color('#ff3a1a'), lk)); cart28.light.color.set(burn ? '#ff7a2a' : '#ffb050'); cart28.light.intensity = burn ? 9 + Math.sin(t * 23) * 2 : t > E.dgCart ? 2 + lk * 12 : 0;
    // ---- me
    const EGG0 = [2.2, 0.5, 2.4], hA = act(t, [[0, -1, 0.5, -17], [E.dgSniff + 3, 0, 0.5, -2.5], [E.dgEgg + 0.5, 0, 0.5, -2.5], [E.dgEgg + 1.8, 1, 0.5, 0.4], [E.dgSign, 1, 0.5, 0.4], [E.dgSign + 1.5, -2.2, 0.5, 3.0], [E.dgPeak, -2.2, 0.5, 3.0],
      [E.dgPeak + 1, -2.6, 0.5, 1.2], [E.dgCart, -2.6, 0.5, 1.2], [E.dgCart + 1.5, 1.4, 0.5, 0.4], [E.dgGo - 0.6, 1.4, 0.5, 0.4], [E.dgGo, 1.8, 0.5, 1.5], [E.dgBump, 1.8, 0.5, 23], [E.dgBump + 1, 1.8, 0.5, 24], [E.dgCatch, 1.8, 0.5, 42.8],
      [E.dgOn, 1.8, 0.5, 42.8], [E.dgCinder, 1.8, 0.5, 49.5]],
      [[0, { face: 'smug', wave: t < 3 }], [E.dgSniff, { face: 'normal' }], [E.dgEgg, { face: 'scared', panic: t < E.dgEgg + 0.6 }], [E.dgEgg + 1.8, { face: 'smug', yaw: faceTo([1, 0, 0.4], EGG0) }], [E.dgSign + 1.5, { face: 'normal', yaw: -0.6 }],
       [E.dgSign + 4, { face: 'smug', yaw: -0.6 }], [E.dgPeak, { face: 'smug', yaw: 0.2, wave: t < E.dgPeak + 3 }], [E.dgPeak + 1, { face: 'smug', yaw: 0.2 }], [E.dgCart, { face: 'smug' }], [E.dgCart + 1.5, { face: 'smug', yaw: -1.6 }],
       [E.dgInv, { face: 'normal', yaw: -1.8 }], [E.dgLoad, { face: 'smug', yaw: 0.6, hold: true }], [E.dgLoad + 1.2, { face: 'smug', yaw: 0 }], [E.dgGo, { face: 'smug' }], [E.dgCold, { face: 'scared', headYaw: -0.8 }], [E.dgCold + 4, { face: 'smug' }],
       [E.dgBump, { face: 'scared', panic: true }], [E.dgCatch, { face: 'scared', yaw: 0.2, lean: 0.35 }], [E.dgCatch + 3, { face: 'smug', yaw: -0.4 }], [E.dgLamp, { face: 'normal', yaw: -PI / 2 }], [E.dgHot, { face: 'scared', yaw: -PI / 2 }],
       [E.dgFire, { face: 'scared', yaw: -PI / 2, panic: t < E.dgFire + 1.2 }], [E.dgFire + 1.4, { face: 'scared', yaw: PI }], [E.dgHat, { face: 'smug', yaw: PI }], [E.dgOn, { face: 'smug' }]]);
    const HP = [hA.p[0], gA28(hA.p[2]), hA.p[2]]; pose(hero, { t, ...hA, p: HP });
    // ---- Leggy (the egg's self-appointed mom)
    const lA = act(t, [[0, 2.5, 0.5, -12], [E.dgSniff, 3, 0.5, 2.2], [E.dgEgg - 0.3, 3, 0.5, 2.2], [E.dgEgg + 0.8, 5, 0.5, 2.6], [E.dgLoad + 0.6, 5, 0.5, 2.6], [E.dgLoad + 1.6, 2.5, 0.5, -2.6], [E.dgGo + 0.6, -2.4, 0.5, -1.5], [E.dgCold, -2.4, 0.5, 9.9],
      [E.dgCold + 1, -1.25, 0.5, 11.2], [E.dgCold + 4.5, -1.25, 0.5, 15.8], [E.dgCold + 5.5, -2.4, 0.5, 17.1], [E.dgBump, -2.4, 0.5, 23], [E.dgBump + 0.8, -2.4, 0.5, 24], [E.dgCatch - 0.8, 0.4, 0.5, 48.2], [E.dgOn, 0.4, 0.5, 48.2], [E.dgCinder, -1.2, 0.5, 54.5]], [[0, {}]]);
    const LP = [lA.p[0], gA28(lA.p[2]), lA.p[2]], ly = lA.walk && !win(t, E.dgEgg - 0.3, E.dgEgg + 0.8) && !win(t, E.dgCatch - 1.6, E.dgOn) ? lA.yaw : t < E.dgEgg ? 0 : t < E.dgLoad + 0.6 ? -PI / 2 : win(t, E.dgCatch - 1.6, E.dgOn) ? PI : 0;
    poseLurk(L6, t, LP, ly, lA.walk ? (win(t, E.dgBump, E.dgCatch) ? 5 : 2) : 0.4);
    if (win(t, E.dgSniff, E.dgEgg)) L6.hd.rotation.x = 0.4 + Math.sin(t * 12) * 0.15;
    if (win(t, E.dgCold + 1, E.dgCold + 4.5)) { L6.root.rotation.z = -0.22; L6.light.color.set('#ffb070'); L6.light.intensity = 7; }
    if (win(t, E.dgCatch - 0.4, E.dgCatch + 0.6)) L6.hd.rotation.x = 0.5;
    // ---- the egg
    const tray = wl(cP, cyaw, [0, 0.88, 0]), back = [LP[0], LP[1] + 1.75 + L6.body.position.y - 1.3, LP[2]], HW = hatW28(HP); let eP, eo = {}, inHat = false;
    if (t < E.dgEgg) eP = [3.2, 0.5, 5.4];
    else if (t < E.dgEgg + 0.8) eP = arcPath(t, [[E.dgEgg, 3.2, 0.5, 5.4, 0], [E.dgEgg + 0.8, ...EGG0, 0.6]]);
    else if (t < E.dgLoad) { eP = EGG0; eo.wobble = win(t, E.dgEgg + 0.8, E.dgEgg + 2.5) ? 0.5 : 0; }
    else if (t < E.dgLoad + 1) eP = arcPath(t, [[E.dgLoad, ...EGG0, 0], [E.dgLoad + 1, ...tray, 1.2]]);
    else if (t < E.dgBump) { eP = tray; eo = { yaw: cyaw, wobble: win(t, E.dgCold, E.dgCold + 3) ? 0.6 : 0 }; }
    else if (t < E.dgBump + 0.8) eP = arcPath(t, [[E.dgBump, ...tray, 0], [E.dgBump + 0.8, 0, gA28(26), 26, 1.5]]);
    else if (t < E.dgCatch) { const z = lerp(26, 45.4, seg(t, E.dgBump + 0.8, E.dgCatch - 0.4)); eP = [0, gA28(z) + Math.abs(Math.sin(z * PI / 2)) * 0.15, z]; eo.rx = (z - 26) / 0.33; }
    else if (t < E.dgCatch + 0.7) eP = arcPath(t, [[E.dgCatch, 0, 0.5, 45.4, 0], [E.dgCatch + 0.7, ...back, 1.2]]);
    else if (t < E.dgLamp) eP = back;
    else if (t < E.dgLamp + 0.8) eP = arcPath(t, [[E.dgLamp, ...back, 0], [E.dgLamp + 0.8, ...tray, 1.5]]);
    else if (t < E.dgFire) { eP = tray; eo.wobble = seg(t, E.dgHot, E.dgFire); }
    else if (t < E.dgFire + 1.6) { eP = arcPath(t, [[E.dgFire, ...tray, 0], [E.dgFire + 1.6, ...HW, 4]]); eo.rx = t * 9; }
    else inHat = true;
    if (inHat) { parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], {}); } else { parentTo(egg28.root, g); poseEgg28(egg28, t, eP, eo); }
    let cam = camKeys(t, C); if (win(t, 56.5, 64)) { const z = t < E.dgBump + 0.8 ? lerp(24, 26, seg(t, 56.5, E.dgBump + 0.8)) : eP[2]; cam = { p: [1.5, cA28(z - 7) + 6, z - 7], l: [0, cA28(z) + 0.4, z + 1], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Cinder Trail (sunset) — it hatches
const cinder = (() => {
  const g = mk('cinder'); const st = new VSet(g);
  for (let x = -40; x <= 40; x++) for (let z = -30; z <= 60; z++) { const ax = Math.abs(x), lava = z >= 6 && z <= 8 && !(z === 7 && (x === 0 || x === -2 || x === 3)), pool = Math.hypot(x - 11, z - 2) < 3.2 || Math.hypot(x + 12, z - 20) < 3.6;
    st.add(x, 0, z, lava || pool ? 'lava' : ax <= 1 ? 'ash' : hash2(x, z, 28) > 0.55 ? 'basalt' : 'ash'); if (lava && hash2(x, z, 5) > 0.85) st.add(x, 0, z, 'crust'); }
  for (const [x, z, h] of [[-8, -4, 4], [9, -10, 6], [-14, 6, 7], [15, 14, 5], [-9, 26, 6], [10, 30, 8], [-18, -14, 5], [18, -2, 7], [-6, 40, 5], [7, 44, 6], [-20, 34, 8], [20, 40, 6]]) for (let y = 1; y <= h; y++) { st.add(x, y, z, 'basalt'); if (y < h - 1) { st.add(x + 1, y, z, 'basalt'); st.add(x, y, z + 1, 'basalt'); } }
  for (let y = 1; y <= 2; y++) st.add(6, y, 17, 'basalt'); st.add(7, 1, 17, 'basalt');
  st.build();
  const volc = pivot(g, 10, 0, 110); for (let i = 0; i < 7; i++) box(60 - i * 8, 7, 60 - i * 8, '#3a2a2e', 0, 3.5 + i * 7, 0, volc).castShadow = false; box(10, 1, 10, 0, 0, 49.5, 0, volc, new THREE.MeshBasicMaterial({ color: '#ff5a1a' }));
  const bush = pivot(g, 5.8, 0.5, 14.6); box(1.3, 1.0, 1.3, '#4a2a2a', 0, 0.5, 0, bush); for (const [x, y, z] of [[0.4, 1.0, 0.3], [-0.3, 1.05, -0.2], [0.1, 0.8, 0.66], [-0.66, 0.6, 0.2], [0.66, 0.5, -0.3]]) box(0.22, 0.22, 0.22, 0, x, y, z, bush, new THREE.MeshLambertMaterial({ color: '#ff2a3a', emissive: '#c0101a', emissiveIntensity: 0.5 }));
  for (const [x, z] of [[0, 7], [11, 2], [-12, 20]]) { const l = new THREE.PointLight('#ff6a1a', 10, 18, 1.4); l.position.set(x, 1.5, z); g.add(l); }
  smoke(E.dgCinder, E.dgNight, 0.9, [10, 51, 110], { n: 3, colors: ['#5a4a4a', '#7a6060'], speed: 2, size: 3, life: 5, grav: -1.5, up: 2 });
  smoke(E.dgCinder, E.dgNight, 0.5, [0, 0.8, 7], { n: 2, colors: ['#ff8a2a', '#ffd23f'], speed: 0.6, size: 0.1, life: 1.2, grav: -2, up: 1 });
  for (const s of [0, 0.6, 1.2, 1.8]) burst(E.dgHop + 1.3 + s, [-2, 1.0, 7], { n: 12, colors: ['#777777', '#aaaaaa'], speed: 1, size: 0.2, life: 0.8, grav: -2, up: 1 });
  burst(E.dgHatch, [0, 3.3, 11], { n: 70, colors: ['#fff0d0', '#ffd27a', '#ffffff', '#3ad6a0'], speed: 4, size: 0.14, life: 1.2, grav: 5, up: 2 });
  burst(E.dgImprint + 0.5, [0, 3.7, 11.2], { n: 30, colors: ['#ff5ca8', '#ff9ecb'], speed: 2, size: 0.16, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgHic + 0.3, [0, 1.9, 12.9], { n: 50, colors: ['#ff5a1a', '#ffd23f', '#444444'], speed: 3, size: 0.16, life: 0.9, grav: 1, up: 1 }); smoke(E.dgHic + 0.3, E.dgHic + 3, 0.2, [0, 2.2, 13.1], { n: 2, colors: ['#555555', '#777777'], speed: 0.5, size: 0.25, life: 1.2, grav: -1.5, up: 1 });
  burst(E.dgHic2 + 0.3, [-0.45, 1.5, 12.6], { n: 50, colors: ['#ff5a1a', '#ffd23f', '#222222'], speed: 3, size: 0.14, life: 1, grav: 1, up: 1 }); smoke(E.dgHic2 + 0.4, E.dgHic2 + 2, 0.15, [-0.45, 1.4, 12.6], { n: 3, colors: ['#222222', '#555555'], speed: 0.6, size: 0.12, life: 1.2, grav: 2, up: 0.5 });
  burst(E.dgSnack + 3.6, [1.0, 2.0, 11.0], { n: 26, colors: ['#ff5a1a', '#222222'], speed: 2, size: 0.12, life: 0.8, grav: 2, up: 1 });
  burst(E.dgSnack + 7.2, [1.0, 2.6, 11.0], { n: 30, colors: ['#ff5ca8', '#ff9ecb', '#ffe066'], speed: 2, size: 0.16, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgLesson + 4.8, [6.5, 0.8, 21], { n: 40, colors: ['#555555', '#888888'], speed: 3, size: 0.25, life: 0.8, grav: 4, up: 1 });
  const HB = [0, 0.5, 11], BB = [-2.2, 0.5, 12.4], BF = [0, 0.5, 13.2], LB = [3, 0.5, 12.6], LS = [3.7, 0.5, 11.0], HC = [2.5, 0.5, 15.5], ROCK = [6.5, 2.5, 17.5];
  const C = [[E.dgCinder, -9, 5, -14, 0, 2, 4, 56], [97.9, -8, 4, -6, 0, 1.5, 8, 52], [98, -7, 2.4, 4, -2, 1, 7.6, 46], [101.9, -6.5, 3, 7, -1, 1.5, 11, 48],
    [102, 0.8, 3.2, 14.2, 0, 2.8, 11, 40], [109.9, 0.4, 3.1, 13.4, 0, 3.0, 11, 30], [110, 1.2, 4.4, 13.8, 0, 3.3, 11, 40], [114.9, 1.0, 4.2, 13.2, 0, 3.4, 11, 34],
    [115, -2.5, 3.4, 15, 0.6, 2.6, 11.5, 48], [121.9, -2.8, 3.2, 14.4, 0.8, 2.4, 11.8, 46], [122, -4.5, 2.4, 10.4, 0, 2.0, 12.4, 48], [127.9, -4.2, 2.6, 11.8, 0, 2, 12.2, 44],
    [128, -4.2, 2.6, 15.5, -0.3, 1.7, 12.8, 40], [133.9, -4.4, 2.8, 16, -0.3, 1.8, 12.8, 44], [134, 0.9, 2.8, 15, 0, 2.6, 11, 44], [139.9, 0.3, 2.9, 14.0, 0, 2.7, 11, 40],
    [140, -4, 4, 8.5, 2.5, 2, 12.5, 50], [144.9, -3.6, 3.6, 9.2, 2.8, 2.1, 12.5, 46], [145, 7.5, 3, 7.4, 2.5, 2.2, 12, 46], [149.4, 7.8, 3.6, 8.4, 3, 2.6, 12.5, 44],
    [149.5, -1.5, 3, 12.5, 5, 2.4, 17.5, 50], [E.dgNight, -1, 4, 11.5, 4, 3, 17.5, 46]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
    // ---- me
    let hA; if (win(t, E.dgHop, E.dgHop + 1.4)) hA = { p: arcPath(t, [[E.dgHop, -0.6, 0.5, 4.6, 0], [E.dgHop + 0.7, 0, 0.5, 7, 0.8], [E.dgHop + 1.4, 0, 0.5, 9.2, 0.8]]), yaw: 0, face: 'scared' };
    else hA = act(t, [[E.dgCinder, -1.2, 0.5, -6], [E.dgHop, -0.6, 0.5, 4.6], [E.dgHop + 1.4, 0, 0.5, 9.2], [E.dgHop + 3.4, ...HB], [E.dgLesson, ...HB], [E.dgLesson + 1.5, ...HC]],
      [[0, { face: 'smug' }], [E.dgHop + 3.4, { face: 'smug', yaw: 0 }], [E.dgWobble, { face: 'scared', yaw: 0 }], [E.dgCrack, { face: 'scared', yaw: 0, headPitch: -0.15 }], [E.dgHatch, { face: 'scared', yaw: 0, panic: t < E.dgHatch + 1 }],
       [E.dgHatch + 1, { face: 'normal', yaw: 0, headPitch: -0.2 }], [E.dgImprint + 2, { face: 'scared', yaw: 0 }], [E.dgImprint + 4.5, { face: 'smug', yaw: 0 }], [E.dgHic, { face: 'scared', yaw: 0 }], [E.dgHic + 1.5, { face: 'normal', yaw: 0 }],
       [E.dgHic2, { face: 'scared', yaw: 0 }], [E.dgHic2 + 1.5, { face: 'normal', yaw: 0 }], [E.dgName, { face: 'smug', yaw: 0.2, wave: t < E.dgName + 2 }], [E.dgName + 2, { face: 'smug', yaw: 0.2 }], [E.dgSnack, { face: 'normal', yaw: 0.9 }],
       [E.dgSnack + 3.4, { face: 'scared', yaw: 0.9 }], [E.dgSnack + 5, { face: 'smug', yaw: 0.9 }], [E.dgLesson + 1.5, { face: 'smug', yaw: faceTo(HC, ROCK) }], [E.dgLesson + 4.6, { face: 'scared', yaw: faceTo(HC, ROCK) }], [E.dgLesson + 5.8, { face: 'smug', yaw: faceTo(HC, ROCK) }]]);
    pose(hero, { t, ...hA });
    const HP = hero.root.position.toArray(), HW = hatW28(HP);
    // ---- egg → Pip (in my hat)
    const hk = seg(t, E.dgHatch, E.dgHatch + 0.6); parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], { wobble: win(t, E.dgWobble, E.dgHatch) ? lerp(0.3, 1, seg(t, E.dgWobble, E.dgHatch)) * (Math.floor(t * 1.6) % 2 ? 1 : 0.3) : 0, crack: win(t, E.dgCrack, E.dgHatch), hatch: hk });
    const LH = (P, y) => wl(P, y, [0, 1.82, 1.65]);
    let lp, ly, ls = 0.4;
    if (t < E.dgSnack) { const a = act(t, [[E.dgCinder, 2.8, 0.5, -7], [E.dgHop, 2.8, 0.5, 4], [E.dgHop + 3, 2.8, 0.5, 10], [E.dgHop + 4.5, ...LB]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(LB, HB); ls = a.walk ? 2 : 0.4; }
    else { const a = act(t, [[E.dgSnack, ...LB], [E.dgSnack + 1, 4.6, 0.5, 13.4], [E.dgSnack + 1.8, 4.6, 0.5, 13.4], [E.dgSnack + 3, ...LS], [E.dgSnack + 4, ...LS], [E.dgSnack + 5, 4.6, 0.5, 13.4], [E.dgSnack + 5.6, 4.6, 0.5, 13.4], [E.dgSnack + 6.6, ...LS], [E.dgLesson, ...LS], [E.dgLesson + 2, 6.5, 0.5, 15.2]], [[0, {}]]);
      lp = a.p; ly = a.walk ? a.yaw : win(t, E.dgSnack + 1, E.dgSnack + 1.8) || win(t, E.dgSnack + 5, E.dgSnack + 5.6) ? faceTo(lp, [5.8, 0, 14.6]) : -PI / 2; ls = a.walk ? 2 : 0.4;
      if (t >= E.dgLesson + 2) { ly = 0; if (t < E.dgLesson + 2.8) lp = arcPath(t, [[E.dgLesson + 2, 6.5, 0.5, 15.2, 0], [E.dgLesson + 2.8, ...ROCK, 1.2]]); else if (t < E.dgLesson + 4) { lp = ROCK; ls = 8; } else lp = arcPath(t, [[E.dgLesson + 4, ...ROCK, 0], [E.dgLesson + 4.8, 6.5, 0.5, 21, 1.4]]); } }
    poseLurk(L6, t, lp, ly, ls);
    if (win(t, E.dgImprint + 1, E.dgHic - 1)) { L6.hd.rotation.x = 0.55; L6.body.position.y -= 0.25; }
    if (win(t, E.dgSnack + 7.4, E.dgLesson)) L6.root.rotation.z = Math.sin(t * 12) * 0.1;
    if (win(t, E.dgLesson + 2.8, E.dgLesson + 4.8)) { L6.root.rotation.z = Math.sin(t * 20) * 0.12; L6.body.position.y += Math.abs(Math.sin(t * 16)) * 0.3; }
    if (win(t, E.dgLesson + 4.8, E.dgLesson + 5.6)) L6.body.position.y = 0.6;
    berry28.visible = win(t, E.dgSnack + 1.6, E.dgSnack + 4.2) || win(t, E.dgSnack + 5.4, E.dgSnack + 7); berryBurnt28.visible = win(t, E.dgSnack + 3.6, E.dgSnack + 4.2);
    // Pip
    const pk = backOut(seg(t, E.dgHatch + 0.2, E.dgHatch + 0.7)), PS = 0.32;
    const po = pick(t, [[0, {}], [E.dgHatch + 1.5, { headYaw: Math.sin(t * 2) * 0.6 }], [E.dgImprint, { pitch: 0.35, headPitch: 0.45, happy: true, hop: t < E.dgImprint + 1.5 }], [E.dgImprint + 4, { headYaw: Math.sin(t * 1.5) * 0.4 }],
      [E.dgHic, { fire: t < E.dgHic + 0.5 ? 1 : 0, wide: true, pitch: 0.1 }], [E.dgHic + 1, {}], [E.dgHic2, { fire: t < E.dgHic2 + 0.5 ? 1 : 0, wide: true, pitch: 0.2 }], [E.dgHic2 + 1, { happy: true }], [E.dgName, { flap: 0.6 }], [E.dgName + 2.5, {}],
      [E.dgSnack + 3.4, { fire: t < E.dgSnack + 3.9 ? 1 : 0, wide: true, pitch: 0.4, headPitch: 0.3 }], [E.dgSnack + 4.2, {}], [E.dgSnack + 6.8, { chew: true, pitch: 0.4, headPitch: 0.3 }], [E.dgSnack + 7.6, { flap: 1 }], [E.dgSnack + 8.4, { happy: true }],
      [E.dgLesson + 3, { flap: 0.4, happy: true }], [E.dgLesson + 4, { flap: 1, fly: true, wide: true }], [E.dgLesson + 5.9, { happy: true }]]);
    const LHp = LH(lp, ly);
    if (t < E.dgHatch + 0.2) pip28.root.visible = false;
    else if (t < E.dgSnack + 7.6) pipAt28(t, capHat, [0, 0.36, 0], 0, PS * pk, po);
    else if (t < E.dgSnack + 8.4) pipAt28(t, g, arcPath(t, [[E.dgSnack + 7.6, ...HW, 0], [E.dgSnack + 8.4, ...LHp, 1.0]]), -PI / 2, PS, po);
    else if (t < E.dgLesson + 4) pipAt28(t, L6.hd, [0, 0.42, 0.25], 0, PS, po);
    else if (t < E.dgLesson + 5.9) { const P0 = wl(ROCK, 0, [0, 1.82, 1.65]), P = arcPath(t, [[E.dgLesson + 4, ...P0, 0], [E.dgLesson + 5.0, 4.6, 5.4, 17.2, 0.6], [E.dgLesson + 5.9, ...HW, 0.3]]); pipAt28(t, g, P, faceTo(P0, HW), PS, po); }
    else pipAt28(t, capHat, [0, 0.36, 0], 0, PS, po);
    // ---- Bloop (hot feet; singed; the invoice)
    let bp, by, bo = {};
    if (win(t, E.dgHop + 0.3, E.dgHop + 4)) { const k = t - E.dgHop; bp = k < 1 ? arcPath(t, [[E.dgHop + 0.3, -2, 0.5, 4.8, 0], [E.dgHop + 1, -2, 0.5, 7, 0.8]]) : k < 3.3 ? [-2, 0.5, 7] : arcPath(t, [[E.dgHop + 3.3, -2, 0.5, 7, 0], [E.dgHop + 4, -2, 0.5, 9.4, 0.8]]); by = 0; bo = { hop: k > 1 && k < 3.3, angry: k > 1 && k < 3.3 }; }
    else { const a = act(t, [[E.dgCinder, 0.8, 0.5, -7.5], [E.dgHop + 0.3, -2, 0.5, 4.8], [E.dgHop + 4, -2, 0.5, 9.4], [E.dgHop + 5, ...BB], [E.dgHic - 1.5, ...BB], [E.dgHic - 0.5, ...BF], [E.dgName - 1, ...BF], [E.dgName, -2.4, 0.5, 12.8]], [[0, {}]]);
      bp = a.p; by = a.walk ? a.yaw : t < E.dgHic - 0.5 || t >= E.dgName ? faceTo(bp, HB) : PI;
      bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgHatch, { hop: t < E.dgHatch + 2 }], [E.dgImprint + 2, { facepalm: true }], [E.dgImprint + 4.5, {}], [E.dgHic + 0.3, { angry: true }], [E.dgHic2 - 2, { handOut: true }], [E.dgHic2 + 0.5, { handOut: true }], [E.dgHic2 + 2.4, { facepalm: true }], [E.dgName, {}], [E.dgLesson + 4.8, { hop: true }], [E.dgLesson + 6, {}]]) }; }
    poseBurble(bloop6, t, bp, by, bo); if (win(t, E.dgHic + 0.3, E.dgHic + 1.3)) bHat.position.y = 1.2 + Math.sin(seg(t, E.dgHic + 0.3, E.dgHic + 1.3) * PI) * 1.2;
    inv28a.visible = win(t, E.dgHic2 - 2, E.dgHic2 + 1.6); const ik = seg(t, E.dgHic2 + 0.3, E.dgHic2 + 1.6); inv28a.children[0].material = t > E.dgHic2 + 0.3 ? burntM28 : invM28; inv28a.scale.setScalar(1 - ik * 0.95);
    shoot28(t, g, [[E.dgHic, 0.3, [0, 3.3, 11.4], [0, 1.9, 12.9]], [E.dgHic2, 0.3, [0, 3.3, 11.4], [-0.45, 1.5, 12.6]], [E.dgSnack + 3.4, 0.2, [0, 3.2, 11.4], [1.0, 2.0, 11.0]]]);
    return { cam: camKeys(t, C), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: Ember Peak (night → dawn) — Mama Ember
const peak = (() => {
  const g = mk('peak'); const st = new VSet(g);
  for (let x = -28; x <= 13; x++) for (let z = -30; z <= 26; z++) { const d = Math.hypot(x, z), pool = Math.hypot(x + 12, z + 12) < 2.6 || Math.hypot(x - 7, z + 18) < 2.2 || Math.hypot(x + 16, z - 10) < 3;
    st.add(x, 0, z, pool ? 'lava' : d < 4 ? 'plank' : hash2(x, z, 77) > 0.6 ? 'basalt' : 'ash'); if (Math.abs(d - 4.4) < 0.55) st.add(x, 1, z, 'log'); if (x === 13 && hash2(x, z, 3) > 0.5) st.add(x, 1, z, 'basalt'); }
  for (const [x, z, h] of [[-19, -3, 6], [-16, 12, 8], [-8, 20, 5], [4, 21, 7], [-22, 6, 4], [10, 16, 6], [-24, -18, 7], [-6, -26, 5]]) for (let y = 1; y <= h; y++) { st.add(x, y, z, 'basalt'); if (y < h - 1) { st.add(x + 1, y, z, 'basalt'); st.add(x, y, z + 1, 'basalt'); } }
  for (let x = 1; x <= 5; x++) for (let y = 1; y <= 3; y++) { st.add(x, y, -15, 'basalt'); if (x === 1 || x === 5) { st.add(x, y, -14, 'basalt'); st.add(x, y, -13, 'basalt'); } } for (let x = 1; x <= 5; x++) for (const z of [-14, -13]) st.add(x, 3, z, 'basalt');
  for (const [x, z] of [[-1, 1], [-2, 2], [-1, 2], [1, 2]]) st.add(x, 1, z, 'goldblk');
  st.build();
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshBasicMaterial({ color: '#c8401a' })); sea.rotation.x = -PI / 2; sea.position.set(0, -30, 0); g.add(sea);
  const boulder = box(3.4, 2.6, 1.6, '#3a2e30', 3, 1.8, -11.6, g);
  for (const [x, z, r] of [[-1.2, -0.8, 0.4], [1.4, 0.6, 1.2], [0.2, 1.8, 2.2]]) { const s = box(0.4, 0.2, 0.3, '#fff0d0', x, 0.62, z, g); s.rotation.y = r; }
  const nestL = new THREE.PointLight('#ffb070', 0, 46, 1.1); nestL.position.set(0, 7, -5); g.add(nestL); for (const [x, z] of [[-12, -12], [7, -18], [-16, 10]]) { const l = new THREE.PointLight('#ff6a1a', 12, 20, 1.4); l.position.set(x, 1.5, z); g.add(l); }
  const EGA = [0, 1, 2, 3, 4].map(i => [1.8 + i * 0.6, 0.5, -13.9]);
  const HS = [-1.5, 0.5, -9.5], HCo = [12, 0.5, -1.5], M0 = [0, 0.5, 5.5], MC = [2.5, 0.5, -1.5], MA = [3, 0.5, -4.5], BH = [-8, 0.5, -10], BP2 = [6.5, 0.5, -5], BS = [-4.0, 0.5, -11.4], HQ = [-0.8, 0.5, -8.8];
  const RUN = [[E.dgChase, 0, 0.5, -6.2], [E.dgChase + 2.5, -7, 0.5, -5], [E.dgChase + 4.5, -9, 0.5, -1], [E.dgChase + 6, -6, 0.5, -9], [E.dgChase + 8, 2, 0.5, -10], [E.dgChase + 9.5, 8, 0.5, -6], [E.dgCorner, ...HCo]];
  burst(E.dgLand, [0, 1, 5.5], { n: 90, colors: ['#5a4a4a', '#8a7a70', '#3a2e30'], speed: 8, size: 0.4, life: 1.4, grav: 3, up: 1 });
  for (const s of [0, 1.2, 2.4, 3.6]) burst(E.dgSniff2 + s, [0, 4.6, -3.5], { n: 14, colors: ['#666666', '#999999'], speed: 1.5, size: 0.4, life: 1.2, grav: -1, up: 1 });
  for (const [s, p] of [[1.2, [0, 0.8, -6.2]], [5.6, [-6, 0.8, -9]], [9.1, [6, 0.8, -8]]]) burst(E.dgChase + s, p, { n: 50, colors: ['#ff5a1a', '#ffd23f', '#222222'], speed: 4, size: 0.3, life: 1, grav: 1, up: 2 });
  burst(E.dgReunite + 0.5, [9.6, 6.4, -1.5], { n: 50, colors: ['#ff5ca8', '#ff9ecb', '#ffffff'], speed: 3, size: 0.25, life: 1.6, grav: -1, up: 1.5 });
  burst(E.dgPay + 5.2, [6.5, 2.2, -5], { n: 60, colors: ['#ffd23f', '#ffffff', '#ffe066'], speed: 5, size: 0.14, life: 1.2, grav: 3, up: 3 });
  burst(E.dgClutch + 2, [5.5, 1.0, -11.6], { n: 40, colors: ['#5a4a4a', '#8a7a70'], speed: 4, size: 0.3, life: 1, grav: 5, up: 1 });
  burst(E.dgFlyOff, [3, 1, -4.5], { n: 80, colors: ['#5a4a4a', '#8a7a70', '#f0d090'], speed: 7, size: 0.35, life: 1.4, grav: 2, up: 1 });
  burst(E.dgHatchAll, [-1.5, 4.6, -9.5], { n: 110, colors: ['#fff0d0', '#ff8ac0', '#6ab0ff', '#ffd23f', '#7cff6b', '#9a7aff'], speed: 5, size: 0.14, life: 1.4, grav: 5, up: 2 });
  burst(E.dgMoms + 0.5, [-1.5, 6, -9.5], { n: 40, colors: ['#ff5ca8', '#ff9ecb'], speed: 2.5, size: 0.18, life: 1.4, grav: -1, up: 1.5 });
  burst(E.dgHic3, [-1.5, 4.5, -9.5], { n: 120, colors: ['#ff5a1a', '#ffd23f', '#ff8a2a'], speed: 6, size: 0.2, life: 1.1, grav: 1, up: 2 });
  const heroRun = t => { const a = (t - E.dgPanic) * 2.4; return [HQ[0] + Math.cos(a) * 1.8, 0.5, HQ[2] + Math.sin(a) * 1.8]; };
  smoke(E.dgHic3 + 0.4, E.freeze + 0.1, 0.12, t => { const p = heroRun(Math.max(t, E.dgPanic)); return [p[0], 3.5, p[2]]; }, { n: 3, colors: ['#ff5a1a', '#ffd23f', '#555555'], speed: 0.6, size: 0.18, life: 0.9, grav: -2.5, up: 1 });
  const C = [[E.dgNest, 1.5, 4.2, -11, 0, 1, 1, 50], [168.9, 1.0, 5.5, -12, 0, 1.5, 2, 52], [169, 0.8, 1.6, -9.5, 2, 8, 6, 62], [175.4, 1.0, 1.8, -9.8, 0, 5, 3, 60],
    [175.5, -3, 1.2, -12.5, 0, 6, 3, 62], [181.9, -3.4, 1.4, -13, 0, 6.5, 3, 58], [182, 3.5, 2.4, -10, 0, 3.2, -4.5, 46], [186.9, 3.2, 2.6, -9.6, 0, 3.4, -4.8, 42],
    [187, -14, 7, -14, -2, 2, -3, 50], [192.9, -12, 8, -15, 0, 2, -5, 50],
    [198, 8, 2, -10, 7, 4, -1.5, 54], [201.9, 8.5, 2.4, -9.5, 7, 4.5, -1.5, 50], [202, 15.5, 3.4, -3.8, 6, 4, -1.5, 52], [205.9, 15, 3.6, -2.8, 6, 4.5, -1.5, 50],
    [206, 13.5, 3.6, -6.5, 11, 4, -1.5, 46], [211.9, 12.5, 4.8, -7.5, 9.5, 5.6, -1.5, 44], [212, 4.5, 4.5, -10.5, 8.5, 6.5, -1.5, 48], [217.9, 4.2, 5, -10, 8.5, 6.8, -1.5, 46],
    [218, 0, 5.5, -13, 5, 1.5, -4.5, 50], [221.9, 0.5, 4.8, -12.5, 6, 1.4, -4.6, 46], [222, 9.8, 2.2, -9, 6.5, 1.3, -5, 40], [225.9, 9.4, 2.6, -9.6, 6.5, 1.0, -5, 44],
    [226, 22, 6, -14, 4, 4, 0, 50], [231.9, 21, 7, -11, 4, 4.5, 1, 46], [232, 9, 3, -10, 5, 2, -4, 50], [237.9, 3, 3.4, -15, -1, 2, -8, 52],
    [238, -6, 3, -4, 3, 1.5, -12, 48], [242.9, -6.5, 3.4, -5, 2.5, 1.8, -12, 48], [243, -6.5, 4.2, -5.4, -1.5, 4.0, -9.5, 54], [250.9, -7, 5.2, -5, -1.5, 4.8, -9.5, 58],
    [251, -10, 2, -16, 2, 6, -2, 56], [255.9, -9, 2.2, -15, 8, 12, 6, 60], [256, -4.4, 2.6, -4.6, -2.4, 2.8, -9, 46], [261.9, -4.8, 3.6, -5.2, -1.8, 3.8, -9.5, 50],
    [262, -6, 4.2, -5.6, -1.5, 4.4, -9.5, 56], [269.9, -6.4, 4.8, -5.2, -1.5, 4.6, -9.5, 54], [270, -6, 4.6, -5.5, -1.5, 4.8, -9.5, 50], [277.9, -6.5, 5, -5, -1.5, 4.6, -9.5, 54],
    [278, -8, 4, -2.4, -1, 2.5, -8.8, 54], [285.5, -8.5, 4.4, -1.8, -0.8, 2.6, -8.8, 50], [E.logo, -8.5, 4.4, -1.8, -0.8, 2.6, -8.8, 50]];
  function update(t) {
    hideMisc(); hide28(); [hero.root, bloop6.B.root, L6.root].forEach(o => parentTo(o, g));
    L6.root.rotation.set(0, 0, 0); L6.root.visible = bloop6.B.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 2.5;
    nestL.intensity = t < E.dgDawn ? 34 : lerp(34, 0, seg(t, E.dgDawn, E.dgDawn + 6));
    // ---- me
    let hA; const sway = win(t, E.dgStack, E.dgHic3) ? Math.sin(t * 2.2) * 0.06 * (1 + EGGT28.filter(a => t >= a).length * 0.3) : 0;
    if (t < E.dgChase) hA = act(t, [[E.dgNight, -7, 0.5, -22], [E.dgNest, 0, 0.5, -6.2]], [[0, { face: 'smug' }], [E.dgNest, { face: 'normal', yaw: 0, headYaw: Math.sin(t) * 0.4 }], [E.dgShadow, { face: 'scared', yaw: 0, headPitch: -0.5 }], [E.dgLand, { face: 'scared', yaw: 0, lean: -0.2, panic: t < E.dgLand + 1 }],
      [E.dgRoar, { face: 'scared', yaw: 0, lean: -0.25, headPitch: -0.4 }], [E.dgSniff2, { face: 'scared', yaw: 0, headPitch: -0.45 }]]);
    else if (t < E.dgCorner) { const w = walker(t, RUN); hA = { p: w.p, yaw: w.yaw, walk: w.walk, phase: w.phase, face: 'scared', panic: true }; }
    else if (t < E.dgBye + 1) hA = { p: HCo, yaw: -PI / 2, ...pick(t, [[0, { face: 'scared', lean: -0.15 }], [E.dgStep, { face: 'normal' }], [E.dgFly, { face: 'scared', headPitch: -0.3 }], [E.dgReunite, { face: 'smug', headPitch: -0.3 }], [E.dgPay, { face: 'smug', yaw: -2.2 }], [E.dgDawn, { face: 'smug', yaw: -PI / 2, headPitch: -0.2 }], [E.dgBye, { face: 'smug', yaw: -PI / 2, wave: true }]]) };
    else if (t < E.dgPanic) hA = act(t, [[E.dgBye + 1, ...HCo], [E.dgBye + 4.5, ...HS]], [[0, { face: 'smug' }], [E.dgBye + 4.5, { face: 'normal', yaw: faceTo(HS, [3, 0, -12]) }], [E.dgClutch + 3, { face: 'scared', yaw: faceTo(HS, [3, 0, -12]) }], [E.dgStack, { face: 'scared', yaw: -1.0, lean: sway }],
      [E.dgFlyOff, { face: 'scared', yaw: -0.2, lean: sway }], [E.dgBabysit, { face: 'normal', yaw: -1.6, lean: sway }], [E.dgWobble2, { face: 'scared', yaw: -1.0, lean: sway }], [E.dgHatchAll, { face: 'scared', yaw: -1.0 }], [E.dgMoms, { face: 'normal', yaw: -1.0 }], [E.dgHic3, { face: 'scared', yaw: -1.0, panic: true }]]);
    else { const p = heroRun(t), a = (t - E.dgPanic) * 2.4; hA = { p, yaw: Math.atan2(-Math.sin(a), Math.cos(a)), walk: 1, phase: t * 14, face: 'scared', panic: true }; }
    pose(hero, { t, ...hA }); if (win(t, E.dgStack, E.dgHic3) && !hA.panic) { hero.aL.rotation.set(0, 0, -1.4 + sway * 3); hero.aR.rotation.set(0, 0, 1.4 + sway * 3); }
    const HP = hero.root.position.toArray(), HW = hatW28(HP);
    hatFire28.visible = t >= E.dgHic3 + 0.4; hfl28.forEach((m, i) => { m.scale.setScalar(0.8 + 0.4 * Math.sin(t * 17 + i * 2)); m.rotation.y = t * (2 + i); });
    // ---- Leggy
    let lp, ly, ls = 0.4;
    if (t < E.dgChase) { const a = act(t, [[E.dgNight, -4, 0.5, -23.5], [E.dgNest, 4.4, 0.5, -6.8]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : 0; ls = a.walk ? 2 : 0.4; }
    else if (t < E.dgCorner + 1) { const w = walker(Math.max(E.dgChase, t - 1.2), RUN); lp = [w.p[0] + 1.6, 0.5, w.p[2] - 1.8]; ly = w.walk > 0.05 ? w.yaw : 0; ls = 5; }
    else if (t < E.dgStep) { lp = L3([13.6, 0.5, -3.3], [10.8, 0.5, -4.6], ss(seg(t, E.dgCorner + 1, E.dgCorner + 2))); ly = -PI / 2; ls = 1; }
    else if (t < E.dgStep + 0.8) { lp = arcPath(t, [[E.dgStep, 10.8, 0.5, -4.6, 0], [E.dgStep + 0.8, 9.2, 0.5, -1.5, 1.2]]); ly = -PI / 2; ls = 3; }
    else if (t < E.dgBye + 1) { lp = [9.2, 0.5, -1.5]; ly = -PI / 2; ls = win(t, E.dgStep + 0.8, E.dgFly) ? 9 : 0.5; }
    else if (t < E.dgFlyOff + 1) { const a = act(t, [[E.dgBye + 1, 9.2, 0.5, -1.5], [E.dgBye + 3, 9, 0.5, -8], [E.dgBye + 6, -4.5, 0.5, -13.5]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(lp, HS); ls = a.walk ? 2 : 0.4; }
    else { const a = act(t, [[E.dgFlyOff + 1, -4.5, 0.5, -13.5], [E.dgFlyOff + 3, 1.2, 0.5, -10.5], [E.dgFlyOff + 4.5, 1.2, 0.5, -6.0]], [[0, {}]]); lp = a.p; ly = a.walk ? a.yaw : faceTo(lp, HS); ls = a.walk ? 2 : 0.4; }
    poseLurk(L6, t, lp, ly, ls);
    if (win(t, E.dgRoar, E.dgChase)) { L6.body.position.y -= 0.4; L6.hd.rotation.x = 0.4; }
    if (win(t, E.dgStep + 0.8, E.dgFly)) { L6.root.rotation.z = Math.sin(t * 20) * 0.12; L6.body.position.y += Math.abs(Math.sin(t * 16)) * 0.35; }
    if (win(t, E.dgFly, E.dgReunite + 4)) L6.hd.rotation.x = -0.5; if (win(t, E.dgReunite, E.dgPay)) L6.root.rotation.z = Math.sin(t * 12) * 0.1;
    if (win(t, E.dgHatchAll, E.dgHic3)) { L6.root.rotation.z = Math.sin(t * 12) * 0.1; L6.hd.rotation.x = -0.4; }
    // ---- Mama Ember
    let mp = M0, my = PI, mo = {}; mama28.root.visible = t >= E.dgShadow && t < E.dgFlyOff + 6;
    if (t < E.dgLand) { const K = [[E.dgShadow, -40, 30, 34], [E.dgShadow + 3, 10, 18, -6], [E.dgShadow + 5, 9, 9, 12], [E.dgLand, ...M0]], a = track(t, K); mp = a.p; my = t < E.dgLand - 1 ? Math.atan2(a.v[0], a.v[2]) : lerp(Math.atan2(a.v[0], a.v[2]), PI, seg(t, E.dgLand - 1, E.dgLand)); mo = { flap: 1, fly: true }; }
    else if (t < E.dgChase) mo = pick(t, [[0, { crouch: 0.6 }], [E.dgLand + 0.6, {}], [E.dgRoar, { roar: true, neckUp: 1, rear: 0.4, flap: 0.4 }], [E.dgRoar + 3, { narrow: true }], [E.dgSniff2, { pitch: 0.22, crouch: 1, neckDown: 0.8, headPitch: 0.35, narrow: true }]]);
    else if (t < E.dgCorner - 2) { const h = walker(t, RUN).p; my = faceTo(M0, h); const f = win(t, E.dgChase + 0.6, E.dgChase + 1.8) || win(t, E.dgChase + 5, E.dgChase + 6.2) || win(t, E.dgChase + 8.5, E.dgChase + 9.7);
      mo = { neckDown: 0.45, headPitch: 0.3, narrow: true, fire: f ? 1 : 0, fireLen: 3 }; }
    else if (t < E.dgCorner + 1.5) { const a = walker(t, [[E.dgCorner - 2, ...M0], [E.dgCorner + 1.5, ...MC]]); mp = a.p; my = lerp(faceTo(M0, HCo), PI / 2, seg(t, E.dgCorner - 2, E.dgCorner + 1.5)); mo = { walk: true, narrow: true, neckDown: 0.3 }; }
    else if (t < E.dgBye + 4) { mp = MC; my = PI / 2; mo = pick(t, [[0, { narrow: true, neckDown: 0.3, headPitch: 0.4 }], [E.dgStep + 1, { wide: true, neckDown: 0.2, headPitch: 0.2 }], [E.dgFly, { wide: true, neckDown: 0.4, headPitch: 0.35 }], [E.dgReunite, { happy: true, neckDown: 0.7, headPitch: 0.3, headRoll: Math.sin(t * 2) * 0.2 }],
      [E.dgPay, { happy: true, neckDown: 0.3, neckYaw: -0.5, tailSwing: win(t, E.dgPay + 4.2, E.dgPay + 5) ? 1.2 : 0 }], [E.dgDawn, { happy: true, neckDown: 0.1 }], [E.dgBye, { neckDown: 0.4, neckYaw: 0.4, headPitch: 0.2 }]]); }
    else if (t < E.dgFlyOff) { const a = walker(t, [[E.dgBye + 4, ...MC], [E.dgClutch, ...MA]]); mp = a.p; my = lerp(PI / 2, PI, seg(t, E.dgBye + 4, E.dgClutch)); mo = t < E.dgClutch ? { walk: true, happy: true } : t < E.dgStack ? { neckDown: 1.0, headPitch: 0.3 } : { happy: true, neckDown: 0.4, neckYaw: -0.6, headPitch: EGGT28.some(a2 => win(t, a2 - 0.3, a2 + 0.2)) ? 0.5 : 0.1 }; }
    else { const a = track(t, [[E.dgFlyOff, ...MA], [E.dgFlyOff + 2, 6, 8, 2], [E.dgFlyOff + 6, 34, 34, 34]]); mp = a.p; my = t < E.dgFlyOff + 0.5 ? PI : lerp(PI, Math.atan2(a.v[0], a.v[2]), seg(t, E.dgFlyOff, E.dgFlyOff + 1.5)); mo = { flap: 1, fly: true, happy: true }; }
    poseDragon28(mama28, t, mp, my, mo); parentTo(mama28.root, g); mamaL28.intensity = (mo.fire || 0) * 60;
    boulder.position.set(lerp(3, 7.5, ss(seg(t, E.dgClutch, E.dgClutch + 2.4))), 1.8, -11.6);
    // ---- Pip: in the hat → hides → first flight → Mama's nose → off with Mama
    const PS = 0.32; let po = pick(t, [[0, { headYaw: Math.sin(t * 1.5) * 0.5 }], [E.dgShadow, { wide: true, headPitch: -0.4 }], [E.dgRoar, { crouch: 1, wide: true }], [E.dgStep + 1, { headYaw: Math.sin(t * 3) * 0.4, flap: 0.3 }]]);
    if (t < E.dgFly) { parentTo(egg28.root, capHat); poseEgg28(egg28, t, [0, 0.35, 0], { hatch: 1 }); }
    if (t < E.dgFly) pipAt28(t, capHat, [0, win(t, E.dgRoar, E.dgStep) ? 0.12 : 0.36, 0], 0, PS, po);
    else if (t < E.dgReunite) { const P = track(t, [[E.dgFly, ...HW], [E.dgFly + 1.5, 11.5, 4.4, -1.2], [E.dgFly + 3, 10.9, 3.9, -1.8], [E.dgFly + 4.5, 10.2, 5.4, -1.3], [E.dgReunite, 9.8, 5.7, -1.5]]).p; pipAt28(t, g, [P[0], P[1] + Math.sin(t * 9) * 0.12, P[2]], -PI / 2, PS, { flap: 1, fly: true, wide: true, roll: Math.sin(t * 5) * 0.3 }); }
    else pipAt28(t, mama28.hd, [0, 0.22, 0.85], 0, PS / mama28.s, pick(t, [[0, { happy: true, hop: t < E.dgReunite + 2 }], [E.dgBye, { flap: 0.4, happy: true }], [E.dgFlyOff, { flap: 1, happy: true }]]));
    // ---- the clutch: alcove → stacked on my hat → hatch → five babies → hiccups → orbit my burning hat
    clutch28.forEach((e, i) => { const t0 = EGGT28[i], hk = seg(t, E.dgHatchAll + i * 0.08, E.dgHatchAll + 0.6 + i * 0.08);
      if (t < t0) { parentTo(e.root, g); poseEgg28(e, t, EGA[i], {}); }
      else if (t < t0 + 0.9) { parentTo(e.root, g); poseEgg28(e, t, arcPath(t, [[t0, ...EGA[i], 0], [t0 + 0.9, HW[0], HW[1] + i * 0.66, HW[2], 3.5]]), { rx: t * 8 }); }
      else { parentTo(e.root, capHat); poseEgg28(e, t, [sway * i * i * 0.15, 0.35 + i * 0.66, 0], { rz: -sway * i * 0.6, wobble: win(t, E.dgWobble2, E.dgHatchAll) ? 0.8 : 0, seed: i * 1.7, crack: win(t, E.dgCrack2, E.dgHatchAll), hatch: hk, vis: t < E.dgHic3 + 0.4 }); } });
    babies28.forEach((b, i) => { if (t < E.dgHatchAll + 0.2) { b.root.visible = false; return; } b.root.visible = true;
      const bo = pick(t, [[0, { headYaw: Math.sin(t * 3 + i) * 0.6 }], [E.dgMoms, { pitch: 0.3, headPitch: 0.4, happy: true }], [E.dgHic3, { fire: t < E.dgHic3 + 0.6 ? 1 : 0, wide: true, flap: 1 }], [E.dgHic3 + 0.6, { flap: 1, fly: true, happy: true }]]);
      if (t < E.dgHic3 + 0.4) { parentTo(b.root, capHat); poseDragon28(b, t, [sway * i * i * 0.15, 0.36 + i * 0.66, 0], i * 1.3 + Math.sin(t + i) * 0.3, { ...bo, seed: i }); b.root.scale.setScalar(0.2 * backOut(seg(t, E.dgHatchAll + 0.2 + i * 0.08, E.dgHatchAll + 0.7 + i * 0.08))); }
      else { parentTo(b.root, g); const a = t * 3 + i * 1.256, k = ss(seg(t, E.dgHic3 + 0.4, E.dgHic3 + 1.4)), P = [HW[0] + Math.cos(a) * 1.3 * k, lerp(HW[1] + i * 0.66, HW[1] + 0.8 + Math.sin(t * 4 + i) * 0.35, k), HW[2] + Math.sin(a) * 1.3 * k];
        poseDragon28(b, t, P, a + PI, { ...bo, seed: i }); b.root.scale.setScalar(0.2); } });
    // ---- Bloop (hides under his hat; gets PAID; babysitting rates)
    let bp, by = 0, bo = {};
    if (t < E.dgChase) { const a = act(t, [[E.dgNight, -9.5, 0.5, -23], [E.dgNest, -2.6, 0.5, -6.6]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : t > E.dgLand ? 0.3 : 0; bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgLand, { hop: t < E.dgLand + 1.5 }], [E.dgRoar, { facepalm: true }]]) }; }
    else if (t < E.dgPay) { const a = act(t, [[E.dgChase, -2.6, 0.5, -6.6], [E.dgChase + 2.5, ...BH]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : 0.6; bo = { walk: a.walk, phase: a.phase * 3 };
      if (!a.walk) { bp = [BH[0], 0.5 - 0.62 * ss(seg(t, E.dgChase + 2.5, E.dgChase + 3)) + (win(t, E.dgFly, E.dgReunite) ? 0.3 : 0), BH[2]]; bHat.scale.setScalar(lerp(1, 2.3, ss(seg(t, E.dgChase + 2.5, E.dgChase + 3)))); bHat.position.y = 0.95; } }
    else if (t < E.dgPay + 6.4) { const a = act(t, [[E.dgPay, ...BH], [E.dgPay + 3.5, ...BP2]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : faceTo(BP2, [9, 0, -1.5]); bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, {}], [E.dgPay + 3.5, { handOut: true }], [E.dgPay + 5.4, { hop: true }]]) }; }
    else if (t < E.dgDawn + 3) { bp = BP2; by = faceTo(BP2, [9, 0, -1.5]); }
    else { const a = act(t, [[E.dgDawn + 3, ...BP2], [E.dgBye + 4, 0, 0.5, -13], [E.dgBye + 6, ...BS]], [[0, {}]]); bp = a.p; by = a.walk ? a.yaw : faceTo(BS, HP);
      bo = { walk: a.walk, phase: a.phase * 2, ...pick(t, [[0, { hop: t < E.dgDawn + 4 }], [E.dgDawn + 4, {}], [E.dgBabysit, { handOut: true }], [E.dgBabysit + 5, {}], [E.dgHatchAll, { hop: true }], [E.dgMoms, {}], [E.dgHic3 + 1, { handOut: true }]]) }; }
    poseBurble(bloop6, t, bp, by, bo);
    if (win(t, E.dgPay + 6.4, E.dgDawn + 3)) { const k = ss(seg(t, E.dgPay + 6.4, E.dgPay + 6.9)) * (1 - ss(seg(t, E.dgDawn + 2.4, E.dgDawn + 3))); bloop6.B.root.rotation.z = -k * PI / 2; bloop6.B.root.position.y = 0.5 + k * 0.45; }
    inv28b.visible = win(t, E.dgPay + 3, E.dgPay + 5.4); inv28c.visible = win(t, E.dgBabysit, E.dgBabysit + 5); inv28d.visible = t >= E.dgHic3 + 1;
    gold28.visible = t >= E.dgPay + 4.4; if (t < E.dgPay + 5.2) { parentTo(gold28, g); gold28.position.set(...arcPath(t, [[E.dgPay + 4.4, -1, 1.6, 1.5, 0], [E.dgPay + 5.2, 6.9, 1.5, -5.4, 4]])); gold28.rotation.set(t * 6, t * 4, 0); gold28.scale.setScalar(0.45); }
    else { parentTo(gold28, bloop6.B.aL); gold28.position.set(0, -0.6, 0.25); gold28.rotation.set(0, 0, 0); gold28.scale.setScalar(0.45); }
    shoot28(t, g, []);
    let cam = camKeys(t, C);
    if (t < E.dgNest) { cam = follow(HP, [-4.5, 2.4, 4.5], 1.4, 52); } else if (win(t, 193, 198)) cam = follow(HP, [-5, 3.5, -3], 1.2, 54); else if (win(t, E.dgShadow, E.dgLand)) cam = { p: [2, 1.8, -12], l: L3([2, 8, 6], mp, 0.8), fov: 64 };
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
  const mdDay = { top: '#6ac4ff', bot: '#e8f8ff', sunI: 2.6, hemiI: 1.55, fog: '#d8f0ff', sunEl: 0.7, sunAz: 0.4, near: 60, far: 230 };
  const cdA = { top: '#6a3a8a', bot: '#ff9a5a', sunI: 2.0, hemiI: 1.3, fog: '#e08a6a', sunEl: 0.18, sunAz: 0.3, near: 40, far: 150 };
  const cdB = { top: '#3a1e6a', bot: '#ff6a4a', sunI: 1.4, hemiI: 1.1, fog: '#a85a5a', sunEl: 0.05, sunAz: 0.3, near: 40, far: 140 };
  const pkNight = { top: '#0a0e2a', bot: '#3a1a3a', sunI: 0.6, hemiI: 1.0, fog: '#24142e', sunEl: -0.1, sunAz: 2.4, near: 40, far: 130 };
  const pkDawn = { top: '#ff9a7a', bot: '#ffe0b0', sunI: 2.1, hemiI: 1.35, fog: '#f0c0a0', sunEl: 0.2, sunAz: -0.5, near: 50, far: 150 };
  const pkDay = { top: '#58a8f0', bot: '#fff0d0', sunI: 2.6, hemiI: 1.5, fog: '#f0dcc0', sunEl: 0.6, sunAz: -0.3, near: 50, far: 150 };
  if (t < E.dgCinder) return mdDay; if (t < E.dgNight) return mix(cdA, cdB, seg(t, E.dgCinder, E.dgNight)); if (t < E.dgDawn) return pkNight;
  return mix(mix(pkNight, pkDawn, seg(t, E.dgDawn, E.dgDawn + 4)), pkDay, seg(t, E.dgDawn + 10, E.dgStack));
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
  const hpv = t < E.dgHic3 + 0.4 ? (t < E.dgChase ? 5 : t < E.dgReunite ? 3 : 4) : 1;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (win(t, E.dgBump, E.dgBump + 1.5) || win(t, E.dgFire, E.dgFire + 2) || win(t, E.dgChase, E.dgCorner) || win(t, E.dgHic3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = false;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined(t >= E.dgNight && t < E.dgDawn ? '☾ NIGHT 28' : '☀ DAY 28', W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['egg28', t > E.dgEgg + 1 && t < E.dgHatch ? 1 : 0], ['crown', 1], ['inv28', win(t, E.dgInv + 1, E.dgHic2 + 0.4) ? 1 : 0], ['berry28', win(t, E.dgSnack - 1, E.dgSnack + 7) ? (t > E.dgSnack + 3.6 ? 1 : 2) : 0], ['drag28', t > E.dgHatch + 2 ? (t < E.dgFly ? 1 : t > E.dgHatchAll + 2 ? 5 : 0) : 0], ['mallet', 1], ['nug28', t > E.dgPay + 5.4 ? 1 : 0]];
  let sel = 0;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // egg warmth → what is on my head — this episode's mechanic
  drawEggHUD28(t);

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
ICON.egg28 = (x, y, s) => { ctx.fillStyle = '#fff0d0'; ctx.beginPath(); ctx.ellipse(x, y + 1, s * 0.6, s * 0.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff7a3a'; ctx.fillRect(x - s * 0.3, y - s * 0.2, s * 0.22, s * 0.22); ctx.fillRect(x + s * 0.1, y + s * 0.3, s * 0.22, s * 0.22); };
ICON.inv28 = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c0182a'; for (let i = 0; i < 4; i++) ctx.fillRect(x - s * 0.4, y - s * 0.5 + i * s * 0.32, s * (i === 3 ? 0.5 : 0.8), s * 0.12); };
ICON.berry28 = (x, y, s) => { ctx.fillStyle = '#ff2a3a'; ctx.fillRect(x - s * 0.45, y - s * 0.3, s * 0.9, s * 0.9); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 0.3); };
ICON.drag28 = (x, y, s) => { ctx.fillStyle = '#3ad6a0'; ctx.fillRect(x - s * 0.7, y - s * 0.2, s * 1.0, s * 0.8); ctx.fillRect(x, y - s * 0.8, s * 0.7, s * 0.7); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - s * 0.5, y + s * 0.3, s * 0.7, s * 0.3); ctx.fillStyle = '#fff'; ctx.fillRect(x + s * 0.3, y - s * 0.6, s * 0.25, s * 0.25); ctx.fillStyle = '#111'; ctx.fillRect(x + s * 0.4, y - s * 0.55, s * 0.12, s * 0.15); };
ICON.nug28 = (x, y, s) => isoCube(x, y, s * 0.8, '#ffe066', '#e0a800', '#b88400');



const TOASTS = [[E.dgEgg + 2, '+1 Mystery Egg', 'egg28'], [E.dgInv + 1, '+1 Invoice (Egg-Cart)', 'inv28'], [E.dgHatch + 2, '+1 Baby Dragon (?!)', 'drag28'], [E.dgSnack - 1, '+2 Fireberries', 'berry28'], [E.dgPay + 5.6, '+1 Gold Block', 'nug28']];
const FEATS = [[E.dgCatch + 1.5, 'Egg-cellent Catch', 'Catch a runaway egg'], [E.dgFire + 2.4, 'Hat Trick', 'Catch an egg with your hat'], [E.dgImprint + 2, 'Mom?!', 'Get imprinted on by a dragon'], [E.dgReunite + 2, 'Special Delivery', 'Return a baby dragon to its mama'], [E.dgHatchAll + 2, 'Hat-chery', 'Hatch five dragons on your head']];
const POPS = [[E.dgSniff + 1, 1.4, '*sniff sniff*', 0.6, 0.35, '#5ff7ff', 60], [E.dgEgg + 0.6, 1.8, 'AN EGG!', 0.5, 0.3, '#ffe066', 110], [E.dgEgg + 2.6, 1.6, "it's warm.", 0.55, 0.38, '#ffffff', 60], [E.dgSign + 2.5, 1.8, 'REWARD?!', 0.45, 0.3, '#ffe066', 90],
  [E.dgPeak + 1.5, 2, 'EMBER PEAK', 0.62, 0.3, '#ff6a2a', 90], [E.dgCart + 4, 1.8, 'THE EGG-CART!', 0.4, 0.3, '#2ec4b6', 80], [E.dgInv + 0.4, 1.4, '*invoice*', 0.5, 0.35, '#ffffff', 64], [E.dgCold + 1.5, 1.6, 'brrr', 0.5, 0.4, '#6ab0ff', 90], [E.dgCold + 3, 1.8, 'LEGGY HUG', 0.42, 0.3, '#ff9ecb', 90],
  [E.dgBump, 1.0, 'BONK', 0.5, 0.35, '#ffffff', 110], [E.dgBump + 1.2, 1.6, 'THE EGG!', 0.5, 0.3, '#ff6b6b', 100], [E.dgBump + 3.5, 1.4, 'roll roll roll', 0.6, 0.4, '#ffffff', 60], [E.dgCatch + 0.6, 1.6, 'CAUGHT!', 0.5, 0.3, '#7cff6b', 110],
  [E.dgLamp + 1.5, 1.8, 'HEAT LAMP: MAX', 0.5, 0.3, '#ffb050', 80], [E.dgHot + 1, 1.6, 'smells toasty', 0.55, 0.35, '#ffffff', 60], [E.dgFire, 1.4, 'FWOOMP', 0.5, 0.35, '#ff8a2a', 120], [E.dgFire + 1.7, 1.6, 'plop.', 0.62, 0.35, '#ffffff', 80],
  [E.dgHat + 1, 1.8, 'perfect temperature', 0.5, 0.25, '#7cff6b', 60], [E.dgHop + 1.4, 1.4, 'HOT HOT HOT', 0.3, 0.4, '#ff6b6b', 80], [E.dgHop + 2.4, 1.6, 'Leggy: lava-proof', 0.68, 0.4, '#5ff7ff', 56],
  [E.dgWobble + 0.5, 1.6, '...it moved.', 0.5, 0.25, '#ffffff', 70], [E.dgCrack + 0.3, 1.0, 'tik', 0.42, 0.3, '#ffffff', 70], [E.dgCrack + 1.6, 1.0, 'tik tik', 0.58, 0.3, '#ffffff', 70], [E.dgHatch, 1.4, 'POP!', 0.5, 0.3, '#ffe066', 140], [E.dgHatch + 1.6, 1.6, 'chirp?', 0.55, 0.22, '#3ad6a0', 80],
  [E.dgImprint + 0.5, 2, 'MAMA?', 0.5, 0.2, '#ff9ecb', 110], [E.dgImprint + 3, 1.6, '*sad clicking*', 0.72, 0.5, '#5ff7ff', 52], [E.dgHic, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 110], [E.dgHic + 1, 1.6, 'singed.', 0.5, 0.45, '#ffffff', 70],
  [E.dgHic2, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 110], [E.dgHic2 + 1.2, 1.8, 'NOT THE INVOICE', 0.4, 0.4, '#ff6b6b', 70], [E.dgSnack + 3.4, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 100], [E.dgSnack + 4, 1.4, 'well done.', 0.62, 0.4, '#ffffff', 56],
  [E.dgSnack + 6.9, 1.4, 'nom', 0.5, 0.25, '#7cff6b', 90], [E.dgSnack + 8.4, 1.8, 'BEST FRIENDS', 0.5, 0.3, '#ff9ecb', 90], [E.dgLesson + 2.8, 1.6, 'FLYING LESSON', 0.5, 0.25, '#5ff7ff', 80], [E.dgLesson + 4.8, 1.2, 'plop', 0.62, 0.5, '#ffffff', 90], [E.dgLesson + 5.4, 1.6, 'flap flap flap', 0.4, 0.3, '#3ad6a0', 64],
  [E.dgNest + 2, 1.8, 'hello? Mama?', 0.5, 0.3, '#ffffff', 64], [E.dgShadow + 0.5, 1.6, 'whoosh', 0.5, 0.25, '#ffffff', 80], [E.dgLand, 1.6, 'THOOM', 0.5, 0.4, '#ffffff', 130], [E.dgRoar, 2.4, 'ROOOOAR', 0.5, 0.25, '#ff6a2a', 140],
  [E.dgSniff2 + 1, 1.6, '*sniff*', 0.5, 0.25, '#ffffff', 80], [E.dgSniff2 + 3, 1.8, 'she thinks I stole it', 0.5, 0.7, '#ff6b6b', 52], [E.dgChase, 1.4, 'RUN', 0.5, 0.3, '#ff6b6b', 130], [E.dgChase + 5, 1.4, 'FWOOOSH', 0.5, 0.3, '#ff8a2a', 110],
  [E.dgCorner + 1, 1.6, 'cliff.', 0.6, 0.6, '#ffffff', 80], [E.dgStep + 1, 1.8, 'LEGGY, NO!', 0.5, 0.3, '#5ff7ff', 90], [E.dgStep + 2.4, 1.6, '*flaps legs at dragon*', 0.5, 0.7, '#ffffff', 52], [E.dgFly + 1, 1.6, 'flap', 0.4, 0.4, '#3ad6a0', 80],
  [E.dgFly + 2.6, 1.6, 'flap flap', 0.6, 0.35, '#3ad6a0', 80], [E.dgFly + 4.4, 1.8, 'HE FLIES!', 0.5, 0.25, '#7cff6b', 110], [E.dgReunite + 1, 2, 'MAMA!', 0.5, 0.22, '#ff9ecb', 120], [E.dgReunite + 3.5, 1.6, '*purr*', 0.6, 0.35, '#ffffff', 80],
  [E.dgPay + 4, 1.6, '1 EGG DELIVERY', 0.5, 0.35, '#ffffff', 64], [E.dgPay + 4.6, 1.2, 'flick', 0.35, 0.3, '#ffe066', 80], [E.dgPay + 6.6, 1.6, 'thud.', 0.55, 0.5, '#ffffff', 80], [E.dgDawn + 1, 1.8, 'aww.', 0.5, 0.3, '#ffe066', 90],
  [E.dgBye + 1, 1.6, 'bye Pip!', 0.5, 0.3, '#3ad6a0', 80], [E.dgBye + 4.5, 1.6, 'one more favor?', 0.5, 0.3, '#ff6a2a', 64], [E.dgClutch + 3, 2, 'FIVE MORE?!', 0.5, 0.3, '#ff6b6b', 110],
  [EGGT28[0] + 0.9, 1.0, 'clonk', 0.4, 0.3, '#ffffff', 70], [EGGT28[1] + 0.9, 1.0, 'clonk', 0.58, 0.28, '#ffffff', 70], [EGGT28[2] + 0.9, 1.0, 'clonk', 0.42, 0.25, '#ffffff', 70], [EGGT28[3] + 0.9, 1.0, 'clonk', 0.6, 0.22, '#ffffff', 70], [EGGT28[4] + 0.9, 1.4, 'CLONK', 0.5, 0.18, '#ffe066', 90],
  [E.dgFlyOff + 1, 1.8, 'back by lunch!', 0.6, 0.25, '#ff6a2a', 64], [E.dgBabysit + 1, 1.8, 'BABYSITTING RATES', 0.5, 0.3, '#ffffff', 64], [E.dgWobble2 + 0.5, 1.4, 'uh oh', 0.5, 0.3, '#ffffff', 80], [E.dgCrack2, 1.0, 'tik', 0.4, 0.25, '#ffffff', 70],
  [E.dgCrack2 + 0.7, 1.0, 'tik', 0.6, 0.3, '#ffffff', 70], [E.dgCrack2 + 1.4, 1.2, 'tik tik tik', 0.5, 0.22, '#ffffff', 80], [E.dgHatchAll, 1.4, 'POP POP POP', 0.5, 0.2, '#ffe066', 120], [E.dgMoms + 0.4, 2, 'MAMA? x5', 0.5, 0.2, '#ff9ecb', 110],
  [E.dgHic3, 1.0, 'HIC!', 0.4, 0.2, '#ff8a2a', 120], [E.dgHic3 + 0.3, 1.0, 'HIC!', 0.6, 0.25, '#ff8a2a', 110], [E.dgHic3 + 1, 1.8, 'MY HAT', 0.5, 0.3, '#ff6b6b', 120], [E.dgHic3 + 3.4, 1.8, 'invoice: 1 HAT (toast)', 0.5, 0.75, '#ffffff', 52]];

const ZOOMS = [[E.dgEgg + 0.6, 1.0, 1.15, 0.5, 0.5], [E.dgHatch + 0.5, 1.0, 1.18, 0.5, 0.4], [E.dgImprint + 1, 1.0, 1.12, 0.5, 0.4], [E.dgRoar, 1.2, 1.12, 0.5, 0.4], [E.dgPay + 6.6, 0.8, 1.15, 0.5, 0.5], [E.dgHatchAll + 0.5, 1.0, 1.15, 0.5, 0.4]];
const SHAKES = [[E.dgBump, 0.6, 0.3], [E.dgFire, 0.8, 0.35], [E.dgHatch, 0.4, 0.2], [E.dgLand, 1.2, 0.5], [E.dgRoar, 2.5, 0.25], [E.dgChase, 10, 0.08], [E.dgFlyOff, 2, 0.25], [E.dgHatchAll, 0.5, 0.25], [E.dgHic3, 7, 0.08]];
const FLASH = [[E.dgCinder, 0.3, '255,255,255'], [E.dgNight - 0.8, 1.8, '0,0,0'], [E.dgFire, 0.4, '255,160,60'], [E.dgHatch, 0.4, '255,255,255'], [E.dgChase + 0.6, 0.4, '255,120,40'], [E.dgDawn, 1.2, '255,200,140'], [E.dgHatchAll, 0.4, '255,255,255'], [E.dgHic3, 0.4, '255,140,40']];
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
    outlined('EPISODE 28', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE DRAGON EGG', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it hatched in my hat)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 29: THE CARNIVAL' : 'EP 27: THE ROAD TRIP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the ferris wheel escapes)' : '(Leggy is driving)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.dgCinder, meadow, 'meadow'], [E.dgCinder, E.dgNight, cinder, 'cinder'], [E.dgNight, 1e9, peak, 'peak']];
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
  const night = t >= E.dgNight && t < E.dgDawn;
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
  const panic = win(T, E.dgBump + 0.6, E.dgCatch) || win(T, E.dgFire, E.dgFire + 1.6) || win(T, E.dgChase, E.dgCorner + 1) || win(T, E.dgHic3, E.freeze);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, E.dgNight + 1, E.dgNest - 0.5)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    stamp(T, E.dgSign + 3.5, 'QUEST: RETURN THE EGG');
    stamp(T, E.dgHat + 2.5, 'INCUBATOR: MY HAT');
    stamp(T, E.dgName + 1.5, 'NAME: PIP');
    stamp(T, E.dgPay + 5.4, 'INVOICE: PAID (in gold)');
    stamp(T, E.dgMoms + 2, 'MOM x6');
    drawHeat28(T);
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. they hatched.', 0, 0, 56, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that was my hat.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(all five of them. in my hat.)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
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
