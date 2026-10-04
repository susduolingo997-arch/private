import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { box as obb, circle } from './Colliders.js';

// ---------------------------------------------------------------------------
// Local-space helper: place geometry in a structure's own frame (x along the
// facade, z toward the street, y up) and write it into chunk-local coordinates.
// ---------------------------------------------------------------------------
export class Xf {
  constructor(x, y, z, rot, ox, oz) {
    this.x = x; this.y = y; this.z = z; this.rot = rot; this.ox = ox; this.oz = oz;
    this.cs = Math.cos(rot); this.sn = Math.sin(rot);
  }
  wx(lx, lz) { return this.x + lx * this.cs + lz * this.sn; }
  wz(lx, lz) { return this.z - lx * this.sn + lz * this.cs; }
  box(b, lx, ly, lz, sx, sy, sz, col, opts) {
    b.box(this.wx(lx, lz) - this.ox, this.y + ly, this.wz(lx, lz) - this.oz, sx, sy, sz, this.rot, col, opts);
  }
  cyl(b, lx, ly, lz, rb, rt, h, segs, col, colTop, cap) {
    b.cyl(this.wx(lx, lz) - this.ox, this.y + ly, this.wz(lx, lz) - this.oz, rb, rt, h, segs, col, colTop, cap);
  }
  cone(b, lx, ly, lz, r, h, segs, c1, c2) {
    b.cone(this.wx(lx, lz) - this.ox, this.y + ly, this.wz(lx, lz) - this.oz, r, h, segs, c1, c2);
  }
  gable(b, lx, ly, lz, w, d, h, over, c1, c2, c3) {
    b.gable(this.wx(lx, lz) - this.ox, this.y + ly, this.wz(lx, lz) - this.oz, w, d, h, over, this.rot, c1, c2, c3);
  }
  /** pyramid (hip) over a square */
  pyramid(b, lx, ly, lz, w, d, h, c1, c2) {
    const P = (x, y, z) => [this.wx(x, z) - this.ox, this.y + ly + y, this.wz(x, z) - this.oz];
    const a = P(-w / 2, 0, d / 2), bb = P(w / 2, 0, d / 2), c = P(w / 2, 0, -d / 2), dd = P(-w / 2, 0, -d / 2), t = P(0, h, 0);
    const o = [lx, lz]; void o;
    b.tri(a, bb, t, c1); b.tri(bb, c, t, c2 || c1); b.tri(c, dd, t, c1); b.tri(dd, a, t, c2 || c1);
  }
}

export const rotFromDir = (dx, dz) => Math.atan2(-dz, dx);

const C = {
  white: lin(0xf2efe8), trim: lin(0xe9e4d8), woodDark: lin(0x4a3524), wood: lin(0x7b5a3a), woodLight: lin(0xa88660),
  brick: lin(0x93503a), stone: lin(0x8c8a82), stoneDark: lin(0x6a6862), slate: lin(0x4a4d55), terracotta: lin(0xa5502f),
  floor: lin(0x8a6a48), plaster: lin(0xe3dccb), metal: lin(0x6b7075), metalDark: lin(0x34373b), concrete: lin(0x9a9a94),
  glass: lin(0x203040), black: lin(0x161618), red: lin(0x8a2a22), green: lin(0x3c6a3a), cloth1: lin(0x5a6f8a), cloth2: lin(0x8a5a4a),
};
export const COL = C;

const WALLS = [0xe8dcc0, 0xf1ead8, 0xd9cfb8, 0xc9c2b0, 0xf4efe2, 0xe4c98f, 0xb7b1a0, 0xd8c3a0, 0x9a5a3c, 0x8e7a63, 0xdfe3df, 0xc9d3c6, 0xe9e1cc, 0xd6cdb9];
const ROOFS = [0x8a3e28, 0x4a4d55, 0x5d3f2c, 0x6b6e75, 0x8e4a30, 0x3b3d42];

export function pickHouseStyle(rng) {
  return {
    wall: WALLS[Math.floor(rng.next() * WALLS.length)],
    roof: ROOFS[Math.floor(rng.next() * ROOFS.length)],
    door: rng.pick([0x2f4f6a, 0x7a2a22, 0x2f5a3a, 0x3a3a3e, 0x6a4a2a, 0xb89a3a]),
  };
}

const T = 0.28; // wall thickness
const DOOR_W = 1.05, DOOR_H = 2.12;

export function houseDims(h) {
  return { w: h.w, d: h.d, H: h.H, H2: h.storeys > 1 ? 2.7 : 0 };
}

