import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ports, routes, getAllVesselPositions } from '../data/shippingData';
import './FallbackMap.css';

const FallbackMap = ({ currentTime, selectedVessel }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const parent = svgRef.current.parentElement;
        setDimensions({
          width: parent.clientWidth,
          height: parent.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !currentTime) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create projection (Mercator)
    const projection = d3.geoMercator()
      .center([50, 30])
      .scale(width / 6.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Add ocean background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0c1821');

    // Add simplified world map (continents as simple shapes)
    const worldData = {
      type: 'FeatureCollection',
      features: [
        // Europe
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-10, 35], [40, 35], [40, 70], [30, 71], [-10, 60], [-10, 35]
            ]]
          }
        },
        // Asia
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [40, 10], [150, 10], [150, 70], [40, 70], [40, 10]
            ]]
          }
        },
        // North America
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-170, 15], [-50, 15], [-50, 70], [-170, 70], [-170, 15]
            ]]
          }
        },
        // Africa
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-20, -35], [50, -35], [50, 35], [-20, 35], [-20, -35]
            ]]
          }
        }
      ]
    };

    svg.append('g')
      .selectAll('path')
      .data(worldData.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', '#1e3a3a')
      .attr('stroke', '#2d5555')
      .attr('stroke-width', 1);

    // Draw routes
    routes.forEach(route => {
      const originPort = ports.find(p => p.id === route.origin);
      const destPort = ports.find(p => p.id === route.destination);
      
      if (originPort && destPort) {
        const line = d3.line()
          .x(d => projection(d)[0])
          .y(d => projection(d)[1])
          .curve(d3.curveBasis);

        // Create curved path
        const coords = route.trajectory.map(t => t.coordinates);
        const pathData = line(coords);

        svg.append('path')
          .attr('d', pathData)
          .attr('stroke', '#3887be')
          .attr('stroke-width', 2)
          .attr('stroke-opacity', 0.5)
          .attr('fill', 'none')
          .attr('stroke-dasharray', '5,5');
      }
    });

    // Draw ports
    const portGroup = svg.append('g').attr('class', 'ports');

    ports.forEach(port => {
      const [x, y] = projection(port.coordinates);
      
      const portG = portGroup.append('g')
        .attr('class', 'port')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer');

      portG.append('circle')
        .attr('r', 8)
        .attr('fill', '#ff9800')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);

      portG.append('text')
        .attr('x', 12)
        .attr('y', 4)
        .attr('fill', '#fff')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(port.name);

      // Tooltip on hover
      portG.on('mouseenter', function(event) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 12);
      })
      .on('mouseleave', function(event) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', 8);
      });
    });

    // Draw vessels
    const vesselPositions = getAllVesselPositions(currentTime);
    const vesselGroup = svg.append('g').attr('class', 'vessels');

    vesselPositions.forEach(vessel => {
      if (!vessel.position) return;

      const [x, y] = projection(vessel.position.coordinates);
      
      const vesselG = vesselGroup.append('g')
        .attr('class', 'vessel')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer');

      // Vessel icon (ship emoji replacement with SVG)
      const isSelected = selectedVessel === vessel.id;
      const size = isSelected ? 20 : 14;
      
      vesselG.append('circle')
        .attr('r', size)
        .attr('fill', vessel.position.status === 'in_transit' ? '#4dabf7' : '#51cf66')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.9);

      // Ship shape (simple triangle)
      if (vessel.position.heading !== undefined) {
        const rotation = vessel.position.heading || 0;
        vesselG.append('path')
          .attr('d', d3.symbol().type(d3.symbolTriangle).size(size * 15))
          .attr('fill', '#fff')
          .attr('transform', `rotate(${rotation})`);
      } else {
        vesselG.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('fill', '#fff')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text('🚢');
      }

      // Tooltip on hover
      vesselG.on('mouseenter', function(event) {
        // Add tooltip
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x + 25},${y - 20})`);

        tooltip.append('rect')
          .attr('width', 200)
          .attr('height', 100)
          .attr('fill', 'rgba(0, 0, 0, 0.9)')
          .attr('rx', 4)
          .attr('stroke', '#4dabf7')
          .attr('stroke-width', 2);

        const text = tooltip.append('text')
          .attr('fill', '#fff')
          .attr('font-size', '12px');

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 20)
          .attr('font-weight', 'bold')
          .text(vessel.name);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 40)
          .text(`Type: ${vessel.type}`);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 60)
          .text(`Status: ${vessel.position.status.replace('_', ' ')}`);

        if (vessel.position.speed) {
          text.append('tspan')
            .attr('x', 10)
            .attr('y', 80)
            .text(`Speed: ${vessel.position.speed.toFixed(1)} kts`);
        }
      })
      .on('mouseleave', function() {
        svg.selectAll('.tooltip').remove();
      });
    });

    // Add grid lines
    const graticule = d3.geoGraticule();
    svg.insert('path', ':first-child')
      .datum(graticule)
      .attr('class', 'graticule')
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#1a3030')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.5);

  }, [currentTime, selectedVessel, dimensions]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-icon" style={{ background: '#ff9800' }}></div>
          <span>Ports</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ background: '#4dabf7' }}></div>
          <span>In Transit</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ background: '#51cf66' }}></div>
          <span>Docked</span>
        </div>
      </div>
      <div className="map-info">
        <strong>Interactive D3.js Visualization</strong>
        <p>Fallback mode - works without Mapbox API token</p>
      </div>
    </div>
  );
};

export default FallbackMap;
