import { positionAtDistance } from '../core/Path.js';

export function updateMovement(enemies, path, dt) {
  for (const e of enemies) {
    if (e.stunTimer > 0) { e.stunTimer -= dt; continue; }

    e.prevDistance = e.distance;

    const effectiveSpeed = e.speed * e.slowFactor;
    e.distance += effectiveSpeed * dt;

    if (e.slowTimer > 0) {
      e.slowTimer -= dt;
      if (e.slowTimer <= 0) { e.slowFactor = 1; e.slowTimer = 0; }
    }

    if (e.flashTimer > 0) e.flashTimer = Math.max(0, e.flashTimer - dt);

    const pos = positionAtDistance(path, e.distance);
    e.worldX = pos.x;
    e.worldY = pos.y;
  }
}