/** Collision boxes of a house (world space). `door` is returned separately so it can toggle. */
export function houseColliders(h) {
  const { w, d } = h;
  const out = [];
  const add = (lx, lz, hx, hz) => {
    const xf = new Xf(h.x, 0, h.z, h.rot, 0, 0);
    out.push(obb(xf.wx(lx, lz), xf.wz(lx, lz), hx, hz, h.rot));
  };
  add(0, -d / 2 + T / 2, w / 2, T / 2);
  add(-w / 2 + T / 2, 0, T / 2, d / 2 - T);
  add(w / 2 - T / 2, 0, T / 2, d / 2 - T);
  const dx = h.doorX;
  const lw = (dx - DOOR_W / 2) - (-w / 2), rw = (w / 2) - (dx + DOOR_W / 2);
  add((-w / 2 + dx - DOOR_W / 2) / 2, d / 2 - T / 2, lw / 2, T / 2);
  add((w / 2 + dx + DOOR_W / 2) / 2, d / 2 - T / 2, rw / 2, T / 2);
  const xf = new Xf(h.x, 0, h.z, h.rot, 0, 0);
  const door = obb(xf.wx(dx, d / 2 - T / 2), xf.wz(dx, d / 2 - T / 2), DOOR_W / 2, 0.08, h.rot);
  return { walls: out, door };
}

export function solidCollider(h) {
  const xf = new Xf(h.x, 0, h.z, h.rot, 0, 0);
  return [obb(xf.wx(0, 0), xf.wz(0, 0), h.w / 2, h.d / 2, h.rot)];
}

function windowAt(xf, b, g, W, D, face, along, ly, ww, wh, thr) {
  // face: 0=front(+z) 1=back(-z) 2=left(-x) 3=right(+x). `along` is the position along that wall.
  const horiz = face < 2;
  const sgn = (face === 0 || face === 3) ? 1 : -1;
  const plane = horiz ? sgn * D / 2 : sgn * W / 2;      // outer wall plane
  const L = (u, off) => (horiz ? [along + u, plane + sgn * off] : [plane + sgn * off, along + u]);
  const P = (u, y, off) => { const [lx, lz] = L(u, off); return [xf.wx(lx, lz) - xf.ox, xf.y + y, xf.wz(lx, lz) - xf.oz]; };
  const nl = horiz ? [0, sgn] : [sgn, 0];
  const wnx = xf.wx(nl[0], nl[1]) - xf.x, wnz = xf.wz(nl[0], nl[1]) - xf.z;
  const quad = (off, flip) => {
    const A = P(-ww / 2, ly - wh / 2, off), B = P(ww / 2, ly - wh / 2, off), Cc = P(ww / 2, ly + wh / 2, off), D2 = P(-ww / 2, ly + wh / 2, off);
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = D2[0] - A[0], vy = D2[1] - A[1], vz = D2[2] - A[2];
    const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx;
    const want = flip ? -1 : 1;
    if ((nx * wnx + nz * wnz) * want >= 0) g.quad(A, B, Cc, D2, C.glass); else g.quad(B, A, D2, Cc, C.glass);
  };
  g.extraVal = thr;
  quad(0.012, false);        // outer pane
  quad(-T - 0.012, true);    // inner pane (faces into the room)
  // frame bars on the outside
  const fw = 0.08, dep = 0.07;
  const bar = (u, y, su, sy) => {
    const [lx, lz] = L(u, dep / 2 - 0.005);
    xf.box(b, lx, y, lz, horiz ? su : dep, sy, horiz ? dep : su, C.trim);
  };
  bar(0, ly + wh / 2 + fw / 2, ww + fw * 2, fw);
  bar(0, ly - wh / 2 - fw / 2, ww + fw * 2 + 0.1, fw + 0.02);
  bar(-ww / 2 - fw / 2, ly, fw, wh);
  bar(ww / 2 + fw / 2, ly, fw, wh);
  bar(0, ly, fw * 0.6, wh);                       // mullion
}

