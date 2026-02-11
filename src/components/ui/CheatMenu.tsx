import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { TOWER_DEFINITIONS } from '../../data/towers';

/**
 * Cheat menu for testing and debugging
 * Toggle with backtick (`) key
 */
export function CheatMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '`') {
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAddGold = () => {
    useGameStore.getState().addGold(1000);
    console.log('💰 Added 1000 gold (cheat)');
  };

  const handleUnlockAllTowers = () => {
    const runStore = useRunStore.getState();
    const allTowerIds = Object.keys(TOWER_DEFINITIONS);

    // Unlock all towers by adding them to availableTowers
    for (const towerId of allTowerIds) {
      if (!runStore.availableTowers.includes(towerId)) {
        runStore.addAvailableTower(towerId);
      }
    }

    console.log(`🔓 Unlocked all ${allTowerIds.length} towers (cheat)`);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#2a2a2a',
        border: '2px solid #444',
        borderRadius: '8px',
        padding: '20px',
        zIndex: 1000,
        minWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h2 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>
          🎮 Cheat Menu
        </h2>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0 8px',
          }}
        >
          ×
        </button>
      </div>

      <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '16px' }}>
        Press ` (backtick) to toggle
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={handleAddGold}
          style={{
            padding: '12px',
            backgroundColor: '#ffd700',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          💰 Add 1000 Gold
        </button>

        <button
          onClick={handleUnlockAllTowers}
          style={{
            padding: '12px',
            backgroundColor: '#4488ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          🔓 Unlock All Towers
        </button>
      </div>

      <div
        style={{
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '1px solid #444',
          fontSize: '11px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        For testing purposes only
      </div>
    </div>
  );
}
