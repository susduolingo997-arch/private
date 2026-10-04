import { START_TIME } from '../world/WorldDef.js';

/** The one world clock. It never resets, regardless of where the player walks. */
export class GameTime {
  constructor() { this.day = START_TIME.day; this.hours = START_TIME.hours; this.elapsedReal = 0; }
  update(dt, scale) {
    this.elapsedReal += dt;
    this.hours += (dt * scale) / 3600;
    while (this.hours >= 24) { this.hours -= 24; this.day++; }
  }
  get total() { return this.day * 24 + this.hours; }
  set(hours) { this.hours = ((hours % 24) + 24) % 24; }
  get clock() {
    const h = Math.floor(this.hours), m = Math.floor((this.hours - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }
  serialize() { return { day: this.day, hours: this.hours }; }
  restore(d) { if (d) { this.day = d.day; this.hours = d.hours; } }
}
