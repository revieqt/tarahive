import { createDeliveryQueue, createDeliveryQueueEvents } from './delivery.service';
import { EmailPayload } from './delivery.types';

export interface EmailDeliveryJobData {
  payload: EmailPayload;
}

export const emailDeliveryQueue = createDeliveryQueue<EmailDeliveryJobData>('delivery-email', {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000,
  },
  removeOnComplete: {
    age: 86400,
    count: 1000,
  },
  removeOnFail: {
    age: 86400,
    count: 1000,
  },
});

export const emailDeliveryQueueEvents = createDeliveryQueueEvents('delivery-email');

emailDeliveryQueueEvents.on('completed', ({ jobId }: any) => {
  console.log(`✅ Email delivery job ${jobId} completed`);
});

emailDeliveryQueueEvents.on('failed', ({ jobId, failedReason }: any) => {
  console.error(`❌ Email delivery job ${jobId} failed: ${failedReason}`);
});

emailDeliveryQueueEvents.on('progress', ({ jobId, data }: any) => {
  console.log(`🟡 Email delivery job ${jobId} progress: ${data}%`);
});

export const addEmailDeliveryJob = async (data: EmailDeliveryJobData) => {
  try {
    const job = await emailDeliveryQueue.add('send-email', data, {
      priority: 5,
    });
    console.log('🟡 Email delivery job added to queue:', {
      jobId: job.id,
      to: data.payload.to,
      subject: data.payload.subject,
    });
    return job;
  } catch (error) {
    console.error('❌ Error adding email delivery job to queue:', error);
    throw error;
  }
};

export const queueEmail = async (payload: EmailPayload) => {
  return await addEmailDeliveryJob({ payload });
};

