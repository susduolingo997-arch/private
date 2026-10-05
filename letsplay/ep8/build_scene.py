# ep8 scene.js = ep7 head (incl. ep6/ep7 shared props) + body8 + ep7 compositor tail; every replacement must match once
src = open('../ep7/scene.js').read()
i0 = src.index('// ---------------------------------------------------------------- set A: the beach (dawn start + sunset finale)')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body8.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):  # replace from `start` through the end of the line containing `end_marker`
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const dawn = { top: '#2e4a8a'", "return mix(day, sunset, ss(seg(t, 250, 285)));", """  const warm = { top: '#4a9ae0', bot: '#ffe0b0', sunI: 2.4, hemiI: 1.5, fog: '#f0e0c8', sunEl: 0.45, sunAz: 1.2, near: 70, far: 220 };
  const grey = { top: '#7a8494', bot: '#b8c0cc', sunI: 0.9, hemiI: 1.3, fog: '#a8b0bc', sunEl: 0.6, sunAz: 0.6, near: 40, far: 160 };
  if (t < E.town) return day;
  if (t < E.site) return mix(day, warm, ss(seg(t, E.town, E.town + 4)));
  if (t < E.camp) return mix(warm, grey, ss(seg(t, E.site, E.site + 3)));
  return mix(day, sunset, 0.55 + 0.45 * ss(seg(t, E.camp, 285)));""")
rline("const hpv = ", "  const hpv = t < E.quit ? 5 : t < E.sell ? 4 : t < E.lean ? 3.5 : t < E.crash ? 3 : t < E.tear ? 3.5 : 5;")
rep("(night ? '☾ NIGHT 7' : '☀ DAY 7')", "(night ? '☾ NIGHT 8' : '☀ DAY 8')")
rline("const slots = ", "  const slots = [['mallet', 1], ['log', cash(t) > 0 ? Math.min(99, cash(t)) : 0], ['crown', t < E.sell ? 1 : 0], ['plank', win(t, E.stand, E.eat) ? 6 : 0], ['castle', win(t, E.help, E.topple) ? 16 : 0], ['shard', 0], ['flower', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, E.sell - 2, E.sell + 1)) sel = 2; else if (win(t, E.help, E.topple)) sel = 4; else if (win(t, E.pay, E.tear)) sel = 1;")
cut("  // Frostbite Cup scoreboard", "outlined('ICE'", """  // Debt-o-Meter (this episode's mechanic)
  const owed = debt(t); if (owed !== null) { const c = cash(t), shk = win(t, E.pile + 2, E.pile + 3) ? Math.sin(t * 50) * 3 : 0;
    rrect(22 + shk, 96, 210, 96, 12); ctx.fillStyle = 'rgba(30,10,10,.65)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = owed === 0 ? '#7cff6b' : '#ff6b6b'; ctx.stroke();
    outlined('DEBT-O-METER', 127 + shk, 116, 16, owed === 0 ? '#7cff6b' : '#ff6b6b', '#000', 4);
    outlined('OWED', 38, 146, 18, '#fff', '#000', 3, 'left'); outlined(owed === 0 ? 'FORGIVEN' : owed + ' logs', 218, 146, 19, owed === 0 ? '#7cff6b' : '#ffb0b0', '#000', 4, 'right');
    outlined('CASH', 38, 172, 18, '#cfe0ff', '#000', 3, 'left'); outlined(c + ' logs', 218, 172, 19, '#ffe066', '#000', 4, 'right'); }""")
rline("const TOASTS = ", "const TOASTS = [[E.sale, '+40 Logs (snacks)', 'log'], [E.sell, '+300 Logs, -1 Crown', 'crown'], [E.fare, '+900 Logs (Leggy!)', 'log'], [E.mimeEnd, '+1 Log (pity)', 'log']];")
rline("const FEATS = ", "const FEATS = [[E.stand + 2, 'Entrepreneur', 'Open a snack stand'], [E.fare + 1.5, 'Six-Legged Taxi', 'Let Leggy run the economy'], [E.hatOn + 1.2, 'Bloop Is Back', 'Put the hat back on'], [E.tear + 1.6, 'Debt Free', 'Get every invoice torn up']];")
rblock("const POPS = [", """const POPS = [[E.pile, 1.4, 'THUD.', 0.55, 0.3, '#fff3cf', 86], [E.quit, 1.2, 'gasp!', 0.4, 0.35, '#ffffff', 60], [E.letter, 1.2, 'MAIL!', 0.6, 0.3, '#5aa8ff', 66],
  [E.sale, 1.4, 'CHA-CHING!', 0.5, 0.3, '#ffe066', 78], [E.eat + 1.4, 1.2, 'gulp.', 0.45, 0.4, '#ffb43a', 58], [E.sell, 1.4, 'SOLD!', 0.55, 0.3, '#ffd23f', 80], [E.taxi + 1, 1.4, 'TAXI!', 0.5, 0.3, '#ffd400', 76],
  [E.mime + 1, 1.4, '...', 0.5, 0.3, '#ffffff', 70], [E.wobble, 1.4, 'creeak...', 0.6, 0.3, '#cfe0ff', 58], [E.hatOn + 0.6, 1.6, 'BLOOP IS BACK!', 0.5, 0.26, '#ffd400', 74],
  [E.topple, 1.4, 'TIMBER!', 0.5, 0.28, '#ffffff', 90], [E.crash, 1.6, 'KRA-KOOM', 0.5, 0.3, '#ffb050', 96], [E.tear, 1.6, 'RIIIIP!', 0.5, 0.28, '#ff6fb8', 92], [E.bill2 + 0.4, 1.4, 'invoice #2049', 0.55, 0.3, '#fff3cf', 54]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.pile, 0.8, 1.2, 0.5, 0.5], [E.quit, 0.8, 1.15, 0.5, 0.5], [E.sell, 0.8, 1.2, 0.5, 0.5], [E.crash, 1.0, 1.25, 0.5, 0.5], [E.tear, 1.0, 1.2, 0.5, 0.5], [E.bill2, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.pile, 0.8, 0.3], [E.wobble, 10, 0.03], [E.lean, 4, 0.08], [E.topple, 2, 0.1], [E.crash, 2, 0.45], [E.tear, 1, 0.15]];")
