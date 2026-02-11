/**
 * Camera System
 * Handles panning and zooming of the game view
 */

import * as PIXI from 'pixi.js';

export interface CameraConfig {
  minZoom?: number;
  maxZoom?: number;
  panSpeed?: number; // pixels per second
  zoomSpeed?: number;
  smoothing?: number; // 0-1, higher = more smoothing
}

export class CameraSystem {
  private x: number = 0;
  private y: number = 0;
  private targetX: number = 0;
  private targetY: number = 0;
  private zoom: number = 1.0;
  private targetZoom: number = 1.0;

  private minZoom: number;
  private maxZoom: number;
  private panSpeed: number;
  private zoomSpeed: number;
  private smoothing: number;

  // Pan input state
  private panKeys = {
    left: false,
    right: false,
    up: false,
    down: false,
  };

  // Mouse drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartCameraX = 0;
  private dragStartCameraY = 0;

  constructor(config: CameraConfig = {}) {
    this.minZoom = config.minZoom ?? 0.5;
    this.maxZoom = config.maxZoom ?? 2.0;
    this.panSpeed = config.panSpeed ?? 400;
    this.zoomSpeed = config.zoomSpeed ?? 0.1;
    this.smoothing = config.smoothing ?? 0.15;
  }

  /**
   * Update camera position (smooth interpolation)
   */
  update(deltaTime: number): void {
    // Apply keyboard panning
    if (this.panKeys.left) this.targetX += this.panSpeed * deltaTime;
    if (this.panKeys.right) this.targetX -= this.panSpeed * deltaTime;
    if (this.panKeys.up) this.targetY += this.panSpeed * deltaTime;
    if (this.panKeys.down) this.targetY -= this.panSpeed * deltaTime;

    // Smooth interpolation to target position
    this.x += (this.targetX - this.x) * this.smoothing;
    this.y += (this.targetY - this.y) * this.smoothing;
    this.zoom += (this.targetZoom - this.zoom) * this.smoothing;
  }

  /**
   * Apply camera transform to PIXI stage
   */
  apply(stage: PIXI.Container): void {
    stage.x = this.x;
    stage.y = this.y;
    stage.scale.set(this.zoom);
  }

  /**
   * Handle keyboard input
   */
  onKeyDown(key: string): void {
    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.panKeys.up = true;
        break;
      case 's':
      case 'arrowdown':
        this.panKeys.down = true;
        break;
      case 'a':
      case 'arrowleft':
        this.panKeys.left = true;
        break;
      case 'd':
      case 'arrowright':
        this.panKeys.right = true;
        break;
    }
  }

  onKeyUp(key: string): void {
    switch (key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        this.panKeys.up = false;
        break;
      case 's':
      case 'arrowdown':
        this.panKeys.down = false;
        break;
      case 'a':
      case 'arrowleft':
        this.panKeys.left = false;
        break;
      case 'd':
      case 'arrowright':
        this.panKeys.right = false;
        break;
    }
  }

  /**
   * Handle mouse wheel zoom
   */
  onWheel(deltaY: number): void {
    const zoomDelta = -Math.sign(deltaY) * this.zoomSpeed;
    this.targetZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.targetZoom + zoomDelta));
  }

  /**
   * Start mouse drag panning
   */
  startDrag(screenX: number, screenY: number): void {
    this.isDragging = true;
    this.dragStartX = screenX;
    this.dragStartY = screenY;
    this.dragStartCameraX = this.targetX;
    this.dragStartCameraY = this.targetY;
  }

  /**
   * Update mouse drag panning
   */
  updateDrag(screenX: number, screenY: number): void {
    if (!this.isDragging) return;

    const deltaX = screenX - this.dragStartX;
    const deltaY = screenY - this.dragStartY;

    this.targetX = this.dragStartCameraX + deltaX;
    this.targetY = this.dragStartCameraY + deltaY;
  }

  /**
   * End mouse drag panning
   */
  endDrag(): void {
    this.isDragging = false;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    return {
      x: (screenX - this.x) / this.zoom,
      y: (screenY - this.y) / this.zoom,
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: worldX * this.zoom + this.x,
      y: worldY * this.zoom + this.y,
    };
  }

  /**
   * Center camera on a world position
   */
  centerOn(worldX: number, worldY: number, viewportWidth: number, viewportHeight: number): void {
    this.targetX = viewportWidth / 2 - worldX * this.zoom;
    this.targetY = viewportHeight / 2 - worldY * this.zoom;
  }

  /**
   * Reset camera to default position
   */
  reset(viewportWidth: number, viewportHeight: number, worldWidth: number, worldHeight: number): void {
    // Center on world
    this.targetX = (viewportWidth - worldWidth * this.zoom) / 2;
    this.targetY = (viewportHeight - worldHeight * this.zoom) / 2;
    this.targetZoom = 1.0;

    // Set actual position immediately (no interpolation delay)
    this.x = this.targetX;
    this.y = this.targetY;
    this.zoom = this.targetZoom;
  }

  /**
   * Get current camera state
   */
  getState() {
    return {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      targetX: this.targetX,
      targetY: this.targetY,
      targetZoom: this.targetZoom,
    };
  }

  /**
   * Check if currently dragging
   */
  isDraggingCamera(): boolean {
    return this.isDragging;
  }
}
