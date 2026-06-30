import { useState } from 'react';
import { enableSOS, disableSOS, type EnableSOSRequest } from '@/services/safetyService';
import { useSession } from '@/context/SessionContext';
import { DeviceInfo } from '@/hooks/useDeviceInfo';

/**
 * Custom hook for SOS operations
 * Handles enableSOS and disableSOS with session updates
 */
export const useSafety = () => {
  const { session, updateSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnableSOS = async (request: EnableSOSRequest) => {
    if (!session?.accessToken) {
      const errorMsg = 'Access token not found';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await enableSOS(request, session.accessToken);

      // Update session with new safety state
      if (session.user) {
        await updateSession({
          user: {
            ...session.user,
            safetyState: {
              isInAnEmergency: true,
              emergencyType: request.emergencyType,
              emergencyContact: session.user.safetyState?.emergencyContact,
            },
          },
        });
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enable SOS';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableSOS = async (device?: Partial<DeviceInfo>) => {
    if (!session?.accessToken) {
      const errorMsg = 'Access token not found';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await disableSOS(session.accessToken, device);

      // Update session to disable emergency mode
      if (session.user) {
        await updateSession({
          user: {
            ...session.user,
            safetyState: {
              isInAnEmergency: false,
              emergencyType: '',
              emergencyContact: session.user.safetyState?.emergencyContact,
            },
          },
        });
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable SOS';
      setError(errorMsg);
      throw err;
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