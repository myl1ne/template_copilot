/**
 * On-death trigger - triggers when the source dies
 */

import {
  IAbilityTrigger,
  AbilityTriggerType,
  AbilityContext,
} from '../../types/abilities';
import { Monster } from '../../entities/monsters/Monster';
import { Tower } from '../../entities/towers/Tower';

export class OnDeathTrigger implements IAbilityTrigger {
  public readonly type = AbilityTriggerType.OnDeath;

  shouldTrigger(context: AbilityContext): boolean {
    // Check if source is dead
    if (context.source instanceof Monster || context.source instanceof Tower) {
      return !context.source.isAlive;
    }

    return false;
  }

  update(_deltaTime: number): void {
    // No-op for on-death triggers
  }
}
