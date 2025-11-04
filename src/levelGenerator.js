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
    
    // Modular terrain generation helpers
    static addHill(world, centerX, centerZ, radius, height, baseY) {
        for (let x = Math.floor(centerX - radius); x <= Math.floor(centerX + radius); x++) {
            for (let z = Math.floor(centerZ - radius); z <= Math.floor(centerZ + radius); z++) {
                if (x < 0 || x >= world.width || z < 0 || z >= world.depth) continue;
                
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist <= radius) {
                    const hillHeight = Math.floor(height * (1 - (dist / radius)));
                    const targetHeight = baseY + hillHeight;
                    
                    for (let y = baseY; y < targetHeight && y < world.height; y++) {
                        const voxel = world.getVoxel(x, y, z);
                        if (voxel && voxel.type === ElementType.AIR) {
                            if (y < targetHeight - 2) {
                                world.setVoxel(x, y, z, ElementType.GRANITE);
                            } else {
                                world.setVoxel(x, y, z, ElementType.SOIL);
                            }
                        }
                    }
                }
            }
        }
    }
    
    static addPlateau(world, x1, z1, x2, z2, plateauHeight, baseY) {
        for (let x = Math.max(0, x1); x < Math.min(world.width, x2); x++) {
            for (let z = Math.max(0, z1); z < Math.min(world.depth, z2); z++) {
                for (let y = baseY; y < plateauHeight && y < world.height; y++) {
                    const voxel = world.getVoxel(x, y, z);
                    if (voxel && voxel.type === ElementType.AIR) {
                        if (y < plateauHeight - 3) {
                            world.setVoxel(x, y, z, ElementType.GRANITE);
                        } else {
                            world.setVoxel(x, y, z, ElementType.SOIL);
                        }
                    }
                }
            }
        }
    }
    
    static addRiver(world, startX, startZ, endX, endZ, width, baseY) {
        const steps = Math.floor(Math.sqrt((endX - startX) ** 2 + (endZ - startZ) ** 2));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(startX + (endX - startX) * t);
            const z = Math.floor(startZ + (endZ - startZ) * t);
            
            // Add meandering
            const meander = Math.sin(i * 0.3) * width;
            
            for (let dx = -width; dx <= width; dx++) {
                for (let dz = -width; dz <= width; dz++) {
                    const rx = x + dx + Math.floor(meander);
                    const rz = z + dz;
                    
                    if (rx >= 0 && rx < world.width && rz >= 0 && rz < world.depth) {
                        // Carve river channel
                        for (let y = baseY; y < baseY + 5; y++) {
                            const voxel = world.getVoxel(rx, y, rz);
                            if (voxel && voxel.type !== ElementType.AIR) {
                                world.setVoxel(rx, y, rz, ElementType.WATER, 15);
                            }
                        }
                    }
                }
            }
        }
    }
    
    static addLake(world, centerX, centerZ, radius, depth, baseY) {
        for (let x = Math.floor(centerX - radius); x <= Math.floor(centerX + radius); x++) {
            for (let z = Math.floor(centerZ - radius); z <= Math.floor(centerZ + radius); z++) {
                if (x < 0 || x >= world.width || z < 0 || z >= world.depth) continue;
                
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist <= radius) {
                    const lakeDepth = Math.floor(depth * (1 - (dist / radius)));
                    
                    for (let y = baseY; y < baseY + lakeDepth; y++) {
                        if (y < world.height) {
                            world.setVoxel(x, y, z, ElementType.WATER, 10);
                        }
                    }
                }
            }
        }
    }
    
    static addVolcano(world, centerX, centerZ, radius, height, baseY) {
        for (let x = Math.floor(centerX - radius); x <= Math.floor(centerX + radius); x++) {
            for (let z = Math.floor(centerZ - radius); z <= Math.floor(centerZ + radius); z++) {
                if (x < 0 || x >= world.width || z < 0 || z >= world.depth) continue;
                
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist <= radius) {
                    const coneHeight = Math.floor(height * (1 - (dist / radius) * 0.8));
                    
                    for (let y = baseY; y < baseY + coneHeight && y < world.height; y++) {
                        const voxel = world.getVoxel(x, y, z);
                        if (voxel && voxel.type === ElementType.AIR) {
                            world.setVoxel(x, y, z, ElementType.GRANITE);
                        }
                    }
                    
                    // Create crater
                    if (dist < radius * 0.2) {
                        const craterTop = baseY + coneHeight - 5;
                        for (let y = craterTop; y < baseY + coneHeight; y++) {
                            if (y >= 0 && y < world.height) {
                                world.setVoxel(x, y, z, ElementType.AIR);
                            }
                        }
                        // Add lava in crater
                        if (dist < radius * 0.15 && craterTop >= 0) {
                            world.setVoxel(x, craterTop - 1, z, ElementType.LAVA, 1200);
                        }
                    }
                }
            }
        }
    }
    
    static addIcyPeak(world, centerX, centerZ, radius, height, baseY) {
        for (let x = Math.floor(centerX - radius); x <= Math.floor(centerX + radius); x++) {
            for (let z = Math.floor(centerZ - radius); z <= Math.floor(centerZ + radius); z++) {
                if (x < 0 || x >= world.width || z < 0 || z >= world.depth) continue;
                
                const dx = x - centerX;
                const dz = z - centerZ;
                const dist = Math.sqrt(dx * dx + dz * dz);
                
                if (dist <= radius) {
                    const peakHeight = Math.floor(height * (1 - (dist / radius)));
                    
                    for (let y = baseY; y < baseY + peakHeight && y < world.height; y++) {
                        const voxel = world.getVoxel(x, y, z);
                        if (voxel && voxel.type === ElementType.AIR) {
                            if (y > baseY + peakHeight * 0.7) {
                                world.setVoxel(x, y, z, ElementType.ICE, -15);
                            } else if (y > baseY + peakHeight * 0.5) {
                                world.setVoxel(x, y, z, ElementType.GRANITE, -5);
                            } else {
                                world.setVoxel(x, y, z, ElementType.GRANITE);
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Generate epic 500x500x250 world
    static generateEpicWorld(world) {
        const { width, height, depth } = world;
        console.log(`Generating epic world: ${width}x${height}x${depth}`);
        
        // Optimized: Only fill base layer sparsely
        const baseHeight = 15;
        
        // Base layer - granite bedrock (sparse sampling)
        for (let x = 0; x < width; x += 1) {
            for (let z = 0; z < depth; z += 1) {
                for (let y = 0; y < 5; y++) {
                    world.setVoxel(x, y, z, ElementType.GRANITE);
                }
                // Base terrain layer
                for (let y = 5; y < baseHeight; y++) {
                    world.setVoxel(x, y, z, ElementType.SOIL);
                }
            }
        }
        
        console.log('Base terrain complete');
        
        // Add hills (scattered across the map)
        const numHills = 25;
        for (let i = 0; i < numHills; i++) {
            const hillX = Math.random() * width;
            const hillZ = Math.random() * depth;
            const hillRadius = 20 + Math.random() * 40;
            const hillHeight = 20 + Math.random() * 30;
            this.addHill(world, hillX, hillZ, hillRadius, hillHeight, baseHeight);
        }
        console.log('Hills complete');
        
        // Add plateaus
        this.addPlateau(world, width * 0.1, depth * 0.1, width * 0.25, depth * 0.25, 50, baseHeight);
        this.addPlateau(world, width * 0.7, depth * 0.6, width * 0.9, depth * 0.8, 45, baseHeight);
        this.addPlateau(world, width * 0.4, depth * 0.7, width * 0.6, depth * 0.95, 40, baseHeight);
        console.log('Plateaus complete');
        
        // Add rivers
        this.addRiver(world, width * 0.2, depth * 0.1, width * 0.3, depth * 0.9, 3, baseHeight);
        this.addRiver(world, width * 0.7, depth * 0.2, width * 0.8, depth * 0.7, 2, baseHeight);
        this.addRiver(world, width * 0.5, depth * 0.3, width * 0.6, depth * 0.8, 2, baseHeight);
        console.log('Rivers complete');
        
        // Add lakes
        this.addLake(world, width * 0.35, depth * 0.45, 30, 15, baseHeight);
        this.addLake(world, width * 0.65, depth * 0.25, 25, 12, baseHeight);
        this.addLake(world, width * 0.15, depth * 0.7, 20, 10, baseHeight);
        console.log('Lakes complete');
        
        // Add a central volcano
        this.addVolcano(world, width * 0.5, depth * 0.5, 50, 120, baseHeight);
        console.log('Volcano complete');
        
        // Add icy peaks (mountains with ice caps)
        this.addIcyPeak(world, width * 0.15, depth * 0.15, 40, 100, baseHeight);
        this.addIcyPeak(world, width * 0.85, depth * 0.85, 45, 110, baseHeight);
        this.addIcyPeak(world, width * 0.85, depth * 0.15, 35, 95, baseHeight);
        this.addIcyPeak(world, width * 0.15, depth * 0.85, 38, 105, baseHeight);
        console.log('Icy peaks complete');
        
        // Add water sources to maintain rivers
        world.addSource(Math.floor(width * 0.2), baseHeight + 5, Math.floor(depth * 0.1), ElementType.WATER, 15);
        world.addSource(Math.floor(width * 0.7), baseHeight + 5, Math.floor(depth * 0.2), ElementType.WATER, 15);
        
        // Add lava source in volcano
        world.addSource(Math.floor(width * 0.5), baseHeight + 115, Math.floor(depth * 0.5), ElementType.LAVA, 1200);
        
        console.log('Epic world generation complete');
    }
}
