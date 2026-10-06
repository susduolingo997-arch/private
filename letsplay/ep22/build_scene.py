# ep22 scene.js = ep21 head (incl. ep21 helpers) minus ep21's sets + body22 + ep21 compositor tail; every replacement must match once
src = open('../ep21/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: the yard (couch trouble')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body22.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const candy = {", "seg(t, E.bye, 290));", """  const nite = { top: '#070a26', bot: '#26305e', sunI: 0.8, hemiI: 0.85, fog: '#1a2246', sunEl: -0.3, sunAz: 2.6, near: 30, far: 130 };
  const festive = { ...nite, top: '#14103a', bot: '#4a2a6a', fog: '#2a2050', hemiI: 1.0 };
  if (t < E.arrive) return mix(sunset, eve, seg(t, 0, E.arrive)); if (t < E.prep) return nite; return festive;""")
rep("(win(t, E.snap, E.snap + 3) || win(t, E.bolt, E.chaseEnd) || win(t, E.laps, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.midnight, E.faint) || win(t, E.skull, E.drop + 4) || win(t, E.boo, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.midnight ? 5 : t < E.hug ? 3.5 : t < E.boo ? 5 : t < E.brake ? 3 : 2;")
rep("outlined('☀ DAY 21', W / 2, 32, 18,", "outlined(t > E.arrive ? '☾ NIGHT 22' : '☀ DAY 22', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['ticket', win(t, E.ticket + 6, E.board) ? 1 : 0], ['lantern', t > E.walk && t < E.prep ? 1 : 0], ['plank', win(t, E.prep, E.prepEnd) ? 64 : 3]];")
rep("  // seats vs butts — this episode's mechanic\n  drawSeats(t);", "  // spook-o-meter — this episode's mechanic\n  drawSpook(t);")
rep("function drawFacecam(t) { drawCam(t, 0, 16); drawCam(t, 1, 176); drawCam(t, 2, 336); }", "function drawFacecam(t) { drawCam(t, 0, 16); }")
rep("const x = W - 250 + (1 - k) * 280, y = 500;", "const x = W - 250 + (1 - k) * 280, y = 186;")
rline("const TOASTS = ", """ICON.ticket = (x, y, s) => { ctx.fillStyle = '#7ff5e6'; ctx.fillRect(x - s, y - s * 0.5, s * 2, s); ctx.fillStyle = '#1b4a6a'; ctx.fillRect(x - s * 0.7, y - s * 0.15, s * 1.4, s * 0.3); };
ICON.lantern = (x, y, s) => { ctx.fillStyle = '#333'; ctx.fillRect(x - s * 0.6, y - s * 0.9, s * 1.2, s * 0.25); ctx.fillStyle = '#fff3a0'; ctx.fillRect(x - s * 0.5, y - s * 0.6, s, s * 1.2); };
const TOASTS = [[E.ticket + 7, '+1 Ghost Ticket', 'ticket'], [E.detectorEnd, '+1 Spook-o-Meter', 'shard'], [E.punch + 1.4, 'Ticket: PUNCHED', 'ticket'], [E.prepEnd - 2, '+14 Lanterns', 'lantern']];""")
rline("const FEATS = ", "const FEATS = [[E.faint + 1.5, 'Down Bad', 'Faint at the sight of a ghost'], [E.drop + 4.5, 'Lights Out', 'Survive the drop'], [E.hug + 2, 'Ghost Hugger', 'Hug something you can see through'], [E.hit + 2, 'Grand Opening', 'Sell out a haunted ride']];")
rblock("const POPS = [", """const POPS = [[E.whistle, 1.8, 'WHOOOOO...', 0.5, 0.25, '#7ff5e6', 80], [E.ticket + 6, 1.4, 'a ticket?', 0.45, 0.4, '#ffffff', 60], [E.scared + 1, 1.4, 'nope.', 0.56, 0.42, '#9fdc5a', 70], [E.test + 1, 1.2, 'beep', 0.3, 0.4, '#ffe066', 60], [E.test + 3, 1.2, 'beep...', 0.6, 0.4, '#ffe066', 60],
  [E.lantern, 1.4, 'FLAP FLAP', 0.6, 0.3, '#ffffff', 80], [E.midnight, 1.2, 'DONG', 0.6, 0.25, '#ffe066', 100], [E.midnight + 1.6, 1.2, 'DONG', 0.6, 0.35, '#ffe066', 80], [E.trainIn + 2, 1.8, 'CHOO... CHOOOO...', 0.35, 0.3, '#7ff5e6', 70],
  [E.wisp + 1, 2.0, 'TICKETS, PLEASE', 0.62, 0.3, '#ffffff', 64], [E.faint, 1.4, '*thud*', 0.4, 0.5, '#9fdc5a', 70], [E.punch + 0.4, 1.2, 'CLICK', 0.55, 0.45, '#ffffff', 80], [E.depart, 1.6, 'ALL ABOARD', 0.5, 0.3, '#7ff5e6', 80],
  [E.skull + 2, 1.6, 'ROAAAR', 0.6, 0.3, '#ff8fd8', 100], [E.flappers, 1.4, 'flapflapflap', 0.5, 0.3, '#ffffff', 70], [E.drop, 1.8, 'WHEEEEE', 0.5, 0.25, '#ffe066', 100], [E.stop, 1.6, 'END OF THE LINE', 0.5, 0.3, '#7ff5e6', 70],
  [E.twist + 2, 1.8, 'sigh.', 0.62, 0.35, '#8fa0ff', 70], [E.hug + 0.6, 1.6, 'hug.', 0.62, 0.35, '#ff8fd8', 90], [E.faint2, 1.4, '*thud* (again)', 0.4, 0.4, '#9fdc5a', 60], [E.opening + 1, 1.6, 'SNIP!', 0.5, 0.3, '#ff6b6b', 100],
  [E.opening - 1.4, 1.6, 'GRAND OPENING!', 0.5, 0.22, '#ff9ad0', 70], [E.boo, 1.6, 'BOO!', 0.5, 0.3, '#ffffff', 120], [E.lever, 1.6, 'FULL SPEED?!', 0.5, 0.3, '#ff6b6b', 80], [E.hit, 1.8, 'BEST RIDE EVER', 0.5, 0.25, '#7cff6b', 80],
  [E.snap, 1.4, 'SNAP', 0.5, 0.35, '#ffffff', 100], [E.brake, 1.6, 'SKRRRRT', 0.5, 0.35, '#ffa02a', 90], [E.climb + 4.2, 1.6, 'TOOT TOOT', 0.5, 0.3, '#ffe066', 90], [E.warn, 1.6, 'TOO FAST', 0.5, 0.3, '#ff6b6b', 90], [E.derail, 1.6, 'WHEEEE', 0.5, 0.25, '#7ff5e6', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.whistle, 0.8, 1.12, 0.5, 0.5], [E.wisp + 1, 1.0, 1.12, 0.5, 0.45], [E.faint, 0.6, 1.1, 0.5, 0.6], [E.twist, 1.4, 1.1, 0.5, 0.5], [E.boo, 0.8, 1.2, 0.5, 0.4]];")
