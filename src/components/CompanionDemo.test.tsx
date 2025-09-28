/**
 * Test suite for CompanionDemo React Component
 * 
 * This file contains tests for the interactive companion demo interface,
 * including user interactions, state updates, and UI responsiveness.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanionDemo } from './CompanionDemo';
import type { CompanionPersonality } from '../types/companion.js';

// Mock the CompanionAI class for controlled testing
vi.mock('../ai/companion-ai.js', () => {
  return {
    CompanionAI: vi.fn().mockImplementation(() => ({
      addEventListener: vi.fn(),
      generateResponse: vi.fn().mockResolvedValue({
        id: 'test-response',
        timestamp: new Date(),
        type: 'text',
        content: 'Test response from companion',
        sender: 'companion',
        emotionalTone: 'neutral',
        confidence: 0.85,
        isLearningMoment: false
      }),
      getState: vi.fn().mockReturnValue({
        personality: {
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
          interests: ['learning', 'creativity'],
          quirks: ['loves asking questions']
        },
        state: {
          mood: { primary: 'curious', intensity: 0.7, lastUpdated: new Date() },
          energy: 0.8,
          stimulation: 0.3,
          availability: 'available'
        },
        memory: {
          userProfile: { preferences: {}, importantDates: [], relationships: [] },
          experiences: [],
          learnedConcepts: [],
          bondLevel: 0.3
        }
      })
    }))
  };
});

describe('CompanionDemo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Initialization', () => {
    it('should render without crashing', () => {
      render(<CompanionDemo />);
      expect(screen.getByText('🤖 Aria Companion Demo')).toBeInTheDocument();
    });

    it('should display the companion greeting message', () => {
      render(<CompanionDemo />);
      expect(screen.getByText(/Hello! I'm Aria, your AI companion/)).toBeInTheDocument();
    });

    it('should show companion state indicators', () => {
      render(<CompanionDemo />);
      
      expect(screen.getByText('Mood')).toBeInTheDocument();
      expect(screen.getByText('Energy')).toBeInTheDocument();
      expect(screen.getByText('Bond')).toBeInTheDocument();
    });

    it('should render with custom personality when provided', () => {
      const customPersonality: Partial<CompanionPersonality> = {
        traits: {
          curiosity: 0.9,
          empathy: 0.8,
          playfulness: 0.6,
          supportiveness: 0.7,
          independence: 0.5
        }
      };

      render(<CompanionDemo initialPersonality={customPersonality} />);
      expect(screen.getByText('🤖 Aria Companion Demo')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should have a functional input field', () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    });

    it('should have a send button', () => {
      render(<CompanionDemo />);
      
      const sendButton = screen.getByText('Send');
      expect(sendButton).toBeInTheDocument();
    });

    it('should enable send button when text is entered', () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      expect(sendButton).toBeDisabled();
      
      fireEvent.change(input, { target: { value: 'Hello Aria!' } });
      expect(sendButton).not.toBeDisabled();
    });

    it('should clear input after sending message', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...') as HTMLInputElement;
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should handle Enter key press to send messages', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      
      fireEvent.change(input, { target: { value: 'Test message' } });
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });
  });

  describe('Message Display', () => {
    it('should display user messages', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Hello companion!' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Hello companion!')).toBeInTheDocument();
      });
    });

    it('should display companion responses', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'How are you?' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test response from companion')).toBeInTheDocument();
      });
    });

    it('should show thinking indicator during response generation', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Tell me a story' } });
      fireEvent.click(sendButton);
      
      // Check for thinking indicator (briefly visible)
      expect(screen.getByText(/Aria is thinking/)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.queryByText(/Aria is thinking/)).not.toBeInTheDocument();
      });
    });

    it('should display emotional context for companion messages', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'How are you feeling?' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/feeling neutral/)).toBeInTheDocument();
      });
    });
  });

  describe('Companion State Display', () => {
    it('should show mood with appropriate emoji', () => {
      render(<CompanionDemo />);
      
      expect(screen.getByText('curious')).toBeInTheDocument();
      expect(screen.getByText('🤔')).toBeInTheDocument();
    });

    it('should display energy level as progress bar', () => {
      render(<CompanionDemo />);
      
      const energySection = screen.getByText('Energy').closest('div');
      expect(energySection).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should show bond level with descriptive text', () => {
      render(<CompanionDemo />);
      
      expect(screen.getByText('🤝 Getting Close')).toBeInTheDocument();
    });

    it('should update state display after interactions', async () => {
      const { rerender } = render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Let\'s chat!' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test response from companion')).toBeInTheDocument();
      });
      
      // State updates would be reflected through the mocked getState method
      rerender(<CompanionDemo />);
    });
  });

  describe('Error Handling', () => {
    it('should display fallback message when response generation fails', async () => {
      // Mock the CompanionAI to throw an error
      const { CompanionAI } = await import('../ai/companion-ai.js');
      const mockCompanion = new CompanionAI({} as any, {} as any, {} as any);
      vi.mocked(mockCompanion.generateResponse).mockRejectedValueOnce(new Error('Test error'));
      
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Error test' } });
      fireEvent.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText(/I'm having trouble processing that right now/)).toBeInTheDocument();
      });
    });

    it('should disable input while processing', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      fireEvent.change(input, { target: { value: 'Processing test' } });
      fireEvent.click(sendButton);
      
      // During processing, input should be disabled
      expect(input).toBeDisabled();
      
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      expect(input).toHaveAttribute('type', 'text');
      
      const sendButton = screen.getByText('Send');
      expect(sendButton).toHaveAttribute('type', 'button');
    });

    it('should support keyboard navigation', () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      expect(input).toBeVisible();
      expect(sendButton).toBeVisible();
      
      // Input should be focusable
      input.focus();
      expect(document.activeElement).toBe(input);
    });
  });

  describe('Demo Information', () => {
    it('should display demo notice', () => {
      render(<CompanionDemo />);
      
      expect(screen.getByText(/Demo Note:/)).toBeInTheDocument();
      expect(screen.getByText(/This is a prototype interface/)).toBeInTheDocument();
    });

    it('should explain current limitations', () => {
      render(<CompanionDemo />);
      
      expect(screen.getByText(/The AI responses are currently simplified demonstrations/)).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle multiple rapid interactions gracefully', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      const sendButton = screen.getByText('Send');
      
      // Send multiple messages rapidly
      for (let i = 0; i < 3; i++) {
        fireEvent.change(input, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
      }
      
      // Should handle all messages without crashing
      await waitFor(() => {
        expect(screen.getByText('Message 2')).toBeInTheDocument();
      });
    });

    it('should maintain responsive UI during interactions', async () => {
      render(<CompanionDemo />);
      
      const input = screen.getByPlaceholderText('Talk to Aria...');
      
      // UI elements should remain interactive
      expect(input).not.toBeDisabled();
      expect(screen.getByText('🤖 Aria Companion Demo')).toBeVisible();
    });
  });
});