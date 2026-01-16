# RimWorld Tower Defense Mod

A tower defense mod for RimWorld that adds autonomous, upgradeable towers and a manual wave system.

## Features

- **Autonomous Towers**: Build self-operating towers that automatically engage hostiles
- **Wave System**: Manually trigger enemy waves via the Wave Console
- **Upgrade System**: Upgrade towers through the Bills system
- **Research-Gated**: Unlock towers and upgrades through research

## Building the Mod

### Prerequisites

1. Install .NET Framework 4.7.2 or higher (or .NET SDK that includes it)
2. Have RimWorld installed on your system

### Build Instructions

#### Windows

1. Set the `RIMWORLD_DIR` environment variable to your RimWorld installation directory:
   ```cmd
   set RIMWORLD_DIR=C:\Program Files (x86)\Steam\steamapps\common\RimWorld
   ```

2. Build the project:
   ```cmd
   cd Source
   dotnet build TowerDefenseMod.sln -c Release
   ```

#### Linux/Mac

1. Set the `RIMWORLD_DIR` environment variable:
   ```bash
   export RIMWORLD_DIR="/path/to/your/rimworld/installation"
   ```

2. Build the project:
   ```bash
   cd Source
   dotnet build TowerDefenseMod.sln -c Release
   ```

### Alternative Build Method

If you don't have `dotnet` CLI, you can use Visual Studio or your preferred IDE:

1. Open `Source/TowerDefenseMod.sln`
2. Update the assembly references in the `.csproj` file to point to your RimWorld installation
3. Build in Release mode

The compiled DLL will be output to the `Assemblies/` folder.

## Installation

### Option 1: Symlink (Recommended for Development)

Create a symbolic link from your RimWorld Mods folder to this repository:

**Windows (as Administrator):**
```cmd
mklink /D "%USERPROFILE%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Mods\TowerDefenseMod" "C:\path\to\this\repo"
```

**Linux/Mac:**
```bash
ln -s /path/to/this/repo ~/.config/unity3d/Ludeon\ Studios/RimWorld\ by\ Ludeon\ Studios/Mods/TowerDefenseMod
```

### Option 2: Copy Files

Copy the entire mod folder to your RimWorld Mods directory:
- **Windows**: `%USERPROFILE%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Mods\`
- **Linux**: `~/.config/unity3d/Ludeon Studios/RimWorld by Ludeon Studios/Mods/`
- **Mac**: `~/Library/Application Support/RimWorld/Mods/`

## Usage

1. Enable the mod in RimWorld's mod manager
2. Start or load a game
3. Research "Basic Tower Defense" to unlock towers and the Wave Console
4. Build the Wave Console and Basic Tower Mk1 from the Security menu
5. Use the Wave Console to trigger waves
6. Research "Advanced Tower Systems" to unlock tower upgrades
7. Upgrade towers via the Bills tab (Mk1 → Mk2)

## Development Structure

```
/About/               - Mod metadata
/Assemblies/          - Compiled DLL output
/Defs/                - XML definitions
  /ThingDefs_Buildings/
  /RecipeDefs/
  /ResearchProjectDefs/
  /IncidentDefs/
/Languages/English/Keyed/ - Localization strings
/Source/              - C# source code
  /Waves/             - Wave system components
  /Towers/            - Tower and upgrade logic
/Textures/            - Game textures (placeholders for MVP)
```

## Game Mechanics

### Wave System
- Waves are triggered manually via the Wave Console
- Each wave increases in difficulty: `points = 150 + (waveIndex × 60)`
- Wave state persists across save/load

### Tower Upgrades
- Towers have a Bills tab like crafting stations
- Add "Upgrade to Mk2" bill to a Mk1 tower
- Colonists bring materials and perform the upgrade
- Tower is replaced in-place with Mk2 (preserving position, rotation, damage state)

### Tower Stats
- **Mk1**: Range 24.9, Cooldown 3.5s, Basic damage
- **Mk2**: Range 29.9 (+20%), Cooldown 2.9s (-17%), Same damage

## Troubleshooting

### Build Errors
- Ensure `RIMWORLD_DIR` environment variable is set correctly
- Check that RimWorld DLL references are valid
- Verify you're using .NET Framework 4.7.2 or compatible version

### Mod Not Loading
- Check RimWorld's log file for errors (`Player.log` in RimWorld install directory)
- Verify `About/About.xml` exists and is valid
- Ensure the DLL is in the `Assemblies/` folder

### Towers Not Attacking
- Ensure tower is powered and not flickered off
- Check that tower has fuel (Steel for barrel maintenance)
- Verify research is completed

## License

This mod is provided as-is for RimWorld modding purposes.

## Credits

Created with the RimWorld modding API by Ludeon Studios.
