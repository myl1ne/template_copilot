/**
 * A* Pathfinding Tests
 *
 * Tests for the A* pathfinding algorithm
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AStarPathfinder } from './AStar';
import { Grid } from '../Grid';
import { Vector2 } from '../math/Vector2';

describe('AStarPathfinder', () => {
  let grid: Grid;
  let pathfinder: AStarPathfinder;

  beforeEach(() => {
    grid = new Grid(10, 10, 32);
    pathfinder = new AStarPathfinder(grid);
  });

  describe('basic pathfinding', () => {
    it('should find straight path on empty grid', () => {
      // Convert grid coordinates to world coordinates
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(5, 0);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
      expect(path).toHaveLength(6); // Including start position
      expect(path![0]!.gridX).toBe(0);
      expect(path![0]!.gridY).toBe(0);
      expect(path![path!.length - 1]!.gridX).toBe(5);
      expect(path![path!.length - 1]!.gridY).toBe(0);
    });

    it('should find diagonal-ish path', () => {
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(5, 5);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
      expect(path!.length).toBeGreaterThan(0);
      expect(path![0]!.gridX).toBe(0);
      expect(path![0]!.gridY).toBe(0);
      expect(path![path!.length - 1]!.gridX).toBe(5);
      expect(path![path!.length - 1]!.gridY).toBe(5);
    });

    it('should return null when start equals goal', () => {
      const pos = grid.gridToWorld(5, 5);
      const path = pathfinder.findPath(pos, pos, []);

      // Depending on implementation, might return empty array or null
      expect(path === null || path!.length === 0 || path!.length === 1).toBe(true);
    });
  });

  describe('obstacle avoidance', () => {
    it('should find path around blocked cells', () => {
      // Create a vertical wall
      for (let y = 0; y < 5; y++) {
        grid.setBlocked(5, y, true);
      }

      const start = grid.gridToWorld(0, 2);
      const goal = grid.gridToWorld(9, 2);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
      expect(path![0]!.gridX).toBe(0);
      expect(path![0]!.gridY).toBe(2);
      expect(path![path!.length - 1]!.gridX).toBe(9);
      expect(path![path!.length - 1]!.gridY).toBe(2);

      // Path should not contain blocked cells
      for (const node of path!) {
        expect(grid.isBlocked(node.gridX, node.gridY)).toBe(false);
      }
    });

    it('should find path around L-shaped obstacle', () => {
      // Create L-shaped wall
      grid.setBlocked(3, 3, true);
      grid.setBlocked(4, 3, true);
      grid.setBlocked(5, 3, true);
      grid.setBlocked(5, 4, true);
      grid.setBlocked(5, 5, true);

      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
      // Verify no blocked cells in path
      for (const node of path!) {
        expect(grid.isBlocked(node.gridX, node.gridY)).toBe(false);
      }
    });

    it('should return null when no path exists', () => {
      // Create a complete wall separating start and goal
      for (let y = 0; y < grid.height; y++) {
        grid.setBlocked(5, y, true);
      }

      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).toBeNull();
    });
  });

  describe('checkpoints', () => {
    it('should find path through checkpoints', () => {
      const start = grid.gridToWorld(0, 0);
      const checkpoints = [
        grid.gridToWorld(5, 0),
        grid.gridToWorld(5, 5),
      ];
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, checkpoints);

      expect(path).not.toBeNull();
      expect(path![0]!.gridX).toBe(0);
      expect(path![0]!.gridY).toBe(0);
      expect(path![path!.length - 1]!.gridX).toBe(9);
      expect(path![path!.length - 1]!.gridY).toBe(9);

      // Path should pass through checkpoints
      expect(path!.some(p => p.gridX === 5 && p.gridY === 0)).toBe(true);
      expect(path!.some(p => p.gridX === 5 && p.gridY === 5)).toBe(true);
    });

    it('should handle single checkpoint', () => {
      const start = grid.gridToWorld(0, 0);
      const checkpoints = [grid.gridToWorld(5, 5)];
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, checkpoints);

      expect(path).not.toBeNull();
      expect(path!.some(p => p.gridX === 5 && p.gridY === 5)).toBe(true);
    });

    it('should return null if any segment is blocked', () => {
      // Block path between checkpoint and goal
      for (let x = 0; x < grid.width; x++) {
        grid.setBlocked(x, 7, true);
      }

      const start = grid.gridToWorld(0, 0);
      const checkpoints = [grid.gridToWorld(5, 5)];
      const goal = grid.gridToWorld(5, 9);

      const path = pathfinder.findPath(start, goal, checkpoints);

      expect(path).toBeNull();
    });
  });

  describe('flying path', () => {
    it('should create straight line path for flying', () => {
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, [], true);

      expect(path).not.toBeNull();
      expect(path![0]!.gridX).toBe(0);
      expect(path![0]!.gridY).toBe(0);
      expect(path![path!.length - 1]!.gridX).toBe(9);
      expect(path![path!.length - 1]!.gridY).toBe(9);

      // Flying path should be relatively straight (not avoiding obstacles)
      const pathLength = path!.length;
      const straightLineDistance = Math.sqrt(
        Math.pow(9 - 0, 2) + Math.pow(9 - 0, 2)
      );

      // Path length should be close to straight line distance
      expect(pathLength).toBeLessThan(straightLineDistance * 1.5);
    });

    it('should ignore blocked cells for flying', () => {
      // Create wall that would block ground path
      for (let y = 0; y < grid.height; y++) {
        grid.setBlocked(5, y, true);
      }

      const start = grid.gridToWorld(0, 5);
      const goal = grid.gridToWorld(9, 5);

      const path = pathfinder.findPath(start, goal, [], true);

      // Flying path should still exist
      expect(path).not.toBeNull();
    });

    it('should handle flying path with checkpoints', () => {
      const start = grid.gridToWorld(0, 0);
      const checkpoints = [grid.gridToWorld(5, 5)];
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, checkpoints, true);

      expect(path).not.toBeNull();
      expect(path!.some(p => p.gridX === 5 && p.gridY === 5)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle start at edge of grid', () => {
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(5, 5);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
    });

    it('should handle goal at edge of grid', () => {
      const start = grid.gridToWorld(5, 5);
      const goal = grid.gridToWorld(9, 9);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).not.toBeNull();
    });

    it('should handle out of bounds start', () => {
      // Use actual out of bounds world coordinates
      const start = new Vector2(-50, 0);
      const goal = grid.gridToWorld(5, 5);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).toBeNull();
    });

    it('should handle out of bounds goal', () => {
      const start = grid.gridToWorld(5, 5);
      // Grid is 10x10, so grid position (10, 10) is out of bounds
      const goal = new Vector2(grid.width * grid.cellSize + 50, grid.height * grid.cellSize + 50);

      const path = pathfinder.findPath(start, goal, []);

      expect(path).toBeNull();
    });

    it('should handle blocked start position', () => {
      const start = grid.gridToWorld(0, 0);
      grid.setBlocked(0, 0, true);
      const goal = grid.gridToWorld(5, 5);

      const path = pathfinder.findPath(start, goal, []);

      // Pathfinder allows start to be blocked (for spawning monsters)
      expect(path).not.toBeNull();
    });

    it('should handle blocked goal position', () => {
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(5, 5);
      grid.setBlocked(5, 5, true);

      const path = pathfinder.findPath(start, goal, []);

      // Pathfinder allows goal to be blocked (for reaching exits)
      expect(path).not.toBeNull();
    });
  });

  describe('path validation', () => {
    it('should validate that path is continuous', () => {
      const start = grid.gridToWorld(0, 0);
      const goal = grid.gridToWorld(5, 5);

      const path = pathfinder.findPath(start, goal, []);

      if (path && path.length > 1) {
        for (let i = 0; i < path.length - 1; i++) {
          const current = path[i]!;
          const next = path[i + 1]!;

          // Each step should be to a neighboring cell (4-directional)
          const dx = Math.abs(next.gridX - current.gridX);
          const dy = Math.abs(next.gridY - current.gridY);

          // Either dx or dy should be 1, and the other should be 0 (no diagonal movement)
          expect((dx === 1 && dy === 0) || (dx === 0 && dy === 1)).toBe(true);
        }
      }
    });
  });
});
