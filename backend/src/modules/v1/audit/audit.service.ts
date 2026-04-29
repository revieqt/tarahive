import { AppDataSource } from "../../../config/postgres";
import { Log } from "./audit.entity";
import { LogSeverity } from "./audit.types";
import { maskIP } from "../../../utils/maskIP";

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

export class AuditService {
  private static logRepo = AppDataSource.getRepository(Log);

  static async log(payload: AuditLogPayload): Promise<void> {
    try {
      const log = this.logRepo.create({
        userId: payload.userId,

        action: payload.action,
        module: payload.module,
        description: payload.description,

        resourceType: payload.resourceType,
        resourceId: payload.resourceId,

        success: payload.success ?? true,
        errorMessage: payload.errorMessage,

        ip: maskIP(payload.ip),
        platform: payload.platform,

        device: payload.device,
        appInfo: payload.appInfo,

        severity: payload.severity ?? LogSeverity.INFO,
        metadataID: payload.metadataID,
        requestId: payload.requestId,
      });

      await this.logRepo.save(log);
    } catch (err) {
      // 🚨 NEVER break app flow because logging failed
      console.error("[AuditService] Failed to write log:", err);
    }
  }

  /**
   * Shortcut for success logs
   */
  static async info(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.INFO,
      success: payload.success ?? true,
    });
  }

  /**
   * Shortcut for warnings
   */
  static async warn(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.WARNING,
      success: payload.success ?? false,
    });
  }

  /**
   * Shortcut for errors
   */
  static async error(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.ERROR,
      success: false,
    });
  }
}