/**
 * @typedef {{ name: string, waypoints: { x: number, y: number }[] }} MapDef
 * @type {Record<string, MapDef>}
 */
export const MAPS = {
  map1: {
    name: 'Serpentine',
    waypoints: [
      { x:    0, y: 300 },
      { x:  250, y: 300 },
      { x:  250, y: 130 },
      { x:  650, y: 130 },
      { x:  650, y: 450 },
      { x:  380, y: 450 },
      { x:  380, y: 590 },
      { x:  900, y: 590 },
      { x:  900, y: 300 },
      { x: 1080, y: 300 },
      { x: 1080, y: 130 },
      { x: 1280, y: 130 },
    ],
  },

  map2: {
    name: 'Zigzag',
    waypoints: [
      { x:    0, y: 590 },
      { x:  350, y: 590 },
      { x:  350, y: 130 },
      { x:  650, y: 130 },
      { x:  650, y: 590 },
      { x:  950, y: 590 },
      { x:  950, y: 300 },
      { x: 1280, y: 300 },
    ],
  },
};
