# Content Guide — How to Add New Content

All game content is defined in data files. Adding towers, enemies, upgrades, maps, or waves never requires editing core systems.

---

## Adding a New Tower

Edit **`src/data/towers.js`**. Copy an existing entry and change the values:

```js
myTower: {
  name: 'My Tower',
  cost: 80,
  damage: 25,
  range: 180,
  fireRate: 1.2,    // shots per second
  projSpeed: 350,
  aoeRadius: 0,     // 0 = single-target; >0 = explosion radius in px
  isSlow: false,    // true = no projectile, applies slow pulse instead
  slowFactor: 1,    // 0.0–1.0 — fraction of normal speed (lower = slower)
  slowDuration: 0,  // seconds the slow lasts per pulse
  globalRange: false, // true = no range limit (Marksman Watchful path)
  color: 0x34d399,
  projColor: 0x6ee7b7,
  upgrades: {
    pathA: {
      label: 'Path A Name',
      tiers: [
        { name: 'Tier 1', desc: '+10 dmg', cost: 100, stats: { damage: 10 } },
        { name: 'Tier 2', desc: '+20 dmg', cost: 200, stats: { damage: 20 } },
        { name: 'Tier 3', desc: '+40 dmg', cost: 400, stats: { damage: 40 } },
        { name: 'Tier 4', desc: '+80 dmg', cost: 900, stats: { damage: 80 } },
      ],
    },
    pathB: { label: 'Path B Name', tiers: [ /* 4 tiers */ ] },
  },
},
```

Then add a buy button in **`index.html`** inside `#tower-shop`:

```html
<button class="tower-btn" data-tower="myTower">🏰 My Tower $80</button>
```

**Upgrade stat keys** (all additive deltas):
| Key | Effect |
|---|---|
| `damage` | Damage per hit |
| `range` | Detection radius in pixels |
| `fireRate` | Shots (or pulses) per second |
| `aoeRadius` | Explosion radius |
| `slowFactor` | Negative delta (e.g. `-0.1` makes slow stronger); clamped to 0.05 min |
| `slowDuration` | Seconds added to slow duration |
| `projSpeed` | Projectile speed in px/sec |
| `globalRange` | `true` to give unlimited range |

---

## Adding a New Enemy Type

Edit **`src/data/enemies.js`**:

```js
myEnemy: {
  hp: 200,
  speed: 55,
  reward: 18,
  radius: 14,
  color: 0xff6b6b,
  spawns: null,             // or { type: 'runner', count: 2 } to spawn children on death
  resistance: null,         // or { dart: 0.5, marksman: 0.5 } — damage fraction per tower type
},
```

**`resistance`** keys are tower type strings (`dart`, `bomb`, `frost`, `marksman`). A value of `0.5` means that tower deals half damage. Omit the key entirely for full damage. Works for both single-target hits and AoE splash.

Built-in types for reference:
| Type | Notes |
|---|---|
| `runner` | Baseline enemy |
| `sprinter` | Fast, low HP |
| `tank` | Slow, very high HP |
| `splitter` | Spawns 2 runners on death |
| `armoured` | Half damage from Dart & Marksman; use Bomb or Frost |
| `boss` | 2000 HP, wave 10 finale |

---

## Adding Waves (per-map)

Each map has its own wave file: **`src/data/waves-map1.js`** and **`src/data/waves-map2.js`**. Each exports a `WAVES` array where every element is one wave (an array of groups):

```js
export const WAVES = [
  // Wave 1
  [{ type: 'myEnemy', count: 8, interval: 0.9 }],
  // Wave 2 — two groups spawn sequentially
  [{ type: 'myEnemy', count: 5, interval: 0.6 },
   { type: 'runner',  count: 4, interval: 0.5 }],
  // ...up to wave 10
];
```

Groups in the same wave spawn sequentially with a 1.5-second pause between them. `main.js` selects the correct file based on `mapKey` — adding a new map requires creating a matching `waves-mapN.js` and adding it to the `WAVES_BY_MAP` lookup in `main.js`.

---

## Adding a New Map

Edit **`src/data/maps.js`**. Waypoints are `{ x, y }` world coordinates on the 1280×720 canvas. Start off the left edge, end off the right edge (or any edge):

```js
map3: {
  name: 'My Map',
  waypoints: [
    { x:    0, y: 360 },  // entry — left edge, mid height
    { x:  400, y: 360 },
    { x:  400, y: 180 },
    { x:  880, y: 180 },
    { x:  880, y: 540 },
    { x: 1280, y: 540 },  // exit — right edge
  ],
},
```

Then add a button in **`index.html`** inside `#map-panel`:

```html
<button class="map-btn" data-map="map3">My Map</button>
```

**Tips:**
- Keep waypoints on multiples of 40 px (the tile size) so the path aligns cleanly with the placement grid.
- The path renderer draws a 40 px wide road — segments closer than that may overlap visually.
- `blockPathTiles` automatically marks tiles within 30 px of the path as un-placeable.

---

## Crosspath Upgrade Cap

Two constants in **`src/systems/UpgradeSystem.js`** control the cap:

| Constant | Default | Meaning |
|---|---|---|
| `MAX_TIER` | 4 | Tiers per path |
| `CROSSPATH_CAP` | 2 | Max tiers on the cross-path when the other path is maxed |

So: a player can max one path to tier 4, but the other is then capped at tier 2.

---

## Adding a Tree Node (Meta-Progression Unlock)

Edit **`src/core/Profile.js`** — append an entry to `UNLOCK_TREE`:

```js
{
  id: 'my-tower-B',          // unique string, used as data-id on the buy button
  label: 'My Tower — Path B (Fast)',
  cost: 2,                   // stars to spend
  requires: 'my-tower',      // id of a prerequisite node (or null)
  check: p => p.unlocks.paths.myTower.B,   // returns true if already owned
  apply: p => { p.unlocks.paths.myTower.B = true; },  // mutates profile on purchase
},
```

Also add the initial unlock state to `defaultProfile()`:
```js
paths: {
  // ...existing...
  myTower: { A: false, B: false },
},
```

Helper functions (`isTowerUnlocked`, `isPathUnlocked`) read directly from the profile object — no other changes needed.

---

## Adding a Difficulty Tier

Edit **`src/data/difficulties.js`**:

```js
brutal: {
  key:          'brutal',
  label:        'Brutal',
  emoji:        '💀',
  hpMult:       2.0,
  speedMult:    1.4,
  starCap:      3,          // max stars earnable on this tier
  startingCash: 100,
},
```

Then add a button in **`index.html`** inside `#diff-selector`:
```html
<button class="diff-btn" data-diff="brutal">💀 Brutal</button>
```

The multipliers are applied in `WaveSpawner` at enemy spawn — no other system changes needed.

---

## Future mission path seam

The profile's `missions` map (`{ map1: 2, map2: 1, ... }`) and `DIFFICULTIES` are already the right shape for a linear campaign. When you're ready to build it:

1. Create `src/data/campaign.js` with an ordered list: `[{ mapKey, difficulty, label }, ...]`
2. Gate each entry behind the previous one's star rating using `profile.missions`
3. Render the campaign as a sequential path in the map-select hub rather than a flat list

No changes to the star economy, unlock tree, or difficulty system are needed.

---

## Architecture reminder

- Game logic (`src/core/`, `src/systems/`, `src/entities/`) must **never** import from PixiJS.
- Renderers (`src/render/`) read from state; they never write to it.
- Adding content = editing `src/data/` files only. No system changes needed.
- Meta-progression state lives in `tower-defence-profile-v1` (localStorage); run saves live in `tower-defence-v1`. Keep them separate.
