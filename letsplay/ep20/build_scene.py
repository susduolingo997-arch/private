# ep20 scene.js = ep19 head minus its treasure-map body + body20 + ep19 compositor tail; every replacement must match once
src = open('../ep19/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 19: "THE TREASURE MAP"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body20.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const tropic = {", "return mix(sunset, eve, seg(t, E.home + 40, 292));", """  const dawn = { top: '#ff9a6a', bot: '#ffe2b0', sunI: 2.3, hemiI: 1.45, fog: '#ffd8a8', sunEl: 0.3, sunAz: -0.9, near: 70, far: 240 };
  const glitchy = { top: '#8a2aff', bot: '#ff5cf0', sunI: 1.4, hemiI: 1.2, fog: '#c070ff', sunEl: 0.3, sunAz: -0.9, near: 50, far: 200 };
  if (t < E.arrive) return day; if (t < E.home) return win(t, E.glitch, E.glitchEnd) && Math.floor(t * 6) % 2 ? glitchy : dawn;
  return mix(mix(day, sunset, seg(t, E.sunset - 8, E.sunset + 4)), eve, seg(t, E.sunset + 20, 292));""")
rep("(win(t, E.walk, E.chaseEnd) || win(t, E.fall, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.collapse, E.reveal) || win(t, E.glitch, E.glitchEnd) || win(t, E.third, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.collapse ? 5 : t < E.teamUp ? 4 : t < E.glitch ? 5 : t < E.glitchEnd ? 2.5 : 5;")
rep("outlined('☀ DAY 19', W / 2, 32, 18,", "outlined(t > E.arrive && t < E.home ? '☀ DAY 1' : '☀ DAY 20', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['duck', t > E.test && t < E.duckSend ? 1 : 0], ['plank', win(t, E.buildTL, E.buildTLEnd) ? 64 : 3], ['fish', win(t, E.bloopPay + 1, E.bloopPay + 2.4) ? 1 : 0]];")
cut("  // treasure map + holes dug — this episode's mechanic", "HOLES DUG: ' + holesAt(t)", """  // paradox meter — this episode's mechanic
  const pm = paradoxAt(t); if (pm !== null && t < E.freeze) { rrect(22, 96, 220, 92, 12); ctx.fillStyle = 'rgba(30,16,8,.75)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#ffd23f'; ctx.stroke(); outlined('PARADOX METER', 132, 114, 15, '#ffd23f', '#000', 3);
    rrect(36, 130, 192, 20, 8); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fill(); const pc = clamp(pm, 0, 1); rrect(36, 130, Math.max(16, 192 * pc), 20, 8); ctx.fillStyle = pc > 0.8 ? (Math.floor(t * 8) % 2 ? '#ff2a4a' : '#ffe066') : pc > 0.5 ? '#ffa02a' : '#7cff6b'; ctx.fill();
    outlined(pm >= 1 ? 'ERROR' : Math.round(pc * 100) + '%', 132, 168, 18, '#fff', '#000', 4); }""")
# two facecams: me (top) and past me (below, green, propeller beanie) — each animates only on its own lines
rep("function drawFacecam(t) {\n  const x = W - 236, y = 16, w = 220, h = 150;", "function drawFacecam(t) { drawCam(t, 0, 16); if (win(t, E.meet, E.home) || win(t, E.twinOut, E.freeze)) drawCam(t, 1, 176); }\nfunction drawCam(t, tw, y0) {\n  const x = W - 236, y = y0, w = 220, h = 150;")
rep("gr.addColorStop(0, '#2a1b4d'); gr.addColorStop(1, '#0f2a4a');", "gr.addColorStop(0, tw ? '#1b4d2a' : '#2a1b4d'); gr.addColorStop(1, tw ? '#0f4a3a' : '#0f2a4a');")
rep("const fi = Math.min(ENV.length - 1, Math.floor(t * FPS)); const a = ENV[fi] || 0;\n  const cue = CUES.find(c => t >= c.start && t < c.end + 0.2); const txt = cue ? cue.text : '';",
    "const fi = Math.min(ENV.length - 1, Math.floor(t * FPS));\n  const cue = CUES.find(c => t >= c.start && t < c.end + 0.2); const mine = cue && ((cue.voice === 'twin') === !!tw); const a = mine ? (ENV[fi] || 0) : 0; const txt = mine ? cue.text : '';")
rep("ctx.fillStyle = '#ff8a2a'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);", "ctx.fillStyle = tw ? '#3cc26a' : '#ff8a2a'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);")
rep("  ctx.fillStyle = '#5ff7ff'; ctx.fillRect(hx - s / 2 - 12, hy - 12, 8, 24);", "  if (tw) { ctx.fillStyle = '#2e8a4a'; ctx.fillRect(hx - s / 2 - 4, hy - s / 2 - 24, s + 8, 28); ctx.fillStyle = '#ffe066'; ctx.fillRect(hx - 3, hy - s / 2 - 36, 6, 12); const pr = Math.abs(Math.sin(t * 20)) * 34; ctx.fillStyle = '#ff3d7f'; ctx.fillRect(hx - pr, hy - s / 2 - 40, pr * 2, 6); }\n  ctx.fillStyle = '#5ff7ff'; ctx.fillRect(hx - s / 2 - 12, hy - 12, 8, 24);")
rep("rrect(x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();", "rrect(x, y, w, h, 14); ctx.lineWidth = 4; ctx.strokeStyle = tw ? '#7cff6b' : '#ffffff'; ctx.stroke();")
rep("outlined('PIXELPANIC', x + 30, y + h - 16, 13,", "outlined(tw ? 'PIXELPANIC (DAY 1)' : 'PIXELPANIC', x + 30, y + h - 16, 13,")
rep("outlined(chunk, W / 2, yy + 1, 28, '#ffffff', '#000', 5);", "outlined(chunk, W / 2, yy + 1, 28, c.voice === 'twin' ? '#9dff8a' : '#ffffff', '#000', 5);")
rline("const TOASTS = ", """ICON.duck = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - s * 0.7, y - s * 0.1, s * 1.3, s * 0.7); ctx.fillRect(x + s * 0.1, y - s * 0.7, s * 0.6, s * 0.6); ctx.fillStyle = '#ff8a2a'; ctx.fillRect(x + s * 0.7, y - s * 0.45, s * 0.35, s * 0.2); ctx.fillStyle = '#111'; ctx.fillRect(x + s * 0.4, y - s * 0.55, 3, 3); };
const TOASTS = [[E.unveil + 2, '+1 Time Machine 2.0', 'castle'], [E.duckArrive + 1, '+1 Rubber Duck (early)', 'duck'], [E.bloopPay + 3, 'Invoice: PAID (in fish)', 'fish'], [E.buildTLEnd, '+1 House (proper)', 'plank'], [E.ducks + 1, '+2 Rubber Ducks (???)', 'duck']];""")
rline("const FEATS = ", "const FEATS = [[E.itWorks + 1, 'It Works?!', 'Build a working time machine'], [E.ruinMe + 1, 'Bootstrap Disaster', 'Cause your own first collapse'], [E.buildTLEnd + 1.5, 'Two Heads', 'Build a house with yourself'], [E.reveal2 + 3, 'Home Sweet Home', 'Fix the house. For real.']];")
rblock("const POPS = [", """const POPS = [[E.wreck + 2, 1.4, 'creak...', 0.42, 0.4, '#ffffff', 60], [E.unveil, 1.6, 'TA-DA!', 0.55, 0.3, '#ffe066', 96], [E.invoice + 1, 1.6, '3 PAGES', 0.62, 0.4, '#ff6b6b', 72], [E.duckArrive + 0.2, 1.4, 'quack?', 0.6, 0.45, '#ffd23f', 70],
  [E.duckSend, 1.6, 'ZWOOP', 0.6, 0.35, '#5ff7ff', 100], [E.itWorks, 1.6, 'IT WORKS?!', 0.5, 0.3, '#7cff6b', 96], [E.countdown, 1.0, '3', 0.5, 0.4, '#ffffff', 110], [E.countdown + 0.7, 1.0, '2', 0.5, 0.4, '#ffffff', 110], [E.countdown + 1.4, 1.0, '1', 0.5, 0.4, '#ffffff', 110],
  [E.meet + 1, 1.6, '...is that me?', 0.4, 0.35, '#ffffff', 64], [E.twinTalk, 1.4, 'WHO ARE YOU', 0.3, 0.3, '#9dff8a', 70], [E.tockIn, 1.4, 'tick tock', 0.6, 0.3, '#ffd23f', 70], [E.build1 + 2, 1.2, 'tap tap tap', 0.4, 0.35, '#ffffff', 56],
  [E.collapse, 1.6, 'CREAK', 0.6, 0.35, '#ffffff', 90], [E.collapse + 0.8, 1.6, 'CRASH', 0.4, 0.45, '#ff8a5a', 110], [E.ruinMe + 1, 1.6, 'IT WAS ME', 0.6, 0.3, '#ff6b6b', 90], [E.bloopPay + 2.4, 1.4, 'a fish!', 0.3, 0.35, '#ff9a2a', 70],
  [E.buildTL + 2, 1.2, 'tap', 0.25, 0.4, '#ffffff', 56], [E.buildTL + 3, 1.2, 'tap', 0.75, 0.4, '#9dff8a', 56], [E.duckChase + 1, 1.4, 'MY DUCK', 0.5, 0.3, '#5ff7ff', 72], [E.highfive + 0.8, 1.2, 'SLAP', 0.5, 0.4, '#ffe066', 100],
  [E.glitchEnd + 0.6, 1.4, 'purrrr', 0.5, 0.35, '#ffd23f', 70], [E.reveal2, 1.6, 'IT STANDS!', 0.5, 0.25, '#7cff6b', 110], [E.bloopPaid + 2, 1.4, '*stink*', 0.62, 0.35, '#9fdc5a', 70], [E.twinOut, 1.4, 'SURPRISE!', 0.6, 0.3, '#9dff8a', 96],
  [E.whir, 1.4, 'hmmmmmm', 0.62, 0.3, '#5ff7ff', 70], [E.shout, 1.6, "DON'T SQUEEZE THE—", 0.62, 0.3, '#ff6b6b', 60], [E.squeak, 1.4, 'squeak.', 0.5, 0.4, '#ffd23f', 80], [E.duckRain, 1.6, 'QUACK', 0.5, 0.25, '#ffd23f', 110]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.itWorks, 0.8, 1.15, 0.5, 0.5], [E.ruinMe, 1.0, 1.12, 0.5, 0.6], [E.reveal2, 0.8, 1.1, 0.5, 0.4], [E.squeak, 0.8, 1.2, 0.5, 0.6]];")
