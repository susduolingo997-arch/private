# ep27 scene.js = ep26 head (incl. ep21-26 helpers) minus ep26's sets + body27 + ep26 compositor tail; every replacement must match once
src = open('../ep26/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 26: "THE MUSEUM')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body27.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const muDay = {", "return mix(mix(hallN, hallDawn, seg(t, E.muDawn, E.muDawn + 4)), hallD, seg(t, E.muInspect + 6, E.muStatue + 10) * 0.6);", """  const rdDay = { top: '#5db8ff', bot: '#e4f4ff', sunI: 2.6, hemiI: 1.5, fog: '#d8ecff', sunEl: 0.8, sunAz: 0.5, near: 45, far: 110 };
  const dsSun = { top: '#5a3a90', bot: '#ffb070', sunI: 2.0, hemiI: 1.25, fog: '#f0a878', sunEl: 0.16, sunAz: 0.2, near: 45, far: 110 };
  const dsEve = { top: '#2a2070', bot: '#ff7a5a', sunI: 1.3, hemiI: 1.0, fog: '#b06a70', sunEl: 0.02, sunAz: 0.2, near: 45, far: 110 };
  const dsNight = { top: '#060a24', bot: '#1a2050', sunI: 0.5, hemiI: 0.8, fog: '#121838', sunEl: -0.1, sunAz: 2.4, near: 40, far: 110 };
  const dsDawn = { top: '#ff9a70', bot: '#ffe0b0', sunI: 2.0, hemiI: 1.3, fog: '#f4c8a0', sunEl: 0.2, sunAz: -0.4, near: 45, far: 110 };
  const dsDay = { top: '#3a9af0', bot: '#fff0c8', sunI: 2.8, hemiI: 1.5, fog: '#f6e4c0', sunEl: 0.9, sunAz: 0.4, near: 45, far: 110 };
  const noon = { top: '#4ab0ff', bot: '#e8f6ff', sunI: 2.7, hemiI: 1.55, fog: '#dcefff', sunEl: 1.0, sunAz: 0.7, near: 50, far: 120 };
  if (t < E.rtDesert) return rdDay; if (t >= E.rtLot) return noon; if (t < E.rtNight) return mix(dsSun, dsEve, seg(t, E.rtSput, E.rtNight)); if (t < E.rtDawn) return dsNight;
  return mix(mix(dsNight, dsDawn, seg(t, E.rtDawn, E.rtDawn + 2)), dsDay, seg(t, E.rtDawn + 6, E.rtRun + 10));""")
rep("(win(t, E.muPress, E.muLocked) || win(t, E.muWake, E.muCorner) || win(t, E.muMess, E.muFix) || win(t, E.muSneeze, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.rtBump, E.rtBump + 1.5) || win(t, E.rtSiren, E.rtPull) || win(t, E.rtSput, E.rtSput + 3) || win(t, E.rtBonk, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.rtNoLic ? 5 : t < E.rtSput ? 4 : t < E.rtFlat ? 3 : 1;")
rep("outlined(t >= E.muShut + 2.4 && t < E.muDawn ? '☾ NIGHT 26' : '☀ DAY 26', W / 2, 32, 18,", "outlined(t >= E.rtNight && t < E.rtDawn ? '☾ NIGHT 27' : '☀ DAY 27', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['map', t > E.rtMap - 1 ? 1 : 0], ['crown', 1], ['card', t > E.rtWarranty + 1 ? 1 : 0], ['license', t > E.rtPass + 1.5 ? 1 : 0], ['marsh', win(t, E.rtMarsh - 1, E.rtDawn) ? (t > E.rtMarsh + 1.2 ? 2 : 3) : 0], ['mallet', 1], ['ticket', t > E.rtTicket + 3.8 ? 1 : 0]];")
rep("  // things touched (allowed: 0) — this episode's mechanic\n  drawMuseumHUD(t);", "  // miles / fuel / are-we-there-yet — this episode's mechanic\n  drawRoadHUD(t);")
rline("const TOASTS = ", """ICON.map = (x, y, s) => { ctx.fillStyle = '#f2e6c4'; ctx.fillRect(x - s * 0.8, y - s * 0.6, s * 1.6, s * 1.2); ctx.strokeStyle = '#c0182a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.5, y + s * 0.4); ctx.lineTo(x, y - s * 0.2); ctx.lineTo(x + s * 0.5, y + s * 0.1); ctx.stroke(); ctx.fillStyle = '#ff5cf0'; ctx.fillRect(x + s * 0.35, y - s * 0.45, s * 0.3, s * 0.3); };
ICON.card = (x, y, s) => { ctx.fillStyle = '#fff8e0'; ctx.fillRect(x - s * 0.8, y - s * 0.5, s * 1.6, s); ctx.fillStyle = '#2a6a3a'; ctx.fillRect(x - s * 0.6, y - s * 0.3, s * 1.2, s * 0.15); ctx.fillRect(x - s * 0.6, y + s * 0.05, s * 0.8, s * 0.15); };
ICON.license = (x, y, s) => { ctx.fillStyle = '#e8f4ff'; ctx.fillRect(x - s * 0.8, y - s * 0.5, s * 1.6, s); ctx.fillStyle = '#2a2238'; ctx.fillRect(x - s * 0.65, y - s * 0.35, s * 0.55, s * 0.6); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - s * 0.55, y - s * 0.2, s * 0.12, s * 0.1); ctx.fillRect(x - s * 0.3, y - s * 0.2, s * 0.12, s * 0.1); ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x + s * 0.05, y - s * 0.25, s * 0.6, s * 0.12); ctx.fillRect(x + s * 0.05, y + s * 0.05, s * 0.45, s * 0.12); };
ICON.marsh = (x, y, s) => { ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - s * 0.8, y + s * 0.8); ctx.lineTo(x + s * 0.2, y - s * 0.2); ctx.stroke(); ctx.fillStyle = '#fffaf0'; ctx.fillRect(x, y - s * 0.7, s * 0.6, s * 0.6); };
const TOASTS = [[E.rtWarranty + 1, '+1 Warranty (300 mi)', 'card'], [E.rtMap - 1, '+1 Road Map', 'map'], [E.rtPass + 1.5, "+1 License (Leggy's)", 'license'], [E.rtMarsh - 1, '+3 Marshmallows', 'marsh'], [E.rtTicket + 3.8, '+1 Parking Ticket', 'ticket']];""")
rline("const FEATS = ", "const FEATS = [[E.rtHonk + 1.5, 'Road Trip!', 'Let a Hexapede drive'], [E.rtPass + 3, 'Licensed to Leg', 'Pass the cone test'], [E.rtSput + 3.5, 'Running on Empty', 'Run out of gas in the desert'], [E.rtMph + 1, 'Leg Day', 'Get carried at 112 mph'], [E.rtFlat + 2, 'Parallel Parking', 'Park... technically']];")
rblock("const POPS = [", """const POPS = [[E.rtVan + 0.5, 1.8, 'THE BLOOPMOBILE!', 0.5, 0.3, '#2ec4b6', 80], [E.rtSeat + 2.8, 1.4, '...hey.', 0.55, 0.35, '#ffffff', 70], [E.rtLegs + 0.5, 1.8, '6 legs. 3 pedals.', 0.5, 0.3, '#5ff7ff', 70], [E.rtWarranty + 0.6, 1.8, 'WARRANTY: 300 MI', 0.5, 0.3, '#7cff6b', 64],
  [E.rtHonk, 1.0, 'HONK', 0.5, 0.35, '#ffe066', 110], [E.rtHonk + 0.7, 1.0, 'HONK', 0.6, 0.4, '#ffe066', 90], [E.rtAreWe1, 1.4, 'are we there yet?', 0.4, 0.3, '#ffffff', 56], [E.rtAreWe1 + 2.2, 1.4, 'are we there yet?', 0.6, 0.35, '#ffffff', 56], [E.rtAreWe1 + 4.2, 1.4, 'ARE WE THERE YET?', 0.5, 0.3, '#ffe066', 64],
  [E.rtBump, 1.2, 'BUMP', 0.4, 0.4, '#ffffff', 110], [E.rtBump + 1.4, 1.4, 'nice catch!', 0.6, 0.3, '#7cff6b', 64], [E.rtFix1 + 3, 1.4, 'FIXED!', 0.4, 0.35, '#7cff6b', 90], [E.rtMap + 1.6, 1.6, 'this way up. definitely.', 0.5, 0.3, '#ffffff', 56], [E.rtTurn, 1.6, 'SHORTCUT!', 0.5, 0.3, '#ffe066', 100],
  [E.rtSiren + 1, 1.6, 'WEE-OO WEE-OO', 0.5, 0.3, '#ff6b6b', 80], [E.rtCop + 1, 1.8, 'LICENSE, PLEASE.', 0.5, 0.3, '#ffffff', 64], [E.rtNoLic, 1.8, 'NO LICENSE?!', 0.5, 0.32, '#ff6b6b', 100], [E.rtNoLic + 2.2, 1.4, 'FWEEET', 0.62, 0.3, '#ffffff', 90], [E.rtTest - 2, 1.8, 'CONE TEST', 0.5, 0.3, '#ff7a1a', 100],
  [E.rtTest + 3, 1.4, 'the cones have faces', 0.5, 0.35, '#ffffff', 56], [E.rtTest + 6, 1.4, 'LEFT!', 0.35, 0.4, '#ffe066', 90], [E.rtTest + 8.4, 1.4, 'RIGHT!', 0.65, 0.4, '#ffe066', 90], [E.rtTest + 10.8, 1.4, 'LEFT!', 0.35, 0.4, '#ffe066', 90], [E.rtTest + 13, 1.6, 'cousins hit: 0', 0.5, 0.3, '#7cff6b', 64],
  [E.rtPass + 0.4, 1.2, 'STAMP', 0.55, 0.4, '#ff6b6b', 100], [E.rtPass + 1.2, 1.8, 'PASSED!', 0.5, 0.3, '#7cff6b', 120], [E.rtGo2 + 1, 1.6, 'bye cousins!', 0.5, 0.3, '#ff7a1a', 64], [E.rtAreWe2, 1.4, 'are we there yet?', 0.4, 0.3, '#ffffff', 56], [E.rtAreWe2 + 1.6, 1.6, 'ask me ONE more time', 0.6, 0.38, '#ff6b6b', 52],
  [E.rtDoor, 1.2, 'CLUNK', 0.7, 0.4, '#ffffff', 100], [E.rtDoor + 1.6, 1.6, 'bye door', 0.5, 0.35, '#ffffff', 64], [E.rtSign + 2.6, 1.6, '*smallest??', 0.62, 0.35, '#ff5cf0', 70], [E.rtTiny + 1, 2, "it's... tiny", 0.5, 0.3, '#5ff7ff', 80], [E.rtTwist + 1.8, 1.8, 'UPSIDE DOWN', 0.5, 0.3, '#ff6b6b', 100],
  [E.rtSput + 0.3, 1.0, 'sputter', 0.35, 0.4, '#aaaaaa', 70], [E.rtSput + 1.2, 1.0, 'cough', 0.55, 0.35, '#aaaaaa', 70], [E.rtSput + 2.4, 1.4, 'pfffft.', 0.45, 0.45, '#aaaaaa', 90], [E.rtFire + 0.3, 1.4, 'FWOOMP', 0.5, 0.4, '#ff8a2a', 90], [E.rtFire + 2, 1.8, 'INVOICE: 1 CAMPFIRE', 0.5, 0.3, '#ffffff', 56],
  [E.rtStory + 1, 1.8, 'LICENSED :)', 0.5, 0.3, '#5ff7ff', 80], [E.rtStory + 2.8, 1.4, 'yes Leggy. we know.', 0.5, 0.3, '#ffffff', 56], [E.rtMarsh + 0.6, 1.4, 'FWOOSH', 0.4, 0.4, '#ff5a1a', 100], [E.rtMarsh + 2.2, 1.4, 'crispy.', 0.55, 0.45, '#ffffff', 70],
  [E.rtStar + 0.4, 1.8, 'make a wish', 0.5, 0.25, '#fff4b0', 64], [E.rtStar + 3, 1.6, '*wave*', 0.3, 0.4, '#ff7a1a', 64], [E.rtIdea + 2.6, 1.6, '!', 0.55, 0.3, '#ffe066', 140], [E.rtLift + 0.6, 1.6, 'HNNNGH', 0.5, 0.35, '#5ff7ff', 90], [E.rtRun + 1, 1.8, 'LEGGY IS DRIVING', 0.5, 0.3, '#ffe066', 90],
  [E.rtCone2 + 1.5, 1.6, 'PULL OVER!', 0.35, 0.35, '#ff6b6b', 80], [E.rtMph, 1.8, '112 MPH', 0.5, 0.3, '#ff6b6b', 110], [E.rtMph + 3, 1.6, 'sorry officer!', 0.5, 0.35, '#ffffff', 64], [E.rtLot + 3, 1.6, 'screeeech', 0.5, 0.4, '#ffffff', 80], [E.rtDrop + 1, 1.2, 'plop.', 0.5, 0.45, '#ffffff', 80],
  [E.rtWow + 0.5, 2.2, 'WHOA', 0.5, 0.25, '#ff5cf0', 130], [E.rtPhoto + 0.4, 1.4, 'say SHARD!', 0.5, 0.25, '#ffe066', 80], [E.rtCop3 + 3, 1.8, 'PARK IT PROPERLY.', 0.5, 0.3, '#ffffff', 64], [E.rtPark + 1, 1.4, 'keep going...', 0.5, 0.3, '#ffffff', 64], [E.rtPark + 4, 1.4, 'keep going...', 0.55, 0.35, '#ffffff', 64],
  [E.rtPark + 6.4, 1.4, 'little more...', 0.5, 0.3, '#ffffff', 64], [E.rtBonk, 1.4, 'BONK', 0.5, 0.4, '#ffffff', 110], [E.rtBonk + 3, 1.6, 'wobble', 0.5, 0.3, '#ff5cf0', 80], [E.rtJump, 1.4, 'OUT OUT OUT', 0.5, 0.3, '#ff6b6b', 90], [E.rtTip + 1, 1.6, 'ROLLING', 0.5, 0.3, '#ff5cf0', 110],
  [E.rtFlat, 1.6, 'CRUNCH', 0.5, 0.35, '#ffffff', 130], [E.rtInvoice + 0.4, 1.8, '1 VAN (flat)', 0.5, 0.3, '#ffffff', 64], [E.rtShop, 1.6, 'NOT THE GIFT SHOP', 0.5, 0.3, '#ff9ecb', 80], [E.rtTicket + 3.6, 1.6, 'SLAP', 0.5, 0.4, '#ffe066', 100]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.rtSeat + 2.8, 1.0, 1.12, 0.5, 0.5], [E.rtNoLic, 1.0, 1.15, 0.5, 0.45], [E.rtTiny + 1, 1.2, 1.15, 0.5, 0.5], [E.rtTwist + 1.8, 1.0, 1.15, 0.5, 0.5], [E.rtIdea + 2.6, 0.8, 1.12, 0.5, 0.5], [E.rtFlat, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.rtBump, 0.6, 0.3], [E.rtSiren, 4, 0.04], [E.rtSput, 3, 0.08], [E.rtLift + 2, 0.6, 0.3], [E.rtRun, E.rtLot - E.rtRun, 0.06], [E.rtMph, 2, 0.15], [E.rtDrop + 1, 0.5, 0.3], [E.rtBonk, 0.6, 0.35], [E.rtBonk + 1, 6, 0.06], [E.rtTip + 1.2, 1, 0.4], [E.rtFlat, 1, 0.5], [E.rtShop, 1, 0.4]];")
