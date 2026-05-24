/**
 * Wave definitions for Map 4 — The Cross
 * Path enters top, exits bottom; mid-section crosses itself.
 * hpMult 1.35 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 14, interval: 0.60 },
   { type: 'sprinter', count:  4, interval: 0.38 }],

  // Wave 2 — pure sprinter burst
  [{ type: 'sprinter', count: 10, interval: 0.35 }],

  // Wave 3 — armoured + runner mix
  [{ type: 'armoured', count:  5, interval: 1.2 },
   { type: 'runner',   count:  8, interval: 0.60 }],

  // Wave 4 — tanks + splitters
  [{ type: 'tank',     count:  4, interval: 1.8 },
   { type: 'splitter', count:  4, interval: 1.1 }],

  // Wave 5 — splitter swarm
  [{ type: 'splitter', count:  8, interval: 1.0 }],

  // Wave 6 — armoured wall
  [{ type: 'armoured', count:  8, interval: 1.0 }],

  // Wave 7 — sprinters + tanks
  [{ type: 'sprinter', count: 18, interval: 0.35 },
   { type: 'tank',     count:  3, interval: 1.8 }],

  // Wave 8 — tanks + armoured
  [{ type: 'tank',     count:  5, interval: 1.8 },
   { type: 'armoured', count:  6, interval: 1.0 }],

  // Wave 9 — splitters + sprinters
  [{ type: 'splitter', count: 10, interval: 1.0 },
   { type: 'sprinter', count: 10, interval: 0.35 }],

  // Wave 10 — BOSS + armoured escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count:  6, interval: 1.0 }],
];
