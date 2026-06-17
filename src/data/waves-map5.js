/**
 * Wave definitions for Map 5 — Coil
 * Inward spiral — long path, many loops.
 * NEW: Regenerator (wave 3 — needs sustained DPS / DoT) and Cleric (wave 5 —
 * heals nearby enemies, a priority kill). Dart can out-damage both; flamethrower/
 * laser make it cleaner. hpMult 1.50.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 16, interval: 0.55 },
   { type: 'sprinter', count:  6, interval: 0.36 }],

  // Wave 2 — armoured opening
  [{ type: 'armoured', count:  6, interval: 1.1 }],

  // Wave 3 — Regenerator debut (regrows HP — burn it down fast) + runners
  [{ type: 'regenerator', count: 4, interval: 1.6 },
   { type: 'runner',      count: 10, interval: 0.55 }],

  // Wave 4 — splitters + sprinters
  [{ type: 'splitter', count:  8, interval: 1.0 },
   { type: 'sprinter', count:  8, interval: 0.36 }],

  // Wave 5 — Cleric debut (heals others — kill it first) + tanks
  [{ type: 'cleric',   count:  3, interval: 1.6 },
   { type: 'tank',     count:  4, interval: 1.7 }],

  // Wave 6 — pure sprinter flood
  [{ type: 'sprinter', count: 22, interval: 0.32 }],

  // Wave 7 — regenerators + armoured
  [{ type: 'regenerator', count: 5, interval: 1.4 },
   { type: 'armoured',    count: 6, interval: 1.0 }],

  // Wave 8 — splitters + armoured + cleric
  [{ type: 'splitter', count: 12, interval: 1.0 },
   { type: 'armoured', count:  5, interval: 1.0 },
   { type: 'cleric',   count:  2, interval: 2.0 }],

  // Wave 9 — sprinters + tanks
  [{ type: 'sprinter', count: 20, interval: 0.32 },
   { type: 'tank',     count:  5, interval: 1.7 }],

  // Wave 10 — BOSS + tanks + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'tank',     count:  4, interval: 1.7 },
   { type: 'armoured', count:  4, interval: 1.0 }],
];
