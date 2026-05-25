# SPEC — Free tower placement

**Status: ✅ Done**

---

## Problem

Towers currently snap to a **40 × 40 px grid** (`TILE_SIZE = 40` in `Grid.js`). On a 1280 × 720 canvas that's only 32 × 18 = 576 possible positions. The coarse grid is visually obvious and limits strategic depth — towers can't be nudged to clip a path corner or pack tightly around a chokepoint.

---

## Goal

Replace grid-snapped placement with **free placement**: the tower ghost follows the cursor smoothly, snapping to a fine **10 px sub-grid** (invisible to the player but enough to keep saving deterministic and avoid floating-point drift). Players can position towers wherever there is no path and no overlap with another tower.

---

## Design

### Collision model

| Check | Current | New |
|---|---|---|
| Not on path | tile centre within 30 px of path segment | tower centre within **40 px** of any path segment |
| Not on another tower | same tile (40 px exclusive) | tower centres at least **44 px** apart (tower visual radius ≈ 20 px, +4 px gap) |
| In bounds | col/row in grid bounds | centre at least **20 px** from each canvas edge |

### Tower identity

Towers are currently identified by `(col, row)`. Under free placement they are identified by `(x, y)` world-pixel coordinates rounded to the 10 px snap grid.

Hit-detection on click changes from exact col/row match to: *nearest tower whose centre is within **24 px** of the click position*.

### Save format

The save payload in `SaveSystem.js` stores `{ col, row }` per tower. Change to `{ x, y }` (snapped world coords). Saved games from before this change are incompatible — clear or version-guard them (bump the save key to `tower-defence-v2` and clear any `v1` key on load).

---

## Acceptance criteria

- [x] Placing a tower: the hover ghost follows the mouse cursor smoothly, snapping to the nearest 10 px.
- [x] Ghost is **green** on a valid position and **red** on an invalid one (path overlap, tower overlap, or out-of-bounds).
- [x] A tower can be placed wherever the ghost is green. No 40 px grid lines or gaps are visible.
- [x] Two towers cannot overlap — their centres must be at least 44 px apart.
- [x] Towers cannot be placed within 40 px of the path centre-line (same effective exclusion as before).
- [x] Clicking an existing tower selects it (nearest-tower-within-24 px logic, not exact col/row).
- [x] Save and load correctly persist tower `x, y` positions; towers reappear in the exact placed spot on continue.
- [x] No mid-run save from before this change causes a crash — old `v1` saves are discarded gracefully.
- [x] All existing systems (targeting, combat, upgrade, sell, rendering) continue to work unchanged.

---

## Implementation

### `src/core/Grid.js` — swap to coordinate-based free collision

Replace the entire file. The grid byte-array is no longer needed; replace with two pure functions that the placement handler calls directly:

```js
export const SNAP = 10;         // sub-grid snap (px)
export const TOWER_RADIUS = 20; // visual half-size of a tower
export const TOWER_MIN_GAP = TOWER_RADIUS * 2 + 4; // min centre-to-centre (44 px)
export const PATH_CLEARANCE = 40; // min centre-to-path-segment distance

export function snapToGrid(wx, wy) {
  return {
    x: Math.round(wx / SNAP) * SNAP,
    y: Math.round(wy / SNAP) * SNAP,
  };
}

function distToSegSq(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
}

/**
 * Returns true if position (x,y) is valid for a new tower.
 * @param {number} x           - snapped world x
 * @param {number} y           - snapped world y
 * @param {Array}  waypoints   - path waypoints [{x,y}, ...]
 * @param {Array}  towers      - existing tower objects [{x,y}, ...]
 * @param {number} canvasW     - game canvas width (default 1280)
 * @param {number} canvasH     - game canvas height (default 720)
 */
export function isPositionFree(x, y, waypoints, towers, canvasW = 1280, canvasH = 720) {
  // Out of bounds
  if (x < TOWER_RADIUS || x > canvasW - TOWER_RADIUS ||
      y < TOWER_RADIUS || y > canvasH - TOWER_RADIUS) return false;

  // Too close to path
  const clearSq = PATH_CLEARANCE ** 2;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i], b = waypoints[i + 1];
    if (distToSegSq(x, y, a.x, a.y, b.x, b.y) < clearSq) return false;
  }

  // Too close to another tower
  const gapSq = TOWER_MIN_GAP ** 2;
  for (const t of towers) {
    if ((x - t.x) ** 2 + (y - t.y) ** 2 < gapSq) return false;
  }

  return true;
}
```

