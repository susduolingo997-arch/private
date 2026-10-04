import { Rng, hash2 } from '../core/Noise.js';
import { chunkKey, CHUNK } from './constants.js';
import { SETTLEMENTS, FIELDS, SIGNS, WORLD_SEED } from './WorldDef.js';
import { pickHouseStyle } from './Buildings.js';
import { smoothstep } from '../core/MathUtil.js';

/** A building footprint (house, shop, church, barn…). */
class Building {
  constructor(o) { Object.assign(this, o); }
  get rng() { return new Rng(this.seed); }
  /** local -> world */
  toWorld(lx, lz) {
    const cs = Math.cos(this.rot), sn = Math.sin(this.rot);
    return [this.x + lx * cs + lz * sn, this.z - lx * sn + lz * cs];
  }
  toLocal(x, z) {
    const cs = Math.cos(this.rot), sn = Math.sin(this.rot), dx = x - this.x, dz = z - this.z;
    return [dx * cs - dz * sn, dx * sn + dz * cs];
  }
  get front() { return [Math.sin(this.rot), Math.cos(this.rot)]; }
  get doorWorld() { return this.toWorld(this.doorX, this.d / 2); }
}

const EMPTY = () => ({
  buildings: [], fences: [], hedges: [], poles: [], wires: [], lamps: [], signs: [], benches: [], mailboxes: [],
  cars: [], trees: [], bales: [], cones: [], shelters: [], signals: [], drives: [], misc: [], bridges: [],
});

/**
 * Deterministic placement of every man-made thing. Runs once at start-up in a few ms for
 * the prototype area; results are indexed by chunk so streaming just looks them up.
 */
export class Structures {
  constructor(world) {
    this.w = world;
    this.t = world.terrain; this.roads = world.roads; this.rivers = world.rivers;
    this.chunks = new Map();
    this.buildings = [];
    this.byId = {};
    this.footprints = []; // {x,z,r}
    this.fpGrid = new Map();
    this.lampList = [];
    this.parkingList = [];
    this.signal = null;
    this.roadwork = null;
    this.rng = new Rng(WORLD_SEED ^ 0x51ed);
    this._ri = {}; this._rv = {};
  }

  chunk(cx, cz) { return this.chunks.get(chunkKey(cx, cz)); }
  _at(x, z) {
    const k = chunkKey(Math.floor(x / CHUNK), Math.floor(z / CHUNK));
    let c = this.chunks.get(k);
    if (!c) { c = EMPTY(); this.chunks.set(k, c); }
    return c;
  }
  add(kind, x, z, item) { this._at(x, z)[kind].push(item); return item; }

  // ---- footprints (used to keep trees away from buildings) ----
  addFootprint(x, z, r) {
    const f = { x, z, r };
    this.footprints.push(f);
    const R = r + 6;
    for (let cx = Math.floor((x - R) / 32); cx <= Math.floor((x + R) / 32); cx++)
      for (let cz = Math.floor((z - R) / 32); cz <= Math.floor((z + R) / 32); cz++) {
        const k = chunkKey(cx, cz);
        let a = this.fpGrid.get(k);
        if (!a) { a = []; this.fpGrid.set(k, a); }
        a.push(f);
      }
  }
  blocked(x, z, pad = 0) {
    const a = this.fpGrid.get(chunkKey(Math.floor(x / 32), Math.floor(z / 32)));
    if (!a) return false;
    for (let i = 0; i < a.length; i++) {
      const f = a[i];
      const dx = x - f.x, dz = z - f.z, rr = f.r + pad;
      if (dx * dx + dz * dz < rr * rr) return true;
    }
    return false;
  }

