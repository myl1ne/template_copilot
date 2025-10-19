// Quest Demo Logic
let currentStep = 0;
let isAutoPlaying = false;
let character = null;
let quest = null;

// Character class (simplified for demo)
class Character {
    constructor(name, stats) {
        this.name = name;
        this.stats = stats;
        this.attributes = {
            str: 18,
            dex: 12,
            con: 16
        };
    }
    
    takeDamage(amount) {
        const actualDamage = Math.max(0, amount - this.stats.armor);
        this.stats.hp = Math.max(0, this.stats.hp - actualDamage);
        updateUI();
        return actualDamage;
    }
    
    heal(amount) {
        this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
        updateUI();
    }
    
    regenerate() {
        this.heal(this.stats.hpRegen);
        updateUI();
    }
}

// Initialize character
character = new Character('Thorin the Brave', {
    hp: 150,
    maxHp: 150,
    mana: 50,
    maxMana: 50,
    armor: 10,
    hpRegen: 2
});

// Quest data
const questData = {
    title: 'The Village Rescue',
    description: 'A goblin camp has been raiding the village. Defeat their leader and return peace to the land.',
    objectives: [
        { id: 'travel', text: 'Travel to the goblin camp', icon: '🎯' },
        { id: 'warriors', text: 'Defeat 3 goblin warriors', icon: '⚔️' },
        { id: 'chief', text: 'Defeat the goblin chief', icon: '👹' },
        { id: 'return', text: 'Return to the village', icon: '🏠' }
    ],
    steps: [
        {
            title: 'Quest Accepted',
            action: () => {
                addLog('quest', 'Quest accepted: The Village Rescue');
                addLog('quest', 'The Village Elder needs your help to stop the goblin raids.');
                updateQuestStep('Step 1: Quest Accepted');
            }
        },
        {
            title: 'Travel to Goblin Camp',
            action: () => {
                addLog('quest', 'Traveling to the goblin camp...');
                setTimeout(() => {
                    addLog('success', 'Arrived at the goblin camp!');
                    completeObjective(0);
                    updateQuestStep('Step 2: At the Goblin Camp');
                }, 1000);
            }
        },
        {
            title: 'Fight Goblin Warrior #1',
            action: () => {
                addLog('combat', 'A goblin warrior attacks! (HP: 30)');
                setTimeout(() => {
                    character.takeDamage(15);
                    addLog('combat', `Goblin hits you for 15 damage! (After armor: ${15 - character.stats.armor})`);
                }, 500);
                setTimeout(() => {
                    addLog('combat', 'You strike back with your sword!');
                    addLog('success', 'Goblin warrior #1 defeated! (+100 XP)');
                }, 1500);
            }
        },
        {
            title: 'Fight Goblin Warrior #2',
            action: () => {
                addLog('combat', 'Another goblin warrior appears! (HP: 30)');
                setTimeout(() => {
                    character.takeDamage(20);
                    addLog('combat', `Goblin hits you for 20 damage! (After armor: ${20 - character.stats.armor})`);
                }, 500);
                setTimeout(() => {
                    addLog('combat', 'You use Power Strike! Critical hit!');
                    addLog('success', 'Goblin warrior #2 defeated! (+100 XP)');
                }, 1500);
            }
        },
        {
            title: 'Fight Goblin Warrior #3',
            action: () => {
                addLog('combat', 'The last goblin warrior charges! (HP: 30)');
                setTimeout(() => {
                    character.takeDamage(18);
                    addLog('combat', `Goblin hits you for 18 damage! (After armor: ${18 - character.stats.armor})`);
                }, 500);
                setTimeout(() => {
                    addLog('combat', 'You dodge the next attack!');
                    addLog('combat', 'Counter-attack! Heavy blow!');
                    addLog('success', 'Goblin warrior #3 defeated! (+100 XP)');
                    completeObjective(1);
                    updateQuestStep('Step 3: Warriors Defeated');
                }, 1500);
            }
        },
        {
            title: 'Heal and Prepare',
            action: () => {
                addLog('quest', 'Taking a moment to rest and heal...');
                setTimeout(() => {
                    character.heal(40);
                    addLog('success', 'HP restored by 40 points!');
                    addLog('quest', 'Ready to face the goblin chief!');
                }, 1000);
            }
        },
        {
            title: 'Boss Fight: Goblin Chief',
            action: () => {
                addLog('combat', '👹 THE GOBLIN CHIEF APPEARS! (HP: 100)');
                addLog('combat', 'Boss Battle: Goblin Chief, Scourge of the Valley');
                setTimeout(() => {
                    character.takeDamage(30);
                    addLog('combat', `Chief swings his axe! 30 damage! (After armor: ${30 - character.stats.armor})`);
                }, 800);
                setTimeout(() => {
                    addLog('combat', 'You parry the next attack!');
                    addLog('combat', 'Using Power Strike! 50 damage to chief!');
                }, 2000);
                setTimeout(() => {
                    character.takeDamage(25);
                    addLog('combat', `Chief counters! 25 damage! (After armor: ${25 - character.stats.armor})`);
                }, 3000);
                setTimeout(() => {
                    addLog('combat', 'You use Second Wind! Restoring HP...');
                    character.heal(30);
                }, 4000);
                setTimeout(() => {
                    addLog('combat', 'Final strike! You defeat the Goblin Chief!');
                    addLog('success', '🎉 BOSS DEFEATED! (+500 XP, Goblin Chief\'s Axe obtained)');
                    completeObjective(2);
                    updateQuestStep('Step 4: Boss Defeated');
                }, 5000);
            }
        },
        {
            title: 'Return to Village',
            action: () => {
                addLog('quest', 'Returning to the village...');
                setTimeout(() => {
                    addLog('success', 'You arrive back at the village!');
                    addLog('quest', 'The Village Elder greets you warmly.');
                    completeObjective(3);
                    updateQuestStep('Step 5: Returned to Village');
                }, 1000);
            }
        },
        {
            title: 'Quest Complete',
            action: () => {
                addLog('success', '✨ QUEST COMPLETE! ✨');
                addLog('success', 'Rewards: 500 XP, 100 Gold, Goblin Chief\'s Axe');
                addLog('success', 'The village is safe thanks to your bravery!');
                document.getElementById('quest-info').classList.add('completed');
                updateQuestStep('Quest Complete! 🎉');
                document.getElementById('start-btn').disabled = false;
                document.getElementById('auto-btn').disabled = true;
            }
        }
    ]
};

