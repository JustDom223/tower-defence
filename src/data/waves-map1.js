/**
 * Map 1 — Serpentine  (Forest)
 * Curriculum: the absolute basics. Teaches only RUNNER (baseline) and SPRINTER
 * (speed). No armour, no splitting, no surprises — the familiarisation stomp.
 * Difficulty comes from volume, not variety. See DESIGN_world-curriculum.md.
 */
export const WAVES = [
  // Wave 1 — pure runners, gentle trickle
  [{ type: 'runner',   count: 8,  interval: 0.9 }],

  // Wave 2 — more runners, a touch faster
  [{ type: 'runner',   count: 10, interval: 0.7 }],

  // Wave 3 — DEBUT: sprinters, alone (learn the speed)
  [{ type: 'sprinter', count: 6,  interval: 0.7 }],

  // Wave 4 — runners + sprinters together
  [{ type: 'runner',   count: 8,  interval: 0.6 },
   { type: 'sprinter', count: 4,  interval: 0.6 }],

  // Wave 5 — sprinter pack
  [{ type: 'sprinter', count: 10, interval: 0.45 }],

  // Wave 6 — runner flood
  [{ type: 'runner',   count: 14, interval: 0.5 }],

  // Wave 7 — mixed pressure
  [{ type: 'runner',   count: 10, interval: 0.5 },
   { type: 'sprinter', count: 8,  interval: 0.45 }],

  // Wave 8 — fast swarm
  [{ type: 'sprinter', count: 14, interval: 0.4 }],

  // Wave 9 — heavy mixed lead-in to the boss
  [{ type: 'runner',   count: 16, interval: 0.45 },
   { type: 'sprinter', count: 8,  interval: 0.4 }],

  // Wave 10 — BOSS, light runner escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'runner',   count: 8,  interval: 0.7 }],
];
