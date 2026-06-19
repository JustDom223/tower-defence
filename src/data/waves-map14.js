/**
 * Wave definitions for Map 14 — Crosswind
 * Sharp turns punish spread towers; aquatic and flyer demand air coverage.
 * hpMult 3.60.
 */
export const WAVES = [
  // Wave 1 — flyer debut (needs towers that hit air)
  [{ type: 'flyer',  count:  8, interval: 0.7 },
   { type: 'runner', count: 20, interval: 0.55 }],

  // Wave 2 — aquatic + armoured
  [{ type: 'aquatic',  count:  8, interval: 1.0 },
   { type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 3 — wraith + flyer (two different immunities)
  [{ type: 'wraith', count:  5, interval: 2.5 },
   { type: 'flyer',  count:  8, interval: 0.7 }],

  // Wave 4 — tank + aquatic + sprinters
  [{ type: 'tank',     count:  8, interval: 1.7 },
   { type: 'aquatic',  count:  8, interval: 0.95 },
   { type: 'sprinter', count: 22, interval: 0.30 }],

  // Wave 5 — juggernaut + flyer + swarmling
  [{ type: 'juggernaut', count:  3, interval: 2.6 },
   { type: 'flyer',      count: 10, interval: 0.65 },
   { type: 'swarmling',  count: 28, interval: 0.22 }],

  // Wave 6 — wraith + aquatic + armoured
  [{ type: 'wraith',   count:  6, interval: 2.4 },
   { type: 'aquatic',  count:  8, interval: 0.95 },
   { type: 'armoured', count: 14, interval: 0.95 }],

  // Wave 7 — brute + carrier + flyer
  [{ type: 'brute',   count:  4, interval: 2.2 },
   { type: 'carrier', count:  3, interval: 2.6 },
   { type: 'flyer',   count:  8, interval: 0.65 }],

  // Wave 8 — phantom + flyer (camo + air)
  [{ type: 'phantom', count:  6, interval: 1.1 },
   { type: 'flyer',   count: 12, interval: 0.60 },
   { type: 'tank',    count:  8, interval: 1.6 }],

  // Wave 9 — juggernaut + wraith + aquatic
  [{ type: 'juggernaut', count:  4, interval: 2.5 },
   { type: 'wraith',     count:  6, interval: 2.4 },
   { type: 'aquatic',    count: 10, interval: 0.90 }],

  // Wave 10 — BOSS + flyer swarm + brute
  [{ type: 'boss',  count:  1, interval: 1.0 },
   { type: 'flyer', count: 14, interval: 0.60 },
   { type: 'brute', count:  4, interval: 2.2 }],
];
