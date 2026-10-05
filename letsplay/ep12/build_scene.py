# ep12 scene.js = ep11 head (shared cast/props of ep6-11) + body12 + ep11 compositor tail; every replacement must match once
src = open('../ep11/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: camp at dusk (planning)')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body12.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[15.0, 'Distraction? I was BORN for this.']", "]];", """  const Q = [[22.0, 'Nature walk! Totally normal!'], [48.0, 'Look, Leggy! A butterfly!'], [59.0, 'Hair flip! ...Air flip.'], [106.6, 'Leggy, NO, this way!'], [118.8, 'She is onto us.'], [196.6, 'Sponsored candles, baby!'], [206.0, 'That... was not in the ad.'], [221.0, 'I am PINK.'], [253.4, 'Say CAKE!']];""")
cut("  const nightS = { top: '#070b22'", "return nightS;", """  if (t < E.party - 12) return day;
  return mix(day, sunset, ss(seg(t, E.party - 12, E.party + 4)));""")
rline("const hpv = ", "  const hpv = t < E.burn ? 5 : t < E.refrost ? 4.5 : t < E.boom ? 5 : 4;")
rep("'☾ NIGHT 11'", "'☀ DAY 12'")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', t > E.gifts ? 1 : 0], ['jam', win(t, E.tier1, E.boom) ? 3 : 0], ['glass', 0], ['shard', t > E.gifts ? 1 : 0], ['plank', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, E.tier1, E.banner)) sel = 3; else if (t > E.gifts) sel = 2;")
cut("  // Stealth meter (this episode's mechanic)", "ctx.fillStyle = sv > 0.6 ? '#ff6b6b' : '#7cff6b'; ctx.fill(); }", """  // Surprise meter: how suspicious is Leggy? (this episode's mechanic)
  if (t > E.plan && t < E.party) { const sv = suspicion(t), gx = 22, gy = 196, dbl = t > E.gifts; rrect(gx, gy, 220, 40, 12); ctx.fillStyle = 'rgba(40,10,40,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = dbl ? '#ffe066' : '#ff5cf0'; ctx.stroke();
    outlined(dbl ? 'DOUBLE SURPRISE!' : 'LEGGY SUSPECTS', gx + 12, gy + 20, 13, dbl ? '#ffe066' : '#ff9ad8', '#000', 3, 'left'); if (!dbl) { rrect(gx + 124, gy + 13, 84, 14, 7); ctx.fillStyle = '#333'; ctx.fill(); rrect(gx + 124, gy + 13, 84 * sv, 14, 7); ctx.fillStyle = sv > 0.7 ? '#ff6b6b' : '#ff9ad8'; ctx.fill(); } }""")
rline("const TOASTS = ", "const TOASTS = [[E.tier2 + 2, '+2 Cake Tiers', 'jam'], [E.burn + 2, '-1 Tier (charcoal)', 'castle'], [E.refrost + 2, '+1 Muffin (frosting pro)', 'flower'], [E.gifts + 1, '+1 Flower Crown', 'flower']];")
rline("const FEATS = ", "const FEATS = [[E.banner + 1, 'Party Planner', 'Decorate the camp'], [E.muffin + 6, 'Cupcake Friend', 'Hire a walking cupcake'], [E.gifts + 6, 'Double Surprise', 'Get surprised by the birthday girl'], [E.boom + 3, 'Cake Rocket', 'Launch a birthday cake']];")
rblock("const POPS = [", """const POPS = [[E.walk + 4, 1.2, 'sus...', 0.4, 0.4, '#ff9ad8', 56], [E.tier1, 1.2, 'plop', 0.5, 0.4, '#ffffff', 56], [E.banner, 1.4, 'TA-DA!', 0.5, 0.25, '#ffe066', 76], [E.burn + 1, 1.4, 'sizzle...', 0.6, 0.3, '#ff6a1a', 60],
  [E.muffin + 1, 1.4, 'squeak!', 0.3, 0.5, '#ff9ad8', 60], [E.refrost + 2, 1.2, 'ACHOO! (sprinkles)', 0.6, 0.3, '#5ff7ff', 48], [E.leggyBack, 1.4, 'HIDE!!', 0.5, 0.3, '#ff6b6b', 86], [E.gifts, 1.6, 'aww...', 0.5, 0.3, '#ff9ad8', 70],
  [E.party, 1.8, 'SURPRISE!', 0.5, 0.25, '#ffe066', 96], [E.light + 1, 1.2, 'hisssss', 0.6, 0.35, '#ffffff', 56], [E.launch, 1.8, 'WHOOOSH', 0.5, 0.25, '#ffb43a', 88], [E.boom, 2.0, 'KA-SPLAT!', 0.5, 0.3, '#ff9ad8', 100], [E.photo + 2, 1.4, 'CAKE!', 0.5, 0.3, '#ffffff', 80]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.burn + 1, 0.8, 1.15, 0.5, 0.5], [E.leggyBack, 0.8, 1.2, 0.5, 0.5], [E.party, 1.0, 1.2, 0.5, 0.5], [E.boom, 1.0, 1.25, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.launch, 3, 0.2], [E.boom, 1.6, 0.4]];")
