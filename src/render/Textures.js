import * as THREE from 'three';
import { Rng } from '../core/Noise.js';

// All textures are generated procedurally on a canvas at start-up: no asset downloads,
// no loading screens, and the game stays a few hundred KB.

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

function tile(c, { repeat = true, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.needsUpdate = true;
  return t;
}

// tileable value noise on a lattice of `period` cells
function makeTileNoise(size, period, seed) {
  const r = new Rng(seed);
  const g = new Float32Array(period * period);
  for (let i = 0; i < g.length; i++) g[i] = r.next();
  const at = (x, y) => g[((y % period + period) % period) * period + ((x % period + period) % period)];
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * period, fy = (y / size) * period;
      const ix = Math.floor(fx), iy = Math.floor(fy);
      let tx = fx - ix, ty = fy - iy;
      tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
      const a = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * tx;
      const b = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * tx;
      out[y * size + x] = a + (b - a) * ty;
    }
  }
  return out;
}

/** R = fine detail, G = macro variation, B = micro grain. Mean ≈ 0.5. */
export function makeDetailTexture() {
  const S = 256;
  const c = canvas(S, S), ctx = c.getContext('2d', { willReadFrequently: true });
  const img = ctx.createImageData(S, S);
  const layers = [[16, 1], [32, 2], [64, 3]].map(([p, s]) => makeTileNoise(S, p, 100 + s));
  const fine = makeTileNoise(S, 8, 7), coarse = makeTileNoise(S, 4, 9), grain = makeTileNoise(S, 128, 5);
  for (let i = 0; i < S * S; i++) {
    const R = fine[i] * 0.45 + layers[0][i] * 0.3 + layers[1][i] * 0.25;
    const G = coarse[i] * 0.6 + layers[0][i] * 0.4;
    const B = grain[i] * 0.6 + layers[2][i] * 0.4;
    img.data[i * 4] = R * 255; img.data[i * 4 + 1] = G * 255; img.data[i * 4 + 2] = B * 255; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return tile(c, { srgb: false });
}

/**
 * Road surface strip. u across (shoulder | lane | lane | shoulder), v along (6 m / repeat).
 * Alpha is used (alphaTest) to give the gravel verge a ragged organic edge.
 */
export function makeRoadTexture({ width, shoulder, centre = 'dash', edges = true, base = 0x4a4b4d, seed = 3 }) {
  const PXM = 40; // pixels per metre across
  const total = width + shoulder * 2;
  const W = Math.round(total * PXM), H = 512; // 6 m along
  const c = canvas(W, H), ctx = c.getContext('2d', { willReadFrequently: true });
  const r = new Rng(seed);
  const mPerPxV = 6 / H;
  // verge (gravel), full strip
  ctx.fillStyle = '#8a8579';
  ctx.fillRect(0, 0, W, H);
  // asphalt body
  const sx = shoulder * PXM, aw = width * PXM;
  const grad = ctx.createLinearGradient(sx, 0, sx + aw, 0);
  const b = new THREE.Color(base).getStyle();
  grad.addColorStop(0, b); grad.addColorStop(1, b);
  ctx.fillStyle = grad;
  ctx.fillRect(sx, 0, aw, H);
  // wheel track wear (two darker bands in each lane)
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#202022';
  for (const f of [0.25, 0.75]) {
    for (const o of [-0.62, 0.62]) {
      ctx.fillRect(sx + aw * f + o * PXM - 0.45 * PXM, 0, 0.9 * PXM, H);
    }
  }
  ctx.globalAlpha = 1;
  // aggregate speckle
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < W * H; i++) {
    const n = (r.next() - 0.5) * 34;
    img.data[i * 4] += n; img.data[i * 4 + 1] += n; img.data[i * 4 + 2] += n;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  // cracks / patches
  ctx.strokeStyle = 'rgba(20,20,22,0.55)'; ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    let x = sx + r.next() * aw, y = r.next() * H;
    ctx.beginPath(); ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (r.next() - 0.5) * 18; y += r.next() * 22; ctx.lineTo(x, y); }
    ctx.stroke();
  }
  // markings
  ctx.fillStyle = '#d9d6c6';
  if (centre === 'dash') {
    ctx.globalAlpha = 0.92;
    ctx.fillRect(W / 2 - 0.07 * PXM, 40, 0.14 * PXM, (2 / 6) * H);
  } else if (centre === 'solid') {
    ctx.globalAlpha = 0.9; ctx.fillRect(W / 2 - 0.06 * PXM, 0, 0.12 * PXM, H);
  }
  if (edges) {
    ctx.globalAlpha = 0.85;
    ctx.fillRect(sx + 0.22 * PXM, 0, 0.11 * PXM, H);
    ctx.fillRect(sx + aw - 0.33 * PXM, 0, 0.11 * PXM, H);
  }
  ctx.globalAlpha = 1;
  // ragged verge edge via alpha
  const id = ctx.getImageData(0, 0, W, H);
  for (let y = 0; y < H; y++) {
    const jl = (Math.sin(y * 0.09) + Math.sin(y * 0.031 + 2)) * 0.25 + r.next() * 0.2;
    for (let x = 0; x < W; x++) {
      const dEdge = Math.min(x, W - 1 - x) / PXM; // metres from outer edge
      const a = dEdge < 0.18 + jl * 0.35 ? 0 : 255;
      id.data[(y * W + x) * 4 + 3] = a;
    }
  }
  ctx.putImageData(id, 0, 0);
  const t = tile(c, { aniso: 16 });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.userData.width = total;
  return t;
}

