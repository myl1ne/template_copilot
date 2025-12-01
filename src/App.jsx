import React, { useState, useEffect, useCallback } from 'react';
import FallbackMap from './components/FallbackMap';
import ShippingMap from './components/ShippingMap';
import Timeline from './components/Timeline';
import VesselPanel from './components/VesselPanel';
import { getTimeRange } from './data/shippingData';
import './App.css';

function App() {
  const timeRange = getTimeRange();
  const [currentTime, setCurrentTime] = useState(timeRange.start);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [useMapbox, setUseMapbox] = useState(false);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prevTime => {
        const newTime = new Date(prevTime.getTime() + (60 * 60 * 1000 * playbackSpeed)); // 1 hour per tick
        
        // Loop back to start if we reach the end
        if (newTime > timeRange.end) {
          return timeRange.start;
        }
        
        return newTime;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, timeRange]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleTimeChange = useCallback((newTime) => {
    setCurrentTime(newTime);
    setIsPlaying(false); // Pause when manually changing time
  }, []);

  const handleSpeedChange = useCallback((speed) => {
    setPlaybackSpeed(speed);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            🚢 Shipping Visualization Dashboard
          </h1>
          <div className="header-controls">
            <div className="speed-control">
              <label htmlFor="speed">Speed:</label>
              <select 
                id="speed"
                value={playbackSpeed} 
                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                className="speed-select"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={2}>2x</option>
                <option value={4}>4x</option>
                <option value={8}>8x</option>
              </select>
            </div>
            <div className="map-toggle">
              <label htmlFor="mapbox-toggle">Map:</label>
              <select
                id="mapbox-toggle"
                value={useMapbox ? 'mapbox' : 'd3'}
                onChange={(e) => setUseMapbox(e.target.value === 'mapbox')}
                className="speed-select"
              >
                <option value="d3">D3.js (Default)</option>
                <option value="mapbox">Mapbox</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      
      <div className="app-body">
        <VesselPanel 
          currentTime={currentTime}
          selectedVessel={selectedVessel}
          onSelectVessel={setSelectedVessel}
        />
        
        <div className="map-container">
          {useMapbox ? (
            <ShippingMap 
              currentTime={currentTime}
              selectedVessel={selectedVessel}
            />
          ) : (
            <FallbackMap 
              currentTime={currentTime}
              selectedVessel={selectedVessel}
            />
          )}
          
          <div className="timeline-wrapper">
            <Timeline 
              timeRange={timeRange}
              currentTime={currentTime}
              onTimeChange={handleTimeChange}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
            />
          </div>
        </div>
      </div>
      
      <div className="info-banner">
        <p>
          ℹ️ This is a demo visualization using sample shipping data and D3.js rendering. 
          For enhanced maps with satellite imagery, see ShippingMap.jsx and add your Mapbox API token.
          Data shows vessel movements between major ports with geolocation and temporal information.
        </p>
      </div>
    </div>
  );
}

export default App;
