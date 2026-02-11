import { Tower } from './Tower';
import { Grid } from '../../core/Grid';
import { Vector2 } from '../../core/math/Vector2';
import { TowerDefinition } from '../../types/entities';
import { AStarPathfinder } from '../../core/pathfinding/AStar';

/**
 * Manager for all towers in the game
 */
export class TowerManager {
  private towers: Map<string, Tower> = new Map();

  constructor(
    private grid: Grid,
    private pathfinder: AStarPathfinder,
    private spawnPoint: Vector2,
    private exitPoint: Vector2,
    private checkpoints: Vector2[]
  ) {}

  /**
   * Add a tower to the game
   */
  addTower(tower: Tower): boolean {
    if (this.towers.has(tower.id)) {
      return false;
    }

    this.towers.set(tower.id, tower);

    // Mark grid footprint as blocked (supports 1x1 and 2x2 towers)
    const size = tower.definition.size || 1;
    this.grid.setBlockedFootprint(tower.gridPosition.x, tower.gridPosition.y, size, true);

    return true;
  }

  /**
   * Remove a tower from the game
   */
  removeTower(towerId: string): boolean {
    const tower = this.towers.get(towerId);
    if (!tower) {
      return false;
    }

    // Unblock grid footprint (supports 1x1 and 2x2 towers)
    const size = tower.definition.size || 1;
    this.grid.setBlockedFootprint(tower.gridPosition.x, tower.gridPosition.y, size, false);

    tower.destroy();
    this.towers.delete(towerId);

    return true;
  }

  /**
   * Check if a grid position is reserved (spawn, exit, or checkpoint)
   */
  private isReservedPosition(gridX: number, gridY: number): boolean {
    const worldPos = this.grid.gridToWorld(gridX, gridY);
    const threshold = this.grid.cellSize * 0.8; // 80% of cell size

    // Check spawn point
    if (this.spawnPoint.distanceTo(worldPos) < threshold) {
      return true;
    }

    // Check exit point
    if (this.exitPoint.distanceTo(worldPos) < threshold) {
      return true;
    }

    // Check all checkpoints
    for (const checkpoint of this.checkpoints) {
      if (checkpoint.distanceTo(worldPos) < threshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if a tower can be placed at a position
   * @param worldX - World X coordinate
   * @param worldY - World Y coordinate
   * @param size - Tower size (1 for 1x1, 2 for 2x2)
   */
  canPlaceTower(worldX: number, worldY: number, size: number = 1): boolean {
    const gridPos = this.grid.worldToGrid(worldX, worldY);

    // Check if all cells in footprint are valid
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        if (!this.grid.isValidCell(gridPos.x + dx, gridPos.y + dy)) {
          return false;
        }
      }
    }

    // Check if footprint is buildable (not terrain)
    if (!this.grid.isBuildableFootprint(gridPos.x, gridPos.y, size)) {
      return false;
    }

    // Check if any cell in footprint is reserved (spawn, exit, checkpoint)
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        if (this.isReservedPosition(gridPos.x + dx, gridPos.y + dy)) {
          return false;
        }
      }
    }

    // Temporarily place tower footprint
    this.grid.setBlockedFootprint(gridPos.x, gridPos.y, size, true);

    // Check if path still exists (only for ground monsters)
    const pathExists = this.pathfinder.validatePath(
      this.spawnPoint,
      this.exitPoint,
      this.checkpoints,
      false // Ground monsters
    );

    // Remove temporary tower footprint
    this.grid.setBlockedFootprint(gridPos.x, gridPos.y, size, false);

    return pathExists;
  }

  /**
   * Place a tower at a position
   */
  placeTower(definition: TowerDefinition, worldX: number, worldY: number): Tower | null {
    const size = definition.size || 1;

    if (!this.canPlaceTower(worldX, worldY, size)) {
      return null;
    }

    const gridPos = this.grid.worldToGrid(worldX, worldY);
    const worldPos = this.grid.gridToWorld(gridPos.x, gridPos.y);

    const tower = new Tower(definition, worldPos, gridPos);

    if (this.addTower(tower)) {
      return tower;
    }

    return null;
  }

  /**
   * Get a tower by ID
   */
  getTower(id: string): Tower | undefined {
    return this.towers.get(id);
  }

  /**
   * Get all towers
   */
  getAllTowers(): Tower[] {
    return Array.from(this.towers.values());
  }

  /**
   * Get towers in a radius
   */
  getTowersInRadius(center: Vector2, radius: number): Tower[] {
    const result: Tower[] = [];

    for (const tower of this.towers.values()) {
      if (tower.position.distanceTo(center) <= radius) {
        result.push(tower);
      }
    }

    return result;
  }

  /**
   * Get tower at grid position (checks if grid position overlaps with tower footprint)
   */
  getTowerAtGrid(gridX: number, gridY: number): Tower | undefined {
    for (const tower of this.towers.values()) {
      const size = tower.definition.size || 1;

      // Check if the grid position is within the tower's footprint
      if (
        gridX >= tower.gridPosition.x &&
        gridX < tower.gridPosition.x + size &&
        gridY >= tower.gridPosition.y &&
        gridY < tower.gridPosition.y + size
      ) {
        return tower;
      }
    }
    return undefined;
  }

  /**
   * Update all towers
   */
  update(deltaTime: number): void {
    for (const tower of this.towers.values()) {
      tower.update(deltaTime);
    }
  }

  /**
   * Clear all towers
   */
  clear(): void {
    for (const tower of this.towers.values()) {
      const size = tower.definition.size || 1;
      this.grid.setBlockedFootprint(tower.gridPosition.x, tower.gridPosition.y, size, false);
      tower.destroy();
    }
    this.towers.clear();
  }

  /**
   * Get tower count
   */
  getCount(): number {
    return this.towers.size;
  }
}
