import { Projectile } from './Projectile';
import { Tower } from '../towers/Tower';
import { Monster } from '../monsters/Monster';
import { ProjectileType } from '../../types/game';

/**
 * Manager for all projectiles in the game
 */
export class ProjectileManager {
  private projectiles: Map<string, Projectile> = new Map();

  /**
   * Create a projectile from a tower to a target
   */
  createProjectile(tower: Tower, target: Monster): Projectile | null {
    // Don't create projectile for instant-hit weapons
    if (tower.definition.projectileType === ProjectileType.None) {
      return null;
    }

    const speed = tower.definition.projectileSpeed || 300;
    const projectile = new Projectile(
      tower,
      target,
      tower.damage,
      tower.damageType,
      speed,
      tower.definition.projectileType
    );

    this.projectiles.set(projectile.id, projectile);
    return projectile;
  }

  /**
   * Get a projectile by ID
   */
  getProjectile(id: string): Projectile | undefined {
    return this.projectiles.get(id);
  }

  /**
   * Get all active projectiles
   */
  getAllProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values()).filter(
      p => p.isAlive && !p.hasHit && p.target.isAlive
    );
  }

  /**
   * Get projectiles that have hit their targets
   */
  getHitProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values()).filter(p => p.hasHit);
  }

  /**
   * Remove a projectile
   */
  removeProjectile(projectileId: string): boolean {
    const projectile = this.projectiles.get(projectileId);
    if (!projectile) {
      return false;
    }

    projectile.destroy();
    this.projectiles.delete(projectileId);
    return true;
  }

  /**
   * Update all projectiles
   */
  update(deltaTime: number): void {
    const toRemove: string[] = [];

    for (const projectile of this.projectiles.values()) {
      projectile.update(deltaTime);

      // Mark for removal if dead or hit
      if (!projectile.isAlive || projectile.hasHit) {
        toRemove.push(projectile.id);
      }
    }

    // Clean up projectiles after processing all hits
    // (CombatSystem should handle hits before removal)
  }

  /**
   * Clean up dead/hit projectiles
   */
  cleanup(): void {
    const toRemove: string[] = [];

    for (const projectile of this.projectiles.values()) {
      if (!projectile.isAlive) {
        toRemove.push(projectile.id);
      }
    }

    for (const id of toRemove) {
      this.projectiles.delete(id);
    }
  }

  /**
   * Clear all projectiles
   */
  clear(): void {
    for (const projectile of this.projectiles.values()) {
      projectile.destroy();
    }
    this.projectiles.clear();
  }

  /**
   * Get projectile count
   */
  getCount(): number {
    return Array.from(this.projectiles.values()).filter(p => p.isAlive).length;
  }
}
