# Pause menu, audio fixes, and bomb targeting

Three changes to the running game, plus one optional layout fix. Each task lists the files to touch and acceptance criteria. They're independent — do them in any order.

> **Progress tracking — keep this current.** As you finish each item, tick its box (`[ ]` → `[x]`) and update the **Status** line for that ticket (⬜ Not started · 🚧 In progress · ✅ Done). Tick items off as you go so progress stays trackable at a glance.

## Tickets — tracking

**Ticket 1 — Pause menu** · Status: ✅ Done

- [x] `state.paused` gate in the loop + ⏸ HUD button (with `pointer-events: all`)
- [x] Paused overlay with Resume / Settings / Main Menu
- [x] Main Menu saves the run (mid-wave → `waveIndex - 1`) then reloads; Continue resumes correctly

**Ticket 2 — Mute + volume** · Status: ✅ Done

- [x] Add `pointer-events: all` to `#hud-mute` (the actual fix — handler already exists)
- [x] `AudioManager.setVolume` + a volume slider in the Settings section
- [x] HUD and pause-menu mute controls stay in sync

**Ticket 3 — Bomb targeting** · Status: ⬜ Not started

- [ ] Projectile `ballistic` / `landX` / `landY` fields
- [ ] Fire bombs at a snapshot landing point (no homing)
- [ ] Arrival check explodes exactly at the landing point

**Optional — start-screen layout bleed-through** · Status: ⬜ Not started

- [ ] Menu overlays cover the full viewport (no HUD/shop showing behind the start screen)

---

---

## Task 1 — Pause button → Paused menu (Resume / Settings / Main Menu)

A pause button in the HUD that freezes the game and opens an overlay with Resume, a small Settings section, and a Main Menu option. Leaving to the Main Menu **saves the run** so the start screen's existing "Continue saved game" resumes it.

**Game state & loop**
- Add `paused: false` to the `state` object in `src/main.js`.
- In the game-loop `update(dt)` callback, early-return while paused — change the existing guard from `if (state.gameOver) return;` to `if (state.gameOver || state.paused) return;`. Rendering keeps running, so the board shows a frozen frame underneath the overlay. (No change needed in `GameLoop.js`.)

**HUD button** (`index.html`, the `#hud` bar)
- Add a pause button next to `#hud-mute` / `#hud-ff`, e.g. `<button id="hud-pause">⏸</button>` (same inline style as `#hud-mute`). It must have `pointer-events: all` like the other HUD buttons (the `#hud` bar itself is `pointer-events: none`).

**Paused overlay** (`index.html`)
- Add an overlay mirroring the existing `#end-screen` pattern: `position: absolute; inset: 0; z-index: 20; display: none;` with a dark background. Give it `pointer-events` so it blocks clicks to the canvas/HUD beneath.
- Contents inside a panel (reuse `#end-panel`-style box):
  - Title "Paused".
  - **Settings section** (see Task 2 for the controls): a master volume slider and a mute toggle.
  - `<button id="pause-resume">Resume</button>`
  - `<button id="pause-main-menu">Main Menu</button>`

