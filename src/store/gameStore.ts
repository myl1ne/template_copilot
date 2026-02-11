import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GameState } from '../types/game';

interface GameStoreState {
  // Core game state
  gameState: GameState;
  gold: number;
  lives: number;
  score: number;
  time: number;

  // Wave info
  currentWave: number;
  waveInProgress: boolean;

  // Tower selection (for upgrade UI)
  selectedTowerId: string | null;

  // Actions
  setGameState: (state: GameState) => void;
  setGold: (gold: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  setLives: (lives: number) => void;
  loseLife: () => void;
  addScore: (points: number) => void;
  setCurrentWave: (wave: number) => void;
  setWaveInProgress: (inProgress: boolean) => void;
  setTime: (time: number) => void;
  setSelectedTowerId: (id: string | null) => void;

  // Game flow
  startGame: (startingGold: number, startingLives: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  gameOver: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => ({
    // Initial state
    gameState: GameState.Menu,
    gold: 0,
    lives: 0,
    score: 0,
    time: 0,
    currentWave: 0,
    waveInProgress: false,
    selectedTowerId: null,

    // Actions
    setGameState: (state) =>
      set((draft) => {
        draft.gameState = state;
      }),

    setGold: (gold) =>
      set((draft) => {
        draft.gold = gold;
      }),

    addGold: (amount) =>
      set((draft) => {
        draft.gold += amount;
      }),

    spendGold: (amount) => {
      if (get().gold >= amount) {
        set((draft) => {
          draft.gold -= amount;
        });
        return true;
      }
      return false;
    },

    setLives: (lives) =>
      set((draft) => {
        draft.lives = lives;
      }),

    loseLife: () =>
      set((draft) => {
        draft.lives--;
        if (draft.lives <= 0) {
          draft.gameState = GameState.GameOver;
          draft.waveInProgress = false;
        }
      }),

    addScore: (points) =>
      set((draft) => {
        draft.score += points;
      }),

    setCurrentWave: (wave) =>
      set((draft) => {
        draft.currentWave = wave;
      }),

    setWaveInProgress: (inProgress) =>
      set((draft) => {
        draft.waveInProgress = inProgress;
      }),

    setTime: (time) =>
      set((draft) => {
        draft.time = time;
      }),

    setSelectedTowerId: (id) =>
      set((draft) => {
        draft.selectedTowerId = id;
      }),

    startGame: (startingGold, startingLives) =>
      set((draft) => {
        draft.gameState = GameState.Playing;
        draft.gold = startingGold;
        draft.lives = startingLives;
        draft.score = 0;
        draft.time = 0;
        draft.currentWave = 0;
        draft.waveInProgress = false;
      }),

    pauseGame: () =>
      set((draft) => {
        if (draft.gameState === GameState.Playing) {
          draft.gameState = GameState.Paused;
        }
      }),

    resumeGame: () =>
      set((draft) => {
        if (draft.gameState === GameState.Paused) {
          draft.gameState = GameState.Playing;
        }
      }),

    gameOver: () =>
      set((draft) => {
        draft.gameState = GameState.GameOver;
        draft.waveInProgress = false;
      }),

    reset: () =>
      set((draft) => {
        draft.gameState = GameState.Menu;
        draft.gold = 0;
        draft.lives = 0;
        draft.score = 0;
        draft.time = 0;
        draft.currentWave = 0;
        draft.waveInProgress = false;
        draft.selectedTowerId = null;
      }),
  }))
);
