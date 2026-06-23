/**
 * benchmark/run.mjs — headless runner
 *
 * Runs a full map simulation in Node without a browser, renderer, or audio.
 * Usage:  node benchmark/run.mjs [mapKey] [diffKey] [archetype]
 * Example: node benchmark/run.mjs map1 normal competent
 *
 * Module-singleton bleed warning: enemyPool, projectilePool, and CombatSystem
 * buff state are module-level. resetPools() is called before each run.
 */

import { createSimulation }    from '../src/core/Simulation.js';
import { createTelemetry }     from '../src/core/Telemetry.js';
import { defaultProfile }      from '../src/core/Profile.js';
import { resetEnemyPool }      from '../src/entities/Enemy.js';
import { resetProjectilePool } from '../src/entities/Projectile.js';
import { markBuffsDirty }      from '../src/systems/CombatSystem.js';
import { naive, competent, optimal, withBomb, withFrost, progression } from './archetypes.mjs';

const ARCHETYPES = { naive, competent, optimal, withBomb, withFrost, progression };

// Static wave registry — Node cannot use import.meta.glob (Vite-only).
// Add entries here as new maps are benchmarked.
import { WAVES as map1  } from '../src/data/waves-map1.js';
import { WAVES as map2  } from '../src/data/waves-map2.js';
import { WAVES as map3  } from '../src/data/waves-map3.js';
import { WAVES as map4  } from '../src/data/waves-map4.js';
import { WAVES as map5  } from '../src/data/waves-map5.js';
import { WAVES as map6  } from '../src/data/waves-map6.js';
import { WAVES as map7  } from '../src/data/waves-map7.js';
import { WAVES as map8  } from '../src/data/waves-map8.js';
import { WAVES as map9  } from '../src/data/waves-map9.js';
import { WAVES as map10 } from '../src/data/waves-map10.js';

const WAVES_MAP = { map1, map2, map3, map4, map5, map6, map7, map8, map9, map10 };

const SIM_DT      = 1 / 60;   // fixed timestep matching the browser loop
const WAVE_BUDGET = 60 * 180; // max steps per wave: 3 game-minutes at 60fps

/** Reset module-level singletons so batch runs don't bleed state. */
function resetPools() {
  resetEnemyPool();
  resetProjectilePool();
  markBuffsDirty();
}

/**
 * Run one full simulation.
 * @param {object} opts
 * @param {string} [opts.mapKey='map1']
 * @param {string} [opts.diffKey='normal']
 * @param {string|null} [opts.archetype=null]  — 'naive' | 'competent' | 'optimal' | null
 * @returns {{ map, diff, archetype, finalLives, finalCash, towerCount, score, win, lossWave, elapsed, waves, summary }}
 */
export async function run({ mapKey = 'map1', diffKey = 'normal', archetype = null, extraCash = 0, profile: inputProfile = null } = {}) {
  const waves = WAVES_MAP[mapKey];
  if (!waves) throw new Error(`Unknown map: ${mapKey}. Available: ${Object.keys(WAVES_MAP).join(', ')}`);

  resetPools();
  const buyFn = archetype ? ARCHETYPES[archetype] : null;

  const profile   = inputProfile ?? defaultProfile();
  if (!inputProfile && extraCash) profile.perks.startCash = extraCash;
  const telemetry = createTelemetry();

  const sim = createSimulation({
    mapKey,
    diffKey,
    waves,
    profile,
    perks:   profile.perks ?? {},
    sandbox: false,
    events:  { emit() {} },  // headless: all side-effects are no-ops
  });
  sim.profile = profile; // expose to archetypes for unlock checks

  const t0 = Date.now();
  let lossWave = null;

  for (let wi = 0; wi < waves.length; wi++) {
    if (sim.state.gameOver) { lossWave = wi; break; }

    sim.state.autoStartTimer = 0; // controller drives pacing — never auto-start
    buyFn?.(sim);
    telemetry.waveStart(sim.state, wi); // waveStart is wired via event adapter in-browser; call directly here
    sim.startWave(wi);

    let steps = 0;
    while (sim.state.waveActive && !sim.state.gameOver && steps < WAVE_BUDGET) {
      sim.step(SIM_DT, telemetry);
      steps++;
    }

    if (steps >= WAVE_BUDGET) {
      console.warn(`[benchmark] wave ${wi + 1} hit step budget — possible infinite loop`);
    }

    sim.state.autoStartTimer = 0; // prevent auto-start before next iteration
  }

  const elapsed = Date.now() - t0;
  const s = sim.state;

  return {
    map:        mapKey,
    diff:       diffKey,
    archetype:  archetype ?? 'none',
    finalLives: s.lives,
    finalCash:  s.cash,
    towerCount: s.towers.length,
    score:      s.score,
    win:        !s.gameOver || (s.waveIndex >= waves.length - 1 && s.lives > 0),
    lossWave,
    elapsed,
    waves:      telemetry.log,
    summary:    telemetry.summary(),
  };
}

// ── CLI entry ────────────────────────────────────────────────────────────────
if (process.argv[1] && process.argv[1].endsWith('run.mjs')) {
  const [,, mapArg = 'map1', diffArg = 'normal', archetypeArg = null, extraCashArg = '0'] = process.argv;
  const result = await run({ mapKey: mapArg, diffKey: diffArg, archetype: archetypeArg, extraCash: Number(extraCashArg) });
  console.log(`\n=== ${result.map} / ${result.diff} / ${result.archetype} ===`);
  console.log(result.summary);
  console.log(`\nFinal lives : ${result.finalLives}`);
  console.log(`Final cash  : $${result.finalCash}`);
  console.log(`Towers      : ${result.towerCount}`);
  console.log(`Win         : ${result.win}`);
  console.log(`Elapsed     : ${result.elapsed}ms`);
  if (result.lossWave !== null) console.log(`Lost on wave: ${result.lossWave + 1}`);
}
