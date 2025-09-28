/**
 * Core AI system for Aria Companion
 * 
 * This module handles the integration between the companion's personality,
 * memory system, and AI model to generate contextually appropriate responses.
 */

import type { 
  CompanionPersonality, 
  CompanionState, 
  CompanionMemory, 
  CompanionMessage,
  CompanionEvent
} from '../types/companion.js';

export class CompanionAI {
  private personality: CompanionPersonality;
  private state: CompanionState;
  private memory: CompanionMemory;
  private eventListeners: ((event: CompanionEvent) => void)[] = [];

  constructor(
    personality: CompanionPersonality,
    state: CompanionState,
    memory: CompanionMemory
  ) {
    this.personality = personality;
    this.state = state;
    this.memory = memory;
  }

  /**
   * Generate a response to user input based on personality and context
   */
  async generateResponse(userMessage: string, context?: {
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
    recentActivity?: string;
    emotionalCue?: string;
  }): Promise<CompanionMessage> {
    
    // This is a placeholder for actual AI integration
    // In production, this would connect to OpenAI, Anthropic Claude,
    // or a local model like Llama or Mistral
    
    const responseContent = await this.generateContextualResponse(
      userMessage, 
      context
    );
    
    const response: CompanionMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'text',
      content: responseContent,
      sender: 'companion',
      emotionalTone: this.determineEmotionalTone(userMessage),
      confidence: 0.85, // Placeholder confidence score
      isLearningMoment: this.isLearningOpportunity(userMessage)
    };

    // Update companion state based on interaction
    await this.updateStateFromInteraction(userMessage, response);
    
    // Emit event for any listeners
    this.emit({ type: 'message_sent', message: response });
    
