"""Episode 22 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_whistle(d=2.4): f = 520 + 30 * np.sin(2 * np.pi * 5 * T(d)); return mix(osc(f, d) * 0.3, osc(f * 1.26, d) * 0.22, bp(noise(d), 1500, 4000) * 0.08) * np.minimum(1, T(d) / 0.3) * np.minimum(1, (d - T(d)) / 0.8) * 0.8
def s_choo(): d = 0.4; return bp(noise(d), 300, 2500) * env_ad(int(SR * d), 0.01, 0.15) * 0.9
def s_dong(): d = 3.0; return mix(osc(110, d) * 0.5, osc(220.6, d) * 0.3, osc(331, d) * 0.15) * env_ad(int(SR * d), 0.005, 1.6) * 1.1
def s_flap(): d = 0.08; return bp(noise(d), 800, 3000) * env_ad(int(SR * d), 0.002, 0.03) * 0.6
def s_punch(): d = 0.12; return mix(bp(noise(d), 2000, 8000), osc(1800, d, 'square') * 0.2) * env_ad(int(SR * d), 0.001, 0.03)
def s_boo(): d = 1.2; return osc(sweep(300, 120, d) + 20 * np.sin(2 * np.pi * 7 * T(d)), d, 'saw') * env_ad(int(SR * d), 0.02, 0.8) * 0.4
def s_ooo(d=3.0): return lp(osc(320 + 40 * np.sin(2 * np.pi * 0.7 * T(d)), d, 'tri'), 900) * np.sin(np.pi * T(d) / d) * 0.35
def s_toot(): d = 0.5; return mix(osc(392, d, 'square') * 0.2, osc(494, d, 'square') * 0.15) * env_ad(int(SR * d), 0.01, 0.4)
def s_spark(d=4.0): r = np.random.RandomState(4); x = bp(noise(d), 3000, 9000) * 0.3; x *= (r.uniform(0, 1, len(x)) > 0.6); return x * np.sin(np.pi * T(d) / d)
def clacks(t0, t1, rate, g):
    for t in np.arange(t0, t1, rate): put(s_thock(), t, g, rs.uniform(-.3, .3)); put(s_thock(), t + rate * 0.25, g * 0.7, rs.uniform(-.3, .3))
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['whistle'], 92, 60, [C, Am, F_, G_], seed=2201, gain=0.22, drums=1, wave='tri')
pad(E['whistle'], E['detector'], [57, 60, 64], 0.18, 700, fade=0.4)
track(E['detector'], E['walk'], 120, 62, [C, F_, G_, C], seed=2202, gain=0.26, drums=1, wave='square', swing=0.2)
track(E['walk'], E['midnight'], 84, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2203, gain=0.2, drums=1, wave='tri')   # sneaking
pad(E['midnight'], E['depart'], [45, 48, 51, 54], 0.24, 600, fade=0.5)   # spooky diminished drone
track(E['depart'], E['stop'], 132, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2204, gain=0.3, drums=2, wave='saw')   # ghost train theme
pad(E['stop'], E['hug'], [57, 60, 64], 0.16, 500, fade=0.6)
bells(E['hug'], E['back'], 72, 'maj', 1.4, seed=2205, gain=0.18)
track(E['back'], E['prep'], 112, 62, [C, Am, F_, G_], seed=2206, gain=0.24, drums=1, wave='tri')
track(E['prep'], E['opening'], 140, 62, [C, F_, G_, C], seed=2207, gain=0.32, drums=2, lead=2, wave='square')   # prep montage
mput(s_fanfare(), E['opening'] + 1, 0.8); track(E['opening'] + 2, E['boo'], 108, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2208, gain=0.26, drums=1, wave='tri', swing=0.3)
track(E['lever'], E['freeze'], 176, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2209, gain=0.36, drums=2, wave='saw')   # runaway train
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2210, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2211, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_whistle(), E['whistle'], 0.7); put(s_sparkle(), E['ticket'], 0.5); put(s_ooo(), E['ticket'] + 1, 0.4)
for t in np.arange(E['detector'], E['detectorEnd'], 0.5): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
for t in [E['test'] + 1, E['test'] + 1.4, E['test'] + 3]: put(s_bell(1760, 0.15, 0.4), t, 0.5)
for t in np.arange(E['arrive'] + 6, E['midnight'], 1.1): put(s_creak(0.6), t, 0.25, rs.uniform(-.5, .5))
for i in range(14): put(s_flap(), E['lantern'] + i * 0.12, 0.7, rs.uniform(-.6, .6))
put(s_dong(), E['midnight'], 0.9); put(s_dong(), E['midnight'] + 1.6, 0.8); put(s_whistle(3), E['trainIn'], 0.8)
for t in np.arange(E['trainIn'] + 1, E['trainStop'], 0.7): put(s_choo(), t, 0.5)
put(s_ooo(2), E['wisp'], 0.5); put(s_thock(), E['faint'], 0.9); put(s_punch(), E['punch'] + 0.4, 1.0); put(s_whistle(), E['depart'], 0.8)
clacks(E['depart'] + 1, E['stop'], 0.5, 0.3); put(s_growl(2.0, 50), E['skull'] + 2, 0.9); put(s_sting(), E['skull'] + 2, 0.5)
for i in range(40): put(s_flap(), E['flappers'] + i * 0.11, 0.6, rs.uniform(-.8, .8))
put(s_whoosh(3.0, 200, 2000), E['drop'], 0.7); put(s_creak(1.4), E['stop'], 0.5); put(s_heart(), E['hug'] + 0.6, 0.6); put(s_sparkle(), E['hug'] + 0.8, 0.6)
put(s_thock(), E['faint2'], 0.9); clacks(E['back'], E['prep'], 0.5, 0.25)
for t in np.arange(E['prep'], E['prepEnd'], 0.5): put(s_thock(), t, 0.3, rs.uniform(-.5, .5))
for t in np.arange(E['crowd'], E['crowd'] + 6, 0.3): put(s_step(), t, 0.25, rs.uniform(-.6, .6))
put(s_glass_break(0.4) * 0.3, E['opening'] + 1, 0.5); put(s_whistle(), E['depart2'], 0.6); put(s_boo(), E['boo'], 1.0); put(s_screech(), E['boo'] + 0.4, 0.5)
put(s_click(), E['lever'], 1.0); put(s_whoosh(1.4, 200, 4000), E['lever'] + 0.3, 0.8); clacks(E['lever'], E['derail'], 0.18, 0.25)
put(s_crack(), E['snap'], 0.9); put(s_spark(5), E['brake'], 0.8); put(s_toot(), E['climb'] + 4.2, 0.9); put(s_toot(), E['climb'] + 4.9, 0.9)
put(s_whistle(2), E['warn'], 0.8); put(s_whoosh(2.0, 300, 3000), E['derail'], 0.9)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
