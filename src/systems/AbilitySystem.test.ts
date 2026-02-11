/**
 * AbilitySystem Tests
 *
 * Tests for ability management and execution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AbilitySystem } from './AbilitySystem';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { TowerManager } from '../entities/towers/TowerManager';
import { Ability } from '../abilities/Ability';
import { PeriodicTrigger } from '../abilities/triggers/PeriodicTrigger';
import { DamageEffect } from '../abilities/effects/DamageEffect';
import { DamageType } from '../types/game';
import {
  createMockTowerManager,
  createMockMonsterManager,
  createMockTower,
  createMockMonster,
  addMonsterToManager,
} from '../test/utils/testUtils';

describe('AbilitySystem', () => {
  let abilitySystem: AbilitySystem;
  let monsterManager: MonsterManager;
  let towerManager: TowerManager;

  beforeEach(() => {
    monsterManager = createMockMonsterManager();
    towerManager = createMockTowerManager();
    abilitySystem = new AbilitySystem(monsterManager, towerManager);
  });

  describe('registerAbilities', () => {
    it('should register abilities for an entity', () => {
      const tower = createMockTower();
      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability]);

      const abilities = abilitySystem.getAbilities(tower.id);
      expect(abilities).toHaveLength(1);
      expect(abilities[0]).toBe(ability);
    });

    it('should replace existing abilities', () => {
      const tower = createMockTower();
      const ability1 = new Ability(
        'test_ability_1',
        'Test Ability 1',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );
      const ability2 = new Ability(
        'test_ability_2',
        'Test Ability 2',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability1]);
      abilitySystem.registerAbilities(tower.id, [ability2]);

      const abilities = abilitySystem.getAbilities(tower.id);
      expect(abilities).toHaveLength(1);
      expect(abilities[0]).toBe(ability2);
    });
  });

  describe('getAbilities', () => {
    it('should return empty array for unregistered entity', () => {
      const abilities = abilitySystem.getAbilities('nonexistent');
      expect(abilities).toEqual([]);
    });

    it('should return registered abilities', () => {
      const tower = createMockTower();
      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability]);

      const abilities = abilitySystem.getAbilities(tower.id);
      expect(abilities).toHaveLength(1);
      expect(abilities[0]).toBe(ability);
    });
  });

  describe('unregisterAbilities', () => {
    it('should remove abilities for an entity', () => {
      const tower = createMockTower();
      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability]);
      abilitySystem.unregisterAbilities(tower.id);

      const abilities = abilitySystem.getAbilities(tower.id);
      expect(abilities).toEqual([]);
    });
  });

  describe('activateAbility', () => {
    it('should return false for nonexistent entity', () => {
      const result = abilitySystem.activateAbility('nonexistent', 0);
      expect(result).toBe(false);
    });

    it('should return false for nonexistent ability', () => {
      const tower = createMockTower();
      towerManager.addTower(tower);

      const result = abilitySystem.activateAbility(tower.id, 0);
      expect(result).toBe(false);
    });

    it('should activate valid ability', () => {
      const tower = createMockTower();
      towerManager.addTower(tower);

      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        [new DamageEffect(10, DamageType.Physical, 100)]
      );

      abilitySystem.registerAbilities(tower.id, [ability]);

      const result = abilitySystem.activateAbility(tower.id, 0);
      expect(result).toBe(true);
    });
  });

  describe('update', () => {
    it('should update all registered abilities', () => {
      const tower = createMockTower();
      towerManager.addTower(tower);

      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability]);

      // Update should not throw
      expect(() => abilitySystem.update(0.016)).not.toThrow();
    });

    it('should update status effects on monsters', () => {
      const monster = createMockMonster({
        baseHealth: 100,
      });
      addMonsterToManager(monsterManager, monster);

      // Add burn effect manually
      monster.activeEffects.push({
        type: 'burn',
        potency: 1.0,
        duration: 2.0,
        timeRemaining: 2.0,
        tickRate: 0.5,
        tickDamage: 5,
        damageType: DamageType.Fire,
        timeSinceLastTick: 0,
      });

      const initialHealth = monster.health;

      // Update for 0.5 seconds (should tick once)
      abilitySystem.update(0.5);

      expect(monster.health).toBeLessThan(initialHealth);
    });

    it('should remove expired status effects', () => {
      const monster = createMockMonster({
        baseHealth: 100,
      });
      addMonsterToManager(monsterManager, monster);

      // Add slow effect with very short duration
      monster.activeEffects.push({
        type: 'slow',
        potency: 0.5,
        duration: 0.1,
        timeRemaining: 0.1,
      });
      monster.isSlowed = true;
      monster.statusEffects.push('slow');

      // Update past duration
      abilitySystem.update(0.2);

      expect(monster.activeEffects).toHaveLength(0);
      expect(monster.isSlowed).toBe(false);
      expect(monster.statusEffects).not.toContain('slow');
    });
  });

  describe('shield management', () => {
    it('should add shield to entity', () => {
      const tower = createMockTower();

      const shield = {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      };

      abilitySystem.addShield(tower.id, shield);

      const shields = abilitySystem.getShields(tower.id);
      expect(shields).toHaveLength(1);
      expect(shields[0]).toBe(shield);
    });

    it('should check if entity has shields', () => {
      const tower = createMockTower();

      expect(abilitySystem.hasShields(tower.id)).toBe(false);

      abilitySystem.addShield(tower.id, {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      expect(abilitySystem.hasShields(tower.id)).toBe(true);
    });

    it('should calculate total shield amount', () => {
      const tower = createMockTower();

      abilitySystem.addShield(tower.id, {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      abilitySystem.addShield(tower.id, {
        amount: 30,
        maxAmount: 30,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      expect(abilitySystem.getTotalShieldAmount(tower.id)).toBe(80);
    });

    it('should absorb damage with shields', () => {
      const tower = createMockTower();

      abilitySystem.addShield(tower.id, {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      const remainingDamage = abilitySystem.absorbDamageWithShields(
        tower.id,
        30,
        DamageType.Physical
      );

      // Should absorb all 30 damage
      expect(remainingDamage).toBe(0);

      // Shield should have 20 remaining
      const shields = abilitySystem.getShields(tower.id);
      expect(shields[0]!.amount).toBe(20);
    });

    it('should return excess damage when shield breaks', () => {
      const tower = createMockTower();

      abilitySystem.addShield(tower.id, {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      const remainingDamage = abilitySystem.absorbDamageWithShields(
        tower.id,
        80,
        DamageType.Physical
      );

      // Should absorb 50, return 30
      expect(remainingDamage).toBe(30);
    });
  });

  describe('clear', () => {
    it('should clear all abilities and effects', () => {
      const tower = createMockTower();
      const ability = new Ability(
        'test_ability',
        'Test Ability',
        'Test description',
        new PeriodicTrigger(1.0),
        []
      );

      abilitySystem.registerAbilities(tower.id, [ability]);
      abilitySystem.addShield(tower.id, {
        amount: 50,
        maxAmount: 50,
        duration: 5.0,
        timeRemaining: 5.0,
        absorbsAllDamageTypes: true,
      });

      abilitySystem.clear();

      expect(abilitySystem.getAbilities(tower.id)).toEqual([]);
      expect(abilitySystem.getShields(tower.id)).toEqual([]);
    });
  });
});
