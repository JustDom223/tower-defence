export function updateDoT(enemies, dt, damageEvents) {
  for (const e of enemies) {
    if (!e.dotStacks?.length) continue;
    if (e.shield > 0) continue; // shield absorbs direct hits; DoT waits for it to drop
    for (let i = e.dotStacks.length - 1; i >= 0; i--) {
      const s = e.dotStacks[i];
      s.remaining -= dt;
      if (s.remaining <= 0) { e.dotStacks.splice(i, 1); continue; }
      s.nextTick -= dt;
      if (s.nextTick <= 0) {
        s.nextTick += 1 / s.tickRate;
        const dmg = s.ignoresArmour
          ? s.damage
          : Math.ceil(s.damage * (e.resistance?.dot ?? 1));
        e.hp = Math.max(0, e.hp - dmg);
        damageEvents.push({ x: e.worldX, y: e.worldY - e.radius, amount: dmg, full: s.damage, t: 0 });
      }
    }
  }
}
