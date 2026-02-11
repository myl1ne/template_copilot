/**
 * Tower Info Panel - Shows selected tower stats with upgrade and sell buttons
 */

import { useGameStore } from '../../store/gameStore';
import { GameState } from '../../types/game';

export function TowerInfoPanel() {
  const gameState = useGameStore((state) => state.gameState);
  const selectedTowerId = useGameStore((state) => state.selectedTowerId);
  const gold = useGameStore((state) => state.gold);
  // Subscribe to time so the panel re-renders each frame (for live stats)
  useGameStore((state) => state.time);

  if (gameState !== GameState.Playing && gameState !== GameState.WaveComplete) return null;
  if (!selectedTowerId) return null;

  // Get game instance and tower data
  const game = (window as any).game;
  if (!game) return null;

  const tower = game.getTowerManager().getTower(selectedTowerId);
  if (!tower) {
    // Tower was removed, clear selection
    useGameStore.getState().setSelectedTowerId(null);
    return null;
  }

  const upgradeSystem = game.getUpgradeSystem();
  const upgradeInfo = upgradeSystem.getUpgradeInfo(tower);
  const sellValue = upgradeSystem.getSellValue(tower);
  const canAffordUpgrade = gold >= upgradeInfo.cost.gold;
  const isMaxLevel = tower.level >= tower.definition.maxLevel;

  const handleUpgrade = () => {
    const result = upgradeSystem.upgradeTower(selectedTowerId);
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
  };

  const handleSell = () => {
    upgradeSystem.sellTower(selectedTowerId);
    useGameStore.getState().setSelectedTowerId(null);
    console.log(`💰 Sold tower for ${sellValue} gold`);
  };

  const handleClose = () => {
    useGameStore.getState().setSelectedTowerId(null);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        padding: '16px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '2px solid rgba(102, 126, 234, 0.5)',
        borderRadius: '12px',
        zIndex: 10,
        minWidth: '240px',
        color: '#ffffff',
        fontFamily: 'monospace',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#667eea',
          }}
        >
          {tower.definition.name}
        </h3>
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0 4px',
          }}
        >
          X
        </button>
      </div>

      {/* Level */}
      <div style={{ fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
        Level {tower.level} / {tower.definition.maxLevel}
      </div>

      {/* Stats */}
      <div style={{ fontSize: '12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ opacity: 0.7 }}>Damage:</span>
          <span style={{ color: '#ff8844' }}>{tower.damage.toFixed(1)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ opacity: 0.7 }}>Range:</span>
          <span style={{ color: '#44aaff' }}>{tower.range.toFixed(0)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ opacity: 0.7 }}>Atk Speed:</span>
          <span style={{ color: '#44ff88' }}>{tower.attackSpeed.toFixed(2)}/s</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ opacity: 0.7 }}>Type:</span>
          <span>{tower.damageType}</span>
        </div>
      </div>

      {/* Abilities */}
      {tower.abilities.length > 0 && (
        <div style={{ fontSize: '11px', marginBottom: '12px', padding: '6px', background: 'rgba(102, 126, 234, 0.15)', borderRadius: '6px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#667eea' }}>Abilities:</div>
          {tower.abilities.map((abilityId: string) => (
            <div key={abilityId} style={{ opacity: 0.8 }}>{abilityId}</div>
          ))}
        </div>
      )}

      {/* Upgrade Button */}
      {!isMaxLevel && (
        <button
          onClick={handleUpgrade}
          disabled={!canAffordUpgrade}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            background: canAffordUpgrade
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'rgba(100, 100, 100, 0.3)',
            border: `1px solid ${canAffordUpgrade ? '#667eea' : '#555'}`,
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: canAffordUpgrade ? 'pointer' : 'not-allowed',
            opacity: canAffordUpgrade ? 1 : 0.5,
            fontFamily: 'monospace',
          }}
        >
          Upgrade to Lv.{tower.level + 1} ({upgradeInfo.cost.gold}g)
        </button>
      )}

      {isMaxLevel && (
        <div
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '8px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#ffd700',
            fontWeight: 'bold',
          }}
        >
          MAX LEVEL
        </div>
      )}

      {/* Sell Button */}
      <button
        onClick={handleSell}
        style={{
          width: '100%',
          padding: '8px',
          background: 'rgba(255, 68, 68, 0.2)',
          border: '1px solid rgba(255, 68, 68, 0.5)',
          borderRadius: '8px',
          color: '#ff6666',
          fontSize: '12px',
          cursor: 'pointer',
          fontFamily: 'monospace',
        }}
      >
        Sell ({sellValue}g)
      </button>
    </div>
  );
}
