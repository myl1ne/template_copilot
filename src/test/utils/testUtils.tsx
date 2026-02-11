/**
 * Test Utilities
 *
 * Helper functions for testing React components and game systems
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Grid } from '../../core/Grid';
import { CellState } from '../../types/level';
import { Tower } from '../../entities/towers/Tower';
import { Monster } from '../../entities/monsters/Monster';
import { TowerDefinition, MonsterDefinition } from '../../types/entities';
import { TowerRace, DamageType, TargetPriority, ProjectileType } from '../../types/game';
import { Vector2 } from '../../core/math/Vector2';
import { PathNode } from '../../core/pathfinding/PathNode';
import { AStarPathfinder } from '../../core/pathfinding/AStar';
import { TowerManager } from '../../entities/towers/TowerManager';
import { MonsterManager } from '../../entities/monsters/MonsterManager';
import { ProjectileManager } from '../../entities/projectiles/ProjectileManager';

/**
 * Render a React component with default providers
 */
export function renderWithStores(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Create a test grid with specified dimensions
 */
export function createTestGrid(width: number = 10, height: number = 10): Grid {
  const grid = new Grid(width, height, 32);
  return grid;
}

/**
 * Create a mock tower definition for testing
 */
export function createMockTowerDefinition(overrides?: Partial<TowerDefinition>): TowerDefinition {
  return {
    id: 'test_tower',
    name: 'Test Tower',
    race: TowerRace.Human,
    description: 'A test tower',
    loreText: 'Used for testing',

    baseCost: 100,
    baseDamage: 10,
    baseAttackSpeed: 1.0,
    baseRange: 100,
    damageType: DamageType.Physical,

    upgradeCostMultiplier: 1.5,
    damagePerLevel: 5,
    rangePerLevel: 10,
    attackSpeedPerLevel: 0.1,
    maxLevel: 10,

    abilities: ['test_ability_1', 'test_ability_2'],
    targetPriority: TargetPriority.First,
    projectileType: ProjectileType.Arrow,
    projectileSpeed: 400,

    spriteKey: 'test_tower',
    visual: {
      shapes: [
        {
          type: 'circle',
          radius: 10,
          fill: 0xff0000,
          layer: 0,
        }
      ],
    },
    ...overrides,
  };
}

/**
 * Create a mock monster definition for testing
 */
export function createMockMonsterDefinition(overrides?: Partial<MonsterDefinition>): MonsterDefinition {
  return {
    id: 'test_monster',
    name: 'Test Monster',
    description: 'A test monster',
    loreText: 'Used for testing',

    baseHealth: 100,
    baseSpeed: 50,
    baseArmor: 0,
    goldReward: 10,

    resistances: {
      [DamageType.Physical]: 0,
      [DamageType.Fire]: 0,
      [DamageType.Ice]: 0,
      [DamageType.Lightning]: 0,
      [DamageType.Shadow]: 0,
      [DamageType.Holy]: 0,
      [DamageType.Void]: 0,
    },

    isBoss: false,
    canFly: false,

    spriteKey: 'test_monster',
    visualDescription: 'A test monster',
    visual: {
      shapes: [
        {
          type: 'circle',
          radius: 8,
          fill: 0x00ff00,
          layer: 0,
        }
      ],
      healthBar: {
        width: 32,
        height: 4,
        offsetY: -16,
        backgroundColor: 0x000000,
        foregroundColor: 'gradient',
      },
    },
    ...overrides,
  };
}

/**
 * Create a mock Tower instance for testing
 */
export function createMockTower(definition?: TowerDefinition | Partial<TowerDefinition>, x: number = 0, y: number = 0): Tower {
  const def = (definition && 'id' in definition) ? definition as TowerDefinition : createMockTowerDefinition(definition as Partial<TowerDefinition>);
  const position = new Vector2(x, y);
  // Calculate grid position (assuming 32px cell size)
  const gridPosition = new Vector2(Math.floor(x / 32), Math.floor(y / 32));
  return new Tower(def, position, gridPosition);
}

/**
 * Create a mock Monster instance for testing
 */
export function createMockMonster(definition?: MonsterDefinition | Partial<MonsterDefinition>, x: number = 0, y: number = 0): Monster {
  const def = (definition && 'id' in definition) ? definition as MonsterDefinition : createMockMonsterDefinition(definition as Partial<MonsterDefinition>);

  // Create a simple path for the monster
  const path = [
    new PathNode(new Vector2(x, y), 0, 0),
    new PathNode(new Vector2(x + 100, y + 100), 1, 1),
  ];

  const monster = new Monster(def, new Vector2(x, y), path);
  return monster;
}

/**
 * Wait for the next game loop frame
 */
export function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 16); // 60 FPS = 16ms per frame
  });
}

/**
 * Wait for multiple frames
 */
export function waitForFrames(count: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 16 * count);
  });
}

/**
 * Set a cell state in the grid
 */
export function setGridCell(grid: Grid, x: number, y: number, state: CellState): void {
  const cells = (grid as any).cells;
  if (cells && cells[y] && cells[y][x] !== undefined) {
    cells[y][x] = state;
  }
}

/**
 * Get a cell state from the grid
 */
export function getGridCell(grid: Grid, x: number, y: number): CellState {
  const cells = (grid as any).cells;
  if (cells && cells[y] && cells[y][x] !== undefined) {
    return cells[y][x];
  }
  return CellState.Empty;
}

/**
 * Create a fully configured TowerManager for testing
 */
export function createMockTowerManager(): TowerManager {
  const grid = new Grid(25, 20, 32);
  const pathfinder = new AStarPathfinder(grid);
  const spawnPoint = new Vector2(0, 320); // Left side middle
  const exitPoint = new Vector2(800, 320); // Right side middle
  const checkpoints: Vector2[] = [];

  return new TowerManager(grid, pathfinder, spawnPoint, exitPoint, checkpoints);
}

/**
 * Create a fully configured MonsterManager for testing
 */
export function createMockMonsterManager(): MonsterManager {
  const grid = new Grid(25, 20, 32);
  const pathfinder = new AStarPathfinder(grid);
  const spawnPoint = new Vector2(0, 320);
  const exitPoint = new Vector2(800, 320);
  const checkpoints: Vector2[] = [];

  return new MonsterManager(pathfinder, spawnPoint, exitPoint, checkpoints);
}

/**
 * Add a pre-created monster directly to MonsterManager for testing
 * This bypasses the normal spawn logic to allow precise test setup
 */
export function addMonsterToManager(manager: MonsterManager, monster: Monster): void {
  // Access private monsters Map for testing purposes
  (manager as any).monsters.set(monster.id, monster);
}

/**
 * Create a fully configured ProjectileManager for testing
 */
export function createMockProjectileManager(): ProjectileManager {
  return new ProjectileManager();
}
