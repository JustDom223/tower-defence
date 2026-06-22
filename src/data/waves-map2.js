/**
 * Map 2 — Zigzag  (Forest)
 * Curriculum: introduces the TANK (bulk / sustained DPS). Player must learn that
 * some enemies need sustained fire, not a single volley. Runner + sprinter carry
 * over. No new mechanics beyond raw HP. hpMult 1.10.
 */
export const WAVES = [
  // Wave 1 — warm-up with the known basics
  [{ type: 'runner',   count: 10, interval: 0.6 },
   { type: 'sprinter', count: 4,  interval: 0.5 }],

  // Wave 2 — sprinter pack
  [{ type: 'sprinter', count: 12, interval: 0.4 }],

  // Wave 3 — DEBUT: a single tank, escorted (watch the HP bar)
  [{ type: 'tank',     count: 1,  interval: 1.0 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 4 — two tanks among sprinters
  [{ type: 'tank',     count: 2,  interval: 3.0 },
   { type: 'sprinter', count: 8,  interval: 0.45 }],

  // Wave 5 — runner flood
  [{ type: 'runner',   count: 16, interval: 0.45 }],

  // Wave 6 — tank line + runners
  [{ type: 'tank',     count: 3,  interval: 2.5 },
   { type: 'runner',   count: 10, interval: 0.5 }],

  // Wave 7 — fast swarm
  [{ type: 'sprinter', count: 16, interval: 0.35 }],

  // Wave 8 — tanks + sprinters
  [{ type: 'tank',     count: 3,  interval: 2.2 },
   { type: 'sprinter', count: 10, interval: 0.4 }],

  // Wave 9 — tank wall + runner flood
  [{ type: 'tank',     count: 4,  interval: 2.0 },
   { type: 'runner',   count: 14, interval: 0.45 }],

  // Wave 10 — BOSS with tank + runner escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'tank',     count: 2,  interval: 2.5 },
   { type: 'runner',   count: 8,  interval: 0.6 }],
];
