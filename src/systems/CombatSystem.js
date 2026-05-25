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
export function updateCombat(towers, enemies, projectiles, dt, damageEvents, hazards) {
  for (const tower of towers) {
    if (tower.cooldown > 0) { tower.cooldown -= dt; continue; }

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
    projectiles.push(projectilePool.acquire({
      x: tower.x, y: tower.y, target,
      speed:          tower.projSpeed,
      damage:         tower.damage,
      aoeRadius:      tower.aoeRadius,
      towerType:      tower.type,
      ballistic:      tower.aoeRadius > 0,
      leavesHazard:   tower.leavesHazard,
      hazardDamage:   tower.hazardDamage,
      hazardRadius:   tower.hazardRadius,
      hazardDuration: tower.hazardDuration,
      hazardTickRate: tower.hazardTickRate,
    }));
  }

  moveAndHitProjectiles(projectiles, enemies, damageEvents, hazards);
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

function moveAndHitProjectiles(projectiles, enemies, damageEvents, hazards) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.prevX = p.x; p.prevY = p.y;

    const dt = 1 / 60;
    let hit = false;

    if (p.ballistic) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const remX = p.landX - p.x, remY = p.landY - p.y;
      const remDist = Math.sqrt(remX * remX + remY * remY);
      if (remDist <= p.speed * dt) {
        p.x = p.landX;
        p.y = p.landY;
        hit = true;
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
        if (dx * dx + dy * dy < HIT_DIST_SQ) hit = true;
      } else {
        // Target is gone — expire immediately rather than flying blind.
        hit = true;
      }
    }

    if (hit) {
      onHit(p, enemies, damageEvents, hazards);
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

function onHit(p, enemies, damageEvents, hazards) {
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

  if (p.leavesHazard && hazards) {
    hazards.push({
      x:         p.x,
      y:         p.y,
      radius:    p.hazardRadius,
      damage:    p.hazardDamage,
      remaining: p.hazardDuration,
      tickRate:  p.hazardTickRate,
      nextTick:  0,
    });
  }
}
