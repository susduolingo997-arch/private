"""Episode 31 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_stair31(): d = 0.35; n = int(SR * d); return mix(osc(sweep(220, 520, d), d)[:n] * env_ad(n, 0.002, 0.12) * 0.5, bp(noise(d), 600, 3000)[:n] * env_ad(n, 0.001, 0.04) * 0.5)
def s_recycle31(): d = 0.4; n = int(SR * d); return osc(sweep(900, 200, d), d, 'tri')[:n] * env_ad(n, 0.005, 0.3) * 0.35
def s_baa31(d=0.9):
    n = int(SR * d); f = 300 * (1 + 0.06 * np.sin(2 * np.pi * 22 * T(d)))[:n]; ph = 2 * np.pi * np.cumsum(f) / SR
    return lp(np.sign(np.sin(ph)) * 0.5 + np.sin(2 * ph) * 0.3, 2200)[:n] * env_ad(n, 0.04, d * 0.8) * 0.6
def s_summit31(d=4.0): n = int(SR * d); return mix(*[osc(f, d)[:n] * env_ad(n, 0.002, d * k) * g for f, k, g in [(523, 0.9, 0.4), (1046, 0.6, 0.2), (1318, 0.5, 0.15), (1568, 0.4, 0.12), (2093, 0.25, 0.08)]])
def s_wind31(d): n = int(SR * d); w = bp(noise(d), 300, 1400)[:n]; return w * (0.5 + 0.5 * np.sin(2 * np.pi * 0.7 * T(d)[:n])) * env_ad(n, d * 0.3, d * 0.6) * 0.7
def s_aval31(d=10.0): n = int(SR * d); return mix(lp(noise(d), 180)[:n] * 1.4, lp(noise(d), 900)[:n] * 0.5) * env_ad(n, 2.0, d * 0.9)
def s_shutter31(): d = 0.3; n = int(SR * d); x = np.zeros(n); x[:int(SR * 0.02)] += bp(noise(0.02), 2000, 8000)[:int(SR * 0.02)]; i = int(SR * 0.09); x[i:i + int(SR * 0.03)] += bp(noise(0.03), 1500, 6000)[:int(SR * 0.03)] * 0.7; return x * 0.8
def s_munch31(d=1.6):
    n = int(SR * d); out = np.zeros(n)
    for s0 in np.arange(0, d - 0.12, 0.2): i = int(s0 * SR); c = bp(noise(0.1), 400, 2500)[:int(SR * 0.1)] * env_ad(int(SR * 0.1), 0.003, 0.06); out[i:i + len(c)] += c[:max(0, n - i)] * 0.6
    return out
def s_fwump31(): d = 1.4; n = int(SR * d); return mix(lp(noise(d), 400)[:n] * env_ad(n, 0.01, 1.0) * 1.2, osc(sweep(90, 40, d), d)[:n] * env_ad(n, 0.005, 0.8) * 0.8)
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['mtClimb'], 112, 62, [C, F_, C, G_], seed=3101, gain=0.24, drums=1, wave='tri', swing=0.25)   # base camp yodel-ish
track(E['mtClimb'], E['mtCloud'], 132, 62, [C, G_, Am, F_], seed=3102, gain=0.24, drums=1, wave='square')   # the climb
pad(E['mtCloud'], E['mtAbove'], [60, 64, 67, 71], 0.14, 1400, fade=0.8); bells(E['mtCloud'], E['mtAbove'], 84, 'maj', 0.8, seed=3103, gain=0.08)
track(E['mtAbove'], E['mtSummit'] + 4, 96, 64, [F_, C, G_, Am], seed=3104, gain=0.22, drums=1, wave='tri'); bells(E['mtAbove'], E['mtSummit'] + 4, 76, 'maj', 1.2, seed=3105, gain=0.12)   # above the clouds
pad(E['mtFrame'], E['mtDing'], [57, 60, 64], 0.14, 900, fade=0.5)
track(E['mtChase'], E['mtBonkH'] + 1, 170, 60, [C, F_, G_, C], seed=3106, gain=0.28, drums=2, wave='square', swing=0.2)   # goat chase
track(E['mtTripod'], E['mtRing'], 104, 62, [Am, F_, C, G_], seed=3107, gain=0.2, drums=1, wave='tri')
pad(E['mtRing'], E['mtRing'] + 6, [55, 60, 64, 67], 0.16, 1400, fade=0.6)
track(E['mtRing'] + 6.5, E['mtDown'] + 3, 120, 64, [C, G_, F_, C], seed=3108, gain=0.24, drums=1, wave='tri')
pad(E['mtDown'] + 3.5, E['mtFlash'], [45, 52, 55], 0.15, 600, fade=0.5)
track(E['mtFlash'], E['mtFlash'] + 4, 112, 62, [C, F_, C, G_], seed=3101, gain=0.12, drums=0, wave='tri')   # flashback (muffled)
pad(E['mtNight'], E['mtPlanB'], [45, 48, 52, 57], 0.13, 500, fade=1.0); bells(E['mtNight'], E['mtPlanA'], 69, 'min', 0.6, seed=3109, gain=0.08)   # cold night
track(E['mtPlanB'], E['mtLeggy'], 150, 57, [Am, F_, G_, Am], mode='min', seed=3110, gain=0.24, drums=2, wave='saw')
track(E['mtLeggy'] + 4, E['mtCarry'] + 2, 140, 62, [C, G_, Am, F_], seed=3111, gain=0.26, drums=2, wave='square')   # Leggy climbs!
track(E['mtCarry'] + 2, E['mtBase'], 108, 64, [F_, C, G_, C], seed=3112, gain=0.22, drums=1, wave='tri'); bells(E['mtCarry'], E['mtDescend'] + 4, 76, 'maj', 1.2, seed=3113, gain=0.1)
track(E['mtBase'], E['mtRumble'], 120, 62, [C, F_, G_, C], seed=3114, gain=0.22, drums=1, wave='tri', swing=0.25)
pad(E['mtRumble'], E['mtAval'], [40, 43, 47], 0.16, 400, fade=0.3)
track(E['mtAval'], E['mtBury'], 178, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=3115, gain=0.34, drums=2, wave='saw')
pad(E['mtPop'], E['freeze'], [55, 59, 62, 67], 0.12, 1000, fade=0.6)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=3117, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=3118, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(0.5, 7, 0.42): put(s_step(), t, 0.2, rs.uniform(-.3, .3))
put(s_whoosh(1.0, 300, 3000), E['mtReveal'], 0.7); put(s_sparkle(), E['mtReveal'] + 0.4, 0.6); put(s_click(), E['mtReveal'] + 4.4, 0.7)
put(s_sparkle(), E['mtLegend'] + 0.8, 0.4); put(s_wah(), E['mtScared'] + 4.0, 0.5)
for i in range(5): put(s_stair31(), E['mtTest'] + 0.4 + i * 0.35, 0.7, rs.uniform(-.4, .4))
put(s_ding(), E['mtTest'] + 3.4, 0.5); put(s_recycle31(), E['mtEco'] + 1.4, 0.5); put(s_recycle31(), E['mtEco'] + 1.9, 0.5)
for i in range(3): put(s_recycle31(), E['mtEco'] + 4.0 + i * 0.3, 0.4)
for t in np.arange(E['mtCliff'] + 0.3, E['mtSummit'], 0.85): put(s_stair31(), t, 0.25, rs.uniform(-.5, .5))
put(s_wind31(5.0), E['mtGust'], 1.0); put(s_whoosh(1.2, 300, 3000), E['mtGust'] + 0.4, 0.5); put(s_boing(0.6), E['mtGust'] + 3.2, 0.5)
put(s_baa31(), E['mtGoat'] + 0.3, 0.8); put(s_munch31(2.0), E['mtGoat'] + 4.5, 0.5)
put(s_baa31(0.6), E['mtSnap1'] + 2.0, 0.9); put(s_shutter31(), E['mtSnap1'] + 2.5, 0.9)
put(s_wind31(E['mtAbove'] - E['mtCloud']) * 0.5, E['mtCloud'], 0.6); put(s_baa31(0.7), E['mtCloud'] + 3.6, 0.7)
put(s_sparkle(), E['mtAbove'] + 0.5, 0.6); put(s_fanfare(), E['mtSummit'] + 5, 0.4)
put(s_wah(), E['mtFrame'] + 4.5, 0.4)
put(s_bell(1050, 0.8, 0.4), E['mtDing'] + 0.2, 0.6); put(s_bell(1050, 0.8, 0.5), E['mtDing'] + 3.8, 0.8); put(s_sting(), E['mtDing'] + 4.6, 0.4)
for i in range(10): put(s_bell(1050, 0.4, 0.25), E['mtChase'] + 0.5 + i * 0.8, 0.4, rs.uniform(-.6, .6))
put(s_bonk(), E['mtBonkH'] + 0.6, 1.0); put(s_whoosh(0.9, 300, 3000), E['mtBonkH'] + 0.7, 0.6); put(s_fwump31(), E['mtBonkH'] + 2.0, 0.8)
put(s_creak(1.2), E['mtTripod'] + 2.2, 0.5); put(s_pop(), E['mtTripod'] + 2.8, 0.8); put(s_munch31(1.8), E['mtTripod'] + 4.4, 0.8); put(s_sting(), E['mtTripod'] + 5.8, 0.3)
put(s_ding(), E['mtTrade'] + 1.6, 0.4); put(s_swish(), E['mtTrade'] + 3.4, 0.6); put(s_bonk(), E['mtTrade'] + 5.7, 0.9); put(s_baa31(), E['mtTrade'] + 6.6, 0.8); put(s_bell(1050, 0.6, 0.5), E['mtTrade'] + 8.5, 0.6)
put(s_click(), E['mtRing'] + 5.2, 0.6); put(s_summit31(5.0), E['mtRing'] + 6.2, 1.0); put(s_summit31(3.0) * 0.4, E['mtRing'] + 7.6, 0.5, -0.6); put(s_summit31(3.0) * 0.2, E['mtRing'] + 8.8, 0.4, 0.6)
put(s_shutter31(), E['mtSelfie'] + 3.4, 1.0); put(s_sparkle(), E['mtSelfie'] + 3.6, 0.5)
put(s_sting(), E['mtDown'] + 4.4, 0.7); put(s_tick(), E['mtEcoRev'] + 0.9, 0.5); put(s_tick(), E['mtEcoRev'] + 1.6, 0.5); put(s_tick(), E['mtEcoRev'] + 2.3, 0.5); put(s_wah(), E['mtEcoRev'] + 2.9, 0.6)
put(s_whoosh(0.8, 300, 3000), E['mtFlash'] - 0.4, 0.6); put(s_whoosh(0.8, 3000, 300), E['mtFlash'] + 3.6, 0.6)
put(s_wind31(E['mtPlanB'] - E['mtNight']) * 0.4, E['mtNight'], 0.6)
put(s_whoosh(0.9, 300, 3000), E['mtPlanA'] + 4.5, 0.6); put(s_drip(), E['mtPlanA'] + 8.6, 0.8)
for j in range(10): put(s_stair31(), E['mtPlanB'] + 0.6 + j * 0.3, 0.6, rs.uniform(-.4, .4))
for j in range(9): put(s_recycle31(), E['mtPlanB'] + 2.4 + j * 0.45, 0.4)
put(s_sting(), E['mtPlanB'] + 6.6, 0.5); put(s_creak(1.6), E['mtLeggy'] + 1.5, 0.6)
for t in np.arange(E['mtLeggy'] + 2.5, E['mtLeggy'] + 7, 0.25): put(s_thock(), t, 0.25, rs.uniform(-.5, .5))
put(s_heart(), E['mtLeggy'] + 7.5, 0.6)
for t in np.arange(E['mtDescend'] + 0.5, E['mtBase'] - 0.5, 0.3): put(s_thock(), t, 0.15, rs.uniform(-.5, .5))
put(s_screech(0.8), E['mtSlip'], 0.5); put(s_crack(), E['mtSlip'] + 0.6, 0.6); put(s_wind31(5.0) * 0.6, E['mtCloud2'], 0.6)
put(s_blorp(0.8), E['mtBase'] + 5.3, 0.6); put(s_swish(), E['mtInvoice'] + 0.6, 0.6); put(s_sting(), E['mtInvoice'] + 2.4, 0.3)
put(s_summit31(4.0), E['mtRingB'] + 1.0, 1.0); put(s_rumble(5.0), E['mtRumble'], 0.8); put(s_crack(), E['mtRumble'] + 3.4, 0.7)
put(s_aval31(E['mtBury'] - E['mtAval'] + 1), E['mtAval'], 1.0); put(s_baa31(), E['mtRun'] + 2, 0.7); put(s_fwump31(), E['mtBury'] + 0.1, 1.0)
for i in range(3): put(s_pop(), E['mtPop'] + 0.5 + i, 0.7)
put(s_bell(1050, 0.8, 0.5), E['mtPop'] + 5.8, 0.8)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
