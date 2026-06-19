const SAVE_KEY = 'tower-defence-v2';

/**
 * Persist mid-game state (called on wave completion).
 * Only serialises what's needed to resume; enemies/projectiles are discarded.
 */
export function saveGame(state) {
  const data = {
    mapKey:     state.mapKey,
    difficulty: state.difficulty,
    lives:      state.lives,
    cash:       state.cash,
    score:      state.score,
    waveIndex:  state.waveIndex,
    towers: state.towers.map(t => ({
      type:         t.type,
      x:            t.x,
      y:            t.y,
      targeting:    t.targeting,
      upgradesA:    t.upgradesA,
      upgradesB:    t.upgradesB,
      upgradeSpent: t.upgradeSpent,
    })),
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (_) { /* storage unavailable */ }
}

/** Returns the saved game object, or null if none exists. */
export function loadGame() {
  try { localStorage.removeItem('tower-defence-v1'); } catch (_) {}
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (_) {}
}

/** Restart the current map: preserve fullscreen state, clear save, reload. */
export function requestRestart(mapKey, diffKey) {
  sessionStorage.setItem('restartIntent', JSON.stringify({ mapKey, diffKey }));
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    sessionStorage.setItem('wantFullscreen', '1');
  }
  clearSave();
  location.reload();
}
