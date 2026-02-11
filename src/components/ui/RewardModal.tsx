/**
 * Reward Modal - Shows reward choices after wave completion
 */

import { useGameStore } from '../../store/gameStore';
import { useRunStore } from '../../store/runStore';
import { GameState } from '../../types/game';
import { Reward, RewardType } from '../../roguelike/types';

export function RewardModal() {
  const gameState = useGameStore((state) => state.gameState);
  const currentRewards = useRunStore((state) => state.currentRewards);
  const selectReward = useRunStore((state) => state.selectReward);
  const currentWave = useGameStore((state) => state.currentWave);

  if (gameState !== GameState.WaveComplete || !currentRewards) return null;

  const handleSelectReward = (reward: Reward) => {
    selectReward(reward);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(15, 15, 30, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <div
        style={{
          background: 'rgba(26, 26, 46, 0.95)',
          border: '2px solid rgba(102, 126, 234, 0.5)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '900px',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: '32px',
            color: '#ffffff',
          }}
        >
          Wave {currentWave} Complete!
        </h2>
        <p
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            fontSize: '16px',
            opacity: 0.7,
            color: '#ffffff',
          }}
        >
          Choose Your Reward
        </p>

        <div style={{ display: 'flex', gap: '24px' }}>
          {currentRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onSelect={() => handleSelectReward(reward)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual reward card
 */
function RewardCard({ reward, onSelect }: { reward: Reward; onSelect: () => void }) {
  const rarityColors = {
    common: '#667eea',
    rare: '#f093fb',
    epic: '#ffd700',
  };

  const rarityColor = rarityColors[reward.rarity];

  return (
    <button
      onClick={onSelect}
      style={{
        padding: '24px',
        background: 'rgba(26, 26, 46, 0.8)',
        border: `2px solid ${rarityColor}`,
        borderRadius: '12px',
        cursor: 'pointer',
        minWidth: '250px',
        maxWidth: '280px',
        transition: 'transform 0.2s',
        color: '#ffffff',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {/* Icon */}
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{getRewardIcon(reward.type)}</div>

      {/* Name */}
      <h3
        style={{
          color: rarityColor,
          marginBottom: '12px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        {reward.name}
      </h3>

      {/* Description */}
      <p
        style={{
          opacity: 0.8,
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {reward.description}
      </p>

      {/* Rarity badge */}
      <div
        style={{
          marginTop: '16px',
          padding: '4px 12px',
          background: `${rarityColor}22`,
          border: `1px solid ${rarityColor}`,
          borderRadius: '12px',
          display: 'inline-block',
          fontSize: '12px',
          fontWeight: 'bold',
          color: rarityColor,
          textTransform: 'uppercase',
        }}
      >
        {reward.rarity}
      </div>
    </button>
  );
}

/**
 * Get emoji icon for reward type
 */
function getRewardIcon(type: RewardType): string {
  switch (type) {
    case RewardType.NewTower:
      return '🏰';
    case RewardType.Gold:
      return '💰';
    case RewardType.ExtraLife:
      return '❤️';
    case RewardType.GlobalBuff:
      return '✨';
    default:
      return '🎁';
  }
}
