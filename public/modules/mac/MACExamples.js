import { MAC, MACLibrary } from './MACCore.js';

/**
 * MACExamples - Comprehensive demonstration of MAC framework capabilities
 * 
 * Features spatially correct models with:
 * - Proper positioning and transformations
 * - Ambitious recursive compositions
 * - Animation support
 * - Vivid, detailed scenes
 */

// ============================================================================
// BASIC BUILDING BLOCKS
// ============================================================================

/**
 * Torch with flickering flame effect
 */
MACLibrary.register('torch',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.08, height: 1,
            material: { color: 0x4a2511 }
        }, { position: [0, 0.5, 0] })
        .add('sphere', {
            radius: 0.15,
            material: { color: 0xff4500, emissive: 0xff6600 }
        }, { position: [0, 1.1, 0] })
);

/**
 * Wooden barrel with metal bands
 */
MACLibrary.register('barrel',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.4, radiusBottom: 0.4, height: 1,
            material: { color: 0x8b4513 }
        }, { position: [0, 0.5, 0] })
        .add('torus', {
            radius: 0.42, tube: 0.05,
            material: { color: 0x2f1f1f, metalness: 0.7 }
        }, { position: [0, 0.3, 0], rotation: [Math.PI / 2, 0, 0] })
        .add('torus', {
            radius: 0.42, tube: 0.05,
            material: { color: 0x2f1f1f, metalness: 0.7 }
        }, { position: [0, 0.7, 0], rotation: [Math.PI / 2, 0, 0] })
);

/**
 * Detailed tree with multiple foliage layers
 */
MACLibrary.register('tree',
    new MAC('group')
        // Trunk
        .add('cylinder', {
            radiusTop: 0.25, radiusBottom: 0.35, height: 3,
            material: { color: 0x4a2511 }
        }, { position: [0, 1.5, 0] })
        // Lower foliage
        .add('cone', {
            radius: 1.2, height: 1.5,
            material: { color: 0x2d5016 }
        }, { position: [0, 3, 0] })
        // Middle foliage
        .add('cone', {
            radius: 1, height: 1.3,
            material: { color: 0x3d6e49 }
        }, { position: [0, 4, 0] })
        // Top foliage
        .add('cone', {
            radius: 0.7, height: 1,
            material: { color: 0x4a7c59 }
        }, { position: [0, 5, 0] })
        // Small branch details (spheres)
        .add('sphere', {
            radius: 0.35,
            material: { color: 0x2d5016 }
        }, { position: [0.6, 3.5, 0.3] })
        .add('sphere', {
            radius: 0.3,
            material: { color: 0x3d6e49 }
        }, { position: [-0.5, 4, -0.2] })
        .add('sphere', {
            radius: 0.25,
            material: { color: 0x4a7c59 }
        }, { position: [0.3, 4.5, -0.4] })
);

// ============================================================================
// REUSABLE COMPONENTS FOR RECURSIVE COMPOSITION
// ============================================================================

/**
 * Window component
 */
MACLibrary.register('window',
    new MAC('group')
        .add('box', {
            width: 0.4, height: 0.6, depth: 0.05,
            material: { color: 0x4169e1, emissive: 0x1e3a8a }
        }, { position: [0, 0, 0] })
        // Window frame
        .add('box', {
            width: 0.45, height: 0.05, depth: 0.06,
            material: { color: 0x8b7355 }
        }, { position: [0, 0.325, 0] })
        .add('box', {
            width: 0.45, height: 0.05, depth: 0.06,
            material: { color: 0x8b7355 }
        }, { position: [0, -0.325, 0] })
);

/**
 * Door component
 */
MACLibrary.register('door',
    new MAC('group')
        .add('box', {
            width: 0.6, height: 1.2, depth: 0.05,
            material: { color: 0x654321 }
        }, { position: [0, 0, 0] })
        // Door handle
        .add('sphere', {
            radius: 0.05,
            material: { color: 0xffd700, metalness: 0.9 }
        }, { position: [0.2, 0, 0.05] })
);

/**
 * Wheel component
 */
