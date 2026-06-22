/**
 * Meta-progression profile — stored separately from the mid-run save.
 * localStorage key: tower-defence-profile-v1
 *
 * Earned stars = sum of best star ratings across all missions.
 * Available stars = earned - spent (what can be spent in the unlock tree).
 * Stars are awarded once per mission (best result kept).
 *
 * P1 — perks: account-wide bonuses applied at run start.
 *   One-time nodes (boolean check/apply) and ranked nodes (ranked: true, getRank/costAt/apply)
 *   both live in UNLOCK_TREE. Ranked nodes absorb surplus stars across many ranks.
 */

const KEY = 'tower-defence-profile-v1';

// ── Data shape ───────────────────────────────────────────────────────────────

export const KILL_MILESTONES = [1_000, 10_000, 100_000];

export function getKillStars(kills) {
  let s = 0;
  for (const m of KILL_MILESTONES) if (kills >= m) s++;
  return s;
}

export function totalAchievementStars(profile) {
  return Object.values(profile.enemyKills ?? {})
    .reduce((sum, k) => sum + getKillStars(k), 0);
}


export function defaultProfile() {
  return {
    version: 1,
    spent: 0,
    lastDiff: 'normal',
    enemyKills: {},
    // All 20 maps; absent keys default to 0 via ?? operator in isMapUnlocked
    missions: { map1: 0, map2: 0, map3: 0, map4: 0, map5: 0,
                map6: 0, map7: 0, map8: 0, map9: 0, map10: 0,
                map11: 0, map12: 0, map13: 0, map14: 0, map15: 0,
                map16: 0, map17: 0, map18: 0, map19: 0, map20: 0 },
    unlocks: {
      towers: { archer: true,  bomb: false, frost: false, marksman: false, tesla: false,
                flamethrower: false, laser: false, commandpost: false, wizard: false },
      paths:  {
        archer:       { A: true,  B: false },
        bomb:         { A: false, B: false },
        frost:        { A: false, B: false },
        marksman:     { A: false, B: false },
        tesla:        { A: false, B: false },
        flamethrower: { A: false, B: false },
        laser:        { A: false, B: false },
        commandpost:  { A: false, B: false },
        wizard:       { A: false, B: false },
      },
    },
    // P1 — global perks applied at run start. All zero = no effect.
    perks: {
      // one-time boolean flags (drive check functions below)
      reinforced: false, salvage: false, bulkDiscount: false,
      // numeric effects read during run startup
      startCash: 0,     // extra starting gold
      startLives: 0,    // extra starting lives
      sellBonus: 0,     // additive sell multiplier (base 0.60)
      towerCostPct: 0,  // fractional discount on tower costs (0–1)
      damagePct: 0,     // fractional global damage bonus (Power Core)
      interestBonus: 0, // extra interest fraction per wave (base 0.05)
      // ranked track counters
      warChestRank: 0,
      powerCoreRank: 0,
      interestRank: 0,
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
    // Migrate dart → archer rename (profiles saved before the rename have 'dart' keys)
    if (p.unlocks?.towers?.dart !== undefined && p.unlocks?.towers?.archer === undefined) {
      p.unlocks.towers.archer = p.unlocks.towers.dart;
      delete p.unlocks.towers.dart;
    }
    if (p.unlocks?.paths?.dart !== undefined && p.unlocks?.paths?.archer === undefined) {
      p.unlocks.paths.archer = p.unlocks.paths.dart;
      delete p.unlocks.paths.dart;
    }
    // Backfill any tower/path keys added after this profile was first saved
    const def = defaultProfile();
    if (!p.unlocks) p.unlocks = def.unlocks;
    for (const [k, v] of Object.entries(def.unlocks.towers)) {
      if (p.unlocks.towers[k] === undefined) p.unlocks.towers[k] = v;
    }
    for (const [k, v] of Object.entries(def.unlocks.paths)) {
      if (!p.unlocks.paths[k]) p.unlocks.paths[k] = { ...v };
    }
    if (!p.enemyKills) p.enemyKills = {};
    if (!p.lastDiff) p.lastDiff = 'normal';
    // P1 — backfill perks for profiles created before this feature
    if (!p.perks) p.perks = def.perks;
    // Migrate old boolean war-chest nodes to the ranked war chest track
    if ('warChest1' in p.perks) {
      const oldGold = (p.perks.warChest2 ? 150 : p.perks.warChest1 ? 50 : 0);
      p.perks.warChestRank = oldGold / 50;
      delete p.perks.warChest1;
      delete p.perks.warChest2;
    }
    if (p.perks.warChestRank === undefined) p.perks.warChestRank = 0;
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
  const missionStars    = Object.values(p.missions).reduce((s, v) => s + v, 0);
  const achievementStars = totalAchievementStars(p);
  return Math.max(0, missionStars + achievementStars - p.spent);
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
// Full 10-map campaign yields ~30 stars — enough to max the ranked tracks.

// Rising costs for the Compound Interest ranked track: ranks 0→1, 1→2, … 4→5
const INTEREST_COSTS = [1, 2, 2, 3, 3];

export const UNLOCK_TREE = [
  // ── Towers & paths ───────────────────────────────────────────────────────
  {
    id: 'archer-B', label: 'Archer — Path B (Arcane Poison)', group: 'towers', cost: 1, requires: null,
    check:   p => p.unlocks.paths.archer.B,
    apply:   p => { p.unlocks.paths.archer.B = true; },
    unapply: p => { p.unlocks.paths.archer.B = false; },
  },
  {
    id: 'bomb', label: 'Bomb tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.bomb,
    apply:   p => { p.unlocks.towers.bomb = true; p.unlocks.paths.bomb.A = true; },
    unapply: p => { p.unlocks.towers.bomb = false; p.unlocks.paths.bomb.A = false; },
  },
  {
    id: 'bomb-B', label: 'Bomb — Path B (Rapid)', group: 'towers', cost: 1, requires: 'bomb',
    check:   p => p.unlocks.paths.bomb.B,
    apply:   p => { p.unlocks.paths.bomb.B = true; },
    unapply: p => { p.unlocks.paths.bomb.B = false; },
  },
  {
    id: 'frost', label: 'Frost tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.frost,
    apply:   p => { p.unlocks.paths.frost.A = true; p.unlocks.towers.frost = true; },
    unapply: p => { p.unlocks.paths.frost.A = false; p.unlocks.towers.frost = false; },
  },
  {
    id: 'frost-B', label: 'Frost — Path B (Permafrost)', group: 'towers', cost: 1, requires: 'frost',
    check:   p => p.unlocks.paths.frost.B,
    apply:   p => { p.unlocks.paths.frost.B = true; },
    unapply: p => { p.unlocks.paths.frost.B = false; },
  },
  {
    id: 'marksman', label: 'Marksman tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.marksman,
    apply:   p => { p.unlocks.towers.marksman = true; p.unlocks.paths.marksman.A = true; },
    unapply: p => { p.unlocks.towers.marksman = false; p.unlocks.paths.marksman.A = false; },
  },
  {
    id: 'marksman-B', label: 'Marksman — Path B (Watchful)', group: 'towers', cost: 1, requires: 'marksman',
    check:   p => p.unlocks.paths.marksman.B,
    apply:   p => { p.unlocks.paths.marksman.B = true; },
    unapply: p => { p.unlocks.paths.marksman.B = false; },
  },
  {
    id: 'tesla', label: 'Tesla tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.tesla ?? false,
    apply:   p => { p.unlocks.towers.tesla = true; (p.unlocks.paths.tesla ??= { A: false, B: false }).A = true; },
    unapply: p => { p.unlocks.towers.tesla = false; (p.unlocks.paths.tesla ??= { A: false, B: false }).A = false; },
  },
  {
    id: 'tesla-B', label: 'Tesla — Path B (Railgun)', group: 'towers', cost: 1, requires: 'tesla',
    check:   p => p.unlocks.paths.tesla?.B ?? false,
    apply:   p => { (p.unlocks.paths.tesla ??= { A: false, B: false }).B = true; },
    unapply: p => { (p.unlocks.paths.tesla ??= { A: false, B: false }).B = false; },
  },
  {
    id: 'flamethrower', label: 'Flamethrower tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.flamethrower ?? false,
    apply:   p => { p.unlocks.towers.flamethrower = true; (p.unlocks.paths.flamethrower ??= { A: false, B: false }).A = true; },
    unapply: p => { p.unlocks.towers.flamethrower = false; (p.unlocks.paths.flamethrower ??= { A: false, B: false }).A = false; },
  },
  {
    id: 'flamethrower-B', label: 'Flamethrower — Path B', group: 'towers', cost: 1, requires: 'flamethrower',
    check:   p => p.unlocks.paths.flamethrower?.B ?? false,
    apply:   p => { (p.unlocks.paths.flamethrower ??= { A: false, B: false }).B = true; },
    unapply: p => { (p.unlocks.paths.flamethrower ??= { A: false, B: false }).B = false; },
  },
  {
    id: 'laser', label: 'Laser tower', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.laser ?? false,
    apply:   p => { p.unlocks.towers.laser = true; (p.unlocks.paths.laser ??= { A: false, B: false }).A = true; },
    unapply: p => { p.unlocks.towers.laser = false; (p.unlocks.paths.laser ??= { A: false, B: false }).A = false; },
  },
  {
    id: 'laser-B', label: 'Laser — Path B', group: 'towers', cost: 1, requires: 'laser',
    check:   p => p.unlocks.paths.laser?.B ?? false,
    apply:   p => { (p.unlocks.paths.laser ??= { A: false, B: false }).B = true; },
    unapply: p => { (p.unlocks.paths.laser ??= { A: false, B: false }).B = false; },
  },
  {
    id: 'commandpost', label: 'Command Post tower', group: 'towers', cost: 2, requires: null,
    check:   p => p.unlocks.towers.commandpost ?? false,
    apply:   p => { p.unlocks.towers.commandpost = true; (p.unlocks.paths.commandpost ??= { A: false, B: false }).A = true; },
    unapply: p => { p.unlocks.towers.commandpost = false; (p.unlocks.paths.commandpost ??= { A: false, B: false }).A = false; },
  },
  {
    id: 'commandpost-B', label: 'Command Post — Path B (Spotter / camo reveal)', group: 'towers', cost: 1, requires: 'commandpost',
    check:   p => p.unlocks.paths.commandpost?.B ?? false,
    apply:   p => { (p.unlocks.paths.commandpost ??= { A: false, B: false }).B = true; },
    unapply: p => { (p.unlocks.paths.commandpost ??= { A: false, B: false }).B = false; },
  },
  {
    id: 'wizard', label: 'Wizard tower (ignores armour)', group: 'towers', cost: 3, requires: null,
    check:   p => p.unlocks.towers.wizard ?? false,
    apply:   p => { p.unlocks.towers.wizard = true; (p.unlocks.paths.wizard ??= { A: false, B: false }).A = true; },
    unapply: p => { p.unlocks.towers.wizard = false; (p.unlocks.paths.wizard ??= { A: false, B: false }).A = false; },
  },
  {
    id: 'wizard-B', label: 'Wizard — Path B (Necro)', group: 'towers', cost: 1, requires: 'wizard',
    check:   p => p.unlocks.paths.wizard?.B ?? false,
    apply:   p => { (p.unlocks.paths.wizard ??= { A: false, B: false }).B = true; },
    unapply: p => { (p.unlocks.paths.wizard ??= { A: false, B: false }).B = false; },
  },

  // ── P2 — One-time global perks ───────────────────────────────────────────
  {
    id: 'war-chest', label: 'War Chest', group: 'perks',
    ranked: true,
    desc: '+50 starting gold per rank — unlimited',
    getRank:  p => p.perks?.warChestRank ?? 0,
    costAt:   rank => rank + 2,
    nextDesc: rank => `+50 gold (→ $${(rank + 1) * 50} total)`,
    apply:   p => { p.perks.warChestRank++;  p.perks.startCash += 50; },
    unapply: p => { p.perks.warChestRank--;  p.perks.startCash -= 50; },
  },
  {
    id: 'reinforced', label: 'Reinforced', group: 'perks', cost: 2, requires: null,
    desc: '+5 starting lives each run',
    check:   p => p.perks?.reinforced ?? false,
    apply:   p => { p.perks.reinforced = true;  p.perks.startLives += 5; },
    unapply: p => { p.perks.reinforced = false; p.perks.startLives -= 5; },
  },
  {
    id: 'salvage', label: 'Salvage', group: 'perks', cost: 2, requires: null,
    desc: '+15% sell value on all towers',
    check:   p => p.perks?.salvage ?? false,
    apply:   p => { p.perks.salvage = true;  p.perks.sellBonus += 0.15; },
    unapply: p => { p.perks.salvage = false; p.perks.sellBonus -= 0.15; },
  },
  {
    id: 'bulk-discount', label: 'Bulk Discount', group: 'perks', cost: 3, requires: null,
    desc: 'All towers cost 8% less',
    check:   p => p.perks?.bulkDiscount ?? false,
    apply:   p => { p.perks.bulkDiscount = true;  p.perks.towerCostPct += 0.08; },
    unapply: p => { p.perks.bulkDiscount = false; p.perks.towerCostPct -= 0.08; },
  },

  // ── P3 — Ranked star-sink tracks ────────────────────────────────────────
  {
    id: 'power-core', label: 'Power Core', group: 'perks',
    ranked: true, maxRank: 10,
    desc: '+3% global tower damage per rank — max +30%',
    getRank:  p => p.perks?.powerCoreRank ?? 0,
    costAt:   rank => Math.ceil((rank + 1) / 2),
    nextDesc: rank => `+3% dmg (total ${(rank + 1) * 3}%)`,
    apply:   p => { p.perks.powerCoreRank++; p.perks.damagePct  = +(p.perks.damagePct  + 0.03).toFixed(4); },
    unapply: p => { p.perks.powerCoreRank--; p.perks.damagePct  = +(p.perks.damagePct  - 0.03).toFixed(4); },
  },
  {
    id: 'interest-plus', label: 'Compound Interest', group: 'perks',
    ranked: true, maxRank: 5,
    desc: '+1% end-of-wave interest per rank — max 10% total',
    getRank:  p => p.perks?.interestRank ?? 0,
    costAt:   rank => INTEREST_COSTS[rank] ?? 99,
    nextDesc: rank => `+1% interest (→ ${6 + rank}%/wave)`,
    apply:   p => { p.perks.interestRank++; p.perks.interestBonus = +(p.perks.interestBonus + 0.01).toFixed(4); },
    unapply: p => { p.perks.interestRank--; p.perks.interestBonus = +(p.perks.interestBonus - 0.01).toFixed(4); },
  },
];

// ── Tree helpers ─────────────────────────────────────────────────────────────

export function isNodeOwned(p, node) {
  if (node.ranked) return (node.getRank(p) ?? 0) >= node.maxRank;
  return node.check(p);
}

export function canUnlock(p, node) {
  if (isNodeOwned(p, node)) return false;
  const cost = node.ranked ? node.costAt(node.getRank(p) ?? 0) : node.cost;
  if (availableStars(p) < cost) return false;
  if (node.requires) {
    const req = UNLOCK_TREE.find(n => n.id === node.requires);
    if (req && !isNodeOwned(p, req)) return false;
  }
  return true;
}

export function applyUnlock(p, node) {
  if (!canUnlock(p, node)) return false;
  const cost = node.ranked ? node.costAt(node.getRank(p) ?? 0) : node.cost;
  node.apply(p);
  p.spent += cost;
  return true;
}

/** True if a single purchase can be individually refunded. */
export function canRefund(p, node) {
  if (node.ranked) return (node.getRank(p) ?? 0) > 0;
  if (!isNodeOwned(p, node)) return false;
  // Block refund if another owned node depends on this one
  return !UNLOCK_TREE.some(n => n.requires === node.id && isNodeOwned(p, n));
}

/** Refund a single node purchase, restoring its star cost. Returns true on success. */
export function refundUnlock(p, node) {
  if (!canRefund(p, node)) return false;
  const rank = node.ranked ? (node.getRank(p) ?? 1) : null;
  const cost = node.ranked ? node.costAt(rank - 1) : node.cost;
  node.unapply(p);
  p.spent -= cost;
  return true;
}

/** Refunds all spent stars; resets unlocks and perks to default. Keeps earned mission ratings. */
export function respec(p) {
  const fresh = defaultProfile();
  fresh.missions = { ...p.missions };
  return fresh;
}
