import * as PIXI from 'pixi.js';
import { Game } from '../core/Game';
import { Grid } from '../core/Grid';
import { ProceduralArtRenderer } from './procedural/ProceduralArtRenderer';
import { AssetLoader } from './AssetLoader';
import { FloatingTextSystem } from './FloatingTextSystem';
import { TerrainRenderer } from './TerrainRenderer';
import { ParticleSystem } from './ParticleSystem';
import { CameraSystem } from './CameraSystem';
import { DAMAGE_TYPE_COLORS } from './procedural/colorPalettes';
import { DamageType, ProjectileType } from '../types/game';

/**
 * Active visual effect (fades over time)
 */
interface VisualEffect {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: number;
  alpha: number;
  lifetime: number;
  age: number;
}

/**
 * PixiJS renderer for the game
 */
export class PixiRenderer {
  private app: PIXI.Application | null = null;
  private worldContainer: PIXI.Container | null = null; // Container for game world (affected by camera)
  private layers: {
    background: PIXI.Container;
    grid: PIXI.Container;
    path: PIXI.Container;
    towers: PIXI.Container;
    monsters: PIXI.Container;
    projectiles: PIXI.Container;
    effects: PIXI.Container;
    ui: PIXI.Container;
  } | null = null;

  private gridGraphics: PIXI.Graphics | null = null;
  private artRenderer: ProceduralArtRenderer = new ProceduralArtRenderer();
  private assetLoader: AssetLoader = new AssetLoader();
  private floatingTextSystem: FloatingTextSystem = new FloatingTextSystem();
  private particleSystem: ParticleSystem = new ParticleSystem();
  private cameraSystem: CameraSystem = new CameraSystem();
  private terrainRenderer: TerrainRenderer | null = null;
  private terrainContainer: PIXI.Container | null = null;
  private terrainRendered: boolean = false;

  // Visual effects pool
  private activeEffects: VisualEffect[] = [];

  // === PERSISTENT GRAPHICS (reused every frame, never destroyed) ===
  // Entity graphics caches: Map<entityId, Graphics> — reused across frames
  private towerGraphicsCache: Map<string, PIXI.Graphics> = new Map();
  private monsterGraphicsCache: Map<string, PIXI.Graphics> = new Map();
  // Batch graphics: single Graphics per category (cleared + redrawn each frame)
  private projectileGraphics: PIXI.Graphics | null = null;
  private effectsGraphics: PIXI.Graphics | null = null;
  private previewGraphics: PIXI.Graphics | null = null;
  private specialTilesGraphics: PIXI.Graphics | null = null;
  private specialTilesRendered: boolean = false;

  // Building preview state
  private previewTowerDefinition: any = null;
  private previewPosition: { x: number; y: number } | null = null;
  private previewIsValid: boolean = false;

