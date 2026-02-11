/**
 * TargetingSystem Tests
 *
 * Tests for tower targeting logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TargetingSystem } from './TargetingSystem';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { createMockTower, createMockMonster, createMockMonsterManager, addMonsterToManager } from '../test/utils/testUtils';
import { TargetPriority } from '../types/game';

describe('TargetingSystem', () => {
  let targetingSystem: TargetingSystem;
  let monsterManager: MonsterManager;

  beforeEach(() => {
    monsterManager = createMockMonsterManager();
    targetingSystem = new TargetingSystem(monsterManager);
  });

  describe('findTarget', () => {
    it('should return null when no monsters in range', () => {
      const tower = createMockTower({ baseRange: 100 }, 100, 100);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBeNull();
    });

    it('should find monsters in range', () => {
      const tower = createMockTower({ baseRange: 150 }, 100, 100);

      // Create monster in range
      const monster = createMockMonster(undefined, 150, 150);
      addMonsterToManager(monsterManager, monster);

      const target = targetingSystem.findTarget(tower);

      expect(target).not.toBeNull();
      expect(target).toBe(monster);
    });

    it('should not target monsters out of range', () => {
      const tower = createMockTower({ baseRange: 100 }, 100, 100);

      // Create monster out of range
      const monster = createMockMonster(undefined, 300, 300);
      addMonsterToManager(monsterManager, monster);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBeNull();
    });
  });

  describe('target priority: First', () => {
    it('should target monster furthest along path', () => {
      const tower = createMockTower({
        baseRange: 200,
        targetPriority: TargetPriority.First
      }, 100, 100);

      // Create monsters with different path progress
      const monster1 = createMockMonster(undefined, 120, 120);
      monster1.pathIndex = 5; // Further along
      const monster2 = createMockMonster(undefined, 110, 110);
      monster2.pathIndex = 2; // Less far

      addMonsterToManager(monsterManager, monster1);
      addMonsterToManager(monsterManager, monster2);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBe(monster1);
    });
  });

  describe('target priority: Last', () => {
    it('should target monster closest to spawn', () => {
      const tower = createMockTower({
        baseRange: 200,
        targetPriority: TargetPriority.Last
      }, 100, 100);

      const monster1 = createMockMonster(undefined, 120, 120);
      monster1.pathIndex = 5;
      const monster2 = createMockMonster(undefined, 110, 110);
      monster2.pathIndex = 2; // Closer to spawn

      addMonsterToManager(monsterManager, monster1);
      addMonsterToManager(monsterManager, monster2);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBe(monster2);
    });
  });

  describe('target priority: Strongest', () => {
    it('should target monster with highest health', () => {
      const tower = createMockTower({
        baseRange: 200,
        targetPriority: TargetPriority.Strongest
      }, 100, 100);

      const monster1 = createMockMonster(undefined, 120, 120);
      monster1.health = 100;
      const monster2 = createMockMonster(undefined, 110, 110);
      monster2.health = 200; // Stronger

      addMonsterToManager(monsterManager, monster1);
      addMonsterToManager(monsterManager, monster2);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBe(monster2);
    });
  });

  describe('target priority: Weakest', () => {
    it('should target monster with lowest health', () => {
      const tower = createMockTower({
        baseRange: 200,
        targetPriority: TargetPriority.Weakest
      }, 100, 100);

      const monster1 = createMockMonster(undefined, 120, 120);
      monster1.health = 100; // Weaker
      const monster2 = createMockMonster(undefined, 110, 110);
      monster2.health = 200;

      addMonsterToManager(monsterManager, monster1);
      addMonsterToManager(monsterManager, monster2);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBe(monster1);
    });
  });

  describe('target priority: Closest', () => {
    it('should target monster closest to tower', () => {
      const tower = createMockTower({
        baseRange: 200,
        targetPriority: TargetPriority.Closest
      }, 100, 100);

      const monster1 = createMockMonster(undefined, 150, 150);
      const monster2 = createMockMonster(undefined, 120, 120); // Closer

      addMonsterToManager(monsterManager, monster1);
      addMonsterToManager(monsterManager, monster2);

      const target = targetingSystem.findTarget(tower);

      expect(target).toBe(monster2);
    });
  });

  describe('updateTarget', () => {
    it('should clear dead target', () => {
      const tower = createMockTower({ baseRange: 150 }, 100, 100);
      const monster = createMockMonster(undefined, 120, 120);
      addMonsterToManager(monsterManager, monster);

      tower.currentTarget = monster;
      monster.isAlive = false;

      targetingSystem.updateTarget(tower);

      expect(tower.currentTarget).toBeNull();
    });

    it('should clear target that moved out of range', () => {
      const tower = createMockTower({ baseRange: 150 }, 100, 100);
      const monster = createMockMonster(undefined, 120, 120);
      addMonsterToManager(monsterManager, monster);

      tower.currentTarget = monster;
      monster.position.x = 500; // Move far away

      targetingSystem.updateTarget(tower);

      expect(tower.currentTarget).toBeNull();
    });

    it('should find new target when current is null', () => {
      const tower = createMockTower({ baseRange: 150 }, 100, 100);
      const monster = createMockMonster(undefined, 120, 120);
      addMonsterToManager(monsterManager, monster);

      tower.currentTarget = null;

      targetingSystem.updateTarget(tower);

      expect(tower.currentTarget).toBe(monster);
    });

    it('should keep valid target', () => {
      const tower = createMockTower({ baseRange: 150 }, 100, 100);
      const monster = createMockMonster(undefined, 120, 120);
      addMonsterToManager(monsterManager, monster);

      tower.currentTarget = monster;

      targetingSystem.updateTarget(tower);

      expect(tower.currentTarget).toBe(monster);
    });
  });
});
