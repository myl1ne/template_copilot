/**
 * Wave Definitions Tests
 *
 * Validates that wave definitions are properly structured
 */

import { describe, it, expect } from 'vitest';
import { getWaveDefinition, isBossWave } from './index';

describe('Wave Definitions', () => {
  describe('wave count', () => {
    it('should have exactly 30 predefined waves', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
      }
    });

    it('should have waves numbered 1 through 30', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
        expect(wave!.waveNumber).toBe(i);
      }
    });
  });

  describe('boss waves', () => {
    it('should have boss waves at waves 10, 20, and 30', () => {
      const bossWaveNumbers = [10, 20, 30];

      for (const waveNum of bossWaveNumbers) {
        expect(isBossWave(waveNum)).toBe(true);
        const wave = getWaveDefinition(waveNum);
        expect(wave).not.toBeNull();
        expect(wave!.isBossWave).toBe(true);
      }
    });

    it('should only have 3 boss waves in first 30 waves', () => {
      let bossCount = 0;
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        if (wave && wave.isBossWave) {
          bossCount++;
        }
      }
      expect(bossCount).toBe(3);
    });

    it('should have bossId defined for boss waves', () => {
      const bossWaveNumbers = [10, 20, 30];

      for (const waveNum of bossWaveNumbers) {
        const wave = getWaveDefinition(waveNum);
        expect(wave).not.toBeNull();
        expect(wave!.bossId).toBeDefined();
        expect(typeof wave!.bossId).toBe('string');
      }
    });
  });

  describe('spawn structure', () => {
    it('should have spawns array for all waves', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
        expect(wave!.spawns).toBeDefined();
        expect(Array.isArray(wave!.spawns)).toBe(true);
        expect(wave!.spawns.length).toBeGreaterThan(0);
      }
    });

    it('should have valid spawn entries', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
        for (const spawn of wave!.spawns) {
          expect(spawn.monsterId).toBeDefined();
          expect(typeof spawn.monsterId).toBe('string');
          expect(spawn.count).toBeGreaterThan(0);
          expect(spawn.spawnDelay).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  describe('difficulty progression', () => {
    it('should have increasing monster counts', () => {
      const earlyWave = getWaveDefinition(1)!;
      const midWave = getWaveDefinition(15)!;
      const lateWave = getWaveDefinition(29)!;

      const earlyCount = earlyWave.spawns.reduce((sum, s) => sum + s.count, 0);
      const midCount = midWave.spawns.reduce((sum, s) => sum + s.count, 0);
      const lateCount = lateWave.spawns.reduce((sum, s) => sum + s.count, 0);

      expect(midCount).toBeGreaterThanOrEqual(earlyCount);
      expect(lateCount).toBeGreaterThanOrEqual(midCount);
    });

    it('should have reasonable spawn delays', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
        for (const spawn of wave!.spawns) {
          // Spawn delay should be between 0 and 2 seconds
          expect(spawn.spawnDelay).toBeGreaterThanOrEqual(0);
          expect(spawn.spawnDelay).toBeLessThanOrEqual(2);
        }
      }
    });
  });

  describe('boss minions', () => {
    it('should have minions for boss waves', () => {
      const bossWaveNumbers = [10, 20, 30];

      for (const waveNum of bossWaveNumbers) {
        const wave = getWaveDefinition(waveNum)!;
        // Boss waves should have either bossMinions defined or spawns with the boss
        const hasBossMinions = wave.bossMinions && wave.bossMinions.length > 0;
        const hasBossInSpawns = wave.spawns.some(s => s.monsterId === wave.bossId);

        expect(hasBossMinions || hasBossInSpawns).toBe(true);
      }
    });

    it('should have valid minion structure when defined', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        if (wave && wave.isBossWave && wave.bossMinions) {
          for (const minion of wave.bossMinions) {
            expect(minion.monsterId).toBeDefined();
            expect(typeof minion.monsterId).toBe('string');
            expect(minion.count).toBeGreaterThan(0);
            expect(minion.spawnDelay).toBeGreaterThanOrEqual(0);
          }
        }
      }
    });
  });

  describe('early game waves', () => {
    it('should have simple waves at the start', () => {
      const wave1 = getWaveDefinition(1)!;

      // Wave 1 should be simple
      expect(wave1.waveNumber).toBe(1);
      expect(wave1.isBossWave).toBe(false);

      // Should have a reasonable number of enemies
      const totalCount = wave1.spawns.reduce((sum, s) => sum + s.count, 0);
      expect(totalCount).toBeLessThan(20);
    });
  });

  describe('data consistency', () => {
    it('should have unique wave numbers', () => {
      const waveNumbers: number[] = [];
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        if (wave) {
          waveNumbers.push(wave.waveNumber);
        }
      }
      const uniqueNumbers = new Set(waveNumbers);

      expect(uniqueNumbers.size).toBe(waveNumbers.length);
    });

    it('should have waves in order', () => {
      for (let i = 1; i <= 30; i++) {
        const wave = getWaveDefinition(i);
        expect(wave).not.toBeNull();
        expect(wave!.waveNumber).toBe(i);
      }
    });
  });
});