MACLibrary.register('wheel',
    new MAC('group')
        // Main wheel
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.3, height: 0.1,
            material: { color: 0x4a2511 }
        }, { rotation: [0, 0, Math.PI / 2] })
        // Hub
        .add('sphere', {
            radius: 0.08,
            material: { color: 0x2f1f1f, metalness: 0.6 }
        }, { position: [0, 0, 0] })
        // Spokes
        .add('box', {
            width: 0.05, height: 0.5, depth: 0.05,
            material: { color: 0x8b4513 }
        }, { position: [0, 0, 0], rotation: [0, 0, 0] })
        .add('box', {
            width: 0.05, height: 0.5, depth: 0.05,
            material: { color: 0x8b4513 }
        }, { position: [0, 0, 0], rotation: [0, 0, Math.PI / 2] })
);

/**
 * Stone brick component
 */
MACLibrary.register('stone_brick',
    new MAC('box', {
        width: 0.5, height: 0.25, depth: 0.3,
        material: { color: 0x808080, roughness: 0.9 }
    })
);

/**
 * Fence post component
 */
MACLibrary.register('fence_post',
    new MAC('box', {
        width: 0.1, height: 1.5, depth: 0.1,
        material: { color: 0x8b7355 }
    })
);

// ============================================================================
// COMPLEX STRUCTURES USING RECURSIVE COMPOSITION
// ============================================================================

/**
 * Medieval house with windows and door
 */
MACLibrary.register('house',
    new MAC('group')
        // Walls
        .add('box', {
            width: 3, height: 2.5, depth: 3,
            material: { color: 0x8b7355 }
        }, { position: [0, 1.25, 0] })
        // Roof
        .add('cone', {
            radius: 2.2, height: 1.5,
            material: { color: 0x654321 }
        }, { position: [0, 3.25, 0], rotation: [0, Math.PI / 4, 0] })
        // Front door
        .add(MACLibrary.get('door'), {}, { position: [0, 0.6, 1.53] })
        // Windows
        .add(MACLibrary.get('window'), {}, { position: [-1, 1.5, 1.53] })
        .add(MACLibrary.get('window'), {}, { position: [1, 1.5, 1.53] })
        .add(MACLibrary.get('window'), {}, { position: [-1.53, 1.5, 0], rotation: [0, Math.PI / 2, 0] })
        .add(MACLibrary.get('window'), {}, { position: [1.53, 1.5, 0], rotation: [0, -Math.PI / 2, 0] })
        // Chimney
        .add('box', {
            width: 0.4, height: 1.5, depth: 0.4,
            material: { color: 0x696969 }
        }, { position: [1, 3.5, 0.8] })
);

/**
 * Stone tower with multiple levels
 */
MACLibrary.register('tower',
    new MAC('group')
        // Base level
        .add('cylinder', {
            radiusTop: 1, radiusBottom: 1.2, height: 3,
            material: { color: 0x696969, roughness: 0.9 }
        }, { position: [0, 1.5, 0] })
        // Middle level
        .add('cylinder', {
            radiusTop: 0.9, radiusBottom: 1, height: 2,
            material: { color: 0x808080, roughness: 0.9 }
        }, { position: [0, 4, 0] })
        // Top level
        .add('cylinder', {
            radiusTop: 0.7, radiusBottom: 0.9, height: 1.5,
            material: { color: 0x909090, roughness: 0.9 }
        }, { position: [0, 5.75, 0] })
        // Battlements
        .add('box', {
            width: 0.3, height: 0.5, depth: 0.3,
            material: { color: 0x696969 }
        }, { position: [0.8, 6.75, 0] })
        .add('box', {
            width: 0.3, height: 0.5, depth: 0.3,
            material: { color: 0x696969 }
        }, { position: [-0.8, 6.75, 0] })
        .add('box', {
            width: 0.3, height: 0.5, depth: 0.3,
            material: { color: 0x696969 }
        }, { position: [0, 6.75, 0.8] })
        .add('box', {
            width: 0.3, height: 0.5, depth: 0.3,
            material: { color: 0x696969 }
        }, { position: [0, 6.75, -0.8] })
        // Roof
        .add('cone', {
            radius: 1.2, height: 1.8,
            material: { color: 0x4a4a4a }
        }, { position: [0, 7.9, 0] })
        // Windows at different heights
        .add(MACLibrary.get('window'), {}, { position: [0, 2, 1.05], scale: [0.7, 0.7, 0.7] })
        .add(MACLibrary.get('window'), {}, { position: [0, 4.5, 0.95], scale: [0.7, 0.7, 0.7] })
        .add(MACLibrary.get('window'), {}, { position: [0, 6.2, 0.75], scale: [0.6, 0.6, 0.6] })
);

