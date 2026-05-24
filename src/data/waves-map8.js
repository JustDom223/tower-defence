/**
 * Wave definitions for Map 8 — Hairpins
 * Four long horizontal lanes with tight U-turns. Mid-boss on wave 5.
 * hpMult 2.04 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 22, interval: 0.60 },
   { type: 'sprinter', count: 12, interval: 0.35 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 12, interval: 1.1 },
   { type: 'tank',     count:  4, interval: 1.8 }],

  // Wave 3 — splitters + sprinters
  [{ type: 'splitter', count: 10, interval: 1.0 },
   { type: 'sprinter', count: 14, interval: 0.33 }],

  // Wave 4 — tanks + armoured
  [{ type: 'tank',     count:  8, interval: 1.8 },
   { type: 'armoured', count: 10, interval: 1.0 }],

  // Wave 5 — MID-BOSS + runner escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'runner',   count: 12, interval: 0.55 }],

  // Wave 6 — armoured + sprinters
  [{ type: 'armoured', count: 16, interval: 1.0 },
   { type: 'sprinter', count: 16, interval: 0.33 }],

  // Wave 7 — tanks + splitters
  [{ type: 'tank',     count: 10, interval: 1.8 },
   { type: 'splitter', count: 12, interval: 1.0 }],

  // Wave 8 — sprinters + armoured
  [{ type: 'sprinter', count: 34, interval: 0.30 },
   { type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 9 — splitters + tanks
  [{ type: 'splitter', count: 18, interval: 1.0 },
   { type: 'tank',     count:  8, interval: 1.8 }],

  // Wave 10 — BOSS + armoured + tanks
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count: 12, interval: 1.0 },
   { type: 'tank',     count:  6, interval: 1.8 }],
];
