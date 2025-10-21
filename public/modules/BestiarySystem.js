/**
 * BestiarySystem - Track and display discovered monsters
 * Manages monster encyclopedia and discovery tracking
 */
export class BestiarySystem {
    constructor(addMessage) {
        this.addMessage = addMessage;
        this.discoveredMonsters = new Set();
        this.monsterEncounters = {}; // Track encounters per monster type
        this.monsterKills = {}; // Track kills per monster type
        
        // Monster database with stats, lore, and drops
        this.monsterDatabase = {
            'goblin': {
                name: 'Goblin',
                type: 'goblin',
                hp: 50,
                damage: 15,
                xp: 50,
                stance: 'Defensive',
                icon: '👹',
                lore: 'Small, green-skinned creatures that live in tribes. They are cunning and cowardly, preferring to attack in groups. Known for their crude weapons and basic armor.',
                habitat: 'Forests, caves, and ruins',
                weakness: 'Fire magic, bright light',
                drops: [
                    { item: 'Goblin Ear', chance: 30, icon: '🦷' },
                    { item: 'Crude Dagger', chance: 15, icon: '🗡️' },
                    { item: 'Small Coin Pouch', chance: 40, icon: '💰' }
                ],
                difficulty: 'Easy',
                difficultyColor: '#22c55e'
            },
            'skeleton': {
                name: 'Skeleton',
                type: 'skeleton',
                hp: 60,
                damage: 18,
                xp: 65,
                stance: 'Aggressive',
                icon: '💀',
                lore: 'Undead warriors animated by dark magic. Their bones are held together by necromantic energy, making them resistant to physical attacks. They never tire and feel no pain.',
                habitat: 'Graveyards, crypts, haunted ruins',
                weakness: 'Holy magic, blunt weapons',
                drops: [
                    { item: 'Bone Fragment', chance: 50, icon: '🦴' },
                    { item: 'Rusty Sword', chance: 20, icon: '⚔️' },
                    { item: 'Ancient Coin', chance: 25, icon: '🪙' }
                ],
                difficulty: 'Medium',
                difficultyColor: '#eab308'
            },
            'spider': {
                name: 'Giant Spider',
                type: 'spider',
                hp: 40,
                damage: 12,
                xp: 45,
                stance: 'Flee',
                icon: '🕷️',
                lore: 'Enormous arachnids that lurk in dark places. They spin webs to trap prey and inject venom with their fangs. Despite their size, they are surprisingly skittish.',
                habitat: 'Caves, abandoned buildings, dark forests',
                weakness: 'Fire, ice magic',
                drops: [
                    { item: 'Spider Silk', chance: 60, icon: '🕸️' },
                    { item: 'Venom Sac', chance: 30, icon: '🧪' },
                    { item: 'Spider Fang', chance: 20, icon: '🦷' }
                ],
                difficulty: 'Easy',
                difficultyColor: '#22c55e'
            },
            'wolf': {
                name: 'Wolf',
                type: 'wolf',
                hp: 70,
                damage: 20,
                xp: 75,
                stance: 'Aggressive',
                icon: '🐺',
                lore: 'Wild predators that hunt in packs. Wolves are cunning and persistent hunters with exceptional speed and powerful jaws. They are fiercely territorial.',
                habitat: 'Forests, mountains, tundra',
                weakness: 'Silver weapons, loud noises',
                drops: [
                    { item: 'Wolf Pelt', chance: 70, icon: '🦊' },
                    { item: 'Wolf Fang', chance: 35, icon: '🦷' },
                    { item: 'Raw Meat', chance: 50, icon: '🥩' }
                ],
                difficulty: 'Medium',
                difficultyColor: '#eab308'
            },
            'troll': {
                name: 'Troll',
                type: 'troll',
                hp: 100,
                damage: 28,
                xp: 95,
                stance: 'Defensive',
                icon: '👺',
                lore: 'Massive, brutish creatures with incredible strength and regenerative abilities. Trolls are not particularly intelligent but make up for it with raw power and durability.',
                habitat: 'Swamps, bridges, deep forests',
                weakness: 'Fire (prevents regeneration), acid',
                drops: [
                    { item: 'Troll Hide', chance: 45, icon: '🛡️' },
                    { item: 'Troll Blood', chance: 30, icon: '💉' },
                    { item: 'Large Club', chance: 25, icon: '🏏' }
                ],
                difficulty: 'Hard',
                difficultyColor: '#ef4444'
            },
            'bat': {
                name: 'Dire Bat',
                type: 'bat',
                hp: 30,
                damage: 10,
                xp: 35,
                stance: 'Aggressive',
                icon: '🦇',
                lore: 'Oversized bats with razor-sharp fangs. They fly in swarms and use echolocation to hunt. Their bite can transmit disease, making them dangerous despite their small size.',
                habitat: 'Caves, ruins, night skies',
                weakness: 'Bright light, lightning magic',
                drops: [
                    { item: 'Bat Wing', chance: 55, icon: '🪽' },
                    { item: 'Bat Fang', chance: 25, icon: '🦷' },
                    { item: 'Night Essence', chance: 15, icon: '✨' }
                ],
                difficulty: 'Easy',
                difficultyColor: '#22c55e'
            },
            'goblin chief': {
                name: 'Goblin Chief',
                type: 'goblin chief',
                hp: 150,
                damage: 25,
                xp: 200,
                stance: 'Aggressive',
                icon: '👑',
                isBoss: true,
                lore: 'The leader of a goblin tribe, distinguished by a crude crown and superior combat skills. Goblin chiefs are larger and more intelligent than their kin, commanding respect through brutality.',
                habitat: 'Goblin camps, fortified caves',
                weakness: 'Fire magic, isolation from tribe',
                drops: [
                    { item: 'Goblin Crown', chance: 100, icon: '👑' },
                    { item: 'Chief\'s Axe', chance: 80, icon: '🪓' },
                    { item: 'Gold Hoard', chance: 90, icon: '💰' }
                ],
                difficulty: 'Boss',
                difficultyColor: '#8b5cf6'
            },
            'skeleton lord': {
                name: 'Skeleton Lord',
                type: 'skeleton lord',
                hp: 180,
                damage: 30,
                xp: 250,
                stance: 'Aggressive',
                icon: '☠️',
                isBoss: true,
                lore: 'Ancient warriors cursed to serve beyond death. Skeleton Lords retain their combat prowess and wield enchanted weapons. They command lesser undead and are extremely dangerous.',
                habitat: 'Ancient tombs, dark citadels',
                weakness: 'Holy magic, complete dismemberment',
                drops: [
                    { item: 'Cursed Crown', chance: 100, icon: '👑' },
                    { item: 'Enchanted Blade', chance: 85, icon: '⚔️' },
                    { item: 'Soul Gem', chance: 60, icon: '💎' }
                ],
                difficulty: 'Boss',
                difficultyColor: '#8b5cf6'
            },
            'dire wolf': {
                name: 'Dire Wolf',
                type: 'dire wolf',
                hp: 200,
                damage: 35,
                xp: 300,
                stance: 'Aggressive',
                icon: '🐺',
                isBoss: true,
                lore: 'An alpha predator of legendary size and ferocity. Dire wolves are pack leaders with supernatural speed and strength. Their howl can freeze prey in terror.',
                habitat: 'Deep wilderness, cursed forests',
                weakness: 'Silver weapons, enchanted traps',
                drops: [
                    { item: 'Alpha Pelt', chance: 100, icon: '🦊' },
                    { item: 'Dire Fang', chance: 90, icon: '🦷' },
                    { item: 'Wolf Spirit Orb', chance: 50, icon: '🔮' }
                ],
                difficulty: 'Boss',
                difficultyColor: '#8b5cf6'
            }
        };
    }

