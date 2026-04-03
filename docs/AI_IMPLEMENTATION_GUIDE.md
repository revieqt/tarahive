# AI Module Implementation Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│ Frontend Request (POST /api/ai/)                        │
│ { message: "..." }                                      │
│ Header: Authorization: Bearer <token>                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ UnifiedAIController.handleAIRequest()                   │
│ - Validates token & message                             │
│ - Extracts userId from decoded token                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ IntentDetector.detectIntent()                           │
│ - Analyzes message for keywords                         │
│ - Returns: { intent, confidence, tags }                │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼ Chat                      ▼ Itinerary
    ┌──────────────┐         ┌──────────────────┐
    │ AIChatService│         │ Itinerary Flow   │
    │ - Get history│         │ (Future)         │
    │ - Call API   │         │ - Ask questions  │
    │ - Store hist │         │ - Gather data    │
    └──────────────┘         │ - Create itinerary
                             └──────────────────┘
         │                           │
         └─────────────┬─────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ UnifiedAIResponse                                       │
│ {                                                       │
│   success: boolean,                                     │
│   message: string,                                      │
│   type: 'chat' | 'itinerary',                          │
│   json?: any                                            │
│ }                                                       │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
backend/src/modules/ai/
├── ai.config.ts                 # API keys and models config
├── ai.routes.ts                 # Route definitions
├── ai.types.ts                  # TypeScript interfaces
├── intent.detector.ts           # NEW: Intent detection logic
├── unified.controller.ts        # NEW: Unified AI handler
├── clear.controller.ts          # NEW: Clear context handler
├── chat.controller.ts           # OLD: Deprecated, kept for ref
├── chat.service.ts              # Chat service (updated w/ Redis)
├── itinerary.controller.ts      # Still used, marked for future
├── itinerary.service.ts         # Itinerary generation
└── predefinedResponses.json     # Predefined chat responses
```

## Key Classes & Functions

### 1. IntentDetector (`intent.detector.ts`)

```typescript
class IntentDetector {
  detectIntent(message: string): IntentDetection
}

interface IntentDetection {
  intent: 'chat' | 'itinerary';
  confidence: number; // 0-1
  tags?: string[];
}
```

**Usage:**
```typescript
const intentDetector = new IntentDetector();
const result = intentDetector.detectIntent("Create an itinerary");
// { intent: 'itinerary', confidence: 0.8, tags: [...] }
```

**Detected Keywords:**
- Itinerary: "itinerary", "plan trip", "schedule", "day by day", "activities", etc.
- Chat: Everything else defaults to chat

---

### 2. UnifiedAIController (`unified.controller.ts`)

```typescript
class UnifiedAIController {
  static async handleAIRequest(req: AuthRequest, res: Response)
  private static async handleChat(message, userId)
  private static async handleItineraryCreation(message, userId)
}
```

**Flow:**
1. Validates request (message required, token valid)
2. Detects intent
3. Routes to appropriate handler
4. Returns unified response

---

### 3. AIChatService (`chat.service.ts`)

```typescript
class AIChatService {
  // Redis conversation management
  private async getConversationHistory(userId: string)
  private async saveConversationHistory(userId, messages)
  private async addToHistory(userId, role, content)
  
  // API interaction
  private async callOpenRouter(message, userId): Promise<string>
  
  // Main method
  public async getResponse(message: string, userId: string): Promise<string>
}
```

**Redis Storage:**
```
Key: chat:conversation:{userId}
Value: [{ role: 'user'|'assistant', content: string }, ...]
TTL: 7 days
Max messages: 10 (oldest deleted when limit exceeded)
```

---

### 4. AIClearController (`clear.controller.ts`)

```typescript
class AIClearController {
  static async clearContext(req: AuthRequest, res: Response)
}
```

**Action:** Deletes all Redis conversation history for user

---

## Data Flow Examples

### Example 1: Chat Request

**Request:**
```
POST /api/ai/
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{ "message": "Tell me about visa requirements for Thailand" }
```

**Backend Processing:**
```
1. UnifiedAIController.handleAIRequest()
2. Validates: message ✓, token ✓, userId extracted
3. IntentDetector.detectIntent()
   → { intent: 'chat', confidence: 1, tags: [] }
4. UnifiedAIController.handleChat()
5. AIChatService.getResponse(message, userId)
   a. Load conversation history from Redis
   b. Check predefined responses → No match
   c. Call OpenRouter API with context
   d. Save new messages to Redis
