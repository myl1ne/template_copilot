import React, { useState, useEffect } from 'react';
import { getVesselOperations, getOperationTypeColor } from '../data/vesselOperationsData';
import './VesselJourney.css';

const VesselJourney = ({ vesselName, onClose }) => {
  const [operations, setOperations] = useState([]);

  useEffect(() => {
    if (vesselName) {
      const ops = getVesselOperations(vesselName);
      setOperations(ops);
    }
  }, [vesselName]);

  if (!vesselName) {
    return null;
  }

  const directPositions = operations.filter(op => op.coord_source === 'direct');
  const geocodedPositions = operations.filter(op => op.coord_source === 'geocoded');

  return (
    <div className="vessel-journey-overlay" onClick={onClose}>
      <div className="vessel-journey-panel" onClick={(e) => e.stopPropagation()}>
        <div className="vessel-journey-header">
          <h2>🚢 {vesselName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="vessel-journey-stats">
          <div className="stat-item">
            <span className="stat-label">Total Operations:</span>
            <span className="stat-value">{operations.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Position Reports:</span>
            <span className="stat-value">{directPositions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Geocoded Events:</span>
            <span className="stat-value">{geocodedPositions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Journey Duration:</span>
            <span className="stat-value">
              {operations.length > 0 
                ? Math.ceil((operations[operations.length - 1].date - operations[0].date) / (1000 * 60 * 60 * 24)) + ' days'
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="vessel-journey-timeline">
          <h3>Journey Timeline</h3>
          <div className="operations-list">
            {operations.map((op, index) => (
              <div key={index} className="operation-item">
                <div className="operation-header">
                  <span 
                    className="operation-type-badge"
                    style={{ backgroundColor: getOperationTypeColor(op.operation_type) }}
                  >
                    {op.operation_type}
                  </span>
                  <span className={`coord-source ${op.coord_source}`}>
                    {op.coord_source === 'direct' ? '📍 GPS' : '🗺️ Geocoded'}
                  </span>
                </div>
                <div className="operation-details">
                  <div className="operation-time">
                    {op.date.toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="operation-location">
                    📌 {op.location_name || 'Unknown'}
                  </div>
                  <div className="operation-coordinates">
                    {op.latitude.toFixed(4)}°, {op.longitude.toFixed(4)}°
                  </div>
                  {op.description && (
                    <div className="operation-description">
                      {op.description}
                    </div>
                  )}
                  <div className="operation-confidence">
                    Confidence: {(op.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselJourney;
