# SPEC — Play-Test Benchmark Harness

**Status:** ⬜ Not started
**Owner of intent:** Dominic (balance goal below). **Implementer:** sub-agent(s).
**Goal in one line:** Build a deterministic, headless simulation harness that runs maps under defined player strategies and emits rich per-wave telemetry, so map difficulty can be measured and tuned — not guessed.

---

## 0. Why this exists (the balance goal)

Map 1 should be a stomp (familiarisation). **From Map 2 onward the player should *not* finish taking zero damage** — the design target is that an under-upgraded player earns **1 star** on a map until their meta-progression unlocks change that. Stars are a pure function of lives kept (`computeStars` in `main.js`: 3★ ≥90% lives, 2★ ≥50%, else 1★; `starCap` is 2 on Normal, 3 on Hard). So "1 star" means **finishing with 1–9 of 20 lives** — i.e. a damage budget of 11–19 lives that should be *spread across waves*, not dumped by one wall wave.

We cannot judge that from one human-style playthrough. The end-of-wave snapshot used so far hides the key fact: a wave cleared with the furthest enemy at 40% of the path is trivial; the same wave cleared with it at 95% was a near-leak. **Identical end-state, opposite difficulty.** This benchmark exists to capture pressure/margin, across a difficulty *envelope* (multiple player skill levels × realistic progression states), reproducibly.

---

## 1. Success criteria

1. One command runs a **scenario matrix** (maps × difficulties × player archetypes × progression states × seeds) headlessly, in seconds, with no browser.
2. Each run emits structured per-wave telemetry (schema in §4) to disk as JSON + a rolled-up CSV + a human-readable Markdown balance report.
3. The harness reuses the **real game systems** (no re-implemented combat) so results reflect the shipping logic.
4. Results are **deterministic** for a given seed, and reproducible across machines.
5. A regression anchor passes: the *Competent* archetype on Map 1 / Normal / fresh profile reproduces the known baseline within tolerance (see §10).

---

## 2. What already exists (build on, don't duplicate)

- **Dev hook:** `window.__pt = { state, ui, loop, renderer, paths, profile }` at the end of `main()` in `src/main.js` — drives/reads the *in-browser* game.
- **In-browser harness:** `IMPROVEMENTS/playtest-harness.js` — a console script that drives the real UI (synthetic canvas clicks, `ui.onUpgrade`, `ui.onStartWave`) and reads live state. **Keep this** as the manual *visual* spot-check tool. The benchmark below is the *scaled, headless* engine; the two are complementary.
- **Known Map 1 baseline (in-browser, competent-ish play, fresh/Normal):** win with 19/20 lives, ★★; exactly one runner leaked on wave 1 (kill census: 83 of 84 runners killed); no console errors. Use as the regression anchor.

---

## 3. Architecture decision — headless simulation engine

The codebase's **logic/render separation is load-bearing** (per `CLAUDE.md`): nothing in `src/core`, `src/systems`, `src/entities`, `src/data` imports `pixi.js`, and "the simulation must be able to run with no renderer attached." We exploit that directly: run the real systems in Node with no renderer, no UI, no audio, at unbounded speed.

**Problem:** the actual per-tick update *sequence* currently lives inside the `update(dt)` closure of the `GameLoop` created in `main()` (`src/main.js`), interleaved with UI/audio side-effects (`AudioManager.play`, `showInterestToast`, `showBossWarning`, `ui.*`, `saveGame`). The headless harness must run the **exact same tick logic** or results drift from the real game.

**Recommended path (do this): extract a render-free `Simulation` module** that owns the tick, with all side-effects injected as callbacks. `main.js` then consumes it (single source of truth); the headless harness consumes the same module. Fallback if extraction is rejected: copy the tick sequence into the harness and accept drift risk — *not recommended*.

The tick sequence to preserve (from `src/main.js` `update(dt)`):
```
tickWaveEnd → (auto-start handling) → updateMovement → updateCombat
→ updateDoT → updateGroundHazards → applyHealerAuras → ageAndCullEvents
→ processEnemies → checkGameOver
```
Side-effects to turn into injected hooks (no-op in headless): `AudioManager.play`, `showInterestToast`, `showBossWarning`, `saveGame`/`saveProfile`, all `ui.*`. The helpers `tickWaveEnd`, `applyHealerAuras`, `processEnemies`, `ageAndCullEvents`, `checkGameOver` move into the module; replace their DOM/audio calls with `events.emit(...)`.

---

## 4. The data to capture (this is the heart of it)

