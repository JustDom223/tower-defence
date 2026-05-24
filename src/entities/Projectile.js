import { ObjectPool } from '../core/ObjectPool.js';

function make() {
  return {
    active: false,
    x: 0, y: 0, prevX: 0, prevY: 0,
    vx: 0, vy: 0,
    speed: 0, damage: 0, aoeRadius: 0,
    target: null, targetId: 0, towerType: '',
  };
}

function reset(p, { x, y, target, speed, damage, aoeRadius = 0, towerType = '' }) {
  p.active   = true;
  p.x        = p.prevX = x;
  p.y        = p.prevY = y;
  p.speed    = speed;
  p.damage   = damage;
  p.aoeRadius = aoeRadius;
  p.target   = target;
  p.targetId = target ? target.id : 0;
  p.towerType = towerType;
  if (target) {
    const dx = target.worldX - x, dy = target.worldY - y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    p.vx = (dx / len) * speed;
    p.vy = (dy / len) * speed;
  } else {
    p.vx = 0; p.vy = 0;
  }
}

export const projectilePool = new ObjectPool(make, reset);
