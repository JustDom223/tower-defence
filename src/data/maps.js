/**
 * Campaign map definitions.
 * order  — campaign position (1 = first, unlocked immediately; later maps gate on prev)
 * hpMult — per-map HP scaling stacked on top of the difficulty multiplier (C2)
 * waypoints — single-path maps (Forest)
 * paths  — dual-path maps (Mountains): array of two waypoint arrays
 */

export const WORLDS = [
  {
    key: 'forest',
    name: 'Forest',
    flavour: 'Gentle trails through the woods.',
    maps: ['map1','map2','map3','map4','map5','map6','map7','map8','map9','map10'],
  },
  {
    key: 'mountains',
    name: 'Mountains',
    flavour: 'Twisting passes — enemies split across two routes.',
    maps: ['map11','map12','map13','map14','map15','map16','map17','map18','map19','map20'],
  },
];

export const CAMPAIGN_ORDER = [
  'map1','map2','map3','map4','map5',
  'map6','map7','map8','map9','map10',
  'map11','map12','map13','map14','map15',
  'map16','map17','map18','map19','map20',
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

  // ── Maps 11–20 (hard tier) ────────────────────────────────────────────────
  map11: {
    name: 'The Hook',
    order: 11,
    hpMult: 2.25,
    paths: [
      [
        { x:    0, y: 130 },
        { x:  640, y: 130 },
        { x:  640, y: 270 },
        { x: 1280, y: 270 },
      ],
      [
        { x:    0, y: 520 },
        { x:  620, y: 520 },
        { x:  620, y: 380 },
        { x: 1280, y: 380 },
      ],
    ],
  },

  map12: {
    name: 'Double Loop',
    order: 12,
    hpMult: 3.00,
    paths: [
      [
        { x:    0, y: 100 },
        { x:  300, y: 100 },
        { x:  300, y: 260 },
        { x:  640, y: 260 },
        { x:  640, y: 100 },
        { x: 1280, y: 100 },
      ],
      [
        { x:    0, y: 550 },
        { x:  400, y: 550 },
        { x:  400, y: 380 },
        { x:  720, y: 380 },
        { x:  720, y: 550 },
        { x: 1280, y: 550 },
      ],
    ],
  },

  map13: {
    name: 'The Spine',
    order: 13,
    hpMult: 3.30,
    paths: [
      [
        { x:    0, y:  80 },
        { x:  200, y:  80 },
        { x:  200, y: 230 },
        { x:  560, y: 230 },
        { x:  560, y:  90 },
        { x:  920, y:  90 },
        { x:  920, y: 260 },
        { x: 1280, y: 260 },
      ],
      [
        { x:    0, y: 570 },
        { x:  360, y: 570 },
        { x:  360, y: 420 },
        { x:  680, y: 420 },
        { x:  680, y: 570 },
        { x: 1040, y: 570 },
        { x: 1040, y: 380 },
        { x: 1280, y: 380 },
      ],
    ],
  },

  map14: {
    name: 'Crosswind',
    order: 14,
    hpMult: 3.60,
    paths: [
      [
        { x:    0, y: 100 },
        { x:  500, y: 100 },
        { x:  500, y: 250 },
        { x:  900, y: 250 },
        { x:  900, y:  80 },
        { x: 1280, y:  80 },
      ],
      [
        { x:    0, y: 550 },
        { x:  400, y: 550 },
        { x:  400, y: 420 },
        { x:  820, y: 420 },
        { x:  820, y: 580 },
        { x: 1280, y: 580 },
      ],
    ],
  },

  map15: {
    name: 'The Maze',
    order: 15,
    hpMult: 3.90,
    paths: [
      [
        { x:    0, y:  80 },
        { x:  220, y:  80 },
        { x:  220, y: 220 },
        { x:  440, y: 220 },
        { x:  440, y:  80 },
        { x:  700, y:  80 },
        { x:  700, y: 260 },
        { x: 1280, y: 260 },
      ],
      [
        { x:    0, y: 580 },
        { x:  340, y: 580 },
        { x:  340, y: 420 },
        { x:  560, y: 420 },
        { x:  560, y: 580 },
        { x:  800, y: 580 },
        { x:  800, y: 380 },
        { x: 1280, y: 380 },
      ],
    ],
  },

  map16: {
    name: 'Vortex',
    order: 16,
    hpMult: 4.25,
    paths: [
      [
        { x:    0, y: 100 },
        { x:  500, y: 100 },
        { x:  500, y: 260 },
        { x:  900, y: 260 },
        { x:  900, y:  80 },
        { x: 1280, y:  80 },
      ],
      [
        { x:    0, y: 550 },
        { x:  400, y: 550 },
        { x:  400, y: 390 },
        { x:  800, y: 390 },
        { x:  800, y: 580 },
        { x: 1280, y: 580 },
      ],
    ],
  },

  map17: {
    name: 'The Descent',
    order: 17,
    hpMult: 4.60,
    paths: [
      [
        { x:    0, y:  70 },
        { x: 1060, y:  70 },
        { x: 1060, y: 230 },
        { x: 1280, y: 230 },
      ],
      [
        { x:    0, y: 580 },
        { x:  220, y: 580 },
        { x:  220, y: 400 },
        { x: 1060, y: 400 },
        { x: 1060, y: 560 },
        { x: 1280, y: 560 },
      ],
    ],
  },

  map18: {
    name: 'Omega',
    order: 18,
    hpMult: 5.00,
    paths: [
      [
        { x:    0, y: 100 },
        { x:  300, y: 100 },
        { x:  300, y: 240 },
        { x:  640, y: 240 },
        { x:  640, y:  90 },
        { x: 1000, y:  90 },
        { x: 1000, y: 260 },
        { x: 1280, y: 260 },
      ],
      [
        { x:    0, y: 550 },
        { x:  360, y: 550 },
        { x:  360, y: 400 },
        { x:  700, y: 400 },
        { x:  700, y: 560 },
        { x: 1040, y: 560 },
        { x: 1040, y: 380 },
        { x: 1280, y: 380 },
      ],
    ],
  },

  map19: {
    name: 'Purgatory',
    order: 19,
    hpMult: 5.50,
    paths: [
      [
        { x:    0, y:  60 },
        { x:  160, y:  60 },
        { x:  160, y: 230 },
        { x:  500, y: 230 },
        { x:  500, y:  70 },
        { x:  840, y:  70 },
        { x:  840, y: 250 },
        { x: 1180, y: 250 },
        { x: 1180, y:  80 },
        { x: 1280, y:  80 },
      ],
      [
        { x:    0, y: 590 },
        { x:  300, y: 590 },
        { x:  300, y: 430 },
        { x:  640, y: 430 },
        { x:  640, y: 580 },
        { x:  980, y: 580 },
        { x:  980, y: 390 },
        { x: 1280, y: 390 },
      ],
    ],
  },

  map20: {
    name: 'The Abyss',
    order: 20,
    hpMult: 6.00,
    paths: [
      [
        { x:    0, y:  80 },
        { x:  200, y:  80 },
        { x:  200, y: 250 },
        { x:  540, y: 250 },
        { x:  540, y:  80 },
        { x:  880, y:  80 },
        { x:  880, y: 270 },
        { x: 1200, y: 270 },
        { x: 1200, y: 100 },
        { x: 1280, y: 100 },
      ],
      [
        { x:    0, y: 570 },
        { x:  340, y: 570 },
        { x:  340, y: 400 },
        { x:  660, y: 400 },
        { x:  660, y: 580 },
        { x:  980, y: 580 },
        { x:  980, y: 390 },
        { x: 1280, y: 390 },
      ],
    ],
  },
};
