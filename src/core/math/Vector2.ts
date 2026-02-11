/**
 * 2D Vector class for game math operations
 */
export class Vector2 {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  /**
   * Create a new Vector2 from this one
   */
  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Copy values from another vector
   */
  copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  /**
   * Add another vector to this one
   */
  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  /**
   * Subtract another vector from this one
   */
  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  /**
   * Multiply this vector by a scalar
   */
  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Divide this vector by a scalar
   */
  divideScalar(scalar: number): this {
    if (scalar === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      this.x /= scalar;
      this.y /= scalar;
    }
    return this;
  }

  /**
   * Get the length (magnitude) of this vector
   */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Get the squared length (faster than length())
   */
  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Normalize this vector (make it unit length)
   */
  normalize(): this {
    const len = this.length();
    if (len > 0) {
      this.divideScalar(len);
    }
    return this;
  }

  /**
   * Calculate distance to another vector
   */
  distanceTo(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance to another vector (faster)
   */
  distanceToSquared(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  /**
   * Calculate dot product with another vector
   */
  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  /**
   * Calculate angle to another vector in radians
   */
  angleTo(v: Vector2): number {
    return Math.atan2(v.y - this.y, v.x - this.x);
  }

  /**
   * Rotate this vector by an angle in radians
   */
  rotate(angle: number): this {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const x = this.x * cos - this.y * sin;
    const y = this.x * sin + this.y * cos;
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Linearly interpolate between this vector and another
   */
  lerp(v: Vector2, alpha: number): this {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  /**
   * Set the x and y components
   */
  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  /**
   * Check if this vector equals another
   */
  equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  /**
   * Convert to string for debugging
   */
  toString(): string {
    return `Vector2(${this.x.toFixed(2)}, ${this.y.toFixed(2)})`;
  }

  /**
   * Static factory methods
   */
  static zero(): Vector2 {
    return new Vector2(0, 0);
  }

  static one(): Vector2 {
    return new Vector2(1, 1);
  }

  static up(): Vector2 {
    return new Vector2(0, -1);
  }

  static down(): Vector2 {
    return new Vector2(0, 1);
  }

  static left(): Vector2 {
    return new Vector2(-1, 0);
  }

  static right(): Vector2 {
    return new Vector2(1, 0);
  }

  /**
   * Create a Vector2 from an angle (radians)
   */
  static fromAngle(angle: number): Vector2 {
    return new Vector2(Math.cos(angle), Math.sin(angle));
  }
}
