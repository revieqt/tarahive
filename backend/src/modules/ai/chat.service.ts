import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { PredefinedResponse, ChatMessage, ConversationContext } from './ai.types';
import { AI_CONFIG } from './ai.config';
import redis from '../../config/redis';

const SYSTEM_PROMPT = `
    You are Tara, a cheerful travel assistant for TaraG! 
    Help users with travel topics only: destinations, itineraries, tips, accommodations, activities, transport, packing, visas, and safety. 
    If asked non-travel questions, politely redirect. 
    Remember prior messages for context. Your responses must be short and concise but informative.`;
const MAX_MESSAGES_PER_CONVERSATION = 10;
const MAX_CONVERSATIONS_PER_USER = 15;
const REDIS_CONVERSATION_EXPIRATION = 7 * 24 * 60 * 60; // 7 days

export class AIChatService {
  private responses: PredefinedResponse[];
  // In-memory cache for predefined responses only
  private conversationHistory: Map<string, ChatMessage[]> = new Map();

  constructor() {
    const filePath = path.join(__dirname, 'predefinedResponses.json');
    try {
      this.responses = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      console.warn('⚠️ Could not load predefinedResponses.json:', err);
      this.responses = [];
    }
  }

  private findPredefinedResponse(message: string): string | null {
    const lowerMsg = message.toLowerCase();
    for (const r of this.responses) {
      if (r.keywords.some(k => lowerMsg.includes(k.toLowerCase()))) {
        return r.response;
      }
    }
    return null;
  }

  /**
   * Get conversation history from Redis
   */
  private async getConversationHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const key = `chat:conversation:${userId}`;
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (err) {
      console.error('❌ Error getting conversation history from Redis:', err);
      return [];
    }
  }

  /**
   * Save conversation history to Redis
   */
  private async saveConversationHistory(userId: string, messages: ChatMessage[]): Promise<void> {
    try {
      const key = `chat:conversation:${userId}`;
      await redis.setex(
        key,
        REDIS_CONVERSATION_EXPIRATION,
        JSON.stringify(messages)
      );
      console.log(`✅ Conversation history saved for user ${userId}`);
    } catch (err) {
      console.error('❌ Error saving conversation history to Redis:', err);
    }
  }

  /**
   * Add message to conversation history
   */
  private async addToHistory(
    userId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<void> {
    const history = await this.getConversationHistory(userId);
    history.push({ role, content });

    // Keep only the last MAX_MESSAGES_PER_CONVERSATION messages
    if (history.length > MAX_MESSAGES_PER_CONVERSATION) {
      history.splice(0, history.length - MAX_MESSAGES_PER_CONVERSATION);
    }

    await this.saveConversationHistory(userId, history);
  }

  /**
   * Get all conversation IDs for a user
   */
  private async getUserConversationIds(userId: string): Promise<string[]> {
    try {
      const pattern = `chat:conversation:${userId}:*`;
      const keys = await redis.keys(pattern);
      return keys;
    } catch (err) {
      console.error('❌ Error getting conversation IDs for user:', err);
      return [];
    }
  }

  /**
   * Clear all conversations for a user
   */
  public async clearUserConversations(userId: string): Promise<void> {
    try {
      const key = `chat:conversation:${userId}`;
      await redis.del(key);
      console.log(`✅ All conversations cleared for user ${userId}`);
    } catch (err) {
      console.error('❌ Error clearing conversations for user:', err);
      throw err;
    }
  }

  private async callOpenRouter(message: string, userId: string): Promise<string> {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      console.error('❌ OpenRouter API key not configured');
      throw new Error('API key not configured');
    }

    const history = await this.getConversationHistory(userId);

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...history,
      { role: 'user' as const, content: message },
    ];

    const payload = {
      model: AI_CONFIG.models.chat,
      messages: messages,
      temperature: 0.7,
    };

    try {
      console.log('🔄 Calling OpenRouter API with payload:', {
        model: payload.model,
        messageCount: payload.messages.length,
        temperature: payload.temperature,
      });

      const res = await axios.post(AI_CONFIG.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${AI_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://tarag.app',
          'X-Title': 'TaraG Travel Assistant',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('📡 API Response:', {
        status: res.status,
        dataKeys: Object.keys(res.data),
      });

      const reply = res.data.choices?.[0]?.message?.content;

      if (!reply) {
        console.error('❌ No content in API response:', res.data);
        throw new Error('No response content from API');
      }

      console.log('✅ OpenRouter API response received:', reply.substring(0, 50) + '...');
      return reply;
    } catch (err: any) {
      console.error('❌ OpenRouter API error:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        error: err.response?.data?.error || err.message,
        message: err.message,
        fullResponse: err.response?.data,
      });

      if (err.response?.status === 401) {
        throw new Error('Invalid API key');
      }
      if (err.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (err.response?.status === 500) {
        throw new Error('OpenRouter API is currently unavailable');
      }

      throw new Error(`API Error: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Main function to get AI response with context (using Redis)
   */
  public async getResponse(message: string, userId: string): Promise<string> {
    try {
      // Check predefined responses first
      const predefined = this.findPredefinedResponse(message);
      if (predefined) {
        await this.addToHistory(userId, 'user', message);
        await this.addToHistory(userId, 'assistant', predefined);
        return predefined;
      }

      // Get response from OpenRouter API
      const response = await this.callOpenRouter(message, userId);

      // Store in conversation history (Redis)
      await this.addToHistory(userId, 'user', message);
      await this.addToHistory(userId, 'assistant', response);

      return response;
    } catch (err) {
      console.error('❌ Error getting response:', err);
      throw err;
    }
  }
}
