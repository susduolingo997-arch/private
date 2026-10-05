# ep19 scene.js = ep18 head minus its shrink-ray body + body19 + ep18 compositor tail; every replacement must match once
src = open('../ep18/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 18: "THE SHRINK RAY"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body19.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const golden = {", "return mix(sunset, eve, seg(t, E.home + 30, 292));", """  const tropic = { top: '#3aa8ff', bot: '#c8f4ff', sunI: 2.8, hemiI: 1.5, fog: '#c8f0ff', sunEl: 0.9, sunAz: 0.4, near: 80, far: 300 };
  if (t < E.home) return tropic; return mix(sunset, eve, seg(t, E.home + 40, 292));""")
rep("(win(t, E.bug, E.snack) || win(t, E.splash, E.shore) || win(t, E.stomp, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.walk, E.chaseEnd) || win(t, E.fall, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.chase ? 5 : t < E.snack ? 3.5 : t < E.fall ? 5 : 3;")
rep("'☀ DAY 18'", "'☀ DAY 19'")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['gold', t > E.trade && t < E.choc ? 64 : 0], ['plank', 3], ['glass', t > E.bottle && t < E.map ? 1 : 0]];")
cut("  // size readout + distance to the ray — this episode's mechanic", "tiny meters'", """  // treasure map + holes dug — this episode's mechanic
  const ms = mapStep(t); if (ms !== null && t < E.freeze) { rrect(22, 96, 220, 150, 12); ctx.fillStyle = '#f2e6c8'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#8a6a40'; ctx.stroke(); ctx.fillStyle = '#9fd0ff'; ctx.fillRect(32, 106, 200, 104);
    ctx.fillStyle = '#e8d28a'; ctx.beginPath(); ctx.ellipse(76, 180, 34, 22, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(186, 134, 36, 24, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = '#5a3a22'; ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(76, 180); ctx.quadraticCurveTo(120, 110, 186, 134); ctx.stroke(); ctx.setLineDash([]);
    const xx = t > E.map2 + 4 && t < E.home ? 212 : 186, xy = t > E.map2 + 4 && t < E.home ? 122 : 134; outlined('X', xx, xy, 22, '#e8344e', '#5a3a22', 2);
    const k = clamp(ms, 0, 1), px = lerp(76, 186, k), py = lerp(180, 134, k) - Math.sin(k * Math.PI) * 30; if (Math.floor(t * 3) % 2) { ctx.fillStyle = '#ff8a2a'; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill(); }
    outlined('HOLES DUG: ' + holesAt(t), 132, 228, 15, '#5a3a22', '#f2e6c8', 2); }""")
rline("const TOASTS = ", "const TOASTS = [[E.map + 2, '+1 Treasure Map', 'glass'], [E.buildEnd - 1, '+1 Dig-o-Matic', 'castle'], [E.map2 + 2, '+1 Treasure Map (another one)', 'glass'], [E.trade + 3, '+64 Gold Coins', 'gold'], [E.choc + 2, '-64 Gold Coins (melted)', 'gold']];")
rline("const FEATS = ", "const FEATS = [[E.buildEnd + 3, 'Hole in One', 'Dig your first hole'], [E.digEnd - 2, 'Swiss Cheese', 'Dig eleven wrong holes'], [E.trade + 1, 'Fair Trade', 'Swap a robot dome for treasure'], [E.stuck + 2, 'X Marks Me', 'Fall into your own hole']];")
rblock("const POPS = [", """const POPS = [[E.bottle, 1.4, 'clink', 0.5, 0.45, '#9fd0ff', 70], [E.map, 1.6, 'A MAP!', 0.5, 0.3, '#ffe066', 96], [E.leggyDig + 1, 1.4, 'dig dig dig', 0.3, 0.4, '#5ff7ff', 60], [E.buildEnd, 1.4, 'BRRRRRR', 0.6, 0.4, '#ffd400', 84],
  [E.paces + 2, 1.0, 'one...', 0.5, 0.3, '#ffffff', 56], [E.paces + 6, 1.0, 'nine...', 0.5, 0.3, '#ffffff', 56], [E.paces + 10, 1.2, 'twenty-ish?', 0.5, 0.3, '#ffffff', 60], [E.dig1 + 0.4, 1.6, 'BRRRRRR', 0.5, 0.4, '#ffd400', 84], [E.dig1 + 6, 1.4, 'clunk.', 0.5, 0.4, '#ffffff', 70],
  [E.xs + 2, 1.4, 'scritch scritch', 0.5, 0.35, '#e8484a', 60], [E.digAll + 1, 1.2, 'nope', 0.3, 0.4, '#ffffff', 64], [E.digAll + 6, 1.2, 'nope', 0.6, 0.35, '#ffffff', 64], [E.digAll + 11, 1.2, 'NOPE', 0.45, 0.4, '#ff6b6b', 76],
  [E.leggyNose, 1.4, 'sniff sniff', 0.5, 0.35, '#5ff7ff', 64], [E.chest, 1.6, 'TREASURE!', 0.5, 0.3, '#ffd23f', 96], [E.walk, 1.6, '...it moved.', 0.5, 0.35, '#ffffff', 70], [E.walk + 2, 1.6, 'MY HOUSE!', 0.5, 0.25, '#ff8a5a', 96],
  [E.chase + 1, 1.2, 'snip snip', 0.5, 0.3, '#ff8a5a', 72], [E.snack + 1, 1.4, 'munch', 0.5, 0.4, '#ffe066', 70], [E.shell + 3, 1.6, 'ooooh', 0.5, 0.3, '#5ff7ff', 80], [E.bloopPaid, 1.6, 'PAID?!', 0.4, 0.35, '#7cff6b', 90],
  [E.melt + 2, 1.4, 'drip...', 0.42, 0.45, '#ffffff', 64], [E.choc, 1.6, 'CHOCOLATE?!', 0.5, 0.3, '#c07a3a', 96], [E.fall, 1.6, 'FWUMP', 0.5, 0.4, '#e8d28a', 100], [E.tidein + 2, 1.4, 'splish', 0.5, 0.5, '#9fd0ff', 70], [E.crab + 0.4, 1.4, 'CLONK', 0.5, 0.35, '#3d7bff', 90]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.map, 0.8, 1.15, 0.5, 0.5], [E.walk, 1.0, 1.15, 0.5, 0.5], [E.choc, 1.0, 1.2, 0.4, 0.6], [E.fall, 0.8, 1.15, 0.5, 0.6]];")
rline("const SHAKES = ", "const SHAKES = [[E.buildEnd, 3, 0.08], [E.dig1, 6, 0.06], [E.digAll, 16, 0.04], [E.walk, 1, 0.2], [E.chase, 16, 0.05], [E.fall, 0.8, 0.35]];")
rline("const FLASH = ", "const FLASH = [[E.chest + 0.4, 0.3, '255,230,120'], [E.cave, 0.3, '0,0,0']];")
rep("outlined('EPISODE 18', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE SHRINK RAY', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we\\'re tiny now)'",
    "outlined('EPISODE 19', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TREASURE MAP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(X marks the wrong spot)'")
rep("outlined(i ? 'EP 19: THE TREASURE MAP' : 'EP 17: THE TIME MACHINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(X marks the wrong spot)' : '(Bloop built it. uh oh.)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 20: THE BIG STORM' : 'EP 18: THE SHRINK RAY', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(hold on to the hat)' : '(we\\'re tiny now)', x + 110, y + 80, 14")
rep("outlined('yep. it hit the wrong guy.', 0, 0, 52", "outlined('yep. it was chocolate.', 0, 0, 56")
rep("\"that's me. bug hug.\"", "\"that's me. X marks me.\"")
rep("'(Muffin is the biggest now)'", "'(Leggy ate the treasure)'")
rline("const SECS = ", "const SECS = [[0, E.isle, beach, 'beach'], [E.isle, E.home, isle, 'isle'], [E.home, 1e9, beach, 'beach']];")
rline("const panic = ", "  const panic = win(T, E.walk, E.chaseEnd) || win(T, E.fall, E.stuck);")
rep("if (win(T, E.boat, E.sail)) { const bl", "if (win(T, E.build, E.buildEnd)) { const bl")
rep("""    stamp(T, E.zap + 3.6, 'SIZE: 1%');
    stamp(T, E.zap2 + 3.6, 'MUFFIN: 800%');""", """    stamp(T, E.map2 + 1, 'TREASURE: ANOTHER MAP');
    stamp(T, E.choc + 1, 'GOLD: 0%  COCOA: 100%');""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
