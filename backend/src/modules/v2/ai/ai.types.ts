export type AiChatRole = 'user' | 'assistant' | 'tool' | 'system';

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface AIProviderToolDefinition {
  name?: string;
  type: 'function' | 'web_search';
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface AIProviderMessage {
  role: AiChatRole;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

export interface AIProviderChatParams {
  systemPrompt: string;
  messages: AIProviderMessage[];
  tools?: AIProviderToolDefinition[];
}

export interface AIResponse {
  content: string;
  toolCalls: ToolCall[];
  raw?: unknown;
}

export interface AIProvider {
  chat(params: AIProviderChatParams): Promise<AIResponse>;
}

export interface ToolExecutionResult {
  toolName: string;
  content: string;
  success: boolean;
  error?: string;
}

export interface StoredAiMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolName?: string | null;
  toolCallId?: string | null;
  createdAt: Date;
}

export interface ChatApiResponse {
  conversationId: string;
  message: {
    id: string;
    role: 'assistant';
    content: string;
    itinerary?: Record<string, any>;
  };
}
