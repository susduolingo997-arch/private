import * as THREE from 'three';

// Tiny non-indexed geometry accumulator with baked vertex colours. Every prop in the
// game (houses, trees, cars, people…) is assembled from these primitives and merged
// into one BufferGeometry, so a whole village costs a handful of draw calls.

const _c = new THREE.Color();

export function lin(hex) {
  _c.setHex(hex); // converts sRGB hex -> linear working space
  return [_c.r, _c.g, _c.b];
}

export class GeoBuilder {
  constructor() {
    this.pos = []; this.nor = []; this.col = []; this.uv = [];
    this.extra = null; // optional extra per-vertex scalar (e.g. window lit threshold)
    this.extraVal = 0;
  }

  get vertexCount() { return this.pos.length / 3; }

  _push(x, y, z, nx, ny, nz, c, u = 0, v = 0) {
    this.pos.push(x, y, z); this.nor.push(nx, ny, nz); this.col.push(c[0], c[1], c[2]); this.uv.push(u, v);
    if (this.extra) this.extra.push(this.extraVal);
  }

  /** Triangle with flat normal. */
  tri(a, b, c, col, cb, cc) {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    this._push(a[0], a[1], a[2], nx, ny, nz, col);
    this._push(b[0], b[1], b[2], nx, ny, nz, cb || col);
    this._push(c[0], c[1], c[2], nx, ny, nz, cc || col);
  }

  quad(a, b, c, d, col, ca, cb, cc, cd) {
    this.tri(a, b, c, col, cb || col, cc || col);
    this.tri(a, c, d, col, cc || col, cd || col);
  }

