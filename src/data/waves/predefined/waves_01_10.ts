/**
 * Waves 1-10 - Early Game
 * Introduction to basic mechanics and monster types
 * Gradually introduces: hounds -> skeletons -> swarm -> warriors -> stalkers
 */

import { WaveDefinition } from '../../../systems/WaveSystem';

export const WAVES_01_10: Record<number, WaveDefinition> = {
  1: {
    waveNumber: 1,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 5, spawnDelay: 0.8 },
    ],
  },

  2: {
    waveNumber: 2,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 8, spawnDelay: 0.7 },
    ],
  },

  3: {
    waveNumber: 3,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 8, spawnDelay: 0.6 },
      { monsterId: 'undead_skeleton', count: 4, spawnDelay: 1.0 },
    ],
  },

  4: {
    waveNumber: 4,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 12, spawnDelay: 0.3 },
      { monsterId: 'undead_skeleton', count: 5, spawnDelay: 0.8 },
    ],
  },

  5: {
    waveNumber: 5,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 10, spawnDelay: 0.5 },
      { monsterId: 'corrupted_swarm', count: 8, spawnDelay: 0.3 },
      { monsterId: 'undead_skeleton', count: 6, spawnDelay: 0.8 },
    ],
  },

  6: {
    waveNumber: 6,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 10, spawnDelay: 0.4 },
      { monsterId: 'twisted_warrior', count: 4, spawnDelay: 1.2 },
      { monsterId: 'undead_skeleton', count: 6, spawnDelay: 0.7 },
    ],
  },

  7: {
    waveNumber: 7,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 15, spawnDelay: 0.25 },
      { monsterId: 'twisted_warrior', count: 6, spawnDelay: 0.9 },
      { monsterId: 'shadow_stalker', count: 2, spawnDelay: 1.5 },
    ],
  },

  8: {
    waveNumber: 8,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_hound', count: 12, spawnDelay: 0.35 },
      { monsterId: 'twisted_warrior', count: 8, spawnDelay: 0.6 },
      { monsterId: 'shadow_stalker', count: 3, spawnDelay: 1.2 },
      { monsterId: 'undead_skeleton', count: 5, spawnDelay: 0.7 },
    ],
  },

  9: {
    waveNumber: 9,
    isBossWave: false,
    spawns: [
      { monsterId: 'corrupted_swarm', count: 20, spawnDelay: 0.2 },
      { monsterId: 'twisted_warrior', count: 10, spawnDelay: 0.5 },
      { monsterId: 'shadow_stalker', count: 5, spawnDelay: 0.8 },
      { monsterId: 'undead_skeleton', count: 8, spawnDelay: 0.6 },
    ],
  },

  10: {
    waveNumber: 10,
    isBossWave: true,
    spawns: [
      { monsterId: 'decay_lord', count: 1, spawnDelay: 0 },
    ],
    bossId: 'decay_lord',
    bossMinions: [
      { monsterId: 'corrupted_hound', count: 10, spawnDelay: 0.5 },
      { monsterId: 'undead_skeleton', count: 8, spawnDelay: 0.6 },
      { monsterId: 'twisted_warrior', count: 4, spawnDelay: 0.8 },
    ],
  },
};
