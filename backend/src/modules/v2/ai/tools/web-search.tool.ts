import { AIProviderToolDefinition, ToolCall, ToolExecutionResult } from '../ai.types';

export const webSearchTool: AIProviderToolDefinition = {
  name: 'web_search',
  type: 'web_search',
  description: 'Search the web for up-to-date travel information and current advisories using the OpenRouter web-search capability when available.',
};

export async function executeWebSearchTool(toolCall: ToolCall): Promise<ToolExecutionResult> {
  const args = toolCall.arguments ?? {};
  const query = typeof args.query === 'string' ? args.query : '';

  if (!query) {
    return {
      toolName: 'web_search',
      content: JSON.stringify({
        success: false,
        message: 'A search query is required.',
      }),
      success: false,
      error: 'Missing search query.',
    };
  }

  return {
    toolName: 'web_search',
    content: JSON.stringify({
      success: true,
      message: 'Web search can be performed by the OpenRouter tool when available. No local scraper is used in this version.',
      query,
    }, null, 2),
    success: true,
  };
}
