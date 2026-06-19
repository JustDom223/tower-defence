# DESIGN — Mobile UI Recommendations

**Status: Draft — awaiting developer review before implementation tickets are created**

**Research date: 2026-05-25**

---

## 1. Summary Table

| # | Problem | Recommended solution | Effort |
|---|---------|----------------------|--------|
| 1 | Crowded HUD — 9 items crammed into one bar | Split into two tiers: always-visible critical stats + collapsed secondary controls | Small |
| 2 | Finger occlusion during tower placement | Offset ghost: move the placement preview ~110 px above the touch point while a finger is down | Small |
| 3 | Tower upgrade panel occupies map space on small screens | Keep as right-side panel but make it narrower on mobile-scaled; add a "dismiss on canvas tap" shortcut | Small |
| 4 | Shop buttons too small / too close together after 0.54× scale | Shop buttons are already scaled via `--ui-scale`; main gap is that only 4 buttons exist and they share space with a text label — remove the label, spread to full width | Small |
| 5 | Radial menus — whether to introduce one | Do NOT add a radial menu for tower placement or upgrades; keep both as they are with targeted size/layout fixes | None |

---

## 2. Detailed Recommendations

### 2.1 HUD Decluttering

**What commercial games do.**
BTD6 (mobile-first game) shows only three items permanently in its top bar: round number, lives, and cash. All action buttons (fast-forward, pause) sit in a corner cluster and are secondary. Kingdom Rush uses the same hierarchy: permanent stat glancers (lives, gold) anchored in fixed corners; secondary buttons (speed, shop) tuck into corners where thumbs naturally rest. Plants vs Zombies keeps its HUD to three persistent items and hides everything else off the game board. The pattern across all three is identical: "three or fewer critical stats always visible; everything else secondary."

**Which of this game's items are truly glanceable.**
Lives and cash are decision-making stats — the player checks them before every tower purchase and after every enemy breach. Wave counter (N/10) informs the "how much longer must I hold on" calculation. These three items must be permanently and prominently visible. The score and kill counter are vanity stats — useful after a wave, not during it. The wave preview icons (`hud-preview`) are useful at wave-start but noise during combat. The fast-forward, mute, pause, and fullscreen buttons are infrequently tapped controls; they do not need prime real estate.

**Concrete recommendation.**
Reorganise `#hud` into two visual groups without changing the DOM order or splitting into two separate elements:

- **Left cluster (always visible, large):** ❤️ lives · 💰 cash · 🌊 wave
- **Right cluster (secondary, smaller):** ⏩ FF · ⏸ pause · 🔊 mute · ⛶ FS · [Start Wave]

Reduce the score (`#hud-score`) and kill counter (`#hud-kills`) font to 85% and dim them with `opacity: 0.6`. Reduce `#hud-preview` max-width further on mobile (the existing 120 px mobile value is fine; cut it to `display: none` on mobile-scaled to free up space entirely — wave content is on the canvas via boss warning anyway). Separate left/right with a `margin-left: auto` spacer (already used on `#hud-start`).

No element needs to be hidden behind a tap. The existing `--ui-scale` compensation already brings every button up to the minimum physical size; the problem is visual density, not tap-target size. A collapsible HUD would introduce more friction than it removes — players tap the area instinctively and a hide/show toggle risks accidental pauses.

**Do not change:** the overall position-fixed DOM overlay approach; the `--ui-scale` compensation; the `Start Wave` green CTA button already has `margin-left: auto` separating it well.

---

### 2.2 Placement Finger Occlusion

**What commercial games do.**
BTD6 offers two placement modes: "Drag and Drop" (drag from shop button, release on map — finger never rests over the final tile) and "Drop and Lock" (tap to place ghost, then tap a floating green tick to confirm). The drag-and-drop mode eliminates occlusion because the finger lifts before the placement tile is final. Kingdom Rush uses a two-tap confirm pattern: first tap on an empty slot opens the tower-select overlay; second tap (on the overlay button, not the map) purchases and places. PvZ uses drag-to-lane: the user drags a plant card from the tray; the card preview follows their finger but the lane indicator is shown to the side, not under the finger.

The academic literature frames this as the "fat finger / Shift technique" problem: the simplest fix is to show a callout or ghost 80–120 px above the touch centroid while the finger is held, so the user can see the snap tile without occluding it.

**Why drag-to-place fits this game best.**
The game already dispatches synthetic `mousemove` events from `touchmove` (see `main.js` line 489–491) and a `click` from `touchend` (line 493–495). The ghost already renders in the `TowerRenderer` via `setHoverTile`. Extending this to "drag from shop button" requires only two changes: (a) adding `touchstart`/`touchmove`/`touchend` listeners to each `.tower-btn` that forward the drag position into the canvas coordinate system, and (b) offsetting the ghost position by –110 px in canvas Y while a drag is active. The offset should only apply while `pointerType === 'touch'` (detectable via a boolean flag set in the tower-btn touchstart handler).

