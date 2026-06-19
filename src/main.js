import { Renderer }           from './render/Renderer.js';
import { GameLoop }            from './core/GameLoop.js';
import { buildPath, positionAtDistance } from './core/Path.js';
import { snapToGrid, isPositionFree } from './core/Grid.js';
import { PathRenderer }        from './render/PathRenderer.js';
import { EnemyRenderer }       from './render/EnemyRenderer.js';
import { TowerRenderer }       from './render/TowerRenderer.js';
import { ProjectileRenderer }  from './render/ProjectileRenderer.js';
import { DamageNumberRenderer } from './render/DamageNumberRenderer.js';
import { ParticleRenderer }     from './render/ParticleRenderer.js';
import { LightningRenderer }    from './render/LightningRenderer.js';
import { MAPS, CAMPAIGN_ORDER } from './data/maps.js';
import { TOWER_TYPES }          from './data/towers.js';
import { WAVES as WAVES_MAP1 }  from './data/waves-map1.js';
import { WAVES as WAVES_MAP2 }  from './data/waves-map2.js';
import { WAVES as WAVES_MAP3 }  from './data/waves-map3.js';
import { WAVES as WAVES_MAP4 }  from './data/waves-map4.js';
import { WAVES as WAVES_MAP5 }  from './data/waves-map5.js';
import { WAVES as WAVES_MAP6 }  from './data/waves-map6.js';
import { WAVES as WAVES_MAP7 }  from './data/waves-map7.js';
import { WAVES as WAVES_MAP8 }  from './data/waves-map8.js';
import { WAVES as WAVES_MAP9 }  from './data/waves-map9.js';
import { WAVES as WAVES_MAP10 } from './data/waves-map10.js';
import { enemyPool }            from './entities/Enemy.js';
import { ENEMY_TYPES }          from './data/enemies.js';
import { projectilePool }       from './entities/Projectile.js';
import { createTower }          from './entities/Tower.js';
import { updateMovement }       from './systems/MovementSystem.js';
import { WaveSpawner }          from './systems/WaveSpawner.js';
import { updateCombat }         from './systems/CombatSystem.js';
import { updateDoT }            from './systems/DoTSystem.js';
import { updateGroundHazards }  from './systems/GroundHazardSystem.js';
import { canBuyUpgrade, applyTier } from './systems/UpgradeSystem.js';
import { GameUI }               from './ui/GameUI.js';
import { initFeedback }         from './ui/Feedback.js';
import { initDiagnostics }      from './diagnostics.js';
import AudioManager             from './audio/AudioManager.js';
import { saveGame, loadGame, clearSave } from './core/SaveSystem.js';
import { DIFFICULTIES }         from './data/difficulties.js';
import {
  loadProfile, saveProfile, resetProfile, defaultProfile,
  availableStars, isTowerUnlocked, isPathUnlocked,
  recordMissionResult, isMapUnlocked,
  UNLOCK_TREE, isNodeOwned, canUnlock, applyUnlock, respec,
} from './core/Profile.js';

const WAVES_BY_MAP = {
  map1: WAVES_MAP1,  map2: WAVES_MAP2,  map3: WAVES_MAP3,
  map4: WAVES_MAP4,  map5: WAVES_MAP5,  map6: WAVES_MAP6,
  map7: WAVES_MAP7,  map8: WAVES_MAP8,  map9: WAVES_MAP9,
  map10: WAVES_MAP10,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compute 1‒3 stars for a won mission. starCap = difficulty ceiling. */
function computeStars(lives, maxLives = 20, starCap = 2) {
  const pct = lives / maxLives;
  let stars = 1;
  if (pct >= 0.5) stars = 2;
  if (pct >= 0.9) stars = 3;
  return Math.min(stars, starCap);
}

// ── R3 — wave preview helper ─────────────────────────────────────────────────

const WAVE_ICONS = {
  runner: '🟥', sprinter: '🟧', tank: '🟪',
  splitter: '🟩', armoured: '🔷', boss: '💀',
};
function fmtWavePreview(groups) {
  if (!groups) return '';
  return 'Next: ' + groups.map(g => `${WAVE_ICONS[g.type] ?? '●'}×${g.count}`).join(' ');
}

// ── R1 notifications ─────────────────────────────────────────────────────────

/** Show a brief "+$N interest" toast below the HUD. Auto-removes after 2.5s. */
function showInterestToast(amount) {
  const el = document.getElementById('interest-toast');
  if (!el) return;
  el.textContent = `+$${amount} interest`;
  el.classList.add('visible');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('visible'), 2500);
}

/** Flash the boss-wave warning overlay for 1.8s. */
function showBossWarning() {
  const el = document.getElementById('boss-warning');
  if (!el) return;
  el.style.display = 'flex';
  void el.offsetWidth; // force reflow so opacity transition fires
  el.classList.add('visible');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => { el.style.display = 'none'; }, 350); // after fade-out
  }, 1800);
}

// ── Unlock tree (M3) ─────────────────────────────────────────────────────────

