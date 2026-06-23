/**
 * benchmark/campaign.mjs — star-aware campaign runner.
 *
 * Runs maps 1–5 in sequence for each archetype, spending earned stars on unlocks
 * between maps (bomb first, then war chest, then marksman, etc.) to simulate a
 * real player's progression path.
 *
 * Usage:  node benchmark/campaign.mjs
 */

import { run }                                from './run.mjs';
import { UNLOCK_TREE, applyUnlock, defaultProfile } from '../src/core/Profile.js';

// ── Star award ────────────────────────────────────────────────────────────────
// Normal: max 2★. 3★ requires beating the map on Hard.
function starsForResult(result, diffKey) {
  if (!result.win) return 0;
  if (diffKey === 'hard' && result.finalLives >= 15) return 3;
  if (result.finalLives >= 5)  return 2;
  return 1;
}

// ── Unlock priority ───────────────────────────────────────────────────────────
// Greedy spend in this order — models a sensible player.
const SPEND_PRIORITY = [
  'bomb',         // 3 stars — AoE; counters armoured/tanks
  'war-chest',    // 2/3/4… stars — +$50 starting cash per rank
  'marksman',     // 3 stars — high single-target damage
  'reinforced',   // 2 stars — +5 lives buffer
  'frost',        // 3 stars — slow/control
  'commandpost',  // 2 stars — buff aura
  'power-core',   // 1 star  — +3% damage per rank
];

// Returns true once the player has at least one combat-tower unlock (bomb or frost).
function hasCombatTower(profile) {
  return (profile.unlocks?.towers?.bomb ?? false) ||
         (profile.unlocks?.towers?.frost ?? false);
}

function spendAllStars(profile) {
  const bought = [];

  function bombBought() { return profile.unlocks?.towers?.bomb  ?? false; }
  function frostBought() { return profile.unlocks?.towers?.frost ?? false; }
  function wcBought()    { return (profile.perks?.warChestRank  ?? 0) >= 1; }

  function reinforcedBought() { return profile.perks?.reinforced ?? false; }

  let changed = true;
  while (changed) {
    changed = false;
    for (const id of SPEND_PRIORITY) {
      const node = UNLOCK_TREE.find(n => n.id === id);
      if (!node) continue;

      // Phase 1: save for first combat tower (bomb or frost). Nothing else.
      if (!hasCombatTower(profile) && id !== 'bomb' && id !== 'frost') continue;
      // Phase 2: once combat tower is bought, save for War Chest R1 next.
      if (hasCombatTower(profile) && !wcBought() && id !== 'war-chest') continue;
      // Phase 3: don't fritter 1★ on Power Core or Command Post before Reinforced.
      if (hasCombatTower(profile) && wcBought() && !reinforcedBought() &&
          (id === 'power-core' || id === 'commandpost')) continue;

      if (applyUnlock(profile, node)) {
        const label = node.ranked
          ? `${node.label} (rank ${node.getRank(profile)})`
          : node.label;
        bought.push(label);
        changed = true;
        break;
      }
    }
  }
  return bought;
}

// ── Campaign run ─────────────────────────────────────────────────────────────
const MAPS       = ['map1', 'map2', 'map3', 'map4', 'map5'];
const ARCHETYPES = ['naive', 'competent', 'optimal', 'withBomb', 'withFrost', 'progression'];

async function runCampaign(archetypeName) {
  const profile   = defaultProfile();
  const summary   = [];
  let   allPassed = true;

  for (const mapKey of MAPS) {
    // Spend stars from previous maps before attempting this one
    const bought = spendAllStars(profile);

    const diffKey = 'normal';
    const result  = await run({ mapKey, diffKey, archetype: archetypeName, profile });
    const stars   = starsForResult(result, diffKey);

    profile.missions[mapKey] = Math.max(profile.missions[mapKey] ?? 0, stars);

    const towers = Object.entries(profile.unlocks?.towers ?? {})
      .filter(([, v]) => v).map(([k]) => k).join('+');
    const wc = profile.perks.warChestRank > 0 ? ` wc+${profile.perks.warChestRank * 50}` : '';

    const row = {
      map:     mapKey,
      result:  result.win ? `✓ ${result.finalLives} lives` : `✗ W${(result.lossWave ?? 0) + 1}`,
      cash:    `$${result.finalCash}`,
      towers:  result.towerCount,
      stars:   `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`,
      unlocks: `[${towers}${wc}]`,
      bought:  bought.join(', ') || '—',
    };
    summary.push(row);
    if (!result.win) allPassed = false;
  }

  return { archetypeName, allPassed, summary };
}

// ── Entry point ──────────────────────────────────────────────────────────────
const results = [];
for (const arch of ARCHETYPES) {
  const r = await runCampaign(arch);
  results.push(r);
}

// Print results table
console.log('\n══════════════════════════════════════════════════════');
console.log('  CAMPAIGN RESULTS  (maps 1–5, Normal, star-aware)');
console.log('══════════════════════════════════════════════════════\n');

for (const { archetypeName, allPassed, summary } of results) {
  const status = allPassed ? '✓ ALL PASSED' : '✗ FAILED';
  console.log(`── ${archetypeName.padEnd(12)} ${status} ──`);
  for (const row of summary) {
    const bought = row.bought !== '—' ? `  ← bought: ${row.bought}` : '';
    console.log(`  ${row.map}  ${row.result.padEnd(12)}  cash ${row.cash.padStart(5)}  towers ${row.towers}  ${row.stars}  ${row.unlocks}${bought}`);
  }
  console.log();
}

const passCount = results.filter(r => r.allPassed).length;
console.log(`══ ${passCount}/${ARCHETYPES.length} archetypes passed all 5 maps ══`);