**Concrete offset ghost recommendation.**
When a touch `touchmove` event fires on the canvas with a tower type selected, compute canvas Y as normal but subtract 110 canvas pixels (≈ 60 physical px at 0.54× scale) before calling `snapToGrid`. This places the snap preview above the fingertip. At `touchend`, snap back to the true contact point for the final placement. The ghost stays green/red. No confirm button needed — that adds a second tap and slows down pace. The existing `touchcancel` handler already clears the ghost.

**Do not implement** the "Drop and Lock" confirm-tap variant. It is appropriate for games with precise nudging (BTD6 has a nudge mode), but this game's grid-snap already gives adequate precision, and the confirm step adds 1 extra tap per tower placement, which compounds across a full run.

---

### 2.3 Tower Upgrade Panel

**What commercial games do.**
BTD6 dynamically positions its upgrade panel on whichever side of the screen the selected tower is NOT on. If the tower is left-of-centre, the panel slides in from the right; if right-of-centre, from the left. This keeps the maximum map area visible. On phone, the panel is a fixed-width strip (~280px equivalent). BTD6 does NOT use a radial menu for upgrades — there are 3 paths × 5 tiers, which is 15 items: far too many for a radial.

Kingdom Rush uses a small radial for its 2×2 upgrade branches (4 items). It works because there are only 4 items and they map to cardinal directions (up/down/left/right). The same approach would be awkward for this game's 2 paths × 4 tiers = 8 upgrade buttons, because the tiers are sequential dependencies (can't buy tier 3 without tier 2) — a radial collapses that ordering information.

Bottom sheets are the Material/iOS-recommended alternative to side panels on small screens. The NN/g research confirms they are appropriate when content "supplements primary content" and can be dismissed by swiping. However, a bottom sheet for upgrades would cover the path and the currently selected tower, which is exactly the information the player needs while deciding. The side panel preserves map+tower visibility for the left portion of the canvas.

**Concrete recommendation.**
Keep `#tower-panel` as a right-side panel. Make three targeted improvements:

1. **Dynamic side selection.** When `showTowerPanel(tower, cash)` is called, check `tower.x` relative to canvas midpoint (640). If `tower.x > 640` (tower is in the right half), add a CSS class `tower-panel-left` that repositions the panel to the left side (`left: 8px; right: auto`). This keeps the tower itself visible.

2. **Narrower upgrade buttons on mobile.** The `.upg-btn` elements at `min-height: calc(32px * var(--ui-scale))` are sized for readability; the real space pressure is the panel min-width of 260px (scaled). Dropping to 200px and allowing the upgrade-button text to truncate at 16 chars (already `text-overflow: ellipsis`) recovers 60 canvas pixels.

3. **Close on canvas tap outside panel.** Currently, tapping anywhere on canvas that doesn't hit a tower hides the panel (see `main.js` line 524). This already works. No additional change needed.

**What NOT to do:** Do not convert upgrades to a radial menu. The tier-dependency information (colour coding of bought/next/locked tiers) requires a linear list. Radial menus carry no ordering semantics, which would force the player to memorise which direction means which tier.

---

### 2.4 Shop / Tower Picker

**What commercial games do.**
All major mobile TD games use a bottom strip for the tower/plant shop, not a radial. PvZ's seed-card tray, BTD6's bottom monkey bar, Kingdom Rush's build-slot circles — all are horizontal strips. The radial picker exists in some RTS games (e.g. StarCraft II) but is not used in TD because the tower count (4–8) is too few to benefit from a radial and the strip is already optimal for one-row scannable choice.

**Tap-target size analysis.**
Apple HIG minimum: 44×44 pt physical. Google Material minimum: 48×48 dp physical. At 0.54× scale on a phone with 2× device pixel ratio, a logical canvas pixel is ≈ 0.54 × (1/2 DPR) physical mm ≈ 0.27 physical mm per logical pixel. The CSS `--ui-scale` is `1/0.54 ≈ 1.85`. The current `min-height: calc(48px * var(--ui-scale))` means the DOM button is rendered at `48 × 1.85 = 88.8 CSS pixels`. At 0.54× CSS transform that becomes `88.8 × 0.54 ≈ 48 CSS pixels` on the physical screen, which at ~2× device pixel ratio is ≈ 9.1 mm — exactly the Google Material minimum. The current sizing is correct.

**Where the real problem is.**
The shop has a `<span>Place:</span>` label taking up ~50px of the 100%-width bar, and a hard `gap: 8px` between 4 buttons. On a narrow phone (~360px physical), the bar is `360 / 0.54 ≈ 667 logical CSS pixels` wide but the container clips at 1280 logical. The actual rendered physical width of the shop bar is `360px`, and the 4 buttons share `360 - 14 - 14 (padding) - 50 (label) - 24 (3 × 8px gaps) = 258px` → ~64px each. That meets the 48dp floor but leaves no margin.