/**
 * Wooden cart with wheels
 */
MACLibrary.register('cart',
    new MAC('group')
        // Cart body
        .add('box', {
            width: 1.5, height: 0.4, depth: 1,
            material: { color: 0x8b7355 }
        }, { position: [0, 0.5, 0] })
        // Side walls
        .add('box', {
            width: 1.5, height: 0.3, depth: 0.05,
            material: { color: 0x654321 }
        }, { position: [0, 0.8, 0.5] })
        .add('box', {
            width: 1.5, height: 0.3, depth: 0.05,
            material: { color: 0x654321 }
        }, { position: [0, 0.8, -0.5] })
        // Wheels - properly positioned
        .add(MACLibrary.get('wheel'), {}, { position: [-0.6, 0.15, 0.6] })
        .add(MACLibrary.get('wheel'), {}, { position: [0.6, 0.15, 0.6] })
        .add(MACLibrary.get('wheel'), {}, { position: [-0.6, 0.15, -0.6] })
        .add(MACLibrary.get('wheel'), {}, { position: [0.6, 0.15, -0.6] })
        // Handle
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.05, height: 1.5,
            material: { color: 0x4a2511 }
        }, { position: [0, 0.5, -0.8], rotation: [Math.PI / 6, 0, 0] })
);

/**
 * Market stall with goods
 */
MACLibrary.register('market_stall',
    new MAC('group')
        // Posts (4 corners)
        .add('box', {
            width: 0.1, height: 2.5, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [-1, 1.25, -1] })
        .add('box', {
            width: 0.1, height: 2.5, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [1, 1.25, -1] })
        .add('box', {
            width: 0.1, height: 2.5, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [-1, 1.25, 1] })
        .add('box', {
            width: 0.1, height: 2.5, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [1, 1.25, 1] })
        // Roof
        .add('box', {
            width: 2.4, height: 0.1, depth: 2.4,
            material: { color: 0xdc143c }
        }, { position: [0, 2.55, 0] })
        // Awning
        .add('box', {
            width: 2.4, height: 0.05, depth: 0.5,
            material: { color: 0xdc143c }
        }, { position: [0, 2.3, 1.25], rotation: [Math.PI / 8, 0, 0] })
        // Counter
        .add('box', {
            width: 2.2, height: 0.1, depth: 1,
            material: { color: 0x8b7355 }
        }, { position: [0, 1, 0] })
        // Goods - barrels
        .add(MACLibrary.get('barrel'), {}, { position: [-0.6, 1.1, 0], scale: [0.4, 0.4, 0.4] })
        .add(MACLibrary.get('barrel'), {}, { position: [0, 1.1, 0], scale: [0.4, 0.4, 0.4] })
        .add(MACLibrary.get('barrel'), {}, { position: [0.6, 1.1, 0], scale: [0.4, 0.4, 0.4] })
);

/**
 * Fence section using recursive components
 */
MACLibrary.register('fence_section',
    new MAC('group')
        // Posts
        .add(MACLibrary.get('fence_post'), {}, { position: [-1, 0.75, 0] })
        .add(MACLibrary.get('fence_post'), {}, { position: [1, 0.75, 0] })
        // Top rail
        .add('box', {
            width: 2.2, height: 0.1, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [0, 1.3, 0] })
        // Bottom rail
        .add('box', {
            width: 2.2, height: 0.1, depth: 0.1,
            material: { color: 0x8b7355 }
        }, { position: [0, 0.5, 0] })
);

/**
 * Wooden bridge section
 */
