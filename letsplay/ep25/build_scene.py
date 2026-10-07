# ep25 scene.js = ep24 head (incl. ep21-24 helpers) minus ep24's sets + body25 + ep24 compositor tail; every replacement must match once
src = open('../ep24/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 24: "THE LIGHTHOUSE')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body25.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const nite = {", "if (t < E.dawn) return nite; return dawnS;", """  const autumn = { top: '#7ab8f0', bot: '#ffe8c8', sunI: 2.4, hemiI: 1.5, fog: '#f0e0d0', sunEl: 0.55, sunAz: 0.4, near: 70, far: 220 };
  const globeS = { top: '#a8d0f0', bot: '#f0f8ff', sunI: 1.8, hemiI: 1.8, fog: '#e8f4ff', sunEl: 0.8, sunAz: 0.6, near: 40, far: 140 };
  const snowy = { top: '#8aa8d0', bot: '#e8f0ff', sunI: 1.6, hemiI: 1.6, fog: '#dce8f8', sunEl: 0.3, sunAz: 2.4, near: 30, far: 120 };
  const inG = (t >= E.inside && t < E.drill) || (t >= E.quake2 && t < E.outside); if (inG) return globeS;
  if (t < E.snowOn) return autumn; if (t < E.tooMuch) return mix(mix(autumn, sunset, seg(t, E.snowOn, E.calm + 10)), snowy, 0.4); return mix(snowy, { ...snowy, near: 6, far: 40, fog: '#ffffff' }, seg(t, E.tooMuch, E.freeze));""")
rep("(win(t, E.storm, E.saved) || win(t, E.excite, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.quake1, E.quake1 + 6) || win(t, E.quake2, E.house + 2) || win(t, E.melt, E.snowOn) || win(t, E.tooMuch + 6, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.pulled ? 5 : t < E.house ? 4 : t < E.outside ? 5 : t < E.snowOn ? 4 : t < E.tooMuch ? 5 : 3;")
rep("outlined(t > E.cross + 8 && t < E.dawn ? '☾ NIGHT 24' : '☀ DAY 24', W / 2, 32, 18,", "outlined((t >= E.inside && t < E.drill) || (t >= E.quake2 && t < E.outside) ? '❄ DAY 25 (tiny)' : '☀ DAY 25', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['globe', t > E.gift + 2 && t < E.pulled ? 1 : 0], ['snowball', t > E.snowOn ? 16 : 0], ['plank', win(t, E.macB, E.snowOn) ? 64 : 3]];")
rep("  // light power — this episode's mechanic\n  drawLight(t);", "  // size / snow depth — this episode's mechanic\n  drawGlobeHUD(t);")
rline("const TOASTS = ", """ICON.globe = (x, y, s) => { ctx.fillStyle = '#8a5a2b'; ctx.fillRect(x - s * 0.8, y + s * 0.4, s * 1.6, s * 0.5); ctx.fillStyle = 'rgba(200,236,255,.9)'; ctx.beginPath(); ctx.arc(x, y - s * 0.1, s * 0.75, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(x - s * 0.5, y + s * 0.2, s, s * 0.2); };
ICON.snowball = (x, y, s) => { ctx.fillStyle = '#f6fbff'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0, 7); ctx.fill(); ctx.fillStyle = '#c8e0f2'; ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 0.3, s * 0.2); };
const TOASTS = [[E.gift + 2, '+1 Snow Globe (from Duke)', 'globe'], [E.mayor + 8, 'Quest: Ring the Great Bell', 'shard'], [E.macB + 12, '+1 Snow Machine', 'plank'], [E.snowOn + 6, '+16 Snowballs', 'snowball']];""")
rline("const FEATS = ", "const FEATS = [[E.inside + 3, 'Honey, I Shrunk Me', 'Fall into a snow globe'], [E.house + 3, 'Avalanche', 'Become a snowball'], [E.bell + 3, 'Ding Dong', 'Ring the Great Bell'], [E.snowOn + 8, 'Let It Snow', 'Save the Flurries']];")
rblock("const POPS = [", """const POPS = [[E.gift, 1.4, 'a package!', 0.5, 0.35, '#ffe066', 64], [E.gift + 3, 1.8, 'thanks! -Duke', 0.5, 0.3, '#ff9ad0', 60], [E.shake, 1.4, 'shake shake', 0.5, 0.35, '#cfefff', 70], [E.pulled, 1.6, 'SHWOOP', 0.5, 0.35, '#5ff7ff', 110], [E.pulled + 3, 1.6, 'WHERE DID HE GO', 0.5, 0.3, '#ffffff', 60],
  [E.leggyShake, 1.4, 'shake?', 0.4, 0.35, '#5ff7ff', 70], [E.inside + 1.2, 1.4, 'FLUMP', 0.5, 0.4, '#ffffff', 110], [E.flurries + 1, 1.6, 'hi!', 0.4, 0.4, '#ffffff', 80], [E.mayor + 1, 1.8, 'NOBODY LEAVES', 0.6, 0.3, '#e8344e', 70], [E.quake1, 1.6, 'RUMBLE', 0.5, 0.25, '#ffffff', 110],
  [E.quake1 + 2, 1.6, 'WEATHER!!', 0.6, 0.35, '#5ff7ff', 90], [E.sled + 1, 1.6, 'WHEEE', 0.5, 0.3, '#ffffff', 100], [E.drill + 1, 1.6, 'BZZZZT', 0.5, 0.3, '#ffd400', 100], [E.drill + 6, 1.4, 'shake!', 0.4, 0.35, '#5ff7ff', 80], [E.quake2, 1.6, 'MEGA SHAKE', 0.5, 0.25, '#ffffff', 100],
  [E.house, 1.6, 'KRUNCH', 0.4, 0.4, '#ffffff', 110], [E.twist + 1, 1.8, 'take us with you!', 0.5, 0.3, '#5ff7ff', 60], [E.bell, 1.6, 'DONNNG', 0.5, 0.3, '#ffe066', 120], [E.bell + 2, 1.6, 'DONNNG', 0.5, 0.4, '#ffe066', 90], [E.outside, 1.6, 'POP', 0.5, 0.35, '#ffffff', 110],
  [E.melt + 2, 1.6, 'drip...', 0.5, 0.4, '#5ff7ff', 70], [E.snowOn, 1.6, 'FWOOOSH', 0.4, 0.3, '#ffffff', 100], [E.snowball + 1, 1.0, 'POMF', 0.55, 0.4, '#ffffff', 80], [E.snowball + 4, 1.0, 'POMF', 0.45, 0.4, '#ffffff', 80], [E.tooMuch, 1.6, 'clunk.', 0.3, 0.4, '#ff6b6b', 80],
  [E.tooMuch + 6, 1.6, 'OVERDRIVE', 0.3, 0.3, '#ff6b6b', 90], [E.final, 1.6, 'shake shake shake', 0.3, 0.3, '#5ff7ff', 70], [E.final + 4, 1.8, 'FWOOOOOOMP', 0.5, 0.25, '#ffffff', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.pulled - 1, 1.0, 1.2, 0.5, 0.5], [E.mayor + 1, 1.0, 1.12, 0.5, 0.5], [E.twist + 1, 1.0, 1.12, 0.5, 0.5], [E.tooMuch, 0.8, 1.15, 0.3, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.pulled, 1, 0.2], [E.inside + 1.2, 0.6, 0.3], [E.quake1, 6, 0.25], [E.quake2, 8, 0.3], [E.house, 0.8, 0.4], [E.bell, 2, 0.1], [E.outside, 0.5, 0.2], [E.tooMuch + 6, 44, 0.05], [E.final + 4, 2, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.pulled, 0.4, '255,255,255'], [E.bell + 1, 0.4, '255,250,200'], [E.outside, 0.3, '255,255,255'], [E.final + 4, 0.8, '255,255,255']];")
