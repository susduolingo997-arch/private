"""Episode 24 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_waves(d): return lp(noise(d), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.15 * T(d))) * 0.5
def s_rain(d): return bp(noise(d), 2000, 9000) * 0.18 * np.minimum(1, T(d) / 2) * np.minimum(1, (d - T(d)) / 2)
def s_thunder(d=3.0): return mix(lp(noise(d), 200) * 1.4, s_rumble(d)[:int(SR * d)] * 0.6) * env_ad(int(SR * d), 0.01, 1.4)
def s_putt(d): return osc(30 + 4 * np.sin(2 * np.pi * 0.5 * T(d)), d, 'square') * 0.12 * (0.5 + 0.5 * (np.sin(2 * np.pi * 12 * T(d)) > 0))
def s_splosh(): d = 1.2; return mix(lp(noise(d), 1500) * 1.1, osc(sweep(400, 60, d), d) * 0.3) * env_ad(int(SR * d), 0.005, 0.4)
def s_squawk(): d = 0.5; return bp(osc(sweep(900, 500, d) + 60 * np.sin(2 * np.pi * 30 * T(d)), d, 'saw'), 500, 3000) * env_ad(int(SR * d), 0.01, 0.3) * 0.8
def s_flapw(): d = 0.15; return lp(noise(d), 800) * env_ad(int(SR * d), 0.005, 0.06)
def s_glub(): d = 0.3; return osc(sweep(300, 900, d), d) * env_ad(int(SR * d), 0.01, 0.15) * 0.4
def s_shatter(): return s_glass_break(1.6)
def s_urp(): d = 0.6; return lp(osc(sweep(140, 90, d) + 15 * np.sin(2 * np.pi * 18 * T(d)), d, 'saw'), 900) * env_ad(int(SR * d), 0.02, 0.4) * 0.6
def s_jingle(): return mix(*[np.pad(s_bell(2400 + i * 300, 0.2, 0.3), (int(SR * i * 0.06), 0)) for i in range(5)])
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
put(s_waves(E['storm'] - 1), 1, 0.5)
track(4.6, E['cross'], 100, 62, [C, Am, F_, G_], seed=2401, gain=0.24, drums=1, wave='tri', swing=0.3)   # seaside theme
track(E['cross'], E['lamp'], 112, 60, [C, F_, G_, Am], seed=2402, gain=0.26, drums=1, wave='square', swing=0.2)
pad(E['lamp'], E['storm'], [55, 59, 62, 66], 0.18, 800, fade=0.5)   # mysterious lamp room
put(s_rain(E['calm'] - E['storm']), E['storm'], 1.0); put(s_waves(E['calm'] - E['storm']) * 1.6, E['storm'], 0.8)
track(E['storm'] + 2, E['saved'], 140, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2403, gain=0.32, drums=2, wave='saw')   # storm
mput(s_fanfare(), E['saved'], 0.8); track(E['saved'] + 2, E['calm'], 120, 60, [C, G_, Am, F_], seed=2404, gain=0.3, drums=2, wave='square')
bells(E['calm'], E['dawn'], 74, 'maj', 1.8, seed=2405, gain=0.16)   # starry calm
track(E['dawn'], E['excite'], 104, 62, [C, F_, C, G_], seed=2406, gain=0.26, drums=1, wave='tri', swing=0.3)
track(E['excite'], E['out'], 170, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2407, gain=0.36, drums=2, wave='saw')
track(E['out'], E['freeze'], 158, 60, [C, F_, G_, C], seed=2408, gain=0.36, drums=2, lead=2, wave='square')   # fish surfing
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2409, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2410, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_squawk(), E['keeper'] + 0.4, 0.8); put(s_jingle(), E['keys'] + 0.2, 0.7)
for i in range(16): put(s_flapw(), E['fly'] + i * 0.3, 0.6)
put(s_squawk(), E['fly'] + 1, 0.6)
for t in np.arange(E['boat'], E['boat'] + 6, 0.5): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
put(s_urp(), E['seasick'] + 1, 0.9); put(s_putt(E['arrive'] - E['cross']), E['cross'], 0.8); put(s_urp(), E['cross'] + 7, 0.7)
for t in np.arange(E['arrive'], E['lamp'], 0.3): put(s_step(), t, 0.3, rs.uniform(-.3, .3))
put(s_glub(), E['reveal'], 0.7); put(s_sting(), E['reveal'] + 0.6, 0.5)
for t in [E['storm'], E['storm'] + 9, E['jokes'] + 6, E['dance'] + 3, E['splash1'] + 6]: put(s_thunder(), t, 0.9)
put(s_whoosh(1.0, 200, 1500), E['ship'], 0.5); put(s_sparkle(), E['disco'] + 6, 0.7); put(s_splosh(), E['splash1'], 1.0)
put(s_bonk(), E['splash1'] + 3, 0.5); put(s_ding(), E['splash1'] + 9, 0.6); put(s_gloop(), E['feed'] + 0.6, 0.9)
put(s_splosh() * 0.6, E['leggy'] + 3, 0.8); put(s_heart(), E['leggy'] + 4, 0.6); put(s_sparkle(), E['leggy'] + 5, 0.7); put(s_whoosh(1.4, 400, 6000), E['discoUse'], 0.8)
put(s_squawk(), E['dawn'] + 1, 0.6)
for i in range(20): put(s_flapw(), E['dawn'] + i * 0.3, 0.5)
put(s_squawk(), E['lamp2'] + 1, 0.7); put(s_tinnitus(3), E['excite'] + 1, 0.8)
for t in np.arange(E['excite'] + 2, E['jump'], 0.15): put(s_glub(), t, 0.25, rs.uniform(-.6, .6))
for t in np.arange(E['jump'], E['grab'], 0.5): put(s_bonk(), t, 0.5, rs.uniform(-.6, .6))
put(s_shatter(), E['out'], 1.0); put(s_whoosh(2.0, 300, 3000), E['out'] + 0.4, 0.8); put(s_splosh(), E['splash2'], 1.1)
put(s_waves(E['freeze'] - E['splash2']) * 1.2, E['splash2'], 0.7); put(s_whoosh(1.4, 300, 4000), E['leapOut'], 0.9)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
