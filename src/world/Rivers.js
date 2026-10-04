import { splineSample, segDist, smoothstep } from '../core/MathUtil.js';

const CELL = 64;
const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

/**
 * Rivers are smooth polylines with a monotonically falling water level so water
 * always flows downhill. Terrain is carved around them (see Terrain.heightAt).
 */
export class RiverNetwork {
  constructor(defs, terrain) {
    this.rivers = [];
    this.grid = new Map();
    this._tmp = { d: 0, t: 0, x: 0, z: 0 };
    for (const def of defs) this._build(def, terrain);
  }

  _build(def, terrain) {
    let pts = splineSample(def.pts, 4);
    const n = pts.length;
    const base = new Float32Array(n);
    for (let i = 0; i < n; i++) base[i] = terrain.baseHeight(pts[i][0], pts[i][1], false);
    // smoothed profile (heavy: rivers do not follow every little bump)
    const sm = new Float32Array(n);
    const W = 36;
    for (let i = 0; i < n; i++) {
      let s = 0, c = 0;
      for (let k = -W; k <= W; k++) { const j = Math.min(n - 1, Math.max(0, i + k)); s += base[j]; c++; }
      sm[i] = s / c;
    }
    // flow towards the lower end
    if (sm[0] < sm[n - 1]) { pts = pts.reverse(); sm.reverse(); }
    const level = new Float32Array(n);
    let lv = sm[0] - 1.6;
    for (let i = 0; i < n; i++) {
      lv = Math.min(lv - 0.0006 * 4, sm[i] - 1.6);
      level[i] = lv;
    }
    const x = new Float32Array(n), z = new Float32Array(n), s = new Float32Array(n);
    let acc = 0;
    for (let i = 0; i < n; i++) {
      x[i] = pts[i][0]; z[i] = pts[i][1];
      if (i > 0) acc += Math.hypot(x[i] - x[i - 1], z[i] - z[i - 1]);
      s[i] = acc;
    }
    const river = { id: def.id, name: def.name, half: def.half || 4, n, x, z, s, level, length: acc, idx: this.rivers.length };
    this.rivers.push(river);
    // spatial hash
    const R = river.half + 100;
    for (let i = 0; i < n - 1; i++) {
      const minx = Math.min(x[i], x[i + 1]) - R, maxx = Math.max(x[i], x[i + 1]) + R;
      const minz = Math.min(z[i], z[i + 1]) - R, maxz = Math.max(z[i], z[i + 1]) + R;
      for (let cx = Math.floor(minx / CELL); cx <= Math.floor(maxx / CELL); cx++) {
        for (let cz = Math.floor(minz / CELL); cz <= Math.floor(maxz / CELL); cz++) {
          const k = ck(cx, cz);
          let a = this.grid.get(k);
          if (!a) { a = []; this.grid.set(k, a); }
          a.push((river.idx << 20) | i);
        }
      }
    }
  }

  /**
   * Nearest river to (x,z). Writes {d, level, half, river} into out and returns true
   * if a river is within influence range.
   */
  influence(x, z, out) {
    const list = this.grid.get(ck(Math.floor(x / CELL), Math.floor(z / CELL)));
    if (!list) return false;
    let best = 1e9, bi = -1, br = null, bt = 0;
    const tmp = this._tmp;
    for (let k = 0; k < list.length; k++) {
      const v = list[k];
      const r = this.rivers[v >> 20], i = v & 0xfffff;
      segDist(x, z, r.x[i], r.z[i], r.x[i + 1], r.z[i + 1], tmp);
      if (tmp.d < best) { best = tmp.d; bi = i; br = r; bt = tmp.t; }
    }
    if (!br) return false;
    out.d = best;
    out.river = br;
    out.half = br.half;
    out.level = br.level[bi] + (br.level[bi + 1] - br.level[bi]) * bt;
    out.i = bi; out.t = bt;
    return true;
  }

  /** Distance from point to nearest river centreline (Infinity if none nearby). */
  distance(x, z) {
    const o = this._o || (this._o = {});
    return this.influence(x, z, o) ? o.d : Infinity;
  }

  /** Water level at position if standing in the channel, else NaN. */
  waterLevelAt(x, z) {
    const o = this._o2 || (this._o2 = {});
    if (!this.influence(x, z, o)) return NaN;
    return o.d < o.half * 1.1 ? o.level : NaN;
  }
}
void smoothstep;
