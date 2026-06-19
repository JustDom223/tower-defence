/**
 * Wave definitions for Map 21 — Helix
 * First Ruins map. Single long spiral path — enemies spend a long time on the
 * map so tower coverage of the winding arms is the core challenge.
 * hpMult 3.50, cashRewardMult 1.65.
 */
export const WAVES = [
  // Wave 1 — armoured + shielded (tests the new wizard tower immediately)
  [{ type: 'armoured', count: 14, interval: 0.90 },
   { type: 'shielded', count:  8, interval: 1.20 }],

  // Wave 2 — brute + juggernaut
  [{ type: 'brute',      count:  5, interval: 2.0 },
   { type: 'juggernaut', count:  3, interval: 2.5 }],

  // Wave 3 — wraith + flyer + swarmling
  [{ type: 'wraith',    count:  8, interval: 1.7 },
   { type: 'flyer',     count:  8, interval: 0.60 },
   { type: 'swarmling', count: 24, interval: 0.22 }],

  // Wave 4 — regenerator + cleric + armoured
  [{ type: 'regenerator', count:  6, interval: 1.2 },
   { type: 'cleric',      count:  4, interval: 1.4 },
   { type: 'armoured',    count: 12, interval: 0.85 }],

  // Wave 5 — MID-BOSS + juggernaut + brute
  [{ type: 'boss',       count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  4, interval: 2.2 },
   { type: 'brute',      count:  4, interval: 2.0 }],

  // Wave 6 — phantom + magma + insulated
  [{ type: 'phantom',   count:  6, interval: 0.95 },
   { type: 'magma',     count:  6, interval: 1.0 },
   { type: 'insulated', count:  6, interval: 0.90 }],

  // Wave 7 — carrier + splitter + swarmling
  [{ type: 'carrier',   count:  4, interval: 2.5 },
   { type: 'splitter',  count: 10, interval: 0.85 },
   { type: 'swarmling', count: 30, interval: 0.20 }],

  // Wave 8 — juggernaut + brute + stutter + cleric
  [{ type: 'juggernaut', count:  5, interval: 2.2 },
   { type: 'brute',      count:  5, interval: 2.0 },
   { type: 'stutter',    count:  8, interval: 0.65 },
   { type: 'cleric',     count:  4, interval: 1.3 }],

  // Wave 9 — wraith + regenerator + phantom + aquatic
  [{ type: 'wraith',      count: 10, interval: 1.6 },
   { type: 'regenerator', count:  6, interval: 1.2 },
   { type: 'phantom',     count:  6, interval: 0.92 },
   { type: 'aquatic',     count:  6, interval: 0.88 }],

  // Wave 10 — MEGABOSS finale + juggernaut + wraith + brute
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  5, interval: 2.1 },
   { type: 'wraith',     count:  8, interval: 1.6 },
   { type: 'brute',      count:  5, interval: 2.0 }],
];
