export const SNAP           = 36;
export const TOWER_RADIUS   = 20;
export const TOWER_MIN_GAP  = 36; // Chebyshev — matches SNAP so adjacent cells are always exactly clear
export const PATH_CLEARANCE = 40;

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

export function isPositionFree(x, y, pathsWaypoints, towers, canvasW = 1280, canvasH = 720) {
  if (x < TOWER_RADIUS || x > canvasW - TOWER_RADIUS ||
      y < TOWER_RADIUS || y > canvasH - TOWER_RADIUS) return false;

  const clearSq = PATH_CLEARANCE ** 2;
  for (const waypoints of pathsWaypoints) {
    for (let i = 0; i < waypoints.length - 1; i++) {
      const a = waypoints[i], b = waypoints[i + 1];
      if (distToSegSq(x, y, a.x, a.y, b.x, b.y) < clearSq) return false;
    }
  }

  for (const t of towers) {
    if (Math.max(Math.abs(x - t.x), Math.abs(y - t.y)) < TOWER_MIN_GAP) return false;
  }

  return true;
}
