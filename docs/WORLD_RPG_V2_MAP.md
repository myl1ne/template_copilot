# World RPG v2 - Visual Map Guide

## World Map Layout

```
    -40                  -20           0            20           40
  40 +------------------+-------------+-------------+-------------+
     |                  |             |             |             |
     | 🏰 Lighthouse    |  🐺🐺       |             |             |
     |   (Coastal)      | Wolf Pack   |             |             |
     |                  |             |             |             |
  30 +------------------+-------------+-------------+-------------+
     |                  |             |             |             |
     |                  |             |             |             |
     |                  |             |             |             |
     |                  |             |             |             |
  20 +------------------+-------------+-------------+-------------+
     |                  |             | 🗼 Tower    |             |
     |                  |             |   (Watch)   | ⚔️ Graveyard|
     |                  |             |             | 💀💀💀       |
  10 +------------------+-------------+🏪+🏠+🔔----+💀(Plateau)-+
     |                  |             | Market      | Windmill    |
     | 🧙‍♂️ Hermit       | ⚠️ Goblin  | Village     |             |
     | 📚 Bookshelf     | 👺👺👺      | ⛺ Center   |             |
     | 🍄 Mushrooms     | (Hill)      | 🏠🏠       |             |
   0 +🍄-Cauldron-----+-👺-Chest---+-⛺-Well----+-------------+
     |                  | Campfire    |             | 🏚️ Barn    |
     |                  |             |             | 🗡️ Smith   |
     |                  |             |             |             |
     | 🐻 Bear Den      |             | 🌉 Bridge   | 👹👹 Orcs  |
 -10 +------------------+-------------+(Valley)----+-------------+
     |                  |             |             |             |
     |                  |             |             |             |
     |                  |             |             |             |
     |                  |             |             | 🕷️🕷️       |
 -20 +------------------+-------------+-------------+Spider------+
     |                  |             |             | (Canyon)    |
     |                  |             |             | 💎 Crystal  |
     |                  |             |             | 🕳️ Cave     |
 -30 +------------------+-------------+-------------+-------------+
     |                  |             |             |             |
  -40                  -20           0            20           40
```

## Legend

### NPCs & Buildings
- 🏠 Houses (3 total)
- 🗼 Watch Tower
- 🏚️ Village Barn
- 🏪 Market Stall
- 🏰 Lighthouse
- 🔔 Village Well
- 🌉 Stone Bridge
- 🗡️ Blacksmith
- 🧙‍♂️ Forest Hermit
- ⛺ Village Center

### Monsters
- 👺 Goblins (Level 1, Aggressive) - 3 total
- 💀 Skeletons (Level 2, Defensive) - 3 total
- 🕷️ Spiders (Level 2, Aggressive) - 2 total
- 🐺 Wolves (Level 3, Aggressive) - 2 total
- 🐻 Bear (Level 5, Defensive) - 1 total
- 👹 Orcs (Level 4, Aggressive) - 2 total

### Props & Features
- 🍄 Mushrooms
- 💎 Crystal
- 📚 Bookshelf
- ⚠️ Warning Signs
- 💰 Chests
- 🕳️ Cave Entrance
- ⛺ Campfires
- 🗺️ Signposts

### Terrain Features
- **(Hill)** - Elevated area
- **(Plateau)** - Flat elevated platform
- **(Canyon)** - Deep ravine
- **(Valley)** - Lowered area

## Zone Boundaries

### 1. Village Center (Green)
```
Bounds: X(-5 to 25), Z(-5 to 25)
Safety: SAFE ✅
Threat Level: ⭐☆☆☆☆
```

### 2. Goblin Camp (Red)
```
Bounds: X(-25 to -15), Z(-25 to -15)
Safety: DANGER ⚠️
Threat Level: ⭐⭐☆☆☆
```

### 3. Skeleton Graveyard (Purple)
```
Bounds: X(25 to 35), Z(5 to 15)
Safety: DANGER ⚠️
Threat Level: ⭐⭐⭐☆☆
```

### 4. Spider Canyon (Yellow)
```
Bounds: X(20 to 30), Z(-30 to -20)
Safety: HIGH DANGER ⚠️⚠️
Threat Level: ⭐⭐⭐☆☆
```

### 5. Wolf Territory (Blue)
```
Bounds: X(-35 to -25), Z(25 to 35)
Safety: EXTREME DANGER ⚠️⚠️⚠️
Threat Level: ⭐⭐⭐⭐☆
```

## Player Journey Path

### Recommended Path for New Players:

1. **Start**: Village Center (0, 0)
   - Talk to Village Elder (5, 5)
   - Visit Merchant (-8, 8)
   - Equip at Blacksmith (12, -5)

2. **First Quest**: Goblin Camp
   - Head southwest to (-20, -20)
   - Fight 3 goblins (Level 1)
   - Loot magical chest
   - Return to village

3. **Second Quest**: Skeleton Graveyard
   - Head east to (30, 10)
   - Navigate plateau terrain
   - Fight 3 skeletons (Level 2)
   - Collect rare loot

4. **Exploration**: Spider Canyon
   - Head south to (25, -25)
   - Explore canyon depths
   - Fight 2 spiders
   - Find glowing crystal

5. **Advanced**: Wolf Territory
   - Head northwest to (-30, 30)
   - Fight wolf pack
   - Visit coastal lighthouse

6. **End Game**: Bear Den & Orc Outpost
   - Challenge the bear at (-35, -10)
   - Clear orc outpost at (10-15, -30)
   - Collect all rare items

## Points of Interest

### Scenic Locations
1. **Coastal Lighthouse** (-40, 40) - Northernmost point, ocean view
2. **Windmill** (25, 5) - Overlooks graveyard plateau
3. **Watch Tower** (20, 20) - Defensive structure, high vantage
4. **Stone Bridge** (0, -8) - Crosses valley, connects areas

### Hidden Areas
1. **Hermit's Hut** (-25, -25) - Magical forest retreat
2. **Spider Cave** (24, -24) - Underground entrance
3. **Bear Den** (-35, -10) - Deep forest clearing

### Trading Posts
1. **Market Stall** (-5, 10) - Merchant trading location
2. **Blacksmith Shop** (12, -5) - Weapon upgrades
3. **Village Well** (3, 12) - Community gathering

## Distance Reference

```
Village Center (0, 0) to:
- Goblin Camp: ~28 units SW
- Graveyard: ~30 units E
- Spider Canyon: ~36 units SE
- Wolf Territory: ~42 units NW
- Bear Den: ~35 units W
- Lighthouse: ~56 units NW
```

## Elevation Guide

- **Highest Points**: Graveyard Plateau (+3), Hills (+4-5)
- **Sea Level**: Water Level (2.5)
- **Lowest Points**: Canyon Floor (-4), Valley (-2)
- **Village**: Ground Level (0)

---

**Map Version**: 2.0  
**Last Updated**: Based on world_rpg_v2.json  
**Total World Size**: 100x100 units  
**Playable Area**: ~80x80 units (excluding water)
