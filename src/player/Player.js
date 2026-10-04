import * as THREE from 'three';
import { clamp, damp, DEG } from '../core/MathUtil.js';
import { Settings } from '../core/Settings.js';

const WALK_SPEED = 1.5;      // m/s — a relaxed, believable walking pace; there is no sprint
const RADIUS = 0.32;
const EYE = 1.68;

/**
 * First-person walking controller. Movement is physical: it follows the real height
 * function, slows uphill (Tobler's hiking function), refuses cliffs and deep water, and
 * collides with trunks, walls and fences — no invisible walls anywhere.
 */
export class Player {
  constructor(world, camera, input) {
    this.world = world; this.camera = camera; this.input = input;
    this.x = 0; this.z = 0; this.y = 0;     // y = ground height under feet
    this.eye = 1.68 + 0;
    this.eyeY = 0;
    this.yaw = 0; this.pitch = 0;
    this.vx = 0; this.vz = 0;
    this.speed = 0;
    this.bobPhase = 0; this.bobAmp = 0;
    this.stepDist = 0; this.stepSide = 0;
    this.surface = 'grass';
    this.inWater = false;
    this.sitting = null;
    this.onStep = null;
    this.distanceWalked = 0;
    this.indoors = false;
    this._out = { x: 0, z: 0, hit: false };
    this.enabled = false;
  }

  teleport(x, z, yaw = this.yaw) {
    this.x = x; this.z = z; this.yaw = yaw;
    this.y = this.world.groundAt(x, z);
    this.eyeY = this.y + EYE;
  }

  _blocked(nx, nz, fromH) {
    const w = this.world;
    const h = w.groundAt(nx, nz, fromH + 0.5);
    const rise = h - fromH;
    if (rise > 0.5) return true;            // too steep to step up: a wall, cliff or kerb
    const depth = w.waterDepthAt(nx, nz);
    if (depth > 0.95 && w.deckAt(nx, nz) !== w.deckAt(nx, nz)) return true; // deep water
    return false;
  }

