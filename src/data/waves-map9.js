/**
 * Wave definitions for Map 9 — Labyrinth
 * Very winding — enormous path length rewards cheap towers at choke points.
 * hpMult 2.26 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 24, interval: 0.60 },
   { type: 'sprinter', count: 14, interval: 0.33 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 14, interval: 1.1 },
   { type: 'tank',     count:  6, interval: 1.8 }],

  // Wave 3 — splitters + sprinters
  [{ type: 'splitter', count: 14, interval: 1.0 },
   { type: 'sprinter', count: 18, interval: 0.32 }],

  // Wave 4 — tanks + armoured
  [{ type: 'tank',     count: 10, interval: 1.8 },
   { type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 5 — armoured + splitters
  [{ type: 'armoured', count: 18, interval: 1.0 },
   { type: 'splitter', count: 10, interval: 1.0 }],

  // Wave 6 — pure sprinter flood
  [{ type: 'sprinter', count: 40, interval: 0.28 }],

  // Wave 7 — tanks + armoured
  [{ type: 'tank',     count: 12, interval: 1.8 },
   { type: 'armoured', count: 14, interval: 1.0 }],

  // Wave 8 — splitters + armoured
  [{ type: 'splitter', count: 22, interval: 1.0 },
   { type: 'armoured', count: 14, interval: 1.0 }],

  // Wave 9 — sprinter surge + tanks
  [{ type: 'sprinter', count: 44, interval: 0.27 },
   { type: 'tank',     count: 12, interval: 1.8 }],

  // Wave 10 — BOSS + armoured + tanks
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count: 16, interval: 1.0 },
   { type: 'tank',     count:  8, interval: 1.8 }],
];
