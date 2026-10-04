import * as THREE from 'three';
import { Settings, QUALITY } from './Settings.js';
import { SaveSystem } from './SaveSystem.js';
import { Input } from './Input.js';
import { World } from '../world/World.js';
import { ChunkManager } from '../world/ChunkManager.js';
import { START } from '../world/WorldDef.js';
import { initMaterials, G, Mats } from '../render/Materials.js';
import { SkySystem } from '../render/Sky.js';
import { Post } from '../render/Post.js';
import { Rain } from '../render/Rain.js';
import { DistantTerrain } from '../render/DistantTerrain.js';
import { LightPool } from '../render/LightPool.js';
import { FarField } from '../render/FarField.js';
import { GameTime } from '../systems/GameTime.js';
import { Weather } from '../systems/Weather.js';
import { Player } from '../player/Player.js';
import { Seasons } from '../systems/Seasons.js';
import { UI } from '../ui/UI.js';
import { smoothstep, lerp } from './MathUtil.js';

/**
 * Orchestrates every system on one shared clock. All systems operate on the single
 * continuous world; none of them is ever re-created because the player walked somewhere.
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.systems = [];       // optional systems with update(dt, game)
    this.running = false;
    this.paused = true;
    this.began = false;
    this.saveTimer = 0;
    this.frame = 0;
    this.fpsAvg = 60;
  }

  async init() {
    Settings.load();
    const q = QUALITY[Settings.values.quality] || QUALITY.medium;
    let renderer;
    try { renderer = this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: 'high-performance' }); }
    catch (e) {
      document.getElementById('menu').innerHTML = '<div class="card"><h1>The Long Way Home</h1><p class="sub">This game needs WebGL.</p><p>Your browser or graphics driver could not start a WebGL context. Try a current version of Chrome, Edge or Firefox with hardware acceleration enabled.</p></div>';
      throw e;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.pixelRatio));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.autoClear = true;
    renderer.setClearColor(0x0b0d10);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(Settings.values.fov, window.innerWidth / window.innerHeight, 0.1, 40000);
    initMaterials();

    this.input = new Input(this.canvas);
    this.time = new GameTime();
    this.weather = new Weather();
    this.world = new World();
    this.ui = new UI(this);

    this.sky = new SkySystem(this.scene, renderer, this.camera);
    this.chunks = new ChunkManager(this.world, this.scene);
    this.distant = new DistantTerrain(this.scene, this.world.terrain);
    this.farField = new FarField(this.scene, this.world);
    this.chunks.onFeaturesChanged = (ch, loaded) => this.farField.setChunkLoaded(ch.cx, ch.cz, loaded);
    this.rain = new Rain(this.scene);
    this.post = new Post(renderer);
    this.lights = new LightPool(this.scene, 6);
    this.player = new Player(this.world, this.camera, this.input);

    this.input.onLockChange = (locked) => {
      if (!this.began) return;
      if (locked) { this.paused = false; this.ui.hideMenu(); this.audio && this.audio.resume(); }
      else if (this.running) { this.paused = true; this.ui.showPause(); this.save(); }
    };
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.save(); });
    window.addEventListener('beforeunload', () => this.save());
    Settings.onChange((k) => { if (k === 'quality') this.applyQuality(); });

    // optional systems (audio, NPCs, vehicles, animals, interaction) register themselves
    await this.registerSystems();

    this.player.onStep = (surface, side, vigor) => { if (this.audio) this.audio.footstep(surface, side, vigor); };
    this.applyQuality();
    this.resize();

    // Restore or start
    const save = SaveSystem.load();
    this.ui.hasSave = !!save;
    this.saved = save;
    this.restoreOrStart(save);

    // Build the first chunks before the player ever sees the world — the start screen is
    // simply the world, waiting.
    this.prewarm();
    this.running = true;
    this.ui.setReady();
    this.ui.showStart(!!save);
    this.lastT = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  async registerSystems() {
    const mods = await Promise.allSettled([
      import('../systems/Interaction.js'),
      import('../systems/AudioSystem.js'),
      import('../systems/NPCs.js'),
      import('../systems/Vehicles.js'),
      import('../systems/Animals.js'),
      import('../systems/Trains.js'),
    ]);
    const [inter, aud, npc, veh, ani, trn] = mods;
    const log = (m) => { if (m.status === 'rejected') console.warn('system failed to load', m.reason); return m.status === 'fulfilled' ? m.value : null; };
    const I = log(inter), A = log(aud), N = log(npc), V = log(veh), An = log(ani), Tr = log(trn);
    if (Tr) { this.trains = new Tr.Trains(this); this.systems.push(this.trains); }
    if (V) { this.vehicles = new V.Vehicles(this); this.systems.push(this.vehicles); }
    if (N) { this.npcs = new N.NPCs(this); this.systems.push(this.npcs); }
    if (An) { this.animals = new An.Animals(this); this.systems.push(this.animals); }
    if (I) { this.interaction = new I.Interaction(this); this.systems.push(this.interaction); }
    if (A) { this.audio = new A.AudioSystem(this); this.systems.push(this.audio); }
  }

  applyQuality() {
    const q = QUALITY[Settings.values.quality] || QUALITY.medium;
    this.q = q;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, q.pixelRatio));
    this.renderer.shadowMap.enabled = q.shadows;
    this.sky.setQuality(q);
    this.post.setQuality(q);
    this.chunks.setQuality(q);
    this.lights.setActive(q.lights);
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.post.resize(w, h);
  }

  restoreOrStart(save) {
    if (save) {
      this.time.restore(save.time);
      this.weather.restore(save.weather);
      this.player.restore(save.player);
      this.world.doorState = save.doors || {};
      this.arrived = !!save.arrived;
      this.restoreSystems(save);
    } else this.startFresh();
  }

  startFresh() {
    this.time = Object.assign(this.time, new GameTime());
    this.weather.initialised = false; this.weather.wet = 0; this.weather.setPreset('auto');
    this.world.doorState = {};
    this.arrived = false;
    this.player.teleport(START.x, START.z, START.yaw);
    this.player.pitch = 0; this.player.distanceWalked = 0;
    this.restoreSystems(null);
  }

  restoreSystems(save) {
    for (const s of this.systems) if (s.restore) s.restore(save && save.systems ? save.systems[s.constructor.name] : null);
  }

  prewarm() {
    const p = this.player;
    this.weather.update(0.016, this.time);
    this.chunks.prewarm(p.x, p.z, 2);
    this.distant.prewarm(p.x, p.z);
    this.player.teleport(p.x, p.z, p.yaw);
    this.player._apply(0.016);
    this.refreshSkyNow();
    for (const s of this.systems) if (s.prewarm) s.prewarm();
  }

  refreshSkyNow() {
    this.sky.envTimer = 99;
    this.updateEnvironment(0.016);
  }

  /** Begin (or restart) the journey from the start screen. */
  begin(fresh) {
    if (!this.ui.ready) return;
    if (fresh) {
      SaveSystem.clear();
      this.startFresh();
      this.chunks.lastCx = NaN;
      this.prewarm();
    }
    this.began = true;
    this.ui.hideMenu();
    this.input.lock();
    this.paused = false;
    this.player.enabled = true;
    if (this.audio) this.audio.start();
    if (fresh || !this.saved) setTimeout(() => this.ui.whisper('It is a long way home.', 7000), 1800);
  }

  resume() { this.input.lock(); }

  save() {
    if (!this.began) return;
    const systems = {};
    for (const s of this.systems) if (s.serialize) systems[s.constructor.name] = s.serialize();
    SaveSystem.save({
      time: this.time.serialize(), weather: this.weather.serialize(), player: this.player.serialize(),
      doors: this.world.doorState, arrived: this.arrived, systems,
    });
  }

  /** Update everything that depends on time of day and weather. */
  updateEnvironment(dt) {
    const W = this.weather, T = this.time;
    this.sky.update(dt, T, W, this.player.camera.position);
    G.uTime.value += dt;
    G.uWet.value = W.wet; G.uRain.value = W.rain; G.uWind.value = W.wind;
    Seasons.foliageTint(T, G.uSeason.value);
    G.uPlayer.value.copy(this.camera.position);
    G.uFar.value = (this.chunks.params.featureRadius + 0.3) * 64 - 8;
    // fraction of windows lit: rises through the evening, falls in the small hours
    const x = T.hours < 12 ? T.hours + 24 : T.hours;
    const on = smoothstep(17.2, 21.2, x), off = smoothstep(24.6, 29.4, x);
    const dark = 1 - smoothstep(0.1, 0.55, this.sky.daylight);
    G.uGlow.value = Math.max(on * (1 - off * 0.95), dark * 0.9);
    G.uNight.value = this.sky.night;
    const night = 1 - smoothstep(0.05, 0.5, this.sky.daylight);
    Mats.emissiveLamp.color.setRGB(1, 0.92, 0.75).multiplyScalar(lerp(0.22, 1.6, night));
    Mats.carLights.color.setScalar(lerp(0.3, 1.3, night));
    const sig = this.world.structures.signal;
    void sig;
    this.rain.update(this.camera, W.rain, W.windDir[0] * W.wind * 3, W.windDir[1] * W.wind * 3, this.sky.fogColor);
  }

  /** If the machine clearly cannot keep up, quietly drop one quality step (once per step). */
  watchPerformance(t) {
    if (!this.began || this.paused || document.hidden) { this._slowSince = 0; return; }
    const realDt = this._rawDt || 0.016;
    this._rawDt = realDt;
    if (this.fpsAvg < 24) {
      if (!this._slowSince) this._slowSince = t;
      if (t - this._slowSince > 9000) {
        const order = ['high', 'medium', 'low'];
        const i = order.indexOf(Settings.values.quality);
        if (i >= 0 && i < 2) { Settings.set('quality', order[i + 1]); this.ui.whisper('Graphics eased down for a smoother walk.', 4000); }
        this._slowSince = 0;
      }
    } else this._slowSince = 0;
  }

  loop(t) {
    requestAnimationFrame((tt) => this.loop(tt));
    let dt = (t - this.lastT) / 1000; this.lastT = t;
    if (dt > 0.1) dt = 0.1;
    if (dt <= 0) dt = 0.0001;
    this.fpsAvg = lerp(this.fpsAvg, 1 / dt, 0.05);
    this.watchPerformance(t);
    const active = this.began && !this.paused;
    this.frame++;
    if (active) {
      this.time.update(dt, Settings.values.timeScale);
      this.weather.update(dt, this.time);
      this.player.enabled = true;
      this.player.update(dt);
      for (const s of this.systems) s.update(dt, this);
      this.saveTimer += dt;
      if (this.saveTimer > 10) { this.saveTimer = 0; this.save(); }
    } else {
      this.player.enabled = false;
      // the world idles gently behind the menu (clouds drift, sky continues) but time is held
      this.player._apply(dt);
      this.weather.update(dt * 0.3, this.time);
      for (const s of this.systems) if (s.idle) s.idle(dt, this);
    }
    this.updateEnvironment(dt);
    this.lights.update(dt, this.world.structures.lampList, this.camera.position, this.sky.daylight);
    const px = this.camera.position.x, pz = this.camera.position.z;
    this.chunks.update(px, pz, this.began ? 3.2 : 8);
    this.distant.update(px, pz, this.camera.position, (this.chunks.params.terrainRadius - 0.5) * 64);
    this.post.render(this.scene, this.camera, this.sky.exposure, performance.now() / 1000, this.sky.night);
    this.input.endFrame();
  }
}
