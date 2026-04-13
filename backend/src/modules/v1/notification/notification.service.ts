import { NotificationPayload, AppType } from "./notification.types";
import PushService from "./push.service";
import SMSService from "./sms.service";
import EmailService from "./email.service";

class NotificationsService {
  async sendPush(
    userId: string,
    payload: NotificationPayload,
    app: AppType
  ) {
    // PushService internally handles Expo vs FCM
    return await PushService.send(userId, payload, app);
  }

  async sendSMS(phone: string, message: string, app: AppType) {
    return await SMSService.send(phone, message, app);
  }

  async sendEmail(email: string, subject: string, body: string, app: AppType) {
    return await EmailService.send(email, subject, body, app);
  }
}

export default new NotificationsService();