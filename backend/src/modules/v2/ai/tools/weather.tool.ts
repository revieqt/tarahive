import { getWeather } from '../../weather/weather.service';
import { AIProviderToolDefinition, ToolCall, ToolExecutionResult } from '../ai.types';

export const weatherTool: AIProviderToolDefinition = {
  name: 'weather',
  type: 'function',
  description: 'Get current or forecast weather for a city and date using the TaraHive weather service.',
  parameters: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name to look up.',
      },
      latitude: {
        type: 'number',
        description: 'Latitude for the requested location.',
      },
      longitude: {
        type: 'number',
        description: 'Longitude for the requested location.',
      },
      date: {
        type: 'string',
        description: 'Optional date in ISO format (YYYY-MM-DD).',
      },
    },
    required: ['city', 'latitude', 'longitude'],
  },
};

export async function executeWeatherTool(toolCall: ToolCall): Promise<ToolExecutionResult> {
  const args = toolCall.arguments ?? {};
  const city = typeof args.city === 'string' ? args.city : String(args.city ?? '');
  const latitude = Number(args.latitude ?? NaN);
  const longitude = Number(args.longitude ?? NaN);
  const date = typeof args.date === 'string' ? args.date : undefined;

  if (!city || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return {
      toolName: 'weather',
      content: JSON.stringify({
        success: false,
        message: 'The weather tool needs a city plus latitude and longitude.',
      }),
      success: false,
      error: 'Invalid weather tool arguments.',
    };
  }

  try {
    const result = await getWeather(city, latitude, longitude, date);

    if (!result.success || !result.data) {
      return {
        toolName: 'weather',
        content: JSON.stringify({
          success: false,
          message: 'Weather data is temporarily unavailable for this location.',
        }),
        success: false,
        error: 'Weather service unavailable.',
      };
    }

    return {
      toolName: 'weather',
      content: JSON.stringify({
        success: true,
        location: city,
        date: date || new Date().toISOString().slice(0, 10),
        weather: result.data,
      }, null, 2),
      success: true,
    };
  } catch (error: any) {
    return {
      toolName: 'weather',
      content: JSON.stringify({
        success: false,
        message: 'The weather service is temporarily unavailable.',
      }),
      success: false,
      error: error?.message || 'Weather execution failed.',
    };
  }
}
