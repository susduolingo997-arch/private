import * as THREE from 'three';
import { Rng } from '../core/Noise.js';
import { Mats } from '../render/Materials.js';
import { getCarModel, CAR_COLORS } from './CarModel.js';
import { clamp } from '../core/MathUtil.js';

const LANE = 1.65;           // lane centre offset from the road centreline (drive on the right)
const MARGIN = 900;          // virtual road length beyond each end (vehicles live there off-stage)
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);
const _c = new THREE.Color();

/**
 * Background traffic. Vehicles belong to the world: they exist (and keep driving) whether
 * or not the player is anywhere near. They follow lanes of the county road, keep a safe
 * gap, stop at the village traffic signal, and live on a "virtual" stretch of road past
 * each end of the mapped area, which stands in for the rest of the world until it exists.
 */
export class Vehicles {
  constructor(game) {
    this.g = game;
    const world = game.world;
    this.road = world.roads.byId.county;
    this.signal = world.structures.signal;
    const rng = new Rng(9001);
    this.cars = [];
    const L = this.road.length;
    const N = 11;
    for (let i = 0; i < N; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      this.cars.push({
        dir, s: -MARGIN + rng.next() * (L + 2 * MARGIN), v: 0, vMax: rng.range(11, 17) * (rng.chance(0.15) ? 0.6 : 1),
        color: rng.int(0, CAR_COLORS.length - 1), len: 4.3, x: 0, z: 0, y: 0, yaw: 0, visible: false, wait: 0, id: i,
      });
    }
    const car = getCarModel();
    this.body = new THREE.InstancedMesh(car.body, Mats.car, N);
    this.lights = new THREE.InstancedMesh(car.lights, Mats.carLights, N);
    this.body.frustumCulled = false; this.lights.frustumCulled = false;
    this.body.castShadow = true; this.body.receiveShadow = true;
    this.cars.forEach((c, i) => { _c.setHex(CAR_COLORS[c.color]); this.body.setColorAt(i, _c); });
    game.scene.add(this.body); game.scene.add(this.lights);
    // two real headlight beams, handed to the nearest cars at night
    this.beams = [0, 1].map(() => {
      const s = new THREE.SpotLight(0xfff0d0, 0, 55, 0.5, 0.6, 1.5);
      s.castShadow = false; game.scene.add(s); game.scene.add(s.target);
      return s;
    });
    // lamp (stop) indicator state
    this.signalPhase = 'green';
    this._tmp = { tx: 0, tz: 0 };
  }

  // phase of the traffic signal for the main road (derived from world time → persistent)
  signalState() {
    const sg = this.signal;
    const t = (this.g.time.total * 3600) % sg.cycle;   // game seconds
    if (t < sg.greenMain) return 'green';
    if (t < sg.greenMain + sg.amber) return 'amber';
    return 'red';
  }

