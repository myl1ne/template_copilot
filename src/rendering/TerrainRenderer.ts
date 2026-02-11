/**
 * Procedural terrain texture generator for rich visual environments
 */

import * as PIXI from 'pixi.js';
import { CellState } from '../core/Grid';

interface TerrainTexture {
  texture: PIXI.Texture;
  animated?: boolean;
  animationSpeed?: number;
}

/**
 * Generates and manages procedural terrain textures
 */
export class TerrainRenderer {
  private textures: Map<CellState, TerrainTexture> = new Map();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  /**
   * Generate all terrain textures
   */
  generateTextures(): void {
    this.textures.set(CellState.Water, this.generateWaterTexture());
    this.textures.set(CellState.Rock, this.generateRockTexture());
    this.textures.set(CellState.Forest, this.generateForestTexture());
    this.textures.set(CellState.Lava, this.generateLavaTexture());
  }

  /**
   * Water: Blue gradient with animated sine waves
   */
  private generateWaterTexture(): TerrainTexture {
    const graphics = new PIXI.Graphics();
    const size = this.cellSize;

    // Base gradient (light blue to darker blue)
    const gradient = this.createVerticalGradient(size, [
      { offset: 0, color: 0x5588ff },
      { offset: 1, color: 0x3355cc },
    ]);
    graphics.beginTextureFill({ texture: gradient });
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    // Add wave pattern (horizontal sine waves)
    graphics.lineStyle(1, 0x6699ff, 0.4);
    for (let i = 0; i < 3; i++) {
      const yOffset = (i + 1) * (size / 4);
      for (let x = 0; x < size; x += 2) {
        const y = yOffset + Math.sin((x / size) * Math.PI * 2) * 2;
        if (x === 0) {
          graphics.moveTo(x, y);
        } else {
          graphics.lineTo(x, y);
        }
      }
    }

    // Add lighter highlights (water shimmer)
    graphics.beginFill(0x88bbff, 0.2);
    graphics.drawCircle(size * 0.3, size * 0.3, size * 0.15);
    graphics.drawCircle(size * 0.7, size * 0.6, size * 0.1);
    graphics.endFill();

    const texture = this.graphicsToTexture(graphics);
    graphics.destroy();

    return {
      texture,
      animated: true,
      animationSpeed: 0.5, // Slow wave animation
    };
  }

  /**
   * Rock: Gray blocks with darker outlines and shadow gradients
   */
  private generateRockTexture(): TerrainTexture {
    const graphics = new PIXI.Graphics();
    const size = this.cellSize;

    // Base gray with slight gradient
    const gradient = this.createVerticalGradient(size, [
      { offset: 0, color: 0x999999 },
      { offset: 1, color: 0x666666 },
    ]);
    graphics.beginTextureFill({ texture: gradient });
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    // Add 2-3 rock blocks with darker outlines
    const numRocks = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numRocks; i++) {
      const rockX = Math.random() * size * 0.6 + size * 0.1;
      const rockY = Math.random() * size * 0.6 + size * 0.1;
      const rockSize = size * (0.2 + Math.random() * 0.15);

      // Rock shadow
      graphics.beginFill(0x333333, 0.4);
      graphics.drawRect(rockX + 2, rockY + 2, rockSize, rockSize);
      graphics.endFill();

      // Rock body
      graphics.beginFill(0xaaaaaa);
      graphics.drawRect(rockX, rockY, rockSize, rockSize);
      graphics.endFill();

      // Rock outline
      graphics.lineStyle(1, 0x555555);
      graphics.drawRect(rockX, rockY, rockSize, rockSize);

      // Highlight
      graphics.lineStyle(0);
      graphics.beginFill(0xcccccc, 0.5);
      graphics.drawRect(rockX + 1, rockY + 1, rockSize * 0.4, rockSize * 0.4);
      graphics.endFill();
    }

    const texture = this.graphicsToTexture(graphics);
    graphics.destroy();

