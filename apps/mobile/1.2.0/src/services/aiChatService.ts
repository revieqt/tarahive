import { api } from '@/api/client';
import { BACKEND_URL } from '@/config';
import { getAccessToken } from '@/services/token.service';

const AI_API_URL = '/v2/ai';

export type AiMessageRole = 'user' | 'assistant' | 'tool';

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  toolName?: string | null;
  toolCallId?: string | null;
  createdAt?: string | Date;
}

export interface AiConversationPayload {
  id: string;
  userId: string;
  summary?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface AiChatResponse {
  success: boolean;
  conversationId?: string;
  message?: {
    id: string;
    role: 'assistant';
    content: string;
  };
  conversation?: AiConversationPayload | null;
  messages?: AiMessage[];
}

export interface AiStreamCallback {
  (partialText: string, isComplete: boolean): void;
}

export const aiChatService = {
  getConversation: async (): Promise<AiChatResponse> => {
    const response = await api.get<AiChatResponse>(AI_API_URL);
    return response;
  },

  sendMessage: async (message: string): Promise<AiChatResponse> => {
    const response = await api.post<AiChatResponse>(AI_API_URL, { message });
    return response;
  },

  sendMessageStream: async (
    message: string,
    onChunk?: AiStreamCallback,
  ): Promise<AiChatResponse> => {
    const accessToken = await getAccessToken();

    const response = await fetch(`${BACKEND_URL}${AI_API_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json,text/event-stream',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.message || 'Failed to process AI request.');
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response is not available.');
      }

      const decoder = new TextDecoder();
      let rawText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        rawText += chunk;

        const partialText = rawText
          .replace(/event:.*\n?/g, '')
          .replace(/data:\s*/g, '')
          .replace(/\n{2,}/g, '\n')
          .trim();

        onChunk?.(partialText, false);
      }

      const parsedList = rawText
        .split('data:')
        .map((segment) => segment.trim())
        .filter(Boolean)
        .map((segment) => {
          try {
            return JSON.parse(segment);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as AiChatResponse[];

      const parsed = parsedList.length > 0 ? parsedList[parsedList.length - 1] : undefined;

      const finalPayload = parsed ?? {
        success: true,
        message: {
          id: 'streamed-response',
          role: 'assistant',
          content: rawText.trim(),
        },
      };

      onChunk?.(finalPayload.message?.content || '', true);
      return finalPayload;
    }

    const parsedJson = (await response.json()) as AiChatResponse;
    onChunk?.(parsedJson.message?.content || '', true);
    return parsedJson;
  },

  clearConversation: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(AI_API_URL);
    return response;
  },
};

export const sendMessage = aiChatService.sendMessage;
export const sendMessageStream = aiChatService.sendMessageStream;
export const clearConversationHistory = aiChatService.clearConversation;
export type UnifiedAIResponse = AiChatResponse;