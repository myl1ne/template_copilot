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
    
    /**
     * Place an NPC at brush position
     */
    placeNPC() {
        if (!this.selectedNPCType) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) return;
        
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
        }
    }
    
    /**
     * Place a monster at brush position
     */
    placeMonster() {
        if (!this.selectedMonsterType) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const terrain = this.scene.children.find(child => 
            child.geometry && child.geometry.type === 'PlaneGeometry'
        );
        
        if (!terrain) return;
        
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
        }
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
