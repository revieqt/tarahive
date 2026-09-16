// /shared/api/types.ts

export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export interface ApiRequestOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
}