# Design Review — Mobile UI Changes

> **Status:** 🟡 Draft for review — not yet a spec. This is the shortlist version of the research in `DESIGN_mobile-ui.md`, reformatted the same way as `DESIGN_towers-and-enemies.md` so you can mark it up. Tick the `[ ]` **Keep?** boxes for the changes you want to take forward, strike out the rest, and scribble notes inline. Once shortlisted, the survivors get turned into proper `SPEC_*` tickets. Nothing here is pre-ticked — every box is your call.

## The principle this is built around

The mobile layer already works: the canvas is 1280×720 scaled to fit the phone via CSS `transform: scale()` (~0.54× on a typical phone), and every DOM control multiplies its size by `--ui-scale` so it stays physically tappable. **The research conclusion was that nothing structural is broken — the wins are targeted fixes, not a rebuild.** So every entry below is a small, isolated change that leaves the existing scaling/coordinate system untouched. The big "do not touch" list is at the end (Part 6) because *not* changing those is itself a design decision worth confirming.

The other recurring theme: **resist radial menus.** The research looked hard at radials for the shop, the upgrade panel, and targeting modes, and recommended against all three. Those rejections are listed as their own Keep? items (Part 5) so you can override them if you disagree.

## How to read the effort tags

- **CSS-only** — lives entirely in `index.html`; no logic touched. Lowest risk.
- **One-file JS** — a handful of lines in `main.js` or `GameUI.js`; reuses systems that already exist.
- **Multi-touch / new input path** — adds a touch listener or a piece of input state; slightly higher effort but still additive (the mouse path stays the single source of truth).

---

# Part 1 — Placement & input

