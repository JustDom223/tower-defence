/**
 * Wave definitions for Map 15 — The Maze
 * Long winding path; stutter and cleric combos make spacing critical.
 * hpMult 3.05.
 */
export const WAVES = [
  // Wave 1 — stutter + armoured (unpredictable timing)
  [{ type: 'stutter',  count:  6, interval: 0.8 },
   { type: 'armoured', count: 10, interval: 1.0 }],

  // Wave 2 — cleric protected armoured wall
  [{ type: 'cleric',   count:  3, interval: 1.6 },
   { type: 'armoured', count: 12, interval: 0.95 }],

  // Wave 3 — wraith + stutter (hard to lead-aim AND immune)
  [{ type: 'wraith',  count:  4, interval: 2.4 },
   { type: 'stutter', count:  6, interval: 0.8 }],

  // Wave 4 — juggernaut + cleric (heal the unkillable)
  [{ type: 'juggernaut', count:  3, interval: 2.5 },
   { type: 'cleric',     count:  3, interval: 1.6 }],

  // Wave 5 — brute + stutter + swarmling
  [{ type: 'brute',     count:  3, interval: 2.2 },
   { type: 'stutter',   count:  7, interval: 0.75 },
   { type: 'swarmling', count: 22, interval: 0.20 }],

  // Wave 6 — wraith + cleric + phantom
  [{ type: 'wraith',  count:  5, interval: 2.3 },
   { type: 'cleric',  count:  3, interval: 1.6 },
   { type: 'phantom', count:  4, interval: 1.1 }],

  // Wave 7 — carrier + shielded + stutter
  [{ type: 'carrier',  count:  3, interval: 2.5 },
   { type: 'shielded', count:  8, interval: 0.95 },
   { type: 'stutter',  count:  6, interval: 0.75 }],

  // Wave 8 — juggernaut + brute + cleric
  [{ type: 'juggernaut', count:  3, interval: 2.5 },
   { type: 'brute',      count:  3, interval: 2.2 },
   { type: 'cleric',     count:  3, interval: 1.6 }],

  // Wave 9 — wraith + armoured + stutter surge
  [{ type: 'wraith',   count:  6, interval: 2.2 },
   { type: 'armoured', count: 14, interval: 0.90 },
   { type: 'stutter',  count:  7, interval: 0.70 }],

  // Wave 10 — BOSS + juggernaut + cleric wall
  [{ type: 'boss',       count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  3, interval: 2.5 },
   { type: 'cleric',     count:  3, interval: 1.5 },
   { type: 'armoured',   count: 12, interval: 0.90 }],
];
