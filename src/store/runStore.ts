/**
 * Zustand store for roguelike run state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GlobalBuff, Reward } from '../roguelike/types';
import { useGameStore } from './gameStore';
import { GameState, TowerRace } from '../types/game';

interface RunStoreState {
  // Run state
  selectedRace: TowerRace | null;
  availableTowers: string[];
  activeBuffs: GlobalBuff[];
  totalKills: number;
  totalGoldEarned: number;
  highestWave: number;

  // Reward selection state
  currentRewards: Reward[] | null;
  isSelectingReward: boolean;

  // Actions
  setSelectedRace: (race: TowerRace) => void;
  setAvailableTowers: (towers: string[]) => void;
  addAvailableTower: (towerId: string) => void;
  setActiveBuffs: (buffs: GlobalBuff[]) => void;
  addBuff: (buff: GlobalBuff) => void;

  // Reward actions
  setCurrentRewards: (rewards: Reward[] | null) => void;
  setIsSelectingReward: (selecting: boolean) => void;
  selectReward: (reward: Reward) => void;

  // Stats
  incrementKills: () => void;
  addGoldEarned: (amount: number) => void;
  setHighestWave: (wave: number) => void;

  // Lifecycle
  startNewRun: () => void;
  reset: () => void;
}

export const useRunStore = create<RunStoreState>()(
  immer((set) => ({
    // Initial state
    selectedRace: null,
    availableTowers: ['basic_archer'],
    activeBuffs: [],
    totalKills: 0,
    totalGoldEarned: 0,
    highestWave: 0,
    currentRewards: null,
    isSelectingReward: false,

    // Race selection
    setSelectedRace: (race) =>
      set((draft) => {
        draft.selectedRace = race;

        // Update runManager
        const runManager = (window as any).runManager;
        if (runManager) {
          runManager.setSelectedRace(race);
          draft.availableTowers = runManager.getAvailableTowers();
        }
      }),

    // Tower management
    setAvailableTowers: (towers) =>
      set((draft) => {
        draft.availableTowers = towers;
      }),

    addAvailableTower: (towerId) =>
      set((draft) => {
        if (!draft.availableTowers.includes(towerId)) {
          draft.availableTowers.push(towerId);
        }
      }),

    // Buff management
    setActiveBuffs: (buffs) =>
      set((draft) => {
        draft.activeBuffs = buffs;
      }),

    addBuff: (buff) =>
      set((draft) => {
        draft.activeBuffs.push(buff);
      }),

    // Reward management
    setCurrentRewards: (rewards) =>
      set((draft) => {
        draft.currentRewards = rewards;
      }),

    setIsSelectingReward: (selecting) =>
      set((draft) => {
        draft.isSelectingReward = selecting;
      }),

    selectReward: (reward) => {
      // Get reward system from global
      const rewardSystem = (window as any).rewardSystem;
      const runManager = (window as any).runManager;

      if (rewardSystem && runManager) {
        // Apply the reward
        rewardSystem.applyReward(reward);

        // Update store with new state from runManager
        set((draft) => {
          draft.availableTowers = runManager.getAvailableTowers();
          draft.activeBuffs = runManager.getActiveBuffs();
          draft.currentRewards = null;
          draft.isSelectingReward = false;
        });

        // Transition back to WaveComplete (not Playing) so "Start Wave" button appears
        // RewardModal won't re-show because currentRewards is null
        useGameStore.getState().setGameState(GameState.WaveComplete);

        console.log('✅ Reward applied, returning to game');
      }
    },

    // Stats
    incrementKills: () =>
      set((draft) => {
        draft.totalKills++;

        // Also update runManager
        const runManager = (window as any).runManager;
        if (runManager) {
          runManager.recordKill();
        }
      }),

    addGoldEarned: (amount) =>
      set((draft) => {
        draft.totalGoldEarned += amount;

        // Also update runManager
        const runManager = (window as any).runManager;
        if (runManager) {
          runManager.recordGoldEarned(amount);
        }
      }),

    setHighestWave: (wave) =>
      set((draft) => {
        if (wave > draft.highestWave) {
          draft.highestWave = wave;
        }

        // Also update runManager
        const runManager = (window as any).runManager;
        if (runManager) {
          runManager.recordWaveComplete(wave);
        }
      }),

    // Lifecycle
    startNewRun: () => {
      console.log('🎮 Starting new run from store');

      // Reset run manager
      const runManager = (window as any).runManager;
      if (runManager) {
        runManager.startNewRun();
      }

      // Reset store
      set((draft) => {
        draft.selectedRace = null;
        draft.availableTowers = ['basic_archer'];
        draft.activeBuffs = [];
        draft.totalKills = 0;
        draft.totalGoldEarned = 0;
        draft.highestWave = 0;
        draft.currentRewards = null;
        draft.isSelectingReward = false;
      });
    },

    reset: () =>
      set((draft) => {
        draft.selectedRace = null;
        draft.availableTowers = ['basic_archer'];
        draft.activeBuffs = [];
        draft.totalKills = 0;
        draft.totalGoldEarned = 0;
        draft.highestWave = 0;
        draft.currentRewards = null;
        draft.isSelectingReward = false;
      }),
  }))
);
