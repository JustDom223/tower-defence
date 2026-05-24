# Campaign — 10 maps, star-gated progression

> **Progress tracking — keep this current.** As you finish each item, tick its box (`[ ]` → `[x]`) and update the **Status** line for that ticket (⬜ Not started · 🚧 In progress · ✅ Done). Tick items off as you go so progress stays trackable at a glance.

Turn the two stand-alone maps into a 10-map campaign you unlock in order: clearing a map (earning ≥1 star) unlocks the next. Difficulty rises map-to-map (a campaign curve), and the per-run **Normal / Hard** selector stacks on top. Builds directly on the existing `Profile.js` (per-map star ratings already stored) and per-map wave files.

## Status at a glance

| Ticket | What | Status |
|---|---|---|
| C0 | Difficulty rework — Normal/Hard only, Hard is a big leap | ✅ Done |
| C1 | Map unlock system (≥1 star gates the next map) | ✅ Done |
| C2 | Campaign difficulty curve (per-map multiplier) | ✅ Done |
| C3 | Hub UI for 10 maps (locks + requirement hints) | ✅ Done |
| C4 | Author the 8 new maps (layouts + wave arcs) | ✅ Done |

---

## Ticket C0 — Difficulty rework: Normal + Hard only

**Status: ✅ Done**