/** Build the exterior+interior shell of a standard house into builder `b` (opaque) and `g` (glass). */
export function buildHouse(b, g, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  const { w, d, H } = h;
  const wall = lin(h.style.wall), roof = lin(h.style.roof);
  const wallIn = C.plaster;
  const dx = h.doorX;
  const st = h.storeys;
  const H2 = st > 1 ? 2.7 : 0;
  const top = H + H2;
  const base = [wall[0] * 0.55, wall[1] * 0.55, wall[2] * 0.55];
  // foundation + floor slab
  xf.box(b, 0, -0.4, 0, w + 0.1, 0.76, d + 0.1, C.stoneDark);
  xf.box(b, 0, 0.02, 0, w - 2 * T, 0.04, d - 2 * T, C.floor, { top: C.floor });
  // walls (outer colour on the box; interior faces are the same box's inner side so tint toward plaster)
  const wy = (H + 0.2) / 2 - 0.2;
  xf.box(b, 0, wy, -d / 2 + T / 2, w, H + 0.2, T, wall);
  xf.box(b, -w / 2 + T / 2, wy, 0, T, H + 0.2, d - 2 * T, wall);
  xf.box(b, w / 2 - T / 2, wy, 0, T, H + 0.2, d - 2 * T, wall);
  const lw = (dx - DOOR_W / 2) + w / 2, rw = w / 2 - (dx + DOOR_W / 2);
  xf.box(b, -w / 2 + lw / 2, wy, d / 2 - T / 2, lw, H + 0.2, T, wall);
  xf.box(b, w / 2 - rw / 2, wy, d / 2 - T / 2, rw, H + 0.2, T, wall);
  xf.box(b, dx, (DOOR_H + H) / 2, d / 2 - T / 2, DOOR_W, H - DOOR_H, T, wall);
  // plaster lining inside (thin panels) so interiors are light
  xf.box(b, 0, H / 2, -d / 2 + T + 0.01, w - 2 * T, H, 0.02, wallIn);
  xf.box(b, -w / 2 + T + 0.01, H / 2, 0, 0.02, H, d - 2 * T, wallIn);
  xf.box(b, w / 2 - T - 0.01, H / 2, 0, 0.02, H, d - 2 * T, wallIn);
  xf.box(b, -w / 2 + T + lw / 2 - 0.0, H / 2, d / 2 - T - 0.01, lw - T, H, 0.02, wallIn);
  xf.box(b, w / 2 - T - rw / 2, H / 2, d / 2 - T - 0.01, rw - T, H, 0.02, wallIn);
  // ceiling
  xf.box(b, 0, H + 0.0, 0, w, 0.2, d, C.white);
  if (st > 1) {
    xf.box(b, 0, H + H2 / 2, 0, w - 0.1, H2, d - 0.1, wall);
    xf.box(b, 0, H + 0.02, 0, w + 0.12, 0.14, d + 0.12, base);
  }
  // roof
  const pitch = Math.min(2.8, d * 0.34);
  xf.gable(b, 0, top, 0, w, d, pitch, 0.5, roof, roof.map((c) => c * 0.82), wall);
  // chimney
  if (h.chimney) xf.box(b, (h.chimney > 0 ? 1 : -1) * w * 0.28, top + (pitch + 1.2) / 2, -d * 0.12, 0.7, pitch + 1.2, 0.7, C.brick, { noBottom: true });
  // door frame + step + canopy
  xf.box(b, dx, DOOR_H + 0.07, d / 2 - T / 2 + 0.04, DOOR_W + 0.28, 0.14, T + 0.08, C.trim);
  xf.box(b, dx - DOOR_W / 2 - 0.07, DOOR_H / 2, d / 2 - T / 2 + 0.04, 0.14, DOOR_H, T + 0.08, C.trim);
  xf.box(b, dx + DOOR_W / 2 + 0.07, DOOR_H / 2, d / 2 - T / 2 + 0.04, 0.14, DOOR_H, T + 0.08, C.trim);
  xf.box(b, dx, -0.05, d / 2 + 0.45, DOOR_W + 1.0, 0.16, 0.9, C.concrete);
  if (h.canopy) {
    xf.box(b, dx, DOOR_H + 0.55, d / 2 + 0.55, DOOR_W + 1.4, 0.1, 1.3, roof);
    xf.box(b, dx - DOOR_W / 2 - 0.55, DOOR_H / 2 + 0.3, d / 2 + 1.1, 0.1, DOOR_H + 0.6, 0.1, C.trim);
    xf.box(b, dx + DOOR_W / 2 + 0.55, DOOR_H / 2 + 0.3, d / 2 + 1.1, 0.1, DOOR_H + 0.6, 0.1, C.trim);
  }
  // windows
  const wr = h.rng;
  const wl = () => (h.isHome ? 0.04 + wr.next() * 0.1 : 0.12 + wr.next() * 0.8);
  const lcx = -w / 2 + lw / 2, rcx = w / 2 - rw / 2;
  if (lw > 2.0) windowAt(xf, b, g, w, d, 0, lcx, 1.55, 1.2, 1.25, wl());
  if (rw > 2.0) windowAt(xf, b, g, w, d, 0, rcx, 1.55, 1.2, 1.25, wl());
  if (st > 1) { for (const x of [-w * 0.28, w * 0.28]) windowAt(xf, b, g, w, d, 0, x, H + 1.45, 1.1, 1.2, wl()); }
  const nBack = Math.max(1, Math.floor(w / 3.4));
  for (let i = 0; i < nBack; i++) {
    const x = -w / 2 + (w / nBack) * (i + 0.5);
    windowAt(xf, b, g, w, d, 1, x, 1.55, 1.2, 1.25, wl());
    if (st > 1) windowAt(xf, b, g, w, d, 1, x, H + 1.45, 1.1, 1.2, wl());
  }
  for (const face of [2, 3]) {
    windowAt(xf, b, g, w, d, face, d * 0.1, 1.55, 1.1, 1.2, wl());
    if (st > 1) windowAt(xf, b, g, w, d, face, 0, H + 1.45, 1.1, 1.2, wl());
  }

  // interior furniture (cheap boxes) — makes walking inside feel inhabited
  furnish(xf, b, h);
}

