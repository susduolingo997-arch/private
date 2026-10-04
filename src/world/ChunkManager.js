import * as THREE from 'three';
import { CHUNK, chunkKey } from './constants.js';
import { Chunk, ChunkBuilder } from './ChunkBuilder.js';
import { buildVegLib } from './Vegetation.js';

/**
 * Invisible streaming. The world is divided into 64 m chunks purely as an
 * implementation detail: chunks near the player are built (time-sliced, nearest first),
 * far ones are dropped. Nothing global lives in a chunk — time, weather, NPCs, traffic
 * all belong to the world — so crossing a chunk edge changes nothing the player can see.
 */
export class ChunkManager {
  constructor(world, scene) {
    this.world = world; this.scene = scene;
    this.veg = buildVegLib();
    this.builder = new ChunkBuilder(world, this.veg);
    this.chunks = new Map();
    this.group = new THREE.Group();
    scene.add(this.group);
    this.params = { terrainRadius: 7, featureRadius: 5, grassRadius: 2 };
    this.budgetMs = 3.5;
    this.lastCx = NaN; this.lastCz = NaN;
    this.tasks = [];
    this.active = null;
    this.onFeaturesChanged = null;
  }

  setQuality(q) { this.params = { terrainRadius: q.terrainRadius, featureRadius: q.featureRadius, grassRadius: q.grassRadius }; this.lastCx = NaN; }

  get(cx, cz) { return this.chunks.get(chunkKey(cx, cz)); }

  /** Plan work for the player's current position. */
  _plan(px, pz) {
    const cx = Math.floor(px / CHUNK), cz = Math.floor(pz / CHUNK);
    const P = this.params;
    const R = P.terrainRadius;
    const tasks = [];
    const wanted = new Set();
    const lx = px / CHUNK - 0.5, lz = pz / CHUNK - 0.5;
    for (let dz = -R - 1; dz <= R + 1; dz++) for (let dx = -R - 1; dx <= R + 1; dx++) {
      const x = cx + dx, z = cz + dz;
      const d = Math.hypot(x - lx, z - lz);
      if (d > R + 0.6) continue;
      const key = chunkKey(x, z);
      wanted.add(key);
      let ch = this.chunks.get(key);
      if (!ch) { ch = new Chunk(x, z, key); this.chunks.set(key, ch); this.group.add(ch.group); }
      ch.dist = d;
      let lod = d <= 1.6 ? 0 : d <= 3.6 ? 1 : d <= 6.2 ? 2 : 3;
      // hysteresis: do not flip LOD back and forth while standing near a threshold
      if (ch.terrainLod >= 0 && Math.abs(ch.terrainLod - lod) === 1) {
        const edge = [1.6, 3.6, 6.2][Math.min(ch.terrainLod, lod)];
        if (Math.abs(d - edge) < 0.35) lod = ch.terrainLod;
      }
      if (ch.terrainLod !== lod) tasks.push({ pri: d, ch, kind: 'terrain', lod });
      if (d <= P.featureRadius + 0.3) { if (!ch.hasFeatures) tasks.push({ pri: d + 0.01, ch, kind: 'features' }); }
      else if (ch.hasFeatures && d > P.featureRadius + 1.3) tasks.push({ pri: -1, ch, kind: 'dropFeatures' });
      if (d <= P.grassRadius + 0.3) { if (!ch.hasGrass && ch.hasFeatures) tasks.push({ pri: d + 0.02, ch, kind: 'grass' }); }
      else if (ch.hasGrass && d > P.grassRadius + 1.2) tasks.push({ pri: -1, ch, kind: 'dropGrass' });
      if (ch.hasFeatures) this.builder.setTreeLod(ch, d);
    }
    for (const [key, ch] of this.chunks) {
      if (!wanted.has(key)) tasks.push({ pri: -2, ch, kind: 'unload' });
    }
    tasks.sort((a, b) => a.pri - b.pri);
    this.tasks = tasks;
  }

