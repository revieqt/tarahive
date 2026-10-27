import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { createRoom } from '@/services/roomService';
import { showError, showSuccess } from '@/services/toast.service';
import { CreateRoomRequest, CreateRoomResponse } from '@/types/roomTypes';
import { Itinerary } from '@/types/itineraryTypes';

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

export const useCreateRoom = () => {
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    startDate?: string | string[];
    endDate?: string | string[];
  }>();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [itineraryId, setItineraryId] = useState(() => firstParam(params.id));
  const [itineraryTitle, setItineraryTitle] = useState(() => firstParam(params.title));
  const [itineraryStartDate, setItineraryStartDate] = useState(() => firstParam(params.startDate));
  const [itineraryEndDate, setItineraryEndDate] = useState(() => firstParam(params.endDate));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error('Name is required');
      }
      if (name.trim().length > 255) {
        throw new Error('Name must be 255 characters or fewer');
      }

      const request: CreateRoomRequest = {
        name: name.trim(),
        ...(itineraryId ? { itineraryId } : {}),
      };

      return await createRoom(request);
    },

    onSuccess: (data: CreateRoomResponse) => {
      if (!data.roomId) {
        showError('Create Error', 'Room was created but no room ID was returned');
        return;
      }

      showSuccess('Success', data.message);
      queryClient.invalidateQueries({ queryKey: ['user-rooms'] });
      router.replace(`/room/${data.roomId}`);
    },

    onError: (error: Error) => {
      const errorMsg = error?.message || 'Failed to create room';
      showError('Create Error', errorMsg);
    },
  });

  const selectItinerary = (itinerary: Itinerary) => {
    setItineraryId(itinerary.id);
    setItineraryTitle(itinerary.title);
    setItineraryStartDate(itinerary.startDate);
    setItineraryEndDate(itinerary.endDate);
    setIsPickerVisible(false);
  };

  return {
    name,
    setName,
    isPickerVisible,
    openItineraryPicker: () => setIsPickerVisible(true),
    closeItineraryPicker: () => setIsPickerVisible(false),
    itineraryId,
    itineraryTitle,
    itineraryStartDate,
    itineraryEndDate,
    selectItinerary,
    create: () => mutation.mutate(),
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};
