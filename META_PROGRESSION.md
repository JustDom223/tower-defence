# Meta-Progression & Replayability — Build Spec

A phased spec for adding a persistent star-based progression layer on top of the existing run-based game. Build it phase by phase (M0 → M6); each phase ends runnable. It assumes the v1 game in this repo is complete (4 towers, 2 maps, upgrade paths, save system).

> **Progress tracking — keep this current.** As you finish each item, tick its box (`[ ]` → `[x]`) and update the **Status** line for that section (⬜ Not started · 🚧 In progress · ✅ Done). Tick items off as you go so progress stays trackable at a glance.

**Status: ✅ Complete — all phases M0–M6 shipped (stars, unlock tree, difficulty, hub, respec).**

---

## 1. What we're building (and why this shape)

You picked, across the design questions: unlock **tower upgrade paths** + **new towers** (a difficulty-scaling *mission path* comes later, once the fundamentals are in); **performance-scaled** currency; **star ratings + difficulty tiers**; and a start of **Dart only, path A**. You also liked a 3-star-per-level idea where stars are spent to upgrade things, and asked how successful TD games do it.

Those answers unify into one coherent system, which is exactly what the genre's best examples do:

> **Stars are the meta-currency.** You earn up to 3 stars per mission based on performance, and you spend those same stars in a persistent unlock tree to permanently open up tower paths and new towers.

This merges your "performance-scaled currency" and "3-star system" answers into a single number instead of two parallel economies — simpler to balance and immediately legible to the player.

### Research basis (what successful TD games do)

- **Kingdom Rush** — the canonical 3-star model. Stars are earned per level based on **lives remaining**, plus extra stars for beating optional Heroic/Iron challenges. Those stars are then **spent in per-tower upgrade trees** whose effects carry across every level. Stars are a *finite budget* you allocate, not a farm. This is the model we're basing the core loop on. ([Kingdom Rush Wiki — Upgrades](https://kingdomrushtd.fandom.com/wiki/Upgrades))
- **Bloons TD 6 — Monkey Knowledge** — points earned by leveling/achievements, spent across skill trees. Two ideas worth stealing: **prerequisite gating** (you must buy earlier nodes before deeper, more powerful ones unlock) and a **respec** option so experimenting isn't punishing. ([Bloons Wiki — Monkey Knowledge](https://bloons.fandom.com/wiki/Monkey_Knowledge_(BTD6)))

We take Kingdom Rush's "stars from performance, spent on a tree" loop and BTD6's "prerequisite gating + respec" for the tree's internal rules.

### The key design consequence: stars are finite

Because each mission's stars are awarded **once (best result kept)** rather than re-farmed, the player is making real allocation decisions — "do I unlock the Bomb tower, or open Dart's second path first?" That tension is the fun. The cost of this elegance is that **total available stars are capped by how much content exists** — see the balancing note in §8.

---

## 2. The star-earning rules

Stars come from two stacking sources, capped at **3 per mission**:

**Performance (lives remaining at victory)** — scaled, as you wanted:
- Win at all → **1 star**
- Win with ≥ 50% lives (≥ 10 / 20) → **2 stars**
- Win with ≥ 90% lives (≥ 18 / 20) → **3 stars**

**Difficulty tier** — gates the ceiling so harder play is the way to the top stars:
- **Easy** — caps the mission at 1 star (enemy HP/count reduced).
- **Normal** — caps at 2 stars (baseline, current balance).
- **Hard** — caps at 3 stars (enemy HP/count/speed increased).

So the 3rd star on a map *requires* clearing it on Hard with near-full lives. This is the replay hook: come back, crank the difficulty, chase the star you're missing.

**Best-result-kept:** a mission stores the best star count ever earned for it. Re-earning a lower or equal rating changes nothing; beating your best adds the difference to your available stars. (No grinding the easy map for infinite currency.)

---

## 3. The profile data model

A **separate** persistence channel from the existing run save. Do **not** touch the existing `tower-defence-v1` key in `src/core/SaveSystem.js` — that stays the mid-run checkpoint. Add a new module.

**New file: `src/core/Profile.js`** — localStorage key `tower-defence-profile-v1`:

```js
{
  version: 1,
  spent: 0,                       // stars sunk into unlocks
  missions: {                     // best star rating per map
    map1: 0, map2: 0,             // 0..3
  },
  unlocks: {
    towers: { dart: true,  bomb: false, frost: false, marksman: false },
    paths:  {
      dart:     { A: true,  B: false },   // starting loadout: Dart + path A only
      bomb:     { A: false, B: false },
      frost:    { A: false, B: false },
      marksman: { A: false, B: false },
    },
  },
}
```

