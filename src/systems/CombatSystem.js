import { selectTarget, selectTopNTargets } from './TargetingSystem.js';
import { projectilePool } from '../entities/Projectile.js';
import AudioManager from '../audio/AudioManager.js';

const HIT_DIST_SQ    = 12 * 12;
const FLASH_DURATION = 0.12;

const SHOT_SOUND = {
  dart:         'dart-shot',
  bomb:         'dart-shot',
  frost:        'silent',       // frost fires constantly; its pulse was too annoying — muted for now

  marksman:     'marksman-shot',
  tesla:        'tesla-zap',
  stickycannon: 'dart-shot',
  minelayer:    'dart-shot',
  boomerang:    'dart-shot',
  laser:        'laser-beam',
  engineer:     'dart-shot',
  druid:        'dart-shot',
  wizard:       'marksman-shot',
  scattergun:   'dart-shot',
  solartower:   'laser-beam',
  trapper:      'dart-shot',
  gravitywell:  'frost-pulse',
  flamethrower: 'dart-shot',
  alchemist:    'dart-shot',
  commandpost:  'frost-pulse',
  generator:    'dart-shot',
};

/**
 * @param {Array} damageEvents  – shared array; push { x, y, amount, full, t } on each hit.
 *   `full` = raw damage before resistance (used by DamageNumberRenderer for colour coding).
 */
