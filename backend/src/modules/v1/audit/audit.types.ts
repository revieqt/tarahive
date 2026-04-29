export enum LogSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export interface Device {
  brand?: string;
  model?: string;
  os?: string;
  type?: string;
  appVersion?: string;
}

export interface App {
  app?: string;
  appVersion?: string;
}