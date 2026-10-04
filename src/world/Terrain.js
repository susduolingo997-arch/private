import * as THREE from 'three';
import { fbm, noise2, ridged } from '../core/Noise.js';
import { smoothstep, lerp, clamp } from '../core/MathUtil.js';
import { FORESTS, FIELDS, VALLEY, START, HILLS } from './WorldDef.js';

const CELL = 40;
const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

/** Level building pads (flat ground under houses, farmyards…). */
export class PadIndex {
  constructor() { this.grid = new Map(); this.pads = []; }
  add(x, z, r, y, fall = 6) {
    const p = { x, z, r, y, fall };
    this.pads.push(p);
    const R = r + fall;
    for (let cx = Math.floor((x - R) / CELL); cx <= Math.floor((x + R) / CELL); cx++) {
      for (let cz = Math.floor((z - R) / CELL); cz <= Math.floor((z + R) / CELL); cz++) {
        const k = ck(cx, cz);
        let a = this.grid.get(k);
        if (!a) { a = []; this.grid.set(k, a); }
        a.push(p);
      }
    }
  }
  apply(x, z, h) {
    const a = this.grid.get(ck(Math.floor(x / CELL), Math.floor(z / CELL)));
    if (!a) return h;
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      const d = Math.hypot(x - p.x, z - p.z);
      if (d < p.r + p.fall) h = lerp(h, p.y, 1 - smoothstep(p.r, p.r + p.fall, d));
    }
    return h;
  }
}

// Linear-space ground palette
const col = (hex) => new THREE.Color(hex);
const PAL = {
  meadowA: col(0x5b7a30), meadowB: col(0x7b8d3a), meadowDry: col(0xa39b55),
  forestFloor: col(0x45552a), forestDark: col(0x34441f),
  dirt: col(0x7b6446), gravel: col(0x8a8478), mud: col(0x5b4630),
  rock: col(0x77746c), rockDark: col(0x55524c), snow: col(0xe8eef2), sand: col(0xb2a780),
  wheat: col(0xc8a845), barley: col(0x93a43e), plowed: col(0x6b4a30), hay: col(0xb9aa52), pasture: col(0x6c9535),
};

/**
 * The shape of the land. heightAt() is a pure function of (x,z): the same call gives
 * the same answer whether a chunk is loaded or not — which is what makes streaming
 * seamless and the world physically continuous.
 */
export class Terrain {
  constructor() {
    this.roads = null; this.rivers = null; this.pads = new PadIndex();
    this._ri = {}; this._rv = {};
    this.fields = FIELDS.map((f) => ({ ...f, c: Math.cos(f.ang), s: Math.sin(f.ang) }));
    this.forests = FORESTS.map((f) => ({ ...f, c: Math.cos(f.ang), s: Math.sin(f.ang) }));
    this._fo = { field: null, edge: 0 };
    this.seaLevel = 20;
  }

  attach(roads, rivers) { this.roads = roads; this.rivers = rivers; }

  /** Natural landform only: no roads, rivers or pads. */
  baseHeight(x, z, detail = true, far = false) {
    const cont = fbm(x * 0.00018 + 11, z * 0.00018 + 5, 3, 11);
    const hills = fbm(x * 0.0013, z * 0.0013, far ? 3 : 4, 23);
    let h = 52 + cont * 26 + hills * 20 + fbm(x * 0.0042 + 31, z * 0.0042 - 17, 3, 29) * 8;
    if (detail) h += fbm(x * 0.011, z * 0.011, 3, 41) * 1.3 + noise2(x * 0.08, z * 0.08, 5) * 0.14;
    for (let i = 0; i < HILLS.length; i++) {
      const hl = HILLS[i];
      const ex = x - hl.x, ez = z - hl.z;
      const q = (ex * ex + ez * ez) / (hl.r * hl.r);
      if (q < 9) h += hl.h * Math.exp(-q) * (1 + 0.12 * noise2(x * 0.01, z * 0.01, 71));
    }
    const dx = x - VALLEY.x, dz = z - VALLEY.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const m = smoothstep(1900, 5200, dist) * smoothstep(-0.3, 0.3, fbm(x * 0.00035 + 3, z * 0.00035 + 9, 2, 77));
    if (m > 0.001) {
      const r = ridged(x * 0.00055, z * 0.00055, far ? 4 : 5, 91);
      h += m * (r * r * 560 + r * 90);
    }
    return h;
  }