  /**
   * Initialize the renderer
   */
  async initialize(container: HTMLElement): Promise<void> {
    // Create PixiJS application (v7 style) - let PixiJS create the canvas
    this.app = new PIXI.Application({
      width: container.clientWidth || 1280,
      height: container.clientHeight || 720,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Append canvas to container
    container.appendChild(this.app.view as HTMLCanvasElement);

    // Create world container (affected by camera)
    this.worldContainer = new PIXI.Container();
    this.app.stage.addChild(this.worldContainer);

    // Create rendering layers (back to front)
    this.layers = {
      background: new PIXI.Container(),
      grid: new PIXI.Container(),
      path: new PIXI.Container(),
      towers: new PIXI.Container(),
      monsters: new PIXI.Container(),
      projectiles: new PIXI.Container(),
      effects: new PIXI.Container(),
      ui: new PIXI.Container(),
    };

    // Add game world layers to world container (affected by camera)
    this.worldContainer.addChild(this.layers.background);
    this.worldContainer.addChild(this.layers.grid);
    this.worldContainer.addChild(this.layers.path);
    this.worldContainer.addChild(this.layers.towers);
    this.worldContainer.addChild(this.layers.monsters);
    this.worldContainer.addChild(this.layers.projectiles);
    this.worldContainer.addChild(this.layers.effects);

    // Add UI layer directly to stage (not affected by camera)
    this.app.stage.addChild(this.layers.ui);

    // Create grid graphics
    this.gridGraphics = new PIXI.Graphics();
    this.layers.grid.addChild(this.gridGraphics);

    // Initialize terrain renderer with procedural textures
    this.terrainRenderer = new TerrainRenderer(32); // 32 = cellSize
    this.terrainRenderer.setApp(this.app);
    this.terrainRenderer.generateTextures();

    // Create terrain container (rendered under grid)
    this.terrainContainer = new PIXI.Container();
    this.layers.grid.addChildAt(this.terrainContainer, 0); // Add as first child (behind gridGraphics)

    // Create persistent batch Graphics objects (reused every frame via .clear())
    this.projectileGraphics = new PIXI.Graphics();
    this.layers.projectiles.addChild(this.projectileGraphics);
    this.effectsGraphics = new PIXI.Graphics();
    this.layers.effects.addChild(this.effectsGraphics);
    this.previewGraphics = new PIXI.Graphics();
    this.layers.effects.addChild(this.previewGraphics);
    this.specialTilesGraphics = new PIXI.Graphics();
    this.layers.path.addChild(this.specialTilesGraphics);

    // WebGL context loss recovery
    const canvas = this.app.view as HTMLCanvasElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('⚠️ WebGL context lost! Attempting recovery...');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      console.log('✅ WebGL context restored');
      // Force re-render terrain and special tiles on next frame
      this.terrainRendered = false;
      this.specialTilesRendered = false;
    });

    // Initialize GenAI asset loader
    await this.assetLoader.initialize();

    // NEW: Set asset loader on procedural art renderer
    this.artRenderer.setAssetLoader(this.assetLoader);

    // NEW: Preload common sprites (starting towers + early monsters)
    await this.assetLoader.preloadCommonSprites([
      // Common starting towers
      'basic_archer',
      'sniper',
      'fire_mage',
      'frost_shard',
      // Early wave monsters
      'corrupted_hound',
      'twisted_warrior',
      'corrupted_swarm',
    ]);
  }

  /**
   * Add a hit/impact visual effect
   */
  addHitEffect(x: number, y: number, damageType: DamageType): void {
    const color = DAMAGE_TYPE_COLORS[damageType] ?? 0xffffff;
    this.activeEffects.push({
      x,
      y,
      radius: 2,
      maxRadius: 15,
      color,
      alpha: 0.8,
      lifetime: 0.3,
      age: 0,
    });
  }

  /**
   * Add an AoE ability effect
   */
  addAoEEffect(x: number, y: number, radius: number, damageType: DamageType): void {
    const color = DAMAGE_TYPE_COLORS[damageType] ?? 0xffffff;
    this.activeEffects.push({
      x,
      y,
      radius: 0,
      maxRadius: radius,
      color,
      alpha: 0.4,
      lifetime: 0.5,
      age: 0,
    });
  }

  /**
   * Show floating damage number
   */
  showDamage(x: number, y: number, damage: number, damageType: DamageType): void {
    this.floatingTextSystem.showDamage(x, y, damage, damageType);
  }

  /**
   * Show floating gold reward
   */
  showGold(x: number, y: number, gold: number): void {
    this.floatingTextSystem.showGold(x, y, gold);
  }

  /**
   * Show floating lives lost
   */
  showLivesLost(x: number, y: number): void {
    this.floatingTextSystem.showLivesLost(x, y);
  }

  /**
   * Emit explosion particles
   */
  emitExplosion(x: number, y: number, damageType: DamageType): void {
    this.particleSystem.emitExplosion(x, y, damageType);
  }

  /**
   * Emit impact particles
   */
  emitImpact(x: number, y: number, damageType: DamageType, directionX?: number, directionY?: number): void {
    this.particleSystem.emitImpact(x, y, damageType, directionX, directionY);
  }

  /**
   * Emit gold sparkles
   */
  emitGoldSparkles(x: number, y: number): void {
    this.particleSystem.emitGoldSparkles(x, y);
  }

