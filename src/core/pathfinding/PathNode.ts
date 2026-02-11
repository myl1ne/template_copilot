import { Vector2 } from '../math/Vector2';

/**
 * Node used in A* pathfinding
 */
export class PathNode {
  public g: number = 0; // Cost from start
  public h: number = 0; // Heuristic to goal
  public f: number = 0; // Total cost (g + h)
  public parent: PathNode | null = null;

  constructor(
    public readonly position: Vector2,
    public readonly gridX: number,
    public readonly gridY: number
  ) {}

  /**
   * Calculate F score (g + h)
   */
  calculateF(): void {
    this.f = this.g + this.h;
  }

  /**
   * Reset node for reuse
   */
  reset(): void {
    this.g = 0;
    this.h = 0;
    this.f = 0;
    this.parent = null;
  }

  /**
   * Create a unique key for this node
   */
  getKey(): string {
    return `${this.gridX},${this.gridY}`;
  }

  /**
   * Check if this node equals another
   */
  equals(other: PathNode): boolean {
    return this.gridX === other.gridX && this.gridY === other.gridY;
  }
}
