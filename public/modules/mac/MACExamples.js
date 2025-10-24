import { MAC, MACLibrary } from './MACCore.js';

/**
 * MACExamples - Demonstration of MAC composition and capabilities
 * 
 * These examples showcase:
 * - Recursive composition (MACs containing MACs)
 * - Complex abstractions built from simple primitives
 * - Different use cases (characters, buildings, props, nature)
 */

// ============================================================================
// BASIC EXAMPLES
// ============================================================================

/**
 * Simple torch - basic composition
 */
MACLibrary.register('torch',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.08, height: 1,
            material: { color: 0x4a2511 }
        })
        .position(0, 0.5, 0)
        .add('sphere', {
            radius: 0.15,
            material: { color: 0xff4500, emissive: 0xff4500 }
        })
        .position(0, 1.1, 0)
);

/**
 * Barrel - composed primitive example
 */
MACLibrary.register('barrel',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.4, radiusBottom: 0.4, height: 1,
            material: { color: 0x8b4513 }
        })
        .position(0, 0.5, 0)
        .add('torus', {
            radius: 0.42, tube: 0.05,
            material: { color: 0x2f1f1f }
        })
        .position(0, 0.3, 0)
        .rotation(Math.PI / 2, 0, 0)
        .add('torus', {
            radius: 0.42, tube: 0.05,
            material: { color: 0x2f1f1f }
        })
        .position(0, 0.7, 0)
        .rotation(Math.PI / 2, 0, 0)
);

// ============================================================================
// RECURSIVE COMPOSITION EXAMPLES
// ============================================================================

/**
 * Fence post - reusable component
 */
