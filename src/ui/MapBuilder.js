import { Graphics } from 'pixi.js';

const SAMPLES = 20;

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
    y: 0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
  };
}

// Expand per-segment smooth data into a flat drawable point array
function expandMixed(waypoints, segSmooth) {
  const wp = waypoints;
  const out = [wp[0]];
  for (let i = 0; i < wp.length - 1; i++) {
    if (segSmooth[i]) {
      const p0 = wp[Math.max(0, i - 1)];
      const p1 = wp[i];
      const p2 = wp[i + 1];
      const p3 = wp[Math.min(wp.length - 1, i + 2)];
      for (let s = 1; s <= SAMPLES; s++) out.push(catmullRom(p0, p1, p2, p3, s / SAMPLES));
    } else {
      out.push(wp[i + 1]);
    }
  }
  return out;
}

// Draw per-segment path onto a Graphics context as one continuous stroke
function drawSegments(g, waypoints, segSmooth, color, width, alpha) {
  const wp = waypoints;
  if (wp.length < 2) return;
  g.moveTo(wp[0].x, wp[0].y);
  for (let i = 0; i < wp.length - 1; i++) {
    if (segSmooth[i]) {
      const p0 = wp[Math.max(0, i - 1)];
      const p1 = wp[i];
      const p2 = wp[i + 1];
      const p3 = wp[Math.min(wp.length - 1, i + 2)];
      for (let s = 1; s <= SAMPLES; s++) {
        const pt = catmullRom(p0, p1, p2, p3, s / SAMPLES);
        g.lineTo(pt.x, pt.y);
      }
    } else {
      g.lineTo(wp[i + 1].x, wp[i + 1].y);
    }
  }
  g.stroke({ color, width, alpha });
}

export class MapBuilder {
  #g;
  #renderer;
  #paths = [];         // finished paths: [{waypoints, segSmooth}]
  #waypoints = [];     // current path being built
  #segSmooth = [];     // bool[i] = segment from waypoints[i] → [i+1] is curved
  #nextSmooth = false; // mode applied to the NEXT placed segment
  #cursorX = -1;
  #cursorY = -1;
  #clickHandler;
  #moveHandler;
  #leaveHandler;
  #ctxHandler;

