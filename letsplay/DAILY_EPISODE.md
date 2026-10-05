# Daily Shardwild episode — instructions for the scheduled routine

Work only on branch `claude/voxel-survival-letsplay-k76okk` of `susduolingo997-arch/private`. Commit + push there; never open PRs. Be frugal: one writing pass, one stills check, no long explanations.

## 0. Get the repo (fresh session)
If the repo is not already in the working directory: `git clone https://github.com/susduolingo997-arch/private && cd private && git checkout claude/voxel-survival-letsplay-k76okk`.
If cloning/pushing is refused, call the `add_repo` tool (claude-code-remote) for susduolingo997-arch/private with access "push", then retry. If it still fails, stop and report.

## 1. Guards (stop early, cheaply)
- For EVERY `letsplay/epK/` that has a `scene.js` but no committed `shardwild_epK_web.mp4` (oldest first): finish it (steps 4–6; reuse existing build/vo, build/audio.wav if present) and publish it. If you finished any, stop there — do not also start a new episode in the same run.
- If the last commit touching `letsplay/ep*/` is from today (Europe/Berlin), stop: today's episode already exists.

## 2. Setup
`npm i three playwright-core` at repo root if `node_modules` is missing. `pip install numpy pillow soundfile kokoro-onnx`.
Download into the scratchpad: `https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.int8.onnx` → `kokoro.onnx`, `.../voices-v1.0.bin` → `voices.bin`.
Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (render.mjs already uses it).

## 3. Write episode N+1 (copy the pattern of epN exactly)
Read the end card in `letsplay/epN/scene.js` (`outlined(i ? 'EP ...'`) — that is the teased episode to make. Cast: the hero (orange hoodie, captain hat + crystal crown), Bloop the Burble builder (hard hat, invoices), Leggy the friendly Hexapede. Each episode: they try a new place to live, it goes comically wrong, ends with a `yep. it ___.` freeze-frame (≈285.6s), the logo (292.5s) and an end card teasing the next episode. Keep everything original (no Minecraft characters, textures, sounds or UI).
- `events.json`: copy epN's dummy 9999 keys, add the new beats.
- `narration.py`: ~50 lines across 0–292s, voice `am_puck`, energetic YouTuber style.
- `bodyN.js`: new scene group(s) reusing helpers (makeHero/pose, mkBurble/hardHat/poseBurble, makeLurk/poseLurk, makeBird, VSet, burst, camKeys, parentTo, walker, track).
- `scene.js`: epN's scene.js head (before its body) + new body + epN's compositor tail, replacing SECS, sky(), HUD hpv/slots, TOASTS/FEATS/POPS/ZOOMS/SHAKES/FLASH, panic windows, title card text, freeze texts and the end-card teaser. Assemble with a small Python script that asserts every replacement matched once.
- `audio.py`: modeled on epN's (exec the library part of `../audio.py`, new music/SFX timeline, `exec(MIX)`).
- copy `../index.html`.

## 4. Audio + check
In the episode dir: `python3 narration.py <scratchpad>` then `python3 audio.py`.
Stills: `PAGE=letsplay/epX/index.html node ../render.mjs --stills t1,t2,...` (~16 times), make a contact sheet with `../sheet.py`, look once, fix obvious camera/visibility bugs once. Delete stills/sheets afterwards.

## 5. Render (≈1.5 h)
4 parallel chunks exactly like `letsplay/overnight5.sh`, run in the background, wait for them; concat + mux with `build/audio.wav`; encode `shardwild_epX_web.mp4` at crf 31.

## 6. Publish
Add `rel vX.0 letsplay/epX/shardwild_epX_web.mp4 "Ep X — <title>"` to `.github/workflows/release.yml`, add `letsplay/epX/build/` to `.gitignore`, `git add -f` the web mp4, commit, push (retry with backoff on network errors). The workflow creates the GitHub release.
Finish with a 3-line summary and the release link `https://github.com/susduolingo997-arch/private/releases/tag/vX.0`.
