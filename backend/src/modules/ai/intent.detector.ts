import { IntentDetection, IntentType } from './ai.types';

/**
 * Intent detection system for routing messages between chat and itinerary creation
 * Can be extended with more intent types in the future
 */
export class IntentDetector {
  // Keywords for itinerary creation intent
  private itineraryKeywords = [
    'itinerary',
    'plan a trip',
    'create a trip',
    'schedule',
    'organize trip',
    'make an itinerary',
    'plan my trip',
    'trip plan',
    'day-by-day',
    'day by day',
    'daily schedule',
    'activities for',
    'what should i do',
    'where to go',
    'best places',
    'things to do',
    'attractions',
    'destination',
  ];

  /**
   * Detect the intent of a user message
   * @param message User message
   * @returns IntentDetection object with intent type and confidence
   */
  public detectIntent(message: string): IntentDetection {
    const lowerMessage = message.toLowerCase();

    // Check for itinerary creation intent
    const itineraryScore = this.calculateItineraryScore(lowerMessage);

    if (itineraryScore > 0.3) {
      return {
        intent: 'itinerary',
        confidence: Math.min(itineraryScore, 1),
        tags: this.getMatchedTags(lowerMessage, 'itinerary'),
      };
    }

    // Default to chat
    return {
      intent: 'chat',
      confidence: 1,
      tags: [],
    };
  }

  /**
   * Calculate itinerary intent score (0-1)
   */
  private calculateItineraryScore(message: string): number {
    let score = 0;
    let matches = 0;

    for (const keyword of this.itineraryKeywords) {
      if (message.includes(keyword.toLowerCase())) {
        score += 1;
        matches++;
      }
    }

    // Normalize score and apply diminishing returns
    return matches > 0 ? Math.min(matches / 3, 1) : 0;
  }

  /**
   * Get tags for future extensibility
   */
  private getMatchedTags(message: string, intentType: IntentType): string[] {
    const tags: string[] = [];

    if (intentType === 'itinerary') {
      // Add more tags if needed
      if (message.includes('daily') || message.includes('day by day')) {
        tags.push('daily_planning');
      }
      if (message.includes('budget')) {
        tags.push('budget_conscious');
      }
    }

    return tags;
  }
}

export const intentDetector = new IntentDetector();
