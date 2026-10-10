# ep29 scene.js = ep28 head (up to ep28's own episode body; ep28 helpers stay in the head once) + body29 + ep28 compositor tail; every replacement must match once
src = open('../ep28/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 28:')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body29.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const mdDay = {", "return mix(mix(pkNight, pkDawn, seg(t, E.dgDawn, E.dgDawn + 4)), pkDay, seg(t, E.dgDawn + 10, E.dgStack));", """  const cvDay = { top: '#5aaeff', bot: '#fff0c8', sunI: 2.5, hemiI: 1.5, fog: '#ffe8c8', sunEl: 0.55, sunAz: 0.8, near: 60, far: 220 };
  const hlA = { top: '#5a6ad0', bot: '#ffb070', sunI: 2.1, hemiI: 1.35, fog: '#f0a880', sunEl: 0.16, sunAz: 2.8, near: 50, far: 170 };
  const hlB = { top: '#2a2060', bot: '#ff7a5a', sunI: 1.3, hemiI: 1.1, fog: '#a06070', sunEl: 0.03, sunAz: 2.8, near: 40, far: 140 };
  const cvNight = { top: '#0a1030', bot: '#2a1a50', sunI: 0.8, hemiI: 1.2, fog: '#1a1438', sunEl: -0.1, sunAz: 2.4, near: 50, far: 160 };
  if (t < E.cvHills) return cvDay; if (t < E.cvBack) return mix(hlA, hlB, seg(t, E.cvHills, E.cvBack)); return cvNight;""")
rep("(win(t, E.dgBump, E.dgBump + 1.5) || win(t, E.dgFire, E.dgFire + 2) || win(t, E.dgChase, E.dgCorner) || win(t, E.dgHic3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.cvPop, E.cvPop + 1.5) || win(t, E.cvJump, E.cvLand + 1) || win(t, E.cvPond, E.cvTip) || win(t, E.cvPop2, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.cvPop2 + 0.4 ? (t < E.cvPop ? 5 : t < E.cvBack ? 3 : 4) : 1;")
rep("outlined(t >= E.dgNight && t < E.dgDawn ? '☾ NIGHT 28' : '☀ DAY 28', W / 2, 32, 18,", "outlined(t >= E.cvBack ? '☾ NIGHT 29' : '☀ DAY 29', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['ring29', win(t, E.cvRing - 0.5, E.cvRing + 5.2) ? (t < E.cvRing + 1 ? 3 : t < E.cvRing + 3 ? 2 : 1) : 0], ['crown', 1], ['ticket', tix29(t) > 0 ? 1 : 0], ['mallet', 1], ['candy29', 0], ['plush29', t > E.cvRedeem + 2.6 ? 1 : 0], ['inv29', win(t, E.cvInvoice + 1.2, E.cvRide) ? 1 : 0]];")
rep("  // egg warmth → what is on my head — this episode's mechanic\n  drawEggHUD28(t);", "  // tickets → the grand prize — this episode's mechanic\n  drawTix29(t);")
rline("ICON.egg28 = ", """ICON.ring29 = (x, y, s) => { ctx.strokeStyle = '#ff5ca8'; ctx.lineWidth = s * 0.3; ctx.beginPath(); ctx.ellipse(x, y, s * 0.7, s * 0.45, 0, 0, 7); ctx.stroke(); };
ICON.candy29 = (x, y, s) => { ctx.fillStyle = '#ffb0dc'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 0.9); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.08, y, s * 0.16, s * 0.8); };
ICON.plush29 = (x, y, s) => { ctx.fillStyle = '#ffd84a'; ctx.fillRect(x - s * 0.7, y - s * 0.1, s * 1.4, s * 0.6); for (const dx of [-0.7, -0.15, 0.4]) ctx.fillRect(x + dx * s, y - s * 0.6, s * 0.3, s * 0.5); ctx.fillStyle = '#ff7ac0'; for (const dx of [-0.55, 0, 0.55]) ctx.fillRect(x + dx * s - s * 0.1, y - s * 0.8, s * 0.2, s * 0.2); };
ICON.inv29 = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.6, y - s * 0.8, s * 1.2, s * 1.6); ctx.fillStyle = '#c0182a'; for (let i = 0; i < 4; i++) ctx.fillRect(x - s * 0.4, y - s * 0.5 + i * s * 0.32, s * (i === 3 ? 0.5 : 0.8), s * 0.12); };""")
for p in ("ICON.inv28 = ", "ICON.berry28 = ", "ICON.drag28 = ", "ICON.nug28 = "): rline(p, "")
rline("const TOASTS = ", "const TOASTS = [[E.cvRing2 + 4.4, '+200 Tickets (Leggy)', 'ticket'], [E.cvHammer + 3, '+5 Tickets (wow.)', 'ticket'], [E.cvHammer2 + 3, '+300 Tickets (Leggy)', 'ticket'], [E.cvCandy + 5.2, '-300 Tickets (candy)', 'candy29'], [E.cvCount + 3.4, '+500 Tickets (Bix)', 'ticket'], [E.cvGift + 3.4, '+500 Tickets (Bloop)', 'ticket'], [E.cvRedeem + 2.8, '+1 GIANT Plush Crown', 'plush29']];")
rline("const FEATS = ", "const FEATS = [[E.cvRing2 + 5, 'Ringer', 'Watch a hexapede go 5 for 5'], [E.cvHammer2 + 2.5, 'Bell Launcher', 'Ring the bell into orbit'], [E.cvLand + 1.5, 'Sweet Landing', 'Use cotton candy as an airbag'], [E.cvBack + 6.4, 'Wheel Returned', 'Roll a Ferris wheel home'], [E.cvRedeem + 3.2, 'Grand Prize', 'Win the giant plush crown']];")
rblock("const POPS = [", """const POPS = [[E.cvArrive + 3, 1.8, 'the CARNIVAL!', 0.5, 0.3, '#ffe066', 90], [E.cvBix + 0.5, 1.6, 'STEP RIGHT UP!', 0.55, 0.28, '#ff5ca8', 100], [E.cvBix + 3, 1.6, '*mustache wiggle*', 0.62, 0.5, '#ffffff', 52], [E.cvPrize + 1.2, 2, 'THE GRAND PRIZE', 0.5, 0.22, '#ffe066', 100],
  [E.cvPrize + 3.4, 1.8, '1000 TICKETS?!', 0.4, 0.62, '#ff6b6b', 80], [E.cvJob + 1.5, 1.8, '"it\\'s a bit... loose."', 0.5, 0.3, '#ffffff', 56], [E.cvJob + 3.2, 1.6, 'JOB OFFER', 0.55, 0.22, '#2ec4b6', 90],
  [E.cvRing + 1.8, 1.0, 'clink.', 0.45, 0.55, '#ffffff', 70], [E.cvRing + 4, 1.0, 'thunk.', 0.4, 0.3, '#ffffff', 70], [E.cvRing + 5.6, 1.0, 'TINK', 0.3, 0.45, '#ffe066', 90], [E.cvRing + 6.6, 1.8, 'on Leggy.', 0.6, 0.3, '#5ff7ff', 80],
  [E.cvRing2 + 1.6, 0.8, 'ring!', 0.25, 0.4, '#7cff6b', 70], [E.cvRing2 + 2.2, 0.8, 'ring!', 0.3, 0.32, '#7cff6b', 70], [E.cvRing2 + 2.8, 0.8, 'ring!', 0.36, 0.42, '#7cff6b', 70], [E.cvRing2 + 3.4, 0.8, 'ring!', 0.3, 0.5, '#7cff6b', 70], [E.cvRing2 + 4, 1.4, 'RING!', 0.38, 0.36, '#7cff6b', 100],
  [E.cvHammer + 1.1, 1.0, 'BONK', 0.6, 0.6, '#ffffff', 90], [E.cvHammer + 1.8, 1.6, 'WEAK', 0.62, 0.36, '#ff6b6b', 100], [E.cvHammer2 + 1.5, 0.8, 'tap.', 0.5, 0.7, '#ffffff', 70], [E.cvHammer2 + 1.85, 1.4, 'DING!!', 0.55, 0.25, '#ffe066', 140], [E.cvHammer2 + 2.6, 1.8, 'the bell left.', 0.5, 0.4, '#ffffff', 64],
  [E.cvCandy + 3.4, 1.4, 'slurrrp', 0.35, 0.4, '#ff9ecb', 80], [E.cvCandy + 4.6, 1.6, 'POOF', 0.38, 0.3, '#ff5ca8', 120], [E.cvCandy + 6, 1.8, 'she is the candy now', 0.45, 0.72, '#ffffff', 52],
  [E.cvTurbo + 1, 1.0, 'clank', 0.4, 0.4, '#ffffff', 70], [E.cvTurbo + 2.4, 1.0, 'bzzt', 0.6, 0.35, '#5ff7ff', 70], [E.cvTurbo + 4.6, 1.4, '*invoice*', 0.5, 0.35, '#ffffff', 64], [E.cvPaid + 0.6, 2, 'PAID. ON TIME.', 0.5, 0.25, '#7cff6b', 100], [E.cvPaid + 2.2, 1.4, '...in tickets', 0.55, 0.6, '#ffffff', 56],
  [E.cvOffer + 0.6, 2, 'FIRST RIDER WINS 500!', 0.5, 0.2, '#ffe066', 70], [E.cvOffer + 3, 1.4, 'ME ME ME', 0.6, 0.3, '#ff8a2a', 90], [E.cvBoard + 2.6, 1.6, 'wheee (calm)', 0.5, 0.25, '#ffffff', 64],
  [E.cvTurboOn + 0.6, 1.2, 'CLUNK', 0.45, 0.4, '#ffffff', 90], [E.cvTurboOn + 2.2, 1.8, 'WHEEEEE', 0.5, 0.2, '#ff5ca8', 110], [E.cvTurboOn + 5, 1.6, 'too much wheee', 0.5, 0.75, '#ffffff', 60], [E.cvPop, 1.4, 'POP', 0.5, 0.3, '#ffe066', 150], [E.cvPop + 1.4, 1.6, 'uh oh', 0.5, 0.6, '#ffffff', 80],
  [E.cvPop + 3.6, 1.4, 'BOING', 0.6, 0.3, '#e8344e', 120], [E.cvPop + 6.2, 1.8, 'FOLLOW THAT WHEEL', 0.5, 0.22, '#3a8aff', 70],
  [E.cvHills + 1.5, 2, 'it escaped.', 0.5, 0.3, '#ffffff', 90], [E.cvInside + 3, 1.6, 'AAAAAA', 0.4, 0.3, '#ff6b6b', 110], [E.cvInside + 4.4, 1.6, '*munch*', 0.7, 0.55, '#ff9ecb', 64], [E.cvChase + 1, 1.8, '"STOP THAT WHEEL!"', 0.5, 0.25, '#ffe066', 70],
  [E.cvHay + 1.5, 1.4, 'FWUMP', 0.5, 0.4, '#e8c050', 130], [E.cvHay + 3, 1.4, 'hay.', 0.6, 0.6, '#ffffff', 80], [E.cvJump + 0.4, 1.6, 'AIRBORNE', 0.5, 0.25, '#5ff7ff', 120], [E.cvLand - 0.4, 1.4, 'FLUFF DEPLOYED', 0.5, 0.3, '#ff5ca8', 80], [E.cvLand + 0.2, 1.4, 'SPLOOF', 0.5, 0.55, '#ff9ecb', 130],
  [E.cvIdea + 0.4, 1.6, 'idea.', 0.5, 0.25, '#ffe066', 100], [E.cvRoll + 2, 1.6, 'run run run', 0.5, 0.25, '#ffffff', 70], [E.cvRoll + 5, 1.6, 'it\\'s working?!', 0.5, 0.3, '#7cff6b', 70], [E.cvPond + 0.4, 1.6, 'POND', 0.5, 0.6, '#3ab0ff', 120],
  [E.cvPond + 2, 1.6, 'wobble', 0.6, 0.35, '#ffffff', 80], [E.cvTip + 0.5, 1.6, 'phew.', 0.5, 0.3, '#7cff6b', 100], [E.cvPush + 1, 1.8, 'PUSH!', 0.5, 0.3, '#3a8aff', 110], [E.cvPush + 4, 1.6, 'back we go', 0.5, 0.25, '#ffffff', 70],
  [E.cvBack + 5.5, 1.4, 'CLUNK', 0.45, 0.3, '#ffffff', 130], [E.cvBack + 6.8, 1.2, 'oof.', 0.55, 0.6, '#ffffff', 90], [E.cvLights + 1, 1.8, 'ooooh', 0.5, 0.3, '#ffe066', 100], [E.cvCount + 3.6, 1.8, '705 / 1000', 0.5, 0.25, '#ff6b6b', 90], [E.cvCount + 5.4, 1.6, 'so close.', 0.5, 0.65, '#ffffff', 70],
  [E.cvGift + 2, 1.8, 'for me?', 0.5, 0.25, '#ffffff', 80], [E.cvGift + 3.4, 1.8, 'BLOOP...', 0.5, 0.3, '#ff9ecb', 110], [E.cvInvoice + 1, 1.6, '*invoice*', 0.5, 0.3, '#ffffff', 70], [E.cvInvoice + 2.6, 2, 'it\\'s a LOAN?!', 0.5, 0.65, '#ff6b6b', 90],
  [E.cvRedeem + 2.6, 1.6, 'MINE!', 0.5, 0.22, '#ffe066', 130], [E.cvRide + 1.5, 1.6, 'victory lap', 0.5, 0.25, '#ffffff', 70], [E.cvRide + 4, 1.2, 'BOOM', 0.3, 0.2, '#ff5ca8', 100], [E.cvRide + 6.9, 1.2, 'POP', 0.7, 0.22, '#5ff7ff', 100],
  [E.cvTop + 7.5, 1.6, '*last bite*', 0.5, 0.3, '#ff9ecb', 70], [E.cvCreak + 0.3, 1.8, 'creeeeak', 0.5, 0.3, '#ffffff', 90], [E.cvFine + 0.4, 1.4, 'crunch', 0.5, 0.3, '#ffffff', 90], [E.cvFine + 1.6, 1.8, 'that\\'s the RAILING', 0.5, 0.65, '#ff6b6b', 64],
  [E.cvLean + 0.4, 1.6, '"WHAT A NIGHT!"', 0.5, 0.25, '#ffe066', 80], [E.cvLean + 1.2, 1.2, 'click.', 0.45, 0.5, '#ffffff', 90], [E.cvSpin2 + 1, 1.6, 'NO NO NO', 0.5, 0.25, '#ff6b6b', 110], [E.cvPop2, 1.4, 'POP', 0.5, 0.3, '#ffe066', 150],
  [E.cvPop2 + 2, 1.6, 'AGAIN?!', 0.5, 0.6, '#ff6b6b', 110], [E.cvCarousel + 0.2, 1.6, 'the carousel too?!', 0.5, 0.28, '#ff9ecb', 70], [E.cvChase2 + 1, 1.8, '"STEP RIGHT... BACK!"', 0.5, 0.25, '#ffe066', 64],
  [E.cvRoad + 2, 1.8, 'bye carnival', 0.5, 0.3, '#ffffff', 70], [E.cvBloopInv + 1.4, 1.8, 'WHEEL RETRIEVAL x2', 0.5, 0.3, '#ffffff', 64], [E.cvLast + 1, 1.8, 'rolling... rolling...', 0.5, 0.3, '#ffffff', 64], [E.cvLast + 5.4, 1.6, 'AAAAAA', 0.6, 0.25, '#ff6b6b', 120]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.cvBix + 0.5, 1.0, 1.15, 0.5, 0.4], [E.cvPrize + 1, 1.0, 1.12, 0.6, 0.4], [E.cvHammer + 1.8, 0.8, 1.15, 0.5, 0.4], [E.cvCandy + 4.6, 1.0, 1.15, 0.4, 0.4], [E.cvPop, 1.0, 1.12, 0.5, 0.4], [E.cvGift + 3.2, 1.0, 1.12, 0.5, 0.4], [E.cvInvoice + 2.4, 0.8, 1.15, 0.5, 0.5], [E.cvPop2, 1.0, 1.12, 0.5, 0.4]];")
rline("const SHAKES = ", "const SHAKES = [[E.cvHammer2 + 1.5, 0.5, 0.25], [E.cvTurboOn + 1, E.cvPop - E.cvTurboOn - 1, 0.06], [E.cvPop, 1.2, 0.45], [E.cvPop + 3.6, 0.6, 0.3], [E.cvHay + 1.5, 0.6, 0.35], [E.cvLand, 1.0, 0.5], [E.cvBack + 5.5, 0.8, 0.4], [E.cvSpin2 + 1, E.cvPop2 - E.cvSpin2 - 1, 0.06], [E.cvPop2, 1.2, 0.45], [E.cvLast + 5, 6, 0.06]];")
rline("const FLASH = ", "const FLASH = [[E.cvHammer2 + 1.85, 0.3, '255,240,160'], [E.cvPop, 0.4, '255,255,255'], [E.cvHills - 0.3, 0.6, '255,255,255'], [E.cvLand, 0.3, '255,180,220'], [E.cvBack - 0.8, 1.8, '0,0,0'], [E.cvLights, 0.3, '255,220,160'], [E.cvPop2, 0.4, '255,255,255']];")
rep("outlined('EPISODE 28', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE DRAGON EGG', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it hatched in my hat)'",
    "outlined('EPISODE 29', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE CARNIVAL', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the ferris wheel escapes)'")
rep("outlined(i ? 'EP 29: THE CARNIVAL' : 'EP 27: THE ROAD TRIP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the ferris wheel escapes)' : '(Leggy is driving)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 30: THE SUBMARINE' : 'EP 28: THE DRAGON EGG', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Bloop forgot the windows)' : '(it hatched in my hat)', x + 110, y + 80, 14")
rep("outlined('yep. they hatched.', 0, 0, 56", "outlined('yep. it escaped.', 0, 0, 56")
rep("\"that was my hat.\"", "\"again.\"")
rep("'(all five of them. in my hat.)'", "'(with me in it. and the prize.)'")
rline("const SECS = ", "const SECS = [[0, E.cvHills, carnival, 'carnival'], [E.cvHills, E.cvBack, hills, 'hills'], [E.cvBack, 1e9, carnival, 'carnival']];")
rline("const panic = ", "  const panic = win(T, E.cvPop, E.cvPop + 3) || win(T, E.cvInside + 2, E.cvInside + 5) || win(T, E.cvJump, E.cvLand) || win(T, E.cvPond, E.cvTip) || win(T, E.cvSpin2 + 1, E.cvPop2 + 2) || win(T, E.cvLast + 5, E.freeze);")
rep("if (win(T, E.dgNight + 1, E.dgNest - 0.5)) { const bl", "if (win(T, 9999, 9999)) { const bl")
rep("// sun & moons\n  const night = t >= E.dgNight && t < E.dgDawn;", "// sun & moons\n  const night = t >= E.cvBack;")
rep("sun.color.set(t > E.dusk - 1 && t < 270 ? '#ffc08a' : '#fff1d6')", "sun.color.set(t >= E.cvHills && t < E.cvBack ? '#ffb070' : '#fff1d6')")
rep("""    stamp(T, E.dgSign + 3.5, 'QUEST: RETURN THE EGG');
    stamp(T, E.dgHat + 2.5, 'INCUBATOR: MY HAT');
    stamp(T, E.dgName + 1.5, 'NAME: PIP');
    stamp(T, E.dgPay + 5.4, 'INVOICE: PAID (in gold)');
    stamp(T, E.dgMoms + 2, 'MOM x6');
    drawHeat28(T);""", """    stamp(T, E.cvPrize + 4.5, 'GOAL: 1000 TICKETS');
    stamp(T, E.cvRing2 + 5.5, 'LEGGY: CARNIVAL PRO');
    stamp(T, E.cvPaid + 3, 'BLOOP: PAID ON TIME?!');
    stamp(T, E.cvHills + 3, 'FERRIS WHEEL: ESCAPED');
    stamp(T, E.cvRoll + 0.5, 'BRAKES: MY LEGS');
    stamp(T, E.cvGift + 4.5, 'TICKETS: 1205');
    drawTurbo29(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
