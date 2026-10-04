import { Repository } from 'typeorm';
import { AppDataSource } from '../../../config/postgres';
import { AiConversation } from './ai-conversations.entity';
import { AiMessage, AiMessageRole } from './ai-messages.entity';
import { TARA_SYSTEM_PROMPT } from './ai.prompts';
import { AIProvider, AIProviderMessage, ChatApiResponse, StoredAiMessage, ToolCall } from './ai.types';
import { OpenRouterProvider } from './providers';
import { aiToolRegistry, executeToolCall } from './tools';

export function toProviderMessages(
  messages: Array<Pick<AiMessage, 'role' | 'content' | 'toolName' | 'toolCallId'>>,
): AIProviderMessage[] {
  return messages
    .filter((message) => message.role !== AiMessageRole.TOOL)
    .map((message) => ({
      role: message.role,
      content: message.content,
      name: message.toolName ?? undefined,
      tool_call_id: message.toolCallId ?? undefined,
    }));
}

export class AiService {
  private readonly provider: AIProvider;
  private readonly conversationRepository: Repository<AiConversation>;
  private readonly messageRepository: Repository<AiMessage>;
  private readonly maxToolIterations = 4;

  constructor(provider: AIProvider = new OpenRouterProvider()) {
    this.provider = provider;
    this.conversationRepository = AppDataSource.getRepository(AiConversation);
    this.messageRepository = AppDataSource.getRepository(AiMessage);
  }

  async getCurrentConversation(userId: string): Promise<{ conversation: any | null; messages: StoredAiMessage[] }> {
    const conversation = await this.conversationRepository.findOne({
      where: { userId },
    });

    if (!conversation) {
      return { conversation: null, messages: [] };
    }

    const messages = await this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
    });

    return {
      conversation: {
        id: conversation.id,
        userId: conversation.userId,
        summary: conversation.summary,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
      messages: messages.map((message) => ({
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        content: message.content,
        toolName: message.toolName,
        toolCallId: message.toolCallId,
        createdAt: message.createdAt,
      })),
    };
  }

  formatToolResult(toolName: string, payload: unknown): { toolName: string; content: string } {
    const content = typeof payload === 'string'
      ? payload
      : JSON.stringify(payload, null, 2);

    return {
      toolName,
      content: content || `Tool result for ${toolName} was empty.`,
    };
  }

  async sendMessage(userId: string, message: string): Promise<ChatApiResponse> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error('Message cannot be empty.');
    }

    const conversation = await this.getOrCreateConversation(userId);
    await this.saveMessage(conversation.id, 'user', trimmedMessage);

    const providerMessages = await this.buildProviderMessages(conversation.id);

    let assistantContent = '';
    let attachedItinerary: Record<string, any> | undefined;
    let currentMessages = providerMessages;

    for (let iteration = 0; iteration < this.maxToolIterations; iteration += 1) {
      const response = await this.provider.chat({
        systemPrompt: TARA_SYSTEM_PROMPT,
        messages: currentMessages,
        tools: aiToolRegistry,
      });

      const toolCalls = response.toolCalls ?? [];
      if (toolCalls.length === 0) {
        assistantContent = response.content.trim() || 'I can help with that.';

        if (attachedItinerary && typeof attachedItinerary === 'object') {
          const payload = {
            message: assistantContent,
            itinerary: attachedItinerary,
          };
          assistantContent = JSON.stringify(payload);
        }

        const assistantMessage = await this.saveMessage(conversation.id, 'assistant', assistantContent);
        return {
          conversationId: conversation.id,
          message: {
            id: assistantMessage.id,
            role: 'assistant',
            content: assistantMessage.content,
            itinerary: attachedItinerary,
          },
        };
      }

      currentMessages = [...currentMessages, {
        role: 'assistant',
        content: response.content || '',
        tool_calls: toolCalls,
      }];

      for (const toolCall of toolCalls) {
        const toolResult = await executeToolCall(toolCall);
        const toolContent = toolResult.content;

        try {
          const parsedToolResult = JSON.parse(toolContent);
          if (parsedToolResult && typeof parsedToolResult === 'object' && parsedToolResult.itinerary) {
            attachedItinerary = parsedToolResult.itinerary as Record<string, any>;
          }
        } catch {
          // Ignore non-JSON tool outputs and continue.
        }

        await this.saveMessage(conversation.id, 'tool', toolContent, toolCall.name, toolCall.id);
        currentMessages.push({
          role: 'tool',
          content: toolContent,
          name: toolCall.name,
          tool_call_id: toolCall.id,
        });
      }
    }

    const fallback = 'I hit a tool loop while processing your question. Please try rephrasing it.';
    const assistantMessage = await this.saveMessage(conversation.id, 'assistant', fallback);
    return {
      conversationId: conversation.id,
      message: {
        id: assistantMessage.id,
        role: 'assistant',
        content: assistantMessage.content,
      },
    };
  }

  async resetConversation(userId: string): Promise<void> {
    await this.conversationRepository.delete({ userId });
  }

  private async getOrCreateConversation(userId: string): Promise<AiConversation> {
    const existingConversation = await this.conversationRepository.findOne({
      where: { userId },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationRepository.create({
      userId,
      summary: null,
    });

    try {
      return await this.conversationRepository.save(conversation);
    } catch (error: any) {
      if (error?.code === '23505' || /duplicate key|unique.*user_id/i.test(error?.message || '')) {
        const recoveredConversation = await this.conversationRepository.findOne({
          where: { userId },
        });

        if (recoveredConversation) {
          return recoveredConversation;
        }
      }

      throw error;
    }
  }

  private async buildProviderMessages(conversationId: string): Promise<AIProviderMessage[]> {
    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return toProviderMessages(messages);
  }

  private async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'tool',
    content: string,
    toolName?: string,
    toolCallId?: string,
  ): Promise<AiMessage> {
    const record = this.messageRepository.create({
      conversationId,
      role: role === 'user' ? AiMessageRole.USER : role === 'assistant' ? AiMessageRole.ASSISTANT : AiMessageRole.TOOL,
      content,
      toolName: role === 'tool' ? (toolName ?? null) : null,
      toolCallId: role === 'tool' ? (toolCallId ?? null) : null,
    });

    return this.messageRepository.save(record);
  }
}

export const aiService = new AiService();