  /** Interior floor height if (x,z) is inside an enterable building, else NaN. */
  floorAt(x, z) {
    const c = this.chunks.get(chunkKey(Math.floor(x / CHUNK), Math.floor(z / CHUNK)));
    if (!c) return NaN;
    for (const b of c.buildings) {
      if (!b.enterable) continue;
      const [lx, lz] = b.toLocal(x, z);
      if (Math.abs(lx) < b.w / 2 - 0.2 && Math.abs(lz) < b.d / 2 - 0.2) return b.y + 0.04;
    }
    return NaN;
  }
  buildingAt(x, z) {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const c = this.chunks.get(chunkKey(Math.floor(x / CHUNK) + dx, Math.floor(z / CHUNK) + dz));
      if (!c) continue;
      for (const b of c.buildings) {
        const [lx, lz] = b.toLocal(x, z);
        if (Math.abs(lx) < b.w / 2 && Math.abs(lz) < b.d / 2) return b;
      }
    }
    return null;
  }

  // ------------------------------------------------------------------
  generate() {
    this.placeFarm();
    this.placeVillageCore();
    this.placeSettlements();
    this.placeHome();
    this.placeInfrastructure();
    this.placeFields();
    this.placeBridges();
    this.placeRailway();
    // flatten ground under every building
    for (const b of this.buildings) {
      const r = Math.hypot(b.w, b.d) / 2 + (b.kind === 'church' ? 3.5 : 1.8);
      this.t.pads.add(b.x, b.z, r, b.y, 5.5);
    }
  }

  // ------------------------------------------------------------------
  roadAt(road, s) {
    // sample index + position at arc length s
    let lo = 0, hi = road.n - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (road.s[m] < s) lo = m; else hi = m; }
    const t = (s - road.s[lo]) / Math.max(1e-6, road.s[hi] - road.s[lo]);
    const x = road.x[lo] + (road.x[hi] - road.x[lo]) * t, z = road.z[lo] + (road.z[hi] - road.z[lo]) * t;
    let tx = road.x[hi] - road.x[lo], tz = road.z[hi] - road.z[lo];
    const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
    return { x, z, tx, tz, nx: -tz, nz: tx, i: lo, s, elev: road.elev[lo] + (road.elev[hi] - road.elev[lo]) * t };
  }

  mkBuilding(o) {
    const y = this.t.heightNoPads(o.x, o.z);
    const b = new Building({
      id: o.id || `b${this.buildings.length}`, kind: o.kind || 'house', x: o.x, z: o.z, y, rot: o.rot,
      w: o.w, d: o.d, H: o.H || 2.7, storeys: o.storeys || 1, doorX: o.doorX ?? 0,
      style: o.style, seed: o.seed ?? ((hash2(Math.round(o.x), Math.round(o.z), 5) * 1e9) | 0),
      chimney: o.chimney || 0, canopy: !!o.canopy, enterable: o.enterable !== false && ['house', 'shop', 'church'].includes(o.kind || 'house'),
      road: o.road || null, label: o.label || null,
    });
    this.buildings.push(b); this.byId[b.id] = b;
    this.add('buildings', b.x, b.z, b);
    this.addFootprint(b.x, b.z, Math.hypot(b.w, b.d) / 2 + 3.5);
    return b;
  }

  /** Is (x,z) acceptable for a building footprint of radius r? */
  siteOk(x, z, r, rot, w, d, ownRoad) {
    if (this.t.fieldAt(x, z)) return false;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    const pts = [[0, 0], [w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]];
    let hmin = 1e9, hmax = -1e9;
    for (const [lx, lz] of pts) {
      const px = x + lx * cs + lz * sn, pz = z - lx * sn + lz * cs;
      const ri = this.roads.influence(px, pz, this._ri);
      if (ri.road) {
        const lim = ri.road.width / 2 + (ri.road === ownRoad ? 3.5 : 7);
        if (ri.d < lim) return false;
        if (ri.bridge > 0.01) return false;
      }
      if (this.rivers.influence(px, pz, this._rv) && this._rv.d < this._rv.half + 14) return false;
      const h = this.t.heightNoPads(px, pz);
      hmin = Math.min(hmin, h); hmax = Math.max(hmax, h);
    }
    if (hmax - hmin > 2.2) return false;
    if (this.blocked(x, z, r)) return false;
    return true;
  }

  /** Create a house + plot (fences, drive, mailbox, garden trees, car) facing a road. */
  houseBesideRoad(road, p, side, rng, opts = {}) {
    const dims = opts.dims || { w: rng.range(8.6, 12.4), d: rng.range(7.2, 9.6) };
    const setback = road.width / 2 + 7.5 + dims.d / 2;
    const x = p.x + p.nx * side * setback, z = p.z + p.nz * side * setback;
    const fx = -p.nx * side, fz = -p.nz * side;
    const rot = Math.atan2(fx, fz);
    if (!this.siteOk(x, z, 3, rot, dims.w, dims.d, road)) return null;
    const style = pickHouseStyle(rng);
    const b = this.mkBuilding({
      kind: opts.kind || 'house', x, z, rot, w: dims.w, d: dims.d, style,
      storeys: opts.storeys ?? (rng.chance(0.3) ? 2 : 1), doorX: rng.range(-dims.w * 0.2, dims.w * 0.2),
      chimney: rng.chance(0.6) ? (rng.chance(0.5) ? 1 : -1) : 0, canopy: rng.chance(0.4), road,
      id: opts.id, label: opts.label,
    });
    this.decoratePlot(b, road, p, side, rng, opts);
    return b;
  }

  decoratePlot(b, road, p, side, rng, opts = {}) {
    const [fx, fz] = b.front;
    const [rx, rz] = [Math.cos(b.rot), -Math.sin(b.rot)];
    const door = b.doorWorld;
    // drive from door to road edge
    const ex = p.x + p.nx * side * (road.width / 2 - 0.2), ez = p.z + p.nz * side * (road.width / 2 - 0.2);
    const sx = door[0] + fx * 1.2, sz = door[1] + fz * 1.2;
    this.add('drives', (sx + ex) / 2, (sz + ez) / 2, { pts: [[sx, sz], [ex, ez]], width: 2.6 });
    // mailbox at the roadside
    const mx = ex - fx * -0.0 + (-fx) * -3.2 * 0 + rx * 2.6 - fx * 3.1 * -1, mz = ez + rz * 2.6 - fz * 3.1 * -1;
    void mx; void mz;
    this.add('mailboxes', ex - fx * 2.4 + rx * 2.6, ez - fz * 2.4 + rz * 2.6, { x: ex - fx * 2.4 + rx * 2.6, z: ez - fz * 2.4 + rz * 2.6, rot: b.rot });
    // plot boundary
    const Pw = Math.max(18, b.w + 9);
    const zBack = -b.d / 2 - 12, zFront = b.d / 2 + 4.8;
    const style = rng.chance(0.5) ? 'picket' : 'rail';
    const line = (lx0, lz0, lx1, lz1, gap, kind) => {
      const L = Math.hypot(lx1 - lx0, lz1 - lz0);
      const n = Math.max(1, Math.round(L / (kind === 'picket' ? 3.0 : 4.0)));
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        const a = b.toWorld(lx0 + (lx1 - lx0) * t0, lz0 + (lz1 - lz0) * t0), c = b.toWorld(lx0 + (lx1 - lx0) * t1, lz0 + (lz1 - lz0) * t1);
        const mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        if (gap) {
          const [ml] = b.toLocal(mid[0], mid[1]);
          if (Math.abs(ml - b.doorX) < gap) continue;
        }
        this.fenceUnit(a, c, kind);
      }
    };
    if (!opts.noFence) {
      line(-Pw / 2, zBack, Pw / 2, zBack, 0, 'rail');
      line(-Pw / 2, zBack, -Pw / 2, zFront, 0, 'rail');
      line(Pw / 2, zBack, Pw / 2, zFront, 0, 'rail');
      const gc = b.doorX;
      line(-Pw / 2, zFront, gc - 1.7, zFront, 0, style);
      line(gc + 1.7, zFront, Pw / 2, zFront, 0, style);
    }
    this.addFootprint(...b.toWorld(0, -4), Math.max(Pw, 18) * 0.55);
    // garden trees
    const rr = new Rng(b.seed ^ 0x9e37);
    const nt = rr.int(0, 2);
    for (let i = 0; i < nt; i++) {
      const [tx, tz] = b.toWorld((rr.chance(0.5) ? -1 : 1) * rr.range(Pw * 0.25, Pw * 0.45), rr.range(zBack + 2, 0));
      if (!this.blocked(tx, tz, -4) || true) this.add('trees', tx, tz, { x: tx, z: tz, type: rr.pick([0, 0, 1]), scale: rr.range(0.85, 1.3), garden: true });
    }
    // parked car
    if (opts.car ?? rr.chance(0.4)) {
      const cx = sx + fx * 5.2 + rx * 3.4, cz = sz + fz * 5.2 + rz * 3.4;
      const car = { x: cx, z: cz, rot: Math.atan2(rx * (rr.chance(0.5) ? 1 : -1), rz * (rr.chance(0.5) ? 1 : -1)), color: rr.int(0, 7), seed: rr.int(0, 99999) };
      // Park parallel to the facade
      car.rot = Math.atan2(fx, fz) + Math.PI / 2;
      this.add('cars', cx, cz, car);
    }
  }

  fenceUnit(a, c, kind = 'rail') {
    const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2;
    this.add('fences', mx, mz, { x0: a[0], z0: a[1], x1: c[0], z1: c[1], kind });
  }

  // ------------------------------------------------------------------
  placeFarm() {
    const lane = this.roads.byId.farmlane;
    const end = this.roadAt(lane, lane.length);
    const mk = (kind, lx, lz, w, d, face, extra = {}) => {
      const x = end.x + lx, z = end.z + lz;
      const rot = Math.atan2(face[0], face[1]);
      return this.mkBuilding({ kind, x, z, rot, w, d, style: pickHouseStyle(this.rng), enterable: kind === 'house', ...extra });
    };
    // yard laid out west of the lane end
    const fh = mk('house', -34, 14, 12.5, 9.6, [0.75, -0.65], { storeys: 2, doorX: 1.2, chimney: 1, canopy: true, id: 'farmhouse', label: 'Coles Farm' });
    fh.style = { wall: 0xe9e1cc, roof: 0x5d3f2c, door: 0x2f4f6a };
    mk('barn', -66, -4, 12, 22, [1, 0], { id: 'barn' });
    mk('silo', -78, 24, 6, 6, [0, 1], { id: 'silo' });
    mk('shed', -40, -22, 6, 4.5, [0, 1], { id: 'shed' });
    this.add('misc', end.x - 18, end.z + 2, { type: 'tractor', x: end.x - 20, z: end.z + 4, rot: 0.8 });
    // yard fence + garden trees
    const fx = fh.x, fz = fh.z;
    this.add('trees', fx - 9, fz + 10, { x: fx - 9, z: fz + 10, type: 0, scale: 1.35, garden: true });
    this.add('trees', fx + 11, fz - 6, { x: fx + 11, z: fz - 6, type: 0, scale: 1.2, garden: true });
    this.addFootprint(end.x - 50, end.z + 6, 46);
  }

  placeVillageCore() {
    const county = this.roads.byId.county;
    // --- general store, east side of the main street ---
    let best = 0, bd = 1e9;
    for (let i = 0; i < county.n; i++) { const d = Math.hypot(county.x[i] - 306, county.z[i] + 1338); if (d < bd) { bd = d; best = i; } }
    const sP = this.roadAt(county, county.s[best]);
    const sd = 1; // east side (+x) given the road runs south->north, normal (-tz,tx) points east
    {
      const dims = { w: 13, d: 9.5 };
      const setback = county.width / 2 + 7.0 + dims.d / 2;
      const x = sP.x + sP.nx * sd * setback, z = sP.z + sP.nz * sd * setback;
      const rot = Math.atan2(-sP.nx * sd, -sP.nz * sd);
      const b = this.mkBuilding({ id: 'store', kind: 'shop', x, z, rot, w: dims.w, d: dims.d, H: 3.4, doorX: 0, style: { wall: 0xcfc3a6, roof: 0x6b6e75, door: 0x2f4f6a }, label: 'Millbrook Stores' });
      this.footprints.pop();
      this.addFootprint(x, z, 12);
      const door = b.doorWorld; const [fx, fz] = b.front;
      this.add('drives', x, z, { pts: [[door[0] + fx * 1.2, door[1] + fz * 1.2], [sP.x + sP.nx * sd * (county.width / 2 - 0.2), sP.z + sP.nz * sd * (county.width / 2 - 0.2)]], width: 4.5 });
      // bench in front
      this.add('benches', x, z, { x: door[0] + fx * 2.2 + (Math.cos(rot)) * 4.2, z: door[1] + fz * 2.2 - Math.sin(rot) * 4.2, rot });
      this.storeAt = { x, z, rot };
    }
    // --- bus shelter on the west side ---
    {
      const x = sP.x - sP.nx * (county.width / 2 + 3.0) + sP.tx * 8, z = sP.z - sP.nz * (county.width / 2 + 3.0) + sP.tz * 8;
      this.add('shelters', x, z, { x, z, rot: Math.atan2(sP.nx, sP.nz) });
      this.busStop = { x, z, rot: Math.atan2(sP.nx, sP.nz) };
      this.addFootprint(x, z, 3);
    }
    // --- church on Church Street ---
    {
      const rd = this.roads.byId.church;
      const p = this.roadAt(rd, 110);
      const side = -1; // north side
      const d = 17, w = 9;
      const setback = rd.width / 2 + 8 + 3.8 + d / 2;
      const x = p.x + p.nx * side * setback, z = p.z + p.nz * side * setback;
      const rot = Math.atan2(-p.nx * side, -p.nz * side);
      const b = this.mkBuilding({ id: 'church', kind: 'church', x, z, rot, w, d, doorX: 0, style: { wall: 0xb9b3a2, roof: 0x4a4d55, door: 0x5a2a22 }, label: 'St Aldric' });
      this.footprints.pop(); this.addFootprint(x, z, 22);
      const door = b.toWorld(0, d / 2 + 3.5);
      this.add('drives', x, z, { pts: [[door[0], door[1]], [p.x + p.nx * side * (rd.width / 2 - 0.2), p.z + p.nz * side * (rd.width / 2 - 0.2)]], width: 3.2 });
      // yew trees + lamp
      for (const [lx, lz] of [[-9, d / 2 + 3], [9, d / 2 + 3], [-10, -4], [10, -6]]) {
        const [tx, tz] = b.toWorld(lx, lz);
        this.add('trees', tx, tz, { x: tx, z: tz, type: 2, scale: 0.75, garden: true });
      }
      const [bx, bz] = b.toWorld(7.2, d / 2 + 6);
      this.add('benches', bx, bz, { x: bx, z: bz, rot });
    }
  }

  placeSettlements() {
    for (const s of SETTLEMENTS) {
      const rng = new Rng(WORLD_SEED ^ (s.cx * 31 + s.cz));
      for (const road of this.roads.roads) {
        if (road.type === 'dirt' || road.type === 'trail' || road.type === 'rail') continue;
        for (const side of [-1, 1]) {
          let pos = rng.range(8, s.spacing);
          while (pos < road.length - 8) {
            const p = this.roadAt(road, pos);
            const dd = Math.hypot(p.x - s.cx, p.z - s.cz);
            const nearJunction = (road.joinInfo && ((road.joinInfo.start && pos < 14) || (road.joinInfo.end && pos > road.length - 14)));
            if (dd < s.r && !nearJunction && rng.chance(s.prob * (1 - 0.5 * smoothstep(s.r * 0.6, s.r, dd)))) {
              if (this.houseBesideRoad(road, p, side, rng, { kind: 'house' })) pos += s.spacing * 0.75;
            }
            pos += s.spacing * rng.range(0.85, 1.35);
          }
        }
      }
    }
  }

  placeHome() {
    const lane = this.roads.byId.homelane;
    const e = this.roadAt(lane, lane.length - 0.5);
    const d = 8.4, w = 10.4;
    const x = e.x + e.tx * (d / 2 + 11), z = e.z + e.tz * (d / 2 + 11);
    const rot = Math.atan2(-e.tx, -e.tz);
    const b = this.mkBuilding({
      id: 'home', kind: 'house', x, z, rot, w, d, doorX: 1.0, storeys: 1, chimney: 1, canopy: true,
      style: { wall: 0xe8d9b4, roof: 0x8e4a30, door: 0x2f5a3a }, label: 'Home', seed: 424242,
    });
    b.isHome = true;
    this.home = b;
    const [fx, fz] = b.front;
    const door = b.doorWorld;
    // path from lane end to door
    const gate = b.toWorld(b.doorX, b.d / 2 + 8);
    this.add('drives', x, z, { pts: [[e.x, e.z], [gate[0], gate[1]]], width: 2.4 });
    this.add('drives', x, z, { pts: [[gate[0], gate[1]], [door[0] + fx * 1.2, door[1] + fz * 1.2]], width: 2.4 });
    this.addFootprint(...b.toWorld(0, -5), 17);
    // garden: picket fence, hedge, oak, bench, mailbox
    const Pw = 24, zBack = -b.d / 2 - 11, zFront = b.d / 2 + 8;
    const line = (lx0, lz0, lx1, lz1, gap, kind) => {
      const L = Math.hypot(lx1 - lx0, lz1 - lz0);
      const n = Math.max(1, Math.round(L / 3.0));
      for (let i = 0; i < n; i++) {
        const t0 = i / n, t1 = (i + 1) / n;
        const a = b.toWorld(lx0 + (lx1 - lx0) * t0, lz0 + (lz1 - lz0) * t0), c = b.toWorld(lx0 + (lx1 - lx0) * t1, lz0 + (lz1 - lz0) * t1);
        const [ml] = b.toLocal((a[0] + c[0]) / 2, (a[1] + c[1]) / 2);
        if (gap && Math.abs(ml - b.doorX) < gap) continue;
        this.fenceUnit(a, c, kind);
      }
    };
    line(-Pw / 2, zBack, Pw / 2, zBack, 0, 'rail');
    line(-Pw / 2, zBack, -Pw / 2, zFront, 0, 'picket');
    line(Pw / 2, zBack, Pw / 2, zFront, 0, 'picket');
    line(-Pw / 2, zFront, b.doorX - 1.9, zFront, 0, 'picket');
    line(b.doorX + 1.9, zFront, Pw / 2, zFront, 0, 'picket');
    const t1 = b.toWorld(-8.5, -3), t2 = b.toWorld(8, -9), t3 = b.toWorld(-6, 7);
    this.add('trees', t1[0], t1[1], { x: t1[0], z: t1[1], type: 0, scale: 1.6, garden: true });
    this.add('trees', t2[0], t2[1], { x: t2[0], z: t2[1], type: 1, scale: 1.1, garden: true });
    this.add('trees', t3[0], t3[1], { x: t3[0], z: t3[1], type: 0, scale: 0.9, garden: true });
    const bp = b.toWorld(-3.4, d / 2 + 1.6);
    this.add('benches', bp[0], bp[1], { x: bp[0], z: bp[1], rot: b.rot });
    const mp = b.toWorld(Pw / 2 - 1.2, zFront + 0.6);
    this.add('mailboxes', mp[0], mp[1], { x: mp[0], z: mp[1], rot: b.rot, home: true });
    this.add('signs', x, z, { x: b.toWorld(-3.2, zFront + 0.5)[0], z: b.toWorld(-3.2, zFront + 0.5)[1], rot: b.rot, lines: ['Home'], kind: 'home', w: 0.9, h: 0.4 });
    // porch lamp as a light candidate
    const pl = b.toWorld(b.doorX - 1.0, d / 2 + 0.7);
    this.lampList.push({ x: pl[0], y: b.y + 2.3, z: pl[1], color: 0xffd9a0, intensity: 5, dist: 14, home: true });
    const inside = b.toWorld(0, 0);
    this.lampList.push({ x: inside[0], y: b.y + 2.1, z: inside[1], color: 0xffcf94, intensity: 6, dist: 12, home: true, interior: true });
  }

  // ------------------------------------------------------------------
  nearOtherRoad(x, z, own, extra = 3) {
    const ri = this.roads.influence(x, z, this._ri);
    return ri.road && (ri.road !== own) && ri.d < ri.road.width / 2 + extra;
  }

  placeInfrastructure() {
    const county = this.roads.byId.county;
    const rng = new Rng(WORLD_SEED ^ 0x77);
    // --- utility poles + wires along the county road ---
    const poles = [];
    for (let s = 20; s < county.length - 10; s += 52) {
      const p = this.roadAt(county, s);
      const x = p.x + p.nx * 8.6, z = p.z + p.nz * 8.6;
      const ri = this.roads.influence(x, z, this._ri);
      if (ri.bridge > 0.01) continue;
      if (this.rivers.influence(x, z, this._rv) && this._rv.d < this._rv.half + 9) { poles.push(null); continue; }
      if (this.blocked(x, z, 0.5) || this.nearOtherRoad(x, z, county)) { poles.push(null); continue; }
      const y = this.t.heightNoPads(x, z);
      const rot = Math.atan2(-p.nz, p.nx) * 0 + Math.atan2(-p.tx, p.tz) * 0 + Math.atan2(-p.nz * 0 - 0, 1) * 0;
      // crossarm along the road normal: local x axis must point along (nx,nz)
      const pr = Math.atan2(-p.nz, p.nx);
      void rot;
      const pole = { x, z, y, rot: pr, nx: p.nx, nz: p.nz };
      poles.push(pole);
      this.add('poles', x, z, pole);
    }
    for (let i = 0; i < poles.length - 1; i++) {
      const a = poles[i], b = poles[i + 1];
      if (!a || !b) continue;
      const H = 9.5 - 0.35;
      for (const off of [-1.15, 0, 1.15]) {
        const p0 = [a.x + a.nx * off, a.y + H, a.z + a.nz * off], p1 = [b.x + b.nx * off, b.y + H, b.z + b.nz * off];
        this.add('wires', (p0[0] + p1[0]) / 2, (p0[2] + p1[2]) / 2, { p0, p1, sag: 0.9 + Math.hypot(p1[0] - p0[0], p1[2] - p0[2]) * 0.012 });
      }
    }
    // --- streetlamps in the village ---
    const lampRoads = [['county', 28, 1], ['mill', 34, 1], ['church', 34, -1], ['orchard', 38, 1]];
    for (const [id, step, side0] of lampRoads) {
      const road = this.roads.byId[id];
      let side = side0;
      for (let s = 12; s < road.length - 6; s += step) {
        const p = this.roadAt(road, s);
        if (Math.hypot(p.x - 308, p.z + 1340) > 150) continue;
        if (id === 'county' || id === 'mill') side = -side; // alternate
        const off = road.width / 2 + 1.6;
        const x = p.x + p.nx * side * off, z = p.z + p.nz * side * off;
        if (this.blocked(x, z, -2) && false) continue;
        const ri = this.roads.influence(x, z, this._ri);
        if (ri.road && ri.road !== road && ri.d < ri.road.width / 2 + 2.5) continue;
        const y = this.t.heightNoPads(x, z);
        const toRoad = [-p.nx * side, -p.nz * side];
        const lamp = { x, z, y, rot: Math.atan2(-toRoad[1], toRoad[0]) };
        this.add('lamps', x, z, lamp);
        const hx = x + toRoad[0] * 0.9, hz = z + toRoad[1] * 0.9;
        this.lampList.push({ x: hx, y: y + 4.7, z: hz, color: 0xffe2b0, intensity: 7, dist: 20 });
      }
    }
    // --- signs ---
    for (const sd of SIGNS) {
      const y = this.t.heightNoPads(sd.x, sd.z);
      this.add('signs', sd.x, sd.z, { ...sd, y, w: 1.9, h: 0.8 });
    }
    // road name/stop sign where Mill Lane meets the main street
    const mill = this.roads.byId.mill;
    {
      const p = this.roadAt(mill, 14);
      const x = p.x + p.nx * (mill.width / 2 + 1.4), z = p.z + p.nz * (mill.width / 2 + 1.4);
      this.add('signs', x, z, { x, z, y: this.t.heightNoPads(x, z), rot: Math.atan2(-p.tx, -p.tz) + Math.PI, lines: ['STOP'], kind: 'stop', w: 0.8, h: 0.8 });
    }
    // --- traffic signal at the Mill Lane crossing ---
    {
      const s0 = county.s[0];
      let best = 0, bd = 1e9;
      for (let i = 0; i < county.n; i++) { const d = Math.hypot(county.x[i] - mill.x[0], county.z[i] - mill.z[0]); if (d < bd) { bd = d; best = i; } }
      const sJ = county.s[best] - s0;
      this.signal = { sJ, x: county.x[best], z: county.z[best], cycle: 70, greenMain: 52, amber: 4 };
      const p = this.roadAt(county, sJ);
      for (const [dir, side] of [[1, 1], [-1, -1]]) {
        const sp = this.roadAt(county, sJ + dir * 9);
        const x = sp.x + sp.nx * side * (county.width / 2 + 1.0), z = sp.z + sp.nz * side * (county.width / 2 + 1.0);
        this.add('signals', x, z, { x, z, y: this.t.heightNoPads(x, z), rot: Math.atan2(-sp.tx * dir, -sp.tz * dir), dir });
      }
      void p;
    }
    // --- benches: river viewpoint + trail ---
    const br = this.roads.bridges[0];
    if (br) {
      const r = br.road;
      const p = this.roadAt(r, r.s[br.b] + 14);
      const x = p.x + p.nx * (r.width / 2 + 3.2), z = p.z + p.nz * (r.width / 2 + 3.2);
      this.add('benches', x, z, { x, z, rot: Math.atan2(-p.nx, -p.nz) + Math.PI / 2 * 0 + Math.PI });
    }
    // --- road works on the county road west of the start ---
    {
      const p = this.roadAt(county, 560);
      this.roadwork = { x: p.x, z: p.z, tx: p.tx, tz: p.tz, nx: p.nx, nz: p.nz };
      for (let i = 0; i < 7; i++) {
        const q = this.roadAt(county, 548 + i * 4.2);
        const off = county.width / 2 - 1.1 - (i < 2 || i > 4 ? 0 : 0.0);
        const x = q.x + q.nx * off, z = q.z + q.nz * off;
        this.add('cones', x, z, { x, z, y: this.t.heightNoPads(x, z) });
      }
      const s = this.roadAt(county, 540);
      const sx = s.x + s.nx * (county.width / 2 + 1.5), sz = s.z + s.nz * (county.width / 2 + 1.5);
      this.add('signs', sx, sz, { x: sx, z: sz, y: this.t.heightNoPads(sx, sz), rot: Math.atan2(-s.tx, -s.tz), lines: ['ROAD WORKS', 'Please slow down'], kind: 'road', w: 1.8, h: 0.9 });
    }
    // --- roadside trees (rows and hedgerow trees) ---
    for (const road of this.roads.roads) {
      if (road.type === 'trail' || road.type === 'rail') continue;
      for (const side of [-1, 1]) {
        let s = rng.range(4, 14);
        while (s < road.length - 4) {
          const p = this.roadAt(road, s);
          const inVillage = Math.hypot(p.x - 308, p.z + 1340) < 160;
          const off = road.width / 2 + road.shoulder + rng.range(3.6, 6.5);
          const x = p.x + p.nx * side * off, z = p.z + p.nz * side * off;
          if (rng.chance(inVillage ? 0.22 : road.type === 'paved' ? 0.3 : 0.14) && !this.blocked(x, z, 1.5) && !this.t.fieldAt(x, z)) {
            const ri = this.roads.influence(x, z, this._ri);
            if (!(ri.road && ri.road !== road && ri.d < ri.road.width / 2 + 3.5) && !(this.rivers.influence(x, z, this._rv) && this._rv.d < this._rv.half + 5))
              this.add('trees', x, z, { x, z, type: rng.chance(0.2) ? 1 : 0, scale: rng.range(0.9, 1.4), roadside: true });
          }
          s += rng.range(9, 20);
        }
      }
    }
  }

  placeFields() {
    const rng = new Rng(WORLD_SEED ^ 0x1234);
    for (const f of this.t.fields) {
      const corners = [[-f.hw, -f.hd], [f.hw, -f.hd], [f.hw, f.hd], [-f.hw, f.hd]];
      const wp = corners.map(([u, v]) => [f.cx + u * f.c - v * f.s, f.cz + u * f.s + v * f.c]);
      // choose the gate: edge whose midpoint is nearest a road
      let gateEdge = 0, gd = 1e9;
      for (let e = 0; e < 4; e++) {
        const a = wp[e], b = wp[(e + 1) % 4];
        const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
        const ri = this.roads.influence(mx, mz, this._ri);
        const d = ri.road ? ri.d : 1e6;
        if (d < gd) { gd = d; gateEdge = e; }
      }
      for (let e = 0; e < 4; e++) {
        const a = wp[e], b = wp[(e + 1) % 4];
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const hedge = f.kind !== 'pasture' && e % 2 === 0;
        const n = Math.max(1, Math.round(L / (hedge ? 2.4 : 5)));
        for (let i = 0; i < n; i++) {
          const t0 = i / n, t1 = (i + 1) / n, tm = (t0 + t1) / 2;
          const p0 = [a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], p1 = [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1];
          const mx = a[0] + (b[0] - a[0]) * tm, mz = a[1] + (b[1] - a[1]) * tm;
          const ri = this.roads.influence(mx, mz, this._ri);
          if (ri.road && ri.d < ri.road.width / 2 + 3.5) continue;          // never fence across a road
          if (this.rivers.influence(mx, mz, this._rv) && this._rv.d < this._rv.half + 3) continue;
          if (e === gateEdge && Math.abs(tm - 0.5) * L < 3.2) continue;      // field gate
          if (this.blocked(mx, mz, -2)) continue;
          if (hedge) this.add('hedges', mx, mz, { x: mx, z: mz, scale: rng.range(0.9, 1.25), seed: (rng.next() * 1e6) | 0 });
          else this.fenceUnit(p0, p1, 'rail');
        }
      }
      if (f.kind === 'hay') {
        for (let u = -f.hw + 8; u < f.hw - 6; u += 11) for (let v = -f.hd + 8; v < f.hd - 6; v += 12) {
          if (!rng.chance(0.45)) continue;
          const x = f.cx + u * f.c - v * f.s + rng.range(-1, 1), z = f.cz + u * f.s + v * f.c + rng.range(-1, 1);
          this.add('bales', x, z, { x, z });
        }
      }
    }
  }

  /** A small halt beside the county road crossing: platform, building, bench, lamps, crossing signs. */
  placeRailway() {
    const rail = this.roads.byId.railway, cr = this.roads.crossings && this.roads.crossings[0];
    if (!rail || !cr) return;
    const county = cr.road;
    const p = this.roadAt(rail, rail.s[cr.i]);
    // station sits west of the road, along the track, on the south side
    const sx = p.x - p.tx * 46 + p.nx * 11, sz = p.z - p.tz * 46 + p.nz * 11;
    const rot = Math.atan2(-p.nx, -p.nz);      // facing the track
    const b = this.mkBuilding({ id: 'station', kind: 'shop', x: sx + p.nx * 4, z: sz + p.nz * 4, rot, w: 11, d: 6.4, H: 3.1, doorX: 0, style: { wall: 0xb55a3c, roof: 0x3b3d42, door: 0x2a3f5a }, label: 'Alden Halt', enterable: true });
    b.station = true;
    this.footprints.pop(); this.addFootprint(b.x, b.z, 12);
    // platform alongside the track (flat slab)
    const pc = [p.x - p.tx * 46 + p.nx * 3.2, p.z - p.tz * 46 + p.nz * 3.2];
    this.add('misc', pc[0], pc[1], { type: 'platform', x: pc[0], z: pc[1], rot: Math.atan2(-p.tz, p.tx), len: 38, wid: 3.4 });
    const py = this.t.heightNoPads(pc[0], pc[1]);
    for (let k = -18; k <= 18; k += 3.2) this.t.pads.add(pc[0] + p.tx * k, pc[1] + p.tz * k, 2.5, py + 0.3, 1.2);
    this.add('benches', pc[0] + p.tx * 8, pc[1] + p.tz * 8, { x: pc[0] + p.tx * 8 + p.nx * 0.9, z: pc[1] + p.tz * 8 + p.nz * 0.9, rot: Math.atan2(-p.nx, -p.nz) });
    const lampAt = (k) => { const x = pc[0] + p.tx * k + p.nx * 1.6, z = pc[1] + p.tz * k + p.nz * 1.6; const y = this.t.heightNoPads(x, z) + 0.3; this.add('lamps', x, z, { x, z, y, rot: Math.atan2(-(-p.nz), -p.nx) }); this.lampList.push({ x: x + (-p.nx) * 0.9, y: y + 4.7, z: z + (-p.nz) * 0.9, color: 0xffe2b0, intensity: 7, dist: 20 }); };
    lampAt(-12); lampAt(12);
    // crossing warning signs and a bell post either side of the road
    for (const side of [-1, 1]) {
      const q = this.roadAt(county, county.s[0] + 0);
      void q;
    }
    for (const side of [-1, 1]) {
      const cp = this.roadAt(county, this.nearestS(county, cr.x, cr.z) + side * 12);
      const x = cp.x + cp.nx * (county.width / 2 + 1.8) * 1, z = cp.z + cp.nz * (county.width / 2 + 1.8) * 1;
      const y = this.t.heightNoPads(x, z);
      this.add('signs', x, z, { x, z, y, rot: Math.atan2(-cp.tx * -side, -cp.tz * -side), lines: ['LEVEL CROSSING', 'Stop · look · listen'], kind: 'road', w: 1.6, h: 0.8 });
    }
    this.station = { x: b.x, z: b.z, platform: pc };
  }

  nearestS(road, x, z) {
    let b = 0, bd = 1e18;
    for (let i = 0; i < road.n; i++) { const d = (road.x[i] - x) ** 2 + (road.z[i] - z) ** 2; if (d < bd) { bd = d; b = i; } }
    return road.s[b];
  }

  placeBridges() {
    for (const br of this.roads.bridges) {
      this.add('bridges', br.x, br.z, br);
      // spread over every chunk the bridge touches
      const r = br.road;
      const seen = new Set([chunkKey(Math.floor(br.x / CHUNK), Math.floor(br.z / CHUNK))]);
      for (let i = br.a; i <= br.b; i++) {
        const k = chunkKey(Math.floor(r.x[i] / CHUNK), Math.floor(r.z[i] / CHUNK));
        if (seen.has(k)) continue;
        seen.add(k);
        this._at(r.x[i], r.z[i]).bridges.push(br);
      }
    }
  }
}
