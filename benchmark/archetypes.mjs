/**
 * benchmark/archetypes.mjs — player archetypes for headless simulation.
 *
 * Each archetype exports a `buy(sim)` function called before every wave.
 * All three operate on a fresh-profile run (Archer only, Path A only,
 * 125 starting cash, 20 lives, Normal difficulty).
 *
 * naive     — clusters near the start, buys cheapest, no strategy
 * competent — spreads coverage along the full path, small cash reserve
 * optimal   — maximises path coverage + upgrades first powerful tower
 */

import { createTower }    from '../src/entities/Tower.js';
import { isPositionFree } from '../src/core/Grid.js';
import { markBuffsDirty } from '../src/systems/CombatSystem.js';
import { TOWER_TYPES }    from '../src/data/towers.js';
import { positionAtDistance } from '../src/core/Path.js';

const ARCHER_COST = TOWER_TYPES.archer.cost; // 50

/** Returns true if this tower type is available to place (respects unlock profile). */
function isUnlocked(sim, towerType) {
  if (!sim.profile) return true; // no profile = all available (backward compat / sandbox)
  return sim.profile.unlocks?.towers?.[towerType] ?? false;
}

/** Sample candidate tower positions perpendicular to the path. */
function candidates(paths) {
  const result = [];
  const SAMPLE_STEP = 130; // px between samples along the path
  const OFFSETS     = [55, -55, 78, -78, 100, -100]; // px perpendicular

  for (const path of paths) {
    for (let d = SAMPLE_STEP; d < path.totalLength - 60; d += SAMPLE_STEP) {
      const pos  = positionAtDistance(path, d);
      const pos2 = positionAtDistance(path, Math.min(d + 8, path.totalLength));
      const dx = pos2.x - pos.x, dy = pos2.y - pos.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const px = -dy / len, py = dx / len; // perpendicular unit vector
      for (const off of OFFSETS) {
        result.push({
          x: Math.round(pos.x + px * off),
          y: Math.round(pos.y + py * off),
          d,
        });
      }
    }
  }
  return result;
}

/** Try to place a tower; returns true on success. */
function place(type, x, y, state, pathsWaypoints) {
  const cost = TOWER_TYPES[type].cost;
  if (state.cash < cost) return false;
  if (!isPositionFree(x, y, pathsWaypoints, state.towers)) return false;
  state.towers.push(createTower(type, x, y));
  markBuffsDirty();
  state.cash -= cost;
  return true;
}

// ── Naive ─────────────────────────────────────────────────────────────────────
// Front-loads towers near the path entry; spends everything.
export function naive(sim) {
  const pw = sim.paths.map(p => p.waypoints);
  const pool = candidates(sim.paths).sort((a, b) => a.d - b.d); // front first
  for (const c of pool) {
    if (sim.state.cash < ARCHER_COST) break;
    place('archer', c.x, c.y, sim.state, pw);
  }
}

// ── Competent ─────────────────────────────────────────────────────────────────
// Spreads coverage evenly along the full path; keeps a small cash buffer.
// Uses unlocked towers (bomb, marksman) when available — models a player who
// actually spends their unlock stars and puts the towers to work.
export function competent(sim) {
  const RESERVE   = 0; // benchmark buys only between waves — no mid-wave emergency buffer needed
  const pw        = sim.paths.map(p => p.waypoints);
  const pathLen   = sim.paths[0].totalLength;

  // Place bomb towers if unlocked and affordable.
  // Pre-W1: cap at 1 bomb so cash remains for ≥1 supporting archer.
  // W2+: allow 2 bombs once kill income has built the wallet.
  if (isUnlocked(sim, 'bomb')) {
    const BOMB_COST = TOWER_TYPES.bomb.cost;
    const maxBombs  = sim.state.waveIndex < 0 ? 1 : 2;
    let bombCount   = sim.state.towers.filter(t => t.type === 'bomb').length;
    const bombSlots = candidates(sim.paths)
      .filter(c => { const pct = c.d / pathLen; return pct >= 0.25 && pct <= 0.65; })
      .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers));
    for (const c of bombSlots) {
      if (bombCount >= maxBombs) break;
      if (sim.state.cash < BOMB_COST) break;
      if (place('bomb', c.x, c.y, sim.state, pw)) bombCount++;
    }
  }

  const pool = candidates(sim.paths)
    .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers))
    .sort((a, b) => {
      // Prefer positions not yet near an existing tower (spread coverage)
      const minDistA = sim.state.towers.reduce((m, t) => Math.min(m, (t.x - a.x) ** 2 + (t.y - a.y) ** 2), Infinity);
      const minDistB = sim.state.towers.reduce((m, t) => Math.min(m, (t.x - b.x) ** 2 + (t.y - b.y) ** 2), Infinity);
      return minDistB - minDistA; // furthest from existing towers first
    });

  for (const c of pool) {
    if (sim.state.cash - ARCHER_COST < RESERVE) break;
    place('archer', c.x, c.y, sim.state, pw);
  }
}

