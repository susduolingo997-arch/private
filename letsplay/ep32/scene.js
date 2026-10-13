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

// ---------------------------------------------------------------- Ep 29 helpers: Barker Bix, the Ferris wheel + the TURBO-SPIN 3000, the bumper car, rings, the giant plush crown, cotton candy, the ticket meter
const R29 = 7, RG29 = 4.2, AX29 = 7.6, WY29 = 0.5 + R29 + 0.18;
const glow29 = (c, i = 0.6) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
// ---- Barker Bix: the carnival's barker. top hat, megaphone, a mustache with a mind of its own
function makeBix29() {
  const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  const legs = [-0.2, 0.2].map(x => { const p = pivot(body, x, 0.55, 0); box(0.26, 0.55, 0.26, '#2a1d40', 0, -0.27, 0, p); box(0.3, 0.14, 0.42, '#111111', 0, -0.5, 0.06, p); return p; });
  box(0.98, 0.1, 0.68, '#ffd23f', 0, 0.6, 0, body); box(0.95, 0.9, 0.65, '#7a3ac0', 0, 1.05, 0, body);
  for (const x of [-0.3, 0, 0.3]) box(0.1, 0.9, 0.02, '#ffd23f', x, 1.05, 0.33, body);
  box(0.4, 0.16, 0.06, '#e8344e', 0, 1.4, 0.35, body); box(0.12, 0.12, 0.08, '#ff7a8a', 0, 1.4, 0.37, body);
  const arm = sd => { const p = pivot(body, sd * 0.58, 1.38, 0); box(0.22, 0.6, 0.24, '#7a3ac0', 0, -0.27, 0, p); box(0.26, 0.2, 0.26, '#ffffff', 0, -0.64, 0, p); return p; };
  const aL = arm(-1), aR = arm(1);
  const mega = pivot(aR, 0, -0.7, 0.05); for (const [s, y, c] of [[0.16, -0.12, '#ffffff'], [0.26, -0.3, '#e8344e'], [0.36, -0.48, '#ffffff'], [0.48, -0.64, '#e8344e']]) box(s, 0.18, s, c, 0, y, 0, mega);
  const hd = pivot(body, 0, 1.5, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.74, 0.74), faceMat('#8ee6c8', g => { g.fillStyle = '#fff'; g.fillRect(6, 7, 8, 9); g.fillRect(18, 7, 8, 9); g.fillStyle = '#1a1030'; g.fillRect(9, 10, 4, 5); g.fillRect(19, 10, 4, 5); g.fillStyle = '#2a1d40'; g.fillRect(5, 3, 10, 2); g.fillRect(17, 3, 10, 2); g.fillStyle = '#8a1020'; g.fillRect(12, 25, 8, 4); g.fillStyle = '#ff9ec0'; g.fillRect(3, 18, 4, 3); g.fillRect(25, 18, 4, 3); }));
  head.position.y = 0.37; head.castShadow = true; hd.add(head);
  const must = pivot(hd, 0, 0.26, 0.39); box(0.5, 0.12, 0.06, '#ffffff', 0, 0, 0, must); for (const s of [-1, 1]) { box(0.2, 0.1, 0.06, '#ffffff', s * 0.33, 0.05, 0, must); box(0.08, 0.16, 0.06, '#ffffff', s * 0.44, 0.15, 0, must); }
  const hat = pivot(hd, 0, 0.74, 0); box(0.98, 0.07, 0.98, '#1a1020', 0, 0, 0, hat); for (let i = 0; i < 4; i++) box(0.6, 0.17, 0.6, i % 2 ? '#ffffff' : '#e8344e', 0, 0.12 + i * 0.17, 0, hat); box(0.62, 0.05, 0.62, '#1a1020', 0, 0.8, 0, hat);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, aL, aR, hd, must, hat, mega };
}
function poseBix29(b, t, p, yaw, o = {}) {
  b.root.position.set(p[0], p[1] + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.45 : 0), p[2]); b.root.rotation.set(0, yaw, 0);
  const s = o.walk ? Math.sin(o.phase ?? t * 9) * 0.7 : 0; b.legs[0].rotation.x = s; b.legs[1].rotation.x = -s;
  b.body.rotation.set(o.lean || 0, 0, 0); b.body.position.y = Math.abs(Math.sin(t * 2.5)) * 0.03;
  b.aL.rotation.set(-s * 0.6, 0, -0.15); b.aR.rotation.set(s * 0.6, 0, 0.15);
  if (o.mega) b.aR.rotation.set(-1.75 + Math.sin(t * 7) * 0.08, 0, 0.25);
  if (o.wave) b.aL.rotation.set(-2.8, 0, -0.3 + Math.sin(t * 10) * 0.4);
  if (o.cheer) { b.aL.rotation.set(-2.9 + Math.sin(t * 12) * 0.2, 0, -0.3); b.aR.rotation.set(-2.9 + Math.cos(t * 12) * 0.2, 0, 0.3); }
  if (o.give) b.aL.rotation.set(-1.4, 0, 0);
  if (o.pull !== undefined) b.aR.rotation.set(-1.3 + o.pull * 0.9, 0, 0);
  if (o.panic) { b.aL.rotation.set(-2.7 + Math.sin(t * 22) * 0.5, 0, -0.3); b.aR.rotation.set(-2.7 + Math.cos(t * 22) * 0.5, 0, 0.3); }
  b.hd.rotation.set(o.headPitch || 0, (o.headYaw || 0) + Math.sin(t * 1.7) * 0.12, 0);
  b.must.rotation.z = o.talk ? Math.sin(t * 16) * 0.12 : 0; b.must.position.y = 0.26 + (o.talk ? Math.abs(Math.sin(t * 13)) * 0.03 : 0);
  b.hat.position.y = 0.74 + (o.hatPop ? Math.abs(Math.sin(t * 6)) * 0.35 : 0); b.hat.rotation.z = o.hatPop ? Math.sin(t * 6) * 0.2 : 0;
}
const bix29 = makeBix29();
// ---- the Ferris wheel (gondolas hang inside the rim, so it can roll. it was designed for this. probably.)
const bulbOn29 = ['#ff5ca8', '#ffe066', '#5ff7ff', '#7cff6b'].map(c => new THREE.MeshBasicMaterial({ color: c })), bulbOff29 = new THREE.MeshLambertMaterial({ color: '#4a4658' });
const bulbs29 = [];
function bulb29(parent, x, y, z, i, s = 0.2) { const m = box(s, s, s, 0, x, y, z, parent, bulbOn29[i % 4]); m.castShadow = false; m.userData.ci = i % 4; m.userData.k = bulbs29.length; bulbs29.push(m); return m; }
function makeWheel29() {
  const root = new THREE.Group(), spin = pivot(root, 0, 0, 0), N = 20, gond = [], gc = [];
  const rimM = new THREE.MeshLambertMaterial({ color: '#f0eaf8' }), spokeM = new THREE.MeshLambertMaterial({ color: '#c8c0e0' });
  for (let i = 0; i < N; i++) { const a = (i + 0.5) * 2 * PI / N, L = 2 * R29 * Math.sin(PI / N) + 0.12, x = R29 * Math.sin(a), y = -R29 * Math.cos(a);
    for (const z of [-1.0, 1.0]) { const m = box(L, 0.36, 0.3, 0, x, y, z, spin, rimM); m.rotation.z = a; }
    const cb = box(0.24, 0.24, 2.3, '#8a5ac0', x, y, 0, spin); cb.rotation.z = a;
    const b = i * 2 * PI / N; for (const z of [-1.2, 1.2]) bulb29(spin, (R29 + 0.05) * Math.sin(b), -(R29 + 0.05) * Math.cos(b), z, i); }
  for (let k = 0; k < 8; k++) { const b = (k + 0.5) * PI / 4; for (const z of [-1.0, 1.0]) { const s = box(0.16, R29, 0.16, 0, Math.sin(b) * R29 / 2, -Math.cos(b) * R29 / 2, z, spin, spokeM); s.rotation.z = b; } }
  box(1.3, 1.3, 2.7, '#5a3a8a', 0, 0, 0, spin); for (const z of [-1.4, 1.4]) { const s = box(0.9, 0.9, 0.1, 0, 0, 0, z, spin, glow29('#ffd23f', 0.5)); s.rotation.z = PI / 4; }
  const GC = ['#ff5ca8', '#3ab0ff', '#ffd23f', '#7cff6b', '#ff8a2a', '#b07aff'];
  for (let i = 0; i < 6; i++) { const a = i * PI / 3, gp = pivot(spin, RG29 * Math.sin(a), -RG29 * Math.cos(a), 0), c = pivot(gp, 0, 0, 0), col = GC[i];
    box(0.12, 0.5, 0.12, '#c0c0c8', 0, -0.25, 0, c); box(2.0, 0.16, 1.6, col, 0, -0.55, 0, c); box(1.7, 0.08, 1.35, '#ffffff', 0, -0.45, 0, c);
    for (const [x, z] of [[-0.88, -0.68], [0.88, -0.68], [-0.88, 0.68], [0.88, 0.68]]) box(0.08, 1.9, 0.08, '#c0c0c8', x, -1.6, z, c);
    box(1.9, 0.14, 1.5, shade(col, 0.7), 0, -2.6, 0, c);
    for (const z of [-0.72, 0.72]) box(1.9, 0.5, 0.08, col, 0, -2.3, z, c);
    for (const x of [-0.92, 0.92]) box(0.08, 0.5, 1.5, col, x, -2.3, 0, c);
    gond.push(gp); gc.push(c); }
  return { root, spin, gond, gc };
}
const wheel29 = makeWheel29();
function poseWheel29(W) { wheel29.root.position.set(...W.p); wheel29.root.rotation.set(0, W.yaw, 0); wheel29.spin.rotation.z = -W.ang; wheel29.gc.forEach((c, i) => { c.rotation.z = W.ang + Math.sin(W.ang * 3 + i) * (W.swing || 0); }); }
const seatW29 = (W, i) => { const a = i * PI / 3 - W.ang, q = wl(W.p, W.yaw, [RG29 * Math.sin(a), -RG29 * Math.cos(a), 0]); q[1] -= 2.53; return q; };
function seatHero29(t, i, yawW, W, o = {}) { parentTo(hero.root, wheel29.gc[i]); pose(hero, { t, p: [0, -2.53, 0], yaw: yawW - W.yaw, sit: 1, ...o }); }
function seatLeggy29(t, i, yawW, W) { parentTo(L6.root, wheel29.gc[i]); L6.root.scale.setScalar(0.5); poseLurk(L6, t, [0, -2.53, 0], yawW - W.yaw, 0.3); }
const gcam29 = (S, o, l = [0, 1.3, 0], fov = 50) => ({ p: [S[0] + o[0], S[1] + o[1], S[2] + o[2]], l: [S[0] + l[0], S[1] + l[1], S[2] + l[2]], fov });
// ---- bumper car no. 7 (Bloop drives, Bix yells)
function makeCar29() { const root = new THREE.Group(), body = pivot(root, 0, 0, 0);
  box(1.95, 0.3, 2.6, '#222230', 0, 0.15, 0, body); box(1.7, 0.45, 2.3, '#3a8aff', 0, 0.52, 0, body); box(1.5, 0.75, 0.35, '#3a8aff', 0, 1.05, -0.95, body);
  box(1.2, 0.12, 0.9, '#1a2a5a', 0, 0.8, -0.3, body); box(0.1, 0.55, 0.1, '#888888', 0, 1.0, 0.65, body); const sw = box(0.55, 0.06, 0.55, '#222222', 0, 1.28, 0.6, body); sw.rotation.x = -0.6;
  box(0.08, 2.4, 0.08, '#c0c0c8', 0, 2.0, -1.15, body); const spark = box(0.24, 0.24, 0.24, 0, 0, 3.25, -1.15, body, new THREE.MeshBasicMaterial({ color: '#ffe066' }));
  plane26(0.9, 0.42, txtMat26(['7'], 64, 48, '#ffffff', '#3a8aff', 40), body, 0, 0.55, 1.16);
  root.traverse(o => { if (o.isMesh) o.castShadow = o !== spark; }); return { root, body, spark }; }
const car29 = makeCar29();
function poseCar29(t, p, yaw, drive) { parentTo(car29.root, car29.root.parent || scene); car29.root.visible = true; car29.root.position.set(...p); car29.root.rotation.set(0, yaw, 0);
  car29.body.position.y = drive ? Math.abs(Math.sin(t * 17)) * 0.05 : 0; car29.body.rotation.z = drive ? Math.sin(t * 9) * 0.03 : 0; car29.spark.visible = !drive || Math.floor(t * 12) % 3 > 0; }
function rideCar29(t, p, yaw, bo = {}, xo = { mega: true, talk: true }) { poseBurble(bloop6, t, wl(p, yaw, [0, 0.62, -0.2]), yaw, bo); bloop6.B.aL.rotation.set(-1.1, 0, 0); if (!bo.handOut && !bo.angry) bloop6.B.aR.rotation.set(-1.1, 0, 0);
  bix29.root.visible = true; poseBix29(bix29, t, wl(p, yaw, [0, 0.3, -1.55]), yaw, xo); }
// ---- rings, the plush crown, the cotton candy, tickets, invoices
const rings29 = ['#ff5ca8', '#3ab0ff', '#ffd23f', '#7cff6b', '#ff8a2a', '#b07aff', '#5ff7ff'].map(c => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.06, 6, 14), new THREE.MeshLambertMaterial({ color: c })); m.castShadow = true; return m; });
function makePlush29() { const g = new THREE.Group(), soft = glow29('#ffd84a', 0.18), pink = glow29('#ff7ac0', 0.4);
  for (const [w, d, x, z] of [[1.6, 0.3, 0, 0.65], [1.6, 0.3, 0, -0.65], [0.3, 1.0, 0.65, 0], [0.3, 1.0, -0.65, 0]]) box(w, 0.6, d, 0, x, 0.3, z, g, soft);
  for (const [x, z] of [[-0.65, 0.65], [0.65, 0.65], [-0.65, -0.65], [0.65, -0.65], [0, 0.65], [0, -0.65], [0.65, 0], [-0.65, 0]]) { box(0.3, 0.5, 0.3, 0, x, 0.85, z, g, soft); box(0.22, 0.22, 0.22, 0, x, 1.2, z, g, pink); }
  for (const x of [-0.28, 0.28]) box(0.14, 0.2, 0.04, '#1a1020', x, 0.36, 0.81, g); box(0.34, 0.08, 0.04, '#c0187a', 0, 0.2, 0.81, g);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); return g; }
const plush29 = makePlush29();
const fluff29 = new THREE.Group(); L6.body.add(fluff29); { const m = glow29('#ffb0dc', 0.35); for (const [x, y, z, s] of [[0, 0.6, 0.6, 0.9], [0.4, 0.75, -0.2, 0.8], [-0.4, 0.7, -0.5, 0.85], [0, 0.95, 0, 0.9], [0.5, 0.5, 0.9, 0.6], [-0.5, 0.5, 1.0, 0.65], [0, 0.6, -1.2, 0.75], [0, 1.3, 0.5, 0.6], [0.35, 0.3, 1.6, 0.55], [-0.35, 0.45, 1.7, 0.5]]) box(s, s, s, 0, x, y, z, fluff29, m); }
function tixStrip29() { const g = new THREE.Group(); for (let i = 0; i < 5; i++) { box(0.32, 0.03, 0.17, i % 2 ? '#ffb040' : '#ff8a2a', 0, i * 0.012, -0.36 + i * 0.18, g); box(0.06, 0.035, 0.17, '#ffffff', 0.1, i * 0.012, -0.36 + i * 0.18, g); } return g; }
const tixB29 = tixStrip29(); bix29.aL.add(tixB29); tixB29.position.set(0, -0.78, 0.12); tixB29.rotation.x = 1.4;
const tixL29 = tixStrip29(); bloop6.B.aR.add(tixL29); tixL29.position.set(0, -0.62, 0.2); tixL29.rotation.x = 1.4;
const inv29a = card28(['INVOICE', '1 TURBO'], '#ffffff', '#c0182a'), inv29b = card28(['INVOICE', '500 TICKETS'], '#ffffff', '#c0182a', 28), inv29c = card28(['INVOICE', 'WHEEL x2'], '#ffffff', '#c0182a', 30);
for (const c of [inv29a, inv29b, inv29c]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
function hide29() { hide28(); [wheel29.root, bix29.root, car29.root, plush29, fluff29, tixB29, tixL29, inv29a, inv29b, inv29c, ...rings29].forEach(o => o.visible = false); L6.root.scale.setScalar(1); L6.root.rotation.set(0, 0, 0); crownM.visible = true; }
function bloopReset29(g) { [hero.root, bloop6.B.root, L6.root, bix29.root, wheel29.root, car29.root].forEach(o => parentTo(o, g)); L6.root.visible = bloop6.B.root.visible = wheel29.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; }
// ---- tickets: the meter that drives the plot
const TIXK29 = [[0, 0], [E.cvRing2 + 4, 0], [E.cvRing2 + 4.8, 200], [E.cvHammer + 3, 200], [E.cvHammer + 3.4, 205], [E.cvHammer2 + 3, 205], [E.cvHammer2 + 3.8, 505], [E.cvCandy + 5, 505], [E.cvCandy + 5.8, 205],
  [E.cvCount + 3, 205], [E.cvCount + 3.8, 705], [E.cvGift + 3, 705], [E.cvGift + 3.8, 1205], [E.cvRedeem + 2, 1205], [E.cvRedeem + 2.8, 205]];
const tix29 = t => Math.round(lerpK(TIXK29, t));
function drawTix29(t) { if (t >= E.freeze || t < E.cvRing - 1) return;
  rrect(22, 96, 240, 112, 12); ctx.fillStyle = 'rgba(30,12,40,.8)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5ca8'; ctx.stroke();
  const n = tix29(t), fl = Math.floor(t * 4) % 2, esc = win(t, E.cvPop, E.cvBack) || t >= E.cvPop2;
  outlined('TICKETS', 142, 114, 15, '#ffd27a', '#000', 3); ICON.ticket(58, 146, 15);
  outlined(String(n) + ' / 1000', 152, 144, 26, n >= 1000 ? '#7cff6b' : '#ffffff', '#000', 5);
  rrect(40, 166, 204, 10, 5); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fill(); if (n > 0) { rrect(40, 166, Math.max(10, 204 * clamp(n / 1000, 0, 1)), 10, 5); ctx.fillStyle = n >= 1000 ? '#7cff6b' : '#ff5ca8'; ctx.fill(); }
  outlined(esc ? 'FERRIS WHEEL: ESCAPED' : t > E.cvRedeem + 2.8 ? 'GRAND PRIZE: MINE' : 'GRAND PRIZE: 1000', 142, 194, 13, esc ? (fl ? '#ff3a1a' : '#ffe066') : '#fff', '#000', 3); }
function drawTurbo29(T) { const on = win(T, E.cvTurboOn + 1, E.cvPop + 1) || win(T, E.cvSpin2 + 0.5, E.cvPop2 + 1); if (!on) return; const fl = Math.floor(T * 6) % 2;
  ctx.save(); ctx.translate(W - 140, 300); ctx.rotate(-0.08); rrect(-110, -26, 220, 52, 12); ctx.fillStyle = fl ? 'rgba(200,20,40,.85)' : 'rgba(230,160,20,.85)'; ctx.fill(); outlined('TURBO: MAX', 0, 2, 26, '#fff', '#000', 5); ctx.restore(); }
function tree29(st, x, z, h, base = 0) { for (let y = 1; y <= h; y++) st.add(x, base + y, z, 'log'); for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) for (let dy = 0; dy <= 2; dy++) { if (Math.abs(dx) + Math.abs(dz) + dy > 3 || (dx === 0 && dz === 0 && dy === 0)) continue; st.add(x + dx, base + h + dy, z + dz, 'leaf'); } }

