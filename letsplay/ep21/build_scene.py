# ep21 scene.js = ep20 head minus its time-machine body + body21 + ep20 compositor tail; every replacement must match once
src = open('../ep20/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 20: "THE TIME MACHINE (IT WORKS)"')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body21.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
def cut(start, end_marker, new):
    global s; assert s.count(start) == 1, start; i = s.index(start); j = s.index(end_marker, i); j = s.index('\n', j); s = s[:i] + new + s[j:]
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
cut("  const dawn = {", "return mix(mix(day, sunset, seg(t, E.sunset - 8, E.sunset + 4)), eve, seg(t, E.sunset + 20, 292));", """  const candy = { top: '#7ec8ff', bot: '#ffd6f0', sunI: 2.5, hemiI: 1.6, fog: '#ffd0ec', sunEl: 0.8, sunAz: 0.3, near: 70, far: 230 };
  if (t < E.travel) return day; if (t < E.home) return mix(candy, sunset, seg(t, E.board - 4, E.home) * 0.6);
  return mix(mix(sunset, eve, seg(t, E.home + 20, E.bye)), { ...eve, top: '#241c5a', bot: '#ff6a8a' }, seg(t, E.bye, 290));""")
rep("(win(t, E.collapse, E.reveal) || win(t, E.glitch, E.glitchEnd) || win(t, E.third, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0", "(win(t, E.snap, E.snap + 3) || win(t, E.bolt, E.chaseEnd) || win(t, E.laps, E.freeze)) ? Math.sin(t * 40 + i) * 2 : 0")
rline("const hpv = ", "  const hpv = t < E.snap ? 5 : t < E.travel ? 4 : t < E.bolt ? 5 : t < E.purr ? 3.5 : t < E.laps ? 5 : 3;")
rep("outlined(t > E.arrive && t < E.home ? '☀ DAY 1' : '☀ DAY 20', W / 2, 32, 18,", "outlined('☀ DAY 21', W / 2, 32, 18,")
rline("const slots = ", "  const slots = [['mallet', 1], ['crown', 1], ['flower', 1], ['shard', 1], ['duck', 9], ['pillow', win(t, E.leg1, E.leg2) ? 1 : 0], ['couch', t > E.named ? 1 : 0]];")
cut("  // paradox meter — this episode's mechanic", "ERROR' : Math.round(pc * 100)", "  // seats vs butts — this episode's mechanic\n  drawSeats(t);")
# three facecams: me (orange), past me (green, propeller), future me (red, top hat)
rep("function drawFacecam(t) { drawCam(t, 0, 16); if (win(t, E.meet, E.home) || win(t, E.twinOut, E.freeze)) drawCam(t, 1, 176); }", "function drawFacecam(t) { drawCam(t, 0, 16); drawCam(t, 1, 176); drawCam(t, 2, 336); }")
rep("gr.addColorStop(0, tw ? '#1b4d2a' : '#2a1b4d'); gr.addColorStop(1, tw ? '#0f4a3a' : '#0f2a4a');", "gr.addColorStop(0, ['#2a1b4d', '#1b4d2a', '#4d1b24'][tw]); gr.addColorStop(1, ['#0f2a4a', '#0f4a3a', '#4a0f2a'][tw]);")
rep("const mine = cue && ((cue.voice === 'twin') === !!tw);", "const mine = cue && ['me', 'twin', 'top'].indexOf(cue.voice || 'me') === tw;")
rep("ctx.fillStyle = tw ? '#3cc26a' : '#ff8a2a'; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);", "ctx.fillStyle = ['#ff8a2a', '#3cc26a', '#e8344e'][tw]; ctx.fillRect(hx - 52, hy + s / 2, 104, 60);")
rep("  if (tw) { ctx.fillStyle = '#2e8a4a';", "  if (tw === 2) { ctx.fillStyle = '#111'; ctx.fillRect(hx - s / 2 - 10, hy - s / 2 - 12, s + 20, 10); ctx.fillRect(hx - s / 2 + 10, hy - s / 2 - 58, s - 20, 48); ctx.fillStyle = '#e8344e'; ctx.fillRect(hx - s / 2 + 10, hy - s / 2 - 22, s - 20, 8); }\n  if (tw === 1) { ctx.fillStyle = '#2e8a4a';")
rep("ctx.strokeStyle = tw ? '#7cff6b' : '#ffffff'; ctx.stroke();", "ctx.strokeStyle = ['#ffffff', '#7cff6b', '#ff6b6b'][tw]; ctx.stroke();")
rep("outlined(tw ? 'PIXELPANIC (DAY 1)' : 'PIXELPANIC',", "outlined(['PIXELPANIC', 'PIXELPANIC (DAY 1)', 'PIXELPANIC (DAY 99)'][tw],")
rep("c.voice === 'twin' ? '#9dff8a' : '#ffffff'", "c.voice === 'twin' ? '#9dff8a' : c.voice === 'top' ? '#ff9a9a' : '#ffffff'")
rep("const x = W - 250 + (1 - k) * 280, y = 186;", "const x = W - 250 + (1 - k) * 280, y = 500;")
rline("const TOASTS = ", """ICON.couch = (x, y, s) => { ctx.fillStyle = '#8a3fd1'; ctx.fillRect(x - s, y - s * 0.6, s * 2, s * 0.7); ctx.fillRect(x - s, y, s * 2, s * 0.5); ctx.fillStyle = '#b06ae8'; ctx.fillRect(x - s * 0.8, y - s * 0.1, s * 1.6, s * 0.25); ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - s * 0.9, y + s * 0.5, s * 0.3, s * 0.3); ctx.fillRect(x + s * 0.6, y + s * 0.5, s * 0.3, s * 0.3); };
ICON.pillow = (x, y, s) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(x - s * 0.9, y - s * 0.5, s * 1.8, s); ctx.fillStyle = '#ffd23f'; for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) ctx.fillRect(x + a * s * 0.9 - 2, y + b * s * 0.5 - 2, 4, 4); };
ICON.ribbon = (x, y, s) => { ctx.fillStyle = '#3d7bff'; ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.6, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.5, y, s * 0.35, s); ctx.fillRect(x + s * 0.15, y, s * 0.35, s); ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(x, y - s * 0.2, s * 0.25, 0, 7); ctx.fill(); };
const TOASTS = [[E.flyer + 6, '+1 Flyer (Comfy Fair)', 'shard'], [E.wagonEnd, '+1 Sofa-Wagon', 'plank'], [E.leg1 + 1, '+1 Pillow (battle)', 'pillow'], [E.ribbon + 2, 'Leggy: FLUFFIEST PET', 'ribbon'], [E.named + 2, '+1 Sofa (alive)', 'couch']];""")
rline("const FEATS = ", "const FEATS = [[E.snap + 2, 'Structural Failure', 'Break a couch with your butt(s)'], [E.bonk + 1, 'Propeller Power', 'Win a pillow fight from above'], [E.win + 1.5, 'Team Me, Me & Me', 'Win a relay against cushions'], [E.purr + 2, 'Sofa Whisperer', 'Calm a wild sofa'], [E.sitAll + 3, 'It Fits', 'Find a seat for everyone']];")
rblock("const POPS = [", """const POPS = [[E.squeeze + 3, 1.4, 'creeeak', 0.45, 0.42, '#ffffff', 60], [E.snap, 1.6, 'CRACK!', 0.5, 0.35, '#ff8a5a', 110], [E.invoice + 1.4, 1.6, '1 COUCH: DECEASED', 0.62, 0.32, '#ff6b6b', 52], [E.wagonEnd, 1.4, 'tadaa', 0.36, 0.3, '#ffe066', 80],
  [E.arrive - 3, 1.4, 'NO BRAKES', 0.5, 0.35, '#ff6b6b', 80], [E.duke + 0.6, 1.8, 'WELCOME, SNUGGLERS!', 0.5, 0.22, '#ff9ad0', 60], [E.squint + 1, 1.6, '...triplets?', 0.4, 0.3, '#ffffff', 64], [E.leg1 + 0.4, 1.2, 'GO!', 0.5, 0.3, '#7cff6b', 110],
  [E.leg1 + 2, 1.0, 'fwump', 0.4, 0.4, '#ffffff', 60], [E.leg1 + 3.6, 1.0, 'fwump', 0.6, 0.4, '#ffe066', 60], [E.prop, 1.4, 'whirrrr', 0.4, 0.3, '#9dff8a', 70], [E.bonk, 1.6, 'FWUMP!', 0.5, 0.35, '#ffffff', 110],
  [E.leg2 + 1.2, 1.0, 'boing', 0.4, 0.45, '#5ff7ff', 60], [E.leg2 + 2.4, 1.0, 'boing', 0.5, 0.42, '#5ff7ff', 64], [E.bounce + 1.2, 1.2, 'BOING', 0.55, 0.35, '#5ff7ff', 90], [E.tent, 1.4, 'flomp', 0.5, 0.35, '#ff6b6b', 80],
  [E.leg3 + 2, 1.4, 'hnnngh', 0.42, 0.4, '#ffffff', 64], [E.nap + 2.6, 1.6, 'zzz', 0.55, 0.35, '#5ad1c8', 80], [E.win, 1.8, 'WINNERS!', 0.5, 0.25, '#7cff6b', 110], [E.ribbon, 1.6, 'FLUFFIEST!', 0.5, 0.3, '#3d7bff', 90],
  [E.unveil, 1.6, 'TA-DAAA!', 0.5, 0.25, '#ffe066', 100], [E.blink, 1.2, 'blink', 0.5, 0.42, '#ffffff', 56], [E.alive, 1.6, "IT'S ALIVE", 0.5, 0.25, '#ff6b6b', 100], [E.bolt + 0.8, 1.2, 'squish', 0.5, 0.5, '#ff9ad0', 70],
  [E.bolt + 4, 1.2, 'BOING', 0.4, 0.3, '#5ff7ff', 90], [E.leggyCalm + 3, 1.4, 'quack?', 0.45, 0.4, '#ffd23f', 64], [E.purr, 1.8, 'purrrrrr', 0.5, 0.3, '#ff9ad0', 84], [E.bloopSit + 1.6, 1.6, '*sits*', 0.5, 0.3, '#9fdc5a', 80],
  [E.rip, 1.4, 'RRRIP', 0.5, 0.3, '#ffffff', 96], [E.sitAll, 1.6, 'IT FITS!', 0.5, 0.25, '#7cff6b', 110], [E.squeak, 1.4, 'squeak.', 0.6, 0.4, '#ffd23f', 80], [E.excited, 1.4, '!!!', 0.5, 0.3, '#ff6b6b', 110],
  [E.laps + 2, 1.4, 'WHEEE', 0.5, 0.3, '#b06ae8', 90], [E.lapsEnd + 3, 1.4, 'MOVE!', 0.6, 0.3, '#ff6b6b', 90], [E.leap, 1.6, 'BOUNCE', 0.4, 0.25, '#b06ae8', 100]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.snap, 0.8, 1.12, 0.5, 0.5], [E.squint, 1.0, 1.12, 0.5, 0.5], [E.bonk, 0.6, 1.15, 0.5, 0.45], [E.blink, 0.8, 1.2, 0.5, 0.5], [E.purr, 1.0, 1.1, 0.5, 0.5], [E.squeak, 0.8, 1.2, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.snap, 1, 0.3], [E.arrive - 0.4, 0.6, 0.15], [E.bonk, 0.5, 0.2], [E.tent, 0.6, 0.2], [E.alive, 1.6, 0.1], [E.bolt + 1.4, 0.6, 0.3], [E.purr, 4, 0.02], [E.laps, 10, 0.05], [E.leap, 4.2, 0.06]];")
rline("const FLASH = ", "const FLASH = [[E.snap, 0.2, '255,255,255'], [E.win, 0.3, '255,240,160'], [E.unveil, 0.25, '255,255,255'], [E.leap + 3.4, 0.4, '160,250,255']];")
rep("outlined('EPISODE 20', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE TIME MACHINE', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it works. really.)'",
    "outlined('EPISODE 21', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THREE OF ME', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(we need a bigger couch)'")
rep("outlined(i ? 'EP 21: THREE OF ME' : 'EP 19: THE TREASURE MAP', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(we need a bigger couch)' : '(X marks the wrong spot)', x + 110, y + 80, 14",
    "outlined(i ? 'EP 22: THE GHOST TRAIN' : 'EP 20: THE TIME MACHINE', x + 110, y + 50, 17, '#ffe066', '#000', 4); outlined(i ? '(next stop: AAAAH)' : '(it works. really.)', x + 110, y + 80, 14")
rep("outlined('yep. it works. too well.', 0, 0, 56", "outlined('yep. it fits.', 0, 0, 56")
rep("\"that's me. and me. and me.\"", "\"all of us. in a phone booth.\"")
rep("'(the house is fine though)'", "'(it does not fit)'")
rline("const SECS = ", "const SECS = [[0, E.travel, yard, 'yard'], [E.travel, E.home, fair, 'fair'], [E.home, 1e9, yard, 'yard']];")
rline("const panic = ", "  const panic = win(T, E.snap, E.snap + 2) || win(T, E.alive, E.chaseEnd) || win(T, E.laps, E.freeze);")
rep("if (win(T, E.build1, E.build1End) || win(T, E.buildTL, E.buildTLEnd)) { const bl", "if (win(T, E.wagon, E.wagonEnd)) { const bl")
rep("""    if (T > E.arrive && T < E.home && !frozen) { ctx.fillStyle = 'rgba(255,170,80,.07)'; ctx.fillRect(0, 0, W, H); }
    stamp(T, E.arrive + 2, 'DAY 1  (19 DAYS AGO)');
    stamp(T, E.ruinMe + 0.4, 'DISASTER #1: CAUSED BY ME');
    stamp(T, E.reveal2 + 1.6, 'HOUSE: STANDING. NOT TILTED.');
    drawGlitch(T); drawWarp(T);""", """    stamp(T, E.snap + 0.8, 'COUCH: DECEASED');
    stamp(T, E.squint + 7, 'TEAM ME, ME & ME');
    stamp(T, E.win + 0.8, 'WINNERS (TECHNICALLY)');
    stamp(T, E.alive + 0.6, 'PRIZE: ALIVE');
    stamp(T, E.sitAll + 1.6, 'SEATS 12. BUTTS 6. FINALLY.');
    drawFlyer(T);""")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