  /**
   * Emit status trail particles
   */
  emitStatusTrail(x: number, y: number, statusType: 'burn' | 'freeze' | 'stun'): void {
    this.particleSystem.emitStatusTrail(x, y, statusType);
  }

  /**
   * Set building preview (tower placement preview)
   */
  setPreview(towerDefinition: any, x: number, y: number, isValid: boolean): void {
    this.previewTowerDefinition = towerDefinition;
    this.previewPosition = { x, y };
    this.previewIsValid = isValid;
  }

  /**
   * Clear building preview
   */
  clearPreview(): void {
    this.previewTowerDefinition = null;
    this.previewPosition = null;
    this.previewIsValid = false;
  }

  /**
   * Render the game
   */
  render(game: Game, deltaTime: number = 1 / 60): void {
    if (!this.app || !this.layers || !this.gridGraphics) {
      return;
    }

    // Update art renderer animation time
    this.artRenderer.update(deltaTime);

    // Update floating text system
    this.floatingTextSystem.update(deltaTime);

    // Update particle system
    this.particleSystem.update(deltaTime);

    // Update camera system
    this.cameraSystem.update(deltaTime);

    // Apply camera transform to world container
    if (this.worldContainer) {
      this.cameraSystem.apply(this.worldContainer);
    }

    // Update terrain animations (water, lava)
    if (this.terrainRenderer && this.terrainContainer) {
      this.terrainRenderer.updateAnimations(this.terrainContainer, deltaTime);
    }

    // Clear batch graphics (cheap: just clears draw commands, no GPU deallocation)
    if (this.projectileGraphics) this.projectileGraphics.clear();
    if (this.effectsGraphics) this.effectsGraphics.clear();
    if (this.previewGraphics) this.previewGraphics.clear();
    // Remove children from preview (ghost tower Graphics)
    if (this.previewGraphics) {
      this.previewGraphics.removeChildren().forEach(c => c.destroy({ children: true }));
    }

    // Render grid
    this.renderGrid(game.getGrid());

    // Render special tiles (spawn, exit, checkpoints)
    this.renderSpecialTiles(game);

    // Render game elements
    this.renderTowers(game);
    this.renderMonsters(game);
    this.renderProjectiles(game);
    this.renderBuildingPreview(game);
    this.renderEffects(deltaTime);

    // Render floating text (on top of effects)
    this.floatingTextSystem.render(this.layers.effects);
  }

  /**
   * Render all towers (reuses cached Graphics per tower ID)
   */
  private renderTowers(game: Game): void {
    if (!this.layers) return;

    const towers = game.getTowerManager().getAllTowers();
    const grid = game.getGrid();

    // Track which tower IDs are still alive this frame
    const aliveTowerIds = new Set<string>();

    for (const tower of towers) {
      const towerDef = tower.definition;
      const towerId = tower.id;
      aliveTowerIds.add(towerId);

      // Get or create cached Graphics for this tower
      let graphics = this.towerGraphicsCache.get(towerId);
      if (!graphics) {
        graphics = new PIXI.Graphics();
        this.towerGraphicsCache.set(towerId, graphics);
        this.layers.towers.addChild(graphics);
      }

      if (!towerDef || !towerDef.visual) {
        this.renderTowerFallback(tower, graphics);
        continue;
      }

      // Calculate render position (centered for multi-cell towers)
      const size = towerDef.size || 1;
      const offset = (size - 1) * grid.cellSize / 2;
      const renderPosition = {
        x: tower.position.x + offset,
        y: tower.position.y + offset,
      };

      // Calculate rotation towards target (from center of tower footprint)
      let rotation = 0;
      if (tower.currentTarget) {
        const dx = tower.currentTarget.position.x - renderPosition.x;
        const dy = tower.currentTarget.position.y - renderPosition.y;
        rotation = Math.atan2(dy, dx);
      }

      // Create render state
      const state = {
        position: renderPosition,
        rotation,
        scale: 1.0,
        isAttacking: tower.timeSinceLastAttack < 0.2,
        level: tower.level,
        range: tower.range,
        time: this.artRenderer.getTime(),
        timeSinceLastAttack: tower.timeSinceLastAttack,
      };

      // Render using procedural art system (reuses same graphics object)
      this.artRenderer.renderEntity(graphics, towerDef.visual, state, towerDef.id);
    }

    // Remove Graphics for towers that no longer exist
    for (const [towerId, graphics] of this.towerGraphicsCache) {
      if (!aliveTowerIds.has(towerId)) {
        this.layers.towers.removeChild(graphics);
        graphics.destroy({ children: true });
        this.towerGraphicsCache.delete(towerId);
      }
    }
  }