// ── WithBomb ──────────────────────────────────────────────────────────────────
// Archers first wave (starting cash only), then mixes in bomb towers from wave 2
// onward once kill income makes them affordable. Models a player who unlocked
// Bomb to handle tanks/armour. Bomb: $125, AOE damage.
export function withBomb(sim) {
  if (!isUnlocked(sim, 'bomb')) { competent(sim); return; } // fall back if not unlocked
  const RESERVE   = 25;
  const BOMB_COST = TOWER_TYPES.bomb.cost; // 125
  const pw        = sim.paths.map(p => p.waypoints);

  // Delegate everything to competent — it now handles bomb placement at any wave
  // (including pre-W1 since bomb costs $75, affordable alongside ≥1 archer).
  competent(sim);
}

// ── WithFrost ─────────────────────────────────────────────────────────────────
// Places frost towers at 20 / 50 / 80% of path length — one per section so
// every part of the route has a slow zone. Then packs archers inside each
// frost's range circle (kill zone): enemies are slowed the moment they enter
// the frost radius and shredded by the surrounding archers while crawling.
// Remaining cash fills general coverage via competent.
export function withFrost(sim) {
  // Frost buys bomb in the campaign before frost; fall back to withBomb strategy
  // when frost isn't unlocked so the run still uses the available tower type.
  if (!isUnlocked(sim, 'frost')) { withBomb(sim); return; }
  const FROST_COST  = TOWER_TYPES.frost.cost;   // 75
  const FROST_RANGE = TOWER_TYPES.frost.range;   // 140
  const RESERVE     = 25;
  const pw          = sim.paths.map(p => p.waypoints);
  const pathLen     = sim.paths[0].totalLength;

  // Before W1: archers only — frost deals no damage.
  if (sim.state.waveIndex < 0) { competent(sim); return; }

  // 1. Place up to 3 frost towers, one per path section (20% / 50% / 80%).
  //    Wait until we can afford frost + at least 1 kill-zone archer + reserve,
  //    so frost never sits alone with no archers around it.
  const FROST_TARGETS = [0.20, 0.50, 0.80];
  const FROST_BUNDLE  = FROST_COST + ARCHER_COST + RESERVE; // $150
  let frostCount = sim.state.towers.filter(t => t.type === 'frost').length;
  for (let i = frostCount; i < FROST_TARGETS.length; i++) {
    if (sim.state.cash < FROST_BUNDLE) break; // wait until we can also fill 1 kill-zone slot
    const targetD = FROST_TARGETS[i] * pathLen;
    const slot = candidates(sim.paths)
      .filter(c => Math.abs(c.d - targetD) <= pathLen * 0.15)
      .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers))
      .sort((a, b) => Math.abs(a.d - targetD) - Math.abs(b.d - targetD))[0];
    if (slot && place('frost', slot.x, slot.y, sim.state, pw)) frostCount++;
  }

  // 2. Pack archers inside each frost's range circle — closest to each frost first
  //    so the densest kill zone forms around the tower centre.
  const frostTowers = sim.state.towers.filter(t => t.type === 'frost');
  if (frostTowers.length > 0) {
    const kzPool = candidates(sim.paths)
      .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers))
      .filter(c => frostTowers.some(ft =>
        (ft.x - c.x) ** 2 + (ft.y - c.y) ** 2 <= FROST_RANGE ** 2
      ))
      .sort((a, b) => {
        const da = Math.min(...frostTowers.map(ft => (ft.x-a.x)**2 + (ft.y-a.y)**2));
        const db = Math.min(...frostTowers.map(ft => (ft.x-b.x)**2 + (ft.y-b.y)**2));
        return da - db; // tightest to frost first
      });
    for (const c of kzPool) {
      if (sim.state.cash - ARCHER_COST < RESERVE) break;
      place('archer', c.x, c.y, sim.state, pw);
    }
  }

  // 3. Remaining cash → general path coverage (also builds income while saving for frost).
  competent(sim);
}

