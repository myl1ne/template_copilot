/**
 * System for generating and applying rewards
 */

import { Reward, RewardType, RewardGenerationContext, WeightedReward } from './types';
import { RunManager } from './RunManager';
import { useGameStore } from '../store/gameStore';
import {
  createTowerReward,
  createGoldReward,
  createLifeReward,
  createBuffReward,
  getRandomBuff,
} from '../data/rewards';
import { TOWER_DEFINITIONS } from '../data/towers';

/**
 * Reward System generates contextual rewards and applies them
 */
export class RewardSystem {
  constructor(private runManager: RunManager) {}

  /**
   * Generate 3 random rewards based on current game context
   */
  generateRewards(context: RewardGenerationContext): Reward[] {
    const pool = this.buildRewardPool(context);

    if (pool.length === 0) {
      console.warn('No rewards available in pool! Generating fallback rewards');
      return [createGoldReward(context.currentWave), createLifeReward(1), createLifeReward(2)];
    }

    return this.selectRandomRewards(pool, 3);
  }

  /**
   * Build weighted reward pool based on game context
   */
  private buildRewardPool(context: RewardGenerationContext): WeightedReward[] {
    const pool: WeightedReward[] = [];

    // Calculate unlock progress
    const unlockedCount = context.availableTowers.length;
    const totalTowers = context.allTowerIds.length;

    // 1. Tower unlock rewards
    // Weight: High early (50), decreases as more towers are unlocked (50 - 10*unlocked)
    // Only show towers that aren't unlocked yet
    if (unlockedCount < totalTowers) {
      const towerWeight = Math.max(50 - unlockedCount * 10, 10);

      for (const towerId of context.allTowerIds) {
        if (!context.availableTowers.includes(towerId)) {
          const definition = TOWER_DEFINITIONS[towerId];
          if (definition) {
            pool.push({
              reward: createTowerReward(towerId, definition),
              weight: towerWeight,
            });
          }
        }
      }
    }

    // 2. Gold rewards
    // Weight: Consistent (30)
    pool.push({
      reward: createGoldReward(context.currentWave),
      weight: 30,
    });

    // 3. Life rewards
    // Weight: Higher when low lives (40 if <10 lives, else 20)
    const lifeWeight = context.currentLives < 10 ? 40 : 20;

    pool.push({
      reward: createLifeReward(1),
      weight: lifeWeight,
    });

    // 10% chance for 2 lives (half weight)
    pool.push({
      reward: createLifeReward(2),
      weight: lifeWeight * 0.5,
    });

    // 4. Global buff rewards
    // Weight: Low early (10), increases mid-late game (10 + 2*wave, max 40)
    const buffWeight = Math.min(10 + context.currentWave * 2, 40);

    // Add multiple buff options
    for (let i = 0; i < 3; i++) {
      pool.push({
        reward: createBuffReward(getRandomBuff()),
        weight: buffWeight,
      });
    }

    return pool;
  }

  /**
   * Select N random rewards from weighted pool
   */
  private selectRandomRewards(pool: WeightedReward[], count: number): Reward[] {
    const selected: Reward[] = [];
    const availablePool = [...pool];

    for (let i = 0; i < count && availablePool.length > 0; i++) {
      const reward = this.selectWeightedRandom(availablePool);
      selected.push(reward);

      // Remove selected reward and duplicates of the same reward
      availablePool.splice(
        availablePool.findIndex((r) => r.reward.id === reward.id),
        1
      );

      // Also remove duplicates (same type + same specific item)
      const isDuplicate = (r: WeightedReward): boolean => {
        if (r.reward.type !== reward.type) return false;

        // Check type-specific duplicates
        if (reward.type === RewardType.NewTower) {
          return r.reward.towerId === reward.towerId;
        } else if (reward.type === RewardType.GlobalBuff) {
          return r.reward.buff?.type === reward.buff?.type;
        }

        return false;
      };

      // Remove all duplicates
      for (let j = availablePool.length - 1; j >= 0; j--) {
        if (isDuplicate(availablePool[j]!)) {
          availablePool.splice(j, 1);
        }
      }
    }

    return selected;
  }

  /**
   * Select a random reward based on weights
   */
  private selectWeightedRandom(pool: WeightedReward[]): Reward {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of pool) {
      random -= item.weight;
      if (random <= 0) {
        return item.reward;
      }
    }

    // Fallback (should never reach here)
    return pool[pool.length - 1]!.reward;
  }

  /**
   * Apply a selected reward
   */
  applyReward(reward: Reward): void {
    console.log(`🎁 Applying reward: ${reward.name}`);

    switch (reward.type) {
      case RewardType.NewTower:
        if (reward.towerId) {
          this.runManager.unlockTower(reward.towerId);
        }
        break;

      case RewardType.Gold:
        if (reward.goldAmount) {
          useGameStore.getState().addGold(reward.goldAmount);
          this.runManager.recordGoldEarned(reward.goldAmount);
        }
        break;

      case RewardType.ExtraLife:
        if (reward.lifeAmount) {
          const currentLives = useGameStore.getState().lives;
          useGameStore.getState().setLives(currentLives + reward.lifeAmount);
        }
        break;

      case RewardType.GlobalBuff:
        if (reward.buff) {
          this.runManager.addBuff(reward.buff);
        }
        break;
    }
  }
}
