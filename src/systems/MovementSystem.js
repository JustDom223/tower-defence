import { positionAtDistance } from '../core/Path.js';

export function updateMovement(enemies, paths, dt) {
  for (const e of enemies) {
    if (e.stunTimer > 0) { e.stunTimer -= dt; continue; }

    // Stutter — alternates between moving and pausing
    if (e.stutterInterval > 0) {
      e.stutterTimer -= dt;
      if (e.stutterTimer <= 0) {
        e.stutterPausing = !e.stutterPausing;
        e.stutterTimer   = e.stutterPausing ? e.stutterPauseTime : e.stutterInterval;
      }
      if (e.stutterPausing) {
        if (e.flashTimer > 0) e.flashTimer = Math.max(0, e.flashTimer - dt);
        continue;
      }
    }

    e.prevDistance = e.distance;

    const effectiveSpeed = e.speed * e.slowFactor;
    e.distance += effectiveSpeed * dt;

    if (e.slowTimer > 0) {
      e.slowTimer -= dt;
      if (e.slowTimer <= 0) { e.slowFactor = 1; e.slowTimer = 0; }
    }

    if (e.vulnerabilityTimer > 0) {
      e.vulnerabilityTimer -= dt;
      if (e.vulnerabilityTimer <= 0) e.vulnerabilityMult = 1.0;
    }

    if (e.flashTimer > 0) e.flashTimer = Math.max(0, e.flashTimer - dt);

    // Regeneration — heals HP over time while not under continuous fire
    if (e.regenRate > 0 && e.hp < e.maxHp) {
      e.hp = Math.min(e.maxHp, e.hp + e.regenRate * dt);
    }

    const prevX = e.worldX, prevY = e.worldY;
    const pos = positionAtDistance(paths[e.pathIndex], e.distance);
    e.worldX = pos.x;
    e.worldY = pos.y;
    e.vx = dt > 0 ? (e.worldX - prevX) / dt : 0;
    e.vy = dt > 0 ? (e.worldY - prevY) / dt : 0;
  }
}