/** Dirt track: ruts, grass hump in the middle, ragged edges (alpha). */
export function makeDirtTexture({ width, trail = false, seed = 9 }) {
  const PXM = 48;
  const W = Math.round((width + 1.0) * PXM), H = 512;
  const c = canvas(W, H), ctx = c.getContext('2d', { willReadFrequently: true });
  const r = new Rng(seed);
  const img = ctx.createImageData(W, H);
  const n1 = makeTileNoise(512, 16, seed);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const u = (x / W - 0.5) * (width + 1.0); // metres from centre
      const au = Math.abs(u);
      const edge = width / 2 - au;
      const noise = n1[(y % 512) * 512 + (x % 512)];
      // base dirt
      let R = 122, G = 98, B = 70;
      const rut = !trail ? Math.exp(-Math.pow((au - 0.62) / 0.28, 2)) : 0;
      const hump = !trail ? Math.exp(-Math.pow(u / 0.32, 2)) : 0;
      const k = 0.75 + noise * 0.5;
      R *= k; G *= k; B *= k;
      // ruts darker/damper
      R *= 1 - rut * 0.25; G *= 1 - rut * 0.25; B *= 1 - rut * 0.2;
      // grass hump
      R = R * (1 - hump * 0.7) + 82 * hump * 0.7; G = G * (1 - hump * 0.7) + 112 * hump * 0.7; B = B * (1 - hump * 0.7) + 48 * hump * 0.7;
      // edge blending to grass
      const e = Math.max(0, Math.min(1, edge / 0.55));
      R = R * e + 88 * (1 - e); G = G * e + 112 * (1 - e); B = B * e + 52 * (1 - e);
      // pebbles
      const p = (r.next() > 0.995) ? 40 : 0;
      const i = (y * W + x) * 4;
      img.data[i] = R + p; img.data[i + 1] = G + p; img.data[i + 2] = B + p;
      const ragged = (noise - 0.5) * 0.7 + Math.sin(y * 0.07 + x * 0.01) * 0.05;
      img.data[i + 3] = edge + ragged > 0.02 ? 255 : 0;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = tile(c, { aniso: 16 });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.userData.width = width + 1.0;
  return t;
}

