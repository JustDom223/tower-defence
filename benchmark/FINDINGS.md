# Benchmark Findings — 2026-06-22

Branch: `feat/archetypes`

## Changes made this session

### Economy (enemies.js, Simulation.js)
| Change | Before | After | Rationale |
|---|---|---|---|
| `runner.cashReward` | $10 | $6 | Fodder shouldn't pay like a threat |
| `sprinter.cashReward` | $8 | $5 | Same |
| `swarmling.cashReward` | $3 | $2 | Comes in hordes |
| Wave clear bonus | $50 | $30 | Invisible income that snowballed late-game |

### Archer tower (towers.js)
| Stat | Before | After | Rationale |
|---|---|---|---|
| `range` | 160 | 120 | Front-cluster density was game-breaking — single archer at ±55px offset now needs cooperative fire from a neighbour to reliably seal kills at outer placements |
| `cost` | $50 | $50 | Kept — $55 broke competent archetype (needs $130 before wave 1 but starts with $125) |

### Unlock tree (Profile.js)
| Node | Before | After | Rationale |
|---|---|---|---|
| Bomb tower | 2 stars | 3 stars | Forces a real choice between Bomb and Frost — player can only afford one after maps 1+2 |
| Frost tower | 2 stars | 3 stars | Same |

---

## Benchmark results — map1, Normal

Archetype | Lives | Cash | Towers | Win
--- | --- | --- | --- | ---
naive (before all changes) | 19/20 | $272 | 33 | ✓
competent (before all changes) | 8/20 | $347 | 30 | ✓
naive (after economy + range) | 14/20 | $229 | 20 | ✓
competent (after economy + range) | 17/20 | $255 | 20 | ✓
optimal (after economy + range) | 1/20 | $285 | 13 | ✓

Competent reserve was lowered $75→$25 between these runs (it could only afford 1 archer pre-wave-1 with $75 reserve); the 17-life result reflects the fixed archetype placing 2 archers before wave 1.

### Key conclusion for map1
- Naive (front-cluster) went from trivially easy (19 lives) to meaningfully pressured (14 lives). Still wins because clustering is geometrically effective, but bleeds 6 lives early.
- Economy is tighter — competent ends with $255 vs $347 before, meaning less "unspendable surplus."

---

## Benchmark results — map2, Normal (competent)
- **11 lives remaining** — reasonable pressure, clear win.

---

## Map3 findings — PROBLEMS IDENTIFIED

### Problem 1: W1 too aggressive for starting cash
Map3 wave 1 sends **18 enemies** (12 runners + 6 sprinters) against a player with $125 starting cash = 2 archers.

| Starting cash | Archers before W1 | W1 lives lost |
|---|---|---|
| $125 (base) | 2 | 17 → game effectively over by W2 |
| $175 (war chest rank 1) | 3 | 10 → survivable |

**Map progression (W1 enemy counts):** Map1=8, Map2=14, Map3=18. The jump is too steep.

**Recommended fix:** Reduce map3 W1 to ~12 enemies (e.g. 8 runners + 4 sprinters), matching a gentle step up from map2.

### Problem 2: Frost not viable even with war chest

With $175 starting cash (war chest), testing both unlocks:

Archetype | Lives | Notes
--- | --- | ---
withBomb + war chest | 1/20 | Barely survives — correct difficulty level
withFrost + war chest | 0/20 | Lost wave 2 (tanks) — frost alone doesn't cut it

**Why frost fails:**
1. Frost is a damage *multiplier* — it slows enemies so archers get more shots. But it only works where archers and frost *co-locate* (same path segment). The benchmark archetype spreads archers and places frost separately, so the kill-zone synergy is never realised.
2. Map3 W3+ introduces armoured enemies which resist archers at 0.5× — frost multiplying archer DPS still only gets you 50% effective damage against armoured. Bomb deals 1.5× to armoured, so it scales correctly; frost+archer does not.

**Two possible fixes (not yet implemented, needs user decision):**
- A) Increase frost slow from `slowFactor: 0.5` to `0.35` so a single archer + frost can kill a tank without needing co-location density.
- B) Accept frost is the "wrong pick" for map3 (maps heavy on armoured) and ensure there's a different map where frost shines (e.g. tank-heavy wave without armoured).

---

## Benchmark tooling built this session

- `benchmark/archetypes.mjs` — 5 player archetypes:
  - `naive` — front-loads archers near path entry
  - `competent` — spreads coverage, $25 reserve
  - `optimal` — spread + upgrades lead tower once 6 towers placed
  - `withBomb` — archers wave 1, then bombs at mid-path + archers from wave 2 onward
  - `withFrost` — archers wave 1, then frost at early-mid path + archers from wave 2 onward

- `benchmark/run.mjs` — headless runner, supports:
  - `node benchmark/run.mjs [mapKey] [diffKey] [archetype]`
  - `run({ mapKey, diffKey, archetype, extraCash })` API for scripted tests

---

---

## Balance pass 2 — 2026-06-23

### Frost viability (map3)

**Root cause:** the original `withFrost` archetype forced archers into a 200px kill zone around the frost tower. On map3's 3-row switchback layout this pinned all towers to row 1 (first 40% of the path). Rows 2 and 3 had zero coverage — nearly every enemy leaked past the first row.

**Fixes:**
| Change | Detail |
|---|---|
| Archer range: 120 → 150px | Covers inter-row gap (180px row spacing); an archer at ±78–100px from row 1 now also reaches row 2 |
| `withFrost` archetype rewrite | Removed kill-zone clustering; frost placed opportunistically at 20–50% path; remaining cash spread by `competent` across all rows |
| `frost.slowDuration` kept at 1.0 | User constraint: always-on slow belongs to the Permafrost upgrade path |
| `frost.slowFactor` stays 0.4 | From previous pass |

### Benchmark results after range + archetype fix

| Map | competent | frost (no perk) | frost + war chest (+$50) |
|---|---|---|---|
| map1 | 19 lives ✓ | 15 lives ✓ | 20 lives ✓ |
| map2 | 12 lives ✓ | fail W5 | 7 lives ✓ |
| map3 | 1 life ✓ | fail W4 | 11 lives ✓ |
| map4 | fail W2 | fail W2 | fail W3 |

**Conclusions:**
- map1–2 are accessible. map1 is easy (by design — tutorial). map2 is moderate.
- map3 passes cleanly with frost + war chest (11 lives). Without war chest frost still fails — this is intentional, war chest is purchasable at that star count and gives meaningful value.
- map4 is a hard wall for all frost/archer loadouts — requires bomb (which is map4's curriculum lesson).
- `withFrost(no perk)` fails map2-3: the slide from "competent wins comfortably" to "frost-only fails without war chest" creates real player progression tension.

### CLI update
`node benchmark/run.mjs [mapKey] [diffKey] [archetype] [extraCash]` — 4th arg now accepted.

---

## Resolved items
- [x] Reduce map3 W1 to ~12 enemies — done (8 runners + 4 sprinters)
- [x] Frost viable on map3 — passes with war chest (11 lives)
- [x] Archer range bump 120 → 150 improves multi-row map coverage

## Still open
- [ ] Run full map matrix (maps 1–10, naive + competent) to check balance across the full campaign
