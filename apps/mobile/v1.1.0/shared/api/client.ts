// /shared/api/client.ts

import { ApiError, NetworkError, TimeoutError } from "./errors";
import { ApiRequestOptions } from "./types";
import { buildQueryString, shouldRetry, sleep } from "./utils";
import { BACKEND_URL } from "@/Config";
import { getAccessToken } from "@/features/auth/services/token.service";

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

let defaultLanguage = "en";

export function setApiLanguage(languageCode: string) {
  defaultLanguage = languageCode;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
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
  attempt = 0
): Promise<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    timeout = DEFAULT_TIMEOUT,
    params,
    headers,
    ...rest
  } = options;

  const queryString = buildQueryString(params);

  const url = `${BACKEND_URL}${endpoint}${queryString}`;

  try {
    const token = await getAccessToken().catch(() => null);

    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": defaultLanguage,
          ...(token
            ? { Authorization: `Bearer ${token}`, }
            : {}),
          ...headers,
        },
        ...rest,
      },
      timeout
    );

    let responseData: any = null;

    const contentType =
      response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        responseData?.message || "Request failed",
        response.status,
        responseData
      );
    }

    return responseData as T;
  } catch (error: any) {
    const status = error?.status;

    const retryable =
      shouldRetry(error, status) &&
      attempt < retries;

    if (retryable) {
      const delay =
        retryDelay * Math.pow(2, attempt);

      await sleep(delay);

      return request<T>(endpoint, options, attempt + 1);
    }

    throw error;
  }
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: ApiRequestOptions
  ) =>
    request<T>(endpoint, {
      method: "GET",
      ...options,
    }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: ApiRequestOptions
  ) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: <T>(
    endpoint: string,
    options?: ApiRequestOptions
  ) =>
    request<T>(endpoint, {
      method: "DELETE",
      ...options,
    }),
};