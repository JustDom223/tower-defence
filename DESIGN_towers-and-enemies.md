# Design Review — 20 Towers & 20 Enemies

> **Status:** 🟡 Draft for review — not yet a spec. This is a brainstorming catalogue for Dominic to mark up. Tick the `[ ]` **Keep?** boxes for the ones you want to take forward, strike out the rest, and scribble notes inline. Once shortlisted, the survivors get turned into proper `SPEC_*` tickets with full stats.

## The core mechanic this is built around

Every tower has **two upgrade paths**, and **picking either path permanently locks the other**. You commit to one identity per tower and ride it to tier 4.

In code this is a one-line change: `CROSSPATH_CAP` in `src/systems/UpgradeSystem.js` goes from `2` → `0`. (Today the game allows tier-4 on one path + tier-2 on the other.)

**Design consequence:** because you can *only* ever go down one path, each path must feel like a finished, distinct tower on its own — not a flavour of the same gun. So every entry below is deliberately two builds that barely resemble each other. This mirrors what players love in games like BTD6: one path the single-target boss-killer, the other the swarm-clearer; support/economy/debuff towers that change *how you play* rather than just *how hard you hit*.

## How to read the buildability tags

- **Buildable today** — works with the current engine (damage, range, fireRate, projSpeed, ballistic AoE, area-pulse slow, global range, per-enemy resistance, 4 targeting modes).
- **Small extension** — minor addition to an existing system.
- **New mechanic** — needs a new system; higher effort, bigger feel payoff.

---

# Part 1 — Towers (20)

## Reworks of the four existing towers

### 1. Dart Shooter  *(rework of Dart)*
- [x] **Keep?**
- **Path A — Sharpshooter:** slow, heavy bolts that *pierce* through a line of enemies. Single-lane shredder.
- **Path B — Gatling:** tiny range, absurd fire rate — drop it on a corner and melt swarms.
- **Why the lock matters:** line-pierce vs raw rate-of-fire.
- **Buildability:** Path B buildable today; Path A needs projectile **pierce** *(new mechanic)*.

### 2. Cannon  *(rework of Bomb)*
- [x] **Keep?**
- **Path A — Siege:** enormous blast radius, slow reload. Clustered-group clear.
- **Path B — Mortar:** unlimited range; you place a target marker anywhere on the map and it lobs shells onto that spot regardless of its own range.
- **Why the lock matters:** reactive close blasts vs deliberate map-wide bombardment.
- **Buildability:** Siege buildable today; Mortar needs **manual target-point placement** *(new mechanic)*.

### 3. Cryo Tower  *(rework of Frost)*
- [x] **Keep?**
- **Path A — Glacier:** periodically *freezes solid* (full stun) everything in range for a beat.
- **Path B — Avalanche:** no stun, but a huge slow field plus frostbite damage-over-time.
- **Why the lock matters:** hard crowd-control vs sustained area damage.
- **Buildability:** needs **stun** + **DoT** *(new mechanics)*; slow field reuses existing slow.

### 4. Marksman  *(rework of Marksman)*
- [x] **Keep?**
- **Path A — Assassin:** global range, massive single shots, auto-targets the strongest enemy. Built to delete bosses.
- **Path B — Ranger:** rapid fire that splits shots across several targets at once.
- **Why the lock matters:** one huge bullet vs many small ones.
- **Buildability:** Assassin buildable today (globalRange + Strong targeting + damage); Ranger needs **multi-target** *(new mechanic)*.

## New towers

### 5. Tesla Coil
- [x] **Keep?**
- **Path A — Storm:** lightning that chains between many nearby enemies. Anti-swarm.
- **Path B — Railgun:** charges up, then fires one devastating bolt that pierces everything in a line.
- **Why the lock matters:** spread chain vs concentrated lance.
- **Buildability:** **chain** + **charge-up** *(new mechanics)*.

### 6. Flamethrower
- [x] **Keep?**
- **Path A — Inferno:** stacking burn DoT that ramps the longer an enemy stays in the flame.
- **Path B — Wildfire:** wide cone + leaves burning patches on the path that keep hurting whatever crosses them.
- **Why the lock matters:** focused burn vs zone denial.
- **Buildability:** **cone attack**, **burn DoT**, **ground hazard** *(new mechanics)*.

### 7. Alchemist  *(support / debuff)*
- [x] **Keep?**
- **Path A — Corrosion:** little damage itself, but tags enemies so *every other tower* deals bonus damage to them.
- **Path B — Toxin:** heavy poison DoT that ramps over time and ignores armour.
- **Why the lock matters:** force-multiplier for your whole defence vs standalone damage engine.
- **Buildability:** **vulnerability debuff** + **DoT** *(new mechanics)*.

### 8. Glue Gunner  *(control — distinct from Cryo)*
- [x] **Keep?** — implemented as Sticky Cannon
- **Path A — Tar Pit:** single-target; glues one enemy almost to a stop and makes it take bonus damage. Boss anchor.
- **Path B — Spreader:** weaker glue that splashes onto a whole group.
- **Why the lock matters:** lock down one big threat vs smear the crowd.
- **Buildability:** **single-target slow projectile** + **damage-amp** *(small extension)*.