  /**
   * Fallback rendering for towers without visual definitions
   */
  private renderTowerFallback(tower: any, graphics: PIXI.Graphics): void {
    graphics.clear();
    graphics.removeChildren().forEach(c => c.destroy({ children: true }));

    // Calculate render position (centered for multi-cell towers)
    const size = tower.definition?.size || 1;
    const cellSize = 32; // Grid cell size
    const offset = (size - 1) * cellSize / 2;

    graphics.lineStyle(1, 0x4488ff, 0.2);
    graphics.drawCircle(0, 0, tower.range);

    // Scale rect size for 2x2 towers
    const rectSize = 24 * size;
    const innerSize = 16 * size;

    graphics.beginFill(0x4488ff);
    graphics.drawRect(-rectSize / 2, -rectSize / 2, rectSize, rectSize);
    graphics.endFill();

    graphics.beginFill(0x88bbff);
    graphics.drawRect(-innerSize / 2, -innerSize / 2, innerSize, innerSize);
    graphics.endFill();

    graphics.x = tower.position.x + offset;
    graphics.y = tower.position.y + offset;
  }

  /**
   * Render all monsters with status effect indicators (reuses cached Graphics)
   */
  private renderMonsters(game: Game): void {
    if (!this.layers) return;

    const monsters = game.getMonsterManager().getAllMonsters();

    // Track which monster IDs are alive this frame
    const aliveMonsterIds = new Set<string>();

    for (const monster of monsters) {
      const monsterDef = monster.definition;
      const monsterId = monster.id;
      aliveMonsterIds.add(monsterId);

      // Get or create cached Graphics for this monster
      let graphics = this.monsterGraphicsCache.get(monsterId);
      if (!graphics) {
        graphics = new PIXI.Graphics();
        this.monsterGraphicsCache.set(monsterId, graphics);
        this.layers.monsters.addChild(graphics);
      }

      if (!monsterDef || !monsterDef.visual) {
        this.renderMonsterFallback(monster, graphics);
        continue;
      }

      const healthPercent = Math.max(0, Math.min(1, monster.health / monster.maxHealth));

      const state = {
        position: monster.position,
        rotation: monster.rotation,
        scale: monster.scale || 1.0,
        tint: monster.tint,
        healthPercent,
        canFly: monster.canFly,
        time: this.artRenderer.getTime(),
      };

      // Render using procedural art system (reuses same graphics object)
      this.artRenderer.renderEntity(graphics, monsterDef.visual, state, monsterDef.id);

      // Status effect visual indicators
      if (monster.isSlowed) {
        const scale = monster.scale || 1;
        const cx = monster.position.x;
        const cy = monster.position.y;
        graphics.beginFill(0x00ccff, 0.15);
        graphics.drawCircle(cx, cy, 16 * scale);
        graphics.endFill();
        graphics.lineStyle(3, 0x00ccff, 0.8);
        graphics.drawCircle(cx, cy, 14 * scale);
        const time = this.artRenderer.getTime();
        for (let s = 0; s < 4; s++) {
          const angle = (s * Math.PI / 2) + time * 0.5;
          const inner = 14 * scale;
          const outer = 19 * scale;
          graphics.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
          graphics.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        }
      }

      if (monster.isStunned) {
        const scale = monster.scale || 1;
        const cx = monster.position.x;
        const cy = monster.position.y;
        const time = this.artRenderer.getTime();
        const pulse = 0.6 + Math.sin(time * 10) * 0.4;
        graphics.beginFill(0xffff00, 0.12 * pulse);
        graphics.drawCircle(cx, cy, 18 * scale);
        graphics.endFill();
        graphics.lineStyle(3, 0xffff00, pulse);
        graphics.drawCircle(cx, cy, 16 * scale);
        for (let s = 0; s < 3; s++) {
          const angle = (s * Math.PI * 2 / 3) + time * 3;
          const dist = 12 * scale;
          const sx = cx + Math.cos(angle) * dist;
          const sy = cy + Math.sin(angle) * dist;
          const r = 3 * scale;
          graphics.beginFill(0xffff00, pulse);
          graphics.drawPolygon([sx, sy - r, sx + r, sy, sx, sy + r, sx - r, sy]);
          graphics.endFill();
        }
      }

      // Render health bar
      const barWidth = 30;
      const barHeight = 4;
      const barY = -32;

      graphics.beginFill(0x330000);
      graphics.drawRect(-barWidth / 2, barY, barWidth, barHeight);
      graphics.endFill();

      let healthColor = 0x00ff00;
      if (healthPercent < 0.6) healthColor = 0xffff00;
      if (healthPercent < 0.3) healthColor = 0xff0000;

      graphics.beginFill(healthColor);
      graphics.drawRect(-barWidth / 2, barY, barWidth * healthPercent, barHeight);
      graphics.endFill();
    }

    // Remove Graphics for monsters that no longer exist (dead or despawned)
    for (const [monsterId, graphics] of this.monsterGraphicsCache) {
      if (!aliveMonsterIds.has(monsterId)) {
        this.layers.monsters.removeChild(graphics);
        graphics.destroy({ children: true });
        this.monsterGraphicsCache.delete(monsterId);
      }
    }
  }

