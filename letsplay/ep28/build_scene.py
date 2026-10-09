# ep28 scene.js = ep27 head (up to ep27's own helpers, so nothing of ep27 is redeclared) + body28 + ep27 compositor tail; every replacement must match once
src = open('../ep27/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- Ep 27 helpers')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body28.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const rdDay = {", "return mix(mix(dsNight, dsDawn, seg(t, E.rtDawn, E.rtDawn + 2)), dsDay, seg(t, E.rtDawn + 6, E.rtRun + 10));", """  const mdDay = { top: '#6ac4ff', bot: '#e8f8ff', sunI: 2.6, hemiI: 1.55, fog: '#d8f0ff', sunEl: 0.7, sunAz: 0.4, near: 60, far: 230 };
  const cdA = { top: '#6a3a8a', bot: '#ff9a5a', sunI: 2.0, hemiI: 1.3, fog: '#e08a6a', sunEl: 0.18, sunAz: 0.3, near: 40, far: 150 };
  const cdB = { top: '#3a1e6a', bot: '#ff6a4a', sunI: 1.4, hemiI: 1.1, fog: '#a85a5a', sunEl: 0.05, sunAz: 0.3, near: 40, far: 140 };
  const pkNight = { top: '#0a0e2a', bot: '#3a1a3a', sunI: 0.6, hemiI: 1.0, fog: '#24142e', sunEl: -0.1, sunAz: 2.4, near: 40, far: 130 };
  const pkDawn = { top: '#ff9a7a', bot: '#ffe0b0', sunI: 2.1, hemiI: 1.35, fog: '#f0c0a0', sunEl: 0.2, sunAz: -0.5, near: 50, far: 150 };
  const pkDay = { top: '#58a8f0', bot: '#fff0d0', sunI: 2.6, hemiI: 1.5, fog: '#f0dcc0', sunEl: 0.6, sunAz: -0.3, near: 50, far: 150 };
  if (t < E.dgCinder) return mdDay; if (t < E.dgNight) return mix(cdA, cdB, seg(t, E.dgCinder, E.dgNight)); if (t < E.dgDawn) return pkNight;
  return mix(mix(pkNight, pkDawn, seg(t, E.dgDawn, E.dgDawn + 4)), pkDay, seg(t, E.dgDawn + 10, E.dgStack));""")
rep("(win(t, E.rtBump, E.rtBump + 1.5) || win(t, E.rtSiren, E.rtPull) || win(t, E.rtSput, E.rtSput + 3) || win(t, E.rtBonk, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.dgBump, E.dgBump + 1.5) || win(t, E.dgFire, E.dgFire + 2) || win(t, E.dgChase, E.dgCorner) || win(t, E.dgHic3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.dgHic3 + 0.4 ? (t < E.dgChase ? 5 : t < E.dgReunite ? 3 : 4) : 1;")
rep("outlined(t >= E.rtNight && t < E.rtDawn ? '☾ NIGHT 27' : '☀ DAY 27', W / 2, 32, 18,", "outlined(t >= E.dgNight && t < E.dgDawn ? '☾ NIGHT 28' : '☀ DAY 28', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['egg28', t > E.dgEgg + 1 && t < E.dgHatch ? 1 : 0], ['crown', 1], ['inv28', win(t, E.dgInv + 1, E.dgHic2 + 0.4) ? 1 : 0], ['berry28', win(t, E.dgSnack - 1, E.dgSnack + 7) ? (t > E.dgSnack + 3.6 ? 1 : 2) : 0], ['drag28', t > E.dgHatch + 2 ? (t < E.dgFly ? 1 : t > E.dgHatchAll + 2 ? 5 : 0) : 0], ['mallet', 1], ['nug28', t > E.dgPay + 5.4 ? 1 : 0]];")
rep("  // miles / fuel / are-we-there-yet — this episode's mechanic\n  drawRoadHUD(t);", "  // egg warmth → what is on my head — this episode's mechanic\n  drawEggHUD28(t);")
rline("ICON.map = ", """ICON.egg28 = (x, y, s) => { ctx.fillStyle = '#fff0d0'; ctx.beginPath(); ctx.ellipse(x, y + 1, s * 0.6, s * 0.8, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff7a3a'; ctx.fillRect(x - s * 0.3, y - s * 0.2, s * 0.22, s * 0.22); ctx.fillRect(x + s * 0.1, y + s * 0.3, s * 0.22, s * 0.22); };
ICON.inv28 = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c0182a'; for (let i = 0; i < 4; i++) ctx.fillRect(x - s * 0.4, y - s * 0.5 + i * s * 0.32, s * (i === 3 ? 0.5 : 0.8), s * 0.12); };
ICON.berry28 = (x, y, s) => { ctx.fillStyle = '#ff2a3a'; ctx.fillRect(x - s * 0.45, y - s * 0.3, s * 0.9, s * 0.9); ctx.fillStyle = '#3cc26a'; ctx.fillRect(x - s * 0.2, y - s * 0.6, s * 0.4, s * 0.3); };
ICON.drag28 = (x, y, s) => { ctx.fillStyle = '#3ad6a0'; ctx.fillRect(x - s * 0.7, y - s * 0.2, s * 1.0, s * 0.8); ctx.fillRect(x, y - s * 0.8, s * 0.7, s * 0.7); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - s * 0.5, y + s * 0.3, s * 0.7, s * 0.3); ctx.fillStyle = '#fff'; ctx.fillRect(x + s * 0.3, y - s * 0.6, s * 0.25, s * 0.25); ctx.fillStyle = '#111'; ctx.fillRect(x + s * 0.4, y - s * 0.55, s * 0.12, s * 0.15); };
ICON.nug28 = (x, y, s) => isoCube(x, y, s * 0.8, '#ffe066', '#e0a800', '#b88400');""")
rline("ICON.card = ", "")
rline("ICON.license = ", "")
rline("ICON.marsh = ", "")
rline("const TOASTS = ", "const TOASTS = [[E.dgEgg + 2, '+1 Mystery Egg', 'egg28'], [E.dgInv + 1, '+1 Invoice (Egg-Cart)', 'inv28'], [E.dgHatch + 2, '+1 Baby Dragon (?!)', 'drag28'], [E.dgSnack - 1, '+2 Fireberries', 'berry28'], [E.dgPay + 5.6, '+1 Gold Block', 'nug28']];")
rline("const FEATS = ", "const FEATS = [[E.dgCatch + 1.5, 'Egg-cellent Catch', 'Catch a runaway egg'], [E.dgFire + 2.4, 'Hat Trick', 'Catch an egg with your hat'], [E.dgImprint + 2, 'Mom?!', 'Get imprinted on by a dragon'], [E.dgReunite + 2, 'Special Delivery', 'Return a baby dragon to its mama'], [E.dgHatchAll + 2, 'Hat-chery', 'Hatch five dragons on your head']];")
rblock("const POPS = [", """const POPS = [[E.dgSniff + 1, 1.4, '*sniff sniff*', 0.6, 0.35, '#5ff7ff', 60], [E.dgEgg + 0.6, 1.8, 'AN EGG!', 0.5, 0.3, '#ffe066', 110], [E.dgEgg + 2.6, 1.6, "it's warm.", 0.55, 0.38, '#ffffff', 60], [E.dgSign + 2.5, 1.8, 'REWARD?!', 0.45, 0.3, '#ffe066', 90],
  [E.dgPeak + 1.5, 2, 'EMBER PEAK', 0.62, 0.3, '#ff6a2a', 90], [E.dgCart + 4, 1.8, 'THE EGG-CART!', 0.4, 0.3, '#2ec4b6', 80], [E.dgInv + 0.4, 1.4, '*invoice*', 0.5, 0.35, '#ffffff', 64], [E.dgCold + 1.5, 1.6, 'brrr', 0.5, 0.4, '#6ab0ff', 90], [E.dgCold + 3, 1.8, 'LEGGY HUG', 0.42, 0.3, '#ff9ecb', 90],
  [E.dgBump, 1.0, 'BONK', 0.5, 0.35, '#ffffff', 110], [E.dgBump + 1.2, 1.6, 'THE EGG!', 0.5, 0.3, '#ff6b6b', 100], [E.dgBump + 3.5, 1.4, 'roll roll roll', 0.6, 0.4, '#ffffff', 60], [E.dgCatch + 0.6, 1.6, 'CAUGHT!', 0.5, 0.3, '#7cff6b', 110],
  [E.dgLamp + 1.5, 1.8, 'HEAT LAMP: MAX', 0.5, 0.3, '#ffb050', 80], [E.dgHot + 1, 1.6, 'smells toasty', 0.55, 0.35, '#ffffff', 60], [E.dgFire, 1.4, 'FWOOMP', 0.5, 0.35, '#ff8a2a', 120], [E.dgFire + 1.7, 1.6, 'plop.', 0.62, 0.35, '#ffffff', 80],
  [E.dgHat + 1, 1.8, 'perfect temperature', 0.5, 0.25, '#7cff6b', 60], [E.dgHop + 1.4, 1.4, 'HOT HOT HOT', 0.3, 0.4, '#ff6b6b', 80], [E.dgHop + 2.4, 1.6, 'Leggy: lava-proof', 0.68, 0.4, '#5ff7ff', 56],
  [E.dgWobble + 0.5, 1.6, '...it moved.', 0.5, 0.25, '#ffffff', 70], [E.dgCrack + 0.3, 1.0, 'tik', 0.42, 0.3, '#ffffff', 70], [E.dgCrack + 1.6, 1.0, 'tik tik', 0.58, 0.3, '#ffffff', 70], [E.dgHatch, 1.4, 'POP!', 0.5, 0.3, '#ffe066', 140], [E.dgHatch + 1.6, 1.6, 'chirp?', 0.55, 0.22, '#3ad6a0', 80],
  [E.dgImprint + 0.5, 2, 'MAMA?', 0.5, 0.2, '#ff9ecb', 110], [E.dgImprint + 3, 1.6, '*sad clicking*', 0.72, 0.5, '#5ff7ff', 52], [E.dgHic, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 110], [E.dgHic + 1, 1.6, 'singed.', 0.5, 0.45, '#ffffff', 70],
  [E.dgHic2, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 110], [E.dgHic2 + 1.2, 1.8, 'NOT THE INVOICE', 0.4, 0.4, '#ff6b6b', 70], [E.dgSnack + 3.4, 1.0, 'HIC!', 0.5, 0.2, '#ff8a2a', 100], [E.dgSnack + 4, 1.4, 'well done.', 0.62, 0.4, '#ffffff', 56],
  [E.dgSnack + 6.9, 1.4, 'nom', 0.5, 0.25, '#7cff6b', 90], [E.dgSnack + 8.4, 1.8, 'BEST FRIENDS', 0.5, 0.3, '#ff9ecb', 90], [E.dgLesson + 2.8, 1.6, 'FLYING LESSON', 0.5, 0.25, '#5ff7ff', 80], [E.dgLesson + 4.8, 1.2, 'plop', 0.62, 0.5, '#ffffff', 90], [E.dgLesson + 5.4, 1.6, 'flap flap flap', 0.4, 0.3, '#3ad6a0', 64],
  [E.dgNest + 2, 1.8, 'hello? Mama?', 0.5, 0.3, '#ffffff', 64], [E.dgShadow + 0.5, 1.6, 'whoosh', 0.5, 0.25, '#ffffff', 80], [E.dgLand, 1.6, 'THOOM', 0.5, 0.4, '#ffffff', 130], [E.dgRoar, 2.4, 'ROOOOAR', 0.5, 0.25, '#ff6a2a', 140],
  [E.dgSniff2 + 1, 1.6, '*sniff*', 0.5, 0.25, '#ffffff', 80], [E.dgSniff2 + 3, 1.8, 'she thinks I stole it', 0.5, 0.7, '#ff6b6b', 52], [E.dgChase, 1.4, 'RUN', 0.5, 0.3, '#ff6b6b', 130], [E.dgChase + 5, 1.4, 'FWOOOSH', 0.5, 0.3, '#ff8a2a', 110],
  [E.dgCorner + 1, 1.6, 'cliff.', 0.6, 0.6, '#ffffff', 80], [E.dgStep + 1, 1.8, 'LEGGY, NO!', 0.5, 0.3, '#5ff7ff', 90], [E.dgStep + 2.4, 1.6, '*flaps legs at dragon*', 0.5, 0.7, '#ffffff', 52], [E.dgFly + 1, 1.6, 'flap', 0.4, 0.4, '#3ad6a0', 80],
  [E.dgFly + 2.6, 1.6, 'flap flap', 0.6, 0.35, '#3ad6a0', 80], [E.dgFly + 4.4, 1.8, 'HE FLIES!', 0.5, 0.25, '#7cff6b', 110], [E.dgReunite + 1, 2, 'MAMA!', 0.5, 0.22, '#ff9ecb', 120], [E.dgReunite + 3.5, 1.6, '*purr*', 0.6, 0.35, '#ffffff', 80],
  [E.dgPay + 4, 1.6, '1 EGG DELIVERY', 0.5, 0.35, '#ffffff', 64], [E.dgPay + 4.6, 1.2, 'flick', 0.35, 0.3, '#ffe066', 80], [E.dgPay + 6.6, 1.6, 'thud.', 0.55, 0.5, '#ffffff', 80], [E.dgDawn + 1, 1.8, 'aww.', 0.5, 0.3, '#ffe066', 90],
  [E.dgBye + 1, 1.6, 'bye Pip!', 0.5, 0.3, '#3ad6a0', 80], [E.dgBye + 4.5, 1.6, 'one more favor?', 0.5, 0.3, '#ff6a2a', 64], [E.dgClutch + 3, 2, 'FIVE MORE?!', 0.5, 0.3, '#ff6b6b', 110],
  [EGGT28[0] + 0.9, 1.0, 'clonk', 0.4, 0.3, '#ffffff', 70], [EGGT28[1] + 0.9, 1.0, 'clonk', 0.58, 0.28, '#ffffff', 70], [EGGT28[2] + 0.9, 1.0, 'clonk', 0.42, 0.25, '#ffffff', 70], [EGGT28[3] + 0.9, 1.0, 'clonk', 0.6, 0.22, '#ffffff', 70], [EGGT28[4] + 0.9, 1.4, 'CLONK', 0.5, 0.18, '#ffe066', 90],
  [E.dgFlyOff + 1, 1.8, 'back by lunch!', 0.6, 0.25, '#ff6a2a', 64], [E.dgBabysit + 1, 1.8, 'BABYSITTING RATES', 0.5, 0.3, '#ffffff', 64], [E.dgWobble2 + 0.5, 1.4, 'uh oh', 0.5, 0.3, '#ffffff', 80], [E.dgCrack2, 1.0, 'tik', 0.4, 0.25, '#ffffff', 70],
  [E.dgCrack2 + 0.7, 1.0, 'tik', 0.6, 0.3, '#ffffff', 70], [E.dgCrack2 + 1.4, 1.2, 'tik tik tik', 0.5, 0.22, '#ffffff', 80], [E.dgHatchAll, 1.4, 'POP POP POP', 0.5, 0.2, '#ffe066', 120], [E.dgMoms + 0.4, 2, 'MAMA? x5', 0.5, 0.2, '#ff9ecb', 110],
  [E.dgHic3, 1.0, 'HIC!', 0.4, 0.2, '#ff8a2a', 120], [E.dgHic3 + 0.3, 1.0, 'HIC!', 0.6, 0.25, '#ff8a2a', 110], [E.dgHic3 + 1, 1.8, 'MY HAT', 0.5, 0.3, '#ff6b6b', 120], [E.dgHic3 + 3.4, 1.8, 'invoice: 1 HAT (toast)', 0.5, 0.75, '#ffffff', 52]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.dgEgg + 0.6, 1.0, 1.15, 0.5, 0.5], [E.dgHatch + 0.5, 1.0, 1.18, 0.5, 0.4], [E.dgImprint + 1, 1.0, 1.12, 0.5, 0.4], [E.dgRoar, 1.2, 1.12, 0.5, 0.4], [E.dgPay + 6.6, 0.8, 1.15, 0.5, 0.5], [E.dgHatchAll + 0.5, 1.0, 1.15, 0.5, 0.4]];")
rline("const SHAKES = ", "const SHAKES = [[E.dgBump, 0.6, 0.3], [E.dgFire, 0.8, 0.35], [E.dgHatch, 0.4, 0.2], [E.dgLand, 1.2, 0.5], [E.dgRoar, 2.5, 0.25], [E.dgChase, 10, 0.08], [E.dgFlyOff, 2, 0.25], [E.dgHatchAll, 0.5, 0.25], [E.dgHic3, 7, 0.08]];")
rline("const FLASH = ", "const FLASH = [[E.dgCinder, 0.3, '255,255,255'], [E.dgNight - 0.8, 1.8, '0,0,0'], [E.dgFire, 0.4, '255,160,60'], [E.dgHatch, 0.4, '255,255,255'], [E.dgChase + 0.6, 0.4, '255,120,40'], [E.dgDawn, 1.2, '255,200,140'], [E.dgHatchAll, 0.4, '255,255,255'], [E.dgHic3, 0.4, '255,140,40']];")
rep("outlined('EPISODE 27', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE ROAD TRIP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy is driving)'",
    "outlined('EPISODE 28', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE DRAGON EGG', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it hatched in my hat)'")
rep("outlined(i ? 'EP 28: THE DRAGON EGG' : 'EP 26: THE MUSEUM', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(it hatched in my hat)' : '(do not touch anything)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 29: THE CARNIVAL' : 'EP 27: THE ROAD TRIP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the ferris wheel escapes)' : '(Leggy is driving)', x + 110, y + 80, 14")
rep("outlined('yep. she parked it.', 0, 0, 56", "outlined('yep. they hatched.', 0, 0, 56")
rep("\"that was our van.\"", "\"that was my hat.\"")
rep("'(and that was the gift shop)'", "'(all five of them. in my hat.)'")
rline("const SECS = ", "const SECS = [[0, E.dgCinder, meadow, 'meadow'], [E.dgCinder, E.dgNight, cinder, 'cinder'], [E.dgNight, 1e9, peak, 'peak']];")
rline("const panic = ", "  const panic = win(T, E.dgBump + 0.6, E.dgCatch) || win(T, E.dgFire, E.dgFire + 1.6) || win(T, E.dgChase, E.dgCorner + 1) || win(T, E.dgHic3, E.freeze);")
rep("if (win(T, E.rtIdea + 3.6, E.rtDawn)) { const bl", "if (win(T, E.dgNight + 1, E.dgNest - 0.5)) { const bl")
rep("// sun & moons\n  const night = t >= E.rtNight && t < E.rtDawn;", "// sun & moons\n  const night = t >= E.dgNight && t < E.dgDawn;")
rep("""    stamp(T, E.rtGo + 2, 'DRIVER: LEGGY (?!)');
    stamp(T, E.rtPass + 2.4, 'LEGGY: LICENSED');
    stamp(T, E.rtTwist + 2.4, 'MAP: UPSIDE DOWN');
    stamp(T, E.rtRun + 4, 'FUEL TYPE: LEGS');
    drawSiren27(T);""", """    stamp(T, E.dgSign + 3.5, 'QUEST: RETURN THE EGG');
    stamp(T, E.dgHat + 2.5, 'INCUBATOR: MY HAT');
    stamp(T, E.dgName + 1.5, 'NAME: PIP');
    stamp(T, E.dgPay + 5.4, 'INVOICE: PAID (in gold)');
    stamp(T, E.dgMoms + 2, 'MOM x6');
    drawHeat28(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
