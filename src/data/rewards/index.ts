/**
 * Reward pool definitions and helper functions
 */

import { Reward, RewardType, GlobalBuff, BuffType } from '../../roguelike/types';
import { TowerDefinition } from '../../types/entities';

/**
 * Pre-defined global buffs
 */
export const GLOBAL_BUFFS: Record<string, GlobalBuff> = {
  damage_boost_1: {
    id: 'damage_boost_1',
    type: BuffType.DamageBoost,
    name: 'Power Amplifier',
    description: 'All towers deal +10% damage',
    value: 0.1,
  },
  damage_boost_2: {
    id: 'damage_boost_2',
    type: BuffType.DamageBoost,
    name: 'Power Surge',
    description: 'All towers deal +15% damage',
    value: 0.15,
  },
  range_boost_1: {
    id: 'range_boost_1',
    type: BuffType.RangeBoost,
    name: 'Extended Reach',
    description: 'All towers have +15% range',
    value: 0.15,
  },
  range_boost_2: {
    id: 'range_boost_2',
    type: BuffType.RangeBoost,
    name: 'Far Sight',
    description: 'All towers have +20% range',
    value: 0.2,
  },
  attack_speed_boost_1: {
    id: 'attack_speed_boost_1',
    type: BuffType.AttackSpeedBoost,
    name: 'Rapid Fire',
    description: 'All towers attack +12% faster',
    value: 0.12,
  },
  attack_speed_boost_2: {
    id: 'attack_speed_boost_2',
    type: BuffType.AttackSpeedBoost,
    name: 'Chain Lightning',
    description: 'All towers attack +18% faster',
    value: 0.18,
  },
  gold_bonus_1: {
    id: 'gold_bonus_1',
    type: BuffType.GoldBonus,
    name: 'Treasure Hunter',
    description: 'Earn +20% gold from kills',
    value: 0.2,
  },
  gold_bonus_2: {
    id: 'gold_bonus_2',
    type: BuffType.GoldBonus,
    name: 'Golden Touch',
    description: 'Earn +30% gold from kills',
    value: 0.3,
  },
};

/**
 * Create a tower unlock reward
 */
export function createTowerReward(towerId: string, definition: TowerDefinition): Reward {
  return {
    id: `reward_tower_${towerId}`,
    type: RewardType.NewTower,
    name: `Unlock: ${definition.name}`,
    description: `${definition.description} (${definition.baseCost} gold, ${definition.damageType} damage)`,
    rarity: definition.baseCost < 150 ? 'common' : definition.baseCost < 250 ? 'rare' : 'epic',
    towerId,
  };
}

/**
 * Create a gold bonus reward (scales with wave number)
 */
export function createGoldReward(waveNumber: number): Reward {
  // Gold scales with wave: 50 + 10*wave
  const goldAmount = 50 + waveNumber * 10;

  return {
    id: `reward_gold_${waveNumber}`,
    type: RewardType.Gold,
    name: `Gold Bonus`,
    description: `Gain ${goldAmount} gold immediately`,
    rarity: goldAmount < 100 ? 'common' : goldAmount < 200 ? 'rare' : 'epic',
    goldAmount,
  };
}

/**
 * Create a life reward
 */
export function createLifeReward(amount: number = 1): Reward {
  return {
    id: `reward_life_${amount}`,
    type: RewardType.ExtraLife,
    name: amount === 1 ? 'Extra Life' : `${amount} Extra Lives`,
    description: `Gain +${amount} life`,
    rarity: amount === 1 ? 'common' : amount === 2 ? 'rare' : 'epic',
    lifeAmount: amount,
  };
}

/**
 * Create a global buff reward
 */
export function createBuffReward(buff: GlobalBuff): Reward {
  // Determine rarity based on buff value
  let rarity: 'common' | 'rare' | 'epic' = 'common';
  if (buff.value >= 0.2) {
    rarity = 'epic';
  } else if (buff.value >= 0.15) {
    rarity = 'rare';
  }

  return {
    id: `reward_buff_${buff.id}`,
    type: RewardType.GlobalBuff,
    name: buff.name,
    description: buff.description,
    rarity,
    buff,
  };
}

/**
 * Get a random buff from the pool
 */
export function getRandomBuff(): GlobalBuff {
  const buffKeys = Object.keys(GLOBAL_BUFFS);
  const randomKey = buffKeys[Math.floor(Math.random() * buffKeys.length)]!;
  return GLOBAL_BUFFS[randomKey]!;
}

/**
 * Get buffs by type
 */
export function getBuffsByType(type: BuffType): GlobalBuff[] {
  return Object.values(GLOBAL_BUFFS).filter((buff) => buff.type === type);
}
