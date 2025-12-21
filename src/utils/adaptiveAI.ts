// Adaptive AI behavior engine for personalized responses

import { sessionState } from './sessionState';

interface AIResponse {
  message: string;
  suggestions?: string[];
  confidence: number;
  reasoning?: string;
}

interface ConversationContext {
  topic: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'simple' | 'moderate' | 'detailed';
  userIntent: string;
}

class AdaptiveAIEngine {
  private conversationHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }> = [];
  private topicKnowledge: Map<string, number> = new Map();

  // Generate adaptive response based on user input and context
  generateResponse(userInput: string, context?: any): AIResponse {
    const sessionContext = sessionState.getPersonalizationContext();
    const conversationContext = this.analyzeInput(userInput);
    
    // Update topic knowledge
    this.updateTopicKnowledge(conversationContext.topic);

    // Build response based on multiple factors
    const response = this.buildContextualResponse(
      userInput,
      conversationContext,
      sessionContext,
      context
    );

    // Store in conversation history
    this.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: Date.now(),
    });
    this.conversationHistory.push({
      role: 'assistant',
      content: response.message,
      timestamp: Date.now(),
    });

    // Keep only last 20 messages
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    return response;
  }

  private analyzeInput(input: string): ConversationContext {
    const lowerInput = input.toLowerCase();

    // Detect topic
    let topic = 'general';
    if (lowerInput.includes('routine') || lowerInput.includes('step')) topic = 'routine';
    else if (lowerInput.includes('product') || lowerInput.includes('recommend')) topic = 'products';
    else if (lowerInput.includes('ingredient') || lowerInput.includes('chemical')) topic = 'ingredients';
    else if (lowerInput.includes('skin') || lowerInput.includes('concern')) topic = 'skin-analysis';
    else if (lowerInput.includes('acne') || lowerInput.includes('wrinkle') || lowerInput.includes('dark spot')) topic = 'concerns';

    // Detect sentiment
    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    const positiveWords = ['good', 'great', 'love', 'happy', 'better', 'improved', 'thank'];
    const negativeWords = ['bad', 'worse', 'hate', 'problem', 'issue', 'concern', 'worried'];
    
    if (positiveWords.some(word => lowerInput.includes(word))) sentiment = 'positive';
    else if (negativeWords.some(word => lowerInput.includes(word))) sentiment = 'negative';

    // Detect complexity preference
    let complexity: 'simple' | 'moderate' | 'detailed' = 'moderate';
    if (lowerInput.includes('simple') || lowerInput.includes('quick') || lowerInput.includes('brief')) {
      complexity = 'simple';
    } else if (lowerInput.includes('detail') || lowerInput.includes('explain') || lowerInput.includes('why')) {
      complexity = 'detailed';
    }

    // Detect user intent
    let userIntent = 'information';
    if (lowerInput.includes('how') || lowerInput.includes('what')) userIntent = 'learning';
    else if (lowerInput.includes('recommend') || lowerInput.includes('suggest')) userIntent = 'recommendation';
    else if (lowerInput.includes('help') || lowerInput.includes('problem')) userIntent = 'troubleshooting';
    else if (lowerInput.includes('compare') || lowerInput.includes('difference')) userIntent = 'comparison';

    return { topic, sentiment, complexity, userIntent };
  }

  private updateTopicKnowledge(topic: string): void {
    const current = this.topicKnowledge.get(topic) || 0;
    this.topicKnowledge.set(topic, current + 1);
  }

  private buildContextualResponse(
    userInput: string,
    conversationContext: ConversationContext,
    sessionContext: any,
    additionalContext?: any
  ): AIResponse {
    const { preferences, patterns } = sessionContext;
    const { topic, sentiment, complexity, userIntent } = conversationContext;

    // Adapt tone based on preferences and sentiment
    const tone = preferences.aiTone || 'friendly';
    let greeting = '';
    
    if (sentiment === 'positive') {
      greeting = tone === 'friendly' ? "That's wonderful! " : "Excellent. ";
    } else if (sentiment === 'negative') {
      greeting = tone === 'friendly' ? "I understand your concern. " : "I see. ";
    }

    // Build response based on topic and intent
    let message = greeting;
    const suggestions: string[] = [];

    switch (topic) {
      case 'routine':
        message += this.generateRoutineResponse(userInput, preferences, complexity, userIntent);
        suggestions.push('Show me routine examples', 'Check for ingredient conflicts', 'Optimize my routine order');
        break;

      case 'products':
        message += this.generateProductResponse(userInput, preferences, complexity, userIntent, patterns);
        suggestions.push('Find products for my skin type', 'Compare similar products', 'Show ingredient analysis');
        break;

      case 'ingredients':
        message += this.generateIngredientResponse(userInput, preferences, complexity, userIntent);
        suggestions.push('Explain this ingredient', 'Check ingredient safety', 'Find products with this ingredient');
        break;

      case 'skin-analysis':
        message += this.generateSkinAnalysisResponse(userInput, preferences, complexity, userIntent);
        suggestions.push('Update my skin profile', 'Track my progress', 'Get personalized recommendations');
        break;

      case 'concerns':
        message += this.generateConcernResponse(userInput, preferences, complexity, userIntent);
        suggestions.push('Find treatments for this concern', 'Learn about prevention', 'See success stories');
        break;

      default:
        message += this.generateGeneralResponse(userInput, preferences, complexity, patterns);
        suggestions.push('Tell me about my skin type', 'Recommend a routine', 'Find products for me');
    }

    // Add personalized context if available
    if (preferences.concerns && preferences.concerns.length > 0 && topic !== 'general') {
      message += ` Since you're focusing on ${preferences.concerns.join(' and ')}, `;
      message += this.addConcernSpecificAdvice(preferences.concerns[0], complexity);
    }

    // Calculate confidence based on context availability
    const confidence = this.calculateConfidence(preferences, patterns, topic);

    return {
      message,
      suggestions: suggestions.slice(0, 3),
      confidence,
      reasoning: `Based on your ${preferences.skinType || 'skin'} profile and ${patterns.engagementLevel} engagement`,
    };
  }

  private generateRoutineResponse(input: string, preferences: any, complexity: string, intent: string): string {
    const routinePreference = preferences.routinePreference || 'moderate';
    
    if (intent === 'recommendation') {
      if (complexity === 'simple') {
        return `For a ${routinePreference} routine, I recommend starting with cleanser, treatment, and moisturizer.`;
      } else {
        return `Based on your ${routinePreference} routine preference, here's what I suggest: Start with a gentle cleanser suited for ${preferences.skinType || 'your skin type'}, follow with targeted treatments for ${preferences.concerns?.[0] || 'your concerns'}, and finish with a moisturizer. ${routinePreference === 'extensive' ? 'You can also add serums, essences, and SPF for comprehensive care.' : ''}`;
      }
    } else if (intent === 'troubleshooting') {
      return `Let's optimize your routine. Common issues include using too many actives at once or incorrect product order. What specific problem are you experiencing?`;
    }
    
    return `I can help you build a personalized ${routinePreference} routine. What would you like to focus on?`;
  }

  private generateProductResponse(input: string, preferences: any, complexity: string, intent: string, patterns: any): string {
    const budget = preferences.budgetRange || 'mid';
    const skinType = preferences.skinType || 'combination';

    if (intent === 'recommendation') {
      if (complexity === 'simple') {
        return `I recommend ${budget}-range products suitable for ${skinType} skin.`;
      } else {
        const viewedCount = patterns.context?.viewedProducts?.length || 0;
        return `Based on your ${skinType} skin and ${budget} budget preference${viewedCount > 0 ? `, and the ${viewedCount} products you've viewed` : ''}, I can suggest products that match your needs. ${preferences.concerns ? `For ${preferences.concerns[0]}, look for ingredients like niacinamide or retinol.` : ''}`;
      }
    } else if (intent === 'comparison') {
      return `I'll help you compare products. What specific aspects matter most to you - ingredients, price, effectiveness, or user reviews?`;
    }

    return `I can recommend products tailored to your ${skinType} skin. What type of product are you looking for?`;
  }

  private generateIngredientResponse(input: string, preferences: any, complexity: string, intent: string): string {
    if (intent === 'learning') {
      if (complexity === 'simple') {
        return `This ingredient works by targeting specific skin concerns. Would you like to know if it's suitable for you?`;
      } else {
        return `Let me explain this ingredient in detail. It works at the cellular level to address concerns like ${preferences.concerns?.[0] || 'various skin issues'}. ${preferences.sensitivities ? `Given your sensitivities to ${preferences.sensitivities.join(', ')}, I'll also check for potential reactions.` : ''}`;
      }
    }

    return `I can provide detailed ingredient information. Which ingredient would you like to learn about?`;
  }

  private generateSkinAnalysisResponse(input: string, preferences: any, complexity: string, intent: string): string {
    const concerns = preferences.concerns || [];
    const skinType = preferences.skinType || 'your skin type';

    if (intent === 'recommendation') {
      if (complexity === 'simple') {
        return `For ${skinType} skin with ${concerns[0] || 'your concerns'}, focus on gentle, targeted treatments.`;
      } else {
        return `Your ${skinType} skin profile shows ${concerns.length > 0 ? `primary concerns: ${concerns.join(', ')}` : 'balanced characteristics'}. I recommend a personalized approach focusing on ${concerns[0] || 'maintenance and prevention'}. Track your progress regularly to see what works best.`;
      }
    }

    return `Let's analyze your skin. Your current profile shows ${skinType} skin${concerns.length > 0 ? ` with focus on ${concerns.join(' and ')}` : ''}. What would you like to know?`;
  }

  private generateConcernResponse(input: string, preferences: any, complexity: string, intent: string): string {
    if (intent === 'troubleshooting') {
      if (complexity === 'simple') {
        return `For this concern, consistent routine and targeted ingredients are key.`;
      } else {
        return `This concern typically requires a multi-faceted approach. Consider ingredients that address the root cause, maintain a consistent routine, and track your progress. ${preferences.routinePreference === 'minimal' ? 'Since you prefer minimal routines, focus on multi-functional products.' : 'You can layer multiple treatments for better results.'}`;
      }
    }

    return `I can help address this concern. What specific aspect would you like to focus on - prevention, treatment, or maintenance?`;
  }

  private generateGeneralResponse(input: string, preferences: any, complexity: string, patterns: any): string {
    const hasProfile = preferences.skinType || preferences.concerns?.length > 0;
    
    if (!hasProfile) {
      return `I'm here to help with your skincare journey! To give you the most personalized advice, I'd love to learn about your skin type and concerns. Have you taken our skin quiz yet?`;
    }

    const engagement = patterns.engagementLevel;
    if (engagement === 'high') {
      return `You've been actively exploring! ${complexity === 'detailed' ? `Based on your ${patterns.preferredFeatures.join(', ')} interests, I can provide deeper insights into personalized skincare.` : 'How can I help you today?'}`;
    }

    return `I'm here to help with any skincare questions. What would you like to know?`;
  }

  private addConcernSpecificAdvice(concern: string, complexity: string): string {
    const advice: Record<string, string> = {
      acne: complexity === 'simple' 
        ? 'focus on salicylic acid and benzoyl peroxide.'
        : 'I recommend ingredients like salicylic acid for exfoliation, niacinamide for inflammation, and benzoyl peroxide for bacteria control.',
      'dark-spots': complexity === 'simple'
        ? 'vitamin C and niacinamide work well.'
        : 'look for vitamin C, niacinamide, and alpha arbutin to brighten and even skin tone over time.',
      wrinkles: complexity === 'simple'
        ? 'retinol is highly effective.'
        : 'retinol, peptides, and hyaluronic acid can help reduce fine lines and improve skin texture.',
      dryness: complexity === 'simple'
        ? 'hyaluronic acid and ceramides help.'
        : 'focus on hydrating ingredients like hyaluronic acid, ceramides, and glycerin to restore moisture barrier.',
      sensitivity: complexity === 'simple'
        ? 'gentle, fragrance-free products are best.'
        : 'choose fragrance-free, hypoallergenic products with soothing ingredients like centella and allantoin.',
    };

    return advice[concern] || 'I can provide targeted recommendations.';
  }

  private calculateConfidence(preferences: any, patterns: any, topic: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on available preference data
    if (preferences.skinType) confidence += 0.1;
    if (preferences.concerns && preferences.concerns.length > 0) confidence += 0.1;
    if (preferences.goals && preferences.goals.length > 0) confidence += 0.1;

    // Increase confidence based on engagement
    if (patterns.engagementLevel === 'high') confidence += 0.1;
    else if (patterns.engagementLevel === 'medium') confidence += 0.05;

    // Increase confidence based on topic familiarity
    const topicFamiliarity = this.topicKnowledge.get(topic) || 0;
    if (topicFamiliarity > 5) confidence += 0.1;
    else if (topicFamiliarity > 2) confidence += 0.05;

    return Math.min(confidence, 0.95); // Cap at 95%
  }

  // Get conversation summary
  getConversationSummary(): string {
    if (this.conversationHistory.length === 0) {
      return 'No conversation history yet.';
    }

    const topics = Array.from(this.topicKnowledge.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    return `We've discussed ${topics.join(', ')} across ${this.conversationHistory.length / 2} exchanges.`;
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
    this.topicKnowledge.clear();
  }
}

// Singleton instance
export const adaptiveAI = new AdaptiveAIEngine();

// Helper function for quick responses
export function getAdaptiveResponse(userInput: string, context?: any): AIResponse {
  return adaptiveAI.generateResponse(userInput, context);
}
