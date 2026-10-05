"""Episode 18 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_zap(d=1.2): return mix(osc(sweep(1800, 300, d), d, 'square') * 0.25, bp(noise(d), 2000, 8000) * 0.3) * env_ad(int(SR * d), 0.005, d / 2)
def s_ping(): d = 0.4; return osc(2600, d, 'sine') * env_ad(int(SR * d), 0.001, 0.08) * 0.6
def s_shrink(d=2.2): return osc(sweep(900, 3200, d) + 30 * np.sin(2 * np.pi * 12 * T(d)), d, 'tri') * np.sin(np.pi * T(d) / d) * 0.3
def s_grow(d=2.2): return osc(sweep(3200, 120, d) + 30 * np.sin(2 * np.pi * 12 * T(d)), d, 'tri') * np.sin(np.pi * T(d) / d) * 0.35
def s_skitter(d=1.6): x = np.zeros(int(SR * d)); r = np.random.RandomState(3); [x.__setitem__(slice(i, i + 600), x[i:i + 600] + bp(noise(600 / SR), 3000, 8000) * env_ad(600, 0.0005, 0.004)) for i in r.randint(0, int(SR * d) - 600, int(d * 40))]; return x * 0.7
def s_buzz(d): return osc(180 + 20 * np.sin(2 * np.pi * 7 * T(d)), d, 'saw') * 0.12 * np.minimum(1, T(d) / 0.3) * np.minimum(1, (d - T(d)) / 0.5)
def s_bigsplash(): d = 2.4; return mix(lp(noise(d), 500) * np.exp(-T(d) * 1.5) * 1.4, bp(noise(d), 800, 6000) * np.exp(-T(d) * 2) * 0.6)
def s_sniff(): d = 0.35; return bp(noise(d), 300, 1500) * np.sin(np.pi * T(d) / d) * 0.9
def s_chirp2(): d = 0.25; return osc(sweep(1800, 2600, d), d, 'sine') * env_ad(int(SR * d), 0.005, 0.08) * 0.5
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['aim'], 116, 60, [C, Am, F_, G_], seed=1201, gain=0.3, drums=1, wave='square')
pad(E['aim'], E['zap'], [57, 60, 63], 0.18, 900, fade=0.3)
pad(E['zap'] + 3, E['tiny'], [45, 52], 0.18, 600, fade=0.4)
track(E['tiny'] + 2, E['bug'], 92, 64, [C, F_, C, G_], seed=1202, gain=0.24, drums=1, wave='tri', swing=0.2)   # "tiny world" plucky theme
pad(E['bug'], E['snack'], [45, 46], 0.24, 700, fade=0.3)
bells(E['snack'] + 4, E['ride'], 84, 'maj', 1.2, seed=1203, gain=0.2)
track(E['ride'], E['puddle'], 150, 62, [C, F_, G_, C], seed=1204, gain=0.38, drums=2, lead=2, wave='square')   # beetle gallop
track(E['boat'], E['splash'], 100, 60, [C, Am, Dm, G_], seed=1205, gain=0.28, drums=1, wave='tri', swing=0.3)   # sea shanty-ish
track(E['splash'], E['shore'], 170, 57, [(0, 'm'), (8, 'M')], mode='min', seed=1206, gain=0.36, drums=2, wave='saw')
pad(E['face'] - 1, E['face'] + 6, [40, 43, 46], 0.28, 600, fade=0.3)
track(E['face'] + 6, E['face'] + 14, 176, 57, [(0, 'm'), (8, 'M')], mode='min', seed=1207, gain=0.38, drums=2, wave='saw')
mput(s_fanfare(), E['face'] + 14, 0.6); track(E['face'] + 15, E['table'], 140, 64, [C, G_, F_, C], seed=1208, gain=0.36, drums=2, lead=2)
track(E['climb'], E['lever'], 108, 60, [C, F_, G_, Am], seed=1209, gain=0.26, drums=1, wave='tri')
s_dr = s_drumroll(2.0); put(s_dr, E['lever'] + 2, 0.6)
mput(s_fanfare(), E['home'] + 1, 0.6); track(E['home'] + 2.5, E['bigbug'], 116, 62, [C, F_, G_, C], seed=1210, gain=0.32, drums=1)
track(E['bigbug'], E['aim2'], 96, 60, [C, Am, F_, G_], seed=1211, gain=0.26, drums=1, wave='tri', swing=0.2)
pad(E['aim2'], E['zap2'], [57, 60, 63], 0.18, 900, fade=0.3)
track(E['zap2'] + 3, E['freeze'], 120, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=1212, gain=0.34, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=1213, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=1214, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_sparkle(), E['ray'] + 0.4, 0.7); put(s_zap(), E['zap'], 1.0); put(s_ping(), E['zap'] + 0.3, 0.9); put(s_shrink(), E['zap'] + 1.2, 0.9)
for t in np.arange(E['zap'] + 4, E['tiny'], 1.0): put(s_sniff(), t, 0.6)
put(s_skitter(), E['bug'], 0.9); put(s_skitter(), E['bug'] + 2.5, 0.7); put(s_screech(0.8) * 0.5, E['bug'] + 4, 0.5)
put(s_clatter(0.4, 12, 1200), E['snack'] + 3, 0.6); put(s_chirp2(), E['snack'] + 6, 0.8); put(s_chirp2(), E['snack'] + 6.4, 0.7)
for t in np.arange(E['ride'], E['puddle'], 0.3): put(s_skitter(0.25), t, 0.4, rs.uniform(-.4, .4))
for t in np.arange(E['boat'], E['sail'], 0.7): put(s_thock(), t, 0.4)
put(s_boom(1.2, 0.5), E['splash'] - 1.2, 0.7); put(s_bigsplash(), E['splash'], 1.0)
for t in np.arange(E['face'], E['face'] + 6, 1.2): put(s_sniff() * 2, t, 0.8)
put(s_gloop(), E['face'] + 6.2, 0.9); put(s_buzz(E['table'] - E['face'] - 13), E['face'] + 13, 0.8)
for t in np.arange(E['climb'], E['climb'] + 8, 0.5): put(s_step(), t, 0.3)
put(s_click(), E['climb'] + 9, 0.8); put(s_creak(1.4), E['lever'] - 1, 0.6); put(s_click(), E['lever'], 1.0)
put(s_zap(1.6), E['grow'], 1.0); put(s_grow(), E['grow'] + 0.4, 0.9); put(s_grow(2.4), E['bigbug'], 0.8); put(s_chirp2(), E['bigbug'] + 3, 0.7)
put(s_heart(), E['hug'], 0.5); put(s_zap(), E['zap2'], 1.0); put(s_ping(), E['zap2'] + 0.3, 0.9); put(s_grow(2.4), E['zap2'] + 1.2, 0.9)
for t in np.arange(E['zap2'] + 3.4, E['stomp'], 0.9): put(s_boom(0.8, 0.4), t, 0.5)
put(s_boom(2.4, 1.2), E['stomp'], 1.0); put(s_glass_break(), E['stomp'] + 0.1, 0.7)
for t in [E['stomp'] + 4, E['stomp'] + 6, E['stomp'] + 8, E['stomp'] + 10]: put(s_boom(0.8, 0.4), t, 0.5)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
