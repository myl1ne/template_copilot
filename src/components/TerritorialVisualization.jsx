import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { territorialBehavior } from './TerritorialBehavior'

/**
 * Visual representation of territorial boundaries and scent marks
 */
export default function TerritorialVisualization({ population, showTerritories = true, showScentMarks = true }) {
  const territoriesRef = useRef()
  const scentMarksRef = useRef()

  // Update visualization each frame
  useFrame(() => {
    if (!territoriesRef.current && !scentMarksRef.current) return

    // Clear previous visualizations
    if (territoriesRef.current) {
      territoriesRef.current.clear()
    }
    if (scentMarksRef.current) {
      scentMarksRef.current.clear()
    }

    // Get current territorial data
    const territories = new Map()
    const scentMarks = territorialBehavior.getScentMarks()

    // Collect territory information for each creature
    population.forEach(creature => {
      const territory = territorialBehavior.getTerritoryInfo(creature.id)
      if (territory) {
        territories.set(creature.id, { territory, creature })
      }
    })

    // Draw territory boundaries
    if (showTerritories && territoriesRef.current) {
      territories.forEach(({ territory, creature }) => {
        drawTerritoryBoundary(territoriesRef.current, territory, creature)
      })
    }

    // Draw scent marks
    if (showScentMarks && scentMarksRef.current) {
      scentMarks.forEach(mark => {
        drawScentMark(scentMarksRef.current, mark)
      })
    }
  })

  return (
    <group>
      {/* Territory boundaries */}
      {showTerritories && (
        <mesh ref={territoriesRef}>
          <bufferGeometry />
          <lineBasicMaterial color="#ffff00" transparent opacity={0.3} />
        </mesh>
      )}
      
      {/* Scent marks */}
      {showScentMarks && (
        <group ref={scentMarksRef} />
      )}
    </group>
  )
}

/**
 * Draw territory boundary as a circle
 */
function drawTerritoryBoundary(parent, territory, creature) {
  // Create circle geometry for territory boundary
  const geometry = new THREE.RingGeometry(territory.radius - 0.1, territory.radius, 32)
  const material = new THREE.MeshBasicMaterial({
    color: creature.color || '#ffff00',
    transparent: true,
    opacity: 0.2 + territory.strength * 0.3,
    side: THREE.DoubleSide
  })

  const territoryMesh = new THREE.Mesh(geometry, material)
  territoryMesh.position.set(territory.center[0], 0.05, territory.center[2])
  territoryMesh.rotation.x = -Math.PI / 2

  parent.add(territoryMesh)

  // Add territory center marker
  const centerGeometry = new THREE.SphereGeometry(0.1, 8, 8)
  const centerMaterial = new THREE.MeshBasicMaterial({
    color: creature.color || '#ffff00',
    transparent: true,
    opacity: 0.8
  })

  const centerMesh = new THREE.Mesh(centerGeometry, centerMaterial)
  centerMesh.position.set(territory.center[0], 0.2, territory.center[2])

  parent.add(centerMesh)
}

/**
 * Draw scent mark as a small glowing sphere
 */
function drawScentMark(parent, mark) {
  const geometry = new THREE.SphereGeometry(0.05 + mark.strength * 0.05, 6, 6)
  const material = new THREE.MeshBasicMaterial({
    color: '#ff4444',
    transparent: true,
    opacity: mark.strength * 0.6,
    emissive: '#ff2222',
    emissiveIntensity: mark.strength * 0.3
  })

  const scentMesh = new THREE.Mesh(geometry, material)
  scentMesh.position.set(mark.position[0], mark.position[1], mark.position[2])

  parent.add(scentMesh)
}