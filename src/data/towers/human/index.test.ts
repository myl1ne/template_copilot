/**
 * Human Tower Definitions Tests
 *
 * Validates that all human tower definitions have correct structure
 */

import { describe, it, expect } from 'vitest';
import { basicArcher, sniper, barracks, catapult } from './index';
import { TowerRace, DamageType } from '../../../types/game';

// Create array of all human towers for validation
const humanTowers = [basicArcher, sniper, barracks, catapult];

describe('Human Towers', () => {
  describe('structure validation', () => {
    it('should export all 4 human towers', () => {
      expect(humanTowers).toHaveLength(4);
    });

    it('should have all towers with race set to Human', () => {
      for (const tower of humanTowers) {
        expect(tower.race).toBe(TowerRace.Human);
      }
    });
  });

  describe('required fields', () => {
    it('should have all required fields on each tower', () => {
      for (const tower of humanTowers) {
        // Identity
        expect(tower.id).toBeDefined();
        expect(typeof tower.id).toBe('string');
        expect(tower.name).toBeDefined();
        expect(tower.description).toBeDefined();

        // Stats
        expect(tower.baseCost).toBeGreaterThan(0);
        expect(tower.baseDamage).toBeGreaterThan(0);
        expect(tower.baseAttackSpeed).toBeGreaterThan(0);
        expect(tower.baseRange).toBeGreaterThan(0);
        expect(tower.damageType).toBeDefined();

        // Progression
        expect(tower.maxLevel).toBe(10);
        expect(tower.upgradeCostMultiplier).toBeGreaterThanOrEqual(1);
        expect(tower.damagePerLevel).toBeGreaterThanOrEqual(0);

        // Visual
        expect(tower.visual).toBeDefined();
        expect(tower.visual.shapes).toBeDefined();
        expect(Array.isArray(tower.visual.shapes)).toBe(true);
      }
    });
  });

  describe('abilities', () => {
    it('should have exactly 2 abilities per tower', () => {
      for (const tower of humanTowers) {
        expect(tower.abilities).toBeDefined();
        expect(tower.abilities).toHaveLength(2);
      }
    });

    it('should have string ability IDs', () => {
      for (const tower of humanTowers) {
        expect(typeof tower.abilities![0]).toBe('string');
        expect(typeof tower.abilities![1]).toBe('string');
      }
    });
  });

  describe('visual definitions', () => {
    it('should have valid shape definitions', () => {
      for (const tower of humanTowers) {
        expect(tower.visual.shapes.length).toBeGreaterThan(0);

        for (const shape of tower.visual.shapes) {
          expect(shape.type).toBeDefined();
          expect(['circle', 'rect', 'polygon', 'line', 'arc', 'star']).toContain(shape.type);

          // Layer should be a number
          if (shape.layer !== undefined) {
            expect(typeof shape.layer).toBe('number');
          }
        }
      }
    });

    it('should use hex numbers for colors, not strings', () => {
      for (const tower of humanTowers) {
        for (const shape of tower.visual.shapes) {
          if (shape.fill !== undefined && shape.fill !== 'dynamic') {
            expect(typeof shape.fill).toBe('number');
          }
          if (shape.stroke !== undefined && shape.stroke !== 'dynamic') {
            expect(typeof shape.stroke).toBe('number');
          }
        }
      }
    });
  });

  describe('game balance', () => {
    it('should have reasonable cost range', () => {
      for (const tower of humanTowers) {
        expect(tower.baseCost).toBeGreaterThanOrEqual(50);
        expect(tower.baseCost).toBeLessThanOrEqual(500);
      }
    });

    it('should have valid damage types', () => {
      const validTypes = Object.values(DamageType);
      for (const tower of humanTowers) {
        expect(validTypes).toContain(tower.damageType);
      }
    });

    it('should have attack speed between 0.1 and 3.0', () => {
      for (const tower of humanTowers) {
        expect(tower.baseAttackSpeed).toBeGreaterThanOrEqual(0.1);
        expect(tower.baseAttackSpeed).toBeLessThanOrEqual(3.0);
      }
    });

    it('should have range between 50 and 400', () => {
      for (const tower of humanTowers) {
        expect(tower.baseRange).toBeGreaterThanOrEqual(50);
        expect(tower.baseRange).toBeLessThanOrEqual(400);
      }
    });
  });

  describe('specific towers', () => {
    it('should include Basic Archer', () => {
      const archer = humanTowers.find(t => t.id === 'basic_archer');
      expect(archer).toBeDefined();
      expect(archer!.damageType).toBe(DamageType.Physical);
    });

    it('should include Sniper', () => {
      const sniper = humanTowers.find(t => t.id === 'sniper');
      expect(sniper).toBeDefined();
      expect(sniper!.baseDamage).toBeGreaterThan(humanTowers.find(t => t.id === 'basic_archer')!.baseDamage);
    });

    it('should include Barracks', () => {
      const barracks = humanTowers.find(t => t.id === 'barracks');
      expect(barracks).toBeDefined();
    });

    it('should include Catapult', () => {
      const catapult = humanTowers.find(t => t.id === 'catapult');
      expect(catapult).toBeDefined();
    });
  });
});
