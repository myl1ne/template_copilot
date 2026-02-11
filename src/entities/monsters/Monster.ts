import { Entity } from '../Entity';
import { Vector2 } from '../../core/math/Vector2';
import { MonsterDefinition, MonsterModifier, MonsterInstance } from '../../types/entities';
import { Resistances, DamageType } from '../../types/game';
import { PathNode } from '../../core/pathfinding/PathNode';

/**
 * Active status effect stored on a monster (compatible with ActiveStatusEffect from StatusEffect.ts)
 */
export interface MonsterActiveEffect {
  type: string;
  potency: number;
  duration: number;
  timeRemaining: number;
  tickRate?: number;
  tickDamage?: number;
  damageType?: DamageType;
  timeSinceLastTick?: number;
}

/**
 * Monster entity class
 */
export class Monster extends Entity {
  public definition: MonsterDefinition;

  // Stats
  public health: number;
  public maxHealth: number;
  public speed: number;
  public armor: number;
  public resistances: Resistances;
  public goldReward: number;

  // Pathfinding
  public path: Vector2[] = [];
  public pathIndex: number = 0;
  public canFly: boolean;

  // Modifiers (for rare monsters)
  public modifiers: MonsterModifier[] = [];

  // State
  public statusEffects: string[] = [];
  public activeEffects: MonsterActiveEffect[] = [];
  public isSlowed: boolean = false;
  public isStunned: boolean = false;
  public isWeakened: boolean = false;
  public weaknessAmount: number = 0;
  public rotation: number = 0;

  // Visual
  public tint?: number;
  public scale: number = 1.0;

  constructor(definition: MonsterDefinition, position: Vector2, path: PathNode[], id?: string) {
    super(position, id);
    this.definition = definition;

    // Initialize stats
    this.health = definition.baseHealth;
    this.maxHealth = definition.baseHealth;
    this.speed = definition.baseSpeed;
    this.armor = definition.baseArmor;
    this.resistances = { ...definition.resistances };
    this.goldReward = definition.goldReward;
    this.canFly = definition.canFly;

    // Convert PathNode array to Vector2 array
    this.path = path.map(node => node.position.clone());

    // Visual
    this.scale = definition.scale || 1.0;
    this.tint = definition.tint;
  }

  /**
   * Update the monster
   */
  update(deltaTime: number): void {
    if (!this.isAlive) return;

    // Don't move if stunned
    if (this.isStunned) return;

    // Move along path (stops automatically when pathIndex >= path.length)
    this.moveAlongPath(deltaTime);

    // Don't mark as dead when reaching exit - Game.ts will handle this
    // and call onMonsterReachedExit() to properly lose a life
  }

  /**
   * Move along the path
   */
  private moveAlongPath(deltaTime: number): void {
    if (this.pathIndex >= this.path.length) {
      return; // Reached end of path
    }

    const target = this.path[this.pathIndex]!;
    const distanceToTarget = this.position.distanceTo(target);

    const direction = new Vector2()
      .copy(target)
      .sub(this.position)
      .normalize();

    // Apply speed (reduce if slowed — 70% reduction)
    const actualSpeed = this.isSlowed ? this.speed * 0.3 : this.speed;
    const distanceToMove = actualSpeed * deltaTime;

    // Check if we would overshoot the target
    if (distanceToMove >= distanceToTarget) {
      // Snap directly to waypoint to prevent overshooting
      this.position.copy(target);
      this.pathIndex++;

      // Update rotation to face movement direction
      if (direction.lengthSq() > 0) {
        this.rotation = Math.atan2(direction.y, direction.x);
      }
    } else {
      // Normal movement
      const movement = direction.multiplyScalar(distanceToMove);
      this.position.add(movement);

      // Update rotation to face movement direction
      if (movement.lengthSq() > 0) {
        this.rotation = Math.atan2(direction.y, direction.x);
      }
    }
  }

