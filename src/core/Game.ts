import { Grid } from './Grid';
import { GameLoop } from './GameLoop';
import { GameState, GameConfig, DEFAULT_GAME_CONFIG } from '../types/game';
import { Vector2 } from './math/Vector2';
import { AStarPathfinder } from './pathfinding/AStar';
import { TowerManager } from '../entities/towers/TowerManager';
import { MonsterManager } from '../entities/monsters/MonsterManager';
import { ProjectileManager } from '../entities/projectiles/ProjectileManager';
import { TargetingSystem } from '../systems/TargetingSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { AbilitySystem } from '../systems/AbilitySystem';
import { UpgradeSystem } from '../systems/UpgradeSystem';
import { WaveSystem } from '../systems/WaveSystem';
import { MONSTER_DEFINITIONS } from '../data/monsters';
import { useGameStore } from '../store/gameStore';
import { RunManager } from '../roguelike/RunManager';
import { RewardSystem } from '../roguelike/RewardSystem';
import { LevelManager } from '../systems/LevelManager';
import { LEVEL_DEFINITIONS } from '../data/levels';

/**
 * Main game controller that orchestrates all game systems
 */
export class Game {
  private gameLoop: GameLoop;
  private grid: Grid;
  private state: GameState = GameState.Menu;
  private time: number = 0;
  private lastDeltaTime: number = 1 / 60; // Track last deltaTime for renderer animations

  // Spawn and exit points
  private spawnPoint: Vector2;
  private exitPoint: Vector2;
  private checkpoints: Vector2[] = [];

  // Core systems
  private levelManager: LevelManager;
  private pathfinder: AStarPathfinder;
  private towerManager: TowerManager;
  private monsterManager: MonsterManager;
  private projectileManager: ProjectileManager;
  private targetingSystem: TargetingSystem;
  private combatSystem: CombatSystem;
  private abilitySystem: AbilitySystem;
  private upgradeSystem: UpgradeSystem;
  private waveSystem: WaveSystem;
  private runManager: RunManager;
  private rewardSystem: RewardSystem;