Derived values (compute, don't store, to avoid drift):
- `earned = sum(missions[*])` — total stars ever earned.
- `available = earned - spent` — what's spendable right now.

`Profile.js` exposes: `loadProfile()`, `saveProfile(p)`, `defaultProfile()`, `availableStars(p)`, `isTowerUnlocked(p, type)`, `isPathUnlocked(p, type, pathChar)`, `recordMissionResult(p, mapKey, stars)` (keeps the max), and the unlock mutators in §6. A `resetProfile()` for testing is handy.

---

## 4. Tower IDs & path keys (use these exact strings)

Confirmed against `src/data/towers.js`:
- Tower types: `dart`, `bomb`, `frost`, `marksman`.
- Each tower has `upgrades.pathA` (path char `'A'`) and `upgrades.pathB` (path char `'B'`).
- The shop buttons in `index.html` use `data-tower="dart|bomb|frost|marksman"`.
- In-mission upgrade gating lives in `canBuyUpgrade(tower, path, cash, towerDef)` in `src/systems/UpgradeSystem.js`, which already returns typed reasons (`maxed | crosspath | cash | nodef`). We add `locked`.

---

## 5. Integration points in the existing code

Touch these, lightly:

- **`src/systems/UpgradeSystem.js` → `canBuyUpgrade`** — add a `'locked'` reason. A path that isn't unlocked in the profile cannot be bought in-mission, regardless of cash/tier. Pass the unlock state in (e.g. a `pathUnlocked` boolean argument) so the system stays pure and doesn't import `Profile.js`.
- **`src/ui/GameUI.js` → `#renderUpgrades`** — when a path is profile-locked, render its column with the existing `.upg-btn.locked` style and a 🔒 + "Unlock in tree" hint instead of buyable tiers. (The CSS class already exists.)
- **`src/ui/GameUI.js` shop / `index.html` `#tower-shop`** — only show/enable unlocked towers. Locked towers render greyed with a lock; clicking does nothing (or shows a tooltip pointing at the tree). Reuse the `#refreshShop()` pattern.
- **`src/main.js` placement guard** — already checks `state.cash < def.cost || !isFree(...)`; also reject placement of a tower whose type isn't unlocked (defensive; the shop should already prevent selecting it).
- **`src/main.js` win/lose → `ui.showEndScreen(won, score)`** — extend to compute stars earned (from lives + difficulty), call `recordMissionResult`, save the profile, and show the rating + any newly available stars on the end panel.
- **Map select (`awaitMapSelect` in `main.js`, `#map-select` in `index.html`)** — becomes the hub: show each map's star rating (e.g. ★★☆), a difficulty selector, available-star count, and a button into the unlock tree.
- **Difficulty** — new data + a multiplier applied to enemy stats at spawn. Cleanest spot is `src/systems/WaveSpawner.js` / `src/entities/Enemy.js` acquire, reading a difficulty config so it stays data-driven like the rest of the game.

The simulation core (`MovementSystem`, `CombatSystem`, `TargetingSystem`, `GameLoop`) needs **no changes** — meta-progression is config + gating + UI, which keeps the logic/render separation from the original plan intact.

---

## 6. The unlock tree (what stars buy, and the gating rules)

A flat, readable tree. Suggested starter costs (tune against §8):

| Unlock | Cost (stars) | Prerequisite |
|---|---|---|
| Dart — Path B (Quick) | 1 | — (Dart + Path A are free at start) |
| Bomb tower | 2 | — |
| Bomb — Path A | 1 | Bomb unlocked |
| Bomb — Path B | 1 | Bomb unlocked |
| Frost tower | 2 | — |
| Frost — Path A | 1 | Frost unlocked |
| Frost — Path B | 1 | Frost unlocked |
| Marksman tower | 3 | — |
| Marksman — Path A | 1 | Marksman unlocked |
| Marksman — Path B | 1 | Marksman unlocked |

Gating rules (BTD6-style prerequisites):
- A tower's paths can't be bought until the **tower** is unlocked.
- Each tower must have **at least one path** unlock available so it's usable the moment it's bought — so when you unlock a tower, also auto-unlock (or strongly steer toward) its Path A, or make Path A free-on-tower-unlock. Recommended: unlocking a tower includes its Path A; the table's per-path rows then refer only to the *second* path. (Pick one approach and keep it consistent — simplest is "buying a tower grants Path A free; Path B is a separate purchase.")
- **Respec:** a single button refunds all `spent` stars back to `available` and resets `unlocks` to default (keeping `dart`/`A`). Free or cheap. Lets the player re-plan without losing earned stars.

Mutators in `Profile.js`: `canUnlock(p, node)`, `applyUnlock(p, node)` (deduct via `spent`), `respec(p)`.

---

## 7. Phased build order (M0 → M6)

Each phase is independently runnable and testable.

### Phase M0 — Profile foundation
- [x] Add `src/core/Profile.js` with the §3 model, load/save to `tower-defence-profile-v1`, and `defaultProfile()` (Dart + Path A only).
- [x] Load the profile at startup in `main.js`; log `available`/`unlocks` to console. No behaviour change yet beyond data existing.
- [x] **Test:** fresh profile shows dart unlocked, others locked; persists across reload.

### Phase M1 — Enforce unlocks in-mission
- [x] Shop shows only unlocked towers (others greyed/locked).
- [x] `canBuyUpgrade` gains the `'locked'` reason; `#renderUpgrades` shows locked paths with 🔒.
- [x] Hardcode/devtool a way to flip unlocks for testing (e.g. `window.__profile`).
- [x] **Test:** with default profile you can only place Darts and only buy Dart Path A; everything else reads as locked.

### Phase M2 — Earn stars
- [x] On victory, compute stars from lives remaining (§2), clamp by difficulty cap (Normal for now), `recordMissionResult`, save profile.
- [x] Extend `showEndScreen` to display the star rating earned (★★☆) and "+N stars available".
- [x] **Test:** winning with full lives on Normal awards 2 stars; replaying with fewer lives doesn't reduce the stored best.

### Phase M3 — The unlock tree (the centrepiece)
- [x] New screen/overlay (mirror `#map-select` styling): shows available stars, the §6 tree, buy buttons with costs and lock states, and a respec button.
- [x] Wire `applyUnlock`/`respec`; saving the profile immediately reflects in the shop and upgrade panel next run.
- [x] Reachable from the map-select hub.
- [x] **Test:** earn stars → open tree → unlock Bomb → Bomb appears in shop next run; respec returns stars and re-locks.

### Phase M4 — Difficulty tiers
- [x] Add `src/data/difficulties.js`: `{ easy, normal, hard }` with enemy HP/count/speed multipliers and a `starCap` (1/2/3).
- [x] Difficulty selector on the map-select hub; chosen difficulty scales enemies (apply in `WaveSpawner`/enemy acquire) and sets the star cap.
- [x] **Test:** Hard noticeably tougher; only Hard can yield the 3rd star.

### Phase M5 — Mission hub polish
- [x] Map-select becomes a proper hub: per-map star ratings, difficulty, available stars, "Upgrades" button, and the existing "Continue saved game".
- [x] "New unlock available" / star-gain feedback (small celebration on the end screen).
- [x] **Test:** hub accurately reflects profile state on load.

### Phase M6 — Polish & foundations for the mission path
- [x] Respec confirmation; guard against profile corruption (version check, fall back to default).
- [x] Document in `CONTENT_GUIDE.md` how to add a tree node and a difficulty tier (data-only).
- [x] Leave a clear seam for the future **mission path** (an ordered list of missions with rising difficulty): the profile's `missions` map and the difficulty config are already the right shape to extend into a campaign sequence.
- [x] **Test:** corrupting localStorage falls back gracefully; new tree node added via data appears in the tree.

---

## 8. Balancing note — read this before tuning costs

> **Update:** the 10-map campaign (`SPEC_campaign-maps.md`) raises the ceiling to **~30 stars**, so the tree can now be fully funded over time. The "only 2 maps / 6 stars" framing below is historical — keep costs scarce so unlocks stay meaningful across the campaign rather than tuning for a 6-star budget.

Stars are finite and tied to content. **Right now there are only 2 maps.** Max stars currently earnable = 2 maps × 3 = **6 stars**. The §6 tree costs far more than 6 to fully unlock — which is intended long-term, but means with today's content the player can only open *part* of the tree.

Options, in order of preference:
1. **Add missions** (your planned mission path) — the real fix. More missions = more stars = a tree that can actually be completed. The system is built to scale into this.
2. **Tune costs down** so the current 6 stars unlock a satisfying chunk (e.g. Dart Path B + one full extra tower) and the rest waits for more content.
3. **Per-difficulty stars** (only if needed) — award a map's stars separately per difficulty cleared, multiplying the budget. Risks devaluing stars; use sparingly.

Recommendation: ship M0–M5 with **costs tuned so 6 stars meaningfully unlocks ~half the tree**, and treat full completion as the carrot that motivates building the mission path next.

---

## 9. Definition of done

- A fresh player starts with **only Dart + Path A**; everything else is visibly locked in shop and upgrade panel.
- Winning awards 1–3 stars by lives + difficulty; the best rating per mission is stored and never regresses.
- The unlock tree spends stars to permanently open towers and paths, with prerequisite gating and a working respec.
- All meta state lives in `tower-defence-profile-v1`, fully separate from the run checkpoint, and survives reload.
- The simulation core files are unchanged — proof the layer sits cleanly on top.

---

## 10. Future hook — the mission path

When you build the difficulty-scaling mission path later, it slots in here: define an ordered campaign list (`src/data/campaign.js`) of `{ mapKey, difficulty, unlocksOnComplete? }` entries; gate later missions behind earlier ones using the existing `missions` ratings in the profile; and let the hub render it as a path rather than a flat map list. No rework of the star economy or unlock tree required — that's the payoff for building those first. *(Now being built — see `SPEC_campaign-maps.md`.)*

---

## 11. Global perks & star-sink (tree expansion)

> **Progress tracking — keep this current.** Tick each item (`[ ]` → `[x]`) and update the **Status** line per ticket (⬜ · 🚧 · ✅) as you go.

Extends the §6 unlock tree beyond towers/paths with **account-wide perks** that apply to every run, plus a **ranked "star-sink"** so surplus stars (the campaign yields ~30) always have somewhere to go.

**Research basis:** one-time global perks mirror BTD6 Monkey Knowledge (`+damage`, starting cash, prerequisite gating). The ranked sink follows Vampire Survivors PowerUps — each rank costs more than the last, so a single track absorbs many stars over time — and Hades' Mirror of Night (permanent ranked upgrades with a full refund/respec). Sources are listed at the foot of this section.

### Profile changes
- [x] Add a `perks` object to `defaultProfile()` (all zero):
  ```js
  perks: {
    startCash: 0, startLives: 0, sellBonus: 0, towerCostPct: 0,  // one-time
    damagePct: 0, interestBonus: 0,                              // from ranked tracks
    powerCoreRank: 0, interestRank: 0,                           // rank counters
  }
  ```
- [x] `respec(p)` must also reset `perks` to default (it already refunds all `spent`).
- [x] Extend the node model + `canUnlock`/`applyUnlock` to support **ranked** nodes: a ranked node has `ranked: true`, `maxRank`, `costAt(rank)`, `getRank(p)`, and `apply(p)` increments the rank and bumps the perk value. `canUnlock` reads the current rank's cost; one-time nodes keep the existing boolean `check`/`apply`.

### Where perks apply in the run (read `profile.perks` at run start)
- [x] Starting cash: `difficulty.startingCash + perks.startCash` (`main.js` state init)
- [x] Starting lives: `20 + perks.startLives`
- [x] Tower damage: at `createTower`, base `damage × (1 + perks.damagePct)` (keep `CombatSystem` pure — bake the multiplier into the tower's stats at creation)
- [x] Sell value: `(cost + upgradeSpent) × (0.6 + perks.sellBonus)`
- [x] Tower cost: `def.cost × (1 - perks.towerCostPct)` (apply in shop affordability + placement deduction)
- [x] Interest: end-of-wave `floor(cash × (0.05 + perks.interestBonus))`

### Ticket P1 — Perks plumbing
**Status: ✅ Done** — profile `perks`, ranked-node support, respec reset, and the run-start hooks above.

### Ticket P2 — One-time global nodes
**Status: ✅ Done**

| Node | Effect | Cost | Prereq |
|---|---|---|---|
| War Chest I | +50 starting cash | 2 | — |
| War Chest II | +100 starting cash (total +150) | 3 | War Chest I |
| Reinforced | +5 starting lives | 2 | — |
| Salvage | +15% sell value | 2 | — |
| Bulk Discount | towers cost 8% less | 3 | — |

- [x] Add these nodes to the tree; wire their effects via the run-start hooks above.

### Ticket P3 — Ranked star-sink tracks
**Status: ✅ Done**

- [x] **Power Core** (headline sink): `+3% global tower damage` per rank, `maxRank 10`. Rising cost per rank: `1,1,2,2,3,3,4,4,5,5` (30 stars to max → +30% damage). `costAt(rank) = Math.ceil((rank + 1) / 2)`.
- [x] **Compound Interest** (optional second sink): `+1% interest` per rank, `maxRank 5`, cost `1,2,2,3,3`.
- [ ] These should remain visibly buyable as long as the player has stars and ranks remaining — the "pour surplus stars in" outlet.

### Ticket P4 — Tree UI for perks & ranks
**Status: ✅ Done**

- [x] Render a **Perks** group in the unlock-tree overlay (separate from towers/paths).
- [x] Ranked nodes show progress and next cost, e.g. `Power Core — Rank 3/10 · next +3% dmg · ★2`, and stay buyable until maxed.
- [x] Respec wipes perks/ranks and refunds, same as tower/path unlocks.

**Acceptance:** global perks measurably change a run (more cash/lives/damage); Power Core can absorb a large star surplus across many ranks; respec fully refunds and resets perks.

**Sources:** [Vampire Survivors Wiki — PowerUps](https://vampire.survivors.wiki/w/PowerUps) · [Hades Wiki — Mirror of Night](https://hades.fandom.com/wiki/Mirror_of_Night) · [Bloons Wiki — Monkey Knowledge (BTD6)](https://bloons.fandom.com/wiki/Monkey_Knowledge_(BTD6))
