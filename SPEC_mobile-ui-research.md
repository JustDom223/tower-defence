# SPEC — Mobile UI Research & Recommendations

**Status: ⬜ Not started**

---

## Brief

This is a **research ticket**, not an implementation ticket. The output is a design recommendation document (`DESIGN_mobile-ui.md`) that a developer can turn into implementation tickets.

The game is a **1280×720 tower defence** running in a mobile browser (landscape orientation, phone screen). It uses CSS `transform: scale()` to fit the canvas to the viewport — on a typical phone the scale is ~0.54×, which means the logical canvas is large but the physical pixels are small.

---

## Problems to solve

1. **Crowded HUD** — The top HUD bar packs: wave counter, lives, cash, kill count, wave preview icons, Start Wave, Fast-forward, Mute, Pause, and now Fullscreen. On a phone this is dense and tap targets are small.

2. **Turret placement finger-occlusion** — When placing a tower, the player taps to position it. Their finger covers the exact spot they're trying to place on. They can't see whether the ghost is green (valid) or red (invalid) until they lift their finger — by which time it's already placed.

3. **Tower selection & upgrade panel** — Tapping an existing tower opens a side panel with upgrade columns, stats, and a sell button. On a small screen this competes for space with the game canvas.

4. **Shop / tower-select bar** — The bottom of the screen has tower type buttons (Dart, Bomb, Frost, Marksman). These are small and close together.

---

## Current UI structure (know before recommending)

```
[ HUD bar — full width, top ]
  wave N/10 | ♥ lives | $ cash | kills | wave-preview icons | [Start] [FF] [Mute] [Pause] [FS]

[ Game canvas — 1280×720, scaled ]
  Path + towers + enemies

[ Tower shop — bottom strip ]
  [Dart $150] [Bomb $200] [Frost $175] [Marksman $300]

[ Tower panel — slides in from right when tower selected ]
  Tower name & tier label
  Path A upgrades (4 tiers)    Path B upgrades (4 tiers)
  Stats row (DMG / RNG / RATE)
  [Sell $xx]
```

HUD + shop are DOM elements layered over the PixiJS canvas via `position: fixed`.

---

## Research questions

For each problem, investigate what **modern mobile tower-defence and strategy games** do, then give a concrete recommendation tailored to this game's structure.

### 1. HUD decluttering
- What HUD elements do mobile TD games (BTD6, Kingdom Rush, Plants vs Zombies) show permanently vs hide behind a tap?
- Is a collapsible / auto-hide HUD worth it, or does that add friction?
- Which of this game's HUD items are "glanceable always" vs "tap to see"?
- Recommendation: what to keep visible, what to collapse, and where to put it.

### 2. Placement finger-occlusion
- What techniques do mobile games use so the player can see what they're placing while their finger is down?
  - **Offset ghost** — the placement preview floats 80–120 px *above* the finger, so the player sees the position without occlusion.
  - **Drag-to-place** — player touches the tower button and *drags* to the map; the ghost follows the drag; releasing places it. The thumb never obscures the final position.
  - **Confirm tap** — first tap shows a ghost + a floating confirm button; second tap (on the confirm) commits the placement.
- Which approach fits this game best? Consider: the game already has a mousemove ghost — extending that to touch drag is low friction.

### 3. Tower panel on small screens
- Does the panel need to be a full side panel, or can it be a bottom sheet / modal that slides up from the bottom?
- Can upgrade actions be a radial menu around the selected tower (in-canvas) rather than a DOM panel?
- What do BTD6 / Kingdom Rush do for upgrade UI on phone?

### 4. Shop / tower picker
- Is a bottom strip the right pattern, or is a radial wheel launched by long-press / drag-from-edge better?
- What's the minimum tap-target size for comfortable phone play (Apple HIG says 44 pt; Google Material says 48 dp)?
- Are the current tower buttons large enough after the 0.54× scale?

### 5. Radial menus specifically
- Where do radial menus work well in mobile games, and where do they hurt?
- Is a radial appropriate for: (a) selecting a tower type to place, (b) choosing an upgrade path, (c) something else?

---

## Deliverable

Write `DESIGN_mobile-ui.md` in `C:\Repos\Tower Defence\` with:

1. **Summary table** — one row per problem, recommended solution, effort estimate (Small / Medium / Large).
2. **Detailed recommendations** — for each of the 5 research questions, 2–3 paragraphs with specific UI patterns, why they work, and how they'd map to this game's existing DOM/canvas structure.
3. **Proposed interaction flow** — walk through the two key player journeys on mobile:
   - Placing a new tower (from picking type → positioning → confirming)
   - Selecting an existing tower and upgrading it
4. **Priority order** — which changes give the most comfort improvement for the least implementation effort.
5. **Things NOT to change** — anything the research says is already fine.

Use web search to look at current mobile TD game UI patterns and HIG/Material guidelines. Screenshots or ASCII mockups are welcome but not required.

---

## Files to produce

| File | Description |
|---|---|
| `DESIGN_mobile-ui.md` | Research output — design recommendations, not code |

No code changes in this ticket. Implementation tickets are created separately once the design is approved.
