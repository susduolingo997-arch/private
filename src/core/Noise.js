// Deterministic noise + RNG helpers. Everything in the world is a pure function of
// (x, z, seed) so any region can be (re)generated at any time without stored state —
// this is what lets chunks stream in and out invisibly.

export function hash2(ix, iz, seed = 0) {
  let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iz | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Small fast seeded RNG (mulberry32)
export class Rng {
  constructor(seed = 1) { this.s = seed >>> 0; }
  next() {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  range(a, b) { return a + (b - a) * this.next(); }
  int(a, b) { return Math.floor(this.range(a, b + 1)); }
  pick(arr) { return arr[Math.floor(this.next() * arr.length) % arr.length]; }
  chance(p) { return this.next() < p; }
}

const GX = new Float32Array(256), GZ = new Float32Array(256);
(function initGrad() {
  const r = new Rng(1337);
  for (let i = 0; i < 256; i++) {
    const a = r.next() * Math.PI * 2;
    GX[i] = Math.cos(a); GZ[i] = Math.sin(a);
  }
})();

function gradIdx(ix, iz, seed) {
  return (hash2(ix, iz, seed) * 256) | 0;
}

const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);

/** 2D gradient noise, roughly in [-1, 1]. */
export function noise2(x, z, seed = 0) {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const g00 = gradIdx(ix, iz, seed), g10 = gradIdx(ix + 1, iz, seed);
  const g01 = gradIdx(ix, iz + 1, seed), g11 = gradIdx(ix + 1, iz + 1, seed);
  const n00 = GX[g00] * fx + GZ[g00] * fz;
  const n10 = GX[g10] * (fx - 1) + GZ[g10] * fz;
  const n01 = GX[g01] * fx + GZ[g01] * (fz - 1);
  const n11 = GX[g11] * (fx - 1) + GZ[g11] * (fz - 1);
  const u = fade(fx), v = fade(fz);
  const a = n00 + (n10 - n00) * u;
  const b = n01 + (n11 - n01) * u;
  return (a + (b - a) * v) * 1.41;
}

/** Fractal Brownian motion, roughly in [-1, 1]. */
export function fbm(x, z, octaves = 4, seed = 0, lac = 2.03, gain = 0.5) {
  let amp = 1, sum = 0, norm = 0, fx = x, fz = z;
  for (let i = 0; i < octaves; i++) {
    sum += noise2(fx, fz, seed + i * 31) * amp;
    norm += amp;
    amp *= gain;
    // rotate + scale the domain each octave to avoid axis-aligned artefacts
    const nx = fx * 0.8 - fz * 0.6, nz = fx * 0.6 + fz * 0.8;
    fx = nx * lac; fz = nz * lac;
  }
  return sum / norm;
}

/** Ridged multifractal, in [0, 1]; sharp crests — mountains. */
export function ridged(x, z, octaves = 5, seed = 0) {
  let amp = 0.5, sum = 0, fx = x, fz = z, w = 1;
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(noise2(fx, fz, seed + i * 17));
    n *= n;
    n *= w;
    w = Math.min(1, Math.max(0, n * 1.6));
    sum += n * amp;
    amp *= 0.5;
    const nx = fx * 0.8 - fz * 0.6, nz = fx * 0.6 + fz * 0.8;
    fx = nx * 2.1; fz = nz * 2.1;
  }
  return Math.min(1, sum * 1.15);
}

export const noise1 = (t, seed = 0) => noise2(t, 0.371 + seed * 7.13, seed);
