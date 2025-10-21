import * as THREE from 'three';

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
            this.addNPCMarker(point, npcData.name);
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
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(position.x, position.y + 1, position.z);
        marker.userData.isMonsterMarker = true;
        this.scene.add(marker);
    }
    
    /**
     * Add visual marker for placed NPC
     */
    addNPCMarker(position, name) {
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(position.x, position.y + 1, position.z);
        marker.userData.isNPCMarker = true;
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
     * Save current level to JSON
     */
    saveLevel(name = null) {
        if (name) {
            this.levelData.name = name;
        }
        
        const json = JSON.stringify(this.levelData, null, 2);
        
        // Create download link
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.levelData.name}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('Level saved:', this.levelData.name);
        return json;
    }
    
    /**
     * Load level from JSON
     */
    loadLevel(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            this.levelData = data;
            
            // Apply terrain modifications
            if (data.terrain && data.terrain.seed !== undefined) {
                this.terrainGenerator.seed = data.terrain.seed;
            }
            
            console.log('Level loaded:', data.name);
            return true;
        } catch (error) {
            console.error('Failed to load level:', error);
            return false;
        }
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
        
        console.log('Level cleared');
    }
    
    /**
     * Get level data
     */
    getLevelData() {
        return this.levelData;
    }
}
