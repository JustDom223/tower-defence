export const TOWER_TYPES = {
  dart: {
    name: 'Dart',
    cost: 50,
    damage: 18,
    range: 160,
    fireRate: 1.5,
    projSpeed: 320,
    aoeRadius: 0,
    isSlow: false,
    color: 0x3b82f6,
    projColor: 0x93c5fd,
    upgrades: {
      pathA: {
        label: 'Sharp',
        tiers: [
          { name: 'Sharp Tips',  desc: '+8 damage',           cost:  80, stats: { damage: 8 } },
          { name: 'Long Range',  desc: '+40 range',            cost: 130, stats: { range: 40 } },
          { name: 'Razor Sharp', desc: '+14 damage',           cost: 280, stats: { damage: 14 } },
          { name: 'Spike Storm', desc: '+20 dmg, +2 fire/sec', cost: 950, stats: { damage: 20, fireRate: 2.0 } },
        ],
      },
      pathB: {
        label: 'Quick',
        tiers: [
          { name: 'Quick Shots',  desc: '+0.5 fire/sec',          cost:  90, stats: { fireRate: 0.5 } },
          { name: 'Even Quicker', desc: '+0.8 fire/sec',          cost: 180, stats: { fireRate: 0.8 } },
          { name: 'Triple Shot',  desc: '+1.2 fire/sec, +6 dmg',  cost: 420, stats: { fireRate: 1.2, damage: 6 } },
          { name: 'Buzzsaw',      desc: '+3.0 fire/sec',          cost: 1100, stats: { fireRate: 3.0 } },
        ],
      },
    },
  },

  bomb: {
    name: 'Bomb',
    cost: 100,
    damage: 60,
    range: 140,
    fireRate: 0.6,
    projSpeed: 200,
    aoeRadius: 70,
    isSlow: false,
    color: 0xf97316,
    projColor: 0xfbbf24,
    upgrades: {
      pathA: {
        label: 'Blast',
        tiers: [
          { name: 'Bigger Blast',   desc: '+25 aoe radius',           cost: 130, stats: { aoeRadius: 25 } },
          { name: 'Heavy Payload',  desc: '+35 damage',               cost: 220, stats: { damage: 35 } },
          { name: 'Massive Blast',  desc: '+45 aoe radius',           cost: 500, stats: { aoeRadius: 45 } },
          { name: 'The Big One',    desc: '+70 aoe, +65 dmg',         cost: 1300, stats: { aoeRadius: 70, damage: 65 } },
        ],
      },
      pathB: {
        label: 'Rapid',
        tiers: [
          { name: 'Faster Fuse',   desc: '+0.3 fire/sec',             cost: 160, stats: { fireRate: 0.3 } },
          { name: 'Quick Reload',  desc: '+0.5 fire/sec',             cost: 280, stats: { fireRate: 0.5 } },
          { name: 'Cluster Bombs', desc: '+20 aoe, +25 dmg',          cost: 650, stats: { aoeRadius: 20, damage: 25 } },
          { name: 'Carpet Bomb',   desc: '+0.8 fire/sec, +25 aoe',    cost: 1500, stats: { fireRate: 0.8, aoeRadius: 25, damage: 35 } },
        ],
      },
    },
  },

  frost: {
    name: 'Frost',
    cost: 75,
    damage: 0,
    range: 140,
    fireRate: 2.0,
    projSpeed: 0,
    aoeRadius: 0,
    isSlow: true,
    slowFactor: 0.4,
    slowDuration: 1.5,
    color: 0x67e8f9,
    projColor: 0,
    upgrades: {
      pathA: {
        label: 'Freeze',
        tiers: [
          { name: 'Deeper Chill',   desc: 'Stronger slow (-0.1)',      cost: 120, stats: { slowFactor: -0.1 } },
          { name: 'Glacial Pulse',  desc: 'Stronger slow, +0.5 rate',  cost: 200, stats: { slowFactor: -0.1, fireRate: 0.5 } },
          { name: 'Ice Shard',      desc: '+30 range, deeper slow',    cost: 450, stats: { slowFactor: -0.05, range: 30 } },
          { name: 'Absolute Zero',  desc: 'Max slow, +1.5s duration',  cost: 1100, stats: { slowFactor: -0.1, slowDuration: 1.5 } },
        ],
      },
      pathB: {
        label: 'Permafrost',
        tiers: [
          { name: 'Wide Chill',     desc: '+40 range',                 cost: 120, stats: { range: 40 } },
          { name: 'Lingering Cold', desc: '+0.8s slow duration',       cost: 180, stats: { slowDuration: 0.8 } },
          { name: 'Snowstorm',      desc: '+50 range, +1.0s duration', cost: 500, stats: { range: 50, slowDuration: 1.0 } },
          { name: 'Blizzard',       desc: '+80 range, +2.0s duration', cost: 1200, stats: { range: 80, slowDuration: 2.0, fireRate: 1.0 } },
        ],
      },
    },
  },

  marksman: {
    name: 'Marksman',
    cost: 125,
    damage: 80,
    range: 350,
    fireRate: 0.7,
    projSpeed: 500,
    aoeRadius: 0,
    isSlow: false,
    color: 0xa855f7,
    projColor: 0xd8b4fe,
    upgrades: {
      pathA: {
        label: 'Power',
        tiers: [
          { name: 'High Velocity',   desc: '+30 damage',               cost: 160, stats: { damage: 30 } },
          { name: 'Armor Piercing',  desc: '+50 damage',               cost: 320, stats: { damage: 50 } },
          { name: 'Critical Rounds', desc: '+90 damage',               cost: 750, stats: { damage: 90 } },
          { name: 'Headshot',        desc: '+160 damage',              cost: 1600, stats: { damage: 160 } },
        ],
      },
      pathB: {
        label: 'Watchful',
        tiers: [
          { name: 'Long Watch',    desc: '+100 range',                  cost: 160, stats: { range: 100 } },
          { name: 'Global Sight',  desc: 'Unlimited range',             cost: 380, stats: { globalRange: true } },
          { name: 'Rapid Fire',    desc: '+0.5 fire/sec',               cost: 650, stats: { fireRate: 0.5 } },
          { name: 'Sentry',        desc: '+0.8 fire/sec, +50 dmg',     cost: 1500, stats: { fireRate: 0.8, damage: 50 } },
        ],
      },
    },
  },
};
