import { Vector2 } from './math/Vector2';

/**
 * Grid cell state
 *
 * Terrain Properties Reference:
 * ┌─────────────┬───────────┬────────────┬─────────────┐
 * │ Terrain     │ Walkable  │ Buildable  │ Flyable     │
 * ├─────────────┼───────────┼────────────┼─────────────┤
 * │ Empty       │ ✓         │ ✓          │ ✓           │
 * │ Path        │ ✓         │ ✓          │ ✓           │
 * │ Checkpoint  │ ✓         │ ✗          │ ✓           │
 * │ Spawn       │ ✓         │ ✗          │ ✓           │
 * │ Exit        │ ✓         │ ✗          │ ✓           │
 * │ Blocked     │ ✗         │ ✗          │ ✗           │
 * │ Water       │ ✗         │ ✗          │ ✓           │
 * │ Lava        │ ✗         │ ✗          │ ✓           │
 * │ Rock        │ ✗         │ ✗          │ ✓           │
 * │ Forest      │ ✗         │ ✗          │ ✓           │
 * └─────────────┴───────────┴────────────┴─────────────┘
 */
export enum CellState {
  Empty = 0,
  Blocked = 1,    // Tower placed here
  Path = 2,       // Monster path
  Checkpoint = 3, // Path checkpoint

  // Terrain types
  Water = 4,      // Bodies of water (unwalkable, unbuildable)
  Rock = 5,       // Rocky outcrops (unwalkable, unbuildable)
  Spawn = 6,      // Spawn point (walkable, unbuildable)
  Exit = 7,       // Exit point (walkable, unbuildable)
  Forest = 8,     // Dense forests (unwalkable, unbuildable)
  Lava = 9,       // Lava flows (unwalkable, unbuildable)
}

/**
 * Grid system for spatial organization and pathfinding
 */