MACLibrary.register('bridge',
    new MAC('group')
        // Deck planks
        .add('box', {
            width: 3, height: 0.2, depth: 1.5,
            material: { color: 0x8b7355 }
        }, { position: [0, 0, 0] })
        // Support beams underneath
        .add('box', {
            width: 0.2, height: 0.3, depth: 1.5,
            material: { color: 0x654321 }
        }, { position: [-1.3, -0.25, 0] })
        .add('box', {
            width: 0.2, height: 0.3, depth: 1.5,
            material: { color: 0x654321 }
        }, { position: [1.3, -0.25, 0] })
        // Railings
        .add('box', {
            width: 3, height: 0.8, depth: 0.05,
            material: { color: 0x654321 }
        }, { position: [0, 0.6, 0.75] })
        .add('box', {
            width: 3, height: 0.8, depth: 0.05,
            material: { color: 0x654321 }
        }, { position: [0, 0.6, -0.75] })
        // Railing posts
        .add('box', {
            width: 0.1, height: 1, depth: 0.1,
            material: { color: 0x4a2511 }
        }, { position: [-1.4, 0.5, 0.75] })
        .add('box', {
            width: 0.1, height: 1, depth: 0.1,
            material: { color: 0x4a2511 }
        }, { position: [1.4, 0.5, 0.75] })
);

// ============================================================================
// CHARACTERS AND CREATURES
// ============================================================================

/**
 * Knight character with armor, shield, and sword
 */
MACLibrary.register('knight',
    new MAC('group')
        // Legs
        .add('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a, metalness: 0.6 }
        }, { position: [-0.15, 0.4, 0] })
        .add('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a, metalness: 0.6 }
        }, { position: [0.15, 0.4, 0] })
        // Body (plate armor)
        .add('capsule', {
            radius: 0.35, length: 0.8,
            material: { color: 0x708090, metalness: 0.9, roughness: 0.2 }
        }, { position: [0, 1.2, 0] })
        // Shoulders
        .add('sphere', {
            radius: 0.2,
            material: { color: 0x708090, metalness: 0.9 }
        }, { position: [-0.4, 1.5, 0] })
        .add('sphere', {
            radius: 0.2,
            material: { color: 0x708090, metalness: 0.9 }
        }, { position: [0.4, 1.5, 0] })
        // Arms
        .add('capsule', {
            radius: 0.12, length: 0.6,
            material: { color: 0x708090, metalness: 0.8 }
        }, { position: [-0.5, 1, 0], rotation: [0, 0, 0.3] })
        .add('capsule', {
            radius: 0.12, length: 0.6,
            material: { color: 0x708090, metalness: 0.8 }
        }, { position: [0.5, 1, 0], rotation: [0, 0, -0.3] })
        // Head (helmet)
        .add('sphere', {
            radius: 0.25,
            material: { color: 0x708090, metalness: 0.95, roughness: 0.1 }
        }, { position: [0, 1.8, 0] })
        // Visor
        .add('box', {
            width: 0.3, height: 0.08, depth: 0.05,
            material: { color: 0x2f2f2f }
        }, { position: [0, 1.75, 0.25] })
        // Plume
        .add('cone', {
            radius: 0.08, height: 0.4,
            material: { color: 0xff0000 }
        }, { position: [0, 2.2, 0] })
        // Shield (left arm)
        .add('cylinder', {
            radiusTop: 0.35, radiusBottom: 0.35, height: 0.08,
            material: { color: 0x4169e1, metalness: 0.8, emissive: 0x1e3a8a }
        }, { position: [-0.6, 1.2, 0], rotation: [0, 0, Math.PI / 2] })
        .add('sphere', {
            radius: 0.1,
            material: { color: 0xffd700, metalness: 0.95 }
        }, { position: [-0.6, 1.2, 0] })
        // Sword (right hand)
        .add('cylinder', {
            radiusTop: 0.04, radiusBottom: 0.04, height: 1.2,
            material: { color: 0xc0c0c0, metalness: 1, roughness: 0.1 }
        }, { position: [0.7, 1.2, 0], rotation: [0, 0, Math.PI / 3] })
        // Sword guard
        .add('box', {
            width: 0.3, height: 0.05, depth: 0.05,
            material: { color: 0xffd700, metalness: 0.9 }
        }, { position: [0.55, 0.8, 0] })
);

/**
 * Wizard character with staff and robe
 */