export function updateCombat(towers, enemies, projectiles, dt, damageEvents, hazards, boltEvents) {
  applyBuffAuras(towers);


  for (const tower of towers) {
    if (tower.cooldown > 0) { tower.cooldown -= dt; continue; }
    if (tower.isSupport || tower.isEconomy) continue;

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
      const rSq = tower.buffedRange * tower.buffedRange;
      for (const e of enemies) {
        const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < nearestDSq && dSq <= rSq) { nearest = e; nearestDSq = dSq; }
      }
      if (nearest) tower.angle = Math.atan2(nearest.worldY - tower.y, nearest.worldX - tower.x);
      applySlow(tower, enemies);
      AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');
      tower.cooldown = 1 / tower.buffedFireRate;
      continue;
    }

    // Instant / hitscan towers (Tesla arc, Laser & Solar beams) — strike the
    // instant they fire, with no travelling projectile. fireInstant() handles
    // chain (Tesla), beam-pierce (Laser/Solar) and multi-shot.
    if (tower.instant) {
      if (fireInstant(tower, enemies, damageEvents, boltEvents)) {
        tower.cooldown = 1 / tower.buffedFireRate;
        AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');
      }
      continue;
    }

    // Mortar manual targeting — fire ballistic projectile(s) at player-set coordinate
    if (tower.mortarMode && tower.mortarTargetX !== null) {
      tower.angle = Math.atan2(tower.mortarTargetY - tower.y, tower.mortarTargetX - tower.x);
      tower.cooldown = 1 / tower.fireRate;
      AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');

      const volley = tower.mortarVolley > 1 ? tower.mortarVolley : 1;
      for (let v = 0; v < volley; v++) {
        const spread = volley > 1 ? (v - (volley - 1) / 2) * (40 / (volley - 1)) : 0;
        const perpX = -Math.sin(tower.angle) * spread;
        const perpY =  Math.cos(tower.angle) * spread;
        const landX = tower.mortarTargetX + perpX;
        const landY = tower.mortarTargetY + perpY;
        const syntheticTarget = { worldX: landX, worldY: landY, id: 0 };
        projectiles.push(projectilePool.acquire({
          x: tower.x, y: tower.y,
          target:    syntheticTarget,
          speed:     tower.projSpeed,
          damage:    tower.damage,
          aoeRadius: tower.aoeRadius,
          towerType: tower.type,
          ballistic: true,
        }));
      }
      continue;
    }

    const baseRange = tower.range;
    tower.range = tower.buffedRange;
    const n = tower.multiShot > 1 ? tower.multiShot : 1;
    let targets;
    if (n === 1) {
      const t = selectTarget(tower, enemies);
      targets = t ? [t] : [];
    } else {
      targets = selectTopNTargets(tower, enemies, n);
    }
    tower.range = baseRange;

    if (targets.length === 0) continue;

    // R3 — point the tower barrel toward the primary (highest-priority) target
    tower.angle = Math.atan2(targets[0].worldY - tower.y, targets[0].worldX - tower.x);

    tower.cooldown = 1 / tower.buffedFireRate;
    AudioManager.play(SHOT_SOUND[tower.type] ?? 'dart-shot');

    // Dart fires in a fixed direction; with coneShot >= 3 it fans into a cone.
    const isDart     = tower.type === 'dart';
    const coneCount  = isDart && tower.coneShot >= 3 ? tower.coneShot : 1;
    const CONE_SPREAD = Math.PI / 12; // 15° between each dart

    for (const target of targets) {
      const baseAngle = Math.atan2(target.worldY - tower.y, target.worldX - tower.x);

      for (let c = 0; c < coneCount; c++) {
        let pierce = 0, dirX = 0, dirY = 0, fixedDir = false;

        if (isDart) {
          const offset = coneCount > 1 ? (c - (coneCount - 1) / 2) * CONE_SPREAD : 0;
          const angle  = baseAngle + offset;
          dirX     = Math.cos(angle);
          dirY     = Math.sin(angle);
          pierce   = tower.pierce;
          fixedDir = true;
        } else if (tower.pierce > 0) {
          const dx = target.worldX - tower.x, dy = target.worldY - tower.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          dirX   = dx / len;
          dirY   = dy / len;
          pierce = tower.pierce;
        }

        projectiles.push(projectilePool.acquire({
          x: tower.x, y: tower.y, target,
          speed:     tower.projSpeed,
          damage:    tower.buffedDamage,
          aoeRadius: tower.aoeRadius,
          towerType: tower.type,
          ballistic: tower.aoeRadius > 0,
          pierce, dirX, dirY, fixedDir,
          flyOnMiss: tower.flyOnMiss,
          dotDamage:        tower.dotDamage,
          dotDuration:      tower.dotDuration,
          dotTickRate:      tower.dotTickRate,
          dotIgnoresArmour: tower.dotIgnoresArmour,
          dotStackCap:      tower.dotStackCap,
          debuffVulnerability: tower.debuffVulnerability,
          debuffDuration:      tower.debuffDuration,
          ignoresArmour:       tower.ignoresArmour,
          leavesHazard:   tower.leavesHazard,
          hazardDamage:   tower.hazardDamage,
          hazardRadius:   tower.hazardRadius,
          hazardDuration: tower.hazardDuration,
          hazardTickRate: tower.hazardTickRate,
          projSlowFactor:   tower.projSlowFactor,
          projSlowDuration: tower.projSlowDuration,
        }));
      }
    }
  }

  moveAndHitProjectiles(projectiles, enemies, damageEvents, hazards);
}

function applyBuffAuras(towers) {
  // Reset buffed stats to base values each frame
  for (const t of towers) {
    t.buffedFireRate = t.fireRate;
    t.buffedDamage   = t.damage;
    t.buffedRange    = t.range;
    t.camoVisible    = false;
  }
  // Apply support tower auras
  for (const src of towers) {
    if (!src.isSupport) continue;
    const rSq = src.range * src.range;
    for (const t of towers) {
      if (t === src) continue;
      const dSq = (t.x - src.x) ** 2 + (t.y - src.y) ** 2;
      if (dSq > rSq) continue;
      if (src.buffFireRate) t.buffedFireRate *= (1 + src.buffFireRate);
      if (src.buffDamage)   t.buffedDamage   *= (1 + src.buffDamage);
      if (src.buffRange)    t.buffedRange    *= (1 + src.buffRange);
      if (src.camoDetect)   t.camoVisible    = true;
    }
  }
}

