// /shared/api/utils.ts

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const buildQueryString = (
  params?: Record<string, string | number | boolean | undefined>
) => {
  if (!params) return "";

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.append(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : "";
};

export const shouldRetry = (
  error: unknown,
  status?: number
): boolean => {
  if (!status) return true;

  return [408, 429, 500, 502, 503, 504].includes(status);
};