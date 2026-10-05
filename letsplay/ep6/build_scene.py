# assembles scene.js from ep5's head/tail + body6.js; every replacement must match exactly once
src = open('../ep5/scene.js').read()
i0 = src.index('// ================================================================ EPISODE 5')
i1 = src.index('// ---------------------------------------------------------------- lighting per time')
s = src[:i0] + open('body6.js').read() + '\n' + src[i1:]
def rep(old, new):
    global s; assert s.count(old) == 1, old; s = s.replace(old, new)
def rline(prefix, new):
    global s; L = s.split('\n'); m = [i for i, l in enumerate(L) if l.lstrip().startswith(prefix)]; assert len(m) == 1, (prefix, len(m)); L[m[0]] = new; s = '\n'.join(L)
rep("  if (t < 250) return day;\n  return mix(day, sunset, ss(seg(t, 250, 285)));",
"""  const haze = { top: '#7a3a3a', bot: '#ffb070', sunI: 1.6, hemiI: 1.1, fog: '#c88a6a', sunEl: 0.35, sunAz: 0.6, near: 25, far: 150 };
  if (t < E.trek) return day;
  if (t < E.flyEnd) return mix(day, haze, ss(seg(t, E.trek, E.trek + 12)));
  return mix(mix(haze, day, 0.6), sunset, ss(seg(t, 250, 285)));""")
rep("function drawHUD(t, info) {", """ICON.brick = (x, y, s) => isoCube(x, y, s, '#d8573a', '#b8442c', '#8e3220');
ICON.frost = (x, y, s) => isoCube(x, y, s, '#e8fbff', '#b4e4fa', '#7cc8ee');
ICON.thermo = (x, y, s) => { ctx.fillStyle = '#f4f4f4'; ctx.fillRect(x - s * 0.22, y - s, s * 0.44, s * 1.5); ctx.fillStyle = '#e8344e'; ctx.beginPath(); ctx.arc(x, y + s * 0.6, s * 0.42, 0, 7); ctx.fill(); ctx.fillRect(x - s * 0.1, y - s * 0.3, s * 0.2, s); };
function drawHUD(t, info) {""")
rline("const hpv = ", "  const hpv = t < E.pet ? 5 : t < E.hot ? 4.5 : t < E.erupt ? 4 : t < E.land ? 3 : 2.5;")
rep("(night ? '☾ NIGHT 5' : '☀ DAY 5')", "(night ? '☾ NIGHT 6' : '☀ DAY 6')")
rline("const slots = ", "  const slots = [['mallet', 1], ['brick', t > E.build ? 64 : 0], ['frost', t > E.fan - 1 ? 16 : 0], ['castle', 12], ['crown', 1], ['thermo', 1], ['shard', 0]];")
rline("let sel = 0;", "  let sel = 0; if (win(t, E.build, E.buildEnd)) sel = 1; else if (win(t, E.fan, E.fanEnd + 0.5)) sel = 2; else if (win(t, 91, 100)) sel = 5;")
rline("const xp = ", """  const xp = clamp((t - 30) / 200, 0, 1) * 0.8; rrect(cx0 - 30, H - 86, (6 * 64 + 60) * xp, 8, 4); ctx.fillStyle = '#ff5cf0'; ctx.fill();
  // heat-o-meter gauge
  const ht = heatAt(t), over = ht > 1, cold = ht < 0.15 && t > E.crust; const gx = 30, gy = 96, gh = 150;
  rrect(gx - 12, gy - 8, 24, gh + 16, 12); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = over && Math.floor(t * 6) % 2 ? '#ff2a4a' : '#0d1b2a'; ctx.stroke();
  const fh = gh * Math.min(1, ht); const gr2 = ctx.createLinearGradient(0, gy + gh, 0, gy); gr2.addColorStop(0, '#5ff7ff'); gr2.addColorStop(0.5, '#ffd23f'); gr2.addColorStop(1, '#ff2a4a');
  rrect(gx - 6, gy + gh - fh, 12, fh, 6); ctx.fillStyle = gr2; ctx.fill();
  outlined('HEAT', gx + 4, gy + gh + 22, 13, '#fff', '#000', 3);
  if (over) outlined('!!!', gx + 22, gy + 6 + Math.sin(t * 20) * 2, 22, '#ff2a4a', '#000', 4, 'left'); if (cold) outlined('brrr', gx + 20, gy + gh - 6, 16, '#7fe8ff', '#000', 3, 'left');""")