function applySlow(tower, enemies) {
  const rSq = tower.buffedRange * tower.buffedRange;
  for (const e of enemies) {
    if (e.immuneSlow) continue;
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

function moveAndHitProjectiles(projectiles, enemies, damageEvents, hazards) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.prevX = p.x; p.prevY = p.y;

    const dt = 1 / 60;
    let remove = false;

    if (p.pierceLeft >= 0 && p.pierceHit !== null) {
      // Piercing projectile — travels in fixed direction, hits multiple enemies
      p.x += p.dirX * p.speed * dt;
      p.y += p.dirY * p.speed * dt;

      // Check all enemies for proximity hits
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (p.pierceHit.has(e.id)) continue;
        const dx = e.worldX - p.x, dy = e.worldY - p.y;
        if (dx * dx + dy * dy < HIT_DIST_SQ) {
          applyDamage(e, p.damage, p.towerType, e.worldX, e.worldY, damageEvents, p.ignoresArmour);
          applyDot(p, e);
          p.pierceHit.add(e.id);
          p.pierceLeft--;
          if (p.pierceLeft < 0) { remove = true; break; }
        }
      }

      // Remove if off-canvas
      if (!remove && (p.x < -20 || p.x > 1300 || p.y < -20 || p.y > 740)) {
        remove = true;
      }
    } else if (p.fixedDir) {
      // Fixed-direction non-pierce projectile (dart base) — travels straight, hits first enemy touched
      p.x += p.dirX * p.speed * dt;
      p.y += p.dirY * p.speed * dt;

      for (const e of enemies) {
        if (e.hp <= 0) continue;
        const dx = e.worldX - p.x, dy = e.worldY - p.y;
        if (dx * dx + dy * dy < HIT_DIST_SQ) {
          p.target   = e;
          p.targetId = e.id;
          remove = true;
          break;
        }
      }

      if (!remove && (p.x < -20 || p.x > 1300 || p.y < -20 || p.y > 740)) {
        p.target = null; // miss — suppress onHit damage
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
      } else if (p.flyOnMiss) {
        // EXPERIMENT (marksman): the target died/left, but instead of expiring the
        // bullet keeps flying straight in its last heading, hitting anything in its
        // path, until it leaves the field. Gated by the per-tower `flyOnMiss` flag.
        // To revert: remove `flyOnMiss: true` from the marksman def in towers.js.
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          const dx = e.worldX - p.x, dy = e.worldY - p.y;
          if (dx * dx + dy * dy < HIT_DIST_SQ) { p.target = e; p.targetId = e.id; remove = true; break; }
        }
        if (!remove && (p.x < -20 || p.x > 1300 || p.y < -20 || p.y > 740)) {
          p.target = null; // flew off the field without hitting — a clean miss
          remove = true;
        }
      } else {
        // ORIGINAL behaviour — target gone, expire immediately rather than flying blind.
        remove = true;
      }
    }

    if (remove) {
      // Piercing projectiles apply damage inline; standard projectiles call onHit on removal
      if (!p.pierceHit) onHit(p, enemies, damageEvents, hazards);
      projectilePool.release(p);
      projectiles.splice(i, 1);
    }
  }
}

/** Apply damage respecting per-enemy resistance vs the tower type that fired. */
function applyDamage(e, rawDamage, towerType, hitX, hitY, damageEvents, ignoresArmour = false) {
  const resistMult = ignoresArmour ? 1 : (e.resistance?.[towerType] ?? 1);
  const vulnMult   = e.vulnerabilityMult ?? 1.0;
  let damage = resistMult < 1
    ? Math.ceil(rawDamage * resistMult * vulnMult)
    : Math.round(rawDamage * vulnMult);

  // Shield absorbs damage first; DoT bypasses shield (checked in DoTSystem)
  if (e.shield > 0) {
    const absorbed = Math.min(e.shield, damage);
    e.shield -= absorbed;
    damage   -= absorbed;
  }

  e.hp = Math.max(0, e.hp - damage);
  e.flashTimer = FLASH_DURATION;
  if (damageEvents) {
    const shownDamage = resistMult < 1
      ? Math.ceil(rawDamage * resistMult * vulnMult)
      : Math.round(rawDamage * vulnMult);
    damageEvents.push({ x: hitX, y: hitY - e.radius, amount: shownDamage, full: rawDamage, t: 0 });
  }
}

