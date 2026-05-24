export class WaveSpawner {
  #pool;
  #difficulty;
  #mapHpMult;
  #waves;
  #wave = null;
  #groupIndex = 0;
  #spawnedInGroup = 0;
  #timer = 0;

  /**
   * @param {ObjectPool} enemyPool
   * @param {{ hpMult: number, speedMult: number }} difficulty  – from DIFFICULTIES
   * @param {Array}  waves      – per-map wave definition array
   * @param {number} mapHpMult  – C2 per-map HP curve multiplier (from maps.js)
   */
  constructor(enemyPool, difficulty = { hpMult: 1, speedMult: 1 }, waves = [], mapHpMult = 1) {
    this.#pool       = enemyPool;
    this.#difficulty = difficulty;
    this.#mapHpMult  = mapHpMult;
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
        // M4/C2 — scale HP by difficulty × per-map curve; speed by difficulty only
        const hpScale = this.#difficulty.hpMult * this.#mapHpMult;
        enemy.hp    = Math.ceil(enemy.hp    * hpScale);
        enemy.maxHp = Math.ceil(enemy.maxHp * hpScale);
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
