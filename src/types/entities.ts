import { DamageType, TowerRace, TargetPriority, ProjectileType, Resistances } from './game';
import { VisualDefinition } from '../rendering/procedural/types';

/**
 * Tower definition (data-driven)
 */
export interface TowerDefinition {
  id: string;
  name: string;
  race: TowerRace;
  description: string;
  loreText: string;

  // Base stats
  baseCost: number;
  baseDamage: number;
  baseAttackSpeed: number; // Attacks per second
  baseRange: number; // In world units
  damageType: DamageType;

  // Upgrade scaling
  upgradeCostMultiplier: number; // Cost increases by this factor each level
  damagePerLevel: number;
  rangePerLevel: number;
  attackSpeedPerLevel: number;
  maxLevel: number;

  // Special properties
  abilities?: string[]; // Ability IDs (unlock at certain levels)
  targetPriority: TargetPriority;
  projectileType: ProjectileType;
  projectileSpeed?: number; // Only for non-instant projectiles
  size?: number; // Grid size: 1 for 1x1, 2 for 2x2 (defaults to 1)

  // Visual
  spriteKey: string;
  visual?: VisualDefinition; // Procedural art definition
  attackAnimation?: string;
  soundEffects?: {
    place?: string;
    attack?: string;
    upgrade?: string;
  };
}

/**
 * Monster definition (data-driven)
 */
export interface MonsterDefinition {
  id: string;
  name: string;
  description: string;
  loreText: string;

  // Stats
  baseHealth: number;
  baseSpeed: number; // Units per second
  baseArmor: number;
  goldReward: number;

  // Resistances (-1.0 = takes 2x damage, 0 = normal, 0.5 = takes 50% damage, 1.0 = immune)
  resistances: Resistances;

  // Special properties
  abilities?: string[]; // Ability IDs
  isBoss: boolean;
  canFly: boolean; // Ignores towers, flies straight to checkpoints

  // Visual
  spriteKey: string;
  visual?: VisualDefinition; // Procedural art definition
  visualDescription: string; // For AI asset generation
  animationSpeed?: number;
  scale?: number;
  tint?: number;
}

/**
 * Monster modifier (for rare monsters)
 */
export interface MonsterModifier {
  id: string;
  name: string;
  description: string;
  rarity: 'rare' | 'epic' | 'legendary';

  // Stat multipliers
  healthMultiplier?: number;
  speedMultiplier?: number;
  goldMultiplier: number; // Reward multiplier

  // Resistance changes
  resistanceChanges?: Partial<Resistances>;

  // Special abilities
  grantedAbilities?: string[];

  // Visual changes
  tint?: number; // Color overlay
  scale?: number;
  particles?: string; // Particle effect
}

/**
 * Tower instance (runtime)
 */
export interface TowerInstance {
  id: string; // Unique instance ID
  definitionId: string; // Reference to TowerDefinition
  position: { x: number; y: number };
  gridPosition: { x: number; y: number };
  level: number;

  // Current stats (base + upgrades)
  damage: number;
  attackSpeed: number;
  range: number;
  damageType: DamageType;

  // State
  currentTarget: string | null; // Monster ID
  attackCooldown: number;
  timeSinceLastAttack: number;

  // Abilities
  abilities: string[]; // Unlocked ability IDs

  // Visual
  rotation: number;
}

/**
 * Monster instance (runtime)
 */
export interface MonsterInstance {
  id: string; // Unique instance ID
  definitionId: string; // Reference to MonsterDefinition
  position: { x: number; y: number };

  // Pathfinding
  path: Array<{ x: number; y: number }>; // World coordinates
  pathIndex: number; // Current position in path
  canFly: boolean;

  // Current stats
  health: number;
  maxHealth: number;
  speed: number;
  armor: number;
  resistances: Resistances;

  // Rare modifiers
  modifiers: MonsterModifier[];

  // State
  statusEffects: string[]; // Active status effect IDs
  isSlowed: boolean;
  isStunned: boolean;
  isDead: boolean;

  // Visual
  rotation: number;
  tint?: number;
  scale?: number;
}

/**
 * Projectile instance (runtime)
 */
export interface ProjectileInstance {
  id: string;
  sourceId: string; // Tower ID
  targetId: string; // Monster ID
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  speed: number;
  damage: number;
  damageType: DamageType;
  projectileType: ProjectileType;
  lifetime: number; // Max lifetime in seconds
  age: number; // Current age in seconds
}
