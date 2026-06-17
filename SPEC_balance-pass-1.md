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
- [ ] Add **Flamethrower** (AoE + burn DoT — swarms, splitters, regenerator)
- [ ] Add **Laser** (sustained beam — shielded, brute shred)
- [ ] Add **Command Post** (team buff + **camo detection** → makes phantom fair)
- [ ] Each gets a tower node + Path-B node, defensive `??=` path guards, and
      `defaultProfile` entries. Keep costs modest so the star economy still works.

### Enemy staging (wave files)
- [ ] **Map 1–2 — soften** (dart-only on-ramp): delay/cut armoured, ease the boss
      escort, gentle counts.
- [ ] **Map 3** swarmling + carrier (AoE lesson)
- [ ] **Map 4** flyer + stutter
- [ ] **Map 5** regenerator + cleric (priority-target / DoT lesson)
- [ ] **Map 6** magma + insulated (don't-rely-on-one-element lesson)
- [ ] **Map 7** aquatic + brute
- [ ] **Map 8** juggernaut + heavier density
- [ ] **Map 9** phantom (sparse) + carrier swarms
- [ ] **Map 10** megaboss finale + mixed elites
- [ ] **Map 7–10 — stiffen**: higher density / tighter intervals to match the
      full arsenal.

### Verify
- [ ] New towers appear in the unlock tree and are buyable/placeable.
- [ ] Map 1 plays as a gentle on-ramp with dart only.
- [ ] A late map still pressures a full arsenal.
- [ ] No console errors.