### 1. Offset ghost for touch placement
- [ ] **Keep?**
- **What it is:** while a finger is dragging on the canvas, render the placement ghost ~110 canvas px *above* the fingertip so the thumb never covers the snap tile. On lift, snap to the true contact point for the actual placement — the offset is preview-only.
- **Why it matters:** this is the single most frustrating mobile problem — you can't tell if the ghost is green or red until you've already placed. Fixes the "fat finger" occlusion outright.
- **Effort:** One-file JS — modify the `touchmove` handler in `main.js` to subtract 110 from canvas Y while a drag is active. ~10–15 lines; the ghost system already exists. *(Research called this priority #1.)*

### 2. Drag-from-shop-button placement
- [ ] **Keep?**
- **What it is:** touch-and-hold a tower button, then drag straight onto the canvas without lifting; the ghost follows, releasing places it. Additive — the existing tap-shop-then-tap-canvas flow still works unchanged.
- **Why it matters:** mirrors BTD6's "drag and drop" mode; the finger lifts before the tile is final, which is the cleanest way to kill occlusion. Pairs naturally with #1.
- **Effort:** Multi-touch / new input path — add `touchstart/move/end` listeners to each `.tower-btn` that forward the drag into canvas coords. Couples with the offset ghost.

### 3. Enlarged touch hit-radius for selecting a tower
- [ ] **Keep?**
- **What it is:** use a 32²-px tap radius on touch vs the current 24² for mouse, so taps on dense tower clusters register more reliably. Gated behind a `lastInteractionWasTouch` flag set in the `touchend` handler.
- **Why it matters:** touch is less precise than a cursor; missed taps on clustered towers are a quiet but constant annoyance.
- **Effort:** One-file JS — ~5 lines in `main.js`.

---

# Part 2 — HUD & layout

### 4. Two-tier HUD grouping
- [ ] **Keep?**
- **What it is:** visually split `#hud` into a prominent left cluster (❤️ lives · 💰 cash · 🌊 wave) and a smaller secondary right cluster (⏩ FF · ⏸ pause · 🔊 mute · ⛶ FS · [Start Wave]). No DOM reorder, just grouping + a `margin-left: auto` spacer.
- **Why it matters:** BTD6, Kingdom Rush and PvZ all show ≤3 critical stats prominently and tuck controls into a corner. Right now 9+ items share one flat bar — the problem is visual density, not tap size.
- **Effort:** CSS-only in `index.html`. *(Research priority #2.)*

### 5. Dim the vanity stats (score & kills)
- [ ] **Keep?**
- **What it is:** drop `#hud-score` and `#hud-kills` to ~85% font size and `opacity: 0.6`. They're useful after a wave, noise during one.
- **Why it matters:** de-emphasising vanity stats sharpens the glanceable hierarchy without removing anything.
- **Effort:** CSS-only. Bundles with #4.

### 6. Hide the wave-preview icons on mobile
- [ ] **Keep?**
- **What it is:** `display: none` for `#hud-preview` at mobile scale (the canvas already gives a boss warning, so the info isn't lost).
- **Why it matters:** frees the most horizontal space of any single HUD change; the preview is wave-start info that becomes clutter mid-combat.
- **Effort:** CSS-only. Note: this one's a judgement call — strike it if you'd rather keep the preview visible.

---

# Part 3 — Shop / tower picker

### 7. Remove the "Place:" label + flex-expand the buttons
- [ ] **Keep?**
- **What it is:** delete the `<span>Place:</span>` text from `#tower-shop` and give each `.tower-btn` `flex: 1` so the four buttons fill the whole bar.
- **Why it matters:** the label eats ~50 px and the buttons sit cramped after it. The 🎯 💣 ❄️ 🔭 icons already identify each type, so the label is redundant. Buttons end up ~80 px wide — comfortably above the 48 dp minimum.
- **Effort:** CSS-only + delete one element. ~5 lines. *(Research priority #3.)*

---

# Part 4 — Upgrade panel

### 8. Dynamic panel side-switching
- [ ] **Keep?**
- **What it is:** when a tower in the right half of the canvas (`tower.x > 640`) is selected, slide the upgrade panel in from the *left* instead of the right (toggle a `tower-panel-left` class), so the panel never covers the tower you're inspecting.
- **Why it matters:** this is exactly what BTD6 does — keep the maximum map + selected tower visible. Medium value, since many towers sit on the right near the path anyway.
- **Effort:** One-file JS in `GameUI.showTowerPanel()` + a 3-line CSS rule. *(Research priority #4.)*

### 9. Narrower upgrade panel on mobile
- [ ] **Keep?**
- **What it is:** drop the panel min-width from 260 px to ~200 px and let upgrade-button text truncate (it's already `text-overflow: ellipsis`). Recovers ~60 canvas px.
- **Why it matters:** the panel competes with the canvas on small screens; the space pressure is the panel width, not the button height.
- **Effort:** CSS-only.

### 10. Close-on-canvas-tap *(already works — confirm only)*
- [ ] **Keep?**
- **What it is:** tapping empty canvas already dismisses the panel. Listed only so you can confirm it stays as-is — no work required.
- **Why it matters:** it's the expected dismiss gesture and already functions; flagging it so it isn't accidentally "improved."
- **Effort:** None.

---

# Part 5 — Explicitly rejected ideas (override here if you disagree)

The research recommended *against* each of these. Tick **Keep?** only if you want to overrule the recommendation and explore it anyway.

### 11. Radial menu for the shop / tower picker
- [ ] **Keep? (overrule)**
- **Recommendation: no.** Only 4 items, always visible and fast to scan horizontally. A long-press radial would add ~300 ms to every placement under wave pressure.

### 12. Radial menu for upgrade paths
- [ ] **Keep? (overrule)**
- **Recommendation: no.** 2 paths × 4 tiers = 8 items with sequential dependencies (can't buy tier 3 before tier 2). Radials carry no ordering/locked-state semantics; the vertical column encodes the dependency correctly.

### 13. Radial menu for targeting mode (First/Last/Close/Strong)
- [ ] **Keep? (overrule)**
- **Recommendation: marginal no.** Four equal, dependency-free options *could* suit a radial, but targeting is changed rarely (often once per tower per game), so the current small buttons aren't worth the build cost.

### 14. Bottom-sheet upgrade panel
- [ ] **Keep? (overrule)**
- **Recommendation: no.** A bottom sheet would cover the path and the selected tower — the exact info you need while deciding. The side panel preserves the left portion of the map.

### 15. "Drop and lock" confirm-tap placement
- [ ] **Keep? (overrule)**
- **Recommendation: no.** Grid-snap already gives enough precision; a confirm step adds one extra tap per placement, which compounds across a full run. The offset ghost (#1) solves the same problem with zero extra taps.

---

# Part 6 — Things NOT to change (confirm these stay)

These are working well and the research flagged them as load-bearing. Tick to confirm you agree they're off-limits; strike one if you actually do want it revisited.

- [ ] The CSS `transform: scale()` + `--ui-scale` compensation system — keeps every DOM control physically correct at any zoom.
- [ ] The `getBoundingClientRect()` coordinate mapping in the input handlers — already handles any CSS transform on the canvas.
- [ ] The `position: fixed` DOM overlay approach for HUD + shop (vs scaled PixiJS objects).
- [ ] The `touch → dispatchMouse` forwarding pattern — keeps the mouse path as the single source of truth for placement.
- [ ] Tower shop as a permanent bottom strip — universally validated by BTD6 / Kingdom Rush / PvZ.
- [ ] The two-column upgrade-panel DOM structure — encodes the tier dependency top-to-bottom.
- [ ] The `touchcancel → mouseleave` ghost-clear handler — kills the ghost if the OS interrupts the touch.
- [ ] The portrait lockout overlay (`#rotate-screen`) — landscape-only is correct for a 16:9 canvas.

---

# Part 7 — Suggested sequencing (once you've shortlisted)

A rough read on order, cheapest-and-highest-impact first, so `main` stays runnable the whole way:

**Lowest effort, highest comfort (do first):**
- #1 Offset ghost — biggest single comfort gain, ~15 lines.
- #4 + #5 + #6 HUD grouping / dim vanity stats / hide preview — all CSS, bundle as one ticket.
- #7 Remove shop label + flex buttons — CSS + one deletion.

**Small follow-ups:**
- #8 Dynamic panel side-switching, #9 narrower panel, #3 enlarged hit-radius — each a few lines.

**Only if you want it:**
- #2 Drag-from-shop placement — the one genuinely additive input feature; best done right after #1 since they share the offset logic.

**Suggested next step:** mark your **Keep?** boxes (and overrule any of Part 5 you disagree with), then I'll turn the survivors into `SPEC_*` tickets — CSS-only bundle first, then the input changes one at a time.
