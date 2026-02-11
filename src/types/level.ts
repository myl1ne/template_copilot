/**
 * Level Definition Types
 * Defines the structure for level data including terrain and spawn points
 */

import { CellState } from '../core/Grid';

export interface LevelDefinition {
  id: string;
  name: string;
  description: string;

  // Grid dimensions
  width: number;
  height: number;

  // Spawn and path configuration (grid coordinates)
  spawnGrid: { x: number; y: number };
  exitGrid: { x: number; y: number };
  checkpointsGrid: Array<{ x: number; y: number }>;

  // Terrain layout (sparse array - only define non-empty cells)
  terrain: Array<{
    x: number;
    y: number;
    type: CellState;
  }>;

  // Optional: Pre-placed decorations/features
  features?: Array<{
    type: 'tree' | 'rock' | 'building';
    position: { x: number; y: number };
  }>;
}
