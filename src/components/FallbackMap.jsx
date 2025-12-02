import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  getPorts, 
  getVessels,
  getVesselPositionAtTime,
  getVesselTrajectory,
  getOperationTypeColor 
} from '../data/vesselOperationsData';
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

    // Create projection (Mercator) - adjusted to show global operations
    const projection = d3.geoMercator()
      .center([60, 20])
      .scale(width / 7)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Add ocean background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#0c1821');

    // Add simplified world map
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
        },
        // South America
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [-80, -55], [-35, -55], [-35, 12], [-80, 12], [-80, -55]
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

    // Get vessels and their positions
    const vessels = getVessels();
    const ports = getPorts();

    // Draw vessel trajectories if a vessel is selected
    if (selectedVessel) {
      const vessel = vessels.find(v => v.name === selectedVessel);
      if (vessel) {
        const trajectory = getVesselTrajectory(
          vessel.name,
          vessel.firstOperation,
          currentTime
        );

        if (trajectory.length > 1) {
          const line = d3.line()
            .x(d => projection(d.coordinates)[0])
            .y(d => projection(d.coordinates)[1])
            .curve(d3.curveBasis)
            .defined(d => {
              const [x, y] = projection(d.coordinates);
              return !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y);
            });

          const coords = trajectory.filter(t => {
            const [x, y] = projection(t.coordinates);
            return !isNaN(x) && !isNaN(y) && isFinite(x) && isFinite(y);
          });

          if (coords.length > 1) {
            const pathData = line(coords);

            svg.append('path')
              .attr('d', pathData)
              .attr('stroke', '#4dabf7')
              .attr('stroke-width', 3)
              .attr('stroke-opacity', 0.7)
              .attr('fill', 'none')
              .attr('stroke-dasharray', '5,5');
          }
        }
      }
    }

    // Draw ports (cluster nearby locations)
    const portGroup = svg.append('g').attr('class', 'ports');
    
    // Limit to top ports by operation count
    const topPorts = ports
      .sort((a, b) => b.operations.length - a.operations.length)
      .slice(0, 50);

    topPorts.forEach(port => {
      const [x, y] = projection(port.coordinates);
      
      if (isNaN(x) || isNaN(y)) return;
      
      const portG = portGroup.append('g')
        .attr('class', 'port')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer');

      const radius = Math.min(8 + Math.log(port.operations.length) * 2, 15);

      portG.append('circle')
        .attr('r', radius)
        .attr('fill', '#ff9800')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('opacity', 0.8);

      portG.append('text')
        .attr('x', radius + 5)
        .attr('y', 4)
        .attr('fill', '#fff')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text(port.name);

      // Tooltip on hover
      portG.on('mouseenter', function(event) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', radius * 1.5);
      })
      .on('mouseleave', function(event) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('r', radius);
      });
    });

    // Draw vessels at current time
    const vesselGroup = svg.append('g').attr('class', 'vessels');

    vessels.forEach(vessel => {
      const position = getVesselPositionAtTime(vessel.name, currentTime);
      if (!position) return;

      const [x, y] = projection([position.longitude, position.latitude]);
      
      if (isNaN(x) || isNaN(y)) return;
      
      const vesselG = vesselGroup.append('g')
        .attr('class', 'vessel')
        .attr('transform', `translate(${x},${y})`)
        .style('cursor', 'pointer');

      const isSelected = selectedVessel === vessel.name;
      const size = isSelected ? 18 : 12;
      const color = getOperationTypeColor(position.operation_type);
      
      vesselG.append('circle')
        .attr('r', size)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', isSelected ? 3 : 2)
        .attr('opacity', 0.9);

      // Add pulse animation for selected vessel
      if (isSelected) {
        vesselG.append('circle')
          .attr('r', size)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', 2)
          .attr('opacity', 0.8)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr('r', size * 2.5)
          .attr('opacity', 0)
          .on('end', function repeat() {
            d3.select(this)
              .attr('r', size)
              .attr('opacity', 0.8)
              .transition()
              .duration(1500)
              .ease(d3.easeLinear)
              .attr('r', size * 2.5)
              .attr('opacity', 0)
              .on('end', repeat);
          });
      }

      // Ship icon
      vesselG.append('text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', '#fff')
        .attr('font-size', `${size}px`)
        .text('🚢');

      // Tooltip on hover
      vesselG.on('mouseenter', function(event) {
        const tooltip = svg.append('g')
          .attr('class', 'tooltip')
          .attr('transform', `translate(${x + 25},${y - 20})`);

        const tooltipWidth = 220;
        const tooltipHeight = 120;

        tooltip.append('rect')
          .attr('width', tooltipWidth)
          .attr('height', tooltipHeight)
          .attr('fill', 'rgba(0, 0, 0, 0.95)')
          .attr('rx', 4)
          .attr('stroke', color)
          .attr('stroke-width', 2);

        const text = tooltip.append('text')
          .attr('fill', '#fff')
          .attr('font-size', '12px');

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 20)
          .attr('font-weight', 'bold')
          .attr('font-size', '14px')
          .text(vessel.name);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 40)
          .text(`Location: ${position.location_name}`);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 60)
          .text(`Operation: ${position.operation_type}`);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 80)
          .text(`Time: ${position.date.toLocaleTimeString()}`);

        text.append('tspan')
          .attr('x', 10)
          .attr('y', 100)
          .text(`Confidence: ${(position.confidence * 100).toFixed(0)}%`);
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
          <div className="legend-icon" style={{ background: '#4CAF50' }}></div>
          <span>Arrival</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ background: '#FF9800' }}></div>
          <span>Loading</span>
        </div>
        <div className="legend-item">
          <div className="legend-icon" style={{ background: '#2196F3' }}></div>
          <span>Discharge</span>
        </div>
      </div>
      <div className="map-info">
        <strong>Interactive D3.js Visualization</strong>
        <p>Vessel Operations Map - {new Date(currentTime).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default FallbackMap;

