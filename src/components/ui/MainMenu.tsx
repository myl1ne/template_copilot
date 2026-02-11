/**
 * Main Menu - Entry point for the game
 */

import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { GameState, DEFAULT_GAME_CONFIG } from '../../types/game';

export function MainMenu() {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const startGame = useGameStore((state) => state.startGame);
  const startNewRun = useRunStore((state) => state.startNewRun);

  if (gameState !== GameState.Menu) return null;

  const handleStartGame = () => {
    // Initialize new run
    startNewRun();

    // Initialize game with starting resources (will be applied when race is selected)
    startGame(DEFAULT_GAME_CONFIG.startingGold, DEFAULT_GAME_CONFIG.startingLives);

    // Transition to race selection
    setGameState(GameState.RunSetup);

    console.log('✅ Transitioning to race selection...');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 15, 30, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '32px',
        zIndex: 100,
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
          }}
        >
          NEXUS BREACH
        </h1>
        <p style={{ fontSize: '20px', opacity: 0.7, color: '#ffffff' }}>
          Tower Defense Roguelike
        </p>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartGame}
        style={{
          padding: '16px 48px',
          fontSize: '24px',
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
        START RUN
      </button>

      {/* Instructions */}
      <div
        style={{
          padding: '24px',
          background: 'rgba(26, 26, 46, 0.8)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          maxWidth: '600px',
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        <h3 style={{ marginBottom: '16px', color: '#667eea' }}>How to Play</h3>
        <div style={{ textAlign: 'left', lineHeight: '1.8' }}>
          <p>• Click towers to select, then click the grid to place them</p>
          <p>• Press "Start Next Wave" to begin spawning monsters</p>
          <p>• Complete waves to unlock new towers and upgrades</p>
          <p>• Survive as long as you can!</p>
        </div>
      </div>

      {/* Lore */}
      <div
        style={{
          maxWidth: '500px',
          padding: '16px',
          fontSize: '14px',
          opacity: 0.6,
          textAlign: 'center',
          color: '#ffffff',
        }}
      >
        Cosmic Nexuses serve as dimensional gateways. When corrupted, they spawn reality-warped
        monstrosities. You are a Nexus Guardian.
      </div>
    </div>
  );
}
