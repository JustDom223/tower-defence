import { Graphics } from 'pixi.js';

// Bolts are brief flashes. Must match the lifetime used to age `boltEvents` in main.js.
const LIFETIME = 0.18;

/**
 * Draws Tesla lightning bolts. Each bolt event is a polyline of world points
 * (tower → primary target → arc links…) with an age `t`. Segments are drawn as
 * jagged, flickering arcs that fade over their short lifetime.
 */
export class LightningRenderer {
  #g;

  init(renderer) {
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
  }

  render(boltEvents) {
    const g = this.#g;
    g.clear();

    for (const b of boltEvents) {
      const a = 1 - b.t / LIFETIME; // fade out over lifetime
      if (a <= 0) continue;

      for (let i = 0; i < b.points.length - 1; i++) {
        const [x1, y1] = b.points[i];
        const [x2, y2] = b.points[i + 1];
        this.#drawBolt(g, x1, y1, x2, y2, a);
      }

      // Small glow at each struck enemy (skip the tower origin at index 0).
      for (let i = 1; i < b.points.length; i++) {
        const [x, y] = b.points[i];
        g.circle(x, y, 6);
        g.fill({ color: 0xfef9c3, alpha: 0.5 * a });
      }
    }
  }

  // One jagged arc between two points: subdivide and jitter perpendicular to the line.
  #drawBolt(g, x1, y1, x2, y2, a) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len; // unit perpendicular
    const segs = Math.max(3, Math.floor(len / 22));

    const pts = [[x1, y1]];
    for (let i = 1; i < segs; i++) {
      const t = i / segs;
      const jitter = (Math.random() * 2 - 1) * Math.min(14, len * 0.12);
      pts.push([x1 + dx * t + nx * jitter, y1 + dy * t + ny * jitter]);
    }
    pts.push([x2, y2]);

    const trace = () => {
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    };

    // Outer glow, then bright white core.
    trace();
    g.stroke({ color: 0xfde047, width: 4, alpha: 0.35 * a, cap: 'round', join: 'round' });
    trace();
    g.stroke({ color: 0xffffff, width: 1.5, alpha: 0.9 * a, cap: 'round', join: 'round' });
  }

  destroy() {
    this.#g?.destroy();
  }
}