  /**
   * Fallback rendering for monsters without visual definitions
   */
  private renderMonsterFallback(monster: any, graphics: PIXI.Graphics): void {
    graphics.clear();
    graphics.removeChildren().forEach(c => c.destroy({ children: true }));

    const color = monster.canFly ? 0xff88ff : 0xff4444;
    graphics.beginFill(color);
    graphics.drawCircle(0, 0, 10 * (monster.scale || 1));
    graphics.endFill();

    const healthPercent = monster.health / monster.maxHealth;
    const barWidth = 20;
    const barHeight = 3;
    graphics.beginFill(0x330000);
    graphics.drawRect(-barWidth / 2, -18, barWidth, barHeight);
    graphics.endFill();

    graphics.beginFill(0x00ff00);
    graphics.drawRect(-barWidth / 2, -18, barWidth * healthPercent, barHeight);
    graphics.endFill();

    graphics.x = monster.position.x;
    graphics.y = monster.position.y;

    if (monster.tint !== undefined) {
      graphics.tint = monster.tint;
    }
  }

  /**
   * Render projectiles with damage-type colors (single shared Graphics)
   */
  private renderProjectiles(game: Game): void {
    if (!this.projectileGraphics) return;

    const g = this.projectileGraphics;
    // g.clear() already called at start of render()

    const projectiles = game.getProjectileManager().getAllProjectiles();

    for (const projectile of projectiles) {
      const color = DAMAGE_TYPE_COLORS[projectile.damageType] ?? 0xffff00;

      if (projectile.projectileType === ProjectileType.Laser) {
        g.lineStyle(2, color, 0.8);
        g.moveTo(projectile.source.position.x, projectile.source.position.y);
        g.lineTo(projectile.position.x, projectile.position.y);
        g.beginFill(color, 1);
        g.drawCircle(projectile.position.x, projectile.position.y, 3);
        g.endFill();
      } else {
        const px = projectile.position.x;
        const py = projectile.position.y;
        const size = 3;

        g.beginFill(color, 1);
        g.drawCircle(px, py, size);
        g.endFill();

        g.beginFill(color, 0.3);
        g.drawCircle(px, py, size + 2);
        g.endFill();

        const trailLength = 12;
        const angle = Math.atan2(projectile.velocity.y, projectile.velocity.x);
        const dx = -Math.cos(angle) * trailLength;
        const dy = -Math.sin(angle) * trailLength;
        g.lineStyle(2, color, 0.4);
        g.moveTo(px, py);
        g.lineTo(px + dx, py + dy);
      }
    }
  }

