/**
 * Core game types and enums
 */

export enum GameState {
  Menu = 'menu',
  RunSetup = 'run_setup', // Race selection screen
  Playing = 'playing',
  Paused = 'paused',
  WaveComplete = 'wave_complete',
  GameOver = 'game_over',
  Victory = 'victory',
}

export enum DamageType {
  Physical = 'physical',
  Fire = 'fire',
  Ice = 'ice',
  Lightning = 'lightning',
  Shadow = 'shadow',
  Holy = 'holy',
  Void = 'void',
}

export enum TowerRace {
  Undead = 'undead',
  Elven = 'elven',
  Human = 'human',
  Mechanical = 'mechanical',
  Elemental = 'elemental',
}

export enum TargetPriority {
  First = 'first',       // Closest to exit
  Last = 'last',         // Closest to spawn
  Strongest = 'strongest', // Highest health
  Weakest = 'weakest',   // Lowest health
  Closest = 'closest',   // Closest to tower
}

export enum ProjectileType {
  Arrow = 'arrow',
  Bullet = 'bullet',
  Magic = 'magic',
  Laser = 'laser',
  None = 'none', // Instant hit
}

export interface Resistances {
  [DamageType.Physical]: number;
  [DamageType.Fire]: number;
  [DamageType.Ice]: number;
  [DamageType.Lightning]: number;
  [DamageType.Shadow]: number;
  [DamageType.Holy]: number;
  [DamageType.Void]: number;
}

export interface GameConfig {
  gridWidth: number;
  gridHeight: number;
  cellSize: number;
  startingGold: number;
  startingLives: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  gridWidth: 25,
  gridHeight: 20,
  cellSize: 32,
  startingGold: 300,
  startingLives: 20,
};
