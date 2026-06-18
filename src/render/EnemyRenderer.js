import { Graphics, Sprite, Assets, Container } from 'pixi.js';
import { positionAtDistance } from '../core/Path.js';

// Vite resolves these to hashed asset URLs at build time
import dogUrl          from '../sprites/dog.png';
import monsterUrl      from '../sprites/monster.png';
import spidermanUrl    from '../sprites/spiderman.png';
import bugUrl          from '../sprites/bug.jpeg';
import demonUrl        from '../sprites/demon.jpeg';
import frankensteinUrl from '../sprites/frankenstein.jpeg';
import shadeUrl        from '../sprites/shade.jpeg';
import infernoUrl      from '../sprites/inferno.jpeg';

/** Maps the sprite filename (stored on the enemy) to the Vite asset URL. */
const SPRITE_ASSET_URLS = {
  'dog.png':          { url: dogUrl,          threshold: 240 },
  'monster.png':      { url: monsterUrl,      threshold: 240 },
  'spiderman.png':    { url: spidermanUrl,    threshold: 240 },
  'bug.jpeg':         { url: bugUrl,          threshold: 200 },
  'demon.jpeg':       { url: demonUrl,        threshold: 200 },
  'frankenstein.jpeg':{ url: frankensteinUrl, threshold: 200 },
  'shade.jpeg':       { url: shadeUrl,        threshold: 240 },
  'inferno.jpeg':     { url: infernoUrl,      threshold: 240 },
};

/**
 * Load an image URL, flood-fill the white background from all four corners to
 * make it transparent, then return a PixiJS Texture with true alpha.
 * Threshold 240 catches off-white anti-alias fringe; interior whites
 * (e.g. highlights) that aren't connected to the border are preserved.
 */
async function loadWithTransparentBg(url, threshold = 240) {
  // 1. Load the image into a canvas
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload  = () => resolve(i);
    i.onerror = reject;
    i.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width  = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imageData.data; // flat Uint8ClampedArray: R,G,B,A per pixel
  const w = canvas.width, h = canvas.height;

  // 2. Flood-fill from the four corners to find all background pixels.
  //    We use a simple BFS/queue starting at the border pixels that are
  //    near-white, then propagate to connected near-white neighbours.
  const visited = new Uint8Array(w * h); // 0 = unvisited

  function isNearWhite(idx) {
    return d[idx] >= threshold && d[idx + 1] >= threshold && d[idx + 2] >= threshold;
  }

  const queue = [];
  function enqueue(x, y) {
    const i = y * w + x;
    if (!visited[i] && isNearWhite(i * 4)) {
      visited[i] = 1;
      queue.push(i);
    }
  }

  // Seed from all border pixels
  for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
  for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w - 1, y); }

  // BFS
  while (queue.length) {
    const idx = queue.pop();
    const x = idx % w, y = Math.floor(idx / w);
    // Make transparent
    d[idx * 4 + 3] = 0;
    // Check 4-connected neighbours
    if (x > 0)     enqueue(x - 1, y);
    if (x < w - 1) enqueue(x + 1, y);
    if (y > 0)     enqueue(x, y - 1);
    if (y < h - 1) enqueue(x, y + 1);
  }

  ctx.putImageData(imageData, 0, 0);

  // 3. Snapshot pixels into a data URL then load as a PixiJS texture.
  //    Texture.from(canvas) can read a stale canvas in PixiJS 8; the data URL
  //    captures the pixel data at this exact moment before anything else runs.
  const dataUrl = canvas.toDataURL('image/png');
  return Assets.load(dataUrl);
}

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

    // Pre-load all sprite textures with white background stripped
    for (const [name, { url, threshold }] of Object.entries(SPRITE_ASSET_URLS)) {
      this.#textures[name] = await loadWithTransparentBg(url, threshold);
    }
  }

  render(enemies, path, alpha) {
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
      const pos = positionAtDistance(path, d);
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
      const pos = positionAtDistance(path, d);

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
