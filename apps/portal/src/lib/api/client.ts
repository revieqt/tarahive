import { ApiError } from './error';
import toastService from '../toast/service';

/**
 * All backend calls in the app go through this module.
 * - Services never call `fetch` directly.
 * - Error display is centralized here (currently console.log via
 *   toastService), so hooks/services/UI never write error-handling code.
 * - Retries with exponential backoff for transient failures
 *   (network errors, 408/429/5xx). 4xx client errors are not retried.
 */

export interface ApiRequestOptions extends RequestInit {
  /** Number of retry attempts after the first try. Default: 2. */
  retries?: number;
  /** Base delay in ms between retries (multiplied by attempt number). Default: 500. */
  retryDelayMs?: number;
  /** Set true to suppress the automatic error toast for this call (e.g. background polling). */
  skipErrorToast?: boolean;
}

const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 500;
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS_CODES.has(status);
}

async function parseErrorBody(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return undefined;
  }
}

function extractErrorMessage(status: number, body: unknown): string {
  if (
    body &&
    typeof body === 'object' &&
    'error' in (body as Record<string, unknown>) &&
    typeof (body as Record<string, unknown>).error === 'string'
  ) {
    return (body as Record<string, string>).error;
  }
  return `Request failed with status ${status}`;
}

/** Centralized failure reporting. Currently console.log; swap in toastService.error output for the real UI later — this is the only place that needs to change. */
function reportFailure(error: unknown, skipToast?: boolean): void {
  console.log('[api] request failed:', error);

  if (skipToast) return;

  const message =
    error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';

  toastService.error({ title: 'Request failed', description: message });
}

async function request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    skipErrorToast,
    ...fetchOptions
  } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      const res = await fetch(path, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers ?? {}),
        },
      });

      if (!res.ok) {
        const body = await parseErrorBody(res);
        const message = extractErrorMessage(res.status, body);
        const error = new ApiError(message, res.status, body);

        if (isRetryableStatus(res.status) && attempt < retries) {
          lastError = error;
          attempt += 1;
          await sleep(retryDelayMs * attempt);
          continue;
        }

        reportFailure(error, skipErrorToast);
        throw error;
      }

      if (res.status === 204) {
        return undefined as T;
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof ApiError) {
        // already handled/reported above (or will be re-thrown as-is)
        throw err;
      }

      // Network error, aborted request, JSON parse failure, etc.
      lastError = err;
      if (attempt < retries) {
        attempt += 1;
        await sleep(retryDelayMs * attempt);
        continue;
      }

      reportFailure(err, skipErrorToast);
      throw err;
    }
  }

  reportFailure(lastError, skipErrorToast);
  throw lastError;
}

function get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'GET' });
}

function post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function del<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  return request<T>(path, { ...options, method: 'DELETE' });
}

export const apiClient = { get, post, put, delete: del };
export default apiClient;