**Concrete recommendations.**
- Remove the `<span>Place:</span>` text label from `#tower-shop` — players know what the shop bar is, and the icon prefix on each button (🎯 💣 ❄️ 🔭) already identifies type.
- Change the `gap` to `flex: 1` on each `.tower-btn` so buttons expand to fill the full bar width.
- No radial picker needed. With the label removed and buttons set to `flex: 1`, each button becomes ~80px wide on a typical phone (~337px bar), well above the 48dp minimum.

---

### 2.5 Radial Menus

**Where radial menus work well in mobile games.**
Radial menus excel when: (a) there are 3–6 equally weighted options, (b) the options map naturally to compass directions (up = move, left = attack etc.), (c) the menu appears contextually at the point of interaction rather than in a fixed corner, and (d) options are iconically representable without text. They compress well into the thumb zone and make gesture-recall faster than visual scanning. Kingdom Rush's 4-direction upgrade branches (ABCD, mapped to N/E/S/W) are the canonical TD example.

**Where radial menus fail.**
They fail when: (a) items have sequential dependencies (can't buy item 3 without item 2 — radial has no "locked" state with clear causality), (b) more than 6–8 items are needed (sectors become too narrow to tap accurately), (c) items require text labels to distinguish them (upgrades need cost + name + stat preview — a radial can't show that), or (d) the screen is in landscape and the radial would spawn at the vertical midline, extending into both top and bottom dead zones. All four failure conditions apply to this game's upgrade panel.

**Verdict for this game.**
- **Tower type selection (shop):** Radial is NOT appropriate. The shop has only 4 items but they're always visible and horizontal scanning is fast. A radial launched by long-press would add ~300ms delay to every placement, a significant tax in a wave-pressure situation.
- **Upgrade path selection:** Radial is NOT appropriate. 2 paths × 4 tiers = 8 items with clear tier-order dependencies. The existing vertical upgrade column is the correct structure.
- **Targeting mode selection (First/Last/Close/Strong):** A 4-item radial *could* work here — 4 equally weighted options, no dependencies, iconically representable. However, targeting changes are rare (once per tower per game for most players) so the friction cost of the current 4 small buttons is low. Not worth the implementation cost.

---

## 3. Proposed Interaction Flows

### Flow A: Placing a new tower

**Current (mouse):**  
Tap shop button → button highlights yellow → move mouse over canvas → ghost appears at snap tile → click → tower placed.

**Recommended mobile flow (drag-to-place with offset ghost):**

1. Player touches and holds a `.tower-btn` (e.g. 🎯 Dart).
2. On `touchstart` of the shop button: set `selectedTowerType = 'dart'`, activate the yellow border, set a `dragActive = true` flag.
3. Player drags finger onto the canvas without lifting. The `touchmove` handler on the canvas fires. Instead of `snapToGrid(wx, wy)`, compute `snapToGrid(wx, wy - 110)` — the ghost tile is 110 canvas pixels above the finger's actual position.
4. The ghost renders green (valid) or red (invalid) at the offset tile. Player can see clearly — their thumb occludes only empty canvas.
5. Player lifts finger (`touchend`). The handler computes `snapToGrid(wx, wy)` (no offset) for the final placement and proceeds through the existing `click` placement logic. The 110px upward offset was only for preview.
6. If the tap is valid: tower is placed, `dragActive = false`, shop selection cleared (existing behaviour).
7. If the tap-up position is invalid (path tile or occupied): show the existing red ghost flash and do nothing — no tower is placed (existing behaviour).

**Alternative short-tap flow (player taps shop then taps canvas — stays compatible):**  
The existing tap-to-select then tap-to-place flow still works unchanged. The drag flow is additive, not a replacement. Both modes hit the same placement logic in `main.js`.

---

### Flow B: Selecting an existing tower and upgrading it

**Current flow:**  
Tap tower on canvas → `#tower-panel` slides in from right → tap upgrade button → cash deducted, panel re-renders → tap canvas or another tower to dismiss.

**Recommended mobile flow (no structural change, three small improvements):**

