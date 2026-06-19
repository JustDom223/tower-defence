import { Graphics } from 'pixi.js';
import { TOWER_TYPES } from '../data/towers.js';

export class ProjectileRenderer {
  #g;

  init(renderer) {
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
  }

  render(projectiles, alpha) {
    const g = this.#g;
    g.clear();

    for (const p of projectiles) {
      const x = p.prevX + (p.x - p.prevX) * alpha;
      const y = p.prevY + (p.y - p.prevY) * alpha;
      const def   = TOWER_TYPES[p.towerType] ?? {};
      const color = def.projColor ?? 0xffffff;

      if (def.projStyle === 'arrow') {
        let dx = p.vx, dy = p.vy;
        if (dx === 0 && dy === 0) { dx = p.x - p.prevX; dy = p.y - p.prevY; }
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        // Perpendicular for arrowhead wings
        const px = -uy, py = ux;
        const SHAFT = 10, HEAD = 5;

        // Shaft
        g.moveTo(x - ux * SHAFT, y - uy * SHAFT);
        g.lineTo(x + ux * HEAD,  y + uy * HEAD);
        g.stroke({ color: 0x8b5e3c, width: 2, cap: 'round' });

        // Arrowhead triangle
        const tip  = { x: x + ux * (HEAD + 4), y: y + uy * (HEAD + 4) };
        const wl   = { x: x + ux * HEAD + px * 4, y: y + uy * HEAD + py * 4 };
        const wr   = { x: x + ux * HEAD - px * 4, y: y + uy * HEAD - py * 4 };
        g.moveTo(tip.x, tip.y);
        g.lineTo(wl.x, wl.y);
        g.lineTo(wr.x, wr.y);
        g.closePath();
        g.fill({ color: 0xc0c0c0 });

      } else if (def.projStyle === 'bullet') {
        // Sniper round — an elongated tracer oriented along its flight, with a
        // faint trail behind it and a small glint at the tip.
        let dx = p.vx, dy = p.vy;
        if (dx === 0 && dy === 0) { dx = p.x - p.prevX; dy = p.y - p.prevY; }
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const BODY = 8, TRAIL = 18;

        g.moveTo(x - ux * TRAIL, y - uy * TRAIL);
        g.lineTo(x, y);
        g.stroke({ color, width: 1.5, alpha: 0.22, cap: 'round' });

        g.moveTo(x - ux * BODY, y - uy * BODY);
        g.lineTo(x + ux * BODY, y + uy * BODY);
        g.stroke({ color, width: 3.5, cap: 'round' });

        g.circle(x + ux * BODY, y + uy * BODY, 1.6);
        g.fill({ color: 0x9ca3af });
      } else {
        g.circle(x, y, p.aoeRadius > 0 ? 7 : 4);
        g.fill({ color });
      }
    }
  }
}
