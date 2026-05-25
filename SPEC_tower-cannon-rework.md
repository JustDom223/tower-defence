# SPEC — Cannon Tower Rework

**Status: ⬜ Not started**

**Prerequisite systems:** Mortar manual targeting (from `SPEC_systems-new-mechanics.md §8`)

---

## Overview

Rename Bomb → Cannon. Replace upgrade paths with two distinct playstyles: one that maximises blast radius into a screen-clearing siege weapon, and one that trades range-locking for unlimited free-aim bombardment.

| | Path A — Siege | Path B — Mortar |
|---|---|---|
| **Role** | Stationary area denial | Map-wide precision bombardment |
| **Trades** | Fire rate for enormous AoE | Range-lock for manual targeting |
| **Needs** | Data-only | Mortar manual targeting system |

---

## Base stats (unchanged)

```
cost: $100 | damage: 60 | range: 140 | fireRate: 0.6/s | aoeRadius: 70
```

---

## Path A — Siege

Each upgrade makes the blast bigger and the damage heavier. Fire rate slows further — this cannon is not meant to shoot often.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Heavy Shell | $130 | `{ aoeRadius: 35, fireRate: -0.15 }` | Bigger warhead, slower load |
| 2 | Demolisher | $280 | `{ damage: 50, aoeRadius: 30 }` | Reinforced casing |
| 3 | Shockwave | $650 | `{ aoeRadius: 60, damage: 60 }` | Overpressure wave |
| 4 | Annihilator | $1500 | `{ aoeRadius: 90, damage: 90 }` | Battlefield eraser |

**End stats at 4-0:** damage 260, aoeRadius 285px (covers most of a chokepoint), fireRate 0.45/s.

---

## Path B — Mortar

Early tiers extend range. Tier 2 unlocks `mortarMode: true` — the tower ignores its own range and instead fires at a player-set crosshair anywhere on the map.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Extended Range | $160 | `{ range: 90 }` | Longer barrel |
| 2 | Mortar Barrel | $380 | `{ range: 200, mortarMode: true }` | Unlocks manual target; virtually unlimited range |
| 3 | Rapid Mortar | $700 | `{ fireRate: 0.4, damage: 40 }` | Faster loading mechanism |
| 4 | Carpet Bomb | $1600 | `{ mortarVolley: 3 }` | Fires 3 shells per salvo, spread around target point |

**End stats at 0-4:** damage 100, aoeRadius 70, fireRate 1.0/s, manual target anywhere on map.

---

## Implementation notes

### Mortar mode (tier 2+)

`mortarMode: true` is applied by `applyTier` (boolean flag). In `CombatSystem`, when `tower.mortarMode && tower.mortarTargetX !== null`, skip `selectTarget` entirely and fire a ballistic projectile toward `(mortarTargetX, mortarTargetY)`.

### Mortar volley (tier 4)

`mortarVolley: 3` means fire 3 projectiles per cooldown at slightly randomised offsets around the target point (±20px). `applyTier` adds `mortarVolley` additively (base 1 → becomes 3 after tier 4: value in tier stats is `{ mortarVolley: 2 }`).

### Setting the target

See `SPEC_systems-new-mechanics.md §8` for the "Set Target" button and canvas-click handler. Render a red `✕` sprite at the target position; draw a dashed line from tower to marker.

### Name change

Rename display name `'Bomb'` → `'Cannon'` in `towers.js`. Type key stays `'bomb'` for save compatibility.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Rename to Cannon; replace pathA/pathB upgrades; set `name: 'Cannon'` |
| `src/systems/CombatSystem.js` | Mortar fire mode; volley loop |
| `src/entities/Tower.js` | Add `mortarMode: false`, `mortarTargetX: null`, `mortarTargetY: null`, `mortarVolley: 1` |
| `src/ui/GameUI.js` | "Set Target" button for mortar towers |
| `src/render/TowerRenderer.js` | Mortar crosshair + line rendering |
| `src/main.js` | Canvas click handler for mortar target |
