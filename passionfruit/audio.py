"""Passionfruit Event soundtrack: multi-voice narration + generated launch-film music + SFX, all from event.json/timeline.
Usage: python3 audio.py eventN   (after narration.py). Writes eventN/build/audio.wav and env.json (mouth envelope per frame).
Synth helpers adapted from ../letsplay/audio.py."""
import sys, json, numpy as np, soundfile as sf

D = sys.argv[1].rstrip('/')
EV = json.load(open(f'{D}/event.json')); TL = json.load(open(f'{D}/build/timeline.json')); CUES = TL['cues']
SR = 44100; DUR = TL['duration']; N = int(SR * DUR); FPS = TL['fps']
rs = np.random.RandomState(EV.get('number', 1))

def T(sec): return np.arange(int(SR * sec)) / SR
def env_ad(n, a=0.005, d=0.2): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def osc(f, sec, wave='sine'):
    t = T(sec); f = np.broadcast_to(f, t.shape) if np.ndim(f) else np.full(t.shape, f); ph = 2 * np.pi * np.cumsum(f) / SR
    if wave == 'sine': return np.sin(ph)
    if wave == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    return 2 * ((ph / (2 * np.pi)) % 1) - 1
def lp(x, cut): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / cut) ** 4); return np.fft.irfft(X, len(x))
def bp(x, lo, hi): X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= (1 / (1 + (f / hi) ** 4)) * (1 / (1 + (lo / np.maximum(f, 1)) ** 4)); return np.fft.irfft(X, len(x))
def noise(sec): return rs.uniform(-1, 1, int(SR * sec))
def sweep(f0, f1, sec): t = T(sec) / sec; return f0 * (f1 / f0) ** t
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def fade(x, a=0.3, b=0.3): n = len(x); i = np.arange(n); return x * np.minimum(1, np.minimum(i / (SR * a + 1), (n - i) / (SR * b + 1)))

# ---------------------------------------------------------------- SFX
def s_bell(f, d=1.2, a=0.4): x = sum(osc(f * h, d) * w for h, w in [(1, 1), (2.76, .35), (5.4, .15)]); return x * env_ad(len(x), 0.002, d / 4) * a
def s_whoosh(d=1.0, lo=250, hi=4000): x = bp(noise(d), lo, hi); t = np.linspace(0, 1, len(x)); return x * np.sin(np.pi * t) ** 2 * 0.6
def s_riser(d=2.5): x = noise(d); t = np.linspace(0, 1, len(x)); return bp(x, 400, 6000) * t ** 2.5 * 0.5 + osc(sweep(80, 320, d), d) * t ** 3 * 0.2
def s_hit(): d = 3.0; n = int(SR * d); return osc(sweep(70, 38, d), d) * env_ad(n, 0.004, 0.5) * 1.1 + lp(noise(d), 1200) * env_ad(n, 0.002, 0.35) * 0.5
def s_shimmer(d=2.0):
    x = np.zeros(int(SR * d))
    for k in range(18): b = s_bell(rs.uniform(2000, 5500), 0.6, 0.06); s = rs.randint(0, len(x) - len(b)); x[s:s + len(b)] += b
    return x
def s_chime(): x = np.zeros(int(SR * 1.6)); [x.__setitem__(slice(int(SR * i * .14), int(SR * i * .14) + int(SR * 1.2)), x[int(SR * i * .14):int(SR * i * .14) + int(SR * 1.2)] + s_bell(mtof(m), 1.2, .3)) for i, m in enumerate([79, 84])]; return x
def s_click(): d = 0.05; return bp(noise(d), 1500, 6000) * env_ad(int(SR * d), 0.0005, 0.006)
def s_whir(d=1.2): t = T(d); return bp(osc(300 + 200 * np.sin(np.pi * t / d), d, 'saw'), 300, 2500) * np.sin(np.pi * t / d) * 0.25
def s_servo(): d = 0.9; t = T(d); return bp(osc(420 + 160 * np.sin(np.pi * t / d), d, 'saw'), 400, 3000) * np.sin(np.pi * t / d) ** 2 * 0.18
def s_chirp(): d = 0.12; return osc(sweep(2800, 4300, d), d) * env_ad(int(SR * d), 0.005, 0.03) * 0.2
def s_sting():
    x = np.zeros(int(SR * 4))
    for m in [48, 55, 60, 64, 67, 72, 76]: x += osc(mtof(m), 4, 'tri') * env_ad(len(x), 0.01, 1.4) * 0.12
    h = s_hit(); sh = s_shimmer(2.0); x = lp(x, 3000); x[:len(h)] += h * 0.8; x[:len(sh)] += sh; return x

