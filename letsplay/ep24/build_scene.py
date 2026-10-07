# ep24 scene.js = ep23 head (incl. ep21-23 helpers) minus ep23's sets + body24 + ep23 compositor tail; every replacement must match once
src = open('../ep23/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 23: "THE BAKE-OFF')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body24.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const morning = {", "seg(t, 270, 292) * 0.5);", """  const nite = { top: '#070a26', bot: '#26305e', sunI: 0.8, hemiI: 0.85, fog: '#1a2246', sunEl: -0.3, sunAz: 2.6, near: 40, far: 160 };
  const stormy = { top: '#0c1018', bot: '#28323f', sunI: 0.55, hemiI: 0.8, fog: '#1e2632', sunEl: -0.3, sunAz: 2.6, near: 20, far: 100 };
  const dawnS = { top: '#7ab0ff', bot: '#ffd8b0', sunI: 2.3, hemiI: 1.45, fog: '#ffd8b8', sunEl: 0.22, sunAz: -0.9, near: 70, far: 240 };
  if (t < E.cross) return mix(day, sunset, seg(t, 0, E.cross) * 0.8); if (t < E.storm) return mix(mix(sunset, eve, seg(t, E.cross, E.arrive)), nite, seg(t, E.arrive, E.storm));
  if (t < E.calm) return Math.floor(t * 3.1) % 23 === 0 ? { ...stormy, top: '#8a9ab8', hemiI: 2.4 } : stormy; if (t < E.dawn) return nite; return dawnS;""")
rep("(win(t, E.poof, E.poof + 2) || win(t, E.panic, E.fights + 6) || win(t, E.chase, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.storm, E.saved) || win(t, E.excite, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.seasick ? 5 : t < E.storm ? 4 : t < E.feedBack ? 3 : t < E.excite ? 5 : 4;")
rep("outlined('☀ DAY 23', W / 2, 32, 18,", "outlined(t > E.cross + 8 && t < E.dawn ? '☾ NIGHT 24' : '☀ DAY 24', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['key', t > E.keys + 1 ? 1 : 0], ['shrimp', win(t, E.splash1 + 9, E.feed + 1) ? 5 : 0], ['plank', win(t, E.boat, E.seasick) ? 64 : 3]];")
rep("  // cake size / bake timer — this episode's mechanic\n  drawCake(t);", "  // light power — this episode's mechanic\n  drawLight(t);")
rline("const TOASTS = ", """ICON.key = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x - s * 0.4, y, s * 0.45, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.1, y - s * 0.12, s * 1.1, s * 0.24); ctx.fillRect(x + s * 0.6, y, s * 0.2, s * 0.4); };
ICON.shrimp = (x, y, s) => { ctx.fillStyle = '#ff8a6a'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0.3, 4.6); ctx.lineWidth = s * 0.45; ctx.strokeStyle = '#ff8a6a'; ctx.stroke(); };
const TOASTS = [[E.keys + 1.4, '+1 Lighthouse Keys', 'key'], [E.boat + 6, '+1 Motorboat', 'plank'], [E.splash1 + 4, '+1 Boot (wet)', 'plank'], [E.splash1 + 10, '+5 Shrimp', 'shrimp'], [E.discoUse + 2, 'Disco Ball: REFLECTOR', 'shard']];""")
rline("const FEATS = ", "const FEATS = [[E.reveal + 4, 'Bright Idea', 'Discover the light is a fish'], [E.feed + 2, 'Fish Food', 'Dive for shrimp in a storm'], [E.leggy + 6, 'Brave Legs', 'Leggy goes swimming'], [E.saved + 3, 'Lifesaver', 'Steer a yacht away from the rocks']];")
rblock("const POPS = [", """const POPS = [[E.keeper + 0.6, 1.6, 'AHOY!', 0.62, 0.3, '#ffffff', 90], [E.keys + 0.2, 1.2, 'jingle', 0.5, 0.45, '#ffd23f', 64], [E.fly + 1, 1.6, 'flap flap flap', 0.5, 0.3, '#ffffff', 64], [E.boat + 2, 1.4, 'MOTORBOAT', 0.6, 0.35, '#ffd400', 70],
  [E.seasick + 1, 1.4, 'urp.', 0.55, 0.42, '#9fdc5a', 80], [E.cross + 6, 1.4, 'putt putt putt', 0.5, 0.35, '#ffffff', 56], [E.reveal + 1.4, 1.8, 'THE LIGHT IS A FISH', 0.5, 0.25, '#fff3a0', 64], [E.sad + 1, 1.4, 'sigh...', 0.5, 0.35, '#8fa0ff', 70],
  [E.storm, 1.6, 'KRAKOOM', 0.5, 0.25, '#ffffff', 110], [E.ship + 1, 1.6, 'the DUKE?!', 0.5, 0.3, '#ff9ad0', 80], [E.jokes + 3, 1.4, '*crickets*', 0.5, 0.35, '#ffffff', 64], [E.disco + 6, 1.6, 'DISCO!', 0.6, 0.3, '#ff8fd8', 90], [E.dance + 2, 1.4, 'tippy tap', 0.4, 0.4, '#ffffff', 60],
  [E.hungry, 1.6, 'RULE TWO!', 0.5, 0.3, '#ffe066', 90], [E.splash1, 1.4, 'SPLOOSH', 0.5, 0.35, '#a8d8ff', 100], [E.splash1 + 3, 1.4, 'a boot.', 0.5, 0.4, '#ffffff', 64], [E.feed + 0.6, 1.4, 'CHOMP', 0.5, 0.35, '#ff8a6a', 100], [E.notEnough, 1.6, 'NOT ENOUGH', 0.5, 0.3, '#ff6b6b', 80],
  [E.leggy + 4, 1.6, 'hug.', 0.4, 0.35, '#ff8fd8', 90], [E.discoUse + 1, 1.6, 'x10 BEAM', 0.5, 0.25, '#fff3a0', 110], [E.saved + 2, 1.6, 'phew', 0.5, 0.4, '#ffffff', 80], [E.lamp2 + 1, 1.6, 'good job, kids', 0.62, 0.3, '#ffffff', 60],
  [E.excite, 1.8, '!!!!!', 0.5, 0.3, '#fff3a0', 120], [E.jump, 1.4, 'FLOP', 0.5, 0.4, '#5ff7ff', 100], [E.out, 1.6, 'KSSSH', 0.5, 0.3, '#cfefff', 110], [E.splash2, 1.4, 'SPLASH', 0.5, 0.35, '#a8d8ff', 110], [E.leapOut, 1.6, 'WHEEEE', 0.5, 0.25, '#fff3a0', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.reveal + 1, 1.0, 1.15, 0.5, 0.45], [E.ship + 1, 0.8, 1.15, 0.6, 0.5], [E.notEnough, 0.8, 1.1, 0.5, 0.5], [E.excite, 1.0, 1.2, 0.5, 0.45]];")