rline("const FLASH = ", "const FLASH = [[E.rtDesert, 0.3, '255,255,255'], [E.rtNight - 1, 1.8, '0,0,0'], [E.rtDawn, 1.2, '255,200,140'], [E.rtLot, 0.3, '255,255,255'], [E.rtPhoto + 0.6, 0.5, '255,255,255'], [E.rtFlat, 0.3, '255,255,255']];")
rep("outlined('EPISODE 26', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE MUSEUM', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(do not touch anything)'",
    "outlined('EPISODE 27', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE ROAD TRIP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy is driving)'")
rep("outlined(i ? 'EP 27: THE ROAD TRIP' : 'EP 25: THE SNOW GLOBE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Leggy is driving)' : '(we\\'re inside it)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 28: THE DRAGON EGG' : 'EP 26: THE MUSEUM', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(it hatched in my hat)' : '(do not touch anything)', x + 110, y + 80, 14")
rep("outlined('yep. he touched it.', 0, 0, 56", "outlined('yep. she parked it.', 0, 0, 56")
rep("\"that's our vase.\"", "\"that was our van.\"")
rep("'(the sign said DO NOT TOUCH)'", "'(and that was the gift shop)'")
rline("const SECS = ", "const SECS = [[0, E.rtDesert, road, 'road'], [E.rtDesert, E.rtLot, desert, 'desert'], [E.rtLot, 1e9, lot, 'lot']];")
rline("const panic = ", "  const panic = win(T, E.rtSiren, E.rtPull) || win(T, E.rtMph - 1, E.rtMph + 2) || win(T, E.rtJump, E.rtFlat + 1) || win(T, E.rtShop - 1, E.rtShop + 1.5);")
rep("if (win(T, E.muFix, E.muFix + 14)) { const bl", "if (win(T, E.rtIdea + 3.6, E.rtDawn)) { const bl")
rep("// sun & moons\n  const night = t >= E.muShut + 2.4 && t < E.muDawn;", "// sun & moons\n  const night = t >= E.rtNight && t < E.rtDawn;")
rep("""    stamp(T, E.muRules + 1, 'RULE #1: DO NOT TOUCH');
    stamp(T, E.muWake + 2, 'FOSSIL: AWAKE');
    stamp(T, E.muFetch + 5, 'FOSSIL: GOOD BOY');
    stamp(T, E.muAccept + 3, 'BLOOP: IN A MUSEUM');
    drawAlarm26(T);""", """    stamp(T, E.rtGo + 2, 'DRIVER: LEGGY (?!)');
    stamp(T, E.rtPass + 2.4, 'LEGGY: LICENSED');
    stamp(T, E.rtTwist + 2.4, 'MAP: UPSIDE DOWN');
    stamp(T, E.rtRun + 4, 'FUEL TYPE: LEGS');
    drawSiren27(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
