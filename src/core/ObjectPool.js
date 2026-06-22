export class ObjectPool {
  #pool = [];
  #create;
  #reset;

  constructor(create, reset) {
    this.#create = create;
    this.#reset = reset;
  }

  acquire(args) {
    const obj = this.#pool.length > 0 ? this.#pool.pop() : this.#create();
    this.#reset(obj, args);
    return obj;
  }

  release(obj) {
    this.#pool.push(obj);
  }

  /** Discard all cached instances. Next acquire() creates fresh objects. */
  clear() {
    this.#pool.length = 0;
  }
}
