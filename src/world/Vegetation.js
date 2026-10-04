import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { Rng } from '../core/Noise.js';

/**
 * Shared tree / bush / grass geometry, each in three LODs. Every tree in the world is an
 * instance of one of these — a forest of thousands is just a few draw calls per chunk.
 */
export const TREE_TYPES = { OAK: 0, BIRCH: 1, SPRUCE: 2, BUSH: 3 };

function oak(detail) {
  const rng = new Rng(11);
  const b = new GeoBuilder();
  const trunk = lin(0x4a3828), la = lin(0x3a6428), lb = lin(0x5f8a36);
  const seg = [7, 5, 4][detail];
  b.cyl(0, 0, 0, 0.3, 0.14, 3.4, seg, trunk, lin(0x3a2c1f), false);
  const bd = detail === 0 ? 1 : 0;
  const blobs = [
    [0, 5.0, 0, 2.9, 2.4, 2.9], [1.7, 4.2, 0.6, 2.1, 1.8, 2.1], [-1.5, 4.3, -0.9, 2.2, 1.9, 2.2],
    [0.3, 6.1, -0.4, 1.9, 1.6, 1.9], [-0.3, 4.3, 1.7, 2.0, 1.7, 2.0],
  ];
  const n = [5, 3, 2][detail];
  for (let i = 0; i < n; i++) { const [x, y, z, rx, ry, rz] = blobs[i]; b.blob(x, y, z, rx, ry, rz, bd, la, lb, rng, 0.2); }
  return b.build();
}

function birch(detail) {
  const rng = new Rng(21);
  const b = new GeoBuilder();
  b.cyl(0, 0, 0, 0.16, 0.07, 6.2, [6, 5, 4][detail], lin(0xd9d5c9), lin(0xb9b4a6), false);
  const la = lin(0x5f9238), lb = lin(0x92b84c);
  const blobs = [[0, 6.3, 0, 1.6, 2.2, 1.6], [0.7, 5.0, 0.4, 1.3, 1.7, 1.3], [-0.6, 4.6, -0.5, 1.3, 1.6, 1.3], [0.1, 7.6, 0, 1.0, 1.4, 1.0]];
  const n = [4, 3, 2][detail];
  for (let i = 0; i < n; i++) { const [x, y, z, rx, ry, rz] = blobs[i]; b.blob(x, y, z, rx, ry, rz, detail === 0 ? 1 : 0, la, lb, rng, 0.2); }
  return b.build();
}

function spruce(detail) {
  const b = new GeoBuilder();
  b.cyl(0, 0, 0, 0.22, 0.1, 2.2, [6, 5, 4][detail], lin(0x4a3524), lin(0x3a2a1c), false);
  const base = lin(0x1e3d25), tip = lin(0x3b6a3d);
  const tiers = [7, 4, 2][detail];
  const seg = [10, 7, 5][detail];
  for (let i = 0; i < tiers; i++) {
    const f = i / (tiers - 1 || 1);
    const y = 1.5 + f * (tiers === 2 ? 4.5 : 5.2) * (tiers === 7 ? 1 : 1.0);
    const r = (tiers === 2 ? 2.4 : 2.5) * (1 - f * 0.78) + 0.35;
    const h = tiers === 2 ? 4.3 - f * 1.4 : 2.4 - f * 0.4;
    b.cone(0, y, 0, r, h, seg, base, tip);
  }
  return b.build();
}

function bush(detail) {
  const rng = new Rng(31);
  const b = new GeoBuilder();
  const la = lin(0x335f25), lb = lin(0x4f8030);
  const blobs = [[0, 0.7, 0, 1.0, 0.8, 1.0], [0.8, 0.55, 0.3, 0.8, 0.65, 0.8], [-0.7, 0.6, -0.3, 0.85, 0.7, 0.85]];
  const n = [3, 2, 1][detail];
  for (let i = 0; i < n; i++) { const [x, y, z, rx, ry, rz] = blobs[i]; b.blob(x, y, z, rx, ry, rz, detail === 0 ? 1 : 0, la, lb, rng, 0.25); }
  return b.build();
}

function tuft(blades, seed) {
  const rng = new Rng(seed);
  const pos = [], nor = [], col = [];
  for (let i = 0; i < blades; i++) {
    const a = rng.next() * Math.PI * 2, r = rng.next() * 0.2;
    const bx = Math.cos(a) * r, bz = Math.sin(a) * r;
    const lean = 0.15 + rng.next() * 0.3, la = a + (rng.next() - 0.5) * 1.2;
    const h = 0.7 + rng.next() * 0.3, w = 0.045 + rng.next() * 0.025;
    const tx = bx + Math.cos(la) * lean * h, tz = bz + Math.sin(la) * lean * h;
    const px = -Math.sin(la) * w, pz = Math.cos(la) * w;
    pos.push(bx - px, 0, bz - pz, bx + px, 0, bz + pz, tx, h, tz);
    for (let k = 0; k < 3; k++) nor.push(0, 1, 0);
    col.push(0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 1.1, 1.1, 1.1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeBoundingSphere();
  return g;
}

export function buildVegLib() {
  const mk = (fn) => [fn(0), fn(1), fn(2)];
  const lib = { trees: [mk(oak), mk(birch), mk(spruce), mk(bush)], grass: [tuft(9, 1), tuft(5, 2)], crop: tuft(8, 3) };
  for (const v of lib.trees) for (const g of v) g.userData.shared = true;
  for (const g of lib.grass) g.userData.shared = true;
  lib.crop.userData.shared = true;
  // bounding spheres for frustum culling of instanced meshes are computed per mesh
  return lib;
}

/** Approx. trunk collision radius for each type at scale 1. */
export const TRUNK_R = [0.38, 0.24, 0.32, 0.8];
/** Approx. canopy radius used for LOD / shadow decisions. */
export const TREE_H = [7.5, 8.5, 8.0, 1.6];
