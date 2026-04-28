import { initializeAuthWorker } from './auth/auth.worker';
import { initializeLogsExportWorker } from './user/logs-export.worker';

export const initializeV1Workers = async () => {
  await initializeAuthWorker();
  await initializeLogsExportWorker();
};