import { enemyPool }            from '../entities/Enemy.js';
import { positionAtDistance }   from './Path.js';
import { buildPaths }           from './Path.js';
import { MAPS }                 from '../data/maps.js';
import { DIFFICULTIES }         from '../data/difficulties.js';
import { WaveSpawner }          from '../systems/WaveSpawner.js';
import { updateMovement }       from '../systems/MovementSystem.js';
import { updateCombat, markBuffsDirty } from '../systems/CombatSystem.js';
import { updateDoT }            from '../systems/DoTSystem.js';
import { updateGroundHazards }  from '../systems/GroundHazardSystem.js';

/**
 * createSimulation — render-free game simulation factory.
 *
 * Owns the full per-tick game logic (wave spawning, movement, combat, DoT,
 * hazards, leak/kill accounting, win/lose). All side-effects (audio, DOM,
 * save I/O) are replaced with events.emit() calls so this module runs in
 * both the browser (via main.js adapter) and a headless Node benchmark.
 *
 * @param {object} opts
 * @param {string} opts.mapKey
 * @param {string} [opts.diffKey='normal']
 * @param {Array}  opts.waves         — per-map wave definition (NOT via import.meta.glob)
 * @param {object} [opts.profile]     — meta-progression profile; may be null in headless
 * @param {object} [opts.perks]       — active perk values (from profile.perks)
 * @param {boolean}[opts.sandbox]
 * @param {{ emit(name:string, payload?:any): void }} [opts.events]
 * @returns {{ state, paths, step(dt, telemetry?), startWave(i) }}
 */
