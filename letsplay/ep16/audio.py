"""Episode 16 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_plank(): d = 0.25; return mix(lp(noise(d), 900) * env_ad(int(SR * d), 0.001, 0.04) * 1.2, osc(sweep(260, 180, d), d, 'tri') * env_ad(int(SR * d), 0.001, 0.06) * 0.5)
def s_knock(): d = 0.18; return mix(bp(noise(d), 200, 1200), osc(140, d, 'sine') * 0.6) * env_ad(int(SR * d), 0.001, 0.03) * 0.9
def s_slime(d=1.2): return lp(noise(d), 500) * (0.5 + 0.5 * np.sin(2 * np.pi * 3 * T(d))) * np.sin(np.pi * T(d) / d) * 0.6
def s_stamp(): return mix(s_punch() * 0.8, s_ding() * 0.4)
def s_rain(d): return bp(noise(d), 2000, 8000) * np.minimum(1, T(d) / 1.0) * np.minimum(1, (d - T(d)) / 1.5) * 0.18
def s_thunder(d=3.0): return lp(noise(d), 220) * np.exp(-T(d) * 1.2) * 1.6
def s_splash(d=1.0): return mix(bp(noise(d), 300, 5000) * np.exp(-T(d) * 4), lp(noise(d), 300) * np.exp(-T(d) * 3)) * 0.8
def s_wind(d): return bp(noise(d), 300, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.4 * T(d))) * np.sin(np.pi * T(d) / d) * 0.5
def s_plip(): d = 0.2; return osc(sweep(1400, 700, d), d, 'sine') * env_ad(int(SR * d), 0.001, 0.04) * 0.6
def s_tension(d=1.4): return mix(osc(sweep(55, 52, d), d, 'saw') * 0.3, osc(sweep(58.3, 55, d), d, 'saw') * 0.3) * np.minimum(1, T(d) / 0.2) * 0.6
# ---- music: a calm pastoral theme that keeps getting interrupted by "tension" stingers that lead nowhere
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['gorge'], 100, 60, [C, F_, C, G_], seed=1001, gain=0.28, drums=1, wave='tri', swing=0.15)   # morning theme
track(E['gorge'], E['buildEnd'], 116, 62, [C, Am, F_, G_], seed=1002, gain=0.3, drums=1, wave='tri')
pad(E['support'], E['done'], [57, 60, 63], 0.18, 700, fade=0.4)
mput(s_fanfare(), E['done'], 0.5); track(E['done'] + 2, E['snail'], 112, 60, [C, F_, G_, C], seed=1003, gain=0.28, drums=1)
track(E['snail'], E['inspect'], 60, 55, [(0, 'm'), (5, 'm')], mode='min', seed=1004, gain=0.22, drums=1, wave='tri')   # snail crawl
pad(E['inspect'], E['approve'], [45, 46, 52], 0.2, 700, fade=0.5)
mput(s_fanfare(), E['approve'], 0.6); track(E['approve'] + 1.5, E['storm'], 120, 62, [C, F_, C, G_], seed=1005, gain=0.3, drums=1)
pad(E['storm'], E['storm'] + 6, [40, 43, 46], 0.3, 600, fade=0.3)
pad(E['storm'] + 6, E['rainbow'], [60, 64, 67], 0.16, 1200)
bells(E['rainbow'], E['fish'], 79, 'maj', 1.0, seed=1006, gain=0.2); pad(E['rainbow'], E['fish'], [60, 64, 67, 71], 0.18, 1500)
track(E['fish'] + 4, E['wind'], 108, 62, [C, Am, F_, G_], seed=1007, gain=0.26, drums=1, wave='tri')
pad(E['wind'], E['cross'], [45, 48, 52], 0.2, 800, fade=0.5)
track(E['cross'], E['picnic'], 126, 62, [C, F_, G_, C], seed=1008, gain=0.36, drums=2, lead=2, wave='tri', swing=0.3)   # Leggy's victory
track(E['picnic'], E['hours'], 92, 60, [C, Am, F_, G_], seed=1009, gain=0.22, drums=1, wave='tri', swing=0.2)
track(E['hoursEnd'], E['pebble'], 88, 60, [C, Em, F_, G_, Am, F_, C, G_], seed=1010, gain=0.26, drums=1, wave='tri', swing=0.15)   # calm sunset
bells(E['sunsetCalm'], E['pebble'], 84, 'maj', 0.7, seed=1011, gain=0.14); pad(E['sunsetCalm'], E['pebble'], [48, 55, 60, 64], 0.16, 1400)
track(E['pebble'] + 3.4, E['freeze'], 176, 57, [(0, 'm'), (8, 'M')], mode='min', seed=1012, gain=0.4, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=1013, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=1014, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_ding(), E['pay'] + 0.4, 0.7); put(s_stamp(), E['pay'] + 0.6, 0.8); put(s_bonk(), E['pay'] + 2.6, 0.6)
for t in np.arange(E['leggy'], E['leggy'] + 3, 0.15): put(s_step(), t, 0.25, rs.uniform(-.5, .5))
for t in np.arange(E['build'], E['buildEnd'], 2.15): put(s_plank(), t, 0.7, rs.uniform(-.4, .4))
for s in [E['cb1'], E['cb2'], E['cb3'], E['cb4'], E['storm'] + 3]: put(s_tension(), s, 0.6)
for t in [E['support'] + 1, E['support'] + 1.6, E['support'] + 2.2]: put(s_knock(), t, 0.8)
put(s_ding(), E['done'] + 0.2, 0.6); put(s_whoosh(0.8, 300, 2000), E['rock'] + 1.2, 0.5); put(s_boing(), E['rock'] + 2.6, 0.7)
put(s_creak(1.0) * 0.3, E['botTest'], 0.4)
for t in np.arange(E['snail'] + 2, E['inspect'], 2.5): put(s_slime(), t, 0.5)
for t in np.arange(E['inspect'] + 2, E['approve'] - 2, 1.5): put(s_knock(), t, 0.6, rs.uniform(-.3, .3))
put(s_stamp(), E['approve'], 1.0); put(s_sparkle(), E['approve'] + 0.4, 0.6)
put(s_thunder(), E['storm'] + 0.3, 1.0); put(s_thunder(2.0), E['storm'] + 6, 0.6); put(s_rain(E['rainbow'] - E['storm']), E['storm'], 0.9)
put(s_sparkle(), E['rainbow'] + 0.4, 0.5)
put(s_splash(), E['fish'] + 0.4, 0.9); put(s_blorp(0.6), E['fish'] + 1.4, 1.0); put(s_splash(), E['fish'] + 3.2, 0.9)
put(s_wind(E['cross'] - E['wind']), E['wind'], 0.9); put(s_creak(1.6), E['wind'] + 2, 0.4)
for t in np.arange(E['cross'], E['cross'] + 5, 0.12): put(s_click() * 0.3, t, 0.4, np.sin(t * 3) * 0.4)
put(s_fanfare(), E['cross'] + 5, 0.5)
for t in np.arange(E['cross'] + 6, E['cross'] + 12, 0.5): put(s_step(), t, 0.25)
put(s_pop(), E['picnic'] + 4, 0.6); put(s_ding(), E['sunsetCalm'] + 10, 0.5)
put(s_plank() * 0.4, E['pebble'] - 0.5, 0.4); put(s_whoosh(3.0, 200, 1200) * 0.4, E['pebble'], 0.4); put(s_plip(), E['pebble'] + 3.2, 0.9)
put(s_screech(1.8), E['pebble'] + 3.4, 0.7)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