MACLibrary.register('wizard',
    new MAC('group')
        // Robe (lower)
        .add('cone', {
            radius: 0.5, height: 1.5,
            material: { color: 0x4b0082 }
        }, { position: [0, 0.75, 0] })
        // Robe (upper body)
        .add('capsule', {
            radius: 0.3, length: 0.8,
            material: { color: 0x4b0082 }
        }, { position: [0, 1.8, 0] })
        // Arms
        .add('capsule', {
            radius: 0.1, length: 0.7,
            material: { color: 0x4b0082 }
        }, { position: [-0.4, 1.6, 0], rotation: [0, 0, 0.5] })
        .add('capsule', {
            radius: 0.1, length: 0.7,
            material: { color: 0x4b0082 }
        }, { position: [0.4, 1.6, 0], rotation: [0, 0, -0.5] })
        // Head
        .add('sphere', {
            radius: 0.22,
            material: { color: 0xffe0bd }
        }, { position: [0, 2.4, 0] })
        // Wizard hat
        .add('cone', {
            radius: 0.35, height: 0.8,
            material: { color: 0x4b0082 }
        }, { position: [0, 2.9, 0] })
        .add('torus', {
            radius: 0.35, tube: 0.05,
            material: { color: 0x4b0082 }
        }, { position: [0, 2.5, 0], rotation: [Math.PI / 2, 0, 0] })
        // Beard
        .add('cone', {
            radius: 0.15, height: 0.4,
            material: { color: 0xf5f5f5 }
        }, { position: [0, 2.2, 0.15] })
        // Staff (magical)
        .add('cylinder', {
            radiusTop: 0.04, radiusBottom: 0.04, height: 2.5,
            material: { color: 0x8b4513 }
        }, { position: [-0.5, 1.5, 0] })
        // Crystal on staff
        .add('sphere', {
            radius: 0.15,
            material: { color: 0x00ffff, emissive: 0x00ffff, transparent: true, opacity: 0.8 }
        }, { position: [-0.5, 2.8, 0] })
        // Magic particles
        .add('sphere', {
            radius: 0.05,
            material: { color: 0xff00ff, emissive: 0xff00ff }
        }, { position: [-0.4, 2.9, 0.1] })
        .add('sphere', {
            radius: 0.05,
            material: { color: 0x00ffff, emissive: 0x00ffff }
        }, { position: [-0.6, 2.85, -0.1] })
);

/**
 * Dragon - ambitious creature composition
 */
MACLibrary.register('dragon',
    new MAC('group')
        // Body
        .add('capsule', {
            radius: 0.8, length: 2,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [0, 1.5, 0], rotation: [0, 0, Math.PI / 2] })
        // Neck
        .add('capsule', {
            radius: 0.4, length: 1.5,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [1.5, 1.8, 0], rotation: [0, 0, Math.PI / 4] })
        // Head
        .add('sphere', {
            radius: 0.5,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [2.5, 2.5, 0] })
        // Snout
        .add('cone', {
            radius: 0.3, height: 0.6,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [2.8, 2.5, 0], rotation: [0, 0, -Math.PI / 2] })
        // Horns
        .add('cone', {
            radius: 0.08, height: 0.4,
            material: { color: 0xffffff, metalness: 0.6 }
        }, { position: [2.4, 2.9, 0.15] })
        .add('cone', {
            radius: 0.08, height: 0.4,
            material: { color: 0xffffff, metalness: 0.6 }
        }, { position: [2.4, 2.9, -0.15] })
        // Eyes
        .add('sphere', {
            radius: 0.08,
            material: { color: 0xffff00, emissive: 0xffaa00 }
        }, { position: [2.6, 2.6, 0.3] })
        .add('sphere', {
            radius: 0.08,
            material: { color: 0xffff00, emissive: 0xffaa00 }
        }, { position: [2.6, 2.6, -0.3] })
        // Wings
        .add('cone', {
            radius: 1.2, height: 0.1,
            material: { color: 0x8b0000, transparent: true, opacity: 0.8 }
        }, { position: [0.5, 2, 1], rotation: [0, 0, Math.PI / 2] })
        .add('cone', {
            radius: 1.2, height: 0.1,
            material: { color: 0x8b0000, transparent: true, opacity: 0.8 }
        }, { position: [0.5, 2, -1], rotation: [0, 0, Math.PI / 2] })
        // Tail
        .add('capsule', {
            radius: 0.3, length: 2,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [-1.5, 1.2, 0], rotation: [0, 0, -Math.PI / 6] })
        // Tail spike
        .add('cone', {
            radius: 0.15, height: 0.5,
            material: { color: 0x696969 }
        }, { position: [-2.7, 0.8, 0], rotation: [0, 0, -Math.PI / 3] })
        // Legs
        .add('capsule', {
            radius: 0.25, length: 0.8,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [0.5, 0.6, 0.5], rotation: [0.3, 0, 0] })
        .add('capsule', {
            radius: 0.25, length: 0.8,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [0.5, 0.6, -0.5], rotation: [0.3, 0, 0] })
        .add('capsule', {
            radius: 0.25, length: 0.8,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [-0.5, 0.6, 0.5], rotation: [0.3, 0, 0] })
        .add('capsule', {
            radius: 0.25, length: 0.8,
            material: { color: 0x8b0000, metalness: 0.3 }
        }, { position: [-0.5, 0.6, -0.5], rotation: [0.3, 0, 0] })
);

