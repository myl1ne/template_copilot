/**
 * Base Life class - Foundation for all living things in the vivarium
 */
export class Life {
    constructor(x, y, z, type = 'unknown') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.age = 0;
        this.energy = 100;
        this.generation = 1;
    }

    update(deltaTime, vivarium) {
        this.age += deltaTime;
    }

    isDead() {
        return this.energy <= 0;
    }

    getPosition() {
        return { x: this.x, y: this.y, z: this.z };
    }
}
