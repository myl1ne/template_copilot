import * as THREE from 'three';

/**
 * WaterPlane - Creates animated water with transparency and reflection
 */
export class WaterPlane {
    constructor(options = {}) {
        this.size = options.size || 100;
        this.waterLevel = options.waterLevel || 2;
        this.time = 0;
        this.mesh = null;
    }

    /**
     * Create water plane mesh
     * @returns {THREE.Mesh} Water mesh
     */
    create() {
        const geometry = new THREE.PlaneGeometry(this.size, this.size, 50, 50);
        
        // Create water material with transparency and color
        const material = new THREE.MeshStandardMaterial({
            color: 0x1e90ff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.8,
            side: THREE.DoubleSide,
            emissive: 0x0066aa,
            emissiveIntensity: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = this.waterLevel;
        this.mesh.receiveShadow = true;

        return this.mesh;
    }

    /**
     * Animate water surface (wave motion)
     * Call this in the animation loop
     * @param {number} deltaTime - Time since last frame
     */
    animate(deltaTime) {
        if (!this.mesh) return;

        this.time += deltaTime * 0.5;
        
        const positions = this.mesh.geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            
            // Gentle wave motion
            const wave = Math.sin(x * 0.1 + this.time) * 0.1 + 
                        Math.cos(y * 0.1 + this.time * 1.3) * 0.1;
            
            positions.setZ(i, wave);
        }
        
        positions.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }
}
