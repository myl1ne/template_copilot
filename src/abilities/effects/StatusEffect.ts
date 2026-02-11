/**
 * Status effect for abilities (slow, stun, burn, etc.)
 */

import {
  IAbilityEffect,
  AbilityEffectType,
  AbilityContext,
  StatusEffectConfig,
  StatusEffectType,
} from '../../types/abilities';
import { Monster } from '../../entities/monsters/Monster';

/**
 * Active status effect instance on a monster
 */
export interface ActiveStatusEffect {
  type: StatusEffectType;
  potency: number;
  duration: number;
  timeRemaining: number;
  tickRate?: number;
  tickDamage?: number;
  damageType?: import('../../types/game').DamageType;
  timeSinceLastTick?: number;
}

export class StatusEffect implements IAbilityEffect {
  public readonly type = AbilityEffectType.Status;

  constructor(private config: StatusEffectConfig) {}

  apply(context: AbilityContext): void {
    const { statusType, duration, potency, tickRate, tickDamage, damageType, radius } = this.config;

    // Get target — either explicit target (on-hit) or nearby monsters (periodic)
    if (context.target && context.target instanceof Monster) {
      // On-hit: apply to the specific target
      this.applyToMonster(context.target as Monster, statusType, duration, potency, tickRate, tickDamage, damageType);
    } else if (context.source && context.nearbyMonsters) {
      // Periodic: apply to nearby monsters within radius (or source's range)
      const effectRadius = radius || ((context.source as any).range ?? 100);
      const sx = context.source.position.x;
      const sy = context.source.position.y;

      for (const monster of context.nearbyMonsters) {
        if (!monster.isAlive) continue;
        const dx = monster.position.x - sx;
        const dy = monster.position.y - sy;
        if (dx * dx + dy * dy <= effectRadius * effectRadius) {
          this.applyToMonster(monster, statusType, duration, potency, tickRate, tickDamage, damageType);
        }
      }
    }
  }

  private applyToMonster(
    target: Monster,
    statusType: StatusEffectType,
    duration: number,
    potency: number,
    tickRate?: number,
    tickDamage?: number,
    damageType?: import('../../types/game').DamageType,
  ): void {
    const activeEffect: ActiveStatusEffect = {
      type: statusType,
      potency,
      duration,
      timeRemaining: duration,
      tickRate,
      tickDamage,
      damageType,
      timeSinceLastTick: 0,
    };

    this.applyStatusToMonster(target, activeEffect);
  }

  /**
   * Apply status effect to monster
   */
  private applyStatusToMonster(monster: Monster, effect: ActiveStatusEffect): void {
    // Add to status effects list
    if (!monster.statusEffects.includes(effect.type)) {
      monster.statusEffects.push(effect.type);
    }

    // Apply specific effects
    switch (effect.type) {
      case StatusEffectType.Slow:
        monster.isSlowed = true;
        // Speed reduction is handled in Monster.update()
        break;

      case StatusEffectType.Stun:
        monster.isStunned = true;
        break;

      case StatusEffectType.Freeze:
        monster.isStunned = true;
        monster.isSlowed = true;
        break;

      case StatusEffectType.Burn:
      case StatusEffectType.Poison:
        // DoT effects are processed via activeEffects ticks
        break;

      case StatusEffectType.Weakness:
        monster.isWeakened = true;
        monster.weaknessAmount = Math.max(monster.weaknessAmount, effect.potency);
        break;
    }

    // Store active effect on monster for duration/DoT tracking
    monster.activeEffects.push({
      type: effect.type,
      potency: effect.potency,
      duration: effect.duration,
      timeRemaining: effect.timeRemaining,
      tickRate: effect.tickRate,
      tickDamage: effect.tickDamage,
      damageType: effect.damageType,
      timeSinceLastTick: effect.timeSinceLastTick,
    });
  }

  /**
   * Update all status effects on a monster (called by StatusEffectSystem)
   */
  static updateStatusEffects(monster: Monster, deltaTime: number, activeEffects: ActiveStatusEffect[]): void {
    for (let i = activeEffects.length - 1; i >= 0; i--) {
      const effect = activeEffects[i]!;
      effect.timeRemaining -= deltaTime;

      // Handle DoT ticks
      if (effect.tickRate && effect.tickDamage) {
        effect.timeSinceLastTick = (effect.timeSinceLastTick || 0) + deltaTime;

        while (effect.timeSinceLastTick >= effect.tickRate) {
          effect.timeSinceLastTick -= effect.tickRate;
          monster.takeDamage(effect.tickDamage, effect.damageType!);
        }
      }

      // Remove expired effects
      if (effect.timeRemaining <= 0) {
        StatusEffect.removeStatusFromMonster(monster, effect);
        activeEffects.splice(i, 1);
      }
    }
  }

  /**
   * Remove status effect from monster
   */
  private static removeStatusFromMonster(monster: Monster, effect: ActiveStatusEffect): void {
    // Remove from status list
    const index = monster.statusEffects.indexOf(effect.type);
    if (index !== -1) {
      monster.statusEffects.splice(index, 1);
    }

    // Remove specific effects
    switch (effect.type) {
      case StatusEffectType.Slow:
        monster.isSlowed = false;
        break;

      case StatusEffectType.Stun:
      case StatusEffectType.Freeze:
        monster.isStunned = false;
        break;

      case StatusEffectType.Weakness:
        monster.isWeakened = false;
        monster.weaknessAmount = 0;
        break;
    }
  }

  /**
   * Get the status type
   */
  getStatusType(): StatusEffectType {
    return this.config.statusType;
  }

  /**
   * Get the duration
   */
  getDuration(): number {
    return this.config.duration;
  }
}
