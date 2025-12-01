// Sample shipping data with vessels, ports, and events

export const ports = [
  { id: 'port-1', name: 'Port of Rotterdam', coordinates: [4.477733, 51.9225], country: 'Netherlands' },
  { id: 'port-2', name: 'Port of Singapore', coordinates: [103.8198, 1.3521], country: 'Singapore' },
  { id: 'port-3', name: 'Port of Shanghai', coordinates: [121.4737, 31.2304], country: 'China' },
  { id: 'port-4', name: 'Port of Los Angeles', coordinates: [-118.2437, 33.7405], country: 'USA' },
  { id: 'port-5', name: 'Port of Dubai', coordinates: [55.2708, 25.2048], country: 'UAE' },
  { id: 'port-6', name: 'Port of Hamburg', coordinates: [9.9937, 53.5511], country: 'Germany' },
  { id: 'port-7', name: 'Port of Antwerp', coordinates: [4.4025, 51.2194], country: 'Belgium' },
  { id: 'port-8', name: 'Port of Hong Kong', coordinates: [114.1694, 22.3193], country: 'Hong Kong' },
];

export const vessels = [
  {
    id: 'vessel-1',
    name: 'MV Atlantic Star',
    type: 'Container Ship',
    capacity: 14000,
    imo: 'IMO9234567',
    status: 'in_transit'
  },
  {
    id: 'vessel-2',
    name: 'MV Pacific Dream',
    type: 'Container Ship',
    capacity: 12000,
    imo: 'IMO9345678',
    status: 'docked'
  },
  {
    id: 'vessel-3',
    name: 'MV Silk Road',
    type: 'Cargo Ship',
    capacity: 8000,
    imo: 'IMO9456789',
    status: 'in_transit'
  },
  {
    id: 'vessel-4',
    name: 'MV Ocean Pioneer',
    type: 'Bulk Carrier',
    capacity: 18000,
    imo: 'IMO9567890',
    status: 'in_transit'
  },
  {
    id: 'vessel-5',
    name: 'MV Global Trader',
    type: 'Container Ship',
    capacity: 15000,
    imo: 'IMO9678901',
    status: 'loading'
  }
];

// Generate realistic vessel trajectories
function generateTrajectory(startPort, endPort, startTime, durationDays) {
  const trajectory = [];
  const steps = 50; // Number of points along the route
  const [startLon, startLat] = ports.find(p => p.id === startPort).coordinates;
  const [endLon, endLat] = ports.find(p => p.id === endPort).coordinates;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    
    // Add some curve to the route (great circle approximation)
    // This creates a natural arc by adding a sine wave to the latitude
    const arcHeight = 5; // Degrees of latitude for the curve
    const midLat = (startLat + endLat) / 2 + Math.sin(progress * Math.PI) * arcHeight;
    
    // Interpolate latitude through the midpoint to create a smooth curve
    // First half: interpolate from start to mid, second half: mid to end
    const lat = progress < 0.5
      ? startLat + (midLat - startLat) * (progress * 2)
      : midLat + (endLat - midLat) * ((progress - 0.5) * 2);
    
    // Linear interpolation for longitude
    const lon = startLon + (endLon - startLon) * progress;
    
    const timestamp = new Date(startTime.getTime() + (durationDays * 24 * 60 * 60 * 1000 * progress));
    
    trajectory.push({
      coordinates: [lon, lat],
      timestamp: timestamp.toISOString(),
      speed: 15 + Math.random() * 5, // knots
      heading: Math.atan2(endLon - startLon, endLat - startLat) * 180 / Math.PI
    });
  }
  
  return trajectory;
}

// Generate events and routes for vessels
const baseDate = new Date('2024-11-01T00:00:00Z');

