# RPG Engine - Automated Quest Testing

This directory contains automated visual tests for the RPG Engine quest system.

## Overview

The automated test system simulates a character going through a complete quest, capturing screenshots at each key step for visual inspection.

## Quest Test Flow

The test simulates the following quest progression:

1. **Initial State** - Character ready, quest available
2. **Quest Accepted** - Player accepts "The Village Rescue" quest
3. **Travel to Goblin Camp** - Character arrives at the quest location
4. **Fight Goblin Warriors** - Defeat 3 goblin warriors in sequence
5. **Heal & Prepare** - Character heals before the boss fight
6. **Boss Fight** - Epic battle with the Goblin Chief
7. **Return to Village** - Journey back to complete the quest
8. **Quest Complete** - Rewards received, quest finished

## Running the Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Start the development server in a separate terminal:
```bash
npm run dev
```

### Run Visual Test

Execute the automated quest test with screenshots:
```bash
npm test
```

or

```bash
npm run test:visual
```

### Test Output

The test will:
- Navigate through the quest demo page
- Click through each quest step automatically
- Capture screenshots at 10 key moments
- Save screenshots to the `screenshots/` directory
- Print a summary of the test results

### Screenshots Directory Structure

```
screenshots/
├── 01-initial-state.png          # Quest ready to start
├── 02-quest-accepted.png         # Quest begins
├── 03-at-goblin-camp.png         # Arrived at location
├── 04-warrior-1-defeated.png     # First warrior down
├── 05-warrior-2-defeated.png     # Second warrior down
├── 06-warrior-3-defeated.png     # Third warrior down
├── 07-healed-prepared.png        # Character healed
├── 08-boss-defeated.png          # Boss fight won
├── 09-returned-village.png       # Back at village
└── 10-quest-complete.png         # Quest finished
```

## Interactive Quest Demo

You can also manually interact with the quest demo:

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000/quest-demo.html
3. Click "Start Quest" to begin
4. Click "Next Step" to progress through the quest
5. Or click "Auto-Play" to watch it run automatically

## Test Features

- **Automated Progression**: Test clicks through each quest step
- **Visual Verification**: Screenshots capture the state at each step
- **Character Stats Tracking**: HP and mana bars show real-time changes
- **Combat Simulation**: Damage calculations and healing effects
- **Quest Log**: Detailed log of all events and actions
- **Progress Tracking**: Visual progress bar and objective completion

## Visual Elements Tested

### Character Panel
- HP bar (changes during combat)
- Mana bar (changes with skill usage)
- Character attributes (STR, DEX, CON)
- Combat stats (Armor, Attack Speed)

### Quest Panel
- Quest title and description
- Progress percentage bar
- Objective list with completion status
- Quest giver and reward information

### Quest Log
- Event logging with timestamps
- Different log types (quest, combat, success)
- Auto-scrolling to latest entries

## Customizing Tests

To modify the test:

1. Edit `tests/quest-visual-test.js` to change test behavior
2. Edit `public/quest-demo.js` to modify the quest logic
3. Edit `public/quest-demo.html` to change the UI

## Technical Details

- **Test Framework**: Playwright
- **Browser**: Chromium (headless)
- **Viewport**: 1280x800
- **Screenshot Format**: PNG
- **Full Page**: Yes (captures entire scrollable page)

## Troubleshooting

### Server not running
If the test fails with connection errors, make sure the dev server is running:
```bash
npm run dev
```

### Playwright not installed
Install Playwright browsers:
```bash
npx playwright install chromium
```

### Screenshots not generated
Check that the `screenshots/` directory was created and you have write permissions.
