import { TOWER_TYPES }             from '../data/towers.js';
import { MAX_TIER, CROSSPATH_CAP } from '../systems/UpgradeSystem.js';
import AudioManager                from '../audio/AudioManager.js';

/**
 * R6 — Upgrade delta preview.
 * Given the tower's current live stats and the tier's stat deltas, returns a
 * short "→ STAT new-value" string showing the result after buying.
 */
function upgradeDeltaPreview(tower, tierStats) {
  const parts = [];
  if (tierStats.damage     != null) parts.push(`DMG ${tower.damage + tierStats.damage}`);
  if (tierStats.range      != null) parts.push(`RNG ${tower.range  + tierStats.range}`);
  if (tierStats.fireRate   != null) parts.push(`RATE ${(tower.fireRate  + tierStats.fireRate).toFixed(1)}/s`);
  if (tierStats.aoeRadius  != null) parts.push(`AoE ${tower.aoeRadius  + tierStats.aoeRadius}`);
  if (tierStats.globalRange)        parts.push('RNG ∞');
  if (tierStats.slowFactor   != null) {
    const newPct = Math.round((1 - (tower.slowFactor + tierStats.slowFactor)) * 100);
    parts.push(`SLOW -${newPct}%`);
  }
  if (tierStats.slowDuration != null)
    parts.push(`DUR ${(tower.slowDuration + tierStats.slowDuration).toFixed(1)}s`);
  return parts.length ? `→ ${parts.join('  ')}` : '';
}

export class GameUI {
  #livesEl;
  #cashEl;
  #waveEl;
  #scoreEl;
  #killsEl;
  #previewEl;
  #startBtn;
  #ffBtn;
  #towerPanel;
  #towerNameEl;
  #upgradePathsEl;
  #statsEl;
  #sellBtn;
  #endScreen;
  #selectedTowerType = null;
  #selectedTower     = null;
  #currentCash       = 0;

  /** profile.unlocks snapshot — set via setProfileUnlocks() */
  #profileUnlocks = null;

  onStartWave       = null; // () => void
  onTargetingChange = null; // (tower, mode) => void
  onSellTower       = null; // (tower) => void
  onTowerTypeSelect = null; // (type | null) => void
  onUpgrade         = null; // (tower, path) => void
  onToggleFF        = null; // () => void

