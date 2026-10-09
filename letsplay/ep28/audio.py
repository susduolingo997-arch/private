"""Episode 28 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_eggwobble(): d = 0.5; n = int(SR * d); return osc(180 + 40 * np.sin(2 * np.pi * 14 * T(d)), d, 'tri')[:n] * env_ad(n, 0.01, 0.4) * 0.35
def s_tik(): d = 0.08; n = int(SR * d); return bp(noise(d), 2500, 7000)[:n] * env_ad(n, 0.001, 0.03) * 1.2
def s_hatch(): d = 0.6; n = int(SR * d); return mix(bp(noise(d), 1500, 8000)[:n] * env_ad(n, 0.001, 0.15) * 1.4, s_clatter(0.6, 14, 3000) * 0.6, osc(sweep(300, 900, 0.3), 0.3) * env_ad(int(SR * 0.3), 0.01, 0.2) * 0.3)
def s_peep(): d = 0.22; n = int(SR * d); return osc(sweep(1400, 2400, d), d)[:n] * env_ad(n, 0.005, 0.15) * 0.3
def s_hic(): d = 0.5; n = int(SR * d); return mix(osc(sweep(900, 500, 0.08), 0.08) * 0.3, np.concatenate([np.zeros(int(SR * 0.06)), lp(noise(d - 0.06), 1800)[:n - int(SR * 0.06)] * env_ad(n - int(SR * 0.06), 0.005, 0.3) * 1.3]))
def s_flame(d): n = int(SR * d); return lp(noise(d), 1200)[:n] * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * T(d))[:n]) * env_ad(n, 0.05, d * 0.7) * 1.4
def s_roar(d=2.4): n = int(SR * d); return mix(s_growl(d, 55) * 1.2, lp(noise(d), 600)[:n] * env_ad(n, 0.1, d * 0.8) * 0.8, osc(sweep(110, 70, d), d, 'saw')[:n] * env_ad(n, 0.1, d * 0.8) * 0.25)
def s_wingflap(): d = 0.35; n = int(SR * d); return lp(noise(d), 500)[:n] * env_ad(n, 0.02, 0.2) * 1.4
def s_purr(d=2.5): n = int(SR * d); return lp(noise(d), 220)[:n] * (0.5 + 0.5 * np.sin(2 * np.pi * 22 * T(d))[:n]) * 0.9
def s_clonk(): d = 0.35; n = int(SR * d); return mix(osc(420, d, 'tri')[:n] * env_ad(n, 0.001, 0.12) * 0.5, lp(noise(d), 900)[:n] * env_ad(n, 0.001, 0.05) * 0.6)
def s_lamphum(d): return osc(120, d, 'saw') * 0.05 + osc(240, d) * 0.03
def s_coin28(): return mix(s_bell(1568, 0.6, 0.4), np.concatenate([np.zeros(int(SR * 0.09)), s_bell(2093, 0.8, 0.4)]))
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['dgCart'], 104, 62, [C, Am, F_, G_], seed=2801, gain=0.22, drums=1, wave='tri', swing=0.25)   # meadow stroll
track(E['dgCart'], E['dgBump'], 124, 64, [C, F_, G_, C], seed=2802, gain=0.27, drums=2, lead=2, wave='square')   # quest theme
track(E['dgBump'], E['dgCatch'] + 1, 168, 60, [Am, F_, G_, Am], mode='min', seed=2803, gain=0.32, drums=2, wave='saw')   # egg chase
track(E['dgCatch'] + 1, E['dgFire'], 100, 62, [C, G_, Am, F_], seed=2804, gain=0.22, drums=1, wave='tri')
track(E['dgFire'] + 2, E['dgCinder'], 118, 64, [C, F_, C, G_], seed=2805, gain=0.24, drums=1, wave='square')
track(E['dgCinder'], E['dgWobble'], 92, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2806, gain=0.24, drums=1, wave='saw', swing=0.2)   # cinder trail
pad(E['dgWobble'], E['dgHatch'], [57, 60, 64], 0.14, 700, fade=0.5)
mput(s_fanfare(), E['dgHatch'] + 0.3, 0.5); bells(E['dgHatch'] + 1, E['dgHic'], 76, 'maj', 1.0, seed=2807, gain=0.14)
track(E['dgHic'], E['dgLesson'], 130, 62, [C, Am, Dm, G_], seed=2808, gain=0.24, drums=2, wave='tri')   # Pip theme
track(E['dgLesson'], E['dgNight'], 140, 64, [F_, G_, C, Am], seed=2809, gain=0.26, drums=2, lead=2, wave='square')
pad(E['dgNight'], E['dgShadow'], [45, 52, 55], 0.14, 500, fade=1.0); bells(E['dgNest'], E['dgShadow'], 64, 'min', 0.8, seed=2810, gain=0.1)
pad(E['dgShadow'], E['dgChase'], [40, 47, 51], 0.18, 400, fade=0.5)
track(E['dgChase'], E['dgCorner'], 172, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2811, gain=0.36, drums=2, wave='saw')   # dragon chase
pad(E['dgCorner'], E['dgFly'], [45, 48, 52], 0.16, 600, fade=0.5)
track(E['dgFly'], E['dgReunite'], 96, 64, [F_, C, G_, C], seed=2812, gain=0.22, drums=0, wave='tri')
pad(E['dgReunite'], E['dgPay'], [60, 64, 67, 71], 0.18, 1500, fade=0.6); bells(E['dgReunite'], E['dgPay'], 76, 'maj', 1.2, seed=2813, gain=0.15)
track(E['dgPay'], E['dgDawn'], 120, 62, [C, F_, G_, C], seed=2814, gain=0.24, drums=1, wave='square')
pad(E['dgDawn'], E['dgBye'] + 2, [55, 59, 62, 67], 0.16, 1400, fade=1.0); bells(E['dgDawn'], E['dgBye'] + 2, 79, 'maj', 0.9, seed=2815, gain=0.14)
track(E['dgClutch'], E['dgWobble2'], 116, 62, [C, Am, F_, G_], seed=2816, gain=0.24, drums=1, wave='tri', swing=0.2)
pad(E['dgWobble2'], E['dgHatchAll'], [50, 53, 57], 0.16, 600, fade=0.4)
track(E['dgHatchAll'], E['dgHic3'], 132, 64, [C, G_, F_, G_], seed=2817, gain=0.28, drums=2, wave='square')
track(E['dgHic3'], E['freeze'], 180, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2818, gain=0.36, drums=2, wave='saw')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2819, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2820, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(0.5, E['dgSniff'], 0.42): put(s_step(), t, 0.2, rs.uniform(-.3, .3))
for t in np.arange(E['dgSniff'], E['dgEgg'], 0.35): put(s_swish(), t, 0.25, 0.3)
put(s_sparkle(), E['dgEgg'] + 0.2, 0.8); put(s_eggwobble(), E['dgEgg'] + 1, 0.6)
put(s_pop(), E['dgSign'] + 2.5, 0.5); put(s_sting(), E['dgPeak'] + 1.5, 0.4)
put(s_creak(1.5), E['dgCart'], 0.4); put(s_ding(), E['dgCart'] + 4, 0.6); put(s_swish(), E['dgInv'] + 0.3, 0.5); put(s_whoosh(0.6, 400, 3000), E['dgLoad'], 0.5)
put(s_lamphum(E['dgFire'] - E['dgCart']), E['dgCart'], 0.6)
for t in np.arange(E['dgCold'], E['dgCold'] + 2.5, 0.6): put(s_eggwobble(), t, 0.5)
put(s_heart(), E['dgCold'] + 2.8, 0.6)
put(s_bonk(), E['dgBump'], 0.9); put(s_boing(0.6), E['dgBump'] + 0.2, 0.6)
for t in np.linspace(E['dgBump'] + 0.8, E['dgCatch'] - 0.4, 12): put(s_clonk(), t, 0.45, rs.uniform(-.3, .3))
for t in np.arange(E['dgBump'] + 1, E['dgCatch'], 0.14): put(s_thock(), t, 0.2, rs.uniform(-.4, .4))
put(s_sparkle(), E['dgCatch'] + 0.6, 0.7)
put(s_creak(1.2), E['dgLamp'] + 1, 0.5); put(s_flame(4) * 0.4, E['dgHot'], 0.5)
put(s_boom(1.2, 0.5), E['dgFire'], 0.8); put(s_flame(E['dgCinder'] - E['dgFire']) * 0.5, E['dgFire'], 0.5); put(s_whoosh(1.4, 300, 3000), E['dgFire'] + 0.1, 0.7); put(s_clonk(), E['dgFire'] + 1.6, 0.8)
for t in np.arange(E['dgHop'] + 1, E['dgHop'] + 3.3, 0.3): put(s_step(), t, 0.5)
put(s_flame(2.0) * 0.3, E['dgHop'] + 1, 0.4)
for t in np.arange(E['dgWobble'], E['dgHatch'], 1.25): put(s_eggwobble(), t, 0.6)
for t in [E['dgCrack'] + 0.3, E['dgCrack'] + 1.6, E['dgCrack'] + 1.8, E['dgCrack'] + 2.9, E['dgCrack'] + 3.1, E['dgCrack'] + 3.3]: put(s_tik(), t, 0.9)
put(s_hatch(), E['dgHatch'], 1.0); put(s_peep(), E['dgHatch'] + 1.6, 0.8); put(s_peep(), E['dgImprint'] + 0.5, 0.8); put(s_peep(), E['dgImprint'] + 0.8, 0.8)
put(s_wah(), E['dgImprint'] + 3, 0.5)
for t in [E['dgHic'], E['dgHic2'], E['dgSnack'] + 3.4]: put(s_hic(), t, 1.0); put(s_flame(0.6), t + 0.05, 0.7)
put(s_crack(), E['dgHic'] + 0.3, 0.5); put(s_wah(), E['dgHic2'] + 1.3, 0.6)
put(s_peep(), E['dgName'] + 1, 0.7); put(s_blorp(1.4), E['dgSnack'] + 6.9, 0.7); put(s_heart(), E['dgSnack'] + 7.2, 0.6)
for t in np.arange(E['dgLesson'] + 2.8, E['dgLesson'] + 4, 0.2): put(s_wingflap(), t, 0.4)
put(s_thock(), E['dgLesson'] + 4.8, 0.9)
for t in np.arange(E['dgLesson'] + 4, E['dgLesson'] + 5.9, 0.12): put(s_wingflap(), t, 0.25)
for t in np.arange(E['dgNight'] + 1, E['dgNest'], 0.4): put(s_step(), t, 0.2)
for t in np.arange(E['dgShadow'], E['dgLand'], 0.45): put(s_wingflap(), t, 1.0)
put(s_boom(1.6, 0.8), E['dgLand'], 1.0); put(s_roar(2.6), E['dgRoar'], 1.0)
for t in [E['dgSniff2'], E['dgSniff2'] + 1.2, E['dgSniff2'] + 2.4]: put(s_whoosh(0.4, 200, 1500), t, 0.5)
for s in [0.6, 5, 8.5]: put(s_flame(1.2), E['dgChase'] + s, 1.0)
for t in np.arange(E['dgChase'], E['dgCorner'], 0.18): put(s_step(), t, 0.3, rs.uniform(-.3, .3))
put(s_growl(1.5, 60), E['dgCorner'] + 0.5, 0.7)
for t in np.arange(E['dgStep'] + 0.8, E['dgFly'], 0.1): put(s_thock(), t, 0.2)
for t in np.arange(E['dgFly'], E['dgReunite'], 0.16): put(s_wingflap(), t, 0.35)
put(s_peep(), E['dgReunite'], 0.9); put(s_purr(3), E['dgReunite'] + 2, 0.7)
put(s_swish(), E['dgPay'] + 4.4, 0.6); put(s_coin28(), E['dgPay'] + 5.2, 0.8); put(s_thock(), E['dgPay'] + 6.6, 0.8)
put(s_peep(), E['dgBye'] + 1, 0.7); put(s_creak(2.4), E['dgClutch'], 0.8); put(s_sting(), E['dgClutch'] + 3, 0.5)
for t in [E['dgStack'] + 0.9 + i * 1.5 for i in range(5)]: put(s_clonk(), t, 0.9)
for t in np.arange(E['dgFlyOff'], E['dgFlyOff'] + 4, 0.4): put(s_wingflap(), t, 0.9)
put(s_click(), E['dgBabysit'] + 0.5, 0.6)
for t in np.arange(E['dgWobble2'], E['dgHatchAll'], 0.9): put(s_eggwobble(), t, 0.6)
for t in np.arange(E['dgCrack2'], E['dgHatchAll'], 0.35): put(s_tik(), t, 0.8, rs.uniform(-.4, .4))
for i in range(5): put(s_hatch(), E['dgHatchAll'] + i * 0.08, 0.6, -0.4 + i * 0.2); put(s_peep(), E['dgMoms'] + 0.4 + i * 0.25, 0.7, -0.4 + i * 0.2)
for i in range(5): put(s_hic(), E['dgHic3'] + i * 0.15, 0.8, -0.4 + i * 0.2)
put(s_flame(E['freeze'] - E['dgHic3']), E['dgHic3'] + 0.3, 0.8)
for t in np.arange(E['dgHic3'] + 0.6, E['freeze'], 0.3): put(s_wingflap(), t, 0.25, rs.uniform(-.5, .5))
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
