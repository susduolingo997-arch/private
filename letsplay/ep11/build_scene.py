# ep11 scene.js = ep10 head (shared cast/props of ep6-10) + body11 + ep10 compositor tail; every replacement must match once
src = open('../ep10/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: launch beach')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body11.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[7.4, 'First YouTubers on the moon!']", "]];", """  const Q = [[15.0, 'Distraction? I was BORN for this.'], [68.6, 'Party time, Shardwild!!'], [74.6, 'The goose has MOVES.'], [176.8, 'Uh... keep dancing?'], [206.8, 'Did the robot just...?'], [229.2, 'Surprise! Happy crown day!'], [277.2, 'Anytime, buddy.'], [281.9, '...Flawless. Obviously.']];""")
cut("  const dark = { top: '#05081a'", "return mix(day, sunset, 0.5 + 0.5 * ss(seg(t, E.home, 285)));", """  const nightS = { top: '#070b22', bot: '#1f2350', sunI: 0.35, hemiI: 0.7, fog: '#141838', sunEl: 0.45, sunAz: -2.0, near: 40, far: 170 };
  if (t < E.town) return mix(sunset, nightS, 0.35 * seg(t, 20, E.town));
  return nightS;""")
rline("const hpv = ", "  const hpv = t < E.pots ? 5 : t < E.alarm ? 4.5 : t < E.splash ? 3.5 : 4.5;")
rep("'☀ DAY 10'", "'☾ NIGHT 11'")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', t > E.crownOn ? 1 : 0], ['glass', 1], ['castle', 0], ['jam', 0], ['flower', 1], ['shard', t > E.glow ? 1 : 0]];")
rline("let sel = 0;", "  let sel = 0; if (t > E.crownOn) sel = 1;")
cut("  // Puff Power fuel gauge (this episode's mechanic)", "ctx.fillStyle = pw < 20 ? '#ff4a2a' : '#ffb43a'; ctx.fill(); }", """  // Stealth meter (this episode's mechanic)
  if (t > E.sneak && t < E.goose) { const sv = stealth(t), gx = 22, gy = 196, det = sv >= 1; rrect(gx, gy, 220, 40, 12); ctx.fillStyle = 'rgba(10,10,30,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = det && Math.floor(t * 6) % 2 ? '#ff2a4a' : '#5ff7ff'; ctx.stroke();
    outlined(det ? 'DETECTED!' : 'STEALTH', gx + 12, gy + 20, 14, det ? '#ff6b6b' : '#5ff7ff', '#000', 3, 'left'); rrect(gx + 112, gy + 13, 96, 14, 7); ctx.fillStyle = '#333'; ctx.fill(); rrect(gx + 112, gy + 13, 96 * clamp(1 - sv, 0.02, 1), 14, 7); ctx.fillStyle = sv > 0.6 ? '#ff6b6b' : '#7cff6b'; ctx.fill(); }""")
rline("const TOASTS = ", "const TOASTS = [[E.open + 1, '+20 Crowns (fake)', 'crown'], [E.crownOn, '+1 Crown (REAL)', 'crown'], [E.marbles + 0.5, '-1 Bag of Marbles', 'flower'], [E.receipt + 1, 'Receipt: PAID IN FULL', 'shard']];")
rline("const FEATS = ", "const FEATS = [[E.roof + 0.4, 'Spider Express', 'Climb a wall on Leggy'], [118.6, 'Limbo Legend', 'Dodge a laser grid'], [E.glow + 1, 'Shard Detector', 'Find the real crown with Puff'], [E.receipt + 4.6, 'Criminal Mastermind', 'Steal something you already own']];")
rblock("const POPS = [", """const POPS = [[E.bot, 1.4, 'BEEP. BOOP.', 0.6, 0.3, '#ff6b6b', 60], [E.hide, 1.2, 'shhh!', 0.4, 0.4, '#ffffff', 64], [E.party, 1.4, 'PARTY!', 0.5, 0.3, '#ff5cf0', 80], [E.gooseDance, 1.4, 'HONK!', 0.6, 0.35, '#ffffff', 72],
  [E.lasers, 1.4, 'zzzt', 0.5, 0.3, '#ff2a3a', 66], [E.pots, 1.6, 'CLANG CLANG', 0.4, 0.4, '#c98f4c', 72], [E.open, 1.6, 'TWENTY?!', 0.5, 0.28, '#ffd23f', 86], [E.glow, 1.6, 'GLOW!', 0.5, 0.3, '#5ff7ff', 80],
  [E.alarm, 2.0, 'WEE-OOO!', 0.5, 0.28, '#ff2a3a', 92], [E.marbles, 1.2, 'clatter', 0.4, 0.45, '#5aa8ff', 56], [E.splash, 1.6, 'SPLOOSH', 0.5, 0.3, '#5aa8ff', 86], [E.receipt, 1.6, 'PAID?!', 0.5, 0.3, '#7cff6b', 84]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.bot, 0.8, 1.15, 0.5, 0.5], [E.open, 1.0, 1.25, 0.5, 0.5], [E.glow, 0.8, 1.2, 0.5, 0.5], [E.alarm, 1.0, 1.2, 0.5, 0.5], [E.receipt, 1.0, 1.25, 0.5, 0.4]];")