rep("outlined('EPISODE 24', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE LIGHTHOUSE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the light is a fish)'",
    "outlined('EPISODE 25', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SNOW GLOBE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we\\'re inside it)'")
rep("outlined(i ? 'EP 25: THE SNOW GLOBE' : 'EP 23: THE BAKE-OFF', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we\\'re inside it)' : '(the cake fights back)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 26: THE MUSEUM' : 'EP 24: THE LIGHTHOUSE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(do not touch anything)' : '(the light is a fish)', x + 110, y + 80, 14")
rep("outlined(\"yep. it's a fish.\", 0, 0, 56", "outlined('yep. it snowed.', 0, 0, 56")
rep("\"and I'm on it.\"", "\"that's me. under there.\"")
rep("'(the lighthouse is dark now)'", "'(the Flurries love it)'")
rline("const SECS = ", "const SECS = [[0, E.inside, yard, 'yard'], [E.inside, E.drill, inside, 'inside'], [E.drill, E.quake2, yard, 'yard'], [E.quake2, E.outside, inside, 'inside'], [E.outside, 1e9, yard, 'yard']];")
rline("const panic = ", "  const panic = win(T, E.quake1, E.quake1 + 6) || win(T, E.quake2, E.house + 1) || win(T, E.tooMuch + 6, E.freeze);")
rep("if (win(T, E.boat, E.boat + 6) || win(T, E.disco, E.disco + 6)) { const bl", "if (win(T, E.macB, E.macB + 12)) { const bl")
rep("// sun & moons\n  const night = t > E.cross + 8 && t < E.dawn && !cave;", "// sun & moons\n  const night = false;")
rep("""    stamp(T, E.reveal + 3.4, 'LIGHT SOURCE: FISH');
    stamp(T, E.saved + 4, 'YACHT: SAVED');
    stamp(T, E.out + 3, 'LIGHTHOUSE: DARK');
    drawRules(T);""", """    stamp(T, E.inside + 2, 'SIZE: 1/100');
    stamp(T, E.twist + 6, 'FLURRIES: COMING WITH US');
    stamp(T, E.melt + 5, 'FLURRIES: MELTING');
    drawSwirl(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
