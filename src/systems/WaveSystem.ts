/**
 * System for managing wave spawning and progression
 */

import { MonsterManager } from '../entities/monsters/MonsterManager';
import { MonsterDefinition } from '../types/entities';
import { useGameStore } from '../store/gameStore';
import { useRunStore } from '../store/runStore';
import { GameState } from '../types/game';
import { TOWER_DEFINITIONS } from '../data/towers';
import { getWaveDefinition } from '../data/waves';

export interface MonsterSpawn {
  monsterId: string;
  count: number;
  spawnDelay: number; // Delay between each spawn in this group (seconds)
}

export interface WaveDefinition {
  waveNumber: number;
  isBossWave: boolean;
  spawns: MonsterSpawn[];
  bossId?: string;
  bossMinions?: MonsterSpawn[];
}

export interface WaveState {
  isActive: boolean;
  currentWave: number;
  spawnQueue: { monster: MonsterDefinition; spawnTime: number }[];
  timeSinceLastSpawn: number;
  monstersSpawned: number;
  totalMonstersInWave: number;
}

/**
 * Wave system manages wave generation, spawning, and progression
 */
export class WaveSystem {
  private waveState: WaveState = {
    isActive: false,
    currentWave: 0,
    spawnQueue: [],
    timeSinceLastSpawn: 0,
    monstersSpawned: 0,
    totalMonstersInWave: 0,
  };

  // private timeBetweenWaves: number = 10; // TODO: Implement wave timer // Seconds between waves

  constructor(
    private monsterManager: MonsterManager,
    private allMonsterDefinitions: Record<string, MonsterDefinition>
  ) {}

  /**
   * Start the next wave
   */
  startNextWave(): boolean {
    if (this.waveState.isActive) {
      return false; // Wave already in progress
    }

    // Check if there are any monsters still alive
    if (this.monsterManager.getAllMonsters().length > 0) {
      return false; // Can't start new wave until all monsters are dead/escaped
    }

    // Increment wave number
    this.waveState.currentWave++;
    useGameStore.getState().setCurrentWave(this.waveState.currentWave);

    // Generate wave
    const waveDefinition = this.generateWave(this.waveState.currentWave);

    // Build spawn queue
    this.buildSpawnQueue(waveDefinition);

    // Mark wave as active
    this.waveState.isActive = true;
    this.waveState.timeSinceLastSpawn = 0;
    this.waveState.monstersSpawned = 0;

    // Set game state
    useGameStore.getState().setGameState(GameState.Playing);

    console.log(
      `🌊 Wave ${this.waveState.currentWave} started! ${this.waveState.totalMonstersInWave} monsters`
    );

    return true;
  }

  /**
   * Update wave spawning
   */
  update(deltaTime: number): void {
    if (!this.waveState.isActive) {
      return;
    }

    this.waveState.timeSinceLastSpawn += deltaTime;

    // Process spawn queue — spawnTime values are absolute (from wave start)
    while (this.waveState.spawnQueue.length > 0) {
      const nextSpawn = this.waveState.spawnQueue[0]!;

      // Check if it's time to spawn
      if (this.waveState.timeSinceLastSpawn >= nextSpawn.spawnTime) {
        // Spawn monster
        this.monsterManager.spawnMonster(nextSpawn.monster);
        this.waveState.monstersSpawned++;

        // Remove from queue
        this.waveState.spawnQueue.shift();
      } else {
        break; // Wait for next spawn time
      }
    }

    // Check if wave is complete (all spawned and all dead/escaped)
    if (
      this.waveState.spawnQueue.length === 0 &&
      this.monsterManager.getAllMonsters().length === 0
    ) {
      this.onWaveComplete();
    }
  }

