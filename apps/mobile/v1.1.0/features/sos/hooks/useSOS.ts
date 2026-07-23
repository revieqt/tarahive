import { useState } from 'react';
import { router } from 'expo-router';
import { enableSOS, disableSOS, type EnableSOSRequest } from '../services/sosService';
import { useSession } from '@/features/auth/context/SessionContext';
import { useDeviceInfo, type DeviceInfo } from '@/shared/hooks/useDeviceInfo';
import { showError, showSuccess } from '@/shared/services/toast.service';

/**
 * Custom hook for SOS operations
 * Handles enableSOS and disableSOS with session updates
 */
export const useSafety = () => {
  const { session, updateSession } = useSession();
  const deviceInfo = useDeviceInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnableSOS = async (request: EnableSOSRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await enableSOS({
        ...request,
        device: deviceInfo.isLoaded ? deviceInfo : undefined,
      });

      if (session?.user) {
        await updateSession({
          user: {
            ...session.user,
            safetyState: {
              isInAnEmergency: true,
              emergencyType: request.emergencyType,
              lastKnownLocation: {
                locationName: '',
                latitude: request.latitude,
                longitude: request.longitude,
              },
            },
          },
        });
      }

      showSuccess('SOS Activated', response.message || 'Emergency alert has been sent');
      router.back();

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enable SOS';
      setError(errorMsg);
      showError('Failed to enable SOS', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSOS = async (device?: Partial<DeviceInfo>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await disableSOS(device ?? (deviceInfo.isLoaded ? deviceInfo : undefined));

      if (session?.user) {
        await updateSession({
          user: {
            ...session.user,
            safetyState: {
              isInAnEmergency: false,
              emergencyType: '',
              emergencyContact: session.user.safetyState?.emergencyContact,
              lastKnownLocation: undefined,
            },
          },
        });
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable SOS';
      setError(errorMsg);
      showError('Failed to disable SOS', errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleEnableSOS,
    handleDisableSOS,
    isLoading,
    error,
  };
};