function renderUnlockTree(profile) {
  const avail = availableStars(profile);
  document.getElementById('tree-stars-count').textContent = `${avail} ★ available`;

  const list = document.getElementById('tree-list');
  list.innerHTML = '';

  let currentGroup = null;

  for (const node of UNLOCK_TREE) {
    // P4 — insert a section header when the group changes
    const group = node.group ?? 'towers';
    if (group !== currentGroup) {
      currentGroup = group;
      const hdr = document.createElement('div');
      hdr.className = 'tree-group-header';
      hdr.textContent = group === 'perks' ? '⚡ Global Perks' : '🔓 Towers & Paths';
      list.appendChild(hdr);
    }

    const div = document.createElement('div');

    if (node.ranked) {
      // P4 — ranked node rendering
      const rank    = node.getRank(profile) ?? 0;
      const maxed   = rank >= node.maxRank;
      const nextCost = maxed ? 0 : node.costAt(rank);
      const affordable = avail >= nextCost;
      const buyable  = !maxed && affordable;

      div.className = `tree-node${maxed ? ' owned' : ''}`;
      const icon    = maxed ? '★' : rank > 0 ? '◆' : '◇';
      const subText = maxed
        ? `Rank ${node.maxRank}/${node.maxRank} — Maxed!`
        : `Rank ${rank}/${node.maxRank}${node.nextDesc ? ` · ${node.nextDesc(rank)}` : ''}`;
      const right   = maxed
        ? `<span class="tree-node-cost" style="color:#86efac">Maxed</span>`
        : `<span class="tree-node-cost">${nextCost} ★</span>
           <button class="tree-buy-btn" data-id="${node.id}" ${buyable ? '' : 'disabled'}>
             ${affordable ? 'Buy' : 'Need ★'}
           </button>`;

      div.innerHTML = `
        <span class="tree-node-icon">${icon}</span>
        <div class="tree-node-info">
          <div class="tree-node-label">${node.label}</div>
          <div class="tree-node-sub">${subText}</div>
        </div>
        ${right}
      `;
    } else {
      // Existing one-time node rendering
      const owned      = isNodeOwned(profile, node);
      const reqNode    = node.requires ? UNLOCK_TREE.find(n => n.id === node.requires) : null;
      const prereqMet  = !reqNode || isNodeOwned(profile, reqNode);
      const affordable = avail >= node.cost;
      const buyable    = !owned && prereqMet && affordable;

      div.className = `tree-node${owned ? ' owned' : prereqMet ? '' : ' prereq-locked'}`;

      const icon  = owned ? '✓' : prereqMet ? '◆' : '🔒';
      // Show desc for perk nodes, requirement info for locked tower nodes
      const sub   = reqNode && !prereqMet
        ? `Requires: ${reqNode.label}`
        : (node.desc ?? (node.cost === 1 ? '1 star' : `${node.cost} stars`));
      const right = owned
        ? `<span class="tree-node-cost" style="color:#86efac">Owned</span>`
        : `<span class="tree-node-cost">${node.cost} ★</span>
           <button class="tree-buy-btn" data-id="${node.id}" ${buyable ? '' : 'disabled'}>
             ${prereqMet ? (affordable ? 'Buy' : 'Need ★') : '🔒'}
           </button>`;

      div.innerHTML = `
        <span class="tree-node-icon">${icon}</span>
        <div class="tree-node-info">
          <div class="tree-node-label">${node.label}</div>
          <div class="tree-node-sub">${sub}</div>
        </div>
        ${right}
      `;
    }

    list.appendChild(div);
  }

  // Buy handlers — rebind after each re-render
  list.querySelectorAll('.tree-buy-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const node = UNLOCK_TREE.find(n => n.id === btn.dataset.id);
      if (applyUnlock(profile, node)) {
        saveProfile(profile);
        renderUnlockTree(profile);
      }
    });
  });
}

function updateMapSelectUI(profile) {
  // Available stars
  document.getElementById('map-avail-stars').textContent = availableStars(profile);

  // C3 — regenerate the map list from CAMPAIGN_ORDER
  const list = document.getElementById('map-list');
  if (list) {
    list.innerHTML = '';
    for (const mapKey of CAMPAIGN_ORDER) {
      const mapDef  = MAPS[mapKey];
      if (!mapDef) continue;
      const stars   = profile.missions[mapKey] ?? 0;
      const locked  = !isMapUnlocked(profile, mapKey, CAMPAIGN_ORDER);
      const starStr = '★'.repeat(stars) + '☆'.repeat(3 - stars);

      const btn = document.createElement('button');
      btn.className   = 'map-btn' + (locked ? ' map-btn-locked' : '');
      btn.dataset.map = mapKey;
      btn.disabled    = locked;
      btn.innerHTML   = locked
        ? `<span>🔒 ${mapDef.name}</span><span class="map-stars" style="color:#4b5563;font-size:11px">Clear prev. map to unlock</span>`
        : `<span>🗺 ${mapDef.name}</span><span class="map-stars">${starStr}</span>`;
      list.appendChild(btn);
    }
  }

  // M5 — "new unlock" badge on upgrades button
  const badge = document.getElementById('upgrades-badge');
  if (badge) badge.style.display = availableStars(profile) > 0 ? 'inline' : 'none';
}

