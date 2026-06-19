/**
 * Wave definitions for Map 20 — The Abyss
 * The final map. Relentless density, two megaboss waves, wraith tide throughout.
 * Demands a full tower arsenal and a poison archer. hpMult 6.00.
 */
export const WAVES = [
  // Wave 1 — juggernaut + brute + armoured wall
  [{ type: 'juggernaut', count:  8, interval: 2.2 },
   { type: 'brute',      count:  8, interval: 2.0 },
   { type: 'armoured',   count: 28, interval: 0.82 }],

  // Wave 2 — wraith tide + regenerator + cleric
  [{ type: 'wraith',      count: 16, interval: 1.7 },
   { type: 'regenerator', count: 10, interval: 1.2 },
   { type: 'cleric',      count:  6, interval: 1.4 }],

  // Wave 3 — carrier + swarmling + splitter cascade
  [{ type: 'carrier',  count:  6, interval: 2.3 },
   { type: 'swarmling', count: 60, interval: 0.16 },
   { type: 'splitter', count: 24, interval: 0.80 }],

  // Wave 4 — phantom + flyer + insulated + magma (full immunity set)
  [{ type: 'phantom',   count: 10, interval: 0.95 },
   { type: 'flyer',     count: 18, interval: 0.52 },
   { type: 'insulated', count: 12, interval: 0.85 },
   { type: 'magma',     count: 10, interval: 0.92 }],

  // Wave 5 — MID-BOSS + wraith + juggernaut
  [{ type: 'boss',       count:  1, interval: 1.0 },
   { type: 'wraith',     count: 18, interval: 1.6 },
   { type: 'juggernaut', count:  8, interval: 2.2 }],

  // Wave 6 — brute + shielded + stutter + cleric (survival grind)
  [{ type: 'brute',    count:  8, interval: 2.0 },
   { type: 'shielded', count: 20, interval: 0.82 },
   { type: 'stutter',  count: 14, interval: 0.62 },
   { type: 'cleric',   count:  7, interval: 1.3 }],

  // Wave 7 — wraith + aquatic + magma + armoured
  [{ type: 'wraith',   count: 18, interval: 1.6 },
   { type: 'aquatic',  count: 12, interval: 0.88 },
   { type: 'magma',    count: 10, interval: 0.92 },
   { type: 'armoured', count: 28, interval: 0.80 }],

  // Wave 8 — juggernaut + brute + carrier + phantom
  [{ type: 'juggernaut', count: 10, interval: 2.1 },
   { type: 'brute',      count:  8, interval: 2.0 },
   { type: 'carrier',    count:  6, interval: 2.3 },
   { type: 'phantom',    count: 10, interval: 0.92 }],

  // Wave 9 — wraith flood + regenerator + cleric + stutter (everything DoT-related)
  [{ type: 'wraith',      count: 22, interval: 1.5 },
   { type: 'regenerator', count: 12, interval: 1.1 },
   { type: 'cleric',      count:  8, interval: 1.3 },
   { type: 'stutter',     count: 14, interval: 0.60 }],

  // Wave 10 — DUAL MEGABOSS finale + juggernaut + wraith + brute
  [{ type: 'megaboss',   count:  2, interval: 8.0 },
   { type: 'juggernaut', count: 10, interval: 2.1 },
   { type: 'wraith',     count: 18, interval: 1.6 },
   { type: 'brute',      count:  8, interval: 2.0 }],
];
