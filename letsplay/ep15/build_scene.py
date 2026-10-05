# ep15 scene.js = ep14 head minus its haunted-mine body + body15 + ep14 compositor tail; every replacement must match once
src = open('../ep14/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 14: "THE HAUNTED MINE"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body15.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[11.0, 'GHOST HUNT. LIVE. Spooky!']", "]];", """  const Q = [[70.6, 'Prepare to be AMAZED.'], [76.0, 'No hair? No problem.'], [82.0, 'Behold... THE HAIR.']];""")
cut("  const nightS = {", "return nightS;", """  const night2 = { top: '#0d1030', bot: '#2a2a5a', sunI: 0.5, hemiI: 0.9, fog: '#1a1c40', sunEl: -0.1, sunAz: 2.6, near: 50, far: 180 };
  if (t < E.arrive) return day; if (t < 100) return mix(sunset, eve, seg(t, E.arrive, 100)); return mix(eve, night2, seg(t, 100, 130));""")
rep("(t > E.roar && t < E.cartRide + 6) ? Math.sin(t * 40 + i) * 2 : 0", "(t > E.turbo && t < E.dark) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.turbo ? 5 : t < E.dark ? 3.5 : t < E.collapse ? 5 : 2.5;")
rep("const night = true;\n  rrect(W / 2 - 70", "const night = t > 120;\n  rrect(W / 2 - 70")
rep("'☾ DAY 14'", "(night ? '☾' : '☀') + ' DAY 15'")
rep("  const night = true;\n  const sv", "  const night = t > 120;\n  const sv")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['plank', 3], ['bomb', t > E.botStop + 5 ? 1 : 0], ['glass', 0]];")
cut("  // Ghost-o-meter (Bloop's detector)", "'spooky...'", """  // Applause-o-meter — this episode's mechanic
  if (t > E.arrive + 4 && t < E.trophy) { const v = clamp(applause(t), 0, 1), lab = appL(t); rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(30,10,30,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5cf0'; ctx.stroke();
    outlined('APPLAUSE-O-METER', 132, 114, 15, '#ff5cf0', '#000', 3); const gx = 40, gw = 184; rrect(gx, 132, gw, 16, 8); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    const gr = ctx.createLinearGradient(gx, 0, gx + gw, 0); gr.addColorStop(0, '#5ff7ff'); gr.addColorStop(0.5, '#ffe066'); gr.addColorStop(1, '#ff5cf0'); rrect(gx, 132, Math.max(8, gw * v), 16, 8); ctx.fillStyle = gr; ctx.fill();
    outlined(lab || (v > 0.9 ? 'STANDING OVATION' : v > 0.6 ? 'woo!' : v > 0.3 ? 'polite clapping' : v > 0.08 ? '*cough*' : 'crickets'), 132, 170, lab ? 19 : 16, lab ? '#ff6b6b' : (v > 0.9 ? '#ffe066' : '#ffffff'), '#000', 4); }""")
