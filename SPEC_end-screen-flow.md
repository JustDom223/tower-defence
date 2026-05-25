# SPEC — End screen flow: Continue vs Try Again

**Status: ✅ Done**

---

## Problem

The end screen always shows a single green button labelled **"Play Again"** that calls `location.reload()`. This is confusing because:

- On a **win**, reloading drops the player back at the map-select screen — they have to manually find and re-click the next map. "Play Again" implies replaying the same map, not continuing the campaign.
- On a **loss**, the label is fine in principle, but "Try Again" is more natural.

---

## Goal

Make the end screen button contextually correct:

| Outcome | Button label | Action |
|---|---|---|
| **Win** | Continue | Go to map select (same as today — `location.reload()`) |
| **Loss** | Try Again | `clearSave()` + `location.reload()` (drops back to map select, no continue prompt) |

Both actions end up at the map-select screen; only the label and the save-clearing behaviour differ.

---

## Acceptance criteria

- [x] After a **win**, the button reads **"Continue"** (not "Play Again").
- [x] After a **loss**, the button reads **"Try Again"** (not "Play Again").
- [x] Clicking **Continue** (win) reloads the page. The mid-run save is already cleared on win, so the player lands at a clean map select ready to pick the next map.
- [x] Clicking **Try Again** (loss) calls `clearSave()` before reloading, discarding the failed run's checkpoint so no stale "Continue" prompt appears on the map-select.
- [x] No visual or layout changes — only the button label and the click handler differ between outcomes.

---

## Implementation

### `src/ui/GameUI.js` — `showEndScreen`

`showEndScreen` already receives a `won` boolean. Use it to set both the button label and register a context-appropriate click handler.

Replace the static handler currently on line ~120:
```js
document.getElementById('end-restart').addEventListener('click', () => location.reload());
```

...with a dynamic one driven by the `won` param inside `showEndScreen`:

```js
showEndScreen(won, score, stars = 0, availableStars = 0, newBest = false) {
  // ... existing title/score/stars logic unchanged ...

  const btn = document.getElementById('end-restart');
  btn.textContent = won ? 'Continue' : 'Try Again';
  // Replace any prior handler cleanly
  const newBtn = btn.cloneNode(true);
  btn.replaceWith(newBtn);
  newBtn.addEventListener('click', () => {
    if (!won) clearSave();   // discard failed-run checkpoint
    location.reload();
  });
}
```

`cloneNode` + `replaceWith` removes the old event listener before attaching the new one, so calling `showEndScreen` more than once (e.g. after respec) doesn't stack handlers.

### Import `clearSave` in `GameUI.js`

`clearSave` is already imported in `main.js` from `'../core/SaveSystem.js'`. Either:
- Pass it as a constructor argument: `new GameUI(clearSave)` (store as `#clearSave`), or
- Import it directly at the top of `GameUI.js`: `import { clearSave } from '../core/SaveSystem.js';`

Direct import is simpler.

### `index.html` — static label

Change the static HTML label from `Play Again` to an empty string or a placeholder — the JS always sets it before the screen is shown, so the initial value doesn't matter:

```html
<button id="end-restart"></button>
```

---

## Files to change

| File | Change |
|---|---|
| `src/ui/GameUI.js` | Set `btn.textContent` in `showEndScreen`; dynamic click handler; import `clearSave` |
| `index.html` | Optional: blank out the static "Play Again" label on `#end-restart` |

No changes to `main.js`, `SaveSystem.js`, or any data files.
