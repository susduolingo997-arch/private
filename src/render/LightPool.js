import * as THREE from 'three';
import { damp, smoothstep } from '../core/MathUtil.js';

/**
 * A fixed handful of real point lights that hop between the nearest lamps / lit windows.
 * (Fixed count = no shader recompiles; everything further away is faked with emissive
 * geometry.)
 */
export class LightPool {
  constructor(scene, max = 6) {
    this.max = max; this.active = max;
    this.lights = [];
    for (let i = 0; i < max; i++) {
      const l = new THREE.PointLight(0xffe0b0, 0, 20, 2);
      l.castShadow = false;
      scene.add(l);
      this.lights.push({ light: l, cur: 0, cand: null });
    }
    this.timer = 0;
    this._sel = [];
  }

  setActive(n) { this.active = Math.min(n, this.max); for (let i = this.active; i < this.max; i++) this.lights[i].light.intensity = 0; }

  update(dt, candidates, p, daylight) {
    this.timer -= dt;
    if (this.timer <= 0) {
      this.timer = 0.25;
      const sel = this._sel; sel.length = 0;
      for (const c of candidates) {
        const dx = c.x - p.x, dz = c.z - p.z, d2 = dx * dx + dz * dz;
        if (d2 < 60 * 60) sel.push({ c, d2 });
      }
      sel.sort((a, b) => a.d2 - b.d2);
      // keep current assignments where still selected to avoid popping
      const chosen = sel.slice(0, this.active).map((s) => s.c);
      for (const L of this.lights) if (L.cand && !chosen.includes(L.cand)) L.cand = null;
      for (const c of chosen) {
        if (this.lights.some((L) => L.cand === c)) continue;
        const free = this.lights.findIndex((L, i) => i < this.active && !L.cand);
        if (free >= 0) this.lights[free].cand = c;
      }
    }
    const darkness = 1 - smoothstep(0.1, 0.65, daylight);
    for (let i = 0; i < this.max; i++) {
      const L = this.lights[i];
      if (i >= this.active || !L.cand) { L.cur = damp(L.cur, 0, 6, dt); L.light.intensity = L.cur; continue; }
      const c = L.cand;
      const target = c.intensity * darkness;
      L.cur = damp(L.cur, target, 3, dt);
      L.light.intensity = L.cur;
      L.light.position.set(c.x, c.y, c.z);
      L.light.color.setHex(c.color);
      L.light.distance = c.dist || 18;
    }
  }
}
