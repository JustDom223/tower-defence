/**
 * Map 3 — Switchbacks  (Forest)
 * Curriculum: introduces ARMOURED — the first damage-type lesson. Armoured take
 * half from Archer/Marksman and extra from Bombs, teaching "match the tool to the
 * target." Still all-physical Forest basics (runner/sprinter/tank/armoured).
 * hpMult 1.22.
 */
export const WAVES = [
  // Wave 1 — known basics, gentle opener
  [{ type: 'runner',   count: 8,  interval: 0.7 },
   { type: 'sprinter', count: 4,  interval: 0.6 }],

  // Wave 2 — tanks return among runners
  [{ type: 'tank',     count: 3,  interval: 2.4 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 3 — DEBUT: armoured, alone (notice arrows do half)
  [{ type: 'armoured', count: 4,  interval: 1.8 }],

  // Wave 4 — armoured with runner escort
  [{ type: 'armoured', count: 4,  interval: 1.5 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 5 — sprinter swarm + tanks
  [{ type: 'sprinter', count: 16, interval: 0.35 },
   { type: 'tank',     count: 3,  interval: 2.2 }],

  // Wave 6 — armoured line + sprinters
  [{ type: 'armoured', count: 5,  interval: 1.3 },
   { type: 'sprinter', count: 8,  interval: 0.4 }],

  // Wave 7 — tanks + runners
  [{ type: 'tank',     count: 4,  interval: 2.0 },
   { type: 'runner',   count: 12, interval: 0.5 }],

  // Wave 8 — armoured + tanks (heavy)
  [{ type: 'armoured', count: 5,  interval: 1.3 },
   { type: 'tank',     count: 3,  interval: 2.0 }],

  // Wave 9 — armoured wall + mixed flood
  [{ type: 'armoured', count: 6,  interval: 1.1 },
   { type: 'sprinter', count: 12, interval: 0.35 },
   { type: 'runner',   count: 10, interval: 0.5 }],

  // Wave 10 — BOSS + armoured escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'armoured', count: 3,  interval: 1.5 },
   { type: 'runner',   count: 8,  interval: 0.6 }],
];
