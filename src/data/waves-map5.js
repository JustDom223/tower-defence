/**
 * Map 5 — Coil  (Forest)
 * Curriculum: introduces SWARMLING — tiny, very fast, very weak, sent in floods.
 * Teaches the value of coverage and area damage over single-target burst. Builds
 * on runner/sprinter/tank/armoured/splitter. hpMult 1.50.
 */
export const WAVES = [
  // Wave 1 — known basics
  [{ type: 'runner',   count: 16, interval: 0.5 },
   { type: 'sprinter', count: 8,  interval: 0.4 }],

  // Wave 2 — splitters + tanks
  [{ type: 'splitter', count: 6,  interval: 1.2 },
   { type: 'tank',     count: 3,  interval: 2.2 }],

  // Wave 3 — DEBUT: swarmling flood, alone (a wall of tiny fast bodies)
  [{ type: 'swarmling', count: 20, interval: 0.18 }],

  // Wave 4 — bigger swarm + runners
  [{ type: 'swarmling', count: 26, interval: 0.16 },
   { type: 'runner',    count: 8,  interval: 0.6 }],

  // Wave 5 — armoured + splitters
  [{ type: 'armoured', count: 5,  interval: 1.3 },
   { type: 'splitter', count: 5,  interval: 1.1 }],

  // Wave 6 — swarm + sprinters
  [{ type: 'swarmling', count: 30, interval: 0.14 },
   { type: 'sprinter',  count: 8,  interval: 0.4 }],

  // Wave 7 — tanks + armoured
  [{ type: 'tank',     count: 5,  interval: 1.9 },
   { type: 'armoured', count: 5,  interval: 1.2 }],

  // Wave 8 — swarm + splitters
  [{ type: 'swarmling', count: 30, interval: 0.13 },
   { type: 'splitter',  count: 6,  interval: 1.0 }],

  // Wave 9 — swarm + armoured + tanks
  [{ type: 'swarmling', count: 24, interval: 0.15 },
   { type: 'armoured',  count: 5,  interval: 1.2 },
   { type: 'tank',      count: 4,  interval: 1.9 }],

  // Wave 10 — BOSS + swarm + splitter escort
  [{ type: 'boss',      count: 1,  interval: 1.0 },
   { type: 'swarmling', count: 24, interval: 0.15 },
   { type: 'splitter',  count: 4,  interval: 1.2 }],
];
