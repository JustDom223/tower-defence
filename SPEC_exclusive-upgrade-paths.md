# SPEC — Mutually exclusive upgrade paths

**Status: ✅ Done**

---

## Problem

The upgrade system allows buying tiers from **both paths simultaneously**. Once you buy tier 1 on path B you can still keep buying on path A (and vice versa), up to the `CROSSPATH_CAP` (currently 2) on the secondary path. This means every tower is effectively always a hybrid, which reduces the strategic decision of committing to one path.

---

## Goal

Make upgrade paths **mutually exclusive**: buying the first tier on either path locks out the other path entirely for that tower. This forces a meaningful choice and gives each path a distinct identity.

| Current | After this ticket |
|---|---|
| Can buy A:2 / B:4 (and anything up to the cap) | Once any tier on B is bought, path A shows locked for this tower |
| `CROSSPATH_CAP = 2` limits secondary path after other is maxed | No secondary path at all — first purchase commits the tower |

---

## Acceptance criteria

- [x] After buying **any** tier on path A, all buttons on path B are shown as locked (grayed, 🔒, non-clickable) for that tower.
- [x] After buying **any** tier on path B, all buttons on path A are locked.
- [x] Before any upgrade is bought, **both** paths show their first tier as purchasable (no change to the initial state).
- [x] The lock message reads **"🔒 Path locked"** (distinct from the existing "🔒 Locked — Unlock in upgrade tree" used for profile locks).
- [x] `canBuyUpgrade` returns `reason: 'path-exclusive'` when the other path has ≥ 1 tier purchased.
- [x] The tower name label (e.g. `Dart (2-0)`) correctly continues to reflect the actual tier counts.
- [x] Existing save/load is unaffected — `upgradesA` and `upgradesB` are still persisted as before; the mutual-exclusion is enforced at purchase time, not stored as a flag.
- [x] All four tower types (Dart, Bomb, Frost, Marksman) respect the new rule.

---

## Implementation

### `src/systems/UpgradeSystem.js`

Remove `CROSSPATH_CAP` and replace the crosspath check with a strict "any purchase = locked" rule:

```js
export const MAX_TIER = 4;
// CROSSPATH_CAP removed — paths are now fully exclusive

export function canBuyUpgrade(tower, path, cash, towerDef, pathUnlocked = true) {
  if (!pathUnlocked) return { ok: false, reason: 'locked' };

  const ownTiers   = path === 'A' ? tower.upgradesA : tower.upgradesB;
  const otherTiers = path === 'A' ? tower.upgradesB : tower.upgradesA;

  if (ownTiers >= MAX_TIER)  return { ok: false, reason: 'maxed' };
  if (otherTiers > 0)        return { ok: false, reason: 'path-exclusive' }; // ← new

  const pathDef = path === 'A' ? towerDef.upgrades.pathA : towerDef.upgrades.pathB;
  const tier    = pathDef.tiers[ownTiers];
  if (!tier)              return { ok: false, reason: 'nodef' };
  if (cash < tier.cost)  return { ok: false, reason: 'cash', cost: tier.cost };

  return { ok: true, tier };
}
```

The old `crosspath` reason is no longer reachable and can be removed from comments/docs.

### `src/ui/GameUI.js` — `#renderUpgrades`

In the `buildCol` helper inside `#renderUpgrades`, replace the `crosspathFull` / `crossLocked` logic with a `pathExclusive` check. When the other path has been committed to, render the entire column as a single locked button rather than listing all four tiers individually:

```js
const buildCol = (pathKey, pathChar) => {
  const pathDef    = def.upgrades[pathKey];
  const ownTiers   = pathChar === 'A' ? tower.upgradesA : tower.upgradesB;
  const otherTiers = pathChar === 'A' ? tower.upgradesB : tower.upgradesA;

  const profileLocked   = /* existing profile-lock check — unchanged */;
  const pathExclusive   = otherTiers > 0 && ownTiers === 0; // committed to the other path

  let html = `<div class="upgrade-col"><div class="path-label">${pathDef.label}</div>`;

  if (profileLocked) {
    // existing locked HTML — unchanged
  } else if (pathExclusive) {
    html += `<button class="upg-btn locked" disabled>
      🔒 Path locked
    </button>`;
  } else {
    pathDef.tiers.forEach((tier, i) => {
      if (i < ownTiers) {
        html += `<button class="upg-btn bought" disabled>✓ ${tier.name}</button>`;
      } else if (i === ownTiers) {
        // no crossLocked check needed anymore — just cash check
        if (cash >= tier.cost) {
          const delta = upgradeDeltaPreview(tower, tier.stats);
          html += `<button class="upg-btn next" data-path="${pathChar}"
            title="${tier.desc}">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
        } else {
          const delta = upgradeDeltaPreview(tower, tier.stats);
          html += `<button class="upg-btn costly" data-path="${pathChar}"
            title="Need $${tier.cost - cash} more">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
        }
      } else {
        html += `<button class="upg-btn locked" disabled>${tier.name}</button>`;
      }
    });
  }
  // ... rest of buildCol unchanged
};
```

Note: `pathExclusive` uses `ownTiers === 0` so that a path that **has** been committed to (e.g. you bought 3 tiers on A) still renders its own progress normally — only the *other* path shows the lock.

---

## Files to change

| File | Change |
|---|---|
| `src/systems/UpgradeSystem.js` | Remove `CROSSPATH_CAP`; replace crosspath guard with `otherTiers > 0` check; new reason `'path-exclusive'` |
| `src/ui/GameUI.js` | Replace `crosspathFull`/`crossLocked` logic with `pathExclusive`; render locked column when committed |

No changes to tower data files, `SaveSystem.js`, `Profile.js`, or any renderer.

---

## Notes

- Saved games with existing cross-pathed towers (e.g. A:2/B:1 from before this ticket) will load fine — the mutual-exclusion only applies at purchase time. Existing hybrid towers keep their stats; they just can't buy further on either locked path. This is acceptable as a one-time migration artifact.
- If a softer hybrid rule is ever wanted in the future (e.g. allow 1 tier crosspath), it can be re-introduced as a configurable `CROSSPATH_CAP` constant without changing the UI logic — just change `otherTiers > 0` back to `otherTiers >= CROSSPATH_CAP`.
