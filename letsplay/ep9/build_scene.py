# ep9 scene.js = ep8 head (incl. shared cast/props of ep6-8) + body9 + ep8 compositor tail; every replacement must match once
src = open('../ep8/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: the beach camp (start + sunset finale)')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body9.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const warm = { top: '#4a9ae0'", "return mix(day, sunset, 0.55 + 0.45 * ss(seg(t, E.camp, 285)));", """  const nightS = { top: '#0a0f2a', bot: '#2a1f4a', sunI: 0.3, hemiI: 0.6, fog: '#1a1838', sunEl: 0.4, sunAz: -2.0, near: 40, far: 160 };
  const dawnS = { top: '#4a6ad0', bot: '#ffc0a0', sunI: 1.8, hemiI: 1.3, fog: '#f0c8c0', sunEl: 0.15, sunAz: 0.4, near: 60, far: 220 };
  if (t < E.dusk) return day;
  if (t < E.night) return mix(day, sunset, ss(seg(t, E.dusk, E.night - 2)));
  if (t < E.dawn) return mix(sunset, nightS, ss(seg(t, E.night - 2, E.night + 2)));
  return mix(dawnS, day, ss(seg(t, E.dawn + 10, 285)));""")
rline("const hpv = ", "  const hpv = t < E.fall ? 5 : t < E.splash ? 4.5 : t < E.burn ? 4 : t < E.alone ? 3.5 : t < E.flat ? 3 : 4.5;")
rep("(night ? '☾ NIGHT 8' : '☀ DAY 8')", "(t > E.night && t < E.dawn ? '☾ NIGHT 9' : '☀ DAY 9')")
rline("const slots = ", "  const slots = [['mallet', 1], ['plank', win(t, E.hbuild, E.fall) ? 12 : 0], ['glass', t > E.cool ? 1 : 0], ['castle', win(t, E.team, E.teamEnd) ? 64 : 0], ['crown', 0], ['flower', 1], ['shard', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, E.hbuild, E.fall)) sel = 1; else if (win(t, E.cool, E.burn)) sel = 2; else if (win(t, E.team, E.teamEnd)) sel = 3;")
cut("  // Debt-o-Meter (this episode's mechanic)", "outlined(c + ' logs'", """  // viewer duel (this episode's mechanic)
  if (t > E.cam2) { const a = viewers(t), b = rViewers(t), fa = Math.log10(a + 1) / 7, fb = Math.log10(b + 1) / 7;
    rrect(22, 96, 220, 84, 12); ctx.fillStyle = 'rgba(20,10,40,.65)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff5cf0'; ctx.stroke();
    outlined('VIEWER DUEL', 132, 114, 16, '#ff5cf0', '#000', 4);
    outlined('YOU', 36, 140, 15, '#fff', '#000', 3, 'left'); rrect(84, 132, 100 * fa + 2, 14, 7); ctx.fillStyle = '#ff8a2a'; ctx.fill(); outlined(fmtV(a), 232, 140, 15, '#ffb36b', '#000', 3, 'right');
    outlined('PRESTIN', 36, 164, 13, '#fff', '#000', 3, 'left'); rrect(104, 156, 80 * fb + 2, 14, 7); ctx.fillStyle = '#ffd23f'; ctx.fill(); outlined(fmtV(b), 232, 164, 15, '#ffe066', '#000', 3, 'right'); }""")
rline("const TOASTS = ", "const TOASTS = [[E.fall + 0.5, '-12 Planks (tower)', 'plank'], [E.splash + 1, 'Viewers: 37 → 12', 'flower'], [E.team + 1, '+64 Blocks (teamwork)', 'castle'], [E.viral + 1, 'Viewers: 2.4M!', 'shard']];")
rline("const FEATS = ", "const FEATS = [[E.splash + 4.6, 'Ocean Backflip', 'Fail a stunt on stream'], [E.fake + 3.6, 'Behind the Curtain', 'Find out the mansion is one wall'], [E.teamEnd - 1, 'Real Builders', 'Build a house with your rival'], [E.flat + 4.6, 'Door-Hole Luck', 'Survive a falling wall']];")
rblock("const POPS = [", """const POPS = [[E.arrive + 3, 1.4, 'VRRMMM', 0.55, 0.32, '#ffe066', 66], [E.flawless, 1.6, 'FLAWLESS.', 0.45, 0.3, '#ffd23f', 76], [E.fall, 1.4, 'CRASH!', 0.3, 0.3, '#ffffff', 82],
  [E.splash, 1.4, 'SPLOOSH', 0.5, 0.35, '#5aa8ff', 82], [E.burn, 1.4, 'FWOOMP', 0.4, 0.3, '#ff6a1a', 74], [E.coins, 1.4, 'cha-ching', 0.55, 0.36, '#ffd23f', 60], [E.leggyGo + 4, 1.4, 'fabulous.', 0.6, 0.3, '#ff6fb8', 58],
  [E.fake, 1.8, 'IT\\'S FAKE!', 0.5, 0.28, '#ff6b6b', 92], [E.team + 0.5, 1.4, 'TEAM BUILD!', 0.5, 0.28, '#7cff6b', 76], [E.hit, 1.4, 'BONK', 0.5, 0.3, '#ff6a1a', 80],
  [E.flat, 1.6, 'WHUMP!', 0.5, 0.3, '#ffffff', 96], [E.wigOff + 0.2, 1.4, 'WIG!', 0.62, 0.3, '#ffe066', 80], [E.viral, 2.0, 'VIRAL!', 0.5, 0.26, '#ff5cf0', 92], [E.shake + 0.4, 1.4, 'COLLAB!', 0.5, 0.3, '#5ff7ff', 72]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.flawless, 0.8, 1.15, 0.5, 0.5], [E.fall, 0.8, 1.2, 0.5, 0.5], [E.splash, 0.8, 1.2, 0.5, 0.5], [E.fake, 1.0, 1.3, 0.5, 0.5], [E.flat, 1.0, 1.25, 0.5, 0.5], [E.wigOff + 0.2, 0.8, 1.2, 0.5, 0.4]];")
rline("const SHAKES = ", "const SHAKES = [[E.build, 6.6, 0.02], [E.fall, 1, 0.25], [E.splash, 0.6, 0.2], [E.team, 22, 0.02], [E.hit, 1, 0.2], [E.flat, 1.4, 0.45]];")
rline("const FLASH = ", "const FLASH = [[E.fake, 0.25, '255,255,255'], [E.hit, 0.3, '255,200,120'], [E.flat, 0.3, '255,255,255']];")
rep("outlined('EPISODE 8', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('BLOOP QUITS?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(pay the invoice)'",
    "outlined('EPISODE 9', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE RIVAL', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(he\\'s better at this)'")
rep("outlined(i ? 'EP 9: THE RIVAL' : 'EP 7: THE ICEBERG', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(he\\'s better at this)' : '(it melted)'",
    "outlined(i ? 'EP 10: SPACE?!' : 'EP 8: BLOOP QUITS?!', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(we need a rocket)' : '(he stayed)'")
rep("'yep. he stayed.'", "'yep. it was fake.'")
rep("\"that's me. still broke.\"", "\"that's me. less famous.\"")
rep("'(and still crownless)'", "'(he\\'s still better at hair)'")
rline("const SECS = ", "const SECS = [[0, 1e9, hood, 'hood']];")
rep("sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.site, E.camp);", "sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.night - 2, E.dawn);")
rline("const panic = ", "  const panic = win(T, E.fall, E.fall + 1.5) || win(T, E.burn, E.burn + 3) || win(T, E.fake, E.fake + 2) || win(T, E.hit, E.flat + 0.5);")
rep("if (win(T, E.taxi + 2, E.fare - 1)) {", "if (win(T, E.build, E.buildEnd) || win(T, E.team, E.teamEnd)) {")
cut("    const card8 = (s0, s1", "stamp(T, E.hug + 1, 'BLOOP STAYS');", """    if (win(T, E.challenge, E.challenge + 4)) { const k = ss(seg(T, E.challenge, E.challenge + 0.3)) * (1 - ss(seg(T, E.challenge + 3.6, E.challenge + 4))); ctx.save(); ctx.globalAlpha = k; ctx.translate(W / 2, H * 0.42); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k);
      rrect(-300, -60, 600, 120, 20); ctx.fillStyle = 'rgba(20,10,40,.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#ffd23f'; ctx.stroke(); outlined('BUILD-OFF!', 0, -22, 44, '#ffd23f', '#000', 7); outlined('YOU  vs  PRESTIN', 0, 30, 26, '#fff', '#000', 5); ctx.restore(); }
    stamp(T, E.viral + 1, 'REAL > PERFECT');""")
rep("if (T > 3) drawFacecam(T);", "if (T > 3) { drawFacecam(T); drawRivalCam(T); }")
rep("(t > E.topple && t < E.crash + 2)", "(t > E.topple && t < E.flat + 1)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
