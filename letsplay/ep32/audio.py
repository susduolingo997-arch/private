"""Episode 32 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_sizzle32(d=2.0): n = int(SR * d); return bp(noise(d), 3000, 9000)[:n] * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 7 * T(d)[:n]))) * env_ad(n, 0.2, d * 0.7) * 0.35
def s_spin32(d=1.4): n = int(SR * d); return bp(noise(d), 500, 2500)[:n] * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * T(d)[:n])) * env_ad(n, 0.1, d * 0.8) * 0.6
def s_splat32(): d = 0.5; n = int(SR * d); return mix(lp(noise(d), 700)[:n] * env_ad(n, 0.002, 0.25) * 1.2, osc(sweep(220, 60, d), d)[:n] * env_ad(n, 0.002, 0.2) * 0.6)
def s_gavel32(): d = 0.4; n = int(SR * d); return mix(bp(noise(d), 300, 2500)[:n] * env_ad(n, 0.001, 0.08) * 1.2, osc(180, d)[:n] * env_ad(n, 0.001, 0.15) * 0.6)
def s_chitter32(d=0.7):
    n = int(SR * d); out = np.zeros(n)
    for s0 in np.arange(0, d - 0.08, 0.09): i = int(s0 * SR); c = osc(sweep(1800, 2600, 0.06), 0.06, 'tri')[:int(SR * 0.06)] * env_ad(int(SR * 0.06), 0.003, 0.05); out[i:i + len(c)] += c[:max(0, n - i)] * 0.4
    return out
def s_turbo32(d=4.0): n = int(SR * d); f = sweep(80, 900, d)[:n]; return mix(osc(f, d, 'saw')[:n] * 0.25, bp(noise(d), 800, 5000)[:n] * 0.3) * env_ad(n, 0.4, d * 0.9)
def s_gulp32(): d = 0.6; n = int(SR * d); return osc(sweep(400, 90, d), d)[:n] * env_ad(n, 0.01, 0.4) * 0.8
def s_kettle32(d=6.0): n = int(SR * d); f = 2200 + 150 * np.sin(2 * np.pi * 5 * T(d)[:n]); ph = 2 * np.pi * np.cumsum(f) / SR; return (np.sin(ph) * 0.18 + bp(noise(d), 2000, 3000)[:n] * 0.2) * env_ad(n, 1.5, d * 0.95)
def s_fire32(d=4.0): n = int(SR * d); return mix(lp(noise(d), 600)[:n] * 1.3, bp(noise(d), 1200, 6000)[:n] * 0.4, osc(sweep(120, 50, d), d)[:n] * 0.5) * env_ad(n, 0.02, d * 0.8)
def s_coin32(): d = 0.35; n = int(SR * d); return mix(osc(1975, d)[:n] * env_ad(n, 0.001, 0.25) * 0.3, osc(2637, d)[:n] * env_ad(n, 0.001, 0.2) * 0.2)
def s_skid32(d=1.4): n = int(SR * d); return bp(noise(d), 900, 4000)[:n] * env_ad(n, 0.02, d * 0.8) * 0.8
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['pzGo'], 138, 62, [C, F_, G_, C], seed=3201, gain=0.24, drums=1, wave='tri', swing=0.33)   # pizzeria tarantella-ish
track(E['pzGo'], E['pzSlice1'], 128, 64, [C, G_, F_, C], seed=3202, gain=0.24, drums=1, wave='square')   # the Long Road
pad(E['pzSlice1'] + 1.5, E['pzBridge'], [57, 60, 64], 0.14, 900, fade=0.5)
track(E['pzBridge'], E['pzSlice2'], 140, 62, [F_, C, G_, C], seed=3203, gain=0.24, drums=2, wave='square')
pad(E['pzSlice2'] + 1, E['pzTrial'], [45, 52, 55], 0.15, 600, fade=0.4)
track(E['pzTrial'], E['pzStake'], 96, 57, [Am, Dm, Em, Am], mode='min', seed=3204, gain=0.2, drums=1, wave='tri')   # courtroom
pad(E['pzStake'], E['pzReveal'] + 1, [45, 48, 52], 0.13, 500, fade=1.0); pulse(E['pzStake'] + 3, E['pzReveal'] + 1, 70, 0.4)   # stakeout tension
track(E['pzChase'], E['pzDen'], 172, 60, [C, F_, G_, C], seed=3205, gain=0.28, drums=2, wave='square', swing=0.2)   # chase
pad(E['pzDen'], E['pzClock'], [60, 64, 67, 71], 0.13, 1400, fade=0.8); bells(E['pzDen'], E['pzClock'], 84, 'maj', 1.0, seed=3206, gain=0.1)   # the kits
track(E['pzClock'], E['pzTurbo'], 150, 57, [Am, F_, G_, Am], mode='min', seed=3207, gain=0.24, drums=2, wave='saw')
track(E['pzTurbo'] + 3, E['pzEnd'], 184, 62, [C, G_, Am, F_], seed=3208, gain=0.3, drums=2, wave='square')   # TURBO
pad(E['pzEnd'] + 2, E['pzWho'], [50, 53, 57], 0.13, 700, fade=0.6)   # night at the cave
bells(E['pzWho'] + 2, E['pzPay'], 76, 'maj', 0.9, seed=3209, gain=0.1); pad(E['pzHers'], E['pzPay'], [57, 61, 64, 68], 0.12, 1200, fade=0.8)
track(E['pzPay'] + 3, E['pzChef2'], 112, 64, [F_, C, G_, C], seed=3210, gain=0.22, drums=1, wave='tri')   # Bloop got paid
track(E['pzChef2'], E['pzDinner'], 138, 62, [C, F_, G_, C], seed=3201, gain=0.2, drums=1, wave='tri', swing=0.33)   # chef reprise
pad(E['pzDinner'], E['pzGulp'], [60, 64, 67, 72], 0.12, 1500, fade=1.0)   # candlelit dinner
pad(E['pzSpicy'], E['pzSteam'], [40, 43, 46], 0.16, 400, fade=0.3)
track(E['pzSteam'], E['pzBlast'], 176, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=3211, gain=0.32, drums=2, wave='saw')
pad(E['pzBlast'] + 1, E['freeze'], [55, 59, 62, 67], 0.13, 1200, fade=0.6)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=3217, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=3218, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(0.5, 7, 0.42): put(s_step(), t, 0.2, rs.uniform(-.3, .3))
put(s_whoosh(0.6, 300, 3000), E['pzChef'] + 0.3, 0.5); put(s_ding(), E['pzChef'] + 1.3, 0.5)
put(s_spin32(), E['pzToss'] + 0.2, 0.7); put(s_splat32(), E['pzToss'] + 3.2, 0.9)
put(s_sizzle32(3.0), E['pzOven'] + 0.6, 0.6); put(s_drip(), E['pzOven'] + 2.8, 0.4); put(s_drip(), E['pzOven'] + 4.0, 0.4); put(s_chitter32(), E['pzOven'] + 6.5, 0.5, 0.6)
put(s_sparkle(), E['pzBox'] + 0.5, 0.7); put(s_creak(0.8), E['pzBox'] + 1.0, 0.4); put(s_whoosh(0.6, 300, 3000), E['pzBox'] + 3.4, 0.5); put(s_thock(), E['pzBox'] + 5.6, 0.6)
put(s_ding(), E['pzGo'] + 2.2, 0.5)
for t in np.arange(E['pzRoad'], E['pzSlice1'], 0.32): put(s_thock(), t, 0.12, rs.uniform(-.5, .5))
put(s_wah(), E['pzSmell'] + 3.0, 0.3)
put(s_creak(0.6), E['pzSlice1'] + 1.2, 0.5); put(s_sting(), E['pzSlice1'] + 2.4, 0.6)
for i in range(4): put(s_click(), E['pzBridge'] + 2 + i * 0.7, 0.6, rs.uniform(-.4, .4))
put(s_whoosh(1.2, 300, 3000), E['pzJump'] + 1.4, 0.6); put(s_splat32(), E['pzJump'] + 3.6, 0.8)
put(s_creak(0.6), E['pzSlice2'] + 0.6, 0.5); put(s_sting(), E['pzSlice2'] + 1.2, 0.6)
put(s_gavel32(), E['pzTrial'] + 3.9, 0.9); put(s_gavel32(), E['pzTrial'] + 4.2, 0.9); put(s_boing(0.5), E['pzTrial'] + 3.6, 0.4)
put(s_creak(1.0), E['pzReveal'] + 0.4, 0.7); put(s_chitter32(), E['pzReveal'] + 1.4, 0.8); put(s_sting(), E['pzReveal'] + 2.6, 0.5); put(s_heart(), E['pzReveal'] + 6.4, 0.6)
for t in np.arange(E['pzChase'], E['pzChase'] + 7, 0.22): put(s_step(), t, 0.25, rs.uniform(-.5, .5))
put(s_bonk(), E['pzChase'] + 3.6, 1.0); put(s_chitter32(), E['pzChase'] + 5, 0.4)
put(s_sparkle(), E['pzDen'] + 1, 0.5); put(s_chitter32(1.2), E['pzDen'] + 1.6, 0.4, -0.3); put(s_chitter32(0.5), E['pzOffer'] + 2.2, 0.5)
put(s_wah(), E['pzOffer'] + 5.2, 0.3); put(s_heart(), E['pzOffer'] + 7.5, 0.5)
put(s_tick(), E['pzClock'] + 0.2, 0.6); put(s_tick(), E['pzClock'] + 0.9, 0.6); put(s_sting(), E['pzClock'] + 0.4, 0.5)
put(s_click(), E['pzTurbo'] + 0.8, 1.0); put(s_turbo32(4.0), E['pzTurbo'] + 1.0, 0.9); put(s_whoosh(1.5, 300, 6000), E['pzTurbo'] + 3, 0.8)
put(s_whoosh(1.2, 300, 6000), E['pzZoom'] + 7.6, 0.9); put(s_skid32(), E['pzEnd'] + 0.2, 0.9)
for i in range(3): put(s_thock(), E['pzKnock'] + 0.3 + i * 0.35, 0.8)
for i in range(4): put(s_tick(), E['pzKnock'] + 1 + i, 0.5)
put(s_sting(), E['pzKnock'] + 5, 0.5); put(s_sting(), E['pzWho'] + 3.2, 0.4)
put(s_rumble(2.0), E['pzHers'] + 1.5, 0.6); put(s_sparkle(), E['pzHers'] + 3, 0.5)
put(s_swish(), E['pzPay'] + 1.2, 0.6); put(s_sparkle(), E['pzPay'] + 2.6, 0.7); put(s_fanfare(), E['pzPay'] + 3.4, 0.4)
for t in np.arange(E['pzChef2'], E['pzChef2'] + 3.4, 0.2): put(s_step(), t, 0.3, 0.4)
put(s_tick(), E['pzChef2'] + 4.2, 0.6); put(s_sting(), E['pzFree'] + 0.4, 0.4)
for i in range(6): put(s_coin32(), E['pzFree'] + 2.0 + i * 0.3, 0.7, rs.uniform(-.3, .3))
put(s_sizzle32(3.0), E['pzDinner'] + 0.8, 0.4)
put(s_gulp32(), E['pzGulp'] + 0.6, 1.0); put(s_gulp32(), E['pzGulp'] + 3.0, 1.0)
put(s_sizzle32(5.0), E['pzSpicy'] + 3, 0.6); put(s_kettle32(E['pzBlast'] - E['pzSpicy'] - 3), E['pzSpicy'] + 3, 0.7)
for t in np.arange(E['pzSteam'], E['pzBlast'], 0.18): put(s_thock(), t, 0.2, rs.uniform(-.6, .6))
put(s_crack(), E['pzSteam'] + 3.6, 0.6); put(s_whoosh(0.8, 300, 3000), E['pzBlast'] - 1.2, 0.5)
put(s_fire32(5.0), E['pzBlast'], 1.0); put(s_boom(2.4, 0.8), E['pzBlast'], 0.8)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
