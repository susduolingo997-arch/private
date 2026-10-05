# ep7 scene.js = ep6 head + ep6 shared-cast prelude (minus volcano-only bits) + body7 + ep6 compositor tail
src = open('../ep6/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 6')
i1 = src.index('// ---------------------------------------------------------------- set A: the fountain meadow')
i2 = src.index('// ---------------------------------------------------------------- lighting per time')
pre = src[i0:i1]
# drop volcano-only helpers from the prelude
for a, b in [('function makeVolcano', 'function heatAt'), ('const houseG = new THREE.Group()', 'const smoke = (t0')]:
    j, k = pre.index(a), pre.index(b); pre = pre[:j] + pre[k:]
pre = pre.replace('// ================================================================ EPISODE 6: "I LIVE IN A VOLCANO (it\'s fine)"  — meadow → ash trek → crater → meadow',
                  '// ================================================================ EPISODE 7: "THE ICEBERG (it melts)" — shared cast + props carried over')
s = src[:i0] + pre + open('body7.js').read() + '\n' + src[i2:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rblock(start, new):
    global s; i = s.index(start); j = s.index('];\n', i) + 3; s = s[:i] + new + '\n' + s[j:]
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
# --- sky: dawn beach → fog at sea → bright polar → sunset beach
rep("""  const haze = { top: '#7a3a3a', bot: '#ffb070', sunI: 1.6, hemiI: 1.1, fog: '#c88a6a', sunEl: 0.35, sunAz: 0.6, near: 25, far: 150 };
  if (t < E.trek) return day;
  if (t < E.flyEnd) return mix(day, haze, ss(seg(t, E.trek, E.trek + 12)));
  return mix(mix(haze, day, 0.6), sunset, ss(seg(t, 250, 285)));""",
"""  const dawn = { top: '#2e4a8a', bot: '#ffb6a0', sunI: 1.5, hemiI: 1.1, fog: '#d8b0b8', sunEl: 0.1, sunAz: 0.3, near: 50, far: 200 };
  const fog_ = { top: '#9fb6c8', bot: '#dde8f0', sunI: 0.8, hemiI: 1.3, fog: '#d2e0ea', sunEl: 0.5, sunAz: 0.6, near: 12, far: 60 };
  const polar = { top: '#4aa8e8', bot: '#e8f6ff', sunI: 2.4, hemiI: 1.7, fog: '#dff0fb', sunEl: 0.55, sunAz: 0.9, near: 60, far: 240 };
  if (t < 12) return mix(dawn, day, ss(seg(t, 4, 12)));
  if (t < E.sail) return day;
  if (t < E.arrive) return mix(day, fog_, ss(seg(t, E.sail, E.sail + 7)));
  if (t < E.sink) return mix(fog_, polar, ss(seg(t, E.arrive, E.arrive + 6)));
  if (t < E.shore) return mix(polar, day, ss(seg(t, E.sink, E.shore)));
  return mix(day, sunset, ss(seg(t, 250, 285)));""")
# --- HUD
rep("""ICON.brick = (x, y, s) => isoCube(x, y, s, '#d8573a', '#b8442c', '#8e3220');""",
"""ICON.ice = (x, y, s) => isoCube(x, y, s, '#e8f8ff', '#9fdcf5', '#6fb4d8');
ICON.fish = (x, y, s) => { ctx.fillStyle = '#ff9a2a'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.8, s * 0.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x - s * 1.2, y - s * 0.5); ctx.lineTo(x - s * 1.2, y + s * 0.5); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + s * 0.35, y - s * 0.12, s * 0.12, 0, 7); ctx.fill(); };
ICON.gold = (x, y, s) => { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y, s * 0.8, s * 0.5, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - s * 0.7, y); ctx.lineTo(x - s * 1.2, y - s * 0.5); ctx.lineTo(x - s * 1.2, y + s * 0.5); ctx.fill(); ctx.fillStyle = '#8a6a00'; ctx.beginPath(); ctx.arc(x + s * 0.35, y - s * 0.12, s * 0.12, 0, 7); ctx.fill(); };
ICON.boot = (x, y, s) => { ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - s * 0.3, y - s * 0.8, s * 0.6, s * 1.1); ctx.fillRect(x - s * 0.3, y + s * 0.1, s * 1.1, s * 0.45); ctx.fillStyle = '#222'; ctx.fillRect(x - s * 0.36, y + s * 0.5, s * 1.2, s * 0.22); };""")
rline("const hpv = ", "  const hpv = t < E.slip ? 5 : t < E.steal ? 4.5 : t < E.crack ? 4 : t < E.land ? 3 : t < E.sink ? 3.5 : 2.5;")
rep("(night ? '☾ NIGHT 6' : '☀ DAY 6')", "(night ? '☾ NIGHT 7' : '☀ DAY 7')")
rline("const slots = ", "  const slots = [['rod', 1], ['ice', t > 62 ? 24 : 0], ['boot', t > E.boot ? 1 : 0], ['fish', win(t, E.tiny, E.steal) ? 1 : 0], ['crown', 1], ['gold', t > E.win && t < E.melt + 5 ? 1 : 0], ['shard', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, 62, E.win)) sel = 0; if (win(t, E.boot, E.boot + 7)) sel = 2; else if (win(t, E.tiny, E.steal)) sel = 3; else if (win(t, E.win, E.melt + 5)) sel = 5;")
rline("const ht = heatAt(t)", """  // Frostbite Cup scoreboard
  if (win(t, E.start, E.sink)) { const mine = t < E.tiny ? 0 : t < E.steal ? 1 : t < E.land ? 0 : 99, best = t < E.land ? 6 : 99;
    rrect(22, 96, 196, 84, 12); ctx.fillStyle = 'rgba(10,14,30,.6)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5ff7ff'; ctx.stroke();
    outlined('FROSTBITE CUP', 120, 116, 16, '#5ff7ff', '#000', 4);
    outlined('YOU', 40, 144, 18, '#fff', '#000', 3, 'left'); outlined(mine === 99 ? '1 BIG' : String(mine), 200, 144, 20, mine === 99 ? '#ffe066' : '#fff', '#000', 4, 'right');
    outlined('SEALS', 40, 166, 18, '#cfe0ff', '#000', 3, 'left'); outlined(best === 99 ? '—' : String(best), 200, 166, 20, '#cfe0ff', '#000', 4, 'right'); }
  // melt meter
  if (win(t, E.wet, E.sink + 4)) { const ice = iceAt(t), gx = 30, gy = 200, gh = 120;
    rrect(gx - 12, gy - 8, 24, gh + 16, 12); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ice < 0.35 && Math.floor(t * 6) % 2 ? '#ff2a4a' : '#0d1b2a'; ctx.stroke();
    const fh = gh * clamp(ice, 0, 1); rrect(gx - 6, gy + gh - fh, 12, fh, 6); ctx.fillStyle = ice < 0.35 ? '#ff6b6b' : '#9fdcf5'; ctx.fill();
    outlined('ICE', gx + 4, gy + gh + 22, 13, '#fff', '#000', 3); if (ice < 0.35) outlined('!!!', gx + 22, gy + 6 + Math.sin(t * 20) * 2, 20, '#ff2a4a', '#000', 4, 'left'); }""")
# drop ep6's leftover heat-gauge body (its `const ht/gx/gy/gh` line was replaced above)
i = s.index("  rrect(gx - 12, gy - 8, 24, gh + 16, 12); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = over")
j = s.index("if (cold) outlined", i); j = s.index('\n', j) + 1
s = s[:i] + s[j:]
rline("const TOASTS = ", "const TOASTS = [[E.makeEnd, '+1 Raft (not a house)', 'plank'], [E.boot + 0.6, '+1 Soggy Boot', 'boot'], [E.invoice, 'Invoice #007: 9 holes', 'plank'], [E.win + 0.4, '+1 Golden Fish', 'gold']];")
rline("const FEATS = ", "const FEATS = [[E.drillEnd + 0.5, 'Perfectly Round', 'Let Bloop drill nine holes'], [E.reveal + 2, 'Stowaway', 'Find Puff in the bait bucket'], [E.jump + 1.5, 'Iceberg Water Ski', 'Get towed by a crowned fish'], [E.win + 1, 'Frostbite Champion', 'Win the Frostbite Cup']];")
rblock("const POPS = [", """const POPS = [[E.poster + 0.3, 1.4, 'FROSTBITE CUP!', 0.5, 0.26, '#5ff7ff', 70], [E.slip + 0.3, 1.4, 'SPLIIITS', 0.5, 0.32, '#ffffff', 72], [E.drill + 1, 1.2, 'bzzzz', 0.45, 0.35, '#ffd400', 54],
  [E.start, 1.2, 'FISH!', 0.5, 0.3, '#ffe066', 80], [E.boot + 0.4, 1.4, 'a boot.', 0.5, 0.34, '#cfe0ff', 62], [E.cube + 0.4, 1.4, 'an ice cube.', 0.5, 0.34, '#bfe8ff', 58], [E.steal, 1.4, 'THIEF!', 0.55, 0.3, '#ff6b6b', 76],
  [E.wet + 0.4, 1.2, 'drip...', 0.42, 0.4, '#5aa8ff', 54], [E.reveal, 1.6, 'PUFF?!', 0.5, 0.28, '#ff8a1e', 92], [E.crack, 1.8, 'KRRRAK!', 0.5, 0.28, '#ffffff', 96], [E.race, 1.6, 'VROOOM', 0.5, 0.3, '#ffd400', 76],
  [E.bite, 2.0, 'GLUBZILLA!', 0.5, 0.26, '#2fa88c', 92], [187, 1.4, 'TRIPLE AXEL', 0.5, 0.3, '#5ff7ff', 64], [E.jump, 1.2, 'JUMP!', 0.5, 0.3, '#ffe066', 80], [E.land, 1.4, 'KA-THUMP', 0.5, 0.32, '#ffffff', 76],
  [E.win, 2.0, 'WINNER!', 0.5, 0.25, '#ffd23f', 96], [E.melt + 2, 1.4, 'drip. drip.', 0.5, 0.34, '#ffd23f', 60], [E.sink, 1.6, 'SPLOOSH', 0.5, 0.3, '#5aa8ff', 84], [E.bill + 1.2, 1.6, '2,000 LOGS', 0.5, 0.3, '#ff6b6b', 76]];""")
rline("const ZOOMS = ", "const ZOOMS = [[E.poster, 0.8, 1.15, 0.5, 0.5], [E.steal, 0.8, 1.2, 0.5, 0.5], [E.reveal, 1.0, 1.3, 0.5, 0.5], [E.crack, 1.0, 1.25, 0.5, 0.5], [E.bite, 1.2, 1.3, 0.5, 0.5], [E.land, 0.8, 1.2, 0.5, 0.5], [E.win, 1.0, 1.2, 0.5, 0.5], [E.sink, 1.0, 1.2, 0.5, 0.5], [E.bill + 1, 0.8, 1.15, 0.5, 0.5]];")
rline("const SHAKES = ", "const SHAKES = [[E.make, 9, 0.02], [E.drill, 14, 0.03], [E.slip, 0.8, 0.2], [E.crack, 3, 0.35], [E.crack + 3, 20, 0.05], [E.bite, 3, 0.3], [E.land, 1.2, 0.35], [E.sink, 4, 0.25]];")
rline("const FLASH = ", "const FLASH = [[E.reveal, 0.3, '255,170,60'], [E.crack, 0.25, '255,255,255'], [E.win, 0.3, '255,230,120']];")
rep("outlined('EPISODE 6', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('I LIVE IN A VOLCANO', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it\\'s fine)'",
    "outlined('EPISODE 7', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('THE FROSTBITE CUP', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it melts)'")
rep("'(it was not fine)'", "'(Bloop wants his money)'")
rep("outlined(i ? 'EP 7: THE ICEBERG' : 'EP 5: UNDERGROUND', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it melts)' : '(it flooded)'",
    "outlined(i ? 'EP 8: BLOOP QUITS?!' : 'EP 6: THE VOLCANO', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(pay the invoice)' : '(it was not fine)'")
rline("const SECS = ", "const SECS = [[0, E.sail, shore, 'shore'], [E.sail, E.shore, bergSet, 'berg'], [E.shore, 1e9, shore, 'shore']];")
rep("  if (res.lava) { setSky('#1a0505', '#6a1a08'); scene.fog.color.set('#3a0d06'); scene.fog.near = 30; scene.fog.far = 120; hemi.intensity = 1.0; hemi.color.set('#ffb08a'); hemi.groundColor.set('#ff4a10'); sun.intensity = 0.7; }\n  else if (cave)", "  if (cave)")
rep("sunMesh.visible = sunGlow.visible = !cave && !res.lava && S.sunEl > -0.05;", "sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05 && !win(t, E.sail + 4, E.arrive + 3);")
rep("clouds.visible = !cave && !res.lava;", "clouds.visible = !cave;")
rep("hemi.groundColor.set('#6a7a4a');", "hemi.groundColor.set(t > E.sail && t < E.sink ? '#9fc8e0' : '#6a7a4a');")
rline("const panic = ", "  const panic = win(T, E.steal, E.steal + 2) || win(T, E.crack, E.mount) || win(T, E.bite, E.land) || win(T, E.sink, E.sink + 5);")
rep("if (win(T, E.build, E.buildEnd)) {", "if (win(T, E.make, E.makeEnd) || win(T, E.drill, E.drillEnd)) {")
rep("    if (win(T, E.score, E.score + 11))", "    if (win(T, 9999, 9999))")
rep("    stamp(T, E.void, 'WARRANTY: VOID');", """    if (win(T, E.poster, E.posterEnd)) { const k = ss(seg(T, E.poster, E.poster + 0.35)) * (1 - ss(seg(T, E.posterEnd - 0.35, E.posterEnd)));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(W * 0.5, H * 0.46 + (1 - k) * 60); ctx.rotate(-0.03); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k);
      ctx.fillStyle = '#f2fbff'; ctx.fillRect(-230, -175, 460, 350); ctx.fillStyle = '#1b2a6a'; ctx.fillRect(-230, -175, 460, 60);
      outlined('FROSTBITE CUP', 0, -145, 34, '#ffffff', '#1b2a6a', 3); ICON.fish(0, -60, 34);
      const rows = [[0.8, 'Biggest fish wins'], [1.8, 'Prize: SOLID GOLD FISH'], [2.8, 'Iceberg. Today. Bring a rod.'], [3.8, 'No houses. Fishing only.']];
      rows.forEach(([d, txt], i) => { if (T < E.poster + d) return; outlined(txt, 0, 10 + i * 42, i === 1 ? 24 : 20, i === 1 ? '#c08a00' : '#1b2a6a', '#f2fbff', 3); });
      ctx.restore(); }
    stamp(T, E.win + 1.6, 'FROSTBITE CHAMPION');""")
# ep5's leftover "REEL IT IN!" bar: repurpose it for the Glubzilla tow instead of leaving it on all episode
rep("if (win(t, E.bite, E.jelly)) { const k = seg(t, E.bite, E.jelly);", "if (win(t, E.bite, E.land)) { const k = seg(t, E.bite, E.land);")
rep("'yep. it\\'s fine.'", "'yep. it melted.'")
rep("\"that's me. medium-rare.\"", "\"that's me. soggy again.\"")
rep("(t > E.erupt && t < E.land)", "(t > E.crack && t < E.land)")
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
