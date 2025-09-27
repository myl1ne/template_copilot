import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Creature from './Creature'

export default function CreatureManager({ gameState, setGameState }) {
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (!gameState.isRunning) return

    timeRef.current += delta

    // Update creatures every frame
    if (gameState.population.length > 0) {
      setGameState(prev => ({
        ...prev,
        population: prev.population.map(creature => {
          // Simple movement AI
          const newCreature = { ...creature }
          
          // Random movement with some direction persistence
          if (!newCreature.direction) {
            newCreature.direction = Math.random() * Math.PI * 2
            newCreature.directionChangeTime = 0
          }

          newCreature.directionChangeTime += delta

          // Change direction occasionally
          if (newCreature.directionChangeTime > 2 + Math.random() * 3) {
            newCreature.direction += (Math.random() - 0.5) * Math.PI * 0.5
            newCreature.directionChangeTime = 0
          }

          // Move creature
          const speed = 0.5 + Math.random() * 0.3
          const moveX = Math.cos(newCreature.direction) * speed * delta
          const moveZ = Math.sin(newCreature.direction) * speed * delta

          newCreature.position[0] += moveX
          newCreature.position[2] += moveZ

          // Keep creatures within bounds
          const bounds = 20
          if (Math.abs(newCreature.position[0]) > bounds) {
            newCreature.direction = Math.PI - newCreature.direction
            newCreature.position[0] = Math.sign(newCreature.position[0]) * bounds
          }
          if (Math.abs(newCreature.position[2]) > bounds) {
            newCreature.direction = -newCreature.direction
            newCreature.position[2] = Math.sign(newCreature.position[2]) * bounds
          }

          // Decrease energy over time
          newCreature.energy -= delta * 5

          return newCreature
        }).filter(creature => creature.energy > 0) // Remove dead creatures
      }))
    }
  })

  const handleCreatureClick = (creature) => {
    setGameState(prev => ({
      ...prev,
      selectedCreature: creature
    }))
  }

  return (
    <group>
      {gameState.population.map(creature => (
        <Creature
          key={creature.id}
          creature={creature}
          isSelected={gameState.selectedCreature?.id === creature.id}
          onClick={() => handleCreatureClick(creature)}
        />
      ))}
    </group>
  )
}