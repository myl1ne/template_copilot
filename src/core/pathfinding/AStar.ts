import { Grid } from '../Grid';
import { Vector2 } from '../math/Vector2';
import { PathNode } from './PathNode';
import { PriorityQueue } from './PriorityQueue';
import { PathCache } from './PathCache';

/**
 * A* pathfinding implementation with caching
 */
export class AStarPathfinder {
  private cache: PathCache = new PathCache();

  constructor(private grid: Grid) {}

  /**
   * Find a complete path through multiple checkpoints
   * @param canFly - If true, uses straight-line pathfinding (ignores towers)
   */
  findPath(start: Vector2, goal: Vector2, checkpoints: Vector2[], canFly: boolean = false): PathNode[] | null {
    if (canFly) {
      return this.findFlyingPath(start, goal, checkpoints);
    }

    // Ground path through checkpoints
    let fullPath: PathNode[] = [];
    let currentStart = start;

    // Add goal to checkpoints if not already there
    const allCheckpoints = [...checkpoints];
    if (!allCheckpoints.some(cp => cp.equals(goal))) {
      allCheckpoints.push(goal);
    }

    for (const checkpoint of allCheckpoints) {
      const segment = this.findPathSegment(currentStart, checkpoint);
      if (!segment || segment.length === 0) {
        return null; // No valid path
      }

      // Avoid duplicating the connection point (slice instead of shift to avoid mutating cached array)
      const offset = fullPath.length > 0 ? 1 : 0;
      fullPath = fullPath.concat(segment.slice(offset));
      currentStart = checkpoint;
    }

    return fullPath;
  }

  /**
   * Find a straight-line flying path (ignores towers)
   */
  private findFlyingPath(start: Vector2, goal: Vector2, checkpoints: Vector2[]): PathNode[] {
    const path: PathNode[] = [];
    const startGrid = this.grid.worldToGrid(start.x, start.y);

    // Add start point
    const startWorldPos = this.grid.gridToWorld(startGrid.x, startGrid.y);
    path.push(new PathNode(startWorldPos, startGrid.x, startGrid.y));

    // Add each checkpoint
    for (const checkpoint of checkpoints) {
      const checkpointGrid = this.grid.worldToGrid(checkpoint.x, checkpoint.y);
      const checkpointWorldPos = this.grid.gridToWorld(checkpointGrid.x, checkpointGrid.y);
      path.push(new PathNode(checkpointWorldPos, checkpointGrid.x, checkpointGrid.y));
    }

    // Add goal
    const goalGrid = this.grid.worldToGrid(goal.x, goal.y);
    const goalWorldPos = this.grid.gridToWorld(goalGrid.x, goalGrid.y);
    if (!path.some(node => node.equals(new PathNode(goalWorldPos, goalGrid.x, goalGrid.y)))) {
      path.push(new PathNode(goalWorldPos, goalGrid.x, goalGrid.y));
    }

    return path;
  }

  /**
   * Find a path segment between two points using A*
   */
  private findPathSegment(start: Vector2, goal: Vector2): PathNode[] | null {
    const startGrid = this.grid.worldToGrid(start.x, start.y);
    const goalGrid = this.grid.worldToGrid(goal.x, goal.y);

    // Check cache
    const cacheKey = this.cache.generateKey(
      startGrid.x,
      startGrid.y,
      goalGrid.x,
      goalGrid.y,
      this.grid.getVersion()
    );

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Perform A* search
    const path = this.astar(startGrid, goalGrid);

    // Cache result
    if (path) {
      this.cache.set(cacheKey, path);
    }

    return path;
  }

  /**
   * A* algorithm implementation
   */
  private astar(start: Vector2, goal: Vector2): PathNode[] | null {
    if (!this.grid.isValidCell(start.x, start.y) || !this.grid.isValidCell(goal.x, goal.y)) {
      return null;
    }

    const openSet = new PriorityQueue<PathNode>();
    const closedSet = new Set<string>();
    const nodes = new Map<string, PathNode>();

    // Create start node
    const startPos = this.grid.gridToWorld(start.x, start.y);
    const startNode = new PathNode(startPos, start.x, start.y);
    startNode.g = 0;
    startNode.h = this.heuristic(start, goal);
    startNode.calculateF();

    nodes.set(startNode.getKey(), startNode);
    openSet.enqueue(startNode, startNode.f);

    while (!openSet.isEmpty()) {
      const current = openSet.dequeue()!;
      const currentKey = current.getKey();

      // Reached goal
      if (current.gridX === goal.x && current.gridY === goal.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(currentKey);

      // Check all neighbors
      const neighbors = this.grid.getNeighbors4(current.gridX, current.gridY);

      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;

        // Skip if already evaluated
        if (closedSet.has(neighborKey)) {
          continue;
        }

        // Skip if not walkable (unless it's the goal)
        // This checks for towers AND terrain obstacles (water, lava, rocks, forests)
        if (!this.grid.isWalkable(neighbor.x, neighbor.y) &&
            !(neighbor.x === goal.x && neighbor.y === goal.y)) {
          continue;
        }

        // Calculate tentative g score
        const tentativeG = current.g + 1; // Cost to move to neighbor

        // Get or create neighbor node
        let neighborNode = nodes.get(neighborKey);
        if (!neighborNode) {
          const neighborPos = this.grid.gridToWorld(neighbor.x, neighbor.y);
          neighborNode = new PathNode(neighborPos, neighbor.x, neighbor.y);
          neighborNode.g = Infinity;
          nodes.set(neighborKey, neighborNode);
        }

        // Update if we found a better path
        if (tentativeG < neighborNode.g) {
          neighborNode.parent = current;
          neighborNode.g = tentativeG;
          neighborNode.h = this.heuristic(neighbor, goal);
          neighborNode.calculateF();

          openSet.enqueue(neighborNode, neighborNode.f);
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Manhattan distance heuristic
   */
  private heuristic(a: Vector2, b: Vector2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Reconstruct the path from the goal node
   */
  private reconstructPath(goalNode: PathNode): PathNode[] {
    const path: PathNode[] = [];
    let current: PathNode | null = goalNode;

    while (current !== null) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  /**
   * Validate that a path still exists (for tower placement validation)
   */
  validatePath(start: Vector2, goal: Vector2, checkpoints: Vector2[], canFly: boolean = false): boolean {
    const path = this.findPath(start, goal, checkpoints, canFly);
    return path !== null && path.length > 0;
  }

  /**
   * Clear the path cache (call when grid changes significantly)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }
}
