"""Episode 26 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_hoot(): d = 0.9; return mix(osc(sweep(420, 360, 0.4), 0.4) * env_ad(int(SR * 0.4), 0.03, 0.2), np.concatenate([np.zeros(int(SR * 0.45)), osc(sweep(400, 330, 0.45), 0.45) * env_ad(int(SR * 0.45), 0.03, 0.25)])) * 0.6
def s_klaxon(d): return osc(np.where(np.sin(2 * np.pi * 1.6 * T(d)) > 0, 620.0, 440.0), d, 'square') * 0.16
def s_shutter(): d = 1.0; return mix(bp(noise(0.7), 300, 2500) * 0.5 * env_ad(int(SR * 0.7), 0.01, 0.4), np.concatenate([np.zeros(int(SR * 0.6)), lp(noise(0.4), 300) * 1.4 * env_ad(int(SR * 0.4), 0.002, 0.15)]))
def s_rattle(d): return bp(noise(d), 1500, 6000) * (np.sin(2 * np.pi * 18 * T(d)) > 0.3) * 0.5
def s_roar(): d = 2.6; return mix(osc(sweep(180, 70, d), d, 'saw') * 0.3, bp(noise(d), 200, 1800) * 0.5) * np.sin(np.pi * T(d) / d) ** 0.6
def s_porcelain(): d = 1.0; return mix(bp(noise(d), 3000, 9000) * env_ad(int(SR * d), 0.001, 0.3) * 0.8, osc(2600, d) * env_ad(int(SR * d), 0.001, 0.2) * 0.2, osc(3900, d) * env_ad(int(SR * d), 0.001, 0.15) * 0.15)
def s_sneeze(): d = 1.4; a = osc(sweep(300, 700, 0.6), 0.6, 'tri') * 0.2 * np.linspace(0.2, 1, int(SR * 0.6)); return np.concatenate([a, bp(noise(0.8), 800, 5000) * env_ad(int(SR * 0.8), 0.002, 0.25) * 1.1])
def s_snore(): d = 1.6; return lp(noise(d), 260) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * T(d))) * np.sin(np.pi * T(d) / d) * 1.2
def s_clack(): d = 0.12; return bp(noise(d), 1800, 5000) * env_ad(int(SR * d), 0.001, 0.03) * 0.9
def s_stamp(): d = 0.3; return mix(lp(noise(d), 600) * env_ad(int(SR * d), 0.001, 0.06) * 1.2, osc(90, d) * env_ad(int(SR * d), 0.001, 0.1) * 0.6)
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['muEnter'], 116, 62, [C, F_, G_, C], seed=2601, gain=0.24, drums=1, wave='tri', swing=0.2)   # grand opening
bells(E['muEnter'], E['muPress'], 74, 'maj', 1.4, seed=2602, gain=0.14)   # museum music box
track(E['muEnter'], E['muPress'], 96, 62, [(0, 'M'), (9, 'm'), (2, 'm'), (7, 'M')], seed=2603, gain=0.17, drums=0, wave='square')
pad(E['muLocked'], E['muWake'], [57, 60, 64], 0.16, 600, fade=0.6); pulse(E['muLocked'] + 4, E['muWake'], 60, gain=0.3)   # night in the museum
track(E['muChase'] - 1, E['muFetch'], 172, 57, [(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=2604, gain=0.34, drums=2, wave='saw')
track(E['muFetch'] + 2, E['muMess'], 112, 64, [C, G_, Am, F_], seed=2605, gain=0.24, drums=1, wave='tri', swing=0.3)
track(E['muMess'], E['muFix'], 156, 62, [C, F_, G_, C], seed=2606, gain=0.3, drums=2, wave='square')
track(E['muFix'], E['muLull'], 144, 64, [C, Am, F_, G_], seed=2607, gain=0.3, drums=2, lead=2, wave='square')   # fix-it montage
bells(E['muLull'], E['muSnore'], 72, 'maj', 0.8, seed=2608, gain=0.16)   # lullaby
pad(E['muSnore'], E['muDawn'], [55, 59, 62], 0.12, 500, fade=0.8)
mput(s_fanfare(), E['muDawn'], 0.4); bells(E['muDawn'] + 1, E['muAccept'], 76, 'maj', 1.0, seed=2609, gain=0.14); track(E['muInspect'], E['muAccept'], 92, 60, [C, Am, Dm, G_], seed=2610, gain=0.18, drums=1, wave='tri')
mput(s_fanfare(), E['muAccept'], 0.7); track(E['muAccept'] + 1.5, E['muSign'], 120, 64, [C, F_, C, G_], seed=2611, gain=0.26, drums=1, wave='tri', swing=0.2)
track(E['muSneeze'] + 1, E['muRunOut'], 168, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=2612, gain=0.34, drums=2, wave='saw')
track(E['muRunOut'], E['freeze'], 176, 62, [C, G_, F_, G_], seed=2613, gain=0.36, drums=2, lead=2, wave='square')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=2614, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=2615, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(E['muArrive'], E['muArrive'] + 7, 0.3): put(s_step(), t, 0.3, rs.uniform(-.3, .3))
put(s_creak(1.2), E['muCurator'], 0.7); put(s_hoot(), E['muCurator'] + 1, 0.9); put(s_sting(), E['muRules'] + 1, 0.6); put(s_hoot(), E['muShake'] + 0.8, 0.8)
put(s_sparkle(), E['muPitch'] + 2, 0.6); put(s_stamp(), E['muReject'], 1.0); put(s_stamp(), E['muReject'] + 0.45, 0.9); put(s_wah(), E['muReject'] + 1, 0.6)
put(s_sneeze(), E['muVase'] + 1.0, 0.9); put(s_porcelain() * 0.3, E['muVase'] + 1.9, 0.5); put(s_boing(0.5), E['muVase'] + 3.2, 0.5)
put(s_whoosh(0.6, 400, 2500), E['muPaint'] + 1.2, 0.6); put(s_creak(1.4), E['muPaint'] + 2.2, 0.8); put(s_hoot(), E['muBye'], 0.7)
put(s_tick(), E['muButton'] + 2, 0.5); put(s_tick(), E['muButton'] + 3, 0.5); put(s_tick(), E['muButton'] + 4, 0.5); put(s_step(), E['muPress'] - 0.6, 0.6); put(s_click(), E['muPress'], 1.0)
put(s_klaxon(E['muLocked'] - E['muPress'] - 0.5), E['muPress'] + 0.3, 0.8); put(s_shutter(), E['muShut'] - 0.4, 1.0); put(s_boom(1.2, 0.3), E['muShut'] + 2.3, 0.5)
put(s_screech(0.8), E['muCreep'] + 0.6, 0.6); put(s_thock(), E['muSneak'] + 5.5, 0.6)
put(s_blorp(1.4), E['muToe'] + 2.2, 0.7); put(s_rattle(5), E['muWake'], 0.8); put(s_roar(), E['muRoar'], 1.0)
for t in np.arange(E['muChase'] + 1.5, E['muFetch'] - 3, 0.42): put(s_thock(), t, 0.4, rs.uniform(-.4, .4))
put(s_porcelain(), E['muSmash'], 1.0); put(s_rattle(1.2), E['muFetch'] + 1, 0.5); put(s_whoosh(1.4, 300, 2000), E['muThrow'], 0.7); put(s_bonk(), E['muThrow'] + 1.6, 0.6); put(s_rattle(1), E['muMess'] - 1, 0.5)
put(s_clatter(1.0, 14, 1500), E['muMess'] + 1.8, 0.8); put(s_crack(), E['muMess'] + 2.2, 0.6)
for t in np.arange(E['muFix'], E['muFix'] + 14, 0.5): put(s_thock(), t, 0.35, rs.uniform(-.3, .3))
for s in [E['muSnore'], E['muSnore'] + 4, E['muSnore'] + 8, E['muInspect'] + 17]: put(s_snore(), s, 0.8); put(s_rattle(0.8), s + 0.3, 0.4)
put(s_shutter(), E['muDawn'], 0.6); put(s_hoot(), E['muInspect'] + 7, 0.6); put(s_hoot(), E['muInspect'] + 13, 0.6); put(s_stamp(), E['muAccept'], 1.0); put(s_sparkle(), E['muAccept'] + 0.5, 0.8)
put(s_creak(0.8), E['muSign'], 0.7)
for i in range(8): put(s_clack(), E['muSign'] + 0.9 + i * 0.7, 0.9, -0.5 + i * 0.13)
put(s_bonk(), E['muSign'] + 6.6, 0.9); put(s_rattle(2), E['muWake2'], 0.6); put(s_sneeze(), E['muSneeze'] - 0.6, 1.2); put(s_clatter(2.4, 40, 1800), E['muSneeze'] + 0.4, 1.0)
put(s_bonk(), E['muSneeze'] + 2, 0.9); put(s_hoot(), E['muSneeze'] + 2.6, 0.7); put(s_rattle(2.4), E['muReass'], 0.8); put(s_sparkle(), E['muReass'] + 2.4, 0.8); put(s_roar() * 0.6, E['muReass'] + 2.6, 0.7)
put(s_boom(1.4, 0.5), E['muRunOut'] + 0.3, 0.9)
for t in np.arange(E['muRunOut'] + 0.5, E['freeze'], 0.36): put(s_thock(), t, 0.4, rs.uniform(-.4, .4))
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
