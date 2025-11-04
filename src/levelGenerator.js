import { ElementType } from './elements.js';

// Level generator creates different terrain scenarios
export class LevelGenerator {
    // Generate a valley with a river
    static generateValley(world) {
        const { width, height, depth } = world;
        
        // Fill bottom with granite bedrock
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                world.setVoxel(x, 0, z, ElementType.GRANITE);
            }
        }
        
        // Create valley shape with soil
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                // Create valley walls
                const centerZ = depth / 2;
                const distFromCenter = Math.abs(z - centerZ);
                const valleyHeight = Math.floor(3 + distFromCenter / 2);
                
                for (let y = 1; y <= valleyHeight && y < height; y++) {
                    world.setVoxel(x, y, z, ElementType.SOIL);
                }
                
                // Add some granite under soil
                if (valleyHeight > 2) {
                    for (let y = 1; y <= 2; y++) {
                        world.setVoxel(x, y, z, ElementType.GRANITE);
                    }
                }
            }
        }
        
        // Add water source at one end of valley
        const riverZ = Math.floor(depth / 2);
        world.addSource(2, 5, riverZ, ElementType.WATER, 20);
        
        // Add some initial water
        for (let x = 2; x < 8; x++) {
            world.setVoxel(x, 4, riverZ, ElementType.WATER, 20);
        }
    }
    
    // Generate mountain range
    static generateMountain(world) {
        const { width, height, depth } = world;
        
        // Fill bottom layers with granite
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                for (let y = 0; y < 3; y++) {
                    world.setVoxel(x, y, z, ElementType.GRANITE);
                }
            }
        }
        
        // Create mountain peaks
        const peaks = [
            { x: width * 0.3, z: depth * 0.5, height: height * 0.8 },
            { x: width * 0.7, z: depth * 0.5, height: height * 0.7 }
        ];
        
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                let maxHeight = 3;
                
                // Calculate height based on distance from peaks
                for (const peak of peaks) {
                    const dx = x - peak.x;
                    const dz = z - peak.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    const peakHeight = Math.max(0, peak.height - dist * 0.5);
                    maxHeight = Math.max(maxHeight, peakHeight);
                }
                
                // Fill with granite for lower levels, soil for upper
                for (let y = 3; y < maxHeight && y < height; y++) {
                    if (y < maxHeight - 2) {
                        world.setVoxel(x, y, z, ElementType.GRANITE);
                    } else {
                        world.setVoxel(x, y, z, ElementType.SOIL);
                    }
                }
            }
        }
        
        // Add water sources on mountain sides
        world.addSource(Math.floor(width * 0.3), Math.floor(height * 0.6), Math.floor(depth * 0.5), ElementType.WATER, 15);
    }
    
    // Generate a lake basin
    static generateLake(world) {
        const { width, height, depth } = world;
        
        // Create bowl-shaped basin
        const centerX = width / 2;
        const centerZ = depth / 2;
        
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                // Basin depth based on distance from center
                const basinDepth = Math.max(2, 8 - Math.floor(dist / 2));
                
                // Fill with granite
                for (let y = 0; y < basinDepth; y++) {
                    world.setVoxel(x, y, z, ElementType.GRANITE);
                }
                
                // Add soil layer
                if (basinDepth < height - 1) {
                    world.setVoxel(x, basinDepth, z, ElementType.SOIL);
                }
            }
        }
        
        // Fill lake with water
        for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
            for (let z = Math.floor(depth * 0.3); z < Math.floor(depth * 0.7); z++) {
                for (let y = 3; y < 8; y++) {
                    world.setVoxel(x, y, z, ElementType.WATER, 20);
                }
            }
        }
        
        // Add water source to maintain lake
        world.addSource(Math.floor(centerX), 7, Math.floor(centerZ), ElementType.WATER, 20);
    }
    
    // Generate volcanic island
    static generateVolcano(world) {
        const { width, height, depth } = world;
        
        // Fill bottom with granite
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                world.setVoxel(x, 0, z, ElementType.GRANITE);
            }
        }
        
        // Create volcanic cone
        const centerX = width / 2;
        const centerZ = depth / 2;
        const volcanoHeight = height * 0.7;
        
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                // Cone shape
                const coneHeight = Math.max(0, volcanoHeight - dist * 0.8);
                
                for (let y = 1; y < coneHeight && y < height; y++) {
                    if (y < coneHeight - 3) {
                        world.setVoxel(x, y, z, ElementType.GRANITE);
                    } else {
                        world.setVoxel(x, y, z, ElementType.SOIL);
                    }
                }
            }
        }
        
        // Create crater
        const craterRadius = 2;
        for (let x = Math.floor(centerX - craterRadius); x <= Math.floor(centerX + craterRadius); x++) {
            for (let z = Math.floor(centerZ - craterRadius); z <= Math.floor(centerZ + craterRadius); z++) {
                const dx = x - centerX;
                const dz = z - centerZ;
                if (dx * dx + dz * dz <= craterRadius * craterRadius) {
                    for (let y = Math.floor(volcanoHeight - 5); y < Math.floor(volcanoHeight); y++) {
                        world.setVoxel(x, y, z, ElementType.AIR);
                    }
                }
            }
        }
        
        // Add lava source in crater
        world.addSource(Math.floor(centerX), Math.floor(volcanoHeight - 4), Math.floor(centerZ), ElementType.LAVA, 1200);
    }
    
    // Generate canyon system
    static generateCanyon(world) {
        const { width, height, depth } = world;
        
        // Fill with layered rock
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                for (let y = 0; y < height * 0.8; y++) {
                    // Alternate layers of granite and sand
                    if (Math.floor(y / 3) % 2 === 0) {
                        world.setVoxel(x, y, z, ElementType.GRANITE);
                    } else {
                        world.setVoxel(x, y, z, ElementType.SAND);
                    }
                }
                // Top layer is soil
                world.setVoxel(x, Math.floor(height * 0.8), z, ElementType.SOIL);
            }
        }
        
        // Carve canyon
        const canyonPath = [];
        let currentZ = Math.floor(depth * 0.2);
        for (let x = 0; x < width; x++) {
            // Meandering canyon
            currentZ += Math.floor(Math.random() * 3) - 1;
            currentZ = Math.max(2, Math.min(depth - 3, currentZ));
            canyonPath.push({ x, z: currentZ });
        }
        
        // Remove blocks along canyon path
        for (const pos of canyonPath) {
            for (let dz = -2; dz <= 2; dz++) {
                const z = pos.z + dz;
                if (z >= 0 && z < depth) {
                    const canyonDepth = Math.floor(height * 0.6);
                    for (let y = canyonDepth; y < height; y++) {
                        world.setVoxel(pos.x, y, z, ElementType.AIR);
                    }
                }
            }
        }
        
        // Add water source at high end
        world.addSource(2, Math.floor(height * 0.75), canyonPath[2].z, ElementType.WATER, 20);
    }
    
    // Generate water cycle demonstration level
    static generateWaterCycle(world) {
        const { width, height, depth } = world;
        
        // Create base terrain
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                // Bedrock layer
                for (let y = 0; y < 2; y++) {
                    world.setVoxel(x, y, z, ElementType.GRANITE);
                }
                
                // Variable terrain height
                const centerX = width / 2;
                const centerZ = depth / 2;
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                // Create a large basin in the center
                const basinDepth = Math.max(5, 15 - Math.floor(dist / 3));
                
                for (let y = 2; y < basinDepth; y++) {
                    if (y < basinDepth - 2) {
                        world.setVoxel(x, y, z, ElementType.GRANITE);
                    } else {
                        world.setVoxel(x, y, z, ElementType.SOIL);
                    }
                }
                
                // Add mountains on the edges
                if (dist > width / 3) {
                    const mountainHeight = Math.floor(basinDepth + (dist - width / 3) / 2);
                    for (let y = basinDepth; y < Math.min(mountainHeight, height * 0.8); y++) {
                        if (y < mountainHeight - 3) {
                            world.setVoxel(x, y, z, ElementType.GRANITE);
                        } else {
                            world.setVoxel(x, y, z, ElementType.SOIL);
                        }
                    }
                }
            }
        }
        
        // Fill the central basin with water
        for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
            for (let z = Math.floor(depth * 0.3); z < Math.floor(depth * 0.7); z++) {
                for (let y = 5; y < 12; y++) {
                    world.setVoxel(x, y, z, ElementType.WATER, 20);
                }
            }
        }
        
        // Add a heat source (lava) under part of the basin to drive evaporation
        const heatX = Math.floor(width * 0.4);
        const heatZ = Math.floor(depth * 0.4);
        for (let dx = -3; dx <= 3; dx++) {
            for (let dz = -3; dz <= 3; dz++) {
                const x = heatX + dx;
                const z = heatZ + dz;
                if (x >= 0 && x < width && z >= 0 && z < depth) {
                    // Lava chamber at depth 3
                    world.setVoxel(x, 3, z, ElementType.LAVA, 1200);
                    // Heat the granite above it
                    world.setVoxel(x, 4, z, ElementType.GRANITE, 800);
                }
            }
        }
        
        // Add cold mountains with ice caps
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                const centerX = width / 2;
                const centerZ = depth / 2;
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist > width / 2.5) {
                    // Find mountain peaks
                    for (let y = height - 1; y >= 0; y--) {
                        const voxel = world.getVoxel(x, y, z);
                        if (voxel && voxel.type !== ElementType.AIR) {
                            // Add ice/snow on high peaks
                            if (y > height * 0.6) {
                                voxel.type = ElementType.ICE;
                                voxel.temperature = -10;
                            }
                            // Set cooler temperature at altitude
                            else if (y > height * 0.4) {
                                voxel.temperature = 5;
                            }
                            break;
                        }
                    }
                }
            }
        }
        
        // Add water source to maintain cycle
        world.addSource(Math.floor(width * 0.5), 11, Math.floor(depth * 0.5), ElementType.WATER, 20);
        
        // Set atmospheric gradient (cooler at top)
        for (let x = 0; x < width; x++) {
            for (let z = 0; z < depth; z++) {
                for (let y = 0; y < height; y++) {
                    const voxel = world.getVoxel(x, y, z);
                    if (voxel && voxel.type === ElementType.AIR) {
                        // Temperature decreases with altitude
                        voxel.temperature = 30 - (y * 0.5);
                    }
                }
            }
        }
    }
}
