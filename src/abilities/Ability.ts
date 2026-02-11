/**
 * Base Ability class
 */

import {
  IAbility,
  IAbilityEffect,
  IAbilityTrigger,
  AbilityContext,
  AbilityDefinition,
} from '../types/abilities';

export class Ability implements IAbility {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly cooldown: number;

  protected effects: IAbilityEffect[] = [];
  protected triggers: IAbilityTrigger[] = [];

  private currentCooldown: number = 0;
  private timeSinceLastActivation: number = 0;

  constructor(definition: AbilityDefinition) {
    this.id = definition.id;
    this.name = definition.name;
    this.description = definition.description;
    this.cooldown = definition.cooldown;
  }

  /**
   * Add an effect to this ability
   */
  addEffect(effect: IAbilityEffect): this {
    this.effects.push(effect);
    return this;
  }

  /**
   * Add a trigger to this ability
   */
  addTrigger(trigger: IAbilityTrigger): this {
    this.triggers.push(trigger);
    return this;
  }

  /**
   * Check if the ability can be activated
   */
  canActivate(context: AbilityContext): boolean {
    // Check cooldown
    if (this.currentCooldown > 0) {
      return false;
    }

    // Check if any triggers allow activation
    if (this.triggers.length > 0) {
      return this.triggers.some((trigger) => trigger.shouldTrigger(context));
    }

    // No triggers means manual activation is always allowed (when off cooldown)
    return true;
  }

  /**
   * Activate the ability
   */
  activate(context: AbilityContext): void {
    if (!this.canActivate(context)) {
      return;
    }

    // Apply all effects
    for (const effect of this.effects) {
      effect.apply(context);
    }

    // Start cooldown
    this.currentCooldown = this.cooldown;
    this.timeSinceLastActivation = 0;
  }

  /**
   * Update ability state
   */
  update(deltaTime: number): void {
    // Update cooldown
    if (this.currentCooldown > 0) {
      this.currentCooldown -= deltaTime;
      if (this.currentCooldown < 0) {
        this.currentCooldown = 0;
      }
    }

    this.timeSinceLastActivation += deltaTime;

    // Update triggers
    for (const trigger of this.triggers) {
      trigger.update(deltaTime);
    }
  }

  /**
   * Get remaining cooldown time
   */
  getRemainingCooldown(): number {
    return this.currentCooldown;
  }

  /**
   * Get cooldown progress (0-1)
   */
  getCooldownProgress(): number {
    if (this.cooldown === 0) return 1;
    return 1 - this.currentCooldown / this.cooldown;
  }

  /**
   * Check if ability is ready (off cooldown)
   */
  isReady(): boolean {
    return this.currentCooldown === 0;
  }

  /**
   * Force reset cooldown (for testing or special effects)
   */
  resetCooldown(): void {
    this.currentCooldown = 0;
  }

  /**
   * Get time since last activation
   */
  getTimeSinceLastActivation(): number {
    return this.timeSinceLastActivation;
  }
}
