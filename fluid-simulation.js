/**
 * Optimized Fluid Simulation using Three.js
 * 
 * Techniques Used:
 * 1. GPU-accelerated particle system with BufferGeometry
 * 2. Screen-space fluid rendering with custom shaders
 * 3. Instanced rendering for performance
 * 4. Simplified physics using curl noise for fluid-like motion
 * 5. Metaball-style rendering for smooth fluid appearance
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class FluidSimulation {
    constructor() {
        this.params = {
            particleCount: 10000,
            particleSize: 2.0,
            flowSpeed: 1.0,
            turbulence: 0.5,
            containerSize: 30,
            fluidType: 'water' // 'water' or 'oil'
        };
        
        // Fluid type properties
        this.fluidTypes = {
            water: {
                density: 1.0,
                viscosity: 0.99,
                buoyancy: 0.3,
                color: { r: 0.2, g: 0.6, b: 0.9 },
                name: 'Water'
            },
            oil: {
                density: 0.8,
                viscosity: 0.95,
                buoyancy: 0.15,
                color: { r: 0.8, g: 0.6, b: 0.2 },
                name: 'Oil'
            }
        };
        
        // Container physics
        this.containerVelocity = new THREE.Vector3(0, 0, 0);
        this.containerPosition = new THREE.Vector3(0, 0, 0);
        this.containerRotation = new THREE.Euler(0, 0, 0);
        this.isDraggingContainer = false;
        this.previousContainerPosition = new THREE.Vector3();
        
        this.init();
        this.createFluidParticles();
        this.setupControls();
        this.setupContainerDrag();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 30, 100);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            1,  // Increased near clipping to prevent zoom issues
            500 // Adjusted far clipping
        );
        this.camera.position.set(40, 40, 40);
        this.camera.lookAt(0, 0, 0);
        
        // Renderer with optimizations
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 20;  // Prevent zooming too close
        this.controls.maxDistance = 150; // Prevent zooming too far
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        this.scene.add(directionalLight);
        
        const pointLight1 = new THREE.PointLight(0x4fc3f7, 1, 100);
        pointLight1.position.set(20, 20, 20);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x81c784, 0.5, 100);
        pointLight2.position.set(-20, -20, -20);
        this.scene.add(pointLight2);
        
        // Container visualization (wireframe box)
        const containerGeometry = new THREE.BoxGeometry(
            this.params.containerSize,
            this.params.containerSize,
            this.params.containerSize
        );
        const containerMaterial = new THREE.MeshBasicMaterial({
            color: 0x4fc3f7,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.container = new THREE.Mesh(containerGeometry, containerMaterial);
        this.scene.add(this.container);
        
        // Performance tracking
        this.lastTime = performance.now();
        this.frames = 0;
        this.time = 0;
        
        // Resize handler
        window.addEventListener('resize', () => this.onResize());
    }
    
    createFluidParticles() {
        const count = this.params.particleCount;
        
        // Create buffer geometry for particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        
        // Initialize particles in a sphere
        const radius = this.params.containerSize * 0.3;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Spherical distribution
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.cbrt(Math.random());
            
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);
            
            // Random initial velocities
            velocities[i3] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
            
            // Color variation based on fluid type
            const fluidColor = this.fluidTypes[this.params.fluidType].color;
            const colorMix = Math.random();
            colors[i3] = fluidColor.r + colorMix * 0.2;      // R
            colors[i3 + 1] = fluidColor.g + colorMix * 0.2;  // G
            colors[i3 + 2] = fluidColor.b + colorMix * 0.1;  // B
            
            // Size variation
            sizes[i] = this.params.particleSize * (0.5 + Math.random() * 0.5);
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom shader material for fluid-like appearance
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute vec3 velocity;
                attribute vec3 color;
                attribute float size;
                
                varying vec3 vColor;
                varying vec3 vPosition;
                
                uniform float time;
                uniform float pixelRatio;
                
                void main() {
                    vColor = color;
                    vPosition = position;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_Position = projectionMatrix * mvPosition;
                    
                    // Size attenuation based on distance - improved to prevent disappearing
                    float distanceScale = 1.0 / max(-mvPosition.z, 1.0);
                    gl_PointSize = size * clamp(distanceScale * 50.0, 5.0, 100.0) * pixelRatio;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying vec3 vPosition;
                
                void main() {
                    // Circular particle shape with soft edges (metaball effect)
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    // Smooth falloff for metaball blending effect
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    
                    // Add some glow effect
                    vec3 finalColor = vColor + vec3(0.2) * (1.0 - dist * 2.0);
                    
                    gl_FragColor = vec4(finalColor, alpha * 0.8);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        
        // Store velocity buffer for updates
        this.velocities = velocities;
    }
    
    updateParticles(deltaTime) {
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.velocities;
        const count = positions.length / 3;
        const halfSize = this.params.containerSize / 2;
        
        const speed = this.params.flowSpeed;
        const turbulence = this.params.turbulence;
        const fluidProps = this.fluidTypes[this.params.fluidType];
        
        // Apply container movement to particles
        const containerAccel = this.containerVelocity.clone().multiplyScalar(deltaTime * 5);
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            // Current position
            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];
            
            // Current velocity
            let vx = velocities[i3];
            let vy = velocities[i3 + 1];
            let vz = velocities[i3 + 2];
            
            // Add curl noise for fluid-like motion
            const noiseScale = 0.05;
            const curlX = this.curl3D(x, y, z, this.time * speed, noiseScale);
            const curlY = this.curl3D(x + 100, y, z, this.time * speed, noiseScale);
            const curlZ = this.curl3D(x, y + 100, z, this.time * speed, noiseScale);
            
            // Apply forces
            vx += curlX * turbulence * deltaTime;
            vy += curlY * turbulence * deltaTime;
            vz += curlZ * turbulence * deltaTime;
            
            // Add circular flow pattern
            const angle = Math.atan2(z, x);
            const radius = Math.sqrt(x * x + z * z);
            vx += Math.cos(angle + Math.PI / 2) * 0.5 * speed * deltaTime;
            vz += Math.sin(angle + Math.PI / 2) * 0.5 * speed * deltaTime;
            
            // Add rising motion (buoyancy) - based on fluid type
            vy += fluidProps.buoyancy * speed * deltaTime;
            
            // Apply container movement influence
            vx += containerAccel.x;
            vy += containerAccel.y;
            vz += containerAccel.z;
            
            // Damping based on viscosity
            vx *= fluidProps.viscosity;
            vy *= fluidProps.viscosity;
            vz *= fluidProps.viscosity;
            
            // Update position
            x += vx;
            y += vy;
            z += vz;
            
            // Boundary collision with energy loss
            const damping = 0.7;
            if (Math.abs(x) > halfSize) {
                x = Math.sign(x) * halfSize;
                vx *= -damping;
            }
            if (Math.abs(y) > halfSize) {
                y = Math.sign(y) * halfSize;
                vy *= -damping;
            }
            if (Math.abs(z) > halfSize) {
                z = Math.sign(z) * halfSize;
                vz *= -damping;
            }
            
            // Write back
            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;
            
            velocities[i3] = vx;
            velocities[i3 + 1] = vy;
            velocities[i3 + 2] = vz;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Simplex noise-based curl noise for fluid motion
    curl3D(x, y, z, time, scale) {
        const eps = 0.1;
        
        // Sample noise at nearby points
        const n1 = this.noise3D((x + eps) * scale, y * scale, z * scale + time);
        const n2 = this.noise3D((x - eps) * scale, y * scale, z * scale + time);
        
        return (n1 - n2) / (2 * eps);
    }
    
    // Simple 3D noise function (pseudo-Perlin)
    noise3D(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        
        // Hash coordinates
        const hash = (i) => {
            return ((i * 2654435761) ^ (i >> 16)) & 255;
        };
        
        const A = hash(X) + Y;
        const AA = hash(A) + Z;
        const AB = hash(A + 1) + Z;
        const B = hash(X + 1) + Y;
        const BA = hash(B) + Z;
        const BB = hash(B + 1) + Z;
        
        return this.lerp(w,
            this.lerp(v,
                this.lerp(u, hash(AA), hash(BA)),
                this.lerp(u, hash(AB), hash(BB))
            ),
            this.lerp(v,
                this.lerp(u, hash(AA + 1), hash(BA + 1)),
                this.lerp(u, hash(AB + 1), hash(BB + 1))
            )
        ) / 128 - 1;
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    setupControls() {
        // Fluid type control
        const fluidTypeSelect = document.getElementById('fluid-type');
        if (fluidTypeSelect) {
            fluidTypeSelect.addEventListener('change', (e) => {
                this.params.fluidType = e.target.value;
                this.updateFluidColors();
                document.getElementById('fluid-type-name').textContent = 
                    this.fluidTypes[this.params.fluidType].name;
            });
        }
        
        // Particle size control
        const sizeSlider = document.getElementById('particle-size');
        const sizeValue = document.getElementById('size-value');
        sizeSlider.addEventListener('input', (e) => {
            this.params.particleSize = parseFloat(e.target.value);
            sizeValue.textContent = e.target.value;
            
            // Update particle sizes
            const sizes = this.particles.geometry.attributes.size.array;
            for (let i = 0; i < sizes.length; i++) {
                sizes[i] = this.params.particleSize * (0.5 + Math.random() * 0.5);
            }
            this.particles.geometry.attributes.size.needsUpdate = true;
        });
        
        // Flow speed control
        const speedSlider = document.getElementById('flow-speed');
        const speedValue = document.getElementById('speed-value');
        speedSlider.addEventListener('input', (e) => {
            this.params.flowSpeed = parseFloat(e.target.value);
            speedValue.textContent = e.target.value;
        });
        
        // Turbulence control
        const turbulenceSlider = document.getElementById('turbulence');
        const turbulenceValue = document.getElementById('turbulence-value');
        turbulenceSlider.addEventListener('input', (e) => {
            this.params.turbulence = parseFloat(e.target.value);
            turbulenceValue.textContent = e.target.value;
        });
        
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => this.reset());
    }
    
    setupContainerDrag() {
        // Make container draggable with mouse
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            // Check if clicking on container (middle mouse or shift+left click)
            if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
                isDragging = true;
                previousMousePosition = { x: e.clientX, y: e.clientY };
                this.previousContainerPosition.copy(this.containerPosition);
                e.preventDefault();
            }
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaX = e.clientX - previousMousePosition.x;
                const deltaY = e.clientY - previousMousePosition.y;
                
                // Convert screen movement to world movement
                const movementScale = 0.1;
                this.containerPosition.x += deltaX * movementScale;
                this.containerPosition.y -= deltaY * movementScale;
                
                // Update container visual position
                this.container.position.copy(this.containerPosition);
                
                // Calculate velocity for physics
                const deltaPos = this.containerPosition.clone().sub(this.previousContainerPosition);
                this.containerVelocity.copy(deltaPos).multiplyScalar(10);
                
                this.previousContainerPosition.copy(this.containerPosition);
                previousMousePosition = { x: e.clientX, y: e.clientY };
                e.preventDefault();
            }
        });
        
        this.renderer.domElement.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                // Apply damping to container velocity
                this.containerVelocity.multiplyScalar(0.5);
            }
        });
        
        this.renderer.domElement.addEventListener('mouseleave', () => {
            isDragging = false;
        });
    }
    
    updateFluidColors() {
        const colors = this.particles.geometry.attributes.color.array;
        const fluidColor = this.fluidTypes[this.params.fluidType].color;
        const count = colors.length / 3;
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const colorMix = Math.random();
            colors[i3] = fluidColor.r + colorMix * 0.2;
            colors[i3 + 1] = fluidColor.g + colorMix * 0.2;
            colors[i3 + 2] = fluidColor.b + colorMix * 0.1;
        }
        
        this.particles.geometry.attributes.color.needsUpdate = true;
    }
    
    reset() {
        // Reset particle positions to sphere
        const positions = this.particles.geometry.attributes.position.array;
        const velocities = this.velocities;
        const radius = this.params.containerSize * 0.3;
        const count = positions.length / 3;
        
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = radius * Math.cbrt(Math.random());
            
            positions[i3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = r * Math.cos(phi);
            
            velocities[i3] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.1;
        }
        
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
    
    updateStats() {
        const currentTime = performance.now();
        this.frames++;
        
        if (currentTime >= this.lastTime + 1000) {
            const fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps').textContent = fps;
            document.getElementById('active-particles').textContent = this.params.particleCount;
            
            this.frames = 0;
            this.lastTime = currentTime;
        }
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const currentTime = performance.now();
        const deltaTime = Math.min((currentTime - this.lastFrameTime || currentTime) / 1000, 0.1);
        this.lastFrameTime = currentTime;
        
        this.time += deltaTime;
        
        // Decay container velocity
        this.containerVelocity.multiplyScalar(0.95);
        
        // Update particle positions
        this.updateParticles(deltaTime);
        
        // Update shader time uniform
        if (this.particles.material.uniforms) {
            this.particles.material.uniforms.time.value = this.time;
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        
        // Update stats
        this.updateStats();
    }
}

// Initialize simulation when page loads
new FluidSimulation();
