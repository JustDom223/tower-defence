export const TOWER_TYPES = {
  archer: {
    name: 'Archer',
    cost: 50,
    damage: 18,
    range: 135,
    fireRate: 1.5,
    projSpeed: 600,
    aoeRadius: 0,
    isSlow: false,
    color: 0x3b82f6,
    projColor: 0x93c5fd,
    sprite: 'archer.jpeg',
    projStyle: 'arrow',
    leadsTarget: true,
    upgrades: {
      pathA: {
        label: 'Multishot',
        tiers: [
          { name: 'Double Shot',  desc: 'Fires 2 arrows simultaneously',              cost:  35, stats: { multiShot: 1 } },
          { name: 'Hawk Eye',     desc: '+50 range',                                  cost:  75, stats: { range: 50 } },
          { name: 'Quick Draw',   desc: '+1.0 fire/sec',                              cost: 175, stats: { fireRate: 1.0 } },
          { name: 'Triple Shot',  desc: '3-arrow cone volley',                        cost: 425, stats: { coneShot: 3 } },
          { name: 'Arrow Storm',  desc: '+2.0 fire/sec; rapid cone volleys',          cost: 1000, stats: { fireRate: 2.0 } },
        ],
      },
      pathB: {
        label: 'Arcane Poison',
        tiers: [
          { name: 'Arcane Tip',      desc: 'Arrows curse targets with arcane poison (2 dmg/s permanent); -50% fire rate', cost:  35, stats: { dotDamage: 2, dotDuration: 9999, dotTickRate: 1.0, dotStackCap: 1, fireRate: -0.75 } },
          { name: 'Mystic Range',    desc: '+50 range',                                          cost:  75, stats: { range: 50 } },
          { name: 'Deep Curse',      desc: 'Curse strengthened to 5 dmg/s',                     cost: 175, stats: { dotDamage: 3 } },
          { name: 'Spreading Curse', desc: 'Curse spreads to nearby enemies on kill',            cost: 425, stats: { dotDuration: 1, range: 20 } },
          { name: 'Plague of Ruin',  desc: 'Curse stacks up to 3×; +3 dmg/s per stack',         cost: 1000, stats: { dotDamage: 3, dotStackCap: 2 } },
        ],
      },
    },
  },

  bomb: {
    name: 'Bomb',
    cost: 75,
    damage: 30,
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
          { name: 'Bigger Blast',   desc: '+25 aoe radius',           cost:  55, stats: { aoeRadius: 25 } },
          { name: 'Heavy Payload',  desc: '+35 damage',               cost: 115, stats: { damage: 35 } },
          { name: 'Massive Blast',  desc: '+45 aoe radius',           cost: 265, stats: { aoeRadius: 45 } },
          { name: 'The Big Fella',  desc: '+70 aoe, +65 dmg',         cost: 600, stats: { aoeRadius: 70, damage: 65 } },
        ],
      },
      pathB: {
        label: 'Rapid',
        tiers: [
          { name: 'Faster Fuse',   desc: '+0.3 fire/sec',             cost:  55, stats: { fireRate: 0.3 } },
          { name: 'Quick Reload',  desc: '+0.5 fire/sec',             cost: 115, stats: { fireRate: 0.5 } },
          { name: 'Cluster Bombs', desc: '+20 aoe, +25 dmg',          cost: 265, stats: { aoeRadius: 20, damage: 25 } },
          { name: 'Carpet Bomb',   desc: '+0.8 fire/sec, +25 aoe',    cost: 600, stats: { fireRate: 0.8, aoeRadius: 25, damage: 35 } },
        ],
      },
    },
  },

  frost: {
    name: 'Frost',
    cost: 75,
    damage: 0,
    range: 140,
    fireRate: 0.5,
    projSpeed: 0,
    aoeRadius: 0,
    isSlow: true,
    slowFactor: 0.4,        // chilled enemies move at 40% speed
    slowDuration: 1.0,      // chill lasts 1s and re-pulses every 2s → a periodic slow
    color: 0x67e8f9,
    projColor: 0,
    upgrades: {
      // Path A — coverage: turn the periodic chill into an always-on slow over a
      // huge area. Never stuns, so enemies always keep crawling forward.
      pathA: {
        label: 'Permafrost',
        tiers: [
          { name: 'Wide Chill',     desc: '+40 range; chill lingers longer',            cost:  50,  stats: { range: 40, slowDuration: 0.4 } },
          { name: 'Frostbite',      desc: 'Chill never lifts; stronger slow, faster',   cost: 110,  stats: { slowFactor: -0.1, slowDuration: 0.4, fireRate: 0.25 } },
          { name: 'Glacial Spread', desc: '+50 range; stronger, longer slow',           cost: 260,  stats: { range: 50, slowFactor: -0.05, slowDuration: 0.5 } },
          { name: 'Eternal Winter', desc: '+60 range; max slow over a vast area',        cost: 600, stats: { range: 60, slowFactor: -0.05, slowDuration: 0.5, fireRate: 0.25 } },
        ],
      },
      // Path B — control: trade the slow for a periodic freeze that grows into a
      // damage amplifier, then deals its own burst. Stun stays shorter than the
      // re-fire gap so enemies are never frozen solid forever.
      pathB: {
        label: 'Shatter',
        tiers: [
          { name: 'Flash Freeze',  desc: 'Freezes instead of chilling — stuns for 0.8s',         cost:  50,  stats: { isStun: true, stunDuration: 0.8 } },
          { name: 'Brittle Ice',   desc: 'Frozen enemies take 30% more damage from all towers',  cost: 110,  stats: { stunDuration: 0.2, debuffVulnerability: 1.3, debuffDuration: 3.0 } },
          { name: 'Deep Freeze',   desc: '+40 range; longer freeze; 50% more damage taken',      cost: 260,  stats: { range: 40, stunDuration: 0.2, debuffVulnerability: 0.2 } },
          { name: 'Shatter',       desc: 'Freeze blasts for 70 damage; 70% more damage taken',   cost: 600, stats: { damage: 70, stunDuration: 0.1, debuffVulnerability: 0.2 } },
        ],
      },
    },
  },

  generator: {
    name: 'Generator',
    cost: 225,
    damage:    0,
    range:     120,
    fireRate:  0,
    projSpeed: 0,
    aoeRadius: 0,
    isSlow:    false,
    isEconomy: true,
    incomePerWave:      30,
    killCashBoostRange: 0,
    killCashBoostMult:  0,
    color: 0xeab308,
    projColor: 0,
    upgrades: {
      pathA: {
        label: 'Bank',
        tiers: [
          { name: 'Savings Account',    desc: '+$55/wave',    cost:  145, stats: { incomePerWave: 25 } },
          { name: 'Investment Fund',    desc: '+$100/wave',   cost:  335, stats: { incomePerWave: 45 } },
          { name: 'Compound Interest',  desc: '+$180/wave',   cost:  790, stats: { incomePerWave: 80 } },
          { name: 'Money Press',        desc: '+$300/wave',   cost: 1800, stats: { incomePerWave: 120 } },
        ],
      },
      pathB: {
        label: 'Market',
        tiers: [
          { name: 'Pawn Shop',     desc: '+25% kill cash nearby',  cost:  145, stats: { killCashBoostRange: 120, killCashBoostMult: 0.25 } },
          { name: 'Trading Post',  desc: '+50% total',             cost:  335, stats: { killCashBoostMult: 0.25 } },
          { name: 'Stock Exchange',desc: '+75%; wider aura',        cost:  790, stats: { killCashBoostRange: 60, killCashBoostMult: 0.25 } },
          { name: 'Black Market',  desc: '+100% — kills doubled',   cost: 1800, stats: { killCashBoostMult: 0.25 } },
        ],
      },
    },
  },

  alchemist: {
    name: 'Alchemist',
    cost: 200,
    damage:    15,
    range:     150,
    fireRate:  1.2,
    projSpeed: 280,
    aoeRadius: 0,
    isSlow:    false,
    color: 0x8b5cf6,
    projColor: 0xc4b5fd,
    dotDamage:        10,
    dotDuration:      3.0,
    dotTickRate:      1.0,
    dotIgnoresArmour: true,
    dotStackCap:      2,
    debuffVulnerability: 1.3,
    debuffDuration:      3.0,
    ignoresArmour:    false,
    upgrades: {
      pathA: {
        label: 'Corrosion',
        tiers: [
          { name: 'Acid Flask',     desc: '+8 acid DoT/tick',           cost: 130, stats: { dotDamage: 8 } },
          { name: 'Caustic Brew',   desc: '+15 acid DoT, +1s duration', cost: 300, stats: { dotDamage: 15, dotDuration: 1.0 } },
          { name: 'Viral Agent',    desc: '+25 acid DoT, stack cap +1', cost: 700, stats: { dotDamage: 25, dotStackCap: 1 } },
          { name: 'Plague Serum',   desc: '+40 acid DoT, +1.5s dur',    cost: 1600, stats: { dotDamage: 40, dotDuration: 1.5 } },
        ],
      },
      pathB: {
        label: 'Debuff',
        tiers: [
          { name: 'Weakening Potion', desc: '+10% vulnerability',        cost: 130, stats: { debuffVulnerability: 0.10 } },
          { name: 'Armor Solvent',    desc: 'Shots ignore armour',       cost: 300, stats: { ignoresArmour: true } },
          { name: 'Exploit Weakness', desc: '+20% vulnerability, +1s',  cost: 700, stats: { debuffVulnerability: 0.20, debuffDuration: 1.0 } },
          { name: 'Total Breakdown',  desc: '+40% vulnerability, +2s',  cost: 1600, stats: { debuffVulnerability: 0.40, debuffDuration: 2.0 } },
        ],
      },
    },
  },

  flamethrower: {
    name: 'Flamethrower',
    cost: 175,
    damage:    20,
    range:     130,
    fireRate:  3.0,
    projSpeed: 260,
    aoeRadius: 0,
    isSlow:    false,
    color: 0xef4444,
    projColor: 0xfb923c,
    dotDamage:        8,
    dotDuration:      2.5,
    dotTickRate:      1.0,
    dotIgnoresArmour: false,
    dotStackCap:      3,
    leavesHazard:     true,
    hazardDamage:     6,
    hazardRadius:     38,
    hazardDuration:   3.5,
    hazardTickRate:   0.8,
    upgrades: {
      pathA: {
        label: 'Inferno',
        tiers: [
          { name: 'Napalm',       desc: '+4 DoT/tick, +1s burn',      cost: 115, stats: { dotDamage: 4, dotDuration: 1.0 } },
          { name: 'Firestorm',    desc: '+8 DoT/tick, stack cap +1',   cost: 265, stats: { dotDamage: 8, dotStackCap: 1 } },
          { name: 'Magma Core',   desc: '+14 DoT/tick',                cost: 615, stats: { dotDamage: 14 } },
          { name: 'Hellfire',     desc: '+25 DoT/tick, +1.5s burn',    cost: 1400, stats: { dotDamage: 25, dotDuration: 1.5 } },
        ],
      },
      pathB: {
        label: 'Hazard',
        tiers: [
          { name: 'Oil Slick',    desc: '+12 hazard dmg, +1s pool',   cost: 115, stats: { hazardDamage: 12, hazardDuration: 1.0 } },
          { name: 'Burning Pool', desc: '+20 hazard dmg, +20 radius', cost: 265, stats: { hazardDamage: 20, hazardRadius: 20 } },
          { name: 'Lava Field',   desc: '+30 hazard dmg, +2s pool',   cost: 615, stats: { hazardDamage: 30, hazardDuration: 2.0 } },
          { name: 'Inferno Zone', desc: '+50 hazard dmg, +40 radius', cost: 1400, stats: { hazardDamage: 50, hazardRadius: 40 } },
        ],
      },
    },
  },

  commandpost: {
    name: 'Command Post',
    cost: 300,
    damage:    0,
    range:     200,
    fireRate:  0,
    projSpeed: 220,
    aoeRadius: 0,
    isSlow:    false,
    isSupport: true,
    buffFireRate: 0.15,
    buffDamage:   0,
    buffRange:    0,
    camoDetect:   true,   // reveals camo to nearby towers on purchase
    leadsTarget:  true,
    color: 0x10b981,
    projColor: 0x6ee7b7,
    debuffVulnerability: 0,
    debuffDuration:      0,
    projSlowFactor:      0,
    projSlowDuration:    0,
    upgrades: {
      pathA: {
        label: 'War Room',
        tiers: [
          { name: 'Combat Drills',    desc: '+20% fire rate and +20% damage to nearby towers',       cost: 195,  stats: { buffFireRate: 0.20, buffDamage: 0.20 } },
          { name: 'Ammo Cache',       desc: '+30% more damage to nearby towers',                     cost: 450,  stats: { buffDamage: 0.30 } },
          { name: 'Extended Network', desc: '+120 range; nearby towers gain +25% range',             cost: 1050,  stats: { range: 120, buffRange: 0.25 } },
          { name: 'Supreme Command',  desc: '+50% fire rate, +50% damage to all nearby towers',      cost: 2400, stats: { buffFireRate: 0.50, buffDamage: 0.50 } },
        ],
      },
      pathB: {
        label: 'Recon',
        tiers: [
          { name: 'Surveillance',     desc: 'Fires marking shots — targets take 25% more damage for 3s; loses support aura', cost: 195,  stats: { isSupport: false, buffFireRate: -0.15, fireRate: 0.75, debuffVulnerability: 1.25, debuffDuration: 3.0 } },
          { name: 'Target Lock',      desc: '+25% fire rate; targets take 40% more damage for 5s',  cost: 450,  stats: { fireRate: 0.25, debuffVulnerability: 0.15, debuffDuration: 2.0 } },
          { name: 'Signal Jamming',   desc: 'Marked targets also slowed 30% for 4s',                cost: 1050,  stats: { projSlowFactor: 0.70, projSlowDuration: 4.0 } },
          { name: 'Total Disruption', desc: 'Marks 3 targets simultaneously; 60% more damage, 45% slow', cost: 2400, stats: { multiShot: 2, debuffVulnerability: 0.20, projSlowFactor: -0.05 } },
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
    projSpeed: 1200,       // fast sniper round
    aoeRadius: 0,
    isSlow: false,
    flyOnMiss: true,       // EXPERIMENT: if the target dies mid-flight the bullet keeps
                           // flying straight (hits anything in its path). Remove to revert.
    color: 0xa855f7,
    projColor: 0x000000,   // black sniper round
    projStyle: 'bullet',   // rendered as an elongated tracer, not a dot
    ignoresArmour: false,
    upgrades: {
      pathA: {
        label: 'Power',
        tiers: [
          { name: 'High Velocity',   desc: '+30 damage',               cost:  80, stats: { damage: 30 } },
          { name: 'Armor Piercing',  desc: '+50 dmg; shots ignore armour', cost: 190, stats: { damage: 50, ignoresArmour: true } },
          { name: 'Critical Rounds', desc: '+90 damage',               cost: 440, stats: { damage: 90 } },
          { name: 'Headshot',        desc: '+160 damage',              cost: 1000, stats: { damage: 160 } },
        ],
      },
      pathB: {
        label: 'Ranger',
        tiers: [
          { name: 'Long Watch',    desc: '+100 range',                  cost:  80, stats: { range: 100 } },
          { name: 'Global Sight',  desc: 'Unlimited range',             cost: 190, stats: { globalRange: true } },
          { name: 'Twin Barrel',   desc: 'Fire at 2 targets at once',  cost: 440, stats: { multiShot: 1 } },
          { name: 'Triple Tap',    desc: 'Fire at 3 targets; +50 dmg', cost: 1000, stats: { multiShot: 1, damage: 50 } },
        ],
      },
    },
  },

  tesla: {
    name: 'Tesla',
    cost: 200,
    damage: 25,
    range: 160,
    fireRate: 1.2,
    projSpeed: 0,          // instant — no travelling projectile
    instant: true,         // hitscan: a lightning bolt strikes the target immediately
    instantStyle: 'arc',   // renderer style: jagged lightning
    chainTargets: 0,       // extra enemies the bolt arcs to (granted by the Storm path)
    chainRange: 110,       // max jump distance between arc links
    chainFalloff: 0.78,    // damage multiplier applied per additional arc link
    aoeRadius: 0,
    isSlow: false,
    color: 0xfde047,
    projColor: 0xfef08a,
    upgrades: {
      pathA: {
        // Storm — chain lightning: the bolt arcs to more and more nearby enemies.
        label: 'Storm',
        tiers: [
          { name: 'Static Field', desc: '+10 dmg; arcs to 1 more enemy',  cost: 130, stats: { damage: 10, chainTargets: 1 } },
          { name: 'Arc Chain',    desc: '+20 dmg; arcs to 1 more enemy',  cost: 300, stats: { damage: 20, chainTargets: 1 } },
          { name: 'Chain Storm',  desc: '+30 dmg; arcs to 2 more enemies', cost: 700, stats: { damage: 30, chainTargets: 2 } },
          { name: 'Supercell',    desc: '+55 dmg; arcs to 1 more; +range', cost: 1600, stats: { damage: 55, chainTargets: 1, range: 40, chainRange: 30 } },
        ],
      },
      pathB: {
        // Railgun — single-target lightning lance: no chain, just escalating burst.
        label: 'Railgun',
        tiers: [
          { name: 'Rail Coils',   desc: '+45 dmg',             cost: 130, stats: { damage: 45 } },
          { name: 'Charge Shot',  desc: '+75 dmg',             cost: 300, stats: { damage: 75 } },
          { name: 'Plasma Rail',  desc: '+130 dmg',            cost: 700, stats: { damage: 130 } },
          { name: 'Rail Cannon',  desc: '+220 dmg; +80 range', cost: 1600, stats: { damage: 220, range: 80 } },
        ],
      },
    },
  },

  stickycannon: {
    name: 'Sticky Cannon',
    cost: 100,
    damage: 5,
    range: 150,
    fireRate: 1.2,
    projSpeed: 220,
    aoeRadius: 0,
    isSlow: false,
    projSlowFactor: 0.35,
    projSlowDuration: 2.0,
    color: 0x84cc16,
    projColor: 0xbef264,
    upgrades: {
      pathA: {
        label: 'Tar Pit',
        tiers: [
          { name: 'Thick Glue',   desc: 'Slower (to 20%); +0.5s',      cost:  65, stats: { projSlowFactor: -0.15, projSlowDuration: 0.5 } },
          { name: 'Adhesive',     desc: '+12 dmg; +0.4s slow',          cost: 150, stats: { damage: 12, projSlowDuration: 0.4 } },
          { name: 'Super Glue',   desc: '+15 dmg; to 5%; +1s',          cost: 350, stats: { damage: 15, projSlowFactor: -0.05, projSlowDuration: 1.0 } },
          { name: 'Tar Pit',      desc: '+2 targets; +25 dmg',          cost: 800, stats: { damage: 25, multiShot: 1 } },
        ],
      },
      pathB: {
        label: 'Spreader',
        tiers: [
          { name: 'Splash Glue',  desc: 'AoE 45 glue splash',           cost:  65, stats: { aoeRadius: 45 } },
          { name: 'Glue Bomb',    desc: '+10 dmg; AoE +30',             cost: 150, stats: { damage: 10, aoeRadius: 30 } },
          { name: 'Mega Splash',  desc: '+15 dmg; AoE +40; +0.5s',      cost: 350, stats: { damage: 15, aoeRadius: 40, projSlowDuration: 0.5 } },
          { name: 'Glue Storm',   desc: '+20 dmg; AoE +60; +1s',        cost: 800, stats: { damage: 20, aoeRadius: 60, projSlowDuration: 1.0 } },
        ],
      },
    },
  },

  minelayer: {
    name: 'Mine Layer',
    cost: 150,
    damage: 20,
    range: 165,
    fireRate: 0.8,
    projSpeed: 160,
    aoeRadius: 0,
    leavesHazard: true,
    hazardDamage: 12,
    hazardRadius: 25,
    hazardDuration: 5.0,
    hazardTickRate: 1.0,
    color: 0x78716c,
    projColor: 0xa8a29e,
    upgrades: {
      pathA: {
        label: 'Caltrops',
        tiers: [
          { name: 'Dense Spread',  desc: '+0.4/s; +8 hazard dmg',        cost: 100, stats: { fireRate: 0.4, hazardDamage: 8 } },
          { name: 'Caltrop Storm', desc: '+0.5/s; +2s duration',         cost: 225, stats: { fireRate: 0.5, hazardDuration: 2.0 } },
          { name: 'Nail Bomb',     desc: '+20 hazard dmg; +20 radius',   cost: 525, stats: { hazardDamage: 20, hazardRadius: 20 } },
          { name: 'Spike Mine',    desc: '+1.0/s; +30 hazard; +3s dur',  cost: 1200, stats: { fireRate: 1.0, hazardDamage: 30, hazardDuration: 3.0 } },
        ],
      },
      pathB: {
        label: 'Spiked Ball',
        tiers: [
          { name: 'Heavy Spike',   desc: '+30 dmg; pierce 1; no hazard', cost: 100, stats: { damage: 30, pierce: 1, leavesHazard: false } },
          { name: 'Iron Ball',     desc: '+50 dmg; pierce 2',            cost: 225, stats: { damage: 50, pierce: 1 } },
          { name: 'Wrecking Ball', desc: '+70 dmg; pierce 3; AoE 35',   cost: 525, stats: { damage: 70, pierce: 1, aoeRadius: 35 } },
          { name: 'Doom Ball',     desc: '+120 dmg; pierce 4',           cost: 1200, stats: { damage: 120, pierce: 2 } },
        ],
      },
    },
  },

  boomerang: {
    name: 'Boomerang',
    cost: 120,
    damage: 30,
    range: 170,
    fireRate: 0.9,
    projSpeed: 250,
    aoeRadius: 0,
    pierce: 1,
    color: 0xf59e0b,
    projColor: 0xfcd34d,
    upgrades: {
      pathA: {
        label: 'Ricochet',
        tiers: [
          { name: 'Glaive Throw',  desc: '+20 dmg; +2 pierce',           cost:  80, stats: { damage: 20, pierce: 2 } },
          { name: 'True Glaive',   desc: '+30 dmg; +2 pierce',           cost: 180, stats: { damage: 30, pierce: 2 } },
          { name: 'Glaive Storm',  desc: '+40 dmg; +3 pierce; +30 range',cost: 420, stats: { damage: 40, pierce: 3, range: 30 } },
          { name: 'Razor Glaive',  desc: '+60 dmg; +4 pierce; +0.4/s',  cost: 975, stats: { damage: 60, pierce: 4, fireRate: 0.4 } },
        ],
      },
      pathB: {
        label: 'Heavy Glaive',
        tiers: [
          { name: 'Heavy Boomer',  desc: '+50 dmg',                      cost:  80, stats: { damage: 50 } },
          { name: 'Mega Glaive',   desc: '+80 dmg; AoE 45',              cost: 180, stats: { damage: 80, aoeRadius: 45 } },
          { name: 'Crushing Blow', desc: '+100 dmg; slows (50%)',        cost: 420, stats: { damage: 100, projSlowFactor: 0.5, projSlowDuration: 1.5 } },
          { name: 'Devastator',    desc: '+150 dmg; AoE +50',            cost: 975, stats: { damage: 150, aoeRadius: 50 } },
        ],
      },
    },
  },

  laser: {
    name: 'Laser',
    cost: 150,
    damage: 22,
    range: 200,
    fireRate: 2.5,
    projSpeed: 0,          // instant beam — no travelling projectile
    instant: true,
    instantStyle: 'beam',  // renderer style: clean straight beam
    aoeRadius: 0,
    color: 0xf43f5e,
    projColor: 0xfda4af,
    upgrades: {
      pathA: {
        label: 'Beam',
        tiers: [
          { name: 'Focus Lens',    desc: '+15 dmg; pierce 1',            cost: 100, stats: { damage: 15, pierce: 1 } },
          { name: 'Cutting Beam',  desc: '+25 dmg; pierce 2',            cost: 225, stats: { damage: 25, pierce: 1 } },
          { name: 'Laser Drill',   desc: '+40 dmg; pierce 3',            cost: 525, stats: { damage: 40, pierce: 1 } },
          { name: 'Death Ray',     desc: '+80 dmg; pierce 5; ignores arm',cost: 1200, stats: { damage: 80, pierce: 2, ignoresArmour: true } },
        ],
      },
      pathB: {
        label: 'Scatter',
        tiers: [
          { name: 'Split Shot',    desc: '+2 targets',                   cost: 100, stats: { multiShot: 1 } },
          { name: 'Triple Beam',   desc: '+1 target; +30 dmg',           cost: 225, stats: { multiShot: 1, damage: 30 } },
          { name: 'Scatter Array', desc: '+2 targets; +40 dmg',          cost: 525, stats: { damage: 40, multiShot: 2 } },
          { name: 'Beam Matrix',   desc: '+50 dmg; +2 targets; +range',  cost: 1200, stats: { damage: 50, multiShot: 2, range: 50 } },
        ],
      },
    },
  },

  engineer: {
    name: 'Engineer',
    cost: 200,
    damage: 28,
    range: 165,
    fireRate: 1.4,
    projSpeed: 300,
    aoeRadius: 0,
    color: 0x0ea5e9,
    projColor: 0x7dd3fc,
    upgrades: {
      pathA: {
        label: 'Turret',
        tiers: [
          { name: 'Auto-Turret',   desc: '+20 dmg; +0.3/s',              cost: 130, stats: { damage: 20, fireRate: 0.3 } },
          { name: 'Rapid Fire',    desc: '+30 dmg; +0.5/s',              cost: 300, stats: { damage: 30, fireRate: 0.5 } },
          { name: 'Heavy Cannon',  desc: '+50 dmg; AoE 35',              cost: 700, stats: { damage: 50, aoeRadius: 35 } },
          { name: 'Fortress',      desc: '+80 dmg; AoE +40; +0.4/s',    cost: 1600, stats: { damage: 80, aoeRadius: 40, fireRate: 0.4 } },
        ],
      },
      pathB: {
        label: 'Overclock',
        tiers: [
          { name: 'Overclocked',   desc: '+0.8/s; +15 dmg',              cost: 130, stats: { fireRate: 0.8, damage: 15 } },
          { name: 'Turbo Mode',    desc: '+1.2/s; +20 dmg',              cost: 300, stats: { fireRate: 1.2, damage: 20 } },
          { name: 'Hyper Drive',   desc: '+2.0/s; +30 dmg',              cost: 700, stats: { fireRate: 2.0, damage: 30 } },
          { name: 'Warp Speed',    desc: '+3.5/s; +50 dmg',              cost: 1600, stats: { fireRate: 3.5, damage: 50 } },
        ],
      },
    },
  },

  druid: {
    name: 'Druid',
    cost: 175,
    damage: 18,
    range: 165,
    fireRate: 1.0,
    projSpeed: 200,
    aoeRadius: 0,
    projSlowFactor: 0.65,
    projSlowDuration: 1.2,
    dotDamage: 0,
    dotDuration: 0,
    dotTickRate: 1.0,
    dotStackCap: 1,
    color: 0x22c55e,
    projColor: 0x86efac,
    upgrades: {
      pathA: {
        label: 'Tornado',
        tiers: [
          { name: 'Gust',         desc: 'AoE 55; stronger slow (40%)',  cost: 115, stats: { aoeRadius: 55, projSlowFactor: -0.25 } },
          { name: 'Vortex',       desc: '+25 dmg; AoE +35; +0.8s slow', cost: 265, stats: { damage: 25, aoeRadius: 35, projSlowDuration: 0.8 } },
          { name: 'Cyclone',      desc: '+35 dmg; AoE +30; slow (20%)', cost: 615, stats: { damage: 35, aoeRadius: 30, projSlowFactor: -0.10 } },
          { name: 'Tornado',      desc: '+60 dmg; AoE +40; +30 range',  cost: 1400, stats: { damage: 60, aoeRadius: 40, range: 30 } },
        ],
      },
      pathB: {
        label: 'Thorns',
        tiers: [
          { name: 'Thorns',       desc: 'DoT: 8/tick, 3s burn',         cost: 115, stats: { dotDamage: 8, dotDuration: 3.0, dotStackCap: 1 } },
          { name: 'Brambles',     desc: '+12 DoT/tick; +1s',            cost: 265, stats: { dotDamage: 12, dotDuration: 1.0 } },
          { name: 'Thorn Storm',  desc: '+20 DoT/tick; stack +1',       cost: 615, stats: { dotDamage: 20, dotStackCap: 1 } },
          { name: 'Vine Prison',  desc: '+35 DoT/tick; +2s; slow (35%)',cost: 1400, stats: { dotDamage: 35, dotDuration: 2.0, projSlowFactor: -0.30 } },
        ],
      },
    },
  },

  wizard: {
    name: 'Wizard',
    cost: 225,
    damage: 45,
    range: 190,
    fireRate: 0.9,
    projSpeed: 320,
    aoeRadius: 0,
    ignoresArmour:    true,  // arcane magic bypasses physical armour from base
    reTargetOnDeath:  true,  // bolt re-targets nearest enemy if original target dies
    color: 0x7c3aed,
    projColor: 0xc4b5fd,
    upgrades: {
      pathA: {
        label: 'Arcane',
        tiers: [
          { name: 'Magic Bolt',    desc: '+30 dmg; pierce 1',             cost: 145, stats: { damage: 30, pierce: 1 } },
          { name: 'Arcane Blast',  desc: '+50 dmg; pierce 2',            cost: 340, stats: { damage: 50, pierce: 1 } },
          { name: 'Sorcery',       desc: '+80 dmg; pierce 3',            cost: 790, stats: { damage: 80, pierce: 1 } },
          { name: 'Grand Arcane',  desc: '+140 dmg; pierce 5; AoE 45',   cost: 1800, stats: { damage: 140, pierce: 2, aoeRadius: 45 } },
        ],
      },
      pathB: {
        label: 'Necro',
        tiers: [
          { name: 'Dark Magic',    desc: '+50 dmg; +1.5/s',              cost: 145, stats: { damage: 50, fireRate: 1.5 } },
          { name: 'Soul Rend',     desc: '+80 dmg; 40% vulnerability',   cost: 340, stats: { damage: 80, debuffVulnerability: 0.40, debuffDuration: 3.0 } },
          { name: 'Undeath',       desc: '+100 dmg; stronger debuff',    cost: 790, stats: { damage: 100, debuffVulnerability: 0.30, debuffDuration: 2.0 } },
          { name: 'Lich Form',     desc: '+180 dmg; AoE 60',             cost: 1800, stats: { damage: 180, aoeRadius: 60 } },
        ],
      },
    },
  },

  scattergun: {
    name: 'Scatter Gun',
    cost: 75,
    damage: 12,
    range: 90,
    fireRate: 1.5,
    projSpeed: 280,
    aoeRadius: 0,
    multiShot: 4,
    color: 0xec4899,
    projColor: 0xf9a8d4,
    upgrades: {
      pathA: {
        label: 'Ring of Fire',
        tiers: [
          { name: 'More Tacks',    desc: '+2 targets; +8 dmg',           cost:  50,  stats: { multiShot: 2, damage: 8 } },
          { name: 'Blade Ring',    desc: '+2 targets; +15 dmg',          cost: 110, stats: { multiShot: 2, damage: 15 } },
          { name: 'Firestorm',     desc: '+25 dmg; AoE 40; +2 targets', cost: 260, stats: { damage: 25, aoeRadius: 40, multiShot: 2 } },
          { name: 'Ring of Fire',  desc: '+40 dmg; AoE +40; +2 targets',cost: 600, stats: { damage: 40, aoeRadius: 40, multiShot: 2 } },
        ],
      },
      pathB: {
        label: 'Maelstrom',
        tiers: [
          { name: 'Blades',        desc: '+15 dmg; pierce 1; +0.5/s',   cost:  50, stats: { damage: 15, pierce: 1, fireRate: 0.5 } },
          { name: 'Buzz Saw',      desc: '+20 dmg; pierce 2; +0.5/s',   cost: 110, stats: { damage: 20, pierce: 1, fireRate: 0.5 } },
          { name: 'Blade Storm',   desc: '+30 dmg; pierce 3; +30 range',cost: 260, stats: { damage: 30, pierce: 1, range: 30 } },
          { name: 'Maelstrom',     desc: '+50 dmg; pierce 5; +40 range',cost: 600, stats: { damage: 50, pierce: 2, range: 40 } },
        ],
      },
    },
  },

  solartower: {
    name: 'Solar Tower',
    cost: 500,
    damage: 80,
    range: 220,
    fireRate: 1.5,
    projSpeed: 0,          // instant beam — no travelling projectile
    instant: true,
    instantStyle: 'beam',  // renderer style: clean straight beam
    aoeRadius: 0,
    color: 0xfbbf24,
    projColor: 0xfef08a,
    upgrades: {
      pathA: {
        label: 'Sunbeam',
        tiers: [
          { name: 'Solar Flare',   desc: '+80 dmg; pierce 2; +0.5/s',   cost: 325,  stats: { damage: 80, pierce: 2, fireRate: 0.5 } },
          { name: 'Dual Beams',    desc: '+100 dmg; +1 target',         cost: 750,  stats: { damage: 100, multiShot: 1 } },
          { name: 'Sunbeam',       desc: '+150 dmg; pierce 4; +40 rng', cost: 1750, stats: { damage: 150, pierce: 2, range: 40 } },
          { name: 'Solar Apex',    desc: '+300 dmg; +2 targets',        cost: 4000, stats: { damage: 300, multiShot: 2 } },
        ],
      },
      pathB: {
        label: 'Avatar',
        tiers: [
          { name: 'Sacred Fire',   desc: '+AoE 80; +100 dmg',            cost: 325,  stats: { aoeRadius: 80, damage: 100 } },
          { name: 'Holy Blast',    desc: '+AoE 50; +150 dmg',            cost: 750,  stats: { aoeRadius: 50, damage: 150 } },
          { name: 'Avatar',        desc: '+200 dmg; AoE +80; ignores arm',cost: 1750, stats: { damage: 200, aoeRadius: 80, ignoresArmour: true } },
          { name: 'Solgod',        desc: '+400 dmg; AoE +100; +1 target',cost: 4000, stats: { damage: 400, aoeRadius: 100, multiShot: 1 } },
        ],
      },
    },
  },

  trapper: {
    name: 'Trapper',
    cost: 125,
    damage: 35,
    range: 180,
    fireRate: 0.5,
    projSpeed: 150,
    aoeRadius: 0,
    leavesHazard: true,
    hazardDamage: 25,
    hazardRadius: 30,
    hazardDuration: 8.0,
    hazardTickRate: 0.5,
    color: 0x92400e,
    projColor: 0xd97706,
    upgrades: {
      pathA: {
        label: 'Bear Trap',
        tiers: [
          { name: 'Steel Jaw',     desc: '+40 dmg; +20 hazard dmg',      cost:  80, stats: { damage: 40, hazardDamage: 20 } },
          { name: 'Bear Trap',     desc: '+50 dmg; +3s trap duration',   cost: 190, stats: { damage: 50, hazardDuration: 3.0 } },
          { name: 'Titan Trap',    desc: '+80 dmg; +40 hazard dmg',      cost: 440, stats: { damage: 80, hazardDamage: 40 } },
          { name: 'Mega Trap',     desc: '+120 dmg; huge longer traps',  cost: 1000, stats: { damage: 120, hazardRadius: 20, hazardDuration: 4.0, hazardDamage: 60 } },
        ],
      },
      pathB: {
        label: 'Net Launcher',
        tiers: [
          { name: 'Glue Net',      desc: 'Nets slow to 30%; no trap',   cost:  80, stats: { projSlowFactor: 0.3, projSlowDuration: 2.0, leavesHazard: false } },
          { name: 'Heavy Net',     desc: '+40 dmg; AoE 50',             cost: 190, stats: { damage: 40, aoeRadius: 50 } },
          { name: 'Net Volley',    desc: '+0.4/s; +60 dmg',             cost: 440, stats: { fireRate: 0.4, damage: 60 } },
          { name: 'Super Net',     desc: '+80 dmg; AoE +60; to 10%',   cost: 1000, stats: { damage: 80, aoeRadius: 60, projSlowFactor: -0.20 } },
        ],
      },
    },
  },

  gravitywell: {
    name: 'Gravity Well',
    cost: 175,
    damage: 8,
    range: 200,
    fireRate: 0.4,
    projSpeed: 180,
    aoeRadius: 90,
    projSlowFactor: 0.50,
    projSlowDuration: 2.0,
    leavesHazard: false,
    hazardDamage: 0,
    hazardRadius: 80,
    hazardDuration: 5.0,
    hazardTickRate: 0.5,
    color: 0x6d28d9,
    projColor: 0xddd6fe,
    upgrades: {
      pathA: {
        label: 'Black Hole',
        tiers: [
          { name: 'Gravity Pull',  desc: 'Stronger pull (to 35%)',       cost: 115, stats: { projSlowFactor: -0.15 } },
          { name: 'Singularity',   desc: 'AoE +40; extreme pull (25%)', cost: 265, stats: { aoeRadius: 40, projSlowFactor: -0.10 } },
          { name: 'Dark Matter',   desc: '+AoE 40; +40 range; +2s',      cost: 615, stats: { aoeRadius: 40, range: 40, projSlowDuration: 2.0 } },
          { name: 'Black Hole',    desc: 'Near-freeze; AoE +60; +range', cost: 1400, stats: { projSlowFactor: -0.15, aoeRadius: 60, range: 40 } },
        ],
      },
      pathB: {
        label: 'Crusher',
        tiers: [
          { name: 'Crush Field',   desc: 'Leaves hazard zone; 20 dmg/tick', cost: 115, stats: { leavesHazard: true, hazardDamage: 20 } },
          { name: 'Gravity Crush', desc: '+30 hazard dmg; +0.2/s',       cost: 265, stats: { hazardDamage: 30, fireRate: 0.2 } },
          { name: 'Void Zone',     desc: '+50 hazard dmg; +40 h.radius', cost: 615, stats: { hazardDamage: 50, hazardRadius: 40 } },
          { name: 'Singularity',   desc: '+100 hazard; +3s duration',    cost: 1400, stats: { hazardDamage: 100, hazardDuration: 3.0 } },
        ],
      },
    },
  },
};
