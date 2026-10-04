import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { Rng, hash2, fbm } from '../core/Noise.js';
import { clamp, smoothstep } from '../core/MathUtil.js';
import { Mats } from '../render/Materials.js';
import { makeSignTexture } from '../render/Textures.js';
import { CHUNK } from './constants.js';
import { WORLD_SEED } from './WorldDef.js';
import { TRUNK_R } from './Vegetation.js';
import { circle, box as obbCollider } from './Colliders.js';
import * as B from './Buildings.js';
import { getCarModel, CAR_COLORS } from '../systems/CarModel.js';

const LOD_SEGS = [32, 16, 8, 4];
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _c = new THREE.Color();
const UP = new THREE.Vector3(0, 1, 0);

export class Chunk {
  constructor(cx, cz, key) {
    this.cx = cx; this.cz = cz; this.key = key;
    this.group = new THREE.Group();
    this.group.position.set(cx * CHUNK, 0, cz * CHUNK);
    this.terrainMesh = null; this.terrainLod = -1;
    this.fg = null;            // feature group
    this.treeMeshes = [];      // {mesh, type}
    this.grassGroup = null;
    this.interactables = [];
    this.owner = 'c' + key;
    this.dist = 99;
    this.treeLod = -1;
    this.hasFeatures = false; this.hasGrass = false;
    this.busy = { terrain: false, features: false, grass: false };
  }
}

function disposeObject(o) {
  o.traverse((n) => {
    if (n.geometry && !n.geometry.userData.shared) n.geometry.dispose();
    if (n.isInstancedMesh) n.dispose();
  });
}

export class ChunkBuilder {
  constructor(world, veg) {
    this.world = world; this.t = world.terrain; this.veg = veg;
    this.car = getCarModel();
    this._ri = {};
  }

