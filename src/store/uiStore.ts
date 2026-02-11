import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface UIStoreState {
  // Modal states
  showRewardModal: boolean;
  showUpgradeModal: boolean;
  showPauseMenu: boolean;
  showGameOverScreen: boolean;

  // Selection
  selectedTowerId: string | null;
  hoveredTowerId: string | null;

  // UI settings
  showGrid: boolean;
  showRange: boolean;
  showPath: boolean;

  // Actions
  setShowRewardModal: (show: boolean) => void;
  setShowUpgradeModal: (show: boolean) => void;
  setShowPauseMenu: (show: boolean) => void;
  setShowGameOverScreen: (show: boolean) => void;
  setSelectedTowerId: (id: string | null) => void;
  setHoveredTowerId: (id: string | null) => void;
  toggleGrid: () => void;
  toggleRange: () => void;
  togglePath: () => void;
  reset: () => void;
}

export const useUIStore = create<UIStoreState>()(
  immer((set) => ({
    // Initial state
    showRewardModal: false,
    showUpgradeModal: false,
    showPauseMenu: false,
    showGameOverScreen: false,
    selectedTowerId: null,
    hoveredTowerId: null,
    showGrid: true,
    showRange: true,
    showPath: true,

    // Actions
    setShowRewardModal: (show) =>
      set((draft) => {
        draft.showRewardModal = show;
      }),

    setShowUpgradeModal: (show) =>
      set((draft) => {
        draft.showUpgradeModal = show;
      }),

    setShowPauseMenu: (show) =>
      set((draft) => {
        draft.showPauseMenu = show;
      }),

    setShowGameOverScreen: (show) =>
      set((draft) => {
        draft.showGameOverScreen = show;
      }),

    setSelectedTowerId: (id) =>
      set((draft) => {
        draft.selectedTowerId = id;
      }),

    setHoveredTowerId: (id) =>
      set((draft) => {
        draft.hoveredTowerId = id;
      }),

    toggleGrid: () =>
      set((draft) => {
        draft.showGrid = !draft.showGrid;
      }),

    toggleRange: () =>
      set((draft) => {
        draft.showRange = !draft.showRange;
      }),

    togglePath: () =>
      set((draft) => {
        draft.showPath = !draft.showPath;
      }),

    reset: () =>
      set((draft) => {
        draft.showRewardModal = false;
        draft.showUpgradeModal = false;
        draft.showPauseMenu = false;
        draft.showGameOverScreen = false;
        draft.selectedTowerId = null;
        draft.hoveredTowerId = null;
      }),
  }))
);
