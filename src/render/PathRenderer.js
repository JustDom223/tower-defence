import { Graphics } from 'pixi.js';

// Static road renderer — no update/render loop needed; path never changes.
export class PathRenderer {
  init(renderer, path) {
    const g  = new Graphics();
    const wp = path.waypoints;

    g.moveTo(wp[0].x, wp[0].y);
    for (let i = 1; i < wp.length; i++) g.lineTo(wp[i].x, wp[i].y);
    g.stroke({ color: 0xc8a96e, width: 40 });

    g.circle(wp[0].x, wp[0].y, 14);
    g.fill({ color: 0x22c55e }); // entry

    const last = wp[wp.length - 1];
    g.circle(last.x, last.y, 14);
    g.fill({ color: 0xef4444 }); // exit

    renderer.stage.addChild(g);
  }
}
