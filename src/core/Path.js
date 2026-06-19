/**
 * @typedef {{ x: number, y: number }} Point
 * @typedef {{ waypoints: Point[], segmentLengths: number[], totalLength: number }} ComputedPath
 */

/**
 * Normalise a map definition into an array of ComputedPaths.
 * Maps with a `paths` array get one ComputedPath per route;
 * legacy maps with a single `waypoints` array become a length-1 array.
 * @param {{ waypoints?: Point[], paths?: Point[][] }} mapDef
 * @returns {ComputedPath[]}
 */
export function buildPaths(mapDef) {
  if (mapDef.paths) return mapDef.paths.map(buildPath);
  return [buildPath(mapDef.waypoints)];
}

/**
 * Pre-compute segment lengths from raw waypoints.
 * The returned ComputedPath is the single source of truth for path math;
 * enemies store "distance travelled" as their position key.
 * @param {Point[]} waypoints
 * @returns {ComputedPath}
 */
export function buildPath(waypoints) {
  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dx = waypoints[i + 1].x - waypoints[i].x;
    const dy = waypoints[i + 1].y - waypoints[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }
  return { waypoints, segmentLengths, totalLength };
}

/**
 * Return the world position at a given distance along the path.
 * Clamps to [0, totalLength] so callers don't need to guard.
 * @param {ComputedPath} path
 * @param {number} distance
 * @returns {Point}
 */
export function positionAtDistance(path, distance) {
  distance = Math.max(0, Math.min(distance, path.totalLength));
  let remaining = distance;
  for (let i = 0; i < path.segmentLengths.length; i++) {
    const segLen = path.segmentLengths[i];
    if (remaining <= segLen) {
      const t = remaining / segLen;
      const a = path.waypoints[i];
      const b = path.waypoints[i + 1];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remaining -= segLen;
  }
  return { ...path.waypoints[path.waypoints.length - 1] };
}
