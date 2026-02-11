import { Entity } from '../Entity';
import { Vector2 } from '../../core/math/Vector2';
import { Monster } from '../monsters/Monster';
import { Tower } from '../towers/Tower';
import { DamageType, ProjectileType } from '../../types/game';
import { ProjectileInstance } from '../../types/entities';

/**
 * Projectile entity class
 */
export class Projectile extends Entity {
  public source: Tower;
  public target: Monster;
  public velocity: Vector2;
  public speed: number;
  public damage: number;
  public damageType: DamageType;
  public projectileType: ProjectileType;
  public lifetime: number = 5; // Max lifetime in seconds
  public age: number = 0;
  public hasHit: boolean = false;

  constructor(
    source: Tower,
    target: Monster,
    damage: number,
    damageType: DamageType,
    speed: number,
    projectileType: ProjectileType,
    id?: string
  ) {
    super(source.position.clone(), id);

    this.source = source;
    this.target = target;
    this.damage = damage;
    this.damageType = damageType;
    this.speed = speed;
    this.projectileType = projectileType;

    // Calculate initial velocity
    this.velocity = new Vector2()
      .copy(target.position)
      .sub(this.position)
      .normalize()
      .multiplyScalar(speed);
  }

  /**
   * Update the projectile
   */
  update(deltaTime: number): void {
    if (!this.isAlive || this.hasHit) return;

    this.age += deltaTime;

    // Check lifetime
    if (this.age >= this.lifetime) {
      this.destroy();
      return;
    }

    // Update velocity to track target (homing behavior)
    if (this.target.isAlive) {
      const direction = new Vector2()
        .copy(this.target.position)
        .sub(this.position)
        .normalize();

      this.velocity = direction.multiplyScalar(this.speed);
    }

    // Move projectile
    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.position.add(movement);

    // Check if hit target
    if (this.target.isAlive && this.checkHit()) {
      this.hasHit = true;
      // Damage is applied by CombatSystem
    }
  }

  /**
   * Check if projectile has hit its target
   */
  private checkHit(): boolean {
    const hitRadius = 10; // Collision radius
    const distSq = this.position.distanceToSquared(this.target.position);
    return distSq <= hitRadius * hitRadius;
  }

  /**
   * Get projectile instance data
   */
  toInstance(): ProjectileInstance {
    return {
      id: this.id,
      sourceId: this.source.id,
      targetId: this.target.id,
      position: { x: this.position.x, y: this.position.y },
      velocity: { x: this.velocity.x, y: this.velocity.y },
      speed: this.speed,
      damage: this.damage,
      damageType: this.damageType,
      projectileType: this.projectileType,
      lifetime: this.lifetime,
      age: this.age,
    };
  }
}
