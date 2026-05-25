export const ENEMY_TYPES = {
  runner:   { hp: 60,   speed: 80,  reward: 5,   cashReward: 10,  radius: 10, color: 0xe74c3c, sprite: 'dog.png' },
  sprinter: { hp: 30,   speed: 160, reward: 8,   cashReward: 8,   radius: 8,  color: 0xe67e22 },
  tank:     { hp: 300,  speed: 40,  reward: 20,  cashReward: 25,  radius: 16, color: 0x8e44ad, sprite: 'monster.png' },
  splitter: { hp: 120,  speed: 60,  reward: 15,  cashReward: 15,  radius: 13, color: 0x2ecc71,
              spawns: { type: 'runner', count: 2 } },

  /** Armoured — half damage from Dart and Marksman; full damage from Bomb and Frost. */
  armoured: { hp: 200,  speed: 50,  reward: 18,  cashReward: 20,  radius: 14, color: 0x607d8b,
              resistance: { dart: 0.5, marksman: 0.5 } },

  /** Boss — appears on wave 10; massive HP, slow, huge reward. */
  boss:     { hp: 2000, speed: 22,  reward: 150, cashReward: 100, radius: 28, color: 0xcc0044, sprite: 'spiderman.png' },

  /** Swarmling — tiny, very fast, very weak. Sent in large groups. */
  swarmling: { hp: 15, speed: 200, reward: 2, cashReward: 3, radius: 6, color: 0xfbbf24 },

  /** Brute — massively tanky, resists most damage types, slow. */
  brute: { hp: 800, speed: 28, reward: 40, cashReward: 50, radius: 22, color: 0x6b7280,
           resistance: { dart: 0.5, marksman: 0.5, bomb: 0.6, frost: 0.8 } },

  /** Phantom — camo; invisible to towers without camo detection. Medium HP, fast. */
  phantom: { hp: 80, speed: 110, reward: 20, cashReward: 18, radius: 10, color: 0xa78bfa,
             isCamo: true },

  /** Carrier — periodically spawns Swarmlings while alive. */
  carrier: { hp: 350, speed: 45, reward: 30, cashReward: 35, radius: 18, color: 0x0ea5e9,
             liveSpawnInterval: 3.0, liveSpawnType: 'swarmling', liveSpawnCount: 2 },
};
