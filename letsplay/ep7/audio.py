"""Episode 7 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
# ---- new sounds for this episode
def splash(d=1.2): return bp(noise(d), 300, 4000) * env_ad(int(SR * d), 0.005, d / 4)
def s_gull():
    d = 0.5; x = osc(sweep(1400, 900, d), d, 'tri') * env_ad(int(SR * d), 0.02, 0.18)
    return x * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * T(d))) * 0.35
def s_wave(d=3.0): return bp(noise(d), 120, 1400) * np.sin(np.linspace(0, np.pi, int(SR * d))) ** 2 * 0.5
def s_horn(d=1.6): return (osc(mtof(45), d, 'saw') + osc(mtof(52) * 1.005, d, 'saw')) * env_ad(int(SR * d), 0.08, d / 2) * 0.3
def s_drillrun(d):
    x = bp(noise(d), 600, 3600) * (0.55 + 0.45 * np.sin(2 * np.pi * 42 * T(d)))
    return (x + osc(190, d, 'square') * 0.3) * np.minimum(1, T(d) / 0.3) * 0.35
def s_icecrack(d=1.4):
    x = np.zeros(int(SR * d))
    for _ in range(14):
        i = rs.randint(len(x) - 6000); y = bp(noise(0.12), 400, 5000) * env_ad(int(SR * 0.12), 0.001, 0.03)
        x[i:i + len(y)] += y * rs.uniform(0.4, 1.0)
    return x * 0.9 + lp(noise(d), 300) * env_ad(int(SR * d), 0.01, d / 2) * 0.4
def s_skate(d=0.5): return bp(noise(d), 1800, 7000) * env_ad(int(SR * d), 0.02, d / 2) * 0.35
def s_bark(p=1.0):
    d = 0.22; return (osc(sweep(420 * p, 240 * p, d), d, 'square') * 0.5 + bp(noise(d), 500, 3000) * 0.3) * env_ad(int(SR * d), 0.004, 0.07)
def s_reel(d=1.4):
    n = int(SR * d); x = np.zeros(n)
    for k in range(int(d * 26)):
        i = int(k * SR / 26); y = s_tick()[:2000][:max(0, n - i)]
        x[i:i + len(y)] += y * 0.8
    return x
def s_whale(d=3.0): return (osc(sweep(120, 300, d), d, 'tri') + osc(sweep(121, 302, d), d, 'tri')) * env_ad(int(SR * d), 0.4, d / 2) * 0.3
def s_squelch(d=0.6): return lp(noise(d), 900) * env_ad(int(SR * d), 0.01, d / 3) * 0.6
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['judge'], 108, 62, [C, G_, Am, F_], seed=201, gain=0.34, drums=1, wave='tri')
mput(s_fanfare(), E['poster'], 0.6)
track(E['poster'] + 0.6, E['make'], 128, 62, [C, F_, G_, C], seed=202, gain=0.4, drums=2)
track(E['make'], E['sail'], 146, 60, [C, G_], seed=203, gain=0.4, drums=2, lead=2)
pad(E['sail'], E['arrive'], [45, 52, 57], 0.3, 700, fade=1.5); bells(E['sail'] + 2, E['arrive'] - 2, 57, 'min', 2.0, seed=204, gain=0.16)
mput(s_horn(2.2), E['sail'] + 4, 0.7); mput(s_horn(2.2), 46.0, 0.6)
mput(s_sting(), E['arrive'], 0.6)
track(E['arrive'] + 0.4, E['drill'], 120, 64, [C, Am, F_, G_], seed=205, gain=0.36, drums=1, wave='tri', swing=0.2)
track(E['drill'], E['start'], 132, 57, [(0, 'm'), (5, 'm'), (3, 'M'), (7, 'M')], mode='min', seed=206, gain=0.36, drums=2)
mput(s_drumroll(1.6), E['start'] - 1.8, 0.9); mput(s_fanfare(), E['start'], 0.7)
track(E['start'] + 1, E['invoice'], 138, 60, [C, G_, Am, F_], seed=207, gain=0.4, drums=2, lead=2)
track(E['invoice'], E['wet'], 84, 60, [(0, 'M'), (5, 'M'), (2, 'm'), (7, 'M')], seed=208, gain=0.28, drums=0, wave='tri', swing=0.3)
pad(E['wet'], E['reveal'], [45, 46, 52], 0.32, 900, fade=0.6); pulse(E['wet'] + 3, E['reveal'], 108, 0.5)
mput(s_sting(), E['reveal'], 0.9)
track(E['reveal'] + 0.6, E['crack'], 100, 57, [(0, 'm'), (1, 'M'), (5, 'm'), (0, 'm')], mode='min', seed=209, gain=0.34, drums=1, wave='saw')
track(E['crack'], E['cast'], 172, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=210, gain=0.48, drums=2, lead=2, wave='saw', bassw='square')
pad(E['cast'], E['bite'], [45, 48, 52], 0.3, 900, fade=0.5)
mput(s_sting(), E['bite'], 1.0)
track(E['bite'] + 0.4, E['land'], 182, 55, [(0, 'm'), (6, 'M'), (5, 'm'), (1, 'M')], mode='min', seed=211, gain=0.5, drums=2, lead=2, wave='saw', bassw='square')
pad(E['land'], E['win'], [48, 55, 60], 0.3, 1400, fade=0.6)
mput(s_fanfare(), E['win'], 0.9); track(E['win'] + 1.2, E['melt'], 126, 64, [C, G_, F_, C], seed=212, gain=0.42, drums=2)
track(E['melt'] + 1, E['sink'], 92, 60, [(0, 'm'), (5, 'm'), (3, 'M'), (0, 'm')], mode='min', seed=213, gain=0.3, drums=1, wave='tri')
track(E['sink'], E['shore'], 168, 50, [(0, 'm'), (1, 'M')], mode='min', seed=214, gain=0.46, drums=2, lead=2, wave='saw')
track(E['shore'] + 1, E['bill'], 96, 62, [C, Am, F_, G_], seed=215, gain=0.3, drums=1, wave='tri', swing=0.2)
pad(E['bill'], E['billEnd'], [45, 48, 52, 55], 0.34, 800, fade=0.5); pulse(E['bill'] + 2, E['billEnd'], 96, 0.5)
track(E['billEnd'] + 0.4, E['freeze'], 84, 65, [(0, 'M'), (5, 'M'), (2, 'm'), (7, 'M')], seed=216, gain=0.26, drums=0, wave='tri', swing=0.3)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=217, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=218, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX timeline
for t in np.arange(0.5, E['sail'], 3.1): put(s_wave(2.4), t, 0.4, rs.uniform(-.5, .5))
for t in np.arange(1.0, E['judge'], 4.5): put(s_gull(), t + rs.uniform(0, 1.5), 0.4, rs.uniform(-.7, .7))
for t in np.arange(0.4, 30, 1.6): put(s_drip(), t + rs.uniform(0, 0.6), 0.25, 0.3)
put(s_squelch(1.2), E['judge'] + 1.4, 0.7); put(s_bark(0.8), E['judge'] + 2.6, 0.8)
put(s_bark(0.9), E['poster'] + 0.2, 0.9); put(s_click(), E['poster'] + 0.1, 0.6)
put(s_ding(), E['poster'] + 2.6, 0.7); put(s_sparkle(), E['poster'] + 2.8, 0.8)
for t in np.arange(E['make'] + 0.4, E['makeEnd'] - 1, 0.5): put(s_thock(), t, 0.5, rs.uniform(-.4, .4))
put(s_splash := splash(1.4), E['sail'] + 0.4, 0.8)
for t in np.arange(E['sail'], E['arrive'], 0.6): put(splash(0.5), t, 0.3, rs.uniform(-.6, .6))
for t in np.arange(E['sail'] + 2, E['arrive'], 7.0): put(s_whale(3.0), t, 0.5)
put(s_horn(1.6), E['arrive'] - 1.2, 0.7)
for t in np.arange(E['arrive'], E['sink'], 5.5): put(s_gull(), t + rs.uniform(0, 2), 0.3, rs.uniform(-.7, .7))
for t in np.arange(E['arrive'] + 0.5, E['arrive'] + 4, 0.5): put(s_bark(rs.uniform(0.8, 1.2)), t, 0.4, rs.uniform(-.6, .6))
put(s_skate(0.8), E['slip'], 0.9); put(s_boing(0.6), E['slip'] + 0.3, 0.7); put(s_bonk(), E['slip'] + 0.5, 0.6)
for k in range(9): put(s_drillrun(1.1), E['drill'] + 0.6 + k * 1.55, 0.6); put(s_pop(), E['drill'] + 1.5 + k * 1.55, 0.5)
for k in range(3): put(s_tick(), E['start'] - 1.6 + k * 0.55, 0.9)
put(s_bark(1.0), E['start'], 1.0)
for t in np.arange(E['start'] + 2, E['crack'], 6.0): put(s_whoosh(0.5, 400, 3000), t, 0.35)
put(s_reel(1.0), E['boot'] - 0.2, 0.7); put(splash(0.8), E['boot'], 0.6); put(s_squelch(0.8), E['boot'] + 0.5, 0.7)
put(s_reel(0.8), E['cube'] - 0.2, 0.6); put(s_clatter(0.5, 4, 3000), E['cube'] + 0.3, 0.5)
put(s_reel(1.0), E['tiny'] - 0.2, 0.7); put(s_blorp(1.4), E['tiny'] + 0.3, 0.7)
put(s_whoosh(0.4, 500, 4000), E['steal'], 0.8); put(s_blorp(0.8), E['steal'] + 1.3, 0.9); put(s_bark(0.7), E['steal'] + 2.0, 0.7)
for k in range(5): put(s_skate(0.6), E['skate'] + 0.5 + k * 1.1, 0.5, rs.uniform(-.4, .4))
put(s_bonk(), 117.4, 0.8)
put(s_scratch(), E['invoice'], 0.7); put(s_ding(), E['invoice'] + 0.3, 0.5)
for t in np.arange(E['wet'], E['crack'], 0.5): put(s_drip(), t + rs.uniform(0, 0.3), 0.35, rs.uniform(-.5, .5))
for t in np.arange(E['wet'] + 3, E['reveal'], 0.9): put(s_bubble := osc(sweep(120, 220, 0.3), 0.3) * env_ad(int(SR * 0.3), 0.01, 0.1) * 0.5, t, 0.4)
put(s_pop(), E['reveal'], 1.0); put(s_sparkle(), E['reveal'] + 0.2, 0.7)
put(s_icecrack(2.0), E['crack'], 1.3); put(s_boom(1.6, 0.5), E['crack'], 0.8); put(splash(2.0), E['crack'] + 0.4, 0.8)
for t in np.arange(E['crack'] + 2, E['sink'], 2.4): put(s_icecrack(0.8), t, 0.4, rs.uniform(-.6, .6))
put(s_drillrun(2.0), E['race'] - 0.4, 0.8); put(s_whoosh(1.2, 300, 3000), E['race'], 0.8)
for t in np.arange(E['race'], E['land'], 0.45): put(splash(0.5), t, 0.3, rs.uniform(-.6, .6))
put(s_whoosh(0.8, 400, 4000), E['cast'] + 0.1, 0.6)
put(s_boom(2.2, 0.8), E['bite'], 1.1); put(splash(2.4), E['bite'] + 0.1, 1.2); put(s_growl(1.6, 60), E['bite'] + 0.4, 0.8)
put(s_reel(2.0), E['bite'] + 1.0, 0.7)
for k in range(4): put(s_skate(0.7), 185.5 + k * 1.1, 0.6)
put(s_whoosh(1.0, 400, 5000), E['jump'], 0.9); put(s_punch(), E['jump'] + 1.1, 0.6)
put(s_boom(1.4, 0.6), E['land'], 1.0); put(s_squelch(1.2), E['land'] + 0.2, 0.9); put(s_clatter(1.0, 8, 2500), E['land'] + 0.3, 0.6)
put(s_bark(1.0), E['win'] - 0.4, 0.8)
for k in range(8): put(s_sparkle(), E['win'] + 0.3 + k * 0.5, 0.6, rs.uniform(-.6, .6))
for t in np.arange(E['melt'] + 1, E['sink'], 0.5): put(s_drip(), t, 0.5, rs.uniform(-.3, .3))
put(s_icecrack(1.6), E['sink'] - 0.2, 1.0)
for k in range(10): put(splash(1.2), E['sink'] + k * 0.6, 0.8, rs.uniform(-.7, .7))
for k in range(5): put(s_bark(rs.uniform(0.7, 1.2)), E['sink'] + 1 + k * 0.7, 0.5, rs.uniform(-.7, .7))
for t in np.arange(E['shore'], 290, 3.4): put(s_wave(2.4), t, 0.35, rs.uniform(-.5, .5))
for t in np.arange(243.2, 247, 0.22): put(splash(0.3), t, 0.3, rs.uniform(-.5, .5))
put(splash(1.6), 247.6, 0.8); put(splash(1.6), 249.7, 0.8); put(s_whale(2.4), 248.2, 0.5)
for k in range(12): put(s_thock(), E['bill'] + 0.3 + k * 0.12, 0.6)
put(s_scratch(), E['bill'] + 1.2, 0.8)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
