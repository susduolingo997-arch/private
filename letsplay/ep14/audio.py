"""Episode 14 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def s_moan(d=2.4): return mix(osc(sweep(180, 260, d), d, 'tri') * 0.5, osc(sweep(184, 250, d), d, 'tri') * 0.4) * np.sin(np.pi * T(d) / d) * 0.45
def s_snore(d=2.2): return mix(lp(noise(d), 300) * 1.2, osc(sweep(70, 55, d), d, 'saw') * 0.3) * np.sin(np.pi * T(d) / d) ** 2 * 0.7
def s_honk(): d = 0.35; return osc(sweep(330, 260, d), d, 'saw') * env_ad(int(SR * d), 0.01, 0.12) * 0.5
def s_scream(d=2.2): return osc(sweep(900, 1300, d) + 60 * np.sin(2 * np.pi * 9 * T(d)), d, 'saw') * env_ad(int(SR * d), 0.03, d / 2) * 0.3
def s_rails(d): return mix(bp(noise(d), 800, 3000) * 0.3, lp(noise(d), 200) * 0.6) * np.minimum(1, T(d) / 0.3)
def s_flutter(d): return bp(noise(d), 1500, 5000) * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * T(d))) * 0.25
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['sign'], 96, 57, [(0, 'm'), (5, 'm')], mode='min', seed=801, gain=0.26, drums=1, wave='tri', swing=0.3)
pad(E['sign'], E['stream'], [45, 48, 52], 0.24, 900, fade=0.4)
track(E['stream'], E['enter'], 104, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=802, gain=0.32, drums=1, wave='square', swing=0.25)   # spooky-silly
pad(E['enter'], E['moths'], [45, 46, 52], 0.26, 800, fade=0.5)
pad(E['moths'], E['mothsOk'], [57, 58, 64], 0.3, 1200, fade=0.3)
bells(E['mothsOk'], E['sheet'], 76, 'maj', 0.9, seed=803, gain=0.2); pad(E['mothsOk'], E['sheet'], [60, 64, 67], 0.18, 1400)
track(E['sheet'], E['grab'], 176, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=804, gain=0.46, drums=2, lead=2, wave='saw')   # chase
track(E['reveal'] + 0.6, E['moan2'], 120, 62, [C, F_, G_, C], seed=805, gain=0.34, drums=1)
pad(E['moan2'], E['cavern'], [45, 48, 52], 0.26, 900, fade=0.4)
pad(E['cavern'], E['wake'], [57, 64, 69, 71], 0.24, 1600); bells(E['cavern'], E['grandma'], 81, 'maj', 1.2, seed=806, gain=0.18)
pad(E['wake'], E['prestinIn'], [60, 64, 67, 72], 0.24, 1500); bells(E['babyIn'], E['prestinIn'], 72, 'maj', 1.4, seed=807, gain=0.2)
track(E['prestinIn'], E['roar'], 92, 57, [(0, 'm'), (5, 'm')], mode='min', seed=808, gain=0.28, drums=1, wave='tri', swing=0.3)   # sneaking
track(E['cartRide'], E['outside'], 184, 60, [C, G_, F_, C], seed=809, gain=0.48, drums=2, lead=2, wave='saw')
track(E['outside'], E['crashOut'], 96, 57, [(0, 'm'), (5, 'm')], mode='min', seed=810, gain=0.24, drums=1, wave='tri')
track(E['crashOut'] + 2, E['party'], 116, 62, [C, Am, F_, G_], seed=811, gain=0.34, drums=1, swing=0.2)
mput(s_fanfare(), E['party'], 0.6); track(E['party'] + 1, E['freeze'], 108, 62, [C, F_, Am, G_], seed=812, gain=0.36, drums=2, wave='tri'); bells(E['party'] + 2, E['freeze'], 79, 'maj', 1.6, seed=813, gain=0.14)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=814, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=815, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in [11.6, 14.0, E['moan2'] + 0.2]: put(s_moan(), t, 0.8)
put(s_creak(), 7.0, 0.5)
for t in np.arange(E['detector'] + 0.4, E['detEnd'] - 1, 0.6): put(s_thock(), t, 0.4, rs.uniform(-.4, .4))
put(s_ding(), E['detEnd'] - 2.4, 0.6)
for t in np.arange(E['leggyNo'], E['leggyNo'] + 2, 0.15): put(s_step(), t, 0.3, rs.uniform(-.5, .5))
for t in np.arange(E['enter'], E['cart'], 0.5): put(s_step(), t, 0.22, rs.uniform(-.3, .3))
put(s_creak(), E['cart'], 0.8); put(s_rails(8.0) * np.linspace(1, 0.1, int(SR * 8.0)), E['cart'] + 0.2, 0.6)
put(s_flutter(E['sheet'] - 1 - E['moths']), E['moths'], 0.6)
put(s_sting(), E['sheet'], 0.9); put(s_moan(1.6) * 1.4, E['sheet'] + 0.1, 0.9)
for t in np.arange(E['run'], E['run'] + 3, 0.12): put(s_step(), t, 0.4, rs.uniform(-.5, .5))
put(s_punch(), E['grab'], 0.6); put(s_swish(), E['reveal'], 0.8); put(s_honk(), E['reveal'] + 0.4, 1.0); put(s_honk(), E['reveal'] + 1.2, 0.9)
put(s_honk(), E['moan2'] + 5.4, 0.8)
for t in np.arange(E['deeper'], E['cavern'], 0.4): put(s_step(), t, 0.22, rs.uniform(-.3, .3))
put(s_sparkle(), E['cavern'] + 0.2, 0.6)
for t in np.arange(E['grandma'], E['wake'], 3.2): put(s_snore(), t, 0.9)
put(s_rumble(1.6), E['wake'], 0.7); put(s_chirp(), E['babyIn'] + 1, 0.6); put(s_chirp(), E['babyIn'] + 4.4, 0.6)
put(s_growl(), E['roar'] - 0.4, 1.0); put(s_scream(), E['roar'] + 1.0, 0.9)
put(s_rails(E['outside'] - E['cartRide']), E['cartRide'] + 0.6, 0.8)
put(s_rails(1.4), E['crashOut'] - 1, 0.8); put(s_bonk(), E['crashOut'] + 0.2, 0.9); put(s_whoosh(1.0, 300, 3000), E['crashOut'] + 0.3, 0.7); put(s_clatter(1.0, 20, 1800), E['crashOut'] + 1.4, 0.8)
put(s_sparkle(), E['sign2'] + 3, 0.6); put(s_ding(), E['sign2'] + 6.4, 0.8); put(s_ding(), E['sign2'] + 6.9, 0.7)
for t in np.arange(E['party'] + 1, E['party'] + 10, 1.4): put(s_sparkle() * 0.5, t, 0.4, rs.uniform(-.6, .6))
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
