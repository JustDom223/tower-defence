/**
 * Wave definitions for Map 16 — Vortex
 * Tight spiral; enemies bunch up. Heavy regenerator and carrier pressure.
 * hpMult 3.35.
 */
export const WAVES = [
  // Wave 1 — heavy tank + armoured opener
  [{ type: 'tank',     count:  7, interval: 1.6 },
   { type: 'armoured', count: 12, interval: 0.95 }],

  // Wave 2 — regenerator swarm (sustained DoT required)
  [{ type: 'regenerator', count:  7, interval: 1.3 },
   { type: 'sprinter',    count: 20, interval: 0.28 }],

  // Wave 3 — wraith + carrier (poison + swarmling spawn)
  [{ type: 'wraith',  count:  5, interval: 2.3 },
   { type: 'carrier', count:  3, interval: 2.5 }],

  // Wave 4 — juggernaut + brute + cleric
  [{ type: 'juggernaut', count:  3, interval: 2.5 },
   { type: 'brute',      count:  3, interval: 2.2 },
   { type: 'cleric',     count:  3, interval: 1.6 }],

  // Wave 5 — MID-BOSS + regenerator escort
  [{ type: 'boss',        count:  1, interval: 1.0 },
   { type: 'regenerator', count:  5, interval: 1.3 },
   { type: 'armoured',    count: 10, interval: 0.95 }],

  // Wave 6 — wraith + shielded + stutter
  [{ type: 'wraith',   count:  6, interval: 2.2 },
   { type: 'shielded', count: 10, interval: 0.90 },
   { type: 'stutter',  count:  6, interval: 0.75 }],

  // Wave 7 — phantom + flyer + insulated (multi-immunity wave)
  [{ type: 'phantom',   count:  5, interval: 1.1 },
   { type: 'flyer',     count:  8, interval: 0.60 },
   { type: 'insulated', count:  7, interval: 0.95 }],

  // Wave 8 — juggernaut + carrier + armoured
  [{ type: 'juggernaut', count:  4, interval: 2.4 },
   { type: 'carrier',    count:  3, interval: 2.5 },
   { type: 'armoured',   count: 14, interval: 0.90 }],

  // Wave 9 — wraith surge + brute + cleric
  [{ type: 'wraith', count:  7, interval: 2.0 },
   { type: 'brute',  count:  4, interval: 2.2 },
   { type: 'cleric', count:  3, interval: 1.5 }],

  // Wave 10 — MEGABOSS + juggernaut + wraith
  [{ type: 'megaboss',   count:  1, interval: 1.0 },
   { type: 'juggernaut', count:  3, interval: 2.5 },
   { type: 'wraith',     count:  5, interval: 2.3 }],
];
