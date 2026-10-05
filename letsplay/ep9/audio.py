"""Episode 9 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
def splash(d=1.2): return bp(noise(d), 300, 4000) * env_ad(int(SR * d), 0.005, d / 4)
def s_hover(d): return (osc(sweep(180, 260, d), d, 'saw') * 0.3 + bp(noise(d), 800, 3000) * 0.3) * np.minimum(1, T(d) / 0.5) * np.minimum(1, (d - T(d)) / 0.5)
def s_glam(): return sum(s_bell(mtof(m), 0.9, 0.3) for m in (84, 88, 91, 96)) * 0.5
def s_rocket(d=1.4): return bp(noise(d), 1500, 8000) * np.linspace(0.2, 1, int(SR * d)) * 0.5 + osc(sweep(400, 1800, d), d) * 0.15
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def s_pop_fw(): return mix(s_boom(1.2, 0.3), s_sparkle() * 0.8)
def s_crowd(d): return bp(noise(d), 300, 2500) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * T(d))) * 0.25
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['arrive'], 112, 62, [C, G_, Am, F_], seed=301, gain=0.34, drums=1, wave='tri')
track(E['arrive'] + 2, E['challenge'], 122, 65, [(0, 'M'), (4, 'm'), (5, 'M'), (7, 'M')], seed=302, gain=0.38, drums=2, wave='saw', swing=0.2)  # Prestin's glam theme
mput(s_drumroll(1.6), E['challenge'] - 1.6, 0.8)
track(E['challenge'] + 0.2, E['fall'], 140, 60, [C, G_, F_, C], seed=303, gain=0.4, drums=2, lead=2)
track(E['fall'] + 0.5, E['job'], 132, 62, [C, Am, F_, G_], seed=304, gain=0.36, drums=2)
track(E['job'], E['alone'], 100, 65, [(0, 'M'), (4, 'm'), (5, 'M'), (7, 'M')], seed=305, gain=0.32, drums=1, wave='saw', swing=0.25)
pad(E['alone'], E['night'], [57, 60, 64], 0.25, 900); bells(E['alone'] + 1, E['night'] - 1, 57, 'min', 1.6, seed=306, gain=0.16)
track(E['night'], E['sneak'], 124, 50, [(0, 'm'), (5, 'm'), (3, 'M'), (7, 'M')], mode='min', seed=307, gain=0.42, drums=2, wave='square')  # party
track(E['sneak'], E['fake'], 84, 57, [(0, 'm'), (1, 'M')], mode='min', seed=308, gain=0.26, drums=0, wave='tri', swing=0.3)  # sneaky
mput(s_sting(), E['fake'], 0.9); pad(E['fake'] + 1, E['team'], [45, 48, 52], 0.28, 800)
track(E['team'], E['teamEnd'], 156, 60, [C, G_, Am, F_], seed=309, gain=0.46, drums=2, lead=2)
mput(s_fanfare(), E['teamEnd'], 0.6); track(E['tour'] + 0.5, E['hit'], 118, 65, [(0, 'M'), (4, 'm'), (5, 'M'), (7, 'M')], seed=310, gain=0.36, drums=1, wave='saw')
pad(E['hit'], E['flat'], [44, 45, 51], 0.4, 1100, fade=0.3)
track(E['flat'] + 1, E['dawn'], 128, 62, [C, F_, G_, C], seed=311, gain=0.42, drums=2)
track(E['dawn'] + 0.5, E['freeze'], 96, 62, [C, Am, F_, G_], seed=312, gain=0.3, drums=1, wave='tri', swing=0.2)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=313, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=314, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_hover(3.4), E['arrive'], 0.8); put(s_glam(), E['flawless'], 0.7); put(s_glam(), 194.2, 0.6); put(s_glam(), E['hairflip'] + 5.2, 0.6)
for t in np.arange(E['build'] + 0.3, E['buildEnd'], 0.2): put(s_sparkle() * 0.4, t, 0.3, rs.uniform(-.5, .5))
for t in np.arange(E['hbuild'] + 0.5, E['hbuildEnd'], 0.75): put(s_thock(), t, 0.6)
put(s_creak(2.0), 48.5, 0.6); put(s_creak(2.0), 53.5, 0.7); put(s_clatter(1.4, 20, 2500), E['fall'], 0.9); put(s_boom(1.0, 0.4), E['fall'] + 0.3, 0.6)
put(s_whoosh(1.2, 300, 3000), E['flip'], 0.8); put(splash(2.0), E['splash'], 1.2)
put(s_sizzle := bp(noise(2.5), 3000, 11000) * env_ad(int(SR * 2.5), 0.02, 1.2) * 0.5, E['burn'], 0.8)
put(s_ding(), E['coins'], 0.7); put(s_clatter(0.6, 8, 5000), E['coins'] + 0.1, 0.5)
put(splash(0.8), E['leggyGo'] + 3.4, 0.6)
put(s_crowd(E['sneak'] - E['night']), E['night'], 0.5); put(s_crowd(E['hit'] - E['tour']), E['tour'], 0.4)
for t in np.arange(E['sneak'], E['peek'], 0.6): put(s_step(), t, 0.3)
put(s_scratch(), E['fake'] - 0.1, 0.8)
for t in np.arange(E['team'] + 1, E['teamEnd'] - 1, 0.35): put(s_thock(), t, 0.45, rs.uniform(-.5, .5))
for k in range(3): put(s_rocket(1.0), E['fireworks'] - 0.7 + k * 1.3, 0.6); put(s_pop_fw(), E['fireworks'] + 0.3 + k * 1.3, 0.7, (k - 1) * 0.5)
put(s_rocket(0.8), E['hit'] - 0.8, 0.7); put(s_bonk(), E['hit'], 0.9); put(s_creak(3.0), E['topple'] + 0.5, 0.8)
put(s_boom(2.4, 0.9), E['flat'], 1.2); put(s_clatter(1.6, 30, 2500), E['flat'] + 0.1, 0.8)
put(s_whoosh(1.0, 400, 5000), E['wigOff'], 0.7); put(s_boing(), E['wigOff'] + 1.5, 0.6)
for k in range(8): put(s_sparkle(), E['viral'] + k * 0.7, 0.5, rs.uniform(-.6, .6))
put(s_punch(), E['shake'] + 0.3, 0.5); put(s_ding(), E['pay'] + 1.5, 0.6)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
