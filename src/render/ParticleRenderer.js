import { Graphics } from 'pixi.js';

const LIFETIME = 0.5;

export class ParticleRenderer {
  #g;

  init(renderer) {
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
  }

  render(particles) {
    const g = this.#g;
    g.clear();
    for (const p of particles) {
      const progress = p.t / LIFETIME;
      const r        = 3.5 * (1 - progress);
      if (r <= 0) continue;
      g.circle(p.x, p.y, r);
      g.fill({ color: p.color, alpha: 1 - progress });
    }
  }
}
