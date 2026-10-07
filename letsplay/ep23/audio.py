"""Episode 23 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_poof(): d = 1.4; return mix(lp(noise(d), 1200) * 1.2, osc(sweep(120, 40, d), d) * 0.6) * env_ad(int(SR * d), 0.005, 0.6)
def s_whisk(d=1.6): return bp(noise(d), 2000, 7000) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * T(d))) * 0.3
def s_egg(): d = 0.25; return mix(bp(noise(d), 1500, 6000) * 0.8, osc(sweep(600, 200, d), d) * 0.2) * env_ad(int(SR * d), 0.001, 0.06)
def s_chomp(): d = 0.4; return mix(lp(noise(d), 900) * 1.0, osc(sweep(200, 80, d), d, 'square') * 0.3) * env_ad(int(SR * d), 0.002, 0.15)
def s_crunch(): d = 0.8; return mix(*[np.pad(bp(noise(0.06), 800, 6000) * 1.2, (int(SR * i * 0.07), 0))[:int(SR * d)] for i in range(10)])
def s_splat(): d = 0.5; return mix(lp(noise(d), 700) * 1.3, osc(sweep(300, 90, d), d) * 0.4) * env_ad(int(SR * d), 0.002, 0.12)
def s_clang(): d = 1.0; return mix(osc(1250, d) * 0.3, osc(1873, d) * 0.2, osc(2700, d) * 0.1) * env_ad(int(SR * d), 0.001, 0.4)
def s_roar(d=1.6): return mix(lp(noise(d), 600) * 0.8, osc(70 + 15 * np.sin(2 * np.pi * 9 * T(d)), d, 'saw') * 0.4) * np.sin(np.pi * T(d) / d)
def s_waah(d=2.0): return osc(700 - 200 * T(d) / d + 40 * np.sin(2 * np.pi * 6 * T(d)), d, 'tri') * np.sin(np.pi * T(d) / d) * 0.3
def s_shutter(): return mix(s_click(), np.pad(s_click(), (int(SR * 0.08), 0)))
def s_hum2(d): return mix(osc(80, d, 'saw') * 0.2, osc(160.5, d) * 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * T(d))) * np.minimum(1, T(d) / 0.5)
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['poof'], 116, 60, [C, F_, G_, C], seed=2301, gain=0.26, drums=1, wave='tri', swing=0.25)   # morning kitchen
track(E['poof'] + 2, E['tent'], 120, 62, [C, Am, F_, G_], seed=2302, gain=0.26, drums=1, wave='square')
track(E['tent'], E['bake'], 96, 65, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2303, gain=0.24, drums=1, wave='tri', swing=0.35)   # bake-off waltz-ish
track(E['bake'], E['glow'], 150, 62, [C, F_, G_, C], seed=2304, gain=0.32, drums=2, lead=2, wave='square')   # baking montage
pad(E['glow'], E['ding'], [56, 59, 62, 65], 0.2, 700, fade=0.3)
track(E['judging'], E['reveal'], 100, 60, [C, G_, Am, F_], seed=2305, gain=0.22, drums=1, wave='tri')
pad(E['reveal'], E['alive'], [57, 60, 63], 0.2, 800, fade=0.3)
track(E['alive'] + 2, E['frost'], 168, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2306, gain=0.36, drums=2, wave='saw')   # cake rampage
track(E['frost'], E['place'], 156, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2307, gain=0.34, drums=2, wave='saw')
pad(E['place'], E['crunch'], [57, 60, 64], 0.18, 700, fade=0.3)
track(E['cry'], E['judgeWake'], 72, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2308, gain=0.2, drums=0, wave='tri')
mput(s_fanfare(), E['award'] + 0.6, 0.9); track(E['award'] + 2, E['calm'], 132, 60, [C, F_, G_, C], seed=2309, gain=0.32, drums=2, wave='square')
track(E['calm'], E['fork'], 76, 60, [C, Am, F_, G_], seed=2310, gain=0.24, drums=1, wave='tri')   # sunset in Crumbleton
track(E['chase'], E['throwPie'], 176, 60, [C, F_, G_, C], seed=2311, gain=0.34, drums=2, wave='square')
pad(E['throwPie'], E['freeze'], [48, 55, 60, 64], 0.2, 900, fade=0.3)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2312, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2313, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(E['ovenB'], E['mix'], 0.5): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
put(s_whisk(3), E['mix'] + 0.5, 0.6); put(s_hum2(4), E['test'], 0.5); put(s_poof(), E['poof'], 1.0)
put(s_chirp(), E['letter'], 0.5); put(s_sparkle(), E['sugar'] + 1, 0.7); put(s_bell(1320, 1.2, 0.6), E['bake'], 0.8)
put(s_egg(), E['egg'] + 1, 0.9)
for t in np.arange(E['brick'], E['brick'] + 3, 0.4): put(s_thock(), t, 0.3, -0.2)
put(s_whisk(2), E['pillow'], 0.5); put(s_sparkle(), E['sugar2'], 0.9); put(s_hum2(E['ding'] - E['glow']), E['glow'], 0.7); put(s_ding(), E['ding'], 0.9)
put(s_chomp(), E['judgeDuke'] + 1, 0.6); put(s_chomp(), E['judgeLump'] + 1, 0.5); put(s_crack(), E['judgeBrick'] + 2, 0.9)
put(s_creak(1.0), E['reveal'] - 0.4, 0.6); put(s_blorp(0.8), E['alive'], 0.8); put(s_chomp(), E['chomp1'] + 0.6, 1.0); put(s_chomp(), E['chomp2'] + 0.6, 1.0)
put(s_roar(), E['panic'], 0.9); put(s_bonk(), E['panic'] + 0.5, 0.6); put(s_boom(2.0, 0.8), E['burst'], 1.0); put(s_clatter(1.6, 24, 1800), E['burst'] + 0.3, 0.7)
put(s_boom(1.6, 0.6), E['square'] + 1.4, 1.0); put(s_roar(2.0), E['stomp'], 1.0)
for t in np.arange(E['square'] + 2, E['whisk'], 0.6): put(s_thock(), t, 0.4)
put(s_whoosh(1.0, 300, 2000), E['frost'], 0.6); put(s_splat(), E['frost'] + 1.2, 1.0)
for t in [E['whisk'] + 1, E['whisk'] + 3, E['whisk'] + 4.4, E['whisk'] + 6]: put(s_clang(), t, 0.7, rs.uniform(-.3, .3))
put(s_chomp(), E['leggyBite'], 0.9)
for t in np.arange(E['feast'], E['fights'], 0.35): put(s_chomp() * 0.5, t, 0.5, rs.uniform(-.7, .7))
for t in np.arange(E['fights'], E['fights'] + 6, 0.3): put(s_splat() * 0.6, t, 0.5, rs.uniform(-.7, .7))
put(s_crunch(), E['crunch'], 1.0); put(s_waah(), E['cry'], 0.8); put(s_waah(1.6), E['cry'] + 2.4, 0.6); put(s_sparkle(), E['shrink'], 0.6)
put(s_drumroll(1.6), E['award'] - 1.6, 0.7); put(s_heart(), E['pet'] + 1, 0.5); put(s_shutter(), E['photo'] + 6, 1.0)
put(s_blorp(1.2), E['notice'], 0.6)
for t in np.arange(E['chase'], E['throwPie'], 0.2): put(s_step(), t, 0.4, rs.uniform(-.5, .5))
put(s_whoosh(1.2, 200, 2000), E['throwPie'] + 0.6, 0.8); put(s_splat(), E['freeze'] - 0.15, 1.2)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
