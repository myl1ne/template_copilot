/**
 * Tower Selection Panel - Shows available towers for placement
 */

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { GameState, DamageType } from '../../types/game';
import { TOWER_DEFINITIONS } from '../../data/towers';
import { renderTowerThumbnail } from '../../rendering/TowerThumbnailRenderer';

// Damage type colors for visual indicators
const DAMAGE_TYPE_COLORS: Record<DamageType, string> = {
  [DamageType.Physical]: '#aaaaaa',
  [DamageType.Fire]: '#ff6b35',
  [DamageType.Ice]: '#4ecdc4',
  [DamageType.Lightning]: '#ffe66d',
  [DamageType.Shadow]: '#9b59b6',
  [DamageType.Holy]: '#f4d03f',
  [DamageType.Void]: '#5f27cd',
};

export function TowerSelectionPanel() {
  const gameState = useGameStore((state) => state.gameState);
  const availableTowers = useRunStore((state) => state.availableTowers);
  const gold = useGameStore((state) => state.gold);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Map<string, HTMLCanvasElement>>(new Map());
  const thumbnailsGenerated = useRef(false);

  // Generate thumbnails once
  useEffect(() => {
    if (thumbnailsGenerated.current) return;
    if (availableTowers.length === 0) return;

    thumbnailsGenerated.current = true;
    const newThumbnails = new Map<string, HTMLCanvasElement>();

    for (const towerId of availableTowers) {
      const definition = TOWER_DEFINITIONS[towerId];
      if (definition) {
        const canvas = renderTowerThumbnail(definition, 48);
        newThumbnails.set(towerId, canvas);
      }
    }

    setThumbnails(newThumbnails);
  }, [availableTowers]);

  if (gameState !== GameState.Playing && gameState !== GameState.WaveComplete) return null;

  const handleTowerClick = (towerId: string) => {
    // Check if player can afford
    const definition = TOWER_DEFINITIONS[towerId];
    if (!definition) return;

    if (gold >= definition.baseCost) {
      setSelectedTowerId(towerId);
      // Store in global for GameCanvas to read on click
      (window as any).selectedTowerForPlacement = towerId;
      // Clear tower info selection when entering placement mode
      useGameStore.getState().setSelectedTowerId(null);
      console.log(`Selected tower: ${definition.name}`);
    } else {
      console.log('Not enough gold!');
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        right: 8,
        bottom: 8,
        width: '200px',
        padding: '12px',
        background: 'rgba(26, 26, 46, 0.95)',
        border: '2px solid rgba(102, 126, 234, 0.5)',
        borderRadius: '8px',
        zIndex: 10,
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h3
        style={{
          marginBottom: '12px',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#667eea',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          borderBottom: '2px solid rgba(102, 126, 234, 0.3)',
          paddingBottom: '8px',
        }}
      >
        Build Menu
      </h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: 1,
          paddingRight: '4px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#667eea rgba(0, 0, 0, 0.3)',
        }}
      >
        {availableTowers.map((towerId) => {
          const definition = TOWER_DEFINITIONS[towerId];
          if (!definition) return null;

          const canAfford = gold >= definition.baseCost;
          const isSelected = selectedTowerId === towerId;
          const thumbnail = thumbnails.get(towerId);
          const damageColor = DAMAGE_TYPE_COLORS[definition.damageType];

          return (
            <button
              key={towerId}
              onClick={() => handleTowerClick(towerId)}
              disabled={!canAfford}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px',
                width: '100%',
                background: isSelected
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(0, 0, 0, 0.4)',
                border: `2px solid ${canAfford ? (isSelected ? '#ffffff' : damageColor) : '#333'}`,
                borderRadius: '8px',
                cursor: canAfford ? 'pointer' : 'not-allowed',
                opacity: canAfford ? 1 : 0.5,
                transition: 'all 0.15s ease',
                color: '#ffffff',
                boxShadow: isSelected
                  ? '0 0 12px rgba(102, 126, 234, 0.6)'
                  : '0 2px 4px rgba(0, 0, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                if (canAfford && !isSelected) {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = `0 4px 8px ${damageColor}80`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
                }
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  flexShrink: 0,
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: `2px solid ${damageColor}60`,
                }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail.toDataURL()}
                    alt={definition.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '24px' }}>🏰</div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Tower Name */}
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '11px',
                    lineHeight: '1.2',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={definition.name}
                >
                  {definition.name}
                </div>

                {/* Cost and Stats */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '10px',
                  }}
                >
                  <div
                    style={{
                      fontWeight: 'bold',
                      color: canAfford ? '#ffd700' : '#ff6b6b',
                    }}
                  >
                    {definition.baseCost}g
                  </div>
                  <div style={{ opacity: 0.7, fontSize: '9px' }}>
                    {definition.baseDamage}dmg
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedTowerId && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            background: 'rgba(102, 126, 234, 0.3)',
            borderRadius: '6px',
            fontSize: '10px',
            textAlign: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            border: '1px solid rgba(102, 126, 234, 0.5)',
            animation: 'pulse 2s infinite',
            lineHeight: '1.3',
          }}
        >
          Click on grid to place
          <br />
          <span style={{ opacity: 0.7 }}>ESC to cancel</span>
        </div>
      )}
    </div>
  );
}
