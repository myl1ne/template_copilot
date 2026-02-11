import { Tower } from '../entities/towers/Tower';
import { Monster } from '../entities/monsters/Monster';
import { TowerManager } from '../entities/towers/TowerManager';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { ProjectileManager } from '../entities/projectiles/ProjectileManager';
import { TargetingSystem } from './TargetingSystem';
import { AbilitySystem } from './AbilitySystem';
import { DamageType, ProjectileType } from '../types/game';
import { BuffType } from '../roguelike/types';
import { useGameStore } from '../store/gameStore';
import { useRunStore } from '../store/runStore';

/**
 * System for handling combat, damage, and rewards
 */
export class CombatSystem {
  private abilitySystem: AbilitySystem | null = null;

  // Visual feedback callbacks
  public onDamageDealt: ((x: number, y: number, damageType: DamageType) => void) | null = null;
  public onShowDamage: ((x: number, y: number, damage: number, damageType: DamageType) => void) | null = null;
  public onShowGold: ((x: number, y: number, gold: number) => void) | null = null;
  public onShowLivesLost: ((x: number, y: number) => void) | null = null;

  // Particle effect callbacks
  public onImpactParticles: ((x: number, y: number, damageType: DamageType, directionX?: number, directionY?: number) => void) | null = null;
  public onExplosionParticles: ((x: number, y: number, damageType: DamageType) => void) | null = null;
  public onGoldSparkles: ((x: number, y: number) => void) | null = null;

  constructor(
    private towerManager: TowerManager,
    private monsterManager: MonsterManager,
    private projectileManager: ProjectileManager,
    private targetingSystem: TargetingSystem
  ) {}

  setAbilitySystem(abilitySystem: AbilitySystem): void {
    this.abilitySystem = abilitySystem;
  }

  /**
   * Update combat for all towers
   */
  update(_deltaTime: number): void {
    const towers = this.towerManager.getAllTowers();

    for (const tower of towers) {
      // Update targeting
      this.targetingSystem.updateTarget(tower);

      // Try to attack
      if (tower.currentTarget && tower.canAttack()) {
        // Type guard: currentTarget should be a Monster
        if (tower.currentTarget instanceof Monster) {
          this.performAttack(tower, tower.currentTarget);
          tower.attack(); // Reset cooldown
        }
      }
    }

    // Process projectile hits
    this.processProjectileHits();
  }

  /**
   * Perform an attack from a tower to a monster
   */
  private performAttack(tower: Tower, target: Monster): void {
    if (tower.definition.projectileType === ProjectileType.None) {
      // Instant hit - use effective damage with buffs
      this.dealDamage(target, tower.getEffectiveDamage(), tower.damageType, tower);
    } else {
      // Create projectile
      this.projectileManager.createProjectile(tower, target);
    }
  }

  /**
   * Process hits from projectiles
   */
  private processProjectileHits(): void {
    const hitProjectiles = this.projectileManager.getHitProjectiles();

    for (const projectile of hitProjectiles) {
      if (projectile.target.isAlive) {
        this.dealDamage(
          projectile.target,
          projectile.damage,
          projectile.damageType,
          projectile.source
        );
      }

      // Mark projectile for cleanup
      projectile.destroy();
    }

    // Clean up dead projectiles
    this.projectileManager.cleanup();
  }

