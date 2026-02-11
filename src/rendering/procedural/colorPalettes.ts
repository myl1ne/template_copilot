/**
 * Color Palettes for Tower Races and Monster Types
 *
 * Defines color schemes for each race/type to create visual identity.
 * These colors are used in procedural art generation.
 */

import { TowerRace } from '../../types/game';

/**
 * Color palette structure
 */
export interface ColorPalette {
  primary: number; // Main color for base/body
  secondary: number; // Accent color for highlights
  accent: number; // Bright color for effects/glows
  dark: number; // Dark variant for shadows/borders
}

/**
 * Race-specific color palettes for towers
 */
export const RACE_COLORS: Record<TowerRace, ColorPalette> = {
  [TowerRace.Human]: {
    primary: 0x4488ff, // Blue
    secondary: 0x2244aa, // Dark blue
    accent: 0x88bbff, // Light blue
    dark: 0x112266, // Very dark blue
  },
  [TowerRace.Elemental]: {
    primary: 0xff4500, // Orange-red (fire)
    secondary: 0xffaa00, // Orange
    accent: 0xffff00, // Yellow (bright flames)
    dark: 0xaa2200, // Dark red
  },
  [TowerRace.Undead]: {
    primary: 0x663399, // Purple
    secondary: 0x442266, // Dark purple
    accent: 0x8800ff, // Bright purple (necromantic glow)
    dark: 0x220033, // Very dark purple
  },
  [TowerRace.Elven]: {
    primary: 0x22aa22, // Green (nature)
    secondary: 0x116611, // Dark green
    accent: 0x88ff88, // Light green
    dark: 0x003300, // Very dark green
  },
  [TowerRace.Mechanical]: {
    primary: 0x888888, // Gray (metal)
    secondary: 0x444444, // Dark gray
    accent: 0xcccccc, // Light gray (chrome)
    dark: 0x222222, // Very dark gray
  },
};

/**
 * Monster type color schemes
 */
export const MONSTER_COLORS = {
  corrupted: {
    primary: 0x663399, // Purple (corruption)
    secondary: 0x442266,
    accent: 0xaa00ff, // Glowing purple
    dark: 0x330055,
  },
  shadow: {
    primary: 0x333366, // Dark gray-blue
    secondary: 0x111133,
    accent: 0xff0000, // Red eyes
    dark: 0x000011,
  },
  undead: {
    primary: 0x666644, // Bone white-ish
    secondary: 0x444422,
    accent: 0x88ff44, // Sickly green glow
    dark: 0x222211,
  },
  elemental: {
    primary: 0xff6600, // Fire/lava orange
    secondary: 0xaa4400,
    accent: 0xffff00, // Bright yellow
    dark: 0x662200,
  },
  elite: {
    primary: 0x8844ff, // Royal purple
    secondary: 0x5522aa,
    accent: 0xffaa00, // Gold accent
    dark: 0x331166,
  },
  boss: {
    primary: 0xff0044, // Deep red
    secondary: 0xaa0022,
    accent: 0xff8800, // Orange glow
    dark: 0x660011,
  },
};

/**
 * Damage type colors (for projectiles and effects)
 */
export const DAMAGE_TYPE_COLORS = {
  physical: 0xcccccc, // Gray
  fire: 0xff4400, // Orange-red
  ice: 0x00ccff, // Cyan
  lightning: 0xffff00, // Yellow
  shadow: 0x6600cc, // Purple
  holy: 0xffff88, // Bright yellow-white
  void: 0x000000, // Black with purple tint
};

/**
 * Helper function to get race colors
 */
export function getRaceColors(race: TowerRace): ColorPalette {
  return RACE_COLORS[race];
}

/**
 * Helper function to get monster type colors
 */
export function getMonsterColors(type: keyof typeof MONSTER_COLORS): ColorPalette {
  return MONSTER_COLORS[type];
}

/**
 * Helper function to get damage type color
 */
export function getDamageTypeColor(type: keyof typeof DAMAGE_TYPE_COLORS): number {
  return DAMAGE_TYPE_COLORS[type];
}

/**
 * Interpolate between two colors based on percentage
 */
export function interpolateColor(color1: number, color2: number, percent: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;

  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * percent);
  const g = Math.round(g1 + (g2 - g1) * percent);
  const b = Math.round(b1 + (b2 - b1) * percent);

  return (r << 16) | (g << 8) | b;
}
