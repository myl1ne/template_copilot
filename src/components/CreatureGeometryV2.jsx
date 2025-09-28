import { useMemo } from 'react'
import * as THREE from 'three'
import { ensureCompleteDNA } from './GeneticsSystem'

// Visual trait mappings based on DNA
export const VISUAL_TRAITS = {
  // Body shapes based on size and speed genes
  BODY_SHAPE: {
    large_fast: 'torpedo', // Streamlined for large fast creatures
    large_slow: 'bulky',   // Thick, sturdy for large slow creatures
    small_fast: 'dart',    // Thin, agile for small fast creatures
    small_slow: 'compact', // Small, rounded for small slow creatures 
    medium: 'balanced'     // Standard proportions
  },
  
  // Appendages based on behavioral traits
  APPENDAGES: {
    territorial: 'spikes',     // Defensive spikes
    aggressive: 'claws',       // Sharp protrusions
    social: 'tentacles',       // Social interaction tendrils
    intelligent: 'sensors',    // Sensor-like protrusions
    passive: 'smooth'          // No aggressive features
  },
  
  // Pattern based on genetic diversity
  PATTERNS: {
    low_diversity: 'solid',    // Single color
    medium_diversity: 'striped', // Simple patterns
    high_diversity: 'spotted'  // Complex patterns
  },
  
  // Size variations based on DNA
  SIZE_MODIFIERS: {
    head: { min: 0.8, max: 1.2 },
    body: { min: 0.9, max: 1.1 },
    appendages: { min: 0.7, max: 1.3 }
  }
}

// Generate visual traits from creature DNA and properties
export function generateVisualTraits(creature) {
  const traits = {
    bodyShape: 'balanced',
    appendages: 'smooth',
    pattern: 'solid',
    primaryColor: creature.color || '#4CAF50',
    secondaryColor: '#ffffff',
    sizeModifiers: {
      head: 1.0,
      body: 1.0,
      appendages: 1.0
    },
    complexity: 1
  }
  
  if (!creature.dna) return traits
  
  // Ensure DNA is complete with all gene types
  const completeDNA = ensureCompleteDNA(creature.dna)
  
  // Determine body shape from size and speed
  const sizeAllele = completeDNA.size?.allele1 || 'medium'
  const speedAllele = completeDNA.speed?.allele1 || 'medium'
  
  if (sizeAllele === 'large' && speedAllele === 'fast') {
    traits.bodyShape = 'torpedo'
  } else if (sizeAllele === 'large' && speedAllele === 'slow') {
    traits.bodyShape = 'bulky'
  } else if (sizeAllele === 'small' && speedAllele === 'fast') {
    traits.bodyShape = 'dart'
  } else if (sizeAllele === 'small' && speedAllele === 'slow') {
    traits.bodyShape = 'compact'
  }
  
  // Determine appendages from behavioral traits
  const territorialAllele = completeDNA.territoriality?.allele1 || 'normal'
  const aggressionAllele = completeDNA.aggression?.allele1 || 'normal'
  const socialAllele = completeDNA.socialBehavior?.allele1 || 'normal'
  const intelligenceAllele = completeDNA.intelligence?.allele1 || 'normal'
  
  if (territorialAllele === 'territorial') {
    traits.appendages = 'spikes'
  } else if (aggressionAllele === 'aggressive') {
    traits.appendages = 'claws'
  } else if (socialAllele === 'gregarious') {
    traits.appendages = 'tentacles'
  } else if (intelligenceAllele === 'smart') {
    traits.appendages = 'sensors'
  }
  
  // Calculate genetic diversity for patterns
  const alleles = Object.values(completeDNA).flatMap(gene => [gene.allele1, gene.allele2])
  const uniqueAlleles = new Set(alleles).size
  const diversity = uniqueAlleles / alleles.length
  
  if (diversity > 0.7) {
    traits.pattern = 'spotted'
  } else if (diversity > 0.4) {
    traits.pattern = 'striped'
  }
  
  // Generate secondary color based on diet and traits
  if (creature.diet === 'carnivore') {
    traits.secondaryColor = '#ff4444'
  } else if (creature.energyEfficiency > 0.8) {
    traits.secondaryColor = '#44ff44'
  } else if (creature.intelligence > 0.7) {
    traits.secondaryColor = '#4444ff'
  }
  
  // Size modifiers based on genetic variation
  const sizeGene = completeDNA.size
  if (sizeGene) {
    const heterozygous = sizeGene.allele1 !== sizeGene.allele2
    if (heterozygous) {
      traits.sizeModifiers.head = 0.9 + Math.random() * 0.2
      traits.sizeModifiers.body = 0.95 + Math.random() * 0.1
      traits.sizeModifiers.appendages = 0.8 + Math.random() * 0.4
    }
  }
  
  // Complexity based on overall genetic sophistication
  traits.complexity = Math.min(3, Math.floor(diversity * 4) + 1)
  
  return traits
}

