/**
 * Shield effect for abilities (damage absorption)
 */

import {
  IAbilityEffect,
  AbilityEffectType,
  AbilityContext,
  ShieldEffectConfig,
} from '../../types/abilities';
import { DamageType } from '../../types/game';

/**
 * Active shield instance
 */
export interface ActiveShield {
  amount: number;
  maxAmount: number;
  duration: number;
  timeRemaining: number;
  absorbTypes?: DamageType[];
  targetId: string;
}

export class ShieldEffect implements IAbilityEffect {
  public readonly type = AbilityEffectType.Shield;

  constructor(private config: ShieldEffectConfig) {}

  apply(_context: AbilityContext): void {
    // TODO: Implement shield application
    // const { amount, duration, absorbTypes } = this.config;
    // Get target (can be monster or tower)
    // Create active shield and integrate with ShieldSystem
    // const shield: ActiveShield = { amount, maxAmount: amount, duration, ... }
    // Apply shield to target via ShieldSystem
  }

  /**
   * Update shield (called by ShieldSystem)
   */
  static updateShield(shield: ActiveShield, deltaTime: number): boolean {
    shield.timeRemaining -= deltaTime;

    // Remove shield if expired or broken
    if (shield.timeRemaining <= 0 || shield.amount <= 0) {
      return false; // Shield should be removed
    }

    return true; // Shield continues
  }

  /**
   * Absorb damage with shield
   * Returns remaining damage after absorption
   */
  static absorbDamage(
    shield: ActiveShield,
    damage: number,
    damageType: DamageType
  ): number {
    // Check if shield absorbs this damage type
    if (shield.absorbTypes && shield.absorbTypes.length > 0) {
      if (!shield.absorbTypes.includes(damageType)) {
        return damage; // Shield doesn't absorb this type
      }
    }

    // Calculate absorption
    const absorbed = Math.min(damage, shield.amount);
    shield.amount -= absorbed;

    // Return remaining damage
    return damage - absorbed;
  }

  /**
   * Get remaining shield amount
   */
  static getShieldAmount(shield: ActiveShield): number {
    return shield.amount;
  }

  /**
   * Get shield percentage (0-1)
   */
  static getShieldPercentage(shield: ActiveShield): number {
    return shield.amount / shield.maxAmount;
  }

  /**
   * Get the shield amount
   */
  getAmount(): number {
    return this.config.amount;
  }

  /**
   * Get the duration
   */
  getDuration(): number {
    return this.config.duration;
  }

  /**
   * Get absorbed damage types
   */
  getAbsorbTypes(): DamageType[] | undefined {
    return this.config.absorbTypes;
  }
}
