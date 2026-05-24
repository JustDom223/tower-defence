export class WaveSpawner {
  #pool;
  #difficulty;
  #waves;
  #wave = null;
  #groupIndex = 0;
  #spawnedInGroup = 0;
  #timer = 0;

  /**
   * @param {ObjectPool} enemyPool
   * @param {{ hpMult: number, speedMult: number }} difficulty  – from DIFFICULTIES
   * @param {Array}  waves  – per-map wave definition array
   */
  constructor(enemyPool, difficulty = { hpMult: 1, speedMult: 1 }, waves = []) {
    this.#pool       = enemyPool;
    this.#difficulty = difficulty;
    this.#waves      = waves;
  }

  startWave(waveIndex) {
    this.#wave           = this.#waves[waveIndex];
    this.#groupIndex     = 0;
    this.#spawnedInGroup = 0;
    this.#timer          = 0;
  }

  /** Advances spawning by dt seconds. Returns true when all enemies are spawned. */
  update(dt, enemies) {
    if (!this.#wave) return true;

    this.#timer -= dt;

    while (this.#timer <= 0) {
      const group = this.#wave[this.#groupIndex];
      if (!group) { this.#wave = null; return true; }

      if (this.#spawnedInGroup < group.count) {
        const enemy = this.#pool.acquire({ type: group.type });
        // M4 — scale HP and speed by difficulty multipliers
        enemy.hp    = Math.ceil(enemy.hp    * this.#difficulty.hpMult);
        enemy.maxHp = Math.ceil(enemy.maxHp * this.#difficulty.hpMult);
        enemy.speed = enemy.speed * this.#difficulty.speedMult;
        enemies.push(enemy);
        this.#spawnedInGroup++;
        this.#timer += group.interval;
      }

      if (this.#spawnedInGroup >= group.count) {
        this.#groupIndex++;
        this.#spawnedInGroup = 0;
        this.#timer += 1.5; // pause between groups
      }
    }

    return false;
  }
}
