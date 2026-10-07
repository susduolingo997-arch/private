# ep23 scene.js = ep22 head (incl. ep21+ep22 helpers) minus ep22's sets + body23 + ep22 compositor tail; every replacement must match once
src = open('../ep22/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 22: "THE GHOST TRAIN')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body23.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const nite = {", "if (t < E.prep) return nite; return festive;", """  const morning = { top: '#7ec8ff', bot: '#fff0d0', sunI: 2.6, hemiI: 1.55, fog: '#ffeedd', sunEl: 0.5, sunAz: -0.6, near: 70, far: 230 };
  const warm = { top: '#ffb070', bot: '#ffe0b0', sunI: 2.0, hemiI: 1.5, fog: '#ffd8a8', sunEl: 0.7, sunAz: 0.6, near: 60, far: 200 };
  if (t < E.tent) return morning; if (t < E.square) return warm; return mix(mix(sunset, eve, seg(t, E.calm, 280)), { ...eve, top: '#2a1c5a', bot: '#ff7a6a' }, seg(t, 270, 292) * 0.5);""")
rep("(win(t, E.midnight, E.faint) || win(t, E.skull, E.drop + 4) || win(t, E.boo, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.poof, E.poof + 2) || win(t, E.panic, E.fights + 6) || win(t, E.chase, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.poof ? 5 : t < E.tent ? 4 : t < E.frost ? 5 : t < E.place ? 3 : t < E.throwPie ? 5 : 4;")
rep("outlined(t > E.arrive ? '☾ NIGHT 22' : '☀ DAY 22', W / 2, 32, 18,", "outlined('☀ DAY 23', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', t < E.sugar ? 1 : 0], ['whisk', win(t, E.whisk, E.fights) ? 1 : 0], ['cake', t > E.reveal ? 1 : 0], ['pie', t > E.piegrab ? 0 : 3]];")
rep("  // spook-o-meter — this episode's mechanic\n  drawSpook(t);", "  // cake size / bake timer — this episode's mechanic\n  drawCake(t);")
rline("const TOASTS = ", """ICON.whisk = (x, y, s) => { ctx.strokeStyle = '#d0d0d8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - s, y + s); ctx.lineTo(x, y); ctx.stroke(); ctx.beginPath(); ctx.ellipse(x + s * 0.4, y - s * 0.4, s * 0.5, s * 0.8, -0.8, 0, 7); ctx.stroke(); };
ICON.cake = (x, y, s) => { ctx.fillStyle = '#ff8fc8'; ctx.fillRect(x - s, y, s * 2, s * 0.8); ctx.fillStyle = '#ffe6b0'; ctx.fillRect(x - s * 0.7, y - s * 0.6, s * 1.4, s * 0.6); ctx.fillStyle = '#fff'; ctx.fillRect(x - s, y - 2, s * 2, 4); ctx.fillStyle = '#5ff7ff'; ctx.fillRect(x - 2, y - s, 4, s * 0.4); };
ICON.pie = (x, y, s) => { ctx.fillStyle = '#d9a35f'; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.5, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#ff8fc8'; ctx.beginPath(); ctx.ellipse(x, y - 2, s * 0.8, s * 0.35, 0, 0, 7); ctx.fill(); };
const TOASTS = [[E.mix - 1, '+1 Turbo-Oven', 'plank'], [E.sugar + 2, '+1 Shard Sugar (??)', 'shard'], [E.reveal + 2, '+1 Cake (alive)', 'cake'], [E.award + 2, 'Bloop: GOLDEN WHISK', 'whisk']];""")
rline("const FEATS = ", "const FEATS = [[E.poof + 3, 'Flour Power', 'Explode an oven'], [E.alive + 2, 'Secret Ingredient', 'Bake something with feelings'], [E.crunch + 2, 'Built Different', 'Bake a cake nobody can eat'], [E.award + 3, 'Underdog', 'Help Bloop win something']];")
rblock("const POPS = [", """const POPS = [[E.ovenB + 2, 1.4, 'TURBO-OVEN', 0.62, 0.3, '#ffe066', 70], [E.test + 1.5, 1.2, 'rumble...', 0.6, 0.4, '#ffffff', 56], [E.poof, 1.6, 'POOF', 0.6, 0.35, '#ffffff', 120], [E.letter + 0.4, 1.2, 'mail!', 0.4, 0.4, '#ffe066', 64], [E.sugar + 1, 1.4, 'sparkle', 0.5, 0.35, '#5ff7ff', 64],
  [E.judgeIn + 1, 1.8, '*monocle adjust*', 0.5, 0.25, '#ffd23f', 56], [E.bake, 1.4, 'DING! BAKE!', 0.5, 0.3, '#ffe066', 96], [E.egg + 1, 1.2, 'splat', 0.5, 0.42, '#ffd23f', 70], [E.brick + 2, 1.4, 'tap tap tap', 0.5, 0.4, '#ffffff', 56], [E.sugar2, 1.4, 'just a pinch', 0.4, 0.35, '#5ff7ff', 56],
  [E.glow, 1.6, 'hummmm', 0.42, 0.42, '#c08aff', 70], [E.ding, 1.4, 'DING', 0.5, 0.3, '#ffe066', 100], [E.judgeDuke + 2, 1.6, '8/10', 0.5, 0.3, '#7cff6b', 96], [E.judgeLump + 2, 1.6, '4/10 (asleep)', 0.5, 0.3, '#ffa02a', 70], [E.judgeBrick + 2, 1.4, 'CRACK', 0.5, 0.35, '#ffffff', 100],
  [E.judgeBrick + 4, 1.6, '2/10. it is a brick.', 0.5, 0.3, '#ff6b6b', 56], [E.reveal, 1.4, 'TA-DA?', 0.4, 0.3, '#ff8fc8', 90], [E.alive, 1.2, 'blink', 0.4, 0.4, '#ffffff', 60], [E.chomp1 + 0.6, 1.4, 'CHOMP', 0.5, 0.35, '#ff8fc8', 110], [E.chomp2 + 0.6, 1.4, 'CHOMP', 0.6, 0.35, '#ff8fc8', 110],
  [E.panic + 0.4, 1.4, '*faints*', 0.4, 0.45, '#d9a35f', 64], [E.burst, 1.6, 'KABOOM', 0.5, 0.25, '#ff8fc8', 110], [E.square + 1.4, 1.4, 'THUD', 0.4, 0.4, '#ffffff', 110], [E.stomp, 1.6, 'ROAAAR', 0.4, 0.3, '#ff8fc8', 96], [E.frost + 1.2, 1.4, 'SPLAT', 0.6, 0.4, '#fff4fa', 110],
  [E.whisk + 1, 1.2, 'clang', 0.5, 0.4, '#d0d0d8', 70], [E.whisk + 3, 1.2, 'CLANG', 0.5, 0.35, '#d0d0d8', 80], [E.leggyBite, 1.4, 'NOM', 0.3, 0.4, '#ff8fc8', 100], [E.feast + 1, 1.6, 'nom nom nom', 0.5, 0.3, '#ff8fc8', 70], [E.fights, 1.6, 'FROSTING CANNON', 0.5, 0.25, '#fff4fa', 64],
  [E.crunch + 0.2, 1.6, 'CRUNCH', 0.5, 0.35, '#b5652e', 120], [E.cry, 1.6, 'waaah', 0.4, 0.3, '#5ff7ff', 80], [E.award, 1.8, 'WINNER: BLOOP', 0.5, 0.25, '#ffd23f', 84], [E.photo + 6, 1.4, 'CLICK', 0.5, 0.3, '#ffffff', 90], [E.notice, 1.4, '...', 0.3, 0.4, '#ffffff', 90],
  [E.piegrab + 2.6, 1.4, 'a pie.', 0.62, 0.4, '#ff8fc8', 70], [E.chase + 2, 1.4, 'NO NO NO', 0.5, 0.3, '#ff6b6b', 90], [E.throwPie, 1.6, 'YEET', 0.4, 0.3, '#ff8fc8', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.poof, 0.8, 1.12, 0.5, 0.5], [E.alive, 1.0, 1.2, 0.5, 0.5], [E.judgeBrick + 2, 0.8, 1.15, 0.5, 0.45], [E.crunch, 1.0, 1.15, 0.5, 0.5], [E.notice, 1.0, 1.2, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.poof, 1, 0.3], [E.chomp1 + 0.6, 0.5, 0.12], [E.chomp2 + 0.6, 0.5, 0.15], [E.burst, 1.4, 0.4], [E.square + 1.4, 1, 0.5], [E.stomp, 4, 0.08], [E.fights, 6, 0.06], [E.crunch, 0.6, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.poof, 0.5, '255,255,255'], [E.sugar2, 0.25, '160,250,255'], [E.burst, 0.3, '255,160,220'], [E.photo + 6, 0.3, '255,255,255']];")
rep("outlined('EPISODE 22', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE GHOST TRAIN', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(next stop: AAAAH)'",
    "outlined('EPISODE 23', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE BAKE-OFF', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(the cake fights back)'")
rep("outlined(i ? 'EP 23: THE BAKE-OFF' : 'EP 21: THREE OF ME', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the cake fights back)' : '(we need a bigger couch)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 24: THE LIGHTHOUSE' : 'EP 22: THE GHOST TRAIN', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(the light is a fish)' : '(next stop: AAAAH)', x + 110, y + 80, 14")
rep("outlined(\"yep. it's haunted.\", 0, 0, 56", "outlined('yep. it fights back.', 0, 0, 56")
rep("\"by him.\"", "\"pie: 1. me: 0.\"")
rep("'(the ride: 10/10)'", "'(it was a fair hit)'")
rline("const SECS = ", "const SECS = [[0, E.tent, yard, 'yard'], [E.tent, E.square, tent, 'tent'], [E.square, 1e9, square, 'square']];")
rline("const panic = ", "  const panic = win(T, E.panic, E.burst + 2) || win(T, E.stomp, E.stomp + 3) || win(T, E.fights, E.fights + 6) || win(T, E.chase, E.freeze);")
rep("if (win(T, E.detector, E.detectorEnd) || win(T, E.prep, E.prepEnd)) { const bl", "if (win(T, E.ovenB, E.mix) || win(T, E.bake + 4, E.ovenIn)) { const bl")
rep("// sun & moons\n  const night = t > E.arrive - 6 && !cave;", "// sun & moons\n  const night = false;")
rep("""    stamp(T, E.midnight + 0.4, 'MIDNIGHT');
    stamp(T, E.twist + 0.6, 'GHOST STATUS: LONELY');
    stamp(T, E.hit + 3, 'RIDE STATUS: SOLD OUT');
    drawTicket(T);""", """    stamp(T, E.poof + 1, 'TEST CAKE: FAILED');
    stamp(T, E.alive + 1.4, 'CAKE STATUS: ALIVE');
    stamp(T, E.crunch + 1.4, 'TEETH: 0');
    drawLetter(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
