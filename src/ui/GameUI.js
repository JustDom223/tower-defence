import { TOWER_TYPES }             from '../data/towers.js';
import { MAX_TIER } from '../systems/UpgradeSystem.js';
import AudioManager                from '../audio/AudioManager.js';
import { clearSave }               from '../core/SaveSystem.js';

/**
 * R6 — Upgrade delta preview.
 * Given the tower's current live stats and the tier's stat deltas, returns a
 * short "→ STAT new-value" string showing the result after buying.
 */
function upgradeDeltaPreview(tower, tierStats) {
  const parts = [];
  if (tierStats.damage       != null) parts.push(`DMG ${tower.damage + tierStats.damage}`);
  if (tierStats.range        != null) parts.push(`RNG ${tower.range  + tierStats.range}`);
  if (tierStats.fireRate     != null) parts.push(`RATE ${(tower.fireRate + tierStats.fireRate).toFixed(1)}/s`);
  if (tierStats.aoeRadius    != null) parts.push(`AoE ${tower.aoeRadius + tierStats.aoeRadius}`);
  if (tierStats.globalRange)          parts.push('RNG ∞');
  if (tierStats.slowFactor   != null) {
    const newPct = Math.round((1 - (tower.slowFactor + tierStats.slowFactor)) * 100);
    parts.push(`SLOW -${newPct}%`);
  }
  if (tierStats.slowDuration   != null) parts.push(`DUR ${(tower.slowDuration   + tierStats.slowDuration).toFixed(1)}s`);
  if (tierStats.dotDamage      != null) parts.push(`DoT ${(tower.dotDamage ?? 0) + tierStats.dotDamage}/tick`);
  if (tierStats.dotDuration    != null) parts.push(`BURN ${((tower.dotDuration ?? 0) + tierStats.dotDuration).toFixed(1)}s`);
  if (tierStats.hazardDamage   != null) parts.push(`HAZ ${(tower.hazardDamage ?? 0) + tierStats.hazardDamage}`);
  if (tierStats.hazardRadius   != null) parts.push(`HRAZ ${(tower.hazardRadius ?? 0) + tierStats.hazardRadius}`);
  if (tierStats.buffFireRate   != null) parts.push(`BUFF +${Math.round(((tower.buffFireRate ?? 0) + tierStats.buffFireRate) * 100)}% RATE`);
  if (tierStats.buffDamage     != null) parts.push(`BUFF +${Math.round(((tower.buffDamage   ?? 0) + tierStats.buffDamage)   * 100)}% DMG`);
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

  /** profile.perks snapshot — set via setPerks() */
  #perks = null;

  onStartWave       = null; // () => void
  onTargetingChange = null; // (tower, mode) => void
  onSellTower       = null; // (tower) => void
  onTowerTypeSelect = null; // (type | null) => void
  onUpgrade         = null; // (tower, path) => void
  onToggleFF        = null; // () => void

  /** Mortar targeting — set to a tower object while waiting for the player to click a target. */
  mortarSetMode = null;

  #sandbox = false;
  #sandboxTowerSelect = null;
  #sandboxPlaceBtn    = null;

  /** Currently active tower-panel tab ('upgrades' | 'stats' | 'target') */
  #activeTab = 'upgrades';

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

    // Panel tab switching
    document.querySelectorAll('.panel-tab').forEach(btn => {
      btn.addEventListener('click', () => this.#switchTab(btn.dataset.tab));
    });

    // Sandbox tower placement dropdown + button
    this.#sandboxTowerSelect = document.getElementById('sandbox-tower-type');
    this.#sandboxPlaceBtn    = document.getElementById('sandbox-place-btn');
    this.#sandboxPlaceBtn?.addEventListener('click', () => {
      const type = this.#sandboxTowerSelect.value;
      if (!type) return;
      this.#selectedTowerType = this.#selectedTowerType === type ? null : type;
      this.#refreshSandboxPlaceBtn();
      this.hideTowerPanel();
      this.onTowerTypeSelect?.(this.#selectedTowerType);
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

  /**
   * P1 — call after loading the profile to apply global perk effects in the UI.
   * Pass profile.perks (or null to clear).
   */
  setPerks(perks) {
    this.#perks = perks;
    this.#refreshShop();
  }

  clearTowerTypeSelection() {
    this.#selectedTowerType = null;
    this.#refreshShop();
    this.#refreshSandboxPlaceBtn();
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
    this.#renderMortarControls(tower);
    this.#towerPanel.style.display = 'block';
    this.#switchTab('upgrades');
    this.#refreshTargetBtns(tower.targeting);
    // P1 — sell value uses the Salvage perk bonus if active
    const sellMult = 0.6 + (this.#perks?.sellBonus ?? 0);
    const sellValue = Math.floor((def.cost + tower.upgradeSpent) * sellMult);
    this.#sellBtn.textContent = `Sell ($${sellValue})`;
  }

  hideTowerPanel() {
    this.#selectedTower = null;
    this.#towerPanel.style.display = 'none';
  }

  #switchTab(name) {
    this.#activeTab = name;
    document.querySelectorAll('.panel-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === name));
    document.querySelectorAll('.tab-content').forEach(div =>
      div.style.display = div.id === `tab-${name}` ? '' : 'none');
  }

  /**
   * M2/M5 — extended end screen with star display and new-best celebration.
   * newBest = true when this result beats the stored mission rating.
   */
  showEndScreen(won, score, stars = 0, availableStars = 0, newBest = false, opts = {}) {
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

    // Build the end-screen action buttons fresh each time.
    const actions = document.getElementById('end-actions');
    actions.innerHTML = '';
    const addBtn = (label, handler, primary = false) => {
      const b = document.createElement('button');
      b.textContent = label;
      if (primary) b.classList.add('end-primary');
      b.addEventListener('click', handler);
      actions.appendChild(b);
    };

    if (won) {
      // On a completed map: jump to the next map, the unlock tree, or back to maps.
      if (opts.nextMapKey) {
        addBtn('Next Map →', () => {
          clearSave();
          sessionStorage.setItem('restartIntent', JSON.stringify({ mapKey: opts.nextMapKey, diffKey: opts.diffKey }));
          location.reload();
        }, true);
      }
      addBtn('🔓 Unlock Towers & Upgrades', () => {
        clearSave();
        sessionStorage.setItem('openTree', '1');
        location.reload();
      }, !opts.nextMapKey); // make it the primary action when there's no next map
      addBtn('Maps', () => { clearSave(); location.reload(); });
    } else {
      addBtn('Try Again', () => {
        clearSave();
        sessionStorage.setItem('restartIntent', JSON.stringify({ mapKey: opts.mapKey, diffKey: opts.diffKey }));
        location.reload();
      }, true);
      addBtn('Main Menu', () => { clearSave(); location.reload(); });
    }
  }

  setSandbox(enabled) {
    this.#sandbox = enabled;
    if (enabled && this.#sandboxTowerSelect) {
      this.#sandboxTowerSelect.innerHTML = Object.entries(TOWER_TYPES)
        .map(([key, def]) => `<option value="${key}">${def.name} ($${def.cost})</option>`)
        .join('');
    }
  }

  setFFActive(active, speed = 2) {
    this.#ffBtn.textContent = active ? `⏩ ${speed}×` : '⏩ 1×';
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
    this.#startBtn.disabled = this.#sandbox
      ? (state.waveActive || state.gameOver)
      : (state.waveActive || state.waveIndex >= state.totalWaves - 1 || state.gameOver);
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
      const effDmg  = tower.buffedDamage   ?? tower.damage;
      const effRate = tower.buffedFireRate ?? tower.fireRate;
      const effRng  = tower.buffedRange    ?? tower.range;
      const rng = tower.globalRange ? '∞' : Math.round(effRng);
      const dmgStr  = effDmg  !== tower.damage   ? `${Math.round(effDmg)}<sup>↑</sup>`  : tower.damage;
      const rateStr = effRate !== tower.fireRate  ? `${effRate.toFixed(1)}<sup>↑</sup>`  : `${tower.fireRate.toFixed(1)}`;
      this.#statsEl.innerHTML =
        `<span>DMG <b>${dmgStr}</b></span>` +
        `<span>RNG <b>${rng}</b></span>` +
        `<span>RATE <b>${rateStr}/s</b></span>` +
        (tower.aoeRadius > 0 ? `<span>AoE <b>${tower.aoeRadius}</b></span>` : '') +
        (tower.chainTargets > 0 ? `<span>CHAIN <b>+${tower.chainTargets}</b></span>` : '');
    }
  }

  #renderUpgrades(tower, cash) {
    const def = TOWER_TYPES[tower.type];

    const buildCol = (pathKey, pathChar) => {
      const pathDef    = def.upgrades[pathKey];
      const ownTiers   = pathChar === 'A' ? tower.upgradesA : tower.upgradesB;
      const otherTiers = pathChar === 'A' ? tower.upgradesB : tower.upgradesA;

      // M1 — check profile lock for this path
      const profileLocked =
        this.#profileUnlocks !== null &&
        !(this.#profileUnlocks.paths?.[tower.type]?.[pathChar] ?? true);

      const pathExclusive = otherTiers > 0 && ownTiers === 0;

      let html = `<div class="upgrade-col"><div class="path-label">${pathDef.label}</div>`;

      if (profileLocked) {
        html += `<button class="upg-btn locked" disabled style="white-space:normal;height:auto;padding:6px;">
          🔒 Locked<br><span style="font-size:9px;color:#475569">Unlock in upgrade tree</span>
        </button>`;
      } else if (pathExclusive) {
        html += `<button class="upg-btn locked" disabled>🔒 Path locked</button>`;
      } else {
        pathDef.tiers.forEach((tier, i) => {
          if (i < ownTiers) {
            html += `<button class="upg-btn bought" disabled>✓ ${tier.name}</button>`;
          } else if (i === ownTiers) {
            if (cash >= tier.cost) {
              const delta = upgradeDeltaPreview(tower, tier.stats);
              html += `<button class="upg-btn next" data-path="${pathChar}" title="${tier.desc}">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
            } else {
              const delta = upgradeDeltaPreview(tower, tier.stats);
              html += `<button class="upg-btn costly" data-path="${pathChar}" title="${tier.desc} (Need $${tier.cost - cash} more)">${tier.name} $${tier.cost}${delta ? `<span class="upg-delta">${delta}</span>` : ''}</button>`;
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

  /** Mortar controls — show "Set Target" button when the tower has mortarMode active. */
  #renderMortarControls(tower) {
    // Remove any existing mortar control section before re-rendering
    const existing = this.#towerPanel.querySelector('#mortar-controls');
    if (existing) existing.remove();

    if (!tower.mortarMode) return;

    const section = document.createElement('div');
    section.id = 'mortar-controls';
    section.style.cssText = 'padding:6px 8px;border-top:1px solid #334155;margin-top:4px';

    const targetInfo = (tower.mortarTargetX !== null)
      ? `<span style="font-size:10px;color:#94a3b8">Target: (${Math.round(tower.mortarTargetX)}, ${Math.round(tower.mortarTargetY)})</span>`
      : `<span style="font-size:10px;color:#94a3b8">No target set</span>`;

    section.innerHTML = `
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
        <button id="mortar-set-target" style="flex:1;padding:5px 8px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px;">
          📍 Set Target
        </button>
        ${targetInfo}
      </div>
    `;

    // Insert before the sell button (last child of the panel)
    this.#towerPanel.insertBefore(section, this.#sellBtn);

    section.querySelector('#mortar-set-target').addEventListener('click', () => {
      this.mortarSetMode = tower;
      // Visual feedback: button text changes while waiting
      const btn = document.getElementById('mortar-set-target');
      if (btn) { btn.textContent = '🎯 Click map…'; btn.style.background = '#f59e0b'; }
    });
  }

  #refreshShop() {
    document.querySelectorAll('[data-tower]').forEach(btn => {
      const type     = btn.dataset.tower;
      const unlocked = this.#profileUnlocks === null
        ? true
        : (this.#profileUnlocks.towers?.[type] ?? false);
      const def      = TOWER_TYPES[type];
      const costMult  = 1 - (this.#perks?.towerCostPct ?? 0);
      const effectiveCost = def ? Math.ceil(def.cost * costMult) : 0;
      const canAfford = !def || this.#currentCash >= effectiveCost;

      btn.style.display = unlocked ? '' : 'none';
      if (!unlocked) return;

      if (def) {
        let costEl = btn.querySelector('.tower-cost');
        if (!costEl) {
          costEl = document.createElement('span');
          costEl.className = 'tower-cost';
          btn.appendChild(costEl);
        }
        costEl.textContent = `$${effectiveCost}`;
      }

      btn.classList.toggle('selected',           type === this.#selectedTowerType);
      btn.classList.remove('tower-locked');
      btn.classList.toggle('tower-unaffordable', !canAfford);
    });

    // Hide category labels and separators for sections with no visible towers
    const shop = document.getElementById('tower-shop');
    if (!shop) return;
    let sectionLabel = null;
    let sectionHasVisible = false;
    for (const child of shop.children) {
      if (child.classList.contains('shop-cat-label')) {
        sectionLabel = child;
        sectionLabel.style.display = '';
        sectionHasVisible = false;
      } else if (child.classList.contains('shop-sep-line')) {
        child.style.display = '';
        if (!sectionHasVisible && sectionLabel) {
          sectionLabel.style.display = 'none';
          child.style.display = 'none';
        }
        sectionLabel = null;
      } else if (child.dataset?.tower) {
        if (child.style.display !== 'none') sectionHasVisible = true;
      }
    }
    if (sectionLabel && !sectionHasVisible) sectionLabel.style.display = 'none';
  }

  #refreshTargetBtns(mode) {
    document.querySelectorAll('[data-target]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === mode);
    });
    if (this.#selectedTower) this.#selectedTower.targeting = mode;
  }

  #refreshSandboxPlaceBtn() {
    if (!this.#sandboxPlaceBtn) return;
    const active = this.#selectedTowerType !== null;
    this.#sandboxPlaceBtn.classList.toggle('active', active);
    this.#sandboxPlaceBtn.textContent = active ? 'Cancel' : 'Place Tower';
  }
}
