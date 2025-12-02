import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { getPorts, getAllVesselPositions, getVesselTrail } from '../data/vesselOperationsData';
import './ShippingMap.css';

// Use environment variable for API key (recommended for production)
// In development, you can set this in a .env file: VITE_MAPBOX_TOKEN=your_token_here
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const ShippingMap = ({ currentTime, selectedVessel, onMapReady }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

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
        
        // Expose map controls to parent component
        if (onMapReady) {
          onMapReady({
            centerOnVessel: (vesselName) => {
              const vessels = getAllVesselPositions(currentTime);
              const vessel = vessels.find(v => v.name === vesselName);
              if (vessel && vessel.position && vessel.position.coordinates) {
                const coords = vessel.position.coordinates;
                // Validate coordinates before using them
                if (Array.isArray(coords) && coords.length === 2 && 
                    !isNaN(coords[0]) && !isNaN(coords[1])) {
                  map.current.flyTo({
                    center: coords,
                    zoom: 4,
                    duration: 1500,
                    essential: true
                  });
                }
              }
            }
          });
        }
      
      // Add fog for atmosphere effect
      map.current.setFog({
        color: 'rgb(186, 210, 235)',
        'high-color': 'rgb(36, 92, 223)',
        'horizon-blend': 0.02,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.6
      });

      // Get ports from real data
      const ports = getPorts();
      console.log('Ports loaded:', ports.length, 'ports');

      if (ports.length > 0) {
        // Add ports as a native Mapbox layer (better performance, no lag)
        map.current.addSource('ports', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: ports.map(port => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: port.coordinates
              },
              properties: {
                id: port.id,
                name: port.name,
                operations: port.operations.length
              }
            }))
          }
        });

        // Load anchor emoji as an image icon
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚓', size / 2, size / 2);
        
        map.current.addImage('anchor-icon', {
          width: size,
          height: size,
          data: ctx.getImageData(0, 0, size, size).data
        });

        // Add port symbols layer with the anchor icon
        map.current.addLayer({
          id: 'ports-layer',
          type: 'symbol',
          source: 'ports',
          layout: {
            'icon-image': 'anchor-icon',
            'icon-size': 0.5,
            'icon-allow-overlap': true,
            'text-field': ['get', 'name'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-optional': true
          },
          paint: {
            'text-color': '#FFFFFF',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });

        // Add click handler for port popups
        map.current.on('click', 'ports-layer', (e) => {
          const coordinates = e.features[0].geometry.coordinates.slice();
          const { name, operations } = e.features[0].properties;

          new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
              <div style="padding: 12px; background: #1e1e1e; color: #fff; min-width: 200px; border-radius: 6px;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #4dabf7; border-bottom: 1px solid #333; padding-bottom: 6px;">
                  ⚓ ${name}
                </h3>
                <p style="margin: 6px 0; font-size: 12px;"><strong style="color: #aaa;">Operations:</strong> ${operations}</p>
              </div>
            `)
            .addTo(map.current);
        });

        // Change cursor on hover
        map.current.on('mouseenter', 'ports-layer', () => {
          map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'ports-layer', () => {
          map.current.getCanvas().style.cursor = '';
        });
      } else {
        console.warn('No ports found - may need to adjust filtering criteria');
      }

      // Route lines removed - too dense with real operational data
      // Vessel positions and movement are shown via ship markers instead
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
    
    console.log('Updating vessel positions:', vesselPositions.length, 'vessels at', currentTime);

    // Update or create vessels layer FIRST
    const geojsonData = {
      type: 'FeatureCollection',
      features: vesselPositions
        .filter(vessel => vessel.position)
        .map(vessel => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: vessel.position.coordinates
          },
          properties: {
            id: vessel.id,
            name: vessel.name,
            status: vessel.position.status,
            port: vessel.position.port || '',
            operation: vessel.position.operation || '',
            description: vessel.position.description || '',
            isSelected: selectedVessel === vessel.id
          }
        }))
    };

    // Check if source exists, if not create it
    if (!map.current.getSource('vessels')) {
      // Create ship icon
      const canvas = document.createElement('canvas');
      const size = 48;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.font = `${size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚢', size / 2, size / 2);
      
      if (!map.current.hasImage('ship-icon')) {
        map.current.addImage('ship-icon', {
          width: size,
          height: size,
          data: ctx.getImageData(0, 0, size, size).data
        });
      }

      map.current.addSource('vessels', {
        type: 'geojson',
        data: geojsonData
      });

      map.current.addLayer({
        id: 'vessels-layer',
        type: 'symbol',
        source: 'vessels',
        layout: {
          'icon-image': 'ship-icon',
          'icon-size': [
            'case',
            ['get', 'isSelected'],
            0.7,
            0.5
          ],
          'icon-allow-overlap': true,
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 2],
          'text-anchor': 'top',
          'text-optional': true
        },
        paint: {
          'text-color': '#FFFFFF',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });

      // Add click handler for vessel popups
      map.current.on('click', 'vessels-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, status, port, operation, description } = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 12px; background: #1e1e1e; color: #fff; min-width: 250px; border-radius: 6px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #4dabf7; border-bottom: 1px solid #333; padding-bottom: 6px;">
                🚢 ${name}
              </h3>
              <div style="font-size: 12px; line-height: 1.6;">
                <p style="margin: 6px 0;"><strong style="color: #aaa;">Status:</strong> ${status.replace('_', ' ')}</p>
                ${port ? `<p style="margin: 6px 0;"><strong style="color: #aaa;">Location:</strong> ${port}</p>` : ''}
                ${operation ? `<p style="margin: 6px 0;"><strong style="color: #aaa;">Operation:</strong> ${operation}</p>` : ''}
                ${description ? `<p style="margin: 6px 0; padding-top: 6px; border-top: 1px solid #333; font-size: 11px; color: #bbb;">${description}</p>` : ''}
              </div>
            </div>
          `)
          .addTo(map.current);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'vessels-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'vessels-layer', () => {
        map.current.getCanvas().style.cursor = '';
      });
    } else {
      // Update existing source
      map.current.getSource('vessels').setData(geojsonData);
    }

    // NOW handle vessel trails (after vessels layer exists)
    // Create trail position markers (no lines, just points)
    const trailPointFeatures = [];
    
    vesselPositions.forEach(vessel => {
      const trail = getVesselTrail(vessel.name, currentTime);
      
      // Add position points (excluding the last one which is the current ship position)
      trail.points.slice(0, -1).forEach((point, idx) => {
        trailPointFeatures.push({
          type: 'Feature',
          properties: {
            vesselName: vessel.name,
            date: point.date.toISOString(),
            location: point.location,
            description: point.description || '',
            operationType: point.operationType || '',
            isSelected: selectedVessel === vessel.name
          },
          geometry: {
            type: 'Point',
            coordinates: point.coordinates
          }
        });
      });
    });

    // Update or create trail points
    if (!map.current.getSource('vessel-trail-points')) {
      map.current.addSource('vessel-trail-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trailPointFeatures
        }
      });

      map.current.addLayer({
        id: 'vessel-trail-points-layer',
        type: 'circle',
        source: 'vessel-trail-points',
        paint: {
          'circle-radius': [
            'case',
            ['get', 'isSelected'],
            7,  // Larger for selected
            3   // Normal size
          ],
          'circle-color': [
            'case',
            ['get', 'isSelected'],
            '#ffa500',  // Orange for selected vessel trail
            '#3887be'   // Blue for other vessels
          ],
          'circle-opacity': [
            'case',
            ['get', 'isSelected'],
            0.9,  // More opaque for selected
            0.7   // Less opaque for others
          ],
          'circle-stroke-width': [
            'case',
            ['get', 'isSelected'],
            2.5,  // Thicker stroke for selected
            1.5   // Normal stroke
          ],
          'circle-stroke-color': [
            'case',
            ['get', 'isSelected'],
            '#ffffff',  // White stroke for selected
            '#ffffff'   // White stroke for others
          ],
          'circle-stroke-opacity': 0.9
        }
      }, 'vessels-layer');

      // Add hover popup for trail points
      map.current.on('mouseenter', 'vessel-trail-points-layer', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'vessel-trail-points-layer', () => {
        map.current.getCanvas().style.cursor = '';
      });

      map.current.on('click', 'vessel-trail-points-layer', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        
        // Get full operation details from the data
        const { vesselName, date, location, description, operationType } = e.features[0].properties;
        
        const positionDate = new Date(date);
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div style="padding: 12px; background: #1e1e1e; color: #fff; min-width: 250px; max-width: 350px; border-radius: 6px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #4dabf7; border-bottom: 1px solid #333; padding-bottom: 6px;">
                🚢 ${vesselName}
              </h3>
              <div style="font-size: 12px; line-height: 1.6;">
                <p style="margin: 6px 0;"><strong style="color: #aaa;">Time:</strong> ${positionDate.toLocaleString()}</p>
                <p style="margin: 6px 0;"><strong style="color: #aaa;">Location:</strong> ${location || 'Unknown'}</p>
                ${operationType ? `<p style="margin: 6px 0;"><strong style="color: #aaa;">Operation:</strong> ${operationType}</p>` : ''}
                <p style="margin: 6px 0;"><strong style="color: #aaa;">Coordinates:</strong> ${coordinates[1].toFixed(4)}°, ${coordinates[0].toFixed(4)}°</p>
                <p style="margin: 6px 0;"><strong style="color: #aaa;">Source:</strong> <span style="color: #4CAF50;">📍 GPS (Direct)</span></p>
                ${description ? `<p style="margin: 6px 0; padding-top: 6px; border-top: 1px solid #333; font-size: 11px; color: #bbb; line-height: 1.5;">${description}</p>` : ''}
              </div>
            </div>
          `)
          .addTo(map.current);
      });
    } else {
      map.current.getSource('vessel-trail-points').setData({
        type: 'FeatureCollection',
        features: trailPointFeatures
      });
    }
  }, [currentTime, mapLoaded, selectedVessel]);

  // Center map on selected vessel when selection changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !selectedVessel) return;
    
    const vessels = getAllVesselPositions(currentTime);
    const vessel = vessels.find(v => v.name === selectedVessel);
    if (vessel && vessel.position && vessel.position.coordinates) {
      const coords = vessel.position.coordinates;
      // Validate coordinates before using them
      if (Array.isArray(coords) && coords.length === 2 && 
          !isNaN(coords[0]) && !isNaN(coords[1])) {
        map.current.flyTo({
          center: coords,
          zoom: Math.max(map.current.getZoom(), 4), // Zoom to at least 4, or keep current zoom if higher
          duration: 1500,
          essential: true
        });
      }
    }
  }, [selectedVessel, mapLoaded, currentTime]);

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
