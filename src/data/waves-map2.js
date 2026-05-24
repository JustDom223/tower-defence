/**
 * Wave definitions for Map 2 — Zigzag
 * Shorter path with fewer bends — enemies spend less time in tower range.
 * Leans harder on speed/swarms since choke points are fewer.
 * Wave 10 boss is flanked by a sprinter swarm instead of armoured escorts.
 */
export const WAVES = [
  // Wave 1 — more runners, tighter intervals than Serpentine
  [{ type: 'runner',   count: 12, interval: 0.65 }],

  // Wave 2 — sprinters arrive immediately (shorter path = faster threat)
  [{ type: 'runner',   count: 8,  interval: 0.55 },
   { type: 'sprinter', count: 6,  interval: 0.4 }],

  // Wave 3 — tanks plus a runner flood; shorter path means less reaction time
  [{ type: 'tank',     count: 4,  interval: 2.2 },
   { type: 'runner',   count: 10, interval: 0.5 }],

  // Wave 4 — splitters + sprinters: two different threat vectors
  [{ type: 'splitter', count: 5,  interval: 0.9 },
   { type: 'sprinter', count: 8,  interval: 0.4 }],

  // Wave 5 — heavy speed round; 16 sprinters in rapid succession
  [{ type: 'sprinter', count: 16, interval: 0.3 },
   { type: 'tank',     count: 4,  interval: 1.8 }],

  // Wave 6 — armoured debuts earlier on Zigzag (fewer choke points = harder)
  [{ type: 'armoured', count: 7,  interval: 0.85 },
   { type: 'sprinter', count: 6,  interval: 0.4 }],

  // Wave 7 — armoured + splitters; splitter children compound the chaos
  [{ type: 'armoured', count: 5,  interval: 1.0 },
   { type: 'splitter', count: 5,  interval: 1.0 },
   { type: 'runner',   count: 6,  interval: 0.5 }],

  // Wave 8 — swarm wave: 20 sprinters overwhelm single-target towers
  [{ type: 'sprinter', count: 20, interval: 0.25 },
   { type: 'armoured', count: 6,  interval: 0.9 }],

  // Wave 9 — everything at max density
  [{ type: 'armoured', count: 8,  interval: 0.7 },
   { type: 'tank',     count: 5,  interval: 1.5 },
   { type: 'sprinter', count: 12, interval: 0.3 }],

  // Wave 10 — BOSS WAVE: massive boss + sprinter swarm to distract towers
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'sprinter', count: 12, interval: 0.3 }],
];