rline("const FLASH = ", "const FLASH = [[E.party, 0.25, '255,240,200'], [E.boom, 0.35, '255,220,240']];")
rep("outlined('EPISODE 11', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE HEIST', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(steal the crown back)'",
    "outlined('EPISODE 12', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE BIRTHDAY', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy turns one)'")
rep("outlined(i ? 'EP 12: THE BIRTHDAY' : 'EP 10: SPACE?!', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(Leggy turns one)' : '(it landed)'",
    "outlined(i ? 'EP 13: THE GRAND RACE' : 'EP 11: THE HEIST', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(six legs vs. wheels)' : '(it was already mine)'")
rep("'yep. it was already mine.'", "'yep. it exploded.'")
rep("\"that's me. criminal mastermind.\"", "\"that's me. covered in frosting.\"")
rep("'(we owe the goose a skylight)'", "'(happy birthday, Leggy)'")
rline("const SECS = ", "const SECS = [[0, E.trail1, camp12, 'camp12'], [E.trail1, E.camp2, trail, 'trail'], [E.camp2, E.trail2, camp12, 'camp12'], [E.trail2, E.camp3, trail, 'trail'], [E.camp3, 1e9, camp12, 'camp12']];")
rline("const panic = ", "  const panic = win(T, E.burn, E.burn + 4) || win(T, E.launch, E.boom);")
rep("if (win(T, 9999, 9999)) { const bl", "if (win(T, E.tier1, E.banner)) { const bl")
cut("    if (win(T, E.plan, E.planEnd)) { const k", "stamp(T, E.crownOn + 0.4, 'CROWN RECOVERED');", """    if (win(T, E.plan, E.planEnd)) { const k = ss(seg(T, E.plan, E.plan + 0.35)) * (1 - ss(seg(T, E.planEnd - 0.35, E.planEnd))); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03);
      ctx.fillStyle = '#fff3fb'; ctx.fillRect(-220, -165, 440, 320); ctx.fillStyle = '#ff5cf0'; ctx.fillRect(-220, -165, 440, 14); outlined('SURPRISE PARTY PLAN', 0, -122, 28, '#7a3cff', '#fff3fb', 2);
      [[0.6, '[ ] Giant cake'], [1.6, '[ ] Banner'], [2.6, '[ ] Balloons'], [3.6, '[ ] Keep Leggy AWAY']].forEach(([d, a], i) => { if (T < E.plan + d) return; ctx.font = F(22); ctx.textAlign = 'left'; ctx.fillStyle = i === 3 ? '#c0182a' : '#3a2450'; ctx.fillText(a, -180, -66 + i * 46); }); ctx.restore(); }
    if (win(T, 179.2, E.party)) { const k = ss(seg(T, 179.2, 179.6)) * (1 - ss(seg(T, E.party - 0.4, E.party))); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.28, H * 0.44); ctx.rotate(-0.04); ctx.fillStyle = '#fffbe8'; ctx.fillRect(-190, -140, 380, 270); ctx.strokeStyle = '#ff9ad8'; ctx.lineWidth = 6; ctx.strokeRect(-182, -132, 364, 254);
      outlined('THANK YOU', 0, -88, 34, '#ff5cf0', '#fffbe8', 2); outlined('for my first year', 0, -48, 22, '#7a3cff', '#fffbe8', 2); ctx.font = F(40); ctx.textAlign = 'center'; ctx.fillText('♥', 0, 20); outlined('love, Leggy', 0, 80, 22, '#3a2450', '#fffbe8', 2); ctx.restore(); }
    stamp(T, E.toast - 1.6, 'HAPPY BIRTHDAY LEGGY');""")
rep("(t > E.alarm && t < E.splash)", "(t > E.launch && t < E.boom + 1)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
