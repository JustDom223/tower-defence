/**
 * Wave definitions for Map 1 — Serpentine
 * Long, winding path with many choke points. 10-wave arc with a boss finale.
 * Favours AoE/Bomb towers at bends; armoured enemies create a reason to diversify.
 */
export const WAVES = [
  // Wave 1 — learn the game: pure runners
  [{ type: 'runner',   count: 10, interval: 0.8 }],

  // Wave 2 — faster threat arrives: runners then sprinters
  [{ type: 'runner',   count: 8,  interval: 0.7 },
   { type: 'sprinter', count: 5,  interval: 0.5 }],

  // Wave 3 — tanky enemies absorb a lot of shots
  [{ type: 'tank',     count: 3,  interval: 2.5 },
   { type: 'runner',   count: 12, interval: 0.5 }],

  // Wave 4 — splitters: killing one spawns 2 runners
  [{ type: 'splitter', count: 6,  interval: 1.0 }],

  // Wave 5 — sustained pressure: sprinter swarm + tanks
  [{ type: 'sprinter', count: 12, interval: 0.35 },
   { type: 'tank',     count: 4,  interval: 1.8 }],

  // Wave 6 — armoured arrives (half damage from Dart & Marksman)
  [{ type: 'armoured', count: 6,  interval: 1.0 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 7 — armoured backbone + speed threat
  [{ type: 'armoured', count: 8,  interval: 0.8 },
   { type: 'sprinter', count: 8,  interval: 0.4 }],

  // Wave 8 — multi-type gauntlet: splitters blossom into runners mid-wave
  [{ type: 'splitter', count: 5,  interval: 1.2 },
   { type: 'armoured', count: 6,  interval: 0.9 },
   { type: 'tank',     count: 3,  interval: 2.0 }],

  // Wave 9 — full-mix pressure: everything at once
  [{ type: 'armoured', count: 10, interval: 0.7 },
   { type: 'sprinter', count: 10, interval: 0.3 },
   { type: 'tank',     count: 5,  interval: 1.5 }],

  // Wave 10 — BOSS WAVE: one massive boss followed by armoured escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'armoured', count: 8,  interval: 0.9 }],
];
