/**
 * WorldSetup - Scene, lighting, and ground setup
 * Handles the initialization of the 3D world environment
 */
import * as THREE from 'three';
import { GameConfig } from './GameConfig.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { WaterPlane } from './WaterPlane.js';

export class WorldSetup {
  constructor(options = {}) {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.ground = null;
    this.gridHelper = null;
    this.useAdvancedTerrain = options.useAdvancedTerrain !== false; // default true
    this.terrainGenerator = null;
    this.waterPlane = null;
  }

  /**
   * Initialize the 3D scene, camera, and renderer
   * @param {HTMLElement} container - DOM element to attach the renderer
   * @returns {Object} - { scene, camera, renderer }
   */
  initScene(container) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(GameConfig.world.skyColor);
    this.scene.fog = new THREE.Fog(
      GameConfig.world.skyColor,
      GameConfig.world.fogDistance.near,
      GameConfig.world.fogDistance.far
    );

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    return { scene: this.scene, camera: this.camera, renderer: this.renderer };
  }

  /**
   * Add lighting to the scene
   */
  addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(
      GameConfig.lighting.ambient.color,
      GameConfig.lighting.ambient.intensity
    );
    this.scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(
      GameConfig.lighting.sun.color,
      GameConfig.lighting.sun.intensity
    );
    sunLight.position.set(
      GameConfig.lighting.sun.position.x,
      GameConfig.lighting.sun.position.y,
      GameConfig.lighting.sun.position.z
    );
    sunLight.castShadow = true;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.mapSize.width = GameConfig.lighting.sun.shadowMapSize;
    sunLight.shadow.mapSize.height = GameConfig.lighting.sun.shadowMapSize;
    this.scene.add(sunLight);
  }

  /**
   * Create the ground plane with terrain variation
   */
  createGround() {
    const groundSize = GameConfig.world.groundSize;

    if (this.useAdvancedTerrain) {
      // Use new heightmap-based terrain with biomes
      this.terrainGenerator = new TerrainGenerator({
        size: groundSize,
        segments: 100,
        heightScale: 15,  // Increased for more dramatic terrain
        waterLevel: 4     // Adjusted water level
      });

      this.ground = this.terrainGenerator.createTerrain();
      this.scene.add(this.ground);

      // Add water plane
      this.waterPlane = new WaterPlane({
        size: groundSize,
        waterLevel: 4    // Match terrain water level
      });
      const water = this.waterPlane.create();
      this.scene.add(water);

      // Optional: Add subtle grid helper (less visible on varied terrain)
      this.gridHelper = new THREE.GridHelper(groundSize, 50, 0x000000, 0x000000);
      this.gridHelper.material.opacity = 0.05;
      this.gridHelper.material.transparent = true;
      this.gridHelper.position.y = 0.1;
      this.scene.add(this.gridHelper);

    } else {
      // Legacy simple terrain
      const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize, 50, 50);
      const groundMaterial = new THREE.MeshStandardMaterial({
        color: GameConfig.world.groundColor,
        roughness: 0.8,
        metalness: 0.2
      });

      // Add terrain variation
      const positions = groundGeometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const height = Math.sin(x * 0.1) * 0.5 + Math.cos(y * 0.1) * 0.5;
        positions.setZ(i, height);
      }
      positions.needsUpdate = true;
      groundGeometry.computeVertexNormals();

      this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
      this.ground.rotation.x = -Math.PI / 2;
      this.ground.receiveShadow = true;
      this.scene.add(this.ground);

      // Grid helper
      this.gridHelper = new THREE.GridHelper(groundSize, 50, 0x000000, 0x000000);
      this.gridHelper.material.opacity = 0.1;
      this.gridHelper.material.transparent = true;
      this.scene.add(this.gridHelper);
    }
  }

  /**
   * Set up window resize handler
   */
  setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /**
   * Animate world elements (water, etc.)
   * Call this in your animation loop
   * @param {number} deltaTime - Time since last frame
   */
  animate(deltaTime) {
    if (this.waterPlane) {
      this.waterPlane.animate(deltaTime);
    }
  }

  /**
   * Get terrain generator (for object placement)
   * @returns {TerrainGenerator|null} Terrain generator or null
   */
  getTerrainGenerator() {
    return this.terrainGenerator;
  }

  /**
   * Initialize the complete world
   * @param {HTMLElement} container - DOM element to attach the renderer
   * @returns {Object} - { scene, camera, renderer, terrainGenerator }
   */
  init(container) {
    const result = this.initScene(container);
    this.addLighting();
    this.createGround();
    this.setupResizeHandler();
    return { 
      ...result, 
      terrainGenerator: this.terrainGenerator 
    };
  }
}
