import * as THREE from 'three';
import { GeoBuilder, lin } from '../core/GeoBuilder.js';
import { Rng, hash2, noise1 } from '../core/Noise.js';
import { Mats } from '../render/Materials.js';
import { clamp, damp, lerpAngle, wrapAngle } from '../core/MathUtil.js';

/** Build a simple articulated quadruped from boxes. Returns {group, legs[], head, tail}. */
export function makeQuadruped(o) {
  const rng = new Rng(o.seed || 1);
  const group = new THREE.Group();
  const mk = (b, mat = Mats.animal) => { const m = new THREE.Mesh(b.build(), mat); m.castShadow = true; return m; };
  const { L, W, H, legLen, legT } = o;
  const bodyY = legLen + H / 2;
  const body = new GeoBuilder();
  body.box(0, 0, 0, W, H, L, 0, o.body);
  if (o.patches) for (let i = 0; i < o.patches; i++) {
    const c = o.patch;
    body.box((rng.next() - 0.5) * W * 0.5, (rng.next() - 0.3) * H * 0.5, (rng.next() - 0.5) * L * 0.8, W * (0.35 + rng.next() * 0.2), H * (0.3 + rng.next() * 0.35) + 0.02, L * (0.16 + rng.next() * 0.16) + 0.02, 0, c);
  }
  if (o.belly) body.box(0, -H * 0.5 + 0.04, L * 0.1, W * 0.7, 0.1, L * 0.3, 0, o.belly);
  const bm = mk(body); bm.position.y = bodyY; group.add(bm);
  // neck + head pivot at the front-top of the body
  const head = new GeoBuilder();
  const [hw, hh, hl] = o.head;
  const neckLen = o.neck || 0.3;
  head.box(0, neckLen * 0.35, neckLen * 0.5, hw * 0.75, neckLen * 1.1, hw * 0.9, 0, o.body);
  head.box(0, neckLen * 0.6 - hh * 0.2, neckLen + hl * 0.35, hw, hh, hl, 0, o.headCol || o.body);
  if (o.snout) head.box(0, neckLen * 0.6 - hh * 0.35, neckLen + hl * 0.8, hw * 0.6, hh * 0.5, hl * 0.4, 0, o.snout);
  if (o.ears) for (const s of [-1, 1]) head.box(s * hw * 0.42, neckLen * 0.6 + hh * 0.45, neckLen + hl * 0.1, 0.05, o.ears, 0.07, 0, o.earCol || o.body);
  if (o.horns) for (const s of [-1, 1]) head.box(s * hw * 0.5, neckLen * 0.6 + hh * 0.5, neckLen + hl * 0.1, 0.04, 0.12, 0.04, 0, lin(0xd8d2c0));
  if (o.antlers) for (const s of [-1, 1]) { head.box(s * hw * 0.4, neckLen * 0.6 + hh * 0.9, neckLen + hl * 0.05, 0.03, 0.4, 0.03, 0, lin(0x7a6a50)); head.box(s * hw * 0.55, neckLen * 0.6 + hh * 1.3, neckLen + hl * 0.05, 0.03, 0.2, 0.03, 0.3 * s, lin(0x7a6a50)); }
  const hm = mk(head); hm.position.set(0, bodyY + H * 0.2, L * 0.5 - 0.05); group.add(hm);
  // mane
  if (o.mane) { const m = new GeoBuilder(); m.box(0, neckLen * 0.5, neckLen * 0.35, 0.08, neckLen * 1.2, neckLen * 0.5, 0, o.mane); hm.add(mk(m)); }
  // tail
  const tail = new GeoBuilder();
  tail.box(0, -(o.tail || 0.4) / 2, 0, 0.07, o.tail || 0.4, 0.07, 0, o.tailCol || o.body);
  const tm = mk(tail); tm.position.set(0, bodyY + H * 0.3, -L / 2); tm.rotation.x = 0.3; group.add(tm);
  // legs
  const legs = [];
  for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
    const lg = new GeoBuilder();
    lg.box(0, -legLen / 2, 0, legT, legLen, legT, 0, o.leg || o.body);
    if (o.hoof) lg.box(0, -legLen + 0.04, 0, legT * 1.1, 0.09, legT * 1.1, 0, o.hoof);
    const m = mk(lg); m.position.set(sx * (W / 2 - legT * 0.6), legLen, sz * (L / 2 - legT * 0.9)); group.add(m); legs.push(m);
  }
  return { group, legs, head: hm, tail: tm, body: bm, bodyY, kind: o.kind };
}

