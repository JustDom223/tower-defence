// Each wave is an array of groups spawned sequentially.
// Group: { type, count, interval } — one enemy of `type` every `interval` seconds.
export const WAVES = [
  [{ type: 'runner',   count: 10, interval: 0.8 }],
  [{ type: 'runner',   count: 8,  interval: 0.6 },
   { type: 'sprinter', count: 4,  interval: 0.5 }],
  [{ type: 'tank',     count: 3,  interval: 2.0 },
   { type: 'runner',   count: 10, interval: 0.5 }],
  [{ type: 'splitter', count: 5,  interval: 1.2 }],
  [{ type: 'sprinter', count: 10, interval: 0.3 },
   { type: 'tank',     count: 5,  interval: 1.5 }],
];
