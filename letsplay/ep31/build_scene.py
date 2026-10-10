# ep31 scene.js = ep30 head (up to ep30's own episode body; ep30 helpers stay in the head once) + body31 + ep30 compositor tail; every replacement must match once
src = open('../ep30/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 30:')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body31.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const hbDay = {", "if (t < E.sbView || t >= E.sbSpit) return hbSet; return uwSh;", """  const cpDay = { top: '#4a9cff', bot: '#dff0ff', sunI: 2.6, hemiI: 1.5, fog: '#d8ecff', sunEl: 0.8, sunAz: 0.5, near: 90, far: 320 };
  const cpMorn = { top: '#5aa8ff', bot: '#ffe8d8', sunI: 2.4, hemiI: 1.5, fog: '#f0e4e0', sunEl: 0.35, sunAz: -0.6, near: 90, far: 320 };
  const snowHaze = { top: '#cfe0f0', bot: '#ffffff', sunI: 1.6, hemiI: 1.7, fog: '#f4f8fc', sunEl: 0.35, sunAz: -0.6, near: 4, far: 50 };
  const clOver = { top: '#7a8aa0', bot: '#c8d2dc', sunI: 1.5, hemiI: 1.5, fog: '#b8c4d0', sunEl: 0.6, sunAz: 0.9, near: 40, far: 160 };
  const clWhite = { top: '#e8eef4', bot: '#ffffff', sunI: 1.2, hemiI: 1.8, fog: '#eef3f8', sunEl: 0.6, sunAz: 0.9, near: 1.5, far: 14 };
  const clGold = { top: '#3a6ad0', bot: '#ffd8a0', sunI: 2.4, hemiI: 1.4, fog: '#ffe0b8', sunEl: 0.25, sunAz: 2.4, near: 80, far: 300 };
  const smGold = { top: '#4a5ac0', bot: '#ffb070', sunI: 2.2, hemiI: 1.35, fog: '#f8c090', sunEl: 0.14, sunAz: 2.6, near: 70, far: 300 };
  const smNight = { top: '#06081c', bot: '#1a2050', sunI: 0.55, hemiI: 0.8, fog: '#141a3a', sunEl: -0.3, sunAz: 2.6, near: 40, far: 200 };
  const smDawn = { top: '#5a6ad0', bot: '#ffb0c0', sunI: 1.9, hemiI: 1.35, fog: '#f0b8c8', sunEl: 0.1, sunAz: -0.6, near: 60, far: 260 };
  if (win(t, E.mtFlash, E.mtFlash + 4) || t < E.mtCliff) return cpDay;
  if (t < E.mtSummit) { if (t < E.mtCloud - 1) return clOver; if (t < E.mtAbove) return mix(clOver, clWhite, seg(t, E.mtCloud - 1, E.mtCloud + 0.5)); return mix(clWhite, clGold, seg(t, E.mtAbove, E.mtAbove + 2)); }
  if (t < E.mtDescend) { if (t < E.mtNight) return smGold; if (t < E.mtPlanB + 6) return mix(smGold, smNight, seg(t, E.mtNight, E.mtNight + 1.5)); return mix(smNight, smDawn, seg(t, E.mtPlanB + 6, E.mtCarry)); }
  if (t < E.mtBase) { if (t < E.mtCloud2 - 0.5) return smDawn; if (t < E.mtCloud2 + 5) return mix(smDawn, clWhite, seg(t, E.mtCloud2 - 0.5, E.mtCloud2 + 0.5)); return mix(clWhite, clOver, seg(t, E.mtCloud2 + 5, E.mtCloud2 + 6)); }
  if (t < E.mtBury) return cpMorn; return mix(snowHaze, cpMorn, seg(t, E.mtBury + 1, E.mtPop + 1.5));""")
rep("(win(t, E.sbBump, E.sbBump + 1.5) || win(t, E.sbChip, E.sbChip + 1.5) || win(t, E.sbMo + 2.5, E.sbMo + 5) || win(t, E.sbBurst, E.sbGulp) || win(t, E.sbSink, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0",
    "(win(t, E.mtGust, E.mtGust + 4) || win(t, E.mtBonkH, E.mtBonkH + 2) || win(t, E.mtDown + 4, E.mtEcoRev + 3) || win(t, E.mtPlanB + 6.5, E.mtLeggy + 2) || win(t, E.mtSlip, E.mtSlip + 1.5) || win(t, E.mtAval, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.mtBonkH ? 5 : t < E.mtNight ? 4 : t < E.mtPlanB + 6 ? 3 : t < E.mtAval ? 4 : t < E.mtBury ? 2 : 1;")
rep("  // day badge\n  const night = false;", "  // day badge\n  const night = win(t, E.mtNight + 1, E.mtCarry);")
rep("outlined(t >= E.sbBreach ? '☀ DUSK 30' : '☀ DAY 30', W / 2, 32, 18,", "outlined(t < E.mtNight + 1 ? '☀ DAY 31' : t < E.mtCarry ? '☾ NIGHT 31' : '☀ DAY 32', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['stair31', t > E.mtReveal + 4.5 ? 12 : 0], ['crown', 1], ['mallet', 1], ['bell31', (win(t, E.mtTrade + 9, E.mtRing + 5.6) || win(t, E.mtCarry, E.mtRun)) ? 1 : 0], ['photo31', t > E.mtSnap1 + 3 ? (t > E.mtSelfie + 4 ? 2 : 1) : 0], ['inv31', t > E.mtInvoice + 2 ? 1 : 0], ['fish', 0]];")
rep("  // sonar + depth + window count — this episode's mechanic\n  drawSonar30(t);", "  // altimeter + stairs + eco mode — this episode's mechanic\n  drawAlt31(t);")
rline("ICON.map30 = ", """ICON.stair31 = (x, y, s) => { ctx.fillStyle = '#c8955a'; for (let i = 0; i < 3; i++) ctx.fillRect(x - s * 0.8 + i * s * 0.5, y + s * 0.3 - i * s * 0.5, s * 0.55, s * 0.5 + i * s * 0.5); ctx.fillStyle = '#7cff6b'; ctx.fillRect(x - s * 0.8, y - s * 0.8, s * 0.4, s * 0.4); };
ICON.bell31 = (x, y, s) => { ctx.fillStyle = '#ffc83a'; ctx.beginPath(); ctx.moveTo(x - s * 0.35, y - s * 0.5); ctx.lineTo(x + s * 0.35, y - s * 0.5); ctx.lineTo(x + s * 0.7, y + s * 0.45); ctx.lineTo(x - s * 0.7, y + s * 0.45); ctx.fill(); ctx.fillStyle = '#5a4010'; ctx.fillRect(x - s * 0.15, y + s * 0.45, s * 0.3, s * 0.3); };
ICON.photo31 = (x, y, s) => { ctx.fillStyle = '#fbfbf4'; ctx.fillRect(x - s * 0.7, y - s * 0.8, s * 1.4, s * 1.6); ctx.fillStyle = '#5aa8ff'; ctx.fillRect(x - s * 0.55, y - s * 0.65, s * 1.1, s * 0.95); ctx.fillStyle = '#efe6d2'; ctx.fillRect(x - s * 0.3, y - s * 0.4, s * 0.6, s * 0.6); };
ICON.inv31 = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c0182a'; for (let i = 0; i < 4; i++) ctx.fillRect(x - s * 0.4, y - s * 0.5 + i * s * 0.32, s * (i === 3 ? 0.5 : 0.8), s * 0.12); };""")
for p in ("ICON.pearl30 = ", "ICON.window30 = ", "ICON.inv30 = "): rline(p, "")
rline("const TOASTS = ", "const TOASTS = [[E.mtReveal + 5, 'Got: Stair-O-Matic 3000', 'stair31'], [E.mtSnap1 + 3.2, 'Photo: goat (blurry)', 'photo31'], [E.mtTrade + 9.5, 'Got: The Summit Bell', 'bell31'], [E.mtSelfie + 6.2, 'Photo: PERFECT', 'photo31'], [E.mtInvoice + 2.5, '+1 Invoice', 'inv31']];")
rline("const FEATS = ", "const FEATS = [[E.mtEco + 3.5, 'Selective Hearing', 'Ignore the important part'], [E.mtAbove + 2, 'Cloud Walker', 'Climb above the clouds'], [E.mtRing + 8, 'Living Legend', 'Ring the Summit Bell'], [E.mtLeggy + 7.8, 'Six-Legged Sherpa', 'Afraid of heights? Not anymore.'], [E.mtBury + 3.5, 'Express Elevator', 'Find a faster way down']];")
rblock("const POPS = [", """const POPS = [[E.mtArrive + 3, 1.8, 'BASE CAMP!', 0.5, 0.3, '#ffe066', 90], [E.mtReveal + 0.6, 1.6, 'TA-DAA!', 0.6, 0.28, '#ff5ca8', 110], [E.mtReveal + 2.2, 2, 'STAIR-O-MATIC 3000', 0.55, 0.22, '#2ec4b6', 64], [E.mtReveal + 4.4, 1.2, '*clunk*', 0.45, 0.45, '#ffffff', 70],
  [E.mtLegend + 0.2, 1.4, 'the legend...', 0.62, 0.25, '#ffe066', 60], [E.mtScared + 2.4, 1.6, '1 block high.', 0.55, 0.3, '#ffffff', 64], [E.mtScared + 4.0, 1.6, 'NOPE', 0.45, 0.4, '#5ff7ff', 110],
  [E.mtTest + 0.5, 1.0, 'pew', 0.45, 0.45, '#7cff6b', 70], [E.mtTest + 0.9, 1.0, 'pew', 0.55, 0.4, '#7cff6b', 70], [E.mtTest + 1.3, 1.0, 'pew', 0.62, 0.33, '#7cff6b', 70], [E.mtTest + 3.4, 1.6, 'IT WORKS!', 0.5, 0.22, '#ffe066', 90],
  [E.mtEco + 0.4, 2.2, '"ECO MODE recycles the—"', 0.62, 0.66, '#ffffff', 44], [E.mtEco + 1.0, 1.8, 'yeah yeah cool', 0.36, 0.25, '#ffe066', 56], [E.mtEco + 2.6, 1.4, '*sigh*', 0.7, 0.5, '#ffffff', 60],
  [E.mtClimb + 1, 1.8, 'ADVENTURE!', 0.5, 0.25, '#ff8a2a', 90], [E.mtCliff + 2, 1.8, 'THE CLIFF', 0.5, 0.25, '#ffffff', 80],
  [E.mtGust, 1.4, 'WHOOOSH', 0.5, 0.3, '#bfe8ff', 120], [E.mtGust + 1.2, 1.4, 'his HAT', 0.62, 0.25, '#ffe066', 70], [E.mtGust + 3.0, 1.4, '...boomerang hat', 0.55, 0.32, '#ffffff', 56],
  [E.mtGoat + 0.4, 1.8, '...a goat?', 0.5, 0.3, '#ffffff', 80], [E.mtGoat + 2.4, 1.8, 'on a WALL?', 0.5, 0.38, '#ff8a2a', 80], [E.mtGoat + 4.5, 1.4, '*chew*', 0.62, 0.25, '#ffffff', 60],
  [E.mtSnap1 + 1, 1.4, 'selfie time!', 0.4, 0.3, '#ff9ecb', 70], [E.mtSnap1 + 2.0, 0.6, 'BAA', 0.6, 0.35, '#ffffff', 120], [E.mtSnap1 + 5, 1.4, '...', 0.5, 0.4, '#ffffff', 80],
  [E.mtLook + 0.5, 1.6, "don't look down", 0.5, 0.25, '#ffffff', 64], [E.mtLook + 3.2, 1.4, '*looks down*', 0.5, 0.25, '#ffffff', 60], [E.mtLook + 4.0, 2.4, 'chat: WHERE ARE THE STAIRS', 0.5, 0.7, '#ff6b6b', 46], [E.mtLook + 5.6, 1.4, 'chat: ???', 0.42, 0.62, '#ff6b6b', 46],
  [E.mtCloud + 1, 1.8, '*whiteout*', 0.5, 0.3, '#ffffff', 70], [E.mtCloud + 3.6, 1.2, 'baa.', 0.62, 0.38, '#ffffff', 80], [E.mtAbove + 0.6, 1.2, 'wooow', 0.5, 0.32, '#ffffff', 70],
  [E.mtSummit + 5, 2, 'THE SUMMIT!', 0.5, 0.22, '#ffe066', 100], [E.mtFrame + 3, 1.6, '...where bell?', 0.5, 0.25, '#ffffff', 70], [E.mtFrame + 4.6, 1.4, '*empty hook*', 0.5, 0.33, '#ffffff', 56],
  [E.mtDing + 0.2, 1.2, 'ding', 0.3, 0.4, '#ffe066', 80], [E.mtDing + 3.8, 1.4, 'DING', 0.5, 0.35, '#ffe066', 110],
  [E.mtChase + 1, 1.6, 'GIVE IT!', 0.5, 0.25, '#ff6b6b', 100], [E.mtChase + 4, 1.4, 'ding ding ding', 0.5, 0.3, '#ffe066', 60], [E.mtChase + 6, 1.4, 'he is FAST', 0.5, 0.25, '#ffffff', 70],
  [E.mtBonkH + 0.6, 1.4, 'BONK', 0.45, 0.35, '#ffe066', 150], [E.mtBonkH + 2.0, 1.4, 'FLUMP', 0.5, 0.4, '#ffffff', 110], [E.mtBonkH + 4, 1.6, '*legs*', 0.5, 0.3, '#ffffff', 64],
  [E.mtTripod + 2.2, 1.2, 'heave!', 0.45, 0.35, '#5ff7ff', 80], [E.mtTripod + 2.8, 1.2, 'POP', 0.55, 0.3, '#ffffff', 110], [E.mtTripod + 4.6, 1.4, '*munch*', 0.55, 0.35, '#ffffff', 80], [E.mtTripod + 5.8, 1.2, 'MY TRIPOD', 0.5, 0.25, '#ff6b6b', 90],
  [E.mtTrade + 1.6, 1.4, 'an idea...', 0.5, 0.25, '#ffe066', 70], [E.mtTrade + 3.0, 1.6, '*takes off hard hat*', 0.5, 0.3, '#ffffff', 52], [E.mtTrade + 5.7, 1.2, 'CLONK', 0.6, 0.35, '#ffe066', 130], [E.mtTrade + 6.6, 1.4, 'no headache!', 0.5, 0.25, '#7cff6b', 70], [E.mtTrade + 8.5, 1.2, 'clunk', 0.45, 0.6, '#ffe066', 70],
  [E.mtRing + 5.2, 1.0, 'hook: ✓', 0.5, 0.3, '#7cff6b', 70], [E.mtRing + 6.2, 2, 'DIIIIING', 0.5, 0.22, '#ffe066', 130], [E.mtRing + 7.4, 1.4, 'ding...', 0.3, 0.5, '#ffe066', 70], [E.mtRing + 8.2, 1.4, 'ding...', 0.7, 0.55, '#ffe066', 56],
  [E.mtSelfie + 0.6, 1.4, 'selfie #3', 0.5, 0.25, '#ff9ecb', 70], [E.mtSelfie + 2.4, 1.0, 'cheese!', 0.4, 0.3, '#ffffff', 70],
  [E.mtDown + 0.6, 1.8, 'okay, going down!', 0.5, 0.25, '#ffffff', 64], [E.mtDown + 3.6, 1.0, '...', 0.5, 0.3, '#ffffff', 90], [E.mtDown + 4.6, 1.8, 'NO STAIRS', 0.5, 0.25, '#ff6b6b', 110], [E.mtEcoRev + 3.4, 1.6, '"I TOLD YOU"', 0.72, 0.66, '#ffffff', 56],
  [E.mtFlash + 1, 2.4, 'blah blah eco mode', 0.5, 0.66, '#ffffff', 52],
  [E.mtNight + 2.2, 1.4, 'brrr', 0.4, 0.4, '#bfe8ff', 80], [E.mtNight + 5, 1.4, 'brrrrrr', 0.62, 0.35, '#bfe8ff', 90],
  [E.mtPlanA + 0.6, 1.6, 'PLAN A', 0.5, 0.22, '#ffe066', 100], [E.mtPlanA + 2, 1.4, 'they look SOFT', 0.5, 0.3, '#ffffff', 64], [E.mtPlanA + 3.2, 1.2, 'GRAB', 0.55, 0.4, '#ff6b6b', 100], [E.mtPlanA + 4.6, 1.2, '*yeet*', 0.6, 0.3, '#ffffff', 70], [E.mtPlanA + 8.4, 1.6, '...plip.', 0.5, 0.4, '#ffffff', 80],
  [E.mtPlanB + 0.4, 1.6, 'PLAN B', 0.5, 0.22, '#ffe066', 100], [E.mtPlanB + 2, 1.6, '10 stairs down!', 0.5, 0.3, '#7cff6b', 64], [E.mtPlanB + 4.4, 1.4, 'poof poof poof', 0.42, 0.5, '#7cff6b', 52], [E.mtPlanB + 6.8, 1.8, '...eco mode.', 0.5, 0.3, '#ff6b6b', 80],
  [E.mtLeggy + 0.6, 1.6, 'LEGGY?!', 0.5, 0.25, '#5ff7ff', 100], [E.mtLeggy + 2.6, 1.6, 'six legs!', 0.5, 0.3, '#5ff7ff', 80], [E.mtLeggy + 4.8, 1.2, 'grab!', 0.45, 0.4, '#ffffff', 80],
  [E.mtCarry + 1, 1.8, 'ALL ABOARD', 0.5, 0.22, '#ff9ecb', 80], [E.mtCarry + 3.4, 1.4, '*sunrise*', 0.5, 0.3, '#ffe066', 60],
  [E.mtDescend + 1, 1.8, 'GOING DOWN', 0.5, 0.22, '#5ff7ff', 90], [E.mtSlip, 1.2, 'SLIP', 0.5, 0.3, '#ff6b6b', 120], [E.mtSlip + 1.2, 1.4, '...grip.', 0.5, 0.4, '#5ff7ff', 70], [E.mtCloud2 + 1, 1.6, 'clouds (again)', 0.5, 0.3, '#ffffff', 60],
  [E.mtBase + 1.5, 2, 'BASE CAMP!!', 0.5, 0.22, '#7cff6b', 100], [E.mtBase + 5.4, 1.4, '*flop*', 0.5, 0.45, '#5ff7ff', 80],
  [E.mtInvoice + 0.8, 1.6, '*invoice*', 0.55, 0.3, '#ffffff', 70], [E.mtInvoice + 2.4, 2, '1 HARD HAT', 0.5, 0.6, '#ff6b6b', 80], [E.mtRingB + 1, 1.8, 'VICTORY DING!', 0.5, 0.22, '#ffe066', 100],
  [E.mtRumble + 0.6, 1.6, '...rumble?', 0.5, 0.3, '#ffffff', 70], [E.mtRumble + 3.4, 1.2, 'crk.', 0.5, 0.25, '#ffffff', 90], [E.mtAval + 0.5, 2, 'AVALANCHE', 0.5, 0.22, '#ff6b6b', 130], [E.mtAval + 3, 1.6, 'RUN!!', 0.5, 0.35, '#ffffff', 120],
  [E.mtRun + 2, 1.6, 'WEEEE', 0.72, 0.2, '#ffe066', 70], [E.mtRun + 5, 1.6, 'GO GO GO', 0.5, 0.3, '#ff6b6b', 100], [E.mtBury + 0.2, 1.4, 'FWUMP', 0.5, 0.4, '#ffffff', 150],
  [E.mtPop + 0.5, 1.0, 'pop', 0.5, 0.55, '#ffffff', 80], [E.mtPop + 1.5, 1.0, 'pop', 0.38, 0.55, '#ffffff', 80], [E.mtPop + 2.5, 1.0, 'pop', 0.62, 0.5, '#ffffff', 80], [E.mtPop + 5.8, 1.6, 'ding.', 0.5, 0.22, '#ffe066', 90]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.mtReveal + 0.5, 1.0, 1.12, 0.6, 0.4], [E.mtEco + 1, 1.0, 1.12, 0.4, 0.4], [E.mtGoat + 0.3, 1.2, 1.15, 0.55, 0.35], [E.mtDing + 3.6, 1.0, 1.15, 0.5, 0.5], [E.mtBonkH + 0.5, 0.8, 1.15, 0.45, 0.45], [E.mtDown + 4.4, 1.0, 1.15, 0.5, 0.45], [E.mtPlanA + 8.3, 1.0, 1.12, 0.5, 0.5], [E.mtPlanB + 6.6, 1.0, 1.15, 0.5, 0.5], [E.mtInvoice + 2.2, 0.8, 1.15, 0.5, 0.5], [E.mtAval + 0.4, 1.2, 1.12, 0.5, 0.35]];")
rline("const SHAKES = ", "const SHAKES = [[E.mtGust, 4, 0.12], [E.mtBonkH + 0.5, 0.8, 0.4], [E.mtTrade + 5.7, 0.5, 0.3], [E.mtRing + 6.2, 1.2, 0.2], [E.mtSlip, 1.2, 0.35], [E.mtRingB + 1, 0.8, 0.15], [E.mtRumble, E.mtAval - E.mtRumble, 0.15], [E.mtAval, E.mtBury - E.mtAval, 0.3], [E.mtBury, 1.2, 0.6]];")
rline("const FLASH = ", "const FLASH = [[E.mtCliff - 0.6, 1.2, '0,0,0'], [E.mtSnap1 + 2.5, 0.35, '255,255,255'], [E.mtSummit - 0.6, 1.2, '0,0,0'], [E.mtSelfie + 3.4, 0.35, '255,255,255'], [E.mtFlash - 0.4, 0.8, '255,240,200'], [E.mtFlash + 3.6, 0.8, '0,0,0'], [E.mtDescend - 0.6, 1.2, '0,0,0'], [E.mtBase - 0.6, 1.2, '0,0,0'], [E.mtBury, 1.2, '255,255,255']];")
rep("outlined('EPISODE 30', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SUBMARINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bloop forgot the windows)'",
    "outlined('EPISODE 31', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE MOUNTAIN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we forgot the way down)'")
rep("outlined(i ? 'EP 31: THE MOUNTAIN' : 'EP 29: THE CARNIVAL', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we forgot the way down)' : '(the ferris wheel escapes)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 32: THE PIZZA RUN' : 'EP 30: THE SUBMARINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Leggy ate the pizza)' : '(Bloop forgot the windows)', x + 110, y + 80, 14")
rep("outlined('yep. it leaks.', 0, 0, 56", "outlined('yep. it came down.', 0, 0, 56")
rep("\"the periscope.\"", "\"the WHOLE mountain.\"")
rep("'(all 40 windows. at once.)'", "'(it remembered the way down.)'")
rline("const SECS = ", "const SECS = [[0, E.mtCliff, camp31, 'camp31'], [E.mtCliff, E.mtSummit, cliff31, 'cliff31'], [E.mtSummit, E.mtFlash, summit31, 'summit31'], [E.mtFlash, E.mtFlash + 4, camp31, 'camp31'], [E.mtFlash + 4, E.mtDescend, summit31, 'summit31'], [E.mtDescend, E.mtBase, cliff31, 'cliff31'], [E.mtBase, 1e9, camp31, 'camp31']];")
rline("const panic = ", "  const panic = win(T, E.mtGust, E.mtGust + 3) || win(T, E.mtBonkH, E.mtBonkH + 2) || win(T, E.mtDown + 4, E.mtEcoRev) || win(T, E.mtPlanB + 6.5, E.mtLeggy + 1) || win(T, E.mtSlip, E.mtSlip + 1.5) || win(T, E.mtAval, E.mtBury);")
rep("if (win(T, E.sbInstall, E.sbInstall + 12)) { const bl", "if (win(T, 9999, 9999)) { const bl")
rep("// sun & moons\n  const night = false;", "// sun & moons\n  const night = win(t, E.mtNight + 1, E.mtPlanB + 8);")
rep("sun.color.set(res.under ? '#bff0ff' : t >= E.sbBreach ? '#ffb070' : '#fff1d6')", "sun.color.set(t >= E.mtAbove && t < E.mtBase ? '#ffb070' : '#fff1d6')")
rep("if (T < E.prevEnd) ctx.filter = 'sepia(0.7) contrast(1.1) saturate(0.8)';", "if (T < E.prevEnd || win(T, E.mtFlash, E.mtFlash + 4)) ctx.filter = 'sepia(0.7) contrast(1.1) saturate(0.8)';")
rep("if (win(T, E.hours, E.hoursEnd)) { const k = ss(seg(T, E.hours, E.hours + 0.4)) * (1 - ss(seg(T, E.hoursEnd - 0.4, E.hoursEnd)));", "if (win(T, E.mtNight - 0.4, E.mtNight + 2)) { const k = ss(seg(T, E.mtNight - 0.4, E.mtNight)) * (1 - ss(seg(T, E.mtNight + 1.6, E.mtNight + 2)));")
rep("['several', 'terrifying', 'hours', 'later...']", "['several', 'freezing', 'hours', 'later...']")
rep("""    stamp(T, E.sbBottle + 6.9, 'QUEST: THE GLOW PEARL');
    stamp(T, E.sbSonar + 2.2, 'SONAR: ONLINE');
    stamp(T, E.sbLeak + 6.4, 'LEGGY: 6/6 PLUGGED');
    stamp(T, E.sbMo + 5.6, 'IT WAS HER LURE');
    stamp(T, E.sbBff + 1.2, 'NEW FRIEND: MO');
    stamp(T, E.sbInstall + 12.2, 'WINDOWS: 40');
    drawMap30(T); drawPeri30(T);""", """    stamp(T, E.mtLegend + 7.4, 'QUEST: RING THE SUMMIT BELL');
    stamp(T, E.mtDing + 4.8, 'THE BELL: ON A GOAT');
    stamp(T, E.mtLeggy + 3.4, 'LEGGY: CAN CLIMB?!');
    stamp(T, E.mtRumble + 2.2, 'UH OH');
    drawLegend31(T); drawEco31(T); drawEcho31(T); drawFlash31(T); drawPhoto31(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
