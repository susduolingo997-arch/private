import { Weather } from '../src/systems/Weather.js';
import { GameTime } from '../src/systems/GameTime.js';
const w = new Weather();
const t = new GameTime();
let out = [];
for (let h = 0; h < 72; h += 3) {
  t.day = Math.floor(h / 24); t.hours = h % 24;
  const x = w.target(t);
  out.push(`${String(Math.floor(h/24))}d${String(h%24).padStart(2,'0')}h c${x.cloud.toFixed(2)} r${x.rain.toFixed(2)} f${x.fog.toFixed(2)} w${x.wind.toFixed(2)}`);
}
console.log(out.join('\n'));
