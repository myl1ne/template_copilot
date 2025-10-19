/**
 * Pre-defined environment objects (trees, rocks, buildings, chests, etc.)
 */
const GameObject = require('./GameObject');

class Tree extends GameObject {
    constructor(position) {
        super('Tree', {
            type: 'tree',
            position,
            interactable: false,
            description: 'A tall tree'
        });
    }
}

class Rock extends GameObject {
    constructor(position) {
        super('Rock', {
            type: 'rock',
            position,
            interactable: false,
            description: 'A large rock'
        });
    }
}

class Chest extends GameObject {
    constructor(position, contents = []) {
        super('Chest', {
            type: 'chest',
            position,
            interactable: true,
            interactionDistance: 2,
            description: 'A mysterious chest'
        });
        this.contents = contents;
        this.opened = false;
        
        this.onInteract = (player) => {
            if (!this.opened) {
                this.opened = true;
                return {
                    message: `You opened the chest and found: ${this.contents.join(', ')}`,
                    items: this.contents
                };
            } else {
                return {
                    message: 'The chest is empty',
                    items: []
                };
            }
        };
    }
}

class House extends GameObject {
    constructor(position, name = 'House') {
        super(name, {
            type: 'building',
            position,
            interactable: true,
            interactionDistance: 3,
            description: `A ${name.toLowerCase()}`
        });
        
        this.onInteract = () => {
            return {
                message: `You enter the ${this.name}`,
                action: 'enter_building'
            };
        };
    }
}

class Campfire extends GameObject {
    constructor(position) {
        super('Campfire', {
            type: 'campfire',
            position,
            interactable: true,
            interactionDistance: 2,
            description: 'A warm campfire'
        });
        
        this.onInteract = (player) => {
            return {
                message: 'You rest by the campfire and restore 50 HP',
                healing: 50
            };
        };
    }
}

class Sign extends GameObject {
    constructor(position, text) {
        super('Sign', {
            type: 'sign',
            position,
            interactable: true,
            interactionDistance: 2,
            description: 'A wooden sign'
        });
        this.text = text;
        
        this.onInteract = () => {
            return {
                message: `Sign reads: "${this.text}"`,
                action: 'read'
            };
        };
    }
}

class Portal extends GameObject {
    constructor(position, destination) {
        super('Portal', {
            type: 'portal',
            position,
            interactable: true,
            interactionDistance: 2,
            description: 'A magical portal'
        });
        this.destination = destination;
        
        this.onInteract = () => {
            return {
                message: `Portal leads to: ${this.destination}`,
                action: 'teleport',
                destination: this.destination
            };
        };
    }
}

module.exports = {
    GameObject,
    Tree,
    Rock,
    Chest,
    House,
    Campfire,
    Sign,
    Portal
};