6. Return UnifiedAIResponse
```

**Response:**
```json
{
  "success": true,
  "message": "You'll need a valid passport and may qualify for visa-on-arrival...",
  "type": "chat"
}
```

---

### Example 2: Itinerary Request (Current/Future)

**Request:**
```
POST /api/ai/
Authorization: Bearer eyJhbGc...

{ "message": "Create a 5-day itinerary for Tokyo" }
```

**Backend Processing:**
```
1. UnifiedAIController.handleAIRequest()
2. Validates input & extracts userId
3. IntentDetector.detectIntent()
   → { intent: 'itinerary', confidence: 0.8, tags: [...] }
4. UnifiedAIController.handleItineraryCreation()
   (Future: Multi-turn conversation to gather details)
   (Current: Uses chat model to respond)
5. Return response
```

**Response (Current):**
```json
{
  "success": true,
  "message": "I'd be happy to help create a Tokyo itinerary! Can you tell me...",
  "type": "itinerary"
}
```

---

### Example 3: Clear Context

**Request:**
```
POST /api/ai/clear
Authorization: Bearer eyJhbGc...
```

**Backend Processing:**
```
1. AIClearController.clearContext()
2. Extract userId from token
3. AIChatService.clearUserConversations(userId)
4. Delete Redis key: chat:conversation:{userId}
5. Return success response
```

**Response:**
```json
{
  "success": true,
  "message": "All conversation history has been cleared"
}
```

---

## Redis Integration

### Setup

Redis is already configured in: `backend/src/config/redis.ts`

```typescript
import redis from '../../config/redis';

// Usage in service
const data = await redis.get(key);
await redis.setex(key, ttlInSeconds, value);
await redis.del(key);
```

### Conversation Storage

```typescript
// Save conversation
await redis.setex(
  `chat:conversation:${userId}`,
  7 * 24 * 60 * 60, // 7 days
  JSON.stringify(messages)
);

// Retrieve conversation
const messages = JSON.parse(
  await redis.get(`chat:conversation:${userId}`)
);
```

---

## Testing Guide

### Test Chat Intent

```bash
curl -X POST http://localhost:3000/api/ai/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about Paris"}'
```

### Test Itinerary Intent

```bash
curl -X POST http://localhost:3000/api/ai/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create an itinerary for Tokyo"}'
```

### Test Clear

```bash
curl -X POST http://localhost:3000/api/ai/clear \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Future Enhancement Points

### 1. Multi-turn Itinerary Gathering

```typescript
// In UnifiedAIController.handleItineraryCreation()

const gatheringContext = {
  userId,
  destination: null,
  startDate: null,
  endDate: null,
  planDaily: null,
  interests: [],
  messages: []
};

// Store in Redis with key: itinerary:gathering:{userId}
// Keep asking until all fields collected
// Then call itinerary generation
```

### 2. Extend Intent Types

```typescript
// In intent.detector.ts

export type IntentType = 'chat' | 'itinerary' | 'recommendation' | 'booking';

// Add new detection methods
private calculateRecommendationScore(message): number
private calculateBookingScore(message): number
```

### 3. Conversation Limits per User

```typescript
// In AIChatService

private async enforceConversationLimit(userId: string) {
  const MAX = 15;
  const conversationIds = await this.getUserConversationIds(userId);
  
  if (conversationIds.length > MAX) {
    // Delete oldest conversations
  }
}
```

---

## Troubleshooting

### Issue: Token not found
**Check:** Authorization header format
```
✓ Authorization: Bearer <token>
✗ Authorization: <token>
✗ Authorization: Bearer<token>
```

### Issue: Redis connection error
**Check:** Redis is running and accessible
- Verify connection in logs: "Redis connected"
- Conversation history will not persist if Redis fails

### Issue: Intent always chat
**Check:** Message keywords
- Add debugging to IntentDetector
- Verify keyword list includes your test phrase

### Issue: API rate limited
**Check:** OpenRouter API quota
- Check logs for 429 status code
- May need to reduce message frequency or model calls

---

## Related Documentation

- [AI API Documentation](./AI_API_DOCUMENTATION.md)
- [TypeScript Types](./ai.types.ts)
- [Intent Detector Keywords](./intent.detector.ts)
- [Chat Service](./chat.service.ts)
