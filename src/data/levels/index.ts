/**
 * Level Definitions
 * Data-driven level configurations with terrain and spawn points
 */

import { LevelDefinition } from '../../types/level';
import { CellState } from '../../core/Grid';

export const LEVEL_DEFINITIONS: Record<string, LevelDefinition> = {
  grasslands: {
    id: 'grasslands',
    name: 'The Verdant Vale',
    description: 'A strategic winding path through diverse terrain with lakes, forests, and rocky outcrops',

    width: 25,
    height: 20,

    spawnGrid: { x: 0, y: 10 },
    exitGrid: { x: 24, y: 10 },
    checkpointsGrid: [
      { x: 6, y: 14 },
      { x: 12, y: 6 },
      { x: 18, y: 14 },
    ],

    terrain: [
      // LARGE NORTHERN LAKE (unbuildable water body)
      { x: 8, y: 2, type: CellState.Water },
      { x: 9, y: 2, type: CellState.Water },
      { x: 10, y: 2, type: CellState.Water },
      { x: 11, y: 2, type: CellState.Water },
      { x: 12, y: 2, type: CellState.Water },
      { x: 13, y: 2, type: CellState.Water },
      { x: 7, y: 3, type: CellState.Water },
      { x: 8, y: 3, type: CellState.Water },
      { x: 9, y: 3, type: CellState.Water },
      { x: 10, y: 3, type: CellState.Water },
      { x: 11, y: 3, type: CellState.Water },
      { x: 12, y: 3, type: CellState.Water },
      { x: 13, y: 3, type: CellState.Water },
      { x: 14, y: 3, type: CellState.Water },
      { x: 8, y: 4, type: CellState.Water },
      { x: 9, y: 4, type: CellState.Water },
      { x: 10, y: 4, type: CellState.Water },
      { x: 11, y: 4, type: CellState.Water },
      { x: 12, y: 4, type: CellState.Water },
      { x: 13, y: 4, type: CellState.Water },
      { x: 9, y: 5, type: CellState.Water },
      { x: 10, y: 5, type: CellState.Water },
      { x: 11, y: 5, type: CellState.Water },
      { x: 12, y: 5, type: CellState.Water },

      // SOUTHERN LAKE (smaller water body)
      { x: 15, y: 15, type: CellState.Water },
      { x: 16, y: 15, type: CellState.Water },
      { x: 17, y: 15, type: CellState.Water },
      { x: 15, y: 16, type: CellState.Water },
      { x: 16, y: 16, type: CellState.Water },
      { x: 17, y: 16, type: CellState.Water },
      { x: 16, y: 17, type: CellState.Water },

      // WESTERN FOREST (dense woodland)
      { x: 2, y: 2, type: CellState.Forest },
      { x: 3, y: 2, type: CellState.Forest },
      { x: 4, y: 2, type: CellState.Forest },
      { x: 2, y: 3, type: CellState.Forest },
      { x: 3, y: 3, type: CellState.Forest },
      { x: 4, y: 3, type: CellState.Forest },
      { x: 5, y: 3, type: CellState.Forest },
      { x: 2, y: 4, type: CellState.Forest },
      { x: 3, y: 4, type: CellState.Forest },
      { x: 4, y: 4, type: CellState.Forest },
      { x: 3, y: 5, type: CellState.Forest },

      // SOUTHERN FOREST (scattered trees)
      { x: 4, y: 16, type: CellState.Forest },
      { x: 5, y: 16, type: CellState.Forest },
      { x: 6, y: 16, type: CellState.Forest },
      { x: 4, y: 17, type: CellState.Forest },
      { x: 5, y: 17, type: CellState.Forest },
      { x: 6, y: 17, type: CellState.Forest },
      { x: 7, y: 17, type: CellState.Forest },
      { x: 5, y: 18, type: CellState.Forest },
      { x: 6, y: 18, type: CellState.Forest },

      // EASTERN FOREST (medium cluster)
      { x: 20, y: 3, type: CellState.Forest },
      { x: 21, y: 3, type: CellState.Forest },
      { x: 22, y: 3, type: CellState.Forest },
      { x: 20, y: 4, type: CellState.Forest },
      { x: 21, y: 4, type: CellState.Forest },
      { x: 22, y: 4, type: CellState.Forest },
      { x: 21, y: 5, type: CellState.Forest },

      // CENTRAL ROCK FORMATION (strategic chokepoint)
      { x: 11, y: 8, type: CellState.Rock },
      { x: 12, y: 8, type: CellState.Rock },
      { x: 13, y: 8, type: CellState.Rock },
      { x: 10, y: 9, type: CellState.Rock },
      { x: 11, y: 9, type: CellState.Rock },
      { x: 12, y: 9, type: CellState.Rock },
      { x: 13, y: 9, type: CellState.Rock },
      { x: 14, y: 9, type: CellState.Rock },
      { x: 11, y: 10, type: CellState.Rock },
      { x: 12, y: 10, type: CellState.Rock },
      { x: 13, y: 10, type: CellState.Rock },
      { x: 12, y: 11, type: CellState.Rock },

      // EASTERN ROCKY OUTCROP
      { x: 21, y: 15, type: CellState.Rock },
      { x: 22, y: 15, type: CellState.Rock },
      { x: 23, y: 15, type: CellState.Rock },
      { x: 21, y: 16, type: CellState.Rock },
      { x: 22, y: 16, type: CellState.Rock },
      { x: 23, y: 16, type: CellState.Rock },
      { x: 22, y: 17, type: CellState.Rock },
      { x: 23, y: 17, type: CellState.Rock },

      // WESTERN ROCK CLUSTER
      { x: 1, y: 14, type: CellState.Rock },
      { x: 2, y: 14, type: CellState.Rock },
      { x: 1, y: 15, type: CellState.Rock },

      // SCATTERED DECORATIVE ROCKS
      { x: 6, y: 7, type: CellState.Rock },
      { x: 7, y: 7, type: CellState.Rock },
      { x: 18, y: 6, type: CellState.Rock },
      { x: 19, y: 6, type: CellState.Rock },
    ],
  },

  volcanic_pass: {
    id: 'volcanic_pass',
    name: 'Infernal Crossing',
    description: 'Navigate treacherous lava rivers and volcanic rock formations in this hellish landscape',

    width: 25,
    height: 20,

    spawnGrid: { x: 1, y: 18 },
    exitGrid: { x: 23, y: 2 },
    checkpointsGrid: [
      { x: 8, y: 15 },
      { x: 16, y: 10 },
      { x: 20, y: 5 },
    ],

    terrain: [
      // MAJOR LAVA RIVER (flowing diagonally across map)
      { x: 6, y: 6, type: CellState.Lava },
      { x: 7, y: 6, type: CellState.Lava },
      { x: 7, y: 7, type: CellState.Lava },
      { x: 8, y: 7, type: CellState.Lava },
      { x: 8, y: 8, type: CellState.Lava },
      { x: 9, y: 8, type: CellState.Lava },
      { x: 9, y: 9, type: CellState.Lava },
      { x: 10, y: 9, type: CellState.Lava },
      { x: 10, y: 10, type: CellState.Lava },
      { x: 11, y: 10, type: CellState.Lava },
      { x: 11, y: 11, type: CellState.Lava },
      { x: 12, y: 11, type: CellState.Lava },
      { x: 12, y: 12, type: CellState.Lava },
      { x: 13, y: 12, type: CellState.Lava },
      { x: 13, y: 13, type: CellState.Lava },
      { x: 14, y: 13, type: CellState.Lava },

      // NORTHERN LAVA POOL
      { x: 14, y: 3, type: CellState.Lava },
      { x: 15, y: 3, type: CellState.Lava },
      { x: 16, y: 3, type: CellState.Lava },
      { x: 14, y: 4, type: CellState.Lava },
      { x: 15, y: 4, type: CellState.Lava },
      { x: 16, y: 4, type: CellState.Lava },
      { x: 17, y: 4, type: CellState.Lava },
      { x: 15, y: 5, type: CellState.Lava },
      { x: 16, y: 5, type: CellState.Lava },

      // SOUTHERN LAVA VENT
      { x: 3, y: 15, type: CellState.Lava },
      { x: 4, y: 15, type: CellState.Lava },
      { x: 5, y: 15, type: CellState.Lava },
      { x: 4, y: 16, type: CellState.Lava },

      // MASSIVE VOLCANIC ROCK FORMATION (central obstacle)
      { x: 10, y: 13, type: CellState.Rock },
      { x: 11, y: 13, type: CellState.Rock },
      { x: 12, y: 13, type: CellState.Rock },
      { x: 9, y: 14, type: CellState.Rock },
      { x: 10, y: 14, type: CellState.Rock },
      { x: 11, y: 14, type: CellState.Rock },
      { x: 12, y: 14, type: CellState.Rock },
      { x: 13, y: 14, type: CellState.Rock },
      { x: 10, y: 15, type: CellState.Rock },
      { x: 11, y: 15, type: CellState.Rock },
      { x: 12, y: 15, type: CellState.Rock },
      { x: 11, y: 16, type: CellState.Rock },

      // NORTHERN CLIFF FORMATION
      { x: 18, y: 6, type: CellState.Rock },
      { x: 19, y: 6, type: CellState.Rock },
      { x: 20, y: 6, type: CellState.Rock },
      { x: 18, y: 7, type: CellState.Rock },
      { x: 19, y: 7, type: CellState.Rock },
      { x: 20, y: 7, type: CellState.Rock },
      { x: 21, y: 7, type: CellState.Rock },
      { x: 19, y: 8, type: CellState.Rock },
      { x: 20, y: 8, type: CellState.Rock },

      // WESTERN ROCK WALL
      { x: 3, y: 8, type: CellState.Rock },
      { x: 4, y: 8, type: CellState.Rock },
      { x: 3, y: 9, type: CellState.Rock },
      { x: 4, y: 9, type: CellState.Rock },
      { x: 5, y: 9, type: CellState.Rock },
      { x: 3, y: 10, type: CellState.Rock },
      { x: 4, y: 10, type: CellState.Rock },

      // EASTERN ROCK CLUSTER
      { x: 21, y: 13, type: CellState.Rock },
      { x: 22, y: 13, type: CellState.Rock },
      { x: 21, y: 14, type: CellState.Rock },
      { x: 22, y: 14, type: CellState.Rock },
      { x: 23, y: 14, type: CellState.Rock },
      { x: 22, y: 15, type: CellState.Rock },

      // SCATTERED VOLCANIC BOULDERS
      { x: 5, y: 3, type: CellState.Rock },
      { x: 6, y: 3, type: CellState.Rock },
      { x: 7, y: 18, type: CellState.Rock },
      { x: 8, y: 18, type: CellState.Rock },
      { x: 16, y: 17, type: CellState.Rock },
      { x: 17, y: 17, type: CellState.Rock },

      // CHARRED FOREST REMNANTS (dead trees on volcanic soil)
      { x: 2, y: 3, type: CellState.Forest },
      { x: 3, y: 3, type: CellState.Forest },
      { x: 2, y: 4, type: CellState.Forest },
      { x: 19, y: 17, type: CellState.Forest },
      { x: 20, y: 17, type: CellState.Forest },
      { x: 19, y: 18, type: CellState.Forest },
    ],
  },

  frozen_tundra: {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    description: 'A treacherous icy maze with frozen lakes and rocky ice formations',

    width: 25,
    height: 20,

    spawnGrid: { x: 2, y: 1 },
    exitGrid: { x: 22, y: 18 },
    checkpointsGrid: [
      { x: 8, y: 8 },
      { x: 16, y: 12 },
    ],

    terrain: [
      // MASSIVE FROZEN LAKE (center-west)
      { x: 4, y: 8, type: CellState.Water },
      { x: 5, y: 8, type: CellState.Water },
      { x: 6, y: 8, type: CellState.Water },
      { x: 7, y: 8, type: CellState.Water },
      { x: 3, y: 9, type: CellState.Water },
      { x: 4, y: 9, type: CellState.Water },
      { x: 5, y: 9, type: CellState.Water },
      { x: 6, y: 9, type: CellState.Water },
      { x: 7, y: 9, type: CellState.Water },
      { x: 8, y: 9, type: CellState.Water },
      { x: 3, y: 10, type: CellState.Water },
      { x: 4, y: 10, type: CellState.Water },
      { x: 5, y: 10, type: CellState.Water },
      { x: 6, y: 10, type: CellState.Water },
      { x: 7, y: 10, type: CellState.Water },
      { x: 8, y: 10, type: CellState.Water },
      { x: 4, y: 11, type: CellState.Water },
      { x: 5, y: 11, type: CellState.Water },
      { x: 6, y: 11, type: CellState.Water },
      { x: 7, y: 11, type: CellState.Water },

      // EASTERN FROZEN POND
      { x: 18, y: 5, type: CellState.Water },
      { x: 19, y: 5, type: CellState.Water },
      { x: 20, y: 5, type: CellState.Water },
      { x: 18, y: 6, type: CellState.Water },
      { x: 19, y: 6, type: CellState.Water },
      { x: 20, y: 6, type: CellState.Water },
      { x: 19, y: 7, type: CellState.Water },

      // SOUTHERN ICE FIELD
      { x: 12, y: 16, type: CellState.Water },
      { x: 13, y: 16, type: CellState.Water },
      { x: 14, y: 16, type: CellState.Water },
      { x: 12, y: 17, type: CellState.Water },
      { x: 13, y: 17, type: CellState.Water },
      { x: 14, y: 17, type: CellState.Water },
      { x: 15, y: 17, type: CellState.Water },
      { x: 13, y: 18, type: CellState.Water },
      { x: 14, y: 18, type: CellState.Water },

      // ICY ROCK FORMATIONS (north)
      { x: 11, y: 2, type: CellState.Rock },
      { x: 12, y: 2, type: CellState.Rock },
      { x: 13, y: 2, type: CellState.Rock },
      { x: 10, y: 3, type: CellState.Rock },
      { x: 11, y: 3, type: CellState.Rock },
      { x: 12, y: 3, type: CellState.Rock },
      { x: 13, y: 3, type: CellState.Rock },
      { x: 14, y: 3, type: CellState.Rock },
      { x: 11, y: 4, type: CellState.Rock },
      { x: 12, y: 4, type: CellState.Rock },
      { x: 13, y: 4, type: CellState.Rock },

      // CENTRAL ROCKY BARRIER
      { x: 12, y: 10, type: CellState.Rock },
      { x: 13, y: 10, type: CellState.Rock },
      { x: 14, y: 10, type: CellState.Rock },
      { x: 11, y: 11, type: CellState.Rock },
      { x: 12, y: 11, type: CellState.Rock },
      { x: 13, y: 11, type: CellState.Rock },
      { x: 14, y: 11, type: CellState.Rock },
      { x: 15, y: 11, type: CellState.Rock },
      { x: 12, y: 12, type: CellState.Rock },
      { x: 13, y: 12, type: CellState.Rock },
      { x: 14, y: 12, type: CellState.Rock },

      // EASTERN ROCK WALL
      { x: 22, y: 9, type: CellState.Rock },
      { x: 23, y: 9, type: CellState.Rock },
      { x: 22, y: 10, type: CellState.Rock },
      { x: 23, y: 10, type: CellState.Rock },
      { x: 22, y: 11, type: CellState.Rock },
      { x: 23, y: 11, type: CellState.Rock },
      { x: 22, y: 12, type: CellState.Rock },

      // SPARSE TUNDRA VEGETATION (hardy trees)
      { x: 1, y: 5, type: CellState.Forest },
      { x: 2, y: 5, type: CellState.Forest },
      { x: 1, y: 6, type: CellState.Forest },
      { x: 15, y: 4, type: CellState.Forest },
      { x: 16, y: 4, type: CellState.Forest },
      { x: 17, y: 4, type: CellState.Forest },
      { x: 16, y: 5, type: CellState.Forest },
      { x: 8, y: 14, type: CellState.Forest },
      { x: 9, y: 14, type: CellState.Forest },
      { x: 8, y: 15, type: CellState.Forest },
      { x: 19, y: 15, type: CellState.Forest },
      { x: 20, y: 15, type: CellState.Forest },
      { x: 19, y: 16, type: CellState.Forest },

      // SCATTERED ICE BOULDERS
      { x: 5, y: 3, type: CellState.Rock },
      { x: 6, y: 3, type: CellState.Rock },
      { x: 18, y: 13, type: CellState.Rock },
      { x: 19, y: 13, type: CellState.Rock },
      { x: 4, y: 17, type: CellState.Rock },
      { x: 5, y: 17, type: CellState.Rock },
    ],
  },
};
