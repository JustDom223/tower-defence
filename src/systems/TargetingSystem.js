export function selectTarget(tower, enemies) {
  const mode    = tower.targeting;
  const rangeSq = tower.globalRange ? Infinity : tower.range * tower.range;

  let best = null;

  for (const e of enemies) {
    if (e.isCamo && !tower.camoVisible) continue;
    const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
    const dSq = dx * dx + dy * dy;
    if (dSq > rangeSq) continue;

    if (best === null) { best = e; continue; }

    switch (mode) {
      case 'first':  if (e.distance > best.distance) best = e; break;
      case 'last':   if (e.distance < best.distance) best = e; break;
      case 'close':  {
        const bx = best.worldX - tower.x, by = best.worldY - tower.y;
        if (dSq < bx * bx + by * by) best = e;
      } break;
      case 'strong': if (e.hp > best.hp) best = e; break;
    }
  }

  return best;
}

/**
 * Return an array of up to `n` in-range enemies ranked by the tower's targeting mode.
 * The first element is the highest-priority target (same as selectTarget would return).
 * When n === 1 the result is equivalent to [selectTarget(tower, enemies)] (minus null).
 *
 * @param {object} tower
 * @param {Array}  enemies
 * @param {number} n  – maximum number of targets to return
 * @returns {Array}   – 0..n enemies
 */
export function selectTopNTargets(tower, enemies, n) {
  const mode    = tower.targeting;
  const rangeSq = tower.globalRange ? Infinity : tower.range * tower.range;

  // Collect all in-range enemies with their sort key pre-computed.
  const inRange = [];
  for (const e of enemies) {
    if (e.isCamo && !tower.camoVisible) continue;
    const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
    const dSq = dx * dx + dy * dy;
    if (dSq > rangeSq) continue;
    inRange.push({ enemy: e, dSq });
  }

  if (inRange.length === 0) return [];

  // Sort so index 0 is the highest-priority target.
  switch (mode) {
    case 'first':
      inRange.sort((a, b) => b.enemy.distance - a.enemy.distance);
      break;
    case 'last':
      inRange.sort((a, b) => a.enemy.distance - b.enemy.distance);
      break;
    case 'close':
      inRange.sort((a, b) => a.dSq - b.dSq);
      break;
    case 'strong':
      inRange.sort((a, b) => b.enemy.hp - a.enemy.hp);
      break;
    default:
      inRange.sort((a, b) => b.enemy.distance - a.enemy.distance);
      break;
  }

  return inRange.slice(0, n).map(entry => entry.enemy);
}
