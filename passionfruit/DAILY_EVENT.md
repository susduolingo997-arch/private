# Daily Passionfruit Event — instructions for the nightly routine

Work only on branch `claude/voxel-survival-letsplay-k76okk` of `susduolingo997-arch/private`. Commit + push there; never open PRs.
**Your whole job is ONE new data file: `passionfruit/eventN/event.json` (+ an empty `RENDER` file).** No code changes, no new scripts.
Be frugal: one writing pass, one small stills check, no full render, no long explanations.

## 0. Get the repo (fresh session)
If the repo isn't in the working directory: `git clone https://github.com/susduolingo997-arch/private && cd private && git checkout claude/voxel-survival-letsplay-k76okk`.
If cloning/pushing is refused, call `add_repo` (claude-code-remote) for susduolingo997-arch/private with access "push", then retry. If it still fails, stop and report.

## 1. Guards (stop early, cheaply)
- N = highest existing `passionfruit/eventK/` + 1.
- If the last commit touching `passionfruit/event*/` is from today (Europe/Berlin), stop: today's event exists.
- If an older `passionfruit/eventK/RENDER` exists but release `pf-K.0` is missing and no render run is in progress, append a line to that RENDER file, push, and stop (that re-triggers it). Do not write a new event in the same run.

## 2. Read (briefly)
- `passionfruit/event1/event.json` — the reference for format and tone.
- The previous event's `event.json` (titles, products, gags) so you can do callbacks and avoid repeats.
- This file's reference section below. Do NOT read engine.js unless something is broken.

