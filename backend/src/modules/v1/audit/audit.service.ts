import { AppDataSource } from "../../../config/postgres";
import { Log } from "./audit.entity";
import { LogSeverity, AuditLogPayload } from "./audit.types";
import { maskIP } from "../../../utils/maskIP";

class LogActionClass {
  private static logRepo = AppDataSource.getRepository(Log);
  private static instance: LogActionClass;

  static get(): LogActionClass {
    if (!LogActionClass.instance) {
      LogActionClass.instance = new LogActionClass();
    }
    return LogActionClass.instance;
  }

  async log(payload: AuditLogPayload): Promise<void> {
    try {
      const log = LogActionClass.logRepo.create({
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

      await LogActionClass.logRepo.save(log);
    } catch (err) {
      // 🚨 NEVER break app flow because logging failed
      console.error("[AuditService] Failed to write log:", err);
    }
  }

  /**
   * Shortcut for success logs
   */
  async info(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.INFO,
      success: payload.success ?? true,
    });
  }

  /**
   * Shortcut for warnings
   */
  async warn(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.WARNING,
      success: payload.success ?? false,
    });
  }

  /**
   * Shortcut for errors
   */
  async error(payload: AuditLogPayload): Promise<void> {
    return this.log({
      ...payload,
      severity: LogSeverity.ERROR,
      success: false,
    });
  }
}

// Singleton instance for easy usage: LogAction() or LogAction.info()
const LogAction = LogActionClass.get();

export { LogAction };