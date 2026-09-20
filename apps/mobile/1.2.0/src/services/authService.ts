import { api } from '@/api/client';
import { formatDeviceInfo } from '@/utils/deviceFormatter';
import { DeviceInfo } from '@/hooks/shared/useDeviceInfo';
import { VerificationResponse } from '@/types/auth.types';

const API_URL = '/v2/auth';

/**
 * Send email verification code (for resending)
 */
export const sendEmailVerificationCode = async (
  email: string,
  device?: DeviceInfo
): Promise<VerificationResponse> => {
  const payload = {
    email,
    device: device ? formatDeviceInfo(device) : undefined,
  };

  return await api.post<VerificationResponse>(`${API_URL}/email/request`, payload);
};

/**
 * Verify email with code and complete registration
 */
export const verifyEmail = async (
  email: string,
  code: string,
  device?: DeviceInfo
): Promise<VerificationResponse> => {
  const payload = {
    email,
    code,
    device: device ? formatDeviceInfo(device) : undefined,
  };

  return await api.post<VerificationResponse>(`${API_URL}/email/verify`, payload);
};