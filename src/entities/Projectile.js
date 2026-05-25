import { ObjectPool } from '../core/ObjectPool.js';

function make() {
  return {
    active: false,
    x: 0, y: 0, prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    speed: 0, damage: 0, aoeRadius: 0,
    target: null, targetId: 0, towerType: '',
    ballistic: false, landX: 0, landY: 0,
    dotDamage: 0, dotDuration: 0, dotTickRate: 1.0,
    dotIgnoresArmour: false, dotStackCap: 1,
  };
}

function reset(p, { x, y, target, speed, damage, aoeRadius = 0, towerType = '', ballistic = false,
  dotDamage = 0, dotDuration = 0, dotTickRate = 1.0, dotIgnoresArmour = false, dotStackCap = 1 }) {
  p.active    = true;
  p.x         = p.prevX = x;
  p.y         = p.prevY = y;
  p.speed     = speed;
  p.damage    = damage;
  p.aoeRadius = aoeRadius;
  p.target    = target;
  p.targetId  = target ? target.id : 0;
  p.towerType = towerType;
  p.ballistic = ballistic;
  p.dotDamage        = dotDamage;
  p.dotDuration      = dotDuration;
  p.dotTickRate      = dotTickRate;
  p.dotIgnoresArmour = dotIgnoresArmour;
  p.dotStackCap      = dotStackCap;

  const destX = ballistic && target ? target.worldX : (target ? target.worldX : x);
  const destY = ballistic && target ? target.worldY : (target ? target.worldY : y);
  p.landX = destX;
  p.landY = destY;

  const dx = destX - x, dy = destY - y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  p.vx = (dx / len) * speed;
  p.vy = (dy / len) * speed;
}

export const projectilePool = new ObjectPool(make, reset);
