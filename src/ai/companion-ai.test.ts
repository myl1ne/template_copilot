/**
 * Test suite for Aria AI Companion Core System
 * 
 * This file contains comprehensive tests for the CompanionAI class,
 * including personality system, memory formation, and interaction handling.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CompanionAI } from './companion-ai.js';
import type { 
  CompanionPersonality, 
  CompanionState, 
  CompanionMemory,
  CompanionEvent
} from '../types/companion.js';

describe('CompanionAI Core System', () => {
  let mockPersonality: CompanionPersonality;
  let mockState: CompanionState;
  let mockMemory: CompanionMemory;
  let companion: CompanionAI;

  beforeEach(() => {
    // Set up mock data for consistent testing
    mockPersonality = {
      traits: {
        curiosity: 0.8,
        empathy: 0.7,
        playfulness: 0.6,
        supportiveness: 0.9,
        independence: 0.5
      },
      communicationStyle: {
        formality: 'casual',
        verbosity: 'balanced',
        humor: 'gentle'
      },
      interests: ['learning', 'creativity', 'helping others'],
      quirks: ['asks thoughtful questions', 'remembers small details']
    };

    mockState = {
      mood: {
        primary: 'curious',
        intensity: 0.7,
        lastUpdated: new Date()
      },
      energy: 0.8,
      stimulation: 0.3,
      availability: 'available'
    };

    mockMemory = {
      userProfile: {
        preferences: {},
        importantDates: [],
        relationships: []
      },
      experiences: [],
      learnedConcepts: [],
      bondLevel: 0.2
    };

    companion = new CompanionAI(mockPersonality, mockState, mockMemory);
  });

  describe('Initialization', () => {
    it('should initialize with provided personality, state, and memory', () => {
      const state = companion.getState();
      expect(state.personality.traits.curiosity).toBe(0.8);
      expect(state.state.mood.primary).toBe('curious');
      expect(state.memory.bondLevel).toBe(0.2);
    });

    it('should have empty event listeners initially', () => {
      // Test that companion can accept event listeners
      const mockListener = vi.fn();
      companion.addEventListener(mockListener);
      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Response Generation', () => {
    it('should generate responses based on personality traits', async () => {
      const response = await companion.generateResponse("Tell me about yourself");
      
      expect(response).toBeDefined();
      expect(response.content).toBeTruthy();
      expect(response.sender).toBe('companion');
      expect(response.timestamp).toBeInstanceOf(Date);
      expect(response.id).toBeTruthy();
    });

    it('should consider context when generating responses', async () => {
      const response = await companion.generateResponse("How are you?", {
        timeOfDay: 'morning',
        emotionalCue: 'excited'
      });

      expect(response.content).toBeTruthy();
      expect(response.emotionalTone).toBeDefined();
    });

    it('should have appropriate confidence scores', async () => {
      const response = await companion.generateResponse("Hello there!");
      
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify learning moments appropriately', async () => {
      const learningResponse = await companion.generateResponse("Can you teach me about artificial intelligence and how it works?");
      const casualResponse = await companion.generateResponse("Hi");

      expect(learningResponse.isLearningMoment).toBe(true);
      expect(casualResponse.isLearningMoment).toBe(false);
    });
  });

  describe('Personality-Based Behavior', () => {
    it('should respond differently based on high curiosity trait', async () => {
      // High curiosity companion
      const curiousPersonality = { ...mockPersonality, traits: { ...mockPersonality.traits, curiosity: 0.9 } };
      const curiousCompanion = new CompanionAI(curiousPersonality, mockState, mockMemory);
      
      const response = await curiousCompanion.generateResponse("I went to the museum today");
      expect(response.content).toContain("fascinating" || "Tell me more" || "?");
    });

    it('should show empathetic responses with high empathy trait', async () => {
      const empathicPersonality = { ...mockPersonality, traits: { ...mockPersonality.traits, empathy: 0.95 } };
      const empathicCompanion = new CompanionAI(empathicPersonality, mockState, mockMemory);
      
      const response = await empathicCompanion.generateResponse("I'm feeling sad today");
      expect(response.emotionalTone).toBe('concerned');
    });

    it('should demonstrate playfulness with high playfulness trait', async () => {
      const playfulPersonality = { ...mockPersonality, traits: { ...mockPersonality.traits, playfulness: 0.9 } };
      const playfulCompanion = new CompanionAI(playfulPersonality, mockState, mockMemory);
      
      const response = await playfulCompanion.generateResponse("What should we do?");
      expect(response.content).toContain("fun" || "explore" || "play" || "together");
    });
  });

  describe('State Management', () => {
    it('should update stimulation after interactions', async () => {
      const initialStimulation = companion.getState().state.stimulation;
      await companion.generateResponse("Let's have a conversation!");
      const updatedStimulation = companion.getState().state.stimulation;
      
      expect(updatedStimulation).toBeGreaterThan(initialStimulation);
    });

    it('should use energy during interactions', async () => {
      const initialEnergy = companion.getState().state.energy;
      await companion.generateResponse("Tell me a long story about your day");
      const updatedEnergy = companion.getState().state.energy;
      
      expect(updatedEnergy).toBeLessThan(initialEnergy);
    });

    it('should update mood based on interaction context', async () => {
      const eventListener = vi.fn();
      companion.addEventListener(eventListener);
      
      await companion.generateResponse("This is so exciting!");
      
      // Check if mood change event was emitted
      const moodChangeEvents = eventListener.mock.calls.filter(
        call => call[0].type === 'mood_changed'
      );
      expect(moodChangeEvents.length).toBeGreaterThan(0);
    });
  });

  describe('Memory System', () => {
    it('should form memories from significant interactions', async () => {
      const initialMemoryCount = companion.getState().memory.experiences.length;
      
      // This should be a learning moment
      await companion.generateResponse("I want to learn about quantum physics and its applications in computing");
      
      const updatedMemoryCount = companion.getState().memory.experiences.length;
      expect(updatedMemoryCount).toBeGreaterThan(initialMemoryCount);
    });

    it('should assign appropriate importance scores to memories', async () => {
      await companion.generateResponse("Please remember that my birthday is next month, it's very important to me");
      
      const memories = companion.getState().memory.experiences;
      const latestMemory = memories[memories.length - 1];
      
      expect(latestMemory.importance).toBeGreaterThan(0.5);
    });

    it('should limit memory storage to prevent unlimited growth', async () => {
      // Add many experiences to test memory limit
      const manyExperiences = Array.from({ length: 105 }, (_, i) => ({
        id: `test-${i}`,
        timestamp: new Date(),
        summary: `Test memory ${i}`,
        emotionalContext: 'neutral',
        importance: Math.random()
      }));

      companion.getState().memory.experiences.push(...manyExperiences);
      
      // Create a new significant interaction
      await companion.generateResponse("This is extremely important information that I need you to remember forever");
      
      const memories = companion.getState().memory.experiences;
      expect(memories.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Personality Evolution', () => {
    it('should allow personality trait evolution', () => {
      const initialCuriosity = companion.getState().personality.traits.curiosity;
      
      companion.evolvePersonality({ curiosity: 0.1 });
      
      const updatedCuriosity = companion.getState().personality.traits.curiosity;
      expect(updatedCuriosity).toBeGreaterThan(initialCuriosity);
    });

    it('should emit personality evolution events', () => {
      const eventListener = vi.fn();
      companion.addEventListener(eventListener);
      
      companion.evolvePersonality({ empathy: 0.05 });
      
      const evolutionEvents = eventListener.mock.calls.filter(
        call => call[0].type === 'personality_evolved'
      );
      expect(evolutionEvents.length).toBe(1);
      expect(evolutionEvents[0][0].trait).toBe('empathy');
    });

    it('should respect trait bounds (0-1)', () => {
      // Test upper bound
      companion.evolvePersonality({ curiosity: 0.5 }); // Should cap at 1.0
      let updatedCuriosity = companion.getState().personality.traits.curiosity;
      expect(updatedCuriosity).toBeLessThanOrEqual(1.0);

      // Test lower bound
      companion.evolvePersonality({ curiosity: -2.0 }); // Should not go below 0.0
      updatedCuriosity = companion.getState().personality.traits.curiosity;
      expect(updatedCuriosity).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe('Event System', () => {
    it('should emit message_sent events', async () => {
      const eventListener = vi.fn();
      companion.addEventListener(eventListener);
      
      await companion.generateResponse("Hello!");
      
      const messageEvents = eventListener.mock.calls.filter(
        call => call[0].type === 'message_sent'
      );
      expect(messageEvents.length).toBe(1);
      expect(messageEvents[0][0].message.content).toBeTruthy();
    });

    it('should emit memory_formed events for learning moments', async () => {
      const eventListener = vi.fn();
      companion.addEventListener(eventListener);
      
      await companion.generateResponse("Can you teach me about machine learning algorithms and their applications?");
      
      const memoryEvents = eventListener.mock.calls.filter(
        call => call[0].type === 'memory_formed'
      );
      expect(memoryEvents.length).toBeGreaterThan(0);
    });

    it('should handle multiple event listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      companion.addEventListener(listener1);
      companion.addEventListener(listener2);
      
      companion.evolvePersonality({ playfulness: 0.1 });
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('Emotional Intelligence', () => {
    it('should detect emotional tones in user messages', async () => {
      const excitedResponse = await companion.generateResponse("I'm so excited about this!");
      const curiousResponse = await companion.generateResponse("What do you think about this?");
      const sadResponse = await companion.generateResponse("I'm feeling really sad today");

      expect(excitedResponse.emotionalTone).toBe('excited');
      expect(curiousResponse.emotionalTone).toBe('curious');
      expect(sadResponse.emotionalTone).toBe('concerned');
    });

    it('should adjust responses based on detected emotions', async () => {
      const sadUserMessage = "I'm having a really difficult day and feeling down";
      const response = await companion.generateResponse(sadUserMessage);
      
      expect(response.emotionalTone).toBe('concerned');
      expect(response.content.toLowerCase()).toContain('feel' || 'support' || 'here');
    });
  });

  describe('Context Awareness', () => {
    it('should consider time of day in responses', async () => {
      const morningResponse = await companion.generateResponse("Good morning!", {
        timeOfDay: 'morning'
      });
      
      const nightResponse = await companion.generateResponse("Good evening!", {
        timeOfDay: 'night'
      });

      // Both should be valid responses
      expect(morningResponse.content).toBeTruthy();
      expect(nightResponse.content).toBeTruthy();
    });

    it('should incorporate emotional cues from context', async () => {
      const response = await companion.generateResponse("Hello", {
        emotionalCue: 'excited'
      });

      expect(response.content).toBeTruthy();
      // Should consider the emotional context in response generation
    });
  });
});