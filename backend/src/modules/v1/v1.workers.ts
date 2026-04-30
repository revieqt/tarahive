import { initializeAuthWorker } from './auth/auth.worker';

export const initializeV1Workers = async () => {
  await initializeAuthWorker();
};