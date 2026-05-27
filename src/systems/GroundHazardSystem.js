export function updateGroundHazards(hazards, enemies, dt, damageEvents) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.remaining -= dt;
    if (h.remaining <= 0) { hazards.splice(i, 1); continue; }
    h.nextTick -= dt;
    if (h.nextTick > 0) continue;
    h.nextTick += 1 / h.tickRate;
    const rSq = h.radius * h.radius;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      if (e.isFlying) continue; // flying enemies are unaffected by ground hazards
      const dSq = (e.worldX - h.x)**2 + (e.worldY - h.y)**2;
      if (dSq <= rSq) {
        e.hp = Math.max(0, e.hp - h.damage);
        if (damageEvents) damageEvents.push({ x: e.worldX, y: e.worldY - e.radius, amount: h.damage, full: h.damage, t: 0 });
      }
    }
  }
}
