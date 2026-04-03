import { Queue, QueueEvents } from 'bullmq';
import redis from '../../config/redis';

export interface LogsExportJobData {
  userId: string;
  email: string;
  startDate: Date;
  endDate: Date;
}

export const logsExportQueue = new Queue<LogsExportJobData>('logs-export', {
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

export const logsExportQueueEvents = new QueueEvents('logs-export', { connection: redis as any });

logsExportQueueEvents.on('completed', ({ jobId }: any) => {
  console.log(`✅ Logs export job ${jobId} completed`);
});

logsExportQueueEvents.on('failed', ({ jobId, failedReason }: any) => {
  console.error(`❌ Logs export job ${jobId} failed: ${failedReason}`);
});

logsExportQueueEvents.on('progress', ({ jobId, data }: any) => {
  console.log(`🟡 Logs export job ${jobId} progress: ${data}%`);
});

export const addLogsExportJob = async (data: LogsExportJobData) => {
  try {
    const job = await logsExportQueue.add('export-logs', data, {
      priority: 5, // Normal priority
    });
    console.log(`🟡 Logs export job added to queue:`, { jobId: job.id, userId: data.userId });
    return job;
  } catch (error) {
    console.error('❌ Error adding logs export job to queue:', error);
    throw error;
  }
};
