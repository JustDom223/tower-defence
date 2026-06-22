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
export function competent(sim) {
  const RESERVE   = 25; // keep $25 back — just enough buffer to not spend last dollar
  const pw        = sim.paths.map(p => p.waypoints);
  const pool      = candidates(sim.paths)
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
  const RESERVE   = 25;
  const BOMB_COST = TOWER_TYPES.bomb.cost; // 125
  const pw        = sim.paths.map(p => p.waypoints);

  // Before wave 1: starting cash only — buy archers, no bomb yet
  if (sim.state.waveIndex < 0) { competent(sim); return; }

  // Wave 2+: place up to 2 bombs at mid-path, then fill with archers
  const pathLen   = sim.paths[0].totalLength;
  const bombSlots = candidates(sim.paths)
    .filter(c => { const pct = c.d / pathLen; return pct >= 0.25 && pct <= 0.65; })
    .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers));

  let placed = sim.state.towers.filter(t => t.type === 'bomb').length;
  for (const c of bombSlots) {
    if (placed >= 2) break;
    if (sim.state.cash - BOMB_COST < RESERVE) continue;
    if (place('bomb', c.x, c.y, sim.state, pw)) placed++;
  }

  competent(sim);
}

// ── WithFrost ─────────────────────────────────────────────────────────────────
// Buys frost opportunistically once affordable (20–50% path), then spreads
// archers across the full path via competent. No kill-zone clustering — on
// multi-row maps that would pin all towers to row 1.
export function withFrost(sim) {
  const FROST_COST = TOWER_TYPES.frost.cost; // 75
  const pw         = sim.paths.map(p => p.waypoints);
  const pathLen    = sim.paths[0].totalLength;
  const frostOwned = sim.state.towers.filter(t => t.type === 'frost').length;

  // Before W1: just archers — frost deals no damage and wastes starting cash.
  if (sim.state.waveIndex < 0) { competent(sim); return; }

  if (frostOwned < 2) {
    const frostSlots = candidates(sim.paths)
      .filter(c => { const pct = c.d / pathLen; return pct >= 0.20 && pct <= 0.50; })
      .filter(c => isPositionFree(c.x, c.y, pw, sim.state.towers));
    let newFrost = 0;
    for (const c of frostSlots) {
      if (frostOwned + newFrost >= 2) break;
      if (sim.state.cash < FROST_COST) break;
      if (place('frost', c.x, c.y, sim.state, pw)) newFrost++;
    }
  }

  competent(sim);
}

// ── Optimal ───────────────────────────────────────────────────────────────────
// Full-path coverage + upgrades the lead tower once it can afford to.
export function optimal(sim) {
  const pw = sim.paths.map(p => p.waypoints);

  // Only upgrade once we have enough coverage (at least 6 towers placed)
  const leader = sim.state.towers[0];
  if (leader && leader.upgradesA < 2 && sim.state.cash >= 160 && sim.state.towers.length >= 6) {
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