const signCache = new Map();
/** Painted sign face. kind: wood | road | shop. */
export function makeSignTexture(lines, kind = 'wood', size = [512, 256]) {
  const key = kind + '|' + lines.join('|');
  if (signCache.has(key)) return signCache.get(key);
  const [W, H] = size;
  const c = canvas(W, H), ctx = c.getContext('2d', { willReadFrequently: true });
  const palette = {
    wood: ['#6a4a2b', '#f1e6c9', '#3a2713'],
    road: ['#1f5b3a', '#ffffff', '#ffffff'],
    shop: ['#f2efe6', '#7a1f1f', '#4a1010'],
    bus: ['#1b4e9b', '#ffffff', '#ffffff'],
    home: ['#4a3a2a', '#f3e6c0', '#2a1d10'],
    stop: ['#b3201a', '#ffffff', '#ffffff'],
  }[kind] || ['#6a4a2b', '#f1e6c9', '#3a2713'];
  ctx.fillStyle = palette[0]; ctx.fillRect(0, 0, W, H);
  if (kind === 'wood') {
    ctx.globalAlpha = 0.18;
    const r = new Rng(5);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = r.next() > 0.5 ? '#000' : '#fff'; ctx.fillRect(0, r.next() * H, W, 1 + r.next() * 2); }
    ctx.globalAlpha = 1;
  }
  ctx.strokeStyle = palette[1]; ctx.lineWidth = 8; ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.fillStyle = palette[1]; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const fs = Math.min(64, Math.floor((H - 40) / lines.length) - 8);
  ctx.font = `bold ${fs}px "Trebuchet MS", Verdana, sans-serif`;
  lines.forEach((ln, i) => ctx.fillText(ln, W / 2, H / 2 + (i - (lines.length - 1) / 2) * (fs + 10), W - 50));
  const t = tile(c, { repeat: false, aniso: 8 });
  signCache.set(key, t);
  return t;
}

export function makeMoonTexture() {
  const S = 256;
  const c = canvas(S, S), ctx = c.getContext('2d', { willReadFrequently: true });
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.1, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,248,1)'); g.addColorStop(0.9, 'rgba(235,238,245,1)'); g.addColorStop(1, 'rgba(235,238,245,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2); ctx.fill();
  const r = new Rng(77);
  ctx.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 26; i++) {
    const x = r.next() * S, y = r.next() * S, rad = 6 + r.next() * 26;
    ctx.fillStyle = `rgba(120,125,140,${0.10 + r.next() * 0.16})`;
    ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
  }
  return tile(c, { repeat: false });
}

export function makeGlowTexture() {
  const S = 128;
  const c = canvas(S, S), ctx = c.getContext('2d', { willReadFrequently: true });
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return tile(c, { repeat: false });
}

/** Railway ballast bed with sleepers and two steel rails (the rails also get real geometry). */
export function makeRailTexture({ width = 4.2, seed = 21 }) {
  const PXM = 48;
  const W = Math.round(width * PXM), H = 512;
  const c = canvas(W, H), ctx = c.getContext('2d', { willReadFrequently: true });
  const r = new Rng(seed);
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x / W - 0.5) * width, au = Math.abs(u);
    const n = 105 + r.next() * 60;
    const edge = Math.max(0, Math.min(1, (width / 2 - 0.12 - au) / 0.5));
    const i = (y * W + x) * 4;
    img.data[i] = n * 0.95; img.data[i + 1] = n * 0.93; img.data[i + 2] = n * 0.9;
    img.data[i + 3] = au < width / 2 - 0.1 - (r.next() * 0.25) ? 255 : 0;
    void edge;
  }
  ctx.putImageData(img, 0, 0);
  // sleepers every 0.6 m (6 m tile -> 10 sleepers)
  ctx.fillStyle = 'rgba(70,52,38,0.95)';
  for (let k = 0; k < 10; k++) {
    const y0 = (k / 10) * H + 6;
    ctx.fillRect(W / 2 - 1.3 * PXM, y0, 2.6 * PXM, 0.24 * PXM);
  }
  const t = tile(c, { aniso: 16 });
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.userData.width = width;
  return t;
}

/** Soft round contact-shadow decal (ambient occlusion under trees and buildings). */
export function makeAOTexture() {
  const S = 128;
  const c = canvas(S, S), ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, 2, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(0.45, 'rgba(0,0,0,0.38)'); g.addColorStop(0.8, 'rgba(0,0,0,0.1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
  return tile(c, { repeat: false, srgb: false });
}
