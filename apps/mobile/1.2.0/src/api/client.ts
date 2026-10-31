import { ApiError, NetworkError, TimeoutError } from "./errors";
import { ApiRequestOptions } from "./types";
import { buildQueryString, shouldRetry, sleep } from "./utils";
import { BACKEND_URL } from "@/constants/Config";
import {
  clearAllTokens,
  getAccessToken,
  refreshAccessToken,
} from "@/services/token.service";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

let defaultLanguage = "en";
let sessionExpirationHandler: (() => Promise<void>) | null = null;

export function setApiLanguage(languageCode: string) {
  defaultLanguage = languageCode;
}

export function setSessionExpirationHandler(
  handler: (() => Promise<void>) | null,
) {
  sessionExpirationHandler = handler;
}

const isExpiredAccessTokenError = (
  status: number | undefined,
  responseData: unknown,
): boolean => {
  if (status !== 401 && status !== 403) {
    return false;
  }

  const message =
    typeof responseData === "object" &&
    responseData !== null &&
    "message" in responseData
      ? String(responseData.message)
      : typeof responseData === "string"
        ? responseData
        : "";

  const normalizedMessage = message.trim().toLowerCase();

  return (
    normalizedMessage === "access denied. no token provided." ||
    (/(invalid|expired)/i.test(message) && /token/i.test(message))
  );
};

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new TimeoutError();
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  attempt = 0,
): Promise<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    params,
    headers,
    ...rest
  } = options;
  const url = `${BACKEND_URL}${endpoint}${buildQueryString(params)}`;

  try {
    const token = await getAccessToken().catch(() => null);
    const response = await fetchWithTimeout(
      url,
      {
        ...rest,
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": defaultLanguage,
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      timeout,
    );

    const contentType = response.headers.get("content-type");
    const responseData = contentType?.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      if (
        isExpiredAccessTokenError(response.status, responseData) &&
        !endpoint.includes("/auth/") &&
        attempt === 0
      ) {
        try {
          await refreshAccessToken();
          return request<T>(endpoint, options, attempt + 1);
        } catch (refreshError) {
          await clearAllTokens();
          await sessionExpirationHandler?.();
          throw refreshError;
        }
      }

      throw new ApiError(
        typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData
          ? String(responseData.message)
          : "Request failed",
        response.status,
        responseData,
      );
    }

    return responseData as T;
  } catch (error: any) {
    const status = error?.status;
    if (shouldRetry(error, status) && attempt < retries) {
      await sleep(retryDelay * Math.pow(2, attempt));
      return request<T>(endpoint, options, attempt + 1);
    }
    throw error;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: "GET", ...options }),
  post: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: ApiRequestOptions) =>
    request<T>(endpoint, { method: "DELETE", ...options }),
};
