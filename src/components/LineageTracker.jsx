import { useState, useMemo } from 'react'
import { analyzeGeneticDiversity, calculateGeneticSimilarity, GENE_TYPES } from './GeneticsSystem'

export default function LineageTracker({ gameState, isVisible, onClose }) {
  const [selectedCreature, setSelectedCreature] = useState(null)
  const [viewMode, setViewMode] = useState('family') // 'family', 'genetics', 'diversity'

  // Calculate genetic diversity for the current population
  const geneticAnalysis = useMemo(() => {
    const livingCreatures = gameState.population.filter(c => c.energy > 0 && c.dna)
    if (livingCreatures.length === 0) return null
    
    return analyzeGeneticDiversity(livingCreatures)
  }, [gameState.population])

  // Find family relationships
  const getFamilyTree = (creature) => {
    if (!creature || !creature.parentIds) return { parents: [], children: [], siblings: [] }
    
    const parents = gameState.population.filter(c => 
      creature.parentIds.includes(c.id)
    )
    
    const children = gameState.population.filter(c => 
      c.parentIds && c.parentIds.includes(creature.id)
    )
    
    const siblings = gameState.population.filter(c => 
      c.id !== creature.id && 
      c.parentIds && 
      creature.parentIds.length > 0 &&
      c.parentIds.some(pid => creature.parentIds.includes(pid))
    )
    
    return { parents, children, siblings }
  }

  // Calculate genetic similarity to selected creature
  const getSimilarCreatures = (creature) => {
    if (!creature || !creature.dna) return []
    
    return gameState.population
      .filter(c => c.id !== creature.id && c.dna && c.energy > 0)
      .map(c => ({
        creature: c,
        similarity: calculateGeneticSimilarity(creature.dna, c.dna)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10) // Top 10 most similar
  }

  if (!isVisible) return null

  return (
    <div className="lineage-tracker-overlay">
      <div className="lineage-tracker-panel">
        <div className="lineage-header">
          <h3>Population Genetics & Lineage</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="lineage-controls">
          <button 
            className={viewMode === 'family' ? 'active' : ''} 
            onClick={() => setViewMode('family')}
          >
            Family Tree
          </button>
          <button 
            className={viewMode === 'genetics' ? 'active' : ''} 
            onClick={() => setViewMode('genetics')}
          >
            Genetic Traits
          </button>
          <button 
            className={viewMode === 'diversity' ? 'active' : ''} 
            onClick={() => setViewMode('diversity')}
          >
            Population Diversity
          </button>
        </div>

        <div className="lineage-content">
          {viewMode === 'family' && (
            <div className="family-view">
              <div className="creature-selector">
                <h4>Select Creature:</h4>
                <select 
                  value={selectedCreature?.id || ''} 
                  onChange={(e) => {
                    const creature = gameState.population.find(c => c.id === parseInt(e.target.value))
                    setSelectedCreature(creature)
                  }}
                >
                  <option value="">Choose a creature...</option>
                  {gameState.population
                    .filter(c => c.energy > 0)
                    .map(creature => (
                      <option key={creature.id} value={creature.id}>
                        {creature.type} #{creature.id} (Gen {creature.generation || 1})
                      </option>
                    ))
                  }
                </select>
              </div>

              {selectedCreature && (
                <div className="family-tree">
                  <CreatureCard creature={selectedCreature} isSelected={true} />
                  
                  {(() => {
                    const family = getFamilyTree(selectedCreature)
                    return (
                      <>
                        {family.parents.length > 0 && (
                          <div className="family-section">
                            <h5>Parents:</h5>
                            <div className="family-members">
                              {family.parents.map(parent => (
                                <CreatureCard 
                                  key={parent.id} 
                                  creature={parent} 
                                  onClick={() => setSelectedCreature(parent)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {family.siblings.length > 0 && (
                          <div className="family-section">
                            <h5>Siblings:</h5>
                            <div className="family-members">
                              {family.siblings.map(sibling => (
                                <CreatureCard 
                                  key={sibling.id} 
                                  creature={sibling} 
                                  onClick={() => setSelectedCreature(sibling)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {family.children.length > 0 && (
                          <div className="family-section">
                            <h5>Children:</h5>
                            <div className="family-members">
                              {family.children.map(child => (
                                <CreatureCard 
                                  key={child.id} 
                                  creature={child} 
                                  onClick={() => setSelectedCreature(child)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="family-section">
                          <h5>Genetically Similar:</h5>
                          <div className="similar-creatures">
                            {getSimilarCreatures(selectedCreature).slice(0, 5).map(({ creature, similarity }) => (
                              <div key={creature.id} className="similar-creature">
                                <CreatureCard 
                                  creature={creature} 
                                  onClick={() => setSelectedCreature(creature)}
                                />
                                <span className="similarity-score">{(similarity * 100).toFixed(1)}% similar</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}
            </div>
          )}

          {viewMode === 'genetics' && selectedCreature && selectedCreature.dna && (
            <div className="genetics-view">
              <h4>Genetic Profile: {selectedCreature.type} #{selectedCreature.id}</h4>
              <div className="genetic-traits">
                {Object.values(GENE_TYPES).map(geneType => {
                  const genePair = selectedCreature.dna[geneType]
                  const phenotype = selectedCreature[`${geneType}Phenotype`] || 'unknown'
                  
                  return (
                    <div key={geneType} className="gene-info">
                      <div className="gene-name">{geneType.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                      <div className="genotype">
                        {genePair.allele1}/{genePair.allele2}
                      </div>
                      <div className="phenotype">
                        Expressed: {phenotype}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === 'diversity' && geneticAnalysis && (
            <div className="diversity-view">
              <h4>Population Genetic Diversity</h4>
              <div className="diversity-stats">
                <div className="stat">
                  <span className="stat-label">Population Size:</span>
                  <span className="stat-value">{geneticAnalysis.populationSize}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Genetic Diversity Index:</span>
                  <span className="stat-value">{geneticAnalysis.geneticDiversityIndex.toFixed(3)}</span>
                </div>
              </div>

              <div className="allele-frequencies">
                <h5>Allele Frequencies:</h5>
                {Object.entries(geneticAnalysis.alleleFrequencies).map(([geneType, frequencies]) => (
                  <div key={geneType} className="gene-frequency">
                    <h6>{geneType.replace(/([A-Z])/g, ' $1').toLowerCase()}</h6>
                    <div className="frequency-bars">
                      {Object.entries(frequencies).map(([allele, frequency]) => (
                        <div key={allele} className="frequency-bar">
                          <span className="allele-name">{allele}</span>
                          <div className="bar-container">
                            <div 
                              className="bar-fill" 
                              style={{ width: `${frequency * 100}%` }}
                            ></div>
                          </div>
                          <span className="frequency-value">{(frequency * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CreatureCard({ creature, isSelected = false, onClick }) {
  return (
    <div 
      className={`creature-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="creature-info">
        <div className="creature-icon" style={{ backgroundColor: creature.color }}>
          {creature.type.charAt(0).toUpperCase()}
        </div>
        <div className="creature-details">
          <div className="creature-name">{creature.type} #{creature.id}</div>
          <div className="creature-stats">
            <span>Gen {creature.generation || 1}</span>
            <span>Energy: {Math.round(creature.energy)}</span>
            <span>Age: {Math.round(creature.age || 0)}</span>
          </div>
          <div className="creature-traits">
            <span title="Size">S: {(creature.size || 0).toFixed(2)}</span>
            <span title="Speed">Sp: {(creature.speed || 0).toFixed(2)}</span>
            <span title="Diet">{creature.diet || 'herbivore'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}