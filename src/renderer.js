import * as THREE from 'three';
import { ElementType, ElementProperties, getElementColor } from './elements.js';

export class VoxelRenderer {
    constructor(world, container) {
        this.world = world;
        this.container = container;
        
        // Setup Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Position camera to see the whole world
        const maxDim = Math.max(world.width, world.height, world.depth);
        this.camera.position.set(maxDim * 1.5, maxDim * 1.2, maxDim * 1.5);
        this.camera.lookAt(world.width / 2, world.height / 2, world.depth / 2);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        this.scene.add(directionalLight);
        
        // Camera controls (simple mouse drag)
        this.setupControls();
        
        // Create instanced mesh for better performance
        this.instancedMeshes = {};
        this.createInstancedMeshes();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createInstancedMeshes() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const maxInstances = this.world.width * this.world.height * this.world.depth;
        
        // Create instanced mesh for each element type
        for (const type in ElementType) {
            const elementType = ElementType[type];
            if (elementType === ElementType.AIR) continue;
            
            const props = ElementProperties[elementType];
            const material = new THREE.MeshLambertMaterial({
                color: props.color,
                transparent: props.transparent || false,
                opacity: props.transparent ? 0.3 : 1.0
            });
            
            const mesh = new THREE.InstancedMesh(geometry, material, maxInstances);
            mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            mesh.count = 0; // Start with no instances
            
            // Initialize instanceColor for lava
            if (elementType === ElementType.LAVA) {
                mesh.instanceColor = new THREE.InstancedBufferAttribute(
                    new Float32Array(maxInstances * 3), 
                    3
                );
            }
            
            this.scene.add(mesh);
            
            this.instancedMeshes[elementType] = mesh;
        }
    }
    
    update() {
        // Update instance matrices for each element type
        const dummy = new THREE.Object3D();
        const counts = {};
        
        // Reset counts
        for (const type in this.instancedMeshes) {
            counts[type] = 0;
        }
        
        // Update all voxels
        for (let x = 0; x < this.world.width; x++) {
            for (let y = 0; y < this.world.height; y++) {
                for (let z = 0; z < this.world.depth; z++) {
                    const voxel = this.world.getVoxel(x, y, z);
                    
                    if (voxel.type === ElementType.AIR) continue;
                    
                    const mesh = this.instancedMeshes[voxel.type];
                    if (!mesh) continue;
                    
                    dummy.position.set(x, y, z);
                    dummy.updateMatrix();
                    
                    mesh.setMatrixAt(counts[voxel.type], dummy.matrix);
                    
                    // Update color for lava based on temperature
                    if (voxel.type === ElementType.LAVA) {
                        const color = new THREE.Color(getElementColor(voxel.type, voxel.temperature));
                        mesh.setColorAt(counts[voxel.type], color);
                    }
                    
                    counts[voxel.type]++;
                }
            }
        }
        
        // Update instance counts and mark as needing update
        for (const type in this.instancedMeshes) {
            const mesh = this.instancedMeshes[type];
            mesh.count = counts[type] || 0;
            mesh.instanceMatrix.needsUpdate = true;
            
            if (mesh.instanceColor) {
                mesh.instanceColor.needsUpdate = true;
            }
        }
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    setupControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 3 };
        let cameraDistance = this.camera.position.length();
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            cameraAngle.theta -= deltaX * 0.01;
            cameraAngle.phi -= deltaY * 0.01;
            
            // Clamp phi to avoid flipping
            cameraAngle.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngle.phi));
            
            this.updateCameraPosition(cameraAngle, cameraDistance);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        canvas.addEventListener('mouseup', () => {
            isDragging = false;
        });
        
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            cameraDistance += e.deltaY * 0.01;
            cameraDistance = Math.max(10, Math.min(200, cameraDistance));
            this.updateCameraPosition(cameraAngle, cameraDistance);
        });
    }
    
    updateCameraPosition(angle, distance) {
        const centerX = this.world.width / 2;
        const centerY = this.world.height / 2;
        const centerZ = this.world.depth / 2;
        
        this.camera.position.x = centerX + distance * Math.sin(angle.phi) * Math.cos(angle.theta);
        this.camera.position.y = centerY + distance * Math.cos(angle.phi);
        this.camera.position.z = centerZ + distance * Math.sin(angle.phi) * Math.sin(angle.theta);
        
        this.camera.lookAt(centerX, centerY, centerZ);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    dispose() {
        window.removeEventListener('resize', () => this.onWindowResize());
        this.renderer.dispose();
    }
}
