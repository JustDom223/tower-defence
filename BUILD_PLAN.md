# Tower Defence — Build Plan & Goal List

A phased roadmap for building a Bloons-TD-inspired tower defence game in JavaScript. Work top to bottom: each phase produces something runnable before the next begins.

> **Progress tracking — keep this current.** As you finish each item, tick its box (`[ ]` → `[x]`) and update the **Status** line for that section (⬜ Not started · 🚧 In progress · ✅ Done). Tick items off as you go so progress stays trackable at a glance.

**Status: ✅ Complete — all phases 0–8 shipped (v1 game runs end to end).**

---

## 1. Vision

A 2D tower defence game where enemies travel along a fixed path and the player places towers to stop them. The heart of the game is a **deep, satisfying tower growth system** (Bloons-style two-path upgrades) and **flexible targeting** (First / Last / Close / Strong). Start small — **4 well-designed towers** — but lay foundations that scale to dozens of towers, enemy types, and maps without rewrites.

**Design pillars**
- Growth feels great: every upgrade is a visible, meaningful power spike.
- Targeting is a real decision: the player chooses how each tower picks its target.
- Data-driven: towers, upgrades, enemies, and waves are defined in config, not hard-coded in logic.
- Performance-first: the game stays at 60 FPS even with hundreds of enemies on screen.

---

## 2. Tech Stack (decided)

| Concern | Choice | Why |
|---|---|---|
| Rendering | **PixiJS (WebGL)** | Batched sprite rendering handles thousands of moving enemies without dropping frames. Canvas 2D would bottleneck on draw calls. |
| Game logic | **Vanilla JS (ES modules)** | All tower/targeting/upgrade logic is hand-written and renderer-agnostic. Keeps the foundation clean and portable. |
| Build tooling | **Vite** | Instant dev server, fast hot reload, simple production build. Zero-config to start. |
| Language | **JavaScript (JSDoc types)** | Start in JS; optionally migrate to TypeScript later. JSDoc gives editor hints without a compile step. |
| State/UI overlay | Plain DOM/HTML over the canvas | HUD, shop, and upgrade panel are regular HTML/CSS layered above the Pixi canvas — easiest to iterate on. |

**Hard rule:** game logic must never import from PixiJS directly. Rendering reads from the game state; the simulation never reaches into sprites. This separation is what lets the renderer be swapped or the game be headless-tested later.

---

## 3. Architecture Principles

These apply to every phase. Get them right early.

- **Fixed-timestep simulation, decoupled rendering.** The game updates in fixed steps (e.g. 60 updates/sec) regardless of frame rate; rendering interpolates between steps. This keeps physics/balance deterministic and smooth. Use an accumulator loop, not raw `requestAnimationFrame` deltas, for game logic.
- **State is plain data.** Enemies, towers, and projectiles are plain objects/arrays the simulation owns. Sprites are a *view* of that data, created/destroyed to match.
- **Data-driven definitions.** Towers, upgrade paths, enemies, and waves live in JSON-like config files. Adding content = editing data, not writing new classes.
- **Object pooling.** Enemies and projectiles are recycled from a pool, never created/garbage-collected mid-wave. This is the single biggest performance lever.
- **Systems over inheritance.** Prefer small systems (MovementSystem, TargetingSystem, CombatSystem) operating over arrays of entities rather than deep class hierarchies. Keeps it flat and fast.
- **Single source of truth for the path.** The map path is a list of waypoints; enemies store progress (distance travelled) along it. "Distance travelled" doubles as the natural sort key for First/Last targeting.

---

## 4. Performance Plan (handling many enemies)

Bake these in from the start rather than retrofitting:

1. **Sprite batching** — use a single texture atlas / sprite sheet so Pixi can batch all enemy draws into few GPU calls. Avoid mixing many separate textures.
2. **Object pools** — pre-allocate enemy and projectile pools at load. Reuse, don't `new`.
3. **Fixed timestep** — see above; prevents spiral-of-death slowdowns under load.
4. **Cheap targeting lookups** — keep enemies sorted (or bucketed) by path progress so a tower's "first/last enemy in range" query is fast. Use squared-distance for range checks (no `sqrt`).
5. **Spatial partitioning (when needed)** — once enemy counts are high, add a simple uniform grid so towers only test enemies in nearby cells, not every enemy. Defer this until profiling shows it's needed, but design the targeting API so it can be dropped in.
6. **Throttle non-critical work** — visual effects, UI refreshes, and target re-acquisition can run less often than the core sim.

---

## 5. The Four Starter Towers

Each tower has **two upgrade paths** (Bloons-style). The classic restriction applies: you can fully upgrade one path and only partially the other (e.g. max one path to tier 4, the other capped at tier 2). Tune the exact cap during balancing.

### Tower 1 — Dart Tower (the workhorse)
Cheap, single-target, fast. The tower you start every map with.
- **Path A — Sharp:** more pierce (one shot hits multiple enemies in a line) → longer range → bigger pierce → "Spike Storm" (rapid piercing volley).
- **Path B — Quick:** faster attack speed → even faster → triple-shot spread → "Buzzsaw" (continuous high-rate fire).

### Tower 2 — Bomb Tower (area damage)
Slow firing, explodes on impact for splash damage. Answer to grouped enemies.
- **Path A — Blast:** larger explosion radius → more damage → "Big One" (huge blast, screen-shaking) .
- **Path B — Rapid:** faster reload → cluster bombs (splits into smaller explosions) → "Carpet Bomb" (saturates an area).

### Tower 3 — Frost Tower (control)
Doesn't kill much; **slows** enemies in an area. Force-multiplier for everything else.
- **Path A — Deep Freeze:** stronger slow → brief freeze on hit → "Absolute Zero" (periodic full-area freeze).
- **Path B — Permafrost:** larger slow radius → longer slow duration → "Snowstorm" (slows + minor damage over time).

