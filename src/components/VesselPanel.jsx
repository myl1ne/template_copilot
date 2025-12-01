import React from 'react';
import { vessels, getAllVesselPositions, events } from '../data/shippingData';
import './VesselPanel.css';

const VesselPanel = ({ currentTime, selectedVessel, onSelectVessel }) => {
  const vesselPositions = currentTime ? getAllVesselPositions(currentTime) : [];
  
  // Get current events
  const currentEvents = events
    .filter(event => {
      const eventTime = new Date(event.timestamp);
      const currentTimeObj = new Date(currentTime);
      const timeDiff = Math.abs(eventTime - currentTimeObj);
      return timeDiff < 2 * 60 * 60 * 1000; // Within 2 hours
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <div className="vessel-panel">
      <div className="panel-section">
        <h2 className="panel-title">Fleet Status</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{vessels.length}</div>
            <div className="stat-label">Total Vessels</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {vesselPositions.filter(v => v.position?.status === 'in_transit').length}
            </div>
            <div className="stat-label">In Transit</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {vesselPositions.filter(v => v.position?.status === 'docked').length}
            </div>
            <div className="stat-label">Docked</div>
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Vessels</h3>
        <div className="vessel-list">
          {vesselPositions.map(vessel => (
            <div
              key={vessel.id}
              className={`vessel-item ${selectedVessel === vessel.id ? 'selected' : ''}`}
              onClick={() => onSelectVessel(vessel.id)}
            >
              <div className="vessel-icon">
                {vessel.position?.status === 'in_transit' ? '🚢' : '⚓'}
              </div>
              <div className="vessel-info">
                <div className="vessel-name">{vessel.name}</div>
                <div className="vessel-type">{vessel.type}</div>
                <div className="vessel-status">
                  <span className={`status-badge ${vessel.position?.status}`}>
                    {vessel.position?.status?.replace('_', ' ')}
                  </span>
                  {vessel.position?.speed && (
                    <span className="vessel-speed">
                      {vessel.position.speed.toFixed(1)} kts
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <h3 className="section-title">Recent Events</h3>
        <div className="events-list">
          {currentEvents.length > 0 ? (
            currentEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className={`event-icon ${event.type}`}>
                  {event.type === 'departure' ? '🛫' : '🛬'}
                </div>
                <div className="event-info">
                  <div className="event-description">{event.description}</div>
                  <div className="event-time">
                    {new Date(event.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">No recent events</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VesselPanel;
