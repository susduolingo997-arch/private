"""Episode 13 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def s_horn_air(d=1.2): return mix(osc(mtof(64), d, 'saw') * 0.5, osc(mtof(68), d, 'saw') * 0.4) * env_ad(int(SR * d), 0.02, d / 2) * 0.35
def s_beep(f=900, d=0.3): return osc(f, d, 'square') * env_ad(int(SR * d), 0.002, d / 2) * 0.3
def s_roll(d): return lp(noise(d), 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 4 * T(d))) * 0.8
def s_engine(d): return mix(bp(noise(d), 200, 1500) * 0.4, osc(110, d, 'saw') * 0.15) * np.minimum(1, T(d) / 0.4)
def s_honk(): d = 0.35; return osc(sweep(330, 260, d), d, 'saw') * env_ad(int(SR * d), 0.01, 0.12) * 0.5
def s_shutter(): return mix(s_click(), np.pad(s_click(), (int(SR * 0.08), 0)))
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['count'], 120, 62, [C, G_, Am, F_], seed=701, gain=0.36, drums=2)
pulse(E['count'], E['go'], 100, 0.6)
track(E['go'], E['canyon'], 168, 60, [C, G_, F_, C], seed=702, gain=0.46, drums=2, lead=2, wave='saw')   # race theme
track(E['canyon'], E['pebbles'], 160, 57, [(0, 'm'), (5, 'm'), (3, 'M'), (7, 'M')], mode='min', seed=703, gain=0.44, drums=2, lead=2, wave='saw')
track(E['pebbles'], E['baby'], 88, 57, [(0, 'm'), (5, 'm')], mode='min', seed=704, gain=0.28, drums=1, wave='tri', swing=0.3)
pad(E['baby'], E['conveyor'], [60, 64, 67], 0.2, 1300); bells(E['baby'], E['conveyor'], 72, 'maj', 1.0, seed=705, gain=0.2)
mput(s_fanfare(), E['conveyor'], 0.7); track(E['conveyor'] + 0.8, E['final'], 172, 60, [C, G_, Am, F_], seed=706, gain=0.46, drums=2, lead=2)
track(E['final'], E['finish'], 184, 62, [C, F_, G_, C], seed=707, gain=0.5, drums=2, lead=2, wave='saw', bassw='square')
pad(E['finish'], E['photo'], [45, 46, 52], 0.3, 1000, fade=0.3); pulse(E['photo'], E['photoEnd'] - 6, 110, 0.5)
mput(s_fanfare(), E['photoEnd'] - 5.8, 0.8); track(E['photoEnd'], E['fans'], 132, 62, [C, G_, Am, F_], seed=708, gain=0.4, drums=2)
track(E['fans'], E['freeze'], 104, 62, [C, Am, F_, G_], seed=709, gain=0.32, drums=1, wave='tri', swing=0.2)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=710, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=711, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_horn_air(), E['announce'], 0.7)
for t in np.arange(E['kart'] + 0.4, E['kartEnd'] - 1, 0.5): put(s_thock(), t, 0.4, rs.uniform(-.4, .4))
put(s_honk(), 45.8, 0.9); put(s_honk(), 46.6, 0.8)
for k in range(3): put(s_beep(800), E['count'] + 0.2 + k * 1.1, 0.8)
put(s_beep(1400, 0.6), E['go'], 0.9); put(s_horn_air(1.6), E['go'], 0.6)
put(s_engine(E['finish'] - E['go']), E['go'], 0.35)
for t in np.arange(E['go'], E['finish'], 0.18): put(s_step(), t, 0.25, rs.uniform(-.4, .4))
put(s_boing(), E['wheel'], 0.6); for_ = [put(s_thock(), E['wheel'] + 5 + k * 0.5, 0.5) for k in range(5)]
put(s_whoosh(1.0, 300, 4000), E['boost'], 0.9); put(s_boom(1.2, 0.5), E['boost'] + 0.1, 0.7); put(s_punch(), E['crash'], 0.9)
put(s_roll(E['conveyor'] - E['pebbles']), E['pebbles'], 0.6); put(s_bonk(), E['barge'] + 0.3, 0.9); put(s_bonk(), 134.6, 0.8)
put(s_roll(E['exit'] - E['conveyor']) * 1.3, E['conveyor'], 0.8)
put(s_engine(E['final'] - E['motor']) * 1.4, E['motor'], 0.6)
put(s_boom(1.6, 0.7), E['finish'], 1.1); put(s_clatter(1.6, 30, 2500), E['finish'] + 0.4, 0.8)
put(s_shutter(), E['photo'], 1.0); put(s_drumroll(1.6), E['photoEnd'] - 7.6, 0.8)
put(s_honk(), 235.0, 0.9); put(s_honk(), 236.0, 0.9); put(s_roll(4.0), E['fans'], 0.5)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
