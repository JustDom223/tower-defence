/**
 * Map 10 — The Crucible  (Forest finale)
 * Curriculum: no new trash type — the MEGABOSS capstone (spawns armoured on
 * death). Recombines the full Forest roster at peak density. Mid-boss on wave 5.
 * hpMult 2.50.
 */
export const WAVES = [
  // Wave 1 — heavy mixed flood
  [{ type: 'runner',   count: 24, interval: 0.4 },
   { type: 'sprinter', count: 16, interval: 0.3 }],

  // Wave 2 — armoured + splitters
  [{ type: 'armoured', count: 8,  interval: 1.0 },
   { type: 'splitter', count: 6,  interval: 1.0 }],

  // Wave 3 — carriers + swarm
  [{ type: 'carrier',   count: 3,  interval: 3.0 },
   { type: 'swarmling', count: 26, interval: 0.14 }],

  // Wave 4 — regenerators + flyers
  [{ type: 'regenerator', count: 5, interval: 1.6 },
   { type: 'flyer',       count: 8, interval: 0.8 }],

  // Wave 5 — MID-BOSS + tanks + armoured
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'tank',     count: 6,  interval: 1.6 },
   { type: 'armoured', count: 6,  interval: 1.1 }],

  // Wave 6 — swarm flood + splitters
  [{ type: 'swarmling', count: 44, interval: 0.1 },
   { type: 'splitter',  count: 8,  interval: 0.9 }],

  // Wave 7 — regenerators + carriers + flyers
  [{ type: 'regenerator', count: 5, interval: 1.6 },
   { type: 'carrier',     count: 3, interval: 3.0 },
   { type: 'flyer',       count: 6, interval: 0.9 }],

  // Wave 8 — tank + armoured wall
  [{ type: 'tank',     count: 8,  interval: 1.5 },
   { type: 'armoured', count: 10, interval: 1.0 }],

  // Wave 9 — BOSS + carriers + swarm
  [{ type: 'boss',      count: 1,  interval: 1.0 },
   { type: 'carrier',   count: 2,  interval: 3.5 },
   { type: 'swarmling', count: 26, interval: 0.14 }],

  // Wave 10 — MEGABOSS finale (spawns armoured on death) + armoured + regenerator
  [{ type: 'megaboss',    count: 1, interval: 1.0 },
   { type: 'armoured',    count: 5, interval: 1.3 },
   { type: 'regenerator', count: 3, interval: 2.0 }],
];
