import { ElementType, ElementProperties, canFlow } from './elements.js';

// Voxel represents a single cube in the world
class Voxel {
    constructor(type = ElementType.AIR, temperature = 20) {
        this.type = type;
        this.temperature = temperature;
        this.pressure = 0;
        this.updated = false; // Track if updated this tick
    }
}

// VoxelWorld manages the 3D grid of voxels
export class VoxelWorld {
    constructor(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        
        // 3D array of voxels [x][y][z]
        this.voxels = [];
        for (let x = 0; x < width; x++) {
            this.voxels[x] = [];
            for (let y = 0; y < height; y++) {
                this.voxels[x][y] = [];
                for (let z = 0; z < depth; z++) {
                    this.voxels[x][y][z] = new Voxel();
                }
            }
        }
        
        this.sources = []; // Water/lava sources
        this.tickCount = 0;
    }
    
    // Get voxel at position
    getVoxel(x, y, z) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height || z < 0 || z >= this.depth) {
            return null;
        }
        return this.voxels[x][y][z];
    }
    
    // Set voxel at position
    setVoxel(x, y, z, type, temperature = 20) {
        const voxel = this.getVoxel(x, y, z);
        if (voxel) {
            voxel.type = type;
            voxel.temperature = temperature;
        }
    }
    
    // Add a source (continuously generates element)
    addSource(x, y, z, type, temperature = 20) {
        this.sources.push({ x, y, z, type, temperature });
    }
    
    // Check if position is valid
    isValid(x, y, z) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height && z >= 0 && z < this.depth;
    }
    
    // Get density of element at position
    getDensity(x, y, z) {
        const voxel = this.getVoxel(x, y, z);
        if (!voxel) return Infinity;
        return ElementProperties[voxel.type].density;
    }
    
    // Swap two voxels
    swap(x1, y1, z1, x2, y2, z2) {
        const voxel1 = this.getVoxel(x1, y1, z1);
        const voxel2 = this.getVoxel(x2, y2, z2);
        
        if (!voxel1 || !voxel2) return;
        
        const tempType = voxel1.type;
        const tempTemp = voxel1.temperature;
        
        voxel1.type = voxel2.type;
        voxel1.temperature = voxel2.temperature;
        
        voxel2.type = tempType;
        voxel2.temperature = tempTemp;
    }
    
    // Update simulation
    update(deltaTime, simulationSpeed) {
        this.tickCount++;
        
        // Reset updated flags
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.depth; z++) {
                    this.voxels[x][y][z].updated = false;
                }
            }
        }
        
        // Update sources
        for (const source of this.sources) {
            this.setVoxel(source.x, source.y, source.z, source.type, source.temperature);
        }
        
        // Process voxels from bottom to top for gravity
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                for (let z = 0; z < this.depth; z++) {
                    const voxel = this.voxels[x][y][z];
                    if (voxel.updated) continue;
                    
                    this.updateVoxel(x, y, z, deltaTime, simulationSpeed);
                    voxel.updated = true;
                }
            }
        }
    }
    
    // Update a single voxel
    updateVoxel(x, y, z, deltaTime, speed) {
        const voxel = this.getVoxel(x, y, z);
        if (!voxel || voxel.type === ElementType.AIR) return;
        
        const props = ElementProperties[voxel.type];
        
        // Handle cooling (lava -> granite)
        if (voxel.type === ElementType.LAVA && props.coolingRate) {
            voxel.temperature -= props.coolingRate * speed * deltaTime;
            if (voxel.temperature < props.meltingPoint) {
                voxel.type = props.coolsToType;
                voxel.temperature = props.meltingPoint - 10;
            }
        }
        
        // Handle erosion
        this.handleErosion(x, y, z, speed);
        
        // Handle gravity and flow
        if (canFlow(voxel.type)) {
            this.handleFlow(x, y, z, speed);
        } else if (voxel.type === ElementType.SAND) {
            // Sand falls like powder
            this.handlePowderFall(x, y, z);
        }
    }
    
    // Handle liquid/powder flow
    handleFlow(x, y, z, speed) {
        const voxel = this.getVoxel(x, y, z);
        const props = ElementProperties[voxel.type];
        
        // Check if fluid is at edge of map (disappear if flowing off)
        if (x === 0 || x === this.width - 1 || z === 0 || z === this.depth - 1) {
            // Only make it disappear if it's near the bottom or actively flowing
            if (y < this.height / 2) {
                voxel.type = ElementType.AIR;
                return;
            }
        }
        
        // Try to fall down first (gravity)
        const below = this.getVoxel(x, y - 1, z);
        if (below && this.getDensity(x, y - 1, z) < this.getDensity(x, y, z)) {
            this.swap(x, y, z, x, y - 1, z);
            return;
        }
        
        // If can't fall, try to flow sideways
        if (Math.random() < props.flowRate * speed) {
            const directions = [
                [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1],
                [1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1]
            ];
            
            // Shuffle directions for randomness
            for (let i = directions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [directions[i], directions[j]] = [directions[j], directions[i]];
            }
            
            for (const [dx, dy, dz] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                const nz = z + dz;
                
                if (this.isValid(nx, ny, nz)) {
                    const neighbor = this.getVoxel(nx, ny, nz);
                    if (neighbor && this.getDensity(nx, ny, nz) < this.getDensity(x, y, z)) {
                        this.swap(x, y, z, nx, ny, nz);
                        break;
                    }
                }
            }
        }
    }
    
    // Handle powder falling (sand)
    handlePowderFall(x, y, z) {
        // Try to fall straight down
        const below = this.getVoxel(x, y - 1, z);
        if (below && below.type === ElementType.AIR) {
            this.swap(x, y, z, x, y - 1, z);
            return;
        }
        
        // Try to slide diagonally
        const diagonals = [[1, -1, 0], [-1, -1, 0], [0, -1, 1], [0, -1, -1]];
        for (const [dx, dy, dz] of diagonals) {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            
            const neighbor = this.getVoxel(nx, ny, nz);
            if (neighbor && neighbor.type === ElementType.AIR && Math.random() < 0.5) {
                this.swap(x, y, z, nx, ny, nz);
                return;
            }
        }
    }
    
    // Handle erosion (water on granite -> sand)
    handleErosion(x, y, z, speed) {
        const voxel = this.getVoxel(x, y, z);
        const props = ElementProperties[voxel.type];
        
        // Only water erodes for now
        if (voxel.type !== ElementType.WATER) return;
        if (!props.erosionPower) return;
        
        // Check neighboring voxels
        const neighbors = [
            [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
        ];
        
        for (const [dx, dy, dz] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            const nz = z + dz;
            
            const neighbor = this.getVoxel(nx, ny, nz);
            if (!neighbor) continue;
            
            const neighborProps = ElementProperties[neighbor.type];
            
            // Check if neighbor can be eroded
            if (neighborProps.erosionResistance !== undefined && 
                neighborProps.erodesToType !== undefined) {
                
                const erosionChance = props.erosionPower * (1 - neighborProps.erosionResistance) * speed;
                
                if (Math.random() < erosionChance) {
                    neighbor.type = neighborProps.erodesToType;
                }
            }
        }
    }
    
    // Get active element count (non-air)
    getActiveElementCount() {
        let count = 0;
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                for (let z = 0; z < this.depth; z++) {
                    if (this.voxels[x][y][z].type !== ElementType.AIR) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
}