  heightNoPads(x, z) {
    let h = this.baseHeight(x, z, true);
    if (this.rivers && this.rivers.influence(x, z, this._rv)) {
      const rv = this._rv, half = rv.half, d = rv.d;
      const vw = 1 - smoothstep(half + 10, half + 95, d);
      if (vw > 0) {
        let T;
        if (d < half) {
          const u = d / half;
          T = rv.level - 1.5 * (1 - u * u);
        } else {
          T = rv.level + 0.9 * smoothstep(half, half + 7, d) + 0.03 * Math.max(0, d - half - 7);
        }
        h = lerp(h, T, vw);
      }
    }
    if (this.roads) {
      const ri = this.roads.influence(x, z, this._ri);
      if (ri.w > 0) h = lerp(h, ri.elev, ri.w);
      h += ri.ditch;
    }
    return h;
  }

  heightAt(x, z) {
    return this.pads.apply(x, z, this.heightNoPads(x, z));
  }

  slopeAt(x, z) {
    const e = 1.2;
    const dx = (this.heightAt(x + e, z) - this.heightAt(x - e, z)) / (2 * e);
    const dz = (this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e);
    return Math.sqrt(dx * dx + dz * dz);
  }

  /** Field containing (x,z): returns {field, edge} (edge = metres inside the border) or null. */
  fieldAt(x, z) {
    for (let i = 0; i < this.fields.length; i++) {
      const f = this.fields[i];
      const dx = x - f.cx, dz = z - f.cz;
      const u = dx * f.c + dz * f.s, v = -dx * f.s + dz * f.c;
      const ex = f.hw - Math.abs(u), ez = f.hd - Math.abs(v);
      if (ex > 0 && ez > 0) { this._fo.field = f; this._fo.edge = Math.min(ex, ez); this._fo.u = u; this._fo.v = v; return this._fo; }
    }
    return null;
  }

  /** 0..1 tree cover. */
  forestDensity(x, z) {
    let d = 0;
    const edge = fbm(x * 0.012, z * 0.012, 2, 61) * 0.2;
    for (let i = 0; i < this.forests.length; i++) {
      const f = this.forests[i];
      const dx = x - f.cx, dz = z - f.cz;
      if (Math.abs(dx) > f.rx * 1.4 || Math.abs(dz) > f.rx * 1.4) continue;
      const u = dx * f.c + dz * f.s, v = -dx * f.s + dz * f.c;
      const q = Math.sqrt((u / f.rx) * (u / f.rx) + (v / f.rz) * (v / f.rz)) + edge;
      d = Math.max(d, (1 - smoothstep(0.62, 1.0, q)) * f.density);
    }
    // ambient woodland, kept away from the start so the opening is open countryside
    const n = fbm(x * 0.0019 + 50, z * 0.0019 - 20, 3, 5);
    const away = smoothstep(150, 420, Math.hypot(x - START.x, z - START.z));
    d = Math.max(d, smoothstep(0.1, 0.4, n) * 0.9 * away);
    return d;
  }

