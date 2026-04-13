import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { BACKEND_URL } from '@/constants/Config';
import axios from "axios";
import { DeviceInfo } from '@/hooks/useDeviceInfo';

const API_URL = `${BACKEND_URL}/api/auth/google`;

GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
});

export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();

    // get tokens safely
    const tokens = await GoogleSignin.getTokens();

    return tokens.idToken;
  } catch (error) {
    console.error("Google Sign-in error:", error);
    return null;
  }
};

export const googleLogin = async (idToken: string, device?: Partial<DeviceInfo>) => {
  const response = await axios.post(`${API_URL}`, {
    idToken,
    device: device ? {
      deviceId: device.deviceId,
      brand: device.brand,
      model: device.model,
      os: device.os,
      osVersion: device.osVersion,
      deviceType: device.deviceType,
      appVersion: device.appVersion,
    } : undefined
  });

  return response.data;
};