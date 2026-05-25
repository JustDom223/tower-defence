# SPEC — Alchemist Tower (New)

**Status: ⬜ Not started**

**Prerequisite systems:** Vulnerability debuff (`SPEC_systems-new-mechanics.md §7`), DoT (`SPEC_systems-new-mechanics.md §1`)

---

## Overview

A support/debuff tower. It deals little direct damage but changes how enemies receive damage. Path A makes every other tower on the field deal more damage to tagged enemies. Path B applies armour-ignoring poison that bypasses resistances entirely.

| | Path A — Corrosion | Path B — Toxin |
|---|---|---|
| **Role** | Force-multiplier for the whole defence | Standalone DoT that ignores armour |
| **Trades** | Zero kill potential on its own | Poison doesn't scale with other buffs |
| **Needs** | Vulnerability debuff system | DoT system (ignoresArmour flag) |

---

## Base stats

```js
alchemist: {
  name: 'Alchemist',
  cost: 150,
  damage:    8,
  range:     150,
  fireRate:  0.8,   // slow — fires flasks, not bullets
  projSpeed: 170,
  aoeRadius: 30,    // small splash on hit
  isSlow: false,
  debuffVulnerability: 0,
  debuffDuration:      0,
  dotDamage:       0,
  dotDuration:     0,
  dotTickRate:     1.0,
  dotIgnoresArmour: false,
  color: 0x84cc16,    // lime green
  projColor: 0xbef264,
}
```

---

## Path A — Corrosion

Flasks splatter acid on impact. Tagged enemies glow with a green outline and take a percentage bonus from all damage sources. Higher tiers push the multiplier toward 2×.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Acid Flask | $140 | `{ debuffVulnerability: 1.25, debuffDuration: 3.0 }` | Tagged enemies take 25% extra from everything |
| 2 | Caustic Brew | $300 | `{ debuffVulnerability: 0.25, debuffDuration: 1.0 }` | +50% total; debuff lasts longer |
| 3 | Melting Point | $700 | `{ debuffVulnerability: 0.25, debuffDuration: 1.0 }` | +75% total |
| 4 | Dissolution | $1500 | `{ debuffVulnerability: 0.25, aoeRadius: 30 }` | 2× incoming damage; splash debuffs nearby enemies |

**End stats at 4-0:** debuffVulnerability = 2.0 (tagged enemies take double damage from all sources), debuffDuration = 5.0s, aoeRadius 60.

> `debuffVulnerability` is the *absolute* multiplier stored on the tower, set additively via upgrades. `0 → 1.25 → 1.50 → 1.75 → 2.00`. In `applyDamage`, `e.vulnerabilityMult` uses the most recently applied value (not stacked with itself).

---

## Path B — Toxin

Lobbed venom flasks bypass armour resistances entirely. The DoT ramps with upgrades. Tier 4 spreads poison to nearby enemies on the target's death.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Venom | $140 | `{ dotDamage: 18, dotDuration: 3.0, dotIgnoresArmour: true }` | Pure poison, ignores armour |
| 2 | Neurotoxin | $300 | `{ dotDamage: 22, dotDuration: 1.0 }` | Stronger compound |
| 3 | Compound Venom | $700 | `{ dotDamage: 30, dotDuration: 1.5 }` | Long-chain molecule, lingers longer |
| 4 | Plague | $1500 | `{ dotDamage: 40, dotSpreads: true }` | Infected enemies spread poison to neighbours on death |

**End stats at 0-4:** dotDamage 110/tick × 1.0/s over 5.5s = up to 605 armour-ignoring damage per target.

### `dotSpreads` (tier 4 only)

When a poisoned enemy dies (hp ≤ 0), check neighbours within 60px. Each one receives a fresh DoT stack at the current tower's `dotDamage/2` for `dotDuration` seconds.

Implement in the enemy kill handler in `main.js` (wherever enemy death is processed):
```js
if (e.dotStacks.some(s => s.spreads)) {
  for (const other of state.enemies) {
    if ((other.worldX - e.worldX)**2 + (other.worldY - e.worldY)**2 < 60**2) {
      other.dotStacks.push({ /* half damage stack */ });
    }
  }
}
```

Add `spreads` flag to the DoT stack when pushed, taken from `tower.dotSpreads`.

---

## Implementation notes

### Visual feedback — vulnerability debuff

When `e.vulnerabilityTimer > 0`, the enemy should show a visible green glow or outline so the player can see the debuff is active. Add to `EnemyRenderer`: if `e.vulnerabilityTimer > 0`, draw a thin green ring at the enemy's position.

### Corrosion + Toxin interaction

These are separate paths (mutually exclusive per the upgrade system), so a single Alchemist can only be one or the other. Two different Alchemist towers on the map could theoretically stack both — this is fine and intended.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Add `alchemist` entry |
| `src/systems/CombatSystem.js` | Apply `debuffVulnerability` on hit; `dotSpreads` flag on stack; vulnerability check in `applyDamage` |
| `src/entities/Enemy.js` | Add `vulnerabilityMult`, `vulnerabilityTimer` (systems spec §7) |
| `src/entities/Tower.js` | `debuffVulnerability`, `debuffDuration` defaults added by systems spec |
| `src/render/EnemyRenderer.js` | Green glow when `vulnerabilityTimer > 0` |
| `index.html` | Add Alchemist shop button |
| `src/main.js` | `dotSpreads` death propagation in kill handler |
