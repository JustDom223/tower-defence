export const ENEMY_TYPES = {
  runner:   { hp: 60,   speed: 80,  reward: 5,   cashReward: 10,  radius: 10, color: 0xe74c3c, sprite: 'dog.png' },
  sprinter: { hp: 30,   speed: 160, reward: 8,   cashReward: 8,   radius: 8,  color: 0xe67e22 },
  tank:     { hp: 300,  speed: 40,  reward: 20,  cashReward: 25,  radius: 16, color: 0x8e44ad, sprite: 'monster.png' },
  splitter: { hp: 120,  speed: 60,  reward: 15,  cashReward: 15,  radius: 13, color: 0x2ecc71,
              spawns: { type: 'runner', count: 2 } },

  /** Armoured — half damage from archer/marksman; bombs deal 1.5× (weak to explosions). */
  armoured: { hp: 200,  speed: 50,  reward: 18,  cashReward: 20,  radius: 14, color: 0x607d8b,
              resistance: { archer: 0.5, marksman: 0.5, bomb: 1.5, laser: 2.0 }, sprite: 'frankenstein.jpeg' },

  /** Boss — appears on wave 10; massive HP, slow, huge reward. */
  boss:     { hp: 2000, speed: 22,  reward: 150, cashReward: 100, radius: 28, color: 0xcc0044, sprite: 'spiderman.png' },

  /** Swarmling — tiny, very fast, very weak. Sent in large groups. */
  swarmling: { hp: 15, speed: 200, reward: 2, cashReward: 3, radius: 6, color: 0xfbbf24, sprite: 'bug.jpeg' },

  /** Brute — massively tanky, resists most damage types, slow. */
  brute: { hp: 800, speed: 28, reward: 40, cashReward: 50, radius: 22, color: 0x6b7280,
           resistance: { archer: 0.5, marksman: 0.5, bomb: 0.6, frost: 0.8 } },

  /** Phantom — camo; invisible to towers without camo detection. Medium HP, fast. */
  phantom: { hp: 80, speed: 110, reward: 20, cashReward: 18, radius: 10, color: 0xa78bfa,
             isCamo: true, sprite: 'shade.jpeg' },

  /** Carrier — periodically spawns Swarmlings while alive. */
  carrier: { hp: 350, speed: 45, reward: 30, cashReward: 35, radius: 18, color: 0x0ea5e9,
             liveSpawnInterval: 3.0, liveSpawnType: 'swarmling', liveSpawnCount: 2 },

  /** Shielded — absorbs damage with a shield layer first; shield ignores DoT. */
  shielded: { hp: 150, speed: 65, reward: 22, cashReward: 25, radius: 13, color: 0x60a5fa,
              shield: 120 },

  /** Regenerator — regenerates HP over time; countered by sustained DoT. */
  regenerator: { hp: 280, speed: 55, reward: 28, cashReward: 30, radius: 14, color: 0x34d399,
                 regenRate: 20 },

  /** Flyer — floats above the path; immune to ground hazards. */
  flyer: { hp: 90, speed: 130, reward: 15, cashReward: 18, radius: 11, color: 0x93c5fd,
           isFlying: true },

  /** Magma — immune to slow and freeze; fire-natured, resists frost. */
  magma: { hp: 220, speed: 60, reward: 22, cashReward: 25, radius: 14, color: 0xf97316,
           immuneSlow: true, resistance: { frost: 0 }, sprite: 'inferno.jpeg' },

  /** Insulated — immune to lightning (Tesla); use other towers to deal with it. */
  insulated: { hp: 180, speed: 70, reward: 18, cashReward: 22, radius: 13, color: 0x4b5563,
               resistance: { tesla: 0 } },

  /** Aquatic — resists fire and burn DoT; countered by physical damage. */
  aquatic: { hp: 160, speed: 75, reward: 18, cashReward: 20, radius: 12, color: 0x0ea5e9,
             resistance: { flamethrower: 0.3, dot: 0.4 } },

  /** Cleric — heals nearby enemies; a priority kill target. */
  cleric: { hp: 60, speed: 70, reward: 25, cashReward: 30, radius: 9, color: 0xfde047,
            healsNearby: 12, healsNearbyRadius: 80 },

  /** Stutter — moves in stop-and-go bursts; hard to lead-aim at. */
  stutter: { hp: 100, speed: 130, reward: 15, cashReward: 18, radius: 11, color: 0xa78bfa,
             stutterInterval: 1.5, stutterPauseTime: 0.6 },

  /** Juggernaut — resists all damage types; only raw burst cuts through. */
  juggernaut: { hp: 600, speed: 32, reward: 50, cashReward: 60, radius: 22, color: 0x374151,
                resistance: { archer: 0.5, marksman: 0.5, frost: 0.7, bomb: 0.8,
                              flamethrower: 0.6, dot: 0.3, tesla: 0.6, laser: 0.5 } },

  /** Wraith — immune to all direct damage; only arcane poison DoT can kill it. */
  wraith: { hp: 120, speed: 85, reward: 35, cashReward: 40, radius: 11, color: 0x7c3aed,
            resistance: { archer: 0, bomb: 0, frost: 0, marksman: 0, tesla: 0,
                          flamethrower: 0, laser: 0, dot: 1 } },

  /** Mega Boss — end-game boss; extremely tanky; spawns Armoured on death. */
  megaboss: { hp: 8000, speed: 15, reward: 500, cashReward: 300, radius: 40, color: 0x7f1d1d,
              spawns: { type: 'armoured', count: 4 } },
};
