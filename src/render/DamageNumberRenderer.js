import { Text } from 'pixi.js';

const LIFETIME = 0.65;

export class DamageNumberRenderer {
  #stage;
  #map = new Map(); // event object → PixiJS Text

  init(renderer) {
    this.#stage = renderer.stage;
  }

  render(damageEvents) {
    const active = new Set(damageEvents);

    // Destroy Text objects for expired events
    for (const [evt, text] of this.#map) {
      if (!active.has(evt)) { text.destroy(); this.#map.delete(evt); }
    }

    // Create Text for new events; update position + alpha for all
    for (const evt of damageEvents) {
      if (!this.#map.has(evt)) {
        const text = new Text({
          text: `-${evt.amount}`,
          style: {
            fontSize:   13,
            fontWeight: 'bold',
            fill:       evt.amount < evt.full ? 0x93c5fd : 0xfef08a,
            dropShadow: { color: 0x000000, blur: 2, distance: 1, alpha: 0.7 },
          },
        });
        text.anchor.set(0.5, 1);
        this.#stage.addChild(text);
        this.#map.set(evt, text);
      }

      const text    = this.#map.get(evt);
      const t       = evt.t / LIFETIME;
      text.x        = evt.x;
      text.y        = evt.y - t * 38;
      text.alpha    = 1 - Math.pow(t, 2);
    }
  }

  destroy() {
    for (const text of this.#map.values()) text.destroy();
    this.#map.clear();
  }
}
