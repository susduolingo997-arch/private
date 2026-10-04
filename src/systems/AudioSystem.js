import { Settings } from '../core/Settings.js';
import { Rng } from '../core/Noise.js';
import { smoothstep, clamp, lerp } from '../core/MathUtil.js';

/**
 * Fully procedural environmental audio (Web Audio API) — no sample files. The soundscape is
 * driven by *where the player is* (forest, field, village, road, river), the weather and
 * the time of day. There is no background music; the world is simply listened to.
 */
export class AudioSystem {
  constructor(game) {
    this.g = game;
    this.ctx = null;
    this.started = false;
    this.rng = new Rng(Date.now() & 0xffff);
    this.env = { forest: 0, field: 0, village: 0, road: 0, river: 0, riverPos: null, pole: 99, cars: 0, indoors: 0, water: 0 };
    this.timers = { env: 0, birds: 0, dog: 6, voice: 8, misc: 0 };
    this.lastBell = -1;
    this.bellInit = false;
    this.motifDone = {};
  }

  // ------------------------------------------------------------------ setup
  start() {
    if (this.started) { this.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC({ latencyHint: 'interactive' });
    } catch (e) { console.warn('Web Audio unavailable', e); return; }
    const c = this.ctx;
    this.master = c.createGain(); this.master.connect(c.destination);
    this.comp = c.createDynamicsCompressor(); this.comp.threshold.value = -14; this.comp.ratio.value = 3;
    this.comp.connect(this.master);
    this.fxBus = c.createGain(); this.fxBus.connect(this.comp);
    this.musicBus = c.createGain(); this.musicBus.connect(this.comp);
    // ambience goes through a low-pass so interiors can muffle the outdoors
    this.indoorFilter = c.createBiquadFilter(); this.indoorFilter.type = 'lowpass'; this.indoorFilter.frequency.value = 18000;
    this.ambBus = c.createGain(); this.ambBus.connect(this.indoorFilter); this.indoorFilter.connect(this.fxBus);
    this.posBus = c.createGain(); this.posBus.connect(this.indoorFilter);
    this._makeBuffers();
    this._makeReverb();
    this._makeBeds();
    this.applyVolumes();
    Settings.onChange(() => this.applyVolumes());
    this.started = true;
    this.resume();
  }

  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); }
  applyVolumes() {
    if (!this.ctx) return;
    const S = Settings.values, t = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(S.masterVolume, t, 0.05);
    this.fxBus.gain.setTargetAtTime(S.effectsVolume, t, 0.05);
    this.musicBus.gain.setTargetAtTime(S.musicVolume, t, 0.05);
  }

  _makeBuffers() {
    const c = this.ctx, sr = c.sampleRate;
    const mk = (secs, fn) => { const b = c.createBuffer(1, Math.floor(sr * secs), sr); fn(b.getChannelData(0)); return b; };
    this.white = mk(3, (d) => { for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; });
    this.pink = mk(6, (d) => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
    });
    this.brown = mk(6, (d) => { let l = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; l = (l + 0.02 * w) / 1.02; d[i] = l * 3.5; } });
  }

  _makeReverb() {
    const c = this.ctx, sr = c.sampleRate, len = Math.floor(sr * 2.8);
    const ir = c.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * (i < sr * 0.02 ? i / (sr * 0.02) : 1);
    }
    this.reverb = c.createConvolver(); this.reverb.buffer = ir;
    this.reverbSend = c.createGain(); this.reverbSend.gain.value = 1;
    const rg = c.createGain(); rg.gain.value = 0.7;
    this.reverbSend.connect(this.reverb); this.reverb.connect(rg); rg.connect(this.comp);
  }

  loopSrc(buf, rate = 1) {
    const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate;
    s.loopStart = 0; s.start(0, Math.random() * buf.duration * 0.9);
    return s;
  }

  /** Continuous beds whose gains are steered every frame. */
  _makeBeds() {
    const c = this.ctx;
    const B = (this.beds = {});
    const bed = (src, filters, out = this.ambBus) => {
      let node = src;
      for (const f of filters) { node.connect(f); node = f; }
      const g = c.createGain(); g.gain.value = 0;
      node.connect(g); g.connect(out);
      return { src, g, filters };
    };
    const filt = (type, f, q = 0.7) => { const n = c.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; return n; };
    // wind: low body + mid hiss
    B.wind = bed(this.loopSrc(this.pink), [filt('bandpass', 380, 0.45), filt('lowpass', 1200)]);
    B.windHi = bed(this.loopSrc(this.white, 0.9), [filt('bandpass', 2400, 0.4)]);
    // gusting LFOs
    for (const [name, rate, depth] of [['wind', 0.11, 0.5], ['windHi', 0.17, 0.5]]) {
      const l = c.createOscillator(); l.frequency.value = rate; const lg = c.createGain(); lg.gain.value = 0; l.connect(lg); lg.connect(B[name].g.gain); l.start();
      B[name].lfoGain = lg; B[name].depth = depth;
    }
    B.leaves = bed(this.loopSrc(this.white, 1.1), [filt('bandpass', 4200, 0.6), filt('highpass', 2500)]);
    B.rain = bed(this.loopSrc(this.pink, 1.2), [filt('highpass', 500), filt('lowpass', 9000)]);
    B.rainHi = bed(this.loopSrc(this.white), [filt('bandpass', 6500, 0.5)]);
    B.rainRoof = bed(this.loopSrc(this.brown, 1.5), [filt('bandpass', 250, 0.8)]);
    B.village = bed(this.loopSrc(this.brown, 0.9), [filt('lowpass', 220)]);
    B.roadFar = bed(this.loopSrc(this.brown, 1.0), [filt('lowpass', 260), filt('highpass', 40)]);
    B.field = bed(this.loopSrc(this.white, 1.0), [filt('bandpass', 5200, 3.5)]);   // insects, day
    // buzzing amplitude modulation
    const lb = c.createOscillator(); lb.type = 'square'; lb.frequency.value = 38; const lbg = c.createGain(); lbg.gain.value = 0.0; lb.connect(lbg); lbg.connect(B.field.g.gain); lb.start();
    B.field.mod = lbg;
    // crickets: pulsed sine bursts
    const cr = c.createOscillator(); cr.type = 'sine'; cr.frequency.value = 4350;
    const crTrem = c.createGain(); crTrem.gain.value = 0;
    const crL1 = c.createOscillator(); crL1.type = 'square'; crL1.frequency.value = 29; const crl1g = c.createGain(); crl1g.gain.value = 0.5;
    crL1.connect(crl1g); crl1g.connect(crTrem.gain);
    const crGate = c.createGain(); crGate.gain.value = 0;
    const crL2 = c.createOscillator(); crL2.type = 'square'; crL2.frequency.value = 2.3; const crl2g = c.createGain(); crl2g.gain.value = 0.5;
    crL2.connect(crl2g); crl2g.connect(crGate.gain);
    cr.connect(crTrem); crTrem.connect(crGate);
    const crOut = c.createGain(); crOut.gain.value = 0; crGate.connect(crOut); crOut.connect(this.ambBus);
    cr.start(); crL1.start(); crL2.start();
    B.crickets = { g: crOut };
    // second cricket voice slightly detuned for texture
    const cr2 = c.createOscillator(); cr2.type = 'sine'; cr2.frequency.value = 5100;
    const cr2t = c.createGain(); cr2t.gain.value = 0; crL1.connect(cr2t.gain);
    const cr2gate = c.createGain(); cr2gate.gain.value = 0; const l22 = c.createOscillator(); l22.type = 'square'; l22.frequency.value = 1.7; const l22g = c.createGain(); l22g.gain.value = 0.5; l22.connect(l22g); l22g.connect(cr2gate.gain);
    cr2.connect(cr2t); cr2t.connect(cr2gate); cr2gate.connect(crOut); cr2.start(); l22.start();
    // electrical hum
    const h1 = c.createOscillator(); h1.type = 'sawtooth'; h1.frequency.value = 100;
    const h2 = c.createOscillator(); h2.type = 'sine'; h2.frequency.value = 200;
    const hf = filt('lowpass', 520, 0.8); const hg = c.createGain(); hg.gain.value = 0;
    h1.connect(hf); h2.connect(hf); hf.connect(hg); hg.connect(this.ambBus); h1.start(); h2.start();
    B.hum = { g: hg };
    // river (positional)
    const rp = c.createPanner(); rp.panningModel = 'HRTF'; rp.distanceModel = 'inverse'; rp.refDistance = 7; rp.rolloffFactor = 1.4; rp.maxDistance = 400;
    const rsrc = this.loopSrc(this.pink, 1.0), rf1 = filt('bandpass', 650, 0.7), rf2 = filt('lowpass', 2800);
    rsrc.connect(rf1); rf1.connect(rf2);
    const rg = c.createGain(); rg.gain.value = 0; rf2.connect(rg); rg.connect(rp); rp.connect(this.posBus);
    const rsrc2 = this.loopSrc(this.white, 1.0), rf3 = filt('bandpass', 3400, 0.8); rsrc2.connect(rf3);
    const rg2 = c.createGain(); rg2.gain.value = 0.14; rf3.connect(rg2); rg2.connect(rg);
    B.river = { g: rg, panner: rp };
    // pool of car voices (positional)
    B.cars = [];
    for (let i = 0; i < 3; i++) {
      const p = c.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 8; p.rolloffFactor = 1.3; p.maxDistance = 500;
      const ns = this.loopSrc(this.pink, 1.0), nf = filt('bandpass', 900, 0.6); ns.connect(nf);
      const eng = c.createOscillator(); eng.type = 'sawtooth'; eng.frequency.value = 60; const ef = filt('lowpass', 260, 0.8); eng.connect(ef);
      const g = c.createGain(); g.gain.value = 0; nf.connect(g); ef.connect(g); g.connect(p); p.connect(this.posBus); eng.start();
      B.cars.push({ g, p, eng, nf, car: null });
    }
    // machinery drone (positional at the farm)
    const mp = c.createPanner(); mp.panningModel = 'HRTF'; mp.distanceModel = 'inverse'; mp.refDistance = 20; mp.rolloffFactor = 1.1; mp.maxDistance = 900;
    const mo = c.createOscillator(); mo.type = 'sawtooth'; mo.frequency.value = 46; const mfl = filt('lowpass', 180, 0.7);
    const mo2 = c.createOscillator(); mo2.type = 'square'; mo2.frequency.value = 23.2; mo.connect(mfl); mo2.connect(mfl);
    const mg = c.createGain(); mg.gain.value = 0; mfl.connect(mg); mg.connect(mp); mp.connect(this.posBus); mo.start(); mo2.start();
    const mlfo = c.createOscillator(); mlfo.frequency.value = 7.5; const mlg = c.createGain(); mlg.gain.value = 0.0; mlfo.connect(mlg); mlg.connect(mg.gain); mlfo.start();
    B.machine = { g: mg, p: mp, lfo: mlg };
  }

  // ------------------------------------------------------------------ helpers
  _panner(x, y, z, ref = 5, roll = 1.4) {
    const p = this.ctx.createPanner();
    p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; p.maxDistance = 600;
    this._setPos(p, x, y, z);
    p.connect(this.posBus);
    return p;
  }
  _setPos(p, x, y, z) {
    if (p.positionX) { const t = this.ctx.currentTime; p.positionX.setValueAtTime(x, t); p.positionY.setValueAtTime(y, t); p.positionZ.setValueAtTime(z, t); }
    else p.setPosition(x, y, z);
  }
  _noiseBurst(dest, dur, type, f, q, gain, when = 0, buf = this.white, attack = 0.004, rate = 1) {
    const c = this.ctx, t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = buf; s.playbackRate.value = rate;
    const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest);
    s.start(t, Math.random() * 2); s.stop(t + dur + 0.05);
    return fl;
  }
  _tone(dest, freq, freq2, dur, gain, type = 'sine', when = 0, attack = 0.005) {
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (freq2 !== freq) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + 0.05);
    return g;
  }

  // ------------------------------------------------------------------ footsteps
  footstep(surface, side, vigor) {
    if (!this.started || this.ctx.state !== 'running') return;
    const c = this.ctx;
    const g = this.g, wet = g.weather.wet;
    const pan = c.createStereoPanner(); pan.pan.value = (side ? 1 : -1) * 0.18;
    const out = c.createGain(); out.gain.value = 0.55 * (0.7 + 0.3 * vigor); pan.connect(out); out.connect(this.fxBus);
    if (this.env.indoors > 0.5) { const s2 = c.createGain(); s2.gain.value = 0.25; out.connect(s2); s2.connect(this.reverbSend); }
    const pv = 0.9 + Math.random() * 0.2;
    const w = this.white;
    switch (surface) {
      case 'asphalt':
        this._tone(pan, 150 * pv, 70, 0.06, 0.28, 'sine');
        this._noiseBurst(pan, 0.035, 'highpass', 2200, 0.7, 0.18 + wet * 0.1);
        this._noiseBurst(pan, 0.1, 'bandpass', 900 * pv, 0.9, 0.06);
        break;
      case 'dirt': case 'gravel':
        this._noiseBurst(pan, 0.11, 'bandpass', 1700 * pv, 0.8, 0.33);
        for (let i = 0; i < 4; i++) this._noiseBurst(pan, 0.02, 'highpass', 3500, 1, 0.12, 0.02 + i * 0.022 + Math.random() * 0.015);
        this._noiseBurst(pan, 0.08, 'lowpass', 400, 0.7, 0.2);
        break;
      case 'bridge': case 'floor':
        this._tone(pan, 210 * pv, 120, 0.08, 0.3, 'triangle');
        this._noiseBurst(pan, 0.07, 'bandpass', 700 * pv, 2.5, 0.2);
        this._noiseBurst(pan, 0.025, 'highpass', 2500, 0.8, 0.09);
        break;
      case 'field':
        this._noiseBurst(pan, 0.14, 'bandpass', 2400 * pv, 0.7, 0.26);
        for (let i = 0; i < 3; i++) this._noiseBurst(pan, 0.03, 'bandpass', 4200, 1.3, 0.1, 0.03 + i * 0.03);
        this._noiseBurst(pan, 0.09, 'lowpass', 500, 0.7, 0.14);
        break;
      case 'forest':
        this._noiseBurst(pan, 0.12, 'lowpass', 900 * pv, 0.6, 0.25);
        for (let i = 0; i < 3; i++) this._noiseBurst(pan, 0.018, 'bandpass', 3200 + Math.random() * 1600, 1.4, 0.15 * Math.random(), 0.02 + i * 0.03 + Math.random() * 0.04);
        break;
      case 'water': {
        const f = this._noiseBurst(pan, 0.32, 'bandpass', 1100, 0.6, 0.5, 0, w, 0.01);
        f.frequency.setValueAtTime(700, c.currentTime); f.frequency.exponentialRampToValueAtTime(2200, c.currentTime + 0.25);
        this._noiseBurst(pan, 0.2, 'highpass', 3500, 0.6, 0.2, 0.03);
        break;
      }
      default: // grass
        this._noiseBurst(pan, 0.1, 'bandpass', 1100 * pv, 0.6, 0.2);
        this._noiseBurst(pan, 0.07, 'lowpass', 380, 0.7, 0.2);
        this._noiseBurst(pan, 0.05, 'highpass', 4500, 0.7, 0.05, 0.015);
    }
    // wet ground: squelch + splash layer
    if (wet > 0.35 && surface !== 'water' && surface !== 'floor') {
      const k = (wet - 0.35) / 0.65;
      const f = this._noiseBurst(pan, 0.16, 'bandpass', 800, 1.1, 0.22 * k, 0, w, 0.01);
      f.frequency.setValueAtTime(500, c.currentTime); f.frequency.linearRampToValueAtTime(1400 * pv, c.currentTime + 0.12);
      if (surface === 'asphalt' || wet > 0.8) this._noiseBurst(pan, 0.12, 'highpass', 2600, 0.7, 0.12 * k, 0.02);
    }
  }

  doorSound(x, y, z, open) {
    if (!this.started) return;
    const p = this._panner(x, y, z, 3, 1.2);
    const c = this.ctx;
    // creak
    const o = c.createOscillator(); o.type = 'sawtooth'; const t = c.currentTime;
    o.frequency.setValueAtTime(open ? 90 : 130, t); o.frequency.linearRampToValueAtTime(open ? 150 : 85, t + 0.5);
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 520; f.Q.value = 5;
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.07, t + 0.08); g.gain.linearRampToValueAtTime(0.03, t + 0.35); g.gain.linearRampToValueAtTime(0, t + 0.55);
    o.connect(f); f.connect(g); g.connect(p); o.start(t); o.stop(t + 0.6);
    // latch
    this._noiseBurst(p, 0.03, 'bandpass', 1800, 2, 0.35, open ? 0 : 0.45);
    this._tone(p, 120, 70, 0.1, 0.2, 'triangle', open ? 0.5 : 0.48);
  }

  // ------------------------------------------------------------------ one-shots
  birdCall(x, y, z, kind) {
    const c = this.ctx;
    const p = this._panner(x, y, z, 6, 1.3);
    const wetSend = c.createGain(); wetSend.gain.value = 0.18; p.connect(wetSend); wetSend.connect(this.reverbSend);
    const base = 2200 + Math.random() * 2600;
    const t0 = 0;
    if (kind === 'tweet') {
      const n = 2 + Math.floor(Math.random() * 5);
      let t = 0;
      for (let i = 0; i < n; i++) {
        const d = 0.04 + Math.random() * 0.06;
        const f1 = base * (0.8 + Math.random() * 0.5), f2 = f1 * (Math.random() > 0.5 ? 1.35 : 0.7);
        this._tone(p, f1, f2, d, 0.05 + Math.random() * 0.03, 'sine', t0 + t);
        t += d + 0.03 + Math.random() * 0.07;
      }
    } else if (kind === 'trill') {
      const n = 8 + Math.floor(Math.random() * 10);
      for (let i = 0; i < n; i++) this._tone(p, base * (1 + 0.15 * Math.sin(i * 1.3)), base * 1.1, 0.045, 0.04, 'sine', i * 0.06);
    } else if (kind === 'coo') {
      const f = 380 + Math.random() * 60;
      for (let i = 0; i < 4; i++) this._tone(p, f * (i % 2 ? 0.95 : 1.05), f * 0.9, 0.22, 0.09, 'sine', i * 0.34 + (i === 3 ? 0.2 : 0), 0.04);
    } else if (kind === 'caw') {
      for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
        const t = i * 0.42;
        const g = this._tone(p, 520, 380, 0.26, 0.11, 'sawtooth', t, 0.015);
        void g;
        this._noiseBurst(p, 0.22, 'bandpass', 900, 1.2, 0.06, t);
      }
    }
  }

  dogBark(x, y, z, distant = true) {
    const p = this._panner(x, y, z, 12, 1.1);
    const n = 1 + Math.floor(Math.random() * 3);
    const base = 280 + Math.random() * 160;
    const c = this.ctx;
    const wet = c.createGain(); wet.gain.value = distant ? 0.5 : 0.2; p.connect(wet); wet.connect(this.reverbSend);
    for (let i = 0; i < n; i++) {
      const t = i * (0.28 + Math.random() * 0.1);
      this._tone(p, base * 1.4, base * 0.7, 0.14, 0.2, 'sawtooth', t, 0.008);
      this._noiseBurst(p, 0.12, 'bandpass', 1200, 1.4, 0.1, t);
    }
  }

  voiceMurmur(x, y, z) {
    const c = this.ctx;
    const p = this._panner(x, y, z, 4, 1.5);
    const pitch = 95 + Math.random() * 120;
    const syll = 3 + Math.floor(Math.random() * 5);
    let t = 0;
    for (let i = 0; i < syll; i++) {
      const d = 0.1 + Math.random() * 0.12;
      const o = c.createOscillator(); o.type = 'sawtooth';
      const now = c.currentTime + t;
      o.frequency.setValueAtTime(pitch * (0.9 + Math.random() * 0.25), now); o.frequency.linearRampToValueAtTime(pitch * (0.85 + Math.random() * 0.3), now + d);
      const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 400 + Math.random() * 500; f1.Q.value = 6;
      const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 1200 + Math.random() * 1000; f2.Q.value = 8;
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.11, now + 0.025); g.gain.exponentialRampToValueAtTime(0.0001, now + d);
      o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(p);
      o.start(now); o.stop(now + d + 0.05);
      t += d + 0.03 + (Math.random() < 0.2 ? 0.25 : 0);
    }
  }

  bell(x, y, z, strikes) {
    const c = this.ctx;
    const p = this._panner(x, y, z, 60, 0.8);
    const send = c.createGain(); send.gain.value = 0.6; p.connect(send); send.connect(this.reverbSend);
    const partials = [[0.5, 1.0, 5.5], [1.0, 0.8, 4.5], [1.19, 0.55, 3.2], [1.56, 0.3, 2.4], [2.0, 0.42, 2.2], [2.74, 0.25, 1.6], [3.0, 0.18, 1.3]];
    for (let s = 0; s < strikes; s++) {
      const when = s * 2.6;
      for (const [mul, amp, dec] of partials) this._tone(p, 392 * mul, 392 * mul * 0.999, dec, 0.11 * amp, 'sine', when, 0.003);
    }
  }

  // ------------------------------------------------------------------ music (rare)
  /** A quiet piano-ish phrase for the arrival at home. */
  playHomeMusic() {
    if (!this.started) return;
    const notes = [261.63, 329.63, 392.0, 493.88, 523.25, 392.0, 659.25, 587.33, 523.25, 392.0, 329.63, 392.0, 261.63];
    const times = [0, 1.4, 2.8, 4.4, 6.0, 8.0, 9.6, 11.4, 13.4, 16.0, 18.4, 21.0, 24.0];
    notes.forEach((f, i) => this._piano(f, times[i] + 1.5, 0.5 + 0.2 * Math.sin(i)));
    // soft pad
    for (const f of [130.81, 196, 261.63, 329.63]) {
      const g = this._tone(this.musicBus, f, f * 1.002, 30, 0.035, 'sine', 1.0, 6);
      void g;
    }
  }
  playMotif(id) {
    if (!this.started || this.motifDone[id]) return;
    this.motifDone[id] = true;
    const seq = { bridge: [[392, 0], [440, 1.1], [523.25, 2.4], [440, 3.9]] }[id] || [];
    seq.forEach(([f, t]) => this._piano(f, t, 0.4));
  }
  _piano(freq, when, vel = 0.5) {
    const c = this.ctx, t = c.currentTime + when;
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.16 * vel, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(3500, t); lp.frequency.exponentialRampToValueAtTime(700, t + 2.5);
    g.connect(lp); lp.connect(this.musicBus);
    const rv = c.createGain(); rv.gain.value = 0.9; lp.connect(rv); rv.connect(this.reverbSend);
    for (const [mul, a, type] of [[1, 1, 'triangle'], [2, 0.35, 'sine'], [3.01, 0.12, 'sine'], [0.5, 0.25, 'sine']]) {
      const o = c.createOscillator(); o.type = type; o.frequency.value = freq * mul * (1 + (Math.random() - 0.5) * 0.002);
      const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(g); o.start(t); o.stop(t + 4.6);
    }
  }

  // ------------------------------------------------------------------ per-frame
  _sampleEnv() {
    const g = this.g, w = g.world, p = g.player, E = this.env;
    const T = w.terrain;
    // forest: average density at the player and 4 points 12 m away
    let f = T.forestDensity(p.x, p.z);
    for (const [dx, dz] of [[12, 0], [-12, 0], [0, 12], [0, -12]]) f += T.forestDensity(p.x + dx, p.z + dz);
    E.forest = f / 5;
    const fo = T.fieldAt(p.x, p.z);
    E.field = fo && fo.field.kind !== 'pasture' ? 1 : (T.fieldAt(p.x + 25, p.z) ? 0.5 : 0);
    const ri = w.roads.influence(p.x, p.z, this._ri || (this._ri = {}));
    E.road = ri.road && ri.road.surface === 'asphalt' ? 1 - smoothstep(4, 40, ri.d) : 0;
    const vd = Math.hypot(p.x - 308, p.z + 1345);
    E.village = 1 - smoothstep(60, 230, vd);
    E.indoors = p.indoors ? 1 : 0;
    // river
    const rv = this._rv || (this._rv = {});
    if (w.rivers.influence(p.x, p.z, rv)) {
      const r = rv.river, i = rv.i;
      E.river = 1 - smoothstep(6, 180, rv.d);
      E.riverPos = [r.x[i] + (r.x[i + 1] - r.x[i]) * rv.t, r.level[i], r.z[i] + (r.z[i + 1] - r.z[i]) * rv.t];
    } else { E.river = 0; E.riverPos = null; }
    // pole proximity
    let pd = 99;
    const cx = Math.floor(p.x / 64), cz = Math.floor(p.z / 64);
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      const ch = w.structures.chunk(cx + dx, cz + dz);
      if (ch) for (const po of ch.poles) pd = Math.min(pd, Math.hypot(po.x - p.x, po.z - p.z));
    }
    E.pole = pd;
  }

  update(dt, g) {
    if (!this.started || this.ctx.state !== 'running') return;
    const c = this.ctx, t = c.currentTime, B = this.beds;
    const W = g.weather, sky = g.sky;
    // listener
    const cam = g.camera;
    const L = c.listener;
    const fwd = this._fwd || (this._fwd = { x: 0, y: 0, z: -1 });
    fwd.x = -Math.sin(g.player.yaw) * Math.cos(g.player.pitch); fwd.y = Math.sin(g.player.pitch); fwd.z = -Math.cos(g.player.yaw) * Math.cos(g.player.pitch);
    if (L.positionX) {
      L.positionX.setTargetAtTime(cam.position.x, t, 0.02); L.positionY.setTargetAtTime(cam.position.y, t, 0.02); L.positionZ.setTargetAtTime(cam.position.z, t, 0.02);
      L.forwardX.setTargetAtTime(fwd.x, t, 0.02); L.forwardY.setTargetAtTime(fwd.y, t, 0.02); L.forwardZ.setTargetAtTime(fwd.z, t, 0.02);
      L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0;
    } else { L.setPosition(cam.position.x, cam.position.y, cam.position.z); L.setOrientation(fwd.x, fwd.y, fwd.z, 0, 1, 0); }

    this.timers.env -= dt;
    if (this.timers.env <= 0) { this.timers.env = 0.25; this._sampleEnv(); }
    const E = this.env;
    const day = clamp(sky.daylight, 0, 1), night = sky.night;
    const wind = W.wind, rain = W.rain;
    const indoor = E.indoors;
    const set = (node, v, tc = 0.8) => node.g.gain.setTargetAtTime(v, t, tc);
    // indoors: muffle the world, close the wind off
    this.indoorFilter.frequency.setTargetAtTime(lerp(18000, 850, indoor), t, 0.15);
    const open = 1 - indoor * 0.85;
    // wind
    const windBase = (0.012 + wind * 0.075) * (1 + (1 - E.forest) * 0.5);
    set(B.wind, windBase * open, 1.2);
    B.wind.lfoGain.gain.setTargetAtTime(windBase * 0.7 * open, t, 1);
    B.windHi.g.gain.setTargetAtTime((0.004 + wind * wind * 0.05 * (0.4 + E.forest)) * open, t, 1.2);
    B.windHi.lfoGain.gain.setTargetAtTime(wind * 0.015 * open, t, 1);
    B.wind.filters[0].frequency.setTargetAtTime(280 + wind * 380, t, 1);
    // leaves
    set(B.leaves, E.forest * (0.01 + wind * wind * 0.09 + rain * 0.03) * open, 1.5);
    // rain: surface hiss + roof drumming when indoors
    set(B.rain, rain * (0.11 + 0.1 * rain) * (1 - indoor * 0.55), 1.5);
    set(B.rainHi, rain * (0.045 + E.forest * 0.04) * (1 - indoor * 0.8), 1.5);
    set(B.rainRoof, rain * indoor * 0.14, 1.5);
    // insects (warm, bright, dry) and crickets (night)
    const warm = smoothstep(0.35, 0.9, day) * (1 - rain) * (1 - W.fog * 0.5);
    const meadow = Math.max(E.field, (1 - E.forest) * 0.6);
    set(B.field, 0.012 * warm * meadow * open, 2);
    B.field.mod.gain.setTargetAtTime(0.01 * warm * meadow * open, t, 2);
    set(B.crickets, 0.017 * night * (1 - rain) * (1 - E.village * 0.5) * open, 2);
    // village hum / distant road
    set(B.village, E.village * 0.07 * open * (0.4 + 0.6 * day), 2);
    const carsNear = g.vehicles ? g.vehicles.cars.filter((cv) => cv.visible && Math.hypot(cv.x - g.player.x, cv.z - g.player.z) < 500).length : 0;
    set(B.roadFar, clamp(carsNear * 0.012 + E.road * 0.03, 0, 0.07) * open * (1 + rain * 0.5), 1.5);
    // power line hum
    const wetBoost = 1 + W.wet * 0.7 + (W.fog > 0.3 ? 0.5 : 0);
    B.hum.g.gain.setTargetAtTime(clamp(1 - E.pole / 14, 0, 1) * 0.045 * wetBoost * open, t, 0.5);
    // river
    if (E.riverPos) {
      this._setPos(B.river.panner, E.riverPos[0], E.riverPos[1], E.riverPos[2]);
      B.river.g.gain.setTargetAtTime(0.75 * (0.7 + rain * 0.5) * open, t, 0.4);
    } else B.river.g.gain.setTargetAtTime(0, t, 0.5);
    // car voices on the nearest visible vehicles
    if (g.vehicles) {
      const near = g.vehicles.nearCars || [];
      B.cars.forEach((v, i) => {
        const n = near[i];
        if (n && n.d < 220) {
          const car = n.c;
          this._setPos(v.p, car.x, car.y + 0.6, car.z);
          const sp = clamp(car.v / 16, 0, 1);
          v.eng.frequency.setTargetAtTime(38 + sp * 70, t, 0.1);
          v.nf.frequency.setTargetAtTime(500 + sp * 900 + rain * 300, t, 0.2);
          v.g.gain.setTargetAtTime((0.06 + sp * 0.4) * (1 + rain * 0.5) * (car.v > 0.5 ? 1 : 0.35), t, 0.2);
        } else v.g.gain.setTargetAtTime(0, t, 0.3);
      });
    }
    // farm machinery at the plowed field during work hours
    const farmField = g.world.terrain.fields.find((f) => f.id === 'f3');
    if (farmField) {
      this._setPos(B.machine.p, farmField.cx + 25, 50, farmField.cz + 10);
      const hr = g.time.hours;
      const work = (hr > 8 && hr < 11.8) || (hr > 14 && hr < 17.5) ? 1 : 0;
      B.machine.g.gain.setTargetAtTime(work * (1 - rain) * 0.5, t, 2);
      B.machine.lfo.gain.setTargetAtTime(work * 0.12, t, 2);
    }

    // ---- stochastic events ----
    this.timers.birds -= dt;
    if (this.timers.birds <= 0) {
      const hr = g.time.hours;
      const dawn = Math.exp(-Math.pow((hr - 5.9) / 1.4, 2)) * 1.6;
      const dayAct = smoothstep(0.1, 0.5, day);
      const rate = (0.3 + dawn + dayAct * 0.5) * (0.4 + E.forest * 0.9 + (1 - E.forest) * 0.5) * (1 - rain * 0.85) * (1 - W.fog * 0.3) * (1 - E.indoors * 0.7) * (1 - night * 0.97);
      this.timers.birds = rate > 0.02 ? clamp(this.rng.range(1.2, 4.5) / rate, 0.4, 25) : 4;
      if (rate > 0.05) {
        const a = this.rng.next() * Math.PI * 2, r = this.rng.range(8, 70);
        const x = g.player.x + Math.cos(a) * r, z = g.player.z + Math.sin(a) * r;
        const y = g.player.y + this.rng.range(3, 14);
        const kinds = E.forest > 0.4 ? ['tweet', 'trill', 'tweet', 'coo'] : ['tweet', 'trill', 'caw', 'coo', 'tweet'];
        this.birdCall(x, y, z, this.rng.pick(kinds));
      }
    }
    this.timers.dog -= dt;
    if (this.timers.dog <= 0) {
      this.timers.dog = this.rng.range(25, 80);
      const near = E.village > 0.25 || Math.hypot(g.player.x + 100, g.player.z + 330) < 300;
      if (near && !E.indoors) {
        const a = this.rng.next() * Math.PI * 2, r = this.rng.range(60, 160);
        this.dogBark(g.player.x + Math.cos(a) * r, g.player.y + 1, g.player.z + Math.sin(a) * r);
      }
    }
    this.timers.voice -= dt;
    if (this.timers.voice <= 0) {
      this.timers.voice = this.rng.range(6, 18);
      if (g.npcs) {
        const vis = g.npcs.visibleAgents().filter((a) => Math.hypot(a.x - g.player.x, a.z - g.player.z) < 45 && a.speed < 3);
        if (vis.length && !E.indoors && rain < 0.6) { const a = this.rng.pick(vis); this.voiceMurmur(a.x, g.world.heightAt(a.x, a.z) + 1.6, a.z); }
      }
    }
    // church bell on the hour (daytime only, when the village is within earshot)
    const hrNow = Math.floor(g.time.total);
    if (!this.bellInit) { this.lastBell = hrNow; this.bellInit = true; }
    if (hrNow !== this.lastBell) {
      this.lastBell = hrNow;
      const h = ((hrNow % 24) + 24) % 24;
      const ch = g.world.structures.byId.church;
      if (ch && h >= 7 && h <= 21 && Math.hypot(ch.x - g.player.x, ch.z - g.player.z) < 900 && rain < 0.9) this.bell(ch.x, ch.y + 15, ch.z, (h % 12) || 12);
    }
    // quiet first-time motif on the bridge
    const br = g.world.roads.bridges[0];
    if (br && !this.motifDone.bridge && Math.hypot(br.x - g.player.x, br.z - g.player.z) < 6) this.playMotif('bridge');
  }

  serialize() { return { motifs: this.motifDone }; }
  restore(d) { if (d && d.motifs) this.motifDone = d.motifs; }
}
void lerp;
