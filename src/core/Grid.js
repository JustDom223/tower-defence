export const TILE_SIZE = 40;

function distToSegSq(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return (px - ax) ** 2 + (py - ay) ** 2;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2;
}

export function createGrid(width, height) {
  const cols = Math.floor(width / TILE_SIZE);
  const rows = Math.floor(height / TILE_SIZE);
  return { cols, rows, blocked: new Uint8Array(cols * rows) }; // 0=free 1=path 2=tower
}

export function blockPathTiles(grid, waypoints) {
  const threshSq = 30 * 30; // half road width + margin
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const cx = c * TILE_SIZE + TILE_SIZE / 2;
      const cy = r * TILE_SIZE + TILE_SIZE / 2;
      for (let i = 0; i < waypoints.length - 1; i++) {
        const a = waypoints[i], b = waypoints[i + 1];
        if (distToSegSq(cx, cy, a.x, a.y, b.x, b.y) < threshSq) {
          grid.blocked[r * grid.cols + c] = 1;
          break;
        }
      }
    }
  }
}

export function isFree(grid, col, row) {
  if (col < 0 || row < 0 || col >= grid.cols || row >= grid.rows) return false;
  return grid.blocked[row * grid.cols + col] === 0;
}

export function setBlocked(grid, col, row, value) {
  if (col >= 0 && row >= 0 && col < grid.cols && row < grid.rows)
    grid.blocked[row * grid.cols + col] = value;
}

export function tileToWorld(col, row) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 };
}

export function worldToTile(wx, wy) {
  return { col: Math.floor(wx / TILE_SIZE), row: Math.floor(wy / TILE_SIZE) };
}
