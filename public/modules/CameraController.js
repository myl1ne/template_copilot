/**
 * CameraController - Handles WoW-style camera controls
 */
export class CameraController {
    constructor(camera, renderer, characterGroup) {
        this.camera = camera;
        this.renderer = renderer;
        this.characterGroup = characterGroup;
        
        // Camera state
        this.cameraDistance = 8;
        this.cameraHeight = 3;
        this.cameraAngleH = 0; // Horizontal rotation
        this.cameraAngleV = 0.3; // Vertical angle
        this.isRightMouseDown = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        const domElement = this.renderer.domElement;
        
        // Mouse controls for camera
        domElement.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Right mouse button
                this.isRightMouseDown = true;
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
                domElement.style.cursor = 'grabbing';
            }
        });

        domElement.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                this.isRightMouseDown = false;
                domElement.style.cursor = 'default';
            }
        });

        domElement.addEventListener('mousemove', (e) => {
            if (this.isRightMouseDown) {
                const deltaX = e.clientX - this.lastMouseX;
                const deltaY = e.clientY - this.lastMouseY;
                
                this.cameraAngleH -= deltaX * 0.005;
                this.cameraAngleV = Math.max(-0.5, Math.min(1.4, this.cameraAngleV + deltaY * 0.005));
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        // Mouse wheel for zoom
        domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.cameraDistance = Math.max(3, Math.min(20, this.cameraDistance + e.deltaY * 0.01));
        });

        // Prevent context menu
        domElement.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Update camera position to follow character
     */
    update() {
        // Calculate camera position based on angles
        const offsetX = Math.sin(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;
        const offsetY = Math.sin(this.cameraAngleV) * this.cameraDistance + this.cameraHeight;
        const offsetZ = Math.cos(this.cameraAngleH) * Math.cos(this.cameraAngleV) * this.cameraDistance;
        
        const idealPosition = {
            x: this.characterGroup.position.x + offsetX,
            y: this.characterGroup.position.y + offsetY,
            z: this.characterGroup.position.z + offsetZ
        };
        
        const lookAtPosition = {
            x: this.characterGroup.position.x,
            y: this.characterGroup.position.y + 1.5,
            z: this.characterGroup.position.z
        };
        
        // Smooth camera movement
        this.camera.position.lerp(idealPosition, 0.1);
        this.camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    }

    /**
     * Get current camera horizontal angle (for movement calculations)
     */
    getHorizontalAngle() {
        return this.cameraAngleH;
    }
}
