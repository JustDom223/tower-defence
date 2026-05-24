/**
 * Difficulty tiers.
 * hpMult / speedMult are applied to each enemy at spawn time (in WaveSpawner).
 * starCap is the maximum stars a player can earn on this difficulty.
 * startingCash adjusts the opening economy.
 */
export const DIFFICULTIES = {
  easy: {
    key:          'easy',
    label:        'Easy',
    emoji:        '🟢',
    hpMult:       0.7,
    speedMult:    0.85,
    starCap:      1,
    startingCash: 200,
  },
  normal: {
    key:          'normal',
    label:        'Normal',
    emoji:        '🟡',
    hpMult:       1.0,
    speedMult:    1.0,
    starCap:      2,
    startingCash: 150,
  },
  hard: {
    key:          'hard',
    label:        'Hard',
    emoji:        '🔴',
    hpMult:       1.4,
    speedMult:    1.15,
    starCap:      3,
    startingCash: 125,
  },
};
