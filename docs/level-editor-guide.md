# Level Editor Guide

The RPG Level Editor is a tool for creating and modifying game levels, including terrain editing, NPC placement, and monster spawning.

## Getting Started

### Standalone Editor
1. Navigate to `/level-editor.html` in your browser
2. Click the "🛠️ Enable Editor" button or press the **E** key
3. The editor is now active and you'll see a green brush indicator on the terrain

### In-Game Editor
1. Start playing the game at `/world-rpg.html`
2. Press the **P** key to toggle the level editor
3. A side panel will appear with quick editing options
4. Press **P** again to disable the editor and continue playing

## Editor Modes

The level editor has four main modes:

### 🏔️ Terrain Editor
Edit the height of terrain using brush-based tools.

**Controls:**
- **Click & Drag**: Raise terrain
- **Shift + Click & Drag**: Lower terrain
- **Brush Size Slider**: Adjust the radius of the editing brush (1-20 units)
- **Brush Strength Slider**: Adjust how much terrain is raised/lowered (0.1-2.0)

**Tips:**
- Use larger brush sizes for creating mountains and valleys
- Use smaller brush sizes for fine details
- Adjust strength for gradual or dramatic changes
- Enable Paint Mode to paint terrain colors instead of modifying height
- Use the color picker to select custom terrain colors

**Paint Mode:**
When Paint Mode is enabled, clicking and dragging will paint the terrain with the selected color instead of changing its height. This allows you to:
- Create colored paths or regions
- Paint biome transitions
- Add visual variety to your terrain
- Mark special areas with different colors

### 👤 NPC Placement
Place non-player characters in your level.

**Available NPC Types:**
- **Quest Giver**: NPCs that provide quests to players
- **Merchant**: NPCs that sell items and equipment
- **Guard**: Defensive NPCs that protect areas
- **Hermit**: Solitary NPCs with unique dialogue
- **Villager**: Generic friendly NPCs

**Options:**
- **NPC Type**: Choose the role of the NPC
- **NPC Model**: Select the visual appearance (Baelin, Paladin, Peasant)
- **NPC Name**: Give the NPC a custom name

**To Place:**
1. Select NPC type, model, and enter a name
2. Click on the terrain where you want to place the NPC
3. The NPC will be added to your level data

### 👹 Monster Placement
Add hostile creatures to challenge players.

**Available Monster Types:**
- **Goblin**: Weak, defensive creatures (40 HP, 8 damage)
- **Orc**: Strong aggressive warriors (80 HP, 15 damage)
- **Spider**: Fast, venomous creatures (30 HP, 6 damage)
- **Wolf**: Pack hunters with aggressive behavior (50 HP, 12 damage)
- **Bear**: Powerful territorial beasts (120 HP, 20 damage)
- **Dragon**: Boss-level threat (500 HP, 40 damage)

**Stance Options:**
- **Defensive**: Monster only attacks when player gets very close
- **Aggressive**: Monster actively pursues and attacks players
- **Flee**: Monster runs away when player approaches

**To Place:**
1. Select monster type and stance
2. Click on the terrain where you want to spawn the monster
3. The monster will be added to your level data

### 📜 Quest Management
*(Coming Soon)* Manage quests and objectives for your level.

## Save & Load System

### Saving a Level
1. Enter a level name in the "Level Name" field (default: `custom_level`)
2. Click "💾 Save Level" button
3. A JSON file will be downloaded to your computer
4. The file contains all terrain modifications, NPC positions, and monster placements

### Loading a Level
1. Click "📂 Load Level" button
2. Select a previously saved JSON level file
3. The level will be loaded with all saved data
4. You can continue editing from where you left off

