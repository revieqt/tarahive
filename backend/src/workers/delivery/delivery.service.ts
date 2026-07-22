import * as nodemailer from 'nodemailer';
import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import redis from '../../config/redis';
import { EmailPayload } from './delivery.types';

export const createDeliveryQueue = <T>(
  queueName: string,
  defaultJobOptions: JobsOptions,
): Queue<T, any, string, T, any, string> => {
  return new Queue<T, any, string, T, any, string>(queueName, {
    connection: redis as any,
    defaultJobOptions,
  });
};

export const createDeliveryQueueEvents = (queueName: string): QueueEvents => {
  return new QueueEvents(queueName, {
    connection: redis as any,
  });
};

export const enqueueDeliveryJob = async <T>(
  queue: Queue<T, any, string, T, any, string>,
  name: string,
  data: T,
  options?: JobsOptions,
) => {
  try {
    const job = await queue.add(name, data, options);
    console.log(`🟡 Delivery job added to queue ${queue.name}:`, {
      jobId: job.id,
      queue: queue.name,
      jobName: name,
    });
    return job;
  } catch (error) {
    console.error(`❌ Error adding job ${name} to delivery queue ${queue.name}:`, error);
    throw error;
  }
};

const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Missing SMTP credentials: set EMAIL_USER and EMAIL_PASSWORD or EMAIL_PASS');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user,
      pass,
    },
  });
};

// const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

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
      <img src="https://tarahive.vercel.app/icon.png" alt="TaraHive Logo" width="50" height="50"
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

export const sendEmail = async (payload: EmailPayload) => {
  const { to, subject, content, rawHtml, text, cc, bcc, attachments } = payload;

  if (!content && !rawHtml) {
    throw new Error('Either content or rawHtml is required');
  }

  if (process.env.EMAIL_SKIP_SEND === 'true') {
    console.log('⏭️ sendEmail - EMAIL_SKIP_SEND=true, skipping actual SMTP send');
    console.log('📧 sendEmail - would send to:', to, 'subject:', subject);
    return {
      messageId: 'EMAIL_SKIP_SEND',
      accepted: Array.isArray(to) ? to : [to],
      rejected: [],
    };
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
    console.log('📧 sendEmail - Sending to:', to);
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ sendEmail - Success, messageId:', info.messageId);
    console.log('📧 sendEmail - accepted:', info.accepted, 'rejected:', info.rejected, 'response:', info.response);

    return {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error('❌ sendEmail - Error:', error);
    throw error;
  }
};