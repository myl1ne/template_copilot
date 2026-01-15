#!/bin/bash

# Build script for Tower Defense Mod

# Check if RIMWORLD_DIR is set
if [ -z "$RIMWORLD_DIR" ]; then
    echo "Error: RIMWORLD_DIR environment variable is not set."
    echo "Please set it to your RimWorld installation directory, e.g.:"
    echo "  export RIMWORLD_DIR=\"/path/to/RimWorld\""
    exit 1
fi

# Check if the RimWorld directory exists
if [ ! -d "$RIMWORLD_DIR" ]; then
    echo "Error: RimWorld directory not found at: $RIMWORLD_DIR"
    exit 1
fi

# Build the project
echo "Building Tower Defense Mod..."
cd Source
dotnet build TowerDefenseMod.sln -c Release

if [ $? -eq 0 ]; then
    echo "Build successful! DLL output to Assemblies/"
    echo ""
    echo "To install, copy this mod folder to:"
    echo "  ~/.config/unity3d/Ludeon Studios/RimWorld by Ludeon Studios/Mods/"
    echo ""
    echo "Or create a symlink:"
    echo "  ln -s $(pwd)/.. ~/.config/unity3d/Ludeon\\ Studios/RimWorld\\ by\\ Ludeon\\ Studios/Mods/TowerDefenseMod"
else
    echo "Build failed!"
    exit 1
fi
