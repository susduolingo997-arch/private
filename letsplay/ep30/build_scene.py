# ep30 scene.js = ep29 head (up to ep29's own episode body; ep29 helpers stay in the head once) + body30 + ep29 compositor tail; every replacement must match once
src = open('../ep29/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 29:')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body30.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const cvDay = {", "if (t < E.cvHills) return cvDay; if (t < E.cvBack) return mix(hlA, hlB, seg(t, E.cvHills, E.cvBack)); return cvNight;", """  const hbDay = { top: '#4aa8ff', bot: '#dff4ff', sunI: 2.6, hemiI: 1.5, fog: '#cfeaff', sunEl: 0.7, sunAz: 0.7, near: 70, far: 240 };
  const hbSet = { top: '#5a4ab0', bot: '#ff9a60', sunI: 1.9, hemiI: 1.3, fog: '#f0a080', sunEl: 0.12, sunAz: 2.7, near: 60, far: 220 };
  const uwA = { top: '#1a6a9a', bot: '#0a3050', sunI: 1.3, hemiI: 1.4, fog: '#0e4a6a', sunEl: -0.3, sunAz: 0.7, near: 6, far: 62 };
  const uwB = { top: '#06253a', bot: '#020a14', sunI: 0.45, hemiI: 1.0, fog: '#06202e', sunEl: -0.3, sunAz: 0.7, near: 5, far: 46 };
  const uwDark = { top: '#020810', bot: '#010306', sunI: 0.12, hemiI: 0.55, fog: '#020a12', sunEl: -0.3, sunAz: 0.7, near: 4, far: 38 };
  const uwSh = { top: '#3a9aa0', bot: '#1a5a6a', sunI: 1.8, hemiI: 1.5, fog: '#3a8a86', sunEl: -0.3, sunAz: 2.7, near: 8, far: 70 };
  if (t < E.sbCabin) return hbDay; if (t < E.sbTrench) return uwA;
  if (t < E.sbBreach) { if (t < E.sbDark) return mix(uwA, uwB, seg(t, E.sbTrench, E.sbTrench + 6)); if (t < E.sbGive) return mix(uwB, uwDark, seg(t, E.sbDark, E.sbDark + 0.6)); return mix(mix(uwDark, uwB, seg(t, E.sbGive, E.sbGive + 1)), uwA, seg(t, E.sbTow, E.sbBreach)); }
  if (t < E.sbView || t >= E.sbSpit) return hbSet; return uwSh;""")
rep("(win(t, E.cvPop, E.cvPop + 1.5) || win(t, E.cvJump, E.cvLand + 1) || win(t, E.cvPond, E.cvTip) || win(t, E.cvPop2, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.sbBump, E.sbBump + 1.5) || win(t, E.sbChip, E.sbChip + 1.5) || win(t, E.sbMo + 2.5, E.sbMo + 5) || win(t, E.sbBurst, E.sbGulp) || win(t, E.sbSink, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.sbChip ? 5 : t < E.sbMo + 2 ? 4 : t < E.sbLand ? 3 : t < E.sbBurst ? 4 : t < E.sbSink ? 2 : 1;")
rep("outlined(t >= E.cvBack ? '☾ NIGHT 29' : '☀ DAY 29', W / 2, 32, 18,", "outlined(t >= E.sbBreach ? '☀ DUSK 30' : '☀ DAY 30', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['map30', t > E.sbBottle + 3 ? 1 : 0], ['crown', 1], ['mallet', 1], ['pearl30', win(t, E.sbGrab + 2.5, E.sbGive) ? 1 : 0], ['window30', win(t, E.sbInstall + 11.5, E.sbBurst) ? 40 : 0], ['inv30', t > E.sbInvoice + 1 ? (t > E.sbInv2 + 1 ? 2 : 1) : 0], ['fish', 0]];")
rep("  // tickets → the grand prize — this episode's mechanic\n  drawTix29(t);", "  // sonar + depth + window count — this episode's mechanic\n  drawSonar30(t);")
rline("ICON.ring29 = ", """ICON.map30 = (x, y, s) => { ctx.fillStyle = '#f2dfb0'; ctx.fillRect(x - s * 0.8, y - s * 0.6, s * 1.6, s * 1.2); ctx.strokeStyle = '#c0182a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x + s * 0.1, y - s * 0.1); ctx.lineTo(x + s * 0.5, y + s * 0.3); ctx.moveTo(x + s * 0.5, y - s * 0.1); ctx.lineTo(x + s * 0.1, y + s * 0.3); ctx.stroke(); };
ICON.pearl30 = (x, y, s) => { ctx.fillStyle = '#e8fbff'; ctx.beginPath(); ctx.arc(x, y, s * 0.65, 0, 7); ctx.fill(); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - s * 0.3, y - s * 0.35, s * 0.25, s * 0.25); };
ICON.window30 = (x, y, s) => { ctx.fillStyle = '#8a8a98'; ctx.fillRect(x - s * 0.75, y - s * 0.75, s * 1.5, s * 1.5); ctx.fillStyle = '#bff0ff'; ctx.fillRect(x - s * 0.55, y - s * 0.55, s * 1.1, s * 1.1); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.4, y - s * 0.4, s * 0.3, s * 0.15); };
ICON.inv30 = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c0182a'; for (let i = 0; i < 4; i++) ctx.fillRect(x - s * 0.4, y - s * 0.5 + i * s * 0.32, s * (i === 3 ? 0.5 : 0.8), s * 0.12); };""")
for p in ("ICON.candy29 = ", "ICON.plush29 = ", "ICON.inv29 = "): rline(p, "")
rline("const TOASTS = ", "const TOASTS = [[E.sbBottle + 3.5, 'Found: Treasure Map', 'map30'], [E.sbGrab + 3, 'Got: The Glow Pearl!', 'pearl30'], [E.sbGive + 2, 'Lost: The Glow Pearl', 'pearl30'], [E.sbGift + 2, 'Leggy got: Mini Pearl', 'pearl30'], [E.sbInstall + 12.5, '+40 Windows', 'window30'], [E.sbInvoice + 4.2, '+1 Invoice', 'inv30'], [E.sbBurst + 0.8, '-40 Windows', 'window30']];")
rline("const FEATS = ", "const FEATS = [[E.sbNoWin + 4.5, 'Blind Faith', 'Board a sub with no windows'], [E.sbLeak + 6.5, 'Six Legs, Six Leaks', 'Plug every leak at once'], [E.sbGive + 3.2, 'Lure Returned', 'Give an anglerfish her light back'], [E.sbLand + 1.5, 'Air Mail', 'Get thrown home by a fish'], [E.sbGulp + 3, 'Swallowed Whole', 'Get eaten. Politely.']];")
rblock("const POPS = [", """const POPS = [[E.sbArrive + 3, 1.8, 'the HARBOR!', 0.5, 0.3, '#ffe066', 90], [E.sbReveal + 0.6, 1.6, 'TA-DAA!', 0.6, 0.28, '#ff5ca8', 110], [E.sbReveal + 2.6, 1.8, 'THE DEEP DIPPER', 0.55, 0.22, '#ffe066', 70],
  [E.sbBottle + 0.9, 1.2, 'plip', 0.4, 0.6, '#ffffff', 70], [E.sbBottle + 1.6, 1.4, '*bottle*', 0.45, 0.4, '#7cff6b', 70],
  [E.sbTour + 0.4, 1.6, 'propeller: spins', 0.5, 0.25, '#ffffff', 60], [E.sbTour + 2.8, 1.6, 'claw: grabby', 0.5, 0.25, '#ffffff', 60], [E.sbTour + 5.2, 1.4, 'cupholder?', 0.35, 0.6, '#ffe066', 64], [E.sbTour + 6.2, 1.2, '(outside)', 0.4, 0.7, '#ffffff', 52],
  [E.sbNoWin + 1.6, 1.8, '...windows?', 0.5, 0.25, '#ffffff', 80], [E.sbNoWin + 4.4, 2, '"WINDOWS ARE EXTRA"', 0.6, 0.28, '#ff6b6b', 64], [E.sbNoWin + 6.2, 1.2, 'click.', 0.4, 0.6, '#ffffff', 60],
  [E.sbBoard + 3.4, 1.4, 'squish', 0.55, 0.3, '#5ff7ff', 80], [E.sbDive + 0.6, 1.6, 'SPLOOSH', 0.5, 0.35, '#3ab0ff', 120],
  [E.sbCabin + 1, 1.8, 'cozy.', 0.5, 0.25, '#ffb08a', 80], [E.sbPeri + 0.4, 1.2, 'periscope!', 0.5, 0.25, '#5ff7ff', 70], [E.sbSonar + 0.4, 1.4, 'PING', 0.7, 0.45, '#7cff6b', 110], [E.sbSonar + 1.6, 1.2, 'ping', 0.72, 0.38, '#7cff6b', 70],
  [E.sbFish + 0.5, 1.8, '*fish trying to look in*', 0.5, 0.25, '#ffffff', 52], [E.sbBump, 1.4, 'CLONK', 0.55, 0.35, '#ffe066', 140], [E.sbBump + 1.4, 1.6, 'sonar: "rock"', 0.5, 0.6, '#7cff6b', 60], [E.sbBump2, 1.4, 'CLONK', 0.55, 0.35, '#ffe066', 140],
  [E.sbIdea + 0.8, 1.6, 'I\\'m making a window.', 0.5, 0.25, '#ffffff', 60], [E.sbIdea + 2.4, 1.2, 'NOT THE HULL', 0.7, 0.3, '#ff6b6b', 70], [E.sbChip, 1.2, 'TINK', 0.35, 0.4, '#ffffff', 100], [E.sbChip + 0.4, 1.6, 'BLBLBLBL', 0.45, 0.3, '#3ab0ff', 110],
  [E.sbLeak, 1, 'PSSHH', 0.35, 0.3, '#9fe0ff', 90], [E.sbLeak + 0.9, 1, 'PSSHH', 0.65, 0.35, '#9fe0ff', 90], [E.sbLeak + 1.8, 1, 'PSSHH', 0.3, 0.5, '#9fe0ff', 90], [E.sbLeak + 2.7, 1, 'PSSHH', 0.7, 0.55, '#9fe0ff', 90],
  [E.sbLeak + 5.4, 1.8, '6 legs. 6 leaks.', 0.5, 0.22, '#5ff7ff', 80], [E.sbPeek + 0.6, 1.4, 'peek...', 0.45, 0.3, '#ffffff', 64], [E.sbEye + 0.1, 1.6, 'AAAAAA', 0.5, 0.25, '#ff6b6b', 130], [E.sbEye + 1.7, 1, 'blink.', 0.6, 0.62, '#ffffff', 70],
  [E.sbTrench + 2, 1.8, 'the GLOOM TRENCH', 0.5, 0.25, '#5ff7ff', 80], [E.sbTrench + 5.4, 1.6, '*glow*', 0.5, 0.6, '#bff8ff', 70], [E.sbClaw + 1.6, 1.4, 'missed.', 0.5, 0.3, '#ffffff', 80],
  [E.sbGrab + 0.6, 1.2, 'GOT IT', 0.5, 0.25, '#7cff6b', 100], [E.sbGrab + 1.4, 1.2, 'pull!', 0.35, 0.4, '#ffffff', 80], [E.sbGrab + 2.5, 1.4, 'PLINK', 0.55, 0.35, '#bff8ff', 110], [E.sbDark + 0.4, 1.8, '...lights?', 0.5, 0.35, '#ffffff', 64],
  [E.sbMo + 0.6, 1.4, '*blink*', 0.42, 0.4, '#ffe066', 70], [E.sbMo + 2.6, 1.8, 'ROOOAAR', 0.5, 0.25, '#ff6b6b', 130], [E.sbMo + 4.6, 1.8, 'it was her LURE', 0.5, 0.7, '#ffffff', 64],
  [E.sbChase + 1, 1.6, 'GO GO GO', 0.5, 0.25, '#ff6b6b', 110], [E.sbGap + 1.5, 1.4, 'CRUNCH', 0.5, 0.35, '#c8c0b8', 120], [E.sbCorner + 1, 1.8, 'dead end.', 0.5, 0.3, '#ffffff', 80],
  [E.sbHatch + 0.6, 1.6, 'LEGGY?!', 0.5, 0.25, '#5ff7ff', 100], [E.sbHatch + 3.4, 1.6, 'glow buddy', 0.5, 0.6, '#5ff7ff', 64], [E.sbGive + 0.3, 1.6, 'click.', 0.5, 0.3, '#ffffff', 80], [E.sbGive + 1.6, 1.8, '*blush*', 0.5, 0.55, '#ff9ecb', 80],
  [E.sbBff + 0.8, 2, 'BEST FRIENDS', 0.5, 0.25, '#ff9ecb', 100], [E.sbBff + 3, 1.6, 'nuzzle', 0.6, 0.55, '#ffffff', 70], [E.sbTow + 1.5, 1.6, '*chomp* (gentle)', 0.5, 0.3, '#ffffff', 64], [E.sbTow + 5, 1.6, 'going UP', 0.5, 0.25, '#ffe066', 90],
  [E.sbBreach + 0.6, 1.4, 'FWOOSH', 0.5, 0.25, '#ffffff', 130], [E.sbBreach + 2, 1.6, 'AIR MAIL', 0.5, 0.3, '#5ff7ff', 100], [E.sbLand, 1.4, 'SPLASH', 0.5, 0.4, '#3ab0ff', 130],
  [E.sbOut + 0.8, 1.6, '@_@', 0.6, 0.3, '#ffffff', 90], [E.sbGift + 0.4, 1.2, 'ptoo', 0.6, 0.45, '#ff9ecb', 80], [E.sbGift + 2, 1.8, 'friendship pearl', 0.5, 0.25, '#ff9ecb', 70],
  [E.sbBloop + 1.6, 1.8, '"fine. WINDOWS."', 0.5, 0.25, '#ffffff', 70], [E.sbInstall + 5, 1.6, 'zzz', 0.3, 0.55, '#ffffff', 70], [E.sbInvoice + 1, 1.6, '*invoice*', 0.5, 0.3, '#ffffff', 70], [E.sbInvoice + 2.6, 2, 'WINDOWS x40', 0.5, 0.65, '#ff6b6b', 90],
  [E.sbGlass + 1, 2, '*sparkle*', 0.55, 0.3, '#bff0ff', 80], [E.sbBoard2 + 1, 1.6, 'TEST DIVE!', 0.5, 0.25, '#ffe066', 90], [E.sbView + 1, 1.8, 'FISH!', 0.4, 0.3, '#ff8a2a', 100], [E.sbView + 3, 1.8, 'CORAL!', 0.6, 0.35, '#ff5ca8', 100],
  [E.sbMoWave + 0.5, 1.8, 'hi Mo!', 0.6, 0.3, '#ff9ecb', 90], [E.sbTap + 0.6, 1, 'tap', 0.3, 0.4, '#ffffff', 80], [E.sbTap2 + 0.6, 1, 'tap', 0.3, 0.45, '#ffffff', 80], [E.sbTap2 + 1.6, 1.6, 'crk.', 0.4, 0.6, '#ffffff', 90],
  [E.sbTap3 + 0.6, 1.2, 'BOOP', 0.3, 0.45, '#ff9ecb', 120], [E.sbTap3 + 1.4, 1.8, 'CRRRACK', 0.5, 0.3, '#ffffff', 120], [E.sbBurst + 0.2, 1.4, 'KSSSH', 0.5, 0.3, '#3ab0ff', 150], [E.sbBurst + 2, 1.8, 'ALL OF THEM', 0.5, 0.6, '#ff6b6b', 100],
  [E.sbGulp + 2.5, 1.4, 'GULP', 0.5, 0.3, '#ff9ecb', 140], [E.sbSpit + 1.6, 1.4, 'PTOOO', 0.4, 0.3, '#ffffff', 130], [E.sbSpit + 3, 1.4, 'CRUNCH', 0.5, 0.45, '#c8a070', 130], [E.sbSpit + 4.6, 1.4, 'oof.', 0.4, 0.6, '#ffffff', 90],
  [E.sbInv2 + 0.6, 1.6, '*invoice*', 0.5, 0.3, '#ffffff', 70], [E.sbInv2 + 2.2, 1.8, 'x40 (AGAIN)', 0.5, 0.6, '#ff6b6b', 90], [E.sbTeeter + 0.6, 1.6, 'wobble', 0.55, 0.3, '#ffffff', 80], [E.sbTeeter + 3.3, 1, 'boop.', 0.35, 0.55, '#5ff7ff', 80],
  [E.sbSink + 0.3, 1.4, 'NO NO NO', 0.5, 0.25, '#ff6b6b', 110], [E.sbSink + 1.4, 1.4, 'SPLOOSH', 0.5, 0.45, '#3ab0ff', 130], [E.sbSink + 3, 1.8, 'blub.', 0.5, 0.6, '#ffffff', 90]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.sbReveal + 0.5, 1.0, 1.12, 0.6, 0.4], [E.sbNoWin + 4.2, 1.0, 1.15, 0.6, 0.4], [E.sbChip, 0.8, 1.15, 0.4, 0.45], [E.sbEye, 1.2, 1.2, 0.5, 0.5], [E.sbMo + 2.5, 1.2, 1.12, 0.5, 0.45], [E.sbGive, 1.0, 1.12, 0.5, 0.4], [E.sbInvoice + 2.4, 0.8, 1.15, 0.5, 0.5], [E.sbTap3 + 1.2, 1.0, 1.12, 0.4, 0.5], [E.sbSink, 1.0, 1.1, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.sbDive, 1.0, 0.15], [E.sbBump, 0.8, 0.45], [E.sbBump2, 0.8, 0.45], [E.sbChip, 0.5, 0.3], [E.sbMo + 2.5, 2.5, 0.25], [E.sbChase, E.sbCorner - E.sbChase, 0.05], [E.sbGap + 1.5, 0.8, 0.4], [E.sbLand, 1.0, 0.5], [E.sbTap3 + 1.2, 0.6, 0.3], [E.sbBurst, 4, 0.15], [E.sbSpit + 3, 1.0, 0.5], [E.sbSink + 1.3, 1.0, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.sbCabin - 0.8, 1.6, '0,0,0'], [E.sbEye, 0.25, '255,255,255'], [E.sbDark, 0.5, '0,0,0'], [E.sbGive, 0.5, '200,250,255'], [E.sbBreach - 0.4, 0.6, '255,255,255'], [E.sbTap - 0.6, 1.2, '0,0,0'], [E.sbBurst, 0.4, '255,255,255'], [E.sbGulp - 0.5, 1.0, '0,0,0'], [E.sbSpit - 0.5, 1.0, '0,0,0']];")
rep("outlined('EPISODE 29', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE CARNIVAL', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the ferris wheel escapes)'",
    "outlined('EPISODE 30', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SUBMARINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bloop forgot the windows)'")
rep("outlined(i ? 'EP 30: THE SUBMARINE' : 'EP 28: THE DRAGON EGG', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Bloop forgot the windows)' : '(it hatched in my hat)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 31: THE MOUNTAIN' : 'EP 29: THE CARNIVAL', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we forgot the way down)' : '(the ferris wheel escapes)', x + 110, y + 80, 14")
rep("outlined('yep. it escaped.', 0, 0, 56", "outlined('yep. it leaks.', 0, 0, 56")
rep("\"again.\"", "\"the periscope.\"")
rep("'(with me in it. and the prize.)'", "'(all 40 windows. at once.)'")
rline("const SECS = ", "const SECS = [[0, E.sbCabin, harbor30, 'harbor30'], [E.sbCabin, E.sbDeep, cabin30, 'cabin30'], [E.sbDeep, E.sbIdea, deep30, 'deep30'], [E.sbIdea, E.sbTrench, cabin30, 'cabin30'], [E.sbTrench, E.sbBreach, deep30, 'deep30'], [E.sbBreach, E.sbView, harbor30, 'harbor30'], [E.sbView, E.sbTap, deep30, 'deep30'], [E.sbTap, E.sbGulp, cabin30, 'cabin30'], [E.sbGulp, E.sbSpit, deep30, 'deep30'], [E.sbSpit, 1e9, harbor30, 'harbor30']];")
rline("const panic = ", "  const panic = win(T, E.sbBump, E.sbBump + 1) || win(T, E.sbChip, E.sbChip + 1.5) || win(T, E.sbEye, E.sbEye + 2.5) || win(T, E.sbMo + 2.5, E.sbChase + 3) || win(T, E.sbCorner, E.sbCorner + 3) || win(T, E.sbBurst, E.sbGulp) || win(T, E.sbSink, E.freeze);")
rep("if (win(T, 9999, 9999)) { const bl", "if (win(T, E.sbInstall, E.sbInstall + 12)) { const bl")
rep("// sun & moons\n  const night = t >= E.cvBack;", "// sun & moons\n  const night = false;")
rep("sun.color.set(t >= E.cvHills && t < E.cvBack ? '#ffb070' : '#fff1d6')", "sun.color.set(res.under ? '#bff0ff' : t >= E.sbBreach ? '#ffb070' : '#fff1d6')")
rep("clouds.visible = !cave && !res.space;", "clouds.visible = !cave && !res.space && !res.under && !res.cabin;")
rep("else if (cave) { setSky('#000000', '#05030a');", "else if (res.cabin) { setSky('#000000', '#05030a'); scene.fog.color.set('#05030a'); scene.fog.near = 40; scene.fog.far = 100; hemi.intensity = 0.8; hemi.color.set('#ffb08a'); hemi.groundColor.set('#402018'); sun.intensity = 0; }\n  else if (cave) { setSky('#000000', '#05030a');")
rep("""    stamp(T, E.cvPrize + 4.5, 'GOAL: 1000 TICKETS');
    stamp(T, E.cvRing2 + 5.5, 'LEGGY: CARNIVAL PRO');
    stamp(T, E.cvPaid + 3, 'BLOOP: PAID ON TIME?!');
    stamp(T, E.cvHills + 3, 'FERRIS WHEEL: ESCAPED');
    stamp(T, E.cvRoll + 0.5, 'BRAKES: MY LEGS');
    stamp(T, E.cvGift + 4.5, 'TICKETS: 1205');
    drawTurbo29(T);""", """    stamp(T, E.sbBottle + 6.9, 'QUEST: THE GLOW PEARL');
    stamp(T, E.sbSonar + 2.2, 'SONAR: ONLINE');
    stamp(T, E.sbLeak + 6.4, 'LEGGY: 6/6 PLUGGED');
    stamp(T, E.sbMo + 5.6, 'IT WAS HER LURE');
    stamp(T, E.sbBff + 1.2, 'NEW FRIEND: MO');
    stamp(T, E.sbInstall + 12.2, 'WINDOWS: 40');
    drawMap30(T); drawPeri30(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
