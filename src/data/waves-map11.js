/**
 * Wave definitions for Map 11 — The Hook
 * First hard-tier map. Gentle opener on two paths; wraith arrives wave 5.
 * hpMult 2.75.
 */
export const WAVES = [
  // Wave 1 — basic runners, let the player settle onto two paths
  [{ type: 'runner', count: 10, interval: 0.7 }],

  // Wave 2 — runners + a few sprinters
  [{ type: 'runner',   count: 12, interval: 0.65 },
   { type: 'sprinter', count:  6, interval: 0.45 }],

  // Wave 3 — armoured wall introduction
  [{ type: 'armoured', count: 10, interval: 1.1 }],

  // Wave 4 — tanks + splitters
  [{ type: 'tank',     count:  5, interval: 1.8 },
   { type: 'splitter', count:  6, interval: 1.1 }],

  // Wave 5 — shielded + runners (wraith deferred to map 12)
  [{ type: 'shielded', count:  6, interval: 1.1 },
   { type: 'runner',   count: 14, interval: 0.6 }],

  // Wave 6 — swarmling flood + armoured
  [{ type: 'swarmling', count: 22, interval: 0.25 },
   { type: 'armoured',  count:  8, interval: 1.05 }],

  // Wave 7 — phantom + armoured (camo pressure without wraith)
  [{ type: 'phantom', count:  4, interval: 1.2 },
   { type: 'armoured', count: 8, interval: 1.0 }],

  // Wave 8 — brute + sprinter surge
  [{ type: 'brute',    count:  2, interval: 2.5 },
   { type: 'sprinter', count: 20, interval: 0.32 }],

  // Wave 9 — tanks + armoured + cleric
  [{ type: 'tank',     count:  6, interval: 1.7 },
   { type: 'armoured', count: 10, interval: 1.0 },
   { type: 'cleric',   count:  2, interval: 2.2 }],

  // Wave 10 — BOSS + brute escort + wraith
  [{ type: 'boss',   count:  1, interval: 1.0 },
   { type: 'brute',  count:  2, interval: 2.5 },
   { type: 'phantom', count:  3, interval: 2.5 }],
];