  /**
   * Render building preview (uses persistent previewGraphics)
   */
  private renderBuildingPreview(game: Game): void {
    if (!this.previewGraphics || !this.previewTowerDefinition || !this.previewPosition) {
      return;
    }

    const g = this.previewGraphics;
    // g.clear() and removeChildren already called at start of render()

    const towerDef = this.previewTowerDefinition;
    const grid = game.getGrid();
    const gridPos = grid.worldToGrid(this.previewPosition.x, this.previewPosition.y);
    const worldPos = grid.gridToWorld(gridPos.x, gridPos.y);
    const size = towerDef.size || 1;

    // Draw footprint cells
    const cellSize = grid.cellSize;
    const footprintColor = this.previewIsValid ? 0x00ff00 : 0xff0000;
    g.beginFill(footprintColor, 0.15);
    g.lineStyle(2, footprintColor, 0.5);

    for (let dy = 0; dy < size; dy++) {
      for (let dx = 0; dx < size; dx++) {
        const cx = gridPos.x + dx;
        const cy = gridPos.y + dy;
        const wx = cx * cellSize;
        const wy = cy * cellSize;
        g.drawRect(wx, wy, cellSize, cellSize);
      }
    }
    g.endFill();

    // Draw range indicator circle
    if (towerDef.baseRange) {
      g.lineStyle(2, footprintColor, 0.3);
      g.drawCircle(worldPos.x, worldPos.y, towerDef.baseRange);
    }

    // Draw ghost tower (semi-transparent)
    if (towerDef.visual) {
      const towerGraphics = new PIXI.Graphics();
      const state = {
        position: worldPos,
        rotation: 0,
        scale: 1.0,
        isAttacking: false,
        level: 1,
        range: towerDef.baseRange,
        time: this.artRenderer.getTime(),
        timeSinceLastAttack: 0,
      };

      this.artRenderer.renderEntity(towerGraphics, towerDef.visual, state, towerDef.id);
      towerGraphics.alpha = 0.6;
      towerGraphics.tint = footprintColor;

      g.addChild(towerGraphics);
    } else {
      g.beginFill(footprintColor, 0.3);
      g.drawRect(
        worldPos.x - cellSize / 2,
        worldPos.y - cellSize / 2,
        cellSize * size,
        cellSize * size
      );
      g.endFill();
    }
  }

  /**
   * Render and update visual effects (uses persistent effectsGraphics)
   */
  private renderEffects(deltaTime: number): void {
    if (!this.effectsGraphics || !this.layers) return;

    const g = this.effectsGraphics;
    // g.clear() already called at start of render()

    // Render AoE circles into single shared Graphics
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i]!;
      effect.age += deltaTime;

      if (effect.age >= effect.lifetime) {
        this.activeEffects.splice(i, 1);
        continue;
      }

      const progress = effect.age / effect.lifetime;
      const currentRadius = effect.radius + (effect.maxRadius - effect.radius) * progress;
      const currentAlpha = effect.alpha * (1 - progress);

      g.lineStyle(2, effect.color, currentAlpha);
      g.drawCircle(effect.x, effect.y, currentRadius);

