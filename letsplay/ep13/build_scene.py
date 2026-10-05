# ep13 scene.js = ep12 head (shared cast/props of ep6-12) + body13 + ep12 compositor tail; every replacement must match once
src = open('../ep12/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: camp (party prep + sunset party)')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body13.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[22.0, 'Nature walk! Totally normal!']", "]];", """  const Q = [[11.0, 'Flawless start. Obviously.'], [64.0, 'See ya, losers!'], [128.4, 'Out of my way, rocks!'], [130.2, 'OW. Rocks.'], [195.4, 'BOOST!'], [222.0, 'A CUPCAKE?!'], [258.2, 'Rematch. REMATCH.']];""")
cut("  if (t < E.party - 12) return day;", "return mix(day, sunset, ss(seg(t, E.party - 12, E.party + 4)));", """  const haze = { top: '#7a3a3a', bot: '#ffb070', sunI: 1.8, hemiI: 1.2, fog: '#c88a6a', sunEl: 0.4, sunAz: 0.6, near: 30, far: 160 };
  if (t < E.canyon) return day;
  if (t < E.final) return haze;
  return mix(day, sunset, ss(seg(t, 240, 285)));""")
rline("const hpv = ", "  const hpv = t < E.crash ? 5 : t < E.barge ? 4 : t < E.finish ? 4.5 : 3.5;")
rep("'☀ DAY 12'", "'☀ DAY 13'")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['jam', 0], ['glass', 0], ['plank', 0]];")
rline("let sel = 0;", "  let sel = 0;")
cut("  // Surprise meter: how suspicious is Leggy?", "ctx.fillStyle = sv > 0.7 ? '#ff6b6b' : '#ff9ad8'; ctx.fill(); } }", """  // race standings + track map (this episode's mechanic)
  if (t > E.go && t < E.finish) { const names = { leggy: 'LEGGY', prestin: 'PRESTIN', bloop: 'BLOOP', bot: 'BONK-BOT' }, cols = { leggy: '#ff8a2a', prestin: '#ffd23f', bloop: '#ff6fb8', bot: '#9aa4bd' };
    const order = Object.keys(names).sort((a, b) => progress(b, t) - progress(a, t)); rrect(22, 196, 220, 118, 12); ctx.fillStyle = 'rgba(10,14,30,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffe066'; ctx.stroke();
    outlined('STANDINGS', 132, 214, 15, '#ffe066', '#000', 3); order.forEach((w, i) => outlined((i + 1) + '. ' + names[w], 40, 238 + i * 19, 15, cols[w], '#000', 3, 'left'));
    rrect(W / 2 - 220, 64, 440, 8, 4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill(); order.forEach(w => { const f = clamp(progress(w, t) / 420, 0, 1); ctx.fillStyle = cols[w]; ctx.beginPath(); ctx.arc(W / 2 - 220 + 440 * f, 68, 7, 0, 7); ctx.fill(); }); }""")
rline("const TOASTS = ", "const TOASTS = [[E.kartEnd, '+1 Kart (Bloop-made)', 'plank'], [E.wheel + 1, '-1 Wheel', 'plank'], [E.boost, 'TURBO: Puff', 'flower'], [E.podium + 1, '+1 Gold Cup (Muffin)', 'crown']];")
rline("const FEATS = ", "const FEATS = [[E.crash + 2, 'Off-Road', 'Boost into a dune'], [E.baby + 4, 'Gentle Giant', 'Help a baby pebbleback'], [E.conveyor + 6, 'Rock Express', 'Ride a pebbleback herd'], [E.photoEnd + 0.4, 'Photo Finish', 'Lose to a cupcake']];")
rblock("const POPS = [", """const POPS = [[E.count + 0.2, 1.0, '3', 0.5, 0.4, '#ffe066', 120], [E.count + 1.3, 1.0, '2', 0.5, 0.4, '#ffe066', 120], [E.count + 2.4, 1.0, '1', 0.5, 0.4, '#ffe066', 120], [E.go, 1.6, 'GO!!', 0.5, 0.4, '#7cff6b', 130],
  [E.wheel, 1.2, 'boing', 0.6, 0.4, '#ffffff', 56], [E.boost, 1.6, 'TURBO!', 0.5, 0.3, '#ff6a1a', 88], [E.crash, 1.4, 'POOF', 0.5, 0.4, '#c8c2be', 80], [E.pebbles + 2, 1.4, 'roll roll roll', 0.6, 0.3, '#c8a088', 54],
  [E.barge, 1.4, 'BONK', 0.4, 0.3, '#ffe066', 76], [E.conveyor + 1, 1.6, 'ROCK EXPRESS!', 0.5, 0.26, '#ffb43a', 70], [E.motor + 1, 1.4, 'VROOOM', 0.5, 0.3, '#ffd400', 76], [E.finish, 1.8, 'CRASH!', 0.5, 0.3, '#ffffff', 96],
  [E.photoEnd - 5.8, 1.8, 'MUFFIN WINS?!', 0.5, 0.26, '#ff9ad8', 84], [E.fans, 1.4, 'roll!', 0.7, 0.4, '#c8a088', 60]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.go, 0.8, 1.15, 0.5, 0.5], [E.crash, 0.8, 1.2, 0.5, 0.5], [E.barge, 0.8, 1.2, 0.5, 0.5], [E.finish, 1.0, 1.25, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.go, 16, 0.04], [E.boost, 6.4, 0.12], [E.crash, 1, 0.35], [E.conveyor, 15, 0.06], [E.final, 18, 0.05], [E.finish, 1.4, 0.45]];")
