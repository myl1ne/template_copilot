import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PopulationAnalytics from './PopulationAnalytics'
import { BIOME_TYPES } from './BiomeConfig'

// Mock the CSS import
vi.mock('./PopulationAnalytics.css', () => ({}))

describe('PopulationAnalytics', () => {
  const mockGameState = {
    population: [
      {
        id: 1,
        type: 'sphere',
        diet: 'herbivore',
        energy: 80,
        age: 25,
        generation: 1,
        size: 0.8,
        speed: 0.6,
        energyEfficiency: 0.7,
        aggressiveness: 0.3,
        specialization: 'grazer'
      },
      {
        id: 2,
        type: 'cylinder',
        diet: 'carnivore',
        energy: 120,
        age: 15,
        generation: 2,
        size: 1.2,
        speed: 0.9,
        energyEfficiency: 0.5,
        aggressiveness: 0.8,
        specialization: 'hunter'
      }
    ],
    currentBiome: BIOME_TYPES.FOREST,
    foodSources: [
      { id: 'food1', energy: 50 },
      { id: 'food2', energy: 30 }
    ],
    isRunning: true,
    environment: {
      season: 'normal'
    }
  }

  const mockOnClose = vi.fn()

  it('renders the analytics dashboard when visible', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('📊 Population Analytics Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Population Trends')).toBeInTheDocument()
    expect(screen.getByText('Genetic Analysis')).toBeInTheDocument()
    expect(screen.getByText('Evolution Timeline')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('📊 Population Analytics Dashboard')).not.toBeInTheDocument()
  })

  it('displays current population metrics correctly', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Check population count
    expect(screen.getByText('2')).toBeInTheDocument() // Total population
    expect(screen.getByText('Herbivores: 1')).toBeInTheDocument()
    expect(screen.getByText('Predators: 1')).toBeInTheDocument()
  })

  it('calculates genetic diversity metrics', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Should show genetic diversity (Shannon index for 2 different specializations)
    expect(screen.getByText('Unique Traits: 2')).toBeInTheDocument()
  })

  it('shows environment status correctly', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('forest')).toBeInTheDocument()
    expect(screen.getByText('Food: 2')).toBeInTheDocument()
    expect(screen.getByText('Condition: normal')).toBeInTheDocument()
  })

  it('switches between tabs correctly', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Click on Population Trends tab
    fireEvent.click(screen.getByText('Population Trends'))
    expect(screen.getByText('Insufficient data for graph. Let simulation run for analysis.')).toBeInTheDocument()

    // Click on Genetic Analysis tab
    fireEvent.click(screen.getByText('Genetic Analysis'))
    expect(screen.getByText('Genetic Composition Analysis')).toBeInTheDocument()

    // Click on Evolution Timeline tab
    fireEvent.click(screen.getByText('Evolution Timeline'))
    expect(screen.getByText('No major evolution events recorded yet. Let the simulation run longer to observe changes.')).toBeInTheDocument()
  })

  it('displays genetic trait distribution', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Switch to genetics tab
    fireEvent.click(screen.getByText('Genetic Analysis'))

    expect(screen.getByText('Trait Distribution')).toBeInTheDocument()
    expect(screen.getByText('size:')).toBeInTheDocument()
    expect(screen.getByText('speed:')).toBeInTheDocument()
    expect(screen.getByText('energyEfficiency:')).toBeInTheDocument()
    expect(screen.getByText('aggressiveness:')).toBeInTheDocument()
  })

  it('handles empty population gracefully', () => {
    const emptyGameState = {
      ...mockGameState,
      population: []
    }

    render(
      <PopulationAnalytics 
        gameState={emptyGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Use getAllByText to handle multiple elements with "0"
    const zeroElements = screen.getAllByText('0')
    expect(zeroElements.length).toBeGreaterThan(0) // Should have at least one "0"
    expect(screen.getByText('No creatures to analyze')).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('×'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows insufficient data message for trends when no historical data', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('Population Trends'))
    expect(screen.getByText('Insufficient data for graph. Let simulation run for analysis.')).toBeInTheDocument()
  })

  it('shows no evolution events message for timeline initially', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    fireEvent.click(screen.getByText('Evolution Timeline'))
    expect(screen.getByText('No major evolution events recorded yet. Let the simulation run longer to observe changes.')).toBeInTheDocument()
  })

  it('handles data export functionality', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Just check that the export button exists and is clickable
    const exportButton = screen.getByText('📁 Export Data')
    expect(exportButton).toBeInTheDocument()
    
    // Click should not throw an error
    fireEvent.click(exportButton)
  })

  it('displays data control buttons', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('📁 Export Data')).toBeInTheDocument()
    expect(screen.getByText('🗑️ Clear History')).toBeInTheDocument()
  })

  it('displays specialization data correctly', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Species Specializations')).toBeInTheDocument()
    // Check for specialization data
    expect(screen.getByText(/grazer.*50\.0%/)).toBeInTheDocument()
    expect(screen.getByText(/hunter.*50\.0%/)).toBeInTheDocument()
  })

  it('calculates generation range correctly', () => {
    render(
      <PopulationAnalytics 
        gameState={mockGameState}
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    // Should show generation range 1-2
    expect(screen.getByText('1-2')).toBeInTheDocument()
    expect(screen.getByText('Evolution Progress')).toBeInTheDocument()
  })
})