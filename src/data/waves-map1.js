/**
 * Wave definitions for Map 1 — Serpentine
 * The campaign on-ramp. A median player has DART ONLY here, so this map must be
 * gentle: only the four basic enemy types, armoured held back to a small wave-8
 * group, and a light boss escort. (Balance pass 1 — softened opening.)
 */
export const WAVES = [
  // Wave 1 — pure runners, slow trickle
  [{ type: 'runner',   count: 8,  interval: 0.9 }],

  // Wave 2 — runners with a few sprinters
  [{ type: 'runner',   count: 8,  interval: 0.7 },
   { type: 'sprinter', count: 4,  interval: 0.6 }],

  // Wave 3 — first tank, well spaced
  [{ type: 'tank',     count: 2,  interval: 3.0 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 4 — light splitters
  [{ type: 'splitter', count: 4,  interval: 1.4 }],

  // Wave 5 — sprinter group + a tank
  [{ type: 'sprinter', count: 10, interval: 0.45 },
   { type: 'tank',     count: 2,  interval: 2.5 }],

  // Wave 6 — runner flood + a few splitters
  [{ type: 'runner',   count: 12, interval: 0.5 },
   { type: 'splitter', count: 3,  interval: 1.4 }],

  // Wave 7 — tanks + runners
  [{ type: 'tank',     count: 3,  interval: 2.2 },
   { type: 'runner',   count: 10, interval: 0.6 }],

  // Wave 8 — first armoured (small group), paired with runners
  [{ type: 'armoured', count: 3,  interval: 1.4 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 9 — moderate mix
  [{ type: 'splitter', count: 4,  interval: 1.2 },
   { type: 'sprinter', count: 8,  interval: 0.4 },
   { type: 'tank',     count: 2,  interval: 2.2 }],

  // Wave 10 — BOSS WAVE, light runner escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'runner',   count: 8,  interval: 0.7 }],
];
