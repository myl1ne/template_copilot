/**
 * MAC Framework Test
 * Tests the core functionality of the MAC system
 */

import { MAC, MACLibrary, MACBuilder } from '../public/modules/mac/MACCore.js';
import { MACPersistence } from '../public/modules/mac/MACPersistence.js';

console.log('🧪 Starting MAC Framework Tests...\n');

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ ${name}`);
        testsPassed++;
    } catch (error) {
        console.error(`❌ ${name}`);
        console.error(`   Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Create basic MAC
test('Create basic MAC', () => {
    const mac = new MAC('box', { width: 1, height: 1, depth: 1 });
    if (!mac) throw new Error('Failed to create MAC');
    if (mac.type !== 'box') throw new Error('Wrong type');
});

// Test 2: Add children
test('Add children to MAC', () => {
    const parent = new MAC('group');
    parent.add('box', { width: 1, height: 1, depth: 1 });
    parent.add('sphere', { radius: 0.5 });
    if (parent.children.length !== 2) throw new Error('Children not added');
});

// Test 3: Transform operations
test('Apply transforms', () => {
    const mac = new MAC('box')
        .position(1, 2, 3)
        .rotation(0, Math.PI, 0)
        .scale(2, 2, 2);
    if (mac.transforms.length !== 3) throw new Error('Transforms not stored');
});

// Test 4: JSON serialization
test('Serialize to JSON', () => {
    const mac = new MAC('box', { width: 1 })
        .position(1, 0, 0);
    const json = mac.toJSON();
    if (!json.type) throw new Error('Missing type in JSON');
    if (!json.params) throw new Error('Missing params in JSON');
    if (!json.transforms) throw new Error('Missing transforms in JSON');
});

// Test 5: JSON deserialization
test('Deserialize from JSON', () => {
    const original = new MAC('sphere', { radius: 1 })
        .position(2, 3, 4);
    const json = original.toJSON();
    const restored = MAC.fromJSON(json);
    if (restored.type !== 'sphere') throw new Error('Type not restored');
    if (restored.transforms.length !== 1) throw new Error('Transforms not restored');
});

// Test 6: Code generation
test('Generate code string', () => {
    const mac = new MAC('box', { width: 1, height: 1, depth: 1 });
    const code = mac.toCode();
    if (!code.includes('new MAC')) throw new Error('Invalid code format');
    if (!code.includes('box')) throw new Error('Type missing in code');
});

// Test 7: Clone MAC
test('Clone MAC', () => {
    const original = new MAC('cylinder', { height: 2 })
        .position(1, 1, 1);
    const clone = original.clone();
    if (clone === original) throw new Error('Clone is same instance');
    if (clone.type !== original.type) throw new Error('Type not cloned');
    if (clone.transforms.length !== original.transforms.length) {
        throw new Error('Transforms not cloned');
    }
});

// Test 8: MACLibrary register and get
test('MACLibrary register/get', () => {
    const mac = new MAC('box');
    MACLibrary.register('test_box', mac);
    const retrieved = MACLibrary.get('test_box');
    if (!retrieved) throw new Error('Failed to retrieve from library');
    if (retrieved === mac) throw new Error('Should return clone, not original');
});

// Test 9: Recursive composition
test('Recursive composition', () => {
    const child = new MAC('sphere', { radius: 0.5 });
    const parent = new MAC('group').add(child);
    const grandparent = new MAC('group').add(parent);
    if (grandparent.children.length !== 1) throw new Error('Parent not added');
    if (grandparent.children[0].children.length !== 1) {
        throw new Error('Child not in parent');
    }
});

// Test 10: MACPersistence JSON round-trip
test('Persistence JSON round-trip', () => {
    const original = new MAC('cone', { radius: 1, height: 2 })
        .position(5, 5, 5);
    const json = MACPersistence.toJSON(original);
    const restored = MACPersistence.fromJSON(json);
    if (!restored) throw new Error('Failed to restore from JSON');
    if (restored.type !== 'cone') throw new Error('Type not preserved');
});

// Test 11: Template library
test('Load pre-built templates', () => {
    const templates = MACLibrary.getAll();
    if (templates.length === 0) throw new Error('No templates loaded');
    
    const tree = MACLibrary.get('simple_tree');
    if (!tree) throw new Error('Simple tree template not found');
});

// Test 12: Primitive builders
test('Build primitives', () => {
    const primitives = ['box', 'sphere', 'cylinder', 'cone', 'capsule', 'torus', 'plane', 'ring'];
    for (const type of primitives) {
        const mac = new MAC(type);
        // We can't actually build without Three.js in Node, but we can check the structure
        if (!MACBuilder.builders[type]) {
            throw new Error(`No builder for ${type}`);
        }
    }
});

// Test 13: Complex composition
test('Complex nested composition', () => {
    const wheel = new MAC('cylinder', { 
        radiusTop: 0.3, radiusBottom: 0.3, height: 0.1 
    });
    MACLibrary.register('wheel', wheel);
    
    const cart = new MAC('group')
        .add('box', { width: 1.5, height: 0.5, depth: 1 })
        .add(MACLibrary.get('wheel')).position(-0.5, 0, -0.5)
        .add(MACLibrary.get('wheel')).position(0.5, 0, -0.5)
        .add(MACLibrary.get('wheel')).position(-0.5, 0, 0.5)
        .add(MACLibrary.get('wheel')).position(0.5, 0, 0.5);
    
    if (cart.children.length !== 5) throw new Error('Expected 5 children (1 box + 4 wheels)');
});

// Test 14: Material parameters
test('Material parameters', () => {
    const mac = new MAC('sphere', {
        radius: 1,
        material: {
            color: 0xff0000,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0x330000
        }
    });
    
    if (!mac.params.material) throw new Error('Material not stored');
    if (mac.params.material.color !== 0xff0000) throw new Error('Color not stored');
});

// Test 15: Empty group
test('Create empty group', () => {
    const group = new MAC('group');
    if (group.type !== 'group') throw new Error('Wrong type');
    if (group.children.length !== 0) throw new Error('Group should start empty');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log('='.repeat(50));

if (testsFailed > 0) {
    process.exit(1);
} else {
    console.log('\n✨ All tests passed!');
    process.exit(0);
}
