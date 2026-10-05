# Daily Shardwild episode — instructions for the scheduled routine

Work only on branch `claude/voxel-survival-letsplay-k76okk` of `susduolingo997-arch/private`. Commit + push there; never open PRs. Be frugal: one writing pass, one stills check, no long explanations.

## 0. Get the repo (fresh session)
If the repo is not already in the working directory: `git clone https://github.com/susduolingo997-arch/private && cd private && git checkout claude/voxel-survival-letsplay-k76okk`.
If cloning/pushing is refused, call the `add_repo` tool (claude-code-remote) for susduolingo997-arch/private with access "push", then retry. If it still fails, stop and report.

## 1. Guards (stop early, cheaply)
- For EVERY `letsplay/epK/` that has a `scene.js` but no committed `shardwild_epK_web.mp4` (oldest first): trigger its cloud render (step 5). If you finished any, stop there — do not also start a new episode in the same run.
- If the last commit touching `letsplay/ep*/` is from today (Europe/Berlin), stop: today's episode already exists.

## 2. Setup
`npm i three playwright-core` at repo root if `node_modules` is missing. `pip install numpy pillow soundfile kokoro-onnx`.
Download into the scratchpad: `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx` → `kokoro.onnx`, `.../voices-v1.0.bin` → `voices.bin`.
Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (render.mjs already uses it).

## 3. Write episode N+1 (copy the pattern of epN exactly)
Read the end card in `letsplay/epN/scene.js` (`outlined(i ? 'EP ...'`) — that is the teased episode to make. Cast: the hero (orange hoodie, captain hat + crystal crown), Bloop the Burble builder (hard hat, invoices), Leggy the friendly Hexapede. Each episode: an adventure in the teased place that goes comically wrong (**Episode 7 onward: NO house-building / "I live in X" premise** — instead a quest, expedition, race, rescue, treasure hunt, contest, job or mystery; Ep 7 "THE ICEBERG (it melts)" = e.g. an ice-fishing contest or treasure hunt on an iceberg that melts out from under them, never building a home there; Bloop can still build gadgets/vehicles, not houses; tease Ep 8 as another non-house adventure), ends with a `yep. it ___.` freeze-frame (≈285.6s), the logo (292.5s) and an end card teasing the next episode. Keep everything original (no Minecraft characters, textures, sounds or UI).
- `events.json`: copy epN's dummy 9999 keys, add the new beats.
- `narration.py`: ~50 lines across 0–292s, voice `am_puck`, energetic YouTuber style.
- `bodyN.js`: new scene group(s) reusing helpers (makeHero/pose, mkBurble/hardHat/poseBurble, makeLurk/poseLurk, makeBird, VSet, burst, camKeys, parentTo, walker, track).
- `scene.js`: epN's scene.js head (before its body) + new body + epN's compositor tail, replacing SECS, sky(), HUD hpv/slots, TOASTS/FEATS/POPS/ZOOMS/SHAKES/FLASH, panic windows, title card text, freeze texts and the end-card teaser. Assemble with a small Python script that asserts every replacement matched once.
- `audio.py`: modeled on epN's (exec the library part of `../audio.py`, new music/SFX timeline, `exec(MIX)`).
- copy `../index.html`.

## 3a. Planned episodes (user requests — these override the end-card teaser)
- **Episode 7**: its end card must tease Episode 8 as something like `EP 8: BLOOP QUITS?!` / `(pay the invoice)`.
- **Episode 8 — "Bloop Quits?!"**: Bloop finally demands payment for ALL his invoices (the 2-page one included) or he quits for good. The episode is the hero's frantic attempt to raise the money (side hustles, selling stuff, schemes that go wrong; Leggy helps in her own way). Bloop gets the spotlight: show his side, his hard hat, his pile of invoices, maybe a job offer from someone else. Must still end with a comedic disaster + freeze-frame, and a heartfelt-but-funny resolution with Bloop (he stays — or does he?). The invoice is the episode's main thread, so the "max one old callback" rule does not apply to invoices here.
- **Episode 8**: its end card must tease Episode 9 as something like `EP 9: THE RIVAL` / `(he's better at this)`.
- **Episode 9 — "The Rival"**: a rival YouTuber (original character: own look, own facecam overlay style, smug catchphrase, perfect hair) moves in next door and builds a flawless house in record time while streaming. The hero tries to out-build, out-stream and out-cool him; everything backfires. Bloop and Leggy are tempted by the rival (he pays on time!). Twist/payoff: the rival's perfect build has its own comedic disaster too, or the two end up teaming up. Show split-screen/dueling facecams. Still ends with a freeze-frame + end card teasing Episode 10.