function furnish(xf, b, h) {
  const { w, d } = h;
  const r = h.rng;
  const f = (lx, lz, sx, sy, sz, col) => xf.box(b, lx, sy / 2 + 0.04, lz, sx, sy, sz, col);
  // table + chairs
  const tx = -w * 0.1, tz = d * 0.05;
  f(tx, tz, 1.5, 0.75, 0.9, C.woodLight);
  for (const [cx, cz] of [[-0.9, 0], [0.9, 0], [0, -0.7], [0, 0.7]]) f(tx + cx, tz + cz, 0.45, 0.5, 0.45, C.wood);
  // cabinet along back wall
  f(w * 0.25, -d / 2 + T + 0.3, 1.6, 1.9, 0.5, C.wood);
  // bed / sofa
  if (r.next() > 0.5) { f(-w / 2 + T + 1.0, -d / 2 + T + 1.1, 1.9, 0.5, 2.1, h.style.roof ? lin(0x9aa4b3) : C.cloth1); f(-w / 2 + T + 1.0, -d / 2 + T + 0.35, 1.5, 0.15, 0.4, C.white); }
  else { f(w / 2 - T - 1.0, d * 0.1, 0.9, 0.8, 2.0, C.cloth2); }
  // rug
  xf.box(b, tx, 0.045, tz, 2.8, 0.01, 2.0, lin(0x7a3a34));
  if (h.id === 'home') {
    // a few personal touches: shelf, plant, lamp
    f(-w / 2 + T + 0.3, 0.2, 0.4, 1.8, 2.2, C.wood);
    xf.cyl(b, w / 2 - T - 0.6, 0.05, -d / 2 + T + 0.6, 0.22, 0.26, 0.5, 8, C.terracotta, C.terracotta);
    xf.cyl(b, w / 2 - T - 0.6, 0.55, -d / 2 + T + 0.6, 0.4, 0.05, 0.9, 7, C.green, lin(0x5a8a48), false);
  }
}

/** Door panel geometry, hinge at local origin, opening toward +x. */
export function doorGeometry(h) {
  const b = new GeoBuilder();
  const col = lin(h.style.door);
  b.box(DOOR_W / 2, DOOR_H / 2, 0, DOOR_W, DOOR_H, 0.06, 0, col);
  b.box(DOOR_W - 0.14, DOOR_H * 0.48, 0.055, 0.1, 0.03, 0.05, 0, C.metal);
  b.box(DOOR_W / 2, DOOR_H * 0.78, 0.035, DOOR_W * 0.7, 0.5, 0.02, 0, col.map((c) => c * 0.78));
  return b.build();
}
export const DOOR = { w: DOOR_W, h: DOOR_H, T };

