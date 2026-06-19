/**
 * Wave definitions for Map 3 — Switchbacks
 * Three long horizontal lanes; good firing lines.
 * NEW: Swarmling (wave 3) and Carrier (wave 7) — an AoE/crowd-control lesson.
 * All beatable with dart; bomb/flamethrower make them easier. hpMult 1.22.
 */
export const WAVES = [
  // Wave 1 — runners only
  [{ type: 'runner',   count: 12, interval: 0.6 }],

  // Wave 2 — runners with a sprinter tail
  [{ type: 'runner',   count: 10, interval: 0.6 },
   { type: 'sprinter', count:  5, interval: 0.40 }],

  // Wave 3 — Swarmling debut (tiny, fast, weak — AoE shines) + runners
  [{ type: 'swarmling', count: 16, interval: 0.28 },
   { type: 'runner',    count:  6, interval: 0.6 }],

  // Wave 4 — Armoured debut (half damage from Dart & Marksman)
  [{ type: 'armoured', count:  4, interval: 1.2 }],

  // Wave 5 — Wraith debut (immune to physical; needs poison archer) + tanks
  [{ type: 'wraith',   count:  2, interval: 3.0 },
   { type: 'tank',     count:  3, interval: 1.8 },
   { type: 'runner',   count: 12, interval: 0.55 }],

  // Wave 6 — splitter swarm
  [{ type: 'splitter', count:  6, interval: 1.1 }],

  // Wave 7 — Carrier debut (spawns swarmlings while alive) + armoured
  [{ type: 'carrier',  count:  2, interval: 3.0 },
   { type: 'armoured', count:  4, interval: 1.0 }],

  // Wave 8 — tanks + armoured
  [{ type: 'tank',     count:  4, interval: 1.8 },
   { type: 'armoured', count:  4, interval: 1.1 }],

  // Wave 9 — swarmling flood + sprinters
  [{ type: 'swarmling', count: 24, interval: 0.22 },
   { type: 'sprinter',  count: 10, interval: 0.35 }],

  // Wave 10 — BOSS + carrier escort
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'carrier',  count:  1, interval: 1.0 },
   { type: 'runner',   count:  8, interval: 0.6 }],
];
