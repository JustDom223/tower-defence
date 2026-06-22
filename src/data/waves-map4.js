/**
 * Map 4 — The Cross  (Forest)
 * Curriculum: introduces SPLITTER — spawn-on-death. Each one bursts into two
 * runners when killed, teaching the player to budget for the adds. Builds on
 * runner/sprinter/tank/armoured. hpMult 1.35.
 */
export const WAVES = [
  // Wave 1 — known basics
  [{ type: 'runner',   count: 14, interval: 0.55 },
   { type: 'sprinter', count: 8,  interval: 0.45 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 4,  interval: 1.4 },
   { type: 'tank',     count: 2,  interval: 2.4 }],

  // Wave 3 — DEBUT: splitters, alone (watch them split on death)
  [{ type: 'splitter', count: 4,  interval: 1.5 }],

  // Wave 4 — splitters with runner escort
  [{ type: 'splitter', count: 6,  interval: 1.2 },
   { type: 'runner',   count: 8,  interval: 0.6 }],

  // Wave 5 — tanks + armoured
  [{ type: 'tank',     count: 4,  interval: 2.0 },
   { type: 'armoured', count: 4,  interval: 1.4 }],

  // Wave 6 — splitter swarm + sprinters
  [{ type: 'splitter', count: 7,  interval: 1.0 },
   { type: 'sprinter', count: 10, interval: 0.4 }],

  // Wave 7 — armoured wall + runners
  [{ type: 'armoured', count: 6,  interval: 1.2 },
   { type: 'runner',   count: 12, interval: 0.5 }],

  // Wave 8 — splitters + tanks
  [{ type: 'splitter', count: 7,  interval: 1.0 },
   { type: 'tank',     count: 3,  interval: 2.0 }],

  // Wave 9 — splitters + armoured + sprinters
  [{ type: 'splitter', count: 8,  interval: 0.9 },
   { type: 'armoured', count: 5,  interval: 1.2 },
   { type: 'sprinter', count: 12, interval: 0.35 }],

  // Wave 10 — BOSS + splitter + armoured escort
  [{ type: 'boss',     count: 1,  interval: 1.0 },
   { type: 'splitter', count: 4,  interval: 1.3 },
   { type: 'armoured', count: 4,  interval: 1.4 }],
];
