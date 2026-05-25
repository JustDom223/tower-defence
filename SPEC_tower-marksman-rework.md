# SPEC — Marksman Tower Rework

**Status: ⬜ Not started**

**Prerequisite systems:** Multi-shot (`SPEC_systems-new-mechanics.md §4`)

---

## Overview

Replace existing Marksman upgrade paths. Path A doubles down on the boss-killer role: global range, armour-ignoring rounds, and enormous single-target damage. Path B trades single-hit power for multi-target volleys — a different style of long-range coverage.

| | Path A — Assassin | Path B — Ranger |
|---|---|---|
| **Role** | Global-range boss eliminator | Long-range multi-target suppressor |
| **Trades** | Single target only; very slow fire rate | More targets, less per-hit damage |
| **Needs** | Data-only (`globalRange` already in engine) | Multi-shot system |

---

## Base stats (unchanged)

```
cost: $125 | damage: 80 | range: 350 | fireRate: 0.7/s | projSpeed: 500
```

---

## Path A — Assassin

Upgrades push range to global, bypass armour resistance, and scale damage to delete bosses.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Long Barrel | $160 | `{ range: 120, damage: 25 }` | Extended sight line |
| 2 | Global Sight | $400 | `{ globalRange: true, damage: 40 }` | Unlimited range; targets any enemy on map |
| 3 | AP Round | $800 | `{ damage: 80, ignoresArmour: true }` | Armour-piercing — bypasses all resistances |
| 4 | Killshot | $1700 | `{ damage: 130 }` | Maximum devastation |

**End stats at 4-0:** damage 355, global range, fireRate 0.7/s, ignores armour — designed to solo bosses.

> `globalRange: true` already exists in the engine (`TargetingSystem` checks it). `ignoresArmour: true` needs a one-line add to `applyDamage` (skip resistance multiplication if set on projectile).

> Default targeting for Assassin path should be set to `'strong'` when tier 1 is purchased. Option: add `{ defaultTargeting: 'strong' }` stat — `applyTier` would set `tower.targeting = 'strong'` if it handles string stats. Simpler: just document that players should switch targeting manually, or auto-set it in the `applyTier` call.

---

## Path B — Ranger

Each tier adds one more simultaneous target. Fire rate also increases so the tower keeps pace as it splits attention.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Split Shot | $160 | `{ multiShot: 1, fireRate: 0.3 }` | Fires at 2 enemies simultaneously |
| 2 | Volley | $400 | `{ multiShot: 1, fireRate: 0.3 }` | 3 targets |
| 3 | Rapid Volley | $800 | `{ multiShot: 1, fireRate: 0.4 }` | 4 targets |
| 4 | Arrow Storm | $1700 | `{ multiShot: 1, fireRate: 0.5 }` | 5 targets at once |

**End stats at 0-4:** damage 80, multiShot 5 (base 1 + 4 upgrades), fireRate 2.2/s, range 350.

> `multiShot` starts at `1` (default all towers). Each Ranger tier adds 1. `CombatSystem` fires one projectile per target up to `tower.multiShot`.

---

## Implementation notes

### `ignoresArmour` — CombatSystem `applyDamage`

```js
const resistMult = (p.ignoresArmour) ? 1 : (e.resistance?.[towerType] ?? 1);
```

Store `ignoresArmour` on the projectile at acquire time: `ignoresArmour: tower.ignoresArmour ?? false`.

### `defaultTargeting` stat (optional shortcut)

In `applyTier`, add a special case:
```js
if (key === 'defaultTargeting') { tower.targeting = val; return; }
```
Then Assassin tier 1 can include `{ range: 120, damage: 25, defaultTargeting: 'strong' }`.

### Label change

`pathA.label = 'Assassin'`, `pathB.label = 'Ranger'`.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Replace marksman pathA/pathB upgrade definitions |
| `src/systems/CombatSystem.js` | `ignoresArmour` check; multi-shot fire loop (systems spec §4) |
| `src/systems/TargetingSystem.js` | `selectTopNTargets` (systems spec §4) |
| `src/entities/Projectile.js` | Add `ignoresArmour: false` field |
| `src/entities/Tower.js` | Add `ignoresArmour: false`, `multiShot: 1` defaults |
| `src/systems/UpgradeSystem.js` | Handle `defaultTargeting` string stat in `applyTier` (optional) |
