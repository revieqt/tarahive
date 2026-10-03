import { AIProviderToolDefinition, ToolCall, ToolExecutionResult } from '../ai.types';
import { executeWeatherTool, weatherTool } from './weather.tool';
import { executeWebSearchTool, webSearchTool } from './web-search.tool';

export const aiToolRegistry: AIProviderToolDefinition[] = [weatherTool, webSearchTool];

export async function executeToolCall(toolCall: ToolCall): Promise<ToolExecutionResult> {
  try {
    switch (toolCall.name) {
      case 'weather':
        return await executeWeatherTool(toolCall);
      case 'web_search':
        return await executeWebSearchTool(toolCall);
      default:
        return {
          toolName: toolCall.name,
          content: JSON.stringify({
            success: false,
            message: `The tool "${toolCall.name}" is not available in this version.`,
          }),
          success: false,
          error: `Unknown tool: ${toolCall.name}`,
        };
    }
  } catch (error: any) {
    return {
      toolName: toolCall.name,
      content: JSON.stringify({
        success: false,
        message: 'The requested tool is temporarily unavailable.',
      }),
      success: false,
      error: error?.message || 'Tool execution failed.',
    };
  }
}

export { weatherTool, webSearchTool };
