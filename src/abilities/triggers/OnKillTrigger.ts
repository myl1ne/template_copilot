/**
 * On-kill trigger - triggers when the source kills a target
 */

import {
  IAbilityTrigger,
  AbilityTriggerType,
  AbilityContext,
} from '../../types/abilities';

export class OnKillTrigger implements IAbilityTrigger {
  public readonly type = AbilityTriggerType.OnKill;

  shouldTrigger(context: AbilityContext): boolean {
    // Check if there's a target and it's dead
    if (!context.target) {
      return false;
    }

    // Check if target died from the damage
    return !context.target.isAlive;
  }

  update(_deltaTime: number): void {
    // No-op for on-kill triggers
  }
}