rline("const TOASTS = ", "const TOASTS = [[E.build + 1, '+64 Fire Bricks', 'brick'], [E.munch + 1.2, '-1 Blueprint (eaten)', 'plank'], [E.fan + 0.5, '+16 Frost Blocks', 'frost'], [E.tub + 1, '+1 Hot Tub (finally)', 'castle']];")
rline("const FEATS = ", "const FEATS = [[E.buildEnd + 0.6, 'Lava View', 'Build a house inside a volcano'], [E.puff + 9, 'Tiny & Spicy', 'Befriend a Magmite'], [E.crust + 6.4, 'Air Conditioning', 'Turn off a volcano'], [E.flyEnd + 0.5, 'Frequent Flyer', 'Launch a house into the sky (again)']];")
rline("const POPS = ", """const POPS = [[E.rim + 0.4, 1.4, 'WHOA.', 0.5, 0.3, '#ffb43a', 80], [E.puff, 1.2, 'blip!', 0.4, 0.5, '#ff8a1e', 60], [E.pet + 0.3, 1.4, 'FWOOMP!', 0.6, 0.35, '#ff6a1a', 84], [E.munch, 1.2, 'CRUNCH', 0.6, 0.4, '#ffffff', 60],
  [E.hot, 1.4, 'POP!', 0.65, 0.35, '#ff3a3a', 76], [E.chill, 1.4, 'WHIRRR', 0.4, 0.3, '#bfe8ff', 64], [E.crust + 1, 1.6, 'FSSSHHH', 0.5, 0.3, '#bfe8ff', 70], [E.shiver, 1.4, 'brrr...', 0.6, 0.35, '#7fe8ff', 58], [E.rumble, 1.6, 'GRRRMBL', 0.5, 0.3, '#ff7a1a', 70],
  [E.crack, 1.2, 'CRACK', 0.5, 0.35, '#ffe27a', 70], [E.erupt, 2.0, 'KABLOOOM!', 0.5, 0.28, '#ff8a1e', 100], [E.surf + 3, 1.6, 'SURF\\'S UP', 0.5, 0.25, '#ffe066', 64], [E.splash, 1.4, 'SPLOOSH', 0.5, 0.3, '#5aa8ff', 84], [E.land, 1.0, 'SKRRT', 0.5, 0.4, '#ffffff', 60], [E.tub, 1.6, 'HOT TUB!!', 0.5, 0.25, '#ff6fb8', 80]];""")
rline("[E.geyser, 1.8, 'WHEEEE!'", "")
rline("const ZOOMS = ", "const ZOOMS = [[E.pet + 0.3, 0.8, 1.2, 0.5, 0.5], [E.hot, 0.8, 1.2, 0.5, 0.5], [E.shiver, 1.0, 1.2, 0.5, 0.5], [E.crack, 0.8, 1.25, 0.5, 0.5], [E.erupt, 1.2, 1.3, 0.5, 0.5], [E.splash, 1.0, 1.2, 0.5, 0.5], [E.land, 0.8, 1.15, 0.5, 0.6]];")
rline("const SHAKES = ", "const SHAKES = [[E.build, 19, 0.02], [E.rumble, 3, 0.3], [E.rumble + 3, 27, 0.07], [E.crack, 4, 0.3], [E.erupt, 18, 0.35], [E.splash, 1, 0.3], [E.land, 0.6, 0.25]];")
rline("const FLASH = ", "const FLASH = [[E.erupt, 0.4, '255,170,60'], [E.splash, 0.25, '255,255,255']];")
rep("outlined('EPISODE 5', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('I LIVE UNDERGROUND', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it floods)'",
    "outlined('EPISODE 6', 70, H * 0.3 + 45, 26, '#5ff7ff', '#000', 5, 'left'); outlined('I LIVE IN A VOLCANO', 70, H * 0.3 + 92, 40, '#ffffff', '#000', 7, 'left'); outlined('(it\\'s fine)'")
