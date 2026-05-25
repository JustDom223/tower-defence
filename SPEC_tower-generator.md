# SPEC — Generator Tower (New)

**Status: ⬜ Not started**

**Prerequisite systems:** Income / kill-cash boost (`SPEC_systems-new-mechanics.md §6`)

---

## Overview

An economy tower — no attack, no projectiles. It earns money. Path A generates a passive income bonus at the end of each wave. Path B boosts how much cash nearby towers earn from kills. Both paths reward committing to economy early and give the player a distinct playstyle option.

| | Path A — Bank | Path B — Market |
|---|---|---|
| **Role** | Passive wave-end income | Kill-cash multiplier for nearby towers |
| **Trades** | Occupies a placement slot; no combat value | Reward depends on kill density nearby |
| **Needs** | Wave-clear income hook | Kill-cash boost logic |

---

## Base stats

```js
generator: {
  name: 'Generator',
  cost: 225,
  damage:    0,
  range:     120,   // aura range, not attack range
  fireRate:  0,
  projSpeed: 0,
  aoeRadius: 0,
  isSlow:    false,
  isEconomy: true,  // flag: skip in CombatSystem targeting/firing loop
  incomePerWave:      30,
  killCashBoostRange: 0,
  killCashBoostMult:  0,
  color: 0xeab308,    // gold
  projColor: 0,
}
```

`isEconomy: true` towers are skipped entirely inside `updateCombat`'s firing loop — they have no projectiles and no targets.

---

## Path A — Bank

Generates increasing cash at the end of each wave. The `incomePerWave` value is summed across all Generator-Bank towers and added to `state.cash` when `onWaveClear` fires.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Savings Account | $150 | `{ incomePerWave: 25 }` | +$55 per wave |
| 2 | Investment Fund | $280 | `{ incomePerWave: 45 }` | +$100 per wave |
| 3 | Compound Interest | $600 | `{ incomePerWave: 80 }` | +$180 per wave |
| 4 | Money Press | $1200 | `{ incomePerWave: 120 }` | +$300 per wave |

**End stats at 4-0:** $300 per wave. Over 10 waves this is $3000 total — roughly 6 extra towers or 3 tier-4 upgrades.

### Wave-clear income hook

In `main.js`, wherever the wave-clear event fires:
```js
const income = state.towers.reduce((sum, t) => sum + (t.incomePerWave ?? 0), 0);
if (income > 0) {
  state.cash += income;
  // Show a toast: "+$N income"
}
```

---

## Path B — Market

Towers within this Generator's range earn a percentage bonus on every kill. The bonus stacks if multiple Market generators are in range of the same tower.

| Tier | Name | Cost | Stats | Description |
|---|---|---|---|---|
| 1 | Pawn Shop | $150 | `{ killCashBoostRange: 120, killCashBoostMult: 0.25 }` | +25% kill cash in range |
| 2 | Trading Post | $280 | `{ killCashBoostMult: 0.25 }` | +50% total |
| 3 | Stock Exchange | $600 | `{ killCashBoostRange: 60, killCashBoostMult: 0.25 }` | +75%; larger aura |
| 4 | Black Market | $1200 | `{ killCashBoostMult: 0.25 }` | +100% — kills near it pay double |

**End stats at 0-4:** killCashBoostRange 300, killCashBoostMult 1.0 (kills doubled within range).

> `killCashBoostRange` starts at 0 and tier 1 sets it to 120 (first stat that isn't `0`). Since applyTier is additive this works cleanly.

### Kill-cash boost hook

Find where enemies die and yield cash (likely `main.js` or wherever `enemy.hp <= 0` is processed). Replace the flat reward with:

```js
const baseReward = e.cashReward ?? 10;
const totalBoost = state.towers
  .filter(t => t.killCashBoostRange > 0)
  .reduce((total, gen) => {
    const dSq = (gen.x - e.worldX)**2 + (gen.y - e.worldY)**2;
    return dSq <= gen.killCashBoostRange**2 ? total + gen.killCashBoostMult : total;
  }, 0);
state.cash += Math.round(baseReward * (1 + totalBoost));
```

Enemies need a `cashReward` field set in their definition in `enemies.js` if not already present.

---

## Implementation notes

### Visual — aura ring

Draw a faint gold circle at the generator's position with radius = `tower.range` (for Bank, always 120; for Market, grows with upgrades). Use low alpha (0.08) so it's visible without being distracting.

### `isEconomy` flag

In `CombatSystem.updateCombat`, add at the start of the tower loop:
```js
if (tower.isEconomy) continue;
```

Support towers (Command Post) already use `isSupport`; economy towers use `isEconomy`. Both skip firing.

### Sell value

Selling a Generator returns 70% of cost + upgrade spend as normal. No special handling needed.

---

## Files to change

| File | Change |
|---|---|
| `src/data/towers.js` | Add `generator` entry |
| `src/systems/CombatSystem.js` | Skip `isEconomy` towers in firing loop |
| `src/entities/Tower.js` | Add `isEconomy: false`, `incomePerWave: 0`, `killCashBoostRange: 0`, `killCashBoostMult: 0` |
| `src/render/TowerRenderer.js` | Aura ring for economy towers |
| `index.html` | Add Generator shop button |
| `src/main.js` | Wave-clear income hook; kill-cash boost hook |
| `src/data/enemies.js` | Ensure each enemy has `cashReward` field |
