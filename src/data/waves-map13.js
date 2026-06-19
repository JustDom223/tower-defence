/**
 * Wave definitions for Map 13 — The Spine
 * Dual-exit path; magma and insulated force element diversity.
 * hpMult 2.50.
 */
export const WAVES = [
  // Wave 1 — magma + runners (fire immunity lesson)
  [{ type: 'magma',  count:  4, interval: 1.2 },
   { type: 'runner', count: 12, interval: 0.55 }],

  // Wave 2 — insulated + sprinters (tesla immunity lesson)
  [{ type: 'insulated', count:  6, interval: 1.0 },
   { type: 'sprinter',  count: 14, interval: 0.30 }],

  // Wave 3 — wraith + armoured
  [{ type: 'wraith',   count:  4, interval: 2.5 },
   { type: 'armoured', count: 10, interval: 1.0 }],

  // Wave 4 — magma + insulated together (need versatile loadout)
  [{ type: 'magma',     count:  5, interval: 1.1 },
   { type: 'insulated', count:  5, interval: 1.0 }],

  // Wave 5 — juggernaut + tanks + swarmling
  [{ type: 'juggernaut', count:  2, interval: 2.6 },
   { type: 'tank',       count:  6, interval: 1.6 },
   { type: 'swarmling',  count: 18, interval: 0.24 }],

  // Wave 6 — wraith + magma (poison + physical split)
  [{ type: 'wraith', count:  5, interval: 2.4 },
   { type: 'magma',  count:  6, interval: 1.0 }],

  // Wave 7 — brute + shielded + cleric
  [{ type: 'brute',    count:  3, interval: 2.2 },
   { type: 'shielded', count:  8, interval: 0.95 },
   { type: 'cleric',   count:  2, interval: 1.6 }],

  // Wave 8 — sprinter surge + insulated wall
  [{ type: 'sprinter',  count: 28, interval: 0.28 },
   { type: 'insulated', count:  8, interval: 0.95 }],

  // Wave 9 — juggernaut + wraith + carrier
  [{ type: 'juggernaut', count:  2, interval: 2.6 },
   { type: 'wraith',     count:  5, interval: 2.4 },
   { type: 'carrier',    count:  2, interval: 2.6 }],

  // Wave 10 — BOSS + magma + insulated escort
  [{ type: 'boss',      count:  1, interval: 1.0 },
   { type: 'magma',     count:  6, interval: 1.0 },
   { type: 'insulated', count:  6, interval: 1.0 }],
];
