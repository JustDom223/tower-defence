/**
 * Play-test harness — paste into the browser console (dev server) to drive and
 * observe a real run. Relies on the `window.__pt = { state, ui, loop, renderer,
 * paths, profile }` dev handle exposed at the end of main().
 *
 * It drives the REAL UI/input paths (ui.selectTowerType, synthetic canvas clicks,
 * ui.onUpgrade, ui.onStartWave) so combat, economy, perks and rendering all behave
 * exactly as they do for a human player — the harness only reads state for telemetry.
 *
 * Usage:
 *   PT.fresh()                       // wipe profile → fresh first-time player, reloads
 *   PT.place('archer', 120, 240)     // select + place a tower at world (x,y)
 *   PT.upgrade(0, 'A')               // buy next Path-A upgrade on tower #0
 *   PT.sell(0)
 *   await PT.runWave({maxSpeed:8})   // start next wave, resolve when it clears
 *   PT.snapshot()                    // { wave, lives, cash, score, kills, enemies, towers }
 *   PT.log                           // array of per-wave telemetry rows
 */
(() => {
  const H = window.__pt;
  if (!H) { console.error('[PT] window.__pt missing — start a run first.'); return; }
  const { state, ui, renderer } = H;
  const canvas = renderer.canvas;
  const W = renderer.width, Hh = renderer.height;

  // World (x,y) -> client coords, accounting for CSS scaling, then fire a real click.
  function clickWorld(wx, wy) {
    const r = canvas.getBoundingClientRect();
    const clientX = r.left + wx * (r.width  / W);
    const clientY = r.top  + wy * (r.height / Hh);
    canvas.dispatchEvent(new MouseEvent('click', {
      bubbles: true, cancelable: true, view: window, clientX, clientY,
    }));
  }

  const PT = {
    log: [],

    fresh() {
      localStorage.removeItem('tower-defence-profile-v1');
      localStorage.removeItem('tower-defence-v1');
      location.reload();
    },

    snapshot() {
      const s = window.__pt.state;
      return {
        wave: s.waveIndex + 1, lives: s.lives, cash: s.cash, score: s.score,
        kills: s.kills, enemies: s.enemies.length, towers: s.towers.length,
        waveActive: s.waveActive,
      };
    },

    place(type, x, y) {
      const before = state.towers.length;
      ui.selectTowerType(type);
      clickWorld(x, y);
      ui.clearTowerTypeSelection?.();
      const ok = state.towers.length > before;
      if (!ok) console.warn(`[PT] place ${type} @${x},${y} FAILED (cost/overlap/path).`);
      return ok;
    },

    upgrade(i, path) {
      const t = state.towers[i];
      if (!t) return false;
      const before = path === 'A' ? t.upgradesA : t.upgradesB;
      ui.onUpgrade(t, path);
      return (path === 'A' ? t.upgradesA : t.upgradesB) > before;
    },

    sell(i) { const t = state.towers[i]; if (t) ui.onSellTower(t); },

    setSpeed(mult) { window.__pt.loop.speed = mult; state.loopSpeed = mult; },

    // Start the next wave and resolve once it is fully cleared (or a timeout).
    runWave({ maxSpeed = 4, timeoutMs = 120000 } = {}) {
      const s = window.__pt.state;
      this.setSpeed(maxSpeed);
      ui.onStartWave();
      const startWave = s.waveIndex;
      return new Promise((resolve) => {
        const t0 = performance.now();
        const iv = setInterval(() => {
          const done = !s.waveActive && s.spawnerDone && s.enemies.length === 0;
          const timedOut = performance.now() - t0 > timeoutMs;
          if (done || timedOut || s.gameOver) {
            clearInterval(iv);
            const row = { ...this.snapshot(), wave: startWave + 1, timedOut, gameOver: s.gameOver };
            this.log.push(row);
            console.log('[PT] wave', row.wave, 'cleared →', JSON.stringify(row));
            resolve(row);
          }
        }, 100);
      });
    },
  };

  window.PT = PT;
  console.log('[PT] harness ready. Towers:', state.towers.length, 'Snapshot:', PT.snapshot());
  return PT;
})();
