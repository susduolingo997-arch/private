"""Episode 15 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_applause(d=3.0): n = noise(d); cl = np.zeros_like(n); r = np.random.RandomState(int(d * 100)); [cl.__setitem__(slice(i, i + 300), 1) for i in r.randint(0, len(n) - 300, int(d * 160))]; return bp(n, 900, 5000) * cl * np.minimum(1, T(d) / 0.3) * np.minimum(1, (d - T(d)) / 0.6) * 0.5
def s_tap(): d = 0.06; return bp(noise(d), 2500, 7000) * env_ad(int(SR * d), 0.001, 0.012) * 0.9
def s_servo(d=0.5): return osc(sweep(300, 700, d) + 40 * np.sin(2 * np.pi * 30 * T(d)), d, 'square') * env_ad(int(SR * d), 0.01, d / 2) * 0.12
def s_clack(): d = 0.12; return mix(bp(noise(d), 600, 2400) * env_ad(int(SR * d), 0.001, 0.02), osc(220, d, 'tri') * env_ad(int(SR * d), 0.001, 0.03) * 0.5) * 0.8
def s_sizzle(d=3.0): return bp(noise(d), 3000, 9000) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * T(d))) * np.minimum(1, T(d) / 0.5) * 0.25
def s_spinup(d=4.0): return osc(sweep(120, 1400, d), d, 'saw') * np.minimum(1, T(d) / 0.3) * 0.18
def s_powerdown(d=1.6): return osc(sweep(600, 40, d), d, 'square') * env_ad(int(SR * d), 0.01, d / 1.5) * 0.25
def s_thoom(): return mix(s_boom(2.6, 1.3), s_clatter(2.0, 30, 1500) * 0.8)
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['rehearse'], 112, 60, [C, Am, F_, G_], seed=901, gain=0.3, drums=1, swing=0.2)
track(E['rehearse'], E['fall1'], 128, 60, [C, G_], seed=902, gain=0.32, drums=2, wave='square')
track(E['leggyTap'] - 4, E['chip'], 132, 62, [C, F_, C, G_], seed=903, gain=0.24, drums=1, wave='tri', swing=0.4)   # Leggy's jazz motif
track(E['chip'], E['chipEnd'], 150, 60, [C, F_, G_, C], seed=904, gain=0.3, drums=1, wave='square')
track(E['chipOn'] + 1, E['arrive'], 120, 62, [C, Am, F_, G_], seed=905, gain=0.34, drums=2)
pad(E['arrive'], E['prestin'], [57, 60, 64, 69], 0.22, 1400); bells(E['arrive'], E['prestin'], 76, 'maj', 1.1, seed=906, gain=0.16)
track(E['prestin'], E['sitAct'], 96, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=907, gain=0.26, drums=1, wave='tri', swing=0.3)   # magic act
pad(E['sitAct'], E['sitAct'] + 4, [60, 61], 0.12, 600, fade=0.2)
track(E['sitAct'] + 4, E['wings'], 140, 60, [C, G_, F_, C], seed=908, gain=0.34, drums=2)
track(E['wings'], E['ourAct'], 132, 62, [C, F_, C, G_], seed=903, gain=0.22, drums=1, wave='tri', swing=0.4)
s_dr = s_drumroll(3.0); put(s_dr, E['ourAct'] + 2.6, 0.7)
track(E['dance'], E['hot'], 128, 57, [(0, 'm'), (8, 'M'), (3, 'M'), (10, 'M')], mode='min', seed=909, gain=0.42, drums=2, lead=2, wave='square')   # Bonk-bot's dance-pop theme
track(E['hot'], E['turbo'], 128, 57, [(0, 'm'), (8, 'M')], mode='min', seed=910, gain=0.36, drums=2, wave='saw')
track(E['turbo'], E['dark'], 190, 57, [(0, 'm'), (8, 'M'), (3, 'M'), (10, 'M')], mode='min', seed=911, gain=0.46, drums=2, lead=2, wave='saw')
pad(E['dark'] + 0.3, E['leggyOn'], [45, 48], 0.14, 500, fade=0.3)
track(E['tap'], E['score10'], 138, 62, [C, Am, Dm, G_], seed=912, gain=0.36, drums=1, lead=2, wave='tri', swing=0.45)   # Leggy's tap number
mput(s_fanfare(), E['score10'], 0.7); track(E['score10'] + 1.5, E['botStop'], 120, 62, [C, F_, G_, C], seed=913, gain=0.32, drums=2)
track(E['botStop'], E['trophy'], 100, 60, [Am, F_, C, G_], seed=914, gain=0.24, drums=1, wave='tri')
mput(s_fanfare(), E['trophy'] + 2.5, 0.6); track(E['trophy'] + 4, E['sorry'], 116, 62, [C, Am, F_, G_], seed=915, gain=0.3, drums=1, swing=0.2)
pad(E['sorry'], E['encore'], [60, 64, 67, 71], 0.22, 1500); bells(E['sorry'], E['encore'], 79, 'maj', 0.9, seed=916, gain=0.16)
track(E['encore'], E['reboot'], 132, 62, [C, F_, C, G_], seed=917, gain=0.38, drums=2, lead=2, wave='tri', swing=0.4)
track(E['reboot'] + 3, E['collapse'], 180, 57, [(0, 'm'), (8, 'M'), (3, 'M'), (10, 'M')], mode='min', seed=918, gain=0.44, drums=2, lead=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=919, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=920, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(E['botIn'], E['botIn'] + 3, 0.5): put(s_servo(0.4), t, 0.5)
for t in np.arange(E['rehearse'], E['fall1'], 0.45): put(s_servo(0.3), t, 0.5, rs.uniform(-.4, .4))
put(s_clatter(1.2, 24, 2000), E['fall1'] + 0.3, 0.9); put(s_bonk(), E['fall1'] + 0.35, 0.8)
for t in np.arange(E['leggyTap'] - 4, E['leggyTap'] + 1.4, 0.13): put(s_tap(), t, 0.5, rs.uniform(-.5, .2))
for t in np.arange(E['chip'], E['chipEnd'], 0.7): put(s_thock(), t, 0.4, rs.uniform(-.3, .3))
put(s_ding(), E['chipEnd'] - 1.5, 0.6); put(s_servo(0.8), E['chipOn'], 0.7); put(s_sparkle(), E['chipOn'] + 2, 0.6)
for t in np.arange(E['chipOn'] + 2, E['walk'], 0.13): put(s_tap(), t, 0.3, -0.5)
put(s_applause(3), E['arrive'] + 1, 0.4)
for t in np.arange(E['judge'] + 1, E['judge'] + 3, 0.22): put(s_clack(), t, 0.7)
put(s_drumroll(2.0), E['wig'] - 2.2, 0.6); put(s_whoosh(1.0, 400, 4000), E['wig'], 0.7); put(s_sparkle(), E['wig'] + 1.1, 0.7); put(s_applause(4), E['wig'] + 0.4, 0.8)
for t in np.arange(E['score7'], E['score7'] + 1.6, 0.22): put(s_clack(), t, 0.6)
put(s_applause(1.0) * 0.3, E['sitAct'] + 1, 0.3); put(s_applause(6), E['sitAct'] + 4, 1.0)
for t in np.arange(E['sitAct'] + 4, E['sitAct'] + 6, 0.22): put(s_clack(), t, 0.7)
for t in np.arange(E['wings'] + 2.6, E['wings'] + 4.6, 0.13): put(s_tap(), t, 0.5, -0.4)
for t in np.arange(E['dance'], E['hot'], 0.468): put(s_servo(0.25), t, 0.35, rs.uniform(-.3, .3))
put(s_applause(8), E['dance'] + 8, 0.7); put(s_applause(6), E['hot'] - 2, 0.8)
put(s_sizzle(E['launch'] - E['hot']), E['hot'], 0.7); put(s_spinup(E['launch'] - E['turbo']), E['turbo'], 0.8)
put(s_whoosh(1.2, 200, 5000), E['launch'], 0.9); put(s_screech(1.2), E['launch'] + 1, 0.5)
for t in np.arange(E['launch'] + 1, E['dark'], 0.9): put(s_whoosh(0.5, 300, 3000), t, 0.4, rs.uniform(-.8, .8))
for t in [160.5, 165.2, 169.8]: put(s_clatter(0.8, 18, 1600), t, 0.6, rs.uniform(-.6, .6))
put(s_glass_break(), E['dark'], 0.9); put(s_powerdown(), E['dark'] + 0.2, 0.7)
put(s_click(), E['leggyOn'], 1.0); put(s_rumble(1.0) * 0.4, E['leggyOn'], 0.4)
for t in np.arange(E['tap'], E['score10'], 0.109): put(s_tap(), t, 0.55 if int(t * 9.17) % 4 else 0.85, np.sin(t * 3) * 0.5)
put(s_applause(10), E['tap'] + 10, 0.8); put(s_applause(6), E['score10'], 1.0)
for t in np.arange(E['score10'], E['score10'] + 2, 0.22): put(s_clack(), t, 0.7)
put(s_powerdown(2.0), E['botStop'], 0.8); put(s_pop(), E['botStop'] + 4.6, 0.8)
put(s_sparkle(), E['trophy'] + 1, 0.7); put(s_applause(5), E['trophy'] + 2.5, 0.8)
put(s_swish(), E['wig2'] + 0.6, 0.7); put(s_bonk(), E['wig2'] + 1.6, 0.5); put(s_applause(2) * 0.6, E['wig2'] + 2, 0.5)
put(s_applause(9), E['encore'], 0.6)
for t in np.arange(E['encore'] + 2, E['reboot'], 0.13): put(s_tap(), t, 0.35, -0.3)
put(s_servo(1.2), E['reboot'], 0.8); put(s_tick(), E['reboot'] + 0.8, 0.8); put(s_spinup(E['collapse'] - E['spin2']), E['spin2'], 0.8)
put(s_crack(), E['collapse'] - 2, 1.0); put(s_creak(2.0), E['collapse'] - 1.6, 0.8); put(s_thoom(), E['collapse'] + 1.2, 1.0); put(s_bonk(), E['collapse'] + 3.3, 1.0)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