rline("const FLASH = ", "const FLASH = [[E.crash, 0.3, '255,255,255'], [E.tear, 0.25, '255,240,200']];")
rep("outlined('EPISODE 7', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE FROSTBITE CUP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it melts)'",
    "outlined('EPISODE 8', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('BLOOP QUITS?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(pay the invoice)'")
rep("'(Bloop wants his money)'", "'(and still crownless)'")
rep("outlined(i ? 'EP 8: BLOOP QUITS?!' : 'EP 6: THE VOLCANO', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(pay the invoice)' : '(it was not fine)'",
    "outlined(i ? 'EP 9: THE RIVAL' : 'EP 7: THE ICEBERG', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(he\\'s better at this)' : '(it melted)'")
rep("'yep. it melted.'", "'yep. he stayed.'")
rep("\"that's me. soggy again.\"", "\"that's me. still broke.\"")
rline("const SECS = ", "const SECS = [[0, E.town, camp, 'camp'], [E.town, E.camp, town, 'town'], [E.camp, 1e9, camp, 'camp']];")
rep("sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.sail + 4, E.arrive + 3);", "sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.site, E.camp);")
rep("hemi.groundColor.set(t > E.sail && t < E.sink ? '#9fc8e0' : '#6a7a4a');", "hemi.groundColor.set('#6a7a4a');")
rline("const panic = ", "  const panic = win(T, E.pile, E.pile + 1.5) || win(T, E.leave, E.leave + 3) || win(T, E.lean, E.crash + 1);")
rep("if (win(T, E.make, E.makeEnd) || win(T, E.drill, E.drillEnd)) {", "if (win(T, E.taxi + 2, E.fare - 1)) {")
cut("    if (win(T, E.poster, E.posterEnd))", "stamp(T, E.win + 1.6, 'FROSTBITE CHAMPION');", """    const card8 = (s0, s1, title, rows, x0) => { if (!win(T, s0, s1)) return; const k = ss(seg(T, s0, s0 + 0.35)) * (1 - ss(seg(T, s1 - 0.35, s1)));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(W * x0, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03);
      ctx.fillStyle = '#f6e7c1'; ctx.fillRect(-220, -170, 440, 330); ctx.fillStyle = '#7a4a2a'; ctx.fillRect(-220, -170, 440, 14);
      outlined(title, 0, -126, 30, '#5a2a10', '#f6e7c1', 2);
      rows.forEach(([d, a, b2, red], i) => { if (T < s0 + d) return; ctx.font = F(20); ctx.textAlign = 'left'; ctx.fillStyle = red ? '#c0182a' : '#3a2410'; ctx.fillText(a, -190, -70 + i * 40); ctx.textAlign = 'right'; ctx.fillText(b2, 190, -70 + i * 40); });
      ctx.restore(); };
    card8(13.0, 20.4, 'ALL THE INVOICES', [[0.5, 'House (fell)', '120'], [1.2, 'Fortress (sank)', '260'], [1.9, 'Boat + island', '410'], [2.6, 'Sky + bunker', '580'], [3.3, 'Volcano + iceberg', '678'], [4.2, 'TOTAL DUE', '2,048 logs', true]], 0.3);
    card8(E.plan, E.planEnd, 'MONEY PLAN', [[0.4, '1. Sell snacks', ''], [2.0, '2. Sell stuff', ''], [4.0, '3. ???', ''], [5.6, '4. Get rich', 'by sunset', true]], 0.3);
    card8(E.bill2 + 0.6, E.freeze, 'INVOICE #2049', [[0.6, 'Friendship fee', '1 log'], [2.2, 'Hat re-installation', 'free'], [3.6, 'Staying', 'priceless', true]], 0.28);
    stamp(T, E.hug + 1, 'BLOOP STAYS');""")
rep("(t > E.crack && t < E.land)", "(t > E.topple && t < E.crash + 2)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
