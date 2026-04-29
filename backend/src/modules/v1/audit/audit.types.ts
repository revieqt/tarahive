export enum LogSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export interface Device {
  deviceId?: string;
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

export interface AuditLogPayload {
  userId?: string;

  action: string;
  module: string;
  description?: string;

  resourceType?: string;
  resourceId?: string;

  success?: boolean;
  errorMessage?: string;

  ip?: string;
  platform?: string;

  device?: any;
  appInfo?: any;

  severity?: LogSeverity;
  metadataID?: string;
  requestId?: string;
}