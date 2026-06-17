/**
 * Wave definitions for Map 7 — Gauntlet
 * Five tight choke columns — very long path, ideal for burst damage.
 * NEW: Aquatic (wave 3 — resists fire/DoT, so physical damage) and Brute (wave 5
 * — heavy resist sponge, but dart still chips it). Density steps up here — the
 * full arsenal is expected from this point. hpMult 1.84.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 20, interval: 0.55 },
   { type: 'sprinter', count: 12, interval: 0.33 }],

  // Wave 2 — armoured wall
  [{ type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 3 — Aquatic debut (resists fire/burn — physical hits work) + tanks
  [{ type: 'aquatic',  count:  8, interval: 1.0 },
   { type: 'tank',     count:  5, interval: 1.7 }],

  // Wave 4 — sprinter rush + swarmlings
  [{ type: 'sprinter',  count: 28, interval: 0.30 },
   { type: 'swarmling', count: 16, interval: 0.22 }],

  // Wave 5 — Brute debut (tanky, resists most types) + armoured
  [{ type: 'brute',    count:  3, interval: 2.4 },
   { type: 'armoured', count:  8, interval: 1.0 }],

  // Wave 6 — splitters + sprinters
  [{ type: 'splitter', count: 16, interval: 0.9 },
   { type: 'sprinter', count: 14, interval: 0.32 }],

  // Wave 7 — tanks + armoured + aquatic
  [{ type: 'tank',     count:  8, interval: 1.6 },
   { type: 'armoured', count:  8, interval: 1.0 },
   { type: 'aquatic',  count:  6, interval: 1.0 }],

  // Wave 8 — armoured + splitters (dense)
  [{ type: 'armoured', count: 16, interval: 0.9 },
   { type: 'splitter', count: 12, interval: 0.9 }],

  // Wave 9 — sprinter flood + brutes
  [{ type: 'sprinter', count: 34, interval: 0.28 },
   { type: 'brute',    count:  3, interval: 2.4 }],

  // Wave 10 — BOSS + brute + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'brute',    count:  2, interval: 2.5 },
   { type: 'armoured', count:  8, interval: 1.0 }],
];