  _run(task) {
    const { ch } = task;
    switch (task.kind) {
      case 'dropFeatures': this.builder.removeFeatures(ch); if (this.onFeaturesChanged) this.onFeaturesChanged(ch, false); break;
      case 'dropGrass': this.builder.removeGrass(ch); break;
      case 'unload':
        if (ch.hasFeatures && this.onFeaturesChanged) this.onFeaturesChanged(ch, false);
        this.builder.disposeChunk(ch);
        this.group.remove(ch.group);
        this.chunks.delete(ch.key);
        break;
      default: {
        // generator-based builds (terrain / features / grass) run to completion
        if (ch.busy[task.kind]) break;
        ch.busy[task.kind] = true;
        for (const _ of this._gen(task)); void 0;
        this._finish(task);
      }
    }
  }

  _gen(task) {
    const { ch } = task;
    if (task.kind === 'terrain') return this.builder.terrainGen(ch, task.lod);
    if (task.kind === 'features') return this.builder.featuresGen(ch);
    return this.builder.grassGen(ch);
  }

  _finish(task) {
    const { ch } = task;
    ch.busy[task.kind] = false;
    if (task.kind === 'terrain' && !ch.group.parent) this.group.add(ch.group);
    if (task.kind === 'features' && this.onFeaturesChanged) this.onFeaturesChanged(ch, true);
    this._replan = true;
  }

  update(px, pz, budgetMs = this.budgetMs) {
    const cx = Math.floor(px / CHUNK), cz = Math.floor(pz / CHUNK);
    if (cx !== this.lastCx || cz !== this.lastCz || (this._replan && this.tasks.length === 0 && !this.active)) {
      this.lastCx = cx; this.lastCz = cz; this._replan = false;
      this._plan(px, pz);
    }
    const t0 = performance.now();
    let n = 0;
    for (;;) {
      if (!this.active) {
        const task = this.tasks.shift();
        if (!task) break;
        if (task.kind !== 'unload' && !this.chunks.has(task.ch.key)) continue;
        if (task.kind === 'terrain' || task.kind === 'features' || task.kind === 'grass') {
          if (task.ch.busy[task.kind]) continue;
          task.ch.busy[task.kind] = true;
          this.active = { task, it: this._gen(task) };
        } else { this._run(task); n++; if (performance.now() - t0 > budgetMs) break; continue; }
      }
      const a = this.active;
      if (!this.chunks.has(a.task.ch.key)) { a.it.return(); a.task.ch.busy[a.task.kind] = false; this.active = null; continue; }
      let done = false;
      do { const r = a.it.next(); if (r.done) { done = true; break; } } while (performance.now() - t0 < budgetMs);
      if (done) { this._finish(a.task); this.active = null; n++; }
      if (!done || performance.now() - t0 > budgetMs) break;
    }
    return n;
  }

  /** Synchronously build everything within `radius` chunks (used once at start-up). */
  prewarm(px, pz, radius = 2) {
    this._plan(px, pz);
    const keep = [];
    for (const task of this.tasks) {
      const d = task.ch.dist;
      if (task.kind === 'unload') continue;
      if (d <= radius + 0.5 || task.kind === 'terrain') keep.push(task);
    }
    for (const task of keep) {
      if (task.kind === 'terrain' && task.ch.dist > 3.7 && task.ch.dist > radius + 0.5) { this._run(task); continue; }
      this._run(task);
    }
    this._plan(px, pz);
  }

  get pendingCount() { return this.tasks.length + (this.active ? 1 : 0); }

  /** Interactables from all currently built chunks near a point. */
  forEachInteractable(px, pz, fn) {
    const cx = Math.floor(px / CHUNK), cz = Math.floor(pz / CHUNK);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const ch = this.chunks.get(chunkKey(cx + dx, cz + dz));
      if (ch && ch.interactables.length) for (const it of ch.interactables) fn(it);
    }
  }
}