### Tower 4 — Marksman Tower (precision / global)
Long range, high single-target damage, slow fire. Eventually sees the whole map.
- **Path A — Power:** more damage → critical hits → "Headshot" (massive damage, ignores armour).
- **Path B — Watchful:** global range (targets anywhere on the map) → faster fire → "Sentry" (auto-acquires highest-value targets).

> These are starting designs — expect to rebalance numbers heavily once the loop is playable. The structure (2 paths, ~4 tiers, crosspath cap) is what matters.

---

## 6. Targeting System

Every tower exposes selectable targeting modes the player can cycle through. Implement these four first:

- **First** — enemy furthest along the path (closest to the exit). The default; protects your lives.
- **Last** — enemy least far along (just entered). Good for holding enemies back.
- **Close** — enemy nearest to the tower. Good for melee-range/AoE towers.
- **Strong** — enemy with the most remaining health/value.

Design the targeting API as a pluggable function: `selectTarget(tower, enemiesInRange, mode) -> enemy`. New modes (Weak, Smart, Track-lock) become new functions later. Keep the "in range" filtering separate from the "pick one" selection so both can be optimised independently.

---

## 7. Enemies

Start with a small ladder of enemy types so the targeting/upgrade systems have something to chew on:

- **Runner** — basic, low HP, normal speed.
- **Sprinter** — low HP, fast (tests First/Last targeting and slows).
- **Tank** — high HP, slow (tests Strong targeting and burst damage).
- **Splitter** — on death, spawns two Runners (tests AoE and stresses the object pool).

Enemies are data: `{ hp, speed, reward, onDeath?, sprite }`. Waves are data too: an ordered list of `{ enemyType, count, spawnInterval }` entries with a delay between waves.

---

## 8. Phased Goal List (the build order)

Each phase ends in a runnable, demoable state. Don't start a phase until the previous one runs.

### Phase 0 — Project setup
- [x] Scaffold Vite + PixiJS project; blank canvas renders, dev server runs.
- [x] Set up ES module structure: `/src/core`, `/src/systems`, `/src/entities`, `/src/data`, `/src/render`, `/src/ui`.
- [x] Add the fixed-timestep game loop (update accumulator + render with interpolation). Prove it with a single moving test sprite.

### Phase 1 — Map & path
- [x] Define a map as a background + a path (array of waypoints).
- [x] Render the path. A debug dot travels along it from start to exit using path-progress.

### Phase 2 — Enemies & waves
- [x] Enemy entity (plain data) + object pool.
- [x] MovementSystem advances enemies along the path by progress.
- [x] Data-driven enemy types (Runner, Sprinter, Tank, Splitter) and a wave spawner.
- [x] Enemies reaching the exit reduce player lives. Splitter spawns children on death.

### Phase 3 — Towers, targeting & combat
- [x] Tower placement: click an empty tile to place a Dart Tower; cost deducted from cash.
- [x] Range detection (squared distance) + TargetingSystem with **First** mode.
- [x] Towers fire projectiles (pooled); CombatSystem applies damage; dead enemies grant cash.
- [x] Add the other three targeting modes (Last, Close, Strong) and a UI control to cycle them per tower.

### Phase 4 — All four towers
- [x] Implement Bomb (splash), Frost (slow/status effect), and Marksman (long/global range) towers.
- [x] Generalise combat to support AoE and status effects (slow) cleanly via data, not special-casing.

### Phase 5 — The growth system (the centrepiece)
- [x] Define upgrade paths as data: each tower has 2 paths × ~4 tiers, each tier = stat deltas + optional new behaviour.
- [x] Upgrade UI: select a tower → see both paths, costs, and what each tier does → buy upgrades.
- [x] Enforce the crosspath cap (can't max both paths).
- [x] Make upgrade effects flow through the same data pipeline as base stats so a fully-upgraded tower is just "base + applied tiers".

### Phase 6 — Economy & game state
- [x] Cash, lives, current wave, score. Win condition (survive all waves) and lose condition (lives = 0).
- [x] Start/next-wave control; optional auto-start and fast-forward.

### Phase 7 — HUD & polish
- [x] HTML/CSS HUD overlay: cash, lives, wave counter, tower shop, sell button, upgrade panel.
- [x] Basic feedback: hit effects, range circles on hover/select, placement validity highlighting.
- [x] Sound hooks (even if silent placeholders) wired through one audio module.

### Phase 8 — Foundations for growth
- [x] Save/load game state (localStorage) — note: only for the real project, not sandbox artifacts.
- [x] Multiple maps loadable from data.
- [x] A "content guide" doc: how to add a new tower, enemy, upgrade, or map by editing data only.
- [x] (Optional) headless simulation test that runs a wave with no renderer — proves the logic/render split holds.

---

## 9. Definition of Done (per the foundation goals)

The foundation is solid when:
- Adding a new tower or enemy requires **only** editing data files + adding a sprite — no changes to core systems.
- The simulation runs without PixiJS imported anywhere in `/src/core` or `/src/systems`.
- 300+ enemies on screen hold 60 FPS on a mid-range laptop.
- Switching a tower's targeting mode visibly and correctly changes who it shoots.
- A maxed upgrade path produces a clearly more powerful tower than the base, driven entirely by data.

---

## 10. Growth Roadmap (after v1)

Once the above ships, the natural extensions are: more towers and a third upgrade path; "Smart" / target-lock targeting; flying & camo enemy types with tower keywords to counter them; boss enemies; abilities/active skills; multiple difficulties; a map editor; and a meta-progression layer. The data-driven design above is what makes each of these additive rather than a rewrite.
