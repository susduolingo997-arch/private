import { Terrain } from './Terrain.js';
import { RoadNetwork } from './Roads.js';
import { RiverNetwork } from './Rivers.js';
import { Structures } from './Structures.js';
import { Colliders } from './Colliders.js';
import { ROAD_DEFS, ROAD_TYPES, RIVER_DEFS } from './WorldDef.js';
import { chunkKey, CHUNK } from './constants.js';
import { lerp } from '../core/MathUtil.js';

/**
 * The one continuous world. Pure data + queries: no rendering. Anything that needs
 * to know "what is at (x,z)?" — the player, NPCs, vehicles, audio — asks here, and the
 * answer never depends on which chunks happen to be loaded.
 */
export class World {
  constructor() {
    this.terrain = new Terrain();
    this.rivers = new RiverNetwork(RIVER_DEFS, this.terrain);
    this.roads = new RoadNetwork(ROAD_DEFS, ROAD_TYPES, this.terrain);
    this.roads.computeBridges(this.rivers);
    this.roads.finalize();
    this.terrain.attach(this.roads, this.rivers);
    this.structures = new Structures(this);
    this.structures.generate();
    this.colliders = new Colliders();
    this.doorState = {};       // building id -> open?
    this._ri = {}; this._rv = {};
    this._indexSegments();
  }

  /** Which road / river segments live in which chunk (by midpoint). */
  _indexSegments() {
    this.roadSegs = new Map();
    this.riverSegs = new Map();
    for (const r of this.roads.roads) {
      for (let i = 0; i < r.n - 1; i++) {
        const k = chunkKey(Math.floor((r.x[i] + r.x[i + 1]) / 2 / CHUNK), Math.floor((r.z[i] + r.z[i + 1]) / 2 / CHUNK));
        let a = this.roadSegs.get(k);
        if (!a) { a = []; this.roadSegs.set(k, a); }
        a.push(r, i);
      }
    }
    for (const r of this.rivers.rivers) {
      for (let i = 0; i < r.n - 1; i++) {
        const k = chunkKey(Math.floor((r.x[i] + r.x[i + 1]) / 2 / CHUNK), Math.floor((r.z[i] + r.z[i + 1]) / 2 / CHUNK));
        let a = this.riverSegs.get(k);
        if (!a) { a = []; this.riverSegs.set(k, a); }
        a.push(r, i);
      }
    }
  }

  heightAt(x, z) { return this.terrain.heightAt(x, z); }

  deckAt(x, z) {
    const ri = this.roads.influence(x, z, this._ri);
    if (ri.road && ri.bridge > 0.02 && ri.d < ri.road.width / 2 + 0.9) {
      const r = ri.road;
      return lerp(r.elev[ri.i], r.elev[ri.i + 1], ri.t);
    }
    return NaN;
  }

  /** Walkable ground height for something currently at height py. */
  groundAt(x, z, py = 1e9) {
    const f = this.structures.floorAt(x, z);
    if (f === f && py > f - 0.7) return f;
    const d = this.deckAt(x, z);
    if (d === d && py > d - 1.3) return d;
    return this.terrain.heightAt(x, z);
  }

  /** Depth of river water at (x,z) over the terrain (0 if dry). */
  waterDepthAt(x, z) {
    if (!this.rivers.influence(x, z, this._rv)) return 0;
    const rv = this._rv;
    if (rv.d > rv.half * 1.3) return 0;
    const h = this.terrain.heightAt(x, z);
    return Math.max(0, rv.level - h);
  }

  /** Surface material under foot, for footsteps and ambience. */
  surfaceAt(x, z, py = 1e9) {
    const f = this.structures.floorAt(x, z);
    if (f === f && py > f - 0.7) return 'floor';
    const d = this.deckAt(x, z);
    if (d === d && py > d - 1.3) return 'bridge';
    if (this.waterDepthAt(x, z) > 0.12) return 'water';
    const ri = this.roads.influence(x, z, this._ri);
    if (ri.road && ri.d < ri.road.width / 2 + 0.1) return ri.road.surface;
    if (this.terrain.fieldAt(x, z)) return 'field';
    // drives/paths near buildings are gravel
    if (this.terrain.forestDensity(x, z) > 0.5) return 'forest';
    return 'grass';
  }
}