rline("const SHAKES = ", "const SHAKES = [[E.duckSend, 1, 0.12], [E.countdown, 2, 0.08], [E.collapse + 0.6, 1, 0.4], [E.highfive + 0.8, 0.5, 0.2], [E.glitch, 7.4, 0.05], [E.whir, 4.8, 0.03], [E.duckRain, 9, 0.04]];")
rline("const FLASH = ", "const FLASH = [[E.duckSend, 0.3, '160,250,255'], [E.duckArrive, 0.2, '160,250,255'], [E.highfive + 0.8, 0.3, '255,120,240'], [E.twinOut, 0.25, '160,250,255'], [E.third, 0.25, '160,250,255']];")
rep("outlined('EPISODE 19', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TREASURE MAP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(X marks the wrong spot)'",
    "outlined('EPISODE 20', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TIME MACHINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it works. really.)'")
rep("outlined(i ? 'EP 20: THE BIG STORM' : 'EP 18: THE SHRINK RAY', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(hold on to the hat)' : '(we\\'re tiny now)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 21: THREE OF ME' : 'EP 19: THE TREASURE MAP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we need a bigger couch)' : '(X marks the wrong spot)', x + 110, y + 80, 14")
rep("outlined('yep. it was chocolate.', 0, 0, 56", "outlined('yep. it works. too well.', 0, 0, 56")
rep("\"that's me. X marks me.\"", "\"that's me. and me. and me.\"")
rep("'(Leggy ate the treasure)'", "'(the house is fine though)'")
rline("const SECS = ", "const SECS = [[0, E.arrive, yard, 'yard'], [E.arrive, E.home, past, 'past'], [E.home, 1e9, yard, 'yard']];")
rline("const panic = ", "  const panic = win(T, E.collapse, E.reveal) || win(T, E.glitch, E.glitchEnd) || win(T, E.duckRain, E.freeze);")
rep("if (win(T, E.build, E.buildEnd)) { const bl", "if (win(T, E.build1, E.build1End) || win(T, E.buildTL, E.buildTLEnd)) { const bl")
rep("""    stamp(T, E.map2 + 1, 'TREASURE: ANOTHER MAP');
    stamp(T, E.choc + 1, 'GOLD: 0%  COCOA: 100%');""", """    if (T > E.arrive && T < E.home && !frozen) { ctx.fillStyle = 'rgba(255,170,80,.07)'; ctx.fillRect(0, 0, W, H); }
    stamp(T, E.arrive + 2, 'DAY 1  (19 DAYS AGO)');
    stamp(T, E.ruinMe + 0.4, 'DISASTER #1: CAUSED BY ME');
    stamp(T, E.reveal2 + 1.6, 'HOUSE: STANDING. NOT TILTED.');
    drawGlitch(T); drawWarp(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
