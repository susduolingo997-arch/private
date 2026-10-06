"""Episode 21 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_snap(): d = 0.9; return mix(bp(noise(d), 300, 4000) * env_ad(int(SR * d), 0.001, 0.15) * 1.2, osc(sweep(220, 60, d), d, 'saw') * env_ad(int(SR * d), 0.002, 0.3) * 0.5)
def s_fwump(): d = 0.35; return mix(lp(noise(d), 500) * 1.4, osc(sweep(140, 60, d), d) * 0.6) * env_ad(int(SR * d), 0.004, 0.12)
def s_whirr(d=3.4): return osc(sweep(300, 900, d), d, 'square') * 0.08 * (0.5 + 0.5 * np.sin(2 * np.pi * 26 * T(d))) * np.minimum(1, T(d) / 0.3) * np.minimum(1, (d - T(d)) / 0.3)
def s_mega(): d = 1.2; return bp(osc(220 + 40 * np.sin(2 * np.pi * 5 * T(d)), d, 'saw'), 600, 2400) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 7 * T(d)))) * env_ad(int(SR * d), 0.01, 0.9) * 0.5
def s_crowd(d=3.0): return bp(noise(d), 400, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * T(d))) * np.sin(np.pi * T(d) / d) * 0.5
def s_stomp(): d = 0.3; return osc(sweep(90, 40, d), d) * env_ad(int(SR * d), 0.002, 0.12) * 1.1
def s_purr2(d=5.0): return lp(noise(d), 260) * (0.5 + 0.5 * np.sin(2 * np.pi * 24 * T(d))) * np.sin(np.pi * T(d) / d) * 1.3
def s_rip(): d = 0.6; return bp(noise(d), 1500, 8000) * (0.4 + 0.6 * (np.sin(2 * np.pi * 40 * T(d)) > 0)) * env_ad(int(SR * d), 0.01, 0.4) * 0.8
def s_squeak(): d = 0.35; return osc(sweep(1800, 2600, d) + 80 * np.sin(2 * np.pi * 30 * T(d)), d, 'sine') * env_ad(int(SR * d), 0.01, 0.2) * 0.6
def s_quack(): d = 0.22; return bp(osc(sweep(900, 600, d), d, 'saw'), 500, 2500) * env_ad(int(SR * d), 0.005, 0.1) * 0.9
def s_zwoop(d=1.4): return mix(osc(sweep(200, 2400, d), d, 'saw') * 0.25, bp(noise(d), 800, 6000) * 0.2) * np.sin(np.pi * T(d) / d) ** 0.5 * 0.8
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['snap'], 112, 60, [C, Am, F_, G_], seed=2101, gain=0.26, drums=1, wave='tri', swing=0.2)   # couch theme
pad(E['snap'] + 1, E['flyer'], [57, 60, 64], 0.18, 800, fade=0.3)
track(E['flyer'], E['depart'], 124, 62, [C, F_, G_, C], seed=2102, gain=0.28, drums=1, wave='square')
track(E['depart'], E['arrive'], 150, 62, [C, G_, F_, G_], seed=2103, gain=0.32, drums=2, wave='square', swing=0.1)   # wagon gallop
track(E['arrive'], E['leg1'], 108, 67, [C, Em, F_, G_], seed=2104, gain=0.28, drums=1, lead=2, wave='tri', swing=0.35)   # Comfy Fair carousel theme
track(E['leg1'], E['win'], 160, 62, [(0, 'M'), (5, 'M'), (7, 'M'), (5, 'M')], seed=2105, gain=0.34, drums=2, wave='square')   # relay
mput(s_fanfare(), E['win'], 0.8); track(E['pets'], E['prize'], 100, 67, [C, F_, C, G_], seed=2106, gain=0.24, drums=1, wave='tri', swing=0.3)
bells(E['prize'], E['blink'], 72, 'maj', 1.6, seed=2107, gain=0.16)
pad(E['blink'], E['bolt'], [52, 55, 58], 0.22, 700, fade=0.3)
track(E['bolt'], E['chaseEnd'], 172, 57, [(0, 'm'), (5, 'm'), (7, 'M'), (0, 'm')], mode='min', seed=2108, gain=0.36, drums=2, wave='saw')   # sofa chase
pad(E['chaseEnd'], E['purr'], [57, 60, 64], 0.16, 600, fade=0.5)
track(E['purr'], E['board'], 84, 60, [C, Am, F_, G_], seed=2109, gain=0.24, drums=1, wave='tri')
track(E['board'], E['home'] + 6, 132, 60, [C, F_, G_, C], seed=2110, gain=0.3, drums=2, wave='square')
track(E['home'] + 6, E['bye'], 76, 60, [C, Am, F_, G_], seed=2111, gain=0.24, drums=1, wave='tri')   # sunset on the sofa
track(E['bye'], E['squeak'], 90, 65, [(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')], seed=2112, gain=0.22, drums=1, wave='tri')
track(E['excited'], E['freeze'], 168, 60, [C, F_, G_, C], seed=2113, gain=0.36, drums=2, wave='square')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2114, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2115, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_creak(2.4), E['squeeze'] + 2.4, 0.7); put(s_snap(), E['snap'], 1.0); put(s_clatter(1.6, 20, 1500), E['snap'] + 0.2, 0.7)
put(s_whoosh(0.8, 300, 3000), E['flyer'], 0.6); put(s_chirp(), E['flyer'] + 1.8, 0.6); put(s_click(), E['invoice'] + 1.2, 0.6)
for t in np.arange(E['wagon'], E['wagonEnd'], 0.42): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
put(s_ding(), E['wagonEnd'], 0.6)
for t in np.arange(E['depart'], E['arrive'], 0.19): put(s_step(), t, 0.25, rs.uniform(-.5, .5))
put(s_bonk(), E['arrive'] - 0.4, 0.8); put(s_crowd(3), E['arrive'], 0.5); put(s_mega(), E['duke'] + 0.4, 0.8); put(s_mega(), E['rules'] + 0.2, 0.6)
put(s_ding(), E['leg1'] + 0.3, 0.7); [put(s_fwump(), E['leg1'] + 1.2 + i * 1.3, 0.8, rs.uniform(-.4, .4)) for i in range(5)]
put(s_whirr(E['bonk'] - E['prop']), E['prop'], 0.8); put(s_fwump(), E['bonk'], 1.0); put(s_crowd(3), E['bonk'] + 0.3, 0.6)
for t in [E['leg2'] + 1.2, E['leg2'] + 2.4, E['leg2'] + 3.6, E['bounce'], E['bounce'] + 1.2]: put(s_boing(), t, 0.8)
put(s_fwump(), E['tent'], 0.9); put(s_whoosh(1.8, 200, 1500), E['tent'] + 0.3, 0.5); put(s_creak(1.6), E['leg3'] + 1, 0.5)
for t in np.arange(E['joinIn'] + 1.4, E['win'], 0.22): put(s_step(), t, 0.3, rs.uniform(-.5, .5))
put(s_crowd(4), E['win'], 0.8); put(s_sparkle(), E['ribbon'], 0.8); [put(s_quack(), E['ribbon'] - 4 + i * 0.6, 0.5, rs.uniform(-.6, .6)) for i in range(5)]
put(s_drumroll(1.6), E['unveil'] - 1.6, 0.7); put(s_rip(), E['unveil'], 0.6); put(s_sparkle(), E['unveil'] + 0.2, 0.7); put(s_crowd(3), E['unveil'] + 0.3, 0.6)
put(s_blorp(0.6), E['blink'], 0.7); put(s_sting(), E['alive'], 0.8); put(s_growl(1.4, 60), E['alive'] + 0.8, 0.6)
put(s_squeak(), E['bolt'] + 0.8, 0.4); put(s_fwump(), E['bolt'] + 0.8, 0.9)
for t in np.arange(E['bolt'] + 1.4, E['chaseEnd'], 0.26): put(s_stomp(), t, 0.6, rs.uniform(-.5, .5))
put(s_boing(), E['bolt'] + 4, 0.9); put(s_boing(1.0), E['bolt'] + 5.4, 0.7)
put(s_quack(), E['leggyCalm'] + 3, 0.7); put(s_purr2(E['named'] - E['purr']), E['purr'], 0.9); put(s_mega(), E['named'] + 0.4, 0.6)
put(s_fwump(), E['bloopSit'] + 1.6, 0.7); put(s_heart(), E['bloopSit'] + 2.4, 0.6); put(s_rip(), E['rip'], 1.0)
for t in np.arange(E['board'] + 1.4, E['home'] + 5, 0.3): put(s_stomp(), t, 0.4, rs.uniform(-.4, .4))
put(s_fwump(), E['home'] + 6, 0.9); put(s_sparkle(), E['sitAll'], 0.7)
put(s_zwoop(), E['hum'], 0.5); put(s_squeak(), E['squeak'], 1.0); put(s_boing(), E['excited'], 0.8); put(s_boing(), E['excited'] + 1, 0.8)
for t in np.arange(E['laps'], E['lapsEnd'] + 2, 0.24): put(s_stomp(), t, 0.5, rs.uniform(-.6, .6))
put(s_boing(1.2), E['leap'], 1.0); put(s_zwoop(), E['leap'] + 3.2, 0.9)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
