import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { Rng } from '../core/Noise.js';
import { Mats } from '../render/Materials.js';
import { wrapAngle, damp, clamp } from '../core/MathUtil.js';
import { animalMesh } from './Animals.js';

const SKIN = [0xf1c9a5, 0xe0ac86, 0xc58c63, 0x9a6746, 0x6e4a32, 0xf5d5b8];
const HAIR = [0x2a1d14, 0x4a3320, 0x7a5a36, 0xb98f55, 0x1a1a1c, 0x8a8a8c, 0x6a2a1a];
const SHIRT = [0x3e6a8a, 0x8a3a3a, 0x5a7a4a, 0xd9d2bd, 0x2a2e3a, 0xb7893a, 0x7a5a8a, 0xe8e0d0, 0x4a8a8a];
const PANTS = [0x2a3040, 0x4a4238, 0x1e2024, 0x5a5a5e, 0x3a4a5a, 0x6a5a40];

function limb(w, len, col, colEnd) {
  const b = new GeoBuilder();
  b.box(0, -len / 2, 0, w, len, w, 0, col);
  if (colEnd) b.box(0, -len + 0.06, 0, w * 1.02, 0.14, w * 1.04, 0, colEnd);
  return b.build();
}

/** Articulated low-poly person: separate legs/arms swing while walking. */
export function makePerson(seed, opts = {}) {
  const r = new Rng(seed);
  const skin = lin(r.pick(SKIN)), hair = lin(r.pick(HAIR));
  const shirt = lin(opts.shirt ?? r.pick(SHIRT)), pants = lin(opts.pants ?? r.pick(PANTS));
  const shoe = lin(0x1c1a18);
  const child = !!opts.child;
  const S = child ? 0.68 : (0.94 + r.next() * 0.1);
  const g = new THREE.Group();
  const add = (geo, x, y, z) => { const m = new THREE.Mesh(geo, Mats.person); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  const torso = new GeoBuilder();
  torso.box(0, 0.3, 0, 0.42, 0.62, 0.23, 0, shirt);
  torso.box(0, 0.64 + 0.12, 0, 0.1, 0.12, 0.1, 0, skin);
  torso.box(0, 0.64 + 0.3, 0, 0.21, 0.24, 0.22, 0, skin);
  torso.box(0, 0.64 + 0.43, -0.01, 0.23, 0.1, 0.24, 0, hair);
  if (opts.vest) torso.box(0, 0.32, 0, 0.45, 0.5, 0.26, 0, lin(0xf0731a));
  if (opts.hat) torso.box(0, 0.64 + 0.5, 0, 0.27, 0.07, 0.3, 0, lin(opts.hat));
  const tm = add(torso.build(), 0, 0.86, 0);
  const legL = add(limb(0.17, 0.86, pants, shoe), -0.1, 0.86, 0);
  const legR = add(limb(0.17, 0.86, pants, shoe), 0.1, 0.86, 0);
  const armL = add(limb(0.12, 0.6, shirt, skin), -0.28, 1.46, 0);
  const armR = add(limb(0.12, 0.6, shirt, skin), 0.28, 1.46, 0);
  g.scale.setScalar(S);
  return { group: g, torso: tm, legL, legR, armL, armR, scale: S };
}

/** Route helpers on the road network. */
class Router {
  constructor(world) { this.w = world; this.S = world.structures; }
  curb(road, s, side) {
    const p = this.S.roadAt(road, Math.max(0, Math.min(road.length, s)));
    const off = road.width / 2 + 1.5;
    return [p.x + p.nx * side * off, p.z + p.nz * side * off];
  }
  along(road, s0, s1, side, step = 4) {
    const out = [];
    const n = Math.max(1, Math.ceil(Math.abs(s1 - s0) / step));
    for (let i = 0; i <= n; i++) out.push(this.curb(road, s0 + (s1 - s0) * (i / n), side));
    return out;
  }
  /** Brute-force nearest road sample (start-up only, so cost is irrelevant). */
  nearest(x, z) {
    let best = 1e18, bi = 0, br = null;
    for (const r of this.w.roads.roads) for (let i = 0; i < r.n; i++) {
      const d = (r.x[i] - x) ** 2 + (r.z[i] - z) ** 2;
      if (d < best) { best = d; bi = i; br = r; }
    }
    return { road: br, s: br.s[bi], d: Math.sqrt(best) };
  }
  /** nearest road point info for a building door */
  doorInfo(b) {
    const d = b.doorWorld, f = b.front;
    const out = { x: d[0] + f[0] * 1.6, z: d[1] + f[1] * 1.6 };
    const ri = this.nearest(out.x, out.z);
    const road = ri.road, s = ri.s;
    const p = this.S.roadAt(road, s);
    const side = Math.sign((out.x - p.x) * p.nx + (out.z - p.z) * p.nz) || 1;
    return { door: [out.x, out.z], road, s, side, edge: [p.x + p.nx * side * (road.width / 2 + 0.2), p.z + p.nz * side * (road.width / 2 + 0.2)] };
  }
  /** Walk from (roadA,sA,side) to (roadB,sB): follows junctions when roads are connected. */
  route(A, sA, side, B, sB, sideB = side) {
    if (A === B) return this.along(A, sA, sB, side);
    const aj = A.joinInfo && A.joinInfo.start && A.joinInfo.start.road === B ? A.joinInfo.start : null;
    if (aj) return [...this.along(A, sA, 0, side), ...this.along(B, B.s[aj.j], sB, sideB)];
    const bj = B.joinInfo && B.joinInfo.start && B.joinInfo.start.road === A ? B.joinInfo.start : null;
    if (bj) return [...this.along(A, sA, A.s[bj.j], side), ...this.along(B, 0, sB, sideB)];
    return [this.curb(A, sA, side), this.curb(B, sB, sideB)];
  }
}

/**
 * Villagers with simple daily routines. They are simulated in real time on the shared
 * world clock — they live their day whether or not the player is near, they are never
 * spawned because the player arrived, and nobody gives anyone a quest.
 */
export class NPCs {
  constructor(game) {
    this.g = game;
    this.world = game.world;
    this.group = new THREE.Group();
    game.scene.add(this.group);
    this.agents = [];
    this.dogs = [];
    this.router = new Router(this.world);
    this.build();
  }

  build() {
    const S = this.world.structures, W = this.world, R = this.router;
    const rng = new Rng(777);
    const houses = S.buildings.filter((b) => b.kind === 'house' && b.id !== 'home' && b.id !== 'farmhouse' && Math.hypot(b.x - 308, b.z + 1345) < 200);
    const county = W.roads.byId.county;
    const bus = S.busStop;
    const busInfo = bus ? R.nearest(bus.x, bus.z) : null;
    const store = S.byId.store;
    const benches = [];
    for (const c of S.chunks.values()) for (const b of c.benches) benches.push(b);
    const hr = (h, j) => h + (rng.next() - 0.5) * j;
    const shuffle = rng.pick.bind(rng);
    void shuffle;
    const mkAgent = (house, o) => {
      const person = makePerson(this.agents.length * 17 + 3, o.look || {});
      this.group.add(person.group);
      const info = R.doorInfo(house);
      const a = {
        id: this.agents.length, role: o.role, house, person, info, x: info.door[0], z: info.door[1], yaw: 0, state: 'hidden',
        sched: o.sched.sort((p, q) => p.h - q.h), idx: -1, path: null, pi: 0, speed: 0, pose: 'stand', phase: Math.random() * 6, pending: null,
        shelters: o.shelters ?? false, walkSpeed: o.speed || 1.35, wander: o.wander || 0, spot: null, away: false, rainHold: false, dog: null,
      };
      person.group.visible = false;
      this.agents.push(a);
      return a;
    };
    const stayEntry = (h, at, face, pose = 'stand', from = 'current', extra = {}) => ({ h, kind: 'go', from, path: at, end: 'stay', pose, face, ...extra });
    const homeEntry = (h, from = 'current', via = null) => ({ h, kind: 'go', from, path: via, end: 'hide' });

    // pick village houses for roles
    const pool = houses.slice();
    const take = () => pool.length ? pool.splice(Math.floor(rng.next() * pool.length), 1)[0] : null;
    const yardSpot = (b, k) => b.toWorld((k % 2 ? 1 : -1) * (2.5 + rng.next() * 3), b.d / 2 + 2.5 + rng.next() * 2.5);

    // Commuters walk to the bus stop in the morning and come back in the evening
    for (let i = 0; i < 4 && pool.length; i++) {
      const h = take(); if (!h || !busInfo) continue;
      const to = R.route(h.road || R.doorInfo(h).road, R.doorInfo(h).s, R.doorInfo(h).side, busInfo.road, busInfo.s, -1).slice(0);
      const info = R.doorInfo(h);
      const path = [info.door, info.edge, ...R.route(info.road, info.s, info.side, busInfo.road, busInfo.s, -1), [bus.x + (i - 1.5) * 0.7, bus.z + 1.0]];
      void to;
      const back = path.slice().reverse();
      mkAgent(h, { role: 'commuter', sched: [
        homeEntry(0),
        { h: hr(7.1, 0.5), kind: 'go', from: 'door', path, end: 'stay', pose: 'wait', face: bus.rot },
        { h: hr(8.2, 0.4), kind: 'go', from: 'current', path: null, end: 'away' },
        { h: hr(17.0, 0.9), kind: 'go', from: [bus.x + 0.5, bus.z + 1.2], path: back, end: 'hide' },
      ] });
    }
    // Dog walkers
    for (let i = 0; i < 2 && pool.length; i++) {
      const h = take(); if (!h) continue;
      const info = R.doorInfo(h);
      const target = info.road === county ? Math.min(county.length, info.s + (i ? 260 : -240)) : (info.road.length * 0.6);
      const out = [info.door, info.edge, ...R.route(info.road, info.s, info.side, county, target, info.side)];
      const loop = [...out, ...out.slice().reverse()];
      const a = mkAgent(h, { role: 'dogwalker', speed: 1.25, sched: [homeEntry(0), { h: hr(7.0, 0.6), kind: 'go', from: 'door', path: loop, end: 'hide' }, { h: hr(17.6, 0.8), kind: 'go', from: 'door', path: loop, end: 'hide' }] });
      const dog = animalMesh(i ? 'dogBlack' : 'dog', i + 7);
      dog.group.visible = false; this.group.add(dog.group);
      a.dog = { mesh: dog, x: a.x, z: a.z, yaw: 0, phase: 0, speed: 0 };
      this.dogs.push(a);
    }
    // Gardeners
    for (let i = 0; i < 3 && pool.length; i++) {
      const h = take(); if (!h) continue;
      const info = R.doorInfo(h);
      const spot = yardSpot(h, i);
      mkAgent(h, { role: 'gardener', shelters: true, look: { hat: 0xb89a5a }, sched: [homeEntry(0), stayEntry(hr(9.0, 1), spot, h.rot, 'work', 'door', { path: [info.door, spot] }), homeEntry(hr(12.1, 0.5), 'current', [info.door]), stayEntry(hr(14.6, 1), spot, h.rot, 'work', 'door', { path: [info.door, spot] }), homeEntry(hr(17.8, 0.6), 'current', [info.door])] });
    }
    // Shoppers walk to the store and back
    if (store) {
      for (let i = 0; i < 2 && pool.length; i++) {
        const h = take(); if (!h) continue;
        const info = R.doorInfo(h);
        const sd = store.toWorld(0.5 + i, store.d / 2 + 1.8);
        const sInfo = R.nearest(sd[0], sd[1]);
        const path = [info.door, info.edge, ...R.route(info.road, info.s, info.side, sInfo.road, sInfo.s, 1), sd];
        mkAgent(h, { role: 'shopper', sched: [homeEntry(0), { h: hr(10.2 + i * 2.3, 0.6), kind: 'go', from: 'door', path, end: 'away' }, { h: hr(11.0 + i * 2.3, 0.4), kind: 'go', from: sd, path: path.slice().reverse(), end: 'hide' }, { h: hr(16.4 + i, 0.5), kind: 'go', from: 'door', path, end: 'away' }, { h: hr(17.0 + i, 0.4), kind: 'go', from: sd, path: path.slice().reverse(), end: 'hide' }] });
      }
    }
    // Bench sitters
    for (let i = 0; i < Math.min(2, benches.length) && pool.length; i++) {
      const h = take(); const bn = benches[(i * 2) % benches.length];
      if (!h) continue;
      const info = R.doorInfo(h);
      const bi = R.nearest(bn.x, bn.z);
      const path = [info.door, info.edge, ...R.route(info.road, info.s, info.side, bi.road, bi.s, 1), [bn.x, bn.z]];
      mkAgent(h, { role: 'sitter', shelters: true, sched: [homeEntry(0), { h: hr(12.6, 1.2), kind: 'go', from: 'door', path, end: 'stay', pose: 'sit', face: bn.rot, sit: true }, { h: hr(16.2, 1.0), kind: 'go', from: 'current', path: path.slice().reverse(), end: 'hide' }] });
    }
    // Joggers
    for (let i = 0; i < 1 && pool.length; i++) {
      const h = take(); if (!h) continue;
      const info = R.doorInfo(h);
      const t1 = county.length * 0.0 + Math.max(0, S.signal.sJ - 380), t2 = Math.min(county.length, S.signal.sJ + 360);
      const out = [info.door, info.edge, ...R.route(info.road, info.s, info.side, county, t1, info.side), ...R.along(county, t1, t2, info.side, 6)];
      const loop = [...out, ...out.slice().reverse()];
      mkAgent(h, { role: 'jogger', speed: 2.7, look: { shirt: 0xe5602a, pants: 0x20242c }, sched: [homeEntry(0), { h: hr(6.5, 0.4), kind: 'go', from: 'door', path: loop, end: 'hide' }, { h: hr(18.0, 0.8), kind: 'go', from: 'door', path: loop, end: 'hide' }] });
    }
    // Children playing in yards
    for (let i = 0; i < 2 && pool.length; i++) {
      const h = take(); if (!h) continue;
      const info = R.doorInfo(h);
      const spot = yardSpot(h, i + 1);
      mkAgent(h, { role: 'child', shelters: true, wander: 5, speed: 1.5, look: { child: true, shirt: i ? 0xd04a5a : 0x4a8ad0 }, sched: [homeEntry(0), stayEntry(hr(15.4, 0.6), spot, h.rot, 'stand', 'door', { path: [info.door, spot] }), homeEntry(hr(18.4, 0.5), 'current', [info.door])] });
    }
    // Farmer
    const farm = S.byId.farmhouse;
    if (farm) {
      const info = R.doorInfo(farm);
      const lane = W.roads.byId.farmlane;
      const end = S.roadAt(lane, lane.length);
      const field = W.terrain.fields.find((f) => f.id === 'f3');
      const spot = field ? [field.cx + 40 * field.c, field.cz + 40 * field.s + 12] : [end.x, end.z];
      const out = [info.door, [end.x, end.z], ...R.along(lane, lane.length, 0, 1, 5), spot];
      const a = mkAgent(farm, { role: 'farmer', shelters: true, speed: 1.4, look: { hat: 0x4a3a22, shirt: 0x3a5a7a, pants: 0x4a4a52 }, sched: [homeEntry(0), { h: hr(7.8, 0.6), kind: 'go', from: 'door', path: out, end: 'stay', pose: 'work', face: 0.6 }, { h: hr(12.0, 0.5), kind: 'go', from: 'current', path: out.slice().reverse(), end: 'hide' }, { h: hr(14.0, 0.5), kind: 'go', from: 'door', path: out, end: 'stay', pose: 'work', face: 2.2 }, { h: hr(18.0, 0.5), kind: 'go', from: 'current', path: out.slice().reverse(), end: 'hide' }] });
      void a;
    }
    // Road workers
    if (S.roadwork) {
      const rw = S.roadwork;
      for (let i = 0; i < 2; i++) {
        const x = rw.x + rw.nx * (county.width / 2 + 2.2) + rw.tx * (i * 3 - 1.5), z = rw.z + rw.nz * (county.width / 2 + 2.2) + rw.tz * (i * 3 - 1.5);
        const a = mkAgent(farm || houses[0], { role: 'worker', shelters: true, look: { vest: true, hat: 0xf2c418, shirt: 0x2f3338, pants: 0x2f3a4a }, sched: [{ h: 0, kind: 'go', from: 'current', path: null, end: 'away' }, { h: hr(7.7, 0.4), kind: 'go', from: [x - rw.tx * 30, z - rw.tz * 30], path: [[x, z]], end: 'stay', pose: 'work', face: Math.atan2(-rw.nx, -rw.nz) }, { h: hr(16.5, 0.3), kind: 'go', from: 'current', path: null, end: 'away' }] });
        a.state = 'away';
      }
    }
  }

  prewarm() {
    for (const a of this.agents) this._settle(a);
  }

  /** Put an agent where its schedule says it should be right now (used at start-up/restore). */
  _settle(a) {
    const h = this.g.time.hours;
    let idx = -1;
    for (let i = 0; i < a.sched.length; i++) if (a.sched[i].h <= h) idx = i;
    if (idx < 0) idx = a.sched.length - 1;
    a.idx = idx;
    this._applyFinal(a, a.sched[idx]);
  }

  _applyFinal(a, e) {
    a.path = null; a.pi = 0; a.speed = 0;
    if (e.end === 'hide') { a.state = 'hidden'; a.x = a.info.door[0]; a.z = a.info.door[1]; }
    else if (e.end === 'away') { a.state = 'away'; }
    else {
      const p = e.path && e.path.length ? e.path[e.path.length - 1] : [a.x, a.z];
      a.x = p[0]; a.z = p[1]; a.state = 'stay'; a.pose = e.pose || 'stand'; a.yaw = e.face ?? a.yaw;
      a.spot = [a.x, a.z];
    }
  }

  _begin(a, e) {
    const from = e.from;
    if (from === 'door') { a.x = a.info.door[0]; a.z = a.info.door[1]; }
    else if (Array.isArray(from)) { a.x = from[0]; a.z = from[1]; }
    // 'current' keeps position
    a.pose = 'stand';
    if (!e.path || !e.path.length) { this._applyFinal(a, e); a.entry = e; return; }
    a.entry = e;
    a.path = e.path; a.pi = 0; a.state = 'walk';
    // start from the nearest segment point
    a.speed = 0;
  }

  update(dt, g) {
    const h = g.time.hours;
    const px = g.player.x, pz = g.player.z;
    const rain = g.weather.rain;
    for (const a of this.agents) {
      // schedule switch
      let idx = -1;
      for (let i = 0; i < a.sched.length; i++) if (a.sched[i].h <= h) idx = i;
      if (idx < 0) idx = a.sched.length - 1;
      const dist = Math.hypot(a.x - px, a.z - pz);
      if (idx !== a.idx) {
        const busy = a.state === 'walk' && dist < 120;
        if (!busy) { a.idx = idx; this._begin(a, a.sched[idx]); a.pending = null; }
        else a.pending = idx;
      }
      if (a.pending !== null && a.pending !== undefined && a.state !== 'walk') { a.idx = a.pending; a.pending = null; this._begin(a, a.sched[a.idx]); }
      // shelter from heavy rain
      if (a.shelters && a.state === 'stay' && rain > 0.55 && !a.rainHold) {
        a.rainHold = true;
        if (dist > 150) { a.state = 'hidden'; a.x = a.info.door[0]; a.z = a.info.door[1]; }
        else { a.path = [[a.info.door[0], a.info.door[1]]]; a.pi = 0; a.state = 'walk'; a.entry = { end: 'hide' }; }
      }
      if (a.rainHold && rain < 0.25) { a.rainHold = false; if (a.state === 'hidden' && a.sched[a.idx].end === 'stay') this._begin(a, { ...a.sched[a.idx], from: 'door' }); }
      this._move(a, dt, g, dist);
      this._render(a, dt, g, dist);
    }
  }

  _move(a, dt, g, dist) {
    if (a.state === 'walk' && a.path) {
      // pause if the player is in the way
      const tgt = a.path[a.pi];
      if (!tgt) { this._finish(a); return; }
      const dx = tgt[0] - a.x, dz = tgt[1] - a.z, d = Math.hypot(dx, dz);
      const pdx = g.player.x - a.x, pdz = g.player.z - a.z, pd = Math.hypot(pdx, pdz);
      let want = a.walkSpeed;
      let sideX = 0, sideZ = 0;
      if (pd < 2.4 && (pdx * dx + pdz * dz) > 0) {
        // someone (the player) is in the way: slow down and step around them
        want *= 0.55;
        const cross = dx * pdz - dz * pdx;
        const sg = cross > 0 ? -1 : 1;
        sideX = (-dz / (d || 1)) * sg * 1.1; sideZ = (dx / (d || 1)) * sg * 1.1;
      }
      a.speed = damp(a.speed, want, 5, dt);
      if (d < 0.5) { a.pi++; if (a.pi >= a.path.length) this._finish(a); return; }
      const want_yaw = Math.atan2(dx, dz);
      a.yaw += wrapAngle(want_yaw - a.yaw) * Math.min(1, dt * 6);
      const step = Math.min(d, a.speed * dt);
      a.x += (dx / d) * step + sideX * dt; a.z += (dz / d) * step + sideZ * dt;
      // far from the player and not rendered: skip ahead to keep daily schedules honest
      if (dist > 220 && a.speed > 0.5) {
        a.x += (dx / d) * Math.min(d, a.speed * dt * 6); a.z += (dz / d) * Math.min(d, a.speed * dt * 6);
      }
    } else if (a.state === 'stay') {
      a.speed = damp(a.speed, 0, 6, dt);
      if (a.wander && a.spot) {
        a.wanderT = (a.wanderT ?? 0) - dt;
        if (a.wanderT <= 0) { a.wanderT = 2 + Math.random() * 5; const ang = Math.random() * 6.28, r = Math.random() * a.wander; a.wanderTo = [a.spot[0] + Math.cos(ang) * r, a.spot[1] + Math.sin(ang) * r]; }
        if (a.wanderTo) {
          const dx = a.wanderTo[0] - a.x, dz = a.wanderTo[1] - a.z, d = Math.hypot(dx, dz);
          if (d > 0.3) { a.speed = damp(a.speed, 1.3, 4, dt); a.yaw += wrapAngle(Math.atan2(dx, dz) - a.yaw) * Math.min(1, dt * 5); a.x += dx / d * a.speed * dt; a.z += dz / d * a.speed * dt; }
        }
      }
    }
  }

  _finish(a) {
    const e = a.entry || a.sched[a.idx];
    a.path = null;
    this._applyFinal(a, e);
    if (e.face !== undefined && e.end === 'stay') a.yaw = e.face;
  }

  _render(a, dt, g, dist) {
    const P = a.person, grp = P.group;
    const visible = (a.state === 'walk' || a.state === 'stay') && dist < 230;
    grp.visible = visible;
    if (a.dog) a.dog.mesh.group.visible = visible && dist < 200;
    if (!visible) return;
    const w = g.world;
    const y = w.groundAt(a.x, a.z, 1e9) ;
    a.phase += dt * a.speed * 3.6;
    const sw = clamp(a.speed / 1.4, 0, 2.2);
    const run = a.speed > 2.0;
    const swing = Math.sin(a.phase) * 0.62 * sw * (run ? 0.85 : 1);
    P.legL.rotation.x = swing; P.legR.rotation.x = -swing;
    P.armL.rotation.x = -swing * 0.8; P.armR.rotation.x = swing * 0.8;
    grp.position.set(a.x, y + Math.abs(Math.sin(a.phase)) * 0.025 * sw, a.z);
    grp.rotation.y = a.yaw;
    P.torso.rotation.x = run ? 0.18 : 0;
    P.armL.rotation.z = P.armR.rotation.z = 0;
    P.armL.rotation.y = P.armR.rotation.y = 0;
    if (a.state === 'stay') {
      const t = performance.now() / 1000 + a.id;
      if (a.pose === 'sit') {
        P.legL.rotation.x = P.legR.rotation.x = -1.45;
        grp.position.y = y + 0.46 * P.scale - 0.06;
        P.armL.rotation.x = P.armR.rotation.x = -0.6;
        P.torso.rotation.x = -0.05;
      } else if (a.pose === 'work') {
        const k = Math.sin(t * 2.2);
        P.torso.rotation.x = 0.55 + k * 0.12; P.armL.rotation.x = -1.0 + k * 0.5; P.armR.rotation.x = -1.0 - k * 0.5;
        P.legL.rotation.x = P.legR.rotation.x = 0;
      } else if (a.pose === 'wait') {
        P.armL.rotation.x = 0; P.armR.rotation.x = 0;
        P.torso.rotation.z = Math.sin(t * 0.6) * 0.02;
        P.legL.rotation.x = Math.sin(t * 0.35) * 0.04; P.legR.rotation.x = 0;
      } else { P.legL.rotation.x = P.legR.rotation.x = 0; }
    }
    // dog follows its owner
    if (a.dog && grp.visible) {
      const d = a.dog;
      const tx = a.x - Math.sin(a.yaw) * 1.4 + Math.cos(a.yaw) * Math.sin(performance.now() / 1300 + a.id) * 0.9;
      const tz = a.z - Math.cos(a.yaw) * 1.4 - Math.sin(a.yaw) * Math.sin(performance.now() / 1300 + a.id) * 0.9;
      const dx = tx - d.x, dz = tz - d.z, dd = Math.hypot(dx, dz);
      const sp = clamp(dd * 2.2, 0, 4);
      d.speed = damp(d.speed, sp, 5, dt);
      if (dd > 0.05) { d.yaw += wrapAngle(Math.atan2(dx, dz) - d.yaw) * Math.min(1, dt * 7); d.x += dx / dd * Math.min(dd, d.speed * dt); d.z += dz / dd * Math.min(dd, d.speed * dt); }
      d.phase += dt * d.speed * 6;
      const m = d.mesh;
      m.group.position.set(d.x, w.heightAt(d.x, d.z), d.z); m.group.rotation.y = d.yaw;
      const s2 = Math.min(0.9, d.speed * 0.3);
      m.legs.forEach((l, i) => { l.rotation.x = Math.sin(d.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * s2; });
      m.tail.rotation.x = 0.4 + Math.sin(performance.now() / 120 + a.id) * 0.5;
      m.head.rotation.x = Math.sin(performance.now() / 700 + a.id) * 0.1 + (d.speed < 0.3 ? 0.4 : 0);
    }
  }

  visibleAgents() { return this.agents.filter((a) => a.person.group.visible); }

  serialize() { return { t: 1 }; }
  restore() { /* agents are re-settled from the schedule at start-up */ }
}
void Router;