    /**
     * Record a monster encounter (seeing or fighting a monster)
     */
    discoverMonster(monsterType) {
        const wasDiscovered = this.discoveredMonsters.has(monsterType);
        this.discoveredMonsters.add(monsterType);
        
        // Track encounters
        if (!this.monsterEncounters[monsterType]) {
            this.monsterEncounters[monsterType] = 0;
        }
        this.monsterEncounters[monsterType]++;
        
        if (!wasDiscovered) {
            const monsterData = this.monsterDatabase[monsterType];
            if (monsterData) {
                this.addMessage(`📖 New bestiary entry: ${monsterData.name}!`, 'success');
            }
        }
    }

    /**
     * Record a monster kill
     */
    recordKill(monsterType) {
        this.discoverMonster(monsterType);
        
        if (!this.monsterKills[monsterType]) {
            this.monsterKills[monsterType] = 0;
        }
        this.monsterKills[monsterType]++;
    }

    /**
     * Get monster data by type
     */
    getMonsterData(monsterType) {
        return this.monsterDatabase[monsterType] || null;
    }

    /**
     * Check if monster is discovered
     */
    isDiscovered(monsterType) {
        return this.discoveredMonsters.has(monsterType);
    }

    /**
     * Get all discovered monsters
     */
    getDiscoveredMonsters() {
        return Array.from(this.discoveredMonsters).map(type => ({
            ...this.monsterDatabase[type],
            encounters: this.monsterEncounters[type] || 0,
            kills: this.monsterKills[type] || 0
        }));
    }

    /**
     * Get all monsters (for bestiary UI)
     */
    getAllMonsters() {
        return Object.keys(this.monsterDatabase).map(type => ({
            ...this.monsterDatabase[type],
            discovered: this.isDiscovered(type),
            encounters: this.monsterEncounters[type] || 0,
            kills: this.monsterKills[type] || 0
        }));
    }

    /**
     * Get bestiary completion percentage
     */
    getCompletionPercentage() {
        const total = Object.keys(this.monsterDatabase).length;
        const discovered = this.discoveredMonsters.size;
        return Math.round((discovered / total) * 100);
    }

    /**
     * Get bestiary stats
     */
    getStats() {
        return {
            totalMonsters: Object.keys(this.monsterDatabase).length,
            discovered: this.discoveredMonsters.size,
            completion: this.getCompletionPercentage(),
            totalKills: Object.values(this.monsterKills).reduce((a, b) => a + b, 0),
            totalEncounters: Object.values(this.monsterEncounters).reduce((a, b) => a + b, 0)
        };
    }
}
