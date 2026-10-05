# ep10 scene.js = ep9 head (incl. shared cast/props of ep6-9) + body10 + ep9 compositor tail; every replacement must match once
src = open('../ep9/scene.js').read()
i0 = src.index("// ---------------------------------------------------------------- the one set: beach plot (camp left, Prestin's lot right, sea in front)")
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body10.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const Q = [[20.2, 'Flawless. Obviously.']", "\n", "")
rep("  for (const [s0, txt] of Q)", "  const Q = [[7.4, 'First YouTubers on the moon!'], [26.6, 'This is SO content.'], [64.0, 'Did the engine... sneeze?'], [96.4, 'Bald in space. Iconic.'], [119.8, 'GLOWUP claims this moon!'], [138.4, 'They\\'re adorable!!'], [161.6, 'Puff, nooo!'], [208.2, 'AAAAH! (for content)'], [223.2, 'MY HOUSE!'], [231.4, 'TEN MILLION?!'], [266.0, 'Worth it. Obviously.']];\n  for (const [s0, txt] of Q)")
rep("const viewers = t => t < E.flip + 1 ? 37 : t < E.alone ? 12 : t < E.viral + 1 ? 3 : 2400000, rViewers = t => t < E.viral + 1 ? 2400000 : 5100000;", "const viewers = t => t < E.viral + 1 ? 2400000 : 10000000, rViewers = t => t < E.viral + 1 ? 5100000 : 10000000;")
cut("  const nightS = { top: '#0a0f2a'", "return mix(dawnS, day, ss(seg(t, E.dawn + 10, 285)));", """  const dark = { top: '#05081a', bot: '#2a3a6a', sunI: 1.4, hemiI: 1.0, fog: '#4a5a8a', sunEl: 0.6, sunAz: 0.6, near: 80, far: 300 };
  if (t < E.liftoff) return day;
  if (t < E.home) return mix(day, dark, ss(seg(t, E.liftoff + 2, E.space)));
  return mix(day, sunset, 0.5 + 0.5 * ss(seg(t, E.home, 285)));""")
rline("const hpv = ", "  const hpv = t < E.fizzle ? 5 : t < E.moon ? 4.5 : t < E.stay ? 4 : t < E.crash ? 3.5 : 2.5;")
rep("(t > E.night && t < E.dawn ? '☾ NIGHT 9' : '☀ DAY 9')", "'☀ DAY 10'")
rline("const slots = ", "  const slots = [['mallet', 1], ['castle', win(t, E.build, E.buildEnd) ? 64 : 0], ['glass', 1], ['jam', 12], ['crown', 0], ['flower', 1], ['shard', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, E.build, E.buildEnd)) sel = 1;")
rep("  // viewer duel (this episode's mechanic)", """  // Puff Power fuel gauge (this episode's mechanic)
  if (t > E.fuel) { const pw = power(t), gx = 22, gy = 196; rrect(gx, gy, 220, 40, 12); ctx.fillStyle = 'rgba(40,10,0,.65)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = pw < 20 && Math.floor(t * 6) % 2 ? '#ff2a4a' : '#ff8a1e'; ctx.stroke();
    outlined('PUFF POWER', gx + 12, gy + 20, 14, '#ffb43a', '#000', 3, 'left'); rrect(gx + 112, gy + 13, 96, 14, 7); ctx.fillStyle = '#333'; ctx.fill(); rrect(gx + 112, gy + 13, 96 * pw / 100 + 1, 14, 7); ctx.fillStyle = pw < 20 ? '#ff4a2a' : '#ffb43a'; ctx.fill(); }
  // viewer duel (collab edition)""")
rline("const TOASTS = ", "const TOASTS = [[E.buildEnd, '+1 Rocket (Bloop-1)', 'jam'], [E.fuel + 0.5, '+1 Engine (Puff)', 'flower'], [E.split + 1, '+1 Puffling (moon sun)', 'shard'], [E.crash + 3, '-1 House (Prestin\\'s)', 'castle']];")
rline("const FEATS = ", "const FEATS = [[E.liftoff + 3, 'Liftoff!', 'Fly a Bloop-built rocket'], [E.moon + 2.4, 'One Small Step', 'Land on the Shard Moon'], [E.warm + 3, 'Little Sun', 'Warm up the Moonsquish'], [E.crash + 7, 'Re-Entry (sort of)', 'Come home in one piece-ish']];")
rblock("const POPS = [", """const POPS = [[E.need, 1.2, '...rocket?', 0.5, 0.35, '#ffffff', 60], [E.fizzle, 1.4, 'achoo.', 0.5, 0.5, '#ffe066', 58], [E.liftoff, 2.0, 'LIFTOFF!', 0.5, 0.3, '#ffb43a', 96],
  [E.zeroG + 0.4, 1.4, 'ZERO G!', 0.5, 0.3, '#5ff7ff', 72], [E.moon + 0.2, 1.4, 'BOING', 0.5, 0.3, '#c8c4d6', 80], [E.bounce + 1, 1.6, 'WHEEE!', 0.4, 0.25, '#ff6fb8', 70],
  [E.meet, 1.4, 'blip? blip!', 0.4, 0.4, '#bfe8ff', 56], [E.split, 1.6, 'PUFFLING!', 0.5, 0.28, '#ffe066', 80], [E.bouncepad + 1, 1.4, 'BOING BOING', 0.5, 0.3, '#ff9ad8', 68],
  [E.launch2, 1.6, 'LAUNCH!', 0.5, 0.3, '#ffb43a', 88], [E.reentry, 1.6, 'TOO HOT!', 0.5, 0.3, '#ff4a10', 80], [E.crash, 1.8, 'KABOOM!', 0.5, 0.3, '#ff6a1a', 100], [E.viral, 1.8, '10M VIEWS', 0.5, 0.26, '#ff5cf0', 80]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.fizzle, 0.8, 1.15, 0.5, 0.5], [E.liftoff, 1.0, 1.2, 0.5, 0.6], [E.split, 0.8, 1.2, 0.5, 0.4], [E.crash, 1.0, 1.25, 0.5, 0.5], [E.viral, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.build, 17, 0.02], [E.liftoff - 1.4, 9, 0.12], [E.moon, 1.5, 0.25], [E.launch2 - 0.4, 3, 0.15], [E.reentry, 7, 0.12], [E.crash, 1.6, 0.5]];")
rline("const FLASH = ", "const FLASH = [[E.liftoff, 0.25, '255,220,150'], [E.split, 0.3, '255,240,180'], [E.crash, 0.35, '255,255,255']];")
rep("outlined('EPISODE 9', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE RIVAL', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(he\\'s better at this)'",
    "outlined('EPISODE 10', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('SPACE?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we need a rocket)'")
rep("outlined(i ? 'EP 10: SPACE?!' : 'EP 8: BLOOP QUITS?!', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(we need a rocket)' : '(he stayed)'",
    "outlined(i ? 'EP 11: THE HEIST' : 'EP 9: THE RIVAL', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(steal the crown back)' : '(he\\'s better at this)'")
rep("'yep. it was fake.'", "'yep. it landed.'")
rep("\"that's me. less famous.\"", "\"that's me. astronaut.\"")
rep("'(he\\'s still better at hair)'", "'(sorry, Prestin)'")
rline("const SECS = ", "const SECS = [[0, E.space, pad, 'pad'], [E.space, E.moon, orbit, 'orbit'], [E.moon, E.space2, moon, 'moon'], [E.space2, E.home, orbit, 'orbit'], [E.home, 1e9, pad, 'pad']];")
rep("  if (cave) { setSky(", "  if (res.space) { setSky('#000005', '#080818'); scene.fog.color.set('#000005'); scene.fog.near = 500; scene.fog.far = 1400; hemi.intensity = 0.9; hemi.color.set('#c0c8ff'); hemi.groundColor.set('#40405a'); sun.intensity = 2.4; }\n  else if (cave) { setSky(")
rep("sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.night - 2, E.dawn);", "sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05;")
rep("clouds.visible = !cave;", "clouds.visible = !cave && !res.space;")
rline("const panic = ", "  const panic = win(T, E.stay, E.stay + 6) || win(T, E.reentry, E.crash + 1);")
rep("if (win(T, E.build, E.buildEnd) || win(T, E.team, E.teamEnd)) {", "if (win(T, E.build, E.buildEnd)) {")
cut("    if (win(T, E.challenge, E.challenge + 4))", "stamp(T, E.viral + 1, 'REAL > PERFECT');", """    const card10 = (s0, s1, title, rows) => { if (!win(T, s0, s1)) return; const k = ss(seg(T, s0, s0 + 0.35)) * (1 - ss(seg(T, s1 - 0.35, s1)));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.3, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03); ctx.fillStyle = '#1b3a8a'; ctx.fillRect(-220, -170, 440, 330); ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 1;
      for (let gx = -220; gx < 220; gx += 22) { ctx.beginPath(); ctx.moveTo(gx, -170); ctx.lineTo(gx, 160); ctx.stroke(); } outlined(title, 0, -128, 30, '#ffffff', '#1b3a8a', 3);
      rows.forEach(([d, a, b2, red], i) => { if (T < s0 + d) return; ctx.font = F(20); ctx.textAlign = 'left'; ctx.fillStyle = red ? '#ffb43a' : '#ffffff'; ctx.fillText(a, -190, -70 + i * 40); ctx.textAlign = 'right'; ctx.fillText(b2, 190, -70 + i * 40); }); ctx.restore(); };
    card10(E.blueprint + 0.4, E.blueEnd, 'BLOOP-1', [[0.4, 'Body', 'blocks'], [1.4, 'Fins', 'blocks'], [2.4, 'Window', 'glass'], [4.6, 'Engine', 'PUFF', true]]);
    if (win(T, E.count, E.fizzle)) { const n = 3 - Math.floor((T - E.count) / 1.4); outlined(n > 0 ? String(n) : 'GO!', W / 2, H * 0.4, 140 - ((T - E.count) % 1.4) * 40, '#ffe066', '#000', 12); }
    if (win(T, E.bill + 0.6, E.freeze)) { const k = ss(seg(T, E.bill + 0.6, E.bill + 1)); ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.28, H * 0.46); ctx.rotate(0.03); ctx.fillStyle = '#f6e7c1'; ctx.fillRect(-200, -150, 400, 290); outlined('INVOICE #2050', 0, -112, 28, '#5a2a10', '#f6e7c1', 2);
      [[0.4, 'Rocket (slightly used)', '500'], [1.4, 'Re-entry fees', '120'], [2.4, 'Moon parking', '9'], [3.4, 'TOTAL', '629 logs']].forEach(([d, a, b2], i) => { if (T < E.bill + 0.6 + d) return; ctx.font = F(19); ctx.textAlign = 'left'; ctx.fillStyle = i === 3 ? '#c0182a' : '#3a2410'; ctx.fillText(a, -175, -60 + i * 44); ctx.textAlign = 'right'; ctx.fillText(b2, 175, -60 + i * 44); }); ctx.restore(); }
    stamp(T, E.moon + 4.4, 'SHARD MOON: REACHED');""")
rep("(t > E.topple && t < E.flat + 1)", "(t > E.reentry && t < E.crash + 1)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