  /**
   * Generate a wave definition
   * First tries to use predefined wave, falls back to procedural generation
   */
  private generateWave(waveNumber: number): WaveDefinition {
    // Try to get predefined wave
    const predefinedWave = getWaveDefinition(waveNumber);
    if (predefinedWave) {
      console.log(`📖 Using predefined wave ${waveNumber}`);
      return predefinedWave;
    }

    // Fallback to procedural generation
    console.log(`🎲 Generating procedural wave ${waveNumber}`);
    return this.generateProceduralWave(waveNumber);
  }

  /**
   * Generate a procedural wave definition (fallback for waves beyond predefined)
   */
  private generateProceduralWave(waveNumber: number): WaveDefinition {
    const isBossWave = waveNumber % 10 === 0;

    if (isBossWave) {
      return this.generateBossWave(waveNumber);
    } else {
      return this.generateRegularWave(waveNumber);
    }
  }

  /**
   * Generate a regular wave
   */
  private generateRegularWave(waveNumber: number): WaveDefinition {
    const spawns: MonsterSpawn[] = [];

    // Base monster count increases with wave number
    const baseCount = 5 + Math.floor(waveNumber / 2);

    // Mix of monster types (60% basic, 30% tough, 10% fast)
    const basicCount = Math.floor(baseCount * 0.6);
    const toughCount = Math.floor(baseCount * 0.3);
    const fastCount = Math.floor(baseCount * 0.1);

    // Get available monsters (non-boss)
    const availableMonsters = Object.values(this.allMonsterDefinitions).filter(
      (def) => !def.isBoss
    );

    if (availableMonsters.length === 0) {
      console.warn('No monsters available for wave generation!');
      return { waveNumber, isBossWave: false, spawns: [] };
    }

    // Spawn basic monsters (pick randomly)
    if (basicCount > 0) {
      const basicMonster =
        availableMonsters[Math.floor(Math.random() * availableMonsters.length)]!;
      spawns.push({
        monsterId: basicMonster.id,
        count: basicCount,
        spawnDelay: 0.8, // Spawn every 0.8 seconds
      });
    }

    // Spawn tough monsters
    if (toughCount > 0 && availableMonsters.length > 0) {
      const toughMonster =
        availableMonsters[Math.floor(Math.random() * availableMonsters.length)]!;
      spawns.push({
        monsterId: toughMonster.id,
        count: toughCount,
        spawnDelay: 1.0,
      });
    }

    // Spawn fast monsters
    if (fastCount > 0 && availableMonsters.length > 0) {
      const fastMonster =
        availableMonsters[Math.floor(Math.random() * availableMonsters.length)]!;
      spawns.push({
        monsterId: fastMonster.id,
        count: fastCount,
        spawnDelay: 0.5,
      });
    }

    return { waveNumber, isBossWave: false, spawns };
  }

  /**
   * Generate a boss wave
   */
  private generateBossWave(waveNumber: number): WaveDefinition {
    // Get boss monsters
    const bossMonsters = Object.values(this.allMonsterDefinitions).filter(
      (def) => def.isBoss
    );

    if (bossMonsters.length === 0) {
      console.warn('No boss monsters available! Generating regular wave instead.');
      return this.generateRegularWave(waveNumber);
    }

    // Pick a boss (could be based on wave number)
    const boss = bossMonsters[0]!; // For now, just use first boss

    // Generate minions
    const availableMinions = Object.values(this.allMonsterDefinitions).filter(
      (def) => !def.isBoss
    );

    const minionCount = Math.floor(waveNumber / 5); // More minions as waves progress
    const minions: MonsterSpawn[] = [];

    if (availableMinions.length > 0 && minionCount > 0) {
      const minionMonster =
        availableMinions[Math.floor(Math.random() * availableMinions.length)]!;
      minions.push({
        monsterId: minionMonster.id,
        count: minionCount,
        spawnDelay: 0.8,
      });
    }

    return {
      waveNumber,
      isBossWave: true,
      bossId: boss.id,
      spawns: [{ monsterId: boss.id, count: 1, spawnDelay: 0 }],
      bossMinions: minions,
    };
  }