# ---------------------------------------------------------------- buffers
mixL = np.zeros(N, np.float32); mixR = np.zeros(N, np.float32); music = np.zeros(N, np.float32)
def put(x, t, g=1.0, pan=0.0, buf=None):
    i = int(t * SR); x = x[:max(0, (N if buf is None else len(buf)) - i)]
    if i < 0 or len(x) == 0: return
    if buf is not None: buf[i:i + len(x)] += x * g; return
    mixL[i:i + len(x)] += x * g * np.sqrt((1 - pan) / 2) * 1.414; mixR[i:i + len(x)] += x * g * np.sqrt((1 + pan) / 2) * 1.414

# ---------------------------------------------------------------- music: one generated cue per segment, mood by location
MOODS = dict(campus=(104, 60, 'uplift'), lab=(96, 62, 'minimal'), robotlab=(118, 57, 'pulse'), rooftop=(92, 65, 'warm'),
             park=(88, 67, 'gentle'), theater=(80, 60, 'piano'), studio=(70, 50, 'dark'))
PROGS = dict(uplift=[(0, 'M'), (7, 'M'), (9, 'm'), (5, 'M')], minimal=[(0, 'M'), (5, 'M'), (9, 'm'), (7, 'M')], pulse=[(0, 'm'), (8, 'M'), (3, 'M'), (10, 'M')],
             warm=[(0, 'M'), (9, 'm'), (5, 'M'), (7, 'M')], gentle=[(0, 'M'), (4, 'm'), (5, 'M'), (7, 'M')], piano=[(0, 'M'), (5, 'M'), (9, 'm'), (7, 'M')], dark=[(0, 'm'), (8, 'M'), (5, 'm'), (7, 'M')])
def note(m, d, kind='pluck', a=0.2):
    if kind == 'piano': x = sum(osc(mtof(m) * h, d) * w for h, w in [(1, 1), (2, .4), (3, .15), (4, .08)]); return x * env_ad(len(x), 0.003, d / 3) * a
    x = osc(mtof(m), d) + 0.3 * osc(mtof(m) * 2, d, 'tri'); return x * env_ad(len(x), 0.004, d / 4) * a
def kick(): d = 0.3; return osc(sweep(120, 42, d), d) * env_ad(int(SR * d), 0.002, 0.08)
def clap(): d = 0.2; return bp(noise(d), 900, 5000) * env_ad(int(SR * d), 0.002, 0.04) * 0.6
def shaker(): d = 0.05; return bp(noise(d), 5000, 12000) * env_ad(int(SR * d), 0.002, 0.012) * 0.4
def cue(t0, t1, bpm, root, style, gain=0.35, seed=1):
    r = np.random.RandomState(seed); L = t1 - t0; buf = np.zeros(int(SR * L) + SR, np.float32); beat = 60 / bpm; bar = 4 * beat; prog = PROGS[style]
    pk = 'piano' if style in ('piano', 'gentle') else 'pluck'; b = 0; t = 0.0
    while t < L:
        rt, q = prog[b % 4]; ch = [root + rt, root + rt + (3 if q == 'm' else 4), root + rt + 7]
        bl = min(bar, L - t + 0.5); p = sum(osc(mtof(m - 12) * dt, bl, 'tri') for m in ch for dt in (0.997, 1.003)) / 6
        put(fade(lp(p, 900 if style != 'dark' else 500), 0.4, 0.4) * (0.5 if style != 'dark' else 0.8), t, 1, buf=buf)
        put(osc(mtof(root + rt - 24), bl) * env_ad(int(SR * bl), 0.01, bar) * 0.35, t, 1, buf=buf)
        steps = 16 if style == 'pulse' else 8; pat = [0, 1, 2, 1, 0, 2, 1, 2] if style != 'piano' else [0, 1, 2, 3, 2, 1, 0, 1]
        if style != 'dark':
            for s in range(steps):
                ts = t + s * bar / steps
                if ts >= L: break
                if style in ('piano', 'gentle', 'warm') and r.rand() < 0.25: continue
                m = (ch + [ch[0] + 12])[pat[s % 8] % 4] + 12; put(note(m, beat * 0.9, pk, 0.13 if pk == 'pluck' else 0.1), ts, 1, buf=buf)
        else:
            if r.rand() < 0.6: put(s_bell(mtof(ch[r.randint(3)] + 24), 2.0, 0.08), t + r.choice([0, 1, 2]) * beat, 1, buf=buf)
        if style in ('uplift', 'pulse', 'minimal') and b >= 2:
            for k in range(4):
                put(kick() * 0.5, t + k * beat, 1, buf=buf)
                if style != 'minimal' and k % 2: put(clap() * 0.4, t + k * beat, 1, buf=buf)
            if style != 'minimal':
                for k in range(16): put(shaker() * (0.5 if k % 2 else 0.25), t + k * beat / 4, 1, buf=buf)
        t += bar; b += 1
    put(fade(buf[:int(SR * L)], 1.5, 1.2), t0, gain, buf=music)

