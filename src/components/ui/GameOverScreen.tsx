/**
 * Game Over Screen - Shows final stats and restart option
 */

import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { GameState } from '../../types/game';

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const currentWave = useGameStore((state) => state.currentWave);
  const reset = useGameStore((state) => state.reset);
  const runReset = useRunStore((state) => state.reset);

  const totalKills = useRunStore((state) => state.totalKills);
  const totalGoldEarned = useRunStore((state) => state.totalGoldEarned);

  if (gameState !== GameState.GameOver) return null;

  const handleRestart = () => {
    // End run in RunManager
    const runManager = (window as any).runManager;
    if (runManager) {
      runManager.endRun();
    }

    // Reset game entities (towers, monsters, projectiles, grid)
    const game = (window as any).game;
    if (game) {
      game.resetGame();
    }

    // Reset both stores
    reset();
    runReset();

    console.log('🔄 Returning to main menu');
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 15, 30, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(26, 26, 46, 0.95)',
          border: '2px solid rgba(255, 100, 100, 0.5)',
          borderRadius: '16px',
          padding: '48px',
          textAlign: 'center',
          minWidth: '500px',
        }}
      >
        {/* Title */}
        <h1
          style={{
            fontSize: '48px',
            color: '#ff4444',
            marginBottom: '8px',
            fontWeight: 'bold',
          }}
        >
          NEXUS BREACHED
        </h1>
        <p
          style={{
            fontSize: '16px',
            opacity: 0.7,
            marginBottom: '32px',
            color: '#ffffff',
          }}
        >
          The corruption has overwhelmed your defenses
        </p>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px',
            padding: '24px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
          }}
        >
          <StatDisplay label="Waves Survived" value={currentWave} />
          <StatDisplay label="Score" value={score} />
          <StatDisplay label="Total Kills" value={totalKills} />
          <StatDisplay label="Gold Earned" value={totalGoldEarned} />
        </div>

        {/* Restart Button */}
        <button
          onClick={handleRestart}
          style={{
            padding: '16px 48px',
            fontSize: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}

/**
 * Stat display component
 */
function StatDisplay({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div
        style={{
          fontSize: '12px',
          opacity: 0.7,
          marginBottom: '4px',
          color: '#ffffff',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#667eea',
        }}
      >
        {value}
      </div>
    </div>
  );
}
