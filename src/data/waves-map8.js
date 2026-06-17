/**
 * Wave definitions for Map 8 — Hairpins
 * Four long horizontal lanes with tight U-turns. Mid-boss on wave 5.
 * NEW: Shielded (wave 3 — burst through the shield layer) and Juggernaut (wave 5
 * — resists every type, only raw burst cuts through). Stiffened density.
 * hpMult 2.04.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 24, interval: 0.55 },
   { type: 'sprinter', count: 14, interval: 0.32 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 14, interval: 1.0 },
   { type: 'tank',     count:  5, interval: 1.7 }],

  // Wave 3 — Shielded debut (shield soaks first; DoT skips it — burst it) + sprinters
  [{ type: 'shielded', count:  8, interval: 1.0 },
   { type: 'sprinter', count: 16, interval: 0.32 }],

  // Wave 4 — tanks + armoured
  [{ type: 'tank',     count:  9, interval: 1.7 },
   { type: 'armoured', count: 12, interval: 1.0 }],

  // Wave 5 — MID-BOSS + Juggernaut escort (resists everything — burst kings)
  [{ type: 'boss',       count: 1, interval: 1.0 },
   { type: 'juggernaut', count: 2, interval: 3.0 }],

  // Wave 6 — armoured + sprinters (dense)
  [{ type: 'armoured', count: 18, interval: 0.95 },
   { type: 'sprinter', count: 18, interval: 0.31 }],

  // Wave 7 — juggernaut + shielded
  [{ type: 'juggernaut', count: 3, interval: 2.6 },
   { type: 'shielded',   count: 8, interval: 1.0 }],

  // Wave 8 — sprinter swarm + armoured
  [{ type: 'sprinter', count: 38, interval: 0.28 },
   { type: 'armoured', count: 14, interval: 0.95 }],

  // Wave 9 — splitters + tanks + brute
  [{ type: 'splitter', count: 20, interval: 0.9 },
   { type: 'tank',     count:  9, interval: 1.7 },
   { type: 'brute',    count:  2, interval: 2.6 }],

  // Wave 10 — BOSS + juggernaut + armoured
  [{ type: 'boss',       count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  2, interval: 3.0 },
   { type: 'armoured',   count: 12, interval: 1.0 }],
];
