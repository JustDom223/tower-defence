/**
 * Map 8 — Hairpins  (Forest)
 * Curriculum: introduces CARRIER — live-spawns swarmlings while alive, so it must
 * be prioritised before its stream overwhelms you. Completes the Forest roster.
 * Mid-boss on wave 5. hpMult 2.04.
 */
export const WAVES = [
  // Wave 1 — known basics
  [{ type: 'runner',   count: 18, interval: 0.45 },
   { type: 'sprinter', count: 12, interval: 0.35 }],

  // Wave 2 — regenerators + flyers
  [{ type: 'regenerator', count: 4, interval: 1.8 },
   { type: 'flyer',       count: 6, interval: 0.9 }],

  // Wave 3 — DEBUT: a single carrier (watch the swarmling stream it spews)
  [{ type: 'carrier',  count: 1,  interval: 1.0 }],

  // Wave 4 — two carriers with runner escort
  [{ type: 'carrier',  count: 2,  interval: 4.0 },
   { type: 'runner',   count: 10, interval: 0.55 }],

  // Wave 5 — MID-BOSS + armoured escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'armoured', count: 5,  interval: 1.2 }],

  // Wave 6 — carriers + swarm
  [{ type: 'carrier',   count: 2,  interval: 3.5 },
   { type: 'swarmling', count: 24, interval: 0.15 }],

  // Wave 7 — regenerators + tanks
  [{ type: 'regenerator', count: 5, interval: 1.6 },
   { type: 'tank',        count: 5, interval: 1.8 }],

  // Wave 8 — carriers + flyers
  [{ type: 'carrier',  count: 3,  interval: 3.0 },
   { type: 'flyer',    count: 7,  interval: 0.8 }],

  // Wave 9 — carriers + armoured + sprinters
  [{ type: 'carrier',  count: 2,  interval: 3.5 },
   { type: 'armoured', count: 6,  interval: 1.1 },
   { type: 'sprinter', count: 14, interval: 0.32 }],

  // Wave 10 — BOSS + carrier + regenerator escort
  [{ type: 'boss',        count: 1, interval: 1.0 },
   { type: 'carrier',     count: 2, interval: 3.5 },
   { type: 'regenerator', count: 3, interval: 2.0 }],
];