function applyDot(p, target) {
  if (p.dotDamage > 0) {
    const existingStacks = target.dotStacks.filter(s => s.sourceType === p.towerType);
    if (existingStacks.length < p.dotStackCap) {
      target.dotStacks.push({
        damage: p.dotDamage, tickRate: p.dotTickRate,
        remaining: p.dotDuration, nextTick: 1 / p.dotTickRate,
        ignoresArmour: p.dotIgnoresArmour, sourceType: p.towerType,
      });
    }
  }
}

/**
 * Fire an instant/hitscan tower. Returns true if it found a target and struck.
 * Supports multi-shot (separate beams at the top-N targets), and per-beam either
 * a chain arc (chainTargets, Tesla) or a piercing beam (pierce, Laser/Solar).
 * Emits a bolt event per beam for the renderer.
 */
function fireInstant(tower, enemies, damageEvents, boltEvents) {
  const baseRange = tower.range;
  tower.range = tower.buffedRange;
  const n = tower.multiShot > 1 ? tower.multiShot : 1;
  let targets;
  if (n === 1) {
    const t = selectTarget(tower, enemies);
    targets = t ? [t] : [];
  } else {
    targets = selectTopNTargets(tower, enemies, n);
  }
  tower.range = baseRange;
  if (targets.length === 0) return false;

  tower.angle = Math.atan2(targets[0].worldY - tower.y, targets[0].worldX - tower.x);

  // Lightweight descriptor so applyDot() can be reused without a real projectile.
  const strike = {
    towerType:        tower.type,
    dotDamage:        tower.dotDamage,
    dotDuration:      tower.dotDuration,
    dotTickRate:      tower.dotTickRate,
    dotIgnoresArmour: tower.dotIgnoresArmour,
    dotStackCap:      tower.dotStackCap,
  };

  const aoeSq = tower.aoeRadius * tower.aoeRadius;

  for (const primary of targets) {
    const hits = collectInstantHits(tower, primary, enemies);

    for (let k = 0; k < hits.length; k++) {
      const e   = hits[k];
      // Chain links fall off in damage; pierce/single hits land at full power.
      const dmg = tower.chainTargets > 0
        ? Math.max(1, Math.round(tower.buffedDamage * Math.pow(tower.chainFalloff, k)))
        : tower.buffedDamage;

      applyInstantHit(tower, strike, e, dmg, enemies, damageEvents, aoeSq);
    }

    if (boltEvents && hits.length) {
      const points = [[tower.x, tower.y]];
      for (const e of hits) points.push([e.worldX, e.worldY]);
      boltEvents.push({ points, t: 0, color: tower.color, style: tower.instantStyle });
    }
  }
  return true;
}

/** Resolve which enemies a single instant beam strikes (chain arc or pierce line). */
function collectInstantHits(tower, primary, enemies) {
  const hits   = [primary];
  const hitIds = new Set([primary.id]);

  if (tower.chainTargets > 0) {
    // Arc: hop to the nearest not-yet-struck enemy within chainRange of the previous link.
    const chainRangeSq = tower.chainRange * tower.chainRange;
    let from = primary;
    for (let j = 0; j < tower.chainTargets; j++) {
      let next = null, nextDSq = Infinity;
      for (const e of enemies) {
        if (e.hp <= 0 || hitIds.has(e.id)) continue;
        if (e.isCamo && !tower.camoVisible) continue;
        const dx = e.worldX - from.worldX, dy = e.worldY - from.worldY;
        const dSq = dx * dx + dy * dy;
        if (dSq <= chainRangeSq && dSq < nextDSq) { next = e; nextDSq = dSq; }
      }
      if (!next) break;
      hits.push(next); hitIds.add(next.id); from = next;
    }
  } else if (tower.pierce > 0) {
    // Beam: also strike enemies along the straight line from tower through the primary.
    const dx = primary.worldX - tower.x, dy = primary.worldY - tower.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len, uy = dy / len;
    const reach = Math.max(tower.buffedRange, len) + 20;
    const candidates = [];
    for (const e of enemies) {
      if (e.hp <= 0 || hitIds.has(e.id)) continue;
      if (e.isCamo && !tower.camoVisible) continue;
      const ex = e.worldX - tower.x, ey = e.worldY - tower.y;
      const along = ex * ux + ey * uy;          // distance along the beam
      if (along < 0 || along > reach) continue; // behind the tower or past its reach
      const perp = Math.abs(ex * uy - ey * ux); // perpendicular distance to the beam line
      if (perp <= (e.radius ?? 10) + 8) candidates.push({ e, along });
    }
    candidates.sort((a, b) => a.along - b.along);
    for (let i = 0; i < candidates.length && hits.length < tower.pierce + 1; i++) {
      hits.push(candidates[i].e); hitIds.add(candidates[i].e.id);
    }
  }
  return hits;
}

