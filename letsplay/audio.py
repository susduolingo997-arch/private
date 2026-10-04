"""Builds the full soundtrack: TTS narration + procedural music + synthesized SFX.
Outputs build/audio.wav, build/env.json (mouth-flap envelope), and shifts cues to avoid overlaps."""
import json, numpy as np, soundfile as sf

SR = 44100; DUR = 300.0; N = int(SR * DUR); FPS = 24
E = json.load(open('events.json'))
rs = np.random.RandomState(7)

def T(sec): return np.arange(int(SR * sec)) / SR
def env_ad(n, a=0.005, d=None, curve=4.0):
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4))
    L = n / SR
    return e * np.exp(-curve * t / max(L, 1e-3)) if d is None else e * np.exp(-t / d)
def osc(f, sec, wave='sine', phase=0):
    t = T(sec); f = np.broadcast_to(f, t.shape) if np.ndim(f) else np.full(t.shape, f)
    ph = 2 * np.pi * np.cumsum(f) / SR + phase
    if wave == 'sine': return np.sin(ph)
    if wave == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if wave == 'square': return np.tanh(np.sin(ph) * 4) * 0.7
    if wave == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
def lp(x, cut):  # FFT brickwall-ish lowpass with soft edge
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x))
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (1 / (1 + (f / hi) ** 4)) * (1 / (1 + (lo / np.maximum(f, 1)) ** 4)); return np.fft.irfft(X, len(x))
def noise(sec): return rs.uniform(-1, 1, int(SR * sec))
def sweep(f0, f1, sec, exp=True):
    t = T(sec) / sec; return f0 * (f1 / f0) ** t if exp else f0 + (f1 - f0) * t
