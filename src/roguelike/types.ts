/**
 * Type definitions for roguelike progression system
 */

import { TowerRace } from '../types/game';

/**
 * Reward types available after wave completion
 */
export enum RewardType {
  NewTower = 'new_tower',
  Gold = 'gold',
  ExtraLife = 'extra_life',
  GlobalBuff = 'global_buff',
}

/**
 * Types of global buffs that can be applied to all towers
 */
export enum BuffType {
  DamageBoost = 'damage_boost',
  RangeBoost = 'range_boost',
  AttackSpeedBoost = 'attack_speed_boost',
  GoldBonus = 'gold_bonus',
  LifeRegeneration = 'life_regeneration',
}

/**
 * Global buff that affects all towers for the duration of the run
 */
export interface GlobalBuff {
  id: string;
  type: BuffType;
  name: string;
  description: string;
  value: number; // Multiplier or flat value (e.g., 0.1 = 10% increase)
  icon?: string;
}

/**
 * Reward that can be selected after wave completion
 */
export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic';

  // Type-specific data
  towerId?: string; // For NewTower
  goldAmount?: number; // For Gold
  lifeAmount?: number; // For ExtraLife
  buff?: GlobalBuff; // For GlobalBuff
}

/**
 * State of the current roguelike run
 */
export interface RunState {
  // Race selection
  selectedRace: TowerRace | null; // Selected race for this run

  // Tower progression
  availableTowers: string[]; // Tower IDs player can place

  // Active buffs
  activeBuffs: GlobalBuff[];

  // Run stats
  totalKills: number;
  totalGoldEarned: number;
  highestWave: number;
  runStartTime: number;
  runEndTime?: number;
}

/**
 * Context used for reward generation
 */
export interface RewardGenerationContext {
  currentWave: number;
  availableTowers: string[];
  allTowerIds: string[];
  currentGold: number;
  currentLives: number;
}

/**
 * Weighted reward for selection
 */
export interface WeightedReward {
  reward: Reward;
  weight: number;
}

/**
 * Run stats for display
 */
export interface RunStats {
  totalKills: number;
  totalGoldEarned: number;
  highestWave: number;
  runDuration: number; // milliseconds
}
