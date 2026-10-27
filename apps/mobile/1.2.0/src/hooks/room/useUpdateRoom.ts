import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { getRoomById, updateRoom } from '@/services/roomService';
import { showError, showInfo } from '@/services/toast.service';
import { Room, RoomImageUpload, RoomPrivacy, UpdateRoomPayload } from '@/types/roomTypes';

export const useUpdateRoom = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = Array.isArray(id) ? id[0] : id;
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<RoomPrivacy>('PRIVATE');
  const [themeColor, setThemeColor] = useState('#FF6B6B');
  const [roomImage, setRoomImage] = useState<RoomImageUpload | null>(null);
  const initializedRoomId = useRef<string | null>(null);

  const roomQuery = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => (roomId ? getRoomById(roomId) : null),
    enabled: Boolean(roomId),
    staleTime: 5 * 60 * 1000,
  });
  const room = roomQuery.data;

  useEffect(() => {
    if (!room || initializedRoomId.current === room.id) return;
    initializedRoomId.current = room.id;
    setName(room.name);
    setDescription(room.description ?? '');
    setPrivacy(room.privacy);
    setThemeColor(room.themeColor);
    setRoomImage(null);
  }, [room]);

  const mutation = useMutation({
    mutationFn: async (payload: UpdateRoomPayload) => {
      if (!roomId) throw new Error('Room ID is missing');
      const response = await updateRoom(roomId, payload);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update room');
      }
      return { data: response.data, message: response.message };
    },
    onSuccess: async ({ data: updatedRoom, message }) => {
      queryClient.setQueryData(['room', roomId], updatedRoom);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['room', roomId] }),
        queryClient.invalidateQueries({ queryKey: ['user-rooms'] }),
      ]);
      showInfo('Success', message || 'Room updated successfully');
      router.back();
    },
    onError: (error) => {
      showError('Update Error', error instanceof Error ? error.message : 'Failed to update room');
    },
  });

  const hasChanges = Boolean(room && (
    name.trim() !== room.name ||
    description.trim() !== (room.description ?? '') ||
    privacy !== room.privacy ||
    themeColor.trim() !== room.themeColor ||
    roomImage
  ));

  const chooseRoomImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.9,
        base64: true,
      });

      if (result.canceled) return;
      const image = result.assets[0];
      if (!image.base64) {
        showError('Image Error', 'Could not read the selected room image');
        return;
      }
      setRoomImage({ uri: image.uri, base64: image.base64 });
    } catch (error) {
      showError(
        'Image Error',
        error instanceof Error ? error.message : 'Failed to choose a room image',
      );
    }
  };

  const save = () => {
    if (!room || !hasChanges) return;
    const normalizedName = name.trim();
    const normalizedDescription = description.trim();
    const normalizedThemeColor = themeColor.trim();

    if (!normalizedName || normalizedName.length > 255) {
      showError('Update Error', 'Room name must be between 1 and 255 characters');
      return;
    }
    if (!/^#[0-9a-f]{6}$/i.test(normalizedThemeColor)) {
      showError('Update Error', 'Theme color must be a valid hex color such as #FF6B6B');
      return;
    }

    const changes: UpdateRoomPayload = {};
    if (normalizedName !== room.name) changes.name = normalizedName;
    if (normalizedDescription !== (room.description ?? '')) {
      changes.description = normalizedDescription || null;
    }
    if (privacy !== room.privacy) changes.privacy = privacy;
    if (normalizedThemeColor !== room.themeColor) changes.themeColor = normalizedThemeColor;
    if (roomImage) changes.roomImage = roomImage.base64;
    mutation.mutate(changes);
  };

  return {
    room,
    isLoading: roomQuery.isLoading,
    isError: roomQuery.isError,
    refetch: roomQuery.refetch,
    name,
    setName,
    description,
    setDescription,
    privacy,
    setPrivacy,
    themeColor,
    setThemeColor,
    roomImageUri: roomImage?.uri,
    chooseRoomImage,
    hasChanges,
    save,
    isPending: mutation.isPending,
  };
};
