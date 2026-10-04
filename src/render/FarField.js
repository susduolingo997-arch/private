import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';

/**
 * Distant landmarks. Detailed buildings only exist inside loaded chunks (~350 m), so a
 * village on the horizon would otherwise be invisible until you were nearly on top of it.
 * This draws every building of the world as a cheap instanced block beyond that range —
 * the same buildings, in the same places — and hides each one the moment its real
 * counterpart streams in.
 */
export class FarField {
  constructor(scene, world) {
    this.world = world;
    const b = new GeoBuilder();
    const wall = [1, 1, 1], roof = [0.34, 0.3, 0.3];
    // unit block: walls in the lower 62 %, hip roof above, footprint 1 x 1 centred
    b.box(0, 0.31, 0, 1, 0.62, 1, 0, wall, { noBottom: true });
    const t = [0, 1, 0], a = [-0.54, 0.62, 0.54], bb = [0.54, 0.62, 0.54], c = [0.54, 0.62, -0.54], d = [-0.54, 0.62, -0.54];
    b.tri(a, bb, [0.3, 1, 0], roof); b.tri(bb, c, [0.3, 1, 0], roof);
    b.tri(c, d, [-0.3, 1, 0], roof); b.tri(d, a, [-0.3, 1, 0], roof);
    b.tri(a, [0.3, 1, 0], [-0.3, 1, 0], roof); b.tri(c, [-0.3, 1, 0], [0.3, 1, 0], roof);
    void t;
    const geo = b.build();
    this.list = world.structures.buildings.filter((bd) => bd.kind !== 'shed');
    this.mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true }), this.list.length);
    this.mesh.frustumCulled = false;
    this.index = new Map();
    this.hidden = new Set();
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color();
    const up = new THREE.Vector3(0, 1, 0);
    this.list.forEach((bd, i) => {
      let w = bd.w, d = bd.d, h = bd.kind === 'church' ? 8 : bd.kind === 'barn' ? 11 : bd.kind === 'silo' ? 15 : (bd.H + (bd.storeys > 1 ? 2.7 : 0) + Math.min(2.8, bd.d * 0.34));
      if (bd.kind === 'church') { w = 9; d = 18; }
      q.setFromAxisAngle(up, bd.rot);
      p.set(bd.x, bd.y - 0.2, bd.z); s.set(w, h, d);
      m.compose(p, q, s); this.mesh.setMatrixAt(i, m);
      if (bd.style) col.setHex(bd.style.wall); else col.setHex(bd.kind === 'barn' ? 0x8a2f25 : 0xb9bcbd);
      this.mesh.setColorAt(i, col);
      this.index.set(bd.id, i);
    });
    // church tower
    const ch = world.structures.byId.church;
    if (ch) {
      this.towerIdx = this.list.length;
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.mesh.instanceColor.needsUpdate = true;
    this._m = new THREE.Matrix4(); this._zero = new THREE.Matrix4().makeScale(0, 0, 0);
    this._cache = list2cache(this.list, this.mesh);
    scene.add(this.mesh);
  }

  /** Called as chunk features stream in/out. */
  setChunkLoaded(cx, cz, loaded) {
    const sc = this.world.structures.chunk(cx, cz);
    if (!sc) return;
    for (const bd of sc.buildings) {
      const i = this.index.get(bd.id);
      if (i === undefined) continue;
      if (loaded) this.mesh.setMatrixAt(i, this._zero);
      else this.mesh.setMatrixAt(i, this._cache[i]);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

function list2cache(list, mesh) {
  return list.map((_, i) => { const m = new THREE.Matrix4(); mesh.getMatrixAt(i, m); return m; });
}
