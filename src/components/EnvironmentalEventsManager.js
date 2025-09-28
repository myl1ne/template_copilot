// Environmental Events Manager - Handles climate changes and disaster events
import { BIOME_TYPES } from './BiomeConfig';

export class EnvironmentalEventsManager {
  constructor() {
    this.activeClimate = {
      temperature: 50,
      humidity: 50,
      seasonalIntensity: 50
    };
    
    this.activeDisasters = new Map(); // Track ongoing disasters
    this.eventListeners = new Map(); // Event callbacks
    this.resourceModifications = [];
    
    // Default environmental multipliers
    this.baseMultipliers = {
      energyDrain: 1.0,
      speed: 1.0,
      reproduction: 1.0,
      foodAvailability: 1.0,
      foodEnergy: 1.0
    };
    
    this.currentMultipliers = { ...this.baseMultipliers };
  }

  // Event listener management
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  removeEventListener(eventType, callback) {
    if (this.eventListeners.has(eventType)) {
      const listeners = this.eventListeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(eventType, data) {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  // Climate management
  updateClimate(newClimateSettings) {
    const oldClimate = { ...this.activeClimate };
    this.activeClimate = { ...this.activeClimate, ...newClimateSettings };
    
    this.calculateClimateEffects();
    
    this.emitEvent('climateChanged', {
      oldClimate,
      newClimate: this.activeClimate,
      effects: this.getClimateEffects()
    });
  }

  calculateClimateEffects() {
    const { temperature, humidity, seasonalIntensity } = this.activeClimate;
    
    // Temperature effects (0-100 scale, 50 is normal)
    let tempMultiplier = 1.0;
    let tempEnergyEffect = 1.0;
    let tempSpeedEffect = 1.0;
    
    if (temperature < 25) { // Cold
      tempEnergyEffect = 1.3; // More energy needed to stay warm
      tempSpeedEffect = 0.7; // Slower movement
      tempMultiplier = 0.6; // Reduced reproduction
    } else if (temperature > 75) { // Hot
      tempEnergyEffect = 1.4; // More energy lost to cooling
      tempSpeedEffect = 1.2; // Faster movement (seeking shade/water)
      tempMultiplier = 0.7; // Heat stress reduces reproduction
    }

    // Humidity effects
    let humidityFoodEffect = 1.0;
    let humiditySpeedEffect = 1.0;
    let humidityReproEffect = 1.0;
    
    if (humidity < 25) { // Arid
      humidityFoodEffect = 0.7; // Less food growth
      humidityReproEffect = 0.8; // Harder reproduction
    } else if (humidity > 75) { // Very humid
      humidityFoodEffect = 1.3; // More food growth
      humiditySpeedEffect = 0.9; // Slightly slower in thick air
      humidityReproEffect = 1.2; // Better reproduction conditions
    }

    // Seasonal intensity effects (adds variation over time)
    const seasonalVariation = this.getSeasonalVariation(seasonalIntensity);
    
    // Combine effects
    this.currentMultipliers = {
      energyDrain: tempEnergyEffect * seasonalVariation.energy,
      speed: tempSpeedEffect * humiditySpeedEffect * seasonalVariation.speed,
      reproduction: tempMultiplier * humidityReproEffect * seasonalVariation.reproduction,
      foodAvailability: humidityFoodEffect * seasonalVariation.food,
      foodEnergy: 1.0 * seasonalVariation.foodEnergy
    };
  }

  getSeasonalVariation(intensity) {
    const time = Date.now() / 1000; // Current time in seconds
    const seasonCycle = Math.sin(time * 0.1) * (intensity / 100); // Slow seasonal cycle
    
    return {
      energy: 1.0 + seasonCycle * 0.3,
      speed: 1.0 + seasonCycle * 0.2,
      reproduction: 1.0 + seasonCycle * 0.4,
      food: 1.0 + seasonCycle * 0.5,
      foodEnergy: 1.0 + seasonCycle * 0.3
    };
  }

  getClimateEffects() {
    return {
      multipliers: { ...this.currentMultipliers },
      description: this.getClimateDescription()
    };
  }

  getClimateDescription() {
    const { temperature, humidity, seasonalIntensity } = this.activeClimate;
    const descriptions = [];
    
    if (temperature < 25) descriptions.push('❄️ Cold climate reducing activity');
    else if (temperature > 75) descriptions.push('🔥 Hot climate increasing energy needs');
    
    if (humidity < 25) descriptions.push('🏜️ Arid conditions limiting resources');
    else if (humidity > 75) descriptions.push('🌧️ Humid conditions boosting growth');
    
    if (seasonalIntensity > 75) descriptions.push('🍂 Extreme seasonal variations');
    else if (seasonalIntensity < 25) descriptions.push('🌍 Stable year-round conditions');
    
    return descriptions.length > 0 ? descriptions.join(', ') : '🌤️ Normal climate conditions';
  }

  // Disaster management
  triggerDisaster(disasterConfig) {
    const disasterId = `disaster_${Date.now()}`;
    const disaster = {
      id: disasterId,
      type: disasterConfig.type,
      intensity: disasterConfig.intensity,
      duration: disasterConfig.duration * 1000, // Convert to milliseconds
      startTime: Date.now(),
      affectedBiome: disasterConfig.affectedBiome,
      effects: this.calculateDisasterEffects(disasterConfig)
    };
    
    this.activeDisasters.set(disasterId, disaster);
    this.applyDisasterEffects(disaster);
    
    // Schedule disaster end
    setTimeout(() => {
      this.endDisaster(disasterId);
    }, disaster.duration);
    
    this.emitEvent('disasterStarted', disaster);
    
    return disasterId;
  }

  calculateDisasterEffects(config) {
    const baseEffects = {
      energyDrain: 1.0,
      speed: 1.0,
      reproduction: 1.0,
      foodAvailability: 1.0,
      foodEnergy: 1.0,
      mortalityRate: 0.0
    };
    
    const intensityScale = config.intensity; // 0-1 scale
    
    switch (config.type) {
      case 'drought':
        return {
          ...baseEffects,
          energyDrain: 1.0 + intensityScale * 0.8,
          foodAvailability: 1.0 - intensityScale * 0.7,
          foodEnergy: 1.0 - intensityScale * 0.5,
          reproduction: 1.0 - intensityScale * 0.6,
          mortalityRate: intensityScale * 0.1
        };
        
      case 'flood':
        return {
          ...baseEffects,
          speed: 1.0 - intensityScale * 0.5,
          foodAvailability: 1.0 - intensityScale * 0.4,
          reproduction: 1.0 - intensityScale * 0.3,
          mortalityRate: intensityScale * 0.05
        };
        
      case 'volcanic_eruption':
        return {
          ...baseEffects,
          energyDrain: 1.0 + intensityScale * 0.6,
          speed: 1.0 - intensityScale * 0.3,
          foodAvailability: 1.0 - intensityScale * 0.8,
          reproduction: 1.0 - intensityScale * 0.7,
          mortalityRate: intensityScale * 0.15
        };
        
      case 'meteor_impact':
        return {
          ...baseEffects,
          energyDrain: 1.0 + intensityScale * 1.0,
          speed: 1.0 - intensityScale * 0.4,
          foodAvailability: 1.0 - intensityScale * 0.9,
          foodEnergy: 1.0 - intensityScale * 0.6,
          reproduction: 1.0 - intensityScale * 0.8,
          mortalityRate: intensityScale * 0.2
        };
        
      case 'ice_age':
        return {
          ...baseEffects,
          energyDrain: 1.0 + intensityScale * 0.9,
          speed: 1.0 - intensityScale * 0.6,
          foodAvailability: 1.0 - intensityScale * 0.6,
          reproduction: 1.0 - intensityScale * 0.8,
          mortalityRate: intensityScale * 0.12
        };
        
      case 'heat_wave':
        return {
          ...baseEffects,
          energyDrain: 1.0 + intensityScale * 0.7,
          speed: 1.0 + intensityScale * 0.3,
          foodAvailability: 1.0 - intensityScale * 0.3,
          reproduction: 1.0 - intensityScale * 0.4,
          mortalityRate: intensityScale * 0.08
        };
        
      default:
        return baseEffects;
    }
  }

  applyDisasterEffects(disaster) {
    // Combine disaster effects with existing climate effects
    const combinedMultipliers = { ...this.currentMultipliers };
    
    combinedMultipliers.energyDrain *= disaster.effects.energyDrain;
    combinedMultipliers.speed *= disaster.effects.speed;
    combinedMultipliers.reproduction *= disaster.effects.reproduction;
    combinedMultipliers.foodAvailability *= disaster.effects.foodAvailability;
    combinedMultipliers.foodEnergy *= disaster.effects.foodEnergy;
    
    this.currentMultipliers = combinedMultipliers;
  }

  endDisaster(disasterId) {
    if (this.activeDisasters.has(disasterId)) {
      const disaster = this.activeDisasters.get(disasterId);
      this.activeDisasters.delete(disasterId);
      
      // Recalculate effects without this disaster
      this.recalculateAllEffects();
      
      this.emitEvent('disasterEnded', disaster);
    }
  }

  recalculateAllEffects() {
    // Start with climate effects
    this.calculateClimateEffects();
    
    // Apply all active disaster effects
    this.activeDisasters.forEach(disaster => {
      this.applyDisasterEffects(disaster);
    });
  }

  // Resource manipulation
  manipulateResources(action) {
    this.resourceModifications.push({
      ...action,
      timestamp: Date.now()
    });
    
    this.emitEvent('resourcesManipulated', action);
  }

  // Get current state
  getCurrentState() {
    return {
      climate: { ...this.activeClimate },
      multipliers: { ...this.currentMultipliers },
      activeDisasters: Array.from(this.activeDisasters.values()),
      recentResourceChanges: this.resourceModifications.slice(-10) // Last 10 changes
    };
  }

  // Get effects for creatures/environment
  getEnvironmentalEffects() {
    return this.currentMultipliers;
  }

  // Cleanup old resource modifications
  cleanupOldModifications() {
    const oneHourAgo = Date.now() - 3600000; // 1 hour
    this.resourceModifications = this.resourceModifications.filter(
      mod => mod.timestamp > oneHourAgo
    );
  }
}

// Export singleton instance
export const environmentalEventsManager = new EnvironmentalEventsManager();
export default environmentalEventsManager;