  update(dt) {
    const S = Settings.values, inp = this.input, w = this.world;
    const look = inp.consume();
    if (this.enabled) {
      const sens = 0.0022 * S.mouseSensitivity;
      this.yaw -= look.dx * sens;
      this.pitch -= look.dy * sens * (S.invertY ? -1 : 1);
      this.pitch = clamp(this.pitch, -1.5, 1.5);
    }
    // --- intent ---
    let fwd = 0, side = 0;
    if (this.enabled) {
      if (inp.down('KeyW') || inp.down('ArrowUp')) fwd += 1;
      if (inp.down('KeyS') || inp.down('ArrowDown')) fwd -= 1;
      if (inp.down('KeyD') || inp.down('ArrowRight')) side += 1;
      if (inp.down('KeyA') || inp.down('ArrowLeft')) side -= 1;
    }
    if (this.sitting) {
      if (fwd || side) this.sitting = null; // any movement key stands you up
      else {
        this.vx = this.vz = 0; this.speed = 0;
        const target = this.sitting.y + 1.18;
        this.eyeY = damp(this.eyeY, target, 6, dt);
        this.x = damp(this.x, this.sitting.x, 6, dt); this.z = damp(this.z, this.sitting.z, 6, dt);
        this._apply(dt);
        return;
      }
    }
    const len = Math.hypot(fwd, side) || 1;
    fwd /= len; side /= len;
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    // forward is -Z at yaw 0
    let dx = -sy * fwd + cy * side, dz = -cy * fwd - sy * side;
    const want = (fwd || side) ? 1 : 0;
    // terrain-dependent speed (Tobler)
    let factor = 1;
    if (want) {
      const h0 = this.y, h1 = w.groundAt(this.x + dx * 1.2, this.z + dz * 1.2, this.y + 0.5);
      const slope = (h1 - h0) / 1.2;
      factor = clamp(Math.exp(-3.5 * (Math.abs(slope + 0.05) - 0.05)), 0.32, 1.12);
    }
    const slow = (inp.down('ShiftLeft') || inp.down('ShiftRight')) ? 0.5 : 1;   // stroll
    const depthHere = w.waterDepthAt(this.x, this.z);
    const wade = depthHere > 0.12 && this.surface === 'water' ? 0.72 : 1;
    const targetSpeed = want * WALK_SPEED * S.walkPace * factor * slow * wade;
    const tvx = dx * targetSpeed, tvz = dz * targetSpeed;
    const accel = (want ? 5.2 : 7.5) * S.movementSensitivity;
    this.vx = damp(this.vx, tvx, accel, dt);
    this.vz = damp(this.vz, tvz, accel, dt);
    const sp = Math.hypot(this.vx, this.vz);
    // --- move with sliding collision ---
    if (sp > 0.001) {
      let nx = this.x + this.vx * dt, nz = this.z + this.vz * dt;
      const h0 = this.y;
      if (this._blocked(nx, nz, h0)) {
        if (!this._blocked(nx, this.z, h0)) nz = this.z;
        else if (!this._blocked(this.x, nz, h0)) nx = this.x;
        else { nx = this.x; nz = this.z; this.vx *= 0.3; this.vz *= 0.3; }
      }
      const r = w.colliders.resolve(nx, nz, RADIUS, this._out);
      nx = r.x; nz = r.z;
      const moved = Math.hypot(nx - this.x, nz - this.z);
      this.x = nx; this.z = nz;
      this.distanceWalked += moved;
      this.stepDist += moved;
      this.bobPhase += moved * 4.1;
    }
    this.speed = sp;
    this.y = damp(this.y, w.groundAt(this.x, this.z, this.y + 0.6), 14, dt);
    // snap if the difference is large (e.g. teleport)
    const gy = w.groundAt(this.x, this.z, this.y + 0.6);
    if (Math.abs(gy - this.y) > 1.5) this.y = gy;
    this.eyeY = damp(this.eyeY, this.y + EYE, 12, dt);
    // --- footsteps ---
    this.surface = w.surfaceAt(this.x, this.z, this.y + 0.6);
    this.indoors = this.surface === 'floor';
    const stride = 0.74 * (slow < 1 ? 0.8 : 1) * (0.7 + 0.3 * S.walkPace);
    if (this.stepDist >= stride) {
      this.stepDist -= stride;
      this.stepSide ^= 1;
      if (this.onStep) this.onStep(this.surface, this.stepSide, Math.min(1, sp / (WALK_SPEED * S.walkPace)));
    }
    this._apply(dt);
  }

  _apply(dt) {
    const cam = this.camera;
    const S = Settings.values;
    const moving = clamp(this.speed / (WALK_SPEED * Settings.values.walkPace), 0, 1.2);
    this.bobAmp = damp(this.bobAmp, moving, 7, dt);
    const ph = this.bobPhase;
    const bobY = Math.sin(ph * 2) * 0.026 * this.bobAmp;
    const bobX = Math.cos(ph) * 0.017 * this.bobAmp;
    const roll = Math.cos(ph) * 0.0032 * this.bobAmp;
    const breathe = Math.sin(performance.now() * 0.0011) * 0.0016;
    cam.rotation.order = 'YXZ';
    cam.position.set(this.x + Math.cos(this.yaw) * bobX, this.eyeY + bobY + breathe, this.z - Math.sin(this.yaw) * bobX);
    cam.rotation.set(this.pitch + Math.sin(ph * 2 + 0.6) * 0.0022 * this.bobAmp, this.yaw, roll);
    if (cam.fov !== S.fov) { cam.fov = S.fov; cam.updateProjectionMatrix(); }
  }

  serialize() { return { x: this.x, z: this.z, yaw: this.yaw, pitch: this.pitch, dist: this.distanceWalked }; }
  restore(d) { if (d) { this.teleport(d.x, d.z, d.yaw); this.pitch = d.pitch || 0; this.distanceWalked = d.dist || 0; } }
}
void DEG;
