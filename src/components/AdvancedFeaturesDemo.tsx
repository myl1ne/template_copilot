/**
 * Advanced Features Demonstration Component
 * 
 * This component showcases the enhanced AI companion capabilities
 * including interaction analysis, proactive messaging, and personality evolution.
 */

import React, { useState, useEffect } from 'react';
import { CompanionAI } from '../ai/companion-ai.js';
import type { 
  CompanionPersonality, 
  CompanionState, 
  CompanionMemory
} from '../types/companion.js';

interface AdvancedFeaturesDemoProps {
  companion: CompanionAI;
}

export const AdvancedFeaturesDemo: React.FC<AdvancedFeaturesDemoProps> = ({ companion }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [proactiveMessage, setProactiveMessage] = useState<string>('');
  const [evolutionFeedback, setEvolutionFeedback] = useState({
    userSatisfaction: 0.8,
    conversationDepth: 0.7,
    emotionalResonance: 0.6
  });

  const handleAnalyzeInteractions = () => {
    const interactionAnalysis = companion.analyzeInteractionPatterns();
    setAnalysis(interactionAnalysis);
  };

  const handleGenerateProactiveMessage = () => {
    const message = companion.generateProactiveMessage();
    setProactiveMessage(message.content);
  };

  const handlePersonalityEvolution = () => {
    companion.evolvePersonalityAdvanced(evolutionFeedback);
  };

  const handleAdvancedResponse = async () => {
    const response = await companion.generateAdvancedResponse(
      "I've been thinking about artificial intelligence and how it might change creative work",
      {
        timeOfDay: 'evening',
        userMood: 'thoughtful',
        conversationHistory: ["Previous discussion about creativity", "AI and technology talk"]
      }
    );
    console.log('Advanced Response:', response);
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      marginTop: '20px',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ color: '#495057', marginBottom: '20px' }}>
        🚀 Advanced AI Companion Features Demo
      </h3>

      {/* Interaction Analysis */}
      <div style={{ marginBottom: '20px' }}>
        <h4>📊 Interaction Pattern Analysis</h4>
        <button
          onClick={handleAnalyzeInteractions}
          style={{
            padding: '8px 16px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Analyze Patterns
        </button>
        
        {analysis && (
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <div><strong>Favorite Topics:</strong> {analysis.favoriteTopics.join(', ') || 'None yet'}</div>
            <div><strong>Communication Preferences:</strong> {analysis.communicationPreferences.join(', ')}</div>
            <div><strong>Optimal Times:</strong> {analysis.optimalInteractionTimes.join(', ')}</div>
            <div><strong>Growth Areas:</strong> {analysis.personalityGrowthAreas.join(', ') || 'Well balanced'}</div>
          </div>
        )}
      </div>

      {/* Proactive Messaging */}
      <div style={{ marginBottom: '20px' }}>
        <h4>💬 Proactive Conversation Starters</h4>
        <button
          onClick={handleGenerateProactiveMessage}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '10px'
          }}
        >
          Generate Proactive Message
        </button>
        
        {proactiveMessage && (
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '4px',
            fontSize: '14px',
            fontStyle: 'italic',
            border: '1px solid #28a745'
          }}>
            "{proactiveMessage}"
          </div>
        )}
      </div>

      {/* Personality Evolution */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🌱 Advanced Personality Evolution</h4>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            User Satisfaction: {evolutionFeedback.userSatisfaction}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={evolutionFeedback.userSatisfaction}
            onChange={(e) => setEvolutionFeedback(prev => ({
              ...prev,
              userSatisfaction: parseFloat(e.target.value)
            }))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Conversation Depth: {evolutionFeedback.conversationDepth}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={evolutionFeedback.conversationDepth}
            onChange={(e) => setEvolutionFeedback(prev => ({
              ...prev,
              conversationDepth: parseFloat(e.target.value)
            }))}
            style={{ width: '100%' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Emotional Resonance: {evolutionFeedback.emotionalResonance}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={evolutionFeedback.emotionalResonance}
            onChange={(e) => setEvolutionFeedback(prev => ({
              ...prev,
              emotionalResonance: parseFloat(e.target.value)
            }))}
            style={{ width: '100%' }}
          />
        </div>
        
        <button
          onClick={handlePersonalityEvolution}
          style={{
            padding: '8px 16px',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Evolve Personality
        </button>
      </div>

      {/* Advanced Response Demo */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🧠 Context-Aware Response Generation</h4>
        <button
          onClick={handleAdvancedResponse}
          style={{
            padding: '8px 16px',
            background: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Generate Advanced Response
        </button>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          Check console for detailed response analysis
        </div>
      </div>

      {/* Current Companion State */}
      <div style={{ 
        background: 'white', 
        padding: '15px', 
        borderRadius: '4px',
        border: '1px solid #dee2e6'
      }}>
        <h4 style={{ marginTop: 0 }}>🔍 Current Companion State</h4>
        <div style={{ fontSize: '14px' }}>
          <div><strong>Personality Traits:</strong></div>
          {Object.entries(companion.getState().personality.traits).map(([trait, value]) => (
            <div key={trait} style={{ marginLeft: '10px' }}>
              {trait}: {(value as number).toFixed(2)}
            </div>
          ))}
          <div style={{ marginTop: '10px' }}>
            <strong>Memory Count:</strong> {companion.getState().memory.experiences.length} experiences
          </div>
          <div>
            <strong>Bond Level:</strong> {companion.getState().memory.bondLevel.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};