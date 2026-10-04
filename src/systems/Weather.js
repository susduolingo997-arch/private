import { noise1 } from '../core/Noise.js';
import { smoothstep, damp, clamp } from '../core/MathUtil.js';

export const WEATHER_PHASE = 316.25; // chosen so the journey opens on a partly cloudy, slightly misty morning with rain arriving mid-afternoon

export const WEATHER_PRESETS = {
  auto: null,
  clear: { cloud: 0.04, rain: 0, fog: 0, wind: 0.12 },
  partly: { cloud: 0.45, rain: 0, fog: 0, wind: 0.3 },
  overcast: { cloud: 0.92, rain: 0, fog: 0.05, wind: 0.35 },
  rain: { cloud: 1.0, rain: 0.85, fog: 0.15, wind: 0.55 },
  fog: { cloud: 0.5, rain: 0, fog: 0.85, wind: 0.05 },
};

/**
 * Weather is a smooth function of world time, so it is continuous across the whole world
 * (it does not care where the player is) and fully deterministic. State below is the
 * smoothed, currently-visible weather; `wet` lags behind the rain and drives puddles.
 */
export class Weather {
  constructor() {
    this.cloud = 0.3; this.rain = 0; this.fog = 0.25; this.wind = 0.2; this.wet = 0;
    this.windDir = [0.8, 0.35];
    this.override = null; this.preset = 'auto';
    this.initialised = false;
  }

  target(time) {
    const T = time.total + WEATHER_PHASE;
    const cn = noise1(T / 10.5 + 3.1, 5) * 0.5 + noise1(T / 3.7 + 8, 6) * 0.22 + 0.5;
    let cloud = smoothstep(0.26, 0.86, cn);
    const rn = noise1(T / 8.2 + 21.7, 9) * 0.5 + 0.5;
    const rain = smoothstep(0.64, 0.84, rn) * smoothstep(0.3, 0.7, cloud);
    cloud = Math.max(cloud, rain * 0.96);
    const fn = noise1(T / 6.5 + 40, 3) * 0.5 + 0.5;
    const h = time.hours;
    const morning = smoothstep(3.5, 5.5, h) * (1 - smoothstep(7.5, 10.5, h));
    const fog = clamp(smoothstep(0.5, 0.82, fn) * (0.25 + 0.75 * morning) * (1 - cloud * 0.5) + rain * 0.22, 0, 1);
    const wind = clamp(0.1 + noise1(T / 5 + 70, 2) * 0.28 + 0.28 + cloud * 0.25 + rain * 0.3, 0.05, 1);
    return { cloud, rain, fog, wind };
  }

  setPreset(name) { this.preset = name; this.override = WEATHER_PRESETS[name] || null; }

  update(dt, time) {
    const tgt = this.override || this.target(time);
    if (!this.initialised) { Object.assign(this, { cloud: tgt.cloud, rain: tgt.rain, fog: tgt.fog, wind: tgt.wind }); this.initialised = true; }
    // gradual transitions (tens of real seconds), regardless of time scale
    this.cloud = damp(this.cloud, tgt.cloud, 1 / 22, dt);
    this.rain = damp(this.rain, tgt.rain, 1 / 18, dt);
    this.fog = damp(this.fog, tgt.fog, 1 / 40, dt);
    this.wind = damp(this.wind, tgt.wind, 1 / 25, dt);
    if (this.rain > 0.12) this.wet = Math.min(1, this.wet + dt * this.rain / 55);
    else this.wet = Math.max(0, this.wet - dt / 420);
    const a = time.total * 0.17;
    this.windDir[0] = Math.cos(a + this.wind * 0.3); this.windDir[1] = Math.sin(a * 0.8 + 1) * 0.8;
  }

  serialize() { return { cloud: this.cloud, rain: this.rain, fog: this.fog, wind: this.wind, wet: this.wet, preset: this.preset }; }
  restore(d) {
    if (!d) return;
    Object.assign(this, { cloud: d.cloud, rain: d.rain, fog: d.fog, wind: d.wind, wet: d.wet });
    this.initialised = true;
    if (d.preset) this.setPreset(d.preset);
  }
}
