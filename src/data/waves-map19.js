/**
 * Wave definitions for Map 19 — Purgatory
 * Punishing density; wraith floods demand a dedicated poison setup.
 * hpMult 5.50.
 */
export const WAVES = [
  // Wave 1 — armoured + juggernaut flood
  [{ type: 'armoured',   count: 26, interval: 0.85 },
   { type: 'juggernaut', count:  6, interval: 2.3 }],

  // Wave 2 — wraith + brute + cleric
  [{ type: 'wraith',  count: 12, interval: 1.9 },
   { type: 'brute',   count:  6, interval: 2.1 },
   { type: 'cleric',  count:  5, interval: 1.5 }],

  // Wave 3 — swarmling + carrier + regenerator
  [{ type: 'swarmling',  count: 50, interval: 0.18 },
   { type: 'carrier',    count:  5, interval: 2.4 },
   { type: 'regenerator', count:  8, interval: 1.2 }],

  // Wave 4 — phantom + flyer + insulated (multi-immune wave)
  [{ type: 'phantom',   count:  8, interval: 1.0 },
   { type: 'flyer',     count: 16, interval: 0.55 },
   { type: 'insulated', count: 12, interval: 0.88 }],

  // Wave 5 — MID-BOSS + wraith + juggernaut
  [{ type: 'boss',       count:  1, interval: 1.0 },
   { type: 'wraith',     count: 14, interval: 1.8 },
   { type: 'juggernaut', count:  6, interval: 2.3 }],

  // Wave 6 — brute + shielded + stutter + carrier
  [{ type: 'brute',    count:  7, interval: 2.0 },
   { type: 'shielded', count: 18, interval: 0.85 },
   { type: 'stutter',  count: 12, interval: 0.65 },
   { type: 'carrier',  count:  4, interval: 2.5 }],

  // Wave 7 — wraith + magma + aquatic (elemental + immune)
  [{ type: 'wraith',  count: 14, interval: 1.8 },
   { type: 'magma',   count: 10, interval: 0.95 },
   { type: 'aquatic', count: 10, interval: 0.90 }],

  // Wave 8 — juggernaut + brute + cleric + armoured
  [{ type: 'juggernaut', count:  8, interval: 2.2 },
   { type: 'brute',      count:  7, interval: 2.0 },
   { type: 'cleric',     count:  6, interval: 1.4 },
   { type: 'armoured',   count: 28, interval: 0.82 }],

  // Wave 9 — wraith flood + splitter + phantom
  [{ type: 'wraith',   count: 18, interval: 1.7 },
   { type: 'splitter', count: 22, interval: 0.82 },
   { type: 'phantom',  count:  8, interval: 1.0 }],

  // Wave 10 — MEGABOSS + dual juggernaut + wraith tide
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  8, interval: 2.2 },
   { type: 'wraith',     count: 14, interval: 1.8 },
   { type: 'brute',      count:  6, interval: 2.0 }],
];
