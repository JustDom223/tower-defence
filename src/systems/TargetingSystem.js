export function selectTarget(tower, enemies) {
  const mode    = tower.targeting;
  const rangeSq = tower.globalRange ? Infinity : tower.range * tower.range;

  let best = null;

  for (const e of enemies) {
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
