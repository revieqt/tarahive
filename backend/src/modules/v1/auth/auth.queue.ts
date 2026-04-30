import { Queue, QueueEvents } from 'bullmq';
import redis from '../../../config/redis';

export interface SendVerificationEmailJobData {
  email: string;
  code: string;
}

export interface SendPasswordResetEmailJobData {
  email: string;
  code: string;
}

export const authQueue = new Queue<SendVerificationEmailJobData>('auth', {
  connection: redis as any,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const authQueueEvents = new QueueEvents('auth', { connection: redis as any });

authQueueEvents.on('completed', ({ jobId }: any) => {
  console.log(`✅ Auth job ${jobId} completed`);
});

authQueueEvents.on('failed', ({ jobId, failedReason }: any) => {
  console.error(`❌ Auth job ${jobId} failed: ${failedReason}`);
});

authQueueEvents.on('progress', ({ jobId, data }: any) => {
  console.log(`🟡 Auth job ${jobId} progress: ${data}%`);
});

/**
 * Queue email verification code sending
 */
export const addSendVerificationEmailJob = async (
  data: SendVerificationEmailJobData
) => {
  try {
    const job = await authQueue.add('send-verification-email', data, {
      priority: 10, // High priority for verification emails
    });
    console.log(`🟡 Send verification email job added to queue:`, {
      jobId: job.id,
      email: data.email,
    });
    return job;
  } catch (error) {
    console.error('❌ Error adding send verification email job to queue:', error);
    throw error;
  }
};

/**
 * Queue password reset email sending
 */
export const addSendPasswordResetEmailJob = async (
  data: SendPasswordResetEmailJobData
) => {
  try {
    const job = await authQueue.add('send-password-reset-email', data, {
      priority: 10, // High priority for password reset emails
    });
    console.log(`🟡 Password reset email job added to queue:`, {
      jobId: job.id,
      email: data.email,
    });
    return job;
  } catch (error) {
    console.error('❌ Error adding password reset email job to queue:', error);
    throw error;
  }
};