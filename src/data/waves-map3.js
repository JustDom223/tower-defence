/**
 * Wave definitions for Map 3 — Switchbacks
 * Three long horizontal lanes; good firing lines.
 * Introduces Armoured enemy (wave 4). hpMult 1.22 × difficulty.
 */
export const WAVES = [
  // Wave 1 — runners only
  [{ type: 'runner',   count: 12, interval: 0.6 }],

  // Wave 2 — runners with a sprinter tail
  [{ type: 'runner',   count: 10, interval: 0.65 },
   { type: 'sprinter', count:  5, interval: 0.40 }],

  // Wave 3 — sprinters then runners
  [{ type: 'sprinter', count:  8, interval: 0.38 },
   { type: 'runner',   count:  8, interval: 0.60 }],

  // Wave 4 — Armoured debut (half damage from Dart & Marksman)
  [{ type: 'armoured', count:  4, interval: 1.2 }],

  // Wave 5 — tanks backed by runners
  [{ type: 'tank',     count:  3, interval: 1.8 },
   { type: 'runner',   count: 12, interval: 0.55 }],

  // Wave 6 — splitter swarm
  [{ type: 'splitter', count:  6, interval: 1.1 }],

  // Wave 7 — armoured + sprinters
  [{ type: 'armoured', count:  6, interval: 1.0 },
   { type: 'sprinter', count:  6, interval: 0.38 }],

  // Wave 8 — tanks + armoured
  [{ type: 'tank',     count:  4, interval: 1.8 },
   { type: 'armoured', count:  4, interval: 1.1 }],

  // Wave 9 — sprinter flood + runners
  [{ type: 'sprinter', count: 16, interval: 0.35 },
   { type: 'runner',   count: 10, interval: 0.55 }],

  // Wave 10 — BOSS + runner escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'runner',   count: 10, interval: 0.60 }],
];
