/**
 * Wave definitions for Map 11 — The Hook
 * First hard-tier map. Wraith appears early; demands a poison archer.
 * hpMult 2.75.
 */
export const WAVES = [
  // Wave 1 — heavy runner + sprinter opener
  [{ type: 'runner',   count: 20, interval: 0.5 },
   { type: 'sprinter', count: 12, interval: 0.35 }],

  // Wave 2 — armoured wall
  [{ type: 'armoured', count: 14, interval: 1.0 }],

  // Wave 3 — Wraith debut + runners (poison or lose)
  [{ type: 'wraith',   count:  3, interval: 3.0 },
   { type: 'runner',   count: 16, interval: 0.55 }],

  // Wave 4 — tanks + splitters
  [{ type: 'tank',     count:  6, interval: 1.7 },
   { type: 'splitter', count:  8, interval: 1.0 }],

  // Wave 5 — swarmling flood + armoured
  [{ type: 'swarmling', count: 28, interval: 0.22 },
   { type: 'armoured',  count: 10, interval: 1.0 }],

  // Wave 6 — wraith + phantom (camo + immune)
  [{ type: 'wraith',  count:  4, interval: 2.5 },
   { type: 'phantom', count:  4, interval: 1.1 }],

  // Wave 7 — brute + sprinter surge
  [{ type: 'brute',    count:  3, interval: 2.4 },
   { type: 'sprinter', count: 28, interval: 0.30 }],

  // Wave 8 — tanks + armoured + cleric (heal protection)
  [{ type: 'tank',     count:  8, interval: 1.6 },
   { type: 'armoured', count: 12, interval: 0.95 },
   { type: 'cleric',   count:  2, interval: 2.0 }],

  // Wave 9 — juggernaut + wraith + swarmling
  [{ type: 'juggernaut', count:  2, interval: 3.0 },
   { type: 'wraith',     count:  4, interval: 2.5 },
   { type: 'swarmling',  count: 20, interval: 0.25 }],

  // Wave 10 — BOSS + brute escort + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'brute',    count:  3, interval: 2.4 },
   { type: 'armoured', count: 16, interval: 0.95 }],
];
