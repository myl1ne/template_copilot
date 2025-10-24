import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EvolutionManager } from './evolution/EvolutionManager.js';

/**
 * Evo - Main application
 * Evolutionary sandbox for artificial life
 */

class EvoSimulator {
    constructor() {
        this.container = document.getElementById('container');
        this.isPaused = false;
        this.time = 0;
        
        this.initThreeJS();
        this.initPhysics();
        this.initEnvironment();
        this.initEvolution();
        this.initControls();
        this.initUI();
        
        this.animate();
    }

    initThreeJS() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(30, 30, 30);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxDistance = 100;
        this.controls.minDistance = 5;

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);

        // Hemisphere light for more natural lighting
        const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.5);
        this.scene.add(hemisphereLight);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    initPhysics() {
        // Cannon.js world
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.82, 0)
        });
        
        // Collision detection
        this.world.broadphase = new CANNON.NaiveBroadphase();
        this.world.solver.iterations = 10;
        this.world.defaultContactMaterial.contactEquationStiffness = 1e8;
        this.world.defaultContactMaterial.contactEquationRelaxation = 3;
    }

    initEnvironment() {
        // Ground plane (primal soup)
        const groundSize = 100;
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b7355,
            roughness: 0.8,
            metalness: 0.2
        });
        const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Physics ground
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: groundShape
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        this.world.addBody(groundBody);

        // Add some "soup" particles for atmosphere
        const particleCount = 500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 80;
            positions[i + 1] = Math.random() * 2;
            positions[i + 2] = (Math.random() - 0.5) * 80;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x4a4a4a,
            size: 0.3,
            transparent: true,
            opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);

        // Add grid for reference
        const gridHelper = new THREE.GridHelper(100, 20, 0x444444, 0x333333);
        this.scene.add(gridHelper);
    }

    initEvolution() {
        this.evolutionManager = new EvolutionManager(this.scene, this.world);
        this.evolutionManager.initialize();
    }

    initControls() {
        const resetBtn = document.getElementById('resetBtn');
        const spawnBtn = document.getElementById('spawnBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const deselectBtn = document.getElementById('deselectBtn');

        resetBtn.addEventListener('click', () => {
            this.evolutionManager.reset();
            this.time = 0;
            this.selectedCreature = null;
            document.getElementById('creatureInfo').style.display = 'none';
        });

        spawnBtn.addEventListener('click', () => {
            this.evolutionManager.spawnCreature();
        });

        pauseBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        });
        
        deselectBtn.addEventListener('click', () => {
            this.selectedCreature = null;
            document.getElementById('creatureInfo').style.display = 'none';
        });
        
        // Click to select creatures
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update raycaster
            this.raycaster.setFromCamera(this.mouse, this.camera);
            
            // Check for intersections with creature meshes
            const allMeshes = [];
            this.evolutionManager.creatures.forEach(creature => {
                if (creature.alive && creature.meshes) {
                    creature.meshes.forEach(mesh => {
                        mesh.userData.creature = creature;
                        allMeshes.push(mesh);
                    });
                }
            });
            
            const intersects = this.raycaster.intersectObjects(allMeshes, false);
            
            if (intersects.length > 0) {
                this.selectedCreature = intersects[0].object.userData.creature;
                this.updateCreatureInfoPanel();
                document.getElementById('creatureInfo').style.display = 'block';
            } else {
                this.selectedCreature = null;
                document.getElementById('creatureInfo').style.display = 'none';
            }
        });
    }

    initUI() {
        this.creaturesDisplay = document.getElementById('creatures');
        this.timeDisplay = document.getElementById('time');
        this.fitnessDisplay = document.getElementById('fitness');
        this.foodCollectedDisplay = document.getElementById('foodCollected');
        this.birthsDisplay = document.getElementById('births');
        this.deathsDisplay = document.getElementById('deaths');
        this.speciesDisplay = document.getElementById('species');
        this.selectedCreature = null;
    }
    
    updateCreatureInfoPanel() {
        if (!this.selectedCreature || !this.selectedCreature.alive) {
            document.getElementById('creatureInfo').style.display = 'none';
            this.selectedCreature = null;
            return;
        }
        
        const c = this.selectedCreature;
        
        // Age
        document.getElementById('creatureAge').textContent = c.age.toFixed(1);
        
        // Energy bar
        const energyPercent = Math.max(0, Math.min(100, c.energy));
        const energyBar = document.getElementById('energyBar');
        energyBar.style.width = energyPercent + '%';
        if (energyPercent > 60) {
            energyBar.style.background = '#4CAF50'; // Green
        } else if (energyPercent > 30) {
            energyBar.style.background = '#FFC107'; // Yellow
        } else {
            energyBar.style.background = '#F44336'; // Red
        }
        document.getElementById('energyValue').textContent = energyPercent.toFixed(0) + '%';
        
        // Hydration bar
        const hydrationPercent = Math.max(0, Math.min(100, c.hydration));
        const hydrationBar = document.getElementById('hydrationBar');
        hydrationBar.style.width = hydrationPercent + '%';
        if (hydrationPercent > 60) {
            hydrationBar.style.background = '#00BCD4'; // Cyan
        } else if (hydrationPercent > 30) {
            hydrationBar.style.background = '#FFC107'; // Yellow
        } else {
            hydrationBar.style.background = '#F44336'; // Red
        }
        document.getElementById('hydrationValue').textContent = hydrationPercent.toFixed(0) + '%';
        
        // DNA & Traits
        document.getElementById('limbCount').textContent = c.genome.genes.limbCount || 'N/A';
        document.getElementById('limbLength').textContent = (c.genome.genes.limbLength || 1).toFixed(2);
        document.getElementById('gaitStyle').textContent = (c.genome.genes.gaitStyle || 0.5).toFixed(2);
        document.getElementById('speed').textContent = (c.genome.genes.speed || 1).toFixed(2);
        
        // Type based on aggression
        const aggression = c.genome.genes.aggression;
        let type = 'Omnivore';
        if (aggression > 0.6) type = 'Predator';
        else if (aggression < 0.3) type = 'Herbivore';
        document.getElementById('creatureType').textContent = type + ` (${aggression.toFixed(2)})`;
        
        // Neural architecture
        const layers = c.genome.genes.neuralLayers || [4];
        document.getElementById('neuralArch').textContent = layers.join('-') + ' neurons';
        
        // Segments
        document.getElementById('segments').textContent = c.genome.genes.segments ? c.genome.genes.segments.length : 'N/A';
        
        // Performance
        document.getElementById('creatureFitness').textContent = c.fitness.toFixed(1);
        document.getElementById('creatureFood').textContent = c.foodCollected;
        document.getElementById('creatureDistance').textContent = c.distanceTraveled.toFixed(1);
        document.getElementById('creatureKills').textContent = c.kills;
    }

    updateUI() {
        const stats = this.evolutionManager.getStats();
        this.creaturesDisplay.textContent = stats.creatures;
        this.timeDisplay.textContent = this.time.toFixed(1);
        this.fitnessDisplay.textContent = stats.bestFitness;
        this.birthsDisplay.textContent = stats.births;
        this.deathsDisplay.textContent = stats.deaths;
        this.speciesDisplay.textContent = stats.species;
        
        // Calculate total food collected by all creatures
        const totalFood = this.evolutionManager.creatures.reduce((sum, creature) => sum + creature.foodCollected, 0);
        this.foodCollectedDisplay.textContent = totalFood;
        
        // Update selected creature info if one is selected
        if (this.selectedCreature) {
            this.updateCreatureInfoPanel();
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isPaused) {
            const deltaTime = 1 / 60; // Fixed timestep
            
            // Update physics
            this.world.step(deltaTime);
            
            // Update evolution
            this.evolutionManager.update(deltaTime);
            
            this.time += deltaTime;
            this.updateUI();
        }

        // Update controls
        this.controls.update();

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the simulation
new EvoSimulator();
