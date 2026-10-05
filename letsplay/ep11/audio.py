"""Episode 11 soundtrack: reuses the synth/SFX library and narration mixer from ../audio.py."""
src = open('../audio.py').read()
exec(src[:src.index("C, G_, F_, Am, Em, Dm = ")])
MIX = src[src.index("# ---------------------------------------------------------------- narration with overlap shifting"):]
C, G_, F_, Am = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm')
def mix(*xs):
    out = np.zeros(max(len(x) for x in xs))
    for x in xs: out[:len(x)] += x
    return out
def splash(d=1.2): return bp(noise(d), 300, 4000) * env_ad(int(SR * d), 0.005, d / 4)
def s_beepboop(): return np.concatenate([osc(900, 0.12, 'square') * env_ad(int(SR * 0.12), 0.002, 0.05), np.zeros(int(SR * 0.05)), osc(600, 0.15, 'square') * env_ad(int(SR * 0.15), 0.002, 0.06)]) * 0.35
def s_laser(d=0.6): return osc(sweep(2400, 1800, d), d, 'saw') * env_ad(int(SR * d), 0.02, d / 2) * 0.12
def s_siren(d):
    f = 700 + 300 * np.sign(np.sin(2 * np.pi * 1.6 * T(d))); ph = np.cumsum(2 * np.pi * f / SR); return np.sin(ph) * 0.25 * np.minimum(1, T(d) / 0.2)
def s_honk(): d = 0.35; return (osc(sweep(330, 260, d), d, 'saw') * 0.5 + bp(noise(d), 300, 1500) * 0.2) * env_ad(int(SR * d), 0.01, 0.12)
def s_pots(): return mix(*[np.pad(s_clatter(0.6, 10, rs.uniform(1500, 4000)), (int(SR * k * 0.12), 0)) for k in range(6)]) * 0.8
def s_zap(): d = 0.8; return mix(bp(noise(d), 2000, 9000) * env_ad(int(SR * d), 0.005, 0.2) * 0.6, osc(sweep(120, 40, d), d, 'square') * env_ad(int(SR * d), 0.01, 0.3) * 0.3)
def s_ropezip(d=1.6): return bp(noise(d), 1500, 6000) * np.linspace(0.2, 1, int(SR * d)) * 0.4
mput(s_fanfare(), E['titleIn'], 0.7)
track(4.6, E['plan'], 90, 57, [(0, 'm'), (5, 'm'), (3, 'M'), (7, 'M')], mode='min', seed=501, gain=0.28, drums=0, wave='tri')
track(E['plan'], E['town'], 112, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=502, gain=0.36, drums=1, wave='square', swing=0.25)   # heist theme
track(E['town'], E['prestin'], 84, 57, [(0, 'm'), (1, 'M')], mode='min', seed=503, gain=0.26, drums=0, wave='tri', swing=0.3)   # sneaky
track(E['prestin'] + 2, E['climb'], 128, 60, [C, G_, Am, F_], seed=504, gain=0.42, drums=2, lead=2)   # dance party
track(E['climb'], E['lasers'], 112, 57, [(0, 'm'), (3, 'M'), (5, 'm'), (7, 'M')], mode='min', seed=505, gain=0.32, drums=1, wave='square', swing=0.25)
pad(E['lasers'], E['open'], [45, 48, 52], 0.25, 900); pulse(E['limbo'], E['pots'], 120, 0.5)
mput(s_sting(), E['open'], 0.8); pad(E['open'] + 1, E['glow'], [52, 55, 59], 0.22, 900); bells(E['puffTest'], E['glow'], 64, 'min', 0.9, seed=506, gain=0.18)
mput(s_fanfare(), E['glow'], 0.7); track(E['glow'] + 1, E['touch'], 100, 62, [C, F_, G_, C], seed=507, gain=0.3, drums=1, wave='tri')
track(E['alarm'], E['splash'], 176, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=508, gain=0.48, drums=2, lead=2, wave='saw', bassw='square')
pad(E['splash'] + 1, E['goose'], [57, 60, 64], 0.2, 1200); pad(E['goose'], E['forgive'], [45, 48, 52], 0.25, 900)
track(E['forgive'], E['dance'], 96, 62, [C, Am, F_, G_], seed=509, gain=0.3, drums=1, wave='tri', swing=0.2)
track(E['dance'], E['freeze'], 128, 60, [C, G_, Am, F_], seed=510, gain=0.36, drums=2)
track(287.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=511, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7); track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=512, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)
# ---- SFX
for t in np.arange(E['sneak'], E['hide'], 0.55): put(s_step(), t, 0.25, rs.uniform(-.3, .3))
for t in np.arange(E['bot'], E['party'], 2.4): put(s_beepboop(), t, 0.6, 0.3)
put(s_honk(), E['gooseDance'], 0.9); put(s_honk(), E['gooseDance'] + 1.4, 0.7)
for t in np.arange(E['climb'] + 2, E['roof'], 0.25): put(s_step(), t, 0.3)
put(s_ropezip(3.0) * 0.5, E['dangle'] + 4.6, 0.5)
for t in np.arange(E['lasers'], E['open'], 2.0): put(s_laser(), t, 0.4, rs.uniform(-.5, .5))
put(s_whoosh(1.2, 300, 3000), E['bloopJump'] + 2, 0.6); put(s_pots(), E['pots'], 1.1)
for k in range(6): put(s_drillrun := (bp(noise(0.5), 600, 3600) * 0.4), E['vault'] + 0.4 + k * 0.6, 0.6)
put(s_creak(1.2), E['open'], 0.8); put(s_sparkle(), E['glow'], 1.0); put(s_ding(), E['crownOn'], 0.8)
put(s_zap(), E['touch'] + 0.6, 0.8); put(s_siren(E['splash'] - E['alarm']), E['alarm'], 0.7)
put(s_ropezip(2.0), E['yank'], 0.8)
for t in np.arange(E['roofChase'], E['splash'], 0.24): put(s_step(), t, 0.35, rs.uniform(-.3, .3))
put(s_whoosh(1.0, 400, 4000), E['jumpDown'], 0.8); put(s_punch(), E['jumpDown'] + 2, 0.6)
put(s_clatter(1.2, 16, 5000), E['marbles'], 0.7); put(s_screech(1.2), E['slip'], 0.7)
put(splash(2.4), E['splash'], 1.2); put(s_zap(), E['splash'] + 0.5, 0.9)
for k in range(14): put(s_pop(), E['splash'] + 1 + k * 0.35, 0.4, rs.uniform(-.6, .6))
put(s_honk(), E['goose'] + 2, 0.8); put(s_scratch(), E['receipt'], 0.6)
put(s_scratch(), E['bloopInv'], 0.6); put(s_ding(), E['bloopInv'] + 5.8, 0.6)
for k in range(3): put(s_honk(), E['dance'] + k * 1.7, 0.5)
put(s_scratch(), E['freeze'] - 0.1, 1.0); put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.5 + i * 0.12, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)
exec(MIX)
