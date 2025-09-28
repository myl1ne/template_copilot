import React, { useState, useCallback } from 'react';
import './EnvironmentalControls.css';

export const DISASTER_TYPES = {
  DROUGHT: 'drought',
  FLOOD: 'flood',
  VOLCANIC_ERUPTION: 'volcanic_eruption',
  METEOR_IMPACT: 'meteor_impact',
  ICE_AGE: 'ice_age',
  HEAT_WAVE: 'heat_wave'
};

export const CLIMATE_PARAMETERS = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  SEASONAL_INTENSITY: 'seasonal_intensity'
};

export const EnvironmentalControls = ({ 
  onClimateChange, 
  onDisasterTrigger, 
  onResourceManipulation,
  currentBiome,
  isSimulationRunning,
  isVisible,
  onClose
}) => {
  const [climateSettings, setClimateSettings] = useState({
    temperature: 50, // 0-100 scale (0=freezing, 50=normal, 100=scorching)
    humidity: 50, // 0-100 scale (0=arid, 50=normal, 100=flooding)
    seasonalIntensity: 50 // 0-100 scale (0=no seasons, 50=normal, 100=extreme)
  });

  const [activePanel, setActivePanel] = useState('climate');
  const [selectedDisaster, setSelectedDisaster] = useState(DISASTER_TYPES.DROUGHT);
  const [disasterIntensity, setDisasterIntensity] = useState(50);

  const handleClimateChange = useCallback((parameter, value) => {
    const newSettings = { ...climateSettings, [parameter]: value };
    setClimateSettings(newSettings);
    onClimateChange?.(newSettings);
  }, [climateSettings, onClimateChange]);

  const handleDisasterTrigger = useCallback(() => {
    const disasterConfig = {
      type: selectedDisaster,
      intensity: disasterIntensity / 100, // Convert to 0-1 scale
      duration: Math.max(5, disasterIntensity / 10), // Duration in seconds
      affectedBiome: currentBiome
    };
    onDisasterTrigger?.(disasterConfig);
  }, [selectedDisaster, disasterIntensity, currentBiome, onDisasterTrigger]);

  const handleResourceManipulation = useCallback((action) => {
    onResourceManipulation?.(action);
  }, [onResourceManipulation]);

  const getDisasterDescription = (disaster) => {
    const descriptions = {
      [DISASTER_TYPES.DROUGHT]: 'Severe lack of water and food resources',
      [DISASTER_TYPES.FLOOD]: 'Excess water causing displacement and resource loss',
      [DISASTER_TYPES.VOLCANIC_ERUPTION]: 'Ash and lava destroying habitat areas',
      [DISASTER_TYPES.METEOR_IMPACT]: 'Massive impact causing widespread destruction',
      [DISASTER_TYPES.ICE_AGE]: 'Extreme cold reducing energy efficiency',
      [DISASTER_TYPES.HEAT_WAVE]: 'Extreme heat increasing energy consumption'
    };
    return descriptions[disaster] || 'Unknown disaster event';
  };

  const getClimateEffectDescription = (param, value) => {
    if (param === CLIMATE_PARAMETERS.TEMPERATURE) {
      if (value < 25) return 'Cold: Slower metabolism, less reproduction';
      if (value > 75) return 'Hot: Higher energy drain, faster movement';
      return 'Normal: Balanced conditions';
    }
    if (param === CLIMATE_PARAMETERS.HUMIDITY) {
      if (value < 25) return 'Arid: Reduced food availability';
      if (value > 75) return 'Humid: Increased reproduction, slower movement';
      return 'Normal: Balanced moisture levels';
    }
    if (param === CLIMATE_PARAMETERS.SEASONAL_INTENSITY) {
      if (value < 25) return 'Stable: Consistent conditions year-round';
      if (value > 75) return 'Extreme: Dramatic seasonal variations';
      return 'Normal: Moderate seasonal changes';
    }
    return '';
  };

  // Don't render if not visible
  if (!isVisible) return null;

  return (
    <div className="environmental-controls-overlay">
      <div className="environmental-controls">
      <div className="control-header">
        <h3>🌍 Environmental Controls</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="panel-tabs">
        <button 
          className={activePanel === 'climate' ? 'active' : ''}
          onClick={() => setActivePanel('climate')}
        >
          🌡️ Climate
        </button>
        <button 
          className={activePanel === 'disasters' ? 'active' : ''}
          onClick={() => setActivePanel('disasters')}
        >
          ⚡ Disasters
        </button>
        <button 
          className={activePanel === 'resources' ? 'active' : ''}
          onClick={() => setActivePanel('resources')}
        >
          🍃 Resources
        </button>
      </div>
      </div>

      {activePanel === 'climate' && (
        <div className="climate-panel">
          <div className="climate-parameter">
            <label>
              🌡️ Temperature: {climateSettings.temperature}
              <div className="parameter-description">
                {getClimateEffectDescription(CLIMATE_PARAMETERS.TEMPERATURE, climateSettings.temperature)}
              </div>
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={climateSettings.temperature}
              onChange={(e) => handleClimateChange(CLIMATE_PARAMETERS.TEMPERATURE, parseInt(e.target.value))}
              disabled={!isSimulationRunning}
            />
          </div>

          <div className="climate-parameter">
            <label>
              💧 Humidity: {climateSettings.humidity}
              <div className="parameter-description">
                {getClimateEffectDescription(CLIMATE_PARAMETERS.HUMIDITY, climateSettings.humidity)}
              </div>
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={climateSettings.humidity}
              onChange={(e) => handleClimateChange(CLIMATE_PARAMETERS.HUMIDITY, parseInt(e.target.value))}
              disabled={!isSimulationRunning}
            />
          </div>

          <div className="climate-parameter">
            <label>
              🍂 Seasonal Intensity: {climateSettings.seasonalIntensity}
              <div className="parameter-description">
                {getClimateEffectDescription(CLIMATE_PARAMETERS.SEASONAL_INTENSITY, climateSettings.seasonalIntensity)}
              </div>
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={climateSettings.seasonalIntensity}
              onChange={(e) => handleClimateChange(CLIMATE_PARAMETERS.SEASONAL_INTENSITY, parseInt(e.target.value))}
              disabled={!isSimulationRunning}
            />
          </div>
        </div>
      )}

      {activePanel === 'disasters' && (
        <div className="disasters-panel">
          <div className="disaster-selection">
            <label>Disaster Type:</label>
            <select 
              value={selectedDisaster} 
              onChange={(e) => setSelectedDisaster(e.target.value)}
              disabled={!isSimulationRunning}
            >
              {Object.values(DISASTER_TYPES).map(disaster => (
                <option key={disaster} value={disaster}>
                  {disaster.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <div className="disaster-description">
              {getDisasterDescription(selectedDisaster)}
            </div>
          </div>

          <div className="disaster-intensity">
            <label>
              Intensity: {disasterIntensity}%
            </label>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={disasterIntensity}
              onChange={(e) => setDisasterIntensity(parseInt(e.target.value))}
              disabled={!isSimulationRunning}
            />
          </div>

          <button 
            className="disaster-trigger-btn" 
            onClick={handleDisasterTrigger}
            disabled={!isSimulationRunning}
          >
            🌪️ Trigger Disaster
          </button>
        </div>
      )}

      {activePanel === 'resources' && (
        <div className="resources-panel">
          <div className="resource-controls">
            <button 
              onClick={() => handleResourceManipulation({ action: 'add_food', amount: 10 })}
              disabled={!isSimulationRunning}
            >
              🍃 Add Food Sources
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'remove_food', amount: 5 })}
              disabled={!isSimulationRunning}
            >
              🥀 Remove Food Sources
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'add_water', area: { x: 0, y: 0, radius: 10 } })}
              disabled={!isSimulationRunning}
            >
              💧 Add Water Body
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'add_obstacle', count: 3 })}
              disabled={!isSimulationRunning}
            >
              🪨 Add Obstacles
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'remove_obstacle', count: 2 })}
              disabled={!isSimulationRunning}
            >
              🗿 Remove Obstacles
            </button>
          </div>

          <div className="terrain-modification">
            <h4>🏔️ Terrain Modification</h4>
            <button 
              onClick={() => handleResourceManipulation({ action: 'raise_terrain', area: { x: 0, y: 0, radius: 5 } })}
              disabled={!isSimulationRunning}
            >
              ⛰️ Raise Terrain
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'lower_terrain', area: { x: 0, y: 0, radius: 5 } })}
              disabled={!isSimulationRunning}
            >
              🕳️ Lower Terrain
            </button>
            <button 
              onClick={() => handleResourceManipulation({ action: 'smooth_terrain', area: { x: 0, y: 0, radius: 8 } })}
              disabled={!isSimulationRunning}
            >
              🌊 Smooth Terrain
            </button>
          </div>
        </div>
      )}

      <div className="environmental-status">
        <div className="status-indicator">
          Current Biome: <strong>{currentBiome?.toUpperCase()}</strong>
        </div>
        <div className="status-indicator">
          Controls: {isSimulationRunning ? '🟢 Active' : '🔴 Inactive'}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalControls;