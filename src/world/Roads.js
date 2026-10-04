import { splineSample, segDist, smoothstep, lerp } from '../core/MathUtil.js';

const CELL = 32;
const ck = (cx, cz) => (cx + 32768) * 65536 + (cz + 32768);

/**
 * Road/path network. Each road is a smooth polyline with its own elevation profile
 * (a smoothed copy of the terrain so roads follow the land with gentle gradients).
 * The terrain flattens itself toward the road profile; ribbons draw the surface.
 */
export class RoadNetwork {
  constructor(defs, types, terrain) {
    this.roads = [];
    this.byId = {};
    this.grid = new Map();
    this.bridges = [];
    this._tmp = { d: 0, t: 0, x: 0, z: 0 };
    const pre = [];
    for (const def of defs) {
      const t = types[def.type];
      const r = { id: def.id, name: def.name, type: def.type, ...t, width: def.width || t.width, idx: pre.length };
      const pts = splineSample(def.pts, 3);
      r.n = pts.length;
      r.x = new Float32Array(r.n); r.z = new Float32Array(r.n);
      r.s = new Float32Array(r.n); r.elev = new Float32Array(r.n); r.bridge = new Float32Array(r.n);
      for (let i = 0; i < r.n; i++) { r.x[i] = pts[i][0]; r.z[i] = pts[i][1]; }
      r.def = def;
      r.trim0 = 0; r.trim1 = 0;
      pre.push(r);
      this.byId[r.id] = r;
    }
    this.roads = pre;
    // snap joining ends onto the parent road
    for (const r of this.roads) {
      if (r.def.joinStart) this._snap(r, 0, this.byId[r.def.joinStart]);
      if (r.def.joinEnd) this._snap(r, r.n - 1, this.byId[r.def.joinEnd]);
      this._lengths(r);
    }
    for (const r of this.roads) this._elevation(r, terrain);
    // railways meet roads at level crossings: blend the track onto the road's height there
    for (const r of this.roads) if (r.type === 'rail') for (const o of this.roads) if (o.type !== 'rail') this._crossing(r, o);
    // junction elevation matching (branch adopts parent's height at the join)
    for (const r of this.roads) {
      if (r.def.joinStart) this._match(r, 0, 1);
      if (r.def.joinEnd) this._match(r, r.n - 1, -1);
    }
  }

  _snap(r, idx, parent) {
    if (!parent) return;
    let best = 1e9, bj = 0;
    for (let j = 0; j < parent.n; j++) {
      const d = Math.hypot(parent.x[j] - r.x[idx], parent.z[j] - r.z[idx]);
      if (d < best) { best = d; bj = j; }
    }
    r.x[idx] = parent.x[bj]; r.z[idx] = parent.z[bj];
    r.joinInfo = r.joinInfo || {};
    r.joinInfo[idx === 0 ? 'start' : 'end'] = { road: parent, j: bj };
    if (idx === 0) r.trim0 = parent.width / 2 + 0.3; else r.trim1 = parent.width / 2 + 0.3;
  }

  _lengths(r) {
    let acc = 0;
    for (let i = 0; i < r.n; i++) {
      if (i > 0) acc += Math.hypot(r.x[i] - r.x[i - 1], r.z[i] - r.z[i - 1]);
      r.s[i] = acc;
    }
    r.length = acc;
  }

  _elevation(r, terrain) {
    const n = r.n;
    const raw = new Float32Array(n);
    for (let i = 0; i < n; i++) raw[i] = terrain.baseHeight(r.x[i], r.z[i], false);
    const W = r.smooth;
    for (let pass = 0; pass < 2; pass++) {
      const src = pass === 0 ? raw : r.elev;
      const dst = pass === 0 ? r.elev : raw;
      for (let i = 0; i < n; i++) {
        let s = 0, c = 0;
        for (let k = -W; k <= W; k++) { const j = Math.min(n - 1, Math.max(0, i + k)); s += src[j]; c++; }
        dst[i] = s / c;
      }
    }
    r.elev.set(raw); // after two passes result is in `raw`
  }

  _crossing(a, b) {
    let best = 1e9, ai = -1, bj = -1;
    for (let i = 0; i < a.n; i++) for (let j = 0; j < b.n; j++) {
      const d = (a.x[i] - b.x[j]) ** 2 + (a.z[i] - b.z[j]) ** 2;
      if (d < best) { best = d; ai = i; bj = j; }
    }
    if (best > 9) return;
    const delta = b.elev[bj] - a.elev[ai];
    const K = 28;
    for (let k = -K; k <= K; k++) {
      const i = ai + k;
      if (i < 0 || i >= a.n) continue;
      a.elev[i] += delta * (1 - smoothstep(0, K, Math.abs(k)));
    }
    (this.crossings || (this.crossings = [])).push({ rail: a, road: b, x: a.x[ai], z: a.z[ai], i: ai });
  }

  _match(r, idx, dir) {
    const info = r.joinInfo[idx === 0 ? 'start' : 'end'];
    if (!info) return;
    const target = info.road.elev[info.j];
    const delta = target - r.elev[idx];
    const K = 14;
    for (let k = 0; k < K; k++) {
      const i = idx + dir * k;
      if (i < 0 || i >= r.n) break;
      const f = 1 - k / K;
      r.elev[i] += delta * f * f;
    }
  }

