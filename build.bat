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

REM Build the project
echo Building Tower Defense Mod...
cd Source
dotnet build TowerDefenseMod.sln -c Release

if %ERRORLEVEL% EQU 0 (
    echo Build successful! DLL output to Assemblies/
    echo.
    echo To install, copy this mod folder to:
    echo   %%USERPROFILE%%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Mods\
    echo.
    echo Or create a symlink ^(as Administrator^):
    echo   mklink /D "%%USERPROFILE%%\AppData\LocalLow\Ludeon Studios\RimWorld by Ludeon Studios\Mods\TowerDefenseMod" "%CD%\.."
) else (
    echo Build failed!
    exit /b 1
)
