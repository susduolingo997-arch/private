import { CLIMATE } from '../world/WorldDef.js';

/**
 * Seasons are architected but switched off for the prototype: the journey happens in one
 * late-spring/early-summer stretch. Everything that would change with the seasons already
 * reads from here, so enabling them later is a data change rather than a rewrite:
 *
 *  - sun path        -> Sky.update() asks dayOfYear()
 *  - foliage tint    -> Materials: G.uSeason multiplies all leaf / grass colours
 *  - snow / frost    -> snowAmount() is ready for the terrain + vegetation shaders
 *  - leaf density    -> leafDensity() for tree LOD geometry (bare winter branches)
 *  - weather mix     -> Weather.target() can bias rain/snow by season()
 */
export const Seasons = {
  enabled: false,
  daysPerYear: 365,
  /** Day of year the sun/foliage use. Frozen at the start date until `enabled`. */
  dayOfYear(time) {
    if (!this.enabled) return CLIMATE.dayOfYear;
    return (CLIMATE.dayOfYear + time.day) % this.daysPerYear;
  },
  /** 0 = spring, 1 = summer, 2 = autumn, 3 = winter */
  season(time) {
    const d = this.dayOfYear(time);
    if (d < 80 || d >= 355) return 3;
    if (d < 172) return 0 + (d >= 140 ? 1 : 0);
    if (d < 266) return 1;
    return 2;
  },
  /** RGB multiplier applied to foliage and grass. */
  foliageTint(time, out) {
    if (!this.enabled) return out.set(1, 1, 1);
    const s = this.season(time);
    if (s === 2) return out.set(1.35, 0.85, 0.45);
    if (s === 3) return out.set(0.8, 0.8, 0.75);
    if (s === 0) return out.set(0.95, 1.08, 0.9);
    return out.set(1, 1, 1);
  },
  snowAmount(time) { return this.enabled && this.season(time) === 3 ? 1 : 0; },
  leafDensity(time) { return !this.enabled ? 1 : this.season(time) === 3 ? 0.1 : this.season(time) === 2 ? 0.75 : 1; },
};
