# ep18 scene.js = ep17 head minus its time-machine body + body18 + ep17 compositor tail; every replacement must match once
src = open('../ep17/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 17: "THE TIME MACHINE"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body18.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const prehist = {", "return mix(sunset, eve, seg(t, E.home + 30, 292));", """  const golden = { top: '#7ac0e0', bot: '#ffe8a0', sunI: 2.4, hemiI: 1.4, fog: '#e8f0c0', sunEl: 0.35, sunAz: 1.0, near: 60, far: 260 };
  if (t < E.tiny) return day; if (t < E.home) return golden; return mix(sunset, eve, seg(t, E.home + 30, 292));""")
rep("(win(t, E.chomp, E.fetch) || win(t, E.crunch, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.bug, E.snack) || win(t, E.splash, E.shore) || win(t, E.stomp, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.zap ? 5 : t < E.home ? 0.6 : 5;")
rep("(t > E.jungle && t < E.home ? '◷ DAY -365,000,000' : '☀ DAY 17')", "'☀ DAY 18'")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['plank', 3], ['sandwich', t > E.snack ? 0 : 1], ['glass', 0]];")
cut("  // Time Booth readout — this episode's mechanic", "fx === 'OK' ?", """  // size readout + distance to the ray — this episode's mechanic
  if (t > E.ray + 2 && t < E.freeze) { const sz = sizeAt(t), gd = goalAt(t); rrect(22, 96, 220, gd !== null ? 100 : 68, 12); ctx.fillStyle = 'rgba(10,30,14,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7cff6b'; ctx.stroke();
    outlined('YOUR SIZE', 132, 114, 15, '#7cff6b', '#000', 3); outlined(sz.toFixed(sz < 10 ? 1 : 0) + '%', 132, 142, 22, sz < 50 ? '#ff6b6b' : '#ffffff', '#000', 4);
    if (gd !== null) outlined('RAY: ' + gd + ' tiny meters', 132, 174, 14, '#ffe066', '#000', 3); }""")
rline("const TOASTS = ", "const TOASTS = [[E.ray + 3, '+1 Shrink Ray', 'castle'], [E.snack + 4, '-1 Crumb (shared)', 'sandwich'], [E.boat + 6, '+1 Leaf Boat', 'flower'], [E.hug + 2, '+1 Best Friend (enormous)', 'shard']];")
rline("const FEATS = ", "const FEATS = [[E.zap + 4, 'Pocket Size', 'Get shrunk by your own ray'], [E.ride + 3, 'Bug Rider', 'Ride a Dotbeetle'], [E.splash + 3, 'Muffin Tsunami', 'Survive a cupcake wave'], [E.stomp + 2, 'Wrong Guy', 'Zap the wrong target. Twice.']];")
rblock("const POPS = [", """const POPS = [[E.ray + 0.4, 1.6, 'TA-DA!', 0.5, 0.3, '#ffe066', 90], [E.zap, 1.2, 'ZAP', 0.6, 0.3, '#7cff6b', 100], [E.zap + 0.3, 1.2, 'PING!', 0.3, 0.3, '#ffffff', 80], [E.zap + 1.6, 1.6, 'fwoomp', 0.5, 0.6, '#7cff6b', 70],
  [E.tiny + 2, 1.6, 'we\\'re TINY', 0.5, 0.3, '#ffffff', 70], [E.bug, 1.6, 'skitter skitter', 0.3, 0.35, '#2ec4b6', 60], [E.bug + 4, 1.4, 'EEEE!', 0.6, 0.35, '#5ff7ff', 80], [E.snack + 3, 1.4, 'crunch', 0.3, 0.5, '#e6b06a', 64],
  [E.snack + 6, 1.4, 'chirp!', 0.3, 0.4, '#ffe066', 70], [E.ride, 1.6, 'GIDDY-UP', 0.5, 0.3, '#ffe066', 90], [E.splash, 1.8, 'KA-SPLOOSH', 0.5, 0.3, '#9fd0ff', 100], [E.face, 1.6, 'sniff sniff', 0.5, 0.3, '#d8c0ff', 80], [E.face + 6, 1.6, 'SHLURP?', 0.5, 0.3, '#ff9ad8', 96],
  [E.face + 13, 1.4, 'bzzzzz!', 0.5, 0.3, '#ffffff', 80], [E.lever, 1.4, 'CLUNK', 0.5, 0.4, '#ffffff', 80], [E.grow, 1.4, 'ZAP', 0.5, 0.3, '#ff5cf0', 100], [E.bigbug + 0.6, 1.6, 'boing?', 0.5, 0.3, '#2ec4b6', 80], [E.hug, 1.4, 'squeeeze', 0.5, 0.35, '#ff9ad8', 80],
  [E.zap2, 1.2, 'ZAP', 0.6, 0.3, '#ff5cf0', 100], [E.zap2 + 0.3, 1.2, 'PING!', 0.5, 0.25, '#ffffff', 80], [E.zap2 + 2, 1.6, '...uh oh', 0.5, 0.35, '#ffffff', 70], [E.stomp, 1.8, 'BOOM', 0.5, 0.3, '#ffb43a', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.zap + 0.3, 1.0, 1.15, 0.5, 0.5], [E.bug, 0.8, 1.15, 0.5, 0.5], [E.splash, 0.8, 1.15, 0.5, 0.4], [E.zap2 + 2, 1.0, 1.2, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.zap, 1.4, 0.15], [E.splash - 1, 4, 0.12], [E.face, 2, 0.1], [E.grow, 1.4, 0.2], [E.zap2 + 3.4, 8, 0.08], [E.stomp, 1.4, 0.45], [E.stomp + 4, 0.6, 0.2], [E.stomp + 6, 0.6, 0.2]];")
rline("const FLASH = ", "const FLASH = [[E.zap + 1.2, 0.3, '200,255,200'], [E.tiny, 0.3, '255,255,255'], [E.grow + 0.4, 0.4, '255,200,255'], [E.home, 0.3, '255,255,255'], [E.zap2 + 1.2, 0.3, '255,200,255']];")
rep("outlined('EPISODE 17', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TIME MACHINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bloop built it. uh oh.)'",
    "outlined('EPISODE 18', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SHRINK RAY', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we\\'re tiny now)'")
rep("outlined(i ? 'EP 18: THE SHRINK RAY' : 'EP 16: IT WORKED?!', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we\\'re tiny now)' : '(nothing goes wrong. seriously.)', x + 110, y + 80, i ? 14 : 12",
    "outlined(i ? 'EP 19: THE TREASURE MAP' : 'EP 17: THE TIME MACHINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(X marks the wrong spot)' : '(Bloop built it. uh oh.)', x + 110, y + 80, 14")
rep("outlined('yep. it followed us home.', 0, 0, 52", "outlined('yep. it hit the wrong guy.', 0, 0, 52")
rep("\"that's me. slimed.\"", "\"that's me. bug hug.\"")
rep("'(the time machine is a pancake now)'", "'(Muffin is the biggest now)'")
rline("const SECS = ", "const SECS = [[0, E.tiny, yard, 'yard'], [E.tiny, E.home, tiny, 'tiny'], [E.home, 1e9, yard, 'yard']];")
rline("const panic = ", "  const panic = win(T, E.zap, E.zap + 4) || win(T, E.bug, E.bug + 6) || win(T, E.splash, E.shore) || win(T, E.stomp, E.freeze);")
rep("if (win(T, E.repair + 2, E.egg - 2)) { const bl", "if (win(T, E.boat, E.sail)) { const bl")
rep("""    stamp(T, E.swallow + 1, 'STUCK IN 1,000,000 BC');
    stamp(T, E.crunch + 1, 'TIME MACHINE: FLAT');
    drawWarp(T);""", """    stamp(T, E.zap + 3.6, 'SIZE: 1%');
    stamp(T, E.zap2 + 3.6, 'MUFFIN: 800%');""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
