/**
 * Manages the current roguelike run state
 */

import { RunState, GlobalBuff, BuffType, RunStats } from './types';
import { TowerRace } from '../types/game';

/**
 * Run Manager handles the state of a single roguelike run
 */
export class RunManager {
  private runState: RunState;

  constructor() {
    this.runState = this.createInitialRunState();
  }

  /**
   * Create initial run state
   */
  private createInitialRunState(): RunState {
    return {
      selectedRace: null, // No race selected initially
      availableTowers: ['basic_archer', 'sniper', 'fire_mage'], // Start with 3 towers for better UX
      activeBuffs: [],
      totalKills: 0,
      totalGoldEarned: 0,
      highestWave: 0,
      runStartTime: Date.now(),
    };
  }

  /**
   * Get available towers
   */
  getAvailableTowers(): string[] {
    return [...this.runState.availableTowers];
  }

  /**
   * Get active buffs
   */
  getActiveBuffs(): GlobalBuff[] {
    return [...this.runState.activeBuffs];
  }

  /**
   * Get selected race
   */
  getSelectedRace(): TowerRace | null {
    return this.runState.selectedRace;
  }

  /**
   * Set selected race (only allowed at start of run)
   */
  setSelectedRace(race: TowerRace): void {
    if (this.runState.selectedRace !== null) {
      console.warn('⚠️ Race already selected for this run');
      return;
    }
    this.runState.selectedRace = race;
    console.log(`🎭 Selected race: ${race}`);

    // Set starting tower based on race
    this.runState.availableTowers = this.getStartingTowerForRace(race);
  }

  /**
   * Get starting tower for a race
   */
  private getStartingTowerForRace(race: TowerRace): string[] {
    switch (race) {
      case TowerRace.Human:
        return ['basic_archer'];
      case TowerRace.Elemental:
        return ['fire_mage'];
      case TowerRace.Undead:
        return ['shadow_archer'];
      case TowerRace.Elven:
        return ['elven_ranger'];
      case TowerRace.Mechanical:
        return ['auto_turret'];
      default:
        return ['basic_archer'];
    }
  }

  /**
   * Get run stats
   */
  getRunStats(): RunStats {
    return {
      totalKills: this.runState.totalKills,
      totalGoldEarned: this.runState.totalGoldEarned,
      highestWave: this.runState.highestWave,
      runDuration: this.runState.runEndTime
        ? this.runState.runEndTime - this.runState.runStartTime
        : Date.now() - this.runState.runStartTime,
    };
  }

  /**
   * Check if tower is unlocked
   */
  isTowerUnlocked(towerId: string): boolean {
    return this.runState.availableTowers.includes(towerId);
  }

  /**
   * Unlock a tower
   */
  unlockTower(towerId: string): void {
    if (!this.isTowerUnlocked(towerId)) {
      this.runState.availableTowers.push(towerId);
      console.log(`🔓 Unlocked tower: ${towerId}`);
    }
  }

  /**
   * Add a buff to active buffs
   */
  addBuff(buff: GlobalBuff): void {
    this.runState.activeBuffs.push(buff);
    console.log(`✨ Applied buff: ${buff.name} (+${buff.value * 100}% ${buff.type})`);
  }

  /**
   * Get buff multiplier for a specific buff type
   * Buffs stack additively (e.g., two +10% damage buffs = +20% total)
   */
  getBuffMultiplier(buffType: BuffType): number {
    let totalBonus = 0;

    for (const buff of this.runState.activeBuffs) {
      if (buff.type === buffType) {
        totalBonus += buff.value;
      }
    }

    return 1.0 + totalBonus;
  }

  /**
   * Record a monster kill
   */
  recordKill(): void {
    this.runState.totalKills++;
  }

  /**
   * Record gold earned
   */
  recordGoldEarned(amount: number): void {
    this.runState.totalGoldEarned += amount;
  }

  /**
   * Record wave completion
   */
  recordWaveComplete(waveNumber: number): void {
    if (waveNumber > this.runState.highestWave) {
      this.runState.highestWave = waveNumber;
    }
  }

  /**
   * Start a new run
   */
  startNewRun(): void {
    console.log('🎮 Starting new run...');
    this.runState = this.createInitialRunState();
  }

  /**
   * End the current run
   */
  endRun(): void {
    this.runState.runEndTime = Date.now();
    console.log('💀 Run ended');
    console.log('Final stats:', this.getRunStats());
  }

  /**
   * Reset run state
   */
  reset(): void {
    this.runState = this.createInitialRunState();
  }

  /**
   * Get the internal run state (for debugging)
   */
  getRunState(): RunState {
    return { ...this.runState };
  }
}
