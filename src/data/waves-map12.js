/**
 * Wave definitions for Map 12 — Double Loop
 * Long path rewards placement; heavy use of shielded and regenerator.
 * hpMult 2.25.
 */
export const WAVES = [
  // Wave 1 — armoured + sprinters
  [{ type: 'armoured', count: 10, interval: 1.0 },
   { type: 'sprinter', count: 10, interval: 0.35 }],

  // Wave 2 — shielded debut (shield absorbs first hit)
  [{ type: 'shielded', count:  8, interval: 1.0 },
   { type: 'runner',   count: 10, interval: 0.55 }],

  // Wave 3 — wraith + swarmlings
  [{ type: 'wraith',    count:  3, interval: 2.8 },
   { type: 'swarmling', count: 20, interval: 0.22 }],

  // Wave 4 — regenerator (needs sustained DoT) + tanks
  [{ type: 'regenerator', count:  5, interval: 1.4 },
   { type: 'tank',        count:  4, interval: 1.7 }],

  // Wave 5 — juggernaut + shielded + sprinters
  [{ type: 'juggernaut', count:  1, interval: 3.0 },
   { type: 'shielded',   count:  6, interval: 1.0 },
   { type: 'sprinter',   count: 14, interval: 0.30 }],

  // Wave 6 — wraith + regenerator (DoT pressure from both)
  [{ type: 'wraith',      count:  4, interval: 2.5 },
   { type: 'regenerator', count:  4, interval: 1.5 }],

  // Wave 7 — carrier + armoured + cleric
  [{ type: 'carrier',  count:  2, interval: 2.6 },
   { type: 'armoured', count: 12, interval: 0.95 },
   { type: 'cleric',   count:  2, interval: 1.8 }],

  // Wave 8 — brute + splitter swarm
  [{ type: 'brute',    count:  3, interval: 2.2 },
   { type: 'splitter', count: 12, interval: 0.9 }],

  // Wave 9 — juggernaut + wraith + phantom
  [{ type: 'juggernaut', count:  2, interval: 2.6 },
   { type: 'wraith',     count:  4, interval: 2.5 },
   { type: 'phantom',    count:  3, interval: 1.1 }],

  // Wave 10 — BOSS + regenerator + shielded wall
  [{ type: 'boss',        count:  1, interval: 1.0 },
   { type: 'regenerator', count:  4, interval: 1.4 },
   { type: 'shielded',    count:  8, interval: 0.95 }],
];