segs = {}
for s in TL['shots']: segs.setdefault(s['si'], [s['start'], s['end']])[1] = s['end']
for si, (a, b) in segs.items():
    loc = EV['segments'][si].get('location', 'studio'); bpm, root, style = MOODS.get(loc, MOODS['campus'])
    style = EV['segments'][si].get('music', style); cue(a, b + 0.8, bpm, root + (si % 3) - 1, style, 0.32, seed=si + 7)
    if si: put(s_whoosh(1.1, 300, 5000), a - 0.65, 0.55)

# ---------------------------------------------------------------- SFX per shot
ONE_MORE = []
for s in TL['shots']:
    a, b, k = s['start'], s['end'], s['shot']; loc = EV['segments'][s['si']].get('location')
    if k == 'flyover': put(fade(lp(noise(b - a), 500), 2, 2) * 0.35, a)
    elif k == 'hero': put(s_riser(2.5), a + 0.2, 0.7); put(s_hit(), a + 2.7, 0.9); put(s_shimmer(2.5), a + 2.7, 0.8)
    elif k == 'tagline': put(s_hit(), a + 0.1, 0.55); put(s_shimmer(1.5), a + 0.15, 0.5)
    elif k in ('spin', 'macro', 'lineup'): put(s_whoosh(1.4, 200, 2500), a, 0.35)
    elif k == 'explode':
        L = b - a; put(s_whir(L * 0.4), a + L * 0.15, 0.6)
        for i in range(8): put(s_click(), a + L * (0.15 + 0.05 * i), 0.5, rs.uniform(-.5, .5))
    elif k == 'price': put(s_chime(), a + 0.3, 0.5)
    elif k == 'title': put(s_whoosh(0.8, 500, 7000), a, 0.4)
    elif k in ('logo', 'end'): put(s_sting(), a + 0.3, 0.75)
    elif k == 'onemore': ONE_MORE.append((a, b)); put(note(43, 4, 'piano', 0.5), a + 1.0, 1.0)
    if k in ('talk', 'walk', 'wide', 'close', 'two', 'demo', 'table'):
        t = a
        while t < b:
            if loc in ('park', 'campus'): put(s_chirp(), t + rs.uniform(0, 2), 0.25, rs.uniform(-.8, .8))
            if loc == 'robotlab': put(s_servo(), t + rs.uniform(0, 2), 0.35, rs.uniform(-.8, .8))
            t += 2.5
        if loc == 'rooftop': put(fade(lp(noise(b - a), 350), 0.5, 0.5) * 0.25, a)
for a, b in ONE_MORE:  # silence the music for "one more thing"
    i, j = int(a * SR), int(b * SR); e = np.ones(j - i, np.float32); r = min(int(SR * 0.6), len(e) // 2); e[:r] = np.linspace(1, 0, r); e[r:] = 0; music[i:j] *= e

# ---------------------------------------------------------------- narration (one file per line, each line already timed by narration.py)
voice = np.zeros(N, np.float32)
for c in CUES:
    x, sr = sf.read(c['file']); x = x if x.ndim == 1 else x.mean(1)
    if sr != SR: x = np.interp(np.arange(int(len(x) * SR / sr)) * sr / SR, np.arange(len(x)), x)
    x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.11; i = int(c['start'] * SR); voice[i:i + len(x)] += x[:N - i]
voice = np.clip(voice, -0.98, 0.98)
hop = SR // FPS; nf = int(DUR * FPS)
rms = np.sqrt(np.mean(np.pad(voice, (0, max(0, nf * hop - N)))[:nf * hop].reshape(nf, hop) ** 2, axis=1))
envf = np.clip(rms / (np.percentile(rms[rms > 0.005], 90) + 1e-9), 0, 1) if (rms > 0.005).any() else rms
json.dump([round(float(v), 2) for v in envf], open(f'{D}/build/env.json', 'w'))
duck = np.repeat(np.convolve(envf > 0.06, np.ones(12) / 12, 'same'), hop)[:N]; duck = np.pad(duck, (0, N - len(duck)))
music *= (1 - 0.5 * duck).astype(np.float32)
fin = np.minimum(1, (N - np.arange(N)) / (SR * 1.5)).astype(np.float32)
L = (mixL * 0.6 + music * 0.7 + voice) * fin; R = (mixR * 0.6 + music * 0.7 + voice) * fin
st = np.stack([L, R], 1); st = np.tanh(st / (np.abs(st).max() * 0.9) * 1.1) * 0.92
sf.write(f'{D}/build/audio.wav', st.astype(np.float32), SR, subtype='PCM_16')
print('audio ok %.1fs, %d lines' % (DUR, len(CUES)))
