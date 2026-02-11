/**
 * System for managing and executing abilities
 */

import { Ability } from '../abilities/Ability';
import { AbilityContext } from '../types/abilities';
import { ActiveStatusEffect, StatusEffect } from '../abilities/effects/StatusEffect';
import { ActiveAura, AuraEffect } from '../abilities/effects/AuraEffect';
import { ActiveShield, ShieldEffect } from '../abilities/effects/ShieldEffect';
import { Monster } from '../entities/monsters/Monster';
import { Tower } from '../entities/towers/Tower';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { TowerManager } from '../entities/towers/TowerManager';

/**
 * Ability system manages all active abilities, auras, status effects, and shields
 */
export class AbilitySystem {
  // Active effects tracking
  private activeStatusEffects: Map<string, ActiveStatusEffect[]> = new Map();
  private activeAuras: ActiveAura[] = [];
  private activeShields: Map<string, ActiveShield[]> = new Map();

  // Ability instances (owned by towers/monsters)
  private entityAbilities: Map<string, Ability[]> = new Map();

  // Visual effect callbacks
  public onAoEEffect?: (x: number, y: number, radius: number, damageType: any) => void;

  constructor(
    private monsterManager: MonsterManager,
    private towerManager: TowerManager
  ) {}

  /**
   * Register abilities for an entity
   */
  registerAbilities(entityId: string, abilities: Ability[]): void {
    this.entityAbilities.set(entityId, abilities);
  }

  /**
   * Get abilities for an entity
   */
  getAbilities(entityId: string): Ability[] {
    return this.entityAbilities.get(entityId) || [];
  }

  /**
   * Remove abilities for an entity (when entity dies/is removed)
   */
  unregisterAbilities(entityId: string): void {
    this.entityAbilities.delete(entityId);
    this.activeStatusEffects.delete(entityId);
    this.activeShields.delete(entityId);
  }

  /**
   * Update all abilities and active effects
   */
  update(deltaTime: number): void {
    // Update all entity abilities
    for (const [entityId, abilities] of this.entityAbilities) {
      for (const ability of abilities) {
        ability.update(deltaTime);

        // Check if ability should auto-trigger
        const entity = this.getEntity(entityId);
        if (entity && ability.isReady()) {
          const context = this.createContext(entity);
          if (ability.canActivate(context)) {
            ability.activate(context);
          }
        }
      }
    }

    // Update active status effects
    this.updateStatusEffects(deltaTime);

    // Update active auras
    this.updateAuras(deltaTime);

    // Update active shields
    this.updateShields(deltaTime);
  }

  /**
   * Activate an ability manually
   */
  activateAbility(
    entityId: string,
    abilityIndex: number,
    context?: Partial<AbilityContext>
  ): boolean {
    const abilities = this.getAbilities(entityId);
    const ability = abilities[abilityIndex];

    if (!ability) {
      return false;
    }

    const entity = this.getEntity(entityId);
    if (!entity) {
      return false;
    }

    const fullContext = this.createContext(entity, context);

    if (ability.canActivate(fullContext)) {
      ability.activate(fullContext);
      return true;
    }

    return false;
  }

  /**
   * Create an ability context for an entity
   */
  private createContext(
    entity: Monster | Tower,
    partial?: Partial<AbilityContext>
  ): AbilityContext {
    const context: AbilityContext = {
      source: entity,
      nearbyMonsters: this.monsterManager.getAllMonsters(),
      nearbyTowers: this.towerManager.getAllTowers(),
      onAoEEffect: this.onAoEEffect,
      ...partial,
    };

    return context;
  }

  /**
   * Get entity by ID
   */
  private getEntity(entityId: string): Monster | Tower | null {
    // Try monster first
    const monster = this.monsterManager.getMonster(entityId);
    if (monster) return monster;

    // Try tower
    const tower = this.towerManager.getTower(entityId);
    if (tower) return tower;

    return null;
  }

  /**
   * Add a status effect to an entity
   */
  addStatusEffect(entityId: string, effect: ActiveStatusEffect): void {
    if (!this.activeStatusEffects.has(entityId)) {
      this.activeStatusEffects.set(entityId, []);
    }
    this.activeStatusEffects.get(entityId)!.push(effect);
  }

