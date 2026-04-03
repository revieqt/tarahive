import nodemailer from "nodemailer";
import { AppType } from "./notification.types";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default class EmailService {
  static async send(email: string, subject: string, body: string, app: AppType) {
    return await transporter.sendMail({
      from: `"${app}" <no-reply@${app}.com>`,
      to: email,
      subject,
      text: body,
    });
  }
}