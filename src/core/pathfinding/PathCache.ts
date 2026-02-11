import { PathNode } from './PathNode';

/**
 * Cache for storing pathfinding results
 */
export class PathCache {
  private cache: Map<string, PathNode[]> = new Map();
  private maxSize: number = 1000;

  /**
   * Generate a cache key from start, goal, and grid version
   */
  generateKey(
    startX: number,
    startY: number,
    goalX: number,
    goalY: number,
    gridVersion: number
  ): string {
    return `${startX},${startY}-${goalX},${goalY}-${gridVersion}`;
  }

  /**
   * Get a cached path
   */
  get(key: string): PathNode[] | undefined {
    return this.cache.get(key);
  }

  /**
   * Set a cached path
   */
  set(key: string, path: PathNode[]): void {
    // Implement simple LRU by clearing cache when it gets too large
    if (this.cache.size >= this.maxSize) {
      this.clear();
    }
    this.cache.set(key, path);
  }

  /**
   * Check if a path is cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}
