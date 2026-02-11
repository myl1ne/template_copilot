/**
 * Health threshold trigger - triggers when health drops below a threshold
 */

import {
  IAbilityTrigger,
  AbilityTriggerType,
  AbilityContext,
  HealthThresholdTriggerConfig,
} from '../../types/abilities';
import { Monster } from '../../entities/monsters/Monster';

export class OnHealthThresholdTrigger implements IAbilityTrigger {
  public readonly type = AbilityTriggerType.OnHealthThreshold;

  private hasTriggered: boolean = false;

  constructor(private config: HealthThresholdTriggerConfig) {}

  shouldTrigger(context: AbilityContext): boolean {
    // Check if already triggered (if triggerOnce is true)
    if (this.config.triggerOnce && this.hasTriggered) {
      return false;
    }

    // Check if source is a monster (has health)
    if (!(context.source instanceof Monster)) {
      return false;
    }

    const monster = context.source as Monster;
    const healthPercent = monster.health / monster.maxHealth;

    // Check if below threshold
    if (healthPercent <= this.config.threshold) {
      if (this.config.triggerOnce) {
        this.hasTriggered = true;
      }
      return true;
    }

    return false;
  }

  update(_deltaTime: number): void {
    // No-op for health threshold triggers
  }

  /**
   * Reset the trigger (allows it to trigger again)
   */
  reset(): void {
    this.hasTriggered = false;
  }

  /**
   * Get the threshold
   */
  getThreshold(): number {
    return this.config.threshold;
  }

  /**
   * Check if trigger once
   */
  isTriggerOnce(): boolean {
    return this.config.triggerOnce || false;
  }
}