  init() {
    this.#livesEl        = document.getElementById('hud-lives');
    this.#cashEl         = document.getElementById('hud-cash');
    this.#waveEl         = document.getElementById('hud-wave');
    this.#scoreEl        = document.getElementById('hud-score');
    this.#killsEl        = document.getElementById('hud-kills');
    this.#previewEl      = document.getElementById('hud-preview');
    this.#startBtn       = document.getElementById('hud-start');
    this.#ffBtn          = document.getElementById('hud-ff');
    this.#towerPanel     = document.getElementById('tower-panel');
    this.#towerNameEl    = document.getElementById('tower-name');
    this.#upgradePathsEl = document.getElementById('upgrade-paths');
    this.#statsEl        = document.getElementById('tower-stats');
    this.#sellBtn        = document.getElementById('sell-btn');
    this.#endScreen      = document.getElementById('end-screen');

    document.querySelectorAll('[data-tower]').forEach(btn => {
      btn.addEventListener('click', () => {
        // M1: ignore clicks on locked tower buttons
        if (btn.classList.contains('tower-locked')) return;
        const type = btn.dataset.tower;
        this.#selectedTowerType = this.#selectedTowerType === type ? null : type;
        this.#refreshShop();
        this.hideTowerPanel();
        this.onTowerTypeSelect?.(this.#selectedTowerType);
      });
    });

    this.#startBtn.addEventListener('click', () => this.onStartWave?.());
    this.#ffBtn.addEventListener('click',   () => this.onToggleFF?.());

    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!this.#selectedTower) return;
        this.onTargetingChange?.(this.#selectedTower, btn.dataset.target);
        this.#refreshTargetBtns(btn.dataset.target);
      });
    });

    this.#sellBtn.addEventListener('click', () => {
      if (this.#selectedTower) {
        this.onSellTower?.(this.#selectedTower);
        this.hideTowerPanel();
      }
    });

    this.#upgradePathsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-path]');
      if (!btn || !this.#selectedTower) return;
      this.onUpgrade?.(this.#selectedTower, btn.dataset.path);
    });

    // Mute toggle
    const muteBtn = document.getElementById('hud-mute');
    if (muteBtn) {
      muteBtn.textContent = AudioManager.muted ? '🔇' : '🔊';
      muteBtn.addEventListener('click', () => {
        const muted = AudioManager.toggleMute();
        muteBtn.textContent = muted ? '🔇' : '🔊';
      });
    }

    document.getElementById('end-restart').addEventListener('click', () => location.reload());
  }

  get selectedTowerType() { return this.#selectedTowerType; }
  get selectedTower()     { return this.#selectedTower; }

  /**
   * M1 — call after loading the profile to gate shop + upgrade panel.
   * Pass profile.unlocks (or null to remove all gating).
   */
  setProfileUnlocks(unlocks) {
    this.#profileUnlocks = unlocks;
    this.#refreshShop();
  }

  clearTowerTypeSelection() {
    this.#selectedTowerType = null;
    this.#refreshShop();
  }

  /** R3 — set the upcoming-wave preview text. Pass '' to clear. */
  setWavePreview(text) {
    if (this.#previewEl) this.#previewEl.textContent = text;
  }

  showTowerPanel(tower, cash) {
    this.#selectedTower = tower;
    const def = TOWER_TYPES[tower.type];
    this.#towerNameEl.textContent = `${def.name}  (${tower.upgradesA}-${tower.upgradesB})`;
    this.#renderUpgrades(tower, cash);
    this.#renderStats(tower);
    this.#towerPanel.style.display = 'block';
    this.#refreshTargetBtns(tower.targeting);
    const sellValue = Math.floor((def.cost + tower.upgradeSpent) * 0.6);
    this.#sellBtn.textContent = `Sell ($${sellValue})`;
  }

  hideTowerPanel() {
    this.#selectedTower = null;
    this.#towerPanel.style.display = 'none';
  }

  /**
   * M2/M5 — extended end screen with star display and new-best celebration.
   * newBest = true when this result beats the stored mission rating.
   */
  showEndScreen(won, score, stars = 0, availableStars = 0, newBest = false) {
    document.getElementById('end-title').textContent = won ? '🎉 Victory!' : '💀 Defeat';
    document.getElementById('end-msg').textContent   = won
      ? 'All waves survived!' : 'You ran out of lives.';
    document.getElementById('end-score').textContent = score;

    const starsRow = document.getElementById('end-stars-row');
    const starsMsg = document.getElementById('end-stars-msg');

    if (won && stars > 0) {
      starsRow.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
      if (newBest) {
        starsMsg.textContent = `⭐ New best! +${stars} star${stars !== 1 ? 's' : ''}  ·  ${availableStars} available to spend`;
      } else {
        starsMsg.textContent = `${stars} star${stars !== 1 ? 's' : ''} earned (best unchanged)  ·  ${availableStars} available`;
      }
    } else if (!won) {
      starsRow.textContent = '☆☆☆';
      starsMsg.textContent = 'No stars — survive to earn them!';
    } else {
      starsRow.textContent = '';
      starsMsg.textContent = '';
    }

    this.#endScreen.style.display = 'flex';
  }

  setFFActive(active) {
    this.#ffBtn.textContent = active ? '⏩ 2×' : '⏩ 1×';
    this.#ffBtn.classList.toggle('active', active);
  }

  update(state) {
    this.#livesEl.textContent = state.lives;
    this.#cashEl.textContent  = state.cash;
    this.#scoreEl.textContent = state.score;
    this.#waveEl.textContent  = `${Math.max(1, state.waveIndex + 1)} / ${state.totalWaves}`;
    if (this.#killsEl) this.#killsEl.textContent = state.kills ?? 0;
    if (state.cash !== this.#currentCash) {
      this.#currentCash = state.cash;
      this.#refreshShop();
    }
    this.#startBtn.disabled   =
      state.waveActive || state.waveIndex >= state.totalWaves - 1 || state.gameOver;
    this.#startBtn.textContent = state.waveActive ? 'Wave Active…' : 'Start Wave';
  }

  // ── private ─────────────────────────────────────────────────────────────────

  /** R6 — live stat block below upgrade paths. */
  #renderStats(tower) {
    if (!this.#statsEl) return;
    const def = TOWER_TYPES[tower.type];
    if (tower.isSlow) {
      const pct = Math.round((1 - tower.slowFactor) * 100);
      this.#statsEl.innerHTML =
        `<span>SLOW <b>-${pct}%</b></span><span>DUR <b>${tower.slowDuration.toFixed(1)}s</b></span>` +
        `<span>RNG <b>${tower.globalRange ? '∞' : tower.range}</b></span>`;
    } else {
      const rng = tower.globalRange ? '∞' : tower.range;
      this.#statsEl.innerHTML =
        `<span>DMG <b>${tower.damage}</b></span>` +
        `<span>RNG <b>${rng}</b></span>` +
        `<span>RATE <b>${tower.fireRate.toFixed(1)}/s</b></span>` +
        (tower.aoeRadius > 0 ? `<span>AoE <b>${tower.aoeRadius}</b></span>` : '');
    }
  }

  #renderUpgrades(tower, cash) {
    const def = TOWER_TYPES[tower.type];

    const buildCol = (pathKey, pathChar) => {
      const pathDef    = def.upgrades[pathKey];
      const ownTiers   = pathChar === 'A' ? tower.upgradesA : tower.upgradesB;
      const otherTiers = pathChar === 'A' ? tower.upgradesB : tower.upgradesA;
      const crosspathFull = otherTiers >= MAX_TIER;

      // M1 — check profile lock for this path
      const profileLocked =
        this.#profileUnlocks !== null &&
        !(this.#profileUnlocks.paths?.[tower.type]?.[pathChar] ?? true);

      let html = `<div class="upgrade-col"><div class="path-label">${pathDef.label}</div>`;

      if (profileLocked) {
        html += `<button class="upg-btn locked" disabled style="white-space:normal;height:auto;padding:6px;">
          🔒 Locked<br><span style="font-size:9px;color:#475569">Unlock in upgrade tree</span>
        </button>`;
      } else {
        pathDef.tiers.forEach((tier, i) => {
          if (i < ownTiers) {
            html += `<button class="upg-btn bought" disabled>✓ ${tier.name}</button>`;
          } else if (i === ownTiers) {
            const crossLocked = crosspathFull && ownTiers >= CROSSPATH_CAP;
            if (crossLocked) {
              html += `<button class="upg-btn locked" disabled>🔒 ${tier.name}</button>`;
            } else if (cash >= tier.cost) {
              const delta = upgradeDeltaPreview(tower, tier.stats);
              html += `<button class="upg-btn next" data-path="${pathChar}"
                title="${tier.desc}">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
            } else {
              const delta = upgradeDeltaPreview(tower, tier.stats);
              html += `<button class="upg-btn costly" data-path="${pathChar}"
                title="Need $${tier.cost - cash} more">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
            }
          } else {
            html += `<button class="upg-btn locked" disabled>${tier.name}</button>`;
          }
        });
      }

      return html + '</div>';
    };

    this.#upgradePathsEl.innerHTML = buildCol('pathA', 'A') + buildCol('pathB', 'B');
  }

  #refreshShop() {
    document.querySelectorAll('[data-tower]').forEach(btn => {
      const type     = btn.dataset.tower;
      const unlocked = this.#profileUnlocks === null
        ? true
        : (this.#profileUnlocks.towers?.[type] ?? false);
      const def      = TOWER_TYPES[type];
      // R6 — grey out towers the player can't currently afford
      const canAfford = !def || this.#currentCash >= def.cost;

      btn.classList.toggle('selected',          type === this.#selectedTowerType && unlocked);
      btn.classList.toggle('tower-locked',      !unlocked);
      btn.classList.toggle('tower-unaffordable', unlocked && !canAfford);
      if (!unlocked) btn.title = 'Unlock in the Upgrade Tree';
    });
  }

  #refreshTargetBtns(mode) {
    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === mode);
    });
    if (this.#selectedTower) this.#selectedTower.targeting = mode;
  }
}