1. Player taps a placed tower. The `click` handler detects the nearest tower within `CLICK_RADIUS_SQ` (24² px). **Improvement:** increase `CLICK_RADIUS_SQ` to `32²` on touch devices (the existing `dispatchMouse` path doesn't set `pointerType`, so add a boolean `lastInteractionWasTouch` set in `touchend` handler). This gives a larger hit radius for towers on mobile, compensating for touch imprecision.

2. `showTowerPanel(hit, state.cash)` is called. **Improvement:** before calling, check `hit.x > 640`. If so, add class `tower-panel-left` to `#tower-panel`. CSS for this class: `left: calc(8px * var(--ui-scale)); right: auto;`. This keeps the tower itself in view.

3. Upgrade panel renders as before. Upgrade buttons (`.upg-btn.next`) show name, cost, and stat delta (existing). Player taps an upgrade button. The existing `upgradePathsEl.addEventListener('click', ...)` handler in `GameUI.js` processes the tap. **No change needed here** — buttons are already `min-height: calc(32px * var(--ui-scale))` with `--ui-scale ≈ 1.85`, giving ~59 logical CSS pixels height which scales to ~32 physical px. This meets the minimum.

4. Panel re-renders with the upgraded tier now showing `✓ bought` (green). Player dismisses by tapping canvas, another tower, or the [Sell] button.

**The targeting mode row** (First/Last/Close/Strong): these 4 buttons are the weakest part of the panel on mobile. Each is `min-height: calc(36px * var(--ui-scale))` — fine. But they wrap when panel is narrow. Accept the wrap; do not try to fix it in this pass.

---

## 4. Priority Order

Ranked by (comfort gain) ÷ (implementation effort):

| Priority | Change | Why this ratio is high |
|----------|--------|------------------------|
| 1 | **Offset ghost for touch placement** (Q2) | One-file change in `main.js`: modify the `touchmove` handler to apply a –110px Y offset when `dragActive` is true. The entire ghost system already works — this is 10–15 lines. Eliminates the most frustrating mobile interaction problem. |
| 2 | **HUD reorganisation** (Q1) | CSS-only in `index.html`: add `opacity: 0.6; font-size: 85%` to score/kills stats, remove or hide `#hud-preview` on mobile-scaled, confirm left/right grouping. 15–20 lines of CSS. Immediately reduces visual noise. |
| 3 | **Remove shop label + flex-expand buttons** (Q4) | Delete the `<span>Place:</span>` element from `index.html` and add `flex: 1` to `.tower-btn` in the existing mobile-scaled block. 5 lines. Frees 50px of tap width. |
| 4 | **Dynamic panel side-switching** (Q3) | One JS change in `GameUI.showTowerPanel()`: check `tower.x > 640` and toggle a CSS class. Add `tower-panel-left` CSS rule (3 lines). 10 lines total. Medium value — most towers end up placed on the right half of the canvas near the path anyway. |
| 5 | **Enlarged touch hit radius for tower tap** (Flow B step 1) | Add a `lastInteractionWasTouch` boolean, use `32²` radius for touch vs `24²` for mouse. 5 lines in `main.js`. Low effort, reduces missed taps on dense tower clusters. |

---

## 5. Things NOT to Change

**The CSS `transform: scale()` + `--ui-scale` compensation system (MB3/MB5).** This is well-implemented. All DOM elements already multiply their logical sizes by `--ui-scale` so they remain physically correct regardless of CSS zoom. Do not change the scaling architecture.

**The `getBoundingClientRect()` coordinate mapping in input handlers.** The formula `(e.clientX - rect.left) * (canvas.width / rect.width)` correctly handles any CSS transform applied to the canvas. It does not need a separate touch coordinate fix.

**The `position: fixed` DOM overlay approach.** HUD and shop are fixed DOM elements, not scaled PixiJS objects. This is correct — it means the `--ui-scale` trick works and DOM accessibility is preserved.

**The existing `touchstart/touchmove/touchend → dispatchMouse` forwarding pattern.** The approach of synthesising `MouseEvent` objects from touch events and re-dispatching them works correctly and keeps the mouse-path code as the single source of truth for placement logic.

**Tower shop as a permanent bottom strip.** The strip pattern is universally validated by BTD6, Kingdom Rush, and PvZ. Do not replace it with a radial, a slide-out drawer, or a long-press gesture. The strip is always visible and scannable.

**The upgrade panel DOM structure (two `div.upgrade-col` columns).** The two-column layout with tier-order top-to-bottom correctly encodes the dependency hierarchy. Do not restructure it.

**The `touchcancel → mouseleave` ghost-clear handler.** This correctly kills the placement ghost if the OS interrupts the touch (notification pull-down etc.). Keep it.

**The portrait lockout overlay (`#rotate-screen`).** Correct and necessary. Landscape-only is the right constraint for this game's 16:9 canvas.

---

*Research sources consulted: Apple HIG (44pt minimum), Google Material Design (48dp minimum), BTD6 placement mode documentation, Kingdom Rush mobile UI analysis (Emily Miles / emilym.space, Josh Bauer joshbauer94.wordpress.com), NN/g bottom-sheet guidelines, radial-menu usability research (Kirill Grouchnikov / pushing-pixels.org, Lucy Morris / blog.prototypr.io), Vogel & Baudisch "Shift" technique (CHI 2007), PvZ mobile UI breakdown.*
