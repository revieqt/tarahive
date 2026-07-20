import { useMutation } from '@tanstack/react-query';
import { useSession } from '@/features/auth/context/SessionContext';
import { updateUserSafetySettings, UpdateSafetySettingsPayload } from '../services/sosService';
import { showError, showInfo } from '@/shared/services/toast.service';

export const useUpdateSafetySettings = () => {
  const { session, updateSession } = useSession();

  const mutation = useMutation({
    mutationFn: async (payload: UpdateSafetySettingsPayload) => {
      const currentDelivery = session?.user?.safetyState?.delivery;
      const currentEmergencyContact = session?.user?.safetyState?.emergencyContact;

      const hasChanges =
        currentDelivery?.isEmailEnabled !== payload.delivery.isEmailEnabled ||
        currentDelivery?.isSMSEnabled !== payload.delivery.isSMSEnabled ||
        currentDelivery?.alertLang !== payload.delivery.alertLang ||
        currentEmergencyContact?.email !== payload.emergencyContact?.email ||
        currentEmergencyContact?.phone !== payload.emergencyContact?.phone;

      if (!hasChanges) {
        return {
          success: true,
          message: 'No changes detected. Settings already up to date.',
        };
      }

      const response = await updateUserSafetySettings(payload);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update safety settings');
      }

      return response;
    },
    onSuccess: async (_response, payload) => {
      try {
        await updateSession({
          user: {
            ...(session?.user || {}),
            safetyState: {
              isInAnEmergency: session?.user?.safetyState?.isInAnEmergency ?? false,
              emergencyType: session?.user?.safetyState?.emergencyType,
              emergencyNote: session?.user?.safetyState?.emergencyNote,
              emergencyContact: {
                email: payload.emergencyContact?.email,
                phone: payload.emergencyContact?.phone,
              },
              lastKnownLocation: session?.user?.safetyState?.lastKnownLocation,
              delivery: {
                ...session?.user?.safetyState?.delivery,
                ...payload.delivery,
              },
            },
          } as any,
        });

        showInfo('Success', _response.message || 'Safety settings updated successfully');
      } catch (error: any) {
        showError('Error', error.message || 'Failed to update local session');
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to update safety settings';
      showError('Error', errorMsg);
    },
  });

  return {
    updateSafetySettings: mutation.mutate,
    updateSafetySettingsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    status: mutation.status,
    reset: mutation.reset,
  };
};
