import { Application } from 'pixi.js';

export const GAME_WIDTH  = 1280;
export const GAME_HEIGHT = 720;

export class Renderer {
  #app;

  async init(container) {
    this.#app = new Application();
    await this.#app.init({
      width:           GAME_WIDTH,
      height:          GAME_HEIGHT,
      backgroundColor: 0x2d5a27,
      antialias:       true,
      autoStart:       false,
    });
    this.#app.ticker.stop();
    container.appendChild(this.#app.canvas);
    return this;
  }

  get stage()  { return this.#app.stage; }
  get canvas() { return this.#app.canvas; }
  get width()  { return GAME_WIDTH; }
  get height() { return GAME_HEIGHT; }

  flush() {
    this.#app.renderer.render(this.#app.stage);
  }
}