**Wiring** (`src/main.js`, and `GameUI` if you route UI through it — the existing code wires HUD buttons directly in `main.js` and via `GameUI`, follow whichever the surrounding code uses)
- `#hud-pause` click → `state.paused = true`, show the pause overlay.
- `#pause-resume` click → `state.paused = false`, hide the overlay.
- `#pause-main-menu` click → save the run, then `location.reload()` (the start screen's `awaitMapSelect` already detects a saved game and shows "Continue saved game"; the existing "Play Again" button uses `location.reload()` too, so this matches the established pattern).

**Saving on Main Menu (resume correctness)**
- Reuse `saveGame(state)` from `src/core/SaveSystem.js` (it already serialises towers/cash/lives/score/waveIndex and discards in-flight enemies/projectiles).
- The existing checkpoint semantics are "saved waveIndex = last *completed* wave; pressing Start does `waveIndex++`." So if the player pauses **mid-wave** (`state.waveActive === true`), save with `waveIndex = state.waveIndex - 1` so Continue replays the current wave cleanly instead of skipping it. If paused **between waves**, save `state` as-is. Build the save payload with the adjusted index rather than mutating live state.

**Acceptance criteria**
- Clicking ⏸ freezes enemies/towers/projectiles and shows the Paused overlay; Resume unfreezes exactly where it left off.
- While paused, clicks don't place towers or reach the board.
- Main Menu returns to the start screen; "Continue saved game" is offered and resumes at the wave the player was on (mid-wave → that wave restarts; between waves → the next wave is available).

---

## Task 2 — Make the mute button work (+ volume in Settings)

**Root cause (already diagnosed):** the mute button is *already wired* — `GameUI.js` (~lines 85–93) attaches a click handler that calls `AudioManager.toggleMute()` and swaps the 🔊/🔇 icon, and `AudioManager.toggleMute()`/`get muted()` work. The bug is CSS: the `#hud` bar is `pointer-events: none`, and `#hud-start`/`#hud-ff` each re-enable clicks with `pointer-events: all`, but `#hud-mute`'s inline style never sets it. So `#hud-mute` inherits `pointer-events: none` and the click never reaches it.

**The fix** (`index.html`)
- Add `pointer-events: all` to `#hud-mute` (add it to the inline style, or better, add `#hud-mute` to the existing `#hud-start, #hud-ff { pointer-events: all; ... }` rule). Do the same for the new `#hud-pause` button from Task 1.
- That single change makes the existing handler fire. No JS change needed for basic mute.

**Tidy-up (optional but recommended)**
- `GameUI.js` uses a dynamic `await import('../audio/AudioManager.js')` inside the click handler. It resolves to the same singleton as the static imports elsewhere, so it works, but a plain top-of-file `import AudioManager from '../audio/AudioManager.js'` is simpler and avoids the async hop.
- On startup, set the icon to match `AudioManager.muted` so it's correct before any toggle.

**Add volume support** (`src/audio/AudioManager.js`)
- Add a stored volume field (default `0.7`, the current master gain) and a `setVolume(v)` method that clamps to `0..1`, stores it, and — if `#masterGain` exists and not muted — applies it. In `#init()`, initialise `#masterGain.gain.value` from the stored volume (and respect `#muted`). Add a `get volume()`.
- `toggleMute()` should restore to the stored volume (not a hard-coded `0.7`) when unmuting.

**Settings controls in the pause menu** (from Task 1)
- A range input `#pause-volume` (0–100) → `AudioManager.setVolume(value/100)`.
- A mute toggle in the menu that calls `AudioManager.toggleMute()` and stays in sync with the HUD `#hud-mute` icon (both read `AudioManager.muted`).

> Note: the synthesised sounds themselves still need tuning later — out of scope here. This task is only about mute/volume *controls* working.

**Acceptance criteria**
- Clicking 🔊 mutes all audio and shows 🔇; clicking again restores sound and shows 🔊.
- The volume slider changes loudness live; mute overrides it; unmute returns to the slider's level.
- HUD mute icon and the pause-menu mute control reflect the same state.

---

## Task 3 — Bomb lands where the target was at fire time (no homing)

Currently every projectile homes on its target each frame in `moveAndHitProjectiles` (`src/systems/CombatSystem.js`), so a fast target drags the bomb far past its launch aim. For **bombs only** (splash projectiles), the projectile should fly to a fixed ground point — the target's position at the moment of firing — and explode there.

**Projectile fields** (`src/entities/Projectile.js`)
- In `make()`, add `ballistic: false, landX: 0, landY: 0`.
- In `reset(...)`, accept a `ballistic` flag. When `ballistic` is true: set `p.landX`/`p.landY` to the target's current `worldX`/`worldY` (snapshot at fire time; fall back to the spawn `x`/`y` if no target), and aim the initial velocity toward `(landX, landY)`. Homing fields (`target`/`targetId`) can still be stored but won't be used for movement.

**Firing** (`src/systems/CombatSystem.js`, where projectiles are acquired)
- Pass `ballistic: tower.aoeRadius > 0` in the `projectilePool.acquire({...})` call. (Only the Bomb has `aoeRadius > 0` today, so this is effectively bomb-only; if you'd rather make it literal, use `tower.type === 'bomb'`.)

**Movement & arrival** (`moveAndHitProjectiles` in `src/systems/CombatSystem.js`)
- For `p.ballistic`: do **not** recompute velocity toward the target (skip the homing block). Move by `vx`/`vy` as now, then detect arrival at the landing point:
  ```js
  const remX = p.landX - p.x, remY = p.landY - p.y;
  const remDist = Math.hypot(remX, remY);
  const step = p.speed * dt;          // dt = 1/60 as used here
  if (remDist <= step) { p.x = p.landX; p.y = p.landY; hit = true; }
  ```
  This snaps the projectile exactly onto the landing point and avoids overshoot at high speeds.
- Non-ballistic projectiles keep the current homing + proximity-hit behaviour unchanged.
- `onHit` already applies AoE around the projectile's `p.x`/`p.y`, so once the bomb lands at `(landX, landY)` the explosion is correctly centred there and hits whatever enemies are in radius — including the case where the original target has already moved away or died.

**Acceptance criteria**
- A bomb fired at a fast enemy explodes at the spot the enemy occupied when fired, not wherever the enemy ran to.
- If the target dies in flight, the bomb still lands and explodes at the snapshot point (no flying off to the world edge).
- Dart/Frost/Marksman behaviour is unchanged.

---

## Optional — start-screen layout bleed-through

In the shared screenshot, the HUD/shop show through beside the start panel and the dark overlay doesn't cover the viewport. Cause: `#map-select` is shown **before** `renderer.init()` creates the canvas, so `#game-container` has no size yet and the `inset: 0` overlay collapses; the absolutely-positioned `#hud`/`#tower-shop` then render against a zero-size container.

Pick whichever fix fits best:
- Make the menu overlays (`#map-select`, `#pause-screen`, `#end-screen`, `#unlock-tree`) `position: fixed; inset: 0` so they always cover the viewport regardless of container size; **and/or**
- Hide `#hud` and `#tower-shop` (e.g. a `body.in-menu` class, or `display:none`) until the game actually starts, removing them again when a map is chosen.

**Acceptance:** the start screen is a clean full-window overlay with no HUD/shop visible behind it.
