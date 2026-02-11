/**
 * Aura effect for abilities (buffs/debuffs in an area)
 */

import {
  IAbilityEffect,
  AbilityEffectType,
  AbilityContext,
  AuraEffectConfig,
} from '../../types/abilities';
import { Monster } from '../../entities/monsters/Monster';
import { Tower } from '../../entities/towers/Tower';

/**
 * Active aura instance
 */
export interface ActiveAura {
  sourceId: string;
  config: AuraEffectConfig;
  timeRemaining: number;
  affectedEntities: Set<string>;
}

export class AuraEffect implements IAbilityEffect {
  public readonly type = AbilityEffectType.Aura;

  constructor(private config: AuraEffectConfig) {}

  apply(context: AbilityContext): void {
    const { radius, duration, affectsAllies, affectsEnemies } = this.config;

    // Create active aura
    const aura: ActiveAura = {
      sourceId: context.source.id,
      config: this.config,
      timeRemaining: duration,
      affectedEntities: new Set(),
    };

    // Find entities in radius
    const sourcePos = context.source.position;

    // Affect monsters if configured
    if (affectsEnemies && context.nearbyMonsters) {
      for (const monster of context.nearbyMonsters) {
        const distance = monster.position.distanceTo(sourcePos);
        if (distance <= radius) {
          this.applyAuraToMonster(monster, aura);
          aura.affectedEntities.add(monster.id);
        }
      }
    }

    // Affect towers if configured
    if (affectsAllies && context.nearbyTowers) {
      for (const tower of context.nearbyTowers) {
        const distance = tower.position.distanceTo(sourcePos);
        if (distance <= radius) {
          this.applyAuraToTower(tower, aura);
          aura.affectedEntities.add(tower.id);
        }
      }
    }

    // Store active aura for duration tracking
    // This would be handled by an AuraSystem
  }

  /**
   * Apply aura effects to a monster
   */
  private applyAuraToMonster(monster: Monster, aura: ActiveAura): void {
    const config = aura.config;

    // Apply movement speed changes
    if (config.movementSpeedMultiplier !== undefined) {
      monster.speed *= config.movementSpeedMultiplier;
    }

    // TODO: Apply other buffs/debuffs
    // These would be stored as temporary modifiers that get removed when aura expires
  }

  /**
   * Apply aura effects to a tower
   */
  private applyAuraToTower(tower: Tower, aura: ActiveAura): void {
    const config = aura.config;

    // Apply damage multiplier
    if (config.damageMultiplier !== undefined) {
      tower.damage *= config.damageMultiplier;
    }

    // Apply attack speed multiplier
    if (config.attackSpeedMultiplier !== undefined) {
      tower.attackSpeed *= config.attackSpeedMultiplier;
    }

    // Apply range multiplier
    if (config.rangeMultiplier !== undefined) {
      tower.range *= config.rangeMultiplier;
    }

    // TODO: Store these as temporary modifiers that get removed when aura expires
  }

  /**
   * Update active aura (called by AuraSystem)
   */
  static updateAura(
    aura: ActiveAura,
    deltaTime: number,
    allMonsters: Monster[],
    allTowers: Tower[]
  ): boolean {
    aura.timeRemaining -= deltaTime;

    // Check if aura expired
    if (aura.timeRemaining <= 0) {
      // Remove aura effects from all affected entities
      AuraEffect.removeAuraEffects(aura, allMonsters, allTowers);
      return false; // Aura should be removed
    }

    // TODO: Handle dynamic auras that check for entities entering/leaving range

    return true; // Aura continues
  }

  /**
   * Remove aura effects from entities
   */
  private static removeAuraEffects(
    aura: ActiveAura,
    allMonsters: Monster[],
    allTowers: Tower[]
  ): void {
    const config = aura.config;

    // Remove from monsters
    for (const monster of allMonsters) {
      if (aura.affectedEntities.has(monster.id)) {
        // Reverse the effects
        if (config.movementSpeedMultiplier !== undefined) {
          monster.speed /= config.movementSpeedMultiplier;
        }
      }
    }

    // Remove from towers
    for (const tower of allTowers) {
      if (aura.affectedEntities.has(tower.id)) {
        // Reverse the effects
        if (config.damageMultiplier !== undefined) {
          tower.damage /= config.damageMultiplier;
        }
        if (config.attackSpeedMultiplier !== undefined) {
          tower.attackSpeed /= config.attackSpeedMultiplier;
        }
        if (config.rangeMultiplier !== undefined) {
          tower.range /= config.rangeMultiplier;
        }
      }
    }
  }

  /**
   * Get the radius
   */
  getRadius(): number {
    return this.config.radius;
  }

  /**
   * Get the duration
   */
  getDuration(): number {
    return this.config.duration;
  }
}
