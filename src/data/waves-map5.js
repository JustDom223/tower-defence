/**
 * Wave definitions for Map 5 — Coil
 * Inward spiral — long path, many loops. hpMult 1.50 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 16, interval: 0.60 },
   { type: 'sprinter', count:  6, interval: 0.38 }],

  // Wave 2 — armoured opening
  [{ type: 'armoured', count:  6, interval: 1.2 }],

  // Wave 3 — tanks + runners
  [{ type: 'tank',     count:  4, interval: 1.8 },
   { type: 'runner',   count: 12, interval: 0.55 }],

  // Wave 4 — splitters + sprinters
  [{ type: 'splitter', count:  8, interval: 1.0 },
   { type: 'sprinter', count:  8, interval: 0.38 }],

  // Wave 5 — armoured + tanks
  [{ type: 'armoured', count:  8, interval: 1.1 },
   { type: 'tank',     count:  3, interval: 1.8 }],

  // Wave 6 — pure sprinter flood
  [{ type: 'sprinter', count: 22, interval: 0.33 }],

  // Wave 7 — tanks + armoured push
  [{ type: 'tank',     count:  6, interval: 1.8 },
   { type: 'armoured', count:  6, interval: 1.0 }],

  // Wave 8 — splitters + armoured
  [{ type: 'splitter', count: 12, interval: 1.0 },
   { type: 'armoured', count:  6, interval: 1.0 }],

  // Wave 9 — sprinters + tanks
  [{ type: 'sprinter', count: 20, interval: 0.33 },
   { type: 'tank',     count:  5, interval: 1.8 }],

  // Wave 10 — BOSS + tanks + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'tank',     count:  4, interval: 1.8 },
   { type: 'armoured', count:  4, interval: 1.0 }],
];
