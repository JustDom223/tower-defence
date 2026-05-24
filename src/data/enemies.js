export const ENEMY_TYPES = {
  runner:   { hp: 60,   speed: 80,  reward: 5,   radius: 10, color: 0xe74c3c, sprite: 'dog.png' },
  sprinter: { hp: 30,   speed: 160, reward: 8,   radius: 8,  color: 0xe67e22 },
  tank:     { hp: 300,  speed: 40,  reward: 20,  radius: 16, color: 0x8e44ad, sprite: 'monster.png' },
  splitter: { hp: 120,  speed: 60,  reward: 15,  radius: 13, color: 0x2ecc71,
              spawns: { type: 'runner', count: 2 } },

  /** Armoured — half damage from Dart and Marksman; full damage from Bomb and Frost. */
  armoured: { hp: 200,  speed: 50,  reward: 18,  radius: 14, color: 0x607d8b,
              resistance: { dart: 0.5, marksman: 0.5 } },

  /** Boss — appears on wave 10; massive HP, slow, huge reward. */
  boss:     { hp: 2000, speed: 22,  reward: 150, radius: 28, color: 0xcc0044, sprite: 'spiderman.png' },
};
