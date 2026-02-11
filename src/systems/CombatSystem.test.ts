/**
 * CombatSystem Tests
 *
 * Tests for combat mechanics, damage calculation, and rewards
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CombatSystem } from './CombatSystem';
import { TowerManager } from '../entities/towers/TowerManager';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { ProjectileManager } from '../entities/projectiles/ProjectileManager';
import { TargetingSystem } from './TargetingSystem';
import { DamageType } from '../types/game';
import {
  createMockTower,
  createMockMonster,
  createMockTowerManager,
  createMockMonsterManager,
  createMockProjectileManager,
  addMonsterToManager,
} from '../test/utils/testUtils';
import { useGameStore } from '../store/gameStore';
import { useRunStore } from '../store/runStore';

// Mock stores
vi.mock('../store/gameStore', () => ({
  useGameStore: {
    getState: vi.fn(() => ({
      gold: 1000,
      lives: 10,
      addGold: vi.fn(),
      loseLife: vi.fn(),
      addScore: vi.fn(),
    })),
  },
}));

vi.mock('../store/runStore', () => ({
  useRunStore: {
    getState: vi.fn(() => ({
      addGoldEarned: vi.fn(),
      incrementKills: vi.fn(),
    })),
  },
}));

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;
  let towerManager: TowerManager;
  let monsterManager: MonsterManager;
  let projectileManager: ProjectileManager;
  let targetingSystem: TargetingSystem;

  beforeEach(() => {
    towerManager = createMockTowerManager();
    monsterManager = createMockMonsterManager();
    projectileManager = createMockProjectileManager();
    targetingSystem = new TargetingSystem(monsterManager);
    combatSystem = new CombatSystem(
      towerManager,
      monsterManager,
      projectileManager,
      targetingSystem
    );

    // Reset mocks
    vi.clearAllMocks();

    // Mock window.runManager for gold multiplier
    (window as any).runManager = {
      getBuffMultiplier: vi.fn(() => 1.0),
    };
  });

  describe('dealDamage', () => {
    it('should deal full damage with no resistance', () => {
      const monster = createMockMonster({
        baseHealth: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const damageDealt = combatSystem.dealDamage(monster, 50, DamageType.Physical);

      expect(damageDealt).toBe(50);
      expect(monster.health).toBe(50);
    });

    it('should reduce damage with 50% resistance', () => {
      const monster = createMockMonster({
        baseHealth: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0.5, // 50% resistance
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const damageDealt = combatSystem.dealDamage(monster, 50, DamageType.Fire);

      expect(damageDealt).toBe(25); // 50 * (1 - 0.5)
      expect(monster.health).toBe(75);
    });

    it('should amplify damage with negative resistance (weakness)', () => {
      const monster = createMockMonster({
        baseHealth: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: -0.5, // -50% resistance = 1.5x damage
          [DamageType.Void]: 0,
        },
      });

      const damageDealt = combatSystem.dealDamage(monster, 50, DamageType.Holy);

      expect(damageDealt).toBe(75); // 50 * (1 - (-0.5)) = 50 * 1.5
      expect(monster.health).toBe(25);
    });

    it('should apply armor reduction to physical damage', () => {
      const monster = createMockMonster({
        baseHealth: 100,
        baseArmor: 100, // 100 armor = 50% reduction
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const damageDealt = combatSystem.dealDamage(monster, 50, DamageType.Physical);

      // Armor reduction: 100 / (100 + 100) = 0.5, so 50 * 0.5 = 25
      expect(damageDealt).toBe(25);
      expect(monster.health).toBe(75);
    });

    it('should apply ice slow effect', () => {
      const monster = createMockMonster({
        baseHealth: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      combatSystem.dealDamage(monster, 10, DamageType.Ice);

      expect(monster.isSlowed).toBe(true);
      expect(monster.statusEffects).toContain('slow');
      expect(monster.activeEffects.length).toBeGreaterThan(0);
      const slowEffect = monster.activeEffects.find(e => e.type === 'slow');
      expect(slowEffect).toBeDefined();
      expect(slowEffect?.duration).toBe(1.5);
    });

    it('should kill monster and award gold', () => {
      const addGold = vi.fn();
      const addGoldEarned = vi.fn();
      const incrementKills = vi.fn();
      const addScore = vi.fn();

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        lives: 10,
        addGold,
        loseLife: vi.fn(),
        addScore,
      } as any);

      vi.mocked(useRunStore.getState).mockReturnValue({
        addGoldEarned,
        incrementKills,
      } as any);

      const monster = createMockMonster({
        baseHealth: 50,
        goldReward: 10,
      });

      combatSystem.dealDamage(monster, 100, DamageType.Physical);

      expect(monster.isAlive).toBe(false);
      expect(addGold).toHaveBeenCalledWith(10);
      expect(addGoldEarned).toHaveBeenCalledWith(10);
      expect(incrementKills).toHaveBeenCalled();
      expect(addScore).toHaveBeenCalled();
    });

    it('should apply gold multiplier from buffs', () => {
      const addGold = vi.fn();

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        lives: 10,
        addGold,
        loseLife: vi.fn(),
        addScore: vi.fn(),
      } as any);

      // Mock 2x gold multiplier
      (window as any).runManager = {
        getBuffMultiplier: vi.fn(() => 2.0),
      };

      const monster = createMockMonster({
        baseHealth: 50,
        goldReward: 10,
      });

      combatSystem.dealDamage(monster, 100, DamageType.Physical);

      expect(addGold).toHaveBeenCalledWith(20); // 10 * 2.0
    });
  });

  describe('onMonsterReachedExit', () => {
    it('should lose a life', () => {
      const loseLife = vi.fn();

      vi.mocked(useGameStore.getState).mockReturnValue({
        gold: 1000,
        lives: 10,
        addGold: vi.fn(),
        loseLife,
        addScore: vi.fn(),
      } as any);

      const monster = createMockMonster();
      addMonsterToManager(monsterManager, monster);

      combatSystem.onMonsterReachedExit(monster);

      expect(loseLife).toHaveBeenCalled();
    });

    it('should remove monster', () => {
      const monster = createMockMonster();
      addMonsterToManager(monsterManager, monster);

      combatSystem.onMonsterReachedExit(monster);

      expect(monsterManager.getMonster(monster.id)).toBeUndefined();
    });
  });

  describe('calculateEffectiveDamage', () => {
    it('should calculate damage with resistance', () => {
      const monster = createMockMonster({
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0.5,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const effectiveDamage = combatSystem.calculateEffectiveDamage(
        100,
        DamageType.Fire,
        monster
      );

      expect(effectiveDamage).toBe(50); // 100 * (1 - 0.5)
    });

    it('should calculate physical damage with armor', () => {
      const monster = createMockMonster({
        baseArmor: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const effectiveDamage = combatSystem.calculateEffectiveDamage(
        100,
        DamageType.Physical,
        monster
      );

      // 100 armor = 50% reduction: 100 / (100 + 100) = 0.5
      expect(effectiveDamage).toBe(50);
    });
  });

  describe('getDamageMultiplier', () => {
    it('should return multiplier with resistance', () => {
      const monster = createMockMonster({
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0.5,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const multiplier = combatSystem.getDamageMultiplier(DamageType.Fire, monster);

      expect(multiplier).toBe(0.5); // 1 - 0.5
    });

    it('should return multiplier with armor for physical', () => {
      const monster = createMockMonster({
        baseArmor: 100,
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: 0,
          [DamageType.Void]: 0,
        },
      });

      const multiplier = combatSystem.getDamageMultiplier(DamageType.Physical, monster);

      expect(multiplier).toBe(0.5); // 100 / (100 + 100)
    });

    it('should return multiplier greater than 1 for weakness', () => {
      const monster = createMockMonster({
        resistances: {
          [DamageType.Physical]: 0,
          [DamageType.Fire]: 0,
          [DamageType.Ice]: 0,
          [DamageType.Lightning]: 0,
          [DamageType.Shadow]: 0,
          [DamageType.Holy]: -0.5, // Weakness
          [DamageType.Void]: 0,
        },
      });

      const multiplier = combatSystem.getDamageMultiplier(DamageType.Holy, monster);

      expect(multiplier).toBe(1.5); // 1 - (-0.5)
    });
  });
});
