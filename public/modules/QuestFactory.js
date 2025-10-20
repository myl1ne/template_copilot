/**
 * QuestFactory - Creates quests with consistent patterns
 * Provides factorized quest creation for easier content expansion
 */
export class QuestFactory {
    /**
     * Create a generic quest with customizable objectives
     * @param {string} id - Quest identifier
     * @param {string} name - Quest name
     * @param {string} description - Quest description
     * @param {array} objectives - Quest objectives
     * @param {object} rewards - Quest rewards (xp, gold)
     * @param {object} options - Additional options
     * @returns {object} Quest object
     */
    createQuest(id, name, description, objectives, rewards, options = {}) {
        return {
            id,
            name,
            description,
            objectives: objectives.map(obj => ({
                id: obj.id,
                description: obj.description,
                current: 0,
                target: obj.target,
                completed: false
            })),
            rewards,
            active: options.active || false,
            completed: false,
            available: options.available !== undefined ? options.available : true,
            questGiver: options.questGiver || null,
            nextQuest: options.nextQuest || null
        };
    }

    /**
     * Create a kill quest
     * @param {string} id - Quest identifier
     * @param {object} config - Quest configuration
     * @returns {object} Quest object
     */
    createKillQuest(id, config) {
        const {
            name,
            description,
            monsters, // array of { type, count }
            bossType = null,
            returnTo = null,
            rewards,
            options = {}
        } = config;

        const objectives = [];

        // Add monster kill objectives
        monsters.forEach(monster => {
            objectives.push({
                id: `kill_${monster.type}`,
                description: `Defeat ${monster.count} ${monster.type}${monster.count > 1 ? 's' : ''}`,
                target: monster.count
            });
        });

        // Add boss objective if provided
        if (bossType) {
            objectives.push({
                id: 'kill_boss',
                description: `Defeat the ${bossType}`,
                target: 1
            });
        }

        // Add return objective if provided
        if (returnTo) {
            objectives.push({
                id: `return_to_${returnTo.toLowerCase().replace(/\s+/g, '_')}`,
                description: `Return to ${returnTo}`,
                target: 1
            });
        }

        return this.createQuest(id, name, description, objectives, rewards, options);
    }

    /**
     * Create a delivery quest
     * @param {string} id - Quest identifier
     * @param {object} config - Quest configuration
     * @returns {object} Quest object
     */
    createDeliveryQuest(id, config) {
        const {
            name,
            description,
            pickupFrom,
            deliverTo,
            item,
            rewards,
            options = {}
        } = config;

        const objectives = [
            {
                id: 'get_item',
                description: `Receive ${item} from ${pickupFrom}`,
                target: 1
            },
            {
                id: 'find_recipient',
                description: `Find ${deliverTo}`,
                target: 1
            },
            {
                id: 'deliver_item',
                description: `Deliver ${item} to ${deliverTo}`,
                target: 1
            }
        ];

        return this.createQuest(id, name, description, objectives, rewards, options);
    }

