import { Worker } from 'bullmq';
import redis from '../../config/redis';
import { sendEmail } from './delivery.service';
import { EmailDeliveryJobData } from './email.queue';

export const emailDeliveryWorker = new Worker<EmailDeliveryJobData>(
  'delivery-email',
  async (job) => {
    if (job.name !== 'send-email') {
      throw new Error(`Unknown email delivery job name: ${job.name}`);
    }

    const { payload } = job.data;
    console.log(`🔄 Processing email delivery job ${job.id} to ${payload.to}`);

    const result = await sendEmail(payload);
    console.log(`✅ Email delivery job ${job.id} sent with messageId: ${result.messageId}`);
    return result;
  },
  {
    connection: redis as any,
    concurrency: 5,
  }
);

emailDeliveryWorker.on('completed', (job) => {
  console.log(`✅ Email delivery job ${job.id} completed successfully`);
});

emailDeliveryWorker.on('failed', (job, error) => {
  console.error(`❌ Email delivery job ${job?.id} failed:`, error?.message || error);
});

emailDeliveryWorker.on('error', (error) => {
  console.error('❌ Email delivery worker error:', error);
});

export const initializeEmailDeliveryWorker = async () => {
  try {
    console.log('🟡 Initializing Email Delivery Worker...');
    await emailDeliveryWorker.waitUntilReady();
    console.log('✅ Email Delivery Worker is ready');
  } catch (error) {
    console.error('❌ Failed to initialize Email Delivery Worker:', error);
    throw error;
  }
};