// ── Map select ──────────────────────────────────────────────────────────────

function awaitMapSelect(profile) {
  const restartRaw = sessionStorage.getItem('restartIntent');
  if (restartRaw) {
    sessionStorage.removeItem('restartIntent');
    try {
      const { mapKey, diffKey } = JSON.parse(restartRaw);
      if (mapKey && diffKey) return { mapKey, savedData: null, diffKey };
    } catch (_) { /* corrupt — fall through */ }
  }

  updateMapSelectUI(profile);
  const savedData = loadGame();

  return new Promise(resolve => {
    let resolved     = false;
    let selectedDiff = 'normal'; // C0 — Normal is the default (Easy removed)

    // C0 — difficulty selector buttons (Normal/Hard only)
    document.querySelectorAll('[data-diff]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === selectedDiff);
      btn.onclick = () => {
        selectedDiff = btn.dataset.diff;
        document.querySelectorAll('[data-diff]').forEach(b =>
          b.classList.toggle('active', b.dataset.diff === selectedDiff));
      };
    });

    function pickMap(mapKey, save, diffKey) {
      if (resolved) return;
      resolved = true;
      document.getElementById('map-select').style.display = 'none';
      resolve({ mapKey, savedData: save, diffKey: diffKey ?? selectedDiff });
    }

    if (savedData) {
      const continueBtn = document.getElementById('map-continue');
      const mapName     = MAPS[savedData.mapKey]?.name ?? savedData.mapKey;
      continueBtn.style.display = 'block';
      continueBtn.textContent   = `↩ Continue — ${mapName} (wave ${savedData.waveIndex + 2})`;
      // Restore saved difficulty (don't let player change it mid-run)
      const savedDiff = savedData.difficulty;
      // C0 — remap legacy 'easy' saves to 'normal'
      continueBtn.onclick = () => pickMap(
        savedData.mapKey, savedData,
        (savedDiff && DIFFICULTIES[savedDiff]) ? savedDiff : 'normal'
      );
    }

    document.getElementById('map-sandbox').onclick = () => {
      clearSave();
      pickMap('map1', null, 'sandbox');
    };

    // Full progress wipe from the main menu (destructive — confirm first).
    document.getElementById('menu-reset').onclick = () => {
      if (!confirm('Reset ALL progress?\n\nThis permanently erases your stars, tower/upgrade unlocks, and map completions, and starts you over from the beginning. This cannot be undone.')) return;
      resetProfile(); // wipe the meta-progression profile
      clearSave();    // and any mid-run checkpoint
      location.reload();
    };

    // C1/C3 — map buttons are generated dynamically; bind after updateMapSelectUI
    function bindMapBtns() {
      document.querySelectorAll('#map-list .map-btn:not([disabled])').forEach(btn => {
        btn.onclick = () => { clearSave(); pickMap(btn.dataset.map, null, selectedDiff); };
      });
    }
    bindMapBtns();

    // Unlock tree
    function openTree() {
      document.getElementById('map-select').style.display = 'none';
      document.getElementById('unlock-tree').style.display = 'flex';
      renderUnlockTree(profile);
    }
    document.getElementById('map-upgrades').onclick = openTree;

    // Jump straight to the unlock tree if requested from the victory screen.
    if (sessionStorage.getItem('openTree')) {
      sessionStorage.removeItem('openTree');
      openTree();
    }

    document.getElementById('tree-close').onclick = () => {
      document.getElementById('unlock-tree').style.display = 'none';
      document.getElementById('map-select').style.display = 'flex';
      updateMapSelectUI(profile);
      bindMapBtns();
    };

    document.getElementById('tree-respec').onclick = () => {
      if (!confirm('Reset all unlocks? Your earned stars are kept.')) return;
      const fresh = respec(profile);
      Object.assign(profile, fresh);
      saveProfile(profile);
      renderUnlockTree(profile);
    };
  });
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // M0 — load (or create) the meta-progression profile
  const profile = loadProfile();
  window.__profile = profile; // dev convenience: flip unlocks in the console

  const { mapKey, savedData, diffKey } = await awaitMapSelect(profile);
  document.body.classList.add('game-active');
  // Always hide the map-select overlay once a run begins. The restart-intent path
  // in awaitMapSelect() returns early without going through pickMap() (which is what
  // normally hides it), so without this a "Restart Map" reload leaves the menu
  // covering the running game — making it look frozen/locked.
  document.getElementById('map-select').style.display = 'none';

  const isSandbox = diffKey === 'sandbox';
  // C0 — resolve difficulty config; remap legacy 'easy' to 'normal'
  const difficulty = isSandbox
    ? DIFFICULTIES.normal
    : (DIFFICULTIES[diffKey] ?? DIFFICULTIES.normal);

  const container = document.getElementById('game-container');
  const renderer  = new Renderer();
  await renderer.init(container);

  const mapDef = MAPS[mapKey];
  const path   = buildPath(mapDef.waypoints);

  // R1 — per-map wave set (10 waves each)
  const waves = WAVES_BY_MAP[mapKey] ?? WAVES_MAP1;

  // P1 — apply global perks at run start
  const perks = profile.perks ?? {};
  const state = {
    mapKey,
    diffKey,
    sandbox:     isSandbox,
    difficulty: difficulty.key,
    lives:       isSandbox ? 9999 : 20 + (perks.startLives ?? 0),
    cash:        isSandbox ? 999999 : difficulty.startingCash + (perks.startCash ?? 0),
    score:       0,
    kills:       0,
    waveIndex:   -1,
    waveActive:  false,
    spawnerDone: true,
    enemies:     [],
    towers:      [],
    projectiles: [],
    damageEvents:   [], // R3 — floating damage numbers
    deathParticles: [], // R3 — death burst particles
    boltEvents:     [], // Tesla lightning bolts (transient; aged like damageEvents)
    groundHazards:  [],
    totalWaves:  waves.length,
    gameOver:    false,
    paused:      false,
    loopSpeed:    1,                  // mirrors GameLoop speed (diagnostics)
    runStartedAt: performance.now(),  // run duration for bug reports
  };
  // Expose the live state to the bug-report system so reports auto-attach run context.
  currentState = state;

  // C2 — pass per-map HP curve multiplier to WaveSpawner
  const mapHpMult   = mapDef.hpMult ?? 1;
  const waveSpawner = new WaveSpawner(enemyPool, difficulty, waves, mapHpMult);

  // M4 — show difficulty badge in HUD (hidden in sandbox; badge replaced by sandbox badge)
  document.getElementById('hud-diff').textContent = isSandbox ? '' : `${difficulty.emoji} ${difficulty.label}`;

  // --- Renderers ---
  const pathRenderer = new PathRenderer();
  pathRenderer.init(renderer, path);

  const towerRenderer = new TowerRenderer();
  await towerRenderer.init(renderer);

  const enemyRenderer = new EnemyRenderer();
  await enemyRenderer.init(renderer);

  const projectileRenderer = new ProjectileRenderer();
  projectileRenderer.init(renderer);

  const damageNumberRenderer = new DamageNumberRenderer();
  damageNumberRenderer.init(renderer);

  const particleRenderer = new ParticleRenderer();
  particleRenderer.init(renderer);

  const lightningRenderer = new LightningRenderer();
  lightningRenderer.init(renderer);

  // --- Restore saved game ---
  if (savedData) {
    state.lives     = savedData.lives;
    state.cash      = savedData.cash;
    state.score     = savedData.score;
    state.waveIndex = savedData.waveIndex;
    for (const t of savedData.towers) {
      const tower = createTower(t.type, t.x ?? 0, t.y ?? 0);
      tower.targeting = t.targeting;
      const def = TOWER_TYPES[t.type];
      for (let i = 0; i < t.upgradesA; i++) applyTier(tower, def.upgrades.pathA.tiers[i]);
      tower.upgradesA = t.upgradesA;
      for (let i = 0; i < t.upgradesB; i++) applyTier(tower, def.upgrades.pathB.tiers[i]);
      tower.upgradesB = t.upgradesB;
      tower.upgradeSpent = t.upgradeSpent;
      // Mortar mode — restore on load based on upgrade tier
      if (tower.type === 'bomb' && tower.upgradesB >= 2) {
        tower.mortarMode = true;
      }
      state.towers.push(tower);
    }
    towerRenderer.markDirty();
  }

  // --- UI ---
  const ui = new GameUI();
  ui.init();
  window.__ui = ui; // dev convenience: e.g. __ui.showEndScreen(true, 0, 2, 3, false, {nextMapKey:'map2',diffKey:'normal'})
  ui.setProfileUnlocks(isSandbox ? null : profile.unlocks); // M1 — gate shop (null = all unlocked)
  ui.setPerks(isSandbox ? null : profile.perks);            // P1 — pass perks so shop uses discounted costs
  if (isSandbox) ui.setSandbox(true);
  ui.update(state);
  ui.setWavePreview(fmtWavePreview(waves[0])); // R3 — show wave 1 contents before start

  // Sandbox one-time setup
  if (isSandbox) {
    document.body.classList.add('sandbox-active');
    document.getElementById('hud-sandbox-badge').style.display = 'inline';

    // Populate enemy type selector from data
    const spawnSel = document.getElementById('spawn-type');
    for (const type of Object.keys(ENEMY_TYPES)) {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
      spawnSel.appendChild(opt);
    }

    document.getElementById('spawn-btn').addEventListener('click', () => {
      const type  = spawnSel.value;
      const count = Math.max(1, parseInt(document.getElementById('spawn-count').value) || 1);
      for (let i = 0; i < count; i++) {
        const dist = i * 30;
        const e    = enemyPool.acquire({ type, distance: dist });
        const pos  = positionAtDistance(path, dist);
        e.worldX   = pos.x;
        e.worldY   = pos.y;
        state.enemies.push(e);
      }
    });

    document.getElementById('clear-enemies-btn').addEventListener('click', () => {
      for (const e of state.enemies) enemyPool.release(e);
      state.enemies.length = 0;
      for (const p of state.projectiles) projectilePool.release(p);
      state.projectiles.length = 0;
    });
  }

  ui.onStartWave = () => {
    if (state.waveActive || state.gameOver) return;
    if (!state.sandbox && state.waveIndex >= waves.length - 1) return;
    // Sandbox: cycle back to the first wave after the last one
    if (state.sandbox && state.waveIndex >= waves.length - 1) state.waveIndex = -1;
    state.waveIndex++;
    state.waveActive  = true;
    state.spawnerDone = false;
    waveSpawner.startWave(state.waveIndex);
    AudioManager.play('wave-start');
    // R1 — boss-wave announcement on the final wave
    if (state.waveIndex === waves.length - 1) showBossWarning();
    // R3 — update wave preview for the NEXT wave
    ui.setWavePreview(fmtWavePreview(waves[state.waveIndex + 1]));
  };

  ui.onTargetingChange = (tower, mode) => { tower.targeting = mode; };

  ui.onSellTower = (tower) => {
    const idx = state.towers.indexOf(tower);
    if (idx === -1) return;
    state.towers.splice(idx, 1);
    // P1 — Salvage perk adds to base 0.60 sell multiplier
    const sellMult = 0.6 + (perks.sellBonus ?? 0);
    state.cash += Math.floor((TOWER_TYPES[tower.type].cost + tower.upgradeSpent) * sellMult);
    towerRenderer.markDirty();
    towerRenderer.setSelectedTower(null);
  };

  ui.onUpgrade = (tower, path) => {
    // M1 — pass profile path-unlock state into the upgrade gating
    const pathUnlocked = state.sandbox || isPathUnlocked(profile, tower.type, path);
    const effectiveCash = state.sandbox ? Infinity : state.cash;
    const result = canBuyUpgrade(tower, path, effectiveCash, TOWER_TYPES[tower.type], pathUnlocked);
    if (!result.ok) return;
    if (!state.sandbox) {
      state.cash -= result.tier.cost;
      tower.upgradeSpent += result.tier.cost;
    }
    applyTier(tower, result.tier);
    if (path === 'A') tower.upgradesA++;
    else              tower.upgradesB++;
    // Mortar mode — bomb tower path B tier 2+ unlocks mortar manual targeting
    if (tower.type === 'bomb' && path === 'B' && tower.upgradesB >= 2) {
      tower.mortarMode = true;
    }
    towerRenderer.markDirty();
    ui.showTowerPanel(tower, state.cash);
  };

  ui.onTowerTypeSelect = (type) => {
    if (!type) towerRenderer.setHoverTile(null);
  };

  ui.onToggleFF = () => {
    const speeds = state.sandbox ? [1, 2, 4, 8] : [1, 2];
    const idx    = speeds.indexOf(loop.speed);
    loop.speed   = speeds[(idx + 1) % speeds.length];
    state.loopSpeed = loop.speed;
    ui.setFFActive(loop.speed !== 1, loop.speed);
  };

  // --- Canvas input ---
  renderer.canvas.addEventListener('mousemove', (e) => {
    const rect = renderer.canvas.getBoundingClientRect();
    const wx   = (e.clientX - rect.left) * (renderer.width  / rect.width);
    const wy   = (e.clientY - rect.top)  * (renderer.height / rect.height);
    const { x, y } = snapToGrid(wx, wy);
    const type = ui.selectedTowerType;
    if (type) {
      towerRenderer.setHoverTile({ x, y, valid: isPositionFree(x, y, path.waypoints, state.towers), type });
    } else {
      towerRenderer.setHoverTile(null);
    }
  });

  renderer.canvas.addEventListener('mouseleave', () => {
    towerRenderer.setHoverTile(null);
  });

  // MB4 — Touch input: forward touch events to the existing mouse/click handlers.
  // getBoundingClientRect() already returns the post-CSS-transform rect, so the
  // existing coordinate math (clientX - rect.left) * (width / rect.width) works
  // correctly regardless of the CSS scale applied by the MB3 scaleGame() function.
  //
  // While placing a tower the fingertip hides the target tile, so lift the
  // forwarded point up by TOUCH_PLACE_LIFT CSS px: the ghost preview (mousemove)
  // and the placement itself (click) both use the same lifted point, so the
  // tower lands where the ghost shows — just above the finger. Selection taps and
  // mortar targeting use no lift, so they still register exactly under the finger.
  const TOUCH_PLACE_LIFT = 48; // CSS px above the fingertip
  function dispatchMouse(type, touch, liftY = 0) {
    renderer.canvas.dispatchEvent(new MouseEvent(type, {
      bubbles: true, cancelable: true, view: window,
      clientX: touch.clientX, clientY: touch.clientY - liftY,
    }));
  }
  const placeLift = () => (ui.selectedTowerType ? TOUCH_PLACE_LIFT : 0);
  renderer.canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    dispatchMouse('mousemove', e.changedTouches[0], placeLift()); // show hover tile
  }, { passive: false });
  renderer.canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    dispatchMouse('mousemove', e.changedTouches[0], placeLift()); // update hover tile while dragging
  }, { passive: false });
  renderer.canvas.addEventListener('touchend', e => {
    e.preventDefault();
    dispatchMouse('click', e.changedTouches[0], placeLift());     // place tower or select
    // Clear hover tile after tap so ghost doesn't linger
    renderer.canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
  }, { passive: false });
  renderer.canvas.addEventListener('touchcancel', e => {
    e.preventDefault();
    renderer.canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
  }, { passive: false });

  renderer.canvas.addEventListener('click', (e) => {
    const rect   = renderer.canvas.getBoundingClientRect();
    const wx     = (e.clientX - rect.left) * (renderer.width  / rect.width);
    const wy     = (e.clientY - rect.top)  * (renderer.height / rect.height);

    // Mortar targeting — intercept click to set the target coordinate
    if (ui.mortarSetMode !== null) {
      const mortarTower = ui.mortarSetMode;
      ui.mortarSetMode = null;
      mortarTower.mortarTargetX = wx;
      mortarTower.mortarTargetY = wy;
      // Re-render panel so the target coordinate display updates
      ui.showTowerPanel(mortarTower, state.cash);
      towerRenderer.setSelectedTower(mortarTower);
      return;
    }

    const CLICK_RADIUS_SQ = 24 ** 2;
    const best = state.towers.reduce((b, t) => {
      const d = (wx - t.x) ** 2 + (wy - t.y) ** 2;
      return (!b || d < b.d) ? { t, d } : b;
    }, null);
    const hit = best && best.d < CLICK_RADIUS_SQ ? best.t : null;

    if (hit) {
      ui.clearTowerTypeSelection();
      towerRenderer.setHoverTile(null);
      ui.showTowerPanel(hit, state.cash);
      towerRenderer.setSelectedTower(hit);
      return;
    }

    ui.hideTowerPanel();
    towerRenderer.setSelectedTower(null);

    const type = ui.selectedTowerType;
    if (!type) return;
    // M1 — placement guard: profile must have this tower unlocked (waived in sandbox)
    if (!state.sandbox && !isTowerUnlocked(profile, type)) return;
    const def = TOWER_TYPES[type];
    // P1 — Bulk Discount perk reduces tower costs
    const effectiveCost = Math.ceil(def.cost * (1 - (perks.towerCostPct ?? 0)));
    const { x, y } = snapToGrid(wx, wy);
    if (!state.sandbox && state.cash < effectiveCost) return;
    if (!isPositionFree(x, y, path.waypoints, state.towers)) return;

    const tower = createTower(type, x, y);
    // P1 — Power Core perk: bake global damage bonus into tower at creation
    if (!state.sandbox && (perks.damagePct ?? 0) > 0) tower.damage = Math.round(tower.damage * (1 + perks.damagePct));
    state.towers.push(tower);
    if (!state.sandbox) state.cash -= effectiveCost;
    towerRenderer.markDirty();
    ui.clearTowerTypeSelection();
    towerRenderer.setHoverTile(null);
  });

  // --- Game loop ---
  const loop = new GameLoop({
    update(dt) {
      if (state.gameOver || state.paused) return;

      if (state.waveActive && !state.spawnerDone) {
        state.spawnerDone = waveSpawner.update(dt, state.enemies);
      }

      if (state.waveActive && state.spawnerDone && state.enemies.length === 0) {
        state.waveActive = false;
        AudioManager.play('wave-clear');
        // R1 — interest: earn 5% of banked cash at the end of each wave
        // P1 — Compound Interest perk adds to the base rate
        const interest = Math.floor(state.cash * (0.05 + (perks.interestBonus ?? 0)));
        if (interest > 0) {
          state.cash += interest;
          showInterestToast(interest);
        }
        const income = state.towers.reduce((sum, t) => sum + (t.incomePerWave ?? 0), 0);
        if (income > 0) state.cash += income;
        saveGame(state);
      }

      updateMovement(state.enemies, path, dt);
      updateCombat(state.towers, state.enemies, state.projectiles, dt, state.damageEvents, state.groundHazards, state.boltEvents);
      updateDoT(state.enemies, dt, state.damageEvents);
      updateGroundHazards(state.groundHazards, state.enemies, dt, state.damageEvents);

      // Cleric healing aura — heals nearby enemies
      for (const e of state.enemies) {
        if (e.healsNearby <= 0) continue;
        const rSq = e.healsNearbyRadius * e.healsNearbyRadius;
        for (const target of state.enemies) {
          if (target === e || target.hp <= 0) continue;
          const dSq = (target.worldX - e.worldX) ** 2 + (target.worldY - e.worldY) ** 2;
          if (dSq <= rSq) target.hp = Math.min(target.maxHp, target.hp + e.healsNearby * dt);
        }
      }

      // R3 — advance and cull damage events
      for (let i = state.damageEvents.length - 1; i >= 0; i--) {
        state.damageEvents[i].t += dt;
        if (state.damageEvents[i].t >= 0.65) state.damageEvents.splice(i, 1);
      }

      // Advance and cull Tesla lightning bolts (lifetime matches LightningRenderer)
      for (let i = state.boltEvents.length - 1; i >= 0; i--) {
        state.boltEvents[i].t += dt;
        if (state.boltEvents[i].t >= 0.18) state.boltEvents.splice(i, 1);
      }

      // R3 — advance and cull death particles
      for (let i = state.deathParticles.length - 1; i >= 0; i--) {
        const p = state.deathParticles[i];
        p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.t >= 0.5) state.deathParticles.splice(i, 1);
      }

      for (let i = state.enemies.length - 1; i >= 0; i--) {
        const e = state.enemies[i];
        if (e.distance >= path.totalLength) {
          if (!state.sandbox) state.lives = Math.max(0, state.lives - 1);
          enemyPool.release(e);
          state.enemies.splice(i, 1);
        } else if (e.hp <= 0) {
          const baseReward = e.cashReward ?? 10;
          const totalBoost = state.towers
            .filter(t => t.killCashBoostRange > 0)
            .reduce((total, gen) => {
              const dSq = (gen.x - e.worldX)**2 + (gen.y - e.worldY)**2;
              return dSq <= gen.killCashBoostRange**2 ? total + gen.killCashBoostMult : total;
            }, 0);
          state.cash  += Math.round(baseReward * (1 + totalBoost));
          state.score += e.reward;
          state.kills += 1;
          AudioManager.play('enemy-death');
          // R3 — death burst particles
          for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 * j) / 5 + Math.random() * 0.5;
            const spd   = 38 + Math.random() * 44;
            state.deathParticles.push({
              x: e.worldX, y: e.worldY,
              vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
              t: 0, color: e.color,
            });
          }
          if (e.spawns) {
            for (let j = 0; j < e.spawns.count; j++) {
              const child = enemyPool.acquire({ type: e.spawns.type, distance: e.distance });
              const cpos  = positionAtDistance(path, child.distance);
              child.worldX = cpos.x;
              child.worldY = cpos.y;
              state.enemies.push(child);
            }
          }
          enemyPool.release(e);
          state.enemies.splice(i, 1);
        } else if (e.liveSpawnInterval > 0) {
          // Carrier — periodically spawn minions while alive
          e.liveSpawnTimer -= dt;
          if (e.liveSpawnTimer <= 0) {
            e.liveSpawnTimer = e.liveSpawnInterval;
            for (let j = 0; j < e.liveSpawnCount; j++) {
              const child = enemyPool.acquire({ type: e.liveSpawnType, distance: e.distance });
              const cpos  = positionAtDistance(path, child.distance);
              child.worldX = cpos.x;
              child.worldY = cpos.y;
              state.enemies.push(child);
            }
          }
        }
      }

      // Win — not triggered in sandbox
      if (!state.sandbox &&
          !state.waveActive &&
          state.waveIndex >= waves.length - 1 &&
          state.spawnerDone &&
          state.enemies.length === 0) {
        state.gameOver = true;
        clearSave();
        // M2/M4 — award stars using difficulty's star cap, persist to profile
        const stars   = computeStars(state.lives, 20, difficulty.starCap);
        const newBest = recordMissionResult(profile, state.mapKey, stars);
        saveProfile(profile);
        AudioManager.play('win');
        // Offer "Next Map" when a following campaign map exists and is now unlocked.
        const ci      = CAMPAIGN_ORDER.indexOf(state.mapKey);
        const nextKey = (ci >= 0 && ci < CAMPAIGN_ORDER.length - 1) ? CAMPAIGN_ORDER[ci + 1] : null;
        const nextMapKey = (nextKey && isMapUnlocked(profile, nextKey, CAMPAIGN_ORDER)) ? nextKey : null;
        ui.showEndScreen(true, state.score, stars, availableStars(profile), newBest,
          { nextMapKey, diffKey: state.diffKey });
      }

      // Lose — not triggered in sandbox
      if (!state.sandbox && state.lives === 0) {
        state.gameOver = true;
        clearSave();
        AudioManager.play('lose');
        ui.showEndScreen(false, state.score, 0, availableStars(profile));
      }
    },

    render(alpha) {
      enemyRenderer.render(state.enemies, path, alpha);
      towerRenderer.render(state.towers, state.groundHazards);
      projectileRenderer.render(state.projectiles, alpha);
      lightningRenderer.render(state.boltEvents);
      particleRenderer.render(state.deathParticles);
      damageNumberRenderer.render(state.damageEvents);
      ui.update(state);
      renderer.flush();
    },
  });

  loop.start();

  // ── Pause menu ────────────────────────────────────────────────────────────
  const pauseScreen  = document.getElementById('pause-screen');
  const hudMuteBtn   = document.getElementById('hud-mute');
  const pauseMuteBtn = document.getElementById('pause-mute-btn');
  const volumeSlider = document.getElementById('pause-volume');

  function syncMuteIcons() {
    const icon = AudioManager.muted ? '🔇' : '🔊';
    if (hudMuteBtn)   hudMuteBtn.textContent   = icon;
    if (pauseMuteBtn) pauseMuteBtn.textContent = icon;
  }

  function openPause() {
    state.paused = true;
    volumeSlider.value = Math.round(AudioManager.volume * 100);
    syncMuteIcons();
    pauseScreen.style.display = 'flex';
  }

  function closePause() {
    state.paused = false;
    pauseScreen.style.display = 'none';
  }

  document.getElementById('hud-pause').addEventListener('click', openPause);
  document.getElementById('pause-resume').addEventListener('click', closePause);

  pauseMuteBtn.addEventListener('click', () => {
    AudioManager.toggleMute();
    syncMuteIcons();
  });

  volumeSlider.addEventListener('input', () => {
    AudioManager.setVolume(volumeSlider.value / 100);
  });

  document.getElementById('pause-main-menu').addEventListener('click', () => {
    // Save at the last completed wave; if mid-wave, step back so Continue replays it
    const saveIndex = state.waveActive ? state.waveIndex - 1 : state.waveIndex;
    saveGame({ ...state, waveIndex: saveIndex });
    location.reload();
  });

  document.getElementById('pause-restart').addEventListener('click', () => {
    if (!confirm('Restart this map from wave 1? Current run will be lost.')) return;
    sessionStorage.setItem('restartIntent', JSON.stringify({ mapKey: state.mapKey, diffKey: state.diffKey }));
    clearSave();
    location.reload();
  });
}

