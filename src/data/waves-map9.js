/**
 * Map 9 — Labyrinth  (Forest)
 * Curriculum: NO new type — a hard recombination of the full Forest roster
 * (runner, sprinter, tank, armoured, splitter, swarmling, flyer, regenerator,
 * carrier). Difficulty is purely density + HP. Mid-boss on wave 5. hpMult 2.26.
 */
export const WAVES = [
  // Wave 1 — mixed flood
  [{ type: 'runner',   count: 20, interval: 0.4 },
   { type: 'sprinter', count: 14, interval: 0.32 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 7,  interval: 1.1 },
   { type: 'tank',     count: 4,  interval: 1.9 }],

  // Wave 3 — splitters + swarm
  [{ type: 'splitter',  count: 9,  interval: 0.9 },
   { type: 'swarmling', count: 24, interval: 0.14 }],

  // Wave 4 — flyers + regenerators
  [{ type: 'flyer',       count: 8, interval: 0.8 },
   { type: 'regenerator', count: 4, interval: 1.8 }],

  // Wave 5 — MID-BOSS + carrier escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'carrier',  count: 2,  interval: 3.5 }],

  // Wave 6 — tanks + armoured wall
  [{ type: 'tank',     count: 6,  interval: 1.6 },
   { type: 'armoured', count: 8,  interval: 1.1 }],

  // Wave 7 — regenerators + flyers
  [{ type: 'regenerator', count: 5, interval: 1.6 },
   { type: 'flyer',       count: 8, interval: 0.8 }],

  // Wave 8 — splitters + carriers
  [{ type: 'splitter', count: 10, interval: 0.9 },
   { type: 'carrier',  count: 2,  interval: 3.5 }],

  // Wave 9 — armoured + tanks + sprinter surge
  [{ type: 'armoured', count: 8,  interval: 1.0 },
   { type: 'tank',     count: 5,  interval: 1.7 },
   { type: 'sprinter', count: 16, interval: 0.3 }],

  // Wave 10 — TWIN BOSS + regenerator + swarm
  [{ type: 'boss',        count: 2,  interval: 4.0 },
   { type: 'regenerator', count: 3,  interval: 2.0 },
   { type: 'swarmling',   count: 24, interval: 0.15 }],
];
