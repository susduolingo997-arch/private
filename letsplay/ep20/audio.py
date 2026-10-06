"""Episode 20 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_zwoop(d=1.4): return mix(osc(sweep(200, 2400, d), d, 'saw') * 0.25, osc(sweep(400, 4800, d), d, 'sine') * 0.3, bp(noise(d), 800, 6000) * 0.2) * np.sin(np.pi * T(d) / d) ** 0.5 * 0.8
def s_warp(d=5.0): return mix(osc(110 + 60 * np.sin(2 * np.pi * 0.7 * T(d)), d, 'saw') * 0.2, osc(sweep(300, 1800, d), d, 'sine') * 0.25, lp(noise(d), 1500) * 0.3) * np.sin(np.pi * T(d) / d) * 0.9
def s_quack(): d = 0.22; return bp(osc(sweep(900, 600, d), d, 'saw'), 500, 2500) * env_ad(int(SR * d), 0.005, 0.1) * 0.9
def s_squeak(): d = 0.35; return osc(sweep(1800, 2600, d) + 80 * np.sin(2 * np.pi * 30 * T(d)), d, 'sine') * env_ad(int(SR * d), 0.01, 0.2) * 0.6
def s_hum(d): return mix(osc(60, d, 'saw') * 0.25, osc(120.5, d, 'sine') * 0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * T(d))) * np.minimum(1, T(d) / 0.5) * np.minimum(1, (d - T(d)) / 0.3)
def s_glitch(d):
    r = np.random.RandomState(7); x = np.zeros(int(SR * d)); n = int(SR * 0.08)
    for i in range(0, len(x) - n, n): x[i:i + n] = osc(r.choice([200, 400, 800, 1600, 3200]), 0.08, r.choice(['square', 'saw']))[:n] * r.uniform(0.1, 0.5)
    return x * 0.6
def s_purr(d=2.4): return lp(noise(d), 300) * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * T(d))) * np.sin(np.pi * T(d) / d) * 1.2
def s_slap(): d = 0.2; return mix(bp(noise(d), 1500, 7000) * 1.2, osc(sweep(400, 120, d), d, 'sine') * 0.5) * env_ad(int(SR * d), 0.001, 0.04)
def s_crash(d=2.0): return mix(s_clatter(d, 30, 1800), s_boom(1.6, 0.5)[:int(SR * d)])
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['tarp'], 92, 57, [Am, F_, C, G_], seed=2001, gain=0.24, drums=1, wave='tri')   # sad wreck theme
track(E['tarp'], E['test'], 120, 60, [C, F_, G_, C], seed=2002, gain=0.3, drums=1, wave='square', swing=0.2)
pad(E['test'], E['duckSend'], [60, 64, 67], 0.16, 900, fade=0.3)
mput(s_fanfare(), E['itWorks'], 0.6); track(E['itWorks'] + 1, E['countdown'], 132, 60, [C, G_, Am, F_], seed=2003, gain=0.32, drums=2, wave='square')   # time machine theme
track(E['arrive'] + 2, E['collapse'], 100, 65, [(0, 'M'), (5, 'M'), (7, 'M'), (5, 'M')], seed=2004, gain=0.26, drums=1, wave='tri', swing=0.3)   # Day 1: warm morning theme
bells(E['tockIn'], E['blueprint'], 77, 'maj', 2.0, seed=2005, gain=0.14)
pad(E['collapse'] + 1.5, E['bloopPay'], [57, 60, 63], 0.2, 800, fade=0.3)
track(E['bloopPay'], E['buildTL'], 104, 62, [C, F_, G_, C], seed=2006, gain=0.26, drums=1, wave='tri', swing=0.25)
track(E['buildTL'], E['highfive'], 150, 65, [(0, 'M'), (5, 'M'), (7, 'M'), (5, 'M')], seed=2007, gain=0.34, drums=2, lead=2, wave='square')   # two-of-me build montage
track(E['glitch'], E['glitchEnd'], 176, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2008, gain=0.36, drums=2, wave='saw')
track(E['glitchEnd'] + 1, E['warpBack'], 96, 65, [(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')], seed=2009, gain=0.24, drums=1, wave='tri')
mput(s_fanfare(), E['reveal2'], 0.8); track(E['reveal2'] + 1, E['calm'], 120, 60, [C, G_, Am, F_], seed=2010, gain=0.32, drums=2, wave='square')
track(E['twinOut'], E['porch'], 132, 60, [C, F_, G_, C], seed=2011, gain=0.28, drums=1, wave='square', swing=0.2)
track(E['porch'], E['whir'], 80, 60, [C, Am, F_, G_], seed=2012, gain=0.24, drums=1, wave='tri')   # sunset on the porch
pad(E['whir'], E['third'], [48, 51, 54], 0.22, 700, fade=0.3)
track(E['third'], E['squeak'], 140, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2013, gain=0.32, drums=2, wave='saw')
track(E['duckRain'] + 0.5, E['freeze'], 160, 60, [C, F_, G_, C], seed=2014, gain=0.34, drums=2, wave='square')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2015, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2016, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_creak(2.0), E['wreck'] + 1.5, 0.5); put(s_whoosh(0.8, 300, 3000), E['unveil'], 0.7); put(s_sparkle(), E['unveil'] + 0.3, 0.6)
put(s_click(), E['invoice'] + 0.4, 0.6); put(s_zwoop(), E['duckArrive'] - 0.4, 0.7); put(s_quack(), E['duckArrive'] + 0.2, 0.9)
put(s_click(), E['duckSend'] - 0.2, 0.8); put(s_zwoop(), E['duckSend'], 0.9); put(s_quack(), E['itWorks'] + 0.6, 0.6)
put(s_hum(E['warp'] - E['countdown']), E['countdown'], 0.6); [put(s_tick(), E['countdown'] + i * 0.7, 0.8) for i in range(3)]
put(s_warp(), E['warp'], 1.0); put(s_zwoop(), E['arrive'] - 0.5, 0.7)
for i, t in enumerate(np.arange(E['arrive'] + 1, E['meet'] + 2, 0.9)): put(s_thock(), t, 0.3, -0.3)
for t in np.arange(E['tockIn'], E['blueprint'], 0.5): put(s_tick(), t, 0.25, 0.4)
put(s_chirp(), E['tockIn'] + 0.4, 0.6)
for t in np.arange(E['build1'], E['build1End'], 0.6): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
put(s_creak(1.6), E['collapse'], 0.8); put(s_crash(), E['collapse'] + 0.6, 1.0); put(s_boing(), E['collapse'] + 1.0, 0.5)
put(s_sting(), E['ruinMe'] + 0.4, 0.7); put(s_gloop(), E['bloopPay'] + 2.4, 0.6); put(s_ding(), E['bloopPay'] + 2.6, 0.6)
for t in np.arange(E['buildTL'], E['buildTLEnd'], 0.35): put(s_thock(), t, 0.3, rs.uniform(-.6, .6))
for t in np.arange(E['duckChase'], E['duckChase'] + 5.6, 0.25): put(s_step(), t, 0.3, rs.uniform(-.5, .5))
put(s_quack(), E['duckChase'] + 0.4, 0.7); put(s_quack(), E['duckChase'] + 5.6, 0.7)
put(s_slap(), E['highfive'] + 0.8, 1.0); put(s_glitch(E['glitchEnd'] - E['glitch']), E['glitch'], 0.7); put(s_purr(), E['glitchEnd'] + 0.4, 0.8)
put(s_warp(), E['warpBack'], 1.0); put(s_zwoop(), E['home'] - 0.5, 0.7)
put(s_sparkle(), E['reveal2'] + 0.2, 0.8); put(s_gloop(), E['bloopPaid'] + 1.5, 0.5)
put(s_zwoop(), E['twinOut'] - 0.4, 0.8); put(s_tick(), E['twinOut'] + 1, 0.4)
put(s_hum(E['third'] - E['whir'] + 1), E['whir'], 0.7); put(s_zwoop(), E['third'] - 0.4, 0.9)
put(s_squeak(), E['squeak'], 1.0)
for i, t in enumerate(np.arange(E['duckRain'], E['freeze'], 0.22)): put(s_quack() * rs.uniform(0.3, 0.8), t, 0.6, rs.uniform(-.8, .8))
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
