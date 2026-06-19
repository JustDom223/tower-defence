import { Graphics, Sprite, Assets, Container } from 'pixi.js';
import { TOWER_TYPES } from '../data/towers.js';

import archerFrame1Url from '../sprites/towers/archer-frame1.png';
import archerFrame2Url from '../sprites/towers/archer-frame2.png';

const SPRITE_MAP = {
  'archer.jpeg': [archerFrame1Url, archerFrame2Url],
};

const HALF       = 16;
const BARREL_LEN = 14;

export class TowerRenderer {
  #towerG;
  #barrelG;
  #rangeG;
  #hazardG;
  #spriteLayer;
  #textures  = {};
  #sprites   = new Map(); // tower object → Sprite
  #dirty      = true;
  #rangeDirty = false; // true when #rangeG has content that needs clearing
  #selectedTower = null;
  #hoverTile = null; // { x, y, valid, type }

  async init(renderer) {
    this.#hazardG    = new Graphics();
    this.#towerG     = new Graphics();
    this.#spriteLayer = new Container();
    this.#barrelG    = new Graphics();
    this.#rangeG     = new Graphics();
    renderer.stage.addChild(this.#hazardG);
    renderer.stage.addChild(this.#towerG);
    renderer.stage.addChild(this.#spriteLayer);
    renderer.stage.addChild(this.#barrelG);
    renderer.stage.addChild(this.#rangeG);

    for (const [name, urls] of Object.entries(SPRITE_MAP)) {
      const frames = Array.isArray(urls) ? urls : [urls];
      this.#textures[name] = await Promise.all(frames.map(u => Assets.load(u)));
    }
  }

  markDirty()         { this.#dirty = true; }
  setSelectedTower(t) { this.#selectedTower = t; }
  setHoverTile(tile)  { this.#hoverTile = tile; }

  render(towers, hazards) {
    this.#drawHazards(hazards ?? []);

    if (this.#dirty) {
      this.#dirty = false;
      this.#drawBodies(towers);
    }

    this.#syncSprites(towers);

    // Barrels redrawn every frame so rotation is live
    this.#drawBarrels(towers);

    const ht = this.#hoverTile;
    const sel = this.#selectedTower;
    const hasMortar = towers.some(t => t.mortarTargetX !== null);

    if (!ht && !sel && !hasMortar) {
      if (this.#rangeDirty) { this.#rangeG.clear(); this.#rangeDirty = false; }
      return;
    }
    this.#rangeDirty = true;
    this.#rangeG.clear();

    // Placement preview
    if (ht) {
      const def = TOWER_TYPES[ht.type];

      if (def.globalRange) {
        this.#rangeG.rect(0, 0, 1280, 720);
        this.#rangeG.fill({ color: 0xa855f7, alpha: 0.06 });
        this.#rangeG.rect(0, 0, 1280, 720);
        this.#rangeG.stroke({ color: 0xa855f7, width: 3, alpha: 0.4 });
      } else {
        const ringColor = ht.valid ? 0x38bdf8 : 0xef4444;
        this.#rangeG.circle(ht.x, ht.y, def.range);
        this.#rangeG.fill({ color: ringColor, alpha: 0.08 });
        this.#rangeG.circle(ht.x, ht.y, def.range);
        this.#rangeG.stroke({ color: ringColor, width: 2.5, alpha: 0.7 });
      }

      const HALF_PREVIEW = 20;
      this.#rangeG.rect(ht.x - HALF_PREVIEW, ht.y - HALF_PREVIEW, HALF_PREVIEW * 2, HALF_PREVIEW * 2);
      this.#rangeG.fill({ color: ht.valid ? 0x22c55e : 0xef4444, alpha: 0.35 });
    }

    // Selected tower range + AoE ring
    if (sel) {
      if (!sel.globalRange && !sel.mortarMode) {
        this.#rangeG.circle(sel.x, sel.y, sel.range);
        this.#rangeG.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
      }
      if (sel.aoeRadius > 0) {
        this.#rangeG.circle(sel.x, sel.y, sel.aoeRadius);
        this.#rangeG.stroke({ color: 0xfbbf24, width: 1, alpha: 0.4 });
      }
    }

    // Mortar target markers
    for (const t of towers) {
      if (t.mortarTargetX === null) continue;
      const tx = t.mortarTargetX, ty = t.mortarTargetY;
      const S = 8;

      this.#rangeG.moveTo(t.x, t.y);
      this.#rangeG.lineTo(tx, ty);
      this.#rangeG.stroke({ color: 0xef4444, width: 1, alpha: 0.4 });

      this.#rangeG.moveTo(tx - S, ty - S); this.#rangeG.lineTo(tx + S, ty + S);
      this.#rangeG.moveTo(tx + S, ty - S); this.#rangeG.lineTo(tx - S, ty + S);
      this.#rangeG.stroke({ color: 0xef4444, width: 2.5, alpha: 0.9 });

      if (t.aoeRadius > 0) {
        this.#rangeG.circle(tx, ty, t.aoeRadius);
        this.#rangeG.stroke({ color: 0xef4444, width: 1, alpha: 0.35 });
      }
    }
  }

  #drawHazards(hazards) {
    const g = this.#hazardG;
    g.clear();
    for (const h of hazards) {
      const alpha = (h.remaining / 4.0) * 0.35;
      g.circle(h.x, h.y, h.radius);
      g.fill({ color: 0xff6600, alpha });
    }
  }

  #drawBodies(towers) {
    const g = this.#towerG;
    g.clear();
    for (const t of towers) {
      const def = TOWER_TYPES[t.type];
      if (def.sprite) continue; // sprite towers skip the rect
      g.rect(t.x - HALF, t.y - HALF, HALF * 2, HALF * 2);
      g.fill({ color: def.color });
      g.rect(t.x - HALF, t.y - HALF, HALF * 2, HALF * 2);
      g.stroke({ color: 0xffffff, width: 1.5 });
      g.circle(t.x, t.y, 5);
      g.fill({ color: 0x0f172a });
    }
  }

  #syncSprites(towers) {
    const towerSet = new Set(towers);

    // Remove sprites for towers no longer present
    for (const [t, sprite] of this.#sprites) {
      if (!towerSet.has(t)) {
        sprite.destroy();
        this.#sprites.delete(t);
      }
    }

    // Add/update sprites for sprite towers
    for (const t of towers) {
      const def = TOWER_TYPES[t.type];
      if (!def.sprite) continue;

      const frames = this.#textures[def.sprite];
      if (!frames) continue;

      if (!this.#sprites.has(t)) {
        const sprite = new Sprite(frames[0]);
        sprite.anchor.set(0.5, 0.75);
        this.#spriteLayer.addChild(sprite);
        this.#sprites.set(t, sprite);
      }

      const sprite  = this.#sprites.get(t);

      // Pick frame: show release frame briefly after firing, then idle
      const RELEASE_MS = 150;
      const frameIdx = (t.lastFiredAt && performance.now() - t.lastFiredAt < RELEASE_MS) ? 1 : 0;
      sprite.texture = frames[Math.min(frameIdx, frames.length - 1)];

      // Flip horizontally when aiming left
      const facing  = Math.cos(t.angle) < 0 ? -1 : 1;
      const targetH = HALF * 3.5;
      const scale   = targetH / sprite.texture.height;
      sprite.x      = t.x;
      sprite.y      = t.y;
      sprite.scale.set(scale * facing, scale);
    }
  }

  #drawBarrels(towers) {
    const g = this.#barrelG;
    g.clear();
    for (const t of towers) {
      const def = TOWER_TYPES[t.type];
      if (def.sprite) continue; // sprite towers don't need a barrel line
      const ex  = t.x + Math.cos(t.angle) * BARREL_LEN;
      const ey  = t.y + Math.sin(t.angle) * BARREL_LEN;
      g.moveTo(t.x, t.y); g.lineTo(ex, ey);
      g.stroke({ color: 0x000000, width: 5, cap: 'round' });
      g.moveTo(t.x, t.y); g.lineTo(ex, ey);
      g.stroke({ color: def.color, width: 3, cap: 'round' });
    }
  }
}