  /** Flag bridge zones where roads cross rivers, and raise the deck above the water. */
  computeBridges(rivers) {
    const tmp = {};
    for (const r of this.roads) {
      const inside = new Uint8Array(r.n);
      for (let i = 0; i < r.n; i++) {
        if (rivers.influence(r.x[i], r.z[i], tmp) && tmp.d < tmp.half + 6) inside[i] = 1;
      }
      let i = 0;
      while (i < r.n) {
        if (!inside[i]) { i++; continue; }
        let a = i;
        while (i < r.n && inside[i]) i++;
        let b = i - 1;
        a = Math.max(1, a - 2); b = Math.min(r.n - 2, b + 2);
        rivers.influence(r.x[Math.floor((a + b) / 2)], r.z[Math.floor((a + b) / 2)], tmp);
        const level = tmp.level;
        let maxE = -1e9;
        for (let k = a - 1; k <= b + 1; k++) maxE = Math.max(maxE, r.elev[k]);
        const deckBase = Math.max(maxE, level + 2.7);
        const raise = deckBase - maxE;
        const e0 = r.elev[a - 1] + raise, e1 = r.elev[b + 1] + raise;
        for (let k = a; k <= b; k++) r.elev[k] = lerp(e0, e1, (k - a) / Math.max(1, b - a));
        const R = 14;
        for (let k = 1; k <= R; k++) {
          const f = 1 - smoothstep(0, R, k);
          if (a - k - 1 >= 0) r.elev[a - 1 - k + 0] += raise * f;
          if (b + k + 1 < r.n) r.elev[b + 1 + k] += raise * f;
        }
        r.elev[a - 1] += raise; r.elev[b + 1] += raise;
        for (let k = a; k <= b; k++) r.bridge[k] = 1;
        for (let k = 1; k <= 2; k++) {
          const f = 1 - k / 3;
          if (a - k >= 0) r.bridge[a - k] = Math.max(r.bridge[a - k], f);
          if (b + k < r.n) r.bridge[b + k] = Math.max(r.bridge[b + k], f);
        }
        this.bridges.push({ road: r, a, b, level, x: (r.x[a] + r.x[b]) / 2, z: (r.z[a] + r.z[b]) / 2, length: r.s[b] - r.s[a] });
      }
    }
  }

  finalize() {
    for (const r of this.roads) {
      const R = r.width / 2 + r.shoulder + r.falloff + 3;
      for (let i = 0; i < r.n - 1; i++) {
        const minx = Math.min(r.x[i], r.x[i + 1]) - R, maxx = Math.max(r.x[i], r.x[i + 1]) + R;
        const minz = Math.min(r.z[i], r.z[i + 1]) - R, maxz = Math.max(r.z[i], r.z[i + 1]) + R;
        for (let cx = Math.floor(minx / CELL); cx <= Math.floor(maxx / CELL); cx++) {
          for (let cz = Math.floor(minz / CELL); cz <= Math.floor(maxz / CELL); cz++) {
            const k = ck(cx, cz);
            let a = this.grid.get(k);
            if (!a) { a = []; this.grid.set(k, a); }
            a.push((r.idx << 20) | i);
          }
        }
      }
    }
    this._bestD = new Float32Array(this.roads.length);
    this._bestI = new Int32Array(this.roads.length);
    this._bestT = new Float32Array(this.roads.length);
    this._touched = [];
  }

  /**
   * Terrain influence at (x,z). Writes into `out`:
   *  w     – max flattening weight (0..1)
   *  elev  – weighted target elevation
   *  ditch – additive height offset for roadside drainage ditches
   *  d, road, s – distance to nearest road centre, that road and arc length there
   */
  influence(x, z, out) {
    out.w = 0; out.elev = 0; out.ditch = 0; out.d = 1e9; out.road = null; out.s = 0; out.bridge = 0;
    const list = this.grid.get(ck(Math.floor(x / CELL), Math.floor(z / CELL)));
    if (!list) return out;
    const bestD = this._bestD, bestI = this._bestI, bestT = this._bestT, touched = this._touched;
    touched.length = 0;
    const tmp = this._tmp;
    for (let k = 0; k < list.length; k++) {
      const v = list[k];
      const ri = v >> 20, i = v & 0xfffff;
      const r = this.roads[ri];
      segDist(x, z, r.x[i], r.z[i], r.x[i + 1], r.z[i + 1], tmp);
      if (touched.indexOf(ri) === -1) { touched.push(ri); bestD[ri] = 1e9; }
      if (tmp.d < bestD[ri]) { bestD[ri] = tmp.d; bestI[ri] = i; bestT[ri] = tmp.t; }
    }
    let wSum = 0, eSum = 0, wMax = 0, ditch = 0;
    for (let q = 0; q < touched.length; q++) {
      const ri = touched[q];
      const r = this.roads[ri];
      const d = bestD[ri], i = bestI[ri], t = bestT[ri];
      const flat = r.width / 2 + r.shoulder;
      const br = r.bridge[i] + (r.bridge[i + 1] - r.bridge[i]) * t;
      if (d < out.d) {
        out.d = d; out.road = r; out.s = r.s[i] + (r.s[i + 1] - r.s[i]) * t; out.bridge = br;
        out.i = i; out.t = t;
      }
      if (d > flat + r.falloff + 2.5) continue;
      let w = 1 - smoothstep(flat, flat + r.falloff, d);
      w *= 1 - Math.min(1, Math.max(0, (br - 0.4) / 0.5));
      if (w > 0) {
        const e = r.elev[i] + (r.elev[i + 1] - r.elev[i]) * t;
        wSum += w; eSum += e * w;
        if (w > wMax) wMax = w;
      }
      if (r.ditch && d > flat - 0.2 && d < flat + 3.2) {
        const u = (d - flat + 0.2) / 3.4;
        ditch = Math.min(ditch, -0.32 * Math.sin(Math.PI * u) * (1 - br));
      }
    }
    if (wSum > 0) { out.w = wMax; out.elev = eSum / wSum; }
    out.ditch = ditch;
    return out;
  }
}
