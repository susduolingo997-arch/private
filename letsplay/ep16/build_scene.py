# ep16 scene.js = ep15 head minus its talent-show body + body16 + ep15 compositor tail; every replacement must match once
src = open('../ep15/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 15: "THE TALENT SHOW"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body16.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const night2 = {", "return mix(eve, night2", """  const morning = { top: '#7ab8f0', bot: '#ffe0b0', sunI: 2.2, hemiI: 1.4, fog: '#f0e0c8', sunEl: 0.3, sunAz: -0.8, near: 70, far: 220 };
  if (t < E.gorge) return mix(morning, day, seg(t, 0, E.gorge)); if (t < E.storm) return day; if (t < E.rainbow) return mix(day, storm, seg(t, E.storm, E.storm + 3) * (1 - seg(t, E.rainbow - 3, E.rainbow)));
  if (t < E.picnic) return day; if (t < E.sunsetCalm) return mix(day, sunset, seg(t, E.picnic, E.sunsetCalm)); return mix(sunset, eve, seg(t, E.sunsetCalm + 10, 290));""")
rep("(t > E.turbo && t < E.dark) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.storm, E.rainbow) || win(t, E.pebble + 3, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = 5;")
rep("const night = t > 120;\n  rrect(W / 2 - 70", "const night = false;\n  rrect(W / 2 - 70")
rep("(night ? '☾' : '☀') + ' DAY 15'", "'☀ DAY 16'")
rep("  const night = t > 120;\n  const sv", "  const night = false;\n  const sv")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['plank', t < E.build ? 14 : t < E.buildEnd ? Math.max(1, 14 - Math.floor((t - E.build) / 2)) : 0], ['log', t > E.build + 6 ? 4 : 0], ['castle', t > E.support ? 1 : 0]];")
cut("  // Applause-o-meter — this episode's mechanic", "'crickets'", """  // Doom-o-meter (hero paranoia) + days without disaster — this episode's mechanic
  if (t > E.nervous && t < E.freeze) { const v = clamp(doom(t), 0, 1), lab = doomL(t); rrect(22, 96, 220, 118, 12); ctx.fillStyle = 'rgba(30,10,10,.7)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ff6b6b'; ctx.stroke();
    outlined('DOOM-O-METER', 132, 114, 15, '#ff6b6b', '#000', 3); const gx = 40, gw = 184; rrect(gx, 132, gw, 16, 8); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fill();
    const gr = ctx.createLinearGradient(gx, 0, gx + gw, 0); gr.addColorStop(0, '#7cff6b'); gr.addColorStop(0.5, '#ffe066'); gr.addColorStop(1, '#ff3a3a'); rrect(gx, 132, Math.max(8, gw * v), 16, 8); ctx.fillStyle = gr; ctx.fill();
    outlined(lab || (v > 0.95 ? 'IT\\'S HAPPENING' : v > 0.75 ? 'PARANOID' : v > 0.5 ? 'suspicious' : v > 0.2 ? 'nervous' : 'calm?'), 132, 168, lab ? 18 : 16, lab ? '#ffe066' : (v > 0.95 ? '#ff6b6b' : '#ffffff'), '#000', 4);
    outlined('DAYS W/O DISASTER: ' + (t > E.sunsetCalm + 10 ? '1' : '0'), 132, 196, 13, t > E.sunsetCalm + 10 ? '#7cff6b' : '#cfd8ff', '#000', 3); }""")
rline("const TOASTS = ", "const TOASTS = [[E.pay + 1, '-40 coins (invoice PAID)', 'gold'], [E.buildEnd + 1, '+1 Bridge (standing)', 'plank'], [E.approve + 2, '+1 Gold Star (inspected)', 'shard'], [E.picnic + 5, '+1 Framed Receipt', 'glass']];")
rline("const FEATS = ", "const FEATS = [[E.pay + 3, 'Paid in Full', 'Pay an invoice on time'], [E.approve + 1, 'Up to Code', 'Pass a snail inspection'], [E.cross + 6, 'First Across', 'Leggy crosses the bridge'], [E.sunsetCalm + 10, 'It Worked?!', 'Nothing went wrong. Nothing.']];")
rblock("const POPS = [", """const POPS = [[E.pay + 2.4, 1.6, 'thud.', 0.62, 0.5, '#ffffff', 70], [E.build + 1, 1.2, 'tok', 0.4, 0.4, '#ffe066', 60], [E.build + 9, 1.2, 'tok', 0.55, 0.4, '#ffe066', 60], [E.support + 3, 1.6, '...solid.', 0.5, 0.3, '#ffffff', 70],
  [E.done + 1, 1.8, 'DONE!', 0.5, 0.3, '#7cff6b', 100], [E.rock + 2.6, 1.4, 'boing', 0.5, 0.35, '#ffffff', 70], [E.snail + 4, 1.6, 'shlorp...', 0.5, 0.4, '#b8d0a0', 64], [E.inspect + 2, 1.0, 'tap', 0.45, 0.4, '#ffffff', 56], [E.inspect + 8, 1.0, 'tap', 0.55, 0.4, '#ffffff', 56],
  [E.approve, 1.8, 'APPROVED', 0.5, 0.3, '#ffd23f', 92], [E.storm + 0.4, 1.6, 'KRAKOOM', 0.5, 0.25, '#ffffff', 96], [E.storm + 8, 1.4, '...drizzle?', 0.5, 0.3, '#9fd0ff', 64], [E.fish + 1.4, 1.6, 'BLUB', 0.5, 0.3, '#2fa88c', 96],
  [E.wind + 1, 1.4, 'whoosh', 0.5, 0.3, '#ffffff', 64], [E.cross + 5, 1.6, 'TAP TAP!', 0.5, 0.3, '#5ff7ff', 80], [E.relax + 6, 1.4, 'phew', 0.5, 0.35, '#ffffff', 60], [E.pebble + 3.2, 1.2, 'plip.', 0.5, 0.5, '#9fd0ff', 70], [E.pebble + 3.4, 2.0, 'AAAAAAAAH!', 0.5, 0.3, '#ff6b6b', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.pay + 2.4, 0.8, 1.15, 0.6, 0.5], [E.approve, 0.8, 1.15, 0.5, 0.5], [E.fish + 1.4, 0.8, 1.15, 0.5, 0.4], [E.pebble + 3.4, 1.0, 1.25, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.storm + 0.4, 1.0, 0.25], [E.fish + 0.4, 0.6, 0.15], [E.wind, 8, 0.05], [E.pebble + 3.4, 1.4, 0.3]];")
rline("const FLASH = ", "const FLASH = [[E.storm + 0.3, 0.25, '255,255,255'], [E.storm + 6, 0.15, '255,255,255']];")
rep("outlined('EPISODE 15', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TALENT SHOW', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(Bonk-bot can\\'t dance)'",
    "outlined('EPISODE 16', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('IT WORKED?!', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(nothing goes wrong. seriously.)'")
rep("outlined(i ? 'EP 16: IT WORKED?!' : 'EP 14: THE HAUNTED MINE', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(nothing goes wrong. seriously.)' : '(it\\'s not haunted)', x + 110, y + 80, i ? 12 : 14",
    "outlined(i ? 'EP 17: THE TIME MACHINE' : 'EP 15: THE TALENT SHOW', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(Bloop built it. uh oh.)' : '(Bonk-bot can\\'t dance)', x + 110, y + 80, 14")
rep("outlined('yep. it brought the house down.', 0, 0, 44", "outlined('yep. it... worked?', 0, 0, 56")
rep("\"that's me. the manager.\"", "\"that's me. still screaming.\"")
rep("'(Leggy won. obviously.)'", "'(it was one pebble)'")
rline("const SECS = ", "const SECS = [[0, E.gorge, camp, 'camp'], [E.gorge, 1e9, gorge, 'gorge']];")
rline("const panic = ", "  const panic = win(T, E.storm, E.storm + 6) || win(T, E.fish, E.fish + 4) || win(T, E.pebble + 3.2, E.freeze);")
rep("if (win(T, E.chip, E.chipEnd)) { const bl", "if (win(T, E.build, E.buildEnd)) { const bl")
rep("""    stamp(T, E.score7 + 0.6, 'SCORE: 7');
    stamp(T, E.sitAct + 5, 'SITTING: 10/10');
    stamp(T, E.score10 + 0.6, 'LEGGY: 10/10');""", """    stamp(T, E.approve + 0.6, 'APPROVED');
    stamp(T, E.pay + 0.6, 'PAID');
    drawMemories(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
