/**
 * Procedural Art Renderer
 *
 * Renders game entities using procedurally generated visuals from shape definitions.
 * Supports animations, state-dependent rendering, and dynamic colors.
 */

import * as PIXI from 'pixi.js';
import {
  VisualDefinition,
  EntityRenderState,
  Shape,
  CircleShape,
  RectShape,
  PolygonShape,
  LineShape,
  ArcShape,
  StarShape,
} from './types';
import type { AssetLoader } from '../AssetLoader';

export class ProceduralArtRenderer {
  private time: number = 0;
  private assetLoader: AssetLoader | null = null;

  /**
   * Set asset loader for sprite-first rendering
   * @param assetLoader - AssetLoader instance (optional)
   */
  setAssetLoader(assetLoader: AssetLoader | null): void {
    this.assetLoader = assetLoader;
  }

  /**
   * Update animation time
   */
  update(deltaTime: number): void {
    this.time += deltaTime;
  }

  /**
   * Get current animation time
   */
  getTime(): number {
    return this.time;
  }

  /**
   * Render an entity with its visual definition
   * @param graphics - PIXI.Graphics object to render to
   * @param visual - Visual definition (procedural shapes)
   * @param state - Current entity state
   * @param entityId - Optional entity ID for sprite loading
   */
  renderEntity(
    graphics: PIXI.Graphics,
    visual: VisualDefinition,
    state: EntityRenderState,
    entityId?: string
  ): void {
    // Clear previous graphics AND destroy children (prevent memory leak)
    graphics.clear();
    graphics.removeChildren().forEach(child => child.destroy({ children: true }));

    // Position FIRST (before drawing)
    graphics.x = state.position.x;
    graphics.y = state.position.y;

    // NEW: Composite rendering support (base + turret)
    // If turretShapes exist, only rotate the turret, not the base
    const hasCompositeParts = visual.turretShapes && visual.turretShapes.length > 0;

    if (!hasCompositeParts) {
      // Old behavior: rotate entire entity
      graphics.rotation = state.rotation;
    }

    graphics.scale.set(state.scale, state.scale);

    // Apply tint if specified
    if (state.tint !== undefined) {
      graphics.tint = state.tint;
    }

    // NEW: Check for sprite first (sprite-first hybrid rendering)
    if (entityId && this.assetLoader && this.assetLoader.hasSprite(entityId)) {
      const isLoaded = this.assetLoader.isLoaded(entityId);

      if (isLoaded) {
        // Sprite is loaded, render it
        try {
          const texture = PIXI.Assets.get(entityId);
          if (texture) {
            // Create sprite from texture
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5); // Center anchor
            sprite.width = 64; // Normalize sprite size (tower defense standard)
            sprite.height = 64;

            // Add sprite to graphics container
            graphics.addChild(sprite);

            // Skip procedural rendering, sprite is shown
            return;
          }
        } catch (error) {
          // Sprite loading failed, fall through to procedural rendering
          console.warn(`⚠️  Failed to render sprite for ${entityId}, using procedural art`);
        }
      } else {
        // Sprite exists in manifest but not loaded yet, trigger async load
        this.assetLoader.loadSprite(entityId).catch(() => {
          // Load failed, procedural art will be used
        });
        // Fall through to procedural rendering while loading
      }
    }

    // EXISTING: Render procedural shapes (fallback)
    // Sort shapes by layer
    const sortedShapes = [...visual.shapes].sort((a, b) => (a.layer || 0) - (b.layer || 0));

    // Render base shapes (never rotates for towers with turrets)
    for (const shape of sortedShapes) {
      // Check visibility conditions
      if (shape.hideWhenAttacking && state.isAttacking) continue;
      if (shape.showWhenAttacking && !state.isAttacking) continue;

      this.renderShape(graphics, shape, state);
    }

    // NEW: Render turret shapes (rotates independently)
    if (hasCompositeParts) {
      // Create a child graphics container for the turret
      const turretGraphics = new PIXI.Graphics();
      turretGraphics.rotation = state.rotation; // Only the turret rotates

      // Sort turret shapes by layer
      const sortedTurretShapes = [...visual.turretShapes!].sort((a, b) => (a.layer || 0) - (b.layer || 0));

      // Render each turret shape
      for (const shape of sortedTurretShapes) {
        // Check visibility conditions
        if (shape.hideWhenAttacking && state.isAttacking) continue;
        if (shape.showWhenAttacking && !state.isAttacking) continue;

        this.renderShape(turretGraphics, shape, state);
      }

      // Add turret to main graphics
      graphics.addChild(turretGraphics);
    }

    // Custom renderer (for complex animations)
    if (visual.customRenderer) {
      visual.customRenderer(graphics, state);
    }

    // Render range indicator (for towers)
    if (visual.rangeIndicator && state.range !== undefined) {
      if (visual.rangeIndicator.showAlways) {
        this.renderRangeIndicator(graphics, visual.rangeIndicator, state.range);
      }
    }

