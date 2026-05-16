import { useEffect, useState } from "react";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateUUID } from "@/utils/generateUUID";

const DEVICE_ID_KEY = "tarag_device_id";


export interface DeviceInfo {
  deviceId: string;
  brand: string | null;
  model: string | null;
  os: string;
  osVersion: string | null;
  deviceType: string;
  appVersion: string | null;
  isLoaded: boolean;
}

export const useDeviceInfo = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    deviceId: "",
    brand: null,
    model: null,
    os: Device.osName ?? "Unknown",
    osVersion: Device.osVersion ?? null,
    deviceType: "Unknown",
    appVersion: null,
    isLoaded: false,
  });

  useEffect(() => {
    const loadDeviceInfo = async () => {
      try {
        // 1️⃣ Get or Create Device ID
        let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);

        if (!storedDeviceId) {
          storedDeviceId = generateUUID();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
        }

        // 2️⃣ Determine Device Type
        let type = "Unknown";
        switch (Device.deviceType) {
          case Device.DeviceType.PHONE:
            type = "Phone";
            break;
          case Device.DeviceType.TABLET:
            type = "Tablet";
            break;
          case Device.DeviceType.DESKTOP:
            type = "Desktop";
            break;
          case Device.DeviceType.TV:
            type = "TV";
            break;
        }

        setDeviceInfo({
          deviceId: storedDeviceId || "",
          brand: Device.brand ?? null,
          model: Device.modelName ?? null,
          os: Device.osName ?? "Unknown",
          osVersion: Device.osVersion ?? null,
          deviceType: type,
          appVersion: '2.0.0',
          isLoaded: true,
        });
      } catch (error) {
        console.error("Failed to load device info:", error);
        setDeviceInfo((prev) => ({
          ...prev,
          isLoaded: true,
        }));
      }
    };

    loadDeviceInfo();
  }, []);

  return deviceInfo;
};