const COL = (h) => lin(h);
const SPECS = {
  cow: () => ({ kind: 'cow', L: 1.9, W: 0.78, H: 0.85, legLen: 0.78, legT: 0.17, head: [0.34, 0.38, 0.5], neck: 0.35, body: COL(0xe9e6df), patch: COL(0x231f1d), patches: 6, headCol: COL(0xd9d4c8), horns: true, snout: COL(0xd9a9a0), leg: COL(0xd9d4c8), hoof: COL(0x2a2220), tail: 0.7, tailCol: COL(0x2a2422), belly: COL(0xe5b7ae), ears: 0.1 }),
  cowBrown: () => ({ ...SPECS.cow(), body: COL(0x6a4630), patch: COL(0xe8e0d0), headCol: COL(0x5a3a28), leg: COL(0x5a3a28), patches: 3 }),
  horse: () => ({ kind: 'horse', L: 1.75, W: 0.55, H: 0.8, legLen: 1.05, legT: 0.13, head: [0.24, 0.3, 0.62], neck: 0.62, body: COL(0x7a4a2a), mane: COL(0x2a1a10), hoof: COL(0x1a1412), tail: 0.9, tailCol: COL(0x2a1a10), leg: COL(0x6a3f22), ears: 0.14 }),
  horseWhite: () => ({ ...SPECS.horse(), body: COL(0xd9d4c9), mane: COL(0xbab3a4), leg: COL(0xcec8bb), tailCol: COL(0xbab3a4) }),
  deer: () => ({ kind: 'deer', L: 1.25, W: 0.42, H: 0.55, legLen: 0.85, legT: 0.075, head: [0.17, 0.2, 0.36], neck: 0.5, body: COL(0x9a6c42), ears: 0.14, tail: 0.14, tailCol: COL(0xe6dccb), belly: COL(0xe8dfcf), hoof: COL(0x2a2220), antlers: true, leg: COL(0x8b5f39) }),
  rabbit: () => ({ kind: 'rabbit', L: 0.38, W: 0.2, H: 0.2, legLen: 0.08, legT: 0.06, head: [0.12, 0.12, 0.16], neck: 0.04, body: COL(0x8b7a62), ears: 0.17, tail: 0.06, tailCol: COL(0xf1ece0), belly: COL(0xd9cfbd) }),
  dog: () => ({ kind: 'dog', L: 0.72, W: 0.24, H: 0.28, legLen: 0.3, legT: 0.07, head: [0.17, 0.18, 0.2], neck: 0.12, body: COL(0xb07a43), snout: COL(0x3a2a1c), ears: 0.1, earCol: COL(0x7a4f2a), tail: 0.32, belly: COL(0xe8d9bc) }),
  dogBlack: () => ({ ...SPECS.dog(), body: COL(0x2a2724), earCol: COL(0x1a1816), snout: COL(0x151311), belly: COL(0x3a3633) }),
  cat: () => ({ kind: 'cat', L: 0.46, W: 0.17, H: 0.2, legLen: 0.16, legT: 0.055, head: [0.14, 0.13, 0.13], neck: 0.07, body: COL(0x6a6a6e), ears: 0.07, tail: 0.38, belly: COL(0xd9d4c8) }),
};
export function animalMesh(type, seed = 1) { return makeQuadruped({ ...SPECS[type](), seed }); }

