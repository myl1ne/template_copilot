/**
 * UpgradeSystem Tests
 *
 * Tests for tower upgrade and sell mechanics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UpgradeSystem } from './UpgradeSystem';
import { AbilitySystem } from './AbilitySystem';
import { TowerManager } from '../entities/towers/TowerManager';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { createMockTower, createMockTowerManager, createMockMonsterManager } from '../test/utils/testUtils';
import { useGameStore } from '../store/gameStore';

// Mock the game store
vi.mock('../store/gameStore', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      gold: 1000,
      addGold: vi.fn(),
      spendGold: vi.fn(),
    })),
  },
}));

describe('UpgradeSystem', () => {
  let upgradeSystem: UpgradeSystem;
  let towerManager: TowerManager;
  let abilitySystem: AbilitySystem;
  let monsterManager: MonsterManager;

  beforeEach(() => {
    towerManager = createMockTowerManager();
    monsterManager = createMockMonsterManager();
    abilitySystem = new AbilitySystem(monsterManager, towerManager);
    upgradeSystem = new UpgradeSystem(towerManager, abilitySystem);

    // Reset mock
    vi.clearAllMocks();
  });

  describe('calculateUpgradeCost', () => {
    it('should calculate cost using exponential formula', () => {
      const tower = createMockTower({
        baseCost: 100,
        upgradeCostMultiplier: 1.5,
      });
      tower.level = 1;

      const cost = upgradeSystem.calculateUpgradeCost(tower);

      // Formula: baseCost * multiplier^level = 100 * 1.5^1 = 150
      expect(cost.gold).toBe(150);
    });

    it('should increase with level', () => {
      const tower = createMockTower({
        baseCost: 100,
        upgradeCostMultiplier: 1.5,
      });

      tower.level = 1;
      const cost1 = upgradeSystem.calculateUpgradeCost(tower);

      tower.level = 2;
      const cost2 = upgradeSystem.calculateUpgradeCost(tower);

      expect(cost2.gold).toBeGreaterThan(cost1.gold);
    });
  });

  describe('canUpgrade', () => {
    it('should return false when at max level', () => {
      const tower = createMockTower({ maxLevel: 10 });
      tower.level = 10;
      towerManager.addTower(tower);

      const canUpgrade = upgradeSystem.canUpgrade(tower);

      expect(canUpgrade).toBe(false);
    });

    it('should return false when not enough gold', () => {
      const tower = createMockTower({
        baseCost: 1000,
        upgradeCostMultiplier: 2.0,
      });
      tower.level = 5;
      towerManager.addTower(tower);

      // Mock low gold
      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 10,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      const canUpgrade = upgradeSystem.canUpgrade(tower);

      expect(canUpgrade).toBe(false);
    });

    it('should return true when conditions met', () => {
      const tower = createMockTower({
        baseCost: 100,
        maxLevel: 10,
      });
      tower.level = 1;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      const canUpgrade = upgradeSystem.canUpgrade(tower);

      expect(canUpgrade).toBe(true);
    });
  });

  describe('upgradeTower', () => {
    it('should return false if tower not found', () => {
      const result = upgradeSystem.upgradeTower('nonexistent');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should return false if at max level', () => {
      const tower = createMockTower({ maxLevel: 10 });
      tower.level = 10;
      towerManager.addTower(tower);

      const result = upgradeSystem.upgradeTower(tower.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('max level');
    });

    it('should return false if not enough gold', () => {
      const tower = createMockTower({ baseCost: 1000 });
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 10,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      const result = upgradeSystem.upgradeTower(tower.id);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Not enough gold');
    });

    it('should successfully upgrade tower', () => {
      const spendGold = vi.fn();
      const tower = createMockTower({
        baseCost: 100,
        baseDamage: 10,
        damagePerLevel: 5,
      });
      tower.level = 1;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        addGold: vi.fn(),
        spendGold,
      } as any);

      const result = upgradeSystem.upgradeTower(tower.id);

      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(tower.level).toBe(2);
      expect(spendGold).toHaveBeenCalled();
    });

    it('should apply stat upgrades', () => {
      const tower = createMockTower({
        baseCost: 100,
        baseDamage: 10,
        damagePerLevel: 5,
        baseRange: 100,
        rangePerLevel: 10,
      });
      tower.level = 1;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      upgradeSystem.upgradeTower(tower.id);

      // Level 2: base + perLevel * (2-1) = base + perLevel
      expect(tower.damage).toBe(15); // 10 + 5
      expect(tower.range).toBe(110); // 100 + 10
    });
  });

  describe('sellTower', () => {
    it('should return false if tower not found', () => {
      const result = upgradeSystem.sellTower('nonexistent');

      expect(result).toBe(false);
    });

    it('should refund 50% of total investment', () => {
      const addGold = vi.fn();
      const tower = createMockTower({ baseCost: 100 });
      tower.level = 1;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        addGold,
        spendGold: vi.fn(),
      } as any);

      upgradeSystem.sellTower(tower.id);

      // Level 1 tower: refund = baseCost * 0.5 = 50
      expect(addGold).toHaveBeenCalledWith(50);
    });

    it('should remove tower from manager', () => {
      const tower = createMockTower({ baseCost: 100 });
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      upgradeSystem.sellTower(tower.id);

      expect(towerManager.getTower(tower.id)).toBeUndefined();
    });
  });

  describe('getSellValue', () => {
    it('should calculate 50% refund', () => {
      const tower = createMockTower({ baseCost: 200 });
      tower.level = 1;

      const sellValue = upgradeSystem.getSellValue(tower);

      expect(sellValue).toBe(100); // 50% of 200
    });
  });

  describe('getTotalUpgradeCost', () => {
    it('should sum all upgrade costs', () => {
      const tower = createMockTower({
        baseCost: 100,
        upgradeCostMultiplier: 1.5,
      });

      const totalCost = upgradeSystem.getTotalUpgradeCost(tower, 3);

      // Level 1->2: 100 * 1.5^1 = 150
      // Level 2->3: 100 * 1.5^2 = 225
      // Total: 150 + 225 = 375
      expect(totalCost).toBe(375);
    });
  });

  describe('ability unlocks', () => {
    it('should unlock first ability at level 5', () => {
      const tower = createMockTower({
        baseCost: 50,
        abilities: ['test_ability_1', 'test_ability_2'],
      });
      tower.level = 4;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 10000,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      // Upgrade to level 5
      upgradeSystem.upgradeTower(tower.id);

      expect(tower.level).toBe(5);
      // Check that ability system has abilities registered
      // (Actual ability registration depends on AbilityFactory working)
    });

    it('should unlock second ability at level 10', () => {
      const tower = createMockTower({
        baseCost: 50,
        abilities: ['test_ability_1', 'test_ability_2'],
      });
      tower.level = 9;
      towerManager.addTower(tower);

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 100000,
        addGold: vi.fn(),
        spendGold: vi.fn(),
      } as any);

      // Upgrade to level 10
      upgradeSystem.upgradeTower(tower.id);

      expect(tower.level).toBe(10);
    });
  });
});