function updateUI() {
    // Update HP
    const hpPercent = (character.stats.hp / character.stats.maxHp) * 100;
    document.getElementById('hp-bar').style.width = hpPercent + '%';
    document.getElementById('hp-bar').textContent = Math.round(hpPercent) + '%';
    document.getElementById('hp-text').textContent = `${character.stats.hp} / ${character.stats.maxHp}`;
    
    // Update Mana
    const manaPercent = (character.stats.mana / character.stats.maxMana) * 100;
    document.getElementById('mana-bar').style.width = manaPercent + '%';
    document.getElementById('mana-bar').textContent = Math.round(manaPercent) + '%';
    document.getElementById('mana-text').textContent = `${character.stats.mana} / ${character.stats.maxMana}`;
    
    // Update quest progress
    const progressPercent = (currentStep / (questData.steps.length - 1)) * 100;
    document.getElementById('progress-bar').style.width = progressPercent + '%';
    document.getElementById('progress-bar').textContent = Math.round(progressPercent) + '%';
    document.getElementById('progress-text').textContent = Math.round(progressPercent) + '%';
}

function addLog(type, message) {
    const logArea = document.getElementById('log');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logArea.appendChild(entry);
    logArea.scrollTop = logArea.scrollHeight;
}

function completeObjective(index) {
    const obj = document.getElementById(`obj-${index + 1}`);
    if (obj) {
        obj.classList.add('completed');
    }
}

function updateQuestStep(step) {
    document.getElementById('quest-step').textContent = step;
}

function startQuest() {
    if (currentStep >= questData.steps.length) {
        resetQuest();
        return;
    }
    
    document.getElementById('start-btn').disabled = true;
    document.getElementById('auto-btn').disabled = false;
    
    if (currentStep < questData.steps.length) {
        questData.steps[currentStep].action();
        currentStep++;
        
        if (currentStep < questData.steps.length) {
            setTimeout(() => {
                document.getElementById('start-btn').disabled = false;
                document.getElementById('start-btn').textContent = '▶️ Next Step';
            }, 2000);
        }
    }
}

function autoPlay() {
    if (isAutoPlaying) return;
    
    isAutoPlaying = true;
    document.getElementById('auto-btn').disabled = true;
    document.getElementById('start-btn').disabled = true;
    
    addLog('quest', '⚡ AUTO-PLAY ENABLED');
    
    function playNextStep() {
        if (currentStep >= questData.steps.length) {
            isAutoPlaying = false;
            return;
        }
        
        questData.steps[currentStep].action();
        currentStep++;
        
        if (currentStep < questData.steps.length) {
            setTimeout(playNextStep, 3000);
        } else {
            isAutoPlaying = false;
        }
    }
    
    playNextStep();
}

function resetQuest() {
    currentStep = 0;
    isAutoPlaying = false;
    
    // Reset character
    character.stats.hp = character.stats.maxHp;
    character.stats.mana = character.stats.maxMana;
    
    // Reset UI
    updateUI();
    document.getElementById('log').innerHTML = '<div class="log-entry">Quest system reset. Ready to begin adventure!</div>';
    document.getElementById('quest-info').classList.remove('completed');
    document.querySelectorAll('.objective').forEach(obj => obj.classList.remove('completed'));
    document.getElementById('start-btn').disabled = false;
    document.getElementById('start-btn').textContent = '▶️ Start Quest';
    document.getElementById('auto-btn').disabled = true;
    updateQuestStep('Step 0: Ready to Begin');
    
    addLog('quest', 'Quest reset successfully!');
}

// Initialize UI
updateUI();

// Make functions available globally
window.startQuest = startQuest;
window.autoPlay = autoPlay;
window.resetQuest = resetQuest;
