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
    debuffVulnerability: def.debuffVulnerability ?? 0,
    debuffDuration:      def.debuffDuration      ?? 0,
  };
}
