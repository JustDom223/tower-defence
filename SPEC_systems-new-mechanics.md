# SPEC — New Mechanics (Shared Systems)

**Status: ⬜ Not started**

> These are the engine-level additions that multiple towers depend on.
> Build the system first, then the tower that uses it.

---

## Systems overview

| System | Needed by | Effort |
|---|---|---|
| **DoT** | Flamethrower, Alchemist-Toxin, Cryo-Avalanche | Medium |
| **Pierce** | Dart-Sharpshooter | Small |
| **Stun** | Cryo-Glacier | Small |
| **Multi-shot** | Marksman-Ranger | Small |
| **Buff Aura** | Command Post | Medium |
| **Income / kill-cash boost** | Generator | Medium |
| **Vulnerability debuff** | Alchemist-Corrosion | Small |
| **Mortar manual targeting** | Cannon-Mortar | Large |
| **Ground hazard** | Flamethrower-Wildfire | Medium |

Build order: DoT → Pierce → Stun → Multi-shot → Buff Aura → Income → Vulnerability → Mortar → Ground hazard.

---

## 1. DoT (Damage over Time)

### Enemy changes — `src/entities/Enemy.js`

Add to the created enemy object:
```js
dotStacks: [],   // [{ damage, tickRate, remaining, nextTick, ignoresArmour }]
```

### New system — `src/systems/DoTSystem.js`

```js
export function updateDoT(enemies, dt, damageEvents) {
  for (const e of enemies) {
    if (!e.dotStacks?.length) continue;
    for (let i = e.dotStacks.length - 1; i >= 0; i--) {
      const s = e.dotStacks[i];
      s.remaining -= dt;
      if (s.remaining <= 0) { e.dotStacks.splice(i, 1); continue; }
      s.nextTick -= dt;
      if (s.nextTick <= 0) {
        s.nextTick += 1 / s.tickRate;
        const dmg = s.ignoresArmour
          ? s.damage
          : Math.ceil(s.damage * (e.resistance?.dot ?? 1));
        e.hp = Math.max(0, e.hp - dmg);
        damageEvents.push({ x: e.worldX, y: e.worldY - e.radius, amount: dmg, full: s.damage, t: 0 });
      }
    }
  }
}
```

Call `updateDoT(state.enemies, dt, damageEvents)` in the game loop alongside `updateCombat`.

### Tower fields

Towers that apply DoT carry these base fields (0 = no DoT):
```js
dotDamage:       0,   // damage per tick
dotDuration:     0,   // seconds the stack lasts
dotTickRate:     1.0, // ticks per second
dotIgnoresArmour: false,
dotStackCap:     1,   // max concurrent stacks from the same tower type (default 1)
```

Add to `createTower` in `Tower.js`.

### On-hit DoT application — `CombatSystem.js`

In `onHit`, after dealing normal damage:
```js
if (p.dotDamage > 0) {
  const existingStacks = target.dotStacks.filter(s => s.sourceType === p.towerType);
  if (existingStacks.length < p.dotStackCap) {
    target.dotStacks.push({
      damage: p.dotDamage, tickRate: p.dotTickRate,
      remaining: p.dotDuration, nextTick: 1 / p.dotTickRate,
      ignoresArmour: p.dotIgnoresArmour, sourceType: p.towerType,
    });
  }
}
```

Add `dotDamage`, `dotDuration`, `dotTickRate`, `dotIgnoresArmour`, `dotStackCap` to the projectile acquire call so it carries the tower's values.

---

## 2. Pierce Projectiles

### How it works

Piercing projectiles travel in a fixed direction (toward the initial target position) and pass through enemies they hit, decrementing `pierceLeft` until it reaches 0. Unlike normal projectiles, they are NOT target-locked after the initial aim direction is set.

### Projectile changes — `src/entities/Projectile.js`

