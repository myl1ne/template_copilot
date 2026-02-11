/**
 * Procedural Art System - Type Definitions
 *
 * Defines the structure for procedurally generated visuals using PixiJS primitives.
 * Visual definitions are data-driven and composable for easy content creation.
 */

import * as PIXI from 'pixi.js';

/**
 * Base shape interface with common properties
 */
interface BaseShape {
  // Position relative to entity center
  offset?: { x: number; y: number };

  // Rotation in radians (can be 'dynamic' to use entity rotation)
  rotation?: number | 'dynamic';

  // Z-order within entity (0 = back, higher = front)
  layer?: number;

  // Visual properties
  fill?: number | 'dynamic'; // Color hex or 'dynamic' for state-based
  fillAlpha?: number;
  stroke?: number | 'dynamic';
  strokeWidth?: number;
  strokeAlpha?: number;

  // Animation properties
  pulseSpeed?: number; // Breathing effect speed
  rotateSpeed?: number; // Spinning effect speed
  scaleWithHealth?: boolean; // Scale based on entity health percentage

  // Conditional rendering
  hideWhenAttacking?: boolean;
  showWhenAttacking?: boolean;
}

/**
 * Circle shape
 */
export interface CircleShape extends BaseShape {
  type: 'circle';
  radius: number;
}

/**
 * Rectangle shape
 */
export interface RectShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
  centered?: boolean; // If true, draws from center instead of top-left
}

/**
 * Polygon shape (defined by points)
 */
export interface PolygonShape extends BaseShape {
  type: 'polygon';
  points: number[]; // Flat array [x1, y1, x2, y2, ...]
}

/**
 * Line shape
 */
export interface LineShape extends BaseShape {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Arc shape (partial circle)
 */
export interface ArcShape extends BaseShape {
  type: 'arc';
  radius: number;
  startAngle: number; // In radians
  endAngle: number; // In radians
}

/**
 * Star shape
 */
export interface StarShape extends BaseShape {
  type: 'star';
  points: number; // Number of star points
  radius: number; // Outer radius
  innerRadius: number; // Inner radius
}

/**
 * Union type for all shapes
 */
export type Shape = CircleShape | RectShape | PolygonShape | LineShape | ArcShape | StarShape;

/**
 * Range indicator configuration
 */
export interface RangeIndicator {
  color: number;
  alpha: number;
  showAlways?: boolean; // If false, only show on hover
}

/**
 * Health bar configuration
 */
export interface HealthBar {
  width: number;
  height: number;
  offsetY: number; // Y offset from entity center
  backgroundColor: number;
  foregroundColor: number | 'gradient'; // Can be health-based gradient
}

/**
 * Complete visual definition for an entity
 */
export interface VisualDefinition {
  // Array of shapes to render (base/body - never rotates for towers)
  shapes: Shape[];

  // Optional turret shapes for towers (rotates to face target)
  // If not provided, entire shapes array rotates (old behavior)
  turretShapes?: Shape[];

  // Optional custom renderer for complex/animated visuals
  customRenderer?: (graphics: PIXI.Graphics, state: EntityRenderState) => void;

  // Optional range indicator (for towers)
  rangeIndicator?: RangeIndicator;

  // Optional health bar (for monsters)
  healthBar?: HealthBar;
}

/**
 * Entity render state passed to renderers
 */
export interface EntityRenderState {
  // Entity properties
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  tint?: number;

  // State flags
  isAttacking?: boolean;
  healthPercent?: number; // 0 to 1
  level?: number; // For towers
  canFly?: boolean; // For monsters

  // Animation
  time: number; // Global time for animations
  timeSinceLastAttack?: number;

  // Tower-specific
  range?: number;

  // Custom data
  [key: string]: any;
}
