/**
 * Damage effect for abilities
 */

import {
  IAbilityEffect,
  AbilityEffectType,
  AbilityContext,
  DamageEffectConfig,
} from '../../types/abilities';
import { Monster } from '../../entities/monsters/Monster';

export class DamageEffect implements IAbilityEffect {
  public readonly type = AbilityEffectType.Damage;

  constructor(private config: DamageEffectConfig) {}

  apply(context: AbilityContext): void {
    const { damage, damageType, radius, maxTargets, isPercentHealth } = this.config;

    // Get targets
    let targets: Monster[] = [];

    if (radius && radius > 0) {
      // Area damage
      if (context.nearbyMonsters) {
        const sourcePos = context.source.position;
        targets = context.nearbyMonsters.filter((monster) => {
          const distance = monster.position.distanceTo(sourcePos);
          return distance <= radius;
        });

        // Sort by distance (closest first)
        targets.sort((a, b) => {
          const distA = a.position.distanceTo(sourcePos);
          const distB = b.position.distanceTo(sourcePos);
          return distA - distB;
        });

        // Trigger AoE visual effect
        if (context.onAoEEffect) {
          context.onAoEEffect(sourcePos.x, sourcePos.y, radius, damageType);
        }
      }
    } else if (context.target && context.target instanceof Monster) {
      // Single target
      targets = [context.target];
    }

    // Limit max targets
    if (maxTargets && maxTargets > 0 && targets.length > maxTargets) {
      targets = targets.slice(0, maxTargets);
    }

    // Deal damage to all targets
    for (const target of targets) {
      let finalDamage = damage;

      // Percentage health damage
      if (isPercentHealth) {
        finalDamage = target.maxHealth * damage;
      }

      // Apply damage through combat system (will be integrated later)
      target.takeDamage(finalDamage, damageType);
    }
  }

  /**
   * Get the damage amount
   */
  getDamage(): number {
    return this.config.damage;
  }

  /**
   * Get the radius (if area damage)
   */
  getRadius(): number {
    return this.config.radius || 0;
  }
}