  /** Ground colour into `out` (linear RGB) plus surface weights. */
  colorAt(x, z, h, slope, out, aux) {
    const n1 = fbm(x * 0.006, z * 0.006, 3, 3);
    const n2 = noise2(x * 0.09, z * 0.09, 8);
    const c = out;
    c.copy(PAL.meadowA).lerp(PAL.meadowB, clamp(n1 * 0.9 + 0.5, 0, 1));
    c.multiplyScalar(0.86 + 0.28 * clamp(fbm(x * 0.021 + 5, z * 0.021 - 3, 2, 52) * 0.8 + 0.5, 0, 1));
    c.lerp(PAL.meadowDry, clamp(fbm(x * 0.0021 + 7, z * 0.0021 + 2, 2, 19) * 1.2 - 0.2, 0, 0.55));
    const fd = this.forestDensity(x, z);
    if (fd > 0.01) c.lerp(PAL.forestFloor, Math.min(1, fd * 1.3)).lerp(PAL.forestDark, clamp(n1 + 0.2, 0, 1) * fd * 0.4);
    aux.field = 0; aux.angle = 0; aux.rock = 0; aux.dirt = 0;
    const fo = this.fieldAt(x, z);
    if (fo) {
      const w = smoothstep(0, 2.5, fo.edge);
      const k = fo.field.kind;
      const fc = k === 'wheat' ? PAL.wheat : k === 'barley' ? PAL.barley : k === 'plowed' ? PAL.plowed : k === 'hay' ? PAL.hay : PAL.pasture;
      c.lerp(fc, w);
      if (k !== 'pasture') { aux.field = w; aux.angle = fo.field.ang + (k === 'plowed' ? 0.0 : 0.0); }
      if (k === 'plowed') aux.field = w * 1.4;
    }
    // slope & altitude: rock and snow
    const rockW = smoothstep(0.55, 0.95, slope) + smoothstep(260, 420, h) * 0.5;
    if (rockW > 0) { c.lerp(PAL.rock, clamp(rockW, 0, 1)).multiplyScalar(0.85 + n2 * 0.12); aux.rock = clamp(rockW, 0, 1); }
    const snowW = smoothstep(620, 780, h + n1 * 40) * (1 - smoothstep(0.7, 1.1, slope) * 0.6);
    if (snowW > 0) c.lerp(PAL.snow, snowW);
    // river banks: gravel / mud
    if (this.rivers && this.rivers.influence(x, z, this._rv)) {
      const rv = this._rv;
      const bank = 1 - smoothstep(rv.half * 0.9, rv.half + 3.2, rv.d);
      if (bank > 0) c.lerp(h < rv.level + 0.15 ? PAL.mud : PAL.gravel, bank * 0.9);
    }
    // roads: gravel verge / dirt under the ribbon
    if (this.roads) {
      const ri = this.roads.influence(x, z, this._ri);
      if (ri.road) {
        const r = ri.road;
        const flat = r.width / 2 + r.shoulder;
        const verge = 1 - smoothstep(r.width / 2 - 0.3, flat + (r.surface === 'dirt' ? 0.2 : 1.2), ri.d);
        if (verge > 0) {
          c.lerp(r.surface === 'dirt' ? PAL.dirt : PAL.gravel, verge * (r.surface === 'dirt' ? 0.95 : 0.75));
          aux.dirt = verge;
        }
      }
    }
    // pads: bare earth under buildings
    c.multiplyScalar(0.92 + n2 * 0.1);
    return c;
  }

  /** Cheap approximate colour for the far-away terrain ring. */
  farColor(x, z, h, slope, out) {
    const fd = this.forestDensity(x, z);
    out.copy(PAL.meadowB).lerp(PAL.meadowDry, clamp(fbm(x * 0.0021 + 7, z * 0.0021 + 2, 2, 19) * 1.2 - 0.2, 0, 0.55));
    const fo = this.fieldAt(x, z);
    if (fo) {
      const k = fo.field.kind;
      out.lerp(k === 'wheat' ? PAL.wheat : k === 'barley' ? PAL.barley : k === 'plowed' ? PAL.plowed : k === 'hay' ? PAL.hay : PAL.pasture, 0.8);
    }
    out.lerp(PAL.forestDark, Math.min(1, fd * 1.25));
    const rockW = smoothstep(0.5, 0.9, slope) + smoothstep(260, 420, h) * 0.5;
    out.lerp(PAL.rock, clamp(rockW, 0, 1));
    const snowW = smoothstep(640, 800, h) * 0.9;
    out.lerp(PAL.snow, snowW);
    return out;
  }
}
