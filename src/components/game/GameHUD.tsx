import { useGameStore } from '../../store/gameStore';
import { GameState } from '../../types/game';

export function GameHUD() {
  const gold = useGameStore((state) => state.gold);
  const lives = useGameStore((state) => state.lives);
  const currentWave = useGameStore((state) => state.currentWave);
  const score = useGameStore((state) => state.score);
  const gameState = useGameStore((state) => state.gameState);

  const isWaveActive = gameState === GameState.Playing;
  const canStartWave = gameState === GameState.WaveComplete || (gameState === GameState.Playing && currentWave === 0);

  return (
    <>
      {/* Top HUD */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '16px',
          background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(26, 26, 46, 0) 100%)',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'monospace',
          fontSize: '14px',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <span style={{ opacity: 0.7 }}>Gold:</span>{' '}
            <span style={{ color: '#ffd700', fontWeight: 'bold' }}>{gold}</span>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Lives:</span>{' '}
            <span style={{ color: lives <= 5 ? '#ff4444' : '#ff8844', fontWeight: 'bold' }}>{lives}</span>
          </div>
          <div>
            <span style={{ opacity: 0.7 }}>Wave:</span>{' '}
            <span style={{ color: '#44aaff', fontWeight: 'bold' }}>{currentWave}/30</span>
          </div>
        </div>

        <div>
          <span style={{ opacity: 0.7 }}>Score:</span>{' '}
          <span style={{ fontWeight: 'bold' }}>{score}</span>
        </div>
      </div>

      {/* Wave Control Button — only visible between waves */}
      {canStartWave && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => {
              // @ts-ignore
              if (window.game) {
                // @ts-ignore
                const waveSystem = window.game.getWaveSystem();
                waveSystem.startNextWave();
              }
            }}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(102, 126, 234, 0.7)',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
            }}
          >
            Start Wave {currentWave + 1}
          </button>
        </div>
      )}

      {/* Wave in progress indicator */}
      {isWaveActive && currentWave > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 24px',
            background: 'rgba(26, 26, 46, 0.85)',
            color: '#88bbff',
            fontFamily: 'monospace',
            fontSize: '14px',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          Wave {currentWave} in progress...
        </div>
      )}
    </>
  );
}
