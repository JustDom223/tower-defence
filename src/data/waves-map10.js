/**
 * Wave definitions for Map 10 — The Crucible
 * More open mid-section (fewer chokes) — the curve, not the geometry, carries the threat.
 * Mid-boss on wave 5; double-boss finale. hpMult 2.50 × difficulty.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 28, interval: 0.58 },
   { type: 'sprinter', count: 16, interval: 0.32 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 16, interval: 1.1 },
   { type: 'tank',     count:  8, interval: 1.8 }],

  // Wave 3 — splitters + sprinters
  [{ type: 'splitter', count: 16, interval: 1.0 },
   { type: 'sprinter', count: 22, interval: 0.30 }],

  // Wave 4 — tanks + armoured
  [{ type: 'tank',     count: 12, interval: 1.8 },
   { type: 'armoured', count: 16, interval: 1.0 }],

  // Wave 5 — MID-BOSS + armoured escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 6 — armoured + sprinters
  [{ type: 'armoured', count: 22, interval: 1.0 },
   { type: 'sprinter', count: 24, interval: 0.30 }],

  // Wave 7 — tanks + splitters
  [{ type: 'tank',     count: 14, interval: 1.8 },
   { type: 'splitter', count: 18, interval: 1.0 }],

  // Wave 8 — armoured + tanks
  [{ type: 'armoured', count: 24, interval: 1.0 },
   { type: 'tank',     count: 12, interval: 1.8 }],

  // Wave 9 — sprinter flood + armoured
  [{ type: 'sprinter', count: 50, interval: 0.25 },
   { type: 'armoured', count: 18, interval: 1.0 }],

  // Wave 10 — DOUBLE BOSS + armoured + tanks
  [{ type: 'boss',     count:  2, interval: 4.0 },
   { type: 'armoured', count: 12, interval: 1.0 },
   { type: 'tank',     count:  8, interval: 1.8 }],
];