cut("  // viewer duel (collab edition)", "outlined('PRESTIN', 36, 164", "")
rline("const TOASTS = ", "const TOASTS = [[E.chipEnd - 1.5, '+1 Groove Chip', 'shard'], [E.botStop + 5, '+1 Groove Chip (fried)', 'bomb'], [E.trophy + 3, '+1 Golden Mallet (Leggy\\'s)', 'mallet'], [E.sorry + 4, '+1 Star (not crew)', 'flower']];")
rline("const FEATS = ", "const FEATS = [[E.chipOn + 1, 'It Dances!', 'For one (1) second'], [E.sitAct + 6, 'Sit Happens', 'Lose to a Grumble who just sits'], [E.launch + 2, 'Mosh Pit', 'Launch a robot into the crowd'], [E.score10 + 2, 'Six Left Feet', 'Leggy wins the talent show']];")
rblock("const POPS = [", """const POPS = [[E.rehearse + 1, 1.4, 'whirr?', 0.5, 0.3, '#ffffff', 64], [E.fall1 + 0.4, 1.6, 'CLANG', 0.5, 0.45, '#ff6b6b', 100], [E.leggyTap - 3, 1.4, 'tikka tikka', 0.3, 0.4, '#5ff7ff', 60],
  [E.chipOn + 1, 1.6, 'TA-DA!', 0.5, 0.3, '#ffe066', 96], [E.judge + 1, 1.4, 'CLACK CLACK', 0.5, 0.25, '#ff9ad8', 70], [E.wig + 0.4, 1.8, 'TA-DAAA!', 0.5, 0.25, '#ffe066', 96], [E.sitAct + 2, 1.6, '...', 0.5, 0.35, '#ffffff', 90],
  [E.sitAct + 4.2, 1.6, 'BRAVO!!', 0.5, 0.25, '#ff5cf0', 100], [E.dance + 1, 1.4, 'beep boop', 0.5, 0.25, '#7cff6b', 70], [E.hot + 1, 1.4, 'sizzle', 0.5, 0.25, '#ffb43a', 70], [E.turbo, 1.8, 'TURBO MODE', 0.5, 0.3, '#ff6b6b', 92],
  [E.launch, 1.6, 'WHEEE', 0.5, 0.3, '#ffe066', 100], [E.dark, 1.6, 'pop.', 0.5, 0.4, '#ffffff', 80], [E.tap + 1, 1.4, 'tap tap tap', 0.32, 0.4, '#5ff7ff', 64], [E.tap + 9, 1.4, 'TAPPITY', 0.68, 0.38, '#5ff7ff', 70],
  [E.botStop + 5, 1.6, 'warranty: void', 0.5, 0.3, '#ff9a2a', 64], [E.wig2 + 0.6, 1.4, 'plop.', 0.5, 0.4, '#ffe066', 80], [E.reboot + 0.4, 1.8, 'ENCORE MODE', 0.5, 0.3, '#ff6b6b', 86], [E.collapse - 2, 1.4, 'CRACK', 0.6, 0.35, '#ffffff', 90],
  [E.collapse + 1.4, 1.8, 'KA-THOOM', 0.5, 0.3, '#ffb43a', 110], [E.collapse + 3.3, 1.4, 'BONK', 0.5, 0.5, '#ffe066', 90]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.fall1, 0.8, 1.15, 0.5, 0.5], [E.wig, 1.0, 1.15, 0.5, 0.4], [E.sitAct + 4, 0.8, 1.2, 0.5, 0.5], [E.turbo, 0.8, 1.2, 0.5, 0.5], [E.collapse + 3.3, 0.8, 1.15, 0.5, 0.6]];")
rline("const SHAKES = ", "const SHAKES = [[E.fall1 + 0.4, 0.6, 0.2], [E.turbo, 8, 0.08], [E.launch, 1.2, 0.3], [E.launch + 2, 18, 0.06], [E.collapse - 2, 0.6, 0.15], [E.collapse + 1.2, 1.6, 0.45], [E.collapse + 3.3, 0.5, 0.2]];")
rline("const FLASH = ", "const FLASH = [[E.launch, 0.2, '255,255,255'], [E.dark, 0.3, '0,0,0'], [E.leggyOn, 0.25, '255,255,255'], [E.collapse + 1.4, 0.2, '255,255,255']];")
rep("outlined('EPISODE 14', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE HAUNTED MINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it\\'s not haunted)'",
    "outlined('EPISODE 15', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TALENT SHOW', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bonk-bot can\\'t dance)'")
rep("outlined(i ? 'EP 15: THE TALENT SHOW' : 'EP 13: THE GRAND RACE', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(Bonk-bot can\\'t dance)' : '(six legs vs. wheels)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 16: IT WORKED?!' : 'EP 14: THE HAUNTED MINE', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(nothing goes wrong. seriously.)' : '(it\\'s not haunted)', x + 110, y + 80, i ? 12 : 14")
rep("ctx.translate(W * 0.34, H * 0.22); ctx.rotate(-0.08); outlined('yep. it was grandma.', 0, 0, 60", "ctx.translate(W * 0.4, H * 0.22); ctx.rotate(-0.06); outlined('yep. it brought the house down.', 0, 0, 44")
rep("\"that's me. very brave.\"", "\"that's me. the manager.\"")
rep("'(the goose was the ghost)'", "'(Leggy won. obviously.)'")
rline("const SECS = ", "const SECS = [[0, E.arrive, farm, 'farm'], [E.arrive, 1e9, stage, 'stage']];")
rline("const panic = ", "  const panic = win(T, E.turbo, E.dark) || win(T, E.collapse - 2, E.freeze);")
rep("if (win(T, E.detector, E.detEnd)) { const bl", "if (win(T, E.chip, E.chipEnd)) { const bl")
rep("""    stamp(T, E.reveal + 0.6, 'GHOST: GOOSE');
    stamp(T, E.babyIn + 4.6, 'GHOST: GRANDMA');""", """    stamp(T, E.score7 + 0.6, 'SCORE: 7');
    stamp(T, E.sitAct + 5, 'SITTING: 10/10');
    stamp(T, E.score10 + 0.6, 'LEGGY: 10/10');""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