  init(renderer) {
    this.#renderer = renderer;
    this.#g = new Graphics();
    renderer.stage.addChild(this.#g);
    this.#g.visible = false;
  }

  enter() {
    this.#paths     = [];
    this.#waypoints = [];
    this.#segSmooth = [];
    this.#nextSmooth = false;
    this.#cursorX   = -1;
    this.#g.visible = true;

    const canvas = this.#renderer.canvas;
    this.#clickHandler  = e => this.#onClick(e);
    this.#moveHandler   = e => this.#onMove(e);
    this.#leaveHandler  = () => { this.#cursorX = -1; this.#redraw(); };
    this.#ctxHandler    = e => this.#onRightClick(e);

    canvas.addEventListener('click',       this.#clickHandler);
    canvas.addEventListener('mousemove',   this.#moveHandler);
    canvas.addEventListener('mouseleave',  this.#leaveHandler);
    canvas.addEventListener('contextmenu', this.#ctxHandler);

    document.getElementById('builder-undo').onclick       = () => this.#undo();
    document.getElementById('builder-clear').onclick      = () => this.#clear();
    document.getElementById('builder-copy').onclick       = () => this.#copyJSON();
    document.getElementById('builder-new-path').onclick   = () => this.#newPath();
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
    canvas.removeEventListener('click',       this.#clickHandler);
    canvas.removeEventListener('mousemove',   this.#moveHandler);
    canvas.removeEventListener('mouseleave',  this.#leaveHandler);
    canvas.removeEventListener('contextmenu', this.#ctxHandler);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  #setSmooth(v) {
    this.#nextSmooth = v;
    this.#syncModeButtons();
  }

  #undo() {
    this.#waypoints.pop();
    if (this.#segSmooth.length > 0) this.#segSmooth.pop();
    this.#syncCount();
    this.#redraw();
  }

  #clear() {
    this.#paths     = [];
    this.#waypoints = [];
    this.#segSmooth = [];
    this.#syncCount();
    this.#redraw();
  }

  // Commit the current path and start a new one
  #newPath() {
    if (this.#waypoints.length >= 2) {
      this.#paths.push({ waypoints: [...this.#waypoints], segSmooth: [...this.#segSmooth] });
    }
    this.#waypoints = [];
    this.#segSmooth = [];
    this.#syncCount();
    this.#redraw();
  }

  #onClick(e) {
    const { x, y } = this.#toCanvas(e);
    if (this.#waypoints.length >= 1) this.#segSmooth.push(this.#nextSmooth);
    this.#waypoints.push({ x, y });
    this.#syncCount();
    this.#redraw();
  }

  // Right-click a waypoint dot to flip that segment's straight/curved mode
  #onRightClick(e) {
    e.preventDefault();
    const { x, y } = this.#toCanvas(e);
    let best = -1, bestDist = 24;
    for (let i = 0; i < this.#waypoints.length - 1; i++) {
      const d = Math.hypot(this.#waypoints[i].x - x, this.#waypoints[i].y - y);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    if (best >= 0) {
      this.#segSmooth[best] = !this.#segSmooth[best];
      this.#redraw();
    }
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

  #copyJSON() {
    const allPaths = [
      ...this.#paths,
      { waypoints: this.#waypoints, segSmooth: this.#segSmooth },
    ].filter(p => p.waypoints.length >= 2);
    if (allPaths.length === 0) return;

    const roundedWps = (wp) => wp.map(p => ({ x: Math.round(p.x), y: Math.round(p.y) }));
    const fmtWps = (pts, indent = '      ') =>
      pts.map(p => `${indent}{ x: ${p.x}, y: ${p.y} }`).join(',\n');

    let text;
    if (allPaths.length === 1) {
      const { waypoints: wp, segSmooth: ss } = allPaths[0];
      const allCurved   = ss.every(s =>  s);
      const allStraight = ss.every(s => !s);

      if (allStraight) {
        text = `waypoints: [\n${fmtWps(roundedWps(wp))}\n    ],`;
      } else if (allCurved) {
        text = `smooth: true,\n    waypoints: [\n${fmtWps(roundedWps(wp))}\n    ],`;
      } else {
        // Mixed segments: pre-expand so the game plays them correctly
        const expanded = roundedWps(expandMixed(wp, ss));
        text = `waypoints: [\n${fmtWps(expanded)}\n    ],`;
      }
    } else {
      // Multi-path: expand smooth segments then emit paths: [...] format
      const bodies = allPaths.map(({ waypoints: wp, segSmooth: ss }) => {
        const expanded = roundedWps(expandMixed(wp, ss));
        return `      [\n${fmtWps(expanded, '        ')}\n      ]`;
      });
      text = `paths: [\n${bodies.join(',\n')}\n    ],`;
    }

    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('builder-copy');
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }

  #redraw() {
    const g  = this.#g;
    const wp = this.#waypoints;
    const ss = this.#segSmooth;
    const hasCursor = this.#cursorX >= 0 && wp.length >= 1;

    g.clear();

    // Finished paths (dimmer)
    for (const path of this.#paths) {
      if (path.waypoints.length >= 2) {
        drawSegments(g, path.waypoints, path.segSmooth, 0xc8a96e, 38, 0.45);
      }
    }

    // Current path
    if (wp.length >= 2) drawSegments(g, wp, ss, 0xc8a96e, 38, 0.9);

    // Ghost segment to cursor — color hints at next segment mode
    if (hasCursor) {
      const last = wp[wp.length - 1];
      g.moveTo(last.x, last.y);
      g.lineTo(this.#cursorX, this.#cursorY);
      g.stroke({ color: this.#nextSmooth ? 0x67e8f9 : 0xc8a96e, width: 38, alpha: 0.25 });
    }

    // Dots for finished paths
    for (const path of this.#paths) this.#drawDots(path.waypoints, path.segSmooth, 0.45);

    // Dots for current path
    if (wp.length > 0) this.#drawDots(wp, ss, 1.0);

    // Cursor dot
    if (hasCursor) {
      g.circle(this.#cursorX, this.#cursorY, 6);
      g.fill({ color: this.#nextSmooth ? 0x67e8f9 : 0xfbbf24, alpha: 0.75 });
    }

    this.#renderer.flush();
    this.#syncLabels();
  }

  #drawDots(wp, ss, alpha) {
    const g = this.#g;
    for (let i = 0; i < wp.length; i++) {
      const p = wp[i];
      const isFirst = i === 0;
      const isLast  = i === wp.length - 1 && wp.length > 1;
      const color = isFirst ? 0x22c55e : isLast ? 0xef4444 : 0xfbbf24;
      g.circle(p.x, p.y, 10);
      g.fill({ color, alpha });
      g.circle(p.x, p.y, 10);
      g.stroke({ color: 0x000000, width: 2, alpha });
      // Cyan inner dot = outgoing segment is curved (right-click to toggle)
      if (!isLast && i < ss.length && ss[i]) {
        g.circle(p.x, p.y, 4);
        g.fill({ color: 0x67e8f9, alpha });
      }
    }
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
    const suffix = this.#paths.length > 0 ? ` · path ${this.#paths.length + 1}` : '';
    document.getElementById('builder-count').textContent = `${n} pt${n !== 1 ? 's' : ''}${suffix}`;
  }

  #syncModeButtons() {
    const curved = this.#nextSmooth;
    document.getElementById('builder-straight').classList.toggle('active', !curved);
    document.getElementById('builder-smooth-btn').classList.toggle('active', curved);
    document.getElementById('builder-hint').textContent = curved
      ? '🔵 Curved'
      : '⬜ Straight';
  }
}
