/**
 * Grid System Tests
 *
 * Tests for the Grid class that manages the game board
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Grid, CellState } from './Grid';

describe('Grid', () => {
  let grid: Grid;
  const width = 10;
  const height = 10;
  const cellSize = 32;

  beforeEach(() => {
    grid = new Grid(width, height, cellSize);
  });

  describe('initialization', () => {
    it('should create a grid with correct dimensions', () => {
      expect(grid.width).toBe(width);
      expect(grid.height).toBe(height);
      expect(grid.cellSize).toBe(cellSize);
    });

    it('should initialize all cells as Empty', () => {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          expect(grid.getCellState(x, y)).toBe(CellState.Empty);
        }
      }
    });

    it('should start with version 0', () => {
      expect(grid.getVersion()).toBe(0);
    });
  });

  describe('coordinate conversion', () => {
    it('should convert world coordinates to grid coordinates', () => {
      const worldPos = { x: 64, y: 96 }; // Cell (2, 3) with cellSize 32
      const gridPos = grid.worldToGrid(worldPos.x, worldPos.y);

      expect(gridPos.x).toBe(2);
      expect(gridPos.y).toBe(3);
    });

    it('should convert grid coordinates to world coordinates', () => {
      const gridPos = { x: 3, y: 4 };
      const worldPos = grid.gridToWorld(gridPos.x, gridPos.y);

      // Should return center of cell
      expect(worldPos.x).toBe(3 * cellSize + cellSize / 2);
      expect(worldPos.y).toBe(4 * cellSize + cellSize / 2);
    });

    it('should handle edge coordinates correctly', () => {
      const corner = grid.worldToGrid(0, 0);
      expect(corner.x).toBe(0);
      expect(corner.y).toBe(0);

      const farCorner = grid.worldToGrid(width * cellSize - 1, height * cellSize - 1);
      expect(farCorner.x).toBe(width - 1);
      expect(farCorner.y).toBe(height - 1);
    });
  });

  describe('cell state management', () => {
    it('should set and get cell state', () => {
      grid.setCellState(2, 3, CellState.Blocked);
      expect(grid.getCellState(2, 3)).toBe(CellState.Blocked);
    });

    it('should block and unblock cells', () => {
      grid.setBlocked(2, 3, true);
      expect(grid.isBlocked(2, 3)).toBe(true);
      expect(grid.getCellState(2, 3)).toBe(CellState.Blocked);

      grid.setBlocked(2, 3, false);
      expect(grid.isBlocked(2, 3)).toBe(false);
      expect(grid.getCellState(2, 3)).toBe(CellState.Empty);
    });

    it('should increment version when cells are blocked', () => {
      const initialVersion = grid.getVersion();
      grid.setBlocked(2, 3, true);
      expect(grid.getVersion()).toBe(initialVersion + 1);
    });

    it('should increment version when cells are unblocked', () => {
      grid.setBlocked(2, 3, true);
      const versionAfterBlock = grid.getVersion();
      grid.setBlocked(2, 3, false);
      expect(grid.getVersion()).toBe(versionAfterBlock + 1);
    });
  });

  describe('neighbor finding', () => {
    it('should find 4-directional neighbors in center', () => {
      const neighbors = grid.getNeighbors4(5, 5);

      expect(neighbors).toHaveLength(4);
      expect(neighbors.some(n => n.x === 4 && n.y === 5)).toBe(true); // Left
      expect(neighbors.some(n => n.x === 6 && n.y === 5)).toBe(true); // Right
      expect(neighbors.some(n => n.x === 5 && n.y === 4)).toBe(true); // Up
      expect(neighbors.some(n => n.x === 5 && n.y === 6)).toBe(true); // Down
    });

    it('should find 8-directional neighbors in center', () => {
      const neighbors = grid.getNeighbors8(5, 5);

      expect(neighbors).toHaveLength(8);
      // Should include 4-directional + diagonals
      expect(neighbors.some(n => n.x === 4 && n.y === 4)).toBe(true); // Top-left
      expect(neighbors.some(n => n.x === 6 && n.y === 4)).toBe(true); // Top-right
      expect(neighbors.some(n => n.x === 4 && n.y === 6)).toBe(true); // Bottom-left
      expect(neighbors.some(n => n.x === 6 && n.y === 6)).toBe(true); // Bottom-right
    });

    it('should not include out-of-bounds neighbors', () => {
      const neighbors = grid.getNeighbors4(0, 0);

      // Corner cell should only have 2 neighbors
      expect(neighbors).toHaveLength(2);
      expect(neighbors.some(n => n.x === 1 && n.y === 0)).toBe(true); // Right
      expect(neighbors.some(n => n.x === 0 && n.y === 1)).toBe(true); // Down
    });

    it('should handle edge cases for 8-directional neighbors', () => {
      const neighbors = grid.getNeighbors8(0, 0);

      // Corner cell should only have 3 neighbors for 8-directional
      expect(neighbors).toHaveLength(3);
      expect(neighbors.some(n => n.x === 1 && n.y === 0)).toBe(true); // Right
      expect(neighbors.some(n => n.x === 0 && n.y === 1)).toBe(true); // Down
      expect(neighbors.some(n => n.x === 1 && n.y === 1)).toBe(true); // Diagonal
    });
  });

  describe('buildability checks', () => {
    it('should allow building on empty cells', () => {
      expect(grid.isBuildable(2, 3)).toBe(true);
    });

    it('should not allow building on blocked cells', () => {
      grid.setBlocked(2, 3, true);
      expect(grid.isBuildable(2, 3)).toBe(false);
    });

    it('should allow building on path cells', () => {
      grid.setCellState(2, 3, CellState.Path);
      // Game design: paths can have towers built on them
      expect(grid.isBuildable(2, 3)).toBe(true);
    });

    it('should not allow building on water cells', () => {
      grid.setCellState(2, 3, CellState.Water);
      expect(grid.isBuildable(2, 3)).toBe(false);
    });

    it('should not allow building on spawn cells', () => {
      grid.setCellState(2, 3, CellState.Spawn);
      expect(grid.isBuildable(2, 3)).toBe(false);
    });

    it('should not allow building on exit cells', () => {
      grid.setCellState(2, 3, CellState.Exit);
      expect(grid.isBuildable(2, 3)).toBe(false);
    });

    it('should not allow building out of bounds', () => {
      expect(grid.isBuildable(-1, 0)).toBe(false);
      expect(grid.isBuildable(0, -1)).toBe(false);
      expect(grid.isBuildable(width, 0)).toBe(false);
      expect(grid.isBuildable(0, height)).toBe(false);
    });
  });

  describe('bounds checking', () => {
    it('should correctly identify in-bounds coordinates', () => {
      expect(grid.isValidCell(0, 0)).toBe(true);
      expect(grid.isValidCell(width - 1, height - 1)).toBe(true);
      expect(grid.isValidCell(5, 5)).toBe(true);
    });

    it('should correctly identify out-of-bounds coordinates', () => {
      expect(grid.isValidCell(-1, 0)).toBe(false);
      expect(grid.isValidCell(0, -1)).toBe(false);
      expect(grid.isValidCell(width, 0)).toBe(false);
      expect(grid.isValidCell(0, height)).toBe(false);
      expect(grid.isValidCell(width + 1, height + 1)).toBe(false);
    });
  });
});
