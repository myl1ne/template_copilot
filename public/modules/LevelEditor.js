import * as THREE from 'three';
import { MeshLibrary } from './MeshLibrary.js';

/**
 * LevelEditor - Tool for editing terrain, placing NPCs/monsters, and managing levels
 * Provides a comprehensive level editing interface for the RPG
 */
export class LevelEditor {
    constructor(scene, terrainGenerator, npcFactory, monsterFactory, camera, renderer) {
        this.scene = scene;
        this.terrainGenerator = terrainGenerator;
        this.npcFactory = npcFactory;
        this.monsterFactory = monsterFactory;
        this.camera = camera;
        this.renderer = renderer;
        
        this.enabled = false;
        this.mode = 'terrain'; // 'terrain', 'npc', 'monster', 'quest'
        this.brushSize = 5;
        this.brushStrength = 0.5;
        this.selectedNPCType = null;
        this.selectedMonsterType = null;
        this.paintMode = false;
        this.paintColor = new THREE.Color(0x3a7d44); // Default green
        
        // Track placed objects for saving/loading
        this.placedNPCs = [];
        this.placedMonsters = [];
        this.levelData = {
            name: 'custom_level',
            terrain: {
                seed: this.terrainGenerator.seed,
                modifications: [] // height modifications
            },
            npcs: [],
            monsters: [],
            quests: []
        };
        
        // Mouse tracking for terrain editing
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.brushIndicator = null;
        
        this.setupBrushIndicator();
        this.setupEventListeners();
    }
    