  // ------------------------------------------------------------------ terrain
  buildTerrain(chunk, lod) { for (const _ of this.terrainGen(chunk, lod)); void 0; }
  *terrainGen(chunk, lod) {
    const t = this.t;
    const N = LOD_SEGS[lod], step = CHUNK / N;
    const ox = chunk.cx * CHUNK, oz = chunk.cz * CHUNK;
    const M = N + 3;
    const H = new Float32Array(M * M);
    for (let j = 0; j < M; j++) {
      for (let i = 0; i < M; i++) H[j * M + i] = t.heightAt(ox + (i - 1) * step, oz + (j - 1) * step);
      if (N >= 32 && (j & 7) === 7) yield;
    }
    const W = N + 1;
    const nSkirt = 4 * N;
    const total = W * W + nSkirt;
    const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3), surf = new Float32Array(total * 4);
    const aux = { field: 0, angle: 0, rock: 0, dirt: 0 };
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      if (N >= 32 && i === 0 && (j & 7) === 7) yield;
      const k = j * W + i;
      const h = H[(j + 1) * M + (i + 1)];
      const gx = (H[(j + 1) * M + (i + 2)] - H[(j + 1) * M + i]) / (2 * step);
      const gz = (H[(j + 2) * M + (i + 1)] - H[j * M + (i + 1)]) / (2 * step);
      const l = Math.hypot(gx, 1, gz);
      pos[k * 3] = i * step; pos[k * 3 + 1] = h; pos[k * 3 + 2] = j * step;
      nor[k * 3] = -gx / l; nor[k * 3 + 1] = 1 / l; nor[k * 3 + 2] = -gz / l;
      t.colorAt(ox + i * step, oz + j * step, h, Math.hypot(gx, gz), _c, aux);
      col[k * 3] = _c.r; col[k * 3 + 1] = _c.g; col[k * 3 + 2] = _c.b;
      surf[k * 4] = aux.field; surf[k * 4 + 1] = aux.angle; surf[k * 4 + 2] = aux.rock; surf[k * 4 + 3] = aux.dirt;
    }
    const idx = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const a = j * W + i, b = (j + 1) * W + i, c = j * W + i + 1, d = (j + 1) * W + i + 1;
      idx.push(a, b, c, c, b, d);
    }
    // skirts hide cracks between neighbouring chunks of different LOD
    const ring = [];
    for (let i = 0; i < N; i++) ring.push(i);                                  // j=0
    for (let j = 0; j < N; j++) ring.push(j * W + N);                          // i=N
    for (let i = N; i > 0; i--) ring.push(N * W + i);                          // j=N
    for (let j = N; j > 0; j--) ring.push(j * W);                              // i=0
    const nxt = (n) => { const r = ring[n]; return n === 4 * N - 1 ? ring[0] : ring[n + 1]; };
    let sv = W * W;
    const drop = 2.5 + lod * 0.8;
    for (let n = 0; n < ring.length; n++) {
      const a = ring[n];
      pos[sv * 3] = pos[a * 3]; pos[sv * 3 + 1] = pos[a * 3 + 1] - drop; pos[sv * 3 + 2] = pos[a * 3 + 2];
      nor[sv * 3] = nor[a * 3]; nor[sv * 3 + 1] = nor[a * 3 + 1]; nor[sv * 3 + 2] = nor[a * 3 + 2];
      col[sv * 3] = col[a * 3]; col[sv * 3 + 1] = col[a * 3 + 1]; col[sv * 3 + 2] = col[a * 3 + 2];
      for (let q = 0; q < 4; q++) surf[sv * 4 + q] = surf[a * 4 + q];
      sv++;
    }
    for (let n = 0; n < ring.length; n++) {
      const a = ring[n], b = nxt(n), sa = W * W + n, sb = W * W + (n === ring.length - 1 ? 0 : n + 1);
      idx.push(a, sa, b, b, sa, sb);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aSurf', new THREE.BufferAttribute(surf, 4));
    g.setIndex(idx);
    g.computeBoundingSphere(); g.computeBoundingBox();
    if (chunk.terrainMesh) { chunk.group.remove(chunk.terrainMesh); chunk.terrainMesh.geometry.dispose(); }
    const mesh = new THREE.Mesh(g, Mats.terrain);
    mesh.receiveShadow = true;
    mesh.castShadow = lod <= 1;
    mesh.matrixAutoUpdate = false; mesh.updateMatrix();
    chunk.group.add(mesh);
    chunk.terrainMesh = mesh; chunk.terrainLod = lod;
  }

  // ------------------------------------------------------------------ ribbons
  _ribbon(acc, pts, halfW, vScale, vOff = 0) {
    // pts: [{x,y,z}] chunk-local; builds a strip with u across, v along
    const n = pts.length;
    if (n < 2) return;
    let v = vOff;
    const base = acc.pos.length / 3;
    for (let i = 0; i < n; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let tx = b.x - a.x, tz = b.z - a.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const nx = -tz, nz = tx;
      const p = pts[i];
      if (i > 0) v += Math.hypot(p.x - pts[i - 1].x, p.z - pts[i - 1].z) / vScale;
      acc.pos.push(p.x - nx * halfW, p.y, p.z - nz * halfW, p.x + nx * halfW, p.y, p.z + nz * halfW);
      acc.nor.push(0, 1, 0, 0, 1, 0);
      acc.uv.push(0, v, 1, v);
    }
    for (let i = 0; i < n - 1; i++) {
      const a = base + i * 2;
      acc.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  _ribGeo(acc) {
    if (!acc.pos.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(acc.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(acc.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(acc.uv, 2));
    g.setIndex(acc.idx);
    g.computeBoundingSphere();
    return g;
  }

  _roadMatKey(r) {
    if (r.type === 'paved') return 'paved';
    if (r.type === 'street') return 'street';
    if (r.type === 'lane') return 'lane';
    if (r.type === 'trail') return 'trail';
    if (r.type === 'rail') return 'rail';
    return r.id === 'farmlane' ? 'farm' : 'dirt';
  }

  // ------------------------------------------------------------------ features
  buildFeatures(chunk) { for (const _ of this.featuresGen(chunk)); void 0; }
  *featuresGen(chunk) {
    const w = this.world, S = w.structures, t = this.t;
    const { cx, cz } = chunk;
    const ox = cx * CHUNK, oz = cz * CHUNK;
    const fg = new THREE.Group();
    const owner = chunk.owner;
    chunk.interactables = [];
    const inChunk = (x, z) => x >= ox - 6 && x < ox + CHUNK + 6 && z >= oz - 6 && z < oz + CHUNK + 6;
    const key = chunk.key;
    const own = (c) => w.colliders.add(owner, c);

    // ---- road ribbons ----
    const segs = w.roadSegs.get(key);
    const railSegs = [];
    if (segs) {
      const groups = {};
      for (let q = 0; q < segs.length; q += 2) {
        const r = segs[q], i = segs[q + 1];
        if (r.s[i + 1] < r.trim0 || r.s[i] > r.length - r.trim1) continue;
        const mk = this._roadMatKey(r);
        if (r.type === 'rail') railSegs.push(r, i);
        const tex = Mats.roadTex[mk];
        const acc = groups[mk] || (groups[mk] = { pos: [], nor: [], uv: [], idx: [] });
        // a short run of 2-3 points keeps ribbon continuous across chunk boundaries
        const i0 = Math.max(0, i - 0), i1 = Math.min(r.n - 1, i + 1);
        const pts = [];
        for (let k = i0; k <= i1; k++) pts.push({ x: r.x[k] - ox, y: r.elev[k] + 0.045, z: r.z[k] - oz });
        this._ribbon(acc, pts, tex.userData.width / 2, 6, r.s[i0] / 6);
      }
      for (const mk in groups) {
        const g = this._ribGeo(groups[mk]);
        const m = new THREE.Mesh(g, Mats.road[mk]);
        m.receiveShadow = true; m.matrixAutoUpdate = false;
        fg.add(m);
      }
    }
    // ---- drives / paths ----
    const sc = S.chunk(cx, cz);
    if (sc && sc.drives.length) {
      const acc = { pos: [], nor: [], uv: [], idx: [] };
      for (const d of sc.drives) {
        const [a, b] = d.pts;
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const n = Math.max(2, Math.ceil(L / 2));
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n;
          pts.push({ x: x - ox, y: t.heightAt(x, z) + 0.05, z: z - oz });
        }
        this._ribbon(acc, pts, d.width / 2 + 0.3, 6, 0);
      }
      const g = this._ribGeo(acc);
      if (g) { const m = new THREE.Mesh(g, Mats.road.drive); m.receiveShadow = true; m.matrixAutoUpdate = false; fg.add(m); }
    }
    // ---- river water ----
    const rsegs = w.riverSegs.get(key);
    if (rsegs) {
      const acc = { pos: [], nor: [], uv: [], idx: [] };
      for (let q = 0; q < rsegs.length; q += 2) {
        const r = rsegs[q], i = rsegs[q + 1];
        const pts = [];
        for (let k = Math.max(0, i - 1); k <= Math.min(r.n - 1, i + 2); k++) pts.push({ x: r.x[k] - ox, y: r.level[k] - 0.18, z: r.z[k] - oz });
        this._ribbon(acc, pts, r.half * 1.35, 1, r.s[Math.max(0, i - 1)]);
      }
      const g = this._ribGeo(acc);
      if (g) { const m = new THREE.Mesh(g, Mats.water); m.renderOrder = 2; m.matrixAutoUpdate = false; fg.add(m); }
    }

    // ---- structures ----
    const bB = new GeoBuilder();   // opaque buildings
    const pB = new GeoBuilder();   // props
    const gB = new GeoBuilder(); gB.extra = [];
    const lampHead = new GeoBuilder();
    const metalB = new GeoBuilder();
    const sigB = [new GeoBuilder(), new GeoBuilder(), new GeoBuilder()];
    for (let q = 0; q < railSegs.length; q += 2) {
      const r = railSegs[q], i = railSegs[q + 1];
      const dx = r.x[i + 1] - r.x[i], dz = r.z[i + 1] - r.z[i], L = Math.hypot(dx, dz);
      const nx = -dz / L, nz = dx / L, rot = B.rotFromDir(dx, dz);
      const mx = (r.x[i] + r.x[i + 1]) / 2, mz = (r.z[i] + r.z[i + 1]) / 2, my = (r.elev[i] + r.elev[i + 1]) / 2;
      for (const side of [-1, 1]) pB.box(mx + nx * side * 0.7175 - ox, my + 0.135, mz + nz * side * 0.7175 - oz, L + 0.06, 0.15, 0.075, rot, B.COL.metal);
    }
    const wireVerts = [];
    const carList = [];
    const signMeshes = [];
    const treeLists = [[], [], [], []]; // oak, birch, spruce, bush
    const addTree = (x, z, type, scale, garden = false) => {
      const y = t.heightAt(x, z);
      treeLists[type].push({ x: x - ox, y, z: z - oz, scale, rot: hash2(Math.round(x * 10), Math.round(z * 10), 9) * 6.283, wx: x, wz: z });
      own(circle(x, z, TRUNK_R[type] * scale));
    };

    if (sc) {
      for (const b of sc.buildings) {
        const y = b.y;
        if (b.kind === 'house') {
          B.buildHouse(bB, gB, b, ox, oz);
          const cs = B.houseColliders(b);
          for (const c of cs.walls) own(c);
          const door = own(cs.door);
          this._makeDoor(chunk, fg, b, door, ox, oz);
        } else if (b.kind === 'shop') {
          B.buildShop(bB, gB, b, ox, oz);
          const cs = B.houseColliders(b);
          for (const c of cs.walls) own(c);
          const door = own(cs.door);
          this._makeDoor(chunk, fg, b, door, ox, oz);
          const xf = new B.Xf(b.x, y, b.z, b.rot, ox, oz);
          const sg = B.signPost(new GeoBuilder(), null, 0, 0, 0, 0, 0, 0); void sg;
          // painted fascia sign
          const P = (lx, ly) => [xf.wx(lx, b.d / 2 + 0.2) - ox, y + ly, xf.wz(lx, b.d / 2 + 0.2) - oz];
          signMeshes.push({ quads: { front: [P(-b.w * 0.34, 3.45), P(b.w * 0.34, 3.45), P(b.w * 0.34, 4.05), P(-b.w * 0.34, 4.05)], back: null }, lines: [(b.label || 'SHOP').toUpperCase()], kind: 'shop', size: [1024, 128] });
        } else if (b.kind === 'church') {
          B.buildChurch(bB, gB, b, ox, oz);
          for (const c of B.churchColliders(b)) own(c);
          const door = b.toWorld(0, b.d / 2 + 3.2); void door;
        } else if (b.kind === 'barn') {
          B.buildBarn(bB, b, ox, oz); for (const c of B.solidCollider(b)) own(c);
        } else if (b.kind === 'shed') {
          B.buildShed(bB, b, ox, oz); for (const c of B.solidCollider(b)) own(c);
        } else if (b.kind === 'silo') {
          B.buildSilo(bB, b, ox, oz); own(circle(b.x, b.z, 3.1));
        }
      }
      for (const l of sc.lamps) {
        B.lampPost(pB, lampHead, l.x, l.y, l.z, l.rot, ox, oz);
        own(circle(l.x, l.z, 0.2));
      }
      for (const p of sc.poles) {
        B.utilityPole(pB, p.x, p.y, p.z, p.rot, ox, oz);
        own(circle(p.x, p.z, 0.22));
      }
      for (const wv of sc.wires) {
        const n = 8;
        let prev = null;
        for (let i = 0; i <= n; i++) {
          const f = i / n;
          const x = wv.p0[0] + (wv.p1[0] - wv.p0[0]) * f, z = wv.p0[2] + (wv.p1[2] - wv.p0[2]) * f;
          const y = wv.p0[1] + (wv.p1[1] - wv.p0[1]) * f - wv.sag * 4 * f * (1 - f);
          const pt = [x - ox, y, z - oz];
          if (prev) wireVerts.push(...prev, ...pt);
          prev = pt;
        }
      }
      for (const f of sc.fences) {
        const y0 = t.heightAt(f.x0, f.z0), y1 = t.heightAt(f.x1, f.z1);
        B.fencePanel(pB, f.x0, y0, f.z0, f.x1, y1, f.z1, ox, oz, f.kind);
        const mx = (f.x0 + f.x1) / 2, mz = (f.z0 + f.z1) / 2;
        own(obbCollider(mx, mz, Math.hypot(f.x1 - f.x0, f.z1 - f.z0) / 2 + 0.06, 0.09, B.rotFromDir(f.x1 - f.x0, f.z1 - f.z0)));
      }
      for (const h of sc.hedges) addTree(h.x, h.z, 3, h.scale);
      for (const tr of sc.trees) addTree(tr.x, tr.z, tr.type, tr.scale, tr.garden);
      for (const bn of sc.benches) {
        const y = t.heightAt(bn.x, bn.z);
        B.bench(pB, bn.x, y, bn.z, bn.rot, ox, oz);
        own(obbCollider(bn.x, bn.z, 0.85, 0.28, bn.rot));
        chunk.interactables.push({ type: 'bench', x: bn.x, y, z: bn.z, rot: bn.rot });
      }
      for (const m of sc.mailboxes) {
        const y = t.heightAt(m.x, m.z);
        B.mailbox(pB, m.x, y, m.z, m.rot, ox, oz, m.home ? 0x9a2a22 : 0x3a4a6a);
        own(circle(m.x, m.z, 0.2));
      }
      for (const s of sc.shelters) {
        const y = t.heightAt(s.x, s.z);
        B.busShelter(pB, null, s.x, y, s.z, s.rot, ox, oz);
        own(obbCollider(s.x + Math.sin(s.rot) * -0.65, s.z + Math.cos(s.rot) * -0.65, 1.7, 0.1, s.rot));
        chunk.interactables.push({ type: 'bench', x: s.x - Math.sin(s.rot) * 0.0 + Math.sin(s.rot) * -0.15, y, z: s.z + Math.cos(s.rot) * -0.15, rot: s.rot });
      }
      for (const c of sc.cones) B.cone(pB, c.x, c.y, c.z, ox, oz);
      for (const bl of sc.bales) { const y = t.heightAt(bl.x, bl.z); B.hayBale(pB, bl.x, y, bl.z, ox, oz); own(circle(bl.x, bl.z, 0.85)); }
      for (const m of sc.misc) {
        if (m.type === 'platform') {
          const y = t.heightAt(m.x, m.z);
          pB.box(m.x - ox, y + 0.02, m.z - oz, m.len, 0.12, m.wid, m.rot, B.COL.concrete, { top: lin(0xb4b2a8) });
          const ex = Math.cos(m.rot), ez = -Math.sin(m.rot);
          pB.box(m.x - ox - ez * (m.wid / 2 - 0.1) * 0, y + 0.1, m.z - oz, m.len, 0.04, 0.16, m.rot, lin(0xe8e1b0));
          void ex;
        }
        if (m.type === 'tractor') { B.tractor(pB, m.x, t.heightAt(m.x, m.z), m.z, m.rot, ox, oz); own(obbCollider(m.x, m.z, 1.1, 1.8, m.rot)); }
      }
      for (const s of sc.signals) {
        const xf = B.trafficLight(pB, null, s.x, s.y, s.z, s.rot, ox, oz);
        for (let k = 0; k < 3; k++) xf.box(sigB[k], 0, 3.85 - k * 0.28, 0.14, 0.17, 0.17, 0.05, [1, 1, 1]);
        own(circle(s.x, s.z, 0.15));
      }
      for (const s of sc.signs) {
        const rot = s.rot || 0;
        const quads = B.signPost(pB, null, s.x, s.y ?? t.heightAt(s.x, s.z), s.z, rot, ox, oz, s.w || 1.8, s.h || 0.8, s.kind);
        signMeshes.push({ quads, lines: s.lines, kind: s.kind, size: s.kind === 'stop' ? [256, 256] : [512, 256] });
        own(obbCollider(s.x, s.z, (s.w || 1.8) / 2, 0.12, rot));
        chunk.interactables.push({ type: 'sign', x: s.x, y: (s.y ?? t.heightAt(s.x, s.z)) + 1.8, z: s.z, lines: s.lines });
      }
      for (const car of sc.cars) carList.push(car);
      for (const br of sc.bridges) {
        const cols = B.bridgeGeometry(w.roads, br, pB, ox, oz, inChunk);
        for (const c of cols) own(obbCollider(c.x, c.z, c.hx, c.hz, c.rot));
      }
    }

    yield;
    // ---- procedural forest ----
    yield* this._forest(chunk, treeLists, addTree, ox, oz);
    yield;

    // ---- assemble meshes ----
    const mkMesh = (builder, mat, cast = true, receive = true) => {
      if (builder.vertexCount === 0) return null;
      const m = new THREE.Mesh(builder.build(), mat);
      m.castShadow = cast; m.receiveShadow = receive; m.matrixAutoUpdate = false;
      fg.add(m);
      return m;
    };
    mkMesh(bB, Mats.building);
    mkMesh(pB, Mats.prop);
    mkMesh(gB, Mats.glass, false, false);
    mkMesh(lampHead, Mats.emissiveLamp, false, false);
    for (let k = 0; k < 3; k++) mkMesh(sigB[k], Mats.sig[k], false, false);
    if (wireVerts.length) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(wireVerts, 3));
      const l = new THREE.LineSegments(g, Mats.wires);
      l.matrixAutoUpdate = false; l.frustumCulled = true;
      fg.add(l);
    }
    for (const sm of signMeshes) {
      const g = new THREE.BufferGeometry();
      const pos = [], uv = [], nor = [];
      const addQ = (q) => {
        const [A, Bq, Cc, D] = q;
        for (const v of [A, Bq, Cc, A, Cc, D]) pos.push(...v);
        uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
        const ux = Bq[0] - A[0], uy = Bq[1] - A[1], uz = Bq[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2];
        let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx; const l = Math.hypot(nx, ny, nz) || 1;
        for (let i = 0; i < 6; i++) nor.push(nx / l, ny / l, nz / l);
      };
      addQ(sm.quads.front); if (sm.quads.back) addQ(sm.quads.back);
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      const tex = makeSignTexture(sm.lines, sm.kind, sm.size);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.FrontSide }));
      m.userData.ownMat = true; m.castShadow = true; m.matrixAutoUpdate = false;
      fg.add(m);
    }
    // parked cars (instanced)
    if (carList.length) {
      const bodyM = new THREE.InstancedMesh(this.car.body, Mats.car, carList.length);
      const lightM = new THREE.InstancedMesh(this.car.lights, Mats.carLights, carList.length);
      carList.forEach((c, i) => {
        const y = t.heightAt(c.x, c.z);
        _q.setFromAxisAngle(UP, c.rot); _p.set(c.x - ox, y, c.z - oz); _s.set(1, 1, 1);
        _m.compose(_p, _q, _s);
        bodyM.setMatrixAt(i, _m); lightM.setMatrixAt(i, _m);
        _c.setHex(CAR_COLORS[c.color % CAR_COLORS.length]); bodyM.setColorAt(i, _c);
        own(obbCollider(c.x, c.z, 0.95, 2.15, c.rot - Math.PI / 2 + Math.PI / 2));
      });
      bodyM.castShadow = true; bodyM.receiveShadow = true;
      fg.add(bodyM); fg.add(lightM);
    }
    // trees
    chunk.treeMeshes = [];
    for (let type = 0; type < 4; type++) {
      const list = treeLists[type];
      if (!list.length) continue;
      const mesh = new THREE.InstancedMesh(this.veg.trees[type][1], Mats.foliage, list.length);
      for (let i = 0; i < list.length; i++) {
        const tr = list[i];
        _q.setFromAxisAngle(UP, tr.rot); _p.set(tr.x, tr.y - 0.1, tr.z); _s.set(tr.scale, tr.scale * (0.9 + (tr.rot % 1) * 0.2), tr.scale);
        _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m);
        const v = 0.85 + hash2(Math.round(tr.wx), Math.round(tr.wz), 3) * 0.3;
        _c.setRGB(v, v * (0.95 + hash2(Math.round(tr.wx), Math.round(tr.wz), 4) * 0.1), v * 0.95);
        mesh.setColorAt(i, _c);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.receiveShadow = true;
      mesh.userData.type = type;
      fg.add(mesh);
      chunk.treeMeshes.push(mesh);
    }
    chunk.fg = fg;
    chunk.group.add(fg);
    chunk.hasFeatures = true;
    chunk.treeLod = -1;
    this.setTreeLod(chunk, chunk.dist);
  }

  _makeDoor(chunk, fg, b, collider, ox, oz) {
    const g = B.doorGeometry(b);
    g.userData.shared = false;
    const m = new THREE.Mesh(g, Mats.building);
    const [wx, wz] = b.toWorld(b.doorX - B.DOOR.w / 2, b.d / 2 - B.DOOR.T / 2);
    m.position.set(wx - ox, b.y + 0.04, wz - oz);
    const open = !!this.world.doorState[b.id];
    m.rotation.y = b.rot + (open ? 1.65 : 0);
    m.castShadow = true; m.receiveShadow = true;
    fg.add(m);
    collider.enabled = !open;
    const [cx, cz] = b.toWorld(b.doorX, b.d / 2);
    chunk.interactables.push({ type: 'door', building: b, mesh: m, collider, angle: open ? 1.65 : 0, target: open ? 1.65 : 0, x: cx, y: b.y + 1.2, z: cz, baseRot: b.rot, fx: Math.sin(b.rot), fz: Math.cos(b.rot) });
  }

  setTreeLod(chunk, dist) {
    const lod = dist <= 1.6 ? 0 : dist <= 3.6 ? 1 : 2;
    if (lod === chunk.treeLod) return;
    chunk.treeLod = lod;
    for (const m of chunk.treeMeshes) {
      m.geometry = this.veg.trees[m.userData.type][lod];
      m.castShadow = lod === 0;
    }
  }

  // ------------------------------------------------------------------ forest
  *_forest(chunk, lists, addTree, ox, oz) {
    const t = this.t, S = this.world.structures;
    const rng = new Rng((hash2(chunk.cx, chunk.cz, WORLD_SEED) * 4294967296) >>> 0);
    const cell = 4.4;
    const n = Math.ceil(CHUNK / cell);
    const ri = this._ri;
    const rv = {};
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      if (i === 0 && (j & 3) === 3) yield;
      const r1 = rng.next(), r2 = rng.next(), r3 = rng.next(), r4 = rng.next(), r5 = rng.next();
      const x = ox + (i + r1) * cell, z = oz + (j + r2) * cell;
      if (x >= ox + CHUNK || z >= oz + CHUNK) continue;
      const fd = t.forestDensity(x, z);
      if (fd < 0.07) continue;
      if (r3 > Math.pow(fd, 1.15) * 0.93) continue;
      if (S.blocked(x, z, 1.2)) continue;
      if (t.fieldAt(x, z)) continue;
      const inf = this.world.roads.influence(x, z, ri);
      if (inf.road && inf.d < inf.road.width / 2 + inf.road.shoulder + 2.4) continue;
      if (inf.road && inf.w > 0.02 && inf.d < inf.road.width / 2 + 7 && (inf.road.type === 'trail') === false && inf.w > 0.5) continue;
      if (this.world.rivers.influence(x, z, rv) && rv.d < rv.half + 3.0) continue;
      const y = t.heightAt(x, z);
      if (Math.abs(y - t.heightNoPads(x, z)) > 0.25) continue;
      if (y > 330 + r4 * 60) continue;
      const slope = t.slopeAt(x, z);
      if (slope > 0.7) continue;
      const cn = fbm(x * 0.012, z * 0.012, 2, 14);
      const high = smoothstep(120, 260, y);
      let type;
      if (cn > 0.12 || r5 < high * 0.8) type = 2;
      else if (r5 > 0.84) type = 1;
      else type = 0;
      const scale = (type === 2 ? 0.85 + r4 * 0.8 : 0.8 + r4 * 0.7) * (1 - 0.25 * high);
      addTree(x, z, type, scale);
    }
  }

  // ------------------------------------------------------------------ grass
  buildGrass(chunk) { for (const _ of this.grassGen(chunk)); void 0; }
  *grassGen(chunk) {
    const t = this.t, S = this.world.structures;
    const ox = chunk.cx * CHUNK, oz = chunk.cz * CHUNK;
    const rng = new Rng((hash2(chunk.cx, chunk.cz, WORLD_SEED + 7) * 4294967296) >>> 0);
    const cell = 1.05;
    const n = Math.ceil(CHUNK / cell);
    const grass = [], crop = [];
    const ri = this._ri, rv = {};
    // coarse 4 m classification grid: cheap per-tuft lookups, exact tests only near roads/water/buildings
    const CG = 4, cn = CHUNK / CG + 1;
    const cls = new Array(cn * cn);
    for (let j = 0; j < cn; j++) for (let i = 0; i < cn; i++) {
      if (i === 0 && (j & 3) === 3) yield;
      const x = ox + i * CG, z = oz + j * CG;
      const fo = t.fieldAt(x, z);
      const inf = this.world.roads.influence(x, z, ri);
      const riv = this.world.rivers.influence(x, z, rv) ? rv.d : 999;
      cls[j * cn + i] = {
        fk: fo ? fo.field.kind : null, fd: t.forestDensity(x, z),
        road: inf.road ? inf.d - inf.road.width / 2 : 99, riv: riv - 4, blk: S.blocked(x, z, 3.5),
      };
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      if (i === 0 && (j & 7) === 7) yield;
      const r1 = rng.next(), r2 = rng.next(), r3 = rng.next(), r4 = rng.next();
      const lx = (i + r1) * cell, lz = (j + r2) * cell;
      if (lx >= CHUNK || lz >= CHUNK) continue;
      const x = ox + lx, z = oz + lz;
      const c = cls[Math.round(lz / CG) * cn + Math.round(lx / CG)];
      const fk = c.fk;
      let kind = 'g';
      if (fk) {
        if (fk === 'plowed') { if (r3 > 0.1) continue; }
        else if (fk === 'wheat' || fk === 'barley') kind = 'c';
        else if (fk === 'hay') { if (r3 > 0.6) continue; }
      }
      const fd = c.fd;
      if (!fk && r3 > 0.97 - fd * 0.62) continue;
      if (c.road < 8) {
        const inf = this.world.roads.influence(x, z, ri);
        if (inf.road && inf.d < inf.road.width / 2 + 0.45 + r4 * 0.35) continue;
      }
      if (c.riv < 14 && this.world.rivers.influence(x, z, rv) && rv.d < rv.half + 0.8) continue;
      if (c.blk && S.blocked(x, z, -0.5)) continue;
      const y = t.heightAt(x, z);
      if (c.blk && Math.abs(y - t.heightNoPads(x, z)) > 0.2) continue;
      if (y > 480) continue;
      const hc = hash2(Math.round(x * 3), Math.round(z * 3), 77);
      const item = { x: lx, y, z: lz, rot: r4 * 6.283, h: 0.8 + r1 * 0.5, fk, fd, hc, wx: x, wz: z, small: kind === 'g' && fd > 0.4 };
      (kind === 'c' ? crop : grass).push(item);
    }
    const grp = new THREE.Group();
    const col = new THREE.Color();
    const mk = (list, geo, mat, isCrop) => {
      if (!list.length) return;
      const mesh = new THREE.InstancedMesh(geo, mat, list.length);
      for (let i = 0; i < list.length; i++) {
        const g = list[i];
        _q.setFromAxisAngle(UP, g.rot);
        const sxz = isCrop ? 0.9 + g.hc * 0.5 : 0.55 + g.hc * 0.5;
        const sy = isCrop ? (g.fk === 'wheat' ? 1.05 : 0.8) * g.h : (g.fk === 'pasture' ? 0.6 : 0.36) * g.h * (g.small ? 0.7 : 1);
        _p.set(g.x, g.y - 0.02, g.z); _s.set(sxz, sy, sxz);
        _m.compose(_p, _q, _s); mesh.setMatrixAt(i, _m);
        if (isCrop) {
          if (g.fk === 'wheat') col.setHex(0xd8bd58); else col.setHex(0x9db340);
          col.multiplyScalar(0.8 + g.hc * 0.4);
        } else if (g.fk === 'hay') col.setHex(0xb8a24d).multiplyScalar(0.8 + g.hc * 0.3);
        else {
          col.setHex(0x557a2c).lerp(_c.setHex(0x7f9440), g.hc).lerp(_c.setHex(0xa39b55), clamp(fbm(g.wx * 0.0021 + 7, g.wz * 0.0021 + 2, 2, 19) * 1.2 - 0.25, 0, 0.5));
          if (g.small) col.multiplyScalar(0.6);
          if (g.hc > 0.985) col.setHex(0xe8e0a0);
        }
        mesh.setColorAt(i, col);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.receiveShadow = false; mesh.castShadow = false;
      grp.add(mesh);
    };
    mk(grass, this.veg.grass[0], Mats.grass, false);
    mk(crop, this.veg.crop, Mats.crop, true);
    chunk.grassGroup = grp;
    chunk.group.add(grp);
    chunk.hasGrass = true;
  }

  // ------------------------------------------------------------------ removal
  removeFeatures(chunk) {
    if (chunk.fg) {
      chunk.group.remove(chunk.fg);
      chunk.fg.traverse((n) => {
        if (n.userData.ownMat && n.material) n.material.dispose();
      });
      disposeObject(chunk.fg);
      chunk.fg = null;
    }
    chunk.treeMeshes = [];
    chunk.interactables = [];
    this.world.colliders.removeOwner(chunk.owner);
    chunk.hasFeatures = false;
  }
  removeGrass(chunk) {
    if (chunk.grassGroup) { chunk.group.remove(chunk.grassGroup); disposeObject(chunk.grassGroup); chunk.grassGroup = null; }
    chunk.hasGrass = false;
  }
  disposeChunk(chunk) {
    this.removeFeatures(chunk); this.removeGrass(chunk);
    if (chunk.terrainMesh) { chunk.group.remove(chunk.terrainMesh); chunk.terrainMesh.geometry.dispose(); chunk.terrainMesh = null; }
  }
}
