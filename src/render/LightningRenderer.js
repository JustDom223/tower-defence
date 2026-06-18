import { Graphics } from 'pixi.js';

// Instant-strike effects are brief flashes. Must match the lifetime used to age
// `boltEvents` in main.js.
const LIFETIME = 0.18;

/**
 * Draws instant-strike effects for hitscan towers. Each bolt event is a polyline
 * of world points (tower → primary target → further hits) with an age `t`, a
 * `color`, and a `style`:
 *   'arc'  — jagged, flickering lightning between each point (Tesla chain).
 *   'beam' — a clean straight beam from the tower to the farthest hit (Laser/Solar).
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
      const color = b.color ?? 0xfde047;

      if (b.style === 'beam') this.#drawBeam(g, b.points, color, a);
      else                    this.#drawArc(g, b.points, color, a);

      // Small glow at each struck enemy (skip the tower origin at index 0).
      for (let i = 1; i < b.points.length; i++) {
        const [x, y] = b.points[i];
        g.circle(x, y, 6);
        g.fill({ color: 0xffffff, alpha: 0.45 * a });
      }
    }
  }

  // Jagged lightning: subdivide each segment and jitter perpendicular to the line.
  #drawArc(g, points, color, a) {
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[i + 1];
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      const segs = Math.max(3, Math.floor(len / 22));

      const pts = [[x1, y1]];
      for (let s = 1; s < segs; s++) {
        const t = s / segs;
        const jitter = (Math.random() * 2 - 1) * Math.min(14, len * 0.12);
        pts.push([x1 + dx * t + nx * jitter, y1 + dy * t + ny * jitter]);
      }
      pts.push([x2, y2]);

      this.#stroke(g, pts, color, a, 4, 1.5);
    }
  }

  // Clean straight beam from the tower (points[0]) to the farthest struck point.
  #drawBeam(g, points, color, a) {
    const [ox, oy] = points[0];
    let far = points[1] ?? points[0], farD = -1;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i][0] - ox, dy = points[i][1] - oy;
      const d = dx * dx + dy * dy;
      if (d > farD) { farD = d; far = points[i]; }
    }
    this.#stroke(g, [[ox, oy], far], color, a, 5, 2);
  }

  // Draw a polyline twice: a coloured glow underneath, a bright white core on top.
  #stroke(g, pts, color, a, glowW, coreW) {
    const trace = () => {
      g.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
    };
    trace();
    g.stroke({ color, width: glowW, alpha: 0.4 * a, cap: 'round', join: 'round' });
    trace();
    g.stroke({ color: 0xffffff, width: coreW, alpha: 0.9 * a, cap: 'round', join: 'round' });
  }

  destroy() {
    this.#g?.destroy();
  }
}
