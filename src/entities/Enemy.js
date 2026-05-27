import { ObjectPool } from '../core/ObjectPool.js';
import { ENEMY_TYPES } from '../data/enemies.js';

let nextId = 0;

function make() {
  return {
    active: false, id: 0, type: '', hp: 0, maxHp: 0, speed: 0, reward: 0,
    cashReward: 0,
    radius: 10, color: 0, sprite: null, spawns: null, resistance: null,
    isCamo: false,
    liveSpawnInterval: 0, liveSpawnTimer: 0, liveSpawnType: null, liveSpawnCount: 0,
    distance: 0, prevDistance: 0,
    worldX: 0, worldY: 0,
    slowFactor: 1, slowTimer: 0,
    stunTimer: 0,
    flashTimer: 0,
    dotStacks: [],
    vulnerabilityMult: 1.0,
    vulnerabilityTimer: 0,
    shield: 0, maxShield: 0,
    regenRate: 0,
    isFlying: false,
    immuneSlow: false,
    healsNearby: 0, healsNearbyRadius: 0,
    stutterInterval: 0, stutterPauseTime: 0, stutterTimer: 0, stutterPausing: false,
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
  e.cashReward = def.cashReward ?? def.reward;
  e.radius = def.radius;
  e.color = def.color;
  e.sprite = def.sprite ?? null;
  e.spawns = def.spawns ?? null;
  e.resistance = def.resistance ?? null;
  e.isCamo = def.isCamo ?? false;
  e.liveSpawnInterval = def.liveSpawnInterval ?? 0;
  e.liveSpawnTimer = 0;
  e.liveSpawnType = def.liveSpawnType ?? null;
  e.liveSpawnCount = def.liveSpawnCount ?? 0;
  e.distance = distance;
  e.prevDistance = distance;
  e.worldX = 0;
  e.worldY = 0;
  e.slowFactor = 1;
  e.slowTimer = 0;
  e.stunTimer = 0;
  e.flashTimer = 0;
  e.dotStacks = [];
  e.vulnerabilityMult = 1.0;
  e.vulnerabilityTimer = 0;
  e.shield       = def.shield       ?? 0;
  e.maxShield    = def.shield       ?? 0;
  e.regenRate    = def.regenRate    ?? 0;
  e.isFlying     = def.isFlying     ?? false;
  e.immuneSlow   = def.immuneSlow   ?? false;
  e.healsNearby      = def.healsNearby      ?? 0;
  e.healsNearbyRadius = def.healsNearbyRadius ?? 0;
  e.stutterInterval  = def.stutterInterval  ?? 0;
  e.stutterPauseTime = def.stutterPauseTime ?? 0;
  e.stutterTimer     = def.stutterInterval ?? 0; // start mid-run, not mid-pause
  e.stutterPausing   = false;
}

export const enemyPool = new ObjectPool(make, reset);
