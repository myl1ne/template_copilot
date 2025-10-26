import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Vivarium } from './core/Vivarium.js';
import { PlantLife } from './life/PlantLife.js';
import { AnimalLife } from './life/AnimalLife.js';

/**
 * Main application class
 */
class VivariumApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.vivarium = null;
        
        this.cubeObjects = new Map(); // Map cube coords to THREE.Mesh
        this.plantObjects = new Map(); // Map plants to THREE.Mesh
        this.animalObjects = new Map(); // Map animals to THREE.Mesh
        
        this.isPaused = false;
        this.clock = new THREE.Clock();
        
        this.init();
    }

    init() {
        // Initialize Three.js scene
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.setupControls();

        // Initialize vivarium
        this.vivarium = new Vivarium(20, 20, 20);
        this.renderVivarium();

        // Add initial plants
        this.seedInitialPlants(10);
        
        // Add initial animals
        this.addInitialAnimals(3);

        // Start animation loop
        this.animate();

        // Setup keyboard controls
        this.setupKeyboardControls();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 100);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(25, 20, 25);
        this.camera.lookAt(10, 5, 10);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('canvas-container');
        container.appendChild(this.renderer.domElement);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
        sunLight.position.set(20, 30, 10);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -30;
        sunLight.shadow.camera.right = 30;
        sunLight.shadow.camera.top = 30;
        sunLight.shadow.camera.bottom = -30;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        this.scene.add(sunLight);

        // Hemisphere light for natural lighting
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x8B4513, 0.3);
        this.scene.add(hemiLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.target.set(10, 5, 10);
        this.controls.update();
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.isPaused = !this.isPaused;
                e.preventDefault();
            }
        });
    }

    renderVivarium() {
        // Render all cubes in the vivarium (excluding air)
        const cubes = this.vivarium.getRenderableCubes();
        
        for (const cube of cubes) {
            const key = `${cube.x},${cube.y},${cube.z}`;
            
            if (!this.cubeObjects.has(key)) {
                // Create new cube mesh
                const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
                const color = cube.getColor();
                const material = new THREE.MeshLambertMaterial({ 
                    color: color,
                    transparent: cube.isWater(),
                    opacity: cube.isWater() ? 0.7 : 1.0
                });
                
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(cube.x, cube.y, cube.z);
                mesh.castShadow = cube.isSoil();
                mesh.receiveShadow = true;
                
                this.scene.add(mesh);
                this.cubeObjects.set(key, mesh);
            } else {
                // Update existing cube color (nutrients may have changed)
                const mesh = this.cubeObjects.get(key);
                mesh.material.color.setHex(cube.getColor());
            }
        }
    }

    seedInitialPlants(count) {
        for (let i = 0; i < count; i++) {
            const spot = this.vivarium.findPlantingSpot();
            if (spot) {
                const plant = new PlantLife(spot.x, spot.y, spot.z);
                const cube = this.vivarium.getCube(spot.x, spot.y, spot.z);
                if (cube) {
                    cube.setOccupant(plant);
                    this.vivarium.addLifeform(plant);
                }
            }
        }
    }

    addInitialAnimals(count) {
        for (let i = 0; i < count; i++) {
            // Find a random position on the surface
            const x = Math.floor(Math.random() * this.vivarium.sizeX);
            const z = Math.floor(Math.random() * this.vivarium.sizeZ);
            
            // Find ground level
            for (let y = this.vivarium.sizeY - 1; y >= 0; y--) {
                const cube = this.vivarium.getCube(x, y, z);
                if (cube && (cube.isSoil() || cube.isWater())) {
                    // Alternate between herbivores and decomposers
                    const animalType = i % 2 === 0 ? 
                        AnimalLife.ANIMAL_TYPES.HERBIVORE : 
                        AnimalLife.ANIMAL_TYPES.DECOMPOSER;
                    
                    const animal = new AnimalLife(x, y + 1, z, animalType);
                    this.vivarium.addLifeform(animal);
                    break;
                }
            }
        }
    }

    updatePlants() {
        // Remove plant meshes for dead plants
        const currentPlants = new Set(this.vivarium.lifeforms.filter(lf => lf.type === 'plant'));
        
        for (const [plant, meshGroup] of this.plantObjects.entries()) {
            if (!currentPlants.has(plant)) {
                this.scene.remove(meshGroup);
                this.plantObjects.delete(plant);
            }
        }

        // Update or create plant meshes
        for (const plant of currentPlants) {
            if (!this.plantObjects.has(plant)) {
                // Create new plant mesh based on species shape
                const meshGroup = this.createPlantMesh(plant);
                this.scene.add(meshGroup);
                this.plantObjects.set(plant, meshGroup);
            }
            
            // Update plant mesh
            const meshGroup = this.plantObjects.get(plant);
            const foliage = meshGroup.children[0];
            const stem = meshGroup.children[1];
            
            meshGroup.position.set(plant.x, plant.y + 0.5, plant.z);
            
            // Update colors
            foliage.material.color.setHex(plant.getColor());
            
            // Update size based on growth and species
            const foliageSize = plant.foliageSize;
            const heightScale = Math.max(0.5, plant.height);
            
            foliage.scale.set(foliageSize, foliageSize, foliageSize);
            foliage.position.y = heightScale;
            
            stem.scale.set(0.1, heightScale, 0.1);
            stem.position.y = heightScale / 2;
        }
    }

    createPlantMesh(plant) {
        const group = new THREE.Group();
        
        // Create foliage based on species shape
        let foliageGeometry;
        switch (plant.species.shape) {
            case 'cone':
                foliageGeometry = new THREE.ConeGeometry(0.5, 1, 8);
                break;
            case 'sphere':
                foliageGeometry = new THREE.SphereGeometry(0.5, 8, 8);
                break;
            case 'cylinder':
                foliageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.8, 8);
                break;
            default:
                foliageGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        }
        
        const foliageMaterial = new THREE.MeshLambertMaterial({ color: plant.getColor() });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        
        // Create stem/trunk
        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 6);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.castShadow = true;
        stem.receiveShadow = true;
        
        group.add(foliage);
        group.add(stem);
        
        return group;
    }

    updateAnimals() {
        // Remove animal meshes for dead animals
        const currentAnimals = new Set(this.vivarium.lifeforms.filter(lf => lf.type === 'animal'));
        
        for (const [animal, mesh] of this.animalObjects.entries()) {
            if (!currentAnimals.has(animal)) {
                this.scene.remove(mesh);
                this.animalObjects.delete(animal);
            }
        }

        // Update or create animal meshes
        for (const animal of currentAnimals) {
            if (!this.animalObjects.has(animal)) {
                // Create new animal mesh
                const geometry = new THREE.SphereGeometry(animal.size, 8, 8);
                const material = new THREE.MeshLambertMaterial({ color: animal.color });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                this.scene.add(mesh);
                this.animalObjects.set(animal, mesh);
            }
            
            // Update animal mesh position
            const mesh = this.animalObjects.get(animal);
            mesh.position.set(animal.x, animal.y, animal.z);
        }
    }

    updateUI() {
        const stats = this.vivarium.getStats();
        
        document.getElementById('plant-count').textContent = stats.plantCount;
        document.getElementById('animal-count').textContent = stats.animalCount;
        document.getElementById('biomass').textContent = stats.totalBiomass;
        document.getElementById('generation').textContent = stats.maxGeneration;
        document.getElementById('fitness').textContent = stats.avgFitness;
        document.getElementById('time').textContent = stats.time + 's';
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (!this.isPaused) {
            // Update vivarium simulation (speed up time by 2x)
            this.vivarium.update(deltaTime * 2);
            
            // Update visual representation
            this.updatePlants();
            this.updateAnimals();
            this.renderVivarium();
            this.updateUI();
        }

        // Update controls
        this.controls.update();

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the application when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new VivariumApp();
});
