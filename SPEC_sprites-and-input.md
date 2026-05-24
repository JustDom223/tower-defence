# Enemy sprites + mouse-input fix

> **Progress tracking — keep this current.** Tick each item (`[ ]` → `[x]`) and update the **Status** line per ticket (⬜ Not started · 🚧 In progress · ✅ Done) as you go.

Two pieces: render three enemy types as the user's new sprites, and fix the regression where the mouse no longer interacts with the game.

## Status at a glance

| Ticket | What | Status |
|---|---|---|
| X1 | Fix: mouse no longer reacts with the game | ✅ Done |
| S1 | Enemy sprites — dog/monster/spider-man | ✅ Done |

> Do **X1 first** — the game isn't playable until input works again.

---

## Ticket X1 — Mouse no longer reacts (regression)

**Status: ✅ Done**

Clicking/hovering no longer places or selects towers. The static source currently *looks* correct, which points at either a runtime error leaving a menu overlay up, or a full-screen overlay that lost `pointer-events: none` during the recent UI work. Diagnose before changing.

- [x] **Check the browser console first** (`npm run dev`, open DevTools). An exception thrown in `awaitMapSelect`/startup before `#map-select` is hidden would leave that full-screen `z-index:20` overlay covering the canvas — clicks hit the overlay, never `renderer.canvas`. If there's an error, fix that; it's the most likely cause.
- [x] If no console error, inspect which element is on top of the canvas at the click point (DevTools → inspect, or `document.elementFromPoint(x,y)`). Confirm whether it's `#boss-warning`, `#map-select`, a pause/settings overlay, or the canvas.
- [x] **`#boss-warning`** is full-screen (`position:absolute; inset:0; z-index:15`) and always present (only opacity toggles). Ensure `pointer-events: none` is set on it **and** on its `.boss-text` child so it can never intercept input. Belt-and-suspenders: also toggle `display:none` when not active rather than relying on opacity alone.
- [x] Confirm every full-screen overlay (`#map-select`, `#end-screen`, `#unlock-tree`, and any pause/settings overlay) is `display:none` when not in use, and that whatever shows them also hides them. A pause/settings overlay must default to `display:none`.
- [x] After the fix, `renderer.canvas` mousemove/click listeners (in `main.js`) fire again.

**Acceptance:** placing and selecting towers works; hover highlight returns; the boss-wave warning still appears but never blocks clicks; no overlay is left covering the canvas after map select.

---

## Ticket S1 — Enemy sprites (dog → runner, monster → tank, spider-man → boss)

**Status: ✅ Done**

Enemies currently draw as Pixi `Graphics` circles in `src/render/EnemyRenderer.js` (per-type `color`/`radius` from `src/data/enemies.js`). Swap three types to textured sprites; leave the rest as circles for now.

Sprite files live in `src/sprites/`: `Toby's Dog.png`, `Toby's Monster.png`, `Toby's Spiderman.png`.

- [x] **Rename the files to import-safe names** first — spaces and apostrophes in `Toby's Dog.png` cause headaches with Vite asset URLs. Suggest `dog.png`, `monster.png`, `spiderman.png` in `src/sprites/`. (If you keep the original names, you must import them as URL assets and encode them carefully — renaming is simpler.)
- [x] Add a per-type sprite map in `enemies.js` or the renderer: `runner → dog.png`, `tank → monster.png`, `boss → spiderman.png`. Keep it data-driven (a `sprite` field on the enemy type is cleanest and matches the project's data-driven rule — see `CONTENT_GUIDE.md`).
- [x] In `EnemyRenderer.js`, load the textures at init (`Assets.load(...)`, imported via Vite `new URL('../sprites/dog.png', import.meta.url)` or a static import). For enemy types that have a sprite, draw a `Sprite` instead of a circle; types without a `sprite` keep the existing circle path.
- [x] **Size** each sprite to the type's footprint: scale so its width ≈ `radius * 2` (runner r10 → ~20px, tank r16 → ~32px, boss r28 → ~56px). Anchor at center (0.5, 0.5) and position at the enemy's world position.
- [x] **Preserve the existing overlays**: the white hit-flash, the cyan slow ring, and the HP bar must still render and sit correctly around the sprite (use the same `radius`-based offsets).
- [x] Pool/perf: don't create a new Sprite per frame — reuse sprites the same way the circle graphics are managed (one display object per active enemy, released with the enemy).

**Acceptance:** runners appear as the dog, tanks as the monster, the boss as spider-man, all correctly sized; sprinter/splitter/armoured still render as before; hit-flash, slow ring, and HP bars still work; no per-frame allocation churn.

> Note for later: once this looks right, the same `sprite` field makes it trivial to give every enemy type (and towers) its own art — a natural follow-up.
