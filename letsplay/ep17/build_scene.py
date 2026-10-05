# ep17 scene.js = ep16 head minus its bridge body + body17 + ep16 compositor tail; every replacement must match once
src = open('../ep16/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 16: "IT WORKED?!"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body17.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const morning = {", "return mix(sunset, eve, seg(t, E.sunsetCalm + 10, 290));", """  const prehist = { top: '#8ab0a8', bot: '#ffd8a0', sunI: 2.2, hemiI: 1.3, fog: '#d8c49a', sunEl: 0.7, sunAz: 1.4, near: 40, far: 160 };
  if (t < E.jungle) return day; if (t < E.home) return prehist; return mix(sunset, eve, seg(t, E.home + 30, 292));""")
rep("(win(t, E.storm, E.rainbow) || win(t, E.pebble + 3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.chomp, E.fetch) || win(t, E.crunch, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.lick ? 5 : t < E.install ? 4 : t < E.lick2 ? 5 : 3.5;")
rep("'☀ DAY 16'", "(t > E.jungle && t < E.home ? '◷ DAY -365,000,000' : '☀ DAY 17')")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', t > E.install && t < E.crunch || t < E.swallow ? 1 : 0], ['plank', 3], ['log', t > E.fetch && t < E.fetch + 1 ? 0 : 1], ['glass', 0]];")
cut("  // Doom-o-meter (hero paranoia)", "'DAYS W/O DISASTER: '", """  // Time Booth readout — this episode's mechanic
  if (t > E.unveil + 2 && t < E.freeze) { const y = yearAt(t), fx = fluxAt(t); rrect(22, 96, 220, 100, 12); ctx.fillStyle = 'rgba(8,16,30,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5ff7ff'; ctx.stroke();
    outlined('TIME BOOTH', 132, 114, 15, '#5ff7ff', '#000', 3); outlined('YEAR: ' + y, 132, 142, y.length > 10 ? 15 : 18, '#ffffff', '#000', 4);
    outlined('FLUX CRYSTAL: ' + fx, 132, 174, 13, fx === 'OK' ? '#7cff6b' : '#ff6b6b', '#000', 3); }""")
rline("const TOASTS = ", "const TOASTS = [[E.unveil + 3, '+1 Time Booth', 'castle'], [E.fetchEnd - 1, '-1 Stick (eaten)', 'log'], [E.swallow + 1, '-1 Flux Crystal', 'shard'], [E.bonk + 2, '+1 Flux Crystal (slimy)', 'shard'], [E.invoice + 1, '+1 Invoice (time travel)', 'glass']];")
rline("const FEATS = ", "const FEATS = [[E.warp + 6, 'Time Tourist', 'Visit one million BC'], [E.lick + 1, 'Taste Test', 'Get licked by a dinosaur'], [E.hatch + 2, 'Mama Leggy', 'Hatch a Chompodon'], [E.crunch + 2, 'Paradox', 'Your time machine is a pancake']];")
rblock("const POPS = [", """const POPS = [[E.unveil + 0.4, 1.6, 'TA-DA!', 0.5, 0.3, '#ffe066', 90], [E.bump, 1.2, 'bonk', 0.5, 0.45, '#ffffff', 70], [E.bump + 0.8, 1.6, 'click... click... click', 0.5, 0.3, '#5ff7ff', 52], [E.lever + 0.4, 1.4, 'KA-CHUNK', 0.5, 0.35, '#ffffff', 80],
  [E.steps, 1.2, 'THOOM', 0.5, 0.3, '#ffffff', 80], [E.steps + 2.8, 1.2, 'THOOM', 0.5, 0.3, '#ffffff', 90], [E.chomp, 1.8, 'RAWR?', 0.5, 0.25, '#d8c0ff', 110], [E.lick + 0.6, 1.6, 'SHLURP', 0.5, 0.35, '#ff9ad8', 96],
  [E.fetch + 1, 1.4, 'FETCH!', 0.5, 0.3, '#ffe066', 84], [E.swallow, 1.6, 'GULP.', 0.5, 0.3, '#ffffff', 100], [E.hatch, 1.6, 'crack!', 0.4, 0.4, '#f4ecd8', 80], [E.hatch + 1.6, 1.4, 'mama?', 0.4, 0.4, '#ff9ad8', 70],
  [E.tickle + 2, 1.2, 'hehe', 0.5, 0.3, '#d8c0ff', 64], [E.tickleEnd - 3, 1.6, 'SHLURP', 0.5, 0.35, '#ff9ad8', 90], [E.sneeze - 1.4, 1.2, 'ah... ahh...', 0.5, 0.25, '#ffffff', 70], [E.sneeze, 1.6, 'AH-CHOOMP!', 0.5, 0.25, '#ffe066', 110],
  [E.bonk, 1.2, 'BONK', 0.5, 0.45, '#ffe066', 90], [E.bye + 7, 1.4, 'sniff', 0.4, 0.4, '#5ff7ff', 60], [E.stow + 2, 1.6, 'mama!', 0.5, 0.45, '#ff9ad8', 80], [E.eat1 + 1.2, 1.4, 'CHOMP', 0.6, 0.35, '#ffe066', 90],
  [E.eat2 + 1.2, 1.4, 'CHOMP', 0.4, 0.35, '#ffe066', 90], [E.huge, 1.6, 'it\\'s... bigger', 0.5, 0.25, '#ffffff', 64], [E.yawn, 1.6, 'YAAAWN', 0.5, 0.25, '#d8c0ff', 96], [E.crunch, 1.8, 'CRUNCH.', 0.5, 0.3, '#ffffff', 110], [E.lick2 + 0.4, 1.6, 'SHLURP', 0.5, 0.35, '#ff9ad8', 96]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.bump + 0.8, 1.0, 1.2, 0.5, 0.35], [E.chomp, 1.0, 1.2, 0.5, 0.4], [E.swallow, 0.8, 1.15, 0.5, 0.4], [E.crunch, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.steps, 0.5, 0.2], [E.steps + 1.4, 0.5, 0.25], [E.steps + 2.8, 0.5, 0.3], [E.steps + 4.2, 0.5, 0.35], [E.chomp, 1.4, 0.3], [E.fetch + 3, 6, 0.06], [E.sneeze, 0.8, 0.3], [E.rumble, 6, 0.06], [E.crunch, 1.2, 0.45]];")
rline("const FLASH = ", "const FLASH = [[E.lever + 1, 0.3, '255,255,255'], [E.depart, 0.3, '255,255,255'], [E.home, 0.4, '255,255,255']];")
rep("outlined('EPISODE 16', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('IT WORKED?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(nothing goes wrong. seriously.)'",
    "outlined('EPISODE 17', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TIME MACHINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bloop built it. uh oh.)'")
rep("outlined(i ? 'EP 17: THE TIME MACHINE' : 'EP 15: THE TALENT SHOW', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Bloop built it. uh oh.)' : '(Bonk-bot can\\'t dance)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 18: THE SHRINK RAY' : 'EP 16: IT WORKED?!', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we\\'re tiny now)' : '(nothing goes wrong. seriously.)', x + 110, y + 80, i ? 14 : 12")
rep("outlined('yep. it... worked?', 0, 0, 56", "outlined('yep. it followed us home.', 0, 0, 52")
rep("\"that's me. still screaming.\"", "\"that's me. slimed.\"")
rep("'(it was one pebble)'", "'(the time machine is a pancake now)'")
rline("const SECS = ", "const SECS = [[0, E.jungle, yard, 'yard'], [E.jungle, E.home, jungle, 'jungle'], [E.home, 1e9, yard, 'yard']];")
rline("const panic = ", "  const panic = win(T, E.chomp, E.lick + 2) || win(T, E.swallow, E.stuck + 4) || win(T, E.crunch, E.freeze);")
rep("if (win(T, E.build, E.buildEnd)) { const bl", "if (win(T, E.repair + 2, E.egg - 2)) { const bl")
rep("""    stamp(T, E.approve + 0.6, 'APPROVED');
    stamp(T, E.pay + 0.6, 'PAID');
    drawMemories(T);""", """    stamp(T, E.swallow + 1, 'STUCK IN 1,000,000 BC');
    stamp(T, E.crunch + 1, 'TIME MACHINE: FLAT');
    drawWarp(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
