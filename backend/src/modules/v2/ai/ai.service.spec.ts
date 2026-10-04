import assert from 'node:assert/strict';
import { aiToolRegistry, createItineraryDraftTool, weatherTool, webSearchTool } from './tools';
import { AiService, toProviderMessages } from './ai.service';
import { AiMessageRole } from './ai-messages.entity';

const service = new AiService();

assert.ok(Array.isArray(aiToolRegistry));
assert.ok(aiToolRegistry.some((tool) => tool.name === 'weather'));
assert.ok(aiToolRegistry.some((tool) => tool.name === 'web_search'));
assert.ok(aiToolRegistry.some((tool) => tool.name === 'create_itinerary_draft'));
assert.equal(weatherTool.name, 'weather');
assert.equal(webSearchTool.name, 'web_search');
assert.equal(createItineraryDraftTool.name, 'create_itinerary_draft');

const providerMessages = toProviderMessages([
	{ role: AiMessageRole.USER, content: 'What is the weather?', toolName: null, toolCallId: null },
	{ role: AiMessageRole.TOOL, content: '{"temperature":20}', toolName: 'weather', toolCallId: 'call-1' },
	{ role: AiMessageRole.ASSISTANT, content: 'It is 20 degrees.', toolName: null, toolCallId: null },
]);
assert.deepEqual(providerMessages.map((message) => message.role), ['user', 'assistant']);

const response = service.formatToolResult('weather', { ok: true, message: 'Weather ready' });
assert.equal(response.toolName, 'weather');
assert.ok(response.content.includes('Weather ready'));

console.log('AI module smoke test passed');
