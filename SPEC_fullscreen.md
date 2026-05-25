# SPEC — Fullscreen support

**Status: ✅ Done**

---

## Is it possible?

Yes. Every modern browser ships the [Fullscreen API](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API):

| Platform | Support |
|---|---|
| Chrome / Edge (desktop & Android) | ✅ Full support |
| Firefox | ✅ Full support |
| Safari desktop | ✅ Full support |
| iOS Safari | ✅ Safari 16.4+ (released Mar 2023) |
| PWA / standalone mode | Already chrome-free — fullscreen changes little on mobile installs |

One hard browser rule: fullscreen can **only be entered from a user gesture** (a button click). It can't be triggered automatically on page load.

---

## Goal

Add a **fullscreen toggle button** that:
- Appears on the **map-select screen** (so players can go fullscreen before starting)
- Appears in the **HUD** during play (so they can toggle mid-game)
- Scales the game canvas **up to fill the screen** when in fullscreen (currently the scale is capped at 1× even on large monitors)
- Updates its icon to reflect the current state (enter / exit)

---

## Acceptance criteria

- [x] A fullscreen button (`⛶`) is visible on the map-select panel.
- [x] A fullscreen button (`⛶`) is visible in the HUD bar during play, styled the same as `#hud-mute` / `#hud-pause`.
- [x] Clicking either button calls `document.documentElement.requestFullscreen()` and enters fullscreen.
- [x] While in fullscreen, the button icon changes to `✕` (or `⊠`) and clicking it calls `document.exitFullscreen()`.
- [x] Pressing **Escape** (browser native behaviour) also exits fullscreen; the button icon updates accordingly via the `fullscreenchange` event.
- [x] In fullscreen, the game **upscales to fill the screen** — the `scale` cap of `1` is lifted so the canvas fills the available viewport while preserving the 16:9 aspect ratio (letterbox bars remain for screens wider or taller than 16:9).
- [x] On non-fullscreen desktop, the game continues to cap at scale 1 (no change to current behaviour).
- [x] `mobile-scaled` class logic is unaffected — it depends on `window.innerWidth/Height` and the short-dimension check, both of which remain correct after fullscreen resizes the viewport.
- [x] The rotate-screen overlay (portrait lockout) continues to work correctly in fullscreen portrait on mobile.

---

## Implementation

### 1. `index.html` — HUD button

Add `#hud-fs` to the HUD bar, between `#hud-pause` and `#hud-ff`:

```html
<button id="hud-fs">⛶</button>
```

Style alongside the other grey HUD icon buttons:

```css
#hud-fs { background: #374151; padding: 5px 9px; }
```

Add to the existing selectors that share HUD button styles:
```css
#hud-start, #hud-ff, #hud-mute, #hud-pause, #hud-fs { ... }
```

Add to `body.mobile-scaled` block (same rule as `#hud-mute` / `#hud-pause`):
```css
body.mobile-scaled #hud-mute,
body.mobile-scaled #hud-pause,
body.mobile-scaled #hud-fs { ... }
```

### 2. `index.html` — map-select button

Add a small fullscreen button to the map-select panel footer (below `#map-upgrades`):

```html
<button id="map-fs" style="
  background: none; border: 1px solid #334155; color: #64748b;
  border-radius: 6px; padding: 4px 10px; font-size: 12px; cursor: pointer;
  margin-top: 8px; width: 100%;
">⛶ Fullscreen</button>
```

(Inline style acceptable here since it's a one-off element; move to a CSS rule if preferred.)

### 3. `index.html` — `scaleGame` function

Allow upscaling when in fullscreen by removing the `1` cap conditionally:

```js
function scaleGame() {
  var inFullscreen = !!document.fullscreenElement;
  var scale = Math.min(
    inFullscreen ? Infinity : 1,   // ← lift cap in fullscreen
    window.innerWidth  / VIRTUAL_W,
    window.innerHeight / VIRTUAL_H
  );
  var scaledW  = VIRTUAL_W * scale;
  var scaledH  = VIRTUAL_H * scale;
  var offsetX  = Math.max(0, (window.innerWidth  - scaledW) / 2);
  var offsetY  = Math.max(0, (window.innerHeight - scaledH) / 2);
  container.style.transformOrigin = 'top left';
  container.style.transform =
    'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + scale + ')';
  document.documentElement.style.setProperty('--ui-scale', (1 / scale).toFixed(6));
  var isMobileSize = Math.min(window.innerWidth, window.innerHeight) < 500;
  document.body.classList.toggle('mobile-scaled', scale < 0.95 && isMobileSize);
}
```

`scaleGame` is already called on `resize` events. The `fullscreenchange` event triggers a native resize, so `scaleGame` fires automatically when entering/exiting fullscreen — **no additional listener needed**.

### 4. `src/main.js` (or inline script) — fullscreen toggle logic

Wire up both buttons with shared logic. Add after the existing HUD button listeners:

```js
function toggleFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen().catch(() => {
      // requestFullscreen can reject if called outside a user gesture
      // (shouldn't happen here, but guard anyway)
    });
  }
}

function updateFsButtons() {
  const icon = document.fullscreenElement ? '✕' : '⛶';
  const hudBtn = document.getElementById('hud-fs');
  const mapBtn = document.getElementById('map-fs');
  if (hudBtn) hudBtn.textContent = icon;
  if (mapBtn) mapBtn.textContent = document.fullscreenElement ? '✕ Exit fullscreen' : '⛶ Fullscreen';
}

document.addEventListener('fullscreenchange', updateFsButtons);
document.getElementById('hud-fs')?.addEventListener('click', toggleFullscreen);
document.getElementById('map-fs')?.addEventListener('click', toggleFullscreen);
```

The `?.` guards handle the case where the HUD is not yet in the DOM when the script runs (the HUD is hidden until game-active, but the element exists; `?.` is just defensive).

---

## Files to change

| File | Change |
|---|---|
| `index.html` | Add `#hud-fs` button + CSS; add `#map-fs` button to map panel; update `scaleGame` to lift scale cap in fullscreen |
| `src/main.js` | Add `toggleFullscreen`, `updateFsButtons`, and event listeners for both buttons and `fullscreenchange` |

---

## Notes

- **Why `document.documentElement` not `#game-container`?** Fullscreening the root element gives the browser a full black background to fill with; fullscreening just the game container would leave the rest of the page visible outside it, which looks wrong.
- **PixiJS canvas resolution stays 1280×720.** Upscaling is pure CSS transform — pixels get larger but the game logic is unchanged. On a 4K monitor the upscale would be ~2×, which looks fine for a retro-style game. If pixel-sharp 4K is ever wanted, that's a separate ticket (involves resizing the PixiJS renderer).
- **iOS caveat:** On iOS Safari, fullscreen enters a "minimal-chrome" mode rather than true fullscreen. The bottom home-bar indicator may still be visible. This is a browser limitation, not something we can work around.
- **PWA installs:** On Android/iOS when installed as a PWA, the manifest already sets `"display": "standalone"` which hides browser chrome. Fullscreen on an installed PWA gives a small additional gain (hides the status bar) — still worth supporting.