  constructor(
    private config: GameConfig = DEFAULT_GAME_CONFIG,
    private renderer?: any // PixiRenderer will be passed later
  ) {
    // Initialize grid
    this.grid = new Grid(
      this.config.gridWidth,
      this.config.gridHeight,
      this.config.cellSize
    );

    // Initialize level manager and load default level
    this.levelManager = new LevelManager(this.grid);
    const defaultLevel = LEVEL_DEFINITIONS.grasslands;
    if (!defaultLevel) {
      throw new Error('Default level "grasslands" not found');
    }
    const levelData = this.levelManager.loadLevel(defaultLevel);
    this.spawnPoint = levelData.spawnPoint;
    this.exitPoint = levelData.exitPoint;
    this.checkpoints = levelData.checkpoints;

    console.log('🗺️  Loaded level:', defaultLevel.name);
    console.log('  Spawn:', this.spawnPoint);
    console.log('  Exit:', this.exitPoint);
    console.log('  Checkpoints:', this.checkpoints.length);

    // Initialize pathfinding
    this.pathfinder = new AStarPathfinder(this.grid);

    // Initialize managers
    this.towerManager = new TowerManager(
      this.grid,
      this.pathfinder,
      this.spawnPoint,
      this.exitPoint,
      this.checkpoints
    );

    this.monsterManager = new MonsterManager(
      this.pathfinder,
      this.spawnPoint,
      this.exitPoint,
      this.checkpoints
    );

    this.projectileManager = new ProjectileManager();

    // Initialize systems
    this.targetingSystem = new TargetingSystem(this.monsterManager);

    this.combatSystem = new CombatSystem(
      this.towerManager,
      this.monsterManager,
      this.projectileManager,
      this.targetingSystem
    );

    this.abilitySystem = new AbilitySystem(
      this.monsterManager,
      this.towerManager
    );

    // Wire ability system into combat for on-hit ability triggering
    this.combatSystem.setAbilitySystem(this.abilitySystem);

    // Wire visual hit effects: combat system → renderer
    this.combatSystem.onDamageDealt = (x, y, damageType) => {
      if (this.renderer) {
        this.renderer.addHitEffect(x, y, damageType);
      }
    };

    // Wire visual AoE effects: ability system → renderer
    this.abilitySystem.onAoEEffect = (x, y, radius, damageType) => {
      if (this.renderer) {
        this.renderer.addAoEEffect(x, y, radius, damageType);
      }
    };

    // Wire floating text effects: combat system → renderer
    this.combatSystem.onShowDamage = (x, y, damage, damageType) => {
      if (this.renderer) {
        this.renderer.showDamage(x, y, damage, damageType);
      }
    };

    this.combatSystem.onShowGold = (x, y, gold) => {
      if (this.renderer) {
        this.renderer.showGold(x, y, gold);
      }
    };

    this.combatSystem.onShowLivesLost = (x, y) => {
      if (this.renderer) {
        this.renderer.showLivesLost(x, y);
      }
    };

    // Wire particle effects: combat system → renderer
    this.combatSystem.onImpactParticles = (x, y, damageType, directionX, directionY) => {
      if (this.renderer) {
        this.renderer.emitImpact(x, y, damageType, directionX, directionY);
      }
    };

    this.combatSystem.onExplosionParticles = (x, y, damageType) => {
      if (this.renderer) {
        this.renderer.emitExplosion(x, y, damageType);
      }
    };

    this.combatSystem.onGoldSparkles = (x, y) => {
      if (this.renderer) {
        this.renderer.emitGoldSparkles(x, y);
      }
    };

    this.upgradeSystem = new UpgradeSystem(this.towerManager, this.abilitySystem);

    this.waveSystem = new WaveSystem(this.monsterManager, MONSTER_DEFINITIONS);

    // Initialize roguelike systems
    this.runManager = new RunManager();
    this.rewardSystem = new RewardSystem(this.runManager);

    // Expose globally for access from stores and wave system
    (window as any).runManager = this.runManager;
    (window as any).rewardSystem = this.rewardSystem;

    // Initialize game loop
    this.gameLoop = new GameLoop(
      (deltaTime) => this.update(deltaTime),
      () => this.render()
    );
  }

