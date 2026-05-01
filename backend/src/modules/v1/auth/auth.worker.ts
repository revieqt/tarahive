import { Worker } from 'bullmq';
import redis from '../../../config/redis';
import { sendEmail } from '../notification/delivery.service';
import { SendVerificationEmailJobData, SendPasswordResetEmailJobData } from './auth.queue';

/**
 * Generate HTML content for verification email
 */
const generateVerificationEmailContent = (code: string): string => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        Please use the following code to verify your email address:
      </p>
      <div style="background-color: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 48px; letter-spacing: 10px; margin: 0; color: #4f46e5; font-weight: bold;">
          ${code}
        </h1>
      </div>
      <p style="color: #999; font-size: 14px;">
        This code will expire in 30 minutes.
      </p>
      <p style="color: #999; font-size: 14px;">
        If you didn't request this verification, please ignore this email.
      </p>
    </div>
  `;
};

/**
 * Generate HTML content for 2FA email
 */
const generate2FAEmailContent = (code: string): string => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #333; margin-bottom: 20px;">Two-Factor Authentication</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        Your authentication code is:
      </p>
      <div style="background-color: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 48px; letter-spacing: 10px; margin: 0; color: #4f46e5; font-weight: bold;">
          ${code}
        </h1>
      </div>
      <p style="color: #999; font-size: 14px;">
        This code will expire in 15 minutes.
      </p>
      <p style="color: #d32f2f; font-size: 14px; font-weight: bold;">
        Do not share this code with anyone. We will never ask you for this code.
      </p>
    </div>
  `;
};

/**
 * Generate HTML content for password reset email
 */
const generatePasswordResetEmailContent = (code: string): string => {
  return `
    <div style="text-align: center;">
      <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="color: #666; font-size: 16px; margin-bottom: 20px;">
        We received a request to reset your password. Use the code below to proceed:
      </p>
      <div style="background-color: #f5f5f5; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
        <h1 style="font-size: 48px; letter-spacing: 10px; margin: 0; color: #4f46e5; font-weight: bold;">
          ${code}
        </h1>
      </div>
      <p style="color: #999; font-size: 14px;">
        This code will expire in 30 minutes.
      </p>
      <p style="color: #d32f2f; font-size: 14px;">
        If you didn't request a password reset, please ignore this email or contact support if you need assistance.
      </p>
    </div>
  `;
};

/**
 * Auth Queue Worker
 * Processes email verification and 2FA jobs
 */
export const authWorker = new Worker(
  'auth',
  async (job) => {
    console.log(`🔄 Processing auth job: ${job.name} (ID: ${job.id})`);

    try {
      if (job.name === 'send-verification-email') {
        const data = job.data as SendVerificationEmailJobData;
        
        await sendEmail({
          to: data.email,
          subject: 'Tarahive Email Verification',
          content: generateVerificationEmailContent(data.code),
        });

        console.log(`✅ Verification email sent to ${data.email}`);
        return { success: true, email: data.email };
      }
      
      if (job.name === 'send-password-reset-email') {
        const data = job.data as SendPasswordResetEmailJobData;
        
        await sendEmail({
          to: data.email,
          subject: 'Tarahive - Password Reset Code',
          content: generatePasswordResetEmailContent(data.code),
        });

        console.log(`✅ Password reset email sent to ${data.email}`);
        return { success: true, email: data.email };
      }

      throw new Error(`Unknown job type: ${job.name}`);
    } catch (error) {
      console.error(`❌ Error processing auth job ${job.id}:`, error);
      throw error;
    }
  },
  {
    connection: redis as any,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

authWorker.on('completed', (job) => {
  console.log(`✅ Auth job ${job.id} (${job.name}) completed successfully`);
});

authWorker.on('failed', (job, error) => {
  console.error(
    `❌ Auth job ${job?.id} (${job?.name}) failed:`,
    error?.message
  );
});

authWorker.on('error', (error) => {
  console.error('❌ Auth worker error:', error);
});

/**
 * Initialize the auth worker
 */
export const initializeAuthWorker = async () => {
  try {
    console.log('🟡 Initializing Auth Worker...');
    // Worker is already instantiated above, just ensure it's running
    console.log('✅ Auth Worker initialized');
  } catch (error) {
    console.error('❌ Error initializing Auth Worker:', error);
    throw error;
  }
};