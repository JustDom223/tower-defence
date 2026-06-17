/**
 * Wave definitions for Map 6 — Detour
 * Short path with a sharp mid-detour; fewer choke points.
 * NEW: Magma (wave 2 — immune to slow/freeze, resists frost) and Insulated
 * (wave 4 — immune to Tesla). Both take full damage from dart/bomb/marksman, so
 * the lesson is "don't lean on a single element." hpMult 1.66.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 18, interval: 0.58 },
   { type: 'sprinter', count:  8, interval: 0.34 }],

  // Wave 2 — Magma debut (slow/frost do nothing — bring direct damage) + runners
  [{ type: 'magma',    count:  5, interval: 1.2 },
   { type: 'runner',   count: 10, interval: 0.58 }],

  // Wave 3 — tanks + splitters
  [{ type: 'tank',     count:  5, interval: 1.7 },
   { type: 'splitter', count:  6, interval: 1.0 }],

  // Wave 4 — Insulated debut (Tesla does nothing) + sprinters
  [{ type: 'insulated', count: 6, interval: 1.0 },
   { type: 'sprinter',  count: 12, interval: 0.34 }],

  // Wave 5 — armoured + tanks
  [{ type: 'armoured', count: 10, interval: 1.0 },
   { type: 'tank',     count:  4, interval: 1.7 }],

  // Wave 6 — magma + splitters
  [{ type: 'magma',    count:  6, interval: 1.1 },
   { type: 'splitter', count: 10, interval: 1.0 }],

  // Wave 7 — tanks + sprinters
  [{ type: 'tank',     count:  6, interval: 1.7 },
   { type: 'sprinter', count: 18, interval: 0.32 }],

  // Wave 8 — insulated + armoured
  [{ type: 'insulated', count: 8, interval: 1.0 },
   { type: 'armoured',  count: 8, interval: 1.0 }],

  // Wave 9 — sprinter push + magma + tanks
  [{ type: 'sprinter', count: 26, interval: 0.30 },
   { type: 'magma',    count:  4, interval: 1.2 },
   { type: 'tank',     count:  5, interval: 1.7 }],

  // Wave 10 — BOSS + armoured escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'armoured', count:  8, interval: 1.0 }],
];
