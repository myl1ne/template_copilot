/**
 * Floating text system for damage numbers, gold rewards, and lives lost feedback
 *
 * PERFORMANCE: Reuses PIXI.Text objects from a pool instead of creating/destroying
 * new ones every frame (prevents GPU memory exhaustion).
 */

import * as PIXI from 'pixi.js';
import { DamageType } from '../types/game';
import { DAMAGE_TYPE_COLORS } from './procedural/colorPalettes';

interface FloatingText {
  x: number;
  y: number;
  vx: number; // horizontal velocity
  vy: number; // vertical velocity (upward float)
  text: string;
  color: number;
  fontSize: number;
  life: number;
  maxLife: number;
  alpha: number;
  textObject: PIXI.Text | null; // Assigned from pool
}

/**
 * Manages floating text effects for player feedback.
 * Uses persistent PIXI.Text objects to avoid GPU memory leaks.
 */
export class FloatingTextSystem {
  private texts: FloatingText[] = [];
  private container: PIXI.Container;
  private textPool: PIXI.Text[] = []; // Pool of reusable Text objects
  private addedToContainer: boolean = false;

  constructor() {
    this.container = new PIXI.Container();
  }

  /**
   * Show damage number
   */
  showDamage(x: number, y: number, damage: number, damageType: DamageType): void {
    const color = DAMAGE_TYPE_COLORS[damageType] ?? 0xffffff;

    this.texts.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: -50,
      text: Math.floor(damage).toString(),
      color,
      fontSize: 16,
      life: 0,
      maxLife: 1.0,
      alpha: 1.0,
      textObject: null,
    });
  }

  /**
   * Show gold gained
   */
  showGold(x: number, y: number, gold: number): void {
    this.texts.push({
      x,
      y: y - 20,
      vx: 0,
      vy: -30,
      text: `+${gold}g`,
      color: 0xffff00,
      fontSize: 18,
      life: 0,
      maxLife: 1.5,
      alpha: 1.0,
      textObject: null,
    });
  }

  /**
   * Show lives lost
   */
  showLivesLost(x: number, y: number): void {
    this.texts.push({
      x,
      y,
      vx: 0,
      vy: -40,
      text: '-1 ♥',
      color: 0xff0000,
      fontSize: 20,
      life: 0,
      maxLife: 2.0,
      alpha: 1.0,
      textObject: null,
    });
  }

  /**
   * Get a Text object from pool or create a new one
   */
  private acquireText(): PIXI.Text {
    if (this.textPool.length > 0) {
      const text = this.textPool.pop()!;
      text.visible = true;
      return text;
    }
    // Create new only when pool is empty
    const text = new PIXI.Text('', {
      fontFamily: 'Arial',
      fontSize: 16,
      fontWeight: 'bold',
      fill: 0xffffff,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    text.anchor.set(0.5);
    this.container.addChild(text);
    return text;
  }

  /**
   * Return a Text object to the pool for reuse
   */
  private releaseText(text: PIXI.Text): void {
    text.visible = false;
    this.textPool.push(text);
  }

  /**
   * Update all floating texts
   */
  update(deltaTime: number): void {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const ft = this.texts[i]!;

      // Update position
      ft.x += ft.vx * deltaTime;
      ft.y += ft.vy * deltaTime;

      // Update lifetime
      ft.life += deltaTime;

      // Fade out
      const lifeProgress = ft.life / ft.maxLife;
      ft.alpha = 1.0 - lifeProgress;

      // Remove expired texts
      if (ft.life >= ft.maxLife) {
        if (ft.textObject) {
          this.releaseText(ft.textObject);
          ft.textObject = null;
        }
        this.texts.splice(i, 1);
      }
    }
  }

  /**
   * Render all floating texts (reuses PIXI.Text objects from pool)
   */
  render(container: PIXI.Container): void {
    // Ensure our persistent container is added
    if (!this.addedToContainer || this.container.parent !== container) {
      container.addChild(this.container);
      this.addedToContainer = true;
    }

    // Update text objects for current frame
    for (const ft of this.texts) {
      // Acquire a Text object if this floating text doesn't have one yet
      if (!ft.textObject) {
        ft.textObject = this.acquireText();
      }

      const textObj = ft.textObject;
      textObj.text = ft.text;
      textObj.style.fontSize = ft.fontSize;
      textObj.style.fill = ft.color;
      textObj.x = ft.x;
      textObj.y = ft.y;
      textObj.alpha = ft.alpha;
    }
  }

  /**
   * Clear all floating texts
   */
  clear(): void {
    for (const ft of this.texts) {
      if (ft.textObject) {
        this.releaseText(ft.textObject);
      }
    }
    this.texts = [];
  }

  /**
   * Get the container for this system
   */
  getContainer(): PIXI.Container {
    return this.container;
  }
}