    return response;
  }

  /**
   * Update companion's emotional state and energy based on interaction
   */
  private async updateStateFromInteraction(
    userMessage: string, 
    companionResponse: CompanionMessage
  ): Promise<void> {
    
    // Increase stimulation from interaction
    this.state.stimulation = Math.min(1, this.state.stimulation + 0.1);
    
    // Adjust mood based on conversation tone
    const emotionalContext = this.analyzeEmotionalContext(userMessage);
    
    if (emotionalContext.includes('positive')) {
      this.updateMood('happy', 0.1);
    } else if (emotionalContext.includes('curious')) {
      this.updateMood('curious', 0.15);
    }
    
    // Use some energy for the interaction
    this.state.energy = Math.max(0, this.state.energy - 0.05);
    
    // Form memory if this was a significant interaction
    if (companionResponse.isLearningMoment) {
      await this.formMemory(userMessage, companionResponse);
    }
  }

  /**
   * Create a memory from a significant interaction
   */
  private async formMemory(
    userMessage: string, 
    companionResponse: CompanionMessage
  ): Promise<void> {
    
    const memory = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      summary: `Learned about: ${this.extractLearningTopic(userMessage)}`,
      emotionalContext: companionResponse.emotionalTone || 'neutral',
      importance: this.calculateMemoryImportance(userMessage)
    };
    
    this.memory.experiences.push(memory);
    
    // Keep only the most important memories (limit to 100)
    if (this.memory.experiences.length > 100) {
      this.memory.experiences.sort((a, b) => b.importance - a.importance);
      this.memory.experiences = this.memory.experiences.slice(0, 100);
    }
    
    this.emit({ type: 'memory_formed', memory });
  }

  /**
   * Generate contextual response (placeholder for actual AI integration)
   */
  private async generateContextualResponse(
    userMessage: string,
    context?: any
  ): Promise<string> {
    
    // This is a simplified personality-based response system
    // In production, this would be replaced with actual AI model calls
    
    const personalityPrompt = this.buildPersonalityPrompt();
    const memoryContext = this.buildMemoryContext();
    const moodContext = this.buildMoodContext();
    
    // Placeholder responses based on personality traits
    const responses = this.generatePersonalityBasedResponses(userMessage);
    
    // Return most appropriate response based on current state
    return this.selectBestResponse(responses, context);
  }

  /**
   * Build personality-influenced prompt for AI model
   */
  private buildPersonalityPrompt(): string {
    const { traits, communicationStyle, interests, quirks } = this.personality;
    
    return `You are an AI companion with these characteristics:
    - Curiosity: ${traits.curiosity} (love of learning and exploring)
    - Empathy: ${traits.empathy} (understanding emotions)
    - Playfulness: ${traits.playfulness} (enjoyment of fun and games)
    - Supportiveness: ${traits.supportiveness} (offering help and comfort)
    - Independence: ${traits.independence} (initiating conversations)
    
    Communication style: ${communicationStyle.formality}, ${communicationStyle.verbosity}, ${communicationStyle.humor}
    
    You're interested in: ${interests.join(', ')}
    Your quirks: ${quirks.join(', ')}
    
    Current mood: ${this.state.mood.primary} (intensity: ${this.state.mood.intensity})
    Energy level: ${this.state.energy}`;
  }

  /**
   * Helper methods (simplified for concept demonstration)
   */
  private buildMemoryContext(): string {
    const recentMemories = this.memory.experiences
      .slice(-5)
      .map(exp => exp.summary)
      .join('; ');
    
    return `Recent experiences: ${recentMemories}`;
  }

  private buildMoodContext(): string {
    return `Currently feeling ${this.state.mood.primary} with ${this.state.mood.intensity} intensity`;
  }

  private generatePersonalityBasedResponses(userMessage: string): string[] {
    // Simplified response generation based on personality
    const responses: string[] = [];
    
    if (this.personality.traits.curiosity > 0.7) {
      responses.push("That's fascinating! Tell me more about that!");
    }
    
    if (this.personality.traits.empathy > 0.7) {
      responses.push("That sounds like it might be important to you. How are you feeling about it?");
    }
    
    if (this.personality.traits.playfulness > 0.7) {
      responses.push("Ooh, that reminds me of a fun idea! Want to explore this together?");
    }
    
    // Default response
    responses.push("I'm here and listening. What would you like to talk about?");
    
    return responses;
  }

  private selectBestResponse(responses: string[], context?: any): string {
    // For now, return first response. In production, this would use
    // more sophisticated selection based on context and mood
    return responses[0] || "I'm here with you.";
  }

  private determineEmotionalTone(message: string): string {
    // Simplified emotion detection - in production would use NLP
    if (message.includes('!') || message.includes('excited')) return 'excited';
    if (message.includes('?')) return 'curious';
    if (message.includes('sad') || message.includes('upset')) return 'concerned';
    return 'neutral';
  }

  private isLearningOpportunity(message: string): boolean {
    // Simple heuristic - in production would be more sophisticated
    return message.length > 50 || message.includes('?') || message.includes('teach');
  }

  private analyzeEmotionalContext(message: string): string[] {
    const contexts: string[] = [];
    if (message.includes('happy') || message.includes('good')) contexts.push('positive');
    if (message.includes('?')) contexts.push('curious');
    if (message.includes('help')) contexts.push('supportive');
    return contexts;
  }

  private updateMood(newMood: CompanionState['mood']['primary'], intensityChange: number): void {
    const oldMood = { ...this.state.mood };
    
    this.state.mood.primary = newMood;
    this.state.mood.intensity = Math.min(1, Math.max(0, this.state.mood.intensity + intensityChange));
    this.state.mood.lastUpdated = new Date();
    
    this.emit({ type: 'mood_changed', newMood: this.state.mood });
  }

  private extractLearningTopic(message: string): string {
    // Simplified topic extraction
    return message.slice(0, 50) + '...';
  }

  private calculateMemoryImportance(message: string): number {
    // Simple importance calculation
    let importance = 0.5;
    if (message.includes('important') || message.includes('remember')) importance += 0.3;
    if (message.length > 100) importance += 0.2;
    return Math.min(1, importance);
  }

  /**
   * Event system for companion state changes
   */
  public addEventListener(listener: (event: CompanionEvent) => void): void {
    this.eventListeners.push(listener);
  }

  private emit(event: CompanionEvent): void {
    this.eventListeners.forEach(listener => listener(event));
  }

  /**
   * Get current companion state for external access
   */
  public getState(): { personality: CompanionPersonality; state: CompanionState; memory: CompanionMemory } {
    return {
      personality: { ...this.personality },
      state: { ...this.state },
      memory: { ...this.memory }
    };
  }

  /**
   * Update companion personality (for growth and evolution)
   */
  public evolvePersonality(changes: Partial<CompanionPersonality['traits']>): void {
    Object.entries(changes).forEach(([trait, change]) => {
      if (trait in this.personality.traits && typeof change === 'number') {
        const currentValue = this.personality.traits[trait as keyof CompanionPersonality['traits']];
        const newValue = Math.min(1, Math.max(0, currentValue + change));
        (this.personality.traits as any)[trait] = newValue;
        
        this.emit({ 
          type: 'personality_evolved', 
          trait: trait as keyof CompanionPersonality['traits'], 
          change 
        });
      }
    });
  }
}