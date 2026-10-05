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

// ---------------------------------------------------------------- set A: the beach (dawn start + sunset finale)
const shore = (() => {
  const g = mk('shore'), st = new VSet(g), r = rng(701);
  for (let x = -50; x <= 50; x++) for (let z = -40; z <= 0; z++) st.add(x, 0, z, z > -6 ? 'sand' : 'turf');
  for (let z = 1; z <= 9; z++) for (const x of [-1, 0, 1]) st.add(x, 0, z, 'plank');
  for (const z of [3, 6, 9]) for (const x of [-1, 1]) st.add(x, -1, z, 'log');
  const trees = []; for (let i = 0; i < 80; i++) { const x = Math.round((r() - .5) * 96), z = Math.round(-38 + r() * 28); if (trees.some(q => Math.hypot(q[0] - x, q[1] - z) < 4.5) || (Math.abs(x) < 12 && z > -14)) continue; trees.push([x, z]); tree(st, x, 0, z, r, 4 + Math.floor(r() * 3)); }
  for (let i = 0; i < 18; i++) st.add(Math.round((r() - .5) * 60), 1, Math.round(-2 - r() * 3), r() < 0.5 ? 'stone' : 'sand');
  st.build(); seaSet(g);
  const berg = new THREE.Group(); berg.position.set(30, -1, 170); g.add(berg); box(60, 14, 30, 0, 0, 7, 0, berg, MAT.ice); box(30, 8, 20, 0, 6, 17, 0, berg, MAT.snow);
  // drips / sparkle / finale steam
  for (let t = 0.3; t < 30; t += 2.5) burst(t, [0.5 + Math.sin(t) * 10, 0.2, 4 + Math.cos(t) * 5], { n: 6, colors: ['#bfe8ff', '#ffffff'], speed: 1, size: 0.12, life: 0.8, grav: 6, up: 1 });
  burst(E.judge + 2.4, [-1.5, 0.6, 1.4], { n: 40, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 4, size: 0.16, life: 0.8, grav: 10, up: 3 });
  for (let k = 0; k < 9; k++) burst(E.make + 1 + k * 1.0, [Math.sin(k) * 2, 0.6, 11 + Math.cos(k) * 1.2], { n: 8, colors: ['#e0a95a', '#ffffff'], speed: 2.5, size: 0.12, life: 0.6, grav: 10 });
  smoke(E.shore, 300, 0.5, t => [1.2 + Math.sin(t * 5) * 0.2, 1.1, -0.2], { n: 2, colors: ['#ffffff', '#e0e0e0'], size: 0.25, life: 1.6, up: 1.2, grav: -0.6, speed: 0.3 });
  smoke(243.2, 247, 0.12, t => [-3.5 + Math.sin(t * 9) * 1.5, 1.6, -2.6], { n: 4, colors: ['#5aa8ff', '#bfe8ff'], size: 0.12, life: 0.7, up: 2, grav: 10, speed: 3 });
  burst(247.6, [6, 0, 34], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.4, life: 1.4, grav: 10, up: 6 }); burst(249.7, [12, 0, 40], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.4, life: 1.4, grav: 10, up: 6 });
  const C1 = [[0, 18, 7, 20, 0, 1, -1, 55], [6.0, 13, 5, 15, 0, 1, -1, 52], [6.01, 2.8, 1.8, 4.6, 0, 1.8, -1.5, 48], [12.9, 2.2, 1.7, 4.0, 0, 1.8, -1.5, 48],
    [17.0, -6.5, 3.2, 8.5, -1.5, 1.2, -1, 52], [24.5, -4.5, 2.8, 7.4, -1, 1.2, -1, 52], [35.5, 9, 4, 18, 0, 0.6, 11, 52], [36, 9, 4, 18, 0, 0.6, 11, 52]];
  const C2 = [[E.shore, 14, 4, 12, 0, 1, -1, 52], [238.5, 11, 3.5, 10, 0, 1, -1, 52], [238.6, 1.5, 1.0, 2.4, 0.4, 1.6, -1.2, 48], [243.1, 2.2, 1.1, 1.8, 0.4, 1.6, -1.2, 48],
    [243.2, -6.4, 2.0, 3.2, -3.6, 1.3, -2.6, 46], [246.7, -7.0, 2.2, 2.4, -3.6, 1.3, -2.6, 46], [246.8, 0.6, 1.8, -5.5, 8, 2, 36, 46], [251.7, 1.0, 1.9, -5.0, 9, 2, 38, 46],
    [251.8, 3.0, 1.3, 2.2, 1.4, 0.7, -0.4, 44], [256.9, 2.6, 1.2, 1.6, 1.4, 0.7, -0.4, 44], [257.0, 6, 3, 9, 1, 1.2, -1.5, 50], [263.1, 5, 2.8, 8, 1, 1.2, -1.5, 50],
    [263.2, 1.0, 2.0, 4.8, 1.0, 1.4, -1.1, 50], [271.1, 0.8, 1.9, 4.2, 1.0, 1.4, -1.1, 48], [271.2, 3.4, 1.9, 3.4, 2.4, 2.1, -1.0, 50], [280.7, 2.9, 2.0, 1.8, 2.4, 2.1, -1.0, 38],
    [280.8, 1.4, 2.5, 6.8, 1.0, 1.4, -1.5, 48], [E.logo, 1.4, 2.5, 6.4, 1.0, 1.4, -1.5, 48]];
  function update(t) {
    const late = t >= E.shore;
    raftG.visible = !late && t > E.make; if (raftG.visible) { parentTo(raftG, g); raftVS.update(t); raftG.position.set(0, -0.45 + Math.sin(t * 2) * 0.04, 11); raftG.rotation.set(0, 0, Math.sin(t * 1.3) * 0.02); motor.visible = false; rflag.visible = t > E.makeEnd - 1; }
    bucket.visible = !late && t > 5; parentTo(bucket, g); bucket.position.set(0.7, 0.5, 6.5); bMat.emissiveIntensity = 0;
    rod.visible = false; fline.visible = rope.visible = false; trophy.visible = false; glub.root.visible = late && win(t, 247, 251);
    if (glub.root.visible) { parentTo(glub.root, g); const k = seg(t, 247.4, 250.0); glub.root.position.set(lerp(6, 12, k), -1 + Math.sin(k * Math.PI) * 6, lerp(34, 40, k)); glub.root.rotation.set(-Math.cos(k * Math.PI) * 0.8, 0.6, 0); glub.tail.rotation.y = Math.sin(t * 12) * 0.5; }
    seals.forEach(s => s.root.visible = false); sfish.forEach(f => f.visible = false);
    // judge (start only)
    judge.root.visible = !late && t > E.judge; if (judge.root.visible) { parentTo(judge.root, g); const k = seg(t, E.judge, E.judge + 2.4); poseSeal(judge, t, [lerp(-8, -1.6, k), lerp(-0.6, 0.5, Math.min(1, k * 1.6)), lerp(14, 1.2, k)], k < 1 ? Math.atan2(6.4, -12.8) : 0.5, { slide: k < 1, clap: win(t, E.poster, E.poster + 1.5), seed: 1 }); }
    // leggy
    let lp = [-3.6, 0.5, -2.6], ly = 0.5, ls = 0.3; if (late) { lp = [-3.6, 0.5, -2.6]; ly = 0.9; }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); if (late && win(t, 243.2, 247)) { L6.root.rotation.z = Math.sin(t * 40) * 0.12; } else L6.root.rotation.z = 0;
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // puff
    puff.root.visible = (t < 31.6) || late; parentTo(puff.root, g);
    let pp = head, py = ly, po = {};
    if (!late) { if (t > 8.8) { const k = seg(t, 8.8, 10); pp = [lerp(head[0], -1.6, k), lerp(head[1], 0.5, k) + Math.sin(k * Math.PI) * 1.4, lerp(head[2], 0.4, k)]; py = 0.3; }
      if (t > 30) { const k = seg(t, 30, 31.6); pp = [lerp(-1.6, 0.7, k), lerp(0.5, 1.1, k) + Math.sin(k * Math.PI) * 2, lerp(0.4, 6.5, k)]; } }
    else { pp = [1.3, 0.5, -0.3]; py = 0.4; po = { hop: win(t, 251.8, 253) }; }
    poseMag(puff, t, pp, py, po);
    // hero
    const o = { t, p: [0, 0.5, -1.5], yaw: 0, mallet: false, face: 'normal' };
    if (!late) { if (t < 4) o.wave = true; else if (t < 8) o.hips = true; else if (t < 12.8) o.yaw = yawTo([0, 0, -1.5], [-3.6, 0, -2.6]); else if (t < E.poster) o.yaw = -1.0;
      if (win(t, 23.6, 26)) { o.wave = true; o.face = 'smug'; } if (t > E.make) { o.p = [-1.4, 0.5, 2]; o.yaw = 0.2; o.hips = true; } }
    else { o.p = [0, 0.5, -1.5]; o.face = 'scared'; o.yaw = 0.3; if (t > 236) o.face = 'normal'; if (t > E.bill - 0.2) { o.p = [2.4, 0.5, -1.0]; o.yaw = t < 271.2 ? -1.3 : 0.25; o.face = t > 276.8 ? 'scared' : 'normal'; } if (t > 280.8) o.hips = false; if (win(t, 257, 263)) o.hips = true; }
    pose(hero, o); parentTo(hero.root, g); if (late && t < 246) hero.root.rotation.z = Math.sin(t * 30) * 0.03;
    // bloop
    let bp = [2.6, 0.5, -1.8], by = -0.8, bo = {};
    if (!late) { if (t < 12) bo = { handOut: true }; if (win(t, E.make, E.makeEnd)) { const a = (t - E.make) * 0.9; bp = [Math.cos(a) * 3.2, 0.5, 11 + Math.sin(a) * 2.2]; bp[1] = Math.abs(bp[0]) < 1.5 && bp[2] > 0.5 && bp[2] < 9.5 ? 0.5 : -0.2; by = a + Math.PI / 2; bo = { walk: 1, phase: t * 14 }; if (Math.abs(bp[0]) > 1.6) bp[1] = 0.05; } if (t > E.makeEnd) { bp = [0.8, 0.05, 10.6]; by = Math.PI; } }
    else { bp = [-1.8, 0.5, -0.6]; by = 0.6; if (t > E.bill - 0.2) { bp = [-0.6, 0.5, -1.2]; by = Math.PI / 2; bo = { handOut: true }; } }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true;
    bBrick.visible = false; blue.visible = false; card.visible = (!late && t < 12) || (late && t > E.bill - 0.2); card.scale.set(1, late && t > E.bill ? lerp(1, 4.5, seg(t, E.bill, E.bill + 1.5)) : 1, 1); if (late && t > E.bill) card.position.y = -0.62 - (card.scale.y - 1) * 0.24;
    drill.visible = !late && win(t, 33, 36); bHat.scale.set(1, 1, 1); bHat.rotation.z = 0; board.visible = false;
    let cam = camKeys(t, late ? C2 : C1);
    if (!late && win(t, E.judge, E.poster)) { const j = judge.root.position; cam = { p: [j.x + 3, 1.8, j.z + 5], l: [j.x, 0.9, j.z], fov: 50 }; }
    if (!late && win(t, E.make, E.makeEnd)) { const a = (t - E.make) * 0.25; cam = { p: [Math.sin(a) * 10, 4, 11 + Math.cos(a) * 10], l: [0, 0.5, 10], fov: 52 }; }
    return { cam, hud: true };
  }
  return { g, update };
})();

