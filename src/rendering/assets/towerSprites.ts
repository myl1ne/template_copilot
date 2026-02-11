/**
 * Tower Sprite Cache
 * Stores GenAI-generated tower sprites for rendering
 * Currently empty - falls back to procedural art
 */

import * as PIXI from 'pixi.js';

/**
 * Cache of loaded tower sprites
 * Key: spriteKey from TowerDefinition
 * Value: PIXI.Texture
 */
export const TOWER_SPRITE_CACHE = new Map<string, PIXI.Texture>();

/**
 * Load a tower sprite from URL
 * @param spriteKey Sprite identifier
 * @param url Image URL
 */
export async function loadTowerSprite(spriteKey: string, url: string): Promise<void> {
  const texture = await PIXI.Texture.fromURL(url);
  TOWER_SPRITE_CACHE.set(spriteKey, texture);
}

/**
 * Preload all tower sprites
 * TODO: Implement when GenAI sprite generation is added
 */
export async function preloadTowerSprites(): Promise<void> {
  // Future: Load sprites from assets folder or API
  console.log('Tower sprite preloading not yet implemented - using procedural art');
}