Add to projectile pool fields:
```js
pierceLeft: 0,    // remaining pierce-throughs; 0 = normal (stops on first hit)
pierceHit: null,  // Set of enemy IDs already hit by this projectile
dirX: 0, dirY: 0, // normalised travel direction (set at fire time for pierce shots)
```

### CombatSystem changes

At fire time, if `tower.pierce > 0`:
- Compute `dirX/dirY` toward target
- Set `p.pierceLeft = tower.pierce`
- Set `p.pierceHit = new Set()`

In `moveAndHitProjectiles`, piercing projectile movement:
- Travel along `dirX/dirY` at `p.speed` (not target-locked)
- Check ALL enemies (not just `p.target`) for proximity hit
- On hit: damage the enemy, add to `p.pierceHit`, decrement `p.pierceLeft`; only remove projectile when `pierceLeft < 0` or projectile travels off-canvas
- Skip enemies already in `p.pierceHit`

### Tower field

```js
pierce: 0,  // add to Tower.js createTower defaults
```

`applyTier` already handles additive number stats, so `{ pierce: 1 }` in upgrade stats works.

---

## 3. Stun

### Enemy changes

Add to enemy:
```js
stunTimer: 0,
```

### MovementSystem changes — `src/systems/MovementSystem.js`

At the top of the per-enemy update loop:
```js
if (e.stunTimer > 0) { e.stunTimer -= dt; continue; }
```

### CombatSystem changes

Add an `isStun` path alongside `isSlow`:
```js
if (tower.isStun) {
  applyStun(tower, enemies);
  tower.cooldown = 1 / tower.fireRate;
  continue;
}
```

```js
function applyStun(tower, enemies) {
  const rSq = tower.range * tower.range;
  for (const e of enemies) {
    const dx = e.worldX - tower.x, dy = e.worldY - tower.y;
    if (dx * dx + dy * dy <= rSq) {
      e.stunTimer = Math.max(e.stunTimer, tower.stunDuration);
    }
  }
}
```

### Tower fields

```js
isStun:       false,
stunDuration: 0,
```

---

## 4. Multi-shot

### How it works

When `tower.multiShot > 1`, `CombatSystem` finds up to `multiShot` targets (using `selectTopN`) and fires one projectile at each.

### TargetingSystem changes — `src/systems/TargetingSystem.js`

```js
export function selectTopNTargets(tower, enemies, n) {
  // Reuse selectTarget logic but collect up to n results.
  // Rank by the same criterion as the tower's targeting mode.
  // Return array (may be shorter than n if fewer enemies in range).
}
```

### CombatSystem changes

Replace the single-target fire block with:
```js
const count = tower.multiShot ?? 1;
const targets = count > 1
  ? selectTopNTargets(tower, enemies, count)
  : [selectTarget(tower, enemies)].filter(Boolean);
if (!targets.length) continue;
tower.angle = Math.atan2(targets[0].worldY - tower.y, targets[0].worldX - tower.x);
tower.cooldown = 1 / tower.fireRate;
for (const target of targets) {
  projectiles.push(projectilePool.acquire({ ..., target }));
}
```

### Tower field

```js
multiShot: 1,   // default; add to Tower.js
```

---

## 5. Buff Aura (Command Post)

### How it works

Each frame, before combat is evaluated, buff towers broadcast multipliers to nearby towers. Buffed stats are stored in `tower.buffedFireRate` etc. Combat uses the buffed values, not the base stats.

### CombatSystem changes