// ============================================================================
// ENVIRONMENTAL PROPS
// ============================================================================

/**
 * Campfire with logs and flames
 */
MACLibrary.register('campfire',
    new MAC('group')
        // Stone circle
        .add('torus', {
            radius: 0.6, tube: 0.12,
            material: { color: 0x696969, roughness: 0.9 }
        }, { position: [0, 0.08, 0], rotation: [Math.PI / 2, 0, 0] })
        // Logs arranged in teepee style
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [0.2, 0.3, 0], rotation: [0, 0, Math.PI / 3] })
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [-0.2, 0.3, 0], rotation: [0, 0, -Math.PI / 3] })
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [0, 0.3, 0.2], rotation: [Math.PI / 3, 0, 0] })
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.08, height: 0.8,
            material: { color: 0x4a2511 }
        }, { position: [0, 0.3, -0.2], rotation: [-Math.PI / 3, 0, 0] })
        // Fire (multi-layered for depth)
        .add('cone', {
            radius: 0.25, height: 0.6,
            material: { 
                color: 0xff4500, 
                emissive: 0xff4500,
                transparent: true,
                opacity: 0.9
            }
        }, { position: [0, 0.5, 0] })
        .add('cone', {
            radius: 0.18, height: 0.8,
            material: { 
                color: 0xff6600, 
                emissive: 0xff6600,
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0, 0.5, 0] })
        .add('cone', {
            radius: 0.12, height: 0.5,
            material: { 
                color: 0xffaa00, 
                emissive: 0xffaa00,
                transparent: true,
                opacity: 0.5
            }
        }, { position: [0, 0.6, 0] })
        // Embers
        .add('sphere', {
            radius: 0.03,
            material: { color: 0xff4500, emissive: 0xff4500 }
        }, { position: [0.15, 0.9, 0.1] })
        .add('sphere', {
            radius: 0.03,
            material: { color: 0xff6600, emissive: 0xff6600 }
        }, { position: [-0.1, 0.95, -0.05] })
);

/**
 * Crystal formation with glow
 */
MACLibrary.register('crystal',
    new MAC('group')
        // Main crystal
        .add('cone', {
            radius: 0.25, height: 1.5,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00aaff,
                transparent: true,
                opacity: 0.8,
                metalness: 0.3
            }
        }, { position: [0, 0.75, 0] })
        // Side crystals
        .add('cone', {
            radius: 0.15, height: 0.8,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00aaff,
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0.3, 0.4, 0.2], rotation: [0, 0, -Math.PI / 6] })
        .add('cone', {
            radius: 0.12, height: 0.6,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00aaff,
                transparent: true,
                opacity: 0.7
            }
        }, { position: [-0.25, 0.3, -0.15], rotation: [0, 0, Math.PI / 8] })
        .add('cone', {
            radius: 0.1, height: 0.5,
            material: { 
                color: 0x00ffff, 
                emissive: 0x00aaff,
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0.15, 0.25, -0.3], rotation: [0, 0, -Math.PI / 10] })
        // Base
        .add('cylinder', {
            radiusTop: 0.4, radiusBottom: 0.4, height: 0.1,
            material: { color: 0x696969, roughness: 0.9 }
        }, { position: [0, 0.05, 0] })
);

/**
 * Fountain with water
 */
