import { useState, useEffect, useMemo } from 'react'
import './PopulationAnalytics.css'

export default function PopulationAnalytics({ gameState, isVisible, onClose }) {
  const [historicalData, setHistoricalData] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  // Track population changes over time
  useEffect(() => {
    if (gameState.isRunning && gameState.population) {
      const timestamp = Date.now()
      const snapshot = {
        timestamp,
        totalPopulation: gameState.population.length,
        herbivores: gameState.population.filter(c => c.diet !== 'carnivore').length,
        carnivores: gameState.population.filter(c => c.diet === 'carnivore').length,
        averageEnergy: gameState.population.length > 0 
          ? gameState.population.reduce((sum, c) => sum + c.energy, 0) / gameState.population.length 
          : 0,
        averageAge: gameState.population.length > 0 
          ? gameState.population.reduce((sum, c) => sum + (c.age || 0), 0) / gameState.population.length 
          : 0,
        maxGeneration: gameState.population.length > 0 
          ? Math.max(...gameState.population.map(c => c.generation || 1))
          : 1,
        biome: gameState.currentBiome,
        foodSources: gameState.foodSources ? gameState.foodSources.length : 0,
        environmentalConditions: gameState.environment
      }

      setHistoricalData(prev => {
        const newData = [...prev, snapshot]
        // Keep only last 100 data points for performance
        return newData.length > 100 ? newData.slice(-100) : newData
      })
    }
  }, [gameState.population, gameState.isRunning, gameState.currentBiome, gameState.foodSources, gameState.environment])

  // Calculate genetic diversity metrics
  const geneticMetrics = useMemo(() => {
    if (!gameState.population || gameState.population.length === 0) {
      return {
        diversity: 0,
        uniqueTraits: 0,
        specializations: {},
        averageFitness: 0,
        generationRange: { min: 1, max: 1 }
      }
    }

    const creatures = gameState.population
    const specializations = {}
    let totalFitness = 0
    const generations = []

    creatures.forEach(creature => {
      // Count specializations
      const spec = creature.specialization || 'unspecialized'
      specializations[spec] = (specializations[spec] || 0) + 1

      // Calculate simple fitness based on energy and age
      const fitness = (creature.energy / 100) * (1 + (creature.age || 0) / 100)
      totalFitness += fitness

      // Track generations
      generations.push(creature.generation || 1)
    })

    // Calculate diversity as Shannon index approximation
    const totalCreatures = creatures.length
    const diversity = Object.values(specializations).reduce((sum, count) => {
      const proportion = count / totalCreatures
      return sum - (proportion * Math.log2(proportion))
    }, 0)

    return {
      diversity: diversity.toFixed(3),
      uniqueTraits: Object.keys(specializations).length,
      specializations,
      averageFitness: (totalFitness / totalCreatures).toFixed(2),
      generationRange: {
        min: Math.min(...generations),
        max: Math.max(...generations)
      }
    }
  }, [gameState.population])

  // Evolution timeline events
  const evolutionEvents = useMemo(() => {
    const events = []
    
    // Add major population milestones
    historicalData.forEach((snapshot, index) => {
      if (index > 0) {
        const prev = historicalData[index - 1]
        
        // Population boom/crash
        if (snapshot.totalPopulation > prev.totalPopulation * 1.5) {
          events.push({
            timestamp: snapshot.timestamp,
            type: 'boom',
            description: `Population boom: ${prev.totalPopulation} → ${snapshot.totalPopulation}`,
            impact: 'positive'
          })
        } else if (snapshot.totalPopulation < prev.totalPopulation * 0.5 && snapshot.totalPopulation > 0) {
          events.push({
            timestamp: snapshot.timestamp,
            type: 'crash',
            description: `Population crash: ${prev.totalPopulation} → ${snapshot.totalPopulation}`,
            impact: 'negative'
          })
        }

        // Biome changes
        if (snapshot.biome !== prev.biome) {
          events.push({
            timestamp: snapshot.timestamp,
            type: 'migration',
            description: `Biome change: ${prev.biome} → ${snapshot.biome}`,
            impact: 'neutral'
          })
        }

        // Generation advances
        if (snapshot.maxGeneration > prev.maxGeneration) {
          events.push({
            timestamp: snapshot.timestamp,
            type: 'evolution',
            description: `New generation reached: Generation ${snapshot.maxGeneration}`,
            impact: 'positive'
          })
        }
      }
    })

    return events.slice(-20) // Keep last 20 events
  }, [historicalData])

  // Render population graph
  const renderPopulationGraph = () => {
    if (historicalData.length < 2) {
      return <div className="no-data">Insufficient data for graph. Let simulation run for analysis.</div>
    }

    const maxPopulation = Math.max(...historicalData.map(d => d.totalPopulation))
    const graphHeight = 200
    const graphWidth = 400

    return (
      <div className="population-graph">
        <h4>Population Over Time</h4>
        <svg width={graphWidth} height={graphHeight} className="graph-svg">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <g key={ratio}>
              <line
                x1={0}
                y1={graphHeight * ratio}
                x2={graphWidth}
                y2={graphHeight * ratio}
                stroke="#444"
                strokeWidth="1"
                opacity="0.3"
              />
              <text
                x={5}
                y={graphHeight * ratio - 5}
                fill="#888"
                fontSize="10"
              >
                {Math.round(maxPopulation * (1 - ratio))}
              </text>
            </g>
          ))}

          {/* Population line */}
          <polyline
            points={historicalData.map((d, i) => {
              const x = (i / (historicalData.length - 1)) * graphWidth
              const y = graphHeight - (d.totalPopulation / maxPopulation) * graphHeight
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="2"
          />

          {/* Herbivore line */}
          <polyline
            points={historicalData.map((d, i) => {
              const x = (i / (historicalData.length - 1)) * graphWidth
              const y = graphHeight - (d.herbivores / maxPopulation) * graphHeight
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#81C784"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />

          {/* Carnivore line */}
          <polyline
            points={historicalData.map((d, i) => {
              const x = (i / (historicalData.length - 1)) * graphWidth
              const y = graphHeight - (d.carnivores / maxPopulation) * graphHeight
              return `${x},${y}`
            }).join(' ')}
            fill="none"
            stroke="#F44336"
            strokeWidth="1.5"
            strokeDasharray="3,3"
          />
        </svg>

        <div className="graph-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Total Population</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#81C784' }}></div>
            <span>Herbivores</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#F44336' }}></div>
            <span>Predators</span>
          </div>
        </div>
      </div>
    )
  }

  // Render specialization pie chart
  const renderSpecializationChart = () => {
    const { specializations } = geneticMetrics
    const total = gameState.population.length

    if (total === 0) {
      return <div className="no-data">No creatures to analyze</div>
    }

    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#FFEB3B', '#795548']
    let currentAngle = 0

    return (
      <div className="specialization-chart">
        <h4>Species Specializations</h4>
        <div className="chart-container">
          <svg width={200} height={200} className="pie-chart">
            {Object.entries(specializations).map(([spec, count], index) => {
              const percentage = count / total
              const angle = percentage * 2 * Math.PI
              const largeArcFlag = angle > Math.PI ? 1 : 0
              
              const x1 = 100 + 80 * Math.cos(currentAngle)
              const y1 = 100 + 80 * Math.sin(currentAngle)
              const x2 = 100 + 80 * Math.cos(currentAngle + angle)
              const y2 = 100 + 80 * Math.sin(currentAngle + angle)

              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ')

              currentAngle += angle

              return (
                <path
                  key={spec}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="#fff"
                  strokeWidth="2"
                />
              )
            })}
          </svg>

          <div className="chart-legend">
            {Object.entries(specializations).map(([spec, count], index) => (
              <div key={spec} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span>{spec}: {count} ({((count / total) * 100).toFixed(1)}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <div className="population-analytics-overlay">
      <div className="population-analytics-modal">
        <div className="modal-header">
          <h2>📊 Population Analytics Dashboard</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              Population Trends
            </button>
            <button 
              className={`tab-btn ${activeTab === 'genetics' ? 'active' : ''}`}
              onClick={() => setActiveTab('genetics')}
            >
              Genetic Analysis
            </button>
            <button 
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveTab('timeline')}
            >
              Evolution Timeline
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="metrics-grid">
                  <div className="metric-card">
                    <h4>Current Population</h4>
                    <div className="metric-value">{gameState.population.length}</div>
                    <div className="metric-breakdown">
                      <span>Herbivores: {gameState.population.filter(c => c.diet !== 'carnivore').length}</span>
                      <span>Predators: {gameState.population.filter(c => c.diet === 'carnivore').length}</span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Genetic Diversity</h4>
                    <div className="metric-value">{geneticMetrics.diversity}</div>
                    <div className="metric-breakdown">
                      <span>Unique Traits: {geneticMetrics.uniqueTraits}</span>
                      <span>Avg Fitness: {geneticMetrics.averageFitness}</span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Generation Range</h4>
                    <div className="metric-value">
                      {geneticMetrics.generationRange.min}-{geneticMetrics.generationRange.max}
                    </div>
                    <div className="metric-breakdown">
                      <span>Evolution Progress</span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <h4>Environment Status</h4>
                    <div className="metric-value">{gameState.currentBiome}</div>
                    <div className="metric-breakdown">
                      <span>Food: {gameState.foodSources ? gameState.foodSources.length : 0}</span>
                      <span>Condition: {gameState.environment?.season || 'Normal'}</span>
                    </div>
                  </div>
                </div>

                {renderSpecializationChart()}
              </div>
            )}

            {activeTab === 'trends' && (
              <div className="trends-tab">
                {renderPopulationGraph()}
                
                {historicalData.length > 0 && (
                  <div className="trend-summary">
                    <h4>Trend Analysis</h4>
                    <div className="trend-metrics">
                      <div className="trend-item">
                        <span>Peak Population:</span>
                        <span>{Math.max(...historicalData.map(d => d.totalPopulation))}</span>
                      </div>
                      <div className="trend-item">
                        <span>Average Population:</span>
                        <span>{Math.round(historicalData.reduce((sum, d) => sum + d.totalPopulation, 0) / historicalData.length)}</span>
                      </div>
                      <div className="trend-item">
                        <span>Data Points:</span>
                        <span>{historicalData.length}</span>
                      </div>
                      <div className="trend-item">
                        <span>Tracking Duration:</span>
                        <span>{historicalData.length > 1 ? `${Math.round((Date.now() - historicalData[0].timestamp) / 1000)}s` : '0s'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'genetics' && (
              <div className="genetics-tab">
                <div className="genetics-overview">
                  <h4>Genetic Composition Analysis</h4>
                  
                  <div className="genetics-stats">
                    <div className="genetics-metric">
                      <span>Total Creatures:</span>
                      <span>{gameState.population.length}</span>
                    </div>
                    <div className="genetics-metric">
                      <span>Shannon Diversity Index:</span>
                      <span>{geneticMetrics.diversity}</span>
                    </div>
                    <div className="genetics-metric">
                      <span>Unique Specializations:</span>
                      <span>{geneticMetrics.uniqueTraits}</span>
                    </div>
                  </div>

                  {gameState.population.length > 0 && (
                    <div className="trait-distribution">
                      <h5>Trait Distribution</h5>
                      <div className="trait-bars">
                        {['size', 'speed', 'energyEfficiency', 'aggressiveness'].map(trait => {
                          const values = gameState.population
                            .map(c => c[trait] || 0)
                            .filter(v => v > 0)
                          
                          if (values.length === 0) return null

                          const avg = values.reduce((sum, v) => sum + v, 0) / values.length
                          const min = Math.min(...values)
                          const max = Math.max(...values)

                          return (
                            <div key={trait} className="trait-bar">
                              <div className="trait-label">{trait}:</div>
                              <div className="trait-stats">
                                <span>Min: {min.toFixed(2)}</span>
                                <span>Avg: {avg.toFixed(2)}</span>
                                <span>Max: {max.toFixed(2)}</span>
                              </div>
                              <div className="trait-bar-visual">
                                <div 
                                  className="trait-bar-fill"
                                  style={{ width: `${(avg / max) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="timeline-tab">
                <h4>Evolution Timeline</h4>
                
                {evolutionEvents.length === 0 ? (
                  <div className="no-data">
                    No major evolution events recorded yet. Let the simulation run longer to observe changes.
                  </div>
                ) : (
                  <div className="timeline">
                    {evolutionEvents.map((event, index) => (
                      <div key={index} className={`timeline-event ${event.impact}`}>
                        <div className="event-time">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="event-content">
                          <div className={`event-type ${event.type}`}>
                            {event.type === 'boom' && '📈'}
                            {event.type === 'crash' && '📉'}
                            {event.type === 'migration' && '🌍'}
                            {event.type === 'evolution' && '🧬'}
                            {event.type}
                          </div>
                          <div className="event-description">{event.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="data-export">
            <button 
              className="btn btn-secondary"
              onClick={() => {
                const data = {
                  currentState: {
                    population: gameState.population.length,
                    biome: gameState.currentBiome,
                    timestamp: Date.now()
                  },
                  genetics: geneticMetrics,
                  historicalData: historicalData.slice(-50), // Last 50 data points
                  evolutionEvents
                }
                
                try {
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  
                  // Check if URL.createObjectURL exists (for browser environment)
                  if (typeof URL !== 'undefined' && URL.createObjectURL) {
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `ecosystem-analytics-${Date.now()}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  } else {
                    // Fallback for test environment
                    console.log('Export data:', data)
                  }
                } catch (error) {
                  console.warn('Data export failed:', error)
                }
              }}
            >
              📁 Export Data
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setHistoricalData([])}
            >
              🗑️ Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}