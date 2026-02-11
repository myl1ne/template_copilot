import { Monster } from './Monster';
import { Vector2 } from '../../core/math/Vector2';
import { MonsterDefinition } from '../../types/entities';
import { AStarPathfinder } from '../../core/pathfinding/AStar';
import { shouldApplyModifier, getRandomModifier } from '../../data/modifiers';

/**
 * Manager for all monsters in the game
 */
export class MonsterManager {
  private monsters: Map<string, Monster> = new Map();

  constructor(
    private pathfinder: AStarPathfinder,
    private spawnPoint: Vector2,
    private exitPoint: Vector2,
    private checkpoints: Vector2[]
  ) {}

  /**
   * Spawn a monster
   */
  spawnMonster(definition: MonsterDefinition, position?: Vector2): Monster | null {
    const spawnPos = position || this.spawnPoint.clone();

    // Calculate path
    const path = this.pathfinder.findPath(
      spawnPos,
      this.exitPoint,
      this.checkpoints,
      definition.canFly
    );

    if (!path || path.length === 0) {
      console.warn('Failed to find path for monster:', definition.id);
      return null;
    }

    const monster = new Monster(definition, spawnPos, path);

    // Apply random modifier (5% chance, not for bosses)
    if (!definition.isBoss && shouldApplyModifier()) {
      const modifier = getRandomModifier();
      if (modifier) {
        monster.applyModifier(modifier);
        console.log(`✨ Rare ${modifier.rarity} monster spawned: ${modifier.name} ${definition.name}`);
      }
    }

    this.monsters.set(monster.id, monster);

    return monster;
  }

  /**
   * Remove a monster
   */
  removeMonster(monsterId: string): boolean {
    const monster = this.monsters.get(monsterId);
    if (!monster) {
      return false;
    }

    monster.destroy();
    this.monsters.delete(monsterId);

    return true;
  }

  /**
   * Get a monster by ID
   */
  getMonster(id: string): Monster | undefined {
    return this.monsters.get(id);
  }

  /**
   * Get all monsters
   */
  getAllMonsters(): Monster[] {
    return Array.from(this.monsters.values()).filter(m => m.isAlive);
  }

  /**
   * Get monsters in a radius
   */
  getMonstersInRadius(center: Vector2, radius: number): Monster[] {
    const result: Monster[] = [];
    const radiusSq = radius * radius;

    for (const monster of this.monsters.values()) {
      if (!monster.isAlive) continue;

      const distSq = monster.position.distanceToSquared(center);
      if (distSq <= radiusSq) {
        result.push(monster);
      }
    }

    return result;
  }

  /**
   * Get the closest monster to a position
   */
  getClosestMonster(position: Vector2, maxRange?: number): Monster | null {
    let closest: Monster | null = null;
    let closestDistSq = maxRange ? maxRange * maxRange : Infinity;

    for (const monster of this.monsters.values()) {
      if (!monster.isAlive) continue;

      const distSq = monster.position.distanceToSquared(position);
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = monster;
      }
    }

    return closest;
  }

  /**
   * Get monster furthest along the path (closest to exit)
   */
  getFurthestMonster(maxRange?: number, from?: Vector2): Monster | null {
    let furthest: Monster | null = null;
    let highestProgress = -1;

    for (const monster of this.monsters.values()) {
      if (!monster.isAlive) continue;

      // Check range if specified
      if (maxRange && from) {
        const distSq = monster.position.distanceToSquared(from);
        if (distSq > maxRange * maxRange) continue;
      }

      const progress = monster.getPathProgress();
      if (progress > highestProgress) {
        highestProgress = progress;
        furthest = monster;
      }
    }

    return furthest;
  }

  /**
   * Get monster with highest health
   */
  getStrongestMonster(maxRange?: number, from?: Vector2): Monster | null {
    let strongest: Monster | null = null;
    let highestHealth = 0;

    for (const monster of this.monsters.values()) {
      if (!monster.isAlive) continue;

      // Check range if specified
      if (maxRange && from) {
        const distSq = monster.position.distanceToSquared(from);
        if (distSq > maxRange * maxRange) continue;
      }

      if (monster.health > highestHealth) {
        highestHealth = monster.health;
        strongest = monster;
      }
    }

    return strongest;
  }

  /**
   * Get monster with lowest health
   */
  getWeakestMonster(maxRange?: number, from?: Vector2): Monster | null {
    let weakest: Monster | null = null;
    let lowestHealth = Infinity;

    for (const monster of this.monsters.values()) {
      if (!monster.isAlive) continue;

      // Check range if specified
      if (maxRange && from) {
        const distSq = monster.position.distanceToSquared(from);
        if (distSq > maxRange * maxRange) continue;
      }

      if (monster.health < lowestHealth) {
        lowestHealth = monster.health;
        weakest = monster;
      }
    }

    return weakest;
  }

  /**
   * Update all monsters
   */
  update(deltaTime: number): void {
    const deadMonsters: string[] = [];

    for (const monster of this.monsters.values()) {
      monster.update(deltaTime);

      // Collect dead monsters
      if (!monster.isAlive) {
        deadMonsters.push(monster.id);
      }
    }

    // Remove dead monsters
    for (const id of deadMonsters) {
      this.monsters.delete(id);
    }
  }

  /**
   * Recalculate paths for all ground monsters (called when towers change)
   */
  recalculateGroundPaths(): void {
    for (const monster of this.monsters.values()) {
      if (!monster.isAlive || monster.canFly) continue;

      // Recalculate path from current position
      const newPath = this.pathfinder.findPath(
        monster.position,
        this.exitPoint,
        this.checkpoints,
        false
      );

      if (newPath && newPath.length > 0) {
        monster.recalculatePath(newPath);
      }
    }
  }

  /**
   * Clear all monsters
   */
  clear(): void {
    for (const monster of this.monsters.values()) {
      monster.destroy();
    }
    this.monsters.clear();
  }

  /**
   * Get monster count
   */
  getCount(): number {
    return Array.from(this.monsters.values()).filter(m => m.isAlive).length;
  }
}
