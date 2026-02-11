/**
 * System for handling tower upgrades
 */

import { Tower } from '../entities/towers/Tower';
import { TowerManager } from '../entities/towers/TowerManager';
import { AbilitySystem } from './AbilitySystem';
import { createAbilityById } from '../data/abilities/AbilityFactory';
import { useGameStore } from '../store/gameStore';

export interface UpgradeCost {
  gold: number;
}

export interface UpgradeResult {
  success: boolean;
  message?: string;
  newLevel?: number;
}

/**
 * Upgrade system manages tower leveling and stat progression
 */
export class UpgradeSystem {
  constructor(
    private towerManager: TowerManager,
    private abilitySystem: AbilitySystem
  ) {}

  /**
   * Calculate the cost to upgrade a tower to the next level
   */
  calculateUpgradeCost(tower: Tower): UpgradeCost {
    const definition = tower.definition;
    const currentLevel = tower.level;

    // Cost formula: baseCost * multiplier^level
    const multiplier = definition.upgradeCostMultiplier || 1.5;
    const cost = Math.floor(definition.baseCost * Math.pow(multiplier, currentLevel));

    return { gold: cost };
  }

  /**
   * Check if a tower can be upgraded
   */
  canUpgrade(tower: Tower): boolean {
    const definition = tower.definition;

    // Check if tower is at max level
    if (tower.level >= definition.maxLevel) {
      return false;
    }

    // Check if player has enough gold
    const cost = this.calculateUpgradeCost(tower);
    const currentGold = useGameStore.getState().gold;

    return currentGold >= cost.gold;
  }

  /**
   * Upgrade a tower
   */
  upgradeTower(towerId: string): UpgradeResult {
    const tower = this.towerManager.getTower(towerId);

    if (!tower) {
      return { success: false, message: 'Tower not found' };
    }

    const definition = tower.definition;

    // Check if at max level
    if (tower.level >= definition.maxLevel) {
      return { success: false, message: 'Tower is at max level' };
    }

    // Check gold cost
    const cost = this.calculateUpgradeCost(tower);
    const currentGold = useGameStore.getState().gold;

    if (currentGold < cost.gold) {
      return { success: false, message: 'Not enough gold' };
    }

    // Deduct cost
    useGameStore.getState().spendGold(cost.gold);

    // Upgrade tower
    const newLevel = tower.level + 1;
    tower.level = newLevel;

    // Apply stat upgrades
    this.applyStatUpgrades(tower);

    // Check for ability unlocks
    this.checkAbilityUnlocks(tower);

    return {
      success: true,
      message: `Upgraded ${tower.definition.name} to level ${newLevel}`,
      newLevel,
    };
  }

  /**
   * Apply stat upgrades to a tower based on its level
   */
  private applyStatUpgrades(tower: Tower): void {
    const definition = tower.definition;
    const level = tower.level;

    // Calculate stats based on level (linear scaling)
    // Formula: baseStat + statPerLevel * (level - 1)
    // Note: level 1 = base stats, level 2 = base + 1 * perLevel, etc.

    if (definition.damagePerLevel !== undefined) {
      tower.damage = definition.baseDamage + definition.damagePerLevel * (level - 1);
    }

    if (definition.rangePerLevel !== undefined) {
      tower.range = definition.baseRange + definition.rangePerLevel * (level - 1);
    }

    if (definition.attackSpeedPerLevel !== undefined) {
      tower.attackSpeed = definition.baseAttackSpeed + definition.attackSpeedPerLevel * (level - 1);
    }
  }

  /**
   * Check if tower unlocks any abilities at this level
   */
  private checkAbilityUnlocks(tower: Tower): void {
    const definition = tower.definition;

    // Check if abilities are defined
    if (!definition.abilities || definition.abilities.length === 0) {
      return;
    }

    // Level 5 unlocks first ability, level 10 unlocks second
    let abilityId: string | undefined;
    if (tower.level === 5 && definition.abilities[0]) {
      abilityId = definition.abilities[0];
    } else if (tower.level === 10 && definition.abilities[1]) {
      abilityId = definition.abilities[1];
    }

    if (abilityId) {
      const ability = createAbilityById(abilityId);
      if (ability) {
        // Get existing abilities and append
        const existing = this.abilitySystem.getAbilities(tower.id);
        this.abilitySystem.registerAbilities(tower.id, [...existing, ability]);
      }
    }
  }

  /**
   * Get upgrade info for a tower (for UI)
   */
  getUpgradeInfo(tower: Tower): {
    canUpgrade: boolean;
    cost: UpgradeCost;
    currentLevel: number;
    maxLevel: number;
    nextStats: {
      damage?: number;
      range?: number;
      attackSpeed?: number;
    };
  } {
    const definition = tower.definition;
    const canUpgrade = this.canUpgrade(tower);
    const cost = this.calculateUpgradeCost(tower);
    const nextLevel = tower.level + 1;

    // Calculate next level stats
    const nextStats: any = {};

    if (definition.damagePerLevel !== undefined) {
      nextStats.damage = definition.baseDamage + definition.damagePerLevel * nextLevel;
    }

    if (definition.rangePerLevel !== undefined) {
      nextStats.range = definition.baseRange + definition.rangePerLevel * nextLevel;
    }

    if (definition.attackSpeedPerLevel !== undefined) {
      nextStats.attackSpeed =
        definition.baseAttackSpeed + definition.attackSpeedPerLevel * nextLevel;
    }

    return {
      canUpgrade,
      cost,
      currentLevel: tower.level,
      maxLevel: definition.maxLevel,
      nextStats,
    };
  }

  /**
   * Calculate stat increase from upgrade
   */
  getStatIncrease(tower: Tower): {
    damageIncrease?: number;
    rangeIncrease?: number;
    attackSpeedIncrease?: number;
  } {
    const definition = tower.definition;

    return {
      damageIncrease: definition.damagePerLevel,
      rangeIncrease: definition.rangePerLevel,
      attackSpeedIncrease: definition.attackSpeedPerLevel,
    };
  }

  /**
   * Get total cost to upgrade from level 1 to target level
   */
  getTotalUpgradeCost(tower: Tower, targetLevel: number): number {
    const definition = tower.definition;
    const multiplier = definition.upgradeCostMultiplier || 1.5;
    let totalCost = 0;

    for (let level = 1; level < targetLevel; level++) {
      totalCost += Math.floor(definition.baseCost * Math.pow(multiplier, level));
    }

    return totalCost;
  }

  /**
   * Sell a tower (for refund)
   */
  sellTower(towerId: string): boolean {
    const tower = this.towerManager.getTower(towerId);

    if (!tower) {
      return false;
    }

    // Calculate refund (50% of total cost including upgrades)
    const totalCost =
      tower.definition.baseCost + this.getTotalUpgradeCost(tower, tower.level);
    const refund = Math.floor(totalCost * 0.5);

    // Give refund
    useGameStore.getState().addGold(refund);

    // Remove tower
    this.towerManager.removeTower(towerId);

    return true;
  }

  /**
   * Get sell value for a tower
   */
  getSellValue(tower: Tower): number {
    const totalCost =
      tower.definition.baseCost + this.getTotalUpgradeCost(tower, tower.level);
    return Math.floor(totalCost * 0.5);
  }
}
