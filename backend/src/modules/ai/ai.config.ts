if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is not set in your environment variables");
}

export type AIModelKeys = "chat" | "itinerary" ;

export const AI_MODELS: Record<AIModelKeys, string> = {
  chat: process.env.AI_MODEL_CHAT || "stepfun/step-3.5-flash:free",
  itinerary: process.env.AI_MODEL_ITINERARY || "openai/gpt-4o-mini",
};

export const AI_API_URL =
  process.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1/chat/completions";

export const AI_CONFIG = {
  apiKey: process.env.OPENROUTER_API_KEY,
  models: AI_MODELS,
  apiUrl: AI_API_URL,
};