import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { ports, routes, getAllVesselPositions } from '../data/shippingData';
import './ShippingMap.css';

// Use environment variable for API key (recommended for production)
// In development, you can set this in a .env file: VITE_MAPBOX_TOKEN=your_token_here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const ShippingMap = ({ currentTime, selectedVessel }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const vesselsMarkers = useRef({});
  const portMarkers = useRef({});

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    console.log('Initializing Mapbox...');
    console.log('Mapbox Access Token:', mapboxgl.accessToken);
    console.log('Token length:', mapboxgl.accessToken?.length || 0);

    if (!mapboxgl.accessToken) {
      setMapError('No Mapbox token found. Please set VITE_MAPBOX_TOKEN in .env file.');
      console.error('Mapbox token is missing!');
      return;
    }

    let cancelled = false;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [20, 30],
        zoom: 2,
        projection: 'globe'
      });

      map.current.on('load', () => {
        if (cancelled) return;
        console.log('Map loaded successfully!');
        setMapLoaded(true);
      
      // Add fog for atmosphere effect
      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Add port markers
      ports.forEach(port => {
        const el = document.createElement('div');
        el.className = 'port-marker';
        el.innerHTML = '⚓';
        el.style.fontSize = '24px';
        el.style.cursor = 'pointer';
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat(port.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px;">${port.name}</h3>
                  <p style="margin: 0; font-size: 12px; color: #666;">${port.country}</p>
                </div>
              `)
          )
          .addTo(map.current);
        
        portMarkers.current[port.id] = marker;
      });

      // Add route lines
      routes.forEach(route => {
        const lineCoordinates = route.trajectory.map(point => point.coordinates);
        
        map.current.addSource(`route-${route.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: lineCoordinates
            }
          }
        });

        map.current.addLayer({
          id: `route-${route.id}`,
          type: 'line',
          source: `route-${route.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3887be',
            'line-width': 2,
            'line-opacity': 0.5
          }
        });
      });
    });

    map.current.on('error', (e) => {
      if (cancelled) return;
      console.error('Mapbox error:', e);
      setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
    });
    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapError(`Initialization error: ${error.message}`);
    }

    return () => {
      cancelled = true;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update vessel positions based on current time
  useEffect(() => {
    if (!mapLoaded || !currentTime) return;

    const vesselPositions = getAllVesselPositions(currentTime);

    // Remove old markers
    Object.values(vesselsMarkers.current).forEach(marker => marker.remove());
    vesselsMarkers.current = {};

    // Add new markers
    vesselPositions.forEach(vessel => {
      if (!vessel.position) return;

      const el = document.createElement('div');
      el.className = `vessel-marker ${vessel.position.status}`;
      el.innerHTML = '🚢';
      el.style.fontSize = selectedVessel === vessel.id ? '32px' : '24px';
      el.style.cursor = 'pointer';
      el.style.transition = 'font-size 0.3s';
      
      if (vessel.position.heading) {
        el.style.transform = `rotate(${vessel.position.heading}deg)`;
      }

      const marker = new mapboxgl.Marker(el)
        .setLngLat(vessel.position.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px;">${vessel.name}</h3>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Type:</strong> ${vessel.type}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>IMO:</strong> ${vessel.imo}</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Capacity:</strong> ${vessel.capacity} TEU</p>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Status:</strong> ${vessel.position.status.replace('_', ' ')}</p>
                ${vessel.position.speed ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Speed:</strong> ${vessel.position.speed.toFixed(1)} knots</p>` : ''}
                ${vessel.position.port ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Port:</strong> ${vessel.position.port}</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current);

      vesselsMarkers.current[vessel.id] = marker;
    });
  }, [currentTime, mapLoaded, selectedVessel]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255, 0, 0, 0.9)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '16px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {mapError}
        </div>
      )}
      {!mapLoaded && !mapError && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          fontSize: '16px'
        }}>
          Loading map... (Note: Mapbox token required for full functionality)
        </div>
      )}
    </div>
  );
};

export default ShippingMap;