MACLibrary.register('fence_post',
    new MAC('group')
        .add('box', {
            width: 0.1, height: 1.5, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(0, 0.75, 0)
);

/**
 * Fence section - uses fence_post MAC recursively
 */
MACLibrary.register('fence_section',
    new MAC('group')
        // Posts
        .add(MACLibrary.get('fence_post'))
        .position(-0.5, 0, 0)
        .add(MACLibrary.get('fence_post'))
        .position(0.5, 0, 0)
        // Rails
        .add('box', {
            width: 1.2, height: 0.1, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(0, 1, 0)
        .add('box', {
            width: 1.2, height: 0.1, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(0, 0.5, 0)
);

/**
 * Wheel - reusable component
 */
MACLibrary.register('wheel',
    new MAC('group')
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.3, height: 0.1,
            material: { color: 0x4a2511 }
        })
        .rotation(0, 0, Math.PI / 2)
        .add('sphere', {
            radius: 0.1,
            material: { color: 0x2f1f1f }
        })
);

/**
 * Cart - uses wheel MAC recursively
 */
MACLibrary.register('cart',
    new MAC('group')
        // Body
        .add('box', {
            width: 1.5, height: 0.5, depth: 1,
            material: { color: 0x8b7355 }
        })
        .position(0, 0.5, 0)
        // Wheels
        .add(MACLibrary.get('wheel'))
        .position(-0.5, 0.15, -0.5)
        .add(MACLibrary.get('wheel'))
        .position(0.5, 0.15, -0.5)
        .add(MACLibrary.get('wheel'))
        .position(-0.5, 0.15, 0.5)
        .add(MACLibrary.get('wheel'))
        .position(0.5, 0.15, 0.5)
);

// ============================================================================
// COMPLEX COMPOSITION EXAMPLES
// ============================================================================

/**
 * Tower - multi-level structure
 */
MACLibrary.register('tower',
    new MAC('group')
        // Base
        .add('cylinder', {
            radiusTop: 1, radiusBottom: 1.2, height: 3,
            material: { color: 0x808080 }
        })
        .position(0, 1.5, 0)
        // Middle section
        .add('cylinder', {
            radiusTop: 0.9, radiusBottom: 1, height: 2,
            material: { color: 0x909090 }
        })
        .position(0, 4, 0)
        // Top section
        .add('cylinder', {
            radiusTop: 0.7, radiusBottom: 0.9, height: 1.5,
            material: { color: 0xa0a0a0 }
        })
        .position(0, 5.75, 0)
        // Roof
        .add('cone', {
            radius: 1.2, height: 1.5,
            material: { color: 0x654321 }
        })
        .position(0, 7.25, 0)
        // Windows
        .add('box', {
            width: 0.3, height: 0.4, depth: 0.05,
            material: { color: 0x4169e1, emissive: 0x1e3a8a }
        })
        .position(0, 5, 1)
);

/**
 * Detailed tree - complex natural object
 */
MACLibrary.register('detailed_tree',
    new MAC('group')
        // Trunk
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.4, height: 3,
            material: { color: 0x4a2511 }
        })
        .position(0, 1.5, 0)
        // Lower branches
        .add('cone', {
            radius: 1.2, height: 1.5,
            material: { color: 0x2d5016 }
        })
        .position(0, 3, 0)
        // Middle foliage
        .add('cone', {
            radius: 1, height: 1.3,
            material: { color: 0x3d6e49 }
        })
        .position(0, 4, 0)
        // Top foliage
        .add('cone', {
            radius: 0.8, height: 1.2,
            material: { color: 0x4a7c59 }
        })
        .position(0, 5, 0)
        // Small branches (spheres)
        .add('sphere', {
            radius: 0.4,
            material: { color: 0x2d5016 }
        })
        .position(0.6, 3.5, 0)
        .add('sphere', {
            radius: 0.3,
            material: { color: 0x3d6e49 }
        })
        .position(-0.5, 4, 0)
);

/**
 * Market stall - functional structure
 */
MACLibrary.register('market_stall',
    new MAC('group')
        // Posts
        .add('box', {
            width: 0.1, height: 2, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(-0.9, 1, -0.9)
        .add('box', {
            width: 0.1, height: 2, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(0.9, 1, -0.9)
        .add('box', {
            width: 0.1, height: 2, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(-0.9, 1, 0.9)
        .add('box', {
            width: 0.1, height: 2, depth: 0.1,
            material: { color: 0x8b7355 }
        })
        .position(0.9, 1, 0.9)
        // Roof
        .add('box', {
            width: 2.2, height: 0.05, depth: 2.2,
            material: { color: 0xdc143c }
        })
        .position(0, 2.1, 0)
        // Counter
        .add('box', {
            width: 2, height: 0.1, depth: 1,
            material: { color: 0x8b7355 }
        })
        .position(0, 1, 0)
        // Goods (barrels)
        .add(MACLibrary.get('barrel'))
        .position(-0.5, 1.1, 0)
        .scale(0.3, 0.3, 0.3)
        .add(MACLibrary.get('barrel'))
        .position(0.5, 1.1, 0)
        .scale(0.3, 0.3, 0.3)
);

/**
 * Character with weapon - animated entity
 */
MACLibrary.register('knight',
    new MAC('group')
        // Legs
        .add('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a }
        })
        .position(-0.15, 0.4, 0)
        .add('capsule', {
            radius: 0.15, length: 0.6,
            material: { color: 0x4a4a4a }
        })
        .position(0.15, 0.4, 0)
        // Body (armor)
        .add('capsule', {
            radius: 0.35, length: 0.8,
            material: { color: 0x708090, metalness: 0.8 }
        })
        .position(0, 1.2, 0)
        // Arms
        .add('capsule', {
            radius: 0.12, length: 0.6,
            material: { color: 0x708090, metalness: 0.8 }
        })
        .position(-0.45, 1.1, 0)
        .rotation(0, 0, 0.3)
        .add('capsule', {
            radius: 0.12, length: 0.6,
            material: { color: 0x708090, metalness: 0.8 }
        })
        .position(0.45, 1.1, 0)
        .rotation(0, 0, -0.3)
        // Head (helmet)
        .add('sphere', {
            radius: 0.25,
            material: { color: 0x708090, metalness: 0.9 }
        })
        .position(0, 1.8, 0)
        // Plume
        .add('cone', {
            radius: 0.1, height: 0.3,
            material: { color: 0xff0000 }
        })
        .position(0, 2.1, 0)
        // Shield
        .add('cylinder', {
            radiusTop: 0.3, radiusBottom: 0.3, height: 0.05,
            material: { color: 0x4169e1, metalness: 0.7 }
        })
        .position(-0.5, 1.2, 0)
        .rotation(0, 0, Math.PI / 2)
        // Sword
        .add('cylinder', {
            radiusTop: 0.03, radiusBottom: 0.03, height: 1,
            material: { color: 0xc0c0c0, metalness: 1 }
        })
        .position(0.6, 1.2, 0)
        .rotation(0, 0, Math.PI / 4)
);

/**
 * Campfire - environmental prop
 */
MACLibrary.register('campfire',
    new MAC('group')
        // Stone circle
        .add('torus', {
            radius: 0.5, tube: 0.1,
            material: { color: 0x696969 }
        })
        .rotation(Math.PI / 2, 0, 0)
        .position(0, 0.05, 0)
        // Logs (arranged in circle)
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.05, height: 0.6,
            material: { color: 0x4a2511 }
        })
        .position(0.3, 0.1, 0)
        .rotation(0, 0, Math.PI / 3)
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.05, height: 0.6,
            material: { color: 0x4a2511 }
        })
        .position(-0.3, 0.1, 0)
        .rotation(0, 0, -Math.PI / 3)
        .add('cylinder', {
            radiusTop: 0.05, radiusBottom: 0.05, height: 0.6,
            material: { color: 0x4a2511 }
        })
        .position(0, 0.1, 0.3)
        .rotation(Math.PI / 3, 0, 0)
        // Fire (glowing cone)
        .add('cone', {
            radius: 0.2, height: 0.5,
            material: { 
                color: 0xff4500, 
                emissive: 0xff4500,
                transparent: true,
                opacity: 0.8
            }
        })
        .position(0, 0.3, 0)
);

/**
 * Bridge section - infrastructure
 */
MACLibrary.register('bridge',
    new MAC('group')
        // Deck
        .add('box', {
            width: 3, height: 0.2, depth: 1.5,
            material: { color: 0x8b7355 }
        })
        .position(0, 0, 0)
        // Railings
        .add('box', {
            width: 3, height: 0.8, depth: 0.05,
            material: { color: 0x654321 }
        })
        .position(0, 0.5, 0.75)
        .add('box', {
            width: 3, height: 0.8, depth: 0.05,
            material: { color: 0x654321 }
        })
        .position(0, 0.5, -0.75)
        // Support beams
        .add('box', {
            width: 0.2, height: 0.2, depth: 1.5,
            material: { color: 0x4a2511 }
        })
        .position(-1.4, -0.1, 0)
        .add('box', {
            width: 0.2, height: 0.2, depth: 1.5,
            material: { color: 0x4a2511 }
        })
        .position(1.4, -0.1, 0)
);

console.log('MAC Examples loaded. Available templates:', MACLibrary.getAll().length);
