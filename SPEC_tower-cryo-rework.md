# SPEC — Cryo Tower Rework

**Status: ⬜ Not started**

**Prerequisite systems:** Stun (`SPEC_systems-new-mechanics.md §3`), DoT (`SPEC_systems-new-mechanics.md §1`)

---

## Overview

Replace existing Frost upgrade paths. Path A transforms the tower into a hard crowd-controller that periodically freezes everything solid. Path B leans into the wide slow field and adds frostbite DoT — sustained damage without hard control.

| | Path A — Glacier | Path B — Avalanche |
|---|---|---|
| **Role** | Hard crowd control (full stun) | Wide slow + frostbite DoT |
| **Trades** | Gives up DoT entirely for stun | Keeps slow, gives up stun |
| **Needs** | Stun system | DoT system |

---

## Base stats (unchanged)

```
cost: $75 | damage: 0 | range: 140 | fireRate: 2.0/s | isSlow: true
slowFactor: 0.4 | slowDuration: 1.5s
```

---

## Path A — Glacier

Early tiers strengthen the slow. Tier 2 switches the mechanic from slow → full stun: `isSlow` is set false, `isStun` is set true. Higher tiers extend stun duration and add thaw damage.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Charged Pulse | $120 | `{ fireRate: 0.5, slowFactor: -0.08 }` | Faster pulses, harder chill |
| 2 | Flash Freeze | $280 | `{ isSlow: false, isStun: true, stunDuration: 0.7 }` | Full freeze — nothing moves for 0.7s |
| 3 | Ice Age | $600 | `{ stunDuration: 0.5, range: 30 }` | Longer freeze, wider radius |
| 4 | Absolute Zero | $1300 | `{ stunDuration: 0.6, damage: 30 }` | Deals 30 damage per pulse on thaw |

**End stats at 4-0:** stun 1.8s, range 170, fireRate 2.5/s, 30 damage on stun hit.

> At tier 2, `applyTier` sets `tower.isSlow = false` and `tower.isStun = true`. `CombatSystem` branches on `isStun` instead of `isSlow`. The pulse AoE range check is identical; only the effect changes.

---

## Path B — Avalanche

Keeps the slow mechanic. Tiers grow the range and add increasing frostbite DoT to every enemy caught in the pulse.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Glacial Wind | $120 | `{ range: 50, fireRate: 0.5 }` | Wider chill |
| 2 | Frostbite | $220 | `{ dotDamage: 10, dotDuration: 2.0, dotTickRate: 1.0 }` | Slowed enemies also take frostbite damage |
| 3 | Polar Vortex | $550 | `{ range: 50, dotDamage: 14 }` | Bigger storm, deeper bite |
| 4 | Permafrost | $1200 | `{ range: 80, dotDamage: 20, slowDuration: 1.0 }` | Massive slow field; frostbite rends 44 dmg/s |

**End stats at 0-4:** range 320, fireRate 2.5/s, slowFactor 0.4, slowDuration 2.5s, frostbite 44 damage/s over 2s.

> Avalanche DoT is applied in `CombatSystem.applySlow` — when `tower.isSlow && tower.dotDamage > 0`, push a DoT stack onto each enemy within range alongside the slow. Uses the standard DoT system.

---

## Implementation notes

- **Tier 2 Glacier stat `{ isSlow: false }`:** `applyTier` already does `tower[key] = val` for booleans — this works without any change to `applyTier`.
- **Damage on Absolute Zero (tier 4):** at tier 4 the stun pulse also deals direct damage. Add to `applyStun` in `CombatSystem`: `if (tower.damage > 0) applyDamage(e, tower.damage, tower.type, e.worldX, e.worldY, damageEvents)`.
- **Save format:** type key `'frost'` unchanged.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Replace frost pathA/pathB; update labels to `'Glacier'` / `'Avalanche'` |
| `src/systems/CombatSystem.js` | Stun branch; DoT application in `applySlow`; damage in `applyStun` |
| `src/entities/Tower.js` | Add `isStun: false`, `stunDuration: 0` (DoT fields already added by systems spec) |
