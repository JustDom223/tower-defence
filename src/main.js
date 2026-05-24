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
import { MAPS }                from './data/maps.js';
import { TOWER_TYPES }         from './data/towers.js';
import { WAVES as WAVES_MAP1 } from './data/waves-map1.js';
import { WAVES as WAVES_MAP2 } from './data/waves-map2.js';
import { enemyPool }           from './entities/Enemy.js';
import { createTower }         from './entities/Tower.js';
import { updateMovement }      from './systems/MovementSystem.js';
import { WaveSpawner }         from './systems/WaveSpawner.js';
import { updateCombat }        from './systems/CombatSystem.js';
import { canBuyUpgrade, applyTier } from './systems/UpgradeSystem.js';
import { GameUI }              from './ui/GameUI.js';
import AudioManager            from './audio/AudioManager.js';
import { saveGame, loadGame, clearSave } from './core/SaveSystem.js';
import { DIFFICULTIES }               from './data/difficulties.js';
import {
  loadProfile, saveProfile, resetProfile, defaultProfile,
  availableStars, isTowerUnlocked, isPathUnlocked,
  recordMissionResult,
  UNLOCK_TREE, isNodeOwned, canUnlock, applyUnlock, respec,
} from './core/Profile.js';

const WAVES_BY_MAP = { map1: WAVES_MAP1, map2: WAVES_MAP2 };

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
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 1800);
}

// ── Unlock tree (M3) ─────────────────────────────────────────────────────────

function renderUnlockTree(profile) {
  const avail = availableStars(profile);
  document.getElementById('tree-stars-count').textContent = `${avail} ★ available`;

  const list = document.getElementById('tree-list');
  list.innerHTML = '';

  for (const node of UNLOCK_TREE) {
    const owned     = isNodeOwned(profile, node);
    const reqNode   = node.requires ? UNLOCK_TREE.find(n => n.id === node.requires) : null;
    const prereqMet = !reqNode || isNodeOwned(profile, reqNode);
    const affordable = avail >= node.cost;
    const buyable   = !owned && prereqMet && affordable;

    const div = document.createElement('div');
    div.className = `tree-node${owned ? ' owned' : prereqMet ? '' : ' prereq-locked'}`;

    const icon  = owned ? '✓' : prereqMet ? '◆' : '🔒';
    const sub   = reqNode && !prereqMet ? `Requires: ${reqNode.label}` : node.cost === 1 ? '1 star' : `${node.cost} stars`;
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

  // M5 — per-map star ratings
  for (const [mapKey, stars] of Object.entries(profile.missions)) {
    const el = document.getElementById(`stars-${mapKey}`);
    if (el) el.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  }

  // M5 — "new unlock" badge on upgrades button
  const badge = document.getElementById('upgrades-badge');
  if (badge) badge.style.display = availableStars(profile) > 0 ? 'inline' : 'none';
}

// ── Map select ──────────────────────────────────────────────────────────────

function awaitMapSelect(profile) {
  updateMapSelectUI(profile);
  const savedData = loadGame();

  return new Promise(resolve => {
    let resolved     = false;
    let selectedDiff = 'normal'; // M4 — selected difficulty

    // M4 — difficulty selector buttons
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
      continueBtn.onclick = () => pickMap(savedData.mapKey, savedData, savedData.difficulty ?? 'normal');
    }

    document.querySelectorAll('.map-btn').forEach(btn => {
      btn.onclick = () => { clearSave(); pickMap(btn.dataset.map, null, selectedDiff); };
    });

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

  // M4 — resolve difficulty config
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

  const state = {
    mapKey,
    difficulty: difficulty.key,
    lives:       20,
    cash:        difficulty.startingCash,
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
  };

  const waveSpawner = new WaveSpawner(enemyPool, difficulty, waves);

  // M4 — show difficulty badge in HUD
  document.getElementById('hud-diff').textContent = `${difficulty.emoji} ${difficulty.label}`;

  // --- Renderers ---
  const pathRenderer = new PathRenderer();
  pathRenderer.init(renderer, path);

  const towerRenderer = new TowerRenderer();
  towerRenderer.init(renderer);

  const enemyRenderer = new EnemyRenderer();
  enemyRenderer.init(renderer);

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
    state.cash += Math.floor((TOWER_TYPES[tower.type].cost + tower.upgradeSpent) * 0.6);
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
    if (state.cash < def.cost || !isFree(grid, col, row)) return;

    const pos   = tileToWorld(col, row);
    const tower = createTower(type, col, row, pos.x, pos.y);
    state.towers.push(tower);
    setBlocked(grid, col, row, 2);
    state.cash -= def.cost;
    towerRenderer.markDirty();
    ui.clearTowerTypeSelection();
    towerRenderer.setHoverTile(null);
  });

  // --- Game loop ---
  const loop = new GameLoop({
    update(dt) {
      if (state.gameOver) return;

      if (state.waveActive && !state.spawnerDone) {
        state.spawnerDone = waveSpawner.update(dt, state.enemies);
      }

      if (state.waveActive && state.spawnerDone && state.enemies.length === 0) {
        state.waveActive = false;
        AudioManager.play('wave-clear');
        // R1 — interest: earn 5% of banked cash at the end of each wave
        const interest = Math.floor(state.cash * 0.05);
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
}

main().catch(console.error);
