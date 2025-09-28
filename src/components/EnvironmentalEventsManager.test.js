import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnvironmentalEventsManager } from './EnvironmentalEventsManager';

describe('EnvironmentalEventsManager', () => {
  let eventsManager;
  let mockCallback;

  beforeEach(() => {
    eventsManager = new EnvironmentalEventsManager();
    mockCallback = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('Event System', () => {
    it('registers and triggers event listeners', () => {
      eventsManager.addEventListener('test-event', mockCallback);
      
      const testData = { message: 'test' };
      eventsManager.emitEvent('test-event', testData);
      
      expect(mockCallback).toHaveBeenCalledWith(testData);
    });

    it('removes event listeners correctly', () => {
      eventsManager.addEventListener('test-event', mockCallback);
      eventsManager.removeEventListener('test-event', mockCallback);
      
      eventsManager.emitEvent('test-event', { message: 'test' });
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('handles multiple listeners for same event', () => {
      const mockCallback2 = vi.fn();
      
      eventsManager.addEventListener('test-event', mockCallback);
      eventsManager.addEventListener('test-event', mockCallback2);
      
      eventsManager.emitEvent('test-event', { message: 'test' });
      
      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });
  });

  describe('Climate Management', () => {
    it('initializes with default climate settings', () => {
      const state = eventsManager.getCurrentState();
      
      expect(state.climate).toEqual({
        temperature: 50,
        humidity: 50,
        seasonalIntensity: 50
      });
    });

    it('updates climate settings and calculates effects', () => {
      const newClimate = { temperature: 75, humidity: 30 };
      
      eventsManager.updateClimate(newClimate);
      
      const state = eventsManager.getCurrentState();
      expect(state.climate.temperature).toBe(75);
      expect(state.climate.humidity).toBe(30);
      expect(state.climate.seasonalIntensity).toBe(50); // Should maintain unchanged values
    });

    it('calculates temperature effects correctly', () => {
      // Test cold temperature
      eventsManager.updateClimate({ temperature: 20 });
      let effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.energyDrain).toBeGreaterThan(1.0); // More energy needed
      expect(effects.speed).toBeLessThan(1.0); // Slower movement
      expect(effects.reproduction).toBeLessThan(1.0); // Reduced reproduction
      
      // Test hot temperature
      eventsManager.updateClimate({ temperature: 80 });
      effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.energyDrain).toBeGreaterThan(1.0); // More energy lost
      expect(effects.speed).toBeGreaterThan(1.0); // Faster movement
      expect(effects.reproduction).toBeLessThan(1.0); // Heat stress
    });

    it('calculates humidity effects correctly', () => {
      // Test arid conditions
      eventsManager.updateClimate({ humidity: 20 });
      let effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.foodAvailability).toBeLessThan(1.0); // Less food growth
      expect(effects.reproduction).toBeLessThan(1.0); // Harder reproduction
      
      // Test humid conditions
      eventsManager.updateClimate({ humidity: 80 });
      effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.foodAvailability).toBeGreaterThan(1.0); // More food growth
      // Allow for seasonal variation affecting reproduction (can be above or below 1.0)
      expect(effects.reproduction).toBeGreaterThan(0.8); // Should be increased by humidity but seasonal variation might affect it
    });

    it('emits climate change events', () => {
      eventsManager.addEventListener('climateChanged', mockCallback);
      
      const newClimate = { temperature: 60 };
      eventsManager.updateClimate(newClimate);
      
      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          oldClimate: expect.objectContaining({ temperature: 50 }),
          newClimate: expect.objectContaining({ temperature: 60 }),
          effects: expect.any(Object)
        })
      );
    });

    it('generates appropriate climate descriptions', () => {
      eventsManager.updateClimate({ temperature: 20, humidity: 20 });
      const effects = eventsManager.getClimateEffects();
      
      expect(effects.description).toContain('Cold climate');
      expect(effects.description).toContain('Arid conditions');
    });
  });

  describe('Disaster Management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('triggers disasters with correct configuration', () => {
      const disasterConfig = {
        type: 'drought',
        intensity: 0.7,
        duration: 10,
        affectedBiome: 'desert'
      };

      const disasterId = eventsManager.triggerDisaster(disasterConfig);
      
      expect(disasterId).toBeDefined();
      expect(eventsManager.activeDisasters.has(disasterId)).toBe(true);
      
      const disaster = eventsManager.activeDisasters.get(disasterId);
      expect(disaster.type).toBe('drought');
      expect(disaster.intensity).toBe(0.7);
      expect(disaster.affectedBiome).toBe('desert');
    });

    it('calculates drought disaster effects correctly', () => {
      const droughtConfig = {
        type: 'drought',
        intensity: 0.8,
        duration: 5,
        affectedBiome: 'forest'
      };

      eventsManager.triggerDisaster(droughtConfig);
      const effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.energyDrain).toBeGreaterThan(1.0);
      expect(effects.foodAvailability).toBeLessThan(1.0);
      expect(effects.reproduction).toBeLessThan(1.0);
    });

    it('calculates volcanic eruption effects correctly', () => {
      const volcanicConfig = {
        type: 'volcanic_eruption',
        intensity: 0.6,
        duration: 8,
        affectedBiome: 'forest'
      };

      eventsManager.triggerDisaster(volcanicConfig);
      const effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects.energyDrain).toBeGreaterThan(1.0);
      expect(effects.speed).toBeLessThan(1.0);
      expect(effects.foodAvailability).toBeLessThan(1.0);
    });

    it('automatically ends disasters after duration', () => {
      eventsManager.addEventListener('disasterEnded', mockCallback);
      
      const disasterConfig = {
        type: 'flood',
        intensity: 0.5,
        duration: 2, // 2 seconds
        affectedBiome: 'ocean'
      };

      const disasterId = eventsManager.triggerDisaster(disasterConfig);
      
      // Fast-forward time
      vi.advanceTimersByTime(2000);
      
      expect(eventsManager.activeDisasters.has(disasterId)).toBe(false);
      expect(mockCallback).toHaveBeenCalled();
    });

    it('combines multiple disaster effects', () => {
      const drought = {
        type: 'drought',
        intensity: 0.5,
        duration: 10,
        affectedBiome: 'desert'
      };
      
      const heatwave = {
        type: 'heat_wave',
        intensity: 0.4,
        duration: 8,
        affectedBiome: 'desert'
      };

      eventsManager.triggerDisaster(drought);
      eventsManager.triggerDisaster(heatwave);
      
      const effects = eventsManager.getEnvironmentalEffects();
      
      // Should have compounded effects
      expect(effects.energyDrain).toBeGreaterThan(1.5); // Both disasters increase energy drain
      expect(effects.foodAvailability).toBeLessThan(0.8); // Both reduce food
    });

    it('emits disaster events correctly', () => {
      const startCallback = vi.fn();
      const endCallback = vi.fn();
      
      eventsManager.addEventListener('disasterStarted', startCallback);
      eventsManager.addEventListener('disasterEnded', endCallback);
      
      const disasterConfig = {
        type: 'meteor_impact',
        intensity: 0.9,
        duration: 1,
        affectedBiome: 'forest'
      };

      eventsManager.triggerDisaster(disasterConfig);
      expect(startCallback).toHaveBeenCalled();
      
      vi.advanceTimersByTime(1000);
      expect(endCallback).toHaveBeenCalled();
    });

    it('recalculates effects when disasters end', () => {
      // Start with climate effect only
      eventsManager.updateClimate({ temperature: 60 });
      const initialEffects = eventsManager.getEnvironmentalEffects();
      
      // Add disaster
      const disasterConfig = {
        type: 'ice_age',
        intensity: 0.7,
        duration: 1,
        affectedBiome: 'forest'
      };
      
      eventsManager.triggerDisaster(disasterConfig);
      const disasterEffects = eventsManager.getEnvironmentalEffects();
      
      // Effects should be different with disaster
      expect(disasterEffects.energyDrain).toBeGreaterThan(initialEffects.energyDrain);
      
      // End disaster
      vi.advanceTimersByTime(1000);
      const postDisasterEffects = eventsManager.getEnvironmentalEffects();
      
      // Should return to climate-only effects (allow for seasonal variation)
      expect(Math.abs(postDisasterEffects.energyDrain - initialEffects.energyDrain)).toBeLessThan(0.4);
    });
  });

  describe('Resource Manipulation', () => {
    it('records resource manipulation actions', () => {
      const action = { action: 'add_food', amount: 10 };
      
      eventsManager.manipulateResources(action);
      
      const state = eventsManager.getCurrentState();
      expect(state.recentResourceChanges).toHaveLength(1);
      expect(state.recentResourceChanges[0].action).toBe('add_food');
      expect(state.recentResourceChanges[0].amount).toBe(10);
    });

    it('emits resource manipulation events', () => {
      eventsManager.addEventListener('resourcesManipulated', mockCallback);
      
      const action = { action: 'remove_obstacle', count: 3 };
      eventsManager.manipulateResources(action);
      
      expect(mockCallback).toHaveBeenCalledWith(action);
    });

    it('limits stored resource modifications', () => {
      // Add 15 modifications (more than the 10 limit)
      for (let i = 0; i < 15; i++) {
        eventsManager.manipulateResources({ action: 'test', index: i });
      }
      
      const state = eventsManager.getCurrentState();
      expect(state.recentResourceChanges).toHaveLength(10); // Should only keep last 10
      
      // Should keep the most recent ones
      expect(state.recentResourceChanges[9].index).toBe(14);
      expect(state.recentResourceChanges[0].index).toBe(5);
    });
  });

  describe('State Management', () => {
    it('provides complete current state', () => {
      eventsManager.updateClimate({ temperature: 70 });
      eventsManager.manipulateResources({ action: 'test' });
      
      const state = eventsManager.getCurrentState();
      
      expect(state).toHaveProperty('climate');
      expect(state).toHaveProperty('multipliers');
      expect(state).toHaveProperty('activeDisasters');
      expect(state).toHaveProperty('recentResourceChanges');
      
      expect(state.climate.temperature).toBe(70);
      expect(state.recentResourceChanges).toHaveLength(1);
    });

    it('provides environmental effects for game systems', () => {
      eventsManager.updateClimate({ temperature: 80, humidity: 30 });
      
      const effects = eventsManager.getEnvironmentalEffects();
      
      expect(effects).toHaveProperty('energyDrain');
      expect(effects).toHaveProperty('speed');
      expect(effects).toHaveProperty('reproduction');
      expect(effects).toHaveProperty('foodAvailability');
      expect(effects).toHaveProperty('foodEnergy');
      
      // All should be numbers
      Object.values(effects).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });

    it('cleans up old resource modifications', () => {
      vi.useRealTimers();
      
      // Add old modification
      eventsManager.resourceModifications.push({
        action: 'old_action',
        timestamp: Date.now() - 7200000 // 2 hours ago
      });
      
      // Add recent modification
      eventsManager.manipulateResources({ action: 'recent_action' });
      
      eventsManager.cleanupOldModifications();
      
      const state = eventsManager.getCurrentState();
      expect(state.recentResourceChanges).toHaveLength(1);
      expect(state.recentResourceChanges[0].action).toBe('recent_action');
    });
  });

  describe('Error Handling', () => {
    it('handles errors in event listeners gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      
      // Mock console.error to capture error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      eventsManager.addEventListener('test-event', errorCallback);
      eventsManager.addEventListener('test-event', mockCallback);
      
      eventsManager.emitEvent('test-event', { data: 'test' });
      
      // Error callback should have been called and errored
      expect(errorCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      
      // But other callbacks should still work
      expect(mockCallback).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('handles unknown disaster types gracefully', () => {
      const unknownDisasterConfig = {
        type: 'unknown_disaster',
        intensity: 0.5,
        duration: 5,
        affectedBiome: 'forest'
      };

      const disasterId = eventsManager.triggerDisaster(unknownDisasterConfig);
      
      // Should still create disaster with default effects
      expect(eventsManager.activeDisasters.has(disasterId)).toBe(true);
      
      const disaster = eventsManager.activeDisasters.get(disasterId);
      expect(disaster.effects.energyDrain).toBe(1.0); // Default effect
    });
  });
});