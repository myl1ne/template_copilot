/**
 * Vector2 Tests
 *
 * Tests for 2D vector math operations
 */

import { describe, it, expect } from 'vitest';
import { Vector2 } from './Vector2';

describe('Vector2', () => {
  describe('construction', () => {
    it('should create a vector with x and y coordinates', () => {
      const vec = new Vector2(3, 4);
      expect(vec.x).toBe(3);
      expect(vec.y).toBe(4);
    });

    it('should create zero vector when no arguments provided', () => {
      const vec = new Vector2();
      expect(vec.x).toBe(0);
      expect(vec.y).toBe(0);
    });
  });

  describe('addition', () => {
    it('should add two vectors', () => {
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(3, 4);
      const result = v1.add(v2);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
      expect(result).toBe(v1); // Returns this (mutable)
    });

    it('should modify original vector (mutable)', () => {
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(3, 4);
      v1.add(v2);

      expect(v1.x).toBe(4);
      expect(v1.y).toBe(6);
    });
  });

  describe('subtraction', () => {
    it('should subtract two vectors', () => {
      const v1 = new Vector2(5, 7);
      const v2 = new Vector2(2, 3);
      const result = v1.sub(v2);

      expect(result.x).toBe(3);
      expect(result.y).toBe(4);
      expect(result).toBe(v1); // Returns this (mutable)
    });

    it('should handle negative results', () => {
      const v1 = new Vector2(1, 2);
      const v2 = new Vector2(3, 5);
      const result = v1.sub(v2);

      expect(result.x).toBe(-2);
      expect(result.y).toBe(-3);
    });
  });

  describe('multiplication', () => {
    it('should multiply vector by scalar', () => {
      const vec = new Vector2(2, 3);
      const result = vec.multiplyScalar(2);

      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
      expect(result).toBe(vec); // Returns this (mutable)
    });

    it('should handle negative scalars', () => {
      const vec = new Vector2(2, 3);
      const result = vec.multiplyScalar(-1);

      expect(result.x).toBe(-2);
      expect(result.y).toBe(-3);
    });

    it('should handle zero scalar', () => {
      const vec = new Vector2(5, 7);
      const result = vec.multiplyScalar(0);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('division', () => {
    it('should divide vector by scalar', () => {
      const vec = new Vector2(10, 20);
      const result = vec.divideScalar(2);

      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result).toBe(vec); // Returns this (mutable)
    });

    it('should handle fractional results', () => {
      const vec = new Vector2(5, 7);
      const result = vec.divideScalar(2);

      expect(result.x).toBe(2.5);
      expect(result.y).toBe(3.5);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude correctly', () => {
      const vec = new Vector2(3, 4);
      expect(vec.length()).toBe(5); // 3-4-5 triangle
    });

    it('should return zero for zero vector', () => {
      const vec = new Vector2(0, 0);
      expect(vec.length()).toBe(0);
    });

    it('should calculate squared magnitude', () => {
      const vec = new Vector2(3, 4);
      expect(vec.lengthSq()).toBe(25);
    });
  });

  describe('normalization', () => {
    it('should normalize vector to unit length', () => {
      const vec = new Vector2(3, 4);
      const normalized = vec.normalize();

      expect(normalized.length()).toBeCloseTo(1, 5);
      expect(normalized.x).toBeCloseTo(0.6, 5);
      expect(normalized.y).toBeCloseTo(0.8, 5);
      expect(normalized).toBe(vec); // Returns this (mutable)
    });

    it('should handle zero vector', () => {
      const vec = new Vector2(0, 0);
      const normalized = vec.normalize();

      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });
  });

  describe('distance', () => {
    it('should calculate distance between vectors', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(3, 4);

      expect(v1.distanceTo(v2)).toBe(5);
      expect(v2.distanceTo(v1)).toBe(5);
    });

    it('should calculate squared distance', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(3, 4);

      expect(v1.distanceToSquared(v2)).toBe(25);
    });

    it('should return zero for same position', () => {
      const v1 = new Vector2(5, 7);
      const v2 = new Vector2(5, 7);

      expect(v1.distanceTo(v2)).toBe(0);
    });
  });

  describe('dot product', () => {
    it('should calculate dot product', () => {
      const v1 = new Vector2(2, 3);
      const v2 = new Vector2(4, 5);

      // 2*4 + 3*5 = 8 + 15 = 23
      expect(v1.dot(v2)).toBe(23);
    });

    it('should be zero for perpendicular vectors', () => {
      const v1 = new Vector2(1, 0);
      const v2 = new Vector2(0, 1);

      expect(v1.dot(v2)).toBe(0);
    });
  });

  describe('angle', () => {
    it('should calculate angle to another vector', () => {
      const v1 = new Vector2(0, 0);
      const v2 = new Vector2(1, 0);

      // angleTo calculates the direction angle from v1 to v2
      expect(v1.angleTo(v2)).toBeCloseTo(0, 5);
    });

    it('should calculate angle in different directions', () => {
      const origin = new Vector2(0, 0);
      const right = new Vector2(1, 0);
      const up = new Vector2(0, 1);
      const left = new Vector2(-1, 0);

      expect(origin.angleTo(right)).toBeCloseTo(0, 5);
      expect(origin.angleTo(up)).toBeCloseTo(Math.PI / 2, 5);
      expect(origin.angleTo(left)).toBeCloseTo(Math.PI, 5);
    });
  });

  describe('rotation', () => {
    it('should rotate vector by angle', () => {
      const vec = new Vector2(1, 0);
      const rotated = vec.rotate(Math.PI / 2);

      expect(rotated.x).toBeCloseTo(0, 5);
      expect(rotated.y).toBeCloseTo(1, 5);
      expect(rotated).toBe(vec); // Returns this (mutable)
    });

    it('should handle full rotation', () => {
      const vec = new Vector2(3, 4);
      const rotated = vec.rotate(Math.PI * 2);

      expect(rotated.x).toBeCloseTo(3, 5);
      expect(rotated.y).toBeCloseTo(4, 5);
    });
  });

  describe('cloning', () => {
    it('should create independent copy', () => {
      const original = new Vector2(3, 4);
      const clone = original.clone();

      expect(clone.x).toBe(3);
      expect(clone.y).toBe(4);
      expect(clone).not.toBe(original);
    });
  });

  describe('equality', () => {
    it('should check equality correctly', () => {
      const v1 = new Vector2(3, 4);
      const v2 = new Vector2(3, 4);
      const v3 = new Vector2(3, 5);

      expect(v1.equals(v2)).toBe(true);
      expect(v1.equals(v3)).toBe(false);
    });
  });

  describe('static methods', () => {
    it('should create zero vector', () => {
      const zero = Vector2.zero();
      expect(zero.x).toBe(0);
      expect(zero.y).toBe(0);
    });

    it('should create one vector', () => {
      const one = Vector2.one();
      expect(one.x).toBe(1);
      expect(one.y).toBe(1);
    });
  });
});
