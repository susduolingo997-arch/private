# PASSIONFRUIT EVENT

A daily, fully generated parody of a pre-recorded tech launch film by **Passionfruit**, a fictional company
(original characters, products, logo and typography — any resemblance to real launch films is the joke).

- `engine.js` — the whole film engine (Three.js, deterministic `window.renderAt(t)`): 7 sets (campus with the round
  glass building, design lab, robot test lab, rooftop, park, empty theater, dark product studio), blocky presenter rig
  with lip-sync, parametric product generator, camera moves (drone flyover, walk-and-talk, orbit/spin, macro, exploded
  view, push-ins, fly-through transitions), taglines, price cards, lower-thirds, subtitles.
- `narration.py` — Kokoro TTS with one voice per presenter; lays out the timeline, so the film length comes from the script.
- `audio.py` — generated launch-film music per location, SFX per shot, voice mix + mouth envelope.
- `eventN/event.json` — **one data file per event** (cast, products, segments → beats). See `DAILY_EVENT.md` for the format.
- `eventN/RENDER` — pushing it renders the event on GitHub Actions and publishes release `pf-N.0`.

Local preview: `python3 narration.py event1 --estimate`, then from `event1/`:
`PAGE="passionfruit/index.html?ev=1" node ../../letsplay/render.mjs --stills 10,60,120` (→ `build/stills/`).

Fonts: Inter (SIL Open Font License, see `fonts/LICENSE-OFL.txt`).
