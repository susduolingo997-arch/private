import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { Mats } from '../render/Materials.js';
import { clamp } from '../core/MathUtil.js';

const LOCO_LEN = 17, CAR_LEN = 20.5, GAP = 1.2, N_CARS = 4;
const SPEED = 23;           // m/s
const MARGIN = 420;         // virtual track past each end of the mapped area
const PERIOD = 330;         // seconds between trains (real time)

function locoGeo() {
  const b = new GeoBuilder();
  const body = lin(0x24476e), stripe = lin(0xe6c34a), dark = lin(0x1a1b1e), roof = lin(0x8b9097), glass = lin(0x15202c);
  b.box(0, 0.75, 0, 2.7, 0.5, LOCO_LEN - 1.4, 0, dark);
  b.box(0, 2.2, 0, 2.95, 2.5, LOCO_LEN - 2.4, 0, body);
  b.box(0, 2.15, LOCO_LEN / 2 - 0.9, 2.9, 2.3, 1.6, 0, body);               // nose block
  b.box(0, 3.62, 0.2, 2.6, 0.4, LOCO_LEN - 3, 0, roof);
  b.box(0, 2.85, LOCO_LEN / 2 - 0.05, 2.5, 0.9, 0.18, 0, glass);              // windscreen
  b.box(0, 1.55, 0, 2.99, 0.28, LOCO_LEN - 2.5, 0, stripe);
  for (const z of [-5.2, 5.2]) for (const x of [-1.0, 1.0]) b.box(x, 0.45, z, 0.3, 0.9, 3.0, 0, dark);
  b.box(0, 3.95, -3.5, 1.2, 0.3, 1.8, 0, roof);
  return b.build();
}
function carGeo() {
  const b = new GeoBuilder();
  const body = lin(0xe3dfd2), band = lin(0x24476e), dark = lin(0x1a1b1e), roof = lin(0x8b9097), glass = lin(0x1c2a38);
  b.box(0, 0.75, 0, 2.6, 0.5, CAR_LEN - 1.6, 0, dark);
  b.box(0, 2.15, 0, 2.8, 2.7, CAR_LEN - 0.6, 0, body);
  b.box(0, 2.45, 0, 2.86, 0.95, CAR_LEN - 2.2, 0, glass);
  b.box(0, 1.55, 0, 2.86, 0.3, CAR_LEN - 0.5, 0, band);
  b.box(0, 3.58, 0, 2.5, 0.2, CAR_LEN - 0.6, 0, roof);
  for (const z of [-6.2, 6.2]) for (const x of [-1.0, 1.0]) b.box(x, 0.45, z, 0.3, 0.9, 3.0, 0, dark);
  return b.build();
}
function lampGeo() {
  const b = new GeoBuilder();
  for (const x of [-0.8, 0.8]) b.box(x, 1.5, LOCO_LEN / 2 + 0.02, 0.35, 0.22, 0.06, 0, lin(0xfff3d0));
  return b.build();
}

/**
 * A passenger train on the Aln Valley Line. It is a world object driven by the world clock
 * (real-time seconds): it passes through the crossing every few minutes whether or not
 * anyone is watching, in alternating directions, and loops in "virtual" track beyond the mapped region.
 */
export class Trains {
  constructor(game) {
    this.g = game;
    const world = game.world;
    this.rail = world.roads.byId.railway;
    const cr = world.roads.crossings && world.roads.crossings[0];
    this.crossingS = cr ? this.rail.s[cr.i] : this.rail.length * 0.5;
    this.crossing = cr || { x: 0, z: 0 };
    this.countyS = cr ? world.structures.nearestS(cr.road, cr.x, cr.z) : 0;
    this.loco = new THREE.Mesh(locoGeo(), Mats.car); this.loco.castShadow = true; this.loco.frustumCulled = false;
    this.lamps = new THREE.Mesh(lampGeo(), Mats.carLights); this.lamps.frustumCulled = false;
    this.cars = [];
    const cg = carGeo();
    for (let i = 0; i < N_CARS; i++) { const m = new THREE.Mesh(cg, Mats.car); m.castShadow = true; m.frustumCulled = false; this.cars.push(m); game.scene.add(m); }
    game.scene.add(this.loco); game.scene.add(this.lamps);
    this.active = false; this.s = 0; this.dir = 1; this.speed = 0; this.posX = 0; this.posZ = 0; this.posY = 0;
    this.hornDone = -1; this.runId = -1;
    this.loco.visible = false; this.lamps.visible = false; this.cars.forEach((c) => (c.visible = false));
    this.length = LOCO_LEN + N_CARS * (CAR_LEN + GAP);
  }

  _at(s, out) {
    const r = this.rail;
    s = clamp(s, 0, r.length - 0.01);
    let i = Math.min(r.n - 2, Math.floor(s / 3));
    while (i > 0 && r.s[i] > s) i--;
    while (i < r.n - 2 && r.s[i + 1] < s) i++;
    const t = (s - r.s[i]) / Math.max(1e-6, r.s[i + 1] - r.s[i]);
    out.x = r.x[i] + (r.x[i + 1] - r.x[i]) * t; out.z = r.z[i] + (r.z[i + 1] - r.z[i]) * t;
    out.y = r.elev[i] + (r.elev[i + 1] - r.elev[i]) * t + 0.2;
    out.dx = r.x[i + 1] - r.x[i]; out.dz = r.z[i + 1] - r.z[i];
    return out;
  }

  /** true while the train is approaching or standing in the level crossing */
  crossingActive() {
    if (!this.active) return false;
    const d = (this.crossingS - this.s) * this.dir;     // >0 : still to come
    return d > -(this.length + 25) && d < 190;
  }

  update(dt, g) {
    const L = this.rail.length;
    const t = g.time.elapsedReal + 40;
    const run = Math.floor(t / PERIOD), phase = t - run * PERIOD;
    const runTime = (L + 2 * MARGIN + this.length) / SPEED;
    this.active = phase < runTime;
    this.dir = run % 2 === 0 ? 1 : -1;
    if (!this.active) { this.loco.visible = false; this.lamps.visible = false; this.cars.forEach((c) => (c.visible = false)); this.speed = 0; return; }
    const head = -MARGIN + SPEED * phase;                 // distance travelled by the head from the virtual start
    this.s = this.dir > 0 ? head : L - head;              // arc length of the locomotive's front
    this.speed = SPEED;
    const tmp = this._tmp || (this._tmp = {});
    const place = (mesh, sFront, len) => {
      const sc = sFront - this.dir * len / 2;
      if (sc < -len || sc > L + len) { mesh.visible = false; return; }
      this._at(sc, tmp);
      mesh.visible = true;
      // forward is toward increasing s when dir>0
      const yaw = Math.atan2(tmp.dx * this.dir, tmp.dz * this.dir);
      mesh.position.set(tmp.x, tmp.y, tmp.z); mesh.rotation.y = yaw;
    };
    place(this.loco, this.s, LOCO_LEN);
    this.lamps.visible = this.loco.visible;
    if (this.loco.visible) { this.lamps.position.copy(this.loco.position); this.lamps.rotation.y = this.loco.rotation.y; }
    this.cars.forEach((m, i) => place(m, this.s - this.dir * (LOCO_LEN + GAP + i * (CAR_LEN + GAP)), CAR_LEN));
    const lp = this._at(clamp(this.s, 0, L), tmp);
    this.posX = lp.x; this.posZ = lp.z; this.posY = lp.y;
    this.runId = run;
  }

  serialize() { return {}; }
}
void Mats;
