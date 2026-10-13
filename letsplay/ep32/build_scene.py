# ep32 scene.js = ep31 head (up to ep31's own episode body; ep31 helpers stay in the head once) + body32 + ep31 compositor tail; every replacement must match once
src = open('../ep31/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 31:')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body32.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const cpDay = {", "if (t < E.mtBury) return cpMorn; return mix(snowHaze, cpMorn, seg(t, E.mtBury + 1, E.mtPop + 1.5));", """  const pzNoon = { top: '#4aa8ff', bot: '#e0f4ff', sunI: 2.7, hemiI: 1.55, fog: '#d8f0ff', sunEl: 1.0, sunAz: 0.4, near: 70, far: 240 };
  const pzAft = { top: '#5aa0f0', bot: '#ffe8c0', sunI: 2.4, hemiI: 1.45, fog: '#f0e0c8', sunEl: 0.45, sunAz: 1.6, near: 70, far: 260 };
  const pzSet = { top: '#5a4ab0', bot: '#ff9a60', sunI: 2.0, hemiI: 1.35, fog: '#f0a080', sunEl: 0.12, sunAz: 1.7, near: 60, far: 240 };
  const pzDusk = { top: '#2a2a70', bot: '#c86a8a', sunI: 1.3, hemiI: 1.2, fog: '#8a5a8a', sunEl: 0.03, sunAz: 1.7, near: 50, far: 220 };
  const pzNight = { top: '#0a1236', bot: '#2a3a7a', sunI: 0.85, hemiI: 1.15, fog: '#1c2a5a', sunEl: -0.3, sunAz: 1.7, near: 40, far: 170 };
  const pzFire = { top: '#3a1a30', bot: '#ff7a3a', sunI: 1.4, hemiI: 1.5, fog: '#8a3a3a', sunEl: -0.3, sunAz: 1.7, near: 40, far: 170 };
  if (t < E.pzRoad) return pzNoon;
  if (t < E.pzStake) return pzAft;
  if (t < E.pzTurbo) return pzSet;
  if (t < E.pzEnd) return mix(pzSet, pzDusk, seg(t, E.pzTurbo + 2, E.pzEnd));
  if (t < E.pzBlast) return pzNight; return mix(pzNight, pzFire, seg(t, E.pzBlast, E.pzBlast + 0.6));""")
rep("(win(t, E.mtGust, E.mtGust + 4) || win(t, E.mtBonkH, E.mtBonkH + 2) || win(t, E.mtDown + 4, E.mtEcoRev + 3) || win(t, E.mtPlanB + 6.5, E.mtLeggy + 2) || win(t, E.mtSlip, E.mtSlip + 1.5) || win(t, E.mtAval, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0",
    "(win(t, E.pzChase + 3.6, E.pzChase + 5) || win(t, E.pzClock, E.pzClock + 3) || win(t, E.pzFree, E.pzFree + 2) || win(t, E.pzSpicy + 3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.pzSlice1 + 1.5 ? 5 : t < E.pzReveal + 3 ? 4 : t < E.pzChase + 3.6 ? 5 : t < E.pzFree ? 4 : t < E.pzBlast ? 3 : 1;")
rep("  // day badge\n  const night = win(t, E.mtNight + 1, E.mtCarry);", "  // day badge\n  const night = t >= E.pzEnd;")
rep("outlined(t < E.mtNight + 1 ? '☀ DAY 31' : t < E.mtCarry ? '☾ NIGHT 31' : '☀ DAY 32', W / 2, 32, 18,", "outlined(t < E.pzEnd ? '☀ DAY 33' : '☾ NIGHT 33', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['pizza32', win(t, E.pzBox + 4.2, E.pzGulp + 0.5) ? SLICES32(t) : 0], ['crown', 1], ['mallet', 1], ['box32', win(t, E.pzBox + 5, E.pzGulp + 3) ? 1 : 0], ['slip32', t > E.pzOrder + 7 ? 1 : 0], ['coin32', t < E.pzFree + 2 ? 12 : 0], ['fish', 0]];")
rep("  // altimeter + stairs + eco mode — this episode's mechanic\n  drawAlt31(t);", "  // delivery timer + slices + heat — this episode's mechanic\n  drawDel32(t);")
rline("ICON.stair31 = ", """ICON.pizza32 = (x, y, s) => { ctx.fillStyle = '#d9963e'; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y - s * 0.7); ctx.lineTo(x + s * 0.8, y - s * 0.7); ctx.lineTo(x, y + s * 0.9); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.moveTo(x - s * 0.6, y - s * 0.45); ctx.lineTo(x + s * 0.6, y - s * 0.45); ctx.lineTo(x, y + s * 0.7); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#c8302a'; ctx.fillRect(x - s * 0.3, y - s * 0.3, s * 0.25, s * 0.25); ctx.fillRect(x + s * 0.05, y, s * 0.25, s * 0.25); };
ICON.box32 = (x, y, s) => isoCube(x, y, s, '#ff6b5a', '#d8322e', '#a01a1a');
ICON.slip32 = (x, y, s) => { ctx.fillStyle = '#fffaf0'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c8302a'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 0.35); ctx.fillStyle = '#2a2a3a'; for (let i = 0; i < 3; i++) ctx.fillRect(x - s * 0.4, y - s * 0.2 + i * s * 0.3, s * 0.8, s * 0.1); };
ICON.coin32 = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y, s * 0.7, 0, 7); ctx.fill(); ctx.fillStyle = '#e0a800'; ctx.fillRect(x - s * 0.12, y - s * 0.4, s * 0.24, s * 0.8); };""")
for p in ("ICON.bell31 = ", "ICON.photo31 = ", "ICON.inv31 = "): rline(p, "")
rline("const TOASTS = ", "const TOASTS = [[E.pzOrder + 7.6, 'Got: Order #32', 'slip32'], [E.pzBox + 6, 'Got: Hot-Box 9000', 'box32'], [E.pzSlice1 + 2.6, '-1 Slice (?)', 'pizza32'], [E.pzSlice2 + 2, '-1 Slice (again)', 'pizza32'], [E.pzFree + 2.4, '-12 Coins', 'coin32']];")
rline("const FEATS = ", "const FEATS = [[E.pzToss + 5.4, 'Dough Head', 'Catch a pizza with your face'], [E.pzJump + 4.6, 'Air Mail', 'Jump a river. Keep the pizza.'], [E.pzReveal + 7, 'Wrong Suspect', 'Accuse the innocent'], [E.pzOffer + 7.6, 'Willpower of Steel', 'Leggy said no to pizza'], [E.pzPay + 6.5, 'PAID?!', 'Bloop got paid. By Leggy.']];")
rblock("const POPS = [", """const POPS = [[E.pzArrive + 2, 1.8, "CRUSTINO'S!", 0.5, 0.3, '#ff6b5a', 90], [E.pzChef + 1.3, 1.6, 'BENVENUTO!', 0.55, 0.25, '#ffe066', 80], [E.pzChef + 4.5, 1.8, 'you are HIRED', 0.55, 0.3, '#ffffff', 64],
  [E.pzToss + 0.4, 1.2, 'toss!', 0.5, 0.25, '#ffffff', 80], [E.pzToss + 1.6, 1.2, 'spin spin spin', 0.55, 0.2, '#ffe066', 56], [E.pzToss + 3.2, 1.2, 'SPLAT', 0.5, 0.35, '#f6ead0', 120], [E.pzToss + 5.2, 1.8, 'dough hat (+0 armor)', 0.55, 0.62, '#ffffff', 46],
  [E.pzOrder + 0.2, 1.6, 'ORDER #32', 0.62, 0.22, '#ff6b5a', 70],
  [E.pzOven + 1, 1.6, 'MEGA PIZZA', 0.55, 0.22, '#ffd24a', 90], [E.pzOven + 2.6, 1.4, '*drool*', 0.32, 0.45, '#9fe8ff', 60], [E.pzOven + 4.0, 1.8, '"she is LOOKING at it"', 0.6, 0.25, '#ffffff', 48], [E.pzOven + 6.6, 1.2, '...', 0.78, 0.45, '#ffffff', 70],
  [E.pzBox + 0.6, 1.6, 'TA-DAA!', 0.55, 0.25, '#ff5ca8', 110], [E.pzBox + 2, 2, 'HOT-BOX 9000', 0.55, 0.2, '#ff6b5a', 70], [E.pzBox + 5.5, 2, 'TURBO: DO NOT PRESS', 0.55, 0.3, '#ff3d3d', 56], [E.pzBox + 6.8, 1.2, 'ok ok', 0.4, 0.4, '#ffffff', 60],
  [E.pzGo + 0.4, 1.6, 'GO GO GO', 0.5, 0.25, '#ffe066', 100], [E.pzGo + 2.2, 1.4, '30:00', 0.5, 0.35, '#ffffff', 90], [E.pzRoad + 1, 1.8, 'THE LONG ROAD', 0.5, 0.2, '#ffffff', 80],
  [E.pzSmell + 1.4, 1.2, '*sniff*', 0.6, 0.35, '#9fe8ff', 70], [E.pzSmell + 3.0, 1.4, 'LEGGY. NO.', 0.45, 0.25, '#ff6b5a', 90], [E.pzSmell + 5.8, 1.2, '*sniff sniff*', 0.6, 0.35, '#9fe8ff', 60], [E.pzSmell + 6.8, 1.2, 'NO.', 0.45, 0.25, '#ff6b5a', 100],
  [E.pzSlice1 + 1.6, 1.0, 'quick check...', 0.5, 0.25, '#ffffff', 60], [E.pzSlice1 + 2.4, 1.6, '7?!', 0.5, 0.4, '#ff3d3d', 130], [E.pzSlice1 + 4.4, 1.6, '*stare*', 0.4, 0.25, '#ffffff', 70], [E.pzSlice1 + 5.4, 1.4, '*innocent face*', 0.62, 0.62, '#5ff7ff', 48],
  [E.pzBridge + 0.5, 1.6, 'BRIDGE: OUT', 0.5, 0.22, '#ffe066', 90], [E.pzBridge + 2.2, 1.4, 'Bloop: on it.', 0.5, 0.3, '#ff9ecb', 60], [E.pzBridge + 4.5, 1.4, 'RAMP!', 0.55, 0.25, '#7cff6b', 100],
  [E.pzJump + 1.6, 1.6, 'WHEEEE', 0.5, 0.2, '#ffe066', 110], [E.pzJump + 2.8, 1.2, '(slow-mo)', 0.7, 0.62, '#ffffff', 44], [E.pzJump + 3.7, 1.2, 'THUD', 0.5, 0.4, '#ffffff', 120],
  [E.pzSlice2 + 1.2, 1.6, '6?!?!', 0.5, 0.4, '#ff3d3d', 130], [E.pzSlice2 + 2.8, 1.2, 'LEGGY.', 0.6, 0.25, '#ff6b5a', 90],
  [E.pzTrial + 3.9, 1.2, 'bang bang', 0.72, 0.3, '#ffe066', 56], [E.pzTrial + 6.0, 1.6, 'verdict: ...pending', 0.72, 0.62, '#ffffff', 44],
  [E.pzStake + 0.5, 1.8, 'THE STAKEOUT', 0.5, 0.2, '#ffe066', 80], [E.pzStake + 3, 1.6, "Leggy. you're showing.", 0.6, 0.62, '#ffffff', 44], [E.pzStake + 6, 1.2, 'shhh', 0.42, 0.4, '#ffffff', 60],
  [E.pzReveal + 0.5, 1.2, '*creak*', 0.55, 0.35, '#ffffff', 70], [E.pzReveal + 1.4, 1.4, '!!!', 0.5, 0.25, '#ffe066', 120], [E.pzReveal + 2.8, 2, 'HE WAS IN THE BOX', 0.5, 0.22, '#ff6b5a', 70], [E.pzReveal + 4.2, 1.2, '*munch*', 0.62, 0.4, '#ffffff', 64], [E.pzReveal + 6.2, 1.6, 'sorry Leggy!!', 0.55, 0.25, '#ff9ecb', 70],
  [E.pzChase + 0.8, 1.6, 'GET HIM!', 0.5, 0.22, '#ff6b5a', 100], [E.pzChase + 3.6, 1.2, 'BONK', 0.45, 0.35, '#ffe066', 140], [E.pzChase + 5.2, 1.4, '...tree.', 0.5, 0.45, '#ffffff', 60],
  [E.pzDen + 1, 1.8, 'aww.', 0.5, 0.25, '#ff9ecb', 100], [E.pzDen + 4.6, 1.8, 'three kits', 0.5, 0.25, '#ffffff', 64], [E.pzDen + 7, 1.4, '*tiny munch*', 0.55, 0.62, '#ffffff', 48],
  [E.pzOffer + 2.4, 1.6, 'for you?', 0.4, 0.35, '#ffffff', 60], [E.pzOffer + 3.4, 1.4, '*trembling*', 0.62, 0.3, '#5ff7ff', 52], [E.pzOffer + 5.2, 1.6, 'NO.', 0.5, 0.3, '#5ff7ff', 120], [E.pzOffer + 6.6, 1.6, 'she said NO', 0.55, 0.25, '#ffe066', 70],
  [E.pzClock + 0.4, 1.8, '2:00 LEFT?!', 0.5, 0.25, '#ff3d3d', 100], [E.pzClock + 3.2, 1.6, 'the TURBO...', 0.55, 0.3, '#ffe066', 64],
  [E.pzTurbo + 0.8, 1.0, '*click*', 0.5, 0.35, '#ffffff', 80], [E.pzTurbo + 1.6, 1.4, '*SNIFF*', 0.6, 0.3, '#9fe8ff', 110], [E.pzTurbo + 3.0, 2, 'ZOOOOM', 0.5, 0.22, '#ffe066', 130], [E.pzTurbo + 6, 1.6, 'AAAAA', 0.6, 0.3, '#ffffff', 90], [E.pzZoom + 1, 1.8, 'SPEED LIMIT: 6 LEGS', 0.55, 0.25, '#ffffff', 52], [E.pzZoom + 7.6, 1.2, 'WHOOSH', 0.5, 0.3, '#ffffff', 110],
  [E.pzEnd + 1.2, 1.6, 'SKRRRT', 0.5, 0.3, '#ffffff', 110], [E.pzEnd + 3.5, 1.6, 'MADE IT!', 0.5, 0.22, '#7cff6b', 100],
  [E.pzKnock + 0.3, 1.0, 'knock', 0.4, 0.3, '#ffffff', 70], [E.pzKnock + 1.0, 1.0, 'knock', 0.5, 0.26, '#ffffff', 70], [E.pzKnock + 1.6, 1.4, 'PIZZA!', 0.6, 0.22, '#ffe066', 90], [E.pzKnock + 3.6, 1.2, '...', 0.5, 0.35, '#ffffff', 90], [E.pzKnock + 5, 1.8, 'LATE?!', 0.5, 0.3, '#ff3d3d', 120],
  [E.pzWho + 3.2, 1.6, '...LEGGY?', 0.6, 0.25, '#5ff7ff', 90], [E.pzWho + 5.2, 1.4, '*nod nod*', 0.62, 0.38, '#5ff7ff', 64],
  [E.pzHers + 1.6, 1.4, '*rumble*', 0.5, 0.3, '#ffffff', 60], [E.pzHers + 3, 2, 'SHE LIVES HERE', 0.5, 0.22, '#ff5cf0', 80], [E.pzHers + 6.2, 1.6, '*napkin*', 0.5, 0.6, '#ffffff', 60],
  [E.pzPay + 1.6, 1.4, '*invoice*', 0.55, 0.3, '#ffffff', 70], [E.pzPay + 3.1, 1.6, '*PAID*', 0.6, 0.25, '#7cff6b', 110], [E.pzPay + 5, 1.8, 'BLOOP GOT PAID', 0.5, 0.22, '#ffe066', 80],
  [E.pzChef2 + 0.6, 1.6, 'CHEF?!', 0.5, 0.25, '#ff6b5a', 90], [E.pzChef2 + 4.2, 2, '30 MIN + 1 SEC', 0.6, 0.25, '#ff3d3d', 70], [E.pzFree + 0.4, 2, "IT'S FREE!", 0.6, 0.22, '#ffe066', 110], [E.pzFree + 2.2, 1.4, '-12 coins', 0.3, 0.45, '#ff6b5a', 64], [E.pzFree + 5, 1.6, 'free pizza for HER', 0.5, 0.25, '#5ff7ff', 60],
  [E.pzDinner + 1.4, 1.4, '*steam*', 0.5, 0.3, '#ffffff', 60], [E.pzDinner + 4.5, 1.6, 'so polite...', 0.5, 0.25, '#ff9ecb', 60],
  [E.pzGulp + 0.5, 1.4, 'GULP', 0.5, 0.3, '#ffe066', 150], [E.pzGulp + 2.0, 0.8, '...', 0.5, 0.4, '#ffffff', 80], [E.pzGulp + 2.9, 1.4, 'GULP', 0.5, 0.3, '#ffe066', 130], [E.pzGulp + 4.4, 1.8, 'the BOX too?!', 0.5, 0.25, '#ffffff', 70],
  [E.pzSpicy + 1.0, 1.4, '...', 0.5, 0.25, '#ffffff', 90], [E.pzSpicy + 2.6, 1.8, 'uh oh', 0.5, 0.25, '#ff6b5a', 90], [E.pzSpicy + 6, 1.8, 'EXTRA EXTRA SPICY', 0.5, 0.2, '#ff3d1a', 70],
  [E.pzSteam + 0.6, 1.6, 'WHEEEEEE', 0.5, 0.2, '#ff6b5a', 100], [E.pzSteam + 4, 1.4, '(the mailbox)', 0.62, 0.3, '#ffffff', 56], [E.pzSteam + 6.5, 1.6, 'RUN!!', 0.5, 0.3, '#ff3d3d', 120], [E.pzSteam + 9.5, 1.6, '*kettle noises*', 0.55, 0.25, '#ffffff', 52],
  [E.pzBlast + 0.2, 2, 'FWOOOOSH', 0.5, 0.25, '#ffe066', 140], [E.pzBlast + 3.5, 1.8, 'FIRE SNEEZE', 0.5, 0.75, '#ff6b5a', 80]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.pzToss + 3.1, 0.8, 1.15, 0.5, 0.4], [E.pzSlice1 + 2.3, 1.0, 1.15, 0.5, 0.5], [E.pzSlice2 + 1.1, 1.0, 1.15, 0.5, 0.5], [E.pzReveal + 1.3, 1.0, 1.15, 0.5, 0.45], [E.pzChase + 3.5, 0.8, 1.15, 0.5, 0.45], [E.pzOffer + 5.1, 1.0, 1.12, 0.5, 0.4], [E.pzKnock + 4.9, 1.0, 1.12, 0.5, 0.4], [E.pzFree + 0.3, 1.0, 1.12, 0.5, 0.4], [E.pzGulp + 0.4, 0.8, 1.15, 0.5, 0.45], [E.pzGulp + 2.8, 0.8, 1.18, 0.5, 0.45]];")
