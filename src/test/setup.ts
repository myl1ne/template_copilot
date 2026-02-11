/**
 * Vitest Test Setup
 *
 * This file runs before all tests to configure the testing environment.
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window globals that the game uses
global.window = global.window || ({} as any);
global.window.game = null as any;
global.window.runManager = null as any;
global.window.rewardSystem = null as any;
global.window.selectedTowerForPlacement = null as any;

// Mock PIXI.js to avoid WebGL initialization in tests
vi.mock('pixi.js', () => {
  const mockContainer = {
    addChild: vi.fn(),
    removeChild: vi.fn(),
    removeChildren: vi.fn(),
    destroy: vi.fn(),
    children: [],
    x: 0,
    y: 0,
    rotation: 0,
    scale: { x: 1, y: 1, set: vi.fn() },
    alpha: 1,
    visible: true,
    parent: null,
    width: 0,
    height: 0,
  };

  const mockGraphics = {
    ...mockContainer,
    clear: vi.fn(),
    beginFill: vi.fn(),
    drawRect: vi.fn(),
    drawCircle: vi.fn(),
    drawPolygon: vi.fn(),
    endFill: vi.fn(),
    lineStyle: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    tint: 0xffffff,
  };

  const mockTexture = {
    baseTexture: { scaleMode: 0 },
    width: 32,
    height: 32,
  };

  const mockSprite = {
    ...mockContainer,
    texture: mockTexture,
    anchor: { x: 0.5, y: 0.5, set: vi.fn() },
  };

  return {
    Application: vi.fn(() => ({
      stage: mockContainer,
      renderer: {
        view: document.createElement('canvas'),
        resize: vi.fn(),
      },
      ticker: {
        add: vi.fn(),
        stop: vi.fn(),
      },
      destroy: vi.fn(),
    })),
    Container: vi.fn(() => mockContainer),
    Graphics: vi.fn(() => mockGraphics),
    Sprite: vi.fn(() => mockSprite),
    Texture: {
      from: vi.fn(() => mockTexture),
      EMPTY: mockTexture,
    },
    Text: vi.fn(() => ({
      ...mockContainer,
      text: '',
      style: {},
    })),
    SCALE_MODES: {
      NEAREST: 0,
      LINEAR: 1,
    },
  };
});

// Mock Howler.js audio
vi.mock('howler', () => ({
  Howl: vi.fn(() => ({
    play: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    volume: vi.fn(),
    on: vi.fn(),
  })),
}));

// Mock requestAnimationFrame for game loop tests
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 16);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  global.window.game = null as any;
  global.window.runManager = null as any;
  global.window.rewardSystem = null as any;
  global.window.selectedTowerForPlacement = null as any;
});
