/**
 * Map 7 — Gauntlet  (Forest)
 * Curriculum: introduces REGENERATOR — regrows HP over time, so chip damage
 * stalls and it must be burned down (burst or DoT). Builds on all prior Forest
 * basics. Density steps up. hpMult 1.84.
 */
export const WAVES = [
  // Wave 1 — known basics
  [{ type: 'runner',   count: 18, interval: 0.45 },
   { type: 'sprinter', count: 10, interval: 0.4 }],

  // Wave 2 — flyers + splitters
  [{ type: 'flyer',    count: 6,  interval: 1.0 },
   { type: 'splitter', count: 6,  interval: 1.1 }],

  // Wave 3 — DEBUT: regenerators, alone (watch them heal back if you ease off)
  [{ type: 'regenerator', count: 3, interval: 2.2 }],

  // Wave 4 — regenerators with runner escort
  [{ type: 'regenerator', count: 4, interval: 1.9 },
   { type: 'runner',      count: 10, interval: 0.55 }],

  // Wave 5 — swarm + armoured
  [{ type: 'swarmling', count: 30, interval: 0.13 },
   { type: 'armoured',  count: 5,  interval: 1.2 }],

  // Wave 6 — regenerators + sprinters
  [{ type: 'regenerator', count: 5,  interval: 1.7 },
   { type: 'sprinter',    count: 10, interval: 0.4 }],

  // Wave 7 — tanks + flyers
  [{ type: 'tank',     count: 6,  interval: 1.7 },
   { type: 'flyer',    count: 6,  interval: 0.9 }],

  // Wave 8 — regenerators + splitters
  [{ type: 'regenerator', count: 5, interval: 1.6 },
   { type: 'splitter',    count: 7, interval: 1.0 }],

  // Wave 9 — regenerators + armoured + swarm
  [{ type: 'regenerator', count: 4,  interval: 1.7 },
   { type: 'armoured',    count: 6,  interval: 1.1 },
   { type: 'swarmling',   count: 24, interval: 0.15 }],

  // Wave 10 — BOSS + regenerator + tank escort
  [{ type: 'boss',        count: 1, interval: 1.0 },
   { type: 'regenerator', count: 3, interval: 2.0 },
   { type: 'tank',        count: 4, interval: 1.9 }],
];
