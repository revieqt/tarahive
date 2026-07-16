import admin from "firebase-admin";
import nodemailer from "nodemailer";
import twilio from "twilio";
import { NotificationPayload, EmailPayload } from "./notification.types";

// ─── Nodemailer ───────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || 'revie.dev@gmail.com',
    pass: process.env.EMAIL_PASS || 'yojh kbxk azmy fvnt',
  },
});

// ─── Twilio ───────────────────────────────────────────────────────────────────

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// ─── Email Template ───────────────────────────────────────────────────────────

const baseTemplate = (innerContent: string) => `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
    rel="stylesheet">
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      margin: auto;
      padding: 3%;
      border-radius: 8px;
    }

    .header {
      align-items: center;
      justify-content: center;
      text-align: center;
      margin-bottom: 20px;
    }

    .content {
      padding-top: 20px;
      padding-bottom: 20px;
      color: #111827;
      font-size: 15px;
      line-height: 1.6;
      border-radius: 10px;
    }

    .title {
      height: 20px;
      margin-top: 0px
    }

    .underline {
      width: 100%;
      height: 1px;
      background-color: #ccc;
    }

    .fadeText {
      font-size: small;
      opacity: .5;
      height: 10px;
      text-align: center;
      margin-bottom: 20px;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <img src="https://tarag.vercel.app/icon.png" alt="TaraHive Logo" width="50" height="50"
        style="display:block; border:0; outline:none; text-decoration:none; margin: 0 auto">
      <h1 class="title">Tarahive</h1>
      <p>Mobile Travel Companion</p>
      <p class="fadeText">© ${new Date().getFullYear()}, This is an automated message. Please do not reply.</p>
    </div>

    <div class="underline"></div>

    <div class="content">
      ${innerContent}
    </div>
  </div>

</body>

</html>
`;

// ─── Push Notification ────────────────────────────────────────────────────────

async function getUserPushTokens(userId: string) {
  return [
    { type: "fcm", value: "fcmTokenHere" },
    { type: "expo", value: "ExponentPushToken[xxxx]" },
  ];
}

export const sendPushNotification = async (
  userId: string,
  payload: NotificationPayload,
) => {
  const userTokens = await getUserPushTokens(userId);

  const messages = userTokens.map((token) => {
    if (token.type === "fcm") {
      return {
        token: token.value,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      };
    } else {
      return {
        to: token.value,
        sound: "default",
        title: payload.title,
        body: payload.body,
        data: payload.data,
      };
    }
  });

  const promises = messages.map((msg) => {
    if ("token" in msg) return admin.messaging().send(msg as admin.messaging.Message);
  });

  return await Promise.all(promises);
};

// ─── Email ────────────────────────────────────────────────────────────────────

export const sendEmail = async (payload: EmailPayload) => {
  const { to, subject, content, rawHtml, text, cc, bcc, attachments } = payload;

  if (!content && !rawHtml) {
    throw new Error("Either content or rawHtml is required");
  }

  const html = rawHtml || baseTemplate(content!);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  };

  try {
    console.log("📧 sendEmail - Sending to:", to);
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ sendEmail - Success, messageId:", info.messageId);

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error("❌ sendEmail - Error:", error);
    throw error;
  }
};

// ─── SMS ──────────────────────────────────────────────────────────────────────

export const sendSMS = async (phone: string, message: string) => {
  return await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};