import React, { useState, useEffect, useCallback } from 'react';
import ShippingMap from './components/ShippingMap';
import Timeline from './components/Timeline';
import VesselPanel from './components/VesselPanel';
import VesselJourney from './components/VesselJourney';
import { parseCSVData, getTimeRange, getVessels } from './data/vesselOperationsData';
import './App.css';

function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [timeRange, setTimeRange] = useState({ start: new Date(), end: new Date() });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [vessels, setVessels] = useState([]);
  const [journeyVessel, setJourneyVessel] = useState(null);
  const [mapControls, setMapControls] = useState(null);

  // Load CSV data on component mount
  useEffect(() => {
    fetch('/vessel_operations_map_20251202_134536.csv')
      .then(response => response.text())
      .then(csvText => {
        parseCSVData(csvText);
        const range = getTimeRange();
        const vesselList = getVessels();
        setTimeRange(range);
        setCurrentTime(range.start);
        setVessels(vesselList);
        setDataLoaded(true);
      })
      .catch(error => {
        console.error('Error loading CSV data:', error);
      });
  }, []);

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

  const handleVesselSelect = useCallback((vesselName) => {
    // Toggle selection - if clicking the same vessel, unselect it
    setSelectedVessel(prev => {
      const newSelection = prev === vesselName ? null : vesselName;
      
      // Center map on the selected vessel (only if selecting, not unselecting)
      if (newSelection && mapControls && mapControls.centerOnVessel) {
        mapControls.centerOnVessel(newSelection);
      }
      
      return newSelection;
    });
  }, [mapControls]);

  if (!dataLoaded) {
    return (
      <div className="app loading">
        <div className="loading-message">
          <h2>Loading vessel operations data...</h2>
          <p>Please wait while we process the data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            🚢 Vessel Operations Visualization
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
          </div>
        </div>
      </header>
      
      <div className="app-body">
        <VesselPanel 
          currentTime={currentTime}
          selectedVessel={selectedVessel}
          onSelectVessel={handleVesselSelect}
          onViewJourney={setJourneyVessel}
        />
        
        <div className="map-container">
          <ShippingMap 
            currentTime={currentTime}
            selectedVessel={selectedVessel}
            onMapReady={setMapControls}
          />
          
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
          ℹ️ Vessel operations visualization using real production data with Mapbox GL.
          Showing GPS position reports and operational events with geolocation and temporal information.
        </p>
      </div>

      {journeyVessel && (
        <VesselJourney 
          vesselName={journeyVessel} 
          onClose={() => setJourneyVessel(null)} 
        />
      )}
    </div>
  );
}

export default App;
