import { Graphics } from 'pixi.js';
import { buildPath } from '../core/Path.js';

export class MapBuilder {
  #g;
  #renderer;
  #waypoints = [];
  #smooth = false;
  #cursorX = -1;
  #cursorY = -1;
  #clickHandler;
  #moveHandler;
  #leaveHandler;

  init(renderer) {
    this.#renderer = renderer;
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
    this.#g.visible = false;
  }

  enter() {
    this.#waypoints = [];
    this.#smooth = false;
    this.#cursorX = -1;
    this.#g.visible = true;

    const canvas = this.#renderer.canvas;
    this.#clickHandler  = e => this.#onClick(e);
    this.#moveHandler   = e => this.#onMove(e);
    this.#leaveHandler  = () => { this.#cursorX = -1; this.#redraw(); };

    canvas.addEventListener('click',      this.#clickHandler);
    canvas.addEventListener('mousemove',  this.#moveHandler);
    canvas.addEventListener('mouseleave', this.#leaveHandler);

    document.getElementById('builder-undo').onclick       = () => this.#undo();
    document.getElementById('builder-clear').onclick      = () => this.#clear();
    document.getElementById('builder-copy').onclick       = () => this.#copyJSON();
    document.getElementById('builder-straight').onclick   = () => this.#setSmooth(false);
    document.getElementById('builder-smooth-btn').onclick = () => this.#setSmooth(true);

    this.#syncModeButtons();
    this.#syncCount();
    this.#redraw();
  }

  exit() {
    this.#g.visible = false;
    this.#g.clear();
    this.#renderer.flush();
    document.getElementById('builder-labels').innerHTML = '';

    const canvas = this.#renderer.canvas;
    canvas.removeEventListener('click',      this.#clickHandler);
    canvas.removeEventListener('mousemove',  this.#moveHandler);
    canvas.removeEventListener('mouseleave', this.#leaveHandler);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  #setSmooth(v) {
    this.#smooth = v;
    this.#syncModeButtons();
    this.#redraw();
  }

  #undo() {
    this.#waypoints.pop();
    this.#syncCount();
    this.#redraw();
  }

  #clear() {
    this.#waypoints = [];
    this.#syncCount();
    this.#redraw();
  }

  #copyJSON() {
    if (!this.#waypoints.length) return;
    const lines = this.#waypoints.map(p => `      { x: ${p.x}, y: ${p.y} }`);
    navigator.clipboard.writeText(`waypoints: [\n${lines.join(',\n')}\n    ],`).then(() => {
      const btn = document.getElementById('builder-copy');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }

  #onClick(e) {
    const { x, y } = this.#toCanvas(e);
    this.#waypoints.push({ x, y });
    this.#syncCount();
    this.#redraw();
  }

  #onMove(e) {
    const { x, y } = this.#toCanvas(e);
    this.#cursorX = x;
    this.#cursorY = y;
    this.#redraw();
  }

  #toCanvas(e) {
    const rect = this.#renderer.canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * (this.#renderer.width  / rect.width)),
      y: Math.round((e.clientY - rect.top)  * (this.#renderer.height / rect.height)),
    };
  }

  #redraw() {
    const g  = this.#g;
    const wp = this.#waypoints;
    const hasCursor = this.#cursorX >= 0 && wp.length >= 1;

    g.clear();

    // Committed path
    if (wp.length >= 2) {
      const pts = this.#smooth ? buildPath(wp, true).waypoints : wp;
      g.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
      g.stroke({ color: 0xc8a96e, width: 38, alpha: 0.9 });
    }

    // Ghost segment from last committed point to cursor
    if (hasCursor) {
      const last = wp[wp.length - 1];
      g.moveTo(last.x, last.y);
      g.lineTo(this.#cursorX, this.#cursorY);
      g.stroke({ color: 0xc8a96e, width: 38, alpha: 0.3 });
    }

    // Waypoint dots: green = start, red = end, yellow = middle
    for (let i = 0; i < wp.length; i++) {
      const p = wp[i];
      const color = i === 0              ? 0x22c55e
                  : i === wp.length - 1 && wp.length > 1 ? 0xef4444
                  : 0xfbbf24;
      g.circle(p.x, p.y, 10);
      g.fill({ color });
      g.circle(p.x, p.y, 10);
      g.stroke({ color: 0x000000, width: 2 });
    }

    // Cursor dot
    if (hasCursor) {
      g.circle(this.#cursorX, this.#cursorY, 6);
      g.fill({ color: 0xfbbf24, alpha: 0.75 });
    }

    this.#renderer.flush();
    this.#syncLabels();
  }

  #syncLabels() {
    const container = document.getElementById('builder-labels');
    container.innerHTML = '';
    this.#waypoints.forEach((p, i) => {
      const el = document.createElement('span');
      el.className = 'builder-label';
      el.style.left = p.x + 'px';
      el.style.top  = p.y + 'px';
      el.textContent = i + 1;
      container.appendChild(el);
    });
  }

  #syncCount() {
    const n = this.#waypoints.length;
    document.getElementById('builder-count').textContent = `${n} pt${n !== 1 ? 's' : ''}`;
  }

  #syncModeButtons() {
    document.getElementById('builder-straight').classList.toggle('active', !this.#smooth);
    document.getElementById('builder-smooth-btn').classList.toggle('active', this.#smooth);
  }
}
