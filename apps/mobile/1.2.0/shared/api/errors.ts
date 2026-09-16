// /shared/api/errors.ts

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);

    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "Request timeout") {
    super(message);

    this.name = "TimeoutError";
  }
}