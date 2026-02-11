/**
 * Particle System for visual effects
 * Handles explosions, impacts, sparkles, and status effect trails
 *
 * PERFORMANCE: All particles are drawn into a SINGLE shared Graphics object
 * instead of creating one Graphics per particle (prevents GPU memory exhaustion).
 */

import * as PIXI from 'pixi.js';
import { DamageType } from '../types/game';
import { DAMAGE_TYPE_COLORS } from './procedural/colorPalettes';

/**
 * Particle shape types
 */
export enum ParticleType {
  Circle = 'circle',
  Star = 'star',
  Spark = 'spark',
}

/**
 * Individual particle
 */
interface Particle {
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  life: number; // Current life
  maxLife: number; // Maximum life
  color: number;
  size: number;
  alpha: number;
  type: ParticleType;
  gravity: boolean;
}

/**
 * Emit configuration
 */
interface EmitConfig {
  x: number;
  y: number;
  count: number;
  velocityMin: number;
  velocityMax: number;
  color: number;
  type: ParticleType;
  size: number;
  lifetime: number;
  gravity: boolean;
  angleMin?: number;
  angleMax?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 500;
  // Single persistent Graphics object for ALL particles
  private graphics: PIXI.Graphics = new PIXI.Graphics();
  private addedToContainer: boolean = false;

  /**
   * Emit explosion particles (for kill/AoE effects)
   */
  emitExplosion(x: number, y: number, damageType: DamageType): void {
    const color = DAMAGE_TYPE_COLORS[damageType] ?? 0xffff00;

    this.emit({
      x,
      y,
      count: 8,
      velocityMin: 40,
      velocityMax: 120,
      color,
      type: ParticleType.Circle,
      size: 3,
      lifetime: 0.6,
      gravity: true,
    });
  }

  /**
   * Emit impact particles (for projectile hits)
   */
  emitImpact(x: number, y: number, damageType: DamageType, directionX?: number, directionY?: number): void {
    const color = DAMAGE_TYPE_COLORS[damageType] ?? 0xffff00;

    // Directional impact: particles fly in a cone
    let angleMin: number | undefined;
    let angleMax: number | undefined;

    if (directionX !== undefined && directionY !== undefined) {
      const impactAngle = Math.atan2(directionY, directionX);
      angleMin = impactAngle - Math.PI / 4;
      angleMax = impactAngle + Math.PI / 4;
    }

    this.emit({
      x,
      y,
      count: 4,
      velocityMin: 20,
      velocityMax: 60,
      color,
      type: ParticleType.Spark,
      size: 2,
      lifetime: 0.4,
      gravity: false,
      angleMin,
      angleMax,
    });
  }

  /**
   * Emit gold sparkles (for gold rewards)
   */
  emitGoldSparkles(x: number, y: number): void {
    this.emit({
      x,
      y,
      count: 5,
      velocityMin: 15,
      velocityMax: 40,
      color: 0xffff00,
      type: ParticleType.Star,
      size: 3,
      lifetime: 0.8,
      gravity: false,
      angleMin: -Math.PI, // Upward hemisphere
      angleMax: 0,
    });
  }

  /**
   * Emit status effect trail particles
   */
  emitStatusTrail(x: number, y: number, statusType: 'burn' | 'freeze' | 'stun'): void {
    let color = 0xff4400; // Default burn
    let velocityMin = 10;
    let velocityMax = 30;
    let angleMin = -Math.PI / 2 - Math.PI / 6; // Upward
    let angleMax = -Math.PI / 2 + Math.PI / 6;

    switch (statusType) {
      case 'burn':
        color = 0xff4400; // Orange-red
        break;
      case 'freeze':
        color = 0x00ccff; // Cyan
        velocityMin = 10;
        velocityMax = 30;
        angleMin = 0; // All directions
        angleMax = Math.PI * 2;
        break;
      case 'stun':
        color = 0xffff00; // Yellow
        velocityMin = 15;
        velocityMax = 40;
        angleMin = -Math.PI / 2 - Math.PI / 4; // Upward arc
        angleMax = -Math.PI / 2 + Math.PI / 4;
        break;
    }

    this.emit({
      x,
      y,
      count: 2, // Continuous light trail
      velocityMin,
      velocityMax,
      color,
      type: statusType === 'freeze' ? ParticleType.Star : ParticleType.Circle,
      size: 2,
      lifetime: 0.5,
      gravity: false,
      angleMin,
      angleMax,
    });
  }

  /**
   * Generic emit function
   */
  private emit(config: EmitConfig): void {
    // Enforce particle cap
    if (this.particles.length + config.count > this.maxParticles) {
      const excess = this.particles.length + config.count - this.maxParticles;
      this.particles.splice(0, excess); // Remove oldest particles
    }

    for (let i = 0; i < config.count; i++) {
      // Random angle (full circle or constrained)
      const angleMin = config.angleMin ?? 0;
      const angleMax = config.angleMax ?? Math.PI * 2;
      const angle = angleMin + Math.random() * (angleMax - angleMin);

      const velocity =
        config.velocityMin + Math.random() * (config.velocityMax - config.velocityMin);

      this.particles.push({
        x: config.x + (Math.random() - 0.5) * 4,
        y: config.y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: config.lifetime,
        maxLife: config.lifetime,
        color: config.color,
        size: config.size,
        alpha: 1.0,
        type: config.type,
        gravity: config.gravity,
      });
    }
  }

  /**
   * Update all particles (physics simulation)
   */
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;

      // Update position
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;

      // Apply gravity if enabled
      if (p.gravity) {
        p.vy += 200 * deltaTime; // Gravity acceleration
      }

      // Update life and alpha
      p.life -= deltaTime;
      p.alpha = Math.max(0, p.life / p.maxLife); // Fade out

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render all particles into a SINGLE shared Graphics object.
   * This is the key optimization - we reuse one Graphics instead of creating
   * hundreds per frame.
   */
  render(container: PIXI.Container): void {
    // Ensure our persistent graphics is in the container
    if (!this.addedToContainer || this.graphics.parent !== container) {
      container.addChild(this.graphics);
      this.addedToContainer = true;
    }

    // Clear previous frame's drawings (no GPU allocation, just clears draw commands)
    this.graphics.clear();

    for (const p of this.particles) {
      switch (p.type) {
        case ParticleType.Circle:
          this.graphics.beginFill(p.color, p.alpha);
          this.graphics.drawCircle(p.x, p.y, p.size);
          this.graphics.endFill();
          break;

        case ParticleType.Star:
          this.graphics.beginFill(p.color, p.alpha);
          this.drawStar(this.graphics, p.x, p.y, 4, p.size, p.size * 0.5);
          this.graphics.endFill();
          break;

        case ParticleType.Spark: {
          // Line-based spark (elongated)
          this.graphics.lineStyle(p.size * 0.5, p.color, p.alpha);
          const length = p.size * 2;
          const angle = Math.atan2(p.vy, p.vx);
          this.graphics.moveTo(p.x, p.y);
          this.graphics.lineTo(p.x + Math.cos(angle) * length, p.y + Math.sin(angle) * length);
          break;
        }
      }
    }
  }

  /**
   * Draw a star shape
   */
  private drawStar(graphics: PIXI.Graphics, x: number, y: number, points: number, outerRadius: number, innerRadius: number): void {
    const path: number[] = [];
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      path.push(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius);
    }
    graphics.drawPolygon(path);
  }

  /**
   * Get particle count (for debugging)
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}
