export const MAX_TIER = 4;

/**
 * Returns whether the next tier on `path` ('A'|'B') can be purchased.
 * Paths are mutually exclusive — any purchase on one path locks the other.
 * Reasons for failure: 'locked' | 'maxed' | 'path-exclusive' | 'cash' | 'nodef'.
 */
export function canBuyUpgrade(tower, path, cash, towerDef, pathUnlocked = true) {
  if (!pathUnlocked) return { ok: false, reason: 'locked' };
  const ownTiers   = path === 'A' ? tower.upgradesA : tower.upgradesB;
  const otherTiers = path === 'A' ? tower.upgradesB : tower.upgradesA;

  if (ownTiers >= MAX_TIER) return { ok: false, reason: 'maxed' };
  if (otherTiers > 0)       return { ok: false, reason: 'path-exclusive' };

  const pathDef = path === 'A' ? towerDef.upgrades.pathA : towerDef.upgrades.pathB;
  const tier    = pathDef.tiers[ownTiers];
  if (!tier)            return { ok: false, reason: 'nodef' };
  if (cash < tier.cost) return { ok: false, reason: 'cash', cost: tier.cost };

  return { ok: true, tier };
}

/** Mutates tower, applying all stat deltas from the tier definition. */
export function applyTier(tower, tier) {
  for (const [key, val] of Object.entries(tier.stats)) {
    if (typeof val === 'boolean') {
      tower[key] = val;
    } else {
      tower[key] = (tower[key] ?? 0) + val;
      if (key === 'slowFactor') tower[key] = Math.max(0.05, tower[key]);
    }
  }
}
