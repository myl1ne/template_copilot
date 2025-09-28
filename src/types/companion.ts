/**
 * Core type definitions for Aria AI Companion
 * 
 * This file defines the fundamental types that represent
 * the companion's personality, state, and interactions.
 */

export interface CompanionPersonality {
  /** Core personality traits that influence behavior */
  traits: {
    curiosity: number;      // 0-1: How eager to learn and explore
    empathy: number;        // 0-1: How well they understand emotions  
    playfulness: number;    // 0-1: How much they enjoy games and fun
    supportiveness: number; // 0-1: How much they offer help and comfort
    independence: number;   // 0-1: How much they initiate conversations
  };
  
  /** Preferred communication style */
  communicationStyle: {
    formality: 'casual' | 'formal' | 'adaptive';
    verbosity: 'concise' | 'balanced' | 'detailed';
    humor: 'dry' | 'playful' | 'gentle' | 'none';
  };
  
  /** Areas of interest that the companion gravitates toward */
  interests: string[];
  
  /** Unique quirks that make this companion special */
  quirks: string[];
}

export interface CompanionState {
  /** Current emotional state */
  mood: {
    primary: 'happy' | 'curious' | 'content' | 'excited' | 'thoughtful' | 'concerned';
    intensity: number; // 0-1
    lastUpdated: Date;
  };
  
  /** Energy level affects interaction availability */
  energy: number; // 0-1
  
  /** How much the companion has learned recently */
  stimulation: number; // 0-1, increases with interaction
  
  /** Current activity or focus */
  currentActivity?: string;
  
  /** Time-based availability */
  availability: 'available' | 'busy' | 'sleeping' | 'away';
}

export interface CompanionMemory {
  /** Important facts about the user */
  userProfile: {
    name?: string;
    preferences: Record<string, any>;
    importantDates: { date: Date; description: string; }[];
    relationships: string[];
  };
  
  /** Significant conversations and experiences */
  experiences: {
    id: string;
    timestamp: Date;
    summary: string;
    emotionalContext: string;
    importance: number; // 0-1
  }[];
  
  /** Skills and knowledge gained */
  learnedConcepts: string[];
  
  /** Relationship progression with user */
  bondLevel: number; // 0-1, grows over time
}

export interface CompanionMessage {
  id: string;
  timestamp: Date;
  type: 'text' | 'emotion' | 'action' | 'system';
  content: string;
  sender: 'user' | 'companion';
  
  /** Emotional context of the message */
  emotionalTone?: string;
  
  /** AI confidence in the response */
  confidence?: number; // 0-1
  
  /** Whether this message is part of a learning experience */
  isLearningMoment?: boolean;
}

export interface CompanionInteraction {
  /** The companion's unique identifier */
  companionId: string;
  
  /** Current personality configuration */
  personality: CompanionPersonality;
  
  /** Current state and mood */
  state: CompanionState;
  
  /** Memory and learned experiences */
  memory: CompanionMemory;
  
  /** Conversation history */
  messages: CompanionMessage[];
  
  /** Session metadata */
  session: {
    startedAt: Date;
    lastActiveAt: Date;
    interactionCount: number;
  };
}

/** Configuration for creating a new companion */
export interface CompanionConfig {
  name?: string;
  personalityPreset?: 'curious' | 'gentle' | 'playful' | 'wise' | 'custom';
  customPersonality?: Partial<CompanionPersonality>;
  privacyMode: 'local-only' | 'cloud-sync' | 'hybrid';
}

/** Events that can occur during companion interactions */
export type CompanionEvent = 
  | { type: 'message_sent'; message: CompanionMessage }
  | { type: 'mood_changed'; newMood: CompanionState['mood'] }
  | { type: 'memory_formed'; memory: CompanionMemory['experiences'][0] }
  | { type: 'skill_learned'; concept: string }
  | { type: 'bond_strengthened'; newLevel: number }
  | { type: 'personality_evolved'; trait: keyof CompanionPersonality['traits']; change: number };