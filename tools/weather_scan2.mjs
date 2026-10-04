import fs from 'fs';
let src = fs.readFileSync('src/systems/Weather.js','utf8').replace(/from '\.\.\/core\/Noise\.js'/, "from '../core/Noise.js'");
import { Weather } from '../src/systems/Weather.js';
import { GameTime } from '../src/systems/GameTime.js';
const w = new Weather(); const t = new GameTime();
const res = [];
for (let ph = 0; ph < 400; ph += 1) {
  const orig = Weather.prototype.target;
  // emulate phase by shifting day/hours
  const at = (h) => { t.day = Math.floor((h + ph) / 24); t.hours = (h + ph) % 24; return orig.call(w, { total: h + ph, hours: ((6.75 + h) % 24) }); };
  const s = at(0);
  if (s.cloud < 0.3 || s.cloud > 0.6 || s.rain > 0.01 || s.fog < 0.1 || s.fog > 0.4) continue;
  let rainHours = [];
  for (let h = 0; h < 36; h += 0.5) { const x = at(h); if (x.rain > 0.5) rainHours.push(h); }
  res.push([ph, s.cloud.toFixed(2), s.fog.toFixed(2), rainHours.length ? `${rainHours[0]}-${rainHours[rainHours.length-1]}` : 'none']);
}
console.log(res.slice(0, 40).map((r) => r.join(' ')).join('\n'));