    // Render health bar (for monsters)
    if (visual.healthBar && state.healthPercent !== undefined) {
      this.renderHealthBar(graphics, visual.healthBar, state);
    }
  }

  /**
   * Render a single shape
   */
  private renderShape(graphics: PIXI.Graphics, shape: Shape, state: EntityRenderState): void {
    // Apply shape offset
    const offset = shape.offset || { x: 0, y: 0 };

    // Calculate animation effects
    let animScale = 1.0;

    if (shape.pulseSpeed) {
      const pulse = Math.sin(this.time * shape.pulseSpeed);
      animScale = 1.0 + pulse * 0.1;
    }

    if (shape.scaleWithHealth && state.healthPercent !== undefined) {
      animScale *= 0.5 + state.healthPercent * 0.5; // Scale 50%-100% based on health
    }

    // Resolve dynamic colors
    const fillColor = this.resolveDynamicColor(shape.fill, state);
    const strokeColor = this.resolveDynamicColor(shape.stroke, state);

    // Set drawing style
    if (fillColor !== undefined) {
      graphics.beginFill(fillColor, shape.fillAlpha || 1.0);
    }

    if (strokeColor !== undefined) {
      graphics.lineStyle(shape.strokeWidth || 1, strokeColor, shape.strokeAlpha || 1.0);
    }

    // Draw shape based on type (with offset and scale)
    // NOTE: We don't handle rotation per-shape for now - it was causing position issues
    switch (shape.type) {
      case 'circle':
        this.drawCircle(graphics, shape, offset, animScale);
        break;
      case 'rect':
        this.drawRect(graphics, shape, offset, animScale);
        break;
      case 'polygon':
        this.drawPolygon(graphics, shape, offset, animScale);
        break;
      case 'line':
        this.drawLine(graphics, shape, offset, animScale);
        break;
      case 'arc':
        this.drawArc(graphics, shape, offset, animScale);
        break;
      case 'star':
        this.drawStar(graphics, shape, offset, animScale);
        break;
    }

    // End fill
    if (fillColor !== undefined) {
      graphics.endFill();
    }

    // Reset line style to prevent it from affecting subsequent shapes
    graphics.lineStyle(0, 0, 0);
  }

  /**
   * Draw circle shape
   */
  private drawCircle(
    graphics: PIXI.Graphics,
    shape: CircleShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    graphics.drawCircle(offset.x, offset.y, shape.radius * scale);
  }

  /**
   * Draw rectangle shape
   */
  private drawRect(
    graphics: PIXI.Graphics,
    shape: RectShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    if (shape.centered) {
      graphics.drawRect(
        offset.x - (shape.width * scale) / 2,
        offset.y - (shape.height * scale) / 2,
        shape.width * scale,
        shape.height * scale
      );
    } else {
      graphics.drawRect(offset.x, offset.y, shape.width * scale, shape.height * scale);
    }
  }

  /**
   * Draw polygon shape
   */
  private drawPolygon(
    graphics: PIXI.Graphics,
    shape: PolygonShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    // Apply offset and scale to points
    const scaledPoints = shape.points.map((p, i) => {
      if (i % 2 === 0) {
        return offset.x + p * scale;
      } else {
        return offset.y + p * scale;
      }
    });
    graphics.drawPolygon(scaledPoints);
  }

  /**
   * Draw line shape
   */
  private drawLine(
    graphics: PIXI.Graphics,
    shape: LineShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    graphics.moveTo(offset.x + shape.x1 * scale, offset.y + shape.y1 * scale);
    graphics.lineTo(offset.x + shape.x2 * scale, offset.y + shape.y2 * scale);
  }

  /**
   * Draw arc shape
   */
  private drawArc(
    graphics: PIXI.Graphics,
    shape: ArcShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    graphics.arc(
      offset.x,
      offset.y,
      shape.radius * scale,
      shape.startAngle,
      shape.endAngle,
      false
    );
  }

  /**
   * Draw star shape
   */
  private drawStar(
    graphics: PIXI.Graphics,
    shape: StarShape,
    offset: { x: number; y: number },
    scale: number
  ): void {
    const points: number[] = [];
    const angleStep = (Math.PI * 2) / shape.points;

    for (let i = 0; i < shape.points * 2; i++) {
      const angle = i * (angleStep / 2) - Math.PI / 2;
      const radius = i % 2 === 0 ? shape.radius * scale : shape.innerRadius * scale;
      points.push(offset.x + Math.cos(angle) * radius);
      points.push(offset.y + Math.sin(angle) * radius);
    }

    graphics.drawPolygon(points);
  }

  /**
   * Resolve dynamic color based on state
   */
  private resolveDynamicColor(
    color: number | 'dynamic' | undefined,
    state: EntityRenderState
  ): number | undefined {
    if (color === undefined) return undefined;
    if (typeof color === 'number') return color;

    // Dynamic color logic
    if (color === 'dynamic') {
      // Health-based gradient: green -> yellow -> red
      if (state.healthPercent !== undefined) {
        if (state.healthPercent > 0.6) return 0x00ff00;
        if (state.healthPercent > 0.3) return 0xffff00;
        return 0xff0000;
      }
    }

    return 0xffffff;
  }

  /**
   * Render health bar
   */
  private renderHealthBar(
    graphics: PIXI.Graphics,
    config: NonNullable<VisualDefinition['healthBar']>,
    state: EntityRenderState
  ): void {
    const { width, height, offsetY, backgroundColor, foregroundColor } = config;
    const healthPercent = state.healthPercent || 0;

    // Background
    graphics.beginFill(backgroundColor, 0.8);
    graphics.drawRect(-width / 2, offsetY, width, height);
    graphics.endFill();

    // Foreground (health bar)
    const fgColor =
      foregroundColor === 'gradient'
        ? this.resolveDynamicColor('dynamic', state)!
        : foregroundColor;

    graphics.beginFill(fgColor, 1.0);
    graphics.drawRect(-width / 2, offsetY, width * healthPercent, height);
    graphics.endFill();

    // Border
    graphics.lineStyle(1, 0x000000, 0.5);
    graphics.drawRect(-width / 2, offsetY, width, height);
  }

  /**
   * Render range indicator
   */
  private renderRangeIndicator(
    graphics: PIXI.Graphics,
    config: NonNullable<VisualDefinition['rangeIndicator']>,
    range: number
  ): void {
    graphics.lineStyle(1, config.color, config.alpha);
    graphics.drawCircle(0, 0, range);
  }
}
