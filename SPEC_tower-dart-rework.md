# SPEC — Dart Tower Rework

**Status: ⬜ Not started**

**Prerequisite systems:** Pierce (from `SPEC_systems-new-mechanics.md`)

---

## Overview

Replace the existing Dart upgrade paths with two distinct identities. The base tower is unchanged. Path A becomes a slow, piercing sniper build. Path B becomes a close-range gatling that pumps bullets so fast it melts swarms.

| | Path A — Sharpshooter | Path B — Gatling |
|---|---|---|
| **Role** | Lane-piercing single-target | Close-range swarm clear |
| **Trades** | Fire rate for pierce + damage | Range for absurd fire rate |
| **Needs** | Pierce system | Data-only |

---

## Base stats (unchanged)

```
cost: $50 | damage: 18 | range: 160 | fireRate: 1.5/s | projSpeed: 320
```

---

## Path A — Sharpshooter

Upgrades make bolts heavier and slower but they pierce clean through a line of enemies.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Long Round | $80 | `{ damage: 12, fireRate: -0.3 }` | Heavier bolt hits harder but fires slower |
| 2 | Piercing Shot | $160 | `{ pierce: 1 }` | Bolt passes through one extra enemy |
| 3 | Heavy Calibre | $380 | `{ damage: 25, pierce: 1 }` | Larger round, pierces two total |
| 4 | Line Cutter | $950 | `{ damage: 45, pierce: 2 }` | Devastates entire lanes; pierces four total |

**End stats at 4-0:** damage 100, fireRate 1.2/s, pierce 4 — one shot can hit 5 enemies in a line.

---

## Path B — Gatling

Upgrades trade range for fire rate. Tier 4 fires so fast it effectively suppresses anything in its tiny radius.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Rapid Fire | $90 | `{ fireRate: 1.0, range: -30 }` | Much faster shots, shorter barrel |
| 2 | Clip Feed | $200 | `{ fireRate: 1.5 }` | Auto-feed mechanism |
| 3 | Minigun | $500 | `{ fireRate: 2.5, range: -20 }` | Spins up to sustained fire |
| 4 | Overdrive | $1100 | `{ fireRate: 4.0 }` | Absurd rate; place on corners |

**End stats at 0-4:** damage 18, fireRate 9.0/s, range 110.

---

## Implementation notes

- **Path A pierce:** `applyTier` handles `{ pierce: N }` additively. The pierce system in `SPEC_systems-new-mechanics.md §2` must be shipped first — it changes projectile travel from target-locked to directional.
- **Path B:** pure data changes. No new system needed. The negative range values work because `applyTier` is additive (`tower.range += -30`).
- **`towers.js`:** Replace existing `dart.upgrades.pathA` and `pathB` with the tables above.
- **Label change:** `pathA.label = 'Sniper'`, `pathB.label = 'Gatling'`.
- **No save format change:** type key `'dart'` unchanged.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Replace dart pathA/pathB upgrade definitions |
| `src/systems/CombatSystem.js` | Pierce system (see systems spec) |
| `src/entities/Projectile.js` | Pierce fields (see systems spec) |
| `src/entities/Tower.js` | Add `pierce: 0` default |
