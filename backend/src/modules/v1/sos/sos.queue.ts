import { Queue, QueueEvents } from 'bullmq';
import redis from '../../../config/redis';

export interface SOSJobData {
  userID: string;
  emergencyType: string;
  message?: string;
  latitude: number;
  longitude: number;
}

// Create SOS queue using Redis connection
export const sosQueue = new Queue<SOSJobData>('sos', {
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

// Queue events listener
export const sosQueueEvents = new QueueEvents('sos', { connection: redis as any });

sosQueueEvents.on('completed', ({ jobId }: any) => {
  console.log(`✅ SOS job ${jobId} completed`);
});

sosQueueEvents.on('failed', ({ jobId, failedReason }: any) => {
  console.error(`❌ SOS job ${jobId} failed: ${failedReason}`);
});

sosQueueEvents.on('progress', ({ jobId, data }: any) => {
  console.log(`🟡 SOS job ${jobId} progress: ${data}%`);
});

export const addSOSJob = async (data: SOSJobData) => {
  try {
    const job = await sosQueue.add('process-sos', data, {
      priority: 10, // High priority
    });
    console.log(`🟡 SOS job added to queue:`, { jobId: job.id, userID: data.userID });
    return job;
  } catch (error) {
    console.error('❌ Error adding SOS job to queue:', error);
    throw error;
  }
};