/**
 * Cows, horses, deer, rabbits, a cat, and flocks of birds. Domestic animals wander their
 * paddock; wild ones keep their distance from the player. All state is world-owned.
 */
export class Animals {
  constructor(game) {
    this.g = game;
    const world = game.world, T = world.terrain;
    this.group = new THREE.Group();
    game.scene.add(this.group);
    this.list = [];
    const fieldById = (id) => T.fields.find((f) => f.id === id);
    const rng = new Rng(555);
    const addGrazers = (field, type, n) => {
      if (!field) return;
      for (let i = 0; i < n; i++) {
        const a = animalMesh(Array.isArray(type) ? type[i % type.length] : type, i + 1);
        const u = rng.range(-field.hw + 6, field.hw - 6), v = rng.range(-field.hd + 6, field.hd - 6);
        const x = field.cx + u * field.c - v * field.s, z = field.cz + u * field.s + v * field.c;
        this.group.add(a.group);
        this.list.push({ a, kind: 'graze', field, x, z, yaw: rng.next() * 6.28, state: 'graze', timer: rng.range(2, 10), tx: x, tz: z, speed: 0, phase: rng.next() * 9, id: this.list.length, scale: rng.range(0.95, 1.08) });
      }
    };
    addGrazers(fieldById('p1'), ['cow', 'cowBrown', 'cow'], 6);
    addGrazers(fieldById('p2'), ['horse', 'horseWhite'], 3);
    // wild deer at forest edges, rabbits by the meadows
    const wild = [[210, -320, 'deer'], [150, -960, 'deer'], [-330, -330, 'deer'], [60, -640, 'deer']];
    for (const [x, z, t] of wild) {
      const a = animalMesh(t, 3);
      this.group.add(a.group);
      this.list.push({ a, kind: 'wild', x, z, homeX: x, homeZ: z, yaw: rng.next() * 6.28, state: 'graze', timer: rng.range(3, 12), speed: 0, phase: rng.next() * 9, id: this.list.length, scale: 1, away: 0 });
    }
    for (let i = 0; i < 9; i++) {
      const a = animalMesh('rabbit', i);
      const ang = rng.next() * 6.28, r = rng.range(40, 200);
      const x = 20 + Math.cos(ang) * r * 1.4, z = -80 + Math.sin(ang) * r * 2;
      this.group.add(a.group);
      this.list.push({ a, kind: 'rabbit', x, z, homeX: x, homeZ: z, yaw: rng.next() * 6.28, state: 'idle', timer: rng.range(1, 6), speed: 0, phase: rng.next() * 9, id: this.list.length, scale: 1, hop: 0 });
    }
    // a cat on a garden wall in the village
    const store = world.structures.storeAt;
    if (store) {
      const a = animalMesh('cat', 4); this.group.add(a.group);
      this.list.push({ a, kind: 'cat', x: store.x + 6, z: store.z + 6, yaw: 1, state: 'sit', timer: 5, speed: 0, phase: 0, id: this.list.length, scale: 1.0 });
    }
    // birds
    this.birdN = 24;
    const bg = new GeoBuilder();
    const dark = lin(0x1c1d20);
    bg.tri([-0.9, 0.0, 0], [0.9, 0.0, 0], [0, 0.0, 0.5], dark); bg.tri([0.9, 0, 0], [-0.9, 0, 0], [0, 0, 0.5], dark);
    const geo = bg.build(); geo.userData.shared = true;
    this.birds = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), this.birdN);
    this.birds.frustumCulled = false;
    game.scene.add(this.birds);
    this.flocks = [];
    for (let i = 0; i < 3; i++) this.flocks.push({ cx: rng.range(-300, 600), cz: rng.range(-1700, 100), r: rng.range(120, 260), alt: rng.range(45, 110), speed: rng.range(0.08, 0.14), ph: rng.next() * 6.28, n: 8 });
    this._d = new THREE.Object3D();
    this.time = 0;
  }

  update(dt, g) {
    this.time += dt;
    const w = g.world, px = g.player.x, pz = g.player.z;
    const night = g.sky.night;
    for (const an of this.list) {
      const dpx = an.x - px, dpz = an.z - pz, dist = Math.hypot(dpx, dpz);
      const near = dist < 260;
      an.a.group.visible = near && !(an.hidden);
      if (!near && an.kind !== 'wild' && an.kind !== 'rabbit') continue; // far domestic animals: frozen (cheap)
      this._think(an, dt, g, dist, dpx, dpz);
      if (!near) continue;
      const y = w.heightAt(an.x, an.z);
      const grp = an.a.group;
      grp.position.set(an.x, y + (an.hopY || 0), an.z);
      grp.rotation.y = an.yaw;
      grp.scale.setScalar(an.scale || 1);
      // animation
      const moving = an.speed > 0.15;
      an.phase += dt * an.speed * (an.kind === 'rabbit' ? 0 : 2.6 / Math.max(0.5, an.a.bodyY));
      const swing = moving ? Math.min(0.9, an.speed * 0.35) : 0;
      an.a.legs.forEach((leg, i) => { leg.rotation.x = Math.sin(an.phase + (i === 0 || i === 3 ? 0 : Math.PI)) * swing; });
      const grazing = an.state === 'graze';
      const hx = grazing ? 0.95 : (an.state === 'alert' ? -0.25 : 0.0);
      an.headRot = damp(an.headRot ?? 0, hx, 3, dt);
      an.a.head.rotation.x = an.headRot + Math.sin(this.time * 0.7 + an.id) * 0.04;
      an.a.tail.rotation.x = 0.3 + Math.sin(this.time * 2.2 + an.id) * 0.18 * (an.kind === 'dog' ? 3 : 1);
      if (an.kind === 'cat') { an.a.legs.forEach((l) => (l.rotation.x = -1.2)); an.a.group.position.y = y + 0.12; }
    }
    this._birds(g, night);
  }

  _think(an, dt, g, dist, dpx, dpz) {
    const w = g.world;
    an.timer -= dt;
    if (an.kind === 'graze') {
      if (an.timer <= 0) {
        if (an.state === 'graze') {
          an.state = 'walk';
          const f = an.field;
          const u = (Math.random() * 2 - 1) * (f.hw - 5), v = (Math.random() * 2 - 1) * (f.hd - 5);
          an.tx = f.cx + u * f.c - v * f.s; an.tz = f.cz + u * f.s + v * f.c;
          an.timer = 14;
        } else { an.state = 'graze'; an.timer = 6 + Math.random() * 14; an.speed = 0; }
      }
      if (an.state === 'walk') {
        const dx = an.tx - an.x, dz = an.tz - an.z, d = Math.hypot(dx, dz);
        if (d < 1.5) { an.state = 'graze'; an.timer = 8 + Math.random() * 10; an.speed = 0; }
        else { an.speed = damp(an.speed, 0.6, 2, dt); this._steer(an, Math.atan2(dx, dz), dt, 1.2); an.x += Math.sin(an.yaw) * an.speed * dt; an.z += Math.cos(an.yaw) * an.speed * dt; }
      }
      if (an.state === 'graze') an.speed = damp(an.speed, 0, 4, dt);
    } else if (an.kind === 'wild') {
      const alertR = 55, fleeR = 30;
      if (dist < fleeR || (an.state === 'flee' && dist < 90)) {
        an.state = 'flee';
        this._steer(an, Math.atan2(dpx, dpz), dt, 5);
        an.speed = damp(an.speed, 7.5, 3, dt);
        an.x += Math.sin(an.yaw) * an.speed * dt; an.z += Math.cos(an.yaw) * an.speed * dt;
        an.timer = 6;
      } else if (dist < alertR && an.state !== 'flee') {
        an.state = 'alert'; an.speed = damp(an.speed, 0, 5, dt);
        this._steer(an, Math.atan2(-dpx, -dpz), dt, 3);
      } else {
        if (an.state === 'flee' && an.timer <= 0) { an.state = 'graze'; an.timer = 8; }
        if (an.state === 'alert') { an.state = 'graze'; an.timer = 5; }
        if (an.state === 'graze') {
          an.speed = damp(an.speed, 0, 4, dt);
          // drift back toward home eventually
          if (an.timer <= 0) { an.state = 'walk'; an.timer = 8; an.tx = an.homeX + (Math.random() - 0.5) * 30; an.tz = an.homeZ + (Math.random() - 0.5) * 30; }
        } else if (an.state === 'walk') {
          const dx = an.tx - an.x, dz = an.tz - an.z;
          this._steer(an, Math.atan2(dx, dz), dt, 1.5);
          an.speed = damp(an.speed, 0.9, 2, dt);
          an.x += Math.sin(an.yaw) * an.speed * dt; an.z += Math.cos(an.yaw) * an.speed * dt;
          if (an.timer <= 0 || Math.hypot(dx, dz) < 2) { an.state = 'graze'; an.timer = 10 + Math.random() * 8; }
        }
      }
      // deer are shy of daylight crowds and stay in the open mostly at dusk/dawn
    } else if (an.kind === 'rabbit') {
      if (dist < 14 && an.state !== 'flee') { an.state = 'flee'; an.timer = 3; }
      if (an.state === 'flee') {
        this._steer(an, Math.atan2(dpx, dpz), dt, 8);
        an.speed = 5.5; an.hop = (an.hop + dt * 9) % (Math.PI * 2);
        an.x += Math.sin(an.yaw) * an.speed * dt; an.z += Math.cos(an.yaw) * an.speed * dt;
        an.hopY = Math.abs(Math.sin(an.hop)) * 0.28;
        if (an.timer <= 0) { an.state = 'idle'; an.timer = 4; an.speed = 0; an.hopY = 0; }
      } else {
        an.speed = 0; an.hopY = 0;
        if (an.timer <= 0) {
          // small hop to a nearby spot
          an.state = 'flee'; an.timer = 0.6;
          this._steer(an, Math.random() * 6.28, 1, 10);
        }
      }
      if (Math.hypot(an.x - an.homeX, an.z - an.homeZ) > 40) { an.x += (an.homeX - an.x) * 0.02; an.z += (an.homeZ - an.z) * 0.02; }
    } else if (an.kind === 'cat') {
      if (dist < 4) { an.speed = 0; an.yaw = lerpAngle(an.yaw, Math.atan2(-dpx, -dpz) + Math.PI, 0.04); }
    }
    void w;
  }

  _steer(an, want, dt, rate) { an.yaw += wrapAngle(want - an.yaw) * Math.min(1, dt * rate); }

  _birds(g, night) {
    const d = this._d;
    let k = 0;
    const day = 1 - night;
    for (const f of this.flocks) {
      for (let i = 0; i < f.n && k < this.birdN; i++, k++) {
        const t = this.time * f.speed + f.ph + i * 0.07;
        const a = t * 2.0;
        const x = f.cx + Math.cos(a) * f.r + Math.sin(i * 12.9) * 6, z = f.cz + Math.sin(a) * f.r + Math.cos(i * 7.7) * 6;
        const y = f.alt + Math.sin(a * 1.7 + i) * 6 + i * 0.4;
        d.position.set(x, y, z);
        d.rotation.set(0, -a, Math.sin(a * 2 + i) * 0.15);
        const flap = 0.35 + 0.65 * Math.abs(Math.sin(this.time * 7 + i * 1.3));
        d.scale.set(1, flap, 1);
        d.updateMatrix();
        this.birds.setMatrixAt(k, d.matrix);
      }
    }
    for (; k < this.birdN; k++) { d.scale.setScalar(0); d.updateMatrix(); this.birds.setMatrixAt(k, d.matrix); }
    this.birds.instanceMatrix.needsUpdate = true;
    this.birds.visible = day > 0.2 && g.weather.rain < 0.5;
  }
}
void clamp; void hash2; void noise1;
