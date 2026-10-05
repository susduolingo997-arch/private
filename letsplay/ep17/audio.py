"""Episode 17 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am, Dm, Em = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (2, 'm'), (4, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
# new SFX for this episode
def s_warp(d=5.0): h = d / 2; return np.concatenate([osc(sweep(80, 2400, h), h, 'saw'), osc(sweep(2400, 80, h), h, 'saw')])[:int(SR * d)] * 0.18 * np.sin(np.pi * T(d) / d)[:int(SR * h) * 2]
def s_dialspin(d=1.6): x = np.zeros(int(SR * d)); [x.__setitem__(slice(int(SR * t), int(SR * t) + 2000), x[int(SR * t):int(SR * t) + 2000] + bp(noise(2000 / SR), 2000, 6000) * env_ad(2000, 0.001, 0.01)) for t in np.cumsum(np.linspace(0.04, 0.2, 14)) if t < d - 0.05]; return x * 0.8
def s_thoom(): d = 1.2; return mix(lp(noise(d), 120) * np.exp(-T(d) * 4) * 2, osc(sweep(60, 30, d), d, 'sine') * np.exp(-T(d) * 3)) * 0.9
def s_roar(d=1.8): return mix(osc(sweep(110, 70, d) + 8 * np.sin(2 * np.pi * 23 * T(d)), d, 'saw') * 0.4, lp(noise(d), 600) * 0.4) * np.sin(np.pi * T(d) / d) * 0.8
def s_lick(d=0.8): return lp(noise(d), 900) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * T(d))) * np.sin(np.pi * T(d) / d) * 0.9
def s_gulp(): d = 0.5; return osc(sweep(300, 90, d), d, 'sine') * env_ad(int(SR * d), 0.01, 0.15) * 0.8
def s_eggcrack(): return mix(s_crack() * 0.6, s_click())
def s_sneeze(): return np.concatenate([osc(sweep(300, 500, 0.8), 0.8, 'tri') * np.linspace(0, 0.3, int(SR * 0.8)), mix(bp(noise(0.6), 500, 6000) * np.exp(-T(0.6) * 5) * 1.4, osc(sweep(400, 120, 0.6), 0.6, 'saw') * np.exp(-T(0.6) * 4) * 0.4)])
def s_crunch(): return mix(s_glass_break(1.2), s_clatter(1.6, 30, 1800), s_boom(1.6, 0.6) * 0.6)
def s_chompS(): d = 0.3; return mix(bp(noise(d), 300, 2500) * env_ad(int(SR * d), 0.001, 0.05), osc(120, d, 'square') * env_ad(int(SR * d), 0.001, 0.04) * 0.2)
# ---- music
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['bump'], 112, 60, [C, Am, F_, G_], seed=1101, gain=0.3, drums=1, wave='square', swing=0.1)   # sci-fi gadget theme
pad(E['bump'], E['lever'], [57, 60, 63], 0.2, 900, fade=0.3)
track(E['arrive'], E['steps'], 96, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (0, 'm')], mode='min', seed=1102, gain=0.3, drums=1, wave='tri', swing=0.2)   # jungle drums
pad(E['steps'], E['chomp'], [40, 41], 0.24, 500, fade=0.3)
track(E['lick'] + 2, E['grab'], 120, 62, [C, F_, G_, C], seed=1103, gain=0.32, drums=2, wave='tri')   # playful dino
pad(E['swallow'], E['repair'], [45, 46, 52], 0.26, 800, fade=0.3)
track(E['repair'], E['egg'], 140, 60, [C, F_, C, G_], seed=1104, gain=0.26, drums=1, wave='square')
pad(E['egg'], E['hatch'], [57, 60, 64], 0.2, 1200); bells(E['hatch'], E['tickle'], 79, 'maj', 1.2, seed=1105, gain=0.2); pad(E['hatch'], E['tickle'], [60, 64, 67, 72], 0.2, 1500)
track(E['tickle'], E['sniff'], 132, 62, [C, Am, F_, G_], seed=1106, gain=0.3, drums=1, wave='tri', swing=0.3)
pad(E['sniff'], E['sneeze'], [52, 55, 58], 0.2, 900, fade=0.3)
track(E['install'], E['bye'], 120, 60, [C, F_, G_, C], seed=1107, gain=0.3, drums=1)
pad(E['bye'], E['depart'], [57, 60, 64, 67], 0.22, 1400); bells(E['bye'], E['depart'], 76, 'maj', 0.8, seed=1108, gain=0.18)
track(E['home'] + 2, E['rumble'], 104, 60, [C, Am, F_, G_], seed=1109, gain=0.26, drums=1, wave='tri', swing=0.15)
pad(E['rumble'], E['stow'], [45, 48, 51], 0.22, 800, fade=0.3)
track(E['stow'] + 1, E['eat1'], 120, 62, [C, F_, G_, C], seed=1110, gain=0.3, drums=1, wave='tri')
track(E['eat1'], E['crunch'], 108, 57, [(0, 'm'), (5, 'm'), (8, 'M'), (7, 'M')], mode='min', seed=1111, gain=0.34, drums=2, wave='saw')   # growing menace (comic)
track(E['crunch'] + 2, E['freeze'], 100, 60, [C, Am, F_, G_], seed=1112, gain=0.24, drums=1, wave='tri')
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=1113, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=1114, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
put(s_sparkle(), E['unveil'] + 0.4, 0.7); put(s_dialspin(), E['bump'] + 0.6, 0.9); put(s_bonk(), E['bump'], 0.5)
put(s_click(), E['lever'] + 0.3, 1.0); put(s_warp(), E['warp'], 1.0); put(s_warp(), E['warpBack'], 1.0)
for i in range(4): put(s_thoom(), E['steps'] + i * 1.4, 0.7 + i * 0.1)
put(s_roar(), E['chomp'], 1.0); put(s_lick(), E['lick'] + 0.4, 1.0); put(s_whoosh(0.8, 300, 2000), E['fetch'] + 0.6, 0.6)
for t in np.arange(E['fetch'] + 2, E['fetchEnd'], 0.35): put(s_thoom() * 0.4, t, 0.4, rs.uniform(-.5, .5))
put(s_chompS(), E['fetchEnd'] - 1, 0.8); put(s_chompS(), E['grab'] + 3, 0.8); put(s_gulp(), E['swallow'], 1.0)
for t in np.arange(E['repair'] + 2, E['egg'] - 2, 0.6): put(s_thock(), t, 0.4, rs.uniform(-.3, .3))
put(s_eggcrack(), E['hatch'] - 2, 0.5); put(s_eggcrack(), E['hatch'], 0.9); put(s_chirp(), E['hatch'] + 1.6, 0.7)
put(s_lick(), E['tickleEnd'] - 3, 0.9); put(s_sneeze(), E['sneeze'] - 0.8, 1.0); put(s_bonk(), E['bonk'], 1.0)
put(s_sparkle(), E['install'] + 3, 0.7); put(s_chirp(), E['bye'] + 7, 0.5)
put(s_rumble(6.0) * 0.4, E['rumble'], 0.6); put(s_chirp(), E['stow'] + 2, 0.8)
put(s_chompS(), E['eat1'] + 1.2, 1.0); put(s_chompS(), E['eat1'] + 1.5, 0.9); put(s_chompS(), E['eat2'] + 1.2, 1.0); put(s_chompS(), E['eat2'] + 1.5, 0.9)
put(s_heart(), E['huge'], 0.5); put(s_roar(2.4) * 0.6, E['yawn'], 0.8); put(s_crunch(), E['crunch'], 1.0); put(s_lick(), E['lick2'] + 0.4, 1.0)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
