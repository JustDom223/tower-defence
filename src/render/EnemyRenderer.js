import { Graphics } from 'pixi.js';
import { positionAtDistance } from '../core/Path.js';

export class EnemyRenderer {
  #g;

  init(renderer) {
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
  }

  render(enemies, path, alpha) {
    const g = this.#g;
    g.clear();

    for (const e of enemies) {
      const d   = e.prevDistance + (e.distance - e.prevDistance) * alpha;
      const pos = positionAtDistance(path, d);

      // Body
      g.circle(pos.x, pos.y, e.radius);
      g.fill({ color: e.color });

      // Hit flash overlay
      if (e.flashTimer > 0) {
        const a = Math.min(1, e.flashTimer / 0.06);
        g.circle(pos.x, pos.y, e.radius);
        g.fill({ color: 0xffffff, alpha: a * 0.75 });
      }

      // Slow indicator ring
      if (e.slowFactor < 1) {
        g.circle(pos.x, pos.y, e.radius + 3);
        g.stroke({ color: 0x67e8f9, width: 2 });
      }

      // HP bar
      const bw = e.radius * 2.5, bh = 4;
      const bx = pos.x - bw / 2, by = pos.y - e.radius - 8;
      const frac = e.hp / e.maxHp;
      g.rect(bx, by, bw, bh);
      g.fill({ color: 0x1f2937 });
      g.rect(bx, by, bw * frac, bh);
      g.fill({ color: frac > 0.5 ? 0x22c55e : frac > 0.25 ? 0xf59e0b : 0xef4444 });
    }
  }
}