  /**
   * Take damage
   */
  takeDamage(amount: number, damageType: DamageType = DamageType.Physical): void {
    // Apply resistance
    const resistance = this.resistances[damageType] || 0;
    const resistMultiplier = 1 - resistance;
    let finalDamage = amount * resistMultiplier;

    // Apply armor (physical damage only)
    if (damageType === DamageType.Physical) {
      const armorReduction = 100 / (100 + this.armor);
      finalDamage *= armorReduction;
    }

    // Apply weakness (increases damage taken)
    if (this.isWeakened) {
      finalDamage *= (1 + this.weaknessAmount);
    }

    this.health -= finalDamage;
    if (this.health <= 0) {
      this.health = 0;
      this.die();
    }
  }

  /**
   * Die
   */
  private die(): void {
    this.isAlive = false;
    // Gold reward is handled by CombatSystem
  }

  /**
   * Check if monster has reached the exit
   */
  hasReachedExit(): boolean {
    const reached = this.pathIndex >= this.path.length;
    if (reached && !this.reachedExitLogged) {
      console.log(`🚪 Monster ${this.id} reached exit! (pathIndex: ${this.pathIndex}/${this.path.length})`);
      this.reachedExitLogged = true;
    }
    return reached;
  }

  private reachedExitLogged = false;

  /**
   * Get progress along path (0 to 1)
   */
  getPathProgress(): number {
    if (this.path.length === 0) return 1;
    return this.pathIndex / this.path.length;
  }

  /**
   * Apply a modifier (for rare monsters)
   */
  applyModifier(modifier: MonsterModifier): void {
    this.modifiers.push(modifier);

    // Apply stat changes
    if (modifier.healthMultiplier) {
      this.maxHealth *= modifier.healthMultiplier;
      this.health = this.maxHealth;
    }

    if (modifier.speedMultiplier) {
      this.speed *= modifier.speedMultiplier;
    }

    if (modifier.goldMultiplier) {
      this.goldReward *= modifier.goldMultiplier;
    }

    // Apply resistance changes
    if (modifier.resistanceChanges) {
      for (const [damageType, change] of Object.entries(modifier.resistanceChanges)) {
        const currentResistance = this.resistances[damageType as keyof Resistances] || 0;
        this.resistances[damageType as keyof Resistances] = Math.min(1, Math.max(-1, currentResistance + change));
      }
    }

    // Visual changes
    if (modifier.tint !== undefined) {
      this.tint = modifier.tint;
    }

    if (modifier.scale !== undefined) {
      this.scale *= modifier.scale;
    }

    // TODO: Grant abilities from modifier
  }

  /**
   * Recalculate path (called when towers destroy blocking towers)
   */
  recalculatePath(newPath: PathNode[]): void {
    // Find closest point on new path to current position
    let closestIndex = 0;
    let closestDist = Infinity;

    for (let i = 0; i < newPath.length; i++) {
      const dist = this.position.distanceTo(newPath[i]!.position);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }

    // Update path starting from closest point
    this.path = newPath.slice(closestIndex).map(node => node.position.clone());
    this.pathIndex = 0;
  }

  /**
   * Get monster instance data (for serialization/store)
   */
  toInstance(): MonsterInstance {
    return {
      id: this.id,
      definitionId: this.definition.id,
      position: { x: this.position.x, y: this.position.y },
      path: this.path.map(p => ({ x: p.x, y: p.y })),
      pathIndex: this.pathIndex,
      canFly: this.canFly,
      health: this.health,
      maxHealth: this.maxHealth,
      speed: this.speed,
      armor: this.armor,
      resistances: { ...this.resistances },
      modifiers: [...this.modifiers],
      statusEffects: [...this.statusEffects],
      isSlowed: this.isSlowed,
      isStunned: this.isStunned,
      isDead: !this.isAlive,
      rotation: this.rotation,
      tint: this.tint,
      scale: this.scale,
    };
  }
}
