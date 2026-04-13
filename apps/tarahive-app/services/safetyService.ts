import { BACKEND_URL } from '@/constants/Config';
import { DeviceInfo } from '@/hooks/useDeviceInfo';

const API_URL = `${BACKEND_URL}/api/safety`;

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
  data?: any;
}

/**
 * Enable SOS - Activate emergency mode
 */
export const enableSOS = async (
  request: EnableSOSRequest,
  accessToken: string
): Promise<SafetyResponse> => {
  try {
    const response = await fetch(`${API_URL}/enable-sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to enable SOS');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to enable SOS';
    throw new Error(errorMsg);
  }
};

/**
 * Disable SOS - Deactivate emergency mode
 */
export const disableSOS = async (
  accessToken: string,
  device?: Partial<DeviceInfo>
): Promise<SafetyResponse> => {
  try {
    const response = await fetch(`${API_URL}/disable-sos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        device: device ? {
          deviceId: device.deviceId,
          brand: device.brand,
          model: device.model,
          os: device.os,
          osVersion: device.osVersion,
          deviceType: device.deviceType,
          appVersion: device.appVersion,
        } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to disable SOS');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to disable SOS';
    throw new Error(errorMsg);
  }
};
