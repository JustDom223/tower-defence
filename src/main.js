import { Renderer }           from './render/Renderer.js';
import { GameLoop }            from './core/GameLoop.js';
import { buildPath, positionAtDistance } from './core/Path.js';
import { createGrid, blockPathTiles, isFree, setBlocked,
         tileToWorld, worldToTile }     from './core/Grid.js';
import { PathRenderer }        from './render/PathRenderer.js';
import { EnemyRenderer }       from './render/EnemyRenderer.js';
import { TowerRenderer }       from './render/TowerRenderer.js';
import { ProjectileRenderer }  from './render/ProjectileRenderer.js';
import { DamageNumberRenderer } from './render/DamageNumberRenderer.js';
import { ParticleRenderer }     from './render/ParticleRenderer.js';
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
import { createTower }          from './entities/Tower.js';
import { updateMovement }       from './systems/MovementSystem.js';
import { WaveSpawner }          from './systems/WaveSpawner.js';
import { updateCombat }         from './systems/CombatSystem.js';
import { canBuyUpgrade, applyTier } from './systems/UpgradeSystem.js';
import { GameUI }               from './ui/GameUI.js';
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

    // C1/C3 — map buttons are generated dynamically; bind after updateMapSelectUI
    function bindMapBtns() {
      document.querySelectorAll('#map-list .map-btn:not([disabled])').forEach(btn => {
        btn.onclick = () => { clearSave(); pickMap(btn.dataset.map, null, selectedDiff); };
      });
    }
    bindMapBtns();

    // Unlock tree
    document.getElementById('map-upgrades').onclick = () => {
      document.getElementById('map-select').style.display = 'none';
      document.getElementById('unlock-tree').style.display = 'flex';
      renderUnlockTree(profile);
    };

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

  // C0 — resolve difficulty config; remap legacy 'easy' to 'normal'
  const difficulty = DIFFICULTIES[diffKey] ?? DIFFICULTIES.normal;

  const container = document.getElementById('game-container');
  const renderer  = new Renderer();
  await renderer.init(container);

  const mapDef = MAPS[mapKey];
  const path   = buildPath(mapDef.waypoints);
  const grid   = createGrid(renderer.width, renderer.height);
  blockPathTiles(grid, mapDef.waypoints);

  // R1 — per-map wave set (10 waves each)
  const waves = WAVES_BY_MAP[mapKey] ?? WAVES_MAP1;

  // P1 — apply global perks at run start
  const perks = profile.perks ?? {};
  const state = {
    mapKey,
    diffKey,
    difficulty: difficulty.key,
    lives:       20 + (perks.startLives ?? 0),
    cash:        difficulty.startingCash + (perks.startCash ?? 0),
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
    totalWaves:  waves.length,
    gameOver:    false,
    paused:      false,
  };

  // C2 — pass per-map HP curve multiplier to WaveSpawner
  const mapHpMult   = mapDef.hpMult ?? 1;
  const waveSpawner = new WaveSpawner(enemyPool, difficulty, waves, mapHpMult);

  // M4 — show difficulty badge in HUD
  document.getElementById('hud-diff').textContent = `${difficulty.emoji} ${difficulty.label}`;

  // --- Renderers ---
  const pathRenderer = new PathRenderer();
  pathRenderer.init(renderer, path);

  const towerRenderer = new TowerRenderer();
  towerRenderer.init(renderer);

  const enemyRenderer = new EnemyRenderer();
  await enemyRenderer.init(renderer);

  const projectileRenderer = new ProjectileRenderer();
  projectileRenderer.init(renderer);

  const damageNumberRenderer = new DamageNumberRenderer();
  damageNumberRenderer.init(renderer);

  const particleRenderer = new ParticleRenderer();
  particleRenderer.init(renderer);

  // --- Restore saved game ---
  if (savedData) {
    state.lives     = savedData.lives;
    state.cash      = savedData.cash;
    state.score     = savedData.score;
    state.waveIndex = savedData.waveIndex;
    for (const t of savedData.towers) {
      const pos   = tileToWorld(t.col, t.row);
      const tower = createTower(t.type, t.col, t.row, pos.x, pos.y);
      tower.targeting = t.targeting;
      const def = TOWER_TYPES[t.type];
      for (let i = 0; i < t.upgradesA; i++) applyTier(tower, def.upgrades.pathA.tiers[i]);
      tower.upgradesA = t.upgradesA;
      for (let i = 0; i < t.upgradesB; i++) applyTier(tower, def.upgrades.pathB.tiers[i]);
      tower.upgradesB = t.upgradesB;
      tower.upgradeSpent = t.upgradeSpent;
      state.towers.push(tower);
      setBlocked(grid, t.col, t.row, 2);
    }
    towerRenderer.markDirty();
  }

  // --- UI ---
  const ui = new GameUI();
  ui.init();
  ui.setProfileUnlocks(profile.unlocks); // M1 — gate shop + upgrade panel
  ui.setPerks(profile.perks);            // P1 — pass perks so shop uses discounted costs
  ui.update(state);
  ui.setWavePreview(fmtWavePreview(waves[0])); // R3 — show wave 1 contents before start

  ui.onStartWave = () => {
    if (state.waveActive || state.waveIndex >= waves.length - 1 || state.gameOver) return;
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
    setBlocked(grid, tower.col, tower.row, 0);
    // P1 — Salvage perk adds to base 0.60 sell multiplier
    const sellMult = 0.6 + (perks.sellBonus ?? 0);
    state.cash += Math.floor((TOWER_TYPES[tower.type].cost + tower.upgradeSpent) * sellMult);
    towerRenderer.markDirty();
    towerRenderer.setSelectedTower(null);
  };

  ui.onUpgrade = (tower, path) => {
    // M1 — pass profile path-unlock state into the upgrade gating
    const pathUnlocked = isPathUnlocked(profile, tower.type, path);
    const result = canBuyUpgrade(tower, path, state.cash, TOWER_TYPES[tower.type], pathUnlocked);
    if (!result.ok) return;
    state.cash -= result.tier.cost;
    tower.upgradeSpent += result.tier.cost;
    applyTier(tower, result.tier);
    if (path === 'A') tower.upgradesA++;
    else              tower.upgradesB++;
    towerRenderer.markDirty();
    ui.showTowerPanel(tower, state.cash);
  };

  ui.onTowerTypeSelect = (type) => {
    if (!type) towerRenderer.setHoverTile(null);
  };

  ui.onToggleFF = () => {
    const next = loop.speed === 1 ? 2 : 1;
    loop.speed = next;
    ui.setFFActive(next !== 1);
  };

  // --- Canvas input ---
  renderer.canvas.addEventListener('mousemove', (e) => {
    const rect = renderer.canvas.getBoundingClientRect();
    const wx   = (e.clientX - rect.left) * (renderer.width  / rect.width);
    const wy   = (e.clientY - rect.top)  * (renderer.height / rect.height);
    const { col, row } = worldToTile(wx, wy);
    const type = ui.selectedTowerType;
    if (type && col >= 0 && col < grid.cols && row >= 0 && row < grid.rows) {
      towerRenderer.setHoverTile({ col, row, valid: isFree(grid, col, row), type });
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
  function dispatchMouse(type, touch) {
    renderer.canvas.dispatchEvent(new MouseEvent(type, {
      bubbles: true, cancelable: true, view: window,
      clientX: touch.clientX, clientY: touch.clientY,
    }));
  }
  renderer.canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    dispatchMouse('mousemove', e.changedTouches[0]); // show hover tile
  }, { passive: false });
  renderer.canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    dispatchMouse('mousemove', e.changedTouches[0]); // update hover tile while dragging
  }, { passive: false });
  renderer.canvas.addEventListener('touchend', e => {
    e.preventDefault();
    dispatchMouse('click', e.changedTouches[0]);     // place tower or select
    // Clear hover tile after tap so ghost doesn't linger
    renderer.canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
  }, { passive: false });
  renderer.canvas.addEventListener('touchcancel', e => {
    e.preventDefault();
    renderer.canvas.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
  }, { passive: false });

  renderer.canvas.addEventListener('click', (e) => {
    const rect   = renderer.canvas.getBoundingClientRect();
    const scaleX = renderer.width  / rect.width;
    const scaleY = renderer.height / rect.height;
    const wx     = (e.clientX - rect.left) * scaleX;
    const wy     = (e.clientY - rect.top)  * scaleY;
    const { col, row } = worldToTile(wx, wy);

    const hit = state.towers.find(t => t.col === col && t.row === row);
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
    // M1 — placement guard: profile must have this tower unlocked
    if (!isTowerUnlocked(profile, type)) return;
    const def = TOWER_TYPES[type];
    // P1 — Bulk Discount perk reduces tower costs
    const effectiveCost = Math.ceil(def.cost * (1 - (perks.towerCostPct ?? 0)));
    if (state.cash < effectiveCost || !isFree(grid, col, row)) return;

    const pos   = tileToWorld(col, row);
    const tower = createTower(type, col, row, pos.x, pos.y);
    // P1 — Power Core perk: bake global damage bonus into tower at creation
    if ((perks.damagePct ?? 0) > 0) tower.damage = Math.round(tower.damage * (1 + perks.damagePct));
    state.towers.push(tower);
    setBlocked(grid, col, row, 2);
    state.cash -= effectiveCost;
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
        saveGame(state);
      }

      updateMovement(state.enemies, path, dt);
      updateCombat(state.towers, state.enemies, state.projectiles, dt, state.damageEvents);

      // R3 — advance and cull damage events
      for (let i = state.damageEvents.length - 1; i >= 0; i--) {
        state.damageEvents[i].t += dt;
        if (state.damageEvents[i].t >= 0.65) state.damageEvents.splice(i, 1);
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
          state.lives = Math.max(0, state.lives - 1);
          enemyPool.release(e);
          state.enemies.splice(i, 1);
        } else if (e.hp <= 0) {
          state.cash  += e.reward;
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
        }
      }

      // Win
      if (!state.waveActive &&
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
        ui.showEndScreen(true, state.score, stars, availableStars(profile), newBest);
      }

      // Lose
      if (state.lives === 0) {
        state.gameOver = true;
        clearSave();
        AudioManager.play('lose');
        ui.showEndScreen(false, state.score, 0, availableStars(profile));
      }
    },

    render(alpha) {
      enemyRenderer.render(state.enemies, path, alpha);
      towerRenderer.render(state.towers);
      projectileRenderer.render(state.projectiles, alpha);
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

main().catch(console.error);
