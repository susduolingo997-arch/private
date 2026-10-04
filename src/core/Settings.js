// Player settings, persisted separately from the save game so that starting a new
// journey never resets the player's preferences.
const KEY = 'tlwh_settings_v1';

export const DEFAULTS = {
  mouseSensitivity: 1.0,   // multiplier
  fov: 70,
  masterVolume: 0.8,
  musicVolume: 0.6,
  effectsVolume: 0.9,
  quality: 'medium',       // low | medium | high
  movementSensitivity: 1.0, // how snappy acceleration/deceleration feels
  timeScale: 24,           // game seconds per real second (1 = real time)
  invertY: false,
  walkPace: 1.6,           // walking speed multiplier (1 = 1.5 m/s)
};

export const Settings = {
  values: { ...DEFAULTS },
  listeners: new Set(),

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) Object.assign(this.values, JSON.parse(raw));
    } catch (e) { /* storage may be blocked; defaults are fine */ }
    return this.values;
  },

  set(key, value) {
    this.values[key] = value;
    try { localStorage.setItem(KEY, JSON.stringify(this.values)); } catch (e) { /* ignore */ }
    for (const fn of this.listeners) fn(key, value);
  },

  onChange(fn) { this.listeners.add(fn); },
};

export const QUALITY = {
  low:    { pixelRatio: 0.8, terrainRadius: 5, featureRadius: 3, grassRadius: 1, shadows: false, shadowSize: 1024, msaa: 0, treeDetail: 0, lights: 3, pmrem: false },
  medium: { pixelRatio: 1.25, terrainRadius: 7, featureRadius: 5, grassRadius: 2, shadows: true, shadowSize: 1024, msaa: 2, treeDetail: 1, lights: 4, pmrem: true },
  high:   { pixelRatio: 2, terrainRadius: 9, featureRadius: 6, grassRadius: 2, shadows: true, shadowSize: 2048, msaa: 4, treeDetail: 1, lights: 6, pmrem: true },
};
