import { NotificationPayload, AppType } from "./types";
import admin from "firebase-admin";
import { Expo } from "expo-server-sdk";

// Initialize Firebase Admin (FCM)
const serviceAccount = require("../../config/firebase-service-account.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Expo SDK
const expo = new Expo();

export default class PushService {
  static async send(userId: string, payload: NotificationPayload, app: AppType) {
    // TODO: Fetch user push tokens from DB
    const userTokens = await getUserPushTokens(userId, app);

    const messages = userTokens.map((token) => {
      if (token.type === "fcm") {
        // FCM
        return {
          token: token.value,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data,
        };
      } else if (token.type === "expo") {
        // Expo
        return {
          to: token.value,
          sound: "default",
          title: payload.title,
          body: payload.body,
          data: payload.data,
        };
      }
    });

    // Send messages
    const promises = messages.map((msg) => {
      if ("token" in msg) return admin.messaging().send(msg);
      else return expo.sendPushNotificationsAsync([msg]);
    });

    return await Promise.all(promises);
  }
}

// Mock function to fetch push tokens
async function getUserPushTokens(userId: string, app: AppType) {
  // Fetch from MongoDB: store user tokens with type 'fcm' or 'expo'
  return [
    { type: "fcm", value: "fcmTokenHere" },
    { type: "expo", value: "ExponentPushToken[xxxx]" },
  ];
}