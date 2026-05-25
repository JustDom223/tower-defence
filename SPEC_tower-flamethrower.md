# SPEC — Flamethrower Tower (New)

**Status: ⬜ Not started**

**Prerequisite systems:** DoT (`SPEC_systems-new-mechanics.md §1`), Ground Hazards (`SPEC_systems-new-mechanics.md §9`)

---

## Overview

A short-range, high-fire-rate tower that trades projectile reliability for continuous flame. Its two paths have completely different identities: Inferno stacks deep burns on priority targets; Wildfire scorches wide areas and leaves the ground on fire.

| | Path A — Inferno | Path B — Wildfire |
|---|---|---|
| **Role** | Stacking burn on high-HP targets | Wide-area zone denial |
| **Trades** | Narrow range; needs other towers to kill | Ground patches are slow to place |
| **Needs** | DoT + stack cap | DoT + ground hazard system |

---

## Base stats

```js
flamethrower: {
  name: 'Flamethrower',
  cost: 175,
  damage:    6,
  range:     90,
  fireRate:  5.0,   // feels continuous at this rate
  projSpeed: 160,
  aoeRadius: 0,
  isSlow: false,
  dotDamage:       4,
  dotDuration:     1.5,
  dotTickRate:     1.0,
  dotStackCap:     1,
  color: 0xef4444,   // red
  projColor: 0xfb923c, // orange
}
```

Add a new shop button for `'flamethrower'` in `index.html`.

---

## Path A — Inferno

Upgrades raise DoT damage and unlock stacking. At tier 3 the tower can maintain 3 simultaneous burn layers on a single enemy; at tier 4, 5 layers.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Napalm Mix | $120 | `{ dotDamage: 8, dotDuration: 0.5 }` | Stickier fuel, burns longer |
| 2 | Hellfire | $260 | `{ dotDamage: 12, dotDuration: 0.5 }` | Refined accelerant |
| 3 | Searing Core | $600 | `{ dotDamage: 18, dotStackCap: 2 }` | Two stacks can run simultaneously |
| 4 | Conflagration | $1400 | `{ dotDamage: 28, dotStackCap: 2 }` | Five stacks max; high-HP enemies combust |

**End stats at 4-0:** base damage 6/hit × 5.0/s = 30 DPS direct; burn stacks: 5 × (4+8+12+18+28) = 5 × 70 = 350 DoT damage total per full stack cycle. Devastating on tanky enemies that stay in range.

---

## Path B — Wildfire

Tier 2 unlocks ground fire patches that last several seconds and damage anything walking through them. Higher tiers grow the patches and the base range.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Spreading Flames | $120 | `{ range: 30, dotDamage: 4 }` | Wider spray, more fuel |
| 2 | Burning Patch | $280 | `{ leavesHazard: true, hazardDamage: 8, hazardRadius: 35, hazardDuration: 4.0, hazardTickRate: 1.0 }` | Projectile impacts leave fire on the ground |
| 3 | Firestorm | $650 | `{ range: 25, hazardDamage: 8, hazardRadius: 15, hazardDuration: 2.0 }` | Bigger patches, last longer |
| 4 | Armageddon | $1500 | `{ hazardDamage: 15, hazardDuration: 2.0, hazardRadius: 20 }` | Scorched earth; patches deal 31 dmg/s for 8s |

**End stats at 0-4:** range 145, leavesHazard, ground patch: radius 70px, damage 31/s, duration 8s.

---

## Implementation notes

### Rapid-fire projectile feel

At `fireRate: 5.0`, the tower fires a projectile every 0.2s. Small orange particle projectiles (`projColor: 0xfb923c`) at `projSpeed: 160` with tiny visual radius. The high rate means DoT stacks accumulate fast on a target that stays in range.

### Ground hazard rendering

In `TowerRenderer` (or a new `GroundHazardRenderer`), draw each hazard as a translucent orange circle. Alpha = `hazard.remaining / hazard.initialDuration` so it fades as it expires.

### New tower type in shop

Add button to `index.html` tower shop strip:
```html
<button class="tower-btn" data-type="flamethrower">🔥 Flame<br>$175</button>
```

Apply `.tower-unaffordable` styling via `GameUI` affordability logic (already handles all `.tower-btn` elements).

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Add `flamethrower` entry |
| `src/systems/DoTSystem.js` | New file (systems spec §1) |
| `src/systems/GroundHazardSystem.js` | New file (systems spec §9) |
| `src/systems/CombatSystem.js` | DoT on-hit; ground hazard spawn on projectile land |
| `src/entities/Tower.js` | New tower fields already covered by systems spec |
| `src/render/TowerRenderer.js` | Ground hazard glow circles |
| `index.html` | Add Flamethrower shop button |
| `src/main.js` | Call `updateDoT` and `updateGroundHazards` in game loop; add `state.groundHazards = []` |
| `src/core/SaveSystem.js` | `groundHazards` is transient — do NOT persist (mid-wave state) |
