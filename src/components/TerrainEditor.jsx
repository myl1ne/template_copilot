import { useState } from 'react'
import * as THREE from 'three'
import './TerrainEditor.css'

export default function TerrainEditor({ gameState, setGameState, isVisible, onClose }) {
  const [tool, setTool] = useState('raise')
  const [brushSize, setBrushSize] = useState(2)
  const [brushStrength, setBrushStrength] = useState(0.5)
  const [waterLevel, setWaterLevel] = useState(0.5)
  const [isEditing, setIsEditing] = useState(false)

  // Water placement tools
  const addWaterBody = (position, size = 3) => {
    const newWaterBody = {
      id: `water_${Date.now()}`,
      position: position,
      size: size,
      type: 'lake',
      flow: 0.3
    }

    setGameState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        waterBodies: [...(prev.environment?.waterBodies || []), newWaterBody]
      }
    }))
  }

  const addRiver = (startPos, endPos) => {
    const riverPath = generateRiverPath(startPos, endPos)
    const newRiver = {
      id: `river_${Date.now()}`,
      path: riverPath,
      flow: 0.5,
      width: 1.5
    }

    setGameState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        rivers: [...(prev.environment?.rivers || []), newRiver]
      }
    }))
  }

  // Generate curved river path
  const generateRiverPath = (start, end) => {
    const path = []
    const segments = 8
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = start[0] + (end[0] - start[0]) * t + (Math.random() - 0.5) * 2
      const z = start[2] + (end[2] - start[2]) * t + (Math.random() - 0.5) * 2
      const y = start[1] + (end[1] - start[1]) * t
      
      path.push([x, y, z])
    }
    
    return path
  }

  // Handle mouse interaction for terrain editing - simplified for now
  const handleMouseMove = (event) => {
    // This would be implemented when the terrain editor is integrated into the 3D scene
    console.log('Terrain editing at', event.clientX, event.clientY)
  }

  const modifyTerrain = (point, toolType, size, strength) => {
    // This would modify the terrain heightmap
    // For now, we'll add visual feedback and water bodies
    
    switch (toolType) {
      case 'water':
        addWaterBody([point.x, point.y, point.z], size)
        break
      case 'raise':
        // Would raise terrain at this point
        console.log('Raising terrain at', point)
        break
      case 'lower':
        // Would lower terrain at this point
        console.log('Lowering terrain at', point)
        break
      case 'smooth':
        // Would smooth terrain at this point
        console.log('Smoothing terrain at', point)
        break
    }
  }

  // Preset terrain modifications
  const createLake = () => {
    const position = [
      (Math.random() - 0.5) * 20,
      0,
      (Math.random() - 0.5) * 20
    ]
    addWaterBody(position, 4 + Math.random() * 3)
  }

  const createRiver = () => {
    const start = [(Math.random() - 0.5) * 30, 2, (Math.random() - 0.5) * 30]
    const end = [(Math.random() - 0.5) * 30, 0, (Math.random() - 0.5) * 30]
    addRiver(start, end)
  }

  const createMountain = () => {
    // Would create a mountain formation
    console.log('Creating mountain')
  }

  const createValley = () => {
    // Would create a valley formation
    console.log('Creating valley')
  }

  const clearWater = () => {
    setGameState(prev => ({
      ...prev,
      environment: {
        ...prev.environment,
        waterBodies: [],
        rivers: []
      }
    }))
  }

  if (!isVisible) return null

  return (
    <div className="terrain-editor-overlay">
      <div className="terrain-editor-panel">
        <div className="editor-header">
          <h3>🏔️ Terrain Editor</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="editor-content">
          {/* Tool Selection */}
          <div className="tool-section">
            <h4>🛠️ Tools</h4>
            <div className="tool-grid">
              <button 
                className={`tool-btn ${tool === 'raise' ? 'active' : ''}`}
                onClick={() => setTool('raise')}
              >
                ⬆️ Raise
              </button>
              <button 
                className={`tool-btn ${tool === 'lower' ? 'active' : ''}`}
                onClick={() => setTool('lower')}
              >
                ⬇️ Lower
              </button>
              <button 
                className={`tool-btn ${tool === 'smooth' ? 'active' : ''}`}
                onClick={() => setTool('smooth')}
              >
                🌊 Smooth
              </button>
              <button 
                className={`tool-btn ${tool === 'water' ? 'active' : ''}`}
                onClick={() => setTool('water')}
              >
                💧 Water
              </button>
            </div>
          </div>

          {/* Brush Settings */}
          <div className="setting-section">
            <h4>🖌️ Brush Settings</h4>
            
            <div className="setting-item">
              <label>Size: {brushSize}</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="slider"
              />
            </div>
            
            <div className="setting-item">
              <label>Strength: {brushStrength.toFixed(2)}</label>
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1"
                value={brushStrength}
                onChange={(e) => setBrushStrength(Number(e.target.value))}
                className="slider"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h4>⚡ Quick Actions</h4>
            
            <div className="action-grid">
              <button className="action-btn lake" onClick={createLake}>
                🏞️ Add Lake
              </button>
              <button className="action-btn river" onClick={createRiver}>
                🌊 Add River
              </button>
              <button className="action-btn mountain" onClick={createMountain}>
                🗻 Mountain
              </button>
              <button className="action-btn valley" onClick={createValley}>
                🏔️ Valley
              </button>
            </div>

            <button className="action-btn clear" onClick={clearWater}>
              🧹 Clear Water
            </button>
          </div>

          {/* Water Level Control */}
          <div className="water-section">
            <h4>💧 Water Controls</h4>
            
            <div className="setting-item">
              <label>Global Water Level: {waterLevel.toFixed(2)}</label>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.1"
                value={waterLevel}
                onChange={(e) => setWaterLevel(Number(e.target.value))}
                className="slider water"
              />
            </div>

            <div className="water-info">
              <div className="info-item">
                <span>Active Water Bodies:</span>
                <span>{gameState.environment?.waterBodies?.length || 0}</span>
              </div>
              <div className="info-item">
                <span>Rivers:</span>
                <span>{gameState.environment?.rivers?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions">
            <h4>📖 Instructions</h4>
            <ul>
              <li>Select a tool and click on terrain to modify</li>
              <li>💧 Water tool: Click to place water bodies</li>
              <li>⬆️⬇️ Raise/Lower: Modify terrain height</li>
              <li>🌊 Smooth: Blend terrain edges</li>
              <li>Use Quick Actions for instant terrain features</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Cursor indicator component for terrain editing
export function TerrainCursor({ position, tool, size, isVisible }) {
  const cursorRef = useRef()

  useFrame(() => {
    if (cursorRef.current && position) {
      cursorRef.current.position.set(position.x, position.y + 0.1, position.z)
    }
  })

  if (!isVisible || !position) return null

  const getToolColor = () => {
    switch (tool) {
      case 'raise': return '#4CAF50'
      case 'lower': return '#f44336'
      case 'smooth': return '#2196F3'
      case 'water': return '#00bcd4'
      default: return '#ffffff'
    }
  }

  return (
    <mesh ref={cursorRef}>
      <ringGeometry args={[size * 0.8, size, 16]} />
      <meshBasicMaterial
        color={getToolColor()}
        transparent
        opacity={0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}