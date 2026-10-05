"""Episode 19 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_waves(d): return lp(noise(d), 700) * (0.4 + 0.6 * np.sin(2 * np.pi * 0.12 * T(d)) ** 2) * np.minimum(1, T(d) / 2) * np.minimum(1, (d - T(d)) / 2) * 0.35
def s_clink(): d = 0.3; return mix(osc(2400, d, 'sine'), osc(3600, d, 'sine') * 0.5) * env_ad(int(SR * d), 0.001, 0.06) * 0.5
def s_paper(d=0.6): return bp(noise(d), 2500, 9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 18 * T(d))) * np.sin(np.pi * T(d) / d) * 0.4
def s_drill(d): return mix(osc(140 + 10 * np.sin(2 * np.pi * 30 * T(d)), d, 'saw') * 0.25, bp(noise(d), 300, 2000) * 0.3) * np.minimum(1, T(d) / 0.2) * np.minimum(1, (d - T(d)) / 0.3)
def s_scritch(d=1.2): return bp(noise(d), 3000, 8000) * (np.sin(2 * np.pi * 7 * T(d)) > 0.3) * 0.4
def s_snip(): d = 0.12; return bp(noise(d), 2500, 7000) * env_ad(int(SR * d), 0.001, 0.02) * 1.0
def s_coins(d=1.4): x = np.zeros(int(SR * d)); r = np.random.RandomState(5); [x.__setitem__(slice(i, i + int(SR * 0.3)), x[i:i + int(SR * 0.3)] + s_clink() * r.uniform(0.3, 0.8)) for i in r.randint(0, int(SR * (d - 0.3)), 18)]; return x
def s_fwump(): d = 0.8; return mix(lp(noise(d), 400) * np.exp(-T(d) * 5) * 1.6, osc(sweep(120, 50, d), d, 'sine') * np.exp(-T(d) * 4)) * 0.9
def s_clonk(): d = 0.4; return mix(osc(sweep(320, 280, d), d, 'tri'), bp(noise(d), 400, 2000) * 0.5) * env_ad(int(SR * d), 0.001, 0.1) * 0.9
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['map'], 112, 62, [C, F_, G_, C], seed=1301, gain=0.28, drums=1, wave='tri', swing=0.25)   # beach theme
mput(s_fanfare(), E['map'], 0.5); track(E['map'] + 1.5, E['build'], 120, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=1302, gain=0.3, drums=1, wave='square', swing=0.3)   # pirate jig
track(E['build'], E['buildEnd'], 150, 60, [C, F_, G_, C], seed=1303, gain=0.28, drums=1, wave='square')
track(E['paces'], E['isle'], 120, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=1304, gain=0.32, drums=2, wave='square', swing=0.3)
track(E['isle'], E['map2'], 112, 62, [C, F_, G_, C], seed=1305, gain=0.28, drums=1, wave='tri', swing=0.25)
pad(E['map2'], E['xs'], [57, 60, 63], 0.18, 900, fade=0.3)
track(E['xs'] + 2, E['digEnd'], 160, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=1306, gain=0.34, drums=2, wave='square', swing=0.2)
track(E['leggyNose'], E['cave'], 96, 62, [C, Am, F_, G_], seed=1307, gain=0.24, drums=1, wave='tri')
pad(E['cave'], E['chest'], [45, 52, 57, 59], 0.22, 1400); bells(E['cave'], E['chest'], 81, 'min', 1.0, seed=1308, gain=0.18)   # cave shimmer
mput(s_fanfare(), E['chest'] + 0.4, 0.5); pad(E['walk'], E['chase'], [40, 43, 46], 0.26, 600, fade=0.3)
track(E['chase'], E['chaseEnd'], 176, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=1309, gain=0.42, drums=2, lead=2, wave='saw')
pad(E['chaseEnd'], E['snack'], [45, 48], 0.2, 700, fade=0.3)
track(E['snack'], E['home'], 108, 62, [C, F_, G_, C], seed=1310, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['trade'], 0.6)
track(E['home'] + 1, E['melt'], 92, 60, [C, Am, F_, G_], seed=1311, gain=0.26, drums=1, wave='tri', swing=0.2)   # sunset riches
pad(E['melt'], E['choc'], [57, 60, 63], 0.2, 800, fade=0.4)
track(E['choc'] + 1, E['fall'], 150, 57, [(0, 'm'), (5, 'm')], mode='min', seed=1312, gain=0.34, drums=2, wave='square', swing=0.3)
track(E['stuck'], E['freeze'], 80, 60, [Am, F_, C, G_], seed=1313, gain=0.22, drums=1, wave='tri')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=1314, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=1315, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_waves(E['isle'] - 1), 0.5, 0.7); put(s_waves(E['freeze'] - E['home']), E['home'], 0.7)
put(s_clink(), E['bottle'], 0.8); put(s_paper(), E['map'] - 0.4, 0.8)
for t in np.arange(E['build'], E['buildEnd'], 0.7): put(s_thock(), t, 0.4, rs.uniform(-.3, .3))
put(s_drill(3.0), E['buildEnd'], 0.8)
for i, t in enumerate(np.arange(E['paces'] + 1, E['pacesEnd'], 0.65)): put(s_step(), t, 0.4)
put(s_drill(6.0), E['dig1'], 0.8); put(s_clonk(), E['dig1'] + 6, 0.7); put(s_paper(), E['map2'], 0.8)
for t in np.arange(E['xs'], E['digAll'], 1.3): put(s_scritch(), t, 0.5, rs.uniform(-.6, .6))
put(s_drill(E['digEnd'] - E['digAll']), E['digAll'], 0.7)
for t in np.arange(E['digAll'] + 1, E['digEnd'], 1.45): put(s_bonk(), t, 0.3, rs.uniform(-.4, .4))
put(s_sparkle(), E['cave'] + 0.4, 0.6); put(s_creak(1.2), E['chest'] - 0.2, 0.7); put(s_coins(), E['chest'] + 0.4, 0.7)
put(s_creak(1.6), E['walk'], 0.6)
for t in np.arange(E['chase'], E['chaseEnd'], 0.6): put(s_snip(), t, 0.7, rs.uniform(-.5, .5))
put(s_fwump(), E['chaseEnd'], 0.6); put(s_chirp(), E['snack'] + 1, 0.5)
for t in np.arange(E['shell'], E['shell'] + 3, 0.5): put(s_thock(), t, 0.4)
put(s_sparkle(), E['shell'] + 3, 0.7); put(s_coins(2.0), E['trade'] + 2, 0.9)
put(s_coins(1.0), E['count'], 0.6); put(s_ding(), E['bloopPaid'], 0.7)
put(s_gloop(), E['melt'] + 2, 0.6); put(s_gloop(), E['choc'] - 2, 0.6); put(s_sting(), E['choc'], 0.8)
for t in np.arange(E['stomp'], E['fall'], 0.3): put(s_step(), t, 0.5)
put(s_fwump(), E['fall'], 1.0); put(s_waves(4.0) * 1.5, E['tidein'], 0.8)
for t in np.arange(E['crab'] - 4, E['crab'], 0.4): put(s_snip(), t, 0.3)
put(s_clonk(), E['crab'] + 0.4, 1.0)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
