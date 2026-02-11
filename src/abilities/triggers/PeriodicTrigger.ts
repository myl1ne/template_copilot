/**
 * Periodic trigger - triggers at regular intervals
 */

import {
  IAbilityTrigger,
  AbilityTriggerType,
  AbilityContext,
  PeriodicTriggerConfig,
} from '../../types/abilities';

export class PeriodicTrigger implements IAbilityTrigger {
  public readonly type = AbilityTriggerType.Periodic;

  private timeSinceLastTrigger: number = 0;

  constructor(private config: PeriodicTriggerConfig) {}

  shouldTrigger(_context: AbilityContext): boolean {
    // Trigger when enough time has passed
    if (this.timeSinceLastTrigger >= this.config.interval) {
      // Reset timer on trigger (keep remainder to prevent drift)
      this.timeSinceLastTrigger -= this.config.interval;
      return true;
    }
    return false;
  }

  update(deltaTime: number): void {
    this.timeSinceLastTrigger += deltaTime;
  }

  /**
   * Reset the trigger timer
   */
  reset(): void {
    this.timeSinceLastTrigger = 0;
  }

  /**
   * Get progress to next trigger (0-1)
   */
  getProgress(): number {
    return this.timeSinceLastTrigger / this.config.interval;
  }

  /**
   * Get time until next trigger
   */
  getTimeUntilNext(): number {
    return Math.max(0, this.config.interval - this.timeSinceLastTrigger);
  }
}
