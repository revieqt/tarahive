import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import {
  acceptRoomInvite,
  approveRoomMembershipRequest,
  cancelRoomMembershipRequest,
  requestRoomMembership,
} from '@/services/roomService';
import { showError, showSuccess } from '@/services/toast.service';
import { RoomInviteResponse } from '@/types/roomTypes';

export const useRoomMembershipActions = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = Array.isArray(id) ? id[0] : id;
  const { session } = useSession();
  const queryClient = useQueryClient();

  const invalidateRoomMembershipQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['room', roomId] }),
      queryClient.invalidateQueries({ queryKey: ['room', roomId, 'members'] }),
      queryClient.invalidateQueries({ queryKey: ['user-rooms'] }),
    ]);
  };

  const mutationOptions = {
    onSuccess: async (response: RoomInviteResponse) => {
      await invalidateRoomMembershipQueries();
      showSuccess('Success', response.message);
    },
    onError: (error: Error) => showError('Room membership error', error.message),
  };

  const requestMutation = useMutation({
    mutationFn: requestRoomMembership,
    ...mutationOptions,
  });
  const cancelRequestMutation = useMutation({
    mutationFn: cancelRoomMembershipRequest,
    ...mutationOptions,
  });
  const approveMutation = useMutation({
    mutationFn: approveRoomMembershipRequest,
    ...mutationOptions,
  });
  const acceptInviteMutation = useMutation({
    mutationFn: acceptRoomInvite,
    ...mutationOptions,
  });

  return {
    requestJoin: () => {
      if (roomId) requestMutation.mutate({ roomId });
    },
    cancelJoinRequest: () => {
      if (roomId) cancelRequestMutation.mutate({ roomId });
    },
    approveJoinRequest: (userId: string) => {
      if (roomId) approveMutation.mutate({ roomId, userId });
    },
    acceptInvite: () => {
      if (roomId && session?.user?.id) {
        acceptInviteMutation.mutate({ roomId, userId: session.user.id });
      } else {
        showError('Room membership error', 'Your user session is not available');
      }
    },
    isRequesting: requestMutation.isPending,
    isCancellingRequest: cancelRequestMutation.isPending,
    isApproving: approveMutation.isPending,
    isAcceptingInvite: acceptInviteMutation.isPending,
  };
};
