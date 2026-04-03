# AI Module - Unified Endpoint Documentation

## Overview
The AI module has been refactored to use a unified endpoint system that intelligently routes between chat and itinerary generation based on user intent. All requests now use a consistent request/response format.

## API Changes Summary

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/api/ai/` | POST | ✅ NEW | Unified handler for chat & itinerary |
| `/api/ai/clear` | POST | ✅ NEW | Clear conversation history |
| `/api/ai/chat` | POST | ⚠️ DEPRECATED | Use `/api/ai/` instead |
| `/api/ai/itinerary` | POST | ⚠️ DEPRECATED | Use `/api/ai/` instead |

## New Unified Endpoint

### `POST /api/ai/`

**Purpose:** Single endpoint for all AI requests (chat, itinerary generation, etc.)

#### Request

```
Method: POST
Endpoint: /api/ai/
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "User's message or query"
}
```

**Examples:**

Chat request:
```json
{
  "message": "Tell me about travel tips for Paris"
}
```

Itinerary request:
```json
{
  "message": "Create an itinerary for Tokyo for 5 days"
}
```

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Display this message to the user",
  "type": "chat",
  "json": null
}
```

**For Chat:**
```json
{
  "success": true,
  "message": "Here are some travel tips for Paris...",
  "type": "chat"
}
```

**For Itinerary (Future):**
```json
{
  "success": true,
  "message": "Your itinerary has been created",
  "type": "itinerary",
  "json": {
    "title": "Tokyo 5-Day Itinerary",
    "startDate": "2024-04-01",
    "endDate": "2024-04-05",
    "planDaily": true,
    "locations": [...]
  }
}
```

**Error Response (4xx/5xx):**
```json
{
  "success": false,
  "message": "Error description here",
  "type": "chat"
}
```

#### Intent Detection

The backend automatically detects user intent:

- **Chat Intent**: General travel questions, tips, advice
- **Itinerary Intent**: Messages containing keywords like:
  - "itinerary"
  - "plan a trip"
  - "create a trip"
  - "schedule"
  - "day by day"
  - "activities"
  - "attractions"
  - "things to do"
  - And more...

#### Conversation Context

- Conversation history is stored in Redis with:
  - Maximum 10 messages per conversation
  - 7-day expiration
  - User ID from decoded access token as identifier
  - Automatic oldest message deletion when limit reached

#### Example Implementation (Frontend)

**JavaScript/TypeScript:**
```typescript
const response = await fetch('/api/ai/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: userMessage
  })
});

const result = await response.json();

if (result.success) {
  if (result.type === 'chat') {
    displayChatMessage(result.message);
  } else if (result.type === 'itinerary') {
    displayItinerary(result.json);
    displayMessage(result.message);
  }
} else {
  displayError(result.message);
}
```

---

## Clear Conversation Context Endpoint

### `POST /api/ai/clear`

**Purpose:** Delete all AI conversation history for the authenticated user

#### Request

```
Method: POST
Endpoint: /api/ai/clear
Authorization: Bearer <accessToken>
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Body:**
```json
{}
```
Or omit body entirely.

#### Response

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "All conversation history has been cleared"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to clear conversation history"
}
```

#### Example Implementation (Frontend)

**JavaScript/TypeScript:**
```typescript
const clearHistory = async () => {
  const response = await fetch('/api/ai/clear', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  const result = await response.json();
  if (result.success) {
    console.log('Conversation history cleared');
  }
};
```

---

## Deprecated Endpoints (Backward Compatibility)

### `POST /api/ai/chat` (DEPRECATED)

Use `/api/ai/` instead.

**Old Request:**
```json
{
  "message": "User message"
}
```

**Old Response:**
```json
{
  "reply": "Assistant response"
}
```

### `POST /api/ai/itinerary` (DEPRECATED)

Use `/api/ai/` instead.

**Old Request:**
```json
{
  "destination": "Paris",
  "startDate": "2024-04-01",
  "endDate": "2024-04-07",
  "planDaily": true,
  "interests": ["museums", "food"]
}
```

---

## Error Handling

### Common Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 400 | `Message is required` | Include "message" in request body |
| 401 | `User ID not found in token` | Provide valid access token in Authorization header |
| 401 | `Access denied. No token provided` | Include Authorization header with Bearer token |
| 500 | `Failed to process request` | Check server logs, may be API rate limit or downstream service issue |

### Error Response Format

All errors follow the unified format:
```json
{
  "success": false,
  "message": "Human-readable error description",
  "type": "chat"
}
```

---

## Migration Guide for Frontend Teams

### From `/api/ai/chat`

**Before:**
```typescript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message })
});
const { reply } = await response.json();
```

**After:**
```typescript
const response = await fetch('/api/ai/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message })
});
const { success, message, type } = await response.json();
if (success && type === 'chat') {
  // Use message instead of reply
}
```

### From `/api/ai/itinerary`

**Before:**
```typescript
const response = await fetch('/api/ai/itinerary', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ destination, startDate, endDate, planDaily, interests })
});
const { data, message } = await response.json();
```

**After:**
Let the backend detect itinerary intent from message:
```typescript
const response = await fetch('/api/ai/', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ 
    message: "Create an itinerary for Paris from 2024-04-01 to 2024-04-07" 
  })
});
const { success, message, type, json } = await response.json();
```

---

## Response Type Definitions

### TypeScript Interfaces

```typescript
interface UnifiedAIResponse {
  success: boolean;
  message: string; // Always present, display to user
  type: 'chat' | 'itinerary';
  json?: any; // Optional, for structured data (itinerary)
}

interface IntentDetection {
  intent: 'chat' | 'itinerary';
  confidence: number; // 0-1
  tags?: string[]; // For future use
}
```

---

## Features

### Conversation Persistence
- Automatic conversation history storage in Redis
- Context maintained across multiple requests
- Limited to 10 most recent messages
- 7-day auto-expiration

### Intent Detection
- Automatic routing based on message content
- Confidence scoring for future decisions
- Extensible design for additional intent types

### Unified Response Format
- Consistent structure across all AI endpoints
- Clear success/failure indication
- Support for different response types (chat, itinerary, etc.)
- Optional JSON payload for structured data

---

## Future Enhancements

Planned features ready for implementation:

1. **Multi-turn Itinerary Gathering**
   - Conversational data collection
   - Questions for missing details
   - Structured itinerary creation

2. **Intent Extensions**
   - Additional intent types beyond chat/itinerary
   - Tag-based categorization
   - Confidence-based routing

3. **Conversation Management**
   - Track max 15 conversations per user
   - Named conversations
   - Archive/restore capabilities

---

## Support & Questions

For questions or issues with the new endpoints:
1. Check this documentation
2. Review the intent detection keywords
3. Ensure proper Authorization header format
4. Check server logs for detailed error messages