rep("outlined(i ? 'EP 6: THE VOLCANO' : 'EP 4: THE SKY', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it\\'s fine)' : '(it fell)'",
    "outlined(i ? 'EP 7: THE ICEBERG' : 'EP 5: UNDERGROUND', x + 110, y + 50, 18, '#ffe066', '#000', 4); outlined(i ? '(it melts)' : '(it flooded)'")
rline("const SECS = ", "const SECS = [[0, E.trek, meadow, 'meadow'], [E.trek, E.rim, trek, 'trek'], [E.rim, E.flyEnd, crater, 'crater'], [E.flyEnd, 1e9, meadow, 'meadow']];")
rep("  if (cave) { setSky(", "  if (res.lava) { setSky('#1a0505', '#6a1a08'); scene.fog.color.set('#3a0d06'); scene.fog.near = 30; scene.fog.far = 120; hemi.intensity = 1.0; hemi.color.set('#ffb08a'); hemi.groundColor.set('#ff4a10'); sun.intensity = 0.7; }\n  else if (cave) { setSky(")
rep("hemi.color.set(t > 194 && t < E.dawn ? '#8aa0ff' : '#d6eeff');", "hemi.color.set('#d6eeff');")
rep("sunMesh.visible = sunGlow.visible = !cave && S.sunEl > -0.05;", "sunMesh.visible = sunGlow.visible = !cave && !res.lava && S.sunEl > -0.05;")
rep("clouds.visible = !cave;", "clouds.visible = !cave && !res.lava;")
rline("const panic = ", "  const panic = win(T, E.pet + 0.3, E.pet + 4.2) || win(T, E.hot, E.hot + 3) || win(T, E.crack, E.flyEnd);")
rep("if (win(T, E.dig, E.digEnd) || win(T, E.furnish, E.furnishEnd)) {", "if (win(T, E.build, E.buildEnd)) {")
rline("if (win(T, 9999, 9999))", """    if (win(T, E.score, E.score + 11)) { const k = ss(seg(T, E.score, E.score + 0.4)) * (1 - ss(seg(T, E.score + 10.6, E.score + 11))); ctx.save(); ctx.globalAlpha = k; ctx.translate(40 + (1 - k) * -200, 200); rrect(0, 0, 400, 190, 16); ctx.fillStyle = 'rgba(20,14,50,.88)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffe066'; ctx.stroke();
      outlined('SCOREBOARD', 200, 30, 26, '#ffe066', '#000', 5); [[1.0, 'Houses survived', '0', '#ff6b6b'], [2.4, 'Disasters', '6', '#ffb43a'], [4.4, 'New friends', '1 (spicy)', '#7cff6b']].forEach(([d, a, b2, c], i) => { if (T < E.score + d) return; outlined(a, 24, 76 + i * 40, 20, '#fff', '#000', 4, 'left'); outlined(b2, 376, 76 + i * 40, 22, c, '#000', 4, 'right'); }); ctx.restore(); }
    stamp(T, E.void, 'WARRANTY: VOID');""")
rep("'yep. it flooded.'", "'yep. it\\'s fine.'")
rep("\"that's me. damp.\"", "\"that's me. medium-rare.\"")
rep("'(Leggy sneezed)'", "'(it was not fine)'")
rep("(t > E.burst && t < E.land)", "(t > E.erupt && t < E.land)")
assert 'E.spring' not in s.split('// ---------------------------------------------------------------- 2D compositor')[1].split('function drawLog')[0], 'leftover ep5 refs in HUD'
open('scene.js', 'w').write(s)
print('ok', len(s.splitlines()))
