import * as THREE from 'three';
import { Mats } from './Materials.js';

/**
 * Far-field terrain: two coarse rings of the *same* height function the near chunks use,
 * recentred as the player moves. This is what lets you see a mountain 10 km away and
 * know you can walk there. Near the camera the ring sinks away so it never z-fights
 * with the detailed chunks. Rebuilt incrementally across frames to avoid hitches.
 */
export class DistantTerrain {
  constructor(scene, terrain) {
    this.t = terrain;
    this.rings = [
      this._ring(scene, 160, 100, 0),
      this._ring(scene, 120, 520, 0),
    ];
    this.nearR = 440;
  }

  _ring(scene, cells, cell, i) {
    const W = cells + 1;
    const pos = new Float32Array(W * W * 3), col = new Float32Array(W * W * 3);
    const idx = new Uint32Array(cells * cells * 6);
    let k = 0;
    for (let z = 0; z < cells; z++) for (let x = 0; x < cells; x++) {
      const a = z * W + x, b = (z + 1) * W + x, c = z * W + x + 1, d = (z + 1) * W + x + 1;
      idx[k++] = a; idx[k++] = b; idx[k++] = c; idx[k++] = c; idx[k++] = b; idx[k++] = d;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(new THREE.BufferAttribute(idx, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), cells * cell);
    const mat = Mats.distant.clone();
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uCam = this.camUniform || (this.camUniform = { value: new THREE.Vector3() });
      shader.uniforms.uNear = this.nearUniform || (this.nearUniform = { value: 440 });
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform vec3 uCam; uniform float uNear;')
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec4 tl_w = modelMatrix * vec4(transformed, 1.0);
          float tl_d = distance(tl_w.xz, uCam.xz);
          transformed.y -= (1.0 - smoothstep(uNear * 0.85, uNear * 1.15, tl_d)) * 60.0;
          ${i === 0 ? '' : 'transformed.y -= (1.0 - smoothstep(7000.0, 7700.0, tl_d)) * 160.0;'}`);
    };
    mat.customProgramCacheKey = () => 'distant' + i;
    mat.fog = true;
    const mesh = new THREE.Mesh(g, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    scene.add(mesh);
    return { mesh, cells, cell, W, cx: NaN, cz: NaN, row: 0, phase: 0, building: false, target: null };
  }

  update(px, pz, camPos, nearRadiusM) {
    this.nearUniform && (this.nearUniform.value = nearRadiusM);
    this.camUniform && this.camUniform.value.copy(camPos);
    for (const r of this.rings) {
      const snap = r.cell * 8;
      const cx = Math.round(px / snap) * snap, cz = Math.round(pz / snap) * snap;
      if (!r.building && (cx !== r.cx || cz !== r.cz)) { r.building = true; r.row = 0; r.phase = 0; r.target = { cx, cz }; }
      if (r.building) this._step(r, 7);
    }
  }

  _step(r, rows) {
    const { cx, cz } = r.target;
    const W = r.W, half = (r.cells * r.cell) / 2;
    const geo = r.mesh.geometry;
    if (!r.tmpPos) { r.tmpPos = new Float32Array(geo.attributes.position.array.length); r.tmpCol = new Float32Array(geo.attributes.color.array.length); }
    const pos = r.tmpPos, col = r.tmpCol;
    const t = this.t;
    if (!r.hts || r.hts.length !== W * W) r.hts = new Float32Array(W * W);
    const hts = r.hts;
    if (r.phase === 0) {
      for (let n = 0; n < rows * 3 && r.row < W; n++, r.row++) {
        const j = r.row;
        for (let i = 0; i < W; i++) {
          const x = cx - half + i * r.cell, z = cz - half + j * r.cell;
          const k = j * W + i;
          hts[k] = t.baseHeight(x, z, false, true);
          pos[k * 3] = x - cx; pos[k * 3 + 1] = hts[k]; pos[k * 3 + 2] = z - cz;
        }
      }
      if (r.row >= W) { r.phase = 1; r.row = 0; }
      return;
    }
    const c = this._c || (this._c = new THREE.Color());
    for (let n = 0; n < rows && r.row < W; n++, r.row++) {
      const j = r.row;
      for (let i = 0; i < W; i++) {
        const k = j * W + i;
        const x = cx - half + i * r.cell, z = cz - half + j * r.cell;
        const hx = hts[j * W + Math.min(W - 1, i + 1)] - hts[j * W + Math.max(0, i - 1)];
        const hz = hts[Math.min(W - 1, j + 1) * W + i] - hts[Math.max(0, j - 1) * W + i];
        const slope = Math.hypot(hx, hz) / (2 * r.cell);
        t.farColor(x, z, hts[k], slope, c);
        col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
      }
    }
    if (r.row >= W) {
      geo.attributes.position.array.set(pos); geo.attributes.color.array.set(col);
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals();
      r.mesh.position.set(cx, 0, cz);
      r.cx = cx; r.cz = cz; r.building = false; r.phase = 0;
    }
  }

  /** Fully build both rings now (start-up). */
  prewarm(px, pz) {
    for (const r of this.rings) {
      const snap = r.cell * 8;
      r.target = { cx: Math.round(px / snap) * snap, cz: Math.round(pz / snap) * snap };
      r.row = 0; r.phase = 0; r.building = true;
      this._step(r, r.W + 1); this._step(r, r.W + 1);
    }
  }
}