export function createSimulation({
  mapKey,
  diffKey    = 'normal',
  waves,
  profile    = null,
  perks      = {},
  sandbox    = false,
  events     = { emit() {} },
}) {
  const isSandbox = sandbox || diffKey === 'sandbox';
  const difficulty = isSandbox
    ? DIFFICULTIES.normal
    : (DIFFICULTIES[diffKey] ?? DIFFICULTIES.normal);

  const mapDef = MAPS[mapKey];
  const paths  = buildPaths(mapDef);

  const state = {
    mapKey,
    diffKey,
    sandbox:         isSandbox,
    difficulty:      difficulty.key,
    lives:           isSandbox ? 9999 : 20 + (perks.startLives ?? 0),
    cash:            isSandbox ? 999999 : difficulty.startingCash + (perks.startCash ?? 0),
    score:           0,
    kills:           0,
    waveIndex:       -1,
    waveActive:      false,
    spawnerDone:     true,
    enemies:         [],
    towers:          [],
    projectiles:     [],
    damageEvents:    [],
    deathParticles:  [],
    boltEvents:      [],
    groundHazards:   [],
    totalWaves:      waves.length,
    gameOver:        false,
    paused:          false,
    autoStartTimer:  0,
    loopSpeed:       1,
    runStartedAt:    0,
  };

  const mapHpMult         = mapDef.hpMult        ?? 1;
  const mapCashRewardMult = mapDef.cashRewardMult ?? 1;
  const waveSpawner = new WaveSpawner(
    enemyPool, difficulty, waves, mapHpMult, paths.length, mapCashRewardMult,
  );

  markBuffsDirty();

  // ── Internal tick helpers ────────────────────────────────────────────────────

  function _computeStars(lives, maxLives = 20, starCap = 2) {
    const pct = lives / maxLives;
    let stars = 1;
    if (pct >= 0.5) stars = 2;
    if (pct >= 0.9) stars = 3;
    return Math.min(stars, starCap);
  }

  function _tickWaveEnd(dt, telemetry) {
    if (state.waveActive && !state.spawnerDone) {
      state.spawnerDone = waveSpawner.update(dt, state.enemies);
    }
    if (state.waveActive && state.spawnerDone && state.enemies.length === 0) {
      state.waveActive = false;
      events.emit('wave-clear', { waveIndex: state.waveIndex });
      const interest = Math.floor(state.cash * (0.05 + (perks.interestBonus ?? 0)));
      if (interest > 0) { state.cash += interest; events.emit('interest', { amount: interest }); }
      state.cash += 50;
      const income = state.towers.reduce((sum, t) => sum + (t.incomePerWave ?? 0), 0);
      if (income > 0) state.cash += income;
      telemetry?.waveEnd(state);
      events.emit('save-game');
      const isFinalWave = !state.sandbox && state.waveIndex >= waves.length - 1;
      if (!isFinalWave && state.waveIndex >= 0) state.autoStartTimer = 10;
    }
  }

  function _applyHealerAuras(dt) {
    const healers = state.enemies.filter(e => e.healsNearby > 0);
    if (healers.length === 0) return;
    for (const e of healers) {
      const rSq = e.healsNearbyRadius * e.healsNearbyRadius;
      for (const target of state.enemies) {
        if (target === e || target.hp <= 0) continue;
        const dSq = (target.worldX - e.worldX) ** 2 + (target.worldY - e.worldY) ** 2;
        if (dSq <= rSq) target.hp = Math.min(target.maxHp, target.hp + e.healsNearby * dt);
      }
    }
  }

  function _ageAndCullEvents(dt) {
    for (let i = state.damageEvents.length - 1; i >= 0; i--) {
      state.damageEvents[i].t += dt;
      if (state.damageEvents[i].t >= 0.65) state.damageEvents.splice(i, 1);
    }
    for (let i = state.boltEvents.length - 1; i >= 0; i--) {
      state.boltEvents[i].t += dt;
      if (state.boltEvents[i].t >= 0.18) state.boltEvents.splice(i, 1);
    }
    for (let i = state.deathParticles.length - 1; i >= 0; i--) {
      const p = state.deathParticles[i];
      p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.t >= 0.5) state.deathParticles.splice(i, 1);
    }
  }

  function _processEnemies(dt, telemetry) {
    const cashBoosters = state.towers.filter(t => t.killCashBoostRange > 0);
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (e.distance >= paths[e.pathIndex].totalLength) {
        if (!state.sandbox) state.lives = Math.max(0, state.lives - 1);
        telemetry?.onLeak(e.type);
        events.emit('enemy-leaked', { type: e.type });
        enemyPool.release(e);
        state.enemies.splice(i, 1);
      } else if (e.hp <= 0) {
        telemetry?.onKill(e.distance / paths[e.pathIndex].totalLength);
        const baseReward  = e.cashReward ?? 10;
        const totalBoost  = cashBoosters.reduce((total, gen) => {
          const dSq = (gen.x - e.worldX) ** 2 + (gen.y - e.worldY) ** 2;
          return dSq <= gen.killCashBoostRange ** 2 ? total + gen.killCashBoostMult : total;
        }, 0);
        state.cash  += Math.round(baseReward * (1 + totalBoost));
        state.score += e.reward;
        state.kills += 1;
        if (profile?.enemyKills !== undefined)
          profile.enemyKills[e.type] = (profile.enemyKills[e.type] ?? 0) + 1;
        // death particles are render-only; main.js adapter creates them on 'enemy-killed'
        events.emit('enemy-killed', { type: e.type, x: e.worldX, y: e.worldY, color: e.color });
        if (e.spawns) {
          for (let j = 0; j < e.spawns.count; j++) {
            const child = enemyPool.acquire({ type: e.spawns.type, distance: e.distance, pathIndex: e.pathIndex });
            const cpos  = positionAtDistance(paths[child.pathIndex], child.distance);
            child.worldX = cpos.x; child.worldY = cpos.y;
            state.enemies.push(child);
          }
        }
        enemyPool.release(e);
        state.enemies.splice(i, 1);
      } else if (e.liveSpawnInterval > 0) {
        e.liveSpawnTimer -= dt;
        if (e.liveSpawnTimer <= 0) {
          e.liveSpawnTimer = e.liveSpawnInterval;
          for (let j = 0; j < e.liveSpawnCount; j++) {
            const child = enemyPool.acquire({ type: e.liveSpawnType, distance: e.distance, pathIndex: e.pathIndex });
            const cpos  = positionAtDistance(paths[child.pathIndex], child.distance);
            child.worldX = cpos.x; child.worldY = cpos.y;
            state.enemies.push(child);
          }
        }
      }
    }
  }

  function _checkGameOver() {
    if (!state.sandbox &&
        !state.waveActive &&
        state.waveIndex >= waves.length - 1 &&
        state.spawnerDone &&
        state.enemies.length === 0) {
      state.gameOver = true;
      events.emit('clear-save');
      const stars = _computeStars(state.lives, 20, difficulty.starCap);
      events.emit('win', { lives: state.lives, stars, score: state.score });
    }
    if (!state.sandbox && state.lives === 0) {
      state.gameOver = true;
      events.emit('clear-save');
      events.emit('game-over', { score: state.score });
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  /**
   * Start wave i. Resets autoStartTimer, sets waveActive, emits 'wave-start'
   * (and 'boss-warning' on the final wave). Caller is responsible for guards
   * (don't call if gameOver, already active, or out of range).
   */
  function startWave(i) {
    state.autoStartTimer = 0;
    state.waveIndex      = i;
    state.waveActive     = true;
    state.spawnerDone    = false;
    waveSpawner.startWave(i);
    events.emit('wave-start', { waveIndex: i });
    if (!state.sandbox && i === waves.length - 1) events.emit('boss-warning');
  }

  /**
   * Advance simulation by dt seconds, sampling telemetry if provided.
   * Tick order matches the original main.js loop exactly.
   */
  function step(dt, telemetry) {
    if (state.gameOver || state.paused) return;
    _tickWaveEnd(dt, telemetry);
    if (state.autoStartTimer > 0 && !state.waveActive) {
      state.autoStartTimer -= dt;
      if (state.autoStartTimer <= 0) {
        state.autoStartTimer = 0;
        startWave(state.waveIndex + 1);
      }
    }
    updateMovement(state.enemies, paths, dt);
    updateCombat(state.towers, state.enemies, state.projectiles, dt,
                 state.damageEvents, state.groundHazards, state.boltEvents);
    updateDoT(state.enemies, dt, state.damageEvents);
    updateGroundHazards(state.groundHazards, state.enemies, dt, state.damageEvents);
    _applyHealerAuras(dt);
    _ageAndCullEvents(dt);
    telemetry?.tick(state, paths, dt); // sample before culling so near-leaks register ~1.0
    _processEnemies(dt, telemetry);
    _checkGameOver();
  }

  return { state, paths, step, startWave };
}