// ── Progression ───────────────────────────────────────────────────────────────
// Star-aware archetype: uses whatever the player has unlocked.
// Strategy: front-load archers in the 10–50% zone (kill zone), upgrade T1 first,
// then add bomb/marksman when unlocked. Never wastes slots in the dead back half.
export function progression(sim) {
  const RESERVE        = 0;
  const pw             = sim.paths.map(p => p.waypoints);
  const pathLen        = sim.paths[0].totalLength;
  const bombUnlocked     = isUnlocked(sim, 'bomb');
  const marksmanUnlocked = isUnlocked(sim, 'marksman');

  // Before W1: if bomb is unlocked, buy it immediately ($75 fits with the $125 start)
  // then let any remaining cash go to archers below. If bomb is not yet unlocked,
  // fall through to archer-only front-clustering as before.
  if (sim.state.waveIndex < 0 && !bombUnlocked) {
    naive(sim);
    return;
  }

  // Buy bombs as soon as affordable — no tower-count gate, since at $75 a bomb
  // fits in the opening budget and matters immediately against armoured.
  if (bombUnlocked) {
    const BOMB_COST = TOWER_TYPES.bomb.cost;
    let bombCount   = sim.state.towers.filter(t => t.type === 'bomb').length;
    const bombSlots = candidates(sim.paths)
      .filter(c => { const pct = c.d / pathLen; return pct >= 0.20 && pct <= 0.60; })
      .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers));
    for (const c of bombSlots) {
      if (bombCount >= 2) break;
      if (sim.state.cash < BOMB_COST) break;
      if (place('bomb', c.x, c.y, sim.state, pw)) bombCount++;
    }
  }

  // Upgrade first two archers to T1 once we have solid coverage (6+ towers)
  if (sim.state.towers.length >= 6) {
    const archers = sim.state.towers.filter(t => t.type === 'archer');
    for (const a of archers.slice(0, 2)) {
      if (a.upgradesA > 0) continue;
      const def  = TOWER_TYPES[a.type];
      const tier = def.upgrades?.pathA?.tiers?.[0];
      if (tier && sim.state.cash - tier.cost >= RESERVE) {
        sim.state.cash -= tier.cost;
        a.upgradeSpent = (a.upgradeSpent ?? 0) + tier.cost;
        Object.assign(a, tier.stats ?? {});
        a.upgradesA = 1;
        markBuffsDirty();
      }
    }
  }

  // Buy 1 marksman at 50–80% if unlocked — covers the far section without crowding front
  if (marksmanUnlocked) {
    const MARKSMAN_COST = TOWER_TYPES.marksman.cost; // 125
    const mCount = sim.state.towers.filter(t => t.type === 'marksman').length;
    if (mCount < 1) {
      const mSlots = candidates(sim.paths)
        .filter(c => { const pct = c.d / pathLen; return pct >= 0.50 && pct <= 0.80; })
        .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers));
      for (const c of mSlots) {
        if (sim.state.cash - MARKSMAN_COST < RESERVE) break;
        if (place('marksman', c.x, c.y, sim.state, pw)) break;
      }
    }
  }

  // Fill remaining cash with archers in the front zone; competent handles any overflow
  const frontPool = candidates(sim.paths)
    .filter(c => { const pct = c.d / pathLen; return pct >= 0.10 && pct <= 0.50; })
    .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers))
    .sort((a, b) => {
      const dA = sim.state.towers.reduce((m, t) => Math.min(m, (t.x-a.x)**2+(t.y-a.y)**2), Infinity);
      const dB = sim.state.towers.reduce((m, t) => Math.min(m, (t.x-b.x)**2+(t.y-b.y)**2), Infinity);
      return dB - dA;
    });
  for (const c of frontPool) {
    if (sim.state.cash - ARCHER_COST < RESERVE) break;
    place('archer', c.x, c.y, sim.state, pw);
  }

  competent(sim); // overflow into 50–100% zone once front is saturated
}

// ── Optimal ───────────────────────────────────────────────────────────────────
// Full-path coverage + upgrades the lead tower once it can afford to.
export function optimal(sim) {
  const pw = sim.paths.map(p => p.waypoints);

  // Only upgrade once we have enough coverage (at least 6 towers placed).
  // Find the first archer — not just towers[0] which may now be a bomb.
  const leader = sim.state.towers.find(t => t.type === 'archer');
  if (leader && leader.upgradesA < 2 && sim.state.towers.length >= 6) {
    // apply tier manually (mirrors ui.onUpgrade logic)
    const def  = TOWER_TYPES[leader.type];
    const tier = def.upgrades?.pathA?.tiers?.[leader.upgradesA];
    if (tier && sim.state.cash >= tier.cost) {
      sim.state.cash  -= tier.cost;
      leader.upgradeSpent += tier.cost;
      Object.assign(leader, tier.stats ?? {});
      leader.upgradesA++;
      markBuffsDirty();
    }
  }

  // Then spend remaining cash on new towers (competent spread)
  competent(sim);
}
