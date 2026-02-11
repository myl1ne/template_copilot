/**
 * Waves 21-30 - Late Game / Endgame
 * Maximum difficulty with all monster types, themed waves, and the final boss
 */

import { WaveDefinition } from '../../../systems/WaveSystem';

export const WAVES_21_30: Record<number, WaveDefinition> = {
  // Shadow Assault - flying heavy wave
  21: {
    waveNumber: 21,
    isBossWave: false,
    spawns: [
      { monsterId: 'shadow_wraith', count: 12, spawnDelay: 0.4 },
      { monsterId: 'shadow_stalker', count: 15, spawnDelay: 0.3 },
      { monsterId: 'void_harbinger', count: 5, spawnDelay: 1.0 },
    ],
  },

  // Corrupted Stampede - mass ground rush
  22: {
    waveNumber: 22,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 30, spawnDelay: 0.12 },
      { monsterId: 'corrupted_hound', count: 20, spawnDelay: 0.2 },
      { monsterId: 'corrupted_brute', count: 6, spawnDelay: 0.8 },
    ],
  },

  // Elemental Fury - fire-resistant wall
  23: {
    waveNumber: 23,
    isBossWave: false,
    spawns: [
      { monsterId: 'elemental_golem', count: 8, spawnDelay: 0.8 },
      { monsterId: 'corrupted_brute', count: 6, spawnDelay: 1.0 },
      { monsterId: 'twisted_warrior', count: 12, spawnDelay: 0.35 },
    ],
  },

  // Undead Rising - holy-weak swarm
  24: {
    waveNumber: 24,
    isBossWave: false,
    spawns: [
      { monsterId: 'undead_skeleton', count: 25, spawnDelay: 0.2 },
      { monsterId: 'shadow_wraith', count: 10, spawnDelay: 0.4 },
      { monsterId: 'void_harbinger', count: 6, spawnDelay: 0.8 },
    ],
  },

  // Everything at once
  25: {
    waveNumber: 25,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 25, spawnDelay: 0.12 },
      { monsterId: 'corrupted_brute', count: 5, spawnDelay: 1.0 },
      { monsterId: 'elemental_golem', count: 5, spawnDelay: 1.0 },
      { monsterId: 'shadow_wraith', count: 8, spawnDelay: 0.5 },
      { monsterId: 'void_harbinger', count: 5, spawnDelay: 0.8 },
      { monsterId: 'undead_skeleton', count: 15, spawnDelay: 0.25 },
    ],
  },

  // Tank parade
  26: {
    waveNumber: 26,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_brute', count: 10, spawnDelay: 0.7 },
      { monsterId: 'elemental_golem', count: 8, spawnDelay: 0.8 },
      { monsterId: 'twisted_warrior', count: 20, spawnDelay: 0.25 },
    ],
  },

  // Void incursion
  27: {
    waveNumber: 27,
    isBossWave: false,
    spawns: [
      { monsterId: 'void_harbinger', count: 10, spawnDelay: 0.6 },
      { monsterId: 'shadow_wraith', count: 15, spawnDelay: 0.3 },
      { monsterId: 'shadow_stalker', count: 12, spawnDelay: 0.35 },
      { monsterId: 'corrupted_swarm', count: 20, spawnDelay: 0.12 },
    ],
  },

  // Mega swarm
  28: {
    waveNumber: 28,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 40, spawnDelay: 0.1 },
      { monsterId: 'corrupted_hound', count: 25, spawnDelay: 0.15 },
      { monsterId: 'undead_skeleton', count: 20, spawnDelay: 0.2 },
      { monsterId: 'shadow_stalker', count: 10, spawnDelay: 0.35 },
    ],
  },

  // Final gauntlet
  29: {
    waveNumber: 29,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_brute', count: 8, spawnDelay: 0.6 },
      { monsterId: 'elemental_golem', count: 6, spawnDelay: 0.7 },
      { monsterId: 'void_harbinger', count: 8, spawnDelay: 0.6 },
      { monsterId: 'shadow_wraith', count: 12, spawnDelay: 0.3 },
      { monsterId: 'twisted_warrior', count: 15, spawnDelay: 0.25 },
      { monsterId: 'corrupted_swarm', count: 25, spawnDelay: 0.12 },
    ],
  },

  // FINAL BOSS - Void Nexus
  30: {
    waveNumber: 30,
    isBossWave: true,
    spawns: [
      { monsterId: 'void_nexus', count: 1, spawnDelay: 0 },
    ],
    bossId: 'void_nexus',
    bossMinions: [
      { monsterId: 'void_harbinger', count: 8, spawnDelay: 0.6 },
      { monsterId: 'shadow_wraith', count: 10, spawnDelay: 0.35 },
      { monsterId: 'elemental_golem', count: 4, spawnDelay: 1.0 },
      { monsterId: 'corrupted_brute', count: 4, spawnDelay: 1.0 },
      { monsterId: 'corrupted_swarm', count: 20, spawnDelay: 0.15 },
    ],
  },
};
