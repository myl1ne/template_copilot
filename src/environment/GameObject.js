/**
 * Base class for all game objects in the 3D world
 */
class GameObject {
    constructor(name, options = {}) {
        this.name = name;
        this.type = options.type || 'object';
        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.rotation = options.rotation || { x: 0, y: 0, z: 0 };
        this.scale = options.scale || { x: 1, y: 1, z: 1 };
        this.interactable = options.interactable || false;
        this.interactionDistance = options.interactionDistance || 2;
        this.onInteract = options.onInteract || null;
        this.mesh = null;
        this.description = options.description || '';
    }

    canInteract(playerPosition) {
        if (!this.interactable) return false;
        
        const dx = this.position.x - playerPosition.x;
        const dz = this.position.z - playerPosition.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        return distance <= this.interactionDistance;
    }

    interact(player) {
        if (this.onInteract) {
            this.onInteract(player, this);
        }
    }

    setMesh(mesh) {
        this.mesh = mesh;
        if (mesh) {
            mesh.position.set(this.position.x, this.position.y, this.position.z);
            mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            mesh.scale.set(this.scale.x, this.scale.y, this.scale.z);
        }
    }
}

module.exports = GameObject;