  update(dt, g) {
    if (!this.signal) return;
    const road = this.road, L = road.length;
    const st = this.signalState();
    this.signalPhase = st;
    const sig = this.signal;
    // update signal lamp brightness
    const on = (k) => Mats.sig[k].color.setScalar(1);
    Mats.sig.forEach((m, k) => m.color.setHex([0xff2a1a, 0xffa31a, 0x2aff55][k]).multiplyScalar(((st === 'red' && k === 0) || (st === 'amber' && k === 1) || (st === 'green' && k === 2)) ? 1.4 : 0.07));
    void on;
    const sorted = this.cars.slice().sort((a, b) => a.s - b.s);
    for (const c of this.cars) {
      // find the nearest car ahead in the same lane
      let gap = 1e9, ahead = null;
      for (const o of this.cars) {
        if (o === c || o.dir !== c.dir) continue;
        const d = (o.s - c.s) * c.dir;
        if (d > 0 && d < gap) { gap = d; ahead = o; }
      }
      // wrap-around: cars ahead beyond the virtual end do not matter
      let target = c.vMax;
      if (ahead) {
        const safe = 8 + c.v * 1.4;
        if (gap < safe + 6) target = Math.min(target, Math.max(0, ahead.v * 0.9 + (gap - safe) * 0.6));
        if (gap < 6) target = 0;
      }
      // traffic signal: stop line 9 m before the junction in direction of travel
      const stopS = sig.sJ - c.dir * 9.5;
      const toStop = (stopS - c.s) * c.dir;
      if (toStop > 0 && toStop < 45 + c.v * 3 && (st === 'red' || (st === 'amber' && toStop > c.v * 1.2 + 4))) {
        target = Math.min(target, clamp((toStop - 1) * 0.5, 0, c.vMax));
        if (toStop < 1.2) target = 0;
      }
      // gentle accel/brake
      const acc = target > c.v ? 2.2 : 5.5;
      c.v += clamp(target - c.v, -acc * dt, acc * dt);
      c.s += c.dir * c.v * dt;
      if (c.s > L + MARGIN) c.s = -MARGIN;
      if (c.s < -MARGIN) c.s = L + MARGIN;
    }
    // transforms
    const px = g.player.x, pz = g.player.z;
    const night = g.sky.night;
    let near = [];
    this.cars.forEach((c, i) => {
      const on = c.s > 0 && c.s < L;
      c.visible = on;
      if (!on) { _m.makeScale(0, 0, 0); this.body.setMatrixAt(i, _m); this.lights.setMatrixAt(i, _m); return; }
      const p = this._pos(c);
      _q.setFromAxisAngle(UP, c.yaw); _p.set(c.x, c.y, c.z);
      _m.compose(_p, _q, _s);
      this.body.setMatrixAt(i, _m); this.lights.setMatrixAt(i, _m);
      const d = Math.hypot(c.x - px, c.z - pz);
      if (d < 120) near.push({ c, d });
      void p;
    });
    this.body.instanceMatrix.needsUpdate = true; this.lights.instanceMatrix.needsUpdate = true;
    this.body.instanceColor.needsUpdate = true;
    near.sort((a, b) => a.d - b.d);
    this.nearCars = near;
    const headOn = night > 0.35 || g.sky.daylight < 0.45 || g.weather.rain > 0.4;
    for (let k = 0; k < 2; k++) {
      const b = this.beams[k], n = near[k];
      if (n && headOn) {
        const c = n.c;
        b.position.set(c.x + Math.sin(c.yaw) * 2.3, c.y + 0.75, c.z + Math.cos(c.yaw) * 2.3);
        b.target.position.set(c.x + Math.sin(c.yaw) * 25, c.y - 0.5, c.z + Math.cos(c.yaw) * 25);
        b.intensity = 90;
      } else b.intensity = 0;
    }
  }

  _pos(c) {
    const road = this.road;
    // locate segment for arc length s (road samples are 3 m apart)
    const s = clamp(c.s, 0, road.length - 0.01);
    let i = Math.min(road.n - 2, Math.floor(s / 3));
    while (i > 0 && road.s[i] > s) i--;
    while (i < road.n - 2 && road.s[i + 1] < s) i++;
    const t = (s - road.s[i]) / Math.max(1e-6, road.s[i + 1] - road.s[i]);
    const x = road.x[i] + (road.x[i + 1] - road.x[i]) * t, z = road.z[i] + (road.z[i + 1] - road.z[i]) * t;
    let tx = road.x[i + 1] - road.x[i], tz = road.z[i + 1] - road.z[i];
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    // keep to the right-hand lane of the direction of travel (right of (dx,dz) is (-dz,dx))
    const dx = tx * c.dir, dz = tz * c.dir;
    c.x = x - dz * LANE; c.z = z + dx * LANE;
    c.y = road.elev[i] + (road.elev[i + 1] - road.elev[i]) * t + 0.05;
    c.yaw = Math.atan2(dx, dz);
    return null;
  }

  serialize() { return { cars: this.cars.map((c) => [c.s, c.v]) }; }
  restore(d) {
    if (d && d.cars && d.cars.length === this.cars.length) d.cars.forEach(([s, v], i) => { this.cars[i].s = s; this.cars[i].v = v; });
  }
}
