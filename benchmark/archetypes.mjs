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
