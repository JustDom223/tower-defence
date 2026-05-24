/**
 * Campaign map definitions.
 * order  — campaign position (1 = first, unlocked immediately; later maps gate on prev)
 * hpMult — per-map HP scaling stacked on top of the difficulty multiplier (C2)
 * waypoints — path control points in world space (~1280×650 field)
 */

export const CAMPAIGN_ORDER = [
  'map1','map2','map3','map4','map5',
  'map6','map7','map8','map9','map10',
];

export const MAPS = {
  // ── Existing maps ────────────────────────────────────────────────────────
  map1: {
    name: 'Serpentine',
    order: 1,
    hpMult: 1.00,
    waypoints: [
      { x:    0, y: 300 },
      { x:  250, y: 300 },
      { x:  250, y: 130 },
      { x:  650, y: 130 },
      { x:  650, y: 450 },
      { x:  380, y: 450 },
      { x:  380, y: 590 },
      { x:  900, y: 590 },
      { x:  900, y: 300 },
      { x: 1080, y: 300 },
      { x: 1080, y: 130 },
      { x: 1280, y: 130 },
    ],
  },

  map2: {
    name: 'Zigzag',
    order: 2,
    hpMult: 1.10,
    waypoints: [
      { x:    0, y: 590 },
      { x:  350, y: 590 },
      { x:  350, y: 130 },
      { x:  650, y: 130 },
      { x:  650, y: 590 },
      { x:  950, y: 590 },
      { x:  950, y: 300 },
      { x: 1280, y: 300 },
    ],
  },

  // ── New maps (C4) ─────────────────────────────────────────────────────────
  map3: {
    name: 'Switchbacks',
    order: 3,
    hpMult: 1.22,
    waypoints: [
      { x:    0, y: 180 },
      { x: 1080, y: 180 },
      { x: 1080, y: 360 },
      { x:  200, y: 360 },
      { x:  200, y: 540 },
      { x: 1280, y: 540 },
    ],
  },

  map4: {
    name: 'The Cross',
    order: 4,
    hpMult: 1.35,
    waypoints: [
      { x:  560, y:   0 },
      { x:  560, y: 260 },
      { x:  160, y: 260 },
      { x:  160, y: 460 },
      { x: 1120, y: 460 },
      { x: 1120, y: 180 },
      { x:  820, y: 180 },
      { x:  820, y: 650 },
    ],
  },

  map5: {
    name: 'Coil',
    order: 5,
    hpMult: 1.50,
    waypoints: [
      { x:    0, y: 120 },
      { x: 1160, y: 120 },
      { x: 1160, y: 580 },
      { x:  220, y: 580 },
      { x:  220, y: 300 },
      { x:  880, y: 300 },
      { x:  880, y: 420 },
      { x: 1280, y: 420 },
    ],
  },

  map6: {
    name: 'Detour',
    order: 6,
    hpMult: 1.66,
    waypoints: [
      { x:    0, y: 300 },
      { x:  300, y: 300 },
      { x:  300, y: 120 },
      { x:  760, y: 120 },
      { x:  760, y: 520 },
      { x: 1000, y: 520 },
      { x: 1000, y: 240 },
      { x: 1280, y: 240 },
    ],
  },

  map7: {
    name: 'Gauntlet',
    order: 7,
    hpMult: 1.84,
    waypoints: [
      { x:    0, y: 560 },
      { x:  180, y: 560 },
      { x:  180, y: 140 },
      { x:  420, y: 140 },
      { x:  420, y: 520 },
      { x:  660, y: 520 },
      { x:  660, y: 140 },
      { x:  900, y: 140 },
      { x:  900, y: 520 },
      { x: 1140, y: 520 },
      { x: 1140, y: 200 },
      { x: 1280, y: 200 },
    ],
  },

  map8: {
    name: 'Hairpins',
    order: 8,
    hpMult: 2.04,
    waypoints: [
      { x:    0, y: 140 },
      { x: 1000, y: 140 },
      { x: 1000, y: 300 },
      { x:  160, y: 300 },
      { x:  160, y: 460 },
      { x: 1000, y: 460 },
      { x: 1000, y: 600 },
      { x: 1280, y: 600 },
    ],
  },

  map9: {
    name: 'Labyrinth',
    order: 9,
    hpMult: 2.26,
    waypoints: [
      { x:    0, y: 120 },
      { x:  240, y: 120 },
      { x:  240, y: 420 },
      { x:  120, y: 420 },
      { x:  120, y: 600 },
      { x:  560, y: 600 },
      { x:  560, y: 260 },
      { x:  820, y: 260 },
      { x:  820, y: 540 },
      { x: 1080, y: 540 },
      { x: 1080, y: 160 },
      { x: 1280, y: 160 },
    ],
  },

  map10: {
    name: 'The Crucible',
    order: 10,
    hpMult: 2.50,
    waypoints: [
      { x:  640, y:   0 },
      { x:  640, y: 160 },
      { x:  140, y: 160 },
      { x:  140, y: 560 },
      { x: 1140, y: 560 },
      { x: 1140, y: 160 },
      { x:  900, y: 160 },
      { x:  900, y: 400 },
      { x: 1280, y: 400 },
    ],
  },
};
