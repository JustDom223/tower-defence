# SPEC — Restart Map button in pause menu

**Status: ✅ Done**

---

## Goal

Add a **Restart Map** button to the pause menu, between *Resume* and *Main Menu*. Clicking it discards the current run and immediately restarts the same map from wave 1 at the same difficulty — no visit to the map-select screen.

---

## Acceptance criteria

- [x] A "Restart Map" button appears in the pause panel between *Resume* and *Main Menu*.
- [x] Clicking it shows a native `confirm()` dialog: `"Restart this map from wave 1? Current run will be lost."` — cancel returns to the pause menu; confirm proceeds.
- [x] On confirm: the checkpoint save is cleared, the page reloads, and the game starts immediately on the same map and difficulty (skipping the map-select screen).
- [x] The map-select screen is **not** shown during the seamless restart — it fires and completes invisibly.
- [x] After restart, the game is at wave 1 with full starting cash and lives (as if the map was just selected fresh).
- [x] The button is styled with a distinct **amber / orange-red** warning colour (neither green like Resume nor grey like Main Menu).
- [x] `body.mobile-scaled` CSS covers the new button at the same sizes as `#pause-main-menu`.

---

## Implementation

### 1. Carry restart intent across the reload

Before reloading, stash the map and difficulty in `sessionStorage`:

```js
document.getElementById('pause-restart').addEventListener('click', () => {
  if (!confirm('Restart this map from wave 1? Current run will be lost.')) return;
  sessionStorage.setItem('restartIntent', JSON.stringify({ mapKey: state.mapKey, diffKey: state.diffKey }));
  clearSave();
  location.reload();
});
```

`state.mapKey` and `state.diffKey` must be set during game initialisation — verify they exist (see step 3 if not).

### 2. Auto-start on `awaitMapSelect`

At the top of `awaitMapSelect(profile)`, check for a pending restart intent and resolve immediately if found:

```js
const restartRaw = sessionStorage.getItem('restartIntent');
if (restartRaw) {
  sessionStorage.removeItem('restartIntent');
  const { mapKey, diffKey } = JSON.parse(restartRaw);
  // Validate the keys are still legitimate (map unlocked etc.) before trusting them
  return { mapKey, savedData: null, diffKey };
}
```

This makes the function return synchronously before showing any UI, so the map-select overlay never appears.

### 3. Ensure `state.mapKey` and `state.diffKey` exist

In `main()`, after resolving `mapKey` and `diffKey` from `awaitMapSelect`, attach them to the game state so the pause handler can read them:

```js
state.mapKey  = mapKey;
state.diffKey = diffKey;
```

If they are already on `state`, skip this step.

### 4. HTML — add the button

In `index.html`, inside `<div class="pause-actions">`, insert between `#pause-resume` and `#pause-main-menu`:

```html
<button id="pause-restart">Restart Map</button>
```

### 5. CSS — style the new button

```css
#pause-restart {
  background: #431407; border: 1px solid #9a3412; color: #fb923c;
  padding: 8px 28px; border-radius: 8px; cursor: pointer; font-size: 13px;
}
#pause-restart:hover { background: #9a3412; color: #fff; }
```

Add to the `body.mobile-scaled` block (same sizing pattern as `#pause-main-menu`):

```css
body.mobile-scaled #pause-restart {
  font-size: calc(12px * var(--ui-scale));
  padding:   calc(9px * var(--ui-scale)) calc(24px * var(--ui-scale));
  min-height: calc(44px * var(--ui-scale));
}
```

Add to the `@media (hover: none)` block:

```css
#pause-restart:hover { background: #431407 !important; color: #fb923c !important; }
```

---

## Files to change

| File | Change |
|---|---|
| `index.html` | Add `#pause-restart` button HTML; add CSS rules (base, mobile-scaled, hover:none) |
| `src/main.js` | Read `sessionStorage` at top of `awaitMapSelect`; add `pause-restart` click handler; attach `state.mapKey`/`state.diffKey` if not already present |

No new files. No changes to `SaveSystem.js`, `Profile.js`, or any data files.

---

## Out of scope

- Restarting from a specific wave (not needed)
- A "Restart" button on the end screen (separate ticket if wanted)
- Preserving the mid-wave enemy count on restart (wave 1 always starts fresh)