### 9. Generator  *(economy — totally different role)*
- [x] **Keep?**
- **Path A — Bank:** generates cash each wave that pools up and you collect it.
- **Path B — Market:** boosts the money you earn from kills made near it.
- **Why the lock matters:** passive savings vs active income boost.
- **Buildability:** **economy system** *(new mechanic — high impact on whole game)*.

### 10. Command Post  *(pure support, no attack)*
- [x] **Keep?**
- **Path A — Drill Sergeant:** boosts fire rate of all towers in range.
- **Path B — Spotter:** boosts range and damage of all towers in range (and is the natural home for camo detection — see enemy #11).
- **Why the lock matters:** speed buff vs power buff for your cluster.
- **Buildability:** **buff-aura affecting other towers** *(new mechanic)*.

### 11. Spike Factory  *(the original example)*
- [x] **Keep?** — implemented as Mine Layer
- **Path A — Caltrops:** drops piles of spikes on the track that hurt anything walking over them. Works with no line of sight.
- **Path B — Spiked Ball:** launches one giant rolling ball down the path that pierces everything it touches.
- **Why the lock matters:** passive traps vs active rolling projectile.
- **Buildability:** **path-placed hazards** + **rolling pierce** *(new mechanics)*.

### 12. Boomerang
- [x] **Keep?**
- **Path A — Glaive Ricochet:** bounces between many enemies, hitting each once.
- **Path B — Heavy Glaive:** one slow, massive boomerang that hits hard going out *and* coming back, with a brief slow.
- **Why the lock matters:** spread ricochet vs heavy two-hit.
- **Buildability:** **return path** + **ricochet** *(new mechanics)*.

### 13. Laser / Beam
- [x] **Keep?**
- **Path A — Cutting Beam:** continuous beam that ramps damage the longer it stays on one target. Boss melter.
- **Path B — Scatter Laser:** sweeps a fan of beams across the area. Swarm clear.
- **Why the lock matters:** focus-fire ramp vs spread sweep.
- **Buildability:** **continuous beam** + **damage ramp** *(new mechanics)*.

### 14. Engineer
- [x] **Keep?**
- **Path A — Turret Builder:** periodically deploys temporary mini auto-turrets near itself.
- **Path B — Overclock:** fires faster and faster as a wave goes on, resetting between waves.
- **Why the lock matters:** more bodies vs escalating self-DPS.
- **Buildability:** **spawned sub-towers** / **time-ramp** *(new mechanics)*.

### 15. Druid
- [x] **Keep?**
- **Path A — Tornado:** knocks enemies *backward* along the path. Pure control, little damage.
- **Path B — Thorns:** vines that root (hard slow) and deal damage-over-time.
- **Why the lock matters:** pushback vs root + DoT.
- **Buildability:** **knockback** + **root** *(new mechanics)*.

### 16. Wizard
- [x] **Keep?**
- **Path A — Arcane Blast:** piercing magic bolts; bonus damage to armoured types.
- **Path B — Necromancer:** reanimates enemies it kills as temporary minions that fight the incoming wave.
- **Why the lock matters:** straightforward magic DPS vs summoning an army.
- **Buildability:** pierce + **reanimation** *(new mechanic — ambitious)*.

### 17. Tack Shooter
- [x] **Keep?** — implemented as Scatter Gun
- **Path A — Ring of Fire:** short-range burst in all 360°. Devastating on a tight choke point.
- **Path B — Blade Maelstrom:** longer-range spinning blades that pierce.
- **Why the lock matters:** point-blank nuke vs wider spinning coverage.
- **Buildability:** **radial multi-shot** *(new mechanic)*.

### 18. Sun Temple  *(premium capstone — expensive)*
- [x] **Keep?** — implemented as Solar Tower
- **Path A — Sunbeam:** dual rapid beams, all-purpose high DPS.
- **Path B — Avatar:** slower but each shot is a huge AoE blast.
- **Why the lock matters:** sustained beams vs heavy AoE bursts.
- **Buildability:** mostly reuses **beam** (#13) + AoE; gate behind a high cost.

### 19. Trapper
- [x] **Keep?**
- **Path A — Bear Trap:** places traps; the next enemy to step on one is stunned and takes a big hit.
- **Path B — Net Launcher:** fires nets that pin a *group* in place for a moment.
- **Why the lock matters:** single-target ambush vs group pin.
- **Buildability:** **triggered traps** + **group root** *(new mechanics)*.

### 20. Gravity Well
- [x] **Keep?**
- **Path A — Black Hole:** periodically *pulls* all enemies in range toward one point — clusters them up for your AoE towers.
- **Path B — Crusher:** a stationary field that deals heavy DoT to anything standing in it.
- **Why the lock matters:** repositioning support vs zone damage.
- **Buildability:** **pull force** + **zone DoT** *(new mechanics)*.

---

# Part 2 — Enemies (20)

Designed so each one *demands a specific tower answer* — a rock-paper-scissors lattice that stops any single tower from carrying the whole game.

## Existing (keep)

### 1. Runner  *(exists)*
- [x] **Keep?** Baseline grunt. The measuring stick everything else is balanced against.

### 2. Sprinter  *(exists)*
- [x] **Keep?** Fast, fragile. Punishes slow-firing towers. *Counter:* high fire rate (Gatling, Tack).

### 3. Tank  *(exists)*
- [x] **Keep?** Slow, huge HP sponge. *Counter:* sustained DPS / armour-agnostic damage.

### 4. Splitter  *(exists)*
- [x] **Keep?** Bursts into 2 runners on death. *Counter:* AoE follow-up (Cannon, Tack).

### 5. Armoured  *(exists)*
- [x] **Keep?** Half damage from Dart/Marksman. *Counter:* Bomb, Frost, or magic.

### 6. Boss  *(exists)*
- [x] **Keep?** Wave-10 megaboss. Big HP, slow, huge reward.

## New

### 7. Swarmling
- [x] **Keep?** Tiny, very fast, arrives in huge packs. Punishes single-target. *Counter:* Tack, Storm, Wildfire. *Needs:* nothing new.

### 8. Brute
- [x] **Keep?** Armoured **and** splits into two armoured halves on death. Layered threat. *Counter:* AoE that ignores armour (Cannon). *Needs:* combine existing `resistance` + `spawns`.

### 9. Shielded
- [x] **Keep?** Regenerating shield must be stripped before HP; shield ignores DoT. *Counter:* burst (Railgun, Assassin). *Needs:* **shield layer** *(new)*.

### 10. Regenerator
- [x] **Keep?** Heals if not under continuous fire. Punishes burst; rewards DoT. *Counter:* Toxin, Inferno. *Needs:* **HP regen** *(new)*.

### 11. Phantom (camo)
- [x] **Keep?** Invisible to most towers unless something *detects* it. *Counter:* Command Post Spotter / a detector. *Needs:* **camo + detection** *(new)*.

### 12. Flyer
- [x] **Keep?** Floats over the track and ignores ground hazards (Spike caltrops can't touch it). *Counter:* targeting towers. *Needs:* **flying flag** that skips path hazards *(new)*.

### 13. Magma
- [x] **Keep?** Immune to slow and freeze. *Counter:* raw damage. Hard counter to Cryo and Glue. *Needs:* **slow immunity** *(small extension)*.

### 14. Insulated
- [x] **Keep?** Immune to lightning. Shuts down Tesla. *Needs:* extend `resistance` to a hard `0` for `tesla`.

### 15. Aquatic
- [x] **Keep?** Resists fire/burn. Shuts down Flamethrower. *Needs:* `resistance` + DoT-type awareness.

### 16. Cleric
- [x] **Keep?** Low HP, heals nearby enemies. A priority kill — rewards Strong/Assassin targeting. *Needs:* **enemy-heals-enemy aura** *(new)*.

### 17. Stutter
- [x] **Keep?** Moves in stop-and-go bursts, wrecking projectile lead/timing. *Needs:* **variable speed profile** *(small extension)*.

### 18. Juggernaut
- [x] **Keep?** Resists a little of everything **and** DoT; only raw burst gets through. *Counter:* Railgun, Assassin, Avatar. *Needs:* broad `resistance` + DoT resist.

### 19. Carrier (hive)
- [x] **Keep?** Big slow shell that continuously releases Swarmlings as it travels — not just on death. *Counter:* kill it fast or AoE the spawns. *Needs:* **continuous spawning** *(new)*.

### 20. Mega Boss
- [x] **Keep?** Endgame phased boss: enrages (speeds up) at low HP, periodically raises a shield, and spawns adds. *Needs:* **multi-phase boss logic** *(new — depends on shields + spawning)*.

---

# Part 3 — Buildability & sequencing notes

A rough read on effort, so we can sequence once you've shortlisted.

**Cheapest wins (reuse existing systems):**
- Towers: Dart Shooter (Gatling side), Cannon (Siege side), Cryo (Avalanche slow), Marksman (Assassin side), Sun Temple, Glue Gunner.
- Enemies: Swarmling, Brute, Insulated, Aquatic, Juggernaut, Stutter, Magma — all lean on the existing `resistance`, `spawns`, and speed fields.

**Mid effort (one new system unlocks several towers/enemies):**
- **DoT/burn/poison** → unlocks Flamethrower, Alchemist-Toxin, Cryo-Avalanche, Druid-Thorns, Gravity-Crusher, and the Regenerator enemy's counterplay.
- **Pierce** → unlocks Dart-Sharpshooter, Tesla-Railgun, Wizard-Arcane, Spike-Spiked Ball.
- **Shields** → unlocks Shielded + Mega Boss.
- **Camo + detection** → unlocks Phantom + gives Command Post-Spotter a job.

**Biggest feel-change for most work:**
- Economy (Generator), buff-auras (Command Post), summons (Engineer turrets, Wizard Necromancer), and battlefield manipulation (Gravity Well pull, Druid knockback). These change *how the game plays*, not just the numbers.

**Suggested next step:** mark your **Keep?** boxes, then I'll group the survivors into build phases — data-only changes first, then one new mechanic at a time — so `main` stays runnable the whole way.
