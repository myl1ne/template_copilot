/**
 * Asset Loader
 * Loads AI-generated sprites at runtime using PIXI.Assets
 */

import * as PIXI from 'pixi.js';

interface AssetManifestEntry {
  type: 'tower' | 'monster';
  path: string;
  prompt: string;
  cost: number;
  generatedAt: string;
}

interface AssetManifest {
  version: string;
  generatedAt: string;
  totalCost: number;
  entities: Record<string, AssetManifestEntry>;
}

export class AssetLoader {
  private manifest: AssetManifest | null = null;
  private loadedAssets = new Set<string>();
  private enabled: boolean;
  private loadingPromises: Map<string, Promise<PIXI.Texture | null>> = new Map();

  constructor() {
    // Check if GenAI assets are enabled via environment variable
    this.enabled = import.meta.env.VITE_ENABLE_GENAI_ASSETS === 'true';

    if (!this.enabled) {
      console.log('ℹ️  GenAI assets disabled (VITE_ENABLE_GENAI_ASSETS=false)');
    }
  }

  /**
   * Initialize asset loader by loading the manifest
   * Call this during game initialization
   */
  async initialize(): Promise<void> {
    if (!this.enabled) {
      return; // Feature disabled, skip initialization
    }

    try {
      const response = await fetch('/scripts/assetManifest.json');

      if (!response.ok) {
        console.warn(
          '⚠️  Asset manifest not found (run npm run generate:assets first)'
        );
        this.manifest = { version: '1.0', generatedAt: '', totalCost: 0, entities: {} };
        return;
      }

      this.manifest = await response.json();
      console.log(
        `📦 Loaded asset manifest: ${Object.keys(this.manifest.entities).length} entities available`
      );
      console.log(`💰 Total generation cost: $${this.manifest.totalCost.toFixed(2)}`);
    } catch (error) {
      console.warn(
        '⚠️  Failed to load asset manifest, using procedural art only:',
        error
      );
      this.manifest = { version: '1.0', generatedAt: '', totalCost: 0, entities: {} };
    }
  }

  /**
   * Check if entity has a generated sprite available
   */
  hasSprite(entityId: string): boolean {
    if (!this.enabled || !this.manifest) {
      return false;
    }

    return this.manifest.entities[entityId] !== undefined;
  }

  /**
   * Get sprite path for entity
   */
  getSpritePath(entityId: string): string | null {
    if (!this.enabled || !this.manifest) {
      return null;
    }

    return this.manifest.entities[entityId]?.path || null;
  }

  /**
   * Load sprite texture for entity
   * Returns texture if available, null if not found or loading failed
   * Handles concurrent loads for the same entity
   */
  async loadSprite(entityId: string): Promise<PIXI.Texture | null> {
    if (!this.hasSprite(entityId)) {
      return null;
    }

    // Check if already loaded
    if (this.loadedAssets.has(entityId)) {
      try {
        return PIXI.Assets.get(entityId);
      } catch {
        // Asset was unloaded, remove from set
        this.loadedAssets.delete(entityId);
      }
    }

    // Check if currently loading
    if (this.loadingPromises.has(entityId)) {
      return this.loadingPromises.get(entityId)!;
    }

    // Start loading
    const loadPromise = this._loadSpriteInternal(entityId);
    this.loadingPromises.set(entityId, loadPromise);

    try {
      const texture = await loadPromise;
      this.loadingPromises.delete(entityId);
      return texture;
    } catch (error) {
      this.loadingPromises.delete(entityId);
      throw error;
    }
  }

  /**
   * Internal sprite loading implementation
   */
  private async _loadSpriteInternal(
    entityId: string
  ): Promise<PIXI.Texture | null> {
    const path = this.getSpritePath(entityId);
    if (!path) {
      return null;
    }

    try {
      // Add to PIXI.Assets registry with entityId as alias (must be done before load)
      PIXI.Assets.add({ alias: entityId, src: path });

      // Load texture using the entityId alias
      const texture = await PIXI.Assets.load(entityId);

      this.loadedAssets.add(entityId);
      return texture;
    } catch (error) {
      console.warn(
        `⚠️  Failed to load sprite for ${entityId}, using procedural art:`,
        error
      );
      return null;
    }
  }

  /**
   * Preload multiple sprites (useful for common entities)
   * Returns array of successfully loaded textures
   */
  async preloadSprites(entityIds: string[]): Promise<PIXI.Texture[]> {
    const promises = entityIds.map((id) => this.loadSprite(id));
    const results = await Promise.allSettled(promises);

    const textures: PIXI.Texture[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        textures.push(result.value);
      }
    }

    return textures;
  }

  /**
   * Batch preload common sprites during game initialization
   * This reduces loading time when entities first spawn
   */
  async preloadCommonSprites(entityIds: string[]): Promise<void> {
    if (!this.enabled || !this.manifest) {
      return;
    }

    console.log(`🔄 Preloading ${entityIds.length} common sprites...`);

    const startTime = performance.now();
    const textures = await this.preloadSprites(entityIds);
    const duration = performance.now() - startTime;

    console.log(
      `✅ Preloaded ${textures.length}/${entityIds.length} sprites in ${duration.toFixed(0)}ms`
    );
  }

  /**
   * Check if sprite is currently loaded in memory
   */
  isLoaded(entityId: string): boolean {
    return this.loadedAssets.has(entityId);
  }

  /**
   * Unload sprite from memory (useful for memory management)
   */
  unloadSprite(entityId: string): void {
    if (!this.loadedAssets.has(entityId)) {
      return;
    }

    try {
      // Remove from PIXI.Assets cache
      PIXI.Assets.unload(entityId);
      this.loadedAssets.delete(entityId);
    } catch (error) {
      console.warn(`⚠️  Failed to unload sprite ${entityId}:`, error);
    }
  }

  /**
   * Get asset statistics
   */
  getStats(): {
    enabled: boolean;
    totalAssets: number;
    loadedAssets: number;
    totalCost: number;
  } {
    return {
      enabled: this.enabled,
      totalAssets: this.manifest ? Object.keys(this.manifest.entities).length : 0,
      loadedAssets: this.loadedAssets.size,
      totalCost: this.manifest?.totalCost || 0,
    };
  }
}
