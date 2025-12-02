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
    
    let lat = parseFloat(latitude);
    let lon = parseFloat(longitude);
    
    // Normalize longitude to -180 to 180 range
    while (lon > 180) lon -= 360;
    while (lon < -180) lon += 360;
    
    // Validate latitude is in -90 to 90 range
    if (lat > 90) lat = 90;
    if (lat < -90) lat = -90;
    
    return {
      vessel,
      latitude: lat,
      longitude: lon,
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
 * Only returns locations with multiple operations or specific operation types
 * to avoid showing every coordinate as a port
 */
export function getPorts() {
  const portMap = new Map();
  
  rawOperations.forEach(op => {
    // Round coordinates to group nearby points (within ~1km)
    const lat = Math.round(op.latitude * 100) / 100;
    const lon = Math.round(op.longitude * 100) / 100;
    const key = `${lat},${lon}`;
    
    if (!portMap.has(key)) {
      portMap.set(key, {
        id: key,
        name: op.location_name || 'Unknown',
        coordinates: [lon, lat],
        operations: [],
        vessels: new Set()
      });
    }
    const port = portMap.get(key);
    port.operations.push(op);
    port.vessels.add(op.vessel);
  });
  
  // Only return locations with multiple operations OR multiple vessels
  // This filters out single waypoints and only shows actual ports
  return Array.from(portMap.values())
    .filter(port => port.operations.length >= 10 || port.vessels.size >= 3)
    .map(port => ({
      id: port.id,
      name: port.name,
      coordinates: port.coordinates,
      operations: port.operations
    }));
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
 * Get vessel position at a specific time
 * @param {string} vesselName - Name of the vessel
 * @param {Date} currentTime - Current time
 */
export function getVesselPositionAtTime(vesselName, currentTime) {
  // Only use direct position reports (actual GPS coordinates)
  // This prevents ships from "teleporting" to locations mentioned in operational messages
  const directPositions = rawOperations
    .filter(op => op.vessel === vesselName && op.date <= currentTime && op.coord_source === 'direct')
    .sort((a, b) => b.date - a.date);
  
  return directPositions.length > 0 ? directPositions[0] : null;
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

/**
 * Get all vessel positions at a specific time for map display
 * @param {Date} currentTime - Current time
 */
export function getAllVesselPositions(currentTime) {
  const vessels = getVessels();
  
  return vessels.map(vessel => {
    const position = getVesselPositionAtTime(vessel.name, currentTime);
    
    if (!position) return null;
    
    // Count direct position reports for this vessel
    const directReports = rawOperations.filter(
      op => op.vessel === vessel.name && op.coord_source === 'direct'
    ).length;
    
    // Only show vessels with at least 3 direct position reports to avoid jumpy vessels
    if (directReports < 3) return null;
    
    return {
      id: vessel.id,
      name: vessel.name,
      type: 'Tanker', // Default type since not in CSV
      imo: 'N/A', // Not available in CSV
      capacity: 'N/A', // Not available in CSV
      position: {
        coordinates: [position.longitude, position.latitude],
        status: 'in_transit',
        port: position.location_name,
        operation: position.operation_type,
        description: position.description
      }
    };
  }).filter(v => v !== null);
}

/**
 * Get vessel's trajectory trail up to current time
 * Returns all GPS positions from the start up to currentTime
 * @param {string} vesselName - Name of the vessel
 * @param {Date} currentTime - Current time
 */
export function getVesselTrail(vesselName, currentTime) {
  const positions = rawOperations
    .filter(op => 
      op.vessel === vesselName && 
      op.coord_source === 'direct' && 
      op.date <= currentTime
    )
    .sort((a, b) => a.date - b.date);
  
  return {
    line: positions.map(op => [op.longitude, op.latitude]),
    points: positions.map(op => ({
      coordinates: [op.longitude, op.latitude],
      date: op.date,
      location: op.location_name,
      description: op.description,
      operationType: op.operation_type
    }))
  };
}

// Note: This project uses named exports, not default export
// Remove this default export if not needed
export default {
  parseCSVData,
  getVessels,
  getPorts,
  getVesselOperations,
  getOperationsByTimeRange,
  getVesselPositionAtTime,
  getTimeRange,
  getOperationTypeColor,
  getAllVesselPositions,
  getVesselTrail
};
