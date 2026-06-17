/**
 * Wave definitions for Map 10 — The Crucible
 * The finale. Pulls together nearly every enemy mechanic and expects a full
 * arsenal. Mid-boss on wave 5; MEGABOSS finale (spawns armoured on death).
 * hpMult 2.50.
 */
export const WAVES = [
  // Wave 1
  [{ type: 'runner',   count: 28, interval: 0.55 },
   { type: 'sprinter', count: 18, interval: 0.30 }],

  // Wave 2 — armoured + tanks
  [{ type: 'armoured', count: 18, interval: 0.95 },
   { type: 'tank',     count:  8, interval: 1.7 }],

  // Wave 3 — juggernaut + sprinters + carrier
  [{ type: 'juggernaut', count:  3, interval: 2.6 },
   { type: 'sprinter',   count: 22, interval: 0.29 },
   { type: 'carrier',    count:  2, interval: 3.0 }],

  // Wave 4 — brute + armoured + aquatic
  [{ type: 'brute',    count:  4, interval: 2.2 },
   { type: 'armoured', count: 16, interval: 0.95 },
   { type: 'aquatic',  count:  8, interval: 0.95 }],

  // Wave 5 — MID-BOSS + phantom + armoured
  [{ type: 'boss',     count:  1, interval: 1.0 },
   { type: 'phantom',  count:  4, interval: 1.2 },
   { type: 'armoured', count: 14, interval: 0.95 }],

  // Wave 6 — sprinter flood + magma + insulated (element check)
  [{ type: 'sprinter',  count: 50, interval: 0.25 },
   { type: 'magma',     count:  6, interval: 1.0 },
   { type: 'insulated', count:  6, interval: 1.0 }],

  // Wave 7 — tanks + juggernaut + shielded
  [{ type: 'tank',       count: 14, interval: 1.6 },
   { type: 'juggernaut', count:  3, interval: 2.6 },
   { type: 'shielded',   count: 10, interval: 0.95 }],

  // Wave 8 — armoured + brute + cleric (heal-protected push)
  [{ type: 'armoured', count: 24, interval: 0.9 },
   { type: 'brute',    count:  3, interval: 2.4 },
   { type: 'cleric',   count:  3, interval: 1.8 }],

  // Wave 9 — sprinter surge + carriers + phantom
  [{ type: 'sprinter', count: 50, interval: 0.24 },
   { type: 'carrier',  count:  3, interval: 2.6 },
   { type: 'phantom',  count:  4, interval: 1.2 }],

  // Wave 10 — MEGABOSS finale (spawns armoured on death) + juggernaut + armoured
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  2, interval: 3.0 },
   { type: 'armoured',   count: 12, interval: 1.0 }],
];
