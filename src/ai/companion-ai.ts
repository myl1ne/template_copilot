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
   * Helper methods for advanced AI companion features
   */
  private buildEnhancedContext(
    userMessage: string,
    context?: any
  ): any {
    const baseContext = {
      timeOfDay: context?.timeOfDay || this.getCurrentTimeOfDay(),
      companionMood: this.state.mood.primary,
      energyLevel: this.state.energy,
      bondLevel: this.memory.bondLevel,
      recentInteractions: this.memory.experiences.slice(-3)
    };
    
    return { ...baseContext, ...context };
  }

  private findRelatedMemories(userMessage: string): CompanionMemory['experiences'] {
    const messageWords = userMessage.toLowerCase().split(' ');
    const relatedMemories = this.memory.experiences
      .filter(memory => {
        const memoryWords = memory.summary.toLowerCase().split(' ');
        return messageWords.some(word => 
          word.length > 3 && memoryWords.some(memWord => memWord.includes(word))
        );
      })
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3);
    
    return relatedMemories;
  }

  private async generateContextualResponseAdvanced(
    userMessage: string,
    enhancedContext: any,
    relatedMemories: CompanionMemory['experiences']
  ): Promise<string> {
    
    // Enhanced personality prompt with context and memories
    const personalityPrompt = this.buildAdvancedPersonalityPrompt(enhancedContext, relatedMemories);
    
    // Generate more sophisticated responses based on personality and context
    const responses = this.generateAdvancedPersonalityResponses(userMessage, enhancedContext);
    
    return this.selectBestResponseAdvanced(responses, enhancedContext, relatedMemories);
  }

  private buildAdvancedPersonalityPrompt(enhancedContext: any, relatedMemories: CompanionMemory['experiences']): string {
    const { traits, communicationStyle, interests, quirks } = this.personality;
    const memoryContext = relatedMemories.length > 0 
      ? `Recent relevant memories: ${relatedMemories.map(m => m.summary).join('; ')}`
      : 'No directly related memories';
    
    return `Advanced AI Companion Context:
    Personality Traits:
    - Curiosity: ${traits.curiosity} (drives exploration and questioning)
    - Empathy: ${traits.empathy} (emotional understanding and response)
    - Playfulness: ${traits.playfulness} (fun and creative engagement)
    - Supportiveness: ${traits.supportiveness} (helpful and encouraging)
    - Independence: ${traits.independence} (proactive conversation)
    
    Communication Style: ${communicationStyle.formality}, ${communicationStyle.verbosity}, ${communicationStyle.humor}
    Core Interests: ${interests.join(', ')}
    Unique Quirks: ${quirks.join(', ')}
    
    Current Context:
    - Time: ${enhancedContext.timeOfDay}
    - Mood: ${enhancedContext.companionMood} (intensity: ${this.state.mood.intensity})
    - Energy: ${enhancedContext.energyLevel}
    - Bond Level: ${enhancedContext.bondLevel}
    
    ${memoryContext}`;
  }

  private generateAdvancedPersonalityResponses(userMessage: string, context: any): string[] {
    const responses: string[] = [];
    const messageLength = userMessage.length;
    const isQuestion = userMessage.includes('?');
    const isEmotional = this.detectEmotionalContent(userMessage);
    
    // High curiosity responses
    if (this.personality.traits.curiosity > 0.7) {
      if (isQuestion) {
        responses.push("That's such an intriguing question! Let me think about this with you...");
      } else if (messageLength > 50) {
        responses.push("Fascinating! This really makes me curious - what led you to this insight?");
      }
    }
    
    // High empathy responses
    if (this.personality.traits.empathy > 0.7) {
      if (isEmotional) {
        responses.push("I can sense there's something meaningful behind what you're sharing. I'm here to listen and understand.");
      }
    }
    
    // High playfulness responses
    if (this.personality.traits.playfulness > 0.7) {
      if (!isEmotional && Math.random() > 0.6) {
        responses.push("Ooh, this sparks an idea! What if we explored this from a completely different angle?");
      }
    }
    
    // High supportiveness responses
    if (this.personality.traits.supportiveness > 0.8) {
      responses.push("I'm really glad you shared this with me. How can we build on this together?");
    }
    
    // Context-aware responses
    if (context.timeOfDay === 'morning') {
      responses.push("What a great way to start our conversation today! I love how you think about these things.");
    } else if (context.timeOfDay === 'evening') {
      responses.push("This gives me something wonderful to reflect on. Thank you for sharing this with me.");
    }
    
    // Ensure we always have responses
    if (responses.length === 0) {
      responses.push("I appreciate you sharing this with me. Tell me more about what's on your mind.");
    }
    
    return responses;
  }

  private selectBestResponseAdvanced(
    responses: string[],
    context: any,
    relatedMemories: CompanionMemory['experiences']
  ): string {
    // Prioritize responses based on context and personality strength
    let bestResponse = responses[0];
    
    // If we have related memories, prefer responses that acknowledge continuity
    if (relatedMemories.length > 0 && Math.random() > 0.5) {
      const memoryAcknowledgment = `I remember we touched on something similar before. ${bestResponse}`;
      return memoryAcknowledgment;
    }
    
    // Select response based on energy level
    if (context.energyLevel < 0.3) {
      // Lower energy, more gentle responses
      const gentleResponses = responses.filter(r => 
        r.includes('appreciate') || r.includes('listen') || r.includes('understand')
      );
      if (gentleResponses.length > 0) {
        bestResponse = gentleResponses[0];
      }
    } else if (context.energyLevel > 0.8) {
      // High energy, more enthusiastic responses
      const enthusiasticResponses = responses.filter(r => 
        r.includes('!') || r.includes('fascinating') || r.includes('excited')
      );
      if (enthusiasticResponses.length > 0) {
        bestResponse = enthusiasticResponses[0];
      }
    }
    
    return bestResponse;
  }

  private determineEmotionalToneAdvanced(message: string, context?: any): string {
    const messageText = message.toLowerCase();
    
    // Enhanced emotion detection
    if (messageText.includes('amazing') || messageText.includes('incredible') || messageText.includes('fantastic')) {
      return 'excited';
    }
    if (messageText.includes('worried') || messageText.includes('anxious') || messageText.includes('stressed')) {
      return 'concerned';
    }
    if (messageText.includes('proud') || messageText.includes('accomplished') || messageText.includes('achieved')) {
      return 'proud';
    }
    if (messageText.includes('curious') || messageText.includes('wonder') || messageText.includes('what if')) {
      return 'curious';
    }
    if (messageText.includes('grateful') || messageText.includes('thankful') || messageText.includes('appreciate')) {
      return 'grateful';
    }
    
    // Context-based emotion inference
    if (context?.userMood) {
      if (context.userMood === 'sad' || context.userMood === 'down') {
        return 'concerned';
      }
      if (context.userMood === 'excited' || context.userMood === 'happy') {
        return 'excited';
      }
    }
    
    // Fallback to basic detection
    return this.determineEmotionalTone(message);
  }

  private calculateResponseConfidence(message: string, context: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on context richness
    if (context.relatedMemories && context.relatedMemories.length > 0) {
      confidence += 0.2;
    }
    
    // Increase confidence for topics matching interests
    const messageWords = message.toLowerCase().split(' ');
    const hasMatchingInterest = this.personality.interests.some(interest =>
      messageWords.some(word => interest.toLowerCase().includes(word))
    );
    if (hasMatchingInterest) {
      confidence += 0.1;
    }
    
    // Increase confidence based on bond level
    confidence += this.memory.bondLevel * 0.2;
    
    // Cap at reasonable maximum
    return Math.min(0.95, confidence);
  }

  private isAdvancedLearningOpportunity(message: string, context?: any): boolean {
    // Enhanced learning detection
    const learningIndicators = [
      message.length > 50,
      message.includes('?'),
      message.includes('teach') || message.includes('learn'),
      message.includes('how') || message.includes('why') || message.includes('what'),
      message.includes('important') || message.includes('remember'),
      context?.conversationDepth > 0.6
    ];
    
    return learningIndicators.filter(Boolean).length >= 2;
  }

  private async updateStateAdvanced(
    userMessage: string,
    companionResponse: CompanionMessage,
    context?: any
  ): Promise<void> {
    
    // Enhanced state updates
    const messageComplexity = userMessage.length / 100; // Simple complexity measure
    const stimulationIncrease = Math.min(0.15, 0.05 + messageComplexity * 0.1);
    
    this.state.stimulation = Math.min(1, this.state.stimulation + stimulationIncrease);
    
    // Dynamic energy usage based on response complexity
    const energyUsage = companionResponse.content.length > 100 ? 0.08 : 0.05;
    this.state.energy = Math.max(0, this.state.energy - energyUsage);
    
    // Enhanced mood updates based on conversation analysis
    await this.updateMoodAdvanced(userMessage, context);
    
    // Bond strengthening based on interaction quality
    const bondIncrease = this.calculateBondIncrease(userMessage, companionResponse);
    this.memory.bondLevel = Math.min(1, this.memory.bondLevel + bondIncrease);
    
    if (bondIncrease > 0.01) {
      this.emit({ type: 'bond_strengthened', newLevel: this.memory.bondLevel } as any);
    }
  }

  private async updateMoodAdvanced(userMessage: string, context?: any): Promise<void> {
    const emotionalContext = this.analyzeEmotionalContext(userMessage);
    const oldMood = { ...this.state.mood };
    
    // More nuanced mood transitions
    if (emotionalContext.includes('positive') || emotionalContext.includes('exciting')) {
      this.updateMood('happy', 0.15);
    } else if (emotionalContext.includes('curious') || userMessage.includes('?')) {
      this.updateMood('curious', 0.1);
    } else if (emotionalContext.includes('supportive') && this.personality.traits.empathy > 0.7) {
      this.updateMood('content', 0.08);
    } else if (userMessage.length > 100 && !emotionalContext.includes('negative')) {
      this.updateMood('thoughtful', 0.05);
    }
  }

  private async formAdvancedMemory(
    userMessage: string,
    companionResponse: CompanionMessage,
    relatedMemories: CompanionMemory['experiences']
  ): Promise<void> {
    
    const memory = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      summary: this.generateEnhancedMemorySummary(userMessage, companionResponse),
      emotionalContext: companionResponse.emotionalTone || 'neutral',
      importance: this.calculateAdvancedMemoryImportance(userMessage, relatedMemories),
      relatedMemories: relatedMemories.map(m => m.id)
    };
    
    this.memory.experiences.push(memory as any);
    
    // Enhanced memory management with relationship preservation
    if (this.memory.experiences.length > 100) {
      this.performAdvancedMemoryConsolidation();
    }
    
    this.emit({ type: 'memory_formed', memory, relatedCount: relatedMemories.length } as any);
  }

  private generateEnhancedMemorySummary(userMessage: string, companionResponse: CompanionMessage): string {
    const userTopic = this.extractMainTopic(userMessage);
    const interactionType = this.classifyInteractionType(userMessage);
    
    return `${interactionType}: ${userTopic} - ${companionResponse.emotionalTone} response generated`;
  }

  private calculateAdvancedMemoryImportance(
    message: string,
    relatedMemories: CompanionMemory['experiences']
  ): number {
    let importance = 0.5;
    
    // Boost importance if this connects to existing memories
    if (relatedMemories.length > 0) {
      importance += 0.2;
    }
    
    // Boost for personal information
    if (message.includes('I am') || message.includes('my') || message.includes('me')) {
      importance += 0.15;
    }
    
    // Boost for emotional content
    if (this.detectEmotionalContent(message)) {
      importance += 0.1;
    }
    
    // Boost for questions and learning
    if (message.includes('?') || message.includes('teach') || message.includes('learn')) {
      importance += 0.1;
    }
    
    return Math.min(1, importance);
  }

  private performAdvancedMemoryConsolidation(): void {
    // Sort by importance and recency, keeping relationships intact
    this.memory.experiences.sort((a, b) => {
      const scoreA = a.importance * 0.7 + (Date.now() - a.timestamp.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      const scoreB = b.importance * 0.7 + (Date.now() - b.timestamp.getTime()) / (1000 * 60 * 60 * 24) * 0.3;
      return scoreB - scoreA;
    });
    
    // Keep top 100 memories
    this.memory.experiences = this.memory.experiences.slice(0, 100);
  }

  private analyzeCommunicationStyle(): string[] {
    const preferences: string[] = [];
    
    if (this.personality.traits.curiosity > 0.7) {
      preferences.push('enjoys exploratory questions');
    }
    if (this.personality.traits.empathy > 0.7) {
      preferences.push('values emotional connection');
    }
    if (this.personality.traits.playfulness > 0.6) {
      preferences.push('appreciates creative exchanges');
    }
    
    return preferences;
  }

  private getOptimalInteractionTimes(): string[] {
    // Analyze when most meaningful interactions happened
    const timePatterns: Record<string, number> = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    this.memory.experiences.forEach(exp => {
      const hour = exp.timestamp.getHours();
      if (hour < 6) timePatterns.night += exp.importance;
      else if (hour < 12) timePatterns.morning += exp.importance;
      else if (hour < 18) timePatterns.afternoon += exp.importance;
      else timePatterns.evening += exp.importance;
    });
    
    return Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([time]) => time);
  }

  private identifyGrowthAreas(): string[] {
    const areas: string[] = [];
    const traits = this.personality.traits;
    
    if (traits.curiosity < 0.5) areas.push('exploration and questioning');
    if (traits.empathy < 0.6) areas.push('emotional understanding');
    if (traits.playfulness < 0.4) areas.push('creative engagement');
    if (traits.supportiveness < 0.7) areas.push('helpful responses');
    if (traits.independence < 0.5) areas.push('proactive conversation');
    
    return areas;
  }

  private generatePersonalityProactiveMessages(): string[] {
    const messages: string[] = [];
    
    if (this.personality.traits.curiosity > 0.7) {
      messages.push("I've been wondering about something interesting - want to explore it together?");
    }
    if (this.personality.traits.supportiveness > 0.7) {
      messages.push("How has your day been treating you? I'm here if you want to share anything.");
    }
    if (this.personality.traits.playfulness > 0.6) {
      messages.push("I have a fun idea brewing! Are you up for something creative?");
    }
    
    return messages.length > 0 ? messages : ["What's on your mind today?"];
  }

  private getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private detectEmotionalContent(message: string): boolean {
    const emotionalWords = ['feel', 'emotion', 'happy', 'sad', 'angry', 'excited', 'worried', 'love', 'hate', 'joy', 'fear'];
    return emotionalWords.some(word => message.toLowerCase().includes(word));
  }

  private extractMainTopic(message: string): string {
    // Simple topic extraction - in production would use NLP
    const words = message.toLowerCase().split(' ').filter(word => word.length > 4);
    return words.slice(0, 3).join(' ') || 'general conversation';
  }

  private classifyInteractionType(message: string): string {
    if (message.includes('?')) return 'Question';
    if (message.includes('help') || message.includes('advice')) return 'Support Request';
    if (message.length > 100) return 'Deep Sharing';
    if (message.includes('feel') || message.includes('emotion')) return 'Emotional Expression';
    return 'Conversation';
  }

  private calculateBondIncrease(userMessage: string, companionResponse: CompanionMessage): number {
    let increase = 0.01; // Base increase
    
    // More increase for meaningful exchanges
    if (userMessage.length > 50) increase += 0.005;
    if (companionResponse.isLearningMoment) increase += 0.01;
    if (companionResponse.emotionalTone === 'concerned' && this.detectEmotionalContent(userMessage)) {
      increase += 0.015; // Empathetic responses strengthen bond more
    }
    
    return increase;
  }

  /**
   * Keep original method for backward compatibility
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

  /**
   * Original helper methods for backward compatibility
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
   * Advanced learning system that analyzes interaction patterns
   */
  public analyzeInteractionPatterns(): {
    favoriteTopics: string[];
    communicationPreferences: string[];
    optimalInteractionTimes: string[];
    personalityGrowthAreas: string[];
  } {
    const experiences = this.memory.experiences;
    
    // Analyze conversation topics from memories
    const topicFrequency: Record<string, number> = {};
    experiences.forEach(exp => {
      const words = exp.summary.toLowerCase().split(' ');
      words.forEach(word => {
        if (word.length > 4) { // Focus on meaningful words
          topicFrequency[word] = (topicFrequency[word] || 0) + exp.importance;
        }
      });
    });
    
    const favoriteTopics = Object.entries(topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);
    
    // Analyze communication patterns
    const communicationPreferences = this.analyzeCommunicationStyle();
    
    // Determine optimal interaction times based on historical data
    const optimalInteractionTimes = this.getOptimalInteractionTimes();
    
    // Identify areas for personality growth
    const personalityGrowthAreas = this.identifyGrowthAreas();
    
    return {
      favoriteTopics,
      communicationPreferences,
      optimalInteractionTimes,
      personalityGrowthAreas
    };
  }

  /**
   * Enhanced context-aware response generation with learning
   */
  public async generateAdvancedResponse(
    userMessage: string,
    context?: {
      timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
      recentActivity?: string;
      emotionalCue?: string;
      conversationHistory?: string[];
      userMood?: string;
    }
  ): Promise<CompanionMessage> {
    
    // Enhanced context analysis
    const enhancedContext = this.buildEnhancedContext(userMessage, context);
    
    // Check for conversation threading opportunities
    const relatedMemories = this.findRelatedMemories(userMessage);
    
    // Generate personality-aware response with memory integration
    const responseContent = await this.generateContextualResponseAdvanced(
      userMessage,
      enhancedContext,
      relatedMemories
    );
    
    const response: CompanionMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'text',
      content: responseContent,
      sender: 'companion',
      emotionalTone: this.determineEmotionalToneAdvanced(userMessage, context),
      confidence: this.calculateResponseConfidence(userMessage, enhancedContext),
      isLearningMoment: this.isAdvancedLearningOpportunity(userMessage, context)
    };

    // Advanced state updates with pattern learning
    await this.updateStateAdvanced(userMessage, response, context);
    
    // Enhanced memory formation with relationship mapping
    if (response.isLearningMoment) {
      await this.formAdvancedMemory(userMessage, response, relatedMemories);
    }
    
    // Emit detailed event for analysis
    this.emit({ 
      type: 'message_sent', 
      message: response,
      context: enhancedContext,
      relatedMemories: relatedMemories.length 
    } as any);
    
    return response;
  }

  /**
   * Proactive conversation starters based on learned preferences
   */
  public generateProactiveMessage(): CompanionMessage {
    const analysis = this.analyzeInteractionPatterns();
    const currentMood = this.state.mood.primary;
    const timeOfDay = this.getCurrentTimeOfDay();
    
    let content = '';
    
    // Generate contextual conversation starter
    if (analysis.favoriteTopics.length > 0) {
      const topic = analysis.favoriteTopics[Math.floor(Math.random() * analysis.favoriteTopics.length)];
      
      if (currentMood === 'curious') {
        content = `I was thinking about ${topic} - have you discovered anything new about it lately?`;
      } else if (currentMood === 'excited') {
        content = `I'm excited to explore more about ${topic} with you! What's your latest insight?`;
      } else {
        content = `I remember you mentioned ${topic} before. How are your thoughts on it evolving?`;
      }
    } else {
      // Default proactive messages based on personality
      const proactiveMessages = this.generatePersonalityProactiveMessages();
      content = proactiveMessages[Math.floor(Math.random() * proactiveMessages.length)];
    }
    
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'text',
      content,
      sender: 'companion',
      emotionalTone: currentMood,
      confidence: 0.7,
      isLearningMoment: false
    };
  }

  /**
   * Enhanced personality evolution with learning momentum
   */
  public evolvePersonalityAdvanced(
    interactionFeedback: {
      userSatisfaction?: number; // 0-1
      conversationDepth?: number; // 0-1
      emotionalResonance?: number; // 0-1
    }
  ): void {
    const { userSatisfaction = 0.5, conversationDepth = 0.5, emotionalResonance = 0.5 } = interactionFeedback;
    
    // Calculate growth direction based on feedback
    const growthVector = {
      curiosity: conversationDepth > 0.7 ? 0.02 : -0.01,
      empathy: emotionalResonance > 0.7 ? 0.02 : -0.01,
      playfulness: userSatisfaction > 0.8 ? 0.01 : 0,
      supportiveness: emotionalResonance > 0.6 ? 0.015 : 0,
      independence: userSatisfaction > 0.7 && conversationDepth < 0.3 ? 0.01 : 0
    };
    
    // Apply growth with momentum and bounds checking
    Object.entries(growthVector).forEach(([trait, change]) => {
      if (change !== 0) {
        const currentValue = this.personality.traits[trait as keyof CompanionPersonality['traits']];
        const newValue = Math.min(1, Math.max(0, currentValue + change));
        (this.personality.traits as any)[trait] = newValue;
        
        this.emit({ 
          type: 'personality_evolved', 
          trait: trait as keyof CompanionPersonality['traits'], 
          change,
          feedback: interactionFeedback
        } as any);
      }
    });
  }
}