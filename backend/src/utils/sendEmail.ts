import nodemailer from "nodemailer";

type EmailPayload = {
  to: string | string[];
  subject: string;

  /** Inner HTML content injected into the base template */
  content?: string;

  /** Raw HTML (bypasses base template wrapping) */
  rawHtml?: string;

  /** Optional plain text fallback */
  text?: string;

  cc?: string | string[];
  bcc?: string | string[];
  attachments?: {
    filename: string;
    path: string;
  }[];
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true' ? true : false, // false for port 587 (STARTTLS), true for 465 (implicit TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const baseTemplate = (innerContent: string) => `
<!DOCTYPE html>

<html>
<head>
  <meta charset="UTF-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f4f4f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #4f46e5;
      padding: 24px;
      border-radius: 8px;
    }
    .header {
      text-align: center;
      color: #fff
    }
    .content {
      padding: 20px;
      color: #111827;
      font-size: 15px;
      line-height: 1.6;
      background-color: #fff;
      border-radius: 10px;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      font-size: 12px;
      color: #fff;
      text-align: center;
    }
    a.button {
      display: inline-block;
      margin-top: 16px;
      padding: 10px 16px;
      background: #4f46e5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>TaraG</h1>
      <p>Mobile Travel Companion</p>
    </div>

    <div class="content">
      ${innerContent}
    </div>

    <div class="footer">
      © ${new Date().getFullYear()}
      <br />This is an automated message. Please do not reply.
    </div>
  </div>
</body>
</html>
`;

/**
 * Reusable email sender
 * Callers inject ONLY inner content (uses base template)
 * OR provide rawHtml for complete HTML control
 */
export const sendEmail = async (payload: EmailPayload) => {
  const {
    to,
    subject,
    content,
    rawHtml,
    text,
    cc,
    bcc,
    attachments
  } = payload;

  if (!content && !rawHtml) {
    throw new Error("Either content or rawHtml is required");
  }

  // Use rawHtml if provided, otherwise wrap content in base template
  const html = rawHtml || baseTemplate(content!);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments
  };

  try {
    console.log('📧 sendEmail - Sending to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ sendEmail - Success, messageId:', info.messageId);

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    console.error('❌ sendEmail - Error:', error);
    throw error;
  }
};