      if (effect.maxRadius > 20) {
        g.beginFill(effect.color, currentAlpha * 0.3);
        g.drawCircle(effect.x, effect.y, currentRadius);
        g.endFill();
      }
    }

    // Render particles (into its own persistent Graphics)
    this.particleSystem.render(this.layers.effects);
  }

  /**
   * Render the grid
   */
  private renderGrid(grid: Grid): void {
    if (!this.gridGraphics) return;

    this.gridGraphics.clear();

    const cellSize = grid.cellSize;
    const width = grid.width;
    const height = grid.height;

    // Render terrain ONCE on first call (terrain is static, doesn't change)
    if (!this.terrainRendered && this.terrainRenderer && this.terrainContainer) {
      this.terrainRenderer.renderTerrain(this.terrainContainer, grid, width, height);
      this.terrainRendered = true;
    }

    // Set line style for grid
    this.gridGraphics.lineStyle(1, 0x2a2a4e, 0.3);

    // Draw vertical lines
    for (let x = 0; x <= width; x++) {
      this.gridGraphics.moveTo(x * cellSize, 0);
      this.gridGraphics.lineTo(x * cellSize, height * cellSize);
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y++) {
      this.gridGraphics.moveTo(0, y * cellSize);
      this.gridGraphics.lineTo(width * cellSize, y * cellSize);
    }
  }

  /**
   * Render special tiles (spawn, exit, checkpoints) — only once (static)
   */
  private renderSpecialTiles(game: Game): void {
    if (!this.specialTilesGraphics || this.specialTilesRendered) return;

    const g = this.specialTilesGraphics;
    g.clear();

    const grid = game.getGrid();
    const cellSize = grid.cellSize;

    // Render spawn point (green circle)
    const spawn = game.getSpawnPoint();
    g.beginFill(0x00ff00, 0.3);
    g.drawCircle(spawn.x, spawn.y, cellSize * 0.4);
    g.endFill();
    g.lineStyle(2, 0x00ff00, 1);
    g.drawCircle(spawn.x, spawn.y, cellSize * 0.4);

    // Render exit point (red circle)
    const exit = game.getExitPoint();
    g.beginFill(0xff0000, 0.3);
    g.drawCircle(exit.x, exit.y, cellSize * 0.4);
    g.endFill();
    g.lineStyle(2, 0xff0000, 1);
    g.drawCircle(exit.x, exit.y, cellSize * 0.4);

    // Render checkpoints (yellow diamonds)
    const checkpoints = game.getCheckpoints();
    g.lineStyle(2, 0xffff00, 1);
    for (const checkpoint of checkpoints) {
      g.beginFill(0xffff00, 0.3);
      const size = cellSize * 0.3;
      g.drawPolygon([
        checkpoint.x, checkpoint.y - size,
        checkpoint.x + size, checkpoint.y,
        checkpoint.x, checkpoint.y + size,
        checkpoint.x - size, checkpoint.y
      ]);
      g.endFill();
    }

    this.specialTilesRendered = true;
  }

  /**
   * Resize the renderer
   */
  resize(width: number, height: number): void {
    if (this.app) {
      this.app.renderer.resize(width, height);
    }
  }

  /**
   * Get the PixiJS application
   */
  getApp(): PIXI.Application | null {
    return this.app;
  }

  /**
   * Get a specific layer
   */
  getLayer(name: keyof NonNullable<typeof this.layers>): PIXI.Container | null {
    return this.layers ? this.layers[name] : null;
  }

  /**
   * Get camera system (for event handling)
   */
  getCamera(): CameraSystem {
    return this.cameraSystem;
  }

  /**
   * Center camera on grid
   */
  centerCameraOnGrid(grid: Grid): void {
    if (!this.app) return;

    const worldWidth = grid.width * grid.cellSize;
    const worldHeight = grid.height * grid.cellSize;
    const viewportWidth = this.app.view.width;
    const viewportHeight = this.app.view.height;

    this.cameraSystem.reset(viewportWidth, viewportHeight, worldWidth, worldHeight);
  }

  /**
   * Convert screen coordinates to world coordinates (accounting for camera)
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return this.cameraSystem.screenToWorld(screenX, screenY);
  }

  /**
   * Cleanup
   */
  destroy(): void {
    // Clean up terrain renderer
    if (this.terrainRenderer) {
      this.terrainRenderer.destroy();
      this.terrainRenderer = null;
    }
    this.terrainContainer = null;
    this.terrainRendered = false;

    // Clean up entity graphics caches
    for (const [, g] of this.towerGraphicsCache) {
      g.destroy({ children: true });
    }
    this.towerGraphicsCache.clear();

    for (const [, g] of this.monsterGraphicsCache) {
      g.destroy({ children: true });
    }
    this.monsterGraphicsCache.clear();

    // Clean up persistent graphics
    this.projectileGraphics = null;
    this.effectsGraphics = null;
    this.previewGraphics = null;
    this.specialTilesGraphics = null;
    this.specialTilesRendered = false;

    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = null;
    }
    this.layers = null;
    this.gridGraphics = null;
    this.activeEffects = [];
  }
}
