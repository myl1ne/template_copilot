@echo off
REM Build script for Tower Defense Mod (Windows)

REM Check if RIMWORLD_DIR is set
if "%RIMWORLD_DIR%"=="" (
    echo Error: RIMWORLD_DIR environment variable is not set.
    echo Please set it to your RimWorld installation directory, e.g.:
    echo   set RIMWORLD_DIR=C:\Program Files ^(x86^)\Steam\steamapps\common\RimWorld
    exit /b 1
)

REM Check if the RimWorld directory exists
if not exist "%RIMWORLD_DIR%" (
    echo Error: RimWorld directory not found at: %RIMWORLD_DIR%
    exit /b 1
)

REM Save the root directory
set "ROOT_DIR=%CD%"

REM Define the mod installation directory using RIMWORLD_DIR
set "MOD_INSTALL_DIR=%RIMWORLD_DIR%\Mods\TowerDefenseMod"

REM Build the project
echo Building Tower Defense Mod...
cd Source
dotnet build TowerDefenseMod.sln -c Release

if %ERRORLEVEL% EQU 0 (
    echo Build successful! DLL output to Assemblies/
    echo.
    
    REM Remove old installation if it exists
    if exist "%MOD_INSTALL_DIR%" (
        echo Removing old installation...
        rmdir /S /Q "%MOD_INSTALL_DIR%"
    )
    
    REM Copy mod to RimWorld Mods folder
    echo Installing mod to: %MOD_INSTALL_DIR%
    
    REM Create the destination folder
    mkdir "%MOD_INSTALL_DIR%"
    
    REM Copy only the necessary mod folders
    robocopy "%ROOT_DIR%\About" "%MOD_INSTALL_DIR%\About" /E /NFL /NDL /NJH /NJS /nc /ns /np
    robocopy "%ROOT_DIR%\Assemblies" "%MOD_INSTALL_DIR%\Assemblies" /E /NFL /NDL /NJH /NJS /nc /ns /np
    robocopy "%ROOT_DIR%\Defs" "%MOD_INSTALL_DIR%\Defs" /E /NFL /NDL /NJH /NJS /nc /ns /np
    robocopy "%ROOT_DIR%\Languages" "%MOD_INSTALL_DIR%\Languages" /E /NFL /NDL /NJH /NJS /nc /ns /np
    robocopy "%ROOT_DIR%\Textures" "%MOD_INSTALL_DIR%\Textures" /E /NFL /NDL /NJH /NJS /nc /ns /np
    
    echo.
    echo Installation complete! Enable the mod in RimWorld's mod manager.
) else (
    echo Build failed!
    exit /b 1
)
