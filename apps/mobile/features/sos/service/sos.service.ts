import { BACKEND_URL } from '@/constants/Config';
import { DeviceInfo } from '@/hooks/useDeviceInfo';
import { api } from '@/shared/api/client';

const API_URL = `${BACKEND_URL}/v1/sos`;

export interface EnableSOSRequest {
  emergencyType: string;
  message?: string;
  latitude: number;
  longitude: number;
  device?: Partial<DeviceInfo>;
}

export interface SafetyResponse {
  success: boolean;
  message: string;
}

/**
 * Enable SOS - Activate emergency mode
 */
export const enableSOS = async (
  request: EnableSOSRequest,
): Promise<SafetyResponse> => {
  const payload = {
    emergencyType: request.emergencyType,
    message: request.message,
    latitude: request.latitude,
    longitude: request.longitude,
    device: request.device ? {
        deviceId: request.device.deviceId,
        brand: request.device.brand,
        model: request.device.model,
        os: request.device.os,
        osVersion: request.device.osVersion,
        deviceType: request.device.deviceType,
        appVersion: request.device.appVersion,
    } : undefined,
  };

  return await api.post<SafetyResponse>(`${API_URL}/enable-sos`, payload);
};

/**
 * Disable SOS - Deactivate emergency mode
 */
export const disableSOS = async (
  device?: Partial<DeviceInfo>
): Promise<SafetyResponse> => {
  const payload = {
    device: device ? {
        deviceId: device.deviceId,
        brand: device.brand,
        model: device.model,
        os: device.os,
        osVersion: device.osVersion,
        deviceType: device.deviceType,
        appVersion: device.appVersion,
    } : undefined,
  };

  return await api.post<SafetyResponse>(`${API_URL}/disable-sos`, payload);
};