rline("const FLASH = ", "const FLASH = [[E.go, 0.2, '255,255,255'], [E.photo, 0.3, '255,255,255']];")
rep("outlined('EPISODE 12', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE BIRTHDAY', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Leggy turns one)'",
    "outlined('EPISODE 13', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE GRAND RACE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(six legs vs. wheels)'")
rep("outlined(i ? 'EP 13: THE GRAND RACE' : 'EP 11: THE HEIST', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(six legs vs. wheels)' : '(it was already mine)'",
    "outlined(i ? 'EP 14: THE HAUNTED MINE' : 'EP 12: THE BIRTHDAY', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it\\'s not haunted)' : '(it exploded)'")
rep("'yep. it exploded.'", "'yep. the cupcake won.'")
rep("ctx.translate(W * 0.25, H * 0.22); ctx.rotate(-0.08); outlined('yep. the cupcake won.', 0, 0, 72", "ctx.translate(W * 0.34, H * 0.22); ctx.rotate(-0.08); outlined('yep. the cupcake won.', 0, 0, 60")
rep("\"that's me. covered in frosting.\"", "\"that's me. second place.\"")
rep("'(happy birthday, Leggy)'", "'(Muffin is undefeated)'")
rline("const SECS = ", "const SECS = [[0, E.canyon, stadium, 'stadium'], [E.canyon, E.final, canyon, 'canyon'], [E.final, 1e9, stadium, 'stadium']];")
rline("const panic = ", "  const panic = win(T, E.boost, E.crash) || win(T, 200.8, E.finish + 1);")
rep("if (win(T, E.tier1, E.banner)) { const bl", "if (win(T, E.kart, E.kartEnd)) { const bl")
cut("    if (win(T, E.plan, E.planEnd))", "stamp(T, E.toast - 1.6, 'HAPPY BIRTHDAY LEGGY');", """    if (win(T, E.photo, E.photoEnd)) { const k = ss(seg(T, E.photo, E.photo + 0.3)) * (1 - ss(seg(T, E.photoEnd - 0.3, E.photoEnd))); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.5, H * 0.45); ctx.rotate(-0.03);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-260, -170, 520, 330); ctx.fillStyle = '#222'; ctx.fillRect(-240, -150, 480, 250); outlined('PHOTO FINISH', 0, 130, 30, '#222', '#fff', 2);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(-10, -150, 6, 250); const zz = seg(T, E.photo + 2, E.photo + 7); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(-120 + zz * 20, -40, 110, 70); ctx.fillStyle = '#ff9ad8'; ctx.fillRect(-28 + zz * 20, -80, 30, 30); ctx.fillStyle = '#e8344e'; ctx.fillRect(-12 + zz * 20, -92, 12, 12);
      ctx.fillStyle = '#ffd23f'; ctx.fillRect(-150, 30, 120, 30); ctx.fillStyle = '#ff6fb8'; ctx.fillRect(-170, 60, 90, 30);
      if (T > E.photo + 7.2) { outlined('WINNER: MUFFIN', 0, -120, 34, '#ffe066', '#000', 6); outlined('(by one cherry)', 0, -86, 20, '#ffffff', '#000', 4); } ctx.restore(); }
    stamp(T, E.podium + 0.6, 'MUFFIN: CHAMPION');""")
rep("(t > E.launch && t < E.boom + 1)", "(t > E.boost && t < E.crash)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
