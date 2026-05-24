const FIXED_DT = 1000 / 60;
const MAX_FRAME_TIME = 250;

export class GameLoop {
  #lastTime = 0;
  #accumulator = 0;
  #running = false;
  #rafId = null;
  #speed = 1;
  #update;
  #render;

  constructor({ update, render }) {
    this.#update = update;
    this.#render = render;
  }

  get speed() { return this.#speed; }
  set speed(v) { this.#speed = v; }

  start() {
    this.#running = true;
    this.#lastTime = performance.now();
    this.#rafId = requestAnimationFrame(this.#tick);
  }

  stop() {
    this.#running = false;
    if (this.#rafId !== null) cancelAnimationFrame(this.#rafId);
  }

  #tick = (now) => {
    if (!this.#running) return;
    this.#rafId = requestAnimationFrame(this.#tick);

    let elapsed = (now - this.#lastTime) * this.#speed;
    if (elapsed > MAX_FRAME_TIME) elapsed = MAX_FRAME_TIME;
    this.#lastTime = now;

    this.#accumulator += elapsed;
    while (this.#accumulator >= FIXED_DT) {
      this.#update(FIXED_DT / 1000);
      this.#accumulator -= FIXED_DT;
    }

    this.#render(this.#accumulator / FIXED_DT);
  };
}
