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
      case 'flying': {
        const bestIsFlying = best.isFlying ?? false;
        const eIsFlying    = e.isFlying    ?? false;
        if (eIsFlying && !bestIsFlying) { best = e; break; }
        if (!eIsFlying && bestIsFlying) break;
        if (e.distance > best.distance) best = e;
      } break;
      case 'fastest': {
        const eSpd = e.speed * (e.slowFactor ?? 1);
        const bSpd = best.speed * (best.slowFactor ?? 1);
        if (eSpd > bSpd) best = e;
      } break;
      case 'unpoisoned': {
        const cap    = tower.dotStackCap ?? 1;
        const src    = tower.type;
        const eStacks = e.dotStacks?.filter(s => s.sourceType === src).length ?? 0;
        const bStacks = best.dotStacks?.filter(s => s.sourceType === src).length ?? 0;
        // group 0 = none, 1 = partial, 2 = at cap
        const eGroup  = eStacks === 0 ? 0 : eStacks < cap ? 1 : 2;
        const bGroup  = bStacks === 0 ? 0 : bStacks < cap ? 1 : 2;
        if (eGroup < bGroup) { best = e; break; }
        if (eGroup > bGroup) break;
        // same group — prefer closest
        const bx = best.worldX - tower.x, by = best.worldY - tower.y;
        if (dSq < bx * bx + by * by) best = e;
      } break;
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
    case 'flying':
      inRange.sort((a, b) => {
        const af = a.enemy.isFlying ? 1 : 0;
        const bf = b.enemy.isFlying ? 1 : 0;
        if (bf !== af) return bf - af;
        return b.enemy.distance - a.enemy.distance;
      });
      break;
    case 'fastest':
      inRange.sort((a, b) => {
        const as = a.enemy.speed * (a.enemy.slowFactor ?? 1);
        const bs = b.enemy.speed * (b.enemy.slowFactor ?? 1);
        return bs - as;
      });
      break;
    case 'unpoisoned': {
      const cap = tower.dotStackCap ?? 1;
      const src = tower.type;
      inRange.sort((a, b) => {
        const aStacks = a.enemy.dotStacks?.filter(s => s.sourceType === src).length ?? 0;
        const bStacks = b.enemy.dotStacks?.filter(s => s.sourceType === src).length ?? 0;
        const aGroup  = aStacks === 0 ? 0 : aStacks < cap ? 1 : 2;
        const bGroup  = bStacks === 0 ? 0 : bStacks < cap ? 1 : 2;
        if (aGroup !== bGroup) return aGroup - bGroup;
        return a.dSq - b.dSq;
      });
      break;
    }
    default:
      inRange.sort((a, b) => b.enemy.distance - a.enemy.distance);
      break;
  }

  return inRange.slice(0, n).map(entry => entry.enemy);
}
