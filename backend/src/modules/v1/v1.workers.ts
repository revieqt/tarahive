import { initializeAuthWorker } from './auth/auth.worker';
import { initializeLogsExportWorker } from './users/logs-export.worker';

export const initializeV1Workers = async () => {
  await initializeAuthWorker();
  await initializeLogsExportWorker();
};