# SPEC — Campaign Balance Pass 1

**Status:** 🚧 In progress

## Problem

The campaign difficulty curve is **inverted** — it starts hard and gets easier.

Root causes found during diagnosis:

1. **Power scales far faster than difficulty.** A median player goes from **1 tower
   (dart only)** on map 1 to **5 towers + both upgrade paths + perks + a matured
   economy** by map 10. Enemy HP only scales ×2.5 over the same span (`maps.js`
   `hpMult` 1.00 → 2.50). Power growth ≫ difficulty growth.
2. **Map 1 is overtuned for a dart-only player** — it already includes armoured
   (resists dart 0.5), tanks, and a 2000-HP boss.
3. **Most enemy variety is unused** — only 6 of ~20 defined `ENEMY_TYPES` ever
   appear in waves (runner, sprinter, tank, splitter, armoured, boss).
4. **~15 towers are orphaned** — defined in `TOWER_TYPES` and present in the shop
   but with **no unlock-tree node**, so they're unobtainable in campaign
   (Sandbox-only). This includes the only camo-detector (Command Post), which is
   why the camo enemy (phantom) is currently undefeatable in campaign.

## Decisions (agreed)

- **Bring a curated subset of orphaned towers into the unlock tree** (not all 15).
- **First pass = enemy variety + curve fix together.**

## Constraint

Every enemy added must be killable with **dart alone** (the only guaranteed early
tower); no enemy may have its *only* counter on a locked/unobtainable tower.
- ✅ Safe: swarmling, carrier, shielded, cleric, stutter, flyer, regenerator,
  magma, insulated, aquatic, brute, juggernaut, megaboss.
- ⚠️ phantom (camo): only fair *after* Command Post is in the tree; use sparsely
  and late, never in a phantom-only wave.

## The balancing process (reusable)

1. **Expected-loadout table** — for each map, the towers a median Normal player
   owns (from stars earned on prior maps) sets the difficulty target.
2. **Leak yardstick** — per wave, compare incoming HP/sec against a reference
   loadout's DPS rather than guessing. (Dart baseline ≈ 27 DPS unupgraded,
   ~40–80 upgraded.)
3. **Monotonic re-curve** — soften the dart-only opening, stiffen the
   full-arsenal finale, so *difficulty ÷ expected power* rises every map.
4. **Stage new enemies** — introduce one new mechanic at a time, where the median
   player has a tool for it.
5. **Verify** — spot-play maps 1 / 5 / 10 in the preview + the leak math.

## Expected loadout per map (Normal, 2★/map)

| Map | Stars avail | Likely towers a median player has |
|-----|-------------|-----------------------------------|
| 1   | 0           | dart |
| 2   | 2           | dart + (bomb **or** frost) |
| 3–4 | 4–6         | dart + bomb + frost |
| 5–6 | 8–10        | + marksman / flamethrower |
| 7–8 | 12–14       | + tesla / laser |
| 9–10| 16–18       | near-full arsenal + Command Post (camo) |

## Tasks

### Tower tree additions (`Profile.js`)
- [x] Add **Flamethrower** (AoE + burn DoT — swarms, splitters, regenerator)
- [x] Add **Laser** (sustained beam — shielded, brute shred)
- [x] Add **Command Post** (team buff + **camo detection** → makes phantom fair)
- [x] Each gets a tower node + Path-B node, defensive `??=` path guards, and
      `defaultProfile` entries. Costs: tower 2–3★, Path B 1★.

### Enemy staging (wave files)
- [x] **Map 1–2 — soften** (dart-only on-ramp): delay/cut armoured, ease the boss
      escort, gentle counts.
- [x] **Map 3** swarmling + carrier (AoE lesson)
- [x] **Map 4** flyer + stutter
- [x] **Map 5** regenerator + cleric (priority-target / DoT lesson)
- [x] **Map 6** magma + insulated (don't-rely-on-one-element lesson)
- [x] **Map 7** aquatic + brute
- [x] **Map 8** shielded + juggernaut + heavier density
- [x] **Map 9** phantom (sparse) + carrier swarms
- [x] **Map 10** megaboss finale + mixed elites
- [x] **Map 7–10 — stiffen**: higher density / tighter intervals to match the
      full arsenal.

### Verify
- [x] New towers appear in the unlock tree and are buyable/placeable.
- [x] Difficulty proxy (enemy HP × map hpMult) now rises monotonically across all
      10 maps: 11k → 14.9k → 14.9k → 24k → 28k → 41k → 60k → 81k → 104k → 144k.
- [x] All wave enemy `type` references validated against `ENEMY_TYPES` (no typos).
- [x] Map 1 opens gently (8 runners, no early armoured) with dart only.
- [x] Live smoke test: Map 3 ran to wave 3 (swarmling flood) with **no runtime
      errors**; carrier/megaboss spawn paths confirmed wired in `main.js`
      (`spawns` death-spawn + `liveSpawnInterval` live-spawn).
- [x] No console errors on load.
- [ ] **Full playtest pass — owner to test all 10 maps** and report feel; numbers
      will be re-tuned from that feedback.

## Notes / follow-ups
- Star economy: all towers now cost ~29★ total (was 16★); campaign yields ~20★
  (Normal) / ~30★ (Hard), so players must now make unlock choices — intended.
- Numbers are a first pass tuned by the HP-proxy yardstick, not full playtests.
  A second pass after real play sessions is expected (esp. Hard-mode megaboss,
  which is 8000 × 2.5 × 1.9 ≈ 38k HP — may be a slog).
