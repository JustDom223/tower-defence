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

**Status: 🚧 Partial** — engine complete; control gaps tracked in `SPEC_pause-audio-bomb.md`

- [x] `AudioManager` implemented with Web Audio API (all sounds synthesised — dart, bomb, frost, marksman, death, wave-start/clear, win/lose)
- [x] Mute toggle handler wired in `GameUI`
- [ ] **Mute button actually clickable** — `#hud-mute` needs `pointer-events: all` (it inherits `none` from `#hud`) → ticket in `SPEC_pause-audio-bomb.md`
- [ ] **Volume control** (slider feeding `AudioManager.setVolume`) → ticket in `SPEC_pause-audio-bomb.md`

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

## What's next — upcoming milestones (in build order)

The original R1–R6 plan is essentially delivered (only the R4/R6 open items remain). New work is captured in its own tracked docs; build in this order:

1. **`SPEC_sprites-and-input.md` → X1** 🔴 ⬜ — **mouse-input fix. Top priority: the game isn't clickable right now.** Do this before anything else.
2. **`SPEC_subagents.md`** ⬜ — create the Haiku `verifier` subagent. One small file; enables cheap pre-merge checking for every ticket after it.
3. **`SPEC_pause-audio-bomb.md`** ⬜ — pause menu, mute fix, bomb targeting. Quick wins. *(Also closes R4's mute-click item.)*
4. **R4 / R6 leftovers** 🚧 — volume control, upgrade delta preview, locked-tower tooltip. Small polish.
5. **`SPEC_sprites-and-input.md` → S1** ⬜ — enemy sprites (dog → runner, monster → tank, spider-man → boss). Cosmetic; do once input is solid.
6. **`SPEC_campaign-maps.md`** ✅ — the 10-map star-gated campaign. *(C0–C4 all done.)*
7. **`META_PROGRESSION.md` §11** ⬜ — global perks & the ranked star-sink (**P1 → P2 → P3 → P4**). Independent of the maps; slot in alongside or after the campaign.

Items 1–5 are short; 6 and 7 are the big content/progression milestones. Tackle 1 immediately (it's blocking play), then 2 so the rest gets cheap automated checking.