Drop Easy. Two tiers, with Hard a *real* leap so players return to maps once stronger (it's the only route to the 3rd star).

- [x] `src/data/difficulties.js`: remove `easy`. Retune:
  - `normal`: `hpMult 1.0, speedMult 1.0, starCap 2, startingCash 150` (baseline)
  - `hard`: `hpMult 1.9, speedMult 1.25, starCap 3, startingCash 125` (a steep jump — tune to taste)
- [x] `index.html`: remove the 🟢 Easy button from `#diff-selector`; default selection stays 🟡 Normal.
- [x] `src/main.js`: default `selectedDiff = 'normal'`; ensure no `'easy'` references remain (incl. `savedData.difficulty` fallback → `'normal'`).
- [x] Confirm `computeStars` clamps to the difficulty's `starCap` (Normal → max 2, Hard → max 3). The 3rd star is unreachable on Normal by design.

**Acceptance:** only Normal/Hard are selectable; Hard is clearly much harder; a flawless Normal clear gives 2 stars, and the 3rd star requires Hard.

---

## Ticket C1 — Map unlock system

**Status: ✅ Done**

Sequential unlock keyed off the star ratings already in `Profile.js` (`profile.missions[mapKey]`).

- [x] Define the campaign order, e.g. in `src/data/maps.js` give each map an `order: 1..10`, or export a `CAMPAIGN_ORDER = ['map1', … , 'map10']` array.
- [x] In `Profile.js` add `isMapUnlocked(profile, mapKey)`: the first map is always unlocked; any later map is unlocked iff `(.missions[previousMapKey] ?? 0) >= 1`. Use `?? 0` so maps absent from `missions` read as 0 (no need to pre-list all 10 in `defaultProfile`).
- [x] Gate map selection in `main.js` (`awaitMapSelect`): clicking a locked map does nothing.
- [x] Continue/saved-game flow is unaffected (a saved run resumes regardless of unlock state).

**Acceptance:** only map 1 is playable on a fresh profile; earning ≥1 star on it unlocks map 2; and so on through map 10.

---

## Ticket C2 — Campaign difficulty curve

**Status: ✅ Done**

Each map is inherently harder than the last, independent of (and multiplied by) the Normal/Hard selector.

- [x] In `src/data/maps.js` add a per-map `hpMult` campaign factor (the curve below). Wave **size/composition** growth is authored into each map's wave file (C4); this `hpMult` carries the HP ramp cleanly.
- [x] In `WaveSpawner`, multiply enemy HP by `mapHpMult × difficulty.hpMult` at spawn (it already applies `difficulty.hpMult`; fold in the map factor). Speed stays driven by the selector only.

Suggested curve (`hpMult` by map order — tune later):

```
1: 1.00   2: 1.10   3: 1.22   4: 1.35   5: 1.50
6: 1.66   7: 1.84   8: 2.04   9: 2.26  10: 2.50
```

So map 10 on Hard ≈ `2.50 × 1.9 ≈ 4.75×` base HP — a deliberate endgame wall.

**Acceptance:** later maps are visibly tougher at the same selector setting; Easy-mode feel is gone.

---

## Ticket C3 — Hub UI for 10 maps

**Status: ✅ Done**

The map list grows from 2 to 10 — generate it instead of hard-coding buttons.

- [x] Replace the two hard-coded `.map-btn`s in `index.html` with an empty `#map-list` container the JS fills from `CAMPAIGN_ORDER` + `maps.js`.
- [x] In `main.js` (`updateMapSelectUI`), render each map in order with: name, its star rating (★/☆ — already computed from `profile.missions`), and a locked state (lock icon + a hint like "★ on <prev map> to unlock") when `!isMapUnlocked`.
- [x] Keep the existing "Continue saved game", "Unlock Tree", and difficulty selector. Consider making the list scrollable (10 rows).

**Acceptance:** the hub shows all 10 maps in order with correct lock states, requirement hints, and star ratings.

---

## Ticket C4 — Author the 8 new maps

**Status: ✅ Done**

Add maps 3–10 as data only (no core changes — see `CONTENT_GUIDE.md`). Each gets a `maps.js` entry (name, `order`, `hpMult`, `waypoints`) and a `src/data/waves-mapN.js` 10-wave file ending in a boss finale. Wire all ten into `WAVES_BY_MAP` in `main.js`.

- [x] `maps.js` entries for map3–map10 (waypoints in the Designs section below)
- [x] `waves-map3.js` … `waves-map10.js` (arcs in the Designs section below)
- [x] `main.js`: extend `WAVES_BY_MAP` to all 10; remove any 2-map assumptions
- [x] Playtest each new map to wave 10 on Normal and Hard

**Acceptance:** all 10 maps playable end-to-end with a boss finale; campaign curve felt across the set.

---

## Map designs (all 10)

Coordinates assume the current ~1280×650 field (paths enter/exit at the edges); nudge slightly during transcription if a segment clips the HUD/shop. Wave shorthand: **R** runner · **S** sprinter · **T** tank · **P** splitter · **A** armoured · **B** boss. `R10` = 10 runners. Suggested spawn intervals: R 0.6s · S 0.35s · T 1.8s · A 1.2s · P 1.1s · B 1.0s — tune per feel.

### Map 1 — Serpentine *(existing, order 1, hpMult 1.00)*
Long winding path, many choke points. Keep the current waypoints and `waves-map1.js`.

### Map 2 — Zigzag *(existing, order 2, hpMult 1.10)*
Fewer choke points; leans on speed/groups. Keep current waypoints and `waves-map2.js`.

### Map 3 — Switchbacks *(order 3, hpMult 1.22)* — introduces **Armoured**
Three long horizontal lanes; good firing lines.
`waypoints: [(0,180),(1080,180),(1080,360),(200,360),(200,540),(1280,540)]`
Waves: 1 `R12` · 2 `R10+S5` · 3 `S8+R8` · 4 `A4` *(armoured debut)* · 5 `T3+R12` · 6 `P6` · 7 `A6+S6` · 8 `T4+A4` · 9 `S16+R10` · 10 **BOSS** `B1+R10`

### Map 4 — The Cross *(order 4, hpMult 1.35)* — enters top, exits bottom
`waypoints: [(560,0),(560,260),(160,260),(160,460),(1120,460),(1120,180),(820,180),(820,650)]`
Waves: 1 `R14+S4` · 2 `S10` · 3 `A5+R8` · 4 `T4+P4` · 5 `P8` · 6 `A8` · 7 `S18+T3` · 8 `T5+A6` · 9 `P10+S10` · 10 **BOSS** `B1+A6`

### Map 5 — Coil *(order 5, hpMult 1.50)* — inward spiral
`waypoints: [(0,120),(1160,120),(1160,580),(220,580),(220,300),(880,300),(880,420),(1280,420)]`
Waves: 1 `R16+S6` · 2 `A6` · 3 `T4+R12` · 4 `P8+S8` · 5 `A8+T3` · 6 `S22` · 7 `T6+A6` · 8 `P12+A6` · 9 `S20+T5` · 10 **BOSS** `B1+T4+A4`

### Map 6 — Detour *(order 6, hpMult 1.66)*
`waypoints: [(0,300),(300,300),(300,120),(760,120),(760,520),(1000,520),(1000,240),(1280,240)]`
Waves: 1 `R18+S8` · 2 `A8+R10` · 3 `T5+P6` · 4 `S24` · 5 `A10+T4` · 6 `P14` · 7 `T6+S16` · 8 `A10+P8` · 9 `S26+T6` · 10 **BOSS** `B1+A8`

### Map 7 — Gauntlet *(order 7, hpMult 1.84)* — many tight chokes, long
`waypoints: [(0,560),(180,560),(180,140),(420,140),(420,520),(660,520),(660,140),(900,140),(900,520),(1140,520),(1140,200),(1280,200)]`
Waves: 1 `R20+S10` · 2 `A10` · 3 `T6+P8` · 4 `S28` · 5 `A12+T5` · 6 `P16+S12` · 7 `T8+A8` · 8 `A14+P10` · 9 `S30+T8` · 10 **BOSS** `B1+T6+A6`

### Map 8 — Hairpins *(order 8, hpMult 2.04)* — **mid-boss on wave 5**
`waypoints: [(0,140),(1000,140),(1000,300),(160,300),(160,460),(1000,460),(1000,600),(1280,600)]`
Waves: 1 `R22+S12` · 2 `A12+T4` · 3 `P10+S14` · 4 `T8+A10` · 5 **MID-BOSS** `B1+R12` · 6 `A16+S16` · 7 `T10+P12` · 8 `S34+A12` · 9 `P18+T8` · 10 **BOSS** `B1+A12+T6`

### Map 9 — Labyrinth *(order 9, hpMult 2.26)* — very winding
`waypoints: [(0,120),(240,120),(240,420),(120,420),(120,600),(560,600),(560,260),(820,260),(820,540),(1080,540),(1080,160),(1280,160)]`
Waves: 1 `R24+S14` · 2 `A14+T6` · 3 `P14+S18` · 4 `T10+A12` · 5 `A18+P10` · 6 `S40` · 7 `T12+A14` · 8 `P22+A14` · 9 `S44+T12` · 10 **BOSS** `B1+A16+T8`

### Map 10 — The Crucible *(order 10, hpMult 2.50)* — **mid-boss w5 + double-boss finale**
More open mid-section (fewer chokes) so the curve, not the geometry, carries the threat.
`waypoints: [(640,0),(640,160),(140,160),(140,560),(1140,560),(1140,160),(900,160),(900,400),(1280,400)]`
Waves: 1 `R28+S16` · 2 `A16+T8` · 3 `P16+S22` · 4 `T12+A16` · 5 **MID-BOSS** `B1+A12` · 6 `A22+S24` · 7 `T14+P18` · 8 `A24+T12` · 9 `S50+A18` · 10 **DOUBLE BOSS** `B2+A12+T8`

---

## Star economy (this fixes the earlier shortfall)

10 maps × 3 stars = **30 stars** maxed (all on Hard); ~20 if you only clear on Normal. That comfortably funds the unlock tree (and the new global perks / star-sink in `META_PROGRESSION.md`). The progression-gating means stars arrive gradually, so unlock decisions stay meaningful rather than front-loaded.
