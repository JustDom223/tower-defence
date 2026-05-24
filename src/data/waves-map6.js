/**
 * Wave definitions for Map 6 — Detour
 * Short path with a sharp mid-detour; fewer choke points. hpMult 1.66 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 18, interval: 0.60 },
   { type: 'sprinter', count:  8, interval: 0.35 }],

  // Wave 2 — armoured + runners
  [{ type: 'armoured', count:  8, interval: 1.1 },
   { type: 'runner',   count: 10, interval: 0.60 }],

  // Wave 3 — tanks + splitters
  [{ type: 'tank',     count:  5, interval: 1.8 },
   { type: 'splitter', count:  6, interval: 1.0 }],

  // Wave 4 — sprinter rush
  [{ type: 'sprinter', count: 24, interval: 0.32 }],

  // Wave 5 — armoured + tanks
  [{ type: 'armoured', count: 10, interval: 1.0 },
   { type: 'tank',     count:  4, interval: 1.8 }],

  // Wave 6 — splitter wall
  [{ type: 'splitter', count: 14, interval: 1.0 }],

  // Wave 7 — tanks + sprinters
  [{ type: 'tank',     count:  6, interval: 1.8 },
   { type: 'sprinter', count: 16, interval: 0.33 }],

  // Wave 8 — armoured + splitters
  [{ type: 'armoured', count: 10, interval: 1.0 },
   { type: 'splitter', count:  8, interval: 1.0 }],

  // Wave 9 — full-mix sprinter push + tanks
  [{ type: 'sprinter', count: 26, interval: 0.32 },
   { type: 'tank',     count:  6, interval: 1.8 }],

  // Wave 10 — BOSS + armoured escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count:  8, interval: 1.0 }],
];