  /**
   * Build spawn queue from wave definition
   */
  private buildSpawnQueue(wave: WaveDefinition): void {
    this.waveState.spawnQueue = [];

    // Boss waves: boss first, then interleaved minions
    if (wave.bossId) {
      const bossDefinition = this.allMonsterDefinitions[wave.bossId];
      if (bossDefinition) {
        this.waveState.spawnQueue.push({
          monster: bossDefinition,
          spawnTime: 0,
        });
      }

      // Add minions starting 2s after boss, interleaved
      if (wave.bossMinions) {
        this.addInterleaved(wave.bossMinions, 2);
      }
    }

    // Regular spawns: all groups start at time 0, interleaved
    const regularSpawns = wave.spawns.filter(
      (s) => !(s.monsterId === wave.bossId && wave.isBossWave)
    );
    if (regularSpawns.length > 0) {
      this.addInterleaved(regularSpawns, wave.bossId ? 2 : 0);
    }

    // Sort by spawn time so update() processes them in order
    this.waveState.spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
    this.waveState.totalMonstersInWave = this.waveState.spawnQueue.length;
  }

  /**
   * Add spawn groups interleaved — each group starts at baseTime
   * and uses its own independent timeline
   */
  private addInterleaved(groups: MonsterSpawn[], baseTime: number): void {
    for (const spawn of groups) {
      const monsterDefinition = this.allMonsterDefinitions[spawn.monsterId];
      if (!monsterDefinition) {
        console.warn(`Monster definition not found: ${spawn.monsterId}`);
        continue;
      }

      for (let i = 0; i < spawn.count; i++) {
        this.waveState.spawnQueue.push({
          monster: monsterDefinition,
          spawnTime: baseTime + i * spawn.spawnDelay,
        });
      }
    }
  }

  /**
   * Called when wave is complete
   */
  private onWaveComplete(): void {
    this.waveState.isActive = false;

    console.log(`✅ Wave ${this.waveState.currentWave} complete!`);

    // Give wave completion gold bonus
    const goldBonus = 20 + this.waveState.currentWave * 8;
    useGameStore.getState().addGold(goldBonus);
    useRunStore.getState().addGoldEarned(goldBonus);

    // Update highest wave in run store
    useRunStore.getState().setHighestWave(this.waveState.currentWave);

    // Set game state to wave complete
    useGameStore.getState().setGameState(GameState.WaveComplete);

    // Generate rewards
    const rewardSystem = (window as any).rewardSystem;
    if (rewardSystem) {
      const context = {
        currentWave: this.waveState.currentWave,
        availableTowers: useRunStore.getState().availableTowers,
        allTowerIds: Object.keys(TOWER_DEFINITIONS),
        currentGold: useGameStore.getState().gold,
        currentLives: useGameStore.getState().lives,
      };
      const rewards = rewardSystem.generateRewards(context);
      useRunStore.getState().setCurrentRewards(rewards);
      console.log(`🎁 Generated ${rewards.length} rewards`);
    }
  }

  /**
   * Check if wave is active
   */
  isWaveActive(): boolean {
    return this.waveState.isActive;
  }

  /**
   * Get current wave number
   */
  getCurrentWave(): number {
    return this.waveState.currentWave;
  }

  /**
   * Get wave progress (0-1)
   */
  getWaveProgress(): number {
    if (this.waveState.totalMonstersInWave === 0) return 1;
    return this.waveState.monstersSpawned / this.waveState.totalMonstersInWave;
  }

  /**
   * Get monsters remaining in spawn queue
   */
  getMonstersRemaining(): number {
    return this.waveState.spawnQueue.length;
  }

  /**
   * Reset wave system (for new game)
   */
  reset(): void {
    this.waveState = {
      isActive: false,
      currentWave: 0,
      spawnQueue: [],
      timeSinceLastSpawn: 0,
      monstersSpawned: 0,
      totalMonstersInWave: 0,
    };
  }
}
