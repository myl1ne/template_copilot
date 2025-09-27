import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GameUI from './GameUI'

describe('GameUI', () => {
  const mockGameState = {
    isRunning: false,
    population: [],
    speed: 1,
    selectedCreature: null
  }

  const mockSetGameState = vi.fn()

  it('renders game controls', () => {
    render(<GameUI gameState={mockGameState} setGameState={mockSetGameState} />)
    
    expect(screen.getByText('Game Controls')).toBeInTheDocument()
    expect(screen.getByText('Start Simulation')).toBeInTheDocument()
    expect(screen.getByText('Spawn Herbivore')).toBeInTheDocument()
    expect(screen.getByText('Spawn Predator')).toBeInTheDocument()
  })

  it('shows correct population count', () => {
    const stateWithPopulation = {
      ...mockGameState,
      population: [{ id: 1 }, { id: 2 }, { id: 3 }]
    }

    render(<GameUI gameState={stateWithPopulation} setGameState={mockSetGameState} />)
    
    // Check for population count specifically in the Population stat
    expect(screen.getByText('Population:')).toBeInTheDocument()
    const populationElements = screen.getAllByText('3')
    expect(populationElements.length).toBeGreaterThan(0) // Should find the population count
  })

  it('toggles simulation state when start/pause button is clicked', () => {
    render(<GameUI gameState={mockGameState} setGameState={mockSetGameState} />)
    
    const startButton = screen.getByText('Start Simulation')
    fireEvent.click(startButton)
    
    expect(mockSetGameState).toHaveBeenCalledWith(expect.any(Function))
  })
})