/** Apply one instant hit: direct damage + DoT/debuff/slow, plus optional AoE splash. */
function applyInstantHit(tower, strike, e, dmg, enemies, damageEvents, aoeSq) {
  applyDamage(e, dmg, tower.type, e.worldX, e.worldY, damageEvents, tower.ignoresArmour);
  applyDot(strike, e);
  if (tower.debuffVulnerability > 0) {
    e.vulnerabilityMult  = tower.debuffVulnerability;
    e.vulnerabilityTimer = tower.debuffDuration;
  }
  if (tower.projSlowFactor > 0 && !e.immuneSlow) {
    e.slowFactor = Math.min(e.slowFactor, tower.projSlowFactor);
    e.slowTimer  = Math.max(e.slowTimer,  tower.projSlowDuration);
  }
  if (aoeSq > 0) {
    for (const o of enemies) {
      if (o === e || o.hp <= 0) continue;
      const dx = o.worldX - e.worldX, dy = o.worldY - e.worldY;
      if (dx * dx + dy * dy <= aoeSq) {
        applyDamage(o, dmg, tower.type, o.worldX, o.worldY, damageEvents, tower.ignoresArmour);
        applyDot(strike, o);
      }
    }
  }
}

function onHit(p, enemies, damageEvents, hazards) {
  if (p.aoeRadius > 0) {
    const rSq = p.aoeRadius * p.aoeRadius;
    let hitAny = false;
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      const dx = e.worldX - p.x, dy = e.worldY - p.y;
      if (dx * dx + dy * dy <= rSq) {
        applyDamage(e, p.damage, p.towerType, e.worldX, e.worldY, damageEvents, p.ignoresArmour);
        applyDot(p, e);
        if (p.projSlowFactor > 0 && !e.immuneSlow) {
          e.slowFactor = Math.min(e.slowFactor, p.projSlowFactor);
          e.slowTimer  = Math.max(e.slowTimer,  p.projSlowDuration);
        }
        hitAny = true;
      }
    }
    // Bomb — only play the explosion when the blast actually catches an enemy.
    // Prevents phantom booms from in-flight bombs landing on empty ground after a wave clears.
    if (hitAny) AudioManager.play('bomb-explode');
  } else if (p.target && p.target.id === p.targetId && p.target.hp > 0) {
    applyDamage(p.target, p.damage, p.towerType,
      p.target.worldX, p.target.worldY, damageEvents, p.ignoresArmour);
    applyDot(p, p.target);
    if (p.debuffVulnerability > 0) {
      p.target.vulnerabilityMult  = p.debuffVulnerability;
      p.target.vulnerabilityTimer = p.debuffDuration;
    }
    if (p.projSlowFactor > 0 && !p.target.immuneSlow) {
      p.target.slowFactor = Math.min(p.target.slowFactor, p.projSlowFactor);
      p.target.slowTimer  = Math.max(p.target.slowTimer,  p.projSlowDuration);
    }
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