MACLibrary.register('fountain',
    new MAC('group')
        // Basin
        .add('cylinder', {
            radiusTop: 1.2, radiusBottom: 1, height: 0.5,
            material: { color: 0x808080, roughness: 0.8 }
        }, { position: [0, 0.25, 0] })
        // Water
        .add('cylinder', {
            radiusTop: 1.1, radiusBottom: 0.95, height: 0.4,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.6,
                roughness: 0.1
            }
        }, { position: [0, 0.45, 0] })
        // Central pedestal
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.4, height: 1.5,
            material: { color: 0x696969, roughness: 0.8 }
        }, { position: [0, 1.25, 0] })
        // Top bowl
        .add('sphere', {
            radius: 0.4,
            material: { color: 0x808080, roughness: 0.8 }
        }, { position: [0, 2.1, 0] })
        // Water jets (spheres simulating water droplets)
        .add('sphere', {
            radius: 0.08,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0, 2.5, 0] })
        .add('sphere', {
            radius: 0.06,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0.15, 2.3, 0] })
        .add('sphere', {
            radius: 0.06,
            material: { 
                color: 0x4169e1, 
                transparent: true,
                opacity: 0.7
            }
        }, { position: [-0.15, 2.3, 0] })
);

/**
 * Street lamp
 */
MACLibrary.register('street_lamp',
    new MAC('group')
        // Post
        .add('cylinder', {
            radiusTop: 0.08, radiusBottom: 0.1, height: 3,
            material: { color: 0x2f2f2f, metalness: 0.7 }
        }, { position: [0, 1.5, 0] })
        // Cross beam
        .add('cylinder', {
            radiusTop: 0.06, radiusBottom: 0.06, height: 0.8,
            material: { color: 0x2f2f2f, metalness: 0.7 }
        }, { position: [0.4, 2.9, 0], rotation: [0, 0, Math.PI / 2] })
        // Lamp housing
        .add('cylinder', {
            radiusTop: 0.2, radiusBottom: 0.25, height: 0.4,
            material: { color: 0x1a1a1a, metalness: 0.8 }
        }, { position: [0.8, 2.7, 0] })
        // Glass
        .add('cylinder', {
            radiusTop: 0.18, radiusBottom: 0.22, height: 0.35,
            material: { 
                color: 0xffff99, 
                emissive: 0xffff00,
                transparent: true,
                opacity: 0.6
            }
        }, { position: [0.8, 2.7, 0] })
        // Light glow
        .add('sphere', {
            radius: 0.15,
            material: { 
                color: 0xffff00, 
                emissive: 0xffff00,
                transparent: true,
                opacity: 0.7
            }
        }, { position: [0.8, 2.7, 0] })
        // Base
        .add('cylinder', {
            radiusTop: 0.15, radiusBottom: 0.2, height: 0.3,
            material: { color: 0x2f2f2f, metalness: 0.7 }
        }, { position: [0, 0.15, 0] })
);

/**
 * Anvil (blacksmith prop)
 */
MACLibrary.register('anvil',
    new MAC('group')
        // Base
        .add('box', {
            width: 0.8, height: 0.3, depth: 0.6,
            material: { color: 0x2f2f2f, metalness: 0.9, roughness: 0.3 }
        }, { position: [0, 0.15, 0] })
        // Body
        .add('box', {
            width: 0.6, height: 0.4, depth: 0.5,
            material: { color: 0x2f2f2f, metalness: 0.9, roughness: 0.3 }
        }, { position: [0, 0.5, 0] })
        // Top working surface
        .add('box', {
            width: 0.8, height: 0.15, depth: 0.4,
            material: { color: 0x3a3a3a, metalness: 0.95, roughness: 0.2 }
        }, { position: [0, 0.775, 0] })
        // Horn
        .add('cone', {
            radius: 0.15, height: 0.5,
            material: { color: 0x3a3a3a, metalness: 0.95, roughness: 0.2 }
        }, { position: [0.5, 0.85, 0], rotation: [0, 0, -Math.PI / 2] })
);

// ============================================================================
// COMPLETE SCENE COMPOSITION
// ============================================================================

/**
 * Medieval village square - ambitious scene composition
 */
