import { Tower } from '../entities/towers/Tower';
import { Monster } from '../entities/monsters/Monster';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { TargetPriority } from '../types/game';

/**
 * System for handling tower targeting
 */
export class TargetingSystem {
  constructor(private monsterManager: MonsterManager) {}

  /**
   * Find a target for a tower based on its targeting priority
   */
  findTarget(tower: Tower): Monster | null {
    const monstersInRange = this.monsterManager
      .getAllMonsters()
      .filter(monster => tower.isInRange(monster));

    if (monstersInRange.length === 0) {
      return null;
    }

    switch (tower.definition.targetPriority) {
      case TargetPriority.First:
        return this.getFurthestMonster(monstersInRange);

      case TargetPriority.Last:
        return this.getClosestToSpawn(monstersInRange);

      case TargetPriority.Strongest:
        return this.getStrongestMonster(monstersInRange);

      case TargetPriority.Weakest:
        return this.getWeakestMonster(monstersInRange);

      case TargetPriority.Closest:
        return this.getClosestMonster(monstersInRange, tower);

      default:
        return monstersInRange[0] || null;
    }
  }

  /**
   * Update targeting for a tower
   */
  updateTarget(tower: Tower): void {
    // Clear target if it's dead or out of range
    if (tower.currentTarget) {
      if (!tower.currentTarget.isAlive || !tower.isInRange(tower.currentTarget)) {
        tower.currentTarget = null;
      }
    }

    // Find new target if needed
    if (!tower.currentTarget) {
      tower.currentTarget = this.findTarget(tower);
    }
  }

  /**
   * Get monster furthest along path (closest to exit)
   */
  private getFurthestMonster(monsters: Monster[]): Monster | null {
    let furthest: Monster | null = null;
    let highestProgress = -1;

    for (const monster of monsters) {
      const progress = monster.getPathProgress();
      if (progress > highestProgress) {
        highestProgress = progress;
        furthest = monster;
      }
    }

    return furthest;
  }

  /**
   * Get monster closest to spawn (last in line)
   */
  private getClosestToSpawn(monsters: Monster[]): Monster | null {
    let closest: Monster | null = null;
    let lowestProgress = Infinity;

    for (const monster of monsters) {
      const progress = monster.getPathProgress();
      if (progress < lowestProgress) {
        lowestProgress = progress;
        closest = monster;
      }
    }

    return closest;
  }

  /**
   * Get monster with highest health
   */
  private getStrongestMonster(monsters: Monster[]): Monster | null {
    let strongest: Monster | null = null;
    let highestHealth = 0;

    for (const monster of monsters) {
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
  private getWeakestMonster(monsters: Monster[]): Monster | null {
    let weakest: Monster | null = null;
    let lowestHealth = Infinity;

    for (const monster of monsters) {
      if (monster.health < lowestHealth) {
        lowestHealth = monster.health;
        weakest = monster;
      }
    }

    return weakest;
  }

  /**
   * Get monster closest to tower
   */
  private getClosestMonster(monsters: Monster[], tower: Tower): Monster | null {
    let closest: Monster | null = null;
    let closestDistSq = Infinity;

    for (const monster of monsters) {
      const distSq = tower.distanceToSquared(monster);
      if (distSq < closestDistSq) {
        closestDistSq = distSq;
        closest = monster;
      }
    }

    return closest;
  }
}
