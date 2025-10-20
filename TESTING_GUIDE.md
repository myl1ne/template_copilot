# Testing Guide for RPG Quest & Combat Features

This guide provides step-by-step instructions for testing all the new features implemented in this update.

## Prerequisites

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to: `http://localhost:3000/world-rpg.html`

3. Wait for the "✓ Assets loaded!" message to appear

## Feature Testing

### 1. Quest Dialog Auto-Close

**What Changed**: When you accept a quest, the dialog now automatically closes after 1.5 seconds instead of staying open.

**How to Test**:
1. Press `W` to move forward to the Village Elder (coordinates: 10, 10)
2. When you see "Press E to interact with Village Elder", press `E`
3. Click "What troubles the village?"
4. Click "I will help!"
5. **Expected Result**: The dialog shows "Thank you, hero!" and automatically closes after 1.5 seconds

**Test with these NPCs**:
- Village Elder (10, 10) - Village Rescue Quest
- Traveling Merchant (-10, 10) - Merchant Delivery Quest
- Forest Hermit (-25, -25) - Herb Collection Quest
- Town Guard (15, 15) - Spider Cave Quest

### 2. New Quests

**What Changed**: Added 5 new quests to expand gameplay.

**How to Test**: Visit NPCs and check the quest offerings:

#### New Quest: Bandit Camp
- **Quest Giver**: Town Guard (15, 15)
- **Type**: Kill Quest
- **Objectives**: Defeat 6 bandits and their leader
- **Rewards**: 700 XP, 180 gold
- **Note**: This quest will be available after completing Village Rescue

#### New Quest: Lost Ring
- **Quest Giver**: Village Elder (10, 10)
- **Type**: Delivery Quest
- **Objectives**: Find a lost ring and return it
- **Rewards**: 250 XP, 100 gold

#### New Quest: Ancient Ruins
- **Quest Giver**: Forest Hermit (-25, -25)
- **Type**: Exploration Quest
- **Objectives**: Discover 3 ancient locations
- **Rewards**: 900 XP, 250 gold

#### New Quest: Slime Parts
- **Quest Giver**: Traveling Merchant (-10, 10)
- **Type**: Collection Quest
- **Objectives**: Collect 5 Slime Cores
- **Rewards**: 350 XP, 140 gold

### 3. Monster AI Stances

**What Changed**: Monsters now have different behavior patterns based on their stance.

#### Testing FLEE Stance (Spiders)

**Location**: Spider Den (25, -25)

**Steps**:
1. Navigate to coordinates (25, -25) using WASD
2. Approach a spider until "Press E to interact" appears
3. Press `E` to attack the spider
4. **Expected Result**: 
   - Spider takes damage
   - Spider runs away from you
   - Spider continues retreating if you follow

**Visual Indicators**:
- Spider mesh moves away from player position
- Spider maintains distance while retreating

#### Testing DEFENSIVE Stance (Goblins)

**Location**: Goblin Camp (-20, -20)

**Steps**:
1. Navigate to coordinates (-20, -20) using WASD
2. Approach a goblin until "Press E to interact" appears
3. Press `E` to attack the goblin
4. Move close to the goblin (within 3 units)
5. **Expected Result**:
   - Goblin takes damage from your attack
   - Goblin stays in position initially
   - Goblin counter-attacks you after ~2 seconds cooldown
   - You see "💥 GOBLIN attacks you for X damage!" message
   - Your HP decreases

**Visual Indicators**:
- Orange particle effects appear when goblin hits you
- Your HP bar updates in real-time

#### Testing AGGRESSIVE Stance (Skeletons & Wolves)

**Skeleton Location**: Graveyard (30, 10)
**Wolf Location**: Wolf Territory (-30, 30)

