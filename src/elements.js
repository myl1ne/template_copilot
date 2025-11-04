// Element types and their properties
export const ElementType = {
    AIR: 0,
    WATER: 1,
    SOIL: 2,
    GRANITE: 3,
    SAND: 4,
    LAVA: 5
};

export const ElementState = {
    GAS: 0,
    LIQUID: 1,
    SOLID: 2
};

// Element properties define behavior
export const ElementProperties = {
    [ElementType.AIR]: {
        name: 'Air',
        color: 0x87ceeb,
        density: 0.001,
        state: ElementState.GAS,
        flowRate: 0,
        meltingPoint: -273,
        boilingPoint: -273,
        erosionResistance: 0,
        transparent: true
    },
    [ElementType.WATER]: {
        name: 'Water',
        color: 0x1e90ff,
        density: 1.0,
        state: ElementState.LIQUID,
        flowRate: 0.8,
        meltingPoint: 0,
        boilingPoint: 100,
        erosionPower: 0.001,
        erosionResistance: 0,
        transparent: false
    },
    [ElementType.SOIL]: {
        name: 'Soil',
        color: 0x8b4513,
        density: 1.5,
        state: ElementState.SOLID,
        flowRate: 0,
        meltingPoint: 1200,
        boilingPoint: 2500,
        erosionResistance: 0.3,
        transparent: false
    },
    [ElementType.GRANITE]: {
        name: 'Granite',
        color: 0x696969,
        density: 2.7,
        state: ElementState.SOLID,
        flowRate: 0,
        meltingPoint: 1260,
        boilingPoint: 2800,
        erosionResistance: 0.95,
        erodesToType: ElementType.SAND,
        transparent: false
    },
    [ElementType.SAND]: {
        name: 'Sand',
        color: 0xf4a460,
        density: 1.6,
        state: ElementState.SOLID,
        flowRate: 0.3, // Sand can flow slowly like a powder
        meltingPoint: 1700,
        boilingPoint: 2230,
        erosionResistance: 0.1,
        transparent: false
    },
    [ElementType.LAVA]: {
        name: 'Lava',
        color: 0xff4500,
        density: 2.5,
        state: ElementState.LIQUID,
        flowRate: 0.2,
        meltingPoint: 700,
        boilingPoint: 2800,
        temperature: 1200,
        coolingRate: 0.1,
        coolsToType: ElementType.GRANITE,
        erosionResistance: 0,
        transparent: false
    }
};

// Get the state of an element based on temperature
export function getElementState(elementType, temperature) {
    const props = ElementProperties[elementType];
    
    if (temperature < props.meltingPoint) {
        return ElementState.SOLID;
    } else if (temperature < props.boilingPoint) {
        return ElementState.LIQUID;
    } else {
        return ElementState.GAS;
    }
}

// Check if an element can flow
export function canFlow(elementType) {
    const props = ElementProperties[elementType];
    return props.flowRate > 0;
}

// Get element color (could be temperature-dependent for lava)
export function getElementColor(elementType, temperature = 20) {
    const props = ElementProperties[elementType];
    
    // Lava gets brighter at higher temperatures
    if (elementType === ElementType.LAVA) {
        const intensity = Math.min(1.5, temperature / 1000);
        const r = Math.min(255, Math.floor(255 * intensity));
        const g = Math.min(100, Math.floor(69 * intensity));
        return (r << 16) | (g << 8) | 0;
    }
    
    return props.color;
}