Capture by **sampling state each tick during a wave** and accumulating per-wave aggregates (don't store raw per-tick — too big). Grouped by what it tells you for balance.

### 4a. PRESSURE / MARGIN (most important — answers "was this actually hard?")
- **`deepestReachPct`** — max over the wave of `enemy.distance / path.totalLength` for any enemy (per path on multi-path maps; record the max and which path). The single best margin number. ~1.0 = near-leak; <0.6 = trivial.
- **`livesLost`** — lives at wave start minus wave end. The direct difficulty signal, attributed *per wave*.
- **`leaks`** — count of enemies that reached the end, **broken down by enemy type**. Tells you *which* enemy is breaking through (→ which counter the player lacks). Capture by recording type in `processEnemies` at the leak branch (`e.distance >= path.totalLength`).
- **`peakConcurrent`** — max simultaneous live enemies. Clog / DPS-saturation signal.
- **`firstBloodPct`** — path % at which the first enemy of the wave dies. Low = front-loaded defence; high = back-loaded / leaky.

### 4b. THROUGHPUT / DPS WALLS (answers "where does the player's damage fall short?")
- **`clearTimeSec`** — game-seconds from wave start to wave clear.
- **`spawnDurationSec`** vs **`combatTailSec`** — time to finish spawning vs time after last spawn until cleared. A long tail = the wave out-tanks the player's DPS (the interesting case); a short tail = spawn-paced/trivial.
- **`totalRawHp`** and **`totalEffectiveHp`** — sum of enemy HP in the wave, raw and after applying that run's resistance profile against the towers actually present. The gap exposes resistance walls (e.g. armoured halving archer damage, the boss).
- **`damageDealt`** (optional, higher effort) — sum of damage events in the wave → realised tower throughput; with `totalEffectiveHp` gives an overkill estimate.

### 4c. ECONOMY (answers "could they have afforded a defence?")
- **`cashStart`, `cashEnd`, `cashEarned`** (kills + wave bonus + interest + tower income), **`cashSpentDuringWave`**.
- **`idleCash`** — cash sitting unspent at wave start (loose economy indicator; Map 1 ran loose — 550+ banked by wave 6).

### 4d. OUTCOME (per run)
- `map`, `diffKey`, `archetype`, `progressionPreset`, `seed`.
- `finalLives`, `starRating` (via `computeStars`), `score`, `totalKills`, `win` (bool), `lossWave` (if lost).

### 4e. BUILD LOG (reproducibility / explainability)
- Ordered list of player actions: `{wave, action: place|upgrade|sell, type/path, x, y, cost}`. Lets you replay *why* a result happened and diff archetypes.

### 4f. DERIVED (analysis layer, §8)
- **Pressure curve**: `deepestReachPct[]` and `livesLost[]` per wave — is difficulty rising monotonically?
- **Trivial-wave flag**: `deepestReachPct < 0.6 && livesLost == 0`.
- **Wall-wave flag**: `livesLost` spike (> some share of remaining lives) or loss.
- **Difficulty band**: `finalLives(Naive)` vs `finalLives(Competent)` for the same map/progression.

---

## 5. Implementation phases

Each phase leaves the repo runnable, on its own branch per `CLAUDE.md` workflow. Verify with `npm run dev` where the browser game is touched.

### Phase 1 — Extract render-free `Simulation` (refactor)
- **New:** `src/core/Simulation.js` (or `src/sim/Simulation.js`). Exposes:
  ```js
  createSimulation({ mapKey, diffKey, waves, profile, perks, seed, sandbox=false, events })
    -> { state, step(dt), startWave(i), get paths, get waves }
  ```
  `events` is an emitter (`{ emit(name, payload) }`); the sim calls `events.emit('wave-clear')`, `'interest'`, `'boss-warning'`, `'enemy-killed'`, `'enemy-leaked'`, `'game-over'`, `'win'` instead of touching audio/DOM/UI.
- Move `tickWaveEnd`, `applyHealerAuras`, `processEnemies`, `ageAndCullEvents`, `checkGameOver`, `computeStars` into the module (or a shared helper they both import). Strip DOM/audio/`saveGame` calls → emit events.
- **`main.js` change:** build the sim via `createSimulation`, subscribe an "adapter" that maps events back to `AudioManager`/`showInterestToast`/`showBossWarning`/`saveGame`/`ui.*`, and call `sim.step(dt)` in the loop's `update`. Renderers still read `sim.state`.
- **Gotcha — `import.meta.glob`:** the `WAVES_BY_MAP` builder in `main.js` uses Vite's `import.meta.glob`, which is **Vite-only** and will break under Node. The Simulation module must accept `waves` as a parameter; the headless runner imports wave modules explicitly (or via a static map), not via glob.
- **Acceptance:** browser game plays identically (run `npm run dev`, clear a wave, confirm audio/toasts/interest/boss-warning/save all still fire; no console errors).

### Phase 2 — Headless runner + determinism
- **New:** `benchmark/run.mjs` (Node ESM; project is `"type":"module"`, sim modules use explicit `.js` imports so Node resolves them with no bundler).
- Stub the browser globals the sim path may touch (`localStorage` for `saveGame`/`Profile`, etc.) or ensure those are behind injected hooks from Phase 1.
- **Determinism:** audit `Math.random` across sim code paths (`src/systems`, `src/entities`, `src/core`, `processEnemies`). Death particles are render-only (ignore), but verify spawn/targeting/any combat randomness. Route all *sim* randomness through a **seeded PRNG** (e.g. mulberry32) passed in via `createSimulation({seed})`. Fixed timestep already deterministic given fixed `dt`.
- **CRITICAL gotcha — module-singleton bleed:** `enemyPool` and `projectilePool` (`src/entities/*`) are **module-level singletons**, and `CombatSystem` holds module-level buff state (`markBuffsDirty`). Running multiple sims in one process will bleed state between runs. The harness **must reset pools and buff state between runs** (add a `reset()` to the pools and a buff reset, or instantiate per-run pools). Call this out loudly — it will silently corrupt batch results otherwise.
- Drive waves explicitly (set `autoStartTimer` disabled; controller calls `startWave`, steps `dt` until `!waveActive && spawnerDone && enemies.length === 0`, then next).
- **Acceptance:** runs Map 1 to completion headlessly with a **no-tower** player → every wave leaks, lives reach 0 at the expected wave; runtime < ~1s per run.

### Phase 3 — Telemetry recorder  ✅ (in-browser path done)
- **Implemented:** `src/core/Telemetry.js` — a pure recorder (no pixi/DOM) wired into the live game loop in `main.js` via five hooks (`waveStart` / `tick` / `onLeak` / `onKill` / `waveEnd`). Captures per-wave `deepestReachPct`, `livesLost`, `leaks` by type, `peakConcurrent`, `firstBloodPct`, `clearTimeSec`/`spawnDurationSec`/`combatTailSec`, and cash boundaries. Read live via `window.__pt.telemetry` (`.log`, `.summary()`, `.export()`). Because it's render-free it drops straight into the headless harness once Phase 1 lands.
- **Still to do (headless path):** call the same recorder from `benchmark/run.mjs` and roll multiple runs into the matrix output (§5–7). Deferred: `cashSpentDuringWave` (needs hooking place/upgrade/sell) and `damageDealt`/overkill.
- **Acceptance — MET (browser):** no-tower Map 1 run produced `leaks {runner: 8}`, `deepestReachPct 1.0`, `peakConcurrent 8`, lives/cash populated; 2-archer run produced `deepestReachPct 0.6`, 0 leaks.

### Phase 4 — Placement planner + player archetypes
- **New:** `benchmark/placement.js` — generates candidate tower positions by sampling points at perpendicular offsets (e.g. ±45–90px) from each path segment, filtering via the real `isPositionFree` (`src/core/Grid.js`), and scoring each by **coverage** (path length within `range`). Reusable by all archetypes.
- **New:** `benchmark/archetypes/*.js` — each exports a **policy**:
  ```js
  policy(ctx) -> actions[]   // ctx: { state, cash, waveIndex, unlockedTowers, planner }
                              // actions: { kind:'place'|'upgrade'|'sell', ... }
  ```
  Called at each **wave start** (and optionally when cash crosses a threshold mid-wave). See §6 for the three required archetypes.
- **Acceptance:** *Competent* on Map 1 / Normal / fresh ≈ the §10 baseline (≈19 lives, single leak on wave 1, within tolerance).

### Phase 5 — Progression model + scenario matrix
- **New:** `benchmark/progression.js` — given a campaign index, returns a plausible profile (`unlocks`/`perks`) for a player who has been getting ~1★ on prior maps. Spend order follows a defined priority over `UNLOCK_TREE` (`src/core/Profile.js`). Provide named presets too: `fresh`, `early`, `mid`, `late`.
- **New:** `benchmark/matrix.mjs` — iterates `maps × {normal,hard} × {naive,competent,optimal} × progression × seeds[]`, runs each, writes results. Multi-seed → report mean/variance per metric (robustness; archetypes may have minor stochasticity).
- **Acceptance:** produces a full results set for Maps 1–N without singleton bleed (verify run K is independent of run K-1).

### Phase 6 — Analysis & balance report
- **New:** `benchmark/report.mjs` — reads results, emits `playtest-results/<timestamp>/REPORT.md` with, per map:
  - pressure curve (`livesLost` + `deepestReachPct` per wave, small table or ASCII sparkline),
  - economy curve,
  - **flags:** trivial waves, wall waves, and **target-band check** (does the *expected-progression* player land in the 1★ band on Maps 2+? is Map 1 still a stomp?),
  - difficulty band (naive vs competent finalLives).
- **Acceptance:** report clearly flags Map 1 as low/no-pressure (the current state) and shows the per-wave pressure series.

### Phase 7 (optional) — polish
- Multi-seed averaging surfaced in the report; CSV export for spreadsheets; a `--map`/`--archetype` CLI filter for quick single runs.

---

## 6. Player archetypes (the difficulty envelope)

Three deterministic policies; the spread between them is the map's difficulty band.

- **Naive** (lower bound): clusters towers near the entry; buys the cheapest available tower repeatedly; upgrades late and unfocused; reacts slowly to new enemy types. Models a first-timer.
- **Competent** (target): spreads coverage along the path (uses planner coverage score); balances new towers vs upgrades; pushes DPS ahead of known threat waves (tanks/armoured/boss). Models an engaged player. **This is the archetype the target bands are written against.**
- **Optimal-ish** (upper bound): economy- and coverage-aware greedy heuristic approximating strong play. Models the ceiling.

Keep policies pure and seedable. Target tuning outcome: **Naive ≈ 1★ or loss, Competent ≈ 2★** on a well-tuned non-trivial map at the expected progression.

---

## 7. Output schema (sketch)

```jsonc
{
  "run": { "map":"map2", "diff":"normal", "archetype":"competent",
           "progression":"expected", "seed":1,
           "finalLives":11, "stars":2, "score":0, "win":true, "lossWave":null },
  "waves": [
    { "wave":1, "comp":[{"type":"runner","count":8}],
      "livesStart":20, "livesEnd":20, "livesLost":0,
      "deepestReachPct":0.62, "deepestPath":0, "firstBloodPct":0.18,
      "leaks":{"count":0,"byType":{}}, "peakConcurrent":5,
      "clearTimeSec":14.2, "spawnDurationSec":7.0, "combatTailSec":7.2,
      "totalRawHp":480, "totalEffectiveHp":720,
      "cashStart":25,"cashEnd":149,"cashEarned":124,"cashSpent":100,"idleCash":25 }
  ],
  "build": [ {"wave":0,"kind":"place","type":"archer","x":130,"y":240,"cost":50} ]
}
```

---

## 8. Open choices for the implementer (flag, don't block)

- **Extract vs copy the tick** (§3): recommend extract. Confirm before doing the refactor if it touches `main.js` heavily.
- **Runner:** plain `node benchmark/run.mjs` vs **Vitest** for the acceptance tests. Recommend Vitest (devDependency) for §10 assertions + a plain Node CLI for batch matrix runs.
- **Mid-wave decisions:** archetypes act at wave-start only (simpler) vs also on cash thresholds (more realistic). Start with wave-start only.
- `damageDealt`/overkill (§4b) is higher effort — defer to Phase 7 if it complicates Phase 3.

---

## 9. Known gotchas (read before coding)

1. **Module-singleton bleed** between runs: `enemyPool`, `projectilePool`, `CombatSystem` buff state. **Must reset between runs.** (See Phase 2.)
2. **`import.meta.glob`** in `main.js` is Vite-only — headless must pass `waves` explicitly.
3. **`autoStartTimer`** auto-launches the next wave 10s after a clear — disable it in the benchmark; the controller drives wave starts.
4. **Side-effects** (`AudioManager`, `showInterestToast`, `showBossWarning`, `saveGame`, `ui.*`) must be injected hooks, no-op in headless.
5. **Multi-path maps** (`map11`+): `enemy.distance` is per `pathIndex`; compute `deepestReachPct` against the correct path's `totalLength`.
6. **Per-map/difficulty multipliers**: `hpMult` (map) × difficulty `hpMult`/`speedMult`, plus `cashRewardMult`, are applied in `WaveSpawner` — ensure the headless path constructs `WaveSpawner` identically to `main.js`.

---

## 10. Validation / regression anchor

Headless **Competent / Map 1 / Normal / fresh profile** must reproduce the in-browser baseline within tolerance:
- Win = true, `finalLives` ≈ 19 (±1), `stars` = 2.
- Exactly one leaked enemy total, on **wave 1**, type `runner` (kill census anchor: 83/84 runners).
- No errors thrown.

Wire this as an automated test (Vitest) so future system changes can't silently break the benchmark.

---

## 11. Suggested sub-agent split (matches the delegation rules)

- **Phase 1 (extract refactor)** — Sonnet: it's the one part with real design judgement (clean side-effect seams without changing behaviour). Verify the browser game is byte-for-behaviour identical.
- **Phases 2–3, 5 (runner, telemetry, matrix)** — Haiku/Sonnet: mostly mechanical plumbing against a fixed schema.
- **Phase 4 (archetypes/placement)** — Sonnet: heuristics need some judgement.
- **Phase 6 (report/flags)** — Sonnet for the flag thresholds and target-band logic.
- Reserve an Opus pass for *interpreting* the first full matrix and proposing concrete wave/enemy edits (the analysis is where a stronger model earns its cost, not the plumbing).
