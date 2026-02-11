/**
 * Game loop using requestAnimationFrame
 */
export class GameLoop {
  private animationId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly fixedTimeStep: number = 1 / 60; // 60 FPS
  private readonly maxFrameTime: number = 0.25; // Max 250ms to prevent spiral of death

  constructor(
    private updateCallback: (deltaTime: number) => void,
    private renderCallback: () => void
  ) {}

  /**
   * Start the game loop
   */
  start(): void {
    if (this.animationId !== null) {
      return; // Already running
    }

    this.lastTime = performance.now() / 1000; // Convert to seconds
    this.accumulator = 0;
    this.loop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Check if the loop is running
   */
  isRunning(): boolean {
    return this.animationId !== null;
  }

  /**
   * Main loop function
   */
  private loop = (): void => {
    this.animationId = requestAnimationFrame(this.loop);

    const currentTime = performance.now() / 1000;
    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death - cap delta time
    if (deltaTime > this.maxFrameTime) {
      deltaTime = this.maxFrameTime;
    }

    // Accumulate time
    this.accumulator += deltaTime;

    // Fixed time step updates
    while (this.accumulator >= this.fixedTimeStep) {
      this.updateCallback(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Render
    this.renderCallback();
  };
}