rline("const SHAKES = ", "const SHAKES = [[E.storm, 1.2, 0.2], [E.storm + 1.2, 80, 0.025], [E.splash1, 0.6, 0.2], [E.discoUse, 1, 0.15], [E.excite, 14, 0.05], [E.out, 1.2, 0.35], [E.splash2, 0.8, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.storm, 0.3, '220,230,255'], [E.storm + 9, 0.2, '220,230,255'], [E.jokes + 6, 0.2, '220,230,255'], [E.dance + 3, 0.25, '220,230,255'], [E.splash1 + 6, 0.2, '220,230,255'], [E.discoUse + 0.6, 0.35, '255,250,200'], [E.excite + 6, 0.5, '255,255,240'], [E.out, 0.3, '255,255,255']];")
rep("outlined('EPISODE 23', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE BAKE-OFF', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the cake fights back)'",
    "outlined('EPISODE 24', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE LIGHTHOUSE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the light is a fish)'")
rep("outlined(i ? 'EP 24: THE LIGHTHOUSE' : 'EP 22: THE GHOST TRAIN', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the light is a fish)' : '(next stop: AAAAH)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 25: THE SNOW GLOBE' : 'EP 23: THE BAKE-OFF', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we\\'re inside it)' : '(the cake fights back)', x + 110, y + 80, 14")
rep("outlined('yep. it fights back.', 0, 0, 56", "outlined(\"yep. it's a fish.\", 0, 0, 56")
rep("\"pie: 1. me: 0.\"", "\"and I'm on it.\"")
rep("'(it was a fair hit)'", "'(the lighthouse is dark now)'")
rline("const SECS = ", "const SECS = [[0, E.lamp, bay, 'bay'], [E.lamp, E.ship, lamp, 'lamp'], [E.ship, E.ship + 6, bay, 'bay'], [E.ship + 6, E.splash1 - 2, lamp, 'lamp'], [E.splash1 - 2, E.feedBack, bay, 'bay'], [E.feedBack, E.saved, lamp, 'lamp'], [E.saved, E.saved + 8, bay, 'bay'], [E.saved + 8, E.dawn, lamp, 'lamp'], [E.dawn, E.lamp2, bay, 'bay'], [E.lamp2, E.out, lamp, 'lamp'], [E.out, 1e9, bay, 'bay']];")
rline("const panic = ", "  const panic = win(T, E.ship, E.ship + 6) || win(T, E.splash1, E.splash1 + 4) || win(T, E.jump, E.splash2);")
rep("if (win(T, E.ovenB, E.mix) || win(T, E.bake + 4, E.ovenIn)) { const bl", "if (win(T, E.boat, E.boat + 6) || win(T, E.disco, E.disco + 6)) { const bl")
rep("// sun & moons\n  const night = false;", "// sun & moons\n  const night = t > E.cross + 8 && t < E.dawn && !cave;")
rep("""    stamp(T, E.poof + 1, 'TEST CAKE: FAILED');
    stamp(T, E.alive + 1.4, 'CAKE STATUS: ALIVE');
    stamp(T, E.crunch + 1.4, 'TEETH: 0');
    drawLetter(T);""", """    stamp(T, E.reveal + 3.4, 'LIGHT SOURCE: FISH');
    stamp(T, E.saved + 4, 'YACHT: SAVED');
    stamp(T, E.out + 3, 'LIGHTHOUSE: DARK');
    drawRules(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