def mtof(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------------------------------------------------------- SFX library
def s_punch():
    d = 0.18; x = osc(sweep(140, 50, d), d) * env_ad(int(SR * d), 0.002, 0.05) + lp(noise(d), 1500) * env_ad(int(SR * d), 0.001, 0.02) * 0.8; return x * 0.9
def s_crack():
    d = 0.5; x = bp(noise(d), 600, 4000) * env_ad(int(SR * d), 0.001, 0.08); c = np.zeros_like(x)
    for k in range(8): i = rs.randint(0, len(x) - 800); c[i:i + 400] += rs.uniform(-1, 1, 400) * np.exp(-np.arange(400) / 60)
    return x * 0.9 + c * 0.6 + osc(sweep(200, 70, d), d) * env_ad(len(x), 0.002, 0.08) * 0.6
def s_pop():
    d = 0.14; return osc(sweep(380, 1300, d), d) * env_ad(int(SR * d), 0.002, 0.05) * 0.7
def s_click():
    d = 0.04; return osc(2200, d, 'square') * env_ad(int(SR * d), 0.0005, 0.008) * 0.5
def s_bell(f, d=1.0, a=0.5):
    x = sum(osc(f * h, d) * w for h, w in [(1, 1), (2.76, 0.4), (5.4, 0.2), (8.9, 0.1)]); return x * env_ad(int(SR * d), 0.002, d / 4) * a
def s_ding():
    out = np.zeros(int(SR * 1.4))
    for i, m in enumerate([72, 76, 79, 84]): b = s_bell(mtof(m), 0.9, 0.35); s = int(SR * i * 0.08); out[s:s + len(b)] += b
    return out
def s_bonk():
    d = 0.35; return (osc(sweep(700, 260, d), d) * env_ad(int(SR * d), 0.001, 0.08) + lp(noise(d), 2500) * env_ad(int(SR * d), 0.001, 0.01)) * 0.8
def s_step():
    d = 0.09; return lp(noise(d), 900) * env_ad(int(SR * d), 0.002, 0.02) * 0.45
def s_whoosh(d=0.45, lo=300, hi=3000):
    x = noise(d); t = np.linspace(0, 1, len(x)); x = bp(x, lo, hi) * np.sin(np.pi * t) ** 2; return x * 0.7
def s_boom(d=2.8, big=1.0):
    n = int(SR * d); x = lp(noise(d), 700) * env_ad(n, 0.003, 0.5) * 1.6 + osc(sweep(80, 28, d), d) * env_ad(n, 0.003, 0.4) * 1.4
    x += bp(noise(d), 1500, 7000) * env_ad(n, 0.001, 0.12) * 0.6
    for k in range(int(30 * big)): i = rs.randint(int(SR * 0.2), n - 2000); x[i:i + 1200] += lp(rs.uniform(-1, 1, 1200), 2500) * np.exp(-np.arange(1200) / 200) * 0.35 * np.exp(-i / SR)
    return np.tanh(x * big)
def s_clatter(d=1.4, k=26, f=2500):
    n = int(SR * d); x = np.zeros(n)
    for i in range(k): s = int(rs.uniform(0, 1) ** 1.6 * (n - 3000)); L = 2000; x[s:s + L] += lp(rs.uniform(-1, 1, L), f) * np.exp(-np.arange(L) / 300) * rs.uniform(0.3, 0.9)
    return x * 0.6
def s_blorp(pitch=1.0):
    d = 0.32; f = 220 * pitch * (1 + 0.25 * np.sin(np.linspace(0, 9, int(SR * d)))) * np.linspace(1.2, 0.9, int(SR * d))
    x = osc(f, d, 'saw'); x = bp(x, 400, 1800) * env_ad(len(x), 0.02, 0.12); return x * 0.9
def s_drip():
    d = 0.5; x = osc(sweep(900, 1900, 0.06), 0.06) * env_ad(int(SR * .06), 0.001, 0.02); out = np.zeros(int(SR * d)); out[:len(x)] += x
    for k, a in [(0.13, .4), (0.27, .2)]: s = int(SR * k); out[s:s + len(x)] += x * a
    return out * 0.5
def s_screech(d=1.6):
    n = int(SR * d); f = sweep(900, 260, d) * (1 + 0.08 * np.sin(np.arange(n) / SR * 2 * np.pi * 31))
    x = osc(f, d, 'saw') + 0.6 * osc(f * 1.49, d, 'saw') + bp(noise(d), 1000, 5000) * 0.6
    return np.tanh(bp(x, 300, 5000) * 2.5) * env_ad(n, 0.02, d / 2.5) * 0.7
def s_heart():
    out = np.zeros(int(SR * 0.6))
    for s in [0, 0.18]: d = 0.15; x = osc(sweep(70, 40, d), d) * env_ad(int(SR * d), 0.004, 0.05); i = int(SR * s); out[i:i + len(x)] += x
    return out * 0.9
def s_thock():
    d = 0.12; return (osc(sweep(260, 150, d), d) * 0.6 + lp(noise(d), 1800) * 0.5) * env_ad(int(SR * d), 0.001, 0.025) * 0.7
def s_boing(d=0.7):
    n = int(SR * d); f = 180 * (1 + 0.6 * np.sin(np.arange(n) / SR * 2 * np.pi * 14) * np.exp(-np.arange(n) / SR * 4)) * sweep(1, 1.8, d)
    return osc(f, d, 'tri') * env_ad(n, 0.003, 0.25) * 0.8
def s_gloop():
    d = 0.4; x = osc(sweep(110, 220, d), d) * env_ad(int(SR * d), 0.01, 0.12); return lp(x + 0.3 * osc(sweep(330, 660, d), d, 'square') * env_ad(int(SR * d), 0.01, 0.06), 1200) * 0.8
def s_growl(d=1.2, f0=70):
    n = int(SR * d); f = f0 * (1 + 0.15 * np.sin(np.arange(n) / SR * 2 * np.pi * 7))
    x = osc(f, d, 'saw') * (0.6 + 0.4 * np.sin(np.arange(n) / SR * 2 * np.pi * 23)); return lp(x, 700) * env_ad(n, 0.08, d / 2) * 0.8
def s_wah():
    out = np.zeros(int(SR * 1.2))
    for i, m in enumerate([62, 61, 60]): d = 0.32 if i < 2 else 0.6; x = osc(mtof(m) * (1 + 0.01 * np.sin(T(d) * 30)), d, 'square') * env_ad(int(SR * d), 0.01, d / 2); x = lp(x, 1400); s = int(SR * i * 0.3); out[s:s + len(x)] += x
    return out * 0.5
def s_scratch():
    d = 0.7; n = int(SR * d); t = np.arange(n) / SR; f = 300 + 900 * np.abs(np.sin(2 * np.pi * 3.5 * t))
    x = osc(f, d, 'saw') * 0.5 + bp(noise(d), 800, 5000) * np.abs(np.sin(2 * np.pi * 3.5 * t)); return np.tanh(x * 1.5) * env_ad(n, 0.005, 0.4) * 0.8
def s_creak(d=2.2):
    n = int(SR * d); t = np.arange(n) / SR; f = 95 + 35 * np.sin(2 * np.pi * 0.7 * t) + 15 * np.sin(2 * np.pi * 3.1 * t)
    x = osc(f, d, 'saw') * (0.5 + 0.5 * (np.sin(2 * np.pi * f * 0.13 * t) > 0)); x = bp(x, 150, 2200)
    return x * np.sin(np.pi * t / d) ** 0.5 * 0.6
def s_rumble(d=4.0):
    n = int(SR * d); x = lp(noise(d), 300) * 2.2 * env_ad(n, 0.05, 1.4) + s_clatter(d, 120, 2000)[:n] * 1.4
    return np.tanh(x)
def s_tick():
    d = 0.05; return bp(noise(d), 2000, 6000) * env_ad(int(SR * d), 0.0005, 0.006) * 0.8
def s_chirp():
    d = 0.12; return osc(sweep(2800, 4200, d), d) * env_ad(int(SR * d), 0.005, 0.03) * 0.25
def s_sting():  # orchestral horror hit
    d = 2.0; n = int(SR * d); x = np.zeros(n)
    for m in [36, 43, 48, 51, 54, 60]: x += osc(mtof(m) * (1 + 0.004 * rs.randn()), d, 'saw')
    x = lp(x, 2500) / 4 + lp(noise(d), 500) * 0.8; return np.tanh(x * 1.5) * env_ad(n, 0.004, 0.6) * 0.9
def s_fanfare():
    out = np.zeros(int(SR * 2.2))
    for i, (ms, dd) in enumerate([([60, 64, 67], 0.15), ([60, 64, 67], 0.15), ([65, 69, 72], 0.3), ([67, 71, 74, 79], 1.2)]):
        s = int(SR * [0, 0.18, 0.36, 0.7][i]); x = sum(osc(mtof(m), dd, 'saw') for m in ms) / len(ms); x = lp(x, 3000) * env_ad(len(x), 0.01, dd * 0.8 if dd > 0.5 else 0.2); out[s:s + len(x)] += x
    return out * 0.9
def s_drumroll(d=1.6):
    n = int(SR * d); x = np.zeros(n); i = 0; k = 0
    while i < n - 2000: L = 1500; x[i:i + L] += bp(rs.uniform(-1, 1, L), 1500, 7000) * np.exp(-np.arange(L) / 250) * (0.3 + 0.7 * i / n); i += int(SR * 0.045)
    return x * 0.7
def s_tinnitus(d=3.0): return osc(4200, d) * env_ad(int(SR * d), 0.01, 1.2) * 0.12
def s_sparkle():
    out = np.zeros(int(SR * 1.4))
    for i in range(10): b = s_bell(mtof(84 + [0, 4, 7, 11, 12, 16, 19, 23, 24, 28][i]), 0.4, 0.18); s = int(SR * i * 0.06); out[s:s + len(b)] += b
    return out
def s_swish(): return s_whoosh(0.25, 800, 5000) * 0.8
def s_glass_break(d=1.0):
    x = np.zeros(int(SR * d))
    for k in range(25): b = s_bell(rs.uniform(2500, 6000), 0.3, 0.08); s = rs.randint(0, len(x) - len(b)); x[s:s + len(b)] += b
    return x + bp(noise(d), 3000, 9000) * env_ad(len(x), 0.001, 0.1) * 0.4

# ---------------------------------------------------------------- mix buffers
mixL = np.zeros(N); mixR = np.zeros(N)
def put(x, t, gain=1.0, pan=0.0):
    i = int(t * SR); x = x[:max(0, N - i)]
    if i < 0 or len(x) == 0: return
    gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
    mixL[i:i + len(x)] += x * gl; mixR[i:i + len(x)] += x * gr

# ---------------------------------------------------------------- music
music = np.zeros(N)
def mput(x, t, g=1.0):
    i = int(t * SR); x = x[:max(0, N - i)]; music[i:i + len(x)] += x * g
def kick(): d = 0.25; return osc(sweep(150, 45, d), d) * env_ad(int(SR * d), 0.001, 0.07)
def snare(): d = 0.2; return (bp(noise(d), 800, 6000) * 0.7 + osc(190, d) * 0.3) * env_ad(int(SR * d), 0.001, 0.05)
def hat(): d = 0.05; return bp(noise(d), 6000, 12000) * env_ad(int(SR * d), 0.0005, 0.012)
def pluck(m, d, wave='square', cut=2500, a=0.3):
    x = osc(mtof(m), d, wave) * env_ad(int(SR * d), 0.003, d / 3); return lp(x, cut) * a
SCALES = {'maj': [0, 2, 4, 7, 9], 'min': [0, 3, 5, 7, 10]}
def track(t0, t1, bpm, root, prog, mode='maj', drums=1, lead=1, wave='square', seed=1, gain=0.5, bassw='tri', swing=0):
    r = np.random.RandomState(seed); beat = 60 / bpm; bar = beat * 4; t = t0; b = 0
    while t < t1 - 0.01:
        ch = prog[b % len(prog)]; rt = root + ch[0]; third = 3 if ch[1] == 'm' else 4
        for q in range(8):  # eighths
            tq = t + q * beat / 2 + (swing * beat / 2 if q % 2 else 0)
            if tq >= t1: break
            if q % 2 == 0: mput(pluck(rt - 24 + (12 if q == 4 else 0), beat * 0.45, bassw, 900, 0.55), tq, gain)
            arp = [0, third, 7, 12][q % 4]; mput(pluck(rt + arp, beat * 0.4, wave, 2200, 0.13), tq, gain)
            if drums:
                if q in (0, 4) or (drums > 1 and q in (3, 7)): mput(kick(), tq, gain * 0.9)
                if q in (2, 6): mput(snare(), tq, gain * 0.45)
                mput(hat(), tq, gain * 0.25)
        if lead:
            sc = SCALES[mode]; pos = 0
            while pos < 4:
                L = r.choice([0.5, 0.5, 1, 1, 1.5]) if lead == 1 else r.choice([0.25, 0.5])
                if t + pos * beat >= t1: break
                if r.rand() < 0.82: m = root + 12 + sc[r.randint(5)] + 12 * (r.rand() < 0.3); mput(pluck(m, beat * L * 0.9, 'square' if wave != 'square' else 'tri', 3500, 0.2), t + pos * beat, gain)
                pos += L
        t += bar; b += 1
def pad(t0, t1, notes, gain=0.25, cut=900, wave='saw', fade=1.5):
    d = t1 - t0; n = int(SR * d); x = np.zeros(n)
    for m in notes: x += osc(mtof(m) * 1.003, d, wave) + osc(mtof(m) * 0.997, d, wave)
    x = lp(x / len(notes), cut); e = np.minimum(1, np.minimum(np.arange(n) / (SR * fade), (n - np.arange(n)) / (SR * fade))); mput(x * e, t0, gain)
def bells(t0, t1, root, mode, rate=1.2, seed=3, gain=0.3):
    r = np.random.RandomState(seed); t = t0
    while t < t1: mput(s_bell(mtof(root + 24 + SCALES[mode][r.randint(5)]), 1.6, 0.4), t, gain); t += rate * r.choice([0.5, 1, 1.5])
def pulse(t0, t1, bpm, gain=0.6):
    t = t0
    while t < t1: mput(s_heart(), t, gain); t += 60 / bpm

C, G_, F_, Am, Em, Dm = (0, 'M'), (7, 'M'), (5, 'M'), (9, 'm'), (4, 'm'), (2, 'm')
pad(0, 3.0, [60, 67, 72], 0.15, 1500)
track(2.6, 27.8, 118, 60, [C, Am, F_, G_], seed=1, gain=0.42)
track(30.4, 40.0, 118, 60, [F_, G_, C, C], seed=2, gain=0.42)
track(40.0, 67.55, 132, 67, [C, G_, Am, F_], seed=4, gain=0.42, drums=2)
mput(s_tinnitus(3.2), 67.8, 1.0)
track(71.0, 79.7, 84, 65, [(0, 'M'), (5, 'M'), (2, 'm'), (7, 'M')], seed=5, gain=0.3, drums=0, lead=1, wave='tri', swing=0.3)  # awkward elevator
track(84.4, 90.0, 160, 60, [C, G_], seed=6, gain=0.4, drums=2, lead=2)
track(90.0, 100.4, 96, 57, [(0, 'm'), (5, 'M'), (3, 'M'), (7, 'M')], mode='min', seed=7, gain=0.35, drums=1, wave='tri')
pad(100.4, 123.4, [45, 52, 57], 0.3, 600); bells(101, 122, 57, 'min', 1.3, gain=0.22)
pad(123.0, 125.3, [44, 45, 51], 0.4, 1200, fade=0.3); pulse(123.0, 125.3, 110, 0.7)
mput(s_sting(), E['lurk'], 1.0)
track(E['chase'], E['exitFlash'], 172, 50, [(0, 'm'), (1, 'M'), (0, 'm'), (6, 'M')], mode='min', seed=8, gain=0.5, drums=2, lead=2, wave='saw', bassw='saw')
pad(140.0, 143.2, [60, 64, 67], 0.15, 1200)
track(143.2, 172.3, 126, 62, [(0, 'M'), (7, 'M'), (9, 'm'), (5, 'M')], seed=9, gain=0.4, drums=1, wave='tri')
mput(s_drumroll(1.6), 172.4, 0.9)
track(176.6, 181.4, 100, 62, [(0, 'M'), (5, 'M')], seed=10, gain=0.35, drums=1, wave='tri')
track(182.6, 189.5, 120, 60, [C, F_, G_, C], seed=11, gain=0.42, drums=2)
pad(189.0, 200.4, [57, 60, 64], 0.25, 800); bells(190, 200, 57, 'min', 1.5, seed=12, gain=0.2)
pad(200.4, 223.6, [45, 48, 52, 53], 0.3, 1000, fade=0.5)
track(204.4, 223.5, 100, 45, [(0, 'm'), (5, 'm'), (0, 'm'), (8, 'M')], mode='min', seed=13, gain=0.35, drums=1, lead=0, wave='saw')
track(E['wallBreak'] + 0.3, E['hours'], 184, 52, [(0, 'm'), (3, 'M'), (5, 'm'), (6, 'M')], mode='min', seed=14, gain=0.5, drums=2, lead=2, wave='saw', bassw='square')
for k in range(8): mput(s_tick(), E['hours'] + 0.25 + k * 0.5, 0.8)
pad(E['dawn'], 272.6, [60, 64, 67, 71], 0.22, 1300); bells(251, 272, 60, 'maj', 1.6, seed=15, gain=0.18)
track(261.4, 267.7, 90, 60, [C, F_], seed=16, gain=0.3, drums=1, wave='tri')
pad(E['collapse'], E['freeze'], [41, 48, 53, 56], 0.4, 900, fade=0.4)
track(286.6, E['logo'], 110, 64, [(0, 'M'), (5, 'M'), (7, 'M'), (0, 'M')], seed=17, gain=0.3, drums=1, wave='tri', swing=0.25)
mput(s_fanfare(), E['logo'] + 0.2, 0.7)
track(E['logo'] + 2.3, 299.6, 120, 60, [C, Am, F_, G_], seed=18, gain=0.4, drums=2)
pad(298.0, 300.0, [48, 60, 64, 67, 72], 0.3, 2500, fade=0.3)

# ---------------------------------------------------------------- SFX timeline
put(s_sparkle(), E['spawn'] - 0.1, 0.8)
def steps(t0, t1, rate, g=0.6):
    t = t0
    while t < t1: put(s_step(), t, g * rs.uniform(0.7, 1), rs.uniform(-.3, .3)); t += rate
steps(E['walkTree'], E['atTree'], 0.32)
for k in range(14): t = E['punch'] + 0.25 + k * 0.26; put(s_punch(), t, 0.8); put(s_swish(), t - 0.1, 0.25)
put(s_crack(), E['logBreak'], 1.0); put(s_pop(), E['pickup'], 0.8)
put(s_scratch(), 27.75, 0.6)
for t in [E['craftOpen'], E['craftLog1'], E['craftLog2'], E['craftDone']]: put(s_click(), t, 0.8)
put(s_ding(), E['craftDone'] + 0.05, 0.8); put(s_swish(), 37.7, 0.6); put(s_bonk(), E['trip'] + 0.45, 1.0)
steps(E['run1'], E['stopHill'], 0.2); steps(E['villageWalk'], E['atTrader'], 0.3)
for t, p in [(50.0, 1.0), (51.1, 1.3), (52.7, 0.85), (56.0, 1.15), (58.6, 1.0), (62.9, 1.2), (80.6, 0.8), (85.0, 1.4), (85.6, 1.3), (86.3, 1.5)]: put(s_blorp(p), t, 0.6, 0.3)
put(s_click(), E['tradeOpen'], .8); put(s_click(), E['tradeDone'] - 0.2, .8); put(s_ding(), E['tradeDone'], 0.6)
put(s_boing(0.4), E['bombDrop'] + 0.3, 0.5); put(s_boing(0.3), E['bombDrop'] + 0.7, 0.35)
put(s_boom(3.0, 1.2), E['boom'], 1.3); put(s_clatter(2.5, 40), E['boom'] + 0.6, 0.9); put(s_glass_break(), E['boom'] + 0.1, 0.5)
put(s_whoosh(1.0, 200, 2000), E['stare'] - 0.05, 0.5)
steps(E['flee'], 90, 0.18)
steps(93, 100.4, 0.3); steps(100.6, 112.4, 0.32, 0.5); steps(112.6, 116.6, 0.32, 0.5)
for t in np.arange(101.5, 123, 2.7): put(s_drip(), t + rs.uniform(0, 1), 0.6, rs.uniform(-.7, .7))
for t in np.arange(112.6, 122.5, 0.35): put(s_bell(rs.uniform(2500, 4000), 0.3, 0.07), t, 0.6, rs.uniform(-.6, .6))
put(s_whoosh(1.4, 1500, 7000), E['bugsLeave'], 0.5)
put(s_growl(1.5, 60), E['lurk'] - 1.4, 0.7); put(s_screech(1.8), E['lurk'] + 0.1, 1.0)
for t in np.arange(E['chase'], E['exitFlash'], 0.17): put(s_step(), t, 0.7, rs.uniform(-.4, .4))
for t in np.arange(E['chase'] + 0.3, E['exitFlash'], 0.42): put(s_growl(0.3, 50) * 2, t, 0.5)
put(s_screech(1.2), 131.0, 0.6); put(s_whoosh(1.2, 300, 6000), E['exitFlash'] - 0.3, 0.8)
put(s_punch(), E['faceplant'], 1.0); put(s_screech(0.8), 138.6, 0.25)
steps(140, 142.6, 0.32)
for t in np.arange(E['floor'], 171.4, 0.15): put(s_thock(), t, 0.35, rs.uniform(-.5, .5))
put(s_boing(0.9), E['door'], 1.0); put(s_ding(), E['door'] + 0.1, 0.5); put(s_fanfare(), E['proud'] + 0.4, 0.8)
put(s_scratch(), 176.5, 0.45)
steps(191.5, 196, 0.32)
for i in range(6): put(s_growl(1.2, 55), E['spawnMobs'] + i * 0.45, 0.45, (i % 3 - 1) * 0.6); put(s_clatter(0.6, 8, 1200), E['spawnMobs'] + i * 0.45, 0.4)
for t in np.arange(205, 223, 0.62): put(s_gloop(), t + rs.uniform(0, 0.2), 0.35, rs.uniform(-.8, .8))
for t in [205.8, 213.0, 229.6]: put(s_creak(0.9), t, 0.4, 0.5)
for t in [E['swing1'], E['swing2']]: put(s_swish(), t + 0.2, 0.9); put(s_wah(), t + 0.45, 0.6)
put(s_swish(), E['bombThrow'] + 0.1, 0.8); put(s_boing(0.6), E['bombBack'], 1.0); put(s_pop(), E['bombBack'] + 0.7, 0.6)
put(s_boom(1.6, 0.8), E['bombBoom'], 1.0)
put(s_growl(0.8, 80), E['wallBreak'] - 0.7, 0.8); put(s_boom(1.2, 0.6), E['wallBreak'], 0.9); put(s_clatter(1.6, 30), E['wallBreak'] + 0.1, 1.0); put(s_glass_break(), E['wallBreak'] + 0.05, 0.6)
for t in np.arange(E['panic'] + 0.4, E['panicEnd'], 0.2): put(s_thock(), t, 0.55, rs.uniform(-.6, .6))
steps(E['panic'], E['panicEnd'], 0.17)
for t in np.arange(E['panic'], E['hours'], 0.7): put(s_gloop(), t + rs.uniform(0, .3), 0.35, rs.uniform(-.8, .8))
for y in range(8): put(s_thock(), E['pillar'] + y * 0.48, 0.8); put(s_swish(), E['pillar'] + y * 0.48 + 0.05, 0.3)
put(s_whoosh(0.7), E['roofHop'], 0.6); put(s_punch(), E['roofHop'] + 0.7, 0.6)
put(s_gloop(), E['climbFail'], 0.8); put(s_boing(0.6), E['climbFail'] + 0.3, 0.6); put(s_gloop() * 1.5, E['climbFail'] + 1.5, 1.0)
for t in np.arange(251, 268, 1.1): put(s_chirp(), t + rs.uniform(0, .5), 0.8, rs.uniform(-.8, .8)); put(s_chirp(), t + 0.15 + rs.uniform(0, .5), 0.6, rs.uniform(-.8, .8))
for i in range(6): put(s_whoosh(0.8, 200, 1500), E['retreat'] + i * 0.5, 0.35, (i % 3 - 1) * 0.6)
put(s_swish(), E['swingBlock'] + 0.25, 0.7); put(s_pop(), E['breakBlock'], 1.0); put(s_crack() * 0.5, E['breakBlock'], 0.6)
put(s_creak(2.4), E['creak'], 1.0); put(s_creak(1.4), E['creak'] + 1.2, 0.7)
put(s_rumble(5.0), E['collapse'], 1.2); put(s_boom(2.0, 0.6), E['collapse'] + 1.4, 0.7); put(s_glass_break(1.4), E['collapse'] + 0.5, 0.7)
put(s_whoosh(1.0, 200, 1200), E['collapse'] + 0.2, 0.6); put(s_punch(), E['heroLand'], 1.0); put(s_clatter(1.0, 10), E['heroLand'], 0.5)
put(s_bonk(), E['bonkHead'], 1.0); put(s_bell(1400, 0.8, 0.3), E['bonkHead'] + 0.05, 0.6)
put(s_scratch(), E['freeze'] - 0.1, 1.0)
put(s_whoosh(0.8, 300, 6000), E['logo'] - 0.3, 0.8)
for i in range(9): put(s_thock(), E['logo'] + 0.2 + i * 0.12 + 0.3, 0.5)
put(s_click(), 296.2, 1.0); put(s_ding(), 296.3, 0.6)

# ---------------------------------------------------------------- narration with overlap shifting
cues = json.load(open('build/cues.json'))
voice = np.zeros(N); prev_end = 0
for c in cues:
    x, sr = sf.read(c['file']); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    st = max(c['start'], prev_end + 0.08); c['start'] = round(st, 3); c['end'] = round(st + len(x) / SR, 3); prev_end = c['end']
    i = int(st * SR); voice[i:i + len(x)] += x[:N - i]
json.dump(cues, open('build/cues.json', 'w'), indent=1)
voice = voice / (np.abs(voice).max() + 1e-9) * 0.95
# envelope per frame and ducking
hop = SR // FPS; nf = int(DUR * FPS)
rms = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(nf)])
envf = np.clip(rms / (np.percentile(rms[rms > 0.005], 90) + 1e-9), 0, 1)
json.dump([round(float(v), 3) for v in envf], open('build/env.json', 'w'))
duck = np.repeat(np.convolve(envf > 0.06, np.ones(8) / 8, 'same'), hop)[:N]; duck = np.pad(duck, (0, N - len(duck)))
music *= (1 - 0.55 * duck)
fin = np.minimum(1, (N - np.arange(N)) / (SR * 0.7))
L = (mixL * 0.55 + music * 0.6 + voice * 1.0) * fin; R = (mixR * 0.55 + music * 0.6 + voice * 1.0) * fin
st = np.stack([L, R], 1); st = np.tanh(st / (np.abs(st).max() * 0.9) * 1.2) * 0.92
sf.write('build/audio.wav', st.astype(np.float32), SR, subtype='PCM_16')
print('audio ok', st.shape, 'cues', len(cues), 'last end', cues[-1]['end'])