`createGrid`, `blockPathTiles`, `isFree`, `setBlocked`, `tileToWorld`, `worldToTile` are **removed**.

### `src/main.js` — update placement, hit-detection, and hover

**Imports** — remove `createGrid, blockPathTiles, isFree, setBlocked, tileToWorld, worldToTile`; add `snapToGrid, isPositionFree, TOWER_RADIUS`.

**Remove** the `grid` variable and all calls to `createGrid`, `blockPathTiles`, `setBlocked`.

**Mousemove handler:**
```js
renderer.canvas.addEventListener('mousemove', (e) => {
  const rect = renderer.canvas.getBoundingClientRect();
  const wx = (e.clientX - rect.left) * (renderer.width  / rect.width);
  const wy = (e.clientY - rect.top)  * (renderer.height / rect.height);
  const { x, y } = snapToGrid(wx, wy);
  const type = ui.selectedTowerType;
  if (type) {
    const valid = isPositionFree(x, y, path.waypoints, state.towers);
    towerRenderer.setHoverTile({ x, y, valid, type });
  } else {
    towerRenderer.setHoverTile(null);
  }
});
```

**Click handler — tower selection** (find nearest instead of col/row match):
```js
const CLICK_RADIUS_SQ = 24 ** 2;
const hit = state.towers.reduce((best, t) => {
  const d = (wx - t.x) ** 2 + (wy - t.y) ** 2;
  return (!best || d < best.d) ? { t, d } : best;
}, null);
const clickedTower = hit && hit.d < CLICK_RADIUS_SQ ? hit.t : null;
```

**Click handler — tower placement:**
```js
const { x, y } = snapToGrid(wx, wy);
if (!isPositionFree(x, y, path.waypoints, state.towers)) return;
// ... cash check, perk cost calc unchanged ...
const tower = createTower(type, x, y);   // no col/row needed
state.towers.push(tower);
```

**Sell handler** — `setBlocked` call removed; position stored on tower already.

**Save restore loop** — change `tileToWorld(t.col, t.row)` to just `{ x: t.x, y: t.y }`.

### `src/entities/Tower.js` — remove col/row from factory

```js
export function createTower(type, x, y) {
  // col and row fields removed
  return { type, x, y, ... };
}
```

Update `tower.col`, `tower.row` references throughout to `tower.x`, `tower.y`.

### `src/render/TowerRenderer.js` — update hover ghost rendering

The hover ghost currently draws at `tileToWorld(col, row)`. Switch to use `hoverTile.x`, `hoverTile.y` directly (already world coords under the new scheme).

### `src/core/SaveSystem.js` — bump save key

```js
const SAVE_KEY = 'tower-defence-v2';
```

On load, also evict any leftover v1 save:
```js
export function loadGame() {
  try { localStorage.removeItem('tower-defence-v1'); } catch (_) {}
  // ... existing load logic using v2 key ...
}
```

Tower entries in the save payload change from `{ col, row, type, ... }` to `{ x, y, type, ... }`.

---

## Files to change

| File | Change |
|---|---|
| `src/core/Grid.js` | Full rewrite — replace tile grid with `snapToGrid` + `isPositionFree` |
| `src/main.js` | Update imports, remove `grid` var, rewrite mousemove/click placement and hit-detection, fix save restore |
| `src/entities/Tower.js` | Remove `col`/`row` params and fields; factory takes `(type, x, y)` |
| `src/render/TowerRenderer.js` | Hover ghost uses `x`/`y` directly |
| `src/core/SaveSystem.js` | Bump key to `v2`; evict `v1`; save `x`/`y` instead of `col`/`row` |

---

## What does NOT change

- Path rendering, enemy movement, waypoints — untouched
- Combat, targeting, projectile systems — read `tower.x`/`tower.y`, which already exist
- Upgrade system, perk costs, sell logic — amounts unchanged; only `setBlocked` call removed from sell handler
- Audio, UI overlays, HUD — completely unaffected
