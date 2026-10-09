# ep26 scene.js = ep25 head (incl. ep21-25 helpers) minus ep25's sets + body26 + ep25 compositor tail; every replacement must match once
src = open('../ep25/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 25: "THE SNOW GLOBE')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body26.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const autumn = {", "return mix(snowy, { ...snowy, near: 6, far: 40, fog: '#ffffff' }, seg(t, E.tooMuch, E.freeze));", """  const muDay = { top: '#5db8ff', bot: '#e4f4ff', sunI: 2.6, hemiI: 1.5, fog: '#d8ecff', sunEl: 0.8, sunAz: 0.5, near: 70, far: 220 };
  const hallD = { top: '#e8dcc0', bot: '#f4ecd8', sunI: 1.5, hemiI: 1.7, fog: '#e8dcc4', sunEl: 0.9, sunAz: 0.6, near: 40, far: 120 };
  const hallN = { top: '#0a1030', bot: '#18224a', sunI: 0.6, hemiI: 0.7, fog: '#0c1430', sunEl: 0.7, sunAz: 2.4, near: 30, far: 90 };
  const hallDawn = { top: '#ffb070', bot: '#ffe0b0', sunI: 2.0, hemiI: 1.3, fog: '#f0c8a0', sunEl: 0.25, sunAz: -1.2, near: 40, far: 120 };
  const morning = { top: '#7ab8f0', bot: '#ffe0c0', sunI: 2.3, hemiI: 1.4, fog: '#f0d8c0', sunEl: 0.3, sunAz: -1.0, near: 60, far: 200 };
  if (t < E.muEnter) return muDay; if (t >= E.muRunOut) return morning; if (t < E.muShut + 2.4) return hallD; if (t < E.muDawn) return hallN;
  return mix(mix(hallN, hallDawn, seg(t, E.muDawn, E.muDawn + 4)), hallD, seg(t, E.muInspect + 6, E.muStatue + 10) * 0.6);""")
rep("(win(t, E.quake1, E.quake1 + 6) || win(t, E.quake2, E.house + 2) || win(t, E.melt, E.snowOn) || win(t, E.tooMuch + 6, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.muPress, E.muLocked) || win(t, E.muWake, E.muCorner) || win(t, E.muMess, E.muFix) || win(t, E.muSneeze, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.muWake ? 5 : t < E.muSmash ? 4 : t < E.muFetch ? 3 : t < E.muSneeze ? 4 : 2;")
rep("outlined((t >= E.inside && t < E.drill) || (t >= E.quake2 && t < E.outside) ? '❄ DAY 25 (tiny)' : '☀ DAY 25', W / 2, 32, 18,", "outlined(t >= E.muShut + 2.4 && t < E.muDawn ? '☾ NIGHT 26' : '☀ DAY 26', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['ticket', t > E.muCurator + 3 ? 1 : 0], ['lantern', win(t, E.muLocked + 1, E.muDawn) ? 1 : 0], ['bone', win(t, E.muFetch + 4, E.muThrow) ? 1 : 0], ['glue', win(t, E.muFix + 1, E.muLull) ? 3 : 0]];")
rep("  // size / snow depth — this episode's mechanic\n  drawGlobeHUD(t);", "  // things touched (allowed: 0) — this episode's mechanic\n  drawMuseumHUD(t);")
rline("const TOASTS = ", """ICON.bone = (x, y, s) => { ctx.fillStyle = '#efe6cc'; ctx.fillRect(x - s * 0.7, y - s * 0.15, s * 1.4, s * 0.3); for (const dx of [-0.7, 0.7]) for (const dy of [-0.25, 0.25]) { ctx.beginPath(); ctx.arc(x + dx * s, y + dy * s, s * 0.22, 0, 7); ctx.fill(); } };
ICON.glue = (x, y, s) => { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - s * 0.35, y - s * 0.4, s * 0.7, s * 1.0); ctx.fillStyle = '#e8344e'; ctx.fillRect(x - s * 0.15, y - s * 0.75, s * 0.3, s * 0.35); ctx.fillStyle = '#3d7bff'; ctx.fillRect(x - s * 0.35, y - s * 0.1, s * 0.7, s * 0.25); };
const TOASTS = [[E.muCurator + 3, '+1 Museum Ticket', 'ticket'], [E.muLocked + 1, '+1 Lantern', 'lantern'], [E.muFetch + 4, '+1 Spare Bone (?)', 'bone'], [E.muFix + 1, '+3 Super Glue', 'glue']];""")
rline("const FEATS = ", "const FEATS = [[E.muPress + 1, 'Closing Time', 'Press the button you were told not to'], [E.muWake + 6, 'Night Shift', 'Wake up a fossil'], [E.muFetch + 9, 'Good Boy', 'Play fetch with a dinosaur'], [E.muAccept + 2, 'Modern Art', 'Get Bloop into a museum']];")
rblock("const POPS = [", """const POPS = [[E.muArrive + 1, 1.6, 'GRAND OPENING!', 0.5, 0.3, '#ffe066', 70], [E.muCurator + 1, 1.6, 'HOO GOES THERE', 0.5, 0.3, '#ffffff', 64], [E.muShake + 0.8, 1.6, 'NO HANDSHAKES', 0.55, 0.3, '#ff6b6b', 70], [E.muPitch + 2, 1.4, 'ta-daa!', 0.62, 0.4, '#7cff6b', 70],
  [E.muReject, 1.8, 'REJECTED', 0.5, 0.32, '#e8344e', 110], [E.muLeggyLook + 1, 1.8, 'six legs?!', 0.4, 0.35, '#5ff7ff', 70], [E.muVase + 1.4, 1.4, 'AH-', 0.5, 0.35, '#ffffff', 80], [E.muVase + 1.8, 1.4, 'CHOO', 0.5, 0.35, '#ffffff', 110], [E.muVase + 2.8, 1.4, 'wobble', 0.45, 0.45, '#5ff7ff', 70],
  [E.muPaint + 1.4, 1.4, 'spinnn', 0.55, 0.3, '#ffe066', 80], [E.muPaint + 3.4, 1.8, '...', 0.4, 0.35, '#ffffff', 110], [E.muButton + 2, 1.6, 'do not press', 0.5, 0.3, '#ff6b6b', 60], [E.muPress, 1.4, 'BOOP', 0.42, 0.45, '#ff6b6b', 110], [E.muShut, 1.6, 'KA-CHUNK', 0.5, 0.35, '#ffffff', 100],
  [E.muCreep + 0.6, 1.4, 'AAAH', 0.5, 0.3, '#ffffff', 100], [E.muSneak + 5.6, 1.4, 'perfect.', 0.4, 0.35, '#7cff6b', 70], [E.muToe + 2.2, 1.4, 'boop', 0.5, 0.4, '#5ff7ff', 90], [E.muWake + 0.5, 1.6, 'rattle rattle', 0.5, 0.3, '#efe6cc', 70], [E.muRoar, 1.8, 'SKREEEONK', 0.5, 0.25, '#ff3a2a', 110],
  [E.muChase + 2, 1.4, 'RUN', 0.5, 0.3, '#ff6b6b', 110], [E.muSmash, 1.4, 'KSSSH', 0.55, 0.4, '#3d6bd0', 110], [E.muFetch + 1, 1.6, 'wag wag wag', 0.5, 0.35, '#7cff6b', 80], [E.muFetch + 3.2, 1.6, '...is he a puppy?', 0.5, 0.3, '#ffffff', 64], [E.muThrow + 0.4, 1.4, 'FETCH!', 0.45, 0.3, '#5ff7ff', 100],
  [E.muMess, 1.6, 'ZOOMIES', 0.5, 0.3, '#ffe066', 110], [E.muMess + 2, 1.4, 'CLONK', 0.7, 0.35, '#ffffff', 90], [E.muLull + 1, 2, 'la la laaa', 0.55, 0.35, '#5ff7ff', 70], [E.muLull + 8, 1.6, 'curl.', 0.5, 0.35, '#efe6cc', 80],
  [E.muSnore, 1.6, 'ZZZNORK', 0.5, 0.3, '#efe6cc', 90], [E.muSnore + 4, 1.4, 'zzz', 0.5, 0.3, '#efe6cc', 80], [E.muSnore + 8, 1.6, 'ZZZNORK', 0.5, 0.3, '#efe6cc', 90], [E.muInspect + 7, 1.8, 'a bold restoration!', 0.5, 0.3, '#ffe066', 64], [E.muInspect + 13, 1.8, 'MAGNIFICENT', 0.5, 0.3, '#ffe066', 80],
  [E.muInspect + 19.5, 1.8, 'how... modern', 0.5, 0.3, '#ffe066', 70], [E.muStatue + 3, 1.6, 'who made THIS?', 0.5, 0.3, '#ffffff', 64], [E.muAccept, 1.8, 'ACCEPTED!', 0.5, 0.3, '#7cff6b', 120], [E.muRelief + 2, 1.6, 'phew.', 0.5, 0.35, '#ffffff', 80],
  [E.muSign + 0.3, 1.2, 'tip', 0.5, 0.45, '#ffe066', 80], [E.muSign + 2, 1.0, 'clack', 0.45, 0.45, '#ffe066', 70], [E.muSign + 3.4, 1.0, 'clack', 0.5, 0.45, '#ffe066', 70], [E.muSign + 4.8, 1.0, 'clack', 0.55, 0.45, '#ffe066', 70], [E.muSign + 6.6, 1.4, 'BONK', 0.5, 0.4, '#ffffff', 100],
  [E.muWake2 + 2.4, 1.4, 'ah... ah...', 0.5, 0.3, '#efe6cc', 80], [E.muSneeze, 1.8, 'AH-CHOOOO', 0.5, 0.3, '#ffffff', 120], [E.muSneeze + 2, 1.4, 'clonk', 0.4, 0.3, '#efe6cc', 90], [E.muReass + 3, 1.6, 'new head!', 0.5, 0.3, '#7cff6b', 80], [E.muRunOut + 1, 1.6, 'WALKIES', 0.4, 0.3, '#ffe066', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.muReject, 1.0, 1.12, 0.5, 0.5], [E.muPaint + 3.2, 1.0, 1.15, 0.5, 0.5], [E.muRoar, 0.8, 1.15, 0.5, 0.45], [E.muFetch + 3, 1.0, 1.12, 0.5, 0.5], [E.muSign + 6.6, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.muPress + 0.3, 2, 0.12], [E.muShut + 0.4, 0.6, 0.35], [E.muRoar, 3, 0.3], [E.muSmash, 0.8, 0.4], [E.muMess, 12, 0.1], [E.muSign + 6.6, 0.6, 0.3], [E.muSneeze, 1.2, 0.5], [E.muRunOut + 0.3, 1.2, 0.4], [E.muRunOut + 2, 7.6, 0.08]];")
