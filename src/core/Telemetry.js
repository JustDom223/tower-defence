/**
 * Telemetry — play-test data collection.
 *
 * Pure module (no pixi / no DOM): it only *reads* game state and accumulates
 * per-wave metrics, so it runs unchanged under the headless benchmark
 * (SPEC_playtest-benchmark.md) and in the live browser game. Wire it into the
 * simulation via the five hooks below; it is harmless to leave always-on (a few
 * array reads per tick, ~10 small records per run).
 *
 * Hooks (called from main.js):
 *   waveStart(state, waveIndex)  — when a wave begins
 *   tick(state, paths, dt)       — every sim tick (no-op between waves)
 *   onLeak(type)                 — an enemy reached the exit
 *   onKill(reachPct)             — an enemy died at this path fraction
 *   waveEnd(state)               — when the wave is fully cleared
 *
 * Metrics captured per wave (see SPEC_playtest-benchmark.md §4):
 *   deepestReachPct  max enemy.distance / path.totalLength — the margin number
 *   livesLost        lives at wave start minus end
 *   leaks            {count, byType} — which enemy types broke through
 *   peakConcurrent   most simultaneous live enemies
 *   firstBloodPct    path fraction at which the wave's first enemy died
 *   clearTimeSec     game-seconds (dt-summed, speed-independent) start→clear
 *   spawnDurationSec game-seconds until spawning finished
 *   combatTailSec    game-seconds after last spawn until cleared (DPS-wall tell)
 *   cashStart/End, kills
 */
export function createTelemetry() {
  let waves = [];
  let cur = null;

  const pathPct = (e, paths) => {
    const len = paths[e.pathIndex]?.totalLength || 1;
    return e.distance / len;
  };

  return {
    get log() { return waves; },
    reset() { waves = []; cur = null; },

    waveStart(state, waveIndex) {
      cur = {
        wave: waveIndex + 1,
        livesStart: state.lives, livesEnd: state.lives, livesLost: 0,
        cashStart: state.cash, cashEnd: state.cash,
        killsStart: state.kills, kills: 0,
        deepestReachPct: 0, peakConcurrent: 0, firstBloodPct: null,
        leaks: { count: 0, byType: {} },
        gameTime: 0, spawnDoneTime: null,
        clearTimeSec: 0, spawnDurationSec: 0, combatTailSec: 0,
      };
    },

    tick(state, paths, dt) {
      if (!cur) return;
      cur.gameTime += dt;
      if (state.spawnerDone && cur.spawnDoneTime === null) cur.spawnDoneTime = cur.gameTime;
      const n = state.enemies.length;
      if (n > cur.peakConcurrent) cur.peakConcurrent = n;
      for (const e of state.enemies) {
        const pct = pathPct(e, paths);
        if (pct > cur.deepestReachPct) cur.deepestReachPct = pct;
      }
    },

    onLeak(type) {
      if (!cur) return;
      cur.leaks.count++;
      cur.leaks.byType[type] = (cur.leaks.byType[type] ?? 0) + 1;
    },

    onKill(reachPct) {
      if (cur && cur.firstBloodPct === null) cur.firstBloodPct = +reachPct.toFixed(3);
    },

    waveEnd(state) {
      if (!cur) return;
      cur.livesEnd = state.lives;
      cur.livesLost = cur.livesStart - state.lives;
      cur.cashEnd = state.cash;
      cur.kills = state.kills - cur.killsStart;
      cur.clearTimeSec = +cur.gameTime.toFixed(2);
      cur.spawnDurationSec = +(cur.spawnDoneTime ?? cur.gameTime).toFixed(2);
      cur.combatTailSec = +(cur.clearTimeSec - cur.spawnDurationSec).toFixed(2);
      cur.deepestReachPct = +cur.deepestReachPct.toFixed(3);
      // strip bookkeeping fields from the emitted record
      const { killsStart, gameTime, spawnDoneTime, ...row } = cur;
      waves.push(row);
      cur = null;
    },

    /** Pretty JSON of the whole run — for copy-out during play-testing. */
    export() { return JSON.stringify(waves, null, 2); },

    /** Compact per-wave table for quick console reading. */
    summary() {
      return waves.map(w =>
        `W${w.wave}: lost ${w.livesLost}  reach ${(w.deepestReachPct * 100) | 0}%  ` +
        `peak ${w.peakConcurrent}  clear ${w.clearTimeSec}s  tail ${w.combatTailSec}s  ` +
        `kills ${w.kills}  cash $${w.cashStart}→$${w.cashEnd}` +
        (w.leaks.count ? `  leaks ${w.leaks.count} ${JSON.stringify(w.leaks.byType)}` : '')
      );
    },
  };
}
