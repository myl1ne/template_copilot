import * as THREE from 'three';

/**
 * MAC (MeshAsCode) Core Framework
 * 
 * A recursive framework for creating complex 3D meshes using only code.
 * MACs can be composed into increasingly complex abstractions.
 * Code is stored as strings for easy save/load/edit in UI.
 * 
 * @example
 * const boxMAC = new MAC('box', {
 *   width: 1, height: 1, depth: 1,
 *   material: { color: 0xff0000 }
 * });
 * 
 * const compositeMAC = new MAC('group')
 *   .add(boxMAC, { position: [0, 0, 0] })
 *   .add('sphere', { radius: 0.5, position: [2, 0, 0] });
 */

/**
 * MAC - MeshAsCode primitive
 * Represents a mesh or group of meshes defined by code
 */
export class MAC {
    constructor(type, params = {}) {
        this.type = type;
        this.params = params;
        this.children = [];
        this.transforms = [];
        this.id = MAC.generateId();
    }

    /**
     * Generate unique ID for MAC instances
     */
    static generateId() {
        return `mac_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add a child MAC or create a new one
     * @param {MAC|string} macOrType - MAC instance or type string
     * @param {Object} params - Parameters if creating new MAC
     * @returns {MAC} This MAC for chaining
     */
    add(macOrType, params = {}) {
        let child;
        if (macOrType instanceof MAC) {
            child = macOrType;
        } else {
            child = new MAC(macOrType, params);
        }
        this.children.push(child);
        return this;
    }

    /**
     * Apply transformation to this MAC
     * @param {string} type - Transform type (position, rotation, scale)
     * @param {Array} value - Transform value
     * @returns {MAC} This MAC for chaining
     */
    transform(type, value) {
        this.transforms.push({ type, value });
        return this;
    }

    /**
     * Set position
     */
    position(x, y, z) {
        return this.transform('position', [x, y, z]);
    }

    /**
     * Set rotation
     */
    rotation(x, y, z) {
        return this.transform('rotation', [x, y, z]);
    }

    /**
     * Set scale
     */
    scale(x, y, z) {
        if (y === undefined) {
            y = x;
            z = x;
        }
        return this.transform('scale', [x, y, z]);
    }

    /**
     * Serialize to JSON
     */
    toJSON() {
        return {
            id: this.id,
            type: this.type,
            params: this.params,
            transforms: this.transforms,
            children: this.children.map(c => c.toJSON())
        };
    }

    /**
     * Deserialize from JSON
     */
    static fromJSON(json) {
        const mac = new MAC(json.type, json.params);
        mac.id = json.id;
        mac.transforms = json.transforms || [];
        mac.children = (json.children || []).map(c => MAC.fromJSON(c));
        return mac;
    }

    /**
     * Convert to code string
     */
    toCode(indent = 0) {
        const ind = '  '.repeat(indent);
        const paramsStr = Object.keys(this.params).length > 0 
            ? JSON.stringify(this.params, null, 2).split('\n').join('\n' + ind + '  ')
            : '{}';
        
        let code = `${ind}new MAC('${this.type}', ${paramsStr})`;
        
        // Add transforms
        for (const t of this.transforms) {
            const valStr = `[${t.value.join(', ')}]`;
            code += `\n${ind}  .${t.type}(${t.value.join(', ')})`;
        }
        
        // Add children
        for (const child of this.children) {
            code += `\n${ind}  .add(\n${child.toCode(indent + 2)}\n${ind}  )`;
        }
        
        return code;
    }

    /**
     * Build the actual Three.js mesh/group
     */
    build() {
        const mesh = MACBuilder.build(this);
        
        // Apply transforms
        for (const t of this.transforms) {
            switch(t.type) {
                case 'position':
                    mesh.position.set(...t.value);
                    break;
                case 'rotation':
                    mesh.rotation.set(...t.value);
                    break;
                case 'scale':
                    mesh.scale.set(...t.value);
                    break;
            }
        }
        
        return mesh;
    }

    /**
     * Clone this MAC
     */
    clone() {
        return MAC.fromJSON(this.toJSON());
    }
}

/**
 * MACBuilder - Builds Three.js objects from MAC definitions
 */
export class MACBuilder {
    /**
     * Build a Three.js object from MAC definition
     */
    static build(mac) {
        const builder = this.builders[mac.type];
        if (!builder) {
            console.warn(`Unknown MAC type: ${mac.type}`);
            return new THREE.Group();
        }
        
        const mesh = builder(mac.params);
        
        // Add children if any
        for (const child of mac.children) {
            const childMesh = child.build();
            mesh.add(childMesh);
        }
        
        return mesh;
    }

    /**
     * Register a custom builder
     */
    static register(type, builderFn) {
        this.builders[type] = builderFn;
    }

    /**
     * Built-in builders for primitives
     */
    static builders = {
        // Group container
        group: (params) => {
            return new THREE.Group();
        },

        // Box primitive
        box: (params) => {
            const {
                width = 1, height = 1, depth = 1,
                widthSegments = 1, heightSegments = 1, depthSegments = 1,
                material = {}
            } = params;
            
            const geometry = new THREE.BoxGeometry(
                width, height, depth,
                widthSegments, heightSegments, depthSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Sphere primitive
        sphere: (params) => {
            const {
                radius = 0.5,
                widthSegments = 16,
                heightSegments = 16,
                material = {}
            } = params;
            
            const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Cylinder primitive
        cylinder: (params) => {
            const {
                radiusTop = 0.5,
                radiusBottom = 0.5,
                height = 1,
                radialSegments = 16,
                heightSegments = 1,
                material = {}
            } = params;
            
            const geometry = new THREE.CylinderGeometry(
                radiusTop, radiusBottom, height,
                radialSegments, heightSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Cone primitive
        cone: (params) => {
            const {
                radius = 0.5,
                height = 1,
                radialSegments = 16,
                material = {}
            } = params;
            
            const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Capsule primitive
        capsule: (params) => {
            const {
                radius = 0.5,
                length = 1,
                capSegments = 8,
                radialSegments = 16,
                material = {}
            } = params;
            
            const geometry = new THREE.CapsuleGeometry(
                radius, length, capSegments, radialSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Torus primitive
        torus: (params) => {
            const {
                radius = 0.5,
                tube = 0.2,
                radialSegments = 16,
                tubularSegments = 32,
                material = {}
            } = params;
            
            const geometry = new THREE.TorusGeometry(
                radius, tube, radialSegments, tubularSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Plane primitive
        plane: (params) => {
            const {
                width = 1,
                height = 1,
                widthSegments = 1,
                heightSegments = 1,
                material = {}
            } = params;
            
            const geometry = new THREE.PlaneGeometry(
                width, height, widthSegments, heightSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        },

        // Ring primitive
        ring: (params) => {
            const {
                innerRadius = 0.3,
                outerRadius = 0.5,
                thetaSegments = 16,
                material = {}
            } = params;
            
            const geometry = new THREE.RingGeometry(
                innerRadius, outerRadius, thetaSegments
            );
            const mat = MACBuilder.createMaterial(material);
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }
    };

    /**
     * Create material from params
     */
    static createMaterial(params) {
        const {
            color = 0xffffff,
            emissive = 0x000000,
            metalness = 0,
            roughness = 0.5,
            transparent = false,
            opacity = 1,
            wireframe = false
        } = params;

        return new THREE.MeshStandardMaterial({
            color,
            emissive,
            metalness,
            roughness,
            transparent,
            opacity,
            wireframe
        });
    }
}

/**
 * MACLibrary - Collection of pre-defined MAC templates
 */
export class MACLibrary {
    static templates = {};

    /**
     * Register a MAC template
     */
    static register(name, mac) {
        this.templates[name] = mac;
    }

    /**
     * Get a MAC template
     */
    static get(name) {
        const template = this.templates[name];
        return template ? template.clone() : null;
    }

    /**
     * Get all template names
     */
    static getAll() {
        return Object.keys(this.templates);
    }

    /**
     * Create from code string
     */
    static fromCode(code) {
        try {
            // Create safe evaluation context
            const MAC_INSTANCE = MAC;
            const fn = new Function('MAC', `return ${code}`);
            return fn(MAC_INSTANCE);
        } catch (error) {
            console.error('Error creating MAC from code:', error);
            return null;
        }
    }
}

// Register some default templates
MACLibrary.register('simple_tree', 
    new MAC('group')
        .add('cylinder', { 
            radiusTop: 0.2, radiusBottom: 0.3, height: 2,
            material: { color: 0x4a2511 }
        })
        .position(0, 1, 0)
        .add('cone', {
            radius: 1, height: 2,
            material: { color: 0x2d5016 }
        })
        .position(0, 3, 0)
);

MACLibrary.register('simple_house',
    new MAC('group')
        .add('box', {
            width: 2, height: 2, depth: 2,
            material: { color: 0x8b7355 }
        })
        .position(0, 1, 0)
        .add('cone', {
            radius: 1.5, height: 1,
            material: { color: 0x654321 }
        })
        .position(0, 2.5, 0)
        .rotation(0, Math.PI / 4, 0)
);

MACLibrary.register('simple_character',
    new MAC('group')
        .add('capsule', {
            radius: 0.3, length: 0.8,
            material: { color: 0x4a7c59 }
        })
        .position(0, 0.9, 0)
        .add('sphere', {
            radius: 0.25,
            material: { color: 0x3d6e49 }
        })
        .position(0, 1.6, 0)
);
