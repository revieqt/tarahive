import fetch from 'node-fetch';
import { AIProvider, AIProviderChatParams, AIProviderMessage, AIProviderToolDefinition, AIResponse, ToolCall } from '../ai.types';

const OPENROUTER_DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterProvider implements AIProvider {
  constructor(
    private readonly apiKey: string = process.env.OPENROUTER_API_KEY || '',
    private readonly model: string = OPENROUTER_DEFAULT_MODEL,
    private readonly apiUrl: string = OPENROUTER_API_URL,
  ) {}

  async chat({ systemPrompt, messages, tools = [] }: AIProviderChatParams): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const payload: Record<string, unknown> = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((message) => this.normalizeMessage(message)),
      ],
      temperature: 0.7,
    };

    if (tools.length > 0) {
      payload.tools = this.formatTools(tools);
      payload.tool_choice = 'auto';
    }

    const res = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'https://localhost',
        'X-Title': 'TaraHive Backend',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as Record<string, unknown>;

    if (!res.ok) {
      throw new Error(
        typeof (data as any)?.error?.message === 'string'
          ? (data as any).error.message
          : 'OpenRouter request failed.',
      );
    }

    const choice = Array.isArray((data as any)?.choices) ? (data as any).choices[0] : null;
    const message = choice?.message ?? {};
    const content = this.extractContent(message.content);
    const toolCalls = Array.isArray(message.tool_calls)
      ? message.tool_calls.map((call: any) => this.parseToolCall(call))
      : [];

    if (!content && toolCalls.length === 0) {
      throw new Error('Malformed AI response from provider.');
    }

    return {
      content,
      toolCalls,
      raw: data,
    };
  }

  private normalizeMessage(message: AIProviderMessage): Record<string, unknown> {
    const normalized: Record<string, unknown> = {
      role: message.role,
      content: message.content ?? '',
    };

    if (message.name) {
      normalized.name = message.name;
    }

    if (message.tool_call_id) {
      normalized.tool_call_id = message.tool_call_id;
    }

    if (message.tool_calls && message.tool_calls.length > 0) {
      normalized.tool_calls = message.tool_calls.map((toolCall) => ({
        id: toolCall.id,
        type: 'function',
        function: {
          name: toolCall.name,
          arguments: JSON.stringify(toolCall.arguments ?? {}),
        },
      }));
    }

    return normalized;
  }

  private formatTools(tools: AIProviderToolDefinition[]): Array<Record<string, unknown>> {
    return tools.map((tool) => {
      if (tool.type === 'web_search') {
        return {
          type: 'web_search',
        };
      }

      return {
        type: 'function',
        function: {
          name: tool.name || 'custom_tool',
          description: tool.description || 'Tool call',
          parameters: tool.parameters || {
            type: 'object',
            properties: {},
            required: [],
          },
        },
      };
    });
  }

  private parseToolCall(call: any): ToolCall {
    const name = call?.function?.name || call?.name || 'unknown_tool';
    const rawArgs = call?.function?.arguments ?? '{}';

    let parsedArgs: Record<string, unknown> = {};
    if (typeof rawArgs === 'string') {
      try {
        parsedArgs = JSON.parse(rawArgs);
      } catch {
        parsedArgs = { raw: rawArgs };
      }
    } else if (rawArgs && typeof rawArgs === 'object') {
      parsedArgs = rawArgs as Record<string, unknown>;
    }

    return {
      id: call?.id || `${name}-${Date.now()}`,
      name,
      arguments: parsedArgs,
    };
  }

  private extractContent(content: unknown): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((part: any) => typeof part?.text === 'string' ? part.text : '')
        .join('\n')
        .trim();
    }

    return '';
  }
}