  /**
   * Start the game loop (rendering and updates)
   * Game state is managed by the store - this just starts the loop
   */
  start(): void {
    console.log('🎮 Game loop starting...');
    console.log('  Grid:', this.grid.width, 'x', this.grid.height);
    console.log('  Spawn:', this.spawnPoint);
    console.log('  Exit:', this.exitPoint);
    console.log('  Renderer:', this.renderer ? 'initialized' : 'missing');

    this.gameLoop.start();
    console.log('  ✅ Game loop started (waiting for user to click START RUN)');
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state === GameState.Playing) {
      this.state = GameState.Paused;
    }
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.state === GameState.Paused) {
      this.state = GameState.Playing;
    }
  }

  /**
   * Stop the game
   */
  stop(): void {
    this.gameLoop.stop();
    this.state = GameState.Menu;
  }

  /**
   * Update game state (called at fixed intervals)
   */
  private update(deltaTime: number): void {
    const gameState = useGameStore.getState().gameState;
    if (gameState !== GameState.Playing) {
      return;
    }

    this.lastDeltaTime = deltaTime; // Track for renderer animations
    this.time += deltaTime;
    useGameStore.getState().setTime(this.time);

    // Update all game systems
    this.towerManager.update(deltaTime);
    this.monsterManager.update(deltaTime);
    this.projectileManager.update(deltaTime);
    this.combatSystem.update(deltaTime);
    this.abilitySystem.update(deltaTime);
    this.waveSystem.update(deltaTime);

    // Check for monsters that reached exit
    const monsters = this.monsterManager.getAllMonsters();
    for (const monster of monsters) {
      if (monster.hasReachedExit()) {
        console.log(`🎯 Game.update() detected monster ${monster.id} reached exit, calling combatSystem...`);
        this.combatSystem.onMonsterReachedExit(monster);
      }
    }
  }

  /**
   * Render the game
   */
  private render(): void {
    if (this.renderer) {
      this.renderer.render(this, this.lastDeltaTime);
    } else {
      console.warn('Renderer not available');
    }
  }

  /**
   * Game state getters
   */
  getState(): GameState {
    return useGameStore.getState().gameState;
  }

  getGrid(): Grid {
    return this.grid;
  }

  getTime(): number {
    return this.time;
  }

  getSpawnPoint(): Vector2 {
    return this.spawnPoint.clone();
  }

  getExitPoint(): Vector2 {
    return this.exitPoint.clone();
  }

  getCheckpoints(): Vector2[] {
    return this.checkpoints.map(cp => cp.clone());
  }

  /**
   * Manager getters
   */
  getTowerManager(): TowerManager {
    return this.towerManager;
  }

  getMonsterManager(): MonsterManager {
    return this.monsterManager;
  }

  getProjectileManager(): ProjectileManager {
    return this.projectileManager;
  }

  getPathfinder(): AStarPathfinder {
    return this.pathfinder;
  }

  getCombatSystem(): CombatSystem {
    return this.combatSystem;
  }

  getTargetingSystem(): TargetingSystem {
    return this.targetingSystem;
  }

  getAbilitySystem(): AbilitySystem {
    return this.abilitySystem;
  }

  getUpgradeSystem(): UpgradeSystem {
    return this.upgradeSystem;
  }

  getWaveSystem(): WaveSystem {
    return this.waveSystem;
  }

  /**
   * Reset game entities for a new run (keeps game loop running)
   */
  resetGame(): void {
    this.towerManager.clear();
    this.monsterManager.clear();
    this.projectileManager.clear();
    this.abilitySystem.clear();
    this.waveSystem.reset();
    this.time = 0;

    // Re-initialize grid (clear tower placements)
    this.grid = new Grid(
      this.config.gridWidth,
      this.config.gridHeight,
      this.config.cellSize
    );

    // Reload level
    this.levelManager = new LevelManager(this.grid);
    const defaultLevel = LEVEL_DEFINITIONS.grasslands;
    if (defaultLevel) {
      const levelData = this.levelManager.loadLevel(defaultLevel);
      this.spawnPoint = levelData.spawnPoint;
      this.exitPoint = levelData.exitPoint;
      this.checkpoints = levelData.checkpoints;
    }

    // Reinitialize pathfinder with clean grid
    this.pathfinder = new AStarPathfinder(this.grid);

    // Reinitialize managers with new grid/pathfinder
    this.towerManager = new TowerManager(
      this.grid,
      this.pathfinder,
      this.spawnPoint,
      this.exitPoint,
      this.checkpoints
    );
    this.monsterManager = new MonsterManager(
      this.pathfinder,
      this.spawnPoint,
      this.exitPoint,
      this.checkpoints
    );
    this.projectileManager = new ProjectileManager();

    // Reinitialize systems
    this.targetingSystem = new TargetingSystem(this.monsterManager);
    this.combatSystem = new CombatSystem(
      this.towerManager,
      this.monsterManager,
      this.projectileManager,
      this.targetingSystem
    );
    this.abilitySystem = new AbilitySystem(
      this.monsterManager,
      this.towerManager
    );
    this.combatSystem.setAbilitySystem(this.abilitySystem);
    this.combatSystem.onDamageDealt = (x, y, damageType) => {
      if (this.renderer) {
        this.renderer.addHitEffect(x, y, damageType);
      }
    };
    this.upgradeSystem = new UpgradeSystem(this.towerManager, this.abilitySystem);
    this.waveSystem = new WaveSystem(this.monsterManager, MONSTER_DEFINITIONS);

    // Reset roguelike systems
    this.runManager = new RunManager();
    this.rewardSystem = new RewardSystem(this.runManager);
    (window as any).runManager = this.runManager;
    (window as any).rewardSystem = this.rewardSystem;

    // Clear placement mode
    (window as any).selectedTowerForPlacement = null;

    console.log('🔄 Game reset complete');
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.gameLoop.stop();
    this.towerManager.clear();
    this.monsterManager.clear();
    this.projectileManager.clear();
    this.abilitySystem.clear();
    this.waveSystem.reset();
  }
}
