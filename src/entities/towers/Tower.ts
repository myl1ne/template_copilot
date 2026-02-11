import { Entity } from '../Entity';
import { Vector2 } from '../../core/math/Vector2';
import { TowerDefinition, TowerInstance } from '../../types/entities';
import { DamageType } from '../../types/game';
import { BuffType } from '../../roguelike/types';

/**
 * Tower entity class
 */
export class Tower extends Entity {
  public definition: TowerDefinition;
  public level: number = 1;
  public gridPosition: Vector2;

  // Stats
  public damage: number;
  public attackSpeed: number;
  public range: number;
  public damageType: DamageType;

  // State
  public currentTarget: Entity | null = null;
  public timeSinceLastAttack: number = 0;
  public rotation: number = 0;

  // Abilities
  public abilities: string[] = [];

  constructor(definition: TowerDefinition, position: Vector2, gridPosition: Vector2, id?: string) {
    super(position, id);
    this.definition = definition;
    this.gridPosition = gridPosition;

    // Initialize stats from definition
    this.damage = definition.baseDamage;
    this.attackSpeed = definition.baseAttackSpeed;
    this.range = definition.baseRange;
    this.damageType = definition.damageType;
  }

  /**
   * Update the tower
   */
  update(deltaTime: number): void {
    if (!this.isAlive) return;

    // Update attack cooldown
    this.timeSinceLastAttack += deltaTime;

    // Update rotation to face target
    if (this.currentTarget && this.currentTarget.isAlive) {
      const angle = this.position.angleTo(this.currentTarget.position);
      this.rotation = angle;
    }
  }

  /**
   * Check if tower can attack (cooldown ready)
   */
  canAttack(): boolean {
    const attackInterval = 1 / this.getEffectiveAttackSpeed();
    return this.timeSinceLastAttack >= attackInterval;
  }

  /**
   * Attack the current target
   */
  attack(): void {
    if (!this.canAttack() || !this.currentTarget) return;

    this.timeSinceLastAttack = 0;
    // Actual damage is handled by CombatSystem
  }

  /**
   * Upgrade the tower
   */
  upgrade(): boolean {
    if (this.level >= this.definition.maxLevel) {
      return false;
    }

    this.level++;

    // Update stats
    this.damage = this.definition.baseDamage + (this.definition.damagePerLevel * this.level);
    this.range = this.definition.baseRange + (this.definition.rangePerLevel * this.level);
    this.attackSpeed = this.definition.baseAttackSpeed + (this.definition.attackSpeedPerLevel * this.level);

    // Unlock abilities at milestones
    if (this.definition.abilities) {
      if (this.level === 5 && this.definition.abilities[0]) {
        this.abilities.push(this.definition.abilities[0]);
      }
      if (this.level === 10 && this.definition.abilities[1]) {
        this.abilities.push(this.definition.abilities[1]);
      }
    }

    return true;
  }

  /**
   * Calculate upgrade cost
   */
  getUpgradeCost(): number {
    if (this.level >= this.definition.maxLevel) {
      return Infinity;
    }
    return Math.floor(
      this.definition.baseCost * Math.pow(this.definition.upgradeCostMultiplier, this.level)
    );
  }

  /**
   * Check if a target is in range
   */
  isInRange(target: Entity): boolean {
    return this.distanceToSquared(target) <= this.getEffectiveRange() * this.getEffectiveRange();
  }

  /**
   * Get effective damage (base damage + buffs)
   */
  getEffectiveDamage(): number {
    const runManager = (window as any).runManager;
    if (!runManager) return this.damage;

    const buffMultiplier = runManager.getBuffMultiplier(BuffType.DamageBoost);
    return this.damage * buffMultiplier;
  }

  /**
   * Get effective range (base range + buffs)
   */
  getEffectiveRange(): number {
    const runManager = (window as any).runManager;
    if (!runManager) return this.range;

    const buffMultiplier = runManager.getBuffMultiplier(BuffType.RangeBoost);
    return this.range * buffMultiplier;
  }

  /**
   * Get effective attack speed (base attack speed + buffs)
   */
  getEffectiveAttackSpeed(): number {
    const runManager = (window as any).runManager;
    if (!runManager) return this.attackSpeed;

    const buffMultiplier = runManager.getBuffMultiplier(BuffType.AttackSpeedBoost);
    return this.attackSpeed * buffMultiplier;
  }

  /**
   * Get tower instance data (for serialization/store)
   */
  toInstance(): TowerInstance {
    return {
      id: this.id,
      definitionId: this.definition.id,
      position: { x: this.position.x, y: this.position.y },
      gridPosition: { x: this.gridPosition.x, y: this.gridPosition.y },
      level: this.level,
      damage: this.damage,
      attackSpeed: this.attackSpeed,
      range: this.range,
      damageType: this.damageType,
      currentTarget: this.currentTarget?.id || null,
      attackCooldown: 1 / this.attackSpeed,
      timeSinceLastAttack: this.timeSinceLastAttack,
      abilities: [...this.abilities],
      rotation: this.rotation,
    };
  }
}
