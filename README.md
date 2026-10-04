# The Long Way Home

A realistic first-person walking game set in **one continuous 3D world**. There are no quests,
missions, enemies, collectibles, maps, minimaps, waypoints or loading screens. Home is far away.
The walking is the game.

This repository contains the first playable vertical slice: roughly **2 km of one seamless world**
(about 25 minutes on foot) from a dirt track in open countryside, past a farm, through forest,
across a river, along a county road, through a village, down a quiet lane to your front door —
built on technology designed to grow to a 50–100 km journey.

## Run it

```bash
npm install
npm run dev        # Vite dev server, http://localhost:5173
npm run build      # production build in dist/
```

Click **Begin walking** (pointer lock + audio start on that click). Headphones recommended.

| Input | Action |
| --- | --- |
| `W A S D` / arrows | walk (no sprint exists — you walk) |
| Mouse | look |
| `Shift` | stroll slowly |
| `E` | open a door · sit on a bench · read a sign · stand up |
| `Esc` | pause + settings (sensitivity, FOV, volumes, graphics, movement feel, time flow) |

The game saves automatically (position, time of day, weather, open doors, traffic) and resumes
where you stopped. Settings are stored separately, so *Start over* never resets your preferences.
The pause menu also has a small "Sky" section (time of day slider, weather presets) for curious
walkers; by default time and weather simply follow the world clock.

## What is in the slice

* **Terrain** – rolling countryside, mountains rising 3–6 km away, gentle gradients; you slow down
  uphill (Tobler's hiking function) and cannot climb cliffs or enter deep water.
* **Places** – dirt track, forest trail, farm (house, barn, silo, tractor, pasture with cattle),
  crop fields (rows, hedgerows, fences, hay bales), woodland, paved county road with markings,
  ditches, power lines, a river with a stone bridge, a village (houses with plots, fences,
  drives, mailboxes, street lamps, shop, church with bell, bus shelter, traffic signal), a lane
  and your home.
* **Interiors** – every house is hollow, furnished and has a working door; so does the village store. (The church is exterior-only for now.)
* **Time** – sun, moon (with phases), stars, soft shadows, twilight colours, lit windows that switch
  on one by one through the evening. 24× by default (a day lasts an hour); 1×–60× in settings.
* **Weather** – clear → partly cloudy → overcast → rain, fog, wind, all gradual and driven by world
  time. Rain wets surfaces (darker, glossier), forms puddles with ripples, reflects the sky,
  swings the trees, thickens the air and changes footsteps and soundscape.
* **Audio** – 100 % procedural Web Audio (no sample files): wind, leaves, birds, insects, crickets,
  rain, river, traffic, power-line hum, distant dogs, human murmur, church bell on the hour,
  surface-dependent footsteps (grass, dirt, gravel, asphalt, wood, field stubble, leaves, water,
  wet variants), door creaks, interior muffling. No background music: a quiet piano phrase
  appears only twice in the whole journey (the bridge, and arriving home).
* **Railway** – a single-track line crosses the county road at a level crossing beyond the village, with a small halt (platform, building, benches, lamps). A passenger train passes every few minutes in alternating directions, sounds its horn, and the crossing bell rings while traffic waits.
* **Life** – villagers on daily routines (commuting to the bus stop, dog walking, gardening,
  shopping, bench sitting, jogging, children playing, farming, road works), background traffic
  that keeps lanes, gaps and obeys the signal, cattle, horses, deer, rabbits, birds, a cat.

## One world, invisibly streamed

Nothing about the world is stored in a level file. Everything is a **pure function of position
and seed**:

```
heightAt(x, z)   forestDensity(x, z)   fieldAt(x, z)   roads/rivers.influence(x, z)
```

`src/world/` is organised around that idea:

| File | Role |
| --- | --- |
| `WorldDef.js` | the hand-authored skeleton: road/river polylines, fields, forests, settlement zones, signs |
| `Terrain.js`, `Roads.js`, `Rivers.js` | analytic landform; roads and rivers carve/flatten the *same* function everyone queries |
| `Structures.js` | deterministic placement of buildings, fences, poles, lamps… indexed per chunk |
| `World.js` | pure queries (ground height, surface material, water depth) — no rendering |
| `ChunkManager.js`, `ChunkBuilder.js` | **internal** 64 m streaming tiles: built nearest-first in time-sliced generators (never more than a couple of ms per frame), LOD'd, unloaded behind you |
| `render/DistantTerrain.js` | two coarse rings of the same height function out to ~60 km: every mountain you see is walkable |
| `render/FarField.js` | every building of the world as a cheap distant block until its real chunk streams in |

Chunks never own global state. Time, weather, NPCs, traffic, animals, audio, the sun and rain are
world systems (`src/systems/`) simulated on one shared clock and are never re-created when you
cross a chunk edge. There are no invisible walls: the only barriers are physical (fences, walls,
trunks, water, cliffs, buildings).

### Growing the world

* Add roads / rivers / fields / forests / settlements to `WorldDef.js`; they connect automatically
  (junction snapping, elevation matching, bridges where roads meet rivers, traffic routes).
* Terrain, trees and weather already extend infinitely; only authored structures are limited to the
  region defined. Region-based lazy generation of `Structures` is the next step for 50–100 km.
* Geometry is built in chunk-local coordinates (float32 precision stays fine), and all world
  maths runs in doubles on the CPU. For journeys beyond ~100 km add a floating origin in
  `Game.loop` (shift scene + camera when far from zero).
* `systems/Seasons.js` is wired into the sun path, foliage tint and shaders but disabled; flipping
  `Seasons.enabled` and filling in its palettes is a data change.
* Railways, stations, a city skyline and industrial ambience belong in `WorldDef.js` +
  new `ChunkBuilder` features + new zones in `AudioSystem._sampleEnv`.

## Performance notes

Instanced trees (3 LODs, GPU wind sway, distance fade), instanced grass with shader fade-out,
merged-geometry buildings (a whole village chunk is a few draw calls), terrain LOD with skirts,
a fixed pool of 6 real point lights that hop between lamps/windows, one shadow map that follows
the player (sun by day, moon by night), fixed-size pooled traffic voices, and analytic far-field rendering.
Quality presets: **low** (no shadows/post, short view distance), **medium**, **high** (2048
shadows, MSAA, long view distance). The game quietly eases quality down one step if it cannot hold
24 fps for several seconds.

## Developer tools (`tools/`)

Headless smoke-test helpers (need the dev server running and Playwright's Chromium):
`shot.mjs`, `scenes.mjs` (screenshots at chosen time/weather/position), `walkbot.js`
(walks the whole route start → home through real collision and checks for blockers),
`map.mjs` (renders a 2-D debug map of the world), `probe*.mjs` (terrain statistics).
`window.__game` is exposed in the browser console.