rline("const SHAKES = ", "const SHAKES = [[E.pzToss + 3.2, 0.5, 0.2], [E.pzJump + 3.6, 0.8, 0.35], [E.pzChase + 3.6, 0.6, 0.3], [E.pzTurbo + 3, E.pzEnd - E.pzTurbo - 3.4, 0.12], [E.pzEnd + 0.8, 1.0, 0.25], [E.pzGulp + 0.6, 0.4, 0.15], [E.pzSpicy + 3, E.pzSteam - E.pzSpicy - 3, 0.1], [E.pzSteam, E.pzBlast - E.pzSteam, 0.18], [E.pzBlast, 3, 0.5]];")
rline("const FLASH = ", "const FLASH = [[E.pzRoad - 0.6, 1.2, '0,0,0'], [E.pzStake - 0.6, 1.2, '0,0,0'], [E.pzTurbo - 0.5, 1.0, '0,0,0'], [E.pzEnd - 0.6, 1.2, '0,0,0'], [E.pzBlast, 0.3, '255,170,80']];")
rep("outlined('EPISODE 31', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE MOUNTAIN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we forgot the way down)'",
    "outlined('EPISODE 32', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE PIZZA RUN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy ate the pizza)'")
rep("outlined(i ? 'EP 32: THE PIZZA RUN' : 'EP 30: THE SUBMARINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Leggy ate the pizza)' : '(Bloop forgot the windows)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 33: THE ROBOT' : 'EP 31: THE MOUNTAIN', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? \"(it wants Bloop's job)\" : '(we forgot the way down)', x + 110, y + 80, 14")
rep("outlined('yep. it came down.', 0, 0, 56", "outlined('yep. she ate it.', 0, 0, 56")
rep("\"the WHOLE mountain.\"", "\"(and the box.)\"")
rep("'(it remembered the way down.)'", "'(extra extra spicy.)'")
rline("const SECS = ", "const SECS = [[0, E.pzRoad, plaza32, 'plaza32'], [E.pzRoad, E.pzEnd, road32, 'road32'], [E.pzEnd, 1e9, cave32, 'cave32']];")
rline("const panic = ", "  const panic = win(T, E.pzSlice1 + 2.2, E.pzSlice1 + 3.4) || win(T, E.pzClock, E.pzClock + 3) || win(T, E.pzKnock + 4.5, E.pzKnock + 6.5) || win(T, E.pzSpicy + 3, E.pzBlast + 2);")
rep("// sun & moons\n  const night = win(t, E.mtNight + 1, E.mtPlanB + 8);", "// sun & moons\n  const night = t >= E.pzEnd;")
rep("sun.color.set(t >= E.mtAbove && t < E.mtBase ? '#ffb070' : '#fff1d6')", "sun.color.set(win(t, E.pzStake, E.pzEnd) ? '#ffb070' : '#fff1d6')")
rep("if (T < E.prevEnd || win(T, E.mtFlash, E.mtFlash + 4)) ctx.filter = 'sepia(0.7) contrast(1.1) saturate(0.8)';", "if (T < E.prevEnd) ctx.filter = 'sepia(0.7) contrast(1.1) saturate(0.8)';")
rep("if (win(T, E.mtNight - 0.4, E.mtNight + 2)) { const k = ss(seg(T, E.mtNight - 0.4, E.mtNight)) * (1 - ss(seg(T, E.mtNight + 1.6, E.mtNight + 2)));", "if (win(T, 9999, 9999)) { const k = 0;")
rep("""    stamp(T, E.mtLegend + 7.4, 'QUEST: RING THE SUMMIT BELL');
    stamp(T, E.mtDing + 4.8, 'THE BELL: ON A GOAT');
    stamp(T, E.mtLeggy + 3.4, 'LEGGY: CAN CLIMB?!');
    stamp(T, E.mtRumble + 2.2, 'UH OH');
    drawLegend31(T); drawEco31(T); drawEcho31(T); drawFlash31(T); drawPhoto31(T);""", """    stamp(T, E.pzOrder + 7.6, 'NEW JOB: PIZZA DELIVERY');
    stamp(T, E.pzSlice1 + 6.4, 'SUSPECT: LEGGY');
    stamp(T, E.pzReveal + 4.6, 'LEGGY: INNOCENT');
    stamp(T, E.pzWho + 6.6, 'CUSTOMER: LEGGY?!');
    stamp(T, E.pzFree + 2.8, "IT'S FREE (FOR HER)");
    drawOrder32(T); drawTrial32(T); drawSpeed32(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
