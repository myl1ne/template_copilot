/**
 * Race Selection Screen - Choose your race before starting a run
 */

import { useState } from 'react';
import { useRunStore } from '../../store/runStore';
import { useGameStore } from '../../store/gameStore';
import { TowerRace, GameState } from '../../types/game';
import { getRaceColors } from '../../rendering/procedural/colorPalettes';

export function RaceSelectionScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const setSelectedRace = useRunStore((state) => state.setSelectedRace);
  const setGameState = useGameStore((state) => state.setGameState);
  const [hoveredRace, setHoveredRace] = useState<TowerRace | null>(null);
  const [selectedRace, setLocalSelectedRace] = useState<TowerRace | null>(null);

  // Only show this screen when in RunSetup state
  if (gameState !== GameState.RunSetup) {
    return null;
  }

  const handleRaceSelect = (race: TowerRace) => {
    setLocalSelectedRace(race);
  };

  const handleStartRun = () => {
    if (selectedRace === null) {
      return;
    }

    // Set race in store (which updates RunManager)
    setSelectedRace(selectedRace);

    // Transition to playing
    setGameState(GameState.Playing);
  };

  const getRaceInfo = (race: TowerRace) => {
    const colors = getRaceColors(race);

    switch (race) {
      case TowerRace.Human:
        return {
          name: 'Human',
          passive: 'Military Discipline',
          description: [
            '• Physical damage towers with balanced stats',
            '• Towers: Archers, Snipers, Barracks, Catapults',
          ],
          startingTower: 'Basic Archer',
          colors,
        };
      case TowerRace.Elemental:
        return {
          name: 'Elemental',
          passive: 'Elemental Fury',
          description: [
            '• Fire, Ice, and Lightning damage towers',
            '• Towers: Fire Mage, Frost Shard, Storm Pillar, Inferno',
          ],
          startingTower: 'Fire Mage',
          colors,
        };
      case TowerRace.Undead:
        return {
          name: 'Undead',
          passive: 'Dark Harvest',
          description: [
            '• Shadow damage towers with DoT and debuffs',
            '• Towers: Shadow Archer, Necromancer, Obelisk, Plague',
          ],
          startingTower: 'Shadow Archer',
          colors,
        };
      case TowerRace.Elven:
        return {
          name: 'Elven',
          passive: "Nature's Grace",
          description: [
            '• Holy damage towers with stuns and AoE',
            '• Towers: Ranger, Moonwell, Treant, Sunbeam Spire',
          ],
          startingTower: 'Elven Ranger',
          colors,
        };
      case TowerRace.Mechanical:
        return {
          name: 'Mechanical',
          passive: 'Technological Superiority',
          description: [
            '• Void and Lightning towers with high attack speed',
            '• Towers: Auto Turret, Missile Battery, Tesla Coil, Void Cannon',
          ],
          startingTower: 'Auto Turret',
          colors,
        };
      default:
        return {
          name: 'Unknown',
          passive: '',
          description: [],
          startingTower: '',
          colors,
        };
    }
  };

  const races = [
    TowerRace.Human,
    TowerRace.Elemental,
    TowerRace.Undead,
    TowerRace.Elven,
    TowerRace.Mechanical,
  ];

  const displayRace = hoveredRace ?? selectedRace;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '40px',
        zIndex: 100,
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '20px',
          textShadow: '0 0 20px rgba(138, 43, 226, 0.5)',
        }}
      >
        CHOOSE YOUR DEFENDER
      </h1>

      {/* Race Cards */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '40px',
          justifyContent: 'center',
        }}
      >
        {races.map((race) => {
          const info = getRaceInfo(race);
          const isSelected = selectedRace === race;
          const isHovered = hoveredRace === race;

          return (
            <div
              key={race}
              onMouseEnter={() => setHoveredRace(race)}
              onClick={() => handleRaceSelect(race)}
              style={{
                width: '140px',
                height: '160px',
                background: isSelected
                  ? `linear-gradient(135deg, #${info.colors.primary.toString(16)} 0%, #${info.colors.secondary.toString(16)} 100%)`
                  : '#2a2a4e',
                border: isSelected
                  ? `3px solid #${info.colors.accent.toString(16)}`
                  : '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHovered ? 'scale(1.05) translateY(-5px)' : 'scale(1)',
                boxShadow: isHovered
                  ? `0 10px 30px rgba(${info.colors.primary}, 0.5)`
                  : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              {/* Race Icon Placeholder - just show color */}
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: `#${info.colors.primary.toString(16)}`,
                  marginBottom: '15px',
                  boxShadow: `0 0 20px rgba(${info.colors.accent}, 0.5)`,
                }}
              />

              {/* Race Name */}
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {info.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Race Details */}
      <div
        style={{
          background: 'rgba(42, 42, 78, 0.8)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          marginBottom: '30px',
          minHeight: '180px',
          display: 'flex',
          alignItems: displayRace === null ? 'center' : 'flex-start',
          justifyContent: displayRace === null ? 'center' : 'flex-start',
          flexDirection: 'column',
        }}
      >
        {displayRace === null ? (
          <div style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.5)' }}>
            Hover over a race to see details
          </div>
        ) : (
          (() => {
            const info = getRaceInfo(displayRace);
            return (
              <>
                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    color: `#${info.colors.primary.toString(16)}`,
                  }}
                >
                  {info.name}
                </h2>

                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '15px',
                    color: `#${info.colors.accent.toString(16)}`,
                  }}
                >
                  {info.passive}
                </h3>

                <div style={{ marginBottom: '20px' }}>
                  {info.description.map((line, index) => (
                    <div
                      key={index}
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.8',
                        marginBottom: '5px',
                      }}
                    >
                      {line}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  Starting Tower: {info.startingTower}
                </div>
              </>
            );
          })()
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={handleStartRun}
        disabled={selectedRace === null}
        style={{
          padding: '15px 60px',
          fontSize: '24px',
          fontWeight: 'bold',
          background:
            selectedRace !== null
              ? 'linear-gradient(135deg, #8a2be2 0%, #4b0082 100%)'
              : '#555',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: selectedRace !== null ? 'pointer' : 'not-allowed',
          transition: 'all 0.3s ease',
          boxShadow:
            selectedRace !== null
              ? '0 4px 15px rgba(138, 43, 226, 0.5)'
              : 'none',
          opacity: selectedRace !== null ? 1 : 0.5,
        }}
        onMouseEnter={(e) => {
          if (selectedRace !== null) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(138, 43, 226, 0.7)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow =
            selectedRace !== null ? '0 4px 15px rgba(138, 43, 226, 0.5)' : 'none';
        }}
      >
        START RUN
      </button>
    </div>
  );
}
