export type NotificationPayload = {
  title?: string;
  body: string;
  data?: Record<string, any>;
};

export type NotificationProvider = "push" | "sms" | "email";

export type AppType = "tarag" | "veehive";