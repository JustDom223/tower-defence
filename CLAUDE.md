# Tower Defence — Working Instructions

## Your role

You are the **implementer** for this game. Planning and tickets are written separately (see the plan docs below); your job is to turn those items into working code, keep the codebase clean and consistent with what's already here, and keep the trackers up to date as you go. Implement what the tickets ask — if something is ambiguous or seems wrong, flag it rather than guessing at scope.

## How to pick up work

1. Open **`ROADMAP.md`** (status-at-a-glance table) and the active **`SPEC_*.md`** ticket docs. Open items are unchecked boxes (`[ ]`); a section's **Status** line shows ⬜ / 🚧 / ✅.
2. Implement the relevant item end to end. Every item should leave the game **runnable** — don't half-land a phase.
3. **Test before ticking:** run `npm run dev`, exercise the change in the browser, and confirm the acceptance criteria in the ticket.
4. When done, **tick the box (`[ ]` → `[x]`) and update the section's Status line** in the same doc. This is how progress is tracked — keep it current.

## Git workflow (use branches — keep `main` runnable)

Work happens on branches and merges into `main`. Never develop directly on `main`.

- **`main` is always runnable.** Never commit a half-landed phase to `main` — if `npm run dev` wouldn't start cleanly, it doesn't belong there.
- **One branch per ticket.** Before starting an item, branch from an up-to-date `main`. Name it by type + ticket id: `feat/C1-map-unlock`, `fix/mute-pointer-events`, `chore/git-setup`, `docs/...`. One ticket per branch — don't mix unrelated changes.
- **Commit small and often**, with clear messages prefixed by type and ticket id, e.g. `feat(C1): gate map select by star rating`. Referencing the ticket keeps history aligned with the plan docs.
- **Finish the ticket on its branch:** implement → run `npm run dev` and confirm the ticket's acceptance criteria → tick the checkbox + Status line in the plan doc and commit that doc update on the same branch.
- **Merge only when the ticket is done and the game runs.** Merge into `main` with `--no-ff` (one traceable commit per ticket), then delete the branch. Never merge a branch that leaves `main` broken.
- **Never commit `node_modules/` or build output.** `.gitignore` must cover `node_modules/`, `dist/`, and local env files.
- Optionally tag notable milestones (e.g. `v1`, `campaign`) on `main`.

**First-time setup (if the repo isn't initialised yet):** `git init`; add a `.gitignore` containing `node_modules/`, `dist/`, `.DS_Store`; commit the current working tree on `main`; *then* open the first feature branch. Do this before any other ticket.

## Tech stack

- **PixiJS 8** (WebGL) for rendering, **vanilla JS** (ES modules) for all game logic, **Vite** for tooling.
- Run the dev server with `npm run dev` (or `run-dev.cmd`). Build with `npm run build`.

## Architecture rules (do not break these)

- **Logic/render separation is the load-bearing rule.** Nothing in `src/core`, `src/systems`, `src/entities`, or `src/data` may import `pixi.js`. Game state is plain data the simulation owns; renderers in `src/render` *read* that state to draw. The simulation must be able to run with no renderer attached.
- **Fixed-timestep simulation.** Game logic updates in fixed steps via the accumulator loop in `GameLoop`; rendering interpolates. Don't tie game logic to raw frame deltas.
- **Object pooling.** Enemies and projectiles come from pools (`ObjectPool`) — acquire/release, never create them per-frame.
- **Data-driven content.** Towers, enemies, maps, waves, and difficulties are defined in `src/data/`. Adding content means editing data, not core systems — see **`CONTENT_GUIDE.md`**.
- **Systems over inheritance.** Behaviour lives in small systems operating over arrays of entities, not deep class hierarchies.
- **Two separate save channels:** the mid-run checkpoint (`SaveSystem`, key `tower-defence-v1`) and the persistent meta-progression profile (`Profile`, key `tower-defence-profile-v1`). Keep them distinct.

## Project structure

```
index.html              DOM shell, all CSS, and HUD/overlay markup
src/main.js             Composition root — wires state, systems, renderers, UI, input

src/core/               Engine + persistence (no game-specific logic leaks here)
  GameLoop.js           Fixed-timestep loop
  Path.js  Grid.js      Path waypoints; tower-placement grid
  ObjectPool.js         Generic pool used by enemies/projectiles
  SaveSystem.js         Mid-run checkpoint (per-wave)
  Profile.js            Meta-progression: stars, unlock tree, difficulty unlocks

src/data/               ALL content/config (edit here to add content)
  towers.js enemies.js maps.js difficulties.js
  waves-map1.js waves-map2.js

src/entities/           Entity factories + pools (Enemy, Projectile, Tower)
src/systems/            Pure game logic — Movement, Targeting, Combat, Upgrade, WaveSpawner
src/render/             PixiJS views — Enemy/Path/Projectile/Tower/DamageNumber/Particle renderers
src/ui/                 GameUI — DOM HUD, shop, tower panel, overlays
src/audio/              AudioManager — synthesised Web Audio sounds
```

Key conventions worth knowing: tower upgrade paths use the keys `pathA` / `pathB` (path chars `'A'`/`'B'`) with a crosspath cap in `UpgradeSystem`; targeting modes are First / Last / Close / Strong via a pluggable `selectTarget`; enemy resistances are a `resistance: { towerType: multiplier }` map.

## Plan & reference docs

- **`ROADMAP.md`** — replayability phases (R1–R6) with live status; start here for what's next.
- **`SPEC_*.md`** — focused ticket docs for current work (e.g. `SPEC_pause-audio-bomb.md`). Tick items off as you complete them.
- **`BUILD_PLAN.md`** — the original v1 build (phases 0–8, complete). Historical reference for how the foundation was laid.
- **`META_PROGRESSION.md`** — the star/unlock-tree system design (M0–M6, complete).
- **`CONTENT_GUIDE.md`** — how to add a tower, enemy, upgrade, map, or wave using only data files.
