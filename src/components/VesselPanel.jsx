import React from 'react';
import { 
  getVessels, 
  getVesselPositionAtTime, 
  getOperationsByTimeRange,
  getOperationTypeColor 
} from '../data/vesselOperationsData';
import './VesselPanel.css';

const VesselPanel = ({ currentTime, selectedVessel, onSelectVessel, onViewJourney }) => {
  const vessels = getVessels();
  
  // Get vessel positions at current time
  const vesselPositions = vessels.map(vessel => ({
    ...vessel,
    currentPosition: getVesselPositionAtTime(vessel.name, currentTime)
  })).filter(v => v.currentPosition); // Only show vessels with positions at current time
  
  // Get recent operations (within 24 hours before current time)
  const oneDayBefore = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000);
  const recentOperations = getOperationsByTimeRange(oneDayBefore, currentTime)
    .sort((a, b) => b.date - a.date)
    .slice(0, 10);

  // Count active vessels
  const activeVessels = vesselPositions.length;
  const totalVessels = vessels.length;

  // Group operations by type
  const operationTypeCounts = {};
  recentOperations.forEach(op => {
    operationTypeCounts[op.operation_type] = (operationTypeCounts[op.operation_type] || 0) + 1;
  });

  return (
    <div className="vessel-panel">
      <div className="panel-section">
        <h2 className="panel-title">Fleet Status</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{totalVessels}</div>
            <div className="stat-label">Total Vessels</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{activeVessels}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{recentOperations.length}</div>
            <div className="stat-label">Recent Ops (24h)</div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Active Vessels</h3>
        <div className="vessel-list">
          {vesselPositions.map(vessel => (
            <div
              key={vessel.id}
              className={`vessel-item ${selectedVessel === vessel.name ? 'selected' : ''}`}
            >
              <div 
                className="vessel-main"
                onClick={() => onSelectVessel(vessel.name)}
              >
                <div className="vessel-icon">
                  🚢
                </div>
                <div className="vessel-info">
                  <div className="vessel-name">{vessel.name}</div>
                  <div className="vessel-type">{vessel.currentPosition?.operation_type}</div>
                  <div className="vessel-status">
                    <span className="vessel-location">
                      {vessel.currentPosition?.location_name || 'Unknown'}
                    </span>
                    <span className="vessel-confidence">
                      {(vessel.currentPosition?.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className="journey-button"
                onClick={() => onViewJourney(vessel.name)}
                title="View full journey"
              >
                📋
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Recent Operations</h3>
        <div className="events-list">
          {recentOperations.length > 0 ? (
            recentOperations.map((operation, index) => (
              <div key={`${operation.vessel}-${operation.date}-${index}`} className="event-item">
                <div 
                  className="event-icon"
                  style={{ backgroundColor: getOperationTypeColor(operation.operation_type) }}
                >
                  {operation.operation_type.charAt(0)}
                </div>
                <div className="event-info">
                  <div className="event-description">
                    <strong>{operation.vessel}</strong> - {operation.operation_type}
                  </div>
                  <div className="event-location">{operation.location_name}</div>
                  <div className="event-time">
                    {operation.date.toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">No recent operations</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselPanel;
