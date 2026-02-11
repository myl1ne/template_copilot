import { Vector2 } from '../core/math/Vector2';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base entity class for all game objects
 */
export abstract class Entity {
  public readonly id: string;
  public position: Vector2;
  public isAlive: boolean = true;

  constructor(position: Vector2, id?: string) {
    this.id = id || uuidv4();
    this.position = position.clone();
  }

  /**
   * Update the entity (called each frame)
   */
  abstract update(deltaTime: number): void;

  /**
   * Destroy the entity
   */
  destroy(): void {
    this.isAlive = false;
  }

  /**
   * Get distance to another entity
   */
  distanceTo(other: Entity): number {
    return this.position.distanceTo(other.position);
  }

  /**
   * Get squared distance (faster)
   */
  distanceToSquared(other: Entity): number {
    return this.position.distanceToSquared(other.position);
  }
}