  /** Axis-aligned-in-local-space box, rotated about Y by `rot`, centred at (cx, cy, cz). */
  box(cx, cy, cz, sx, sy, sz, rot, col, opts) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2;
    const cs = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    const P = (x, y, z) => [cx + x * cs + z * sn, cy + y, cz - x * sn + z * cs];
    const top = opts && opts.top ? opts.top : col;
    const bot = opts && opts.bottom ? opts.bottom : col;
    const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
    // +Y
    this.quad(P(-hx, hy, hz), P(hx, hy, hz), P(hx, hy, -hz), P(-hx, hy, -hz), top);
    if (!(opts && opts.noBottom)) this.quad(P(-hx, -hy, -hz), P(hx, -hy, -hz), P(hx, -hy, hz), P(-hx, -hy, hz), shade(bot, 0.6));
    this.quad(P(-hx, -hy, hz), P(hx, -hy, hz), P(hx, hy, hz), P(-hx, hy, hz), col);
    this.quad(P(hx, -hy, -hz), P(-hx, -hy, -hz), P(-hx, hy, -hz), P(hx, hy, -hz), col);
    this.quad(P(hx, -hy, hz), P(hx, -hy, -hz), P(hx, hy, -hz), P(hx, hy, hz), col);
    this.quad(P(-hx, -hy, -hz), P(-hx, -hy, hz), P(-hx, hy, hz), P(-hx, hy, -hz), col);
  }

  /** Vertical cylinder / truncated cone with smooth side normals. */
  cyl(cx, cy, cz, rBot, rTop, h, segs, col, colTop, capTop = true) {
    colTop = colTop || col;
    const slope = (rBot - rTop) / h;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
      const c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const n0 = [c0, slope, s0], n1 = [c1, slope, s1];
      const l0 = Math.hypot(...n0), l1 = Math.hypot(...n1);
      const A = [cx + c0 * rBot, cy, cz + s0 * rBot], B = [cx + c1 * rBot, cy, cz + s1 * rBot];
      const C = [cx + c1 * rTop, cy + h, cz + s1 * rTop], D = [cx + c0 * rTop, cy + h, cz + s0 * rTop];
      this._push(...A, n0[0] / l0, n0[1] / l0, n0[2] / l0, col);
      this._push(...C, n1[0] / l1, n1[1] / l1, n1[2] / l1, colTop);
      this._push(...B, n1[0] / l1, n1[1] / l1, n1[2] / l1, col);
      this._push(...A, n0[0] / l0, n0[1] / l0, n0[2] / l0, col);
      this._push(...D, n0[0] / l0, n0[1] / l0, n0[2] / l0, colTop);
      this._push(...C, n1[0] / l1, n1[1] / l1, n1[2] / l1, colTop);
      if (capTop && rTop > 0.001) {
        this._push(cx, cy + h, cz, 0, 1, 0, colTop);
        this._push(...C, 0, 1, 0, colTop);
        this._push(...D, 0, 1, 0, colTop);
      }
    }
  }

  /** Lumpy low-poly blob (icosphere with noise displacement) used for foliage clumps. */
  blob(cx, cy, cz, rx, ry, rz, detail, colA, colB, rng, jitter = 0.18) {
    const ico = new THREE.IcosahedronGeometry(1, detail);
    const p = ico.attributes.position;
    const disp = new Map();
    const key = (x, y, z) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
    const get = (x, y, z) => {
      const k = key(x, y, z);
      let d = disp.get(k);
      if (d === undefined) { d = 1 + (rng.next() - 0.5) * 2 * jitter; disp.set(k, d); }
      return d;
    };
    const V = [];
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const d = get(x, y, z);
      V.push([cx + x * rx * d, cy + y * ry * d, cz + z * rz * d, y]);
    }
    const nrm = (v) => {
      const x = (v[0] - cx) / (rx * rx), y = (v[1] - cy) / (ry * ry), z = (v[2] - cz) / (rz * rz);
      const l = Math.hypot(x, y, z) || 1;
      return [x / l, y / l, z / l];
    };
    const mix = (c1, c2, f) => [c1[0] + (c2[0] - c1[0]) * f, c1[1] + (c2[1] - c1[1]) * f, c1[2] + (c2[2] - c1[2]) * f];
    const vh = (v) => { const s = Math.sin(v[0] * 12.9898 + v[1] * 78.233 + v[2] * 37.719) * 43758.5453; return s - Math.floor(s); };
    for (let i = 0; i < V.length; i += 3) {
      for (let k = 0; k < 3; k++) {
        const v = V[i + k], n = nrm(v);
        // darker underside = cheap baked ambient occlusion; colour varies smoothly per vertex
        const sc = 0.5 + 0.5 * Math.min(1, Math.max(0, (v[3] + 1) / 1.7));
        const col = mix(colA, colB, 0.15 + 0.7 * vh(v) * 0.6 + 0.3 * Math.max(0, v[3]));
        this._push(v[0], v[1], v[2], n[0], n[1], n[2], [col[0] * sc, col[1] * sc, col[2] * sc]);
      }
    }
    ico.dispose();
  }

  /** Cone (conifer tier). */
  cone(cx, cy, cz, r, h, segs, colBase, colTip) {
    this.cyl(cx, cy, cz, r, 0.0001, h, segs, colBase, colTip, false);
    // underside disc
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
      const dark = colBase.map((c) => c * 0.45);
      this._push(cx, cy, cz, 0, -1, 0, dark);
      this._push(cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r, 0, -1, 0, dark);
      this._push(cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r, 0, -1, 0, dark);
    }
  }

  /** Gable roof over a rectangle (w along local X, d along local Z), ridge along X. */
  gable(cx, cy, cz, w, d, h, over, rot, col, colAlt, gableCol) {
    const cs = Math.cos(rot || 0), sn = Math.sin(rot || 0);
    const P = (x, y, z) => [cx + x * cs + z * sn, cy + y, cz - x * sn + z * cs];
    const hw = w / 2 + over, hd = d / 2 + over;
    const e = 0.18; // eave thickness drop
    const A = P(-hw, 0, hd), B = P(hw, 0, hd), C = P(hw, 0, -hd), D = P(-hw, 0, -hd);
    const R1 = P(-hw, h, 0), R2 = P(hw, h, 0);
    this.quad(A, B, R2, R1, col);
    this.quad(C, D, R1, R2, colAlt || col);
    const gc = gableCol || col;
    this.tri(D, A, R1, gc); this.tri(B, C, R2, gc);
    // underside
    const dark = (colAlt || col).map((c) => c * 0.4);
    this.quad(D, C, B, A, dark);
    void e;
  }

  /** Flat quad strip between two polylines (used by ribbons). */
  build(attrs = {}) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    if (attrs.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    if (this.extra) g.setAttribute('aLit', new THREE.Float32BufferAttribute(this.extra, 1));
    g.computeBoundingSphere();
    g.computeBoundingBox();
    return g;
  }
}

/** Merge a list of BufferGeometry (same attributes) into one. */
export function mergeGeos(list) {
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  out.computeBoundingBox();
  return out;
}