// ---------------------------------------------------------------------------
// Other structures
// ---------------------------------------------------------------------------
export function buildShop(b, g, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  const { w, d, H } = h;
  const wall = lin(h.style.wall);
  const dx = h.doorX;
  xf.box(b, 0, -0.4, 0, w + 0.1, 0.76, d + 0.1, C.stoneDark);
  xf.box(b, 0, 0.02, 0, w - 2 * T, 0.04, d - 2 * T, lin(0xc9c2b0));
  const wy = (H + 0.2) / 2 - 0.2;
  xf.box(b, 0, wy, -d / 2 + T / 2, w, H + 0.2, T, wall);
  xf.box(b, -w / 2 + T / 2, wy, 0, T, H + 0.2, d - 2 * T, wall);
  xf.box(b, w / 2 - T / 2, wy, 0, T, H + 0.2, d - 2 * T, wall);
  const lw = (dx - DOOR_W / 2) + w / 2, rw = w / 2 - (dx + DOOR_W / 2);
  xf.box(b, -w / 2 + lw / 2, wy, d / 2 - T / 2, lw, H + 0.2, T, wall);
  xf.box(b, w / 2 - rw / 2, wy, d / 2 - T / 2, rw, H + 0.2, T, wall);
  xf.box(b, dx, (DOOR_H + H) / 2, d / 2 - T / 2, DOOR_W, H - DOOR_H, T, wall);
  xf.box(b, 0, H + 0.02, 0, w + 0.5, 0.35, d + 0.5, lin(0x6b6e75));
  xf.box(b, 0, H / 2, -d / 2 + T + 0.01, w - 2 * T, H, 0.02, C.plaster);
  xf.box(b, -w / 2 + T + 0.01, H / 2, 0, 0.02, H, d - 2 * T, C.plaster);
  xf.box(b, w / 2 - T - 0.01, H / 2, 0, 0.02, H, d - 2 * T, C.plaster);
  xf.box(b, 0, H - 0.1, 0, w, 0.2, d, C.white);
  // awning (striped)
  for (let i = 0; i < 8; i++) xf.box(b, -w / 2 + (w / 8) * (i + 0.5), 2.7, d / 2 + 0.9, w / 8, 0.06, 1.6, i % 2 ? C.white : C.red);
  xf.box(b, -w / 2 + 0.1, 1.35, d / 2 + 1.6, 0.08, 2.7, 0.08, C.metal);
  xf.box(b, w / 2 - 0.1, 1.35, d / 2 + 1.6, 0.08, 2.7, 0.08, C.metal);
  // big shop windows
  const wr = h.rng;
  for (const x of [-w / 2 + lw / 2, w / 2 - rw / 2]) if ((x < dx ? lw : rw) > 2.5) windowAt(xf, b, g, w, d, 0, x, 1.45, Math.min(3.0, (x < dx ? lw : rw) - 0.8), 1.5, 0.15 + wr.next() * 0.3);
  // shelves inside
  for (let i = 0; i < 3; i++) xf.box(b, -w / 2 + 1.4 + i * 2.2, 0.9, -d / 2 + T + 0.45, 1.8, 1.8, 0.5, C.wood);
  xf.box(b, w / 2 - 1.6, 0.5, d * 0.1, 1.6, 1.0, 0.7, C.woodLight);
}

export function shopSignGeometry(h, ox, oz) {
  const b = new GeoBuilder();
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  xf.box(b, 0, 3.55, h.d / 2 + 0.12, h.w * 0.7, 0.8, 0.12, C.white);
  return b;
}

export function buildChurch(b, g, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  const w = h.w, d = h.d, H = 5.6;
  const stone = lin(0xb9b3a2), roof = C.slate;
  const dx = 0;
  xf.box(b, 0, -0.4, 0, w + 0.3, 0.76, d + 0.3, C.stoneDark);
  xf.box(b, 0, 0.02, 0, w - 2 * T, 0.04, d - 2 * T, lin(0x9c968a));
  const wy = (H + 0.2) / 2 - 0.2;
  xf.box(b, 0, wy, -d / 2 + T / 2, w, H + 0.2, T + 0.1, stone);
  xf.box(b, -w / 2 + T / 2, wy, 0, T + 0.1, H + 0.2, d - 2 * T, stone);
  xf.box(b, w / 2 - T / 2, wy, 0, T + 0.1, H + 0.2, d - 2 * T, stone);
  const lw = (dx - 1.2) + w / 2, rw = w / 2 - (dx + 1.2);
  xf.box(b, -w / 2 + lw / 2, wy, d / 2 - T / 2, lw, H + 0.2, T + 0.1, stone);
  xf.box(b, w / 2 - rw / 2, wy, d / 2 - T / 2, rw, H + 0.2, T + 0.1, stone);
  xf.box(b, dx, (2.6 + H) / 2, d / 2 - T / 2, 2.4, H - 2.6, T + 0.1, stone);
  xf.box(b, 0, H - 0.1, 0, w, 0.2, d, lin(0x8a7a66));
  xf.box(b, 0, H / 2, -d / 2 + T + 0.07, w - 2 * T, H, 0.02, C.plaster);
  xf.box(b, -w / 2 + T + 0.07, H / 2, 0, 0.02, H, d - 2 * T, C.plaster);
  xf.box(b, w / 2 - T - 0.07, H / 2, 0, 0.02, H, d - 2 * T, C.plaster);
  xf.gable(b, 0, H, 0, w, d, 3.6, 0.5, roof, roof.map((c) => c * 0.85), stone);
  // tower at the front
  const tw = 4.2;
  xf.box(b, 0, 0, d / 2 + tw / 2 - 0.3, tw, 16.0, tw, stone, { noBottom: true });
  xf.box(b, 0, 16.0, d / 2 + tw / 2 - 0.3, tw + 0.5, 0.5, tw + 0.5, C.stoneDark);
  xf.pyramid(b, 0, 16.5, d / 2 + tw / 2 - 0.3, tw + 0.3, tw + 0.3, 7.5, roof, roof.map((c) => c * 0.85));
  // belfry openings
  for (const s of [-1, 1]) { xf.box(b, s * (tw / 2 + 0.01), 14.2, d / 2 + tw / 2 - 0.3, 0.1, 2.2, 1.0, C.black); xf.box(b, 0, 14.2, d / 2 + tw / 2 - 0.3 + s * (tw / 2 + 0.01), 1.0, 2.2, 0.1, C.black); }
  // porch door in the tower base: reuse main doorway (tower base is hollow at the ground? keep solid beside the doorway)
  const wr = h.rng;
  for (let i = 0; i < 3; i++) {
    const z = -d / 2 + 3 + i * ((d - 6) / 2.2);
    windowAt(xf, b, g, w, d, 2, z, 3.2, 0.9, 2.4, 0.3 + wr.next() * 0.5);
    windowAt(xf, b, g, w, d, 3, z, 3.2, 0.9, 2.4, 0.3 + wr.next() * 0.5);
  }
  // pews + altar
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]) xf.box(b, s * 1.7, 0.45, -d / 2 + 3.0 + i * 1.5, 2.2, 0.9, 0.5, C.woodDark);
  xf.box(b, 0, 0.5, -d / 2 + T + 0.9, 2.4, 1.0, 0.8, lin(0xc9c2b0));
}