## 3. Write `passionfruit/eventN/event.json`
The film is a deadpan parody of a modern **pre-recorded** tech launch film by the fictional company Passionfruit. No audience, no applause, no ad breaks.
- **Length 20–30 min.** Duration is computed from the narration: aim for **2,300–3,200 spoken words** in ~120–170 beats, ~20–28 segments. Check with the estimate in step 4 and add/trim until 21–29 min.
- **Structure**: open with a `flyover` (campus at sunrise, `text`/`sub` overlay), CEO intro, then alternate *presenter segment in a location* → *studio beauty segment for the product* (hero/spin/macro/explode/lineup/tagline/price). End with `onemore` → a surprise product → closing on campus → `end` card (its `sub` is fine print).
- **Fresh absurd products every day** (5–8 + the one-more-thing). Over-serious speeches about ridiculous features, said with a straight face. Callbacks to earlier events are welcome (the very thin phone that can't be found, Pip agreeing, the helium laptop, Pebble doing nothing…) — max 3 per event.
- **Vary**: use at least 5 different locations, rotate who presents, use walk-and-talk (`"walk": true`) in 2–4 segments, mix shot types, ~1 tagline per product.
- **ORIGINAL ONLY**: no real company names, product names, people, slogans or logos (no "Mac", "Pro Max", "AirPods", "Siri", etc.). Use the fruit vocabulary: Pulp, Rind, Pith, Seed(s), Nectar, Zest, Juice.
- Cast: reuse event 1's cast (same ids/looks/voices) so presenters stay recognizable; you may add 1 new presenter per event (new id, `look`, unused Kokoro voice).
- Keep lines ≤ ~40 words; one idea per beat; jokes land at the END of a line.

## 4. Quick validation (FAST — CI does narration, audio and the real render)
From `passionfruit/` (needs `npm i three playwright-core` at repo root if `node_modules` is missing):
```
python3 -c "import json;json.load(open('eventN/event.json'))"              # valid JSON
python3 narration.py eventN --estimate                                      # prints shots / lines / minutes — must be 21–29 min
cd eventN && PAGE="passionfruit/index.html?ev=N" node ../../letsplay/render.mjs --stills T1,T2,...   # ~9 times, one per segment type
python3 ../sheet.py /tmp/sheet.jpg && rm -rf build                          # look at the sheet once
```
Pick the still times from `eventN/build/timeline.json` (mid-points of a few shots incl. a demo, a table, a lineup, a price and a tagline). Fix only obvious problems (product unreadable, text overlapping, unknown product id → page error). **No second stills pass, no video render.**
Common errors: a beat with `"product"` that isn't in `products`; `who` that isn't in `cast`; a `walk` segment in `studio`; `say` on a card shot (`title`/`onemore` should use `dur`).

## 5. Commit, push, render in the cloud
`touch passionfruit/eventN/RENDER`; make sure `passionfruit/eventN/build/` is not committed (it's gitignored); commit `event.json` + `RENDER` ("Passionfruit Event N: <title>"), push.
GitHub Actions (`.github/workflows/render.yml`) regenerates narration + audio, renders 20 parts in parallel and publishes release `pf-N.0` titled "PASSIONFRUIT Event N — <title>" (~1–3 h). Don't wait for it.
Finish with a 3-line summary and `https://github.com/susduolingo997-arch/private/releases/tag/pf-N.0`.

---
## Reference: event.json
```jsonc
{
  "number": 2, "title": "Short Title", "date": "October 13",
  "subtitles": true,                         // burned-in subtitles (default true)
  "cast": { "<id>": { "name": "...", "title": "...", "voice": "<kokoro voice>", "speed": 1.0,
                      "offscreen": false,    // true = narrator only (no body), e.g. "vo"
                      "look": { "style": "turtleneck|blazer|labcoat|hoodie|vest|tee", "outfit": "#hex", "shirt": "#hex", "pants": "#hex",
                                "shoes": "#hex", "accent": "#hex", "hair": "short|bald|buzz|bun|long|bob|quiff|curly", "hairColor": "#hex",
                                "skin": "#hex", "glasses": "round|square|gold", "beard": true, "nervous": true, "height": 1.0 } } },
  "products": { "<id>": { "name": "...", "price": "$99", "fine": "fine print on the price card",
      "kind": "phone|tablet|watch|laptop|earbuds|slab|cube|card|custom",
      "shape": "orb|pebble|stick|cylinder|pyramid|donut|egg|fruit|cone",   // for kind custom
      "size": 1, "thickness": 1, "w": 1, "h": 1, "d": 1,                   // multipliers / overrides
      "color": "#hex", "material": "aluminum|titanium|chrome|gold|glass|ceramic|matte|rubber|fabric|wood",
      "accent": "#hex", "band": "#hex", "glow": "#hex", "buttonColor": "#hex", "open": 110,
      "screen": ["#top", "#bottom"], "screenText": "6:15",
      "features": ["camera:N", "notch", "eyes", "screen", "legs:N", "antenna", "handle", "propeller", "wheels", "glow", "button",
                   "crown", "fins", "halo", "tail", "spout", "strap"],
      "colors": ["#hex", ...],               // for "lineup" of one product
      "handSize": 0.13 } },                   // size when held / on a pedestal
  "segments": [ { "location": "campus|lab|robotlab|rooftop|park|theater|studio",
      "presenters": ["ceo", "design"],       // who is on set (first = default speaker)
      "walk": false, "walkStart": 0,         // walk-and-talk along the set's path for the whole segment
      "screen": "text on the theater screen", "music": "uplift|minimal|pulse|warm|gentle|piano|dark",
      "beats": [ { "shot": "...", "say": "spoken line", "who": "<cast id>", "voice": "override", "speed": 1.0,
                   "product": "<id>", "products": ["<id>", ...], "text": "overlay / tagline", "sub": "small line",
                   "dur": 5, "pause": 0, "hold": 0.45, "back": true, "spin": 0 } ] } ]
}
```
Beat length = max(`dur`, speech + gaps); a beat without `say` and `dur` gets a default per shot.

**Shots** — presenter shots (in the segment's location): `wide` (establishing), `talk` (medium, angle rotates automatically), `close`, `walk` (tracking, needs `"walk": true`), `two` (two-shot, needs 2 presenters), `demo` (speaker holds `product`), `table` (`product` on a pedestal beside the speaker).
Product shots (always the dark studio; `say` with `who: "vo"` = voice-over): `hero` (rises out of darkness), `spin` (slow turn + light sweep; `back: true` shows the back), `macro` (extreme close-up), `explode` (exploded view), `lineup` (`products` list, or the product's `colors`), `tagline` (big glowing `text` + `sub`), `price` (name + price + fine print; `text` overrides the price line).
Cards: `flyover` (drone over campus, `text`/`sub`), `title` (chapter card), `onemore` ("One more thing…", music stops), `logo`, `end` (closing logo; `text`, `sub` = fine print).

**Kokoro voices** (one per presenter): am_michael, am_adam, am_liam, am_eric, am_echo, am_onyx, am_puck, am_fenrir, af_heart, af_bella, af_nicole, af_sarah, af_sky, af_nova, af_river, bf_emma, bf_isabella, bf_alice, bf_lily, bm_george, bm_lewis, bm_daniel, bm_fable.