export class Grid {
  private cells: CellState[][];
  private version: number = 0; // Incremented when grid changes (for cache invalidation)

  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly cellSize: number
  ) {
    // Initialize empty grid
    this.cells = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => CellState.Empty)
    );
  }

  /**
   * Get the current grid version (for cache invalidation)
   */
  getVersion(): number {
    return this.version;
  }

  /**
   * Get cell state at grid coordinates
   */
  getCellState(gridX: number, gridY: number): CellState | null {
    if (!this.isValidCell(gridX, gridY)) {
      return null;
    }
    return this.cells[gridY]![gridX]!;
  }

  /**
   * Set cell state at grid coordinates
   */
  setCellState(gridX: number, gridY: number, state: CellState): void {
    if (!this.isValidCell(gridX, gridY)) {
      return;
    }
    this.cells[gridY]![gridX] = state;
    this.version++;
  }

  /**
   * Check if a cell is blocked (has a tower)
   */
  isBlocked(gridX: number, gridY: number): boolean {
    return this.getCellState(gridX, gridY) === CellState.Blocked;
  }

  /**
   * Set a cell as blocked
   */
  setBlocked(gridX: number, gridY: number, blocked: boolean): void {
    this.setCellState(gridX, gridY, blocked ? CellState.Blocked : CellState.Empty);
  }

  /**
   * Check if grid coordinates are valid
   */
  isValidCell(gridX: number, gridY: number): boolean {
    return gridX >= 0 && gridX < this.width && gridY >= 0 && gridY < this.height;
  }

  /**
   * Convert world coordinates to grid coordinates
   */
  worldToGrid(worldX: number, worldY: number): Vector2 {
    return new Vector2(
      Math.floor(worldX / this.cellSize),
      Math.floor(worldY / this.cellSize)
    );
  }

  /**
   * Convert grid coordinates to world coordinates (center of cell)
   */
  gridToWorld(gridX: number, gridY: number): Vector2 {
    return new Vector2(
      gridX * this.cellSize + this.cellSize / 2,
      gridY * this.cellSize + this.cellSize / 2
    );
  }

  /**
   * Get the cell at world coordinates
   */
  getCellAtWorld(worldX: number, worldY: number): CellState | null {
    const grid = this.worldToGrid(worldX, worldY);
    return this.getCellState(grid.x, grid.y);
  }

  /**
   * Check if world coordinates are blocked
   */
  isBlockedAtWorld(worldX: number, worldY: number): boolean {
    const grid = this.worldToGrid(worldX, worldY);
    return this.isBlocked(grid.x, grid.y);
  }

  /**
   * Check if a cell is buildable (can place tower)
   */
  isBuildable(gridX: number, gridY: number): boolean {
    const state = this.getCellState(gridX, gridY);
    if (state === null) return false;
    // Only Empty and Path cells are buildable
    return state === CellState.Empty || state === CellState.Path;
  }

  /**
   * Check if a footprint (size x size) is buildable
   * @param gridX - Top-left grid X coordinate
   * @param gridY - Top-left grid Y coordinate
   * @param size - Size of the footprint (1 for 1x1, 2 for 2x2)
   */
  isBuildableFootprint(gridX: number, gridY: number, size: number): boolean {
    // Check all cells in the footprint
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        if (!this.isBuildable(gridX + dx, gridY + dy)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Block/unblock a footprint (size x size)
   * @param gridX - Top-left grid X coordinate
   * @param gridY - Top-left grid Y coordinate
   * @param size - Size of the footprint (1 for 1x1, 2 for 2x2)
   * @param blocked - Whether to block or unblock
   */
  setBlockedFootprint(gridX: number, gridY: number, size: number, blocked: boolean): void {
    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        this.setBlocked(gridX + dx, gridY + dy, blocked);
      }
    }
  }

  /**
   * Check if a cell has unbuildable terrain
   */
  isUnbuildableTerrain(gridX: number, gridY: number): boolean {
    const state = this.getCellState(gridX, gridY);
    if (state === null) return false;
    return state === CellState.Water ||
           state === CellState.Rock ||
           state === CellState.Spawn ||
           state === CellState.Exit ||
           state === CellState.Forest ||
           state === CellState.Lava;
  }

  /**
   * Check if a cell is walkable for ground units
   * Ground monsters cannot walk through water, lava, rocks, or dense forests
   */
  isWalkable(gridX: number, gridY: number): boolean {
    const state = this.getCellState(gridX, gridY);
    if (state === null) return false;

    // Can walk on: Empty, Path, Spawn, Exit, Checkpoint
    // Cannot walk on: Blocked (towers), Water, Lava, Rock, Forest
    return state === CellState.Empty ||
           state === CellState.Path ||
           state === CellState.Spawn ||
           state === CellState.Exit ||
           state === CellState.Checkpoint;
  }

  /**
   * Check if a cell blocks flying units
   * Flying monsters can fly over terrain but not towers
   */
  isWalkableForFlying(gridX: number, gridY: number): boolean {
    const state = this.getCellState(gridX, gridY);
    if (state === null) return false;

    // Flying units can fly over terrain obstacles but not towers
    return state !== CellState.Blocked;
  }

  /**
   * Get all neighbors of a cell (4-directional)
   */
  getNeighbors4(gridX: number, gridY: number): Vector2[] {
    const neighbors: Vector2[] = [];
    const directions = [
      [0, -1], // Up
      [1, 0],  // Right
      [0, 1],  // Down
      [-1, 0], // Left
    ];

    for (const [dx, dy] of directions) {
      const nx = gridX + dx!;
      const ny = gridY + dy!;
      if (this.isValidCell(nx, ny)) {
        neighbors.push(new Vector2(nx, ny));
      }
    }

    return neighbors;
  }

  /**
   * Get all neighbors of a cell (8-directional)
   */
  getNeighbors8(gridX: number, gridY: number): Vector2[] {
    const neighbors: Vector2[] = [];
    const directions = [
      [-1, -1], [0, -1], [1, -1],
      [-1, 0],           [1, 0],
      [-1, 1],  [0, 1],  [1, 1],
    ];

    for (const [dx, dy] of directions) {
      const nx = gridX + dx!;
      const ny = gridY + dy!;
      if (this.isValidCell(nx, ny)) {
        neighbors.push(new Vector2(nx, ny));
      }
    }

    return neighbors;
  }

  /**
   * Get all cells in a radius (world coordinates)
   */
  getCellsInRadius(centerX: number, centerY: number, radius: number): Vector2[] {
    const cells: Vector2[] = [];
    const centerGrid = this.worldToGrid(centerX, centerY);
    const radiusInCells = Math.ceil(radius / this.cellSize);

    for (let dy = -radiusInCells; dy <= radiusInCells; dy++) {
      for (let dx = -radiusInCells; dx <= radiusInCells; dx++) {
        const gx = centerGrid.x + dx;
        const gy = centerGrid.y + dy;

        if (!this.isValidCell(gx, gy)) continue;

        const worldPos = this.gridToWorld(gx, gy);
        const dist = Math.sqrt(
          Math.pow(worldPos.x - centerX, 2) + Math.pow(worldPos.y - centerY, 2)
        );

        if (dist <= radius) {
          cells.push(new Vector2(gx, gy));
        }
      }
    }

    return cells;
  }

  /**
   * Clear all cells
   */
  clear(): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.cells[y]![x] = CellState.Empty;
      }
    }
    this.version++;
  }

  /**
   * Get a copy of the grid state
   */
  getGridCopy(): CellState[][] {
    return this.cells.map(row => [...row]);
  }

  /**
   * Debug: Print grid to console
   */
  debug(): void {
    console.log('Grid:');
    for (let y = 0; y < this.height; y++) {
      const row = this.cells[y]!.map(cell => {
        switch (cell) {
          case CellState.Empty: return '.';
          case CellState.Blocked: return 'X';
          case CellState.Path: return 'o';
          case CellState.Checkpoint: return 'C';
          default: return '?';
        }
      }).join(' ');
      console.log(row);
    }
  }
}
