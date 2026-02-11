/**
 * GameHUD Tests
 *
 * Tests for the game HUD component displaying stats and wave control
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GameHUD } from './GameHUD';
import { GameState } from '../../types/game';
import { useGameStore } from '../../store/gameStore';

// Mock the game store
vi.mock('../../store/gameStore', () => ({
  useGameStore: vi.fn(),
}));

describe('GameHUD', () => {
  const mockStoreState = {
    gold: 500,
    lives: 10,
    currentWave: 5,
    score: 1234,
    gameState: GameState.Playing,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    vi.mocked(useGameStore).mockImplementation((selector: any) => {
      return selector(mockStoreState);
    });

    // Mock window.game
    (window as any).game = {
      getWaveSystem: vi.fn(() => ({
        startNextWave: vi.fn(),
      })),
    };
  });

  describe('stats display', () => {
    it('should display gold', () => {
      render(<GameHUD />);
      expect(screen.getByText('Gold:')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });

    it('should display lives', () => {
      render(<GameHUD />);
      expect(screen.getByText('Lives:')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display current wave', () => {
      render(<GameHUD />);
      expect(screen.getByText('Wave:')).toBeInTheDocument();
      expect(screen.getByText('5/30')).toBeInTheDocument();
    });

    it('should display score', () => {
      render(<GameHUD />);
      expect(screen.getByText('Score:')).toBeInTheDocument();
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    it('should display low lives count', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          lives: 3,
        });
      });

      render(<GameHUD />);
      // Just verify the lives number is displayed (color logic is harder to test)
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('wave control button', () => {
    it('should show start wave button when WaveComplete', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.WaveComplete,
        });
      });

      render(<GameHUD />);
      expect(screen.getByText(/Start Wave/)).toBeInTheDocument();
    });

    it('should show start wave button at wave 0', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.Playing,
          currentWave: 0,
        });
      });

      render(<GameHUD />);
      expect(screen.getByText(/Start Wave 1/)).toBeInTheDocument();
    });

    it('should not show start wave button during active wave', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.Playing,
          currentWave: 5,
        });
      });

      render(<GameHUD />);
      expect(screen.queryByText(/Start Wave/)).not.toBeInTheDocument();
    });

    it('should call startNextWave when button clicked', async () => {
      const user = userEvent.setup();
      const startNextWave = vi.fn();

      (window as any).game = {
        getWaveSystem: vi.fn(() => ({
          startNextWave,
        })),
      };

      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.WaveComplete,
          currentWave: 5,
        });
      });

      render(<GameHUD />);
      const button = screen.getByText('Start Wave 6');
      await user.click(button);

      expect(startNextWave).toHaveBeenCalled();
    });
  });

  describe('wave progress indicator', () => {
    it('should show wave in progress during active wave', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.Playing,
          currentWave: 5,
        });
      });

      render(<GameHUD />);
      expect(screen.getByText('Wave 5 in progress...')).toBeInTheDocument();
    });

    it('should not show progress at wave 0', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.Playing,
          currentWave: 0,
        });
      });

      render(<GameHUD />);
      expect(screen.queryByText(/in progress/)).not.toBeInTheDocument();
    });

    it('should not show progress when wave complete', () => {
      vi.mocked(useGameStore).mockImplementation((selector: any) => {
        return selector({
          ...mockStoreState,
          gameState: GameState.WaveComplete,
          currentWave: 5,
        });
      });

      render(<GameHUD />);
      expect(screen.queryByText(/in progress/)).not.toBeInTheDocument();
    });
  });
});
