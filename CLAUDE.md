# Tower Defence — Working Instructions

## Roles

This project is worked in distinct **roles**. Identify which role you're in from the request — the user usually names it ("implement…", "play-test…", "game master…"). Read that role's brief and move forward. **Default to Implementer** if unspecified. One role per session; if a task clearly belongs to another role, say so rather than blurring them.

### Implementer (default)

You turn tickets into working code. Planning and tickets are written separately (see the plan docs below); your job is to make those items work, keep the codebase clean and consistent with what's already here, and keep the trackers up to date as you go. Implement what the tickets ask — if something is ambiguous or seems wrong, flag it rather than guessing at scope. Follow **How to pick up work**, **Git workflow**, **Testing**, and **Verification** below.

### Play-Tester

You measure how a map *actually* plays and surface balance, UX, and bugs from a real player's seat — you do **not** change game code. Deliver findings; the user routes fixes to the Implementer.

**Read first:** `SPEC_playtest-benchmark.md` (the benchmark + the metric catalogue), `IMPROVEMENTS/playtest-harness.js` (the in-browser harness, driven via the `window.__pt` dev hook in `main.js`).

**Tools:** use the **headless benchmark** (once built, per the SPEC) for deterministic, scaled, numeric runs; use the **in-browser harness** for "feel", screenshots, and spot-checks. Numbers come from headless; impressions from the browser.

**Method:**
- Test from the **right progression state**: a fresh profile (default unlocks only) for first-impressions, or the realistic unlock/perk set for the map's campaign slot. "Hard until upgrades" is a statement about progression — model it.
- Run the relevant **archetype(s)** (naive / competent / optimal); don't play optimally unless you're probing the ceiling. Difficulty is an *envelope*, not one run.
- Capture the **metrics in `SPEC_playtest-benchmark.md` §4** — above all per-wave `deepestReachPct` (margin), `livesLost`/wave, and `leaks` by enemy type; plus economy and final stars.
- Keep the sim **controlled**: disable auto-start, pause between waves, fixed speed. Known pitfall — leaving speed > 1× lets the 10s auto-start chain waves and run the game away from you.

**Deliverable:** a prioritised report — a per-wave pressure table first, then findings grouped (Balance / UX / Bugs), most-actionable first, pointing to files and lines. Run the loop on Sonnet; reserve an Opus pass for *interpreting* results.

### Game Master

You own the **macro / world layer**: the *curriculum* of content reveal across the campaign — which enemy types debut on which map and wave, in what order, and how threat ramps across a world (Forest = maps 1–10, Mountains = 11–20, Ruins = 21+). You shape `waves-map*.js` composition and map-level pacing (counts, intervals, the `hpMult` slope). You do **not** re-tune individual tower/enemy stat numbers (that's Balance/Implementer) — but flag when a missing counter makes an introduction unfair.

**Read first:** `src/data/enemies.js` (the roster, and the *mechanic* each enemy carries), all `src/data/waves-map*.js`, `src/data/maps.js` (worlds & order), `CONTENT_GUIDE.md`, `DESIGN_towers-and-enemies.md`, `SPEC_systems-new-mechanics.md`.

**Principles:**
- **One new thing at a time.** Each enemy's debut should introduce a single new mechanic/counter, be telegraphed, and arrive only after the player can plausibly answer it.
- **Space mastery.** Let the player handle one new type for a wave or two before stacking the next.
- **Escalate within a world; layer across worlds.** Map 1 teaches the basics with no surprises; each later map adds or recombines.
- **Curated, not scattered.** Mechanic-bearing enemies (splitter = spawns-on-death, shielded = absorb layer, carrier = live-spawns, regenerator, phantom = camo, flyer, etc.) each deserve a clean debut, not an arbitrary appearance.

**Founding mandate:** the Forest world's enemy introductions feel scattered. Define a deliberate **introduction curriculum** (table: enemy → debut map/wave → mechanic taught → counter the player has by then) and make the `waves-map*.js` edits to realise it.

**Deliverable:** the curriculum doc + the wave edits. Hand the result to the **Play-Tester** role to validate the resulting difficulty band before merging.

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

## Testing (use Sandbox mode)

Unless the fix or test is map-specific (e.g. a bug that only reproduces on a particular wave or map layout), always use **Sandbox mode** to spawn and test enemies, towers, and game features. Sandbox gives infinite cash and all towers unlocked, so you can test any combination without playing through waves.

To enter Sandbox from code: `pickMap('map1', null, 'sandbox')` — or click the **Sandbox** button on the main menu. From the browser console you can also call game state helpers directly.

## Verification (offload to a cheap model)

Before merging a ticket, delegate the check to the **`verifier`** subagent (defined in `.claude/agents/verifier.md`, runs on Haiku). Give it the ticket id and plan doc; it reviews the diff against the acceptance criteria, checks the build and the architecture rules, and returns PASS/FAIL. This keeps verification cheap and off your main context. See `SPEC_subagents.md` for setup. Use cheap-model subagents for other narrow checks too rather than doing them inline.

**Sub-agent model matching:**
- **Haiku** — low-judgement data work: multi-file lookups, locating symbols, structured extraction, bulk mechanical edits
- **Sonnet** — research needing synthesis: trade-off analysis, design decisions, suitability questions
- **Opus** — escalate (via sub-agent, not by switching chat) only when **both** apply: (1) multiple interpretations are plausible with materially different outcomes, and (2) getting it wrong has real downstream cost (broken systems, wasted effort, bad precedents). Flag it, delegate the specific question, fold the result back in.

## Tech stack

- **PixiJS 8** (WebGL) for rendering, **vanilla JS** (ES modules) for all game logic, **Vite** for tooling.
- Run the dev server with `npm run dev` (or `run-dev.cmd`). Build with `npm run build`.

> ⚠️ **Never open `index.html` directly in the browser.** The script tag uses `src="/src/main.js"` (an absolute path) and imports bare npm specifiers like `'pixi.js'`. Both require Vite to resolve — opening the file directly gives main.js a 404 and nothing runs. Always use `http://localhost:5173` via `npm run dev`.

> ⚠️ **GitHub Pages requires the build step.** GitHub Pages only serves static files; it cannot run `npm install`. The `.github/workflows/deploy.yml` workflow runs `npm run build` and deploys the `dist/` folder via GitHub Actions. The Pages source must be set to **GitHub Actions** (not "Deploy from a branch") in the repo settings. The `base: '/tower-defence/'` in `vite.config.js` ensures asset paths resolve correctly on the subdomain.

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
