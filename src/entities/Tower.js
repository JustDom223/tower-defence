import { TOWER_TYPES } from '../data/towers.js';

let nextId = 0;

export function createTower(type, x, y) {
  const def = TOWER_TYPES[type];
  return {
    id: ++nextId,
    type, x, y,
    targeting: 'first',
    cooldown: 0,
    damage:       def.damage,
    range:        def.range,
    fireRate:     def.fireRate,
    projSpeed:    def.projSpeed,
    aoeRadius:    def.aoeRadius   ?? 0,
    isSlow:       def.isSlow      ?? false,
    slowFactor:   def.slowFactor  ?? 0,
    slowDuration: def.slowDuration ?? 0,
    globalRange:  def.globalRange  ?? false,
    leavesHazard:   def.leavesHazard   ?? false,
    hazardDamage:   def.hazardDamage   ?? 0,
    hazardRadius:   def.hazardRadius   ?? 30,
    hazardDuration: def.hazardDuration ?? 4.0,
    hazardTickRate: def.hazardTickRate ?? 0.5,
    upgradesA:    0,
    upgradesB:    0,
    upgradeSpent: 0,
    angle:        0, // radians — updated by CombatSystem; used by TowerRenderer for barrel direction
  };
}