export const routes = [
  {
    id: 'route-1',
    vesselId: 'vessel-1',
    origin: 'port-1', // Rotterdam
    destination: 'port-4', // Los Angeles
    departureTime: new Date(baseDate.getTime() + 0 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(baseDate.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    trajectory: generateTrajectory('port-1', 'port-4', baseDate, 18),
    cargoType: 'Electronics',
    cargoWeight: 12000
  },
  {
    id: 'route-2',
    vesselId: 'vessel-2',
    origin: 'port-2', // Singapore
    destination: 'port-3', // Shanghai
    departureTime: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(baseDate.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    trajectory: generateTrajectory('port-2', 'port-3', new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000), 6),
    cargoType: 'Machinery',
    cargoWeight: 9000
  },
  {
    id: 'route-3',
    vesselId: 'vessel-3',
    origin: 'port-3', // Shanghai
    destination: 'port-5', // Dubai
    departureTime: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    trajectory: generateTrajectory('port-3', 'port-5', new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000), 15),
    cargoType: 'Textiles',
    cargoWeight: 7000
  },
  {
    id: 'route-4',
    vesselId: 'vessel-4',
    origin: 'port-4', // Los Angeles
    destination: 'port-2', // Singapore
    departureTime: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    trajectory: generateTrajectory('port-4', 'port-2', new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000), 20),
    cargoType: 'Grain',
    cargoWeight: 16000
  },
  {
    id: 'route-5',
    vesselId: 'vessel-5',
    origin: 'port-6', // Hamburg
    destination: 'port-8', // Hong Kong
    departureTime: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    trajectory: generateTrajectory('port-6', 'port-8', new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000), 22),
    cargoType: 'Automobiles',
    cargoWeight: 13000
  }
];

// Generate events from routes
export const events = routes.flatMap(route => {
  const vessel = vessels.find(v => v.id === route.vesselId);
  const originPort = ports.find(p => p.id === route.origin);
  const destPort = ports.find(p => p.id === route.destination);
  
  return [
    {
      id: `event-${route.id}-departure`,
      type: 'departure',
      vesselId: route.vesselId,
      vesselName: vessel.name,
      portId: route.origin,
      portName: originPort.name,
      timestamp: route.departureTime,
      coordinates: originPort.coordinates,
      description: `${vessel.name} departed from ${originPort.name}`
    },
    {
      id: `event-${route.id}-arrival`,
      type: 'arrival',
      vesselId: route.vesselId,
      vesselName: vessel.name,
      portId: route.destination,
      portName: destPort.name,
      timestamp: route.arrivalTime,
      coordinates: destPort.coordinates,
      description: `${vessel.name} arrived at ${destPort.name}`
    }
  ];
});

// Get vessel position at a specific time
export function getVesselPositionAtTime(vesselId, timestamp) {
  const route = routes.find(r => r.vesselId === vesselId);
  if (!route) return null;
  
  const departureTime = new Date(route.departureTime).getTime();
  const arrivalTime = new Date(route.arrivalTime).getTime();
  const currentTime = new Date(timestamp).getTime();
  
  // If before departure, vessel is at origin port
  if (currentTime < departureTime) {
    const port = ports.find(p => p.id === route.origin);
    return {
      coordinates: port.coordinates,
      status: 'docked',
      port: port.name
    };
  }
  
  // If after arrival, vessel is at destination port
  if (currentTime > arrivalTime) {
    const port = ports.find(p => p.id === route.destination);
    return {
      coordinates: port.coordinates,
      status: 'docked',
      port: port.name
    };
  }
  
  // Vessel is in transit - interpolate position
  const progress = (currentTime - departureTime) / (arrivalTime - departureTime);
  const trajectoryIndex = Math.floor(progress * (route.trajectory.length - 1));
  const point = route.trajectory[trajectoryIndex];
  
  return {
    coordinates: point.coordinates,
    status: 'in_transit',
    speed: point.speed,
    heading: point.heading
  };
}

// Get all vessel positions at a specific time
export function getAllVesselPositions(timestamp) {
  return vessels.map(vessel => ({
    ...vessel,
    position: getVesselPositionAtTime(vessel.id, timestamp)
  })).filter(v => v.position !== null);
}

// Get time range for the simulation
export function getTimeRange() {
  const allTimes = routes.flatMap(r => [
    new Date(r.departureTime).getTime(),
    new Date(r.arrivalTime).getTime()
  ]);
  
  return {
    start: new Date(Math.min(...allTimes)),
    end: new Date(Math.max(...allTimes))
  };
}
