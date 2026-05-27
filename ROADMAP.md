# Replayability Roadmap

> **Progress tracking — keep this current.** As you finish each item, tick its box (`[ ]` → `[x]`) and update the **Status** line for that phase (⬜ Not started · 🚧 In progress · ✅ Done). Tick items off as you go so progress stays trackable at a glance.

This roadmap covers the work to take the game from "runs" to "genuinely replayable." Most of it is built — the table below reflects the **verified** state of the code as of this revision. Remaining open items are called out per phase and in the live ticket doc `SPEC_pause-audio-bomb.md`.

---

## Status at a glance

| Phase | Status | Open items |
|---|---|---|
| R1 — Content | ✅ Done | — |
| R2 — Difficulty tiers | ✅ Done | — |
| R3 — Game feel | ✅ Done | — |
| R4 — Audio | ✅ Done | mute + volume fully wired including pause-menu sync |
| R5 — Hub polish | ✅ Done | — |
| R6 — Clarity | ✅ Done | — |

Also live (separate ticket docs):
- **`SPEC_pause-audio-bomb.md`** — pause menu, mute fix, bomb targeting. ⬜ Not started.
- **`SPEC_campaign-maps.md`** — 10-map campaign, star-gated unlock, difficulty curve, hub UI. ✅ Done.

---

## Phase R1 — Content

**Status: ✅ Done**

- [x] Expand to **10 waves** per map (per-map files `src/data/waves-map1.js`, `waves-map2.js`)
- [x] Wave 10 = **boss wave**: high-HP `boss` enemy, announced by the `#boss-warning` flash overlay
- [x] **Per-map wave files** so Serpentine and Zigzag differ (Zigzag leans on speed/groups)
- [x] **Interest mechanic**: end-of-wave cash bonus with `#interest-toast` feedback
- [x] New enemy: **Armoured** (`resistance: { dart: 0.5, marksman: 0.5 }` — full damage from Bomb/Frost)

---

## Phase R2 — Difficulty tiers

**Status: ✅ Done**

- [x] `src/data/difficulties.js` with easy/normal/hard `hpMult`/`speedMult`/`starCap`/`startingCash`
- [x] Difficulty selector on the map-select hub
- [x] Multipliers applied in `WaveSpawner` at enemy spawn
- [x] `computeStars` honours the chosen difficulty's `starCap` (only Hard yields the 3rd star)

> **Rework incoming:** Easy is being dropped — Normal + Hard only, with Hard a much bigger leap — see `SPEC_campaign-maps.md` ticket C0.

---

## Phase R3 — Game feel

**Status: ✅ Done**

- [x] **Floating damage numbers** (`DamageNumberRenderer`, fed by `damageEvents` from `CombatSystem`)
- [x] **Enemy death burst** (`ParticleRenderer` + `state.deathParticles`)
- [x] **Tower rotation** toward current target (barrels redrawn live; `tower.angle` set in `CombatSystem`)
- [x] **Wave preview bar** (`#hud-preview`, `setWavePreview` / `fmtWavePreview`)
- [x] **Kill counter** in HUD (`state.kills`, `#hud-kills`)

---

## Phase R4 — Audio

**Status: ✅ Done**

- [x] `AudioManager` implemented with Web Audio API (all sounds synthesised — dart, bomb, frost, marksman, death, wave-start/clear, win/lose)
- [x] Mute toggle handler wired in `GameUI`; `pointer-events: all` fixed on `#hud-mute`
- [x] Volume slider in pause menu feeding `AudioManager.setVolume`; HUD + pause-menu mute stay in sync

---

## Phase R5 — Hub polish

**Status: ✅ Done**

- [x] Per-map star rating display on map buttons (`profile.missions`)
- [x] "New unlock available" badge on the Unlock Tree button when stars are available
- [x] Star display + new-best message on the end screen
- [x] Respec with confirmation dialog
- [x] Profile version guard / fallback to `defaultProfile()` on corrupt save

---

## Phase R6 — Clarity

**Status: ✅ Done**

- [x] **Tower stat panel** (`#tower-stats`, `renderStats`) showing current DMG/RNG/RATE
- [x] **Affordability greying** of unaffordable shop buttons (`.tower-unaffordable`)
- [x] **Locked tower** styling in shop (`.tower-locked`, click ignored)
- [x] **Upgrade delta preview** — buyable tier buttons show the resulting stat inline (e.g. `→ DMG 34`)
- [x] **Locked-tower tooltip** — hovering a locked tower button shows "Unlock in the Upgrade Tree" (via `title` attr)

---

## Balancing note

The 10-map campaign (`SPEC_campaign-maps.md`) raises the ceiling to **~30 stars** (≈20 on Normal-only), enough to fully fund the unlock tree plus the new global perks / star-sink over time. Keep costs scarce so unlocks stay meaningful as stars arrive gradually across the campaign — don't tune for the old 6-star budget, and don't lower all costs at once.

---

## Milestones — all shipped ✅

All original R1–R6 phases and subsequent ticket docs are complete:

1. **`SPEC_sprites-and-input.md`** ✅ — mouse-input fix (X1) + enemy sprites (S1).
2. **`SPEC_subagents.md`** ✅ — Haiku `verifier` subagent for cheap pre-merge checking.
3. **`SPEC_pause-audio-bomb.md`** ✅ — pause menu, mute/volume fix, bomb fixed-point targeting.
4. **`SPEC_campaign-maps.md`** ✅ — 10-map star-gated campaign (C0–C4).
5. **`META_PROGRESSION.md` §11** ✅ — global perks & ranked star-sink (P1–P4).

**Next opportunity:** balance pass (tune wave compositions, difficulty curve, perk values) or new content (map 11+, wave compositions using the new enemies, unlock-tree nodes for the 12 new towers).

**Content added (feat/new-towers-and-enemies):**
- 12 new towers: Tesla, Sticky Cannon, Mine Layer, Boomerang, Laser, Engineer, Druid, Wizard, Scatter Gun, Solar Tower, Trapper, Gravity Well — all available in Sandbox.
- 10 new enemies: shielded, regenerator, flyer, magma, insulated, aquatic, cleric, stutter, juggernaut, megaboss — all available in Sandbox spawn dropdown; not yet placed in maps.
- Dart tower fires in fixed direction at fire time (ballistic-style); Gatling tier 3 now fires a 3-dart ±15° cone volley instead of ×3 fire rate.
- New systems: shield layer, enemy regen, flying flag, immuneSlow, heals-nearby aura, stutter movement, projSlowFactor on-hit slow.

Items 1–5 are short; 6 and 7 are the big content/progression milestones. Tackle 1 immediately (it's blocking play), then 2 so the rest gets cheap automated checking.

6. **`SPEC_restart-map.md`** ✅ — Restart Map button in pause menu (amber, confirm dialog, sessionStorage intent).
7. **`SPEC_end-screen-flow.md`** ✅ — "Continue" on win / "Try Again" on loss; clears save on loss.
8. **`SPEC_free-placement.md`** ✅ — Free tower placement with 10 px snap grid; save key bumped to v2.
9. **`SPEC_exclusive-upgrade-paths.md`** ✅ — Mutually exclusive upgrade paths; first purchase on either path locks the other.
10. **`SPEC_fullscreen.md`** ✅ — Fullscreen toggle on HUD and map-select; upscales to fill screen in fullscreen.
