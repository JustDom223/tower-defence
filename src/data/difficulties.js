/**
 * Difficulty tiers — Normal / Hard only (Easy removed in C0).
 * hpMult / speedMult are applied to each enemy at spawn time (in WaveSpawner).
 * starCap is the maximum stars a player can earn on this difficulty.
 * startingCash adjusts the opening economy.
 *
 * Hard is a steep jump by design — the only route to the 3rd star per map.
 */
export const DIFFICULTIES = {
  normal: {
    key:          'normal',
    label:        'Normal',
    emoji:        '🟡',
    hpMult:       1.0,
    speedMult:    1.0,
    starCap:      2,
    startingCash: 100,
  },
  hard: {
    key:          'hard',
    label:        'Hard',
    emoji:        '🔴',
    hpMult:       1.9,
    speedMult:    1.25,
    starCap:      3,
    startingCash: 75,
  },
};
