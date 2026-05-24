/**
 * Meta-progression profile — stored separately from the mid-run save.
 * localStorage key: tower-defence-profile-v1
 *
 * Earned stars = sum of best star ratings across all missions.
 * Available stars = earned - spent (what can be spent in the unlock tree).
 * Stars are awarded once per mission (best result kept).
 */

const KEY = 'tower-defence-profile-v1';

// ── Data shape ───────────────────────────────────────────────────────────────

export function defaultProfile() {
  return {
    version: 1,
    spent: 0,
    // All 10 maps; absent keys default to 0 via ?? operator in isMapUnlocked
    missions: { map1: 0, map2: 0, map3: 0, map4: 0, map5: 0,
                map6: 0, map7: 0, map8: 0, map9: 0, map10: 0 },
    unlocks: {
      towers: { dart: true,  bomb: false, frost: false, marksman: false },
      paths:  {
        dart:     { A: true,  B: false },
        bomb:     { A: false, B: false },
        frost:    { A: false, B: false },
        marksman: { A: false, B: false },
      },
    },
  };
}

// ── Persistence ──────────────────────────────────────────────────────────────

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProfile();
    const p = JSON.parse(raw);
    if (p?.version !== 1) {
      console.warn('[Profile] Incompatible or corrupt profile (version mismatch) — resetting to default.');
      return defaultProfile();
    }
    return p;
  } catch { return defaultProfile(); }
}

export function saveProfile(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function resetProfile() {
  localStorage.removeItem(KEY);
  return defaultProfile();
}

// ── Derived values ───────────────────────────────────────────────────────────

export function availableStars(p) {
  const earned = Object.values(p.missions).reduce((s, v) => s + v, 0);
  return Math.max(0, earned - p.spent);
}

export function isTowerUnlocked(p, type) {
  return p.unlocks.towers[type] ?? false;
}

export function isPathUnlocked(p, type, pathChar) {
  return p.unlocks.paths[type]?.[pathChar] ?? false;
}

/** Keeps the best rating. Returns whether the stored value changed. */
export function recordMissionResult(p, mapKey, stars) {
  const prev = p.missions[mapKey] ?? 0;
  if (stars > prev) { p.missions[mapKey] = stars; return true; }
  return false;
}

/**
 * C1 — Map unlock gate.
 * Map 1 is always unlocked. Each subsequent map (by CAMPAIGN_ORDER) requires ≥1
 * star on the previous map. CAMPAIGN_ORDER is passed in to avoid a circular import.
 * @param {object}   profile
 * @param {string}   mapKey
 * @param {string[]} campaignOrder  — imported from data/maps.js
 */
export function isMapUnlocked(profile, mapKey, campaignOrder) {
  const idx = campaignOrder.indexOf(mapKey);
  if (idx <= 0) return true; // map1 always unlocked
  const prevKey = campaignOrder[idx - 1];
  return (profile.missions[prevKey] ?? 0) >= 1;
}

// ── Unlock tree ───────────────────────────────────────────────────────────────
// Costs tuned so 6 stars (2 maps × 3 max) unlocks a satisfying chunk.

export const UNLOCK_TREE = [
  {
    id: 'dart-B', label: 'Dart — Path B (Quick)', cost: 1, requires: null,
    check: p => p.unlocks.paths.dart.B,
    apply: p => { p.unlocks.paths.dart.B = true; },
  },
  {
    id: 'bomb', label: 'Bomb tower', cost: 2, requires: null,
    check: p => p.unlocks.towers.bomb,
    apply: p => { p.unlocks.towers.bomb = true; p.unlocks.paths.bomb.A = true; },
  },
  {
    id: 'bomb-B', label: 'Bomb — Path B (Rapid)', cost: 1, requires: 'bomb',
    check: p => p.unlocks.paths.bomb.B,
    apply: p => { p.unlocks.paths.bomb.B = true; },
  },
  {
    id: 'frost', label: 'Frost tower', cost: 2, requires: null,
    check: p => p.unlocks.towers.frost,
    apply: p => { p.unlocks.towers.frost = true; p.unlocks.paths.frost.A = true; },
  },
  {
    id: 'frost-B', label: 'Frost — Path B (Permafrost)', cost: 1, requires: 'frost',
    check: p => p.unlocks.paths.frost.B,
    apply: p => { p.unlocks.paths.frost.B = true; },
  },
  {
    id: 'marksman', label: 'Marksman tower', cost: 3, requires: null,
    check: p => p.unlocks.towers.marksman,
    apply: p => { p.unlocks.towers.marksman = true; p.unlocks.paths.marksman.A = true; },
  },
  {
    id: 'marksman-B', label: 'Marksman — Path B (Watchful)', cost: 1, requires: 'marksman',
    check: p => p.unlocks.paths.marksman.B,
    apply: p => { p.unlocks.paths.marksman.B = true; },
  },
];

export function isNodeOwned(p, node) {
  return node.check(p);
}

export function canUnlock(p, node) {
  if (isNodeOwned(p, node)) return false;
  if (availableStars(p) < node.cost) return false;
  if (node.requires) {
    const req = UNLOCK_TREE.find(n => n.id === node.requires);
    if (req && !isNodeOwned(p, req)) return false;
  }
  return true;
}

export function applyUnlock(p, node) {
  if (!canUnlock(p, node)) return false;
  node.apply(p);
  p.spent += node.cost;
  return true;
}

/** Refunds all spent stars; resets unlocks to default. Keeps earned mission ratings. */
export function respec(p) {
  const fresh = defaultProfile();
  fresh.missions = { ...p.missions };
  return fresh;
}