rline("const SHAKES = ", "const SHAKES = [[E.pots, 1, 0.25], [E.alarm, 1.2, 0.2], [E.jumpDown + 2, 0.6, 0.25], [E.splash, 1, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.glow, 0.3, '150,255,255'], [E.alarm, 0.25, '255,40,40'], [E.splash, 0.25, '255,255,255']];")
rep("outlined('EPISODE 10', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('SPACE?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we need a rocket)'",
    "outlined('EPISODE 11', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE HEIST', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(steal the crown back)'")
rep("outlined(i ? 'EP 11: THE HEIST' : 'EP 9: THE RIVAL', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(steal the crown back)' : '(he\\'s better at this)'",
    "outlined(i ? 'EP 12: THE BIRTHDAY' : 'EP 10: SPACE?!', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(Leggy turns one)' : '(it landed)'")
rep("'yep. it landed.'", "'yep. it was already mine.'")
rep("\"that's me. astronaut.\"", "\"that's me. criminal mastermind.\"")
rep("'(sorry, Prestin)'", "'(we owe the goose a skylight)'")
rline("const SECS = ", "const SECS = [[0, E.town, camp11, 'camp11'], [E.town, 1e9, plaza, 'plaza']];")
rline("const panic = ", "  const panic = win(T, E.alarm, E.splash);")
rep("if (win(T, E.build, E.buildEnd)) {", "if (win(T, 9999, 9999)) {")
cut("    const card10 = (s0, s1", "stamp(T, E.moon + 4.4, 'SHARD MOON: REACHED');", """    if (win(T, E.plan, E.planEnd)) { const k = ss(seg(T, E.plan, E.plan + 0.35)) * (1 - ss(seg(T, E.planEnd - 0.35, E.planEnd))); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03);
      ctx.fillStyle = '#2a2a33'; ctx.fillRect(-230, -175, 460, 345); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.strokeRect(-220, -165, 440, 325); outlined('THE HEIST PLAN', 0, -132, 30, '#ffffff', '#2a2a33', 2);
      [[0.6, '1. Prestin: distraction'], [6.6, '2. Leggy: climb'], [8.2, '3. Bloop: drill'], [9.8, '4. Puff: flashlight'], [11.6, '5. Me: grab the crown']].forEach(([d, a], i) => { if (T < E.plan + d) return; ctx.font = F(21); ctx.textAlign = 'left'; ctx.fillStyle = i === 4 ? '#ffe066' : '#ffffff'; ctx.fillText(a, -190, -78 + i * 44); });
      if (T > E.plan + 13) { ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(150, 98, 24, 0, 7); ctx.stroke(); } ctx.restore(); }
    if (win(T, E.receipt + 0.4, E.forgive)) { const k = ss(seg(T, E.receipt + 0.4, E.receipt + 0.8)); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.28, H * 0.44); ctx.rotate(0.04); ctx.fillStyle = '#ffffff'; ctx.fillRect(-170, -140, 340, 270);
      outlined('HONK & PAWN', 0, -104, 26, '#222', '#fff', 2); ctx.font = F(18); ctx.textAlign = 'left'; ctx.fillStyle = '#333'; ['1x Crystal Crown', 'Bought back by:', '  Prestin Glow', 'This morning'].forEach((l, i) => ctx.fillText(l, -140, -54 + i * 34)); ctx.save(); ctx.translate(60, 92); ctx.rotate(-0.2); ctx.strokeStyle = '#2bd46a'; ctx.lineWidth = 4; ctx.strokeRect(-80, -24, 160, 48); outlined('PAID', 0, 2, 26, '#2bd46a', '#fff', 2); ctx.restore(); ctx.restore(); }
    stamp(T, E.crownOn + 0.4, 'CROWN RECOVERED');""")
rep("(t > E.reentry && t < E.crash + 1)", "(t > E.alarm && t < E.splash)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