rline("const SHAKES = ", "const SHAKES = [[E.midnight, 0.6, 0.1], [E.midnight + 1.6, 0.6, 0.1], [E.skull + 2, 1.4, 0.15], [E.drop, 4, 0.06], [E.boo + 1.1, 0.6, 0.25], [E.lever, 1.2, 0.2], [E.lever + 1.2, 63, 0.04], [E.derail, 1, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.midnight, 0.25, '160,250,255'], [E.trainIn + 4, 0.3, '160,250,255'], [E.hug + 0.6, 0.4, '255,160,220'], [E.boo, 0.2, '255,255,255']];")
rep("outlined('EPISODE 21', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THREE OF ME', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we need a bigger couch)'",
    "outlined('EPISODE 22', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE GHOST TRAIN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(next stop: AAAAH)'")
rep("outlined(i ? 'EP 22: THE GHOST TRAIN' : 'EP 20: THE TIME MACHINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(next stop: AAAAH)' : '(it works. really.)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 23: THE BAKE-OFF' : 'EP 21: THREE OF ME', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the cake fights back)' : '(we need a bigger couch)', x + 110, y + 80, 14")
rep("outlined('yep. it fits.', 0, 0, 56", "outlined(\"yep. it's haunted.\", 0, 0, 56")
rep("\"all of us. in there.\"", "\"by him.\"")
rep("'(it does not fit)'", "'(the ride: 10/10)'")
rline("const SECS = ", "const SECS = [[0, E.arrive, yard, 'yard'], [E.arrive, E.tunnel, station, 'station'], [E.tunnel, E.prep, tunnel, 'tunnel'], [E.prep, 1e9, station, 'station']];")
rline("const panic = ", "  const panic = win(T, E.skull + 2, E.skull + 5) || win(T, E.boo, E.lever + 3) || win(T, E.warn, E.freeze);")
rep("if (win(T, E.wagon, E.wagonEnd)) { const bl", "if (win(T, E.detector, E.detectorEnd) || win(T, E.prep, E.prepEnd)) { const bl")
rep("// sun & moons\n  const night = false;", "// sun & moons\n  const night = t > E.arrive - 6 && !cave;")
rep("""    stamp(T, E.snap + 0.8, 'COUCH: DECEASED');
    stamp(T, E.squint + 7, 'TEAM ME, ME & ME');
    stamp(T, E.win + 0.8, 'WINNERS (TECHNICALLY)');
    stamp(T, E.alive + 0.6, 'PRIZE: ALIVE');
    stamp(T, E.sitAll + 1.6, 'SEATS 12. BUTTS 6. FINALLY.');
    drawFlyer(T);""", """    stamp(T, E.midnight + 0.4, 'MIDNIGHT');
    stamp(T, E.twist + 0.6, 'GHOST STATUS: LONELY');
    stamp(T, E.hit + 3, 'RIDE STATUS: SOLD OUT');
    drawTicket(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
