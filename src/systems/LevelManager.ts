/**
 * Level Manager - Handles loading and managing level terrain
 */

import { Grid, CellState } from '../core/Grid';
import { LevelDefinition } from '../types/level';
import { Vector2 } from '../core/math/Vector2';

export class LevelManager {
  private currentLevel: LevelDefinition | null = null;

  constructor(private grid: Grid) {}

  /**
   * Load a level definition into the grid
   * Returns spawn, exit, and checkpoint positions in world coordinates
   */
  loadLevel(levelDef: LevelDefinition): {
    spawnPoint: Vector2;
    exitPoint: Vector2;
    checkpoints: Vector2[];
  } {
    this.currentLevel = levelDef;

    // Clear the grid
    this.grid.clear();

    // Apply terrain tiles
    for (const terrain of levelDef.terrain) {
      this.grid.setCellState(terrain.x, terrain.y, terrain.type);
    }

    // Mark spawn, exit, and checkpoints
    this.grid.setCellState(
      levelDef.spawnGrid.x,
      levelDef.spawnGrid.y,
      CellState.Spawn
    );

    this.grid.setCellState(
      levelDef.exitGrid.x,
      levelDef.exitGrid.y,
      CellState.Exit
    );

    for (const cp of levelDef.checkpointsGrid) {
      this.grid.setCellState(cp.x, cp.y, CellState.Checkpoint);
    }

    // Convert grid coordinates to world coordinates
    return {
      spawnPoint: this.grid.gridToWorld(
        levelDef.spawnGrid.x,
        levelDef.spawnGrid.y
      ),
      exitPoint: this.grid.gridToWorld(
        levelDef.exitGrid.x,
        levelDef.exitGrid.y
      ),
      checkpoints: levelDef.checkpointsGrid.map((cp) =>
        this.grid.gridToWorld(cp.x, cp.y)
      ),
    };
  }

  /**
   * Get the currently loaded level
   */
  getCurrentLevel(): LevelDefinition | null {
    return this.currentLevel;
  }
}
