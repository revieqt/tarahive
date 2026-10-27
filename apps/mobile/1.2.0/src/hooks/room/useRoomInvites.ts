import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useSession } from '@/context/SessionContext';
import { useSearchUser } from '@/hooks/user/useSearchUser';
import { inviteRoomMember, removeRoomInvite } from '@/services/roomService';
import { showError, showSuccess } from '@/services/toast.service';
import { RoomInvitePayload } from '@/types/roomTypes';
import { UserSearchResult } from '@/types/userTypes';
import { useGetRoomMembers } from './useGetRoomMembers';
import { useRoomMembershipActions } from './useRoomMembershipActions';

export const useRoomInvites = () => {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const roomId = Array.isArray(id) ? id[0] : id;
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const membersQuery = useGetRoomMembers();
  const membershipActions = useRoomMembershipActions();
  const searchQuery = useSearchUser(search);
  const members = membersQuery.members;
  const isAdmin = Boolean(members.some(
    (member) =>
      member.userId === session?.user?.id &&
      member.role === 'ADMIN' &&
      member.status === 'ACTIVE'
  ));

  const inviteMutation = useMutation({
    mutationFn: async (payload: RoomInvitePayload) => {
      const response = await inviteRoomMember(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to invite room member');
      }
      return response;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['room', roomId, 'members'] });
      setSearch('');
      showSuccess('Success', response.message || 'Room invitation sent');
    },
    onError: (error: Error) => showError('Invite Error', error.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (payload: RoomInvitePayload) => {
      const response = await removeRoomInvite(payload);
      if (!response.success) {
        throw new Error(response.message || 'Failed to remove room invitation');
      }
      return response;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['room', roomId, 'members'] });
      showSuccess('Success', response.message || 'Room invitation removed');
    },
    onError: (error: Error) => showError('Invite Error', error.message),
  });

  const availableUsers = useMemo(() => {
    const memberIds = new Set(members.map((member) => member.userId));
    return (searchQuery.data ?? []).filter((user) => !memberIds.has(user.id));
  }, [members, searchQuery.data]);

  const invite = (user: UserSearchResult) => {
    if (!roomId || !isAdmin) return;
    inviteMutation.mutate({ roomId, userId: user.id });
  };

  const cancelInvite = (userId: string) => {
    if (!roomId || !isAdmin) return;
    removeMutation.mutate({ roomId, userId });
  };

  return {
    members,
    isLoading: membersQuery.isLoading,
    isError: membersQuery.isError,
    refetch: membersQuery.refetch,
    isAdmin,
    search,
    setSearch,
    searchQuery,
    availableUsers,
    invite,
    isInviting: inviteMutation.isPending,
    cancelInvite,
    isRemovingInvite: removeMutation.isPending,
    currentUserId: session?.user?.id,
    approveJoinRequest: membershipActions.approveJoinRequest,
    isApproving: membershipActions.isApproving,
    cancelJoinRequest: membershipActions.cancelJoinRequest,
    isCancellingRequest: membershipActions.isCancellingRequest,
    acceptInvite: membershipActions.acceptInvite,
    isAcceptingInvite: membershipActions.isAcceptingInvite,
  };
};