// ---------------------------------------------------------------- set B: foggy sea + the iceberg
const bergSet = (() => {
  const g = mk('berg'), A = new THREE.Group(), B = new THREE.Group(); g.add(A, B);
  const sa = new VSet(A), sb = new VSet(B);
  for (let y = -3; y <= 4; y++) { const f = 1 + (4 - y) * 0.06; for (let x = -18; x <= 18; x++) for (let z = -12; z <= 12; z++) {
    const q = (x / (15 * f)) ** 2 + (z / (10 * f)) ** 2 + (vnoise(x * 0.3, z * 0.3, y + 20) - 0.5) * 0.25; if (q > 1) continue; (x < 2 ? sa : sb).add(x, y, z, y === 4 ? 'snow' : 'ice'); } }
  for (const [x, z, h] of [[12, -5, 4], [13, 2, 3]]) { for (let y = 5; y < 5 + h; y++) sb.add(x, y, z, 'ice'); sb.add(x, 5 + h, z, 'snow'); }
  for (const x of [3, 9]) for (let y = 5; y <= 7; y++) sb.add(x, y, -7, 'log');
  sa.build(); sb.build(); seaSet(g);
  const ban = new THREE.Mesh(new THREE.BoxGeometry(6, 1.1, 0.08), new THREE.MeshBasicMaterial({ map: bannerTex('FROSTBITE CUP') })); ban.position.set(6, 7.4, -7); B.add(ban);
  const fr = rng(702); for (let i = 0; i < 14; i++) { const a = fr() * 6.28, d = 24 + fr() * 40; box(1 + fr() * 2, 0.8, 1 + fr() * 2, 0, Math.cos(a) * d, -0.2, Math.sin(a) * d, g, MAT.ice); }
  const hole = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), holeMat); hole.position.set(-6.6, 4.52, 2); A.add(hole);
  const sHoles = [[6, -6], [10, 4], [5, 6]].map(([x, z]) => { const h = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.9), holeMat); h.position.set(x, 4.52, z + (z < 0 ? 1.4 : -1.4)); B.add(h); return h; });
  const dots = []; for (let k = 0; k < 9; k++) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.7), holeMat); h.position.set(2, 4.52, -8 + k * 2); B.add(h); dots.push(h); }
  // --- motion helpers
  const AK = [[E.bite, -30, 0, 6], [182, -44, 0, -6], [188, -34, 0, -20], [E.jump, -14, 0, -22]];
  const Apos = t => { if (t < E.crack) return [0, 0]; if (t < E.bite) { const k = ss(seg(t, E.crack, E.bite)); return [lerp(0, -30, k), lerp(0, 6, k)]; } const p = track(Math.min(t, E.jump), AK).p; return [p[0], p[2]]; };
  const Asy = t => t < E.wet ? 1 : t < E.crack ? lerp(1, 0.85, seg(t, E.wet, E.crack)) : t < E.bite ? lerp(0.85, 0.55, seg(t, E.crack, E.bite)) : t < E.jump ? lerp(0.55, 0.3, seg(t, E.bite, E.jump)) : lerp(0.3, 0.001, seg(t, E.jump, E.jump + 2));
  const Asx = t => t < E.bite ? lerp(1, 0.85, seg(t, E.crack, E.bite)) : t < E.jump ? lerp(0.85, 0.6, seg(t, E.bite, E.jump)) : lerp(0.6, 0.001, seg(t, E.jump, E.jump + 2));
  const onA = (t, lx, lz) => { const a = Apos(t), s = Asx(t); return [a[0] + lx * s, 4.5 * Asy(t), a[1] + lz * s]; };
  const Bsy = t => t < E.sink ? 1 : lerp(1, 0.001, seg(t, E.sink, E.sink + 5)), Bsx = t => t < E.sink ? 1 : lerp(1, 0.6, seg(t, E.sink, E.sink + 5));
  const onB = (t, x, z) => { const s = Bsx(t), top = 4.5 * Bsy(t); return [x * s, top < -0.6 ? -0.8 + Math.sin(t * 2 + x) * 0.1 : top, z * s]; };
  const RK = [[E.sail, 70, -0.45, 20], [E.arrive, 19, -0.45, 2], [E.race, 19, -0.45, 2], [172, 10, -0.45, 18], [E.bite, -20, -0.45, 20], [182, -42, -0.45, -14], [188, -32, -0.45, -28], [E.jump, -12, -0.45, -30], [198, -6, -0.45, -12], [E.land, -1.5, -0.45, -2]];
  const raftAt = t => { const w = track(t, RK); return { p: w.p, yaw: Math.hypot(w.v[0], w.v[2]) > 0.1 ? Math.atan2(w.v[0], w.v[2]) : -Math.PI / 2 }; };
  const towAt = t => { if (t < E.jump) { const a = Apos(t); return [a[0], a[1]]; } const r = raftAt(t).p; return [r[0], r[2]]; };
  // --- particles
  for (let k = 0; k < 9; k++) burst(E.drill + 0.8 + k * 1.55, [2, 4.7, -8 + k * 2], { n: 14, colors: ['#ffffff', '#bfe8ff'], speed: 3, size: 0.12, life: 0.7, grav: 9, up: 2 });
  for (const [s, at] of [[E.boot, 0], [E.cube, 0], [E.tiny, 0]]) burst(s, [-6.6, 4.6, 2], { n: 30, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 3, size: 0.12, life: 0.8, grav: 10, up: 3 });
  for (let i = 0; i < 3; i++) for (let k = 0; k < 7; k++) { const s = 84 + i * 3 + k * 9.5; if (s < E.crack) burst(s, [[6, -4.6], [10, 2.6], [5, 4.6]][i].reduce((a, v, j) => (a[j ? 2 : 0] = v, a), [0, 4.6, 0]), { n: 18, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 2.5, size: 0.12, life: 0.7, grav: 10, up: 3 }); }
  smoke(E.wet + 4, E.reveal, 0.35, [-4.2, 5.2, 3.2], { n: 3, colors: ['#ffffff', '#e8eef2'], size: 0.2, life: 1.4, up: 1.2, grav: -0.8, speed: 0.3 });
  burst(E.reveal, [-4.2, 5.3, 3.2], { n: 60, colors: ['#ffffff', '#ffb43a', '#ff7a1a'], speed: 4, size: 0.2, life: 1, grav: 4, up: 3 });
  for (let k = 0; k < 12; k++) burst(E.crack - 1 + k * 0.25, [2, 4.6, -9 + k * 1.6], { n: 16, colors: ['#ffffff', '#bfe8ff', '#5aa8ff'], speed: 4, size: 0.2, life: 1, grav: 10, up: 4 });
  for (let t = E.race; t < E.land; t += 0.12) { const r = raftAt(t).p; burst(t, [r[0] + 0.5, -0.1, r[2]], { n: 3, colors: ['#ffffff', '#bfe8ff'], speed: 1.5, size: 0.2, life: 0.8, grav: 6, up: 1.2 }); }
  burst(E.bite, [-40, 0, 6], { n: 160, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 8, size: 0.3, life: 1.5, grav: 10, up: 8 });
  for (let t = E.bite + 2; t < E.land; t += 0.2) { const a = towAt(t + 1.6); burst(t, [a[0] - 1, 0, a[1]], { n: 4, colors: ['#ffffff', '#bfe8ff'], speed: 2, size: 0.25, life: 0.8, grav: 8, up: 2 }); }
  burst(E.jump, [-14, 1, -22], { n: 80, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.25, life: 1.2, grav: 10, up: 5 });
  burst(E.land, [0, 1.5, -1], { n: 160, colors: ['#ffffff', '#bfe8ff', '#5aa8ff', '#e0a95a'], speed: 8, size: 0.25, life: 1.4, grav: 10, up: 6 });
  for (let k = 0; k < 8; k++) burst(E.win + 0.3 + k * 0.5, [5 + Math.sin(k) * 2, 8, Math.cos(k) * 2], { n: 40, colors: ['#ff5cf0', '#5ff7ff', '#ffe066', '#7cff6b'], speed: 5, size: 0.16, life: 2, grav: 4, up: 3 });
  smoke(E.melt + 0.5, E.sink, 0.25, t => { const h = rodTip(); return [h.x, h.y, h.z]; }, { n: 3, colors: ['#ffffff', '#ffd23f'], size: 0.15, life: 1, up: 1, grav: -0.5, speed: 0.4 });
  for (let k = 0; k < 10; k++) burst(E.sink + k * 0.6, [(k % 2 ? 4 : 10) + Math.sin(k) * 3, 0, Math.cos(k * 2) * 6], { n: 50, colors: ['#bfe8ff', '#5aa8ff', '#ffffff'], speed: 6, size: 0.3, life: 1.3, grav: 10, up: 6 });
  // --- camera
  const C = [[E.arrive, 32, 14, 30, 4, 3, 0, 55], [55.5, 26, 12, 28, 4, 3, 0, 55],
    [71.0, 2, 22, 14, 2, 4, 0, 50], [77.9, -1, 20, 15, 2, 4, 0, 50], [78.0, 3.6, 6.2, 2.0, 7, 5.4, 0, 45], [80.3, 3.4, 6.0, 1.4, 7, 5.4, 0, 45],
    [80.4, -0.4, 7.4, 8.2, -5.6, 4.9, 2, 52], [89.9, -1.2, 7.0, 7.4, -5.6, 4.9, 2, 50], [90.0, -6.4, 5.4, 6.4, -6, 5.4, 2, 48], [97.9, -6.0, 5.4, 6.0, -6, 5.6, 2, 46],
    [98.0, 14, 9, 16, 0, 5, 0, 55], [106.5, 12, 8, 17, 0, 5, 0, 55], [106.6, -0.6, 6.2, 8.4, -4, 5, 2.5, 50], [114.5, -1.4, 6.0, 7.8, -4, 5, 2.5, 50],
    [121.0, 1.4, 6.6, 6.2, -4.4, 5.1, 1.4, 50], [126.3, 0.8, 6.4, 5.6, -4.4, 5.1, 1.4, 48], [126.4, -1.0, 6.2, 6.8, -4.6, 4.9, 2.6, 46], [132.9, -1.6, 6.0, 6.2, -4.6, 4.9, 2.6, 44],
    [133.0, -9, 4.9, 7, -5, 5, 2, 50], [139.9, -8.6, 5.0, 6.4, -5, 5, 2, 50], [140.0, -4.4, 6.4, 7.6, -7.0, 5.2, 3.6, 46], [144.9, -5.0, 6.2, 7.0, -7.0, 5.3, 3.6, 44],
    [145.0, -4.0, 8.2, 12.0, 1.5, 4.8, -1.0, 50], [E.crack - 0.1, -3.0, 7.6, 10.5, 2.0, 4.8, -2.0, 46], [E.crack, -6, 18, 24, -4, 3, 0, 55], [E.mount - 0.1, -12, 16, 27, -10, 3, 2, 55],
    [E.mount, 24, 3, 8, 18.5, 0.6, 2, 50], [E.race - 0.1, 23, 3.2, 6, 18.5, 0.6, 2, 50],
    [E.land, -6, 9, 15, 4, 4.5, 0, 55], [E.win - 0.1, -3, 8, 13, 4, 4.5, 0, 55], [E.win, 0.6, 6.4, 5.0, 3.0, 5.4, -0.6, 48], [E.melt - 0.1, 0.2, 6.2, 4.4, 3.0, 5.4, -0.6, 46],
    [E.melt, 0.4, 6.0, 3.6, 3.2, 5.5, -0.8, 44], [E.sink - 0.1, 0.8, 5.9, 3.0, 3.2, 5.4, -0.8, 42], [E.sink, 20, 9, 20, 5, 1, 0, 55], [E.shore, 17, 6, 22, 5, 0, 0, 55]];
  function update(t) {
    const a = Apos(t); A.position.set(a[0], 0, a[1]); A.scale.set(Asx(t), Asy(t), Asx(t)); A.visible = t < E.jump + 2; B.scale.set(Bsx(t), Bsy(t), Bsx(t));
    hole.visible = t > 62; sHoles.forEach(h => h.visible = t > E.arrive); dots.forEach((h, k) => h.visible = t > E.drill + 0.8 + k * 1.55);
    // raft
    const R = raftAt(t); parentTo(raftG, g); raftG.visible = true; raftVS.update(t); rflag.visible = true; raftG.position.set(R.p[0], R.p[1] + Math.sin(t * 2.2) * 0.05, R.p[2]); raftG.rotation.set(0, R.yaw + Math.PI / 2, Math.sin(t * 1.6) * 0.03);
    motor.visible = t > E.mount + 3; motor.scale.setScalar(backOut(seg(t, E.mount + 3, E.mount + 4))); mbit.rotation.x = t > E.race - 0.5 ? t * 40 : 0;
    const onRaft = (lx, lz) => { const yw = R.yaw + Math.PI / 2, c = Math.cos(yw), s = Math.sin(yw); return [R.p[0] + lx * c + lz * s, R.p[1] + 0.5, R.p[2] - lx * s + lz * c]; };
    // bucket
    parentTo(bucket, g); bucket.visible = t < E.jump; const bk = t < 62 ? onRaft(1.2, 0.7) : onA(t, -4.2, 3.2); bucket.position.set(...bk);
    bMat.emissiveIntensity = t > E.wet + 2 && t < E.reveal ? 0.4 + Math.sin(t * 6) * 0.25 : 0;
    // judge + seals
    parentTo(judge.root, g); judge.root.visible = t > E.arrive;
    let jp = onB(t, 7, 0), jy = -Math.PI / 2; if (win(t, E.land + 3, E.win)) { const k = seg(t, E.land + 3, E.win - 1); jp = onB(t, lerp(7, 5.2, k), 0); }
    if (t > E.win - 1 && t < E.sink) jp = onB(t, 5.2, 0); poseSeal(judge, t, jp, jy, { clap: win(t, E.win, E.win + 3) || win(t, E.start - 0.2, E.start + 0.8), hop: win(t, E.land, E.land + 2), seed: 1 });
    seals.forEach((s, i) => { parentTo(s.root, g); s.root.visible = t > E.arrive; const P = [[6, -6, Math.PI], [10, 4, 0], [5, 6, 0]][i]; let sp = onB(t, P[0], P[1]), sy2 = P[2];
      if (i === 2 && win(t, E.tiny + 0.8, E.steal + 3)) { const k1 = seg(t, E.tiny + 0.8, E.steal), k2 = seg(t, E.steal + 0.2, E.steal + 3); const x = t < E.steal ? lerp(5, -5.6, k1) : lerp(-5.6, 5, k2), z = t < E.steal ? lerp(6, 3.4, k1) : lerp(3.4, 6, k2); sp = [x, 4.5 + Math.abs(Math.sin((t < E.steal ? k1 : k2) * Math.PI * 4)) * 0.6, z]; sy2 = t < E.steal ? yawTo([5, 0, 6], [-5.6, 0, 3.4]) : yawTo([-5.6, 0, 3.4], [5, 0, 6]); }
      let caught = false; for (let k = 0; k < 7; k++) { const c = 84 + i * 3 + k * 9.5; if (c < E.crack && win(t, c, c + 2.4)) caught = true; }
      poseSeal(s, t, sp, sy2, { clap: caught || (t > E.win && t < E.sink), seed: i * 2 + 3 }); const f = sfish[i]; parentTo(f, g); f.visible = caught || (i === 2 && win(t, E.steal, E.steal + 1.6)); f.position.set(sp[0], sp[1] + 2.2 + Math.sin(t * 9) * 0.1, sp[2]); f.rotation.set(0, t * 3, 0.6); if (i === 2 && win(t, E.steal, E.steal + 1.6)) { f.scale.setScalar(1 - seg(t, E.steal + 1.2, E.steal + 1.6)); f.position.set(sp[0], sp[1] + 1.2, sp[2]); } else f.scale.setScalar(1.6); });
    // glubzilla
    parentTo(glub.root, g); glub.root.visible = t > E.bite && t < E.sink; glub.tail.rotation.y = Math.sin(t * 14) * 0.5;
    let gp = [0, 0, 0], gy = 0, gr = 0;
    if (t < E.bite + 1.6) { const k = seg(t, E.bite, E.bite + 1.6); gp = [lerp(-38, -44, k), -1.2 + Math.sin(k * Math.PI) * 9, lerp(6, 4, k)]; gy = -Math.PI / 2; gr = lerp(-0.9, 0.9, k); }
    else if (t < E.land) { const c = towAt(t + 1.6), b = towAt(t + 1.7); gp = [c[0], -0.9 + Math.sin(t * 3) * 0.2, c[1]]; gy = Math.atan2(b[0] - c[0], b[1] - c[1]); gr = Math.sin(t * 5) * 0.1; if (t > E.land - 1) { const k = seg(t, E.land - 1, E.land + 0.6); gp = [lerp(c[0], 6, k), lerp(-0.9, 4.5 + 1.0, k) + Math.sin(k * Math.PI) * 6, lerp(c[1], 0, k)]; gr = -0.6 * Math.sin(k * Math.PI); } }
    else { gp = onB(t, 6, 0); gp[1] += 1.0; gy = 0.3; gr = 0; glub.root.rotation.z = Math.sin(t * 9) * 0.25 * (1 - seg(t, E.land, E.win)); }
    glub.root.position.set(...gp); glub.root.rotation.set(gr, gy, t > E.land ? Math.PI / 2 * 0.9 + glub.root.rotation.z * 0 : 0);
    // --- leggy
    let lp = onRaft(-7, 0), ly = R.yaw, ls = 2; lp[1] = -1.6;
    if (t > E.arrive) { const K = [[E.arrive, 21, -1.6, 1], [E.arrive + 2, 15.5, 4.5, 1], [E.slip, 12, 4.5, 0], [E.slip + 6, 2, 4.5, -2], [64, -6, 4.5, -4]]; const w = walker(t, K); lp = w.p; ly = w.speed > 0.1 ? w.yaw : Math.PI / 2; ls = w.speed > 0.1 ? 2 : 0.3; }
    if (t > 64) { lp = onA(t, -7, -4); ly = Math.PI / 2; ls = 0.3; }
    if (win(t, E.skate, 121)) { const x = -6 + Math.sin((t - E.skate) * 1.3) * 3.5; lp = onA(t, x, -4); ly = Math.cos((t - E.skate) * 1.3) > 0 ? Math.PI / 2 : -Math.PI / 2; ls = 1.5; }
    if (win(t, E.bite + 1, E.jump)) { const an = (t - E.bite) * 1.6; lp = onA(t, -3 + Math.cos(an) * 3.5, Math.sin(an) * 3.5); ly = -an + (win(t, 186, 188) ? (t - 186) * 18 : 0); ls = 1; }
    if (t >= E.jump) { const k = seg(t, E.jump, E.jump + 1.2), j = onA(E.jump, -3, 0), rr = onRaft(0, -2.8); lp = [lerp(j[0], rr[0], k), lerp(j[1], -1.6, k) + Math.sin(k * Math.PI) * 3, lerp(j[2], rr[2], k)]; ly = R.yaw; ls = 2; }
    if (t >= E.land) { const k = seg(t, E.land, E.land + 3); const b = onB(t, 4.5, -4); lp = [lerp(-1, b[0], k), lerp(-1.6, b[1], Math.min(1, k * 1.5)), lerp(-3, b[2], k)]; ly = Math.PI / 2; ls = k < 1 ? 2 : 0.3; if (t > E.sink) { lp = onB(t, 4.5, -4); lp[1] = Math.max(-1.6, lp[1]); } }
    poseLurk(L6, t, lp, ly, ls); parentTo(L6.root, g); L6.root.rotation.z = 0;
    if (win(t, E.slip, E.slip + 6.5)) poseLeggySplay(Math.min(1, seg(t, E.slip, E.slip + 0.4)) * (1 - seg(t, E.slip + 6, E.slip + 6.5)));
    if (win(t, 64, E.skate)) poseLeggySplay(0.35 + Math.sin(t * 2) * 0.1);
    if (win(t, 117.2, 119)) poseLeggySplay(1 - seg(t, 118.5, 119));
    const head = rideOn(lp, ly, 1.75, 1.83 + (L6.body.position.y - 1.3));
    // --- puff
    puff.root.visible = t > E.reveal; parentTo(puff.root, g);
    let pp = onA(t, -7.0, 3.6), py = 0.4, po = {};
    if (t < E.reveal + 1) { const k = seg(t, E.reveal, E.reveal + 1); const bq = onA(t, -4.2, 3.2); pp = [lerp(bq[0], pp[0], k), lerp(bq[1] + 0.2, pp[1], k) + Math.sin(k * Math.PI) * 1.4, lerp(bq[2], pp[2], k)]; po.hop = true; }
    if (t > E.bite + 1.6) { const k = seg(t, E.bite + 1.6, E.bite + 2.8); const b = onA(t, -7.0, 3.6); pp = [lerp(b[0], head[0], k), lerp(b[1] + 0.6, head[1], k) + Math.sin(k * Math.PI) * 1.5, lerp(b[2], head[2], k)]; py = ly; }
    if (t > E.melt && t < E.melt + 6) { const h = rodTip(); const k = seg(t, E.melt, E.melt + 0.8); pp = [lerp(head[0], h.x, k), lerp(head[1], h.y - 0.2, k) + Math.sin(k * Math.PI), lerp(head[2], h.z, k)]; po.hop = false; }
    if (t > E.melt + 6) { const k = seg(t, E.melt + 6, E.melt + 7); const h = onB(t, 3.2, -0.6); pp = [lerp(h[0], head[0], k), lerp(h[1] + 1, head[1], k), lerp(h[2], head[2], k)]; }
    poseMag(puff, t, pp, py, { ...po, big: t > E.reveal && t < E.jump });
    // --- hero
    const o = { t, p: onRaft(-1, 0.3), yaw: R.yaw, mallet: false, face: 'normal' };
    if (t < E.arrive && t > 44) o.wave = true;
    if (t >= E.arrive) { const K = [[E.arrive, 18, 0.05, 2], [E.arrive + 1.4, 14, 4.5, 2], [62, -5, 4.5, 2]]; const w = walker(t, K); o.p = w.p; o.yaw = w.yaw; o.walk = w.walk; o.phase = w.phase; }
    let fishing = false;
    if (t >= 62 && t < E.jump) { o.p = onA(t, -5, 2); o.yaw = -Math.PI / 2; o.hold = true; fishing = true;
      if (win(t, E.boot, E.boot + 4)) o.face = 'smug'; if (win(t, E.steal, E.steal + 2.2)) { o.panic = true; o.hold = false; o.face = 'scared'; }
      if (win(t, E.invoice, E.invoiceEnd)) { o.yaw = yawTo([-5, 0, 2], [-3.6, 0, 0.8]); o.face = 'scared'; o.hold = false; o.hips = true; }
      if (win(t, E.wet, E.reveal)) { o.headPitch = 0.5; o.yaw = yawTo([-5, 0, 2], [-4.2, 0, 3.2]); }
      if (win(t, E.reveal, E.mount)) { o.face = 'scared'; o.yaw = yawTo([-5, 0, 2], [-4.2, 0, 3.2]); if (t > E.crack) { o.panic = true; o.hold = false; } }
      if (win(t, E.cast, E.cast + 1)) o.swing = seg(t, E.cast, E.cast + 1);
      if (t > E.bite) { o.lean = -0.35; o.face = win(t, 181, 186) ? 'smug' : 'scared'; const f = glub.root.position, h = onA(t, -5, 2); o.yaw = Math.atan2(f.x - h[0], f.z - h[2]); } }
    if (t >= E.jump && t < E.land) { const k = seg(t, E.jump, E.jump + 1.1), j = onA(E.jump, -5, 2), rr = onRaft(-1, 0.4); o.p = [lerp(j[0], rr[0], k), lerp(j[1], rr[1], k) + Math.sin(k * Math.PI) * 2.5, lerp(j[2], rr[2], k)]; o.hold = true; o.lean = -0.3; o.face = 'scared'; fishing = true; const f = glub.root.position; o.yaw = Math.atan2(f.x - o.p[0], f.z - o.p[2]); }
    if (t >= E.land) { const k = seg(t, E.land, E.land + 1.2), rr = onRaft(-1, 0.4), b = onB(t, 3.2, -0.8); o.p = [lerp(rr[0], b[0], k), lerp(rr[1], b[1], k) + Math.sin(k * Math.PI) * 2, lerp(rr[2], b[2], k)]; o.yaw = Math.PI / 2; o.face = 'normal';
      if (t > E.win) { o.wave = t < E.melt; o.face = 'smug'; } if (t > E.melt) { o.hold = true; o.face = t > 220 ? 'scared' : 'normal'; } if (t > E.sink) { o.panic = true; o.hold = false; o.face = 'scared'; } }
    pose(hero, o); parentTo(hero.root, g); rod.visible = t > E.arrive && t < E.win;
    // trophy in the hero's right hand
    trophy.visible = t > E.win - 3 && t < E.sink; if (trophy.visible) { if (t < E.win) { parentTo(trophy, judge.fR); trophy.position.set(0.2, 0.2, 0.3); trophy.rotation.set(0, 0, 0); } else { parentTo(trophy, hero.aR); trophy.position.set(0, -0.78, 0.2); trophy.rotation.set(Math.PI / 2, 0, 0); }
      const m = seg(t, E.melt + 1.5, E.melt + 6); tFish.scale.set(1 - m * 0.3, Math.max(0.02, 1 - m), 1 - m * 0.3); puddle.visible = m > 0.2; puddle.scale.set(0.4 + m, 1, 0.4 + m); }
    // fishing line
    fline.visible = false; if (rod.visible && (fishing || win(t, 62, E.jump))) { parentTo(fline, g); const tip = rodTip(); let end = onA(t, -6.6, 2); end = new THREE.Vector3(end[0], end[1], end[2]);
      let cg = null; if (win(t, E.boot, E.boot + 7.6)) cg = catches.boot; else if (win(t, E.cube, E.cube + 7.6)) cg = catches.cube; else if (win(t, E.tiny, E.steal)) cg = catches.tiny;
      for (const c of Object.values(catches)) { c.visible = false; parentTo(c, g); }
      if (cg) { const s0 = cg === catches.boot ? E.boot : cg === catches.cube ? E.cube : E.tiny; const k = seg(t, s0, s0 + 1.2); end = new THREE.Vector3(lerp(end.x, tip.x, k * 0.6), lerp(end.y, tip.y - 0.8, k), lerp(end.z, tip.z, k * 0.6)); cg.visible = true; cg.position.copy(end).add(new THREE.Vector3(0, -0.25, 0)); cg.rotation.set(Math.sin(t * 4) * 0.4, t, 0); }
      if (t > E.bite + 0.6) { const f = glub.root.position; end = new THREE.Vector3(f.x, f.y + 0.4, f.z); }
      if (t < E.cast && t > E.crack + 2) end.y = Math.max(end.y, tip.y - 2.4);
      fline.visible = true; lineBetween(fline, tip, end); }
    else for (const c of Object.values(catches)) c.visible = false;
    // rope from raft to Leggy during the sail
    rope.visible = t < E.arrive; if (rope.visible) { parentTo(rope, g); const a2 = onRaft(-2.6, 0); lineBetween(rope, new THREE.Vector3(a2[0], 0.1, a2[2]), new THREE.Vector3(lp[0], -0.2, lp[2])); }
    // --- bloop
    let bp = onRaft(1.2, -0.3), by = R.yaw, bo = {};
    if (t >= E.arrive) { const K = [[E.arrive, 20, 0.05, 1], [E.arrive + 1.6, 15, 4.5, 0], [E.drill, 3, 4.5, -8], [E.drillEnd, 3, 4.5, 8], [80, 4, 4.5, -2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : -Math.PI / 2; bo = w.speed > 0.2 ? { walk: 1, phase: w.phase } : {};
      if (win(t, E.drill, E.drillEnd)) { by = -Math.PI / 2; bo = {}; } }
    if (win(t, 118.6, 130)) { const K = [[118.6, 4, 4.5, -2], [E.invoice - 0.4, -3.6, 4.5, 0.8], [E.invoiceEnd, -3.6, 4.5, 0.8], [129.4, 4, 4.5, -2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : yawTo([-3.6, 0, 0.8], [-5, 0, 2]); bo = win(t, E.invoice - 0.4, E.invoiceEnd) ? { handOut: true } : { walk: 1, phase: w.phase }; }
    if (t > E.crack) { bp = onB(t, 3.2, 0); by = -Math.PI / 2; bo = { facepalm: t < E.mount - 2 }; }
    if (win(t, E.mount - 2, E.race)) { const K = [[E.mount - 2, 3.2, 4.5, 0], [E.mount + 1, 15, 4.5, 2], [E.mount + 2, 19.6, 0.05, 2]]; const w = walker(t, K); bp = w.p; by = w.speed > 0.1 ? w.yaw : Math.PI / 2; bo = { walk: 1, phase: w.phase }; if (t > E.mount + 2) { bp = onRaft(1.6, 0); by = Math.PI / 2; bo = {}; } }
    if (t >= E.race && t < E.land) { bp = onRaft(0.9, -0.3); by = R.yaw; bo = {}; }
    if (t >= E.land) { const k = seg(t, E.land + 0.4, E.land + 1.6), rr = onRaft(0.9, -0.3), b = onB(t, 3.4, 1.8); bp = [lerp(rr[0], b[0], k), lerp(rr[1], b[1], k) + Math.sin(k * Math.PI) * 2, lerp(rr[2], b[2], k)]; by = Math.PI / 2; bo = win(t, E.win, E.melt) ? { hop: true } : (t > E.melt + 4 && t < E.sink ? { facepalm: true } : {}); if (t > E.sink) bo = { angry: true }; }
    poseBurble(bloop6, t, bp, by, bo); parentTo(bloop6.B.root, g); bloop6.B.root.visible = true;
    if (win(t, E.drill, E.drillEnd)) { bloop6.B.aR.rotation.set(-0.5, 0, 0); bloop6.B.root.position.y += Math.sin(t * 40) * 0.03; }
    if (t >= E.race && t < E.land) { bloop6.B.aL.rotation.set(-1.3, 0, 0); bloop6.B.aR.rotation.set(-1.3, 0, 0); }
    drill.visible = t < E.mount + 3; dbit.rotation.z = win(t, E.drill, E.drillEnd) ? t * 50 : 0;
    card.visible = win(t, E.invoice - 0.4, E.invoiceEnd); card.scale.set(1, 1, 1); card.position.y = -0.62; blue.visible = bBrick.visible = board.visible = false; bHat.scale.set(1, 1, 1); bHat.rotation.z = 0;
    // --- camera
    let cam = camKeys(t, C); const hp = hero.root.position;
    if (t < 43) cam = { p: [R.p[0] + 5, 2.4, R.p[2] + 7], l: [R.p[0] - 2, 0.6, R.p[2]], fov: 50 };
    else if (t < E.arrive) cam = { p: [R.p[0] + 9, 5.5, R.p[2] + 7], l: [0, 4, 0], fov: lerp(55, 42, ss(seg(t, 43, E.arrive))) };
    if (win(t, 55.5, 64)) { const q = L6.root.position; cam = { p: [q.x + 5, q.y + 2.6, q.z + 6.5], l: [q.x, q.y + 0.8, q.z], fov: 50 }; }
    if (win(t, 64, 71)) { const q = bloop6.B.root.position; cam = { p: [q.x - 3, 5.2, q.z + 4.4], l: [q.x - 0.5, 5.0, q.z], fov: 50 }; }
    if (win(t, E.skate, E.invoice)) { const q = L6.root.position; cam = { p: [q.x + 2.5, q.y + 2.4, q.z + 7], l: [q.x, q.y + 0.8, q.z], fov: 50 }; }
    if (win(t, E.race, E.cast)) cam = { p: [R.p[0] + 6, 3, R.p[2] + 7], l: [R.p[0], 0.6, R.p[2]], fov: 52 };
    if (win(t, E.cast, E.bite)) cam = { p: [hp.x + 4.5, hp.y + 2.2, hp.z + 4.5], l: [hp.x - 3, hp.y - 0.2, hp.z + 0.5], fov: 52 };
    if (win(t, E.bite, 181)) cam = { p: [hp.x + 7, hp.y + 1.2, hp.z + 9], l: [hp.x - 6, hp.y + 1.5, hp.z], fov: 58 };
    if (win(t, 181, 185)) { const a2 = Apos(t); cam = { p: [a2[0] + 12, 5, a2[1] + 12], l: [a2[0], 2, a2[1]], fov: 55 }; }
    if (win(t, 185, 190)) { const q = L6.root.position; cam = { p: [q.x + 4, q.y + 2.5, q.z + 5], l: [q.x, q.y + 1, q.z], fov: 52 }; }
    if (win(t, 190, E.jump + 1.2)) { const a2 = Apos(t); cam = { p: [a2[0] + 3, 6, a2[1] - 14], l: [a2[0], 1.5, a2[1] - 4], fov: 55 }; }
    if (win(t, E.jump + 1.2, E.land)) { const f = glub.root.position; cam = { p: [R.p[0] - 4, 3.6, R.p[2] - 7], l: [(R.p[0] + f.x) / 2, 1, (R.p[2] + f.z) / 2], fov: 56 }; }
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
  const dawn = { top: '#2e4a8a', bot: '#ffb6a0', sunI: 1.5, hemiI: 1.1, fog: '#d8b0b8', sunEl: 0.1, sunAz: 0.3, near: 50, far: 200 };
  const fog_ = { top: '#9fb6c8', bot: '#dde8f0', sunI: 0.8, hemiI: 1.3, fog: '#d2e0ea', sunEl: 0.5, sunAz: 0.6, near: 12, far: 60 };
  const polar = { top: '#4aa8e8', bot: '#e8f6ff', sunI: 2.4, hemiI: 1.7, fog: '#dff0fb', sunEl: 0.55, sunAz: 0.9, near: 60, far: 240 };
  if (t < 12) return mix(dawn, day, ss(seg(t, 4, 12)));
  if (t < E.sail) return day;
  if (t < E.arrive) return mix(day, fog_, ss(seg(t, E.sail, E.sail + 7)));
  if (t < E.sink) return mix(fog_, polar, ss(seg(t, E.arrive, E.arrive + 6)));
  if (t < E.shore) return mix(polar, day, ss(seg(t, E.sink, E.shore)));
  return mix(day, sunset, ss(seg(t, 250, 285)));
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
  const hpv = t < E.slip ? 5 : t < E.steal ? 4.5 : t < E.crack ? 4 : t < E.land ? 3 : t < E.sink ? 3.5 : 2.5;
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 34; const fill = clamp(hpv - i, 0, 1);
    const shk = (t > E.crack && t < E.land) ? Math.sin(t * 40 + i) * 2 : 0;
    ctx.save(); ctx.translate(x, y + shk); ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(11, 0); ctx.lineTo(0, 14); ctx.lineTo(-11, 0); ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0d1b2a'; ctx.stroke();
    if (fill > 0) { ctx.save(); ctx.clip(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(-11, -14, 22 * fill, 28); ctx.fillStyle = '#c9fdff'; ctx.fillRect(-5, -9, 4 * fill, 6); ctx.restore(); } ctx.restore(); }
  for (let i = 0; i < 5; i++) { const x = 34 + i * 34, y = 70; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.arc(x, y, 10, 0, 7); ctx.fill(); ctx.fillStyle = (t > 240 && i > 3) ? '#7a4a2a' : '#ff9a2a'; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - 2, y - 11, 4, 5); }
  // day badge
  const night = false;
  rrect(W / 2 - 70, 14, 140, 34, 17); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill();
  outlined((night ? '☾ NIGHT 7' : '☀ DAY 7'), W / 2, 32, 18, night ? '#bcd0ff' : '#ffe066', '#000', 4);
  // hotbar of hex slots
  const slots = [['rod', 1], ['ice', t > 62 ? 24 : 0], ['boot', t > E.boot ? 1 : 0], ['fish', win(t, E.tiny, E.steal) ? 1 : 0], ['crown', 1], ['gold', t > E.win && t < E.melt + 5 ? 1 : 0], ['shard', 0]];
  let sel = 0; if (win(t, 62, E.win)) sel = 0; if (win(t, E.boot, E.boot + 7)) sel = 2; else if (win(t, E.tiny, E.steal)) sel = 3; else if (win(t, E.win, E.melt + 5)) sel = 5;
  const cx0 = W / 2 - 3 * 64, y = H - 44;
  for (let i = 0; i < 7; i++) { const x = cx0 + i * 64; hex(x, y, 30); ctx.fillStyle = 'rgba(15,20,40,.62)'; ctx.fill(); ctx.lineWidth = i === sel ? 5 : 3; ctx.strokeStyle = i === sel ? '#ffe066' : 'rgba(255,255,255,.5)'; ctx.stroke();
    const [it, n] = slots[i]; if (n > 0) { ICON[it](x, y - 2, 13); if (n > 1) outlined(String(n), x + 16, y + 16, 15, '#fff', '#000', 4); } }
  // xp-like shard bar
  rrect(cx0 - 30, H - 86, 6 * 64 + 60, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  // Frostbite Cup scoreboard
  if (win(t, E.start, E.sink)) { const mine = t < E.tiny ? 0 : t < E.steal ? 1 : t < E.land ? 0 : 99, best = t < E.land ? 6 : 99;
    rrect(22, 96, 196, 84, 12); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5ff7ff'; ctx.stroke();
    outlined('FROSTBITE CUP', 120, 116, 16, '#5ff7ff', '#000', 4);
    outlined('YOU', 40, 144, 18, '#fff', '#000', 3, 'left'); outlined(mine === 99 ? '1 BIG' : String(mine), 200, 144, 20, mine === 99 ? '#ffe066' : '#fff', '#000', 4, 'right');
    outlined('SEALS', 40, 166, 18, '#cfe0ff', '#000', 3, 'left'); outlined(best === 99 ? '—' : String(best), 200, 166, 20, '#cfe0ff', '#000', 4, 'right'); }
  // melt meter
  if (win(t, E.wet, E.sink + 4)) { const ice = iceAt(t), gx = 30, gy = 200, gh = 120;
    rrect(gx - 12, gy - 8, 24, gh + 16, 12); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ice < 0.35 && Math.floor(t * 6) % 2 ? '#ff2a4a' : '#0d1b2a'; ctx.stroke();
    const fh = gh * clamp(ice, 0, 1); rrect(gx - 6, gy + gh - fh, 12, fh, 6); ctx.fillStyle = ice < 0.35 ? '#ff6b6b' : '#9fdcf5'; ctx.fill();
    outlined('ICE', gx + 4, gy + gh + 22, 13, '#fff', '#000', 3); if (ice < 0.35) outlined('!!!', gx + 22, gy + 6 + Math.sin(t * 20) * 2, 20, '#ff2a4a', '#000', 4, 'left'); }
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
const TOASTS = [[E.makeEnd, '+1 Raft (not a house)', 'plank'], [E.boot + 0.6, '+1 Soggy Boot', 'boot'], [E.invoice, 'Invoice #007: 9 holes', 'plank'], [E.win + 0.4, '+1 Golden Fish', 'gold']];
const FEATS = [[E.drillEnd + 0.5, 'Perfectly Round', 'Let Bloop drill nine holes'], [E.reveal + 2, 'Stowaway', 'Find Puff in the bait bucket'], [E.jump + 1.5, 'Iceberg Water Ski', 'Get towed by a crowned fish'], [E.win + 1, 'Frostbite Champion', 'Win the Frostbite Cup']];
const POPS = [[E.poster + 0.3, 1.4, 'FROSTBITE CUP!', 0.5, 0.26, '#5ff7ff', 70], [E.slip + 0.3, 1.4, 'SPLIIITS', 0.5, 0.32, '#ffffff', 72], [E.drill + 1, 1.2, 'bzzzz', 0.45, 0.35, '#ffd400', 54],
  [E.start, 1.2, 'FISH!', 0.5, 0.3, '#ffe066', 80], [E.boot + 0.4, 1.4, 'a boot.', 0.5, 0.34, '#cfe0ff', 62], [E.cube + 0.4, 1.4, 'an ice cube.', 0.5, 0.34, '#bfe8ff', 58], [E.steal, 1.4, 'THIEF!', 0.55, 0.3, '#ff6b6b', 76],
  [E.wet + 0.4, 1.2, 'drip...', 0.42, 0.4, '#5aa8ff', 54], [E.reveal, 1.6, 'PUFF?!', 0.5, 0.28, '#ff8a1e', 92], [E.crack, 1.8, 'KRRRAK!', 0.5, 0.28, '#ffffff', 96], [E.race, 1.6, 'VROOOM', 0.5, 0.3, '#ffd400', 76],
  [E.bite, 2.0, 'GLUBZILLA!', 0.5, 0.26, '#2fa88c', 92], [187, 1.4, 'TRIPLE AXEL', 0.5, 0.3, '#5ff7ff', 64], [E.jump, 1.2, 'JUMP!', 0.5, 0.3, '#ffe066', 80], [E.land, 1.4, 'KA-THUMP', 0.5, 0.32, '#ffffff', 76],
  [E.win, 2.0, 'WINNER!', 0.5, 0.25, '#ffd23f', 96], [E.melt + 2, 1.4, 'drip. drip.', 0.5, 0.34, '#ffd23f', 60], [E.sink, 1.6, 'SPLOOSH', 0.5, 0.3, '#5aa8ff', 84], [E.bill + 1.2, 1.6, '2,000 LOGS', 0.5, 0.3, '#ff6b6b', 76]];

const ZOOMS = [[E.poster, 0.8, 1.15, 0.5, 0.5], [E.steal, 0.8, 1.2, 0.5, 0.5], [E.reveal, 1.0, 1.3, 0.5, 0.5], [E.crack, 1.0, 1.25, 0.5, 0.5], [E.bite, 1.2, 1.3, 0.5, 0.5], [E.land, 0.8, 1.2, 0.5, 0.5], [E.win, 1.0, 1.2, 0.5, 0.5], [E.sink, 1.0, 1.2, 0.5, 0.5], [E.bill + 1, 0.8, 1.15, 0.5, 0.5]];
const SHAKES = [[E.make, 9, 0.02], [E.drill, 14, 0.03], [E.slip, 0.8, 0.2], [E.crack, 3, 0.35], [E.crack + 3, 20, 0.05], [E.bite, 3, 0.3], [E.land, 1.2, 0.35], [E.sink, 4, 0.25]];
const FLASH = [[E.reveal, 0.3, '255,170,60'], [E.crack, 0.25, '255,255,255'], [E.win, 0.3, '255,230,120']];
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
    outlined('EPISODE 7', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE FROSTBITE CUP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it melts)', 70, H * 0.3 + 128, 20, '#ffe066', '#000', 4, 'left'); ctx.restore(); }
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
    outlined(i ? 'EP 8: BLOOP QUITS?!' : 'EP 6: THE VOLCANO', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(pay the invoice)' : '(it was not fine)', x + 110, y + 80, 14, '#fff', '#000', 3); }
  const c = track(t, [[E.logo + 3, W / 2 + 120, 0, H - 40], [296.2, W / 2 - 250, 0, H / 2 + 160], [300, W / 2 - 240, 0, H / 2 + 170]]).p; cursor(c[0], c[2], pressed);
  ctx.restore();
  ctx.fillStyle = `rgba(0,0,0,${seg(t, 299.3, 300)})`; ctx.fillRect(0, 0, W, H);
}

// ---------------------------------------------------------------- main
const SECS = [[0, E.sail, shore, 'shore'], [E.sail, E.shore, bergSet, 'berg'], [E.shore, 1e9, shore, 'shore']];
window.renderAt = function (T) {
  let t = T; const frozen = T >= E.freeze && T < E.logo; if (frozen) t = E.freeze;
  let sec = SECS.find(s => t >= s[0] && t < s[1]);
  for (const k in groups) groups[k].visible = false;
  groups[sec[3]].visible = true;
  hero.root.visible = true; hero.root.scale.setScalar(1);
  const res = sec[2].update(t);
  // sky + light
  const S = sky(t); const cave = res.cave;
  if (cave) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 30; scene.fog.far = 90; hemi.intensity = 0.5; hemi.color.set('#6a5aff'); hemi.groundColor.set('#201030'); sun.intensity = 0; }
  else { setSky(S.top, S.bot); scene.fog.color.set(S.fog); scene.fog.near = S.near; scene.fog.far = S.far; hemi.intensity = S.hemiI; hemi.color.set('#d6eeff'); hemi.groundColor.set(t > E.sail && t < E.sink ? '#9fc8e0' : '#6a7a4a'); sun.intensity = S.sunI; }
  const c = res.cam; const sh = shakeOffset(T);
  camera.position.set(c.p[0] + sh[0], c.p[1] + sh[1], c.p[2] + sh[2]); camera.lookAt(c.l[0] + sh[0] * 0.5, c.l[1] + sh[1] * 0.5, c.l[2]); camera.fov = c.fov; camera.updateProjectionMatrix();
  // sun & moons
  const night = false;
  const sv = placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunMesh); placeSky(S.sunAz, Math.max(S.sunEl, -0.2), sunGlow, 385);
  sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.sail + 4, E.arrive + 3);
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
  const panic = win(T, E.steal, E.steal + 2) || win(T, E.crack, E.mount) || win(T, E.bite, E.land) || win(T, E.sink, E.sink + 5);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, panic ? `rgba(160,0,0,${0.45 + 0.15 * Math.sin(T * 12)})` : (cave ? 'rgba(0,0,0,.7)' : 'rgba(0,0,0,.35)'));
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  for (const [s, d, col] of FLASH) if (T >= s && T < s + d) { const k = (T - s) / d; const a = col === '0,0,0' ? Math.sin(k * Math.PI) : (1 - k); ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(0, 0, W, H); }
  if (T < E.logo) {
    if (res.hud && !frozen && T > E.titleIn + 4.6) drawHUD(T, res);
    if (win(T, E.make, E.makeEnd) || win(T, E.drill, E.drillEnd)) { const bl = Math.floor(T * 2) % 2; rrect(26, H - 140, 214, 44, 10); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); outlined((bl ? '▶▶ ' : '▶  ') + 'TIMELAPSE x20', 133, H - 117, 22, '#ffe066', '#000', 4); }
    drawLog(T);
    for (const [s, title, icon] of TOASTS) if (win(T, s, s + 2.6)) { const k = ss(seg(T, s, s + 0.25)) * (1 - ss(seg(T, s + 2.3, s + 2.6))); const x = W - 250 + (1 - k) * 280, y = 186; rrect(x, y, 234, 52, 12); ctx.fillStyle = 'rgba(15,20,40,.85)'; ctx.fill(); ctx.strokeStyle = '#5ff7ff'; ctx.lineWidth = 3; ctx.stroke(); ICON[icon](x + 30, y + 26, 12); outlined(title, x + 54, y + 27, 15, '#fff', '#000', 3, 'left'); }
    for (const [s, title, sub] of FEATS) if (win(T, s, s + 3.6)) { const k = ss(seg(T, s, s + 0.35)) * (1 - ss(seg(T, s + 3.2, s + 3.6))); const y = -90 + k * 150; rrect(W / 2 - 230, y, 460, 76, 16); ctx.fillStyle = 'rgba(25,15,45,.92)'; ctx.fill(); ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 4; ctx.stroke();
      hex(W / 2 - 190, y + 38, 26); ctx.fillStyle = '#ffe066'; ctx.fill(); outlined('★', W / 2 - 190, y + 39, 26, '#8a5a00', '#ffe066', 1); outlined('FEAT UNLOCKED!', W / 2 - 150, y + 24, 16, '#ffe066', '#000', 3, 'left'); outlined(title, W / 2 - 150, y + 48, 22, '#fff', '#000', 4, 'left'); outlined(sub, W / 2 - 150, y + 66, 12, '#cfd8ff', '#000', 3, 'left'); }
    if (!frozen) for (const [s, d, txt, x, y, col, size] of POPS) if (win(T, s, s + d)) { const k = (T - s) / d; const sc = backOut(Math.min(1, k * 4)); ctx.save(); ctx.globalAlpha = 1 - ss((k - 0.75) / 0.25); ctx.translate(x * W, y * H - k * 20); ctx.rotate(Math.sin(s * 9) * 0.15); ctx.scale(sc, sc); outlined(txt, 0, 0, size, col, '#000', size / 6); ctx.restore(); }
    if (win(T, 9999, 9999)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    if (win(T, E.poster, E.posterEnd)) { const k = ss(seg(T, E.poster, E.poster + 0.35)) * (1 - ss(seg(T, E.posterEnd - 0.35, E.posterEnd)));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.5, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
      ctx.fillStyle = '#f2fbff'; ctx.fillRect(-230, -175, 460, 350); ctx.fillStyle = '#1b2a6a'; ctx.fillRect(-230, -175, 460, 60);
      outlined('FROSTBITE CUP', 0, -145, 34, '#ffffff', '#1b2a6a', 3); ICON.fish(0, -60, 34);
      const rows = [[0.8, 'Biggest fish wins'], [1.8, 'Prize: SOLID GOLD FISH'], [2.8, 'Iceberg. Today. Bring a rod.'], [3.8, 'No houses. Fishing only.']];
      rows.forEach(([d, txt], i) => { if (T < E.poster + d) return; outlined(txt, 0, 10 + i * 42, i === 1 ? 24 : 20, i === 1 ? '#c08a00' : '#1b2a6a', '#f2fbff', 3); });
      ctx.restore(); }
    stamp(T, E.win + 1.6, 'FROSTBITE CHAMPION');
    if (frozen) { const k = ss(seg(T, E.freeze + 0.15, E.freeze + 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.lineWidth = 14; ctx.strokeStyle = '#fff'; ctx.strokeRect(7, 7, W - 14, H - 14);
      ctx.translate(W * 0.25, H * 0.22); ctx.rotate(-0.08); outlined('yep. it melted.', 0, 0, 72, '#fff', '#000', 12); ctx.restore();
      const k2 = ss(seg(T, E.freeze + 1.0, E.freeze + 1.4)); ctx.save(); ctx.globalAlpha = k2; outlined("that's me. soggy again.", W * 0.72, H * 0.62, 36, '#ffe066', '#000', 7);
      ctx.strokeStyle = '#ffe066'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(W * 0.68, H * 0.57); ctx.lineTo(W * 0.62, H * 0.47); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.62, H * 0.53); ctx.moveTo(W * 0.62, H * 0.47); ctx.lineTo(W * 0.66, H * 0.49); ctx.stroke(); ctx.restore();
      const k3 = ss(seg(T, E.freeze + 2.2, E.freeze + 2.6)); ctx.save(); ctx.globalAlpha = k3; outlined('(Bloop wants his money)', W * 0.27, H * 0.74, 24, '#fff', '#000', 5); ctx.restore(); }
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
