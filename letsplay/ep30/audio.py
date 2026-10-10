"""Episode 30 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_ping30(): d = 1.2; n = int(SR * d); return mix(osc(1320, d)[:n] * env_ad(n, 0.002, 1.0) * 0.3, osc(1980, d)[:n] * env_ad(n, 0.002, 0.4) * 0.1)
def s_clonk30(): d = 1.0; n = int(SR * d); return mix(osc(140, d)[:n] * env_ad(n, 0.001, 0.6) * 0.8, osc(377, d)[:n] * env_ad(n, 0.001, 0.4) * 0.4, bp(noise(d), 300, 2000)[:n] * env_ad(n, 0.001, 0.1) * 0.8)
def s_spray30(d): n = int(SR * d); return bp(noise(d), 1500, 7000)[:n] * env_ad(n, 0.02, d * 0.95) * 0.5
def s_roar30(d=2.4): n = int(SR * d); return mix(lp(osc(sweep(55, 38, d), d, 'saw'), 400)[:n] * 0.8, lp(noise(d), 300)[:n] * 0.6) * env_ad(n, 0.2, d * 0.8)
def s_gulp30(): d = 0.8; n = int(SR * d); return osc(sweep(300, 70, d), d)[:n] * env_ad(n, 0.01, 0.7) * 0.8
def s_tink30(): d = 0.5; n = int(SR * d); return mix(osc(3100, d)[:n], osc(4650, d)[:n] * 0.5) * env_ad(n, 0.001, 0.12) * 0.35
def s_splash30(): d = 1.2; n = int(SR * d); return mix(lp(noise(d), 3000)[:n] * env_ad(n, 0.005, 0.8) * 1.1, lp(noise(d), 500)[:n] * env_ad(n, 0.01, 0.4) * 0.8)
def s_bubbles30(d):
    n = int(SR * d); out = np.zeros(n); r = np.random.RandomState(30)
    for s0 in np.arange(0, max(0.0, d - 0.15), 0.07):
        i = int(s0 * SR); b = osc(sweep(400 + r.rand() * 600, 900 + r.rand() * 900, 0.08), 0.08); b = b[:max(0, min(len(b), n - i))]
        out[i:i + len(b)] += b * env_ad(len(b), 0.005, 0.07) * 0.25
    return out
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['sbBoard'], 120, 62, [C, F_, G_, C], seed=3001, gain=0.24, drums=1, wave='tri', swing=0.3)   # harbor shanty
pad(E['sbBoard'], E['sbCabin'], [55, 60, 64, 67], 0.14, 1200, fade=0.6)
pad(E['sbCabin'], E['sbDeep'], [45, 52, 57], 0.14, 600, fade=0.6)   # the red cabin
track(E['sbDeep'], E['sbIdea'], 92, 57, [Am, F_, Dm, Em], mode='min', seed=3002, gain=0.2, drums=1, wave='tri'); bells(E['sbDeep'], E['sbBump'], 81, 'min', 0.8, seed=3003, gain=0.1)   # the deep
track(E['sbChip'], E['sbEye'], 168, 60, [Am, F_, G_, Am], mode='min', seed=3004, gain=0.28, drums=2, wave='saw')   # leaks
pad(E['sbTrench'], E['sbMo'], [40, 47, 52], 0.16, 500, fade=0.8); bells(E['sbTrench'], E['sbDark'], 76, 'min', 0.6, seed=3005, gain=0.1)
track(E['sbChase'], E['sbCorner'], 176, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=3006, gain=0.34, drums=2, wave='saw')   # chase
pad(E['sbCorner'], E['sbGive'], [45, 48, 52, 55], 0.15, 700, fade=0.6)
pad(E['sbGive'], E['sbBff'], [60, 64, 67, 71], 0.16, 1400, fade=0.6); bells(E['sbGive'], E['sbBff'] + 2, 76, 'maj', 1.0, seed=3007, gain=0.12)
track(E['sbBff'], E['sbBreach'], 112, 64, [C, G_, Am, F_], seed=3008, gain=0.22, drums=1, wave='tri')
track(E['sbLand'] + 2, E['sbInstall'], 110, 62, [F_, C, G_, C], seed=3009, gain=0.22, drums=1, wave='tri', swing=0.25)   # sunset harbor
track(E['sbInstall'], E['sbInstall'] + 12, 180, 64, [C, F_, G_, C], seed=3010, gain=0.26, drums=2, wave='square')   # timelapse
track(E['sbGlass'], E['sbView'], 120, 64, [C, Am, F_, G_], seed=3011, gain=0.22, drums=1, wave='tri')
track(E['sbView'], E['sbTap'], 100, 64, [C, Am, F_, G_], seed=3012, gain=0.2, drums=1, wave='tri'); bells(E['sbView'], E['sbTap'], 76, 'maj', 1.2, seed=3013, gain=0.12)   # reef wonder
pad(E['sbTap'], E['sbBurst'], [55, 58, 62], 0.14, 800, fade=0.5)
track(E['sbBurst'], E['sbSpit'], 172, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=3014, gain=0.32, drums=2, wave='saw')
track(E['sbSpit'], E['sbTeeter'], 132, 60, [C, F_, G_, C], seed=3015, gain=0.24, drums=1, wave='square', swing=0.3)
pad(E['sbTeeter'], E['sbSink'], [55, 59, 62, 67], 0.14, 1000, fade=0.4)
track(E['sbSink'], E['freeze'], 168, 57, [Am, F_, G_, Am], mode='min', seed=3016, gain=0.3, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=3017, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=3018, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(0.5, 8, 0.42): put(s_step(), t, 0.2, rs.uniform(-.3, .3))
put(s_whoosh(1.0, 300, 3000), E['sbReveal'], 0.7); put(s_sparkle(), E['sbReveal'] + 0.4, 0.6); put(s_fanfare(), E['sbReveal'] + 0.5, 0.3)
put(s_drip(), E['sbBottle'] + 0.9, 0.6); put(s_swish(), E['sbBottle'] + 2.6, 0.5)
put(s_rumble(2.4) * 0.4, E['sbTour'], 0.4); put(s_click(), E['sbTour'] + 2.8, 0.5); put(s_click(), E['sbTour'] + 3.4, 0.5); put(s_ding(), E['sbTour'] + 5.4, 0.4)
put(s_wah(), E['sbNoWin'] + 2.5, 0.5); put(s_sting(), E['sbNoWin'] + 4.4, 0.4)
for s0 in [0.5, 1.6, 2.8, 3.4, 4.6]: put(s_thock(), E['sbBoard'] + s0, 0.5)
put(s_splash30(), E['sbDive'] + 0.5, 0.9); put(s_bubbles30(3.5), E['sbDive'] + 0.8, 0.6)
put(s_creak(2.0), E['sbCabin'] + 0.5, 0.4); put(s_creak(1.2), E['sbPeri'] + 0.3, 0.5)
for i in range(6): put(s_ping30(), E['sbSonar'] + 0.4 + i * 1.3, 0.6)
put(s_bubbles30(E['sbIdea'] - E['sbDeep']) * 0.5, E['sbDeep'], 0.5)
put(s_clonk30(), E['sbBump'], 1.0); put(s_ping30(), E['sbBump'] + 1.4, 0.5); put(s_clonk30(), E['sbBump2'], 1.0)
put(s_swish(), E['sbChip'] - 0.4, 0.5); put(s_tink30(), E['sbChip'], 0.9); put(s_spray30(E['sbLeak'] + 6 - E['sbChip']), E['sbChip'], 0.7)
for i in range(6): put(s_spray30(0.8), E['sbLeak'] + i * 0.9, 0.7, rs.uniform(-.6, .6)); put(s_thock(), E['sbLeak'] + i * 0.9 + 0.75, 0.5)
put(s_sting(), E['sbEye'], 0.7); put(s_screech(1.0), E['sbEye'] + 0.1, 0.4)
put(s_bubbles30(5.0) * 0.5, E['sbTrench'], 0.5); put(s_sparkle(), E['sbTrench'] + 5.4, 0.5)
put(s_click(), E['sbClaw'] + 1.5, 0.6); put(s_click(), E['sbGrab'] + 0.5, 0.7); put(s_creak(1.8), E['sbGrab'] + 0.7, 0.6); put(s_pop(), E['sbGrab'] + 2.5, 0.8); put(s_wah(), E['sbDark'], 0.5)
put(s_rumble(2.5) * 0.6, E['sbMo'], 0.6); put(s_roar30(2.6), E['sbMo'] + 2.4, 1.0); put(s_bubbles30(2.0), E['sbMo'] + 2.6, 0.7)
put(s_roar30(1.4), E['sbChase'] + 3, 0.6); put(s_boom(1.0, 0.6), E['sbGap'] + 1.5, 0.8); put(s_clatter(1.0, 14, 2000), E['sbGap'] + 1.6, 0.6)
put(s_creak(1.5), E['sbHatch'], 0.6); put(s_bubbles30(2.0), E['sbHatch'] + 0.4, 0.5)
put(s_click(), E['sbGive'], 0.8); put(s_sparkle(), E['sbGive'] + 0.1, 0.7); put(s_heart(), E['sbGive'] + 1.5, 0.6); put(s_heart(), E['sbBff'] + 0.6, 0.5)
put(s_gulp30(), E['sbTow'] + 1.8, 0.7); put(s_bubbles30(E['sbBreach'] - E['sbTow'] - 2), E['sbTow'] + 2, 0.5)
put(s_splash30(), E['sbBreach'] + 0.5, 1.0); put(s_whoosh(1.4, 300, 3000), E['sbBreach'] + 1.5, 0.7); put(s_splash30(), E['sbLand'], 1.0)
put(s_creak(1.2), E['sbOut'] - 0.3, 0.5); put(s_blorp(1.2), E['sbGift'] + 0.3, 0.6); put(s_sparkle(), E['sbGift'] + 1.4, 0.6)
for i in range(24): put(s_thock() if i % 3 else s_tink30(), E['sbInstall'] + 0.4 + i * 0.48, 0.4, rs.uniform(-.5, .5))
put(s_swish(), E['sbInvoice'] + 0.5, 0.6); put(s_sting(), E['sbInvoice'] + 2.4, 0.4); put(s_sparkle(), E['sbGlass'] + 0.5, 0.7)
put(s_splash30(), E['sbDive2'] + 0.5, 0.9); put(s_bubbles30(3.5), E['sbDive2'] + 0.8, 0.6)
put(s_bubbles30(E['sbTap'] - E['sbView']) * 0.4, E['sbView'], 0.4); put(s_chirp(), E['sbMoWave'] + 0.5, 0.5)
put(s_tink30(), E['sbTap'] + 0.6, 0.8); put(s_tink30(), E['sbTap2'] + 0.6, 0.8); put(s_crack(), E['sbTap2'] + 1.6, 0.5); put(s_bonk(), E['sbTap3'] + 0.6, 0.6); put(s_crack(), E['sbTap3'] + 1.2, 0.9)
put(s_glass_break(1.4), E['sbBurst'], 1.0); put(s_spray30(4.5), E['sbBurst'] + 0.2, 0.8); put(s_bubbles30(4.5), E['sbBurst'] + 0.3, 0.7)
put(s_roar30(1.0) * 0.5, E['sbGulp'] + 1.3, 0.5); put(s_gulp30(), E['sbGulp'] + 2.5, 1.0)
put(s_splash30(), E['sbSpit'] + 0.5, 0.9); put(s_whoosh(1.2, 300, 3000), E['sbSpit'] + 1.5, 0.7); put(s_boom(1.0, 0.6), E['sbSpit'] + 3, 0.9); put(s_clatter(1.0, 14, 2500), E['sbSpit'] + 3.1, 0.6)
put(s_swish(), E['sbInv2'] + 0.5, 0.6); put(s_creak(3.0), E['sbTeeter'], 0.7); put(s_click(), E['sbTeeter'] + 3.3, 0.6)
put(s_screech(1.2), E['sbSink'], 0.5); put(s_splash30(), E['sbSink'] + 1.3, 1.0); put(s_bubbles30(E['freeze'] - E['sbSink'] - 1.4), E['sbSink'] + 1.4, 0.7)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
