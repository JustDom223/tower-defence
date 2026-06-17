/**
 * Wave definitions for Map 4 — The Cross
 * Path enters top, exits bottom; mid-section crosses itself.
 * NEW: Flyer (wave 2 — ignores ground hazards, but any tower still hits it) and
 * Stutter (wave 4 — stop-and-go movement, hard to lead-aim). hpMult 1.35.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 14, interval: 0.55 },
   { type: 'sprinter', count:  4, interval: 0.38 }],

  // Wave 2 — Flyer debut (floats above ground hazards; projectiles still hit)
  [{ type: 'flyer',    count:  6, interval: 0.7 },
   { type: 'runner',   count:  8, interval: 0.55 }],

  // Wave 3 — armoured + runner mix
  [{ type: 'armoured', count:  5, interval: 1.1 },
   { type: 'runner',   count:  8, interval: 0.60 }],

  // Wave 4 — Stutter debut (bursty movement) + sprinters
  [{ type: 'stutter',  count:  6, interval: 0.8 },
   { type: 'sprinter', count:  8, interval: 0.38 }],

  // Wave 5 — splitter swarm + tank
  [{ type: 'splitter', count:  8, interval: 1.0 },
   { type: 'tank',     count:  3, interval: 1.8 }],

  // Wave 6 — armoured wall + flyers
  [{ type: 'armoured', count:  8, interval: 1.0 },
   { type: 'flyer',    count:  5, interval: 0.7 }],

  // Wave 7 — sprinters + tanks
  [{ type: 'sprinter', count: 18, interval: 0.33 },
   { type: 'tank',     count:  4, interval: 1.7 }],

  // Wave 8 — tanks + armoured + stutter
  [{ type: 'tank',     count:  5, interval: 1.7 },
   { type: 'armoured', count:  6, interval: 1.0 },
   { type: 'stutter',  count:  4, interval: 0.9 }],

  // Wave 9 — splitters + sprinters + flyers
  [{ type: 'splitter', count: 10, interval: 1.0 },
   { type: 'sprinter', count: 10, interval: 0.33 },
   { type: 'flyer',    count:  4, interval: 0.7 }],

  // Wave 10 — BOSS + armoured escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count:  6, interval: 1.0 }],
];