## 3b. Quality bar (Episode 6 onward — make each episode better than the last)
- **Story**: 3 acts with a real twist in the middle, not just "build → disaster". Give Bloop and Leggy their own mini-plot (a goal, a reaction, a payoff), not just standing around.
- **Fresh jokes**: at most ONE callback to an old running gag (invoice, sandwich, support block). Invent 3+ new gags specific to this episode's setting.
- **At least 2 distinct locations/sets** (e.g. travel → destination, or outside → inside) with different sky/lighting moods.
- **A new creature or NPC** designed for this episode (blocky, original, expressive), plus one new prop/mechanic that drives the plot.
- **Camera**: vary shots — establishing wide, over-the-shoulder, low angle, a tracking shot, a dramatic push-in. No shot longer than ~8 s without camera motion. Check stills specifically for clipping, characters off-screen or blocked, and too-dark frames.
- **Pacing**: an action beat or visual gag at least every ~15 s; quiet moments only right before a payoff.
- **Narration**: vary energy (whisper → shout), include 2–3 lines of direct talk to the viewer/chat, avoid repeating the previous episode's catchphrases.
- **Audio**: a distinct musical theme for the new setting and at least 5 new sound effects made for this episode's events.

## 4. Quick check (keep it FAST — GitHub Actions does narration, audio and the real render)
- Do NOT run narration.py / audio.py locally (CI regenerates them). For stills use placeholder data:
  `echo '[]' > build/cues.json; python3 -c "import json;json.dump([0]*7200,open('build/env.json','w'))"`
- ONE batch of ~12 stills (`PAGE=letsplay/epX/index.html node ../render.mjs --stills ...` from the episode dir), one contact sheet (`../sheet.py`), fix obvious problems once, no second stills pass unless something was badly broken.
- Only sanity-check narration.py by running `python3 -c "import ast;ast.parse(open('narration.py').read())"` and checking line times are increasing and end before 292 s.
- Write files in as few tool calls as possible (one Write per file); don't re-read files you just wrote.
- Delete build/stills and sheets before committing.

## 4b. Before pushing
Check the episode dir contains ALL of: events.json, narration.py, audio.py, scene.js, index.html, RENDER. A missing audio.py makes the cloud render fail.
Smoke-test audio.py (it crashed Ep 9's render once): with the placeholder `build/cues.json` (`[]`) run `python3 audio.py`; it must get through all music/SFX and only fail inside the narration mixer (IndexError on empty cues). Any error in the episode's own lines must be fixed. Never add two sound arrays of different lengths with `+` — pad/mix them first.

## 5. Render + publish in the cloud (do NOT render the full video locally)
Rendering runs on GitHub Actions (`.github/workflows/render.yml`), so the session can end early and container restarts don't matter.
Create `letsplay/epX/RENDER` (any content), add `letsplay/epX/build/` to `.gitignore`, commit the episode code + RENDER file and push.
The workflow regenerates narration + audio, renders in 6 parallel jobs and publishes release `vX.0` by itself (~1–2 h). Do not wait for it.
For unfinished older episodes (guard in step 1): just make sure `letsplay/epK/RENDER` exists; if it already exists and release vK.0 is missing, append a line to it and push to re-trigger.
Finish with a 3-line summary and `https://github.com/susduolingo997-arch/private/releases/tag/vX.0` (will appear when the workflow finishes).
