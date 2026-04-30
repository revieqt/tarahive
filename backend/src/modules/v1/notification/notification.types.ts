export type NotificationPayload = {
  title?: string;
  body: string;
  data?: Record<string, any>;
};

export type EmailPayload = {
  to: string | string[];
  subject: string;
  content?: string;
  rawHtml?: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    path: string;
  }[];
};

export type NotificationProvider = "push" | "sms" | "email";