/**
 * Wave definitions for Map 18 — Omega
 * Complex looping path; every enemy type appears, peak difficulty ramps hard.
 * hpMult 5.00.
 */
export const WAVES = [
  // Wave 1 — juggernaut + armoured + sprinter
  [{ type: 'juggernaut', count:  5, interval: 2.4 },
   { type: 'armoured',   count: 22, interval: 0.88 },
   { type: 'sprinter',   count: 30, interval: 0.27 }],

  // Wave 2 — brute + cleric + swarmling
  [{ type: 'brute',    count:  6, interval: 2.1 },
   { type: 'cleric',   count:  5, interval: 1.5 },
   { type: 'swarmling', count: 40, interval: 0.20 }],

  // Wave 3 — wraith + regenerator + phantom
  [{ type: 'wraith',      count: 10, interval: 2.0 },
   { type: 'regenerator', count:  8, interval: 1.2 },
   { type: 'phantom',     count:  6, interval: 1.0 }],

  // Wave 4 — tank + shielded + carrier
  [{ type: 'tank',     count: 14, interval: 1.5 },
   { type: 'shielded', count: 16, interval: 0.88 },
   { type: 'carrier',  count:  5, interval: 2.4 }],

  // Wave 5 — MID-BOSS + flyer + insulated + magma
  [{ type: 'boss',      count:  1, interval: 1.0 },
   { type: 'flyer',     count: 14, interval: 0.58 },
   { type: 'insulated', count: 10, interval: 0.90 },
   { type: 'magma',     count:  8, interval: 1.0 }],

  // Wave 6 — wraith + stutter + juggernaut
  [{ type: 'wraith',     count: 12, interval: 1.9 },
   { type: 'stutter',    count: 12, interval: 0.68 },
   { type: 'juggernaut', count:  5, interval: 2.4 }],

  // Wave 7 — brute + aquatic + cleric + armoured
  [{ type: 'brute',    count:  6, interval: 2.1 },
   { type: 'aquatic',  count: 10, interval: 0.90 },
   { type: 'cleric',   count:  5, interval: 1.5 },
   { type: 'armoured', count: 24, interval: 0.85 }],

  // Wave 8 — carrier + phantom + wraith + splitter
  [{ type: 'carrier',  count:  5, interval: 2.4 },
   { type: 'phantom',  count:  8, interval: 1.0 },
   { type: 'wraith',   count: 12, interval: 1.9 },
   { type: 'splitter', count: 20, interval: 0.85 }],

  // Wave 9 — everything at once
  [{ type: 'juggernaut',  count:  6, interval: 2.3 },
   { type: 'brute',       count:  5, interval: 2.1 },
   { type: 'wraith',      count: 12, interval: 1.9 },
   { type: 'regenerator', count:  8, interval: 1.2 },
   { type: 'cleric',      count:  5, interval: 1.5 }],

  // Wave 10 — MEGABOSS + full escort
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  6, interval: 2.3 },
   { type: 'wraith',     count: 10, interval: 2.0 },
   { type: 'brute',      count:  5, interval: 2.1 }],
];
