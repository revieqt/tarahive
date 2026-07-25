import { DeviceInfo } from '@/shared/hooks/useDeviceInfo';

export interface FormattedDevice {
  deviceId: string;
  brand: string;
  model: string;
  os: string;
  type: string;
  appVersion: string;
}

/**
 * Format device info from hook to API request format
 */
export const formatDeviceInfo = (deviceInfo: DeviceInfo): FormattedDevice => {
  return {
    deviceId: deviceInfo.deviceId,
    brand: deviceInfo.brand || 'Unknown',
    model: deviceInfo.model || 'Unknown',
    os: deviceInfo.os,
    type: deviceInfo.deviceType,
    appVersion: deviceInfo.appVersion || '1.0.0',
  };
};
