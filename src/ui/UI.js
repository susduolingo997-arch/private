import { Settings, DEFAULTS } from '../core/Settings.js';

const SLIDERS = [
  ['mouseSensitivity', 'Mouse sensitivity', 0.2, 3, 0.05, (v) => v.toFixed(2) + '×'],
  ['fov', 'Field of view', 50, 100, 1, (v) => v.toFixed(0) + '°'],
  ['movementSensitivity', 'Movement sensitivity', 0.4, 1.8, 0.05, (v) => v.toFixed(2) + '×'],
  ['masterVolume', 'Master volume', 0, 1, 0.01, (v) => Math.round(v * 100) + '%'],
  ['effectsVolume', 'Effects volume', 0, 1, 0.01, (v) => Math.round(v * 100) + '%'],
  ['musicVolume', 'Music volume', 0, 1, 0.01, (v) => Math.round(v * 100) + '%'],
];

/**
 * DOM overlay: start screen, pause + settings menu, the single contextual prompt, and the
 * rare quiet line of text. There is deliberately no HUD during play.
 */
export class UI {
  constructor(game) {
    this.game = game;
    this.menu = document.getElementById('menu');
    this.promptEl = document.getElementById('prompt');
    this.whisperEl = document.getElementById('whisper');
    this.cross = document.getElementById('crosshair');
    this.mode = 'start';
    this.ready = false;
    this._whisperTimer = 0;
  }

  setReady() { this.ready = true; if (this.mode === 'start') this.showStart(this.hasSave); }

  showStart(hasSave) {
    this.mode = 'start'; this.hasSave = hasSave;
    this.menu.classList.add('visible');
    this.menu.innerHTML = `
      <div class="card">
        <h1>The Long Way Home</h1>
        <p class="sub">There is no quest. Home is far away. Walk.</p>
        <p>One continuous world, from the first dirt track to your own front door. No maps, no markers, no loading between places — only the road, the weather and the time of day.</p>
        <div>
          ${hasSave ? '<button class="btn primary" id="btn-continue">Continue walking</button><button class="btn" id="btn-new">Start a new journey</button>'
            : '<button class="btn primary" id="btn-new">Begin walking</button>'}
        </div>
        <div class="keys"><b>W A S D</b><span>walk</span><b>Mouse</b><span>look around</span><b>Shift</b><span>stroll slowly</span><b>E</b><span>open · sit · read</span><b>Esc</b><span>pause &amp; settings</span></div>
        <p class="small" id="ready-note">${this.ready ? 'Headphones recommended.' : 'Waking the world…'}</p>
      </div>`;
    const c = document.getElementById('btn-continue'), n = document.getElementById('btn-new');
    if (!this.ready) { if (c) c.disabled = true; if (n) n.disabled = true; }
    if (c) c.onclick = () => this.game.begin(false);
    if (n) n.onclick = () => this.game.begin(true);
  }

  showPause() {
    this.mode = 'pause';
    this.menu.classList.add('visible');
    const S = Settings.values, g = this.game;
    const rows = SLIDERS.map(([k, label, min, max, step, fmt]) => `
      <div class="row"><label for="s-${k}">${label}</label><input id="s-${k}" type="range" min="${min}" max="${max}" step="${step}" value="${S[k]}" /><output id="o-${k}">${fmt(S[k])}</output></div>`).join('');
    this.menu.innerHTML = `
      <div class="card">
        <h1>Paused</h1>
        <p class="sub">The world is waiting where you left it.</p>
        <button class="btn primary" id="btn-resume">Resume</button>
        <h2>Controls &amp; Audio</h2>
        ${rows}
        <h2>Graphics &amp; Time</h2>
        <div class="row sel"><label>Graphics quality</label><select id="s-quality">
          ${['low', 'medium', 'high'].map((q) => `<option value="${q}" ${S.quality === q ? 'selected' : ''}>${q}</option>`).join('')}</select></div>
        <div class="row sel"><label>Flow of time</label><select id="s-timeScale">
          ${[[1, 'Real time (1×)'], [6, 'Slow (6×)'], [24, 'Gentle (24×)'], [60, 'Quick (60×)']].map(([v, l]) => `<option value="${v}" ${S.timeScale === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="row sel"><label>Invert mouse Y</label><select id="s-invertY"><option value="0" ${!S.invertY ? 'selected' : ''}>off</option><option value="1" ${S.invertY ? 'selected' : ''}>on</option></select></div>
        <h2>Sky (for curious walkers)</h2>
        <div class="row"><label for="s-hour">Time of day</label><input id="s-hour" type="range" min="0" max="24" step="0.05" value="${g.time.hours.toFixed(2)}" /><output id="o-hour">${g.time.clock}</output></div>
        <div class="row sel"><label>Weather</label><select id="s-weather">
          ${[['auto', 'Natural (follows world time)'], ['clear', 'Clear'], ['partly', 'Partly cloudy'], ['overcast', 'Overcast'], ['rain', 'Rain'], ['fog', 'Fog']].map(([v, l]) => `<option value="${v}" ${g.weather.preset === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <button class="btn" id="btn-reset">Start over</button>
        <p class="small">Your journey is saved automatically.</p>
      </div>`;
    for (const [k, , , , , fmt] of SLIDERS) {
      const el = document.getElementById('s-' + k), out = document.getElementById('o-' + k);
      el.oninput = () => { const v = parseFloat(el.value); Settings.set(k, v); out.textContent = fmt(v); };
    }
    document.getElementById('s-quality').onchange = (e) => Settings.set('quality', e.target.value);
    document.getElementById('s-timeScale').onchange = (e) => Settings.set('timeScale', parseFloat(e.target.value));
    document.getElementById('s-invertY').onchange = (e) => Settings.set('invertY', e.target.value === '1');
    const hour = document.getElementById('s-hour'), ho = document.getElementById('o-hour');
    hour.oninput = () => { g.time.set(parseFloat(hour.value)); ho.textContent = g.time.clock; g.refreshSkyNow(); };
    document.getElementById('s-weather').onchange = (e) => g.weather.setPreset(e.target.value);
    document.getElementById('btn-resume').onclick = () => g.resume();
    document.getElementById('btn-reset').onclick = () => { if (confirm('Start the journey over from the beginning?')) g.begin(true); };
  }

  hideMenu() { this.menu.classList.remove('visible'); this.cross.classList.add('on'); }
  showingMenu() { return this.menu.classList.contains('visible'); }

  setPrompt(html) {
    if (this._prompt === html) return;
    this._prompt = html;
    if (html) this.promptEl.innerHTML = html;
    this.promptEl.classList.toggle('on', !!html);
  }

  whisper(text, ms = 9000) {
    this.whisperEl.textContent = text;
    this.whisperEl.classList.add('on');
    clearTimeout(this._whisperTimer);
    this._whisperTimer = setTimeout(() => this.whisperEl.classList.remove('on'), ms);
  }
}
void DEFAULTS;