    /**
     * Setup visual indicator for brush position
     */
    setupBrushIndicator() {
        const geometry = new THREE.RingGeometry(
            this.brushSize * 0.9,
            this.brushSize * 1.1,
            32
        );
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5
        });
        this.brushIndicator = new THREE.Mesh(geometry, material);
        this.brushIndicator.rotation.x = -Math.PI / 2;
        this.brushIndicator.visible = false;
        this.scene.add(this.brushIndicator);
    }
    
    /**
     * Setup event listeners for editor interaction
     */
    setupEventListeners() {
        this.onMouseMove = this.handleMouseMove.bind(this);
        this.onMouseDown = this.handleMouseDown.bind(this);
        this.onMouseUp = this.handleMouseUp.bind(this);
        
        this.isMouseDown = false;
    }
    
    /**
     * Enable or disable the level editor
     */
    toggle() {
        this.enabled = !this.enabled;
        
        if (this.enabled) {
            this.attachListeners();
            this.brushIndicator.visible = true;
        } else {
            this.detachListeners();
            this.brushIndicator.visible = false;
        }
        
        return this.enabled;
    }
    
    /**
     * Attach event listeners
     */
    attachListeners() {
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
        this.renderer.domElement.addEventListener('mouseup', this.onMouseUp);
    }
    
    /**
     * Detach event listeners
     */
    detachListeners() {
        this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
        this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
        this.renderer.domElement.removeEventListener('mouseup', this.onMouseUp);
    }
    
    /**
     * Handle mouse move for brush indicator
     */
    handleMouseMove(event) {
        if (!this.enabled) return;
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update brush indicator position
        this.updateBrushIndicator();
        
        // If mouse is down and in terrain mode, apply changes
        if (this.isMouseDown && this.mode === 'terrain') {
            this.modifyTerrain(event.shiftKey);
        }
    }
    
    /**
     * Handle mouse down for placing objects or starting terrain edit
     */
    handleMouseDown(event) {
        if (!this.enabled) return;
        
        this.isMouseDown = true;
        
        if (this.mode === 'npc') {
            this.placeNPC();
        } else if (this.mode === 'monster') {
            this.placeMonster();
        }
    }
    
    /**
     * Handle mouse up to stop terrain editing
     */
    handleMouseUp(event) {
        this.isMouseDown = false;
    }
    
    /**
     * Update brush indicator position based on raycast
     */
    updateBrushIndicator() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find terrain mesh
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) return;
        
        const intersects = this.raycaster.intersectObject(terrain);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            this.brushIndicator.position.set(point.x, point.y + 0.1, point.z);
            
            // Update brush color based on mode
            if (this.mode === 'terrain') {
                this.brushIndicator.material.color.set(0x00ff00);
            } else if (this.mode === 'npc') {
                this.brushIndicator.material.color.set(0x0000ff);
            } else if (this.mode === 'monster') {
                this.brushIndicator.material.color.set(0xff0000);
            }
        }
    }
    
    /**
     * Modify terrain height at brush position
     */
    modifyTerrain(lower = false) {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) return;
        
        const intersects = this.raycaster.intersectObject(terrain);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            if (this.paintMode) {
                // Paint mode - change vertex colors
                this.paintTerrainColor(terrain, point);
            } else {
                // Height mode - modify terrain height
                const positions = terrain.geometry.attributes.position;
                
                // Modify vertices within brush radius
                for (let i = 0; i < positions.count; i++) {
                    const x = positions.getX(i);
                    const z = positions.getZ(i);
                    const distance = Math.sqrt((x - point.x) ** 2 + (z - point.z) ** 2);
                    
                    if (distance < this.brushSize) {
                        const falloff = 1 - (distance / this.brushSize);
                        const delta = this.brushStrength * falloff * (lower ? -0.1 : 0.1);
                        const currentY = positions.getY(i);
                        positions.setY(i, currentY + delta);
                        
                        // Track modification for saving
                        this.levelData.terrain.modifications.push({
                            index: i,
                            x: x,
                            z: z,
                            delta: delta
                        });
                    }
                }
                
                positions.needsUpdate = true;
                terrain.geometry.computeVertexNormals();
            }
        }
    }
    
    /**
     * Paint terrain color at brush position
     */
    paintTerrainColor(terrain, point) {
        const positions = terrain.geometry.attributes.position;
        let colors = terrain.geometry.attributes.color;
        
        // If no color attribute exists, create one
        if (!colors) {
            const colorArray = [];
            for (let i = 0; i < positions.count; i++) {
                // Default to existing vertex color or green
                colorArray.push(0.23, 0.49, 0.27); // Default green color
            }
            colors = new THREE.Float32BufferAttribute(colorArray, 3);
            terrain.geometry.setAttribute('color', colors);
            
            // Make sure material uses vertex colors
            if (terrain.material && !terrain.material.vertexColors) {
                terrain.material.vertexColors = true;
                terrain.material.needsUpdate = true;
            }
        }
        
        // Paint vertices within brush radius
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const z = positions.getZ(i);
            const distance = Math.sqrt((x - point.x) ** 2 + (z - point.z) ** 2);
            
            if (distance < this.brushSize) {
                const falloff = 1 - (distance / this.brushSize);
                
                // Blend current color with paint color based on falloff and strength
                const currentR = colors.getX(i);
                const currentG = colors.getY(i);
                const currentB = colors.getZ(i);
                
                const blendFactor = this.brushStrength * falloff * 0.1;
                
                colors.setXYZ(
                    i,
                    currentR + (this.paintColor.r - currentR) * blendFactor,
                    currentG + (this.paintColor.g - currentG) * blendFactor,
                    currentB + (this.paintColor.b - currentB) * blendFactor
                );
            }
        }
        
        colors.needsUpdate = true;
    }
    
    /**
     * Place an NPC at brush position
     */
    placeNPC() {
        if (!this.selectedNPCType) {
            console.warn('No NPC type selected');
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) {
            console.warn('No terrain found');
            return;
        }
        
        const intersects = this.raycaster.intersectObject(terrain);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Create NPC data
            const npcData = {
                id: `npc_${Date.now()}`,
                name: this.selectedNPCType.name,
                type: this.selectedNPCType.type,
                position: { x: point.x, z: point.z },
                modelName: this.selectedNPCType.modelName
            };
            
            this.levelData.npcs.push(npcData);
            console.log('NPC placed:', npcData);
            
            // Add visual marker for the NPC
            this.addNPCMarker(point, npcData);
        }
    }
    
    /**
     * Place a monster at brush position
     */
    placeMonster() {
        if (!this.selectedMonsterType) {
            console.warn('No monster type selected');
            return;
        }
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) {
            console.warn('No terrain found');
            return;
        }
        
        const intersects = this.raycaster.intersectObject(terrain);
        
        if (intersects.length > 0) {
            const point = intersects[0].point;
            
            // Create monster data
            const monsterData = {
                type: this.selectedMonsterType.type,
                position: { x: point.x, z: point.z },
                hp: this.selectedMonsterType.hp,
                damage: this.selectedMonsterType.damage,
                xp: this.selectedMonsterType.xp,
                stance: this.selectedMonsterType.stance || 'defensive'
            };
            
            this.levelData.monsters.push(monsterData);
            console.log('Monster placed:', monsterData);
            
            // Add visual marker for the monster
            this.addMonsterMarker(point, monsterData.type);
        }
    }
    
    /**
     * Add visual marker for placed monster
     */
    addMonsterMarker(position, type) {
        // Use actual monster mesh from MeshLibrary
        const monsterMesh = MeshLibrary.getMonsterMesh(type);
        monsterMesh.position.set(position.x, position.y, position.z);
        monsterMesh.userData.isMonsterMarker = true;
        monsterMesh.userData.monsterType = type;
        this.scene.add(monsterMesh);
    }
    
    /**
     * Add visual marker for placed NPC
     */
    async addNPCMarker(position, npcData) {
        // Try to use loaded FBX model if available
        if (this.npcFactory && this.npcFactory.characterLoader) {
            const modelName = npcData.modelName || 'peasant';
            const loadedModel = this.npcFactory.characterLoader.getCharacter(modelName);
            
            if (loadedModel) {
                // Clone the FBX model
                const npcMesh = loadedModel.clone();
                npcMesh.position.set(position.x, position.y, position.z);
                npcMesh.scale.set(1, 1, 1);
                npcMesh.userData.isNPCMarker = true;
                npcMesh.userData.npcData = npcData;
                this.scene.add(npcMesh);
                return;
            }
        }
        
        // Fallback to blue cone if FBX not available
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(position.x, position.y + 1, position.z);
        marker.userData.isNPCMarker = true;
        marker.userData.npcData = npcData;
        this.scene.add(marker);
    }
    
    /**
     * Set editor mode
     */
    setMode(mode) {
        this.mode = mode;
        console.log('Editor mode:', mode);
    }
    
    /**
     * Set brush size
     */
    setBrushSize(size) {
        this.brushSize = size;
        
        // Update brush indicator
        this.brushIndicator.geometry.dispose();
        this.brushIndicator.geometry = new THREE.RingGeometry(
            this.brushSize * 0.9,
            this.brushSize * 1.1,
            32
        );
    }
    
    /**
     * Set brush strength
     */
    setBrushStrength(strength) {
        this.brushStrength = strength;
    }
    
    /**
     * Set paint mode
     */
    setPaintMode(enabled) {
        this.paintMode = enabled;
        console.log('Paint mode:', enabled);
    }
    
    /**
     * Set paint color
     */
    setPaintColor(colorHex) {
        this.paintColor.setStyle(colorHex);
        console.log('Paint color:', colorHex);
    }
    
    /**
     * Set selected NPC type for placement
     */
    setSelectedNPC(npcType) {
        this.selectedNPCType = npcType;
    }
    
    /**
     * Set selected monster type for placement
     */
    setSelectedMonster(monsterType) {
        this.selectedMonsterType = monsterType;
    }
    
    /**
     * Save current level: JSON for objects, PNGs for terrain
     */
    saveLevel(name = null) {
        if (name) {
            this.levelData.name = name;
        }
        
        const levelName = this.levelData.name;
        
        // Get terrain mesh
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (terrain) {
            // Generate heightmap PNG (grayscale)
            this.saveHeightmapPNG(terrain, levelName);
            
            // Generate colormap PNG
            this.saveColormapPNG(terrain, levelName);
        }
        
        // Save JSON with only objects data (NPCs, monsters, quests)
        const objectsData = {
            name: this.levelData.name,
            npcs: this.levelData.npcs,
            monsters: this.levelData.monsters,
            quests: this.levelData.quests
        };
        
        const json = JSON.stringify(objectsData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${levelName}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('Level saved:', levelName);
        return json;
    }
    
    /**
     * Save heightmap as grayscale PNG
     */
    saveHeightmapPNG(terrain, levelName) {
        const positions = terrain.geometry.attributes.position;
        const segments = Math.sqrt(positions.count);
        
        // Create canvas for heightmap
        const canvas = document.createElement('canvas');
        canvas.width = segments;
        canvas.height = segments;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(segments, segments);
        
        // Find min/max height for normalization
        let minHeight = Infinity;
        let maxHeight = -Infinity;
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            minHeight = Math.min(minHeight, y);
            maxHeight = Math.max(maxHeight, y);
        }
        
        const heightRange = maxHeight - minHeight;
        
        // Convert heights to grayscale pixels
        for (let i = 0; i < positions.count; i++) {
            const y = positions.getY(i);
            const normalized = heightRange > 0 ? (y - minHeight) / heightRange : 0.5;
            const gray = Math.floor(normalized * 255);
            
            const pixelIndex = i * 4;
            imageData.data[pixelIndex] = gray;     // R
            imageData.data[pixelIndex + 1] = gray; // G
            imageData.data[pixelIndex + 2] = gray; // B
            imageData.data[pixelIndex + 3] = 255;  // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Download heightmap PNG
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${levelName}_heightmap.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        console.log('Heightmap saved:', `${levelName}_heightmap.png`);
    }
    
    /**
     * Save colormap as color PNG
     */
    saveColormapPNG(terrain, levelName) {
        const positions = terrain.geometry.attributes.position;
        const colors = terrain.geometry.attributes.color;
        const segments = Math.sqrt(positions.count);
        
        // Create canvas for colormap
        const canvas = document.createElement('canvas');
        canvas.width = segments;
        canvas.height = segments;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.createImageData(segments, segments);
        
        // Convert vertex colors to pixels
        for (let i = 0; i < positions.count; i++) {
            const pixelIndex = i * 4;
            
            if (colors) {
                imageData.data[pixelIndex] = Math.floor(colors.getX(i) * 255);     // R
                imageData.data[pixelIndex + 1] = Math.floor(colors.getY(i) * 255); // G
                imageData.data[pixelIndex + 2] = Math.floor(colors.getZ(i) * 255); // B
            } else {
                // Default green if no colors
                imageData.data[pixelIndex] = 58;      // R
                imageData.data[pixelIndex + 1] = 125; // G
                imageData.data[pixelIndex + 2] = 68;  // B
            }
            imageData.data[pixelIndex + 3] = 255; // A
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Download colormap PNG
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${levelName}_colormap.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
        
        console.log('Colormap saved:', `${levelName}_colormap.png`);
    }
    
    /**
     * Load level from JSON and PNG files
     */
    loadLevel(files) {
        try {
            let jsonData = null;
            let heightmapImage = null;
            let colormapImage = null;
            
            // Process files
            if (typeof files === 'string') {
                // Legacy support: loading just JSON
                jsonData = JSON.parse(files);
            } else if (files.json) {
                // Object with json, heightmap, colormap properties
                jsonData = files.json;
                heightmapImage = files.heightmap;
                colormapImage = files.colormap;
            }
            
            if (jsonData) {
                // Update level data with objects only
                this.levelData.name = jsonData.name || 'custom_level';
                this.levelData.npcs = jsonData.npcs || [];
                this.levelData.monsters = jsonData.monsters || [];
                this.levelData.quests = jsonData.quests || [];
                
                console.log('Level objects loaded:', jsonData.name);
            }
            
            // Apply heightmap if provided
            if (heightmapImage) {
                this.applyHeightmapFromImage(heightmapImage);
            }
            
            // Apply colormap if provided
            if (colormapImage) {
                this.applyColormapFromImage(colormapImage);
            }
            
            // Populate NPCs and monsters in the scene
            this.populateLoadedObjects();
            
            return true;
        } catch (error) {
            console.error('Failed to load level:', error);
            return false;
        }
    }
    
    /**
     * Populate NPCs and monsters after loading a level
     */
    populateLoadedObjects() {
        // Clear existing markers
        this.clearMarkers();
        
        // Add NPC markers
        if (this.levelData.npcs) {
            this.levelData.npcs.forEach(npcData => {
                const position = {
                    x: npcData.position.x,
                    y: 0,
                    z: npcData.position.z
                };
                this.addNPCMarker(position, npcData);
            });
            console.log(`Populated ${this.levelData.npcs.length} NPCs`);
        }
        
        // Add monster markers
        if (this.levelData.monsters) {
            this.levelData.monsters.forEach(monsterData => {
                const position = {
                    x: monsterData.position.x,
                    y: 0,
                    z: monsterData.position.z
                };
                this.addMonsterMarker(position, monsterData.type);
            });
            console.log(`Populated ${this.levelData.monsters.length} monsters`);
        }
    }
    
    /**
     * Clear all object markers from the scene
     */
    clearMarkers() {
        const markersToRemove = [];
        this.scene.children.forEach(child => {
            if (child.userData.isNPCMarker || child.userData.isMonsterMarker) {
                markersToRemove.push(child);
            }
        });
        markersToRemove.forEach(marker => this.scene.remove(marker));
        console.log(`Cleared ${markersToRemove.length} markers`);
    }
    
    /**
     * Apply heightmap from image
     */
    applyHeightmapFromImage(image) {
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) {
            console.warn('No terrain found to apply heightmap');
            return;
        }
        
        const positions = terrain.geometry.attributes.position;
        const segments = Math.sqrt(positions.count);
        
        // Create canvas to read image data
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        
        // Apply heights from grayscale values
        const heightScale = this.terrainGenerator.heightScale || 10;
        for (let i = 0; i < positions.count && i < imageData.data.length / 4; i++) {
            const pixelIndex = i * 4;
            const gray = imageData.data[pixelIndex]; // R channel (grayscale)
            const height = (gray / 255) * heightScale;
            positions.setY(i, height);
        }
        
        positions.needsUpdate = true;
        terrain.geometry.computeVertexNormals();
        console.log('Heightmap applied from image');
    }
    
    /**
     * Apply colormap from image
     */
    applyColormapFromImage(image) {
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) {
            console.warn('No terrain found to apply colormap');
            return;
        }
        
        const positions = terrain.geometry.attributes.position;
        let colors = terrain.geometry.attributes.color;
        
        // Create color attribute if it doesn't exist
        if (!colors) {
            const colorArray = [];
            for (let i = 0; i < positions.count; i++) {
                colorArray.push(0, 0, 0);
            }
            colors = new THREE.Float32BufferAttribute(colorArray, 3);
            terrain.geometry.setAttribute('color', colors);
            
            if (terrain.material && !terrain.material.vertexColors) {
                terrain.material.vertexColors = true;
                terrain.material.needsUpdate = true;
            }
        }
        
        // Create canvas to read image data
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        
        // Apply colors from image
        for (let i = 0; i < positions.count && i < imageData.data.length / 4; i++) {
            const pixelIndex = i * 4;
            const r = imageData.data[pixelIndex] / 255;
            const g = imageData.data[pixelIndex + 1] / 255;
            const b = imageData.data[pixelIndex + 2] / 255;
            colors.setXYZ(i, r, g, b);
        }
        
        colors.needsUpdate = true;
        console.log('Colormap applied from image');
    }
    
    /**
     * Clear all placed objects and reset level
     */
    clearLevel() {
        this.levelData = {
            name: 'custom_level',
            terrain: {
                seed: this.terrainGenerator.seed,
                modifications: []
            },
            npcs: [],
            monsters: [],
            quests: []
        };
        
        // Clear visual markers
        this.clearMarkers();
        
        console.log('Level cleared');
    }
    
    /**
     * Get level data
     */
    getLevelData() {
        return this.levelData;
    }
}
