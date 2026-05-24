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
      const def    = TOWER_TYPES[p.towerType] ?? {};
      const color  = def.projColor ?? 0xffffff;
      const radius = p.aoeRadius > 0 ? 7 : 4;

      g.circle(x, y, radius);
      g.fill({ color });
    }
  }
}
