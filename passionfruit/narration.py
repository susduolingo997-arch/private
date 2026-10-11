"""Passionfruit Event narration + timeline.
Usage: python3 narration.py eventN <kokoro-dir>     (real TTS, one Kokoro voice per presenter / per line)
       python3 narration.py eventN --estimate      (no TTS: estimated line lengths, for quick stills)
Writes eventN/build/timeline.json (every shot with start/end; total duration comes from the speech),
eventN/build/cues.json and eventN/build/vo/*.wav."""
import sys, os, json

FPS = 30
# default length of a beat that has no speech (seconds)
DEF = dict(flyover=14, wide=5, talk=4, close=4, walk=5, two=4, demo=5, table=5, spin=7, hero=7, explode=8, macro=5,
           lineup=7, tagline=4.5, price=4.5, title=3.5, logo=6, onemore=5, end=12)

def plan(ev, synth):
    t, shots, cues = 0.0, [], []
    for si, seg in enumerate(ev['segments']):
        pres = seg.get('presenters') or []
        for bi, b in enumerate(seg['beats']):
            shot = b.get('shot') or ('talk' if b.get('say') else 'wide')
            who = b.get('who') or (pres[0] if pres else None)
            lead = (0.9 if bi == 0 else 0.3) + b.get('pause', 0)
            sp = 0
            if b.get('say'):
                c = ev['cast'][who]
                voice = b.get('voice') or c['voice']; speed = b.get('speed', c.get('speed', 1.0))
                dur, f = synth(len(cues), b['say'], voice, speed)
                cues.append(dict(start=round(t + lead, 3), end=round(t + lead + dur, 3), who=who, text=b['say'], file=f, shot=len(shots)))
                sp = lead + dur + b.get('hold', 0.45)
            d = max(b.get('dur', 0 if b.get('say') else DEF.get(shot, 4)), sp)
            shots.append(dict(si=si, bi=bi, shot=shot, who=who, start=round(t, 3), end=round(t + d, 3)))
            t += d
    return dict(fps=FPS, duration=round(t + 0.5, 3), shots=shots, cues=cues)

if __name__ == '__main__':
    evdir = sys.argv[1].rstrip('/'); ev = json.load(open(f'{evdir}/event.json'))
    os.makedirs(f'{evdir}/build/vo', exist_ok=True)
    if sys.argv[2] == '--estimate':
        def synth(i, txt, voice, speed): return len(txt.split()) / 2.95 / speed + 0.25, None
    else:
        import soundfile as sf
        from kokoro_onnx import Kokoro
        k = Kokoro(sys.argv[2] + '/kokoro.onnx', sys.argv[2] + '/voices.bin')
        def synth(i, txt, voice, speed):
            s, sr = k.create(txt, voice=voice, speed=speed, lang='en-gb' if voice[0] == 'b' else 'en-us')
            f = f'{evdir}/build/vo/{i:04d}.wav'; sf.write(f, s, sr); return len(s) / sr, f
    tl = plan(ev, synth)
    json.dump(tl, open(f'{evdir}/build/timeline.json', 'w'), indent=0)
    json.dump(tl['cues'], open(f'{evdir}/build/cues.json', 'w'), indent=0)
    print('timeline ok: %d shots, %d lines, %.1f min' % (len(tl['shots']), len(tl['cues']), tl['duration'] / 60))
