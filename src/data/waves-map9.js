/**
 * Wave definitions for Map 9 — Labyrinth
 * Very winding — enormous path length rewards cheap towers at choke points.
 * NEW: Phantom (camo — only the Command Post's Spotter upgrade reveals it; always
 * mixed with visible enemies and kept sparse so a player without detection leaks
 * a little rather than hitting a wall). Carrier swarm engines return. hpMult 2.26.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 24, interval: 0.55 },
   { type: 'sprinter', count: 16, interval: 0.30 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 16, interval: 1.0 },
   { type: 'tank',     count:  7, interval: 1.7 }],

  // Wave 3 — carrier swarm engines + sprinters
  [{ type: 'carrier',  count:  3, interval: 2.6 },
   { type: 'sprinter', count: 18, interval: 0.30 }],

  // Wave 4 — Phantom debut (camo — reveal with Command Post) mixed with runners
  [{ type: 'phantom',  count:  3, interval: 1.2 },
   { type: 'runner',   count: 14, interval: 0.5 }],

  // Wave 5 — armoured + splitters + juggernaut
  [{ type: 'armoured',   count: 18, interval: 0.95 },
   { type: 'splitter',   count: 12, interval: 0.9 },
   { type: 'juggernaut', count:  2, interval: 3.0 }],

  // Wave 6 — sprinter flood + carriers
  [{ type: 'sprinter', count: 40, interval: 0.27 },
   { type: 'carrier',  count:  2, interval: 3.0 }],

  // Wave 7 — tanks + armoured + brute
  [{ type: 'tank',     count: 12, interval: 1.6 },
   { type: 'armoured', count: 14, interval: 0.95 },
   { type: 'brute',    count:  3, interval: 2.4 }],

  // Wave 8 — phantom + splitters + armoured
  [{ type: 'phantom',  count:  4, interval: 1.1 },
   { type: 'splitter', count: 22, interval: 0.9 },
   { type: 'armoured', count: 12, interval: 0.95 }],

  // Wave 9 — sprinter surge + tanks + juggernaut
  [{ type: 'sprinter',   count: 44, interval: 0.26 },
   { type: 'tank',       count: 12, interval: 1.6 },
   { type: 'juggernaut', count:  2, interval: 3.0 }],

  // Wave 10 — BOSS + phantom + armoured + tanks
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'phantom',  count:  3, interval: 1.2 },
   { type: 'armoured', count: 16, interval: 0.95 },
   { type: 'tank',     count:  8, interval: 1.7 }],
];