### Level Data Format
Levels are saved as JSON with the following structure:
```json
{
  "name": "custom_level",
  "terrain": {
    "seed": 123.456,
    "modifications": [
      { "index": 0, "x": 5.2, "z": 3.1, "delta": 0.05 }
    ]
  },
  "npcs": [
    {
      "id": "npc_12345",
      "name": "Merchant Bob",
      "type": "merchant",
      "position": { "x": 10, "z": 15 },
      "modelName": "peasant"
    }
  ],
  "monsters": [
    {
      "type": "goblin",
      "position": { "x": -20, "z": 30 },
      "hp": 40,
      "damage": 8,
      "xp": 25,
      "stance": "defensive"
    }
  ],
  "quests": []
}
```

## Keyboard Shortcuts

### Standalone Editor
- **WASD / Arrow Keys**: Move camera around the scene
- **Space**: Move camera up
- **Shift** (when not clicking): Move camera down
- **E**: Toggle editor on/off
- **Left Click**: Place/Edit (depending on mode)
- **Shift + Left Click**: Lower terrain (Terrain mode only) or paint color (Paint mode)
- **Right Click**: Rotate camera
- **Mouse Wheel**: Zoom in/out

### In-Game Editor
- **P**: Toggle level editor
- **Left Click & Drag**: Raise terrain
- **Shift + Left Click**: Lower terrain
- All other game controls remain active

## Tips & Best Practices

### Terrain Design
1. **Start Big**: Create major landscape features first (mountains, valleys)
2. **Add Details**: Use smaller brush sizes for paths, hills, and details
3. **Test Gameplay**: Ensure terrain is navigable for players
4. **Consider Biomes**: Remember that terrain height affects biome distribution

### NPC Placement
1. **Strategic Positioning**: Place merchants in safe areas, guards near entrances
2. **Spacing**: Give NPCs enough space so they're easy to find
3. **Context**: Place quest givers near quest objectives when possible
4. **Variety**: Use different models to make NPCs visually distinct

### Monster Spawning
1. **Difficulty Curve**: Place weaker monsters near starting areas
2. **Group Placement**: Consider spawning monsters in groups
3. **Boss Areas**: Use aggressive stance for boss-level threats
4. **Safe Zones**: Keep some areas monster-free for players to rest
5. **Respawn Time**: All monsters respawn after 30 seconds by default

### Level Design
1. **Save Often**: Save your work frequently to avoid losing progress
2. **Multiple Versions**: Create variations of your level with different names
3. **Test Playthrough**: Load your level in the main game and test it
4. **Iterate**: Refine based on gameplay testing

## Technical Information

### Brush Indicator
- Green ring shows where terrain editing will occur
- Blue indicator for NPC placement mode
- Red indicator for monster placement mode
- Size matches the brush size setting

### Terrain Modifications
- Modifications are tracked as delta values
- Original terrain seed is preserved
- Multiple edits compound over time
- Changes affect vertex positions directly

### Performance
- Large brush sizes may cause temporary frame drops
- Recommended brush size: 3-10 for most editing
- Consider splitting very large levels into multiple files

## Troubleshooting

### Editor Not Appearing
- Ensure JavaScript is enabled in your browser
- Check browser console for errors
- Refresh the page and try again

### Can't Place NPCs/Monsters
- Make sure you've selected a type from the dropdown
- Click directly on visible terrain
- Check that editor mode is active (green/blue/red indicator visible)

### Terrain Not Changing
- Verify editor is enabled
- Check brush strength isn't set too low
- Ensure you're clicking and dragging, not just clicking
- Try increasing brush size if changes are too subtle

### Level File Won't Load
- Verify JSON file is valid (use a JSON validator)
- Check file wasn't corrupted during download
- Ensure file matches expected format

## Future Enhancements

Planned features for future releases:
- Quest management interface
- Texture painting for terrain
- Environment object placement (trees, rocks, chests)
- Lighting and atmosphere controls
- Multi-level support
- Copy/paste functionality
- Undo/redo system
- Minimap preview

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review this guide for common solutions
3. Create an issue in the GitHub repository
4. Include your browser version and OS information