    return { texture };
  }

  /**
   * Forest: Dark green with 4-6 small circles (trees) with opacity variation
   */
  private generateForestTexture(): TerrainTexture {
    const graphics = new PIXI.Graphics();
    const size = this.cellSize;

    // Base dark green
    graphics.beginFill(0x1a5c1a);
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    // Add random grass patches (lighter green)
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      graphics.beginFill(0x228822, 0.3);
      graphics.drawCircle(x, y, size * 0.15);
      graphics.endFill();
    }

    // Add 4-6 tree circles with varying opacity
    const numTrees = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numTrees; i++) {
      const treeX = Math.random() * size;
      const treeY = Math.random() * size;
      const treeSize = size * (0.08 + Math.random() * 0.08);
      const opacity = 0.5 + Math.random() * 0.5;

      // Tree shadow
      graphics.beginFill(0x0a3a0a, opacity * 0.6);
      graphics.drawCircle(treeX + 1, treeY + 1, treeSize);
      graphics.endFill();

      // Tree body (darker green circle)
      graphics.beginFill(0x0d4d0d, opacity);
      graphics.drawCircle(treeX, treeY, treeSize);
      graphics.endFill();

      // Tree highlight (lighter green)
      graphics.beginFill(0x2a6a2a, opacity * 0.7);
      graphics.drawCircle(treeX - treeSize * 0.2, treeY - treeSize * 0.2, treeSize * 0.4);
      graphics.endFill();
    }

    const texture = this.graphicsToTexture(graphics);
    graphics.destroy();

    return { texture };
  }

  /**
   * Lava: Orange/red gradient with animated flow pattern
   */
  private generateLavaTexture(): TerrainTexture {
    const graphics = new PIXI.Graphics();
    const size = this.cellSize;

    // Base gradient (bright orange to dark red)
    const gradient = this.createVerticalGradient(size, [
      { offset: 0, color: 0xff6600 },
      { offset: 0.5, color: 0xff3300 },
      { offset: 1, color: 0xcc0000 },
    ]);
    graphics.beginTextureFill({ texture: gradient });
    graphics.drawRect(0, 0, size, size);
    graphics.endFill();

    // Add flowing crack patterns (bright orange veins)
    graphics.lineStyle(2, 0xffaa00, 0.8);
    for (let i = 0; i < 3; i++) {
      const startX = Math.random() * size;
      const startY = i * (size / 3);
      graphics.moveTo(startX, startY);

      for (let step = 0; step < 4; step++) {
        const x = startX + (Math.random() - 0.5) * size * 0.3;
        const y = startY + (step + 1) * (size / 4);
        graphics.lineTo(x, y);
      }
    }

    // Add hot spots (bright yellow-orange circles)
    for (let i = 0; i < 2; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = size * (0.1 + Math.random() * 0.1);

      // Glow effect (layered circles)
      graphics.beginFill(0xffff00, 0.2);
      graphics.drawCircle(x, y, radius * 1.5);
      graphics.endFill();

      graphics.beginFill(0xffaa00, 0.5);
      graphics.drawCircle(x, y, radius);
      graphics.endFill();

      graphics.beginFill(0xffff66, 0.8);
      graphics.drawCircle(x, y, radius * 0.5);
      graphics.endFill();
    }

    const texture = this.graphicsToTexture(graphics);
    graphics.destroy();

    return {
      texture,
      animated: true,
      animationSpeed: 1.0, // Moderate flow animation
    };
  }

  /**
   * Create vertical gradient texture
   */
  private createVerticalGradient(
    size: number,
    stops: Array<{ offset: number; color: number }>
  ): PIXI.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(0, 0, 0, size);
    for (const stop of stops) {
      gradient.addColorStop(stop.offset, this.hexToRgb(stop.color));
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return PIXI.Texture.from(canvas);
  }

  /**
   * Convert PIXI.Graphics to PIXI.Texture
   */
  private graphicsToTexture(graphics: PIXI.Graphics): PIXI.Texture {
    return this.app.renderer.generateTexture(graphics);
  }

  /**
   * Convert hex number to RGB string
   */
  private hexToRgb(hex: number): string {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Render terrain to container
   */
  renderTerrain(container: PIXI.Container, grid: any, gridWidth: number, gridHeight: number): void {
    // Clear previous terrain sprites
    container.removeChildren();

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cellState = grid.getCellState(x, y);
        const terrainData = this.textures.get(cellState);

        if (terrainData) {
          const sprite = new PIXI.Sprite(terrainData.texture);
          sprite.x = x * this.cellSize;
          sprite.y = y * this.cellSize;
          sprite.width = this.cellSize;
          sprite.height = this.cellSize;

          // Store animation data if animated
          if (terrainData.animated) {
            (sprite as any).isAnimated = true;
            (sprite as any).animationSpeed = terrainData.animationSpeed;
            (sprite as any).animationTime = 0;
          }

          container.addChild(sprite);
        }
      }
    }
  }

  /**
   * Update animated terrain (water waves, lava flow)
   */
  updateAnimations(container: PIXI.Container, deltaTime: number): void {
    for (const child of container.children) {
      const sprite = child as any;
      if (sprite.isAnimated) {
        sprite.animationTime = (sprite.animationTime || 0) + deltaTime * sprite.animationSpeed;

        // Subtle animation effect (could be enhanced with shaders)
        // For now, use simple alpha pulsing
        const pulse = Math.sin(sprite.animationTime * Math.PI * 2) * 0.1;
        sprite.alpha = 0.95 + pulse;
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    for (const [_, terrainData] of this.textures) {
      terrainData.texture.destroy();
    }
    this.textures.clear();
  }

  // Store PIXI app reference for texture generation
  private app!: PIXI.Application;

  /**
   * Set PIXI app reference (needed for generateTexture)
   */
  setApp(app: PIXI.Application): void {
    this.app = app;
  }
}