MACLibrary.register('village_square',
    new MAC('group')
        // Central fountain
        .add(MACLibrary.get('fountain'), {}, { position: [0, 0, 0] })
        
        // Houses around the square
        .add(MACLibrary.get('house'), {}, { position: [-8, 0, -8], rotation: [0, Math.PI / 4, 0] })
        .add(MACLibrary.get('house'), {}, { position: [8, 0, -8], rotation: [0, -Math.PI / 4, 0] })
        .add(MACLibrary.get('house'), {}, { position: [-8, 0, 8], rotation: [0, 3 * Math.PI / 4, 0] })
        
        // Tower in the corner
        .add(MACLibrary.get('tower'), {}, { position: [10, 0, 10], rotation: [0, Math.PI, 0] })
        
        // Market stalls
        .add(MACLibrary.get('market_stall'), {}, { position: [-5, 0, 2] })
        .add(MACLibrary.get('market_stall'), {}, { position: [5, 0, 2] })
        
        // Street lamps
        .add(MACLibrary.get('street_lamp'), {}, { position: [-4, 0, -4] })
        .add(MACLibrary.get('street_lamp'), {}, { position: [4, 0, -4] })
        .add(MACLibrary.get('street_lamp'), {}, { position: [-4, 0, 4] })
        .add(MACLibrary.get('street_lamp'), {}, { position: [4, 0, 4] })
        
        // Trees for decoration
        .add(MACLibrary.get('tree'), {}, { position: [-6, 0, 6] })
        .add(MACLibrary.get('tree'), {}, { position: [6, 0, 6] })
        .add(MACLibrary.get('tree'), {}, { position: [-10, 0, 0] })
        
        // Props scattered around
        .add(MACLibrary.get('barrel'), {}, { position: [-3, 0, -2] })
        .add(MACLibrary.get('barrel'), {}, { position: [3, 0, -2] })
        .add(MACLibrary.get('cart'), {}, { position: [7, 0, -2], rotation: [0, Math.PI / 3, 0] })
        
        // Characters
        .add(MACLibrary.get('knight'), {}, { position: [2, 0, -4], rotation: [0, Math.PI / 6, 0] })
        .add(MACLibrary.get('wizard'), {}, { position: [-3, 0, 3], rotation: [0, -Math.PI / 4, 0] })
        
        // Fence sections
        .add(MACLibrary.get('fence_section'), {}, { position: [-12, 0, -5] })
        .add(MACLibrary.get('fence_section'), {}, { position: [-12, 0, 0] })
        .add(MACLibrary.get('fence_section'), {}, { position: [-12, 0, 5] })
);

/**
 * Dragon's lair - epic scene
 */
MACLibrary.register('dragons_lair',
    new MAC('group')
        // Dragon on a rock
        .add(MACLibrary.get('dragon'), {}, { position: [0, 1, 0], rotation: [0, Math.PI / 4, 0] })
        
        // Rock formation (using stacked cylinders)
        .add('cylinder', {
            radiusTop: 2, radiusBottom: 2.5, height: 1.5,
            material: { color: 0x696969, roughness: 0.95 }
        }, { position: [0, 0.75, 0] })
        
        // Treasure pile
        .add('cylinder', {
            radiusTop: 0.8, radiusBottom: 0.8, height: 0.4,
            material: { color: 0xffd700, metalness: 0.9 }
        }, { position: [-2, 0.2, -1] })
        .add('box', {
            width: 0.5, height: 0.3, depth: 0.4,
            material: { color: 0xffd700, metalness: 0.9 }
        }, { position: [-1.5, 0.35, -1.2] })
        
        // Magic crystals around the lair
        .add(MACLibrary.get('crystal'), {}, { position: [3, 0, 2] })
        .add(MACLibrary.get('crystal'), {}, { position: [-3, 0, 1.5], scale: [0.7, 0.7, 0.7] })
        .add(MACLibrary.get('crystal'), {}, { position: [2.5, 0, -2], scale: [0.5, 0.5, 0.5] })
        
        // Scattered bones
        .add('capsule', {
            radius: 0.1, length: 0.8,
            material: { color: 0xf5f5dc }
        }, { position: [1.5, 0.1, -1.5], rotation: [0, Math.PI / 3, 0.2] })
        .add('capsule', {
            radius: 0.1, length: 0.6,
            material: { color: 0xf5f5dc }
        }, { position: [1.8, 0.1, -1.2], rotation: [0, -Math.PI / 4, -0.3] })
);

console.log('MAC Examples loaded. Available templates:', MACLibrary.getAll().length);