// ---------------------------------------------------------------- Ep 30 helpers: the DEEP DIPPER (no windows), Mo the anglerfish, the Glow Pearl, fish schools, kelp, light rays, the sonar HUD
const glow30 = (c, i = 0.6) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const _v30 = new THREE.Vector3();
const wpos30 = o => { o.getWorldPosition(_v30); return [_v30.x, _v30.y, _v30.z]; };
const lp30 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const bub30 = (t, p, n = 14, s = 0.12) => burst(t, p, { n, colors: ['#dff6ff', '#ffffff', '#9fdcff'], speed: 0.8, size: s, life: 2.2, grav: -2.5, up: 0.6 });
const bubS30 = (t0, t1, pos, dt = 0.12, s = 0.1) => smoke(t0, t1, dt, pos, { n: 2, colors: ['#dff6ff', '#ffffff', '#9fdcff'], speed: 0.4, size: s, life: 2, grav: -2.5, up: 0.8 });
const splash30 = (t, p, n = 80) => burst(t, p, { n, colors: ['#ffffff', '#bfe8ff', '#7cc8f0'], speed: 5, size: 0.2, life: 1.3, grav: 9, up: 5 });
// ---- the DEEP DIPPER: yellow, chunky, propeller, claw arm, periscope, a cupholder (outside), zero windows (until act 3: forty)
function makeSub30() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const hull = new THREE.MeshLambertMaterial({ color: '#ffc23a' }), dk = new THREE.MeshLambertMaterial({ color: '#c8861a' }), red = new THREE.MeshLambertMaterial({ color: '#e8344e' }), steel = new THREE.MeshLambertMaterial({ color: '#8a8a98' });
  box(2.6, 2.4, 6, 0, 0, 0, 0, body, hull); box(2.64, 0.4, 6.04, 0, 0, -0.3, 0, body, red);
  box(2.0, 2.0, 0.8, 0, 0, 0, 3.4, body, hull); box(1.3, 1.3, 0.4, 0, 0, 0, 4.0, body, dk);
  box(2.0, 2.0, 0.8, 0, 0, 0, -3.4, body, hull); box(1.2, 1.2, 0.4, 0, 0, 0, -4.0, body, dk);
  box(0.16, 1.5, 1.1, 0, 0, 1.6, -3.4, body, red); box(3.2, 0.16, 1.1, 0, 0, 0, -3.4, body, red);
  box(1.4, 1.1, 1.9, 0, 0, 1.75, 0.3, body, hull); box(1.5, 0.12, 2.0, 0, 0, 2.3, 0.3, body, dk); box(1.0, 0.06, 1.0, '#222230', 0, 2.37, 0.3, body);
  const lid = pivot(body, 0, 2.4, -0.15); box(0.9, 0.1, 0.9, 0, 0, 0, 0.45, lid, steel); box(0.3, 0.1, 0.1, '#444444', 0, 0.08, 0.7, lid);
  const peri = pivot(body, 0.42, 1.0, 0.9); box(0.16, 1.4, 0.16, 0, 0, 0.7, 0, peri, steel); box(0.24, 0.24, 0.5, 0, 0, 1.45, 0.15, peri, steel); box(0.18, 0.18, 0.04, 0, 0, 1.45, 0.41, peri, glow30('#5ff7ff', 0.7));
  const prop = pivot(body, 0, 0, -4.35); box(0.3, 0.3, 0.3, 0, 0, 0, 0, prop, steel); for (let i = 0; i < 3; i++) { const b = box(0.34, 1.6, 0.08, 0, 0, 0, 0, prop, steel); b.rotation.z = i * PI / 3; }
  const lampM = glow30('#fff6c0', 0.2); box(0.7, 0.42, 0.12, 0, 0, 0.75, 4.25, body, lampM);
  const hl = new THREE.PointLight('#fff2c0', 0, 26, 1.3); hl.position.set(0, 0.6, 5.6); body.add(hl);
  const arm = pivot(body, 0, -0.95, 3.7), seg = box(0.26, 0.26, 1, 0, 0, 0, 0.5, arm, steel), hand = pivot(arm, 0, 0, 1);
  box(0.42, 0.32, 0.3, 0, 0, 0, 0.1, hand, steel); const fU = pivot(hand, 0, 0.12, 0.22), fD = pivot(hand, 0, -0.12, 0.22);
  box(0.12, 0.08, 0.5, 0, 0, 0, 0.25, fU, red); box(0.12, 0.08, 0.5, 0, 0, 0, 0.25, fD, red); const clawTip = pivot(hand, 0, 0, 0.45);
  const cup = new THREE.Group(); body.add(cup); box(0.1, 0.5, 0.5, '#888888', -1.36, 0.2, 1.6, cup); box(0.3, 0.42, 0.3, '#ffffff', -1.6, 0.6, 1.6, cup); box(0.32, 0.08, 0.32, '#e8344e', -1.6, 0.68, 1.6, cup); box(0.04, 0.4, 0.04, '#ff5ca8', -1.55, 0.95, 1.6, cup);
  for (const sd of [-1, 1]) plane26(2.6, 0.55, txtMat26(['DEEP DIPPER'], 384, 80, '#ffc23a', '#1a2a5a', 46), body, sd * 1.32, 0.95, -1.0, sd * PI / 2);
  const glassM = new THREE.MeshLambertMaterial({ color: '#bff0ff', emissive: '#5fc8e8', emissiveIntensity: 0.55, transparent: true, opacity: 0.88 }), holeM = new THREE.MeshBasicMaterial({ color: '#06121c' }), rimM = new THREE.MeshLambertMaterial({ color: '#8a8a98' });
  const wins = [], holes = [];
  const addW = (x, y, z, ry) => { const w = pivot(body, x, y, z); w.rotation.y = ry; box(0.56, 0.56, 0.05, 0, 0, 0, 0, w, rimM); box(0.44, 0.44, 0.07, 0, 0, 0, 0, w, glassM); const h = box(0.46, 0.46, 0.08, 0, x, y, z, body, holeM); h.rotation.y = ry; wins.push(w); holes.push(h); };
  for (const sd of [-1, 1]) for (const y of [0.3, -0.85]) for (let i = 0; i < 8; i++) addW(sd * 1.32, y, -2.65 + i * 0.76, PI / 2);
  for (const sd of [-1, 1]) for (const z of [0.0, 0.65]) addW(sd * 0.72, 1.75, z, PI / 2);
  for (const x of [-0.78, 0.78]) for (const y of [-0.72, 0.72]) addW(x, y, 3.81, 0);
  root.traverse(o => { if (o.isMesh) o.castShadow = o.material !== glassM; });
  return { root, body, lid, peri, prop, hl, lampM, arm, seg, hand, fU, fD, clawTip, wins, holes, cup };
}
function poseSub30(S, t, p, yaw, o = {}) {
  S.root.visible = o.vis !== false; S.root.position.set(...p); S.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); S.root.scale.setScalar(o.s ?? 1);
  S.body.position.y = o.bob ? Math.sin(t * 1.6) * 0.08 : 0; S.body.rotation.z = o.bob ? Math.sin(t * 1.1) * 0.03 : 0;
  S.prop.rotation.z = t * (o.prop ?? 0);
  S.lid.rotation.x = -(o.lid || 0) * 1.9; S.peri.position.y = 1.0 + (o.peri || 0) * 1.3;
  S.hl.intensity = o.light ?? 0; S.lampM.emissiveIntensity = (o.light ?? 0) > 0 ? 1.2 : 0.2;
  const ext = o.ext ?? 0.6; S.arm.rotation.x = o.armX ?? 0.9; S.seg.scale.z = ext; S.seg.position.z = ext / 2; S.hand.position.z = ext;
  const op = o.open ?? 0; S.fU.rotation.x = -op * 0.7; S.fD.rotation.x = op * 0.7;
  const n = o.nWin ?? 0; S.wins.forEach((w, i) => w.visible = !o.broken && i < n); S.holes.forEach(h => h.visible = !!o.broken);
  S.cup.visible = o.cup !== false;
}
// ---- Mo: a giant blocky anglerfish. underbite, lantern lure, very lonely in the dark (the "Glow Pearl" is her light bulb)
function makeMo30() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const skin = new THREE.MeshLambertMaterial({ color: '#4a3a7a' }), belly = new THREE.MeshLambertMaterial({ color: '#9a8ac8' }), fin = new THREE.MeshLambertMaterial({ color: '#7a4ab8' }), tooth = new THREE.MeshLambertMaterial({ color: '#f4f0e0', emissive: '#f4f0e0', emissiveIntensity: 0.2 }), spot = glow30('#5ff7ff', 0.5);
  box(4.0, 3.2, 4.0, 0, 0, 0, -0.4, body, skin); box(3.6, 0.5, 3.6, 0, 0, -1.6, -0.4, body, belly); box(3.0, 2.4, 1.8, 0, 0, 0.2, -3.2, body, skin);
  for (const [sd, y, z] of [[1, 0.8, -1.2], [-1, 0.4, -0.2], [1, -0.5, 0.6], [-1, 0.9, -1.8], [-1, -0.6, 0.8]]) box(0.12, 0.3, 0.3, 0, sd * 2.02, y, z, body, spot);
  for (let i = 0; i < 4; i++) box(0.2, 0.7 - i * 0.1, 0.5, 0, 0, 1.95 - i * 0.05, -1.4 - i * 0.8, body, fin);
  const tail = pivot(body, 0, 0.2, -4.1); box(0.3, 3.0, 1.6, 0, 0, 0, -0.8, tail, fin);
  const fins = [-1, 1].map(sd => { const p = pivot(body, sd * 2.0, -0.6, 0.4); box(1.6, 0.14, 1.1, 0, sd * 0.8, 0, 0, p, fin); return p; });
  const head = pivot(body, 0, 0.4, 1.6); box(4.2, 2.0, 2.6, 0, 0, 0.3, 1.3, head, skin);
  box(3.8, 1.3, 0.2, '#3a0a1a', 0, -0.9, 0.3, head);
  for (let i = 0; i < 7; i++) box(0.24, 0.5, 0.24, 0, -1.8 + i * 0.6, -0.95, 2.4, head, tooth);
  const jaw = pivot(head, 0, -0.8, 0.1); box(4.2, 0.9, 2.9, 0, 0, -0.45, 1.45, jaw, skin); box(3.8, 0.12, 2.6, '#7a1a3a', 0, 0.02, 1.4, jaw);
  for (let i = 0; i < 6; i++) box(0.24, 0.55, 0.24, 0, -1.5 + i * 0.6, 0.27, 2.75, jaw, tooth);
  const eyeW = new THREE.MeshBasicMaterial({ color: '#fff4c0' }), eyeI = new THREE.MeshBasicMaterial({ color: '#ffb020' });
  const eyes = [-1, 1].map(sd => { const e = pivot(head, sd * 1.35, 1.0, 2.4); box(1.0, 1.0, 0.7, 0, 0, 0, 0, e, eyeW); box(0.6, 0.6, 0.1, 0, 0, 0, 0.36, e, eyeI); box(0.34, 0.34, 0.12, '#111111', 0, 0, 0.38, e); box(0.14, 0.14, 0.13, 0, 0.12, 0.12, 0.4, e, new THREE.MeshBasicMaterial({ color: '#ffffff' })); return e; });
  const lids = [-1, 1].map(sd => box(1.08, 1.08, 0.78, 0, sd * 1.35, 1.0, 2.4, head, skin));
  const blush = [-1, 1].map(sd => box(0.6, 0.3, 0.1, '#ff7ac0', sd * 1.5, 0.15, 2.62, head));
  const l1 = pivot(head, 0, 1.3, 1.4); box(0.18, 1.6, 0.18, 0, 0, 0.8, 0, l1, fin);
  const l2 = pivot(l1, 0, 1.6, 0); box(0.16, 1.4, 0.16, 0, 0, 0.7, 0, l2, fin);
  const l3 = pivot(l2, 0, 1.4, 0); box(0.14, 0.9, 0.14, 0, 0, 0.45, 0, l3, fin);
  const tip = pivot(l3, 0, 1.05, 0); box(0.26, 0.26, 0.26, '#2a2040', 0, -0.1, 0, tip);
  const mouth = pivot(head, 0, -0.6, 3.2);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, head, jaw, tail, fins, eyes, lids, blush, lure: [l1, l2, l3], tip, mouth };
}
function poseMo30(m, t, p, yaw, o = {}) {
  m.root.visible = true; m.root.position.set(...p); m.root.rotation.set(o.pitch || 0, yaw, 0); m.root.scale.setScalar(o.s ?? 1.6);
  m.tail.rotation.y = Math.sin(t * (o.swim ? 7 : 2)) * (o.swim ? 0.5 : 0.2); m.body.rotation.z = o.wiggle ? Math.sin(t * 9) * 0.12 : 0; m.body.position.y = Math.sin(t * 1.3) * 0.08;
  m.body.scale.set(o.puff ? 1.2 : 1, 1, 1);
  m.fins.forEach((f, i) => f.rotation.z = (i ? -1 : 1) * Math.sin(t * (o.wave && !i ? 11 : 4) + i) * (o.wave && !i ? 0.9 : 0.3));
  m.jaw.rotation.x = o.jaw ?? (o.chomp ? Math.abs(Math.sin(t * 5)) * 0.8 : 0.04);
  m.lids.forEach(l => l.visible = !!o.sleep); m.eyes.forEach(e => e.scale.set(1, o.happy ? 0.3 : 1, 1)); m.blush.forEach(b => b.visible = !!o.happy);
  m.lure[0].rotation.x = 0.15 + Math.sin(t * 1.5) * 0.05; m.lure[1].rotation.x = 1.0 + Math.sin(t * 2) * 0.08; m.lure[2].rotation.x = 1.0;
  m.head.rotation.x = o.headX || 0;
}
// ---- fish, kelp, light rays
function makeSchool30(n, cols, seed, glow = false) { const g = new THREE.Group(), F = [];
  for (let i = 0; i < n; i++) { const f = new THREE.Group(), c = cols[i % cols.length]; box(0.16, 0.3, 0.5, 0, 0, 0, 0, f, glow ? glow30(c, 0.6) : new THREE.MeshLambertMaterial({ color: c })); box(0.05, 0.26, 0.2, shade(c, 0.8), 0, 0, -0.33, f); box(0.17, 0.06, 0.06, '#111111', 0, 0.06, 0.18, f); g.add(f);
    F.push({ f, a: hash2(i, 1, seed) * 6.28, r: hash2(i, 2, seed) * 1.6, y: (hash2(i, 3, seed) - 0.5) * 1.6, s: 0.8 + hash2(i, 4, seed) * 0.4 }); }
  return { g, F }; }
function poseSchool30(S, t, c, R = 3, sp = 0.6) { S.g.visible = true; S.F.forEach((q, i) => { const a = t * sp * q.s + q.a, r = R + q.r; q.f.position.set(c[0] + Math.cos(a) * r, c[1] + q.y + Math.sin(t * 2 + i) * 0.2, c[2] + Math.sin(a) * r); q.f.rotation.y = sp > 0 ? -a : -a + PI; }); }
function kelp30(parent, x, y, z, n) { const p = pivot(parent, x, y, z); for (let k = 0; k < n; k++) { box(0.32, 1.02, 0.32, k % 2 ? '#2e8a4a' : '#3a9a52', 0, k + 0.5, 0, p); if (k % 2) box(0.7, 0.12, 0.3, '#4ab05a', k % 4 === 1 ? 0.4 : -0.4, k + 0.6, 0, p); } return p; }
const rayM30 = new THREE.MeshBasicMaterial({ color: '#cff4ff', transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending });
const sub30 = makeSub30(), mo30 = makeMo30();
// ---- the Glow Pearl (on Mo's lure), the mini pearl (Leggy's), invoices, the tarp, the bottle
const pearl30 = new THREE.Group(); { const m = glow30('#e8fbff', 1.0); for (const [w, h, d] of [[0.5, 0.5, 0.5], [0.66, 0.3, 0.3], [0.3, 0.66, 0.3], [0.3, 0.3, 0.66]]) box(w, h, d, 0, 0, 0, 0, pearl30, m); pearl30.userData.m = m; }
const pearlL30 = new THREE.PointLight('#bff8ff', 0, 22, 1.2); pearl30.add(pearlL30);
function setPearl30(on) { const m = pearl30.userData.m; m.emissiveIntensity = on ? 1.0 : 0.04; m.color.set(on ? '#e8fbff' : '#7a7a8a'); pearlL30.intensity = on ? 16 : 0; }
const mini30 = new THREE.Group(); { const m = glow30('#ffd8f4', 1.0); for (const [w, h, d] of [[0.26, 0.26, 0.26], [0.34, 0.14, 0.14], [0.14, 0.34, 0.14]]) box(w, h, d, 0, 0, 0, 0, mini30, m); }
const miniF30 = mini30.clone(); miniF30.scale.setScalar(1.4);
L6.hd.add(mini30); mini30.position.set(0, 0.62, 0.35); mini30.visible = false;
L6.tips = L6.legs.map((p, i) => pivot(p, (i < 3 ? -1 : 1) * 0.95, -0.9, 0));
function plug30(k) { L6.body.position.y = lerp(L6.body.position.y, 1.0, k); L6.legs.forEach((l, i) => { l.rotation.z = (i < 3 ? 1 : -1) * 1.35 * k; l.rotation.x = [0.6, 0, -0.6][i % 3] * k; }); }
const inv30a = card28(['INVOICE', 'WINDOWS x40'], '#ffffff', '#c0182a', 28), inv30b = card28(['INVOICE', 'x40 (AGAIN)'], '#ffffff', '#c0182a', 28);
for (const c of [inv30a, inv30b]) { bloop6.B.aR.add(c); c.position.set(0, -0.62, 0.2); c.rotation.x = 1.4; c.visible = false; }
const tarp30 = new THREE.Group(); box(3.3, 3.0, 9.4, '#3a6ad0', 0, 0, 0, tarp30); box(3.4, 0.5, 9.5, '#2a50a8', 0, 1.0, 0, tarp30); for (const z of [-3, 0, 3]) box(3.36, 3.06, 0.14, '#d9b070', 0, 0, z, tarp30); box(1.6, 1.4, 2.2, '#3a6ad0', 0, 2.0, 0.3, tarp30);
const bottle30 = new THREE.Group(); box(0.28, 0.5, 0.28, 0, 0, 0, 0, bottle30, new THREE.MeshLambertMaterial({ color: '#6ad08a', transparent: true, opacity: 0.8 })); box(0.14, 0.2, 0.14, '#6ad08a', 0, 0.33, 0, bottle30); box(0.12, 0.1, 0.12, '#a07a40', 0, 0.46, 0, bottle30); box(0.16, 0.3, 0.05, '#f6e7c1', 0, 0, 0, bottle30);
const seaObjs30 = [sub30.root, mo30.root, pearl30, tarp30, bottle30, miniF30];
function hide30() { hide29(); [...seaObjs30, inv30a, inv30b, mini30].forEach(o => o.visible = false); }
function reset30(g) { [hero.root, bloop6.B.root, L6.root, ...seaObjs30].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true; bHat.visible = true; bHat.position.y = 1.2; bHat.rotation.y = 0; bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; }
// ---- the sonar: the mechanic that (sort of) replaces windows
const DEP30 = [[0, 0], [E.sbDive, 0], [E.sbCabin, 6], [E.sbDeep, 18], [E.sbIdea, 42], [E.sbTrench, 44], [E.sbClaw, 138], [E.sbTow, 138], [E.sbBreach, 0], [E.sbDive2, 0], [E.sbView, 8], [E.sbSpit, 8]];
function drawSonar30(t) { const on = win(t, E.sbSonar, E.sbBreach) || win(t, E.sbDive2, E.sbSpit); if (!on || t >= E.freeze) return;
  rrect(22, 96, 250, 124, 12); ctx.fillStyle = 'rgba(6,24,20,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7cff6b'; ctx.stroke();
  const cx = 76, cy = 158, R = 46; ctx.fillStyle = '#062a14'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(124,255,107,.45)'; ctx.lineWidth = 1.5; for (const r of [R, R * 0.66, R * 0.33]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); }
  const a = t * 2.4; ctx.strokeStyle = '#7cff6b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke();
  const big = win(t, E.sbClaw - 3, E.sbBreach), mo = t > E.sbMo;
  const blips = [[0.5, 0.6, 3], [2.2, 0.8, 3], [4.0, 0.4, 3]]; if (big) blips.push([-1.57 + Math.sin(t * 0.5) * 0.1, mo ? 0.5 : 0.8, mo ? 11 : 7]);
  for (const [ba, br, s] of blips) { const f = 1 - ((((a - ba) % 6.283) + 6.283) % 6.283) / 6.283; ctx.fillStyle = s > 8 ? `rgba(255,80,60,${0.4 + 0.6 * f})` : `rgba(124,255,107,${0.3 + 0.7 * f})`; ctx.beginPath(); ctx.arc(cx + Math.cos(ba) * br * R, cy + Math.sin(ba) * br * R, s, 0, 7); ctx.fill(); }
  if (big) outlined(mo ? 'NOT A ROCK' : 'big rock?', cx, cy - R + 4, 11, mo ? '#ff6b5a' : '#bfffb0', '#000', 3);
  const d = Math.round(lerpK(DEP30, t)), nw = t < E.sbChip ? 0 : t < E.sbBreach ? 1 : t < E.sbBurst ? 40 : 0, fl = Math.floor(t * 4) % 2;
  outlined('SONAR', 200, 112, 15, '#7cff6b', '#000', 3); outlined('DEPTH', 200, 136, 12, '#bfffb0', '#000', 3); outlined(d + ' m', 200, 158, 24, '#ffffff', '#000', 5);
  outlined('WINDOWS: ' + nw + (t >= E.sbChip && t < E.sbBreach ? ' (tiny)' : t >= E.sbBurst ? ' (again)' : ''), 200, 194, 12, nw === 0 && fl ? '#ff6b5a' : '#ffe066', '#000', 3); }
function drawMap30(T) { const s = E.sbBottle + 2.6, e = E.sbBottle + 6.8; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.45 + (1 - k) * 60); ctx.rotate(-0.04);
  ctx.fillStyle = '#f2dfb0'; ctx.fillRect(-200, -150, 400, 300); ctx.strokeStyle = '#a07a40'; ctx.lineWidth = 6; ctx.strokeRect(-200, -150, 400, 300);
  outlined('THE GLOW PEARL', 0, -110, 30, '#5a2a10', '#f2dfb0', 2);
  ctx.font = F(19, 'normal'); ctx.fillStyle = '#3a2410'; ctx.textAlign = 'center'; ['Gloom Trench. Very bottom.', 'It glows. It is a pearl.', 'Finders keepers!'].forEach((l, i) => { if (T > s + 0.6 + i * 0.8) ctx.fillText(l, 0, -60 + i * 34); });
  ctx.strokeStyle = '#3a6ad0'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -160; x <= 160; x += 8) ctx.lineTo(x, 70 + Math.sin(x * 0.08) * 5); ctx.stroke();
  ctx.strokeStyle = '#3a2410'; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.moveTo(-140, 74); ctx.quadraticCurveTo(0, 150, 100, 120); ctx.stroke(); ctx.setLineDash([]);
  if (T > s + 2.6) outlined('X', 108, 118, 34, '#c0182a', '#f2dfb0', 2);
  ctx.restore(); }
function drawPeri30(T) { const s = E.sbPeri + 1.4, e = E.sbPeri + 4.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, e - 0.25, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.beginPath(); ctx.arc(W / 2, H / 2, H * 0.4, 0, 7); ctx.clip();
  const gr = ctx.createLinearGradient(0, H * 0.1, 0, H * 0.9); gr.addColorStop(0, '#2a8ab0'); gr.addColorStop(1, '#0a3050'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  const r = rng(30); for (let i = 0; i < 30; i++) { const x = W * 0.3 + r() * W * 0.4, y = H - ((r() * H + (T - s) * (60 + r() * 80)) % H); ctx.fillStyle = 'rgba(220,250,255,.6)'; ctx.beginPath(); ctx.arc(x, y, 3 + r() * 6, 0, 7); ctx.fill(); }
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W / 2 - H * 0.4, H / 2); ctx.lineTo(W / 2 + H * 0.4, H / 2); ctx.moveTo(W / 2, H * 0.1); ctx.lineTo(W / 2, H * 0.9); ctx.stroke();
  ctx.restore(); ctx.save(); ctx.globalAlpha = k; outlined('PERISCOPE CAM', W / 2, H * 0.06, 22, '#5ff7ff', '#000', 4); if (T > s + 1) outlined('...water.', W / 2, H * 0.62, 44, '#ffffff', '#000', 7); ctx.restore(); }