  /**
   * Update all status effects
   */
  private updateStatusEffects(deltaTime: number): void {
    // Process active effects stored directly on monsters
    const monsters = this.monsterManager.getAllMonsters();
    for (const monster of monsters) {
      if (monster.activeEffects.length > 0) {
        // Process DoT ticks and duration expiry
        for (let i = monster.activeEffects.length - 1; i >= 0; i--) {
          const effect = monster.activeEffects[i]!;
          effect.timeRemaining -= deltaTime;

          // Handle DoT ticks (Burn, Poison)
          if (effect.tickRate && effect.tickDamage && effect.damageType !== undefined) {
            effect.timeSinceLastTick = (effect.timeSinceLastTick || 0) + deltaTime;
            while (effect.timeSinceLastTick >= effect.tickRate) {
              effect.timeSinceLastTick -= effect.tickRate;
              monster.takeDamage(effect.tickDamage, effect.damageType);
            }
          }

          // Remove expired effects
          if (effect.timeRemaining <= 0) {
            // Remove flags
            if (effect.type === 'slow') monster.isSlowed = false;
            if (effect.type === 'stun' || effect.type === 'freeze') monster.isStunned = false;
            if (effect.type === 'weakness') { monster.isWeakened = false; monster.weaknessAmount = 0; }

            const idx = monster.statusEffects.indexOf(effect.type);
            if (idx !== -1) monster.statusEffects.splice(idx, 1);

            monster.activeEffects.splice(i, 1);
          }
        }
      }
    }

    // Also process effects in the legacy Map
    for (const [entityId, effects] of this.activeStatusEffects) {
      const monster = this.monsterManager.getMonster(entityId);
      if (!monster) {
        this.activeStatusEffects.delete(entityId);
        continue;
      }

      StatusEffect.updateStatusEffects(monster, deltaTime, effects);

      if (effects.length === 0) {
        this.activeStatusEffects.delete(entityId);
      }
    }
  }

  /**
   * Add an aura
   */
  addAura(aura: ActiveAura): void {
    this.activeAuras.push(aura);
  }

  /**
   * Update all auras
   */
  private updateAuras(deltaTime: number): void {
    const monsters = this.monsterManager.getAllMonsters();
    const towers = this.towerManager.getAllTowers();

    for (let i = this.activeAuras.length - 1; i >= 0; i--) {
      const aura = this.activeAuras[i]!;
      const shouldContinue = AuraEffect.updateAura(aura, deltaTime, monsters, towers);

      if (!shouldContinue) {
        this.activeAuras.splice(i, 1);
      }
    }
  }

  /**
   * Add a shield to an entity
   */
  addShield(entityId: string, shield: ActiveShield): void {
    if (!this.activeShields.has(entityId)) {
      this.activeShields.set(entityId, []);
    }
    this.activeShields.get(entityId)!.push(shield);
  }

  /**
   * Update all shields
   */
  private updateShields(deltaTime: number): void {
    for (const [entityId, shields] of this.activeShields) {
      for (let i = shields.length - 1; i >= 0; i--) {
        const shield = shields[i]!;
        const shouldContinue = ShieldEffect.updateShield(shield, deltaTime);

        if (!shouldContinue) {
          shields.splice(i, 1);
        }
      }

      // Remove empty shield arrays
      if (shields.length === 0) {
        this.activeShields.delete(entityId);
      }
    }
  }

  /**
   * Get shields for an entity
   */
  getShields(entityId: string): ActiveShield[] {
    return this.activeShields.get(entityId) || [];
  }

  /**
   * Absorb damage with shields (called by combat system)
   * Returns remaining damage after shield absorption
   */
  absorbDamageWithShields(
    entityId: string,
    damage: number,
    damageType: import('../types/game').DamageType
  ): number {
    const shields = this.getShields(entityId);
    if (shields.length === 0) {
      return damage;
    }

    let remainingDamage = damage;

    // Apply shields in order (FIFO)
    for (const shield of shields) {
      if (remainingDamage <= 0) break;
      remainingDamage = ShieldEffect.absorbDamage(shield, remainingDamage, damageType);
    }

    return remainingDamage;
  }

  /**
   * Check if entity has any shields
   */
  hasShields(entityId: string): boolean {
    const shields = this.getShields(entityId);
    return shields.length > 0;
  }

  /**
   * Get total shield amount for an entity
   */
  getTotalShieldAmount(entityId: string): number {
    const shields = this.getShields(entityId);
    return shields.reduce((total, shield) => total + shield.amount, 0);
  }

  /**
   * Clear all abilities and effects (for game reset)
   */
  clear(): void {
    this.entityAbilities.clear();
    this.activeStatusEffects.clear();
    this.activeAuras = []; // Reset array
    this.activeShields.clear();
  }
}
