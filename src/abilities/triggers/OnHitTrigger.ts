/**
 * On-hit trigger - triggers when the source deals damage
 */

import {
  IAbilityTrigger,
  AbilityTriggerType,
  AbilityContext,
  OnHitTriggerConfig,
} from '../../types/abilities';

export class OnHitTrigger implements IAbilityTrigger {
  public readonly type = AbilityTriggerType.OnHit;

  constructor(private config: OnHitTriggerConfig) {}

  shouldTrigger(context: AbilityContext): boolean {
    // Check if this is a hit context
    if (!context.damageDealt || context.damageDealt <= 0) {
      return false;
    }

    // Check if critical is required
    if (this.config.requiresCritical && !context.wasCritical) {
      return false;
    }

    // Check chance
    return Math.random() < this.config.chance;
  }

  update(_deltaTime: number): void {
    // No-op for on-hit triggers
  }

  /**
   * Get trigger chance
   */
  getChance(): number {
    return this.config.chance;
  }

  /**
   * Check if requires critical
   */
  requiresCritical(): boolean {
    return this.config.requiresCritical || false;
  }
}
