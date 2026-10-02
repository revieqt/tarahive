import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showSuccess } from '@/services/toast.service';
import { updateItinerary } from '@/services/itineraryService';
import {
  Itinerary,
  ItineraryUpdateValues,
  UpdateItineraryPayload,
} from '@/types/itineraryTypes';

type ItineraryChanges = Partial<ItineraryUpdateValues>;

const getChanges = (
  itinerary: Itinerary,
  values: ItineraryUpdateValues
): ItineraryChanges => {
  const changes: ItineraryChanges = {};

  if (values.title !== itinerary.title) changes.title = values.title;
  if (values.type !== itinerary.type) changes.type = values.type;
  if (values.privacy !== itinerary.privacy) changes.privacy = values.privacy;
  if (values.themeColor !== itinerary.themeColor) changes.themeColor = values.themeColor;

  const originalStart = new Date(itinerary.startDate).getTime();
  const originalEnd = new Date(itinerary.endDate).getTime();
  if ((values.startDate?.getTime() ?? null) !== originalStart) changes.startDate = values.startDate;
  if ((values.endDate?.getTime() ?? null) !== originalEnd) changes.endDate = values.endDate;

  if (JSON.stringify(values.content ?? []) !== JSON.stringify(itinerary.content ?? [])) {
    changes.content = values.content;
  }

  const generalPermissions = itinerary.generalPermissions ?? {
    allowSharing: true,
    allowCopying: true,
  };
  if (values.allowSharing !== generalPermissions.allowSharing) {
    changes.allowSharing = values.allowSharing;
  }
  if (values.allowCopying !== generalPermissions.allowCopying) {
    changes.allowCopying = values.allowCopying;
  }

  return changes;
};

const validateChanges = (itinerary: Itinerary, changes: ItineraryChanges) => {
  if (changes.title !== undefined && !changes.title.trim()) {
    throw new Error('Title cannot be empty');
  }
  if (changes.type !== undefined && !changes.type.trim()) {
    throw new Error('Type cannot be empty');
  }
  if (changes.themeColor !== undefined && !changes.themeColor.trim()) {
    throw new Error('Theme color cannot be empty');
  }

  const startDate = changes.startDate === undefined
    ? new Date(itinerary.startDate)
    : changes.startDate;
  const endDate = changes.endDate === undefined
    ? new Date(itinerary.endDate)
    : changes.endDate;

  if (!startDate || Number.isNaN(startDate.getTime())) {
    throw new Error('Start date is invalid');
  }
  if (!endDate || Number.isNaN(endDate.getTime())) {
    throw new Error('End date is invalid');
  }
  if (startDate > endDate) {
    throw new Error('Start date must not be after end date');
  }

  if (Object.prototype.hasOwnProperty.call(changes, 'content')) {
    try {
      JSON.stringify(changes.content);
    } catch {
      throw new Error('Itinerary content is invalid');
    }
  }
};

const toPayload = (
  itineraryId: string,
  changes: ItineraryChanges
): UpdateItineraryPayload => {
  const payload: UpdateItineraryPayload = { itineraryId };

  if (changes.title !== undefined) payload.title = changes.title;
  if (changes.type !== undefined) payload.type = changes.type;
  if (changes.privacy !== undefined) payload.privacy = changes.privacy;
  if (changes.themeColor !== undefined) payload.themeColor = changes.themeColor;
  if (changes.content !== undefined) payload.content = changes.content;
  if (changes.startDate !== undefined && changes.startDate !== null) {
    payload.startDate = changes.startDate.toISOString();
  }
  if (changes.endDate !== undefined && changes.endDate !== null) {
    payload.endDate = changes.endDate.toISOString();
  }
  if (changes.allowSharing !== undefined) payload.allowSharing = changes.allowSharing;
  if (changes.allowCopying !== undefined) payload.allowCopying = changes.allowCopying;

  return payload;
};

export const useUpdateItinerary = (
  itinerary: Itinerary | undefined,
  values: ItineraryUpdateValues
) => {
  const queryClient = useQueryClient();
  const changes = itinerary ? getChanges(itinerary, values) : {};
  const hasChanges = Boolean(itinerary && Object.keys(changes).length);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateItineraryPayload) => {
      const response = await updateItinerary(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update itinerary');
      }
      return response;
    },
    onSuccess: async (response, payload) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['itinerary', payload.itineraryId] }),
        queryClient.invalidateQueries({ queryKey: ['user-itineraries'] }),
      ]);
      showSuccess('Success', response.message || 'Itinerary updated successfully');
    },
    onError: (error: Error) => {
      showError('Update Error', error.message || 'Failed to update itinerary');
    },
  });

  const save = () => {
    if (!itinerary || !hasChanges) return;

    try {
      validateChanges(itinerary, changes);
      mutation.mutate(toPayload(itinerary.id, changes));
    } catch (error) {
      showError('Update Error', error instanceof Error ? error.message : 'Invalid itinerary changes');
    }
  };

  return {
    save,
    hasChanges,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};