Add `applyBuffAuras(towers)` called at the top of `updateCombat`:
```js
function applyBuffAuras(towers) {
  // Reset
  for (const t of towers) {
    t.buffedFireRate = t.fireRate;
    t.buffedDamage   = t.damage;
    t.buffedRange    = t.range;
    t.camoVisible    = false;
  }
  // Apply
  for (const src of towers) {
    if (!src.isSupport) continue;
    const rSq = src.range * src.range;
    for (const t of towers) {
      if (t === src) continue;
      const dSq = (t.x - src.x) ** 2 + (t.y - src.y) ** 2;
      if (dSq > rSq) continue;
      if (src.buffFireRate) t.buffedFireRate *= (1 + src.buffFireRate);
      if (src.buffDamage)   t.buffedDamage   *= (1 + src.buffDamage);
      if (src.buffRange)    t.buffedRange    *= (1 + src.buffRange);
      if (src.camoDetect)   t.camoVisible    = true;
    }
  }
}
```

Replace `tower.fireRate`, `tower.damage`, `tower.range` with `tower.buffedFireRate`, etc. inside `updateCombat`. `tower.buffedRange` used for range-check `rSq`.

### Tower fields

```js
isSupport:   false,
buffFireRate: 0,   // fractional bonus, e.g. 0.15 = +15%
buffDamage:  0,
buffRange:   0,
camoDetect:  false,
// initialised each frame:
buffedFireRate: 0,
buffedDamage:   0,
buffedRange:    0,
camoVisible:    false,
```

---

## 6. Income & Kill-Cash Boost (Generator)

### Income per wave

After wave completion (wherever `onWaveClear` fires in `main.js`):
```js
const income = state.towers.reduce((sum, t) => sum + (t.incomePerWave ?? 0), 0);
if (income > 0) {
  state.cash += income;
  // push a toast/damage-number event so the player sees it
}
```

### Kill-cash boost

Locate where enemy death rewards cash (likely `main.js` kill handler or `CombatSystem`). When an enemy is killed, check for nearby generators:
```js
const boost = state.towers
  .filter(t => t.killCashBoostRange > 0)
  .some(t => (t.x - e.worldX)**2 + (t.y - e.worldY)**2 <= t.killCashBoostRange**2)
  ? state.towers
      .filter(t => t.killCashBoostRange > 0 && (t.x-e.worldX)**2+(t.y-e.worldY)**2 <= t.killCashBoostRange**2)
      .reduce((m, t) => m + t.killCashBoostMult, 0)
  : 0;
const reward = Math.round(e.cashReward * (1 + boost));
state.cash += reward;
```

### Tower fields

```js
incomePerWave:      0,
killCashBoostRange: 0,
killCashBoostMult:  0,
```

---

## 7. Vulnerability Debuff

### Enemy changes

```js
vulnerabilityMult:  1.0,
vulnerabilityTimer: 0,
```

In `MovementSystem` (or a general enemy-status tick):
```js
if (e.vulnerabilityTimer > 0) {
  e.vulnerabilityTimer -= dt;
  if (e.vulnerabilityTimer <= 0) e.vulnerabilityMult = 1.0;
}
```

### CombatSystem — `applyDamage`

```js
const resistMult = (p.ignoresArmour || p.dotIgnoresArmour)
  ? 1 : (e.resistance?.[towerType] ?? 1);
const vulnMult = e.vulnerabilityMult ?? 1.0;
const damage = Math.ceil(rawDamage * resistMult * vulnMult);
```

### On-hit application

In `onHit`, after normal damage, if projectile tower has `debuffVulnerability > 0`:
```js
target.vulnerabilityMult  = tower.debuffVulnerability;   // stored on projectile
target.vulnerabilityTimer = tower.debuffDuration;
```

### Tower fields

```js
debuffVulnerability: 0,  // multiplier applied to enemy (e.g. 1.25 = enemy takes 25% extra)
debuffDuration:      0,
```

---

## 8. Mortar Manual Targeting

### How it works

A cannon tower on Mortar path tier 2+ can have a fixed `mortarTargetX/Y` coordinate. It fires ballistic (AoE) projectiles at that point regardless of range. The player sets the target by clicking a "Set Target" button in the tower panel.

### Tower fields

```js
mortarMode:    false,  // true once Mortar tier 2 purchased
mortarTargetX: null,
mortarTargetY: null,
```

