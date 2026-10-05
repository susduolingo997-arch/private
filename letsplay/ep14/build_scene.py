# ep14 scene.js = ep13 head minus its race prelude (shared cast/props of ep6-13) + body14 + ep13 compositor tail; every replacement must match once
src = open('../ep13/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 13: "THE GRAND RACE"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body14.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[11.0, 'Flawless start. Obviously.']", "]];", """  const Q = [[11.0, 'GHOST HUNT. LIVE. Spooky!'], [22.4, 'Ten million views. Easy.'], [46.0, 'Cowards. All of them.'], [112.0, 'Hehehe. Gotcha.'], [128.6, 'That was... a TEST.'], [211.0, 'Real ghost. Real views.'], [218.2, 'AAAAAAAAAAAAH!'], [237.4, 'I meant to do that.'], [262.4, 'Can someone get me out?']];""")
cut("  const haze = {", "return mix(day, sunset, ss(seg(t, 240, 285)));", """  const nightS = { top: '#070b22', bot: '#1f2350', sunI: 0.45, hemiI: 0.8, fog: '#141838', sunEl: 0.45, sunAz: -2.0, near: 40, far: 170 };
  return nightS;""")
rep("(t > E.boost && t < E.crash) ? Math.sin(t * 40 + i) * 2 : 0", "(t > E.roar && t < E.cartRide + 6) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.sheet ? 5 : t < E.reveal ? 3.5 : t < E.roar ? 4.5 : 5;")
rep("const night = false;\n  rrect(W / 2 - 70", "const night = true;\n  rrect(W / 2 - 70")
rep("'☀ DAY 13'", "'☾ DAY 14'")
rep("  const night = false;\n  const sv", "  const night = true;\n  const sv")
rep("night && t > 194;", "night;")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['jam', 0], ['glass', 0], ['plank', 0]];")
cut("  // race standings + track map", "ctx.fill(); }); }", """  // Ghost-o-meter (Bloop's detector) — this episode's mechanic
  if (t > E.detEnd - 4 && t < E.sign2) { const v = clamp(ghostV(t), 0, 1), lab = ghostL(t); rrect(22, 196, 220, 92, 12); ctx.fillStyle = 'rgba(10,14,30,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#7cff6b'; ctx.stroke();
    outlined('GHOST-O-METER', 132, 214, 15, '#7cff6b', '#000', 3); const gx = 40, gw = 184; rrect(gx, 232, gw, 16, 8); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    const gr = ctx.createLinearGradient(gx, 0, gx + gw, 0); gr.addColorStop(0, '#7cff6b'); gr.addColorStop(0.5, '#ffe066'); gr.addColorStop(1, '#ff4a4a'); rrect(gx, 232, gw * v, 16, 8); ctx.fillStyle = gr; ctx.fill();
    outlined(lab || (v > 0.85 ? 'GHOST!!' : v > 0.5 ? 'spooky...' : 'no ghost'), 132, 270, lab ? 20 : 16, lab ? '#ffe066' : (v > 0.85 ? '#ff6b6b' : '#ffffff'), '#000', 4); }""")
rline("const TOASTS = ", "const TOASTS = [[E.detEnd - 2, '+1 Ghost-o-meter', 'plank'], [E.mothsOk + 6, '+1 Lantern Moth (released)', 'flower'], [E.reveal + 3, '+1 Bedsheet', 'glass'], [E.cavern + 4, '+3 Glow Crystal', 'shard'], [E.sign2 + 4, '+1 Sign (fixed)', 'plank']];")
rline("const FEATS = ", "const FEATS = [[E.mothsOk + 1, 'Not a Ghost', 'Meet the lantern moths'], [E.reveal + 1, 'Unmasked', 'Expose a bedsheet goose'], [E.wake + 3, 'Grandma!', 'Wake a Grandma Pebble'], [E.crashOut + 3, 'Bush League', 'Watch Prestin land in a bush']];")
rblock("const POPS = [", """const POPS = [[11.6, 1.6, 'ooOOOooo', 0.5, 0.3, '#c8d4ff', 70], [E.cart + 0.4, 1.4, 'creeeak', 0.6, 0.4, '#ffffff', 56], [E.moths + 1, 1.2, '!?', 0.5, 0.3, '#ffe066', 90],
  [E.sheet, 1.8, 'BOOOOO!', 0.5, 0.3, '#ffffff', 110], [E.run, 1.4, 'RUN!!', 0.5, 0.35, '#ff6b6b', 90], [E.grab, 1.2, 'CHOMP', 0.5, 0.4, '#ff9ad8', 76], [E.reveal, 1.6, 'HONK.', 0.55, 0.3, '#ffe066', 96],
  [E.moan2 + 0.2, 1.6, 'ooOOOooo', 0.5, 0.3, '#c8d4ff', 70], [E.grandma + 6, 1.6, 'zzzZZZ', 0.6, 0.3, '#c8d4ff', 70], [E.wake, 1.2, '...!', 0.5, 0.3, '#ffffff', 80], [E.roar, 1.8, 'YAAAWN', 0.5, 0.3, '#ffe066', 100],
  [E.roar + 1.2, 1.6, 'AAAAAH!', 0.5, 0.55, '#ff6b6b', 86], [E.crashOut + 1.4, 1.4, 'FWUMP', 0.5, 0.35, '#7cff6b', 80], [E.sign2 + 6.4, 1.2, 'ding dong', 0.4, 0.3, '#ffe066', 60]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.sheet, 0.8, 1.2, 0.5, 0.5], [E.reveal, 0.8, 1.15, 0.5, 0.5], [E.wake, 1.0, 1.2, 0.5, 0.5], [E.roar, 0.8, 1.2, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.sheet, 1.2, 0.25], [E.run, 3, 0.08], [E.roar, 2.4, 0.35], [E.cartRide, 9, 0.08], [E.crashOut + 1.4, 0.8, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.sheet, 0.2, '255,255,255'], [E.roar, 0.2, '255,255,255']];")
rep("outlined('EPISODE 13', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE GRAND RACE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(six legs vs. wheels)'",
    "outlined('EPISODE 14', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE HAUNTED MINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it\\'s not haunted)'")
rep("outlined(i ? 'EP 14: THE HAUNTED MINE' : 'EP 12: THE BIRTHDAY', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it\\'s not haunted)' : '(it exploded)'",
    "outlined(i ? 'EP 15: THE TALENT SHOW' : 'EP 13: THE GRAND RACE', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(Bonk-bot can\\'t dance)' : '(six legs vs. wheels)'")
rep("outlined('yep. the cupcake won.', 0, 0, 60", "outlined('yep. it was grandma.', 0, 0, 60")
rep("\"that's me. second place.\"", "\"that's me. very brave.\"")
rep("'(Muffin is undefeated)'", "'(the goose was the ghost)'")
rline("const SECS = ", "const SECS = [[0, E.enter, mineOut, 'mineOut'], [E.enter, E.outside, mine, 'mine'], [E.outside, 1e9, mineOut, 'mineOut']];")
rline("const panic = ", "  const panic = win(T, E.sheet, 119) || win(T, E.roar, E.cartRide + 4);")
rep("if (win(T, E.kart, E.kartEnd)) { const bl", "if (win(T, E.detector, E.detEnd)) { const bl")
cut("    if (win(T, E.photo, E.photoEnd))", "stamp(T, E.podium + 0.6, 'MUFFIN: CHAMPION');", """    stamp(T, E.reveal + 0.6, 'GHOST: GOOSE');
    stamp(T, E.babyIn + 4.6, 'GHOST: GRANDMA');""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
