/**
 * Pause Menu - Simple pause overlay
 */

import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { GameState } from '../../types/game';

export function PauseMenu() {
  const gameState = useGameStore((state) => state.gameState);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const reset = useGameStore((state) => state.reset);
  const runReset = useRunStore((state) => state.reset);

  if (gameState !== GameState.Paused) return null;

  const handleResume = () => {
    resumeGame();
  };

  const handleQuit = () => {
    // End run
    const runManager = (window as any).runManager;
    if (runManager) {
      runManager.endRun();
    }

    // Reset to main menu
    reset();
    runReset();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 15, 30, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          padding: '48px',
          background: 'rgba(26, 26, 46, 0.95)',
          border: '2px solid rgba(102, 126, 234, 0.5)',
          borderRadius: '16px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            marginBottom: '32px',
            fontSize: '32px',
            color: '#ffffff',
          }}
        >
          PAUSED
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={handleResume}
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            RESUME
          </button>

          <button
            onClick={handleQuit}
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'rgba(255, 100, 100, 0.2)',
              border: '2px solid rgba(255, 100, 100, 0.5)',
              borderRadius: '12px',
              color: '#ff4444',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            QUIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}