    /**
     * Create a collection quest
     * @param {string} id - Quest identifier
     * @param {object} config - Quest configuration
     * @returns {object} Quest object
     */
    createCollectionQuest(id, config) {
        const {
            name,
            description,
            items, // array of { name, count }
            returnTo = null,
            rewards,
            options = {}
        } = config;

        const objectives = [];

        // Add collection objectives
        items.forEach(item => {
            objectives.push({
                id: `collect_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
                description: `Collect ${item.count} ${item.name}${item.count > 1 ? 's' : ''}`,
                target: item.count
            });
        });

        // Add return objective if provided
        if (returnTo) {
            objectives.push({
                id: `return_to_${returnTo.toLowerCase().replace(/\s+/g, '_')}`,
                description: `Return to ${returnTo}`,
                target: 1
            });
        }

        return this.createQuest(id, name, description, objectives, rewards, options);
    }

    /**
     * Create an exploration quest
     * @param {string} id - Quest identifier
     * @param {object} config - Quest configuration
     * @returns {object} Quest object
     */
    createExplorationQuest(id, config) {
        const {
            name,
            description,
            locations, // array of location names
            returnTo = null,
            rewards,
            options = {}
        } = config;

        const objectives = [];

        // Add location objectives
        locations.forEach(location => {
            objectives.push({
                id: `discover_${location.toLowerCase().replace(/\s+/g, '_')}`,
                description: `Discover ${location}`,
                target: 1
            });
        });

        // Add return objective if provided
        if (returnTo) {
            objectives.push({
                id: `return_to_${returnTo.toLowerCase().replace(/\s+/g, '_')}`,
                description: `Return to ${returnTo}`,
                target: 1
            });
        }

        return this.createQuest(id, name, description, objectives, rewards, options);
    }

    /**
     * Create standard quests for the game
     * @returns {object} Object containing all quests keyed by ID
     */
    createStandardQuests() {
        const quests = {};

        // Village Rescue Quest (starter quest)
        quests['village_rescue'] = this.createKillQuest('village_rescue', {
            name: 'The Village Rescue',
            description: 'A goblin camp has been raiding the village. Defeat their leader and return peace to the land.',
            monsters: [
                { type: 'goblin', count: 3 }
            ],
            bossType: 'Goblin Chief',
            returnTo: 'Village Elder',
            rewards: { xp: 500, gold: 100 },
            options: { active: false, questGiver: 'Village Elder' }
        });

        // Merchant Delivery Quest
        quests['merchant_delivery'] = this.createDeliveryQuest('merchant_delivery', {
            name: "The Merchant's Request",
            description: 'The Traveling Merchant needs someone to deliver a special package to a hermit living deep in the forest.',
            pickupFrom: 'Traveling Merchant',
            deliverTo: 'Forest Hermit',
            item: 'a special package',
            rewards: { xp: 300, gold: 150 },
            options: { active: false, available: false, questGiver: 'Traveling Merchant' }
        });

        // Skeleton Threat Quest
        quests['skeleton_threat'] = this.createKillQuest('skeleton_threat', {
            name: 'The Undead Menace',
            description: 'Ancient skeletons have been spotted near the old graveyard. The village needs protection from these undead warriors.',
            monsters: [
                { type: 'skeleton', count: 4 }
            ],
            bossType: 'Skeleton Lord',
            returnTo: 'Village Elder',
            rewards: { xp: 800, gold: 200 },
            options: { active: false, available: false, questGiver: 'Village Elder' }
        });

        // Spider Infestation Quest
        quests['spider_cave'] = this.createKillQuest('spider_cave', {
            name: 'Spider Infestation',
            description: 'A cave to the east has become infested with giant spiders. Clear them out to make the area safe for travelers.',
            monsters: [
                { type: 'spider', count: 5 }
            ],
            returnTo: 'Town Guard',
            rewards: { xp: 600, gold: 150 },
            options: { active: false, available: false, questGiver: 'Town Guard' }
        });

        // Wolf Pack Quest
        quests['wolf_pack'] = this.createKillQuest('wolf_pack', {
            name: 'The Wolf Pack',
            description: 'A pack of dire wolves has been attacking merchants on the road. Hunt down their alpha to restore safety.',
            monsters: [
                { type: 'wolf', count: 3 }
            ],
            bossType: 'Dire Wolf',
            returnTo: 'Traveling Merchant',
            rewards: { xp: 1000, gold: 250 },
            options: { active: false, available: false, questGiver: 'Traveling Merchant' }
        });

        // Herb Collection Quest
        quests['herb_collection'] = this.createCollectionQuest('herb_collection', {
            name: 'Herbal Remedies',
            description: 'The Forest Hermit needs rare herbs for his potions. Collect them from the forest.',
            items: [
                { name: 'Moonpetal', count: 3 },
                { name: 'Shadow Root', count: 2 }
            ],
            returnTo: 'Forest Hermit',
            rewards: { xp: 400, gold: 120 },
            options: { active: false, available: false, questGiver: 'Forest Hermit' }
        });

        // Bandit Camp Quest
        quests['bandit_camp'] = this.createKillQuest('bandit_camp', {
            name: 'Bandits on the Road',
            description: 'A group of bandits has set up camp along the main trade route. Clear them out to restore safe passage.',
            monsters: [
                { type: 'bandit', count: 6 }
            ],
            bossType: 'Bandit Leader',
            returnTo: 'Town Guard',
            rewards: { xp: 700, gold: 180 },
            options: { active: false, available: false, questGiver: 'Town Guard' }
        });

        // Lost Item Quest
        quests['lost_ring'] = this.createDeliveryQuest('lost_ring', {
            name: 'The Lost Ring',
            description: 'A villager has lost their precious family ring. Search the forest and return it.',
            pickupFrom: 'Forest Area',
            deliverTo: 'Worried Villager',
            item: 'a golden ring',
            rewards: { xp: 250, gold: 100 },
            options: { active: false, available: false, questGiver: 'Village Elder' }
        });

        // Exploration Quest
        quests['ancient_ruins'] = this.createExplorationQuest('ancient_ruins', {
            name: 'Discover the Ancient Ruins',
            description: 'Legends speak of ancient ruins hidden deep in the wilderness. Find them and report back.',
            locations: ['Northern Ruins', 'Eastern Temple', 'Western Shrine'],
            returnTo: 'Forest Hermit',
            rewards: { xp: 900, gold: 250 },
            options: { active: false, available: false, questGiver: 'Forest Hermit' }
        });

        // Slime Collection Quest
        quests['slime_parts'] = this.createCollectionQuest('slime_parts', {
            name: 'Alchemical Ingredients',
            description: 'The Traveling Merchant needs slime essences for his potions. Defeat slimes and collect their cores.',
            items: [
                { name: 'Slime Core', count: 5 }
            ],
            returnTo: 'Traveling Merchant',
            rewards: { xp: 350, gold: 140 },
            options: { active: false, available: false, questGiver: 'Traveling Merchant' }
        });

        return quests;
    }
}
