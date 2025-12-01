import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import './Timeline.css';

const Timeline = ({ timeRange, currentTime, onTimeChange, isPlaying, onPlayPause }) => {
  const svgRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!timeRange || !svgRef.current) return;

    const margin = { top: 20, right: 40, bottom: 40, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 100 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', svgRef.current.clientWidth)
      .attr('height', 100);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create time scale
    const timeScale = d3.scaleTime()
      .domain([timeRange.start, timeRange.end])
      .range([0, width]);

    // Create axis
    const axis = d3.axisBottom(timeScale)
      .ticks(8)
      .tickFormat(d3.timeFormat('%b %d'));

    g.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${height})`)
      .call(axis);

    // Add background track
    g.append('rect')
      .attr('class', 'timeline-track')
      .attr('x', 0)
      .attr('y', height / 2 - 3)
      .attr('width', width)
      .attr('height', 6)
      .attr('fill', '#333')
      .attr('rx', 3);

    // Add progress bar
    const progressBar = g.append('rect')
      .attr('class', 'timeline-progress')
      .attr('x', 0)
      .attr('y', height / 2 - 3)
      .attr('height', 6)
      .attr('fill', '#4dabf7')
      .attr('rx', 3);

    // Add handle
    const handle = g.append('circle')
      .attr('class', 'timeline-handle')
      .attr('r', 12)
      .attr('cy', height / 2)
      .attr('fill', '#fff')
      .attr('stroke', '#4dabf7')
      .attr('stroke-width', 3)
      .attr('cursor', 'pointer');

    // Add drag behavior
    const drag = d3.drag()
      .on('drag', function(event) {
        const x = Math.max(0, Math.min(width, event.x));
        const newTime = timeScale.invert(x);
        onTimeChange(newTime);
      });

    handle.call(drag);

    // Click on track to jump to time
    g.append('rect')
      .attr('class', 'timeline-clickable')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', function(event) {
        const [x] = d3.pointer(event);
        const newTime = timeScale.invert(x);
        onTimeChange(newTime);
      });

    // Store for updates
    timelineRef.current = { timeScale, progressBar, handle, width };

  }, [timeRange, onTimeChange]);

  // Update position based on current time
  useEffect(() => {
    if (!timelineRef.current || !currentTime) return;

    const { timeScale, progressBar, handle, width } = timelineRef.current;
    const x = timeScale(currentTime);
    const clampedX = Math.max(0, Math.min(width, x));

    progressBar.attr('width', clampedX);
    handle.attr('cx', clampedX);

  }, [currentTime]);

  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <button 
          className="play-button"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="current-time">
          {currentTime && format(new Date(currentTime), 'PPP p')}
        </div>
      </div>
      <svg ref={svgRef} style={{ width: '100%' }}></svg>
    </div>
  );
};

export default Timeline;
