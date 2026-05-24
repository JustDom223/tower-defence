/**
 * Wave definitions for Map 7 — Gauntlet
 * Five tight choke columns — very long path, ideal for burst damage.
 * hpMult 1.84 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 20, interval: 0.60 },
   { type: 'sprinter', count: 10, interval: 0.35 }],

  // Wave 2 — armoured wall
  [{ type: 'armoured', count: 10, interval: 1.1 }],

  // Wave 3 — tanks + splitters
  [{ type: 'tank',     count:  6, interval: 1.8 },
   { type: 'splitter', count:  8, interval: 1.0 }],

  // Wave 4 — sprinter rush
  [{ type: 'sprinter', count: 28, interval: 0.32 }],

  // Wave 5 — armoured + tanks
  [{ type: 'armoured', count: 12, interval: 1.0 },
   { type: 'tank',     count:  5, interval: 1.8 }],

  // Wave 6 — splitters + sprinters
  [{ type: 'splitter', count: 16, interval: 1.0 },
   { type: 'sprinter', count: 12, interval: 0.33 }],

  // Wave 7 — tanks + armoured
  [{ type: 'tank',     count:  8, interval: 1.8 },
   { type: 'armoured', count:  8, interval: 1.0 }],

  // Wave 8 — armoured + splitters
  [{ type: 'armoured', count: 14, interval: 1.0 },
   { type: 'splitter', count: 10, interval: 1.0 }],

  // Wave 9 — sprinter flood + tanks
  [{ type: 'sprinter', count: 30, interval: 0.30 },
   { type: 'tank',     count:  8, interval: 1.8 }],

  // Wave 10 — BOSS + tanks + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'tank',     count:  6, interval: 1.8 },
   { type: 'armoured', count:  6, interval: 1.0 }],
];
