/**
 * Waves 11-20 - Mid Game
 * Introduces tougher enemies: brutes, wraiths, golems
 * Forces damage type diversity to handle resistances
 */

import { WaveDefinition } from '../../../systems/WaveSystem';

export const WAVES_11_20: Record<number, WaveDefinition> = {
  11: {
    waveNumber: 11,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 12, spawnDelay: 0.3 },
      { monsterId: 'corrupted_brute', count: 2, spawnDelay: 2.0 },
      { monsterId: 'undead_skeleton', count: 8, spawnDelay: 0.5 },
    ],
  },

  12: {
    waveNumber: 12,
    isBossWave: false,
    spawns: [
      { monsterId: 'shadow_stalker', count: 6, spawnDelay: 0.7 },
      { monsterId: 'shadow_wraith', count: 4, spawnDelay: 1.2 },
      { monsterId: 'corrupted_swarm', count: 15, spawnDelay: 0.2 },
    ],
  },

  13: {
    waveNumber: 13,
    isBossWave: false,
    spawns: [
      { monsterId: 'elemental_golem', count: 3, spawnDelay: 1.5 },
      { monsterId: 'corrupted_hound', count: 15, spawnDelay: 0.3 },
      { monsterId: 'twisted_warrior', count: 8, spawnDelay: 0.5 },
    ],
  },

  14: {
    waveNumber: 14,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_brute', count: 4, spawnDelay: 1.5 },
      { monsterId: 'shadow_wraith', count: 6, spawnDelay: 0.8 },
      { monsterId: 'undead_skeleton', count: 10, spawnDelay: 0.4 },
    ],
  },

  15: {
    waveNumber: 15,
    isBossWave: false,
    spawns: [
      { monsterId: 'elemental_golem', count: 4, spawnDelay: 1.2 },
      { monsterId: 'corrupted_swarm', count: 20, spawnDelay: 0.2 },
      { monsterId: 'shadow_stalker', count: 8, spawnDelay: 0.6 },
      { monsterId: 'twisted_warrior', count: 10, spawnDelay: 0.4 },
    ],
  },

  16: {
    waveNumber: 16,
    isBossWave: false,
    spawns: [
      { monsterId: 'void_harbinger', count: 2, spawnDelay: 2.0 },
      { monsterId: 'corrupted_brute', count: 5, spawnDelay: 1.2 },
      { monsterId: 'corrupted_hound', count: 15, spawnDelay: 0.25 },
      { monsterId: 'undead_skeleton', count: 10, spawnDelay: 0.35 },
    ],
  },

  17: {
    waveNumber: 17,
    isBossWave: false,
    spawns: [
      { monsterId: 'shadow_wraith', count: 8, spawnDelay: 0.6 },
      { monsterId: 'void_harbinger', count: 3, spawnDelay: 1.5 },
      { monsterId: 'elemental_golem', count: 3, spawnDelay: 1.2 },
      { monsterId: 'corrupted_swarm', count: 20, spawnDelay: 0.2 },
    ],
  },

  18: {
    waveNumber: 18,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_brute', count: 6, spawnDelay: 1.0 },
      { monsterId: 'twisted_warrior', count: 15, spawnDelay: 0.3 },
      { monsterId: 'shadow_stalker', count: 10, spawnDelay: 0.5 },
      { monsterId: 'void_harbinger', count: 4, spawnDelay: 1.2 },
    ],
  },

  19: {
    waveNumber: 19,
    isBossWave: false,
    spawns: [
      { monsterId: 'elemental_golem', count: 5, spawnDelay: 1.0 },
      { monsterId: 'shadow_wraith', count: 10, spawnDelay: 0.5 },
      { monsterId: 'corrupted_brute', count: 4, spawnDelay: 1.2 },
      { monsterId: 'corrupted_swarm', count: 25, spawnDelay: 0.15 },
      { monsterId: 'void_harbinger', count: 3, spawnDelay: 1.5 },
    ],
  },

  20: {
    waveNumber: 20,
    isBossWave: true,
    spawns: [
      { monsterId: 'infernal_titan', count: 1, spawnDelay: 0 },
    ],
    bossId: 'infernal_titan',
    bossMinions: [
      { monsterId: 'elemental_golem', count: 4, spawnDelay: 1.0 },
      { monsterId: 'corrupted_brute', count: 5, spawnDelay: 0.8 },
      { monsterId: 'corrupted_hound', count: 15, spawnDelay: 0.3 },
      { monsterId: 'shadow_wraith', count: 6, spawnDelay: 0.6 },
    ],
  },
};