export function churchColliders(h) {
  const xf = new Xf(h.x, 0, h.z, h.rot, 0, 0);
  const { w, d } = h; const tw = 4.2;
  const out = [];
  const add = (lx, lz, hx, hz) => out.push(obb(xf.wx(lx, lz), xf.wz(lx, lz), hx, hz, h.rot));
  add(0, -d / 2 + T / 2, w / 2, T / 2 + 0.05);
  add(-w / 2 + T / 2, 0, T / 2 + 0.05, d / 2 - T);
  add(w / 2 - T / 2, 0, T / 2 + 0.05, d / 2 - T);
  const lw = (-1.2) + w / 2, rw = w / 2 - 1.2;
  add(-w / 2 + lw / 2, d / 2 - T / 2, lw / 2, T / 2 + 0.05);
  add(w / 2 - rw / 2, d / 2 - T / 2, rw / 2, T / 2 + 0.05);
  add(0, d / 2 + tw / 2 - 0.3, tw / 2, tw / 2);
  return out;
}

export function buildBarn(b, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  const { w, d } = h;
  const red = lin(0x8a2f25), roof = lin(0x6f747a);
  xf.box(b, 0, 3.0, 0, w, 6.2, d, red, { noBottom: true });
  xf.gable(b, 0, 6.1, 0, w, d, 3.6, 0.4, roof, roof.map((c) => c * 0.85), red);
  xf.box(b, 0, 2.1, d / 2 + 0.03, 4.4, 4.2, 0.1, lin(0x6a2019));
  xf.box(b, 0, 2.1, d / 2 + 0.07, 0.12, 4.2, 0.06, C.white);
  for (const s of [-1, 1]) xf.box(b, s * 2.2, 2.1, d / 2 + 0.09, 0.2, 4.4, 0.12, C.white);
  xf.box(b, 0, 4.4, d / 2 + 0.09, 4.8, 0.2, 0.12, C.white);
  // lean-to
  xf.box(b, -w / 2 - 2.0, 1.6, 0, 4.0, 3.2, d * 0.55, lin(0x74402a), { noBottom: true });
}

export function buildShed(b, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  xf.box(b, 0, 1.3, 0, h.w, 2.6, h.d, C.woodLight, { noBottom: true });
  xf.gable(b, 0, 2.6, 0, h.w, h.d, 1.0, 0.3, C.metal, C.metalDark, C.woodLight);
  xf.box(b, 0, 1.0, h.d / 2 + 0.03, 1.4, 2.0, 0.08, C.woodDark);
}

export function buildSilo(b, h, ox, oz) {
  const xf = new Xf(h.x, h.y, h.z, h.rot, ox, oz);
  xf.cyl(b, 0, 0, 0, 3.0, 3.0, 13, 14, lin(0xb9bcbd), lin(0xb9bcbd), false);
  xf.cyl(b, 0, 13, 0, 3.0, 0.2, 1.8, 14, lin(0x7c8083), lin(0x7c8083));
}

