/**
 * Tower Thumbnail Renderer
 * Generates static thumbnail images of towers for UI
 */

import * as PIXI from 'pixi.js';
import { TowerDefinition } from '../types/entities';
import { ProceduralArtRenderer } from './procedural/ProceduralArtRenderer';
import { EntityRenderState } from './procedural/types';
import { TOWER_SPRITE_CACHE } from './assets/towerSprites';

// Shared renderer for all thumbnails (prevents WebGL context exhaustion)
let sharedRenderer: PIXI.Renderer | null = null;

function getSharedRenderer(): PIXI.Renderer {
  if (!sharedRenderer) {
    sharedRenderer = new PIXI.Renderer({
      width: 256,
      height: 256,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });
  }
  return sharedRenderer;
}

/**
 * Render a tower thumbnail to a canvas element
 * @param definition Tower definition
 * @param size Thumbnail size (pixels)
 * @returns Canvas element with rendered thumbnail
 */
export function renderTowerThumbnail(definition: TowerDefinition, size: number = 64): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  // Use shared renderer (reuse single WebGL context)
  const renderer = getSharedRenderer();

  const container = new PIXI.Container();
  container.x = size / 2;
  container.y = size / 2;

  // Check if GenAI sprite exists
  const spriteKey = definition.spriteKey;
  const genAISprite = spriteKey ? TOWER_SPRITE_CACHE.get(spriteKey) : null;

  if (genAISprite) {
    // Use GenAI sprite
    const sprite = new PIXI.Sprite(genAISprite);
    sprite.anchor.set(0.5);

    // Scale to fit thumbnail
    const scale = (size * 0.8) / Math.max(sprite.width, sprite.height);
    sprite.scale.set(scale);

    container.addChild(sprite);
  } else if (definition.visual) {
    // Use procedural art
    const proceduralRenderer = new ProceduralArtRenderer();
    const graphics = new PIXI.Graphics();

    const renderState: EntityRenderState = {
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: 1.0,
      time: 0,
      isAttacking: false,
    };
    proceduralRenderer.renderEntity(graphics, definition.visual, renderState, definition.id);

    // Scale to fit thumbnail
    const bounds = graphics.getLocalBounds();
    const maxDimension = Math.max(bounds.width, bounds.height);
    const scale = (size * 0.7) / maxDimension;
    graphics.scale.set(scale);

    container.addChild(graphics);
  } else {
    // Fallback: render placeholder text
    const text = new PIXI.Text('?', {
      fontSize: size * 0.5,
      fill: 0xffffff,
      align: 'center',
    });
    text.anchor.set(0.5);
    container.addChild(text);
  }

  // Render to shared renderer
  renderer.render(container);

  // Copy renderer output to canvas
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(renderer.view as HTMLCanvasElement, 0, 0, size, size);

  // Cleanup container (but keep shared renderer)
  container.destroy({ children: true });

  return canvas;
}

/**
 * Render thumbnail to data URL for use in img src
 */
export function renderTowerThumbnailDataURL(definition: TowerDefinition, size: number = 64): string {
  const canvas = renderTowerThumbnail(definition, size);
  return canvas.toDataURL();
}
