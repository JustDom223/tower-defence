/**
 * Wave definitions for Map 2 — Zigzag
 * Shorter path with fewer bends — leans on speed/swarms. A median player has
 * dart + one of bomb/frost here, so still basic enemy types but a touch more
 * pressure than Serpentine. (Balance pass 1 — eased armoured density.)
 */
export const WAVES = [
  // Wave 1 — runners
  [{ type: 'runner',   count: 10, interval: 0.7 }],

  // Wave 2 — runners + sprinters
  [{ type: 'runner',   count: 8,  interval: 0.6 },
   { type: 'sprinter', count: 5,  interval: 0.45 }],

  // Wave 3 — tank + runner flood
  [{ type: 'tank',     count: 3,  interval: 2.4 },
   { type: 'runner',   count: 8,  interval: 0.55 }],

  // Wave 4 — splitters + sprinters
  [{ type: 'splitter', count: 4,  interval: 1.1 },
   { type: 'sprinter', count: 6,  interval: 0.45 }],

  // Wave 5 — sprinter rush + tank
  [{ type: 'sprinter', count: 14, interval: 0.33 },
   { type: 'tank',     count: 2,  interval: 2.0 }],

  // Wave 6 — armoured debut (moderate) + sprinters
  [{ type: 'armoured', count: 5,  interval: 1.0 },
   { type: 'sprinter', count: 6,  interval: 0.45 }],

  // Wave 7 — armoured + splitters + runners
  [{ type: 'armoured', count: 4,  interval: 1.1 },
   { type: 'splitter', count: 4,  interval: 1.1 },
   { type: 'runner',   count: 6,  interval: 0.55 }],

  // Wave 8 — sprinter swarm + armoured
  [{ type: 'sprinter', count: 18, interval: 0.28 },
   { type: 'armoured', count: 4,  interval: 1.0 }],

  // Wave 9 — mixed density
  [{ type: 'armoured', count: 6,  interval: 0.8 },
   { type: 'tank',     count: 4,  interval: 1.6 },
   { type: 'sprinter', count: 10, interval: 0.33 }],

  // Wave 10 — BOSS WAVE + sprinter swarm
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'sprinter', count: 12, interval: 0.33 }],
];
