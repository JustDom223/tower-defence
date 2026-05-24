const SAVE_KEY = 'tower-defence-v1';

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
      col:          t.col,
      row:          t.row,
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
