/**
 * ProjectileManager Tests
 *
 * Tests for projectile creation, tracking, and cleanup
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectileManager } from './ProjectileManager';
import { ProjectileType } from '../../types/game';
import { createMockTower, createMockMonster } from '../../test/utils/testUtils';

describe('ProjectileManager', () => {
  let projectileManager: ProjectileManager;

  beforeEach(() => {
    projectileManager = new ProjectileManager();
  });

  describe('createProjectile', () => {
    it('should create projectile from tower to target', () => {
      const tower = createMockTower({
        projectileType: ProjectileType.Arrow,
        projectileSpeed: 400,
      });
      const monster = createMockMonster();

      const projectile = projectileManager.createProjectile(tower, monster);

      expect(projectile).not.toBeNull();
      expect(projectile!.source).toBe(tower);
      expect(projectile!.target).toBe(monster);
      expect(projectile!.damage).toBe(tower.damage);
      expect(projectile!.damageType).toBe(tower.damageType);
    });

    it('should return null for instant-hit weapons', () => {
      const tower = createMockTower({
        projectileType: ProjectileType.None,
      });
      const monster = createMockMonster();

      const projectile = projectileManager.createProjectile(tower, monster);

      expect(projectile).toBeNull();
    });

    it('should use default speed if not specified', () => {
      const tower = createMockTower({
        projectileType: ProjectileType.Bolt,
        projectileSpeed: undefined,
      });
      const monster = createMockMonster();

      const projectile = projectileManager.createProjectile(tower, monster);

      expect(projectile).not.toBeNull();
      // Default speed is 300
      expect(projectile!.speed).toBe(300);
    });
  });

  describe('getProjectile', () => {
    it('should get projectile by ID', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      const retrieved = projectileManager.getProjectile(projectile!.id);
      expect(retrieved).toBe(projectile);
    });

    it('should return undefined for nonexistent projectile', () => {
      const retrieved = projectileManager.getProjectile('nonexistent');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getAllProjectiles', () => {
    it('should return empty array when no projectiles', () => {
      const projectiles = projectileManager.getAllProjectiles();
      expect(projectiles).toEqual([]);
    });

    it('should return all active projectiles', () => {
      const tower1 = createMockTower({ projectileType: ProjectileType.Arrow });
      const tower2 = createMockTower({ projectileType: ProjectileType.Bolt });
      const monster1 = createMockMonster();
      const monster2 = createMockMonster();

      projectileManager.createProjectile(tower1, monster1);
      projectileManager.createProjectile(tower2, monster2);

      const projectiles = projectileManager.getAllProjectiles();
      expect(projectiles).toHaveLength(2);
    });

    it('should not return hit projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      // Mark as hit
      projectile!.hasHit = true;

      const projectiles = projectileManager.getAllProjectiles();
      expect(projectiles).toHaveLength(0);
    });

    it('should not return dead projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      // Mark as dead
      projectile!.isAlive = false;

      const projectiles = projectileManager.getAllProjectiles();
      expect(projectiles).toHaveLength(0);
    });
  });

  describe('getHitProjectiles', () => {
    it('should return empty array when no hits', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      projectileManager.createProjectile(tower, monster);

      const hitProjectiles = projectileManager.getHitProjectiles();
      expect(hitProjectiles).toEqual([]);
    });

    it('should return projectiles that hit targets', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      // Mark as hit
      projectile!.hasHit = true;

      const hitProjectiles = projectileManager.getHitProjectiles();
      expect(hitProjectiles).toHaveLength(1);
      expect(hitProjectiles[0]).toBe(projectile);
    });
  });

  describe('removeProjectile', () => {
    it('should remove projectile successfully', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      const result = projectileManager.removeProjectile(projectile!.id);

      expect(result).toBe(true);
      expect(projectileManager.getProjectile(projectile!.id)).toBeUndefined();
    });

    it('should return false for nonexistent projectile', () => {
      const result = projectileManager.removeProjectile('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update all projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster(undefined, 1000, 1000); // Far away
      const projectile = projectileManager.createProjectile(tower, monster);

      const initialDistance = projectile!.position.distanceTo(monster.position);

      projectileManager.update(0.016);

      const newDistance = projectile!.position.distanceTo(monster.position);

      // Projectile should move closer to target
      expect(newDistance).toBeLessThan(initialDistance);
    });

    it('should handle projectiles that reach target', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow }, 0, 0);
      const monster = createMockMonster(undefined, 1, 1); // Very close
      const projectile = projectileManager.createProjectile(tower, monster);

      // Update enough times for projectile to hit
      for (let i = 0; i < 10; i++) {
        projectileManager.update(0.1);
      }

      // Projectile should have hit
      expect(projectile!.hasHit).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should remove dead projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      // Mark as dead
      projectile!.isAlive = false;

      projectileManager.cleanup();

      expect(projectileManager.getProjectile(projectile!.id)).toBeUndefined();
    });

    it('should not remove alive projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      projectileManager.cleanup();

      expect(projectileManager.getProjectile(projectile!.id)).toBe(projectile);
    });
  });

  describe('clear', () => {
    it('should remove all projectiles', () => {
      const tower1 = createMockTower({ projectileType: ProjectileType.Arrow });
      const tower2 = createMockTower({ projectileType: ProjectileType.Bolt });
      const monster1 = createMockMonster();
      const monster2 = createMockMonster();

      projectileManager.createProjectile(tower1, monster1);
      projectileManager.createProjectile(tower2, monster2);

      projectileManager.clear();

      expect(projectileManager.getAllProjectiles()).toEqual([]);
      expect(projectileManager.getCount()).toBe(0);
    });
  });

  describe('getCount', () => {
    it('should return zero when no projectiles', () => {
      expect(projectileManager.getCount()).toBe(0);
    });

    it('should return correct count', () => {
      const tower1 = createMockTower({ projectileType: ProjectileType.Arrow });
      const tower2 = createMockTower({ projectileType: ProjectileType.Bolt });
      const monster1 = createMockMonster();
      const monster2 = createMockMonster();

      projectileManager.createProjectile(tower1, monster1);
      expect(projectileManager.getCount()).toBe(1);

      projectileManager.createProjectile(tower2, monster2);
      expect(projectileManager.getCount()).toBe(2);
    });

    it('should not count dead projectiles', () => {
      const tower = createMockTower({ projectileType: ProjectileType.Arrow });
      const monster = createMockMonster();
      const projectile = projectileManager.createProjectile(tower, monster);

      expect(projectileManager.getCount()).toBe(1);

      projectile!.isAlive = false;
      expect(projectileManager.getCount()).toBe(0);
    });
  });
});
