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
    upgradesA:    0,
    upgradesB:    0,
    upgradeSpent: 0,
    angle:        0, // radians — updated by CombatSystem; used by TowerRenderer for barrel direction
    isSupport:    false,
    buffFireRate: 0,
    buffDamage:   0,
    buffRange:    0,
    camoDetect:   false,
    buffedFireRate: 0,
    buffedDamage:   0,
    buffedRange:    0,
    camoVisible:    false,
  };
}
