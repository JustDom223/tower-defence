/**
 * Wave definitions for Map 17 — The Descent
 * Four long horizontal lanes; high enemy counts, fast intervals.
 * hpMult 4.60.
 */
export const WAVES = [
  // Wave 1 — sprinter + armoured flood
  [{ type: 'sprinter', count: 40, interval: 0.27 },
   { type: 'armoured', count: 20, interval: 0.90 }],

  // Wave 2 — juggernaut + shielded + swarmling
  [{ type: 'juggernaut', count:  5, interval: 2.4 },
   { type: 'shielded',   count: 14, interval: 0.90 },
   { type: 'swarmling',  count: 36, interval: 0.20 }],

  // Wave 3 — wraith + regenerator + runners
  [{ type: 'wraith',      count:  8, interval: 2.2 },
   { type: 'regenerator', count:  8, interval: 1.3 },
   { type: 'runner',      count: 24, interval: 0.50 }],

  // Wave 4 — brute + carrier + stutter
  [{ type: 'brute',   count:  5, interval: 2.2 },
   { type: 'carrier', count:  4, interval: 2.5 },
   { type: 'stutter', count: 10, interval: 0.70 }],

  // Wave 5 — MID-BOSS + tank + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'tank',     count: 12, interval: 1.6 },
   { type: 'armoured', count: 20, interval: 0.90 }],

  // Wave 6 — wraith + phantom + flyer (three immunity types)
  [{ type: 'wraith',  count:  8, interval: 2.2 },
   { type: 'phantom', count:  6, interval: 1.1 },
   { type: 'flyer',   count: 12, interval: 0.60 }],

  // Wave 7 — magma + aquatic + insulated (all element resists)
  [{ type: 'magma',    count:  8, interval: 1.0 },
   { type: 'aquatic',  count:  8, interval: 0.95 },
   { type: 'insulated', count:  8, interval: 0.95 }],

  // Wave 8 — juggernaut + brute + cleric + shielded
  [{ type: 'juggernaut', count:  5, interval: 2.4 },
   { type: 'brute',      count:  5, interval: 2.2 },
   { type: 'cleric',     count:  5, interval: 1.5 },
   { type: 'shielded',   count: 14, interval: 0.90 }],

  // Wave 9 — wraith surge + carrier + splitter
  [{ type: 'wraith',   count: 12, interval: 1.9 },
   { type: 'carrier',  count:  5, interval: 2.4 },
   { type: 'splitter', count: 18, interval: 0.85 }],

  // Wave 10 — MEGABOSS + juggernaut + wraith + armoured
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  5, interval: 2.4 },
   { type: 'wraith',     count:  8, interval: 2.1 },
   { type: 'armoured',   count: 24, interval: 0.85 }],
];
