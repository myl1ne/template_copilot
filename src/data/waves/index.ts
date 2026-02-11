/**
 * Wave Definition Library
 * Provides predefined wave configurations with procedural fallback
 */

import { WaveDefinition } from '../../systems/WaveSystem';
import { WAVES_01_10 } from './predefined/waves_01_10';
import { WAVES_11_20 } from './predefined/waves_11_20';
import { WAVES_21_30 } from './predefined/waves_21_30';

// Aggregate all predefined waves
const PREDEFINED_WAVES: Record<number, WaveDefinition> = {
  ...WAVES_01_10,
  ...WAVES_11_20,
  ...WAVES_21_30,
};

/**
 * Get a wave definition by wave number
 * Returns predefined wave if available, null otherwise (will use procedural generation)
 */
export function getWaveDefinition(waveNumber: number): WaveDefinition | null {
  return PREDEFINED_WAVES[waveNumber] || null;
}

/**
 * Check if a wave is a boss wave
 */
export function isBossWave(waveNumber: number): boolean {
  return waveNumber % 10 === 0;
}