**Steps**:
1. Navigate to either location using WASD
2. Get within 5 units of a skeleton or wolf (don't interact yet)
3. **Expected Result**:
   - Monster starts moving towards you automatically
   - Monster rotates to face you
   - Monster pursues you if you move
   - Monster attacks when it gets close (within 2 units)
   - You see "💥 [MONSTER] attacks you for X damage!" message

**Visual Indicators**:
- Monster mesh moves and rotates towards player
- Monster continues pursuit until you leave aggro range
- Orange particles appear when monster hits you

### 4. Visual Attack Effects

**What Changed**: When attacks happen, orange particle effects now appear showing the impact.

**How to Test**:
1. Navigate to any monster
2. Press `E` to attack the monster
3. **Expected Result**:
   - 10 orange particles spawn at monster's location
   - Particles shoot outward in random directions
   - Particles fall down due to gravity
   - Particles fade out over ~0.5 seconds
   - Particles automatically disappear

**Also Test Monster Attacks**:
1. Get attacked by a defensive or aggressive monster
2. **Expected Result**: Same particle effect appears at your character's location

**Visual Details**:
- Particle color: Orange (#ff6600)
- Particle count: 10 per attack
- Duration: ~0.5 seconds
- Physics: Upward velocity + gravity

### 5. Monster Health Bar

**What Changed**: A health bar now appears when you attack a monster, showing real-time HP.

**How to Test**:
1. Navigate to any monster
2. Press `E` to attack the monster
3. **Expected Result**:
   - Red health bar appears at top-center of screen
   - Shows monster name (e.g., "GOBLIN" or "SKELETON LORD (BOSS)")
   - Shows current HP / max HP (e.g., "40 / 50")
   - Red progress bar shows percentage visually
   - Bar animates smoothly when HP changes

**Continue Testing**:
1. Attack the same monster multiple times
2. **Expected Result**:
   - Health bar stays visible
   - HP numbers update after each hit
   - Progress bar shrinks accordingly
   - Bar color remains red throughout

**Final Test**:
1. Defeat the monster completely
2. **Expected Result**:
   - Health bar automatically disappears
   - You see "GOBLIN DEFEATED!" message

**Visual Details**:
- Position: Top-center of screen (below quest panel)
- Color: Red (#ef4444)
- Border: Darker red outline
- Font: White text on dark background
- Animation: Smooth width transition (0.3s)

## Common Issues & Solutions

### Issue: Dialog doesn't close automatically
**Solution**: Check console for errors. The setTimeout function should trigger after 1.5 seconds.

### Issue: Monsters don't attack back
**Solution**: 
- Ensure you're attacking defensive/aggressive monsters (not flee stance)
- Stay within range (3 units for defensive, 2 units for aggressive)
- Wait for attack cooldown to expire

### Issue: No particle effects visible
**Solution**: 
- Check if WebGL is enabled in your browser
- Look carefully - particles are small and fade quickly
- Try zooming camera closer to the action

### Issue: Health bar doesn't appear
**Solution**: 
- Ensure you're successfully hitting the monster (check for damage message)
- The bar appears at top-center, check if it's off-screen
- Try refreshing the page and testing again

## Performance Notes

- All features are optimized for 60 FPS gameplay
- Particle system automatically cleans up expired particles
- Monster AI only updates for alive monsters
- Health bar only updates when a target exists

## Debug Mode

Press `F12` to open browser console and check for:
- Any JavaScript errors
- Console logs showing monster AI state
- Attack timing information
- Particle cleanup confirmations

## Video Recording Recommendations

For best demonstration of features:
1. Record at 1080p or higher resolution
2. Show HUD elements (health bars, messages)
3. Demonstrate each stance type separately
4. Show particle effects in slow motion if possible
5. Capture multiple monster types attacking
6. Show quest dialog auto-close multiple times

## Feature Checklist

Before completing testing, verify:

- [ ] Quest dialog closes automatically for all NPCs
- [ ] All 5 new quests visible in QuestFactory
- [ ] Spiders flee when attacked
- [ ] Goblins counter-attack when hit
- [ ] Skeletons pursue player aggressively
- [ ] Wolves pursue player aggressively
- [ ] Particle effects appear on all attacks
- [ ] Health bar shows for all monster types
- [ ] Health bar updates in real-time
- [ ] Health bar disappears when monster defeated
- [ ] No console errors during gameplay
- [ ] Build completes successfully

---

**Last Updated**: 2025-10-20
**Version**: 1.0.0
**Test Environment**: Vite Dev Server + Modern Browser with WebGL