// ── Fullscreen toggle ──────────────────────────────────────────────────────
// Must be wired at page load, not inside main(): main() blocks on awaitMapSelect()
// until a map is picked, so deferring this left the menu's #map-fs button with no
// click handler while the menu was up — it did nothing until a game had started.
function setupFullscreen() {
  const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;
  const fsApi     = !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function toggleFullscreen() {
    const el = document.documentElement;
    try {
      if (fsElement()) {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      } else if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } catch (_) { /* unsupported (e.g. iOS Safari) — never throw */ }
  }

  function updateFsButtons() {
    const on = !!fsElement();
    const hudBtn = document.getElementById('hud-fs');
    const mapBtn = document.getElementById('map-fs');
    if (hudBtn) hudBtn.textContent = on ? '✕' : '⛶';
    if (mapBtn) mapBtn.textContent = on ? '✕ Exit fullscreen' : '⛶ Fullscreen';
  }

  if (fsApi && !standalone) {
    // Working fullscreen toggle (desktop + Android Chrome).
    document.addEventListener('fullscreenchange', updateFsButtons);
    document.addEventListener('webkitfullscreenchange', updateFsButtons);
    document.getElementById('hud-fs')?.addEventListener('click', toggleFullscreen);
    document.getElementById('map-fs')?.addEventListener('click', toggleFullscreen);
  } else {
    // No usable fullscreen: iOS Safari has no Fullscreen API, and a standalone
    // PWA is already fullscreen. Hide the broken in-game button; turn the menu
    // one into a hint pointing iOS users at the only real route (install as PWA).
    document.getElementById('hud-fs')?.style.setProperty('display', 'none');
    const mapBtn = document.getElementById('map-fs');
    if (mapBtn) {
      if (standalone) {
        mapBtn.style.display = 'none';
      } else {
        mapBtn.textContent = '📲 Add to Home Screen for fullscreen';
        mapBtn.disabled = true;
        mapBtn.style.opacity = '0.7';
        mapBtn.style.cursor = 'default';
      }
    }
  }
}

// Start capturing runtime errors as early as possible (for bug reports).
initDiagnostics();

// Wire the fullscreen buttons at load so the menu's #map-fs works before a game starts.
setupFullscreen();

// ── Bug report system (available on the menu and in-game) ──────────────────
let currentState = null;
let feedbackPausedGame = false;
initFeedback({
  getState: () => currentState,
  onOpen: () => {
    // Freeze the simulation behind the modal so the run doesn't advance while typing.
    if (currentState && !currentState.gameOver && !currentState.paused) {
      currentState.paused  = true;
      feedbackPausedGame   = true;
    }
  },
  onClose: () => {
    if (feedbackPausedGame && currentState) {
      currentState.paused = false;
      feedbackPausedGame  = false;
    }
  },
});

main().catch(console.error);