// ---------------------------------------------------------------- Ep 31 helpers: Dingus the Bonkhorn, the Stair-O-Matic 3000 (eco mode!), the Summit Bell, snow + cloud bits, the altimeter HUD
const _v31 = new THREE.Vector3();
const wpos31 = o => { o.getWorldPosition(_v31); return [_v31.x, _v31.y, _v31.z]; };
const glow31 = (c, i = 0.7) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const snowM31 = new THREE.MeshLambertMaterial({ color: '#f6fbff', emissive: '#c8dcf0', emissiveIntensity: 0.25 });
const cloudM31 = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#dfe8f0', emissiveIntensity: 0.35, transparent: true, opacity: 0.6, depthWrite: false });
const snowP31 = (t, p, n = 40, sp = 3) => burst(t, p, { n, colors: ['#ffffff', '#e8f4fc', '#cfe4f4'], speed: sp, size: 0.18, life: 1.2, grav: 6, up: 2 });
const poof31 = (t, p) => burst(t, p, { n: 12, colors: ['#ffffff', '#5ff7ff', '#7cff6b'], speed: 1.4, size: 0.1, life: 0.5, grav: 0, up: 0.4 });
const lp31 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const act31 = (t, K, O = [[0, {}]], idle) => act(t, K, O, idle);
// ---- Dingus: a blocky Bonkhorn (mountain goat). curly horns, sideways pupils, unimpressed lids, a red collar. bonks things. eats things.
function makeGoat31() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const wool = new THREE.MeshLambertMaterial({ color: '#efe6d2' }), wool2 = new THREE.MeshLambertMaterial({ color: '#fff8ea' }), hoof = new THREE.MeshLambertMaterial({ color: '#4a3a30' }), horn = new THREE.MeshLambertMaterial({ color: '#7a6450' }), face = new THREE.MeshLambertMaterial({ color: '#d8ccb8' });
  box(1.0, 0.9, 1.6, 0, 0, 1.15, 0, body, wool);
  for (const [x, y, z] of [[0.3, 1.62, 0.3], [-0.25, 1.6, -0.4], [0.05, 1.65, -0.05], [0.42, 1.2, 0.5], [-0.42, 1.25, -0.2]]) box(0.42, 0.3, 0.42, 0, x, y, z, body, wool2);
  const legs = [[-0.3, 0.55], [0.3, 0.55], [-0.3, -0.55], [0.3, -0.55]].map(([x, z]) => { const p = pivot(body, x, 0.75, z); box(0.24, 0.62, 0.24, 0, 0, -0.31, 0, p, wool); box(0.26, 0.16, 0.28, 0, 0, -0.66, 0.02, p, hoof); return p; });
  const tail = pivot(body, 0, 1.45, -0.8); box(0.2, 0.3, 0.2, 0, 0, 0.1, -0.05, tail, wool2);
  box(0.74, 0.14, 0.24, '#c0182a', 0, 1.22, 0.78, body);
  const bellSlot = pivot(body, 0, 1.12, 0.92);
  const hd = pivot(body, 0, 1.55, 0.75);
  box(0.62, 0.6, 0.78, 0, 0, 0.12, 0.3, hd, face); box(0.5, 0.36, 0.34, 0, 0, 0.0, 0.82, hd, face); box(0.3, 0.08, 0.04, '#3a2a2a', 0, 0.08, 1.0, hd);
  const jaw = pivot(hd, 0, -0.15, 0.6); box(0.44, 0.14, 0.4, 0, 0, -0.06, 0.18, jaw, face); box(0.18, 0.36, 0.16, 0, 0, -0.3, 0.2, jaw, wool2);
  const eyeY = new THREE.MeshBasicMaterial({ color: '#ffd23f' }), eyeK = new THREE.MeshBasicMaterial({ color: '#111111' });
  const eyes = [-1, 1].map(sd => { const e = pivot(hd, sd * 0.24, 0.26, 0.7); box(0.2, 0.16, 0.04, 0, 0, 0, 0, e, eyeY); box(0.16, 0.05, 0.05, 0, 0, 0, 0.01, e, eyeK); return e; });
  const lids = [-1, 1].map(sd => box(0.22, 0.08, 0.06, 0, sd * 0.24, 0.32, 0.72, hd, face));
  for (const sd of [-1, 1]) { box(0.36, 0.12, 0.2, 0, sd * 0.44, 0.28, 0.25, hd, face);
    [[0.3, 0.5, 0.15], [0.52, 0.62, -0.08], [0.7, 0.45, -0.3], [0.74, 0.18, -0.2], [0.62, 0.02, 0.04]].forEach(([x, y, z], i) => box(0.24 - i * 0.02, 0.24 - i * 0.02, 0.26, 0, sd * x, y, z, hd, horn)); }
  const hatSlot = pivot(hd, 0, 0.42, 0.25);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, tail, hd, jaw, eyes, lids, bellSlot, hatSlot };
}
function poseGoat31(D, t, p, yaw, o = {}) {
  D.root.visible = true; D.root.position.set(...p); D.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); D.root.scale.setScalar(o.s ?? 1.15);
  const w = o.walk ?? 0; D.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 14 + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0)) * 0.7 * w);
  if (o.tuck) D.legs.forEach((l, i) => l.rotation.x = i < 2 ? -1.0 : 1.0);
  D.body.position.set(0, w ? Math.abs(Math.sin(t * 14)) * 0.08 : 0, 0.45 * (o.bonk ?? 0));
  if (o.happy) D.body.position.y += Math.abs(Math.sin(t * 8)) * 0.22;
  if (o.lie) { D.body.position.y -= 0.55; D.legs.forEach(l => l.rotation.x = 0); D.legs.forEach(l => l.visible = false); } else D.legs.forEach(l => l.visible = true);
  D.tail.rotation.x = Math.sin(t * (o.happy ? 20 : 3)) * (o.happy ? 0.6 : 0.2);
  D.hd.rotation.set(0.9 * (o.bonk ?? 0) + (o.headX || 0), o.headY || 0, o.headR || 0);
  D.jaw.rotation.x = o.baa ? 0.45 : o.chew ? Math.abs(Math.sin(t * 9)) * 0.25 : 0; D.jaw.rotation.z = o.chew ? Math.sin(t * 9) * 0.12 : 0;
  D.lids.forEach(l => { l.visible = !o.wide; l.scale.y = o.sleep ? 2.4 : 1; l.position.y = o.sleep ? 0.27 : 0.32; });
}
const goat31 = makeGoat31();
// ---- the Summit Bell (origin = hang point)
const bell31 = new THREE.Group(); { const gold = new THREE.MeshLambertMaterial({ color: '#ffc83a', emissive: '#a07000', emissiveIntensity: 0.35 });
  box(0.12, 0.12, 0.12, '#8a6a20', 0, 0, 0, bell31); box(0.36, 0.3, 0.36, 0, 0, -0.2, 0, bell31, gold); box(0.5, 0.2, 0.5, 0, 0, -0.42, 0, bell31, gold); box(0.62, 0.08, 0.62, 0, 0, -0.55, 0, bell31, gold); box(0.12, 0.14, 0.12, '#5a4010', 0, -0.64, 0, bell31); }
// ---- the Stair-O-Matic 3000: a backpack that shoots stairs. ECO MODE recycles the ones behind you. (nobody listened.)
const pack31 = new THREE.Group(); { const teal = new THREE.MeshLambertMaterial({ color: '#2ec4b6' });
  box(0.8, 0.86, 0.46, 0, 0, 0, 0, pack31, teal); box(0.84, 0.12, 0.5, '#ffd23f', 0, 0.44, 0, pack31);
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(GEO, MAT.plank); m.scale.setScalar(0.24); m.position.set(-0.22 + i * 0.22, 0.62, 0); pack31.add(m); }
  box(0.44, 0.24, 0.04, 0, 0, 0.12, -0.24, pack31, glow31('#7cff6b', 0.8)); box(0.12, 0.12, 0.05, 0, -0.28, -0.2, -0.24, pack31, glow31('#ff5ca8', 0.8));
  box(0.14, 0.14, 0.9, '#8a8a98', 0.5, 0.5, 0.3, pack31); box(0.26, 0.26, 0.16, '#ff8a2a', 0.5, 0.5, 0.78, pack31);
  plane26(0.72, 0.18, txtMat26(['STAIR-O-MATIC'], 256, 64, '#2ec4b6', '#ffffff', 30), pack31, 0, -0.24, -0.235, PI); }
const handR31 = pivot(hero.aR, 0, -0.72, 0.05);
// ---- Bloop's camera (he wants ONE good summit selfie for his builder portfolio), his tripod, the invoice, a snowball
const bcam31 = new THREE.Group(); box(0.34, 0.24, 0.16, '#2a2a34', 0, 0, 0, bcam31); box(0.14, 0.14, 0.1, '#5ff7ff', 0, 0, 0.12, bcam31); box(0.08, 0.06, 0.06, '#ff5ca8', 0.1, 0.15, 0, bcam31);
bloop6.B.aR.add(bcam31); bcam31.position.set(0, -0.62, 0.22); bcam31.visible = false;
const tripod31 = new THREE.Group(); for (let i = 0; i < 3; i++) { const a = i * 2.1, l = box(0.06, 1.3, 0.06, '#3a3a44', Math.sin(a) * 0.22, 0.6, Math.cos(a) * 0.22, tripod31); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); }
box(0.4, 0.28, 0.22, '#2a2a34', 0, 1.35, 0, tripod31); box(0.16, 0.16, 0.1, '#5ff7ff', 0, 1.35, -0.15, tripod31);
const inv31 = card28(['INVOICE', '1 HARD HAT'], '#ffffff', '#c0182a', 28); bloop6.B.aR.add(inv31); inv31.position.set(0, -0.62, 0.2); inv31.rotation.x = 1.4; inv31.visible = false;
const sball31 = new THREE.Group(); box(0.42, 0.42, 0.42, 0, 0, 0, 0, sball31, snowM31);
function stairPool31(g, n) { const A = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(GEO, MAT.plank); m.castShadow = m.receiveShadow = true; m.visible = false; g.add(m); A.push(m); } return A; }
function showStair31(m, p, k) { m.visible = k > 0.02; m.position.set(...p); m.scale.setScalar(Math.max(0.02, Math.min(1, k))); }
function hide31() { hide30(); [goat31.root, bell31, tripod31, sball31, bcam31, inv31, pack31].forEach(o => o.visible = false); L6.root.rotation.order = 'YXZ'; }
function reset31(g) { [hero.root, bloop6.B.root, L6.root, goat31.root, bell31, tripod31, sball31].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true;
  parentTo(bHat, bloop6.B.hd); bHat.visible = true; bHat.position.set(0, 1.2, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(1); L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5;
  parentTo(pack31, hero.body); pack31.position.set(0, 1.15, -0.5); pack31.rotation.set(0, 0, 0); pack31.visible = true; bell31.scale.setScalar(1); bell31.rotation.set(0, 0, 0); }
function hatOnGoat31() { parentTo(bHat, goat31.hatSlot); bHat.position.set(0, 0.02, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(0.9); }
function bellOnGoat31() { bell31.visible = true; bell31.position.set(...wpos31(goat31.bellSlot)); bell31.scale.setScalar(0.7); bell31.rotation.set(0, goat31.root.rotation.y, 0); }
function bellInHand31(t, swing = 0) { bell31.visible = true; bell31.position.set(...wpos31(handR31)); bell31.scale.setScalar(0.8); bell31.rotation.set(0, 0, Math.sin(t * 16) * swing); }
// ---- HUD: altimeter + stair blocks + eco mode — this episode's mechanic
const ALT31 = [[0, 0], [E.mtCliff, 0], [E.mtSummit, 392], [E.mtSummit + 3, 400], [E.mtDescend, 400], [E.mtBase, 0]];
function drawAlt31(t) { if (t < E.mtReveal + 5 || t >= E.freeze || t >= E.mtBury) return;
  rrect(22, 96, 250, 124, 12); ctx.fillStyle = 'rgba(14,22,40,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2ec4b6'; ctx.stroke();
  const alt = Math.round(lerpK(ALT31, t)), x0 = 40, y0 = 112; outlined('ALTITUDE', x0, y0, 13, '#9ff0e8', '#000', 3, 'left'); outlined(alt + ' m', x0, y0 + 26, 26, '#ffffff', '#000', 5, 'left');
  ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(228, 108, 26, 100); ctx.fillStyle = '#5ff7ff'; const h = 100 * alt / 400; ctx.fillRect(228, 208 - h, 26, h); outlined('▲', 241, 208 - h, 14, '#ff8a2a', '#000', 3);
  outlined('STAIRS: 12', x0, y0 + 58, 15, '#ffe066', '#000', 3, 'left');
  const fl = Math.floor(t * 3) % 2, after = t > E.mtEcoRev + 1;
  outlined(after ? (fl ? 'ECO MODE ♻ (oh no)' : 'ECO MODE ♻') : 'ECO MODE ♻ ON', x0, y0 + 82, 14, after ? '#ff6b5a' : '#7cff6b', '#000', 3, 'left'); }
function drawLegend31(T) { const s = E.mtLegend + 0.8, e = E.mtLegend + 7.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.47 + (1 - k) * 60); ctx.rotate(-0.04);
  ctx.fillStyle = '#f2dfb0'; ctx.fillRect(-210, -160, 420, 320); ctx.strokeStyle = '#a07a40'; ctx.lineWidth = 6; ctx.strokeRect(-210, -160, 420, 320);
  outlined('THE SUMMIT BELL', 0, -122, 30, '#5a2a10', '#f2dfb0', 2);
  ctx.font = F(19, 'normal'); ctx.fillStyle = '#3a2410'; ctx.textAlign = 'center'; ['Ring it atop Mt. Bonkhorn', 'and your name echoes across', 'ALL of Shardwild. Forever.'].forEach((l, i) => { if (T > s + 0.6 + i * 0.8) ctx.fillText(l, 0, -74 + i * 32); });
  ctx.fillStyle = '#8a8c98'; ctx.beginPath(); ctx.moveTo(-150, 140); ctx.lineTo(-40, 30); ctx.lineTo(70, 140); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-72, 62); ctx.lineTo(-40, 30); ctx.lineTo(-8, 62); ctx.fill();
  if (T > s + 2.8) { ctx.fillStyle = '#ffc83a'; ctx.fillRect(100, 60, 50, 44); ctx.fillRect(90, 100, 70, 14); outlined('?', 125, 40, 30, '#c0182a', '#f2dfb0', 2); }
  ctx.restore(); }
function drawPhoto31(T) { for (const [s, cap, ok] of [[E.mtSnap1 + 2.5, 'summit selfie #1', 0], [E.mtSelfie + 3.5, 'summit selfie #3', 1]]) { if (!win(T, s, s + 2.6)) continue;
  const k = ss(seg(T, s, s + 0.2)); ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#fbfbf4'; const m = 34, b = 120; ctx.fillRect(0, 0, W, m); ctx.fillRect(0, 0, m, H); ctx.fillRect(W - m, 0, m, H); ctx.fillRect(0, H - b, W, b);
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.strokeRect(m, m, W - 2 * m, H - m - b);
  ctx.font = F(36, 'normal'); ctx.fillStyle = '#2a2a3a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(cap, m + 20, H - b / 2);
  if (T > s + 0.7) { ctx.save(); ctx.translate(W - 260, H - b / 2); ctx.rotate(-0.1); outlined(ok ? 'PERFECT ✓' : 'GOAT ✗', 0, 0, 40, ok ? '#2bd46a' : '#e8344e', '#fff', 6); ctx.restore(); }
  ctx.restore(); } }
function drawEco31(T) { const s = E.mtEcoRev + 0.5, e = E.mtEcoRev + 5.2; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.3)) * (1 - ss(seg(T, e - 0.3, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H * 0.47 + (1 - k) * 50);
  rrect(-230, -150, 460, 300, 20); ctx.fillStyle = '#1c2a30'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = '#2ec4b6'; ctx.stroke(); rrect(-200, -120, 400, 240, 10); ctx.fillStyle = '#062a14'; ctx.fill();
  outlined('STAIR-O-MATIC 3000', 0, -94, 24, '#7cff6b', '#000', 3);
  const L = [['ECO MODE: ON ♻', '#7cff6b'], ['STAIRS RECYCLED: 412', '#bfffb0'], ['STAIRS LEFT: 12', '#ffe066'], ['DOWN MODE: sold separately', '#ff6b5a']];
  L.forEach(([l, c], i) => { if (T > s + 0.4 + i * 0.7) outlined(l, 0, -44 + i * 42, i === 3 ? 22 : 20, c, '#000', 3); });
  ctx.restore(); }
function drawEcho31(T) { for (const s of [E.mtRing + 6.2, E.mtRingB + 1.0]) { if (!win(T, s, s + 3.4)) continue;
  for (let i = 0; i < 4; i++) { const k = (T - s - i * 0.5) / 2.2; if (k < 0 || k > 1) continue; ctx.strokeStyle = `rgba(255,224,102,${(1 - k) * 0.8})`; ctx.lineWidth = 8 * (1 - k) + 2; ctx.beginPath(); ctx.arc(W / 2, H * 0.4, 60 + k * W * 0.55, 0, 7); ctx.stroke(); } } }
function drawFlash31(T) { if (!win(T, E.mtFlash, E.mtFlash + 4)) return; const k = ss(seg(T, E.mtFlash, E.mtFlash + 0.3)) * (1 - ss(seg(T, E.mtFlash + 3.7, E.mtFlash + 4)));
  ctx.save(); ctx.globalAlpha = k; const g2 = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.8); g2.addColorStop(0, 'rgba(255,240,200,0)'); g2.addColorStop(1, 'rgba(255,240,200,.85)'); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  outlined('FLASHBACK', W * 0.5, H * 0.1, 40, '#ffe066', '#5a3a10', 6); outlined('(2 hours ago)', W * 0.5, H * 0.17, 22, '#ffffff', '#5a3a10', 4); ctx.restore(); }

// ---------------------------------------------------------------- Ep 32 helpers: Chef Crustino, the Crumbandit (+ three kits), the Mega Pizza, Bloop's Hot-Box 9000 (TURBO: do not press), the delivery HUD
const _v32 = new THREE.Vector3();
const wpos32 = o => { o.getWorldPosition(_v32); return [_v32.x, _v32.y, _v32.z]; };
const glow32 = (c, i = 0.7) => new THREE.MeshLambertMaterial({ color: c, emissive: c, emissiveIntensity: i });
const act32 = (t, K, O = [[0, {}]], idle) => act(t, K, O, idle);
const lp32 = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
const crumbs32 = (t, p, n = 14) => burst(t, p, { n, colors: ['#e0a050', '#ffd24a', '#c8402a'], speed: 1.6, size: 0.1, life: 0.7, grav: 6, up: 1.5 });
const steam32 = (t0, t1, pos, dt = 0.14) => smoke(t0, t1, dt, pos, { n: 2, colors: ['#ffffff', '#f4f4f4', '#e0e8f0'], speed: 0.5, size: 0.2, life: 1.2, grav: -1.6, up: 0.8 });
const dust32 = (t, p, n = 30) => burst(t, p, { n, colors: ['#c8a878', '#b08a5a', '#e0c8a0'], speed: 3, size: 0.22, life: 0.9, grav: 3, up: 1 });
const heart32 = (t, p) => burst(t, p, { n: 14, colors: ['#ff5ca8', '#ff9ecb', '#ffffff'], speed: 1.2, size: 0.14, life: 1.1, grav: -1, up: 1.4 });
// Leggy's shared crystal + eye materials (she turns red when it's extra extra spicy)
const cryM32 = (() => { let m = null; L6.body.traverse(o => { if (!m && o.isMesh && o.material && o.material.color && o.material.color.getHexString() === 'ff5cf0') m = o.material; }); return m; })();
const eyeM32 = (() => { let m = null; L6.hd.traverse(o => { if (!m && o.isMesh && o.material && o.material.color && o.material.color.getHexString() === '5ff7ff') m = o.material; }); return m; })();
const cryBack32 = []; L6.body.traverse(o => { if (o.isMesh && cryM32 && o.material === cryM32 && o.position.z < -0.6) cryBack32.push(o); });
const seatH32 = pivot(L6.body, 0, 0.55, 0.95), seatB32 = pivot(L6.body, 0, 0.4, -0.05), backC32 = pivot(L6.body, 0, 0.9, -1.0);
const bib32 = box(0.9, 0.5, 0.04, '#ffffff', 0, -0.35, 0.92, L6.hd); bib32.visible = false;
// ---- the Mega Pizza: eight real wedges (so they can go missing one at a time)
function makePizza32(r = 0.55) {
  const g = new THREE.Group(), slices = [];
  const crust = new THREE.MeshLambertMaterial({ color: '#d9963e' }), cheese = new THREE.MeshLambertMaterial({ color: '#ffd24a', emissive: '#7a4a00', emissiveIntensity: 0.18 }), pep = new THREE.MeshLambertMaterial({ color: '#c8302a' }), basil = new THREE.MeshLambertMaterial({ color: '#3cb04a' });
  for (let i = 0; i < 8; i++) { const s = new THREE.Group(); g.add(s); const a0 = i * PI / 4, am = a0 + PI / 8;
    s.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.08, 2, 1, false, a0, PI / 4), crust));
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r * 0.88, 0.04, 2, 1, false, a0 + 0.02, PI / 4 - 0.04), cheese); ch.position.y = 0.05; s.add(ch);
    const pp = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.13, r * 0.13, 0.03, 8), i % 3 === 2 ? basil : pep); pp.position.set(Math.sin(am) * r * 0.56, 0.08, Math.cos(am) * r * 0.56); s.add(pp);
    s.traverse(o => { if (o.isMesh) o.castShadow = true; }); slices.push(s); }
  return { g, slices };
}
function makeSlice32(r = 0.5) { const P = makePizza32(r); P.slices.slice(1).forEach(s => P.g.remove(s)); const g = new THREE.Group(); P.g.rotation.y = -PI / 8; P.g.position.z = -r * 0.5; g.add(P.g); return g; }
const SLICES32 = t => t < E.pzSlice1 + 1.5 ? 8 : t < E.pzSlice2 + 1.2 ? 7 : t < E.pzReveal + 1.0 ? 6 : t < E.pzGulp + 0.5 ? 5 : 0;
// ---- Bloop's Hot-Box 9000 (origin = bottom centre, front = +z). heat lamp, a fan, and a big red TURBO button (do not press).
const hbox32 = new THREE.Group(); const hb32 = {};
{ const red = new THREE.MeshLambertMaterial({ color: '#d8322e' });
  box(1.3, 0.46, 1.3, 0, 0, 0.23, 0, hbox32, red); box(1.34, 0.08, 1.34, '#ffffff', 0, 0.12, 0, hbox32);
  hb32.lid = pivot(hbox32, 0, 0.46, -0.65); box(1.32, 0.12, 1.32, 0, 0, 0.06, 0.66, hb32.lid, red);
  const lab = plane26(1.0, 0.5, txtMat26(['HOT-BOX', '9000'], 256, 128, '#d8322e', '#ffffff', 44), hb32.lid, 0, 0.125, 0.66); lab.rotation.x = -PI / 2;
  hb32.lamp = box(0.3, 0.16, 0.3, 0, 0.42, 0.2, 1.05, hb32.lid, glow32('#ff9a2a', 0.9));
  hb32.btn = box(0.26, 0.26, 0.1, 0, 0.38, 0.25, 0.69, hbox32, glow32('#ff2a4a', 0.7)); box(0.36, 0.36, 0.06, '#ffd23f', 0.38, 0.25, 0.66, hbox32);
  plane26(0.5, 0.14, txtMat26(['TURBO'], 192, 56, '#ffd23f', '#c0182a', 40), hbox32, -0.22, 0.32, 0.661);
  hb32.fan = pivot(hbox32, -0.3, 0.2, 0.72); box(0.44, 0.07, 0.03, '#d0d0d8', 0, 0, 0, hb32.fan); box(0.07, 0.44, 0.03, '#d0d0d8', 0, 0, 0, hb32.fan);
  hb32.pz = makePizza32(0.55); hb32.pz.g.position.set(0, 0.42, 0); hbox32.add(hb32.pz.g);
  hbox32.traverse(o => { if (o.isMesh) o.castShadow = true; }); }
