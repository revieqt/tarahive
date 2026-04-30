import admin from "firebase-admin";

let firebaseApp: admin.app.App;

export function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is not set");
  }

  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT JSON");
  }

  const serviceAccount: admin.ServiceAccount = {
    projectId: parsed.project_id,
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key?.replace(/\\n/g, "\n"),
  };

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseApp;
}