// ---------------------------------------------------------------------------
// Small props
// ---------------------------------------------------------------------------
export function lampPost(b, head, x, y, z, rot, ox, oz) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.cyl(b, 0, 0, 0, 0.1, 0.07, 5.0, 8, C.metalDark, C.metalDark);
  xf.box(b, 0.45, 5.0, 0, 1.0, 0.07, 0.07, C.metalDark);
  xf.box(b, 0.9, 4.9, 0, 0.5, 0.12, 0.28, C.metalDark);
  xf.box(head, 0.9, 4.82, 0, 0.42, 0.06, 0.2, [1, 1, 1]);
}

export function utilityPole(b, x, y, z, rot, ox, oz, h = 9.5) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.cyl(b, 0, -0.3, 0, 0.17, 0.12, h + 0.3, 7, lin(0x5a4733), lin(0x4a3a2a));
  xf.box(b, 0, h - 0.5, 0, 2.6, 0.12, 0.12, C.woodDark, {});
  for (const lx of [-1.15, 0, 1.15]) xf.cyl(b, lx, h - 0.42, 0, 0.05, 0.05, 0.22, 5, lin(0x7a8d7a), lin(0x7a8d7a));
}

export function fencePanel(b, x0, y0, z0, x1, y1, z1, ox, oz, kind = 'rail') {
  const dx = x1 - x0, dz = z1 - z0;
  const L = Math.hypot(dx, dz);
  const rot = rotFromDir(dx, dz);
  const mx = (x0 + x1) / 2 - ox, mz = (z0 + z1) / 2 - oz, my = (y0 + y1) / 2;
  const post = (x, y, z, hgt) => b.box(x - ox, y + hgt / 2, z - oz, 0.13, hgt, 0.13, rot, C.woodLight);
  if (kind === 'picket') {
    post(x0, y0, z0, 1.0);
    const n = Math.max(2, Math.round(L / 0.22));
    for (let i = 0; i <= n; i++) {
      const t = i / n; const px = x0 + dx * t, pz = z0 + dz * t, py = y0 + (y1 - y0) * t;
      b.box(px - ox, py + 0.4, pz - oz, 0.08, 0.8, 0.03, rot, C.white);
    }
    b.box(mx, my + 0.3, mz, L, 0.05, 0.04, rot, C.white); b.box(mx, my + 0.6, mz, L, 0.05, 0.04, rot, C.white);
    return;
  }
  post(x0, y0, z0, 1.15); post(x1, y1, z1, 1.15);
  b.box(mx, my + 0.45, mz, L, 0.08, 0.05, rot, C.wood);
  b.box(mx, my + 0.85, mz, L, 0.08, 0.05, rot, C.wood);
  // mid slope-following rails are straight; panels are short enough to follow terrain.
}

export function signPost(b, face, x, y, z, rot, ox, oz, w = 1.6, h = 0.7, kind = 'wood') {
  const xf = new Xf(x, y, z, rot, ox, oz);
  const col = kind === 'road' ? C.metal : C.woodDark;
  xf.box(b, -w / 2 + 0.08, 1.3, 0, 0.1, 2.6, 0.1, col);
  xf.box(b, w / 2 - 0.08, 1.3, 0, 0.1, 2.6, 0.1, col);
  // sign board geometry with UVs goes to `face` builder: a double sided quad
  const P = (lx, ly, dz) => [xf.wx(lx, dz) - ox, y + ly, xf.wz(lx, dz) - oz];
  const A = P(-w / 2, 1.5, 0.07), B = P(w / 2, 1.5, 0.07), Cc = P(w / 2, 1.5 + h, 0.07), D = P(-w / 2, 1.5 + h, 0.07);
  const E = P(w / 2, 1.5, -0.07), F = P(-w / 2, 1.5, -0.07), Gg = P(-w / 2, 1.5 + h, -0.07), Hh = P(w / 2, 1.5 + h, -0.07);
  return { front: [A, B, Cc, D], back: [E, F, Gg, Hh] };
}

export function bench(b, x, y, z, rot, ox, oz) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.box(b, 0, 0.45, 0, 1.6, 0.06, 0.45, C.woodLight);
  xf.box(b, 0, 0.78, -0.2, 1.6, 0.4, 0.05, C.woodLight);
  for (const s of [-1, 1]) xf.box(b, s * 0.7, 0.22, 0, 0.07, 0.45, 0.4, C.metalDark);
}

export function mailbox(b, x, y, z, rot, ox, oz, col = 0x3a4a6a) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.box(b, 0, 0.55, 0, 0.07, 1.1, 0.07, C.woodDark);
  xf.box(b, 0, 1.18, 0, 0.26, 0.22, 0.4, lin(col));
}