rline("const FLASH = ", "const FLASH = [[E.muPress + 0.2, 0.3, '255,60,60'], [E.muShut + 2.2, 1.6, '0,0,0'], [E.muSneeze, 0.4, '255,255,255'], [E.muDawn, 1.2, '255,200,140'], [E.muRunOut, 0.3, '255,255,255']];")
rep("outlined('EPISODE 25', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SNOW GLOBE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we\\'re inside it)'",
    "outlined('EPISODE 26', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE MUSEUM', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(do not touch anything)'")
rep("outlined(i ? 'EP 26: THE MUSEUM' : 'EP 24: THE LIGHTHOUSE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(do not touch anything)' : '(the light is a fish)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 27: THE ROAD TRIP' : 'EP 25: THE SNOW GLOBE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Leggy is driving)' : '(we\\'re inside it)', x + 110, y + 80, 14")
rep("outlined('yep. it snowed.', 0, 0, 56", "outlined('yep. he touched it.', 0, 0, 56")
rep("\"that's me. under there.\"", "\"that's our vase.\"")
rep("'(the Flurries love it)'", "'(the sign said DO NOT TOUCH)'")
rline("const SECS = ", "const SECS = [[0, E.muEnter, plaza, 'plaza'], [E.muEnter, E.muRunOut, hall, 'hall'], [E.muRunOut, 1e9, plaza, 'plaza']];")
rline("const panic = ", "  const panic = win(T, E.muPress, E.muShut + 2) || win(T, E.muRoar, E.muCorner) || win(T, E.muSneeze, E.muSneeze + 3) || win(T, E.muRunOut, E.freeze);")
rep("if (win(T, E.macB, E.macB + 12)) { const bl", "if (win(T, E.muFix, E.muFix + 14)) { const bl")
rep("// sun & moons\n  const night = false;", "// sun & moons\n  const night = t >= E.muShut + 2.4 && t < E.muDawn;")
rep("""    stamp(T, E.inside + 2, 'SIZE: 1/100');
    stamp(T, E.twist + 6, 'FLURRIES: COMING WITH US');
    stamp(T, E.melt + 5, 'FLURRIES: MELTING');
    drawSwirl(T);""", """    stamp(T, E.muRules + 1, 'RULE #1: DO NOT TOUCH');
    stamp(T, E.muWake + 2, 'FOSSIL: AWAKE');
    stamp(T, E.muFetch + 5, 'FOSSIL: GOOD BOY');
    stamp(T, E.muAccept + 3, 'BLOOP: IN A MUSEUM');
    drawAlarm26(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
