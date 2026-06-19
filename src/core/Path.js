/**
 * @typedef {{ x: number, y: number }} Point
 * @typedef {{ waypoints: Point[], segmentLengths: number[], totalLength: number }} ComputedPath
 */

const SMOOTH_SAMPLES = 20; // interpolation steps per original segment

function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * ((2*p1.x) + (-p0.x + p2.x)*t + (2*p0.x - 5*p1.x + 4*p2.x - p3.x)*t2 + (-p0.x + 3*p1.x - 3*p2.x + p3.x)*t3),
    y: 0.5 * ((2*p1.y) + (-p0.y + p2.y)*t + (2*p0.y - 5*p1.y + 4*p2.y - p3.y)*t2 + (-p0.y + 3*p1.y - 3*p2.y + p3.y)*t3),
  };
}

function smoothWaypoints(pts) {
  const result = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 1; s <= SMOOTH_SAMPLES; s++) {
      result.push(catmullRomPoint(p0, p1, p2, p3, s / SMOOTH_SAMPLES));
    }
  }
  return result;
}

/**
 * Normalise a map definition into an array of ComputedPaths.
 * Maps with a `paths` array get one ComputedPath per route;
 * legacy maps with a single `waypoints` array become a length-1 array.
 * @param {{ waypoints?: Point[], paths?: Point[][], smooth?: boolean }} mapDef
 * @returns {ComputedPath[]}
 */
export function buildPaths(mapDef) {
  const smooth = mapDef.smooth ?? false;
  if (mapDef.paths) return mapDef.paths.map(p => buildPath(p, smooth));
  return [buildPath(mapDef.waypoints, smooth)];
}

/**
 * Pre-compute segment lengths from raw waypoints.
 * When smooth=true the waypoints are first expanded via Catmull-Rom interpolation
 * so the path follows curves; all downstream code (positionAtDistance, Grid,
 * PathRenderer) works unchanged since they only see the final waypoint array.
 * @param {Point[]} waypoints
 * @param {boolean} smooth
 * @returns {ComputedPath}
 */
export function buildPath(waypoints, smooth = false) {
  const pts = smooth ? smoothWaypoints(waypoints) : waypoints;
  const segmentLengths = [];
  let totalLength = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segmentLengths.push(len);
    totalLength += len;
  }
  return { waypoints: pts, segmentLengths, totalLength };
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