const megaC32 = makePizza32(0.55);
const dough32 = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 10), new THREE.MeshLambertMaterial({ color: '#f6ead0' })); dough32.castShadow = true;
// ---- Chef Crustino: a blocky tomato with a moustache, a chef hat, and a stopwatch. "thirty minutes or it's FREE."
function makeChef32() {
  const root = new THREE.Group(); const body = pivot(root, 0, 0, 0);
  const tom = new THREE.MeshLambertMaterial({ color: '#e8382e' }), white = new THREE.MeshLambertMaterial({ color: '#ffffff' }), leaf = new THREE.MeshLambertMaterial({ color: '#3cb04a' });
  const legs = [-1, 1].map(s => { const p = pivot(body, s * 0.28, 0.45, 0); box(0.3, 0.45, 0.3, '#3a3a44', 0, -0.22, 0, p); box(0.34, 0.12, 0.4, '#1a1a20', 0, -0.4, 0.05, p); return p; });
  box(1.3, 1.2, 1.1, 0, 0, 1.05, 0, body, tom); box(1.36, 0.3, 1.16, 0, 0, 1.55, 0, body, tom);
  box(1.0, 0.7, 0.04, 0, 0, 0.85, 0.57, body, white); box(0.4, 0.2, 0.02, '#c8302a', 0, 0.8, 0.6, body);
  const pupils = [];
  for (const s of [-1, 1]) { box(0.26, 0.26, 0.04, 0, s * 0.3, 1.42, 0.57, body, white); pupils.push(box(0.11, 0.13, 0.03, '#111111', s * 0.27, 1.4, 0.6, body)); box(0.18, 0.1, 0.02, '#ff8a8a', s * 0.46, 1.16, 0.565, body); }
  const mus = pivot(body, 0, 1.2, 0.6); box(0.86, 0.16, 0.08, '#2a1a10', 0, 0, 0, mus); for (const s of [-1, 1]) box(0.2, 0.2, 0.08, '#2a1a10', s * 0.5, 0.1, 0, mus);
  box(0.3, 0.08, 0.03, '#5a1010', 0, 1.0, 0.565, body);
  box(0.9, 0.1, 0.9, 0, 0, 1.75, 0, body, leaf); for (const [x, z] of [[0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5]]) box(0.3, 0.06, 0.3, 0, x, 1.74, z, body, leaf);
  const hat = pivot(body, 0, 1.8, 0); box(0.82, 0.5, 0.82, 0, 0, 0.25, 0, hat, white); box(1.08, 0.46, 1.08, 0, 0, 0.7, 0, hat, white); box(0.6, 0.2, 0.6, 0, 0, 1.0, 0, hat, white);
  const arm = s => { const p = pivot(body, s * 0.75, 1.35, 0); box(0.22, 0.6, 0.22, 0, 0, -0.28, 0, p, tom); box(0.28, 0.22, 0.28, 0, 0, -0.66, 0, p, white); return p; };
  const aL = arm(-1), aR = arm(1); const handR = pivot(aR, 0, -0.8, 0.12);
  const watch = new THREE.Group(); handR.add(watch); { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 12), new THREE.MeshLambertMaterial({ color: '#f4f4f4' })); m.rotation.x = PI / 2; watch.add(m); box(0.06, 0.12, 0.06, '#ffd23f', 0, 0.24, 0, watch); box(0.03, 0.14, 0.02, '#c0182a', 0, 0.05, 0.05, watch); }
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, legs, aL, aR, mus, hat, handR, watch, pupils };
}
function poseChef32(C, t, p, yaw, o = {}) {
  C.root.visible = true; C.root.position.set(...p); C.root.rotation.set(0, yaw, 0); C.root.scale.setScalar(o.s ?? 1);
  const w = o.walk ?? 0; C.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 13 + i * PI) * 0.8 * w);
  C.body.position.y = (w ? Math.abs(Math.sin(t * 13)) * 0.1 : 0) + (o.hop ? Math.abs(Math.sin(t * 9)) * 0.4 : 0); C.body.rotation.set(o.lean || 0, 0, Math.sin(t * 2) * 0.03);
  C.aL.rotation.set(-Math.sin(t * 13) * 0.6 * w, 0, -0.15); C.aR.rotation.set(Math.sin(t * 13) * 0.6 * w, 0, 0.15);
  C.mus.rotation.z = Math.sin(t * (o.talk ? 14 : 3)) * (o.talk ? 0.12 : 0.04); C.mus.position.y = 1.2 + (o.talk ? Math.abs(Math.sin(t * 12)) * 0.04 : 0);
  if (o.wave) C.aR.rotation.set(-2.8, 0, 0.3 + Math.sin(t * 12) * 0.4);
  if (o.toss) { C.aL.rotation.set(-2.9, 0, -0.2); C.aR.rotation.set(-2.9, 0, 0.2); }
  if (o.point) { C.aR.rotation.set(-1.5, 0, 0); if (o.wag) C.aR.rotation.z = Math.sin(t * 16) * 0.35; }
  if (o.serve) { C.aL.rotation.set(-1.3, 0, 0.2); C.aR.rotation.set(-1.3, 0, -0.2); }
  if (o.angry) { C.aL.rotation.set(-2.6 + Math.sin(t * 18) * 0.4, 0, -0.3); C.aR.rotation.set(-2.6 + Math.cos(t * 18) * 0.4, 0, 0.3); }
  if (o.flail) { C.aL.rotation.set(Math.sin(t * 20) * 1.5 - 1.5, 0, -0.8); C.aR.rotation.set(Math.cos(t * 20) * 1.5 - 1.5, 0, 0.8); C.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 20 + i * PI) * 0.9); }
  if (o.spin) C.root.rotation.z = o.spin;
  C.watch.visible = !!o.watch; C.pupils.forEach(m => m.scale.setScalar(o.wide ? 0.6 : 1));
}
const chef32 = makeChef32();
// ---- the Crumbandit: a masked, stripy-tailed snack thief. warm boxes are his favourite place to nap. (+ three kits)
function makeBandit32() {
  const root = new THREE.Group(); root.rotation.order = 'YXZ'; const body = pivot(root, 0, 0, 0);
  const fur = new THREE.MeshLambertMaterial({ color: '#8a8c98' }), fur2 = new THREE.MeshLambertMaterial({ color: '#d4d6de' }), dark = new THREE.MeshLambertMaterial({ color: '#26262e' });
  const torso = pivot(body, 0, 0.62, 0); box(0.7, 0.55, 1.0, 0, 0, 0, 0, torso, fur); box(0.5, 0.1, 0.8, 0, 0, -0.26, 0.05, torso, fur2);
  const legs = [[-0.22, 0.32], [0.22, 0.32], [-0.22, -0.32], [0.22, -0.32]].map(([x, z]) => { const p = pivot(body, x, 0.4, z); box(0.18, 0.38, 0.18, 0, 0, -0.19, 0, p, dark); return p; });
  const tail = pivot(torso, 0, 0.12, -0.5); for (let i = 0; i < 5; i++) box(0.28 - i * 0.02, 0.28 - i * 0.02, 0.24, 0, 0, 0.06 + i * 0.07, -0.12 - i * 0.21, tail, i % 2 ? dark : fur);
  const hd = pivot(torso, 0, 0.22, 0.48); box(0.62, 0.5, 0.5, 0, 0, 0.12, 0.18, hd, fur); box(0.28, 0.2, 0.26, 0, 0, 0.0, 0.52, hd, fur2); box(0.12, 0.09, 0.06, '#111111', 0, 0.07, 0.66, hd);
  box(0.66, 0.15, 0.05, 0, 0, 0.2, 0.44, hd, dark);
  for (const s of [-1, 1]) { box(0.13, 0.11, 0.03, '#ffffff', s * 0.15, 0.2, 0.47, hd); box(0.06, 0.07, 0.02, '#111111', s * 0.13, 0.2, 0.49, hd); box(0.18, 0.2, 0.08, 0, s * 0.22, 0.45, 0.12, hd, fur); box(0.1, 0.12, 0.02, '#ff9ecb', s * 0.22, 0.44, 0.165, hd); }
  const mouth = pivot(hd, 0, -0.08, 0.66);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { root, body, torso, legs, tail, hd, mouth };
}
function poseBandit32(D, t, p, yaw, o = {}) {
  D.root.visible = true; D.root.position.set(...p); D.root.rotation.set(o.pitch || 0, yaw, o.roll || 0); D.root.scale.setScalar(o.s ?? 1);
  const w = o.walk ?? 0, sp = o.fast ? 22 : 15; D.legs.forEach((l, i) => l.rotation.x = Math.sin(t * sp + (i % 2 ? PI : 0) + (i > 1 ? PI / 2 : 0)) * 0.9 * w);
  D.body.position.y = w ? Math.abs(Math.sin(t * sp)) * 0.1 : 0; D.torso.rotation.set(0, 0, 0); D.torso.position.set(0, 0.62, 0);
  if (o.stand) { D.torso.rotation.x = -1.1; D.torso.position.set(0, 0.85, -0.15); D.legs[0].rotation.x = D.legs[1].rotation.x = -1.2 + Math.sin(t * 8) * 0.2; }
  if (o.hop) D.body.position.y += Math.abs(Math.sin(t * 10 + (o.seed || 0))) * 0.35;
  D.tail.rotation.set(0.35 + Math.sin(t * 6 + (o.seed || 0)) * 0.15, Math.sin(t * 4 + (o.seed || 0)) * 0.35, 0);
  D.hd.rotation.set(o.headX || 0, o.headY ?? Math.sin(t * 2.6 + (o.seed || 0)) * 0.25, o.headR || 0);
  if (o.chew) D.hd.rotation.x += Math.abs(Math.sin(t * 12)) * 0.12;
}
const bandit32 = makeBandit32(); const kits32 = [0, 1, 2].map(() => makeBandit32());
const bSlice32 = makeSlice32(0.5); bandit32.mouth.add(bSlice32); bSlice32.position.set(0, 0, 0.2); bSlice32.rotation.x = 0.2;
const kSlice32 = makeSlice32(0.5); kits32[0].mouth.add(kSlice32); kSlice32.position.set(0, 0, 0.2);
const pile32 = new THREE.Group(); for (let i = 0; i < 3; i++) { const s = makeSlice32(0.5); s.position.set((i - 1) * 0.35, 0.05 + i * 0.09, 0); s.rotation.y = i * 1.3; pile32.add(s); }
// ---- props: Bloop's invoice, Leggy's crystal payment, the coins, the mailbox
const inv32 = card28(['INVOICE', 'HOT-BOX 9000'], '#ffffff', '#c0182a', 26); bloop6.B.aR.add(inv32); inv32.position.set(0, -0.62, 0.2); inv32.rotation.x = 1.4; inv32.visible = false;
const gem32 = new THREE.Group(); box(0.3, 0.5, 0.3, 0, 0, 0, 0, gem32, glow32('#ff5cf0', 0.9)); gem32.children[0].rotation.set(0.4, 0.6, 0.3);
const coins32 = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), glow32('#ffd23f', 0.5)); m.rotation.x = PI / 2; const g = new THREE.Group(); g.add(m); return g; });
const props32 = [hbox32, megaC32.g, dough32, chef32.root, bandit32.root, ...kits32.map(k => k.root), pile32, gem32, ...coins32];
function hide32() { hide31(); props32.forEach(o => o.visible = false); inv32.visible = false; bib32.visible = false; }
function reset32(g) {
  [hero.root, bloop6.B.root, L6.root, ...props32].forEach(o => parentTo(o, g)); bloop6.B.root.visible = L6.root.visible = true; bloop6.B.body.rotation.set(0, 0, 0);
  parentTo(bHat, bloop6.B.hd); bHat.visible = true; bHat.position.set(0, 1.2, 0); bHat.rotation.set(0, 0, 0); bHat.scale.setScalar(1);
  L6.light.color.set('#5ff7ff'); L6.light.intensity = 1.5; L6.root.rotation.set(0, 0, 0); L6.body.scale.setScalar(1); if (cryM32) cryM32.color.set('#ff5cf0'); if (eyeM32) eyeM32.color.set('#5ff7ff');
  hb32.lid.rotation.set(0, 0, 0); hb32.fan.rotation.set(0, 0, 0); hbox32.rotation.set(0, 0, 0); hbox32.scale.setScalar(1); hb32.pz.g.visible = true; hb32.pz.g.scale.setScalar(1); hb32.pz.g.position.set(0, 0.42, 0);
  bSlice32.visible = false; kSlice32.visible = false; hero.body.rotation.set(0, 0, 0); cryBack32.forEach(o => o.visible = true);
}
function slicesShow32(P, n) { P.slices.forEach((s, i) => s.visible = i >= 8 - n); }
function boxOnLeggy32() { cryBack32.forEach(o => o.visible = false); parentTo(hbox32, L6.body); hbox32.visible = true; hbox32.position.set(0, 0.45, -1.0); hbox32.rotation.set(0, 0, 0); }
function boxAt32(g, p, yaw = 0) { parentTo(hbox32, g); hbox32.visible = true; hbox32.position.set(...p); hbox32.rotation.set(0, yaw, 0); }
function ride32(t, o = {}) { const h = wpos32(seatH32), b = wpos32(seatB32), y = L6.root.rotation.y;
  if (!o.noHero) pose(hero, { t, p: h, yaw: y, face: o.face || 'smug', sit: 1, wave: o.wave, panic: o.panic, headYaw: o.headYaw || 0 });
  if (!o.noBloop) poseBurble(bloop6, t, b, y, { hop: o.hop, angry: o.angry }); }
// ---- HUD: the delivery timer, the heat lamp, the slice count — this episode's mechanic
const TK32 = [[E.pzGo, 1800], [E.pzStake, 1100], [E.pzClock, 130], [E.pzEnd, 11], [E.pzKnock + 4, 0]];
function drawDel32(t) { if (t < E.pzGo || t >= E.freeze || t >= E.pzSpicy) return;
  rrect(22, 96, 250, 132, 12); ctx.fillStyle = 'rgba(40,14,10,.82)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff8a2a'; ctx.stroke();
  const x0 = 40, y0 = 112, sec = Math.max(0, Math.ceil(lerpK(TK32, t))), late = sec <= 0, fl = Math.floor(t * 3) % 2;
  outlined('DELIVERY ⏱', x0, y0, 13, '#ffd0a0', '#000', 3, 'left');
  outlined(late ? (fl ? 'LATE!' : '0:00') : Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), x0, y0 + 27, 28, late || sec < 140 ? '#ff6b5a' : '#ffffff', '#000', 5, 'left');
  const n = SLICES32(t); outlined('SLICES', 150, y0, 13, '#ffd0a0', '#000', 3, 'left');
  for (let i = 0; i < 8; i++) { const sx = 152 + (i % 4) * 26, sy = y0 + 18 + Math.floor(i / 4) * 24; ctx.fillStyle = i < n ? '#ffd24a' : 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.moveTo(sx, sy - 9); ctx.lineTo(sx + 18, sy - 9); ctx.lineTo(sx + 9, sy + 10); ctx.closePath(); ctx.fill(); if (i < n) { ctx.fillStyle = '#c8302a'; ctx.fillRect(sx + 7, sy - 5, 4, 4); } }
  const turbo = win(t, E.pzTurbo + 1.2, E.pzEnd); outlined(turbo ? (fl ? 'TURBO!!! ▶▶▶' : 'TURBO!!!') : 'TURBO: do not press', x0, y0 + 64, 14, turbo ? '#ff3d7f' : '#ffe066', '#000', 3, 'left');
  outlined('HEAT', x0, y0 + 90, 12, '#ffd0a0', '#000', 3, 'left'); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(x0 + 44, y0 + 84, 170, 12);
  const heat = turbo ? 1 : clamp(1 - (t - E.pzGo) / 260, 0.35, 1); ctx.fillStyle = turbo && fl ? '#ff3d7f' : '#ff9a2a'; ctx.fillRect(x0 + 44, y0 + 84, 170 * heat, 12); }
function drawOrder32(T) {
  for (const [s, d, mode] of [[E.pzOrder + 0.6, 6.8, 0], [E.pzWho + 0.4, 6, 1], [E.pzSpicy + 0.6, 4.2, 2]]) { const e = s + d; if (!win(T, s, e)) continue; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.27, H * 0.48 + (1 - k) * 60); ctx.rotate(-0.035);
    ctx.fillStyle = '#fffaf0'; ctx.fillRect(-200, -190, 400, 380); ctx.fillStyle = '#c8302a'; ctx.fillRect(-200, -190, 400, 56);
    outlined("CRUSTINO'S", 0, -162, 30, '#ffffff', '#7a1010', 4); ctx.font = F(16, 'normal'); ctx.fillStyle = '#7a6a5a'; ctx.textAlign = 'center'; ctx.fillText('ORDER #32', 0, -116);
    const L = [['1x MEGA PIZZA (8 slices)', '#2a2a3a'], ['EXTRA EXTRA SPICY', '#c8302a'], ['TO: END OF THE LONG ROAD', '#2a2a3a'], ['30 MIN OR IT\'S FREE!', '#c8302a']];
    ctx.font = F(19); ctx.textAlign = 'left'; L.forEach(([l, c], i) => { if (mode || T > s + 0.5 + i * 0.6) { ctx.fillStyle = c; ctx.fillText(l, -176, -78 + i * 40); } });
    ctx.font = F(18, 'normal'); ctx.fillStyle = '#2a2a3a'; ctx.fillText('ordered by:', -176, 104);
    if (mode === 1 && T > s + 1.6) { ctx.save(); ctx.translate(40, 104); ctx.rotate(-0.08); outlined('LEGGY (6 legs)', 20, 0, 26, '#ff5cf0', '#3a0a3a', 4); ctx.restore(); }
    else { ctx.fillStyle = '#c8302a'; ctx.beginPath(); ctx.ellipse(70, 100, 72, 26, 0.2, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(140, 120, 9, 0, 7); ctx.fill(); }
    if (mode === 2 && T > s + 0.6) { ctx.strokeStyle = '#ff2a4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(-60, -42, 150, 26, 0, 0, 7); ctx.stroke(); }
    ctx.restore(); } }
function drawTrial32(T) { const s = E.pzTrial + 0.3, e = E.pzTrial + 7.6; if (!win(T, s, e)) return; const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, e - 0.35, e)));
  ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.28, H * 0.46 + (1 - k) * 60);
  ctx.fillStyle = '#6a3a1a'; ctx.fillRect(-230, -170, 460, 340); ctx.fillStyle = '#8a5228'; ctx.fillRect(-214, -154, 428, 308); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 4; ctx.strokeRect(-214, -154, 428, 308);
  outlined('THE PEOPLE', 0, -118, 28, '#ffe066', '#2a1408', 5); outlined('vs. LEGGY', 0, -80, 34, '#ffffff', '#2a1408', 6);
  const L = [['CHARGE: 2 missing slices', '#ffffff'], ['EVIDENCE: she was LOOKING at it', '#ffd0a0'], ['ALIBI: "......"', '#ffd0a0']];
  L.forEach(([l, c], i) => { if (T > s + 0.8 + i * 0.9) outlined(l, 0, -28 + i * 36, 19, c, '#2a1408', 4); });
  if (T > s + 3.6) { ctx.save(); ctx.translate(0, 112); ctx.rotate(-0.08); const p = backOut(seg(T, s + 3.6, s + 3.9)); ctx.scale(p, p); outlined('OBJECTION!', 0, 0, 44, '#ff3d3d', '#ffffff', 7); ctx.restore(); }
  ctx.fillStyle = '#5a3010'; ctx.save(); ctx.translate(176, -128); ctx.rotate(Math.sin(T * 6) * 0.4); ctx.fillRect(-26, -12, 52, 24); ctx.fillRect(-4, 0, 8, 40); ctx.restore();
  ctx.restore(); }
