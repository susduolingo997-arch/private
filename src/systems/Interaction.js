import { wrapAngle, damp } from '../core/MathUtil.js';

/**
 * Optional, quiet interactions: open doors, sit on benches, read signs. No missions,
 * no markers — the prompt only appears when you are looking at something usable.
 */
export class Interaction {
  constructor(game) {
    this.g = game;
    this.target = null;
    this.active = new Set();   // door interactables that are animating
    this.signTimer = 0;
    this.arrivalTimer = 0;
    this._fwd = { x: 0, z: 0 };
  }

  update(dt, g) {
    const p = g.player, cam = g.camera;
    // forward vector of the camera on the ground plane + vertical aim
    const fx = -Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    let best = null, bestScore = 0;
    const ex = cam.position.x, ey = cam.position.y, ez = cam.position.z;
    const pitchF = Math.cos(p.pitch), fy = Math.sin(p.pitch);
    g.chunks.forEachInteractable(p.x, p.z, (it) => {
      const dx = it.x - ex, dy = (it.y ?? ey) - ey, dz = it.z - ez;
      const d = Math.hypot(dx, dy, dz);
      const reach = it.type === 'sign' ? 4.0 : 2.6;
      if (d > reach || d < 0.05) return;
      const dot = (dx * fx * pitchF + dz * fz * pitchF + dy * fy) / d;
      if (dot < (it.type === 'sign' ? 0.9 : 0.8)) return;
      const score = dot * 2 - d * 0.15;
      if (score > bestScore || !best) { best = it; bestScore = score; }
    });
    if (p.sitting) best = { type: 'stand' };
    this.target = best;
    let prompt = '';
    if (best && g.began && !g.paused) {
      if (best.type === 'door') prompt = `<kbd>E</kbd>${best.target > 0.5 ? 'Close' : 'Open'} door`;
      else if (best.type === 'bench') prompt = '<kbd>E</kbd>Sit';
      else if (best.type === 'sign') prompt = '<kbd>E</kbd>Read';
      else if (best.type === 'stand') prompt = '<kbd>E</kbd>Stand up';
    }
    g.ui.setPrompt(prompt);

    if (g.input.wasPressed('KeyE') && best && !g.paused) this.use(best);

    // door animation
    for (const d of this.active) {
      d.angle = damp(d.angle, d.target, 6, dt);
      d.mesh.rotation.y = d.baseRot + d.angle;
      if (Math.abs(d.angle - d.target) < 0.01) { d.angle = d.target; d.mesh.rotation.y = d.baseRot + d.angle; this.active.delete(d); }
    }
    this.checkArrival(g, dt);
  }

  use(it) {
    const g = this.g, p = g.player;
    if (it.type === 'door') {
      const open = it.target < 0.5;
      it.target = open ? 1.65 : 0;
      it.collider.enabled = !open;
      g.world.doorState[it.building.id] = open;
      this.active.add(it);
      if (g.audio) g.audio.doorSound(it.x, it.y, it.z, open);
    } else if (it.type === 'bench') {
      p.sitting = { x: it.x, y: it.y, z: it.z };
      p.vx = p.vz = 0;
      // face along the bench's front
      const want = it.rot + Math.PI;
      p.yaw += wrapAngle(want - p.yaw) * 0.0;
      this.turnTo = want;
    } else if (it.type === 'sign') {
      g.ui.whisper(it.lines.join('  ·  '), 5000);
    } else if (it.type === 'stand') {
      p.sitting = null;
    }
  }

  /** Home is simply a place. Stepping through its door is the quiet ending. */
  checkArrival(g, dt) {
    const home = g.world.structures.home;
    if (!home) return;
    const p = g.player;
    const [lx, lz] = home.toLocal(p.x, p.z);
    const inside = Math.abs(lx) < home.w / 2 - 0.6 && Math.abs(lz) < home.d / 2 - 0.6;
    if (this.turnTo !== undefined && p.sitting) {
      p.yaw += wrapAngle(this.turnTo - p.yaw) * Math.min(1, dt * 3);
      if (Math.abs(wrapAngle(this.turnTo - p.yaw)) < 0.01) this.turnTo = undefined;
    } else if (!p.sitting) this.turnTo = undefined;
    if (inside && !g.arrived) {
      this.arrivalTimer += dt;
      if (this.arrivalTimer > 1.6) {
        g.arrived = true;
        g.ui.whisper('You are home.', 14000);
        if (g.audio) g.audio.playHomeMusic();
        g.save();
      }
    }
  }
}
