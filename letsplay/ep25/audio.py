"""Episode 25 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_shwoop(d=1.6): return mix(osc(sweep(2400, 150, d), d, 'sine') * 0.35, bp(noise(d), 600, 5000) * 0.2) * np.sin(np.pi * T(d) / d) ** 0.5
def s_pop2(): d = 0.25; return osc(sweep(300, 1400, d), d) * env_ad(int(SR * d), 0.002, 0.08) * 0.8
def s_flump(): d = 0.6; return lp(noise(d), 500) * env_ad(int(SR * d), 0.003, 0.2) * 1.3
def s_shaker(d): return bp(noise(d), 3000, 9000) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 6 * T(d)))) * 0.35
def s_bigbell(): d = 4.0; return mix(osc(196, d) * 0.4, osc(392.5, d) * 0.25, osc(588, d) * 0.15, osc(784.8, d) * 0.08) * env_ad(int(SR * d), 0.003, 2.0)
def s_drillz(d): return osc(160 + 20 * np.sin(2 * np.pi * 30 * T(d)), d, 'saw') * 0.15 + bp(noise(d), 2000, 6000) * 0.08
def s_drip(): d = 0.2; return osc(sweep(1800, 600, d), d) * env_ad(int(SR * d), 0.002, 0.06) * 0.5
def s_pomf(): d = 0.3; return lp(noise(d), 900) * env_ad(int(SR * d), 0.002, 0.08) * 1.0
def s_clunk(): d = 0.5; return mix(osc(sweep(140, 70, d), d, 'square') * 0.4, lp(noise(d), 400) * 0.6) * env_ad(int(SR * d), 0.002, 0.15)
def s_blow(d): return lp(noise(d), 1400) * 0.4 * np.minimum(1, T(d) / 1.0)
def s_tiny(): d = 0.2; return osc(sweep(1400, 2000, d), d, 'tri') * env_ad(int(SR * d), 0.005, 0.1) * 0.35
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['pulled'] - 2, 108, 62, [C, F_, C, G_], seed=2501, gain=0.24, drums=1, wave='tri', swing=0.25)   # autumn yard
pad(E['pulled'] - 2, E['inside'], [60, 64, 67, 71], 0.18, 900, fade=0.4)
bells(E['inside'] + 2, E['quake1'], 79, 'maj', 2.2, seed=2502, gain=0.18)   # Flurrytown music box
track(E['inside'] + 2, E['quake1'], 92, 67, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2503, gain=0.2, drums=0, wave='tri')
track(E['trek'], E['drill'], 132, 65, [(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')], seed=2504, gain=0.28, drums=2, wave='square', swing=0.15)
track(E['drill'], E['quake2'], 118, 60, [C, Am, F_, G_], seed=2505, gain=0.24, drums=1, wave='tri')
track(E['quake2'], E['twist'], 166, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2506, gain=0.34, drums=2, wave='saw')
bells(E['twist'], E['bell'], 79, 'maj', 1.6, seed=2507, gain=0.18); track(E['climb'], E['bell'], 104, 67, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2508, gain=0.24, drums=1, wave='tri')
mput(s_fanfare(), E['escape'] - 2, 0.7); track(E['outside'], E['melt'], 128, 60, [C, F_, G_, C], seed=2509, gain=0.28, drums=1, wave='square')
pad(E['melt'], E['macB'], [57, 60, 63], 0.18, 700, fade=0.3); track(E['macB'], E['snowOn'], 144, 62, [C, F_, G_, C], seed=2510, gain=0.3, drums=2, lead=2, wave='square')
mput(s_fanfare(), E['snowOn'], 0.7); track(E['snowOn'] + 1, E['calm'], 124, 67, [(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')], seed=2511, gain=0.3, drums=2, wave='tri', swing=0.2)   # winter in the yard
track(E['calm'], E['tooMuch'], 74, 60, [C, Am, F_, G_], seed=2512, gain=0.24, drums=1, wave='tri')
track(E['tooMuch'] + 4, E['freeze'], 170, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2513, gain=0.36, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2514, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2515, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_chirp(), E['gift'] - 2, 0.6); put(s_thock(), E['gift'], 0.7); put(s_sparkle(), E['gift'] + 2, 0.6); put(s_shaker(2), E['shake'], 0.8)
put(s_shwoop(), E['pulled'] - 0.6, 1.0); put(s_pop2(), E['pulled'] + 0.6, 0.7); put(s_shaker(1.4), E['leggyShake'], 0.6)
put(s_shwoop(1.2), E['inside'] - 0.6, 0.6); put(s_flump(), E['inside'] + 1.2, 1.0)
for i in range(8): put(s_tiny(), E['flurries'] + i * 0.25, 0.6, rs.uniform(-.6, .6))
put(s_rumble(5), E['quake1'], 0.9); put(s_shaker(6), E['quake1'], 0.7)
for i in range(6): put(s_tiny(), E['quake1'] + 1.5 + i * 0.3, 0.6, rs.uniform(-.6, .6))
put(s_whoosh(6, 300, 2000), E['sled'], 0.6); put(s_drillz(6), E['drill'], 0.6); put(s_shaker(3), E['drill'] + 6, 0.7)
put(s_rumble(8), E['quake2'], 1.0); put(s_shaker(8), E['quake2'], 0.8); put(s_clatter(1.6, 24, 1500), E['house'], 1.0); put(s_flump(), E['house'], 1.0)
put(s_bigbell(), E['bell'], 1.0); put(s_bigbell(), E['bell'] + 2, 0.9); put(s_sparkle(), E['bell'] + 3, 0.8); put(s_shwoop(2), E['escape'] - 1, 0.8); put(s_pop2(), E['outside'], 1.0)
for t in np.arange(E['melt'] + 1, E['snowOn'], 0.9): put(s_drip(), t, 0.5, rs.uniform(-.5, .5))
for t in np.arange(E['macB'], E['macB'] + 12, 0.5): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
put(s_blow(E['tooMuch'] - E['snowOn']), E['snowOn'], 0.6)
for t in np.arange(E['snowball'], E['snowball'] + 10, 0.7): put(s_pomf(), t, 0.7, rs.uniform(-.5, .5))
put(s_clunk(), E['tooMuch'], 1.0); put(s_blow(E['freeze'] - E['tooMuch'] - 1) * 1.8, E['tooMuch'] + 1, 0.8); put(s_shaker(6), E['final'], 0.8); put(s_boom(2.4, 0.8), E['final'] + 4, 1.0)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
