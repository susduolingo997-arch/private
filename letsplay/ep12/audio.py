"""Episode 12 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def s_squeak(p=1.0): d = 0.18; return osc(sweep(900 * p, 1500 * p, d), d, 'tri') * env_ad(int(SR * d), 0.005, 0.06) * 0.5
def s_plop(): d = 0.25; return osc(sweep(300, 120, d), d) * env_ad(int(SR * d), 0.005, 0.08) * 0.6
def s_hiss(d): return bp(noise(d), 3000, 10000) * np.minimum(1, T(d) / 0.5) * 0.35
def s_splat(): return mix(bp(noise(0.8), 200, 2500) * env_ad(int(SR * 0.8), 0.005, 0.2), s_boom(1.0, 0.4) * 0.6)
def s_kazoo(m, d=0.35): return osc(mtof(m), d, 'saw') * (0.7 + 0.3 * np.sin(2 * np.pi * 30 * T(d))) * env_ad(int(SR * d), 0.02, d / 2) * 0.25
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['walk'], 112, 62, [C, G_, Am, F_], seed=601, gain=0.34, drums=1, wave='tri')
track(E['walk'], E['trail1'], 140, 60, [C, F_, G_, C], seed=602, gain=0.38, drums=2)
track(E['trail1'], E['camp2'], 96, 65, [(0, 'M'), (5, 'M'), (2, 'm'), (7, 'M')], seed=603, gain=0.28, drums=1, wave='tri', swing=0.3)   # forest stroll
track(E['camp2'], E['trail2'], 128, 62, [C, Am, F_, G_], seed=604, gain=0.38, drums=2, lead=2)   # baking montage
track(E['trail2'], E['camp3'], 132, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=605, gain=0.34, drums=1, wave='square', swing=0.2)
pad(E['camp3'], E['muffin'], [45, 46, 52], 0.3, 1000, fade=0.4); bells(E['muffin'], E['refrost'], 76, 'maj', 0.8, seed=606, gain=0.2)
track(E['refrost'], E['leggyBack'], 132, 64, [C, G_, F_, C], seed=607, gain=0.38, drums=2)
pad(E['leggyBack'], E['gifts'], [52, 55, 59], 0.25, 900); pad(E['gifts'], E['party'], [60, 64, 67, 71], 0.24, 1400); bells(E['gifts'] + 1, E['party'] - 1, 72, 'maj', 1.4, seed=608, gain=0.2)
mput(s_fanfare(), E['party'], 0.9); track(E['party'] + 1, E['light'], 140, 60, [C, G_, Am, F_], seed=609, gain=0.42, drums=2, lead=2)
pad(E['light'], E['launch'], [57, 58, 64], 0.28, 1100, fade=0.5)
track(E['launch'], E['boom'], 172, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=610, gain=0.46, drums=2, lead=2, wave='saw')
track(E['boom'] + 1.5, E['toast'], 120, 62, [C, F_, G_, C], seed=611, gain=0.34, drums=1)
pad(E['toast'], E['photo'], [60, 64, 67, 72], 0.2, 1500); bells(E['toast'] + 1, E['photo'], 72, 'maj', 1.6, seed=612, gain=0.18)
track(E['photo'], E['freeze'], 104, 62, [C, Am, F_, G_], seed=613, gain=0.32, drums=1, wave='tri', swing=0.2)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=614, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=615, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for k, m in enumerate([60, 60, 62, 60, 65, 64]): put(s_kazoo(m, 0.4), 0.8 + k * 0.45, 0.5)
for t in np.arange(E['tier1'] + 0.3, E['banner'] - 1, 0.45): put(s_plop(), t, 0.4, rs.uniform(-.4, .4))
for t in np.arange(E['banner'], E['banner'] + 3, 0.3): put(s_pop(), t, 0.4, rs.uniform(-.6, .6))
put(s_chirp(), 48.2, 0.5); put(s_chirp(), 49.4, 0.4)
put(bp(noise(3.0), 3000, 9000) * env_ad(int(SR * 3.0), 0.05, 1.4) * 0.5, E['burn'], 0.7)
for k in range(4): put(s_squeak(1.0 + k * 0.12), E['muffin'] + 1 + k * 0.6, 0.5)
for t in np.arange(E['refrost'] + 1, E['cakeDone'], 1.4): put(s_sparkle() * 0.5, t, 0.4, rs.uniform(-.5, .5))
put(s_screech(0.6), E['leggyBack'], 0.5)
put(s_kazoo(67, 0.5), E['party'] + 0.2, 0.6); put(s_kazoo(72, 0.7), E['party'] + 0.7, 0.6)
put(s_hiss(E['launch'] - E['light']), E['light'], 0.8)
put(s_boom(2.0, 0.6), E['launch'], 1.0); put(s_whoosh(5.0, 200, 3000), E['launch'] + 0.2, 0.8)
put(s_splat(), E['boom'], 1.3); put(s_boing(), E['boom'] + 0.6, 0.6)
for t in np.arange(E['boom'] + 1, E['boom'] + 6, 0.35): put(s_plop(), t, 0.3, rs.uniform(-.7, .7))
put(s_honk := (osc(sweep(330, 260, 0.35), 0.35, 'saw') * env_ad(int(SR * 0.35), 0.01, 0.12) * 0.5), E['boom'] + 3.2, 0.7)
put(s_click(), E['photo'] + 2, 0.9); put(s_scratch(), E['bill'], 0.6); put(s_blorp(0.9), 274.6, 0.8)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