export function busShelter(b, g, x, y, z, rot, ox, oz) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.box(b, 0, 2.35, 0, 3.4, 0.1, 1.5, C.metalDark);
  for (const s of [-1, 1]) xf.box(b, s * 1.6, 1.15, -0.65, 0.08, 2.3, 0.08, C.metalDark);
  xf.box(b, 0, 1.15, -0.72, 3.2, 2.2, 0.04, lin(0x3a4a50));
  xf.box(b, 0, 0.45, -0.4, 2.2, 0.06, 0.4, C.woodLight);
  xf.box(b, 1.7, 1.2, 0.1, 0.06, 2.4, 0.06, C.metal);
}

export function trafficLight(b, heads, x, y, z, rot, ox, oz) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  xf.cyl(b, 0, 0, 0, 0.07, 0.07, 3.6, 8, C.metalDark, C.metalDark);
  xf.box(b, 0, 3.6, 0.02, 0.3, 0.9, 0.22, C.black);
  return xf;
}

export function cone(b, x, y, z, ox, oz) {
  b.cone(x - ox, y, z - oz, 0.22, 0.7, 8, lin(0xe2571c), lin(0xe2571c));
  b.box(x - ox, y + 0.02, z - oz, 0.5, 0.04, 0.5, 0, C.black);
  b.cyl(x - ox, y + 0.28, z - oz, 0.14, 0.11, 0.1, 8, C.white, C.white);
}

export function hayBale(b, x, y, z, ox, oz, rot) {
  b.cyl(x - ox, y, z - oz, 0.8, 0.8, 1.2, 12, lin(0xb9a14a), lin(0xc7b05a));
}

export function tractor(b, x, y, z, rot, ox, oz) {
  const xf = new Xf(x, y, z, rot, ox, oz);
  const body = lin(0x2f6a35);
  xf.box(b, 0, 1.0, 0.6, 1.2, 0.9, 1.7, body);
  xf.box(b, 0, 1.7, -0.5, 1.5, 1.6, 1.4, lin(0x2b5e30));
  xf.box(b, 0, 1.9, -0.5, 1.46, 0.7, 1.42, lin(0x203040));
  xf.box(b, 0, 2.55, -0.5, 1.7, 0.08, 1.7, body);
  for (const [lx, lz, r] of [[-0.85, -0.6, 0.75], [0.85, -0.6, 0.75], [-0.75, 1.1, 0.45], [0.75, 1.1, 0.45]]) {
    const wx = xf.wx(lx, lz) - ox, wz = xf.wz(lx, lz) - oz;
    // wheel as a short cylinder lying on its side: approximate with boxes
    b.box(wx, y + r, wz, 0.4, r * 2, r * 1.8, rot, C.black);
  }
  xf.box(b, 0.35, 2.0, 0.9, 0.08, 1.3, 0.08, C.metalDark);
}

// ---------------------------------------------------------------------------
// Bridge
// ---------------------------------------------------------------------------
export function bridgeGeometry(roads, br, b, ox, oz, nearChunk) {
  const r = br.road;
  const W = r.width + 1.5;
  const stone = lin(0x9a968c), dark = lin(0x6e6a62);
  const cols = [];
  for (let i = br.a; i < br.b; i++) {
    const mx = (r.x[i] + r.x[i + 1]) / 2, mz = (r.z[i] + r.z[i + 1]) / 2;
    if (!nearChunk(mx, mz)) continue;
    const dx = r.x[i + 1] - r.x[i], dz = r.z[i + 1] - r.z[i];
    const L = Math.hypot(dx, dz) + 0.15;
    const rot = rotFromDir(dx, dz);
    const e = (r.elev[i] + r.elev[i + 1]) / 2;
    const nx = -dz / (L - 0.15), nz = dx / (L - 0.15);
    b.box(mx - ox, e - 0.3, mz - oz, L, 0.6, W, rot, dark, { top: stone });
    for (const s of [-1, 1]) {
      const px = mx + nx * s * (W / 2 - 0.2), pz = mz + nz * s * (W / 2 - 0.2);
      b.box(px - ox, e + 0.5, pz - oz, L, 1.1, 0.4, rot, stone, { top: lin(0xb0aca2) });
      cols.push({ x: px, z: pz, hx: L / 2, hz: 0.22, rot });
    }
  }
  // abutments
  for (const end of [br.a, br.b]) {
    const x = r.x[end], z = r.z[end];
    if (!nearChunk(x, z)) continue;
    const i2 = end === br.a ? end + 1 : end - 1;
    const rot = rotFromDir(r.x[i2] - x, r.z[i2] - z);
    b.box(x - ox, r.elev[end] - 3.2, z - oz, 1.2, 5.6, W + 0.4, rot, dark);
  }
  return cols;
}
