/**
 * Demo component showcasing Aria companion interaction
 * 
 * This is a prototype/concept demonstration of how users
 * will interact with their AI companion.
 */

import React, { useState, useEffect } from 'react';
import { CompanionAI } from '../ai/companion-ai.js';
import { AdvancedFeaturesDemo } from './AdvancedFeaturesDemo.js';
import type { 
  CompanionPersonality, 
  CompanionState, 
  CompanionMemory, 
  CompanionMessage,
  CompanionEvent 
} from '../types/companion.js';

interface CompanionDemoProps {
  /** Initial personality configuration */
  initialPersonality?: Partial<CompanionPersonality>;
}

export const CompanionDemo: React.FC<CompanionDemoProps> = ({ 
  initialPersonality 
}) => {
  const [companion, setCompanion] = useState<CompanionAI | null>(null);
  const [messages, setMessages] = useState<CompanionMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [companionState, setCompanionState] = useState<{
    mood: string;
    energy: number;
    bondLevel: number;
  } | null>(null);

  // Initialize companion on component mount
  useEffect(() => {
    const defaultPersonality: CompanionPersonality = {
      traits: {
        curiosity: 0.8,
        empathy: 0.9,
        playfulness: 0.7,
        supportiveness: 0.8,
        independence: 0.6
      },
      communicationStyle: {
        formality: 'casual',
        verbosity: 'balanced',
        humor: 'gentle'
      },
      interests: ['learning', 'creativity', 'personal growth', 'technology'],
      quirks: ['loves asking thoughtful questions', 'remembers small details', 'celebrates user achievements']
    };

    const initialState: CompanionState = {
      mood: {
        primary: 'curious',
        intensity: 0.7,
        lastUpdated: new Date()
      },
      energy: 0.9,
      stimulation: 0.3,
      availability: 'available'
    };

    const initialMemory: CompanionMemory = {
      userProfile: {
        preferences: {},
        importantDates: [],
        relationships: []
      },
      experiences: [],
      learnedConcepts: [],
      bondLevel: 0.2
    };

    const ariaCompanion = new CompanionAI(
      { ...defaultPersonality, ...initialPersonality },
      initialState,
      initialMemory
    );

    // Listen to companion events
    ariaCompanion.addEventListener((event: CompanionEvent) => {
      console.log('Companion event:', event);
      
      if (event.type === 'message_sent') {
        setMessages(prev => [...prev, event.message]);
      } else if (event.type === 'mood_changed') {
        updateCompanionStateDisplay(ariaCompanion);
      }
    });

    setCompanion(ariaCompanion);
    updateCompanionStateDisplay(ariaCompanion);

    // Add initial greeting message
    const greetingMessage: CompanionMessage = {
      id: 'greeting',
      timestamp: new Date(),
      type: 'text',
      content: "Hello! I'm Aria, your AI companion. I'm excited to get to know you! What would you like to talk about?",
      sender: 'companion',
      emotionalTone: 'excited'
    };
    setMessages([greetingMessage]);

  }, [initialPersonality]);

  const updateCompanionStateDisplay = (ariaCompanion: CompanionAI) => {
    const state = ariaCompanion.getState();
    setCompanionState({
      mood: state.state.mood.primary,
      energy: state.state.energy,
      bondLevel: state.memory.bondLevel
    });
  };

  const handleSendMessage = async () => {
    if (!companion || !inputValue.trim()) return;

    const userMessage: CompanionMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'text',
      content: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);

    try {
      // Generate companion response
      const response = await companion.generateResponse(inputValue, {
        timeOfDay: getTimeOfDay(),
        emotionalCue: detectEmotionalCue(inputValue)
      });
      
      // Message is added via event listener
      updateCompanionStateDisplay(companion);
      
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback response
      const fallbackResponse: CompanionMessage = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'text',
        content: "I'm having trouble processing that right now, but I'm still here with you. Could you try saying it differently?",
        sender: 'companion',
        emotionalTone: 'concerned'
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    }
    
    setIsThinking(false);
  };

  const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  };

  const detectEmotionalCue = (message: string): string => {
    if (message.includes('!') || message.includes('excited')) return 'excited';
    if (message.includes('sad') || message.includes('down')) return 'sad';
    if (message.includes('?')) return 'curious';
    return 'neutral';
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>🤖 Aria Companion Demo</h1>
        <p style={{ margin: 0, opacity: 0.9 }}>
          Experience the future of AI companionship
        </p>
      </div>

      {/* Companion Status */}
      {companionState && (
        <div style={{
          background: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          <div>
            <strong>Mood</strong><br />
            <span style={{ fontSize: '1.2em' }}>
              {companionState.mood} {getMoodEmoji(companionState.mood)}
            </span>
          </div>
          <div>
            <strong>Energy</strong><br />
            <div style={{ 
              width: '60px', 
              height: '8px', 
              background: '#e9ecef', 
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '5px auto'
            }}>
              <div style={{
                width: `${companionState.energy * 100}%`,
                height: '100%',
                background: getEnergyColor(companionState.energy),
                transition: 'width 0.3s'
              }} />
            </div>
            {Math.round(companionState.energy * 100)}%
          </div>
          <div>
            <strong>Bond</strong><br />
            <span style={{ fontSize: '1.2em' }}>
              {getBondLevel(companionState.bondLevel)}
            </span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div style={{
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        height: '400px',
        overflowY: 'auto',
        padding: '15px',
        background: 'white',
        marginBottom: '15px'
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              marginBottom: '15px',
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '10px 15px',
              borderRadius: '18px',
              background: message.sender === 'user' ? '#007bff' : '#f8f9fa',
              color: message.sender === 'user' ? 'white' : '#333',
              border: message.sender === 'companion' ? '1px solid #e9ecef' : 'none'
            }}>
              <div style={{ fontSize: '14px' }}>
                {message.content}
              </div>
              {message.emotionalTone && message.sender === 'companion' && (
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.7, 
                  marginTop: '5px',
                  fontStyle: 'italic'
                }}>
                  feeling {message.emotionalTone} {getEmotionEmoji(message.emotionalTone)}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 15px',
              borderRadius: '18px',
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              fontStyle: 'italic',
              opacity: 0.7
            }}>
              Aria is thinking... 💭
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Talk to Aria..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #e9ecef',
            borderRadius: '20px',
            outline: 'none',
            fontSize: '16px'
          }}
          disabled={isThinking}
        />
        <button
          onClick={handleSendMessage}
          disabled={isThinking || !inputValue.trim()}
          style={{
            padding: '12px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: isThinking ? 'not-allowed' : 'pointer',
            opacity: isThinking || !inputValue.trim() ? 0.6 : 1
          }}
        >
          Send
        </button>
      </div>

      {/* Advanced Features Demo */}
      {companion && <AdvancedFeaturesDemo companion={companion} />}

      {/* Demo Info */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <strong>Demo Note:</strong> This is a prototype interface showing Aria's planned interaction system. 
        The AI responses are currently simplified demonstrations. Full AI integration with personality-driven 
        responses will be implemented in the next development phase.
      </div>
    </div>
  );
};

// Helper functions for UI display
const getMoodEmoji = (mood: string): string => {
  const moodEmojis: Record<string, string> = {
    happy: '😊',
    curious: '🤔',
    content: '😌',
    excited: '🤩',
    thoughtful: '💭',
    concerned: '🥺'
  };
  return moodEmojis[mood] || '😊';
};

const getEnergyColor = (energy: number): string => {
  if (energy > 0.7) return '#28a745';
  if (energy > 0.4) return '#ffc107';
  return '#dc3545';
};

const getBondLevel = (bond: number): string => {
  if (bond < 0.2) return '👋 New Friend';
  if (bond < 0.5) return '🤝 Getting Close';
  if (bond < 0.8) return '💙 Good Friend';
  return '💜 Best Friend';
};

const getEmotionEmoji = (emotion: string): string => {
  const emotionEmojis: Record<string, string> = {
    excited: '🎉',
    curious: '🤔',
    concerned: '🥺',
    neutral: '😊'
  };
  return emotionEmojis[emotion] || '';
};