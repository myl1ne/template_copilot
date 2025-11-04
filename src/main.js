import { VoxelWorld } from './voxelWorld.js';
import { VoxelRenderer } from './renderer.js';
import { LevelGenerator } from './levelGenerator.js';

class Game {
    constructor() {
        // World dimensions - increased for bigger levels
        this.worldWidth = 50;
        this.worldHeight = 40;
        this.worldDepth = 50;
        
        // Create world
        this.world = new VoxelWorld(this.worldWidth, this.worldHeight, this.worldDepth);
        
        // Create renderer
        const container = document.getElementById('canvas-container');
        this.renderer = new VoxelRenderer(this.world, container);
        
        // Simulation state
        this.isPaused = false;
        this.simulationSpeed = 1;
        this.currentLevel = 'watercycle';
        
        // Performance tracking
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = performance.now();
        this.fps = 0;
        
        // Setup UI
        this.setupUI();
        
        // Load initial level
        this.loadLevel(this.currentLevel);
        
        // Start game loop
        this.animate();
    }
    
    setupUI() {
        // Level selector
        const levelSelect = document.getElementById('level-select');
        levelSelect.addEventListener('change', (e) => {
            this.loadLevel(e.target.value);
        });
        
        // Speed control
        const speedControl = document.getElementById('speed-control');
        const speedValue = document.getElementById('speed-value');
        speedControl.addEventListener('input', (e) => {
            this.simulationSpeed = parseInt(e.target.value);
            speedValue.textContent = this.simulationSpeed === 0 ? 'Paused' : `${this.simulationSpeed}x`;
            
            if (this.simulationSpeed === 0) {
                this.isPaused = true;
            } else if (this.isPaused) {
                this.isPaused = false;
            }
        });
        
        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
            
            if (this.isPaused) {
                speedControl.value = 0;
                speedValue.textContent = 'Paused';
            } else {
                speedControl.value = this.simulationSpeed || 1;
                speedValue.textContent = `${this.simulationSpeed || 1}x`;
            }
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => {
            this.loadLevel(this.currentLevel);
        });
    }
    
    loadLevel(levelName) {
        this.currentLevel = levelName;
        
        // Clear world
        this.world = new VoxelWorld(this.worldWidth, this.worldHeight, this.worldDepth);
        
        // Generate level
        switch (levelName) {
            case 'watercycle':
                LevelGenerator.generateWaterCycle(this.world);
                break;
            case 'valley':
                LevelGenerator.generateValley(this.world);
                break;
            case 'mountain':
                LevelGenerator.generateMountain(this.world);
                break;
            case 'lake':
                LevelGenerator.generateLake(this.world);
                break;
            case 'volcano':
                LevelGenerator.generateVolcano(this.world);
                break;
            case 'canyon':
                LevelGenerator.generateCanyon(this.world);
                break;
        }
        
        // Update renderer with new world
        this.renderer.world = this.world;
        this.renderer.update();
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
            this.updateStats();
        }
        
        // Update simulation
        if (!this.isPaused && this.simulationSpeed > 0) {
            // Update world multiple times per frame based on speed
            const updates = Math.min(this.simulationSpeed, 5); // Cap at 5 updates per frame
            for (let i = 0; i < updates; i++) {
                this.world.update(deltaTime / updates, this.simulationSpeed);
            }
            
            // Update renderer
            this.renderer.update();
        }
        
        // Render scene
        this.renderer.render();
    }
    
    updateStats() {
        document.getElementById('fps').textContent = this.fps;
        document.getElementById('ticks').textContent = this.world.tickCount;
        document.getElementById('active').textContent = this.world.getActiveElementCount();
    }
}

// Start game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new Game());
} else {
    new Game();
}
