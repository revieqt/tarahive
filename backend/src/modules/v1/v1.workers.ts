import { initializeAuthWorker } from './auth/auth.worker';
import { initializeSosWorker } from './sos/sos.worker';

export const initializeV1Workers = async () => {
  await initializeAuthWorker();
  await initializeSosWorker();
};