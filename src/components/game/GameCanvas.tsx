import { useEffect, useRef } from 'react';
import { Game } from '../../core/Game';
import { PixiRenderer } from '../../rendering/PixiRenderer';
import { DEFAULT_GAME_CONFIG } from '../../types/game';
import { TOWER_DEFINITIONS } from '../../data/towers';
import { MONSTER_DEFINITIONS } from '../../data/monsters';
import { useGameStore } from '../../store/gameStore';
import { runStressTest } from '../../debug/StressTest';

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<PixiRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mounted = true;

    const initGame = async () => {
      // Initialize renderer
      const renderer = new PixiRenderer();
      await renderer.initialize(containerRef.current!);
      rendererRef.current = renderer;

      if (!mounted) {
        renderer.destroy();
        return;
      }

      // Initialize game
      const game = new Game(DEFAULT_GAME_CONFIG, renderer);
      gameRef.current = game;

      // Expose game instance for testing (accessible via console)
      (window as any).game = game;
      (window as any).pixiRenderer = renderer;
      (window as any).TOWER_DEFINITIONS = TOWER_DEFINITIONS;
      (window as any).MONSTER_DEFINITIONS = MONSTER_DEFINITIONS;
      (window as any).runStressTest = runStressTest;

      console.log('🎮 Game ready! Test commands:');
      console.log('- game.getTowerManager().placeTower(TOWER_DEFINITIONS.basic_archer, x, y)');
      console.log('- game.getMonsterManager().spawnMonster(MONSTER_DEFINITIONS.corrupted_hound)');
      console.log('- runStressTest({ towerCount: 30, waveCount: 10 }) // Stress test');
      console.log('Keyboard: [1] Ground Monster, [2] Flying Monster, [3] Armored, [T] Tower, [Space] Wave');
      console.log('Camera: [WASD/Arrows] Pan, [Mouse Wheel] Zoom, [Middle Mouse] Drag');

      // Initialize camera to center on grid
      renderer.centerCameraOnGrid(game.getGrid());

      // Start the game loop (rendering), but game stays in Menu state until user clicks START RUN
      game.start();
      console.log('💡 Click "START RUN" to begin!');

      // Handle window resize
      const handleResize = () => {
        if (containerRef.current) {
          renderer.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        }
      };

      // Keyboard controls for testing and camera
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!game) return;

        // Cancel tower placement with Escape
        if (e.key === 'Escape') {
          if ((window as any).selectedTowerForPlacement) {
            (window as any).selectedTowerForPlacement = null;
            renderer.clearPreview();
            console.log('❌ Cancelled tower placement');
          }
          return;
        }

        // Camera pan controls
        const camera = renderer.getCamera();
        camera.onKeyDown(e.key);

        if (e.key === '1') {
          // Spawn a ground monster
          const monsterDef = MONSTER_DEFINITIONS.corrupted_hound;
          if (monsterDef) {
            game.getMonsterManager().spawnMonster(monsterDef);
            console.log('✅ Spawned Corrupted Hound (ground)');
          }
        } else if (e.key === '2') {
          // Spawn a flying monster
          const monsterDef = MONSTER_DEFINITIONS.shadow_stalker;
          if (monsterDef) {
            game.getMonsterManager().spawnMonster(monsterDef);
            console.log('✅ Spawned Shadow Stalker (flying)');
          }
        } else if (e.key === '3') {
          // Spawn armored monster
          const monsterDef = MONSTER_DEFINITIONS.twisted_warrior;
          if (monsterDef) {
            game.getMonsterManager().spawnMonster(monsterDef);
            console.log('✅ Spawned Twisted Warrior (armored)');
          }
        } else if (e.key === 't' || e.key === 'T') {
          // Place tower at center
          const grid = game.getGrid();
          const centerX = (grid.width / 2) * grid.cellSize;
          const centerY = (grid.height / 2) * grid.cellSize;
          const towerDef = TOWER_DEFINITIONS.basic_archer;
          if (towerDef) {
            const tower = game.getTowerManager().placeTower(towerDef, centerX, centerY);
            if (tower) {
              console.log('✅ Placed Basic Archer tower');
            } else {
              console.log('❌ Cannot place tower there (would block path)');
            }
          }
        } else if (e.key === ' ') {
          // Spawn a wave
          const monsterDef = MONSTER_DEFINITIONS.corrupted_hound;
          if (monsterDef) {
            for (let i = 0; i < 5; i++) {
              setTimeout(() => {
                game.getMonsterManager().spawnMonster(monsterDef);
              }, i * 500);
            }
            console.log('🌊 Spawning wave of 5 monsters');
          }
        }
      };

      // Keyboard release for camera
      const handleKeyUp = (e: KeyboardEvent) => {
        const camera = renderer.getCamera();
        camera.onKeyUp(e.key);
      };

      // Mouse wheel for camera zoom
      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const camera = renderer.getCamera();
        camera.onWheel(e.deltaY);
      };

      // Middle mouse button drag for camera pan
      let isMiddleMouseDown = false;

      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
          e.preventDefault();
          isMiddleMouseDown = true;
          const camera = renderer.getCamera();
          camera.startDrag(e.clientX, e.clientY);
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isMiddleMouseDown) {
          const camera = renderer.getCamera();
          camera.updateDrag(e.clientX, e.clientY);
        }
      };

      const handleMouseUp = (e: MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
          isMiddleMouseDown = false;
          const camera = renderer.getCamera();
          camera.endDrag();
        }
      };

      // Handle canvas mouse move for building preview
      const handleCanvasMouseMove = (e: MouseEvent) => {
        const rect = containerRef.current!.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Convert screen coordinates to world coordinates (accounting for camera)
        const world = renderer.screenToWorld(screenX, screenY);
        const x = world.x;
        const y = world.y;

        const selectedTowerForPlacement = (window as any).selectedTowerForPlacement;

        if (selectedTowerForPlacement) {
          // Show building preview
          const towerDef = TOWER_DEFINITIONS[selectedTowerForPlacement];
          if (towerDef) {
            const size = towerDef.size || 1;
            const isValid = game.getTowerManager().canPlaceTower(x, y, size);
            renderer.setPreview(towerDef, x, y, isValid);
          }
        } else {
          // Clear preview when not in placement mode
          renderer.clearPreview();
        }
      };

      // Handle canvas click for tower placement and tower selection
      const handleCanvasClick = (e: MouseEvent) => {
        // Get click position relative to canvas
        const rect = containerRef.current!.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Convert screen coordinates to world coordinates (accounting for camera)
        const world = renderer.screenToWorld(screenX, screenY);
        const x = world.x;
        const y = world.y;

        const selectedTowerForPlacement = (window as any).selectedTowerForPlacement;

        if (selectedTowerForPlacement) {
          // Tower placement mode
          const towerDef = TOWER_DEFINITIONS[selectedTowerForPlacement];
          if (!towerDef) return;

          if (!useGameStore.getState().spendGold(towerDef.baseCost)) {
            console.log('❌ Not enough gold!');
            return;
          }

          const tower = game.getTowerManager().placeTower(towerDef, x, y);
          if (!tower) {
            useGameStore.getState().addGold(towerDef.baseCost);
            console.log('❌ Cannot place tower there (would block path)');
          } else {
            (window as any).selectedTowerForPlacement = null;
            renderer.clearPreview(); // Clear preview after placement
            console.log(`✅ Placed ${towerDef.name}`);
          }
        } else {
          // Tower selection mode — check if clicking on an existing tower
          const grid = game.getGrid();
          const gridPos = grid.worldToGrid(x, y);
          const clickedTower = game.getTowerManager().getTowerAtGrid(gridPos.x, gridPos.y);

          if (clickedTower) {
            useGameStore.getState().setSelectedTowerId(clickedTower.id);
          } else {
            // Clicked empty space — deselect
            useGameStore.getState().setSelectedTowerId(null);
          }
        }
      };

      // Handle mouse leave to clear preview
      const handleCanvasMouseLeave = () => {
        renderer.clearPreview();
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      containerRef.current!.addEventListener('click', handleCanvasClick);
      containerRef.current!.addEventListener('mousemove', handleCanvasMouseMove);
      containerRef.current!.addEventListener('mouseleave', handleCanvasMouseLeave);
      handleResize();

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('wheel', handleWheel);
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handleCanvasClick);
          containerRef.current.removeEventListener('mousemove', handleCanvasMouseMove);
          containerRef.current.removeEventListener('mouseleave', handleCanvasMouseLeave);
        }
        game.destroy();
        renderer.destroy();
      };
    };

    initGame();

    return () => {
      mounted = false;
      if (gameRef.current) {
        gameRef.current.destroy();
      }
      if (rendererRef.current) {
        rendererRef.current.destroy();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
}