// Component for creating complex creature geometries
function CreatureGeometryV2({ creature, visualTraits, isLowDetail = false }) {
  const segments = isLowDetail ? 6 : 16
  const radialSegments = isLowDetail ? 6 : 12
  
  const geometries = useMemo(() => {
    const geos = {}
    
    // Main body geometry based on body shape
    switch (visualTraits.bodyShape) {
      case 'torpedo':
        geos.body = <cylinderGeometry args={[
          creature.size * 0.3 * visualTraits.sizeModifiers.body,
          creature.size * 0.5 * visualTraits.sizeModifiers.body,
          creature.size * 1.2,
          radialSegments
        ]} />
        break
        
      case 'bulky':
        geos.body = <boxGeometry args={[
          creature.size * 1.2 * visualTraits.sizeModifiers.body,
          creature.size * 0.8 * visualTraits.sizeModifiers.body,
          creature.size * 1.0 * visualTraits.sizeModifiers.body
        ]} />
        break
        
      case 'dart':
        geos.body = <coneGeometry args={[
          creature.size * 0.3 * visualTraits.sizeModifiers.body,
          creature.size * 1.0,
          radialSegments
        ]} />
        break
        
      case 'compact':
        geos.body = <sphereGeometry args={[
          creature.size * 0.6 * visualTraits.sizeModifiers.body,
          segments,
          radialSegments
        ]} />
        break
        
      default: // balanced
        geos.body = <sphereGeometry args={[
          creature.size * 0.5 * visualTraits.sizeModifiers.body,
          segments,
          radialSegments
        ]} />
    }
    
    // Head geometry (slightly different from body)
    geos.head = <sphereGeometry args={[
      creature.size * 0.3 * visualTraits.sizeModifiers.head,
      Math.max(6, segments - 2),
      Math.max(6, radialSegments - 2)
    ]} />
    
    return geos
  }, [creature.size, visualTraits, segments, radialSegments])
  
  return geometries
}

// Main enhanced creature component
export default function EnhancedCreature({ creature, isSelected, onClick, populationSize = 1 }) {
  const visualTraits = useMemo(() => generateVisualTraits(creature), [creature])
  const isLowDetail = populationSize > 30
  const geometries = CreatureGeometryV2({ creature, visualTraits, isLowDetail })
  
  // Enhanced material properties
  const getMaterialProps = (isSecondary = false) => {
    const baseColor = isSecondary ? visualTraits.secondaryColor : visualTraits.primaryColor
    const color = new THREE.Color(baseColor)
    
    // Energy-based modifications
    const energyRatio = creature.energy / 100
    if (energyRatio < 0.3) {
      color.multiplyScalar(0.4 + energyRatio * 0.6)
    } else if (energyRatio > 0.8) {
      color.multiplyScalar(1.1)
    }
    
    return {
      color: color,
      emissive: isSelected ? '#ffffff' : (creature.energy > 150 ? '#00ff00' : '#000000'),
      emissiveIntensity: isSelected ? 0.4 : (creature.energy > 150 ? 0.1 : 0),
      roughness: 0.3,
      metalness: 0.1,
      transparent: creature.energy < 20,
      opacity: creature.energy < 20 ? 0.7 : 1
    }
  }
  
  // Appendage components based on traits
  const renderAppendages = () => {
    if (isLowDetail || visualTraits.appendages === 'smooth') return null
    
    const appendageCount = Math.min(visualTraits.complexity * 2, 6)
    const appendages = []
    
    for (let i = 0; i < appendageCount; i++) {
      const angle = (i / appendageCount) * Math.PI * 2
      const distance = creature.size * 0.7
      const x = Math.cos(angle) * distance
      const z = Math.sin(angle) * distance
      
      let appendageGeo
      switch (visualTraits.appendages) {
        case 'spikes':
          appendageGeo = (
            <coneGeometry args={[
              creature.size * 0.1 * visualTraits.sizeModifiers.appendages,
              creature.size * 0.4,
              6
            ]} />
          )
          break
          
        case 'claws':
          appendageGeo = (
            <cylinderGeometry args={[
              creature.size * 0.05,
              creature.size * 0.1 * visualTraits.sizeModifiers.appendages,
              creature.size * 0.3,
              8
            ]} />
          )
          break
          
        case 'tentacles':
          appendageGeo = (
            <cylinderGeometry args={[
              creature.size * 0.08 * visualTraits.sizeModifiers.appendages,
              creature.size * 0.12,
              creature.size * 0.5,
              6
            ]} />
          )
          break
          
        case 'sensors':
          appendageGeo = (
            <sphereGeometry args={[
              creature.size * 0.1 * visualTraits.sizeModifiers.appendages,
              8,
              6
            ]} />
          )
          break
          
        default:
          continue
      }
      
      appendages.push(
        <mesh
          key={`appendage-${i}`}
          position={[x, creature.position[1], z]}
          rotation={[0, angle, visualTraits.appendages === 'spikes' ? Math.PI : 0]}
        >
          {appendageGeo}
          <meshStandardMaterial {...getMaterialProps(true)} />
        </mesh>
      )
    }
    
    return appendages
  }
  
  return (
    <group>
      {/* Main body */}
      <mesh
        position={creature.position}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        castShadow
        receiveShadow
      >
        {geometries.body}
        <meshStandardMaterial {...getMaterialProps()} />
      </mesh>
      
      {/* Head (offset slightly) */}
      <mesh
        position={[
          creature.position[0],
          creature.position[1] + creature.size * 0.6,
          creature.position[2]
        ]}
        castShadow
        receiveShadow
      >
        {geometries.head}
        <meshStandardMaterial {...getMaterialProps()} />
      </mesh>
      
      {/* Appendages */}
      {renderAppendages()}
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh 
          position={[creature.position[0], creature.position[1] - 0.1, creature.position[2]]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[creature.size * 0.8, creature.size * 1.2, 16]} />
          <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      {/* Energy indicator for low energy */}
      {creature.energy < 50 && (
        <mesh position={[
          creature.position[0], 
          creature.position[1] + creature.size * 1.1, 
          creature.position[2]
        ]}>
          <planeGeometry args={[0.8, 0.12]} />
          <meshBasicMaterial 
            color={creature.energy > 25 ? '#ffaa00' : '#ff4444'}
            transparent
            opacity={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}