function drawSpeed32(T) { if (!win(T, E.pzTurbo + 3, E.pzEnd)) return; const k = ss(seg(T, E.pzTurbo + 3, E.pzTurbo + 4)) * (1 - ss(seg(T, E.pzEnd - 0.8, E.pzEnd)));
  ctx.save(); ctx.globalAlpha = k * 0.7; const r = rng(Math.floor(T * 30)); ctx.strokeStyle = '#ffffff';
  for (let i = 0; i < 26; i++) { const a = r() * PI * 2, r0 = H * (0.35 + r() * 0.2), r1 = r0 + H * (0.15 + r() * 0.35); ctx.lineWidth = 2 + r() * 4; ctx.beginPath(); ctx.moveTo(W / 2 + Math.cos(a) * r0 * 1.6, H / 2 + Math.sin(a) * r0); ctx.lineTo(W / 2 + Math.cos(a) * r1 * 1.6, H / 2 + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore(); }

// ================================================================ EPISODE 32: "THE PIZZA RUN (Leggy ate the pizza)" — Crustino's pizzeria at noon (new job; the dough hat; order #32: extra extra spicy, 30 min or it's free, ordered by [sauce stain]; Leggy stares at the pizza; Bloop's Hot-Box 9000, TURBO: do not press) → the Long Road (slices vanish: 7... 6...; THE PEOPLE vs. LEGGY; Bloop's ramp over the broken bridge; the stakeout at sunset: the Crumbandit was IN THE BOX; Leggy is innocent; chase; the den: three hungry kits; Leggy refuses a slice; 2 minutes left: TURBO) → the end of the Long Road at night (nobody answers: LATE; the mailbox says LEGGY; she ordered it; she pays Bloop!; the chef: it's FREE; Leggy eats the pizza. and the box. extra extra spicy. FIRE SNEEZE)
// ---------------------------------------------------------------- set A: Crustino's pizzeria (town square, noon)
const plaza32 = (() => {
  const g = mk('plaza32'); const st = new VSet(g);
  for (let x = -32; x <= 32; x++) for (let z = -30; z <= 30; z++) st.add(x, 0, z, (Math.abs(x) <= 12 && z >= -8 && z <= 12) || (x > 12 && Math.abs(z) <= 1) ? 'path' : 'turf');
  for (let x = -7; x <= 7; x++) for (let y = 1; y <= 6; y++) { if (Math.abs(x) <= 1 && y <= 3) { st.add(x, y, -9, 'dark'); continue; } st.add(x, y, -8, (Math.abs(x) === 4 || Math.abs(x) === 5) && (y === 2 || y === 3) ? 'glass' : 'brick'); }
  for (const x of [-7, 7]) for (let z = -14; z <= -9; z++) for (let y = 1; y <= 6; y++) st.add(x, y, z, 'brick');
  for (let x = -8; x <= 8; x++) for (let z = -15; z <= -8; z++) st.add(x, 7, z, 'slate');
  for (const [x, z, h] of [[-18, -8, 5], [18, -10, 6], [-24, 6, 5], [24, 8, 5], [-16, 20, 6], [16, 22, 5], [-28, -20, 6], [28, -22, 5], [0, 26, 5]]) tree29(st, x, z, h, 0);
  st.build();
  for (const [x, z, w, h, c, r] of [[-17, -18, 8, 6, '#e8d8b0', '#7a3a2a'], [17, -19, 9, 7, '#d8c8f0', '#3a4a7a'], [-22, -2, 6, 5, '#c8e8d0', '#7a3a2a'], [22, -3, 6, 6, '#f0d0c0', '#3a6a4a']]) { box(w, h, w * 0.8, c, x, h / 2 + 0.5, z, g); box(w + 0.6, 0.8, w * 0.8 + 0.6, r, x, h + 0.9, z, g); box(1.2, 2, 0.1, '#5a3a22', x, 1.5, z + w * 0.4 + 0.02, g); }
  for (let i = -7; i <= 7; i++) { const a = box(1, 0.12, 2.3, i % 2 ? '#ffffff' : '#e8382e', i, 4.6, -6.7, g); a.rotation.x = 0.32; }
  board28(["CRUSTINO'S", 'PIZZA  ·  FAST-ISH'], 7, 1.5, g, 0, 6.0, -7.35, 0, '#fff3cf', '#c8302a', 512, 112, 44, false);
  box(5.2, 1.0, 1.2, '#a0603a', 0.4, 1.0, -4.6, g); box(5.4, 0.12, 1.4, '#f4f4f4', 0.4, 1.56, -4.6, g);
  const oven = pivot(g, -5.5, 0.5, -5.6); box(2.4, 2.2, 2.2, '#9a8c80', 0, 1.1, 0, oven); box(1.8, 0.6, 1.8, '#8a7c70', 0, 2.5, 0, oven); box(0.5, 1.4, 0.5, '#6a5c50', 0.5, 3.3, -0.4, oven);
  box(1.0, 0.7, 0.06, 0, 0, 0.9, 1.11, oven, glow32('#ff7a1a', 1)); const ovL = new THREE.PointLight('#ff8a3a', 3, 7, 1.5); ovL.position.set(0, 1, 1.6); oven.add(ovL);
  smoke(0.5, E.pzRoad, 0.5, [-5, 4.4, -6], { n: 2, colors: ['#d0d0d0', '#b0b0b0'], speed: 0.4, size: 0.4, life: 2.5, grav: -0.8, up: 0.8 });
  for (const [x, z] of [[9, 4], [-9.5, 6], [9, 9]]) { box(1.6, 0.12, 1.6, '#ffffff', x, 1.35, z, g); box(0.15, 0.8, 0.15, '#5a5a5a', x, 0.9, z, g); box(0.1, 2.2, 0.1, '#5a5a5a', x, 2.4, z, g); for (let i = 0; i < 4; i++) box(0.75, 0.12, 2.6, i % 2 ? '#ffffff' : '#2ec4b6', x - 1.1 + i * 0.75, 3.5, z, g); }
  box(0.9, 1.2, 0.9, '#5a6a5a', 7.5, 1.1, -5.5, g); box(1.0, 0.14, 1.0, '#4a5a4a', 7.5, 1.77, -5.5, g);
  const DK = [[E.pzToss, 0.4, 2.6, -5.8], [E.pzToss + 1.6, 0.6, 7.2, -4.6], [E.pzToss + 3.2, 1.2, 3.1, -2.2]];
  burst(E.pzBox + 0.5, [-4.2, 2.6, 1.4], { n: 60, colors: ['#ffe066', '#ff5ca8', '#5ff7ff', '#ff3d3d'], speed: 4, size: 0.14, life: 1.4, grav: 4, up: 3 });
  steam32(E.pzOven + 2.2, E.pzBox + 3, [0.4, 1.9, -4.6]); crumbs32(E.pzToss + 3.2, [1.2, 3.0, -2.2], 20);
  for (let i = 0; i < 6; i++) burst(E.pzOven + 2.6 + i * 0.6, [-2.3, 1.5, -1.1], { n: 4, colors: ['#9fe8ff', '#c8f4ff'], speed: 0.3, size: 0.09, life: 0.6, grav: 9, up: 0 });
  dust32(E.pzGo + 2.2, [0, 0.6, 3]);
  const H0 = [1.2, 0.5, -2.2], B0 = [5.4, 0.5, 0.6], L0 = [-3.6, 0.5, 0.6], C0 = [0.4, 0.5, -6.3], CTR = [0.4, 1.65, -4.6];
  const lY = faceTo(L0, [0, 0, -4.6]);
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    // ---- the chef
    const cA = act32(t, [[0, 0, 0.5, -9.4], [E.pzChef, 0, 0.5, -9.4], [E.pzChef + 1.2, ...C0]], [[0, {}], [E.pzChef + 1.2, { wave: true, talk: true }], [E.pzChef + 4, { talk: true }], [E.pzToss, { toss: true }], [E.pzToss + 1.4, { talk: true }],
      [E.pzOrder, { talk: true, point: true }], [E.pzOrder + 4, { talk: true }], [E.pzOven, { serve: true }], [E.pzOven + 3.6, { point: true, wag: true, talk: true }], [E.pzOven + 7, {}], [E.pzBox + 2.6, { serve: true }], [E.pzBox + 4.4, { wave: true }], [E.pzGo, { wave: true, hop: true }]]);
    poseChef32(chef32, t, cA.p, t < E.pzChef + 1.2 ? 0 : faceTo(C0, t >= E.pzOven + 3.6 && t < E.pzOven + 7 ? L0 : H0), cA);
    // ---- the dough: tossed. spun. landed. on my head.
    if (win(t, E.pzToss, E.pzToss + 3.2)) { dough32.visible = true; dough32.position.set(...track(t, DK).p); dough32.rotation.set(0.3, t * 14, 0); }
    // ---- me
    const hA = act32(t, [[0, 2, 0.5, 22], [6.8, ...H0], [E.pzGo, ...H0]], [[0, { face: 'smug', wave: t < 2.5 }], [6.8, { face: 'normal' }], [E.pzChef + 1, { face: 'smug' }], [E.pzToss + 3.2, { face: 'scared' }], [E.pzToss + 5, { face: 'normal' }],
      [E.pzOrder, { face: 'smug' }], [E.pzOven + 2, { face: 'smug' }], [E.pzBox, { face: 'normal' }], [E.pzBox + 5.5, { face: 'scared' }], [E.pzBox + 6.6, { face: 'smug' }]]);
    let hyaw = hA.walk ? hA.yaw : faceTo(H0, C0); if (win(t, E.pzOven + 2.4, E.pzOven + 6)) hyaw = faceTo(H0, L0); if (win(t, E.pzBox, E.pzGo)) hyaw = faceTo(H0, [-4.2, 0, 1.4]);
    // ---- Leggy: stares. at the pizza. the entire time.
    const LK = [[0, -4, 0.5, 28], [9, ...L0], [E.pzOven + 3, ...L0], [E.pzOven + 3.8, -3.0, 0.5, -0.2], [E.pzOven + 5, -3.0, 0.5, -0.2], [E.pzOven + 6, ...L0], [E.pzGo + 1.4, ...L0], [E.pzGo + 2.4, 2, 0.5, 3.5], [E.pzGo + 4, 18, 0.5, 0.5]];
    const lA = walker(t, LK, lY); const lw = lA.speed > 0.05; let ly = lw && !win(t, E.pzOven + 3, E.pzOven + 6) ? lA.yaw : lY; if (t > E.pzGo + 1.4) ly = lA.yaw;
    poseLurk(L6, t, lA.p, ly, lw ? (t > E.pzGo ? 3.5 : 2) : 0.4);
    if (win(t, E.pzOven + 1.5, E.pzBox)) { L6.hd.rotation.set(0.25, Math.sin(t * 0.8) * 0.05, 0); }
    if (win(t, E.pzOven + 5, E.pzOven + 7)) L6.hd.rotation.set(0.1, Math.sin(t * 18) * 0.12, 0);
    if (win(t, E.pzBox + 4.6, E.pzGo + 1)) L6.hd.rotation.set(0, 0.7 + Math.sin(t * 2) * 0.15, 0);
    // ---- the Hot-Box: on Leggy's back (of all places)
    if (t >= E.pzBox + 0.4) { boxOnLeggy32(); const sc = backOut(seg(t, E.pzBox + 0.4, E.pzBox + 0.9)); hbox32.scale.setScalar(Math.max(0.01, sc)); hb32.lid.rotation.x = -1.9 * ss(seg(t, E.pzBox + 1, E.pzBox + 1.6)) * (1 - ss(seg(t, E.pzBox + 5.2, E.pzBox + 5.8))); hb32.pz.g.visible = t > E.pzBox + 4.2; }
    // ---- the Mega Pizza: oven → counter → box
    if (win(t, E.pzOven + 0.6, E.pzBox + 4.2)) { megaC32.g.visible = true; const bp = wpos32(backC32);
      const p = t < E.pzOven + 2 ? arcPath(t, [[E.pzOven + 0.6, -5.5, 1.4, -4.3, 0], [E.pzOven + 2, ...CTR, 1.2]]) : t < E.pzBox + 3.4 ? CTR : arcPath(t, [[E.pzBox + 3.4, ...CTR, 0], [E.pzBox + 4.2, bp[0], bp[1] - 0.4, bp[2], 2]]);
      megaC32.g.position.set(...p); megaC32.g.rotation.set(0, t < E.pzBox + 3.4 ? 0 : t * 6, 0); slicesShow32(megaC32, 8); }
    // ---- me + Bloop: hop on
    if (t < E.pzGo + 0.4) { pose(hero, { t, ...hA, yaw: hyaw }); if (win(t, E.pzToss + 3.2, E.pzOven)) { dough32.visible = true; parentTo(dough32, hero.hatSlot); dough32.position.set(0, 0.7, 0); dough32.rotation.set(0.15, 0, 0.1); dough32.scale.set(1, 1, 1); } else parentTo(dough32, g); }
    else if (t < E.pzGo + 1.3) { const s = wpos32(seatH32); pose(hero, { t, p: arcPath(t, [[E.pzGo + 0.4, ...H0, 0], [E.pzGo + 1.3, ...s, 1.4]]), yaw: hyaw, face: 'smug' }); }
    const bA = act32(t, [[0, 6, 0.5, 24], [8, ...B0], [E.pzBox - 2.4, ...B0], [E.pzBox + 0.4, -1.6, 0.5, 1.6], [E.pzGo, -1.6, 0.5, 1.6]],
      [[0, {}], [E.pzToss + 3.4, { hop: true }], [E.pzToss + 5, {}], [E.pzOven + 3.6, { facepalm: true }], [E.pzOven + 6, {}], [E.pzBox + 0.4, { handOut: true }], [E.pzBox + 0.9, { hop: true }], [E.pzBox + 2.4, { handOut: true }], [E.pzBox + 5.4, { angry: true }], [E.pzBox + 6.8, {}]]);
    if (t < E.pzGo + 0.6) poseBurble(bloop6, t, bA.p, bA.walk ? bA.yaw : faceTo(bA.p, t > E.pzBox ? [-4.2, 0, 1.4] : C0), { walk: bA.walk, phase: bA.phase * 2, ...bA });
    else if (t < E.pzGo + 1.5) { const s = wpos32(seatB32); poseBurble(bloop6, t, arcPath(t, [[E.pzGo + 0.6, -1.6, 0.5, 1.6, 0], [E.pzGo + 1.5, ...s, 1.4]]), ly, {}); }
    if (t >= E.pzGo + 1.3) ride32(t, { noBloop: t < E.pzGo + 1.5, wave: t > E.pzGo + 2, face: 'smug' });
    // ---- a cameo behind the bin (nobody notices. YOU noticed.)
    if (win(t, E.pzOven + 6.2, E.pzOven + 7.9)) { const k = ss(seg(t, E.pzOven + 6.2, E.pzOven + 6.7)) * (1 - ss(seg(t, E.pzOven + 7.4, E.pzOven + 7.9))); poseBandit32(bandit32, t, [7.5 - 0.9 * k, 0.5, -6.4], -0.6, { headY: 0.3 }); }
    const CA = [[0, 10, 8, 26, 0, 3, -6, 55], [7.9, 6, 6, 19, 0, 2.6, -6, 52],
      [8, 1.2, 6.0, 4.5, 0.3, 1.9, -6.3, 46], [15.9, 1.0, 5.6, 3.4, 0.3, 2.0, -6.3, 42],
      [16, 2.6, 0.9, -3.2, 0.6, 4.8, -5.5, 55], [19.9, 3.6, 2.0, 0.2, 1.2, 2.9, -2.2, 52],
      [20, 2.0, 2.9, -3.8, 1.2, 3.2, -2.2, 58], [23.9, 1.9, 2.9, -3.7, 1.2, 3.2, -2.2, 54],
      [24, 3.8, 3.4, 2.0, 0.4, 2.2, -6, 46], [31.9, 3.2, 3.2, 1.0, 0.4, 2.2, -6, 42],
      [32, 6, 4.5, 6, -2, 1.8, -5, 50], [35.9, 5.4, 4.2, 5.2, -2, 1.8, -5, 48],
      [36, -0.4, 2.3, -3.6, -2.2, 1.8, -1.4, 50], [37.9, -0.5, 2.2, -3.4, -2.2, 1.8, -1.4, 46],
      [38, 4, 2.6, 3.5, 4.5, 1.4, -5.5, 50], [39.9, 4.2, 2.5, 3.0, 4.5, 1.4, -5.5, 48],
      [40, -8.8, 4.2, -1.4, -3.8, 2.0, 1.2, 48], [43.9, -8.4, 4.0, -1.0, -3.8, 2.0, 1.2, 46],
      [44, -7.8, 3.6, -0.6, -4.0, 2.2, 1.3, 42], [47.9, -7.6, 3.5, -0.4, -4.0, 2.2, 1.3, 40],
      [48, 6, 7, 18, 0, 1, 0, 55], [52, 9, 6, 15, 8, 1, 0, 55]];
    return { cam: camKeys(t, CA), hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: the Long Road (afternoon → sunset → dusk): the bridge, the stakeout, the den, TURBO
const road32 = (() => {
  const g = mk('road32'); const st = new VSet(g);
  for (let x = -40; x <= 228; x++) for (let z = -18; z <= 18; z++) { if (x >= 24 && x <= 29) { st.add(x, -1, z, 'water'); st.add(x, -2, z, 'sand'); continue; } st.add(x, 0, z, Math.abs(z) <= 1 ? 'path' : 'turf'); }
  for (let x = 22; x <= 31; x++) { if (x >= 25 && x <= 28) continue; for (let z = -1; z <= 1; z++) st.add(x, 1, z, 'plank'); }
  for (const x of [24, 29]) for (const z of [-2, 2]) for (let y = -1; y <= 2; y++) st.add(x, y, z, 'log');
  for (let x = -36; x <= 224; x += 9) for (const sd of [-1, 1]) { const z = sd * (9 + Math.floor(hash2(x, sd, 32) * 7)); if (x > 40 && x < 70 && z < 0) continue; if (x > 40 && x < 58 && z > 0) continue; if (x >= 20 && x <= 32) continue; tree29(st, x, z, 4 + Math.floor(hash2(x, sd + 5, 32) * 3), 0); }
  for (const [x, z, h] of [[55, -6, 5], [64, -17, 6], [53, -15, 5], [68, -11, 5], [46, -12, 6]]) tree29(st, x, z, h, 0);
  st.build();
  for (let i = 0; i < 6; i++) { const b = box(1.6 + (i % 2) * 0.6, 1.1, 1.0, 0, 44 + i * 2, 1.05, 5.5 + (i % 3) * 0.2, g, MAT.leaf); b.castShadow = true; }
  // the den: a hollow log + a nest
  const den = pivot(g, 60, 0.5, -14.2); box(5.4, 0.5, 2.6, 0, 0, 0.25, 0, den, MAT.log[0]); box(5.4, 0.5, 2.6, 0, 0, 2.25, 0, den, MAT.log[0]); box(5.4, 2.5, 0.5, 0, 0, 1.25, -1.05, den, MAT.log[0]); box(0.5, 2.5, 2.6, 0, 2.45, 1.25, 0, den, MAT.log[0]);
  box(2.6, 0.3, 1.6, '#d8b860', -0.6, 0.6, 0.2, den); pile32.position.set(60.6, 1.25, -13.9);
  board28(['SPEED LIMIT:', '6 LEGS'], 2.4, 1.0, g, 118, 2.6, -3.2, 0, '#ffffff', '#c0182a', 384, 160, 44);
  board28(['END OF THE LONG ROAD', '→ 1 km'], 3.6, 1.1, g, 186, 2.6, -3.4, 0, '#f6e7c1', '#5a2a10', 512, 160, 44);
  board28(['BRIDGE: OUT', '(sorry)'], 2.4, 1.0, g, 18, 2.4, -3.0, 0, '#ffe066', '#3a2a10', 384, 160, 44);
  for (let x = -30; x <= 220; x += 13) for (const sd of [-1, 1]) { const f = box(0.3, 0.4, 0.3, ['#ff6fb8', '#ffe066', '#ffffff'][Math.abs(x) % 3], x + sd * 3, 0.7, sd * (3.5 + (x % 4)), g); f.castShadow = false; }
  const RAMP = []; for (const [x, y] of [[21, 1], [22, 2], [23, 3], [24, 4]]) for (let z = -1; z <= 1; z++) { const m = new THREE.Mesh(GEO, MAT.plank); m.castShadow = m.receiveShadow = true; g.add(m); RAMP.push([m, x, y, z]); }
  for (let i = 0; i < 4; i++) burst(E.pzBridge + 2 + i * 0.7, [21 + i, 1 + i, 0], { n: 12, colors: ['#c8955a', '#ffe066'], speed: 1.6, size: 0.12, life: 0.6, grav: 4, up: 1 });
  burst(E.pzJump + 3.6, [30, 1.6, 0], { n: 40, colors: ['#c8955a', '#e0c8a0'], speed: 3, size: 0.16, life: 0.8, grav: 5, up: 2 }); burst(E.pzJump + 2.6, [26.5, -0.2, 0], { n: 30, colors: ['#bfe8ff', '#ffffff'], speed: 2, size: 0.14, life: 0.8, grav: 6, up: 3 });
  crumbs32(E.pzReveal + 3, [48, 1.6, 0.3], 16); heart32(E.pzReveal + 6.4, [51.5, 3.4, 7.2]); heart32(E.pzDen + 1, [60.2, 1.5, -12.2]); heart32(E.pzOffer + 7.5, [60.2, 1.4, -12]);
  dust32(E.pzChase + 3.6, [54.3, 1.2, -5.3], 20); dust32(E.pzTurbo + 3, [49, 0.6, 0], 40);
  burst(E.pzReveal + 0.6, [48, 1.2, 0], { n: 20, colors: ['#ffd24a', '#ffffff'], speed: 1.4, size: 0.1, life: 0.6, grav: 2, up: 1 });
  const LPX = t => 50 + 170 * Math.pow(seg(t, E.pzTurbo + 3, E.pzEnd - 0.6), 1.6);
  smoke(E.pzTurbo + 1.6, E.pzEnd - 0.6, 0.06, t => [LPX(t) - 0.4, 2.6, 0], { n: 2, colors: ['#ffd24a', '#ff9a2a', '#ffffff'], speed: 0.3, size: 0.16, life: 0.5, grav: 0, up: 0.3 });
  smoke(E.pzTurbo + 3, E.pzEnd - 0.6, 0.08, t => [LPX(t) - 2.5, 0.6, 0], { n: 3, colors: ['#c8a878', '#e0c8a0'], speed: 1.6, size: 0.3, life: 0.7, grav: 1, up: 0.6 });
  const LK = [[E.pzRoad, -30, 0.5, 0], [E.pzSmell, -8, 0.5, 0], [E.pzSlice1 - 0.4, 12, 0.5, 0], [E.pzSlice1 + 7.4, 12, 0.5, 0], [E.pzBridge + 1, 18, 0.5, 0], [E.pzJump, 18, 0.5, 0]];
  const LJ = [[E.pzJump, 18, 0.5, 0, 0], [E.pzJump + 0.8, 21, 2.0, 0, 0.2], [E.pzJump + 1.5, 24.4, 5.0, 0, 0.2], [E.pzJump + 3.6, 30.5, 1.5, 0, 3.2], [E.pzJump + 4.4, 33, 0.5, 0, 0.2]];
  const LK2 = [[E.pzJump + 4.4, 33, 0.5, 0], [E.pzSlice2 - 0.4, 40, 0.5, 0], [E.pzStake, 40, 0.5, 0]];
  const SH = [52, 0.5, 9.2], SB = [48.6, 0.5, 7.4], SHE = [46, 0.5, 7.2], BX = [48, 0.5, 0];
  const DH = [57.0, 0.5, -9.0], DB = [55.8, 0.5, -9.8], DL = [63, 0.5, -7], DEN = [60.2, 0.5, -12.6];
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    RAMP.forEach(([m, x, y, z], i) => { const k = backOut(seg(t, E.pzBridge + 2 + Math.floor(i / 3) * 0.7, E.pzBridge + 2.4 + Math.floor(i / 3) * 0.7)); m.visible = k > 0.02; m.position.set(x, y, z); m.scale.setScalar(Math.max(0.02, k)); });
    let cam; const n = SLICES32(t); slicesShow32(hb32.pz, n);
    if (t < E.pzStake) {
      // ---- the ride: Leggy + me + Bloop + the Hot-Box
      let lp, ly = PI / 2, sp = 2.4;
      if (t < E.pzJump) { const w = walker(t, LK, PI / 2); lp = w.p; sp = w.speed > 0.05 ? 3 : 0.4; }
      else if (t < E.pzJump + 4.4) { lp = arcPath(t, LJ); sp = 3; }
      else { const w = walker(t, LK2, PI / 2); lp = w.p; sp = w.speed > 0.05 ? 3 : 0.4; }
      poseLurk(L6, t, lp, ly, sp); boxOnLeggy32();
      if (win(t, E.pzJump + 1.5, E.pzJump + 3.6)) L6.root.rotation.set(0, ly, 0);
      if (win(t, E.pzJump + 0.8, E.pzJump + 1.5)) L6.root.rotation.x = -0.35;
      // Leggy's head keeps turning back to the box. "Leggy. NO."
      const smk = Math.max(ss(seg(t, E.pzSmell + 1, E.pzSmell + 1.6)) * (1 - ss(seg(t, E.pzSmell + 3, E.pzSmell + 3.4))), ss(seg(t, E.pzSmell + 5.4, E.pzSmell + 6)) * (1 - ss(seg(t, E.pzSmell + 6.8, E.pzSmell + 7.2))));
      if (smk > 0) L6.hd.rotation.set(-0.1, 1.2 * smk, 0);
      if (win(t, E.pzSlice1 + 3.4, E.pzSlice1 + 6.6) || win(t, E.pzSlice2 + 2.4, E.pzTrial + 1)) L6.hd.rotation.set(0.15, Math.sin(t * 9) * 0.45, 0);
      if (win(t, E.pzTrial + 1, E.pzStake)) { L6.hd.rotation.set(0.45, 0, 0); L6.light.intensity = 0.6; }
      // the lid: opened twice. counted twice.
      const lidK = Math.max(ss(seg(t, E.pzSlice1 + 1.2, E.pzSlice1 + 1.6)) * (1 - ss(seg(t, E.pzSlice1 + 5.8, E.pzSlice1 + 6.2))), ss(seg(t, E.pzSlice2 + 0.6, E.pzSlice2 + 1.0)) * (1 - ss(seg(t, E.pzSlice2 + 6, E.pzSlice2 + 6.4))));
      hb32.lid.rotation.x = -1.9 * lidK;
      // me: ride / hop off / count / accuse / hop back on
      const off1 = win(t, E.pzSlice1 + 0.3, E.pzSlice1 + 7), off2 = t >= E.pzSlice2 + 0.2;
      if (off1 || off2) { const P = off1 ? [11, 0.5, -2.2] : [39, 0.5, -2.2], s = wpos32(seatH32), t0 = off1 ? E.pzSlice1 + 0.3 : E.pzSlice2 + 0.2;
        let p = P, o = { face: 'normal', yaw: 0 };
        if (t < t0 + 0.8) p = arcPath(t, [[t0, ...s, 0], [t0 + 0.8, ...P, 1]]);
        if (off1 && t > E.pzSlice1 + 6.2) p = arcPath(t, [[E.pzSlice1 + 6.2, ...P, 0], [E.pzSlice1 + 7, ...s, 1.2]]);
        if (t > t0 + 1.7) o = { face: 'scared', yaw: 0 };
        if (t > t0 + 3.2) o = { face: 'normal', yaw: faceTo(P, [lp[0] + 2, 0, lp[2]]), headPitch: 0.1 };
        if (off2 && t > E.pzTrial) o = { face: 'smug', yaw: faceTo(P, [lp[0] + 2, 0, lp[2]]) };
        pose(hero, { t, p, ...o }); if (t > t0 + 3.2 && t < t0 + 6) hero.aR.rotation.set(-1.5, 0, 0); }
      else ride32(t, { noBloop: true, face: win(t, E.pzJump + 1, E.pzJump + 4) ? 'scared' : 'smug', panic: win(t, E.pzJump + 1.2, E.pzJump + 3.8), wave: win(t, E.pzRoad + 1, E.pzRoad + 4) });
      if (win(t, E.pzSmell + 3, E.pzSmell + 5)) { hero.aR.rotation.set(-1.4, 0, 0.3); hero.hd.rotation.y = 0.5; }
      // Bloop: rides. builds a ramp. objects in court.
      const bOff = win(t, E.pzBridge + 1, E.pzBridge + 7.2), bOff2 = t >= E.pzSlice2 + 3;
      if (bOff) { const s = wpos32(seatB32), P = [20.2, 0.5, -2.3]; let p = P;
        if (t < E.pzBridge + 1.8) p = arcPath(t, [[E.pzBridge + 1, ...s, 0], [E.pzBridge + 1.8, ...P, 1]]);
        if (t > E.pzBridge + 6.4) p = arcPath(t, [[E.pzBridge + 6.4, ...P, 0], [E.pzBridge + 7.2, ...s, 1.3]]);
        poseBurble(bloop6, t, p, faceTo(P, [22, 0, 0]), { hop: win(t, E.pzBridge + 2, E.pzBridge + 5), handOut: win(t, E.pzBridge + 2, E.pzBridge + 5) }); }
      else if (bOff2) { const P = [43, 0.5, -2.4], s = wpos32(seatB32); const p = t < E.pzSlice2 + 3.8 ? arcPath(t, [[E.pzSlice2 + 3, ...s, 0], [E.pzSlice2 + 3.8, ...P, 1]]) : P;
        poseBurble(bloop6, t, p, faceTo(P, [36, 0, 0.5]), { angry: win(t, E.pzTrial + 3.6, E.pzTrial + 5.6), hop: win(t, E.pzTrial + 3.6, E.pzTrial + 5.6) }); }
      else poseBurble(bloop6, t, wpos32(seatB32), ly, { angry: win(t, E.pzJump + 1.2, E.pzJump + 3.8) });
      // cameras
      const LP = lp;
      if (t < E.pzSmell) cam = { p: [LP[0] - 3, 3.0, 9], l: [LP[0] + 1, 1.8, 0], fov: 50 };
      else if (t < E.pzSlice1) cam = { p: [LP[0] + 5, 2.8, 2.8 + seg(t, E.pzSmell, E.pzSlice1) * 0.8], l: [LP[0] - 0.5, 2.0, 0], fov: 48 };
      else if (t < E.pzBridge) cam = camKeys(t, [[E.pzSlice1, 11, 2.4, -6.5, 11.4, 1.6, 0, 46], [E.pzSlice1 + 1.9, 11, 2.4, -6.2, 11.4, 1.6, 0, 44],
        [E.pzSlice1 + 2, 11.0, 5.6, -1.2, 11, 2.3, 0, 46], [E.pzSlice1 + 3.9, 11.0, 5.5, -1.1, 11, 2.3, 0, 44],
        [E.pzSlice1 + 4, 17.5, 2.2, 0.8, 13.5, 1.9, 0, 44], [E.pzBridge - 0.1, 17.2, 2.2, 0.8, 13.5, 1.9, 0, 40]]);
      else if (t < E.pzJump) cam = camKeys(t, [[E.pzBridge, 22, 4, 13, 22, 1, 0, 52], [E.pzJump - 0.1, 21, 3.5, 11, 22, 1.4, 0, 50]]);
      else if (t < E.pzJump + 1.5) cam = { p: [14, 1.5, 4.5], l: [24, 3, 0], fov: 55 };
      else if (t < E.pzJump + 3.4) cam = { p: [27.5, 1.5, 9], l: [27.5, 4.5, 0], fov: 60 };
      else if (t < E.pzSlice2) cam = { p: [LP[0] + 5, 2.5, 6], l: [LP[0] - 1, 2, 0], fov: 52 };
      else if (t < E.pzTrial) cam = camKeys(t, [[E.pzSlice2, 39, 2.6, -6.4, 39.4, 1.6, 0, 46], [E.pzSlice2 + 0.9, 39, 2.6, -6.2, 39.4, 1.6, 0, 46], [E.pzSlice2 + 1, 39.0, 5.6, -1.2, 39, 2.3, 0, 46], [E.pzSlice2 + 2.4, 39.0, 5.5, -1.1, 39, 2.3, 0, 44], [E.pzSlice2 + 2.5, 45.5, 2.2, 0.8, 41.5, 1.9, 0, 44], [E.pzTrial - 0.1, 45.2, 2.2, 0.8, 41.5, 1.9, 0, 42]]);
      else cam = camKeys(t, [[E.pzTrial, 45, 2.6, 4.5, 38.5, 1.4, -1, 50], [E.pzStake - 0.1, 44.6, 2.5, 4.0, 38.5, 1.4, -1, 46]]);
    } else if (t < E.pzChase) {
      // ---- the stakeout (sunset). the box on the road. us in the bushes. Leggy's crystals: very visible.
      boxAt32(g, BX, PI / 2); const lidK = ss(seg(t, E.pzReveal + 0.4, E.pzReveal + 0.9)); hb32.lid.rotation.x = -1.6 * lidK;
      const hop = t > E.pzReveal + 3.4, lp = [SH[0], SH[1], SH[2]];
      poseLurk(L6, t, lp, faceTo(SH, BX), hop ? 1.5 : 0.3); if (!hop) { L6.body.position.y = 0.95; L6.hd.rotation.set(0.2, 0, 0); } else { L6.root.position.y += Math.abs(Math.sin(t * 8)) * 0.4; L6.light.intensity = 3; }
      const up = t > E.pzReveal + 2.6;
      pose(hero, { t, p: SHE, yaw: up && t > E.pzReveal + 5 ? faceTo(SHE, SH) : faceTo(SHE, BX), face: up ? (t > E.pzReveal + 5 ? 'smug' : 'scared') : 'normal', sit: up ? 0 : 0.6, headPitch: up ? 0 : 0.15 });
      if (win(t, E.pzReveal + 6, E.pzChase)) hero.aR.rotation.set(-2.2, 0, 0.3);
      poseBurble(bloop6, t, up ? SB : [SB[0], 0.05, SB[2]], faceTo(SB, BX), { hop: win(t, E.pzReveal + 2.6, E.pzReveal + 4), angry: win(t, E.pzReveal + 4, E.pzReveal + 6) });
      // the Crumbandit: in the box. the WHOLE TIME.
      if (t > E.pzReveal + 0.5) { const k = ss(seg(t, E.pzReveal + 0.5, E.pzReveal + 1.2)); poseBandit32(bandit32, t, [BX[0], lerp(0.3, 0.6, k), BX[2]], t < E.pzReveal + 2.6 ? 0.4 * Math.sin(t * 2) : faceTo(BX, SHE), { stand: true, headY: 0, chew: win(t, E.pzReveal + 3, E.pzReveal + 6) }); bSlice32.visible = true; }
      cam = camKeys(t, [[E.pzStake, 47, 1.4, -6, 48, 1.2, 5, 50], [E.pzStake + 3.9, 47.4, 1.3, -5.2, 48, 1.2, 5, 46],
        [E.pzStake + 4, 40.5, 2.8, 9.5, 48, 0.8, 0, 40], [E.pzReveal - 0.1, 41.0, 2.6, 8.8, 48, 0.8, 0, 32],
        [E.pzReveal, 51, 2.0, 4.2, 48, 1.1, 0, 46], [E.pzReveal + 2.9, 50.8, 1.9, 3.8, 48, 1.2, 0, 42],
        [E.pzReveal + 3, 43, 3.2, -5, 50, 1.2, 7.5, 50], [E.pzReveal + 5.4, 43.2, 3.1, -4.6, 50, 1.2, 7.5, 48],
        [E.pzReveal + 5.5, 56, 2.5, 3.5, 50.5, 1.8, 8, 48], [E.pzChase - 0.1, 55.6, 2.5, 3.6, 50.5, 1.8, 8, 46]]);
    } else if (t < E.pzTurbo) {
      // ---- the chase → the den → the kits → Leggy says no → 2 minutes left
      boxAt32(g, BX, PI / 2); hb32.lid.rotation.x = -1.6;
      const BK = [[E.pzChase, 48, 0.6, 0], [E.pzChase + 0.6, 49.5, 0.5, -1.5], [E.pzChase + 2.5, 52.5, 0.5, -4], [E.pzChase + 5, 56.5, 0.5, -8.5], [E.pzChase + 7.4, 59.8, 0.5, -12.0]];
      if (t < E.pzChase + 7.6) { const w = walker(t, BK); poseBandit32(bandit32, t, t < E.pzChase + 0.6 ? arcPath(t, [[E.pzChase, 48, 0.6, 0, 0], [E.pzChase + 0.6, 49.5, 0.5, -1.5, 0.8]]) : w.p, w.yaw, { walk: 1, fast: true }); bSlice32.visible = true; }
      else if (t > E.pzDen + 0.5) { const k = seg(t, E.pzDen + 0.5, E.pzDen + 1.2); poseBandit32(bandit32, t, lp32([59.8, 0.5, -13], [58.4, 0.5, -11.4], k), faceTo([58.4, 0, -11.4], DH), { stand: t > E.pzDen + 1.4, walk: k < 1 ? 1 : 0 }); }
      // the kits
      if (t > E.pzDen) { pile32.visible = true;
        kits32.forEach((K, i) => { const P = [59.2 + i, 0.5, -12.3 + (i === 1 ? 0.3 : 0)]; let p = P, yaw = faceTo(P, DH), o = { s: 0.45, hop: win(t, E.pzDen + 0.8, E.pzDen + 4) || win(t, E.pzOffer + 7, E.pzClock), seed: i * 2 };
          if (i === 0 && win(t, E.pzOffer, E.pzOffer + 7)) { const KK = [[E.pzOffer, ...P], [E.pzOffer + 2, 61.6, 0.5, -9.9], [E.pzOffer + 5.2, 61.6, 0.5, -9.9], [E.pzOffer + 7, ...P]]; const w = walker(t, KK); p = w.p; yaw = w.speed > 0.05 ? w.yaw : faceTo(p, [62.2, 0, -8.8]); o = { s: 0.45, walk: w.speed > 0.05 ? 1 : 0, stand: w.speed <= 0.05, seed: 1 }; kSlice32.visible = t < E.pzOffer + 5.2; }
          poseBandit32(K, t, p, yaw, o); }); }
      // me: chase. BONK. den. aww. panic.
      const HK = [[E.pzChase, ...SHE], [E.pzChase + 1, 48, 0.5, 1.5], [E.pzChase + 3.6, 54.3, 0.5, -5.3], [E.pzChase + 6.2, 54.3, 0.5, -5.3], [E.pzDen - 0.5, ...DH]];
      const hw = walker(t, HK); let hp = t < E.pzChase + 1 ? arcPath(t, [[E.pzChase, ...SHE, 0], [E.pzChase + 1, 48, 0.5, 1.5, 1.6]]) : hw.p, ho = { face: 'scared', yaw: hw.yaw, walk: hw.walk, phase: hw.phase };
      if (win(t, E.pzChase + 3.6, E.pzChase + 5.4)) ho = { face: 'soot', yaw: 0.9, flat: ss(seg(t, E.pzChase + 3.6, E.pzChase + 4.0)), flatDir: -1 };
      if (win(t, E.pzChase + 5.4, E.pzChase + 6.2)) ho = { face: 'scared', yaw: 0.9 };
      if (t >= E.pzDen - 0.5) { ho = { face: 'normal', yaw: faceTo(DH, DEN) }; if (t > E.pzDen + 1) ho.face = 'smug'; if (t > E.pzOffer + 5) ho.face = 'smug'; if (t > E.pzClock) ho = { face: 'scared', yaw: 0.2, panic: true }; }
      pose(hero, { t, p: hp, ...ho });
      const BKK = [[E.pzChase, ...SB], [E.pzChase + 1.5, 50, 0.5, 2], [E.pzChase + 6.5, 53.5, 0.5, -6.5], [E.pzDen, ...DB]]; const bw = walker(t, BKK);
      poseBurble(bloop6, t, t < E.pzChase + 1.5 ? arcPath(t, [[E.pzChase, ...SB, 0], [E.pzChase + 1.5, 50, 0.5, 2, 1.6]]) : bw.p, bw.speed > 0.05 ? bw.yaw : faceTo(DB, DEN), { walk: bw.speed > 0.05, phase: bw.phase * 2, hop: win(t, E.pzDen + 1, E.pzDen + 3), angry: win(t, E.pzClock + 0.5, E.pzTurbo), handOut: win(t, E.pzClock + 3, E.pzTurbo) });
      const LKK = [[E.pzChase, ...SH], [E.pzChase + 1.5, 52, 0.5, 2], [E.pzChase + 5.5, 57.5, 0.5, -3.0], [E.pzDen - 0.5, ...DL]]; const lw = walker(t, LKK);
      poseLurk(L6, t, t < E.pzChase + 1.5 ? arcPath(t, [[E.pzChase, ...SH, 0], [E.pzChase + 1.5, 52, 0.5, 2, 1.4]]) : lw.p, lw.speed > 0.05 ? lw.yaw : faceTo(DL, DEN), lw.speed > 0.05 ? 3 : 0.4);
      if (win(t, E.pzOffer + 2, E.pzOffer + 5)) { L6.hd.rotation.set(0.45 * ss(seg(t, E.pzOffer + 2, E.pzOffer + 3.5)), Math.sin(t * 30) * 0.05, 0); L6.legs.forEach((l, i) => l.rotation.x = Math.sin(t * 40 + i) * 0.12); }
      if (win(t, E.pzOffer + 5, E.pzOffer + 7.5)) L6.hd.rotation.set(-0.3, 1.0 * ss(seg(t, E.pzOffer + 5, E.pzOffer + 5.3)), 0);
      const hpc = hp;
      if (t < E.pzDen) cam = { p: [hpc[0] + 1, 7, hpc[2] + 7], l: [hpc[0] + 2, 0.5, hpc[2] - 3], fov: 55 };
      else cam = camKeys(t, [[E.pzDen, 60, 3.2, -3, 60, 1, -12, 50], [E.pzDen + 3.9, 60, 3.0, -3.6, 60, 1, -12, 48],
        [E.pzDen + 4, 60.6, 1.5, -8.8, 60.0, 0.8, -12.4, 46], [E.pzOffer - 0.1, 60.6, 1.4, -9.3, 60.0, 0.8, -12.4, 42],
        [E.pzOffer, 57.8, 2.0, -5.8, 61.6, 1.0, -9.6, 46], [E.pzOffer + 4.9, 58.0, 2.0, -6.2, 61.6, 1.1, -9.6, 42],
        [E.pzOffer + 5, 61.0, 2.2, -11.4, 62.6, 1.8, -7.6, 48], [E.pzClock - 0.1, 60.8, 2.2, -11.6, 62.4, 1.8, -7.6, 44],
        [E.pzClock, 57, 2.4, -3.8, 57.5, 1.6, -9, 46], [E.pzTurbo - 0.1, 57, 2.2, -4.6, 57.5, 1.6, -9, 40]]);
    } else {
      // ---- TURBO. (the fan blows pizza smell in front of Leggy's nose. she follows it. at 200 km/h.)
      const lp = [LPX(t), 0.5, 0]; poseLurk(L6, t, lp, PI / 2, t > E.pzTurbo + 3 ? 9 : 0.4); boxOnLeggy32();
      if (t > E.pzTurbo + 1.2) { hb32.fan.rotation.z = t * 40; L6.light.intensity = 4; L6.hd.rotation.set(-0.1, 0, 0); }
      if (t > E.pzTurbo + 2) L6.root.rotation.x = 0.18;
      ride32(t, { face: t > E.pzTurbo + 1.2 ? 'scared' : 'smug', panic: t > E.pzTurbo + 4, noBloop: true });
      if (win(t, E.pzTurbo + 0.5, E.pzTurbo + 1.4)) { hero.aR.rotation.set(-0.6, 0, 0); hero.hd.rotation.y = 1.6; }
      const bs = wpos32(seatB32); poseBurble(bloop6, t, bs, PI / 2, { angry: t > E.pzTurbo + 3 }); if (t > E.pzTurbo + 3.4) { bloop6.B.body.rotation.set(-0.3, 0, Math.sin(t * 20) * 0.08); bHat.visible = t < E.pzTurbo + 4.2; }
      if (t < E.pzTurbo + 3) cam = { p: [52, 4.2, -5.5], l: [49.6, 2.3, 0], fov: 44 };
      else if (t < E.pzZoom) cam = { p: [lp[0] - 9, 2.4, 5.5], l: [lp[0] + 2, 1.8, 0], fov: 62 };
      else if (t < E.pzZoom + 5) cam = { p: [lp[0] + 14, 1.2, 3.5], l: [lp[0], 1.8, 0], fov: 50 };
      else cam = { p: [196, 1.0, 3.5], l: [Math.min(lp[0], 194), 1.6, 0], fov: 55 };
    }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set C: the end of the Long Road (night): a cave, a mailbox, a table set for one
const cave32 = (() => {
  const g = mk('cave32'); const st = new VSet(g);
  for (let x = -30; x <= 60; x++) for (let z = -26; z <= 20; z++) st.add(x, 0, z, (z >= 0 && z <= 3 && x > 4) ? 'path' : 'turf');
  for (let x = -14; x <= 14; x++) for (let z = -24; z <= -9; z++) { const h = Math.floor(9 - Math.abs(x) * 0.42 - Math.max(0, -z - 16) * 0.6 + hash2(x, z, 32) * 1.5); for (let y = 1; y <= h; y++) { if (Math.abs(x) <= 1 && y <= 3 && z >= -12) continue; st.add(x, y, z, 'stone'); } }
  for (let x = -1; x <= 1; x++) for (let y = 1; y <= 3; y++) st.add(x, y, -13, 'dark');
  for (const [x, z, h] of [[-20, -4, 5], [18, -8, 6], [-24, 10, 5], [22, 12, 5], [-12, 14, 6], [30, -14, 5], [40, 10, 5]]) tree29(st, x, z, h, 0);
  st.build();
  const cryL = new THREE.PointLight('#ff5cf0', 0, 10, 1.6); cryL.position.set(0, 2.2, -10.5); g.add(cryL);
  for (const [x, y, z, r] of [[-2.4, 1.3, -8.6, 0.3], [2.5, 1.0, -8.5, -0.4], [-3.2, 3.6, -8.7, 0.6], [3.0, 4.2, -8.8, -0.2], [0.2, 5.0, -8.9, 0.1], [0, 1.2, -11.5, 0.5], [-0.8, 3.2, -12.4, -0.3]]) { const c = box(0.4, 0.9, 0.4, 0, x, y, z, g, glow32('#ff5cf0', 0.9)); c.rotation.set(0.2, 0, r); }
  const door = pivot(g, 0, 0.5, -8.4); { const m = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.5, 12), MAT.stone); m.rotation.x = PI / 2; m.position.y = 1.7; m.castShadow = true; door.add(m); }
  const mail = pivot(g, -3.8, 0.5, -6.0); box(0.15, 1.3, 0.15, '#5a3a22', 0, 0.65, 0, mail); box(0.6, 0.5, 0.9, '#2e6ac4', 0, 1.5, 0, mail); plane26(0.56, 0.2, txtMat26(['LEGGY'], 256, 96, '#ffffff', '#c0182a', 60), mail, 0, 1.5, 0.46);
  board28(['END OF THE', 'LONG ROAD'], 2.6, 1.1, g, 9, 2.4, -3.6, -0.3, '#f6e7c1', '#5a2a10', 384, 160, 50);
  const table = pivot(g, 0, 0.5, -2.8); box(2.4, 0.12, 1.6, '#c8955a', 0, 0.9, 0, table); box(2.5, 0.04, 1.7, '#ff5c5c', 0, 0.97, 0, table); for (const [x, z] of [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]]) box(0.12, 0.85, 0.12, '#8a5a2b', x, 0.42, z, table);
  const candle = pivot(table, -0.85, 1.0, -0.3); box(0.12, 0.3, 0.12, '#ffffff', 0, 0.15, 0, candle); const flame = box(0.1, 0.14, 0.1, 0, 0, 0.38, 0, candle, glow32('#ffb03a', 1)); const cL = new THREE.PointLight('#ffb050', 2.4, 7, 1.5); cL.position.set(0, 0.6, 0.3); candle.add(cL);
  const moonL = new THREE.PointLight('#9fb4ff', 1.5, 40, 1); moonL.position.set(0, 12, 10); g.add(moonL);
  dust32(E.pzEnd + 1.2, [8, 0.6, 1.2], 50); dust32(E.pzEnd + 1.6, [6.5, 0.6, 1.2], 30);
  burst(E.pzPay + 2.6, [1.6, 1.8, -4.2], { n: 40, colors: ['#ff5cf0', '#ffe066', '#ffffff'], speed: 2.4, size: 0.12, life: 1.2, grav: 2, up: 2 }); heart32(E.pzPay + 4, [1.6, 2.4, -4.2]);
  steam32(E.pzDinner + 1, E.pzGulp, [0, 1.9, -2.8]); crumbs32(E.pzGulp + 0.9, [0, 1.9, -3.9], 24); crumbs32(E.pzGulp + 3.6, [0, 1.9, -3.9], 20);
  for (let i = 0; i < 4; i++) burst(E.pzBlast + i * 0.12, [0, 3.2, 0.8], { n: 70, colors: ['#ff3d1a', '#ff9a2a', '#ffe066', '#ffffff'], speed: 9, size: 0.3, life: 1.4, grav: -1, up: 6 });
  smoke(E.pzBlast + 0.3, E.freeze + 0.2, 0.05, [0, 3.4, 0.9], { n: 4, colors: ['#ff3d1a', '#ff9a2a', '#ffe066'], speed: 2.4, size: 0.34, life: 0.9, grav: -6, up: 8 });
  // Leggy's path at the end of the road: skid in, nod, open the door, sit at her table, eat, ... run in circles
  const LT = [0, 0.5, -6.2], LA = [7.5, 0.5, 1.5], CC = [0, 0.5, 1.5];
  const LKc = [[E.pzEnd, 44, 0.5, 1.5], [E.pzEnd + 1.6, ...LA], [E.pzHers, ...LA], [E.pzHers + 1.5, 4.5, 0.5, -5.2], [E.pzHers + 3.0, 0.4, 0.5, -6.6], [E.pzHers + 4.4, ...LT]];
  function L32(t) { if (t < E.pzSteam) return LT; if (t < E.pzBlast) { const a = (t - E.pzSteam) * 1.4 - PI / 2; const r = 7.5 * ss(seg(t, E.pzSteam, E.pzSteam + 1.2)); return [CC[0] + Math.cos(a) * r * (t < E.pzSteam + 1.2 ? 0 : 1), 0.5, (t < E.pzSteam + 1.2 ? lerp(LT[2], CC[2] - 7.5, ss(seg(t, E.pzSteam, E.pzSteam + 1.2))) : CC[2] + Math.sin(a) * r)]; } return [0, 0.5, -1.0]; }
  steam32(E.pzSpicy + 3, E.pzBlast, t => [L32(t)[0] + Math.sin(t) * 0.3, 3.0, L32(t)[2]], 0.08);
  const H1 = [-3.4, 0.5, 0.8], B1 = [3.0, 0.5, 1.0], C1 = [4.6, 0.5, 2.2], BP = [1.6, 0.5, -4.2];
  function update(t) {
    hideMisc(); hide32(); reset32(g);
    flame.scale.set(1, 1 + Math.sin(t * 17) * 0.3, 1); cL.intensity = 2.2 + Math.sin(t * 13) * 0.4;
    const dk = ss(seg(t, E.pzHers + 1.5, E.pzHers + 3)); door.position.set(dk * 3.6, 0.5, -8.4); door.rotation.z = 0; door.children[0].rotation.set(PI / 2, -dk * 2, 0); cryL.intensity = 3 * dk;
    mail.rotation.set(0, 0, t > E.pzSteam + 3.5 ? -1.45 * ss(seg(t, E.pzSteam + 3.5, E.pzSteam + 4)) : 0);
    table.visible = t < E.pzSteam + 1.0 || t > 1e9; if (t >= E.pzSteam + 0.6 && t < E.pzSteam + 1.0) table.rotation.z = (t - E.pzSteam - 0.6) * 4;
    else table.rotation.z = 0;
    // ---- Leggy
    let lp, ly, sp = 0.4;
    if (t < E.pzSteam) { const w = walker(t, LKc); lp = w.p; ly = w.speed > 0.05 ? w.yaw : (t < E.pzHers ? (t > E.pzWho + 2 ? faceTo(LA, [1.0, 0, -4]) : -PI / 2) : 0); sp = w.speed > 0.05 ? 2.4 : 0.4; if (t < E.pzEnd + 1.6) { ly = -PI / 2; sp = 6; } }
    else { lp = L32(t); const d = 0.05; const q = L32(t + d); ly = t < E.pzBlast ? Math.atan2(q[0] - lp[0], q[2] - lp[2]) : 0; sp = t < E.pzBlast ? 9 : 0.4; }
    poseLurk(L6, t, lp, ly, sp);
    if (t < E.pzEnd + 1.6) L6.root.rotation.z = -0.15 * (1 - seg(t, E.pzEnd + 1.0, E.pzEnd + 1.6));
    if (win(t, E.pzWho + 4.8, E.pzWho + 7.5)) L6.hd.rotation.set(Math.abs(Math.sin(t * 7)) * 0.4, 0, 0);
    if (t >= E.pzHers + 4.4 && t < E.pzSteam) { L6.body.position.y = 1.0; bib32.visible = t > E.pzHers + 6; }
    if (win(t, E.pzFree + 4, E.pzDinner)) L6.root.position.y += Math.abs(Math.sin(t * 7)) * 0.25;
    if (win(t, E.pzGulp + 0.6, E.pzGulp + 2.8)) L6.body.scale.set(1.25, 1.25, 1.12);
    if (win(t, E.pzGulp + 3.4, E.pzGulp + 5)) L6.body.scale.set(1.2, 1.3, 1.1);
    const spicy = t >= E.pzSpicy + 1.6, rk = ss(seg(t, E.pzSpicy + 1.6, E.pzSpicy + 3));
    if (spicy) { if (cryM32) cryM32.color.set('#' + new THREE.Color('#ff5cf0').lerp(new THREE.Color('#ff2a10'), rk).getHexString()); if (eyeM32) eyeM32.color.set('#' + new THREE.Color('#5ff7ff').lerp(new THREE.Color('#ff3020'), rk).getHexString()); L6.light.color.set('#ff4020'); L6.light.intensity = 2 + rk * 3; }
    if (win(t, E.pzSpicy + 3, E.pzSteam)) { L6.root.position.x += Math.sin(t * 60) * 0.06; L6.hd.rotation.set(0, Math.sin(t * 30) * 0.15, 0); }
    if (t >= E.pzBlast) { L6.root.rotation.x = -0.55 * ss(seg(t, E.pzBlast - 0.3, E.pzBlast + 0.1)); L6.hd.rotation.set(-0.3, 0, 0); }
    // ---- the Hot-Box: on her back → on the table → (gulp)
    if (t < E.pzHers + 5) boxOnLeggy32();
    else if (t < E.pzGulp + 3) { const TB = [0, 1.47, -2.8]; if (t < E.pzHers + 6) { const s = wpos32(backC32); boxAt32(g, arcPath(t, [[E.pzHers + 5, s[0], s[1] - 0.45, s[2], 0], [E.pzHers + 6, ...TB, 1.6]]), PI / 2); } else boxAt32(g, TB, PI / 2);
      hb32.lid.rotation.x = -1.9 * ss(seg(t, E.pzDinner + 0.5, E.pzDinner + 1.1));
      if (t > E.pzGulp + 0.4) { const k = seg(t, E.pzGulp + 0.4, E.pzGulp + 0.9); hb32.pz.g.position.set(k * 1.1, 0.42 + k * 0.6, 0); hb32.pz.g.scale.setScalar(Math.max(0.01, 1 - k)); hb32.pz.g.rotation.y = k * 6; }
      if (t > E.pzGulp + 3 - 0.6) { const k = seg(t, E.pzGulp + 2.4, E.pzGulp + 3); hbox32.position.set(0, 1.47 + k * 0.5, -2.8 - k * 1.1); hbox32.scale.setScalar(Math.max(0.01, 1 - k)); hbox32.rotation.set(k * 3, 0, 0); } }
    // ---- me
    const HK = [[E.pzEnd + 2.4, ...wpos32(seatH32)], [E.pzEnd + 3.2, 4.5, 0.5, -0.5], [E.pzKnock - 1, 0.3, 0.5, -7.2], [E.pzKnock + 4, 0.3, 0.5, -7.2], [E.pzWho - 0.4, -2.8, 0.5, -4.6], [E.pzWho + 3.2, -2.8, 0.5, -4.6], [E.pzWho + 5, ...H1]];
    if (t < E.pzEnd + 2.4) ride32(t, { face: 'scared', panic: t < E.pzEnd + 1.6, noBloop: true });
    else if (t < E.pzBlast + 0.3) { const w = walker(t, HK.slice(1)); let p = t < E.pzEnd + 3.2 ? arcPath(t, [[E.pzEnd + 2.4, ...wpos32(seatH32), 0], [E.pzEnd + 3.2, 4.5, 0.5, -0.5, 1]]) : w.p, o = { face: 'normal', yaw: w.speed > 0.05 ? w.yaw : 0, walk: w.walk, phase: w.phase };
      if (win(t, E.pzKnock - 1, E.pzKnock + 4)) { o = { face: 'smug', yaw: PI }; if (t > E.pzKnock) o.swing = (t - E.pzKnock) * 1.6; if (t > E.pzKnock + 3) o.face = 'normal'; }
      if (win(t, E.pzWho - 0.4, E.pzHers)) { o = { face: t > E.pzWho + 2.6 ? 'scared' : 'normal', yaw: t > E.pzWho + 2.6 ? faceTo(p, LA) : faceTo(p, [-3.8, 0, -6.0]) }; }
      if (t >= E.pzHers) { o = { face: t < E.pzHers + 4 ? 'scared' : 'normal', yaw: faceTo(H1, [0, 0, -3.5]) };
        if (win(t, E.pzChef2 + 1, E.pzFree)) o = { face: 'scared', yaw: faceTo(H1, C1) };
        if (win(t, E.pzFree, E.pzDinner)) o = { face: 'scared', yaw: faceTo(H1, C1), hold: true };
        if (t >= E.pzGulp + 1) o = { face: 'scared', yaw: faceTo(H1, [0, 0, -3.5]) };
        if (t >= E.pzSpicy + 3) o = { face: 'scared', yaw: faceTo(H1, lp), panic: true }; }
      pose(hero, { t, p, ...o }); }
    else { const k = ss(seg(t, E.pzBlast + 0.3, E.freeze)), pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); pose(hero, { t, p: [lerp(H1[0], -9, pk), lerp(0.5, 9.5, pk), lerp(H1[2], 4, pk)], yaw: 0.4, face: 'scared', panic: true, spin: k * 5 }); hero.body.rotation.z = k * 2; }
    // ---- Bloop: gets PAID. by Leggy.
    const BKc = [[E.pzEnd + 2.6, 6.0, 0.5, 4.2], [E.pzHers, 6.0, 0.5, 4.2], [E.pzHers + 3, ...B1], [E.pzPay, ...B1], [E.pzPay + 1.6, ...BP], [E.pzPay + 8.5, ...BP], [E.pzChef2 + 1, ...B1]];
    if (t < E.pzEnd + 2.6) { const s = wpos32(seatB32); if (t < E.pzEnd + 1.8) poseBurble(bloop6, t, s, ly, { angry: true }); else poseBurble(bloop6, t, arcPath(t, [[E.pzEnd + 1.8, ...s, 0], [E.pzEnd + 2.6, 6.0, 0.5, 4.2, 1]]), ly, {}); }
    else if (t < E.pzBlast + 0.3) { const w = walker(t, BKc); let o = { walk: w.speed > 0.05, phase: w.phase * 2 }, yaw = w.speed > 0.05 ? w.yaw : faceTo(w.p, [0, 0, -3.5]);
      if (win(t, E.pzPay + 1.6, E.pzPay + 8.5)) { yaw = faceTo(BP, [0, 0, -4.4]); o.handOut = t < E.pzPay + 3.6; o.hop = t > E.pzPay + 3.6; }
      if (win(t, E.pzWho + 2.6, E.pzHers)) yaw = faceTo(w.p, LA);
      if (t >= E.pzSpicy + 3) o.angry = true;
      poseBurble(bloop6, t, w.p, yaw, o); inv32.visible = win(t, E.pzPay + 1.2, E.pzPay + 3.0);
      if (t > E.pzPay + 3.0 && t < E.pzBlast) { gem32.visible = true; parentTo(gem32, g); const hp = wpos32(bloop6.B.aR); gem32.position.set(hp[0], hp[1] - 0.6, hp[2]); gem32.rotation.y = t * 2; }
      if (win(t, E.pzPay + 2.2, E.pzPay + 3.0)) { gem32.visible = true; const hp = wpos32(bloop6.B.aR); gem32.position.set(...arcPath(t, [[E.pzPay + 2.2, 0, 2.6, -6.8, 0], [E.pzPay + 3.0, hp[0], hp[1] - 0.6, hp[2], 1.2]])); } }
    else { const pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); poseBurble(bloop6, t, [lerp(B1[0], 8, pk), lerp(0.5, 10, pk), lerp(B1[2], 3, pk)], -0.5, { angry: true }); bloop6.B.root.rotation.z = -pk * 2.5; bHat.position.y = 1.2 + pk * 1.2; }
    // ---- Chef Crustino: arrives with a stopwatch. "LATE. IT IS FREE."
    if (t >= E.pzChef2) { if (t < E.pzBlast + 0.3) { const cA = act32(t, [[E.pzChef2, 30, 0.5, 3], [E.pzChef2 + 3.4, ...C1]], [[E.pzChef2, { watch: true }], [E.pzChef2 + 3.4, { watch: true, point: true, talk: true }], [E.pzFree, { watch: true, angry: true, talk: true }], [E.pzFree + 2, { serve: true }], [E.pzFree + 4, { talk: true }], [E.pzGulp + 1, { wide: true }], [E.pzSpicy + 3, { flail: true, wide: true }]]);
        poseChef32(chef32, t, cA.p, cA.walk ? cA.yaw : faceTo(C1, t > E.pzGulp ? [0, 0, -3.5] : H1), { ...cA, walk: cA.walk ? 1.4 : (cA.flail ? 0 : 0) }); }
      else { const pk = 1 - Math.pow(1 - seg(t, E.pzBlast + 0.3, E.freeze), 2); poseChef32(chef32, t, [lerp(C1[0], 12, pk), lerp(0.5, 7, pk), lerp(C1[2], 5, pk)], -0.8, { flail: true, wide: true, spin: -pk * 1.6 }); chef32.hat.position.y = 1.8 + pk * 1.5; } }
    else chef32.hat.position.y = 1.8;
    if (t < E.pzBlast + 0.3) chef32.hat.position.y = 1.8;
    // ---- coins: me → chef (it's FREE. for HER.)
    coins32.forEach((c, i) => { const s = E.pzFree + 1.2 + i * 0.3; if (!win(t, s, s + 0.9)) return; c.visible = true; c.position.set(...arcPath(t, [[s, H1[0] + 0.5, 1.9, H1[2] + 0.3, 0], [s + 0.9, C1[0] - 0.5, 1.6, C1[2], 1.6]])); c.rotation.y = t * 9; });
    // ---- cameras
    const CC2 = [[E.pzEnd, 8, 2.2, 9, 6, 1.4, 0, 52], [E.pzEnd + 2.9, 8.5, 2.2, 8, 6, 1.4, 0, 50],
      [E.pzEnd + 3, 10, 5, 14, 0, 2, -6, 50], [E.pzKnock - 0.1, 9, 4.6, 12.5, 0, 2, -6, 48],
      [E.pzKnock, 3.4, 2.8, -2.8, 0, 1.9, -8.6, 50], [E.pzKnock + 3.9, 3.2, 2.7, -3.2, 0, 1.9, -8.6, 46],
      [E.pzKnock + 4, -4, 3, 6, 0, 1.6, -6, 50], [E.pzWho - 0.1, -3.6, 3, 5, 0, 1.6, -6, 48],
      [E.pzWho, -4.4, 2.1, -3.9, -3.8, 1.95, -6.0, 40], [E.pzWho + 2.9, -4.3, 2.1, -4.3, -3.8, 1.95, -6.0, 34],
      [E.pzWho + 3, -3.6, 2.5, -6.4, 7.5, 1.8, 1.5, 44], [E.pzHers - 0.1, -3.4, 2.4, -6.0, 7.5, 1.8, 1.5, 40],
      [E.pzHers, -6, 4.2, 9, 2, 1.5, -4, 50], [E.pzHers + 3.9, -5.4, 3.8, 8.2, 2, 1.5, -4, 48],
      [E.pzHers + 4, 0, 2.6, 4.2, 0, 1.8, -4, 46], [E.pzPay - 0.1, 0, 2.5, 3.6, 0, 1.8, -4, 44],
      [E.pzPay, 3.8, 2.5, -1.2, 0.8, 1.8, -4.6, 44], [E.pzPay + 3.9, 3.6, 2.4, -1.4, 0.8, 1.8, -4.6, 42],
      [E.pzPay + 4, 3.6, 2.4, 0.4, 1.6, 1.5, -4.2, 46], [E.pzChef2 - 0.1, 3.6, 2.3, 0.1, 1.6, 1.5, -4.2, 42],
      [E.pzChef2, 6, 3.4, 12, 8, 1.5, 1, 55], [E.pzChef2 + 3.4, 5, 3.2, 11, 5, 1.5, 1.5, 52],
      [E.pzChef2 + 3.5, 2.0, 2.6, 7.5, 4.6, 2.0, 2.2, 46], [E.pzFree - 0.1, 2.2, 2.6, 7.0, 4.6, 2.0, 2.2, 42],
      [E.pzFree, 0.5, 2.6, 7.5, 0.8, 1.6, 1.6, 56], [E.pzFree + 3.9, 0.5, 2.6, 7.2, 0.8, 1.6, 1.6, 54],
      [E.pzFree + 4, 0, 2.2, 1.6, 0, 1.8, -4, 44], [E.pzDinner - 0.1, 0, 2.2, 1.4, 0, 1.8, -4, 42],
      [E.pzDinner, 0, 2.9, 2.4, 0, 1.8, -3.8, 44], [E.pzGulp - 0.1, 0, 2.7, 0.6, 0, 1.8, -3.8, 38],
      [E.pzGulp, 3.4, 2.6, 0.6, 0, 1.8, -3.6, 46], [E.pzGulp + 3.9, 3.2, 2.6, 0.4, 0, 1.8, -3.6, 44],
      [E.pzGulp + 4, 0, 2.8, 6.5, 0, 1.6, -2.5, 52], [E.pzSpicy - 0.1, 0, 2.7, 6.0, 0, 1.6, -2.5, 50],
      [E.pzSpicy, 0, 2.0, -0.6, 0, 1.9, -4.0, 44], [E.pzSpicy + 4.9, 0, 2.0, -1.0, 0, 1.9, -4.0, 38],
      [E.pzSpicy + 5, 0, 3.8, 9, 0, 1.6, -3, 52], [E.pzSteam - 0.1, 0, 3.6, 8.4, 0, 1.6, -3, 50],
      [E.pzSteam, 0, 11, 17, 0, 0.5, 0, 55], [E.pzSteam + 5.9, 2, 10, 16, 0, 0.5, 0, 55]];
    let cam = camKeys(t, CC2);
    if (win(t, E.pzSteam + 6, E.pzBlast)) cam = { p: [0, 1.6, 3.0], l: [lp[0], 1.6, lp[2]], fov: 60 };
    if (t >= E.pzBlast) cam = { p: [0, 3.0, 20 + ss(seg(t, E.pzBlast, E.freeze)) * 2], l: [0, 4.6, -1], fov: 58 };
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
  const pzNoon = { top: '#4aa8ff', bot: '#e0f4ff', sunI: 2.7, hemiI: 1.55, fog: '#d8f0ff', sunEl: 1.0, sunAz: 0.4, near: 70, far: 240 };
  const pzAft = { top: '#5aa0f0', bot: '#ffe8c0', sunI: 2.4, hemiI: 1.45, fog: '#f0e0c8', sunEl: 0.45, sunAz: 1.6, near: 70, far: 260 };
  const pzSet = { top: '#5a4ab0', bot: '#ff9a60', sunI: 2.0, hemiI: 1.35, fog: '#f0a080', sunEl: 0.12, sunAz: 1.7, near: 60, far: 240 };
  const pzDusk = { top: '#2a2a70', bot: '#c86a8a', sunI: 1.3, hemiI: 1.2, fog: '#8a5a8a', sunEl: 0.03, sunAz: 1.7, near: 50, far: 220 };
  const pzNight = { top: '#0a1236', bot: '#2a3a7a', sunI: 0.85, hemiI: 1.15, fog: '#1c2a5a', sunEl: -0.3, sunAz: 1.7, near: 40, far: 170 };
  const pzFire = { top: '#3a1a30', bot: '#ff7a3a', sunI: 1.4, hemiI: 1.5, fog: '#8a3a3a', sunEl: -0.3, sunAz: 1.7, near: 40, far: 170 };
  if (t < E.pzRoad) return pzNoon;
  if (t < E.pzStake) return pzAft;
  if (t < E.pzTurbo) return pzSet;
  if (t < E.pzEnd) return mix(pzSet, pzDusk, seg(t, E.pzTurbo + 2, E.pzEnd));
  if (t < E.pzBlast) return pzNight; return mix(pzNight, pzFire, seg(t, E.pzBlast, E.pzBlast + 0.6));
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
  const hpv = t < E.pzSlice1 + 1.5 ? 5 : t < E.pzReveal + 3 ? 4 : t < E.pzChase + 3.6 ? 5 : t < E.pzFree ? 4 : t < E.pzBlast ? 3 : 1;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (win(t, E.pzChase + 3.6, E.pzChase + 5) || win(t, E.pzClock, E.pzClock + 3) || win(t, E.pzFree, E.pzFree + 2) || win(t, E.pzSpicy + 3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = t >= E.pzEnd;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined(t < E.pzEnd ? '☀ DAY 33' : '☾ NIGHT 33', W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['pizza32', win(t, E.pzBox + 4.2, E.pzGulp + 0.5) ? SLICES32(t) : 0], ['crown', 1], ['mallet', 1], ['box32', win(t, E.pzBox + 5, E.pzGulp + 3) ? 1 : 0], ['slip32', t > E.pzOrder + 7 ? 1 : 0], ['coin32', t < E.pzFree + 2 ? 12 : 0], ['fish', 0]];
  let sel = 0;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // delivery timer + slices + heat — this episode's mechanic
  drawDel32(t);

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
ICON.pizza32 = (x, y, s) => { ctx.fillStyle = '#d9963e'; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y - s * 0.7); ctx.lineTo(x + s * 0.8, y - s * 0.7); ctx.lineTo(x, y + s * 0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.45); ctx.lineTo(x + s * 0.6, y - s * 0.45); ctx.lineTo(x, y + s * 0.7); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c8302a'; ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 0.25, s * 0.25); ctx.fillRect(x + s * 0.05, y, s * 0.25, s * 0.25); };
ICON.box32 = (x, y, s) => isoCube(x, y, s, '#ff6b5a', '#d8322e', '#a01a1a');
ICON.slip32 = (x, y, s) => { ctx.fillStyle = '#fffaf0'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c8302a'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 0.35); ctx.fillStyle = '#2a2a3a'; for (let i = 0; i < 3; i++) ctx.fillRect(x - s * 0.4, y - s * 0.2 + i * s * 0.3, s * 0.8, s * 0.1); };
ICON.coin32 = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0, 7); ctx.fill(); ctx.fillStyle = '#e0a800'; ctx.fillRect(x - s * 0.12, y - s * 0.4, s * 0.24, s * 0.8); };
















const TOASTS = [[E.pzOrder + 7.6, 'Got: Order #32', 'slip32'], [E.pzBox + 6, 'Got: Hot-Box 9000', 'box32'], [E.pzSlice1 + 2.6, '-1 Slice (?)', 'pizza32'], [E.pzSlice2 + 2, '-1 Slice (again)', 'pizza32'], [E.pzFree + 2.4, '-12 Coins', 'coin32']];
const FEATS = [[E.pzToss + 5.4, 'Dough Head', 'Catch a pizza with your face'], [E.pzJump + 4.6, 'Air Mail', 'Jump a river. Keep the pizza.'], [E.pzReveal + 7, 'Wrong Suspect', 'Accuse the innocent'], [E.pzOffer + 7.6, 'Willpower of Steel', 'Leggy said no to pizza'], [E.pzPay + 6.5, 'PAID?!', 'Bloop got paid. By Leggy.']];
const POPS = [[E.pzArrive + 2, 1.8, "CRUSTINO'S!", 0.5, 0.3, '#ff6b5a', 90], [E.pzChef + 1.3, 1.6, 'BENVENUTO!', 0.55, 0.25, '#ffe066', 80], [E.pzChef + 4.5, 1.8, 'you are HIRED', 0.55, 0.3, '#ffffff', 64],
  [E.pzToss + 0.4, 1.2, 'toss!', 0.5, 0.25, '#ffffff', 80], [E.pzToss + 1.6, 1.2, 'spin spin spin', 0.55, 0.2, '#ffe066', 56], [E.pzToss + 3.2, 1.2, 'SPLAT', 0.5, 0.35, '#f6ead0', 120], [E.pzToss + 5.2, 1.8, 'dough hat (+0 armor)', 0.55, 0.62, '#ffffff', 46],
  [E.pzOrder + 0.2, 1.6, 'ORDER #32', 0.62, 0.22, '#ff6b5a', 70],
  [E.pzOven + 1, 1.6, 'MEGA PIZZA', 0.55, 0.22, '#ffd24a', 90], [E.pzOven + 2.6, 1.4, '*drool*', 0.32, 0.45, '#9fe8ff', 60], [E.pzOven + 4.0, 1.8, '"she is LOOKING at it"', 0.6, 0.25, '#ffffff', 48], [E.pzOven + 6.6, 1.2, '...', 0.78, 0.45, '#ffffff', 70],
  [E.pzBox + 0.6, 1.6, 'TA-DAA!', 0.55, 0.25, '#ff5ca8', 110], [E.pzBox + 2, 2, 'HOT-BOX 9000', 0.55, 0.2, '#ff6b5a', 70], [E.pzBox + 5.5, 2, 'TURBO: DO NOT PRESS', 0.55, 0.3, '#ff3d3d', 56], [E.pzBox + 6.8, 1.2, 'ok ok', 0.4, 0.4, '#ffffff', 60],
  [E.pzGo + 0.4, 1.6, 'GO GO GO', 0.5, 0.25, '#ffe066', 100], [E.pzGo + 2.2, 1.4, '30:00', 0.5, 0.35, '#ffffff', 90], [E.pzRoad + 1, 1.8, 'THE LONG ROAD', 0.5, 0.2, '#ffffff', 80],
  [E.pzSmell + 1.4, 1.2, '*sniff*', 0.6, 0.35, '#9fe8ff', 70], [E.pzSmell + 3.0, 1.4, 'LEGGY. NO.', 0.45, 0.25, '#ff6b5a', 90], [E.pzSmell + 5.8, 1.2, '*sniff sniff*', 0.6, 0.35, '#9fe8ff', 60], [E.pzSmell + 6.8, 1.2, 'NO.', 0.45, 0.25, '#ff6b5a', 100],
  [E.pzSlice1 + 1.6, 1.0, 'quick check...', 0.5, 0.25, '#ffffff', 60], [E.pzSlice1 + 2.4, 1.6, '7?!', 0.5, 0.4, '#ff3d3d', 130], [E.pzSlice1 + 4.4, 1.6, '*stare*', 0.4, 0.25, '#ffffff', 70], [E.pzSlice1 + 5.4, 1.4, '*innocent face*', 0.62, 0.62, '#5ff7ff', 48],
  [E.pzBridge + 0.5, 1.6, 'BRIDGE: OUT', 0.5, 0.22, '#ffe066', 90], [E.pzBridge + 2.2, 1.4, 'Bloop: on it.', 0.5, 0.3, '#ff9ecb', 60], [E.pzBridge + 4.5, 1.4, 'RAMP!', 0.55, 0.25, '#7cff6b', 100],
  [E.pzJump + 1.6, 1.6, 'WHEEEE', 0.5, 0.2, '#ffe066', 110], [E.pzJump + 2.8, 1.2, '(slow-mo)', 0.7, 0.62, '#ffffff', 44], [E.pzJump + 3.7, 1.2, 'THUD', 0.5, 0.4, '#ffffff', 120],
  [E.pzSlice2 + 1.2, 1.6, '6?!?!', 0.5, 0.4, '#ff3d3d', 130], [E.pzSlice2 + 2.8, 1.2, 'LEGGY.', 0.6, 0.25, '#ff6b5a', 90],
  [E.pzTrial + 3.9, 1.2, 'bang bang', 0.72, 0.3, '#ffe066', 56], [E.pzTrial + 6.0, 1.6, 'verdict: ...pending', 0.72, 0.62, '#ffffff', 44],
  [E.pzStake + 0.5, 1.8, 'THE STAKEOUT', 0.5, 0.2, '#ffe066', 80], [E.pzStake + 3, 1.6, "Leggy. you're showing.", 0.6, 0.62, '#ffffff', 44], [E.pzStake + 6, 1.2, 'shhh', 0.42, 0.4, '#ffffff', 60],
  [E.pzReveal + 0.5, 1.2, '*creak*', 0.55, 0.35, '#ffffff', 70], [E.pzReveal + 1.4, 1.4, '!!!', 0.5, 0.25, '#ffe066', 120], [E.pzReveal + 2.8, 2, 'HE WAS IN THE BOX', 0.5, 0.22, '#ff6b5a', 70], [E.pzReveal + 4.2, 1.2, '*munch*', 0.62, 0.4, '#ffffff', 64], [E.pzReveal + 6.2, 1.6, 'sorry Leggy!!', 0.55, 0.25, '#ff9ecb', 70],
  [E.pzChase + 0.8, 1.6, 'GET HIM!', 0.5, 0.22, '#ff6b5a', 100], [E.pzChase + 3.6, 1.2, 'BONK', 0.45, 0.35, '#ffe066', 140], [E.pzChase + 5.2, 1.4, '...tree.', 0.5, 0.45, '#ffffff', 60],
  [E.pzDen + 1, 1.8, 'aww.', 0.5, 0.25, '#ff9ecb', 100], [E.pzDen + 4.6, 1.8, 'three kits', 0.5, 0.25, '#ffffff', 64], [E.pzDen + 7, 1.4, '*tiny munch*', 0.55, 0.62, '#ffffff', 48],
  [E.pzOffer + 2.4, 1.6, 'for you?', 0.4, 0.35, '#ffffff', 60], [E.pzOffer + 3.4, 1.4, '*trembling*', 0.62, 0.3, '#5ff7ff', 52], [E.pzOffer + 5.2, 1.6, 'NO.', 0.5, 0.3, '#5ff7ff', 120], [E.pzOffer + 6.6, 1.6, 'she said NO', 0.55, 0.25, '#ffe066', 70],
  [E.pzClock + 0.4, 1.8, '2:00 LEFT?!', 0.5, 0.25, '#ff3d3d', 100], [E.pzClock + 3.2, 1.6, 'the TURBO...', 0.55, 0.3, '#ffe066', 64],
  [E.pzTurbo + 0.8, 1.0, '*click*', 0.5, 0.35, '#ffffff', 80], [E.pzTurbo + 1.6, 1.4, '*SNIFF*', 0.6, 0.3, '#9fe8ff', 110], [E.pzTurbo + 3.0, 2, 'ZOOOOM', 0.5, 0.22, '#ffe066', 130], [E.pzTurbo + 6, 1.6, 'AAAAA', 0.6, 0.3, '#ffffff', 90], [E.pzZoom + 1, 1.8, 'SPEED LIMIT: 6 LEGS', 0.55, 0.25, '#ffffff', 52], [E.pzZoom + 7.6, 1.2, 'WHOOSH', 0.5, 0.3, '#ffffff', 110],
  [E.pzEnd + 1.2, 1.6, 'SKRRRT', 0.5, 0.3, '#ffffff', 110], [E.pzEnd + 3.5, 1.6, 'MADE IT!', 0.5, 0.22, '#7cff6b', 100],
  [E.pzKnock + 0.3, 1.0, 'knock', 0.4, 0.3, '#ffffff', 70], [E.pzKnock + 1.0, 1.0, 'knock', 0.5, 0.26, '#ffffff', 70], [E.pzKnock + 1.6, 1.4, 'PIZZA!', 0.6, 0.22, '#ffe066', 90], [E.pzKnock + 3.6, 1.2, '...', 0.5, 0.35, '#ffffff', 90], [E.pzKnock + 5, 1.8, 'LATE?!', 0.5, 0.3, '#ff3d3d', 120],
  [E.pzWho + 3.2, 1.6, '...LEGGY?', 0.6, 0.25, '#5ff7ff', 90], [E.pzWho + 5.2, 1.4, '*nod nod*', 0.62, 0.38, '#5ff7ff', 64],
  [E.pzHers + 1.6, 1.4, '*rumble*', 0.5, 0.3, '#ffffff', 60], [E.pzHers + 3, 2, 'SHE LIVES HERE', 0.5, 0.22, '#ff5cf0', 80], [E.pzHers + 6.2, 1.6, '*napkin*', 0.5, 0.6, '#ffffff', 60],
  [E.pzPay + 1.6, 1.4, '*invoice*', 0.55, 0.3, '#ffffff', 70], [E.pzPay + 3.1, 1.6, '*PAID*', 0.6, 0.25, '#7cff6b', 110], [E.pzPay + 5, 1.8, 'BLOOP GOT PAID', 0.5, 0.22, '#ffe066', 80],
  [E.pzChef2 + 0.6, 1.6, 'CHEF?!', 0.5, 0.25, '#ff6b5a', 90], [E.pzChef2 + 4.2, 2, '30 MIN + 1 SEC', 0.6, 0.25, '#ff3d3d', 70], [E.pzFree + 0.4, 2, "IT'S FREE!", 0.6, 0.22, '#ffe066', 110], [E.pzFree + 2.2, 1.4, '-12 coins', 0.3, 0.45, '#ff6b5a', 64], [E.pzFree + 5, 1.6, 'free pizza for HER', 0.5, 0.25, '#5ff7ff', 60],
  [E.pzDinner + 1.4, 1.4, '*steam*', 0.5, 0.3, '#ffffff', 60], [E.pzDinner + 4.5, 1.6, 'so polite...', 0.5, 0.25, '#ff9ecb', 60],
  [E.pzGulp + 0.5, 1.4, 'GULP', 0.5, 0.3, '#ffe066', 150], [E.pzGulp + 2.0, 0.8, '...', 0.5, 0.4, '#ffffff', 80], [E.pzGulp + 2.9, 1.4, 'GULP', 0.5, 0.3, '#ffe066', 130], [E.pzGulp + 4.4, 1.8, 'the BOX too?!', 0.5, 0.25, '#ffffff', 70],
  [E.pzSpicy + 1.0, 1.4, '...', 0.5, 0.25, '#ffffff', 90], [E.pzSpicy + 2.6, 1.8, 'uh oh', 0.5, 0.25, '#ff6b5a', 90], [E.pzSpicy + 6, 1.8, 'EXTRA EXTRA SPICY', 0.5, 0.2, '#ff3d1a', 70],
  [E.pzSteam + 0.6, 1.6, 'WHEEEEEE', 0.5, 0.2, '#ff6b5a', 100], [E.pzSteam + 4, 1.4, '(the mailbox)', 0.62, 0.3, '#ffffff', 56], [E.pzSteam + 6.5, 1.6, 'RUN!!', 0.5, 0.3, '#ff3d3d', 120], [E.pzSteam + 9.5, 1.6, '*kettle noises*', 0.55, 0.25, '#ffffff', 52],
  [E.pzBlast + 0.2, 2, 'FWOOOOSH', 0.5, 0.25, '#ffe066', 140], [E.pzBlast + 3.5, 1.8, 'FIRE SNEEZE', 0.5, 0.75, '#ff6b5a', 80]];

const ZOOMS = [[E.pzToss + 3.1, 0.8, 1.15, 0.5, 0.4], [E.pzSlice1 + 2.3, 1.0, 1.15, 0.5, 0.5], [E.pzSlice2 + 1.1, 1.0, 1.15, 0.5, 0.5], [E.pzReveal + 1.3, 1.0, 1.15, 0.5, 0.45], [E.pzChase + 3.5, 0.8, 1.15, 0.5, 0.45], [E.pzOffer + 5.1, 1.0, 1.12, 0.5, 0.4], [E.pzKnock + 4.9, 1.0, 1.12, 0.5, 0.4], [E.pzFree + 0.3, 1.0, 1.12, 0.5, 0.4], [E.pzGulp + 0.4, 0.8, 1.15, 0.5, 0.45], [E.pzGulp + 2.8, 0.8, 1.18, 0.5, 0.45]];
const SHAKES = [[E.pzToss + 3.2, 0.5, 0.2], [E.pzJump + 3.6, 0.8, 0.35], [E.pzChase + 3.6, 0.6, 0.3], [E.pzTurbo + 3, E.pzEnd - E.pzTurbo - 3.4, 0.12], [E.pzEnd + 0.8, 1.0, 0.25], [E.pzGulp + 0.6, 0.4, 0.15], [E.pzSpicy + 3, E.pzSteam - E.pzSpicy - 3, 0.1], [E.pzSteam, E.pzBlast - E.pzSteam, 0.18], [E.pzBlast, 3, 0.5]];
const FLASH = [[E.pzRoad - 0.6, 1.2, '0,0,0'], [E.pzStake - 0.6, 1.2, '0,0,0'], [E.pzTurbo - 0.5, 1.0, '0,0,0'], [E.pzEnd - 0.6, 1.2, '0,0,0'], [E.pzBlast, 0.3, '255,170,80']];
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
    outlined('EPISODE 32', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE PIZZA RUN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy ate the pizza)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 33: THE ROBOT' : 'EP 31: THE MOUNTAIN', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? "(it wants Bloop's job)" : '(we forgot the way down)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.pzRoad, plaza32, 'plaza32'], [E.pzRoad, E.pzEnd, road32, 'road32'], [E.pzEnd, 1e9, cave32, 'cave32']];
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
  else if (res.cabin) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 40; scene.fog.far = 100; hemi.intensity = 0.8; hemi.color.set('#ffb08a'); hemi.groundColor.set('#402018'); sun.intensity = 0; }
  else if (cave) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 30; scene.fog.far = 90; hemi.intensity = 0.5; hemi.color.set('#6a5aff'); hemi.groundColor.set('#201030'); sun.intensity = 0; }
  else { setSky(S.top, S.bot); scene.fog.color.set(S.fog); scene.fog.near = S.near; scene.fog.far = S.far; hemi.intensity = S.hemiI; hemi.color.set('#d6eeff'); hemi.groundColor.set('#6a7a4a'); sun.intensity = S.sunI; }
  const c = res.cam; const sh = shakeOffset(T);
  camera.position.set(c.p[0] + sh[0], c.p[1] + sh[1], c.p[2] + sh[2]); camera.lookAt(c.l[0] + sh[0] * 0.5, c.l[1] + sh[1] * 0.5, c.l[2]); camera.fov = c.fov; camera.updateProjectionMatrix();
  // sun & moons
  const night = t >= E.pzEnd;
  const sv = placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunMesh); placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunGlow, 385);
  sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05;
  moonA.visible = moonB.visible = !cave && night;
  placeSky(-2.85, 0.5, moonA); placeSky(-2.6, 0.38, moonB);
  const tc = camera.position;
  if (night) { sun.position.set(tc.x - 30, 60, tc.z - 30); sun.color.set('#9fb4ff'); } else { sun.position.set(tc.x + sv.x * 80, Math.max(20, sv.y * 80), tc.z + sv.z * 80); sun.color.set(win(t, E.pzStake, E.pzEnd) ? '#ffb070' : '#fff1d6'); }
  const focus = hero.root.position; sun.position.x = focus.x + (sun.position.x - tc.x); sun.position.z = focus.z + (sun.position.z - tc.z); sun.target.position.copy(focus);
  clouds.visible = !cave && !res.space && !res.under && !res.cabin; clouds.children.forEach((cl, i) => { const b = cl.userData.base; const x = ((b[0] + t * 1.5 - tc.x + 200) % 400 + 400) % 400 - 200 + tc.x; cl.position.set(x, b[1], ((b[2] - tc.z + 200) % 400 + 400) % 400 - 200 + tc.z); });
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
  const panic = win(T, E.pzSlice1 + 2.2, E.pzSlice1 + 3.4) || win(T, E.pzClock, E.pzClock + 3) || win(T, E.pzKnock + 4.5, E.pzKnock + 6.5) || win(T, E.pzSpicy + 3, E.pzBlast + 2);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, 9999, 9999)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    stamp(T, E.pzOrder + 7.6, 'NEW JOB: PIZZA DELIVERY');
    stamp(T, E.pzSlice1 + 6.4, 'SUSPECT: LEGGY');
    stamp(T, E.pzReveal + 4.6, 'LEGGY: INNOCENT');
    stamp(T, E.pzWho + 6.6, 'CUSTOMER: LEGGY?!');
    stamp(T, E.pzFree + 2.8, "IT'S FREE (FOR HER)");
    drawOrder32(T); drawTrial32(T); drawSpeed32(T);
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. she ate it.', 0, 0, 56, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("(and the box.)", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(extra extra spicy.)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = 0;
      ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#0b0820'; ctx.fillRect(0, 0, W, H);
      const words = ['several', 'freezing', 'hours', 'later...']; words.forEach((w, i) => { ctx.save(); ctx.translate(W / 2, H / 2 - 60 + i * 52); ctx.rotate(Math.sin(T * 3 + i) * 0.04); outlined(w, 0, 0, 52, ['#ff5cf0', '#ffe066', '#5ff7ff', '#ffffff'][i], '#000', 8); ctx.restore(); });
      ctx.restore(); }
    drawCaption(T);
    if (T > 3) { drawFacecam(T); drawRivalCam(T); }
  } else drawLogo(T);
  drawPrev(T);
  return out.toDataURL('image/jpeg', 0.9);
};
window.prof = (t, n) => { const a = performance.now(); for (let i = 0; i < n; i++) window.renderAt(t + i / 24); const b = performance.now(); for (let i = 0; i < n; i++) { renderer.render(scene, camera); renderer.getContext().finish(); } const c = performance.now(); return [(b - a) / n, (c - b) / n]; };
window.ready = true;
