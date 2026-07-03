export type AILevel = "LOW" | "MEDIUM" | "HIGH";

export interface GetAIResponseProps {
  prompt: string;
  lang: string;
  level: AILevel;

  /**
   * Optional system prompt.
   * Defaults to a generic assistant prompt.
   */
  systemPrompt?: string;

  /**
   * AI creativity.
   * Default: 0.7
   */
  temperature?: number;

  /**
   * Maximum tokens to generate.
   * Optional.
   */
  maxTokens?: number;
}

export const MODEL_MAP: Record<AILevel, string> = {
  LOW: "google/gemma-3-4b-it:free",
  MEDIUM: "qwen/qwen3-30b-a3b:free",
  HIGH: "deepseek/deepseek-r1-0528:free",
};