import { Graphics, Sprite, Assets, Container } from 'pixi.js';
import { positionAtDistance } from '../core/Path.js';

// Vite resolves these to hashed asset URLs at build time
import dogUrl          from '../sprites/enemies/dog-clean.png';
import monsterUrl      from '../sprites/enemies/monster-clean.png';
import spidermanUrl    from '../sprites/enemies/spiderman-clean.png';
import bugUrl          from '../sprites/enemies/bug2.png';
import frankensteinUrl from '../sprites/enemies/frankenstein.png';
import shadeUrl        from '../sprites/enemies/shade.png';
import infernoUrl      from '../sprites/enemies/inferno.png';

/** Maps the sprite filename (stored on the enemy) to the Vite asset URL. */
const SPRITE_ASSET_URLS = {
  'dog.png':           dogUrl,
  'monster.png':       monsterUrl,
  'spiderman.png':     spidermanUrl,
  'bug.jpeg':          bugUrl,
  'frankenstein.jpeg': frankensteinUrl,
  'shade.jpeg':        shadeUrl,
  'inferno.jpeg':      infernoUrl,
};

export class EnemyRenderer {
  #spriteLayer;          // Container — sprite enemies, rendered below overlays
  #g;                    // Graphics  — circles (non-sprite) + all overlays
  #textures = {};        // spriteName → loaded Texture
  #sprites  = new Map(); // enemy object → Sprite (one per active sprite enemy)

  /** Must be awaited in main.js so textures are ready before the first wave. */
  async init(renderer) {
    // Sprite layer first so it sits below the Graphics overlay layer
    this.#spriteLayer = new Container();
    renderer.stage.addChild(this.#spriteLayer);

    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);

    for (const [name, url] of Object.entries(SPRITE_ASSET_URLS)) {
      this.#textures[name] = await Assets.load(url);
    }
  }

  render(enemies, paths, alpha) {
    // ── 1. Sync sprite objects with current enemy list ────────────────────────
    const activeSet = new Set(enemies);

    for (const [e, sprite] of this.#sprites) {
      if (!activeSet.has(e)) {
        sprite.destroy(); // removes from spriteLayer, does not destroy shared texture
        this.#sprites.delete(e);
      }
    }

    for (const e of enemies) {
      if (!e.sprite) continue; // non-sprite type — circle handled below

      if (!this.#sprites.has(e)) {
        const tex    = this.#textures[e.sprite];
        const sprite = new Sprite(tex);
        sprite.anchor.set(0.5, 0.5);
        this.#spriteLayer.addChild(sprite);
        this.#sprites.set(e, sprite);
      }

      const sprite = this.#sprites.get(e);
      const d   = e.prevDistance + (e.distance - e.prevDistance) * alpha;
      const pos = positionAtDistance(paths[e.pathIndex], d);
      sprite.x = pos.x;
      sprite.y = pos.y;
      // Scale to radius * 2 so all three types match their hitbox footprint
      const size = e.radius * 2;
      sprite.width  = size;
      sprite.height = size;
    }

    // ── 2. Graphics: circles for non-sprite enemies + overlays for all ────────
    const g = this.#g;
    g.clear();

    for (const e of enemies) {
      const d   = e.prevDistance + (e.distance - e.prevDistance) * alpha;
      const pos = positionAtDistance(paths[e.pathIndex], d);

      // Body circle only for types without a sprite
      if (!e.sprite) {
        g.circle(pos.x, pos.y, e.radius);
        g.fill({ color: e.color, alpha: e.isCamo ? 0.45 : 1 });
      }

      // Camo indicator — dashed ghost ring
      if (e.isCamo) {
        g.circle(pos.x, pos.y, e.radius + 4);
        g.stroke({ color: 0x94a3b8, width: 1.5, alpha: 0.6 });
      }

      // Hit-flash overlay (white semi-transparent circle on top of sprite or circle)
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
