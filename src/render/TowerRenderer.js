import { Graphics } from 'pixi.js';
import { TOWER_TYPES } from '../data/towers.js';
import { TILE_SIZE } from '../core/Grid.js';

const HALF       = 16;
const BARREL_LEN = 14;

export class TowerRenderer {
  #towerG;
  #barrelG;
  #rangeG;
  #dirty = true;
  #selectedTower = null;
  #hoverTile = null; // { col, row, valid, type }

  init(renderer) {
    this.#towerG  = new Graphics();
    this.#barrelG = new Graphics();
    this.#rangeG  = new Graphics();
    renderer.stage.addChild(this.#towerG);
    renderer.stage.addChild(this.#barrelG);
    renderer.stage.addChild(this.#rangeG);
  }

  markDirty()         { this.#dirty = true; }
  setSelectedTower(t) { this.#selectedTower = t; }
  setHoverTile(tile)  { this.#hoverTile = tile; }

  render(towers) {
    if (this.#dirty) {
      this.#dirty = false;
      this.#drawBodies(towers);
    }

    // Barrels redrawn every frame so rotation is live
    this.#drawBarrels(towers);

    this.#rangeG.clear();

    // Placement preview
    const ht = this.#hoverTile;
    if (ht) {
      const tx = ht.col * TILE_SIZE;
      const ty = ht.row * TILE_SIZE;
      this.#rangeG.rect(tx, ty, TILE_SIZE, TILE_SIZE);
      this.#rangeG.fill({ color: ht.valid ? 0x22c55e : 0xef4444, alpha: 0.35 });

      if (ht.valid) {
        const def = TOWER_TYPES[ht.type];
        const cx = tx + TILE_SIZE / 2, cy = ty + TILE_SIZE / 2;
        if (!def.globalRange) {
          this.#rangeG.circle(cx, cy, def.range);
          this.#rangeG.stroke({ color: 0xffffff, width: 1, alpha: 0.2 });
        } else {
          this.#rangeG.rect(0, 0, 1280, 720);
          this.#rangeG.stroke({ color: 0xa855f7, width: 1, alpha: 0.15 });
        }
      }
    }

    // Selected tower range + AoE ring
    const sel = this.#selectedTower;
    if (sel) {
      if (!sel.globalRange) {
        this.#rangeG.circle(sel.x, sel.y, sel.range);
        this.#rangeG.stroke({ color: 0xffffff, width: 1, alpha: 0.3 });
      }
      if (sel.aoeRadius > 0) {
        this.#rangeG.circle(sel.x, sel.y, sel.aoeRadius);
        this.#rangeG.stroke({ color: 0xfbbf24, width: 1, alpha: 0.4 });
      }
    }
  }

  #drawBodies(towers) {
    const g = this.#towerG;
    g.clear();
    for (const t of towers) {
      const def = TOWER_TYPES[t.type];
      g.rect(t.x - HALF, t.y - HALF, HALF * 2, HALF * 2);
      g.fill({ color: def.color });
      g.rect(t.x - HALF, t.y - HALF, HALF * 2, HALF * 2);
      g.stroke({ color: 0xffffff, width: 1.5 });
      g.circle(t.x, t.y, 5);
      g.fill({ color: 0x0f172a });
    }
  }

  #drawBarrels(towers) {
    const g = this.#barrelG;
    g.clear();
    for (const t of towers) {
      const def = TOWER_TYPES[t.type];
      const ex  = t.x + Math.cos(t.angle) * BARREL_LEN;
      const ey  = t.y + Math.sin(t.angle) * BARREL_LEN;
      // Dark outline
      g.moveTo(t.x, t.y); g.lineTo(ex, ey);
      g.stroke({ color: 0x000000, width: 5, cap: 'round' });
      // Coloured barrel
      g.moveTo(t.x, t.y); g.lineTo(ex, ey);
      g.stroke({ color: def.color, width: 3, cap: 'round' });
    }
  }
}