### CombatSystem changes

If `tower.mortarMode && tower.mortarTargetX !== null`:
- Skip `selectTarget` range check entirely
- Fire ballistic projectile toward `mortarTargetX/Y` (existing ballistic path)

### UI changes — `GameUI.js` tower panel

When selected tower has `mortarMode: true`, render a "📍 Set Target" button. Clicking it sets a global `ui.mortarSetMode = tower` flag.

In `main.js` canvas click handler: if `ui.mortarSetMode` is set, record the click position as `tower.mortarTargetX/Y` and clear the flag. Render a crosshair sprite on the map at that position.

### TowerRenderer changes

Draw a red `✕` marker at `tower.mortarTargetX/Y` if set. Render a dotted line from tower to marker.

---

## 9. Ground Hazards

### State

Add `state.groundHazards = []` in `main.js` initial state.

Each hazard:
```js
{ x, y, radius: 30, damage: N, tickRate: 0.5, remaining: 4.0, nextTick: 0.5, sourceType: 'flamethrower' }
```

### New system — `src/systems/GroundHazardSystem.js`

```js
export function updateGroundHazards(hazards, enemies, dt, damageEvents) {
  for (let i = hazards.length - 1; i >= 0; i--) {
    const h = hazards[i];
    h.remaining -= dt;
    if (h.remaining <= 0) { hazards.splice(i, 1); continue; }
    h.nextTick -= dt;
    if (h.nextTick > 0) continue;
    h.nextTick += 1 / h.tickRate;
    const rSq = h.radius * h.radius;
    for (const e of enemies) {
      const dSq = (e.worldX - h.x)**2 + (e.worldY - h.y)**2;
      if (dSq <= rSq) {
        e.hp = Math.max(0, e.hp - h.damage);
        damageEvents.push({ x: e.worldX, y: e.worldY - e.radius, amount: h.damage, full: h.damage, t: 0 });
      }
    }
  }
}
```

Call in game loop. Render hazards in `TowerRenderer` or a dedicated `GroundHazardRenderer` as orange translucent circles.

### Tower field

```js
leavesHazard:         false,
hazardDamage:         0,
hazardRadius:         30,
hazardDuration:       4.0,
hazardTickRate:       0.5,
```

On projectile hit, if `tower.leavesHazard`:
```js
state.groundHazards.push({
  x: p.x, y: p.y, radius: tower.hazardRadius,
  damage: tower.hazardDamage, tickRate: tower.hazardTickRate,
  remaining: tower.hazardDuration, nextTick: 1 / tower.hazardTickRate,
});
```

---

## Files to change

| File | Change |
|---|---|
| `src/entities/Enemy.js` | Add `dotStacks`, `stunTimer`, `vulnerabilityMult/Timer` |
| `src/entities/Tower.js` | Add all new tower fields to `createTower` |
| `src/entities/Projectile.js` | Add `pierceLeft`, `pierceHit`, `dirX/Y`, `dotDamage/Duration/TickRate/IgnoresArmour/StackCap`, `debuffVulnerability/Duration` |
| `src/systems/CombatSystem.js` | Stun branch, pierce movement, multi-shot fire, buff aura application, vulnerability in `applyDamage`, DoT on-hit, mortar mode, ground hazard spawn |
| `src/systems/MovementSystem.js` | Skip movement if `stunTimer > 0`; decrement `vulnerabilityTimer` |
| `src/systems/TargetingSystem.js` | Add `selectTopNTargets` |
| `src/systems/DoTSystem.js` | **New file** |
| `src/systems/GroundHazardSystem.js` | **New file** |
| `src/ui/GameUI.js` | Mortar "Set Target" button in tower panel |
| `src/render/TowerRenderer.js` | Mortar target marker; ground hazard circles |
| `src/main.js` | Mortar click mode; wave-clear income; kill-cash boost hook; call new systems |
