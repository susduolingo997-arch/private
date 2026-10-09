"""Episode 27 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_honk(): d = 0.45; n = int(SR * d); return mix(osc(415, d, 'square')[:n] * 0.22, osc(523, d, 'square')[:n] * 0.18) * env_ad(n, 0.01, 0.3)
def s_siren(d): return osc(700 + 250 * np.sin(2 * np.pi * 0.9 * T(d)), d, 'tri') * 0.18
def s_whistle(): d = 0.6; n = int(SR * d); return osc(2600 + 300 * np.sin(2 * np.pi * 30 * T(d)), d)[:n] * env_ad(n, 0.01, 0.4) * 0.3
def s_sputter(): d = 2.0; n = int(SR * d); return lp(noise(d), 500)[:n] * (np.sin(2 * np.pi * 7 * T(d)) > 0.4)[:n] * np.linspace(1, 0.2, n) * 1.2
def s_engine(d): return lp(osc(55 + 8 * np.sin(2 * np.pi * 0.3 * T(d)), d, 'saw'), 400) * 0.25
def s_crackle(d): n = int(SR * d); return mix(bp(noise(d), 1500, 7000)[:n] * (np.random.RandomState(5).rand(n) > 0.995) * 3.0, lp(noise(d), 300)[:n] * 0.15)
def s_crunch(): d = 1.2; n = int(SR * d); return mix(lp(noise(d), 900)[:n] * env_ad(n, 0.002, 0.5) * 1.5, s_clatter(0.9, 20, 1200) * 0.8, osc(sweep(120, 40, 0.6), 0.6) * 0.5)
def s_clang(): d = 0.8; n = int(SR * d); return mix(osc(1250, d)[:n] * env_ad(n, 0.001, 0.4), osc(1870, d)[:n] * env_ad(n, 0.001, 0.25) * 0.6) * 0.4
def s_twinkle(): n = int(SR * 0.3); return mix(*[np.concatenate([np.zeros(int(SR * i * 0.07)), osc(mtof(84 + (i * 5) % 12), 0.3)[:n] * env_ad(n, 0.005, 0.2) * 0.15]) for i in range(8)])
def s_stamp(): d = 0.3; n = int(SR * d); return mix(lp(noise(d), 600)[:n] * env_ad(n, 0.001, 0.06) * 1.2, osc(90, d)[:n] * env_ad(n, 0.001, 0.1) * 0.6)
def s_shutter27(): return mix(bp(noise(0.05), 2000, 8000) * 0.8, np.concatenate([np.zeros(int(SR * 0.12)), bp(noise(0.06), 1500, 6000) * 0.6]))
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['rtGo'], 112, 62, [C, F_, G_, C], seed=2701, gain=0.24, drums=1, wave='tri', swing=0.2)   # driveway
track(E['rtGo'], E['rtSiren'], 132, 64, [C, G_, Am, F_], seed=2702, gain=0.28, drums=2, lead=2, wave='square')   # road-trip theme
track(E['rtSiren'], E['rtTest'], 100, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2703, gain=0.22, drums=1, wave='saw')   # pulled over
track(E['rtTest'], E['rtPass'], 150, 60, [C, Am, F_, G_], seed=2704, gain=0.3, drums=2, wave='saw')   # cone slalom
track(E['rtPass'], E['rtDesert'], 126, 64, [C, F_, G_, C], seed=2705, gain=0.28, drums=1, wave='square')
track(E['rtDesert'], E['rtArrive'], 92, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2706, gain=0.24, drums=1, wave='tri', swing=0.3)   # desert twang
bells(E['rtArrive'], E['rtSput'], 70, 'maj', 0.6, seed=2707, gain=0.12)
pad(E['rtNight'], E['rtDawn'], [52, 55, 59], 0.13, 600, fade=1.0); bells(E['rtFire'], E['rtIdea'], 64, 'min', 0.7, seed=2708, gain=0.12)   # campfire
mput(s_fanfare(), E['rtDawn'] + 4, 0.4)
track(E['rtRun'], E['rtLot'], 176, 62, [C, G_, F_, G_], seed=2709, gain=0.36, drums=2, lead=2, wave='square')   # Leggy runs
track(E['rtLot'], E['rtWow'], 96, 60, [C, F_, C, G_], seed=2710, gain=0.2, drums=1, wave='tri')
pad(E['rtWow'], E['rtPhoto'], [60, 64, 67, 71], 0.18, 1500, fade=0.6); bells(E['rtWow'], E['rtCop3'], 76, 'maj', 1.2, seed=2711, gain=0.16)
track(E['rtPark'], E['rtBonk'], 104, 62, [C, F_, G_, C], seed=2712, gain=0.2, drums=1, wave='tri')
track(E['rtTip'], E['freeze'], 168, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2713, gain=0.34, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2714, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2715, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(E['rtSeat'], E['rtSeat'] + 4.5, 0.3): put(s_step(), t, 0.3, rs.uniform(-.3, .3))
put(s_sparkle(), E['rtVan'], 0.6); put(s_boing(0.5), E['rtSeat'] + 1.5, 0.6); put(s_wah(), E['rtSeat'] + 4.8, 0.5)
put(s_engine(E['rtPull'] - E['rtGo']), E['rtGo'], 0.45); put(s_engine(E['rtPass'] - E['rtTest']), E['rtTest'], 0.35); put(s_engine(E['rtArrive'] - E['rtGo2']), E['rtGo2'], 0.45)
for t in [E['rtHonk'], E['rtHonk'] + 0.7, E['rtPass'] + 2, E['rtGo2'] + 0.5, E['rtDrop'] + 1.5]: put(s_honk(), t, 0.85)
put(s_bonk(), E['rtBump'], 0.8); put(s_clang(), E['rtBump'] + 0.2, 0.8); put(s_clang(), E['rtFix1'] + 3, 0.7)
for t in np.arange(E['rtFix1'] + 1, E['rtFix1'] + 3.5, 0.18): put(s_step(), t, 0.4)
put(s_swish(), E['rtMap'] + 0.8, 0.5); put(s_screech(0.8), E['rtTurn'], 0.6)
put(s_siren(E['rtCop'] - E['rtSiren']), E['rtSiren'], 0.8)
put(s_whistle(), E['rtNoLic'] + 2.2, 0.8)
for t in [E['rtTest'] + 2.5, E['rtTest'] + 7.5, E['rtTest'] + 12.5]: put(s_whistle(), t, 0.6)
put(s_stamp(), E['rtPass'] + 0.4, 1.0); put(s_stamp(), E['rtPass'] + 0.9, 0.9); put(s_sparkle(), E['rtPass'] + 1.2, 0.7)
for i in range(6): put(s_chirp(), E['rtPass'] + 1 + i * 0.2, 0.5, -0.5 + i * 0.2)
put(s_clang(), E['rtDoor'], 0.9); put(s_bonk(), E['rtDoor'] + 0.7, 0.6)
put(s_sting(), E['rtTiny'], 0.6); put(s_wah(), E['rtTwist'] + 1.5, 0.7)
put(s_sputter(), E['rtSput'], 1.0)
put(s_crackle(E['rtDawn'] - E['rtFire']), E['rtFire'], 0.5); put(s_whoosh(0.6, 300, 2500), E['rtFire'], 0.6)
put(s_stamp(), E['rtFire'] + 2, 0.6); put(s_whoosh(0.5, 500, 4000), E['rtMarsh'] + 0.6, 0.7)
put(s_twinkle(), E['rtStar'], 0.8); put(s_siren(4), E['rtStar'] + 2, 0.35)
put(s_pop(), E['rtIdea'] + 2.6, 0.7)
put(s_creak(1.6), E['rtLift'], 0.8); put(s_boing(0.6), E['rtLift'] + 2, 0.6)
for t in np.arange(E['rtRun'], E['rtLot'] + 4, 0.14): put(s_thock(), t, 0.25, rs.uniform(-.4, .4))
put(s_siren(10), E['rtCone2'], 0.7); put(s_whistle(), E['rtCone2'] + 1.5, 0.7); put(s_whoosh(1.2, 300, 3000), E['rtMph'], 0.8)
put(s_screech(1.0), E['rtLot'] + 3, 0.5); put(s_thock(), E['rtDrop'] + 1, 0.8)
put(s_sparkle(), E['rtWow'], 0.8); put(s_shutter27(), E['rtPhoto'] + 0.6, 1.0)
put(s_siren(2.5), E['rtCop3'], 0.6); put(s_whistle(), E['rtCop3'] + 3, 0.7)
put(s_bonk(), E['rtBonk'], 1.0); put(s_creak(2.2), E['rtBonk'] + 1, 0.8); put(s_rumble(3), E['rtBonk'] + 3, 0.6)
put(s_screech(1.0), E['rtJump'], 0.5); put(s_boom(1.2, 0.5), E['rtTip'] + 1.2, 0.7)
for t in np.arange(E['rtTip'] + 1.2, E['freeze'], 0.7): put(s_thock(), t, 0.5)
put(s_crunch(), E['rtFlat'] - 0.2, 1.0); put(s_crunch(), E['rtShop'] - 0.2, 0.9); put(s_clatter(1.4, 26, 2000), E['rtShop'], 0.6)
put(s_stamp(), E['rtInvoice'], 0.6); put(s_whistle(), E['rtTicket'] - 0.5, 0.7); put(s_stamp(), E['rtTicket'] + 3.6, 0.8)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
