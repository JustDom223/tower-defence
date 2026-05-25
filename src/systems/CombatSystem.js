import { selectTarget } from './TargetingSystem.js';
import { projectilePool } from '../entities/Projectile.js';
import AudioManager from '../audio/AudioManager.js';

const HIT_DIST_SQ    = 12 * 12;
const FLASH_DURATION = 0.12;

const SHOT_SOUND = {
  dart:     'dart-shot',
  bomb:     'dart-shot',    // bomb uses the same tick; explosion plays on hit
  frost:    'frost-pulse',
  marksman: 'marksman-shot',
};

/**
 * @param {Array} damageEvents  – shared array; push { x, y, amount, full, t } on each hit.
 *   `full` = raw damage before resistance (used by DamageNumberRenderer for colour coding).
 */
export function updateCombat(towers, enemies, projectiles, dt, damageEvents) {
  for (const tower of towers) {
    if (tower.cooldown > 0) { tower.cooldown -= dt; continue; }

    if (tower.isStun) {
      // Rotate toward nearest in-range enemy (mirrors isSlow behaviour)
      let nearest = null, nearestDSq = Infinity;
      const rSq = tower.range * tower.range;
      for (const e of enemies) {
        const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < nearestDSq && dSq <= rSq) { nearest = e; nearestDSq = dSq; }
      }
      if (nearest) tower.angle = Math.atan2(nearest.worldY - tower.y, nearest.worldX - tower.x);
      applyStun(tower, enemies, damageEvents);
      AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');
      tower.cooldown = 1 / tower.fireRate;
      continue;
    }

    if (tower.isSlow) {
      // R3 — rotate slow towers toward nearest in-range enemy
      let nearest = null, nearestDSq = Infinity;
      const rSq = tower.range * tower.range;
      for (const e of enemies) {
        const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < nearestDSq && dSq <= rSq) { nearest = e; nearestDSq = dSq; }
      }
      if (nearest) tower.angle = Math.atan2(nearest.worldY - tower.y, nearest.worldX - tower.x);
      applySlow(tower, enemies);
      AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');
      tower.cooldown = 1 / tower.fireRate;
      continue;
    }

    const target = selectTarget(tower, enemies);
    if (!target) continue;

    // R3 — point the tower barrel toward its target
    tower.angle = Math.atan2(target.worldY - tower.y, target.worldX - tower.x);

    tower.cooldown = 1 / tower.fireRate;
    AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');

    let pierce = 0, dirX = 0, dirY = 0;
    if (tower.pierce > 0) {
      pierce = tower.pierce;
      const dx = target.worldX - tower.x, dy = target.worldY - tower.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      dirX = dx / len;
      dirY = dy / len;
    }

    projectiles.push(projectilePool.acquire({
      x: tower.x, y: tower.y, target,
      speed:     tower.projSpeed,
      damage:    tower.damage,
      aoeRadius: tower.aoeRadius,
      towerType: tower.type,
      ballistic: tower.aoeRadius > 0,
      pierce, dirX, dirY,
    }));
  }

  moveAndHitProjectiles(projectiles, enemies, damageEvents);
}

function applySlow(tower, enemies) {
  const rSq = tower.range * tower.range;
  for (const e of enemies) {
    const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
    if (dx * dx + dy * dy <= rSq) {
      e.slowFactor = Math.min(e.slowFactor, tower.slowFactor);
      e.slowTimer  = Math.max(e.slowTimer,  tower.slowDuration);
    }
  }
}

function applyStun(tower, enemies, damageEvents) {
  const rSq = tower.range * tower.range;
  for (const e of enemies) {
    const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
    if (dx * dx + dy * dy <= rSq) {
      e.stunTimer = Math.max(e.stunTimer, tower.stunDuration);
      if (tower.damage > 0) {
        applyDamage(e, tower.damage, tower.type, e.worldX, e.worldY, damageEvents);
      }
    }
  }
}

function moveAndHitProjectiles(projectiles, enemies, damageEvents) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.prevX = p.x; p.prevY = p.y;

    const dt = 1 / 60;
    let remove = false;

    if (p.pierceLeft > 0) {
      // Piercing projectile — travels in fixed direction, hits multiple enemies
      p.x += p.dirX * p.speed * dt;
      p.y += p.dirY * p.speed * dt;

      // Check all enemies for proximity hits
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (p.pierceHit.has(e.id)) continue;
        const dx = e.worldX - p.x, dy = e.worldY - p.y;
        if (dx * dx + dy * dy < HIT_DIST_SQ) {
          applyDamage(e, p.damage, p.towerType, e.worldX, e.worldY, damageEvents);
          p.pierceHit.add(e.id);
          p.pierceLeft--;
          if (p.pierceLeft < 0) { remove = true; break; }
        }
      }

      // Remove if off-canvas
      if (!remove && (p.x < -20 || p.x > 1300 || p.y < -20 || p.y > 740)) {
        remove = true;
      }
    } else if (p.ballistic) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const remX = p.landX - p.x, remY = p.landY - p.y;
      const remDist = Math.sqrt(remX * remX + remY * remY);
      if (remDist <= p.speed * dt) {
        p.x = p.landX;
        p.y = p.landY;
        remove = true;
      }
    } else {
      // Guard against pool recycling (ID check) and enemies removed from play while
      // still at full HP (active check — e.g. leaking through the end of the path).
      const targetLive = p.target && p.target.id === p.targetId && p.target.hp > 0 && p.target.active;

      if (targetLive) {
        const dx = p.target.worldX - p.x, dy = p.target.worldY - p.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        p.vx = (dx / len) * p.speed;
        p.vy = (dy / len) * p.speed;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (targetLive) {
        const dx = p.target.worldX - p.x, dy = p.target.worldY - p.y;
        if (dx * dx + dy * dy < HIT_DIST_SQ) remove = true;
      } else {
        // Target is gone — expire immediately rather than flying blind.
        remove = true;
      }
    }

    if (remove) {
      // Piercing projectiles apply damage inline; standard projectiles call onHit on removal
      if (!p.pierceHit) onHit(p, enemies, damageEvents);
      projectilePool.release(p);
      projectiles.splice(i, 1);
    }
  }
}

/** Apply damage respecting per-enemy resistance vs the tower type that fired. */
function applyDamage(e, rawDamage, towerType, hitX, hitY, damageEvents) {
  const mult   = e.resistance?.[towerType] ?? 1;
  const damage = mult < 1 ? Math.ceil(rawDamage * mult) : rawDamage;
  e.hp = Math.max(0, e.hp - damage);
  e.flashTimer = FLASH_DURATION;
  if (damageEvents) {
    damageEvents.push({ x: hitX, y: hitY - e.radius, amount: damage, full: rawDamage, t: 0 });
  }
}

function onHit(p, enemies, damageEvents) {
  if (p.aoeRadius > 0) {
    // Bomb — play explosion sound on impact
    AudioManager.play('bomb-explode');
    const rSq = p.aoeRadius * p.aoeRadius;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const dx = e.worldX - p.x, dy = e.worldY - p.y;
      if (dx * dx + dy * dy <= rSq) {
        applyDamage(e, p.damage, p.towerType, e.worldX, e.worldY, damageEvents);
      }
    }
  } else if (p.target && p.target.id === p.targetId && p.target.hp > 0) {
    applyDamage(p.target, p.damage, p.towerType,
      p.target.worldX, p.target.worldY, damageEvents);
  }
}
