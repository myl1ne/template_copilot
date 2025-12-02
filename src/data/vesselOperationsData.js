// Parse and process vessel operations data from CSV

// This will be populated by parsing the CSV file
let rawOperations = [];

/**
 * Parse CSV data and extract vessel operations
 * @param {string} csvText - Raw CSV text content
 */
export function parseCSVData(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  rawOperations = lines.slice(1).map(line => {
    // Handle potential commas in quoted fields
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
    
    const [vessel, latitude, longitude, date, operation_type, location_name, description, confidence, coord_source] = cleanValues;
    
    return {
      vessel,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      date: new Date(date),
      operation_type,
      location_name,
      description,
      confidence: parseFloat(confidence),
      coord_source
    };
  }).filter(op => !isNaN(op.latitude) && !isNaN(op.longitude) && op.vessel !== 'vessel');
  
  return rawOperations;
}

/**
 * Get unique vessels from operations data
 */
export function getVessels() {
  const vesselMap = new Map();
  
  rawOperations.forEach(op => {
    if (!vesselMap.has(op.vessel)) {
      const vesselOps = rawOperations.filter(o => o.vessel === op.vessel);
      vesselMap.set(op.vessel, {
        id: op.vessel.toLowerCase().replace(/\s+/g, '-'),
        name: op.vessel,
        totalOperations: vesselOps.length,
        firstOperation: new Date(Math.min(...vesselOps.map(o => o.date))),
        lastOperation: new Date(Math.max(...vesselOps.map(o => o.date))),
        operationTypes: [...new Set(vesselOps.map(o => o.operation_type))]
      });
    }
  });
  
  return Array.from(vesselMap.values());
}

/**
 * Get unique ports/locations from operations data
 */
export function getPorts() {
  const portMap = new Map();
  
  rawOperations.forEach(op => {
    const key = `${op.latitude},${op.longitude}`;
    if (!portMap.has(key)) {
      portMap.set(key, {
        id: key,
        name: op.location_name || 'Unknown',
        coordinates: [op.longitude, op.latitude],
        operations: []
      });
    }
    portMap.get(key).operations.push(op);
  });
  
  return Array.from(portMap.values());
}

/**
 * Get all operations for a specific vessel
 * @param {string} vesselName - Name of the vessel
 */
export function getVesselOperations(vesselName) {
  return rawOperations
    .filter(op => op.vessel === vesselName)
    .sort((a, b) => a.date - b.date);
}

/**
 * Get operations filtered by time range
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time (optional)
 */
export function getOperationsByTimeRange(startTime, endTime = null) {
  return rawOperations.filter(op => {
    if (endTime) {
      return op.date >= startTime && op.date <= endTime;
    }
    return op.date <= startTime;
  });
}

/**
 * Get operations at a specific time (or before)
 * @param {Date} currentTime - Current time in the visualization
 */
export function getOperationsAtTime(currentTime) {
  return rawOperations.filter(op => op.date <= currentTime);
}

/**
 * Get vessel position at a specific time
 * @param {string} vesselName - Name of the vessel
 * @param {Date} currentTime - Current time
 */
export function getVesselPositionAtTime(vesselName, currentTime) {
  const vesselOps = rawOperations
    .filter(op => op.vessel === vesselName && op.date <= currentTime)
    .sort((a, b) => b.date - a.date);
  
  return vesselOps.length > 0 ? vesselOps[0] : null;
}

/**
 * Get time range of all operations
 */
export function getTimeRange() {
  if (rawOperations.length === 0) {
    const now = new Date();
    return { start: now, end: now };
  }
  
  const dates = rawOperations.map(op => op.date);
  return {
    start: new Date(Math.min(...dates)),
    end: new Date(Math.max(...dates))
  };
}

/**
 * Get operation types statistics
 */
export function getOperationTypeStats() {
  const stats = {};
  
  rawOperations.forEach(op => {
    if (!stats[op.operation_type]) {
      stats[op.operation_type] = {
        type: op.operation_type,
        count: 0,
        vessels: new Set()
      };
    }
    stats[op.operation_type].count++;
    stats[op.operation_type].vessels.add(op.vessel);
  });
  
  return Object.values(stats).map(s => ({
    ...s,
    vessels: s.vessels.size
  }));
}

/**
 * Get vessel trajectory (path) between two time points
 * @param {string} vesselName - Name of the vessel
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 */
export function getVesselTrajectory(vesselName, startTime, endTime) {
  return rawOperations
    .filter(op => op.vessel === vesselName && op.date >= startTime && op.date <= endTime)
    .sort((a, b) => a.date - b.date)
    .map(op => ({
      coordinates: [op.longitude, op.latitude],
      timestamp: op.date.toISOString(),
      location: op.location_name,
      operationType: op.operation_type
    }));
}

/**
 * Get all operations
 */
export function getAllOperations() {
  return rawOperations;
}

/**
 * Get color for operation type
 */
export function getOperationTypeColor(operationType) {
  const colors = {
    'Vessel Arrival Reporting': '#4CAF50',
    'Cargo Loading Operation': '#FF9800',
    'Discharge Operation': '#2196F3',
    'Fuel Bunkering Coordination': '#F44336',
    'Voyage Planning and Execution': '#9C27B0',
    'Port Clearance and Documentation': '#00BCD4',
    'Maintenance and Inspection Requests': '#FFC107',
    'Weather and Environmental Reporting': '#607D8B'
  };
  
  return colors[operationType] || '#999999';
}

export default {
  parseCSVData,
  getVessels,
  getPorts,
  getVesselOperations,
  getOperationsByTimeRange,
  getOperationsAtTime,
  getVesselPositionAtTime,
  getTimeRange,
  getOperationTypeStats,
  getVesselTrajectory,
  getAllOperations,
  getOperationTypeColor
};
