import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase Realtime Database for chat messaging
 *
 * To set up:
 * 1. Get service account JSON from Firebase Console
 * 2. Set FIREBASE_SERVICE_ACCOUNT_PATH env variable OR
 * 3. Set FIREBASE_DATABASE_URL in .env
 */

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = (): admin.app.App => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!credentialsPath) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_PATH not set in environment variables'
      );
    }

    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Firebase credentials file not found: ${credentialsPath}`);
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(credentialsPath, 'utf-8')
    );

    const databaseURL = process.env.FIREBASE_DATABASE_URL;

    if (!databaseURL) {
      throw new Error('FIREBASE_DATABASE_URL not set in environment variables');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });

    console.log('✓ Firebase Realtime Database initialized');
    return firebaseApp;
  } catch (error) {
    console.error(
      '✗ Firebase initialization failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
};

export const getDatabase = (): admin.database.Database => {
  if (!firebaseApp) {
    initializeFirebase();
  }
  return admin.database();
};

export default {
  initializeFirebase,
  getDatabase,
};
