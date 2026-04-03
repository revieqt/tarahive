import { BACKEND_URL } from '@/constants/Config';
import { getAccessToken } from '@/utils/getAccessToken';

const API_URL = `${BACKEND_URL}/api/ai`;

export interface ChatMessage {
  id: string;
  message: string;
  reply: string;
  timestamp: Date;
}

export type Intent = 'chat' | 'itinerary';

export interface ItineraryData {
  destination?: string;
  startDate?: string;
  endDate?: string;
  interests?: string[];
  planDaily?: boolean;
}

export interface UnifiedAIResponse {
  success: boolean;
  message: string;
  type: 'chat' | 'itinerary';
  json?: Record<string, any>;
}

/**
 * Send message to unified AI endpoint
 * Backend automatically detects intent and routes appropriately
 */
export const sendMessage = async (message: string): Promise<UnifiedAIResponse> => {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_URL}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process request');
    }

    const data: UnifiedAIResponse = await response.json();
    return data;
  } catch (err) {
    console.error('[aiChatService] Error sending message:', err);
    throw err;
  }
};

/**
 * Clear all conversation history for the authenticated user
 */
export const clearConversationHistory = async (): Promise<void> => {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${API_URL}/clear`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to clear conversation');
    }

    console.log('[aiChatService] Conversation history cleared');
  } catch (err) {
    console.error('[aiChatService] Error clearing conversation:', err);
    throw err;
  }
};