  /**
   * Deal damage to a monster
   */
  dealDamage(
    target: Monster,
    baseDamage: number,
    damageType: DamageType,
    source?: Tower
  ): number {
    // Monster.takeDamage now handles resistance and armor calculation
    const initialHealth = target.health;
    target.takeDamage(baseDamage, damageType);
    const finalDamage = initialHealth - target.health;

    // Trigger visual hit effect
    if (finalDamage > 0 && this.onDamageDealt) {
      this.onDamageDealt(target.position.x, target.position.y, damageType);
    }

    // Show damage number
    if (finalDamage > 0 && this.onShowDamage) {
      this.onShowDamage(target.position.x, target.position.y, finalDamage, damageType);
    }

    // Emit impact particles (calculate direction from source to target)
    if (finalDamage > 0 && this.onImpactParticles && source) {
      const dx = target.position.x - source.position.x;
      const dy = target.position.y - source.position.y;
      this.onImpactParticles(target.position.x, target.position.y, damageType, dx, dy);
    }

    // Ice damage inherently slows enemies (1.5s)
    if (damageType === DamageType.Ice && finalDamage > 0 && target.isAlive) {
      target.isSlowed = true;
      if (!target.statusEffects.includes('slow')) {
        target.statusEffects.push('slow');
      }
      // Add/refresh active effect for duration tracking
      const existingIceSlow = target.activeEffects.find(e => e.type === 'slow' && !e.tickRate);
      if (existingIceSlow) {
        existingIceSlow.timeRemaining = Math.max(existingIceSlow.timeRemaining, 1.5);
      } else {
        target.activeEffects.push({
          type: 'slow',
          potency: 0.7,
          duration: 1.5,
          timeRemaining: 1.5,
        });
      }
    }

    // Trigger on-hit abilities from source tower
    if (source && this.abilitySystem && finalDamage > 0) {
      const abilities = this.abilitySystem.getAbilities(source.id);
      if (abilities.length > 0) {
        const context = {
          source,
          target,
          damageDealt: finalDamage,
          nearbyMonsters: this.monsterManager.getAllMonsters(),
          nearbyTowers: this.towerManager.getAllTowers(),
        };
        for (const ability of abilities) {
          if (ability.canActivate(context)) {
            ability.activate(context);
          }
        }
      }
    }

    // Check if monster died
    if (!target.isAlive) {
      this.onMonsterKilled(target, source);
    }

    return finalDamage;
  }

  /**
   * Calculate armor damage reduction
   * Formula: damage reduction = armor / (armor + 100)
   * This creates diminishing returns
   */
  private calculateArmorReduction(armor: number): number {
    return 100 / (100 + armor);
  }

  /**
   * Handle monster death
   */
  private onMonsterKilled(monster: Monster, _source?: Tower): void {
    // Award gold (apply GoldBonus buff if active)
    const runManager = (window as any).runManager;
    const goldMultiplier = runManager ? runManager.getBuffMultiplier(BuffType.GoldBonus) : 1;
    const gold = Math.floor(monster.goldReward * goldMultiplier);
    useGameStore.getState().addGold(gold);

    // Show gold reward
    console.log(`💰 Monster killed at (${monster.position.x}, ${monster.position.y}), gold=${gold}, callback exists=${!!this.onShowGold}`);
    if (this.onShowGold) {
      this.onShowGold(monster.position.x, monster.position.y, gold);
    }

    // Emit gold sparkles
    if (this.onGoldSparkles) {
      this.onGoldSparkles(monster.position.x, monster.position.y);
    }

    // Track gold in run store
    useRunStore.getState().addGoldEarned(gold);

    // Track kill in run store
    useRunStore.getState().incrementKills();

    // Award score
    let score = gold;

    // Bonus for rare monsters
    if (monster.modifiers.length > 0) {
      score *= 2;
    }

    // Bonus for boss monsters
    if (monster.definition.isBoss) {
      score *= 5;
      // Boss death explosion
      if (this.onExplosionParticles) {
        this.onExplosionParticles(monster.position.x, monster.position.y, DamageType.Physical);
      }
    }

    useGameStore.getState().addScore(score);

    // TODO: Check if wave is complete
  }

  /**
   * Handle monster reaching exit
   */
  onMonsterReachedExit(monster: Monster): void {
    console.log(`💔 Monster ${monster.id} reached exit - losing 1 life`);

    // Lose a life
    const currentLives = useGameStore.getState().lives;
    useGameStore.getState().loseLife();
    const newLives = useGameStore.getState().lives;

    console.log(`   Lives: ${currentLives} → ${newLives}`);

    // Show lives lost
    if (this.onShowLivesLost) {
      this.onShowLivesLost(monster.position.x, monster.position.y);
    }

    // Remove monster
    this.monsterManager.removeMonster(monster.id);
  }

  /**
   * Calculate effective damage (for UI/predictions)
   */
  calculateEffectiveDamage(
    baseDamage: number,
    damageType: DamageType,
    target: Monster
  ): number {
    const resistance = target.resistances[damageType] || 0;
    const resistMultiplier = 1 - resistance;

    let damage = baseDamage * resistMultiplier;

    if (damageType === DamageType.Physical) {
      damage *= this.calculateArmorReduction(target.armor);
    }

    return damage;
  }

  /**
   * Get damage multiplier against a target (for UI)
   */
  getDamageMultiplier(damageType: DamageType, target: Monster): number {
    const resistance = target.resistances[damageType] || 0;
    let multiplier = 1 - resistance;

    if (damageType === DamageType.Physical) {
      multiplier *= this.calculateArmorReduction(target.armor);
    }

    return multiplier;
  }
}
