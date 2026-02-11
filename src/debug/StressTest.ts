/**
 * Stress Test - Automated testing for performance and stability
 * Tests WebGL context stability under heavy load (many towers, particles, waves)
 */

import { Game } from '../core/Game';
import { TOWER_DEFINITIONS } from '../data/towers';
import { useGameStore } from '../store/gameStore';

export interface StressTestConfig {
  /** Number of towers to place in maze pattern */
  towerCount?: number;
  /** Number of waves to auto-run */
  waveCount?: number;
  /** Delay between waves (ms) */
  waveDelay?: number;
  /** Tower type to use for maze */
  towerType?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

export class StressTest {
  private game: Game;
  private intervalId: number | null = null;
  private currentWave: number = 0;
  private config: Required<StressTestConfig>;

  constructor(game: Game, config: StressTestConfig = {}) {
    this.game = game;
    this.config = {
      towerCount: config.towerCount ?? 30,
      waveCount: config.waveCount ?? 10,
      waveDelay: config.waveDelay ?? 8000,
      towerType: config.towerType ?? 'basic_archer',
      verbose: config.verbose ?? true,
    };
  }

  /**
   * Run the full stress test
   */
  async run(): Promise<void> {
    this.log('🧪 Starting Stress Test');
    this.log(`Configuration: ${JSON.stringify(this.config, null, 2)}`);

    // Step 1: Give player starting gold
    this.log('💰 Adding gold for tower construction...');
    useGameStore.getState().addGold(50000); // Lots of gold for building

    // Step 2: Build maze of towers
    this.log(`🏗️  Building maze with ${this.config.towerCount} towers...`);
    await this.buildTowerMaze();

    // Step 3: Log initial stats
    this.logGameStats('Initial State');

    // Step 4: Start auto-running waves
    this.log(`🌊 Starting ${this.config.waveCount} waves with ${this.config.waveDelay}ms delay...`);
    this.startAutoWaves();
  }

  /**
   * Build a maze of towers across the map
   */
  private async buildTowerMaze(): Promise<void> {
    const grid = this.game.getGrid();
    const towerManager = this.game.getTowerManager();
    const towerDef = TOWER_DEFINITIONS[this.config.towerType];

    if (!towerDef) {
      console.error(`❌ Tower type "${this.config.towerType}" not found!`);
      return;
    }

    const cellSize = grid.cellSize;
    let towersPlaced = 0;
    let attempts = 0;
    const maxAttempts = this.config.towerCount * 10;

    // Try to place towers in a grid pattern with some randomness
    while (towersPlaced < this.config.towerCount && attempts < maxAttempts) {
      attempts++;

      // Generate position (avoid edges, add some randomness)
      const x = (3 + Math.floor(Math.random() * (grid.width - 6))) * cellSize + cellSize / 2;
      const y = (3 + Math.floor(Math.random() * (grid.height - 6))) * cellSize + cellSize / 2;

      // Try to place tower
      const tower = towerManager.placeTower(towerDef, x, y);

      if (tower) {
        towersPlaced++;
        if (this.config.verbose && towersPlaced % 10 === 0) {
          this.log(`  Placed ${towersPlaced}/${this.config.towerCount} towers...`);
        }
      }
    }

    this.log(`✅ Successfully placed ${towersPlaced} towers (${attempts} attempts)`);
  }

  /**
   * Start automatically running waves
   */
  private startAutoWaves(): void {
    this.currentWave = 0;

    // Start first wave immediately
    this.runNextWave();

    // Schedule remaining waves
    this.intervalId = window.setInterval(() => {
      if (this.currentWave >= this.config.waveCount) {
        this.stop();
        return;
      }

      this.runNextWave();
    }, this.config.waveDelay);
  }

  /**
   * Run the next wave
   */
  private runNextWave(): void {
    this.currentWave++;

    if (this.currentWave > this.config.waveCount) {
      return;
    }

    this.log(`\n🌊 Starting Wave ${this.currentWave}/${this.config.waveCount}`);

    // Start the wave
    const waveSystem = this.game.getWaveSystem();
    waveSystem.startNextWave();

    // Log stats after wave starts
    setTimeout(() => {
      this.logGameStats(`Wave ${this.currentWave} Active`);
    }, 1000);
  }

  /**
   * Stop the stress test
   */
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.log('\n🏁 Stress Test Complete');
    this.logGameStats('Final State');
    this.logPerformanceStats();
  }

  /**
   * Log current game stats
   */
  private logGameStats(label: string): void {
    const towerManager = this.game.getTowerManager();
    const monsterManager = this.game.getMonsterManager();
    const projectileManager = this.game.getProjectileManager();
    const gameState = useGameStore.getState();

    this.log(`\n📊 ${label}:`);
    this.log(`  Gold: ${gameState.gold}`);
    this.log(`  Lives: ${gameState.lives}`);
    this.log(`  Score: ${gameState.score}`);
    this.log(`  Towers: ${towerManager.getAllTowers().length}`);
    this.log(`  Monsters: ${monsterManager.getAllMonsters().length}`);
    this.log(`  Projectiles: ${projectileManager.getAllProjectiles().length}`);

    // Count PIXI display objects in scene graph (key metric for GPU health)
    const renderer = (window as any).pixiRenderer;
    if (renderer?.getApp?.()) {
      const app = renderer.getApp();
      let totalObjects = 0;
      const countChildren = (obj: any): void => {
        totalObjects++;
        if (obj.children) {
          for (const child of obj.children) {
            countChildren(child);
          }
        }
      };
      countChildren(app.stage);
      this.log(`  PIXI Objects in scene: ${totalObjects}`);
    }

    // JS Heap
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.log(`  JS Heap: ${(memory.usedJSHeapSize / 1048576).toFixed(1)} MB`);
    }
  }

  /**
   * Log WebGL and performance stats
   */
  private logPerformanceStats(): void {
    this.log('\n⚡ Performance Stats:');

    // Check WebGL context
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (gl) {
        this.log(`  WebGL Context: ${gl.isContextLost() ? '❌ LOST' : '✅ Healthy'}`);

        // Log WebGL stats
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          this.log(`  GPU Vendor: ${vendor}`);
          this.log(`  GPU Renderer: ${renderer}`);
        }

        // Log memory info (if available)
        const memInfo = gl.getExtension('WEBGL_debug_memory');
        if (memInfo) {
          this.log(`  GPU Memory: ${memInfo}`);
        }
      } else {
        this.log('  WebGL Context: ❌ Not found');
      }
    }

    // Log browser performance
    if (performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      this.log(`  JS Heap Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
      this.log(`  JS Heap Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
      this.log(`  JS Heap Limit: ${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
    }

    // Log FPS if available
    if ((window as any).game && (window as any).game.getGameLoop) {
      const gameLoop = (window as any).game.getGameLoop();
      if (gameLoop && gameLoop.getFPS) {
        this.log(`  Current FPS: ${gameLoop.getFPS().toFixed(1)}`);
      }
    }
  }

  /**
   * Log with timestamp
   */
  private log(message: string): void {
    if (this.config.verbose) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] ${message}`);
    }
  }
}

/**
 * Global helper function to run stress test from console
 */
export function runStressTest(config?: StressTestConfig): StressTest | null {
  const game = (window as any).game;

  if (!game) {
    console.error('❌ Game instance not found! Make sure the game is running.');
    return null;
  }

  const test = new StressTest(game, config);
  test.run();

  // Store reference globally for easy stop
  (window as any).stressTest = test;

  console.log('💡 Stress test running. Use window.stressTest.stop() to stop manually.');

  return test;
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).runStressTest = runStressTest;
}
