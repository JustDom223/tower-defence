/**
 * Lightweight per-run player action recorder.
 *
 * Records every tower placement and upgrade so a run can be exported after
 * the map ends and analysed externally. Combined with per-wave telemetry at
 * serialization time to produce one compact JSON blob.
 *
 * Usage:
 *   initPlayerLog(mapKey, diffKey)   — call once at game start
 *   logPlace(...)                    — call after every placement
 *   logUpgrade(...)                  — call after every upgrade
 *   serializeRun(...)                — call at end screen to get the JSON
 */

let _log = null;

/** Reset and start a new log for the given run. */
export function initPlayerLog(mapKey, diffKey) {
  _log = { map: mapKey, diff: diffKey, actions: [] };
}

/**
 * Record a tower placement.
 * waveIndex = state.waveIndex at time of placement.
 *   -1 → pre-game (w=0 in output), 0 → during/after wave 1 (w=1), etc.
 */
export function logPlace(type, x, y, cost, cashAfter, waveIndex) {
  if (!_log) return;
  _log.actions.push({ w: waveIndex + 1, act: 'place', t: type, x, y, '$': cost, cash: cashAfter });
}

/**
 * Record an upgrade purchase.
 * tierNum: 1-based tier being purchased.
 */
export function logUpgrade(towerType, path, tierNum, tierName, cost, cashAfter, waveIndex) {
  if (!_log) return;
  _log.actions.push({ w: waveIndex + 1, act: 'upgrade', t: towerType, path, tier: tierNum, name: tierName, '$': cost, cash: cashAfter });
}

/**
 * Serialize the full run to a JSON string ready for copy-out.
 * @param {'win'|'loss'} result
 * @param {number}   finalLives
 * @param {number}   score
 * @param {object[]} towerSnapshot  state.towers mapped to compact objects
 * @param {object[]} waveLog        telemetry.log (raw per-wave records)
 */
export function serializeRun(result, finalLives, score, towerSnapshot, waveLog) {
  if (!_log) return '{}';
  const waves = waveLog.map(w => {
    const out = {
      wave:      w.wave,
      livesLost: w.livesLost,
      cash:      `$${w.cashStart}→$${w.cashEnd}`,
      reach:     `${Math.round(w.deepestReachPct * 100)}%`,
      kills:     w.kills,
    };
    if (w.leaks?.count)          out.leaks      = w.leaks.byType;
    if (w.firstBloodPct !== null) out.firstBlood = `${Math.round(w.firstBloodPct * 100)}%`;
    if (w.killMap)               out.killMap    = w.killMap;
    return out;
  });
  return JSON.stringify({
    map:        _log.map,
    diff:       _log.diff,
    result,
    finalLives,
    score,
    towers:     towerSnapshot,
    actions:    _log.actions,
    waves,
  }, null, 2);
}
