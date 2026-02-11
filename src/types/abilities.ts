/**
 * Ability system types
 */

import { DamageType } from './game';
import { Monster } from '../entities/monsters/Monster';
import { Tower } from '../entities/towers/Tower';
import { Vector2 } from '../core/math/Vector2';

/**
 * Context passed to abilities when activated
 */
export interface AbilityContext {
  // Entity that owns/activated the ability
  source: Tower | Monster;

  // Primary target (if any)
  target?: Monster | Tower;

  // Position for area abilities
  position?: Vector2;

  // All nearby entities (for area effects)
  nearbyMonsters?: Monster[];
  nearbyTowers?: Tower[];

  // Game state access
  deltaTime?: number;
  currentWave?: number;

  // Combat context
  damageDealt?: number;
  wasCritical?: boolean;

  // Visual effect callbacks
  onAoEEffect?: (x: number, y: number, radius: number, damageType: DamageType) => void;
}

/**
 * Base ability interface
 */
export interface IAbility {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cooldown: number;

  /**
   * Check if the ability can be activated
   */
  canActivate(context: AbilityContext): boolean;

  /**
   * Activate the ability
   */
  activate(context: AbilityContext): void;

  /**
   * Update ability state (for cooldowns, channels, etc.)
   */
  update(deltaTime: number): void;

  /**
   * Get remaining cooldown time
   */
  getRemainingCooldown(): number;
}

/**
 * Ability effect types
 */
export enum AbilityEffectType {
  Damage = 'damage',
  Heal = 'heal',
  Aura = 'aura',
  Status = 'status',
  Shield = 'shield',
  Summon = 'summon',
  Teleport = 'teleport',
  Visual = 'visual',
}

/**
 * Base ability effect interface
 */
export interface IAbilityEffect {
  readonly type: AbilityEffectType;

  /**
   * Apply the effect
   */
  apply(context: AbilityContext): void;
}

/**
 * Damage effect configuration
 */
export interface DamageEffectConfig {
  damage: number;
  damageType: DamageType;
  radius?: number; // Area damage
  maxTargets?: number; // Max targets hit
  isPercentHealth?: boolean; // Damage based on % of max health
}

/**
 * Aura effect configuration
 */
export interface AuraEffectConfig {
  radius: number;
  duration: number;

  // Stat modifiers
  damageMultiplier?: number;
  attackSpeedMultiplier?: number;
  rangeMultiplier?: number;
  movementSpeedMultiplier?: number;

  // Affects
  affectsAllies?: boolean;
  affectsEnemies?: boolean;
}

/**
 * Status effect types
 */
export enum StatusEffectType {
  Slow = 'slow',
  Stun = 'stun',
  Burn = 'burn',
  Freeze = 'freeze',
  Poison = 'poison',
  Weakness = 'weakness',
  Armor = 'armor',
}

/**
 * Status effect configuration
 */
export interface StatusEffectConfig {
  statusType: StatusEffectType;
  duration: number;
  potency: number; // Magnitude of effect (e.g., 0.5 = 50% slow)
  tickRate?: number; // For DoT effects
  tickDamage?: number; // Damage per tick
  damageType?: DamageType; // Damage type for DoT
  radius?: number; // Override radius for periodic AoE status effects
}

/**
 * Shield effect configuration
 */
export interface ShieldEffectConfig {
  amount: number; // Shield HP
  duration: number;
  absorbTypes?: DamageType[]; // Only absorb specific damage types
}

/**
 * Summon effect configuration
 */
export interface SummonEffectConfig {
  monsterId: string;
  count: number;
  duration: number; // How long summons last
  position?: Vector2; // Spawn position (defaults to ability source)
}

/**
 * Ability trigger types
 */
export enum AbilityTriggerType {
  Periodic = 'periodic',
  OnHit = 'on_hit',
  OnKill = 'on_kill',
  OnDeath = 'on_death',
  OnDamaged = 'on_damaged',
  OnHealthThreshold = 'on_health_threshold',
  OnWaveStart = 'on_wave_start',
  OnWaveEnd = 'on_wave_end',
}

/**
 * Base ability trigger interface
 */
export interface IAbilityTrigger {
  readonly type: AbilityTriggerType;

  /**
   * Check if the trigger condition is met
   */
  shouldTrigger(context: AbilityContext): boolean;

  /**
   * Update trigger state
   */
  update(deltaTime: number): void;
}

/**
 * Periodic trigger configuration
 */
export interface PeriodicTriggerConfig {
  interval: number; // Seconds between triggers
}

/**
 * On-hit trigger configuration
 */
export interface OnHitTriggerConfig {
  chance: number; // 0-1 probability
  requiresCritical?: boolean;
}

/**
 * Health threshold trigger configuration
 */
export interface HealthThresholdTriggerConfig {
  threshold: number; // 0-1, e.g., 0.5 = 50% health
  triggerOnce?: boolean; // Only trigger once when crossing threshold
}

/**
 * Ability definition (data-driven)
 */
export interface AbilityDefinition {
  id: string;
  name: string;
  description: string;
  cooldown: number;

  // Effects applied when ability activates
  effects: AbilityEffectConfig[];

  // Triggers that activate this ability
  triggers?: AbilityTriggerConfig[];

  // Visual
  icon?: string;
  animationId?: string;
  particleEffectId?: string;
}

/**
 * Union type for all effect configs
 */
export type AbilityEffectConfig =
  | { type: AbilityEffectType.Damage; config: DamageEffectConfig }
  | { type: AbilityEffectType.Aura; config: AuraEffectConfig }
  | { type: AbilityEffectType.Status; config: StatusEffectConfig }
  | { type: AbilityEffectType.Shield; config: ShieldEffectConfig }
  | { type: AbilityEffectType.Summon; config: SummonEffectConfig };

/**
 * Union type for all trigger configs
 */
export type AbilityTriggerConfig =
  | { type: AbilityTriggerType.Periodic; config: PeriodicTriggerConfig }
  | { type: AbilityTriggerType.OnHit; config: OnHitTriggerConfig }
  | { type: AbilityTriggerType.OnHealthThreshold; config: HealthThresholdTriggerConfig };
