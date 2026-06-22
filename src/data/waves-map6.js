/**
 * Map 6 — Detour  (Forest)
 * Curriculum: introduces FLYER — floats above the path and ignores ground
 * hazards (mines, fire pools). Any projectile tower still hits it, so the lesson
 * is "hazard-only defences have a gap." Builds on all prior Forest basics.
 * hpMult 1.66.
 */
export const WAVES = [
  // Wave 1 — known basics
  [{ type: 'runner',   count: 16, interval: 0.5 },
   { type: 'sprinter', count: 10, interval: 0.4 }],

  // Wave 2 — swarm + splitters
  [{ type: 'swarmling', count: 24, interval: 0.15 },
   { type: 'splitter',  count: 5,  interval: 1.1 }],

  // Wave 3 — DEBUT: flyers, alone (note they skip ground hazards)
  [{ type: 'flyer',    count: 5,  interval: 1.1 }],

  // Wave 4 — flyers with runner escort
  [{ type: 'flyer',    count: 7,  interval: 0.9 },
   { type: 'runner',   count: 10, interval: 0.55 }],

  // Wave 5 — armoured + tanks
  [{ type: 'armoured', count: 6,  interval: 1.2 },
   { type: 'tank',     count: 4,  interval: 1.9 }],

  // Wave 6 — flyer flock + sprinters
  [{ type: 'flyer',    count: 8,  interval: 0.8 },
   { type: 'sprinter', count: 10, interval: 0.4 }],

  // Wave 7 — swarm + splitters
  [{ type: 'swarmling', count: 30, interval: 0.13 },
   { type: 'splitter',  count: 6,  interval: 1.0 }],

  // Wave 8 — flyers + armoured
  [{ type: 'flyer',    count: 9,  interval: 0.8 },
   { type: 'armoured', count: 5,  interval: 1.2 }],

  // Wave 9 — flyers + tanks + swarm
  [{ type: 'flyer',     count: 6,  interval: 0.9 },
   { type: 'tank',      count: 5,  interval: 1.8 },
   { type: 'swarmling', count: 22, interval: 0.15 }],

  // Wave 10 — BOSS + flyer + armoured escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'flyer',    count: 6,  interval: 0.9 },
   { type: 'armoured', count: 4,  interval: 1.3 }],
];
