import { ObjectPool } from '../core/ObjectPool.js';
import { ENEMY_TYPES } from '../data/enemies.js';

let nextId = 0;

function make() {
  return {
    active: false, id: 0, type: '', hp: 0, maxHp: 0, speed: 0, reward: 0,
    radius: 10, color: 0, sprite: null, spawns: null, resistance: null,
    distance: 0, prevDistance: 0,
    worldX: 0, worldY: 0,
    slowFactor: 1, slowTimer: 0,
    flashTimer: 0,
    dotStacks: [],   // [{ damage, tickRate, remaining, nextTick, ignoresArmour, sourceType }]
  };
}

function reset(e, { type, distance = 0 }) {
  const def = ENEMY_TYPES[type];
  e.id = ++nextId;
  e.active = true;
  e.type = type;
  e.hp = def.hp;
  e.maxHp = def.hp;
  e.speed = def.speed;
  e.reward = def.reward;
  e.radius = def.radius;
  e.color = def.color;
  e.sprite = def.sprite ?? null;
  e.spawns = def.spawns ?? null;
  e.resistance = def.resistance ?? null;
  e.distance = distance;
  e.prevDistance = distance;
  e.worldX = 0;
  e.worldY = 0;
  e.slowFactor = 1;
  e.slowTimer = 0;
  e.flashTimer = 0;
  e.dotStacks = [];
}

export const enemyPool = new ObjectPool(make, reset);
