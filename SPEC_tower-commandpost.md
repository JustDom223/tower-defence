# SPEC — Command Post Tower (New)

**Status: ⬜ Not started**

**Prerequisite systems:** Buff Aura (`SPEC_systems-new-mechanics.md §5`)

---

## Overview

A pure support tower — no attack, no economy. It makes the towers around it better. Path A boosts fire rate for nearby towers. Path B boosts damage and range, and gives those towers the ability to detect camo enemies (needed once the Phantom enemy is added).

| | Path A — Drill Sergeant | Path B — Spotter |
|---|---|---|
| **Role** | Speed boost for nearby towers | Power + range boost + camo detection |
| **Trades** | No combat value on its own | High cost for area-effect buff |
| **Needs** | Buff aura system | Buff aura + camo detection flag |

---

## Base stats

```js
commandpost: {
  name: 'Command Post',
  cost: 250,
  damage:    0,
  range:     130,   // aura radius
  fireRate:  0,
  projSpeed: 0,
  aoeRadius: 0,
  isSlow:    false,
  isSupport: true,  // processed by applyBuffAuras, skipped in firing loop
  buffFireRate: 0,
  buffDamage:   0,
  buffRange:    0,
  camoDetect:   false,
  color: 0x6366f1,    // indigo
  projColor: 0,
}
```

---

## Path A — Drill Sergeant

Each tier increases the fire-rate multiplier applied to nearby towers. At tier 4 every tower in range fires 75% faster than its base.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Training | $150 | `{ buffFireRate: 0.15 }` | Nearby towers fire 15% faster |
| 2 | Bootcamp | $320 | `{ buffFireRate: 0.15 }` | 30% total |
| 3 | Elite Training | $750 | `{ buffFireRate: 0.20, range: 30 }` | 50% total; wider aura |
| 4 | Maximum Overdrive | $1500 | `{ buffFireRate: 0.25 }` | 75% fire rate boost |

**End stats at 4-0:** buffFireRate = 0.75, range 160. A Dart Shooter next to this fires at 1.5 × 1.75 = 2.6/s.

---

## Path B — Spotter

Boosts damage and range of nearby towers. From tier 1, also grants camo detection — any tower in range can target camo enemies (once the Phantom enemy is added).

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Forward Observer | $150 | `{ buffDamage: 0.20, buffRange: 0.15, camoDetect: true }` | +20% dmg, +15% range; detects camo |
| 2 | Tactical Support | $320 | `{ buffDamage: 0.15, buffRange: 0.10 }` | +35% dmg, +25% range |
| 3 | Command & Control | $750 | `{ buffDamage: 0.15, buffRange: 0.10 }` | +50% dmg, +35% range |
| 4 | Supreme Commander | $1500 | `{ buffDamage: 0.25, buffRange: 0.15, range: 30 }` | +75% dmg, +50% range; wide aura |

**End stats at 0-4:** buffDamage = 0.75, buffRange = 0.50, camoDetect = true, range 160.

---

## Implementation notes

### Buff application (each frame)

`applyBuffAuras(towers)` is called at the top of `updateCombat` (see systems spec §5). It resets `buffedFireRate/Damage/Range` to base values, then iterates support towers and multiplies values for nearby combat towers.

CombatSystem then uses `tower.buffedFireRate` for cooldown calculation, `tower.buffedDamage` for projectile damage, and `tower.buffedRange` for the range-check `rSq`.

### Caution: do NOT persist buffed values

`buffedFireRate/Damage/Range` are computed each frame. Never save them to `SaveSystem`. Save only base `fireRate/damage/range` plus `upgradesA/B`.

### Visual — aura ring

Draw a pulsing indigo ring at radius = `tower.range`. At tier 1+ Spotter, tint it blue; Drill Sergeant, tint it amber. Low alpha (0.1) with a slow pulse animation (oscillate alpha 0.05–0.15) so it reads as active without dominating the screen.

### Camo detection

`tower.camoVisible` is set `true` for any tower within a Spotter's aura. In `TargetingSystem.selectTarget`, the existing in-range check gains: `if (e.isCamo && !tower.camoVisible) skip`. This means camo enemies are invisible to all towers by default; only Spotter-buffed towers can target them.

This is forward-compatible: the Phantom enemy (future ticket) sets `e.isCamo = true`. Even without the Phantom added, the detection flag is harmless.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Add `commandpost` entry |
| `src/systems/CombatSystem.js` | `applyBuffAuras` function; use `buffedFireRate/Damage/Range`; skip `isSupport` in firing loop |
| `src/entities/Tower.js` | Add `isSupport: false`, `buffFireRate/Damage/Range: 0`, `camoDetect: false`, `buffed*` runtime fields |
| `src/systems/TargetingSystem.js` | Skip `isCamo` enemies unless `tower.camoVisible` |
| `src/render/TowerRenderer.js` | Aura ring with pulse for support towers |
| `index.html` | Add Command Post shop button |
