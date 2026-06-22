# DESIGN — World Curriculum (enemy introduction & theming)

**Role:** Game Master. **Scope of this pass:** Forest (maps 1–10). Mountains/Ruins noted as follow-up.

## Problem

Enemy types were revealed in a scattered order with no teaching pace: Map 1 dropped six types at once (including the splitter's spawn-on-death *mechanic*), Map 2 added nothing, then maps 3–10 dumped ~2 new types each — several gated behind counters a player may not own. Worst case: **wraith on Map 3** is immune to all damage except DoT, whose only campaign counters (Archer Path B / Flamethrower) are locked in the unlock tree — a potentially unkillable enemy on the third map. From Map 11 on, every map is an 11–21-type kitchen-sink.

## Principles

1. **One new thing at a time** — each enemy debuts in a clean, telegraphed wave, only after the player can plausibly counter it.
2. **Space mastery** — let a new type sit for a wave or two before stacking the next.
3. **Difficulty from depth, not breadth** — make maps harder with *counts, HP, and pacing* of known types, not by piling on variety. (Per Dominic: "make the maps harder but with fewer enemy types.")
4. **Theme by world** — Forest = natural basics; Mountains = elemental/immunity counters; Ruins = exotic/undead gates.

## World → roster assignment

- **Forest 🌲 (1–10) — physical fundamentals.** runner, sprinter, tank, armoured, splitter, swarmling, flyer, regenerator, carrier, boss, megaboss. Mechanics taught: speed, bulk, armour/damage-type, spawn-on-death, swarm volume, flight, sustain-vs-burst, live-spawn. **No immunities, camo, or DoT-gates.**
- **Mountains ⛰️ (11–20) — elemental & hardy (the counter lessons).** Adds magma (frost-immune), insulated (tesla-immune), aquatic (fire/DoT-resist), brute (resist-most), juggernaut (resist-all), shielded (absorb layer), cleric (heals others), stutter (anti-lead-aim). These force tower diversity.
- **Ruins 🏛️ (21+) — exotic/undead (the specialist gates).** Adds wraith (DoT-only) and phantom (camo) — the "you must own a specific tool" enemies, where deep unlocks are expected.

> Follow-up (not done in this pass): Mountains and Ruins wave files (maps 11–21) currently use the **entire** roster from map 11 onward and need the same slow-introduction treatment, re-themed to the assignment above. Until then, those maps still reference the moved types — which is fine (the types still exist); they're just no longer introduced in Forest.

## Forest introduction schedule (this pass)

| Map | Name | New type (debut) | Mechanic taught |
|---|---|---|---|
| 1 | Serpentine | runner, sprinter | baseline + speed |
| 2 | Zigzag | tank | bulk / sustained DPS |
| 3 | Switchbacks | armoured | damage-type (½ from archers, weak to explosive) |
| 4 | The Cross | splitter | spawn-on-death (manage the adds) |
| 5 | Coil | swarmling | volume (coverage / AoE) |
| 6 | Detour | flyer | flight (ground-hazard immune) |
| 7 | Gauntlet | regenerator | sustain vs burst (need burst/DoT) |
| 8 | Hairpins | carrier | live-spawn (priority targeting) |
| 9 | Labyrinth | — (none) | hard recombination of all Forest types |
| 10 | The Crucible | megaboss | capstone finale (spawns armoured on death) |

Each new type debuts roughly at wave 3 of its map, alone or lightly escorted, then is woven into later waves. Maps 1–9 keep a boss on wave 10 (the existing climax pattern); Map 10 ends on the megaboss. Bosses removed/exotics stripped: wraith, phantom, magma, insulated, aquatic, brute, juggernaut, shielded, cleric, stutter no longer appear in Forest.

## Numbers are provisional

Counts/intervals here establish the *structure* and lean meatier than the old waves (the old Forest was a stomp throughout). Exact tuning to the target band — **naive player ≈ 1★ until meta-unlocks, competent ≈ 2★, Map 1 stays a stomp** — is the **Play-Tester benchmark's** job (`SPEC_playtest-benchmark.md`). Hand this to that role before merge.
